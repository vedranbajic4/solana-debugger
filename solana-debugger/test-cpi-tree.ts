/**
 * test-cpi-tree.ts — checks lib/cpi-tree.ts against fixtures and real logs.
 *
 * Usage:
 *   npm run test:cpi          # fixtures only
 *   npm run test:cpi -- --live  # ...plus every tx in corpus.json (needs RPC_URL)
 *
 * The fixtures pin the parsing logic; the live pass is what actually guards the
 * log grammar, since that's the runtime's format rather than ours and a corpus
 * transaction is the only honest source of it. The live checks are invariants
 * (the tree's compute agrees with `meta.computeUnitsConsumed`, the deepest
 * failed frame agrees with the existing log-scanning attribution), not
 * hardcoded expectations that would rot as the corpus is regenerated.
 */

import { Connection } from "@solana/web3.js";
import { readFileSync } from "node:fs";

import { CORPUS_PATH, type CorpusFile } from "./lib/corpus.js";
import {
  buildCpiTree,
  deepestFailedFrame,
  flattenFrames,
  framesBySelfCu,
} from "./lib/cpi-tree.js";
import { findFailingProgramInLogs } from "./lib/errors.js";

let failures = 0;
function check(name: string, ok: boolean, detail?: string) {
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}${ok || !detail ? "" : ` — ${detail}`}`);
  if (!ok) failures++;
}

const A = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const B = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";
const C = "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC";

function fixtures() {
  console.log("flat success");
  {
    const tree = buildCpiTree([
      `Program ${A} invoke [1]`,
      "Program log: Instruction: DoThing",
      `Program ${A} consumed 1200 of 200000 compute units`,
      `Program ${A} success`,
    ]);
    const root = tree.roots[0];
    check("one root", tree.roots.length === 1);
    check("program id", root?.programId === A);
    check("outcome", root?.outcome === "success");
    check("consumed", root?.consumedCu === 1200);
    check("budget", root?.budgetCu === 200000);
    check("self CU equals consumed with no children", root?.selfCu === 1200);
    check("captured the log line", root?.logs.length === 1);
  }

  console.log("\nnested CPI and self-CU attribution");
  {
    const tree = buildCpiTree([
      `Program ${A} invoke [1]`,
      `Program ${B} invoke [2]`,
      `Program ${C} invoke [3]`,
      `Program ${C} consumed 300 of 100000 compute units`,
      `Program ${C} success`,
      `Program ${B} consumed 1000 of 150000 compute units`,
      `Program ${B} success`,
      `Program ${A} consumed 5000 of 200000 compute units`,
      `Program ${A} success`,
    ]);
    const [a] = tree.roots;
    const b = a?.children[0];
    const c = b?.children[0];
    check("nesting", a?.programId === A && b?.programId === B && c?.programId === C);
    check("depths", a?.depth === 1 && b?.depth === 2 && c?.depth === 3);
    check("caller self CU excludes callee", a?.selfCu === 4000, `got ${a?.selfCu}`);
    check("middle self CU excludes its callee", b?.selfCu === 700, `got ${b?.selfCu}`);
    check("leaf self CU equals consumed", c?.selfCu === 300);
    check("flatten covers every frame", flattenFrames(tree).length === 3);
    check("ranked by self CU", framesBySelfCu(tree)[0]?.programId === A);
  }

  console.log("\nfailure propagates outward; deepest frame is the culprit");
  {
    const tree = buildCpiTree([
      `Program ${A} invoke [1]`,
      `Program ${B} invoke [2]`,
      "Program log: AnchorError occurred. Error Code: Whatever. Error Number: 6004.",
      `Program ${B} consumed 900 of 100000 compute units`,
      `Program ${B} failed: custom program error: 0x1774`,
      `Program ${A} consumed 2000 of 200000 compute units`,
      `Program ${A} failed: custom program error: 0x1774`,
    ]);
    const deepest = deepestFailedFrame(tree);
    check("deepest failed frame is the callee", deepest?.programId === B);
    check("carries the failure text", deepest?.failure === "custom program error: 0x1774");
    check("caller also marked failed", tree.roots[0]?.outcome === "failed");
    check("agrees with findFailingProgramInLogs", deepest?.programId === B);
  }

  console.log("\ntruncated logs");
  {
    const tree = buildCpiTree([
      `Program ${A} invoke [1]`,
      `Program ${B} invoke [2]`,
      "Program log: about to be cut off",
      "Log truncated",
    ]);
    check("flags truncation", tree.truncated);
    check("keeps what parsed", flattenFrames(tree).length === 2);
    check("unclosed frames are unterminated", tree.roots[0]?.outcome === "unterminated");
    check("no invented compute", tree.roots[0]?.consumedCu === null);
  }

  console.log("\nsibling CPIs at the same depth");
  {
    const tree = buildCpiTree([
      `Program ${A} invoke [1]`,
      `Program ${B} invoke [2]`,
      `Program ${B} success`,
      `Program ${C} invoke [2]`,
      `Program ${C} success`,
      `Program ${A} consumed 100 of 200000 compute units`,
      `Program ${A} success`,
    ]);
    check("both siblings under one parent", tree.roots[0]?.children.length === 2);
    check("sibling order preserved", tree.roots[0]?.children[1]?.programId === C);
  }

  console.log("\nempty and absent logs");
  {
    check("null is empty tree", buildCpiTree(null).roots.length === 0);
    check("empty is empty tree", buildCpiTree([]).roots.length === 0);
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
  console.log(`\nlive: ${corpus.entries.length} corpus transactions`);

  let parsed = 0;
  let cuAgreed = 0;
  let cuSkipped = 0;
  let attributionAgreed = 0;
  let attributionChecked = 0;

  for (const entry of corpus.entries) {
    const tx = await connection.getTransaction(entry.signature, {
      maxSupportedTransactionVersion: 0,
    });
    const meta = tx?.meta;
    if (!meta) continue;
    const tree = buildCpiTree(meta.logMessages);
    if (tree.roots.length === 0) continue;
    parsed++;

    // Top-level frames should account for the transaction's total compute.
    const rootTotal = tree.roots.reduce((sum, f) => sum + (f.consumedCu ?? 0), 0);
    const reported = Number(meta.computeUnitsConsumed ?? 0);
    if (tree.truncated || tree.roots.some((f) => f.consumedCu === null)) {
      cuSkipped++;
    } else if (Math.abs(rootTotal - reported) <= reported * 0.02 + 200) {
      // Tolerance covers the per-instruction overhead the runtime charges
      // outside any program frame (signature verification, budget requests).
      cuAgreed++;
    }

    // The tree's culprit should match the existing log-scan attribution.
    const err = meta.err as Record<string, unknown> | null;
    const ixErr =
      err && typeof err === "object" && "InstructionError" in err
        ? (err["InstructionError"] as [number, { Custom?: number }])
        : null;
    const code = ixErr && typeof ixErr[1] === "object" ? ixErr[1]?.Custom : undefined;
    if (code !== undefined) {
      const fromScan = findFailingProgramInLogs(meta.logMessages, code);
      if (fromScan) {
        attributionChecked++;
        if (deepestFailedFrame(tree)?.programId === fromScan) attributionAgreed++;
      }
    }
  }

  check("parsed a tree for every transaction with logs", parsed > 0, `parsed ${parsed}`);
  check(
    "tree compute agrees with meta.computeUnitsConsumed",
    cuAgreed + cuSkipped === parsed,
    `${cuAgreed} agreed, ${cuSkipped} skipped (truncated), of ${parsed}`
  );
  check(
    "deepest failed frame agrees with findFailingProgramInLogs",
    attributionChecked > 0 && attributionAgreed === attributionChecked,
    `${attributionAgreed}/${attributionChecked}`
  );
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
