import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, random, Easing } from 'remotion';
import { FileText, CheckCircle, Search, Settings, Zap } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// "Loops To Graphs" — 1080×1920 vertical, 900 frames @ 30fps (30s).
//
// Fourth scene, the big one: three connected sub-scenes tracking the
// narration's sentence structure. Same visual world as scenes 1–3 (own
// palette, not tokens.ts): dark cinematic gradient (#0A0A0F → #12121A), all
// action confined to the top 1080×960 safe area, deterministic randomness
// only. No readable text except Part C's tiny label chips (texture, not
// content — explicitly allowed by the brief).
//
// Color tells the story: healthy/working = blue #3B82F6 / teal #14B8A6.
// Strained/bottlenecked = amber #F59E0B (new to this scene).
//
// ── CONTINUITY ───────────────────────────────────────────────────────────────
// Frame 0 must match NewAgeSparked's last frame (149): the settled 7-node
// graph with pulses. buildLegacyNodes/buildLegacyEdges below use the EXACT
// same seed keys as NewAgeSparked's buildNodes/buildEdges, so the positions
// and per-node colors are pixel-identical. By NewAgeSparked's frame 149,
// every node had long since arrived and every edge had long since finished
// drawing (max arrival ~74, max edge-end ~122) — so unlike that file, this
// one doesn't need to replicate the arrival/draw-on animations at all, only
// the settled state plus the still-looping pulse-along-edge modulo, driven
// by `gFrame = frame + GRAPH_CONTINUITY_OFFSET` so the pulses' phase
// continues exactly where NewAgeSparked left off. The ambient particle field
// uses its own longer-lived offset (chained through scene 2 AND scene 3).
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
const AMBER_ARR = [245, 158, 11];
const TEAL_RGB = '20, 184, 166';
const MONO = '"JetBrains Mono", "Fira Code", ui-monospace, monospace';

// ── Continuity constants (copied seed keys / timings from NewAgeSparked) ───
const PARTICLE_COUNT = 36;
const PARTICLE_CONTINUITY_OFFSET = 358; // 209 (scene2) + 149 (scene3's last frame)
const GRAPH_CONTINUITY_OFFSET = 149; // NewAgeSparked's own last local frame
const LEGACY_NODE_COUNT = 7;
const LEGACY_EDGE_DRAW_START = 76;
const LEGACY_EDGE_STAGGER = 4;
const LEGACY_EDGE_DRAW_DURATION = 14;
const LEGACY_PULSE_PERIOD = 48;
const HERO_INDEX = 0; // which legacy node becomes Part A's bottleneck

// ── Timeline — Part A: The Loop Bottleneck (0–270) ──────────────────────────
const GHOST_FADE_MID = 30;
const GHOST_FADE_END = 90;
const HERO_MOVE_END = 30;
const LOOP_START = 30;
const STRAIN_START = 90;
const CRAWL_START = 180;
const CRAWL_ROTATION_FREEZE = 240;
const FREEZE_END = 270;
const JITTER_PEAK = 210;

// ── Timeline — Part B: Graphs Flip That (270–570) ───────────────────────────
const FLIP_FLASH_PEAK = 271;
const FLIP_FLASH_END = 275;
const SHATTER_START = 271;
const SHATTER_END = 292;
const SPLIT_LAUNCH = 272;
const GLYPH_FADE_START = 272;
const COMPLETE_FLASH_START = 380;
const HERO_FADE_START = 271;
const HERO_FADE_END = 280;
const PARTB_NODE_COUNT = 5;

// ── Timeline — Part C: Wired Together By Rules (570–900) ───────────────────
const EDGE_DRAW_START_C = 600;
const EDGE_STAGGER_C = 8;
const EDGE_DRAW_DURATION_C = 16;
const RELAY1_START = 660;
const HOP1_DUR = 18;
const RELAY2_START = 750;
const HOP2_DUR = 14;
const CHORD_START = 756;
const HOLD_PULSE_START = 805;

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

