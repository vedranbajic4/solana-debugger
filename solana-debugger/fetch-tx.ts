/**
 * fetch-tx.ts — fetch a transaction and print a decoded post-mortem.
 *
 * Usage:
 *   npm run fetch <SIGNATURE>
 *   npm run fetch <SIGNATURE> -- --verbose
 *   npm run fetch <SIGNATURE> -- --json
 *
 * A renderer over `lib/report.ts`, the way `replay-tx.ts` is one over
 * `lib/replay.ts`. Everything printed here was concluded by
 * `buildDebugReport()` — nothing is worked out in this file. That is what makes
 * `--json` the same answer as the text rather than a second implementation of
 * it, and it is why the old GATHER block is gone.
 *
 * The output has two tiers, and three rules keep them honest:
 *
 * - **Default** is the root-cause SUMMARY and what moved. Nothing else.
 * - **`--verbose`** adds the evidence: call tree, logs, instructions, accounts,
 *   raw meta.
 * - Anything that changes how much to *trust* the summary — a shaky
 *   attribution, truncated logs — is a `warning` row in the summary, never only
 *   in a section behind `--verbose`. `report.warnings` carries those, so a new
 *   caveat reaches the default view without this file being touched.
 * - A section with nothing to say prints no header at all.
 */

import { Connection, type VersionedTransactionResponse } from "@solana/web3.js";

import { formatCpiTree } from "./lib/cpi-tree.js";
import { decodeComputeBudgetIx, normalizeInstructions } from "./lib/decode.js";
import { buildDebugReport, type DebugReport } from "./lib/report.js";

const COMPUTE_BUDGET_PROGRAM = "ComputeBudget111111111111111111111111111111";

const sol = (n: number) => `${n} lamports (${(n / 1e9).toFixed(9)} SOL)`;

/** JSON.stringify replacer that survives BigInt values. */
const bigintSafe = (_key: string, value: unknown) =>
  typeof value === "bigint" ? value.toString() : value;

function section(title: string) {
  console.log(`\n=== ${title} ===`);
}

/** Pads a summary label so the values line up in a column. */
const row = (label: string, value: string) => console.log(`  ${label.padEnd(11)} ${value}`);

/** Wraps at word boundaries so a long caveat stays inside the label column. */
function wrap(text: string, width: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && line.length + word.length + 1 > width) {
      out.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) out.push(line);
  return out;
}

// ------------------------------------------------------------------ summary

function renderSummary(report: DebugReport) {
  section("SUMMARY");

  const when = report.blockTime ?? "unknown time";
  console.log(
    `${report.outcome === "failed" ? "FAILED" : "SUCCESS"}  slot ${report.slot}  ` +
      `${report.version}  ${when}`
  );

  const e = report.error;
  if (e) {
    if (e.instructionIndex !== null) {
      row("instruction", `[${e.instructionIndex}] of ${report.instructions.length}`);
    }
    if (e.attribution.basis !== "none") row("program", e.attribution.programId);
    if (e.attribution.basis === "logs" && e.attribution.viaCpi) {
      row("", `via CPI from ${e.attribution.callerProgramId}`);
    }

    if (e.customCode !== null) {
      const name = e.resolved?.name ?? e.anchor?.code ?? null;
      if (name) {
        row(
          "error",
          `${name}  (custom ${e.customCode} / ${e.hex}, via ${e.resolved?.source ?? "logs"})`
        );
        const message = e.resolved?.msg ?? e.anchor?.message;
        if (message && message !== name) row("message", message);
      } else {
        row("error", `custom ${e.customCode} (${e.hex}) — unresolved`);
        // The note explains *why* it's unresolved; its leading "Custom error N
        // from <program>" would just repeat the line above.
        const why = e.resolved?.note?.split(" — ").pop();
        if (why) row("note", why);
      }
    } else if (e.runtimeExplanation) {
      // The identifier alone is accurate and unhelpful; the meaning is the answer.
      row("error", `${e.runtimeExplanation.name} — ${e.runtimeExplanation.meaning}`);
      if (e.runtimeExplanation.cause) {
        for (const [i, line] of wrap(e.runtimeExplanation.cause, 62).entries()) {
          row(i === 0 ? "usually" : "", line);
        }
      }
    } else {
      row("error", JSON.stringify(e.runtimeError ?? e.raw, bigintSafe));
    }

    // The constraint/account and source line are what actually locate the bug.
    if (e.anchor?.account) row("account", `${e.anchor.account}  (constraint that tripped)`);
    if (e.anchor?.source) row("at", e.anchor.source);
    if (!e.anchor && e.logHint) row("log", e.logHint);
  } else {
    row("instructions", `${report.instructions.length}`);
  }

  const c = report.compute;
  const computeText =
    c.requested !== null
      ? `${c.consumed} of ${c.requested} CU (${c.utilizationPct?.toFixed(1)}%)`
      : `${c.consumed} CU (no explicit limit set — default applies)`;
  row(
    "compute",
    computeText +
      (c.priorityMicroLamportsPerCu !== null
        ? `, ${c.priorityMicroLamportsPerCu} microLamports/CU priority`
        : "")
  );
  row(
    "fee",
    sol(report.fee.total) +
      (report.fee.priority > 0 ? `  (${report.fee.priority} of it priority)` : "")
  );

  // Caveats travel with the conclusions they qualify — never only in a section
  // the reader might not print.
  for (const warning of report.warnings) {
    for (const [i, line] of wrap(warning, 62).entries()) row(i === 0 ? "warning" : "", line);
  }
}

