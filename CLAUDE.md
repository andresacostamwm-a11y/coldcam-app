# CLAUDE.md — coldcam-app

Contexto e instrucciones para Claude Code al trabajar en este repositorio.

Este archivo vive en el repositorio a propósito: la configuración de usuario
(`~/.claude/CLAUDE.md`, `~/.claude/skills/`, `~/.claude/agents/`, servidores MCP añadidos
con `claude mcp add`) **no se transfiere a las sesiones en la nube**. Solo llega lo que está
commiteado. Todo lo que deba aplicar tanto en local como en web tiene que estar aquí,
en `.claude/rules/`, en `.claude/settings.json` o en `.mcp.json`.

---

## 1. Reglas que aplican siempre

Válidas en cualquier tarea de este repositorio, sin excepción.

### Idioma y comunicación
- Responder al usuario en **español**.
- Código, nombres de variables, funciones y rutas de API en **inglés**.
- Los datos de dominio orientados al usuario final (catálogos de especialidades, textos de
  la interfaz, prompts de los agentes) van en **español**, como ya están hoy.

### Secretos y credenciales
- **Nunca** commitear `.env`, claves de API, contraseñas de aplicación de Gmail ni tokens.
  `.env` ya está en `.gitignore`; mantenerlo así.
- Cualquier variable nueva se documenta en `.env.example` con un valor **de ejemplo**, nunca
  con el valor real.
- No imprimir el contenido de variables de entorno sensibles en logs ni en respuestas de la API.
- Las sesiones en la nube no tienen almacén de secretos: lo que se ponga como variable de
  entorno del entorno es visible para cualquiera que pueda editar ese entorno.

### Git
- Trabajar siempre sobre la rama designada de la tarea. No pushear a `main` ni a otra rama
  sin permiso explícito.
- Mensajes de commit descriptivos, en el formato ya usado en el historial
  (`feat:`, `fix:`, `chore:`, `docs:`).
- No crear pull requests salvo que se pidan explícitamente.

### Alcance del cambio
- Hacer lo que se pidió; no refactorizar de paso módulos que no forman parte de la tarea.
- No añadir dependencias nuevas sin justificarlo. `requirements.txt` y `video/package.json`
  usan versiones fijadas o con mínimo: respetar ese estilo.
- No crear archivos de documentación nuevos por iniciativa propia.

### Estilo de código Python
- El código existente usa `from __future__ import annotations`, anotaciones de tipos y
  `pydantic.BaseModel` para los cuerpos de las peticiones. Mantener ese patrón.
- Imports agrupados: estándar, terceros, locales.
- Nada de comentarios que expliquen lo que la línea siguiente hace; solo comentarios que
  aporten una restricción que el código no puede expresar.

---

## 2. Reglas condicionales — solo en ciertos contextos

Cada bloque indica su disparador.

### Cuando toques el backend FastAPI (`app/main.py`)
- Punto de entrada: `run.py` → `uvicorn app.main:app` en el puerto **8000** con `reload=True`.
- Toda ruta nueva de API va bajo el prefijo `/api/`, siguiendo las existentes
  (`/api/voice`, `/api/email`, `/api/message`, `/api/document`, `/api/chat`, `/api/video`,
  `/api/notebooklm/*`, `/api/health`).
- Definir un modelo Pydantic para el cuerpo de cada `POST` en lugar de aceptar `dict` suelto.
- Errores de cliente con `HTTPException`, no con diccionarios de error improvisados.
- `CORSMiddleware` está abierto a todos los orígenes; si eso cambia, avisar antes.

### Cuando toques los agentes de ingeniería (`agents/engineering_agents.py`)
- Son 11 agentes de nivel doctoral, uno por rama de ingeniería, cada uno con su prompt de
  sistema y 3 herramientas de dominio.
- Las herramientas se declaran con el decorador `@beta_tool` y se ejecutan mediante
  `client.beta.messages.tool_runner`. No sustituir eso por un bucle manual de tool use.
