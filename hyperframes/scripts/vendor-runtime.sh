#!/usr/bin/env bash
#
# Descarga el runtime de HyperFrames a vendor/ desde el registro de npm y escribe
# vendor/MANIFEST.txt con la procedencia y el SHA-256 de cada fichero.
#
# Por qué desde npm y no desde el CDN: jsDelivr sirve ficheros derivados
# (re-minificados con Terser) que NO coinciden byte a byte con lo publicado, y el
# propio fichero avisa de que no se puede usar SRI con ellos. Los tarballs de npm
# sí llevan hash de integridad y firma del registro, así que son verificables.
#
# Uso:  bash hyperframes/scripts/vendor-runtime.sh
# Verificar después:  bash hyperframes/scripts/verify-vendor.sh
#
set -euo pipefail

HF_VERSION="0.7.90"   # debe coincidir con la versión del CLI en package.json
GSAP_VERSION="3.14.2" # la que fija la guía claude-design-hyperframes.md

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENDOR="$ROOT/vendor"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# destino <- paquete@versión : ruta dentro del tarball
SPECS=(
  "gsap.min.js|gsap@$GSAP_VERSION|package/dist/gsap.min.js"
  "hyperframe.runtime.iife.js|@hyperframes/core@$HF_VERSION|package/dist/hyperframe.runtime.iife.js"
  "shader-transitions.global.js|@hyperframes/shader-transitions@$HF_VERSION|package/dist/index.global.js"
  "hyperframes-player.js|@hyperframes/player@$HF_VERSION|package/dist/hyperframes-player.js"
)

mkdir -p "$VENDOR"
MANIFEST="$VENDOR/MANIFEST.txt"
{
  echo "# Runtime de HyperFrames vendorizado desde el registro de npm."
  echo "# Regenerar:  bash hyperframes/scripts/vendor-runtime.sh"
  echo "# Verificar:  bash hyperframes/scripts/verify-vendor.sh"
  echo "#"
  echo "# sha256  fichero  <-  paquete@versión  :  ruta en el tarball"
} > "$MANIFEST"

cd "$WORK"
for spec in "${SPECS[@]}"; do
  IFS='|' read -r dest pkgspec inner <<< "$spec"
  echo "==> $pkgspec"
  # npm pack valida el hash de integridad del tarball contra el registro.
  tarball="$(npm pack "$pkgspec" --silent --pack-destination "$WORK")"
  rm -rf "$WORK/x"; mkdir -p "$WORK/x"
  tar xzf "$WORK/$tarball" -C "$WORK/x"
  if [ ! -f "$WORK/x/$inner" ]; then
    echo "ERROR: $inner no existe en $pkgspec" >&2
    exit 1
  fi
  cp "$WORK/x/$inner" "$VENDOR/$dest"
  sum="$(sha256sum "$VENDOR/$dest" | cut -d' ' -f1)"
  printf '%s  %s  <-  %s  :  %s\n' "$sum" "$dest" "$pkgspec" "$inner" >> "$MANIFEST"
done

echo
echo "vendor/ actualizado. Manifiesto:"
cat "$MANIFEST"
