#!/usr/bin/env bash
# Instala CodexBar (https://github.com/steipete/CodexBar) en la máquina local.
#
# - macOS 14+ : instala la app de barra de menús (Homebrew cask, o descarga
#               directa del .zip universal si no hay Homebrew).
# - Linux     : instala el binario CodexBarCLI en ~/.local/bin.
#
# Uso:
#   ./scripts/install_codexbar.sh              # última versión publicada
#   CODEXBAR_VERSION=v0.42.1 ./scripts/install_codexbar.sh
set -euo pipefail

REPO="steipete/CodexBar"

latest_tag() {
  # git ls-remote funciona sin token y sin límites de la API REST.
  git ls-remote --tags --refs "https://github.com/${REPO}.git" \
    | awk -F/ '{print $NF}' | sort -V | tail -1
}

TAG="${CODEXBAR_VERSION:-$(latest_tag)}"
VER="${TAG#v}"
echo "==> CodexBar ${TAG}"

case "$(uname -s)" in
  Darwin)
    if command -v brew >/dev/null 2>&1; then
      echo "==> Instalando con Homebrew (cask codexbar)..."
      brew install --cask codexbar
    else
      URL="https://github.com/${REPO}/releases/download/${TAG}/CodexBar-macos-universal-${VER}.zip"
      TMP="$(mktemp -d)"
      echo "==> Descargando ${URL}"
      curl -fL --retry 3 -o "${TMP}/CodexBar.zip" "${URL}"
      ditto -xk "${TMP}/CodexBar.zip" "${TMP}"
      rm -rf "/Applications/CodexBar.app"
      mv "${TMP}/CodexBar.app" /Applications/
      rm -rf "${TMP}"
      echo "==> Instalado en /Applications/CodexBar.app"
    fi
    open -a CodexBar || true
    echo "Listo. Abre Settings → Providers para activar Codex, Claude, etc."
    ;;
  Linux)
    ARCH="$(uname -m)"
    case "${ARCH}" in
      x86_64)          ASSET_ARCH="x86_64" ;;
      aarch64 | arm64) ASSET_ARCH="aarch64" ;;
      *) echo "Arquitectura no soportada: ${ARCH}" >&2; exit 1 ;;
    esac
    # FLAVOR=linux-musl da un binario estático si la glibc del sistema es vieja.
    FLAVOR="${CODEXBAR_FLAVOR:-linux}"
    URL="https://github.com/${REPO}/releases/download/${TAG}/CodexBarCLI-${TAG}-${FLAVOR}-${ASSET_ARCH}.tar.gz"
    DEST="${CODEXBAR_PREFIX:-${HOME}/.local/bin}"
    TMP="$(mktemp -d)"
    echo "==> Descargando ${URL}"
    curl -fL --retry 3 -o "${TMP}/codexbar.tar.gz" "${URL}"
    tar -xzf "${TMP}/codexbar.tar.gz" -C "${TMP}"
    mkdir -p "${DEST}"
    BIN="$(find "${TMP}" -type f -name codexbar | head -1)"
    install -m 0755 "${BIN}" "${DEST}/codexbar"
    rm -rf "${TMP}"
    echo "==> Instalado en ${DEST}/codexbar"
    "${DEST}/codexbar" --version || true
    echo "Asegúrate de que ${DEST} esté en tu PATH."
    ;;
  *)
    echo "Sistema no soportado: $(uname -s). Descarga manual: https://github.com/${REPO}/releases" >&2
    exit 1
    ;;
esac
