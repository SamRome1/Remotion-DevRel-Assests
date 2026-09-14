import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, random, Easing } from 'remotion';
import { FileText, CheckCircle, Search, Settings, Zap } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// "Ninety Percent Wrong" — 1080×1920 vertical, 150 frames @ 30fps (5s).
//
// Fifth scene in the running series (TweetHeardRoundDiscord → NewAgeSparked →
// LoopsToGraphs → NinetyPercentWrong). Same visual world: dark cinematic
// gradient (#0A0A0F → #12121A), all action confined to the top 1080×960 safe
// area, deterministic randomness only. No text anywhere.
//
// Concept — contrast beat: the hero graph got copied badly. Nine miniature
// clones stamp in around it; eight rot (gray, snapped connections, brief red
// X flickers) and settle dim; one stays healthy. The hero itself is the
// untouched reference — no shake/distortion/glitch ever reaches it.
//
// Color: healthy = electric blue #3B82F6 / teal #14B8A6 (carried over).
// NEW to this scene: broken/rotted = dull gray #4B5563, plus brief red X
// flicker accents (#EF4444) — never a second "system" color, just a decay
// state layered on the existing palette.
//
// ── CONTINUITY ───────────────────────────────────────────────────────────────
// Frame 0 must pixel-match LoopsToGraphs's last frame (899): the settled
// 5-node ring+chord "hero" graph (PARTB_NODES/PARTB_EDGES, same seed keys,
// same lucide glyphs) with its halo-pulse and hold-pulse still animating.
// That graph's phase is continued via `gFrame = frame + GRAPH_CONTINUITY_
// OFFSET` where the offset (899) is LoopsToGraphs's own last local frame —
// at frame 0 here, gFrame === 899, so the pulse math evaluates identically
// to how LoopsToGraphs rendered it a moment before the cut. The ambient
// particle field uses the series' longer-lived offset chain, continued here
// as `frame + 1258` (358 + 900, per the accumulated chain through
// LoopsToGraphs's full duration).
// ─────────────────────────────────────────────────────────────────────────────

const FPS = 30;

// ── Layout ───────────────────────────────────────────────────────────────────
const SAFE_W = 1080;
const SAFE_H = 960;
const CENTER_X = SAFE_W / 2;
const CENTER_Y = SAFE_H / 2;
const MARGIN = 100;

// ── Palette (own world — not tokens.ts) ─────────────────────────────────────
const BG_TOP = '#0A0A0F';
const BG_BOTTOM = '#12121A';
const TEAL_ARR = [20, 184, 166];
const BLUE_ARR = [59, 130, 246];
const TEAL_RGB = '20, 184, 166';
// NEW to this scene — broken/rotted state + flicker accent.
const GRAY_ARR = [75, 85, 99]; // #4B5563
const RED_HEX = '#EF4444';

// ── Continuity constants (carried over from LoopsToGraphs) ─────────────────
const PARTICLE_COUNT = 36;
const PARTICLE_CONTINUITY_OFFSET = 1258; // 358 + 900 (accumulated chain through LoopsToGraphs)
const GRAPH_CONTINUITY_OFFSET = 899; // LoopsToGraphs's own last local frame
const PARTB_NODE_COUNT = 5;
const HOLD_PULSE_START = 805; // same constant LoopsToGraphs used for its Part C hold pulses

// ── Timeline ─────────────────────────────────────────────────────────────────
const HERO_SHRINK_END = 20;
const HERO_TARGET_SCALE = 0.42;
const HERO_TARGET_DX = -190;
const HERO_TARGET_DY = -30;

const CLONE_COUNT = 9;
const CLONE_STAMP_START = 20;
const CLONE_STAMP_STAGGER = 4;
const HEALTHY_CLONE_INDEX = 8;
const CLONE_BREAK_BASE = 60;
const CLONE_BREAK_STAGGER = 3;
const CLONE_DIM_HOLD_FRAME = 110;

// ── Helpers ──────────────────────────────────────────────────────────────────
const itp = (
  frame: number,
  inputRange: number[],
  outputRange: number[],
  easing?: (input: number) => number,
): number =>
  interpolate(frame, inputRange, outputRange, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    ...(easing ? { easing } : {}),
  });

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const mixArr = (t: number, a: number[], b: number[]): number[] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const rgbStr = (arr: number[]): string => `${Math.round(arr[0])}, ${Math.round(arr[1])}, ${Math.round(arr[2])}`;

