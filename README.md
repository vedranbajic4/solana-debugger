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


# jocko:

## Phase 0 — Environment setup
- [ ] Install Rust via `rustup` (needed for Solana program tooling either way)
- [ ] Install the Solana CLI tool suite (Agave) — gives you `solana`, `solana-keygen`, `solana-test-validator`
- [ ] Run `cargo-build-sbf` once to trigger the platform-tools download (needed even if you don't compile your own program)
- [ ] Install Anchor via `avm install latest && avm use latest` — most real-world failed txs you'll debug are Anchor programs, so you need `anchor-cli` for IDL tooling
- [ ] Install Surfpool: `cargo install surfpool-cli`
- [ ] Get an RPC endpoint with decent rate limits (Helius or QuickNode free tier) — the public mainnet RPC will throttle you fast once you're pulling tx + account data repeatedly
- [ ] Pick your client language (TS/web3.js or Rust) and scaffold a bare project that can hit that RPC

## Phase 1 — Prove the core loop works
- [ ] Write a script that takes a tx signature and pulls it via `getParsedTransaction`, dumping `meta.logMessages` and the account keys involved
- [ ] Start Surfpool locally (`NO_DNA=1 surfpool start`) and confirm you can connect to it like a normal RPC
- [ ] Test Surfpool's mainnet-fork: pull a single known account/program into your local Surfnet and confirm the state matches mainnet
- [ ] Find one real failed transaction on a program you know (a swap that hit slippage, a CU-limit failure, whatever) and manually replay it against the forked state — just get the same logs to reproduce locally

## Phase 2 — Add the decoding layer
- [ ] Fetch the IDL for the program involved (Anchor programs usually have it on-chain or in their repo)
- [ ] Map the raw hex error code in the logs to the IDL's named error
- [ ] Capture account state before and after replay, diff it

## Phase 3 — Wrap it in something demoable
- [ ] Decide CLI-first (faster to build) vs. minimal web UI (better demo)
- [ ] Output format: signature in → root cause summary out (program, instruction, failed account/constraint, human-readable error)

