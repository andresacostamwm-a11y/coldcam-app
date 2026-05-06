/**
 * SocialReel — 1080×1920 vertical video for Instagram/TikTok/Reels
 * Uses: TransitionSeries, shapes, noise, interpolateColors, Trail, CameraMotionBlur
 */
import {
  AbsoluteFill, interpolate, interpolateColors, spring,
  useCurrentFrame, useVideoConfig, Loop, Easing,
} from "remotion";
import { TransitionSeries, slide, fade } from "@remotion/transitions";
import { springTiming } from "@remotion/transitions";
import { Circle, Star, Rect } from "@remotion/shapes";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { noise2D } from "@remotion/noise";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

function GradientBg({ colorA, colorB, frame }) {
  const bg = interpolateColors(frame, [0, 60], [colorA, colorB]);
  return <AbsoluteFill style={{ background: `linear-gradient(160deg, ${bg} 0%, #0f0f1a 100%)` }} />;
}

function FloatingDots({ frame, color }) {
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: 0.2 }}>
      {Array.from({ length: 20 }, (_, i) => {
        const bx = noise2D(`rx${i}`, i * 0.3, 0) * 1080;
        const by = noise2D(`ry${i}`, 0, i * 0.3) * 1920;
        const dx = noise2D(`rdx${i}`, i, frame * 0.005) * 100;
        const dy = noise2D(`rdy${i}`, frame * 0.005, i) * 100;
        const r  = 4 + noise2D(`rr${i}`, i, 0) * 10;
        return <div key={i} style={{ position: "absolute", left: bx + dx, top: by + dy, width: r * 2, height: r * 2, borderRadius: "50%", background: color }} />;
      })}
    </AbsoluteFill>
  );
}

function HookSlide({ hook, subtext, color }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wordSp  = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });
  const subOp   = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const subY    = interpolate(subOp, [0, 1], [20, 0]);

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 70px" }}>
      <GradientBg colorA={color} colorB="#1a0a3e" frame={frame} />
      <FloatingDots frame={frame} color={color} />

      <CameraMotionBlur samples={6}>
        <div style={{
          fontFamily, fontSize: 88, fontWeight: 900, color: "white",
          textAlign: "center", lineHeight: 1.1, letterSpacing: "-0.03em",
          opacity: wordSp, transform: `scale(${interpolate(wordSp, [0,1], [0.85,1])})`,
          position: "relative", zIndex: 1,
        }}>
          {hook}
        </div>
      </CameraMotionBlur>

      <div style={{
        fontFamily, fontSize: 34, color: "rgba(255,255,255,0.7)", textAlign: "center",
        marginTop: 28, opacity: subOp, transform: `translateY(${subY}px)`,
        lineHeight: 1.5, position: "relative", zIndex: 1,
      }}>
        {subtext}
      </div>

      {/* Accent line */}
      <div style={{
        marginTop: 40, width: interpolate(frame, [5, 30], [0, 120], { extrapolateRight: "clamp" }),
        height: 5, background: "white", borderRadius: 3, opacity: 0.8,
        position: "relative", zIndex: 1,
      }} />
    </AbsoluteFill>
  );
}

function PointsSlide({ points, color }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 70px" }}>
      <GradientBg colorA="#1a0a3e" colorB={color} frame={frame} />
      <FloatingDots frame={frame} color={color} />

      {points.map((point, i) => {
        const delay = i * 10;
        const op = spring({ frame: frame - delay, fps, config: { damping: 16 } });
        const x  = interpolate(op, [0, 1], [-60, 0]);
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 24,
            marginBottom: 36, opacity: op, transform: `translateX(${x}px)`,
            position: "relative", zIndex: 1,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: `${color}33`, border: `2px solid ${color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily, fontSize: 22, fontWeight: 700, color, flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <div style={{ fontFamily, fontSize: 36, color: "#e2e8f0", lineHeight: 1.4 }}>{point}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

function CtaSlide({ cta, handle, color }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const op  = spring({ frame, fps, config: { damping: 12 } });
  const rot = interpolate(frame, [0, 90], [0, 360]);

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <GradientBg colorA="#0a0618" colorB={color} frame={frame} />
      <Loop durationInFrames={120}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: "absolute",
            width: 300 + i * 200, height: 300 + i * 200,
            borderRadius: "50%", border: `${2 - i * 0.5}px solid ${color}`,
            opacity: 0.12 + i * 0.04,
            transform: `rotate(${rot * (1 - i * 0.25)}deg)`,
          }} />
        ))}
      </Loop>
      <div style={{ opacity: op, textAlign: "center", position: "relative", zIndex: 1, padding: "0 60px" }}>
        <div style={{ fontFamily, fontSize: 80, fontWeight: 900, color: "white", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          {cta}
        </div>
        {handle && (
          <div style={{ fontFamily, fontSize: 38, color, marginTop: 24, fontWeight: 600 }}>
            {handle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

const COLORS = { purple: "#7c3aed", cyan: "#06b6d4", green: "#10b981", amber: "#f59e0b", red: "#ef4444" };

export const SocialReel = ({
  hook = "¿Sabías esto?",
  subtext = "Te cuento en 3 puntos",
  points = ["Punto clave 1", "Punto clave 2", "Punto clave 3"],
  cta = "Sígueme",
  handle = "@tuusuario",
  color = "purple",
}) => {
  const accent = COLORS[color] || color;
  const T = springTiming({ durationInFrames: 18, config: { damping: 15 } });

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={80}>
        <HookSlide hook={hook} subtext={subtext} color={accent} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={T} />
      <TransitionSeries.Sequence durationInFrames={100}>
        <PointsSlide points={points} color={accent} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={T} />
      <TransitionSeries.Sequence durationInFrames={70}>
        <CtaSlide cta={cta} handle={handle} color={accent} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
