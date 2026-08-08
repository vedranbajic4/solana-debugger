/**
 * build-corpus.ts — sample recent mainnet blocks into a replay test corpus.
 *
 * Usage:
 *   npm run corpus                    # refresh corpus.json
 *   npm run corpus -- --blocks 8      # sample more blocks (more diversity)
 *
 * Why this is a script and not a hand-written list: `surfnet_timeTravel` only
 * moves forward, so a fixed corpus stops being forkable once the local surfnet's
 * clock passes its slots. Regenerating from the current mainnet tip gives a
 * corpus that a freshly started surfnet can actually reach. corpus.json is
 * checked in so a verify run is reproducible in the meantime.
 *
 * Selection aims for spread, not volume: failed and successful txs, legacy and
 * v0, and a cap of two txs per program so one busy AMM can't dominate the
 * match rate.
 */

import { Connection, type VersionedTransactionResponse } from "@solana/web3.js";
import { writeFileSync } from "node:fs";

import { normalizeInstructions } from "./lib/decode.js";
import { CORPUS_PATH, type CorpusEntry, type CorpusFile } from "./lib/corpus.js";

const VOTE_PROGRAM = "Vote111111111111111111111111111111111111111";
const COMPUTE_BUDGET_PROGRAM = "ComputeBudget111111111111111111111111111111";

/** How many failed / successful txs to keep. Failed txs are the point of the tool. */
const WANT_FAILED = 12;
const WANT_SUCCESS = 8;
/** No more than this many txs sharing a primary program. */
const MAX_PER_PROGRAM = 2;
/**
 * A single busy block can fill the whole quota by itself, which would leave the
 * corpus sitting at one slot behind one leader. Cap the per-block take so the
 * entries spread across the sampled range.
 */
const MAX_PER_BLOCK = 4;
/**
 * A replay snapshots and seeds every account the tx touches, so a 200-account
 * aggregator route turns into hundreds of RPC round-trips. Cap it to keep a
 * 20-tx verify run to a few minutes.
 */
const MAX_ACCOUNTS = 64;

type Candidate = CorpusEntry & { primaryProgram: string; interest: number };

/**
 * How much a tx exercises the parts of the replay that can actually break.
 *
 * Picking purely by "cheapest to replay" fills the corpus with 3-account
 * arbitrage and oracle-crank bots — they replay fine and prove nothing. Token
 * movement is what `seedPreState` exists for, and a CPI is what the failing-
 * program attribution has to get right, so both are worth more than a small
 * account list.
 */
function interestScore(tx: VersionedTransactionResponse, accounts: number): number {
  const meta = tx.meta!;
  let score = 0;
  if ((meta.preTokenBalances ?? []).length > 0) score += 3;
  if ((meta.innerInstructions ?? []).length > 0) score += 2;
  if (accounts >= 10) score += 1;
  return score;
}

/** Blocks are sampled with gaps so we don't get 20 txs from one leader's slots. */
const SLOT_STRIDE = 37;

function primaryProgram(
  tx: VersionedTransactionResponse,
  failedIndex: number | null,
): string | null {
  const ixs = normalizeInstructions(tx);
  if (failedIndex !== null) {
    const failed = ixs[failedIndex];
    if (failed && failed.programId !== COMPUTE_BUDGET_PROGRAM) return failed.programId;
  }
  // Otherwise the last real instruction: for a swap wrapped in budget/ATA
  // setup, the tail is usually the program the tx exists to call.
  for (let i = ixs.length - 1; i >= 0; i--) {
    const id = ixs[i]!.programId;
    if (id !== COMPUTE_BUDGET_PROGRAM) return id;
  }
  return null;
}

