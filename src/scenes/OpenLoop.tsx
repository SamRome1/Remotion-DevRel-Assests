import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneWrapper, StatCounter } from '../Components/system';
import { colors, enter, fonts, itp } from '../theme';

export const OPEN_LOOP_DURATION = 105;
const SIZE = 44;
const RULE_AT = 48;

/** "1 database. 1,000,000,000 users." — the billion spins up, then a thin accent rule draws beneath. */
export const OpenLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = enter(frame, fps, 0);
  const rule = itp(frame, RULE_AT, RULE_AT + 25);
  const numeral: React.CSSProperties = { fontFamily: fonts.ui, fontSize: SIZE, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1 };

  return (
    <SceneWrapper justify="center" gap={28}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 12,
          color: colors.text,
          opacity: e.opacity,
          transform: `translateY(${e.translateY}px) scale(${e.scale})`,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={numeral}>1 database.</span>
        <StatCounter value={1_000_000_000} delay={0} duration={35} fontSize={SIZE} weight={600} letterSpacing={-0.5} numeralStyle={{ lineHeight: 1 }} />
        <span style={numeral}>users.</span>
      </div>
      <div
        style={{
          width: 700,
          height: 1,
          backgroundColor: colors.accent,
          transform: `scaleX(${rule})`,
          transformOrigin: '0% 50%',
        }}
      />
    </SceneWrapper>
  );
};
