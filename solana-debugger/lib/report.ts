/**
 * lib/report.ts
 *
 * `DebugReport` — everything this tool concluded about one transaction, as
 * data rather than printed text.
 *
 * Today `fetch-tx.ts` computes its findings and prints them in the same pass,
 * which means nothing else can consume them: `--json` has nothing to serialize,
 * and a rule engine would have to re-derive facts the printer already worked
 * out. This type is the seam. `buildDebugReport()` does the concluding, and
 * renderers decide how loud to be about it.
 *
 * Two properties are deliberate:
 *
 * - **Serializable.** No `Buffer`, no `PublicKey`, no `bigint` — addresses are
 *   base58 strings and token amounts are decimal strings, because a u64 token
 *   amount does not survive JSON as a number. A report can be written to disk,
 *   diffed between runs, or posted to an issue.
 * - **Honest about confidence.** Anything that changes how much to trust a
 *   conclusion travels *with* it: `attribution` says how the failing program was
 *   identified, and `warnings` carries the caveats that must never be buried in
 *   a section a reader might not print.
 */

import type { Connection, VersionedTransactionResponse } from "@solana/web3.js";

import { buildCpiTree, deepestFailedFrame, framesBySelfCu, type CpiTree } from "./cpi-tree.js";
import { decodeComputeBudgetIx, normalizeInstructions } from "./decode.js";
import { findFailingProgramInLogs, resolveCustomError, type ResolvedError } from "./errors.js";
import { decodeNativeIx, type DecodedIx } from "./native-decoders.js";
import { findLogHint, parseAnchorError, type AnchorErrorInfo } from "./summary.js";

const COMPUTE_BUDGET_PROGRAM = "ComputeBudget111111111111111111111111111111";
/** Default signature fee; not queried from the chain — see `fee.assumedBaseRate`. */
const LAMPORTS_PER_SIGNATURE = 5000;

/** How the program blamed for the error was identified. */
export type Attribution =
  /** The runtime's innermost failure line named it — the strong case. */
  | { basis: "logs"; programId: string; viaCpi: boolean; callerProgramId: string | null }
  /**
   * The logs couldn't say, so this is `meta.err`'s top-level instruction, which
   * is the *caller* whenever the failure happened inside a CPI.
   */
  | { basis: "top-level-instruction"; programId: string; mayBeWrong: true }
  | { basis: "none" };

export type ReportedError = {
  /** `meta.err` verbatim, for callers that want to match on the raw shape. */
  raw: unknown;
  /** Index into the *top-level* instruction list, per `InstructionError`. */
  instructionIndex: number | null;
  /** Non-custom runtime errors (`ProgramFailedToComplete`, …) land here. */
  runtimeError: string | null;
  customCode: number | null;
  hex: string | null;
  resolved: ResolvedError | null;
  anchor: AnchorErrorInfo | null;
  attribution: Attribution;
  /** Last thing a program logged before failing, for non-Anchor programs. */
  logHint: string | null;
};

export type ComputeSummary = {
  consumed: number;
  /** From a ComputeBudget `SetComputeUnitLimit`/`RequestUnits` instruction. */
  requested: number | null;
  /** Percent of the requested limit actually used, when a limit was set. */
  utilizationPct: number | null;
  priorityMicroLamportsPerCu: string | null;
  /** Frames ranked by their *own* compute — a router's cost is mostly callees'. */
  hotspots: { programId: string; depth: number; selfCu: number; consumedCu: number }[];
};

export type FeeSummary = {
  total: number;
  base: number;
  priority: number;
  numSigners: number;
  /** True — the base rate is assumed, not read from the chain for that slot. */
  assumedBaseRate: boolean;
};

export type Movements = {
  lamports: { pubkey: string; delta: number }[];
  /** `delta`/`pre`/`post` are decimal strings: u64 amounts outrun JSON numbers. */
  tokens: {
    pubkey: string;
    mint: string;
    owner: string | null;
    decimals: number;
    pre: string;
    post: string;
    delta: string;
  }[];
};

