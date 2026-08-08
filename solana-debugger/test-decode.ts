/**
 * test-decode.ts — native instruction decoders and the IDL cache.
 *
 * Usage:
 *   npm run test:decode            # fixtures only, no network
 *   npm run test:decode -- --live  # ...plus every instruction in the corpus
 *
 * The live pass is a coverage check rather than an assertion about specific
 * transactions: it decodes every System/Token/ATA instruction the corpus
 * contains, top-level and inner, and reports any discriminant we don't
 * recognise. That's how a missing variant gets found — real traffic uses
 * instructions a hand-written table forgets.
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { readFileSync } from "node:fs";

import { decodeFields, type IdlField, type IdlTypeDef } from "./lib/borsh.js";
import { CORPUS_PATH, type CorpusFile } from "./lib/corpus.js";
import { normalizeInstructions } from "./lib/decode.js";
import { tryFetchAnchorIdl } from "./lib/errors.js";
import {
  anchorDiscriminator,
  decodeIdlAccount,
  decodeIdlInstruction,
  type AnchorIdl,
} from "./lib/idl-decode.js";
import {
  clearIdlMemoryCache,
  getCachedIdl,
  IDL_CACHE_TTL,
  pruneIdlCache,
} from "./lib/idl-cache.js";
import { decodeNativeIx, formatDecodedIx, isNativeProgram } from "./lib/native-decoders.js";
import {
  ATA_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "./lib/program-errors.js";

let failures = 0;
function check(name: string, ok: boolean, detail?: string) {
  if (!ok) failures++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}${ok || !detail ? "" : ` — ${detail}`}`);
}

/** Builds System instruction data: u32 LE tag then the payload. */
function systemIx(tag: number, payload: Buffer = Buffer.alloc(0)): string {
  const head = Buffer.alloc(4);
  head.writeUInt32LE(tag, 0);
  return Buffer.concat([head, payload]).toString("base64");
}

function u64(value: bigint): Buffer {
  const b = Buffer.alloc(8);
  b.writeBigUInt64LE(value, 0);
  return b;
}

