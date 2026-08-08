/**
 * lib/archive.ts
 *
 * Historical account state, the one thing transaction metadata cannot provide.
 *
 * `seedPreState()` restores lamports and token amounts exactly, because the
 * validator recorded them. It can restore nothing else: a pool's internal
 * accounting, an oracle's price, a tick array, an open-orders book. Those stay
 * at present-day values, and they are the entire residual cause of replay
 * mismatches once the seeding bugs are out of the way — an arbitrage bot
 * replayed against today's reserves takes a different branch and returns a
 * different one of its own error codes.
 *
 * There is no standard Solana RPC for "this account at slot N" — the `slot`
 * field in a `getAccountInfo` response is when it was *answered*, not what it
 * describes, and a normal endpoint silently ignores a slot you pass in. Some
 * providers do offer it as an extension; Alchemy's Account Archive implements
 * `getAccountInfo` with `slot` / `lastUpdateBeforeSlot` / `firstUpdateAfterSlot`
 * (coverage from July 2025).
 *
 * `lastUpdateBeforeSlot` is the one worth using: it returns the account as it
 * was last written *before* the tx's slot, which is the state the transaction
 * read. Asking for `slot: N` instead would be ambiguous about writes made
 * earlier within that same slot.
 *
 * Configure with `ARCHIVE_RPC`. Unset is a supported configuration, not an
 * error: the replay falls back to metadata-only seeding and says so.
 */

import type { AccountInfo } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

import { SYSTEM_PROGRAM_ID } from "./program-errors.js";
import { surfnetCall } from "./surfnet.js";

/** JSON-RPC batches of this size keep request bodies reasonable. */
const BATCH_SIZE = 50;

type RpcResponse<T> = { id?: number; result?: T; error?: { code?: number; message?: string } };

type AccountValue = {
  lamports: number;
  owner: string;
  data: [string, string];
  executable: boolean;
} | null;

export type ArchiveProbe =
  | { supported: true }
  | { supported: false; reason: string };

/** One account as of the archive's answer. `null` = did not exist yet. */
export type ArchivedAccount = {
  lamports: number;
  owner: string;
  data: Buffer;
  executable: boolean;
} | null;

async function rpc<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as T;
}

/**
 * Decides whether `url` really serves historical account state.
 *
 * The failure mode this has to catch is not an endpoint that errors — it's one
 * that *succeeds*. A normal RPC ignores an unrecognised `slot` and hands back
 * present-day state, which would be injected as though it were historical and
 * quietly make every replay wrong while looking like it worked.
 *
 * So support is established by a request that a real archive must *reject*:
 * `slot` and `minContextSlot` are documented as mutually exclusive. An endpoint
 * that accepts both is one that is reading neither.
 */
export async function probeArchive(url: string, slot: number): Promise<ArchiveProbe> {
  const probeAccount = PublicKey.default.toBase58();

  const historical = await rpc<RpcResponse<{ value: AccountValue }>>(url, {
    jsonrpc: "2.0",
    id: 1,
    method: "getAccountInfo",
    params: [probeAccount, { encoding: "base64", lastUpdateBeforeSlot: slot }],
  }).catch((e: Error) => ({ error: { message: e.message } }));

  if (historical.error) {
    return {
      supported: false,
      reason: `endpoint rejected lastUpdateBeforeSlot: ${historical.error.message ?? "unknown error"}`,
    };
  }

  const contradictory = await rpc<RpcResponse<unknown>>(url, {
    jsonrpc: "2.0",
    id: 1,
    method: "getAccountInfo",
    params: [probeAccount, { encoding: "base64", slot, minContextSlot: slot }],
  }).catch((e: Error) => ({ error: { message: e.message } }));

  if (!contradictory.error) {
    return {
      supported: false,
      reason:
        "endpoint accepted slot together with minContextSlot, which a real archive " +
        "rejects — it is ignoring both and would return present-day state",
    };
  }

  return { supported: true };
}

/**
 * Reads accounts as of the last write before `slot`.
 *
 * Returns a map keyed by base58 address. An address missing from the map means
 * the archive could not answer for it — distinct from a `null` value, which is
 * the archive positively saying the account did not exist yet.
 */
