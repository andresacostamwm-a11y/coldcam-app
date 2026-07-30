// Carruseles diarios 31 jul - 4 ago (identidad v2, sin solapes, outfits rotados).
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
  font-size:72px; line-height:1.04; letter-spacing:1px;
  background:linear-gradient(180deg,#F8E2A6 8%,#E9B95B 55%,#C08A2E 100%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  filter:drop-shadow(0 4px 18px rgba(0,0,0,0.85)); }
.tsub { font-size:32px; color:#E9EFF6; margin-top:12px; line-height:1.32;
  text-shadow:0 2px 12px rgba(0,0,0,0.7); }
.tsub b { color:#F0B54A; }
.cap { display:inline-flex; align-items:center; gap:10px; border:2px solid #E8A33D; border-radius:12px;
  padding:11px 22px; margin:22px 0 24px; font-family:'Oswald',sans-serif; font-size:26px; font-weight:600;
  letter-spacing:2px; text-transform:uppercase; color:#F0B54A; align-self:flex-start;
  background:rgba(232,163,61,0.07); }
.card { display:flex; align-items:flex-start; gap:18px; border:2px solid rgba(232,163,61,0.6);
  border-radius:18px; background:rgba(10,16,28,0.78); padding:18px 20px; margin-bottom:14px; }
.hex { min-width:60px; height:60px; display:flex; align-items:center; justify-content:center;
  font-size:27px; color:#F0B54A; border:2px solid #C9932F; border-radius:13px;
  background:rgba(232,163,61,0.09); }
.card h3 { font-family:'Oswald',sans-serif; font-size:27px; font-weight:600; color:#F0B54A;
  letter-spacing:1px; margin-bottom:5px; text-transform:uppercase; }
.card p { font-size:24px; line-height:1.36; color:#E7EDF4; }
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
p.body { font-size:33px; line-height:1.42; color:#E6EDF5; text-shadow:0 2px 12px rgba(0,0,0,0.7); }
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
<p class="body mt" style="font-size:35px;">${body}</p></div>${FOOT}</div>`;
const stmt = (n, o, h1, bodies) => `${NET}${av(o)}<div class="slide"><div class="countR">${n}/10</div>
<div class="col vcenter"><div class="h1" style="font-size:70px;">${h1}</div>${bodies.map(b => `<p class="body mt">${b}</p>`).join('')}</div>${FOOT}</div>`;
const cards = (n, o, title, sub, cap, cs) => `${NET}${av(o)}<div class="slide"><div class="col">
<div class="countL">${n}/10</div><div class="tgold">${title}</div><div class="tsub">${sub}</div>
<div class="cap">${cap}</div>${cs.map(c => card(...c)).join('')}<div class="grow"></div>${FOOT}</div></div>`;

const DAYS = {
cc: { out: ['traje','azulcielo','tablet','negrabeige','blancamarino','burdeos','grisperla','marinocrema','gris','camel'], S: [
cover('1','traje','Actualizado · Julio 2026','CLAUDE<br><span class="gold">CODE</span>','La terminal que<br>programa por ti','Puesta al día completa: qué es, cómo empezar y <b>lo nuevo de julio</b>.'),
stmt('2','azulcielo','NO ES AUTO-COMPLETADO.<br><span class="gold">ES UN AGENTE EN TU TERMINAL.</span>',['Lee tu repo, <b>planifica</b>, edita archivos, corre tests y hace commits — tú apruebas.','<span class="cyan">Ahora con Opus 5: 1M de contexto y pensamiento adaptativo.</span>']),
cards('3','tablet','QUÉ ES','El agente de código de Anthropic, donde tú trabajas.','⚡ Terminal primero',[
['🖥️','CLI + IDE','Terminal, <b>VS Code y JetBrains</b>, web y app de escritorio.'],
['🧠','Motor: Opus 5','<b>1M de contexto</b>, 128K de salida, $5/$25 por millón (24 jul).'],
['🔁','Loop completo','Lee → planifica → edita → <b>testea → commit</b>.']]),
cards('4','negrabeige','EMPIEZA ASÍ','Setup en 2 minutos, de cero a primer commit.','🚀 Quickstart',[
['📦','Instala','<b>npm install -g @anthropic-ai/claude-code</b>'],
['🔑','Autentica','Ejecuta <b>claude</b> e inicia sesión con tu plan o API key.'],
['📁','CLAUDE.md','Contexto persistente del repo: <b>reglas, comandos, estilo</b>.']]),
cards('5','blancamarino','LO NUEVO','Julio 2026 vino cargado.','🆕 Este mes',[
['⚙️','Control fino','Subagentes, <b>presupuestos</b> y sesiones en segundo plano.'],
['🛡️','Fallback de modelo','Respaldo automático (beta) + <b>cambio de herramientas</b> en sesión.'],
['🔌','MCP 2026-07-28','OAuth/OIDC reforzado y <b>Apps y Tasks</b> versionados.']]),
cards('6','burdeos','SUBAGENTES','Trabajo en paralelo, cada uno con su contexto.','🤖 Los 3 tipos',[
['🧰','general-purpose','Todas las herramientas, para <b>tareas completas</b>.'],
['🔍','Explore','<b>Solo lectura</b>, rápido y barato: entender el código.'],
['📐','Plan','Arquitectura y diseño <b>antes de tocar nada</b>.']]),
cards('7','grisperla','FLUJO PRO','Cómo sacarle el máximo cada día.','🧩 Mi método',[
['🗺️','Plan mode primero','Que proponga el plan; <b>tú lo apruebas</b> y luego edita.'],
['🧠','Skills y hooks','Tu forma de trabajar, <b>cargada automáticamente</b>.'],
['✅','Verificación','Opus 5 <b>verifica su propio trabajo</b> antes de entregarlo.']]),
cards('8','marinocrema','ERRORES TÍPICOS','Lo que separa juniors de seniors usándolo.','❌ Evita esto',[
['🧨','Todo en un prompt','Divide en tareas con <b>criterio de "terminado"</b>.'],
['👀','No revisar diffs','Tú eres el senior: <b>revisa antes de aprobar</b>.'],
['📄','Ignorar CLAUDE.md','Sin contexto persistente, <b>calidad aleatoria</b>.']]),
cards('9','gris','EMPIEZA HOY','3 tareas reales para tu primer día.','✅ Bajo riesgo',[
['1️⃣','Explica un repo','Modo <b>Explore</b> sobre un proyecto que no conozcas.'],
['2️⃣','Tests faltantes','Cobertura de <b>un módulo</b> sin tests.'],
['3️⃣','Refactor multi-archivo','Su especialidad con <b>1M de contexto</b>.']]),
stmt('10','camel','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> este carrusel','💬 Comenta <b>"CODE"</b> y te mando el quickstart','➕ <b>Sígueme</b>: IA verificada, cada semana','<span class="cyan">LLMs · agentes · imagen · video — sin humo.</span>']),
]},
ag: { out: ['blancamarino','burdeos','holo','grisperla','marinocrema','azulcielo','negrabeige','bomber','chaleco','traje'], S: [
cover('1','blancamarino','Actualizado · Agosto 2026','AGENTES<br><span class="gold">CON CLAUDE</span>','De chats a<br>empleados digitales','Las 3 vías para construir agentes <b>reales</b> — y cuándo usar cada una.'),
stmt('2','burdeos','UN AGENTE NO RESPONDE.<br><span class="gold">DECIDE, EJECUTA Y VERIFICA.</span>',['El loop: objetivo → plan → <b>herramientas</b> → verificación → resultado.','<span class="cyan">Es el mismo motor de Claude Code — disponible para tu código.</span>']),
cards('3','holo','LAS 3 VÍAS','Elige según control vs. velocidad de despliegue.','🧭 Tu nivel',[
['🧱','API + tool use','Control total del loop: <b>tú orquestas todo</b>.'],
['🛠️','Agent SDK','Python/TS: el <b>loop de Claude Code</b> listo para usar.'],
['☁️','Managed Agents','Estado, memoria y orquestación <b>gestionados</b> (mayo 2026).']]),
cards('4','grisperla','AGENT SDK','El motor de Claude Code en tu aplicación.','⚙️ npm / pip install',[
['🔁','Mismo bucle','Agente + <b>herramientas integradas</b> (archivos, bash, web).'],
['🧠','Contexto gestionado','Compactación automática: <b>sesiones largas</b> sin dolor.'],
['🚀','A producción','De script local a <b>servicio desplegado</b> con el mismo código.']]),
cards('5','marinocrema','SUBAGENTES','Divide y vencerás, en paralelo.','🤖 Orquestación',[
['🎯','Orquestador','Un agente principal <b>reparte el trabajo</b>.'],
['🧪','Especialistas','Cada subagente con <b>contexto y herramientas propios</b>.'],
['📐','Patrones','Explore (leer), Plan (diseñar), <b>general</b> (ejecutar).']]),
cards('6','azulcielo','MCP','Las manos de tu agente.','🔌 Conecta todo',[
['📬','Tus sistemas','Gmail, Slack, bases de datos, <b>APIs internas</b>.'],
['🔐','Spec 2026-07-28','OAuth + OIDC y <b>Apps y Tasks</b> versionados.'],
['♻️','Reutilizable','Un servidor MCP sirve a <b>todos tus agentes</b>.']]),
cards('7','negrabeige','MEMORIA Y ESTADO','Lo que separa demo de producción.','🧠 Managed Agents',[
['💾','Sesiones persistentes','El agente <b>retoma donde quedó</b>.'],
['🗂️','Memoria integrada','Contexto a largo plazo <b>sin montar tu vector DB</b>.'],
['📊','Monitoreo','Trazas y observabilidad <b>de serie</b>.']]),
cards('8','bomber','DISEÑA BIEN','Reglas de oro para que no se te desmadre.','📐 Criterio senior',[
['🎯','Objetivos, no tareas','Define el <b>criterio de "terminado"</b>, no cada paso.'],
['🛡️','Checkpoints','Aprobación humana en pasos <b>irreversibles</b>.'],
['🧪','Evals primero','Mide con casos reales <b>antes de escalar</b>.']]),
cards('9','chaleco','EMPIEZA HOY','3 agentes de bajo riesgo para esta semana.','✅ Reversible',[
['1️⃣','Triaje de inbox','Clasifica y prioriza tu correo <b>cada mañana</b>.'],
['2️⃣','Resumen de commits','Digest diario de tu repo <b>en Slack</b>.'],
['3️⃣','Research con MCP','Investiga y entrega <b>informe con fuentes</b>.']]),
stmt('10','traje','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> este carrusel','💬 Comenta <b>"AGENTE"</b> y te mando la guía del SDK','➕ <b>Sígueme</b>: IA verificada, cada semana','<span class="cyan">Construyo agentes a diario — esto sale de proyectos reales.</span>']),
]},
sk: { out: ['grisperla','marinocrema','tablet','azulcielo','burdeos','negrabeige','blancamarino','camel','gris','brazos'], S: [
cover('1','grisperla','Actualizado · Agosto 2026','SKILLS<br><span class="gold">DE CLAUDE</span>','Enséñale tu método<br>una sola vez','La función más infravalorada del ecosistema Claude, <b>explicada a fondo</b>.'),
stmt('2','marinocrema','DEJA DE REPETIR PROMPTS.<br><span class="gold">CONVIÉRTELOS EN SKILLS.</span>',['Una skill es <b>una carpeta con instrucciones</b> que Claude carga solo cuando toca.','<span class="cyan">Tu conocimiento, empaquetado y reutilizable para siempre.</span>']),
cards('3','tablet','QUÉ ES','La unidad mínima de conocimiento para Claude.','📁 Una carpeta',[
['📄','SKILL.md','Unidad de instrucciones <b>con nombre y versión</b>.'],
['🏷️','Frontmatter YAML','Mínimo obligatorio: <b>name + description</b>.'],
['📝','Markdown debajo','Pasos, reglas y criterios <b>en lenguaje natural</b>.']]),
cards('4','azulcielo','ACTIVACIÓN','No la invocas: aparece cuando hace falta.','✨ Automática',[
['🔎','Escaneo','Claude revisa tus skills <b>en cada prompt</b>.'],
['🎯','Match','La <b>descripción</b> es el disparador: si aplica, la carga.'],
['🪶','Solo lo necesario','No infla el contexto: <b>carga bajo demanda</b>.']]),
cards('5','burdeos','DÓNDE FUNCIONAN','Un formato, todo el ecosistema.','🌍 Portables',[
['💻','Claude Code','Carpeta <b>.claude/skills</b> del repo o vía plugin.'],
['🔌','API','Skills de Anthropic + <b>las tuyas subidas por API</b>.'],
['🖥️','Apps de Claude','El mismo método en <b>desktop y web</b>.']]),
cards('6','negrabeige','ANATOMÍA','SKILL.md por dentro, sin misterio.','🧬 Estructura',[
['1️⃣','Metadatos','--- name: … / description: … --- <b>(YAML)</b>'],
['2️⃣','Instrucciones','Proceso paso a paso + <b>criterios de calidad</b>.'],
['3️⃣','Recursos','Scripts, plantillas y referencias <b>en la carpeta</b>.']]),
cards('7','blancamarino','BUENAS PRÁCTICAS','La diferencia entre skill que dispara y skill muerta.','📐 Nivel pro',[
['🗣️','Disparadores claros','"Úsala cuando el usuario mencione…" — <b>sé literal</b>.'],
['🎯','Una skill, una tarea','Pequeñas y componibles > <b>una skill gigante</b>.'],
['🧪','Prueba y versiona','Casos reales + <b>itera la descripción</b>.']]),
cards('8','camel','IDEAS PARA TI','Las que más retorno dan desde el día 1.','💡 Mi stack',[
['📊','Informes','Tu formato exacto de reporte, <b>siempre igual</b>.'],
['🔍','Code review','Tu checklist de revisión <b>aplicado automáticamente</b>.'],
['🎨','Marca','Colores, tono y plantillas — <b>así hago estos carruseles</b>.']]),
cards('9','gris','EMPIEZA HOY','De prompt repetido a activo permanente.','✅ 30 minutos',[
['1️⃣','Detecta','Tu prompt <b>más repetido</b> de esta semana.'],
['2️⃣','Empaqueta','Carpeta + SKILL.md con <b>name y description</b>.'],
['3️⃣','Comparte','Súbela al repo del equipo: <b>conocimiento común</b>.']]),
stmt('10','brazos','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> este carrusel','💬 Comenta <b>"SKILL"</b> y te mando una plantilla de SKILL.md','➕ <b>Sígueme</b>: IA verificada, cada semana','<span class="cyan">Si lo explicaste dos veces, es una skill.</span>']),
]},
gpt: { out: ['negrabeige','blancamarino','holo','marinocrema','grisperla','azulcielo','burdeos','traje','bomber','chaleco'], S: [
cover('1','negrabeige','Lanzado · 9 julio 2026','GPT-5.6<br><span class="gold">SOL · TERRA · LUNA</span>','La nueva familia<br>de OpenAI','Tres inteligencias, tres precios — <b>cuál usar y para qué</b>.'),
stmt('2','blancamarino','YA NO ES UN MODELO.<br><span class="gold">ES UNA FAMILIA DE TRES.</span>',['Presentada el 26 de junio, pública desde el <b>9 de julio</b>: tiers con nombre propio que evolucionan por separado.','<span class="cyan">Sol = máxima capacidad · Terra = equilibrio · Luna = velocidad.</span>']),
cards('3','holo','SOL','El buque insignia: razonamiento de frontera.','☀️ Máxima capacidad',[
['🧠','Para qué','Razonamiento frontier y <b>agentes de larga duración</b>.'],
['⚡','Modo Max','Ajuste de razonamiento <b>al límite</b> para problemas duros.'],
['💰','Precio API','<b>$5 / $30</b> por millón de tokens (entrada/salida).']]),
cards('4','marinocrema','TERRA','El caballo de batalla del día a día.','🌍 Equilibrio',[
['⚖️','Rendimiento','Compite con GPT-5.5 <b>a la mitad de coste</b>.'],
['🏗️','Para qué','Features de producto, asistentes, <b>trabajo diario</b>.'],
['💰','Precio API','<b>$2.50 / $15</b> por millón de tokens.']]),
cards('5','grisperla','LUNA','Cuando la latencia importa más que la profundidad.','🌙 Velocidad',[
['🚀','El más rápido','Alto volumen, respuestas <b>en tiempo real</b>.'],
['🏷️','Para qué','Clasificación, resúmenes, <b>routing y soporte</b>.'],
['💰','Precio API','<b>$1 / $6</b> por millón de tokens.']]),
cards('6','azulcielo','LO NUEVO','Más allá de los tres tiers.','🆕 Capacidades',[
['🕸️','Ultra Mode','Coordinación de <b>agentes en paralelo</b>.'],
['🧑‍💻','Programmatic Tool Calling','El modelo <b>escribe JS</b> para orquestar herramientas.'],
['🤖','Multi-agent beta','Orquestación nativa en la <b>Responses API</b>.']]),
cards('7','burdeos','CUÁL USAR','Mi criterio de enrutado, tarea por tarea.','🧭 Decisión',[
['☀️','Sol','Estrategia, análisis complejo, <b>agentes largos</b>.'],
['🌍','Terra','El 80% de tu trabajo <b>diario</b>.'],
['🌙','Luna','Todo lo que necesite <b>volumen o velocidad</b>.']]),
cards('8','traje','VS CLAUDE','El contexto competitivo que nadie te cuenta.','⚖️ Julio 2026',[
['🟣','Opus 5 (24 jul)','<b>1M de contexto</b>, $5/$25, verificación de agentes.'],
['🥊','La pelea real','Agentes y <b>coste por resultado</b>, no benchmarks.'],
['🎯','Mi regla','Usa cada modelo <b>donde gana</b> — no por fanatismo.']]),
cards('9','bomber','EMPIEZA HOY','Convierte los tiers en ahorro real.','✅ Práctico',[
['1️⃣','Mapea','Tus tareas frecuentes → <b>Sol, Terra o Luna</b>.'],
['2️⃣','Mide','Coste por <b>tarea terminada</b>, no por token.'],
['3️⃣','Enruta','Un router simple que elija tier <b>automáticamente</b>.']]),
stmt('10','chaleco','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> este carrusel','💬 Comenta <b>"GPT"</b> y te mando la tabla comparativa','➕ <b>Sígueme</b>: IA verificada, cada semana','<span class="cyan">Mañana: Claude Code vs Codex — la batalla.</span>']),
]},
vs: { out: ['burdeos','grisperla','tablet','blancamarino','azulcielo','marinocrema','negrabeige','gris','camel','brazos'], S: [
cover('1','burdeos','Actualizado · Agosto 2026','CLAUDE CODE<br><span class="gold">VS CODEX</span>','La batalla de los<br>agentes de código','Benchmarks, calidad, coste y <b>cuándo usar cada uno</b> — con datos.'),
stmt('2','grisperla','NO HAY GANADOR ÚNICO.<br><span class="gold">HAY GANADOR PARA TU CASO.</span>',['Los dos son agentes de terminal. Cambian <b>filosofía, coste y fortalezas</b>.','<span class="cyan">Esto es lo que dicen los datos de 2026 — no el hype.</span>']),
cards('3','tablet','FILOSOFÍA','Dos formas de entender el mismo trabajo.','🧠 Enfoques',[
['🟣','Claude Code','<b>Developer-in-the-loop</b>: local, tú apruebas cada paso.'],
['🟢','Codex','Delegación <b>autónoma</b>, local y en la nube.'],
['🖥️','En común','Terminal primero, <b>IDE y nube</b> después.']]),
cards('4','blancamarino','BENCHMARKS','Los números de 2026, sin marketing.','📊 Datos',[
['🟢','Codex gana','<b>88.7%</b> SWE-bench Verified · 82% Terminal-Bench.'],
['🟣','Claude gana','<b>SWE-bench Pro (64.3%)</b> y refactors multi-archivo.'],
['⚠️','Ojo','Benchmark ≠ tu repo: <b>mide en tu caso real</b>.']]),
cards('5','azulcielo','CALIDAD','Lo que ven los revisores, no los benchmarks.','🏆 Código limpio',[
['👥','Revisión ciega','<b>67%</b> prefirió el código de Claude Code (vs 25%).'],
['🧵','Contexto 1M','Codebases grandes <b>en una sola sesión</b>.'],
['📉','Menos deuda','PRs largos con <b>menos retrabajo</b> después.']]),
cards('6','marinocrema','VELOCIDAD Y COSTE','Donde Codex pega fuerte.','⚡ Su terreno',[
['🚀','Ejecución','Más rápido y <b>más eficiente en tokens</b>.'],
['💳','Precio','Incluido en <b>todos los planes de ChatGPT</b> (hasta Free).'],
['🖥️','Terminal puro','Tareas de shell <b>cortas y autónomas</b>.']]),
cards('7','negrabeige','ELIGE CLAUDE CODE','Si esto te describe, no lo dudes.','🟣 Cuándo',[
['🏗️','Refactors grandes','Multi-archivo y <b>codebases enormes</b>.'],
['🔍','Calidad exigente','Code review estricto y <b>producción seria</b>.'],
['🧩','Ecosistema','MCP + <b>skills + subagentes</b> + CLAUDE.md.']]),
cards('8','gris','ELIGE CODEX','Su caso de uso legítimo — sin fanatismos.','🟢 Cuándo',[
['⚡','Prototipos','Scripts y pruebas <b>rápidas</b>.'],
['💳','Ya pagas ChatGPT','Coste marginal <b>cero</b>.'],
['☁️','Delegación en nube','Tareas autónomas <b>sin supervisión fina</b>.']]),
cards('9','camel','MI VEREDICTO','Después de usarlos a diario en proyectos reales.','⚖️ Honesto',[
['🤝','Usa ambos','Codex para velocidad, <b>Claude Code para calidad</b>.'],
['💰','Coste real','Lo que importa: coste por <b>tarea terminada</b>.'],
['🎯','La habilidad','Definir bien la tarea <b>vale en los dos</b>.']]),
stmt('10','brazos','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> este carrusel','💬 Comenta <b>"VS"</b> y te mando la comparativa completa','➕ <b>Sígueme</b>: IA verificada, cada semana','<span class="cyan">Yo los uso los dos — esto sale de práctica real.</span>']),
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
      let maxRight = 0;
      document.querySelectorAll('.slide .col, .slide .col *, .slide > div[style]').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        if (r.bottom > ir.top && r.right > maxRight) maxRight = r.right;
      });
      return { loaded: img.naturalWidth > 0, imgLeft: Math.round(ir.left), textMaxRight: Math.round(maxRight) };
    });
    await p.screenshot({ path: `${day}-s${n}.png` });
    console.log(day, n, JSON.stringify(m), m.loaded && m.textMaxRight <= m.imgLeft ? 'OK' : 'FAIL');
  }
  await b.close();
})();
