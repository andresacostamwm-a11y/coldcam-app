# Carruseles diarios — Semana 2 (vie 31 jul → mar 4 ago 2026) · Versión PRO

Generados con `gen-diarios.cjs` @ 79ce258 (plantilla OFICIAL v2). Contenido
intermedio-avanzado, datos re-verificados contra fuentes primarias e
independientes el 30-jul-2026. Verificación programática en las 50 slides:
avatar en columna derecha sin solapes (textMaxRight 620 ≤ imgLeft 652) y sin
desborde vertical (maxBottom 1298 ≤ 1350). Outfit distinto en cada slide.

Base CDN: `https://d2ol7oe51mr4n9.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/<id>.png`

## Viernes 31 julio — Claude Code PRO (subagentes, hooks, MCP)

Slides s01→s10:
1. cbdb7d0a-ad60-4b0d-9976-3f24cea07fc1
2. 3e803dc5-c155-4b0b-ac44-c4ba40f3913f
3. 9d1d0965-7d3d-4708-947e-372e10cc70ad
4. c7aa1d39-26a1-400c-b75c-6bc9fb67a266
5. 447ad9d5-b3f7-4b6f-bea7-6db61c5042d5
6. b46582a4-26ff-4fd4-8863-666fa0a5347b
7. a2f11a67-6664-4e87-8fba-c51355ff26f2
8. 5d4cc2c3-8942-442b-a1ad-92024fc49805
9. c1c3ee27-6cfd-4077-8374-f02a00b2d441
10. 203390c7-5939-4e02-9085-bf60a61879ad

**Caption:**
Claude Code en julio 2026 no es un asistente: es un harness de agentes en tu terminal 🤖

