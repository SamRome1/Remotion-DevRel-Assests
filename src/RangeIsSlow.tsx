import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';

// ── Data ──────────────────────────────────────────────────────────────────

const NAMES = [
  'Luxurious Metal Gloves', 'Fantastic Metal Shirt', 'Unbranded Plastic Computer',
  'Handcrafted Cotton Computer', 'Incredible Ceramic Shirt', 'Soft Gold Keyboard',
  'Rustic Granite Chips', 'Beautiful Silk Soap', 'Ergonomic Aluminum Bike',
  'Tasty Marble Pants', 'Elegant Granite Tuna', 'Awesome Bamboo Gloves',
  'Incredible Steel Shirt', 'Awesome Marble Pizza', 'Fantastic Wooden Cheese',
  'Refined Gold Pizza', 'Recycled Cotton Soup', 'Unbranded Silk Bacon',
  'Handcrafted Plastic Sausages', 'Intelligent Plastic Hat', 'Licensed Ceramic Gloves',
  'Incredible Aluminum Bike', 'Handcrafted Metal Composite', 'Frozen Bronze Shoes',
];

const BRANDS = [
  'Luettgen Inc', 'Beier Inc', 'Considine & Stracke', 'Vandervort',
  'Wuckert and Sons', 'Swaniph LLC', "O'Hara, Ritchie", 'Fahey LLC',
  'Ullrich & Pfeiffer', 'Mansur Group', 'Corbet, Schuppa', 'Bloker Schmidt',
  'Hamill Group', 'Jacobs LLC', 'Kessler Inc',
];

const TOTAL_ROWS = 120;
const HL_START   = 70; // 0-indexed, highlighted range
const HL_END     = 74;

const allRows = Array.from({ length: TOTAL_ROWS }, (_, i) => ({
  id:    String(i + 1).padStart(6, '0'),
  name:  NAMES[i % NAMES.length],
  price: (80 + (i * 8.7 + Math.abs(Math.sin(i * 1.3)) * 300)).toFixed(2),
  brand: BRANDS[i % BRANDS.length],
  cat:   String((i % 12) + 1),
}));

// ── Layout constants ──────────────────────────────────────────────────────

const ROW_H  = 50;
const HDR_H  = 56;
const HL_H   = (HL_END - HL_START + 1) * ROW_H; // 250px

// Table fills the full composition width with small margin
const TABLE_W   = 1760;
const TABLE_L   = (1920 - TABLE_W) / 2;   // 80px left margin
const VISIBLE_H = 820;
const TABLE_T   = (1080 - VISIBLE_H) / 2; // 130px top margin

// Where the highlighted rows sit inside the scrollable content
const HL_ABS_TOP = HDR_H + HL_START * ROW_H;  // 856px from content top

// Scroll so highlighted rows are centered in the visible window
const SCROLL_STOP = Math.max(0, HL_ABS_TOP - (VISIBLE_H - HL_H) / 2);
// = 856 - (820 - 250) / 2 = 856 - 285 = 571

// Y of the highlight band within the visible window once scrolled
const HL_IN_WINDOW = HL_ABS_TOP - SCROLL_STOP; // 285px from top of window

// Phase timings
const T_SCAN_END      = 130;
const T_FLIP_START    = 125;
const T_HL_SHOW       = 165;
const T_EXTRACT_START = 215;


// Column definitions
const COLS = [
  { key: 'id',    label: 'id',          w: 110,        mono: true,  color: '#6e7681', hlColor: '#6e7681' },
  { key: 'name',  label: 'name',        flex: 1,       mono: false, color: '#e6edf3', hlColor: '#86efac' },
  { key: 'price', label: 'price',       w: 130,        mono: false, color: '#3fb950', hlColor: '#4ade80' },
  { key: 'brand', label: 'brand',       w: 280,        mono: false, color: '#58a6ff', hlColor: '#86efac' },
  { key: 'cat',   label: 'category_id', w: 150,        mono: false, color: '#8b949e', hlColor: '#4ade80' },
] as const;

// ── Sub-components ────────────────────────────────────────────────────────

type RowData = typeof allRows[number];

const TableRow: React.FC<{ row: RowData; ri: number; forceHighlight?: boolean; highlightActive?: boolean }> = ({
  row, ri, forceHighlight, highlightActive,
}) => {
  const hl = forceHighlight ?? (highlightActive && ri >= HL_START && ri <= HL_END);
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: ROW_H,
      backgroundColor: hl ? '#061306' : (ri % 2 === 0 ? '#0d1117' : '#0a0f16'),
      borderBottom: `1px solid ${hl ? '#1a3a1a' : '#21262d'}`,
      paddingLeft: 20,
      paddingRight: 20,
      boxSizing: 'border-box',
      flexShrink: 0,
    }}>
      {COLS.map((col) => {
        const val = col.key === 'price' ? `$${row[col.key]}` : row[col.key];
        return (
          <span key={col.key} style={{
            width: 'w' in col ? col.w : undefined,
            flex: 'flex' in col ? col.flex : undefined,
            color: hl ? col.hlColor : col.color,
            fontFamily: col.mono ? 'monospace' : 'system-ui, -apple-system, sans-serif',
            fontSize: col.mono ? 14 : 15,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            marginRight: 8,
            flexShrink: 0,
          }}>
            {val}
          </span>
        );
      })}
    </div>
  );
};

