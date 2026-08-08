# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small CLI toolkit for debugging Solana transactions: fetching a transaction from mainnet/devnet and printing a decoded post-mortem, and replaying a transaction against a local [Surfpool](https://github.com/txtx/surfpool) `surfnet` validator to compare original vs. replayed outcomes.

## Commands

```bash
npm run fetch <SIGNATURE>               # root-cause SUMMARY + what moved (~780 bytes)
npm run fetch <SIGNATURE> -- --verbose  # ...plus every detail section (~21KB)
npm run replay <SIGNATURE>              # replay against a local surfnet and diff state
npm run verify                          # replay the whole corpus, report the match rate
npm run corpus                          # regenerate corpus.json from recent mainnet blocks
npm run test:archive                    # check lib/archive.ts against a mock archive endpoint
npm run test:cpi -- --live              # check the log parser against the corpus
npm run test:report -- --all            # build a DebugReport for every corpus tx
```

Note the `--` before `--verbose`: without it npm consumes the flag itself and the script never sees it. Same for `npm run verify -- --only failed`, `-- --limit 5`, `-- -v`, `-- --json`.

All scripts load env vars from `.env` (see `.env.example`):
- `RPC_URL` — mainnet/devnet RPC endpoint (required by all of them).
- `SURFNET_RPC` — local surfnet validator JSON-RPC URL, defaults to `http://127.0.0.1:8899` (used by `replay-tx.ts` and `verify-replay.ts`; a surfnet instance must be running locally for replay to work).
- `ARCHIVE_RPC` — **optional** endpoint serving historical account state, see "Historical account state" below. Unset is a supported configuration, not a degraded one that needs apologising for in the code.

There is no build step (`tsx` runs the `.ts` files directly) and no lint script. `npm run verify` is the closest thing to a test suite — see "Verifying the replay" below. Typecheck with `npx tsc --noEmit`.

## Architecture

- **`fetch-tx.ts`** — entry point for `npm run fetch`. It's a linear script, not a library, with a deliberate two-tier output:
  - **Default (~780 bytes)**: the root-cause `SUMMARY`, then BALANCE/TOKEN DELTAS — what failed and what moved, nothing else. `main()` `return`s at the `if (!verbose)` boundary.
  - **`--verbose` (~21KB)**: everything after that boundary — STATUS, RESOLVED ERROR, COMPUTE BUDGET, FEE, LOG MESSAGES, TOP-LEVEL/INNER INSTRUCTIONS, ACCOUNT KEYS TOUCHED, RAW META.

  Three rules keep the tiers honest when adding sections. Everything the summary needs is computed in one GATHER block before any output, so detail sections reuse those values rather than recomputing. Anything that changes how much to *trust* the summary — the CPI-attribution caveat, truncated logs — is a `warning` row in the summary, never only in a hidden section. And a section with nothing to say prints no header at all (an earlier version emitted an empty `TOKEN BALANCE DELTAS` whenever a tx merely touched token accounts).
