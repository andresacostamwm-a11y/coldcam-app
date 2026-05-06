import {
  AbsoluteFill, interpolate, interpolateColors, spring,
  useCurrentFrame, useVideoConfig, Loop, Easing,
} from "remotion";
import { Circle, Star, Polygon } from "@remotion/shapes";
import { Trail } from "@remotion/motion-blur";
import { noise2D, noise3D } from "@remotion/noise";
import { fade } from "@remotion/transitions";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

// Animated neural network built from noise-driven nodes
function NeuralNet({ frame, accentColor }) {
  const W = 320, H = 320;
  const nodes = [
    [0.50,0.50,0.048],[0.50,0.20,0.030],[0.80,0.34,0.024],
    [0.84,0.64,0.026],[0.64,0.84,0.022],[0.36,0.84,0.022],
    [0.16,0.64,0.024],[0.20,0.34,0.024],[0.50,0.68,0.018],
    [0.67,0.42,0.015],[0.33,0.42,0.015],[0.38,0.26,0.013],
    [0.62,0.26,0.013],
  ];
  const edges = [
    [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],
    [1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,1],
    [0,8],[0,9],[0,10],[1,11],[1,12],[2,12],[7,11],
    [9,2],[9,3],[10,6],[10,7],[8,4],[8,5],[9,10],[9,8],
  ];

  const jitter = (i, axis, t) => noise2D(`j${i}${axis}`, i * 0.2, t * 0.006) * 14;
  const pt = (xf, yf, i) => [xf * W + jitter(i, "x", frame), yf * H + jitter(i, "y", frame)];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="nlGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={W/2} cy={H/2} r={W*0.55} fill="url(#nlGlow)" />

      {/* Edges with fade-in */}
      {edges.map(([a, b], i) => {
        const [ax, ay] = pt(...nodes[a], a);
        const [bx, by] = pt(...nodes[b], b);
        const prog = interpolate(frame - i * 1.5, [0, 12], [0, 1], { extrapolateRight: "clamp" });
        const mx = ax + (bx - ax) * prog;
        const my = ay + (by - ay) * prog;
        return <line key={i} x1={ax} y1={ay} x2={mx} y2={my} stroke={`${accentColor}80`} strokeWidth="1.5" />;
      })}

      {/* Nodes */}
      {nodes.map(([xf, yf, rf], i) => {
        const [nx, ny] = pt(xf, yf, i);
        const nr = rf * W;
        const op = spring({ frame: frame - i * 2.5, fps: 30, config: { damping: 14 } });
        const pulse = 1 + noise2D(`pulse${i}`, i, frame * 0.03) * 0.3;
        return (
          <g key={i} opacity={op}>
            <circle cx={nx} cy={ny} r={nr * 2.5 * pulse} fill={accentColor} opacity={0.12} />
            <circle cx={nx} cy={ny} r={nr * 1.4} fill={accentColor} opacity={0.25} />
            <circle cx={nx} cy={ny} r={nr} fill={i === 0 ? "#a855f7" : accentColor} />
            <circle cx={nx} cy={ny} r={nr * 0.38} fill="white" opacity={0.85} />
          </g>
        );
      })}
    </svg>
  );
}

// Orbiting decorative shape
function OrbitShape({ frame, radius, speed, size, color, Shape }) {
  const angle = (frame * speed * Math.PI) / 180;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return (
    <div style={{ position: "absolute", left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: "translate(-50%,-50%)", opacity: 0.2 }}>
      <Shape outerRadius={size} innerRadius={size * 0.5} points={5} fill={color} />
    </div>
  );
}

export const IntroVideo = ({ title = "AI Assistant", subtitle = "Tu asistente personal con IA" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSp  = spring({ frame, fps, config: { damping: 11, stiffness: 55 } });
  const titleOp = interpolate(frame, [22, 48], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const subOp   = interpolate(frame, [42, 70], [0, 1], { extrapolateRight: "clamp" });
  const titleY  = interpolate(titleOp, [0, 1], [20, 0]);
  const bgColor = interpolateColors(frame, [0, 150], ["#08061a", "#0f1030"]);

  // Slow rotating outer ring
  const ringRot = interpolate(frame, [0, 150], [0, 45], { easing: Easing.inOut(Easing.sine) });

  return (
    <AbsoluteFill style={{ background: bgColor, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>

      {/* Noise particle field */}
      {Array.from({ length: 30 }, (_, i) => {
        const bx = noise2D(`fbx${i}`, i * 0.2, 0) * 1280;
        const by = noise2D(`fby${i}`, 0, i * 0.2) * 720;
        const dx = noise2D(`fdx${i}`, i, frame * 0.003) * 80;
        const dy = noise2D(`fdy${i}`, frame * 0.003, i) * 60;
        const size = 1.5 + noise2D(`fs${i}`, i, 0) * 3;
        return (
          <div key={i} style={{
            position: "absolute", left: bx + dx, top: by + dy,
            width: size, height: size, borderRadius: "50%",
            background: "#a78bfa", opacity: 0.25,
          }} />
        );
      })}

      {/* Rotating deco ring */}
      <div style={{
        position: "absolute", width: 520, height: 520,
        borderRadius: "50%", border: "1px solid rgba(124,58,237,0.2)",
        transform: `rotate(${ringRot}deg)`,
      }}>
        {[0, 90, 180, 270].map(deg => (
          <div key={deg} style={{
            position: "absolute", width: 10, height: 10, borderRadius: "50%",
            background: "#7c3aed", opacity: 0.6,
            left: "50%", top: "50%",
            transform: `rotate(${deg}deg) translateY(-260px) translate(-50%,-50%)`,
          }} />
        ))}
      </div>

      {/* Orbiting shapes */}
      <OrbitShape frame={frame} radius={240} speed={0.4} size={14} color="#7c3aed" Shape={Star} />
      <OrbitShape frame={frame} radius={200} speed={-0.6} size={10} color="#06b6d4" Shape={Polygon} />

      {/* Neural network logo */}
      <Trail layers={3} lagInFrames={1.5} trailOpacity={0.35}>
        <div style={{ transform: `scale(${logoSp})`, marginBottom: 36, position: "relative" }}>
          <NeuralNet frame={frame} accentColor="#7c3aed" />
        </div>
      </Trail>

      {/* Title */}
      <div style={{
        fontFamily, fontSize: 70, fontWeight: 900,
        background: "linear-gradient(135deg, #a78bfa 30%, #38bdf8 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        opacity: titleOp, transform: `translateY(${titleY}px)`,
        letterSpacing: "-0.03em",
      }}>
        {title}
      </div>

      {/* Subtitle */}
      <div style={{
        marginTop: 14, fontFamily, fontSize: 24, color: "#94a3b8",
        opacity: subOp, letterSpacing: "0.04em",
      }}>
        {subtitle}
      </div>

      {/* Animated underline */}
      <div style={{
        marginTop: 20,
        width: interpolate(frame, [45, 80], [0, 220], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }),
        height: 3,
        background: "linear-gradient(to right, #7c3aed, #06b6d4)",
        borderRadius: 2,
      }} />
    </AbsoluteFill>
  );
};
