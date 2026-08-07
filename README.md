# 🐞 Solana Debugger

An interactive, rust-based Solana transaction re-execution and debugging tool. This tool enables you to send transactions to a Solana cluster (Localnet/Devnet/Mainnet) and **re-execute (replay/simulate)** them locally or via RPC simulation engines to capture execution logs, compute units, account balance deltas, and program errors.

> 📖 **Team Documentation**: For a deep dive into the architecture, execution flow diagram, and VM simulation report, see [`EXPLANATION.md`](file:///home/vedran/dev/solana-debugger/EXPLANATION.md).

---

## ⚙️ Prerequisites & Setup (Linux)

### 1. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

### 2. Install Solana CLI Tool Suite (Agave)
```bash
curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash
```
Add Solana to your PATH (e.g. in `~/.bashrc` or `~/.zshrc`):
```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### 3. Start Local Solana Validator
In a dedicated terminal window, run:
```bash
solana-test-validator
```
*Leave this validator terminal running in the background (default RPC: `http://127.0.0.1:8899`).*

### 4. Configure Solana CLI & Create Wallet
In a new terminal:
```bash
# Set CLI target to local validator
solana config set --url localhost

# Generate a local keypair (if not already created)
solana-keygen new --outfile ~/.config/solana/id.json --no-bip39-passphrase --force

# Fund your keypair with 10 SOL
solana airdrop 10
```

---

## 🚀 Running the Rust Solana Debugger (Step 1)

### Build & Run
```bash
cargo run
```

### 🧪 What Step 1 Does:
1. **Connects** to the local Solana validator (`http://127.0.0.1:8899`).
2. **Loads/Generates** local keypairs and checks SOL balance (requests automatic airdrop if needed).
3. **Builds & Sends** a simple System Program SOL transfer transaction.
4. **Confirms** transaction commitment on-chain.
5. **Re-Executes (Replays/Simulates)** the exact same transaction using Solana's VM simulation engine (`simulate_transaction_with_config`).
6. **Outputs** the Re-execution Report:
   - ✅ / ❌ Transaction Execution Status
   - ⚡ Compute Units (CU) Consumed
   - 📜 VM Execution Trace / Program Logs (`meta.logMessages`)
   - 💰 Pre- and Post- Account Balances

---

## 🧠 How Transaction Re-Execution Works

### Core Concepts:
- **Deterministic Execution**: Solana transactions are deterministic given a set of input accounts and program code.
- **RPC Simulation (`simulate_transaction`)**: The RPC node creates a temporary bank state, executes the transaction pipeline in Sealevel (Solana's parallel VM runtime), and records logs and account mutations **without altering the persistent chain state**.
- **Debugger Advantage**: Re-execution allows us to replay both successful and **failed mainnet/devnet transactions** locally to inspect instruction traces, error codes, and account states.

---

## 🗺️ Project Roadmap

- [x] **Phase 1 (Step 1) — Core Re-execution Loop**: Send a simple transaction and re-execute/replay it via Rust RPC simulation engine.
- [ ] **Phase 1 (Step 2) — Mainnet Transaction Replay**: Fetch historical transactions by signature and simulate against custom/forked account state.
- [ ] **Phase 2 — IDL & Error Decoding**: Map raw instruction data and custom hex error codes to human-readable Anchor/IDL errors.
- [ ] **Phase 3 — Interactive Debugger CLI / UI**: Visual trace inspector showing per-instruction compute unit cost, account deltas, and failure stack traces.
