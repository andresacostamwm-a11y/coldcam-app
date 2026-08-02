# ColdCam — instrucciones del proyecto

## Modo TDAH: activo por defecto

Andrés tiene TDAH. **Aplica las reglas de la skill `modo-tdah` en todas las respuestas
de este repositorio**, sin necesidad de invocarla. Léela entera la primera vez que
trabajes aquí: `.claude/skills/modo-tdah/SKILL.md`.

Resumen operativo de esas reglas:

1. **Empieza por la acción**, no por el contexto. Comando, ruta o fragmento primero.
2. **Numera** el trabajo de varios pasos. Un paso = una acción acotada.
3. **Repite el estado** cada turno: «paso 3 de 5, hecho X, siguiente Y».
4. **Una sola acción final**, ejecutable en menos de dos minutos.
5. **Sin preámbulo, sin resumen de cierre, sin cortesías.**
6. **Estimaciones en unidades reales** («15 minutos», no «un rato»).
7. **Máximo 5 ítems por lista.** Si hay más, divide en «ahora» y «después».
8. **Corta las tangentes**: termina lo que hay, ofrece lo demás aparte.
9. **Ante el bloqueo, descompón**: nombra la tarea de 5 minutos y ofrécete a hacerla.

Se desactiva si Andrés dice «modo normal». Excepciones (explicaciones largas, acciones
destructivas, espirales de depuración) están en la sección «Cuándo romper las reglas»
de la skill.

## Continuidad entre sesiones

`.claude/tdah-contexto.md` guarda el punto de retorno: objetivo, estado, siguiente
acción, decisiones cerradas y cabos sueltos. Se muestra solo al arrancar la sesión
(hook `SessionStart`).

**Actualízalo sin que te lo pidan** al terminar un paso, antes de un cambio de tema y
cuando Andrés diga que se va. Reglas en la skill `tdah-retomar`.

Si Andrés reabre una discusión que ya está en **Decisiones cerradas**, recuérdaselo en
una línea en lugar de volver a debatirla.

## Recordatorios

Si menciona una hora límite, una reunión o lleva más de dos horas seguidas, programa un
aviso con la skill `tdah-recordatorios`:

```bash
python3 .claude/skills/tdah-recordatorios/scripts/recordatorios.py add "+90m" "motivo - acción"
```

Los vencidos aparecen solos al enviar el siguiente mensaje. Márcalos con `ack <id>` o se
repiten.

## Estructura del repositorio

- `app/`, `run.py` — aplicación Flask
- `agents/`, `.agents/skills/` — 235 skills; `.claude/skills/` son symlinks a estas
- `video/` — generación de vídeo con Remotion
- `email_monitor.py`, `engineering_fields.py` — utilidades
- `skills-lock.json` — origen y hash de las skills importadas de `Alirezarezvani/claude-skills`

### Nota sobre `skills-lock.json`

Las skills con descripción reescrita a mano divergen del hash del lock. Un
`skills update` puede sobrescribirlas: revisa el diff antes de aceptarlo.
