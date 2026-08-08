/**
 * lib/corpus.ts
 *
 * Shape of the replay test corpus shared by `build-corpus.ts` (writes it) and
 * `verify-replay.ts` (reads it).
 *
 * The recorded `err`/`computeUnits` are the mainnet ground truth at capture
 * time. verify-replay re-fetches each tx rather than trusting these — they're
 * here so a human reading corpus.json can see what the corpus covers, and so a
 * drifting RPC (a re-org'd or pruned signature) is visible as a mismatch
 * against the file rather than silently changing the baseline.
 */

import { fileURLToPath } from "node:url";

export type CorpusEntry = {
  signature: string;
  slot: number;
  /** "legacy" or "v0" — v0 txs exercise the address-lookup-table path. */
  version: string;
  outcome: "failed" | "success";
  /** JSON-stringified `meta.err`, or null for a successful tx. */
  err: string | null;
  computeUnits: number;
  accounts: number;
  instructions: number;
  /** The program the tx exists to call — the failing one, if it failed. */
  program: string;
};

export type CorpusFile = {
  generatedAt: string;
  mainnetTip: number;
  sampledSlots: number[];
  entries: CorpusEntry[];
};

/** Resolved relative to this file so both scripts agree regardless of cwd. */
export const CORPUS_PATH = fileURLToPath(new URL("../corpus.json", import.meta.url));
