/**
 * lib/idl-decode.ts
 *
 * Uses a program's own IDL to name an instruction and decode its arguments,
 * and to decode an account's struct.
 *
 * `lib/native-decoders.ts` covers the four programs with no IDL. This covers
 * the opposite case: an Anchor program that published one, where the IDL knows
 * the instruction names, argument types and account layouts exactly. Between
 * them, most of a transaction becomes readable.
 *
 * Anchor identifies both instructions and accounts by an 8-byte discriminator:
 *
 * - **IDLs from Anchor 0.30+ ship the bytes** in a `discriminator` field.
 * - **Older IDLs don't**, so it's derived the way Anchor does — the first 8
 *   bytes of `sha256("global:<snake_case_instruction>")`, and
 *   `sha256("account:<PascalCaseAccount>")` for accounts.
 *
 * Both shapes appear in the wild, and the two also differ in how they spell a
 * type reference (`{defined: "X"}` vs `{defined: {name: "X"}}`) and where the
 * account layout lives (inline vs in `types`). Everything here reads both.
 */

import { createHash } from "node:crypto";

import { decodeFields, type BorshValue, type IdlField, type IdlTypeDef } from "./borsh.js";

const DISCRIMINATOR_LEN = 8;

/** The shape we rely on. Anything absent simply means "can't decode that". */
export type AnchorIdl = {
  name?: string;
  metadata?: { name?: string };
  instructions?: {
    name: string;
    discriminator?: number[];
    args?: IdlField[];
    accounts?: { name: string }[];
  }[];
  accounts?: {
    name: string;
    discriminator?: number[];
    type?: { kind: string; fields?: IdlField[] };
  }[];
  types?: IdlTypeDef[];
};

export type DecodedIdlIx = {
  program: string;
  name: string;
  args: { [key: string]: BorshValue };
  /** Account roles the IDL declares, paired with the pubkeys supplied. */
  accounts: { role: string; pubkey: string }[];
  /** Set when decoding stopped early; `args` holds the fields read before it. */
  error?: string;
};

export type DecodedIdlAccount = {
  program: string;
  name: string;
  fields: { [key: string]: BorshValue };
  error?: string;
};

/** `initializeMint` / `InitializeMint` -> `initialize_mint`, as Anchor hashes it. */
function toSnakeCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

/** First 8 bytes of sha256 over the namespaced name — Anchor's scheme. */
export function anchorDiscriminator(namespace: string, name: string): Buffer {
  return createHash("sha256")
    .update(`${namespace}:${name}`)
    .digest()
    .subarray(0, DISCRIMINATOR_LEN);
}

function instructionDiscriminator(ix: { name: string; discriminator?: number[] }): Buffer {
  if (ix.discriminator?.length === DISCRIMINATOR_LEN) return Buffer.from(ix.discriminator);
  return anchorDiscriminator("global", toSnakeCase(ix.name));
}

function accountDiscriminator(acc: { name: string; discriminator?: number[] }): Buffer {
  if (acc.discriminator?.length === DISCRIMINATOR_LEN) return Buffer.from(acc.discriminator);
  // Legacy IDLs hash the account struct's PascalCase name.
  const pascal = acc.name.charAt(0).toUpperCase() + acc.name.slice(1);
  return anchorDiscriminator("account", pascal);
}

function programLabel(idl: AnchorIdl, programId: string): string {
  return idl.metadata?.name ?? idl.name ?? programId;
}

/**
 * Finds the account layout for `name`.
 *
 * Anchor 0.30+ moved the struct body out of `accounts` and into `types`,
 * leaving only a name and discriminator behind, so both places are checked.
 */
function accountFields(idl: AnchorIdl, name: string): IdlField[] | null {
  const inline = idl.accounts?.find((a) => a.name === name)?.type;
  if (inline?.fields) return inline.fields;
  const fromTypes = idl.types?.find((t) => t.name === name)?.type;
  if (fromTypes && fromTypes.kind === "struct" && fromTypes.fields) return fromTypes.fields;
  return null;
}

/**
 * Decodes one instruction against the program's IDL.
 *
 * Returns null when the IDL has no instruction with this discriminator — which
 * is a real answer, not a failure: the program may have been upgraded since the
 * IDL was published, and naming the wrong instruction would be worse than
 * naming none.
 */
export function decodeIdlInstruction(
  idl: AnchorIdl,
  programId: string,
  dataBase64: string,
  accounts: string[] = [],
): DecodedIdlIx | null {
  let data: Buffer;
  try {
    data = Buffer.from(dataBase64, "base64");
  } catch {
    return null;
  }
  if (data.length < DISCRIMINATOR_LEN) return null;

  const head = data.subarray(0, DISCRIMINATOR_LEN);
  const match = idl.instructions?.find((ix) => instructionDiscriminator(ix).equals(head));
  if (!match) return null;

  const { values, error } = decodeFields(
    data,
    match.args ?? [],
    idl.types ?? [],
    DISCRIMINATOR_LEN,
  );

  return {
    program: programLabel(idl, programId),
    name: match.name,
    args: values,
    accounts: accounts.map((pubkey, i) => ({
      role: match.accounts?.[i]?.name ?? `account ${i}`,
      pubkey,
    })),
    ...(error ? { error } : {}),
  };
}

/**
 * Decodes an account's data against the program's IDL, by its discriminator.
 *
 * This is what turns "412 bytes changed at offset 8" into named fields — the
 * difference between seeing that a pool moved and seeing which way.
 */
export function decodeIdlAccount(
  idl: AnchorIdl,
  programId: string,
  data: Buffer,
): DecodedIdlAccount | null {
  if (data.length < DISCRIMINATOR_LEN) return null;
  const head = data.subarray(0, DISCRIMINATOR_LEN);

  const match = idl.accounts?.find((acc) => accountDiscriminator(acc).equals(head));
  if (!match) return null;

  const fields = accountFields(idl, match.name);
  if (!fields) return null;

  const { values, error } = decodeFields(data, fields, idl.types ?? [], DISCRIMINATOR_LEN);
  return {
    program: programLabel(idl, programId),
    name: match.name,
    fields: values,
    ...(error ? { error } : {}),
  };
}

/** One-line rendering, matching `formatDecodedIx` in lib/native-decoders.ts. */
export function formatDecodedIdlIx(ix: DecodedIdlIx): string {
  const args = Object.entries(ix.args)
    .map(([k, v]) => `${k}=${typeof v === "object" && v !== null ? JSON.stringify(v) : v}`)
    .join(" ");
  return `${ix.program} ${ix.name}${args ? `  ${args}` : ""}${ix.error ? `  (partial: ${ix.error})` : ""}`;
}
