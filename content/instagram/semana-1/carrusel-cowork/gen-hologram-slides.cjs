// Renderiza las slides 2-10 del carrusel Cowork con el fondo holográfico unificado.
const { chromium } = require('playwright');

const BG = 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_102845_03fb17c7-6c99-4409-8a36-31d54486294e.png';

const CSS = `
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:1080px; height:1350px; }
body { font-family:'Montserrat',sans-serif; position:relative; overflow:hidden; color:#fff;
  background-image:url('${BG}'); background-size:cover; background-position:center; }
.scrim { position:absolute; inset:0; background:rgba(4,8,18,0.84); }
.scrim2 { position:absolute; inset:0;
  background: radial-gradient(circle at 75% 40%, rgba(34,211,238,0.10) 0%, transparent 55%); }
.slide { position:absolute; inset:0; padding:90px 84px; display:flex; flex-direction:column; }
.topbar { display:flex; justify-content:space-between; font-size:26px; letter-spacing:3px;
  text-transform:uppercase; color:#CFE9F5; font-weight:700; }
.topbar .tag { color:#22D3EE; }
.center { flex:1; display:flex; flex-direction:column; justify-content:center; }
.badge { display:inline-flex; align-items:center; justify-content:center; width:104px; height:104px;
  border-radius:26px; background:linear-gradient(135deg,#E4C87A,#22D3EE); color:#0A1428;
  font-size:52px; font-weight:800; margin-bottom:40px; align-self:flex-start; }
.kicker { color:#22D3EE; font-size:31px; font-weight:700; letter-spacing:2px;
  text-transform:uppercase; margin-bottom:24px; }
h2 { font-family:'Playfair Display',serif; font-size:76px; line-height:1.12; font-weight:800;
  margin-bottom:34px; text-shadow:0 3px 22px rgba(0,0,0,0.7); }
h2 .ac { color:#E4C87A; } h2 .ac2 { color:#22D3EE; }
.h1big { font-family:'Playfair Display',serif; font-size:150px; font-weight:800; color:#E4C87A;
  line-height:1; text-shadow:0 3px 22px rgba(0,0,0,0.7); }
p.body { font-size:43px; line-height:1.42; color:#DEE6F0; text-shadow:0 2px 12px rgba(0,0,0,0.6); }
p.body b { color:#fff; }
.mt { margin-top:34px; }
ul.list { list-style:none; margin-top:14px; }
ul.list li { font-size:41px; line-height:1.4; color:#DEE6F0; margin-bottom:26px; padding-left:54px;
  position:relative; text-shadow:0 2px 12px rgba(0,0,0,0.6); }
ul.list li b { color:#fff; }
ul.list li:before { content:"\\2192"; position:absolute; left:0; color:#22D3EE; font-weight:800; }
.bq { font-family:'Playfair Display',serif; font-size:58px; line-height:1.3; font-weight:800;
  text-shadow:0 3px 22px rgba(0,0,0,0.7); }
.div { width:140px; height:8px; border-radius:4px; background:linear-gradient(90deg,#E4C87A,#22D3EE);
  margin:38px 0; }
.footer { display:flex; justify-content:space-between; align-items:center; color:#CFD8E3;
  font-size:26px; letter-spacing:2px; }
.firma { font-family:'Dancing Script',cursive; font-size:54px; color:#fff;
  text-shadow:0 2px 14px rgba(0,0,0,0.8); }
`;

const FOOT = '<div class="footer"><span class="firma">Ing. Andrés Acosta</span><span>IA &amp; AUTOMATIZACIÓN</span></div>';

