import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

// ── Palette ───────────────────────────────────────────────────────────────────
const BG    = '#0f0f0f';
const GREEN = '#3ecf8e';
const KW_C  = '#569cd6';
const STR_C = '#ce9178';
const FN_C  = GREEN;
const PUN_C = '#d4d4d4';
const TXT_C = '#9cdcfe';

// ── Helpers ───────────────────────────────────────────────────────────────────
function itp(frame: number, a: number, b: number, from = 0, to = 1) {
  return interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}
function sceneOpacity(frame: number, start: number, end: number, fade = 18) {
  const f = Math.min(fade, Math.floor((end - start) / 2));
  return itp(frame, start, start + f) * itp(frame, end - f, end, 1, 0);
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }


// ── Schema diagram ────────────────────────────────────────────────────────────
const SCHEMA_W      = 980;
const BLOCK_W       = 240;
const BLOCK_HDR_H   = 56;
const BLOCK_ROW_H   = 50;

type ColDef = { name: string; highlight?: boolean; fk?: boolean };

const USERS_COLS: ColDef[] = [
  { name: 'id' },
  { name: 'email' },
  { name: 'api_key', highlight: true },
  { name: 'created_at' },
];

const CHILD_TABLES: { title: string; left: number; cols: ColDef[] }[] = [
  { title: 'profiles', left: 10,  cols: [{ name: 'id' }, { name: 'user_id', fk: true }, { name: 'full_name' },  { name: 'avatar_url' }] },
  { title: 'orders',   left: 370, cols: [{ name: 'id' }, { name: 'user_id', fk: true }, { name: 'amount' },     { name: 'status' }] },
  { title: 'posts',    left: 730, cols: [{ name: 'id' }, { name: 'user_id', fk: true }, { name: 'title' },      { name: 'content' }] },
];

const USERS_W      = 340;
const USERS_HDR_H  = 68;
const USERS_ROW_H  = 60;

const blockH = (cols: ColDef[]) => BLOCK_HDR_H + cols.length * BLOCK_ROW_H;
const usersH = () => USERS_HDR_H + USERS_COLS.length * USERS_ROW_H;
const USERS_LEFT   = (SCHEMA_W - USERS_W) / 2;
const USERS_H      = usersH();
const CENTER_X     = USERS_LEFT + USERS_W / 2;
const CHILD_TOP    = USERS_H + 110;
const SCHEMA_H     = CHILD_TOP + blockH(CHILD_TABLES[0].cols);

const SchemaBlock: React.FC<{
  title: string; cols: ColDef[];
  left: number; top: number;
  opacity: number; scl?: number;
  width?: number; hdrH?: number; rowH?: number; fontSize?: number;
}> = ({ title, cols, left, top, opacity, scl = 1, width = BLOCK_W, hdrH = BLOCK_HDR_H, rowH = BLOCK_ROW_H, fontSize = 16 }) => (
  <div style={{
    position: 'absolute', left, top, width,
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, overflow: 'hidden',
    opacity, transform: `scale(${scl})`, transformOrigin: 'center top',
  }}>
    <div style={{
      height: hdrH, backgroundColor: '#252525',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px',
    }}>
      <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: GREEN }} />
      <span style={{ color: '#e0e0e0', fontSize: fontSize + 4, fontWeight: 700, fontFamily: 'monospace' }}>{title}</span>
    </div>
    {cols.map((col, i) => (
      <div key={i} style={{
        height: rowH, display: 'flex', alignItems: 'center', padding: '0 16px',
        backgroundColor: i % 2 === 0 ? '#181818' : '#1c1c1c',
        borderBottom: i < cols.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
        fontFamily: 'monospace', fontSize,
        color: col.highlight ? '#f44747' : col.fk ? '#9cdcfe' : '#666',
        fontWeight: col.highlight ? 700 : 400,
      }}>
        {col.name}
        {col.fk && <span style={{ marginLeft: 'auto', color: '#333', fontSize: fontSize - 3 }}>→ users</span>}
      </div>
    ))}
  </div>
);

