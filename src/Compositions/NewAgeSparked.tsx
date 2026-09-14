import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, spring, random, Easing } from 'remotion';

// ─────────────────────────────────────────────────────────────────────────────
// "New Age Sparked" — 1080×1920 vertical, 150 frames @ 30fps.
//
// Third scene in the series, the payoff of TweetHeardRoundDiscord: the
// tweet's idea detonates outward and resolves into a clean node/graph
// network — the "graphs" language from the tweet, literalized as the visual
// paradigm shift (loops → graphs). Same visual world as scenes 1–2 (own
// palette, not tokens.ts): dark cinematic gradient (#0A0A0F → #12121A),
// electric-blue / teal accents, all action confined to the top 1080×960 safe
// area, no added text anywhere, deterministic randomness only.
//
// ── CONTINUITY ───────────────────────────────────────────────────────────────
// Frame 0 must match the END state of TweetHeardRoundDiscord exactly so the
// cut is invisible:
//   - tweet screenshot at TWEET_WIDTH 760, scale 1.05 (its settled zoomScale),
//     centered in the safe area, fully opaque, highlight fully revealed.
//   - same ambient particle field (identical buildParticles logic/seeds),
//     phase-continued via CONTINUITY_FRAME_OFFSET so the grain doesn't jump.
// The one thing that ISN'T carried over verbatim: TweetHeardRoundDiscord's
// one-shot border-glow pulse (frames 65–120) has already fully decayed back
// to 0 by its last frame, so this file's "still glowing softly" carry-over
// glow deliberately starts at exactly 0 at frame 0 and ramps up from there —
// it's a new glow, not a continuation, so the frame-0 pixels still match.
// ─────────────────────────────────────────────────────────────────────────────

const FPS = 30;

// ── Layout ───────────────────────────────────────────────────────────────────
const SAFE_W = 1080;
const SAFE_H = 960;
const CENTER_X = SAFE_W / 2;
const CENTER_Y = SAFE_H / 2;
const MARGIN = 100;

// ── Continuity constants — copied from TweetHeardRoundDiscord.tsx ──────────
const TWEET_WIDTH = 760;
const CARRY_SCALE = 1.05; // == that file's settled zoomScale at frame 209
const CARRY_SHADOW_BASE = '0 30px 70px rgba(0,0,0,0.6)'; // == its shadowIntensity=1 depth shadow
const HIGHLIGHT_TOP_PCT = 34.5;
const HIGHLIGHT_LEFT_PCT = 1.7;
const HIGHLIGHT_WIDTH_PCT = 72;
const HIGHLIGHT_HEIGHT_PCT = 10;
const PARTICLE_COUNT = 36;
// TweetHeardRoundDiscord is 210 frames (indices 0–209); offsetting this
// file's frame by its last index continues the same deterministic drift/
// twinkle formulas exactly where that composition left off.
const CONTINUITY_FRAME_OFFSET = 209;

// ── Palette (same world as scenes 1–2 — not tokens.ts) ──────────────────────
const BG_TOP = '#0A0A0F';
const BG_BOTTOM = '#12121A';
const TEAL_RGB = '20, 184, 166';
const BLUE_RGB = '59, 130, 246';
const TEAL_ARR = [20, 184, 166];
const BLUE_ARR = [59, 130, 246];

// ── Timeline (frames @ 30fps) ───────────────────────────────────────────────
const HOLD_END = 15; // 0–15 carry-over hold
const IGNITE_START = 15;
const IGNITE_PEAK = 30;
const IGNITE_FADE_END = 38;
const FADE_END = 35; // tweet opacity 1 → 0 over [IGNITE_START, FADE_END]
const FLASH_START = 34;
const FLASH_END = 41;
const BLOOM_START = 35;
const BLOOM_PEAK = 42;
const BLOOM_END = 58;
const LAUNCH_START = 36; // embers + node-particles both launch here
const EMBER_FADE_START = 50;
const EMBER_FADE_END = 80;
const NODE_FLIGHT_BASE_END = 68;
const NODE_ARRIVAL_JITTER_MAX = 6; // ± frames
const EDGE_DRAW_START = 76;
const EDGE_STAGGER = 4;
const EDGE_DRAW_DURATION = 14;
const PULSE_PERIOD = 48;

const NODE_COUNT = 7;
const EMBER_COUNT = 9;

// Clamped interpolate — the default for this file (same pattern as scenes 1–2).
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

