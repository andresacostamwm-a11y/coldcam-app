# CodexBar

[CodexBar](https://github.com/steipete/CodexBar) es una app de barra de menús
para **macOS 14+** que muestra los límites de uso de proveedores de IA (Codex,
OpenAI, Claude, Cursor, Gemini, Copilot y ~59 más) con cuenta regresiva hasta
cada reinicio de ventana. También publica un **CLI** (`codexbar`) con binarios
para macOS y Linux.

## Instalación rápida

```bash
./scripts/install_codexbar.sh
```

El script detecta el sistema:

| Sistema | Método |
|---|---|
| macOS con Homebrew | `brew install --cask codexbar` |
| macOS sin Homebrew | Descarga `CodexBar-macos-universal-<ver>.zip` a `/Applications` |
| Linux | Descarga `CodexBarCLI` a `~/.local/bin/codexbar` |

Variables opcionales:

- `CODEXBAR_VERSION=v0.42.1` — fija una versión concreta (por defecto, la última).
- `CODEXBAR_FLAVOR=linux-musl` — binario estático para distros con glibc antigua.
- `CODEXBAR_PREFIX=/usr/local/bin` — destino del binario en Linux.

## Primer uso

1. Abre la app (macOS) y ve a **Settings → Providers**; activa los proveedores
   que uses (Codex, Claude, etc.). CodexBar reutiliza tus sesiones existentes
   (OAuth, CLIs, cookies del navegador o API keys) — no guarda contraseñas.
2. En CLI: `codexbar config providers`, `codexbar config enable --provider claude`.

## Nota sobre el entorno remoto de Claude Code

Este contenedor Linux no puede ejecutar la app (es exclusiva de macOS) y su
política de red bloquea tanto los binarios de GitHub Releases como el
toolchain de Swift necesario para compilar el CLI, por lo que la instalación
debe hacerse en tu máquina con el script de arriba.
