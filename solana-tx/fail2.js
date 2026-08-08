const anchor = require("@coral-xyz/anchor");
const fs = require("fs");
const os = require("os");
const path = require("path");

async function main() {
  const connection = new anchor.web3.Connection("http://127.0.0.1:8899", "confirmed");
  
  const keypairPath = path.join(os.homedir(), ".config", "solana", "id.json");
  const secretKeyString = fs.readFileSync(keypairPath, { encoding: 'utf8' });
  const keypair = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKeyString)));
  const wallet = new anchor.Wallet(keypair);

  const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed", skipPreflight: true });
  anchor.setProvider(provider);

  const idlPath = "/home/vedran/dev/test_fail/target/idl/test_fail.json";
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
  
  const programId = new anchor.web3.PublicKey("2rGVCvLnDsuRzjoRfFt87f4MpBSxR5pt66PaHdueeR7m");
  idl.address = programId.toBase58();
  
  const program = new anchor.Program(idl, provider);

  const amount = new anchor.BN(500);
  const ix = await program.methods.triggerError(amount).instruction();
  
  const tx = new anchor.web3.Transaction().add(ix);
  const latestBlockhash = await connection.getLatestBlockhash();
  tx.recentBlockhash = latestBlockhash.blockhash;
  tx.feePayer = keypair.publicKey;
  
  console.log("Sending with skipPreflight: true ...");
  try {
    const signature = await provider.connection.sendTransaction(tx, [keypair], {
      skipPreflight: false,
      maxRetries: 5,
    });
    
    console.log("Signature:", signature);
    console.log("Confirming...");
    
    await provider.connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature: signature,
    }, "confirmed");
    
    console.log("Confirmed!");
    
  } catch (e) {
    console.log("Caught error (likely transaction failed on-chain):", e.message);
  }
}

main().catch(console.error);
