# Brownie — Spot comercial 30s con chef en cámara

Paquete de producción para Higgsfield / Seedance. Construido a partir de tres
referencias: ficha de personaje del chef, cocina profesional oscura, y el
storyboard de 12 viñetas con el hero shot final.

**Objetivo del spot: que el chef sea reconocible.** El formato manda sobre el
estilo — la cara va en cuadro en los cinco clips.

---

## 1. Decisiones de producción

### El cambio de formato: de POV puro a tercera persona

El brief de partida era 100 % primera persona con guantes negros. En ese
formato **no hay un solo fotograma con la cara del chef** — la cámara *es* el
chef. Es incompatible con el objetivo.

El spot pasa a **tercera persona como base, con POV sólo como acento** en los
golpes de acción. Se conserva la energía FPV (cámara en mano, motion blur,
speed ramps, match cuts) pero desde fuera, viendo al chef correr, golpear y
cocinar.

Reparto de presencia:

| Clip | Formato | Cara en cuadro |
|---|---|---|
| 1 | Tercera persona + acento POV | Sí — plano medio, mirada arriba |
| 2 | Tercera persona (tracking lateral) | Sí — corriendo y golpeando |
| 3 | Tercera persona (tracking frontal) | Sí — corriendo de frente |
| 4 | Sobre hombro + insertos de manos | Sí — trabajando en la isla |
| 5 | Tercera persona → hero shot | Sí — mirada a cámara, sostenida |

Los insertos cerrados de manos (picar, fundir, batir, verter) siguen siendo
close-ups sin cara, como en el storyboard. Ahí no hace falta: la identidad ya
está establecida en los planos que los rodean.

### Consistencia de identidad — la parte difícil

Cinco clips son cinco generaciones independientes. Sin medidas, el chef sale
con otra cara en cada una. Tres cosas, en orden de impacto:

1. **Entrenar un personaje reutilizable (Soul).** Es la herramienta correcta
   para esto: `show_characters(action='train')` admite 5–20 fotos y devuelve un
   `soul_id` que fija la identidad entre generaciones. Recomendado, y con
   **fotos reales tuyas**, no la ficha generada — la ficha da tres vistas de una
   cara sintética; tus fotos dan la cara que la gente reconoce.
2. **Recortar el primer plano del rostro** (esquina superior izquierda de la
   imagen 1) y pasarlo como referencia de identidad en **los cinco clips**, no
   sólo en el primero.
3. **Anclar el vestuario palabra por palabra** en todos los prompts. La silueta
   es la mitad del reconocimiento a distancia.

Sin el paso 1, esperar deriva de identidad entre clips y presupuestar
regeneraciones.

### Conflicto de cocinas — resuelto

Las referencias no coinciden entre sí:

| Referencia | Cocina |
|---|---|
| Imagen 2 | Profesional oscura: acero negro, tiras LED frías, mármol negro, batería de cobre colgada |
| Imagen 3 (storyboard) | Doméstica moderna: encimera de madera cálida, luz ámbar, planta, ventanal |

Se unifican en una sola, con la paleta de la imagen 2 y la encimera de la
imagen 3, porque el hero shot final exige madera. Va literal en los clips 3–5.

### Limpieza del prompt original

El texto de partida traía corrupción de OCR que un modelo interpretaría mal:
`gigamcchocolate Dar tals trom the sky`, `ine character`, `strong rrv running`,
`the glant chocolate bar`, `ine cnocolate is placea onto tne wooden countertoo`.
Los prompts de abajo están reescritos en inglés limpio.

---

## 2. Anclas de continuidad

Copiadas **palabra por palabra** en todos los clips. Es lo que sostiene tanto la
identidad como la unidad visual del spot.

**CHEF** — en los cinco clips
> The same chef throughout: a bearded man in his forties, dark hair combed back,
> trimmed dark beard, olive skin. White chef jacket with the sleeves rolled to
> the elbow, navy blue bib apron, black trousers, black leather shoes, silver
> watch on the left wrist. His face is clearly visible and in focus.

