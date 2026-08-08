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
    (An earlier note here claimed surfnet_setAccount cannot create accounts,
    so closed accounts were unrestorable. That was wrong — it was a transient
    RPC failure surfacing as AccountNotFound. Creation works; accounts closed
    since the tx ARE restorable by both seeding and archive injection.)
[ ] program pinning at historical slot
    BLOCKED, twice: needs the program's bytecode at the tx's slot (same missing
    archive endpoint as item 2), and writing executable accounts onto the fork
    breaks its loader, which is why lib/archive.ts skips them.
[x] DebugReport type definition
    lib/report.ts. Serializable by construction; attribution basis + warnings
    travel with the conclusions. Verified on all 20 corpus txs (npm run
    test:report -- --all): 12 failed, 12 attributed from logs, 2 via CPI.
[x] log parser → CPI tree
    lib/cpi-tree.ts, tolerant of truncated logs. Live-checked against the
    corpus: tree compute reconciles with meta.computeUnitsConsumed.
[x] self-CU attribution + deepest-failed-frame
    selfCu = consumed - children; deepestFailedFrame() agrees with
    findFailingProgramInLogs on every corpus tx that has a failure line.
[x] ALT resolution for v0 txs
    Already done: normalizeInstructions() resolves meta.loadedAddresses.
[x] IDL fetch (on-chain PDA + zlib inflate)
    Already done: tryFetchAnchorIdl() in lib/errors.ts.
[x] IDL cache + negative cache
    lib/idl-cache.ts, disk-backed under .idl-cache/ (gitignored) so it survives
    between CLI invocations. Asymmetric TTLs: hits 7d, misses 1h, since a miss
    is only true until someone uploads an IDL. Measured on the corpus: 8 cached
    programs, 6 of them confirmed absences — the negative cache carries most of
    the benefit, as expected.
[x] native program decoders (System/Token/T22/ATA)
    lib/native-decoders.ts, surfaced on DebugReport.instructions[].decoded.
    Decodes 104/104 native instructions across the corpus with no unrecognised
    discriminants. Unknown discriminant returns null rather than a guess.
[x] instruction arg decoder (discriminator + borsh)
    lib/borsh.ts (hand-rolled reader, no anchor dep) + lib/idl-decode.ts.
    Handles legacy and 0.30+ IDL shapes: explicit discriminators when present,
    sha256("global:"+snake_case) when not. Wired into
    DebugReport.instructions[].decoded behind the native decoders.
    Live: 8/12 non-native corpus instructions matched an IDL discriminator;
    4/15 corpus programs publish an IDL at all.
[x] account struct decoder
    decodeIdlAccount() in lib/idl-decode.ts, by account discriminator, with
    the 0.30+ layout-in-`types` indirection handled. Not yet consumed by the
    account diff — that's item 15's field-level half.
[x] error tables: TransactionError / InstructionError / Anchor ranges
    lib/runtime-errors.ts — 38 transaction + 53 instruction entries, 26 with a
    practical cause, surfaced as DebugReport.error.runtimeExplanation and in
    headline(). Anchor ranges already existed in lib/anchor-errors.ts.
    Coverage is checked against recent mainnet BLOCKS, not the corpus: the
    corpus selects for token movement and CPIs, so all 12 of its failures are
    custom errors and it exercises these tables not at all.
[x] IDL 6000+ error lookup
    Already done: resolveCustomError() matches idl.errors by code.
[x] pre/post account snapshot + field-level diff
    Snapshot/diff already existed in lib/accounts.ts; lib/field-diff.ts adds the
    field-level half, decoding both sides with the owning program's IDL so
    "412 bytes changed at offset 8" becomes named field deltas. Wired into the
    replay path. Cross-checks itself: if bytes moved but no field differs, the
    layout is wrong and it says so rather than reporting a confident nothing.
[ ] rule engine scaffold
[ ] first 8 rules
[ ] counterfactual battery (CU / balance / time / account)
[ ] instruction bisect
[x] CLI renderer + --json
    fetch-tx.ts is now a pure renderer over buildDebugReport — its duplicate
    GATHER block is gone, so --json and the text are the same conclusions.
    Default tier byte-for-byte as before (442 vs 445 bytes); --verbose gains a
    CALL TREE section, self-CU-per-program, and decoded instruction args, so a
    failing swap now reads "pump_amm sell base_amount_in=23101
    min_quote_amount_out=18351529" next to its ExceededSlippage.
[ ] end-to-end on the 0xdead tx