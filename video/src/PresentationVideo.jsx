import {
  AbsoluteFill, interpolate, interpolateColors, spring,
  useCurrentFrame, useVideoConfig, Series, Easing, Loop,
} from "remotion";
import { TransitionSeries, fade, slide, wipe } from "@remotion/transitions";
import { linearTiming, springTiming } from "@remotion/transitions";
import { Circle, Triangle, Star, Rect } from "@remotion/shapes";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { noise2D } from "@remotion/noise";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

// ── Animated noise background particles ──────────────────────────────────────
function NoiseParticles({ accentColor }) {
  const frame = useCurrentFrame();
  const DOTS = 18;
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: 0.18 }}>
      {Array.from({ length: DOTS }, (_, i) => {
        const bx = noise2D(`bx${i}`, i * 0.3, 0) * 1280;
        const by = noise2D(`by${i}`, 0, i * 0.3) * 720;
        const x = bx + noise2D(`x${i}`, i * 0.1, frame * 0.004) * 120;
        const y = by + noise2D(`y${i}`, frame * 0.004, i * 0.1) * 80;
        const r = 2 + noise2D(`r${i}`, i, 0) * 5;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y,
            width: r * 2, height: r * 2, borderRadius: "50%",
            background: accentColor,
          }} />
        );
      })}
    </AbsoluteFill>
  );
}

// ── Decorative corner shape ───────────────────────────────────────────────────
function CornerDeco({ accentColor, frame }) {
  const scale = spring({ frame, fps: 30, config: { damping: 14, stiffness: 70 } });
  const rot = interpolate(frame, [0, 90], [0, 45]);
  return (
    <div style={{
      position: "absolute", right: 60, top: 50,
      transform: `scale(${scale}) rotate(${rot}deg)`, opacity: 0.15,
    }}>
      <Star points={6} innerRadius={20} outerRadius={42} fill={accentColor} />
    </div>
  );
}

