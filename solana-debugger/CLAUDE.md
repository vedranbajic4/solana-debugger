# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small CLI toolkit for debugging Solana transactions: fetching a transaction from mainnet/devnet and printing a decoded post-mortem, and replaying a transaction against a local [Surfpool](https://github.com/txtx/surfpool) `surfnet` validator to compare original vs. replayed outcomes.

## Commands

```bash
npm run fetch <SIGNATURE>               # root-cause SUMMARY + what moved (~780 bytes)
npm run fetch <SIGNATURE> -- --verbose  # ...plus every detail section (~21KB)
npm run replay <SIGNATURE>              # replay against a local surfnet and diff state
```

Note the `--` before `--verbose`: without it npm consumes the flag itself and the script never sees it.

Both scripts load env vars from `.env` (see `.env.example`):
- `RPC_URL` — mainnet/devnet RPC endpoint (required by both scripts).
- `SURFNET_RPC` — local surfnet validator JSON-RPC URL, defaults to `http://127.0.0.1:8899` (used only by `replay-tx.ts`; a surfnet instance must be running locally for replay to work).

There is no build step (`tsx` runs the `.ts` files directly), no lint script, and no test suite configured.

## Architecture

- **`fetch-tx.ts`** — entry point for `npm run fetch`. It's a linear script, not a library, with a deliberate two-tier output:
  - **Default (~780 bytes)**: the root-cause `SUMMARY`, then BALANCE/TOKEN DELTAS — what failed and what moved, nothing else. `main()` `return`s at the `if (!verbose)` boundary.
  - **`--verbose` (~21KB)**: everything after that boundary — STATUS, RESOLVED ERROR, COMPUTE BUDGET, FEE, LOG MESSAGES, TOP-LEVEL/INNER INSTRUCTIONS, ACCOUNT KEYS TOUCHED, RAW META.

  Three rules keep the tiers honest when adding sections. Everything the summary needs is computed in one GATHER block before any output, so detail sections reuse those values rather than recomputing. Anything that changes how much to *trust* the summary — the CPI-attribution caveat, truncated logs — is a `warning` row in the summary, never only in a hidden section. And a section with nothing to say prints no header at all (an earlier version emitted an empty `TOKEN BALANCE DELTAS` whenever a tx merely touched token accounts).
- **`lib/summary.ts`** — log-derived context for the summary. `parseAnchorError()` pulls the source `file:line`, the offending account/constraint, and the human-readable message out of Anchor's one-line `AnchorError` log (it has several shapes — `thrown in …`, `caused by account: …`, bare `occurred` — so every field is independently optional). `findLogHint()` covers non-Anchor programs by returning the last thing a program actually logged before the first failure line, skipping runtime bookkeeping and Anchor's `Instruction: …` dispatch trace.
- **`replay-tx.ts`** — entry point for `npm run replay`. Fetches the tx from mainnet, calls `surfnet_timeTravel` to fork the local surfnet validator to the tx's slot, rebuilds a `VersionedTransaction` with dummy 64-byte signatures (we don't have the signer's key), and calls `simulateTransaction` with `sigVerify: false` to compare the original error/compute-units against the replayed ones. It also snapshots every **writable** account before simulating and passes those same addresses as `accounts` in the simulate config, so the post-state comes back in the same response — then diffs the two.
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

### Fork fidelity: why `lib/prestate.ts` exists

Surfnet lazily pulls account state from mainnet as accounts are touched, and it pulls whatever mainnet holds *now* — historical state at a slot would need an archival RPC. So a replay of a tx from slot N starts from state that may be hours newer, and fails for reasons the original never hit (a since-drained token account reports "insufficient funds").

`seedPreState()` fixes this from the tx's own metadata, which the validator recorded at execution time: `preBalances` gives every account's lamports, `preTokenBalances` gives token amounts. Both are written back with the `surfnet_setAccount` cheatcode before simulating. Two ordering rules matter:

- **Read every account before seeding.** Reading is what triggers surfnet's lazy pull of the real mainnet account; seeding an untouched address first creates an empty System-owned shell that shadows it.
- **Take the diff baseline after seeding**, or the diff measures the seeding rather than the transaction.

Cheatcode details worth not rediscovering: `surfnet_setAccount(pubkey, update)` takes **hex** data (not base64), and partial updates **merge** — setting only `lamports` preserves data and owner. Token amounts are spliced into the existing account at offset 64 rather than rebuilt, so delegate/close-authority/Token-2022 extensions survive.

What this does *not* restore is non-token program-owned data — oracle prices, open orders, a pool's internal accounting. Nothing records it. In practice AMM pool reserves are themselves SPL token accounts, so `preTokenBalances` covers them, which is why swap replays reproduce. Note that seeding **mutates the local fork**, by design.

### Gotcha: `surfnet_timeTravel` only moves forward

A running surfnet's clock keeps advancing in real time, and `surfnet_timeTravel` refuses to go backwards (`Cannot travel to past slot: target=…, current=…`). So a surfnet that has been up for a while can no longer reach any historical tx. `replay-tx.ts` warns and continues rather than failing, because `seedPreState()` restores the balances a replay actually depends on — both known test transactions reproduce exactly with a present-day clock. The residual risk is the Clock sysvar: a program checking a deadline or expiry will behave differently, and only a **freshly started** surfpool forked at or below the target slot fixes that.

### Gotcha: a failed simulation returns no post-state

The validator only returns `accounts` for a simulation that succeeded — a failed tx is rolled back, so `sim.value.accounts` is null and there is no diff to show. Since this tool exists mainly to debug *failed* transactions, that's the common path: `replay-tx.ts` falls back to printing `STATE AT FORK`, the pre-state the program actually read on its way to failing. Don't mistake the null for "the `accounts` config isn't supported" — surfnet does honour it on success.

### Gotcha: the `InstructionError` index is not the failing program

`meta.err`'s `InstructionError` index always points at a **top-level** instruction. When a program fails inside a CPI, that top-level program is the *caller*, not the culprit — resolving the custom code against the caller's IDL yields a confidently-wrong error name (both programs define a code 6004, and they mean different things).

The runtime logs `Program <id> failed: custom program error: 0x<code>` once per program on the stack as the error propagates upward, **innermost first**, so the *first* such line names the originating program. `findFailingProgramInLogs()` parses that and returns null when the logs are missing, truncated, or disagree with `meta.err` — in which case `fetch-tx.ts` falls back to the top-level program and prints a note saying the attribution may be wrong. Preserve that "degrade honestly, never guess" behaviour when touching this path.

## TypeScript/module conventions

- ESM throughout (`"type": "module"`, `module: "nodenext"`) — relative imports must use `.js` extensions even though the source files are `.ts` (e.g. `import { normalizeInstructions } from "./lib/decode.js"`).
- `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` are all on — index access and optional Solana RPC fields (e.g. `meta.preTokenBalances`) need explicit narrowing/defaults.
