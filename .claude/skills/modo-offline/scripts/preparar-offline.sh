#!/usr/bin/env bash
# Deja la maquina lista para trabajar sin internet. Ejecutalo UNA VEZ, CON RED.
#
#   bash .claude/skills/modo-offline/scripts/preparar-offline.sh
#   bash .../preparar-offline.sh --modelo qwen2.5-coder:14b
#   bash .../preparar-offline.sh --sin-modelo      # solo dependencias
#
# Hace, en orden: instala Ollama, descarga el modelo, vendoriza dependencias,
# escribe .env.offline y PRUEBA de punta a punta que funciona — todo mientras
# todavia hay red para poder arreglar lo que falle.

set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
SKILL="$REPO/.claude/skills/modo-offline"
OUT="$REPO/.offline"
MODELO="qwen2.5-coder:7b"
SIN_MODELO=0
PASOS_FALLIDOS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --modelo)     MODELO="$2"; shift 2 ;;
    --sin-modelo) SIN_MODELO=1; shift ;;
    -h|--help)    sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "opcion desconocida: $1" >&2; exit 2 ;;
  esac
done

titulo() { printf '\n\033[1m=== %s ===\033[0m\n' "$1"; }
ok()     { printf '  \033[32m[ok]\033[0m    %s\n' "$1"; }
aviso()  { printf '  \033[33m[aviso]\033[0m %s\n' "$1"; }
falla()  { printf '  \033[31m[falla]\033[0m %s\n' "$1"; PASOS_FALLIDOS+=("$1"); }

mkdir -p "$OUT"

# ── 0. Requisitos ────────────────────────────────────────────────────────────
titulo "0/6  Requisitos"
command -v python3 >/dev/null || { falla "python3 no esta instalado: es imprescindible"; exit 1; }
ok "python3 $(python3 -V 2>&1 | awk '{print $2}')"

if curl -sSf -m 8 -o /dev/null https://pypi.org/simple/ 2>/dev/null; then
  ok "hay conexion"
else
  falla "SIN CONEXION. Este script necesita red; no hay nada que preparar sin ella."
  exit 1
fi

RAM_GB=""
if [[ "$(uname -s)" == "Darwin" ]]; then
  RAM_GB=$(( $(sysctl -n hw.memsize 2>/dev/null || echo 0) / 1073741824 ))
elif [[ -r /proc/meminfo ]]; then
  RAM_GB=$(( $(awk '/MemTotal/{print $2}' /proc/meminfo) / 1048576 ))
fi
if [[ -n "$RAM_GB" && "$RAM_GB" -gt 0 ]]; then
  ok "RAM detectada: ${RAM_GB} GB"
  if [[ "$RAM_GB" -lt 8 && "$MODELO" == "qwen2.5-coder:7b" ]]; then
    MODELO="qwen2.5-coder:1.5b"
    aviso "menos de 8 GB: se usara $MODELO (mas pequeno) en vez del de 7B"
  elif [[ "$RAM_GB" -ge 32 && "$MODELO" == "qwen2.5-coder:7b" ]]; then
    aviso "tienes ${RAM_GB} GB: considera --modelo qwen2.5-coder:32b para mejor calidad"
  fi
fi

# ── 1. Ollama ────────────────────────────────────────────────────────────────
titulo "1/6  Motor local (Ollama)"
if command -v ollama >/dev/null 2>&1; then
  ok "ollama ya instalado ($(ollama --version 2>/dev/null | head -1))"
else
  case "$(uname -s)" in
    Linux)
      echo "  ... instalando ollama"
      if curl -fsSL https://ollama.com/install.sh | sh >"$OUT/ollama-install.log" 2>&1; then
        ok "ollama instalado"
      else
        falla "no se pudo instalar ollama (revisa $OUT/ollama-install.log)"
      fi ;;
    Darwin)
      if command -v brew >/dev/null 2>&1; then
        echo "  ... instalando ollama con brew"
        brew install ollama >"$OUT/ollama-install.log" 2>&1 \
          && ok "ollama instalado" \
          || falla "brew install ollama fallo (revisa $OUT/ollama-install.log)"
      else
        falla "instala Ollama a mano desde https://ollama.com/download y vuelve a ejecutar"
      fi ;;
    *)
      falla "sistema no reconocido: instala Ollama desde https://ollama.com/download" ;;
  esac
fi

# ── 2. Servicio arriba ───────────────────────────────────────────────────────
titulo "2/6  Servicio de Ollama"
if command -v ollama >/dev/null 2>&1; then
  if curl -sf -m 3 --noproxy '*' http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
    ok "ollama ya esta escuchando en 127.0.0.1:11434"
  else
    nohup ollama serve >"$OUT/ollama-serve.log" 2>&1 &
    for _ in $(seq 20); do
      curl -sf -m 1 --noproxy '*' http://127.0.0.1:11434/api/tags >/dev/null 2>&1 && break
      command -v python3 >/dev/null && python3 -c "import time;time.sleep(0.5)"
    done
    curl -sf -m 2 --noproxy '*' http://127.0.0.1:11434/api/tags >/dev/null 2>&1 \
      && ok "ollama arrancado (log en .offline/ollama-serve.log)" \
      || falla "ollama no responde; arrancalo a mano con: ollama serve"
  fi
