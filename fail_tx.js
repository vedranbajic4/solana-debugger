const anchor = require("@coral-xyz/anchor");
const fs = require("fs");
const os = require("os");

async function main() {
  const keypairFile = fs.readFileSync(os.homedir() + "/.config/solana/id.json");
  const keypair = anchor.web3.Keypair.fromSecretKey(Buffer.from(JSON.parse(keypairFile)));
  const wallet = new anchor.Wallet(keypair);

  const connection = new anchor.web3.Connection("http://127.0.0.1:8899", "confirmed");
  const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed", skipPreflight: true });
  anchor.setProvider(provider);

  const idl = require("./counter-example/basics/counter/anchor/target/idl/counter_anchor.json");
  idl.address = "3Sizn8R7A1SGkAfnC8qww4xKWTdbUkwZRsS8AXQy6L9f"; // New Program ID
  const program = new anchor.Program(idl, provider);

  // Generate a new counter keypair
  const counterKeypair = anchor.web3.Keypair.generate();

  console.log("Sending Initialize...");
  const tx1 = await program.methods
      .initializeCounter()
      .accounts({ counter: counterKeypair.publicKey, payer: keypair.publicKey })
      .signers([counterKeypair])
      .rpc();
  console.log("Initialize:", tx1);

  console.log("Sending first Increment (Success)...");
  const tx2 = await program.methods
      .increment()
      .accounts({ counter: counterKeypair.publicKey })
      .rpc();
  console.log("Increment 1:", tx2);

  console.log("Sending second Increment (Fails on-chain)...");
  const ix = await program.methods.increment().accounts({ counter: counterKeypair.publicKey }).instruction();
  const tx = new anchor.web3.Transaction().add(ix);
  
  try {
      const signature = await provider.connection.sendTransaction(tx, [keypair], { skipPreflight: true });
      console.log("FAILED TX SIGNATURE:", signature);
  } catch (err) {
      console.log("Error sending:", err);
  }
}

main().catch(console.error);
