# Contexto — actualizado 2026-08-02 11:15

## Objetivo
Dejar el modo TDAH instalado y funcionando en ColdCam, y sanear las 232 skills ya
importadas.

## Estado
Hecho: 24 descripciones de skills reescritas (commit ff506e6). Instaladas y verificadas
las skills `modo-tdah`, `tdah-recordatorios` y `tdah-retomar`, con hooks `SessionStart`
y `UserPromptSubmit` activos en `.claude/settings.json`.

## Siguiente acción
Desbloquear `tododeia.com` en la política de red del entorno, o pegar el artículo
«Modo TDAH» en el chat, para poder ejecutar sus pasos originales.

## Decisiones cerradas (no reabrir)
- Las skills viven en `.agents/skills/` y `.claude/skills/` son symlinks. Se mantiene
  esa convención para las nuevas.
- El modo TDAH va activo por defecto vía `CLAUDE.md`, no invocado a mano.
- No se recalculan los hashes de `skills-lock.json`: ocultaría que las descripciones
  están modificadas en local.

## Cabos sueltos
- `tododeia.com` sigue bloqueado por la política de red (403 del gateway).
- Sin instalar: la skill de ideación divergente `uditakhourii/adhd` (gasta ~10 agentes
  por invocación). Pendiente de que Andrés la pida.
- `.claude/settings.json` lleva `N8N_API_KEY` con valor de marcador.
