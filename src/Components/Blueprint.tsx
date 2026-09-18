import React from 'react';
import { AbsoluteFill } from 'remotion';
import { MONO, bp, border, glow, itp, stamp } from '../blueprint';

// Shared 1080x1920 layout grid — every scene places panels on these lines so
// hard cuts between scenes read as continuous.
export const L = 100;
export const W = 880;
export const CX = 540;
export const APP_Y = 250;
export const APP_H = 250;
export const ANS_Y = 680;

export const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: bp.paper, fontFamily: MONO, color: bp.ink }}>
    <div style={{ position: 'absolute', inset: 40, border, boxShadow: `6px 6px 0 rgba(62,207,142,0.4)` }} />
    {children}
  </AbsoluteFill>
);

export const SectionTitle: React.FC<{ n: string; title: string; frame: number; at: number }> = ({ n, title, frame, at }) => (
  <div style={{ position: 'absolute', left: L, top: 130, ...stamp(frame, at) }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ background: bp.accent, color: bp.onAccent, fontWeight: 700, fontSize: 22, padding: '4px 10px', boxShadow: glow }}>{n}</span>
      <span style={{ fontWeight: 700, fontSize: 40, letterSpacing: 1 }}>{title}</span>
    </div>
    <div style={{ height: 3, background: bp.ink, marginTop: 14, width: 440 }} />
  </div>
);

