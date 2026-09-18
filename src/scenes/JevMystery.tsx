import React from 'react';
import { useCurrentFrame } from 'remotion';
import { bp, itp, stamp } from '../blueprint';
import { Frame, SectionTitle, Panel, Chip, Highlight } from '../Components/Blueprint';
import { JevMark } from '../Components/JevMark';

const TILE_Y = 160;
const TILE_H = 130;
const TILE_W = 270;
const TILE_XS = [80, 405, 730];
const BIG_X = 80;
const BIG_Y = 340;
const BIG_W = 920;
const BIG_H = 680;
const MARK_W = 340;

const T_MARK = 30;
const T_DIM = 70;
const T_LABEL = 95;
const LABEL = 'id: ████████';

export const JevMystery: React.FC = () => {
  const frame = useCurrentFrame();

  const markIn = itp(frame, T_MARK, T_MARK + 40);
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.12);
  const halo = markIn * (0.3 + pulse * 0.35);
  const haloSize = 18 + pulse * 22;
  const scanY = BIG_Y + 66 + ((frame * 4) % (BIG_H - 68));
  // Never resolves: the mark's line structure survives moderate blur, so this stays a breathing blob.
  const blur = 40 + Math.sin(frame * 0.07) * 5;
  const typed = LABEL.slice(0, Math.max(0, Math.floor((frame - T_LABEL) / 3)));
  const typing = frame >= T_LABEL && typed.length < LABEL.length;

  return (
    <Frame>
      <SectionTitle n="04" title="NOT LIKE THE OTHERS" frame={frame} at={0} left={80} top={64} />

      {TILE_XS.map((x, i) => {
        const dim = itp(frame, T_DIM + i * 6, T_DIM + i * 6 + 24, 1, 0.3);
        const strike = itp(frame, T_DIM + 8 + i * 6, T_DIM + 24 + i * 6);
        return (
          <div key={x} style={{ opacity: dim }}>
            <Panel x={x} y={TILE_Y} w={TILE_W} h={TILE_H} pad={14} title="LLM" subtitle="generating..." titleSize={20} subtitleSize={15} frame={frame} at={6 + i * 8}>
              <div style={{ fontSize: 15, color: bp.grey, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                the answer is probably
                <span style={{ display: 'inline-block', width: 8, height: 15, background: bp.grey, marginLeft: 4, verticalAlign: 'middle', opacity: frame % 14 < 9 ? 1 : 0 }} />
              </div>
            </Panel>
            <div style={{ position: 'absolute', left: x - 6, top: TILE_Y + TILE_H / 2, height: 2, width: (TILE_W + 12) * strike, background: bp.red, opacity: 0.85 }} />
          </div>
        );
      })}

      <Panel
        x={BIG_X} y={BIG_Y} w={BIG_W} h={BIG_H} pad={0}
        title="?" subtitle="unknown model"
        headerRight={<Chip text="?? ms" bg={bp.accentPale} color={bp.accent} />}
        frame={frame} at={20}
      >
        <div style={{ position: 'relative', width: BIG_W - 4, height: BIG_H - 68, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
          <div style={{ position: 'absolute', left: '50%', top: '46%', width: 620, height: 620, transform: 'translate(-50%,-50%)', background: `radial-gradient(circle, rgba(62,207,142,${0.18 * halo}) 0%, transparent 62%)` }} />
          <div style={{ position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)', opacity: markIn }}>
            <JevMark
              variant="black"
              size={MARK_W}
              style={{ filter: `brightness(0.15) blur(${blur}px) drop-shadow(0 0 ${haloSize}px rgba(62,207,142,${halo}))` }}
            />
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: scanY - BIG_Y - 66, height: 2, background: `linear-gradient(90deg, transparent, rgba(62,207,142,${0.35 * markIn}), transparent)` }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 28, display: 'flex', justifyContent: 'center', fontSize: 24, ...stamp(frame, T_LABEL) }}>
            <Highlight>
              {typed}
              <span style={{ display: 'inline-block', width: 12, height: 24, background: bp.ink, marginLeft: 4, verticalAlign: 'middle', opacity: typing && frame % 14 < 9 ? 1 : 0 }} />
            </Highlight>
          </div>
        </div>
      </Panel>
    </Frame>
  );
};
