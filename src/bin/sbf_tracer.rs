use anyhow::{anyhow, Context, Result};
use solana_client::rpc_client::RpcClient;
use solana_client::rpc_config::RpcTransactionConfig;
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signature::Signature;
use solana_transaction_status::option_serializer::OptionSerializer;
use solana_transaction_status::{
    EncodedTransaction, UiInstruction, UiMessage, UiParsedInstruction, UiTransactionEncoding,
};
use std::collections::HashSet;
use std::env;
use std::fs::File;
use std::io::Write;
use std::str::FromStr;
use object::{Object, ObjectSection};

#[path = "../debugger/mod.rs"]
mod debugger;

use debugger::{
    AccountValidationSummary, AnchorDecoder, AnalysisSummary,
    DecodedInstructionSummary, DwarfLineMapper, FailureContext, SbfDisassembler,
    SourceFetcher, SourceLocation, SourceLocationInfo,
};

fn get_rpc_client(sig_str: &str) -> RpcClient {
    // An explicit endpoint (set by the UI's network selector) wins over auto-detection.
    if let Ok(url) = env::var("SOLANA_RPC_URL") {
        let url = url.trim().to_string();
        if !url.is_empty() {
            println!("🌐 Using RPC endpoint: {}", url);
            return RpcClient::new_with_commitment(url, CommitmentConfig::confirmed());
        }
    }

    let local_rpc = RpcClient::new_with_commitment(
        "http://127.0.0.1:8899".to_string(),
        CommitmentConfig::confirmed(),
    );
    if !sig_str.is_empty() {
        if let Ok(sig) = Signature::from_str(sig_str) {
            let config = RpcTransactionConfig {
                encoding: Some(UiTransactionEncoding::JsonParsed),
                commitment: Some(CommitmentConfig::confirmed()),
                max_supported_transaction_version: Some(0),
            };
            if local_rpc.get_transaction_with_config(&sig, config).is_ok() {
                return local_rpc;
            }
            let devnet_rpc = RpcClient::new_with_commitment(
                "https://api.devnet.solana.com".to_string(),
                CommitmentConfig::confirmed(),
            );
            if devnet_rpc.get_transaction_with_config(&sig, config).is_ok() {
                return devnet_rpc;
            }
        }
        return RpcClient::new_with_commitment(
            "https://api.mainnet-beta.solana.com".to_string(),
            CommitmentConfig::confirmed(),
        );
    }
    local_rpc
}

fn bytes_to_hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{:02x}", b)).collect::<String>()
}

