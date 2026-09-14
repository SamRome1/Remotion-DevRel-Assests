import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { SceneWrapper } from '../Components/system';
import { brand, colors, fonts, itp, typeOut } from '../theme';

export const RULE_DENIED_DURATION = 165;
const LINE = 'CREATE TABLE users_v2 (';
const STAMP_AT = 90;

export const RuleDenied: React.FC = () => {
  const frame = useCurrentFrame();
  const text = typeOut(LINE, frame, 0, 2);
  const caretOn = frame < STAMP_AT && Math.floor(frame / 15) % 2 === 0;

  // Sanctioned overshoot: the stamp hits at 1.15 and settles to 1.0 over 6 frames.
  const stampScale = interpolate(frame, [STAMP_AT, STAMP_AT + 6], [1.15, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const stampOpacity = itp(frame, STAMP_AT, STAMP_AT + 2);
  const strike = itp(frame, STAMP_AT, STAMP_AT + 12);

  return (
    <SceneWrapper justify="center">
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 40, color: colors.text, whiteSpace: 'pre' }}>
          {text}
          <span style={{ opacity: caretOn ? 1 : 0, color: colors.zinc400 }}>▏</span>
        </div>
        {/* strikethrough */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '52%',
            width: '100%',
            height: 2,
            backgroundColor: brand.denied,
            transform: `scaleX(${strike})`,
            transformOrigin: '0% 50%',
          }}
        />
        {/* stamp */}
        {frame >= STAMP_AT ? (
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
            <div
              style={{
                fontFamily: fonts.ui,
                fontWeight: 700,
                fontSize: 64,
                letterSpacing: 4,
                color: brand.denied,
                border: `1px solid ${brand.denied}`,
                borderRadius: 8,
                padding: '6px 28px',
                lineHeight: 1,
                opacity: stampOpacity,
                transform: `rotate(-6deg) scale(${stampScale})`,
              }}
            >
              DENIED
            </div>
          </AbsoluteFill>
        ) : null}
      </div>
    </SceneWrapper>
  );
};
