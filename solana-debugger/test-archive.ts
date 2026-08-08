/**
 * test-archive.ts — exercises lib/archive.ts against a mock archive endpoint.
 *
 * Usage:
 *   npm run test:archive        # needs a local surfnet running
 *
 * Why a mock: historical account state comes from a paid provider extension
 * (Alchemy's Account Archive), so without a key the entire inject path would be
 * code that has never run. The mock speaks the same protocol — including
 * rejecting `slot` together with `minContextSlot`, which is what `probeArchive`
 * uses to tell a real archive from an endpoint that ignores the parameter.
 *
 * The injection checks run against a real mainnet account so the test exercises
 * the same path a replay does; it restores whatever it changed before exiting.
 * (`surfnet_setAccount` can also create accounts outright — an early reading of
 * this test claimed otherwise, but that was a transient RPC failure surfacing
 * as `AccountNotFound`. The ghost-account check below pins the real behaviour.)
 */

import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import type { AccountInfo } from "@solana/web3.js";
import { createServer, type Server } from "node:http";

import {
  fetchAccountsBeforeSlot,
  injectHistoricalState,
  probeArchive,
  type ArchivedAccount,
} from "./lib/archive.js";

const SURFNET_RPC = process.env.SURFNET_RPC ?? "http://127.0.0.1:8899";
const SLOT = 437995715;

let failures = 0;
function check(name: string, ok: boolean, detail?: string) {
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}${ok || !detail ? "" : ` — ${detail}`}`);
  if (!ok) failures++;
}

/** A `getAccountInfo` result in the shape a real endpoint returns. */
function accountValue(account: { lamports: number; owner: string; data: Buffer; executable: boolean }) {
  return {
    lamports: account.lamports,
    owner: account.owner,
    data: [account.data.toString("base64"), "base64"],
    executable: account.executable,
    rentEpoch: 0,
    space: account.data.length,
  };
}

/**
 * Stands in for an archive RPC. `accounts` maps address -> the state it should
 * report as of `lastUpdateBeforeSlot`; an address mapped to null is reported as
 * not existing yet, and an unknown address gets a plain present-day-ish answer.
 */
function startMockArchive(
  accounts: Map<string, ReturnType<typeof accountValue> | null>
): Promise<{ url: string; server: Server }> {
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const parsed = JSON.parse(body);
      const one = (r: { id?: number; params?: unknown[] }) => {
        const [pubkey, config] = (r.params ?? []) as [string, Record<string, unknown>];
        // A real archive rejects these as mutually exclusive.
        if (config?.["slot"] !== undefined && config?.["minContextSlot"] !== undefined) {
          return {
            jsonrpc: "2.0",
            id: r.id,
            error: { code: -32602, message: "slot and minContextSlot are mutually exclusive" },
          };
        }
        return {
          jsonrpc: "2.0",
          id: r.id,
          result: { context: { slot: SLOT }, value: accounts.get(pubkey) ?? null },
        };
      };
      const out = Array.isArray(parsed) ? parsed.map(one) : one(parsed);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(out));
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      resolve({ url: `http://127.0.0.1:${port}`, server });
    });
  });
}

