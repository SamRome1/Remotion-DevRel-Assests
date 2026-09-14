import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, random, Easing } from 'remotion';
import { Workflow, Search, FileText, CheckCircle, Settings, Zap } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// "Agent Org Chart" — 1080×1920 vertical, 600 frames @ 30fps (20s).
//
// Sixth scene in the running series. Same visual world: dark cinematic
// gradient (#0A0A0F → #12121A), all action confined to the top 1080×960 safe
// area, deterministic randomness only. No readable text; a few blank pill
// shapes are used as pure texture ("rule" markers), never as labels.
//
// Two parts:
//   A — "Not Nested Loops" (0–210): a cluttered, needlessly mechanical stack
//       of concentric amber loops (reusing LoopsToGraphs Part A's bottleneck
//       visual language) builds up, then deflates/desaturates to gray and
//       fades — dismissed, not destroyed.
//   B — "The Org Chart" (210–600): the exhale. A calm, procedurally-laid-out
//       tree of rounded boxes grows top-down (root → 3 children → 5 leaves),
//       blank "rule" pills mark a couple of edges, then a pulse cascades
//       level-by-level down the tree (hierarchical delegation, distinct from
//       LoopsToGraphs's peer-to-peer relay).
//
// ── CONTINUITY ───────────────────────────────────────────────────────────────
// Frame 0 reproduces NinetyPercentWrong's END state (its last local frame,
// 149): the hero graph shrunk/off-center and still pulsing, the dim gray
// broken-clone field settled, the one healthy clone untouched. Node/clone
// seed keys and constants are copied verbatim from NinetyPercentWrong so the
// positions are pixel-identical; the settled per-clone values (grayT=1,
// halfT=0, dim=0.2 for broken; grayT=0, halfT=1, dim=1 for the healthy one)
// are the closed-form result of NinetyPercentWrong's own formulas evaluated
// at frame 149, so they're hardcoded rather than re-derived. That whole
// legacy overlay fades to black over frames 0–20. The ambient particle field
// continues the series' longer offset chain as `frame + 1408` (1258 + 150,
// picking up from NinetyPercentWrong's own particle offset + duration).
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
const GRAY_ARR = [75, 85, 99]; // #4B5563 — "broken/dismissed"
const TEAL_RGB = '20, 184, 166';
const BLUE_RGB = '59, 130, 246';

// ── Continuity constants ────────────────────────────────────────────────────
const PARTICLE_COUNT = 36;
const PARTICLE_CONTINUITY_OFFSET = 1408; // 1258 + 150 (accumulated chain through NinetyPercentWrong)
const LEGACY_FRAME = 149; // NinetyPercentWrong's own last local frame
const LEGACY_GRAPH_OFFSET = 899 + LEGACY_FRAME; // 1048 — hero graph's pulse phase at that frame
const LEGACY_HERO_SCALE = 0.42;
const LEGACY_HERO_DX = -190;
const LEGACY_HERO_DY = -30;
const LEGACY_HEALTHY_INDEX = 8;
const LEGACY_FADE_END = 20;

// ── Part A timeline — "Not Nested Loops" ────────────────────────────────────
const LOOP1_START = 20;
const LOOP1_FADE_END = 32;
const LOOP2_START = 45;
const LOOP2_FADE_END = 57;
const LOOP3_START = 78;
const LOOP3_FADE_END = 92;
const ROTATION_FREEZE = 160;
const COLLAPSE_START = 160;
const COLLAPSE_DESAT_END = 190;
const COLLAPSE_SCALE_END = 205;
const COLLAPSE_OPACITY_END = 210;
const PART_A_END = 212;

