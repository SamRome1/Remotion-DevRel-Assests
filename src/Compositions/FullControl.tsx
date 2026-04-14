import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

// Design tokens
const BG = "#0f1117";
const FG = "rgba(255,255,255,0.92)";
const FG_MUTED = "rgba(255,255,255,0.45)";
const PURPLE = "#8b5cf6";
const BLUE = "#3b82f6";
const SANS = "system-ui, -apple-system, sans-serif";
const MONO = '"JetBrains Mono", ui-monospace, monospace';

// AI model configs
const AI_MODELS = [
  { label: "Claude", color: "#E57C2D", shape: "hex", angle: -Math.PI / 2 },       // top
  { label: "GPT", color: BLUE, shape: "circle", angle: 0 },                        // right
  { label: "Gemini", color: "#0ea5e9", shape: "circle", angle: Math.PI / 2 },      // bottom
  { label: "Llama", color: "#ec4899", shape: "circle", angle: Math.PI },           // left
];

// Tool configs — 6 evenly spaced
const TOOL_ANGLES = Array.from({ length: 6 }, (_, i) => (Math.PI * 2 * i) / 6 - Math.PI / 2);
const TOOL_COLORS = [PURPLE, BLUE, "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"];
const TOOL_LABELS = ["DB", "API", "Auth", "Store", "Queue", "Search"];

// Center of canvas
const CX = 540;
const CY = 540;
const MCP_R = 100; // MCP hexagon radius
const MODEL_ORBIT = 300; // orbit radius for AI models
const TOOL_ORBIT = 460; // orbit radius for tool nodes
const MODEL_NODE_SIZE = 90;
const TOOL_NODE_SIZE = 68;

// Hexagon polygon points helper
function hexPoints(cx: number, cy: number, r: number, offsetAngle = 0): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + offsetAngle;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(" ");
}

// Connection line between two points with draw progress
const ConnectionLine: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  progress: number; color: string; width?: number; dashed?: boolean; dashOffset?: number;
}> = ({ x1, y1, x2, y2, progress, color, width = 2, dashed = false, dashOffset = 0 }) => {
  const x2a = x1 + (x2 - x1) * progress;
  const y2a = y1 + (y2 - y1) * progress;
  return (
    <line
      x1={x1} y1={y1} x2={x2a} y2={y2a}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dashed ? "8 6" : undefined}
      strokeDashoffset={dashed ? dashOffset : undefined}
      opacity={0.6}
    />
  );
};

// Map each tool to its nearest AI model (by angle proximity)
function nearestModel(toolAngle: number): number {
  let best = 0;
  let bestDist = Infinity;
  AI_MODELS.forEach((m, i) => {
    let d = Math.abs(m.angle - toolAngle);
    if (d > Math.PI) d = Math.PI * 2 - d;
    if (d < bestDist) { bestDist = d; best = i; }
  });
  return best;
}

