import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Card, Pill } from '../oneTool/Card';
import { JevMark } from '../../Components/JevMark';
import { CODE, GREEN, GREEN_INK, INK, INK_2, INK_3, itp } from '../oneTool/theme';
import { LLM_SECONDS } from './LlmHalf';
import {
  ANS, AppCard, BigStat, Caption, Connector, Note, PassStrip, ScoreRow, SectionLabel, Takeaway, TimerChip,
} from './parts';

export const JEV_HALF_DURATION = 780;

// Beats (local frames)
const T_CODE = 50;
const T_OPT = 110;
const T_REQ = 170;
const T_SCAN = 188;
const T_FILL = 210;
const T_FAST = 232;
const T_BACK = 238;
const T_MS = 300;
const T_CONF = 380;
const T_DECIDE = 490;

const OPTIONS = ['SPAM', 'NOT SPAM'];
const SCORES = [0.97, 0.03];

type Tok = { t: string; c: string };
const CODE_LINE: Tok[] = [
  { t: 'jev', c: GREEN_INK }, { t: '.choice(', c: INK }, { t: 'email', c: INK_2 }, { t: ', [', c: INK },
  { t: '"spam"', c: GREEN_INK }, { t: ', ', c: INK }, { t: '"not spam"', c: GREEN_INK }, { t: '])', c: INK },
];
const RESULT_LINE: Tok[] = [
  { t: '{ answer: ', c: INK_2 }, { t: '"spam"', c: GREEN_INK }, { t: ', confidence: ', c: INK_2 }, { t: '0.97', c: GREEN_INK }, { t: ' }', c: INK_2 },
];

const typed = (toks: Tok[], n: number) => {
  let left = n;
  return toks.map((tk, i) => {
    const s = tk.t.slice(0, Math.max(0, left));
    left -= tk.t.length;
    return <span key={i} style={{ color: tk.c }}>{s}</span>;
  });
};
const len = (toks: Tok[]) => toks.reduce((a, t) => a + t.t.length, 0);

/** 02 — how Jev answers: data + typed question, one pass, scored options. */
export const JevHalf: React.FC = () => {
  const frame = useCurrentFrame();

  const codeChars = frame < T_CODE ? 0 : Math.floor((frame - T_CODE) * 1.6);
  const codeDone = codeChars >= len(CODE_LINE);
  const resChars = frame < T_CONF ? 0 : Math.floor((frame - T_CONF) * 2);

  const scan = itp(frame, T_SCAN, T_FILL);
  const ms = itp(frame, T_SCAN, T_FAST, 0, 150);
  const fast = frame >= T_FAST;

  const travel = frame < T_BACK
    ? { from: T_REQ, to: T_REQ + 18, label: 'req', dir: 'right' as const }
    : { from: T_BACK, to: T_BACK + 22, label: 'SPAM · 0.97', dir: 'left' as const, bg: GREEN, color: '#0B3B26' };

  const endFade = 1 - itp(frame, JEV_HALF_DURATION - 10, JEV_HALF_DURATION);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: endFade }}>
      <SectionLabel n="02" title="how jev answers" frame={frame} at={0} />
      <Caption segs={[{ t: 'Jev', hi: true }, { t: ' doesn’t loop.' }]} frame={frame} at={0} until={T_CODE - 2} />
      <Caption segs={[{ t: 'You give it data and a ' }, { t: 'typed question', hi: true }, { t: '.' }]} frame={frame} at={T_CODE} until={T_REQ - 2} />
      <Caption segs={[{ t: 'It reads everything in a ' }, { t: 'single pass', hi: true }, { t: '.' }]} frame={frame} at={T_REQ} until={T_MS - 2} />
      <Caption segs={[{ t: 'About ' }, { t: '150 milliseconds', hi: true }, { t: '.' }]} frame={frame} at={T_MS} until={T_CONF - 2} />
      <Caption segs={[{ t: 'With a ' }, { t: 'confidence score', hi: true }, { t: ' attached.' }]} frame={frame} at={T_CONF} until={T_DECIDE - 2} />
      <Caption segs={[{ t: 'It never writes a word. It just ' }, { t: 'decides', hi: true }, { t: '.' }]} frame={frame} at={T_DECIDE} />

      <AppCard
        frame={frame} at={-40}
        questionLabel="typed question"
        question={
          <div style={{ fontFamily: CODE, fontSize: 24, lineHeight: 1.4, padding: '12px 0', display: 'flex', alignItems: 'center' }}>
            <span style={{ whiteSpace: 'pre' }}>{typed(CODE_LINE, codeChars)}</span>
            {!codeDone && <span style={{ display: 'inline-block', width: 11, height: 26, background: GREEN_INK, marginLeft: 4, opacity: frame % 14 < 9 ? 1 : 0 }} />}
          </div>
        }
        scan={scan}
        result={frame >= T_CONF ? (
          <div style={{ fontFamily: CODE, fontSize: 22, padding: '14px 18px', borderRadius: 12, background: 'rgba(62,207,142,0.10)', border: '1px solid rgba(62,207,142,0.35)', whiteSpace: 'pre' }}>
            {typed(RESULT_LINE, resChars)}
          </div>
        ) : undefined}
      />

      <Connector frame={frame} drawAt={4} travel={travel} />
      {frame >= T_SCAN && (
        <TimerChip value={`${Math.round(ms)} ms`} state={fast ? 'fast' : 'running'} frame={frame} at={T_SCAN} />
      )}

      <Card {...ANS} frame={frame} at={4} title="jev" subtitle={frame < T_OPT ? 'waiting for options' : frame < T_FILL ? 'your options' : 'your options, scored'} collapse={false}
        right={<JevMark variant="black" size={18} style={{ opacity: 0.85 }} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 26 }}>
          <div style={{ fontFamily: CODE, fontSize: 13, letterSpacing: 2, color: INK_3, textTransform: 'uppercase' }}>options · yours, not jev’s</div>
          {OPTIONS.map((label, i) => (
            <ScoreRow
              key={label}
              label={label}
              fill={itp(frame, T_FILL, T_FILL + 22, 0, SCORES[i])}
              score={itp(frame, T_FILL, T_FILL + 22, 0, SCORES[i])}
              selected={i === 0 && frame >= T_FILL + 16}
              showScore={frame >= T_FILL}
              frame={frame}
              at={T_OPT + i * 12}
              big={frame >= T_CONF}
            />
          ))}
          <div style={{ marginTop: 'auto' }}>
            <Note text={'you hand it the list.\nit can’t add to it.'} frame={frame} at={T_OPT + 30} until={T_FILL + 30} />
            <Note text={'no tokens. one parallel pass.\nevery option scored at once.'} frame={frame} at={T_FILL + 40} color={GREEN_INK} />
          </div>
        </div>
      </Card>

      <PassStrip frame={frame} at={-40} total={20} lit={0} merge={itp(frame, T_SCAN, T_FILL + 6)} />

      <BigStat
        value="150" unit="ms" color={GREEN_INK} frame={frame} at={T_MS + 4}
        sub={<Pill color={INK_3} bg="rgba(0,0,0,0.05)" style={{ fontFamily: CODE, fontSize: 18, padding: '8px 16px' }}>vs <span style={{ textDecoration: 'line-through' }}>{LLM_SECONDS} s</span> · one pass</Pill>}
      />
      <Takeaway segs={[{ t: 'It never writes a word. ' }, { t: 'It just decides.', hi: true }]} frame={frame} at={T_DECIDE + 10} />
    </div>
  );
};