export type DebugReport = {
  signature: string;
  slot: number;
  /** ISO 8601, or null when the RPC didn't record a block time. */
  blockTime: string | null;
  version: string;
  outcome: "success" | "failed";
  error: ReportedError | null;
  compute: ComputeSummary;
  fee: FeeSummary;
  callTree: CpiTree;
  movements: Movements;
  accounts: {
    pubkey: string;
    signer: boolean;
    writable: boolean;
    fromLookupTable: boolean;
  }[];
  instructions: {
    index: number;
    programId: string;
    accountCount: number;
    failed: boolean;
    /**
     * Present for System/Token/Token-2022/ATA. Those four have no on-chain IDL
     * and appear in nearly every transaction, so hand-decoding is the only way
     * to say what the instruction did. null means "not decoded", never "no-op".
     */
    decoded: DecodedIx | null;
  }[];
  /**
   * Caveats that change how much to trust the rest. A renderer must surface
   * these wherever it surfaces conclusions — they are the difference between a
   * wrong answer and a qualified one.
   */
  warnings: string[];
};

/**
 * Assembles the report for one fetched transaction.
 *
 * `connection` is used only to resolve a custom error code against an on-chain
 * IDL; everything else comes from the transaction itself. Pass `null` to skip
 * that lookup and keep the build entirely offline.
 */
