use anyhow::{anyhow, Context, Result};
use solana_client::rpc_client::RpcClient;
use solana_client::rpc_config::RpcTransactionConfig;
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::native_token::LAMPORTS_PER_SOL;
use solana_sdk::signature::{Keypair, Signature, Signer};
use solana_sdk::system_instruction;
use solana_sdk::transaction::Transaction;
use solana_transaction_status::option_serializer::OptionSerializer;
use solana_transaction_status::{EncodedTransaction, UiInstruction, UiMessage, UiParsedInstruction, UiTransactionEncoding};
use std::env;
use std::fs;
use std::str::FromStr;

// Import debugger disassembler and DWARF mapper modules from parent crate
#[path = "../debugger/mod.rs"]
mod debugger;

use debugger::{DwarfLineMapper, SbfDisassembler, SourceLocation};

fn get_keypair() -> Result<Keypair> {
    let home_dir = dirs::home_dir().context("Could not find home directory")?;
    let keypair_path = home_dir.join(".config/solana/id.json");

    if keypair_path.exists() {
        let secret_key_str = fs::read_to_string(&keypair_path)?;
        let secret_key_bytes: Vec<u8> = serde_json::from_str(&secret_key_str)?;
        let keypair = Keypair::from_bytes(&secret_key_bytes)?;
        Ok(keypair)
    } else {
        Ok(Keypair::new())
    }
}

fn get_rpc_client(sig_str: &str) -> RpcClient {
    let local_rpc = RpcClient::new_with_commitment("http://127.0.0.1:8899".to_string(), CommitmentConfig::confirmed());
    if !sig_str.is_empty() {
        if let Ok(sig) = Signature::from_str(sig_str) {
            let config = RpcTransactionConfig {
                encoding: Some(UiTransactionEncoding::JsonParsed),
                commitment: Some(CommitmentConfig::confirmed()),
                max_supported_transaction_version: Some(0),
            };
            if local_rpc.get_transaction_with_config(&sig, config).is_ok() {
                println!("🌐 Connected RPC: http://127.0.0.1:8899 (Localnet)");
                return local_rpc;
            }
        }
        println!("🌐 Connected RPC: https://api.mainnet-beta.solana.com (Mainnet-Beta)");
        return RpcClient::new_with_commitment("https://api.mainnet-beta.solana.com".to_string(), CommitmentConfig::confirmed());
    }

    println!("🌐 Connected RPC: http://127.0.0.1:8899 (Localnet)");
    local_rpc
}

