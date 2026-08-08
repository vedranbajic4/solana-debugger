/**
 * lib/counterfactual.ts
 *
 * "What would have made this work?"
 *
 * The rest of the tool explains the failure that happened. This one changes a
 * single variable, re-runs the transaction against the fork, and reports
 * whether the outcome moved — turning a diagnosis into a testable claim. A rule
 * saying "you ran out of compute" is an opinion; the same transaction
 * succeeding with a higher limit and failing without it is evidence.
 *
 * Three things keep the answers honest:
 *
 * - **The baseline must reproduce first.** If the unmodified replay doesn't
 *   land on mainnet's error, then "more compute fixed it" is a statement about
 *   the fork, not about the transaction. Every result is gated on that and the
 *   whole battery reports `unreliable` when it fails.
 * - **One variable at a time, re-seeded between runs.** Seeding mutates the
 *   fork and nothing rolls back, so a second perturbation applied on top of the
 *   first would measure the pair. Each run re-seeds from the tx's own metadata.
 * - **A perturbation that can't be applied says so** rather than silently
 *   running an unmodified transaction and reporting "no change", which would
 *   read as a ruled-out hypothesis when nothing was tested.
 *
 * These are deliberately blunt instruments — 10x the tokens, 1.4M compute. The
 * question is which *dimension* matters, not the exact threshold; once a
 * dimension is identified the precise number is a bisect away.
 */

import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import type { VersionedMessage, VersionedTransactionResponse } from "@solana/web3.js";
import bs58 from "bs58";

import { decodeTokenAccount, snapshotFromAccountInfo } from "./accounts.js";
import { normalizeInstructions } from "./decode.js";
import { seedPreState } from "./prestate.js";
import { surfnetCall } from "./surfnet.js";

const COMPUTE_BUDGET_PROGRAM = "ComputeBudget111111111111111111111111111111";
/** The per-transaction ceiling the runtime allows. */
const MAX_COMPUTE_UNITS = 1_400_000;
/** Generous top-up for the "what if they had more money" probes. */
const LAMPORT_TOP_UP = 10_000_000_000; // 10 SOL
const TOKEN_MULTIPLIER = 10n;
/** How far the clock probe jumps, in milliseconds. */
const CLOCK_JUMP_MS = 60 * 60 * 1000;
/** SetComputeUnitLimit: u8 discriminant 2, then a u32 LE limit. */
const SET_CU_LIMIT_DISCRIMINANT = 2;
const TOKEN_AMOUNT_OFFSET = 64;

export type CounterfactualOutcome =
  /** The transaction succeeded where the original failed. */
  | "fixed"
  /** Same error as the baseline — this dimension isn't the cause. */
  | "unchanged"
  /** A different failure: it got further, or somewhere else. */
  | "different-error"
  /** The perturbation didn't apply to this transaction; nothing was tested. */
  | "not-applicable";

export type CounterfactualResult = {
  id: string;
  label: string;
  outcome: CounterfactualOutcome;
  /** What was actually changed, or why it couldn't be. */
  detail: string;
  err: unknown;
  computeUnits: number | null;
  /** Compute relative to the baseline run, when both produced a number. */
  computeDelta: number | null;
};

export type CounterfactualReport = {
  signature: string;
  /** The unmodified replay. Everything below is only meaningful if this matched. */
  baseline: { err: unknown; computeUnits: number | null; matchedMainnet: boolean };
  originalErr: unknown;
  /**
   * True when the baseline reproduced mainnet's outcome. When false the results
   * describe the fork's behaviour, not the transaction's, and say so.
   */
  reliable: boolean;
  results: CounterfactualResult[];
};

type Probe = {
  id: string;
  label: string;
  /**
   * Applies the change. Returns a description of what it did, or null when it
   * doesn't apply — never a silent no-op.
   */
  apply: (ctx: {
    tx: VersionedTransactionResponse;
    message: VersionedMessage;
    surfnetUrl: string;
    surfnet: Connection;
    accountKeys: PublicKey[];
  }) => Promise<string | null>;
};

