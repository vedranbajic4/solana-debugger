/**
 * Sends the PoC transactions and records the signatures of the ones that fail.
 *
 * Every failing transaction is sent with `skipPreflight: true` on purpose. With
 * preflight on, the RPC node simulates first, rejects the transaction locally
 * and never puts it in a block -- so there is no signature to look up and
 * nothing for the debugger to fetch. Skipping preflight lands the failure on
 * the ledger where it can be replayed.
 *
 * Usage:
 *   node send.mjs all
 *   node send.mjs arith-overflow
 */

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RPC = process.env.RPC ?? "http://127.0.0.1:8899";
const KEYPAIR_PATH = process.env.KEYPAIR ?? path.join(os.homedir(), ".config/solana/id.json");

const IDS_PATH = path.join(HERE, "..", "program-ids.json");
if (!fs.existsSync(IDS_PATH)) {
  console.error("error: program-ids.json not found -- run ../deploy.sh first");
  process.exit(1);
}
const PROGRAM_IDS = JSON.parse(fs.readFileSync(IDS_PATH, "utf8"));

const connection = new Connection(RPC, "confirmed");
const payer = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync(KEYPAIR_PATH, "utf8"))),
);

function programId(name) {
  const id = PROGRAM_IDS[name];
  if (!id) throw new Error(`${name} is not in program-ids.json -- was it deployed?`);
  return new PublicKey(id);
}

function u64le(value) {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(BigInt(value));
  return buf;
}

/**
 * Sends one transaction and reports what the runtime did with it.
 * Returns { signature, failed, err, logs, units }.
 */
async function send(label, instructions, signers = []) {
  const tx = new Transaction().add(...instructions);
  tx.feePayer = payer.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
  tx.sign(payer, ...signers);

  const signature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: true,
  });

  const bh = await connection.getLatestBlockhash("confirmed");
  await connection.confirmTransaction(
    { signature, blockhash: bh.blockhash, lastValidBlockHeight: bh.lastValidBlockHeight },
    "confirmed",
  );

  const detail = await connection.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });

  const err = detail?.meta?.err ?? null;
  const logs = detail?.meta?.logMessages ?? [];
  const units = detail?.meta?.computeUnitsConsumed ?? 0;

  console.log(`  ${err ? "FAILED " : "ok     "} ${label}`);
  console.log(`    signature: ${signature}`);
  if (err) console.log(`    error:     ${JSON.stringify(err)}`);
  console.log(`    CU:        ${units}`);
  for (const line of logs.slice(-4)) console.log(`    | ${line}`);

  return { label, signature, failed: Boolean(err), err, logs, units };
}

const POCS = {
  /** Two transactions: one that succeeds, one that overflows. */
  "arith-overflow": async () => {
    const pid = programId("poc_arith_overflow");
    const vault = Keypair.generate();
    const rent = await connection.getMinimumBalanceForRentExemption(8);

    const results = [];

    // The vault must be owned by the program, so the program (not the client)
    // is the only thing that can write the balance.
    results.push(
      await send(
        "arith-overflow: create vault",
        [
          SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: vault.publicKey,
            lamports: rent,
            space: 8,
            programId: pid,
          }),
        ],
        [vault],
      ),
    );

    // Balance one below u64::MAX. This transaction succeeds.
    results.push(
      await send("arith-overflow: set balance to u64::MAX - 1", [
        new TransactionInstruction({
          programId: pid,
          keys: [{ pubkey: vault.publicKey, isSigner: false, isWritable: true }],
          data: Buffer.concat([Buffer.from([0x00]), u64le(2n ** 64n - 2n)]),
        }),
      ]),
    );

    // Depositing 1000 on top of that overflows -> panic.
    results.push(
      await send("arith-overflow: deposit 1000 (overflow panic)", [
        new TransactionInstruction({
          programId: pid,
          keys: [{ pubkey: vault.publicKey, isSigner: false, isWritable: true }],
          data: Buffer.concat([Buffer.from([0x01]), u64le(1000)]),
        }),
      ]),
    );

    return results;
  },

  /** Tier level 9 against a 4-entry table. */
  "index-oob": async () => [
    await send("index-oob: tier level 9 (index out of bounds)", [
      new TransactionInstruction({
        programId: programId("poc_index_oob"),
        keys: [],
        data: Buffer.from([0x09]),
      }),
    ]),
  ],

  /** Route 255 is not in the table, so lookup returns None. */
  "unwrap-none": async () => [
    await send("unwrap-none: route 255 (unwrap on None)", [
      new TransactionInstruction({
        programId: programId("poc_unwrap_none"),
        keys: [],
        data: Buffer.from([0xff]),
      }),
    ]),
  ],

  /** Legs [1,2,3,4] net to 0 but sum to 10. */
  "assert-invariant": async () => [
    await send("assert-invariant: legs [1,2,3,4] (conservation assert)", [
      new TransactionInstruction({
        programId: programId("poc_assert_invariant"),
        keys: [],
        data: Buffer.from([0x01, 0x02, 0x03, 0x04]),
      }),
    ]),
  ],

  /** The authority is passed as a plain read-only account, not a signer. */
  "missing-signer": async () => {
    const pid = programId("poc_missing_signer");
    const vault = Keypair.generate();
    const authority = Keypair.generate();
    return [
      await send("missing-signer: authority not a signer (Custom(1))", [
        new TransactionInstruction({
          programId: pid,
          keys: [
            { pubkey: vault.publicKey, isSigner: false, isWritable: true },
            { pubkey: authority.publicKey, isSigner: false, isWritable: false },
          ],
          data: Buffer.from([0x00]),
        }),
      ]),
    ];
  },

  /** 40000 rounds is comfortably past the 200k CU default. */
  "compute-exhaust": async () => {
    const rounds = Buffer.alloc(4);
    rounds.writeUInt32LE(40000);
    return [
      await send("compute-exhaust: 40000 rounds (CU meter exhausted)", [
        new TransactionInstruction({
          programId: programId("poc_compute_exhaust"),
          keys: [],
          data: rounds,
        }),
      ]),
    ];
  },
};

const arg = process.argv[2] ?? "all";
const names = arg === "all" ? Object.keys(POCS) : [arg];

for (const name of names) {
  if (!POCS[name]) {
    console.error(`error: unknown poc "${name}". Known: ${Object.keys(POCS).join(", ")}, all`);
    process.exit(1);
  }
}

console.log(`RPC:   ${RPC}`);
console.log(`Payer: ${payer.publicKey.toBase58()}\n`);

const all = [];
for (const name of names) {
  console.log(`== ${name}`);
  all.push(...(await POCS[name]()));
  console.log("");
}

const failed = all.filter((r) => r.failed);
const outPath = path.join(HERE, "..", "signatures.json");
fs.writeFileSync(
  outPath,
  JSON.stringify(
    all.map(({ label, signature, failed, err }) => ({ label, signature, failed, err })),
    null,
    2,
  ),
);

console.log(`${failed.length} of ${all.length} transactions failed, as intended.`);
console.log(`Signatures written to ${outPath}\n`);
console.log("Trace one with:");
if (failed.length) console.log(`  make tracer TX=${failed[0].signature}`);
