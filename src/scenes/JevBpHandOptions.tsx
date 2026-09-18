import React from 'react';
import { useCurrentFrame } from 'remotion';
import {
  Frame, SectionTitle, AppPanel, Panel, Connector, ScoreRow, Note,
  APP_Y, APP_H, ANS_Y,
} from '../Components/Blueprint';

export const OPTIONS = ['FRAUD', 'CLEAN', 'REVIEW'];
export const JEV_PANEL_H = 460;

/** Scene 3 (290-380f): hard cut. Jev doesn't generate — you hand it the list. */
export const JevBpHandOptions: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Frame>
      <SectionTitle n="02" title="HOW JEV ANSWERS" frame={frame} at={0} />
      <AppPanel frame={frame} at={6} />
      <Connector y1={APP_Y + APP_H} y2={ANS_Y} frame={frame} drawAt={18} />
      <Panel y={ANS_Y} h={JEV_PANEL_H} title="JEV" subtitle="your options, scored" frame={frame} at={12}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {OPTIONS.map((label, i) => (
            <ScoreRow key={label} label={label} fill={0} score={0} selected={false} showScore={false} frame={frame} at={30 + i * 12} />
          ))}
        </div>
      </Panel>
      <Note text={'you hand it the list.\nit can\'t add to it.'} top={ANS_Y + JEV_PANEL_H + 50} frame={frame} at={64} />
    </Frame>
  );
};