**KITCHEN** — clips 3–5
> Modern dark kitchen. Matte black steel fronts and black cabinetry, cool LED
> strips under the shelves, black veined marble backsplash. Central island of
> warm solid wood. Amber practical light over the island against the cool LED
> in the background.

**GRADE** — en los cinco clips
> Physically accurate lighting, volumetric light shafts, shallow depth of field,
> natural motion blur, realistic reflections, premium food commercial color
> grade, deep shadows with warm highlights.

**NEGATIVE** — en los cinco clips
> No text, no logos, no on-screen captions, no cartoon or CGI look, no distorted
> hands, no extra fingers, no face blur, no face cropped out of frame, no
> changing the chef's appearance between shots.

> Nota: el bloque NEGATIVE ya **no** lleva `no face visible`. Era del brief POV
> original y ahora diría justo lo contrario de lo que se busca.

---

## 3. Los cinco clips

Todos: **16:9**, 6 s, ultrarrealista.

### Clip 1 — 0:00–0:06 · El impacto

Cadena de arranque. Sin `start_image`: nace de texto + identidad + storyboard.

```
Ultra-realistic cinematic shot, handheld camera. Bright sunny day, clear blue
sky, modern city street between tall glass buildings. Medium shot of the chef
standing in the middle of the empty street, seen from the front. He looks
sharply upward, his face clearly visible, expression shifting from confusion to
alarm. A huge shadow grows across him and across the asphalt. Reverse angle
looking up: a gigantic chocolate bar the size of a truck falls from the sky,
tumbling and spinning between the buildings, chocolate fragments and cocoa dust
scattering through the air, backlit by the sun. Back to the chef as he braces.
The bar slams into the asphalt a few meters ahead of him with a massive impact,
cracking the pavement and throwing chocolate debris across the street.

[CHEF]
[GRADE]
[NEGATIVE]
```

### Clip 2 — 0:06–0:12 · La carrera y la pala

`start_image`: último fotograma del clip 1.

```
Ultra-realistic cinematic shot, aggressive handheld tracking. The camera tracks
alongside the chef as he sprints hard toward the giant fallen chocolate bar,
his face visible in profile and three-quarter view, arms pumping, apron
flapping, city buildings streaking past in heavy motion blur. He reaches the
bar, grabs a steel shovel lying on the pavement and strikes the chocolate with
one powerful downward hit — low angle, his face in frame, teeth gritted with
effort. Large realistic chocolate chunks break away, cocoa crumbs fly in every
direction. The chocolate is thick, glossy and dense.

[CHEF]
[GRADE]
[NEGATIVE]
```

### Clip 3 — 0:12–0:18 · El sprint a casa

`start_image`: último fotograma del clip 2. Clip bisagra: saca el spot de la
calle y lo mete en la cocina en un movimiento continuo.

```
Ultra-realistic cinematic shot. The chef drops the shovel and lifts a huge
glossy chocolate block against his chest with both arms. The camera tracks
backwards in front of him as he breaks into a hard sprint carrying it — his
face fully visible, strong speed ramp, motion blur increasing. He rushes
through an apartment entrance, down a hallway in one continuous unbroken
movement, and bursts into the kitchen. He sets the chocolate block down heavily
onto the wooden island, breathing hard, and looks down at it.

[KITCHEN]
[CHEF]
[GRADE]
[NEGATIVE]
```

### Clip 4 — 0:18–0:24 · Picar, fundir, batir

`start_image`: último fotograma del clip 3.

```
Ultra-realistic cinematic shots, fast-paced editing with sharp match cuts.
Over-the-shoulder shot past the chef as a large chef's knife rapidly chops the
chocolate block on the wooden island; he turns slightly and his face catches
the amber light. Cut to a tight close-up of the knife and the chocolate shards
scattering. Cut: the pieces fall into a glass bowl over a double boiler and melt
into thick glossy liquid, steam rising through the light, the chef's face
visible behind the bowl, watching it, slightly out of focus. Cut: eggs, sugar,
butter and cocoa powder drop in rapidly; medium shot of the chef whisking,
face in frame, folding everything into a rich brownie batter with thick
chocolate ribbons forming.

[KITCHEN]
[CHEF]
[GRADE]
[NEGATIVE]
```

