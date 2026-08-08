/**
 * fetch-tx.ts — fetch a transaction and print a decoded post-mortem.
 *
 * Usage:
 *   RPC_URL=https://mainnet.helius-rpc.com/?api-key=... npx tsx fetch-tx.ts <SIGNATURE>
 *
 * Requires:
 *   ./lib/decode.ts  — normalizeInstructions, decodeComputeBudgetIx
 *   ./lib/errors.ts  — resolveCustomError
 */

import { Connection, type VersionedTransactionResponse } from "@solana/web3.js";
import { normalizeInstructions, decodeComputeBudgetIx } from "./lib/decode.js";
import { resolveCustomError, findFailingProgramInLogs } from "./lib/errors.js";

const COMPUTE_BUDGET_PROGRAM = "ComputeBudget111111111111111111111111111111";

/** Default signature fee. Not queried from the chain — see FEE section caveat. */
const LAMPORTS_PER_SIGNATURE = 5000;

const sol = (n: number) => `${n} lamports (${(n / 1e9).toFixed(9)} SOL)`;

/** JSON.stringify replacer that survives BigInt values. */
const bigintSafe = (_key: string, value: unknown) =>
  typeof value === "bigint" ? value.toString() : value;

function section(title: string) {
  console.log(`\n=== ${title} ===`);
}

