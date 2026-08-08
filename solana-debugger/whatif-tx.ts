/**
 * whatif-tx.ts — re-run a failed transaction with one thing changed.
 *
 * Usage:
 *   npm run whatif <SIGNATURE>
 *   npm run whatif <SIGNATURE> -- --json
 *
 * Answers "what would have made this work?" by perturbing one variable at a
 * time against a local surfnet and reporting which change moves the outcome.
 * Needs a surfnet running (see SURFNET_RPC), because it replays.
 *
 * A printer over `lib/counterfactual.ts` — the same rule as `replay-tx.ts` and
 * `fetch-tx.ts`. Nothing is decided here.
 */

import { Connection } from "@solana/web3.js";

import { formatCounterfactuals, runCounterfactuals } from "./lib/counterfactual.js";
import { surfnetCall } from "./lib/surfnet.js";

const SURFNET_RPC = process.env.SURFNET_RPC ?? "http://127.0.0.1:8899";

async function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes("--json");
  const signature = args.find((a) => !a.startsWith("-"));

  if (!signature) {
    console.error("usage: npm run whatif <SIGNATURE> [-- --json]");
    process.exit(1);
  }
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) {
    console.error("RPC_URL environment variable is required");
    process.exit(1);
  }

  const mainnet = new Connection(rpcUrl, "confirmed");
  const surfnet = new Connection(SURFNET_RPC, "confirmed");

  // Fork toward the tx's slot before probing. Best-effort, exactly as in
  // lib/replay.ts: the clock probe deliberately moves it again afterwards.
  const tx = await mainnet.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
  if (!tx?.meta) {
    console.error("transaction not found, or has no metadata to replay from");
    process.exit(1);
  }
  if (!tx.meta.err && !asJson) {
    console.log(
      "note: this transaction succeeded — the probes below show what still changes its outcome"
    );
  }
  await surfnetCall(SURFNET_RPC, "surfnet_timeTravel", [{ absoluteSlot: tx.slot }]);

  const report = await runCounterfactuals({ mainnet, surfnet, surfnetUrl: SURFNET_RPC, signature });

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`\n=== WHAT WOULD HAVE CHANGED IT ===`);
  console.log(`original : ${JSON.stringify(report.originalErr)}`);
  console.log(`baseline : ${JSON.stringify(report.baseline.err)}  ${report.baseline.computeUnits ?? "?"} CU`);
  console.log("");
  for (const line of formatCounterfactuals(report)) console.log(line);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
