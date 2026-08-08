/**
 * lib/runtime-errors.ts
 *
 * The runtime's own errors — the ones that aren't `Custom(n)`.
 *
 * `lib/errors.ts` resolves program-defined codes. This covers the other half:
 * `TransactionError` variants, which reject a transaction before or around
 * execution, and the non-custom `InstructionError` variants the runtime raises
 * on a program's behalf. Both arrive as bare identifiers like
 * `ProgramFailedToComplete` — accurate, and useless to anyone who doesn't
 * already know what the runtime means by it.
 *
 * So each entry carries two things the name doesn't: what the runtime is
 * actually asserting, and — where there is one — the cause that produces it in
 * practice. The second is the part a debugger exists for, and the part no
 * amount of reading the enum will tell you.
 *
 * Where a `cause` would be a guess, it is omitted rather than invented. Same
 * rule as everywhere else here.
 */

export type RuntimeErrorInfo = {
  /** What the runtime is asserting. */
  meaning: string;
  /** What usually produces it. Absent when it would be speculation. */
  cause?: string;
};

/**
 * `TransactionError` — the transaction as a whole was rejected. Most of these
 * mean it never executed, so an empty log and 0 CU are expected rather than
 * suspicious.
 */
export const TRANSACTION_ERRORS: Record<string, RuntimeErrorInfo> = {
  AccountInUse: {
    meaning: "an account is already locked by another transaction being processed",
  },
  AccountLoadedTwice: { meaning: "the same account appears twice in the account list" },
  AccountNotFound: {
    meaning: "an account the transaction references does not exist",
    cause: "usually a fee payer that has never been funded, or a hardcoded address for the wrong cluster",
  },
  ProgramAccountNotFound: {
    meaning: "the program being called does not exist",
    cause: "a program id for a different cluster, or a program that was closed",
  },
  InsufficientFundsForFee: {
    meaning: "the fee payer cannot cover the transaction fee",
  },
  InvalidAccountForFee: { meaning: "the fee payer is not a valid System-owned account" },
  AlreadyProcessed: {
    meaning: "this exact transaction signature was already committed",
    cause: "a retry of a transaction that in fact succeeded — check before resending",
  },
  BlockhashNotFound: {
    meaning: "the transaction's blockhash is not in the recent blockhash queue",
    cause:
      "the blockhash expired (~60s / 150 slots) before submission — or, on a replay, " +
      "the nonce of a durable-nonce transaction was overwritten; see the durable-nonce gotcha",
  },
  CallChainTooDeep: { meaning: "CPI depth limit exceeded" },
  MissingSignatureForFee: { meaning: "the fee payer did not sign" },
  InvalidAccountIndex: { meaning: "an instruction references an account index that doesn't exist" },
  SignatureFailure: { meaning: "a signature failed to verify" },
  InvalidProgramForExecution: { meaning: "the account named as a program is not executable" },
  SanitizeFailure: {
    meaning: "the transaction is malformed and was rejected before execution",
    cause: "a wrongly built message: bad header counts, duplicate/missing keys, or a bad table index",
  },
  ClusterMaintenance: { meaning: "the cluster is in maintenance and not accepting transactions" },
  AccountBorrowOutstanding: { meaning: "an account borrow outlived the instruction that took it" },
  WouldExceedMaxBlockCostLimit: {
    meaning: "the block is full",
    cause: "transient congestion — retry, or raise the priority fee",
  },
  UnsupportedVersion: { meaning: "the transaction version is not supported by this cluster" },
  InvalidWritableAccount: { meaning: "an account marked writable may not be written" },
  WouldExceedMaxAccountCostLimit: {
    meaning: "the accounts touched exceed the per-account block cost limit",
    cause: "a hot account everyone is writing in the same block",
  },
  WouldExceedAccountDataBlockLimit: { meaning: "block-level account data limit exceeded" },
  TooManyAccountLocks: { meaning: "the transaction locks more accounts than allowed" },
  AddressLookupTableNotFound: {
    meaning: "a referenced address lookup table does not exist",
    cause: "a table that was closed, or a v0 transaction built against another cluster",
  },
  InvalidAddressLookupTableOwner: { meaning: "the lookup table is not owned by the ALT program" },
  InvalidAddressLookupTableData: { meaning: "the lookup table's data could not be parsed" },
  InvalidAddressLookupTableIndex: {
    meaning: "the transaction indexes past the end of a lookup table",
    cause: "the table shrank, or the transaction was built against a newer version of it",
  },
  InvalidRentPayingAccount: { meaning: "an account would be left rent-paying" },
  WouldExceedMaxVoteCostLimit: { meaning: "vote cost limit for the block exceeded" },
  WouldExceedAccountDataTotalLimit: { meaning: "total account data limit exceeded" },
  DuplicateInstruction: { meaning: "a duplicate instruction was rejected" },
  InsufficientFundsForRent: {
    meaning: "an account would drop below the rent-exempt minimum",
    cause: "withdrawing too much from an account without closing it",
  },
  MaxLoadedAccountsDataSizeExceeded: {
    meaning: "the transaction loads more account data than the limit allows",
    cause: "too many or too large accounts — raise the limit with a ComputeBudget instruction",
  },
  InvalidLoadedAccountsDataSizeLimit: { meaning: "the requested account data size limit is invalid" },
  ResanitizationNeeded: { meaning: "the transaction must be re-sanitized" },
  ProgramExecutionTemporarilyRestricted: {
    meaning: "execution of this program is temporarily restricted in this block",
  },
  UnbalancedTransaction: { meaning: "lamports were created or destroyed across the transaction" },
  ProgramCacheHitMaxLimit: { meaning: "the program cache hit its limit" },
  CommitCancelled: { meaning: "the commit was cancelled" },
};

