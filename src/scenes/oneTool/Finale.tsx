import React from 'react';
import { Sparkles } from 'lucide-react';
import { CX, CY, GREEN, GREEN_INK, INK, INK_2, LINE, LINE_2, PAPER, SHADOW, T, UI, W, H, easeIn, itp, rnd, sp, spHeavy } from './theme';

const JOBS = [
  'Frontend', 'Backend', 'DBA', 'QA', 'DevOps', 'Data Eng', 'Security',
  'Mobile', 'SRE', 'Tech Writer', 'Platform', 'Designer', 'PM', 'Infra',
];
const FLIGHT = 30;
const PILL_GAP = 4;
const YEARS = ['2023', '2024', '2025', '2026'];
const TL_X0 = 560;
const TL_X1 = 1360;
const TL_Y = 720;

/** Start point just outside the canvas for pill i. */
const spawn = (i: number) => {
  const side = Math.floor(rnd(i * 5 + 1) * 4);
  const t = rnd(i * 5 + 2);
  const pad = 140;
  if (side === 0) return { x: t * W, y: -pad };
  if (side === 1) return { x: W + pad, y: t * H };
  if (side === 2) return { x: t * W, y: H + pad };
  return { x: -pad, y: t * H };
};

export const Finale: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < T.ONE + 10) return null;

  const chipIn = spHeavy(frame, T.ONE + 14);
  const headIn = sp(frame, T.ONE + 24);

  // Pills + absorption pulses
  let pulse = 0;
  let absorbed = 0;
  const pills = JOBS.map((label, i) => {
    const start = T.YEARS + 8 + i * PILL_GAP;
    const arrive = start + FLIGHT;
    if (frame >= arrive) {
      absorbed += 1;
      pulse += Math.exp(-(frame - arrive) / 5);
    }
    const p = easeIn(itp(frame, start, arrive));
    const s = spawn(i);
    const x = s.x + (CX - s.x) * p;
    const y = s.y + (CY - s.y) * p;
    const scale = 1 - itp(p, 0.7, 1) * 0.75;
    const opacity = frame < start ? 0 : 1 - itp(p, 0.82, 1);
    return { label, x, y, scale, opacity, key: i };
  });

  const chipScale = chipIn * (1 + 0.045 * Math.min(pulse, 1.6) + 0.22 * (absorbed / JOBS.length));
  const glow = 0.18 + 0.25 * Math.min(pulse, 1);

  const tlP = itp(frame, T.YEARS, T.YEARS + 70);
  const tlIn = sp(frame, T.YEARS - 4);
  const jobsIn = sp(frame, T.JOBS);
  const endFade = 1 - itp(frame, T.END - 10, T.END);

  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: UI, opacity: endFade }}>
      {/* headline */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center',
          fontSize: 124, fontWeight: 700, letterSpacing: -5, lineHeight: 1, color: INK,
          opacity: headIn, transform: `translateY(${(1 - headIn) * 40}px)`,
        }}
      >
        One tool.
      </div>

      {/* timeline */}
      <div style={{ position: 'absolute', left: TL_X0, top: TL_Y, width: TL_X1 - TL_X0, opacity: tlIn }}>
        <div style={{ height: 6, borderRadius: 3, background: LINE }} />
        <div style={{ position: 'absolute', left: 0, top: 0, height: 6, borderRadius: 3, width: `${tlP * 100}%`, background: GREEN }} />
        {YEARS.map((yr, i) => {
          const at = i / (YEARS.length - 1);
          const lit = tlP >= at - 0.001;
          const pp = sp(frame, T.YEARS + at * 70);
          return (
            <div key={yr} style={{ position: 'absolute', left: `${at * 100}%`, top: -7, transform: 'translateX(-50%)', textAlign: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, margin: '0 auto', background: lit ? GREEN : PAPER, border: `3px solid ${lit ? GREEN_INK : LINE_2}`, transform: `scale(${0.6 + 0.4 * pp})` }} />
              <div style={{ marginTop: 14, fontSize: 24, fontWeight: 600, letterSpacing: 1, color: lit ? INK : INK_2, opacity: 0.4 + 0.6 * pp }}>{yr}</div>
            </div>
          );
        })}
      </div>

      {/* pills */}
      {pills.map((p) => (
        <div
          key={p.key}
          style={{
            position: 'absolute', left: p.x, top: p.y,
            transform: `translate(-50%, -50%) scale(${p.scale})`,
            opacity: p.opacity,
            background: PAPER, border: `1px solid ${LINE}`, boxShadow: SHADOW,
            borderRadius: 999, padding: '12px 26px', fontSize: 28, fontWeight: 600, color: INK, whiteSpace: 'nowrap',
          }}
        >
          {p.label}
        </div>
      ))}

      {/* the one chip */}
      <div
        style={{
          position: 'absolute', left: CX - 90, top: CY - 90, width: 180, height: 180,
          borderRadius: 44, background: INK,
          boxShadow: `0 0 0 ${10 + 10 * Math.min(pulse, 1)}px rgba(62,207,142,${glow}), 0 30px 70px rgba(0,0,0,0.28)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${chipScale})`,
        }}
      >
        <Sparkles size={92} strokeWidth={1.5} color={GREEN} style={{ filter: `drop-shadow(0 0 ${14 + 12 * Math.min(pulse, 1)}px rgba(62,207,142,0.7))` }} />
      </div>

      {/* closer */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: 846, textAlign: 'center',
          fontSize: 60, fontWeight: 700, letterSpacing: -1.5, color: INK_2,
          opacity: jobsIn, transform: `translateY(${(1 - jobsIn) * 30}px)`,
        }}
      >
        Swallowed <span style={{ color: INK }}>every job in software.</span>
      </div>
    </div>
  );
};
