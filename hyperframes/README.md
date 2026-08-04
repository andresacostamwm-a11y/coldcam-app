# HyperFrames — instalación y workspace

Instalación completa de [HyperFrames](https://github.com/heygen-com/hyperframes) (HeyGen) siguiendo
la guía `docs/claude-design-hyperframes.md` (copia literal del documento original).

HyperFrames compone vídeo como **HTML + CSS + una timeline de GSAP en pausa**. El CLI captura la
página frame a frame con Chrome headless y la codifica a MP4 con FFmpeg.

## Qué quedó instalado

| Componente                | Versión / ruta                                                 |
| ------------------------- | -------------------------------------------------------------- |
| CLI `hyperframes`         | `0.7.90` (devDependency en este directorio)                     |
| Skills para agentes IA    | 19 skills en `../.agents/skills/`, enlazadas en `../.claude/skills/` |
| FFmpeg + FFprobe          | `6.1.1` en `/usr/bin` (apt)                                     |
| Chrome Headless Shell     | `152.0.7928.2` en `~/.cache/hyperframes/chrome/`                |
| Runtime local             | `vendor/` (GSAP, runtime, shader-transitions, player)           |

`npx hyperframes doctor` reporta OK en todos los requisitos de render.

## Uso

```bash
cd hyperframes

npx hyperframes doctor                 # diagnóstico del entorno
npx hyperframes init mi-video --example blank --resolution landscape
cd mi-video
ln -s ../vendor vendor                 # runtime local (ver "Sin salida a internet")
npx hyperframes lint                   # validación estructural
npx hyperframes check                  # lint + runtime + layout + contraste
npx hyperframes preview                # estudio en http://localhost:3002
npx hyperframes render -o out/video.mp4
```

Resoluciones: `landscape` (1920x1080), `portrait` (1080x1920), `square`, y variantes `-4k`.
Por defecto renderiza a 30 fps; `--fps 60` y `--resolution 4k` lo sobrescriben.

## Contenido

```
hyperframes/
├── docs/claude-design-hyperframes.md   # la guía original, íntegra
├── templates/                          # los 4 skeletons de la Sección 7, validados
│   ├── skeleton-a-social-reel.html     # 1080x1920, 15s, 6 escenas, 1 shader
│   ├── skeleton-b-launch-teaser.html   # 1920x1080, 25s, 8 escenas, 3 shaders
│   ├── skeleton-c-product-explainer.html # 1920x1080, 45s, 12 escenas, 3 shaders
│   ├── skeleton-d-cinematic-title.html # 1920x1080, 60s, 7 escenas, 3 shaders
│   ├── preview.html                    # reproductor universal (copiar sin tocar)
│   └── project-README.template.md      # README que la guía pide entregar en el ZIP
├── vendor/                             # runtime servido en local (ver abajo)
└── starter/                            # proyecto de prueba, renderizado y verificado
```

Los cuatro skeletons pasan `hyperframes lint` con **0 errores**. Los dos avisos que quedan
(`timeline_track_too_dense`, `google_fonts_import`) son informativos y también aparecen en los
skeletons publicados en la guía.

A y B se extrajeron literalmente de la guía. C y D los describe en prosa, así que se generaron
siguiendo su patrón: ritmo de escena `3-3-4-3.5-4-5-3.5-4-3.5-4-4-3.5` para C y `8-7-8-10-9-10-8`
para D, con el invariante `scenes.length === transitions.length + 1` de `HyperShader.init()`.

## Sin salida a internet desde el navegador

En este entorno Chrome no alcanza `cdn.jsdelivr.net` (el proxy de la sesión cubre a Node y a curl,
pero no al navegador). Los skeletons de la guía cargan GSAP, el runtime y los shaders por CDN, así
que un render directo se queda colgado en la navegación.

Solución aplicada: `vendor/` contiene copias locales de esos tres scripts más el player. Basta con
sustituir en el `<head>`:

```html
<script src="./vendor/gsap.min.js"></script>
<script src="./vendor/hyperframe.runtime.iife.js"></script>
<script src="./vendor/shader-transitions.global.js"></script>
```

Las fuentes de Google **no** necesitan cambio: el compilador del CLI las resuelve en Node y las
inyecta como `@font-face` deterministas antes de abrir el navegador.

En una máquina con salida normal a internet los skeletons funcionan tal cual, con las URLs de CDN.

## Corrección aplicada a los skeletons

La guía documenta dos bugs de escenas invisibles (toggles `autoAlpha` en escenas no-ancla, y el
`tl.set(..., { opacity: 1 })` de la primera ancla de cada grupo). Hay un tercero que no documenta y
que se reproduce con su propio Skeleton A:

> Cuando la **última escena ancla de un grupo shader** va seguida de un corte duro a una escena
> no-ancla, HyperShader nunca la oculta. Las dos escenas se renderizan superpuestas durante el
> resto de la ventana.

Verificado renderizando el Skeleton A relleno y extrayendo frames: en `t=11s` se veían la escena 4
y la 5 encimadas, y en `t=13.5s` la 5 y la 6. Poner fondo opaco a `.scene` no lo arregla —
HyperShader eleva las anclas por encima. El arreglo es una línea por grupo shader:

```js
tl.set("#s4", { autoAlpha: 0 }, 10.0); // ocultar el ancla final en su tiempo de cierre
```

Está aplicado y marcado con un comentario `FIX` en los cuatro skeletons. Tras el arreglo la
secuencia rinde limpia: escena 3 → shader `cinematic-zoom` → 4 → 5 → 6, sin superposición.

## Verificación realizada

- `hyperframes doctor` — todos los checks de render en verde.
- `starter/` — render real a MP4: 1920x1080, 30 fps, 10 s, H.264.
- Prueba de shaders — Skeleton A relleno, 1080x1920, 15 s, 450 frames, con
  `hasShaderTransitions: true` sobre WebGL por software (ANGLE/SwiftShader). Transición
  verificada frame a frame.

## Notas

- **Telemetría:** el CLI la trae activada por defecto. Se desactiva con
  `npx hyperframes telemetry disable` o `HYPERFRAMES_NO_TELEMETRY=1`.
- **Opcionales no instalados:** whisper-cpp (transcripción), Kokoro TTS (voz local) y MusicGen
  (música local). No los pide la guía y `torch` añade varios GB. Se instalan aparte si hacen falta
  para captions o voiceover.
- **Docker** está presente pero el daemon no corre; sólo afecta al render en contenedor.
- El render usa WebGL por software: ~2 min para 15 s a 1080x1920. Con GPU es bastante más rápido.