// ── Title slide ───────────────────────────────────────────────────────────────
function TitleSlide({ title, accentColor }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale  = spring({ frame, fps, config: { damping: 12, stiffness: 60 } });
  const textOp = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });
  const barW   = interpolate(frame, [10, 40], [0, 160], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const bgColor = interpolateColors(frame, [0, 90], ["#0a0618", "#12103a"]);

  return (
    <AbsoluteFill style={{ background: bgColor, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <NoiseParticles accentColor={accentColor} />

      {/* Glow orb */}
      <div style={{
        position: "absolute",
        width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${accentColor}28 0%, transparent 70%)`,
        transform: `scale(${scale})`,
      }} />

      {/* Decorative shapes */}
      <div style={{ position: "absolute", left: 80, bottom: 80, opacity: 0.12, transform: `rotate(${interpolate(frame, [0, 90], [0, 30])}deg)` }}>
        <Triangle base={120} height={104} fill={accentColor} />
      </div>
      <CornerDeco accentColor={accentColor} frame={frame} />

      <div style={{ position: "relative", textAlign: "center", padding: "0 120px" }}>
        <div style={{
          fontFamily, fontSize: 72, fontWeight: 900, color: "#e2e8f0",
          opacity: textOp, transform: `scale(${interpolate(scale, [0, 1], [0.85, 1])})`,
          lineHeight: 1.15, letterSpacing: "-0.02em",
        }}>
          {title}
        </div>
        <div style={{
          margin: "28px auto 0", width: barW, height: 5,
          background: `linear-gradient(to right, ${accentColor}, #06b6d4)`,
          borderRadius: 3,
        }} />
      </div>
    </AbsoluteFill>
  );
}

// ── Content slide ─────────────────────────────────────────────────────────────
function ContentSlide({ title, points = [], accentColor, index }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleSp = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const titleY  = interpolate(titleSp, [0, 1], [-24, 0]);
  const barW    = interpolate(frame, [0, 18], [0, 100], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const bg      = index % 2 === 0 ? "linear-gradient(135deg,#0f0f1a,#1a1030)" : "linear-gradient(135deg,#0a1a3e,#0f0f1a)";

  return (
    <AbsoluteFill style={{ background: bg, display: "flex", flexDirection: "column", justifyContent: "center", padding: "70px 100px" }}>
      <NoiseParticles accentColor={accentColor} />

      {/* Side accent bar */}
      <div style={{
        position: "absolute", left: 0, top: "20%",
        width: 5, height: `${barW * 0.6}%`,
        background: `linear-gradient(to bottom, ${accentColor}, transparent)`,
        borderRadius: "0 3px 3px 0",
      }} />

      {/* Slide number chip */}
      <div style={{
        position: "absolute", top: 38, right: 70,
        background: `${accentColor}22`, border: `1px solid ${accentColor}44`,
        borderRadius: 20, padding: "6px 18px",
        fontFamily, fontSize: 15, color: accentColor, fontWeight: 600,
        opacity: titleSp,
      }}>
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Title */}
      <CameraMotionBlur samples={4}>
        <div style={{
          fontFamily, fontSize: 52, fontWeight: 800, color: "#e2e8f0",
          opacity: titleSp, transform: `translateY(${titleY}px)`,
          marginBottom: 36, lineHeight: 1.2, letterSpacing: "-0.01em",
        }}>
          {title}
        </div>
      </CameraMotionBlur>

      {/* Divider */}
      <div style={{
        width: interpolate(frame, [8, 28], [0, 80], { extrapolateRight: "clamp" }),
        height: 3, background: accentColor, borderRadius: 2, marginBottom: 28,
      }} />

      {/* Points */}
      {points.map((point, i) => {
        const delay = 12 + i * 7;
        const op = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 100 } });
        const x  = interpolate(op, [0, 1], [-50, 0]);
        return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 20, opacity: op, transform: `translateX(${x}px)` }}>
            <div style={{ marginTop: 10, width: 8, height: 8, borderRadius: "50%", background: accentColor, flexShrink: 0 }} />
            <div style={{ fontFamily, fontSize: 28, color: "#94a3b8", lineHeight: 1.5 }}>{point}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

// ── Outro slide ───────────────────────────────────────────────────────────────
function OutroSlide({ accentColor }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const op  = spring({ frame, fps, config: { damping: 14 } });
  const rot = interpolate(frame, [0, 90], [0, 360]);

  return (
    <AbsoluteFill style={{ background: "#0f0f1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <NoiseParticles accentColor={accentColor} />
      <Loop durationInFrames={120}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            position: "absolute", width: 200 + i * 120, height: 200 + i * 120,
            borderRadius: "50%",
            border: `${2 - i * 0.4}px solid ${accentColor}`,
            opacity: 0.15 + i * 0.08,
            transform: `rotate(${rot * (1 - i * 0.3)}deg)`,
          }} />
        ))}
      </Loop>
      <div style={{ textAlign: "center", opacity: op, position: "relative" }}>
        <div style={{ fontFamily, fontSize: 58, fontWeight: 900, color: "#e2e8f0", letterSpacing: "-0.02em" }}>Gracias</div>
        <div style={{ fontFamily, fontSize: 22, color: "#94a3b8", marginTop: 12 }}>Creado con AI Assistant ✦ Remotion</div>
      </div>
    </AbsoluteFill>
  );
}

// ── Main composition ──────────────────────────────────────────────────────────
const TRANSITIONS = [fade(), slide({ direction: "from-right" }), wipe({ direction: "from-left" }), slide({ direction: "from-bottom" })];
const SLIDE_FRAMES = 90;
const TITLE_FRAMES = 70;
const OUTRO_FRAMES = 60;
const TRANSITION_FRAMES = 20;

export const PresentationVideo = ({ title, slides = [], accentColor = "#7c3aed" }) => {
  const allSlides = [
    { type: "title" },
    ...slides.map(s => ({ type: "content", ...s })),
    { type: "outro" },
  ];

  return (
    <TransitionSeries>
      {allSlides.map((s, i) => {
        const dur = s.type === "title" ? TITLE_FRAMES : s.type === "outro" ? OUTRO_FRAMES : SLIDE_FRAMES;
        const timing = springTiming({ durationInFrames: TRANSITION_FRAMES, config: { damping: 16 } });
        const presentation = TRANSITIONS[i % TRANSITIONS.length];
        return [
          i > 0 && (
            <TransitionSeries.Transition key={`t${i}`} presentation={presentation} timing={timing} />
          ),
          <TransitionSeries.Sequence key={i} durationInFrames={dur}>
            {s.type === "title"   && <TitleSlide   title={title} accentColor={accentColor} />}
            {s.type === "content" && <ContentSlide title={s.title} points={s.points} accentColor={accentColor} index={i - 1} />}
            {s.type === "outro"   && <OutroSlide   accentColor={accentColor} />}
          </TransitionSeries.Sequence>,
        ];
      })}
    </TransitionSeries>
  );
};
