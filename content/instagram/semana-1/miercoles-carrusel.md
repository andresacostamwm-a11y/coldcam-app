# Miércoles — Carrusel (10 slides) · Nivel intermedio-avanzado

## Slides

**Slide 1 (portada):**
7 PATRONES de diseño de agentes
Cuál usar y cuándo (con ejemplos reales) →

**Slide 2:**
① Tool Use básico
Un LLM + herramientas + loop acotado.
✅ Úsalo para: tareas de un dominio (gestionar correo, consultar una API).
El 80 % de los casos reales se resuelven aquí.

**Slide 3:**
② Reflection (auto-crítica)
El agente genera → otro paso critica → corrige.
✅ Úsalo para: código, textos legales, cálculos.
⚠️ Duplica costo. Actívalo solo donde el error es caro.

**Slide 4:**
③ Planning (planificar-ejecutar)
Primero descompone el objetivo en pasos, luego ejecuta.
✅ Úsalo para: tareas largas multi-paso.
⚠️ Los planes se degradan: re-planifica cada N pasos.

**Slide 5:**
④ Router / Dispatcher
Un clasificador barato decide qué agente especialista atiende.
✅ Úsalo para: sistemas con dominios distintos.
💡 El router puede ser un modelo pequeño = ahorro brutal.

**Slide 6:**
⑤ Multi-agente jerárquico
Orquestador + especialistas + verificador.
✅ Úsalo para: pipelines complejos (yo lo uso con 11 agentes de ingeniería).
⚠️ Cada agente extra = más latencia y más puntos de fallo.

**Slide 7:**
⑥ Human-in-the-loop
El agente propone, el humano aprueba lo irreversible.
✅ Úsalo para: pagos, envíos, publicaciones, producción.
No es opcional en negocio serio. Es la red de seguridad.

**Slide 8:**
⑦ Evaluator-Optimizer
Un agente genera N opciones → un juez puntúa → se itera.
✅ Úsalo para: calidad máxima (contenido, diseño, estrategias).
⚠️ El más caro. Resérvalo para el output final.

**Slide 9:**
Árbol de decisión rápido:
• ¿Un dominio, pasos cortos? → ① Tool Use
• ¿Error caro? → añade ② Reflection
• ¿Varios dominios? → ④ Router
• ¿Pipeline complejo? → ⑤ Jerárquico
• ¿Acciones irreversibles? → ⑥ SIEMPRE

**Slide 10 (cierre):**
📌 Guarda este carrusel — es tu chuleta de arquitectura
💬 Comenta "PATRONES" y te mando la versión extendida con diagramas
➕ Sígueme: cada semana, ingeniería de agentes sin humo

## Caption

🏗️ 7 patrones de diseño de agentes: cuál usar y cuándo.

Todo el mundo habla de "agentes". Casi nadie te dice que hay patrones concretos — y que elegir mal el patrón es la diferencia entre un sistema que funciona y uno que quema tokens dando vueltas.

Estos 7 los uso a diario construyendo sistemas multi-agente en producción (incluido uno con 11 agentes especialistas de ingeniería). Desliza: cada patrón con su caso de uso y su trampa. 👉

💬 Comenta "PATRONES" y te mando la versión extendida con diagramas.
📌 Guárdalo para tu próxima arquitectura.

#AgentesIA #AIEngineering #IA #LLM #ArquitecturaDeSoftware #MachineLearning #MultiAgente #ToolUse #InteligenciaArtificial #DesarrolloDeSoftware #Automatizacion #n8n #TechEnEspañol
