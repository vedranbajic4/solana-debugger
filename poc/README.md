# PoC programs — Solana contracts that fail on purpose, with DWARF intact

Six small native Solana programs, each of which fails in a different way, each
built so that its deployed `.so` still carries the DWARF debug tables the
debugger needs to map a program counter back to a Rust source line.

They exist to be broken. Every one has a comment marking the bug, and the line
that panics is recorded below so you have ground truth to check the debugger's
output against.

All six were built, deployed to a local validator and executed; the failure
class, compute cost and panic location in the table below are measured, not
predicted.

---

## The six PoCs

| # | Program | Failure class | Runtime result | Bug line | CU |
|---|---------|---------------|----------------|----------|-----|
| 1 | `arith-overflow` | overflow check panic | `ProgramFailedToComplete` | `lib.rs:92` | 1,243 |
| 2 | `index-oob` | slice bounds panic | `ProgramFailedToComplete` | `lib.rs:51` | 724 |
| 3 | `unwrap-none` | `unwrap()` on `None` | `ProgramFailedToComplete` | `lib.rs:45` | 842 |
| 4 | `assert-invariant` | `assert_eq!` panic | `ProgramFailedToComplete` | `lib.rs:78` | 1,238 |
| 5 | `missing-signer` | clean `Err` return | `Custom(1)` | `lib.rs:70` | 3,818 |
| 6 | `compute-exhaust` | CU meter exhausted | `ProgramFailedToComplete` | `lib.rs:56` | 200,000 |

The spread across failure *classes* is the point. Four of them abort through
the panic handler, one returns an error without aborting at all, and one is
stopped by the VM mid-instruction. A debugger tuned only to panics will find
nothing to say about #5 and #6, and those are the two that matter most.

### 1. `arith-overflow` — unchecked addition

`current + amount` on two u64 values with `overflow-checks = true`. Panics
instead of wrapping.

The only PoC that needs account state, and the only one that produces a
**matched success/failure pair**: the same instruction handler, the same
account, one transaction that works and one that does not. Useful for diffing
two traces against each other.

```
tx 1  create vault (8 bytes, owned by the program)     -> ok
tx 2  [0x00] || u64::MAX-1   set balance               -> ok
tx 3  [0x01] || 1000         deposit, overflows        -> panic
```

### 2. `index-oob` — index out of bounds

`TIER_FEE_BPS[level]` where `level` comes straight from instruction data and
the table has four entries. Send `[0x09]`.

The faulting instruction is inside `core::panicking`, not in this file. A
debugger that reports only the innermost frame will point at `panicking.rs`
and tell the developer nothing. The correct answer is the caller,
`tier_for_level`.

### 3. `unwrap-none` — `Option::unwrap()` on `None`

Route lookup against a three-entry table; send `[0xFF]` for a route that is not
in it.

`lookup_route` is marked `#[inline]` and small enough that LLVM really does
inline it at opt-level 1. The DWARF records that as an inlined subroutine, so
the honest answer is a two-entry inline chain (`lookup_route` called from
`resolve_hops`), not a single line. Note that this information lives in
`.debug_info` — a slim build (see below) cannot reconstruct it.

### 4. `assert-invariant` — explicit invariant violation

A netting routine with a sign bug, checked by `assert_eq!` with a formatted
message. Send `[0x01, 0x02, 0x03, 0x04]`: the legs net to 0 but sum to 10.

This is the easy case and the one to get working first — our own code, our own
panic message, and a five-frame call chain to walk back:

```
process_instruction -> settle -> check_conservation
                             -> net_positions -> fold_leg
```

`[0x00, 0x00, 0x00, 0x00]` is the one payload that succeeds, if you want a
passing transaction through the same path.

### 5. `missing-signer` — failure without a panic

Returns `Err(VaultError::MissingAuthoritySignature)`, surfaced as `Custom(1)`.
Send the authority account as a non-signer.

Nothing aborts. The VM exits normally, no panic message is logged, and the
transaction still failed. There are three distinct `return Err` sites in
`authorize` and the developer needs to be told *which one* fired — the error
code alone does not distinguish them once a program has more than a handful.

### 6. `compute-exhaust` — the hard one

An unbounded caller-controlled loop. Send a `u32` LE round count of 40,000.

No panic message, no error code, and — measured on agave 3.1.10 — no program
counter either. The log line ends at:

```
Program ... failed: exceeded CUs meter at BPF instruction
```

