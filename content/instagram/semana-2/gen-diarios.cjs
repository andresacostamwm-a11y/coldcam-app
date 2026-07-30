// Carruseles diarios 31 jul - 4 ago (identidad v2, sin solapes, outfits rotados).
// v2 PRO: contenido intermedio-avanzado, datos re-verificados 30-jul-2026.
// Uso: node gen-diarios.cjs <cc|ag|sk|gpt|vs>  → renderiza <dia>-s01.png ... <dia>-s10.png
const { chromium } = require('playwright');

const AV = {
  traje: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_132555_da4bd314-20e9-4e68-85b7-81a700896ad4.png',
  brazos: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_132546_361b9f71-61de-4e37-9583-913e351d08dd.png',
  tablet: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_133216_204965fe-64a2-4095-b99f-5ee698a0a6d1.png',
  holo: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_133226_167a439b-03f6-4c91-aba6-30a35bf4c22a.png',
  gris: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_134503_ceb9a02d-02a7-457a-86fd-7743ea50aaf2.png',
  camel: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_134520_ba57c43b-fc5e-47bf-b4e1-b66705168d42.png',
  chaleco: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_134537_8d7050bc-a2de-4a1c-a340-403111fe9585.png',
  bomber: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_134553_3371de76-b46c-4dbb-9a95-36055f2d2bc7.png',
  azulcielo: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_170436_9f96b5a5-3ba0-4bf8-b675-49e8dcee7b30.png',
  negrabeige: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_170445_303cdcd2-f6f1-43ac-8aed-cf1b7995c548.png',
  blancamarino: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_170452_c866cf3d-bd04-44e1-a04d-b483defee477.png',
  burdeos: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_170501_d82ed262-dc9c-4e3e-a221-1e7cca97641d.png',
  grisperla: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_170510_506d3032-c70d-43ae-a888-720ee156cc2f.png',
  marinocrema: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_170518_6ff12c4d-d163-4704-8f2b-8fda535d513a.png',
};

