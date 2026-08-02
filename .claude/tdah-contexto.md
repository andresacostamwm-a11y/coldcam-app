# Contexto — actualizado 2026-08-02 11:40

## Objetivo
Dejar el modo TDAH del artículo de tododeia instalado y funcionando en ColdCam, y
sanear las skills ya importadas.

## Estado
Terminado. Dominio desbloqueado por Andrés, artículo leído, sus cuatro comandos
ejecutados. Plugin `modo-tdah@modo-tdah` instalado y verificado (el hook inyecta 144
líneas al arrancar). Mi skill `modo-tdah` duplicada se retiró en favor de la oficial.
Siguen instaladas `tdah-recordatorios` y `tdah-retomar`. 24 descripciones de skills
reescritas antes (commit ff506e6).

## Siguiente acción
Decidir qué hacer con `docs/tododeia-community.md`: son 248 guías, no skills
instalables. Elegir cuáles interesan en vez de intentar instalarlas todas.

## Decisiones cerradas (no reabrir)
- Las skills viven en `.agents/skills/` y `.claude/skills/` son symlinks.
- El modo TDAH va activo por defecto vía `CLAUDE.md`, no por la bandera
  `~/.claude/.modo-tdah-always`: esa ruta es de usuario y no viaja a las sesiones en
  la nube.
- Entre mi versión de la skill y la del plugin gana la del plugin: su regla 10 es más
  completa y se actualiza sola. Mi regla 11 (descomponer ante el bloqueo) se conservó
  en `CLAUDE.md`.
- No se recalculan los hashes de `skills-lock.json`.

## Cabos sueltos
- WebFetch devuelve 403 en tododeia aunque curl dé 200: tiene su propio filtro. Para
  leer ese sitio hay que usar curl.
- Chromium no atraviesa el proxy del entorno (certificado no confiable), así que los
  SPA hay que leerlos desde sus chunks JS.
- Sin instalar: `uditakhourii/adhd` (ideación divergente, ~10 agentes por invocación).
- `.claude/settings.json` lleva `N8N_API_KEY` con valor de marcador.