with the instruction number omitted. There is nothing in the transaction
result to map. The location has to be recovered by replaying the transaction
and observing where the meter runs out, which is a genuinely harder problem
than parsing a log line, and worth knowing about before designing around it.

---

## Getting DWARF into a deployed program

Stock Solana builds ship zero debug information, and there are **two
independent mechanisms** throwing it away. Beating one is not enough.

### Both of these are required

```toml
# poc/Cargo.toml
[profile.release]
overflow-checks = true
opt-level = 1
lto = false
codegen-units = 16
debug = 2          # tell rustc to emit DWARF
strip = "none"     # stop cargo deleting it again at link time
```

`strip = "none"` is not redundant. Cargo injects `-C strip=debuginfo` whenever
the profile has `debug = 0`, which deletes the DWARF that `debug = 2` just
produced. Setting only `debug = 2` gets you nothing.

Setting `RUSTFLAGS` yourself does not work either — `cargo-build-sbf` discards
your `RUSTFLAGS` and substitutes its own.

### Deploy the right artifact

This is the trap that costs the most time. `cargo-build-sbf` writes **two**
copies of every program:

| Path | Debug info | Size |
|------|-----------|------|
| `target/deploy/<name>.so` | **none** — run through `strip.sh` | 24 KB |
| `target/sbpf-solana-solana/release/<name>.so` | full DWARF, 8 sections | 1.7 MB |

`target/deploy/` is the one every tutorial tells you to deploy, and it is
useless here. `build.sh` stages the unstripped copy into `artifacts/` for you.

### `--disable-remap-cwd`

Without it the compiler remaps `DW_AT_comp_dir` away and source lookup cannot
resolve the `.rs` files. With it you get an absolute path:

```
DW_AT_comp_dir : /home/you/projects/solana-debugger/poc
```

### Do not reach for `opt-level = 0`

The instinctive move to improve debuggability breaks sBPF — it overflows the
4 KB stack frame limit, `.text` grows ~2.4x, and you get *fewer* variables with
live locations, not more. `opt-level = 1` with LTO off is the sweet spot: more
line-table rows and more live variables than a fat-LTO release build, and no
stack errors.

---

## Full vs slim builds

Deploy rent is charged per byte and an upgradeable deploy reserves twice the
binary size. Full DWARF is 1.7 MB per program, so six of them cost roughly
**70 SOL** — free on localnet, impossible on devnet where airdrops are rate
limited to a few SOL a day.

`./build.sh --slim` strips everything except `.debug_line`:

| | Full | Slim |
|---|------|------|
| Size | 1.7 MB | 139 KB |
| PC → `file:line` | yes | ambiguous — see below |
| Variables, types, inline frames | yes | no |
| Cost for 6 programs | ~70 SOL | ~6 SOL |

The `.debug_line` program in DWARF 4 carries its own file and directory table,
so it does decode standalone — but **standalone is not sufficient to get the
right answer**, for the reason in the next section. Slim is the right choice
for a size-constrained deploy only if the consumer already handles that.

The deployment measured here used slim builds.

### `.debug_line` alone is ambiguous

`poc_index_oob.so` has 83 compile units. Address `0x178` is claimed by a line
row in **more than a dozen of them** — our `programs/index-oob/src/lib.rs:31`,
`core`'s `uint_macros.rs:1927`, `alloc`'s `alloc.rs:91`, and others. This is
the usual consequence of dead code elimination: the line programs of code the
linker removed keep addresses that now collide with live code.

Disambiguating requires knowing which compile unit actually owns an address,
which lives in `.debug_info` (`DW_AT_low_pc` / `DW_AT_high_pc` / `DW_AT_ranges`
— 31 of the 83 CUs here carry one) or in `.debug_aranges`. A slim build strips
both.

A consumer that merges every CU's line program into one flat address → location
map gets last-writer-wins and silently reports whichever CU happened to be
parsed last. Verified against this repo's own tracer: running it on the
`index-oob` failure produces 2,218 mapped rows and **not one of them is from
our source file** — every address our program owns was overwritten by a later
compile unit. `src/debugger/dwarf.rs` builds exactly such a flat
`BTreeMap<address, SourceLocation>`.

So: correct mapping needs CU-scoped lookup, which needs a full build. That is a
finding about the debugger, not about these programs — and surfacing it is what
the PoCs are for.

---

## Debug info changes the bytecode

