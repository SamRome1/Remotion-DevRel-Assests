import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { BG, GREEN, MONO, DotGrid } from '../tokens';
import { circularFamily } from '../fonts';
import { Bot } from 'lucide-react';

// ── Path helper ───────────────────────────────────────────────────────────────

function pi(kf: [number, number][], frame: number): number {
  return interpolate(frame, kf.map((k) => k[0]), kf.map((k) => k[1]), {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

// ── Layout ────────────────────────────────────────────────────────────────────
// Canvas 1280×1080. Agents slide in from off-screen corners.
// They meet near center, burst, scatter to sides, drift back, collide again.
//
// Collision timing: icons are 192px. Agents first visually overlap when
// centre-to-centre distance ≈ 192px. Bursts fire at those frames.
//
//   Collision 1 (agents 0 & 1, horizontal approach): frame 80
//   Collision 2 (agents 2 & 3, horizontal approach): frame 84
//   Collision 3 (all four pile up again):            frame 181

const AGENTS = [
  {
    label: 'write code',
    color: GREEN,
    glow: 'rgba(62,207,142,0.7)',
    // top-left → centre → left-mid → centre → scatter
    xPath: [[0,-80],[85,590],[120,430],[158,240],[182,550],[210,220]] as [number,number][],
    yPath: [[0, 80],[85,400],[120,380],[158,490],[182,510],[210,360]] as [number,number][],
  },
  {
    label: 'read files',
    color: '#64B5F6',
    glow: 'rgba(100,181,246,0.7)',
    // top-right → centre → right-mid → centre → scatter
    xPath: [[0,1360],[85,690],[120,850],[158,1040],[182,730],[210,1060]] as [number,number][],
    yPath: [[0,  80],[85,400],[120,380],[158,490],[182,510],[210, 360]] as [number,number][],
  },
  {
    label: 'call API',
    color: '#FFB74D',
    glow: 'rgba(255,183,77,0.7)',
    // bottom-left → centre → left-mid → centre → scatter
    xPath: [[0,-80],[90,590],[125,430],[160,240],[182,550],[210,220]] as [number,number][],
    yPath: [[0,1000],[90,680],[125,700],[160,590],[182,570],[210,720]] as [number,number][],
  },
  {
    label: 'run tests',
    color: '#CE93D8',
    glow: 'rgba(206,147,216,0.7)',
    // bottom-right → centre → right-mid → centre → scatter
    xPath: [[0,1360],[90,690],[125,850],[160,1040],[182,730],[210,1060]] as [number,number][],
    yPath: [[0,1000],[90,680],[125,700],[160,590],[182,570],[210, 720]] as [number,number][],
  },
];

// ── Collision bursts ──────────────────────────────────────────────────────────

const COLLISIONS: { frame: number; x: number; y: number }[] = [
  { frame: 80,  x: 640, y: 400 },
  { frame: 84,  x: 640, y: 680 },
  { frame: 181, x: 640, y: 540 },
];

// ── Burst ─────────────────────────────────────────────────────────────────────

const Burst: React.FC<{ cx: number; cy: number; startFrame: number }> = ({ cx, cy, startFrame }) => {
  const frame = useCurrentFrame();
  const e = frame - startFrame;
  if (e < 0 || e > 30) return null;

  const ring1Scale   = interpolate(e, [0, 30], [0.1, 4.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ring1Opacity = interpolate(e, [0, 3, 30], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ring2Scale   = interpolate(e, [0, 20], [0.1, 2.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ring2Opacity = interpolate(e, [0, 3, 20], [0, 0.6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const flashOpacity = interpolate(e, [0, 2, 12], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pDist        = interpolate(e, [0, 30], [0, 130], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pOpacity     = interpolate(e, [0, 4, 30], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', left: cx, top: cy, pointerEvents: 'none' }}>
      {/* outer ring */}
      <div style={{
        position: 'absolute', width: 60, height: 60, borderRadius: '50%',
        border: '1.5px solid rgba(255,255,255,0.9)',
        transform: `translate(-50%,-50%) scale(${ring1Scale})`,
        opacity: ring1Opacity,
      }} />
      {/* inner ring */}
      <div style={{
        position: 'absolute', width: 60, height: 60, borderRadius: '50%',
        border: '1.5px solid rgba(255,255,255,0.6)',
        transform: `translate(-50%,-50%) scale(${ring2Scale})`,
        opacity: ring2Opacity,
      }} />
      {/* flash */}
      <div style={{
        position: 'absolute', width: 120, height: 120, borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.45)',
        transform: 'translate(-50%,-50%)',
        opacity: flashOpacity,
        filter: 'blur(16px)',
      }} />
      {/* 8 particles */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <div key={angle} style={{
            position: 'absolute', width: 6, height: 6, borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.95)',
            transform: `translate(calc(-50% + ${Math.cos(rad) * pDist}px), calc(-50% + ${Math.sin(rad) * pDist}px))`,
            opacity: pOpacity,
          }} />
        );
      })}
    </div>
  );
};

// ── Agent node ────────────────────────────────────────────────────────────────

const AgentNode: React.FC<{
  x: number; y: number; color: string; glow: string; label: string; opacity: number; wobblePhase: number;
}> = ({ x, y, color, glow, label, opacity, wobblePhase }) => (
  <div style={{
    position: 'absolute',
    left: x + Math.sin(wobblePhase * 0.18) * 4,
    top:  y + Math.cos(wobblePhase * 0.22) * 4,
    transform: 'translate(-50%,-50%)',
    opacity,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
    pointerEvents: 'none',
  }}>
    <div style={{ filter: `drop-shadow(0 0 28px ${glow}) drop-shadow(0 0 10px ${glow})` }}>
      <Bot size={192} color={color} strokeWidth={1.5} />
    </div>
    <span style={{
      fontFamily: MONO, fontSize: 18, color, letterSpacing: 2,
      textTransform: 'uppercase', opacity: 0.75, whiteSpace: 'nowrap',
      textShadow: `0 0 14px ${glow}`,
    }}>
      {label}
    </span>
  </div>
);

// ── Composition ───────────────────────────────────────────────────────────────

export const AgentCollision: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden', fontFamily: circularFamily }}>
      <DotGrid />

      {COLLISIONS.map((c, i) => (
        <Burst key={i} cx={c.x} cy={c.y} startFrame={c.frame} />
      ))}

      {AGENTS.map((agent, i) => (
        <AgentNode
          key={i}
          x={pi(agent.xPath, frame)}
          y={pi(agent.yPath, frame)}
          color={agent.color}
          glow={agent.glow}
          label={agent.label}
          opacity={fadeIn}
          wobblePhase={frame + i * 20}
        />
      ))}
    </AbsoluteFill>
  );
};