const mixColor = (t: number): string =>
  `${Math.round(lerp(TEAL_ARR[0], BLUE_ARR[0], t))}, ${Math.round(lerp(TEAL_ARR[1], BLUE_ARR[1], t))}, ${Math.round(lerp(TEAL_ARR[2], BLUE_ARR[2], t))}`;

// ── Deterministic ambient particles — identical to TweetHeardRoundDiscord ──
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

// ── Deterministic graph nodes — asymmetric radial scatter, clamped to the safe area ──
interface NodeSpec {
  x: number;
  y: number;
  arrivalEnd: number;
  arcSign: 1 | -1;
  arcMag: number;
  colorMix: number;
}

function buildNodes(count: number): NodeSpec[] {
  return Array.from({ length: count }, (_, i) => {
    const baseAngle = (i / count) * Math.PI * 2;
    const angleJitter = (random(`node-aj-${i}`) - 0.5) * 1.4;
    const angle = baseAngle + angleJitter;
    const radius = 160 + random(`node-r-${i}`) * 260;
    const rawX = CENTER_X + Math.cos(angle) * radius;
    const rawY = CENTER_Y + Math.sin(angle) * radius;
    const x = Math.min(SAFE_W - MARGIN, Math.max(MARGIN, rawX));
    const y = Math.min(SAFE_H - MARGIN, Math.max(MARGIN, rawY));
    const arrivalJitter = Math.round((random(`node-arr-${i}`) - 0.5) * 2 * NODE_ARRIVAL_JITTER_MAX);
    const arcSign: 1 | -1 = random(`node-arcs-${i}`) > 0.5 ? 1 : -1;
    const arcMag = 30 + random(`node-arcm-${i}`) * 50;
    const colorMix = random(`node-c-${i}`);
    return { x, y, arrivalEnd: NODE_FLIGHT_BASE_END + arrivalJitter, arcSign, arcMag, colorMix };
  });
}

const NODES: NodeSpec[] = buildNodes(NODE_COUNT);

// Ring connections (one full loop) + two long chords, for a "clean minimal
// network" that reads as connected structure rather than a rigid mesh or grid.
function buildEdges(count: number): [number, number][] {
  const edges: [number, number][] = [];
  for (let i = 0; i < count; i++) edges.push([i, (i + 1) % count]);
  const half = Math.floor(count / 2);
  edges.push([0, half % count]);
  edges.push([1, (half + 1) % count]);
  return edges;
}

const EDGES: [number, number][] = buildEdges(NODE_COUNT);

// ── Deterministic ember trails — pure burst decoration, never become nodes ──
interface Ember {
  angle: number;
  distance: number;
  startJitter: number;
  fadeJitter: number;
  length: number;
  colorMix: number;
}

function buildEmbers(count: number): Ember[] {
  return Array.from({ length: count }, (_, i) => ({
    angle: random(`ember-a-${i}`) * Math.PI * 2,
    distance: 260 + random(`ember-d-${i}`) * 340,
    startJitter: Math.round(random(`ember-sj-${i}`) * 4),
    fadeJitter: Math.round(random(`ember-fj-${i}`) * 10),
    length: 30 + random(`ember-l-${i}`) * 40,
    colorMix: random(`ember-c-${i}`),
  }));
}

const EMBERS: Ember[] = buildEmbers(EMBER_COUNT);

