import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { FG_LIGHT, MONO } from '../tokens';
import { JevBackdrop } from '../Components/JevBackdrop';
import { TokenStream } from '../Components/TokenStream';

const PROMPT = '> summarize this support ticket';

/** Scene 1 (0-170f): a normal LLM streams clean tokens one at a time. */
export const JevTokenStream: React.FC = () => {
  const frame = useCurrentFrame();
  const chars = Math.max(0, Math.min(PROMPT.length, Math.floor((frame - 6) / 2)));
  const visiblePrompt = PROMPT.slice(0, chars);
  const caretOn = frame % 16 < 8;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f0f0f', overflow: 'hidden' }}>
      <JevBackdrop frame={frame} tint="rgba(255,255,255,0.06)" />
      <div style={{ position: 'absolute', top: 210, left: 80, right: 80 }}>
        <div style={{ fontFamily: MONO, fontSize: 30, color: FG_LIGHT }}>
          {visiblePrompt}
          <span style={{ opacity: chars < PROMPT.length && caretOn ? 1 : 0 }}>_</span>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 340, left: 80, right: 80, bottom: 140 }}>
        <TokenStream elapsedFrames={frame} corrupt={0} />
      </div>
    </AbsoluteFill>
  );
};
