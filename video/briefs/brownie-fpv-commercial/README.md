# Brownie FPV — Spot comercial 30s

Paquete de producción para Higgsfield / Seedance. Construido a partir de tres
referencias: ficha de personaje del chef, cocina profesional oscura, y el
storyboard de 12 viñetas con el hero shot final.

---

## 1. Decisiones de producción

### 30 segundos = 5 clips, no una sola generación

Los modelos de vídeo generativo entregan clips cortos por llamada (del orden de
5–12 s según modelo y configuración). No existe un botón de "30 s" en una sola
pasada. El spot se produce como **5 clips de 6 s** que se montan después.

Antes de lanzar, confirmar las duraciones admitidas del modelo elegido con
`models_explore(action='get', model_id=...)` y ajustar el reparto si el modelo
sólo acepta 5 s (entonces: 6 clips × 5 s, ver §5).

### Conflicto de cocinas — resuelto

Las referencias no coinciden entre sí:

| Referencia | Cocina |
|---|---|
| Imagen 2 | Profesional oscura: acero negro, tiras LED frías, mármol negro, batería de cobre colgada |
| Imagen 3 (storyboard) | Doméstica moderna: encimera de madera cálida, luz ámbar, planta, ventanal |

Se unifican en **una sola cocina**, tomando la paleta de la imagen 2 y la
encimera de la imagen 3, porque el hero shot final del storyboard exige madera:

> Cocina moderna oscura. Frentes de acero negro mate y armarios negros, tiras
> LED frías bajo los estantes, salpicadero de mármol negro veteado. Isla
> central de madera maciza cálida. Luz práctica ámbar sobre la isla que
> contrasta con el LED frío del fondo.

Esta descripción va **literal en los cinco clips**. Es el ancla de continuidad
más importante del spot.

### El problema del chef: en POV puro nunca se le ve la cara

El brief original es 100 % primera persona con guantes negros. En ese formato
**la ficha de personaje del chef no se usa nunca** — no hay un solo fotograma
donde aparezca su rostro.

Hay dos salidas. Están montadas las dos:

- **Versión A — POV puro.** Fiel al brief y al storyboard. El chef no aparece.
  Las referencias 1 y 2 de la ficha quedan sin usar. Es la versión con mejor
  coherencia visual porque no hay riesgo de deriva de identidad.
- **Versión B — POV + revelación del chef.** Idéntica salvo dos planos: un
  reflejo en el cristal del horno (clip 4) y la entrada del chef en cuadro tras
  la isla en el plano final (clip 5). Aquí sí entra la ficha de personaje.

Recomendación: **Versión B**. Un spot de comida de 30 s gana con una cara al
final, y es la única forma de que las referencias del chef aporten algo.

### Limpieza del prompt original

El texto de partida traía corrupción de OCR que un modelo interpretaría mal:
`gigamcchocolate Dar tals trom the sky`, `ine character`, `strong rrv running`,
`the glant chocolate bar`, `ine cnocolate is placea onto tne wooden countertoo`.
Los prompts de abajo están reescritos en inglés limpio.

---

## 2. Anclas de continuidad

Estos cuatro bloques van **copiados palabra por palabra** en los cinco clips.
Es lo que evita que el spot parezca cinco vídeos distintos pegados.

**GLOVES**
> Both hands in matte black nitrile gloves, visible in frame. Forearms bare,
> white chef jacket sleeves rolled to the elbow.

**KITCHEN** (sólo clips 3–5)
> Modern dark kitchen. Matte black steel fronts and black cabinetry, cool LED
> strips under the shelves, black veined marble backsplash. Central island of
> warm solid wood. Amber practical light over the island against the cool LED
> in the background.

**GRADE**
> Physically accurate lighting, volumetric light shafts, shallow depth of
> field, natural motion blur, realistic reflections, premium food commercial
> color grade, deep shadows with warm highlights.

**NEGATIVE**
> No text, no logos, no on-screen captions, no cartoon or CGI look, no
> distorted hands, no extra fingers, no floating limbs, no third-person camera,
> no face visible.

