[x] verify-replay.ts + 20-tx corpus, report match rate
    60% overall / 50% failed / 75% success (was 40/33/50 before the fixes below).
    Found and fixed 3 systematic replay bugs: durable-nonce txs destroyed by
    replaceRecentBlockhash, accounts the tx creates already existing on the fork,
    and rebuilt wSOL accounts missing is_native. Residual mismatches are all
    program-owned state divergence -> item 2.
[~] historical account injection via setAccount
    lib/archive.ts + wired into lib/replay.ts, off by default via ARCHIVE_RPC.
    No standard RPC serves account state at a slot; needs a provider extension
    (Alchemy Account Archive: getAccountInfo + lastUpdateBeforeSlot). Probe
    refuses endpoints that silently ignore the param and return present-day
    state. Path is covered by npm run test:archive against a mock.
    BLOCKED on a real archive endpoint to measure the match-rate gain.
    Known limit: surfnet_setAccount can update but not create, so accounts
    closed since the tx are unrestorable either way.
[ ] program pinning at historical slot
[ ] DebugReport type definition
[ ] log parser → CPI tree
[ ] self-CU attribution + deepest-failed-frame
[ ] ALT resolution for v0 txs
[ ] IDL fetch (on-chain PDA + zlib inflate)
[ ] IDL cache + negative cache
[ ] native program decoders (System/Token/T22/ATA)
[ ] instruction arg decoder (discriminator + borsh)
[ ] account struct decoder
[ ] error tables: TransactionError / InstructionError / Anchor ranges
[ ] IDL 6000+ error lookup
[ ] pre/post account snapshot + field-level diff
[ ] rule engine scaffold
[ ] first 8 rules
[ ] counterfactual battery (CU / balance / time / account)
[ ] instruction bisect
[ ] CLI renderer + --json
[ ] end-to-end on the 0xdead tx