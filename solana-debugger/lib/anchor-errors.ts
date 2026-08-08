/**
 * lib/anchor-errors.ts
 *
 * Anchor's reserved framework error codes. These are emitted by anchor-lang
 * itself, NOT by user program code — user-defined errors start at 6000 and
 * only resolve via the program's IDL.
 *
 * Source of truth: anchor-lang/src/error.rs (ErrorCode enum).
 * Codes below are stable across recent Anchor versions; the token-2022
 * extension constraints (2024+) vary by version, so verify against the
 * anchor-lang version a program was built with if you need those.
 */

export const ANCHOR_FRAMEWORK_ERRORS: Record<number, string> = {
  // --- Instructions (100x) ---
  100: "InstructionMissing",
  101: "InstructionFallbackNotFound",
  102: "InstructionDidNotDeserialize",
  103: "InstructionDidNotSerialize",

  // --- IDL instructions (1000x) ---
  1000: "IdlInstructionStub",
  1001: "IdlInstructionInvalidProgram",
  1002: "IdlAccountNotEmpty",

  // --- Event instructions (1500x) ---
  1500: "EventInstructionStub",

  // --- Constraints (2000x) ---
  2000: "ConstraintMut",
  2001: "ConstraintHasOne",
  2002: "ConstraintSigner",
  2003: "ConstraintRaw",
  2004: "ConstraintOwner",
  2005: "ConstraintRentExempt",
  2006: "ConstraintSeeds",
  2007: "ConstraintExecutable",
  2008: "ConstraintState",
  2009: "ConstraintAssociated",
  2010: "ConstraintAssociatedInit",
  2011: "ConstraintClose",
  2012: "ConstraintAddress",
  2013: "ConstraintZero",
  2014: "ConstraintTokenMint",
  2015: "ConstraintTokenOwner",
  2016: "ConstraintMintMintAuthority",
  2017: "ConstraintMintFreezeAuthority",
  2018: "ConstraintMintDecimals",
  2019: "ConstraintSpace",
  2020: "ConstraintAccountIsNone",
  2021: "ConstraintTokenTokenProgram",
  2022: "ConstraintMintTokenProgram",
  2023: "ConstraintAssociatedTokenTokenProgram",

  // --- Require macros (2500x) ---
  2500: "RequireViolated",
  2501: "RequireEqViolated",
  2502: "RequireKeysEqViolated",
  2503: "RequireNeqViolated",
  2504: "RequireKeysNeqViolated",
  2505: "RequireGtViolated",
  2506: "RequireGteViolated",

  // --- Accounts (3000x) ---
  3000: "AccountDiscriminatorAlreadySet",
  3001: "AccountDiscriminatorNotFound",
  3002: "AccountDiscriminatorMismatch",
  3003: "AccountDidNotDeserialize",
  3004: "AccountDidNotSerialize",
  3005: "AccountNotEnoughKeys",
  3006: "AccountNotMutable",
  3007: "AccountOwnedByWrongProgram",
  3008: "InvalidProgramId",
  3009: "InvalidProgramExecutable",
  3010: "AccountNotSigner",
  3011: "AccountNotSystemOwned",
  3012: "AccountNotInitialized",
  3013: "AccountNotProgramData",
  3014: "AccountNotAssociatedTokenAccount",
  3015: "AccountSysvarMismatch",
  3016: "AccountReallocExceedsLimit",
  3017: "AccountDuplicateReallocs",

  // --- State (4000x) ---
  4000: "StateInvalidAddress",

  // --- Miscellaneous (4100x) ---
  4100: "DeclaredProgramIdMismatch",
  4101: "TryingToInitPayerAsProgramAccount",
  4102: "InvalidNumericConversion",

  // --- Deprecated (5000x) ---
  5000: "Deprecated",
};

/** Anchor reserves everything below this; user-defined errors start here. */
export const ANCHOR_USER_ERROR_OFFSET = 6000;

/**
 * True if the code falls in a range Anchor reserves for itself.
 * Useful for telling "this is a framework error" from "this is a program's
 * own error that we failed to resolve because we couldn't fetch an IDL".
 */
export function isAnchorFrameworkRange(code: number): boolean {
  return code >= 100 && code < ANCHOR_USER_ERROR_OFFSET;
}
