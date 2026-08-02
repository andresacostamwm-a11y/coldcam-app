---
name: modo-offline
description: Trabajar con Claude, Claude Code, Cowork y design code sin internet. Diagnostica el estado de red, levanta un gateway local compatible con la API de Anthropic (Ollama) para que Claude Code y app/main.py sigan funcionando sin conexion, genera diseno y codigo 100% self-contained (cero CDN) y encola las tareas que exigen nube para retomarlas al reconectar. Usalo cuando el usuario diga sin internet, sin conexion, offline, se cayo la red, modo avion, no tengo wifi, trabajar local, modelo local, ollama, llama.cpp, gateway local, ANTHROPIC_BASE_URL, sin API key, ahorrar datos, o cuando una herramienta falle por DNS, timeout, connection refused o proxy.
---

# Modo offline

Mantener a Claude, Claude Code, Cowork y el trabajo de diseno/codigo operativos
cuando no hay internet — y dejar preparado el terreno mientras si lo hay.

## Lo primero: se honesto sobre el limite

Claude en la nube **necesita internet**: la inferencia ocurre en los servidores de
Anthropic. No existe forma de ejecutar Claude Opus/Sonnet en la maquina del usuario.
Nunca prometas lo contrario.

Lo que si se puede, y es lo que hace esta skill:

1. **Sustituir el motor**, no el cliente: un modelo local (Ollama) detras de un gateway
   que habla el protocolo de Anthropic. Claude Code, el SDK `anthropic` y `app/main.py`
   siguen funcionando igual — con menos calidad, pero funcionando.
2. **Aprovechar todo lo que nunca necesito red**: leer y editar archivos, refactorizar,
   git local, ejecutar tests, generar HTML/CSS/SVG/PPTX/DOCX, las 232 skills del repo.
3. **No perder el trabajo bloqueado**: lo que exige nube se encola con contexto y se
   despacha al reconectar.

## Flujo

### Paso 1 — Diagnostica siempre antes de opinar

```bash
python3 .claude/skills/modo-offline/scripts/offline_doctor.py
python3 .claude/skills/modo-offline/scripts/offline_doctor.py --json   # para parsear
```

Devuelve el estado de red (`online` / `degradado` / `offline`), si hay backend y
gateway local, y una **matriz de capacidades** con lo que se puede hacer ahora mismo.
No asumas que "falla la herramienta" es falta de red: el doctor distingue DNS,
timeout, proxy y connection refused.

### Paso 2 — Actua segun el estado

| Estado | Que hacer |
|---|---|
| **online** | Trabajo normal + **preparar el offline**: `bash .../scripts/offline_pack.sh` (wheels, node_modules, modelos, inventario). Vaciar la cola pendiente. |
| **degradado** (hay red, no hay `api.anthropic.com`) | Casi siempre es proxy o firewall. Revisa `HTTPS_PROXY`/`NO_PROXY` en la salida del doctor antes de dar por muerta la conexion. |
| **offline** | Levantar el gateway local, seguir trabajando en local, encolar lo que necesite nube. |

### Paso 3 — Gateway local (el nucleo)

```bash
# 1. backend de modelo (una sola vez, requiere haber hecho `ollama pull` con red)
ollama serve &

# 2. gateway compatible con la API de Anthropic
python3 .claude/skills/modo-offline/scripts/local_gateway.py &

# 3. apuntar cualquier cliente Anthropic al gateway
export ANTHROPIC_BASE_URL=http://127.0.0.1:8787
export ANTHROPIC_API_KEY=offline        # no se valida, pero los SDK lo exigen
claude                                   # Claude Code ya corre contra el modelo local
```

Verificado contra el SDK oficial `anthropic`: respuestas normales, streaming SSE y
`tool_use`. Con esas mismas variables, `app/main.py` de este repo funciona sin tocar
una linea de codigo.

Utilidades:

