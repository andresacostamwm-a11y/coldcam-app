# 🎬 Carruseles en video con música — lunes 3 y martes 4

Estrategia acordada con Andrés ("mezcla"):

| Día | Formato | Música |
|---|---|---|
| Dom 2 · Skills | Imágenes | **"u + me = <3"** — Olivia Rodrigo · la añade Andrés en la app |
| Lun 3 · GPT-5.6 | **Video** | Pista de marca v2 (dembow 2026) ya incrustada |
| Mar 4 · Claude Code vs Codex | **Video** | Pista de marca v2 (dembow 2026) ya incrustada |

## Cómo se producen

Cada slide PNG se convierte en un video de **4,8 s** con:
- un **tramo consecutivo** de la pista (offset = (i−1) × 4,8 s), para que al
  deslizar suene como una sola canción continua;
- **zoom lento** (Ken Burns) para que no parezca una foto congelada.

Fuente de audio: `928ed4b5-53be-4fa1-b0b1-e3398164ee31.mp3` (pista v2).

```bash
ffmpeg -nostdin -v error -y -loop 1 -i slide_i.png -ss <offset> -t 4.8 -i t.mp3 \
  -filter_complex "[0:v]scale=1080:1350,zoompan=z='min(zoom+0.00035,1.06)':d=120:s=1080x1350:fps=25[v]" \
  -map "[v]" -map 1:a -c:v libx264 -crf 20 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -t 4.8 -movflags +faststart slide_i.mp4
```

Verificación por slide: duración exacta 4,800 s · 1080×1350 · audio AAC ·
`ffmpeg -f null -` sin errores · tamaño en destino == tamaño local.

## Publicación

Igual que un carrusel normal, pero cada contenedor hijo usa
`media_type=VIDEO` y `video_url` en lugar de `image_url`.

Base CDN: `https://d2ol7oe51mr4n9.cloudfront.net/user_34dAShJQivWQzU0TFaGV5BF3UOJ/<id>.mp4`

## Lunes 3 agosto — GPT-5.6 (videos s01→s10)

1. a2fbf0a5-828e-40ed-92f4-3c533481c4a4
2. 62be41cb-c8b7-4b60-9cba-2316a66c1e00
3. _pendiente_
4. _pendiente_
5. _pendiente_
6. _pendiente_
7. _pendiente_
8. _pendiente_
9. _pendiente_
10. _pendiente_

## Martes 4 agosto — Claude Code vs Codex (videos s01→s10)

_pendiente_

---

## ⚠️ Notas de producción (para no repetir errores)

1. **El sandbox de Higgsfield se recicla** en cuanto no queda ningún proceso
   corriendo. Cada llamada debe ser autosuficiente: descargar el audio, generar
   el video y subirlo en el mismo comando. Encadenar entre llamadas no funciona.
2. **`ffmpeg` se come el stdin** dentro de un bucle `while read`. Sin
   `-nostdin` el bucle solo procesa la primera línea.
3. **Un objeto subido con 0 bytes no se puede sobrescribir**: el PUT devuelve
   200 pero el objeto se queda vacío. Si pasa, hay que pedir un `media_id`
   nuevo con `media_upload`. Por eso siempre se verifica el `content-length`
   remoto después de subir.