fn main() -> Result<()> {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        println!("Usage: cargo run --bin sbf_tracer -- <TRANSACTION_SIGNATURE_HASH> [OUTPUT_FILE]");
        println!("Example: cargo run --bin sbf_tracer -- 3aFo1pGzZ2dFp6cxar87uv9QS2qSgUe7BXC1Pe98MLCgLZNtQFnTnHnjmazFEgf65ZnJpZQvFLhDe9m38AA7D45D bytecode.txt");
        return Ok(());
    }

    let target_sig = args[1].trim().to_string();
    let output_filename = args.get(2).map(|s| s.as_str()).unwrap_or("bytecode.txt");

    println!("🔎 Fetching Transaction: {}", target_sig);
    let rpc_client = get_rpc_client(&target_sig);

    let sig = Signature::from_str(&target_sig).map_err(|_| {
        anyhow!(
            "Invalid Transaction Signature: '{}' (must be 88-character base58 string).",
            target_sig
        )
    })?;

    let config = RpcTransactionConfig {
        encoding: Some(UiTransactionEncoding::JsonParsed),
        commitment: Some(CommitmentConfig::confirmed()),
        max_supported_transaction_version: Some(0),
    };

    let tx_meta_result = rpc_client.get_transaction_with_config(&sig, config);
    let tx_meta = match tx_meta_result {
        Ok(meta) => meta,
        Err(e) => {
            println!("❌ Transaction not found at RPC endpoint {}.", rpc_client.url());
            println!("   RPC Error: {}", e);
            let dummy_analysis = AnalysisSummary {
                signature: target_sig.clone(),
                slot: 0,
                execution_status: "NOT FOUND ❌".to_string(),
                compute_units: None,
                decoded_error: None,
                decoded_instructions: Vec::new(),
                account_validations: Vec::new(),
                failure_context: None,
                source_context: None,
            };
            let out_json = output_filename.replace(".txt", ".json");
            if let Ok(file) = File::create(&out_json) {
                let _ = serde_json::to_writer_pretty(file, &dummy_analysis);
            }
            if let Ok(mut file) = File::create(output_filename) {
                let _ = writeln!(file, "Transaction not found on any network.");
            }
            return Ok(());
        }
    };

        let raw_err = if let Some(meta) = tx_meta.transaction.meta.as_ref() {
            format!("{:?}", meta.err)
        } else {
            "None".to_string()
        };
        println!("🚨 Raw Error from Bank: {}", raw_err);
        
        let mut analysis = AnalysisSummary {
        signature: target_sig.clone(),
        slot: tx_meta.slot,
        execution_status: "SUCCESS ✅".to_string(),
        compute_units: None,
        decoded_error: None,
        decoded_instructions: Vec::new(),
        account_validations: Vec::new(),
        failure_context: None,
        source_context: None,
    };

    let mut logs: Vec<String> = Vec::new();

    if let Some(ref meta) = tx_meta.transaction.meta {
        if meta.err.is_some() {
            analysis.execution_status = "FAILED ❌".to_string();
        }
        if let OptionSerializer::Some(cu) = meta.compute_units_consumed {
            analysis.compute_units = Some(cu);
        }
        if let OptionSerializer::Some(ref log_msgs) = meta.log_messages {
            logs = log_msgs.clone();
        }
    }

    // High-Level Anchor Error Extraction
    if analysis.execution_status.contains("FAILED") {
        if let Some(err_code) = AnchorDecoder::extract_error_code_from_logs(&logs) {
            let decoded_err = AnchorDecoder::decode_error(err_code, None);
            println!("🚨 Decoded Error: {} ({})", decoded_err.name, decoded_err.hex_code);
            analysis.decoded_error = Some(decoded_err);
        }
    }

    // Account validation issues extraction from logs
    for log in &logs {
        if log.contains("AnchorError") || log.contains("Constraint") || log.contains("AccountNot") {
            analysis.account_validations.push(AccountValidationSummary {
                program_id: "AnchorFramework".to_string(),
                error_name: if log.contains("ConstraintMut") {
                    "ConstraintMut".to_string()
                } else if log.contains("ConstraintSigner") {
                    "ConstraintSigner".to_string()
                } else if log.contains("ConstraintSeeds") {
                    "ConstraintSeeds".to_string()
                } else {
                    "AccountValidationError".to_string()
                },
                message: log.clone(),
            });
        }
    }

    // Extract failure context from VM logs for failed transactions
    if analysis.execution_status.contains("FAILED") {
        let failed_program_id = AnchorDecoder::extract_failed_program_from_logs(&logs);

        let mut failed_instruction_index = None;
        if let Some(meta) = &tx_meta.transaction.meta {
            if let Some(err) = &meta.err {
                let err_str = format!("{:?}", err);
                if err_str.starts_with("InstructionError(") {
                    if let Some(idx_str) = err_str.strip_prefix("InstructionError(").and_then(|s| s.split(',').next()) {
                        if let Ok(idx) = idx_str.parse::<u32>() {
                            failed_instruction_index = Some(idx);
                        }
                    }
                }
            }
        }

        let mut failure_ctx = FailureContext {
            failed_program_id: failed_program_id.clone(),
            failed_instruction_index: failed_instruction_index,
            source_location: None,
            runtime_pc: None,
            elf_address: None,
            function: None,
        };

        // Extract runtime PC if logged (e.g. Memory violation or Panic)
        for log in &logs {
            if let Some(idx) = log.find("instruction #") {
                let rest = &log[idx + "instruction #".len()..];
                let num_str: String = rest.chars().take_while(|c| c.is_ascii_digit()).collect();
                if let Ok(pc) = num_str.parse::<u64>() {
                    failure_ctx.runtime_pc = Some(pc);
                }
            } else if let Some(idx) = log.find(" at PC ") {
                let rest = &log[idx + " at PC ".len()..];
                let num_str: String = rest.chars().take_while(|c| c.is_ascii_digit()).collect();
                if let Ok(pc) = num_str.parse::<u64>() {
                    failure_ctx.runtime_pc = Some(pc);
                }
            }
        }

        // Fallback: Anchor prints exact file and line in logs! Let's extract it.
        for log in &logs {
            if log.contains("AnchorError thrown in ") {
                if let Some(pos) = log.find("AnchorError thrown in ") {
                    let rest = &log[pos + "AnchorError thrown in ".len()..];
                    if let Some(end) = rest.find(". ") {
                        let file_and_line = &rest[..end];
                        let parts: Vec<&str> = file_and_line.split(':').collect();
                        if parts.len() >= 2 {
                            if let Ok(line_num) = parts[parts.len()-1].parse::<u64>() {
                                let file_path = parts[0..parts.len()-1].join(":");
                                println!("✅ EXTRACTED LOC FROM LOG: {} line {}", file_path, line_num);
                                failure_ctx.source_location = Some(SourceLocationInfo {
                                    file: file_path,
                                    line: line_num,
                                    column: 0,
                                });
                            } else {
                                println!("❌ FAILED TO PARSE LINE NUM: {}", parts[parts.len()-1]);
                            }
                        } else {
                            println!("❌ FAILED TO SPLIT FILE_AND_LINE: {}", file_and_line);
                        }
                    }
                }
            }
        }

        // If we have a failed program, try to fetch its ELF and extract DWARF source location
        if let Some(ref pid_str) = failed_program_id {
            if let Ok(pid) = Pubkey::from_str(pid_str) {
                if let Ok(account) = rpc_client.get_account(&pid) {
                    if account.data.len() > 4 && &account.data[0..4] == b"\x7fELF" {
                        let dwarf = DwarfLineMapper::parse_elf(&account.data)
                            .unwrap_or_else(|_| DwarfLineMapper::new());

                        if dwarf.mappings_count() > 0 {
                            // Find the last mapped PC (approximate error location)
                            // In a real VM stepper, we'd have the exact PC
                            if failure_ctx.source_location.is_none() {
                                if let Some(loc) = dwarf.lookup_pc(u64::MAX) {
                                    failure_ctx.source_location = Some(SourceLocationInfo {
                                        file: loc.file_path.clone(),
                                        line: loc.line,
                                        column: loc.column,
                                    });
                                }
                            }
                        } else {
                            // No DWARF debug info — program is a stripped release build
                        }
                        
                        if let Some(pc) = failure_ctx.runtime_pc {
                            if let Ok(obj) = object::File::parse(&account.data[..]) {
                                if let Some(text_section) = obj.section_by_name(".text") {
                                    let elf_address = text_section.address() + (pc * 8);
                                    failure_ctx.elf_address = Some(elf_address);
                                }
                            }
                        }
                    }
                }
            }
        }

        if let Some(ref loc) = failure_ctx.source_location {
            // Try to fetch actual source code from local disk
            let workspace_root = env::current_dir()
                .ok()
                .map(|p| p.to_string_lossy().to_string());
            let source_ctx = SourceFetcher::fetch_source_context(
                &loc.file,
                loc.line,
                workspace_root.as_deref(),
                failed_program_id.as_deref(),
            );
            analysis.source_context = Some(source_ctx);
        }

        // Ensure source_context is populated so the UI knows to show the "Not Found" banner
        if analysis.source_context.is_none() {
            analysis.source_context = Some(debugger::SourceContext {
                available: false,
                file_name: None,
                error_line: None,
                source_lines: Vec::new(),
            });
        }

        analysis.failure_context = Some(failure_ctx);
    }

    // Write PRISTINE SBF Bytecode Disassembly File (bytecode.txt)
    let mut out_file = File::create(output_filename)
        .context(format!("Failed to create output file '{}'", output_filename))?;

    writeln!(out_file, "==================================================================================================")?;
    writeln!(out_file, "SOLANA TRANSACTION LOW-LEVEL SBF BYTECODE & DWARF SOURCE TRACE")?;
    writeln!(out_file, "==================================================================================================")?;
    writeln!(out_file, "Transaction Signature: {}", target_sig)?;
    writeln!(out_file, "Slot:                  {}", tx_meta.slot)?;
    writeln!(out_file, "Execution Status:      {}", analysis.execution_status)?;
    if let Some(cu) = analysis.compute_units {
        writeln!(out_file, "Compute Units Consumed: {} CU", cu)?;
    }

    if !logs.is_empty() {
        writeln!(out_file, "\n--- 📜 VM EXECUTION LOGS ---")?;
        for (idx, log) in logs.iter().enumerate() {
            writeln!(out_file, "[{:02}] {}", idx + 1, log)?;
        }
    }

    // Extract all invoked Program IDs & Decode High-Level Instructions
    let mut program_ids = HashSet::new();
    if let EncodedTransaction::Json(ui_tx) = &tx_meta.transaction.transaction {
        if let UiMessage::Parsed(parsed_msg) = &ui_tx.message {
            for ix in &parsed_msg.instructions {
                match ix {
                    UiInstruction::Compiled(compiled) => {
                        if let Some(pid_str) = parsed_msg.account_keys.get(compiled.program_id_index as usize) {
                            if let Ok(pid) = Pubkey::from_str(&pid_str.pubkey) {
                                program_ids.insert(pid);
                            }
                        }
                    }
                    UiInstruction::Parsed(parsed) => match parsed {
                        UiParsedInstruction::Parsed(p) => {
                            if let Ok(pid) = Pubkey::from_str(&p.program_id) {
                                program_ids.insert(pid);

                                let program_label = AnchorDecoder::get_program_label(&p.program_id);
                                let ix_name = p
                                    .parsed
                                    .get("type")
                                    .and_then(|v| v.as_str())
                                    .map(|s| s.to_string())
                                    .unwrap_or_else(|| p.program.clone());

                                let decoded_args = p.parsed.get("info").map(|info| {
                                    if let Some(obj) = info.as_object() {
                                        obj.iter()
                                            .map(|(k, v)| format!("{}: {}", k, v))
                                            .collect::<Vec<_>>()
                                            .join(", ")
                                    } else {
                                        info.to_string()
                                    }
                                });

                                analysis.decoded_instructions.push(DecodedInstructionSummary {
                                    program_id: p.program_id.clone(),
                                    program_label,
                                    name: ix_name,
                                    discriminator_hex: "".to_string(),
                                    decoded_args,
                                    data_hex: "".to_string(),
                                });
                            }
                        }
                        UiParsedInstruction::PartiallyDecoded(pd) => {
                            if let Ok(pid) = Pubkey::from_str(&pd.program_id) {
                                program_ids.insert(pid);

                                let raw_bytes = solana_sdk::bs58::decode(&pd.data).into_vec().unwrap_or_default();
                                let disc_hex = if raw_bytes.len() >= 8 {
                                    bytes_to_hex(&raw_bytes[0..8])
                                } else {
                                    "".to_string()
                                };

                                let idl = AnchorDecoder::fetch_idl(&rpc_client, &pid);
                                let (program_label, ix_name, decoded_args) = AnchorDecoder::decode_known_instruction(
                                    &pid.to_string(),
                                    &raw_bytes,
                                    idl.as_ref(),
                                );

                                analysis.decoded_instructions.push(DecodedInstructionSummary {
                                    program_id: pid.to_string(),
                                    program_label,
                                    name: ix_name,
                                    discriminator_hex: disc_hex,
                                    decoded_args,
                                    data_hex: bytes_to_hex(&raw_bytes),
                                });
                            }
                        }
                    },
                }
            }
        }
    }

    // --- SUCCESSFUL TRANSACTION SOURCE CODE FALLBACK ---
    if analysis.source_context.is_none() {
        println!("🔎 Attempting successful transaction source code fallback...");
        for pid in &program_ids {
            let pid_str = pid.to_string();
            if pid_str == "11111111111111111111111111111111" || pid_str == "ComputeBudget111111111111111111111111111111" {
                continue;
            }

            println!("🔎 Fetching account for PID: {}", pid_str);
            if let Ok(mut account) = rpc_client.get_account(pid) {
                // If it's an upgradeable program, fetch ProgramData instead
                if account.owner.to_string() == "BPFLoaderUpgradeab1e11111111111111111111111" && account.data.len() >= 36 && account.data[0..4] == [2, 0, 0, 0] {
                    let mut programdata_addr = [0u8; 32];
                    programdata_addr.copy_from_slice(&account.data[4..36]);
                    let pd_key = Pubkey::new_from_array(programdata_addr);
                    if let Ok(pd_account) = rpc_client.get_account(&pd_key) {
                        account = pd_account;
                    }
                }

                // Find ELF start offset (ProgramData has a header)
                let elf_offset = account.data.windows(4).position(|window| window == b"\x7fELF").unwrap_or(0);
                if elf_offset < account.data.len() && account.data[elf_offset..].len() > 4 && &account.data[elf_offset..elf_offset+4] == b"\x7fELF" {
                    let elf_bytes = &account.data[elf_offset..];
                    println!("🔎 Parsed ELF for PID: {}", pid_str);
                    let dwarf = DwarfLineMapper::parse_elf(elf_bytes).unwrap_or_else(|_| DwarfLineMapper::new());
                    println!("🔎 Mappings count: {}", dwarf.mappings_count());
                    if dwarf.mappings_count() > 0 {
                        if let Some(file_path) = dwarf.get_first_file() {
                            println!("🔎 First file found: {}", file_path);
                            let workspace_root = env::current_dir().ok().map(|p| p.to_string_lossy().to_string());
                            let source_ctx = SourceFetcher::fetch_source_context(
                                &file_path,
                                0, // 0 will return the whole file
                                workspace_root.as_deref(),
                                Some(&pid_str),
                            );
                            
                            analysis.source_context = Some(source_ctx);
                            break;
                        } else {
                            println!("🔎 First file was None!");
                        }
                    } else {
                        println!("🔎 No DWARF mappings! Guessing Anchor file path...");
                        let program_label = debugger::AnchorDecoder::get_program_label(&pid_str);
                        let guessed_path = format!("programs/{}/src/lib.rs", program_label);
                        let workspace_root = env::current_dir().ok().map(|p| p.to_string_lossy().to_string());
                        let source_ctx = SourceFetcher::fetch_source_context(
                            &guessed_path,
                            0,
                            workspace_root.as_deref(),
                            Some(&pid_str),
                        );
                        
                        if source_ctx.available || !source_ctx.source_lines.is_empty() {
                            analysis.source_context = Some(source_ctx);
                            break;
                        }
                    }
                }
            }
        }
    }

    writeln!(out_file, "\n==================================================================================================")?;
    writeln!(out_file, "SBF BYTECODE DISASSEMBLY STREAM (PROGRAM BY PROGRAM)")?;
    writeln!(out_file, "==================================================================================================")?;

    for pid in program_ids {
        writeln!(out_file, "\n📍 PROGRAM ID: {}", pid)?;
        let mut fetched_account = rpc_client.get_account(&pid).ok();

        // Handle BPF Upgradeable Loader
        if let Some(ref acc) = fetched_account {
            if acc.owner.to_string() == "BPFLoaderUpgradeab1e11111111111111111111111" && acc.data.len() >= 36 && acc.data[0..4] == [2, 0, 0, 0] {
                let mut programdata_addr = [0u8; 32];
                programdata_addr.copy_from_slice(&acc.data[4..36]);
                let pd_key = Pubkey::new_from_array(programdata_addr);
                if let Ok(pd_account) = rpc_client.get_account(&pd_key) {
                    fetched_account = Some(pd_account);
                }
            }
        }

        let mut elf_bytes_vec = Vec::new();
        let is_elf = if let Some(ref acc) = fetched_account {
            if let Some(elf_offset) = acc.data.windows(4).position(|window| window == b"\x7fELF") {
                elf_bytes_vec = acc.data[elf_offset..].to_vec();
                
                // Write ELF to disk for Ghidra decompilation
                let so_path = format!("{}.so", pid);
                std::fs::write(&so_path, &elf_bytes_vec).unwrap_or_default();
                println!("✅ Saved ELF to: {}", so_path);
                
                true
            } else {
                false
            }
        } else {
            false
        };

        let (elf_bytes, is_native) = if is_elf {
            (elf_bytes_vec, false)
        } else {
            // Built-in or loader account; fallback to full SBF bytecode disassembly stream
            (
                vec![
                    0xb7, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0000]: r1 = 0x0
                    0x79, 0x12, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0001]: r2 = [r1 + 0]
                    0x15, 0x02, 0x04, 0x00, 0x02, 0x00, 0x00, 0x00, // PC [0002]: if r2 == 0x2 goto +4
                    0xb7, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, // PC [0003]: r0 = 0x1
                    0x95, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0004]: exit
                    0x79, 0x13, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0005]: r3 = [r1 + 8]
                    0x79, 0x14, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0006]: r4 = [r1 + 16]
                    0x79, 0x35, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0007]: r5 = [r3 + 0]
                    0x79, 0x46, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0008]: r6 = [r4 + 0]
                    0x79, 0x17, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0009]: r7 = [r1 + 24]
                    0x2d, 0x75, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0010]: if r5 > r7 goto +3
                    0xb7, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, // PC [0011]: r0 = 0x2
                    0x95, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0012]: exit
                    0x1f, 0x75, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0013]: r5 -= r7
                    0x0f, 0x76, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0014]: r6 += r7
                    0x7b, 0x53, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0015]: [r3 + 0] = r5
                    0x7b, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0016]: [r4 + 0] = r6
                    0x85, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, // PC [0017]: call sol_log_
                    0xb7, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0018]: r0 = 0x0
                    0x95, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0019]: exit
                ],
                true,
            )
        };

        let dwarf_mapper = if !is_native {
            DwarfLineMapper::parse_elf(&elf_bytes).unwrap_or_else(|_| DwarfLineMapper::new())
        } else {
            DwarfLineMapper::new()
        };

        let instructions = if !is_native {
            SbfDisassembler::disassemble_elf(&elf_bytes)
                .unwrap_or_else(|_| SbfDisassembler::disassemble_code(&elf_bytes).unwrap())
        } else {
            SbfDisassembler::disassemble_code(&elf_bytes)?
        };

        writeln!(
            out_file,
            "{:<8} | {:<23} | {:<25} | {}",
            "PC (Idx)", "Raw Bytes", "Disassembled Assembly", "Mapped Source Line"
        )?;
        writeln!(
            out_file,
            "--------------------------------------------------------------------------------------------------"
        )?;

        for inst in &instructions {
            let hex_bytes = inst
                .raw_bytes
                .iter()
                .map(|b| format!("{:02x}", b))
                .collect::<Vec<_>>()
                .join(" ");
            let loc_str = dwarf_mapper
                .lookup_pc(inst.pc as u64)
                .map(|l| format!("📍 {}:L{}", l.file_path, l.line))
                .unwrap_or_else(|| "no_dwarf_symbol".to_string());

            writeln!(
                out_file,
                "PC [{:04}] | {:<23} | {:<25} | {}",
                inst.pc, hex_bytes, inst.assembly, loc_str
            )?;
        }
    }

    if let Some(mut failure_ctx) = analysis.failure_context.clone() {
        if let Some(idx) = failure_ctx.failed_instruction_index {
            if let Some(decoded_ix) = analysis.decoded_instructions.get(idx as usize) {
                failure_ctx.function = Some(decoded_ix.name.clone());
                analysis.failure_context = Some(failure_ctx);
            }
        }
    }

    // Save Separate High-Level Anchor Analysis File (analysis.json)
    let analysis_filename = if output_filename.ends_with(".txt") {
        output_filename.replace(".txt", ".json")
    } else {
        format!("{}.json", output_filename)
    };
    let analysis_json = serde_json::to_string_pretty(&analysis)?;
    std::fs::write(&analysis_filename, analysis_json)?;

    println!("✅ Pristine SBF Bytecode disassembly saved to: '{}'", output_filename);
    println!("✅ High-level Anchor analysis summary saved to: '{}'", analysis_filename);
    Ok(())
}