export async function buildDebugReport(
  signature: string,
  tx: VersionedTransactionResponse,
  connection: Connection | null,
): Promise<DebugReport> {
  const meta = tx.meta;
  if (!meta) throw new Error("transaction has no meta — nothing to report on");

  const message = tx.transaction.message;
  const accountKeys = message.getAccountKeys({
    accountKeysFromLookups: meta.loadedAddresses || null,
  });
  const instructions = normalizeInstructions(tx);
  const callTree = buildCpiTree(meta.logMessages);
  const warnings: string[] = [];

  if (callTree.truncated) {
    warnings.push(
      "the validator truncated the logs — the call tree is incomplete and compute " +
        "attribution may be missing frames"
    );
  }

  // --------------------------------------------------------------- error
  const rawErr = meta.err as Record<string, unknown> | null;
  const instructionError =
    rawErr && typeof rawErr === "object" && "InstructionError" in rawErr
      ? (rawErr["InstructionError"] as [number, unknown])
      : null;
  const instructionIndex = instructionError ? instructionError[0] : null;
  const detail = instructionError ? instructionError[1] : null;
  const customCode =
    detail && typeof detail === "object" && "Custom" in detail
      ? ((detail as { Custom: number }).Custom ?? null)
      : null;
  const runtimeError =
    detail !== null && typeof detail === "string" ? detail : null;

  let error: ReportedError | null = null;
  if (rawErr) {
    const topLevelProgram =
      instructionIndex !== null ? (instructions[instructionIndex]?.programId ?? null) : null;
    const fromLogs =
      customCode !== null ? findFailingProgramInLogs(meta.logMessages, customCode) : null;

    let attribution: Attribution;
    if (fromLogs) {
      attribution = {
        basis: "logs",
        programId: fromLogs,
        viaCpi: Boolean(topLevelProgram && fromLogs !== topLevelProgram),
        callerProgramId: topLevelProgram,
      };
    } else if (topLevelProgram) {
      attribution = {
        basis: "top-level-instruction",
        programId: topLevelProgram,
        mayBeWrong: true,
      };
      if (customCode !== null) {
        warnings.push(
          "no failure line in the logs — the failing program is the top-level one, " +
            "which is wrong if the error came from inside a CPI"
        );
      }
    } else {
      attribution = { basis: "none" };
    }

    const culprit = attribution.basis === "none" ? null : attribution.programId;
    error = {
      raw: meta.err,
      instructionIndex,
      runtimeError,
      customCode,
      hex: customCode === null ? null : `0x${customCode.toString(16)}`,
      resolved:
        customCode !== null && culprit && connection
          ? await resolveCustomError(connection, culprit, customCode)
          : null,
      anchor: parseAnchorError(meta.logMessages),
      attribution,
      logHint: findLogHint(meta.logMessages),
    };
  }

  // ------------------------------------------------------------- compute
  let requested: number | null = null;
  let priority: bigint | null = null;
  for (const ix of instructions) {
    if (ix.programId !== COMPUTE_BUDGET_PROGRAM) continue;
    const decoded = decodeComputeBudgetIx(ix.dataBase64) as {
      type: string;
      units?: number;
      microLamports?: bigint;
    };
    if (decoded.type === "SetComputeUnitLimit" || decoded.type === "RequestUnits") {
      requested = decoded.units ?? null;
    }
    if (decoded.type === "SetComputeUnitPrice") priority = decoded.microLamports ?? null;
  }

  const consumed = Number(meta.computeUnitsConsumed ?? 0);
  const compute: ComputeSummary = {
    consumed,
    requested,
    utilizationPct: requested ? Number(((consumed / requested) * 100).toFixed(1)) : null,
    priorityMicroLamportsPerCu: priority === null ? null : priority.toString(),
    hotspots: framesBySelfCu(callTree)
      .slice(0, 5)
      .map((f) => ({
        programId: f.programId,
        depth: f.depth,
        selfCu: f.selfCu ?? 0,
        consumedCu: f.consumedCu ?? 0,
      })),
  };

  // ----------------------------------------------------------------- fee
  const numSigners = message.header.numRequiredSignatures;
  const base = numSigners * LAMPORTS_PER_SIGNATURE;
  const fee: FeeSummary = {
    total: meta.fee,
    base,
    priority: meta.fee - base,
    numSigners,
    assumedBaseRate: true,
  };

  // ----------------------------------------------------------- movements
  const lamports: Movements["lamports"] = [];
  for (let i = 0; i < meta.preBalances.length; i++) {
    const delta = (meta.postBalances[i] ?? 0) - (meta.preBalances[i] ?? 0);
    if (delta === 0) continue;
    lamports.push({ pubkey: accountKeys.get(i)?.toBase58() ?? `<index ${i}>`, delta });
  }

  const tokens: Movements["tokens"] = [];
  const preByIndex = new Map((meta.preTokenBalances ?? []).map((b) => [b.accountIndex, b]));
  for (const post of meta.postTokenBalances ?? []) {
    const pre = preByIndex.get(post.accountIndex);
    const preAmt = BigInt(pre?.uiTokenAmount.amount ?? "0");
    const postAmt = BigInt(post.uiTokenAmount.amount);
    if (preAmt === postAmt) continue;
    tokens.push({
      pubkey: accountKeys.get(post.accountIndex)?.toBase58() ?? `<index ${post.accountIndex}>`,
      mint: post.mint,
      owner: post.owner ?? null,
      decimals: post.uiTokenAmount.decimals,
      pre: preAmt.toString(),
      post: postAmt.toString(),
      delta: (postAmt - preAmt).toString(),
    });
  }

  // ------------------------------------------------------------ accounts
  const accounts: DebugReport["accounts"] = [];
  for (let i = 0; i < accountKeys.length; i++) {
    accounts.push({
      pubkey: accountKeys.get(i)!.toBase58(),
      signer: message.isAccountSigner(i),
      writable: message.isAccountWritable(i),
      fromLookupTable: i >= message.staticAccountKeys.length,
    });
  }

  // A failed transaction is rolled back, so movement is fee only. Saying so
  // here keeps every renderer from having to remember it.
  if (rawErr && lamports.length > 0) {
    warnings.push(
      "transaction failed — lamport movement is the fee only; program state was rolled back"
    );
  }

  return {
    signature,
    slot: tx.slot,
    blockTime: tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : null,
    version: tx.version === "legacy" ? "legacy" : `v${tx.version}`,
    outcome: rawErr ? "failed" : "success",
    error,
    compute,
    fee,
    callTree,
    movements: { lamports, tokens },
    accounts,
    instructions: instructions.map((ix, index) => ({
      index,
      programId: ix.programId,
      accountCount: ix.accounts.length,
      failed: index === instructionIndex,
      decoded: decodeNativeIx(
        ix.programId,
        ix.dataBase64,
        ix.accounts.map((a) => a.pubkey)
      ),
    })),
    warnings,
  };
}

/**
 * The one-line answer: which program failed and with what.
 *
 * Kept next to the type so every renderer phrases the headline the same way.
 */
export function headline(report: DebugReport): string {
  if (report.outcome === "success") {
    return `SUCCESS  ${report.instructions.length} instruction(s), ${report.compute.consumed} CU`;
  }
  const e = report.error;
  if (!e) return "FAILED";
  const who = e.attribution.basis === "none" ? "unknown program" : e.attribution.programId;
  const what =
    e.resolved?.name ??
    e.anchor?.code ??
    e.runtimeError ??
    (e.hex ? `custom ${e.customCode} (${e.hex})` : "unknown error");
  return `FAILED  ${who}  ${what}`;
}

/** The frame that actually raised the error, if the logs showed one. */
export function culpritFrame(report: DebugReport) {
  return deepestFailedFrame(report.callTree);
}
