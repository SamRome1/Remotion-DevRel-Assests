import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import {
  GREEN,
  RED,
  MONO,
  FG,
  FG_MUTED,
  SURFACE_75,
  SURFACE_100,
  BORDER,
  SYN_TABLE,
  SYN_STRING,
  boxBase,
  itp,
  sp,
  CheckIcon,
  CrossIcon,
} from '../tokens';
import { loadFont, fontFamily as interFont } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['400', '600'] });

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type RowHighlight = 'allow' | 'deny' | 'neutral' | 'dim';

export interface ColumnDef {
  /** Column header label */
  label: string;
  /** Fixed width in px. Last column can omit for flex:1 */
  width?: number;
  /** Optional color override for all cells in this column */
  color?: string;
  /** If true, renders cell value with monospace font */
  mono?: boolean;
}

export interface RowData {
  /** Unique key */
  id: string;
  /** Cell values — must match number of columns */
  cells: string[];
  /** Visual state */
  highlight?: RowHighlight;
  /** Global frame at which this row enters */
  enterFrame?: number;
}

export interface TableProps {
  columns: ColumnDef[];
  rows: RowData[];
  /** Optional table name label above the header */
  tableName?: string;
  /** Whether to show check/cross icon column */
  showStatus?: boolean;
  /** Compact mode — reduces row height */
  compact?: boolean;
  /** Global frame at which the whole table enters */
  enterFrame?: number;
  /** Enter from direction */
  enterFrom?: 'left' | 'right' | 'none';
  /** Global frame at which table exits */
  exitFrame?: number;
  exitTo?: 'left' | 'right';
  /** translateX offset applied after entrance — used for shifting left mid-video */
  offsetX?: number;
  style?: React.CSSProperties;
}

export interface TableHeaderProps {
  columns: ColumnDef[];
  showStatus?: boolean;
  compact?: boolean;
}

export interface TableRowProps {
  columns: ColumnDef[];
  row: RowData;
  showStatus?: boolean;
  compact?: boolean;
  /** If provided, overrides row.highlight */
  highlight?: RowHighlight;
}

// ─────────────────────────────────────────────────────────────────────────────
// Row highlight styles
// ─────────────────────────────────────────────────────────────────────────────

