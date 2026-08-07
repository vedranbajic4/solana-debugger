const { 
  Connection, 
  Keypair, 
  SystemProgram, 
  Transaction, 
  sendAndConfirmTransaction, 
} = require("@solana/web3.js");
const fs = require("fs");
const os = require("os");
const path = require("path");

async function main() {
  // 1. Connect to the local validator
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  // 2. Load the wallet we just created
  const keypairPath = path.join(os.homedir(), ".config", "solana", "id.json");
  const secretKeyString = fs.readFileSync(keypairPath, { encoding: 'utf8' });
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  const senderKeypair = Keypair.fromSecretKey(secretKey);

  // 3. Generate a random recipient wallet
  const recipient = Keypair.generate().publicKey;

  console.log(`Sending SOL from: ${senderKeypair.publicKey.toBase58()}`);
  
  // 4. Create the transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: senderKeypair.publicKey,
      toPubkey: recipient,
      lamports: 1000000, // 0.001 SOL (1 SOL = 1 billion lamports)
    })
  );

  // 5. Sign, send, and confirm
  const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);
  console.log("Transaction successful! Signature:", signature);
}

main().catch(console.error);