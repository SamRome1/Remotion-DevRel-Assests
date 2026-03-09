import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

// ── Palette ───────────────────────────────────────────────────────────────────
const BG    = '#0f0f0f';
const GREEN = '#3ecf8e';
const KW_C  = '#569cd6';
const STR_C = '#ce9178';
const PUN_C = '#d4d4d4';
const TXT_C = '#9cdcfe';
const DIM_C = '#444';
const BAD_C = '#f44747';

// ── Helpers ───────────────────────────────────────────────────────────────────
function itp(frame: number, a: number, b: number, from = 0, to = 1) {
  return interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
}
function sceneOpacity(frame: number, start: number, end: number, fade = 18) {
  const f = Math.min(fade, Math.floor((end - start) / 2));
  return itp(frame, start, start + f) * itp(frame, end - f, end, 1, 0);
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ── Metric cards (live data going wrong) ─────────────────────────────────────
type CardData = {
  label: string;
  values: string[];
  badValue: string;
  corruptFrame: number;
};

const CARDS: CardData[] = [
  { label: 'age',      values: ['28', '31', '25', '19', '42'],        badValue: '-999',         corruptFrame: 320 },
  { label: 'role',     values: ['user', 'admin', 'user', 'user'],     badValue: 'god_mode',     corruptFrame: 378 },
  { label: 'username', values: ['alice', 'bob', 'carol', 'dave'],     badValue: 'NULL',         corruptFrame: 430 },
  { label: 'email',    values: ['alice@co.com', 'b@x.io', 'c@y.net'], badValue: 'not-an-email', corruptFrame: 448 },
];

const MetricCard: React.FC<{
  data: CardData;
  frame: number;
  cardOpacity: number;
}> = ({ data, frame, cardOpacity }) => {
  const isBad = frame >= data.corruptFrame;
  const cycleIdx = Math.max(0, Math.floor((frame - 190) / 22) % data.values.length);
  const displayValue = isBad ? data.badValue : data.values[cycleIdx];
  const isNull = isBad && data.badValue === 'NULL';

  const valueOp = isBad
    ? itp(frame, data.corruptFrame + 3, data.corruptFrame + 14, 0, 1)
    : 1;

  const borderColor = isBad ? 'rgba(244,71,71,0.3)' : 'rgba(255,255,255,0.07)';
  const valueColor  = isNull ? DIM_C : isBad ? BAD_C : '#e0e0e0';

  return (
    <div style={{
      width: 380,
      backgroundColor: '#141414',
      border: `1px solid ${borderColor}`,
      borderRadius: 12,
      padding: '28px 32px',
      opacity: cardOpacity,
    }}>
      <div style={{ fontFamily: 'monospace', fontSize: 20, color: '#555', marginBottom: 14 }}>
        {data.label}
      </div>
      <div style={{
        fontFamily: 'monospace', fontSize: 40, fontWeight: 700,
        color: valueColor, opacity: valueOp,
      }}>
        {displayValue}
      </div>
    </div>
  );
};

// ── SQL ───────────────────────────────────────────────────────────────────────
type Tok = { t: string; c: string };

// Column names padded to 10 chars so UUID/TEXT and constraints all align
const SQL: Tok[][] = [
  [{ t: 'CREATE TABLE ', c: KW_C }, { t: 'profiles', c: TXT_C }, { t: ' (', c: PUN_C }],
  [{ t: '  id       ', c: TXT_C }, { t: 'UUID ', c: KW_C }, { t: 'PRIMARY KEY', c: GREEN }, { t: ',', c: PUN_C }],
  [{ t: '  email    ', c: TXT_C }, { t: 'TEXT ', c: KW_C }, { t: 'NOT NULL', c: GREEN }, { t: ',', c: PUN_C }],
  [{ t: '  username ', c: TXT_C }, { t: 'TEXT ', c: KW_C }, { t: 'UNIQUE NOT NULL', c: GREEN }, { t: ',', c: PUN_C }],
  [{ t: '  role     ', c: TXT_C }, { t: 'TEXT ', c: KW_C }, { t: 'CHECK ', c: GREEN }, { t: '(role IN (', c: PUN_C }, { t: "'admin'", c: STR_C }, { t: ', ', c: PUN_C }, { t: "'user'", c: STR_C }, { t: '))', c: PUN_C }],
  [{ t: ');', c: PUN_C }],
];

const LINE_STARTS = [470, 486, 542, 620, 693, 782];
const SQL_FS      = 32;
const CPF         = 2;

function renderSQLLine(line: Tok[], charsShown: number): React.ReactNode {
  let rem = charsShown;
  return line.map((tok, i) => {
    if (rem <= 0) return null;
    const show = tok.t.slice(0, rem);
    rem -= tok.t.length;
    return show ? <span key={i} style={{ color: tok.c }}>{show}</span> : null;
  });
}

// ── Script label ──────────────────────────────────────────────────────────────
const ScriptLabel: React.FC<{ text: string; wordProgress: number; opacity: number }> = ({
  text, wordProgress, opacity,
}) => {
  const words = text.split(' ');
  return (
    <div style={{
      opacity, width: '100%',
      display: 'flex', flexWrap: 'wrap', alignItems: 'center',
      fontFamily: 'monospace', padding: '0 44px',
      gap: '0 12px', fontSize: 40, lineHeight: 1.7,
      justifyContent: 'center',
    }}>
      <span style={{ color: GREEN, fontSize: 48, fontWeight: 300 }}>{'['}</span>
      {words.map((word, i) => {
        const a = Math.max(0, 1 - Math.abs(wordProgress - (i + 0.5)));
        const r = Math.round(lerp(160, 62, a));
        const g = Math.round(lerp(170, 207, a));
        const b = Math.round(lerp(160, 142, a));
        return (
          <span key={i} style={{ color: `rgb(${r},${g},${b})`, fontWeight: a > 0.3 ? 700 : 400 }}>
            {word}
          </span>
        );
      })}
      <span style={{ color: GREEN, fontSize: 48, fontWeight: 300 }}>{']'}</span>
    </div>
  );
};

// ── Scenes ────────────────────────────────────────────────────────────────────
const SCENES = [
  { start: 0,   end: 85,  script: "Constraints aren't restrictions.",              visual: 'center' },
  { start: 70,  end: 190, script: "They're documentation that enforces itself.",   visual: 'center' },
  { start: 190, end: 262, script: 'Your app validates data.',                      visual: 'bars'   },
  { start: 247, end: 330, script: "But the database doesn't know that.",           visual: 'bars'   },
  { start: 315, end: 390, script: 'A script runs directly.',                       visual: 'bars'   },
  { start: 375, end: 445, script: 'A bug slips through.',                          visual: 'bars'   },
  { start: 430, end: 490, script: 'Invalid data. No warning.',                     visual: 'bars'   },
  { start: 468, end: 560, script: 'Constraints change that.',                      visual: 'sql'    },
  { start: 542, end: 635, script: 'NOT NULL — the field must exist.',               visual: 'sql'    },
  { start: 620, end: 708, script: 'UNIQUE — it can never repeat.',                 visual: 'sql'    },
  { start: 693, end: 780, script: 'CHECK — it must pass a rule.',                  visual: 'sql'    },
  { start: 765, end: 845, script: 'Written once. Enforced everywhere.',             visual: 'sql'    },
  { start: 830, end: 910, script: 'Not in your app. In the database.',              visual: 'sql'    },
];

// ── Main component ────────────────────────────────────────────────────────────
export const ConstraintsDoc: React.FC = () => {
  const frame = useCurrentFrame();
  const blink = frame % 18 < 10;

  const barsOp = itp(frame, 190, 210) * itp(frame, 452, 472, 1, 0);
  const sqlOp  = itp(frame, 465, 490) * itp(frame, 898, 925, 1, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>

      {/* ── METRIC CARDS ─────────────────────────────────────────────────── */}
      {barsOp > 0 && (
        <AbsoluteFill style={{ opacity: barsOp, alignItems: 'center', justifyContent: 'center', paddingBottom: 400 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, width: 808 }}>
            {CARDS.map((card, i) => {
              const cardOp = itp(frame, 190 + i * 15, 190 + i * 15 + 25);
              return <MetricCard key={i} data={card} frame={frame} cardOpacity={cardOp} />;
            })}
          </div>
        </AbsoluteFill>
      )}

      {/* ── SQL ────────────────────────────────────────────────────────────── */}
      {sqlOp > 0 && (
        <AbsoluteFill style={{ opacity: sqlOp, alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'monospace', fontSize: SQL_FS, width: 'max-content' }}>
            {SQL.map((line, li) => {
              const lf      = LINE_STARTS[li];
              const lineLen = line.reduce((s, t) => s + t.t.length, 0);
              const chars   = frame < lf ? 0 : Math.min(lineLen, Math.round((frame - lf) * CPF));
              const typing  = chars < lineLen && frame >= lf && blink;
              return (
                <div key={li} style={{ height: SQL_FS * 1.75, display: 'flex', alignItems: 'center', whiteSpace: 'pre' }}>
                  {renderSQLLine(line, chars)}
                  {typing && (
                    <span style={{
                      display: 'inline-block', width: 3, height: '0.85em',
                      backgroundColor: GREEN, marginLeft: 1, verticalAlign: 'middle',
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      {/* ── CAPTIONS ───────────────────────────────────────────────────────── */}
      {SCENES.map((scene, idx) => {
        const op = sceneOpacity(frame, scene.start, scene.end);
        if (op <= 0) return null;
        const words = scene.script.split(' ');
        const wp    = itp(frame, scene.start + 18, scene.end - 18, 0, words.length);
        return (
          <AbsoluteFill
            key={idx}
            style={scene.visual === 'center'
              ? { justifyContent: 'center', alignItems: 'flex-start' }
              : { justifyContent: 'flex-end', alignItems: 'flex-start', paddingBottom: 520 }
            }
          >
            <ScriptLabel text={scene.script} wordProgress={wp} opacity={op} />
          </AbsoluteFill>
        );
      })}

    </AbsoluteFill>
  );
};
