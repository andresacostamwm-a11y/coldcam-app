// Carruseles diarios 31 jul - 4 ago (identidad v2, letra grande v5).
// v6 INTERACTIVO: Andres INTERACTUA con el contenido de cada slide — poses
// dinamicas (senala, tablet, teclea, holograma, brazos abiertos, caminando...)
// relacionadas con el tema de la slide, con sensacion de movimiento. Los
// cutouts se recortan al pixel visible (trim alfa) para maximizar tamano.
// Uso: node gen-diarios.cjs <cc|ag|sk|gpt|vs>
const { chromium } = require('playwright');
const https = require('https');

const AV = {
  senala: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260731_074058_bf96755b-8bbe-456a-9970-a1744d2246bb.png',
  palma: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260731_074101_7cf317f9-9081-4e4d-b727-e080307e4c6e.png',
  tabletoca: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260731_074107_3d5f460b-f845-4c47-b4e0-3bb7325e56f3.png',
  teclea: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260731_074109_cb4ed261-72e7-4183-9f0c-3fad29a54488.png',
  movil: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260731_074116_5dc8b733-9e71-4de8-8ec0-3bb9f1c632f1.png',
  holo2: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260731_074118_e1c6e583-2c65-4e53-a12d-3ac5eada721c.png',
  abierto: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260731_074124_cdff6d34-0912-41dc-aa16-e03310bc4a48.png',
  pulgar: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260731_074127_b8e0cf41-86c6-4a8a-994e-133d7363ae4d.png',
  camina: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260731_074141_41af24b8-40aa-4847-a66c-59e14ac81d78.png',
  ojo: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260731_074144_5cd32c2e-a84a-4d33-bd2b-916e7256ee2e.png',
  datoarriba: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260731_074151_7e61ce32-ff92-4ce8-80f9-a8cf4d245294.png',
};

function fetchBuf(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (r) => {
      if (r.statusCode >= 300 && r.headers.location) return fetchBuf(r.headers.location).then(resolve, reject);
      const chunks = [];
      r.on('data', (d) => chunks.push(d));
      r.on('end', () => resolve(Buffer.concat(chunks)));
      r.on('error', reject);
    }).on('error', reject);
  });
}

// Recorta cada cutout a su caja visible (pixeles con alfa) para que el avatar
// ocupe el maximo tamano posible y la verificacion de solapes sea real.
async function trimAll(page) {
  const trimmed = {};
  for (const k of Object.keys(AV)) {
    const buf = await fetchBuf(AV[k]);
    const dataUrl = 'data:image/png;base64,' + buf.toString('base64');
    trimmed[k] = await page.evaluate(async (src) => {
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = src; });
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let minX = c.width, minY = c.height, maxX = 0, maxY = 0;
      for (let y = 0; y < c.height; y += 2) {
        for (let x = 0; x < c.width; x += 2) {
          if (d[(y * c.width + x) * 4 + 3] > 16) {
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
          }
        }
      }
      const pad = 4;
      minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
      maxX = Math.min(c.width - 1, maxX + pad); maxY = Math.min(c.height - 1, maxY + pad);
      const w = maxX - minX + 1, h = maxY - minY + 1;
      const out = document.createElement('canvas');
      out.width = w; out.height = h;
      out.getContext('2d').drawImage(img, minX, minY, w, h, 0, 0, w, h);
      return out.toDataURL('image/png');
    }, dataUrl);
    console.log('trim', k, 'ok');
  }
  return trimmed;
}
let TRIM = {};

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
.avbox { position:absolute; right:0; bottom:0; width:660px; height:1250px;
  display:flex; align-items:flex-end; justify-content:flex-end; z-index:1; }
.avbox img { position:relative; z-index:2; max-width:660px; max-height:1250px;
  object-fit:contain; object-position:bottom right;
  filter:drop-shadow(-16px 0 50px rgba(0,0,0,0.82)); }
.aura { position:absolute; right:-70px; bottom:-40px; width:720px; height:980px;
  background:radial-gradient(ellipse at 60% 68%, rgba(232,163,61,0.26) 0%, rgba(53,199,232,0.12) 45%, transparent 72%); }
