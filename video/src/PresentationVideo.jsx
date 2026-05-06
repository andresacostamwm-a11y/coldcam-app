import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Series } from "remotion";

function Slide({ title, points, accentColor, index }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = spring({ frame, fps, config: { damping: 20 } });
  const titleY = interpolate(titleOpacity, [0, 1], [-30, 0]);

  return (
    <AbsoluteFill style={{
      background: index % 2 === 0
        ? "linear-gradient(135deg, #0f0f1a 0%, #1a1030 100%)"
        : "linear-gradient(135deg, #0a1a3e 0%, #0f0f1a 100%)",
      display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "80px 100px",
    }}>
      {/* Accent bar */}
      <div style={{
        width: interpolate(frame, [0, 20], [0, 120], { extrapolateRight: "clamp" }),
        height: 6, background: accentColor,
        borderRadius: 3, marginBottom: 32,
      }} />

      {/* Title */}
      <div style={{
        fontSize: 56, fontWeight: 800, color: "#e2e8f0",
        fontFamily: "system-ui, sans-serif",
        opacity: titleOpacity, transform: `translateY(${titleY}px)`,
        marginBottom: 40, lineHeight: 1.2,
      }}>
        {title}
      </div>

      {/* Points */}
      {points.map((point, i) => {
        const delay = 10 + i * 8;
        const op = spring({ frame: frame - delay, fps, config: { damping: 18 } });
        const x = interpolate(op, [0, 1], [-40, 0]);
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 20,
            marginBottom: 22, opacity: op, transform: `translateX(${x}px)`,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: accentColor, flexShrink: 0,
            }} />
            <div style={{
              fontSize: 30, color: "#94a3b8",
              fontFamily: "system-ui, sans-serif",
            }}>
              {point}
            </div>
          </div>
        );
      })}

      {/* Slide number */}
      <div style={{
        position: "absolute", bottom: 40, right: 80,
        fontSize: 18, color: accentColor, opacity: 0.6,
        fontFamily: "system-ui, sans-serif",
      }}>
        {index + 1}
      </div>
    </AbsoluteFill>
  );
}

function TitleSlide({ title, accentColor }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 14, stiffness: 80 } });
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a0a3e 50%, #0a1a3e 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      {/* Glow orb */}
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: `radial-gradient(circle, ${accentColor}33 0%, transparent 70%)`,
        transform: `scale(${scale})`,
      }} />

      <div style={{
        fontSize: 72, fontWeight: 900, color: "#e2e8f0", textAlign: "center",
        fontFamily: "system-ui, sans-serif", opacity,
        transform: `scale(${interpolate(scale, [0, 1], [0.8, 1])})`,
        padding: "0 80px", lineHeight: 1.2,
      }}>
        {title}
      </div>

      <div style={{
        marginTop: 32, width: interpolate(frame, [10, 40], [0, 200], { extrapolateRight: "clamp" }),
        height: 4, background: accentColor, borderRadius: 2,
      }} />
    </AbsoluteFill>
  );
}

export const PresentationVideo = ({ title, slides, accentColor = "#7c3aed" }) => {
  const framesPerSlide = 90;
  const titleFrames = 60;
  const total = titleFrames + slides.length * framesPerSlide;

  return (
    <Series>
      <Series.Sequence durationInFrames={titleFrames}>
        <TitleSlide title={title} accentColor={accentColor} />
      </Series.Sequence>
      {slides.map((slide, i) => (
        <Series.Sequence key={i} durationInFrames={framesPerSlide}>
          <Slide {...slide} accentColor={accentColor} index={i} />
        </Series.Sequence>
      ))}
    </Series>
  );
};
