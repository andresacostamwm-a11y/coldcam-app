---
name: "tdah-retomar"
description: "Mantiene un punto de retorno escrito para que retomar el trabajo no cueste media hora de relectura: objetivo actual, en qué paso vas, la siguiente acción concreta, las decisiones ya cerradas y los cabos sueltos. Se guarda en .claude/tdah-contexto.md y se muestra al arrancar la sesión. Úsalo cuando el usuario pregunte dónde se quedó, vuelva tras una interrupción, cambie de tarea o vaya a cerrar. Triggers: dónde me quedé, en qué estaba, retomar, volver a esto, se me olvidó, ya no sé qué hacía, resumen de la sesión, guarda el contexto, punto de retorno, me interrumpieron."
---

# Retomar (TDAH)

El coste de una interrupción con TDAH no es el minuto que dura: es reconstruir el
estado mental que se cayó. Esta skill lo escribe **antes** de que se caiga.

## El archivo

`.claude/tdah-contexto.md` — un único archivo, siempre el mismo, sobrescrito. No es un
historial; es una foto del **ahora**. Si crece más de una pantalla, está mal usado.

Plantilla:

```markdown
# Contexto — actualizado 2026-08-02 11:40

## Objetivo
Una frase. Qué se está intentando conseguir, no cómo.

## Estado
Paso 3 de 5. Hecho: esquema migrado, tests verdes.

## Siguiente acción
UNA cosa concreta, ejecutable en menos de 5 minutos.
Ej: `abrir src/auth.ts:42 y sustituir verifyToken`

## Decisiones cerradas (no reabrir)
- Usamos JWT, no sesiones. Motivo: el móvil no guarda cookies bien.
- La migración va en dos fases, no una.

## Cabos sueltos
- El README menciona la API vieja
- Falta decidir el TTL del token
```

## Cuándo escribirlo

Actualízalo **sin que te lo pidan** en estos momentos:

1. Al terminar un paso de una tarea de varios pasos
2. Cuando el usuario dice que se va, que vuelve luego o que le interrumpen
3. Antes de un cambio de tema grande
4. Cuando se cierra una decisión que costó discutir

Actualízalo **cuando te lo pidan**: «guarda dónde vamos», «apunta esto».

## Cuándo leerlo

- Al arrancar la sesión (el hook `SessionStart` ya lo muestra automáticamente)
- Cuando el usuario pregunta «¿dónde me quedé?», «¿en qué estaba?»
- Cuando notes que el usuario está repitiendo una pregunta ya resuelta: consulta
  **Decisiones cerradas** y recuérdaselo en una línea en vez de volver a debatirla

## Reglas de escritura

- **Sobrescribe, no acumules.** Un contexto de 200 líneas no lo lee nadie, que es
  justo el problema que intenta resolver.
- **Siguiente acción, siempre una.** Si hay tres candidatas, elige la más pequeña y
  mete las otras en cabos sueltos.
- **Decisiones cerradas son cerradas.** Su función es evitar re-litigar lo mismo cada
  vez que baja la energía. Solo se reabre si el usuario lo pide explícitamente.
- **Sin narrativa.** Nada de «estuvimos explorando varias opciones y finalmente...».
  Estado, no crónica.

## Al cerrar la sesión

Si el usuario indica que termina, haz dos cosas en este orden:

1. Actualiza el archivo
2. Devuelve **tres líneas**: qué funciona ahora, cuál es la siguiente acción, y qué
   quedó pendiente

No añadas resumen largo. El archivo ya lo tiene; la respuesta solo necesita cerrar
el bucle.

## Interacción con `modo-tdah`

`modo-tdah` regla 5 pide repetir el estado **dentro** de la sesión. Esta skill lo
conserva **entre** sesiones. Usa las dos: la primera evita perderse en el turno, la
segunda evita perderse en el día.
