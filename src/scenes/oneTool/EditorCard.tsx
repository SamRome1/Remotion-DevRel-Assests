import React from 'react';
import { Bug, Check } from 'lucide-react';
import { Card, Pill } from './Card';
import { CODE, GREEN_INK, GREEN_TINT, INK, INK_2, INK_3, RED, RED_TINT, T, itp, sp } from './theme';

type Tok = { t: string; c?: string };
type Line = Tok[];


const LINES: Line[] = [
  [{ t: 'export async function ', c: INK_2 }, { t: 'getUser', c: GREEN_INK }, { t: '(id: string) {', c: INK }],
  [{ t: '  const { data, error } = await ', c: INK }, { t: 'supabase', c: GREEN_INK }],
  [{ t: "    .from('users')", c: INK }],
  [{ t: "    .select('*')", c: INK }],
  [{ t: "    .eq('id', id)", c: INK }],
  [{ t: '    .single()', c: INK }],
  [{ t: '  return data', c: INK }],
  [{ t: '}', c: INK }],
];

const FIX_LINE: Line = [{ t: '  if (error) ', c: INK }, { t: 'throw', c: GREEN_INK }, { t: ' error', c: INK }];
const FIX_AT = 6; // insert before "return data"

const CHARS_PER_FRAME = 4;
const T_TYPE = T.WRITE + 14;
const T_ERR = T.DEBUG + 6;
const T_FIX = T.DEBUG + 28;
const T_OK = T.DEBUG + 54;

const sliceLine = (line: Line, n: number) => {
  let left = n;
  return line.map((tok) => {
    const s = tok.t.slice(0, Math.max(0, left));
    left -= tok.t.length;
    return { ...tok, t: s };
  });
};

const lineLen = (line: Line) => line.reduce((a, t) => a + t.t.length, 0);

export const EditorCard: React.FC<{ frame: number; x: number; y: number; w: number; h: number; zoom?: number }> = ({ frame, x, y, w, h, zoom = 1 }) => {
  const LH = 34 * zoom;
  const GUT = 40 * zoom;
  const typed = Math.max(0, Math.floor((frame - T_TYPE) * CHARS_PER_FRAME));

  const hasErr = frame >= T_ERR;
  const fixP = sp(frame, T_FIX);
  const fixChars = Math.max(0, Math.floor((frame - T_FIX - 4) * 3));
  const errFade = 1 - itp(frame, T_FIX + 10, T_FIX + 22);
  const ok = frame >= T_OK;
  const okP = sp(frame, T_OK);

  let consumed = 0;
  const rows: React.ReactNode[] = [];
  let lineNo = 1;

  LINES.forEach((line, i) => {
    if (i === FIX_AT && frame >= T_FIX) {
      const shown = sliceLine(FIX_LINE, fixChars);
      rows.push(
        <div key="fix" style={{ height: LH * fixP, opacity: itp(fixP, 0.6, 1), display: 'flex', alignItems: 'center', overflow: 'hidden', background: GREEN_TINT, marginLeft: -24, marginRight: -24, paddingLeft: 24, paddingRight: 24 }}>
          <span style={{ width: GUT, color: GREEN_INK, flex: `0 0 ${GUT}px` }}>{lineNo}</span>
          <span style={{ whiteSpace: 'pre' }}>{shown.map((tk, k) => <span key={k} style={{ color: tk.c }}>{tk.t}</span>)}</span>
        </div>,
      );
      lineNo += 1;
    }
    const len = lineLen(line);
    const n = Math.min(len, Math.max(0, typed - consumed));
    consumed += len;
    const isErrLine = i === FIX_AT && hasErr;
    const errA = isErrLine ? errFade : 0;
    rows.push(
      <div
        key={i}
        style={{
          height: LH,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          marginLeft: -24,
          marginRight: -24,
          paddingLeft: 24,
          paddingRight: 24,
          background: errA > 0 ? `rgba(229,72,77,${0.12 * errA})` : 'transparent',
        }}
      >
        <span style={{ width: GUT, color: INK_3, flex: `0 0 ${GUT}px` }}>{n > 0 ? lineNo : ''}</span>
        <span style={{ whiteSpace: 'pre', position: 'relative' }}>
          {sliceLine(line, n).map((tk, k) => <span key={k} style={{ color: tk.c }}>{tk.t}</span>)}
          {errA > 0 && (
            <span style={{ position: 'absolute', left: 0, right: 0, bottom: 2, height: 3, opacity: errA, backgroundImage: `repeating-linear-gradient(135deg, ${RED} 0 3px, transparent 3px 6px)` }} />
          )}
        </span>
        {isErrLine && errA > 0 && (
          <span style={{ marginLeft: 20, opacity: errA * sp(frame, T_ERR), transform: `translateX(${(1 - sp(frame, T_ERR)) * 12}px)`, display: 'inline-flex' }}>
            <Pill color={RED} bg={RED_TINT}><Bug size={14} strokeWidth={2} color={RED} />error is never handled</Pill>
          </span>
        )}
      </div>,
    );
    if (n > 0) lineNo += 1;
  });

  const cursorOn = frame % 16 < 10;

  return (
    <Card
      x={x} y={y} w={w} h={h} frame={frame} at={T.WRITE + 4} title="users.ts"
      right={
        hasErr && !ok ? (
          <div style={{ opacity: errFade }}><Pill color={RED} bg={RED_TINT}>1 problem</Pill></div>
        ) : ok ? (
          <div style={{ opacity: okP, transform: `scale(${0.8 + 0.2 * okP})` }}>
            <Pill color={GREEN_INK} bg={GREEN_TINT}><Check size={14} strokeWidth={2.5} color={GREEN_INK} />0 problems</Pill>
          </div>
        ) : null
      }
    >
      <div style={{ fontFamily: CODE, fontSize: 20 * zoom, lineHeight: `${LH}px`, color: INK, paddingTop: 4 }}>
        {rows}
        <span style={{ display: 'inline-block', width: 10 * zoom, height: 24 * zoom, background: GREEN_INK, marginLeft: GUT, verticalAlign: 'middle', opacity: typed < 190 && cursorOn ? 1 : 0 }} />
      </div>
    </Card>
  );
};
