use solana_client::rpc_client::RpcClient;
use solana_sdk::pubkey::Pubkey;
use std::str::FromStr;

fn main() {
    let rpc_client = RpcClient::new("http://127.0.0.1:8899".to_string());
    let pid = Pubkey::from_str("3Sizn8R7A1SGkAfnC8qww4xKWTdbUkwZRsS8AXQy6L9f").unwrap();
    if let Ok(account) = rpc_client.get_account(&pid) {
        println!("Account owner: {}", account.owner);
        println!("Account data len: {}", account.data.len());
        println!("Account data prefix: {:?}", &account.data[0..4]);
        
        if account.data.len() >= 36 && account.data[0..4] == [2, 0, 0, 0] {
            let mut programdata_addr = [0u8; 32];
            programdata_addr.copy_from_slice(&account.data[4..36]);
            let pd_key = Pubkey::new_from_array(programdata_addr);
            println!("ProgramData address: {}", pd_key);
            
            if let Ok(pd_account) = rpc_client.get_account(&pd_key) {
                println!("ProgramData data len: {}", pd_account.data.len());
                // ProgramData has a header before the ELF
                // 3, 0, 0, 0 for state
                // 8 bytes for slot
                // 32 bytes for upgrade auth (optional?)
                // Actually ELF starts somewhere around byte 45
                
                // Let's find ELF signature
                for i in 0..100 {
                    if pd_account.data[i..].starts_with(b"\x7fELF") {
                        println!("Found ELF at offset {}", i);
                        break;
                    }
                }
            }
        }
    }
}
