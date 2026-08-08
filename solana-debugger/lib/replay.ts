/**
 * lib/replay.ts
 *
 * The replay pipeline, extracted from `replay-tx.ts` so that both the CLI and
 * the batch verifier (`verify-replay.ts`) run the *same* code — a match rate
 * measured against a reimplementation would only prove the reimplementation
 * agrees with itself.
 *
 * The pipeline, in the order the steps have to happen:
 *   1. fetch the tx from mainnet
 *   2. fork the local surfnet to its slot (best-effort — see the clock gotcha)
 *   3. read every account, which is what makes surfnet lazily pull real state
 *   4. seed the tx's recorded pre-state over the top
 *   5. snapshot the writable accounts — the diff baseline, taken *after* seeding
 *   6. simulate with sigVerify off, asking for the same accounts back
 *
 * This module prints nothing. It returns what happened and lets the caller
 * decide how loud to be about it.
 */

import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import type {
  AccountInfo,
  SimulatedTransactionAccountInfo,
  VersionedMessage,
  VersionedTransactionResponse,
} from "@solana/web3.js";

import {
  diffAccount,
  snapshotFromAccountInfo,
  snapshotFromSimulated,
  type AccountDiff,
} from "./accounts.js";
import {
  fetchAccountsBeforeSlot,
  injectHistoricalState,
  probeArchive,
  type ArchiveProbe,
  type InjectionReport,
} from "./archive.js";
import { findDurableNonce, seedNonceAccount, type DurableNonceInfo } from "./nonce.js";
import { seedPreState, type SeedReport } from "./prestate.js";
import { surfnetCall } from "./surfnet.js";

/** getMultipleAccounts caps out at 100 addresses per call. */
const MAX_ACCOUNTS_PER_FETCH = 100;

/**
 * Why a replay produced no comparable outcome. Kept separate from "the outcome
 * differed" so a batch run can tell a real reproduction failure apart from a tx
 * the RPC never handed us.
 */
export type ReplayFailure =
  | { kind: "not-found"; detail: string }
  | { kind: "no-meta"; detail: string }
  | { kind: "simulate-failed"; detail: string };

export type ReplayResult = {
  signature: string;
  slot: number;
  version: string;
  /** Whether `surfnet_timeTravel` actually reached the tx's slot. */
  clockForked: boolean;
  /** Populated when the fork was refused; the Clock sysvar is then present-day. */
  clockWarning: string | null;
  seed: SeedReport;
  /**
   * Set when the tx is a durable-nonce transaction: its blockhash was kept and
   * the nonce account seeded to match, instead of the usual blockhash swap.
   */
  nonce: { info: DurableNonceInfo; seeded: boolean; detail: string } | null;
  /**
   * How the fork got its opaque program-owned state. `off` means no archive was
   * configured and the replay ran on present-day data — the honest default, not
   * a failure.
   */
  archive:
    | { status: "off" }
    | { status: "unsupported"; reason: string }
    | { status: "injected"; report: InjectionReport; fetchErrors: string[] };
  originalErr: unknown;
  replayedErr: unknown;
  /** Deep equality of the two errors — null vs null counts as a match. */
  match: boolean;
  originalComputeUnits: number;
  replayedComputeUnits: number | null;
  replayedLogs: string[];
  /** Addresses snapshotted, in the same order as `preSnapshots`. */
  writable: PublicKey[];
  preSnapshots: (AccountInfo<Buffer> | null)[];
  /**
   * null when the replay failed: the validator rolls a failed simulation back
   * and returns no post-state, so there is nothing to diff. `preSnapshots` is
   * then the interesting half — the state the program read on its way down.
   */
  diffs: AccountDiff[] | null;
};

async function getManyAccounts(connection: Connection, keys: PublicKey[]) {
  const out: (AccountInfo<Buffer> | null)[] = [];
  for (let i = 0; i < keys.length; i += MAX_ACCOUNTS_PER_FETCH) {
    const chunk = keys.slice(i, i + MAX_ACCOUNTS_PER_FETCH);
    out.push(...(await connection.getMultipleAccountsInfo(chunk, "processed")));
  }
  return out;
}

/**
 * Runs one transaction against the fork.
 *
 * Throws `ReplayError` when there is no outcome to compare at all; a
 * transaction that simply replayed *differently* comes back as a normal result
 * with `match: false`.
 *
 * Note this mutates the local fork by design: seeding writes the tx's pre-state
 * onto it via cheatcodes.
 */
