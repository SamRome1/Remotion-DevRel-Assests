import React from 'react';
import { Card } from './Card';
import { CODE, FILL, FILL_2, GREEN, GREEN_INK, GREEN_TINT, INK_3, LINE, T, UI, sp } from './theme';

type Block = { x: number; y: number; w: number; h: number; bg: string; bar?: number; radius?: number; text?: string };

// Inner canvas is ~772 x 300 (card 820 wide, 24 padding, header 52).
const BLOCKS: Block[] = [
  { x: 0, y: 0, w: 772, h: 44, bg: FILL, radius: 10, bar: 120 }, // nav
  { x: 0, y: 60, w: 470, h: 110, bg: FILL_2, radius: 12, bar: 300 }, // hero
  { x: 486, y: 60, w: 286, h: 110, bg: GREEN_TINT, radius: 12, text: 'Sign up' }, // CTA panel
  { x: 0, y: 186, w: 246, h: 96, bg: FILL, radius: 12, bar: 140 },
  { x: 263, y: 186, w: 246, h: 96, bg: FILL, radius: 12, bar: 120 },
  { x: 526, y: 186, w: 246, h: 96, bg: FILL, radius: 12, bar: 160 },
];

export const AppCard: React.FC<{ frame: number; x: number; y: number; w: number; h: number }> = ({ frame, x, y, w, h }) => {
  const urlP = sp(frame, T.APP + 10);
  return (
    <Card x={x} y={y} w={w} h={h} frame={frame} at={T.APP + 2} title="localhost:3000" pad={24}>
      {/* url bar sits inside the header area visually — keep a slim bar here */}
      <div style={{ position: 'absolute', inset: 24, fontFamily: UI }}>
        {BLOCKS.map((b, i) => {
          const p = sp(frame, T.APP + 12 + i * 6);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: b.x,
                top: b.y,
                width: b.w,
                height: b.h,
                background: b.bg,
                border: `1px solid ${b.bg === GREEN_TINT ? 'rgba(62,207,142,0.35)' : LINE}`,
                borderRadius: b.radius ?? 10,
                opacity: p,
                transform: `scale(${0.85 + 0.15 * p}) translateY(${(1 - p) * 16}px)`,
                display: 'flex',
                alignItems: b.text ? 'center' : 'flex-start',
                justifyContent: b.text ? 'center' : 'flex-start',
                padding: b.text ? 0 : 16,
                gap: 10,
                flexDirection: 'column',
              }}
            >
              {b.bar && (
                <>
                  <div style={{ width: b.bar * 0.5, height: 10, borderRadius: 5, background: '#D9D9DB' }} />
                  {b.h > 60 && <div style={{ width: b.bar, height: 10, borderRadius: 5, background: '#E3E3E5' }} />}
                  {b.h > 100 && <div style={{ width: b.bar * 0.8, height: 10, borderRadius: 5, background: '#E3E3E5' }} />}
                </>
              )}
              {b.text && (
                <div style={{ background: GREEN, color: '#0B3B26', fontWeight: 700, fontSize: 20, padding: '12px 28px', borderRadius: 10, opacity: sp(frame, T.APP + 12 + i * 6 + 8) }}>
                  {b.text}
                </div>
              )}
            </div>
          );
        })}
        <div style={{ position: 'absolute', right: 0, bottom: -6, fontFamily: CODE, fontSize: 14, color: INK_3, letterSpacing: 1, opacity: urlP }}>
          <span style={{ color: GREEN_INK }}>14 files</span> · 1,182 lines · 0 hand-written
        </div>
      </div>
    </Card>
  );
};
