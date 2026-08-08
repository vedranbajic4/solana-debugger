/**
 * test-errors.ts — runtime error tables and the field-level account diff.
 *
 * Usage:
 *   npm run test:errors            # fixtures
 *   npm run test:errors -- --live  # ...plus every corpus error, explained
 *
 * The live pass answers the question the tables exist for: of the errors the
 * corpus actually contains, how many can we explain? A table that covers the
 * enum but misses what real transactions hit would look complete and be
 * useless.
 */

import { Connection } from "@solana/web3.js";
import { readFileSync } from "node:fs";

import { CORPUS_PATH, type CorpusFile } from "./lib/corpus.js";
import { diffAccountFields, formatFieldDiff } from "./lib/field-diff.js";
import type { AnchorIdl } from "./lib/idl-decode.js";
import { anchorDiscriminator } from "./lib/idl-decode.js";
import { buildDebugReport, headline } from "./lib/report.js";
import {
  explainRuntimeError,
  INSTRUCTION_ERRORS,
  TRANSACTION_ERRORS,
} from "./lib/runtime-errors.js";

let failures = 0;
function check(name: string, ok: boolean, detail?: string) {
  if (!ok) failures++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}${ok || !detail ? "" : ` — ${detail}`}`);
}

function errorFixtures() {
  console.log("runtime error explanations");

  const bare = explainRuntimeError("ProgramFailedToComplete", "instruction");
  check("explains a bare instruction error", bare?.info?.meaning.includes("aborted") === true);
  check("carries a practical cause", (bare?.info?.cause ?? "").includes("panic"));
  check("no payload for a bare string", bare?.payload === null);

  const payload = explainRuntimeError({ DuplicateInstruction: 3 }, "transaction");
  check("handles the object form", payload?.name === "DuplicateInstruction");
  check("keeps the payload", payload?.payload === 3);

  const tx = explainRuntimeError("BlockhashNotFound", "transaction");
  check("explains a transaction error", tx?.info !== null);
  check(
    "points at the durable-nonce trap",
    (tx?.info?.cause ?? "").includes("durable-nonce")
  );

  check(
    "unknown identifier returns the name with no info",
    explainRuntimeError("NotARealError", "instruction")?.info === null
  );
  check("null for a non-error shape", explainRuntimeError(42, "instruction") === null);
  check(
    "Custom is not in the instruction table",
    !("Custom" in INSTRUCTION_ERRORS),
    "resolveCustomError owns those"
  );

  // Every entry should say something beyond restating its own name.
  const lazy: string[] = [];
  for (const [name, info] of Object.entries({ ...TRANSACTION_ERRORS, ...INSTRUCTION_ERRORS })) {
    const squashed = info.meaning.toLowerCase().replace(/[^a-z]/g, "");
    if (squashed === name.toLowerCase() || info.meaning.length < 15) lazy.push(name);
  }
  check("no entry merely restates its name", lazy.length === 0, lazy.join(", "));
  console.log(
    `  (${Object.keys(TRANSACTION_ERRORS).length} transaction + ` +
      `${Object.keys(INSTRUCTION_ERRORS).length} instruction entries, ` +
      `${Object.values({ ...TRANSACTION_ERRORS, ...INSTRUCTION_ERRORS }).filter((i) => i.cause).length} with a cause)`
  );
}

function fieldDiffFixtures() {
  console.log("\nfield-level account diff");

  const idl: AnchorIdl = {
    name: "pool_program",
    accounts: [
      {
        name: "Pool",
        type: {
          kind: "struct",
          fields: [
            { name: "liquidity", type: "u64" },
            { name: "tickCurrent", type: "i32" },
            { name: "authority", type: "pubkey" },
          ],
        },
      },
    ],
  };

  const disc = anchorDiscriminator("account", "Pool");
  const build = (liquidity: bigint, tick: number) => {
    const b = Buffer.alloc(8 + 4 + 32);
    b.writeBigUInt64LE(liquidity, 0);
    b.writeInt32LE(tick, 8);
    return Buffer.concat([disc, b]);
  };

  const pre = build(1_000_000n, 100);
  const post = build(1_500_000n, 100);
  const diff = diffAccountFields(idl, "Prog", pre, post, 8);

  check("names the account type", diff?.accountType === "Pool");
  check("reports exactly the changed field", diff?.changes.length === 1);
  check("field path", diff?.changes[0]?.path === "liquidity");
  check("values as decoded", diff?.changes[0]?.pre === "1000000" && diff?.changes[0]?.post === "1500000");
  check("signed delta for numerics", diff?.changes[0]?.delta === "500000");
  check("no caveat when it adds up", diff?.caveat === undefined);

  const negative = diffAccountFields(idl, "Prog", post, pre, 8);
  check("negative delta", negative?.changes[0]?.delta === "-500000");

  const unchanged = diffAccountFields(idl, "Prog", pre, pre, 0);
  check("no changes when nothing moved", unchanged?.changes.length === 0);

  // The honesty check: bytes moved but the layout claims nothing did. That
  // means the layout is wrong, and hiding it would be the worst outcome.
  const wrongLayout = diffAccountFields(idl, "Prog", pre, pre, 42);
  check(
    "flags bytes-changed-but-no-field",
    wrongLayout?.caveat?.includes("may not match") === true,
    wrongLayout?.caveat
  );

  check("null without an IDL", diffAccountFields(null, "Prog", pre, post, 8) === null);
  check(
    "null when the discriminator is unknown",
    diffAccountFields(idl, "Prog", Buffer.alloc(44), Buffer.alloc(44), 8) === null
  );

  // A reinitialized account is a different struct on each side; diffing field
  // by field would be nonsense.
  const other: AnchorIdl = {
    accounts: [
      { name: "Pool", type: { kind: "struct", fields: [{ name: "liquidity", type: "u64" }] } },
      { name: "Vault", type: { kind: "struct", fields: [{ name: "balance", type: "u64" }] } },
    ],
  };
  const vault = Buffer.concat([anchorDiscriminator("account", "Vault"), Buffer.alloc(8)]);
  const pool = Buffer.concat([anchorDiscriminator("account", "Pool"), Buffer.alloc(8)]);
  check("null when the struct type changed", diffAccountFields(other, "Prog", pool, vault, 8) === null);

  const lines = formatFieldDiff(diff!);
  check("renders the type and the change", lines[0]?.includes("Pool") === true && lines[1]?.includes("liquidity") === true);
}

async function live() {
  const rpc = process.env.RPC_URL;
  if (!rpc) {
    console.log("\n(skipping live checks — RPC_URL not set)");
    return;
  }
  const corpus: CorpusFile = JSON.parse(readFileSync(CORPUS_PATH, "utf8"));
  const connection = new Connection(rpc, "confirmed");
  console.log(`\nlive: explaining the errors in ${corpus.entries.length} corpus transactions`);

  let failed = 0;
  let custom = 0;
  let explained = 0;
  const unexplained: string[] = [];

  for (const entry of corpus.entries) {
    const tx = await connection.getTransaction(entry.signature, {
      maxSupportedTransactionVersion: 0,
    });
    if (!tx?.meta) continue;
    const report = await buildDebugReport(entry.signature, tx, connection);
    if (report.outcome !== "failed") continue;
    failed++;

    const e = report.error!;
    if (e.customCode !== null) {
      custom++;
      continue;
    }
    if (e.runtimeExplanation) explained++;
    else unexplained.push(e.runtimeError ?? JSON.stringify(e.raw).slice(0, 60));

    console.log(`  ${headline(report).slice(0, 118)}`);
  }

  const nonCustom = failed - custom;
  console.log(
    `\n  ${failed} failed: ${custom} custom program errors, ${nonCustom} runtime errors`
  );
  if (unexplained.length) {
    console.log(`  missing entries: ${[...new Set(unexplained)].join(", ")}`);
  }
  check(
    "every non-custom corpus error is explained",
    unexplained.length === 0,
    unexplained.join(", ")
  );
  if (nonCustom === 0) {
    console.log(
      "  note: the corpus selects for token movement and CPIs, which skews it to " +
        "custom program errors — so the block scan below is what actually exercises these tables"
    );
  }

  // The corpus can't be relied on for runtime-error coverage, so sample raw
  // blocks: whatever mainnet is producing right now is the real requirement.
  console.log("\nlive: runtime errors in recent mainnet blocks");
  const tip = await connection.getSlot("confirmed");
  const seen = new Map<string, number>();
  for (let i = 0; i < 3; i++) {
    const block = await connection.getBlock(tip - 40 - i * 31, {
      maxSupportedTransactionVersion: 0,
      transactionDetails: "full",
      rewards: false,
    });
    if (!block) continue;
    for (const t of block.transactions) {
      const err = t.meta?.err as Record<string, unknown> | string | null;
      if (!err) continue;
      const isIx = typeof err === "object" && "InstructionError" in err;
      const detail = isIx ? (err["InstructionError"] as [number, unknown])[1] : err;
      // Custom codes belong to resolveCustomError, not these tables.
      if (typeof detail === "object" && detail !== null && "Custom" in detail) continue;
      const explanation = explainRuntimeError(detail, isIx ? "instruction" : "transaction");
      if (!explanation) continue;
      const key = `${isIx ? "ix" : "tx"}:${explanation.name}:${explanation.info ? "ok" : "MISSING"}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
  }

  const missing: string[] = [];
  for (const [key, count] of [...seen.entries()].sort((a, b) => b[1] - a[1])) {
    const [kind, name, status] = key.split(":");
    if (status === "MISSING") missing.push(`${kind}:${name}`);
    console.log(`  ${String(count).padStart(4)}  ${kind}  ${name}${status === "MISSING" ? "   <-- no table entry" : ""}`);
  }
  if (seen.size === 0) console.log("  (no non-custom runtime errors in the sampled blocks)");
  check(
    "every runtime error mainnet produced has a table entry",
    missing.length === 0,
    missing.join(", ")
  );
}

async function main() {
  errorFixtures();
  fieldDiffFixtures();
  if (process.argv.includes("--live")) await live();
  console.log(failures === 0 ? "\nall checks passed" : `\n${failures} check(s) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
