#!/usr/bin/env bash
set -e

# 1. Ensure Solana CLI is available in PATH
if ! command -v solana &> /dev/null; then
    if [ -d "$HOME/.local/share/solana/install/active_release/bin" ]; then
        export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    else
        echo "[!] Solana CLI not found. Installing..."
        curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash
        export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    fi
fi

echo "[✓] Solana CLI found: $(solana --version)"

# 2. Configure network target to localhost
solana config set --url localhost

# 3. Create default keypair if missing
KEYPAIR_PATH="$HOME/.config/solana/id.json"
if [ ! -f "$KEYPAIR_PATH" ]; then
    echo "[+] Creating new keypair at $KEYPAIR_PATH..."
    mkdir -p "$HOME/.config/solana"
    solana-keygen new --no-bip39-pass --outfile "$KEYPAIR_PATH"
else
    echo "[✓] Keypair exists: $(solana-keygen pubkey "$KEYPAIR_PATH")"
fi

# 4. Request SOL Airdrop (requires local validator to be running)
if nc -z 127.0.0.1 8899 2>/dev/null; then
    echo "[+] Requesting airdrop of 10 SOL..."
    solana airdrop 10 || echo "[!] Airdrop failed (validator rate-limit or offline)"
else
    echo "[!] Validator is not running yet. Run 'make validator' in another terminal, then run 'make setup' again for airdrop."
fi