// ── Deterministic ambient particles — identical to LoopsToGraphs/NewAgeSparked/TweetHeardRoundDiscord ──
interface Particle {
  baseX: number;
  baseY: number;
  driftRangeX: number;
  driftRangeY: number;
  driftSpeedX: number;
  driftSpeedY: number;
  phase: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
}

function buildParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    baseX: random(`p-x-${i}`) * SAFE_W,
    baseY: random(`p-y-${i}`) * SAFE_H,
    driftRangeX: 6 + random(`p-drx-${i}`) * 14,
    driftRangeY: 6 + random(`p-dry-${i}`) * 14,
    driftSpeedX: 0.01 + random(`p-dsx-${i}`) * 0.02,
    driftSpeedY: 0.008 + random(`p-dsy-${i}`) * 0.018,
    phase: random(`p-ph-${i}`) * Math.PI * 2,
    size: 1.5 + random(`p-sz-${i}`) * 2.5,
    baseOpacity: 0.03 + random(`p-op-${i}`) * 0.07,
    twinkleSpeed: 0.03 + random(`p-tw-${i}`) * 0.04,
  }));
}

const PARTICLES: Particle[] = buildParticles(PARTICLE_COUNT);

// ── Hero graph — SAME seed keys as LoopsToGraphs's buildPartBNodes/PARTB_EDGES ──
interface PartBNode {
  x: number;
  y: number;
  colorMix: number;
}

function buildPartBNodes(count: number): PartBNode[] {
  return Array.from({ length: count }, (_, i) => {
    const baseAngle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const angleJitter = (random(`pb-aj-${i}`) - 0.5) * 1.0;
    const angle = baseAngle + angleJitter;
    const radius = 180 + random(`pb-r-${i}`) * 260;
    const rawX = CENTER_X + Math.cos(angle) * radius;
    const rawY = CENTER_Y + Math.sin(angle) * radius;
    const x = Math.min(SAFE_W - MARGIN, Math.max(MARGIN, rawX));
    const y = Math.min(SAFE_H - MARGIN, Math.max(MARGIN, rawY));
    const colorMix = random(`pb-c-${i}`);
    return { x, y, colorMix };
  });
}

const PARTB_NODES: PartBNode[] = buildPartBNodes(PARTB_NODE_COUNT);
const ICONS = [FileText, CheckCircle, Search, Settings, Zap];
const PARTB_EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [1, 3]];

function nodeLocal(i: number): { x: number; y: number } {
  return { x: PARTB_NODES[i].x - CENTER_X, y: PARTB_NODES[i].y - CENTER_Y };
}

// ── Clone layout — deterministic loose grid + jitter, staggered stamp/break by index ──
interface CloneLayout {
  x: number;
  y: number;
  scale: number;
  stampFrame: number;
  breakStart: number;
}

function buildClones(count: number): CloneLayout[] {
  return Array.from({ length: count }, (_, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const xBase = 190 + col * 350;
    const yBase = 230 + row * 280;
    const jitterX = (random(`clone-jx-${i}`) - 0.5) * 90;
    const jitterY = (random(`clone-jy-${i}`) - 0.5) * 70;
    const scale = 0.15 + random(`clone-sc-${i}`) * 0.04;
    const stampFrame = CLONE_STAMP_START + i * CLONE_STAMP_STAGGER;
    const breakJitter = Math.round(random(`clone-bjit-${i}`) * 4);
    const breakStart = CLONE_BREAK_BASE + i * CLONE_BREAK_STAGGER + breakJitter;
    return { x: xBase + jitterX, y: yBase + jitterY, scale, stampFrame, breakStart };
  });
}

const CLONES: CloneLayout[] = buildClones(CLONE_COUNT);

