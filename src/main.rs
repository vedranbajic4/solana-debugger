use std::fs;
use anyhow::{Context, Result};
use solana_client::rpc_client::RpcClient;
use solana_client::rpc_config::RpcSimulateTransactionConfig;
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::native_token::LAMPORTS_PER_SOL;
use solana_sdk::signature::{Keypair, Signer};
use solana_sdk::system_instruction;
use solana_sdk::transaction::Transaction;

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
    let rpc_url = "http://127.0.0.1:8899";
    println!("🌐 Connecting to Solana RPC: {}", rpc_url);
    let rpc_client = RpcClient::new_with_commitment(rpc_url.to_string(), CommitmentConfig::confirmed());

    // 1. Prepare keypairs (Sender and Recipient)
    let sender = get_keypair()?;
    let recipient = Keypair::new();

    println!("   Sender Pubkey:    {}", sender.pubkey());
    println!("   Recipient Pubkey: {}", recipient.pubkey());

    // Check sender balance, request airdrop if needed
    let balance = rpc_client.get_balance(&sender.pubkey()).unwrap_or(0);
    println!("💰 Sender initial balance: {} lamports ({} SOL)", balance, balance as f64 / LAMPORTS_PER_SOL as f64);

    if balance < LAMPORTS_PER_SOL / 10 {
        println!("🪂 Requesting airdrop of 1 SOL for sender...");
        match rpc_client.request_airdrop(&sender.pubkey(), LAMPORTS_PER_SOL) {
            Ok(sig) => {
                println!("   Airdrop transaction sent! Sig: {}", sig);
                // Wait for confirmation
                let mut tries = 0;
                while tries < 10 {
                    std::thread::sleep(std::time::Duration::from_millis(500));
                    if let Ok(b) = rpc_client.get_balance(&sender.pubkey()) {
                        if b >= LAMPORTS_PER_SOL {
                            println!("   Airdrop confirmed! New balance: {} SOL", b as f64 / LAMPORTS_PER_SOL as f64);
                            break;
                        }
                    }
                    tries += 1;
                }
            }
            Err(e) => {
                println!("⚠️  Airdrop failed or rate limited: {}. Proceeding with existing balance...", e);
            }
        }
    }

    // 2. Build the Transaction
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

    println!("\n=======================================================");
    println!("🚀 STEP 1: SENDING ORIGINAL TRANSACTION TO SOLANA NETWORK");
    println!("=======================================================");

    let signature = rpc_client.send_and_confirm_transaction(&tx)
        .context("Failed to send and confirm transaction")?;

    println!("✅ Transaction successfully confirmed!");
    println!("   Tx Signature: {}", signature);

    let post_sender_bal = rpc_client.get_balance(&sender.pubkey())?;
    let post_recip_bal = rpc_client.get_balance(&recipient.pubkey())?;
    println!("   Sender Balance After Tx:    {} SOL", post_sender_bal as f64 / LAMPORTS_PER_SOL as f64);
    println!("   Recipient Balance After Tx: {} SOL", post_recip_bal as f64 / LAMPORTS_PER_SOL as f64);

    println!("\n=======================================================");
    println!("🔬 STEP 2: RE-EXECUTING (REPLAYING/SIMULATING) THE TRANSACTION");
    println!("=======================================================");
    println!("ℹ️  Re-execution allows us to dry-run/inspect transaction execution");
    println!("   against local or remote state without mutating the ledger.");

    // We can simulate the transaction with RPC config
    let config = RpcSimulateTransactionConfig {
        sig_verify: false,
        replace_recent_blockhash: true,
        commitment: Some(CommitmentConfig::confirmed()),
        encoding: None,
        accounts: None,
        min_context_slot: None,
        inner_instructions: true,
    };

    let sim_response = rpc_client.simulate_transaction_with_config(&tx, config)
        .context("Failed to simulate/re-execute transaction")?;

    let sim_result = sim_response.value;

    println!("\n--- 📊 SOLANA RE-EXECUTION REPORT ---");
    println!("Status:           {}", if sim_result.err.is_none() { "SUCCESS ✅" } else { "FAILED ❌" });
    if let Some(err) = &sim_result.err {
        println!("Error Detail:     {:?}", err);
    }
    if let Some(units) = sim_result.units_consumed {
        println!("Compute Units:    {} CU", units);
    }

    println!("\n--- 📜 VM EXECUTION LOGS (Program Traces) ---");
    if let Some(logs) = sim_result.logs {
        for (idx, log) in logs.iter().enumerate() {
            println!("  [{:02}] {}", idx + 1, log);
        }
    } else {
        println!("  (No logs returned)");
    }

    println!("\n=======================================================");
    println!("🧠 DEBUGGER EXPLANATION & ARCHITECTURE");
    println!("=======================================================");
    println!("1. What happened?");
    println!("   - We constructed a Solana transaction with a SystemProgram transfer instruction.");
    println!("   - We broadcasted it to the validator, confirming its commitment on-chain.");
    println!("   - Next, we passed the transaction object to the Solana Simulation/Re-execution engine.");
    println!("2. How Re-execution works:");
    println!("   - In Solana, transaction execution is deterministic.");
    println!("   - The VM takes the input accounts, transaction bytes, and current bank/slot state,");
    println!("     executes the instruction pipeline in Sealevel (Solana's parallel runtime),");
    println!("     and produces execution logs, compute unit consumed count, and post-state deltas.");
    println!("3. Why Re-execution is essential for Solana Debugging:");
    println!("   - Replaying a failed transaction allows a developer to step through program logs,");
    println!("     inspect custom error codes, monitor compute limit exhaustion, and isolate contract bugs.");
    println!("   - This forms the core engine of our Solana Debugger!");

    Ok(())
}
