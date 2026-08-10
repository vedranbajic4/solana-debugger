//! PoC 4 — explicit invariant violation (`assert_eq!`) at the bottom of a
//! deliberately deep call chain.
//!
//! Failure class: Rust panic with a formatted message. This is the "known
//! good" case for a source-mapping debugger: the panic site is our own code,
//! the message is distinctive, and the stack is five frames deep:
//!
//!   process_instruction -> settle -> check_conservation
//!                                 -> net_positions -> fold_leg
//!
//! Use it to verify the debugger reconstructs the whole chain, not just the
//! top and bottom frame.
//!
//! Trigger: four bytes, not all zero.
//!   accounts: none
//!   data:     [0x01, 0x02, 0x03, 0x04]   -> nets to 0, legs sum to 10, panics
//!
//! Note that `[0, 0, 0, 0]` is the one payload that *succeeds*: the sign bug
//! below is invisible when every leg is zero. That is useful for producing a
//! passing transaction to diff against the failing one.

use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg,
    program_error::ProgramError, pubkey::Pubkey,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("poc-assert-invariant: entry");

    if instruction_data.len() < 4 {
        return Err(ProgramError::InvalidInstructionData);
    }

    let legs: Vec<i64> = instruction_data[..4].iter().map(|b| *b as i64).collect();
    msg!("poc-assert-invariant: settling {} legs", legs.len());

    let net = settle(&legs);

    msg!("poc-assert-invariant: net {}", net);
    Ok(())
}

fn settle(legs: &[i64]) -> i64 {
    let net = net_positions(legs);
    check_conservation(legs, net);
    net
}

fn net_positions(legs: &[i64]) -> i64 {
    let mut acc = 0i64;
    for (idx, leg) in legs.iter().enumerate() {
        acc = fold_leg(acc, *leg, idx);
    }
    acc
}

/// Folds one leg into the running total.
fn fold_leg(acc: i64, leg: i64, idx: usize) -> i64 {
    // BUG: legs at an odd index are meant to be liabilities and subtracted,
    // so this should be `acc - leg`. The negation is applied to the
    // accumulator instead, which discards every leg folded so far.
    if idx % 2 == 1 {
        -acc + leg
    } else {
        acc + leg
    }
}

/// Invariant: netting must not create or destroy value.
fn check_conservation(legs: &[i64], net: i64) {
    let expected: i64 = legs.iter().sum();
    assert_eq!(
        net, expected,
        "conservation violated: netted {} but legs sum to {}",
        net, expected
    );
}
