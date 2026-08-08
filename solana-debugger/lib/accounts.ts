/**
 * lib/accounts.ts
 *
 * Snapshot and diff of account state around a replay.
 *
 * `simulateTransaction` hands back post-execution state for accounts we name
 * up front; the pre-state is read off the *same* forked validator, so both
 * sides describe one machine at one slot and the diff actually means
 * something. Diffing against mainnet instead would fold in every unrelated
 * change between the fork point and now.
 */

import { PublicKey } from "@solana/web3.js";
import type {
  AccountInfo,
  SimulatedTransactionAccountInfo,
} from "@solana/web3.js";

import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "./program-errors.js";

/** Account state at one instant. `null` means the account does not exist. */
export type AccountSnapshot = {
  lamports: number;
  owner: string;
  data: Buffer;
} | null;

export function snapshotFromAccountInfo(
  info: AccountInfo<Buffer> | null,
): AccountSnapshot {
  if (!info) return null;
  return {
    lamports: info.lamports,
    owner: info.owner.toBase58(),
    data: info.data,
  };
}

export function snapshotFromSimulated(
  info: SimulatedTransactionAccountInfo | null | undefined,
): AccountSnapshot {
  if (!info) return null;
  return {
    lamports: info.lamports,
    owner: info.owner,
    // data is [base64, "base64"] — the encoding we asked for.
    data: Buffer.from(info.data[0] ?? "", "base64"),
  };
}

/** Base SPL Token account layout; Token-2022 matches it for the first 165 bytes. */
const TOKEN_ACCOUNT_LEN = 165;
/** Token-2022 tags extended accounts at offset 165: 1 = Mint, 2 = Account. */
const TOKEN_2022_ACCOUNT_TYPE_ACCOUNT = 2;

export type TokenAccountView = {
  mint: string;
  owner: string;
  amount: bigint;
};

/**
 * Decodes an SPL Token / Token-2022 token account, or returns null if this
 * isn't one. Deliberately strict: a mis-decode here would print a confident
 * fake balance, which is worse than printing nothing.
 */
export function decodeTokenAccount(
  snap: AccountSnapshot,
): TokenAccountView | null {
  if (!snap) return null;
  if (snap.owner !== TOKEN_PROGRAM_ID && snap.owner !== TOKEN_2022_PROGRAM_ID) {
    return null;
  }
  if (snap.data.length < TOKEN_ACCOUNT_LEN) return null;
  // A Token-2022 *mint* with extensions can also exceed 165 bytes, so when
  // there's an extension region the type tag has to say "Account".
  if (
    snap.data.length > TOKEN_ACCOUNT_LEN &&
    snap.data.readUInt8(TOKEN_ACCOUNT_LEN) !== TOKEN_2022_ACCOUNT_TYPE_ACCOUNT
  ) {
    return null;
  }
  return {
    mint: new PublicKey(snap.data.subarray(0, 32)).toBase58(),
    owner: new PublicKey(snap.data.subarray(32, 64)).toBase58(),
    amount: snap.data.readBigUInt64LE(64),
  };
}

export type AccountDiff = {
  pubkey: string;
  kind: "created" | "closed" | "changed";
  lamports: { pre: number; post: number } | null;
  owner: { pre: string; post: string } | null;
  dataLen: { pre: number; post: number } | null;
  /** Differing byte count, only computed when the data length is unchanged. */
  bytesChanged: number | null;
  firstChangedOffset: number | null;
  /** Token balance movement, when either side decodes as a token account. */
  token: {
    mint: string;
    owner: string;
    pre: bigint;
    post: bigint;
  } | null;
};

