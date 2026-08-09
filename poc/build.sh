#!/usr/bin/env bash
#
# Builds every PoC program with DWARF debug information intact and stages the
# deployable artifacts in ./artifacts.
#
# The subtlety this script exists to handle: cargo-build-sbf writes TWO copies
# of each program. The one in target/deploy/ has been run through strip.sh and
# carries no debug info at all -- deploying that gives you a chain binary the
# debugger cannot map. The unstripped copy lives in
# target/sbpf-solana-solana/release/ and that is what we stage.
#
# Usage:
#   ./build.sh          full DWARF  (~1.7 MB per program)
#   ./build.sh --slim   line table only (~140 KB per program)

set -euo pipefail

cd "$(dirname "$0")"

SLIM=0
[[ "${1:-}" == "--slim" ]] && SLIM=1

SOLANA_BIN="$HOME/.local/share/solana/install/active_release/bin"
[[ -d "$SOLANA_BIN" ]] && export PATH="$SOLANA_BIN:$PATH"

command -v cargo-build-sbf >/dev/null || {
  echo "error: cargo-build-sbf not found. Install the Solana CLI:" >&2
  echo "  sh -c \"\$(curl -sSfL https://release.anza.xyz/stable/install)\"" >&2
  exit 1
}

echo "==> Building (this respects [profile.release] debug=2 / strip=none in Cargo.toml)"
# --disable-remap-cwd keeps an absolute DW_AT_comp_dir so source lookup
# resolves. Without it the compiler remaps the path away and the debugger
# cannot find the .rs files.
cargo-build-sbf --disable-remap-cwd

UNSTRIPPED="target/sbpf-solana-solana/release"
mkdir -p artifacts

# Only .debug_line is needed for PC -> file:line. Dropping the rest costs the
# variable, type and inline-frame information but shrinks the binary ~12x,
# which matters because deploy rent is charged per byte.
SLIM_SECTIONS=(
  .debug_loc .debug_ranges .debug_frame
  .debug_aranges .debug_info .debug_abbrev .debug_str
)

OBJCOPY="$(ls "$HOME"/.cache/solana/*/platform-tools/llvm/bin/llvm-objcopy 2>/dev/null | head -1 || true)"
if [[ $SLIM -eq 1 && -z "$OBJCOPY" ]]; then
  echo "error: --slim needs llvm-objcopy from platform-tools, not found" >&2
  exit 1
fi

echo
printf '%-26s %12s  %s\n' "ARTIFACT" "SIZE" "DWARF"
printf '%-26s %12s  %s\n' "--------------------------" "------------" "-----"

for so in "$UNSTRIPPED"/*.so; do
  name="$(basename "$so")"
  out="artifacts/$name"

  if [[ $SLIM -eq 1 ]]; then
    args=()
    for s in "${SLIM_SECTIONS[@]}"; do args+=("--remove-section=$s"); done
    "$OBJCOPY" "${args[@]}" "$so" "$out"
  else
    cp "$so" "$out"
  fi

  # Copy the keypair alongside so program IDs stay stable across rebuilds.
  kp="target/deploy/${name%.so}-keypair.json"
  [[ -f "$kp" ]] && cp "$kp" "artifacts/"

  sections="$(readelf -S "$out" 2>/dev/null | grep -c 'debug_' || true)"
  printf '%-26s %12s  %s sections\n' "$name" "$(stat -c%s "$out")" "$sections"

  if [[ "$sections" -eq 0 ]]; then
    echo "error: $name has no debug sections -- the recipe did not take" >&2
    exit 1
  fi
done

echo
echo "Staged in ./artifacts. Deploy with ./deploy.sh"
