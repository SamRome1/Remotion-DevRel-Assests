import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { Monitor, Bot } from 'lucide-react';
import { circularFamily } from '../fonts';
import {
  BG, GREEN, FG,
  itp, spSlow,
  DotGrid,
} from '../tokens';

// ─── Timing ──────────────────────────────────────────────────────────────────
// Round 1
const SCENE_IN_START    = 0;
const SCENE_IN_END      = 20;
const LINE_DRAW_START   = 25;
const LINE_DRAW_END     = 65;
const LABEL1_IN_START   = 70;
const LABEL1_IN_END     = 85;

// Round 2
const FADE_OUT_1_START  = 130;
const FADE_OUT_1_END    = 155;
const FADE_IN_2_START   = 160;
const FADE_IN_2_END     = 180;
const LABEL2_IN_START   = 185;
const LABEL2_IN_END     = 200;

// Round 3
const FADE_OUT_2_START  = 250;
const FADE_OUT_2_END    = 275;
const FADE_IN_3_START   = 280;
const FADE_IN_3_END     = 300;
const TASK_IN_START     = 305;
const TASK_IN_END       = 325;
// HOLD_3_END = 390

// Phase 4 — multi-agent
const MULTI_FADE_OUT_START  = 390;
const MULTI_FADE_OUT_END    = 415;
const MULTI_FADE_IN_START   = 420;
const MULTI_FADE_IN_END     = 445;
const AGENTS_APPEAR_START   = 450;
const AGENTS_STAGGER        = 8;
const SPLIT_LINES_START     = 490;
const SPLIT_LINES_STAGGER   = 6;
const SPLIT_LINES_DURATION  = 35;
const MULTI_LABEL_IN_START  = 540;
const MULTI_LABEL_IN_END    = 560;
// total duration: 580

// ─── Layout ──────────────────────────────────────────────────────────────────
const CENTER_X      = 540;
const COMPUTER_Y    = 380;    // icon center Y
const AGENT_Y       = 1300;   // icon center Y
const ICON_SIZE     = 220;
const LINE_START_Y  = COMPUTER_Y + ICON_SIZE / 2 + 20;
const LINE_END_Y    = AGENT_Y - ICON_SIZE / 2 - 20;

// Phase 4 layout
const NUM_AGENTS         = 4;
const AGENT_SPACING      = 1080 / (NUM_AGENTS + 1);
const AGENT_X_POSITIONS  = [1, 2, 3, 4].map(i => i * AGENT_SPACING);
const P2_AGENT_Y         = 1350;
const P2_AGENT_SIZE      = 180;
const SPLIT_LINE_START_Y = COMPUTER_Y + ICON_SIZE / 2 + 20;
const SPLIT_LINE_END_Y   = P2_AGENT_Y - P2_AGENT_SIZE / 2 - 20;

// ─── Local colour aliases ─────────────────────────────────────────────────────
const WHITE_GLOW  = 'rgba(255,255,255,0.2)';
const GREEN_GLOW  = 'rgba(62,207,142,0.4)';
const GREEN_DIM   = 'rgba(62,207,142,0.1)';

// ─── ComputerIcon — Lucide Monitor ───────────────────────────────────────────
const ComputerIcon: React.FC<{ size: number; color: string; glow: string }> = ({
  size, color, glow,
}) => (
  <Monitor
    size={size}
    color={color}
    strokeWidth={1.5}
    style={{ filter: `drop-shadow(0 0 22px ${glow}) drop-shadow(0 0 6px ${glow})` }}
  />
);

// ─── AgentIcon — Lucide Bot ───────────────────────────────────────────────────
const AgentIcon: React.FC<{ size: number; color: string; glow: string; pulse: number }> = ({
  size, color, glow, pulse,
}) => (
  <Bot
    size={size}
    color={color}
    strokeWidth={1.5}
    style={{
      filter: `drop-shadow(0 0 ${22 + pulse * 18}px ${glow}) drop-shadow(0 0 ${6 + pulse * 10}px ${glow})`,
    }}
  />
);

