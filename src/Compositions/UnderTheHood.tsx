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
const SURFACE = "#1e2130";
const FG = "rgba(255,255,255,0.92)";
const FG_MUTED = "rgba(255,255,255,0.45)";
const AMBER = "#f59e0b";
const SANS = "system-ui, -apple-system, sans-serif";
const MONO = '"JetBrains Mono", ui-monospace, monospace';

// Gear SVG drawn as inline paths — 3 interlocking gears
const Gear: React.FC<{
  cx: number;
  cy: number;
  r: number;
  teeth: number;
  color: string;
  rotation: number;
}> = ({ cx, cy, r, teeth, color, rotation }) => {
  const toothDepth = r * 0.35;
  const innerR = r * 0.55;
  const holeR = r * 0.22;
  const points: string[] = [];

  for (let i = 0; i < teeth * 2; i++) {
    const angle = (i / (teeth * 2)) * Math.PI * 2 + (rotation * Math.PI) / 180;
    const radius = i % 2 === 0 ? r + toothDepth : r;
    points.push(
      `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`
    );
  }

  const innerPoints: string[] = [];
  for (let i = 0; i < 32; i++) {
    const angle = (i / 32) * Math.PI * 2;
    innerPoints.push(
      `${cx + Math.cos(angle) * innerR},${cy + Math.sin(angle) * innerR}`
    );
  }

  const holePoints: string[] = [];
  for (let i = 0; i < 32; i++) {
    const angle = (i / 32) * Math.PI * 2;
    holePoints.push(
      `${cx + Math.cos(angle) * holeR},${cy + Math.sin(angle) * holeR}`
    );
  }

  return (
    <g>
      <polygon
        points={points.join(" ")}
        fill={color}
        opacity={0.85}
      />
      <polygon
        points={holePoints.join(" ")}
        fill={SURFACE}
      />
    </g>
  );
};

const GearGroup: React.FC<{ opacity: number; baseRotation: number }> = ({
  opacity,
  baseRotation,
}) => {
  return (
    <svg
      width="280"
      height="220"
      viewBox="0 0 280 220"
      style={{ opacity }}
    >
      {/* Large center gear */}
      <Gear
        cx={140}
        cy={110}
        r={62}
        teeth={12}
        color={AMBER}
        rotation={baseRotation}
      />
      {/* Small top-right gear */}
      <Gear
        cx={222}
        cy={55}
        r={34}
        teeth={8}
        color={`${AMBER}cc`}
        rotation={-baseRotation * 1.8}
      />
      {/* Small bottom-left gear */}
      <Gear
        cx={58}
        cy={168}
        r={34}
        teeth={8}
        color={`${AMBER}cc`}
        rotation={-baseRotation * 1.8}
      />
    </svg>
  );
};

