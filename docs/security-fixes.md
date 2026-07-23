# Correcciones de seguridad — auditoría Cyber Neo (2026-07-22)

Este documento resume las correcciones aplicadas tras la auditoría de Cyber Neo
(reporte completo: `cyber-neo-report-coldcam-app-2026-07-22.md`).

## ✅ Aplicado en código

| ID | Severidad | Corrección |
|----|-----------|-----------|
| CN-001 | Crítico | Middleware de autenticación por `X-API-Key` en todas las rutas `/api/*` (excepto `/` y `/api/health`). Sin `APP_API_TOKEN` configurado, la API rechaza todo (fail-closed). El frontend inyecta el token vía wrapper de `fetch`. |
| CN-002 | Crítico | Se eliminó `eval()` del intent `calculator`; ahora usa `_safe_eval()`, un evaluador aritmético basado en AST que rechaza llamadas, nombres y atributos. |
| CN-003 | Alto | CORS restringido a `ALLOWED_ORIGINS` (sin comodín), métodos/headers acotados, `allow_credentials=False`. |
| CN-004 | Alto | `run.py` ya no fija `0.0.0.0`/`reload=True`: por defecto `127.0.0.1` sin reload; host/port/reload salen del entorno (`HOST`, `PORT`, `ENV=dev`). |
| CN-007 | Medio | Los handlers ya no devuelven `str(e)` al cliente; loguean del lado servidor y responden con mensajes genéricos. `/docs` y `/openapi.json` solo se exponen con `ENV=dev`. |
| CN-008 | Medio | `email_monitor.py` y el backend usan `logging` sin volcar contenido de correos, teléfonos ni cuerpos de respuesta de terceros. |
| CN-009 | Medio | Nombres de documentos/videos generados usan `secrets.token_urlsafe(16)` (~128 bits) en vez de 8 hex; `static/docs/` añadido a `.gitignore`. |
| CN-012 | Bajo | Validación anti-SSRF (`_validate_public_url`) en las fuentes URL/YouTube de NotebookLM: rechaza esquemas no http(s) y direcciones privadas/link-local. |
| CN-013 | Bajo | El calculador del frontend reemplaza `Function()` por `safeCalc()`, un parser numérico de descenso recursivo (sin generación de código). |
| CN-014 | Bajo | `escapeHtml` ahora codifica `'` y `/`; se escapa `emails[0].error` antes de insertarlo. |
| CN-015 | Bajo | Middleware que añade CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` a todas las respuestas. |
| CN-016 | Bajo | `.gitignore` ampliado: `.env.*`, `*.pem/*.key/*.p12/...`, `id_rsa*`, `credentials.json`, `service-account*.json`, `.npmrc`, `.pypirc`, `.claude/settings.local.json`. |

## ⏳ Pendiente (requiere red / decisión)

- **CN-005 / CN-006 / CN-011 (High/Medium — dependencias npm):** subir la suite de
  Remotion a **≥4.0.464** y regenerar el lockfile para cerrar `ws` (DoS) y `fast-uri`
  (host confusion). Requiere red: `cd video && npm install @remotion/cli@^4.0.464 ...`
  (todos los `@remotion/*` y `remotion` a la misma versión) y luego `npm audit`.
- **CN-010 / CN-017 (Medium/Low — lockfile Python):** adoptar `uv lock` o
  `pip-compile --generate-hashes` para fijar versiones exactas con hashes.
- **CN-018 (Low):** fijar `notebooklm-py` a una versión exacta auditada y ejecutarlo
  con credenciales de mínimo privilegio.
- **CN-019 (Low):** registrar el commit SHA de origen de la biblioteca de skills vendorizada.
- **CN-020 (Info):** mover `N8N_API_KEY` a `.claude/settings.local.json` (ignorado) o
  expandirlo desde el entorno; hoy es un placeholder, sin secreto expuesto.
- **CN-021 (Info):** añadir CI que corra `pip-audit` y `npm audit` en cada cambio.

## Nuevas variables de entorno

Ver `.env.example`. Obligatorias para operar la API:

- `APP_API_TOKEN` — clave compartida que el frontend envía como `X-API-Key`.
- `ALLOWED_ORIGINS` — orígenes permitidos por CORS (separados por coma, sin comodín).
- `ENV` — `dev` habilita reload y `/docs`; cualquier otro valor = modo producción.