async function main() {
  const signature = process.argv[2];
  if (!signature) {
    console.error("usage: npx tsx fetch-tx.ts <SIGNATURE>");
    process.exit(1);
  }

  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) {
    console.error("RPC_URL environment variable is required");
    process.exit(1);
  }

  const connection = new Connection(rpcUrl, "confirmed");

  const tx: VersionedTransactionResponse | null = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });

  if (!tx) {
    console.error(
      `transaction ${signature} not found — it may be older than your RPC's retention window`
    );
    process.exit(1);
  }

  const meta = tx.meta;
  if (!meta) {
    console.error("transaction found but meta is null — nothing to decode");
    process.exit(1);
  }

  const message = tx.transaction.message;
  const accountKeys = message.getAccountKeys({
    accountKeysFromLookups: meta.loadedAddresses || null,
  });

  const instructions = normalizeInstructions(tx);

  // ---------------------------------------------------------------- STATUS

  section("STATUS");
  if (meta.err) {
    console.log(`FAILED: ${JSON.stringify(meta.err, bigintSafe)}`);
  } else {
    console.log("SUCCESS");
  }
  console.log(`slot: ${tx.slot}`);
  console.log(`version: ${tx.version}`);
  if (tx.blockTime) console.log(`blockTime: ${new Date(tx.blockTime * 1000).toISOString()}`);

  // -------------------------------------------------------- RESOLVED ERROR

  const err = meta.err as any;
  if (err && typeof err === "object" && "InstructionError" in err) {
    const [failedIxIndex, detail] = err.InstructionError as [number, any];
    const failedIx = instructions[failedIxIndex];

    section("RESOLVED ERROR");
    console.log(`failing instruction: [${failedIxIndex}] ${failedIx?.programId ?? "<unknown>"}`);

    if (detail && typeof detail === "object" && detail.Custom !== undefined) {
      const code: number = detail.Custom;
      console.log(`custom code: ${code} (0x${code.toString(16)})`);

      // The index above names a top-level instruction; if the failure happened
      // inside a CPI the culprit is deeper, and only the logs know which.
      const fromLogs = findFailingProgramInLogs(meta.logMessages, code);
      const culprit = fromLogs ?? failedIx?.programId;

      if (fromLogs && failedIx && fromLogs !== failedIx.programId) {
        console.log(`failing program: ${fromLogs}  (reached via CPI from ${failedIx.programId})`);
      } else if (!fromLogs && failedIx) {
        console.log(
          "  note: no failure line in the logs (truncated or absent) — attributing the " +
            "code to the top-level program, which is wrong if it failed inside a CPI"
        );
      }

      if (culprit) {
        const resolved = await resolveCustomError(connection, culprit, code);
        console.log("resolution:", JSON.stringify(resolved, bigintSafe, 2));
      }
    } else {
      // Non-custom runtime errors, e.g. "ProgramFailedToComplete", "MissingAccount"
      console.log(`runtime error: ${JSON.stringify(detail, bigintSafe)}`);
    }
  }

  // -------------------------------------------------------- COMPUTE BUDGET

  section("COMPUTE BUDGET");

  let requestedUnits: number | null = null;
  let priceMicroLamports: bigint | null = null;

  for (const ix of instructions) {
    if (ix.programId !== COMPUTE_BUDGET_PROGRAM) continue;
    const decoded = decodeComputeBudgetIx(ix.dataBase64) as any;
    if (decoded.type === "SetComputeUnitLimit") requestedUnits = decoded.units;
    if (decoded.type === "RequestUnits") requestedUnits = decoded.units;
    if (decoded.type === "SetComputeUnitPrice") priceMicroLamports = decoded.microLamports;
  }

  const consumed = Number(meta.computeUnitsConsumed ?? 0);
  console.log(
    requestedUnits !== null
      ? `consumed: ${consumed} of ${requestedUnits} requested ` +
          `(${((consumed / requestedUnits) * 100).toFixed(1)}%)`
      : `consumed: ${consumed} (no explicit limit set — default applies)`
  );
  if (priceMicroLamports !== null) {
    console.log(`priority price: ${priceMicroLamports} microLamports/CU`);
  }

  // ------------------------------------------------------------------- FEE

  section("FEE");

  const numSigners = message.header.numRequiredSignatures;
  const baseFee = numSigners * LAMPORTS_PER_SIGNATURE;
  const priorityFee = meta.fee - baseFee;

  console.log(`total:    ${sol(meta.fee)}`);
  console.log(`base:     ${sol(baseFee)}  (${numSigners} signature(s) x ${LAMPORTS_PER_SIGNATURE})`);
  console.log(`priority: ${sol(priorityFee)}`);
  if (priorityFee < 0) {
    console.log("  note: negative priority fee means the base rate assumption is wrong for this slot");
  }

  // -------------------------------------------------------- BALANCE DELTAS

  section("BALANCE DELTAS");

  let anyDelta = false;
  for (let i = 0; i < meta.preBalances.length; i++) {
    const delta = meta.postBalances[i]! - meta.preBalances[i]!;
    if (delta === 0) continue;
    anyDelta = true;
    const key = accountKeys.get(i)?.toBase58() ?? `<index ${i}>`;
    console.log(`  ${key}  ${delta > 0 ? "+" : ""}${delta} lamports`);
  }
  if (!anyDelta) console.log("  (no lamport movement)");

  if (meta.err && anyDelta) {
    console.log(
      "\n  note: transaction failed — any movement here is fee only; program state was rolled back"
    );
  }

  // --------------------------------------------------------- TOKEN BALANCES

  if ((meta.preTokenBalances?.length ?? 0) > 0 || (meta.postTokenBalances?.length ?? 0) > 0) {
    section("TOKEN BALANCE DELTAS");
    const pre = new Map(
      (meta.preTokenBalances ?? []).map((b) => [`${b.accountIndex}`, b])
    );
    for (const post of meta.postTokenBalances ?? []) {
      const before = pre.get(`${post.accountIndex}`);
      const beforeAmt = BigInt(before?.uiTokenAmount.amount ?? "0");
      const afterAmt = BigInt(post.uiTokenAmount.amount);
      if (beforeAmt === afterAmt) continue;
      const key = accountKeys.get(post.accountIndex)?.toBase58() ?? `<index ${post.accountIndex}>`;
      const diff = afterAmt - beforeAmt;
      console.log(`  ${key}  mint ${post.mint}  ${diff > 0n ? "+" : ""}${diff}`);
    }
  }

  // ------------------------------------------------------------ LOG MESSAGES

  section("LOG MESSAGES");
  if (meta.logMessages?.length) {
    for (const line of meta.logMessages) console.log(line);
    if (meta.logMessages.some((l) => l.includes("Log truncated"))) {
      console.log("\n  warning: logs were truncated by the validator — replay to see the rest");
    }
  } else {
    console.log("(none)");
  }

  // ------------------------------------------------------ TOP-LEVEL INSTRUCTIONS

  section("TOP-LEVEL INSTRUCTIONS");
  instructions.forEach((ix: any, i: any) => {
    const isFailing =
      err && typeof err === "object" && "InstructionError" in err && err.InstructionError[0] === i;
    console.log(`  [${i}] ${ix.programId}${isFailing ? "   <-- FAILED HERE" : ""}`);

    for (const acc of ix.accounts) {
      const flags = [acc.signer && "signer", acc.writable && "writable"]
        .filter(Boolean)
        .join(", ");
      console.log(`        ${acc.pubkey}${flags ? ` (${flags})` : ""}`);
    }

    if (ix.programId === COMPUTE_BUDGET_PROGRAM) {
      console.log(`        decoded: ${JSON.stringify(decodeComputeBudgetIx(ix.dataBase64), bigintSafe)}`);
    }
    console.log(`        data: ${ix.dataBase64}`);
  });

  // --------------------------------------------------------- INNER INSTRUCTIONS

  section("INNER INSTRUCTIONS");
  if (meta.innerInstructions?.length) {
    for (const inner of meta.innerInstructions) {
      console.log(`  from top-level instruction [${inner.index}]:`);
      inner.instructions.forEach((ix: any, j: number) => {
        const programId = accountKeys.get(ix.programIdIndex)?.toBase58() ?? "<unknown>";
        console.log(`    [${j}] ${programId}`);
      });
    }
  } else {
    console.log("  (none — no CPIs, or the tx failed before making any)");
  }

  // ------------------------------------------------------ ACCOUNT KEYS TOUCHED

  section("ACCOUNT KEYS TOUCHED");
  for (let i = 0; i < accountKeys.length; i++) {
    const key = accountKeys.get(i)!;
    const flags = [
      message.isAccountSigner(i) && "signer",
      message.isAccountWritable(i) && "writable",
      i >= message.staticAccountKeys.length && "from lookup table",
    ]
      .filter(Boolean)
      .join(", ");
    console.log(`  ${key.toBase58()}${flags ? ` (${flags})` : ""}`);
  }

  // ------------------------------------------------------------------ RAW META

  section("RAW META (for later diffing/decoding)");
  console.log(JSON.stringify(meta, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
