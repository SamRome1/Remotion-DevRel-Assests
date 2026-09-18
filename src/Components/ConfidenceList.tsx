import React from 'react';
import { circularFamily } from '../fonts';
import { MONO, FG, FG_MUTED, GREEN, glowStyles, boxBase, sp, itp } from '../tokens';

interface Option {
  label: string;
  finalScore: number;
}

const OPTIONS: Option[] = [
  { label: 'Escalate to human', finalScore: 11 },
  { label: 'Auto-approve',      finalScore: 94 },
  { label: 'Flag for review',   finalScore: 9 },
  { label: 'Reject',            finalScore: 4 },
];

const WINNER_INDEX = 1;

const flicker = (frame: number, i: number) =>
  Math.floor(Math.abs(Math.sin((frame + i * 53) * 1.7)) * 100);

/**
 * Beat A (0-30f): cards mount, scores at 0.
 * Beat B (30-90f): all cards evaluate in parallel — scores flicker together
 * (deliberately NOT staggered — this is the contrast with token-by-token generation).
 * Beat C (90-140f): non-winners dim and settle low; the winner settles high,
 * scales up slightly, and gets the green glow.
 */
export const ConfidenceList: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
    {OPTIONS.map((opt, i) => {
      const isWinner = i === WINNER_INDEX;
      const mountP = sp(frame - i * 6);

      const preSettleValue = flicker(89, i);
      const settleT = itp(frame, 90, 118);
      const displayScore = frame < 90
        ? flicker(frame, i)
        : Math.round(preSettleValue + (opt.finalScore - preSettleValue) * settleT);

      const dimOpacity = isWinner ? 1 : itp(frame, 90, 140, 1, 0.35);
      const scale = isWinner ? itp(frame, 90, 140, 1, 1.06) : 1;
      const glowP = isWinner ? itp(frame, 90, 140) : 0;

      return (
        <div
          key={opt.label}
          style={{
            ...boxBase,
            ...(isWinner ? glowStyles(glowP) : {}),
            opacity:   mountP * dimOpacity,
            transform: `translateY(${(1 - mountP) * 16}px) scale(${scale})`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '28px 32px',
          }}
        >
          <span style={{ fontFamily: circularFamily, fontSize: 32, fontWeight: 600, color: isWinner ? FG : FG_MUTED }}>
            {opt.label}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 30, color: isWinner ? GREEN : FG_MUTED, minWidth: 100, textAlign: 'right' }}>
            {displayScore}%
          </span>
        </div>
      );
    })}
  </div>
);
