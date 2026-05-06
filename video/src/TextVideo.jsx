import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const TextVideo = ({ text = "", author = "AI Assistant" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const chars = text.split("");
  const totalFrames = 180;
  const charsPerFrame = chars.length / 60;

  const bgOp  = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const authorOp = spring({ frame: frame - 100, fps, config: { damping: 18 } });

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a1030 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "80px 120px", opacity: bgOp,
    }}>
      <div style={{
        fontSize: 52, fontWeight: 700, color: "#e2e8f0", textAlign: "center",
        fontFamily: "system-ui, sans-serif", lineHeight: 1.4,
      }}>
        {chars.map((char, i) => {
          const charFrame = i / charsPerFrame;
          const op = interpolate(frame - charFrame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
          return (
            <span key={i} style={{ opacity: op }}>{char}</span>
          );
        })}
      </div>

      <div style={{
        marginTop: 60, display: "flex", alignItems: "center", gap: 14, opacity: authorOp,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}>🤖</div>
        <div style={{ fontSize: 22, color: "#94a3b8", fontFamily: "system-ui, sans-serif" }}>
          {author}
        </div>
      </div>
    </AbsoluteFill>
  );
};