function decoderFixtures() {
  console.log("System");
  {
    const from = PublicKey.default.toBase58();
    const to = new PublicKey(1).toBase58();
    const ix = decodeNativeIx(SYSTEM_PROGRAM_ID, systemIx(2, u64(5_000_000n)), [from, to]);
    check("Transfer decodes", ix?.name === "Transfer");
    check("lamports as a decimal string", ix?.args["lamports"] === "5000000");
    check("labels from/to", ix?.accounts[0]?.role === "from" && ix?.accounts[1]?.role === "to");
    check("account pubkeys preserved", ix?.accounts[0]?.pubkey === from);

    const create = decodeNativeIx(
      SYSTEM_PROGRAM_ID,
      systemIx(0, Buffer.concat([u64(2039280n), u64(165n), new PublicKey(2).toBuffer()])),
      []
    );
    check("CreateAccount decodes", create?.name === "CreateAccount");
    check("CreateAccount space", create?.args["space"] === "165");
    check("CreateAccount owner", create?.args["owner"] === new PublicKey(2).toBase58());

    const nonce = decodeNativeIx(SYSTEM_PROGRAM_ID, systemIx(4), []);
    check("AdvanceNonceAccount decodes", nonce?.name === "AdvanceNonceAccount");

    check("unknown discriminant returns null", decodeNativeIx(SYSTEM_PROGRAM_ID, systemIx(99), []) === null);
    check("empty data returns null", decodeNativeIx(SYSTEM_PROGRAM_ID, "", []) === null);
  }

  console.log("\nSPL Token");
  {
    const transfer = decodeNativeIx(
      TOKEN_PROGRAM_ID,
      Buffer.concat([Buffer.from([3]), u64(1500n)]).toString("base64"),
      ["src", "dst", "owner"]
    );
    check("Transfer decodes", transfer?.name === "Transfer");
    check("amount as a decimal string", transfer?.args["amount"] === "1500");
    check("labels source/destination/owner", transfer?.accounts[1]?.role === "destination");

    const checked = decodeNativeIx(
      TOKEN_PROGRAM_ID,
      Buffer.concat([Buffer.from([12]), u64(99n), Buffer.from([6])]).toString("base64"),
      []
    );
    check("TransferChecked decodes", checked?.name === "TransferChecked");
    check("TransferChecked decimals", checked?.args["decimals"] === 6);

    const sync = decodeNativeIx(TOKEN_PROGRAM_ID, Buffer.from([17]).toString("base64"), ["wsol"]);
    check("SyncNative decodes", sync?.name === "SyncNative");

    const t22 = decodeNativeIx(TOKEN_2022_PROGRAM_ID, Buffer.from([9]).toString("base64"), []);
    check("Token-2022 shares the base set", t22?.name === "CloseAccount");
    check("Token-2022 labelled distinctly", t22?.program === "Token-2022");

    const ext = decodeNativeIx(TOKEN_2022_PROGRAM_ID, Buffer.from([26, 1]).toString("base64"), []);
    check("extension instruction is named but flagged", ext?.name === "TransferFeeExtension" && ext?.truncated === true);

    check("unknown token discriminant is null", decodeNativeIx(TOKEN_PROGRAM_ID, Buffer.from([250]).toString("base64"), []) === null);

    // A u64 beyond Number.MAX_SAFE_INTEGER must survive intact.
    const big = decodeNativeIx(
      TOKEN_PROGRAM_ID,
      Buffer.concat([Buffer.from([3]), u64(18446744073709551615n)]).toString("base64"),
      []
    );
    check("u64 max survives as a string", big?.args["amount"] === "18446744073709551615");
  }

  console.log("\nAssociated Token Account");
  {
    const legacy = decodeNativeIx(ATA_PROGRAM_ID, "", ["funder", "ata", "wallet", "mint"]);
    check("empty data is the legacy Create", legacy?.name === "Create");
    check("labels the ATA roles", legacy?.accounts[1]?.role === "associated token account");
    const idem = decodeNativeIx(ATA_PROGRAM_ID, Buffer.from([1]).toString("base64"), []);
    check("CreateIdempotent decodes", idem?.name === "CreateIdempotent");
  }

  console.log("\nnon-native programs");
  {
    check("unknown program returns null", decodeNativeIx("SomeOtherProgram1111111111111111111111111", "AQID", []) === null);
    check("isNativeProgram agrees", isNativeProgram(TOKEN_PROGRAM_ID) && !isNativeProgram("Whirl"));
    const ix = decodeNativeIx(SYSTEM_PROGRAM_ID, systemIx(2, u64(1n)), []);
    check("formats one line", ix !== null && formatDecodedIx(ix).includes("System Transfer"));
  }
}

async function cacheFixtures() {
  console.log("\nIDL cache");
  // Synthetic ids so this never collides with a real cached IDL.
  const withIdl = "TESTidlPresent1111111111111111111111111111";
  const withoutIdl = "TESTidlAbsent11111111111111111111111111111";
  const conn = null as unknown as Connection; // the fetcher never uses it

  let calls = 0;
  const fetcher = async (_c: Connection, programId: string) => {
    calls++;
    return programId === withIdl ? { errors: [{ code: 6000, name: "Mine" }] } : null;
  };

  pruneIdlCache();
  const t0 = 1_000_000;

  const a = await getCachedIdl(conn, withIdl, fetcher, t0);
  check("fetches on a cold cache", calls === 1 && a !== null);

  await getCachedIdl(conn, withIdl, fetcher, t0 + 1000);
  check("second lookup is cached", calls === 1);

  await getCachedIdl(conn, withoutIdl, fetcher, t0);
  check("a miss also costs one fetch", calls === 2);
  const negative = await getCachedIdl(conn, withoutIdl, fetcher, t0 + 1000);
  check("the miss is cached — the whole point", calls === 2 && negative === null);

  // Misses expire quickly: a program can publish an IDL at any time.
  await getCachedIdl(conn, withoutIdl, fetcher, t0 + IDL_CACHE_TTL.miss + 1);
  check("a stale miss is refetched", calls === 3);

  // Hits are held far longer than misses.
  await getCachedIdl(conn, withIdl, fetcher, t0 + IDL_CACHE_TTL.miss + 1);
  check("a hit outlives the miss TTL", calls === 3);
  await getCachedIdl(conn, withIdl, fetcher, t0 + IDL_CACHE_TTL.hit + 1);
  check("a hit does eventually expire", calls === 4);

  // Survives process restart: that's why it's on disk at all.
  clearIdlMemoryCache();
  const fromDisk = await getCachedIdl(conn, withIdl, fetcher, t0 + IDL_CACHE_TTL.hit + 2);
  check("served from disk after memory is cleared", calls === 4 && fromDisk !== null);

  check("prune clears the cache", pruneIdlCache() > 0);
  await getCachedIdl(conn, withIdl, fetcher, t0 + IDL_CACHE_TTL.hit + 3);
  check("refetches after a prune", calls === 5);
  pruneIdlCache();
}

