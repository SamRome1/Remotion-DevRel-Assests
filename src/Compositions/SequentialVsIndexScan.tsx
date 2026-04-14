import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  Sequence,
} from 'remotion';

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG = '#0f1117';
const SURFACE = '#1e2130';
const SURFACE_DIM = '#181b26';
const BORDER = '#2a2e42';
const AMBER = '#f59e0b';
const EMERALD = '#10b981';
const FG = 'rgba(255,255,255,0.92)';
const FG_MUTED = 'rgba(255,255,255,0.4)';
const MONO = '"JetBrains Mono", "Fira Code", ui-monospace, monospace';
const SANS = 'system-ui, -apple-system, sans-serif';

// Canvas dimensions (vertical)
const W = 1080;
const H = 1920;

// ── Animation helpers ─────────────────────────────────────────────────────────
const CLAMP = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const itp = (
  frame: number,
  start: number,
  end: number,
  from = 0,
  to = 1,
) => interpolate(frame, [start, end], [from, to], CLAMP);

const sp = (frame: number, delay = 0, config?: { damping?: number; stiffness?: number; mass?: number }) =>
  spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 18, stiffness: 180, mass: 0.8, ...config },
  });

// ── Table data ─────────────────────────────────────────────────────────────────
const TABLE_ROWS = [
  { id: 1,  name: 'Alice Chen',   dept: 'Engineering', salary: 120000 },
  { id: 2,  name: 'Bob Turner',   dept: 'Marketing',   salary: 95000  },
  { id: 3,  name: 'Carol Smith',  dept: 'Finance',     salary: 110000 },
  { id: 4,  name: 'David Park',   dept: 'Engineering', salary: 135000 },
  { id: 5,  name: 'Eva Müller',   dept: 'HR',          salary: 88000  },
  { id: 6,  name: 'Frank Torres', dept: 'Engineering', salary: 115000 },
  { id: 7,  name: 'Grace Kim',    dept: 'Finance',     salary: 105000 },
  { id: 8,  name: 'Henry Lee',    dept: 'Marketing',   salary: 98000  },
  { id: 9,  name: 'Isabel Cruz',  dept: 'Engineering', salary: 128000 },
];

// ── Dot grid ──────────────────────────────────────────────────────────────────
const DotGrid: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1.5px, transparent 1.5px)',
      backgroundSize: '40px 40px',
      pointerEvents: 'none',
    }}
  />
);

// ── Table component ───────────────────────────────────────────────────────────
interface TableProps {
  highlightedRow: number;
  highlightAll?: boolean;
  accentColor: string;
  dimmedRows?: Set<number>;
  rowCount?: number;
  rowH?: number;
  hdrH?: number;
  fontSize?: number;
  hdrFontSize?: number;
}

