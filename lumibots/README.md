# ✦ LumiBots Studio Premium

**El creador de chatbots para todas las áreas de tu empresa.**

Aplicación web interactiva para crear chatbots profesionales — inspirada en
plataformas como Forja (forjabots.com) y ampliada muy por encima: además de los
giros de negocio, crea asistentes especialistas para las áreas internas de
cualquier organización, captura y almacena información en volumen, y trae un
sistema de licencias para que el propietario venda acceso a sus clientes y lo
autorice. Todo en una interfaz clara y luminosa, sin colores oscuros ni intensos.

## Cómo usarla

Abre `index.html` en cualquier navegador moderno. No necesita servidor ni
dependencias: todo vive en un solo archivo y los datos se guardan en el
`localStorage` del navegador.

La sesión **no sobrevive al cierre de la página**: al abrir el enlace siempre
se ve la pantalla de entrada con la ficha del propietario, nunca la app de una
sesión anterior.

**Accesos (una sola ventana):**

- 👑 Propietario (único usuario con acceso completo y de modificación):
  `Andrés Acosta` + su clave secreta, en la misma ventana de acceso. La clave
  se cambia desde el panel Admin y nunca se muestra en pantalla.
- 🔑 Cliente: su nombre o correo + la clave `LUMI-XXXX-XXXX` que recibe al
  contratar. La identidad debe coincidir con la registrada en la licencia.
- 🎁 Plan Gratis: cuenta sin tarjeta para conocer la plataforma. **No crea
  bots**: para eso hace falta un plan de pago.
- ▶️ Demostración guiada: sin clave, desde el botón «Probar la demostración
  guiada» de la puerta de acceso. Entra con el nombre **Andrés Acosta** y una
  guía paso a paso lleva al visitante por cada pestaña —crear el bot, entrenarlo,
  probarlo y ver el panel— hasta terminar en la página de planes. Es solo
  demostración: no guarda nada en el navegador, no crea bots reales y no permite
  contratar; su único fin es que el visitante aprenda cómo acceder y crear el
  suyo.

## Qué incluye

### Creación de bots (requiere suscripción de pago)
- **Muro de pago**: crear un bot real exige una licencia de pago activa. El
  plan Gratis y la demostración guiada no crean nada; la pestaña «Crear bot»
  redirige a Planes con el motivo. Cada plan tiene su límite —Starter 1 bot,
  Pro 5, Empresa ilimitados— y al alcanzarlo la app invita a mejorar el plan.
- **Precios visibles antes de entrar**: la pantalla de acceso muestra los
  cuatro planes con su precio en MXN o EUR, mensual o anual, y lleva
  directo a la contratación.
- **Asistente guiado de 5 pasos** que pide los datos necesarios de la empresa
  y arma el bot automáticamente, con validación en cada paso.
- **12 giros de negocio**: restaurante, salud, belleza, inmobiliaria, tienda,
  educación, legal, fitness, turismo, automotriz, tecnología y servicios.
- **10 áreas internas especialistas**: Finanzas, Compras, Atención al cliente,
  Mantenimiento, Marketing, Recursos Humanos, Ventas, Logística, Soporte TI y
  Asistencia personal — cada una con preguntas frecuentes, funciones, flujos de
  captura y políticas realistas pregeneradas.
- **Personalidad configurable**: objetivo, tono (amigable/formal/divertido),
  nombre, color del widget y mensaje de bienvenida.
- **Avatares**: 6 retratos fotográficos —3 mujeres y 3 hombres— recortados al
  rostro, cuadrados de 320 px e incrustados en la página, más los 24 símbolos
  de siempre. Las fotos las aporta el propietario; deben tener licencia
  comercial (ver la nota de derechos más abajo).
- **Tipo de letra del chat**: seis familias a elegir —Moderna, Clásica,
  Redonda, Elegante, Técnica y Compacta— con una muestra de cada una escrita
  en su propia tipografía. Se aplica al simulador de chat y viaja en el código
  de instalación del widget. Usa fuentes del sistema, sin descargas externas.

