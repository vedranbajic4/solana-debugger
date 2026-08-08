/**
 * verify-replay.ts — run the whole corpus through the replay pipeline and
 * report how often the fork reproduces mainnet.
 *
 * Usage:
 *   npm run verify                     # whole corpus
 *   npm run verify -- --only failed    # just the failed txs
 *   npm run verify -- --limit 5 -v     # first 5, with logs on mismatch
 *   npm run verify -- --json           # machine-readable result
 *
 * This is the honesty check on the replay: every other feature in this tool
 * reads state off the fork and reasons about it, and all of that is worthless
 * if the fork doesn't land on the same outcome mainnet did. The number to watch
 * is the match rate on *failed* transactions — reproducing a failure is the
 * whole job, and it's the harder half, since a failure often depends on the
 * exact program state that put it over the edge.
 *
 * Runs sequentially on purpose: replays share one surfnet, and seeding writes
 * to it, so overlapping runs would seed over each other's state.
 */

import { Connection } from "@solana/web3.js";
import { readFileSync } from "node:fs";

import { CORPUS_PATH, type CorpusEntry, type CorpusFile } from "./lib/corpus.js";
import { replayTransaction, ReplayError, type ReplayResult } from "./lib/replay.js";


const SURFNET_RPC = process.env.SURFNET_RPC ?? "http://127.0.0.1:8899";
const ARCHIVE_RPC = process.env.ARCHIVE_RPC;

/**
 * Whether the run had real historical state underneath it. Reported alongside
 * the match rate because it changes what the rate means: the same corpus scored
 * with and without an archive is two different measurements.
 */
function describeArchive(result: ReplayResult): string {
  switch (result.archive.status) {
    case "off":
      return "off (no ARCHIVE_RPC — replaying on present-day state)";
    case "unsupported":
      return `unsupported: ${result.archive.reason}`;
    case "injected":
      return `injecting historical state (${result.archive.report.injected} account(s) on the last tx)`;
  }
}

type Verdict = "match" | "mismatch" | "error";

type Row = {
  entry: CorpusEntry;
  verdict: Verdict;
  originalErr: string;
  replayedErr: string;
  computeDelta: number | null;
  clockForked: boolean;
  /** The recorded mainnet outcome no longer matches what the RPC returns. */
  corpusStale: boolean;
  detail: string | null;
  logs: string[];
};

const errText = (err: unknown) => (err === null ? "ok" : JSON.stringify(err));

function classify(result: ReplayResult, entry: CorpusEntry): Row {
  const originalErr = errText(result.originalErr);
  return {
    entry,
    verdict: result.match ? "match" : "mismatch",
    originalErr,
    replayedErr: errText(result.replayedErr),
    computeDelta:
      result.replayedComputeUnits === null
        ? null
        : result.replayedComputeUnits - result.originalComputeUnits,
    clockForked: result.clockForked,
    corpusStale: originalErr !== (entry.err ?? "ok"),
    detail: null,
    logs: result.replayedLogs,
  };
}

/** `+6`, `-12`, `0` — CU drift between mainnet and the replay. */
const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

function pct(n: number, of: number) {
  return of === 0 ? "n/a" : `${((n / of) * 100).toFixed(1)}%`;
}

