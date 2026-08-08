/**
 * replay-tx.ts — re-run a mainnet transaction against a local surfnet fork and
 * compare the outcome, plus the account state it moved.
 *
 * Usage:
 *   npm run replay <SIGNATURE>
 */

import {
  Connection,
  PublicKey,
  VersionedTransaction,
  VersionedMessage,
} from "@solana/web3.js";

import {
  diffAccount,
  formatAccountDiff,
  formatSnapshot,
  snapshotFromAccountInfo,
  snapshotFromSimulated,
} from "./lib/accounts.js";
import { surfnetCall } from "./lib/surfnet.js";

const SURFNET_RPC = process.env.SURFNET_RPC ?? "http://127.0.0.1:8899";

/** getMultipleAccounts caps out at 100 addresses per call. */
const MAX_ACCOUNTS_PER_FETCH = 100;

function section(title: string) {
  console.log(`\n=== ${title} ===`);
}

async function getManyAccounts(connection: Connection, keys: PublicKey[]) {
  const out = [];
  for (let i = 0; i < keys.length; i += MAX_ACCOUNTS_PER_FETCH) {
    const chunk = keys.slice(i, i + MAX_ACCOUNTS_PER_FETCH);
    out.push(...(await connection.getMultipleAccountsInfo(chunk, "processed")));
  }
  return out;
}

async function replay(signature: string) {
  const mainnetRpc = process.env.RPC_URL;
  if (!mainnetRpc) {
    console.error("RPC_URL environment variable is required");
    process.exit(1);
  }

  const mainnet = new Connection(mainnetRpc, "confirmed");
  const surfnet = new Connection(SURFNET_RPC, "confirmed");

  const tx = await mainnet.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
  if (!tx) throw new Error("transaction not found");

  // Fork the local validator to the tx's slot. If this silently fails we'd be
  // diffing against present-day state, so treat an error as fatal rather than
  // reporting a state diff that doesn't mean what it says.
  const travel = (await surfnetCall(SURFNET_RPC, "surfnet_timeTravel", [
    { absoluteSlot: tx.slot },
  ])) as { error?: { message?: string; data?: string } };
  if (travel?.error) {
    const detail = travel.error.data ?? travel.error.message ?? JSON.stringify(travel.error);
    throw new Error(
      `surfnet_timeTravel to slot ${tx.slot} failed: ${detail}\n` +
        `  surfnet_timeTravel only moves forward, and a running surfnet's clock keeps\n` +
        `  advancing, so a fork started after this tx's slot can never reach it.\n` +
        `  Restart surfpool forked at or below slot ${tx.slot}, and check one is\n` +
        `  actually listening at ${SURFNET_RPC}.`
    );
  }

  // We don't have the signer's private key, so build with dummy sigs
  // and tell simulateTransaction to skip verification.
  const message = tx.transaction.message as VersionedMessage;
  const dummySigs = Array.from(
    { length: message.header.numRequiredSignatures },
    () => new Uint8Array(64)
  );
  const vtx = new VersionedTransaction(message, dummySigs);

  // Only writable accounts can change, so they're the only ones worth
  // snapshotting — and staying at or below the tx's own account count keeps us
  // under the RPC's cap on `accounts.addresses`.
  const accountKeys = message.getAccountKeys({
    accountKeysFromLookups: tx.meta?.loadedAddresses || null,
  });
  const writable: PublicKey[] = [];
  for (let i = 0; i < accountKeys.length; i++) {
    if (message.isAccountWritable(i)) writable.push(accountKeys.get(i)!);
  }

  // Pre-state comes off the same fork the simulation will run against.
  const preInfos = await getManyAccounts(surfnet, writable);

  const sim = await surfnet.simulateTransaction(vtx, {
    sigVerify: false,
    replaceRecentBlockhash: true, // old blockhash is long gone
    commitment: "processed",
    accounts: {
      encoding: "base64",
      addresses: writable.map((k) => k.toBase58()),
    },
  });

  section("REPLAY");
  const match = JSON.stringify(tx.meta?.err) === JSON.stringify(sim.value.err);
  console.log("original :", JSON.stringify(tx.meta?.err), tx.meta?.computeUnitsConsumed, "CU");
  console.log("replayed :", JSON.stringify(sim.value.err), sim.value.unitsConsumed, "CU");
  console.log("MATCH:", match);
  if (!match) console.log("replayed logs:\n" + (sim.value.logs ?? []).join("\n"));

  // A failed simulation is rolled back, so the validator returns no
  // post-state and there is nothing to diff. Show the state the program read
  // on its way to failing instead — that's what explains the failure.
  const postInfos = sim.value.accounts;
  if (!postInfos) {
    section("STATE AT FORK (no diff — replay failed, nothing was committed)");
    for (let i = 0; i < writable.length; i++) {
      const lines = formatSnapshot(
        writable[i]!.toBase58(),
        snapshotFromAccountInfo(preInfos[i] ?? null)
      );
      for (const line of lines) console.log(line);
    }
    return;
  }

  section("ACCOUNT STATE DIFF (replay)");

  const diffs = writable
    .map((key, i) =>
      diffAccount(
        key.toBase58(),
        snapshotFromAccountInfo(preInfos[i] ?? null),
        snapshotFromSimulated(postInfos[i])
      )
    )
    .filter((d) => d !== null);

  if (diffs.length === 0) {
    console.log("  (no writable account changed)");
  } else {
    for (const d of diffs) for (const line of formatAccountDiff(d)) console.log(line);
  }
}

replay(process.argv[2] || "").catch((e) => {
  console.error(e);
  process.exit(1);
});
