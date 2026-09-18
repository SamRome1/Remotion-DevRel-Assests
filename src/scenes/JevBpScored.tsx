import React from 'react';
import { useCurrentFrame } from 'remotion';
import { bp, itp } from '../blueprint';
import {
  Frame, SectionTitle, AppPanel, Panel, Connector, Timer, ScoreRow, Note, Takeaway,
  APP_Y, APP_H, ANS_Y, L,
} from '../Components/Blueprint';
import { JevMark } from '../Components/JevMark';
import { OPTIONS, JEV_PANEL_H } from './JevBpHandOptions';

const SCORES = [0.07, 0.88, 0.05];
const WINNER = 1;
const FILL_START = 22;
const FILL_END = 52;

/** Scene 4 (380-660f): one parallel pass, every option scored, one picked. */
export const JevBpScored: React.FC = () => {
  const frame = useCurrentFrame();
  const seconds = itp(frame, 18, 30, 0, 0.1);
  const travel = frame < 40
    ? { from: 0, to: 18, label: 'req', dir: 'down' as const }
    : { from: 62, to: 86, label: 'CLEAN', dir: 'up' as const };

  return (
    <Frame>
      <SectionTitle n="02" title="HOW JEV ANSWERS" frame={frame} at={-10} />
      <AppPanel frame={frame} at={-10} />
      <Connector y1={APP_Y + APP_H} y2={ANS_Y} frame={frame} drawAt={-10} travel={travel} />
      {frame >= 18 && <Timer value={seconds} state={frame >= 30 ? 'fast' : 'running'} frame={frame} at={18} />}
      <Panel y={ANS_Y} h={JEV_PANEL_H} title="JEV" subtitle="your options, scored" frame={frame} at={-10}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {OPTIONS.map((label, i) => (
            <ScoreRow
              key={label}
              label={label}
              fill={itp(frame, FILL_START, FILL_END, 0, SCORES[i])}
              score={itp(frame, FILL_START, FILL_END, 0, SCORES[i])}
              selected={i === WINNER && frame >= 46}
              showScore={frame >= FILL_START}
              frame={frame}
              at={-10}
            />
          ))}
        </div>
      </Panel>
      <Note text={'no tokens. one parallel pass.\nevery option scored at once.'} top={ANS_Y + JEV_PANEL_H + 50} frame={frame} at={56} />
      <Takeaway line="it can't write. it points at one of YOUR options." chip="0.1 seconds" frame={frame} at={100} />
      <div style={{ position: 'absolute', left: L, top: 1790, display: 'flex', alignItems: 'center', gap: 12, color: bp.grey, fontSize: 20, opacity: itp(frame, 120, 130) }}>
        <JevMark variant="white" size={18} style={{ opacity: 0.6 }} />
        <span>jev · typesafe.ai</span>
      </div>
    </Frame>
  );
};
