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
  // Newer anchor versions use address instead of passing programId separately in constructor sometimes, 
  // but let's safely override the idl address
  idl.address = programId.toBase58();
  
  const program = new anchor.Program(idl, provider);

  console.log("Sending a failing transaction to Program ID:", programId.toBase58());

  const amount = new anchor.BN(500); // Trigger the panic (amount > 100)
  const ix = await program.methods.triggerError(amount).instruction();
  
  const tx = new anchor.web3.Transaction().add(ix);
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = keypair.publicKey;
  
  console.log("Sending with skipPreflight: true ...");
  try {
    const signature = await provider.connection.sendTransaction(tx, [keypair], {
      skipPreflight: true,
    });
    
    console.log("==========================================");
    console.log("FAILED TRANSACTION SIGNATURE:");
    console.log(signature);
    console.log("==========================================");
    
  } catch (e) {
    console.log("Caught error:", e);
  }
}

main().catch(console.error);
