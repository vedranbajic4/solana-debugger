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
import { SYSTEM_PROGRAM_ID } from "./program-errors.js";
import { surfnetCall } from "./surfnet.js";

/** Offset of the u64 `amount` field in the SPL Token account layout. */
const TOKEN_AMOUNT_OFFSET = 64;
const TOKEN_ACCOUNT_LEN = 165;
/** `AccountState::Initialized` at offset 108. */
const TOKEN_STATE_OFFSET = 108;
/** `is_native: COption<u64>` at offset 109 — a 4-byte tag then the u64. */
const TOKEN_IS_NATIVE_OFFSET = 109;
const COPTION_SOME = 1;
/** Wrapped SOL. A token account for this mint must be flagged native. */
const NATIVE_MINT = "So11111111111111111111111111111111111111112";
/**
 * Rent-exempt minimum for a 165-byte account, which is what `is_native` holds
 * for a wrapped-SOL account: the part of its lamports that isn't spendable
 * balance.
 */
const TOKEN_ACCOUNT_RENT_EXEMPT = 2039280n;

export type SeedReport = {
  lamportsSet: number;
  tokenAmountsSet: number;
  tokenAccountsBuilt: number;
  /** Accounts the tx created, emptied back out so it can create them again. */
  absentAccountsReset: number;
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

/**
 * Synthesizes a minimal initialized token account.
 *
 * Wrapped SOL needs the `is_native` flag, not just the amount: the Token
 * program refuses `SyncNative` on an account without it ("Instruction does not
 * support non-native tokens"). Rebuilt wSOL accounts are common rather than
 * exotic — a wSOL account is usually closed in the same transaction that opens
 * it, so by replay time mainnet no longer has one to copy.
 */
function buildTokenAccount(mint: string, owner: string, amount: bigint): Buffer {
  const data = Buffer.alloc(TOKEN_ACCOUNT_LEN);
  new PublicKey(mint).toBuffer().copy(data, 0);
  new PublicKey(owner).toBuffer().copy(data, 32);
  data.writeBigUInt64LE(amount, TOKEN_AMOUNT_OFFSET);
  data.writeUInt8(1, TOKEN_STATE_OFFSET);
  if (mint === NATIVE_MINT) {
    data.writeUInt32LE(COPTION_SOME, TOKEN_IS_NATIVE_OFFSET);
    data.writeBigUInt64LE(TOKEN_ACCOUNT_RENT_EXEMPT, TOKEN_IS_NATIVE_OFFSET + 4);
  }
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
    absentAccountsReset: 0,
    skipped: [],
  };
  if (!meta) return report;

  // 1. Lamports — recorded for every account the tx touched.
  //
  //    A zero pre-balance means the account did not exist yet, and zero is the
  //    one value the cheatcode won't write: surfnet reads it as "absent" and
  //    lazily re-pulls the account from mainnet, undoing the seed. Those are
  //    collected for step 3 instead.
  const absent: number[] = [];
  await Promise.all(
    meta.preBalances.map(async (lamports, i) => {
      const key = accountKeys.get(i);
      if (!key) return;
      if (lamports === 0) {
        absent.push(i);
        return;
      }
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
        // A wSOL account always carries `is_native`; assert it rather than
        // trusting the fork's copy, which may itself be one we rebuilt earlier
        // in the session without it.
        if (bal.mint === NATIVE_MINT && data.length >= TOKEN_IS_NATIVE_OFFSET + 12) {
          data.writeUInt32LE(COPTION_SOME, TOKEN_IS_NATIVE_OFFSET);
          data.writeBigUInt64LE(TOKEN_ACCOUNT_RENT_EXEMPT, TOKEN_IS_NATIVE_OFFSET + 4);
        }
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
      try {
        await setAccount(url, pubkey, {
          data: data.toString("hex"),
          ...(bal.programId ? { owner: bal.programId } : {}),
        });
        report.tokenAccountsBuilt++;
      } catch (e) {
        // Rebuilding normally works even for an account closed since the tx —
        // the cheatcode can create one. This catch is for the transient case:
        // surfnet consults the remote first, and a failed request surfaces as
        // `AccountNotFound: … error sending request for url (…)`, which is a
        // flaky RPC rather than a real absence. Record it and seed what we can;
        // aborting here would throw away the rest of a usable replay.
        report.skipped.push({
          pubkey,
          reason: `could not rebuild (often a transient RPC failure): ${(e as Error).message}`,
        });
      }
    })
  );

  // 3. Accounts the transaction *created*.
  //
  //    The fork pulls present-day mainnet state, where the account exists —
  //    because this very transaction created it. Replaying then dies on
  //    "already in use" before reaching anything interesting. Emptying the
  //    account back out lets the tx create it again.
  //
  //    It can't be emptied all the way: lamports 0 is unwritable (see step 1),
  //    so the shell keeps a single lamport. `Allocate`/`Assign` only check that
  //    the data is empty and the owner is System, so those replay correctly;
  //    `CreateAccount` additionally rejects any account holding lamports, and
  //    still fails. That's a fork limitation, not the transaction's.
  await Promise.all(
    absent.map(async (i) => {
      const key = accountKeys.get(i);
      const info = current[i] ?? null;
      if (!key || !info) return; // nothing on the fork to clear: already absent
      if (info.data.length === 0 && info.owner.toBase58() === SYSTEM_PROGRAM_ID) return;

      await setAccount(url, key.toBase58(), {
        lamports: 1,
        data: "",
        owner: SYSTEM_PROGRAM_ID,
      });
      report.absentAccountsReset++;
    })
  );

  return report;
}
