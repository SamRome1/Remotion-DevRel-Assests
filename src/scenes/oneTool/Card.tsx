import React from 'react';
import { CX, CY, INK_3, LINE, LINE_2, PAPER, SHADOW, T, UI, CODE, easeInOut, enterStyle, itp } from './theme';

type Rect = { x: number; y: number; w: number; h: number };

/**
 * Absolutely positioned wrapper that, at T.ONE, flies its content into the
 * canvas center and shrinks to nothing. `delay` staggers the collapse.
 */
export const Collapse: React.FC<Rect & { frame: number; delay?: number; children: React.ReactNode }> = ({
  x, y, w, h, frame, delay = 0, children,
}) => {
  const c = easeInOut(itp(frame, T.ONE + delay, T.ONE + delay + 26));
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `translate(${(CX - cx) * c}px, ${(CY - cy) * c}px) scale(${1 - c})`,
        opacity: 1 - itp(c, 0.55, 1),
        transformOrigin: '50% 50%',
      }}
    >
      {children}
    </div>
  );
};

type CardProps = Rect & {
  frame: number;
  at: number;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  pad?: number;
  /** Fly into the canvas center at T.ONE (OneTool only). Default true. */
  collapse?: boolean;
  children: React.ReactNode;
};

const Static: React.FC<Rect & { children: React.ReactNode }> = ({ x, y, w, h, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h }}>{children}</div>
);

/** White window card with macOS chrome and a mono title. */
export const Card: React.FC<CardProps> = ({ x, y, w, h, frame, at, title, subtitle, right, pad = 24, collapse = true, children }) => {
  const Wrap: React.FC<{ children: React.ReactNode }> = ({ children: c }) =>
    collapse
      ? <Collapse x={x} y={y} w={w} h={h} frame={frame} delay={Math.hypot(x + w / 2 - CX, y + h / 2 - CY) / 90}>{c}</Collapse>
      : <Static x={x} y={y} w={w} h={h}>{c}</Static>;
  return (
  <Wrap>
    <div
      style={{
        ...enterStyle(frame, at),
        position: 'absolute',
        inset: 0,
        background: PAPER,
        border: `1px solid ${LINE}`,
        borderRadius: 18,
        boxShadow: SHADOW,
        overflow: 'hidden',
        fontFamily: UI,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: 52,
          flex: '0 0 52px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 8,
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 6, background: LINE_2 }} />
        ))}
        <div style={{ marginLeft: 12, fontFamily: CODE, fontSize: 14, letterSpacing: 2, color: INK_3, textTransform: 'uppercase' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ marginLeft: 4, fontFamily: CODE, fontSize: 14, letterSpacing: 1, color: LINE_2 }}>· {subtitle}</div>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>{right}</div>
      </div>
      <div style={{ flex: 1, padding: pad, position: 'relative' }}>{children}</div>
    </div>
  </Wrap>
  );
};

/** Small rounded pill. */
export const Pill: React.FC<{ color: string; bg: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  color, bg, children, style,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: bg,
      color,
      borderRadius: 999,
      padding: '5px 12px',
      fontSize: 14,
      fontWeight: 600,
      letterSpacing: 0.5,
      fontFamily: UI,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);
