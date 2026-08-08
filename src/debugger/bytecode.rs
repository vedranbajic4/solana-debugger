use anyhow::{anyhow, Result};
use object::{Object, ObjectSection};
use std::fmt;

/// Represents a single disassembled Solana Bytecode Format (SBF / eBPF) instruction.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DisassembledInstruction {
    /// Program Counter (PC) / Instruction Index (0-based)
    pub pc: usize,
    /// Byte offset in the `.text` section (PC * 8 bytes)
    pub byte_offset: usize,
    /// Raw 8-byte instruction binary
    pub raw_bytes: [u8; 8],
    /// Human-readable SBF assembly string (e.g. "r1 += 0x5", "call 0x12", "exit")
    pub assembly: String,
    /// Opcode mnemonic (e.g. "ADD64", "CALL", "EXIT", "LDXDW")
    pub mnemonic: String,
    /// Destination register (0..10)
    pub dst_reg: u8,
    /// Source register (0..10)
    pub src_reg: u8,
    /// 16-bit offset
    pub offset: i16,
    /// 32-bit immediate value
    pub imm: i32,
}

impl fmt::Display for DisassembledInstruction {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "PC [{:04}] (+0x{:04x}) | {:02x} {:02x} {:02x} {:02x} {:02x} {:02x} {:02x} {:02x} | {:<10} {}",
            self.pc,
            self.byte_offset,
            self.raw_bytes[0],
            self.raw_bytes[1],
            self.raw_bytes[2],
            self.raw_bytes[3],
            self.raw_bytes[4],
            self.raw_bytes[5],
            self.raw_bytes[6],
            self.raw_bytes[7],
            self.mnemonic,
            self.assembly
        )
    }
}

/// SBF / eBPF Disassembler Engine
pub struct SbfDisassembler;

impl SbfDisassembler {
    /// Extract `.text` section from SBF ELF binary data and disassemble all instructions.
    pub fn disassemble_elf(elf_data: &[u8]) -> Result<Vec<DisassembledInstruction>> {
        if elf_data.is_empty() {
            return Ok(Vec::new());
        }

        let obj_file = object::File::parse(elf_data)
            .map_err(|e| anyhow!("Failed to parse ELF binary: {}", e))?;

        let text_section = obj_file
            .section_by_name(".text")
            .ok_or_else(|| anyhow!("ELF binary does not contain a `.text` section"))?;

        let code_bytes = text_section
            .data()
            .map_err(|e| anyhow!("Failed to read `.text` section data: {}", e))?;

        Self::disassemble_code(code_bytes)
    }

    /// Disassemble raw 8-byte SBF code buffer into structured instructions.
    pub fn disassemble_code(code_bytes: &[u8]) -> Result<Vec<DisassembledInstruction>> {
        if code_bytes.len() % 8 != 0 {
            println!("⚠️ Warning: `.text` code size ({} bytes) is not aligned to 8-byte instruction boundary.", code_bytes.len());
        }

        let mut instructions = Vec::new();
        let mut pc = 0;
        let mut i = 0;

        while i + 8 <= code_bytes.len() {
            let chunk: [u8; 8] = code_bytes[i..i + 8].try_into().unwrap();
            let byte_offset = i;

            let opcode = chunk[0];
            let regs = chunk[1];
            let dst_reg = regs & 0x0f;
            let src_reg = (regs >> 4) & 0x0f;
            let offset = i16::from_le_bytes([chunk[2], chunk[3]]);
            let imm = i32::from_le_bytes([chunk[4], chunk[5], chunk[6], chunk[7]]);

            let (mnemonic, assembly) = Self::decode_instruction(opcode, dst_reg, src_reg, offset, imm);

            instructions.push(DisassembledInstruction {
                pc,
                byte_offset,
                raw_bytes: chunk,
                assembly,
                mnemonic,
                dst_reg,
                src_reg,
                offset,
                imm,
            });

            // If it's a 64-bit immediate load (LD_DW_IMM opcode 0x18), it spans 2 instruction slots (16 bytes)
            if opcode == 0x18 && i + 16 <= code_bytes.len() {
                i += 8;
                pc += 1;
                let next_chunk: [u8; 8] = code_bytes[i..i + 8].try_into().unwrap();
                let next_imm = i32::from_le_bytes([next_chunk[4], next_chunk[5], next_chunk[6], next_chunk[7]]);
                let full_imm: u64 = ((next_imm as u64) << 32) | (imm as u32 as u64);

                if let Some(last_inst) = instructions.last_mut() {
                    last_inst.assembly = format!("r{} = 0x{:x}", dst_reg, full_imm);
                }
            }

            i += 8;
            pc += 1;
        }

        Ok(instructions)
    }