function net(color, pts, lines, op) {
  const dots = pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`).join('');
  const segs = lines.map(([a, b]) => `<line x1="${pts[a][0]}" y1="${pts[a][1]}" x2="${pts[b][0]}" y2="${pts[b][1]}" stroke="${color}" stroke-width="1.6"/>`).join('');
  return `<g opacity="${op}">${segs}${dots}</g>`;
}
const GP = [[760,60,5],[840,150,3.5],[920,90,6],[1000,190,4],[930,260,3],[1040,60,4],[860,330,5],[990,330,3.5],[770,230,3],[1050,270,5],[900,420,3],[1010,430,4],[830,500,2.5],[1060,520,3],[950,560,2.5]];
const GL = [[0,1],[1,2],[2,3],[2,5],[3,4],[4,6],[3,9],[6,7],[7,9],[1,8],[8,6],[9,11],[10,11],[10,6],[11,13],[12,10],[13,14],[11,14]];
const CP = [[60,820,4],[150,900,3],[90,1000,5],[210,1010,3],[160,1110,4],[60,1180,3],[260,1160,2.5],[300,930,3.5],[360,1060,3],[240,860,2.5],[400,1200,3],[330,1270,2.5],[120,1290,3],[440,980,2.5]];
const CL = [[0,1],[1,2],[2,3],[3,4],[4,5],[4,6],[6,8],[7,8],[7,9],[1,9],[8,13],[8,10],[10,11],[4,12],[3,7]];
const NET = `<svg class="net" viewBox="0 0 1080 1350">${net('#E8A33D', GP, GL, 0.5)}${net('#35C7E8', CP, CL, 0.4)}</svg>`;

const CSS = `
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:1080px; height:1350px; }
body { font-family:'Roboto',sans-serif; position:relative; overflow:hidden; color:#fff;
  background:linear-gradient(160deg,#05080F 0%,#0A1220 55%,#060B14 100%); }
svg.net { position:absolute; inset:0; }
.avbox { position:absolute; right:0; bottom:0; width:428px; height:980px;
  display:flex; align-items:flex-end; justify-content:flex-end; z-index:1; }
.avbox img { max-width:428px; max-height:980px; object-fit:contain; object-position:bottom right;
  filter:drop-shadow(-14px 0 45px rgba(0,0,0,0.8)); }
.slide { position:absolute; inset:0; padding:60px 60px 52px; display:flex; flex-direction:column; z-index:2; }
.col { width:560px; display:flex; flex-direction:column; flex:1; }
.countL { display:inline-block; border:2px solid #C9932F; border-radius:14px; padding:8px 22px;
  font-family:'Oswald',sans-serif; font-size:29px; font-weight:600; color:#F0D9A6;
  align-self:flex-start; margin-bottom:24px; }
.countR { position:absolute; top:46px; right:50px; background:rgba(10,14,24,0.85);
  border-radius:999px; padding:11px 26px; font-size:29px; font-weight:700; color:#EAF2FA; z-index:3; }
.tgold { font-family:'Oswald',sans-serif; font-weight:700; text-transform:uppercase;
  font-size:66px; line-height:1.04; letter-spacing:1px;
  background:linear-gradient(180deg,#F8E2A6 8%,#E9B95B 55%,#C08A2E 100%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  filter:drop-shadow(0 4px 18px rgba(0,0,0,0.85)); }
.tsub { font-size:30px; color:#E9EFF6; margin-top:12px; line-height:1.3;
  text-shadow:0 2px 12px rgba(0,0,0,0.7); }
.tsub b { color:#F0B54A; }
.cap { display:inline-flex; align-items:center; gap:10px; border:2px solid #E8A33D; border-radius:12px;
  padding:10px 20px; margin:20px 0 22px; font-family:'Oswald',sans-serif; font-size:25px; font-weight:600;
  letter-spacing:2px; text-transform:uppercase; color:#F0B54A; align-self:flex-start;
  background:rgba(232,163,61,0.07); }
.card { display:flex; align-items:flex-start; gap:18px; border:2px solid rgba(232,163,61,0.6);
  border-radius:18px; background:rgba(10,16,28,0.78); padding:17px 19px; margin-bottom:13px; }
.hex { min-width:58px; height:58px; display:flex; align-items:center; justify-content:center;
  font-size:26px; color:#F0B54A; border:2px solid #C9932F; border-radius:13px;
  background:rgba(232,163,61,0.09); }
.card h3 { font-family:'Oswald',sans-serif; font-size:26px; font-weight:600; color:#F0B54A;
  letter-spacing:1px; margin-bottom:5px; text-transform:uppercase; }
.card p { font-size:23px; line-height:1.34; color:#E7EDF4; }
.card p b { color:#fff; }
.h1 { font-family:'Oswald',sans-serif; font-weight:700; text-transform:uppercase;
  font-size:84px; line-height:1.05; text-shadow:0 4px 24px rgba(0,0,0,0.85); }
.gold { color:#F0B54A; } .cyan { color:#35C7E8; }
.sub { font-family:'Oswald',sans-serif; font-weight:600; text-transform:uppercase; color:#35C7E8;
  font-size:40px; letter-spacing:2px; margin-top:22px; line-height:1.18;
  text-shadow:0 3px 18px rgba(0,0,0,0.8); }
.pill { display:inline-block; padding:11px 24px; border:2px solid #E8A33D; border-radius:999px;
  color:#F0B54A; font-size:25px; font-weight:700; letter-spacing:2px; margin-bottom:30px;
  align-self:flex-start; text-transform:uppercase; }
p.body { font-size:32px; line-height:1.4; color:#E6EDF5; text-shadow:0 2px 12px rgba(0,0,0,0.7); }
p.body b { color:#F0B54A; }
.mt { margin-top:18px; }
.vcenter { flex:1; display:flex; flex-direction:column; justify-content:center; }
.grow { flex:1; }
.firma { font-family:'Dancing Script',cursive; font-size:50px;
  background:linear-gradient(180deg,#F8E2A6,#D9A441); -webkit-background-clip:text;
  background-clip:text; color:transparent; filter:drop-shadow(0 2px 10px rgba(0,0,0,0.8)); }
.rol { font-size:21px; letter-spacing:3px; color:#9FB2C8; text-transform:uppercase; margin-top:2px; }
`;

const FOOT = `<div style="width:560px;"><div class="firma">Ing. Andrés Acosta</div><div class="rol">IA &amp; Automatización</div></div>`;
const card = (ico, t, p) => `<div class="card"><div class="hex">${ico}</div><div><h3>${t}</h3><p>${p}</p></div></div>`;
const av = (k) => `<div class="avbox"><img src="${AV[k]}"></div>`;
const cover = (n, o, pill, h1, sub, body) => `${NET}${av(o)}<div class="slide"><div class="countR">${n}/10</div>
<div class="col vcenter"><div class="pill">${pill}</div><div class="h1">${h1}</div><div class="sub">${sub}</div>
<p class="body mt" style="font-size:34px;">${body}</p></div>${FOOT}</div>`;
const stmt = (n, o, h1, bodies) => `${NET}${av(o)}<div class="slide"><div class="countR">${n}/10</div>
<div class="col vcenter"><div class="h1" style="font-size:66px;">${h1}</div>${bodies.map(b => `<p class="body mt">${b}</p>`).join('')}</div>${FOOT}</div>`;
const cards = (n, o, title, sub, cap, cs) => `${NET}${av(o)}<div class="slide"><div class="col">
<div class="countL">${n}/10</div><div class="tgold">${title}</div><div class="tsub">${sub}</div>
<div class="cap">${cap}</div>${cs.map(c => card(...c)).join('')}<div class="grow"></div>${FOOT}</div></div>`;

const DAYS = {
cc: { out: ['traje','azulcielo','tablet','negrabeige','blancamarino','burdeos','grisperla','marinocrema','gris','camel'], S: [
cover('1','traje','Verificado · 30 jul 2026','CLAUDE<br><span class="gold">CODE</span>','Guía PRO: subagentes,<br>hooks y MCP','Arquitectura, novedades de julio y patrones de equipos senior — <b>con datos verificados</b>.'),
stmt('2','azulcielo','UN HARNESS DE AGENTES.<br><span class="gold">NO UN AUTOCOMPLETE.</span>',['Orquesta Opus 5 con herramientas reales: archivos, bash, web, MCP — con <b>verificación propia</b> antes de entregar.','<span class="cyan">Opus 5: 97.0% en SWE-bench Verified — nº1 del leaderboard (jul 2026).</span>']),
cards('3','tablet','MOTOR: OPUS 5','Qué significan las specs en tu trabajo diario.','⚙️ 24 · Jul · $5/$25',[
['🧠','Contexto 1M','Monorepos completos en sesión: código + docs + diffs, <b>sin RAG improvisado</b>.'],
['⚡','Salida 128K','Refactors multi-archivo <b>en una sola respuesta</b>, sin trocear entregas.'],
['🎚️','Razonamiento adaptativo','Asigna esfuerzo según dificultad: <b>pagas pensamiento solo cuando aporta</b>.']]),
cards('4','negrabeige','SUBAGENTES 2.0','Novedad de julio: anidamiento hasta profundidad 3 (antes 1).','🤖 Orquestación',[
['🌳','Anidados ×3','Tu orquestador lanza especialistas que <b>lanzan sus propios subagentes</b>.'],
['🧵','Background robusto','Sobreviven <b>reinicios y upgrades</b>; watchdog de stream de 5 min por defecto.'],
['📐','Tipos base','Explore (solo lectura), Plan (arquitectura), <b>general-purpose</b> (ejecución).']]),
cards('5','blancamarino','AGENTES A MEDIDA','Defínelos como archivos versionados en .claude/agents/*.md.','🛠️ Config declarativa',[
['📄','Frontmatter YAML','name, description, <b>tools y model</b> por agente — review como código.'],
['🎚️','Effort y budget','Esfuerzo de razonamiento y <b>presupuesto de tokens</b> por tarea.'],
['🔀','Model fallback (beta)','Conmutación automática de modelo <b>si el primario se degrada</b>.']]),
cards('6','burdeos','MCP 2026-07-28','La spec nueva que cambia las integraciones enterprise.','🔌 Protocolo',[
['🔐','OAuth + OIDC','Identidad federada: servidores MCP <b>con el SSO de tu empresa</b>.'],
['🧩','Apps y Tasks','Primitivas versionadas para <b>UI embebida y trabajos largos</b>.'],
['♻️','Reconexión sólida','Retries y re-auth <b>sin tumbar la sesión</b> (fixes de julio).']]),
cards('7','grisperla','CONTEXT ENGINEERING','El cuello de botella no es el modelo: es tu contexto.','🧠 Las 3 capas',[
['📄','CLAUDE.md','Reglas, comandos y arquitectura del repo — <b>siempre en contexto</b>.'],
['🪝','Hooks','Scripts pre/post tool-use: lint, tests y <b>guardarraíles automáticos</b>.'],
['🎯','Skills','Procedimientos bajo demanda con <b>progressive disclosure</b> (~100 tokens).']]),
cards('8','marinocrema','PIPELINE SENIOR','De prompt suelto a flujo reproducible y auditable.','🧩 Método',[
['🗺️','Plan → diff → apruebas','Plan mode primero; el diff <b>se revisa como un PR</b>.'],
['🧪','Verificación propia','Corre tests y <b>verifica su trabajo</b> antes de entregártelo.'],
['📊','Headless + stream-json','Salida estructurada para CI: <b>--forward-subagent-text</b> incluido.']]),
cards('9','gris','ÚSALO ESTA SEMANA','Tres tareas de nivel intermedio-avanzado con ROI directo.','✅ Ponlo a prueba',[
['1️⃣','Auditoría de deuda','Explore + Plan sobre tu repo: <b>mapa de deuda técnica</b> con referencias.'],
['2️⃣','Migración paralela','Refactor multi-archivo con subagentes <b>repartidos por módulo</b>.'],
['3️⃣','CI agéntico','Claude Code headless en tu pipeline: <b>triaje automático de fallos</b>.']]),
stmt('10','camel','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> este carrusel','💬 Comenta <b>"CODE"</b> y te mando la guía de subagentes','➕ <b>Sígueme</b>: IA verificada, cada semana','<span class="cyan">Mañana: agentes con Claude — SDK, memoria y orquestación.</span>']),
]},
ag: { out: ['blancamarino','burdeos','holo','grisperla','marinocrema','azulcielo','negrabeige','bomber','chaleco','traje'], S: [
cover('1','blancamarino','Verificado · 30 jul 2026','AGENTES<br><span class="gold">CON CLAUDE</span>','API · Agent SDK ·<br>Managed Agents','Arquitectura, memoria persistente y orquestación — <b>lo que llega a producción en 2026</b>.'),
stmt('2','burdeos','EL LOOP YA ES COMMODITY.<br><span class="gold">EL ESTADO ES EL FOSO.</span>',['Objetivo → plan → herramientas → verificación: eso <b>ya te lo da el SDK</b>.','<span class="cyan">Lo que diferencia producción de demo: memoria, contexto y evals.</span>']),
cards('3','holo','LAS 3 VÍAS','Control total vs. velocidad de despliegue: elige con criterio.','🧭 Arquitectura',[
['🧱','API + tool use','Loop artesanal: máxima flexibilidad, <b>máximo trabajo de plomería</b>.'],
['🛠️','Agent SDK (Py/TS)','El loop de Claude Code <b>embebido en tu aplicación</b>.'],
['☁️','Managed Agents','Sandbox, estado, memoria y trazas <b>gestionados por Anthropic</b>.']]),
cards('4','grisperla','AGENT SDK','Qué resuelve de serie y qué sigue siendo tu responsabilidad.','⚙️ Honesto',[
['✅','Incluye','Loop de agente, tool use, streaming y <b>compactación de contexto</b>.'],
['🧰','Herramientas','Archivos, bash, web y <b>subagentes</b> — paridad con Claude Code.'],
['🧗','Tu parte','Observabilidad fina, hardening y <b>orquestación multi-agente compleja</b>.']]),
cards('5','marinocrema','MEMORIA PERSISTENTE','Public beta desde abril: archivos que sobreviven sesiones.','💾 Managed Agents',[
['🗂️','Memory stores','Colección por workspace, <b>montada como filesystem</b> en el sandbox.'],
['🧾','Auditable','Cada escritura genera versión inmutable: <b>rollback y redacción</b> puntual.'],
['🤝','Compartible','Lo aprendido por un agente <b>lo hereda otro</b> del mismo workspace.']]),
cards('6','azulcielo','CONTEXT EDITING','El benchmark interno que justifica la arquitectura.','📉 Datos Anthropic',[
['✂️','Poda automática','Limpia tool results viejos; la memoria <b>retiene lo esencial</b>.'],
['📊','−84% tokens','Medido en una tarea de <b>100 turnos</b> con búsqueda web.'],
['📈','+39% rendimiento','Menos ruido en contexto = <b>mejor resultado</b>, no peor.']]),
cards('7','negrabeige','ORQUESTACIÓN','Patrones multi-agente que escalan sin desmadrarse.','🤖 3 patrones',[
['🎯','Orquestador-worker','Uno reparte; N especialistas ejecutan <b>con contexto propio</b>.'],
['🧵','Pipeline sin barreras','Etapas encadenadas por ítem: <b>máximo paralelismo real</b>.'],
['⚖️','Verificador adversario','Agentes que intentan <b>refutar</b> el resultado antes de aceptarlo.']]),
cards('8','bomber','MCP + EVALS','Integración y medición: lo no negociable en producción.','📐 Producción',[
['🔌','MCP 2026-07-28','OAuth/OIDC: conecta sistemas internos <b>con SSO corporativo</b>.'],
['🧪','Evals con casos reales','Mide <b>tarea terminada</b>, no impresiones — antes de escalar.'],
['🛡️','Checkpoints humanos','Aprobación explícita en pasos <b>irreversibles</b>: pagos, deploys, emails.']]),
cards('9','chaleco','CONSTRUYE ESTA SEMANA','Tres agentes con memoria y orquestación reales.','✅ 3 builds',[
['1️⃣','Triaje con memoria','Agente de inbox que <b>aprende tus criterios</b> semana a semana.'],
['2️⃣','Research multi-agente','Fan-out de lectores en paralelo + <b>sintetizador con fuentes</b>.'],
['3️⃣','Agente de repo','SDK + MCP de GitHub: digest diario y <b>PRs de mantenimiento</b>.']]),
stmt('10','traje','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> este carrusel','💬 Comenta <b>"AGENTE"</b> y te mando la arquitectura de referencia','➕ <b>Sígueme</b>: IA verificada, cada semana','<span class="cyan">Construyo agentes a diario — esto sale de proyectos reales.</span>']),
]},
sk: { out: ['grisperla','marinocrema','tablet','azulcielo','burdeos','negrabeige','blancamarino','camel','gris','brazos'], S: [
cover('1','grisperla','Estándar abierto · 26+ plataformas','SKILLS<br><span class="gold">DE CLAUDE</span>','Conocimiento como<br>infraestructura','Progressive disclosure, anatomía del SKILL.md y patrones de diseño — <b>a fondo</b>.'),
stmt('2','marinocrema','TU PROMPT REPETIDO<br><span class="gold">ES DEUDA TÉCNICA.</span>',['Una skill lo convierte en un <b>módulo versionado</b> que Claude carga solo cuando aplica.','<span class="cyan">Estándar abierto (dic 2025): funciona también en Codex, Gemini CLI, Cursor y VS Code.</span>']),
cards('3','tablet','PROGRESSIVE DISCLOSURE','Por qué 100 skills instaladas no inflan tu contexto.','🧠 3 niveles de carga',[
['1️⃣','Arranque','Solo name + description: <b>~100 tokens por skill</b>.'],
['2️⃣','Activación','El body completo entra al contexto: <b>recomendado &lt;5K tokens</b>.'],
['3️⃣','Recursos','Scripts y referencias de la carpeta: <b>solo si la tarea los pide</b>.']]),
cards('4','azulcielo','ANATOMÍA','SKILL.md: qué es obligatorio y qué es opcional.','🧬 Frontmatter YAML',[
['🏷️','Obligatorio','name + description — y la <b>description es el matcher</b>.'],
['🔒','allowed-tools','Restringe herramientas <b>mientras la skill está activa</b>.'],
['🎛️','model','Fuerza un modelo concreto <b>para esa tarea</b> (opcional).']]),
cards('5','burdeos','ÁMBITOS','Dónde vive cada skill y quién la hereda.','📁 3 scopes',[
['👤','Personal','~/.claude/skills: <b>tu método</b>, disponible en todos tus repos.'],
['📦','Proyecto','.claude/skills del repo: del equipo, <b>versionada en git</b>.'],
['🔌','Plugin / API','Distribución por marketplace o <b>subida programática por API</b>.']]),
cards('6','negrabeige','DESCRIPTIONS QUE DISPARAN','El 90% de las skills muertas fallan exactamente aquí.','🎯 Triggers',[
['🗣️','Sé literal','"Úsala cuando pidan X, Y o Z" — el matcher <b>no adivina intenciones</b>.'],
['🚫','Anti-triggers','Di también <b>cuándo NO usarla</b>: elimina falsos positivos.'],
['🧪','Itera como prompt','Si no dispara, reescribe la description: <b>es prompt engineering</b>.']]),
cards('7','blancamarino','COMPOSICIÓN','Skills pequeñas y componibles > una skill dios.','📐 Diseño',[
['🧩','Una tarea, una skill','Claude puede cargar <b>varias a la vez</b> si la tarea lo pide.'],
['📎','Recursos anexos','Plantillas y scripts en la carpeta, <b>referenciados desde el body</b>.'],
['🔁','Review como código','Van a git y pasan PR review — <b>porque son código</b>.']]),
cards('8','camel','CASOS PRO','Donde las skills devuelven horas cada semana.','💡 ROI real',[
['📊','Runbooks','Despliegues e incidentes: procedimiento exacto, <b>sin improvisar</b>.'],
['🔍','Code review','Tu checklist aplicado <b>idéntico en cada PR</b>.'],
['🎨','Pipelines de marca','Estos carruseles salen de una skill: <b>diseño + reglas + QA</b>.']]),
cards('9','gris','IMPLEMENTA HOY','De prompt repetido a activo permanente en 30 minutos.','✅ Checklist',[
['1️⃣','Mina tu historial','Tu prompt más repetido de la semana <b>es la candidata</b>.'],
['2️⃣','Empaqueta','Carpeta + SKILL.md con <b>triggers literales</b> en la description.'],
['3️⃣','Testea el disparo','5 prompts reales: ¿carga cuando debe <b>y solo cuando debe</b>?']]),
stmt('10','brazos','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> este carrusel','💬 Comenta <b>"SKILL"</b> y te mando mi plantilla de SKILL.md','➕ <b>Sígueme</b>: IA verificada, cada semana','<span class="cyan">Si lo explicaste dos veces, es una skill.</span>']),
]},
gpt: { out: ['negrabeige','blancamarino','holo','marinocrema','grisperla','azulcielo','burdeos','traje','bomber','chaleco'], S: [
cover('1','negrabeige','Lanzado · 9 julio 2026','GPT-5.6<br><span class="gold">SOL · TERRA · LUNA</span>','Análisis técnico<br>para builders','Precios API, Ultra Mode y Programmatic Tool Calling — <b>con números verificados</b>.'),
stmt('2','blancamarino','TRES TIERS.<br><span class="gold">EL ROUTER ERES TÚ.</span>',['Rollout global en <b>6 minutos</b> el 9 de julio. Cada tier evoluciona por separado.','<span class="cyan">Sol: frontier · Terra: ≈GPT-5.5 a mitad de coste · Luna: volumen y latencia.</span>']),
cards('3','holo','SOL — $5 / $30','El flagship: razonamiento frontier y agentes largos.','☀️ + Ultra Mode',[
['🧠','Capacidad','<b>96.2% SWE-bench Verified</b>; hecho para agentes de larga duración.'],
['⚡','Ultra Mode','Más cómputo por request: Terminal-Bench 2.1 <b>91.9% vs 88.8% base</b>.'],
['🎯','Cuándo','Estrategia, análisis complejo y <b>orquestación de agentes</b>.']]),
cards('4','marinocrema','TERRA — $2.50 / $15','El workhorse: rendimiento de flagship anterior a mitad de precio.','🌍 Sweet spot',[
['⚖️','Rendimiento','Compite con GPT-5.5 <b>a ~50% del coste</b>.'],
['🏗️','Cuándo','Features de producto, asistentes y <b>agentes de negocio</b>.'],
['📊','Regla','Tier por defecto para <b>el 80% de tu tráfico</b>.']]),
cards('5','grisperla','LUNA — $1 / $6','Cuando latencia y volumen mandan sobre la profundidad.','🌙 Alto volumen',[
['🚀','Latencia','El más rápido de la familia: <b>casos en tiempo real</b>.'],
['🏷️','Cuándo','Clasificación, extracción, resúmenes y <b>routing</b>.'],
['💸','Economía','Pipelines de <b>millones de llamadas</b> sin romper el presupuesto.']]),
cards('6','azulcielo','PROGRAMMATIC TOOL CALLING','La feature técnica más importante del lanzamiento.','🧑‍💻 Responses API',[
['📜','Cómo funciona','El modelo <b>escribe JavaScript</b> que orquesta tus tools y filtra resultados.'],
['🔒','Sandbox V8','Runtime aislado <b>sin acceso a red</b>; compatible Zero Data Retention.'],
['📉','Por qué importa','Menos round-trips al modelo: <b>menos tokens y menos latencia</b>.']]),
cards('7','burdeos','MULTI-AGENTE (BETA)','Orquestación nativa desde la API, sin framework externo.','🕸️ Fan-out',[
['🤖','Nativo','Coordinación de agentes en paralelo <b>desde la Responses API</b>.'],
['🧵','Con PTC','El código del modelo orquesta el fan-out: <b>determinista, no vibes</b>.'],
['⚠️','Es beta','La interfaz cambiará: <b>abstráela</b> tras tu propia capa.']]),
cards('8','traje','VS OPUS 5','El contexto competitivo, con números de julio.','⚖️ Head to head',[
['🟣','Opus 5','<b>97.0% SWE-bench Verified</b> · 1M contexto · $5/$25 (−17% salida).'],
['🟠','Sol','96.2% + Ultra <b>91.9% Terminal-Bench</b>: gana en shell puro.'],
['🎯','Criterio','Enruta por tarea y mide <b>coste por resultado</b>, no lealtad de marca.']]),
cards('9','bomber','MONTA TU ROUTER','Convierte los tres tiers en ahorro medible.','✅ Esta semana',[
['1️⃣','Clasifica tráfico','Etiqueta una semana de requests: <b>Sol, Terra o Luna</b>.'],
['2️⃣','Router barato','Un clasificador en Luna decide el tier <b>antes de cada request</b>.'],
['3️⃣','Evalúa PTC','Si encadenas 3+ tools por request, <b>PTC te quita latencia y coste</b>.']]),
stmt('10','chaleco','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> este carrusel','💬 Comenta <b>"GPT"</b> y te mando la tabla comparativa completa','➕ <b>Sígueme</b>: IA verificada, cada semana','<span class="cyan">Mañana: Claude Code vs Codex — con benchmarks independientes.</span>']),
]},
vs: { out: ['burdeos','grisperla','tablet','blancamarino','azulcielo','marinocrema','negrabeige','gris','camel','brazos'], S: [
cover('1','burdeos','Datos · Julio 2026','CLAUDE CODE<br><span class="gold">VS CODEX</span>','Benchmarks independientes,<br>no opiniones','SWE-bench, Terminal-Bench, Coding Agent Index y coste — <b>criterio por caso de uso</b>.'),
stmt('2','grisperla','EMPATE TÉCNICO ARRIBA.<br><span class="gold">DIFERENCIAS DONDE IMPORTA.</span>',['SWE-bench Verified: Opus 5 <b>97.0%</b> vs GPT-5.6 Sol <b>96.2%</b>. Décimas.','<span class="cyan">La elección real está en filosofía, ecosistema y coste por tarea terminada.</span>']),
cards('3','tablet','FILOSOFÍA','Dos modelos de trabajo sobre el mismo problema.','🧠 Enfoques',[
['🟣','Claude Code','Developer-in-the-loop: <b>plan → diff → apruebas</b>. Local primero.'],
['🟢','Codex','Delegación autónoma <b>local y en la nube</b>, integrada en ChatGPT.'],
['🔁','Convergen','Ambos ya cubren terminal, IDE, <b>background y CI</b>.']]),
cards('4','blancamarino','BENCHMARKS','Lo que dicen los evaluadores independientes en julio.','📊 Artificial Analysis',[
['🟣','Opus 5','<b>97.0% SWE-bench Verified</b>; lidera 9 de 12 benchmarks.'],
['🟢','Sol + Codex','Coding Agent Index <b>80 vs 77</b>; Terminal-Bench Ultra 91.9%.'],
['⚠️','Lectura correcta','Décimas de diferencia: <b>mide en TU repo</b>, no en el leaderboard.']]),
cards('5','azulcielo','DÓNDE GANA CLAUDE CODE','Fortalezas medibles, no marketing.','🟣 Su terreno',[
['🧵','Contexto 1M','Monorepos y <b>refactors multi-archivo</b> en una sola sesión.'],
['📐','SWE-bench Pro','Lidera con <b>+14.6 puntos</b>: tareas largas y difíciles.'],
['🧩','Ecosistema','MCP + skills + <b>subagentes anidados ×3</b> + hooks.']]),
cards('6','marinocrema','DÓNDE GANA CODEX','Su caso legítimo — sin fanatismos.','🟢 Su terreno',[
['⚡','Shell puro','Terminal-Bench 2.1: <b>91.9% con Sol Ultra</b>.'],
['💳','Distribución','Incluido en <b>todos los planes de ChatGPT</b>.'],
['☁️','Cloud tasks','Delegación asíncrona <b>sin supervisión fina</b>.']]),
cards('7','negrabeige','COSTE REAL','La comparación que casi nadie hace bien.','💰 Economía',[
['💵','API','Opus 5 <b>$5/$25</b> vs Sol $5/$30: −17% en salida.'],
['📦','Suscripción','Codex sin coste extra si ya pagas ChatGPT; Claude Code <b>por plan o API</b>.'],
['🎯','La métrica','Coste por <b>tarea terminada</b>: tokens baratos que reintentan salen caros.']]),
cards('8','gris','STACK HÍBRIDO','Cómo los combino en proyectos reales.','⚖️ Mi setup',[
['🟣','Claude Code','Producción, refactors grandes y <b>review estricto</b>.'],
['🟢','Codex','Prototipos, scripts y <b>tareas shell autónomas</b>.'],
['🔀','Interop','Skills es estándar abierto: <b>tu método sirve en ambos</b>.']]),
cards('9','camel','DECIDE CON DATOS','Framework de evaluación en 3 pasos.','✅ Esta semana',[
['1️⃣','Piloto A/B','La misma tarea real en ambos: <b>mide retrabajo</b>, no velocidad bruta.'],
['2️⃣','Audita ecosistema','¿Usas MCP, skills, subagentes? <b>Ahí está la brecha</b>.'],
['3️⃣','TCO a 90 días','Suscripciones + API + <b>tiempo humano de review</b>.']]),
stmt('10','brazos','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> este carrusel','💬 Comenta <b>"VS"</b> y te mando la comparativa completa','➕ <b>Sígueme</b>: IA verificada, cada semana','<span class="cyan">Uso los dos a diario — esto sale de práctica real.</span>']),
]},
};

(async () => {
  const day = process.argv[2];
  if (!DAYS[day]) { console.error('día inválido:', day); process.exit(1); }
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  let i = 0;
  for (const body of DAYS[day].S) {
    i++;
    const n = String(i).padStart(2, '0');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Roboto:wght@400;500;700&family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>${body}</body></html>`;
    await p.setContent(html, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1400);
    const m = await p.evaluate(() => {
      const img = document.querySelector('.avbox img');
      const ir = img.getBoundingClientRect();
      let maxRight = 0, maxBottom = 0;
      document.querySelectorAll('.slide .col, .slide .col *, .slide > div[style]').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        if (r.bottom > ir.top && r.right > maxRight) maxRight = r.right;
        if (r.bottom > maxBottom) maxBottom = r.bottom;
      });
      return { loaded: img.naturalWidth > 0, imgLeft: Math.round(ir.left), textMaxRight: Math.round(maxRight), maxBottom: Math.round(maxBottom) };
    });
    await p.screenshot({ path: `${day}-s${n}.png` });
    console.log(day, n, JSON.stringify(m), m.loaded && m.textMaxRight <= m.imgLeft && m.maxBottom <= 1350 ? 'OK' : 'FAIL');
  }
  await b.close();
})();
