# PLANTILLA OFICIAL — Carruseles y documentos de Instagram (v2 · jul 2026)

> ⚠️ REGLA FIJA: TODO carrusel o documento visual para Instagram se genera con
> este diseño. No se cambia sin orden explícita de Andrés.

## Colores
- Fondo: degradado `#05080F → #0A1220 → #060B14` (160deg).
- Red neuronal de partículas: **dorado #E8A33D** (cluster sup. derecho) +
  **cian #35C7E8** (inf. izquierdo), opacidad 0.4–0.55.
- Texto: blanco `#FFFFFF` · palabra clave **dorado #F0B54A** · acento **cian #35C7E8**.
- Títulos grandes: degradado dorado `#F8E2A6 → #E9B95B → #C08A2E` (background-clip).

## Tipografía
- Titulares: **Oswald 600/700**, MAYÚSCULAS, condensada.
- Cuerpo: **Roboto 400/500/700** (negritas en dorado).
- Firma: **Dancing Script 700** en degradado dorado: "Ing. Andrés Acosta"
  + "IA & AUTOMATIZACIÓN" — SIEMPRE en el pie izquierdo.

## Estructura de slides
- **Portada / statement:** titular condensado blanco+dorado, sub cian, contador
  pill oscuro arriba derecha, avatar a la derecha.
- **Interiores (tarjetas):** contador con marco dorado arriba izquierda, título
  degradado dorado, subtítulo blanco, pill de capacidad con borde dorado
  ("⚡ …"), tarjetas con borde dorado + icono en caja + título dorado + texto
  blanco, avatar a la derecha.

## ⛔ REGLAS DE COMPOSICIÓN (feedback de Andrés, 30-jul-2026)
1. **El texto y las tarjetas NUNCA tapan el avatar.** El avatar tiene su columna
   propia a la derecha (~400px libres); textos y tarjetas limitados a la columna
   izquierda (max-width ≈ 560–600px con padding de 64px).
2. **Ningún elemento montado sobre otro**: tarjetas, pills, títulos y firma no se
   solapan entre sí ni con el avatar. Comprobar visualmente cada render.
3. La firma va bajo la columna de texto, no sobre el avatar.

## Avatar (la imagen ES la marca)
- Avatar IA fotorrealista de Andrés en CADA slide, recortado sin fondo,
  anclado abajo-derecha.
- **ROTAR OUTFITS**: nunca repetir el mismo outfit en todas las slides ni entre
  carruseles consecutivos. Banco de poses/outfits en `content/instagram/marca/`
  y variantes generadas con nano_banana_pro (referencia = recorte existente,
  "idéntico rostro, distinto outfit") o con Soul cuando esté entrenado.
- Outfits base: traje oscuro · brazos cruzados (marino) · blazer blanco+tablet ·
  blazer blanco+hologramas · blazer gris claro · abrigo camel · chaleco marino ·
  bomber técnica negra. Ampliar cuando se pida.

## Pipeline técnico
1. Script Playwright (HTML/CSS 1080×1350) en el repo → sandbox Higgsfield lo
   descarga por raw.githubusercontent (commit SHA) y renderiza.
2. Subida: presigned PUT (media_upload) DESDE el sandbox EN LA MISMA llamada del
   render (el sandbox se descarta en ~10 s) → media_confirm → verificar tamaño
   en CDN (`size_download` > 0).
3. Publicación: Zapier `publish_media_v2` (Instagram Business), 1-10 URLs https.
4. Verificación siempre contra fuentes primarias el día de publicación.

Scripts de referencia: `gen-brand-v2.cjs` (muestras) y
`../semana-1/carrusel-cowork/gen-cowork-brandv2.cjs` (carrusel completo).