export const NewAgeSparked: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Carry-over tweet card (frame 0 must pixel-match TweetHeardRoundDiscord's last frame) ──
  const tweetOpacity = itp(frame, [IGNITE_START, FADE_END], [1, 0]);
  const extraGlow = itp(frame, [0, HOLD_END], [0, 1]) * (0.15 + 0.15 * Math.sin(frame / 9)); // exactly 0 at frame 0
  const tweetShadow = `${CARRY_SHADOW_BASE}, 0 0 ${extraGlow * 50}px rgba(${TEAL_RGB}, ${extraGlow * 0.5})`;

  // ── Ambient particles — phase-continued from TweetHeardRoundDiscord's last frame ──
  const cFrame = frame + CONTINUITY_FRAME_OFFSET;

  // ── Ignition light at the tweet's center ────────────────────────────────────
  const igniteSpring =
    frame >= IGNITE_START
      ? spring({
          frame: frame - IGNITE_START,
          fps: FPS,
          config: { damping: 14, stiffness: 170, mass: 0.7 },
          durationInFrames: IGNITE_PEAK - IGNITE_START,
        })
      : 0;
  const igniteT = itp(igniteSpring, [0, 1], [0, 1]);
  const igniteSize = interpolate(igniteT, [0, 1], [4, 150]);
  const igniteBlur = interpolate(igniteT, [0, 1], [4, 70]);
  const igniteOpacity = itp(frame, [IGNITE_START, IGNITE_PEAK, IGNITE_FADE_END], [0, 1, 0]);

  // ── Hard white flash (a few frames), then a fast decaying screen bloom ──────
  const flashOpacity = itp(frame, [FLASH_START, FLASH_START + 2, FLASH_START + 4, FLASH_END], [0, 1, 1, 0]);
  const bloomOpacity = itp(frame, [BLOOM_START, BLOOM_PEAK, BLOOM_END], [0, 0.4, 0], Easing.out(Easing.cubic));

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_BOTTOM} 100%)`, overflow: 'hidden' }}>
      {/* Safe area — all action confined to the top 1080×960 */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: SAFE_W, height: SAFE_H }}>
        {/* Ambient drifting particles / grain — continuous across the scene 2→3 cut */}
        {PARTICLES.map((p, i) => {
          const x = p.baseX + Math.sin(cFrame * p.driftSpeedX + p.phase) * p.driftRangeX;
          const y = p.baseY + Math.cos(cFrame * p.driftSpeedY + p.phase) * p.driftRangeY;
          const twinkle = 0.6 + 0.4 * Math.sin(cFrame * p.twinkleSpeed + p.phase);
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

        {/* Carry-over tweet card — dissolves into the ignition light */}
        {frame <= 40 && (
          <div
            style={{
              position: 'absolute',
              left: CENTER_X,
              top: CENTER_Y,
              width: TWEET_WIDTH,
              transform: `translate(-50%, -50%) scale(${CARRY_SCALE})`,
              opacity: tweetOpacity,
            }}
          >
            <div style={{ position: 'relative', width: '100%', borderRadius: 20, boxShadow: tweetShadow }}>
              <Img
                src={staticFile('tweet-screenshot.png')}
                style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 20 }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: `${HIGHLIGHT_TOP_PCT}%`,
                  left: `${HIGHLIGHT_LEFT_PCT}%`,
                  width: `${HIGHLIGHT_WIDTH_PCT}%`,
                  height: `${HIGHLIGHT_HEIGHT_PCT}%`,
                  borderRadius: 8,
                  background: `linear-gradient(90deg, rgba(${TEAL_RGB}, 0.28), rgba(${BLUE_RGB}, 0.22))`,
                  boxShadow: `0 0 16px rgba(${TEAL_RGB}, 0.3)`,
                }}
              />
            </div>
          </div>
        )}

        {/* Ignition point of light */}
        {frame >= IGNITE_START && frame <= IGNITE_FADE_END + 2 && (
          <div
            style={{
              position: 'absolute',
              left: CENTER_X,
              top: CENTER_Y,
              width: igniteSize,
              height: igniteSize,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, #FFFFFF 0%, rgba(${TEAL_RGB}, 0.85) 40%, rgba(${BLUE_RGB}, 0) 75%)`,
              boxShadow: `0 0 ${igniteBlur * 2}px rgba(255,255,255,0.8), 0 0 ${igniteBlur * 3}px rgba(${TEAL_RGB}, 0.6)`,
              opacity: igniteOpacity,
              mixBlendMode: 'screen',
            }}
          />
        )}

        {/* Hard white flash */}
        {flashOpacity > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: SAFE_W,
              height: SAFE_H,
              background: '#FFFFFF',
              opacity: flashOpacity,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Fast decaying screen bloom */}
        {bloomOpacity > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: SAFE_W,
              height: SAFE_H,
              background: `radial-gradient(circle at ${CENTER_X}px ${CENTER_Y}px, rgba(255,255,255,0.9) 0%, rgba(${TEAL_RGB}, 0.4) 30%, rgba(0,0,0,0) 65%)`,
              opacity: bloomOpacity,
              mixBlendMode: 'screen',
            }}
          />
        )}

        {/* Ember trails — thin streaks shooting outward, never resolve into nodes */}
        {EMBERS.map((e, i) => {
          const localStart = LAUNCH_START + e.startJitter;
          const travelT = itp(frame, [localStart, localStart + 22], [0, 1], Easing.out(Easing.cubic));
          const dist = e.distance * travelT;
          const headX = CENTER_X + Math.cos(e.angle) * dist;
          const headY = CENTER_Y + Math.sin(e.angle) * dist;
          const localFadeEnd = EMBER_FADE_END + e.fadeJitter;
          const opacity = itp(frame, [localStart, localStart + 6, EMBER_FADE_START, localFadeEnd], [0, 1, 0.8, 0]);
          const deg = (e.angle * 180) / Math.PI;
          const color = mixColor(e.colorMix);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: headX,
                top: headY,
                width: e.length,
                height: 2,
                borderRadius: 2,
                background: `linear-gradient(90deg, rgba(${color}, 0.9), rgba(${color}, 0))`,
                opacity,
                transform: `translate(-100%, -50%) rotate(${deg}deg)`,
                boxShadow: `0 0 6px rgba(${color}, 0.5)`,
              }}
            />
          );
        })}

        {/* Graph network — edges draw themselves, nodes ARE the settled burst particles, signal pulses loop */}
        <svg
          width={SAFE_W}
          height={SAFE_H}
          viewBox={`0 0 ${SAFE_W} ${SAFE_H}`}
          style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}
        >
          {EDGES.map(([a, b], i) => {
            const na = NODES[a];
            const nb = NODES[b];
            const edgeStart = EDGE_DRAW_START + i * EDGE_STAGGER;
            const edgeEnd = edgeStart + EDGE_DRAW_DURATION;
            const drawT = itp(frame, [edgeStart, edgeEnd], [0, 1], Easing.out(Easing.cubic));
            const pulseActive = frame >= edgeEnd;
            const pulseT = pulseActive ? ((frame - edgeEnd) % PULSE_PERIOD) / PULSE_PERIOD : 0;
            const pulseBrightness = pulseActive ? Math.sin(pulseT * Math.PI) : 0;
            const pulseX = lerp(na.x, nb.x, pulseT);
            const pulseY = lerp(na.y, nb.y, pulseT);
            return (
              <React.Fragment key={i}>
                <path
                  d={`M ${na.x} ${na.y} L ${nb.x} ${nb.y}`}
                  pathLength={1}
                  stroke={`rgba(${TEAL_RGB}, 0.4)`}
                  strokeWidth={1.5}
                  strokeDasharray={1}
                  strokeDashoffset={1 - drawT}
                  fill="none"
                />
                {pulseActive && (
                  <circle cx={pulseX} cy={pulseY} r={4} fill="#FFFFFF" opacity={0.25 + pulseBrightness * 0.65} />
                )}
              </React.Fragment>
            );
          })}

          {NODES.map((node, i) => {
            // Before launch, t clamps to 0 for every node, which collapses all
            // of them onto the exact center point — hide them entirely until
            // they actually launch so that point doesn't show as a stray dot
            // during the carry-over hold.
            if (frame < LAUNCH_START) return null;
            const t = itp(frame, [LAUNCH_START, node.arrivalEnd], [0, 1], Easing.out(Easing.cubic));
            const lx = lerp(CENTER_X, node.x, t);
            const ly = lerp(CENTER_Y, node.y, t);
            const dx = node.x - CENTER_X;
            const dy = node.y - CENTER_Y;
            const len = Math.hypot(dx, dy) || 1;
            const perpX = -dy / len;
            const perpY = dx / len;
            const bulge = node.arcMag * Math.sin(t * Math.PI) * node.arcSign;
            const posX = lx + perpX * bulge;
            const posY = ly + perpY * bulge;
            const arrived = frame >= node.arrivalEnd;
            const bounce = arrived
              ? spring({ frame: frame - node.arrivalEnd, fps: FPS, config: { damping: 9, stiffness: 260, mass: 0.5 } })
              : 0;
            const scale = arrived ? 0.85 + bounce * 0.15 : interpolate(t, [0, 1], [0.4, 1]);
            const color = mixColor(node.colorMix);
            return (
              <React.Fragment key={i}>
                <circle cx={posX} cy={posY} r={16 * scale} fill={`rgba(${color}, 0.35)`} style={{ filter: 'blur(6px)' }} />
                <circle cx={posX} cy={posY} r={6.5 * scale} fill={`rgb(${color})`} />
                <circle cx={posX} cy={posY} r={6.5 * scale} fill="none" stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={1} />
              </React.Fragment>
            );
          })}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
