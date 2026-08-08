#!/bin/bash
set -e

# Change directory to the cloned example
cd "$(dirname "$0")/counter-example/basics/counter/anchor" || { echo "Directory not found! Please run from the root of solana-debugger workspace."; exit 1; }

echo "Installing node dependencies (ignoring scripts to avoid build errors)..."
pnpm config set ignore-scripts true
pnpm install

echo "Fixing Anchor version to 1.1.2 (currently installed)..."
sed -i 's/anchor_version = "1.0.2"/anchor_version = "1.1.2"/g' Anchor.toml

echo "Syncing Anchor program keys and building..."
anchor build
anchor keys sync
anchor build

echo "Building and running tests..."
echo "=========================================================================="

# Check if a validator is already running on port 8899
if lsof -i :8899 > /dev/null; then
    echo "Detected an existing validator running on port 8899."
    echo "Deploying the Counter program and executing test transactions on the existing validator..."
    echo "=========================================================================="
    echo ""
    anchor test --skip-local-validator
else
    echo "No validator detected on port 8899."
    echo "Starting a new local validator, deploying the Counter program, and executing test transactions."
    echo "The validator will STAY RUNNING in the foreground so your UI can query it."
    echo "Press Ctrl+C to stop it."
    echo "=========================================================================="
    echo ""
    anchor test --detach
fi
