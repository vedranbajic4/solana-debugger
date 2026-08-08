/**
 * test-report.ts — builds a DebugReport for real transactions and checks the
 * properties the type promises.
 *
 * Usage:
 *   npm run test:report            # first 6 corpus transactions
 *   npm run test:report -- --all   # the whole corpus
 *
 * The invariant that matters most is the JSON round-trip: the report exists so
 * `--json`, a stored artifact, and a later rule engine can all consume the same
 * conclusions, and a stray bigint or Buffer would break every one of those at
 * the point of use rather than here.
 */

import { Connection } from "@solana/web3.js";
import { readFileSync } from "node:fs";

import { CORPUS_PATH, type CorpusFile } from "./lib/corpus.js";
import { buildDebugReport, culpritFrame, headline } from "./lib/report.js";

let failures = 0;
function check(name: string, ok: boolean, detail?: string) {
  if (!ok) failures++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}${ok || !detail ? "" : ` — ${detail}`}`);
}

/** Walks a value looking for anything JSON can't represent faithfully. */
function unserializable(value: unknown, path = "$"): string | null {
  if (typeof value === "bigint") return `${path}: bigint`;
  if (Buffer.isBuffer(value)) return `${path}: Buffer`;
  if (typeof value === "function" || typeof value === "undefined") return null;
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      const found = unserializable(v, `${path}.${k}`);
      if (found) return found;
    }
  }
  return null;
}

async function main() {
  const rpc = process.env.RPC_URL;
  if (!rpc) {
    console.error("RPC_URL is required");
    process.exit(1);
  }
  const corpus: CorpusFile = JSON.parse(readFileSync(CORPUS_PATH, "utf8"));
  const entries = process.argv.includes("--all") ? corpus.entries : corpus.entries.slice(0, 6);
  const connection = new Connection(rpc, "confirmed");

  console.log(`building reports for ${entries.length} transaction(s)\n`);

  let built = 0;
  let failedTx = 0;
  let attributed = 0;
  let viaCpi = 0;

  for (const entry of entries) {
    const tx = await connection.getTransaction(entry.signature, {
      maxSupportedTransactionVersion: 0,
    });
    if (!tx?.meta) continue;
    const report = await buildDebugReport(entry.signature, tx, connection);
    built++;

    const short = entry.signature.slice(0, 8);

    // Serializable end to end — the property the whole type rests on.
    const bad = unserializable(report);
    check(`${short} report is JSON-safe`, bad === null, bad ?? undefined);
    const roundTripped = JSON.parse(JSON.stringify(report));
    check(`${short} survives a JSON round-trip`, roundTripped.signature === entry.signature);

    // Agrees with the chain.
    check(`${short} outcome matches meta.err`, report.outcome === entry.outcome);
    check(`${short} slot matches`, report.slot === tx.slot);
    check(
      `${short} compute matches meta`,
      report.compute.consumed === Number(tx.meta.computeUnitsConsumed ?? 0)
    );
    check(`${short} headline is non-empty`, headline(report).length > 0);

    if (report.outcome === "failed") {
      failedTx++;
      check(`${short} failed report carries an error`, report.error !== null);
      const basis = report.error?.attribution.basis;
      if (basis === "logs") {
        attributed++;
        if (report.error?.attribution.basis === "logs" && report.error.attribution.viaCpi) viaCpi++;
        // When the logs named the culprit, the tree's deepest failed frame is
        // the same program — two independent readings of the same evidence.
        const frame = culpritFrame(report);
        check(
          `${short} call tree agrees with log attribution`,
          frame === null || frame.programId === report.error?.attribution.programId,
          `tree=${frame?.programId}`
        );
      }
      // An unreliable attribution must say so where a reader will see it.
      if (basis === "top-level-instruction") {
        check(
          `${short} warns that attribution may be wrong`,
          report.warnings.some((w) => w.includes("CPI")) ||
            report.error?.customCode === null
        );
      }
    }

    // Movement bookkeeping.
    const negative = report.movements.lamports.some((m) => m.delta < 0);
    check(
      `${short} some account paid (fee at minimum)`,
      negative || report.movements.lamports.length === 0
    );
  }

  console.log(
    `\nbuilt ${built} report(s): ${failedTx} failed, ` +
      `${attributed} attributed from logs (${viaCpi} of those via CPI)`
  );
  console.log(failures === 0 ? "all checks passed" : `${failures} check(s) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