> En Versión B, el clip 4 y el clip 5 **quitan** `no face visible` del bloque
> NEGATIVE. Los otros tres lo mantienen.

---

## 3. Los cinco clips

Todos: **16:9**, 6 s, ultrarrealista, primera persona.

### Clip 1 — 0:00–0:06 · El impacto

Cadena de arranque. No lleva `start_image`; nace de texto + referencia de
storyboard.

```
Ultra-realistic cinematic FPV shot, first-person perspective, handheld.
Bright sunny day, clear blue sky, modern city street between tall glass
buildings. The camera looks sharply upward. A gigantic chocolate bar the size
of a truck falls from the sky, tumbling and spinning as it drops between the
buildings. Chocolate fragments and cocoa dust scatter through the air, backlit
by the sun. The camera whips down to follow it. The bar slams into the asphalt
a few meters ahead with a massive impact, cracking the pavement and throwing
chocolate debris and dust across the street.

[GLOVES]
[GRADE]
[NEGATIVE]
```

### Clip 2 — 0:06–0:12 · La carrera y la pala

`start_image`: último fotograma del clip 1.

```
Ultra-realistic cinematic FPV shot, first-person perspective, aggressive
handheld running motion. Continuing from the impact: the camera sprints hard
toward the giant fallen chocolate bar, gloved arms pumping in and out of frame,
city buildings streaking past in heavy motion blur. The camera closes the
distance fast. A gloved hand grabs a steel shovel lying on the pavement and
strikes the chocolate with one powerful downward hit. Large realistic chocolate
chunks break away, cocoa crumbs fly in every direction. The chocolate surface
is thick, glossy and dense.

[GLOVES]
[GRADE]
[NEGATIVE]
```

### Clip 3 — 0:12–0:18 · El sprint a casa

`start_image`: último fotograma del clip 2. Este es el clip bisagra: saca el
spot de la calle y lo mete en la cocina en un solo movimiento.

```
Ultra-realistic cinematic FPV shot, first-person perspective. The shovel drops
out of frame. Both gloved hands lift a huge glossy chocolate block against the
chest. The camera accelerates into a hard sprint carrying the chocolate — strong
speed ramp, motion blur increasing. It rushes through an apartment entrance,
down a hallway in one continuous unbroken movement, and bursts into the kitchen.
The chocolate block is set down heavily onto the wooden island.

[KITCHEN]
[GLOVES]
[GRADE]
[NEGATIVE]
```

### Clip 4 — 0:18–0:24 · Picar, fundir, batir

`start_image`: último fotograma del clip 3.

```
Ultra-realistic cinematic first-person shots, fast-paced editing with sharp
match cuts. A large chef's knife rapidly chops the chocolate block into small
pieces on the wooden island — tight close-up, sharp impacts, chocolate shards
scattering naturally. Cut: the pieces fall into a glass bowl set over a double
boiler and melt into thick glossy liquid while the camera circles smoothly
around the bowl and steam rises through the light. Cut: eggs, sugar, butter and
cocoa powder drop in rapidly, a whisk folds everything into a rich brownie
batter, thick chocolate ribbons forming as it turns.

[KITCHEN]
[GLOVES]
[GRADE]
[NEGATIVE]
```

**Versión B — sustituir la última frase por:**

> Cut: eggs, sugar, butter and cocoa powder drop in rapidly, a whisk folds
> everything into a rich brownie batter. For a brief moment the chef's face is
> caught reflected in the dark glass of the oven door behind the island —
> bearded man in his forties, hair combed back, white chef jacket, navy blue
> apron — then the camera returns to the batter.

y quitar `no face visible` del bloque NEGATIVE en este clip.

### Clip 5 — 0:24–0:30 · Horneado y hero shot

`start_image`: último fotograma del clip 4.