/** Returns null when nothing about the account changed. */
export function diffAccount(
  pubkey: string,
  pre: AccountSnapshot,
  post: AccountSnapshot,
): AccountDiff | null {
  if (!pre && !post) return null;

  const preTok = decodeTokenAccount(pre);
  const postTok = decodeTokenAccount(post);
  const tokView = postTok ?? preTok;
  const token =
    tokView && (preTok?.amount ?? 0n) !== (postTok?.amount ?? 0n)
      ? {
          mint: tokView.mint,
          owner: tokView.owner,
          pre: preTok?.amount ?? 0n,
          post: postTok?.amount ?? 0n,
        }
      : null;

  if (!pre || !post) {
    return {
      pubkey,
      kind: pre ? "closed" : "created",
      lamports: { pre: pre?.lamports ?? 0, post: post?.lamports ?? 0 },
      owner: null,
      dataLen: { pre: pre?.data.length ?? 0, post: post?.data.length ?? 0 },
      bytesChanged: null,
      firstChangedOffset: null,
      token,
    };
  }

  const lamports =
    pre.lamports !== post.lamports
      ? { pre: pre.lamports, post: post.lamports }
      : null;
  const owner = pre.owner !== post.owner ? { pre: pre.owner, post: post.owner } : null;
  const dataLen =
    pre.data.length !== post.data.length
      ? { pre: pre.data.length, post: post.data.length }
      : null;

  let bytesChanged: number | null = null;
  let firstChangedOffset: number | null = null;
  if (!dataLen) {
    let changed = 0;
    for (let i = 0; i < pre.data.length; i++) {
      if (pre.data[i] !== post.data[i]) {
        if (firstChangedOffset === null) firstChangedOffset = i;
        changed++;
      }
    }
    bytesChanged = changed;
  }

  if (!lamports && !owner && !dataLen && !bytesChanged) return null;

  return {
    pubkey,
    kind: "changed",
    lamports,
    owner,
    dataLen,
    bytesChanged,
    firstChangedOffset,
    token,
  };
}

const signed = (n: bigint | number) => (n > 0 ? `+${n}` : `${n}`);

/**
 * Renders an account's state at the fork point.
 *
 * A failed simulation is rolled back, so the validator returns no post-state
 * and there is no diff to show. The pre-state is still the interesting part
 * then: it's the state the program actually read on its way to failing.
 */
export function formatSnapshot(pubkey: string, snap: AccountSnapshot): string[] {
  if (!snap) return [`  ${pubkey}  [does not exist on the fork]`];

  const tok = decodeTokenAccount(snap);
  const out = [`  ${pubkey}`];
  if (tok) {
    out.push(`      token  mint ${tok.mint}`);
    out.push(`             owner ${tok.owner}`);
    out.push(`             amount ${tok.amount}`);
  } else {
    out.push(`      owner ${snap.owner}, ${snap.data.length} bytes`);
  }
  out.push(`      lamports ${snap.lamports}`);
  return out;
}

/** Renders one diff as indented CLI lines. */
export function formatAccountDiff(d: AccountDiff): string[] {
  const out: string[] = [`  ${d.pubkey}${d.kind === "changed" ? "" : `  [${d.kind}]`}`];

  if (d.token) {
    out.push(`      token  mint ${d.token.mint}`);
    out.push(`             owner ${d.token.owner}`);
    out.push(
      `             amount ${d.token.pre} -> ${d.token.post}  (${signed(d.token.post - d.token.pre)})`
    );
  }
  if (d.lamports) {
    out.push(
      `      lamports ${d.lamports.pre} -> ${d.lamports.post}  (${signed(d.lamports.post - d.lamports.pre)})`
    );
  }
  if (d.owner) out.push(`      owner ${d.owner.pre} -> ${d.owner.post}`);
  if (d.dataLen) out.push(`      data length ${d.dataLen.pre} -> ${d.dataLen.post} bytes`);
  if (d.bytesChanged) {
    out.push(
      `      data ${d.bytesChanged} byte(s) changed, first at offset ${d.firstChangedOffset}` +
        (d.token ? "" : " (no decoder for this account type)")
    );
  }
  return out;
}
