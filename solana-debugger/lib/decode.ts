import bs58 from "bs58";
import type { PublicKey, VersionedTransactionResponse } from "@solana/web3.js";

export type NormalizedIx = {
  programId: string;
  accounts: { pubkey: string; signer: boolean; writable: boolean }[];
  dataBase64: string;
};

export function normalizeInstructions(
  tx: VersionedTransactionResponse,
): NormalizedIx[] {
  const msg = tx.transaction.message;
  const loaded = tx.meta?.loadedAddresses;

  if (tx.version === "legacy") {
    const keys = (msg as any).accountKeys || ([] as PublicKey[]);
    return (msg as any).instructions.map((ix: any) => ({
      programId: keys[ix.programIdIndex].toBase58(),
      accounts: ix.accounts.map((i: number) => ({
        pubkey: keys[i].toBase58(),
        signer: i < msg.header.numRequiredSignatures,
        writable: (msg as any).isAccountWritable(i),
      })),
      dataBase64: Buffer.from(bs58.decode(ix.data)).toString("base64"),
    }));
  }

  // v0
  const m = msg as any; // MessageV0
  const staticKeys = m.staticAccountKeys.map((k: PublicKey) => k.toBase58());
  const allKeys = [
    ...staticKeys,
    ...(loaded?.writable.map((k) => k.toBase58()) ?? []),
    ...(loaded?.readonly.map((k) => k.toBase58()) ?? []),
  ];
  const numWritableLoaded = loaded?.writable.length ?? 0;

  return m.compiledInstructions.map((ix: any) => ({
    programId: allKeys[ix.programIdIndex],
    accounts: ix.accountKeyIndexes.map((i: number) => ({
      pubkey: allKeys[i],
      signer: i < msg.header.numRequiredSignatures,
      writable:
        i < staticKeys.length
          ? m.isAccountWritable(i)
          : i - staticKeys.length < numWritableLoaded,
    })),
    dataBase64: Buffer.from(ix.data).toString("base64"),
  }));
}

export function decodeComputeBudgetIx(dataBase64: string) {
  const data = Buffer.from(dataBase64, "base64");
  switch (data.readUInt8(0)) {
    case 0:
      return {
        type: "RequestUnits",
        units: data.readUInt32LE(1),
        additionalFee: data.readUInt32LE(5),
      };
    case 1:
      return { type: "RequestHeapFrame", bytes: data.readUInt32LE(1) };
    case 2:
      return { type: "SetComputeUnitLimit", units: data.readUInt32LE(1) };
    case 3:
      return {
        type: "SetComputeUnitPrice",
        microLamports: data.readBigUInt64LE(1),
      };
    default:
      return { type: "Unknown", discriminant: data.readUInt8(0) };
  }
}
