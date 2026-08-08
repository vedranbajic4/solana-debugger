/**
 * lib/bisect.ts
 *
 * Which instructions were actually needed to produce this failure?
 *
 * `meta.err` names the instruction that failed, which sounds like the whole
 * answer and usually isn't. A failing swap arrives wrapped in compute-budget
 * requests, ATA creations, wSOL funding and a SyncNative — and the interesting
 * question when reproducing it is which of that setup matters. Anything droppable
 * is noise you can stop reading; anything that isn't is part of the bug.
 *
 * The method is greedy minimization rather than a true bisect: try removing one
 * instruction, keep it removed if the same failure still reproduces, move on.
 * That is O(n) simulations against a fork, which for the 4-to-20 instructions a
 * real transaction carries is cheaper and far simpler to reason about than a
 * proper delta-debug — and unlike binary search it doesn't assume the failure
 * is monotone in the prefix, which it isn't: setup instructions in the middle
 * can matter while ones before them don't.
 *
 * Two constraints keep the result meaningful:
 *
 * - **The rebuild must reproduce before anything is dropped.** Minimizing means
 *   decompiling the message and recompiling it, which reorders account keys. If
 *   that alone changes the outcome, every later conclusion is about the rebuild
 *   rather than the transaction, and the report says so instead.
 * - **Failures are compared by payload, not by index.** Dropping an earlier
 *   instruction shifts the failing one's index, so `InstructionError[0]` moves
 *   while the actual error doesn't. Comparing indexes would call every
 *   successful drop a behaviour change and minimize nothing.
 */

import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import type { TransactionInstruction, VersionedTransactionResponse } from "@solana/web3.js";

import { normalizeInstructions } from "./decode.js";
import { seedPreState } from "./prestate.js";

export type BisectStep = {
  /** Index in the original instruction list. */
  index: number;
  programId: string;
  /** True when the failure still reproduced without it. */
  removable: boolean;
  /**
   * What happened when it was dropped — only meaningful when `removable` is
   * false. `null` there means the transaction *succeeded* without it, which is
   * the strongest possible evidence that the instruction is load-bearing, so
   * renderers must say so rather than reading the null as "nothing to report".
   */
  outcomeWithout: unknown;
};

export type BisectReport = {
  signature: string;
  originalErr: unknown;
  /** The rebuilt, unminimized transaction's outcome. */
  baselineErr: unknown;
  /** False when recompiling alone changed the outcome — nothing below is usable. */
  reliable: boolean;
  /** Why a bisect couldn't run at all, when it couldn't. */
  unavailable: string | null;
  totalInstructions: number;
  /** Indexes that survived minimization: the ones the failure needs. */
  required: number[];
  steps: BisectStep[];
};

/**
 * Compares two failures ignoring the instruction index.
 *
 * `{"InstructionError":[5,{"Custom":6004}]}` and
 * `{"InstructionError":[3,{"Custom":6004}]}` are the same failure seen after
 * two instructions were dropped ahead of it.
 */
export function sameFailure(a: unknown, b: unknown): boolean {
  const detail = (err: unknown): unknown => {
    if (err && typeof err === "object" && "InstructionError" in err) {
      const ix = (err as { InstructionError: [number, unknown] }).InstructionError;
      return ix[1];
    }
    return err;
  };
  return JSON.stringify(detail(a)) === JSON.stringify(detail(b));
}

/** Fetches the lookup tables a v0 message needs before it can be decompiled. */
async function loadLookupTables(
  connection: Connection,
  tx: VersionedTransactionResponse,
): Promise<AddressLookupTableAccount[]> {
  const lookups = (tx.transaction.message as unknown as {
    addressTableLookups?: { accountKey: PublicKey }[];
  }).addressTableLookups;
  if (!lookups?.length) return [];

  const tables: AddressLookupTableAccount[] = [];
  for (const lookup of lookups) {
    const fetched = await connection.getAddressLookupTable(lookup.accountKey);
    if (!fetched.value) {
      // A table closed since the transaction ran can't be recovered, and
      // guessing at the addresses it held would rebuild a different tx.
      throw new Error(`address lookup table ${lookup.accountKey.toBase58()} is no longer available`);
    }
    tables.push(fetched.value);
  }
  return tables;
}

/**
 * Finds the smallest set of instructions that still reproduces the failure.
 *
 * Re-seeds the fork before every attempt, for the same reason the counterfactual
 * battery does: seeding mutates the fork and nothing rolls back, so an unseeded
 * second run would measure the leftovers of the first.
 */
