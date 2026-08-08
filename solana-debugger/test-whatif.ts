/**
 * test-whatif.ts — the counterfactual battery.
 *
 * Usage:
 *   npm run test:whatif            # fixtures, no network
 *   npm run test:whatif -- --live  # ...plus a real run (needs a surfnet)
 *
 * The fixtures cover the parts that can be wrong silently: rewriting a compute
 * limit inside two different message encodings, and the rendering that tells a
 * reader whether to believe any of it. The live pass checks the property the
 * whole battery rests on — that an unreproduced baseline is reported as
 * unreliable rather than quietly presented as fact.
 */

import { Connection, PublicKey, TransactionMessage, VersionedMessage } from "@solana/web3.js";
import { ComputeBudgetProgram, SystemProgram } from "@solana/web3.js";
import { readFileSync } from "node:fs";
import bs58 from "bs58";

import {
  bisectInstructions,
  formatBisect,
  sameFailure,
  type BisectReport,
} from "./lib/bisect.js";
import { CORPUS_PATH, type CorpusFile } from "./lib/corpus.js";
import {
  formatCounterfactuals,
  rewriteComputeLimit,
  runCounterfactuals,
  type CounterfactualReport,
} from "./lib/counterfactual.js";
import { surfnetCall } from "./lib/surfnet.js";

const SURFNET_RPC = process.env.SURFNET_RPC ?? "http://127.0.0.1:8899";

