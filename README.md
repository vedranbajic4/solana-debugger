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