```
Ultra-realistic cinematic first-person shots. The batter pours into a baking
tray in slow motion, the glossy surface leveling itself naturally. Quick cut to
the oven door closing on warm orange light. Fast time-lapse: the brownie rises
as it bakes, steam escaping, the top developing a shiny crackled crust. Fresh
strawberries are sliced and placed neatly across the top, then glossy chocolate
glaze is poured over the finished brownie and drips down the sides. Final hero
shot, first-person view: the finished strawberry brownie sits centered on the
wooden island, both gloved hands framing it on either side. The camera pushes
slowly forward, revealing the glossy glaze, the fresh strawberries and the rich
brownie crumb. Hold on the dessert.

[KITCHEN]
[GLOVES]
[GRADE]
[NEGATIVE]
```

**Versión B — sustituir las dos últimas frases por:**

> Final hero shot: the finished strawberry brownie sits centered on the wooden
> island, both gloved hands framing it on either side. The chef steps into
> frame behind the island and looks down at the dessert — bearded man in his
> forties, hair combed back, white chef jacket with rolled sleeves, navy blue
> apron. The camera pushes slowly forward past his hands onto the brownie,
> revealing the glossy glaze and the fresh strawberries. Hold.

y quitar `no face visible` del bloque NEGATIVE en este clip.

---

## 4. Referencias por clip

| Clip | start_image | Referencias adicionales |
|---|---|---|
| 1 | — | storyboard (viñetas 01–02) |
| 2 | frame final clip 1 | storyboard (viñetas 03–04) |
| 3 | frame final clip 2 | storyboard (05–07) + cocina |
| 4 | frame final clip 3 | cocina · **B:** + ficha chef |
| 5 | frame final clip 4 | cocina + hero shot storyboard · **B:** + ficha chef |

Encadenar por `start_image` es lo que sostiene la continuidad. Si un clip sale
con una cocina distinta o unos guantes distintos, el fallo casi siempre está en
que se generó suelto en lugar de partir del fotograma anterior.

Sobre la ficha del chef: la referencia útil es el **primer plano del rostro**
(esquina superior izquierda de la imagen 1), no el plano entero de cuerpo. Los
modelos de identidad trabajan mejor con la cara ocupando la mayor parte del
encuadre. Conviene recortarla antes de subirla.

---

## 5. Si el modelo sólo admite clips de 5 s

Reparto alternativo en 6 × 5 s:

| # | Contenido |
|---|---|
| 1 | Caída de la barra desde el cielo |
| 2 | Impacto contra el asfalto + arranque de la carrera |
| 3 | Carrera + golpe de pala |
| 4 | Levantar el bloque + sprint hasta la cocina |
| 5 | Picar + fundir + batir |
| 6 | Verter + horno + time-lapse + hero shot |

Los prompts se reparten por las mismas frases; las anclas de continuidad y el
encadenado por `start_image` no cambian.

---

## 6. Montaje

Los cinco clips llegan sueltos. Para el corte final:

- Empalmar en los match cuts ya escritos en los prompts.
- Sonido: impacto grave en 0:05, pasos y respiración durante la carrera, corte
  seco de cuchillo en 0:18, y bajada a música limpia en el hero shot.
- Este repo ya tiene Remotion en `video/` — el montaje puede hacerse ahí si se
  quiere versionar el corte junto al código.

---

## 7. Lanzamiento en Higgsfield

Con las herramientas MCP disponibles, la secuencia es:

1. `models_explore(action='get', model_id=...)` — confirmar duraciones,
   aspect ratios y los `medias[].roles` admitidos por el modelo.
2. `media_upload` — subir la ficha del chef recortada, la cocina y el
   storyboard. Devuelve URLs prefirmadas; subir los bytes y llamar
   `media_confirm`.
3. `generate_video` con `get_cost: true` — coste en créditos de un clip antes
   de comprometer los cinco.
4. Generar el clip 1. Revisar. Sólo entonces encadenar el 2, y así.

Generar los cinco de golpe es tirar créditos: si el clip 1 no convence, los
cuatro siguientes parten de un fotograma que se va a descartar.