```bash
python3 .../local_gateway.py --check                    # backend y modelos disponibles
python3 .../local_gateway.py --port 9000 --model llama3.1:8b
curl -s --noproxy '*' http://127.0.0.1:8787/health
OFFLINE_MODEL_MAP='{"claude-opus-5":"qwen2.5-coder:32b"}' python3 .../local_gateway.py
```

Detalle de instalacion, eleccion de modelo y troubleshooting:
`references/instalacion-offline.md`.

### Paso 4 — Encola lo que no se puede hacer sin nube

```bash
python3 .../scripts/offline_queue.py add "Buscar breaking changes de FastAPI 0.120" \
    --necesita nube --prioridad alta --contexto "bloquea el upgrade de requirements"
python3 .../scripts/offline_queue.py list --pendientes
python3 .../scripts/offline_queue.py briefing --out .offline/briefing.md
```

Al recuperar la conexion, lee `briefing` y retoma las tareas por prioridad antes de
empezar cosas nuevas.

## Reglas de trabajo sin conexion

- **Nunca inventes lo que no puedes verificar.** Sin red no hay WebSearch, WebFetch ni
  MCP remotos. Si una version, un precio o una API no esta en disco, dilo y encolalo —
  no lo adivines.
- **Prefiere lo local antes que rendirte.** Antes de decir "necesito internet": ¿esta la
  respuesta en `.claude/skills/`, en `node_modules/`, en el codigo, en `git log`?
- **Cero dependencias nuevas.** `pip install` y `npm install` fallan sin red. Usa stdlib,
  o `.offline/wheels`: `pip install --no-index --find-links .offline/wheels -r requirements.txt`.
- **Diseno y codigo self-contained.** Nada de CDN, Google Fonts ni imagenes remotas: sin
  red se rompen y no te enteras. Ver `references/diseno-offline.md`.
- **Marca el modo en el resultado.** Si algo se genero con el modelo local en vez de con
  Claude, dilo: la calidad no es la misma y el usuario debe poder revisarlo.
- **Git local si, push no.** Commitea normal; el push se acumula y se envia al reconectar
  (el doctor reporta los commits sin subir).

## Que se puede hacer sin internet

Resumen; el detalle por herramienta esta en `references/matriz-capacidades.md`.

| Funciona igual | Funciona degradado | Imposible |
|---|---|---|
| Leer/editar/buscar codigo, refactors, tests, git local, skills del repo, generar HTML/SVG/PPTX/DOCX/XLSX, previsualizar con `python3 -m http.server` | Claude Code y `app/main.py` via gateway + modelo local (peor razonamiento y seguimiento de instrucciones) | WebSearch, WebFetch, MCP remotos, `pip`/`npm install` nuevos, push/PR, modelos de Anthropic, imagenes hacia el modelo local |

## Preparacion (hazlo mientras hay red)

```bash
bash .claude/skills/modo-offline/scripts/offline_pack.sh              # vendoriza todo
bash .claude/skills/modo-offline/scripts/offline_pack.sh --verificar  # audita que falta
bash .claude/skills/modo-offline/scripts/offline_pack.sh --solo modelos --modelo qwen2.5-coder:7b
```

Deja en `.offline/` los wheels de `requirements.txt`, `video/node_modules`, los modelos
de Ollama y un inventario de skills. Sin este paso previo, el modo offline se reduce a
edicion manual: dilo claramente en vez de fingir capacidades.

## Archivos

```
scripts/offline_doctor.py    diagnostico y matriz de capacidades (--json)
scripts/local_gateway.py     gateway Anthropic -> Ollama (stdlib, sin dependencias)
scripts/offline_queue.py     cola de tareas bloqueadas + briefing al reconectar
scripts/offline_pack.sh      vendoriza dependencias y modelos con red disponible
references/matriz-capacidades.md   detalle por herramienta: Claude, Claude Code, Cowork, MCP
references/instalacion-offline.md  instalar Ollama, elegir modelo, arranque automatico, fallos comunes
references/diseno-offline.md       design code sin CDN: fuentes, iconos, imagenes, preview, PWA
assets/offline.env.example         variables listas para copiar
```
