import React from 'react';
import { GREEN_INK, INK, T, UI, itp, sp } from './theme';

type Beat = { start: number; end: number; pre: string; hi: string; post: string };

const BEATS: Beat[] = [
  { start: T.WRITE, end: T.DEBUG, pre: 'We ', hi: 'write code', post: ' with it.' },
  { start: T.DEBUG, end: T.APP, pre: 'We ', hi: 'debug', post: ' the code with it.' },
  { start: T.APP, end: T.SQL, pre: 'We build ', hi: 'entire apps', post: ' with it.' },
  { start: T.SQL, end: T.ARGUE, pre: 'Generate ', hi: 'the SQL', post: '.' },
  { start: T.ARGUE, end: T.ANY, pre: 'We argue with it in the ', hi: 'middle of the night', post: '.' },
  { start: T.ANY, end: T.ONE, pre: 'Basically ', hi: 'anything', post: ' you can do with it.' },
];

/** Top-center kinetic caption that swaps per VO beat. */
export const Caption: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 44, height: 72, pointerEvents: 'none' }}>
    {BEATS.map((b, i) => {
      if (frame < b.start - 1 || frame > b.end + 10) return null;
      const inP = sp(frame, b.start);
      const outP = itp(frame, b.end, b.end + 8);
      const opacity = Math.min(1, inP * 1.5) * (1 - outP);
      const ty = (1 - inP) * 26 - outP * 22;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            textAlign: 'center',
            fontFamily: UI,
            fontSize: 46,
            fontWeight: 700,
            letterSpacing: -1,
            color: INK,
            opacity,
            transform: `translateY(${ty}px)`,
            whiteSpace: 'nowrap',
          }}
        >
          {b.pre}
          <span style={{ color: GREEN_INK }}>{b.hi}</span>
          {b.post}
        </div>
      );
    })}
  </div>
);
