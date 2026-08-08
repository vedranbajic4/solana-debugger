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

import { CORPUS_PATH, type CorpusFile } from "./lib/corpus.js";
import { normalizeInstructions } from "./lib/decode.js";
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

  console.log(`  ${decoded}/${seen} native instructions decoded`);
  const top = [...names.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log(`  most common: ${top.map(([n, c]) => `${n}×${c}`).join(", ")}`);
  if (unknown.size) {
    console.log("  unrecognised discriminants:");
    for (const [k, c] of unknown) console.log(`    ${k} ×${c}`);
  }
  check("every native instruction in the corpus decodes", unknown.size === 0);
  check("the corpus actually exercises the decoders", seen > 0, `saw ${seen}`);
}

async function main() {
  decoderFixtures();
  await cacheFixtures();
  if (process.argv.includes("--live")) await live();
  console.log(failures === 0 ? "\nall checks passed" : `\n${failures} check(s) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
