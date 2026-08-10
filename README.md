# 🔬 Solana Debugger

**Source-level transaction debugger for Solana.** Paste a transaction signature, get back the exact line of Rust code that failed — along with decoded errors, disassembled SBF bytecode, and Ghidra-powered pseudocode.

Solana Debugger takes the pain out of debugging on-chain programs. It connects to any Solana cluster (Mainnet, Devnet, Testnet, or Localnet), fetches the full transaction trace, downloads the program's compiled ELF binary, disassembles it instruction-by-instruction, parses DWARF debug symbols to map bytecode back to source code, and decompiles the binary into readable C-like pseudocode using Ghidra — all from a single transaction hash.

---

## 📑 Table of Contents

- [Architecture](#-architecture)
- [Core Engine](#-core-engine)
- [Solana RPC Integration](#-solana-rpc-integration)
- [Ghidra Decompilation Pipeline](#-ghidra-decompilation-pipeline)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Building & Running](#-building--running)
- [Usage](#-usage)
- [Testing with Debug Symbols](#-testing-with-debug-symbols)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏗 Architecture

The system is composed of four layers that work together end-to-end:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         REACT / VITE UI (Port 5173)                     │
│   TransactionInput • MetricsHeader • AnchorAnalysisCard                 │
│   FailureDiagnosisCard • SourceCodeViewer • BytecodeViewer              │
│   ProgramExplorer • PseudocodeViewer                                    │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │  HTTP / JSON API
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS API SERVER (Port 3001)                       │
│   POST /api/analyze       → Spawns Rust sbf_tracer CLI                  │
│   GET  /api/pseudocode/:id → Invokes Ghidra headless decompiler         │
│   Semantic Analyzer        → Classifies decompiled functions            │
└──────────────┬──────────────────────────────────┬───────────────────────┘
               │                                  │
               ▼                                  ▼
┌──────────────────────────────┐   ┌──────────────────────────────────────┐
│     RUST TRACER BACKEND      │   │        GHIDRA DECOMPILER             │
│  sbf_tracer    (CLI binary)  │   │  decompile_so.sh  (shell wrapper)   │
│  bytecode.rs   (disassembler)│   │  DecompileSBPF.java (Ghidra script) │
│  dwarf.rs      (DWARF parser)│   │  semanticAnalyzer.js (classifier)   │
│  anchor.rs     (IDL decoder) │   └──────────────────────────────────────┘
│  source.rs     (source finder│
└──────────────┬───────────────┘
               │  Solana JSON-RPC
               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SOLANA RPC CLUSTER / LOCALNET                         │
│   getTransaction • getAccountInfo • simulateTransaction                 │
└─────────────────────────────────────────────────────────────────────────┘
```

**Data flow in one sentence:** The UI sends a transaction signature → the Express server spawns the Rust tracer → the tracer calls Solana RPC to fetch the transaction and program binaries → it disassembles the bytecode, parses DWARF symbols, decodes Anchor errors, and resolves source code → the results are returned as JSON to the UI, where the user sees decoded instructions, the failing line of code, raw SBF disassembly, and Ghidra pseudocode.

---

## ⚙ Core Engine

The Rust backend (`src/debugger/`) is the heart of the project. It is split into four focused modules:

### `bytecode.rs` — SBF Disassembler

A from-scratch disassembler for Solana Bytecode Format (SBF/eBPF). Every SBF instruction is 8 bytes:

| Byte(s) | Field | Description |
|:---|:---|:---|
| `[0]` | Opcode | Operation (e.g. `0xb7` = MOV64, `0x85` = CALL, `0x95` = EXIT) |
| `[1]` | Registers | `dst_reg` (lower nibble), `src_reg` (upper nibble) |
| `[2..4]` | Offset | 16-bit signed offset for branches and memory access |
| `[4..8]` | Immediate | 32-bit signed immediate value |

The disassembler supports all standard ALU operations (ADD, SUB, MUL, DIV, MOV), memory loads/stores (LDXW, LDXDW, STXW, STXDW), branching (JEQ, JGT, JGE, JNE, JA), function calls/exits, and 16-byte wide 64-bit immediate loads (`LD_DW_IMM`, opcode `0x18`). Output is human-readable assembly like `r2 = [r1 + 16]` or `if r5 > r7 goto +3`.

### `dwarf.rs` — DWARF Line Mapper

Parses the `.debug_line` section from SBF ELF binaries using the `gimli` crate to build a lookup table:

```
Program Counter (PC byte offset)  →  { file_path, line_number, column }
```

This is what enables mapping raw bytecode execution back to Rust source lines. When a program is compiled with debug symbols (e.g. via `anchor build`), LLVM embeds this table into the `.so` binary. The mapper walks DWARF compilation units, resolves directory/file tables, and indexes every line-program row into a `BTreeMap` for fast `O(log n)` lookups.

### `anchor.rs` — Anchor IDL & Error Decoder

Handles high-level Anchor framework decoding for the 95% of mainnet programs deployed without debug symbols:

- **Discriminator Computation**: Generates 8-byte Anchor instruction discriminators via `SHA-256("global:<ix_name>")[0..8]`
- **On-Chain IDL Fetching**: Derives the IDL PDA (`seeds: ["anchor:idl"]`) and fetches/decompresses (zlib) the JSON IDL from on-chain accounts
- **Instruction Decoding**: Matches discriminators against IDL or a built-in dictionary of 25+ common DeFi methods (`swap`, `deposit`, `withdraw`, `add_liquidity`, etc.)
- **Error Translation**: Maps raw hex error codes to human-readable names across Anchor's full error table (100–3012: `InstructionMissing`, `ConstraintMut`, `ConstraintSigner`, `ConstraintSeeds`, `AccountDiscriminatorMismatch`, and 20+ more)
- **Native Program Decoding**: Built-in decoders for System Program, SPL Token, Token 2022, Associated Token Account, and Compute Budget instructions with full argument parsing

### `source.rs` — Source Code Resolver

A multi-strategy source file finder that attempts to locate the original Rust source code on disk:

1. **Absolute path** from DWARF metadata
2. **Relative to workspace root**
3. **Sibling directory scan** (checks parent directory siblings)
4. **Stripped path prefixes** (removes `.cargo/registry/...` build prefixes)
5. **Anchor project layout walk** (`programs/`, `src/`, `app/src/`)
6. **Full recursive workspace search** (skips `target/`, `node_modules/`, hidden dirs)
7. **OtterSec Verified Registry** fallback — queries `https://verify.osec.io/status/{program_id}` to find the verified GitHub repo and fetches source from `raw.githubusercontent.com`

---

## 🌐 Solana RPC Integration

The tracer communicates with Solana clusters through three primary JSON-RPC calls:

### `getTransaction`
```
Method:  getTransaction
Config:  { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }
```
Fetches the full transaction envelope — parsed instructions, account keys, execution status, compute units consumed, and VM execution logs. The tracer auto-detects which cluster holds the transaction by probing localhost → Devnet → Mainnet in sequence (or uses an explicit `SOLANA_RPC_URL`).

### `getAccountInfo`
```
Method:  getAccountInfo
Target:  Program ID or ProgramData PDA
```
Downloads the program's compiled SBF ELF binary from on-chain storage. For upgradeable programs (owned by `BPFLoaderUpgradeab1e`), the tracer first reads the 32-byte ProgramData address from the program account header, then fetches the actual ELF from the ProgramData account. The binary is scanned for the `\x7fELF` magic bytes to locate the ELF start offset.

### `simulateTransaction`
```
Method:  simulateTransaction
Config:  { sigVerify: false, replaceRecentBlockhash: true, innerInstructions: true }
```
Re-executes the transaction off-chain to capture detailed VM logs, compute unit consumption, and inner instruction traces without modifying chain state.

---

## 🔍 Ghidra Decompilation Pipeline

For programs deployed as release builds (no DWARF symbols), the debugger offers **Ghidra-powered decompilation** to produce C-like pseudocode from raw SBF bytecode.

### How It Works

1. **ELF Extraction**: The Rust tracer saves the on-chain program binary to `<programId>.so`
2. **Headless Analysis**: The Express server invokes `scripts/decompile_so.sh`, which runs Ghidra's `analyzeHeadless` in a disposable project
3. **Custom Script**: `scripts/DecompileSBPF.java` — a Ghidra script that:
   - Iterates all discovered functions via `FunctionManager`
   - Decompiles each function with the `DecompInterface` (30s timeout)
   - Annotates every line with its SBF instruction address range (`// @ 0xABC-0xDEF`)
   - Cleans up Ghidra's default types (`undefined8` → `uint64_t`, `longlong` → `int64_t`)
   - Applies Solana-specific semantic renaming (`entrypoint(uint8_t *input)`, `AccountContext`, `panic_handler`, `invoke_cpi`)
   - Normalizes variable names (`lVar1` → `local_var_1`, `bVar2` → `is_valid_2`)
4. **Semantic Analyzer**: `ui/semanticAnalyzer.js` classifies each decompiled function by its role:
   - `program_entry` — the SBF entrypoint
   - `instruction_dispatcher` — Anchor discriminator dispatch logic
   - `error_handler` / `panic_handler` — `sol_panic_` or `custom_panic` functions
   - `cpi_caller` — functions containing `sol_invoke_signed_c`
   - `heap_allocator` — references to `_DAT_ram_300000000`
   - Line-level patterns: signer checks, writable checks, PDA derivation, pubkey comparisons, account iteration (0x30-byte stride), error returns (`0x8000000000000000`)

The UI's **Program Explorer** presents these in an IDE-like dual-pane view, categorized into Entry & Dispatch, Core Logic, Validation & Security, and Utilities.

---

## 🛠 Tech Stack

| Layer | Technology |
|:---|:---|
| **Core Engine** | Rust, `solana-client`, `solana-sdk`, `solana-transaction-status` |
| **SBF Disassembly** | Custom eBPF decoder, `object` crate (ELF parsing) |
| **DWARF Parsing** | `gimli` crate |
| **Decompilation** | Ghidra Headless Analyzer, custom Java scripts |
| **API Server** | Node.js, Express |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Syntax Highlighting** | `react-syntax-highlighter` |
| **Icons** | `lucide-react` |
| **Verified Source** | OtterSec Verify API (`verify.osec.io`) |

---

## 📁 Project Structure

```
solana-debugger/
├── src/
│   ├── main.rs                     # Standalone demo: send tx, simulate, disassemble
│   ├── bin/
│   │   ├── sbf_tracer.rs           # Main CLI tracer (invoked by the API server)
│   │   └── inspect_tx.rs           # Lightweight tx inspection utility
│   └── debugger/
│       ├── mod.rs                   # Module exports
│       ├── bytecode.rs              # SBF/eBPF instruction disassembler
│       ├── dwarf.rs                 # DWARF .debug_line parser (PC → source line)
│       ├── anchor.rs                # Anchor IDL fetcher, discriminator & error decoder
│       └── source.rs                # Multi-strategy source file resolver
├── ui/
│   ├── server.js                    # Express API server
│   ├── semanticAnalyzer.js          # Ghidra pseudocode classifier
│   └── src/
│       ├── App.tsx                  # Main React application
│       └── components/
│           ├── Navbar.tsx            # Network selector header
│           ├── TransactionInput.tsx  # Signature search bar
│           ├── MetricsHeader.tsx     # Status, slot, CU cards
│           ├── AnchorAnalysisCard.tsx # Decoded errors & instructions
│           ├── FailureDiagnosisCard.tsx # Failure diagnosis summary
│           ├── SourceCodeViewer.tsx  # Rust source with error highlighting
│           ├── BytecodeViewer.tsx    # SBF disassembly table
│           ├── ProgramExplorer.tsx   # IDE-like function explorer
│           └── PseudocodeViewer.tsx  # Ghidra C pseudocode viewer
├── scripts/
│   ├── DecompileSBPF.java           # Ghidra headless decompiler script
│   ├── decompile_so.sh              # Shell wrapper for Ghidra analyzeHeadless
│   ├── start_all.sh                 # One-command full startup script
│   ├── start_dev.sh                 # Backend + frontend dev launcher
│   ├── start_validator.sh           # Local validator launcher
│   └── setup_solana.sh              # Solana CLI setup & airdrop
├── docs/
│   ├── DEBUGGER_MASTER_PLAN.md      # Architecture roadmap
│   └── EXPLANATION.md               # Technical deep-dive
├── Cargo.toml                       # Rust dependencies
├── Makefile                         # Build & run commands
└── counter-example/                 # Test Anchor program with intentional panics
```

---

## 🚀 Building & Running

### Prerequisites

- **Rust** (stable toolchain)
- **Solana CLI** (`solana-test-validator`, `solana-keygen`)
- **Node.js** (v18+)
- **Ghidra** (optional, for pseudocode decompilation — set `GHIDRA_DIR` env var)

### One-Command Start

```bash
make run
```

This single command:
1. Starts `solana-test-validator` in the background (if not already running)
2. Configures RPC to localhost, creates a default keypair, and airdrops 10 SOL
3. Installs npm dependencies
4. Launches the Express backend on `http://localhost:3001` and Vite frontend on `http://localhost:5173`
5. `Ctrl+C` cleanly shuts down all processes

### All Make Commands

| Command | Description |
|:---|:---|
| `make run` | Start everything (validator + backend + frontend) |
| `make dev` | Run backend + frontend only (assumes validator is running) |
| `make validator` | Start local `solana-test-validator` standalone |
| `make setup` | Install/verify Solana CLI, set localhost, create keypair, airdrop |
| `make tracer TX=<sig>` | Run SBF tracer for a specific transaction signature |
| `make clean` | Remove Rust build artifacts and frontend caches |

### Manual Setup (Linux)

```bash
# 1. Install Solana CLI
curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash

# 2. Export PATH
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.zshrc

# 3. Start validator
solana-test-validator

# 4. Configure & fund
solana config set --url localhost
solana-keygen new --outfile ~/.config/solana/id.json
solana airdrop 10

# 5. Run backend & frontend
cd ui && npm install && npm run server &
cd ui && npm run dev
```

---

## 📋 Usage

### Web UI

1. Open `http://localhost:5173`
2. Select a network (Mainnet, Devnet, Testnet, or Localnet) from the navbar
3. Paste a transaction signature into the search bar and click **Run Tracer**
4. Explore the results:
   - **Metrics Header** — execution status, slot number, compute units consumed
   - **Anchor Analysis** — decoded instruction names, arguments, and error codes
   - **Failure Diagnosis** — high-level explanation of why the transaction failed
   - **Source Code Viewer** — original Rust source with the failing line highlighted
   - **Bytecode Viewer** — paginated SBF disassembly with DWARF source mappings
   - **Program Explorer** — Ghidra-decompiled pseudocode with semantic function classification

### CLI Tracer

```bash
# Trace a specific transaction
make tracer TX=3aFo1pGzZ2dFp6cxar87uv9QS2qSgUe7BXC1Pe98MLCgLZNtQFnTnHnjmazFEgf65ZnJpZQvFLhDe9m38AA7D45D

# Or directly
cargo run --bin sbf_tracer -- <TRANSACTION_SIGNATURE> [OUTPUT_FILE]
```

This produces:
- `bytecode.txt` — raw SBF disassembly with VM execution logs
- `bytecode.json` — structured analysis summary (decoded errors, instructions, source context, failure location)

### Standalone Demo

```bash
cargo run
```

Sends a SOL transfer on localnet, simulates it, disassembles the SBF bytecode, and maps every instruction to a source line via DWARF tables.

---

## 🧪 Testing with Debug Symbols

To see source-level debugging in action, you need a program compiled with DWARF debug symbols.

### Localnet Testing

```bash
# Create a test Anchor program
anchor init test_fail
cd test_fail

# Add a deliberate error in programs/test_fail/src/lib.rs
anchor build    # Keeps DWARF symbols by default
anchor deploy

# Generate a failing transaction
node tests/run_test.js
# Copy the printed signature into the debugger UI
```

### Devnet Testing (Team Collaboration)

Deploy to Devnet so colleagues can debug the same transaction hash:

```bash
# Fund your wallet
# Visit https://faucet.solana.com/ and request Devnet SOL

anchor build
anchor deploy --provider.cluster devnet
node tests/run_test_devnet.js
# Share the Devnet transaction signature with your team
```

The debugger will automatically pull the Devnet binary, extract DWARF symbols, search the local filesystem for the corresponding Rust project, and highlight the exact failing line.

---

## 🤝 Contributing

**Solana Debugger is an open-source project and contributions are welcome!**

Whether it's fixing a bug, adding a new instruction decoder, improving the UI, or extending Ghidra analysis — all contributions are appreciated. Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/my-feature`)
3. **Commit** your changes (`git commit -m 'Add my feature'`)
4. **Push** to the branch (`git push origin feature/my-feature`)
5. **Open** a Pull Request

Areas where help is especially welcome:
- Adding support for more program decoders (Raydium, Orca, Marinade, etc.)
- Implementing a `solana_rbpf` VM stepper for instruction-level single-stepping
- Improving the semantic analyzer with more Solana-specific patterns
- Building a VS Code extension integration
- Writing documentation and tutorials

---

## 📄 License

Open source. See the repository for license details.