const DataTable: React.FC<TableProps & { width: number }> = ({
  highlightedRow,
  highlightAll,
  accentColor,
  dimmedRows,
  rowCount = 9,
  width,
  rowH = 80,
  hdrH = 64,
  fontSize = 26,
  hdrFontSize = 22,
}) => {
  return (
    <div
      style={{
        width,
        borderRadius: 16,
        overflow: 'hidden',
        border: `1.5px solid ${BORDER}`,
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        background: SURFACE_DIM,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          height: hdrH,
          background: '#141720',
          borderBottom: `1.5px solid ${BORDER}`,
          alignItems: 'center',
          paddingLeft: 28,
          paddingRight: 28,
          gap: 0,
        }}
      >
        {[{ label: 'id', w: 64 }, { label: 'name', flex: 1 }, { label: 'dept', w: 180 }, { label: 'salary', w: 140 }].map((col) => (
          <span
            key={col.label}
            style={{
              fontFamily: MONO,
              fontSize: hdrFontSize,
              fontWeight: 700,
              color: FG_MUTED,
              width: 'w' in col ? col.w : undefined,
              flex: 'flex' in col ? col.flex : undefined,
              flexShrink: 0,
            }}
          >
            {col.label}
          </span>
        ))}
      </div>

      {/* Rows */}
      {TABLE_ROWS.slice(0, rowCount).map((row, ri) => {
        const isHighlighted = highlightAll || highlightedRow === ri;
        const isDimmed = dimmedRows ? dimmedRows.has(ri) && !isHighlighted : false;

        return (
          <div
            key={row.id}
            style={{
              display: 'flex',
              height: rowH,
              alignItems: 'center',
              paddingLeft: 28,
              paddingRight: 28,
              background: isHighlighted
                ? `rgba(${accentColor === AMBER ? '245,158,11' : '16,185,129'}, 0.13)`
                : ri % 2 === 0 ? SURFACE : SURFACE_DIM,
              borderBottom: `1px solid ${BORDER}`,
              borderLeft: isHighlighted ? `4px solid ${accentColor}` : '4px solid transparent',
              opacity: isDimmed ? 0.2 : 1,
              transition: 'none',
            }}
          >
            {[
              { val: String(row.id).padStart(2, ' '), w: 64,  mono: true,  color: FG_MUTED },
              { val: row.name,                        flex: 1, mono: false, color: isHighlighted ? FG : 'rgba(255,255,255,0.75)' },
              { val: row.dept,                        w: 180,  mono: false, color: isHighlighted ? accentColor : FG_MUTED },
              { val: `$${row.salary.toLocaleString()}`, w: 140, mono: true, color: isHighlighted ? accentColor : FG_MUTED },
            ].map((cell, ci) => (
              <span
                key={ci}
                style={{
                  fontFamily: cell.mono ? MONO : SANS,
                  fontSize: cell.mono ? fontSize - 2 : fontSize,
                  fontWeight: isHighlighted && !cell.mono ? 600 : 400,
                  color: cell.color,
                  width: 'w' in cell ? cell.w : undefined,
                  flex: 'flex' in cell ? cell.flex : undefined,
                  flexShrink: 0,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                {cell.val}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
};

// ── B-tree node ───────────────────────────────────────────────────────────────
interface BTreeNodeProps {
  label: string;
  x: number;
  y: number;
  highlighted: boolean;
  accentColor: string;
  size?: 'large' | 'medium' | 'small';
  opacity?: number;
}

const BTreeNode: React.FC<BTreeNodeProps> = ({
  label,
  x,
  y,
  highlighted,
  accentColor,
  size = 'medium',
  opacity = 1,
}) => {
  const dims = {
    large:  { w: 160, h: 76,  fontSize: 30, borderRadius: 14 },
    medium: { w: 140, h: 66,  fontSize: 26, borderRadius: 12 },
    small:  { w: 120, h: 58,  fontSize: 22, borderRadius: 10 },
  }[size];

  return (
    <div
      style={{
        position: 'absolute',
        left: x - dims.w / 2,
        top: y - dims.h / 2,
        width: dims.w,
        height: dims.h,
        borderRadius: dims.borderRadius,
        background: highlighted
          ? `rgba(${accentColor === EMERALD ? '16,185,129' : '245,158,11'}, 0.18)`
          : SURFACE,
        border: `2px solid ${highlighted ? accentColor : BORDER}`,
        boxShadow: highlighted
          ? `0 0 28px rgba(${accentColor === EMERALD ? '16,185,129' : '245,158,11'}, 0.40)`
          : '0 4px 16px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: dims.fontSize,
          fontWeight: 700,
          color: highlighted ? accentColor : FG,
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ── Scene 1: Sequential Scan ───────────────────────────────────────────────────
// Duration: 150 frames (5s at 30fps)
const SEQ_DURATION = 150;

// Layout constants for Scene 1 (vertical 1080×1920)
const S1_TABLE_LEFT  = 40;
const S1_TABLE_W     = W - 80;     // 1000px — full width minus margins
const S1_TABLE_TOP   = 400;        // below title + row counter card
const S1_ROW_H       = 130;
const S1_HDR_H       = 68;
const S1_TABLE_BOTTOM = S1_TABLE_TOP + S1_HDR_H + 9 * S1_ROW_H; // 1638

const SequentialScanScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleIn = itp(frame, 0, 18);
  const subtitleIn = itp(frame, 10, 28);

  const SCAN_START = 20;
  const FRAMES_PER_ROW = 12;
  const currentRow = Math.floor(Math.max(0, frame - SCAN_START) / FRAMES_PER_ROW);
  const clampedRow = Math.min(currentRow, 8);

  const scannedCount = Math.min(clampedRow + (frame > SCAN_START ? 1 : 0), 9);

  const arrowY = S1_TABLE_TOP + S1_HDR_H + clampedRow * S1_ROW_H + S1_ROW_H / 2;

  const allScanned = frame > SCAN_START + 9 * FRAMES_PER_ROW;

  return (
    <AbsoluteFill style={{ background: BG, overflow: 'hidden' }}>
      <DotGrid />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 72,
          left: S1_TABLE_LEFT,
          right: S1_TABLE_LEFT,
          opacity: titleIn,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontSize: 72,
            fontWeight: 800,
            color: AMBER,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          Sequential Scan
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 34,
            fontWeight: 400,
            color: FG_MUTED,
            marginTop: 12,
            opacity: subtitleIn,
          }}
        >
          Reads every row, top to bottom
        </div>
      </div>

      {/* Row counter badge — below the subtitle */}
      <div
        style={{
          position: 'absolute',
          top: 220,
          left: S1_TABLE_LEFT,
          right: S1_TABLE_LEFT,
          display: 'flex',
          justifyContent: 'flex-end',
          opacity: itp(frame, 18, 32),
        }}
      >
        <div
          style={{
            background: SURFACE,
            border: `2px solid ${AMBER}`,
            borderRadius: 16,
            padding: '16px 40px',
            boxShadow: `0 0 28px rgba(245,158,11,0.25)`,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 22,
              color: FG_MUTED,
              textAlign: 'center',
              marginBottom: 4,
            }}
          >
            rows scanned
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 64,
              fontWeight: 700,
              color: AMBER,
              textAlign: 'center',
              lineHeight: 1,
            }}
          >
            {scannedCount} / 9
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ position: 'absolute', top: S1_TABLE_TOP, left: S1_TABLE_LEFT }}>
        <DataTable
          width={S1_TABLE_W}
          highlightedRow={allScanned ? -1 : clampedRow}
          highlightAll={allScanned}
          accentColor={AMBER}
          rowH={S1_ROW_H}
          hdrH={S1_HDR_H}
          fontSize={28}
          hdrFontSize={24}
        />
      </div>

      {/* Scanning arrow — left side */}
      {!allScanned && frame > SCAN_START && (
        <div
          style={{
            position: 'absolute',
            left: S1_TABLE_LEFT - 4,
            top: arrowY - 22,
            display: 'flex',
            alignItems: 'center',
            opacity: itp(frame, SCAN_START, SCAN_START + 8),
          }}
        >
          <svg width={46} height={44} viewBox="0 0 46 44" fill="none">
            <line x1={2} y1={22} x2={36} y2={22} stroke={AMBER} strokeWidth={4} strokeLinecap="round" />
            <polygon points="34,10 46,22 34,34" fill={AMBER} />
          </svg>
        </div>
      )}

      {/* Scan line highlight overlay */}
      {!allScanned && frame > SCAN_START && (
        <div
          style={{
            position: 'absolute',
            left: S1_TABLE_LEFT,
            top: arrowY - S1_ROW_H / 2,
            width: S1_TABLE_W,
            height: S1_ROW_H,
            background: `rgba(245,158,11,0.06)`,
            borderTop: `1.5px solid rgba(245,158,11,0.3)`,
            borderBottom: `1.5px solid rgba(245,158,11,0.3)`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* "All rows read" badge */}
      {allScanned && (
        <div
          style={{
            position: 'absolute',
            top: S1_TABLE_BOTTOM + 30,
            left: '50%',
            transform: 'translateX(-50%)',
            background: `rgba(245,158,11,0.12)`,
            border: `2px solid ${AMBER}`,
            borderRadius: 14,
            padding: '20px 60px',
            fontFamily: SANS,
            fontSize: 34,
            fontWeight: 700,
            color: AMBER,
            whiteSpace: 'nowrap',
            opacity: itp(frame, SCAN_START + 9 * FRAMES_PER_ROW, SCAN_START + 9 * FRAMES_PER_ROW + 15),
            boxShadow: `0 0 40px rgba(245,158,11,0.25)`,
          }}
        >
          All 9 rows examined — O(n)
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── Scene 2: Index Scan ────────────────────────────────────────────────────────
// Duration: 150 frames (5s at 30fps)
const IDX_DURATION = 150;

// B-tree layout — centered in 1080px width, top half of 1920px canvas
// Top zone: y = 200–780 (~580px for the tree)
// Bottom zone: y = 870–1860 for the table
const TREE_CX = W / 2; // 540

const TREE_NODES = {
  root: { x: TREE_CX,       y: 290,  label: '1–9',  level: 'root'   as const },
  b1:   { x: TREE_CX - 220, y: 470,  label: '1–4',  level: 'branch' as const },
  b2:   { x: TREE_CX + 220, y: 470,  label: '5–9',  level: 'branch' as const },
  l1:   { x: TREE_CX - 360, y: 670,  label: '1–2',  level: 'leaf'   as const },
  l2:   { x: TREE_CX - 120, y: 670,  label: '3–4',  level: 'leaf'   as const },
  l3:   { x: TREE_CX + 120, y: 670,  label: '5–6',  level: 'leaf'   as const },
  l4:   { x: TREE_CX + 360, y: 670,  label: '7–9',  level: 'leaf'   as const },
};

// Edges between nodes
const TREE_EDGES = [
  { from: TREE_NODES.root, to: TREE_NODES.b1 },
  { from: TREE_NODES.root, to: TREE_NODES.b2 },
  { from: TREE_NODES.b1,   to: TREE_NODES.l1 },
  { from: TREE_NODES.b1,   to: TREE_NODES.l2 },
  { from: TREE_NODES.b2,   to: TREE_NODES.l3 },
  { from: TREE_NODES.b2,   to: TREE_NODES.l4 },
];

// Scene 2 table layout — bottom half of canvas
const S2_TABLE_LEFT   = 40;
const S2_TABLE_W      = W - 80;
const S2_TABLE_TOP    = 920;   // starts after the tree zone
const S2_ROW_H        = 72;
const S2_HDR_H        = 60;

// Scene 2 timeline
const S2_QUERY_IN     = 0;
const S2_TREE_IN      = 12;
const S2_TABLE_IN     = 25;
const S2_NAV_ROOT     = 38;
const S2_NAV_BRANCH   = 65;
const S2_NAV_LEAF     = 90;
const S2_JUMP_ARROW   = 112;
const S2_ROW_HL       = 120;

const IndexScanScene: React.FC = () => {
  const frame = useCurrentFrame();

  const globalIn = itp(frame, 0, 18);

  // Traversal highlight progress
  const rootHl   = itp(frame, S2_NAV_ROOT,   S2_NAV_ROOT + 10);
  const b2Hl     = itp(frame, S2_NAV_BRANCH, S2_NAV_BRANCH + 10);
  const l4Hl     = itp(frame, S2_NAV_LEAF,   S2_NAV_LEAF + 10);

  // Table slides up from below
  const tableEnterP = sp(frame, S2_TABLE_IN, { stiffness: 120, damping: 16, mass: 1 });
  const tableY = interpolate(tableEnterP, [0, 1], [H, S2_TABLE_TOP]);

  // Tree fades in
  const treeEnterP = sp(frame, S2_TREE_IN, { stiffness: 120, damping: 16, mass: 1 });
  const treeOpacity = interpolate(treeEnterP, [0, 1], [0, 1]);

  // Jump arrow progress
  const jumpProgress = itp(frame, S2_JUMP_ARROW, S2_JUMP_ARROW + 18);

  // Row highlight
  const rowHlP = itp(frame, S2_ROW_HL, S2_ROW_HL + 12);

  const TARGET_ROW = 6; // id=7, zero-indexed

  // Jump arrow: from l4 leaf going DOWN into the table section
  // l4 is at (TREE_CX+360, 670); arrow exits from bottom of node
  const LEAF_NODE_HALF_H = 29; // half of 58px leaf height
  const arrowStartX = TREE_NODES.l4.x;
  const arrowStartY = TREE_NODES.l4.y + LEAF_NODE_HALF_H;

  // Target: left edge of the table, at the vertical center of row 7
  const ROW_7_Y = S2_TABLE_TOP + S2_HDR_H + TARGET_ROW * S2_ROW_H + S2_ROW_H / 2;
  const arrowEndX = S2_TABLE_LEFT + S2_TABLE_W * 0.78; // roughly where row 7 lives horizontally (right side)
  const arrowEndY = ROW_7_Y;

  const arrowTipX = interpolate(jumpProgress, [0, 1], [arrowStartX, arrowEndX]);
  const arrowTipY = interpolate(jumpProgress, [0, 1], [arrowStartY, arrowEndY]);

  // Dimmed rows
  const dimmedRows = new Set<number>();
  if (frame > S2_ROW_HL) {
    for (let i = 0; i < 9; i++) {
      if (i !== TARGET_ROW) dimmedRows.add(i);
    }
  }

  return (
    <AbsoluteFill style={{ background: BG, overflow: 'hidden', opacity: globalIn }}>
      <DotGrid />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: 72,
          left: S2_TABLE_LEFT,
          opacity: itp(frame, 0, 16),
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontSize: 72,
            fontWeight: 800,
            color: EMERALD,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          Index Scan
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 34,
            fontWeight: 400,
            color: FG_MUTED,
            marginTop: 12,
          }}
        >
          Jumps directly to matching rows
        </div>
      </div>

      {/* Query badge — top right */}
      <div
        style={{
          position: 'absolute',
          top: 72,
          right: S2_TABLE_LEFT,
          background: SURFACE,
          border: `2px solid ${EMERALD}`,
          borderRadius: 14,
          padding: '16px 36px',
          boxShadow: `0 0 28px rgba(16,185,129,0.25)`,
          opacity: itp(frame, S2_QUERY_IN, S2_QUERY_IN + 18),
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: 20, color: FG_MUTED, marginBottom: 8 }}>
          SELECT * FROM employees
        </div>
        <div style={{ fontFamily: MONO, fontSize: 32, fontWeight: 700, color: EMERALD }}>
          WHERE id = 7
        </div>
      </div>

      {/* B-Tree section label */}
      <div
        style={{
          position: 'absolute',
          top: 210,
          left: S2_TABLE_LEFT,
          fontFamily: SANS,
          fontSize: 22,
          fontWeight: 600,
          color: FG_MUTED,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          opacity: itp(frame, S2_TREE_IN, S2_TREE_IN + 20),
        }}
      >
        B-Tree Index
      </div>

      {/* Table section label */}
      <div
        style={{
          position: 'absolute',
          top: 850,
          left: S2_TABLE_LEFT,
          fontFamily: SANS,
          fontSize: 22,
          fontWeight: 600,
          color: FG_MUTED,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          opacity: itp(frame, S2_TABLE_IN, S2_TABLE_IN + 20),
        }}
      >
        Table
      </div>

      {/* Table — rendered BEFORE SVG/tree nodes so tree elements paint on top */}
      <div
        style={{
          position: 'absolute',
          top: tableY,
          left: S2_TABLE_LEFT,
          opacity: itp(frame, S2_TABLE_IN, S2_TABLE_IN + 20),
        }}
      >
        <DataTable
          width={S2_TABLE_W}
          highlightedRow={rowHlP > 0.3 ? TARGET_ROW : -1}
          highlightAll={false}
          accentColor={EMERALD}
          dimmedRows={dimmedRows}
          rowH={S2_ROW_H}
          hdrH={S2_HDR_H}
          fontSize={26}
          hdrFontSize={22}
        />
      </div>

      {/* SVG layer: tree edges + jump arrow */}
      <svg
        width={W}
        height={H}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible', opacity: treeOpacity }}
      >
        {/* Static tree edges */}
        {TREE_EDGES.map((edge, i) => (
          <line
            key={i}
            x1={edge.from.x}
            y1={edge.from.y + 38}
            x2={edge.to.x}
            y2={edge.to.y - 29}
            stroke={`rgba(255,255,255,0.10)`}
            strokeWidth={2.5}
          />
        ))}

        {/* Highlighted path: root → b2 */}
        {b2Hl > 0.05 && (
          <line
            x1={TREE_NODES.root.x}
            y1={TREE_NODES.root.y + 38}
            x2={TREE_NODES.b2.x}
            y2={TREE_NODES.b2.y - 33}
            stroke={EMERALD}
            strokeWidth={3.5}
            opacity={b2Hl}
          />
        )}
        {/* Highlighted path: b2 → l4 */}
        {l4Hl > 0.05 && (
          <line
            x1={TREE_NODES.b2.x}
            y1={TREE_NODES.b2.y + 33}
            x2={TREE_NODES.l4.x}
            y2={TREE_NODES.l4.y - 29}
            stroke={EMERALD}
            strokeWidth={3.5}
            opacity={l4Hl}
          />
        )}

        {/* Jump arrow: from l4 leaf DOWN to the table row */}
        {jumpProgress > 0.01 && (
          <>
            <line
              x1={arrowStartX}
              y1={arrowStartY}
              x2={arrowTipX}
              y2={arrowTipY}
              stroke={EMERALD}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray="12 7"
              opacity={jumpProgress}
            />
            {/* Arrowhead at destination */}
            {jumpProgress > 0.85 && (
              <polygon
                points={`${arrowEndX - 12},${arrowEndY - 12} ${arrowEndX + 12},${arrowEndY - 12} ${arrowEndX},${arrowEndY + 6}`}
                fill={EMERALD}
                opacity={itp(frame, S2_JUMP_ARROW + 14, S2_JUMP_ARROW + 20)}
              />
            )}
          </>
        )}

        {/* Traversal pulse rings */}
        {rootHl > 0.3 && b2Hl < 0.5 && (
          <circle cx={TREE_NODES.root.x} cy={TREE_NODES.root.y} r={58} fill="none"
            stroke={EMERALD} strokeWidth={2} strokeDasharray="6 4" opacity={rootHl * 0.5} />
        )}
        {b2Hl > 0.3 && l4Hl < 0.5 && (
          <circle cx={TREE_NODES.b2.x} cy={TREE_NODES.b2.y} r={52} fill="none"
            stroke={EMERALD} strokeWidth={2} strokeDasharray="6 4" opacity={b2Hl * 0.5} />
        )}
        {l4Hl > 0.3 && (
          <circle cx={TREE_NODES.l4.x} cy={TREE_NODES.l4.y} r={46} fill="none"
            stroke={EMERALD} strokeWidth={2} strokeDasharray="6 4" opacity={l4Hl * 0.5} />
        )}
      </svg>

      {/* B-tree nodes */}
      <div style={{ opacity: treeOpacity }}>
        <BTreeNode {...TREE_NODES.root} highlighted={rootHl > 0.4} accentColor={EMERALD} size="large" />
        <BTreeNode {...TREE_NODES.b1}   highlighted={false}         accentColor={EMERALD} size="medium" opacity={itp(frame, S2_TREE_IN + 5, S2_TREE_IN + 20)} />
        <BTreeNode {...TREE_NODES.b2}   highlighted={b2Hl > 0.4}   accentColor={EMERALD} size="medium" opacity={itp(frame, S2_TREE_IN + 5, S2_TREE_IN + 20)} />
        <BTreeNode {...TREE_NODES.l1}   highlighted={false}         accentColor={EMERALD} size="small"  opacity={itp(frame, S2_TREE_IN + 10, S2_TREE_IN + 24)} />
        <BTreeNode {...TREE_NODES.l2}   highlighted={false}         accentColor={EMERALD} size="small"  opacity={itp(frame, S2_TREE_IN + 10, S2_TREE_IN + 24)} />
        <BTreeNode {...TREE_NODES.l3}   highlighted={false}         accentColor={EMERALD} size="small"  opacity={itp(frame, S2_TREE_IN + 10, S2_TREE_IN + 24)} />
        <BTreeNode {...TREE_NODES.l4}   highlighted={l4Hl > 0.4}   accentColor={EMERALD} size="small"  opacity={itp(frame, S2_TREE_IN + 10, S2_TREE_IN + 24)} />
      </div>

      {/* Traversal step tooltips */}
      {rootHl > 0.4 && b2Hl < 0.3 && (
        <div
          style={{
            position: 'absolute',
            left: TREE_NODES.root.x + 90,
            top: TREE_NODES.root.y - 26,
            fontFamily: SANS,
            fontSize: 24,
            fontWeight: 600,
            color: EMERALD,
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 10,
            padding: '8px 20px',
            opacity: rootHl,
            whiteSpace: 'nowrap',
          }}
        >
          7 &gt; midpoint → go right
        </div>
      )}
      {b2Hl > 0.4 && l4Hl < 0.3 && (
        <div
          style={{
            position: 'absolute',
            left: TREE_NODES.b2.x + 80,
            top: TREE_NODES.b2.y - 26,
            fontFamily: SANS,
            fontSize: 24,
            fontWeight: 600,
            color: EMERALD,
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 10,
            padding: '8px 20px',
            opacity: b2Hl,
            whiteSpace: 'nowrap',
          }}
        >
          7 &gt; 6 → go right
        </div>
      )}
      {l4Hl > 0.4 && jumpProgress < 0.2 && (
        <div
          style={{
            position: 'absolute',
            left: TREE_NODES.l4.x,
            top: TREE_NODES.l4.y + 36,
            transform: 'translateX(-50%)',
            fontFamily: SANS,
            fontSize: 24,
            fontWeight: 600,
            color: EMERALD,
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 10,
            padding: '8px 20px',
            opacity: l4Hl,
            whiteSpace: 'nowrap',
          }}
        >
          Leaf found — pointer to row
        </div>
      )}

      {/* Found row badge */}
      {rowHlP > 0.5 && (
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            background: `rgba(16,185,129,0.12)`,
            border: `2px solid ${EMERALD}`,
            borderRadius: 14,
            padding: '20px 60px',
            fontFamily: SANS,
            fontSize: 34,
            fontWeight: 700,
            color: EMERALD,
            whiteSpace: 'nowrap',
            opacity: itp(frame, S2_ROW_HL + 10, S2_ROW_HL + 24),
            boxShadow: `0 0 40px rgba(16,185,129,0.25)`,
          }}
        >
          Exactly 1 row — O(log n)
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── Scene 3: Comparison ────────────────────────────────────────────────────────
// Duration: 90 frames (3s at 30fps)
const CMP_DURATION = 90;

// Stacked vertically: sequential top, index bottom
const CMP_PANEL_W     = W - 80;
const CMP_TOP_Y       = 60;
const CMP_TOP_H       = 820;
const CMP_BOTTOM_Y    = 1030;
const CMP_BOTTOM_H    = 820;

// Compact row heights for the mini-tables in comparison scene
const CMP_ROW_H       = 70;
const CMP_HDR_H       = 52;

const ComparisonScene: React.FC = () => {
  const frame = useCurrentFrame();

  const globalIn = itp(frame, 0, 20);

  // Top panel (sequential) slides down from above
  const topIn = sp(frame, 10, { stiffness: 140, damping: 18, mass: 0.9 });
  // Bottom panel (index) slides up from below
  const bottomIn = sp(frame, 20, { stiffness: 140, damping: 18, mass: 0.9 });

  const complexityIn = itp(frame, 32, 52);

  const bannerIn = sp(frame, 55, { stiffness: 160, damping: 16, mass: 0.7 });
  const bannerScale = interpolate(bannerIn, [0, 1], [0.85, 1]);
  const bannerOpacity = interpolate(bannerIn, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ background: BG, overflow: 'hidden', opacity: globalIn }}>
      <DotGrid />

      {/* TOP: Sequential Scan */}
      <div
        style={{
          position: 'absolute',
          top: CMP_TOP_Y,
          left: 40,
          width: CMP_PANEL_W,
          opacity: interpolate(topIn, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(topIn, [0, 1], [-60, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontSize: 52,
            fontWeight: 800,
            color: AMBER,
            marginBottom: 20,
            letterSpacing: '-0.01em',
          }}
        >
          Sequential Scan
        </div>

        {/* Mini table — all rows amber */}
        <div
          style={{
            background: SURFACE_DIM,
            border: `2px solid ${AMBER}44`,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              background: '#1a1610',
              borderBottom: `2px solid ${AMBER}33`,
              padding: '14px 28px',
              fontFamily: MONO,
              fontSize: 20,
              fontWeight: 700,
              color: `${AMBER}88`,
              display: 'flex',
              gap: 0,
            }}
          >
            <span style={{ width: 64 }}>id</span>
            <span style={{ flex: 1 }}>name</span>
            <span style={{ width: 180 }}>dept</span>
          </div>

          {TABLE_ROWS.map((row, ri) => (
            <div
              key={ri}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: CMP_ROW_H,
                paddingLeft: 28,
                paddingRight: 28,
                background: `rgba(245,158,11,0.09)`,
                borderBottom: `1px solid ${AMBER}22`,
                borderLeft: `4px solid ${AMBER}`,
                gap: 0,
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 20, color: AMBER, width: 64 }}>
                {String(row.id).padStart(2, ' ')}
              </span>
              <span style={{ fontFamily: SANS, fontSize: 22, color: FG, flex: 1 }}>
                {row.name}
              </span>
              <span style={{ fontFamily: SANS, fontSize: 20, color: `${AMBER}aa`, width: 180 }}>
                {row.dept}
              </span>
            </div>
          ))}
        </div>

        {/* Complexity badge */}
        <div
          style={{
            marginTop: 20,
            textAlign: 'center',
            opacity: complexityIn,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 56,
              fontWeight: 800,
              color: AMBER,
              background: `rgba(245,158,11,0.10)`,
              border: `2px solid ${AMBER}66`,
              borderRadius: 14,
              padding: '12px 56px',
              display: 'inline-block',
            }}
          >
            O(n)
          </span>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 26,
              color: FG_MUTED,
              marginTop: 12,
            }}
          >
            Scans every row
          </div>
        </div>
      </div>

      {/* Horizontal divider */}
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: H / 2 - 1,
          width: CMP_PANEL_W,
          height: 2,
          background: `rgba(255,255,255,0.08)`,
          opacity: itp(frame, 15, 30),
        }}
      />

      {/* BOTTOM: Index Scan */}
      <div
        style={{
          position: 'absolute',
          top: CMP_BOTTOM_Y,
          left: 40,
          width: CMP_PANEL_W,
          opacity: interpolate(bottomIn, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(bottomIn, [0, 1], [60, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontSize: 52,
            fontWeight: 800,
            color: EMERALD,
            marginBottom: 20,
            letterSpacing: '-0.01em',
          }}
        >
          Index Scan
        </div>

        {/* Mini table — only row 7 green, others dim */}
        <div
          style={{
            background: SURFACE_DIM,
            border: `2px solid ${EMERALD}44`,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              background: '#101a14',
              borderBottom: `2px solid ${EMERALD}33`,
              padding: '14px 28px',
              fontFamily: MONO,
              fontSize: 20,
              fontWeight: 700,
              color: `${EMERALD}88`,
              display: 'flex',
              gap: 0,
            }}
          >
            <span style={{ width: 64 }}>id</span>
            <span style={{ flex: 1 }}>name</span>
            <span style={{ width: 180 }}>dept</span>
          </div>

          {TABLE_ROWS.map((row, ri) => {
            const isMatch = row.id === 7;
            return (
              <div
                key={ri}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: CMP_ROW_H,
                  paddingLeft: 28,
                  paddingRight: 28,
                  background: isMatch ? `rgba(16,185,129,0.13)` : SURFACE_DIM,
                  borderBottom: `1px solid ${isMatch ? `${EMERALD}33` : `${BORDER}88`}`,
                  borderLeft: isMatch ? `4px solid ${EMERALD}` : '4px solid transparent',
                  opacity: isMatch ? 1 : 0.18,
                  gap: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 20,
                    color: isMatch ? EMERALD : FG_MUTED,
                    width: 64,
                  }}
                >
                  {String(row.id).padStart(2, ' ')}
                </span>
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 22,
                    fontWeight: isMatch ? 700 : 400,
                    color: isMatch ? FG : FG_MUTED,
                    flex: 1,
                  }}
                >
                  {row.name}
                </span>
                <span
                  style={{
                    fontFamily: SANS,
                    fontSize: 20,
                    color: isMatch ? EMERALD : FG_MUTED,
                    width: 180,
                  }}
                >
                  {row.dept}
                </span>
              </div>
            );
          })}
        </div>

        {/* Complexity badge */}
        <div
          style={{
            marginTop: 20,
            textAlign: 'center',
            opacity: complexityIn,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 56,
              fontWeight: 800,
              color: EMERALD,
              background: `rgba(16,185,129,0.10)`,
              border: `2px solid ${EMERALD}66`,
              borderRadius: 14,
              padding: '12px 56px',
              display: 'inline-block',
            }}
          >
            O(log n)
          </span>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 26,
              color: FG_MUTED,
              marginTop: 12,
            }}
          >
            Navigates directly to the row
          </div>
        </div>
      </div>

      {/* "Index wins" banner */}
      <div
        style={{
          position: 'absolute',
          bottom: 72,
          left: '50%',
          transform: `translateX(-50%) scale(${bannerScale})`,
          opacity: bannerOpacity,
          background: `linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.08))`,
          border: `2.5px solid ${EMERALD}`,
          borderRadius: 20,
          padding: '24px 80px',
          boxShadow: `0 0 56px rgba(16,185,129,0.30), 0 16px 48px rgba(0,0,0,0.5)`,
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            fontFamily: SANS,
            fontSize: 44,
            fontWeight: 800,
            color: EMERALD,
            letterSpacing: '-0.01em',
          }}
        >
          Index wins for selective queries
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ── Root composition ───────────────────────────────────────────────────────────
export const SequentialVsIndexScan: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sequence from={0} durationInFrames={SEQ_DURATION}>
        <SequentialScanScene />
      </Sequence>
      <Sequence from={SEQ_DURATION} durationInFrames={IDX_DURATION}>
        <IndexScanScene />
      </Sequence>
      <Sequence from={SEQ_DURATION + IDX_DURATION} durationInFrames={CMP_DURATION}>
        <ComparisonScene />
      </Sequence>
    </AbsoluteFill>
  );
};
