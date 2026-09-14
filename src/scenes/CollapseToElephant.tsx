import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ArchDiagram, ARCH_NODES, SceneWrapper } from '../Components/system';
import { afterScene4 } from './diagramState';
import { CANVAS, enter, slowSpring } from '../theme';

export const COLLAPSE_DURATION = 210;
const COLLAPSE_AT = 30;
const COLLAPSE_LEN = 60;
const ELEPHANT_AT = 90;
export const ELEPHANT_HERO = 260;

/** The diagram is swallowed into the db slot, which drifts to canvas center; the elephant appears there. */
export const CollapseToElephant: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = slowSpring(frame, fps, COLLAPSE_AT, COLLAPSE_LEN);
  const shift = (CANVAS.height / 2 - ARCH_NODES.db.y) * c; // db slot → center
  const el = enter(frame, fps, ELEPHANT_AT);

  return (
    <SceneWrapper exit={false} justify="center">
      {c < 0.999 ? (
        <AbsoluteFill style={{ transform: `translateY(${shift}px)` }}>
          <ArchDiagram slots={afterScene4} collapse={c} />
        </AbsoluteFill>
      ) : null}
      {frame >= ELEPHANT_AT ? (
        <Img
          src={staticFile('assets/postgresql.svg')}
          style={{
            width: ELEPHANT_HERO,
            height: ELEPHANT_HERO,
            objectFit: 'contain',
            opacity: el.opacity,
            transform: `translateY(${el.translateY}px) scale(${el.scale})`,
          }}
        />
      ) : null}
    </SceneWrapper>
  );
};