const TableHeader: React.FC<{ green?: boolean }> = ({ green }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    height: HDR_H,
    backgroundColor: green ? '#081509' : '#161b22',
    borderBottom: `${green ? 2 : 1}px solid ${green ? '#1a4a1a' : '#30363d'}`,
    paddingLeft: 20,
    paddingRight: 20,
    boxSizing: 'border-box',
    flexShrink: 0,
  }}>
    {COLS.map((col) => (
      <span key={col.key} style={{
        width: 'w' in col ? col.w : undefined,
        flex: 'flex' in col ? col.flex : undefined,
        fontFamily: 'monospace',
        fontSize: 16,
        fontWeight: 'bold',
        color: green ? '#4ade80' : '#8b949e',
        marginRight: 8,
        flexShrink: 0,
      }}>
        {col.label}
      </span>
    ))}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────

export const RangeIsSlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 1. Fast scroll during scan phase
  const scrollY = interpolate(frame, [0, T_SCAN_END], [0, SCROLL_STOP], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // 2. 3D flip spring
  const flipP = spring({
    frame: frame - T_FLIP_START,
    fps,
    config: { damping: 22, stiffness: 55, mass: 1.3 },
  });
  const rotX      = interpolate(flipP, [0, 1], [0, -25]);  // degrees
  const rotY      = interpolate(flipP, [0, 1], [0,  18]);
  const tableDown = interpolate(flipP, [0, 1], [0,  50]);  // shift down on flip
  const tableZ    = interpolate(flipP, [0, 1], [0, -320]); // push back so it stays on screen

  // 3. Highlight band fade-in
  const hlP = interpolate(frame, [T_HL_SHOW, T_HL_SHOW + 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 4. Extract spring
  const extractP = spring({
    frame: frame - T_EXTRACT_START,
    fps,
    config: { damping: 20, stiffness: 50, mass: 1.1 },
  });

  // Main table fades out during extraction
  const tableOpacity = interpolate(extractP, [0.5, 1.0], [1, 0.12], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Result panel rotation: matches main table rotation, then unrolls to flat
  const resultRotX = interpolate(extractP, [0, 0.75], [rotX, 0], {
    extrapolateRight: 'clamp',
  });
  const resultRotY = interpolate(extractP, [0, 0.75], [rotY, 0], {
    extrapolateRight: 'clamp',
  });

  // Result panel moves from highlight position → screen center
  const resultPanelH = HDR_H + HL_H;
  const initialResultTop = TABLE_T + tableDown + HL_IN_WINDOW;
  const finalResultTop   = (height - resultPanelH) / 2;
  const resultTop  = interpolate(extractP, [0, 1], [initialResultTop, finalResultTop]);
  const resultLeft = interpolate(extractP, [0, 1], [TABLE_L, (width - TABLE_W) / 2]);

  const resultOpacity = interpolate(
    frame,
    [T_EXTRACT_START, T_EXTRACT_START + 12],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );


  // Fade in on first frames
  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#030805', overflow: 'hidden', opacity: fadeIn }}>

      {/* ── Perspective container ── */}
      <div style={{
        position: 'absolute',
        width,
        height,
        perspective: 1400,
        perspectiveOrigin: `${width / 2}px ${height / 2}px`,
      }}>

        {/* ── Main table (3D tilted) ── */}
        <div style={{
          position: 'absolute',
          top:    TABLE_T + tableDown,
          left:   TABLE_L,
          width:  TABLE_W,
          height: VISIBLE_H,
          transform: `translateZ(${tableZ}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transformOrigin: `${TABLE_W / 2}px ${VISIBLE_H / 2}px`,
          overflow: 'hidden',
          opacity: tableOpacity,
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        }}>
          {/* Scrolling content */}
          <div style={{
            position: 'absolute',
            top: -scrollY,
            left: 0,
            width: TABLE_W,
          }}>
            <TableHeader />
            {allRows.map((row, ri) => (
              <TableRow key={ri} row={row} ri={ri} highlightActive={hlP > 0} />
            ))}
          </div>

          {/* Green highlight band */}
          {hlP > 0 && (
            <div style={{
              position: 'absolute',
              top:   HL_ABS_TOP - scrollY,
              left:  0,
              width: TABLE_W,
              height: HL_H,
              backgroundColor: `rgba(0, 255, 85, ${hlP * 0.10})`,
              borderTop:    `2px solid rgba(0, 255, 85, ${hlP * 0.55})`,
              borderBottom: `2px solid rgba(0, 255, 85, ${hlP * 0.55})`,
              boxShadow: `0 0 24px rgba(0, 255, 85, ${hlP * 0.20})`,
              pointerEvents: 'none',
            }} />
          )}
        </div>

        {/* ── Extracted result panel ── */}
        {resultOpacity > 0 && (
          <div style={{
            position: 'absolute',
            top:   resultTop,
            left:  resultLeft,
            width: TABLE_W,
            transform: `rotateX(${resultRotX}deg) rotateY(${resultRotY}deg)`,
            transformOrigin: `${TABLE_W / 2}px 50%`,
            opacity: resultOpacity,
            overflow: 'hidden',
            backgroundColor: '#040d06',
            border: '2px solid rgba(0, 255, 85, 0.65)',
            boxShadow: '0 0 50px rgba(0, 255, 85, 0.18), 0 30px 80px rgba(0,0,0,0.6)',
          }}>
            <TableHeader green />
            {allRows.slice(HL_START, HL_END + 1).map((row, ri) => (
              <TableRow key={ri} row={row} ri={ri} forceHighlight />
            ))}
          </div>
        )}
      </div>


    </AbsoluteFill>
  );
};