Worth designing around: enabling debug information does not merely annotate the
binary, it perturbs codegen. Three builds of identical source produce three
different `.text` sections.

Debug info is therefore only valid against the exact artifact it was built
with, and that artifact will not hash-match a verifiable release build. Any
tool consuming these should refuse to load debug info against a mismatched
`.so` rather than display subtly wrong line numbers.

---

## Running them

### Prerequisites

- Solana CLI (tested on 3.1.10, platform-tools v1.52)
- Node 18+ for the client
- A local validator: `solana-test-validator --ledger test-ledger --reset`

### Three commands

```bash
cd poc

./build.sh               # full DWARF -- use this for debugger work
./deploy.sh              # writes program-ids.json

cd client
npm install
node send.mjs all        # writes ../signatures.json
```

`send.mjs` prints a signature, error and the tail of the logs for each
transaction, and takes a single PoC name if you want just one:

```bash
node send.mjs compute-exhaust
```

Add `--slim` to `build.sh` if deploy size is the binding constraint, but read
the ambiguity note above first — a slim deploy cannot support correct
CU-scoped line lookup.

Then feed a signature to the tracer:

```bash
cd ../..
make tracer TX=<signature from signatures.json>
```

### Why `skipPreflight: true` matters

Every failing transaction is sent with preflight disabled, deliberately. With
preflight on, the RPC node simulates the transaction first, rejects it locally,
and never puts it in a block — there is no signature to look up and nothing for
the debugger to fetch. Skipping preflight lands the failure on the ledger where
it can be replayed. If you write your own client for these, do the same.

### Targeting a different cluster

```bash
RPC=https://api.devnet.solana.com ./deploy.sh
RPC=https://api.devnet.solana.com node send.mjs all
```

Build `--slim` first — see the cost note above.

---

## Checking the DWARF is really there

```bash
# Should list 8 .debug_* sections (or 1 for a slim build)
readelf -S artifacts/poc_index_oob.so | grep debug_

# Should show your source lines against .text addresses
readelf --debug-dump=decodedline artifacts/poc_index_oob.so | grep -A5 'index-oob/src'

# Should be an absolute path (full builds only)
readelf --debug-dump=info artifacts/poc_index_oob.so | grep -m1 comp_dir
```

`build.sh` fails the build if any staged artifact comes out with zero debug
sections, so a silent regression in the recipe cannot slip through.

Note that `llvm-dwarfdump` is **not** shipped in platform-tools — use a system
copy or `readelf`. Present in `~/.cache/solana/<ver>/platform-tools/llvm/bin/`
are `lldb`, `llvm-objcopy`, `llvm-readelf`, `llvm-objdump`, `clang` and
`ld.lld`. There is also a `solana-lldb` wrapper there that preloads type
summaries for `Pubkey` and `AccountInfo` — worth reading before duplicating it.

---

## Ground truth for validating the debugger

The runtime's own panic handler reports a source location, derived from the
`file!()`/`line!()` macros rather than from DWARF. That makes it an independent
check on whatever the DWARF-based mapping produces — if the two disagree, the
mapping is wrong.

Measured on this deployment:

```
poc-arith-overflow    SBF program Panicked in programs/arith-overflow/src/lib.rs at 92:19
poc-index-oob         SBF program Panicked in programs/index-oob/src/lib.rs at 51:5
poc-unwrap-none       SBF program Panicked in programs/unwrap-none/src/lib.rs at 45:28
poc-assert-invariant  SBF program Panicked in programs/assert-invariant/src/lib.rs at 78:5
poc-missing-signer    custom program error: 0x1          (no location reported)
poc-compute-exhaust   exceeded CUs meter at BPF instruction   (no location reported)
```

All four panic locations land exactly on the marked bug lines. The last two
report no location at all, which is precisely the gap the debugger is for.

---

## Layout

```
poc/
├── Cargo.toml              workspace + the [profile.release] debug recipe
├── build.sh                builds, stages unstripped artifacts, verifies DWARF
├── deploy.sh               deploys, writes program-ids.json
├── artifacts/              deployable .so files (generated)
├── program-ids.json        deployed program IDs (generated)
├── signatures.json         transaction signatures (generated)
├── programs/
│   ├── arith-overflow/
│   ├── index-oob/
│   ├── unwrap-none/
│   ├── assert-invariant/
│   ├── missing-signer/
│   └── compute-exhaust/
└── client/
    └── send.mjs            sends the failing transactions
```
