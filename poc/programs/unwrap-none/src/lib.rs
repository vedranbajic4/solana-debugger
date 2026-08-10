//! PoC 3 — `Option::unwrap()` on `None`, reached through an inlined helper.
//!
//! Failure class: Rust panic. Interesting because `lookup_route` is small
//! enough that LLVM inlines it into the caller at opt-level 1. The DWARF
//! records that as an inlined subroutine, so a naive PC -> line lookup returns
//! the *caller's* line while the correct answer is a two-entry inline chain.
//!
//! Trigger: pass a route id that is not in the table.
//!   accounts: none
//!   data:     [0xFF]

use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg,
    program_error::ProgramError, pubkey::Pubkey,
};

entrypoint!(process_instruction);

/// (route id, hop count) pairs for the routes this program knows about.
const ROUTES: [(u8, u8); 3] = [(1, 2), (2, 3), (7, 1)];

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("poc-unwrap-none: entry");

    let route_id = *instruction_data
        .first()
        .ok_or(ProgramError::InvalidInstructionData)?;
    msg!("poc-unwrap-none: resolving route {}", route_id);

    let hops = resolve_hops(route_id);

    msg!("poc-unwrap-none: route has {} hops", hops);
    Ok(())
}

fn resolve_hops(route_id: u8) -> u8 {
    // BUG: `lookup_route` returns None for any unknown id and this unwraps it
    // unconditionally. Small enough that it inlines, which is the whole point
    // of this PoC -- the reported frame must be the inline chain
    // `lookup_route` -> `resolve_hops`, not just `resolve_hops`.
    lookup_route(route_id).unwrap()
}

#[inline]
fn lookup_route(route_id: u8) -> Option<u8> {
    let mut i = 0;
    while i < ROUTES.len() {
        if ROUTES[i].0 == route_id {
            return Some(ROUTES[i].1);
        }
        i += 1;
    }
    None
}