export async function replayTransaction(opts: {
  mainnet: Connection;
  surfnet: Connection;
  surfnetUrl: string;
  signature: string;
  /** Optional archive RPC serving historical account state (see lib/archive.ts). */
  archiveUrl?: string | undefined;
}): Promise<ReplayResult> {
  const { mainnet, surfnet, surfnetUrl, signature, archiveUrl } = opts;

  const tx = await mainnet.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
  if (!tx) {
    throw new ReplayError({
      kind: "not-found",
      detail: "transaction not found — older than the RPC's retention window?",
    });
  }
  if (!tx.meta) {
    throw new ReplayError({ kind: "no-meta", detail: "transaction found but meta is null" });
  }

  const clock = await forkToSlot(surfnetUrl, tx.slot);

  // We don't have the signer's private key, so build with dummy sigs and tell
  // simulateTransaction to skip verification.
  const message = tx.transaction.message as VersionedMessage;
  const dummySigs = Array.from(
    { length: message.header.numRequiredSignatures },
    () => new Uint8Array(64)
  );
  const vtx = new VersionedTransaction(message, dummySigs);

  const accountKeys = message.getAccountKeys({
    accountKeysFromLookups: tx.meta.loadedAddresses || null,
  });

  // Only writable accounts can change, so they're the only ones worth
  // snapshotting — and staying at or below the tx's own account count keeps us
  // under the RPC's cap on `accounts.addresses`.
  const writable: PublicKey[] = [];
  const allKeys: PublicKey[] = [];
  for (let i = 0; i < accountKeys.length; i++) {
    const key = accountKeys.get(i)!;
    allKeys.push(key);
    if (message.isAccountWritable(i)) writable.push(key);
  }

  // Read every account first: that's what makes surfnet lazily pull the real
  // mainnet state. Seeding an untouched address before this would shadow it
  // with an empty System-owned shell.
  const warmed = await getManyAccounts(surfnet, allKeys);

  // Historical state first, metadata second. The archive supplies the opaque
  // program-owned data nothing else can (pool internals, oracle prices), and
  // the tx's own metadata then corrects lamports and token amounts to their
  // exact values at execution time — the archive answers as of the last write
  // *before* this slot, which can miss writes made earlier in the same slot.
  const archive = await applyArchive(archiveUrl, surfnetUrl, allKeys, tx.slot, warmed);

  // Re-read after injecting, so the metadata seeding splices into the archived
  // data rather than the present-day copy read above and silently undoing it.
  const current =
    archive.status === "injected" ? await getManyAccounts(surfnet, allKeys) : warmed;

  const seed = await seedPreState(surfnetUrl, tx, accountKeys, current);

  // A durable-nonce tx carries its nonce where the blockhash goes, and the
  // runtime checks it against the nonce account. Swapping in a fresh blockhash
  // would break that check before the tx ever runs, so seed the account to
  // match the tx instead and leave its "blockhash" alone.
  const nonceInfo = findDurableNonce(tx);
  let nonce: ReplayResult["nonce"] = null;
  if (nonceInfo) {
    const index = allKeys.findIndex((k) => k.toBase58() === nonceInfo.account);
    const seeded = await seedNonceAccount(
      surfnetUrl,
      nonceInfo,
      index >= 0 ? (current[index] ?? null) : null
    );
    nonce = seeded.seeded
      ? {
          info: nonceInfo,
          seeded: true,
          detail: seeded.rebuilt ? "rebuilt (no usable account on the fork)" : "spliced",
        }
      : { info: nonceInfo, seeded: false, detail: seeded.reason };
  }

  // Baseline for the diff, read *after* seeding: this is the true pre-state.
  const preSnapshots = await getManyAccounts(surfnet, writable);

  let sim;
  try {
    sim = await surfnet.simulateTransaction(vtx, {
      sigVerify: false,
      // Old blockhash is long gone — except for a nonce tx, where the field
      // isn't a blockhash and replacing it is what breaks the replay.
      replaceRecentBlockhash: nonce?.seeded !== true,
      commitment: "processed",
      accounts: {
        encoding: "base64",
        addresses: writable.map((k) => k.toBase58()),
      },
    });
  } catch (e) {
    throw new ReplayError({ kind: "simulate-failed", detail: (e as Error).message });
  }

  const postInfos = sim.value.accounts as (SimulatedTransactionAccountInfo | null)[] | null;
  const diffs = postInfos
    ? writable
        .map((key, i) =>
          diffAccount(
            key.toBase58(),
            snapshotFromAccountInfo(preSnapshots[i] ?? null),
            snapshotFromSimulated(postInfos[i])
          )
        )
        .filter((d): d is AccountDiff => d !== null)
    : null;

  return {
    signature,
    slot: tx.slot,
    version: tx.version === "legacy" ? "legacy" : `v${tx.version}`,
    clockForked: clock.forked,
    clockWarning: clock.warning,
    seed,
    nonce,
    archive,
    originalErr: tx.meta.err,
    replayedErr: sim.value.err,
    match: JSON.stringify(tx.meta.err) === JSON.stringify(sim.value.err),
    originalComputeUnits: Number(tx.meta.computeUnitsConsumed ?? 0),
    replayedComputeUnits: sim.value.unitsConsumed ?? null,
    replayedLogs: sim.value.logs ?? [],
    writable,
    preSnapshots,
    diffs,
  };
}

