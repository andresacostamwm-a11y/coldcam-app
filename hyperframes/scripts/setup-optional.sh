#!/usr/bin/env bash
#
# Instala los tres componentes opcionales que reporta `hyperframes doctor`:
#   - whisper.cpp   → transcripción (captions automáticos)
#   - Kokoro TTS    → voz local
#   - MusicGen      → música de fondo local
#
# Ninguno lo pide la guía claude-design-hyperframes.md; sólo hacen falta para
# captions, voiceover o BGM generados en local. El render a MP4 no los necesita.
#
# Uso:  bash hyperframes/scripts/setup-optional.sh
#
set -euo pipefail

VENV="${HYPERFRAMES_VENV:-$HOME/.venv-hyperframes}"
WHISPER_DIR="$HOME/.cache/hyperframes/whisper/whisper.cpp"   # ruta que busca el CLI
JOBS="$(nproc 2>/dev/null || echo 4)"

echo "==> Dependencias de compilación"
if command -v apt-get >/dev/null 2>&1; then
  sudo=""; [ "$(id -u)" -ne 0 ] && sudo="sudo"
  $sudo apt-get update -qq
  DEBIAN_FRONTEND=noninteractive $sudo apt-get install -y -qq build-essential cmake git
fi

echo "==> whisper.cpp"
# Compilar SIEMPRE en la ruta final: cmake graba rutas absolutas en el árbol de
# build, así que mover el directorio después rompe `cmake --install` y el rpath
# del binario (whisper-cli arranca pero no encuentra libwhisper.so).
if [ ! -d "$WHISPER_DIR" ]; then
  mkdir -p "$(dirname "$WHISPER_DIR")"
  git clone --depth 1 https://github.com/ggml-org/whisper.cpp.git "$WHISPER_DIR"
fi
cmake -B "$WHISPER_DIR/build" -S "$WHISPER_DIR" \
  -DCMAKE_BUILD_TYPE=Release -DWHISPER_BUILD_TESTS=OFF -DWHISPER_BUILD_EXAMPLES=ON
cmake --build "$WHISPER_DIR/build" --config Release -j "$JOBS"

# Instalar binario + librerías compartidas en /usr/local para que `whisper-cli`
# esté en el PATH y arranque desde cualquier directorio.
sudo=""; [ "$(id -u)" -ne 0 ] && sudo="sudo"
$sudo cmake --install "$WHISPER_DIR/build" --prefix /usr/local
$sudo ldconfig

echo "==> Entorno Python en $VENV"
# venv aparte: el intérprete del sistema está marcado EXTERNALLY-MANAGED (PEP 668)
# y además la app Flask del repo usa ese Python; torch no debe contaminarlo.
python3 -m venv "$VENV"
"$VENV/bin/python" -m pip install --quiet --upgrade pip

echo "==> Kokoro TTS"
"$VENV/bin/pip" install --quiet kokoro-onnx soundfile

echo "==> MusicGen (torch CPU)"
# Índice CPU de PyTorch: la rueda por defecto de PyPI arrastra el stack CUDA
# (~2-3 GB de paquetes nvidia-*) que no sirve de nada sin GPU.
"$VENV/bin/pip" install --quiet --index-url https://download.pytorch.org/whl/cpu torch
"$VENV/bin/pip" install --quiet transformers numpy

echo
echo "Listo. Exporta esta variable para que el CLI encuentre el entorno:"
echo
echo "    export HYPERFRAMES_PYTHON=$VENV/bin/python"
echo
echo "Verifica con:  HYPERFRAMES_PYTHON=$VENV/bin/python npx hyperframes doctor"
