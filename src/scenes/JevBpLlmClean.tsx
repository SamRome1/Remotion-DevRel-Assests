import React from 'react';
import { useCurrentFrame } from 'remotion';
import { itp } from '../blueprint';
import {
  Frame, SectionTitle, AppPanel, Panel, Connector, Timer, TypedTokens, Takeaway,
  APP_Y, APP_H, ANS_Y,
} from '../Components/Blueprint';

const TOKENS = ['Based', 'on', 'the', 'line', 'items', 'and', 'the', 'vendor', 'history', ',', 'this', 'invoice', 'appears', 'to', 'be', 'legitimate', '.'];
const T0 = 50;
const FPT = 6;
const T_END = T0 + TOKENS.length * FPT;

/** Scene 1 (0-165f): an LLM writes the answer one token at a time. */
export const JevBpLlmClean: React.FC = () => {
  const frame = useCurrentFrame();
  const seconds = itp(frame, T0, T_END, 0, 8.5);

  return (
    <Frame>
      <SectionTitle n="01" title="HOW AN LLM ANSWERS" frame={frame} at={0} />
      <AppPanel frame={frame} at={8} />
      <Connector y1={APP_Y + APP_H} y2={ANS_Y} frame={frame} drawAt={20} travel={{ from: 30, to: 48, label: 'req', dir: 'down' }} />
      {frame >= 48 && <Timer value={seconds} state={frame >= T_END ? 'slow' : 'running'} frame={frame} at={48} />}
      <Panel y={ANS_Y} h={640} title="LLM" subtitle="generating..." frame={frame} at={14}>
        <TypedTokens tokens={TOKENS} frame={frame} start={T0} fpt={FPT} />
      </Panel>
      <Takeaway line="it writes a sentence, one token at a time." chip="8.5 seconds" frame={frame} at={128} />
    </Frame>
  );
};