const S = [
['02', `<div class="center"><div class="kicker">¿Qué es?</div>
<h2>No es un chat.<br>Es un <span class="ac">empleado digital</span>.</h2>
<p class="body">Le das una tarea, <b>lee tus archivos</b>, la ejecuta completa y te entrega <b>el trabajo terminado</b>.</p>
<p class="body mt">Tú defines el objetivo. Él hace el proceso.</p></div>`],
['03', `<div class="center"><div class="kicker">Dónde está</div>
<h2>La pestaña <span class="ac2">Cowork</span> de Claude Desktop</h2>
<ul class="list"><li>Mac y <b>Windows</b> — y ya también en <b>web y móvil</b></li>
<li>Disponible en <b>todos los planes de pago</b>, desde Pro</li>
<li>Si no la ves: <b>actualiza</b> la app</li></ul></div>`],
['04', `<div class="center"><div class="badge">1</div><div class="kicker">Paso 1</div>
<h2>Conecta <span class="ac">una carpeta</span></h2>
<p class="body">Tú eliges qué carpeta puede tocar: Claude solo <b>lee, edita y crea archivos</b> dentro de lo que autorices.</p>
<p class="body mt">Tip: empieza con una <b>carpeta de prueba</b>.</p></div>`],
['05', `<div class="center"><div class="badge">2</div><div class="kicker">Paso 2</div>
<h2>Describe la tarea <span class="ac">como a un empleado</span></h2>
<p class="body">"Extrae importe, fecha y proveedor de estas 30 facturas PDF y móntame un <b>Excel con totales por mes</b>."</p>
<p class="body mt"><b>Contexto + resultado esperado + formato</b> = oro.</p></div>`],
['06', `<div class="center"><div class="badge">3</div><div class="kicker">Paso 3</div>
<h2>Déjalo trabajar <span class="ac">(y revisa)</span></h2>
<p class="body">Te enseña su <b>plan</b>, avanza solo y te pide <b>aprobación</b> en los pasos sensibles.</p>
<p class="body mt">No micro-gestiones: <b>valida el resultado final</b>.</p></div>`],
['07', `<div class="center"><div class="badge">4</div><div class="kicker">Paso 4</div>
<h2>Prográmalo: tareas <span class="ac">recurrentes</span></h2>
<p class="body">"Cada lunes a las 8:00, genera el informe semanal."</p>
<p class="body mt">Se ejecuta <b>en remoto</b>, incluso con tu equipo apagado — usa tus <b>conectores</b> y los archivos de tu cuenta.</p></div>`],
['08', `<div class="center"><div class="badge">5</div><div class="kicker">Paso 5</div>
<h2>Escálalo: <span class="ac">reglas, plugins y Dispatch</span></h2>
<ul class="list"><li><b>Instrucciones por carpeta</b>: reglas persistentes, tipo system prompt</li>
<li><b>Plugins por rol</b>: marketing, finanzas, legal…</li>
<li><b>Dispatch</b>: computer use cuando la tarea lo exige</li></ul></div>`],
['09', `<div class="center"><div class="kicker">Para empezar hoy</div>
<h2>3 tareas de <span class="ac">bajo riesgo</span></h2>
<ul class="list" style="margin-top:10px;"><li>Ordenar tu carpeta de <b>Descargas</b></li>
<li>Extraer datos de <b>PDFs a un Excel</b></li>
<li>Informe semanal <b>automático</b></li></ul>
<div class="div"></div>
<p class="body">Regla: delega primero lo <b>aburrido y repetitivo</b>.</p></div>`],
['10', `<div class="center"><h2>¿Te sirvió?</h2>
<ul class="list" style="margin-top:16px;"><li>📌 <b>Guarda</b> este carrusel</li>
<li>💬 Comenta <b>"COWORK"</b> y te mando la guía de primeros pasos</li>
<li>➕ <b>Sígueme</b>: lo más nuevo de IA, siempre verificado</li></ul>
<div class="div"></div>
<p class="body">Cada semana: LLMs, agentes, imagen, video y automatización — <b>sin humo</b>.</p></div>`],
];

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const [n, body] of S) {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@800&family=Dancing+Script:wght@700&family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body><div class="scrim"></div><div class="scrim2"></div>
<div class="slide"><div class="topbar"><span class="tag">IA · SIN HUMO</span><span>${n} / 10</span></div>
${body}${FOOT}</div></body></html>`;
    await p.setContent(html, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `cw-s${n}.png` });
    console.log('ok', n);
  }
  await b.close();
})();
