---
name: orden-de-produccion
description: >
  Pipeline obligatorio de producción de entregables de Vertex AI Engineering:
  [1] Fable 5 (razonamiento y arquitectura) → [2] Opus 5 (producción del entregable
  con branding BP) → [3] Auditoría adversarial "SOL PRO" (solo diffs) → [2] Opus 5
  (aplica diffs aceptados) → [TÚ] decisión y firma del usuario. Úsalo SIEMPRE que el
  usuario pida un entregable formal (Word, PPTX, Excel, informe, análisis CAPEX,
  comparativa de proveedores, blueprint) o invoque /orden-de-produccion.
---

# Orden de producción — pipeline multi-modelo

Cuando esta skill se activa, DEBES ejecutar el trabajo siguiendo esta secuencia
estricta, sin saltarte ni reordenar etapas:

```
[1] FABLE 5 (arquitecto-fable)   →  Razonamiento y arquitectura
     ↓ (spec, cálculos, criterios de aceptación)
[2] OPUS 5 (productor-opus)      →  Producción del entregable + iteración
     ↓ (Word/PPTX/Excel con branding BP)
[3] SOL PRO (auditor-sol-pro)    →  Auditoría adversarial (solo diffs)
     ↓ (discrepancias con referencia de línea)
[2] OPUS 5 (productor-opus)      →  Aplica los diffs aceptados
     ↓
[TÚ] Usuario                     →  Decisión y firma
```

## Reglas de ejecución

1. **Etapa 1 — Arquitecto.** Lanza el subagente `arquitecto-fable` (Agent tool,
   `subagent_type: "arquitecto-fable"`, síncrono) con el encargo del usuario.
   Guarda su salida completa (SPEC + CÁLCULOS + AC + RIESGOS).
2. **Etapa 2 — Producción.** Lanza `productor-opus` en modo PRODUCCIÓN pasándole
   la spec VERBATIM. El entregable debe declarar el estado de cada AC.
3. **Etapa 3 — Auditoría.** Lanza `auditor-sol-pro` pasándole la spec Y el
   entregable. Su salida son solo diffs con referencia de línea.
4. **Triaje de diffs.** Diffs de severidad CRÍTICA o MAYOR se aceptan por defecto;
   los MENORES se listan para que el usuario decida. Si hay `SIN DIFFS`, salta a 6.
5. **Etapa 4 — Aplicación.** Relanza `productor-opus` en modo APLICAR DIFFS con
   la lista de diffs aceptados. Exige changelog.
6. **Etapa final — El usuario decide.** Presenta al usuario: entregable final,
   estado de los AC, diffs aplicados/pendientes y changelog. **NUNCA declares el
   entregable como aprobado ni firmado: la decisión y la firma son exclusivamente
   del usuario.** Termina el turno pidiendo su decisión.

## Prohibiciones

- No producir el entregable directamente sin pasar por la etapa 1.
- No omitir la auditoría (etapa 3) aunque el entregable "parezca correcto".
- El productor nunca audita su propio trabajo; el auditor nunca produce contenido.
- Ningún agente (ni tú como orquestador) firma o aprueba en nombre del usuario.

## Nota de modelos

| Etapa | Rol de la orden | Subagente | Modelo en este entorno |
|-------|-----------------|-----------|------------------------|
| 1 | FABLE 5 | `arquitecto-fable` | `claude-fable-5` |
| 2 y 4 | OPUS 5 | `productor-opus` | `claude-opus-5` |
| 3 | SOL PRO | `auditor-sol-pro` | `claude-sonnet-5` (sustituto; SOL PRO no existe como modelo Claude — editar `model:` en `.claude/agents/auditor-sol-pro.md` para cambiarlo) |