const highlightStyles = (
  h: RowHighlight,
): { bg: string; border: string; opacity: number } => {
  switch (h) {
    case 'allow':
      return {
        bg:      'rgba(62,207,142,0.08)',
        border:  'rgba(62,207,142,0.35)',
        opacity: 1,
      };
    case 'deny':
      return {
        bg:      'rgba(255,64,64,0.06)',
        border:  'rgba(255,64,64,0.25)',
        opacity: 0.35,
      };
    case 'dim':
      return { bg: SURFACE_100, border: BORDER, opacity: 0.25 };
    default:
      return { bg: SURFACE_100, border: BORDER, opacity: 1 };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TableHeader
// ─────────────────────────────────────────────────────────────────────────────

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  showStatus = false,
  compact    = false,
}) => (
  <div
    style={{
      display:    'flex',
      alignItems: 'center',
      background: SURFACE_75,
      border:     `1px solid ${BORDER}`,
      borderRadius: '8px 8px 0 0',
      height:     compact ? 30 : 34,
      overflow:   'hidden',
    }}
  >
    {columns.map((col, i) => (
      <div
        key={col.label}
        style={{
          width:       col.width,
          flex:        col.width ? undefined : 1,
          flexShrink:  0,
          padding:     '0 14px',
          fontFamily:  `${interFont}, sans-serif`,
          fontSize:    10,
          fontWeight:  600,
          color:       col.color ?? FG_MUTED,
          letterSpacing: '0.07em',
          textTransform: 'uppercase' as const,
          borderRight: i < columns.length - 1 ? `1px solid ${BORDER}` : 'none',
          whiteSpace:  'nowrap',
        }}
      >
        {col.label}
      </div>
    ))}
    {showStatus && (
      <div style={{ width: 40, flexShrink: 0 }} />
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TableRow
// ─────────────────────────────────────────────────────────────────────────────

export const TableRow: React.FC<TableRowProps> = ({
  columns,
  row,
  showStatus = false,
  compact    = false,
  highlight,
}) => {
  const frame = useCurrentFrame();
  const h     = highlight ?? row.highlight ?? 'neutral';
  const hs    = highlightStyles(h);

  const enterSpring = sp(frame, row.enterFrame ?? 0);
  const enterOp     = Math.min(enterSpring * 1.8, 1);
  const enterX      = interpolate(enterSpring, [0, 1], [16, 0]);

  return (
    <div
      style={{
        display:    'flex',
        alignItems: 'center',
        background: hs.bg,
        border:     `1px solid ${hs.border}`,
        borderRadius: 7,
        overflow:   'hidden',
        height:     compact ? 36 : 42,
        opacity:    enterOp * hs.opacity,
        transform:  `translateX(${enterX}px)`,
        transition: 'background 0.35s, border-color 0.35s, opacity 0.35s',
      }}
    >
      {columns.map((col, i) => {
        const val   = row.cells[i] ?? '';
        const color = col.color ?? FG;

        return (
          <div
            key={i}
            style={{
              width:      col.width,
              flex:       col.width ? undefined : 1,
              flexShrink: 0,
              padding:    '0 14px',
              fontFamily: col.mono !== false ? MONO : `${interFont}, sans-serif`,
              fontSize:   compact ? 12 : 13,
              color,
              borderRight: i < columns.length - 1 ? `1px solid ${BORDER}` : 'none',
              whiteSpace:  'nowrap',
              overflow:    'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {val}
          </div>
        );
      })}

      {/* Status icon column */}
      {showStatus && (
        <div
          style={{
            width:           40,
            flexShrink:      0,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
          }}
        >
          {h === 'allow' && <CheckIcon progress={1} size={16} />}
          {h === 'deny'  && <CrossIcon opacity={1}  size={16} />}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Table — full composed table with optional entrance/exit/shift animations
// ─────────────────────────────────────────────────────────────────────────────

export const Table: React.FC<TableProps> = ({
  columns,
  rows,
  tableName,
  showStatus = false,
  compact    = false,
  enterFrame = 0,
  enterFrom  = 'right',
  exitFrame,
  exitTo     = 'left',
  offsetX    = 0,
  style,
}) => {
  const frame = useCurrentFrame();

  // ── Entrance ──
  const enterSpring = sp(frame, enterFrame);
  const enterX      = interpolate(
    enterSpring, [0, 1],
    [enterFrom === 'left' ? -80 : enterFrom === 'right' ? 80 : 0, 0],
  );
  const enterOp = Math.min(enterSpring * 1.5, 1);

  // ── Exit ──
  let exitX  = 0;
  let exitOp = 1;
  if (exitFrame !== undefined) {
    const exitProg = itp(frame, exitFrame, exitFrame + 28);
    exitX  = interpolate(exitProg, [0, 1], [0, exitTo === 'left' ? -120 : 120]);
    exitOp = 1 - exitProg;
  }

  // ── Row count summary ──
  const allowCount = rows.filter(r => (r.highlight ?? 'neutral') === 'allow').length;
  const denyCount  = rows.filter(r => (r.highlight ?? 'neutral') === 'deny').length;
  const showSummary = allowCount > 0 || denyCount > 0;

  // Frame at which summary appears — after last row enters
  const lastRowFrame = Math.max(...rows.map(r => r.enterFrame ?? 0));
  const summaryOp    = itp(frame, lastRowFrame + 20, lastRowFrame + 38);

  return (
    <div
      style={{
        opacity:   enterOp * exitOp,
        transform: `translateX(${enterX + exitX + offsetX}px)`,
        ...style,
      }}
    >
      {/* Table name label */}
      {tableName && (
        <div
          style={{
            fontFamily:    MONO,
            fontSize:      12,
            color:         FG_MUTED,
            marginBottom:  8,
            letterSpacing: '0.06em',
          }}
        >
          {tableName}
        </div>
      )}

      {/* Header */}
      <TableHeader columns={columns} showStatus={showStatus} compact={compact} />

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 3 }}>
        {rows.map(row => (
          <TableRow
            key={row.id}
            columns={columns}
            row={row}
            showStatus={showStatus}
            compact={compact}
          />
        ))}
      </div>

      {/* Row count summary */}
      {showSummary && (
        <div
          style={{
            marginTop: 10,
            display:   'flex',
            gap:       16,
            opacity:   summaryOp,
          }}
        >
          {allowCount > 0 && (
            <span style={{ fontFamily: MONO, fontSize: 12, color: GREEN }}>
              ✓ {allowCount} row{allowCount !== 1 ? 's' : ''} returned
            </span>
          )}
          {denyCount > 0 && (
            <span style={{ fontFamily: MONO, fontSize: 12, color: RED }}>
              ✗ {denyCount} row{denyCount !== 1 ? 's' : ''} hidden
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Preset column definitions — reuse these for common Supabase table patterns
// ─────────────────────────────────────────────────────────────────────────────

export const POSTS_COLUMNS: ColumnDef[] = [
  { label: 'id',      width: 80,  color: FG_MUTED, mono: true },
  { label: 'user_id', width: 180, color: SYN_TABLE, mono: true },
  { label: 'content', mono: true },
];

export const USERS_COLUMNS: ColumnDef[] = [
  { label: 'id',    width: 80,  color: FG_MUTED, mono: true },
  { label: 'email', width: 220, color: SYN_STRING, mono: true },
  { label: 'role',  mono: true },
];

export const STORAGE_COLUMNS: ColumnDef[] = [
  { label: 'name',       width: 200, mono: true },
  { label: 'bucket_id',  width: 160, color: SYN_TABLE, mono: true },
  { label: 'owner',      mono: true },
];