const SchemaView: React.FC<{ frame: number }> = ({ frame }) => {
  const usersOp  = itp(frame, 0, 22);
  const usersScl = itp(frame, 0, 22, 0.85, 1.0);

  return (
    <div style={{ width: SCHEMA_W, height: SCHEMA_H, position: 'relative' }}>
      {/* Connecting lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        {CHILD_TABLES.map((tbl, i) => {
          const cx2 = tbl.left + BLOCK_W / 2;
          const approxLen = Math.sqrt((cx2 - CENTER_X) ** 2 + (CHILD_TOP - USERS_H) ** 2) * 1.35;
          const prog = itp(frame, 18 + i * 10, 68 + i * 10);
          return (
            <path
              key={i}
              d={`M ${CENTER_X} ${USERS_H} C ${CENTER_X} ${USERS_H + 65} ${cx2} ${CHILD_TOP - 65} ${cx2} ${CHILD_TOP}`}
              fill="none"
              stroke="rgba(62,207,142,0.4)"
              strokeWidth={1.5}
              strokeDasharray={approxLen}
              strokeDashoffset={approxLen * (1 - prog)}
            />
          );
        })}
      </svg>

      {/* Users block */}
      <SchemaBlock title="users" cols={USERS_COLS} left={USERS_LEFT} top={0} opacity={usersOp} scl={usersScl}
        width={USERS_W} hdrH={USERS_HDR_H} rowH={USERS_ROW_H} fontSize={20} />

      {/* Child blocks */}
      {CHILD_TABLES.map((tbl, i) => (
        <SchemaBlock
          key={i}
          title={tbl.title}
          cols={tbl.cols}
          left={tbl.left}
          top={CHILD_TOP}
          opacity={itp(frame, 58 + i * 12, 85 + i * 12)}
        />
      ))}
    </div>
  );
};

// ── SQL token types ───────────────────────────────────────────────────────────
type Tok = { t: string; c: string };

const P1: Tok[][] = [
  [{ t: 'CREATE POLICY ', c: KW_C }, { t: '"users_own_data"', c: STR_C }],
  [{ t: '  ON ', c: KW_C }, { t: 'profiles ', c: TXT_C }, { t: 'FOR SELECT', c: KW_C }],
  [{ t: '  USING (', c: KW_C }, { t: 'auth.uid()', c: FN_C }, { t: ' = ', c: PUN_C }, { t: 'user_id', c: TXT_C }, { t: ');', c: PUN_C }],
];

const P2: Tok[][] = [
  [{ t: 'CREATE POLICY ', c: KW_C }, { t: '"service_role_bypass"', c: STR_C }],
  [{ t: '  ON ', c: KW_C }, { t: 'profiles ', c: TXT_C }, { t: 'FOR ALL', c: KW_C }],
  [{ t: '  USING (', c: KW_C }, { t: 'auth.role()', c: FN_C }, { t: ' = ', c: PUN_C }, { t: "'service_role'", c: STR_C }, { t: ');', c: PUN_C }],
];

function totalChars(lines: Tok[][]): number {
  return lines.reduce((sum, line) => sum + line.reduce((s, t) => s + t.t.length, 0), 0);
}

// ── SQL block with typewriter ─────────────────────────────────────────────────
const SQL_FS     = 38;
const SQL_LINE_H = SQL_FS * 1.8;              // 68.4px

const SQL_GAP    = 52;                         // gap between policies


