import type { Program } from '@anchor-lang/core';
import * as anchor from '@anchor-lang/core';
import { Keypair } from '@solana/web3.js';
import { assert } from 'chai';
import type { CounterAnchor } from '../target/types/counter_anchor.ts';

describe('Anchor: Counter', () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const payer = provider.wallet as anchor.Wallet;

    const program = anchor.workspace.CounterAnchor as Program<CounterAnchor>;

    // Generate a new keypair for the counter account
    const counterKeypair = new Keypair();

    it('Initialize Counter', async () => {
        const tx = await program.methods
            .initializeCounter()
            .accounts({
                counter: counterKeypair.publicKey,
                payer: payer.publicKey,
            })
            .signers([counterKeypair])
            .rpc();
        console.log("Initialize TX Signature:", tx);

        const currentCount = await program.account.counter.fetch(counterKeypair.publicKey);

        assert(currentCount.count.toNumber() === 0, 'Expected initialized count to be 0');
    });

    it('Increment Counter', async () => {
        const tx = await program.methods.increment().accounts({ counter: counterKeypair.publicKey }).rpc();
        console.log("Increment TX Signature:", tx);

        const currentCount = await program.account.counter.fetch(counterKeypair.publicKey);

        assert(currentCount.count.toNumber() === 1, 'Expected  count to be 1');
    });

    it('Increment Counter Again (Fails)', async () => {
        let signature = "";
        try {
            const tx = new anchor.web3.Transaction().add(
                await program.methods.increment().accounts({ counter: counterKeypair.publicKey }).instruction()
            );
            signature = await provider.connection.sendTransaction(tx, [payer], { skipPreflight: true });
            console.log("Failing TX Signature:", signature);
            // We expect this to fail on chain!
            await provider.connection.confirmTransaction(signature, "confirmed");
        } catch (err) {
            console.log("Failing TX Signature (caught):", signature);
        }

        assert(currentCount.count.toNumber() === 2, 'Expected  count to be 2');
    });
});
