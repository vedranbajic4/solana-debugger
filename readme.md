# Solana debuger

## setup solana (LINUX)
1) `
curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash`

restart terminal

2) optional: `nvm use --delete-prefix v24.10.0`

3) export path: `echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.zshrc`

4) `solana-test-validator`

ovo ranuje na http://127.0.0.1:8899, **ostaviti terminal upaljen**

Otvori novi terminal

5) `solana config set --url localhost`

6) `solana-keygen new --outfile ~/.config/solana/id.json`

7) `solana airdrop 10`


## pravljenje projekta i transakcije

1) `cd solana-tx`

2) `npm init -y`

3) `npm install @solana/web3.js`

4) `node transfer.js`


