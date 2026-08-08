/**
 * lib/rules.ts
 *
 * Turns a `DebugReport`'s facts into a diagnosis.
 *
 * Everything upstream answers "what happened": which program failed, with what
 * code, having burned how much compute. This module answers the question a
 * person actually asked — *why*, and what to do about it. That step is where a
 * debugger either earns its keep or starts making things up, so three
 * constraints hold every rule:
 *
 * - **A rule cites its evidence.** Every finding lists the report fields it
 *   fired on, so a reader can check the reasoning rather than trust it. A rule
 *   that can't point at evidence shouldn't exist.
 * - **Confidence is honest and coarse.** `certain` means the runtime itself
 *   said so. `likely` means a strong pattern with a plausible alternative.
 *   `possible` means a heuristic worth checking, and says so out loud. Nothing
 *   is dressed up beyond what the evidence carries.
 * - **Rules are pure and offline.** `(report) => Finding | null`, no network, no
 *   ordering dependencies. That keeps them trivially testable and means a wrong
 *   rule can be deleted without disturbing the others.
 *
 * Rules never mutate the report and never invent a cause. Silence — no finding
 * — is a perfectly good outcome and much better than a confident wrong one.
 */

import type { DebugReport } from "./report.js";
import {
  SYSTEM_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "./program-errors.js";

export type Confidence = "certain" | "likely" | "possible";

export type Finding = {
  ruleId: string;
  /** One line: what went wrong, in the user's terms rather than the runtime's. */
  title: string;
  confidence: Confidence;
  /** Why this rule fired — the report facts it matched, quoted. */
  evidence: string[];
  /** What to do about it. Omitted when there's nothing honest to suggest. */
  suggestion?: string;
};

export type Rule = {
  id: string;
  /** Pure, offline, order-independent. Returns null when it doesn't apply. */
  check: (report: DebugReport) => Finding | null;
};

/** Compute is "nearly exhausted" above this fraction of the requested limit. */
const CU_TIGHT_FRACTION = 0.95;
/** The runtime's default per-instruction compute limit when none is requested. */
const DEFAULT_CU_LIMIT = 200_000;

/** Case-insensitive substring match over an error name and message. */
function errorMentions(report: DebugReport, ...needles: string[]): boolean {
  const e = report.error;
  if (!e) return false;
  const haystack = [
    e.resolved?.name,
    e.resolved?.msg,
    e.anchor?.code,
    e.anchor?.message,
    e.logHint,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return needles.some((n) => haystack.includes(n.toLowerCase()));
}

function runtimeErrorIs(report: DebugReport, name: string): boolean {
  return (
    report.error?.runtimeExplanation?.name === name || report.error?.runtimeError === name
  );
}

// ------------------------------------------------------------------- rules

/**
 * Ran out of compute. The runtime says so outright, so this is `certain` — the
 * value added is the numbers and the fix, not the detection.
 */
const outOfCompute: Rule = {
  id: "compute-exhausted",
  check(report) {
    if (!runtimeErrorIs(report, "ComputationalBudgetExceeded")) return null;
    const { consumed, requested, hotspots } = report.compute;
    const evidence = [
      `consumed ${consumed} CU` + (requested !== null ? ` of ${requested} requested` : ""),
    ];
    if (requested === null) {
      evidence.push(`no SetComputeUnitLimit instruction — the default ${DEFAULT_CU_LIMIT} CU applied`);
    }
    const top = hotspots[0];
    if (top) evidence.push(`most compute in ${top.programId} (${top.selfCu} CU of its own work)`);
    return {
      ruleId: "compute-exhausted",
      title: "The transaction ran out of compute units",
      confidence: "certain",
      evidence,
      suggestion:
        requested === null
          ? `Add a ComputeBudget SetComputeUnitLimit instruction — without one the default ${DEFAULT_CU_LIMIT} CU applies.`
          : `Raise SetComputeUnitLimit above ${requested}, or split the work across instructions (max 1,400,000 per transaction).`,
    };
  },
};

/**
 * Succeeded, but with little compute headroom left. Worth saying because the
 * same transaction fails when pool state shifts and the path gets longer.
 */
const computeNearLimit: Rule = {
  id: "compute-near-limit",
  check(report) {
    const { consumed, requested, utilizationPct } = report.compute;
    if (requested === null || utilizationPct === null) return null;
    if (consumed / requested < CU_TIGHT_FRACTION) return null;
    if (runtimeErrorIs(report, "ComputationalBudgetExceeded")) return null; // the rule above owns this
    return {
      ruleId: "compute-near-limit",
      title: `Compute headroom is thin — ${utilizationPct.toFixed(1)}% of the requested limit was used`,
      confidence: "likely",
      evidence: [`consumed ${consumed} CU of ${requested} requested`],
      suggestion:
        "Raise SetComputeUnitLimit. A path that grows slightly — an extra tick array, a longer route — will exceed this.",
    };
  },
};

/**
 * Slippage. Matched on the error *name*, since every AMM spells it differently
 * but they all say some variant of it, and the decoded instruction args usually
 * carry the exact limit that wasn't met.
 */
const slippage: Rule = {
  id: "slippage-exceeded",
  check(report) {
    if (
      !errorMentions(
        report,
        "slippage",
        "ExceededSlippage",
        "min_quote_amount_out",
        "MaxSlippage",
        "PriceSlippage",
        "TooLittleOutput",
        "ExceededMaxIn",
      )
    ) {
      return null;
    }
    const evidence: string[] = [];
    const name = report.error?.resolved?.name ?? report.error?.anchor?.code;
    if (name) evidence.push(`error ${name}`);

    // The failing instruction's decoded args name the limit that wasn't met.
    const failing = report.instructions.find((i) => i.failed);
    for (const [key, value] of Object.entries(failing?.decoded?.args ?? {})) {
      if (/min|max|limit|slippage|threshold/i.test(key)) {
        evidence.push(`${failing!.decoded!.name} was called with ${key}=${String(value)}`);
      }
    }
    return {
      ruleId: "slippage-exceeded",
      title: "The swap moved past its slippage limit before it executed",
      confidence: "likely",
      evidence,
      suggestion:
        "The price moved between quote and execution. Widen the slippage tolerance, re-quote closer to submission, or raise the priority fee so the transaction lands sooner.",
    };
  },
};

/**
 * A missing signature is usually a PDA whose seeds didn't match, because the
 * runtime reports "you didn't sign" for a `invoke_signed` whose derivation was
 * wrong. Both readings are offered rather than guessing between them.
 */
const missingSigner: Rule = {
  id: "missing-signer",
  check(report) {
    if (!runtimeErrorIs(report, "MissingRequiredSignature")) return null;
    const signers = report.accounts.filter((a) => a.signer).map((a) => a.pubkey);
    return {
      ruleId: "missing-signer",
      title: "An account that had to sign didn't",
      confidence: "certain",
      evidence: [
        `the transaction carries ${signers.length} signer(s): ${signers.join(", ") || "none"}`,
      ],
      suggestion:
        "If the missing signer is a PDA, the program's invoke_signed seeds don't derive it — check seed order and the bump. If it's a wallet, it was never added as a signer client-side.",
    };
  },
};

/** Seeds that don't derive the address given. Almost always seed order or bump. */
const badSeeds: Rule = {
  id: "pda-seeds-mismatch",
  check(report) {
    const anchorSeedError = errorMentions(report, "ConstraintSeeds", "InvalidSeeds", "seeds constraint");
    if (!runtimeErrorIs(report, "InvalidSeeds") && !anchorSeedError) return null;
    const evidence: string[] = [];
    const name = report.error?.resolved?.name ?? report.error?.anchor?.code;
    if (name) evidence.push(`error ${name}`);
    if (report.error?.anchor?.account) {
      evidence.push(`Anchor named the account: ${report.error.anchor.account}`);
    }
    if (report.error?.anchor?.source) evidence.push(`thrown at ${report.error.anchor.source}`);
    return {
      ruleId: "pda-seeds-mismatch",
      title: "A PDA doesn't derive from the seeds the program expected",
      confidence: "certain",
      evidence,
      suggestion:
        "Compare the client's seed list against the program's, in order. The usual causes are a missing or wrong bump, a seed serialized differently on each side, or the wrong program id in the derivation.",
    };
  },
};

/**
 * Creating something that already exists. Common enough to be worth naming,
 * and the fix is usually a one-word change to the idempotent instruction.
 */
const alreadyInitialized: Rule = {
  id: "already-initialized",
  check(report) {
    const runtime = runtimeErrorIs(report, "AccountAlreadyInitialized");
    const tokenAlreadyInUse =
      report.error?.customCode === 6 &&
      (report.error.attribution.basis !== "none"
        ? [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID].includes(report.error.attribution.programId)
        : false);
    const systemInUse = errorMentions(report, "AccountAlreadyInUse", "already in use");
    if (!runtime && !tokenAlreadyInUse && !systemInUse) return null;

    const creating = report.instructions.find((i) =>
      /create|init/i.test(i.decoded?.name ?? "")
    );
    const evidence: string[] = [];
    if (report.error?.runtimeError) evidence.push(`error ${report.error.runtimeError}`);
    if (tokenAlreadyInUse) evidence.push("SPL Token error 6 (AlreadyInUse)");
    if (creating?.decoded) {
      evidence.push(`instruction [${creating.index}] is ${creating.decoded.program} ${creating.decoded.name}`);
    }
    return {
      ruleId: "already-initialized",
      title: "The transaction tried to create an account that already exists",
      confidence: "certain",
      evidence,
      suggestion:
        "Use the idempotent form where one exists (CreateIdempotent for associated token accounts), or check the account before creating it. On a replay this can also be the fork holding an account the original transaction created — see the seeding notes.",
    };
  },
};

/**
 * An account was asked for more than it held — tokens or lamports.
 *
 * The two arrive as different errors from different programs but are one
 * diagnosis, and the asset matters to the fix, so it's named in the evidence.
 */
const insufficientBalance: Rule = {
  id: "insufficient-balance",
  check(report) {
    const e = report.error;
    if (!e) return null;
    const from = e.attribution.basis !== "none" ? e.attribution.programId : null;

    const tokenShortfall =
      e.customCode === 1 && from !== null && [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID].includes(from);
    // System's error 1 is the lamport equivalent: the debit would go negative.
    const lamportShortfall =
      (e.customCode === 1 && from === SYSTEM_PROGRAM_ID) ||
      errorMentions(report, "ResultWithNegativeLamports");
    const runtimeShortfall = runtimeErrorIs(report, "InsufficientFunds");
    if (!tokenShortfall && !lamportShortfall && !runtimeShortfall) return null;

    const asset = tokenShortfall ? "tokens" : "lamports";
    const evidence: string[] = [];
    if (tokenShortfall) evidence.push("SPL Token error 1 (InsufficientFunds)");
    if (lamportShortfall) evidence.push("System error 1 (ResultWithNegativeLamports)");
    if (runtimeShortfall && !tokenShortfall && !lamportShortfall) {
      evidence.push("runtime error InsufficientFunds");
    }
    const moving = report.instructions.find((i) => /transfer|burn/i.test(i.decoded?.name ?? ""));
    const amount = moving?.decoded?.args["amount"] ?? moving?.decoded?.args["lamports"];
    if (amount !== undefined && amount !== null) {
      evidence.push(`${moving!.decoded!.name} asked to move ${String(amount)}`);
    }

    return {
      ruleId: "insufficient-balance",
      title: `An account didn't hold enough ${asset} to cover the transfer`,
      confidence: "certain",
      evidence,
      suggestion: lamportShortfall
        ? "The debit would take the account below zero — or below its rent-exempt minimum, which the runtime treats the same way. Leave the rent reserve in place, or close the account instead of draining it."
        : "Check the source account's balance at the transaction's slot, not now. If this is a wrapped-SOL account, it may need SyncNative after the lamports were transferred in.",
    };
  },
};

/**
 * Not a diagnosis of the failure — a warning about reading the rest. When the
 * culprit is only known from the top-level instruction, everything downstream
 * (the resolved error name especially) may be about the wrong program.
 */
const attributionUncertain: Rule = {
  id: "attribution-uncertain",
  check(report) {
    const e = report.error;
    if (!e || e.attribution.basis !== "top-level-instruction") return null;
    if (e.customCode === null) return null; // only custom codes get mis-resolved this way
    return {
      ruleId: "attribution-uncertain",
      title: "The failing program may be misidentified — read the error name with suspicion",
      confidence: "likely",
      evidence: [
        "no per-program failure line in the logs, so the culprit is the top-level instruction",
        `custom ${e.customCode} was resolved against ${e.attribution.programId}`,
      ],
      suggestion:
        "If this failed inside a CPI, the code belongs to the callee, not this program — and two programs' code 6004 mean different things. Replaying with full logs settles it.",
    };
  },
};

/** All rules, in no significant order — each is independent by construction. */
export const RULES: Rule[] = [
  outOfCompute,
  computeNearLimit,
  slippage,
  missingSigner,
  badSeeds,
  alreadyInitialized,
  insufficientBalance,
  attributionUncertain,
];

const CONFIDENCE_ORDER: Record<Confidence, number> = {
  certain: 0,
  likely: 1,
  possible: 2,
};

/**
 * Runs every rule and returns what fired, most confident first.
 *
 * Rules that throw are swallowed deliberately: a bug in one heuristic must not
 * cost the report it was decorating. The facts are worth more than the opinions
 * about them.
 */
export function runRules(report: DebugReport, rules: Rule[] = RULES): Finding[] {
  const findings: Finding[] = [];
  for (const rule of rules) {
    try {
      const finding = rule.check(report);
      if (finding) findings.push(finding);
    } catch {
      // A broken rule is a silent no-op, never a broken report.
    }
  }
  return findings.sort(
    (a, b) => CONFIDENCE_ORDER[a.confidence] - CONFIDENCE_ORDER[b.confidence]
  );
}

/** Renders findings as indented CLI lines. */
export function formatFindings(findings: Finding[]): string[] {
  const out: string[] = [];
  for (const f of findings) {
    out.push(`  ${f.title}  [${f.confidence}]`);
    for (const e of f.evidence) out.push(`      because: ${e}`);
    if (f.suggestion) out.push(`      try: ${f.suggestion}`);
  }
  return out;
}
