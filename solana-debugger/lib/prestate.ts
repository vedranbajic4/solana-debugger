/**
 * lib/prestate.ts
 *
 * Seeds the fork with the transaction's real pre-execution state.
 *
 * Why this is needed: surfnet lazily pulls account state from mainnet as
 * accounts are touched, and it pulls whatever mainnet holds *now* — historical
 * state at a given slot needs an archival RPC that we don't assume. So
 * replaying a tx from slot N against a fork starts from state that may be
 * hours or days newer, and the replay fails for reasons the original never hit
 * (a token account since drained reports "insufficient funds", say).
 *
 * The transaction's own metadata is the fix: the validator recorded
 * `preBalances` and `preTokenBalances` at execution time, so those are ground
 * truth for the state the tx actually ran against. We write them back onto the
 * fork with surfnet's `surfnet_setAccount` cheatcode before simulating.
 *
 * What this does NOT restore: arbitrary program-owned account data (pool
 * reserves, oracle prices, open orders). Nothing in the tx metadata records
 * it, so it stays at present-day values — see `SeedReport.caveat`.
 */

import { PublicKey } from "@solana/web3.js";
import type {
  AccountInfo,
  MessageAccountKeys,
  VersionedTransactionResponse,
} from "@solana/web3.js";

import { decodeTokenAccount, snapshotFromAccountInfo } from "./accounts.js";
import { surfnetCall } from "./surfnet.js";

/** Offset of the u64 `amount` field in the SPL Token account layout. */
const TOKEN_AMOUNT_OFFSET = 64;
const TOKEN_ACCOUNT_LEN = 165;
/** `AccountState::Initialized` at offset 108. */
const TOKEN_STATE_OFFSET = 108;

export type SeedReport = {
  lamportsSet: number;
  tokenAmountsSet: number;
  tokenAccountsBuilt: number;
  skipped: { pubkey: string; reason: string }[];
};

/** Applies a partial account update via surfnet's cheatcode. `data` is hex. */
async function setAccount(
  url: string,
  pubkey: string,
  update: { lamports?: number; data?: string; owner?: string },
) {
  const res = (await surfnetCall(url, "surfnet_setAccount", [pubkey, update])) as {
    error?: { message?: string; data?: string };
  };
  if (res?.error) {
    throw new Error(
      `surfnet_setAccount(${pubkey}) failed: ${res.error.data ?? res.error.message}`
    );
  }
}

/** Synthesizes a minimal initialized token account. */
function buildTokenAccount(mint: string, owner: string, amount: bigint): Buffer {
  const data = Buffer.alloc(TOKEN_ACCOUNT_LEN);
  new PublicKey(mint).toBuffer().copy(data, 0);
  new PublicKey(owner).toBuffer().copy(data, 32);
  data.writeBigUInt64LE(amount, TOKEN_AMOUNT_OFFSET);
  data.writeUInt8(1, TOKEN_STATE_OFFSET);
  return data;
}

/**
 * Writes the tx's recorded pre-state onto the fork.
 *
 * `current` must be the accounts as they exist on the fork *now*, read before
 * calling this — reading them is what makes surfnet lazily pull the real
 * mainnet account, and seeding an untouched address first would otherwise
 * shadow it with an empty System-owned shell.
 */
export async function seedPreState(
  url: string,
  tx: VersionedTransactionResponse,
  accountKeys: MessageAccountKeys,
  current: (AccountInfo<Buffer> | null)[],
): Promise<SeedReport> {
  const meta = tx.meta;
  const report: SeedReport = {
    lamportsSet: 0,
    tokenAmountsSet: 0,
    tokenAccountsBuilt: 0,
    skipped: [],
  };
  if (!meta) return report;

  // 1. Lamports — recorded for every account the tx touched.
  await Promise.all(
    meta.preBalances.map(async (lamports, i) => {
      const key = accountKeys.get(i);
      if (!key) return;
      await setAccount(url, key.toBase58(), { lamports });
      report.lamportsSet++;
    })
  );

  // 2. Token amounts — splice the recorded amount into the existing account so
  //    delegate/close-authority/extensions survive, rather than rebuilding a
  //    token account from scratch and silently dropping those fields.
  await Promise.all(
    (meta.preTokenBalances ?? []).map(async (bal) => {
      const key = accountKeys.get(bal.accountIndex);
      if (!key) return;
      const pubkey = key.toBase58();
      const amount = BigInt(bal.uiTokenAmount.amount);
      const info = current[bal.accountIndex] ?? null;
      const snap = snapshotFromAccountInfo(info);

      if (snap && decodeTokenAccount(snap)) {
        const data = Buffer.from(snap.data);
        data.writeBigUInt64LE(amount, TOKEN_AMOUNT_OFFSET);
        await setAccount(url, pubkey, { data: data.toString("hex") });
        report.tokenAmountsSet++;
        return;
      }

      // The account isn't a usable token account on the fork (closed since, or
      // never fetched). Rebuild it if the metadata says who owns it.
      if (!bal.owner) {
        report.skipped.push({
          pubkey,
          reason: "not a token account on the fork, and metadata has no owner to rebuild from",
        });
        return;
      }
      const data = buildTokenAccount(bal.mint, bal.owner, amount);
      await setAccount(url, pubkey, {
        data: data.toString("hex"),
        ...(bal.programId ? { owner: bal.programId } : {}),
      });
      report.tokenAccountsBuilt++;
    })
  );

  return report;
}
