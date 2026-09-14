import React from 'react';
import { Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, enter, fonts, radius } from '../theme';

/**
 * ReplicaTopology — one primary node with a fan of tiny read replicas.
 * Fixed-size block (TOPO_W × TOPO_H) positioned by the parent; scale it with
 * a CSS transform when it needs to be small (Scene 9).
 */
export const TOPO_W = 720;
export const TOPO_H = 480;

export const REPLICA_COLS = 8;
export const REPLICA_ROWS = 6;
export const REPLICA_COUNT = REPLICA_COLS * REPLICA_ROWS; // 48

const REPLICA_W = 64;
const REPLICA_H = 28;
const COL_GAP = 24;
const ROW_GAP = 22;
const PRIMARY_W = 200;
const PRIMARY_H = 56;
const ELEPHANT = 96;

type Props = {
  /** Frame (within the scene) at which the primary draws in. */
  primaryAt?: number;
  /** Frame at which the first replica appears. */
  replicasAt?: number;
  /** Frames between consecutive replicas. */
  stagger?: number;
  /** Render the elephant above the primary (Scene 9). Scene 6 animates its own. */
  showElephant?: boolean;
  /** Set false to render everything settled instantly. */
  animate?: boolean;
};

export const ReplicaTopology: React.FC<Props> = ({
  primaryAt = 0,
  replicasAt = 40,
  stagger = 2.5,
  showElephant = false,
  animate = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const settled = { opacity: 1, translateY: 0, scale: 1, progress: 1 };
  const ent = (d: number) => (animate ? enter(frame, fps, d) : settled);

  const gridW = REPLICA_COLS * REPLICA_W + (REPLICA_COLS - 1) * COL_GAP; // 680
  const gridLeft = (TOPO_W - gridW) / 2;
  const elephantTop = showElephant ? 0 : -ELEPHANT - 24; // hidden above when not shown
  const primaryTop = showElephant ? ELEPHANT + 24 : 0;
  const railTop = primaryTop + PRIMARY_H + 22;
  const gridTop = railTop + 22;

  const prim = ent(primaryAt);
  const railP = ent(primaryAt + 8).progress;

  return (
    <div style={{ position: 'relative', width: TOPO_W, height: TOPO_H }}>
      {showElephant ? (
        <Img
          src={staticFile('assets/postgresql.svg')}
          style={{
            position: 'absolute',
            left: TOPO_W / 2 - ELEPHANT / 2,
            top: elephantTop,
            width: ELEPHANT,
            height: ELEPHANT,
            objectFit: 'contain',
            opacity: prim.opacity,
          }}
        />
      ) : null}

      {/* primary */}
      <div
        style={{
          position: 'absolute',
          left: TOPO_W / 2 - PRIMARY_W / 2,
          top: primaryTop,
          width: PRIMARY_W,
          height: PRIMARY_H,
          border: `1px solid ${colors.zinc400}`,
          borderRadius: radius.sm,
          backgroundColor: colors.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: fonts.mono,
          fontSize: 18,
          letterSpacing: 1,
          color: colors.text,
          opacity: prim.opacity,
          transform: `translateY(${prim.translateY}px) scale(${prim.scale})`,
        }}
      >
        primary
      </div>

      {/* connector: vertical stem + horizontal rail */}
      <svg width={TOPO_W} height={TOPO_H} style={{ position: 'absolute', inset: 0, opacity: railP }}>
        <line
          x1={TOPO_W / 2}
          y1={primaryTop + PRIMARY_H}
          x2={TOPO_W / 2}
          y2={railTop}
          stroke={colors.zinc700}
          strokeWidth={1}
        />
        <line
          x1={TOPO_W / 2 - (gridW / 2) * railP}
          y1={railTop}
          x2={TOPO_W / 2 + (gridW / 2) * railP}
          y2={railTop}
          stroke={colors.zinc700}
          strokeWidth={1}
        />
      </svg>

      {/* replicas */}
      {Array.from({ length: REPLICA_COUNT }).map((_, i) => {
        const row = Math.floor(i / REPLICA_COLS);
        const col = i % REPLICA_COLS;
        const e = ent(replicasAt + i * stagger);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: gridLeft + col * (REPLICA_W + COL_GAP),
              top: gridTop + row * (REPLICA_H + ROW_GAP),
              width: REPLICA_W,
              height: REPLICA_H,
              border: `1px solid ${colors.zinc700}`,
              borderRadius: 6,
              backgroundColor: colors.bg,
              opacity: e.opacity,
              transform: `translateY(${e.translateY}px) scale(${e.scale})`,
            }}
          />
        );
      })}
    </div>
  );
};