let failures = 0;
function check(name: string, ok: boolean, detail?: string) {
  if (!ok) failures++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}${ok || !detail ? "" : ` — ${detail}`}`);
}

const payer = PublicKey.default;
const other = new PublicKey(1);

/** Builds a message carrying a SetComputeUnitLimit, in the requested encoding. */
function messageWithLimit(units: number, version: "legacy" | "v0"): VersionedMessage {
  const msg = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: bs58.encode(Buffer.alloc(32, 7)),
    instructions: [
      ComputeBudgetProgram.setComputeUnitLimit({ units }),
      SystemProgram.transfer({ fromPubkey: payer, toPubkey: other, lamports: 1 }),
    ],
  });
  return version === "v0" ? msg.compileToV0Message() : msg.compileToLegacyMessage();
}

/** Reads back whatever limit the message now carries, independently of the writer. */
function readLimit(message: VersionedMessage): number | null {
  const v0 = message as unknown as {
    compiledInstructions?: { data: Uint8Array }[];
    instructions?: { data: string }[];
  };
  const datas: Buffer[] = v0.compiledInstructions
    ? v0.compiledInstructions.map((i) => Buffer.from(i.data))
    : (v0.instructions ?? []).map((i) => Buffer.from(bs58.decode(i.data)));
  for (const d of datas) {
    if (d.length === 5 && d[0] === 2) return d.readUInt32LE(1);
  }
  return null;
}

function fixtures() {
  console.log("rewriting the compute limit");
  for (const version of ["legacy", "v0"] as const) {
    const message = messageWithLimit(50_000, version);
    check(`${version}: reads the original limit back`, readLimit(message) === 50_000);
    const previous = rewriteComputeLimit(message, 1_400_000);
    check(`${version}: returns the previous limit`, previous === 50_000, String(previous));
    check(`${version}: the message now carries the new limit`, readLimit(message) === 1_400_000);
  }
  {
    // No ComputeBudget instruction at all — must decline, not invent one.
    const msg = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: bs58.encode(Buffer.alloc(32, 7)),
      instructions: [SystemProgram.transfer({ fromPubkey: payer, toPubkey: other, lamports: 1 })],
    }).compileToV0Message();
    check("declines when there is no limit to rewrite", rewriteComputeLimit(msg, 1_400_000) === null);
  }
  {
    // A ComputeBudget instruction that isn't SetComputeUnitLimit (this is
    // SetComputeUnitPrice) must not be overwritten — that would change the fee.
    const msg = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: bs58.encode(Buffer.alloc(32, 7)),
      instructions: [
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 }),
        SystemProgram.transfer({ fromPubkey: payer, toPubkey: other, lamports: 1 }),
      ],
    }).compileToV0Message();
    check("leaves a price instruction alone", rewriteComputeLimit(msg, 1_400_000) === null);
  }

  console.log("\nrendering");
  {
    const unreliable: CounterfactualReport = {
      signature: "sig",
      baseline: { err: { InstructionError: [0, "Other"] }, computeUnits: 10, matchedMainnet: false },
      originalErr: { InstructionError: [0, { Custom: 1 }] },
      reliable: false,
      results: [
        {
          id: "more-compute",
          label: "compute limit raised",
          outcome: "fixed",
          detail: "raised",
          err: null,
          computeUnits: 20,
          computeDelta: 10,
        },
      ],
    };
    const lines = formatCounterfactuals(unreliable).join("\n");
    check("warns loudly when the baseline didn't reproduce", lines.includes("did NOT reproduce"));
    check("tells the reader to discount the results", lines.includes("treat as noise"));
    // The conclusion line must not appear when the baseline is untrustworthy —
    // "this would have fixed it" is exactly the claim that can't be supported.
    check("withholds the conclusion when unreliable", !lines.includes("=>"));

    const reliable: CounterfactualReport = { ...unreliable, reliable: true };
    const good = formatCounterfactuals(reliable).join("\n");
    check("states the conclusion when the baseline held", good.includes("=>"));
    check("no scare warning when reliable", !good.includes("did NOT reproduce"));
  }
  {
    const report: CounterfactualReport = {
      signature: "sig",
      baseline: { err: { e: 1 }, computeUnits: 100, matchedMainnet: true },
      originalErr: { e: 1 },
      reliable: true,
      results: [
        { id: "a", label: "A", outcome: "unchanged", detail: "did a", err: { e: 1 }, computeUnits: 100, computeDelta: 0 },
        { id: "b", label: "B", outcome: "different-error", detail: "did b", err: { e: 2 }, computeUnits: 150, computeDelta: 50 },
        { id: "c", label: "C", outcome: "not-applicable", detail: "no tokens", err: null, computeUnits: null, computeDelta: null },
      ],
    };
    const lines = formatCounterfactuals(report).join("\n");
    check("shows the new error when one changed", lines.includes('now fails with {"e":2}'));
    check("explains a not-applicable probe", lines.includes("no tokens"));
    check("no conclusion line when nothing was fixed", !lines.includes("=>"));
  }
}

async function live() {
  const rpc = process.env.RPC_URL;
  if (!rpc) {
    console.log("\n(skipping live checks — RPC_URL not set)");
    return;
  }
  try {
    await surfnetCall(SURFNET_RPC, "getVersion", []);
  } catch {
    console.log(`\n(skipping live checks — no surfnet at ${SURFNET_RPC})`);
    return;
  }

  const corpus: CorpusFile = JSON.parse(readFileSync(CORPUS_PATH, "utf8"));
  const entry = corpus.entries.find((e) => e.outcome === "failed");
  if (!entry) {
    console.log("\n(no failed transaction in the corpus to probe)");
    return;
  }

  console.log(`\nlive: probing ${entry.signature.slice(0, 12)}…`);
  const mainnet = new Connection(rpc, "confirmed");
  const surfnet = new Connection(SURFNET_RPC, "confirmed");
  await surfnetCall(SURFNET_RPC, "surfnet_timeTravel", [{ absoluteSlot: entry.slot }]);

  const report = await runCounterfactuals({
    mainnet,
    surfnet,
    surfnetUrl: SURFNET_RPC,
    signature: entry.signature,
  });

  check("ran every probe", report.results.length === 4, `${report.results.length}`);
  check(
    "reliability tracks whether the baseline reproduced",
    report.reliable === report.baseline.matchedMainnet
  );
  check(
    "every probe reports an outcome and a reason",
    report.results.every((r) => r.outcome.length > 0 && r.detail.length > 0)
  );
  // A probe that couldn't be applied must never be reported as ruling anything
  // out — that would read as a tested hypothesis when nothing was tested.
  check(
    "not-applicable probes carry no error verdict",
    report.results.filter((r) => r.outcome === "not-applicable").every((r) => r.err === null)
  );

  for (const line of formatCounterfactuals(report)) console.log(`    ${line}`);
}

function bisectFixtures() {
  console.log("\nbisect: comparing failures across a shifting index");
  const at = (i: number, detail: unknown) => ({ InstructionError: [i, detail] });

  check(
    "same error at a shifted index is the same failure",
    sameFailure(at(5, { Custom: 6004 }), at(3, { Custom: 6004 }))
  );
  check(
    "a different code is a different failure",
    !sameFailure(at(5, { Custom: 6004 }), at(5, { Custom: 6005 }))
  );
  check(
    "a runtime error and a custom code differ",
    !sameFailure(at(1, "ComputationalBudgetExceeded"), at(1, { Custom: 1 }))
  );
  check("success is not a failure", !sameFailure(null, at(0, { Custom: 1 })));
  check("two successes match", sameFailure(null, null));
  check(
    "transaction-level errors compare whole",
    sameFailure("BlockhashNotFound", "BlockhashNotFound") &&
      !sameFailure("BlockhashNotFound", "AlreadyProcessed")
  );

  console.log("\nbisect: rendering");
  {
    const unreliable: BisectReport = {
      signature: "sig",
      originalErr: { InstructionError: [1, { Custom: 1 }] },
      baselineErr: { InstructionError: [1, { Custom: 9 }] },
      reliable: false,
      unavailable: null,
      totalInstructions: 3,
      required: [0, 1, 2],
      steps: [],
    };
    const lines = formatBisect(unreliable).join("\n");
    check("says the rebuild changed the outcome", lines.includes("changed its outcome"));
    check("never claims a minimal set when unreliable", !lines.includes("=>"));

    const unavailable = formatBisect({ ...unreliable, unavailable: "only one instruction" }).join("\n");
    check("explains why a bisect couldn't run", unavailable.includes("only one instruction"));

    const good: BisectReport = {
      signature: "sig",
      originalErr: { InstructionError: [1, { Custom: 1 }] },
      baselineErr: { InstructionError: [1, { Custom: 1 }] },
      reliable: true,
      unavailable: null,
      totalInstructions: 3,
      required: [1],
      steps: [
        { index: 0, programId: "P0", removable: true, outcomeWithout: null },
        { index: 1, programId: "P1", removable: false, outcomeWithout: { InstructionError: [0, "X"] } },
        { index: 2, programId: "P2", removable: true, outcomeWithout: null },
      ],
    };
    const out = formatBisect(good).join("\n");
    check("states the minimal set", out.includes("instructions [1] reproduce it"));
    check("shows why a kept instruction matters", out.includes('without it: {"InstructionError":[0,"X"]}'));
    check("counts what was dropped", out.includes("the other 2 are setup"));

    // The strongest evidence an instruction is needed: without it the whole
    // transaction succeeds. A null outcome must read as that, not as silence.
    const succeeds = formatBisect({
      ...good,
      steps: [{ index: 1, programId: "P1", removable: false, outcomeWithout: null }],
    }).join("\n");
    check(
      "a kept instruction whose removal succeeds says so",
      succeeds.includes("without it: the transaction succeeds")
    );
  }
}

async function liveBisect() {
  const rpc = process.env.RPC_URL;
  if (!rpc) return;
  try {
    await surfnetCall(SURFNET_RPC, "getVersion", []);
  } catch {
    return;
  }

  const corpus: CorpusFile = JSON.parse(readFileSync(CORPUS_PATH, "utf8"));
  // Pick the failed transaction with the most instructions — a bisect over two
  // instructions proves very little.
  const entry = corpus.entries
    .filter((e) => e.outcome === "failed")
    .sort((a, b) => b.instructions - a.instructions)[0];
  if (!entry) return;

  console.log(`\nlive: bisecting ${entry.signature.slice(0, 12)}… (${entry.instructions} instructions)`);
  const mainnet = new Connection(rpc, "confirmed");
  const surfnet = new Connection(SURFNET_RPC, "confirmed");
  await surfnetCall(SURFNET_RPC, "surfnet_timeTravel", [{ absoluteSlot: entry.slot }]);

  const report = await bisectInstructions({
    mainnet,
    surfnet,
    surfnetUrl: SURFNET_RPC,
    signature: entry.signature,
  });

  if (report.unavailable) {
    console.log(`  (bisect unavailable: ${report.unavailable})`);
    return;
  }
  if (!report.reliable) {
    console.log("  (rebuild changed the outcome — reported as unreliable, which is correct)");
    check("an unreliable bisect claims no minimal set", report.steps.length === 0);
    return;
  }

  check("considered every instruction", report.steps.length === report.totalInstructions);
  check("keeps at least one instruction", report.required.length >= 1);
  check(
    "the required set never grows beyond the original",
    report.required.length <= report.totalInstructions
  );
  // Every kept instruction must have justified itself: removing it either
  // changed the failure or made the transaction succeed outright. Both are
  // recorded, and a null outcome means the latter — never "no evidence".
  check(
    "every kept instruction is rendered with its evidence",
    report.steps
      .filter((s) => !s.removable)
      .every((s) => formatBisect(report).some((l) => l.includes("without it:")))
  );
  check(
    "required indexes and non-removable steps agree",
    JSON.stringify(report.required) ===
      JSON.stringify(report.steps.filter((s) => !s.removable).map((s) => s.index))
  );
  for (const line of formatBisect(report)) console.log(`    ${line}`);
}

async function main() {
  fixtures();
  bisectFixtures();
  if (process.argv.includes("--live")) {
    await live();
    await liveBisect();
  }
  console.log(failures === 0 ? "\nall checks passed" : `\n${failures} check(s) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