/**
 * Rewrites an existing `SetComputeUnitLimit` in place.
 *
 * In place because adding the instruction is a different operation: it would
 * need the ComputeBudget program in the account list and the whole message
 * rebuilt, and a transaction that never asked for a limit is a different
 * counterfactual from one that asked for too little. This reports null in that
 * case so the caller can say which it was.
 */
export function rewriteComputeLimit(message: VersionedMessage, units: number): number | null {
  const encoded = Buffer.alloc(5);
  encoded.writeUInt8(SET_CU_LIMIT_DISCRIMINANT, 0);
  encoded.writeUInt32LE(units, 1);

  // Dispatch on `version`, never on which properties exist: a legacy `Message`
  // also exposes `compiledInstructions`, as a getter that derives a *fresh
  // array* on every access. Writing through it mutates a throwaway copy, so the
  // probe would report "limit raised" while changing nothing — which is exactly
  // the confident-but-wrong result this module exists to avoid.
  const v0 = message as unknown as {
    compiledInstructions?: { programIdIndex: number; data: Uint8Array }[];
    staticAccountKeys?: PublicKey[];
  };
  if (message.version !== "legacy" && v0.compiledInstructions) {
    for (const ix of v0.compiledInstructions) {
      const program = v0.staticAccountKeys?.[ix.programIdIndex]?.toBase58();
      if (program !== COMPUTE_BUDGET_PROGRAM) continue;
      if (ix.data.length !== 5 || ix.data[0] !== SET_CU_LIMIT_DISCRIMINANT) continue;
      const previous = Buffer.from(ix.data).readUInt32LE(1);
      ix.data.set(encoded);
      return previous;
    }
    return null;
  }

  // legacy: instruction data is a base58 string on the message.
  const legacy = message as unknown as {
    instructions?: { programIdIndex: number; data: string }[];
    accountKeys?: PublicKey[];
  };
  for (const ix of legacy.instructions ?? []) {
    const program = legacy.accountKeys?.[ix.programIdIndex]?.toBase58();
    if (program !== COMPUTE_BUDGET_PROGRAM) continue;
    const raw = Buffer.from(bs58.decode(ix.data));
    if (raw.length !== 5 || raw[0] !== SET_CU_LIMIT_DISCRIMINANT) continue;
    const previous = raw.readUInt32LE(1);
    ix.data = bs58.encode(encoded);
    return previous;
  }
  return null;
}

async function setAccount(
  url: string,
  pubkey: string,
  update: { lamports?: number; data?: string },
): Promise<void> {
  const res = (await surfnetCall(url, "surfnet_setAccount", [pubkey, update])) as {
    error?: { message?: string; data?: string };
  };
  if (res?.error) throw new Error(res.error.data ?? res.error.message ?? "setAccount failed");
}

