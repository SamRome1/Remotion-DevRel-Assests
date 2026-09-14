import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneWrapper } from '../Components/system';
import { colors, enter, fonts, itp } from '../theme';

export const NINE_MONTHS_DURATION = 195;
const A_AT = 20;
const RULE_AT = 45;
const B_AT = 70;

export const NineMonths: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = enter(frame, fps, A_AT);
  const b = enter(frame, fps, B_AT);
  const rule = itp(frame, RULE_AT, RULE_AT + 25);

  return (
    <SceneWrapper justify="center" gap={36}>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 72,
          fontWeight: 400,
          color: colors.text,
          lineHeight: 1,
          opacity: a.opacity,
          transform: `translateY(${a.translateY}px) scale(${a.scale})`,
        }}
      >
        9 months
      </div>
      <div style={{ width: 220, height: 1, backgroundColor: colors.accent, transform: `scaleX(${rule})` }} />
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 72,
          fontWeight: 700,
          color: colors.text,
          lineHeight: 1,
          opacity: b.opacity,
          transform: `translateY(${b.translateY}px) scale(${b.scale})`,
        }}
      >
        1 SEV0
      </div>
    </SceneWrapper>
  );
};