- Cada herramienta necesita docstring con `Args:` — de ahí se deriva el esquema que ve el modelo.
- El prompt de sistema se envía con `cache_control: ephemeral`. Mantenerlo, porque los prompts
  son largos y el caché es lo que hace viable el coste.
- El identificador del modelo está **duplicado**: `agents/engineering_agents.py` y
  `app/main.py` definen cada uno su propia constante `MODEL`. Si se cambia, cambiar en ambos.

### Cuando toques el catálogo de especialidades (`engineering_fields.py`)
- Es una lista de diccionarios con claves `id`, `name`, `specialties`, `doctorates`.
- Los `id` son estables y se referencian desde otros módulos: no reordenarlos ni reasignarlos.
- Contenido en español.

### Cuando toques el monitor de correo (`email_monitor.py`)
- Lee Gmail por IMAP y notifica por WhatsApp vía CallMeBot; se agenda con `schedule`.
- El estado se persiste en `seen_emails.json`, que está en `.gitignore`: no commitearlo ni
  asumir que existe en un entorno nuevo.
- La lista `SENDERS` filtra remitentes por subcadena en minúsculas. Añadir entradas ahí,
  no dispersar condiciones por el código.

### Cuando toques el frontend / PWA (`static/`)
- Es una PWA sin framework ni paso de build: `index.html`, `manifest.json`, `sw.js` e iconos.
- No introducir un bundler ni un framework sin acordarlo antes.
- Al cambiar recursos cacheados, actualizar la versión del caché en `sw.js`, o los clientes
  seguirán sirviendo la versión vieja.

### Cuando toques los vídeos Remotion (`video/`)
- Remotion 4.x con React 19. Las composiciones se registran en `video/src/Root.jsx`.
- Renderizar con los scripts npm existentes (`studio`, `render:presentation`, `render:intro`,
  `render:text`), no con comandos `remotion` sueltos.
- `video/node_modules/` y `out/` están ignorados; no commitear artefactos de render.

### Cuando trabajes en una sesión en la nube (Claude Code en la web)
- Recursos aproximados: 4 vCPU, 16 GB RAM, 30 GB de disco. Las compilaciones muy pesadas
  pueden morir por memoria.
- PostgreSQL y Redis vienen instalados pero **no arrancados**: `service postgresql start`,
  `service redis-server start`.
- La CLI `gh` **no** viene instalada; usar las herramientas de GitHub integradas.
- La salida de red pasa por un proxy con lista de dominios permitidos. Un 403 del proxy es una
  denegación de política: reportarla, no intentar rodearla.
- El identificador de la sesión está en `CLAUDE_CODE_REMOTE_SESSION_ID`.

### Cuando añadas configuración que deba sobrevivir a las sesiones en la nube
- Reglas y contexto → este archivo o `.claude/rules/`.
- Hooks → `.claude/settings.json` del repositorio.
- Servidores MCP → `.mcp.json` del repositorio (ámbito de proyecto).
- Skills, subagentes y comandos → `.claude/skills/`, `.claude/agents/`, `.claude/commands/`.
- Dependencias que deban existir antes de arrancar → script de configuración del entorno;
  dependencias del proyecto que deban instalarse en local y en nube → hook `SessionStart`.

---

## 3. Reglas personales pendientes de incorporar

Esta sección está reservada para las reglas de contexto propias del usuario, que todavía no
se han podido leer: el dominio `www.tododeia.com` está bloqueado por la política de red de
este entorno (el proxy devuelve 403 en el CONNECT).

Para incorporarlas, una de dos:

1. Pegar el contenido en la conversación y pedir que se integre aquí.
2. Editar el entorno en la nube → **Acceso a la red** → **Personalizado**, añadir
   `tododeia.com` y `*.tododeia.com` a **Dominios permitidos**, dejando marcada la opción de
   incluir también la lista predeterminada. En una sesión nueva el documento será legible.