const SQLBlock: React.FC<{
  lines: Tok[][];
  charsShown: number;
  frame: number;
  isTyping: boolean;
}> = ({ lines, charsShown, frame, isTyping }) => {
  const blink = frame % 18 < 10;
  let rem = charsShown;

  return (
    <div style={{ fontFamily: 'monospace', fontSize: SQL_FS }}>
      {lines.map((line, li) => {
        const lineLen = line.reduce((s, t) => s + t.t.length, 0);
        const lineChars = rem <= 0 ? 0 : Math.min(lineLen, rem);
        const isCursorLine = isTyping && blink && rem > 0 && rem <= lineLen;
        rem -= lineLen;
        let charRem = lineChars;
        return (
          <div key={li} style={{ height: SQL_LINE_H, display: 'flex', alignItems: 'center' }}>
            {line.map((tok, ti) => {
              if (charRem <= 0) return null;
              const show = tok.t.slice(0, charRem);
              charRem -= tok.t.length;
              return show ? <span key={ti} style={{ color: tok.c }}>{show}</span> : null;
            })}
            {isCursorLine && (
              <span style={{
                display: 'inline-block', width: 3, height: '0.85em',
                backgroundColor: GREEN, marginLeft: 1, verticalAlign: 'middle',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Script label ──────────────────────────────────────────────────────────────
const ScriptLabel: React.FC<{ text: string; wordProgress: number; opacity: number; fontSize?: number }> = ({
  text, wordProgress, opacity, fontSize = 40,
}) => {
  const words = text.split(' ');
  return (
    <div style={{
      opacity, width: '100%',
      display: 'flex', flexWrap: 'wrap', alignItems: 'center',
      fontFamily: 'monospace', padding: '0 44px',
      gap: '0 12px', fontSize, lineHeight: 1.7,
      justifyContent: 'center',
    }}>
      <span style={{ color: GREEN, fontSize: fontSize * 1.2, fontWeight: 300 }}>{'['}</span>
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
      <span style={{ color: GREEN, fontSize: fontSize * 1.2, fontWeight: 300 }}>{']'}</span>
    </div>
  );
};

// ── Scenes ────────────────────────────────────────────────────────────────────
const SCENES = [
  { start: 0,   end: 72,  script: 'Your data is open by default.',        visual: 'data'   },
  { start: 57,  end: 129, script: 'Every table. Every row.',               visual: 'data'   },
  { start: 114, end: 186, script: 'Every user can see it all.',            visual: 'data'   },
  { start: 171, end: 218, script: "That's fine locally.",                  visual: 'data'   },
  { start: 210, end: 282, script: "In production, that's a breach.",       visual: 'data'   },
  { start: 278, end: 360, script: 'Row Level Security changes that.',      visual: 'center' },
  { start: 335, end: 418, script: 'We write a policy.',                    visual: 'sql'    },
  { start: 403, end: 488, script: 'Users only see their own rows.',        visual: 'sql'    },
  { start: 473, end: 553, script: 'We write another.',                     visual: 'sql'    },
  { start: 538, end: 620, script: 'Service roles bypass everything.',      visual: 'sql'    },
  { start: 605, end: 700, script: 'Policy by policy,',                     visual: 'sql'    },
  { start: 685, end: 793, script: 'your database locks down.',             visual: 'sql'    },
  { start: 775, end: 843, script: "RLS isn't configured once.",            visual: 'center' },
  { start: 831, end: 900, script: "It's layered.",                         visual: 'center' },
];

// Typing timing
const P1_START = 330;
const P1_END   = 490;
const P2_START = 515;
const P2_END   = 685;

// ── Main component ────────────────────────────────────────────────────────────
export const InstaTemplate: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Schema phase ───────────────────────────────────────────────────────────
  const dataOp = itp(frame, 0, 22) * itp(frame, 262, 278, 1, 0);

  // ── SQL phase ──────────────────────────────────────────────────────────────
  const sqlOp    = itp(frame, 323, 358) * itp(frame, 760, 795, 1, 0);
  const p1Total  = totalChars(P1);
  const p2Total  = totalChars(P2);
  const p1Chars  = Math.round(itp(frame, P1_START, P1_END, 0, p1Total));
  const p2Chars  = Math.round(itp(frame, P2_START, P2_END, 0, p2Total));
  const p1Typing = frame >= P1_START && frame < P1_END;
  const p2Typing = frame >= P2_START && frame < P2_END;
  const p2Op = itp(frame, P2_START, P2_START + 18);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: 'hidden' }}>

      {/* ── SCHEMA DIAGRAM ──────────────────────────────────────────────────── */}
      {dataOp > 0 && (
        <AbsoluteFill style={{ opacity: dataOp, alignItems: 'center', justifyContent: 'center', paddingBottom: 280 }}>
          <SchemaView frame={frame} />
        </AbsoluteFill>
      )}

      {/* ── SQL POLICIES ────────────────────────────────────────────────────── */}
      {sqlOp > 0 && (
        <AbsoluteFill style={{ opacity: sqlOp, alignItems: 'center', justifyContent: 'center', paddingBottom: 400 }}>
          <div style={{ width: 880 }}>
            {/* Policy 1 */}
            <div style={{ marginBottom: SQL_GAP }}>
              <SQLBlock lines={P1} charsShown={p1Chars} frame={frame} isTyping={p1Typing} />
            </div>
            {/* Policy 2 */}
            <div style={{ opacity: p2Op }}>
              <SQLBlock lines={P2} charsShown={p2Chars} frame={frame} isTyping={p2Typing} />
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ── CAPTIONS ────────────────────────────────────────────────────────── */}
      {SCENES.map((scene, idx) => {
        const op = sceneOpacity(frame, scene.start, scene.end);
        if (op <= 0) return null;
        const words = scene.script.split(' ');
        const wp = itp(frame, scene.start + 18, scene.end - 18, 0, words.length);
        return (
          <AbsoluteFill
            key={idx}
            style={scene.visual === 'center'
              ? { justifyContent: 'center', alignItems: 'flex-start' }
              : { justifyContent: 'flex-end', alignItems: 'flex-start', paddingBottom: 520 }
            }
          >
            <ScriptLabel text={scene.script} wordProgress={wp} opacity={op} fontSize={40} />
          </AbsoluteFill>
        );
      })}

    </AbsoluteFill>
  );
};