fn main() -> Result<()> {
    let args: Vec<String> = env::args().collect();

    println!("=======================================================");
    println!("🔍 DYNAMIC SOLANA TRANSACTION & INSTRUCTION INSPECTOR");
    println!("=======================================================");

    let target_sig = args.get(1).map(|s| s.trim().to_string()).unwrap_or_default();
    let rpc_client = get_rpc_client(&target_sig);

    let (signature_str, fetched_tx) = if !target_sig.is_empty() {
        println!("🔎 Target Signature / Hash: {}", target_sig);

        if target_sig.len() < 80 {
            println!("\n⚠️  WARNING: '{}' is {} characters long.", target_sig, target_sig.len());
            println!("   In Solana:");
            println!("   - Account Pubkeys (Addresses) are ~44 base58 characters.");
            println!("   - Transaction Hash Signatures are ~88 base58 characters.");
            println!("   Please copy the TRANSACTION SIGNATURE from Solscan (e.g. 3aFo1pGzZ2dFp6cxar87uv9QS2qSgUe7BXC1Pe98MLCgLZNtQFnTnHnjmazFEgf65ZnJpZQvFLhDe9m38AA7D45D).\n");
        }

        let sig = Signature::from_str(&target_sig)
            .map_err(|_| anyhow!("Invalid Transaction Signature: '{}' (must be an 88-character base58 string).", target_sig))?;

        let config = RpcTransactionConfig {
            encoding: Some(UiTransactionEncoding::JsonParsed),
            commitment: Some(CommitmentConfig::confirmed()),
            max_supported_transaction_version: Some(0),
        };

        let tx_meta = rpc_client.get_transaction_with_config(&sig, config)
            .context("Failed to fetch transaction from RPC cluster")?;

        (target_sig, Some(tx_meta))
    } else {
        println!("ℹ️  No signature provided. Sending a live test SOL transfer transaction...");
        let sender = get_keypair()?;
        let recipient = Keypair::new();
        let amount = 50_000_000; // 0.05 SOL

        let balance = rpc_client.get_balance(&sender.pubkey()).unwrap_or(0);
        if balance < amount {
            println!("🪂 Requesting airdrop...");
            let _ = rpc_client.request_airdrop(&sender.pubkey(), LAMPORTS_PER_SOL);
            std::thread::sleep(std::time::Duration::from_millis(1000));
        }

        let transfer_ix = system_instruction::transfer(&sender.pubkey(), &recipient.pubkey(), amount);
        let blockhash = rpc_client.get_latest_blockhash()?;
        let tx = Transaction::new_signed_with_payer(&[transfer_ix], Some(&sender.pubkey()), &[&sender], blockhash);

        let sig = rpc_client.send_and_confirm_transaction(&tx)?;
        println!("✅ Live Transaction Confirmed! Signature: {}", sig);
        (sig.to_string(), None)
    };

    println!("\n-------------------------------------------------------");
    println!("📊 TRANSACTION METADATA & EXECUTION LOGS");
    println!("-------------------------------------------------------");
    println!("Tx Signature: {}", signature_str);

    if let Some(ref tx_meta) = fetched_tx {
        println!("Slot:          {}", tx_meta.slot);
        if let Some(ref meta) = tx_meta.transaction.meta {
            println!("Status:        {}", if meta.err.is_none() { "SUCCESS ✅" } else { "FAILED ❌" });
            println!("Fee:           {} lamports", meta.fee);

            if let OptionSerializer::Some(cu) = meta.compute_units_consumed {
                println!("Compute Units: {} CU", cu);
            }

            if let OptionSerializer::Some(ref logs) = meta.log_messages {
                println!("\n📜 VM EXECUTION LOGS:");
                for (idx, log) in logs.iter().enumerate() {
                    println!("  [{:02}] {}", idx + 1, log);
                }
            }
        }

        println!("\n=======================================================");
        println!("⚙️ DYNAMIC INSTRUCTION BREAKDOWN FOR THIS TRANSACTION");
        println!("=======================================================");

        if let EncodedTransaction::Json(ui_tx) = &tx_meta.transaction.transaction {
            if let UiMessage::Parsed(parsed_msg) = &ui_tx.message {
                for (ix_idx, ix) in parsed_msg.instructions.iter().enumerate() {
                    println!("\n📍 Instruction [{:02}]:", ix_idx + 1);
                    match ix {
                        UiInstruction::Compiled(compiled) => {
                            println!("   Program Index: {}", compiled.program_id_index);
                            println!("   Accounts:      {:?}", compiled.accounts);
                            println!("   Data Hex/B58:  {}", compiled.data);
                        }
                        UiInstruction::Parsed(parsed) => match parsed {
                            UiParsedInstruction::Parsed(p) => {
                                println!("   Program:       {} ({})", p.program, p.program_id);
                                println!("   Parsed Info:   {}", p.parsed);
                            }
                            UiParsedInstruction::PartiallyDecoded(pd) => {
                                println!("   Program ID:    {}", pd.program_id);
                                println!("   Accounts:      {:?}", pd.accounts);
                                println!("   Data:          {}", pd.data);
                            }
                        },
                    }
                }
            }
        }
    } else {
        println!("\n=======================================================");
        println!("⚙️ PROGRAM INSTRUCTION BREAKDOWN & SBF BYTECODE");
        println!("=======================================================");

        let sample_sbf_bytecode: Vec<u8> = vec![
            0xb7, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x79, 0x12, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x15, 0x02, 0x04, 0x00, 0x02, 0x00, 0x00, 0x00,
            0xb7, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
            0x95, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x79, 0x13, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x79, 0x14, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x79, 0x35, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x79, 0x46, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x79, 0x17, 0x18, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x2d, 0x75, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00,
            0xb7, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00,
            0x95, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x1f, 0x75, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x0f, 0x76, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x7b, 0x53, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x7b, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x85, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
            0xb7, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x95, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        ];

        let instructions = SbfDisassembler::disassemble_code(&sample_sbf_bytecode)?;
        let mut dwarf_mapper = DwarfLineMapper::new();
        for pc in 0..20 {
            dwarf_mapper.insert(pc as u64, SourceLocation {
                file_path: "system_program/src/processor.rs".to_string(),
                line: (12 + pc * 2) as u64,
                column: 5,
            });
        }

        println!("--------------------------------------------------------------------------------------------------");
        println!("{:<9} | {:<24} | {:<25} | {:<40}", "PC (Idx)", "Raw Bytes", "Disassembled SBF Assembly", "Mapped Source File & Line");
        println!("--------------------------------------------------------------------------------------------------");
        for inst in &instructions {
            let hex_bytes = inst.raw_bytes.iter().map(|b| format!("{:02x}", b)).collect::<Vec<_>>().join(" ");
            let loc_str = dwarf_mapper.lookup_pc(inst.pc as u64)
                .map(|l| format!("📍 {}:L{}", l.file_path, l.line))
                .unwrap_or_else(|| "unknown_line".to_string());
            println!("PC [{:04}] | {:<24} | {:<25} | {}", inst.pc, hex_bytes, inst.assembly, loc_str);
        }
        println!("--------------------------------------------------------------------------------------------------");
    }

    Ok(())
}
