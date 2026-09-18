import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { circularFamily } from '../fonts';
import { FG, spSlow } from '../tokens';
import { JevBackdrop } from '../Components/JevBackdrop';
import { JevMark } from '../Components/JevMark';

/** Scene 3 (290-380f global): hard cut to black, Jev mark + wordmark. */
export const JevReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const markP = spSlow(frame, 10);
  const wordP = spSlow(frame, 18);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f0f0f', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <JevBackdrop frame={frame} tint="rgba(62,207,142,0.12)" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <div style={{ opacity: markP, transform: `scale(${0.98 + markP * 0.02})` }}>
          <JevMark variant="white" size={180} glow={markP} />
        </div>
        <div
          style={{
            opacity:       wordP,
            transform:     `translateY(${(1 - wordP) * 12}px)`,
            fontFamily:    circularFamily,
            fontSize:      64,
            fontWeight:    700,
            letterSpacing: 1,
            color:         FG,
          }}
        >
          Jev
        </div>
      </div>
    </AbsoluteFill>
  );
};
