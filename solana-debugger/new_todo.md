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
[x] rule engine scaffold
    lib/rules.ts — pure (report) => Finding | null, no network, no ordering
    dependencies. Findings carry evidence + coarse confidence; a throwing rule
    is a silent no-op so a bad heuristic can't cost the facts it decorated.
    Surfaced as DebugReport.findings and as the CLI's LIKELY CAUSE section.
[x] first 8 rules
    compute-exhausted, compute-near-limit, slippage-exceeded, missing-signer,
    pda-seeds-mismatch, already-initialized, insufficient-balance,
    attribution-uncertain.
    Live on the corpus: 5/12 failures diagnosed, 0 false positives on the 8
    successful txs. The 7 undiagnosed are custom codes from programs with no
    published IDL — the code is a bare number there, so any diagnosis would be
    invention. That number goes up with IDL coverage, not with more rules.
[x] counterfactual battery (CU / balance / time / account)
    lib/counterfactual.ts + `npm run whatif <SIG>`. Four probes: raise the
    compute limit, +10 SOL to every writable account, 10x every token balance,
    advance the clock an hour. One variable at a time, re-seeded between runs,
    and every result gated on the baseline reproducing mainnet first — otherwise
    "more compute fixed it" is a claim about the fork, not the transaction.
    Verified both directions: a slippage failure correctly reports no-change on
    all four (price movement isn't a resource problem), while a real
    ComputationalBudgetExceeded tx reports the compute probe got past the wall
    and revealed the next failure. A battery that only ever says "no change"
    would prove nothing, so the positive case matters.
    Time only moves forward — surfnet can't answer "what if this ran earlier".
[x] instruction bisect
    lib/bisect.ts + `npm run whatif <SIG> -- --bisect`. Greedy minimization
    rather than binary search: the failure isn't monotone in the prefix (setup
    in the middle can matter while earlier instructions don't), and O(n) sims
    is cheap at real instruction counts. Compares failures by payload, not by
    InstructionError[0], since dropping an earlier instruction shifts the index.
    Gated on the rebuilt-but-unminimized tx reproducing first — decompiling and
    recompiling reorders account keys, so if that alone changes the outcome the
    minimization is meaningless and it says so.
    Live: a 7-instruction slippage tx -> 3 needed; a 10-instruction one -> 1.
[x] CLI renderer + --json
    fetch-tx.ts is now a pure renderer over buildDebugReport — its duplicate
    GATHER block is gone, so --json and the text are the same conclusions.
    Default tier byte-for-byte as before (442 vs 445 bytes); --verbose gains a
    CALL TREE section, self-CU-per-program, and decoded instruction args, so a
    failing swap now reads "pump_amm sell base_amount_in=23101
    min_quote_amount_out=18351529" next to its ExceededSlippage.
[x] end-to-end on the 0xdead tx
    Transcripts checked in: demo-no-idl.txt (the 0xdead tx) and demo-full.txt
    (a pump.fun swap). Both run fetch + whatif + bisect.
    The 0xdead program publishes no IDL, so 57005 stays a number and no rule
    fires — the tool reports where, how much, and a 4->1 instruction minimal
    repro, and guesses at nothing. demo-full.txt is the contrast: IDL-resolved
    error name, decoded args, a diagnosis citing min_quote_amount_out, 7->3.
    Running it end to end found the last bug: the final surviving instruction
    was never tested for removal (nothing to remove it from) and so was
    silently omitted from the list while still being claimed as required. It
    is now listed and labelled "not tested".
    (The old demo-fetch*.txt were stale — pre-renderer — and are removed.)