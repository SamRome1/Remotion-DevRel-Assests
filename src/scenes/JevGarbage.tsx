import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { itp } from '../tokens';
import { JevBackdrop } from '../Components/JevBackdrop';
import { TokenStream } from '../Components/TokenStream';

const SCENE1_DURATION = 170;

/** Scene 2 (170-290f global): the same stream degrades into amber garbage. */
export const JevGarbage: React.FC = () => {
  const frame = useCurrentFrame();
  const corrupt = frame < 60
    ? itp(frame, 0, 60, 0, 0.6)
    : itp(frame, 60, 120, 0.6, 1);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f0f0f', overflow: 'hidden' }}>
      <JevBackdrop frame={frame + SCENE1_DURATION} tint={`rgba(245,166,35,${0.05 + corrupt * 0.08})`} />
      <div style={{ position: 'absolute', top: 340, left: 80, right: 80, bottom: 140 }}>
        <TokenStream elapsedFrames={frame + SCENE1_DURATION} corrupt={corrupt} />
      </div>
    </AbsoluteFill>
  );
};
