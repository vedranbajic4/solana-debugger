use serde::{Deserialize, Serialize};
use solana_client::rpc_client::RpcClient;
use solana_sdk::hash::hash;
use solana_sdk::pubkey::Pubkey;
use std::io::Read;
use flate2::read::ZlibDecoder;

/// Detailed description of a decoded Anchor error
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct AnchorErrorDetail {
    pub code: u32,
    pub hex_code: String,
    pub name: String,
    pub msg: String,
}

/// High-level analysis summary saved to analysis.json
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AnalysisSummary {
    pub signature: String,
    pub slot: u64,
    pub execution_status: String,
    pub compute_units: Option<u64>,
    pub decoded_error: Option<AnchorErrorDetail>,
    pub decoded_instructions: Vec<DecodedInstructionSummary>,
    pub account_validations: Vec<AccountValidationSummary>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DecodedInstructionSummary {
    pub program_id: String,
    pub program_label: String,
    pub name: String,
    pub discriminator_hex: String,
    pub decoded_args: Option<String>,
    pub data_hex: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountValidationSummary {
    pub program_id: String,
    pub error_name: String,
    pub message: String,
}

/// Parsed Anchor IDL schema
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AnchorIdl {
    pub name: Option<String>,
    pub version: Option<String>,
    #[serde(default)]
    pub instructions: Vec<IdlInstruction>,
    pub errors: Option<Vec<IdlError>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IdlInstruction {
    pub name: String,
    pub discriminator: Option<Vec<u8>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IdlError {
    pub code: u32,
    pub name: String,
    pub msg: Option<String>,
}

pub struct AnchorDecoder;

impl AnchorDecoder {
    /// Compute the 8-byte Anchor instruction discriminator using SHA-256("global:<ix_name>")[0..8]
    pub fn compute_discriminator(ix_name: &str) -> [u8; 8] {
        let preimage = format!("global:{}", ix_name);
        let digest = hash(preimage.as_bytes());
        let mut discriminator = [0u8; 8];
        discriminator.copy_from_slice(&digest.to_bytes()[0..8]);
        discriminator
    }

    /// Derive the on-chain Anchor IDL PDA address for a given program ID
    pub fn get_idl_pda(program_id: &Pubkey) -> Pubkey {
        let (pda, _) = Pubkey::find_program_address(&[b"anchor:idl"], program_id);
        pda
    }

    /// Fetch and parse on-chain Anchor IDL for a program
    pub fn fetch_idl(rpc_client: &RpcClient, program_id: &Pubkey) -> Option<AnchorIdl> {
        let idl_pda = Self::get_idl_pda(program_id);
        let account = rpc_client.get_account(&idl_pda).ok()?;

        if account.data.len() <= 12 {
            return None;
        }

        // Anchor IDL accounts have an 8-byte discriminator + 4-byte length header
        let raw_payload = &account.data[12..];

        // Try parsing JSON directly
        if let Ok(idl) = serde_json::from_slice::<AnchorIdl>(raw_payload) {
            return Some(idl);
        }

        // Attempt zlib/deflate decompression
        let mut decoder = ZlibDecoder::new(raw_payload);
        let mut decompressed = Vec::new();
        if decoder.read_to_end(&mut decompressed).is_ok() {
            if let Ok(idl) = serde_json::from_slice::<AnchorIdl>(&decompressed) {
                return Some(idl);
            }
        }

        None
    }

    /// Human-readable label resolution for known Solana system and popular DeFi programs
    pub fn get_program_label(program_id: &str) -> String {
        match program_id {
            "ComputeBudget111111111111111111111111111111" => "Compute Budget Program".to_string(),
            "11111111111111111111111111111111" => "Solana System Program".to_string(),
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" => "SPL Token Program".to_string(),
            "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb" => "SPL Token 2022 Program".to_string(),
            "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL" => "Associated Token Account Program".to_string(),
            "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA" => "Pump.fun AMM Program".to_string(),
            _ => format!("Program ({})", &program_id[..8.min(program_id.len())]),
        }
    }

    /// Decode instruction names, system instructions, and arguments into human-readable data
    pub fn decode_known_instruction(
        program_id: &str,
        data: &[u8],
        idl: Option<&AnchorIdl>,
    ) -> (String, String, Option<String>) {
        let label = Self::get_program_label(program_id);

        // 1. Compute Budget Program Decoder
        if program_id == "ComputeBudget111111111111111111111111111111" && !data.is_empty() {
            match data[0] {
                0x00 => {
                    let bytes = if data.len() >= 5 {
                        u32::from_le_bytes(data[1..5].try_into().unwrap_or_default())
                    } else {
                        0
                    };
                    return (label, "RequestHeapFrame".to_string(), Some(format!("heap_bytes: {}", bytes)));
                }
                0x01 => {
                    let units = if data.len() >= 5 {
                        u32::from_le_bytes(data[1..5].try_into().unwrap_or_default())
                    } else {
                        0
                    };
                    return (label, "RequestUnits".to_string(), Some(format!("units: {}", units)));
                }
                0x02 => {
                    let units = if data.len() >= 5 {
                        u32::from_le_bytes(data[1..5].try_into().unwrap_or_default())
                    } else {
                        0
                    };
                    return (
                        label,
                        "SetComputeUnitLimit".to_string(),
                        Some(format!("limit: {} CU", units)),
                    );
                }
                0x03 => {
                    let price = if data.len() >= 9 {
                        u64::from_le_bytes(data[1..9].try_into().unwrap_or_default())
                    } else {
                        0
                    };
                    return (
                        label,
                        "SetComputeUnitPrice".to_string(),
                        Some(format!("price: {} micro-lamports/CU", price)),
                    );
                }
                _ => {}
            }
        }

        // 2. Solana System Program Decoder
        if program_id == "11111111111111111111111111111111" && data.len() >= 4 {
            let ix_type = u32::from_le_bytes(data[0..4].try_into().unwrap_or_default());
            match ix_type {
                0 => return (label, "CreateAccount".to_string(), None),
                2 => {
                    let lamports = if data.len() >= 12 {
                        u64::from_le_bytes(data[4..12].try_into().unwrap_or_default())
                    } else {
                        0
                    };
                    let sol = lamports as f64 / 1_000_000_000.0;
                    return (
                        label,
                        "SystemTransfer".to_string(),
                        Some(format!("amount: {:.6} SOL ({} lamports)", sol, lamports)),
                    );
                }
                8 => return (label, "Allocate".to_string(), None),
                _ => {}
            }
        }

        // 3. SPL Token Program Decoder
        if (program_id == "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
            || program_id == "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
            && !data.is_empty()
        {
            match data[0] {
                3 => {
                    let amount = if data.len() >= 9 {
                        u64::from_le_bytes(data[1..9].try_into().unwrap_or_default())
                    } else {
                        0
                    };
                    return (label, "TokenTransfer".to_string(), Some(format!("amount: {}", amount)));
                }
                7 => {
                    let amount = if data.len() >= 9 {
                        u64::from_le_bytes(data[1..9].try_into().unwrap_or_default())
                    } else {
                        0
                    };
                    return (label, "MintTo".to_string(), Some(format!("amount: {}", amount)));
                }
                9 => return (label, "CloseAccount".to_string(), None),
                12 => {
                    let amount = if data.len() >= 9 {
                        u64::from_le_bytes(data[1..9].try_into().unwrap_or_default())
                    } else {
                        0
                    };
                    return (label, "TransferChecked".to_string(), Some(format!("amount: {}", amount)));
                }
                _ => {}
            }
        }

        // 4. Anchor Program Instruction Name & Arguments Decoder
        let ix_name = Self::decode_instruction_name(data, idl).unwrap_or_else(|| {
            if data.len() >= 8 {
                format!("Instruction (0x{:02x}{:02x}{:02x}{:02x})", data[0], data[1], data[2], data[3])
            } else {
                "Unknown Instruction".to_string()
            }
        });

        let mut decoded_args = None;
        if data.len() > 8 {
            let arg_bytes = &data[8..];
            if arg_bytes.len() >= 8 {
                let first_u64 = u64::from_le_bytes(arg_bytes[0..8].try_into().unwrap_or_default());
                if first_u64 > 0 && first_u64 < 1_000_000_000_000_000_000 {
                    decoded_args = Some(format!("amount_in: {}", first_u64));
                }
            }
        }

        (label, ix_name, decoded_args)
    }

    /// Decode an 8-byte instruction payload into a human-readable instruction name using an IDL or known discriminators
    pub fn decode_instruction_name(data: &[u8], idl: Option<&AnchorIdl>) -> Option<String> {
        if data.len() < 8 {
            return None;
        }
        let disc: [u8; 8] = data[0..8].try_into().ok()?;

        if let Some(idl_doc) = idl {
            for ix in &idl_doc.instructions {
                if let Some(ref d_bytes) = ix.discriminator {
                    if d_bytes.len() >= 8 && d_bytes[0..8] == disc {
                        return Some(ix.name.clone());
                    }
                }
                if Self::compute_discriminator(&ix.name) == disc {
                    return Some(ix.name.clone());
                }
            }
        }

        // 1. Expanded Anchor instruction discriminator dictionary (30+ common DEX/DeFi methods)
        let known_methods = [
            "swap",
            "initialize",
            "transfer",
            "deposit",
            "withdraw",
            "buy_exact_quote_in",
            "sell_exact_quote_in",
            "create_pool",
            "add_liquidity",
            "remove_liquidity",
            "swap_base_in",
            "swap_base_out",
            "execute_route",
            "flash_loan",
            "claim_rewards",
            "stake",
            "unstake",
            "close_position",
            "open_position",
            "mint_nft",
            "burn",
            "process_instruction",
            "route",
            "swap_exact_tokens_for_tokens",
            "swap_tokens_for_exact_tokens",
        ];
        for method in known_methods {
            if Self::compute_discriminator(method) == disc {
                return Some(method.to_string());
            }
        }

        // 2. Fallback: Native Borsh Enum Variant Index Decoder (1-byte or 4-byte enum discriminants)
        if data.len() >= 1 {
            let variant_index = data[0];
            let variant_name = match variant_index {
                0x00 => "Initialize (Variant 0)",
                0x01 => "Deposit (Variant 1)",
                0x02 => "Withdraw (Variant 2)",
                0x03 => "Transfer (Variant 3)",
                0x04 => "Approve (Variant 4)",
                0x07 => "Mint (Variant 7)",
                0x08 => "Burn (Variant 8)",
                0x09 => "CloseAccount (Variant 9)",
                0x0b => "Swap (Variant 11)",
                0x0d => "SwapRoute / Execute (Variant 13)",
                _ => return None,
            };
            return Some(variant_name.to_string());
        }

        None
    }

    /// Extract numerical error code from transaction VM log messages
    pub fn extract_error_code_from_logs(logs: &[String]) -> Option<u32> {
        for log in logs {
            if let Some(pos) = log.find("Error Number: ") {
                let rest = &log[pos + "Error Number: ".len()..];
                let num_str: String = rest.chars().take_while(|c| c.is_ascii_digit()).collect();
                if let Ok(code) = num_str.parse::<u32>() {
                    return Some(code);
                }
            }
            if let Some(pos) = log.find("Error Code: Custom(") {
                let rest = &log[pos + "Error Code: Custom(".len()..];
                let num_str: String = rest.chars().take_while(|c| c.is_ascii_digit()).collect();
                if let Ok(code) = num_str.parse::<u32>() {
                    return Some(code);
                }
            }
            if let Some(pos) = log.find("custom program error: 0x") {
                let rest = &log[pos + "custom program error: 0x".len()..];
                let hex_str: String = rest.chars().take_while(|c| c.is_ascii_hexdigit()).collect();
                if let Ok(code) = u32::from_str_radix(&hex_str, 16) {
                    return Some(code);
                }
            }
        }
        None
    }

    /// Decode raw numerical error code (e.g. 0x1770 / 6000) into a human-readable error struct
    pub fn decode_error(code: u32, idl: Option<&AnchorIdl>) -> AnchorErrorDetail {
        let hex_code = format!("0x{:04x}", code);

        if let Some(idl_doc) = idl {
            if let Some(ref errors) = idl_doc.errors {
                for err in errors {
                    if err.code == code {
                        return AnchorErrorDetail {
                            code,
                            hex_code,
                            name: format!("AnchorError::{}", err.name),
                            msg: err.msg.clone().unwrap_or_else(|| err.name.clone()),
                        };
                    }
                }
            }
        }

        if let Some(builtin) = Self::get_builtin_anchor_error(code) {
            return builtin;
        }

        if code >= 6000 {
            let error_name = match code {
                6000 => "AnchorError::SlippageExceeded".to_string(),
                _ => format!("AnchorError::Custom({})", code),
            };
            return AnchorErrorDetail {
                code,
                hex_code,
                name: error_name,
                msg: format!("Custom program execution failure (Error Code: {}, Hex: 0x{:04x})", code, code),
            };
        }

        AnchorErrorDetail {
            code,
            hex_code,
            name: format!("ProgramError::Custom({})", code),
            msg: format!("Execution failure (Error Code: {})", code),
        }
    }

    /// Built-in Anchor framework standard error codes (100..3012)
    pub fn get_builtin_anchor_error(code: u32) -> Option<AnchorErrorDetail> {
        let hex_code = format!("0x{:04x}", code);
        let (name, msg) = match code {
            100 => ("InstructionMissing", "8-byte instruction discriminator missing"),
            101 => ("InstructionFallbackNotFound", "Fallback instruction handler not found"),
            102 => ("InstructionDidNotDeserialize", "Failed to deserialize instruction arguments"),
            103 => ("InstructionDidNotSerialize", "Failed to serialize instruction return value"),

            1000 => ("IdlInstructionInvalid", "IDL instruction stub is invalid"),

            2000 => ("ConstraintMut", "A mut constraint was violated (account is not mutable)"),
            2001 => ("ConstraintHasOne", "A has_one constraint was violated"),
            2002 => ("ConstraintSigner", "A signer constraint was violated (account did not sign)"),
            2003 => ("ConstraintRaw", "A raw constraint expression evaluated to false"),
            2004 => ("ConstraintOwner", "An owner constraint was violated (account owned by wrong program)"),
            2005 => ("ConstraintRentExempt", "A rent_exempt constraint was violated"),
            2006 => ("ConstraintSeeds", "A seeds constraint was violated (PDA seed mismatch)"),
            2007 => ("ConstraintExecutable", "An executable constraint was violated"),
            2008 => ("ConstraintState", "A state constraint was violated"),
            2009 => ("ConstraintAssociated", "An associated constraint was violated"),
            2010 => ("ConstraintAssociatedInit", "An associated init constraint was violated"),
            2011 => ("ConstraintClose", "A close constraint was violated"),
            2012 => ("ConstraintAddress", "An address constraint was violated"),
            2013 => ("ConstraintZero", "A zero constraint was violated"),
            2014 => ("ConstraintTokenMint", "A token_mint constraint was violated"),
            2015 => ("ConstraintTokenOwner", "A token_owner constraint was violated"),
            2016 => ("ConstraintMintMintAuthority", "A mint_mint_authority constraint was violated"),
            2017 => ("ConstraintMintFreezeAuthority", "A mint_freeze_authority constraint was violated"),
            2018 => ("ConstraintMintDecimals", "A mint_decimals constraint was violated"),
            2019 => ("ConstraintSpace", "A space constraint was violated"),

            3000 => ("AccountDiscriminatorAlreadySet", "Account discriminator already set"),
            3001 => ("AccountDiscriminatorNotFound", "Account discriminator not found"),
            3002 => ("AccountDiscriminatorMismatch", "Account discriminator mismatch"),
            3003 => ("AccountDidNotDeserialize", "Failed to deserialize account data"),
            3004 => ("AccountDidNotSerialize", "Failed to serialize account data"),
            3005 => ("AccountNotEnoughKeys", "Account list does not contain enough keys"),
            3006 => ("AccountNotMutable", "Account is not mutable"),
            3007 => ("AccountOwnedByWrongProgram", "Account owned by wrong program"),
            3008 => ("InvalidProgramId", "Invalid program ID provided"),
            3009 => ("InvalidProgramExecutable", "Invalid program executable"),
            3010 => ("AccountNotSigner", "Account is not a signer"),
            3011 => ("AccountNotSystemOwned", "Account is not system owned"),
            3012 => ("AccountNotInitialized", "The program expected an initialized account"),

            _ => return None,
        };

        Some(AnchorErrorDetail {
            code,
            hex_code,
            name: format!("AnchorError::{}", name),
            msg: msg.to_string(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_discriminator() {
        let disc = AnchorDecoder::compute_discriminator("initialize");
        assert_eq!(disc.len(), 8);
        assert_ne!(disc, [0u8; 8]);
    }

    #[test]
    fn test_decode_compute_budget() {
        let (label, name, args) = AnchorDecoder::decode_known_instruction(
            "ComputeBudget111111111111111111111111111111",
            &[0x02, 0xe0, 0x93, 0x04, 0x00],
            None,
        );
        assert_eq!(label, "Compute Budget Program");
        assert_eq!(name, "SetComputeUnitLimit");
        assert_eq!(args, Some("limit: 300000 CU".to_string()));
    }
}
