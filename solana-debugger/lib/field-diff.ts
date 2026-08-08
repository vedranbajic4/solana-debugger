/**
 * lib/field-diff.ts
 *
 * Turns "412 bytes changed, first at offset 8" into named field changes.
 *
 * `diffAccount()` in `lib/accounts.ts` compares bytes, which is all it can do
 * without knowing the layout: it decodes SPL token accounts (a fixed, known
 * shape) and otherwise reports a changed-byte count. For a program-owned
 * account — an AMM pool, an oracle, an open-orders book — that count says
 * *something* moved but never what, and "what" is usually the whole question.
 *
 * With the program's IDL, both snapshots decode into named fields and the
 * comparison happens there instead. The byte count stays as the fallback, and
 * as the check on this one: a field diff that reports nothing changed while the
 * bytes say otherwise means the layout is wrong, and that's worth surfacing
 * rather than hiding behind a confident empty result.
 */

import type { BorshValue } from "./borsh.js";
import { decodeIdlAccount, type AnchorIdl } from "./idl-decode.js";

export type FieldChange = {
  /** Dotted path into the struct, e.g. `liquidity` or `fees.protocolOwed`. */
  path: string;
  pre: BorshValue;
  post: BorshValue;
  /** Signed delta as a decimal string, when both sides are numeric. */
  delta: string | null;
};

export type FieldDiff = {
  /** The account struct the IDL matched, e.g. `Whirlpool`. */
  accountType: string;
  changes: FieldChange[];
  /**
   * Set when the field comparison can't be trusted end to end: a partial
   * decode, or bytes that changed while no field did.
   */
  caveat?: string;
};

/** Numeric-looking values are compared as BigInt so u64 deltas stay exact. */
function asBigInt(value: BorshValue): bigint | null {
  if (typeof value === "number" && Number.isInteger(value)) return BigInt(value);
  if (typeof value === "string" && /^-?\d+$/.test(value)) {
    try {
      return BigInt(value);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Walks two decoded structs in parallel, collecting leaf differences.
 *
 * Recurses into nested structs and arrays so a change buried in a sub-struct
 * still surfaces with a path that locates it.
 */
function walk(pre: BorshValue, post: BorshValue, path: string, out: FieldChange[]): void {
  if (Array.isArray(pre) && Array.isArray(post)) {
    const len = Math.max(pre.length, post.length);
    for (let i = 0; i < len; i++) {
      walk(pre[i] ?? null, post[i] ?? null, `${path}[${i}]`, out);
    }
    return;
  }

  const bothStructs =
    pre !== null &&
    post !== null &&
    typeof pre === "object" &&
    typeof post === "object" &&
    !Array.isArray(pre) &&
    !Array.isArray(post);

  if (bothStructs) {
    const keys = new Set([...Object.keys(pre), ...Object.keys(post)]);
    for (const key of keys) {
      walk(
        (pre as Record<string, BorshValue>)[key] ?? null,
        (post as Record<string, BorshValue>)[key] ?? null,
        path ? `${path}.${key}` : key,
        out,
      );
    }
    return;
  }

  if (JSON.stringify(pre) === JSON.stringify(post)) return;

  const a = asBigInt(pre);
  const b = asBigInt(post);
  out.push({
    path,
    pre,
    post,
    delta: a !== null && b !== null ? (b - a).toString() : null,
  });
}

/**
 * Diffs two account snapshots at field level using the owning program's IDL.
 *
 * Returns null when the IDL can't describe this account — no IDL, an account
 * type whose discriminator isn't in it, or a program upgraded since the IDL was
 * published. That's a real answer: the byte-level diff still stands, and naming
 * fields from a layout that may not match would be worse than declining.
 *
 * `bytesChanged` is what `diffAccount()` measured, passed in so the two views
 * can be cross-checked.
 */
export function diffAccountFields(
  idl: AnchorIdl | null,
  programId: string,
  preData: Buffer | null,
  postData: Buffer | null,
  bytesChanged: number | null,
): FieldDiff | null {
  if (!idl || !preData || !postData) return null;

  const pre = decodeIdlAccount(idl, programId, preData);
  const post = decodeIdlAccount(idl, programId, postData);
  if (!pre || !post) return null;
  // Different struct types on either side means the account was reinitialized
  // as something else; a field-by-field diff would be meaningless.
  if (pre.name !== post.name) return null;

  const changes: FieldChange[] = [];
  walk(pre.fields, post.fields, "", changes);

  const partial = pre.error ?? post.error ?? null;
  let caveat: string | undefined;
  if (partial) {
    caveat = `decode stopped early (${partial}) — fields after that point are not compared`;
  } else if (changes.length === 0 && bytesChanged) {
    // The layout decoded cleanly and claims nothing moved, but the bytes
    // disagree. Trust the bytes and say so.
    caveat = `${bytesChanged} byte(s) changed but no field differs — the IDL layout may not match this account`;
  }

  return {
    accountType: pre.name,
    changes,
    ...(caveat ? { caveat } : {}),
  };
}

/** Renders a field diff as indented CLI lines, matching formatAccountDiff. */
export function formatFieldDiff(diff: FieldDiff): string[] {
  const out = [`      ${diff.accountType}:`];
  for (const c of diff.changes) {
    const delta = c.delta === null ? "" : `  (${c.delta.startsWith("-") ? "" : "+"}${c.delta})`;
    out.push(`        ${c.path}  ${JSON.stringify(c.pre)} -> ${JSON.stringify(c.post)}${delta}`);
  }
  if (diff.changes.length === 0 && !diff.caveat) out.push("        (no field changed)");
  if (diff.caveat) out.push(`        note: ${diff.caveat}`);
  return out;
}
