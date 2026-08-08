#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
UI_DIR="$ROOT_DIR/ui"

if [ ! -d "$UI_DIR/node_modules" ]; then
    echo "[+] Installing UI dependencies..."
    (cd "$UI_DIR" && npm install)
fi

# Trap termination signals to kill all child background processes on exit
trap 'echo -e "\n[!] Shutting down servers..."; kill 0' EXIT SIGINT SIGTERM

echo "=========================================="
echo " Starting Solana Debugger UI & Backend "
echo " Backend Express API : http://localhost:3001"
echo " Frontend Vite App   : http://localhost:5173"
echo " Press Ctrl+C to stop both servers"
echo "=========================================="

# Start backend server
(cd "$UI_DIR" && npm run server) &

# Start Vite frontend
(cd "$UI_DIR" && npm run dev) &

# Wait for background jobs
wait