function toCandidate(
  txLike: unknown,
  slot: number,
): Candidate | null {
  const tx = txLike as VersionedTransactionResponse;
  const meta = tx.meta;
  if (!meta) return null;

  const signature = tx.transaction.signatures[0];
  if (!signature) return null;

  const err = meta.err as Record<string, unknown> | null;
  const instructionError =
    err && typeof err === "object" && "InstructionError" in err
      ? (err["InstructionError"] as [number, unknown])
      : null;

  let ixs;
  try {
    ixs = normalizeInstructions(tx);
  } catch {
    // A v0 tx whose lookup tables the block response didn't resolve.
    return null;
  }
  if (ixs.length === 0) return null;
  if (ixs.some((ix) => ix.programId === VOTE_PROGRAM)) return null;

  const program = primaryProgram(tx, instructionError ? instructionError[0] : null);
  if (!program) return null;

  const message = tx.transaction.message;
  const accountKeys = message.getAccountKeys({
    accountKeysFromLookups: meta.loadedAddresses || null,
  });
  if (accountKeys.length > MAX_ACCOUNTS) return null;

  return {
    signature,
    slot,
    version: tx.version === "legacy" ? "legacy" : `v${tx.version}`,
    outcome: err ? "failed" : "success",
    err: err ? JSON.stringify(err) : null,
    computeUnits: Number(meta.computeUnitsConsumed ?? 0),
    accounts: accountKeys.length,
    instructions: ixs.length,
    program,
    primaryProgram: program,
    interest: interestScore(tx, accountKeys.length),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const blocksArg = args.indexOf("--blocks");
  const blockCount = blocksArg >= 0 ? Number(args[blocksArg + 1]) : 8;

  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) {
    console.error("RPC_URL environment variable is required");
    process.exit(1);
  }
  const mainnet = new Connection(rpcUrl, "confirmed");

  // Start a little behind the tip so every sampled slot is already confirmed
  // with full metadata, then walk backwards in strides.
  const tip = await mainnet.getSlot("confirmed");
  const start = tip - 40;

  const failed: Candidate[] = [];
  const success: Candidate[] = [];
  const perProgram = new Map<string, number>();
  const seen = new Set<string>();
  const sampledSlots: number[] = [];

  const take = (c: Candidate) => {
    const bucket = c.outcome === "failed" ? failed : success;
    const want = c.outcome === "failed" ? WANT_FAILED : WANT_SUCCESS;
    if (bucket.length >= want) return false;
    if (seen.has(c.signature)) return false;
    const used = perProgram.get(c.primaryProgram) ?? 0;
    if (used >= MAX_PER_PROGRAM) return false;
    perProgram.set(c.primaryProgram, used + 1);
    seen.add(c.signature);
    bucket.push(c);
    return true;
  };

  for (let b = 0; b < blockCount; b++) {
    if (failed.length >= WANT_FAILED && success.length >= WANT_SUCCESS) break;

    const slot = start - b * SLOT_STRIDE;
    process.stderr.write(`sampling slot ${slot} ... `);
    let block;
    try {
      block = await mainnet.getBlock(slot, {
        maxSupportedTransactionVersion: 0,
        transactionDetails: "full",
        rewards: false,
      });
    } catch (e) {
      process.stderr.write(`skipped (${(e as Error).message.slice(0, 60)})\n`);
      continue;
    }
    if (!block) {
      process.stderr.write("skipped (empty)\n");
      continue;
    }
    sampledSlots.push(slot);

    const candidates = block.transactions
      .map((t) => toCandidate(t, slot))
      .filter((c): c is Candidate => c !== null);

    // Failed txs first, then the ones that exercise the most machinery, and
    // only then the cheap ones — so a block's quota goes to real work.
    candidates.sort((a, b2) => {
      if (a.outcome !== b2.outcome) return a.outcome === "failed" ? -1 : 1;
      if (a.interest !== b2.interest) return b2.interest - a.interest;
      return a.accounts - b2.accounts;
    });

    let took = 0;
    for (const c of candidates) {
      if (took >= MAX_PER_BLOCK) break;
      if (take(c)) took++;
    }
    process.stderr.write(`${candidates.length} usable, took ${took}\n`);
  }

  const entries = [...failed, ...success].map(
    ({ primaryProgram: _p, interest: _i, ...e }) => e
  );

  const file: CorpusFile = {
    generatedAt: new Date().toISOString(),
    mainnetTip: tip,
    sampledSlots,
    entries,
  };
  writeFileSync(CORPUS_PATH, JSON.stringify(file, null, 2) + "\n");

  console.log(
    `\nwrote ${entries.length} entries to ${CORPUS_PATH} ` +
      `(${failed.length} failed, ${success.length} success)`
  );
  const programs = new Set(entries.map((e) => e.program));
  console.log(`${programs.size} distinct programs, slots ${Math.min(...sampledSlots)}-${tip}`);
  if (failed.length < WANT_FAILED || success.length < WANT_SUCCESS) {
    console.log(
      `note: wanted ${WANT_FAILED} failed / ${WANT_SUCCESS} success — ` +
        "re-run with --blocks <n> for a wider sample"
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