function flashEnvelope(frame: number, times: number[], halfWidth: number): number {
  let v = 0;
  for (const t of times) {
    const d = Math.abs(frame - t);
    if (d < halfWidth) v = Math.max(v, 1 - d / halfWidth);
  }
  return v;
}

function polarToCartesian(r: number, angleDeg: number): { x: number; y: number } {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: r * Math.cos(a), y: r * Math.sin(a) };
}

function describeArc(r: number, startDeg: number, endDeg: number): string {
  const start = polarToCartesian(r, endDeg);
  const end = polarToCartesian(r, startDeg);
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

// ── Deterministic ambient particles — identical to NewAgeSparked/TweetHeardRoundDiscord ──
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

// ── Legacy 7-node graph — SAME seed keys as NewAgeSparked's buildNodes/buildEdges ──
interface LegacyNode {
  x: number;
  y: number;
  colorMix: number;
}

function buildLegacyNodes(count: number): LegacyNode[] {
  return Array.from({ length: count }, (_, i) => {
    const baseAngle = (i / count) * Math.PI * 2;
    const angleJitter = (random(`node-aj-${i}`) - 0.5) * 1.4;
    const angle = baseAngle + angleJitter;
    const radius = 160 + random(`node-r-${i}`) * 260;
    const rawX = CENTER_X + Math.cos(angle) * radius;
    const rawY = CENTER_Y + Math.sin(angle) * radius;
    const x = Math.min(SAFE_W - MARGIN, Math.max(MARGIN, rawX));
    const y = Math.min(SAFE_H - MARGIN, Math.max(MARGIN, rawY));
    const colorMix = random(`node-c-${i}`);
    return { x, y, colorMix };
  });
}

function buildLegacyEdges(count: number): [number, number][] {
  const edges: [number, number][] = [];
  for (let i = 0; i < count; i++) edges.push([i, (i + 1) % count]);
  const half = Math.floor(count / 2);
  edges.push([0, half % count]);
  edges.push([1, (half + 1) % count]);
  return edges;
}

const LEGACY_NODES: LegacyNode[] = buildLegacyNodes(LEGACY_NODE_COUNT);
const LEGACY_EDGES: [number, number][] = buildLegacyEdges(LEGACY_NODE_COUNT);

// ── Part B's 5-agent scatter — fresh seeds, asymmetric, spread for Part C's edges ──
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
// Directed ring (0→1→2→3→4→0) + one chord (1→3) — connected but not a mesh.
const PARTB_EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [1, 3]];
const LABEL_STRINGS = ['if x →', 'then →', 'route:'];

// ── Deterministic shatter shards for the Part A→B flip (amber, small, clean) ──
interface Shard {
  angle: number;
  distance: number;
  rotation: number;
  size: number;
}

function buildShards(count: number): Shard[] {
  return Array.from({ length: count }, (_, i) => ({
    angle: (i / count) * Math.PI * 2 + (random(`shard-a-${i}`) - 0.5) * 0.6,
    distance: 40 + random(`shard-d-${i}`) * 90,
    rotation: 90 + random(`shard-r-${i}`) * 270,
    size: 6 + random(`shard-s-${i}`) * 10,
  }));
}

const SHARDS: Shard[] = buildShards(8);

// ── Part C relay schedule — sequential lap, then a faster dual-path lap ────
interface Hop {
  from: number;
  to: number;
  start: number;
  end: number;
}

const lap1Hops: Hop[] = PARTB_EDGES.slice(0, 5).map(([a, b], k) => ({
  from: a,
  to: b,
  start: RELAY1_START + k * HOP1_DUR,
  end: RELAY1_START + (k + 1) * HOP1_DUR,
}));
const lap2RingHops: Hop[] = PARTB_EDGES.slice(0, 5).map(([a, b], k) => ({
  from: a,
  to: b,
  start: RELAY2_START + k * HOP2_DUR,
  end: RELAY2_START + (k + 1) * HOP2_DUR,
}));
const CHORD_PATH: [number, number][] = [[1, 3], [3, 4]];
const lap2ChordHops: Hop[] = CHORD_PATH.map(([a, b], k) => ({
  from: a,
  to: b,
  start: CHORD_START + k * HOP2_DUR,
  end: CHORD_START + (k + 1) * HOP2_DUR,
}));
const ALL_HOPS: Hop[] = [...lap1Hops, ...lap2RingHops, ...lap2ChordHops];

