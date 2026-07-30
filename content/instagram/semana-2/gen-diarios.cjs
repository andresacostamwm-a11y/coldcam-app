// Carruseles diarios 31 jul - 4 ago (identidad v2, sin solapes, outfits rotados).
// v3 PRINCIPIANTES: lenguaje sencillo, mas informacion por slide, terminos explicados.
// Datos re-verificados 30-jul-2026. Uso: node gen-diarios.cjs <cc|ag|sk|gpt|vs>
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
.slide { position:absolute; inset:0; padding:56px 60px 48px; display:flex; flex-direction:column; z-index:2; }
.col { width:560px; display:flex; flex-direction:column; flex:1; }
.countL { display:inline-block; border:2px solid #C9932F; border-radius:14px; padding:7px 20px;
  font-family:'Oswald',sans-serif; font-size:27px; font-weight:600; color:#F0D9A6;
  align-self:flex-start; margin-bottom:20px; }
.countR { position:absolute; top:46px; right:50px; background:rgba(10,14,24,0.85);
  border-radius:999px; padding:11px 26px; font-size:29px; font-weight:700; color:#EAF2FA; z-index:3; }
.tgold { font-family:'Oswald',sans-serif; font-weight:700; text-transform:uppercase;
  font-size:56px; line-height:1.04; letter-spacing:1px;
  background:linear-gradient(180deg,#F8E2A6 8%,#E9B95B 55%,#C08A2E 100%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  filter:drop-shadow(0 4px 18px rgba(0,0,0,0.85)); }
.tsub { font-size:27px; color:#E9EFF6; margin-top:10px; line-height:1.32;
  text-shadow:0 2px 12px rgba(0,0,0,0.7); }
.tsub b { color:#F0B54A; }
.cap { display:inline-flex; align-items:center; gap:10px; border:2px solid #E8A33D; border-radius:12px;
  padding:8px 18px; margin:16px 0 18px; font-family:'Oswald',sans-serif; font-size:23px; font-weight:600;
  letter-spacing:2px; text-transform:uppercase; color:#F0B54A; align-self:flex-start;
  background:rgba(232,163,61,0.07); }
.card { display:flex; align-items:flex-start; gap:16px; border:2px solid rgba(232,163,61,0.6);
  border-radius:16px; background:rgba(10,16,28,0.78); padding:14px 17px; margin-bottom:12px; }
.hex { min-width:50px; height:50px; display:flex; align-items:center; justify-content:center;
  font-size:23px; color:#F0B54A; border:2px solid #C9932F; border-radius:12px;
  background:rgba(232,163,61,0.09); }
.card h3 { font-family:'Oswald',sans-serif; font-size:24px; font-weight:600; color:#F0B54A;
  letter-spacing:1px; margin-bottom:4px; text-transform:uppercase; }
.card p { font-size:22px; line-height:1.32; color:#E7EDF4; }
.card p b { color:#fff; }
.h1 { font-family:'Oswald',sans-serif; font-weight:700; text-transform:uppercase;
  font-size:82px; line-height:1.05; text-shadow:0 4px 24px rgba(0,0,0,0.85); }
.gold { color:#F0B54A; } .cyan { color:#35C7E8; }
.sub { font-family:'Oswald',sans-serif; font-weight:600; text-transform:uppercase; color:#35C7E8;
  font-size:38px; letter-spacing:2px; margin-top:22px; line-height:1.18;
  text-shadow:0 3px 18px rgba(0,0,0,0.8); }
.pill { display:inline-block; padding:11px 24px; border:2px solid #E8A33D; border-radius:999px;
  color:#F0B54A; font-size:25px; font-weight:700; letter-spacing:2px; margin-bottom:30px;
  align-self:flex-start; text-transform:uppercase; }
p.body { font-size:31px; line-height:1.4; color:#E6EDF5; text-shadow:0 2px 12px rgba(0,0,0,0.7); }
p.body b { color:#F0B54A; }
.mt { margin-top:18px; }
.vcenter { flex:1; display:flex; flex-direction:column; justify-content:center; }
.grow { flex:1; }
.firma { font-family:'Dancing Script',cursive; font-size:48px;
  background:linear-gradient(180deg,#F8E2A6,#D9A441); -webkit-background-clip:text;
  background-clip:text; color:transparent; filter:drop-shadow(0 2px 10px rgba(0,0,0,0.8)); }
.rol { font-size:20px; letter-spacing:3px; color:#9FB2C8; text-transform:uppercase; margin-top:2px; }
`;

const FOOT = `<div style="width:560px;"><div class="firma">Ing. Andrés Acosta</div><div class="rol">IA &amp; Automatización</div></div>`;
const card = (ico, t, p) => `<div class="card"><div class="hex">${ico}</div><div><h3>${t}</h3><p>${p}</p></div></div>`;
const av = (k) => `<div class="avbox"><img src="${AV[k]}"></div>`;
const cover = (n, o, pill, h1, sub, body) => `${NET}${av(o)}<div class="slide"><div class="countR">${n}/10</div>
<div class="col vcenter"><div class="pill">${pill}</div><div class="h1">${h1}</div><div class="sub">${sub}</div>
<p class="body mt" style="font-size:33px;">${body}</p></div>${FOOT}</div>`;
const stmt = (n, o, h1, bodies) => `${NET}${av(o)}<div class="slide"><div class="countR">${n}/10</div>
<div class="col vcenter"><div class="h1" style="font-size:62px;">${h1}</div>${bodies.map(b => `<p class="body mt">${b}</p>`).join('')}</div>${FOOT}</div>`;
const cards = (n, o, title, sub, cap, cs) => `${NET}${av(o)}<div class="slide"><div class="col">
<div class="countL">${n}/10</div><div class="tgold">${title}</div><div class="tsub">${sub}</div>
<div class="cap">${cap}</div>${cs.map(c => card(...c)).join('')}<div class="grow"></div>${FOOT}</div></div>`;

const DAYS = {
cc: { out: ['traje','azulcielo','tablet','negrabeige','blancamarino','burdeos','grisperla','marinocrema','gris','camel'], S: [
cover('1','traje','Guía desde cero · Jul 2026','CLAUDE<br><span class="gold">CODE</span>','La IA que trabaja<br>en tu ordenador','Qué es, cómo se instala gratis en 5 minutos y qué puede hacer por ti — <b>paso a paso y sin tecnicismos</b>.'),
stmt('2','azulcielo','NO ES UN CHAT.<br><span class="gold">ES UN ASISTENTE QUE HACE.</span>',['Un chat normal te responde con texto y ahí acaba. Claude Code además <b>usa tu ordenador</b>: lee tus archivos, los organiza, crea documentos y programas, y te entrega el trabajo terminado.','<span class="cyan">A eso se le llama "agente": una IA que da los pasos por sí sola hasta acabar la tarea.</span>']),
cards('3','tablet','QUÉ ES EXACTAMENTE','Un programa de Anthropic (la empresa creadora de Claude) que se maneja escribiendo en la terminal: la ventana donde se dan órdenes al ordenador.','🧠 En 3 ideas',[
['💬','Le hablas normal','Escribes en español lo que necesitas: <b>"ordena mis fotos por fecha"</b> o "resume estos PDF". No hace falta saber programar para empezar.'],
['🤖','Él hace el trabajo','Lee tus archivos, te <b>propone un plan</b>, lo ejecuta y te enseña el resultado. Tú apruebas los pasos importantes.'],
['🧠','Su cerebro: Opus 5','El modelo más potente de Anthropic (julio 2026). Su memoria de trabajo llega a <b>1 millón de tokens</b>: como leer un libro entero de una vez sin olvidar nada.']]),
cards('4','negrabeige','CÓMO SE INSTALA','De cero a funcionando en 5 minutos. Solo necesitas un ordenador (Windows, Mac o Linux) e internet.','🚀 3 pasos',[
['1️⃣','Instala Node.js','Descárgalo gratis en nodejs.org (es el "motor" que Claude Code necesita). Instalación de <b>siguiente → siguiente → listo</b>.'],
['2️⃣','Copia un comando','Abre la terminal y pega: <b>npm install -g @anthropic-ai/claude-code</b>. Tarda un minuto.'],
['3️⃣','Escribe "claude"','Se abre el asistente y te pide entrar con tu <b>cuenta de Claude</b> (plan Pro o superior) o con una clave de la API. Y ya está.']]),
cards('5','blancamarino','QUÉ PUEDE HACER POR TI','No es solo para programadores: sirve para cualquier persona que trabaje con archivos y documentos.','💡 Ejemplos reales',[
['📂','Ordenar tu caos','Cientos de fotos, facturas o documentos <b>organizados y renombrados en minutos</b>, con el criterio que tú le digas.'],
['📊','Informes y resúmenes','Lee tus documentos y te crea <b>resúmenes, tablas comparativas o presentaciones</b> listas para enviar.'],
['🌐','Crear desde cero','Páginas web, hojas de cálculo automatizadas, pequeños programas: <b>tú lo describes, él lo construye</b> delante de ti.']]),
cards('6','burdeos','MINI DICCIONARIO','Tres palabras que verás siempre. Entiéndelas y el resto es fácil.','📖 Sin miedo a la jerga',[
['🧵','Contexto','La "memoria de la conversación": todo lo que la IA ha leído en la sesión. Más contexto = <b>puede con proyectos más grandes</b> sin perderse.'],
['🤖','Agente','Una IA que no solo responde: <b>decide pasos y usa herramientas</b> (archivos, internet, programas) hasta terminar el objetivo.'],
['🧩','Subagente','Ayudantes que Claude Code crea para <b>repartirse el trabajo en paralelo</b>. Desde julio pueden crear a su vez sus propios ayudantes.']]),
cards('7','grisperla','TRUCOS QUE MARCAN LA DIFERENCIA','Tres funciones (nuevas o mejoradas en julio 2026) explicadas en fácil.','🆕 Nivel siguiente',[
['📄','CLAUDE.md','Un archivo de texto con tus reglas: "responde en español", "no toques esta carpeta". Lo lee <b>siempre al empezar</b>, como su manual de tu casa.'],
['🎯','Skills','Instrucciones guardadas que se activan solas cuando tocan. <b>Le enseñas tu método una vez</b> y lo aplica siempre igual.'],
['🔌','MCP','El "enchufe universal" que lo conecta con tus apps: Gmail, Slack, bases de datos… Renovado en julio con <b>inicio de sesión más seguro</b>.']]),
cards('8','marinocrema','ERRORES DE NOVATO','Los 3 fallos más comunes al empezar — y cómo evitarlos desde el día uno.','❌ Que no te pasen',[
['🧨','Pedirlo todo de golpe','Mejor tareas pequeñas y claras, de una en una: <b>"haz esto y avísame cuando acabes"</b>. Acabarás antes.'],
['👀','Aprobar sin leer','Cuando te proponga cambios, <b>léelos antes de aceptar</b>. Tú eres el jefe; él, el ayudante.'],
['💾','Trabajar sin red','Usa copias de seguridad (o git, si lo conoces): si algo sale mal, <b>vuelves atrás en segundos</b>.']]),
cards('9','gris','EMPIEZA HOY MISMO','Tres tareas fáciles y sin ningún riesgo para tu primer día.','✅ Prueba esto',[
['1️⃣','Pregunta','"Explícame qué hay en esta carpeta y para qué sirve cada cosa" — solo lee, <b>no cambia nada</b>.'],
['2️⃣','Organiza','"Ordena estos archivos por tipo y fecha" — hazlo primero en una <b>carpeta de prueba</b>.'],
['3️⃣','Crea','"Hazme una página web sencilla sobre mí" — y ábrela en tu navegador. <b>Verlo funcionar engancha</b>.']]),
stmt('10','camel','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> este carrusel para instalarlo con calma','💬 Comenta <b>"CODE"</b> y te mando la guía completa de inicio','➕ <b>Sígueme</b>: IA explicada en simple, cada semana','<span class="cyan">Mañana: agentes de IA — qué son y cómo tener el tuyo.</span>']),
]},
ag: { out: ['blancamarino','burdeos','holo','grisperla','marinocrema','azulcielo','negrabeige','bomber','chaleco','traje'], S: [
cover('1','blancamarino','Explicado desde cero','AGENTES<br><span class="gold">DE IA</span>','Qué son y cómo tener<br>el tuyo sin ser experto','La diferencia real entre un chatbot y un agente, <b>con ejemplos de la vida diaria</b> y un camino para empezar.'),
stmt('2','burdeos','UN CHATBOT RESPONDE.<br><span class="gold">UN AGENTE TRABAJA.</span>',['Al chatbot le preguntas y te contesta. Al agente le das <b>un objetivo</b> — "revisa mi correo y resume lo urgente" — y él solo da todos los pasos hasta entregártelo hecho.','<span class="cyan">Y en 2026 ya puedes tener uno sin escribir ni una línea de código.</span>']),
cards('3','holo','CÓMO PIENSA UN AGENTE','El ciclo que repite una y otra vez hasta terminar tu encargo. Entender esto es entenderlo todo.','🔁 El ciclo de 4 pasos',[
['🎯','1. Objetivo','Tú le dices <b>qué quieres conseguir</b>, no cómo hacerlo. Como a un buen empleado.'],
['🗺️','2. Plan','Divide tu encargo en <b>pasos pequeños</b> por sí solo y decide el orden.'],
['🛠️','3. Herramientas','Usa lo que haga falta: leer archivos, <b>buscar en internet</b>, escribir documentos, enviar mensajes.'],
['✅','4. Verificación','Comprueba su propio resultado y lo <b>corrige antes de entregártelo</b>.']]),
cards('4','grisperla','3 FORMAS DE TENER UNO','Ordenadas de más fácil a más avanzada. Empieza por la primera y sube cuando lo necesites.','🧭 Elige tu nivel',[
['🖥️','Ya montados','Claude Code o Claude Cowork: agentes <b>listos para usar desde el primer día</b>, sin programar nada.'],
['🛠️','Agent SDK','Para quien programa: el "kit de construcción" de Anthropic (en Python o TypeScript) para <b>meter un agente dentro de tu propia app</b>.'],
['☁️','Managed Agents','Anthropic aloja tu agente en su nube, con <b>memoria y seguridad incluidas</b>. Lo más nuevo de 2026.']]),
cards('5','marinocrema','LA MEMORIA','La diferencia entre un juguete y un ayudante de verdad es que <b>recuerde</b>.','💾 Explicado en simple',[
['🧠','Sin memoria','Cada conversación empieza de cero y <b>le repites todo</b> una y otra vez. Agotador.'],
['📁','Con memoria','El agente guarda notas de lo que aprende ("a Andrés le gusta así") y <b>las relee la próxima vez</b>.'],
['🤝','Memoria compartida','En Managed Agents, lo que aprende un agente <b>pueden usarlo los demás</b> agentes de tu equipo. Novedad de este año.']]),
cards('6','azulcielo','MCP: SUS MANOS','Las siglas que más verás este año: el estándar que conecta tu agente con tus aplicaciones.','🔌 El enchufe universal',[
['📬','Conecta tus apps','Gmail, Slack, Notion, tu calendario, tu tienda online… con MCP el agente <b>puede usarlas por ti</b>.'],
['🔐','Siempre con permiso','Tú decides a qué puede acceder. La versión de julio 2026 añade <b>inicio de sesión seguro</b> (el mismo sistema que usan los bancos).'],
['♻️','Una vez, para todos','Conectas una aplicación una sola vez y <b>todos tus agentes</b> pueden usarla desde entonces.']]),
cards('7','negrabeige','SEGURIDAD PRIMERO','Los agentes son potentes. Estas 3 reglas de oro evitan sustos.','🛡️ No las saltes',[
['✋','Tú apruebas lo delicado','Pagos, correos a clientes, borrar archivos: configúralo para que <b>siempre te pregunte antes</b>.'],
['🧪','Prueba en pequeño','Primero con datos de prueba o copias. Cuando confíes en él, <b>pásale lo real</b>.'],
['📊','Revisa sus entregas','Los primeros días revísalo todo: así descubres <b>qué puedes delegarle</b> con tranquilidad y qué no.']]),
cards('8','bomber','IDEAS PARA EMPEZAR','Tres agentes útiles de verdad que puedes tener funcionando esta misma semana.','💡 Fáciles y seguros',[
['📥','El que ordena tu correo','Cada mañana clasifica tu bandeja y te deja un resumen con <b>solo lo importante</b>.'],
['🔎','El investigador','Le das un tema y te trae un <b>informe con sus fuentes</b>, listo para leer en 5 minutos.'],
['📅','El de la agenda','Cada tarde te prepara el <b>resumen de tus reuniones de mañana</b> con lo que necesitas saber.']]),
cards('9','chaleco','TU PRIMER AGENTE, HOY','El camino recomendado si empiezas totalmente de cero.','✅ 3 pasos',[
['1️⃣','Empieza con uno ya hecho','Claude Code o Cowork: es <b>un agente ya montado</b> — solo tienes que hablarle.'],
['2️⃣','Dale una tarea que odies','Ordenar facturas, renombrar fotos, resumir documentos: <b>esa es la mejor primera prueba</b>.'],
['3️⃣','Ajusta y repite','Corrige sus instrucciones hasta que lo haga <b>exactamente como tú</b>. Ya tienes tu primer agente.']]),
stmt('10','traje','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> este carrusel como tu hoja de ruta','💬 Comenta <b>"AGENTE"</b> y te mando la guía para montar el primero','➕ <b>Sígueme</b>: IA explicada en simple, cada semana','<span class="cyan">Construyo agentes a diario — esto sale de práctica real.</span>']),
]},
sk: { out: ['grisperla','marinocrema','tablet','azulcielo','burdeos','negrabeige','blancamarino','camel','gris','brazos'], S: [
cover('1','grisperla','Explicado desde cero','SKILLS<br><span class="gold">DE CLAUDE</span>','Enséñale una vez,<br>lo hará siempre','Qué son las skills, cómo crear la primera en 10 minutos y por qué <b>ahorran horas cada semana</b>.'),
stmt('2','marinocrema','¿REPITES EL MISMO<br><span class="gold">PROMPT CADA SEMANA?</span>',['Eso que copias y pegas una y otra vez puede guardarse como una <b>skill</b>: instrucciones que Claude usará por sí solo, justo cuando toquen.','<span class="cyan">Piensa en ella como una receta guardada: no la buscas — se cocina sola cuando pides ese plato.</span>']),
cards('3','tablet','QUÉ ES UNA SKILL','La explicación más simple posible: una carpeta con una receta dentro.','📁 Así de fácil',[
['📄','Un archivo de texto','Se llama SKILL.md. Dentro escribes las instrucciones <b>en tu idioma, como una receta</b>: pasos, reglas, ejemplos.'],
['🏷️','Nombre y descripción','Las dos únicas líneas obligatorias al principio. La descripción le dice a Claude <b>cuándo debe usarla</b>.'],
['📎','Extras opcionales','En la misma carpeta puedes meter plantillas, ejemplos o pequeños programas <b>para que los use</b> al trabajar.']]),
cards('4','azulcielo','LA MAGIA: SE ACTIVA SOLA','No tienes que acordarte de que existe. Esa es exactamente la gracia.','✨ Cómo decide',[
['🔎','Mira tu petición','Cada vez que pides algo, Claude repasa tus skills y comprueba <b>si alguna encaja</b> con lo que quieres.'],
['🎯','Si encaja, la usa','Carga tus instrucciones guardadas y las sigue <b>al pie de la letra</b>, sin que se lo pidas.'],
['🪶','Si no, no molesta','Una skill "dormida" apenas ocupa memoria (~100 tokens, unas 75 palabras). Puedes tener <b>decenas sin problema</b>.']]),
cards('5','burdeos','DÓNDE FUNCIONAN','Las creas una vez y te sirven en muchos sitios. Son un estándar abierto.','🌍 Muy portables',[
['👤','Para ti','En tu carpeta personal: tu método te acompaña <b>en todos tus proyectos</b>.'],
['📦','Para tu equipo','En la carpeta del proyecto: <b>todos trabajan igual</b>, con las mismas reglas.'],
['🔌','En otras apps','Desde diciembre de 2025 son un estándar abierto adoptado por <b>más de 26 plataformas</b> (Cursor, VS Code, Gemini CLI y más).']]),
cards('6','negrabeige','CREA LA TUYA EN 10 MIN','El paso a paso completo. De verdad que no hay más.','🛠️ Manos a la obra',[
['1️⃣','Crea la carpeta','Con el nombre de tu skill. Ejemplo: <b>informe-semanal</b>.'],
['2️⃣','Escribe SKILL.md','Arriba: nombre y descripción. Debajo: <b>tus instrucciones paso a paso</b>, como se las darías a un ayudante nuevo.'],
['3️⃣','Guárdala y pruébala','Pídele a Claude algo relacionado y verás cómo <b>la usa él solo</b>. Si no la usa, mejora la descripción.']]),
cards('7','blancamarino','EL SECRETO: LA DESCRIPCIÓN','El 90% de las skills que "no funcionan" fallan solo en esto.','🎯 Escríbela así',[
['🗣️','Sé literal','"Úsala cuando pida un informe semanal, un resumen de ventas o métricas del mes". Claude <b>no adivina</b>: díselo con las palabras que usarías tú.'],
['🚫','Di cuándo NO','"No la uses para informes de clientes" — así evitas que <b>salte cuando no toca</b>.'],
['🧪','Prueba y ajusta','¿No se activa? Reescribe la descripción con otras palabras. <b>Dos o tres intentos</b> y quedará fina.']]),
cards('8','camel','IDEAS QUE AHORRAN HORAS','Skills reales que puedes copiar hoy mismo para tu día a día.','💡 Mi top 3',[
['📊','Tu informe tipo','Tu formato exacto de informe o reporte: <b>siempre igual, sin repetir instrucciones</b>.'],
['✍️','Tu forma de escribir','Tu tono para correos y publicaciones: Claude escribe <b>sonando a ti</b>.'],
['🎨','Tu marca','Colores, plantillas y reglas de diseño: <b>así se hacen estos carruseles</b> que estás viendo.']]),
cards('9','gris','EMPIEZA HOY','De prompt repetido a skill guardada en menos de media hora.','✅ Plan de 3 pasos',[
['1️⃣','Encuentra al candidato','¿Qué instrucción escribiste <b>más de dos veces</b> esta semana? Esa es tu primera skill.'],
['2️⃣','Conviértela','Carpeta + SKILL.md con nombre, descripción clara y <b>tus pasos de siempre</b>.'],
['3️⃣','Ponla a prueba','Haz 5 peticiones reales: ¿se activa cuando debe <b>y solo cuando debe</b>? Lista.']]),
stmt('10','brazos','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> este carrusel para crear tu primera skill','💬 Comenta <b>"SKILL"</b> y te mando una plantilla lista para rellenar','➕ <b>Sígueme</b>: IA explicada en simple, cada semana','<span class="cyan">Si lo has explicado dos veces, es una skill.</span>']),
]},
gpt: { out: ['negrabeige','blancamarino','holo','marinocrema','grisperla','azulcielo','burdeos','traje','bomber','chaleco'], S: [
cover('1','negrabeige','Lanzado · 9 julio 2026','GPT-5.6<br><span class="gold">SOL · TERRA · LUNA</span>','Las 3 versiones<br>explicadas fácil','Qué es cada una, cuánto cuestan y <b>cuál te conviene a ti</b> — sin tecnicismos y con ejemplos.'),
stmt('2','blancamarino','YA NO HAY UN CHATGPT.<br><span class="gold">HAY TRES.</span>',['OpenAI lanzó GPT-5.6 en tres versiones con nombre propio. La idea es simple: <b>no pagar el más caro</b> para tareas sencillas.','<span class="cyan">Sol = el más inteligente · Terra = el equilibrado · Luna = el rápido y barato.</span>']),
cards('3','holo','SOL ☀️ — EL CEREBRO','La versión más potente. Para cuando el problema es difícil de verdad.','🧠 El tope de gama',[
['🎓','Para qué sirve','Análisis complejos, investigar a fondo, <b>proyectos largos</b> donde no puede perderse.'],
['⚡','Modo Ultra','Un botón extra: piensa aún más antes de responder. En pruebas difíciles de programación <b>sube de 88,8% a 91,9% de acierto</b>.'],
['💰','Lo que cuesta','Por API: $5 por millón de palabras-fragmento (tokens) de entrada y <b>$30 por millón de salida</b>. Solo pagas lo que usas.']]),
cards('4','marinocrema','TERRA 🌍 — EL EQUILIBRADO','La versión para el día a día. La que la mayoría debería usar casi siempre.','⚖️ Calidad-precio',[
['💪','Rinde como los grandes','Da resultados al nivel del anterior tope de gama (GPT-5.5) <b>a la mitad de precio</b>.'],
['🏗️','Para qué sirve','Escribir, resumir, responder correos, ayudarte a pensar: <b>el 80% de lo que haces</b> con la IA.'],
['💰','Lo que cuesta','$2,50 entrada / <b>$15 salida</b> por millón de tokens. La mejor relación calidad-precio de la familia.']]),
cards('5','grisperla','LUNA 🌙 — EL VELOZ','La versión rápida y barata. Para tareas simples en grandes cantidades.','🚀 Volumen y velocidad',[
['⏱️','Responde al instante','El más rápido de los tres: ideal cuando <b>la velocidad importa más</b> que la profundidad.'],
['🏷️','Para qué sirve','Clasificar mensajes, extraer datos, resúmenes cortos, <b>respuestas automáticas</b>.'],
['💰','Lo que cuesta','$1 entrada / <b>$6 salida</b> por millón de tokens. Perfecto para automatizar sin miedo a la factura.']]),
cards('6','azulcielo','¿CUÁL ELIJO YO?','Guía rápida según tu situación. Y recuerda: puedes combinar.','🧭 Decisión fácil',[
['🙋','Si estás empezando','Terra. Es el equilibrio: <b>calidad alta sin pagar de más</b>. Cambia a Sol solo para lo difícil.'],
['💼','Si es para tu trabajo','Terra para el día a día + <b>Sol para análisis importantes</b>. Combinar es lo inteligente.'],
['🏭','Si automatizas mucho','Luna para el volumen (miles de tareas simples) y <b>guarda Sol para lo crítico</b>.']]),
cards('7','burdeos','NOVEDADES QUE IMPORTAN','Dos funciones nuevas explicadas en lenguaje humano.','🆕 Julio 2026',[
['🧑‍💻','Herramientas más listas','El modelo ahora escribe mini-programas para usar tus herramientas de golpe, en vez de ir una a una: <b>más rápido y más barato</b>.'],
['🔒','Y más seguro','Esos mini-programas corren en una "caja cerrada" <b>sin acceso a internet</b>: no pueden tocar nada que no deban.'],
['🤖','Equipos de IA (beta)','Ya puede coordinar <b>varios GPT trabajando en paralelo</b> en la misma tarea. Aún en pruebas.']]),
cards('8','traje','¿Y FRENTE A CLAUDE?','La pregunta del millón, respondida con datos y sin fanatismos.','⚖️ La foto real',[
['🤝','Van casi empatados','En el examen más famoso de programación (SWE-bench), Claude Opus 5 saca <b>97,0%</b> y GPT-5.6 Sol <b>96,2%</b>. Décimas.'],
['🎯','Cada uno brilla en algo','GPT-5.6 es más rápido en tareas de terminal; Claude aguanta <b>proyectos más grandes</b> sin perderse.'],
['💡','Mi consejo','Prueba los dos con tu caso real y quédate con el que mejor te funcione. <b>Muchos usamos ambos</b>.']]),
cards('9','bomber','PRUÉBALO ESTA SEMANA','Un plan sencillo para saber en 3 días cuál es tu versión.','✅ Sin gastar de más',[
['1️⃣','Haz tu lista','Apunta las 5 tareas que <b>más repites</b> con la IA (correos, resúmenes, ideas…).'],
['2️⃣','Pruébalas en Terra','Es el punto de partida ideal. ¿Alguna se le atasca? <b>Súbela a Sol</b>.'],
['3️⃣','Detecta lo simple','Lo que sea mecánico y masivo, <b>a Luna</b>. Tu bolsillo lo nota.']]),
stmt('10','chaleco','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> esta guía para elegir bien','💬 Comenta <b>"GPT"</b> y te mando la tabla comparativa completa','➕ <b>Sígueme</b>: IA explicada en simple, cada semana','<span class="cyan">Mañana: Claude Code vs Codex — ¿cuál te conviene?</span>']),
]},
vs: { out: ['burdeos','grisperla','tablet','blancamarino','azulcielo','marinocrema','negrabeige','gris','camel','brazos'], S: [
cover('1','burdeos','Comparativa honesta · Jul 2026','CLAUDE CODE<br><span class="gold">VS CODEX</span>','¿Cuál te conviene?<br>Explicado fácil','Los dos asistentes de programación del momento, comparados <b>con datos y sin fanatismos</b>.'),
stmt('2','grisperla','LOS DOS SON BUENÍSIMOS.<br><span class="gold">LA DIFERENCIA ESTÁ EN EL ESTILO.</span>',['Ambos hacen lo mismo a grandes rasgos: <b>programan y automatizan por ti</b>. Pero trabajan de forma distinta, y eso decide cuál encaja contigo.','<span class="cyan">Aquí va la comparación clara que me habría gustado leer a mí.</span>']),
cards('3','tablet','QUIÉN ES QUIÉN','Las presentaciones básicas, por si llegas de nuevas.','👋 Los contendientes',[
['🟣','Claude Code','De Anthropic (los creadores de Claude). Un asistente que trabaja en tu ordenador: <b>lee, planifica, ejecuta y te enseña</b> cada cambio.'],
['🟢','Codex','De OpenAI (los creadores de ChatGPT). Su asistente equivalente, <b>incluido en los planes de ChatGPT</b> — hasta en el gratuito.'],
['🖥️','En común','Los dos funcionan en la terminal y en tu editor, y pueden <b>trabajar solos en segundo plano</b>.']]),
cards('4','blancamarino','DOS ESTILOS DE TRABAJO','La diferencia más importante no son los números: es la filosofía.','🧠 Filosofías',[
['🟣','Claude: contigo al mando','Te propone un plan, te enseña los cambios y <b>tú apruebas cada paso importante</b>. Control total.'],
['🟢','Codex: más independiente','Le das la tarea y <b>se la lleva a su nube</b>: vuelve con el resultado hecho. Más delegación, menos control.'],
['🎯','La pregunta clave','¿Prefieres supervisar el proceso o <b>solo ver el resultado final</b>? Esa respuesta ya elige por ti.']]),
cards('5','azulcielo','QUÉ DICEN LAS PRUEBAS','Resultados de exámenes independientes de julio 2026, en cristiano.','📊 Datos, no opiniones',[
['🤝','Casi empate arriba','En el examen estrella de programación (SWE-bench): Claude <b>97,0%</b> vs GPT-5.6 <b>96,2%</b>. Diferencia mínima.'],
['🟢','Codex gana en rapidez','En tareas puras de terminal es más veloz y su modo Ultra llega al <b>91,9% de acierto</b>.'],
['🟣','Claude gana en fondo','En proyectos grandes y tareas largas lidera <b>9 de 12 pruebas</b>, con hasta 14,6 puntos de ventaja en la más dura.']]),
cards('6','marinocrema','PRECIOS EN SIMPLE','Cuánto cuesta cada uno de verdad, sin letra pequeña.','💰 Tu bolsillo',[
['🟢','Codex','Va <b>incluido en tu plan de ChatGPT</b> (incluso el gratuito, con límites). Si ya pagas ChatGPT, probarlo te sale gratis.'],
['🟣','Claude Code','Con el <b>plan Pro de Claude</b> (o pagando por uso: $5/$25 por millón de tokens). La suscripción es lo cómodo para empezar.'],
['🧮','El coste real','No es el precio por mensaje: es <b>cuántas veces tienes que repetir</b> hasta que quede bien. Ahí se decide.']]),
cards('7','negrabeige','ELIGE CLAUDE CODE SI…','Estos tres perfiles le sacan más partido.','🟣 Su terreno',[
['🏗️','Proyectos grandes','Su memoria de 1 millón de tokens aguanta <b>proyectos enteros</b> sin perderse por el camino.'],
['🔍','Quieres control','Ver el plan y aprobar cada cambio te da <b>tranquilidad y aprendizaje</b>.'],
['🧩','Quieres ecosistema','Skills, conexiones con tus apps (MCP) y ayudantes en paralelo: <b>el kit más completo</b>.']]),
cards('8','gris','ELIGE CODEX SI…','Y estos tres perfiles encajan mejor con él.','🟢 Su terreno',[
['💳','Ya pagas ChatGPT','Está incluido: <b>coste extra cero</b> para empezar hoy mismo.'],
['⚡','Tareas rápidas','Scripts, arreglos pequeños, pruebas: <b>velocidad pura</b>.'],
['☁️','Prefieres delegar','Mandar la tarea y <b>recibirla hecha</b>, sin supervisar el proceso.']]),
cards('9','camel','MI VEREDICTO HONESTO','Después de usar los dos a diario en proyectos reales.','⚖️ Sin fanatismos',[
['🤝','No hay un ganador único','Hay un ganador <b>para tu caso</b>. Y puede que sean los dos: yo los combino.'],
['🧪','Haz tu propia prueba','La misma tarea real en ambos. Compara resultado, tiempo y <b>cuántas correcciones</b> necesitaste.'],
['🎯','La habilidad que importa','Explicar bien la tarea (contexto + qué quieres + cómo sabrás que está bien) <b>vale para los dos</b>.']]),
stmt('10','brazos','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> esta comparativa para decidir con calma','💬 Comenta <b>"VS"</b> y te mando la tabla completa con todos los datos','➕ <b>Sígueme</b>: IA explicada en simple, cada semana','<span class="cyan">Yo uso los dos a diario — esto sale de práctica real.</span>']),
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