- **`lib/summary.ts`** — log-derived context for the summary. `parseAnchorError()` pulls the source `file:line`, the offending account/constraint, and the human-readable message out of Anchor's one-line `AnchorError` log (it has several shapes — `thrown in …`, `caused by account: …`, bare `occurred` — so every field is independently optional). `findLogHint()` covers non-Anchor programs by returning the last thing a program actually logged before the first failure line, skipping runtime bookkeeping and Anchor's `Instruction: …` dispatch trace.
- **`replay-tx.ts`** — entry point for `npm run replay`. A printer over `lib/replay.ts`: fetching, forking, seeding and simulating all live in the library, and this file only decides how to render the result. Keep it that way — logic that lands here is logic `verify-replay.ts` can't measure.
- **`lib/prestate.ts`** — `seedPreState()` writes the tx's recorded pre-execution balances back onto the fork via the `surfnet_setAccount` cheatcode, so the replay starts from the state the tx actually ran against. See "Fork fidelity" below — the ordering constraints here are load-bearing.
- **`lib/accounts.ts`** — the state-diff layer. `snapshotFromAccountInfo()`/`snapshotFromSimulated()` normalize an RPC `AccountInfo` and a `SimulatedTransactionAccountInfo` (whose `data` is a `[base64, "base64"]` tuple) into one `AccountSnapshot`, where `null` means "does not exist". `diffAccount()` returns null when nothing changed, else reports lamports/owner/data-length changes, a changed-byte count with first offset for opaque program state, and a decoded token-balance delta. `decodeTokenAccount()` is deliberately strict — it checks the owning program and, past 165 bytes, the Token-2022 `account_type` tag, since a mis-decode would print a confident fake balance.
- **`lib/decode.ts`** — `normalizeInstructions()` flattens legacy vs. v0 (versioned, with address-lookup-table support) transaction messages into one common `NormalizedIx[]` shape (`programId`, `accounts` with signer/writable flags, `dataBase64`). `decodeComputeBudgetIx()` decodes ComputeBudget111... instruction data by its first-byte discriminant.
- **`lib/errors.ts`** — `resolveCustomError(connection, programId, code)` resolves a raw `Custom(n)` instruction error through a fallback chain, from strongest to weakest evidence, and returns `{ source, ... }` rather than ever guessing:
  1. on-chain Anchor IDL for that exact program (`tryFetchAnchorIdl`, reads the `anchor:idl` seeded PDA account and zlib-inflates it)
  2. hand-maintained per-program tables in `lib/program-errors.ts` (`KNOWN_PROGRAM_ERRORS`, `PROGRAM_NAMES`)
  3. Anchor's reserved framework error range in `lib/anchor-errors.ts` (`ANCHOR_FRAMEWORK_ERRORS`, `isAnchorFrameworkRange`) — only a guess that the program *is* Anchor-based
  4. `source: "unknown"` with the hex code and a note — when adding new error data, extend `lib/program-errors.ts`/`lib/anchor-errors.ts` rather than inventing a guess at this layer.

  `findFailingProgramInLogs(logs, code)` in the same module decides *which* program the code should be resolved against — see the CPI gotcha below.
- **`lib/surfnet.ts`** — `surfnetCall(url, method, params)`, a thin JSON-RPC POST helper for surfnet-specific methods (e.g. `surfnet_timeTravel`) that aren't part of the standard Solana RPC and thus aren't on `@solana/web3.js`'s `Connection`.
- **`lib/replay.ts`** — the replay pipeline itself, shared by `replay-tx.ts` and `verify-replay.ts` so the measured match rate describes the code users actually run. `replayTransaction()` prints nothing and returns a `ReplayResult`; it throws `ReplayError` only when there's no outcome to compare at all (tx not found, no meta, the simulate call itself failed). The step order — fetch, fork, read-all, seed, snapshot, simulate — is load-bearing; see "Fork fidelity".
- **`lib/nonce.ts`** — durable-nonce support. `findDurableNonce()` recognises a tx whose *first* instruction is System `AdvanceNonceAccount` (only the first position counts to the runtime), and `seedNonceAccount()` writes the tx's nonce into the account so the tx's own "blockhash" validates. See the durable-nonce gotcha below.
- **`lib/corpus.ts`** — the `CorpusEntry`/`CorpusFile` types and `CORPUS_PATH`, shared by the corpus builder and the verifier.
- **`build-corpus.ts`** — entry point for `npm run corpus`. Samples recent mainnet blocks into `corpus.json`, capped at two txs per program and four per block so one busy AMM or one leader's slots can't dominate the match rate. Candidates are ranked by an `interestScore` — token movement and CPIs beat a small account list, because selecting purely for cheap replays fills the corpus with 3-account arbitrage bots that reproduce trivially and prove nothing.
- **`verify-replay.ts`** — entry point for `npm run verify`. See "Verifying the replay" below.
- **`lib/cpi-tree.ts`** — rebuilds the runtime's call tree from `meta.logMessages`. `meta.innerInstructions` says which CPIs ran but not how they went: compute consumed, what each program logged, and which frame actually failed live only in the logs. `selfCu` is a frame's consumption minus its children's, so "expensive" means the program's own work rather than its callees'. `deepestFailedFrame()` is the culprit — failure propagates outward, so every frame on the stack reports failed and only the innermost is the origin. Parsing is deliberately tolerant: truncated logs are the common case on exactly the transactions worth debugging, so an unclosed frame becomes `unterminated` rather than discarding the tree.
- **`lib/report.ts`** — `DebugReport`, the tool's conclusions about one transaction as data. Strictly serializable (base58 strings, decimal strings for u64 token amounts — no `bigint`/`Buffer`/`PublicKey`, since a report should survive JSON, disk, and a diff between runs). Confidence travels with the conclusion: `attribution.basis` records *how* the failing program was identified (`logs` = the runtime's innermost failure line, `top-level-instruction` = a guess that's wrong whenever the failure was inside a CPI), and `warnings` carries caveats a renderer must not bury.