// ── Part B timeline — "The Org Chart" ───────────────────────────────────────
const ROOT_DROP_START = 240;
const TIER1_DRAW_START = 300;
const TIER1_STAGGER = 12;
const TIER1_LINE_DUR = 16;
const TIER2_DRAW_START = 390;
const TIER2_STAGGER = 12;
const TIER2_LINE_DUR = 12;
const TAGS_START = 450;
const TAGS_STAGGER = 15;
const PULSE_LEVEL0_START = 510;
const PULSE_LEVEL0_END = 535;
const PULSE_LEVEL1_START = 540;
const PULSE_LEVEL1_END = 565;
const TIER_Y = [190, 420, 680];
const BOX_SIZES = [{ w: 96, h: 60 }, { w: 78, h: 52 }, { w: 54, h: 38 }];
const ICON_SIZES = [30, 24, 0];
const RULE_TAG_CHILD_IDS = ['c1', 'l0', 'l4'];

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

// ── Deterministic ambient particles — identical to every prior scene in the chain ──
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

// ── Legacy hero graph — SAME seed keys as NinetyPercentWrong's PARTB_NODES ──
interface LegacyNode {
  x: number;
  y: number;
  colorMix: number;
}

function buildLegacyHeroNodes(count: number): LegacyNode[] {
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

const LEGACY_HERO_NODES: LegacyNode[] = buildLegacyHeroNodes(5);
const LEGACY_HERO_EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [1, 3]];
const LEGACY_ICONS = [FileText, CheckCircle, Search, Settings, Zap];

function legacyNodeLocal(i: number): { x: number; y: number } {
  return { x: LEGACY_HERO_NODES[i].x - CENTER_X, y: LEGACY_HERO_NODES[i].y - CENTER_Y };
}

function legacyTransform(local: { x: number; y: number }): { x: number; y: number } {
  return {
    x: CENTER_X + LEGACY_HERO_DX + local.x * LEGACY_HERO_SCALE,
    y: CENTER_Y + LEGACY_HERO_DY + local.y * LEGACY_HERO_SCALE,
  };
}

// ── Legacy clone layout — SAME seed keys/constants as NinetyPercentWrong's buildClones ──
interface LegacyCloneLayout {
  x: number;
  y: number;
  scale: number;
}

function buildLegacyClones(count: number): LegacyCloneLayout[] {
  return Array.from({ length: count }, (_, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const xBase = 190 + col * 350;
    const yBase = 230 + row * 280;
    const jitterX = (random(`clone-jx-${i}`) - 0.5) * 90;
    const jitterY = (random(`clone-jy-${i}`) - 0.5) * 70;
    const scale = 0.15 + random(`clone-sc-${i}`) * 0.04;
    return { x: xBase + jitterX, y: yBase + jitterY, scale };
  });
}

const LEGACY_CLONES: LegacyCloneLayout[] = buildLegacyClones(9);

// ── Part A — three concentric amber loops, desynced ─────────────────────────
interface LoopDef {
  radius: number;
  period: number;
  direction: 1 | -1;
  startFrame: number;
  fadeEnd: number;
}

const LOOPS: LoopDef[] = [
  { radius: 140, period: 90, direction: 1, startFrame: LOOP1_START, fadeEnd: LOOP1_FADE_END },
  { radius: 90, period: 68, direction: -1, startFrame: LOOP2_START, fadeEnd: LOOP2_FADE_END },
  { radius: 52, period: 47, direction: 1, startFrame: LOOP3_START, fadeEnd: LOOP3_FADE_END },
];

// ── Part B — procedural org-chart tree layout ───────────────────────────────
interface TreeDef {
  id: string;
  icon?: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  children?: TreeDef[];
}

const ORG_TREE: TreeDef = {
  id: 'root',
  icon: Workflow,
  children: [
    { id: 'c0', icon: Search, children: [{ id: 'l0' }, { id: 'l1' }] },
    { id: 'c1', icon: FileText, children: [{ id: 'l2' }] },
    { id: 'c2', icon: CheckCircle, children: [{ id: 'l3' }, { id: 'l4' }] },
  ],
};

interface OrgNode {
  id: string;
  depth: number;
  x: number;
  y: number;
  icon?: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  parentId?: string;
  orderInTier: number;
  lineStart?: number;
  lineEnd?: number;
  dropStart: number;
}

