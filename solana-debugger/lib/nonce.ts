/**
 * lib/nonce.ts
 *
 * Durable-nonce support for the replay.
 *
 * A replay can't reuse the transaction's own blockhash — it expired long ago —
 * so `simulateTransaction` is normally called with `replaceRecentBlockhash`,
 * which swaps in a current one. That silently breaks durable-nonce
 * transactions: their `recentBlockhash` field isn't a blockhash at all, it's
 * the nonce value stored in the nonce account, and the runtime validates the
 * two against each other. Overwrite it and the tx is rejected before execution
 * with `BlockhashNotFound` and 0 CU — a failure that says nothing about the
 * transaction and everything about how we ran it.
 *
 * The fix runs the other way round: leave the tx's nonce in place and seed the
 * *account* so it stores that same nonce, which is exactly the state the tx ran
 * against on mainnet. Bots use durable nonces heavily, so this is a large slice
 * of the failed transactions anyone would point this tool at.
 */

import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import type { AccountInfo, VersionedTransactionResponse } from "@solana/web3.js";

import { normalizeInstructions } from "./decode.js";
import { SYSTEM_PROGRAM_ID } from "./program-errors.js";
import { surfnetCall } from "./surfnet.js";

/** SystemInstruction discriminants are u32 LE; AdvanceNonceAccount is 4. */
const ADVANCE_NONCE_ACCOUNT = 4;

/**
 * Nonce account layout (bincode): Versions(u32) + State(u32) + authority(32)
 * + durable_nonce(32) + fee_calculator.lamports_per_signature(u64) = 80 bytes.
 */
const NONCE_ACCOUNT_LENGTH = 80;
const NONCE_VALUE_OFFSET = 4 + 4 + 32;
const NONCE_AUTHORITY_OFFSET = 4 + 4;
/** Versions::Current */
const NONCE_VERSION_CURRENT = 1;
/** State::Initialized */
const NONCE_STATE_INITIALIZED = 1;
const DEFAULT_LAMPORTS_PER_SIGNATURE = 5000n;

export type DurableNonceInfo = {
  /** The nonce account, i.e. account 0 of the AdvanceNonceAccount instruction. */
  account: string;
  authority: string;
  /** The nonce the tx carries in its `recentBlockhash` field, base58. */
  nonce: string;
};

/**
 * Detects a durable-nonce transaction.
 *
 * The runtime only honours the nonce when `AdvanceNonceAccount` is the *first*
 * instruction, so anything later doesn't make this a nonce transaction and
 * mustn't change how we simulate it.
 */
export function findDurableNonce(
  tx: VersionedTransactionResponse,
): DurableNonceInfo | null {
  const first = normalizeInstructions(tx)[0];
  if (!first || first.programId !== SYSTEM_PROGRAM_ID) return null;

  const data = Buffer.from(first.dataBase64, "base64");
  if (data.length < 4 || data.readUInt32LE(0) !== ADVANCE_NONCE_ACCOUNT) return null;

  // accounts: [nonce, recent blockhashes sysvar, authority]
  const account = first.accounts[0]?.pubkey;
  const authority = first.accounts[2]?.pubkey;
  if (!account || !authority) return null;

  return { account, authority, nonce: tx.transaction.message.recentBlockhash };
}

/** Builds a fresh initialized nonce account holding `nonce`. */
function buildNonceAccount(authority: string, nonce: Buffer): Buffer {
  const data = Buffer.alloc(NONCE_ACCOUNT_LENGTH);
  data.writeUInt32LE(NONCE_VERSION_CURRENT, 0);
  data.writeUInt32LE(NONCE_STATE_INITIALIZED, 4);
  new PublicKey(authority).toBuffer().copy(data, NONCE_AUTHORITY_OFFSET);
  nonce.copy(data, NONCE_VALUE_OFFSET);
  data.writeBigUInt64LE(DEFAULT_LAMPORTS_PER_SIGNATURE, NONCE_VALUE_OFFSET + 32);
  return data;
}

export type NonceSeedResult =
  | { seeded: true; rebuilt: boolean }
  | { seeded: false; reason: string };

/**
 * Writes the tx's nonce into the nonce account on the fork.
 *
 * Splices into the existing account when there is one, so the real authority
 * and fee calculator survive; only rebuilds when the fork has nothing usable
 * (the account was closed since, say).
 */
export async function seedNonceAccount(
  url: string,
  info: DurableNonceInfo,
  current: AccountInfo<Buffer> | null,
): Promise<NonceSeedResult> {
  let nonce: Buffer;
  try {
    nonce = Buffer.from(bs58.decode(info.nonce));
  } catch {
    return { seeded: false, reason: "transaction's nonce is not valid base58" };
  }
  if (nonce.length !== 32) {
    return { seeded: false, reason: `nonce is ${nonce.length} bytes, expected 32` };
  }

  const usable =
    current !== null &&
    current.owner.toBase58() === SYSTEM_PROGRAM_ID &&
    current.data.length >= NONCE_ACCOUNT_LENGTH;

  let data: Buffer;
  let rebuilt: boolean;
  if (usable) {
    data = Buffer.from(current!.data);
    nonce.copy(data, NONCE_VALUE_OFFSET);
    rebuilt = false;
  } else {
    data = buildNonceAccount(info.authority, nonce);
    rebuilt = true;
  }

  const res = (await surfnetCall(url, "surfnet_setAccount", [
    info.account,
    { data: data.toString("hex"), ...(rebuilt ? { owner: SYSTEM_PROGRAM_ID } : {}) },
  ])) as { error?: { message?: string; data?: string } };

  if (res?.error) {
    return { seeded: false, reason: res.error.data ?? res.error.message ?? "setAccount failed" };
  }
  return { seeded: true, rebuilt };
}
