# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small CLI toolkit for debugging Solana transactions: fetching a transaction from mainnet/devnet and printing a decoded post-mortem, and replaying a transaction against a local [Surfpool](https://github.com/txtx/surfpool) `surfnet` validator to compare original vs. replayed outcomes.

## Commands

```bash
npm run fetch <SIGNATURE>    # tsx --env-file=.env fetch-tx.ts <SIGNATURE>
npm run replay <SIGNATURE>   # tsx --env-file=.env replay-tx.ts <SIGNATURE>
```

Both scripts load env vars from `.env` (see `.env.example`):
- `RPC_URL` — mainnet/devnet RPC endpoint (required by both scripts).
- `SURFNET_RPC` — local surfnet validator JSON-RPC URL, defaults to `http://127.0.0.1:8899` (used only by `replay-tx.ts`; a surfnet instance must be running locally for replay to work).

There is no build step (`tsx` runs the `.ts` files directly), no lint script, and no test suite configured.

## Architecture

- **`fetch-tx.ts`** — entry point for `npm run fetch`. Fetches a `VersionedTransactionResponse`, then prints a series of sections (STATUS, RESOLVED ERROR, COMPUTE BUDGET, FEE, BALANCE DELTAS, TOKEN BALANCE DELTAS, LOG MESSAGES, TOP-LEVEL/INNER INSTRUCTIONS, ACCOUNT KEYS TOUCHED, RAW META). It's a linear script, not a library — new inspection sections get added inline in `main()`.
- **`replay-tx.ts`** — entry point for `npm run replay`. Fetches the tx from mainnet, calls `surfnet_timeTravel` to fork the local surfnet validator to the tx's slot, rebuilds a `VersionedTransaction` with dummy 64-byte signatures (we don't have the signer's key), and calls `simulateTransaction` with `sigVerify: false` to compare the original error/compute-units against the replayed ones.
- **`lib/decode.ts`** — `normalizeInstructions()` flattens legacy vs. v0 (versioned, with address-lookup-table support) transaction messages into one common `NormalizedIx[]` shape (`programId`, `accounts` with signer/writable flags, `dataBase64`). `decodeComputeBudgetIx()` decodes ComputeBudget111... instruction data by its first-byte discriminant.
- **`lib/errors.ts`** — `resolveCustomError(connection, programId, code)` resolves a raw `Custom(n)` instruction error through a fallback chain, from strongest to weakest evidence, and returns `{ source, ... }` rather than ever guessing:
  1. on-chain Anchor IDL for that exact program (`tryFetchAnchorIdl`, reads the `anchor:idl` seeded PDA account and zlib-inflates it)
  2. hand-maintained per-program tables in `lib/program-errors.ts` (`KNOWN_PROGRAM_ERRORS`, `PROGRAM_NAMES`)
  3. Anchor's reserved framework error range in `lib/anchor-errors.ts` (`ANCHOR_FRAMEWORK_ERRORS`, `isAnchorFrameworkRange`) — only a guess that the program *is* Anchor-based
  4. `source: "unknown"` with the hex code and a note — when adding new error data, extend `lib/program-errors.ts`/`lib/anchor-errors.ts` rather than inventing a guess at this layer.

  `findFailingProgramInLogs(logs, code)` in the same module decides *which* program the code should be resolved against — see the CPI gotcha below.
- **`lib/surfnet.ts`** — `surfnetCall(url, method, params)`, a thin JSON-RPC POST helper for surfnet-specific methods (e.g. `surfnet_timeTravel`) that aren't part of the standard Solana RPC and thus aren't on `@solana/web3.js`'s `Connection`.

### Gotcha: the `InstructionError` index is not the failing program

`meta.err`'s `InstructionError` index always points at a **top-level** instruction. When a program fails inside a CPI, that top-level program is the *caller*, not the culprit — resolving the custom code against the caller's IDL yields a confidently-wrong error name (both programs define a code 6004, and they mean different things).

The runtime logs `Program <id> failed: custom program error: 0x<code>` once per program on the stack as the error propagates upward, **innermost first**, so the *first* such line names the originating program. `findFailingProgramInLogs()` parses that and returns null when the logs are missing, truncated, or disagree with `meta.err` — in which case `fetch-tx.ts` falls back to the top-level program and prints a note saying the attribution may be wrong. Preserve that "degrade honestly, never guess" behaviour when touching this path.

## TypeScript/module conventions

- ESM throughout (`"type": "module"`, `module: "nodenext"`) — relative imports must use `.js` extensions even though the source files are `.ts` (e.g. `import { normalizeInstructions } from "./lib/decode.js"`).
- `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` are all on — index access and optional Solana RPC fields (e.g. `meta.preTokenBalances`) need explicit narrowing/defaults.