function buildOrgLayout(root: TreeDef): OrgNode[] {
  const leaves: TreeDef[] = [];
  const collectLeaves = (n: TreeDef) => {
    if (!n.children || n.children.length === 0) leaves.push(n);
    else n.children.forEach(collectLeaves);
  };
  collectLeaves(root);

  const marginX = 110;
  const avail = SAFE_W - marginX * 2;
  const xMemo = new Map<string, number>();
  leaves.forEach((l, i) => xMemo.set(l.id, leaves.length > 1 ? marginX + (avail * i) / (leaves.length - 1) : CENTER_X));

  const computeX = (n: TreeDef): number => {
    if (xMemo.has(n.id)) return xMemo.get(n.id)!;
    const xs = (n.children || []).map(computeX);
    const x = xs.reduce((a, b) => a + b, 0) / xs.length;
    xMemo.set(n.id, x);
    return x;
  };
  computeX(root);

  const flat: { id: string; depth: number; x: number; icon?: TreeDef['icon']; parentId?: string }[] = [];
  const walk = (n: TreeDef, depth: number, parentId?: string) => {
    flat.push({ id: n.id, depth, x: xMemo.get(n.id)!, icon: n.icon, parentId });
    (n.children || []).forEach((c) => walk(c, depth + 1, n.id));
  };
  walk(root, 0);

  const byDepth = new Map<number, typeof flat>();
  flat.forEach((n) => {
    const arr = byDepth.get(n.depth) || [];
    arr.push(n);
    byDepth.set(n.depth, arr);
  });
  const orderMap = new Map<string, number>();
  byDepth.forEach((arr) => {
    const sorted = [...arr].sort((a, b) => a.x - b.x);
    sorted.forEach((n, i) => orderMap.set(n.id, i));
  });

  return flat.map((n) => {
    const orderInTier = orderMap.get(n.id)!;
    let lineStart: number | undefined;
    let lineEnd: number | undefined;
    let dropStart: number;
    if (n.depth === 0) {
      dropStart = ROOT_DROP_START;
    } else if (n.depth === 1) {
      lineStart = TIER1_DRAW_START + orderInTier * TIER1_STAGGER;
      lineEnd = lineStart + TIER1_LINE_DUR;
      dropStart = lineEnd;
    } else {
      lineStart = TIER2_DRAW_START + orderInTier * TIER2_STAGGER;
      lineEnd = lineStart + TIER2_LINE_DUR;
      dropStart = lineEnd;
    }
    return { id: n.id, depth: n.depth, x: n.x, y: TIER_Y[n.depth], icon: n.icon, parentId: n.parentId, orderInTier, lineStart, lineEnd, dropStart };
  });
}

const ORG_NODES: OrgNode[] = buildOrgLayout(ORG_TREE);
const ORG_NODE_MAP = new Map(ORG_NODES.map((n) => [n.id, n]));
const ORG_EDGES = ORG_NODES.filter((n) => n.parentId).map((n) => ({ parent: ORG_NODE_MAP.get(n.parentId!)!, child: n }));

function renderBox(node: OrgNode, frame: number) {
  const localFrame = frame - node.dropStart;
  if (localFrame < 0) return null;
  const springT = spring({ frame: localFrame, fps: FPS, config: { damping: 18, stiffness: 130 } });
  const clampedT = itp(springT, [0, 1], [0, 1]);
  const transY = (1 - clampedT) * -50;
  const opacity = itp(localFrame, [0, 10], [0, 1]);
  const flashTimes = node.depth === 0 ? [PULSE_LEVEL0_START] : node.depth === 1 ? [PULSE_LEVEL0_END] : [PULSE_LEVEL1_END];
  const flash = flashEnvelope(frame, flashTimes, 8);
  const size = BOX_SIZES[node.depth];
  const iconSize = ICON_SIZES[node.depth];
  const Icon = node.icon;
  return (
    <div
      key={node.id}
      style={{
        position: 'absolute',
        left: node.x - size.w / 2,
        top: node.y - size.h / 2 + transY,
        width: size.w,
        height: size.h,
        borderRadius: 14,
        background: 'rgba(20,20,28,0.85)',
        border: `1.5px solid rgba(${BLUE_RGB}, ${0.55 + flash * 0.35})`,
        boxShadow: `0 0 ${16 + flash * 16}px rgba(${BLUE_RGB}, ${0.22 + flash * 0.35})`,
        opacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {Icon ? (
        <Icon size={iconSize} color={`rgb(${BLUE_RGB})`} strokeWidth={1.5} />
      ) : (
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: `rgb(${TEAL_RGB})` }} />
      )}
    </div>
  );
}