    /// Decode eBPF/SBF opcode into mnemonic and human-readable assembly notation.
    fn decode_instruction(
        opcode: u8,
        dst: u8,
        src: u8,
        offset: i16,
        imm: i32,
    ) -> (String, String) {
        let (m, a) = match opcode {
            // ALU 64-bit operations
            0x07 => ("ADD64", format!("r{} += 0x{:x}", dst, imm)),
            0x0f => ("ADD64", format!("r{} += r{}", dst, src)),
            0x17 => ("SUB64", format!("r{} -= 0x{:x}", dst, imm)),
            0x1f => ("SUB64", format!("r{} -= r{}", dst, src)),
            0x27 => ("MUL64", format!("r{} *= 0x{:x}", dst, imm)),
            0x2f => ("MUL64", format!("r{} *= r{}", dst, src)),
            0x37 => ("DIV64", format!("r{} /= 0x{:x}", dst, imm)),
            0x3f => ("DIV64", format!("r{} /= r{}", dst, src)),
            0xbf => ("MOV64", format!("r{} = r{}", dst, src)),
            0xb7 => ("MOV64", format!("r{} = 0x{:x}", dst, imm)),

            // Memory loads and stores
            0x61 => ("LDXW", format!("r{} = [r{} + {}]", dst, src, offset)),
            0x62 => ("STW", format!("[r{} + {}] = 0x{:x}", dst, offset, imm)),
            0x63 => ("STXW", format!("[r{} + {}] = r{}", dst, offset, src)),
            0x79 => ("LDXDW", format!("r{} = [r{} + {}]", dst, src, offset)),
            0x7a => ("STDW", format!("[r{} + {}] = 0x{:x}", dst, offset, imm)),
            0x7b => ("STXDW", format!("[r{} + {}] = r{}", dst, offset, src)),
            0x18 => ("LDDW", format!("r{} = 0x{:x}", dst, imm)),

            // Branching and Jumps
            0x05 => ("JA", format!("jmp +{}", offset)),
            0x15 => ("JEQ", format!("if r{} == 0x{:x} goto +{}", dst, imm, offset)),
            0x1d => ("JEQ", format!("if r{} == r{} goto +{}", dst, src, offset)),
            0x25 => ("JGT", format!("if r{} > 0x{:x} goto +{}", dst, imm, offset)),
            0x2d => ("JGT", format!("if r{} > r{} goto +{}", dst, src, offset)),
            0x35 => ("JGE", format!("if r{} >= 0x{:x} goto +{}", dst, imm, offset)),
            0x3d => ("JGE", format!("if r{} >= r{} goto +{}", dst, src, offset)),
            0x55 => ("JNE", format!("if r{} != 0x{:x} goto +{}", dst, imm, offset)),
            0x5d => ("JNE", format!("if r{} != r{} goto +{}", dst, src, offset)),

            // Function calls and exits
            0x85 => ("CALL", format!("call helper/func 0x{:x}", imm)),
            0x95 => ("EXIT", "exit / return".to_string()),

            // Default fallback
            _ => (
                "OP_UNKNOWN",
                format!("opcode 0x{:02x} dst=r{} src=r{} off={} imm=0x{:x}", opcode, dst, src, offset, imm),
            ),
        };
        (m.to_string(), a)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_disassemble_sample_sbf_instructions() {
        let code_bytes: Vec<u8> = vec![
            0xb7, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0]: r1 = 0
            0x79, 0x12, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [1]: r2 = [r1 + 16]
            0x07, 0x02, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, // PC [2]: r2 += 100
            0x17, 0x02, 0x00, 0x00, 0x32, 0x00, 0x00, 0x00, // PC [3]: r2 -= 50
            0x85, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, // PC [4]: call 0x1
            0x95, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [5]: exit
        ];

        let insts = SbfDisassembler::disassemble_code(&code_bytes).unwrap();
        assert_eq!(insts.len(), 6);

        // PC 0 check
        assert_eq!(insts[0].pc, 0);
        assert_eq!(insts[0].byte_offset, 0);
        assert_eq!(insts[0].mnemonic, "MOV64");
        assert_eq!(insts[0].assembly, "r1 = 0x0");

        // PC 1 check
        assert_eq!(insts[1].pc, 1);
        assert_eq!(insts[1].byte_offset, 8);
        assert_eq!(insts[1].mnemonic, "LDXDW");
        assert_eq!(insts[1].dst_reg, 2);
        assert_eq!(insts[1].src_reg, 1);
        assert_eq!(insts[1].offset, 16);
        assert_eq!(insts[1].assembly, "r2 = [r1 + 16]");

        // PC 4 check (Call)
        assert_eq!(insts[4].pc, 4);
        assert_eq!(insts[4].mnemonic, "CALL");
        assert_eq!(insts[4].imm, 1);

        // PC 5 check (Exit)
        assert_eq!(insts[5].pc, 5);
        assert_eq!(insts[5].mnemonic, "EXIT");
        assert_eq!(insts[5].assembly, "exit / return");
    }

    #[test]
    fn test_disassemble_64bit_imm_load() {
        // LDDW opcode 0x18 spans 16 bytes (2 PC slots)
        let code_bytes: Vec<u8> = vec![
            0x18, 0x01, 0x00, 0x00, 0xef, 0xcd, 0xab, 0x89, // slot 1: lower 32 bits
            0x00, 0x00, 0x00, 0x00, 0x67, 0x45, 0x23, 0x01, // slot 2: upper 32 bits
        ];

        let insts = SbfDisassembler::disassemble_code(&code_bytes).unwrap();
        assert_eq!(insts.len(), 1);
        assert_eq!(insts[0].mnemonic, "LDDW");
        assert_eq!(insts[0].dst_reg, 1);
        assert_eq!(insts[0].assembly, "r1 = 0x123456789abcdef");
    }
}
