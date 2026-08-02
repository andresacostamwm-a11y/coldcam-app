#!/usr/bin/env bash
# Arranca el modo offline: motor local + gateway + variables de entorno.
# Es idempotente: si algo ya esta corriendo, no lo duplica.
#
# Uso recomendado (con `source`, para que las variables queden en tu shell):
#
#     source .claude/skills/modo-offline/scripts/iniciar-offline.sh
#     claude
#
# Tambien se puede ejecutar (`bash iniciar-offline.sh`): arranca los servicios
# igual, pero te tocara exportar las variables a mano — te dice como.

_off_titulo() { printf '\n\033[1m%s\033[0m\n' "$1"; }
_off_ok()     { printf '  \033[32m[ok]\033[0m    %s\n' "$1"; }
_off_aviso()  { printf '  \033[33m[aviso]\033[0m %s\n' "$1"; }
_off_falla()  { printf '  \033[31m[falla]\033[0m %s\n' "$1"; }

# ¿nos estan haciendo source o ejecutando?
if [ -n "${BASH_SOURCE:-}" ] && [ "${BASH_SOURCE[0]}" != "${0}" ]; then
  _OFF_SOURCED=1
  _OFF_SELF="${BASH_SOURCE[0]}"
else
  _OFF_SOURCED=0
  _OFF_SELF="${BASH_SOURCE[0]:-$0}"
fi

_OFF_REPO="$(cd "$(dirname "$_OFF_SELF")/../../../.." && pwd)"
_OFF_SKILL="$_OFF_REPO/.claude/skills/modo-offline"
_OFF_HOST="${OFFLINE_GATEWAY_HOST:-127.0.0.1}"
_OFF_PORT="${OFFLINE_GATEWAY_PORT:-8787}"
mkdir -p "$_OFF_REPO/.offline"

_off_titulo "Modo offline"

# ── 1. Motor local ───────────────────────────────────────────────────────────
if curl -sf -m 2 --noproxy '*' "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1; then
  _off_ok "motor local ya escuchando (11434)"
elif command -v ollama >/dev/null 2>&1; then
  nohup ollama serve >"$_OFF_REPO/.offline/ollama-serve.log" 2>&1 &
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    curl -sf -m 1 --noproxy '*' "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1 && break
    python3 -c "import time;time.sleep(0.5)" 2>/dev/null || true
  done
  curl -sf -m 2 --noproxy '*' "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1 \
    && _off_ok "motor local arrancado" \
    || _off_falla "ollama no responde (log: .offline/ollama-serve.log)"
else
  _off_falla "ollama no instalado: ejecuta preparar-offline.sh CON RED"
fi

# ── 2. Gateway ───────────────────────────────────────────────────────────────
if curl -sf -m 2 --noproxy '*' "http://$_OFF_HOST:$_OFF_PORT/health" >/dev/null 2>&1; then
  _off_ok "gateway ya escuchando ($_OFF_PORT)"
else
  nohup python3 "$_OFF_SKILL/scripts/local_gateway.py" \
      >"$_OFF_REPO/.offline/gateway.log" 2>&1 &
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    curl -sf -m 1 --noproxy '*' "http://$_OFF_HOST:$_OFF_PORT/health" >/dev/null 2>&1 && break
    python3 -c "import time;time.sleep(0.5)" 2>/dev/null || true
  done
  curl -sf -m 2 --noproxy '*' "http://$_OFF_HOST:$_OFF_PORT/health" >/dev/null 2>&1 \
    && _off_ok "gateway arrancado (log: .offline/gateway.log)" \
    || _off_falla "el gateway no arranco (log: .offline/gateway.log)"
fi

# ── 3. Modelos disponibles ───────────────────────────────────────────────────
_OFF_MODELOS="$(curl -sf -m 2 --noproxy '*' "http://$_OFF_HOST:$_OFF_PORT/health" 2>/dev/null \
  | python3 -c "import json,sys;print(', '.join(json.load(sys.stdin).get('modelos',[])) or 'ninguno')" 2>/dev/null)"
[ -n "$_OFF_MODELOS" ] && _off_ok "modelos: $_OFF_MODELOS"
[ "$_OFF_MODELOS" = "ninguno" ] && _off_aviso "no hay modelos descargados: necesitas 'ollama pull' CON RED"

# ── 4. Variables ─────────────────────────────────────────────────────────────
if [ "$_OFF_SOURCED" = "1" ]; then
  export ANTHROPIC_BASE_URL="http://$_OFF_HOST:$_OFF_PORT"
  export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-offline}"
  export NO_PROXY="localhost,127.0.0.1,::1${NO_PROXY:+,$NO_PROXY}"
  _off_ok "ANTHROPIC_BASE_URL=$ANTHROPIC_BASE_URL"
  printf '\n  Listo. Ejecuta:  \033[1mclaude\033[0m\n\n'
else
  _off_aviso "ejecutado sin 'source': las variables NO quedaron aplicadas."
  printf '\n  Aplicalas con:\n'
  printf '      \033[1msource %s\033[0m\n' "${_OFF_SELF#$_OFF_REPO/}"
  printf '  O a mano:\n'
  printf '      export ANTHROPIC_BASE_URL=http://%s:%s\n' "$_OFF_HOST" "$_OFF_PORT"
  printf '      export ANTHROPIC_API_KEY=offline\n\n'
fi

unset _OFF_SELF _OFF_HOST _OFF_PORT _OFF_MODELOS _OFF_SOURCED
unset -f _off_titulo _off_ok _off_aviso _off_falla 2>/dev/null || true
