# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small CLI toolkit for debugging Solana transactions: fetching a transaction from mainnet/devnet and printing a decoded post-mortem, and replaying a transaction against a local [Surfpool](https://github.com/txtx/surfpool) `surfnet` validator to compare original vs. replayed outcomes.

## Commands

The script list is in `package.json`; env vars are documented in `.env.example`. What neither file can tell you:

- **Flags need `--` first, or npm eats them**: `npm run fetch <SIG> -- --verbose`, `npm run verify -- --only failed`, `-- --limit 5`, `-- --json`. Without it the script never sees the flag.
- **`npm run replay` and `npm run verify` need a surfnet running locally** (`SURFNET_RPC`, default `http://127.0.0.1:8899`). Nothing starts one for you.
- **`npm run verify` is the closest thing to a test suite** — and the number that says whether anything else here means anything. See "Verifying the replay" below. The `test:*` scripts cover narrower pieces; `test:cpi` and `test:report` take `--live`/`--all` to run against the corpus instead of fixtures.
- **`ARCHIVE_RPC` unset is a supported configuration**, not a degraded one that needs apologising for in the code.

There is no build step — `tsx` runs the `.ts` files directly — and no lint script.

## Architecture

Every file except `lib/decode.ts` and `lib/surfnet.ts` opens with a header comment saying what it does and why — read those rather than duplicating them here.

| file | role |
|---|---|
| `fetch-tx.ts` | `npm run fetch` — decoded post-mortem, two-tier output |
| `replay-tx.ts` | `npm run replay` — printer over `lib/replay.ts` |
| `verify-replay.ts` | `npm run verify` — batch replay, match rate |
| `build-corpus.ts` | `npm run corpus` — samples mainnet blocks into `corpus.json` |
| `lib/replay.ts` | the replay pipeline; its step order is load-bearing |
| `lib/prestate.ts` | seeds the tx's recorded pre-state onto the fork |
| `lib/archive.ts` | historical account state from an archive RPC |
| `lib/nonce.ts` | durable-nonce detection and seeding |
| `lib/accounts.ts` | account snapshot and diff |
| `lib/cpi-tree.ts` | logs → call tree, self-CU, deepest failed frame |
| `lib/report.ts` | `DebugReport` — the conclusions as data |
| `lib/errors.ts` | resolves `Custom(n)` through a fallback chain |
| `lib/idl-cache.ts` | disk cache for on-chain IDL lookups, misses included |
| `lib/native-decoders.ts` | System/Token/Token-2022/ATA instruction decoding |
| `lib/summary.ts` | Anchor error and log-hint extraction |
| `lib/decode.ts` | legacy vs. v0 message normalization, address-lookup-table resolution |
| `lib/corpus.ts`, `lib/surfnet.ts` | shared corpus types; surfnet JSON-RPC helper |

Four directives that outlive any single file:

- **Keep `fetch-tx.ts`'s two tiers honest.** Everything the summary needs is computed in one GATHER block before any output, so detail sections reuse those values rather than recomputing. Anything that changes how much to *trust* the summary — the CPI-attribution caveat, truncated logs — is a `warning` row in the summary, never only behind `--verbose`. A section with nothing to say prints no header at all (an earlier version emitted an empty `TOKEN BALANCE DELTAS` whenever a tx merely touched token accounts).
- **Keep `replay-tx.ts` a printer.** Logic that lands there is logic `verify-replay.ts` can't measure.
- **Never guess at an error's meaning.** `lib/errors.ts` degrades to `source: "unknown"` rather than inventing one; when adding error data, extend `lib/program-errors.ts`/`lib/anchor-errors.ts` instead of guessing at the resolver layer. The same rule governs `findFailingProgramInLogs()` (see the CPI gotcha below) and `decodeNativeIx()`, which returns null on an unrecognised discriminant — a confident "Transfer 5 SOL" that's wrong is worse than no answer. `.idl-cache/` is gitignored and disposable; `pruneIdlCache()` throws it away if a cached IDL ever goes stale.
- **Keep `DebugReport` serializable.** No `bigint`/`Buffer`/`PublicKey`; u64 token amounts are decimal strings, because the report exists to survive JSON, disk, and a diff between runs.

### Fork fidelity: why `lib/prestate.ts` exists

Surfnet lazily pulls account state from mainnet as accounts are touched, and it pulls whatever mainnet holds *now* — historical state at a slot would need an archival RPC. So a replay of a tx from slot N starts from state that may be hours newer, and fails for reasons the original never hit (a since-drained token account reports "insufficient funds").

`seedPreState()` fixes this from the tx's own metadata, which the validator recorded at execution time: `preBalances` gives every account's lamports, `preTokenBalances` gives token amounts. Both are written back with the `surfnet_setAccount` cheatcode before simulating. Two ordering rules matter:

- **Read every account before seeding.** Reading is what triggers surfnet's lazy pull of the real mainnet account; seeding an untouched address first creates an empty System-owned shell that shadows it.
- **Take the diff baseline after seeding**, or the diff measures the seeding rather than the transaction.

Cheatcode details worth not rediscovering: `surfnet_setAccount(pubkey, update)` takes **hex** data (not base64), and partial updates **merge** — setting only `lamports` preserves data and owner. Token amounts are spliced into the existing account at offset 64 rather than rebuilt, so delegate/close-authority/Token-2022 extensions survive.

Three more behaviours in `seedPreState()`, each of which fixed a real class of spurious replay failure:

- **`lamports: 0` doesn't stick for a mainnet-backed account.** The write itself lands — the account goes absent — but absent is exactly what triggers surfnet's lazy pull, so the next read restores it from present-day mainnet, silently undoing the seed and any earlier seeding of that account. (It *does* stick for an account mainnet doesn't have: nothing to re-pull.) So zero pre-balances are skipped in the lamports pass.
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

### Gotcha: `surfnet_setAccount` reports a failed *remote fetch* as `AccountNotFound`

The cheatcode consults the remote before applying an update. When that request fails — rate limiting, a flaky endpoint, a hammered RPC during a long `verify` run — the error surfaced is:

```
AccountNotFound: pubkey=<addr>: error sending request for url (https://…)
```

which reads like "this account doesn't exist and cannot be created". It isn't. **`surfnet_setAccount` creates accounts that exist on no network perfectly well** (verified directly: three fresh keypair addresses, created and read back). The `error sending request for url` tail is the tell — a genuine absence doesn't need to send a request anywhere.

This matters because it inverts a design conclusion. Accounts closed since the transaction — the normal fate of a wSOL account, or any PDA closed for rent — **are** restorable, by both `seedPreState()`'s rebuild path and archive injection. Don't build around a limit that isn't there.

Both paths still record the failure and carry on rather than throwing, which remains right: transient RPC errors are exactly the kind of thing that shouldn't cost a whole replay. Preserve that.

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

ESM throughout, so relative imports must use `.js` extensions even though the source files are `.ts` (e.g. `import { normalizeInstructions } from "./lib/decode.js"`). `tsconfig.json` has the rest; its strictness flags mean index access and optional Solana RPC fields (e.g. `meta.preTokenBalances`) need explicit narrowing.
