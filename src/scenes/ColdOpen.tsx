import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ArchDiagram, SceneWrapper } from '../Components/system';
import { enter } from '../theme';

export const COLD_OPEN_DURATION = 135;
const CUT = 90;

/** Beat A: OpenAI mark alone. Beat B (f90): hard cut to the empty diagram. */
export const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = enter(frame, fps, 0);

  return (
    <SceneWrapper exit={false} justify="center">
      {frame < CUT ? (
        <Img
          src={staticFile('assets/openai.svg')}
          style={{
            width: 220,
            height: 220,
            objectFit: 'contain',
            opacity: e.opacity,
            transform: `translateY(${e.translateY}px) scale(${e.scale})`,
          }}
        />
      ) : (
        <AbsoluteFill>
          <ArchDiagram />
        </AbsoluteFill>
      )}
    </SceneWrapper>
  );
};
