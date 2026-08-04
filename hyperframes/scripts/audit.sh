#!/usr/bin/env bash
#
# Auditoría de la instalación de HyperFrames. Pensado para correr en CI o antes
# de tocar nada: sale != 0 si alguna comprobación falla.
#
#   1. Vulnerabilidades conocidas en el árbol de npm
#   2. Firmas del registro npm de cada paquete instalado
#   3. Integridad de vendor/ contra el manifiesto
#   4. Validez estructural de las plantillas
#
# Uso:  bash hyperframes/scripts/audit.sh
#
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
fail=0
step() { printf '\n=== %s ===\n' "$1"; }

step "1/4 Vulnerabilidades (npm audit)"
npm audit --audit-level=moderate || fail=1

step "2/4 Firmas del registro npm"
npm audit signatures || fail=1

step "3/4 Integridad de vendor/"
bash "$ROOT/scripts/verify-vendor.sh" || fail=1

step "4/4 Plantillas (hyperframes lint)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
for tpl in "$ROOT"/templates/skeleton-*.html; do
  name="$(basename "$tpl")"
  d="$tmp/$name"; mkdir -p "$d"
  cp "$ROOT/starter/hyperframes.json" "$d/" 2>/dev/null || true
  cp "$tpl" "$d/index.html"
  out="$( (cd "$d" && npx --no-install hyperframes lint 2>&1) )"
  if printf '%s' "$out" | grep -qE '0 error\(s\)'; then
    printf 'OK        %s\n' "$name"
  else
    printf 'FALLA     %s\n' "$name"
    printf '%s\n' "$out" | tail -5
    fail=1
  fi
done

printf '\n'
if [ "$fail" -eq 0 ]; then
  echo "Auditoría OK."
else
  echo "Auditoría FALLIDA — revisa los pasos marcados arriba." >&2
fi
exit "$fail"
