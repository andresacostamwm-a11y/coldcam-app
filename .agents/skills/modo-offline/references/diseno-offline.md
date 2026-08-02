# Design code sin internet

Regla unica de la que salen todas las demas: **si el archivo necesita descargar algo
para verse bien, no sirve offline.** Todo entregable visual tiene que abrir con
doble clic, con el wifi apagado, y verse identico.

Esto vale igual para artifacts, landings, dashboards, presentaciones y correos.

## Prohibido / obligatorio

| Prohibido | Obligatorio |
|---|---|
| `<script src="https://cdn...">` | JS inline en `<script>` |
| `<link href="https://fonts.googleapis.com...">` | `@font-face` con base64, o stack de sistema |
| `<img src="https://...">` | `data:` URI o archivo relativo junto al HTML |
| Tailwind/Bootstrap por CDN | CSS propio inline (o build local ya vendorizado) |
| Iconos de Font Awesome por CDN | SVG inline |
| `fetch()` a APIs externas | datos embebidos en el propio archivo |
| Google Analytics y similares | nada: offline no hay telemetria que valga |

## Tipografia sin red

Primero intenta el stack del sistema — pesa 0 KB y se ve nativo:

```css
:root {
  --sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --serif: ui-serif, Georgia, Cambria, "Times New Roman", serif;
  --mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
}
body { font-family: var(--sans); }
```

Si el diseno exige una fuente concreta y el `.woff2` esta en disco, embebela:

```bash
python3 - <<'EOF'
import base64, pathlib
f = pathlib.Path("Inter-Regular.woff2")
print(f"@font-face{{font-family:'Inter';font-weight:400;font-display:swap;"
      f"src:url(data:font/woff2;base64,{base64.b64encode(f.read_bytes()).decode()}) format('woff2');}}")
EOF
```

Cada peso embebido suma ~25-40 KB: dos pesos como maximo (400 y 600).

## Imagenes

```bash
# imagen -> data URI, listo para pegar en el src
python3 -c "import base64,sys,pathlib;p=pathlib.Path(sys.argv[1]);\
print(f'data:image/{p.suffix[1:]};base64,'+base64.b64encode(p.read_bytes()).decode())" logo.png
```

- SVG siempre inline: escala, se estiliza con CSS y pesa poco.
- Por encima de ~200 KB, deja el archivo al lado del HTML con ruta relativa en vez de
  base64 (base64 infla ~33%).
- Nada de fotos de stock remotas: usa gradientes, formas SVG o color plano.

## Verificacion antes de entregar

```bash
# 1. ninguna referencia remota
grep -nE 'https?://|//cdn\.|src="//' salida.html

# 2. ver en local
python3 -m http.server 8000 --directory .   # abre http://localhost:8000/salida.html

# 3. prueba real: modo avion + abrir el archivo
```

Si el paso 1 devuelve algo que no sea un enlace de texto para el usuario, no esta listo.

## Documentos ofimaticos: todos locales

`python-pptx`, `python-docx`, `openpyxl` y `reportlab` renderizan sin red. Ya estan en
`requirements.txt` de este repo (`python-pptx`, `python-docx`).

```python
from pptx import Presentation
from pptx.util import Inches, Pt
p = Presentation()
s = p.slides.add_slide(p.slide_layouts[1])
s.shapes.title.text = "Informe offline"
p.save("informe.pptx")
```

Cuidado: las plantillas corporativas con imagenes enlazadas (no incrustadas) se ven
rotas offline. Incrusta siempre.

Lo que **no** funciona sin red: Canva, Figma, Gamma, Adobe Express, Magic Patterns —
todos son servicios remotos. Si el usuario los pide offline, genera el equivalente en
HTML/PPTX local y encola la exportacion al servicio para cuando vuelva la conexion.

## La PWA de este repo

`static/sw.js` cachea el shell (`/`) y **nunca cachea `/api/`** — decision correcta: no
se sirven respuestas de IA obsoletas como si fueran frescas.

Si se quiere mas cobertura offline, amplia el precache con los estaticos que ya existen,
no con rutas de API:

```js
const PRECACHE = ['/', '/static/index.html', '/static/manifest.json', '/static/icon-192.png'];
```

Y para que la interfaz avise en vez de fallar en silencio:

```js
window.addEventListener('offline', () => document.body.dataset.offline = 'true');
window.addEventListener('online',  () => delete document.body.dataset.offline);
```

```css
body[data-offline="true"]::before {
  content: "Sin conexion — respuestas de IA no disponibles";
  display: block; padding: .5rem; text-align: center;
  background: #7c2d12; color: #fff; font: 500 14px/1.4 var(--sans);
}
```