export const FullControl: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow diagram rotation (scene 3, 200–300f)
  const rotationProgress = interpolate(frame, [200, 300], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const diagramRotation = interpolate(rotationProgress, [0, 1], [0, 3]);

  // Scene 1 (0–80f): MCP center node springs in
  const mcpScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 18, stiffness: 100 } });
  const mcpOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Inner ring glow pulse
  const mcpGlow = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 2 * 0.8);

  // Scene 2 (80–200f): AI model nodes spring out with stagger
  const modelSprings = AI_MODELS.map((_, i) => {
    const delay = 80 + i * 18;
    return spring({ frame: Math.max(0, frame - delay), fps, from: 0, to: 1, config: { damping: 16, stiffness: 90 } });
  });

  // Connection lines MCP -> models: draw after node appears
  const modelLineProgress = AI_MODELS.map((_, i) => {
    const start = 82 + i * 18;
    return interpolate(frame, [start, start + 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  });

  // Scene 3 (200–300f): Tool nodes spring out
  const toolSprings = TOOL_ANGLES.map((_, i) => {
    const delay = 200 + i * 14;
    return spring({ frame: Math.max(0, frame - delay), fps, from: 0, to: 1, config: { damping: 14, stiffness: 100 } });
  });

  // Tool connection lines
  const toolLineProgress = TOOL_ANGLES.map((_, i) => {
    const start = 205 + i * 14;
    return interpolate(frame, [start, start + 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  });

  // Animated dash offset
  const dashOffset = -(frame * 2.5) % 28;

  // Outer ring pulse opacity
  const outerPulse = interpolate(frame, [240, 300], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: SANS, overflow: "hidden" }}>
      <svg
        width={1080}
        height={1080}
        viewBox="0 0 1080 1080"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <g transform={`rotate(${diagramRotation}, ${CX}, ${CY})`}>

          {/* Orbit ring guides (subtle) */}
          {frame >= 80 && (
            <circle
              cx={CX} cy={CY} r={MODEL_ORBIT}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
              opacity={interpolate(frame, [80, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
            />
          )}
          {frame >= 200 && (
            <circle
              cx={CX} cy={CY} r={TOOL_ORBIT}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
              opacity={interpolate(frame, [200, 240], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
            />
          )}

          {/* MCP -> Model connection lines */}
          {AI_MODELS.map((model, i) => {
            const mx = CX + MODEL_ORBIT * Math.cos(model.angle);
            const my = CY + MODEL_ORBIT * Math.sin(model.angle);
            if (frame < 82 + i * 18) return null;
            return (
              <ConnectionLine
                key={`line-model-${i}`}
                x1={CX} y1={CY}
                x2={mx} y2={my}
                progress={modelLineProgress[i]}
                color={model.color}
                width={2.5}
              />
            );
          })}

          {/* Tool connection lines: from nearest AI model to tool */}
          {TOOL_ANGLES.map((angle, i) => {
            const tx = CX + TOOL_ORBIT * Math.cos(angle);
            const ty = CY + TOOL_ORBIT * Math.sin(angle);
            const mi = nearestModel(angle);
            const mx = CX + MODEL_ORBIT * Math.cos(AI_MODELS[mi].angle);
            const my = CY + MODEL_ORBIT * Math.sin(AI_MODELS[mi].angle);
            if (frame < 200 + i * 14) return null;
            return (
              <ConnectionLine
                key={`line-tool-${i}`}
                x1={mx} y1={my}
                x2={tx} y2={ty}
                progress={toolLineProgress[i]}
                color={TOOL_COLORS[i]}
                width={2}
                dashed={true}
                dashOffset={dashOffset}
              />
            );
          })}

          {/* MCP center node */}
          <g transform={`scale(${mcpScale})`} style={{ transformOrigin: `${CX}px ${CY}px` }}>
            <g transform={`translate(${CX - CX * mcpScale}, ${CY - CY * mcpScale}) scale(${mcpScale}) translate(${CX * (1 - 1/mcpScale)}, ${CY * (1 - 1/mcpScale)})`}>
            </g>
          </g>
          {/* MCP center drawn without transform trickery */}
          {mcpOpacity > 0 && (() => {
            const s = mcpScale;
            const pts = hexPoints(CX, CY, MCP_R * s);
            const innerPts = hexPoints(CX, CY, MCP_R * 0.6 * s);
            return (
              <g opacity={mcpOpacity}>
                {/* Outer glow */}
                <polygon
                  points={hexPoints(CX, CY, MCP_R * s + 18)}
                  fill="none"
                  stroke={PURPLE}
                  strokeWidth={3}
                  opacity={0.2 + 0.3 * mcpGlow}
                />
                {/* Main hexagon */}
                <polygon
                  points={pts}
                  fill={`${PURPLE}22`}
                  stroke={PURPLE}
                  strokeWidth={3}
                />
                {/* Inner hexagon */}
                <polygon
                  points={innerPts}
                  fill={`${PURPLE}15`}
                  stroke={`${PURPLE}66`}
                  strokeWidth={1.5}
                />
                <text
                  x={CX} y={CY - 10}
                  textAnchor="middle"
                  fontSize={28}
                  fontFamily={MONO}
                  fontWeight="700"
                  fill={PURPLE}
                >
                  MCP
                </text>
                <text
                  x={CX} y={CY + 20}
                  textAnchor="middle"
                  fontSize={18}
                  fontFamily={MONO}
                  fill={`${PURPLE}99`}
                >
                  Server
                </text>
              </g>
            );
          })()}

          {/* AI Model nodes */}
          {AI_MODELS.map((model, i) => {
            const mx = CX + MODEL_ORBIT * Math.cos(model.angle);
            const my = CY + MODEL_ORBIT * Math.sin(model.angle);
            const s = modelSprings[i];
            const nodeR = MODEL_NODE_SIZE / 2;
            if (frame < 80 + i * 18) return null;

            return (
              <g key={`model-${i}`} opacity={Math.min(1, s * 2)}>
                {model.shape === "hex" ? (
                  <>
                    <polygon
                      points={hexPoints(mx, my, nodeR * s + 8)}
                      fill="none"
                      stroke={model.color}
                      strokeWidth={2}
                      opacity={0.25}
                    />
                    <polygon
                      points={hexPoints(mx, my, nodeR * s)}
                      fill={`${model.color}20`}
                      stroke={model.color}
                      strokeWidth={2.5}
                    />
                  </>
                ) : (
                  <>
                    <circle cx={mx} cy={my} r={nodeR * s + 8} fill="none" stroke={model.color} strokeWidth={2} opacity={0.25} />
                    <circle cx={mx} cy={my} r={nodeR * s} fill={`${model.color}20`} stroke={model.color} strokeWidth={2.5} />
                  </>
                )}
                <text
                  x={mx} y={my + 7}
                  textAnchor="middle"
                  fontSize={22}
                  fontFamily={SANS}
                  fontWeight="700"
                  fill={model.color}
                  opacity={s}
                >
                  {model.label}
                </text>
              </g>
            );
          })}

          {/* Tool nodes */}
          {TOOL_ANGLES.map((angle, i) => {
            const tx = CX + TOOL_ORBIT * Math.cos(angle);
            const ty = CY + TOOL_ORBIT * Math.sin(angle);
            const s = toolSprings[i];
            const half = TOOL_NODE_SIZE / 2;
            if (frame < 200 + i * 14) return null;

            return (
              <g key={`tool-${i}`} opacity={Math.min(1, s * 2)}>
                <rect
                  x={tx - half * s} y={ty - half * s}
                  width={TOOL_NODE_SIZE * s} height={TOOL_NODE_SIZE * s}
                  rx={12 * s}
                  fill={`${TOOL_COLORS[i]}18`}
                  stroke={TOOL_COLORS[i]}
                  strokeWidth={2}
                />
                <text
                  x={tx} y={ty - 6}
                  textAnchor="middle"
                  fontSize={18}
                  fontFamily={MONO}
                  fontWeight="600"
                  fill={TOOL_COLORS[i]}
                  opacity={s}
                >
                  {TOOL_LABELS[i]}
                </text>
                <text
                  x={tx} y={ty + 14}
                  textAnchor="middle"
                  fontSize={13}
                  fontFamily={MONO}
                  fill={`${TOOL_COLORS[i]}88`}
                  opacity={s}
                >
                  tool
                </text>
              </g>
            );
          })}

          {/* Outer glow ring (scene 3) */}
          {frame >= 240 && (
            <circle
              cx={CX} cy={CY} r={TOOL_ORBIT + 30}
              fill="none"
              stroke={PURPLE}
              strokeWidth={2}
              opacity={outerPulse * 0.15}
            />
          )}

        </g>
      </svg>

      {/* Bottom label */}
      <div
        style={{
          position: "absolute",
          bottom: 52,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 24,
          color: FG_MUTED,
          letterSpacing: "0.06em",
          opacity: interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}
      >
        full control · works across AI tools
      </div>

      {/* Top label */}
      <div
        style={{
          position: "absolute",
          top: 52,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: SANS,
          fontSize: 38,
          fontWeight: 700,
          color: FG,
          opacity: interpolate(frame, [5, 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          letterSpacing: "-0.01em",
        }}
      >
        Build with MCP directly
      </div>
    </AbsoluteFill>
  );
};
