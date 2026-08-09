//! PoC 1 — unchecked arithmetic overflow.
//!
//! Failure class: Rust panic raised by an overflow check the compiler inserts
//! because the release profile sets `overflow-checks = true`. The VM aborts
//! and the runtime reports `Program failed to complete`.
//!
//! The overflow happens inside `apply_deposit`, two frames below the
//! entrypoint, and only on the *second* transaction -- the first one sets the
//! balance and succeeds. That pairing is the point: a success and a failure
//! against the same program and the same account, so the two traces can be
//! diffed.
//!
//! Instructions:
//!   [0x00] + u64 LE   SetBalance -- writes the balance, always succeeds
//!   [0x01] + u64 LE   Deposit    -- adds to the balance, panics on overflow
//!
//! Trigger:
//!   accounts: [0] vault (writable, 8 bytes, owned by this program)
//!   tx 1 data: 0x00 || u64::MAX - 1
//!   tx 2 data: 0x01 || 1000        -> overflow panic

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

/// Layout of the vault account this program owns: a single little-endian u64.
const BALANCE_LEN: usize = 8;

const IX_SET_BALANCE: u8 = 0;
const IX_DEPOSIT: u8 = 1;

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("poc-arith-overflow: entry");

    let account_iter = &mut accounts.iter();
    let vault = next_account_info(account_iter)?;

    if vault.owner != program_id {
        msg!("poc-arith-overflow: vault owned by {}", vault.owner);
        return Err(ProgramError::IllegalOwner);
    }

    let (tag, amount) = parse_instruction(instruction_data)?;

    match tag {
        IX_SET_BALANCE => {
            msg!("poc-arith-overflow: setting balance to {}", amount);
            write_balance(vault, amount)?;
            Ok(())
        }
        IX_DEPOSIT => {
            msg!("poc-arith-overflow: depositing {}", amount);
            let new_balance = apply_deposit(vault, amount)?;
            msg!("poc-arith-overflow: new balance {}", new_balance);
            Ok(())
        }
        _ => Err(ProgramError::InvalidInstructionData),
    }
}

/// Splits the payload into a one-byte tag and a little-endian u64 operand.
fn parse_instruction(instruction_data: &[u8]) -> Result<(u8, u64), ProgramError> {
    if instruction_data.len() < 9 {
        return Err(ProgramError::InvalidInstructionData);
    }
    let bytes: [u8; 8] = instruction_data[1..9]
        .try_into()
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    Ok((instruction_data[0], u64::from_le_bytes(bytes)))
}

/// Adds `amount` to the vault balance and writes it back.
fn apply_deposit(vault: &AccountInfo, amount: u64) -> Result<u64, ProgramError> {
    let current = read_balance(vault)?;

    // BUG: plain `+` on two values that are both, in effect, caller-controlled.
    //
    // With `overflow-checks = true` this panics rather than wrapping, so a
    // vault holding u64::MAX - 1 plus a deposit of 1000 lands the debugger on
    // exactly this line. The fix would be `checked_add`.
    let updated = current + amount;

    write_balance(vault, updated)?;
    Ok(updated)
}

fn read_balance(vault: &AccountInfo) -> Result<u64, ProgramError> {
    let data = vault.try_borrow_data()?;
    if data.len() < BALANCE_LEN {
        return Err(ProgramError::AccountDataTooSmall);
    }
    let bytes: [u8; BALANCE_LEN] = data[..BALANCE_LEN]
        .try_into()
        .map_err(|_| ProgramError::InvalidAccountData)?;
    Ok(u64::from_le_bytes(bytes))
}

fn write_balance(vault: &AccountInfo, value: u64) -> Result<(), ProgramError> {
    let mut data = vault.try_borrow_mut_data()?;
    if data.len() < BALANCE_LEN {
        return Err(ProgramError::AccountDataTooSmall);
    }
    data[..BALANCE_LEN].copy_from_slice(&value.to_le_bytes());
    Ok(())
}