/**
 * Non-custom `InstructionError` variants. `Custom(n)` is deliberately absent:
 * that's `resolveCustomError()`'s job, since only the program can say.
 */
export const INSTRUCTION_ERRORS: Record<string, RuntimeErrorInfo> = {
  GenericError: { meaning: "unspecified program error" },
  InvalidArgument: {
    meaning: "the runtime rejected an argument the program passed",
  },
  InvalidInstructionData: {
    meaning: "the program could not parse its instruction data",
    cause: "a discriminator or argument layout mismatch — often a client built against a different program version",
  },
  InvalidAccountData: {
    meaning: "an account's data is not what the program expected",
    cause: "the wrong account was passed, or an account that isn't initialized yet",
  },
  AccountDataTooSmall: { meaning: "an account is too small for the data being written" },
  InsufficientFunds: { meaning: "an account has too few lamports for the operation" },
  IncorrectProgramId: {
    meaning: "an account is not owned by the program the instruction expected",
    cause: "passing a Token account where a Token-2022 one was wanted, or vice versa",
  },
  MissingRequiredSignature: {
    meaning: "a required signer did not sign",
    cause: "a PDA expected to sign via CPI without the right seeds, or a missing client-side signer",
  },
  AccountAlreadyInitialized: {
    meaning: "the program was asked to initialize an account that already holds data",
    cause: "re-running a create/init that already succeeded — the idempotent variant may be wanted",
  },
  UninitializedAccount: { meaning: "the account has not been initialized" },
  UnbalancedInstruction: { meaning: "the instruction created or destroyed lamports" },
  ModifiedProgramId: { meaning: "the instruction tried to change an account's owner illegally" },
  ExternalAccountLamportSpend: { meaning: "lamports were spent from an account the program doesn't own" },
  ExternalAccountDataModified: { meaning: "data was modified on an account the program doesn't own" },
  ReadonlyLamportChange: { meaning: "lamports changed on a readonly account" },
  ReadonlyDataModified: { meaning: "data changed on a readonly account" },
  DuplicateAccountIndex: { meaning: "the same account was passed twice where it may not be" },
  ExecutableModified: { meaning: "an executable account was modified" },
  RentEpochModified: { meaning: "an account's rent epoch was modified" },
  NotEnoughAccountKeys: {
    meaning: "the instruction was given fewer accounts than it requires",
    cause: "an account list built for a different version of the instruction",
  },
  AccountDataSizeChanged: { meaning: "account data size changed when it may not" },
  AccountNotExecutable: { meaning: "an account expected to be a program is not executable" },
  AccountBorrowFailed: {
    meaning: "the program could not borrow an account reference",
    cause: "the same account passed twice and borrowed mutably in both places",
  },
  AccountBorrowOutstanding: { meaning: "an account borrow outlived the instruction" },
  DuplicateAccountOutOfSync: { meaning: "duplicate account references fell out of sync" },
  InvalidError: { meaning: "the program returned an error the runtime could not interpret" },
  ExecutableDataModified: { meaning: "a program's data was modified" },
  ExecutableLamportChange: { meaning: "a program account's lamports changed" },
  ExecutableAccountNotRentExempt: { meaning: "a program account is not rent exempt" },
  UnsupportedProgramId: { meaning: "the program id is not supported for execution" },
  CallDepth: { meaning: "CPI call depth exceeded" },
  MissingAccount: { meaning: "an account the program needed was not provided" },
  ReentrancyNotAllowed: {
    meaning: "a program tried to re-enter itself through a CPI",
    cause: "a callback path that loops back into the calling program",
  },
  MaxSeedLengthExceeded: { meaning: "a PDA seed is longer than 32 bytes" },
  InvalidSeeds: {
    meaning: "the seeds provided do not derive the address given",
    cause: "the classic PDA bug — wrong seed order, a missing bump, or the wrong program id in the derivation",
  },
  InvalidRealloc: { meaning: "an invalid account reallocation was requested" },
  ComputationalBudgetExceeded: {
    meaning: "the instruction ran out of compute units",
    cause: "raise the limit with a ComputeBudget SetComputeUnitLimit instruction, or do less work per instruction",
  },
  PrivilegeEscalation: {
    meaning: "a CPI tried to grant a privilege the caller did not hold",
    cause: "passing an account as signer or writable in a CPI when the outer instruction did not mark it so",
  },
  ProgramEnvironmentSetupFailure: { meaning: "the runtime could not set up the program environment" },
  ProgramFailedToComplete: {
    meaning: "the program aborted without returning an error",
    cause: "a panic, a failed assert, an out-of-bounds index, or stack/heap exhaustion — check the logs for the last line the program printed",
  },
  ProgramFailedToCompile: { meaning: "the program failed to compile or load" },
  Immutable: { meaning: "the account or program is immutable" },
  IncorrectAuthority: { meaning: "the authority provided is not the one the account records" },
  BorshIoError: {
    meaning: "the program failed to (de)serialize with borsh",
    cause: "instruction args or account data that don't match the layout the program was built with",
  },
  AccountNotRentExempt: { meaning: "the account would not be rent exempt" },
  InvalidAccountOwner: {
    meaning: "an account is owned by the wrong program",
    cause: "distinct from IncorrectProgramId: here the runtime checked the owner, not the program",
  },
  ArithmeticOverflow: {
    meaning: "an arithmetic operation overflowed",
    cause: "a checked_* call failing on unexpected magnitudes — often a slippage or decimals mismatch",
  },
  UnsupportedSysvar: { meaning: "the sysvar requested is not supported" },
  IllegalOwner: { meaning: "the account owner is not permitted here" },
  MaxAccountsDataAllocationsExceeded: { meaning: "too much account data allocated in one transaction" },
  MaxAccountsExceeded: { meaning: "too many accounts for one transaction" },
  MaxInstructionTraceLengthExceeded: { meaning: "the instruction trace grew past the limit" },
  BuiltinProgramsMustConsumeComputeUnits: { meaning: "a builtin program reported zero compute used" },
};

/**
 * Explains a runtime error identifier.
 *
 * `meta.err` shapes these as either a bare string (`"AlreadyProcessed"`) or a
 * single-key object carrying a payload (`{"DuplicateInstruction": 3}`,
 * `{"BorshIoError": "..."}`), so both are accepted and the payload is returned
 * alongside rather than dropped.
 */
export function explainRuntimeError(
  error: unknown,
  kind: "transaction" | "instruction",
): { name: string; payload: unknown; info: RuntimeErrorInfo | null } | null {
  const table = kind === "transaction" ? TRANSACTION_ERRORS : INSTRUCTION_ERRORS;

  if (typeof error === "string") {
    return { name: error, payload: null, info: table[error] ?? null };
  }
  if (error && typeof error === "object") {
    const keys = Object.keys(error);
    const name = keys[0];
    if (keys.length === 1 && name) {
      return {
        name,
        payload: (error as Record<string, unknown>)[name],
        info: table[name] ?? null,
      };
    }
  }
  return null;
}