export async function fetchAccountsBeforeSlot(
  url: string,
  pubkeys: string[],
  slot: number,
): Promise<{ accounts: Map<string, ArchivedAccount>; errors: string[] }> {
  const accounts = new Map<string, ArchivedAccount>();
  const errors: string[] = [];

  for (let i = 0; i < pubkeys.length; i += BATCH_SIZE) {
    const chunk = pubkeys.slice(i, i + BATCH_SIZE);
    const batch = chunk.map((pubkey, j) => ({
      jsonrpc: "2.0",
      id: j,
      method: "getAccountInfo",
      params: [pubkey, { encoding: "base64", lastUpdateBeforeSlot: slot }],
    }));

    let responses: RpcResponse<{ value: AccountValue }>[];
    try {
      responses = await rpc<RpcResponse<{ value: AccountValue }>[]>(url, batch);
    } catch (e) {
      errors.push(`batch at index ${i} failed: ${(e as Error).message}`);
      continue;
    }
    if (!Array.isArray(responses)) {
      errors.push(`batch at index ${i}: endpoint did not return a JSON-RPC batch`);
      continue;
    }

    for (const res of responses) {
      // Batch responses may come back in any order; `id` is the index we set.
      const pubkey = chunk[res.id ?? -1];
      if (!pubkey) continue;
      if (res.error) {
        errors.push(`${pubkey}: ${res.error.message ?? "unknown error"}`);
        continue;
      }
      const value = res.result?.value;
      accounts.set(
        pubkey,
        value
          ? {
              lamports: value.lamports,
              owner: value.owner,
              data: Buffer.from(value.data[0] ?? "", "base64"),
              executable: value.executable,
            }
          : null
      );
    }
  }

  return { accounts, errors };
}

export type InjectionReport = {
  injected: number;
  /** Accounts the archive says didn't exist yet, emptied back out on the fork. */
  emptied: number;
  /** Accounts left alone because injecting them would be a downgrade. */
  skipped: { pubkey: string; reason: string }[];
  failed: { pubkey: string; reason: string }[];
};

/**
 * Writes archived state onto the fork.
 *
 * Executable accounts are deliberately left alone: those are programs, and
 * overwriting a loaded program's account with a raw data blob is a good way to
 * break the fork's loader for no benefit. Program *pinning* at a historical
 * version is its own problem, not this one.
 */
export async function injectHistoricalState(
  surfnetUrl: string,
  archived: Map<string, ArchivedAccount>,
  current: Map<string, AccountInfo<Buffer> | null>,
): Promise<InjectionReport> {
  const report: InjectionReport = { injected: 0, emptied: 0, skipped: [], failed: [] };

  for (const [pubkey, account] of archived) {
    const now = current.get(pubkey) ?? null;

    if (account === null) {
      // The archive says this didn't exist yet. If the fork has it (created
      // later, quite possibly by the very tx being replayed), empty it out —
      // same one-lamport shell as `seedPreState` step 3, since lamports 0 is
      // unwritable and would make surfnet re-pull from mainnet.
      if (!now || (now.data.length === 0 && now.owner.toBase58() === SYSTEM_PROGRAM_ID)) continue;
      try {
        await setAccount(surfnetUrl, pubkey, {
          lamports: 1,
          data: "",
          owner: SYSTEM_PROGRAM_ID,
        });
        report.emptied++;
      } catch (e) {
        report.failed.push({ pubkey, reason: (e as Error).message });
      }
      continue;
    }

    if (account.executable || now?.executable) {
      report.skipped.push({ pubkey, reason: "executable (program account)" });
      continue;
    }
    if (account.lamports === 0) {
      report.skipped.push({ pubkey, reason: "archived lamports are 0, which surfnet cannot store" });
      continue;
    }

    try {
      await setAccount(surfnetUrl, pubkey, {
        lamports: account.lamports,
        data: account.data.toString("hex"),
        owner: account.owner,
      });
      report.injected++;
    } catch (e) {
      report.failed.push({ pubkey, reason: (e as Error).message });
    }
  }

  return report;
}

async function setAccount(
  url: string,
  pubkey: string,
  update: { lamports?: number; data?: string; owner?: string },
) {
  const res = (await surfnetCall(url, "surfnet_setAccount", [pubkey, update])) as {
    error?: { message?: string; data?: string };
  };
  if (res?.error) {
    throw new Error(res.error.data ?? res.error.message ?? "surfnet_setAccount failed");
  }
}
