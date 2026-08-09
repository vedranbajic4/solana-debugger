//! PoC 6 — compute budget exhaustion.
//!
//! Failure class: neither a panic nor an `Err` return. The VM stops mid-
//! instruction when the compute meter hits zero and the runtime reports
//! `exceeded CUs meter at BPF instruction #N`.
//!
//! This is the hardest case for a source-mapping debugger and the reason this
//! PoC exists. There is no panic message, no error code, and -- measured on
//! agave 3.1.10 -- not even a program counter: the log line ends at
//! "exceeded CUs meter at BPF instruction" with the number omitted. The
//! location has to be recovered by replaying the transaction and watching
//! where the meter runs out, which is strictly harder than reading a log.
//!
//! Trigger: pass an iteration count high enough to blow the 200k CU default.
//!   accounts: none
//!   data:     u32 LE iteration count, e.g. [0x40, 0x9C, 0x00, 0x00] = 40000

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
    msg!("poc-compute-exhaust: entry");

    if instruction_data.len() < 4 {
        return Err(ProgramError::InvalidInstructionData);
    }
    let bytes: [u8; 4] = instruction_data[..4]
        .try_into()
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    let rounds = u32::from_le_bytes(bytes);

    msg!("poc-compute-exhaust: hashing {} rounds", rounds);

    let digest = mix_rounds(rounds);

    // Never reached for large `rounds` -- the meter runs out inside the loop.
    msg!("poc-compute-exhaust: digest {}", digest);
    Ok(())
}

/// BUG: the iteration count is caller-controlled and unbounded. A real program
/// would clamp it, or charge the caller per round. Here it just runs until the
/// VM cuts it off.
fn mix_rounds(rounds: u32) -> u64 {
    let mut acc: u64 = 0x243F_6A88_85A3_08D3;
    let mut i: u32 = 0;
    while i < rounds {
        acc = mix(acc, i as u64);
        i += 1;
    }
    acc
}

/// One round of a cheap integer mixer. Deliberately not inlined so the loop
/// body shows up as its own frame in the line table.
#[inline(never)]
fn mix(acc: u64, counter: u64) -> u64 {
    let mut x = acc ^ counter.rotate_left(17);
    x = x.wrapping_mul(0x9E37_79B9_7F4A_7C15);
    x ^= x >> 31;
    x.wrapping_add(counter)
}
