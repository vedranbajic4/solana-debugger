//! PoC 2 — slice index out of bounds.
//!
//! Failure class: Rust panic from a bounds check in the standard library.
//! The faulting instruction is inside `core::panicking`, so the frame the
//! developer actually cares about is the *caller*. A debugger that only
//! reports the innermost frame will point at `panicking.rs` and be useless;
//! this PoC exists to check that the call chain is walked back to
//! `tier_for_level`.
//!
//! Trigger: pass a single byte >= 4 as instruction data.
//!   accounts: none
//!   data:     [0x09]

use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg,
    program_error::ProgramError, pubkey::Pubkey,
};

entrypoint!(process_instruction);

/// Fee in basis points for each of the four supported tiers.
const TIER_FEE_BPS: [u16; 4] = [500, 250, 100, 25];

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("poc-index-oob: entry");

    let level = *instruction_data
        .first()
        .ok_or(ProgramError::InvalidInstructionData)?;
    msg!("poc-index-oob: requested tier level {}", level);

    let fee = tier_for_level(level);
    let charged = charge(10_000, fee);

    msg!("poc-index-oob: fee {} bps, charged {}", fee, charged);
    Ok(())
}

/// Looks up the fee for a tier level.
fn tier_for_level(level: u8) -> u16 {
    // BUG: `level` is caller-controlled and never range-checked against
    // TIER_FEE_BPS.len(). Any value >= 4 panics here with
    // "index out of bounds: the len is 4 but the index is N".
    //
    // The fix would be `TIER_FEE_BPS.get(level as usize).copied()`, but the
    // point of this program is to fail.
    TIER_FEE_BPS[level as usize]
}

fn charge(amount: u64, fee_bps: u16) -> u64 {
    amount * fee_bps as u64 / 10_000
}
