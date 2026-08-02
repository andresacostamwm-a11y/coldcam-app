#!/usr/bin/env bash
# Prepara el "pack offline": todo lo que hay que descargar MIENTRAS HAY RED
# para poder seguir trabajando cuando no la haya.
#
# Uso:
#   bash scripts/offline_pack.sh              # todo
#   bash scripts/offline_pack.sh --solo pip
#   bash scripts/offline_pack.sh --solo modelos --modelo qwen2.5-coder:7b
#   bash scripts/offline_pack.sh --verificar  # no descarga, solo audita que falta
#
# Deja el resultado en .offline/ (ignorado por git).

set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
OUT="$REPO/.offline"
MODELOS_DEFECTO=("qwen2.5-coder:7b" "nomic-embed-text")
SOLO="todo"
VERIFICAR=0
MODELOS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --solo)      SOLO="$2"; shift 2 ;;
    --modelo)    MODELOS+=("$2"); shift 2 ;;
    --verificar) VERIFICAR=1; shift ;;
    -h|--help)   sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "opcion desconocida: $1" >&2; exit 2 ;;
  esac
done
[[ ${#MODELOS[@]} -eq 0 ]] && MODELOS=("${MODELOS_DEFECTO[@]}")

hacer() { [[ "$SOLO" == "todo" || "$SOLO" == "$1" ]]; }
titulo() { printf '\n=== %s ===\n' "$1"; }
ok()     { printf '  [ok]    %s\n' "$1"; }
aviso()  { printf '  [aviso] %s\n' "$1"; }
falla()  { printf '  [falla] %s\n' "$1"; }

mkdir -p "$OUT"

# --- 0. hay red? -------------------------------------------------------------
titulo "Conectividad"
if curl -sSf -m 5 -o /dev/null https://pypi.org/simple/ 2>/dev/null; then
  ok "hay red: se puede vendorizar"
  HAY_RED=1
else
  aviso "sin red: solo se puede auditar lo ya descargado"
  HAY_RED=0
  VERIFICAR=1
fi

# --- 1. wheels de Python -----------------------------------------------------
if hacer pip; then
  titulo "Dependencias Python (.offline/wheels)"
  mkdir -p "$OUT/wheels"
  if [[ $VERIFICAR -eq 1 ]]; then
    n=$(find "$OUT/wheels" -name '*.whl' 2>/dev/null | wc -l | tr -d ' ')
    [[ "$n" -gt 0 ]] && ok "$n wheels en cache" || falla "sin wheels: corre esto con red"
  else
    if pip download -r "$REPO/requirements.txt" -d "$OUT/wheels" >"$OUT/pip.log" 2>&1; then
      ok "$(find "$OUT/wheels" -name '*.whl' | wc -l | tr -d ' ') wheels descargados"
      ok "instalacion offline: pip install --no-index --find-links $OUT/wheels -r requirements.txt"
    else
      falla "pip download fallo, revisa $OUT/pip.log"
    fi
  fi
fi

# --- 2. dependencias de node -------------------------------------------------
if hacer npm; then
  titulo "Dependencias Node (video/node_modules)"
  if [[ -d "$REPO/video/node_modules" ]]; then
    ok "node_modules presente"
  elif [[ $VERIFICAR -eq 1 ]]; then
    falla "falta video/node_modules: corre npm install con red"
  else
    if (cd "$REPO/video" && npm install --no-audit --no-fund >"$OUT/npm.log" 2>&1); then
      ok "node_modules instalado"
    else
      falla "npm install fallo, revisa $OUT/npm.log"
    fi
  fi
fi

# --- 3. modelos locales ------------------------------------------------------
if hacer modelos; then
  titulo "Modelos locales (ollama)"
  if ! command -v ollama >/dev/null 2>&1; then
    falla "ollama no instalado. Sin el no hay inferencia offline."
    aviso "instalalo con red desde https://ollama.com/download"
  else
    descargados="$(ollama list 2>/dev/null | tail -n +2 | awk '{print $1}')"
    for m in "${MODELOS[@]}"; do
      if grep -qx "$m" <<<"$descargados"; then
        ok "$m ya descargado"
      elif [[ $VERIFICAR -eq 1 ]]; then
        falla "$m no descargado"
      else
        echo "  ... descargando $m (puede tardar)"
        ollama pull "$m" >>"$OUT/ollama.log" 2>&1 && ok "$m descargado" || falla "fallo pull de $m"
      fi
    done
  fi
fi

# --- 4. documentacion de referencia -----------------------------------------
if hacer docs; then
  titulo "Referencias locales"
  mkdir -p "$OUT/docs"
  {
    echo "# Inventario offline — generado $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo
    echo "## Skills disponibles sin red ($(ls "$REPO/.claude/skills" 2>/dev/null | wc -l | tr -d ' '))"
    ls "$REPO/.claude/skills" 2>/dev/null | sed 's/^/- /'
  } > "$OUT/docs/inventario.md"
  ok "inventario en .offline/docs/inventario.md"
fi

# --- 5. resumen --------------------------------------------------------------
titulo "Resumen"
[[ $HAY_RED -eq 1 && $VERIFICAR -eq 0 ]] \
  && ok "pack listo. Al perder la red: python3 scripts/offline_doctor.py" \
  || aviso "modo auditoria. Lo marcado [falla] hay que descargarlo con red."
echo
