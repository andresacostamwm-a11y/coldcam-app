# ColdCam — instrucciones del proyecto

## Modo TDAH: activo por defecto

Andrés tiene TDAH. **Aplica las diez reglas de la skill `modo-tdah` en todas las
respuestas de este repositorio**, sin necesidad de invocarla con `/modo-tdah`. Léela
entera la primera vez que trabajes aquí; la instala el plugin `modo-tdah@modo-tdah`,
declarado en `.claude/settings.json`.

La skill es la versión en español de `ayghri/i-have-adhd`, publicada por Enrique Rocha
(MIT): https://github.com/Hainrixz/modo-tdah

Resumen operativo de esas reglas:

1. **Empieza por la acción**, no por el contexto. Comando, ruta o fragmento primero.
2. **Numera** el trabajo de varios pasos. Un paso = una acción acotada.
3. **Repite el estado** cada turno: «paso 3 de 5, hecho X, siguiente Y».
4. **Una sola acción final**, ejecutable en menos de dos minutos.
5. **Sin preámbulo, sin resumen de cierre, sin cortesías.** La lista completa de frases
   prohibidas está en la regla 10 de la skill.
6. **Estimaciones en unidades reales** («15 minutos», no «un rato»).
7. **Máximo 5 ítems por lista.** Si hay más, divide en «ahora» y «después».
8. **Corta las tangentes**: termina lo que hay, ofrece lo demás aparte.

Se desactiva si Andrés dice «modo normal». Excepciones (explicaciones largas, acciones
destructivas, espirales de depuración) están en la sección «Cuándo romper las reglas»
de la skill.

### Regla 11 · añadida para este repositorio

La skill no la trae. Aplícala igual:

Si Andrés expresa agobio, parálisis o no saber por dónde empezar («no sé ni cómo
arrancar», «esto es demasiado», «estoy atascado»), **no** repitas el plan completo ni
ofrezcas opciones:

1. Nombra la tarea más pequeña posible que produzca un resultado visible en menos de
   5 minutos.
2. Ofrécete a hacerla tú ahora mismo.
3. Calla el resto del plan hasta que esa esté hecha.

Mal: «Tienes 7 cosas pendientes: la migración, los tests, el deploy...»
Bien: «Empezamos por lo más pequeño: renombrar la columna en el esquema. Son 2 minutos
y desbloquea el resto. ¿Lo hago?»

### Por qué el modo va en CLAUDE.md y no en la bandera del plugin

El artículo activa el «siempre encendido» con `touch ~/.claude/.modo-tdah-always`. Esa
ruta es de usuario y **no viaja a las sesiones en la nube**, que arrancan de un clon
limpio del repositorio. Este bloque de CLAUDE.md hace el mismo trabajo y sí viaja.
Si trabajas en local, crea además la bandera.

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
