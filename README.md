# Solana Debugger

## Quick Start (Makefile)

The repository includes a `Makefile` and scripts under `scripts/` for easy 1-command startup and management.

### 🚀 Start Everything with One Command
```bash
make run
```
* **What it does**:
  1. Starts `solana-test-validator` in the background (if not already running).
  2. Sets RPC target to `localhost`, creates default keypair if missing, and requests a 10 SOL airdrop.
  3. Launches Express backend (`http://localhost:3001`) and Vite frontend (`http://localhost:5173`) simultaneously.
  4. Pressing `Ctrl+C` cleanly shuts down all processes.

---

### 📋 All Available `make` Commands

| Command | Description |
| :--- | :--- |
| `make run` | Starts **everything** (Validator + Express Backend + Vite Frontend) in one terminal |
| `make dev` | Runs Express backend server and Vite frontend concurrently (requires validator running) |
| `make validator` | Starts local `solana-test-validator` standalone |
| `make setup` | Verifies Solana CLI, sets RPC target to localhost, creates keypair & requests airdrop |
| `make tracer TX=<sig>` | Traces SBF bytecode & maps DWARF lines for a specific transaction signature |
| `make clean` | Removes Rust build artifacts and frontend build caches |

---

## 🛠️ Usage Examples

### 1) Trace SBF Bytecode for a Transaction Signature
```bash
make tracer TX=3aFo1pGzZ2dFp6cxar87uv9QS2qSgUe7BXC1Pe98MLCgLZNtQFnTnHnjmazFEgf65ZnJpZQvFLhDe9m38AA7D45D
```
* **What it does**:
  1. Fetches on-chain transaction metadata & execution logs.
  2. Fetches program SBF ELF binaries.
  3. Disassembles opcode bytes into SBF machine code instructions.
  4. Maps Program Counter (PC) offsets to source line numbers via DWARF debug tables.
  5. Saves output to `bytecode.txt`.

### 2) Run Core Transaction Sender Engine
```bash
cargo run
```
* Sends a test transaction to localnet RPC, re-executes (simulates) it, captures VM logs, disassembles SBF bytecode, and maps Program Counter (PC) to source lines.

---

## ⚙️ Manual Setup Reference (LINUX)

If you prefer running services manually without `make`:

1) Install Solana CLI:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash
   ```

2) Export PATH:
   ```bash
   echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.zshrc
   ```

3) Start Validator:
   ```bash
   solana-test-validator
   ```

4) Configure Localnet & Airdrop:
   ```bash
   solana config set --url localhost
   solana-keygen new --outfile ~/.config/solana/id.json
   solana airdrop 10
   ```

5) Run UI Backend and Frontend manually:
   - Terminal 1 (Backend): `cd ui && npm run server`
   - Terminal 2 (Frontend): `cd ui && npm run dev`

---

## 🧪 Testing with Source Code Debugging

To see the Rust source-code debugging features in action, you need to generate a transaction using a program compiled with debug symbols (DWARF tables).

There are two ways to test this:
1. **Localhost Testing**: Fast, but the transaction hash will only work on your machine.
2. **Devnet Testing (Collaboration)**: The transaction hash is public, so your colleagues can copy-paste it into their debugger and see the exact same Rust code.

### 🏠 Method 1: Localhost Testing

1. **Create and Deploy a Test Program:**
   ```bash
   anchor init test_fail
   cd test_fail
   # Add a deliberate panic/error inside programs/test_fail/src/lib.rs
   anchor build
   anchor deploy
   ```
   *Note: `anchor build` keeps DWARF debug symbols by default.*

2. **Generate a Failing Transaction:**
   Create `tests/run_test.js`:
   ```javascript
   const anchor = require("@coral-xyz/anchor");
   const fs = require("fs");
   const os = require("os");

   async function main() {
     const keypairFile = fs.readFileSync(os.homedir() + "/.config/solana/id.json");
     const keypair = anchor.web3.Keypair.fromSecretKey(Buffer.from(JSON.parse(keypairFile)));
     const wallet = new anchor.Wallet(keypair);

     const connection = new anchor.web3.Connection("http://127.0.0.1:8899", "confirmed");
     const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed", skipPreflight: true });
     anchor.setProvider(provider);

     const idl = require("../target/idl/test_fail.json");
     idl.address = "YOUR_PROGRAM_ID"; // Use the Program ID printed by 'anchor deploy'
     const program = new anchor.Program(idl, provider);

     const ix = await program.methods.triggerError(new anchor.BN(500)).instruction();
     const tx = new anchor.web3.Transaction().add(ix);
     
     const signature = await provider.connection.sendTransaction(tx, [keypair], { skipPreflight: true });
     console.log("TRANSACTION SIGNATURE: ", signature);
   }
   main();
   ```
   Run the script: `node tests/run_test.js`. Paste the signature into your UI.

---

### 🌍 Method 2: Devnet Testing (For Team Collaboration)

If you want to share a failing transaction hash with your colleagues on GitHub, you must deploy your test program to **Devnet**. Devnet binaries also retain DWARF symbols!

1. **Fund your Devnet Wallet:**
   Go to [faucet.solana.com](https://faucet.solana.com/) and request Devnet SOL for your local wallet address (`solana address`).

2. **Automated Devnet Deployment Script:**
   Create a bash script `deploy_and_test_devnet.sh` in your Anchor project:
   ```bash
   #!/bin/bash
   echo "🚀 Preparing to deploy to Devnet..."
   
   echo "🔨 Building Anchor Project..."
   anchor build

   echo "🚢 Deploying to Devnet..."
   anchor deploy --provider.cluster devnet

   echo "💥 Executing failing transaction on Devnet..."
   # Note: Ensure your run_test.js is updated to point to https://api.devnet.solana.com
   node tests/run_test_devnet.js
   ```

3. **Devnet Test Script (`run_test_devnet.js`):**
   ```javascript
   const anchor = require("@coral-xyz/anchor");
   const fs = require("fs");
   const os = require("os");

   async function main() {
     const keypairFile = fs.readFileSync(os.homedir() + "/.config/solana/id.json");
     const keypair = anchor.web3.Keypair.fromSecretKey(Buffer.from(JSON.parse(keypairFile)));
     const wallet = new anchor.Wallet(keypair);

     // 🌐 CONNECT TO DEVNET
     const connection = new anchor.web3.Connection("https://api.devnet.solana.com", "confirmed");
     const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed", skipPreflight: true });
     anchor.setProvider(provider);

     const idl = require("../target/idl/test_fail.json");
     idl.address = "YOUR_PROGRAM_ID";
     const program = new anchor.Program(idl, provider);

     const ix = await program.methods.triggerError(new anchor.BN(500)).instruction();
     const tx = new anchor.web3.Transaction().add(ix);
     
     const signature = await provider.connection.sendTransaction(tx, [keypair], { skipPreflight: true });
     console.log("DEVNET TRANSACTION SIGNATURE: ", signature);
   }
   main();
   ```

4. **Run it:**
   ```bash
   chmod +x deploy_and_test_devnet.sh
   ./deploy_and_test_devnet.sh
   ```

You can now share the resulting **Devnet Transaction Signature** with your colleagues. When they run the debugger UI and enter that hash, it will automatically pull the Devnet binary, extract the DWARF symbols, search their local filesystem for the corresponding Rust project, and highlight the exact line of code!
