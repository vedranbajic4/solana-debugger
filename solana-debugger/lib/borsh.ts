/**
 * lib/borsh.ts
 *
 * A borsh reader driven by Anchor IDL type descriptions.
 *
 * Hand-rolled rather than pulling in `@coral-xyz/anchor`: the dependency
 * carries a provider, a wallet abstraction and a transaction builder, none of
 * which a read-only post-mortem tool wants, and the slice of borsh an IDL can
 * express is small and stable. It also keeps the failure behaviour ours — see
 * below, which matters more here than the code saved.
 *
 * **Decoding stops at the first thing it doesn't understand.** An unknown type,
 * a length that runs past the buffer, an enum variant out of range: all throw
 * `BorshError` with the byte offset. The alternative — skipping a field and
 * carrying on — silently misaligns every field after it, and misaligned borsh
 * still produces perfectly plausible numbers. A confident wrong `amount` is the
 * exact failure this tool refuses to make elsewhere.
 *
 * Output is JSON-safe by the same rule as `lib/report.ts`: integers wider than
 * 32 bits come back as decimal strings, since a u64 does not survive JSON as a
 * number.
 */

import { PublicKey } from "@solana/web3.js";

/** An IDL type: a primitive name, or one of the container shapes. */
export type IdlType =
  | string
  | { option: IdlType }
  | { coption: IdlType }
  | { vec: IdlType }
  | { array: [IdlType, number] }
  // Anchor <0.30 writes `{defined: "Name"}`; 0.30+ writes `{defined: {name}}`.
  | { defined: string | { name: string } }
  | { generic: string };

export type IdlField = { name: string; type: IdlType };

export type IdlTypeDefTy =
  | { kind: "struct"; fields?: IdlField[] }
  | { kind: "enum"; variants: { name: string; fields?: IdlField[] | IdlType[] }[] }
  | { kind: "type"; alias?: IdlType };

export type IdlTypeDef = { name: string; type: IdlTypeDefTy };

export type BorshValue =
  | string
  | number
  | boolean
  | null
  | BorshValue[]
  | { [key: string]: BorshValue };

/**
 * Distinguishes a named field list from a tuple's bare types.
 *
 * Anchor uses the same `fields` key for both: `[{name, type}, …]` for a named
 * struct or variant, `["bool", {vec: "u8"}, …]` for a tuple. Reading a tuple as
 * named yields `undefined` types and decodes garbage, so the shape has to be
 * sniffed rather than assumed.
 */
function isNamedFields(fields: readonly (IdlField | IdlType)[]): fields is IdlField[] {
  const first = fields[0];
  return typeof first === "object" && first !== null && "name" in first && "type" in first;
}

export class BorshError extends Error {
  constructor(
    message: string,
    readonly offset: number,
  ) {
    super(`${message} (at byte ${offset})`);
    this.name = "BorshError";
  }
}

export class BorshReader {
  offset: number;

  constructor(
    private readonly data: Buffer,
    start = 0,
  ) {
    this.offset = start;
  }

  get remaining(): number {
    return this.data.length - this.offset;
  }

  private need(bytes: number, what: string): void {
    if (this.remaining < bytes) {
      throw new BorshError(
        `need ${bytes} byte(s) for ${what} but only ${this.remaining} remain`,
        this.offset,
      );
    }
  }

  u8(): number {
    this.need(1, "u8");
    return this.data.readUInt8(this.offset++);
  }

  private int(bytes: number, signed: boolean, label: string): number | string {
    this.need(bytes, label);
    const slice = this.data.subarray(this.offset, this.offset + bytes);
    this.offset += bytes;
    if (bytes <= 4) {
      // Fits a JS number exactly; return it as one for readability.
      let value = 0;
      for (let i = bytes - 1; i >= 0; i--) value = value * 256 + slice[i]!;
      if (signed) {
        const max = 2 ** (bytes * 8);
        if (value >= max / 2) value -= max;
      }
      return value;
    }
    // Wider than 32 bits: build a BigInt and hand back a decimal string.
    let value = 0n;
    for (let i = bytes - 1; i >= 0; i--) value = (value << 8n) | BigInt(slice[i]!);
    if (signed) {
      const max = 1n << BigInt(bytes * 8);
      if (value >= max / 2n) value -= max;
    }
    return value.toString();
  }

  bool(): boolean {
    const byte = this.u8();
    if (byte > 1) throw new BorshError(`bool is ${byte}, expected 0 or 1`, this.offset - 1);
    return byte === 1;
  }

  pubkey(): string {
    this.need(32, "pubkey");
    const key = new PublicKey(this.data.subarray(this.offset, this.offset + 32));
    this.offset += 32;
    return key.toBase58();
  }

  string(): string {
    const len = this.int(4, false, "string length") as number;
    this.need(len, "string body");
    const text = this.data.subarray(this.offset, this.offset + len).toString("utf8");
    this.offset += len;
    return text;
  }

  bytes(count: number, what: string): Buffer {
    this.need(count, what);
    const out = this.data.subarray(this.offset, this.offset + count);
    this.offset += count;
    return Buffer.from(out);
  }