export class ReplayError extends Error {
  constructor(readonly failure: ReplayFailure) {
    super(failure.detail);
    this.name = "ReplayError";
  }
}

/**
 * Probes are cached per endpoint: a verify run replays the whole corpus against
 * one archive, and the answer can't change mid-run.
 */
const archiveProbes = new Map<string, Promise<ArchiveProbe>>();

/**
 * Pulls the accounts as they were before this tx and writes them onto the fork.
 *
 * Every failure mode here degrades to "replay on present-day state" rather than
 * to a wrong answer, and says which happened. Injecting present-day state while
 * claiming it's historical would be worse than not injecting at all — the whole
 * point of this layer is to make the fork's state trustworthy.
 */
async function applyArchive(
  archiveUrl: string | undefined,
  surfnetUrl: string,
  keys: PublicKey[],
  slot: number,
  warmed: (AccountInfo<Buffer> | null)[],
): Promise<ReplayResult["archive"]> {
  if (!archiveUrl) return { status: "off" };

  let probe = archiveProbes.get(archiveUrl);
  if (!probe) {
    probe = probeArchive(archiveUrl, slot);
    archiveProbes.set(archiveUrl, probe);
  }
  const support = await probe;
  if (!support.supported) return { status: "unsupported", reason: support.reason };

  const addresses = keys.map((k) => k.toBase58());
  const { accounts, errors } = await fetchAccountsBeforeSlot(archiveUrl, addresses, slot);

  const current = new Map<string, AccountInfo<Buffer> | null>();
  addresses.forEach((address, i) => current.set(address, warmed[i] ?? null));

  const report = await injectHistoricalState(surfnetUrl, accounts, current);
  return { status: "injected", report, fetchErrors: errors };
}

type TimeTravelResponse = { error?: { message?: string; data?: string } };

/**
 * Points the fork's clock at the tx's slot, or failing that, at the present.
 *
 * The fallback isn't a consolation prize — it fixes a whole class of spurious
 * failures. `surfnet_timeTravel` only moves forward, so a surfnet that has been
 * up a while can't reach the tx's slot and its clock sits wherever it drifted
 * to, typically *behind* wall time. Meanwhile the accounts it lazily pulls are
 * from mainnet right now. A program that compares an account's stored timestamp
 * against the clock then sees state from its own future and refuses to run:
 * Orca Whirlpool's `InvalidTimestamp` (6022) is the one that showed up across
 * the corpus, killing swaps before they executed a single instruction.
 *
 * Moving the clock to now doesn't make the replay historical, but it does make
 * it *self-consistent* — clock and account state from the same moment — which
 * is the best available until the fork can be given real historical accounts.
 */
async function forkToSlot(
  surfnetUrl: string,
  slot: number
): Promise<{ forked: boolean; warning: string | null }> {
  const travel = (await surfnetCall(surfnetUrl, "surfnet_timeTravel", [
    { absoluteSlot: slot },
  ])) as TimeTravelResponse;

  if (!travel?.error) return { forked: true, warning: null };

  const detail = travel.error.data ?? travel.error.message ?? JSON.stringify(travel.error);

  // Note the units: surfnet compares `absoluteTimestamp` against a millisecond
  // clock, so seconds here would always look like a request to travel backwards.
  const align = (await surfnetCall(surfnetUrl, "surfnet_timeTravel", [
    { absoluteTimestamp: Date.now() },
  ])) as TimeTravelResponse;

  const aligned = !align?.error;
  return {
    forked: false,
    warning:
      `could not fork to slot ${slot}: ${detail}` +
      (aligned
        ? " — advanced the clock to now instead, matching the present-day account state"
        : " — and could not advance the clock to now either"),
  };
}
