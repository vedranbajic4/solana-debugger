/**
 * lib/program-errors.ts
 *
 * Error code tables for common native and SPL programs, keyed by program ID.
 * These are hand-maintained — extend as you hit programs your users actually
 * debug against. A missing entry should surface as "unknown", never as a guess.
 *
 * Sources: solana-program (system_instruction), spl-token/src/error.rs,
 * spl-associated-token-account/src/error.rs, solana-program stake/vote errors.
 */

export const SYSTEM_PROGRAM_ID = "11111111111111111111111111111111";
export const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
export const TOKEN_2022_PROGRAM_ID =
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
export const ATA_PROGRAM_ID = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
export const STAKE_PROGRAM_ID = "Stake11111111111111111111111111111111111111";

const SYSTEM_ERRORS: Record<number, string> = {
  0: "AccountAlreadyInUse",
  1: "ResultWithNegativeLamports",
  2: "InvalidProgramId",
  3: "InvalidAccountDataLength",
  4: "MaxSeedLengthExceeded",
  5: "AddressWithSeedMismatch",
  6: "NonceNoRecentBlockhashes",
  7: "NonceBlockhashNotExpired",
  8: "NonceUnexpectedBlockhashValue",
};

/**
 * SPL Token base errors (0-19). Token-2022 shares this base set and adds
 * extension-specific codes above it, which are NOT included here.
 */
const TOKEN_ERRORS: Record<number, string> = {
  0: "NotRentExempt",
  1: "InsufficientFunds",
  2: "InvalidMint",
  3: "MintMismatch",
  4: "OwnerMismatch",
  5: "FixedSupply",
  6: "AlreadyInUse",
  7: "InvalidNumberOfProvidedSigners",
  8: "InvalidNumberOfRequiredSigners",
  9: "UninitializedState",
  10: "NativeNotSupported",
  11: "NonNativeHasBalance",
  12: "InvalidInstruction",
  13: "InvalidState",
  14: "Overflow",
  15: "AuthorityTypeNotSupported",
  16: "MintCannotFreeze",
  17: "AccountFrozen",
  18: "MintDecimalsMismatch",
  19: "NonNativeNotSupported",
};

const ATA_ERRORS: Record<number, string> = {
  0: "InvalidOwner",
};

const STAKE_ERRORS: Record<number, string> = {
  0: "NoCreditsToRedeem",
  1: "LockupInForce",
  2: "AlreadyDeactivated",
  3: "TooSoonToRedelegate",
  4: "InsufficientStake",
  5: "MergeTransientStake",
  6: "MergeMismatch",
  7: "CustodianPubkeyMissing",
  8: "CustodianSignatureMissing",
  9: "InsufficientReferenceVotes",
  10: "VoteAddressMismatch",
  11: "MinimumDelinquentEpochsForDeactivationNotMet",
  12: "InsufficientDelegation",
  13: "RedelegateTransientOrInactiveStake",
  14: "RedelegateToSameVoteAccount",
};

export const KNOWN_PROGRAM_ERRORS: Record<string, Record<number, string>> = {
  [SYSTEM_PROGRAM_ID]: SYSTEM_ERRORS,
  [TOKEN_PROGRAM_ID]: TOKEN_ERRORS,
  [TOKEN_2022_PROGRAM_ID]: TOKEN_ERRORS,
  [ATA_PROGRAM_ID]: ATA_ERRORS,
  [STAKE_PROGRAM_ID]: STAKE_ERRORS,
};

/** Human-readable names for the program IDs we have tables for. */
export const PROGRAM_NAMES: Record<string, string> = {
  [SYSTEM_PROGRAM_ID]: "System Program",
  [TOKEN_PROGRAM_ID]: "SPL Token",
  [TOKEN_2022_PROGRAM_ID]: "SPL Token-2022",
  [ATA_PROGRAM_ID]: "Associated Token Account Program",
  [STAKE_PROGRAM_ID]: "Stake Program",
  ComputeBudget111111111111111111111111111111: "Compute Budget Program",
};
