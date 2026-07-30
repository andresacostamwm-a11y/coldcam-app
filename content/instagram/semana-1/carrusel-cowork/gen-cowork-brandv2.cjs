// Carrusel Cowork COMPLETO en identidad v2 (estilo feed): statement + tarjetas doradas.
// Renderiza cw-s01.png ... cw-s10.png (1080x1350).
const { chromium } = require('playwright');

const AV = {
  traje: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_132555_da4bd314-20e9-4e68-85b7-81a700896ad4.png',
  brazos: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_132546_361b9f71-61de-4e37-9583-913e351d08dd.png',
  tablet: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_133216_204965fe-64a2-4095-b99f-5ee698a0a6d1.png',
  holo: 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_133226_167a439b-03f6-4c91-aba6-30a35bf4c22a.png',
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
.avatar { position:absolute; right:-40px; bottom:0; z-index:1;
  filter:drop-shadow(-16px 0 55px rgba(0,0,0,0.8)); }
.slide { position:absolute; inset:0; padding:64px 64px 56px; display:flex; flex-direction:column; z-index:2; }
.countL { display:inline-block; border:2px solid #C9932F; border-radius:14px; padding:8px 22px;
  font-family:'Oswald',sans-serif; font-size:30px; font-weight:600; color:#F0D9A6;
  align-self:flex-start; margin-bottom:26px; }
.countR { position:absolute; top:48px; right:52px; background:rgba(10,14,24,0.8);
  border-radius:999px; padding:12px 28px; font-size:30px; font-weight:700; color:#EAF2FA; z-index:3; }
.tgold { font-family:'Oswald',sans-serif; font-weight:700; text-transform:uppercase;
  font-size:88px; line-height:1.02; letter-spacing:1px;
  background:linear-gradient(180deg,#F8E2A6 8%,#E9B95B 55%,#C08A2E 100%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  filter:drop-shadow(0 4px 18px rgba(0,0,0,0.85)); }
.tsub { font-size:36px; color:#E9EFF6; margin-top:12px; line-height:1.3; max-width:600px;
  text-shadow:0 2px 12px rgba(0,0,0,0.7); }
.cap { display:inline-flex; align-items:center; gap:12px; border:2px solid #E8A33D; border-radius:12px;
  padding:12px 24px; margin:26px 0 30px; font-family:'Oswald',sans-serif; font-size:29px; font-weight:600;
  letter-spacing:2px; text-transform:uppercase; color:#F0B54A; align-self:flex-start;
  background:rgba(232,163,61,0.07); }
.card { display:flex; align-items:flex-start; gap:20px; border:2px solid rgba(232,163,61,0.6);
  border-radius:18px; background:rgba(10,16,28,0.72); padding:20px 24px; margin-bottom:16px;
  max-width:640px; position:relative; z-index:2; }
.hex { min-width:66px; height:66px; display:flex; align-items:center; justify-content:center;
  font-size:30px; color:#F0B54A; border:2px solid #C9932F; border-radius:14px;
  background:rgba(232,163,61,0.09); }
.card h3 { font-family:'Oswald',sans-serif; font-size:29px; font-weight:600; color:#F0B54A;
  letter-spacing:1px; margin-bottom:6px; text-transform:uppercase; }
.card p { font-size:26px; line-height:1.38; color:#E7EDF4; }
.card p b { color:#fff; }
.h1 { font-family:'Oswald',sans-serif; font-weight:700; text-transform:uppercase;
  font-size:102px; line-height:1.04; text-shadow:0 4px 24px rgba(0,0,0,0.85); }
.gold { color:#F0B54A; } .cyan { color:#35C7E8; }
.sub { font-family:'Oswald',sans-serif; font-weight:600; text-transform:uppercase; color:#35C7E8;
  font-size:44px; letter-spacing:2px; margin-top:24px; line-height:1.16;
  text-shadow:0 3px 18px rgba(0,0,0,0.8); }
.pill { display:inline-block; padding:12px 26px; border:2px solid #E8A33D; border-radius:999px;
  color:#F0B54A; font-size:26px; font-weight:700; letter-spacing:2px; margin-bottom:34px;
  align-self:flex-start; text-transform:uppercase; }
p.body { font-size:36px; line-height:1.45; color:#E6EDF5; max-width:560px;
  text-shadow:0 2px 12px rgba(0,0,0,0.7); }
p.body b { color:#F0B54A; }
.mt { margin-top:20px; }
.center { flex:1; display:flex; flex-direction:column; justify-content:center; position:relative; z-index:2; }
.grow { flex:1; }
.firma { font-family:'Dancing Script',cursive; font-size:54px;
  background:linear-gradient(180deg,#F8E2A6,#D9A441); -webkit-background-clip:text;
  background-clip:text; color:transparent; filter:drop-shadow(0 2px 10px rgba(0,0,0,0.8));
  position:relative; z-index:3; }
.rol { font-size:22px; letter-spacing:3px; color:#9FB2C8; text-transform:uppercase; margin-top:2px; }
`;

const FOOT = `<div><div class="firma">Ing. Andrés Acosta</div><div class="rol">IA &amp; Automatización</div></div>`;
const card = (ico, t, p) => `<div class="card"><div class="hex">${ico}</div><div><h3>${t}</h3><p>${p}</p></div></div>`;

const S = [
['01', `${NET}<img class="avatar" style="height:1010px;" src="${AV.traje}">
<div class="slide"><div class="countR">1/10</div>
<div class="center">
<div class="pill">Actualizado · Julio 2026</div>
<div class="h1">CLAUDE<br><span class="gold">COWORK</span></div>
<div class="sub">El "empleado digital"<br>de Anthropic</div>
<p class="body mt" style="font-size:40px; max-width:520px;">Ya trabaja <b>mientras duermes</b> — cómo usarlo, <b>paso a paso</b>.</p>
</div>${FOOT}</div>`],
['02', `${NET}<img class="avatar" style="height:960px; right:-20px;" src="${AV.brazos}">
<div class="slide"><div class="countR">2/10</div>
<div class="center">
<div class="h1" style="font-size:84px;">NO ES<br>UN CHAT.<br><span class="gold">ES UN<br>EMPLEADO<br>DIGITAL.</span></div>
<p class="body mt" style="max-width:520px;">Le das un objetivo, <b>planifica los pasos</b>, trabaja sobre tus archivos y entrega <b>el trabajo terminado</b>.</p>
<p class="body mt" style="color:#35C7E8; max-width:500px;">El 33 % de las sesiones ya son procesos de negocio reales.</p>
</div>${FOOT}</div>`],
['03', `${NET}<img class="avatar" style="height:900px;" src="${AV.tablet}">
<div class="slide"><div class="countL">3/10</div>
<div class="tgold">DÓNDE ESTÁ</div>
<div class="tsub">Y qué necesitas para empezar hoy mismo.</div>
<div class="cap">⚡ Disponible desde el plan Pro</div>
${card('🖥️', 'Claude Desktop', 'Pestaña <b>Cowork</b> en Mac y Windows. ¿No la ves? <b>Actualiza la app</b>.')}
${card('🌐', 'Web y móvil', 'Lanzas la tarea en el PC y el resultado <b>te llega al teléfono</b>.')}
${card('🔐', 'Carpetas locales', 'Solo accesibles con la <b>app de escritorio abierta</b>.')}
<div class="grow"></div>${FOOT}</div>`],
['04', `${NET}<img class="avatar" style="height:900px;" src="${AV.holo}">
<div class="slide"><div class="countL">4/10</div>
<div class="tgold">PASO 1</div>
<div class="tsub"><b>Conecta una carpeta</b> — tú mandas sobre tus datos.</div>
<div class="cap">🔑 Permisos granulares</div>
${card('⭐', 'Solo lo que autorices', 'Claude <b>lee, edita y crea</b> únicamente dentro de esa carpeta.')}
${card('🎯', 'Úsalo para', 'Organizar y renombrar, <b>extraer datos de PDFs</b>, consolidar planillas.')}
${card('💡', 'Tip', 'Empieza con una <b>carpeta de prueba</b> con copias; conecta las reales después.')}
<div class="grow"></div>${FOOT}</div>`],
['05', `${NET}<img class="avatar" style="height:900px;" src="${AV.tablet}">
<div class="slide"><div class="countL">5/10</div>
<div class="tgold">PASO 2</div>
<div class="tsub"><b>Describe la tarea</b> como a un empleado en su primer día.</div>
<div class="cap">🧩 Contexto + resultado + formato</div>
${card('📝', 'La fórmula', 'Contexto + resultado esperado + formato + <b>criterio de "terminado"</b>.')}
${card('✅', 'Ejemplo real', '"Extrae <b>importe, fecha y proveedor</b> de estas 30 facturas PDF y genera <b>facturas-julio.xlsx</b> con totales por mes."')}
${card('❌', 'Error típico', 'Prompts de una línea: <b>"organiza esto"</b>. Sé específico.')}
<div class="grow"></div>${FOOT}</div>`],
['06', `${NET}<img class="avatar" style="height:900px; right:-20px;" src="${AV.brazos}">
<div class="slide"><div class="countL">6/10</div>
<div class="tgold">PASO 3</div>
<div class="tsub"><b>Déjalo trabajar</b> — supervisa sin micro-gestionar.</div>
<div class="cap">👁 Supervisión inteligente</div>
${card('🗺️', 'Plan visible', 'Te enseña su plan y avanza solo, <b>paso a paso</b>.')}
${card('🛡️', 'Pasos sensibles', 'Pide tu <b>aprobación</b> antes de borrar, sobrescribir o enviar.')}
${card('🔁', 'Itera', 'Valida el resultado final y dale feedback: <b>corrige como un junior</b>.')}
<div class="grow"></div>${FOOT}</div>`],
['07', `${NET}<img class="avatar" style="height:900px;" src="${AV.holo}">
<div class="slide"><div class="countL">7/10</div>
<div class="tgold">PASO 4</div>
<div class="tsub"><b>Prográmalo</b>: "Cada lunes a las 8:00, el informe semanal."</div>
<div class="cap">🔄 Tareas recurrentes</div>
${card('☁️', 'En remoto', 'Se ejecuta <b>aunque tu equipo esté apagado</b>.')}
${card('🔌', 'Con tus conectores', 'Usa conectores y archivos de tu cuenta (no carpetas locales).')}
${card('📅', 'Dónde', 'Menú <b>"Scheduled"</b> → New task → <b>"Create with Claude"</b>.')}
<div class="grow"></div>${FOOT}</div>`],
['08', `${NET}<img class="avatar" style="height:900px;" src="${AV.tablet}">
<div class="slide"><div class="countL">8/10</div>
<div class="tgold">PASO 5</div>
<div class="tsub"><b>Escálalo</b> — de tareas sueltas a procesos que corren solos.</div>
<div class="cap">🚀 Nivel pro</div>
${card('📁', 'Reglas por carpeta', 'Instrucciones persistentes, <b>un system prompt por proyecto</b>.')}
${card('🗂️', 'Proyectos', 'Agrupa tareas relacionadas con su propio contexto.')}
${card('🧩', 'Plugins por rol', 'Marketing, finanzas, legal… <b>flujos ya montados</b>.')}
${card('🖱️', 'Dispatch', '<b>Computer use</b>: usa el ordenador por ti cuando hace falta.')}
<div class="grow"></div>${FOOT}</div>`],
['09', `${NET}<img class="avatar" style="height:900px; right:-20px;" src="${AV.brazos}">
<div class="slide"><div class="countL">9/10</div>
<div class="tgold">EMPIEZA HOY</div>
<div class="tsub">Delega primero lo <b>aburrido, repetitivo y reversible</b>.</div>
<div class="cap">✅ 3 tareas de bajo riesgo</div>
${card('1️⃣', 'Ordena Descargas', 'Clasifica por tipo y fecha, renombra <b>con criterio</b>.')}
${card('2️⃣', 'PDFs → Excel', 'Extrae campos de facturas a una <b>planilla limpia con totales</b>.')}
${card('3️⃣', 'Informe semanal', 'Resumen recurrente <b>cada lunes a primera hora</b>.')}
<div class="grow"></div>${FOOT}</div>`],
['10', `${NET}<img class="avatar" style="height:1010px;" src="${AV.traje}">
<div class="slide"><div class="countR">10/10</div>
<div class="center">
<div class="h1" style="font-size:88px;">¿TE<br><span class="gold">SIRVIÓ?</span></div>
<p class="body mt">📌 <b>Guarda</b> este carrusel</p>
<p class="body mt">💬 Comenta <b>"COWORK"</b> y te mando la guía</p>
<p class="body mt">➕ <b>Sígueme</b>: IA verificada, cada semana</p>
<p class="body mt" style="color:#35C7E8; max-width:500px;">LLMs · agentes · imagen · video · automatización — sin humo.</p>
</div>${FOOT}</div>`],
];

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const [n, body] of S) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Roboto:wght@400;500;700&family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>${body}</body></html>`;
    await p.setContent(html, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `cw-s${n}.png` });
    console.log('ok', n);
  }
  await b.close();
})();
