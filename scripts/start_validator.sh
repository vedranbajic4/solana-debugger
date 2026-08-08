#!/usr/bin/env bash
set -e

# Ensure Solana CLI is in PATH
if [ -d "$HOME/.local/share/solana/install/active_release/bin" ]; then
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
fi

if nc -z 127.0.0.1 8899 2>/dev/null; then
    echo "[!] solana-test-validator is already running on http://127.0.0.1:8899"
    exit 0
fi

echo "[+] Starting local Solana test validator..."
solana-test-validator --reset
