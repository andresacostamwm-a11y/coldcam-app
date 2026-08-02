---
name: "tdah-recordatorios"
description: "Programa recordatorios con hora para compensar la ceguera temporal del TDAH: horas de parada, reuniones, descansos tras sesiones largas y ventanas de despliegue. Los avisos se guardan en SQLite y aparecen automáticamente al enviar el siguiente mensaje. Úsalo cuando el usuario mencione una hora límite ('párame a las 11', 'tengo daily en 30 minutos', 'recuérdame que...') o lleve más de dos horas seguidas sin descanso. Triggers: recuérdame, avísame, párame a las, tengo reunión, en 30 minutos, hora límite, descanso, llevo horas, se me pasa la hora, ceguera temporal."
license: MIT
---

# Recordatorios TDAH

Sistema de avisos para gestionar foco y ritmo. Los recordatorios se guardan en SQLite
y salen por pantalla mediante un hook cuando vencen.

Adaptado de [`ravila4/claude-adhd-skills`](https://github.com/ravila4/claude-adhd-skills) (MIT).

## Por qué existe

El TDAH trae **ceguera temporal**: dos horas y veinte minutos se sienten igual. Un
recordatorio externo con hora concreta sustituye a un reloj interno que no avisa.

## Cuándo usarla

Programa un recordatorio **de forma proactiva** cuando:

- El usuario menciona una hora de parada («párame a las 11», «tengo que cerrar a las 5»)
- El usuario menciona una reunión o fecha límite («daily en 30 minutos»)
- Lleva 2 horas o más de sesión sin descanso
- Pide un recordatorio explícitamente

**No la uses para:**

- Tareas que vas a completar en este mismo turno
- Información que debería ir a memoria en lugar de a un aviso
- **Vigilar procesos** («mira si terminó el build», «comprueba si pasó el pipeline»).
  Los recordatorios necesitan que el usuario envíe un mensaje para dispararse, así que
  no pueden vigilar procesos en marcha. Para eso usa `sleep <segundos>` en Bash, que
  bloquea en línea y continúa sin intervención.

## Comandos

Desde la raíz del proyecto:

```bash
S=.claude/skills/tdah-recordatorios/scripts/recordatorios.py

# Crear
python3 $S add "23:00" "el usuario pidió parar a las 11 - proponer cierre y resumen"
python3 $S add "+45m"  "sesión larga de depuración - comprobar si sigue atascado"

# Ver pendientes
python3 $S list

# Marcar como atendido (obligatorio, si no se repite)
python3 $S ack 3
```

### Formatos de hora aceptados

| Formato | Significado |
|---|---|
| `HH:MM` | Hoy a esa hora. **Si ya pasó, se programa para mañana.** |
| `YYYY-MM-DD HH:MM` | Fecha y hora concretas |
| `+30m` | Dentro de 30 minutos |
| `+2h` | Dentro de 2 horas |

## Formato del mensaje

Los mensajes son notas para ti, no para el usuario. Incluye dos cosas:

1. **Motivo** — por qué se programó
2. **Acción** — qué hacer cuando salte

Formato: `motivo - acción a tomar`

Ejemplos:

```
el usuario pidió parar a las 11 - cerrar lo abierto y proponer descanso
daily en 30m - recordar que prepare las notas
2 horas depurando - comprobar si está atascado, sugerir pausa
ventana de despliegue a las 14:00 - recordar que lance el script de deploy
```

## Qué hacer cuando salta uno

Los recordatorios vencidos aparecen en el `system-reminder` al enviar el usuario su
siguiente mensaje. Cuando salte uno:

1. Lee el mensaje para entender motivo y acción
2. Ejecuta la acción indicada (avisar, sugerir descanso, recordar la reunión)
3. **Márcalo como atendido** con `ack <id>`, o volverá a salir en cada turno

## Instalación del hook

Ya está conectado en `.claude/settings.json` mediante `UserPromptSubmit`. Si lo pierdes,
la entrada es:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": "python3 .claude/skills/tdah-recordatorios/scripts/recordatorios.py check",
        "timeout": 5000
      }
    ]
  }
}
```

## Dónde se guardan

`.claude/recordatorios.db` (SQLite, ignorado por git). Vive fuera de la carpeta de la
skill para que sobreviva a una reinstalación de skills.

```sql
CREATE TABLE recordatorios (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    vence_en  TEXT NOT NULL,      -- "YYYY-MM-DD HH:MM", hora local
    mensaje   TEXT NOT NULL,      -- motivo - acción
    creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atendido  INTEGER NOT NULL DEFAULT 0
);
```

## Límites conocidos

- **Necesita interacción.** Un recordatorio solo salta cuando el usuario envía un
  mensaje. Si cierra el portátil a las 22:50, el aviso de las 23:00 saldrá cuando
  vuelva, no a su hora.
- **Hora local del contenedor.** Si el entorno corre en UTC y tú no, las horas
  absolutas (`23:00`) se desviarán. Los desplazamientos (`+2h`) no tienen ese problema.
  Comprueba con `date` si algo no cuadra.