// ─── ConnectionLine ───────────────────────────────────────────────────────────
// Solid glow line with flowing particles. `progress` 0→1 draws the line.
// Once fully drawn (progress = 1), stays drawn. Particles flow during hold phases.
const ConnectionLine: React.FC<{
  progress: number;
  frame: number;
  fps: number;
}> = ({ progress, frame, fps }) => {
  const x = CENTER_X;
  const totalHeight = LINE_END_Y - LINE_START_Y;
  const currentEndY = LINE_START_Y + totalHeight * Math.min(progress, 1);

  const particleOpacity = itp(progress, 0.9, 1);

  // 5 particles spaced evenly, each offset in time
  const OFFSETS = [0, 0.2, 0.4, 0.6, 0.8];
  const particles = OFFSETS.map((offset) => {
    const t = ((frame / fps) * 0.7 + offset) % 1;
    return LINE_START_Y + t * totalHeight;
  });

  if (progress <= 0) return null;

  return (
    <svg
      style={{
        position: "absolute", top: 0, left: 0,
        width: "100%", height: "100%",
        overflow: "visible",
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Glow layer */}
      <line
        x1={x} y1={LINE_START_Y} x2={x} y2={currentEndY}
        stroke={GREEN_GLOW} strokeWidth="18" strokeLinecap="round"
      />
      {/* Solid stroke */}
      <line
        x1={x} y1={LINE_START_Y} x2={x} y2={currentEndY}
        stroke={GREEN} strokeWidth="3" strokeLinecap="round"
      />
      {/* Arrowhead — fades in as line nears its end */}
      <polygon
        points={`${x},${LINE_END_Y + 10} ${x - 20},${LINE_END_Y - 24} ${x + 20},${LINE_END_Y - 24}`}
        fill={GREEN}
        opacity={itp(progress, 0.85, 1)}
        style={{ filter: `drop-shadow(0 0 8px ${GREEN})` }}
      />
      {/* Flowing particles — only visible once line is fully drawn */}
      {particles.map((py, i) => (
        py <= currentEndY && (
          <circle
            key={i}
            cx={x}
            cy={py}
            r={6}
            fill={GREEN}
            opacity={particleOpacity * 0.9}
            style={{ filter: `drop-shadow(0 0 10px ${GREEN})` }}
          />
        )
      ))}
    </svg>
  );
};

// ─── SplitLines ───────────────────────────────────────────────────────────────
const SplitLines: React.FC<{ progresses: number[] }> = ({ progresses }) => (
  <svg
    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}
    xmlns="http://www.w3.org/2000/svg"
  >
    {AGENT_X_POSITIONS.map((agentX, i) => {
      const p = progresses[i];
      if (p <= 0) return null;
      const currentEndX = CENTER_X + (agentX - CENTER_X) * p;
      const currentEndY = SPLIT_LINE_START_Y + (SPLIT_LINE_END_Y - SPLIT_LINE_START_Y) * p;
      const dx = agentX - CENTER_X;
      const dy = SPLIT_LINE_END_Y - SPLIT_LINE_START_Y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / len; const ny = dy / len;
      const arrowSize = 16;
      const perpX = -ny * arrowSize * 0.5; const perpY = nx * arrowSize * 0.5;
      const arrowOpacity = itp(p, 0.85, 1);
      return (
        <g key={i}>
          <line x1={CENTER_X} y1={SPLIT_LINE_START_Y} x2={currentEndX} y2={currentEndY}
            stroke={GREEN_GLOW} strokeWidth="12" strokeLinecap="round" />
          <line x1={CENTER_X} y1={SPLIT_LINE_START_Y} x2={currentEndX} y2={currentEndY}
            stroke={GREEN} strokeWidth="3" strokeLinecap="round" />
          <polygon
            points={`${currentEndX},${currentEndY} ${currentEndX - nx*arrowSize + perpX},${currentEndY - ny*arrowSize + perpY} ${currentEndX - nx*arrowSize - perpX},${currentEndY - ny*arrowSize - perpY}`}
            fill={GREEN} opacity={arrowOpacity}
            style={{ filter: `drop-shadow(0 0 8px ${GREEN})` }}
          />
        </g>
      );
    })}
  </svg>
);