function renderEdge(edge: { parent: OrgNode; child: OrgNode }, frame: number) {
  const { parent, child } = edge;
  const dx = child.x - parent.x;
  const dy = child.y - parent.y;
  const length = Math.hypot(dx, dy) || 1;
  const lineStart = child.lineStart ?? 0;
  const lineEnd = child.lineEnd ?? 0;
  const dashOffset = itp(frame, [lineStart, lineEnd], [length, 0], Easing.out(Easing.cubic));
  return (
    <line
      key={`${parent.id}-${child.id}`}
      x1={parent.x}
      y1={parent.y}
      x2={child.x}
      y2={child.y}
      stroke={`rgba(${BLUE_RGB}, 0.4)`}
      strokeWidth={1.5}
      strokeDasharray={`${length} ${length}`}
      strokeDashoffset={dashOffset}
    />
  );
}

function renderRuleTag(childId: string, index: number, frame: number) {
  const child = ORG_NODE_MAP.get(childId);
  if (!child || !child.parentId) return null;
  const parent = ORG_NODE_MAP.get(child.parentId)!;
  const midX = (parent.x + child.x) / 2;
  const midY = (parent.y + child.y) / 2;
  const dx = child.x - parent.x;
  const dy = child.y - parent.y;
  const len = Math.hypot(dx, dy) || 1;
  const perpX = -dy / len;
  const perpY = dx / len;
  const tagStart = TAGS_START + index * TAGS_STAGGER;
  const opacity = itp(frame, [tagStart, tagStart + 10], [0, 1]);
  const x = midX + perpX * 18;
  const y = midY + perpY * 18;
  return (
    <div
      key={childId}
      style={{
        position: 'absolute',
        left: x - 14,
        top: y - 7,
        width: 28,
        height: 14,
        borderRadius: 7,
        background: `rgba(${TEAL_RGB}, 0.14)`,
        border: `1px solid rgba(${TEAL_RGB}, 0.4)`,
        opacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: 8, height: 2, borderRadius: 1, background: `rgba(${TEAL_RGB}, 0.7)` }} />
    </div>
  );
}

function renderPulses(edges: typeof ORG_EDGES, levelStart: number, levelEnd: number, frame: number) {
  if (frame < levelStart || frame > levelEnd) return null;
  const t = itp(frame, [levelStart, levelEnd], [0, 1]);
  return edges.map(({ parent, child }) => {
    const x = lerp(parent.x, child.x, t);
    const y = lerp(parent.y, child.y, t);
    return (
      <circle
        key={`pulse-${parent.id}-${child.id}`}
        cx={x}
        cy={y}
        r={6}
        fill="#FFFFFF"
        opacity={0.85}
        style={{ filter: `drop-shadow(0 0 6px rgba(${TEAL_RGB}, 0.9))` }}
      />
    );
  });
}

