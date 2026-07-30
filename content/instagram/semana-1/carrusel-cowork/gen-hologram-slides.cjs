// Renderiza las slides 2-10 del carrusel Cowork (versión detallada) con el fondo holográfico unificado.
const { chromium } = require('playwright');

const BG = 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_102845_03fb17c7-6c99-4409-8a36-31d54486294e.png';

const CSS = `
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:1080px; height:1350px; }
body { font-family:'Montserrat',sans-serif; position:relative; overflow:hidden; color:#fff;
  background-image:url('${BG}'); background-size:cover; background-position:center; }
.scrim { position:absolute; inset:0; background:rgba(4,8,18,0.86); }
.scrim2 { position:absolute; inset:0;
  background: radial-gradient(circle at 75% 40%, rgba(34,211,238,0.10) 0%, transparent 55%); }
.slide { position:absolute; inset:0; padding:76px 78px 70px; display:flex; flex-direction:column; }
.topbar { display:flex; justify-content:space-between; font-size:25px; letter-spacing:3px;
  text-transform:uppercase; color:#CFE9F5; font-weight:700; }
.topbar .tag { color:#22D3EE; }
.center { flex:1; display:flex; flex-direction:column; justify-content:center; }
.badge { display:inline-flex; align-items:center; justify-content:center; width:86px; height:86px;
  border-radius:22px; background:linear-gradient(135deg,#E4C87A,#22D3EE); color:#0A1428;
  font-size:44px; font-weight:800; margin-bottom:26px; align-self:flex-start; }
.kicker { color:#22D3EE; font-size:28px; font-weight:700; letter-spacing:2px;
  text-transform:uppercase; margin-bottom:16px; }
h2 { font-family:'Playfair Display',serif; font-size:60px; line-height:1.12; font-weight:800;
  margin-bottom:26px; text-shadow:0 3px 22px rgba(0,0,0,0.7); }
h2 .ac { color:#E4C87A; } h2 .ac2 { color:#22D3EE; }
p.body { font-size:34px; line-height:1.42; color:#DEE6F0; text-shadow:0 2px 12px rgba(0,0,0,0.6); }
p.body b { color:#fff; }
.mt { margin-top:22px; }
ul.list { list-style:none; margin-top:8px; }
ul.list li { font-size:33px; line-height:1.38; color:#DEE6F0; margin-bottom:16px; padding-left:46px;
  position:relative; text-shadow:0 2px 12px rgba(0,0,0,0.6); }
ul.list li b { color:#fff; }
ul.list li:before { content:"\\2192"; position:absolute; left:0; color:#22D3EE; font-weight:800; }
.ex { border-left:8px solid #E4C87A; background:rgba(255,255,255,0.07); border-radius:0 16px 16px 0;
  padding:24px 28px; margin:22px 0; font-size:31px; line-height:1.42; color:#F2E9D6;
  font-style:italic; text-shadow:0 2px 10px rgba(0,0,0,0.6); }
.ex b { color:#fff; font-style:normal; }
.note { font-size:29px; line-height:1.4; color:#E4C87A; font-weight:700; margin-top:20px;
  text-shadow:0 2px 10px rgba(0,0,0,0.6); }
.note .nlab { color:#22D3EE; text-transform:uppercase; letter-spacing:2px; font-size:26px; }
.div { width:120px; height:7px; border-radius:4px; background:linear-gradient(90deg,#E4C87A,#22D3EE);
  margin:24px 0; }
.footer { display:flex; justify-content:space-between; align-items:center; color:#CFD8E3;
  font-size:25px; letter-spacing:2px; }
.firma { font-family:'Dancing Script',cursive; font-size:50px; color:#fff;
  text-shadow:0 2px 14px rgba(0,0,0,0.8); }
`;

const FOOT = '<div class="footer"><span class="firma">Ing. Andrés Acosta</span><span>IA &amp; AUTOMATIZACIÓN</span></div>';

