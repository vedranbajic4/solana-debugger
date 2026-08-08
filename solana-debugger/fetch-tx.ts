// fetch-tx.ts
// Usage: RPC_URL=https://your-helius-or-quicknode-url npx tsx fetch-tx.ts <SIGNATURE>

import {
  Connection,
  type ParsedTransactionWithMeta,
  type ParsedInstruction,
  type PartiallyDecodedInstruction,
} from "@solana/web3.js";

function isParsedInstruction(
  ix: ParsedInstruction | PartiallyDecodedInstruction
): ix is ParsedInstruction {
  return "parsed" in ix;
}

async function main(): Promise<void> {
  const signature = process.argv[2];
  if (!signature) {
    console.error("Usage: npx tsx fetch-tx.ts <SIGNATURE>");
    process.exit(1);
  }

  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) {
    console.error("Set RPC_URL env var to your Helius/QuickNode endpoint (not the public mainnet-beta RPC).");
    process.exit(1);
  }

  const connection = new Connection(rpcUrl, "confirmed");

  const tx: ParsedTransactionWithMeta | null = await connection.getParsedTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });

  if (!tx || !tx.meta) {
    console.error("No transaction found for that signature on this cluster.");
    process.exit(1);
  }

  console.log("\n=== STATUS ===");
  console.log(tx.meta.err ? `FAILED: ${JSON.stringify(tx.meta.err)}` : "SUCCESS");

  console.log("\n=== COMPUTE UNITS ===");
  console.log(tx.meta.computeUnitsConsumed ?? "n/a");

  console.log("\n=== LOG MESSAGES ===");
  (tx.meta.logMessages ?? []).forEach((line: string) => console.log(line));

  console.log("\n=== TOP-LEVEL INSTRUCTIONS (program IDs) ===");
  tx.transaction.message.instructions.forEach(
    (ix: ParsedInstruction | PartiallyDecodedInstruction, i: number) => {
      console.log(`  [${i}] ${ix.programId.toString()}${isParsedInstruction(ix) ? ` (${ix.program})` : ""}`);
    }
  );

  console.log("\n=== ACCOUNT KEYS TOUCHED ===");
  tx.transaction.message.accountKeys.forEach((acc) => {
    console.log(`  ${acc.pubkey.toString()}${acc.signer ? " (signer)" : ""}${acc.writable ? " (writable)" : ""}`);
  });

  console.log("\n=== RAW META (for later diffing/decoding) ===");
  console.log(JSON.stringify(tx.meta, null, 2).slice(0, 2000) + "\n... (truncated)");
}

main().catch((err) => {
  console.error("Error fetching transaction:", err);
  process.exit(1);
});
