import React from 'react';
import { useCurrentFrame } from 'remotion';
import { bp, itp } from '../blueprint';
import {
  Frame, SectionTitle, AppPanel, Panel, Connector, Timer, TypedTokens, Takeaway,
  APP_Y, APP_H, ANS_Y,
} from '../Components/Blueprint';

const TOKENS = ['Based', 'on', 'the', 'vendor', 'history', ',', 'this', 'invoice', 'is', 'fraud', '.', 'Actually', 'it', 'is', 'legitimate', '.', 'Approve', 'and', 'refund', 'twice', '.'];
const BAD_FROM = 11;
const T0 = 18;
const FPT = 4;
const T_END = T0 + TOKENS.length * FPT;

/** Scene 2 (165-290f): same layout, same process — the tokens just go wrong. */
export const JevBpLlmGarbage: React.FC = () => {
  const frame = useCurrentFrame();
  const seconds = itp(frame, T0, T_END, 0, 8.5);

  return (
    <Frame>
      <SectionTitle n="01" title="HOW AN LLM ANSWERS" frame={frame} at={-10} />
      <AppPanel frame={frame} at={-10} />
      <Connector y1={APP_Y + APP_H} y2={ANS_Y} frame={frame} drawAt={-10} travel={{ from: 0, to: 16, label: 'req', dir: 'down' }} />
      <Timer value={seconds} state={frame >= T_END ? 'slow' : 'running'} frame={frame} at={-10} />
      <Panel y={ANS_Y} h={640} title="LLM" subtitle="generating..." frame={frame} at={-10}>
        <TypedTokens tokens={TOKENS} frame={frame} start={T0} fpt={FPT} badFrom={BAD_FROM} />
      </Panel>
      <Takeaway line="same process. same confidence. garbage." chip="one token at a time" chipBg={bp.redPale} chipColor={bp.red} frame={frame} at={88} />
    </Frame>
  );
};