export async function bisectInstructions(opts: {
  mainnet: Connection;
  surfnet: Connection;
  surfnetUrl: string;
  signature: string;
}): Promise<BisectReport> {
  const { mainnet, surfnet, surfnetUrl, signature } = opts;

  const tx = await mainnet.getTransaction(signature, { maxSupportedTransactionVersion: 0 });
  if (!tx?.meta) throw new Error("transaction not found, or has no metadata to replay from");

  const normalized = normalizeInstructions(tx);
  const empty = (unavailable: string): BisectReport => ({
    signature,
    originalErr: tx.meta!.err,
    baselineErr: null,
    reliable: false,
    unavailable,
    totalInstructions: normalized.length,
    required: normalized.map((_, i) => i),
    steps: [],
  });

  if (!tx.meta.err) return empty("the transaction succeeded — there is no failure to minimize");
  if (normalized.length < 2) return empty("only one instruction — nothing to minimize");

  const keys = tx.transaction.message.getAccountKeys({
    accountKeysFromLookups: tx.meta.loadedAddresses || null,
  });

  let decompiled: TransactionMessage;
  let tables: AddressLookupTableAccount[];
  try {
    tables = await loadLookupTables(mainnet, tx);
    decompiled = TransactionMessage.decompile(tx.transaction.message, {
      addressLookupTableAccounts: tables,
    });
  } catch (e) {
    return empty(`could not decompile the transaction: ${(e as Error).message}`);
  }

  const allInstructions = decompiled.instructions;
  const isV0 = tx.version !== "legacy";

  /** Re-seeds, rebuilds from `keep`, simulates. */
  const attempt = async (keep: number[]): Promise<unknown> => {
    const warmed = await surfnet.getMultipleAccountsInfo(
      allKeys(keys).slice(0, 100),
      "processed"
    );
    await seedPreState(surfnetUrl, tx, keys, warmed);

    const subset: TransactionInstruction[] = keep
      .map((i) => allInstructions[i])
      .filter((ix): ix is TransactionInstruction => ix !== undefined);

    const message = new TransactionMessage({
      payerKey: decompiled.payerKey,
      recentBlockhash: decompiled.recentBlockhash,
      instructions: subset,
    });
    const compiled = isV0
      ? message.compileToV0Message(tables)
      : message.compileToLegacyMessage();

    const vtx = new VersionedTransaction(
      compiled,
      Array.from({ length: compiled.header.numRequiredSignatures }, () => new Uint8Array(64))
    );
    const sim = await surfnet.simulateTransaction(vtx, {
      sigVerify: false,
      replaceRecentBlockhash: true,
      commitment: "processed",
    });
    return sim.value.err;
  };

  // Baseline: the rebuild, unminimized. Recompiling reorders account keys, so
  // if this alone changes the outcome the minimization below is meaningless.
  let baselineErr: unknown;
  try {
    baselineErr = await attempt(allInstructions.map((_, i) => i));
  } catch (e) {
    return empty(`could not simulate the rebuilt transaction: ${(e as Error).message}`);
  }

  if (!sameFailure(baselineErr, tx.meta.err)) {
    return {
      signature,
      originalErr: tx.meta.err,
      baselineErr,
      reliable: false,
      unavailable: null,
      totalInstructions: normalized.length,
      required: normalized.map((_, i) => i),
      steps: [],
    };
  }

  // Greedy minimization: drop one, keep it dropped if the failure survives.
  // Walking backwards means trailing instructions — which never executed and
  // are always removable — go first and cheaply.
  const keep = allInstructions.map((_, i) => i);
  const steps: BisectStep[] = [];

  for (let i = allInstructions.length - 1; i >= 0; i--) {
    const without = keep.filter((k) => k !== i);
    if (without.length === 0) continue; // a transaction needs at least one instruction

    let outcome: unknown;
    try {
      outcome = await attempt(without);
    } catch {
      // A subset the runtime refuses to build tells us nothing about necessity,
      // so treat the instruction as required rather than guessing.
      steps.push({
        index: i,
        programId: normalized[i]?.programId ?? "<unknown>",
        removable: false,
        outcomeWithout: "could not be simulated without it",
      });
      continue;
    }

    const stillFails = sameFailure(outcome, tx.meta.err);
    if (stillFails) keep.splice(keep.indexOf(i), 1);
    steps.push({
      index: i,
      programId: normalized[i]?.programId ?? "<unknown>",
      removable: stillFails,
      outcomeWithout: stillFails ? null : outcome,
    });
  }

  return {
    signature,
    originalErr: tx.meta.err,
    baselineErr,
    reliable: true,
    unavailable: null,
    totalInstructions: normalized.length,
    required: keep.sort((a, b) => a - b),
    steps: steps.sort((a, b) => a.index - b.index),
  };
}

function allKeys(keys: ReturnType<VersionedTransactionResponse["transaction"]["message"]["getAccountKeys"]>) {
  const out: PublicKey[] = [];
  for (let i = 0; i < keys.length; i++) out.push(keys.get(i)!);
  return out;
}

/** Renders the bisect as indented CLI lines. */
export function formatBisect(report: BisectReport): string[] {
  if (report.unavailable) return [`  bisect unavailable: ${report.unavailable}`];

  if (!report.reliable) {
    return [
      "  rebuilding the transaction changed its outcome, so it can't be minimized:",
      `      original: ${JSON.stringify(report.originalErr)}`,
      `      rebuilt:  ${JSON.stringify(report.baselineErr)}`,
      "  recompiling reorders account keys, which some programs are sensitive to.",
    ];
  }

  const out: string[] = [];
  const dropped = report.totalInstructions - report.required.length;
  out.push(
    `  ${report.required.length} of ${report.totalInstructions} instruction(s) are needed to reproduce this failure`
  );
  out.push("");
  for (const step of report.steps) {
    const mark = step.removable ? "drop  " : "KEEP  ";
    out.push(`  ${mark} [${step.index}] ${step.programId}`);
    if (!step.removable) {
      // A null outcome here is success, not absence — and "the transaction
      // works without this instruction" is the clearest reason to keep it.
      out.push(
        step.outcomeWithout === null
          ? "            without it: the transaction succeeds"
          : `            without it: ${JSON.stringify(step.outcomeWithout)}`
      );
    }
  }
  if (dropped > 0) {
    out.push("");
    out.push(
      `  => instructions [${report.required.join(", ")}] reproduce it on their own; ` +
        `the other ${dropped} are setup you can ignore`
    );
  }
  return out;
}
