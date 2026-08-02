# Matriz de capacidades sin internet

Detalle por herramienta. Tres estados: **igual** (no depende de red), **degradado**
(funciona via modelo local, con menos calidad) e **imposible** (no hay forma; encolar).

## Claude Code (el CLI / esta sesion)

| Capacidad | Sin red | Nota |
|---|---|---|
| Read, Write, Edit, Glob, Grep | igual | Son operaciones de disco. |
| Bash (tests, linters, build, scripts) | igual | Salvo comandos que salgan a la red. |
| Git local: status, diff, commit, branch, stash, log, rebase | igual | |
| Git remoto: fetch, pull, push, PR | imposible | Commitea y acumula; sube al reconectar. |
| Skills del repo (`.claude/skills/`, 232) | igual | Son markdown + scripts en disco. |
| Subagentes (Agent) | degradado | Consumen el mismo motor: heredan la calidad del modelo local. |
| WebSearch / WebFetch | imposible | Encolar con `offline_queue.py`. |
| MCP remotos (GitHub, Figma, Notion, Slack, Supabase…) | imposible | Fallan con timeout o DNS. |
| MCP locales (n8n en `localhost:5678`, filesystem) | igual | Si el servicio corre en la maquina. |
| **El motor de razonamiento** | degradado | Requiere gateway + modelo local; ver `instalacion-offline.md`. |

## Claude (chat / app.claude.ai) y Cowork

| Capacidad | Sin red | Nota |
|---|---|---|
| Chat con Claude en la nube | imposible | La inferencia es remota, no hay cache que sirva. |
| Artifacts publicados (claude.ai) | imposible | Publicar sube la pagina a un servidor. |
| Cowork / sesiones remotas | imposible | El contenedor vive en la nube; sin red no hay sesion. |
| Conectores (Gmail, Drive, Calendar, Linear…) | imposible | Todos son APIs remotas. |
| **Sustituto offline** | degradado | Claude Code local contra el gateway: misma interaccion conversacional, motor local. |

Consecuencia practica: **el trabajo offline se hace en la maquina, no en el navegador.**
Si el usuario esta en app.claude.ai o en Cowork y se cae la red, no hay nada que
rescatar del lado del navegador; hay que moverse al CLI local.

## Este repositorio (coldcam-app)

| Parte | Sin red | Nota |
|---|---|---|
| `run.py` / `uvicorn` | igual | El servidor levanta sin problema. |
| Rutas que llaman a `anthropic.Anthropic()` | degradado | Con `ANTHROPIC_BASE_URL` al gateway responden con el modelo local. |
| Lectura de correo IMAP / envio SMTP (`email_monitor.py`) | imposible | Gmail es remoto. |
| WhatsApp via CallMeBot | imposible | API remota. |
| NotebookLM (`notebooklm-py`) | imposible | Requiere navegador contra Google. |
| Generacion de PPTX/DOCX (`python-pptx`, `python-docx`) | igual | Todo el render es local. |
| PWA en `static/` | igual | El service worker `sw.js` cachea el shell; las rutas `/api/` no se cachean por diseno. |
| Frontend `video/` | igual si `node_modules` existe | Sin el, `npm install` falla. |

## Modelos locales: que esperar de verdad

| Tarea | Modelo local 7B | Modelo local 32B | Claude nube |
|---|---|---|---|
| Explicar un archivo, resumir codigo | aceptable | bueno | excelente |
| Refactor mecanico acotado | aceptable | bueno | excelente |
| Cambio multi-archivo con dependencias | pobre | aceptable | excelente |
| Seguir instrucciones largas y precisas | pobre | aceptable | excelente |
| Uso de herramientas (tool_use) | irregular | aceptable | excelente |
| Razonamiento de arquitectura | no | pobre | excelente |

Regla: sin red, usa el modelo local para **tareas acotadas y verificables** (donde el
test o el diff dicen si esta bien) y encola las de criterio.

## Cuando algo falla: no todo es "no hay internet"

| Sintoma | Causa probable | Verificacion |
|---|---|---|
| `Name or service not known` | DNS caido | `offline_doctor.py` lo distingue |
| `Connection refused` en localhost | el servicio local no esta arriba | `ollama serve`, `local_gateway.py` |
| Timeout solo con `api.anthropic.com` | firewall o proxy corporativo | revisa `HTTPS_PROXY`/`NO_PROXY` en el doctor |
| `403`/`407` del proxy | proxy exige auth | `curl -sS "$HTTPS_PROXY/__agentproxy/status"` |
| `401` de la API | falta o expiro `ANTHROPIC_API_KEY` | no es problema de red |

Nunca desactives la verificacion TLS ni borres `HTTPS_PROXY` para "arreglarlo".