### Información en volumen
- **Entrenamiento con archivos de la empresa**: sube PDF, Word (.docx),
  Excel (.xlsx), PowerPoint (.pptx), HTML, TXT, CSV o JSON y la app extrae su
  texto para convertirlo en conocimiento del bot. Todo se procesa en el
  navegador (los archivos nunca salen del dispositivo) usando los
  descompresores nativos del navegador; un Excel con columnas
  Pregunta/Respuesta se importa como pares directos. Los PDF escaneados
  (imágenes sin texto) no se pueden leer.
- **Carga masiva de conocimiento**: pega cientos de pares `Pregunta | Respuesta`
  o carga un CSV/JSON de golpe; buscador dentro de la base de conocimiento.
- **15 tipos de dato capturables**: nombre, correo, teléfono, empresa, interés,
  fecha, presupuesto, departamento, folio, monto, proveedor, urgencia,
  equipo/activo, ubicación y comentario.
- **Medidor de almacenamiento** en tiempo real y **respaldo/restauración
  completa** de la plataforma en JSON.

### Operación
- **Simulador de chat en vivo** con detección de intenciones y flujo de captura
  real: cada solicitud o lead queda almacenado al instante.
- **Dashboard detallado por bot**: rangos de 7/14/30 días, conversaciones por
  día con tooltip, canales, embudo de conversión, temas más consultados y tabla
  de registros con exportación a CSV.
- **Multicanal**: Web, WhatsApp, Instagram, Messenger y Telegram; código de
  instalación para sitios web y exportación del bot en JSON.
- **Video explicativo narrado** en la pantalla de entrada (visible sin
  contraseña), escrito desde la perspectiva del **cliente que contrata**:
  8 capítulos y 13 frases que recorren qué obtiene, cómo elige su plan, cómo
  paga con tarjeta y recibe su clave, cómo crea y entrena su bot con sus
  archivos, cómo lo prueba y dónde ve sus resultados. Sin subtítulos en
  pantalla: el visitante elige el idioma y la narración se reproduce en él.
  Cada escena se dibuja en un lienzo fijo de 960×540 que se escala al ancho del
  reproductor, así el contenido siempre se ve completo en cualquier pantalla.
  **La imagen siempre va con la voz**: la línea de tiempo la manda la
  narración, no un reloj fijo. Con la voz del navegador cada escena espera a
  que la frase termine de sonar y avanza en ese instante (con un seguro por si
  el navegador no avisa); con narración importada la línea de tiempo se
  reconstruye con las duraciones reales de cada clip.
  Modos de narración:
  0. 🎧 **Narración incrustada en castellano (por omisión)** — 13 clips con
     **voz masculina de España**, generados con un sintetizador neuronal de
     calidad media (22 kHz) y masterizados con presencia y aire, en un tono
     algo más brillante para que suene positiva. Viajan dentro de la propia
     página (~380 KB). Suenan
     igual en cualquier teléfono u ordenador porque no dependen de las voces
     instaladas en el sistema. En inglés todavía no hay clips, así que ahí se
     usa la narración del navegador.
  1. 🔊 Narración automática del navegador (`es-ES` / `en-GB`, ritmo narrativo).
     Elige por sí sola una **voz masculina** entre las instaladas en el
     dispositivo —y evita las femeninas cuando no encuentra ninguna marcada
     como masculina—; el reproductor incluye un **selector de voz** (♂/♀) para
     cambiarla a mano, y la elección se recuerda. La voz disponible depende del
     sistema operativo del visitante, no de la app.
  2. 🎙️ **Narración propia** — grabando las frases con el micrófono desde el
     teleprompter integrado o **importando audios de un locutor profesional**
     (por ejemplo la voz Gabriel Blanco de ElevenLabs,
     `RwzBDEn5f6FIgpAjH9YN`). Tres caminos, todos en el panel de voz (solo
     propietario):
     **⚡ Generación directa**: se pega la clave API de ElevenLabs y la app
     genera las 13 frases, las importa y sincroniza el video sin salir de la
     pantalla. La petición sale **del navegador de quien usa la app**, y la
     clave se guarda únicamente en ese navegador (`localStorage`): no está en
     el código, no viaja al sitio publicado y no se sube al repositorio.
     **⬇ Guion .txt** descarga
     las 13 frases con el identificador de esa voz y las instrucciones, y
     **🎧 Importar audios** acepta 13 archivos numerados **o un único archivo
     con toda la narración**, que se divide automáticamente detectando las
     pausas. La línea de tiempo se reconstruye con las duraciones reales y cada
     clip pasa por una cadena de masterización de locución.
  3. 🔇 Sin narración.
  La grabación de referencia del propietario (`voz-original-andres.m4a` y su
  versión masterizada `voz-narracion-andres.webm`) se conserva en el
  repositorio y puede escucharse desde el panel Admin; no narra el tutorial
  porque su contenido no corresponde a los pasos.