const PROBES: Probe[] = [
  {
    id: "more-compute",
    label: `compute limit raised to ${MAX_COMPUTE_UNITS.toLocaleString()} CU`,
    async apply({ tx, message }) {
      const previous = rewriteComputeLimit(message, MAX_COMPUTE_UNITS);
      if (previous === null) {
        const hasBudgetIx = normalizeInstructions(tx).some(
          (ix) => ix.programId === COMPUTE_BUDGET_PROGRAM
        );
        return hasBudgetIx
          ? null // has a budget instruction but not a limit — can't rewrite what isn't there
          : null;
      }
      return `SetComputeUnitLimit ${previous} -> ${MAX_COMPUTE_UNITS}`;
    },
  },
  {
    id: "more-lamports",
    label: "every writable account funded with an extra 10 SOL",
    async apply({ surfnetUrl, surfnet, accountKeys, message }) {
      const writable = accountKeys.filter((_, i) => message.isAccountWritable(i));
      const infos = await surfnet.getMultipleAccountsInfo(writable.slice(0, 100), "processed");
      let funded = 0;
      for (const [i, key] of writable.slice(0, 100).entries()) {
        const info = infos[i];
        if (!info || info.executable) continue;
        await setAccount(surfnetUrl, key.toBase58(), {
          lamports: info.lamports + LAMPORT_TOP_UP,
        });
        funded++;
      }
      return funded ? `topped up ${funded} account(s) by 10 SOL each` : null;
    },
  },
  {
    id: "more-tokens",
    label: "every token account balance multiplied by 10",
    async apply({ tx, surfnetUrl, surfnet, accountKeys }) {
      const balances = tx.meta?.preTokenBalances ?? [];
      if (balances.length === 0) return null;
      let raised = 0;
      for (const bal of balances) {
        const key = accountKeys[bal.accountIndex];
        if (!key) continue;
        const info = await surfnet.getAccountInfo(key, "processed");
        const snap = snapshotFromAccountInfo(info);
        if (!snap || !decodeTokenAccount(snap)) continue;
        const data = Buffer.from(snap.data);
        const current = data.readBigUInt64LE(TOKEN_AMOUNT_OFFSET);
        // Saturate rather than wrap: a u64 overflow would silently shrink the
        // balance and invert the meaning of the probe.
        const raisedTo = current === 0n ? 1_000_000_000n : current * TOKEN_MULTIPLIER;
        data.writeBigUInt64LE(
          raisedTo > 0xffffffffffffffffn ? 0xffffffffffffffffn : raisedTo,
          TOKEN_AMOUNT_OFFSET
        );
        await setAccount(surfnetUrl, key.toBase58(), { data: data.toString("hex") });
        raised++;
      }
      return raised ? `raised ${raised} token account balance(s)` : null;
    },
  },
  {
    id: "later-clock",
    label: "clock advanced by one hour",
    async apply({ surfnetUrl }) {
      // Only forward: surfnet_timeTravel refuses to go back, so "what if this
      // had run earlier" is not a question this fork can answer.
      const res = (await surfnetCall(surfnetUrl, "surfnet_timeTravel", [
        { absoluteTimestamp: Date.now() + CLOCK_JUMP_MS },
      ])) as { error?: { message?: string; data?: string } };
      if (res?.error) return null;
      return "clock moved forward one hour (the fork cannot move it back)";
    },
  },
];

/**
 * Runs the battery against one transaction.
 *
 * Assumes the caller has already forked the surfnet to a usable slot; this
 * re-seeds from tx metadata before every probe but does not time travel, except
 * where a probe's whole point is to move the clock.
 */