Guía PRO con lo que cambia tu forma de trabajar:
⚡ Opus 5: 1M de contexto, 128K de salida, 97.0% SWE-bench Verified (nº1)
⚡ Subagentes anidados hasta profundidad 3 + background que sobrevive reinicios
⚡ Agentes a medida en .claude/agents/*.md: tools, model, effort y budget por YAML
⚡ MCP 2026-07-28: OAuth/OIDC + Apps y Tasks versionados
⚡ Context engineering: CLAUDE.md + hooks + skills con progressive disclosure

Guárdalo 📌 y comenta "CODE" para la guía de subagentes.
Fuentes: changelog y docs oficiales de Anthropic + leaderboards independientes (verificado 30-jul-2026).

#ClaudeAI #ClaudeCode #AgentesIA #IA #InteligenciaArtificial #Programacion #DesarrolloDeSoftware #Automatizacion #TechEnEspañol #APIs #MachineLearning #AprendeIA

## Sábado 1 agosto — Agentes con Claude (SDK, memoria, orquestación)

Slides s01→s10:
1. 6d1c7b98-687f-4934-8821-531fc1cc6199
2. 971a259b-f8fd-44de-86a9-76050ac10b02
3. 79314f26-a7e0-4012-8fff-4c6e9fc50a85
4. a6b1775a-f760-4358-b151-d46d0ebbb482
5. 76f4e4ff-af76-4235-9aa6-4c02c51afcda
6. 296132ab-4577-4f4a-b642-6bf0dc558f5e
7. 74a1d15a-e3ca-4c26-9bb6-e0b04f110100
8. e1a072dc-3a76-4f3a-a63a-89eab55170b9
9. 0cd35c3d-e5db-4d75-a5d9-9e0d67d059b8
10. 6321688d-6661-4004-a447-3e64f159fffe

**Caption:**
El loop de agente ya es commodity. El foso competitivo está en el estado 🧠

Análisis técnico de las 3 vías para construir agentes con Claude:
🧱 API + tool use vs 🛠️ Agent SDK (Py/TS) vs ☁️ Managed Agents
💾 Memory stores: filesystem montado, escrituras versionadas, rollback y auditoría
📉 Context editing: −84% tokens y +39% rendimiento en tareas de 100 turnos (benchmark interno de Anthropic)
🤖 Patrones: orquestador-worker, pipeline sin barreras, verificador adversario

Guárdalo 📌 y comenta "AGENTE" para la arquitectura de referencia.
Fuentes: docs oficiales de Anthropic (verificado 30-jul-2026).

#AgentesIA #ClaudeAI #IA #InteligenciaArtificial #Automatizacion #Python #APIs #DesarrolloDeSoftware #MachineLearning #TechEnEspañol #RAG #AprendeIA

## Domingo 2 agosto — Skills de Claude (estándar abierto, a fondo)

Slides s01→s10:
1. 6949b9d1-7ab5-4e50-ba7a-0ed7a346d729
2. 29dcac72-642c-4be9-a6e3-1f4a65188eb2
3. ef6ad433-3d26-422d-8710-2a8c4e1e3824
4. b19c77cd-9b3c-4d15-a779-5bfb164466d3
5. 6cf913f5-fcbf-4c2c-aa4e-ab2c5babd669
6. ea175c49-fb9d-415b-9d1a-b586bb034390
7. 917a72cb-4fa8-425d-b799-cd53fb4e531d
8. df281457-f147-4d52-9d34-21a72e5694ea
9. 39acf05b-ee9c-40da-b2cd-41c775908441
10. 8e769abb-5d3f-40ca-80bb-3509581854ee

**Caption:**
Tu prompt repetido es deuda técnica. Una skill lo convierte en infraestructura 🧩

A fondo, nivel pro:
📁 Progressive disclosure en 3 niveles: ~100 tokens por skill en arranque, body <5K al activar, recursos bajo demanda
🧬 Frontmatter: name + description obligatorios; allowed-tools y model opcionales
🎯 Descriptions que disparan: triggers literales + anti-triggers
🌍 Estándar abierto (dic 2025), adoptado por 26+ plataformas: Codex, Gemini CLI, Cursor, VS Code

Guárdalo 📌 y comenta "SKILL" para mi plantilla de SKILL.md.
Fuentes: documentación oficial de Anthropic (verificado 30-jul-2026).

#ClaudeAI #Skills #IA #InteligenciaArtificial #Automatizacion #Productividad #HerramientasIA #TechEnEspañol #AprendeIA #AgentesIA #DesarrolloDeSoftware #NoCode

## Lunes 3 agosto — GPT-5.6: Sol · Terra · Luna (análisis técnico)

Slides s01→s10:
1. 77559e92-5cbb-409a-82c7-cd8710b32c31
2. 7656ee17-49fc-4b4b-9c2d-67aed1662989
3. b9c50cfc-c8ef-4f33-b090-e6faa1e5de7c
4. 43faae5b-292a-4f38-b555-d6ef3fca8bb5
5. 27801425-6a67-4edb-a8e5-966a3d33000d
6. 121f647e-1a66-44de-9805-883abdb5eb65
7. 39b9ae92-dfe9-412d-80e0-771d38a2c739
8. b8d6129e-5634-48a9-83b0-549ab5851aa0
9. eddf6d69-f8ad-48a5-9b4b-975f11d6ec5f
10. 5b79961f-662c-4077-b89c-4cd516a026ad

**Caption:**
GPT-5.6 tiene 3 tiers — y el router eres tú ☀️🌍🌙

Análisis para builders, con números verificados:
☀️ Sol ($5/$30): 96.2% SWE-bench Verified; Ultra Mode sube Terminal-Bench 2.1 de 88.8% a 91.9%
🌍 Terra ($2.50/$15): rendimiento ≈GPT-5.5 a mitad de coste — el tier por defecto
🌙 Luna ($1/$6): latencia mínima para clasificación, extracción y routing
🧑‍💻 Programmatic Tool Calling: el modelo escribe JS en un V8 aislado sin red (ZDR-compatible) — menos round-trips, menos tokens
🕸️ Multi-agente beta nativo en la Responses API

Guárdalo 📌 y comenta "GPT" para la comparativa completa.
Fuentes: anuncio y docs oficiales de OpenAI + evaluaciones independientes (verificado 30-jul-2026).

#ChatGPT #GPT56 #OpenAI #IA #InteligenciaArtificial #IAgenerativa #APIs #Programacion #HerramientasIA #TechEnEspañol #AprendeIA #Automatizacion

## Martes 4 agosto — Claude Code vs Codex (benchmarks independientes)

Slides s01→s10:
1. a2ed17f1-7b22-4d2a-b0d5-66b89ad8c5bc
2. 44337fca-7008-46ec-bb0b-b5ae281df046
3. 21ae310a-ad36-4e58-a4bd-011ae543b290
4. 2182ba37-53ea-4e51-ba71-467903544273
5. 4003f766-ab84-4ca1-874c-a6222eda94e9
6. a7bba50e-403f-4b5e-84fd-67a8180a9995
7. 9ce36e6e-1fbb-4d22-adaa-57f35abf4752
8. b8aca810-3878-4eb5-b50f-a9cb2b4fd043
9. 789ef75b-ee4c-45b2-a968-dcb134c64443
10. e4e035cc-c37b-489d-ba81-132b73de1d16

**Caption:**
Claude Code vs Codex: empate técnico arriba, diferencias donde importa ⚔️

Datos independientes de julio 2026, no opiniones:
🟣 Opus 5: 97.0% SWE-bench Verified; lidera 9 de 12 benchmarks (SWE-bench Pro +14.6 pts); 1M de contexto; $5/$25
🟢 GPT-5.6 Sol + Codex: Coding Agent Index 80 vs 77; Terminal-Bench 2.1 con Ultra 91.9%; incluido en todos los planes de ChatGPT
🎯 La métrica correcta: coste por tarea terminada, no por token
🔀 Bonus: Skills es estándar abierto — tu método sirve en ambos

En el carrusel: cuándo elegir cada uno + framework de decisión en 3 pasos.

Guárdalo 📌 y comenta "VS" con tu favorito.
Fuentes: Artificial Analysis, leaderboards SWE-bench y anuncios oficiales (verificado 30-jul-2026).

#ClaudeCode #Codex #ChatGPT #ClaudeAI #IA #Programacion #DesarrolloDeSoftware #InteligenciaArtificial #AgentesIA #TechEnEspañol #MachineLearning #AprendeIA
