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

Todo va a versión exacta, sin rangos `^`: `.npmrc` fija `save-exact=true` y `vendor/MANIFEST.txt`
declara paquete, versión y SHA-256 de cada fichero. Audita el conjunto con `npm run audit`.

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
├── vendor/                             # runtime desde npm + MANIFEST.txt con SHA-256
├── scripts/                            # audit, verify-vendor, vendor-runtime, setup-optional
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

## Componentes opcionales (audio local)

Los tres opcionales que reporta `doctor` también están instalados. No los pide la guía: sólo hacen
falta para captions automáticos, voiceover o música de fondo generados en local. El render a MP4
funciona sin ellos.

| Componente     | Qué es                        | Dónde                                        |
| -------------- | ----------------------------- | -------------------------------------------- |
| whisper.cpp    | transcripción → captions      | `/usr/local/bin/whisper-cli` + libs en `/usr/local/lib` |
| Kokoro TTS     | voz local (Kokoro-82M)        | venv en `~/.venv-hyperframes`                |
| MusicGen       | música de fondo local         | mismo venv (`torch` CPU + `transformers`)    |

Para que el CLI encuentre el entorno Python:

```bash
export HYPERFRAMES_PYTHON=$HOME/.venv-hyperframes/bin/python
```

Reproducir la instalación completa en otra máquina:

```bash
bash hyperframes/scripts/setup-optional.sh
```

Dos decisiones del script que conviene conocer:

- **venv aparte, no el Python del sistema.** El intérprete del sistema está marcado
  `EXTERNALLY-MANAGED` (PEP 668) y además lo usa la app Flask del repo; `torch` no debe entrar ahí.
- **Rueda CPU de PyTorch** (`--index-url https://download.pytorch.org/whl/cpu`). La rueda por
  defecto de PyPI arrastra el stack CUDA completo (~2-3 GB de paquetes `nvidia-*`) que no sirve sin
  GPU. Con el índice CPU el venv entero queda en 1,3 GB.

Y un detalle que costó encontrar: **whisper.cpp hay que compilarlo directamente en su ruta final.**
CMake graba rutas absolutas en el árbol de build, así que si compilas en un sitio y mueves el
directorio, `cmake --install` falla y el binario arranca pero no encuentra `libwhisper.so.1`.
`hyperframes doctor` sólo comprueba que el fichero exista, así que en ese estado da un ✓ engañoso.

## Seguridad

`npm run audit` corre las cuatro comprobaciones y sale != 0 si alguna falla, así que sirve tal cual
en CI o en un hook de pre-commit:

| Paso | Qué comprueba |
| ---- | ------------- |
| `npm audit` | vulnerabilidades conocidas en el árbol de dependencias |
| `npm audit signatures` | firma del registro npm de cada paquete instalado |
| `verify-vendor.sh` | SHA-256 de cada fichero de `vendor/` contra el manifiesto |
| `hyperframes lint` | validez estructural de las cuatro plantillas |

Estado actual: 0 vulnerabilidades, 137 paquetes con firma verificada (24 con atestación), vendor
íntegro, plantillas sin errores.

### Procedencia del runtime: npm, no CDN

La primera versión de `vendor/` venía de `cdn.jsdelivr.net`. Al comparar con los tarballs de npm
salió que **el fichero del player no coincidía**: jsDelivr sirve una re-minificación propia hecha
con Terser, y el propio fichero lleva escrito *"Do NOT use SRI with dynamically generated files"*.
Es decir, era un blob de 58 KB sin forma de verificarlo.

Ahora `vendor-runtime.sh` lo descarga con `npm pack`, que valida el hash de integridad contra el
registro, y escribe `vendor/MANIFEST.txt` con procedencia y SHA-256. Los otros tres ficheros
(GSAP, runtime, shader-transitions) sí eran idénticos al original; sólo cambió el player.

### Telemetría: dos canales, un interruptor

- El **CLI** envía telemetría por defecto. Queda desactivada en `~/.hyperframes/config.json`.
- El skill **`media-use`** tiene su *propio* envío a PostHog (`scripts/lib/telemetry.mjs`), aparte
  del CLI. Está documentado y es honesto — seudónimo, propiedades gruesas, `$ip:null`, nunca el
  texto del prompt ni rutas de fichero — pero es un segundo canal que conviene conocer.

Ambos respetan la misma variable, que es el control duradero (la config del CLI vive fuera del repo):

```bash
export HYPERFRAMES_NO_TELEMETRY=1   # o DO_NOT_TRACK=1
```

### Revisión de las skills instaladas

Las 25 skills se ejecutan con permisos completos de agente — el propio instalador lo advierte al
terminar. Revisadas 223 scripts (`.sh`, `.mjs`, `.js`, `.py`, `.cjs`) buscando patrones de riesgo:

- Sin `curl | bash` ni `wget | sh`, sin `sudo`, sin `rm -rf /`, sin `base64 -d`.
- Sin lecturas de credenciales. La única coincidencia (`~/.aws/credentials`) está en un `.md` de
  documentación sobre el render en Lambda, no en código.
- El único `eval(` es `model.eval()` de PyTorch — falso positivo.
- Hosts a los que llaman: `w3.org` (namespaces SVG), `cdn.jsdelivr.net`, `gsap.com`, `github.com`,
  `heygen.ai` y `us.i.posthog.com` (la telemetría de arriba). El resto son fixtures de test
  (`example.com`, `evil.example`).
- Los enlaces de `.claude/skills` no escapan del repo y ninguno está roto.

No es una auditoría línea a línea de 223 ficheros; es un barrido de patrones. Suficiente para
descartar lo evidente, no para certificar código de terceros.

### Reproducibilidad

`setup-optional.sh` fija whisper.cpp a un commit concreto en vez de la punta de `main`, para que
dos ejecuciones compilen el mismo árbol.

## Verificación realizada

Todo comprobado ejecutándolo, no leyendo la salida de `doctor` (que da falsos verdes):

- `starter/` — render real a MP4: 1920x1080, 30 fps, 10 s, H.264.
- Shaders — Skeleton A relleno, 1080x1920, 15 s, 450 frames, con `hasShaderTransitions: true` sobre
  WebGL por software (ANGLE/SwiftShader). Transición verificada extrayendo frames del MP4.
- TTS — `npx hyperframes tts` generó 3,2 s de voz en español (`ef_dora`) y 4,3 s en inglés.
- whisper — transcribió el WAV del TTS palabra por palabra con timestamps, modelo `base.en`.
  El ciclo TTS → whisper cierra correctamente.
- MusicGen — clip generado con `facebook/musicgen-small` sobre torch CPU.

## Notas

- **Docker** está presente pero el daemon no corre; sólo afecta al render en contenedor.
- El render usa WebGL por software: ~2 min para 15 s a 1080x1920. Con GPU es bastante más rápido.