async function live() {
  const rpc = process.env.RPC_URL;
  if (!rpc) {
    console.log("\n(skipping live checks — RPC_URL not set)");
    return;
  }
  const corpus: CorpusFile = JSON.parse(readFileSync(CORPUS_PATH, "utf8"));
  const connection = new Connection(rpc, "confirmed");
  console.log(`\nlive: decoding native instructions across ${corpus.entries.length} transactions`);

  let seen = 0;
  let decoded = 0;
  const unknown = new Map<string, number>();
  const names = new Map<string, number>();

  for (const entry of corpus.entries) {
    const tx = await connection.getTransaction(entry.signature, {
      maxSupportedTransactionVersion: 0,
    });
    const meta = tx?.meta;
    if (!meta) continue;
    const keys = tx!.transaction.message.getAccountKeys({
      accountKeysFromLookups: meta.loadedAddresses || null,
    });

    type Candidate = { programId: string; data: string; accounts: string[] };
    const candidates: Candidate[] = normalizeInstructions(tx!).map((ix) => ({
      programId: ix.programId,
      data: ix.dataBase64,
      accounts: ix.accounts.map((a) => a.pubkey),
    }));

    // Inner instructions are where most Token traffic actually lives.
    for (const inner of meta.innerInstructions ?? []) {
      for (const ix of inner.instructions) {
        const programId = keys.get(ix.programIdIndex)?.toBase58();
        if (!programId) continue;
        candidates.push({
          programId,
          data: Buffer.from(
            (await import("bs58")).default.decode((ix as { data: string }).data)
          ).toString("base64"),
          accounts: ((ix as { accounts: number[] }).accounts ?? []).map(
            (i) => keys.get(i)?.toBase58() ?? `<${i}>`
          ),
        });
      }
    }

    for (const c of candidates) {
      if (!isNativeProgram(c.programId)) continue;
      seen++;
      const result = decodeNativeIx(c.programId, c.data, c.accounts);
      if (result) {
        decoded++;
        names.set(result.name, (names.get(result.name) ?? 0) + 1);
      } else {
        const tag = Buffer.from(c.data, "base64")[0] ?? -1;
        const key = `${c.programId.slice(0, 8)} tag=${tag}`;
        unknown.set(key, (unknown.get(key) ?? 0) + 1);
      }
    }
  }

  // IDL path: real published IDLs are the only honest test of discriminator
  // derivation and the borsh reader against types we didn't choose.
  console.log("\nlive: IDL-decoding non-native instructions");
  const programs = new Set<string>();
  for (const entry of corpus.entries) programs.add(entry.program);

  let withIdl = 0;
  let idlMatched = 0;
  let idlAttempted = 0;
  const borshErrors: string[] = [];

  for (const entry of corpus.entries) {
    const tx = await connection.getTransaction(entry.signature, {
      maxSupportedTransactionVersion: 0,
    });
    if (!tx?.meta) continue;
    for (const ix of normalizeInstructions(tx)) {
      if (isNativeProgram(ix.programId)) continue;
      const idl = (await getCachedIdl(
        connection,
        ix.programId,
        tryFetchAnchorIdl
      )) as AnchorIdl | null;
      if (!idl) continue;
      idlAttempted++;
      const result = decodeIdlInstruction(
        idl,
        ix.programId,
        ix.dataBase64,
        ix.accounts.map((a) => a.pubkey)
      );
      if (result) {
        idlMatched++;
        if (result.error) borshErrors.push(`${result.name}: ${result.error}`);
      }
    }
  }
  for (const p of programs) {
    const idl = (await getCachedIdl(connection, p, tryFetchAnchorIdl)) as AnchorIdl | null;
    if (idl) withIdl++;
  }

  console.log(`  ${withIdl}/${programs.size} corpus programs publish an on-chain IDL`);
  console.log(`  ${idlMatched}/${idlAttempted} instructions matched an IDL discriminator`);
  if (borshErrors.length) {
    console.log("  partial decodes:");
    for (const e of new Set(borshErrors)) console.log(`    ${e}`);
  }
  check("at least one corpus program has a usable IDL", withIdl > 0, `${withIdl} found`);
  check(
    "IDL instructions decode without borsh errors",
    borshErrors.length === 0,
    `${borshErrors.length} partial`
  );

  console.log(`\n  ${decoded}/${seen} native instructions decoded`);
  const top = [...names.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log(`  most common: ${top.map(([n, c]) => `${n}×${c}`).join(", ")}`);
  if (unknown.size) {
    console.log("  unrecognised discriminants:");
    for (const [k, c] of unknown) console.log(`    ${k} ×${c}`);
  }
  check("every native instruction in the corpus decodes", unknown.size === 0);
  check("the corpus actually exercises the decoders", seen > 0, `saw ${seen}`);
}

function borshFixtures() {
  console.log("\nborsh reader");
  const types: IdlTypeDef[] = [
    {
      name: "Inner",
      type: { kind: "struct", fields: [{ name: "flag", type: "bool" }] },
    },
    {
      name: "Side",
      type: { kind: "enum", variants: [{ name: "Bid" }, { name: "Ask" }] },
    },
  ];

  // u64 max, i32 negative, bool, pubkey, string, option(none), vec<u16>, [u8;4]
  const buf = Buffer.concat([
    Buffer.from("ffffffffffffffff", "hex"), // u64 max
    (() => { const b = Buffer.alloc(4); b.writeInt32LE(-7); return b; })(),
    Buffer.from([1]), // bool true
    PublicKey.default.toBuffer(),
    (() => {
      const s = Buffer.from("hey", "utf8");
      const l = Buffer.alloc(4); l.writeUInt32LE(s.length);
      return Buffer.concat([l, s]);
    })(),
    Buffer.from([0]), // option none
    (() => {
      const l = Buffer.alloc(4); l.writeUInt32LE(2);
      return Buffer.concat([l, Buffer.from([1, 0, 2, 0])]);
    })(),
    Buffer.from([0xde, 0xad, 0xbe, 0xef]),
    Buffer.from([1]), // enum variant 1
    Buffer.from([1]), // Inner.flag
  ]);

  const fields: IdlField[] = [
    { name: "big", type: "u64" },
    { name: "neg", type: "i32" },
    { name: "flag", type: "bool" },
    { name: "key", type: "pubkey" },
    { name: "label", type: "string" },
    { name: "maybe", type: { option: "u64" } },
    { name: "list", type: { vec: "u16" } },
    { name: "raw", type: { array: ["u8", 4] } },
    { name: "side", type: { defined: "Side" } },
    { name: "inner", type: { defined: { name: "Inner" } } },
  ];

  const { values, error, bytesRead } = decodeFields(buf, fields, types);
  check("decodes without error", error === null, error ?? undefined);
  check("u64 max as a decimal string", values["big"] === "18446744073709551615");
  check("signed i32", values["neg"] === -7);
  check("bool", values["flag"] === true);
  check("pubkey as base58", values["key"] === PublicKey.default.toBase58());
  check("string", values["label"] === "hey");
  check("option none is null", values["maybe"] === null);
  check("vec<u16>", JSON.stringify(values["list"]) === "[1,2]");
  check("byte array as hex", values["raw"] === "deadbeef");
  check("unit enum variant by name", values["side"] === "Ask");
  check("nested defined struct", JSON.stringify(values["inner"]) === '{"flag":true}');
  check("consumed the whole buffer", bytesRead === buf.length);

  // Failure must stop, not skip — a misaligned field poisons everything after.
  const short = decodeFields(Buffer.from([1, 2]), [
    { name: "a", type: "u8" },
    { name: "b", type: "u64" },
  ], []);
  check("stops at a truncated field", short.error !== null);
  check("keeps the fields read before the break", short.values["a"] === 1);
  check("does not invent the unread field", !("b" in short.values));

  const unknown = decodeFields(Buffer.alloc(8), [{ name: "x", type: "quaternion" }], []);
  check("refuses an unknown type", unknown.error?.includes("unknown primitive") === true);

  const badEnum = decodeFields(Buffer.from([9]), [{ name: "s", type: { defined: "Side" } }], types);
  check("refuses an out-of-range enum variant", badEnum.error?.includes("no variant 9") === true);

  // A tuple struct: Anchor reuses `fields` for bare types with no names. Read
  // as a named struct this decodes garbage — pump.fun's OptionBool is exactly
  // this shape and it broke the live run.
  const tupleTypes: IdlTypeDef[] = [
    { name: "OptionBool", type: { kind: "struct", fields: ["bool"] as never } },
  ];
  const tuple = decodeFields(
    Buffer.from([1]),
    [{ name: "trackVolume", type: { defined: { name: "OptionBool" } } }],
    tupleTypes
  );
  check("decodes a tuple struct positionally", tuple.error === null, tuple.error ?? undefined);
  check("tuple struct value", JSON.stringify(tuple.values["trackVolume"]) === "[true]");

  // Whatever an IDL contains, the reader must fail as a BorshError with an
  // offset — never a raw TypeError from probing a malformed type.
  const malformed = decodeFields(Buffer.alloc(4), [{ name: "x", type: undefined as never }], []);
  check("malformed type fails cleanly", malformed.error?.includes("malformed type") === true);
}

function idlFixtures() {
  console.log("\nIDL instruction and account decoding");

  // Legacy shape: camelCase names, no discriminators, inline account layout.
  const legacy: AnchorIdl = {
    name: "my_program",
    instructions: [
      {
        name: "initializeMint",
        args: [{ name: "decimals", type: "u8" }],
        accounts: [{ name: "mint" }, { name: "payer" }],
      },
    ],
    accounts: [
      {
        name: "Pool",
        type: { kind: "struct", fields: [{ name: "liquidity", type: "u64" }] },
      },
    ],
  };

  // Anchor hashes the snake_case form of the instruction name.
  const disc = anchorDiscriminator("global", "initialize_mint");
  const ixData = Buffer.concat([disc, Buffer.from([9])]).toString("base64");
  const decoded = decodeIdlInstruction(legacy, "Prog", ixData, ["mintKey", "payerKey"]);
  check("matches a legacy discriminator", decoded?.name === "initializeMint");
  check("decodes the arg", decoded?.args["decimals"] === 9);
  check("labels accounts from the IDL", decoded?.accounts[0]?.role === "mint");
  check("uses the IDL's program name", decoded?.program === "my_program");

  const accData = Buffer.concat([
    anchorDiscriminator("account", "Pool"),
    (() => { const b = Buffer.alloc(8); b.writeBigUInt64LE(1234n); return b; })(),
  ]);
  const acc = decodeIdlAccount(legacy, "Prog", accData);
  check("matches a legacy account discriminator", acc?.name === "Pool");
  check("decodes the account field", acc?.fields["liquidity"] === "1234");

  // 0.30+ shape: explicit discriminators, layout in `types`, {defined:{name}}.
  const modern: AnchorIdl = {
    metadata: { name: "new_program" },
    instructions: [
      { name: "swap", discriminator: [1, 2, 3, 4, 5, 6, 7, 8], args: [{ name: "amount", type: "u64" }] },
    ],
    accounts: [{ name: "Whirlpool", discriminator: [9, 9, 9, 9, 9, 9, 9, 9] }],
    types: [
      {
        name: "Whirlpool",
        type: { kind: "struct", fields: [{ name: "tickSpacing", type: "u16" }] },
      },
    ],
  };
  const modernIx = Buffer.concat([
    Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]),
    (() => { const b = Buffer.alloc(8); b.writeBigUInt64LE(500n); return b; })(),
  ]).toString("base64");
  const m = decodeIdlInstruction(modern, "Prog", modernIx, []);
  check("uses an explicit discriminator", m?.name === "swap");
  check("decodes its arg", m?.args["amount"] === "500");
  check("prefers metadata.name", m?.program === "new_program");

  const modernAcc = decodeIdlAccount(
    modern,
    "Prog",
    Buffer.concat([Buffer.from([9, 9, 9, 9, 9, 9, 9, 9]), Buffer.from([64, 0])])
  );
  check("finds the layout in types", modernAcc?.name === "Whirlpool");
  check("decodes it", modernAcc?.fields["tickSpacing"] === 64);

  check("unknown discriminator returns null", decodeIdlInstruction(legacy, "Prog", Buffer.alloc(16).toString("base64"), []) === null);
  check("data shorter than a discriminator returns null", decodeIdlInstruction(legacy, "Prog", "AAA=", []) === null);
}

async function main() {
  decoderFixtures();
  borshFixtures();
  idlFixtures();
  await cacheFixtures();
  if (process.argv.includes("--live")) await live();
  console.log(failures === 0 ? "\nall checks passed" : `\n${failures} check(s) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
