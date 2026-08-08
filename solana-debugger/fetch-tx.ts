/**
 * fetch-tx.ts — fetch a transaction and print a decoded post-mortem.
 *
 * Usage:
 *   npm run fetch <SIGNATURE> [--verbose]
 *
 * Prints a root-cause SUMMARY first — signature in, answer out — then the
 * supporting detail. `--verbose` adds the raw meta dump, which is most of the
 * output volume and useful mainly for diffing.
 */

import { Connection, type VersionedTransactionResponse } from "@solana/web3.js";
import { normalizeInstructions, decodeComputeBudgetIx } from "./lib/decode.js";
import { resolveCustomError, findFailingProgramInLogs } from "./lib/errors.js";
import { parseAnchorError, findLogHint } from "./lib/summary.js";

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

/** Pads a summary label so the values line up in a column. */
const row = (label: string, value: string) => console.log(`  ${label.padEnd(11)} ${value}`);

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes("--verbose") || args.includes("-v");
  const signature = args.find((a) => !a.startsWith("-"));
  if (!signature) {
    console.error("usage: npm run fetch <SIGNATURE> [--verbose]");
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

  // ------------------------------------------------ GATHER (before printing)
  // The summary comes first, so everything it needs is worked out up front and
  // the detail sections below reuse these values rather than recomputing them.

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
  const computeText =
    requestedUnits !== null
      ? `${consumed} of ${requestedUnits} CU (${((consumed / requestedUnits) * 100).toFixed(1)}%)`
      : `${consumed} CU (no explicit limit set — default applies)`;

  const numSigners = message.header.numRequiredSignatures;
  const baseFee = numSigners * LAMPORTS_PER_SIGNATURE;
  const priorityFee = meta.fee - baseFee;
  const logsTruncated = Boolean(meta.logMessages?.some((l) => l.includes("Log truncated")));

  const err = meta.err as any;
  const instructionError =
    err && typeof err === "object" && "InstructionError" in err
      ? (err.InstructionError as [number, any])
      : null;
  const failedIxIndex = instructionError ? instructionError[0] : null;
  const detail = instructionError ? instructionError[1] : null;
  const failedIx = failedIxIndex !== null ? instructions[failedIxIndex] : undefined;

  const customCode: number | null =
    detail && typeof detail === "object" && detail.Custom !== undefined ? detail.Custom : null;

  // The InstructionError index names a *top-level* instruction; if the failure
  // happened inside a CPI the culprit is deeper, and only the logs know which.
  const fromLogs =
    customCode !== null ? findFailingProgramInLogs(meta.logMessages, customCode) : null;
  const culprit = fromLogs ?? failedIx?.programId ?? null;
  const viaCpi = Boolean(fromLogs && failedIx && fromLogs !== failedIx.programId);

  const resolved =
    customCode !== null && culprit
      ? await resolveCustomError(connection, culprit, customCode)
      : null;

  const anchor = parseAnchorError(meta.logMessages);
  const logHint = findLogHint(meta.logMessages);

  // --------------------------------------------------------------- SUMMARY

  section("SUMMARY");

  const when = tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : "unknown time";
  const version = tx.version === "legacy" ? "legacy" : `v${tx.version}`;
  console.log(`${meta.err ? "FAILED" : "SUCCESS"}  slot ${tx.slot}  ${version}  ${when}`);

  if (meta.err) {
    if (failedIxIndex !== null) {
      row("instruction", `[${failedIxIndex}] of ${instructions.length}`);
    }
    if (culprit) row("program", culprit);
    if (viaCpi) row("", `via CPI from ${failedIx!.programId}`);

    if (customCode !== null) {
      const hex = `0x${customCode.toString(16)}`;
      const name = resolved?.name ?? anchor?.code ?? null;
      if (name) {
        row("error", `${name}  (custom ${customCode} / ${hex}, via ${resolved?.source ?? "logs"})`);
        const message = resolved?.msg ?? anchor?.message;
        if (message && message !== name) row("message", message);
      } else {
        row("error", `custom ${customCode} (${hex}) — unresolved`);
        // The note explains *why* it's unresolved; its leading "Custom error N
        // from <program>" would just repeat the line above.
        const why = resolved?.note?.split(" — ").pop();
        if (why) row("note", why);
      }
    } else if (detail !== null) {
      row("error", JSON.stringify(detail, bigintSafe));
    } else {
      row("error", JSON.stringify(meta.err, bigintSafe));
    }

    // The constraint/account and source line are what actually locate the bug.
    if (anchor?.account) row("account", `${anchor.account}  (constraint that tripped)`);
    if (anchor?.source) row("at", anchor.source);
    if (!anchor && logHint) row("log", logHint);

    // Caveats that change how much to trust the lines above — these have to
    // survive into the default view, not hide in a section behind --verbose.
    if (customCode !== null && !fromLogs && failedIx) {
      row("warning", "no failure line in the logs — 'program' above is the top-level");
      row("", "one, which is wrong if it failed inside a CPI");
    }
    if (logsTruncated) {
      row("warning", "validator truncated the logs — replay to see the rest");
    }
  } else {
    row("instructions", `${instructions.length}`);
  }

  row(
    "compute",
    computeText +
      (priceMicroLamports !== null ? `, ${priceMicroLamports} microLamports/CU priority` : "")
  );
  row("fee", sol(meta.fee) + (priorityFee > 0 ? `  (${priorityFee} of it priority)` : ""));

  // ------------------------------------------------------------- WHAT MOVED

  const lamportDeltas: string[] = [];
  for (let i = 0; i < meta.preBalances.length; i++) {
    const delta = meta.postBalances[i]! - meta.preBalances[i]!;
    if (delta === 0) continue;
    const key = accountKeys.get(i)?.toBase58() ?? `<index ${i}>`;
    lamportDeltas.push(`  ${key}  ${delta > 0 ? "+" : ""}${delta} lamports`);
  }

  const tokenDeltas: string[] = [];
  {
    const pre = new Map((meta.preTokenBalances ?? []).map((b) => [b.accountIndex, b]));
    for (const post of meta.postTokenBalances ?? []) {
      const beforeAmt = BigInt(pre.get(post.accountIndex)?.uiTokenAmount.amount ?? "0");
      const afterAmt = BigInt(post.uiTokenAmount.amount);
      if (beforeAmt === afterAmt) continue;
      const key = accountKeys.get(post.accountIndex)?.toBase58() ?? `<index ${post.accountIndex}>`;
      const diff = afterAmt - beforeAmt;
      tokenDeltas.push(`  ${key}  mint ${post.mint}  ${diff > 0n ? "+" : ""}${diff}`);
    }
  }

  // A failed tx only ever moves the fee, which the summary already reports, so
  // by default this section would just restate it.
  if (verbose || !meta.err) {
    section("BALANCE DELTAS");
    if (lamportDeltas.length) {
      for (const line of lamportDeltas) console.log(line);
    } else {
      console.log("  (no lamport movement)");
    }
    if (meta.err && lamportDeltas.length) {
      console.log(
        "\n  note: transaction failed — any movement here is fee only; program state was rolled back"
      );
    }
  }

  // Only worth a header when something actually moved; the old code printed an
  // empty section whenever the tx merely touched token accounts.
  if (tokenDeltas.length) {
    section("TOKEN BALANCE DELTAS");
    for (const line of tokenDeltas) console.log(line);
  }

  if (!verbose) {
    console.log("\n  (--verbose adds logs, instructions, account keys and the raw meta)");
    return;
  }

  // ---------------------------------------------------------------- STATUS

  section("STATUS");
  if (meta.err) {
    console.log(`FAILED: ${JSON.stringify(meta.err, bigintSafe)}`);
  } else {
    console.log("SUCCESS");
  }
  console.log(`slot: ${tx.slot}`);
  console.log(`version: ${tx.version}`);
  if (tx.blockTime) console.log(`blockTime: ${when}`);

  // -------------------------------------------------------- RESOLVED ERROR

  if (instructionError) {
    section("RESOLVED ERROR");
    console.log(`failing instruction: [${failedIxIndex}] ${failedIx?.programId ?? "<unknown>"}`);

    if (customCode !== null) {
      console.log(`custom code: ${customCode} (0x${customCode.toString(16)})`);

      if (viaCpi) {
        console.log(`failing program: ${fromLogs}  (reached via CPI from ${failedIx!.programId})`);
      } else if (!fromLogs && failedIx) {
        console.log(
          "  note: no failure line in the logs (truncated or absent) — attributing the " +
            "code to the top-level program, which is wrong if it failed inside a CPI"
        );
      }

      if (resolved) console.log("resolution:", JSON.stringify(resolved, bigintSafe, 2));
    } else {
      // Non-custom runtime errors, e.g. "ProgramFailedToComplete", "MissingAccount"
      console.log(`runtime error: ${JSON.stringify(detail, bigintSafe)}`);
    }

    if (anchor) console.log("anchor log:", JSON.stringify(anchor, bigintSafe, 2));
  }

  // -------------------------------------------------------- COMPUTE BUDGET

  section("COMPUTE BUDGET");
  console.log(`consumed: ${computeText}`);
  if (priceMicroLamports !== null) {
    console.log(`priority price: ${priceMicroLamports} microLamports/CU`);
  }

  // ------------------------------------------------------------------- FEE

  section("FEE");

  console.log(`total:    ${sol(meta.fee)}`);
  console.log(`base:     ${sol(baseFee)}  (${numSigners} signature(s) x ${LAMPORTS_PER_SIGNATURE})`);
  console.log(`priority: ${sol(priorityFee)}`);
  if (priorityFee < 0) {
    console.log("  note: negative priority fee means the base rate assumption is wrong for this slot");
  }

  // ------------------------------------------------------------ LOG MESSAGES

  section("LOG MESSAGES");
  if (meta.logMessages?.length) {
    for (const line of meta.logMessages) console.log(line);
    if (logsTruncated) {
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

  if (verbose) {
    section("RAW META (for later diffing/decoding)");
    console.log(JSON.stringify(meta, null, 2));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