// ---------------------------------------------------------------- movements

function renderMovements(report: DebugReport, verbose: boolean) {
  const { lamports, tokens } = report.movements;

  // A failed tx only ever moves the fee, which the summary already reports, so
  // by default this section would just restate it.
  if (verbose || report.outcome === "success") {
    section("BALANCE DELTAS");
    if (lamports.length) {
      for (const m of lamports) {
        console.log(`  ${m.pubkey}  ${m.delta > 0 ? "+" : ""}${m.delta} lamports`);
      }
    } else {
      console.log("  (no lamport movement)");
    }
    if (report.outcome === "failed" && lamports.length) {
      console.log(
        "\n  note: transaction failed — any movement here is fee only; " +
          "program state was rolled back"
      );
    }
  }

  // Only worth a header when something actually moved.
  if (tokens.length) {
    section("TOKEN BALANCE DELTAS");
    for (const t of tokens) {
      const sign = t.delta.startsWith("-") ? "" : "+";
      console.log(`  ${t.pubkey}  mint ${t.mint}  ${sign}${t.delta}`);
    }
  }
}

// ------------------------------------------------------------------- detail

function renderDetail(report: DebugReport, tx: VersionedTransactionResponse) {
  const meta = tx.meta!;

  section("STATUS");
  console.log(
    report.outcome === "failed"
      ? `FAILED: ${JSON.stringify(report.error?.raw, bigintSafe)}`
      : "SUCCESS"
  );
  console.log(`slot: ${report.slot}`);
  console.log(`version: ${report.version}`);
  if (report.blockTime) console.log(`blockTime: ${report.blockTime}`);

  const e = report.error;
  if (e) {
    section("RESOLVED ERROR");
    console.log(`attribution: ${e.attribution.basis}`);
    if (e.attribution.basis === "logs") {
      console.log(`failing program: ${e.attribution.programId}`);
      if (e.attribution.viaCpi) {
        console.log(`  reached via CPI from ${e.attribution.callerProgramId}`);
      }
    } else if (e.attribution.basis === "top-level-instruction") {
      console.log(`failing program: ${e.attribution.programId}  (top-level — may be wrong)`);
    }

    if (e.customCode !== null) {
      console.log(`custom code: ${e.customCode} (${e.hex})`);
      if (e.resolved) console.log("resolution:", JSON.stringify(e.resolved, bigintSafe, 2));
    } else if (e.runtimeExplanation) {
      console.log(`runtime error: ${e.runtimeExplanation.name}`);
      console.log(`  means:   ${e.runtimeExplanation.meaning}`);
      if (e.runtimeExplanation.cause) console.log(`  usually: ${e.runtimeExplanation.cause}`);
    } else if (e.runtimeError) {
      console.log(`runtime error: ${e.runtimeError}  (no table entry)`);
    }
    if (e.anchor) console.log("anchor log:", JSON.stringify(e.anchor, bigintSafe, 2));
  }

  section("COMPUTE BUDGET");
  console.log(
    `consumed: ${report.compute.consumed} CU` +
      (report.compute.requested !== null
        ? ` of ${report.compute.requested} requested (${report.compute.utilizationPct}%)`
        : " (no explicit limit set)")
  );
  if (report.compute.priorityMicroLamportsPerCu !== null) {
    console.log(`priority price: ${report.compute.priorityMicroLamportsPerCu} microLamports/CU`);
  }
  // Self-CU, so a router isn't billed for the work of what it called.
  if (report.compute.hotspots.length) {
    console.log("by program (own work, excluding CPIs it made):");
    for (const h of report.compute.hotspots) {
      console.log(`  ${String(h.selfCu).padStart(8)} CU  ${h.programId}  (depth ${h.depth})`);
    }
  }

  section("FEE");
  console.log(`total:    ${sol(report.fee.total)}`);
  console.log(
    `base:     ${sol(report.fee.base)}  (${report.fee.numSigners} signature(s), rate assumed)`
  );
  console.log(`priority: ${sol(report.fee.priority)}`);
  if (report.fee.priority < 0) {
    console.log(
      "  note: negative priority fee means the base rate assumption is wrong for this slot"
    );
  }

  // The call tree is the logs with their structure put back, so it comes first.
  if (report.callTree.roots.length) {
    section("CALL TREE");
    for (const line of formatCpiTree(report.callTree)) console.log(line);
  }

  section("LOG MESSAGES");
  if (meta.logMessages?.length) {
    for (const line of meta.logMessages) console.log(line);
  } else {
    console.log("(none)");
  }

  section("TOP-LEVEL INSTRUCTIONS");
  const normalized = normalizeInstructions(tx);
  report.instructions.forEach((ix, i) => {
    console.log(`  [${i}] ${ix.programId}${ix.failed ? "   <-- FAILED HERE" : ""}`);
    const raw = normalized[i];

    if (ix.decoded) {
      const args = Object.entries(ix.decoded.args)
        .filter(([, v]) => v !== null)
        .map(([k, v]) => `${k}=${typeof v === "object" ? JSON.stringify(v) : v}`)
        .join(" ");
      console.log(`        ${ix.decoded.program} ${ix.decoded.name}${args ? `  ${args}` : ""}`);
      if (ix.decoded.partial) console.log(`        (partial: ${ix.decoded.partial})`);
      for (const a of ix.decoded.accounts) console.log(`          ${a.role}: ${a.pubkey}`);
    } else {
      for (const a of raw?.accounts ?? []) {
        const flags = [a.signer && "signer", a.writable && "writable"].filter(Boolean).join(", ");
        console.log(`        ${a.pubkey}${flags ? ` (${flags})` : ""}`);
      }
      if (ix.programId === COMPUTE_BUDGET_PROGRAM && raw) {
        console.log(
          `        decoded: ${JSON.stringify(decodeComputeBudgetIx(raw.dataBase64), bigintSafe)}`
        );
      }
    }
    if (raw) console.log(`        data: ${raw.dataBase64}`);
  });

  section("INNER INSTRUCTIONS");
  if (meta.innerInstructions?.length) {
    const keys = tx.transaction.message.getAccountKeys({
      accountKeysFromLookups: meta.loadedAddresses || null,
    });
    for (const inner of meta.innerInstructions) {
      console.log(`  from top-level instruction [${inner.index}]:`);
      inner.instructions.forEach((ix, j) => {
        console.log(`    [${j}] ${keys.get(ix.programIdIndex)?.toBase58() ?? "<unknown>"}`);
      });
    }
  } else {
    console.log("  (none — no CPIs, or the tx failed before making any)");
  }

  section("ACCOUNT KEYS TOUCHED");
  for (const a of report.accounts) {
    const flags = [
      a.signer && "signer",
      a.writable && "writable",
      a.fromLookupTable && "from lookup table",
    ]
      .filter(Boolean)
      .join(", ");
    console.log(`  ${a.pubkey}${flags ? ` (${flags})` : ""}`);
  }

  section("RAW META (for later diffing/decoding)");
  console.log(JSON.stringify(meta, null, 2));
}

// --------------------------------------------------------------------- main

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes("--verbose") || args.includes("-v");
  const asJson = args.includes("--json");
  const signature = args.find((a) => !a.startsWith("-"));

  if (!signature) {
    console.error("usage: npm run fetch <SIGNATURE> [-- --verbose | --json]");
    process.exit(1);
  }
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) {
    console.error("RPC_URL environment variable is required");
    process.exit(1);
  }

  const connection = new Connection(rpcUrl, "confirmed");
  const tx = await connection.getTransaction(signature, { maxSupportedTransactionVersion: 0 });

  if (!tx) {
    console.error(
      `transaction ${signature} not found — it may be older than your RPC's retention window`
    );
    process.exit(1);
  }
  if (!tx.meta) {
    console.error("transaction found but meta is null — nothing to decode");
    process.exit(1);
  }

  const report = await buildDebugReport(signature, tx, connection);

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  renderSummary(report);
  renderMovements(report, verbose);

  if (!verbose) {
    console.log("\n  (--verbose adds the call tree, logs, instructions and raw meta)");
    return;
  }
  renderDetail(report, tx);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
