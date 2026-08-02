# 🎼 Carruseles CON música — resuelto

## El problema

La API de Instagram no deja añadir música a un carrusel de imágenes. No hay
forma de acceder al catálogo musical ni a los sonidos en tendencia desde la API.

## La solución

Un carrusel de Instagram **admite videos, no solo fotos**. Así que convierto
cada slide en un **mini-video de 4.8 s con la música ya incrustada**. Resultado:
el carrusel se publica solo, con audio desde el primer segundo, y tú no tocas
nada.

Cada slide lleva un **tramo distinto y consecutivo** de la pista, así que al
deslizar suena como una sola canción continua. Además añadí un **zoom lento**
(efecto Ken Burns) para que se vea vivo en lugar de una foto congelada.

## 🎧 Escucha la pista — v2 "VIRAL 2026" (la actual)

**Pista completa (48 s):**
https://d2ol7oe51mr4n9.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/928ed4b5-53be-4fa1-b0b1-e3398164ee31.mp3

**Slide 1 del domingo ya convertida a video con esta música:**
https://d2ol7oe51mr4n9.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/8ee285e6-a718-4e7f-bc50-9f0c86e9c77d.mp4

### Sobre la pista v2
- **Reggaetón / dembow moderno** — el sonido que domina el contenido viral
  latino en 2026, no la electrónica genérica de stock.
- 96 BPM, La menor (Am–F–C–G). Patrón dembow real: kick en 1-e-y-a
  (pasos 0, 3, 8, 11) y caja en 4, 7, 12, 15.
- **808 con glide y saturación** entre acordes — la firma del género.
- Plucks oscuros como gancho melódico + **stabs tipo vocal-chop** con vibrato
  en el drop, para que suene a canción y no a música de fondo.
- Estructura con intro (2 compases), **drop** (compases 4–12) y outro, así el
  carrusel arranca suave y sube justo cuando ya estás leyendo.
- **Original, generada para tu marca** — 100 % libre de derechos, sin riesgo
  de copyright ni de que Instagram silencie el post.
- Reproducible con `gen-musica.py` (se puede ajustar tempo, tono o instrumentos).

<details>
<summary>Versión v1 (electrónica premium, reemplazada)</summary>

Pista: https://d2ol7oe51mr4n9.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/59cbdd2e-0007-4780-85b5-5126fddb30c0.mp3 ·
Slide: https://d2ol7oe51mr4n9.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/94a83b43-b952-40ba-a842-86e532e3b4a6.mp4

Synth oscuro, 100 BPM, con arpegio brillante. Sonaba premium pero no "actual".
</details>

## ⚖️ Lo que NO se puede automatizar (y por qué)

Las canciones virales comerciales (The Weeknd, Olivia Rodrigo, Shakira…) **no
se pueden incrustar en el video**: eso sería infracción de copyright e Instagram
silenciaría o retiraría el post. La licencia solo existe si se añaden **desde la
app**, con el catálogo oficial.

Por eso quedan dos caminos, y ambos son válidos:

| | Música original de marca | Canción viral comercial |
|---|---|---|
| Cómo se publica | 100 % automático, con audio | Automático + 30 s tuyos en la app |
| Licencia | Tuya, sin riesgo | La de Instagram (legal solo en la app) |
| Ventaja | Identidad sonora propia y consistente | Empuje del algoritmo por sonido en tendencia |

**Recomendación:** usa la pista de marca como opción por defecto (es
automática y te da identidad sonora), y reserva la canción viral para los
carruseles donde quieras empujar alcance.

## Cómo se produce

```bash
python3 gen-musica.py                      # genera brand-track.wav (48 s)

# por cada slide i (offset = (i-1) * 4.8):
ffmpeg -loop 1 -i slide_i.png -ss <offset> -t 4.8 -i brand-track.wav \
  -filter_complex "[0:v]scale=1080:1350,zoompan=z='min(zoom+0.00035,1.06)':d=120:s=1080x1350:fps=25[v]" \
  -map "[v]" -map 1:a -c:v libx264 -crf 20 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -t 4.8 -movflags +faststart slide_i.mp4
```

Luego se publica igual que un carrusel normal, pero con `media_type=VIDEO`
en cada contenedor hijo.