function nodeRelayFlashTimes(nodeIndex: number): number[] {
  const times: number[] = [];
  for (const h of ALL_HOPS) {
    if (h.from === nodeIndex) times.push(h.start);
    if (h.to === nodeIndex) times.push(h.end);
  }
  return times;
}

// Part A's decelerating loop rotation — integrated per-frame angular speed so
// the period smoothly stretches from ~1s to a crawl, then freezes at 240.
function periodFramesAt(f: number): number {
  if (f <= STRAIN_START) return 30;
  return itp(f, [STRAIN_START, CRAWL_START, CRAWL_ROTATION_FREEZE], [30, 57, 220]);
}

function loopRotationDeg(frame: number): number {
  let angle = 0;
  const upto = Math.min(frame, CRAWL_ROTATION_FREEZE);
  for (let f = LOOP_START; f <= upto; f++) angle += 360 / periodFramesAt(f);
  return angle;
}

export const LoopsToGraphs: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Continuity: ambient particles + legacy graph ────────────────────────
  const pFrame = frame + PARTICLE_CONTINUITY_OFFSET;
  const gFrame = frame + GRAPH_CONTINUITY_OFFSET;
  const ghostOpacity = itp(frame, [0, GHOST_FADE_MID, GHOST_FADE_END], [1, 0.05, 0]);

  // ── Part A: hero node ────────────────────────────────────────────────────
  const hero = LEGACY_NODES[HERO_INDEX];
  const heroX = itp(frame, [0, HERO_MOVE_END], [hero.x, CENTER_X], Easing.out(Easing.cubic));
  const heroY = itp(frame, [0, HERO_MOVE_END], [hero.y, CENTER_Y], Easing.out(Easing.cubic));
  const heroScale = itp(frame, [0, HERO_MOVE_END], [1, 1.6], Easing.out(Easing.cubic));
  const heroStrainT = itp(frame, [STRAIN_START, FREEZE_END], [0, 1]);
  const heroBaseArr = mixArr(hero.colorMix, TEAL_ARR, BLUE_ARR);
  const heroColorArr = mixArr(heroStrainT, heroBaseArr, AMBER_ARR);
  const heroColorStr = rgbStr(heroColorArr);
  // Baseline (0.35 glow / r=6.5 core, r=16 halo) matches exactly how this
  // node rendered as a settled member of NewAgeSparked's graph at frame 149,
  // so frame 0 here is pixel-identical before growth/strain takes over.
  const heroGlowStrength = itp(heroStrainT, [0, 1], [0.35, 0.15]);
  const jitterMag = itp(frame, [CRAWL_START, JITTER_PEAK, CRAWL_ROTATION_FREEZE], [0, 1, 0]);
  const jitterDX = jitterMag * (random(`hero-jx-${frame}`) - 0.5) * 6;
  const jitterDY = jitterMag * (random(`hero-jy-${frame}`) - 0.5) * 6;
  const flickerOpacityMul = 1 - jitterMag * 0.25 * (0.5 + 0.5 * Math.sin(frame * 2.1));
  const heroFadeOutT = itp(frame, [HERO_FADE_START, HERO_FADE_END], [1, 0]);
  const heroOpacity = flickerOpacityMul * heroFadeOutT;
  const heroRenderX = heroX + jitterDX;
  const heroRenderY = heroY + jitterDY;
  const heroVisible = frame <= HERO_FADE_END + 2;

  // Loop ring (dim base arc + bright leading tip, doubling as the "checking" pulse)
  const loopVisible = frame >= LOOP_START && heroVisible;
  const loopIntroT = itp(frame, [LOOP_START, LOOP_START + 10], [0, 1]);
  const loopRadius = 62 * heroScale;
  const rotationDeg = loopRotationDeg(frame);
  const lapProgress = ((rotationDeg % 360) + 360) % 360 / 360;
  const tipBrightness = Math.pow(Math.sin(lapProgress * Math.PI), 2);
  const tip = polarToCartesian(loopRadius, 0);

  // ── Part A→B flip: flash + shatter ───────────────────────────────────────
  const flipFlashOpacity = itp(frame, [FLIP_FLASH_PEAK - 2, FLIP_FLASH_PEAK, FLIP_FLASH_END], [0, 1, 0]);
  const shatterActive = frame >= SHATTER_START && frame <= SHATTER_END;
  const shatterT = itp(frame, [SHATTER_START, SHATTER_END], [0, 1]);
  const shatterEase = 1 - Math.pow(1 - shatterT, 3);

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

        {/* Legacy 7-node graph — ghosts out by frame 90 (continuity carry-over) */}
        {frame <= GHOST_FADE_END + 5 && (
          <svg width={SAFE_W} height={SAFE_H} viewBox={`0 0 ${SAFE_W} ${SAFE_H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
            {LEGACY_EDGES.map(([a, b], i) => {
              const na = LEGACY_NODES[a];
              const nb = LEGACY_NODES[b];
              const edgeEnd = LEGACY_EDGE_DRAW_START + i * LEGACY_EDGE_STAGGER + LEGACY_EDGE_DRAW_DURATION;
              const pulseT = ((gFrame - edgeEnd) % LEGACY_PULSE_PERIOD) / LEGACY_PULSE_PERIOD;
              const pulseBrightness = Math.sin(pulseT * Math.PI);
              const px = lerp(na.x, nb.x, pulseT);
              const py = lerp(na.y, nb.y, pulseT);
              return (
                <React.Fragment key={i}>
                  <path d={`M ${na.x} ${na.y} L ${nb.x} ${nb.y}`} stroke={`rgba(${TEAL_RGB}, ${0.4 * ghostOpacity})`} strokeWidth={1.5} fill="none" />
                  <circle cx={px} cy={py} r={4} fill="#FFFFFF" opacity={(0.25 + pulseBrightness * 0.65) * ghostOpacity} />
                </React.Fragment>
              );
            })}
            {LEGACY_NODES.map((n, i) => {
              if (i === HERO_INDEX) return null; // hero renders separately, on top
              const color = rgbStr(mixArr(n.colorMix, TEAL_ARR, BLUE_ARR));
              return (
                <React.Fragment key={i}>
                  <circle cx={n.x} cy={n.y} r={16} fill={`rgba(${color}, ${0.35 * ghostOpacity})`} style={{ filter: 'blur(6px)' }} />
                  <circle cx={n.x} cy={n.y} r={6.5} fill={`rgba(${color}, ${ghostOpacity})`} />
                </React.Fragment>
              );
            })}
          </svg>
        )}

        {/* Part A hero node + strain loop */}
        {heroVisible && (
          <svg width={SAFE_W} height={SAFE_H} viewBox={`0 0 ${SAFE_W} ${SAFE_H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
            <circle cx={heroRenderX} cy={heroRenderY} r={16 * heroScale} fill={`rgba(${heroColorStr}, ${heroGlowStrength})`} style={{ filter: 'blur(10px)' }} opacity={heroOpacity} />
            <circle cx={heroRenderX} cy={heroRenderY} r={6.5 * heroScale} fill={`rgb(${heroColorStr})`} opacity={heroOpacity} />
            <circle cx={heroRenderX} cy={heroRenderY} r={6.5 * heroScale} fill="none" stroke="#FFFFFF" strokeOpacity={0.5 * heroOpacity} strokeWidth={1} />

            {loopVisible && (
              <g transform={`translate(${heroRenderX} ${heroRenderY}) rotate(${rotationDeg})`} opacity={loopIntroT * heroOpacity}>
                <path d={describeArc(loopRadius, 0, 270)} stroke={`rgba(${heroColorStr}, 0.45)`} strokeWidth={2.5} fill="none" strokeLinecap="round" />
                <circle cx={tip.x} cy={tip.y} r={3 + tipBrightness * 2.5} fill="#FFFFFF" opacity={0.5 + tipBrightness * 0.5} />
              </g>
            )}
          </svg>
        )}

        {/* Part A→B flip: amber shards flying off the hero node */}
        {shatterActive && (
          <svg width={SAFE_W} height={SAFE_H} viewBox={`0 0 ${SAFE_W} ${SAFE_H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
            {SHARDS.map((s, i) => {
              const dist = s.distance * shatterEase;
              const x = CENTER_X + Math.cos(s.angle) * dist;
              const y = CENTER_Y + Math.sin(s.angle) * dist;
              const rot = s.rotation * shatterT;
              const opacity = itp(shatterT, [0, 0.6, 1], [1, 0.9, 0]);
              return (
                <rect
                  key={i}
                  x={x - s.size / 2}
                  y={y - s.size / 2}
                  width={s.size}
                  height={s.size}
                  fill={`rgb(${AMBER_ARR[0]}, ${AMBER_ARR[1]}, ${AMBER_ARR[2]})`}
                  opacity={opacity}
                  transform={`rotate(${rot} ${x} ${y})`}
                />
              );
            })}
          </svg>
        )}

        {/* Part C — directed edges, arrowheads, label chips, relay pulses, hold pulses (drawn under Part B's nodes) */}
        <svg width={SAFE_W} height={SAFE_H} viewBox={`0 0 ${SAFE_W} ${SAFE_H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
          {PARTB_EDGES.map(([a, b], j) => {
            const na = PARTB_NODES[a];
            const nb = PARTB_NODES[b];
            const edgeStart = EDGE_DRAW_START_C + j * EDGE_STAGGER_C;
            const edgeEnd = edgeStart + EDGE_DRAW_DURATION_C;
            const drawT = itp(frame, [edgeStart, edgeEnd], [0, 1], Easing.out(Easing.cubic));
            if (drawT <= 0) return null;
            const dx = nb.x - na.x;
            const dy = nb.y - na.y;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const headX = na.x + dx * drawT;
            const headY = na.y + dy * drawT;
            const arrowOpacity = itp(drawT, [0.7, 1], [0, 1]);
            const arrowLen = 10;
            const perpX = -uy;
            const perpY = ux;
            const tipX = headX;
            const tipY = headY;
            const baseCx = headX - ux * arrowLen;
            const baseCy = headY - uy * arrowLen;
            const leftX = baseCx + perpX * 4;
            const leftY = baseCy + perpY * 4;
            const rightX = baseCx - perpX * 4;
            const rightY = baseCy - perpY * 4;
            const midX = lerp(na.x, nb.x, 0.5) + perpX * 16;
            const midY = lerp(na.y, nb.y, 0.5) + perpY * 16;
            const labelOpacity = itp(frame, [edgeStart, edgeStart + 6, edgeStart + 16, edgeStart + 26], [0, 0.55, 0.55, 0]);
            return (
              <React.Fragment key={j}>
                <line x1={na.x} y1={na.y} x2={headX} y2={headY} stroke={`rgba(${TEAL_RGB}, 0.4)`} strokeWidth={1.5} />
                <polygon points={`${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`} fill={`rgba(${TEAL_RGB}, ${arrowOpacity * 0.7})`} />
                {labelOpacity > 0 && (
                  <text x={midX} y={midY} fontFamily={MONO} fontSize={11} fill="rgba(255,255,255,0.4)" opacity={labelOpacity} textAnchor="middle">
                    {LABEL_STRINGS[j % LABEL_STRINGS.length]}
                  </text>
                )}
              </React.Fragment>
            );
          })}

          {/* Relay pulses — sequential lap, then a faster dual-path lap */}
          {ALL_HOPS.map((h, i) => {
            if (frame < h.start || frame > h.end) return null;
            const na = PARTB_NODES[h.from];
            const nb = PARTB_NODES[h.to];
            const t = itp(frame, [h.start, h.end], [0, 1]);
            const x = lerp(na.x, nb.x, t);
            const y = lerp(na.y, nb.y, t);
            return <circle key={i} cx={x} cy={y} r={6} fill="#FFFFFF" opacity={0.85} style={{ filter: `drop-shadow(0 0 6px rgba(${TEAL_RGB}, 0.9))` }} />;
          })}

          {/* Hero-hold ambient pulses — calm, continuous, staggered per edge */}
          {frame >= HOLD_PULSE_START &&
            PARTB_EDGES.map(([a, b], j) => {
              const na = PARTB_NODES[a];
              const nb = PARTB_NODES[b];
              const period = 44 + j * 6;
              const t = (((frame - HOLD_PULSE_START) + j * 7) % period) / period;
              const brightness = Math.sin(t * Math.PI);
              const x = lerp(na.x, nb.x, t);
              const y = lerp(na.y, nb.y, t);
              return <circle key={`hold-${j}`} cx={x} cy={y} r={4} fill="#FFFFFF" opacity={0.2 + brightness * 0.6} />;
            })}
        </svg>

        {/* Part B — 5 agent nodes: spring-out split, glyphs, staggered pulse + complete flashes */}
        {frame >= 270 &&
          PARTB_NODES.map((target, i) => {
            const launchDelay = i * 4;
            const nodeSpring =
              frame >= SPLIT_LAUNCH
                ? spring({ frame: frame - SPLIT_LAUNCH - launchDelay, fps: FPS, config: { damping: 14, stiffness: 170, mass: 0.8 } })
                : 0;
            // Deliberately unclamped — the spring's natural overshoot is the
            // "spring outward" bounce; clamping would flatten it (see
            // TweetHeardRoundDiscord's entrance for the same pattern).
            const rawT = nodeSpring;
            const clampedT = itp(rawT, [0, 1], [0, 1]);
            const posX = lerp(CENTER_X, target.x, rawT);
            const posY = lerp(CENTER_Y, target.y, rawT);
            const scale = interpolate(clampedT, [0, 1], [0.3, 1]);
            const fadeIn = itp(frame, [SPLIT_LAUNCH + launchDelay, SPLIT_LAUNCH + launchDelay + 6], [0, 1]);
            const pulsePeriod = 46 + i * 9;
            const pulsePhase = i * 13;
            const pulseVal = frame >= GLYPH_FADE_START ? 0.5 + 0.5 * Math.sin((2 * Math.PI * (frame - pulsePhase)) / pulsePeriod) : 0;
            const glyphOpacity = itp(frame, [GLYPH_FADE_START + launchDelay, GLYPH_FADE_START + launchDelay + 10], [0, 1]);
            const color = rgbStr(mixArr(target.colorMix, TEAL_ARR, BLUE_ARR));
            const flashTimes = [380 + Math.round(random(`cf1-${i}`) * 70), 460 + Math.round(random(`cf2-${i}`) * 60)];
            const completeFlash = frame >= COMPLETE_FLASH_START ? flashEnvelope(frame, flashTimes, 8) : 0;
            const relayFlash = flashEnvelope(frame, nodeRelayFlashTimes(i), 7);
            const totalFlash = Math.max(completeFlash, relayFlash);
            const Icon = ICONS[i % ICONS.length];
            const haloOpacity = 0.22 + pulseVal * 0.2 + totalFlash * 0.5;
            const haloRadius = 26 + pulseVal * 10 + totalFlash * 18;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: posX,
                  top: posY,
                  width: 0,
                  height: 0,
                  opacity: fadeIn,
                }}
              >
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
                    transform: `scale(${scale})`,
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
                    border: `1.5px solid rgba(${color}, ${0.7 + totalFlash * 0.3})`,
                    boxShadow: `0 0 ${14 + pulseVal * 10}px rgba(${color}, ${0.35 + totalFlash * 0.5})`,
                    transform: `scale(${scale})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ opacity: glyphOpacity }}>
                    <Icon size={26} color={`rgb(${color})`} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            );
          })}

        {/* Hard flash at the Part A→B flip */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: SAFE_W, height: SAFE_H, background: '#FFFFFF', opacity: flipFlashOpacity, pointerEvents: 'none' }} />
      </div>
    </AbsoluteFill>
  );
};
