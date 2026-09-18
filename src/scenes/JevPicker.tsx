import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { spSlow } from '../tokens';
import { JevBackdrop } from '../Components/JevBackdrop';
import { JevMark } from '../Components/JevMark';
import { ConfidenceList } from '../Components/ConfidenceList';

/** Scene 4 (380-660f global): Jev scores every option in parallel, one wins. */
export const JevPicker: React.FC = () => {
  const frame = useCurrentFrame();
  const markP = spSlow(frame, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f0f0f', overflow: 'hidden', alignItems: 'center' }}>
      <JevBackdrop frame={frame} tint="rgba(62,207,142,0.1)" />
      <div style={{ position: 'absolute', top: 130, opacity: markP }}>
        <JevMark variant="green" size={90} glow={0.6} />
      </div>
      <div style={{ position: 'absolute', top: 320, left: 80, right: 80 }}>
        <ConfidenceList frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
