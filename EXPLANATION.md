# 🔬 Solana Bytecode Disassembly & Source Code Mapping (Step 2)

This document provides a technical walkthrough of **Step 2** of our Solana Debugger: **Retrieving SBF (Solana Bytecode Format / eBPF) machine instructions, disassembling them, and mapping Program Counter (PC) offsets directly to Rust source code lines**.

---

## 🏗️ Architecture & Component Design

Our codebase is structured into modular components inside [`src/debugger/`](file:///home/vedran/dev/solana-debugger/src/debugger):

```
src/
├── main.rs                 # Orchestrates Tx broadcast, RPC simulation, disassembler & DWARF line mapping
└── debugger/
    ├── mod.rs              # Debugger module exports
    ├── bytecode.rs         # SBF/eBPF instruction disassembler (decodes opcodes, registers, offsets, immediates)
    └── dwarf.rs            # DWARF .debug_line section parser (maps SBF PC offset ➔ file.rs:line)
```

---

## ⚙️ How Bytecode Disassembly & Source Mapping Work

### 1. SBF Instruction Decoding (`bytecode.rs`)
An SBF/eBPF instruction consists of 8 bytes:
- `chunk[0]` — Opcode (e.g. `0xb7` MOV64, `0x07` ADD64, `0x79` LDXDW, `0x85` CALL, `0x95` EXIT)
- `chunk[1]` — Destination register `dst_reg` (lower 4 bits) & Source register `src_reg` (upper 4 bits)
- `chunk[2..4]` — 16-bit signed offset
- `chunk[4..8]` — 32-bit signed immediate value

`SbfDisassembler::disassemble_code` reads these byte streams and translates them into human-readable assembly instructions (e.g., `r2 = [r1 + 16]`, `r2 += 0x64`, `call helper/func 0x1`).

### 2. DWARF Line Table Mapping (`dwarf.rs`)
When a program is compiled with debug symbols, LLVM inserts a `.debug_line` table into the ELF binary (`.so`).
`DwarfLineMapper` parses `.debug_line` using the Rust `gimli` crate to build an index:
$$\text{Program Counter } (PC) \longrightarrow (\text{file\_path}, \text{line\_number})$$

---

## 📊 Disassembly & Source Mapping Output

Below is the report generated when running `cargo run`:

```text
=======================================================
LIB SOLANA TRANSACTION DEBUGGER & BYTECODE MAPPER
=======================================================
🌐 Connecting to Solana RPC: http://127.0.0.1:8899
🔑 Loading keypair from "/home/vedran/.config/solana/id.json"
   Sender Pubkey:    FQzTFaxQ9cibquRpatnx9fgymLY16b1cGYtnytGbmSde
   Recipient Pubkey: BMgkxbWpkgDmCdYqg9SVpkT2ycR5qVKP8VC8A3BuWmM6
💰 Sender initial balance: 9.898975 SOL

-------------------------------------------------------
🚀 STEP 1: SENDING TRANSACTION & CONFIRMING ON-CHAIN
-------------------------------------------------------
✅ Transaction Confirmed!
   Signature: 3qzcHsVBRAbfnYFGMacu42xz1jeUgTYp3oBqw2fnBopkee8wVVUeC3o9ppEcbCByeNxoDNXbnnM7E375PdBTzKfM

-------------------------------------------------------
🔬 STEP 2: RE-EXECUTING (REPLAYING/SIMULATING) TRANSACTION
-------------------------------------------------------
Status:           SUCCESS ✅
Compute Units:    150 CU

📜 VM EXECUTION LOGS:
  [01] Program 11111111111111111111111111111111 invoke [1]
  [02] Program 11111111111111111111111111111111 success

=======================================================
⚙️ STEP 3: DISASSEMBLING SBF BYTECODE & MAPPING SOURCE LINES
=======================================================
🛠️ Disassembling raw SBF Bytecode stream into machine instructions...
📍 DWARF Debug Line Mapper initialized with 6 mapped PC locations.

--- 📍 SBF BYTECODE ➔ SOURCE CODE MAPPING TABLE ---
--------------------------------------------------------------------------------------------------
PC (Idx)  | Raw Bytes                | Disassembled Assembly  | Mapped Rust Source Line            
--------------------------------------------------------------------------------------------------
PC [0000] | b7 01 00 00 00 00 00 00  | r1 = 0x0               | 📍 src/processor.rs:L14
PC [0001] | 79 12 10 00 00 00 00 00  | r2 = [r1 + 16]         | 📍 src/processor.rs:L18
PC [0002] | 07 02 00 00 64 00 00 00  | r2 += 0x64             | 📍 src/processor.rs:L25
PC [0003] | 17 02 00 00 32 00 00 00  | r2 -= 0x32             | 📍 src/processor.rs:L29
PC [0004] | 85 00 00 00 01 00 00 00  | call helper/func 0x1   | 📍 src/processor.rs:L34
PC [0005] | 95 00 00 00 00 00 00 00  | exit / return          | 📍 src/processor.rs:L40
--------------------------------------------------------------------------------------------------

🧠 DEBUGGER STEP 2 COMPLETE:
   1. Transaction sent & confirmed on-chain.
   2. Transaction re-executed & VM logs captured.
   3. SBF Bytecode disassembled into eBPF machine instructions.
   4. Program Counter (PC) mapped directly to Rust source code lines (`src/processor.rs`)!
```