// ─── Main composition ─────────────────────────────────────────────────────────
export const ComputerToAgent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene fade-in (Round 1) ──────────────────────────────────────────────
  const sceneIn = itp(frame, SCENE_IN_START, SCENE_IN_END);

  // Computer spring entrance
  const computerScale = spSlow(frame, SCENE_IN_START);

  // Agent spring entrance (same timing as scene)
  const agentScale = spSlow(frame, SCENE_IN_START);

  // ── Line draw ────────────────────────────────────────────────────────────
  const lineProgress = itp(frame, LINE_DRAW_START, LINE_DRAW_END);

  // ── Pulse for hold phases ────────────────────────────────────────────────
  // Compute a continuous pulse value that works across all hold phases
  const pulseT = frame / fps;
  const rawPulse = Math.sin(pulseT * Math.PI * 1.4) * 0.5 + 0.5;

  // Pulse is only active during hold phases
  const inHold1 = frame >= LABEL1_IN_END && frame < FADE_OUT_1_START;
  const inHold2 = frame >= LABEL2_IN_END && frame < FADE_OUT_2_START;
  const inHold3 = frame >= TASK_IN_END && frame < MULTI_FADE_OUT_START;
  const agentPulse = (inHold1 || inHold2 || inHold3) ? rawPulse : 0;

  // ── Cross-round scene opacity ────────────────────────────────────────────
  // The overall scene (icons + line) fades out/in between rounds.
  // Round 1 → 2 transition
  const fadeOut1 = itp(frame, FADE_OUT_1_START, FADE_OUT_1_END, 1, 0);
  const fadeIn2  = itp(frame, FADE_IN_2_START,  FADE_IN_2_END);
  // Round 2 → 3 transition
  const fadeOut2 = itp(frame, FADE_OUT_2_START, FADE_OUT_2_END, 1, 0);
  const fadeIn3  = itp(frame, FADE_IN_3_START,  FADE_IN_3_END);
  // Round 3 → Phase 4 transition
  const multiFadeOut = itp(frame, MULTI_FADE_OUT_START, MULTI_FADE_OUT_END, 1, 0);
  const multiFadeIn  = itp(frame, MULTI_FADE_IN_START,  MULTI_FADE_IN_END);

  // Combine into a single scene opacity:
  let sceneOpacity: number;
  if (frame < FADE_OUT_1_START) {
    sceneOpacity = sceneIn;
  } else if (frame < FADE_IN_2_START) {
    sceneOpacity = fadeOut1;
  } else if (frame < FADE_OUT_2_START) {
    sceneOpacity = fadeIn2;
  } else if (frame < FADE_IN_3_START) {
    sceneOpacity = fadeOut2;
  } else if (frame < MULTI_FADE_OUT_START) {
    sceneOpacity = fadeIn3;
  } else if (frame < MULTI_FADE_IN_START) {
    sceneOpacity = multiFadeOut;
  } else {
    sceneOpacity = 0; // single-agent scene is fully gone in Phase 4
  }

  // ── Round 1: "Feature" label ─────────────────────────────────────────────
  const label1Opacity = itp(frame, LABEL1_IN_START, LABEL1_IN_END);
  const label1TranslateY = itp(frame, LABEL1_IN_START, LABEL1_IN_END, 40, 0);
  // Label fades out with scene during Round 1 → Round 2 transition
  const label1Visibility = label1Opacity * (frame < FADE_OUT_1_START ? 1 : fadeOut1);

  // ── Round 2: "Bug Fix" label ─────────────────────────────────────────────
  const label2Opacity = itp(frame, LABEL2_IN_START, LABEL2_IN_END);
  const label2TranslateY = itp(frame, LABEL2_IN_START, LABEL2_IN_END, 40, 0);
  // Label fades out with scene during Round 2 → Round 3 transition
  const label2Visibility = label2Opacity * (frame < FADE_OUT_2_START ? 1 : fadeOut2);

  // ── Round 3: task card ───────────────────────────────────────────────────

  const taskCardOpacity = itp(frame, TASK_IN_START, TASK_IN_END);

  // Radial glow behind agent — pulses during hold phases
  const agentGlowOpacity = sceneOpacity * (0.5 + agentPulse * 0.5);

  // The label area Y: just below the agent icon
  const labelAreaTop = AGENT_Y + ICON_SIZE / 2 + 48;

  // ── Phase 4: multi-agent ─────────────────────────────────────────────────
  const multiSceneOpacity = multiFadeIn;  // 0 until MULTI_FADE_IN_START, then 0→1

  // 4 agents spring out from computer center Y to P2_AGENT_Y
  const agentSplitSprings = AGENT_X_POSITIONS.map((_, i) =>
    spring({
      frame: frame - (AGENTS_APPEAR_START + i * AGENTS_STAGGER),
      fps,
      config: { damping: 13, stiffness: 90, mass: 1.0 },
    })
  );
  const agentSplitOpacities = AGENT_X_POSITIONS.map((_, i) =>
    itp(frame, AGENTS_APPEAR_START + i * AGENTS_STAGGER, AGENTS_APPEAR_START + i * AGENTS_STAGGER + 12)
  );
  const agentPositions = AGENT_X_POSITIONS.map((targetX, i) => {
    const sv = agentSplitSprings[i];
    return {
      x: interpolate(sv, [0, 1], [CENTER_X, targetX], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      y: interpolate(sv, [0, 1], [COMPUTER_Y, P2_AGENT_Y], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    };
  });

  const settlePulseT = frame > AGENTS_APPEAR_START ? (frame - AGENTS_APPEAR_START) / fps : 0;
  const agentSettlePulses = AGENT_X_POSITIONS.map((_, i) =>
    Math.max(0, Math.sin(settlePulseT * Math.PI * 1.4 + i * 0.6) * 0.5 + 0.5)
  );

  const splitLineProgresses = AGENT_X_POSITIONS.map((_, i) =>
    itp(frame, SPLIT_LINES_START + i * SPLIT_LINES_STAGGER, SPLIT_LINES_START + i * SPLIT_LINES_STAGGER + SPLIT_LINES_DURATION)
  );

  const multiLabelOpacity = itp(frame, MULTI_LABEL_IN_START, MULTI_LABEL_IN_END);

  // Wide green glow behind the agents zone in Phase 4
  const multiAgentGlowOpacity = itp(frame, AGENTS_APPEAR_START, AGENTS_APPEAR_START + 30);

  return (
    <AbsoluteFill style={{
      background: BG,
      fontFamily: circularFamily,
    }}>
      <DotGrid />

      {/* Radial glow behind Computer icon */}
      <div style={{
        position: "absolute",
        left: CENTER_X - 280,
        top: COMPUTER_Y - 280,
        width: 560,
        height: 560,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
        filter: "blur(90px)",
        opacity: sceneOpacity,
        pointerEvents: "none",
      }} />

      {/* Radial glow behind Agent icon — pulses */}
      <div style={{
        position: "absolute",
        left: CENTER_X - 320,
        top: AGENT_Y - 320,
        width: 640,
        height: 640,
        borderRadius: "50%",
        background: GREEN_DIM,
        filter: "blur(110px)",
        opacity: agentGlowOpacity,
        pointerEvents: "none",
      }} />

      {/* Connection line — fades with scene opacity */}
      <div style={{ position: "absolute", inset: 0, opacity: sceneOpacity }}>
        <ConnectionLine progress={lineProgress} frame={frame} fps={fps} />
      </div>

      {/* Computer icon */}
      <div style={{
        position: "absolute",
        left: 0,
        width: "100%",
        top: COMPUTER_Y - ICON_SIZE / 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: sceneOpacity,
        transform: `scale(${computerScale})`,
        transformOrigin: "center center",
      }}>
        <ComputerIcon size={ICON_SIZE} color={FG} glow={WHITE_GLOW} />
      </div>

      {/* Agent icon */}
      <div style={{
        position: "absolute",
        left: 0,
        width: "100%",
        top: AGENT_Y - ICON_SIZE / 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: sceneOpacity,
        transform: `scale(${agentScale})`,
        transformOrigin: "center center",
      }}>
        <AgentIcon size={ICON_SIZE} color={GREEN} glow={GREEN_GLOW} pulse={agentPulse} />
      </div>

      {/* ── Round 1 label: "Feature" ── */}
      {frame < FADE_IN_2_START && (
        <div style={{
          position: "absolute",
          left: 0,
          width: "100%",
          top: labelAreaTop,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: label1Visibility,
          transform: `translateY(${label1TranslateY}px)`,
        }}>
          <span style={{
            color: GREEN,
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: 4,
            lineHeight: 1,
            textShadow: `0 0 28px ${GREEN}, 0 0 56px rgba(62,207,142,0.4)`,
          }}>
            Feature
          </span>
        </div>
      )}

      {/* ── Round 2 label: "Bug Fix" ── */}
      {frame >= FADE_IN_2_START && frame < FADE_IN_3_START && (
        <div style={{
          position: "absolute",
          left: 0,
          width: "100%",
          top: labelAreaTop,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: label2Visibility,
          transform: `translateY(${label2TranslateY}px)`,
        }}>
          <span style={{
            color: GREEN,
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: 4,
            lineHeight: 1,
            textShadow: `0 0 28px ${GREEN}, 0 0 56px rgba(62,207,142,0.4)`,
          }}>
            Bug Fix
          </span>
        </div>
      )}

      {/* ── Round 3 label: "rename temp → temp2" ── */}
      {frame >= FADE_IN_3_START && frame < MULTI_FADE_IN_START && (
        <div style={{
          position: "absolute",
          left: 0,
          width: "100%",
          top: labelAreaTop,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: taskCardOpacity,
          transform: `translateY(${itp(frame, TASK_IN_START, TASK_IN_END, 40, 0)}px)`,
        }}>
          <span style={{
            color: GREEN,
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: 4,
            lineHeight: 1,
            textShadow: `0 0 28px ${GREEN}, 0 0 56px rgba(62,207,142,0.4)`,
          }}>
            rename temp → temp2
          </span>
        </div>
      )}

      {/* ── Phase 4: multi-agent fan-out ── */}
      {frame >= MULTI_FADE_IN_START && (
        <>
          {/* Wide glow behind agents zone */}
          <div style={{
            position: "absolute", left: 40, top: P2_AGENT_Y - 400,
            width: 1000, height: 700, borderRadius: "50%",
            background: GREEN_DIM, filter: "blur(120px)",
            opacity: multiAgentGlowOpacity * 0.7, pointerEvents: "none",
          }} />

          {/* Split lines */}
          <div style={{ position: "absolute", inset: 0, opacity: multiSceneOpacity }}>
            <SplitLines progresses={splitLineProgresses} />
          </div>

          {/* Computer icon — fades back in at top */}
          <div style={{
            position: "absolute", left: 0, width: "100%",
            top: COMPUTER_Y - ICON_SIZE / 2,
            display: "flex", justifyContent: "center",
            opacity: multiSceneOpacity,
          }}>
            <ComputerIcon size={ICON_SIZE} color={FG} glow={WHITE_GLOW} />
          </div>

          {/* 4 agent icons springing out */}
          {agentPositions.map(({ x, y }, i) => (
            <div key={i} style={{
              position: "absolute",
              left: x - P2_AGENT_SIZE / 2,
              top: y - P2_AGENT_SIZE / 2,
              width: P2_AGENT_SIZE, height: P2_AGENT_SIZE,
              opacity: agentSplitOpacities[i],
            }}>
              <AgentIcon size={P2_AGENT_SIZE} color={GREEN} glow={GREEN_GLOW} pulse={agentSettlePulses[i]} />
            </div>
          ))}

          {/* "Multi-Agent" label */}
          <div style={{
            position: "absolute", left: 0, width: "100%",
            top: P2_AGENT_Y + P2_AGENT_SIZE / 2 + 48,
            display: "flex", justifyContent: "center",
            opacity: multiLabelOpacity,
          }}>
            <span style={{
              color: GREEN, fontSize: 80, fontWeight: 800,
              letterSpacing: 8, lineHeight: 1,
              textShadow: `0 0 28px ${GREEN}, 0 0 60px rgba(62,207,142,0.4)`,
            }}>
              Multi-Agent
            </span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
