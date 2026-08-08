/**
 * lib/cpi-tree.ts
 *
 * Turns `meta.logMessages` — a flat list of lines — back into the call tree the
 * runtime actually executed, with compute attributed to each frame.
 *
 * Why bother when `meta.innerInstructions` already describes the CPIs: that
 * field records which instructions ran, not how they *went*. Compute consumed,
 * what each program logged on its way down, and which frame actually failed all
 * live only in the logs. And the failing frame is the whole question this tool
 * exists to answer — `meta.err`'s instruction index names a top-level
 * instruction, which is the caller, not the culprit, whenever the failure
 * happened inside a CPI.
 *
 * The grammar, as the runtime emits it:
 *   Program <id> invoke [<depth>]        opens a frame
 *   Program log: <text>                  program output, belongs to the open frame
 *   Program data: <base64>               same, for emitted events
 *   Program return: <id> <base64>        same, for a return value
 *   Program <id> consumed N of M compute units
 *   Program <id> success | failed: <reason>
 *   Log truncated                        the validator gave up; tree is partial
 */

/** One program invocation. Children are the CPIs it made, in order. */
export type CpiFrame = {
  programId: string;
  /** 1-based, as the runtime reports it in `invoke [n]`. */
  depth: number;
  /** Total compute for this frame *including* everything it called. */
  consumedCu: number | null;
  /** Compute budget this frame was handed, from the `of M` half of the line. */
  budgetCu: number | null;
  /**
   * Compute burned by this frame's own code: `consumedCu` minus the total of
   * its direct children. This is what "which program is expensive" means — a
   * router's raw consumption is mostly its callees' work.
   */
  selfCu: number | null;
  /** `Program log:` / `data:` / `return:` lines emitted directly by this frame. */
  logs: string[];
  outcome: "success" | "failed" | "unterminated";
  /** The text after `failed: `, e.g. "custom program error: 0x1786". */
  failure: string | null;
  children: CpiFrame[];
};

export type CpiTree = {
  roots: CpiFrame[];
  /** True when the validator truncated the logs — the tree is incomplete. */
  truncated: boolean;
  /**
   * Lines that didn't belong to any open frame, kept rather than dropped so
   * nothing silently disappears (the runtime emits a few at top level).
   */
  preamble: string[];
};

const INVOKE = /^Program (\S+) invoke \[(\d+)\]$/;
const SUCCESS = /^Program (\S+) success$/;
const FAILED = /^Program (\S+) failed: (.+)$/;
const CONSUMED = /^Program (\S+) consumed (\d+) of (\d+) compute units$/;
const OUTPUT = /^Program (?:log|data|return): /;

function newFrame(programId: string, depth: number): CpiFrame {
  return {
    programId,
    depth,
    consumedCu: null,
    budgetCu: null,
    selfCu: null,
    logs: [],
    outcome: "unterminated",
    failure: null,
    children: [],
  };
}

/**
 * Parses the runtime's log lines into a call tree.
 *
 * Deliberately tolerant: truncated logs are the common case on exactly the
 * transactions worth debugging, so an unclosed frame is reported as
 * `unterminated` rather than throwing away everything parsed so far.
 */
export function buildCpiTree(logs: readonly string[] | null | undefined): CpiTree {
  const tree: CpiTree = { roots: [], truncated: false, preamble: [] };
  if (!logs?.length) return tree;

  const stack: CpiFrame[] = [];
  const top = () => stack[stack.length - 1];

  for (const line of logs) {
    if (line.includes("Log truncated")) {
      tree.truncated = true;
      continue;
    }

    const invoke = INVOKE.exec(line);
    if (invoke) {
      const frame = newFrame(invoke[1]!, Number(invoke[2]));
      // Trust the reported depth over our own bookkeeping: if a frame was
      // never closed (truncated logs), the depth tells us where this one
      // really belongs and keeps the rest of the tree correctly shaped.
      while (stack.length >= frame.depth) stack.pop();
      const parent = top();
      if (parent) parent.children.push(frame);
      else tree.roots.push(frame);
      stack.push(frame);
      continue;
    }

    const consumed = CONSUMED.exec(line);
    if (consumed) {
      // The consumed line names its program, which may be an inner frame that
      // is about to close; match by id so a missing close doesn't misattribute.
      const target = [...stack].reverse().find((f) => f.programId === consumed[1]) ?? top();
      if (target) {
        target.consumedCu = Number(consumed[2]);
        target.budgetCu = Number(consumed[3]);
      }
      continue;
    }

    const success = SUCCESS.exec(line);
    if (success) {
      closeFrame(stack, success[1]!, "success", null);
      continue;
    }

    const failed = FAILED.exec(line);
    if (failed) {
      closeFrame(stack, failed[1]!, "failed", failed[2]!);
      continue;
    }

    if (OUTPUT.test(line)) {
      const frame = top();
      if (frame) frame.logs.push(line);
      else tree.preamble.push(line);
      continue;
    }

    // Anything else: runtime chatter ("Program failed to complete", compute
    // budget notes). Attach it to the open frame so its context survives.
    const frame = top();
    if (frame) frame.logs.push(line);
    else tree.preamble.push(line);
  }

  for (const root of tree.roots) computeSelfCu(root);
  return tree;
}