### Licencias (modo negocio)
- **Puerta de acceso privada**: propietario con usuario y contraseña;
  clientes con su nombre o correo más su clave de licencia.
- **Página de planes** (Gratis/Starter/Pro/Empresa) con **tres formas de
  pago** que elige el cliente. La app **no pide ni guarda datos bancarios**:
  recoge nombre, empresa y correo y envía al cliente a la pasarela elegida.
  1. 💳 **Tarjeta de crédito o débito** — pasarela de Stripe. (Stripe *es* el
     procesador de tarjeta: no son dos métodos distintos.)
  2. 🅿️ **PayPal** — con saldo de PayPal o con tarjeta desde PayPal. Basta el
     correo de PayPal del propietario: la app arma el cobro con el importe y el
     periodo del plan (suscripción recurrente o pago único, configurable). Si
     prefiere usar un enlace o botón creado por él en PayPal, tiene prioridad.
  3. 🏦 **Transferencia** — no cobra en línea: registra la solicitud para que
     el propietario le pase los datos bancarios y le active la licencia.
  Si un método no está configurado aparece atenuado y la app selecciona sola
  otro disponible. El dinero entra en la cuenta de Stripe o de PayPal del
  propietario y de ahí se deposita en su banco.
  - Los cobros se configuran en **Admin → Cobro con Stripe** y
    **Admin → Cobro con PayPal**. En Stripe, un enlace por
    plan y periodo (Starter/Pro/Empresa × mensual/anual), con enlace opcional
    aparte en euros; si falta el de euros se usa el de pesos.
  - Cada compra crea una licencia **Pendiente** con una referencia `LB…` que
    viaja a Stripe como `client_reference_id`, y el correo del cliente va
    precargado en la pasarela. Al confirmarse el pago, el propietario la
    **autoriza** desde Admin y se genera la clave `LUMI-XXXX-XXXX`.
  - **Sin enlaces configurados** la app no simula ningún cobro: registra la
    solicitud y avisa al cliente de que el propietario le contactará.
- El plan Gratis se activa al instante, sin pasar por Stripe.
- **Panel del propietario**: licencias activas/pendientes/suspendidas, ingreso
  mensual, suspender/reactivar/revocar accesos, licencias manuales y cambio
  de usuario/contraseña del propietario.
- **Espacios separados**: cada cliente ve solo sus bots y sus registros; el
  propietario lo ve todo.

Incluye tres bots de demostración (dos de giro y uno de área interna de
Mantenimiento) con métricas y registros de ejemplo.

## Nota sobre derechos de imagen

Los retratos que usa la app son fotografías aportadas por el propietario. Antes
de venderla conviene tener por escrito la licencia comercial de cada una: las
imágenes descargadas de internet, las que llevan marca de agua de un banco de
imágenes y las de personas conocidas no se pueden usar en un producto que se
comercializa. Sustituirlas es inmediato: basta cambiar las entradas de
`PERSONAS` en `index.html` por las nuevas imágenes en base64.
