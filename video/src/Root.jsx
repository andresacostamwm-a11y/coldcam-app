import { Composition } from "remotion";
import { PresentationVideo } from "./PresentationVideo";
import { IntroVideo } from "./IntroVideo";
import { TextVideo } from "./TextVideo";
import { SocialReel } from "./SocialReel";

export const RemotionRoot = () => (
  <>
    <Composition
      id="Presentation"
      component={PresentationVideo}
      durationInFrames={420}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{
        title: "Mi Presentación",
        slides: [
          { title: "Introducción", points: ["Punto 1", "Punto 2", "Punto 3"] },
          { title: "Desarrollo",   points: ["Idea principal", "Detalles", "Ejemplos"] },
          { title: "Conclusión",   points: ["Resumen", "Próximos pasos"] },
        ],
        accentColor: "#7c3aed",
      }}
    />

    <Composition
      id="Intro"
      component={IntroVideo}
      durationInFrames={150}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{ title: "AI Assistant", subtitle: "Tu asistente personal con IA" }}
    />

    <Composition
      id="TextVideo"
      component={TextVideo}
      durationInFrames={180}
      fps={30}
      width={1280}
      height={720}
      defaultProps={{ text: "Hola mundo", author: "AI Assistant" }}
    />

    <Composition
      id="SocialReel"
      component={SocialReel}
      durationInFrames={268}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        hook: "¿Sabías esto?",
        subtext: "Te cuento en 3 puntos",
        points: ["Punto clave 1", "Punto clave 2", "Punto clave 3"],
        cta: "Sígueme",
        handle: "@tuusuario",
        color: "purple",
      }}
    />
  </>
);
