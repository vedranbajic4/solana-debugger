#!/usr/bin/env bash
#
# Deploys the staged artifacts to the configured cluster and writes the
# resulting program IDs to program-ids.json for the client to read.
#
# Defaults to localnet. Run ./build.sh first.

set -euo pipefail

cd "$(dirname "$0")"

SOLANA_BIN="$HOME/.local/share/solana/install/active_release/bin"
[[ -d "$SOLANA_BIN" ]] && export PATH="$SOLANA_BIN:$PATH"

RPC="${RPC:-http://127.0.0.1:8899}"
KEYPAIR="${KEYPAIR:-$HOME/.config/solana/id.json}"

[[ -d artifacts ]] || { echo "error: no artifacts/ -- run ./build.sh first" >&2; exit 1; }

if [[ ! -f "$KEYPAIR" ]]; then
  echo "==> No keypair at $KEYPAIR, generating one"
  solana-keygen new --no-bip39-passphrase -o "$KEYPAIR"
fi

solana config set --url "$RPC" --keypair "$KEYPAIR" >/dev/null

solana cluster-version >/dev/null 2>&1 || {
  echo "error: no validator reachable at $RPC" >&2
  echo "  start one with: solana-test-validator" >&2
  exit 1
}

# Full-DWARF artifacts are ~1.7 MB each and upgradeable deploys reserve twice
# the binary size, so six of them cost roughly 70 SOL in rent. Free on
# localnet; on devnet, build with --slim first or you will not have the funds.
need_sol() {
  local total=0
  for so in artifacts/*.so; do total=$((total + $(stat -c%s "$so"))); done
  echo $(( (total * 2 * 7) / 1000000000 + 5 ))
}

if [[ "$RPC" == *"127.0.0.1"* || "$RPC" == *"localhost"* ]]; then
  want="$(need_sol)"
  have="$(solana balance | awk '{print int($1)}')"
  while [[ "$have" -lt "$want" ]]; do
    echo "==> Airdropping (have ${have} SOL, need ~${want} SOL)"
    solana airdrop 100 >/dev/null || break
    have="$(solana balance | awk '{print int($1)}')"
  done
fi

echo "==> Deploying to $RPC"
echo "{" > program-ids.json
first=1

for so in artifacts/*.so; do
  name="$(basename "$so" .so)"
  kp="artifacts/${name}-keypair.json"

  echo "  - $name ($(stat -c%s "$so") bytes)"
  if [[ -f "$kp" ]]; then
    solana program deploy --program-id "$kp" "$so" >/dev/null
    pid="$(solana address -k "$kp")"
  else
    pid="$(solana program deploy "$so" | awk '/Program Id:/ {print $3}')"
  fi

  [[ $first -eq 0 ]] && echo "," >> program-ids.json
  printf '  "%s": "%s"' "$name" "$pid" >> program-ids.json
  first=0
  echo "    -> $pid"
done

printf '\n}\n' >> program-ids.json

echo
echo "==> Program IDs written to program-ids.json"
echo "    Send the failing transactions with: cd client && npm install && node send.mjs all"