export const NinetyPercentWrong: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Continuity: ambient particles + hero graph pulse phase ─────────────
  const pFrame = frame + PARTICLE_CONTINUITY_OFFSET;
  const gFrame = frame + GRAPH_CONTINUITY_OFFSET;

  // ── Hero: shrink + shift left/off-center over 0–20, then hold forever ──
  const heroScale = itp(frame, [0, HERO_SHRINK_END], [1, HERO_TARGET_SCALE], Easing.out(Easing.cubic));
  const heroDX = itp(frame, [0, HERO_SHRINK_END], [0, HERO_TARGET_DX], Easing.out(Easing.cubic));
  const heroDY = itp(frame, [0, HERO_SHRINK_END], [0, HERO_TARGET_DY], Easing.out(Easing.cubic));

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_BOTTOM} 100%)`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: SAFE_W, height: SAFE_H }}>
        {/* Ambient drifting particles — continuous across every scene cut */}
        {PARTICLES.map((p, i) => {
          const x = p.baseX + Math.sin(pFrame * p.driftSpeedX + p.phase) * p.driftRangeX;
          const y = p.baseY + Math.cos(pFrame * p.driftSpeedY + p.phase) * p.driftRangeY;
          const twinkle = 0.6 + 0.4 * Math.sin(pFrame * p.twinkleSpeed + p.phase);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: '#FFFFFF',
                opacity: p.baseOpacity * twinkle,
              }}
            />
          );
        })}

        {/* Clone silhouettes — stamped in staggered by index, most rot, one stays healthy */}
        <svg width={SAFE_W} height={SAFE_H} viewBox={`0 0 ${SAFE_W} ${SAFE_H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
          {CLONES.map((clone, i) => {
            if (frame < clone.stampFrame) return null;
            const isHealthy = i === HEALTHY_CLONE_INDEX;
            const localFrame = frame - clone.stampFrame;
            const pop = spring({ frame: localFrame, fps: FPS, config: { damping: 9, stiffness: 210, mass: 0.4 } });
            // Deliberately unclamped — the overshoot is the "quick scale-bounce" pop-in.
            const appearOpacity = itp(localFrame, [0, 6], [0, 1]);
            const grayT = isHealthy ? 0 : itp(frame, [clone.breakStart, clone.breakStart + 10], [0, 1]);
            const halfT = isHealthy ? 1 : itp(frame, [clone.breakStart, clone.breakStart + 8], [1, 0]);
            const dimT = isHealthy ? 1 : itp(frame, [clone.breakStart + 16, CLONE_DIM_HOLD_FRAME], [1, 0.2]);
            const flickerActive = !isHealthy && frame >= clone.breakStart && frame < clone.breakStart + 10;
            const flickerMul = flickerActive ? 1 - 0.3 * (0.5 + 0.5 * Math.sin(frame * 2.3 + i * 4)) : 1;
            const xEnvelope = isHealthy ? 0 : itp(frame, [clone.breakStart, clone.breakStart + 10, clone.breakStart + 16], [1, 1, 0]);
            const xSquare = Math.sin(frame * 2.9 + i * 5) > 0 ? 1 : 0.15;
            const xOpacity = !isHealthy && frame >= clone.breakStart ? xEnvelope * xSquare : 0;
            const groupOpacity = appearOpacity * dimT * flickerMul;
            const edgeColor = rgbStr(mixArr(grayT, TEAL_ARR, GRAY_ARR));

            return (
              <g key={i} transform={`translate(${clone.x} ${clone.y}) scale(${pop * clone.scale})`} opacity={groupOpacity}>
                {PARTB_EDGES.map(([a, b], j) => {
                  const la = nodeLocal(a);
                  const lb = nodeLocal(b);
                  const mid = { x: (la.x + lb.x) / 2, y: (la.y + lb.y) / 2 };
                  const pa = { x: lerp(la.x, mid.x, halfT), y: lerp(la.y, mid.y, halfT) };
                  const pb = { x: lerp(lb.x, mid.x, halfT), y: lerp(lb.y, mid.y, halfT) };
                  return (
                    <React.Fragment key={j}>
                      <line x1={la.x} y1={la.y} x2={pa.x} y2={pa.y} stroke={`rgba(${edgeColor}, 0.4)`} strokeWidth={2} vectorEffect="non-scaling-stroke" />
                      <line x1={lb.x} y1={lb.y} x2={pb.x} y2={pb.y} stroke={`rgba(${edgeColor}, 0.4)`} strokeWidth={2} vectorEffect="non-scaling-stroke" />
                    </React.Fragment>
                  );
                })}
                {PARTB_NODES.map((n, k) => {
                  const loc = nodeLocal(k);
                  const baseColor = mixArr(n.colorMix, TEAL_ARR, BLUE_ARR);
                  const nodeColor = rgbStr(mixArr(grayT, baseColor, GRAY_ARR));
                  return (
                    <React.Fragment key={k}>
                      <circle cx={loc.x} cy={loc.y} r={60} fill={`rgba(${nodeColor}, 0.25)`} style={{ filter: 'blur(4px)' }} />
                      <circle cx={loc.x} cy={loc.y} r={26} fill={`rgb(${nodeColor})`} />
                    </React.Fragment>
                  );
                })}
                {!isHealthy && (
                  <g opacity={xOpacity}>
                    <line x1={-100} y1={-100} x2={100} y2={100} stroke={RED_HEX} strokeWidth={5} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                    <line x1={-100} y1={100} x2={100} y2={-100} stroke={RED_HEX} strokeWidth={5} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hero graph — the stable reference. Only translate/scale ever touch it; no shake/glitch. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: SAFE_W,
            height: SAFE_H,
            transform: `translate(${heroDX}px, ${heroDY}px) scale(${heroScale})`,
            transformOrigin: `${CENTER_X}px ${CENTER_Y}px`,
          }}
        >
          <svg width={SAFE_W} height={SAFE_H} viewBox={`0 0 ${SAFE_W} ${SAFE_H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
            {PARTB_EDGES.map(([a, b], j) => {
              const na = PARTB_NODES[a];
              const nb = PARTB_NODES[b];
              const dx = nb.x - na.x;
              const dy = nb.y - na.y;
              const len = Math.hypot(dx, dy) || 1;
              const ux = dx / len;
              const uy = dy / len;
              const arrowLen = 10;
              const perpX = -uy;
              const perpY = ux;
              const baseCx = nb.x - ux * arrowLen;
              const baseCy = nb.y - uy * arrowLen;
              const leftX = baseCx + perpX * 4;
              const leftY = baseCy + perpY * 4;
              const rightX = baseCx - perpX * 4;
              const rightY = baseCy - perpY * 4;
              return (
                <React.Fragment key={j}>
                  <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={`rgba(${TEAL_RGB}, 0.4)`} strokeWidth={1.5} />
                  <polygon points={`${nb.x},${nb.y} ${leftX},${leftY} ${rightX},${rightY}`} fill={`rgba(${TEAL_RGB}, 0.7)`} />
                </React.Fragment>
              );
            })}

            {/* Hold pulses — calm, continuous, staggered per edge (phase carried via gFrame) */}
            {PARTB_EDGES.map(([a, b], j) => {
              const na = PARTB_NODES[a];
              const nb = PARTB_NODES[b];
              const period = 44 + j * 6;
              const t = (((gFrame - HOLD_PULSE_START) + j * 7) % period) / period;
              const brightness = Math.sin(t * Math.PI);
              const x = lerp(na.x, nb.x, t);
              const y = lerp(na.y, nb.y, t);
              return <circle key={`hold-${j}`} cx={x} cy={y} r={4} fill="#FFFFFF" opacity={0.2 + brightness * 0.6} />;
            })}
          </svg>

          {PARTB_NODES.map((target, i) => {
            const pulsePeriod = 46 + i * 9;
            const pulsePhase = i * 13;
            const pulseVal = 0.5 + 0.5 * Math.sin((2 * Math.PI * (gFrame - pulsePhase)) / pulsePeriod);
            const color = rgbStr(mixArr(target.colorMix, TEAL_ARR, BLUE_ARR));
            const Icon = ICONS[i % ICONS.length];
            const haloOpacity = 0.22 + pulseVal * 0.2;
            const haloRadius = 26 + pulseVal * 10;
            return (
              <div key={i} style={{ position: 'absolute', left: target.x, top: target.y, width: 0, height: 0 }}>
                <div
                  style={{
                    position: 'absolute',
                    left: -haloRadius,
                    top: -haloRadius,
                    width: haloRadius * 2,
                    height: haloRadius * 2,
                    borderRadius: '50%',
                    background: `rgba(${color}, ${haloOpacity})`,
                    filter: 'blur(10px)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: -32,
                    top: -32,
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'rgba(20,20,28,0.85)',
                    border: `1.5px solid rgba(${color}, 0.7)`,
                    boxShadow: `0 0 ${14 + pulseVal * 10}px rgba(${color}, 0.35)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={26} color={`rgb(${color})`} strokeWidth={1.5} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