const S = [
['02', `<div class="center"><div class="kicker">¿Qué es exactamente?</div>
<h2>No es un chat.<br>Es un <span class="ac">empleado digital</span>.</h2>
<p class="body">Lanzado en <b>enero 2026</b> como la 3ª pestaña de Claude Desktop: le das un objetivo, <b>planifica los pasos</b>, lee y edita tus archivos y te entrega <b>el trabajo terminado</b>.</p>
<ul class="list" style="margin-top:20px;"><li>Un chat te dice <b>cómo</b> hacerlo</li>
<li>Cowork <b>lo hace por ti</b>, de principio a fin</li>
<li>Tú defines el <b>"qué"</b>; él ejecuta el <b>"cómo"</b></li></ul>
<div class="note"><span class="nlab">Dato real</span> · El 33 % de las sesiones ya son procesos de negocio: informes, onboarding, conciliaciones.</div></div>`],
['03', `<div class="center"><div class="kicker">Dónde está y qué necesitas</div>
<h2>La pestaña <span class="ac2">Cowork</span> de Claude Desktop</h2>
<ul class="list"><li><b>Mac y Windows</b> — pestaña Cowork (si no la ves, actualiza la app)</li>
<li>Ya también en <b>web y móvil</b>: lanzas la tarea desde el PC y el resultado te llega al teléfono</li>
<li>La sesión remota alcanza tus carpetas locales solo con la <b>app de escritorio abierta</b></li>
<li>Disponible en <b>todos los planes de pago</b>: Pro, Max, Team y Enterprise</li></ul>
<div class="note"><span class="nlab">Clave</span> · No necesitas plan Max: desde Pro ya lo tienes incluido.</div></div>`],
['04', `<div class="center"><div class="badge">1</div><div class="kicker">Paso 1</div>
<h2>Conecta <span class="ac">una carpeta</span></h2>
<p class="body">Tú decides qué carpeta puede tocar: Claude solo <b>lee, edita y crea archivos</b> dentro de lo que autorices — permisos granulares, nada más.</p>
<ul class="list" style="margin-top:18px;"><li>Organiza y <b>renombra</b> archivos con criterio</li>
<li><b>Extrae datos</b> de PDFs, imágenes y escaneos</li>
<li><b>Consolida</b> planillas dispersas y redacta docs</li></ul>
<div class="note"><span class="nlab">Tip</span> · Empieza con una carpeta de prueba con copias; conecta las reales cuando valides resultados.</div></div>`],
['05', `<div class="center"><div class="badge">2</div><div class="kicker">Paso 2</div>
<h2>Describe la tarea <span class="ac">como a un empleado</span></h2>
<p class="body">La fórmula: <b>contexto + resultado esperado + formato + criterio de "terminado"</b>.</p>
<div class="ex">"Extrae <b>importe, fecha y proveedor</b> de estas 30 facturas PDF y genera <b>facturas-julio.xlsx</b>: una fila por factura, totales por mes y por proveedor."</div>
<p class="body">El error típico: prompts de una línea ("organiza esto"). Sé específico, <b>como con alguien en su primer día</b>: qué, dónde, en qué formato y qué es "quedar bien".</p></div>`],
['06', `<div class="center"><div class="badge">3</div><div class="kicker">Paso 3</div>
<h2>Déjalo trabajar <span class="ac">(y supervisa)</span></h2>
<p class="body">Te enseña su <b>plan de trabajo</b>, avanza solo y te pide <b>aprobación</b> en los pasos sensibles (borrar, sobrescribir, enviar).</p>
<ul class="list" style="margin-top:18px;"><li>Mientras trabaja, tú sigues con <b>otra cosa</b></li>
<li>Revisa los <b>checkpoints</b>, no cada movimiento</li>
<li>Al final, <b>valida los archivos generados</b> antes de usarlos</li>
<li>¿Algo no cuadra? Dale feedback y <b>lo corrige</b> — itera igual que con un junior</li></ul></div>`],
['07', `<div class="center"><div class="badge">4</div><div class="kicker">Paso 4</div>
<h2>Prográmalo: tareas <span class="ac">recurrentes</span></h2>
<div class="ex">"Cada <b>lunes a las 8:00</b>, genera el informe semanal con los datos de mis conectores y déjalo listo en mi cuenta."</div>
<ul class="list"><li>Se ejecuta <b>en remoto</b> — tu equipo puede estar apagado</li>
<li>Usa tus <b>conectores</b> y los archivos de tu cuenta de Claude (no carpetas locales)</li>
<li>Bajo demanda o con la <b>cadencia</b> que elijas</li>
<li>Menú <b>"Scheduled"</b> → New task → "Create with Claude"</li></ul></div>`],
['08', `<div class="center"><div class="badge">5</div><div class="kicker">Paso 5</div>
<h2>Escálalo: <span class="ac">reglas, plugins y Dispatch</span></h2>
<ul class="list"><li><b>Instrucciones por carpeta</b>: reglas persistentes (formato, tono, rutas) — un system prompt por proyecto; se acabó repetir contexto</li>
<li><b>Proyectos</b>: agrupa tareas relacionadas con su propio contexto</li>
<li><b>Plugins por rol</b>: marketing, finanzas, legal… flujos ya montados</li>
<li><b>Dispatch</b> (computer use): usa el ordenador por ti cuando la tarea lo exige</li></ul>
<div class="note"><span class="nlab">Nivel pro</span> · Reglas + programación = procesos que corren solos, semana tras semana.</div></div>`],
['09', `<div class="center"><div class="kicker">Para empezar hoy</div>
<h2>3 tareas de <span class="ac">bajo riesgo</span></h2>
<ul class="list" style="margin-top:8px;"><li><b>① Ordena tu carpeta de Descargas</b> — que clasifique por tipo y fecha, y renombre con un criterio consistente</li>
<li><b>② PDFs → Excel</b> — extrae campos de facturas o recibos a una planilla limpia, con totales</li>
<li><b>③ Informe semanal automático</b> — resumen recurrente con tus fuentes, cada lunes a primera hora</li></ul>
<div class="div"></div>
<p class="body">Regla de oro: delega primero lo <b>aburrido, repetitivo y reversible</b>. Cuando valides resultados, sube la apuesta.</p></div>`],
['10', `<div class="center"><h2>¿Te sirvió?</h2>
<ul class="list" style="margin-top:12px;"><li>📌 <b>Guarda</b> este carrusel para tu primera tarea</li>
<li>💬 Comenta <b>"COWORK"</b> y te mando la guía de primeros pasos</li>
<li>🗣️ Cuéntame en comentarios: ¿qué tarea le <b>delegarías primero</b>?</li>
<li>➕ <b>Sígueme</b> para lo más nuevo de IA, siempre verificado</li></ul>
<div class="div"></div>
<p class="body">Cada semana: LLMs, agentes, imagen, video y automatización — <b>sin humo</b>, verificado contra fuentes primarias el mismo día.</p></div>`],
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
