import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { DOT_GRID, PAPER, T, easeInOut, itp } from './theme';
import { Caption } from './Caption';
import { EditorCard } from './EditorCard';
import { AppCard } from './AppCard';
import { SqlCard } from './SqlCard';
import { ChatCard } from './ChatCard';
import { IconBurst } from './IconBurst';
import { Finale } from './Finale';

export { ONE_TOOL_DURATION } from './theme';

// Card layout on the 1920x1080 canvas (caption row occupies y 44–116).
const L = { x: 100, w: 800 };
const R = { x: 1020, w: 800 };
const TOP = { y: 150, h: 420 };
const BOT = { y: 610, h: 380 };
// Editor opens large and centered, then docks into the top-left slot as the app card arrives.
const BIG = { x: 310, y: 170, w: 1300, h: 610 };
const DOCK_A = T.APP - 12;
const DOCK_B = T.APP + 14;

export const OneToolScene: React.FC = () => {
  const frame = useCurrentFrame();
  // Dot grid thins out once everything collapses into the one tool.
  const gridOpacity = 1 - itp(frame, T.ONE, T.ONE + 30) * 0.55;
  const d = easeInOut(itp(frame, DOCK_A, DOCK_B));
  const ed = {
    x: BIG.x + (L.x - BIG.x) * d,
    y: BIG.y + (TOP.y - BIG.y) * d,
    w: BIG.w + (L.w - BIG.w) * d,
    h: BIG.h + (TOP.h - BIG.h) * d,
    zoom: 1.42 + (1 - 1.42) * d,
  };

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER, overflow: 'hidden' }}>
      <div style={{ ...DOT_GRID, opacity: gridOpacity }} />
      <Caption frame={frame} />
      <EditorCard frame={frame} x={ed.x} y={ed.y} w={ed.w} h={ed.h} zoom={ed.zoom} />
      {frame >= T.APP && <AppCard frame={frame} x={R.x} y={TOP.y} w={R.w} h={TOP.h} />}
      {frame >= T.SQL && <SqlCard frame={frame} x={L.x} y={BOT.y} w={L.w} h={BOT.h} />}
      {frame >= T.ARGUE && <ChatCard frame={frame} x={R.x} y={BOT.y} w={R.w} h={BOT.h} />}
      <IconBurst frame={frame} />
      <Finale frame={frame} />
    </AbsoluteFill>
  );
};