/**
 * Closes the named frame, unwinding any frames left open above it.
 *
 * Unwinding matters on truncated logs: an inner frame whose close line was cut
 * would otherwise swallow its parent's success line and shift the whole tree.
 */
function closeFrame(
  stack: CpiFrame[],
  programId: string,
  outcome: "success" | "failed",
  failure: string | null,
): void {
  const index = stack.map((f) => f.programId).lastIndexOf(programId);
  if (index === -1) return; // close for a frame we never saw open
  const frame = stack[index]!;
  frame.outcome = outcome;
  frame.failure = failure;
  stack.length = index;
}

/** Self CU = own consumption minus everything the frame's callees consumed. */
function computeSelfCu(frame: CpiFrame): void {
  for (const child of frame.children) computeSelfCu(child);
  if (frame.consumedCu === null) return;
  const childTotal = frame.children.reduce((sum, c) => sum + (c.consumedCu ?? 0), 0);
  frame.selfCu = frame.consumedCu - childTotal;
}

/** Every frame, parents before children. */
export function flattenFrames(tree: CpiTree): CpiFrame[] {
  const out: CpiFrame[] = [];
  const walk = (f: CpiFrame) => {
    out.push(f);
    for (const c of f.children) walk(c);
  };
  for (const root of tree.roots) walk(root);
  return out;
}

/**
 * The innermost frame that failed — the program that actually raised the error.
 *
 * Failure propagates outward, so every frame on the stack reports failed and
 * only the deepest one is the origin. This is the same conclusion
 * `findFailingProgramInLogs()` reaches from the first failure line; going
 * through the tree additionally says *where* in the call graph it sits, which
 * is what makes a caller-vs-callee mix-up visible instead of merely avoided.
 */
export function deepestFailedFrame(tree: CpiTree): CpiFrame | null {
  let best: CpiFrame | null = null;
  for (const frame of flattenFrames(tree)) {
    if (frame.outcome !== "failed") continue;
    if (!best || frame.depth > best.depth) best = frame;
  }
  return best;
}

/** Frames ranked by their own compute, which is what "expensive" should mean. */
export function framesBySelfCu(tree: CpiTree): CpiFrame[] {
  return flattenFrames(tree)
    .filter((f) => f.selfCu !== null)
    .sort((a, b) => (b.selfCu ?? 0) - (a.selfCu ?? 0));
}

/** Renders the tree as indented CLI lines. */
export function formatCpiTree(tree: CpiTree, opts?: { logs?: boolean }): string[] {
  const out: string[] = [];
  const walk = (frame: CpiFrame, indent: string) => {
    const cu =
      frame.consumedCu === null
        ? ""
        : `  ${frame.consumedCu} CU` +
          (frame.selfCu !== null && frame.children.length ? ` (${frame.selfCu} self)` : "");
    const mark =
      frame.outcome === "failed"
        ? `  <-- FAILED: ${frame.failure}`
        : frame.outcome === "unterminated"
          ? "  <-- no result (logs truncated)"
          : "";
    out.push(`${indent}${frame.programId}${cu}${mark}`);
    if (opts?.logs) for (const l of frame.logs) out.push(`${indent}  | ${l}`);
    for (const child of frame.children) walk(child, indent + "  ");
  };
  for (const root of tree.roots) walk(root, "  ");
  if (tree.truncated) out.push("  (logs truncated by the validator — tree is incomplete)");
  return out;
}
