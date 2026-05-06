import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const IntroVideo = ({ title = "AI Assistant", subtitle = "Tu asistente personal con IA" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 60 } });
  const titleOp   = interpolate(frame, [20, 45], [0, 1], { extrapolateRight: "clamp" });
  const subOp     = interpolate(frame, [40, 65], [0, 1], { extrapolateRight: "clamp" });
  const ringScale = interpolate(frame, [0, 60], [0.6, 1.4], { extrapolateRight: "clamp" });
  const ringOp    = interpolate(frame, [0, 30, 90, 150], [0, 0.4, 0.4, 0]);

  // Neural node positions
  const nodes = [
    [0.5, 0.5], [0.5, 0.22], [0.78, 0.35], [0.82, 0.62],
    [0.65, 0.82], [0.35, 0.82], [0.18, 0.62], [0.22, 0.35],
  ];
  const edges = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,1]];
  const W = 260, H = 260;
  const pt = ([xf, yf]) => [xf * W, yf * H];

  return (
    <AbsoluteFill style={{
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a0a3e 50%, #0a1a3e 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      {/* Pulse rings */}
      {[1, 1.6, 2.2].map((mult, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 300 * mult * ringScale, height: 300 * mult * ringScale,
          borderRadius: "50%", border: "1.5px solid rgba(124,58,237,0.3)",
          opacity: ringOp / mult,
        }} />
      ))}

      {/* Neural network icon */}
      <div style={{ transform: `scale(${logoScale})`, marginBottom: 40 }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <radialGradient id="bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0f0f1a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={W/2} cy={H/2} r={W/2} fill="url(#bg)" />
          {edges.map(([a, b], i) => {
            const [ax, ay] = pt(nodes[a]);
            const [bx, by] = pt(nodes[b]);
            const progress = interpolate(frame, [i * 2, i * 2 + 15], [0, 1], { extrapolateRight: "clamp" });
            const mx = ax + (bx - ax) * progress;
            const my = ay + (by - ay) * progress;
            return <line key={i} x1={ax} y1={ay} x2={mx} y2={my} stroke="rgba(168,85,247,0.6)" strokeWidth="1.5" />;
          })}
          {nodes.map(([xf, yf], i) => {
            const [nx, ny] = pt([xf, yf]);
            const r = i === 0 ? 10 : 6;
            const op = spring({ frame: frame - i * 3, fps, config: { damping: 14 } });
            return (
              <g key={i} opacity={op}>
                <circle cx={nx} cy={ny} r={r + 5} fill="rgba(124,58,237,0.2)" />
                <circle cx={nx} cy={ny} r={r} fill={i === 0 ? "#a855f7" : "#7c3aed"} />
                <circle cx={nx} cy={ny} r={r * 0.4} fill="white" opacity={0.8} />
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{
        fontSize: 64, fontWeight: 900, color: "#e2e8f0",
        fontFamily: "system-ui, sans-serif", opacity: titleOp,
        background: "linear-gradient(135deg, #a78bfa, #38bdf8)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>
        {title}
      </div>

      <div style={{
        marginTop: 16, fontSize: 26, color: "#94a3b8",
        fontFamily: "system-ui, sans-serif", opacity: subOp,
      }}>
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};
