// Carrusel Cowork COMPLETO — identidad v2 con reglas de composición:
// el avatar tiene columna propia (derecha, 430px) y NADA lo tapa ni se monta.
// Rotación de outfits entre slides. Renderiza cw-s01.png ... cw-s10.png (1080x1350).
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

// Composición: texto/tarjetas SOLO en columna izquierda (max 560px desde padding 60);
// avatar SOLO en caja derecha de 430px (x >= 650). Nunca se tocan.
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
  font-size:76px; line-height:1.04; letter-spacing:1px;
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
  font-size:88px; line-height:1.05; text-shadow:0 4px 24px rgba(0,0,0,0.85); }
.gold { color:#F0B54A; } .cyan { color:#35C7E8; }
.sub { font-family:'Oswald',sans-serif; font-weight:600; text-transform:uppercase; color:#35C7E8;
  font-size:40px; letter-spacing:2px; margin-top:22px; line-height:1.18;
  text-shadow:0 3px 18px rgba(0,0,0,0.8); }
.pill { display:inline-block; padding:11px 24px; border:2px solid #E8A33D; border-radius:999px;
  color:#F0B54A; font-size:25px; font-weight:700; letter-spacing:2px; margin-bottom:30px;
  align-self:flex-start; text-transform:uppercase; }
p.body { font-size:33px; line-height:1.42; color:#E6EDF5;
  text-shadow:0 2px 12px rgba(0,0,0,0.7); }
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

const S = [
['01', `${NET}${av('traje')}
<div class="slide"><div class="countR">1/10</div>
<div class="col vcenter">
<div class="pill">Actualizado · Julio 2026</div>
<div class="h1">CLAUDE<br><span class="gold">COWORK</span></div>
<div class="sub">El "empleado digital"<br>de Anthropic</div>
<p class="body mt" style="font-size:36px;">Ya trabaja <b>mientras duermes</b> — cómo usarlo, <b>paso a paso</b>.</p>
</div>${FOOT}</div>`],
['02', `${NET}${av('gris')}
<div class="slide"><div class="countR">2/10</div>
<div class="col vcenter">
<div class="h1" style="font-size:74px;">NO ES UN CHAT.<br><span class="gold">ES UN EMPLEADO DIGITAL.</span></div>
<p class="body mt">Le das un objetivo, <b>planifica los pasos</b>, trabaja sobre tus archivos y entrega <b>el trabajo terminado</b>.</p>
<p class="body mt" style="color:#35C7E8;">El 33 % de las sesiones ya son procesos de negocio reales.</p>
</div>${FOOT}</div>`],
['03', `${NET}${av('tablet')}
<div class="slide"><div class="col">
<div class="countL">3/10</div>
<div class="tgold">DÓNDE ESTÁ</div>
<div class="tsub">Y qué necesitas para empezar <b>hoy mismo</b>.</div>
<div class="cap">⚡ Disponible desde el plan Pro</div>
${card('🖥️', 'Claude Desktop', 'Pestaña <b>Cowork</b> en Mac y Windows. ¿No la ves? <b>Actualiza la app</b>.')}
${card('🌐', 'Web y móvil', 'Lanzas la tarea en el PC y el resultado <b>te llega al teléfono</b>.')}
${card('🔐', 'Carpetas locales', 'Solo accesibles con la <b>app de escritorio abierta</b>.')}
<div class="grow"></div>${FOOT}</div></div>`],
['04', `${NET}${av('holo')}
<div class="slide"><div class="col">
<div class="countL">4/10</div>
<div class="tgold">PASO 1</div>
<div class="tsub"><b>Conecta una carpeta</b> — tú mandas sobre tus datos.</div>
<div class="cap">🔑 Permisos granulares</div>
${card('⭐', 'Solo lo que autorices', 'Claude <b>lee, edita y crea</b> únicamente dentro de esa carpeta.')}
${card('🎯', 'Úsalo para', 'Organizar y renombrar, <b>extraer datos de PDFs</b>, consolidar planillas.')}
${card('💡', 'Tip', 'Empieza con una <b>carpeta de prueba</b> con copias; conecta las reales después.')}
<div class="grow"></div>${FOOT}</div></div>`],
['05', `${NET}${av('chaleco')}
<div class="slide"><div class="col">
<div class="countL">5/10</div>
<div class="tgold">PASO 2</div>
<div class="tsub"><b>Describe la tarea</b> como a un empleado en su primer día.</div>
<div class="cap">🧩 Contexto + resultado + formato</div>
${card('📝', 'La fórmula', 'Contexto + resultado esperado + formato + <b>criterio de "terminado"</b>.')}
${card('✅', 'Ejemplo real', '"Extrae <b>importe, fecha y proveedor</b> de estas 30 facturas PDF y genera <b>facturas-julio.xlsx</b> con totales por mes."')}
${card('❌', 'Error típico', 'Prompts de una línea: <b>"organiza esto"</b>. Sé específico.')}
<div class="grow"></div>${FOOT}</div></div>`],
['06', `${NET}${av('camel')}
<div class="slide"><div class="col">
<div class="countL">6/10</div>
<div class="tgold">PASO 3</div>
<div class="tsub"><b>Déjalo trabajar</b> — supervisa sin micro-gestionar.</div>
<div class="cap">👁 Supervisión inteligente</div>
${card('🗺️', 'Plan visible', 'Te enseña su plan y avanza solo, <b>paso a paso</b>.')}
${card('🛡️', 'Pasos sensibles', 'Pide tu <b>aprobación</b> antes de borrar, sobrescribir o enviar.')}
${card('🔁', 'Itera', 'Valida el resultado final y dale feedback: <b>corrige como un junior</b>.')}
<div class="grow"></div>${FOOT}</div></div>`],
['07', `${NET}${av('bomber')}
<div class="slide"><div class="col">
<div class="countL">7/10</div>
<div class="tgold">PASO 4</div>
<div class="tsub"><b>Prográmalo</b>: "Cada lunes a las 8:00, el informe semanal."</div>
<div class="cap">🔄 Tareas recurrentes</div>
${card('☁️', 'En remoto', 'Se ejecuta <b>aunque tu equipo esté apagado</b>.')}
${card('🔌', 'Con tus conectores', 'Usa conectores y archivos de tu cuenta (no carpetas locales).')}
${card('📅', 'Dónde', 'Menú <b>"Scheduled"</b> → New task → <b>"Create with Claude"</b>.')}
<div class="grow"></div>${FOOT}</div></div>`],
['08', `${NET}${av('brazos')}
<div class="slide"><div class="col">
<div class="countL">8/10</div>
<div class="tgold">PASO 5</div>
<div class="tsub"><b>Escálalo</b> — de tareas sueltas a procesos que corren solos.</div>
<div class="cap">🚀 Nivel pro</div>
${card('📁', 'Reglas por carpeta', 'Instrucciones persistentes, <b>un system prompt por proyecto</b>.')}
${card('🗂️', 'Proyectos', 'Agrupa tareas relacionadas con su propio contexto.')}
${card('🧩', 'Plugins por rol', 'Marketing, finanzas, legal… <b>flujos ya montados</b>.')}
${card('🖱️', 'Dispatch', '<b>Computer use</b>: usa el ordenador por ti cuando hace falta.')}
<div class="grow"></div>${FOOT}</div></div>`],
['09', `${NET}${av('gris')}
<div class="slide"><div class="col">
<div class="countL">9/10</div>
<div class="tgold">EMPIEZA HOY</div>
<div class="tsub">Delega primero lo <b>aburrido, repetitivo y reversible</b>.</div>
<div class="cap">✅ 3 tareas de bajo riesgo</div>
${card('1️⃣', 'Ordena Descargas', 'Clasifica por tipo y fecha, renombra <b>con criterio</b>.')}
${card('2️⃣', 'PDFs → Excel', 'Extrae campos de facturas a una <b>planilla limpia con totales</b>.')}
${card('3️⃣', 'Informe semanal', 'Resumen recurrente <b>cada lunes a primera hora</b>.')}
<div class="grow"></div>${FOOT}</div></div>`],
['10', `${NET}${av('traje')}
<div class="slide"><div class="countR">10/10</div>
<div class="col vcenter">
<div class="h1" style="font-size:80px;">¿TE<br><span class="gold">SIRVIÓ?</span></div>
<p class="body mt">📌 <b>Guarda</b> este carrusel</p>
<p class="body mt">💬 Comenta <b>"COWORK"</b> y te mando la guía</p>
<p class="body mt">➕ <b>Sígueme</b>: IA verificada, cada semana</p>
<p class="body mt" style="color:#35C7E8;">LLMs · agentes · imagen · video · automatización — sin humo.</p>
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
    // Verificación de reglas: avatar presente y ningún texto/tarjeta lo invade.
    const m = await p.evaluate(() => {
      const img = document.querySelector('.avbox img');
      const ir = img.getBoundingClientRect();
      let maxRight = 0, worst = '';
      document.querySelectorAll('.slide .col, .slide .col *, .slide > div[style]').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        if (r.bottom > ir.top && r.right > maxRight) { maxRight = r.right; worst = (el.className || el.tagName).toString().slice(0, 20); }
      });
      return { loaded: img.naturalWidth > 0, imgLeft: Math.round(ir.left), imgTop: Math.round(ir.top),
               imgRight: Math.round(ir.right), imgBottom: Math.round(ir.bottom),
               textMaxRight: Math.round(maxRight), worst };
    });
    const pass = m.loaded && m.textMaxRight <= m.imgLeft;
    await p.screenshot({ path: `cw-s${n}.png` });
    console.log(n, JSON.stringify(m), pass ? 'OK' : 'FAIL');
  }
  await b.close();
})();
