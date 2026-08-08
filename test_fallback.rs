use solana_debugger::dwarf::DwarfLineMapper;
use std::fs;
use std::str::FromStr;

fn main() {
    let rpc_client = solana_client::rpc_client::RpcClient::new("http://127.0.0.1:8899".to_string());
    let pid = solana_sdk::pubkey::Pubkey::from_str("3Sizn8R7A1SGkAfnC8qww4xKWTdbUkwZRsS8AXQy6L9f").unwrap();
    if let Ok(account) = rpc_client.get_account(&pid) {
        println!("Account fetched, size: {}", account.data.len());
        if account.data.len() > 4 && &account.data[0..4] == b"\x7fELF" {
            let dwarf = DwarfLineMapper::parse_elf(&account.data).unwrap();
            println!("Mappings count: {}", dwarf.mappings_count());
            if let Some(f) = dwarf.get_first_file() {
                println!("First file: {}", f);
            } else {
                println!("No first file found!");
            }
        }
    }
}
