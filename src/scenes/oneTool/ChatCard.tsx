import React from 'react';
import { Moon } from 'lucide-react';
import { Card, Pill } from './Card';
import { FILL, INK, PAPER, T, UI, sp } from './theme';

type Msg = { me: boolean; text: string; at: number };
const MSGS: Msg[] = [
  { me: true, text: 'why is this STILL returning null??', at: T.ARGUE + 10 },
  { me: false, text: "You're awaiting the wrong promise. Line 12.", at: T.ARGUE + 26 },
  { me: true, text: "I've checked line 12. Three times.", at: T.ARGUE + 44 },
  { me: false, text: 'Line 12 in the other file.', at: T.ARGUE + 60 },
];

export const ChatCard: React.FC<{ frame: number; x: number; y: number; w: number; h: number }> = ({ frame, x, y, w, h }) => (
  <Card
    x={x} y={y} w={w} h={h} frame={frame} at={T.ARGUE} title="chat"
    right={<Pill color={INK} bg={FILL}><Moon size={14} strokeWidth={2} color={INK} />3:12 AM</Pill>}
    pad={20}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: UI }}>
      {MSGS.map((m, i) => {
        const p = sp(frame, m.at);
        if (frame < m.at) return null;
        return (
          <div
            key={i}
            style={{
              alignSelf: m.me ? 'flex-end' : 'flex-start',
              maxWidth: '78%',
              background: m.me ? INK : FILL,
              color: m.me ? PAPER : INK,
              borderRadius: 16,
              borderBottomRightRadius: m.me ? 4 : 16,
              borderBottomLeftRadius: m.me ? 16 : 4,
              padding: '10px 16px',
              fontSize: 21,
              lineHeight: 1.3,
              opacity: p,
              transform: `translateY(${(1 - p) * 14}px) scale(${0.96 + 0.04 * p})`,
              transformOrigin: m.me ? 'right bottom' : 'left bottom',
            }}
          >
            {m.text}
          </div>
        );
      })}
    </div>
  </Card>
);
