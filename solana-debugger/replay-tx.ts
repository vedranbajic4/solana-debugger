// replay-tx.ts
import { Connection, VersionedTransaction, VersionedMessage } from "@solana/web3.js";
import { surfnetCall } from "./lib/surfnet.js";

const MAINNET_RPC = process.env.RPC_URL!;
const SURFNET_RPC = process.env.SURFNET_RPC ?? "http://127.0.0.1:8899";

async function replay(signature: string) {
  const mainnet = new Connection(MAINNET_RPC, "confirmed");
  const surfnet = new Connection(SURFNET_RPC, "confirmed");

  const tx = await mainnet.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
  if (!tx) throw new Error("transaction not found");

  // Optional but recommended — see fidelity caveat below
  await surfnetCall(SURFNET_RPC, "surfnet_timeTravel", [{ absoluteSlot: tx.slot }]);

  // We don't have the signer's private key, so build with dummy sigs
  // and tell simulateTransaction to skip verification.
  const message = tx.transaction.message as VersionedMessage;
  const dummySigs = Array.from(
    { length: message.header.numRequiredSignatures },
    () => new Uint8Array(64)
  );
  const vtx = new VersionedTransaction(message, dummySigs);

  const sim = await surfnet.simulateTransaction(vtx, {
    sigVerify: false,
    replaceRecentBlockhash: true, // old blockhash is long gone
    commitment: "processed",
  });

  const match = JSON.stringify(tx.meta?.err) === JSON.stringify(sim.value.err);
  console.log("original :", JSON.stringify(tx.meta?.err), tx.meta?.computeUnitsConsumed, "CU");
  console.log("replayed :", JSON.stringify(sim.value.err), sim.value.unitsConsumed, "CU");
  console.log("MATCH:", match);
  if (!match) console.log("replayed logs:\n" + (sim.value.logs ?? []).join("\n"));
}

replay(process.argv[2] || "").catch((e) => { console.error(e); process.exit(1); });