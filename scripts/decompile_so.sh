#!/bin/bash
SO_FILE=$1
OUT_FILE=$2
if [ -z "$SO_FILE" ] || [ -z "$OUT_FILE" ]; then
    echo "Usage: $0 <so_file> <out_c_file>"
    exit 1
fi
GHIDRA_DIR=/home/vedran/ghidra_12.1.2_PUBLIC
SCRIPTS_DIR=/home/vedran/dev/solana-debugger/scripts
# Create a unique project name
PROJ_NAME="GhidraProj_$$"
# Run headless analyzer
$GHIDRA_DIR/support/analyzeHeadless /tmp $PROJ_NAME \
    -import "$SO_FILE" \
    -scriptPath "$SCRIPTS_DIR" \
    -postScript DecompileSBPF.java "$OUT_FILE" \
    -deleteProject -overwrite \
    > /dev/null 2>&1