### Clip 5 — 0:24–0:30 · Horneado y hero shot

`start_image`: último fotograma del clip 4. Aquí es donde la gente lo reconoce
— el plano final es el que se recuerda.

```
Ultra-realistic cinematic shots. The chef pours the batter into a baking tray
in slow motion, the glossy surface leveling itself naturally. Quick cut to his
hands closing the oven door on warm orange light. Fast time-lapse: the brownie
rises as it bakes, steam escaping, the top developing a shiny crackled crust.
The chef slices fresh strawberries and places them neatly across the top, then
pours glossy chocolate glaze over the finished brownie, letting it drip down
the sides. Final hero shot: the finished strawberry brownie sits centered on
the wooden island. The chef stands behind it, both hands resting on the wood on
either side of the dessert, and lifts his eyes to look directly into the
camera — face fully lit, sharp and centered. The camera pushes slowly forward.
Hold on him and the brownie together.

[KITCHEN]
[CHEF]
[GRADE]
[NEGATIVE]
```

---

## 4. Referencias por clip

| Clip | start_image | Identidad | Otras |
|---|---|---|---|
| 1 | — | `soul_id` o rostro recortado | storyboard (01–02) |
| 2 | frame final clip 1 | `soul_id` o rostro recortado | storyboard (03–04) |
| 3 | frame final clip 2 | `soul_id` o rostro recortado | storyboard (05–07) + cocina |
| 4 | frame final clip 3 | `soul_id` o rostro recortado | cocina |
| 5 | frame final clip 4 | `soul_id` o rostro recortado | cocina + hero shot storyboard |

La identidad va en **todos** los clips. Encadenar por `start_image` sostiene la
continuidad de escena, pero no basta para la cara: la referencia de identidad
tiene que ir explícita cada vez.

---

## 5. Si el modelo sólo admite clips de 5 s

Reparto alternativo en 6 × 5 s:

| # | Contenido | Cara |
|---|---|---|
| 1 | Chef en la calle, mira arriba, sombra creciendo | Sí |
| 2 | Caída e impacto de la barra | Reacción |
| 3 | Carrera hacia la barra + golpe de pala | Sí |
| 4 | Levantar el bloque + sprint hasta la cocina | Sí |
| 5 | Picar + fundir + batir | Sobre hombro |
| 6 | Verter + horno + time-lapse + hero shot | Sí, sostenida |

Anclas y encadenado por `start_image` no cambian.

---

## 6. Montaje

- Empalmar en los match cuts ya escritos en los prompts.
- Sonido: impacto grave en 0:05, pasos y respiración durante la carrera, corte
  seco de cuchillo en 0:18, y bajada a música limpia en el hero shot.
- Este repo ya tiene Remotion en `video/` — el corte puede versionarse ahí.

---

## 7. Lanzamiento en Higgsfield

1. **`show_characters(action='train')`** con 5–20 fotos reales del chef.
   Devuelve el `soul_id`. Este paso va primero: sin él, los cuatro siguientes
   producen cinco caras distintas.
2. `models_explore(action='get', model_id=...)` — confirmar duraciones, aspect
   ratios y los `medias[].roles` admitidos.
3. `media_upload` — cocina y storyboard. Devuelve URLs prefirmadas; subir los
   bytes y llamar `media_confirm`.
4. `generate_video` con `get_cost: true` — coste de un clip antes de
   comprometer los cinco.
5. Generar el clip 1. **Revisar que la cara sea reconocible.** Sólo entonces
   encadenar el 2.

Generar los cinco de golpe es tirar créditos: si la identidad no sale bien en
el clip 1, los otros cuatro parten de un fotograma que se va a descartar.
