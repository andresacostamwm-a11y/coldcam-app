# Instalacion y puesta a punto del modo offline

Todo esto hay que hacerlo **con red**. Sin ella no hay instalacion posible: si el
usuario ya esta offline y no preparo nada, dilo sin rodeos y pasa a trabajo manual +
cola de tareas.

## 1. Backend de modelo local (Ollama)

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh      # o descarga desde ollama.com/download

ollama serve &                                     # arranca en 127.0.0.1:11434
ollama pull qwen2.5-coder:7b                       # ~4.7 GB, el mejor equilibrio para codigo
ollama list
```

### Que modelo elegir

| RAM disponible | Modelo | Uso |
|---|---|---|
| 8 GB | `qwen2.5-coder:7b` (Q4) | edicion acotada, explicaciones |
| 16 GB | `qwen2.5-coder:14b` | refactors medianos |
| 32 GB+ | `qwen2.5-coder:32b` o `deepseek-coder-v2:16b` | lo mas cercano a algo util en multi-archivo |
| Cualquiera, ademas | `nomic-embed-text` | embeddings locales para busqueda semantica |

Alternativas al mismo protocolo: `llama.cpp` con `llama-server`, o LM Studio. Ambos
exponen API OpenAI, no Ollama; en ese caso hay que ajustar `backend_post()` de
`local_gateway.py` a `/v1/chat/completions` (el resto de la traduccion no cambia).

## 2. Gateway

No requiere instalar nada: solo stdlib de Python 3.9+.

```bash
python3 .claude/skills/modo-offline/scripts/local_gateway.py --check   # ¿backend vivo?
python3 .claude/skills/modo-offline/scripts/local_gateway.py &
curl -s --noproxy '*' http://127.0.0.1:8787/health
```

### Variables

| Variable | Por defecto | Para que |
|---|---|---|
| `OLLAMA_HOST` | `http://127.0.0.1:11434` | donde escucha el backend |
| `OFFLINE_MODEL` | `qwen2.5-coder:7b` | modelo por defecto |
| `OFFLINE_MODEL_MAP` | `{}` | JSON: mapea nombres Claude a modelos locales |
| `OFFLINE_GATEWAY_HOST` / `_PORT` | `127.0.0.1` / `8787` | donde escucha el gateway |
| `OFFLINE_GATEWAY_VERBOSE` | `1` | log a stderr |

Ejemplo de mapeo por tier:

```bash
export OFFLINE_MODEL_MAP='{"claude-opus-5":"qwen2.5-coder:32b","claude-haiku-4-5-20251001":"qwen2.5-coder:7b"}'
```

## 3. Clientes

```bash
export ANTHROPIC_BASE_URL=http://127.0.0.1:8787
export ANTHROPIC_API_KEY=offline
```

- **Claude Code**: arranca `claude` con esas variables exportadas.
- **`app/main.py`**: el SDK `anthropic` respeta `ANTHROPIC_BASE_URL`; no hay que tocar codigo.
  Si prefieres dejarlo explicito: `anthropic.Anthropic(base_url=os.getenv("ANTHROPIC_BASE_URL"))`.
- **curl**: usa `--noproxy '*'` o el proxy del entorno interceptara localhost.

Copia `assets/offline.env.example` a `.env.offline` y cargalo con `source .env.offline`.

## 4. Arranque automatico (opcional)

**macOS (launchd)** — `~/Library/LaunchAgents/com.local.offline-gateway.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict>
  <key>Label</key><string>com.local.offline-gateway</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/python3</string>
    <string>/RUTA/AL/REPO/.claude/skills/modo-offline/scripts/local_gateway.py</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict></plist>
```

```bash
launchctl load ~/Library/LaunchAgents/com.local.offline-gateway.plist
```

**Linux (systemd usuario)** — `~/.config/systemd/user/offline-gateway.service`:

```ini
[Unit]
Description=Gateway offline compatible con Anthropic
After=network.target

[Service]
ExecStart=/usr/bin/python3 /RUTA/AL/REPO/.claude/skills/modo-offline/scripts/local_gateway.py
Restart=always

[Install]
WantedBy=default.target
```

```bash
systemctl --user enable --now offline-gateway
```

## 5. Dependencias vendorizadas

```bash
bash .claude/skills/modo-offline/scripts/offline_pack.sh
```

Y ya sin red:

```bash
pip install --no-index --find-links .offline/wheels -r requirements.txt
cd video && npm ci --offline        # necesita la cache de npm ya poblada
```

## Fallos comunes

| Sintoma | Causa | Solucion |
|---|---|---|
| Gateway responde `503` | backend caido o sin modelos | `ollama serve` + `ollama pull` |
| `Connection refused` en 8787 | gateway no arrancado | lanzalo; revisa el puerto con `--port` |
| curl a localhost sale por el proxy | `HTTPS_PROXY` global | `--noproxy '*'` (los scripts ya lo evitan internamente) |
| Respuestas truncadas | `max_tokens` bajo o `num_predict` del modelo | sube `max_tokens` en la peticion |
| El cliente se cuelga en streaming | version vieja del gateway sin `Connection: close` | actualiza `local_gateway.py` |
| El modelo ignora las herramientas | el modelo local no soporta tool calling | usa uno que si (`qwen2.5-coder`, `llama3.1`) o trabaja sin tools |
| Todo lento | modelo grande sin GPU | baja de tier: `qwen2.5-coder:7b` |
