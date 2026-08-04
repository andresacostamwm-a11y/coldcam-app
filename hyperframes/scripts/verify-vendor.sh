#!/usr/bin/env bash
#
# Comprueba que los ficheros de vendor/ siguen coincidiendo con vendor/MANIFEST.txt.
# Detecta modificaciones locales o ficheros sustituidos. Sale != 0 si algo no cuadra,
# así que sirve tal cual en un hook de pre-commit o en CI.
#
# Uso:  bash hyperframes/scripts/verify-vendor.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR="$ROOT/vendor"
MANIFEST="$VENDOR/MANIFEST.txt"

[ -f "$MANIFEST" ] || { echo "No existe $MANIFEST — ejecuta vendor-runtime.sh" >&2; exit 1; }

fail=0
checked=0
while read -r sum file _arrow pkgspec _colon inner; do
  case "$sum" in ''|'#'*) continue ;; esac
  checked=$((checked + 1))
  if [ ! -f "$VENDOR/$file" ]; then
    echo "FALTA     $file"; fail=1; continue
  fi
  actual="$(sha256sum "$VENDOR/$file" | cut -d' ' -f1)"
  if [ "$actual" = "$sum" ]; then
    echo "OK        $file  ($pkgspec)"
  else
    echo "ALTERADO  $file"
    echo "          esperado: $sum"
    echo "          real:     $actual"
    fail=1
  fi
done < "$MANIFEST"

# Nada suelto en vendor/ que el manifiesto no declare.
while IFS= read -r f; do
  name="$(basename "$f")"
  [ "$name" = "MANIFEST.txt" ] && continue
  grep -q "  $name  " "$MANIFEST" || { echo "NO DECLARADO  $name"; fail=1; }
done < <(find "$VENDOR" -maxdepth 1 -type f)

echo
if [ "$fail" -eq 0 ]; then
  echo "$checked fichero(s) verificados contra el manifiesto."
else
  echo "Verificación FALLIDA. Regenera con: bash hyperframes/scripts/vendor-runtime.sh" >&2
fi
exit "$fail"
