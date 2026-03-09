import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';

// ── Palette ──────────────────────────────────────────────────────────────────
const BG = '#1a1830';
const PURPLE = '#a78bfa';
const GRAY = '#5a6478';
const GRAY_DIM = '#3d4451';

// ── Helpers ──────────────────────────────────────────────────────────────────
function itp(frame: number, a: number, b: number, from = 0, to = 1) {
  return interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}
function sceneOpacity(frame: number, start: number, end: number, fade = 18) {
  return itp(frame, start, start + fade) * itp(frame, end - fade, end, 1, 0);
}
function eio(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ── Bar pool ─────────────────────────────────────────────────────────────────
// All layouts share the same N bars. Each layout defines where every bar lives.
// Unused bars are collapsed (w=0, opacity=0) near the shape's centre.
// Morphing = interpolating every bar's x/y/w/opacity between two layouts.

const N   = 56;   // total bars in pool
const BH  = 21;   // bar height px
const RS  = 42;   // row spacing px
const CW  = 690;  // container width px
const CH  = 840;  // container height px

// writeIdx: order in which this bar is "typed" during write-in animation
interface Bar { x: number; y: number; w: number; color: string; opacity: number; writeIdx: number }

type RowDef = { x: number; w: number; color: string }[][];

function makeLayout(rows: RowDef, yStart: number, collapsedX: number, collapsedY: number): Bar[] {
  const out: Bar[] = [];
  let wi = 0;
  for (let ri = 0; ri < rows.length; ri++) {
    for (const b of rows[ri]) {
      out.push({ x: b.x, y: yStart + ri * RS, w: b.w, color: b.color, opacity: 1, writeIdx: wi++ });
    }
  }
  while (out.length < N) {
    out.push({ x: collapsedX, y: collapsedY, w: 0, color: GRAY, opacity: 0, writeIdx: wi++ });
  }
  return out;
}

// Returns how wide a bar should render given write-in progress.
// writeProgress goes 0 → totalBars; each bar grows in when its turn comes.
function writeWidth(bar: Bar, wp: number | null): number {
  if (wp === null) return bar.w;
  const p = wp - bar.writeIdx;
  if (p <= 0) return 0;
  if (p >= 1) return bar.w;
  return bar.w * p;
}
function writeOpacity(bar: Bar, wp: number | null): number {
  if (wp === null) return bar.opacity;
  return wp > bar.writeIdx ? bar.opacity : 0;
}

function morph(from: Bar[], to: Bar[], t: number): Bar[] {
  const te = eio(Math.max(0, Math.min(1, t)));
  return from.map((f, i) => ({
    x:        lerp(f.x,       to[i].x,       te),
    y:        lerp(f.y,       to[i].y,       te),
    w:        lerp(f.w,       to[i].w,       te),
    color:    te < 0.5 ? f.color : to[i].color,
    opacity:  lerp(f.opacity, to[i].opacity, te),
    writeIdx: f.writeIdx, // not used during morphs
  }));
}

// ── Row definitions (pre-scaled ×1.5) ────────────────────────────────────────

// HELIX — 20 rows × 2 bars = 40 active bars
const HELIX_ROWS: RowDef = [
  [{x:150,w:120,color:PURPLE},{x:291,w:150,color:GRAY}],
  [{x:120,w:135,color:GRAY  },{x:276,w:105,color:PURPLE}],
  [{x:81, w:165,color:PURPLE},{x:264,w:120,color:GRAY}],
  [{x:45, w:135,color:GRAY  },{x:201,w:150,color:PURPLE}],
  [{x:21, w:150,color:PURPLE},{x:189,w:120,color:GRAY}],
  [{x:30, w:120,color:GRAY  },{x:168,w:135,color:PURPLE}],
  [{x:60, w:150,color:PURPLE},{x:231,w:105,color:GRAY}],
  [{x:93, w:120,color:GRAY  },{x:234,w:135,color:PURPLE}],
  [{x:126,w:135,color:PURPLE},{x:276,w:105,color:GRAY}],
  [{x:150,w:120,color:GRAY  },{x:291,w:120,color:PURPLE}],
  [{x:126,w:135,color:PURPLE},{x:276,w:105,color:GRAY}],
  [{x:93, w:120,color:GRAY  },{x:234,w:135,color:PURPLE}],
  [{x:60, w:150,color:PURPLE},{x:231,w:105,color:GRAY}],
  [{x:30, w:120,color:GRAY  },{x:168,w:135,color:PURPLE}],
  [{x:21, w:150,color:PURPLE},{x:189,w:120,color:GRAY}],
  [{x:45, w:135,color:GRAY  },{x:201,w:150,color:PURPLE}],
  [{x:81, w:165,color:PURPLE},{x:264,w:120,color:GRAY}],
  [{x:120,w:135,color:GRAY  },{x:276,w:105,color:PURPLE}],
  [{x:150,w:120,color:PURPLE},{x:291,w:150,color:GRAY}],
  [{x:120,w:135,color:GRAY  },{x:276,w:105,color:PURPLE}],
];

// FOCUS — 8 rows × 2 bars = 16 active bars
const FOCUS_ROWS: RowDef = [
  [{x:90, w:150,color:PURPLE},{x:258,w:120,color:GRAY}],
  [{x:60, w:120,color:GRAY  },{x:198,w:135,color:PURPLE}],
  [{x:30, w:165,color:PURPLE},{x:213,w:105,color:GRAY}],
  [{x:48, w:135,color:GRAY  },{x:201,w:120,color:PURPLE}],
  [{x:78, w:120,color:PURPLE},{x:216,w:135,color:GRAY}],
  [{x:108,w:150,color:GRAY  },{x:276,w:105,color:PURPLE}],
  [{x:78, w:120,color:PURPLE},{x:216,w:135,color:GRAY}],
  [{x:48, w:135,color:GRAY  },{x:201,w:120,color:PURPLE}],
];

// ABSTRACT — 5 rows × 2 bars = 10 active bars
const ABSTRACT_ROWS: RowDef = [
  [{x:66, w:150,color:PURPLE},{x:231,w:120,color:GRAY}],
  [{x:33, w:120,color:GRAY  },{x:171,w:135,color:PURPLE}],
  [{x:18, w:165,color:PURPLE},{x:201,w:90, color:GRAY}],
  [{x:48, w:120,color:GRAY  },{x:186,w:120,color:PURPLE}],
  [{x:81, w:135,color:PURPLE},{x:231,w:105,color:GRAY}],
];

// MESSY — 15 rows, 55 active bars total
const MESSY_ROWS: RowDef = [
  [{x:0,w:180,color:PURPLE},{x:201,w:120,color:GRAY  },{x:333,w:150,color:GRAY  },{x:495,w:90,color:PURPLE}],
  [{x:33,w:135,color:GRAY  },{x:183,w:165,color:PURPLE},{x:366,w:105,color:GRAY  },{x:486,w:120,color:PURPLE}],
  [{x:15,w:210,color:GRAY  },{x:243,w:90, color:PURPLE},{x:351,w:180,color:GRAY}],
  [{x:0,w:120,color:PURPLE},{x:138,w:150,color:GRAY  },{x:306,w:120,color:PURPLE},{x:441,w:135,color:GRAY},{x:591,w:75,color:PURPLE}],
  [{x:45,w:150,color:GRAY  },{x:213,w:210,color:PURPLE},{x:438,w:120,color:GRAY}],
  [{x:0,w:90, color:PURPLE},{x:108,w:180,color:GRAY  },{x:306,w:135,color:PURPLE},{x:456,w:105,color:GRAY}],
  [{x:33,w:225,color:GRAY  },{x:276,w:120,color:PURPLE},{x:411,w:150,color:GRAY}],
  [{x:0,w:150,color:PURPLE},{x:168,w:90, color:GRAY  },{x:276,w:195,color:PURPLE},{x:486,w:90,color:GRAY}],
  [{x:18,w:120,color:GRAY  },{x:156,w:165,color:PURPLE},{x:336,w:135,color:GRAY  },{x:486,w:105,color:PURPLE}],
  [{x:0,w:195,color:GRAY  },{x:213,w:105,color:PURPLE},{x:336,w:165,color:GRAY}],
  [{x:33,w:135,color:PURPLE},{x:186,w:150,color:GRAY  },{x:351,w:120,color:PURPLE},{x:486,w:135,color:GRAY}],
  [{x:0,w:165,color:GRAY  },{x:183,w:120,color:PURPLE},{x:321,w:180,color:GRAY}],
  [{x:18,w:105,color:PURPLE},{x:141,w:195,color:GRAY  },{x:351,w:90, color:PURPLE},{x:456,w:120,color:GRAY}],
  [{x:0,w:150,color:GRAY  },{x:168,w:135,color:PURPLE},{x:321,w:150,color:GRAY  },{x:486,w:105,color:PURPLE}],
  [{x:33,w:180,color:PURPLE},{x:231,w:120,color:GRAY  },{x:366,w:150,color:PURPLE}],
];

// FUNC_A — 7 rows × 3 bars = 21 active bars
const FUNC_A_ROWS: RowDef = [
  [{x:0,w:150,color:PURPLE},{x:171,w:120,color:GRAY  },{x:306,w:90, color:PURPLE}],
  [{x:33,w:120,color:GRAY  },{x:171,w:150,color:PURPLE},{x:336,w:105,color:GRAY}],
  [{x:18,w:180,color:PURPLE},{x:216,w:90, color:GRAY  },{x:321,w:120,color:PURPLE}],
  [{x:0,w:105,color:GRAY  },{x:123,w:150,color:PURPLE},{x:291,w:120,color:GRAY}],
  [{x:33,w:135,color:PURPLE},{x:186,w:120,color:GRAY  },{x:321,w:90, color:PURPLE}],
  [{x:0,w:165,color:GRAY  },{x:183,w:105,color:PURPLE},{x:306,w:135,color:GRAY}],
  [{x:18,w:120,color:PURPLE},{x:156,w:135,color:GRAY  },{x:306,w:105,color:PURPLE}],
];

// FUNC_B — 7 rows × 3 bars = 21 active bars
const FUNC_B_ROWS: RowDef = [
  [{x:0,w:135,color:GRAY  },{x:153,w:165,color:PURPLE},{x:336,w:90, color:GRAY}],
  [{x:33,w:150,color:PURPLE},{x:201,w:105,color:GRAY  },{x:321,w:120,color:PURPLE}],
  [{x:0,w:120,color:GRAY  },{x:138,w:135,color:PURPLE},{x:291,w:150,color:GRAY}],
  [{x:18,w:165,color:PURPLE},{x:201,w:90, color:GRAY  },{x:306,w:120,color:PURPLE}],
  [{x:0,w:105,color:GRAY  },{x:123,w:150,color:PURPLE},{x:291,w:105,color:GRAY}],
  [{x:33,w:135,color:PURPLE},{x:186,w:120,color:GRAY  },{x:321,w:90, color:PURPLE}],
  [{x:0,w:150,color:GRAY  },{x:168,w:105,color:PURPLE},{x:291,w:135,color:GRAY}],
];

// ── Build all layouts ─────────────────────────────────────────────────────────
// Centre each shape inside CH=840.
// HELIX (20r, h=19×42+21=819): y≈10   collapsed at (220,430)
// FOCUS (8r,  h=7×42+21 =315): y=262  collapsed at (180,420)
// ABSTRACT(5r,h=4×42+21 =189): y=325  collapsed at (150,430)
// MESSY (15r, h=14×42+21=609): y=115  collapsed at (300,430)
// SPLIT: FUNC_A at y=117, FUNC_B at y=450  collapsed at (150,430)

const HELIX_L    = makeLayout(HELIX_ROWS,    10,  220, 430);
const FOCUS_L    = makeLayout(FOCUS_ROWS,    262, 180, 420);
const ABSTRACT_L = makeLayout(ABSTRACT_ROWS, 325, 150, 430);
const MESSY_L    = makeLayout(MESSY_ROWS,    115, 300, 430);

const SPLIT_L: Bar[] = (() => {
  const out: Bar[] = [];
  const yA = 117, yB = 450;
  for (let ri = 0; ri < FUNC_A_ROWS.length; ri++)
    for (const b of FUNC_A_ROWS[ri])
      out.push({ x: b.x, y: yA + ri * RS, w: b.w, color: b.color, opacity: 1 });
  for (let ri = 0; ri < FUNC_B_ROWS.length; ri++)
    for (const b of FUNC_B_ROWS[ri])
      out.push({ x: b.x, y: yB + ri * RS, w: b.w, color: b.color, opacity: 1 });
  while (out.length < N)
    out.push({ x: 150, y: 430, w: 0, color: GRAY, opacity: 0 });
  return out;
})();

// ── Morph schedule ───────────────────────────────────────────────────────────
// helix→focus: bars 0-15 travel to focus, bars 16-39 collapse inward
// focus→abstract: bars 0-9 travel to abstract, bars 10-15 collapse
// messy→split: bars 0-41 reorganise, bars 42-54 collapse
// split→helix: bars 0-39 reassemble into helix, bars 40-41 collapse

const MORPH_STEPS = [
  { from: HELIX_L,    to: FOCUS_L,    start: 72,  end: 97  },
  { from: FOCUS_L,    to: ABSTRACT_L, start: 152, end: 177 },
  { from: MESSY_L,    to: SPLIT_L,    start: 690, end: 760 },
  { from: SPLIT_L,    to: HELIX_L,    start: 777, end: 857 },
];

// Write-in timing:
//   Helix at start:   frames 0  → 65   (40 bars over 65 frames)
//   Messy after essay: frames 380 → 470  (55 bars over 90 frames)
const HELIX_WRITE_START  = 0,   HELIX_WRITE_END  = 65,  HELIX_BARS  = 40;
const MESSY_WRITE_START  = 380, MESSY_WRITE_END  = 470, MESSY_BARS  = 55;

function getVisualBars(frame: number): { bars: Bar[]; opacity: number; writeProgress: number | null } {
  // Overall opacity — hidden during text-only gap; write-in scenes handle their own appearance
  let opacity = 1;
  if (frame > 205 && frame < 230) opacity = itp(frame, 205, 230, 1, 0);
  else if (frame >= 230 && frame < 380) opacity = 0;
  else if (frame > 855 && frame < 875) opacity = itp(frame, 855, 875, 1, 0);
  else if (frame >= 875) opacity = 0;

  // Active morph?
  for (const m of MORPH_STEPS) {
    if (frame >= m.start && frame <= m.end) {
      const t = (frame - m.start) / (m.end - m.start);
      return { bars: morph(m.from, m.to, t), opacity, writeProgress: null };
    }
  }

  // Static state between morphs
  let bars: Bar[];
  if      (frame < 72)  bars = HELIX_L;
  else if (frame < 152) bars = FOCUS_L;
  else if (frame < 230) bars = ABSTRACT_L;
  else if (frame < 690) bars = MESSY_L;
  else if (frame < 777) bars = SPLIT_L;
  else                  bars = HELIX_L;

  // Write-in progress
  let writeProgress: number | null = null;
  if (frame >= HELIX_WRITE_START && frame <= HELIX_WRITE_END && bars === HELIX_L) {
    writeProgress = itp(frame, HELIX_WRITE_START, HELIX_WRITE_END, 0, HELIX_BARS);
  } else if (frame >= MESSY_WRITE_START && frame <= MESSY_WRITE_END && bars === MESSY_L) {
    writeProgress = itp(frame, MESSY_WRITE_START, MESSY_WRITE_END, 0, MESSY_BARS);
  }

  return { bars, opacity, writeProgress };
}

// ── Script label — karaoke word highlight ─────────────────────────────────────
// wordProgress: float 0 → numWords; each word lights up purple when reached.
const ScriptLabel: React.FC<{ text: string; wordProgress: number; opacity: number }> = ({
  text, wordProgress, opacity,
}) => {
  const words = text.split(' ');
  return (
    <div style={{
      opacity,
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0 16px',
      fontFamily: 'monospace',
      fontSize: 46,
      lineHeight: 1.6,
      textAlign: 'center',
      padding: '0 60px',
    }}>
      <span style={{ color: GRAY_DIM, marginRight: 4, fontSize: 54 }}>{'{'}</span>
      {words.map((word, i) => {
        // Bell curve centred on this word: peaks at 1 when wordProgress == i+0.5
        const activation = Math.max(0, 1 - Math.abs(wordProgress - (i + 0.5)));
        const r = Math.round(lerp(200, 167, activation));
        const g = Math.round(lerp(208, 139, activation));
        const b = Math.round(lerp(224, 250, activation));
        return (
          <span key={i} style={{
            color: `rgb(${r},${g},${b})`,
            fontWeight: activation > 0.3 ? 700 : 400,
          }}>
            {word}
          </span>
        );
      })}
      <span style={{ color: GRAY_DIM, marginLeft: 4, fontSize: 54 }}>{'}'}</span>
    </div>
  );
};

// ── Scene definitions ─────────────────────────────────────────────────────────
const SCENES = [
  { start: 0,   end: 90,  script: 'Functions should be small.',                                                                            highlight: 'small',       visual: true  },
  { start: 72,  end: 162, script: 'They should do one thing.',                                                                             highlight: 'one thing',   visual: true  },
  { start: 144, end: 240, script: 'They should operate at one level of abstraction.',                                                      highlight: 'abstraction', visual: true  },
  { start: 222, end: 342, script: "We've discussed these rules — but nobody writes clean code on the first try.",                          highlight: 'first try',   visual: false },
  { start: 324, end: 420, script: 'Writing code is like writing an essay.',                                                                highlight: 'essay',       visual: false },
  { start: 402, end: 510, script: 'We get our thoughts down first.',                                                                       highlight: 'first',       visual: true  },
  { start: 492, end: 612, script: 'Messy and disorganized. Nested loops, names that mean nothing, long argument lists, duplicated code everywhere.', highlight: 'Messy', visual: true },
  { start: 594, end: 708, script: "And that's completely fine — as long as we have tests covering all of it, we can refactor with confidence.", highlight: 'fine',   visual: true  },
  { start: 690, end: 795, script: 'We split functions, find better names, eliminate duplication.',                                         highlight: 'split',       visual: true  },
  { start: 777, end: 867, script: 'Iteration by iteration, the code starts following every rule,',                                        highlight: 'Iteration',   visual: true  },
  { start: 849, end: 900, script: "so clean code isn't written — it's rewritten.",                                                        highlight: 'rewritten',   visual: false },
];

const PRINCIPLES = [
  'Small','Do One Thing','Levels of Abstraction','Switch Statements',
  'Function Arguments','Side Effects','Command Query Separation',
  'Error Handling','DRY','Writing Process',
];

// ── Main component ────────────────────────────────────────────────────────────
export const CleanCode: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { bars, opacity: barsOpacity, writeProgress } = getVisualBars(frame);

  // Determine if split-function labels should show
  const splitLabelOpacity = sceneOpacity(frame, 690, 795);
  // y positions of the two function headers (matching SPLIT_L y offsets)
  const FUNC_A_Y = 117;
  const FUNC_B_Y = 450;
  const FUNC_A_HEADER_Y = FUNC_A_Y - 36;
  const FUNC_B_HEADER_Y = FUNC_B_Y - 36;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: 'monospace', overflow: 'hidden' }}>

      {/* ── Morphing bar pool ── */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: barsOpacity }}>
        <div style={{ position: 'relative', width: CW, height: CH }}>
          {/* Function signature text for SPLIT scene */}
          {splitLabelOpacity > 0 && (
            <>
              <div style={{
                position: 'absolute',
                left: 0,
                top: FUNC_A_HEADER_Y,
                color: GRAY,
                fontSize: 22,
                opacity: splitLabelOpacity,
                whiteSpace: 'nowrap',
              }}>
                {'function updateO(id, title, description, author, duration) {'}
              </div>
              <div style={{
                position: 'absolute',
                left: 0,
                top: FUNC_A_Y + 7 * RS + 6,
                color: GRAY,
                fontSize: 22,
                opacity: splitLabelOpacity,
              }}>{'}'}</div>
              <div style={{
                position: 'absolute',
                left: 0,
                top: FUNC_B_HEADER_Y,
                color: GRAY,
                fontSize: 22,
                opacity: splitLabelOpacity,
                whiteSpace: 'nowrap',
              }}>
                {'function updateC(id, title, description, instructor, duration) {'}
              </div>
              <div style={{
                position: 'absolute',
                left: 0,
                top: FUNC_B_Y + 7 * RS + 6,
                color: GRAY,
                fontSize: 22,
                opacity: splitLabelOpacity,
              }}>{'}'}</div>
            </>
          )}

          {/* The bars */}
          {bars.map((bar, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: bar.x,
                top: bar.y,
                width: Math.max(0, writeWidth(bar, writeProgress)),
                height: BH,
                borderRadius: 6,
                backgroundColor: bar.color,
                opacity: writeOpacity(bar, writeProgress),
              }}
            />
          ))}
        </div>
      </AbsoluteFill>

      {/* ── Script labels ── */}
      {SCENES.map((scene, idx) => {
        const op = sceneOpacity(frame, scene.start, scene.end);
        if (op <= 0) return null;
        const numWords = scene.script.split(' ').length;
        // Start highlighting after the fade-in, finish just before fade-out
        const wordProgress = itp(frame, scene.start + 18, scene.end - 18, 0, numWords);
        return (
          <AbsoluteFill
            key={idx}
            style={scene.visual
              ? { justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 140 }
              : { justifyContent: 'center',   alignItems: 'center' }
            }
          >
            <ScriptLabel text={scene.script} wordProgress={wordProgress} opacity={op} />
          </AbsoluteFill>
        );
      })}

      {/* ── Final checklist ── */}
      {frame >= 849 && (
        <AbsoluteFill style={{
          alignItems: 'center',
          justifyContent: 'center',
          opacity: itp(frame, 849, 875),
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 680 }}>
            <div style={{ color: '#e2e8f0', fontSize: 56, fontWeight: 700, marginBottom: 36 }}>
              Functions
            </div>
            {PRINCIPLES.map((p, i) => {
              const isLast = i === PRINCIPLES.length - 1;
              const rowOp = itp(frame, 860 + i * 4, 872 + i * 4);
              return (
                <div key={p} style={{
                  opacity: rowOp,
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  backgroundColor: isLast ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)',
                  borderRadius: 8,
                  padding: '13px 20px',
                  marginBottom: 5,
                  gap: 18,
                }}>
                  <span style={{ color: GRAY, fontSize: 20, width: 28, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ color: '#e2e8f0', fontSize: 22 }}>✓</span>
                  <span style={{ color: isLast ? PURPLE : '#e2e8f0', fontSize: 24, fontWeight: isLast ? 700 : 400 }}>{p}</span>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
