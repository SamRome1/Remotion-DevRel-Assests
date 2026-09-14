import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, enter, fonts, lerp, radius } from '../theme';

/**
 * ArchDiagram — the load-bearing system diagram populated across Scenes 1–5.
 *
 * Five named slots in full-canvas (1080×1080) coordinates. Nodes are hollow
 * rounded rects with 1px zinc-700 borders, joined by 1px lines. `collapse`
 * (0→1) pulls every node toward the db slot, shrinking and fading it.
 */
export type SlotId = 'frontend' | 'agent' | 'backend' | 'infra' | 'db';

type NodeSpec = { x: number; y: number; w: number; h: number };

export const ARCH_NODES: Record<SlotId, NodeSpec> = {
  frontend: { x: 300, y: 330, w: 230, h: 110 },
  agent: { x: 780, y: 330, w: 230, h: 110 },
  backend: { x: 300, y: 570, w: 230, h: 110 },
  infra: { x: 780, y: 570, w: 230, h: 120 },
  db: { x: 540, y: 800, w: 290, h: 130 },
};

const EDGES: [SlotId, SlotId][] = [
  ['frontend', 'agent'],
  ['frontend', 'backend'],
  ['agent', 'infra'],
  ['backend', 'infra'],
  ['backend', 'db'],
  ['infra', 'db'],
];

const SLOT_ORDER: SlotId[] = ['frontend', 'agent', 'backend', 'infra', 'db'];

type Props = {
  /** Content rendered inside each node. Missing slots stay hollow. */
  slots?: Partial<Record<SlotId, React.ReactNode>>;
  /** 0 = laid out, 1 = fully swallowed into the db slot. */
  collapse?: number;
  /** Whole-diagram opacity (used to ghost it behind foreground content). */
  opacity?: number;
  /** Border color override for the db node (e.g. faint accent glow moment). */
  dbBorder?: string;
};

export const ArchDiagram: React.FC<Props> = ({ slots = {}, collapse = 0, opacity = 1, dbBorder }) => {
  const db = ARCH_NODES.db;
  const c = Math.max(0, Math.min(1, collapse));

  const pos = (id: SlotId) => {
    const n = ARCH_NODES[id];
    if (id === 'db') return { cx: n.x, cy: n.y, s: 1 - 0.3 * c, o: 1 - Math.max(0, (c - 0.6) / 0.4) };
    return {
      cx: lerp(n.x, db.x, c),
      cy: lerp(n.y, db.y, c),
      s: lerp(1, 0.15, c),
      o: 1 - Math.min(1, c * 1.15),
    };
  };

  const lineOpacity = Math.max(0, 1 - c * 2.5);

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
      <svg width={1080} height={1080} style={{ position: 'absolute', inset: 0, opacity: lineOpacity }}>
        {EDGES.map(([a, b]) => {
          const pa = pos(a);
          const pb = pos(b);
          return (
            <line
              key={`${a}-${b}`}
              x1={pa.cx}
              y1={pa.cy}
              x2={pb.cx}
              y2={pb.cy}
              stroke={colors.zinc700}
              strokeWidth={1}
            />
          );
        })}
      </svg>
      {SLOT_ORDER.map((id) => {
        const n = ARCH_NODES[id];
        const p = pos(id);
        return (
          <div
            key={id}
            style={{
              position: 'absolute',
              left: p.cx - n.w / 2,
              top: p.cy - n.h / 2,
              width: n.w,
              height: n.h,
              border: `1px solid ${id === 'db' && dbBorder ? dbBorder : colors.zinc700}`,
              borderRadius: radius.md,
              backgroundColor: colors.bg,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transform: `scale(${p.s})`,
              opacity: p.o,
            }}
          >
            {slots[id]}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// SlotBadge — small official-logo badge (optionally with a word) for a slot
// ---------------------------------------------------------------------------
type BadgeProps = {
  /** Path under public/, e.g. "assets/react.svg". */
  src: string;
  /** Optional word lockup beside the mark, Inter 500 zinc-400. */
  word?: string;
  /** Frame (within the scene) at which the entrance begins. */
  delay?: number;
  /** false = already present, render settled with no entrance. */
  animate?: boolean;
  size?: number;
};

export const SlotBadge: React.FC<BadgeProps> = ({ src, word, delay = 0, animate = true, size = 30 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = animate ? enter(frame, fps, delay) : { opacity: 1, translateY: 0, scale: 1 };
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        opacity: e.opacity,
        transform: `translateY(${e.translateY}px) scale(${e.scale})`,
      }}
    >
      <Img src={staticFile(src)} style={{ width: size, height: size, objectFit: 'contain' }} />
      {word ? (
        <span style={{ fontFamily: fonts.ui, fontWeight: 500, fontSize: 20, color: colors.zinc400 }}>{word}</span>
      ) : null}
    </div>
  );
};

/** Row of badges inside a single slot. */
export const SlotRow: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 18 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap }}>{children}</div>
);