else
  falla "sin ollama no hay paso 2"
fi

# ── 3. Modelo ────────────────────────────────────────────────────────────────
titulo "3/6  Modelo local"
if [[ $SIN_MODELO -eq 1 ]]; then
  aviso "omitido por --sin-modelo"
elif command -v ollama >/dev/null 2>&1; then
  if ollama list 2>/dev/null | awk '{print $1}' | grep -qx "$MODELO"; then
    ok "$MODELO ya descargado"
  else
    echo "  ... descargando $MODELO (varios GB, puede tardar bastante)"
    if ollama pull "$MODELO" 2>&1 | tail -1; then
      ok "$MODELO descargado"
    else
      falla "fallo la descarga de $MODELO"
    fi
  fi
else
  falla "sin ollama no se puede descargar el modelo"
fi

# ── 4. Dependencias vendorizadas ─────────────────────────────────────────────
titulo "4/6  Dependencias para instalar sin red"
for parte in pip npm docs; do
  PACK_EMBEBIDO=1 bash "$SKILL/scripts/offline_pack.sh" --solo "$parte" 2>&1 | sed 's/^/  /'
done

# ── 5. Configuracion ─────────────────────────────────────────────────────────
titulo "5/6  Configuracion (.env.offline)"
ENVF="$REPO/.env.offline"
if [[ -f "$ENVF" ]]; then
  ok ".env.offline ya existe (no se sobreescribe)"
else
  sed "s|^export OFFLINE_MODEL=.*|export OFFLINE_MODEL=$MODELO|" \
      "$SKILL/assets/offline.env.example" > "$ENVF"
  ok ".env.offline creado con OFFLINE_MODEL=$MODELO"
fi

# ── 6. Prueba real de punta a punta ──────────────────────────────────────────
titulo "6/6  Prueba end-to-end (lo importante)"
GW_PID=""
if curl -sf -m 2 --noproxy '*' http://127.0.0.1:8787/health >/dev/null 2>&1; then
  ok "el gateway ya estaba corriendo"
else
  nohup python3 "$SKILL/scripts/local_gateway.py" >"$OUT/gateway.log" 2>&1 &
  GW_PID=$!
  for _ in $(seq 20); do
    curl -sf -m 1 --noproxy '*' http://127.0.0.1:8787/health >/dev/null 2>&1 && break
    python3 -c "import time;time.sleep(0.5)"
  done
fi

if curl -sf -m 3 --noproxy '*' http://127.0.0.1:8787/health >/dev/null 2>&1; then
  ok "gateway responde en http://127.0.0.1:8787"
  echo "  ... pidiendole una respuesta al modelo local (puede tardar en la primera carga)"
  RESP=$(curl -s -m 300 --noproxy '*' -X POST http://127.0.0.1:8787/v1/messages \
      -H 'content-type: application/json' \
      -d '{"model":"claude-opus-5","max_tokens":40,"messages":[{"role":"user","content":"Responde exactamente: LISTO"}]}' 2>/dev/null)
  # El gateway devuelve 503 con mensaje claro cuando no hay backend: no lo
  # confundas con "el modelo no respondio".
  if grep -q '"type": *"error"' <<<"${RESP:-}"; then
    falla "$(python3 -c "import json,sys;print(json.loads(sys.argv[1])['error']['message'])" "$RESP" 2>/dev/null \
            || echo 'el gateway devolvio un error')"
  elif [[ -n "$RESP" ]] && python3 -c "
import json,sys
d = json.loads(sys.argv[1])
t = ''.join(b.get('text','') for b in d.get('content',[]))
print('  respuesta del modelo local:', (t.strip()[:80] or '(vacia)'))
sys.exit(0 if t.strip() else 1)" "$RESP" 2>/dev/null; then
    ok "PRUEBA SUPERADA: Claude Code podra trabajar sin internet en esta maquina"
  else
    falla "el gateway responde pero el modelo no genero texto (revisa .offline/gateway.log)"
  fi
else
  falla "el gateway no responde (revisa .offline/gateway.log)"
fi
[[ -n "$GW_PID" ]] && kill "$GW_PID" 2>/dev/null

# ── Resumen ──────────────────────────────────────────────────────────────────
titulo "Resumen"
if [[ ${#PASOS_FALLIDOS[@]} -eq 0 ]]; then
  ok "Todo listo. Cuando te quedes sin internet, ejecuta:"
  echo
  echo "      source .claude/skills/modo-offline/scripts/iniciar-offline.sh"
  echo "      claude"
  echo
else
  aviso "Quedaron ${#PASOS_FALLIDOS[@]} punto(s) sin resolver:"
  for p in "${PASOS_FALLIDOS[@]}"; do echo "      - $p"; done
  echo
  aviso "Resuelvelos AHORA que hay red. Sin ellos, offline solo podras editar a mano."
fi
echo "  Diagnostico en cualquier momento:  python3 $SKILL/scripts/offline_doctor.py"
echo
