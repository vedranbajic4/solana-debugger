/**
 * lib/summary.ts
 *
 * Pulls the human-readable part of a failure out of the program logs.
 *
 * An IDL gives us the error's *name*; the logs often carry the far more
 * useful context around it — which account or constraint tripped, and the
 * source file and line the program threw from. Anchor prints all of it in one
 * line, so it costs nothing to surface.
 */

/** Anchor's failure log, e.g.
 *  `Program log: AnchorError caused by account: pool. Error Code: ConstraintSeeds. Error Number: 2006. Error Message: ...`
 *  `Program log: AnchorError thrown in programs/pump-amm/src/.../sell.rs:170. Error Code: ExceededSlippage. ...` */
export type AnchorErrorInfo = {
  /** `<path>:<line>` the program threw from, when Anchor recorded it. */
  source: string | null;
  /** The account that tripped the constraint, when Anchor named one. */
  account: string | null;
  /** Anchor error identifier, e.g. `ConstraintSeeds`. */
  code: string | null;
  number: number | null;
  message: string | null;
};

/**
 * Parses the first `AnchorError` line in the logs.
 *
 * Returns null for non-Anchor programs — every field is independently
 * optional, since Anchor emits several shapes of this line depending on
 * whether the error came from a constraint, a `require!`, or a bare `err!`.
 */
export function parseAnchorError(
  logs: string[] | null | undefined,
): AnchorErrorInfo | null {
  const line = (logs ?? []).find((l) => l.includes("AnchorError"));
  if (!line) return null;

  const num = /Error Number: (\d+)\./.exec(line);
  return {
    source: /thrown in ([^\s]+?:\d+)\./.exec(line)?.[1] ?? null,
    account: /caused by account: ([^\s.]+)\./.exec(line)?.[1] ?? null,
    code: /Error Code: ([^.]+)\./.exec(line)?.[1] ?? null,
    number: num?.[1] !== undefined ? Number(num[1]) : null,
    message: /Error Message: (.+?)\.?$/.exec(line)?.[1] ?? null,
  };
}

/** Log lines that are runtime bookkeeping rather than anything a program said. */
const NOISE = /^Program (\S+ (invoke \[\d+\]|success|failed:|consumed \d+)|data: |return: )/;

/**
 * Last thing a program actually logged before the first failure.
 *
 * Non-Anchor programs (SPL Token, native, hand-rolled) have no structured
 * error line, but usually log something human first — "Error: insufficient
 * funds" — which is the only readable clue to what went wrong.
 */
export function findLogHint(logs: string[] | null | undefined): string | null {
  const lines = logs ?? [];
  const failedAt = lines.findIndex((l) => / failed: /.test(l));
  const upTo = failedAt === -1 ? lines : lines.slice(0, failedAt);

  for (let i = upTo.length - 1; i >= 0; i--) {
    const line = upTo[i]!.trim();
    if (NOISE.test(line)) continue;
    if (!line.startsWith("Program log: ")) continue;
    const body = line.slice("Program log: ".length);
    // "Instruction: Swap" is Anchor's dispatch trace, not an error message.
    if (body.startsWith("Instruction: ")) continue;
    if (body.includes("AnchorError")) continue;
    return body;
  }
  return null;
}
