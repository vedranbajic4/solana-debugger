/**
 * test-rules.ts — the rule engine.
 *
 * Usage:
 *   npm run test:rules            # fixtures
 *   npm run test:rules -- --live  # ...plus rule coverage over the corpus
 *
 * Two things need proving, and the second matters more. That a rule fires on
 * the case it targets is easy. That it *doesn't* fire on everything else is
 * what separates a diagnosis from a horoscope — so the live pass checks that no
 * rule claims a successful transaction failed, and reports what fired where.
 */

import { Connection } from "@solana/web3.js";
import { readFileSync } from "node:fs";

import { CORPUS_PATH, type CorpusFile } from "./lib/corpus.js";
import { buildDebugReport, type DebugReport } from "./lib/report.js";
import { RULES, runRules, type Finding, type Rule } from "./lib/rules.js";

let failures = 0;
function check(name: string, ok: boolean, detail?: string) {
  if (!ok) failures++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}${ok || !detail ? "" : ` — ${detail}`}`);
}

/** A minimal report; each test overrides only what its rule reads. */
function reportWith(overrides: Partial<DebugReport>): DebugReport {
  return {
    signature: "sig",
    slot: 1,
    blockTime: null,
    version: "v0",
    outcome: "failed",
    error: null,
    compute: {
      consumed: 0,
      requested: null,
      utilizationPct: null,
      priorityMicroLamportsPerCu: null,
      hotspots: [],
    },
    fee: { total: 5000, base: 5000, priority: 0, numSigners: 1, assumedBaseRate: true },
    callTree: { roots: [], truncated: false, preamble: [] },
    movements: { lamports: [], tokens: [] },
    accounts: [],
    instructions: [],
    warnings: [],
    findings: [],
    ...overrides,
  };
}

function errorWith(overrides: Partial<NonNullable<DebugReport["error"]>>) {
  return {
    raw: null,
    instructionIndex: 0,
    runtimeError: null,
    runtimeExplanation: null,
    customCode: null,
    hex: null,
    resolved: null,
    anchor: null,
    attribution: { basis: "none" as const },
    logHint: null,
    ...overrides,
  };
}

const ids = (findings: Finding[]) => findings.map((f) => f.ruleId);

function fixtures() {
  console.log("compute rules");
  {
    const exhausted = runRules(
      reportWith({
        error: errorWith({
          runtimeError: "ComputationalBudgetExceeded",
          runtimeExplanation: {
            name: "ComputationalBudgetExceeded",
            meaning: "ran out of compute",
            cause: null,
          },
        }),
        compute: {
          consumed: 200_000,
          requested: null,
          utilizationPct: null,
          priorityMicroLamportsPerCu: null,
          hotspots: [{ programId: "AMM", depth: 1, selfCu: 190_000, consumedCu: 200_000 }],
        },
      })
    );
    check("fires on compute exhaustion", ids(exhausted).includes("compute-exhausted"));
    check("is certain — the runtime said so", exhausted[0]?.confidence === "certain");
    check(
      "names the hotspot as evidence",
      exhausted[0]?.evidence.some((e) => e.includes("AMM")) === true
    );
    check(
      "suggests adding a limit when none was set",
      exhausted[0]?.suggestion?.includes("SetComputeUnitLimit") === true
    );

    const tight = runRules(
      reportWith({
        outcome: "success",
        compute: {
          consumed: 98_000,
          requested: 100_000,
          utilizationPct: 98,
          priorityMicroLamportsPerCu: null,
          hotspots: [],
        },
      })
    );
    check("warns when headroom is thin", ids(tight).includes("compute-near-limit"));

    const roomy = runRules(
      reportWith({
        outcome: "success",
        compute: {
          consumed: 10_000,
          requested: 100_000,
          utilizationPct: 10,
          priorityMicroLamportsPerCu: null,
          hotspots: [],
        },
      })
    );
    check("silent with plenty of headroom", roomy.length === 0);

    // The two compute rules must never both fire — one would contradict the other.
    const both = runRules(
      reportWith({
        error: errorWith({ runtimeError: "ComputationalBudgetExceeded" }),
        compute: {
          consumed: 100_000,
          requested: 100_000,
          utilizationPct: 100,
          priorityMicroLamportsPerCu: null,
          hotspots: [],
        },
      })
    );
    check("exhaustion suppresses the headroom warning", !ids(both).includes("compute-near-limit"));
  }

  console.log("\nslippage");
  {
    const found = runRules(
      reportWith({
        error: errorWith({
          customCode: 6004,
          resolved: { source: "anchor-idl", name: "ExceededSlippage", hex: "0x1774" },
        }),
        instructions: [
          {
            index: 0,
            programId: "AMM",
            accountCount: 3,
            failed: true,
            decoded: {
              source: "idl",
              program: "amm",
              name: "sell",
              args: { base_amount_in: "23101", min_quote_amount_out: "18351529" },
              accounts: [],
            },
          },
        ],
      })
    );
    check("fires on a slippage error", ids(found).includes("slippage-exceeded"));
    check(
      "quotes the limit that wasn't met",
      found[0]?.evidence.some((e) => e.includes("min_quote_amount_out=18351529")) === true
    );
    check("is likely, not certain", found[0]?.confidence === "likely");

    const unrelated = runRules(
      reportWith({
        error: errorWith({
          customCode: 6004,
          resolved: { source: "anchor-idl", name: "InvalidPoolAuthority", hex: "0x1774" },
        }),
      })
    );
    check("silent on an unrelated error of the same code", unrelated.length === 0);
  }

  console.log("\nbalances and seeds");
  {
    const tokens = runRules(
      reportWith({
        error: errorWith({
          customCode: 1,
          attribution: { basis: "logs", programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", viaCpi: false, callerProgramId: null },
        }),
      })
    );
    check("fires on token shortfall", ids(tokens).includes("insufficient-balance"));
    check("names tokens, not lamports", tokens[0]?.title.includes("tokens") === true);

    const lamports = runRules(
      reportWith({
        error: errorWith({
          customCode: 1,
          attribution: { basis: "logs", programId: "11111111111111111111111111111111", viaCpi: false, callerProgramId: null },
        }),
      })
    );
    check("fires on lamport shortfall", ids(lamports).includes("insufficient-balance"));
    check("names lamports", lamports[0]?.title.includes("lamports") === true);
    check(
      "mentions the rent reserve",
      lamports[0]?.suggestion?.includes("rent-exempt") === true
    );

    const seeds = runRules(
      reportWith({
        error: errorWith({
          customCode: 2006,
          resolved: { source: "anchor-idl", name: "ConstraintSeeds", hex: "0x7d6" },
          anchor: {
            source: "src/lib.rs:42",
            account: "pool",
            code: "ConstraintSeeds",
            number: 2006,
            message: null,
          },
        }),
      })
    );
    check("fires on a seeds constraint", ids(seeds).includes("pda-seeds-mismatch"));
    check(
      "names the offending account",
      seeds[0]?.evidence.some((e) => e.includes("pool")) === true
    );
  }

  console.log("\nattribution caveat");
  {
    const shaky = runRules(
      reportWith({
        error: errorWith({
          customCode: 6004,
          attribution: { basis: "top-level-instruction", programId: "Router", mayBeWrong: true },
        }),
      })
    );
    check("warns when attribution is a guess", ids(shaky).includes("attribution-uncertain"));

    const solid = runRules(
      reportWith({
        error: errorWith({
          customCode: 6004,
          attribution: { basis: "logs", programId: "AMM", viaCpi: true, callerProgramId: "Router" },
        }),
      })
    );
    check("silent when the logs named the culprit", !ids(solid).includes("attribution-uncertain"));
  }

  console.log("\nengine");
  {
    check("a clean success produces no findings", runRules(reportWith({ outcome: "success" })).length === 0);
    check("every rule has a unique id", new Set(RULES.map((r) => r.id)).size === RULES.length);

    // A broken rule must cost its own finding and nothing else.
    const exploding: Rule = {
      id: "boom",
      check() {
        throw new Error("rule bug");
      },
    };
    const survived = runRules(
      reportWith({ error: errorWith({ runtimeError: "ComputationalBudgetExceeded" }) }),
      [exploding, ...RULES]
    );
    check("a throwing rule doesn't break the others", ids(survived).includes("compute-exhausted"));

    // Ordering: certain before likely.
    const mixed = runRules(
      reportWith({
        error: errorWith({
          customCode: 1,
          attribution: { basis: "logs", programId: "11111111111111111111111111111111", viaCpi: false, callerProgramId: null },
        }),
        compute: {
          consumed: 99_000,
          requested: 100_000,
          utilizationPct: 99,
          priorityMicroLamportsPerCu: null,
          hotspots: [],
        },
      })
    );
    check("certain findings rank above likely ones", mixed[0]?.confidence === "certain");
  }
}

async function live() {
  const rpc = process.env.RPC_URL;
  if (!rpc) {
    console.log("\n(skipping live checks — RPC_URL not set)");
    return;
  }
  const corpus: CorpusFile = JSON.parse(readFileSync(CORPUS_PATH, "utf8"));
  const connection = new Connection(rpc, "confirmed");
  console.log(`\nlive: running the rules over ${corpus.entries.length} corpus transactions`);

  let failed = 0;
  let diagnosed = 0;
  const byRule = new Map<string, number>();
  const falsePositives: string[] = [];
  const undiagnosed: string[] = [];

  for (const entry of corpus.entries) {
    const tx = await connection.getTransaction(entry.signature, {
      maxSupportedTransactionVersion: 0,
    });
    if (!tx?.meta) continue;
    const report = await buildDebugReport(entry.signature, tx, connection);

    if (report.outcome === "success") {
      // A rule claiming a cause on a transaction that worked is the failure
      // mode that would make the whole layer untrustworthy. `compute-near-limit`
      // is the one legitimate exception — it's advice, not a diagnosis.
      const claims = report.findings.filter((f) => f.ruleId !== "compute-near-limit");
      if (claims.length) falsePositives.push(`${entry.signature.slice(0, 8)}: ${ids(claims).join(", ")}`);
      continue;
    }

    failed++;
    if (report.findings.length) {
      diagnosed++;
      for (const f of report.findings) byRule.set(f.ruleId, (byRule.get(f.ruleId) ?? 0) + 1);
    } else {
      const label =
        report.error?.resolved?.name ??
        report.error?.runtimeError ??
        `custom ${report.error?.customCode}`;
      undiagnosed.push(`${label} (${entry.program.slice(0, 8)})`);
    }
  }

  console.log(`  diagnosed ${diagnosed}/${failed} failed transactions`);
  for (const [id, n] of [...byRule.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(n).padStart(3)}  ${id}`);
  }
  if (undiagnosed.length) {
    console.log("  no rule fired for:");
    for (const u of undiagnosed) console.log(`    ${u}`);
    console.log(
      "  (mostly custom codes from programs with no published IDL — without one,\n" +
        "   the code is a number and any diagnosis would be invention)"
    );
  }

  check(
    "no rule diagnoses a transaction that succeeded",
    falsePositives.length === 0,
    falsePositives.join("; ")
  );
  check("the rules fire on real failures", diagnosed > 0, `${diagnosed}/${failed}`);
}

async function main() {
  fixtures();
  if (process.argv.includes("--live")) await live();
  console.log(failures === 0 ? "\nall checks passed" : `\n${failures} check(s) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
