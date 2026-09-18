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

export const SectionTitle: React.FC<{ n: string; title: string; frame: number; at: number; left?: number; top?: number }> = ({
  n, title, frame, at, left = L, top = 130,
}) => (
  <div style={{ position: 'absolute', left, top, ...stamp(frame, at) }}>
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
  x?: number;
  w?: number;
  pad?: number;
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  titleSize?: number;
  subtitleSize?: number;
  frame: number;
  at: number;
  children: React.ReactNode;
}> = ({ y, h, x = L, w = W, pad = 32, title, subtitle, headerRight, titleSize = 24, subtitleSize = 20, frame, at, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: bp.panel, border, ...stamp(frame, at) }}>
    <div style={{ height: 64, borderBottom: border, display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', whiteSpace: 'nowrap' }}>
      <span style={{ fontWeight: 700, fontSize: titleSize }}>{title}</span>
      {subtitle && <span style={{ color: bp.grey, fontSize: subtitleSize }}>{subtitle}</span>}
      {headerRight && <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>{headerRight}</span>}
    </div>
    <div style={{ padding: pad }}>{children}</div>
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

interface LinkTravel { from: number; to: number; label: string; reverse?: boolean }

/** Axis-aligned connector from p1 to p2 (draws p1→p2) with an optional traveling chip. */
export const Link: React.FC<{ x1: number; y1: number; x2: number; y2: number; frame: number; drawAt: number; travel?: LinkTravel }> = ({
  x1, y1, x2, y2, frame, drawAt, travel,
}) => {
  const drawn = itp(frame, drawAt, drawAt + 10);
  const horizontal = y1 === y2;
  const len = (horizontal ? Math.abs(x2 - x1) : Math.abs(y2 - y1)) * drawn;
  const lineStyle: React.CSSProperties = horizontal
    ? { left: x2 >= x1 ? x1 : x1 - len, top: y1 - 1, width: len, height: 2 }
    : { left: x1 - 1, top: y2 >= y1 ? y1 : y1 - len, width: 2, height: len };

  let chip: React.ReactNode = null;
  if (travel && frame >= travel.from && frame <= travel.to + 4) {
    const p = itp(frame, travel.from, travel.to);
    const t = travel.reverse ? 1 - p : p;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    const fade = itp(frame, travel.to, travel.to + 4, 1, 0);
    chip = (
      <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', opacity: fade }}>
        <Chip text={travel.label} style={{ border }} />
      </div>
    );
  }
  return (
    <>
      <div style={{ position: 'absolute', background: bp.line, ...lineStyle }} />
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

export const ScoreRow: React.FC<{
  label: string;
  fill: number;
  score: number;
  selected: boolean;
  showScore: boolean;
  frame: number;
  at: number;
  rowH?: number;
  labelW?: number;
  labelH?: number;
  fontSize?: number;
}> = ({ label, fill, score, selected, showScore, frame, at, rowH = 96, labelW = 220, labelH = 76, fontSize = 26 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 28, height: rowH, ...stamp(frame, at) }}>
    <div style={{ width: labelW, height: labelH, border: selected ? `2px solid ${bp.accent}` : border, background: selected ? bp.accent : bp.panel, color: selected ? bp.onAccent : bp.ink, boxShadow: selected ? glow : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize }}>
      {label}
    </div>
    <div style={{ flex: 1, height: Math.round(labelH * 0.4), border, position: 'relative', background: bp.panel }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: selected ? bp.accent : bp.barDim, boxShadow: selected ? glow : undefined }} />
    </div>
    <div style={{ width: 90, fontSize: fontSize + 2, fontWeight: 500, textAlign: 'right' }}>{showScore ? score.toFixed(2) : ''}</div>
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