export const Panel: React.FC<{
  y: number;
  h: number;
  title: string;
  subtitle?: string;
  frame: number;
  at: number;
  children: React.ReactNode;
}> = ({ y, h, title, subtitle, frame, at, children }) => (
  <div style={{ position: 'absolute', left: L, top: y, width: W, height: h, background: bp.panel, border, ...stamp(frame, at) }}>
    <div style={{ height: 64, borderBottom: border, display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px' }}>
      <span style={{ fontWeight: 700, fontSize: 24 }}>{title}</span>
      {subtitle && <span style={{ color: bp.grey, fontSize: 20 }}>{subtitle}</span>}
    </div>
    <div style={{ padding: 32 }}>{children}</div>
  </div>
);

export const Chip: React.FC<{ text: string; bg?: string; color?: string; size?: number; style?: React.CSSProperties }> = ({
  text, bg = bp.accent, color = bp.onAccent, size = 20, style,
}) => (
  <span style={{ display: 'inline-block', background: bg, color, fontWeight: 700, fontSize: size, padding: '4px 12px', lineHeight: 1.2, boxShadow: bg === bp.accent ? glow : undefined, ...style }}>
    {text}
  </span>
);

export const Highlight: React.FC<{ children: React.ReactNode; bg?: string; color?: string }> = ({ children, bg = bp.accentPale, color }) => (
  <span style={{ background: bg, color, padding: '2px 8px', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}>{children}</span>
);

export const AppPanel: React.FC<{ frame: number; at: number }> = ({ frame, at }) => (
  <Panel y={APP_Y} h={APP_H} title="YOUR APP" frame={frame} at={at}>
    <div style={{ fontSize: 40, fontWeight: 500, lineHeight: 1.5 }}>
      <Highlight>is this invoice fraud?</Highlight>
    </div>
  </Panel>
);

interface Travel { from: number; to: number; label: string; dir: 'down' | 'up' }

export const Connector: React.FC<{ y1: number; y2: number; frame: number; drawAt: number; travel?: Travel }> = ({ y1, y2, frame, drawAt, travel }) => {
  const drawn = itp(frame, drawAt, drawAt + 10);
  let chip: React.ReactNode = null;
  if (travel && frame >= travel.from && frame <= travel.to + 4) {
    const p = itp(frame, travel.from, travel.to);
    const y = travel.dir === 'down' ? y1 + (y2 - y1) * p : y2 - (y2 - y1) * p;
    const fade = itp(frame, travel.to, travel.to + 4, 1, 0);
    chip = (
      <div style={{ position: 'absolute', left: CX, top: y, transform: 'translate(-50%,-50%)', opacity: fade }}>
        <Chip text={travel.label} style={{ border }} />
      </div>
    );
  }
  return (
    <>
      <div style={{ position: 'absolute', left: CX - 1, top: y1, width: 2, height: (y2 - y1) * drawn, background: bp.ink }} />
      {chip}
    </>
  );
};

export const Timer: React.FC<{ value: number; state: 'running' | 'slow' | 'fast'; frame: number; at: number }> = ({ value, state, frame, at }) => {
  const look =
    state === 'slow' ? { background: bp.redPale, color: bp.red }
    : state === 'fast' ? { background: bp.accent, color: bp.onAccent, boxShadow: glow }
    : { color: bp.grey };
  return (
    <div style={{ position: 'absolute', right: L, top: ANS_Y - 78, fontWeight: 700, fontSize: 40, padding: '2px 12px', ...look, ...stamp(frame, at) }}>
      {value.toFixed(1)}s
    </div>
  );
};

export const TypedTokens: React.FC<{ tokens: string[]; frame: number; start: number; fpt: number; badFrom?: number; fontSize?: number }> = ({
  tokens, frame, start, fpt, badFrom = Infinity, fontSize = 36,
}) => {
  const visible = frame < start ? 0 : Math.min(tokens.length, Math.floor((frame - start) / fpt) + 1);
  const done = frame >= start + tokens.length * fpt;
  const caretOn = !done && frame % 14 < 9;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', rowGap: 12, fontSize, lineHeight: 1.5 }}>
      {tokens.slice(0, visible).map((t, i) => {
        const bad = i >= badFrom;
        const newest = i === visible - 1 && !done;
        const bg = newest ? (bad ? bp.red : bp.accentPale) : bad ? bp.redPale : 'transparent';
        const color = newest && bad ? bp.paper : bad ? bp.red : bp.ink;
        return (
          <span key={i} style={{ background: bg, color, padding: '0 6px', marginRight: 6 }}>{t}</span>
        );
      })}
      {visible > 0 && <span style={{ width: 16, height: fontSize * 1.1, background: bp.ink, opacity: caretOn ? 1 : 0 }} />}
    </div>
  );
};

export const ScoreRow: React.FC<{ label: string; fill: number; score: number; selected: boolean; showScore: boolean; frame: number; at: number }> = ({
  label, fill, score, selected, showScore, frame, at,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 28, height: 96, ...stamp(frame, at) }}>
    <div style={{ width: 220, height: 76, border: selected ? `2px solid ${bp.accent}` : border, background: selected ? bp.accent : bp.panel, color: selected ? bp.onAccent : bp.ink, boxShadow: selected ? glow : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 26 }}>
      {label}
    </div>
    <div style={{ flex: 1, height: 30, border, position: 'relative', background: bp.panel }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: selected ? bp.accent : bp.barDim, boxShadow: selected ? glow : undefined }} />
    </div>
    <div style={{ width: 90, fontSize: 28, fontWeight: 500, textAlign: 'right' }}>{showScore ? score.toFixed(2) : ''}</div>
  </div>
);

export const Note: React.FC<{ text: string; top: number; frame: number; at: number }> = ({ text, top, frame, at }) => (
  <div style={{ position: 'absolute', left: L, top, width: W, color: bp.grey, fontSize: 26, lineHeight: 1.5, whiteSpace: 'pre-line', ...stamp(frame, at) }}>{text}</div>
);

export const Takeaway: React.FC<{ line: string; chip: string; chipBg?: string; chipColor?: string; frame: number; at: number }> = ({
  line, chip, chipBg, chipColor, frame, at,
}) => (
  <div style={{ position: 'absolute', left: L, top: 1600, width: W }}>
    <div style={{ fontSize: 28, color: bp.inkSoft, whiteSpace: 'nowrap', ...stamp(frame, at) }}>{line}</div>
    <div style={{ marginTop: 18, ...stamp(frame, at + 12) }}>
      <Chip text={chip} size={40} bg={chipBg} color={chipColor} />
    </div>
  </div>
);
