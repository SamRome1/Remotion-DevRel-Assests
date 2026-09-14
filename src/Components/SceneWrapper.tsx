import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, exitFade, fonts, SAFE_INSET } from '../theme';

type Props = {
  children: React.ReactNode;
  /** Vertical alignment of content inside the safe zone. */
  align?: 'center' | 'start' | 'end';
  /** Horizontal alignment. */
  justify?: 'center' | 'start';
  /** Fade the whole scene out over the final frames (default true). */
  exit?: boolean;
  gap?: number;
};

/**
 * Root of every scene. Pure black canvas, center-80% safe zone,
 * flex column, and a quick opacity exit on the last frames.
 */
export const SceneWrapper: React.FC<Props> = ({
  children,
  align = 'center',
  justify = 'start',
  exit = true,
  gap = 24,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = exit ? exitFade(frame, durationInFrames) : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          padding: SAFE_INSET,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: align === 'center' ? 'center' : align === 'start' ? 'flex-start' : 'flex-end',
          alignItems: justify === 'center' ? 'center' : 'flex-start',
          gap,
          opacity,
          fontFamily: fonts.ui,
          color: colors.text,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