.ring { position:absolute; border-radius:50%; }
.r1 { right:28px; bottom:16px; width:480px; height:110px;
  border:2px solid rgba(53,199,232,0.5); box-shadow:0 0 36px rgba(53,199,232,0.3); }
.r2 { right:66px; bottom:35px; width:400px; height:86px; border:2px solid rgba(232,163,61,0.55); }
.slide { position:absolute; inset:0; padding:44px 40px 40px 36px; display:flex; flex-direction:column; z-index:2; }
.col { width:470px; display:flex; flex-direction:column; flex:1; }
.countL { display:inline-block; border:2px solid #C9932F; border-radius:14px; padding:8px 22px;
  font-family:'Oswald',sans-serif; font-size:30px; font-weight:600; color:#F0D9A6;
  align-self:flex-start; margin-bottom:14px; }
.countR { position:absolute; top:42px; right:44px; background:rgba(10,14,24,0.85);
  border-radius:999px; padding:12px 28px; font-size:31px; font-weight:700; color:#EAF2FA; z-index:3; }
.tgold { font-family:'Oswald',sans-serif; font-weight:700; text-transform:uppercase;
  font-size:62px; line-height:1.04; letter-spacing:1px;
  background:linear-gradient(180deg,#F8E2A6 8%,#E9B95B 55%,#C08A2E 100%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  filter:drop-shadow(0 4px 18px rgba(0,0,0,0.85)); }
.tsub { font-size:30px; color:#E9EFF6; margin-top:10px; line-height:1.3;
  text-shadow:0 2px 12px rgba(0,0,0,0.7); }
.tsub b { color:#F0B54A; }
.cap { display:inline-flex; align-items:center; gap:10px; border:2px solid #E8A33D; border-radius:12px;
  padding:9px 18px; margin:12px 0 14px; font-family:'Oswald',sans-serif; font-size:26px; font-weight:600;
  letter-spacing:1.5px; text-transform:uppercase; color:#F0B54A; align-self:flex-start;
  background:rgba(232,163,61,0.07); }
.card { display:flex; align-items:flex-start; gap:14px; border:2px solid rgba(232,163,61,0.6);
  border-radius:16px; background:rgba(10,16,28,0.78); padding:14px 16px; margin-bottom:12px; }
.hex { min-width:46px; height:46px; display:flex; align-items:center; justify-content:center;
  font-size:24px; color:#F0B54A; border:2px solid #C9932F; border-radius:12px;
  background:rgba(232,163,61,0.09); }
.card h3 { font-family:'Oswald',sans-serif; font-size:28px; font-weight:600; color:#F0B54A;
  letter-spacing:1px; margin-bottom:4px; text-transform:uppercase; }
.card p { font-size:25px; line-height:1.28; color:#E7EDF4; }
.card p b { color:#fff; }
.h1 { font-family:'Oswald',sans-serif; font-weight:700; text-transform:uppercase;
  font-size:88px; line-height:1.05; text-shadow:0 4px 24px rgba(0,0,0,0.85); }
.gold { color:#F0B54A; } .cyan { color:#35C7E8; }
.sub { font-family:'Oswald',sans-serif; font-weight:600; text-transform:uppercase; color:#35C7E8;
  font-size:42px; letter-spacing:2px; margin-top:22px; line-height:1.18;
  text-shadow:0 3px 18px rgba(0,0,0,0.8); }
.pill { display:inline-block; padding:12px 26px; border:2px solid #E8A33D; border-radius:999px;
  color:#F0B54A; font-size:27px; font-weight:700; letter-spacing:2px; margin-bottom:30px;
  align-self:flex-start; text-transform:uppercase; }
p.body { font-size:34px; line-height:1.36; color:#E6EDF5; text-shadow:0 2px 12px rgba(0,0,0,0.7); }
p.body b { color:#F0B54A; }
.mt { margin-top:18px; }
.vcenter { flex:1; display:flex; flex-direction:column; justify-content:center; }
.grow { flex:1; }
.firma { font-family:'Dancing Script',cursive; font-size:54px;
  background:linear-gradient(180deg,#F8E2A6,#D9A441); -webkit-background-clip:text;
  background-clip:text; color:transparent; filter:drop-shadow(0 2px 10px rgba(0,0,0,0.8)); }
.rol { font-size:22px; letter-spacing:3px; color:#9FB2C8; text-transform:uppercase; margin-top:2px; }
`;

const FOOT = `<div style="width:470px;"><div class="firma">Ing. Andrés Acosta</div><div class="rol">IA &amp; Automatización</div></div>`;
const card = (ico, t, p) => `<div class="card"><div class="hex">${ico}</div><div><h3>${t}</h3><p>${p}</p></div></div>`;
const av = (k) => `<div class="avbox"><div class="aura"></div><div class="ring r1"></div><div class="ring r2"></div><img src="${TRIM[k] || AV[k]}"></div>`;
const cover = (n, o, pill, h1, sub, body) => `${NET}${av(o)}<div class="slide"><div class="countR">${n}/10</div>
<div class="col vcenter"><div class="pill">${pill}</div><div class="h1">${h1}</div><div class="sub">${sub}</div>
<p class="body mt" style="font-size:37px;">${body}</p></div>${FOOT}</div>`;
const stmt = (n, o, h1, bodies) => `${NET}${av(o)}<div class="slide"><div class="countR">${n}/10</div>
<div class="col vcenter"><div class="h1" style="font-size:66px;">${h1}</div>${bodies.map(b => `<p class="body mt">${b}</p>`).join('')}</div>${FOOT}</div>`;
const cards = (n, o, title, sub, cap, cs) => `${NET}${av(o)}<div class="slide"><div class="col">
<div class="countL">${n}/10</div><div class="tgold">${title}</div><div class="tsub">${sub}</div>
<div class="cap">${cap}</div>${cs.map(c => card(...c)).join('')}<div class="grow"></div>${FOOT}</div></div>`;

const DAYS = {
cc: { out: ['senala','abierto','tabletoca','teclea','palma','datoarriba','holo2','ojo','camina','pulgar'], S: () => [
cover('1','senala','Guía desde cero · Jul 2026','CLAUDE<br><span class="gold">CODE</span>','La IA que trabaja<br>en tu ordenador','Qué es, cómo se instala gratis y qué puede hacer por ti — <b>sin tecnicismos</b>.'),
stmt('2','abierto','NO ES UN CHAT.<br><span class="gold">ES UN ASISTENTE QUE HACE.</span>',['Un chat te responde y ahí acaba. Claude Code además <b>usa tu ordenador</b>: lee tus archivos, crea documentos y te entrega el trabajo hecho.','<span class="cyan">Eso es un "agente": una IA que da los pasos por sí sola hasta acabar la tarea.</span>']),
cards('3','tabletoca','QUÉ ES EXACTAMENTE','Un programa de Anthropic que se maneja desde la terminal: la ventana de órdenes del ordenador.','🧠 En 3 ideas',[
['💬','Le hablas normal','Escribes en español: <b>"ordena mis fotos por fecha"</b>. Sin saber programar.'],
['🤖','Él hace el trabajo','Lee tus archivos, <b>propone un plan</b>, lo ejecuta y te enseña el resultado.'],
['🧠','Cerebro: Opus 5','Memoria de <b>1 millón de tokens</b>: como leer un libro entero sin olvidar nada.']]),
cards('4','teclea','CÓMO SE INSTALA','De cero a funcionando en 5 minutos, en Windows, Mac o Linux.','🚀 3 pasos',[
['1️⃣','Instala Node.js','Gratis en nodejs.org. Instalación de <b>siguiente → siguiente → listo</b>.'],
['2️⃣','Copia un comando','En la terminal: <b>npm install -g @anthropic-ai/claude-code</b>.'],
['3️⃣','Escribe "claude"','Entra con tu <b>cuenta de Claude</b> (Pro o superior) y ya está.']]),
cards('5','palma','QUÉ HACE POR TI','No es solo para programadores: sirve si trabajas con archivos y documentos.','💡 Ejemplos reales',[
['📂','Ordena tu caos','Fotos, facturas y documentos <b>organizados en minutos</b> con tu criterio.'],
['📊','Informes','Lee tus documentos y crea <b>resúmenes y tablas</b> listos para enviar.'],
['🌐','Crea desde cero','Webs, hojas de cálculo, programas: <b>tú lo describes, él lo construye</b>.']]),
cards('6','datoarriba','MINI DICCIONARIO','Tres palabras que verás siempre, explicadas sin miedo a la jerga.','📖 Apréndetelas',[
['🧵','Contexto','La memoria de la sesión. Más contexto = <b>proyectos más grandes</b>.'],
['🤖','Agente','IA que <b>decide pasos y usa herramientas</b> hasta terminar el objetivo.'],
['🧩','Subagente','Ayudantes que crea para <b>repartirse el trabajo en paralelo</b>.']]),
cards('7','holo2','TRUCOS CLAVE','Tres funciones de julio 2026 que marcan la diferencia.','🆕 Nivel siguiente',[
['📄','CLAUDE.md','Tus reglas en un archivo de texto. Lo lee <b>siempre al empezar</b>.'],
['🎯','Skills','<b>Le enseñas tu método una vez</b> y lo aplica siempre igual.'],
['🔌','MCP','El "enchufe" con tus apps: Gmail, Slack… ahora <b>más seguro</b>.']]),
cards('8','ojo','ERRORES DE NOVATO','Los 3 fallos más comunes al empezar — evítalos desde el día uno.','❌ Que no te pasen',[
['🧨','Pedirlo todo de golpe','Mejor tareas <b>pequeñas y claras</b>, de una en una.'],
['👀','Aprobar sin leer','<b>Lee los cambios</b> antes de aceptar. Tú eres el jefe.'],
['💾','Trabajar sin red','Con copias de seguridad <b>vuelves atrás en segundos</b>.']]),
cards('9','camina','EMPIEZA HOY','Tres tareas fáciles y sin ningún riesgo para tu primer día.','✅ Prueba esto',[
['1️⃣','Pregunta','"¿Qué hay en esta carpeta?" — solo lee, <b>no cambia nada</b>.'],
['2️⃣','Organiza','"Ordena estos archivos" — hazlo en una <b>carpeta de prueba</b>.'],
['3️⃣','Crea','"Hazme una web sencilla sobre mí". <b>Verlo funcionar engancha</b>.']]),
stmt('10','pulgar','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> este carrusel para instalarlo con calma','💬 Comenta <b>"CODE"</b> y te mando la guía completa','➕ <b>Sígueme</b>: IA explicada en simple, cada semana','<span class="cyan">Mañana: agentes de IA — cómo tener el tuyo.</span>']),
]},
ag: { out: ['camina','abierto','datoarriba','palma','tabletoca','holo2','ojo','movil','teclea','pulgar'], S: () => [
cover('1','camina','Explicado desde cero','AGENTES<br><span class="gold">DE IA</span>','Qué son y cómo tener<br>el tuyo sin ser experto','La diferencia real entre un chatbot y un agente, <b>con ejemplos de la vida diaria</b>.'),
stmt('2','abierto','UN CHATBOT RESPONDE.<br><span class="gold">UN AGENTE TRABAJA.</span>',['Al chatbot le preguntas y te contesta. Al agente le das <b>un objetivo</b> y él solo da todos los pasos hasta entregártelo hecho.','<span class="cyan">Y en 2026 puedes tener uno sin escribir código.</span>']),
cards('3','datoarriba','CÓMO PIENSA','El ciclo que repite una y otra vez hasta terminar tu encargo.','🔁 4 pasos',[
['🎯','1. Objetivo','Le dices <b>qué conseguir</b>, no cómo hacerlo.'],
['🗺️','2. Plan','Divide el encargo en <b>pasos pequeños</b> él solo.'],
['🛠️','3. Herramientas','Lee archivos, <b>busca en internet</b>, escribe documentos.'],
['✅','4. Verificación','<b>Corrige su resultado</b> antes de entregártelo.']]),
cards('4','palma','3 FORMAS DE TENER UNO','Ordenadas de más fácil a más avanzada. Empieza por la primera.','🧭 Tu nivel',[
['🖥️','Ya montados','Claude Code o Cowork: <b>listos desde el día uno</b>, sin programar.'],
['🛠️','Agent SDK','El kit de Anthropic para <b>meter un agente en tu app</b>.'],
['☁️','Managed Agents','Anthropic aloja tu agente con <b>memoria y seguridad incluidas</b>.']]),
cards('5','tabletoca','LA MEMORIA','Un ayudante de verdad es el que <b>recuerda</b>.','💾 En simple',[
['🧠','Sin memoria','Cada chat empieza de cero y <b>le repites todo</b>. Agotador.'],
['📁','Con memoria','Guarda notas de lo que aprende y <b>las relee la próxima vez</b>.'],
['🤝','Compartida','Lo que aprende un agente <b>lo usan los demás</b> de tu equipo.']]),
cards('6','holo2','MCP: SUS MANOS','El estándar que conecta tu agente con tus aplicaciones.','🔌 El enchufe',[
['📬','Conecta tus apps','Gmail, Slack, Notion, calendario… el agente <b>las usa por ti</b>.'],
['🔐','Con permiso','Tú decides el acceso, con <b>inicio de sesión seguro</b> (jul 2026).'],
['♻️','Una vez, todos','Conectas una app y <b>todos tus agentes</b> pueden usarla.']]),
cards('7','ojo','SEGURIDAD PRIMERO','Los agentes son potentes. Tres reglas de oro evitan sustos.','🛡️ No las saltes',[
['✋','Apruebas lo delicado','Pagos, correos, borrar: que <b>siempre pregunte antes</b>.'],
['🧪','Prueba en pequeño','Primero con copias de prueba; cuando confíes, <b>lo real</b>.'],
['📊','Revisa entregas','Al principio revísalo todo: sabrás <b>qué delegarle</b>.']]),
cards('8','movil','IDEAS PARA EMPEZAR','Agentes útiles de verdad que puedes tener esta semana.','💡 Fáciles',[
['📥','Ordena tu correo','Clasifica tu bandeja y resume <b>solo lo importante</b>.'],
['🔎','El investigador','Te trae un <b>informe con fuentes</b> listo en 5 minutos.'],
['📅','El de la agenda','Cada tarde, el <b>resumen de tus reuniones de mañana</b>.']]),
cards('9','teclea','TU PRIMER AGENTE','El camino recomendado si empiezas totalmente de cero.','✅ 3 pasos',[
['1️⃣','Uno ya hecho','Claude Code o Cowork: <b>solo tienes que hablarle</b>.'],
['2️⃣','Una tarea que odies','Facturas, fotos, resúmenes: <b>la mejor primera prueba</b>.'],
['3️⃣','Ajusta y repite','Corrige sus instrucciones hasta que lo haga <b>como tú</b>.']]),
stmt('10','pulgar','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> este carrusel como tu hoja de ruta','💬 Comenta <b>"AGENTE"</b> y te mando la guía de inicio','➕ <b>Sígueme</b>: IA explicada en simple, cada semana','<span class="cyan">Construyo agentes a diario — esto es práctica real.</span>']),
]},
sk: { out: ['palma','ojo','tabletoca','holo2','movil','teclea','datoarriba','camina','senala','pulgar'], S: () => [
cover('1','palma','Explicado desde cero','SKILLS<br><span class="gold">DE CLAUDE</span>','Enséñale una vez,<br>lo hará siempre','Qué son, cómo crear la primera en 10 minutos y por qué <b>ahorran horas</b>.'),
stmt('2','ojo','¿REPITES EL MISMO<br><span class="gold">PROMPT CADA SEMANA?</span>',['Eso que copias y pegas puede guardarse como una <b>skill</b>: instrucciones que Claude usa por sí solo, justo cuando tocan.','<span class="cyan">Como una receta guardada: se cocina sola al pedir el plato.</span>']),
cards('3','tabletoca','QUÉ ES UNA SKILL','Una carpeta con una receta dentro. Así de fácil.','📁 3 piezas',[
['📄','Un archivo de texto','SKILL.md: tus instrucciones <b>como una receta</b>, pasos y reglas.'],
['🏷️','Nombre y descripción','La descripción le dice a Claude <b>cuándo debe usarla</b>.'],
['📎','Extras opcionales','Plantillas, ejemplos o programas <b>para que los use</b>.']]),
cards('4','holo2','SE ACTIVA SOLA','No tienes que acordarte de que existe. Esa es la gracia.','✨ Cómo decide',[
['🔎','Mira tu petición','Comprueba <b>si alguna skill encaja</b> con lo que pides.'],
['🎯','Si encaja, la usa','Sigue tus instrucciones <b>al pie de la letra</b>.'],
['🪶','Si no, no molesta','Dormida ocupa ~100 tokens: ten <b>decenas sin problema</b>.']]),
cards('5','movil','DÓNDE FUNCIONAN','Las creas una vez y te sirven en muchos sitios.','🌍 Portables',[
['👤','Para ti','Tu método te acompaña <b>en todos tus proyectos</b>.'],
['📦','Para tu equipo','En la carpeta del proyecto: <b>todos trabajan igual</b>.'],
['🔌','En otras apps','Estándar abierto en <b>más de 26 plataformas</b> (Cursor, VS Code…).']]),
cards('6','teclea','LA TUYA EN 10 MIN','El paso a paso completo. De verdad que no hay más.','🛠️ Manos a la obra',[
['1️⃣','Crea la carpeta','Con el nombre de tu skill: <b>informe-semanal</b>.'],
['2️⃣','Escribe SKILL.md','Nombre, descripción y <b>tus pasos</b>, como a un ayudante nuevo.'],
['3️⃣','Pruébala','Pide algo relacionado y verás cómo <b>la usa él solo</b>.']]),
cards('7','datoarriba','EL SECRETO','El 90% de las skills que "no funcionan" fallan en la descripción.','🎯 Escríbela así',[
['🗣️','Sé literal','"Úsala cuando pida el informe semanal". Claude <b>no adivina</b>.'],
['🚫','Di cuándo NO','"No para informes de clientes": evita que <b>salte de más</b>.'],
['🧪','Prueba y ajusta','¿No se activa? Reescríbela. <b>Dos intentos</b> y queda fina.']]),
cards('8','camina','AHORRAN HORAS','Skills reales que puedes copiar hoy mismo.','💡 Mi top 3',[
['📊','Tu informe tipo','Tu formato exacto de reporte: <b>siempre igual</b>.'],
['✍️','Tu estilo','Correos y publicaciones <b>sonando a ti</b>.'],
['🎨','Tu marca','Colores y plantillas: <b>así se hacen estos carruseles</b>.']]),
cards('9','senala','EMPIEZA HOY','De prompt repetido a skill guardada en media hora.','✅ 3 pasos',[
['1️⃣','El candidato','Lo que escribiste <b>más de dos veces</b> esta semana.'],
['2️⃣','Conviértela','Carpeta + SKILL.md con <b>descripción clara</b>.'],
['3️⃣','A prueba','5 peticiones: ¿se activa <b>solo cuando debe</b>? Lista.']]),
stmt('10','pulgar','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> este carrusel para crear tu primera skill','💬 Comenta <b>"SKILL"</b> y te mando mi plantilla','➕ <b>Sígueme</b>: IA explicada en simple, cada semana','<span class="cyan">Si lo has explicado dos veces, es una skill.</span>']),
]},
gpt: { out: ['senala','abierto','datoarriba','palma','camina','ojo','holo2','tabletoca','movil','pulgar'], S: () => [
cover('1','senala','Lanzado · 9 julio 2026','GPT-5.6','Sol · Terra · Luna<br>explicados fácil','Qué es cada versión, cuánto cuestan y <b>cuál te conviene a ti</b>.'),
stmt('2','abierto','YA NO HAY UN CHATGPT.<br><span class="gold">HAY TRES.</span>',['OpenAI lanzó GPT-5.6 en tres versiones. La idea: <b>no pagar el más caro</b> para tareas sencillas.','<span class="cyan">Sol = el listo · Terra = el equilibrado · Luna = el rápido.</span>']),
cards('3','datoarriba','SOL: EL CEREBRO','La versión más potente, para lo difícil de verdad.','🧠 Tope de gama',[
['🎓','Para qué','Análisis complejos y <b>proyectos largos</b> sin perderse.'],
['⚡','Modo Ultra','Piensa más: sube de 88,8% a <b>91,9%</b> en pruebas de código.'],
['💰','Precio API','$5 entrada / <b>$30 salida</b> por millón de tokens.']]),
cards('4','palma','TERRA: EQUILIBRIO','Para el día a día. La que usarás casi siempre.','⚖️ Calidad-precio',[
['💪','Rinde alto','Nivel del anterior tope de gama <b>a mitad de precio</b>.'],
['🏗️','Para qué','Escribir, resumir, correos: <b>el 80% de tu uso</b>.'],
['💰','Precio API','$2,50 entrada / <b>$15 salida</b> por millón de tokens.']]),
cards('5','camina','LUNA: EL VELOZ','Rápida y barata, para tareas simples en gran volumen.','🚀 Velocidad',[
['⏱️','Al instante','La más rápida: ideal cuando <b>la velocidad importa más</b>.'],
['🏷️','Para qué','Clasificar, extraer datos, <b>respuestas automáticas</b>.'],
['💰','Precio API','$1 entrada / <b>$6 salida</b> por millón de tokens.']]),
cards('6','ojo','¿CUÁL ELIJO?','Guía rápida según tu situación. Y puedes combinar.','🧭 Decisión fácil',[
['🙋','Si empiezas','Terra: <b>calidad alta sin pagar de más</b>.'],
['💼','Para tu trabajo','Terra a diario + <b>Sol para lo importante</b>.'],
['🏭','Si automatizas','Luna para el volumen y <b>Sol para lo crítico</b>.']]),
cards('7','holo2','NOVEDADES','Dos funciones nuevas explicadas en lenguaje humano.','🆕 Julio 2026',[
['🧑‍💻','Herramientas listas','Usa tus herramientas de golpe: <b>más rápido y barato</b>.'],
['🔒','Más seguro','Sus mini-programas corren <b>sin acceso a internet</b>.'],
['🤖','Equipos de IA','Coordina <b>varios GPT en paralelo</b>. Aún en beta.']]),
cards('8','tabletoca','¿Y FRENTE A CLAUDE?','La pregunta del millón, respondida con datos.','⚖️ La foto real',[
['🤝','Casi empate','SWE-bench: Claude Opus 5 <b>97,0%</b> vs Sol <b>96,2%</b>.'],
['🎯','Cada uno brilla','GPT más rápido en terminal; Claude <b>aguanta más proyecto</b>.'],
['💡','Mi consejo','Prueba ambos con tu caso real. <b>Muchos usamos los dos</b>.']]),
cards('9','movil','PRUÉBALO','Un plan de 3 días para descubrir tu versión.','✅ Sin gastar de más',[
['1️⃣','Haz tu lista','Las 5 tareas que <b>más repites</b> con la IA.'],
['2️⃣','Todas en Terra','¿Alguna se le atasca? <b>Súbela a Sol</b>.'],
['3️⃣','Detecta lo simple','Lo mecánico y masivo, <b>a Luna</b>.']]),
stmt('10','pulgar','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> esta guía para elegir bien','💬 Comenta <b>"GPT"</b> y te mando la comparativa completa','➕ <b>Sígueme</b>: IA explicada en simple, cada semana','<span class="cyan">Mañana: Claude Code vs Codex — ¿cuál te conviene?</span>']),
]},
vs: { out: ['abierto','senala','palma','tabletoca','datoarriba','movil','teclea','camina','ojo','pulgar'], S: () => [
cover('1','abierto','Comparativa honesta · Jul 2026','<span style="font-size:72px;">CLAUDE CODE<br><span class="gold">VS CODEX</span></span>','¿Cuál te conviene?<br>Explicado fácil','Los dos asistentes del momento, comparados <b>con datos y sin fanatismos</b>.'),
stmt('2','senala','LOS DOS SON BUENÍSIMOS.<br><span class="gold">EL ESTILO DECIDE.</span>',['Ambos <b>programan y automatizan por ti</b>, pero trabajan distinto — y eso decide cuál encaja contigo.','<span class="cyan">La comparación clara que me habría gustado leer a mí.</span>']),
cards('3','palma','QUIÉN ES QUIÉN','Las presentaciones básicas, por si llegas de nuevas.','👋 Contendientes',[
['🟣','Claude Code','De Anthropic: <b>lee, planifica, ejecuta y te enseña</b> cada cambio.'],
['🟢','Codex','De OpenAI: <b>incluido en los planes de ChatGPT</b>, hasta el gratis.'],
['🖥️','En común','Terminal y editor; <b>trabajan solos en segundo plano</b>.']]),
cards('4','tabletoca','DOS ESTILOS','La diferencia más importante no son los números: es la filosofía.','🧠 Filosofías',[
['🟣','Contigo al mando','Te enseña el plan y <b>tú apruebas cada paso</b>.'],
['🟢','Más independiente','Se lleva la tarea a su nube y <b>vuelve con el resultado</b>.'],
['🎯','La clave','¿Supervisar o <b>solo ver el final</b>? Eso ya elige por ti.']]),
cards('5','datoarriba','LAS PRUEBAS','Exámenes independientes de julio 2026, en cristiano.','📊 Datos',[
['🤝','Empate arriba','SWE-bench: Claude <b>97,0%</b> vs GPT-5.6 <b>96,2%</b>.'],
['🟢','Codex: rapidez','En terminal es más veloz; Ultra llega al <b>91,9%</b>.'],
['🟣','Claude: fondo','Lidera <b>9 de 12 pruebas</b>; hasta +14,6 pts en la más dura.']]),
cards('6','movil','PRECIOS EN SIMPLE','Cuánto cuesta cada uno de verdad, sin letra pequeña.','💰 Tu bolsillo',[
['🟢','Codex','<b>Incluido en tu plan de ChatGPT</b>, incluso el gratuito.'],
['🟣','Claude Code','Con el <b>plan Pro</b> o por uso: $5/$25 por millón de tokens.'],
['🧮','El coste real','Es <b>cuántas veces repites</b> hasta que quede bien.']]),
cards('7','teclea','ELIGE CLAUDE SI…','Estos tres perfiles le sacan más partido.','🟣 Su terreno',[
['🏗️','Proyectos grandes','1 millón de tokens: <b>proyectos enteros</b> sin perderse.'],
['🔍','Quieres control','Ver el plan y aprobar cada cambio da <b>tranquilidad</b>.'],
['🧩','Ecosistema','Skills + MCP + subagentes: <b>el kit más completo</b>.']]),
cards('8','camina','ELIGE CODEX SI…','Y estos tres perfiles encajan mejor con él.','🟢 Su terreno',[
['💳','Ya pagas ChatGPT','Está incluido: <b>coste extra cero</b> para empezar hoy.'],
['⚡','Tareas rápidas','Scripts y arreglos pequeños: <b>velocidad pura</b>.'],
['☁️','Prefieres delegar','Mandar la tarea y <b>recibirla hecha</b>.']]),
cards('9','ojo','MI VEREDICTO','Después de usar los dos a diario en proyectos reales.','⚖️ Sin fanatismos',[
['🤝','No hay un ganador','Hay un ganador <b>para tu caso</b>. Yo los combino.'],
['🧪','Tu propia prueba','La misma tarea en ambos; compara <b>correcciones</b>.'],
['🎯','Lo que importa','Explicar bien la tarea <b>vale para los dos</b>.']]),
stmt('10','pulgar','¿TE<br><span class="gold">SIRVIÓ?</span>',['📌 <b>Guarda</b> esta comparativa para decidir con calma','💬 Comenta <b>"VS"</b> y te mando la tabla completa','➕ <b>Sígueme</b>: IA explicada en simple, cada semana','<span class="cyan">Yo uso los dos a diario — esto es práctica real.</span>']),
]},
};

(async () => {
  const day = process.argv[2];
  if (!DAYS[day]) { console.error('día inválido:', day); process.exit(1); }
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await p.setContent('<!DOCTYPE html><html><body></body></html>');
  TRIM = await trimAll(p);
  let i = 0;
  for (const body of DAYS[day].S()) {
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
    console.log(day, n, JSON.stringify(m), m.loaded && m.textMaxRight <= m.imgLeft + 130 && m.maxBottom <= 1350 ? 'OK' : 'FAIL');
  }
  await b.close();
})();
