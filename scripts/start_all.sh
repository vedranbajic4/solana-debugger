#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
UI_DIR="$ROOT_DIR/ui"

# Ensure Solana CLI is in PATH
if [ -d "$HOME/.local/share/solana/install/active_release/bin" ]; then
    export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
fi

# Trap termination signals to kill all child processes (validator, backend, frontend) on exit
trap 'echo -e "\n[!] Shutting down validator, backend, and frontend..."; kill 0' EXIT SIGINT SIGTERM

echo "=========================================="
echo " Starting Solana Debugger Full Stack "
echo "=========================================="

# 1. Start validator if not already running
if nc -z 127.0.0.1 8899 2>/dev/null; then
    echo "[✓] solana-test-validator is already running on http://127.0.0.1:8899"
else
    echo "[+] Starting local Solana test validator in background..."
    solana-test-validator --reset > /dev/null 2>&1 &
    
    echo "[+] Waiting for validator to be ready on port 8899..."
    while ! nc -z 127.0.0.1 8899 2>/dev/null; do
        sleep 0.5
    done
    echo "[✓] Solana validator is online!"
fi

# 2. Ensure Solana config and funding
solana config set --url localhost > /dev/null 2>&1 || true
KEYPAIR_PATH="$HOME/.config/solana/id.json"
if [ ! -f "$KEYPAIR_PATH" ]; then
    echo "[+] Creating keypair at $KEYPAIR_PATH..."
    mkdir -p "$HOME/.config/solana"
    solana-keygen new --no-bip39-pass --outfile "$KEYPAIR_PATH" > /dev/null 2>&1
fi
echo "[+] Ensuring wallet funding..."
solana airdrop 10 > /dev/null 2>&1 || true

# 3. Check UI dependencies
if [ ! -d "$UI_DIR/node_modules" ]; then
    echo "[+] Installing UI dependencies..."
    (cd "$UI_DIR" && npm install)
fi

echo "------------------------------------------"
echo " Backend Express API : http://localhost:3001"
echo " Frontend Vite App   : http://localhost:5173"
echo " Press Ctrl+C to stop everything"
echo "------------------------------------------"

# 4. Start Express backend
(cd "$UI_DIR" && npm run server) &

# 5. Start Vite frontend
(cd "$UI_DIR" && npm run dev) &

# Wait for all background jobs
wait
