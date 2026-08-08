const anchor = require("@anchor-lang/core");
const fs = require("fs");
const os = require("os");
const { Keypair, Transaction, Connection, sendAndConfirmTransaction } = require("@solana/web3.js");

async function main() {
  const keypairFile = fs.readFileSync(os.homedir() + "/.config/solana/id.json");
  const keypair = Keypair.fromSecretKey(Buffer.from(JSON.parse(keypairFile)));
  const wallet = new anchor.Wallet(keypair);

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed", skipPreflight: true });
  anchor.setProvider(provider);

  const idl = require("./counter-example/basics/counter/anchor/target/idl/counter_anchor.json");
  idl.address = "3Sizn8R7A1SGkAfnC8qww4xKWTdbUkwZRsS8AXQy6L9f";
  const program = new anchor.Program(idl, provider);

  const counterKeypair = Keypair.generate();
  console.log("Sending Initialize...");
  const tx1 = await program.methods.initializeCounter().accounts({ counter: counterKeypair.publicKey, payer: keypair.publicKey }).signers([counterKeypair]).rpc();
  console.log("Initialize:", tx1);

  console.log("Sending first Increment (Success)...");
  const tx2 = await program.methods.increment().accounts({ counter: counterKeypair.publicKey }).rpc();
  console.log("Increment 1:", tx2);

  console.log("Sending second Increment (Fails on-chain)...");
  const ix = await program.methods.increment().accounts({ counter: counterKeypair.publicKey }).instruction();
  const tx = new Transaction().add(ix);
  tx.feePayer = keypair.publicKey;
  
  // Wait a second to ensure a new blockhash
  await new Promise(r => setTimeout(r, 1000));
  
  tx.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
  tx.sign(keypair);

  try {
      const signature = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true });
      console.log("FAILED TX SIGNATURE SENT:", signature);
      
      // Wait for confirmation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      }, "confirmed");
      console.log("FAILED TX FULLY CONFIRMED ON LEDGER!");
  } catch (err) {
      console.log("Error confirming:", err.message);
  }
}

main().catch(console.error);
