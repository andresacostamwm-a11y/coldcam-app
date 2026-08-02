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
3. d29b4e7d-3221-41eb-bd57-905f9ad6ac86
4. 9e1e7d92-34fd-43b1-8911-e4489a425c42
5. 8d0d2a4b-891d-4032-8a03-8302dbaab52e
6. 06306174-89ca-4773-b7d7-9ee08bf0b0bc
7. ed1b4c27-d64e-4de5-9877-0e072babce43
8. 738bf48a-d29d-4eb8-aad1-16604e3a6a40
9. 72f777dc-df1e-459d-9168-493b5d98ebab
10. 22c8c593-cafc-4c3b-80d9-4590a4ce3d8a

✅ 10/10 subidos y verificados (tamaño remoto == local, sin errores de decodificación).

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
