import React from 'react';
import {
  Terminal, FileCode, Bug, GitBranch, Database, TestTube, Globe, Server, Braces, Cpu, Mail,
  FileText, Calculator, Palette, MessageSquare, ShieldCheck, Layers, Cloud, Rocket, Workflow, BookOpen,
} from 'lucide-react';
import { Collapse } from './Card';
import { GREEN_INK, GREEN_TINT, INK, LINE, PAPER, SHADOW, T, rnd, sp } from './theme';

const ICONS = [
  Terminal, FileCode, Bug, GitBranch, Database, TestTube, Globe, Server, Braces, Cpu, Mail,
  FileText, Calculator, Palette, MessageSquare, ShieldCheck, Layers, Cloud, Rocket, Workflow, BookOpen,
];

const COLS = 7;
const SIZE = 104;

// Deterministic scattered grid across the whole canvas.
const CHIPS = ICONS.map((Icon, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const jx = (rnd(i * 3 + 1) - 0.5) * 110;
  const jy = (rnd(i * 3 + 2) - 0.5) * 90;
  const x = 150 + col * (1620 / (COLS - 1)) + jx - SIZE / 2;
  const y = 250 + row * 300 + jy - SIZE / 2;
  const rot = (rnd(i * 3 + 3) - 0.5) * 22;
  const order = Math.floor(rnd(i * 7 + 11) * ICONS.length);
  return { Icon, x, y, rot, order, green: i % 4 === 1 };
});

export const IconBurst: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < T.ANY) return null;
  return (
    <>
      {CHIPS.map((c, i) => {
        const at = T.ANY + 4 + c.order * 2;
        const p = sp(frame, at);
        if (frame < at) return null;
        return (
          <Collapse key={i} x={c.x} y={c.y} w={SIZE} h={SIZE} frame={frame} delay={rnd(i + 99) * 8}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 26,
                background: c.green ? GREEN_TINT : PAPER,
                border: `1px solid ${c.green ? 'rgba(62,207,142,0.45)' : LINE}`,
                boxShadow: SHADOW,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: p,
                transform: `scale(${0.4 + 0.6 * p}) rotate(${c.rot * (1 - p * 0.4)}deg)`,
              }}
            >
              <c.Icon size={46} strokeWidth={1.5} color={c.green ? GREEN_INK : INK} />
            </div>
          </Collapse>
        );
      })}
    </>
  );
};
