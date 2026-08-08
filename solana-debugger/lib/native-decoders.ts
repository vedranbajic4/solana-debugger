/**
 * lib/native-decoders.ts
 *
 * Decodes instruction data for the programs every transaction touches: System,
 * SPL Token, Token-2022, and the Associated Token Account program.
 *
 * These four have no on-chain IDL, so the IDL path in `lib/errors.ts` can never
 * explain them — yet they appear in almost every transaction, and "what did
 * instruction 3 actually do" is usually the question. Their layouts are stable
 * and public, so hand-decoding is the only option and a safe one.
 *
 * Two rules carried over from the rest of this tool:
 *
 * - **Never guess.** An unrecognised discriminant returns `null`, not a
 *   plausible-looking name. A wrong "Transfer 5 SOL" is worse than no answer.
 * - **Account roles matter as much as args.** `Transfer { lamports: 5000 }`
 *   doesn't say who paid; the position-to-role mapping is the part a reader
 *   can't reconstruct without the program's docs open.
 */

import { PublicKey } from "@solana/web3.js";

import {
  ATA_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "./program-errors.js";

/** A decoded instruction. Values are JSON-safe: u64s are decimal strings. */
export type DecodedIx = {
  program: string;
  /** Instruction name as the program's own source calls it. */
  name: string;
  args: Record<string, string | number | boolean | null>;
  /** Account roles, in the order the instruction expects them. */
  accounts: { role: string; pubkey: string }[];
  /**
   * Set when the data parsed but was shorter than the layout expects — the
   * name is trustworthy, the args may be incomplete.
   */
  truncated?: boolean;
};

/** Reads a pubkey at `offset`, or null if the buffer is too short. */
function pubkeyAt(data: Buffer, offset: number): string | null {
  if (data.length < offset + 32) return null;
  return new PublicKey(data.subarray(offset, offset + 32)).toBase58();
}

function u64At(data: Buffer, offset: number): string | null {
  if (data.length < offset + 8) return null;
  return data.readBigUInt64LE(offset).toString();
}

function u32At(data: Buffer, offset: number): number | null {
  if (data.length < offset + 4) return null;
  return data.readUInt32LE(offset);
}

/** Pairs account roles with the pubkeys actually supplied. */
function roles(names: string[], accounts: string[]): DecodedIx["accounts"] {
  return accounts.map((pubkey, i) => ({ role: names[i] ?? `account ${i}`, pubkey }));
}

// ---------------------------------------------------------------- System

/**
 * SystemInstruction, discriminated by a u32 LE tag.
 *
 * Only the variants worth naming are decoded in full; the seeded and
 * `WithSeed` variants carry a bincode-serialized string whose length prefix
 * makes fixed-offset reads unsafe, so they're named without arg decoding
 * rather than decoded wrongly.
 */
function decodeSystem(data: Buffer, accounts: string[]): DecodedIx | null {
  const tag = u32At(data, 0);
  if (tag === null) return null;
  const base = { program: "System", accounts: [] as DecodedIx["accounts"] };

  switch (tag) {
    case 0:
      return {
        ...base,
        name: "CreateAccount",
        args: {
          lamports: u64At(data, 4),
          space: u64At(data, 12),
          owner: pubkeyAt(data, 20),
        },
        accounts: roles(["funder", "new account"], accounts),
      };
    case 1:
      return {
        ...base,
        name: "Assign",
        args: { owner: pubkeyAt(data, 4) },
        accounts: roles(["account"], accounts),
      };
    case 2:
      return {
        ...base,
        name: "Transfer",
        args: { lamports: u64At(data, 4) },
        accounts: roles(["from", "to"], accounts),
      };
    case 3:
      return {
        ...base,
        name: "CreateAccountWithSeed",
        args: {},
        accounts: roles(["funder", "new account", "base"], accounts),
        truncated: true,
      };
    case 4:
      return {
        ...base,
        name: "AdvanceNonceAccount",
        args: {},
        accounts: roles(["nonce account", "recent blockhashes sysvar", "authority"], accounts),
      };
    case 5:
      return {
        ...base,
        name: "WithdrawNonceAccount",
        args: { lamports: u64At(data, 4) },
        accounts: roles(
          ["nonce account", "to", "recent blockhashes sysvar", "rent sysvar", "authority"],
          accounts
        ),
      };
    case 6:
      return {
        ...base,
        name: "InitializeNonceAccount",
        args: { authority: pubkeyAt(data, 4) },
        accounts: roles(["nonce account", "recent blockhashes sysvar", "rent sysvar"], accounts),
      };
    case 7:
      return {
        ...base,
        name: "AuthorizeNonceAccount",
        args: { newAuthority: pubkeyAt(data, 4) },
        accounts: roles(["nonce account", "authority"], accounts),
      };
    case 8:
      return {
        ...base,
        name: "Allocate",
        args: { space: u64At(data, 4) },
        accounts: roles(["account"], accounts),
      };
    case 9:
      return { ...base, name: "AllocateWithSeed", args: {}, accounts: roles(["account", "base"], accounts), truncated: true };
    case 10:
      return { ...base, name: "AssignWithSeed", args: {}, accounts: roles(["account", "base"], accounts), truncated: true };
    case 11:
      return { ...base, name: "TransferWithSeed", args: {}, accounts: roles(["from", "base", "to"], accounts), truncated: true };
    case 12:
      return {
        ...base,
        name: "UpgradeNonceAccount",
        args: {},
        accounts: roles(["nonce account"], accounts),
      };
    default:
      return null;
  }
}

// ----------------------------------------------------------------- Token

/**
 * SPL Token instruction names by u8 discriminant. Token-2022 shares this base
 * set; its extension instructions (26+) multiplex a sub-discriminant in the
 * next byte, so they're named at the top level only — decoding a sub-variant
 * we haven't verified would be guessing.
 */
const TOKEN_INSTRUCTIONS: Record<number, string> = {
  0: "InitializeMint",
  1: "InitializeAccount",
  2: "InitializeMultisig",
  3: "Transfer",
  4: "Approve",
  5: "Revoke",
  6: "SetAuthority",
  7: "MintTo",
  8: "Burn",
  9: "CloseAccount",
  10: "FreezeAccount",
  11: "ThawAccount",
  12: "TransferChecked",
  13: "ApproveChecked",
  14: "MintToChecked",
  15: "BurnChecked",
  16: "InitializeAccount2",
  17: "SyncNative",
  18: "InitializeAccount3",
  19: "InitializeMultisig2",
  20: "InitializeMint2",
  21: "GetAccountDataSize",
  22: "InitializeImmutableOwner",
  23: "AmountToUiAmount",
  24: "UiAmountToAmount",
  25: "InitializeMintCloseAuthority",
  26: "TransferFeeExtension",
  27: "ConfidentialTransferExtension",
  28: "DefaultAccountStateExtension",
  29: "Reallocate",
  30: "MemoTransferExtension",
  31: "CreateNativeMint",
  32: "InitializeNonTransferableMint",
  33: "InterestBearingMintExtension",
  34: "CpiGuardExtension",
  35: "InitializePermanentDelegate",
  36: "TransferHookExtension",
  37: "ConfidentialTransferFeeExtension",
  38: "WithdrawExcessLamports",
  39: "MetadataPointerExtension",
  40: "GroupPointerExtension",
  41: "GroupMemberPointerExtension",
};

/** Accounts for the transfer-shaped instructions, which dominate real traffic. */
const TOKEN_ACCOUNT_ROLES: Record<number, string[]> = {
  1: ["account", "mint", "owner", "rent sysvar"],
  3: ["source", "destination", "owner"],
  4: ["source", "delegate", "owner"],
  5: ["source", "owner"],
  6: ["account or mint", "current authority"],
  7: ["mint", "destination", "mint authority"],
  8: ["account", "mint", "owner"],
  9: ["account", "destination", "owner"],
  10: ["account", "mint", "freeze authority"],
  11: ["account", "mint", "freeze authority"],
  12: ["source", "mint", "destination", "owner"],
  13: ["source", "mint", "delegate", "owner"],
  14: ["mint", "destination", "mint authority"],
  15: ["account", "mint", "owner"],
  16: ["account", "mint", "rent sysvar"],
  17: ["native token account"],
  18: ["account", "mint"],
};

function decodeToken(data: Buffer, accounts: string[], is2022: boolean): DecodedIx | null {
  if (data.length < 1) return null;
  const tag = data.readUInt8(0);
  const name = TOKEN_INSTRUCTIONS[tag];
  if (!name) return null;

  const program = is2022 ? "Token-2022" : "SPL Token";
  const args: DecodedIx["args"] = {};

  switch (tag) {
    case 0:
    case 20:
      args["decimals"] = data.length > 1 ? data.readUInt8(1) : null;
      args["mintAuthority"] = pubkeyAt(data, 2);
      break;
    case 3:
    case 4:
    case 7:
    case 8:
      args["amount"] = u64At(data, 1);
      break;
    case 12:
    case 13:
    case 14:
    case 15:
      args["amount"] = u64At(data, 1);
      args["decimals"] = data.length > 9 ? data.readUInt8(9) : null;
      break;
    case 16:
    case 18:
      args["owner"] = pubkeyAt(data, 1);
      break;
    default:
      break;
  }

  return {
    program,
    name,
    args,
    accounts: roles(TOKEN_ACCOUNT_ROLES[tag] ?? [], accounts),
    // Extension instructions carry a sub-discriminant we don't decode.
    ...(tag >= 26 ? { truncated: true } : {}),
  };
}

// ------------------------------------------------------------------- ATA

const ATA_ROLES = ["funder", "associated token account", "wallet", "mint", "system program", "token program"];

/**
 * The ATA program's original `Create` carries *empty* instruction data — the
 * later variants added a discriminant byte. So an empty buffer is meaningful
 * here rather than a parse failure.
 */
function decodeAta(data: Buffer, accounts: string[]): DecodedIx | null {
  const names: Record<number, string> = {
    0: "Create",
    1: "CreateIdempotent",
    2: "RecoverNested",
  };
  const tag = data.length === 0 ? 0 : data.readUInt8(0);
  const name = names[tag];
  if (!name) return null;
  return {
    program: "Associated Token Account",
    name,
    args: {},
    accounts: roles(ATA_ROLES, accounts),
  };
}

// ---------------------------------------------------------------- public

/**
 * Decodes one instruction, or returns null when the program isn't one of the
 * natives or the discriminant isn't recognised.
 *
 * `accounts` are the instruction's account pubkeys in order; pass an empty
 * array to decode args alone.
 */
export function decodeNativeIx(
  programId: string,
  dataBase64: string,
  accounts: string[] = [],
): DecodedIx | null {
  let data: Buffer;
  try {
    data = Buffer.from(dataBase64, "base64");
  } catch {
    return null;
  }

  switch (programId) {
    case SYSTEM_PROGRAM_ID:
      return decodeSystem(data, accounts);
    case TOKEN_PROGRAM_ID:
      return decodeToken(data, accounts, false);
    case TOKEN_2022_PROGRAM_ID:
      return decodeToken(data, accounts, true);
    case ATA_PROGRAM_ID:
      return decodeAta(data, accounts);
    default:
      return null;
  }
}

/** True when `decodeNativeIx` could plausibly say something about this program. */
export function isNativeProgram(programId: string): boolean {
  return (
    programId === SYSTEM_PROGRAM_ID ||
    programId === TOKEN_PROGRAM_ID ||
    programId === TOKEN_2022_PROGRAM_ID ||
    programId === ATA_PROGRAM_ID
  );
}

/** One-line rendering, e.g. `SPL Token TransferChecked  amount=1500 decimals=6`. */
export function formatDecodedIx(ix: DecodedIx): string {
  const args = Object.entries(ix.args)
    .filter(([, v]) => v !== null)
    .map(([k, v]) => `${k}=${v}`)
    .join(" ");
  return `${ix.program} ${ix.name}${args ? `  ${args}` : ""}${ix.truncated ? "  (args not fully decoded)" : ""}`;
}