### Fork fidelity: why `lib/prestate.ts` exists

Surfnet lazily pulls account state from mainnet as accounts are touched, and it pulls whatever mainnet holds *now* — historical state at a slot would need an archival RPC. So a replay of a tx from slot N starts from state that may be hours newer, and fails for reasons the original never hit (a since-drained token account reports "insufficient funds").

`seedPreState()` fixes this from the tx's own metadata, which the validator recorded at execution time: `preBalances` gives every account's lamports, `preTokenBalances` gives token amounts. Both are written back with the `surfnet_setAccount` cheatcode before simulating. Two ordering rules matter:

- **Read every account before seeding.** Reading is what triggers surfnet's lazy pull of the real mainnet account; seeding an untouched address first creates an empty System-owned shell that shadows it.
- **Take the diff baseline after seeding**, or the diff measures the seeding rather than the transaction.

Cheatcode details worth not rediscovering: `surfnet_setAccount(pubkey, update)` takes **hex** data (not base64), and partial updates **merge** — setting only `lamports` preserves data and owner. Token amounts are spliced into the existing account at offset 64 rather than rebuilt, so delegate/close-authority/Token-2022 extensions survive.

Three more behaviours in `seedPreState()`, each of which fixed a real class of spurious replay failure:

- **`lamports: 0` is unwritable.** Surfnet reads a zero balance as "this account is absent" and lazily re-pulls it from mainnet, silently undoing the seed (and any earlier seeding of that account). So zero pre-balances are skipped in the lamports pass.
- **Accounts the tx *creates* have to be emptied first.** A zero pre-balance means the account didn't exist yet, but the fork pulls present-day mainnet where it does — created by this very transaction. The replay then dies on "already in use" before reaching anything interesting. Step 3 resets those to a bare System-owned shell. It can't be emptied all the way (see above), so the shell keeps one lamport: `Allocate`/`Assign` only require empty data and a System owner and replay correctly, while `CreateAccount` rejects any account holding lamports and still fails. Only accounts that *exist on the fork* are reset — creating a shell where the fork has nothing would break the replay rather than fix it.
- **Rebuilt wrapped-SOL accounts need `is_native`.** A wSOL account is usually closed in the same tx that opens it, so by replay time mainnet has none to copy and `buildTokenAccount()` synthesises one. Without the `is_native` flag (`COption<u64>` at offset 109, holding the rent-exempt reserve) the Token program rejects `SyncNative` with "Instruction does not support non-native tokens". It's asserted on the splice path too, since the account on the fork may be one an earlier replay in the same session rebuilt without it.

What this does *not* restore is non-token program-owned data — oracle prices, open orders, a pool's internal accounting. Nothing in the tx metadata records it. In practice AMM pool reserves are themselves SPL token accounts, so `preTokenBalances` covers them, which is why swap replays reproduce. For the rest, `lib/archive.ts` can fetch it from an archive RPC when one is configured — see "Historical account state" below. Note that seeding **mutates the local fork**, by design.

### Historical account state: `lib/archive.ts`

The one thing metadata cannot give back. `seedPreState()` restores lamports and token amounts exactly because the validator recorded them, and nothing else — a pool's internal accounting, an oracle price, a tick array, an open-orders book all stay present-day. That is the entire residual cause of replay mismatches once the seeding bugs are fixed.

