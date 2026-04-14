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
const EMERALD = "#10b981";
const SANS = "system-ui, -apple-system, sans-serif";
const MONO = '"JetBrains Mono", ui-monospace, monospace';

// Tool brand configs
const TOOLS = [
  { name: "Notion", color: "#e2e0dc", dotColor: "#191919", bg: "#1a1a1a" },
  { name: "Linear", color: "#8b9cf4", dotColor: "#5E6AD2", bg: "#1a1b2e" },
  { name: "Supabase", color: "#3ecf8e", dotColor: "#3ecf8e", bg: "#0f1a14" },
];

// Claude hexagon
const ClaudeHex: React.FC<{ size: number; opacity: number; scale: number }> = ({ size, opacity, scale }) => {
  const r = size / 2;
  const cx = r;
  const cy = r;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${cx + r * 0.92 * Math.cos(a)},${cy + r * 0.92 * Math.sin(a)}`;
  }).join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ opacity, transform: `scale(${scale})`, transformOrigin: "center" }}
    >
      <polygon points={pts} fill="#E57C2D" />
      {/* Inner decorative hexagon */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        return `${cx + r * 0.55 * Math.cos(a)},${cy + r * 0.55 * Math.sin(a)}`;
      }).join(" ")}
      <polygon
        points={Array.from({ length: 6 }, (_, i) => {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          return `${cx + r * 0.55 * Math.cos(a)},${cy + r * 0.55 * Math.sin(a)}`;
        }).join(" ")}
        fill="rgba(0,0,0,0.25)"
      />
      <text
        x={cx}
        y={cy + 6}
        textAnchor="middle"
        fontSize={size * 0.22}
        fontFamily={SANS}
        fontWeight="800"
        fill="rgba(255,255,255,0.9)"
      >
        Claude
      </text>
    </svg>
  );
};

// Lightning bolt SVG
const Lightning: React.FC<{ size: number; color: string; opacity: number; scale: number }> = ({
  size, color, opacity, scale,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ opacity, transform: `scale(${scale})`, transformOrigin: "center" }}
  >
    <path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      fill={color}
    />
  </svg>
);

// Checkmark SVG
const Checkmark: React.FC<{ size: number; opacity: number; scale: number }> = ({ size, opacity, scale }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ opacity, transform: `scale(${scale})`, transformOrigin: "center" }}
  >
    <circle cx="12" cy="12" r="11" fill={EMERALD} opacity={0.2} />
    <path
      d="M5 12l5 5 9-9"
      stroke={EMERALD}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const ZeroSetup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Layout constants — fill the 1080×1080 canvas
  const CLAUDE_X = 100;
  const CLAUDE_Y = 1080 / 2 - 90;
  const CLAUDE_SIZE = 180;

  const TOOL_X = 700;
  const TOOL_W = 280;
  const TOOL_H = 90;
  const TOOL_GAP = 30;
  const TOOLS_TOTAL_H = TOOLS.length * TOOL_H + (TOOLS.length - 1) * TOOL_GAP;
  const TOOLS_START_Y = 1080 / 2 - TOOLS_TOTAL_H / 2;

  const PILL_CX = 540;
  const PILL_Y = 1080 / 2 - 40;
  const PILL_W = 260;
  const PILL_H = 80;

  // Scene 1 (0–60f): Claude + tools appear
  const claudeScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 18, stiffness: 120 } });
  const claudeOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const toolSprings = TOOLS.map((_, i) => {
    const delay = i * 14;
    return spring({ frame: Math.max(0, frame - delay), fps, from: 0, to: 1, config: { damping: 18, stiffness: 110 } });
  });

  // Scene 2 (60–150f): Connector pill + lines
  const pillFrame = Math.max(0, frame - 60);
  const pillScale = spring({ frame: pillFrame, fps, from: 0, to: 1, config: { damping: 16, stiffness: 130 } });
  const pillOpacity = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Line draw progress for each segment
  // Claude -> Pill: frames 75–105
  const lineLeftProgress = interpolate(frame, [75, 108], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // Pill -> each tool: staggered
  const lineRightProgress = TOOLS.map((_, i) =>
    interpolate(frame, [100 + i * 14, 132 + i * 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  );

  // Tool border glow: lights up when line reaches it
  const toolLit = TOOLS.map((_, i) =>
    interpolate(frame, [128 + i * 14, 148 + i * 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  );

  // Scene 3 (150–240f): checkmarks + pill pulse + lightning
  const lightningFrame = Math.max(0, frame - 155);
  const lightningScale = spring({ frame: lightningFrame, fps, from: 0, to: 1, config: { damping: 12, stiffness: 200 } });
  const lightningOpacity = interpolate(frame, [155, 175], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const pillPulse = spring({ frame: Math.max(0, frame - 160), fps, from: 1, to: 1.06, config: { damping: 8, stiffness: 180 } });
  // Oscillate pill scale after frame 160
  const pillPulseActual = frame >= 160 ? pillPulse : 1;

  const checkSprings = TOOLS.map((_, i) => {
    const delay = 155 + i * 20;
    const f = Math.max(0, frame - delay);
    return {
      scale: spring({ frame: f, fps, from: 0, to: 1, config: { damping: 14, stiffness: 160 } }),
      opacity: interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    };
  });

  // Animated dash offset for lines
  const dashOffset = -(frame * 3) % 24;

  // Tool center Y positions
  const toolCenterYs = TOOLS.map((_, i) => TOOLS_START_Y + i * (TOOL_H + TOOL_GAP) + TOOL_H / 2);

  // Pill center
  const pillCX = PILL_CX;
  const pillCY = PILL_Y + PILL_H / 2;

  // Claude right edge
  const claudeRightX = CLAUDE_X + CLAUDE_SIZE;
  const claudeCY = CLAUDE_Y + CLAUDE_SIZE / 2;

  // Pill left/right edges
  const pillLeftX = pillCX - PILL_W / 2;
  const pillRightX = pillCX + PILL_W / 2;

  // Tool left edge
  const toolLeftX = TOOL_X;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: SANS, overflow: "hidden" }}>
      {/* SVG layer for connection lines */}
      <svg
        style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 1080, pointerEvents: "none" }}
      >
        {/* Claude -> Pill line */}
        {frame >= 75 && (
          <line
            x1={claudeRightX}
            y1={claudeCY}
            x2={claudeRightX + (pillLeftX - claudeRightX) * lineLeftProgress}
            y2={claudeCY + (pillCY - claudeCY) * lineLeftProgress}
            stroke={`${EMERALD}cc`}
            strokeWidth={3}
            strokeDasharray="8 6"
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        )}

        {/* Pill -> each tool lines */}
        {TOOLS.map((_, i) => {
          const progress = lineRightProgress[i];
          const tcy = toolCenterYs[i];
          if (frame < 100 + i * 14) return null;
          return (
            <line
              key={i}
              x1={pillRightX}
              y1={pillCY}
              x2={pillRightX + (toolLeftX - pillRightX) * progress}
              y2={pillCY + (tcy - pillCY) * progress}
              stroke={`${EMERALD}cc`}
              strokeWidth={3}
              strokeDasharray="8 6"
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Claude logo */}
      <div
        style={{
          position: "absolute",
          left: CLAUDE_X,
          top: CLAUDE_Y,
          width: CLAUDE_SIZE,
          height: CLAUDE_SIZE,
        }}
      >
        <ClaudeHex size={CLAUDE_SIZE} opacity={claudeOpacity} scale={claudeScale} />
      </div>

      {/* "Claude" label below */}
      <div
        style={{
          position: "absolute",
          left: CLAUDE_X,
          top: CLAUDE_Y + CLAUDE_SIZE + 16,
          width: CLAUDE_SIZE,
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 22,
          color: FG_MUTED,
          opacity: claudeOpacity,
        }}
      >
        Claude
      </div>

      {/* Connector pill */}
      <div
        style={{
          position: "absolute",
          left: pillCX - PILL_W / 2,
          top: PILL_Y,
          width: PILL_W,
          height: PILL_H,
          borderRadius: PILL_H / 2,
          backgroundColor: `${EMERALD}18`,
          border: `2px solid ${EMERALD}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: pillOpacity,
          transform: `scale(${frame >= 160 ? pillPulseActual : pillScale})`,
          transformOrigin: "center",
          boxShadow: `0 0 32px 8px ${EMERALD}33`,
        }}
      >
        <span
          style={{
            fontFamily: SANS,
            fontSize: 28,
            fontWeight: 700,
            color: EMERALD,
            letterSpacing: "0.02em",
          }}
        >
          Connector
        </span>
      </div>

      {/* Lightning bolt */}
      {frame >= 155 && (
        <div
          style={{
            position: "absolute",
            left: pillCX - PILL_W / 2 - 60,
            top: PILL_Y - 20,
          }}
        >
          <Lightning size={52} color={EMERALD} opacity={lightningOpacity} scale={lightningScale} />
        </div>
      )}

      {/* Tool cards */}
      {TOOLS.map((tool, i) => {
        const ty = TOOLS_START_Y + i * (TOOL_H + TOOL_GAP);
        const litAmount = toolLit[i];
        const toolSlide = toolSprings[i];

        return (
          <div
            key={tool.name}
            style={{
              position: "absolute",
              left: TOOL_X,
              top: ty,
              width: TOOL_W,
              height: TOOL_H,
              borderRadius: 16,
              backgroundColor: tool.bg,
              border: `2px solid ${litAmount > 0.01 ? EMERALD : "rgba(255,255,255,0.1)"}`,
              boxShadow: litAmount > 0
                ? `0 0 ${24 * litAmount}px ${12 * litAmount}px ${EMERALD}33`
                : "none",
              display: "flex",
              alignItems: "center",
              paddingLeft: 24,
              gap: 16,
              opacity: toolSlide,
              transform: `translateX(${(1 - toolSlide) * 40}px)`,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: tool.dotColor,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: SANS,
                fontSize: 28,
                fontWeight: 600,
                color: tool.color,
              }}
            >
              {tool.name}
            </span>

            {/* Checkmark overlay */}
            {frame >= 155 + i * 20 && (
              <div style={{ marginLeft: "auto", marginRight: 20 }}>
                <Checkmark
                  size={40}
                  opacity={checkSprings[i].opacity}
                  scale={checkSprings[i].scale}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Zero setup label */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 24,
          color: FG_MUTED,
          letterSpacing: "0.06em",
          opacity: interpolate(frame, [20, 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}
      >
        zero setup · instant access
      </div>

      {/* Top label */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: SANS,
          fontSize: 36,
          fontWeight: 700,
          color: FG,
          opacity: interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}
      >
        Connector
      </div>
    </AbsoluteFill>
  );
};
