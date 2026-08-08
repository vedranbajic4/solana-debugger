/**
 * lib/errors.ts
 *
 * Resolves a raw `Custom(n)` program error into something meaningful,
 * via a fallback chain that degrades honestly rather than guessing.
 */

import { Connection, PublicKey } from "@solana/web3.js";
import zlib from "zlib";

import {
  ANCHOR_FRAMEWORK_ERRORS,
  ANCHOR_USER_ERROR_OFFSET,
  isAnchorFrameworkRange,
} from "./anchor-errors.js";
import { KNOWN_PROGRAM_ERRORS, PROGRAM_NAMES } from "./program-errors.js";

export type ResolvedError = {
  source: "anchor-idl" | "known-program" | "anchor-framework" | "unknown";
  name?: string;
  msg?: string;
  hex: string;
  note?: string;
};

/** The runtime's per-program failure line, e.g.
 *  `Program pAMMBay6...FMfXEA failed: custom program error: 0x1774` */
const PROGRAM_FAILED_RE =
  /^Program (\S+) failed: custom program error: 0x([0-9a-f]+)$/;

/**
 * Finds the program that actually returned `Custom(code)`.
 *
 * `meta.err`'s `InstructionError` index always points at a *top-level*
 * instruction, so when the failure happened inside a CPI the top-level program
 * is the caller, not the culprit — resolving the code against the caller's IDL
 * would confidently print the wrong error name. The runtime logs a failure
 * line for every program on the stack as the error propagates upward,
 * innermost first, so the first matching line names the originating program.
 *
 * Returns null when the logs are missing/truncated or disagree with `code`, so
 * the caller keeps its top-level attribution rather than trusting a bad parse.
 */
export function findFailingProgramInLogs(
  logs: string[] | null | undefined,
  code: number,
): string | null {
  for (const line of logs ?? []) {
    const m = PROGRAM_FAILED_RE.exec(line.trim());
    if (!m) continue;
    // Logs contradict meta.err — bail rather than guess which one is right.
    if (parseInt(m[2]!, 16) !== code) return null;
    return m[1]!;
  }
  return null;
}

/**
 * Fetches a program's on-chain Anchor IDL, if it has one.
 * Returns null for non-Anchor programs or programs that never uploaded an IDL.
 */
export async function tryFetchAnchorIdl(
  connection: Connection,
  programId: string,
) {
  try {
    const pid = new PublicKey(programId);
    const base = PublicKey.findProgramAddressSync([], pid)[0];
    const idlAddr = await PublicKey.createWithSeed(base, "anchor:idl", pid);
    const info = await connection.getAccountInfo(idlAddr);
    if (!info || info.data.length < 44) return null;

    // layout: [0..8] discriminator, [8..40] authority, [40..44] len, [44..] zlib JSON
    const len = info.data.readUInt32LE(40);
    const json = zlib.inflateSync(info.data.subarray(44, 44 + len));
    return JSON.parse(json.toString());
  } catch {
    return null; // no IDL, wrong layout, or bad inflate — all mean "can't resolve this way"
  }
}

export async function resolveCustomError(
  connection: Connection,
  programId: string,
  code: number,
): Promise<ResolvedError> {
  const hex = "0x" + code.toString(16);

  // 1. Program's own IDL — strongest evidence, program-specific.
  const idl = await tryFetchAnchorIdl(connection, programId);
  const entry = idl?.errors?.find((e: any) => e.code === code);
  if (entry) {
    return { source: "anchor-idl", name: entry.name, msg: entry.msg, hex };
  }

  // 2. Exact program-ID match in our tables — also program-specific.
  const known = KNOWN_PROGRAM_ERRORS[programId]?.[code];
  if (known !== undefined) {
    return {
      source: "known-program",
      name: known,
      hex,
      note: PROGRAM_NAMES[programId] || "",
    };
  }

  // 3. Anchor framework range — only a guess that the program IS Anchor-based.
  if (isAnchorFrameworkRange(code) && ANCHOR_FRAMEWORK_ERRORS[code]) {
    return {
      source: "anchor-framework",
      name: ANCHOR_FRAMEWORK_ERRORS[code],
      hex,
      note: "matched Anchor's reserved range — assumes this program is Anchor-based",
    };
  }

  // 4. Say so.
  const likelyAnchorUser = code >= ANCHOR_USER_ERROR_OFFSET;
  return {
    source: "unknown",
    hex,
    note: likelyAnchorUser
      ? `Custom error ${code} from ${programId} — in Anchor's user-error range but no IDL published on-chain.`
      : `Custom error ${code} from ${programId} — program-defined sentinel, no IDL or known table matched.`,
  };
}
