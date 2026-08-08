/**
 * replay-tx.ts — re-run a mainnet transaction against a local surfnet fork and
 * compare the outcome, plus the account state it moved.
 *
 * Usage:
 *   npm run replay <SIGNATURE>
 *
 * The pipeline itself lives in `lib/replay.ts`; this file is the printer. See
 * `verify-replay.ts` for the batch version that reports a match rate.
 */

import { Connection } from "@solana/web3.js";

import {
  formatAccountDiff,
  formatSnapshot,
  snapshotFromAccountInfo,
} from "./lib/accounts.js";
import { replayTransaction, ReplayError } from "./lib/replay.js";

const SURFNET_RPC = process.env.SURFNET_RPC ?? "http://127.0.0.1:8899";

function section(title: string) {
  console.log(`\n=== ${title} ===`);
}

async function main(signature: string) {
  const mainnetRpc = process.env.RPC_URL;
  if (!mainnetRpc) {
    console.error("RPC_URL environment variable is required");
    process.exit(1);
  }
  if (!signature) {
    console.error("usage: npm run replay <SIGNATURE>");
    process.exit(1);
  }

  const result = await replayTransaction({
    mainnet: new Connection(mainnetRpc, "confirmed"),
    surfnet: new Connection(SURFNET_RPC, "confirmed"),
    surfnetUrl: SURFNET_RPC,
    signature,
    archiveUrl: process.env.ARCHIVE_RPC,
  });

  if (result.clockWarning) {
    console.log(`\nwarning: ${result.clockWarning}`);
    console.log(
      "  surfnet_timeTravel only moves forward and a running surfnet's clock keeps\n" +
        "  advancing, so a fork started after this tx can never reach it. Balances are\n" +
        "  seeded from the tx metadata below, but the clock is present-day — restart\n" +
        "  surfpool at or below this slot if the program checks deadlines."
    );
  }

  section("HISTORICAL STATE");
  const { archive } = result;
  if (archive.status === "off") {
    console.log(
      "no archive configured (set ARCHIVE_RPC) — program-owned state (pool reserves,\n" +
        "  oracles, open orders) is present-day, so a replay that depends on it may diverge"
    );
  } else if (archive.status === "unsupported") {
    console.log(`ARCHIVE_RPC does not serve historical account state: ${archive.reason}`);
    console.log("  falling back to present-day state");
  } else {
    const { report } = archive;
    console.log(
      `injected ${report.injected} account(s) as of the last write before slot ${result.slot}` +
        (report.emptied ? `, emptied ${report.emptied} not yet created` : "")
    );
    for (const s of report.skipped) console.log(`  skipped ${s.pubkey}: ${s.reason}`);
    for (const f of report.failed) console.log(`  failed ${f.pubkey}: ${f.reason}`);
    for (const e of archive.fetchErrors) console.log(`  fetch error: ${e}`);
  }

  section("PRE-STATE SEED");
  const { seed } = result;
  console.log(
    `restored ${seed.lamportsSet} lamport balance(s), ${seed.tokenAmountsSet} token amount(s)` +
      (seed.tokenAccountsBuilt ? `, rebuilt ${seed.tokenAccountsBuilt} token account(s)` : "") +
      (seed.absentAccountsReset
        ? `, emptied ${seed.absentAccountsReset} account(s) the tx creates`
        : "")
  );
  for (const s of seed.skipped) console.log(`  skipped ${s.pubkey}: ${s.reason}`);
  if (result.nonce) {
    console.log(
      result.nonce.seeded
        ? `  durable nonce: ${result.nonce.info.account} ${result.nonce.detail} ` +
            `— kept the tx's nonce instead of replacing the blockhash`
        : `  durable nonce: could not seed ${result.nonce.info.account} (${result.nonce.detail})` +
            ` — the replay will report BlockhashNotFound`
    );
  }
  if (archive.status !== "injected") {
    console.log(
      "  note: program-owned data (pool reserves, oracles, open orders) is not recorded\n" +
        "  in tx metadata, so it stays at present-day fork values"
    );
  }

  section("REPLAY");
  console.log(
    "original :",
    JSON.stringify(result.originalErr),
    result.originalComputeUnits,
    "CU"
  );
  console.log(
    "replayed :",
    JSON.stringify(result.replayedErr),
    result.replayedComputeUnits,
    "CU"
  );
  console.log("MATCH:", result.match);
  if (!result.match) console.log("replayed logs:\n" + result.replayedLogs.join("\n"));

  // A failed simulation is rolled back, so the validator returns no post-state
  // and there is nothing to diff. Show the state the program read on its way to
  // failing instead — that's what explains the failure.
  if (!result.diffs) {
    section("STATE AT FORK (no diff — replay failed, nothing was committed)");
    for (let i = 0; i < result.writable.length; i++) {
      const lines = formatSnapshot(
        result.writable[i]!.toBase58(),
        snapshotFromAccountInfo(result.preSnapshots[i] ?? null)
      );
      for (const line of lines) console.log(line);
    }
    return;
  }

  section("ACCOUNT STATE DIFF (replay)");
  if (result.diffs.length === 0) {
    console.log("  (no writable account changed)");
  } else {
    for (const d of result.diffs) for (const line of formatAccountDiff(d)) console.log(line);
  }
}

main(process.argv[2] || "").catch((e) => {
  if (e instanceof ReplayError) {
    console.error(`${e.failure.kind}: ${e.failure.detail}`);
    process.exit(1);
  }
  console.error(e);
  process.exit(1);
});