  /** Reads one value of `type`, resolving `defined` names against `typeDefs`. */
  read(type: IdlType, typeDefs: readonly IdlTypeDef[], depth = 0): BorshValue {
    // Guards against an IDL whose types reference each other in a cycle.
    if (depth > 32) throw new BorshError("type nesting too deep", this.offset);

    if (typeof type === "string") return this.readPrimitive(type);
    // An IDL shape we didn't anticipate must surface as a BorshError with an
    // offset, never as a TypeError from probing a non-object.
    if (type === null || typeof type !== "object") {
      throw new BorshError(`malformed type ${JSON.stringify(type)} in IDL`, this.offset);
    }

    if ("option" in type) {
      return this.u8() === 0 ? null : this.read(type.option, typeDefs, depth + 1);
    }
    if ("coption" in type) {
      // Rust's COption, as used by SPL Token, tags with 4 bytes rather than 1.
      const tag = this.int(4, false, "coption tag") as number;
      return tag === 0 ? null : this.read(type.coption, typeDefs, depth + 1);
    }
    if ("vec" in type) {
      const len = this.int(4, false, "vec length") as number;
      const out: BorshValue[] = [];
      for (let i = 0; i < len; i++) out.push(this.read(type.vec, typeDefs, depth + 1));
      return out;
    }
    if ("array" in type) {
      const [inner, len] = type.array;
      // A byte array is far more useful as hex than as 32 separate numbers.
      if (inner === "u8") return this.bytes(len, `[u8; ${len}]`).toString("hex");
      const out: BorshValue[] = [];
      for (let i = 0; i < len; i++) out.push(this.read(inner, typeDefs, depth + 1));
      return out;
    }
    if ("defined" in type) {
      const name = typeof type.defined === "string" ? type.defined : type.defined.name;
      const def = typeDefs.find((t) => t.name === name);
      if (!def) throw new BorshError(`IDL has no type named "${name}"`, this.offset);
      return this.readTypeDef(def, typeDefs, depth + 1);
    }
    throw new BorshError(`unsupported type ${JSON.stringify(type)}`, this.offset);
  }

  private readPrimitive(name: string): BorshValue {
    switch (name) {
      case "bool":
        return this.bool();
      case "u8":
        return this.int(1, false, "u8");
      case "i8":
        return this.int(1, true, "i8");
      case "u16":
        return this.int(2, false, "u16");
      case "i16":
        return this.int(2, true, "i16");
      case "u32":
        return this.int(4, false, "u32");
      case "i32":
        return this.int(4, true, "i32");
      case "u64":
        return this.int(8, false, "u64");
      case "i64":
        return this.int(8, true, "i64");
      case "u128":
        return this.int(16, false, "u128");
      case "i128":
        return this.int(16, true, "i128");
      case "f32":
      case "f64":
        // Anchor permits them; nothing in a debug report needs them, and
        // guessing at the encoding would be worse than saying so.
        throw new BorshError(`${name} is not supported`, this.offset);
      case "string":
        return this.string();
      case "publicKey":
      case "pubkey":
        return this.pubkey();
      case "bytes":
        return this.bytes(this.int(4, false, "bytes length") as number, "bytes").toString("hex");
      default:
        throw new BorshError(`unknown primitive type "${name}"`, this.offset);
    }
  }

  private readTypeDef(
    def: IdlTypeDef,
    typeDefs: readonly IdlTypeDef[],
    depth: number,
  ): BorshValue {
    const ty = def.type;
    if (ty.kind === "struct") {
      const fields = ty.fields ?? [];
      // Anchor emits a tuple struct as bare types with no field names, e.g.
      // `{"kind":"struct","fields":["bool"]}`. Decode those positionally.
      if (!isNamedFields(fields)) {
        return (fields as unknown as IdlType[]).map((t) => this.read(t, typeDefs, depth + 1));
      }
      const out: { [key: string]: BorshValue } = {};
      for (const field of fields) {
        out[field.name] = this.read(field.type, typeDefs, depth + 1);
      }
      return out;
    }
    if (ty.kind === "type") {
      if (!ty.alias) throw new BorshError(`type alias "${def.name}" has no target`, this.offset);
      return this.read(ty.alias, typeDefs, depth + 1);
    }
    // enum: a u8 variant index, then that variant's payload.
    const index = this.u8();
    const variant = ty.variants[index];
    if (!variant) {
      throw new BorshError(
        `enum "${def.name}" has no variant ${index} (${ty.variants.length} defined)`,
        this.offset - 1,
      );
    }
    if (!variant.fields?.length) return variant.name;

    if (isNamedFields(variant.fields)) {
      const out: { [key: string]: BorshValue } = {};
      for (const field of variant.fields) {
        out[field.name] = this.read(field.type, typeDefs, depth + 1);
      }
      return { [variant.name]: out };
    }
    // Tuple variant: fields are bare types.
    const tuple = variant.fields as IdlType[];
    return { [variant.name]: tuple.map((t) => this.read(t, typeDefs, depth + 1)) };
  }
}

/**
 * Decodes a named field list, e.g. an instruction's args or a struct's body.
 *
 * Returns what it managed to read plus the failure, rather than throwing: a
 * partially decoded instruction still tells you which instruction it was, and
 * the fields before the break are trustworthy precisely because decoding
 * stopped instead of guessing past the problem.
 */
export function decodeFields(
  data: Buffer,
  fields: readonly IdlField[],
  typeDefs: readonly IdlTypeDef[],
  start = 0,
): { values: { [key: string]: BorshValue }; error: string | null; bytesRead: number } {
  const reader = new BorshReader(data, start);
  const values: { [key: string]: BorshValue } = {};
  for (const field of fields) {
    try {
      values[field.name] = reader.read(field.type, typeDefs);
    } catch (e) {
      return {
        values,
        error: e instanceof BorshError ? e.message : String(e),
        bytesRead: reader.offset - start,
      };
    }
  }
  return { values, error: null, bytesRead: reader.offset - start };
}