async function main() {
  const surfnet = new Connection(SURFNET_RPC, "confirmed");

  // A real, non-executable mainnet account: the target has to exist on mainnet
  // for surfnet to accept a write to it. This one is a token account the corpus
  // replays already seed, so the test isn't touching anything they don't.
  const withData = "JCphLZQaFoDrkbtBcUnnbuJwjpSTg2yvHzUWtY95xrKk";
  const original = await readAccount(surfnet, withData);
  if (!original) {
    console.error(`test account ${withData} is not on the fork — cannot run injection checks`);
    process.exit(1);
  }

  // Distinctive historical data we can recognise once it's on the fork. Keep it
  // the same length as the real account so restoring is exact.
  const payload = Buffer.from(original.data);
  payload.write("HISTORICAL", 0, "utf8");
  const historicalOwner = original.owner.toBase58();

  const doesNotExistAnywhere = Keypair.generate().publicKey.toBase58();
  const programAccount = Keypair.generate().publicKey.toBase58();

  const accounts = new Map<string, ReturnType<typeof accountValue> | null>([
    [withData, accountValue({ lamports: 123456789, owner: historicalOwner, data: payload, executable: false })],
    [doesNotExistAnywhere, null],
    [programAccount, accountValue({ lamports: 1, owner: historicalOwner, data: Buffer.alloc(4), executable: true })],
  ]);

  const { url, server } = await startMockArchive(accounts);
  console.log(`mock archive on ${url}\n`);

  try {
    console.log("probeArchive");
    const supported = await probeArchive(url, SLOT);
    check("accepts an endpoint that rejects slot+minContextSlot", supported.supported);

    const notAnArchive = await probeArchive(
      process.env.RPC_URL ?? "https://api.mainnet-beta.solana.com",
      SLOT
    );
    check(
      "rejects an endpoint that ignores the slot parameter",
      !notAnArchive.supported,
      notAnArchive.supported ? "probe claimed support" : undefined
    );

    console.log("\nfetchAccountsBeforeSlot");
    const { accounts: fetched, errors } = await fetchAccountsBeforeSlot(
      url,
      [withData, doesNotExistAnywhere, programAccount],
      SLOT
    );
    check("no fetch errors", errors.length === 0, errors.join("; "));
    check("returns an entry per address", fetched.size === 3, `got ${fetched.size}`);
    const got = fetched.get(withData);
    check("decodes base64 data", got?.data.equals(payload) === true);
    check("carries lamports and owner", got?.lamports === 123456789 && got?.owner === historicalOwner);
    check(
      "distinguishes 'did not exist' from 'unknown'",
      fetched.has(doesNotExistAnywhere) && fetched.get(doesNotExistAnywhere) === null
    );

    console.log("\ninjectHistoricalState");
    const current = new Map([[withData, original]]);
    const report = await injectHistoricalState(
      SURFNET_RPC,
      fetched as Map<string, ArchivedAccount>,
      current
    );

    check("injected the data account", report.injected === 1, JSON.stringify(report));
    check("skipped the executable account", report.skipped.some((s) => s.pubkey === programAccount));
    check("no injection failures", report.failed.length === 0, JSON.stringify(report.failed));

    const onFork = await readAccount(surfnet, withData);
    check("fork has the historical data", onFork?.data.equals(payload) === true);
    check("fork has the historical lamports", onFork?.lamports === 123456789);
    check("fork has the historical owner", onFork?.owner.toBase58() === historicalOwner);

    const program = await readAccount(surfnet, programAccount);
    check("left the executable account untouched", program === null);

    // An account the archive has but present-day mainnet doesn't — a wSOL
    // account closed in its own transaction, a PDA closed for rent. These are
    // restorable: the cheatcode creates them. Whatever the outcome, injection
    // must report rather than throw, since one bad account shouldn't cost the
    // whole replay.
    console.log("\naccounts closed since the tx");
    const ghost = new Map<string, ArchivedAccount>([
      [
        doesNotExistAnywhere,
        { lamports: 5000, owner: historicalOwner, data: Buffer.alloc(8), executable: false },
      ],
    ]);
    const ghostReport = await injectHistoricalState(SURFNET_RPC, ghost, new Map());
    check(
      "restores an account that exists on no network",
      ghostReport.injected === 1,
      JSON.stringify(ghostReport.failed)
    );
    check("never throws, whatever happens", ghostReport.injected + ghostReport.failed.length === 1);
    const restored = await readAccount(surfnet, doesNotExistAnywhere);
    check("the restored account is readable on the fork", restored?.lamports === 5000);
  } finally {
    // Put back what we changed, so a verify run after this isn't measuring it.
    if (original) {
      await restoreAccount(withData, original);
      const back = await readAccount(surfnet, withData);
      check("restored the test account", back?.data.equals(original.data) === true);
    }
    server.close();
  }

  console.log(failures === 0 ? "\nall checks passed" : `\n${failures} check(s) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

/**
 * Reads an account off the fork, treating an error as "not there".
 *
 * Surfnet raises an internal error rather than returning null for an address
 * that exists on no network, which these generated test addresses do not.
 */
async function readAccount(surfnet: Connection, pubkey: string) {
  try {
    return await surfnet.getAccountInfo(new PublicKey(pubkey), "processed");
  } catch {
    return null;
  }
}

/** Puts an account back the way the test found it. */
async function restoreAccount(pubkey: string, info: AccountInfo<Buffer>) {
  await fetch(SURFNET_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "surfnet_setAccount",
      params: [
        pubkey,
        {
          lamports: info.lamports,
          data: info.data.toString("hex"),
          owner: info.owner.toBase58(),
        },
      ],
    }),
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