export const UnderTheHood: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene 1: Boxes spring in (0–90f)
  const mcpSlide = spring({ frame, fps, from: -600, to: 0, config: { damping: 22, stiffness: 120 } });
  const connSlide = spring({ frame, fps, from: 600, to: 0, config: { damping: 22, stiffness: 120 } });

  // Scene 2: Lid lifts (90–180f)
  const lidFrame = Math.max(0, frame - 90);
  const lidLift = spring({ frame: lidFrame, fps, from: 0, to: 1, config: { damping: 18, stiffness: 100 } });
  const lidTranslateY = interpolate(lidLift, [0, 1], [0, -160]);
  const innerReveal = interpolate(lidLift, [0.3, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Dashed arc progress
  const arcProgress = interpolate(frame, [120, 175], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Scene 3: Lid closes, glows appear (180–270f)
  const closeFrame = Math.max(0, frame - 180);
  const lidClose = spring({ frame: closeFrame, fps, from: 0, to: 1, config: { damping: 20, stiffness: 90 } });
  const lidFinalY = frame >= 180 ? interpolate(lidClose, [0, 1], [-160, 0]) : lidTranslateY;

  // Use lidFinalY for scene 3, lidTranslateY for scene 2
  const actualLidY = frame >= 180 ? lidFinalY : lidTranslateY;

  // Glow intensities
  const mcpGlow = interpolate(frame, [185, 230], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const connGlow = interpolate(frame, [190, 235], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Equals sign
  const equalsOpacity = interpolate(frame, [215, 250], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const equalsFrame = Math.max(0, frame - 215);
  const equalsScale = spring({ frame: equalsFrame, fps, from: 0, to: 1, config: { damping: 14, stiffness: 140 } });

  // Gear rotation based on frame
  const gearRotation = (frame * 1.2) % 360;

  // Box dimensions
  const BOX_W = 420;
  const BOX_H = 380;
  const GAP = 60;
  const TOTAL_W = BOX_W * 2 + GAP;
  const LEFT_X = (1080 - TOTAL_W) / 2;
  const RIGHT_X = LEFT_X + BOX_W + GAP;
  const BOX_Y = (1080 - BOX_H) / 2;

  // Arc path from MCP gears center to Connector inner gears center
  // MCP box center: LEFT_X + BOX_W/2, BOX_Y + BOX_H/2
  // Connector inner center: RIGHT_X + BOX_W/2, BOX_Y + BOX_H/2
  const arcStartX = LEFT_X + BOX_W / 2 + 140;
  const arcStartY = BOX_Y + BOX_H / 2;
  const arcEndX = RIGHT_X + BOX_W / 2 - 140;
  const arcEndY = BOX_Y + BOX_H / 2;
  const arcMidX = (arcStartX + arcEndX) / 2;
  const arcMidY = BOX_Y + BOX_H / 2 - 80;

  const ARC_TOTAL_LENGTH = 320;
  const arcDash = arcProgress * ARC_TOTAL_LENGTH;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: SANS, overflow: "hidden" }}>
      {/* MCP Box */}
      <div
        style={{
          position: "absolute",
          left: LEFT_X + mcpSlide,
          top: BOX_Y,
          width: BOX_W,
          height: BOX_H,
          border: `2px dashed ${AMBER}66`,
          borderRadius: 20,
          backgroundColor: "#13150f",
          boxShadow: mcpGlow > 0
            ? `0 0 ${60 * mcpGlow}px ${40 * mcpGlow}px ${AMBER}33, inset 0 0 ${30 * mcpGlow}px ${AMBER}15`
            : "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <GearGroup opacity={1} baseRotation={gearRotation} />
        <div
          style={{
            fontFamily: MONO,
            fontSize: 32,
            fontWeight: 700,
            color: AMBER,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          MCP
        </div>
        <div style={{ fontFamily: MONO, fontSize: 18, color: FG_MUTED, letterSpacing: "0.06em" }}>
          protocol
        </div>
      </div>

      {/* Connector Box */}
      <div
        style={{
          position: "absolute",
          left: RIGHT_X + connSlide,
          top: BOX_Y,
          width: BOX_W,
          height: BOX_H,
          border: `2px solid rgba(255,255,255,0.5)`,
          borderRadius: 20,
          background: `radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.07) 0%, ${SURFACE} 70%)`,
          boxShadow: connGlow > 0
            ? `0 0 ${70 * connGlow}px ${50 * connGlow}px rgba(255,255,255,0.12), inset 0 0 ${40 * connGlow}px rgba(255,255,255,0.06)`
            : "none",
          overflow: "hidden",
          clipPath: "inset(0 0 0 0 round 20px)",
        }}
      >
        {/* Lid (top portion) */}
        <div
          style={{
            position: "absolute",
            top: actualLidY,
            left: 0,
            right: 0,
            height: BOX_H * 0.42,
            background: `linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)`,
            borderBottom: `1px solid rgba(255,255,255,0.2)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontFamily: SANS,
              fontSize: 32,
              fontWeight: 700,
              color: FG,
              letterSpacing: "0.04em",
            }}
          >
            Connector
          </div>
        </div>

        {/* Inner contents revealed when lid lifts */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: BOX_H * 0.6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            opacity: innerReveal,
          }}
        >
          <GearGroup opacity={0.75} baseRotation={gearRotation} />
          <div
            style={{
              fontFamily: MONO,
              fontSize: 22,
              color: `${AMBER}99`,
              letterSpacing: "0.1em",
            }}
          >
            MCP
          </div>
        </div>
      </div>

      {/* Dashed arc connecting gears (scene 2) */}
      {frame >= 115 && frame < 185 && (
        <svg
          style={{ position: "absolute", top: 0, left: 0, width: 1080, height: 1080, pointerEvents: "none" }}
        >
          <path
            d={`M ${arcStartX} ${arcStartY} Q ${arcMidX} ${arcMidY} ${arcEndX} ${arcEndY}`}
            fill="none"
            stroke={`${AMBER}88`}
            strokeWidth={3}
            strokeDasharray={`${arcDash} ${ARC_TOTAL_LENGTH}`}
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Equals sign between boxes (scene 3) */}
      {frame >= 215 && (
        <div
          style={{
            position: "absolute",
            left: LEFT_X + BOX_W + GAP / 2 - 30,
            top: BOX_Y + BOX_H / 2 - 30,
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: equalsOpacity,
            transform: `scale(${equalsScale})`,
          }}
        >
          <svg width="56" height="40" viewBox="0 0 56 40">
            <rect x="4" y="8" width="48" height="8" rx="4" fill={FG} />
            <rect x="4" y="24" width="48" height="8" rx="4" fill={FG} />
          </svg>
        </div>
      )}

      {/* Bottom label */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 22,
          color: FG_MUTED,
          letterSpacing: "0.06em",
          opacity: interpolate(frame, [30, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}
      >
        same technology · different interface
      </div>
    </AbsoluteFill>
  );
};
