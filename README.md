# Solana debuger

## setup solana (LINUX)
1) `
curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash`

restart terminal

2) optional: `nvm use --delete-prefix v24.10.0`

3) export path: `echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.zshrc`

4) `solana-test-validator`

ovo ranuje na http://127.0.0.1:8899, **ostaviti terminal upaljen**

Otvori novi terminal

5) `solana config set --url localhost`

6) `solana-keygen new --outfile ~/.config/solana/id.json`

7) `solana airdrop 10`


## pravljenje projekta i transakcije

1) `cd solana-tx`

2) `npm init -y`

3) `npm install @solana/web3.js`

4) `node transfer.js`


## HOW TO RUN

### 1) Run core transaction sender and re-execution engine
```bash
cargo run
```
* **What it does**: Sends a test transaction to localnet RPC, re-executes (simulates) it, captures VM logs, disassembles SBF bytecode, and maps Program Counter (PC) to source lines.

### 2) Trace low-level SBF bytecode for any transaction hash to file
```bash
cargo run --bin sbf_tracer -- <TRANSACTION_SIGNATURE_HASH> bytecode.txt
```

**Example**:
```bash
cargo run --bin sbf_tracer -- 3aFo1pGzZ2dFp6cxar87uv9QS2qSgUe7BXC1Pe98MLCgLZNtQFnTnHnjmazFEgf65ZnJpZQvFLhDe9m38AA7D45D bytecode.txt
```

* **What it does**:
  1. Fetches on-chain transaction metadata & execution logs.
  2. Fetches program SBF ELF binaries.
  3. Disassembles opcode bytes into SBF machine code instructions.
  4. Maps Program Counter (PC) offsets to source line numbers via DWARF debug tables.
  5. Saves output to `bytecode.txt`.