There is **no standard Solana RPC for "this account at slot N"**. The `slot` in a `getAccountInfo` response is when it was answered, not what it describes, and a normal endpoint ignores a slot passed in the config — verified against Helius, which happily returns present-day state. Some providers add it: Alchemy's Account Archive implements `getAccountInfo` with `slot` / `lastUpdateBeforeSlot` / `firstUpdateAfterSlot`, covering July 2025 onward. Set `ARCHIVE_RPC` to use one.

`lastUpdateBeforeSlot` is the parameter to use — the account as last written *before* the tx's slot, which is what the transaction read. `slot: N` would be ambiguous about writes made earlier within that same slot.

Two design points that are load-bearing:

- **The probe must catch an endpoint that *succeeds* wrongly.** An RPC ignoring the parameter returns present-day state, which would be injected as though it were historical — every replay quietly wrong while looking like it worked. So `probeArchive()` establishes support with a request a real archive must *reject*: `slot` together with `minContextSlot`, documented as mutually exclusive. An endpoint that accepts both is reading neither. Do not "simplify" this into a check that the call succeeds.
- **Archive first, metadata second.** The archive supplies opaque data; the tx's own metadata then corrects lamports and token amounts, which it knows exactly and the archive can miss (it answers as of the last write *before* the slot, so writes made earlier in the same slot are absent). `lib/replay.ts` re-reads the accounts after injecting so the metadata splice lands on archived data instead of silently overwriting it with the present-day copy read earlier.

Executable accounts are skipped: overwriting a loaded program's account with a data blob breaks the fork's loader for no benefit. Pinning programs at a historical version is a separate problem.

### Gotcha: `surfnet_setAccount` can update an account but never create one

It reads the account from the remote before applying the update and fails with `AccountNotFound` if mainnet doesn't have it. So **an account that existed at the tx's slot but has been closed since cannot be restored at all** — not by seeding, not by archive injection. This is the normal fate of a wSOL account (opened and closed in one tx) and of any PDA closed for rent.

Both paths therefore record the failure and carry on rather than throwing: one dead account shouldn't cost the whole replay. Preserve that — a thrown error here turns a mostly-good replay into no replay.

### Gotcha: `surfnet_timeTravel` only moves forward, and the clock lags wall time

A running surfnet's clock keeps advancing, and `surfnet_timeTravel` refuses to go backwards (`Cannot travel to past slot: target=…, current=…`). So a surfnet that has been up for a while can no longer reach any historical tx — in practice it passes a freshly captured corpus within about half an hour, which is why `corpus.json` is regenerated rather than hand-written.

When the tx's slot is unreachable, `forkToSlot()` in `lib/replay.ts` advances the clock to **now** instead, and this is a fix rather than a consolation prize. Surfnet's `unix_timestamp` drifts *behind* wall time (observed ~43 min), while the accounts it lazily pulls are from mainnet right now. A program comparing an account's stored timestamp against the clock then sees state from its own future and refuses to run: Orca Whirlpool's `InvalidTimestamp` (6022) killed every Whirlpool swap in the corpus before it executed a single instruction. Moving the clock forward doesn't make the replay historical, but it makes it *self-consistent* — clock and account state from the same moment.

Two surprises in that API: the variants are `absoluteSlot` / `absoluteEpoch` / `absoluteTimestamp`, and `absoluteTimestamp` is compared against a **millisecond** clock (`Cannot travel to past timestamp: target=1786194594, current=1786192005800`), so seconds always read as a request to travel backwards. Writing the Clock sysvar with `surfnet_setAccount` appears to work but doesn't stick — the validator regenerates the sysvar each slot; use `timeTravel`.

The residual risk is unchanged: a program checking a deadline or expiry against the *transaction's* time still behaves differently, and only a **freshly started** surfpool forked at or below the target slot fixes that.

### Gotcha: `replaceRecentBlockhash` breaks durable-nonce transactions

A replay can't reuse the tx's own blockhash, so `simulateTransaction` is normally called with `replaceRecentBlockhash: true`. For a durable-nonce transaction that quietly destroys it: the `recentBlockhash` field isn't a blockhash at all, it's the nonce stored in the nonce account, and the runtime validates the two against each other. Overwrite it and the tx is rejected before execution with `BlockhashNotFound` and 0 CU — a result that says nothing about the transaction and everything about how it was run.