function report(rows: Row[], verbose: boolean, archiveStatus: string) {
  const matched = rows.filter((r) => r.verdict === "match");
  const mismatched = rows.filter((r) => r.verdict === "mismatch");
  const errored = rows.filter((r) => r.verdict === "error");
  const comparable = rows.length - errored.length;

  console.log(`\n=== MATCH RATE ===`);
  console.log(
    `  overall   ${matched.length}/${comparable} (${pct(matched.length, comparable)})` +
      (errored.length ? `  [${errored.length} not replayable]` : "")
  );

  // Split by outcome: reproducing a failure is the harder and more important
  // half, so a headline number that hides it would be flattering and useless.
  for (const outcome of ["failed", "success"] as const) {
    const group = rows.filter((r) => r.entry.outcome === outcome && r.verdict !== "error");
    if (group.length === 0) continue;
    const hits = group.filter((r) => r.verdict === "match").length;
    console.log(
      `  ${outcome.padEnd(9)} ${hits}/${group.length} (${pct(hits, group.length)})`
    );
  }

  // CU drift is a softer signal than the error: a replay can land on the same
  // error having burned different compute, which usually means the fork's
  // program state differs even though the outcome didn't.
  const deltas = matched
    .map((r) => r.computeDelta)
    .filter((d): d is number => d !== null)
    .map(Math.abs)
    .sort((a, b) => a - b);
  if (deltas.length) {
    const exact = deltas.filter((d) => d === 0).length;
    console.log(
      `  compute   ${exact}/${deltas.length} exact, median drift ${deltas[Math.floor(deltas.length / 2)]} CU, max ${deltas[deltas.length - 1]} CU`
    );
  }

  const unforked = rows.filter((r) => r.verdict !== "error" && !r.clockForked).length;
  if (unforked) {
    console.log(
      `  clock     ${unforked}/${comparable} replayed with a present-day Clock sysvar\n` +
        `            (surfnet_timeTravel only moves forward — regenerate the corpus\n` +
        `            with 'npm run corpus', or restart surfpool below these slots)`
    );
  }
  const stale = rows.filter((r) => r.corpusStale).length;
  if (stale) {
    console.log(`  corpus    ${stale} entr(ies) no longer match the recorded mainnet outcome`);
  }
  console.log(`  archive   ${archiveStatus}`);

  if (mismatched.length) {
    console.log(`\n=== MISMATCHES ===`);
    for (const r of mismatched) {
      console.log(`  ${r.entry.signature}`);
      console.log(`    program  ${r.entry.program}`);
      console.log(`    mainnet  ${r.originalErr}`);
      console.log(`    replay   ${r.replayedErr}`);
      if (verbose && r.logs.length) {
        console.log(`    logs:`);
        for (const l of r.logs) console.log(`      ${l}`);
      }
    }
    if (!verbose) console.log(`\n  (-v prints the replayed logs for each mismatch)`);
  }

  if (errored.length) {
    console.log(`\n=== NOT REPLAYABLE ===`);
    for (const r of errored) {
      console.log(`  ${r.entry.signature}  ${r.detail}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes("--verbose") || args.includes("-v");
  const asJson = args.includes("--json");
  const onlyArg = args.indexOf("--only");
  const only = onlyArg >= 0 ? args[onlyArg + 1] : null;
  const limitArg = args.indexOf("--limit");
  const limit = limitArg >= 0 ? Number(args[limitArg + 1]) : Infinity;

  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) {
    console.error("RPC_URL environment variable is required");
    process.exit(1);
  }

  const corpus: CorpusFile = JSON.parse(readFileSync(CORPUS_PATH, "utf8"));
  const entries = corpus.entries
    .filter((e) => !only || e.outcome === only)
    .slice(0, limit);

  if (!asJson) {
    console.log(
      `replaying ${entries.length} transaction(s) from a corpus generated ${corpus.generatedAt}`
    );
    console.log(`surfnet: ${SURFNET_RPC}\n`);
  }

  const mainnet = new Connection(rpcUrl, "confirmed");
  const surfnet = new Connection(SURFNET_RPC, "confirmed");

  const rows: Row[] = [];
  let archiveStatus = ARCHIVE_RPC ? "configured, not yet probed" : "off (no ARCHIVE_RPC)";
  for (const [i, entry] of entries.entries()) {
    let row: Row;
    try {
      const result = await replayTransaction({
        mainnet,
        surfnet,
        surfnetUrl: SURFNET_RPC,
        signature: entry.signature,
        archiveUrl: ARCHIVE_RPC,
      });
      archiveStatus = describeArchive(result);
      row = classify(result, entry);
    } catch (e) {
      row = {
        entry,
        verdict: "error",
        originalErr: entry.err ?? "ok",
        replayedErr: "-",
        computeDelta: null,
        clockForked: false,
        corpusStale: false,
        detail:
          e instanceof ReplayError ? `${e.failure.kind}: ${e.failure.detail}` : String(e),
        logs: [],
      };
    }
    rows.push(row);

    if (!asJson) {
      const mark = { match: "ok  ", mismatch: "DIFF", error: "ERR " }[row.verdict];
      const cu = row.computeDelta === null ? "" : `${signed(row.computeDelta)} CU`;
      console.log(
        `[${String(i + 1).padStart(2)}/${entries.length}] ${mark} ` +
          `${entry.outcome.padEnd(7)} ${entry.version.padEnd(6)} ` +
          `${entry.signature.slice(0, 12)}…  ${row.originalErr.slice(0, 42).padEnd(42)} ` +
          `${cu}${row.clockForked ? "" : "  [stale clock]"}`
      );
    }
  }

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          corpusGeneratedAt: corpus.generatedAt,
          archive: archiveStatus,
          total: rows.length,
          matched: rows.filter((r) => r.verdict === "match").length,
          rows: rows.map(({ logs: _l, entry, ...r }) => ({
            signature: entry.signature,
            outcome: entry.outcome,
            program: entry.program,
            ...r,
          })),
        },
        null,
        2
      )
    );
    return;
  }

  report(rows, verbose, archiveStatus);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
