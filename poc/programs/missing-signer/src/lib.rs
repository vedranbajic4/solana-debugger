//! PoC 5 — clean error return, no panic.
//!
//! Failure class: the program returns `Err(..)` and the runtime reports a
//! `Custom(1)` instruction error. Nothing aborts, no panic message is logged,
//! and the VM exits normally through `exit`.
//!
//! This is the control case for the other PoCs. Everything else here dies via
//! `abort`; a debugger tuned only to panics will find nothing to report on
//! this one, yet the transaction still failed and the developer still needs to
//! be shown *which* `return Err` fired. There are three of them.
//!
//! Trigger: pass the authority account as a non-signer.
//!   accounts: [0] vault (writable), [1] authority (read-only, NOT a signer)
//!   data:     [0x00]

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

/// Errors this program can return. The runtime surfaces these as
/// `Custom(<discriminant>)` in the transaction result.
#[derive(Debug, Clone, Copy)]
pub enum VaultError {
    /// The authority account did not sign the transaction.
    MissingAuthoritySignature = 1,
    /// The vault is not owned by this program.
    WrongVaultOwner = 2,
    /// The vault account is not marked writable.
    VaultNotWritable = 3,
}

impl From<VaultError> for ProgramError {
    fn from(e: VaultError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("poc-missing-signer: entry");

    let account_iter = &mut accounts.iter();
    let vault = next_account_info(account_iter)?;
    let authority = next_account_info(account_iter)?;

    authorize(program_id, vault, authority)?;

    msg!("poc-missing-signer: authorized");
    Ok(())
}

/// Checks the three preconditions for touching the vault.
fn authorize(
    program_id: &Pubkey,
    vault: &AccountInfo,
    authority: &AccountInfo,
) -> Result<(), ProgramError> {
    if !authority.is_signer {
        msg!("poc-missing-signer: {} did not sign", authority.key);
        return Err(VaultError::MissingAuthoritySignature.into());
    }

    if vault.owner != program_id {
        msg!("poc-missing-signer: vault owned by {}", vault.owner);
        return Err(VaultError::WrongVaultOwner.into());
    }

    if !vault.is_writable {
        return Err(VaultError::VaultNotWritable.into());
    }

    Ok(())
}
