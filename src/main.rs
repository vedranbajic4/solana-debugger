mod debugger;

use anyhow::{Context, Result};
use solana_client::rpc_client::RpcClient;
use solana_client::rpc_config::RpcSimulateTransactionConfig;
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::native_token::LAMPORTS_PER_SOL;
use solana_sdk::signature::{Keypair, Signer};
use solana_sdk::system_instruction;
use solana_sdk::transaction::Transaction;
use std::fs;

use debugger::{DwarfLineMapper, SbfDisassembler, SourceLocation};

fn get_keypair() -> Result<Keypair> {
    let home_dir = dirs::home_dir().context("Could not find home directory")?;
    let keypair_path = home_dir.join(".config/solana/id.json");

    if keypair_path.exists() {
        println!("🔑 Loading keypair from {:?}", keypair_path);
        let secret_key_str = fs::read_to_string(&keypair_path)?;
        let secret_key_bytes: Vec<u8> = serde_json::from_str(&secret_key_str)?;
        let keypair = Keypair::from_bytes(&secret_key_bytes)?;
        Ok(keypair)
    } else {
        println!("🔑 Keypair file not found at {:?}, generating ephemeral keypair...", keypair_path);
        Ok(Keypair::new())
    }
}

fn main() -> Result<()> {
    println!("=======================================================");
    println!("LIB SOLANA TRANSACTION DEBUGGER & BYTECODE MAPPER");
    println!("=======================================================");

    let rpc_url = "http://127.0.0.1:8899";
    println!("🌐 Connecting to Solana RPC: {}", rpc_url);
    let rpc_client = RpcClient::new_with_commitment(rpc_url.to_string(), CommitmentConfig::confirmed());

    // 1. Prepare keypairs
    let sender = get_keypair()?;
    let recipient = Keypair::new();

    println!("   Sender Pubkey:    {}", sender.pubkey());
    println!("   Recipient Pubkey: {}", recipient.pubkey());

    let balance = rpc_client.get_balance(&sender.pubkey()).unwrap_or(0);
    println!("💰 Sender initial balance: {} SOL", balance as f64 / LAMPORTS_PER_SOL as f64);

    if balance < LAMPORTS_PER_SOL / 10 {
        println!("🪂 Requesting airdrop of 1 SOL...");
        if let Ok(sig) = rpc_client.request_airdrop(&sender.pubkey(), LAMPORTS_PER_SOL) {
            println!("   Airdrop transaction sent! Sig: {}", sig);
            std::thread::sleep(std::time::Duration::from_millis(1000));
        }
    }

    // 2. Build SOL transfer transaction
    let transfer_amount = 50_000_000; // 0.05 SOL
    let transfer_ix = system_instruction::transfer(&sender.pubkey(), &recipient.pubkey(), transfer_amount);

    let recent_blockhash = rpc_client.get_latest_blockhash()
        .context("Failed to fetch latest blockhash")?;

    let tx = Transaction::new_signed_with_payer(
        &[transfer_ix],
        Some(&sender.pubkey()),
        &[&sender],
        recent_blockhash,
    );

    println!("\n-------------------------------------------------------");
    println!("🚀 STEP 1: SENDING TRANSACTION & CONFIRMING ON-CHAIN");
    println!("-------------------------------------------------------");

    let signature = rpc_client.send_and_confirm_transaction(&tx)
        .context("Failed to send and confirm transaction")?;

    println!("✅ Transaction Confirmed!");
    println!("   Signature: {}", signature);

    println!("\n-------------------------------------------------------");
    println!("🔬 STEP 2: RE-EXECUTING (REPLAYING/SIMULATING) TRANSACTION");
    println!("-------------------------------------------------------");

    let config = RpcSimulateTransactionConfig {
        sig_verify: false,
        replace_recent_blockhash: true,
        commitment: Some(CommitmentConfig::confirmed()),
        encoding: None,
        accounts: None,
        min_context_slot: None,
        inner_instructions: true,
    };

    let sim_response = rpc_client.simulate_transaction_with_config(&tx, config)?;
    let sim_result = sim_response.value;

    println!("Status:           {}", if sim_result.err.is_none() { "SUCCESS ✅" } else { "FAILED ❌" });
    if let Some(units) = sim_result.units_consumed {
        println!("Compute Units:    {} CU", units);
    }

    println!("\n📜 VM EXECUTION LOGS:");
    if let Some(logs) = sim_result.logs {
        for (idx, log) in logs.iter().enumerate() {
            println!("  [{:02}] {}", idx + 1, log);
        }
    }

    println!("\n=======================================================");
    println!("⚙️ STEP 3: DISASSEMBLING SBF BYTECODE & MAPPING SOURCE LINES");
    println!("=======================================================");

    // Raw SBF / eBPF byte instructions stream
    let sample_sbf_bytecode: Vec<u8> = vec![
        0xb7, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0000]: r1 = 0 (MOV64)
        0x79, 0x12, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0001]: r2 = [r1 + 16] (LDXDW)
        0x07, 0x02, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, // PC [0002]: r2 += 100 (ADD64)
        0x17, 0x02, 0x00, 0x00, 0x32, 0x00, 0x00, 0x00, // PC [0003]: r2 -= 50 (SUB64)
        0x85, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, // PC [0004]: call sol_log_ (CALL)
        0x95, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // PC [0005]: exit / return (EXIT)
    ];

    println!("🛠️ Disassembling raw SBF Bytecode stream into machine instructions...");
    let instructions = SbfDisassembler::disassemble_code(&sample_sbf_bytecode)?;

    // Initialize DWARF line mapper and populate mappings
    let mut dwarf_mapper = DwarfLineMapper::new();
    dwarf_mapper.insert(0, SourceLocation { file_path: "src/processor.rs".to_string(), line: 14, column: 1 });
    dwarf_mapper.insert(1, SourceLocation { file_path: "src/processor.rs".to_string(), line: 18, column: 5 });
    dwarf_mapper.insert(2, SourceLocation { file_path: "src/processor.rs".to_string(), line: 25, column: 12 });
    dwarf_mapper.insert(3, SourceLocation { file_path: "src/processor.rs".to_string(), line: 29, column: 12 });
    dwarf_mapper.insert(4, SourceLocation { file_path: "src/processor.rs".to_string(), line: 34, column: 5 });
    dwarf_mapper.insert(5, SourceLocation { file_path: "src/processor.rs".to_string(), line: 40, column: 5 });

    println!("📍 DWARF Debug Line Mapper initialized with {} mapped PC locations.", dwarf_mapper.mappings_count());

    println!("\n--- 📍 SBF BYTECODE ➔ SOURCE CODE MAPPING TABLE ---");
    println!("--------------------------------------------------------------------------------------------------");
    println!("{:<9} | {:<24} | {:<22} | {:<35}", "PC (Idx)", "Raw Bytes", "Disassembled Assembly", "Mapped Rust Source Line");
    println!("--------------------------------------------------------------------------------------------------");

    for inst in &instructions {
        let hex_bytes = inst
            .raw_bytes
            .iter()
            .map(|b| format!("{:02x}", b))
            .collect::<Vec<_>>()
            .join(" ");

        let source_line = dwarf_mapper
            .lookup_pc(inst.pc as u64)
            .map(|loc| format!("{}:L{}", loc.file_path, loc.line))
            .unwrap_or_else(|| "unknown_line".to_string());

        println!(
            "PC [{:04}] | {:<24} | {:<22} | 📍 {}",
            inst.pc, hex_bytes, inst.assembly, source_line
        );
    }
    println!("--------------------------------------------------------------------------------------------------");

    println!("\n🧠 DEBUGGER STEP 2 COMPLETE:");
    println!("   1. Transaction sent & confirmed on-chain.");
    println!("   2. Transaction re-executed & VM logs captured.");
    println!("   3. SBF Bytecode disassembled into eBPF machine instructions.");
    println!("   4. Program Counter (PC) mapped directly to Rust source code lines (`src/processor.rs`)!");

    Ok(())
}
