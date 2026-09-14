import React from 'react';
import { Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneWrapper } from '../Components/system';
import { colors, enter, fonts, radius } from '../theme';

export const RECEIPT_DURATION = 195;
const AT = 20;

/** Citation card — a document, not a screenshot recreation. */
export const TheReceipt: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = enter(frame, fps, AT);
  const rows = [enter(frame, fps, AT + 8), enter(frame, fps, AT + 14), enter(frame, fps, AT + 20)];
  const rise = (e: ReturnType<typeof enter>): React.CSSProperties => ({
    opacity: e.opacity,
    transform: `translateY(${e.translateY}px)`,
  });

  return (
    <SceneWrapper justify="center">
      <div
        style={{
          position: 'relative',
          width: 760,
          border: `1px solid ${colors.zinc700}`,
          borderRadius: radius.lg,
          padding: '48px 56px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          backgroundColor: colors.bg,
          opacity: card.opacity,
          transform: `translateY(${card.translateY}px) scale(${card.scale})`,
        }}
      >
        <Img
          src={staticFile('assets/postgresql.svg')}
          style={{ position: 'absolute', top: 40, right: 48, width: 44, height: 44, objectFit: 'contain', ...rise(rows[0]) }}
        />
        <div style={{ fontFamily: fonts.mono, fontSize: 18, letterSpacing: 1.5, color: colors.zinc400, ...rise(rows[0]) }}>
          PGCONF.DEV 2025
        </div>
        <div
          style={{
            fontFamily: fonts.ui,
            fontWeight: 600,
            fontSize: 38,
            lineHeight: 1.2,
            letterSpacing: -0.5,
            color: colors.text,
            paddingRight: 60,
            ...rise(rows[1]),
          }}
        >
          “Scaling Postgres to the Next Level at OpenAI”
        </div>
        <div style={{ fontFamily: fonts.ui, fontWeight: 500, fontSize: 22, color: colors.zinc400, ...rise(rows[2]) }}>
          Bohan Zhang · OpenAI
        </div>
      </div>
    </SceneWrapper>
  );
};