export async function runCounterfactuals(opts: {
  mainnet: Connection;
  surfnet: Connection;
  surfnetUrl: string;
  signature: string;
}): Promise<CounterfactualReport> {
  const { mainnet, surfnet, surfnetUrl, signature } = opts;

  const tx = await mainnet.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
  if (!tx?.meta) throw new Error("transaction not found, or has no metadata to replay from");

  const keys = tx.transaction.message.getAccountKeys({
    accountKeysFromLookups: tx.meta.loadedAddresses || null,
  });
  const accountKeys: PublicKey[] = [];
  for (let i = 0; i < keys.length; i++) accountKeys.push(keys.get(i)!);

  /** Re-seeds the fork and simulates, optionally perturbed. Fresh message each time. */
  const run = async (probe: Probe | null) => {
    // Re-fetch so each run starts from an unmodified message: the compute probe
    // mutates it in place, and a leaked mutation would contaminate later runs.
    const fresh = (await mainnet.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    }))!;
    const message = fresh.transaction.message as VersionedMessage;

    // Reading before seeding is what makes surfnet pull real state; seeding an
    // untouched address first would shadow it with an empty shell.
    const warmed = await surfnet.getMultipleAccountsInfo(accountKeys.slice(0, 100), "processed");
    await seedPreState(surfnetUrl, fresh, keys, warmed);

    let detail: string | null = "baseline";
    if (probe) {
      detail = await probe.apply({ tx: fresh, message, surfnetUrl, surfnet, accountKeys });
      if (detail === null) return { applied: false, err: null, units: null };
    }

    const vtx = new VersionedTransaction(
      message,
      Array.from({ length: message.header.numRequiredSignatures }, () => new Uint8Array(64))
    );
    const sim = await surfnet.simulateTransaction(vtx, {
      sigVerify: false,
      replaceRecentBlockhash: true,
      commitment: "processed",
    });
    return {
      applied: true,
      err: sim.value.err,
      units: sim.value.unitsConsumed ?? null,
      detail,
    };
  };

  const baseline = await run(null);
  const matchedMainnet = JSON.stringify(baseline.err) === JSON.stringify(tx.meta.err);

  const results: CounterfactualResult[] = [];
  for (const probe of PROBES) {
    let outcome: CounterfactualOutcome;
    let detail: string;
    let err: unknown = null;
    let units: number | null = null;

    try {
      const result = await run(probe);
      if (!result.applied) {
        outcome = "not-applicable";
        detail = notApplicableReason(probe.id, tx);
      } else {
        err = result.err;
        units = result.units;
        detail = result.detail ?? "";
        if (err === null) outcome = "fixed";
        else if (JSON.stringify(err) === JSON.stringify(baseline.err)) outcome = "unchanged";
        else outcome = "different-error";
      }
    } catch (e) {
      outcome = "not-applicable";
      detail = `could not apply: ${(e as Error).message}`;
    }

    results.push({
      id: probe.id,
      label: probe.label,
      outcome,
      detail,
      err,
      computeUnits: units,
      computeDelta: units !== null && baseline.units !== null ? units - baseline.units : null,
    });
  }

  return {
    signature,
    baseline: { err: baseline.err, computeUnits: baseline.units, matchedMainnet },
    originalErr: tx.meta.err,
    reliable: matchedMainnet,
    results,
  };
}

function notApplicableReason(probeId: string, tx: VersionedTransactionResponse): string {
  switch (probeId) {
    case "more-compute": {
      const hasBudget = normalizeInstructions(tx).some(
        (ix) => ix.programId === COMPUTE_BUDGET_PROGRAM
      );
      return hasBudget
        ? "no SetComputeUnitLimit instruction to rewrite — the transaction never asked for a limit"
        : "the transaction has no ComputeBudget instruction, and one can't be added without rebuilding the message";
    }
    case "more-tokens":
      return "the transaction touches no token accounts";
    case "later-clock":
      return "surfnet refused the clock change (it only moves forward)";
    default:
      return "not applicable to this transaction";
  }
}

/** Renders the battery as indented CLI lines. */
export function formatCounterfactuals(report: CounterfactualReport): string[] {
  const out: string[] = [];

  if (!report.reliable) {
    out.push("  the baseline replay did NOT reproduce mainnet's outcome:");
    out.push(`      mainnet: ${JSON.stringify(report.originalErr)}`);
    out.push(`      replay:  ${JSON.stringify(report.baseline.err)}`);
    out.push("  so the results below describe the fork, not this transaction — treat as noise");
    out.push("");
  }

  const mark: Record<CounterfactualOutcome, string> = {
    fixed: "FIXED IT ",
    unchanged: "no change",
    "different-error": "changed  ",
    "not-applicable": "n/a      ",
  };

  for (const r of report.results) {
    const cu =
      r.computeDelta !== null && r.outcome !== "not-applicable"
        ? `  (${r.computeDelta >= 0 ? "+" : ""}${r.computeDelta} CU)`
        : "";
    out.push(`  ${mark[r.outcome]}  ${r.label}${cu}`);
    out.push(`              ${r.detail}`);
    if (r.outcome === "different-error") {
      out.push(`              now fails with ${JSON.stringify(r.err)}`);
    }
  }

  const fixed = report.results.filter((r) => r.outcome === "fixed");
  if (fixed.length && report.reliable) {
    out.push("");
    out.push(`  => ${fixed.map((f) => f.label).join("; ")} made this transaction succeed`);
  }
  return out;
}