export const AgentOrgChart: React.FC = () => {
  const frame = useCurrentFrame();
  const pFrame = frame + PARTICLE_CONTINUITY_OFFSET;
  const legacyFadeOpacity = itp(frame, [0, LEGACY_FADE_END], [1, 0]);

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

        {/* Legacy overlay — NinetyPercentWrong's END state, then a quick fade to dark */}
        {frame < LEGACY_FADE_END + 2 && (
          <div style={{ position: 'absolute', left: 0, top: 0, width: SAFE_W, height: SAFE_H, opacity: legacyFadeOpacity }}>
            <svg width={SAFE_W} height={SAFE_H} viewBox={`0 0 ${SAFE_W} ${SAFE_H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
              {LEGACY_CLONES.map((clone, i) => {
                const isHealthy = i === LEGACY_HEALTHY_INDEX;
                const grayT = isHealthy ? 0 : 1;
                const halfT = isHealthy ? 1 : 0;
                const dimOpacity = isHealthy ? 1 : 0.2;
                const edgeColor = rgbStr(mixArr(grayT, TEAL_ARR, GRAY_ARR));
                return (
                  <g key={i} transform={`translate(${clone.x} ${clone.y}) scale(${clone.scale})`} opacity={dimOpacity}>
                    {LEGACY_HERO_EDGES.map(([a, b], j) => {
                      const la = legacyNodeLocal(a);
                      const lb = legacyNodeLocal(b);
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
                    {LEGACY_HERO_NODES.map((n, k) => {
                      const loc = legacyNodeLocal(k);
                      const baseColor = mixArr(n.colorMix, TEAL_ARR, BLUE_ARR);
                      const nodeColor = rgbStr(mixArr(grayT, baseColor, GRAY_ARR));
                      return (
                        <React.Fragment key={k}>
                          <circle cx={loc.x} cy={loc.y} r={60} fill={`rgba(${nodeColor}, 0.25)`} style={{ filter: 'blur(4px)' }} />
                          <circle cx={loc.x} cy={loc.y} r={26} fill={`rgb(${nodeColor})`} />
                        </React.Fragment>
                      );
                    })}
                  </g>
                );
              })}

              {LEGACY_HERO_EDGES.map(([a, b], j) => {
                const na = legacyTransform(legacyNodeLocal(a));
                const nb = legacyTransform(legacyNodeLocal(b));
                const dx = nb.x - na.x;
                const dy = nb.y - na.y;
                const len = Math.hypot(dx, dy) || 1;
                const ux = dx / len;
                const uy = dy / len;
                const arrowLen = 10 * LEGACY_HERO_SCALE;
                const perpX = -uy;
                const perpY = ux;
                const baseCx = nb.x - ux * arrowLen;
                const baseCy = nb.y - uy * arrowLen;
                const leftX = baseCx + perpX * 4 * LEGACY_HERO_SCALE;
                const leftY = baseCy + perpY * 4 * LEGACY_HERO_SCALE;
                const rightX = baseCx - perpX * 4 * LEGACY_HERO_SCALE;
                const rightY = baseCy - perpY * 4 * LEGACY_HERO_SCALE;
                return (
                  <React.Fragment key={j}>
                    <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={`rgba(${TEAL_RGB}, 0.4)`} strokeWidth={1.5 * LEGACY_HERO_SCALE} />
                    <polygon points={`${nb.x},${nb.y} ${leftX},${leftY} ${rightX},${rightY}`} fill={`rgba(${TEAL_RGB}, 0.7)`} />
                  </React.Fragment>
                );
              })}

              {LEGACY_HERO_EDGES.map(([a, b], j) => {
                const na = legacyTransform(legacyNodeLocal(a));
                const nb = legacyTransform(legacyNodeLocal(b));
                const period = 44 + j * 6;
                const t = (((LEGACY_GRAPH_OFFSET - 805) + j * 7) % period) / period;
                const brightness = Math.sin(t * Math.PI);
                const x = lerp(na.x, nb.x, t);
                const y = lerp(na.y, nb.y, t);
                return <circle key={`hp-${j}`} cx={x} cy={y} r={4 * LEGACY_HERO_SCALE} fill="#FFFFFF" opacity={0.2 + brightness * 0.6} />;
              })}
            </svg>

            {LEGACY_HERO_NODES.map((target, i) => {
              const pulsePeriod = 46 + i * 9;
              const pulsePhase = i * 13;
              const pulseVal = 0.5 + 0.5 * Math.sin((2 * Math.PI * (LEGACY_GRAPH_OFFSET - pulsePhase)) / pulsePeriod);
              const color = rgbStr(mixArr(target.colorMix, TEAL_ARR, BLUE_ARR));
              const Icon = LEGACY_ICONS[i % LEGACY_ICONS.length];
              const haloOpacity = 0.22 + pulseVal * 0.2;
              const haloRadius = (26 + pulseVal * 10) * LEGACY_HERO_SCALE;
              const pos = legacyTransform(legacyNodeLocal(i));
              const boxSize = 64 * LEGACY_HERO_SCALE;
              return (
                <div key={i} style={{ position: 'absolute', left: pos.x, top: pos.y, width: 0, height: 0 }}>
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
                      left: -boxSize / 2,
                      top: -boxSize / 2,
                      width: boxSize,
                      height: boxSize,
                      borderRadius: '50%',
                      background: 'rgba(20,20,28,0.85)',
                      border: `${1.5 * LEGACY_HERO_SCALE}px solid rgba(${color}, 0.7)`,
                      boxShadow: `0 0 ${(14 + pulseVal * 10) * LEGACY_HERO_SCALE}px rgba(${color}, 0.35)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={26 * LEGACY_HERO_SCALE} color={`rgb(${color})`} strokeWidth={1.5} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Part A — "Not Nested Loops": concentric amber loops build, hold, then deflate to gray */}
        {frame >= LOOP1_START && frame <= PART_A_END && (
          <svg width={SAFE_W} height={SAFE_H} viewBox={`0 0 ${SAFE_W} ${SAFE_H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
            {LOOPS.map((loop, idx) => {
              if (frame < loop.startFrame) return null;
              const fadeIn = itp(frame, [loop.startFrame, loop.fadeEnd], [0, 1]);
              const collapseOpacity = itp(frame, [COLLAPSE_START, COLLAPSE_OPACITY_END], [1, 0]);
              const collapseScale = itp(frame, [COLLAPSE_START, COLLAPSE_SCALE_END], [1, 0], Easing.in(Easing.cubic));
              const desatT = itp(frame, [COLLAPSE_START, COLLAPSE_DESAT_END], [0, 1]);
              const rotFrame = Math.min(frame, ROTATION_FREEZE);
              const angle = (rotFrame - loop.startFrame) * (360 / loop.period) * loop.direction;
              const lapProgress = (((angle % 360) + 360) % 360) / 360;
              const tipBrightness = Math.pow(Math.sin(lapProgress * Math.PI), 2);
              const effRadius = loop.radius * collapseScale;
              const tip = polarToCartesian(effRadius, 0);
              const color = rgbStr(mixArr(desatT, AMBER_ARR, GRAY_ARR));
              const opacity = fadeIn * collapseOpacity;
              return (
                <g key={idx} transform={`translate(${CENTER_X} ${CENTER_Y}) rotate(${angle})`} opacity={opacity}>
                  <path d={describeArc(effRadius, 0, 270)} stroke={`rgba(${color}, 0.55)`} strokeWidth={2.5} fill="none" strokeLinecap="round" />
                  <circle cx={tip.x} cy={tip.y} r={3 + tipBrightness * 2.5} fill="#FFFFFF" opacity={0.5 + tipBrightness * 0.5} />
                </g>
              );
            })}
          </svg>
        )}

        {/* Part B — "The Org Chart": procedural tree, blank rule pills, top-down pulse cascade */}
        {frame >= 210 && (
          <>
            <svg width={SAFE_W} height={SAFE_H} viewBox={`0 0 ${SAFE_W} ${SAFE_H}`} style={{ position: 'absolute', left: 0, top: 0 }}>
              {ORG_EDGES.map((edge) => renderEdge(edge, frame))}
              {renderPulses(ORG_EDGES.filter((e) => e.child.depth === 1), PULSE_LEVEL0_START, PULSE_LEVEL0_END, frame)}
              {renderPulses(ORG_EDGES.filter((e) => e.child.depth === 2), PULSE_LEVEL1_START, PULSE_LEVEL1_END, frame)}
            </svg>

            {RULE_TAG_CHILD_IDS.map((id, i) => renderRuleTag(id, i, frame))}

            {ORG_NODES.map((node) => renderBox(node, frame))}
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};
