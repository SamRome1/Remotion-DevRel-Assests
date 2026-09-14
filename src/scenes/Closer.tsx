import React from 'react';
import { Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneWrapper } from '../Components/system';
import { colors, enter, fonts, typeOut } from '../theme';

export const CLOSER_DURATION = 210;
const LINE = 'the database from your tutorial';
const TYPE_AT = 40;

/** Elephant returns small; one mono line types; hold; hard cut to black on the last frame. */
export const Closer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const el = enter(frame, fps, 0);
  const text = typeOut(LINE, frame, TYPE_AT, 2);
  const typing = frame >= TYPE_AT && text.length < LINE.length;
  const caretOn = typing && Math.floor(frame / 15) % 2 === 0;

  return (
    <SceneWrapper exit={false} justify="center" gap={44}>
      <Img
        src={staticFile('assets/postgresql.svg')}
        style={{
          width: 120,
          height: 120,
          objectFit: 'contain',
          opacity: el.opacity,
          transform: `translateY(${el.translateY}px) scale(${el.scale})`,
        }}
      />
      <div style={{ fontFamily: fonts.mono, fontSize: 30, color: colors.text, whiteSpace: 'pre', minHeight: 40 }}>
        {text}
        <span style={{ opacity: caretOn ? 1 : 0, color: colors.zinc400 }}>▏</span>
      </div>
    </SceneWrapper>
  );
};