`lib/replay.ts` seeds the nonce account to match the tx instead and leaves the blockhash alone (`replaceRecentBlockhash` off for exactly those txs). This is not an edge case: bots use durable nonces heavily, and it was **6 of the 12 failed transactions** in the first corpus. The nonce account layout is `Versions(u32) + State(u32) + authority(32) + durable_nonce(32) + lamports_per_signature(u64)` = 80 bytes, so the nonce goes at offset 40.

### Gotcha: a failed simulation returns no post-state

The validator only returns `accounts` for a simulation that succeeded — a failed tx is rolled back, so `sim.value.accounts` is null and there is no diff to show. Since this tool exists mainly to debug *failed* transactions, that's the common path: `replay-tx.ts` falls back to printing `STATE AT FORK`, the pre-state the program actually read on its way to failing. Don't mistake the null for "the `accounts` config isn't supported" — surfnet does honour it on success.

### Gotcha: the `InstructionError` index is not the failing program

`meta.err`'s `InstructionError` index always points at a **top-level** instruction. When a program fails inside a CPI, that top-level program is the *caller*, not the culprit — resolving the custom code against the caller's IDL yields a confidently-wrong error name (both programs define a code 6004, and they mean different things).

The runtime logs `Program <id> failed: custom program error: 0x<code>` once per program on the stack as the error propagates upward, **innermost first**, so the *first* such line names the originating program. `findFailingProgramInLogs()` parses that and returns null when the logs are missing, truncated, or disagree with `meta.err` — in which case `fetch-tx.ts` falls back to the top-level program and prints a note saying the attribution may be wrong. Preserve that "degrade honestly, never guess" behaviour when touching this path.

## Verifying the replay

`npm run verify` replays every transaction in `corpus.json` through the same `lib/replay.ts` used by `npm run replay` and reports how often the fork lands on mainnet's outcome. Every other feature in this tool reads state off the fork and reasons about it, so all of it is worthless if the fork doesn't reproduce the transaction — this is the number that says whether the rest means anything.

It runs **sequentially on purpose**: replays share one surfnet and seeding writes to it, so overlapping runs would seed over each other's state.

Read the split, not the headline. Reproducing a *failure* is the harder half and the whole point of the tool, so `failed` is the number that matters; a flattering overall rate can hide it. As measured on the checked-in corpus (20 txs, 12 failed / 8 successful, mainnet slots ~437,995,600):

| | before | after |
|---|---|---|
| overall | 40.0% | **60.0%** | 
| failed | 33.3% | **50.0%** |
| success | 50.0% | **75.0%** |

The gain came entirely from fixing the three seeding/simulation bugs documented in the gotchas above — durable nonces, accounts the tx creates, and wSOL `is_native` — each found by reading the mismatches rather than by guessing.

Two things to expect when interpreting a run:

- **The number is noisy.** Replays pull present-day account state, which keeps moving, so the same corpus can score differently minutes apart. Treat a few points of movement as noise and look at the mismatch list.
- **The fork accumulates.** Seeding mutates it and nothing rolls back between transactions, so a long verify run drifts from a fresh surfpool. A clean measurement wants a freshly started one.

The remaining mismatches are all the *same* residual cause: program-owned state that no transaction metadata records — AMM pool internals, oracle prices, a bin array's accounting. An arbitrage bot replayed against present-day reserves takes a different branch and returns a different one of its own error codes (`Custom 1006` vs `1004`), or runs out of compute exploring further than it did on mainnet. Fixing that class needs real historical account state, which is what `ARCHIVE_RPC` and `lib/archive.ts` are for. **The numbers above were measured with `archive off`** — re-measure with an archive configured before treating them as the ceiling.

## TypeScript/module conventions

- ESM throughout (`"type": "module"`, `module: "nodenext"`) — relative imports must use `.js` extensions even though the source files are `.ts` (e.g. `import { normalizeInstructions } from "./lib/decode.js"`).
- `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` are all on — index access and optional Solana RPC fields (e.g. `meta.preTokenBalances`) need explicit narrowing/defaults.
