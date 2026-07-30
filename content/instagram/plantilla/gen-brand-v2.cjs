// Plantilla OFICIAL v2 (estilo feed actual): fondo oscuro + red neuronal dorada/cian
// + tipografía condensada + avatar IA de Andrés. Renderiza 3 slides de muestra 1080x1350.
const { chromium } = require('playwright');

const AVATAR_TRAJE = 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_132555_da4bd314-20e9-4e68-85b7-81a700896ad4.png';
const AVATAR_BRAZOS = 'https://d8j0ntlcm91z4.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/hf_20260730_132546_361b9f71-61de-4e37-9583-913e351d08dd.png';

// red de partículas: nodos fijos + líneas, un cluster por color
function net(color, pts, lines, op) {
  const dots = pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`).join('');
  const segs = lines.map(([a, b]) => `<line x1="${pts[a][0]}" y1="${pts[a][1]}" x2="${pts[b][0]}" y2="${pts[b][1]}" stroke="${color}" stroke-width="1.6"/>`).join('');
  return `<g opacity="${op}">${segs}${dots}</g>`;
}
const GOLD_PTS = [[760,60,5],[840,150,3.5],[920,90,6],[1000,190,4],[930,260,3],[1040,60,4],[860,330,5],[990,330,3.5],[770,230,3],[1050,270,5],[900,420,3],[1010,430,4],[830,500,2.5],[1060,520,3],[950,560,2.5]];
const GOLD_LN = [[0,1],[1,2],[2,3],[2,5],[3,4],[4,6],[3,9],[6,7],[7,9],[1,8],[8,6],[9,11],[10,11],[10,6],[11,13],[12,10],[13,14],[11,14]];
const CYAN_PTS = [[60,820,4],[150,900,3],[90,1000,5],[210,1010,3],[160,1110,4],[60,1180,3],[260,1160,2.5],[300,930,3.5],[360,1060,3],[240,860,2.5],[400,1200,3],[330,1270,2.5],[120,1290,3],[440,980,2.5]];
const CYAN_LN = [[0,1],[1,2],[2,3],[3,4],[4,5],[4,6],[6,8],[7,8],[7,9],[1,9],[8,13],[8,10],[10,11],[4,12],[3,7]];

const CSS = `
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:1080px; height:1350px; }
body { font-family:'Roboto',sans-serif; position:relative; overflow:hidden; color:#fff;
  background:linear-gradient(160deg,#05080F 0%,#0A1220 55%,#060B14 100%); }
svg.net { position:absolute; inset:0; }
.avatar { position:absolute; right:-40px; bottom:0; height:1010px;
  filter:drop-shadow(-18px 0 60px rgba(0,0,0,0.75)); }
.avatar.center { right:-20px; height:960px; }
.slide { position:absolute; inset:0; padding:70px 70px 60px; display:flex; flex-direction:column; }
.count { position:absolute; top:52px; right:56px; background:rgba(10,14,24,0.78);
  border-radius:999px; padding:12px 28px; font-size:30px; font-weight:700; color:#EAF2FA; }
.badge { display:inline-flex; align-items:center; justify-content:center; width:92px; height:92px;
  border-radius:18px; background:#E8A33D; color:#0A0F1A; font-family:'Oswald',sans-serif;
  font-size:54px; font-weight:600; margin-bottom:30px; }
.pill { display:inline-block; padding:12px 26px; border:2px solid #E8A33D; border-radius:999px;
  color:#F0B54A; font-size:27px; font-weight:700; letter-spacing:2px; margin-bottom:36px;
  align-self:flex-start; text-transform:uppercase; }
h1 { font-family:'Oswald',sans-serif; font-weight:700; text-transform:uppercase;
  font-size:104px; line-height:1.04; letter-spacing:1px; text-shadow:0 4px 24px rgba(0,0,0,0.8); }
h2 { font-family:'Oswald',sans-serif; font-weight:600; text-transform:uppercase;
  font-size:72px; line-height:1.08; letter-spacing:1px; margin-bottom:30px;
  text-shadow:0 4px 24px rgba(0,0,0,0.8); }
.gold { color:#F0B54A; } .cyan { color:#35C7E8; }
.sub { font-family:'Oswald',sans-serif; font-weight:600; text-transform:uppercase;
  color:#35C7E8; font-size:46px; letter-spacing:2px; margin-top:26px; line-height:1.15;
  text-shadow:0 3px 18px rgba(0,0,0,0.8); }
p.body { font-size:36px; line-height:1.45; color:#E6EDF5; max-width:560px;
  text-shadow:0 2px 12px rgba(0,0,0,0.7); }
p.body b { color:#F0B54A; font-weight:700; }
.mt { margin-top:22px; }
.ex { border-left:7px solid #E8A33D; background:rgba(232,163,61,0.10); border-radius:0 14px 14px 0;
  padding:22px 26px; margin:26px 0; font-size:31px; line-height:1.45; color:#F5E9CF;
  font-style:italic; max-width:560px; }
.ex b { color:#fff; font-style:normal; }
.center { flex:1; display:flex; flex-direction:column; justify-content:center; position:relative; z-index:2; }
.footer { display:flex; align-items:center; gap:26px; position:relative; z-index:2; }
.firma { font-family:'Dancing Script',cursive; font-size:52px; color:#fff;
  text-shadow:0 2px 14px rgba(0,0,0,0.8); }
.rol { font-size:24px; letter-spacing:3px; color:#9FB2C8; text-transform:uppercase; }
`;

const NET = `<svg class="net" viewBox="0 0 1080 1350">${net('#E8A33D', GOLD_PTS, GOLD_LN, 0.55)}${net('#35C7E8', CYAN_PTS, CYAN_LN, 0.45)}</svg>`;
const FOOT = `<div class="footer"><span class="firma">Ing. Andrés Acosta</span><span class="rol">IA &amp; Automatización</span></div>`;

const S = [
['muestra-01', `${NET}<img class="avatar" src="${AVATAR_TRAJE}">
<div class="slide"><div class="count">1/10</div>
<div class="center">
<div class="pill">Actualizado · Julio 2026</div>
<h1>CLAUDE<br><span class="gold">COWORK</span></h1>
<div class="sub">El "empleado digital"<br>de Anthropic</div>
<p class="body mt" style="font-size:40px; max-width:540px;">Ya trabaja <b>mientras duermes</b> — y aquí tienes cómo usarlo, <b>paso a paso</b>.</p>
</div>${FOOT}</div>`],
['muestra-02', `${NET}<img class="avatar center" src="${AVATAR_BRAZOS}">
<div class="slide"><div class="count">2/10</div>
<div class="center">
<h2>NO ES<br>UN CHAT.<br><span class="gold">ES UN EMPLEADO<br>DIGITAL.</span></h2>
<p class="body">Le das un objetivo, <b>planifica los pasos</b>, lee y edita tus archivos y te entrega <b>el trabajo terminado</b>.</p>
<p class="body mt">Un chat te dice <b>cómo</b> hacerlo.<br>Cowork <b>lo hace por ti</b>.</p>
<p class="body mt" style="color:#35C7E8;">El 33 % de las sesiones ya son procesos de negocio reales.</p>
</div>${FOOT}</div>`],
['muestra-05', `${NET}<img class="avatar center" src="${AVATAR_BRAZOS}">
<div class="slide"><div class="count">5/10</div>
<div class="center">
<div class="badge">2</div>
<h2>DESCRIBE LA TAREA<br><span class="gold">COMO A UN<br>EMPLEADO</span></h2>
<p class="body">La fórmula: <b>contexto + resultado + formato + criterio de "terminado"</b>.</p>
<div class="ex">"Extrae <b>importe, fecha y proveedor</b> de estas 30 facturas PDF y genera <b>facturas-julio.xlsx</b> con totales por mes."</div>
<p class="body">Sé específico, <b>como con alguien en su primer día</b>.</p>
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
    await p.screenshot({ path: `${n}.png` });
    console.log('ok', n);
  }
  await b.close();
})();
