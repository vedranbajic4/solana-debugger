/**
 * lib/idl-cache.ts
 *
 * Caches on-chain Anchor IDL lookups, including the misses.
 *
 * The negative cache is the whole point. `tryFetchAnchorIdl()` derives a PDA
 * and reads it, and for most programs that account does not exist — non-Anchor
 * programs, and Anchor programs that never uploaded their IDL, are the majority
 * of what a debugger meets. Caching only successes would leave the common path
 * paying a full RPC round-trip every time to learn nothing, which is exactly
 * the case a batch run (`npm run verify`, `npm run test:report -- --all`) hits
 * hardest.
 *
 * Persisted to disk because this is a CLI: each `npm run fetch` is a fresh
 * process, so an in-memory cache alone would never survive to be useful for the
 * single-transaction case the tool exists for.
 *
 * Freshness is handled by asymmetric TTLs, because the two answers age
 * differently. A published IDL is near-immutable — programs are upgraded rarely
 * and republished IDLs are rarer — so hits are held for a long time. A miss is
 * a statement about *now*: the program may publish an IDL tomorrow, so misses
 * expire quickly enough that the cache can't permanently hide one.
 */

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Connection } from "@solana/web3.js";

/** A published IDL rarely changes; a week keeps batch runs and repeat use cheap. */
const HIT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
/** "No IDL" is only true until someone uploads one. */
const MISS_TTL_MS = 60 * 60 * 1000;

const CACHE_DIR = fileURLToPath(new URL("../.idl-cache", import.meta.url));

type CacheEntry = {
  programId: string;
  /** null records a confirmed absence — the negative half of the cache. */
  idl: unknown | null;
  fetchedAt: number;
};

export type IdlCacheStats = {
  hits: number;
  misses: number;
  /** Lookups answered from the negative cache — the ones worth having. */
  negativeHits: number;
  fetches: number;
  writeErrors: number;
};

const memory = new Map<string, CacheEntry>();
const stats: IdlCacheStats = {
  hits: 0,
  misses: 0,
  negativeHits: 0,
  fetches: 0,
  writeErrors: 0,
};

/**
 * Program IDs are base58 and case-sensitive, which is not safe as a filename on
 * a case-insensitive filesystem; hash instead of trusting the id.
 */
function cachePath(programId: string): string {
  const digest = createHash("sha256").update(programId).digest("hex").slice(0, 32);
  return join(CACHE_DIR, `${digest}.json`);
}

function ttlFor(entry: CacheEntry): number {
  return entry.idl === null ? MISS_TTL_MS : HIT_TTL_MS;
}

function isFresh(entry: CacheEntry, now: number): boolean {
  return now - entry.fetchedAt < ttlFor(entry);
}

function readDisk(programId: string): CacheEntry | null {
  try {
    const entry = JSON.parse(readFileSync(cachePath(programId), "utf8")) as CacheEntry;
    // Guard against a hash collision or a hand-edited file claiming another id.
    if (entry.programId !== programId) return null;
    return entry;
  } catch {
    return null; // absent, unreadable, or corrupt — all mean "not cached"
  }
}

function writeDisk(entry: CacheEntry): void {
  try {
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(cachePath(entry.programId), JSON.stringify(entry));
  } catch {
    // A cache that can't write is still a correct cache, just a slower one.
    stats.writeErrors++;
  }
}

/**
 * Fetches a program's IDL, consulting the cache first.
 *
 * `fetcher` is injected so this module never has to know how an IDL is read —
 * and so the cache itself is testable without a chain.
 */
export async function getCachedIdl(
  connection: Connection,
  programId: string,
  fetcher: (connection: Connection, programId: string) => Promise<unknown | null>,
  now: number = Date.now(),
): Promise<unknown | null> {
  const cached = memory.get(programId) ?? readDisk(programId);
  if (cached && isFresh(cached, now)) {
    memory.set(programId, cached);
    if (cached.idl === null) stats.negativeHits++;
    else stats.hits++;
    return cached.idl;
  }

  stats.fetches++;
  const idl = await fetcher(connection, programId);
  if (idl === null) stats.misses++;

  const entry: CacheEntry = { programId, idl, fetchedAt: now };
  memory.set(programId, entry);
  writeDisk(entry);
  return idl;
}

export function idlCacheStats(): IdlCacheStats {
  return { ...stats };
}

/** Drops the in-memory layer. Used by tests; the disk layer is untouched. */
export function clearIdlMemoryCache(): void {
  memory.clear();
}

/**
 * Removes cache files, or only the stale ones with `staleOnly`.
 *
 * Worth having because a wrong cached IDL is a confidently wrong error name —
 * the exact failure this tool refuses to make elsewhere — so there has to be a
 * way to throw the cache away without hunting for its directory.
 */
export function pruneIdlCache(opts?: { staleOnly?: boolean; now?: number }): number {
  const now = opts?.now ?? Date.now();
  let removed = 0;
  let names: string[];
  try {
    names = readdirSync(CACHE_DIR);
  } catch {
    return 0; // no cache directory yet
  }
  for (const name of names) {
    if (!name.endsWith(".json")) continue;
    const path = join(CACHE_DIR, name);
    if (opts?.staleOnly) {
      try {
        const entry = JSON.parse(readFileSync(path, "utf8")) as CacheEntry;
        if (isFresh(entry, now)) continue;
      } catch {
        // unreadable: fall through and remove it
      }
    }
    try {
      unlinkSync(path);
      removed++;
    } catch {
      /* already gone */
    }
  }
  memory.clear();
  return removed;
}

export const IDL_CACHE_DIR = CACHE_DIR;
export const IDL_CACHE_TTL = { hit: HIT_TTL_MS, miss: MISS_TTL_MS };
