import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ReplicaTopology, SceneWrapper, TOPO_W } from '../Components/system';
import { ELEPHANT_HERO } from './CollapseToElephant';
import { CANVAS, colors, fonts, itp, lerp, slowSpring, typeOut } from '../theme';

export const SHARDS_ONE_DURATION = 300;

const DOCK_LEN = 40;
const PRIMARY_AT = 30;
const REPLICAS_AT = 40;
const STAGGER = 2.5; // 48 replicas → ~120 frames
const DIM_AT = 200;
const TYPE_AT = 212;
const ELEPHANT_SMALL = 110;
const ELEPHANT_Y = 320; // center of docked elephant
const TOPO_TOP = ELEPHANT_Y + ELEPHANT_SMALL / 2 + 28;

export const ShardsOne: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dock = slowSpring(frame, fps, 0, DOCK_LEN);
  const size = lerp(ELEPHANT_HERO, ELEPHANT_SMALL, dock);
  const cy = lerp(CANVAS.height / 2, ELEPHANT_Y, dock);
  const dim = itp(frame, DIM_AT, DIM_AT + 12, 1, 0.4);
  const text = typeOut('shards: 1', frame, TYPE_AT, 3);
  const caretOn = frame >= TYPE_AT && Math.floor(frame / 15) % 2 === 0;

  return (
    <SceneWrapper>
      <AbsoluteFill style={{ opacity: dim }}>
        <Img
          src={staticFile('assets/postgresql.svg')}
          style={{
            position: 'absolute',
            left: CANVAS.width / 2 - size / 2,
            top: cy - size / 2,
            width: size,
            height: size,
            objectFit: 'contain',
          }}
        />
        <div style={{ position: 'absolute', left: CANVAS.width / 2 - TOPO_W / 2, top: TOPO_TOP }}>
          <ReplicaTopology primaryAt={PRIMARY_AT} replicasAt={REPLICAS_AT} stagger={STAGGER} />
        </div>
      </AbsoluteFill>

      {frame >= TYPE_AT ? (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 44,
              color: colors.text,
              backgroundColor: colors.bg,
              padding: '18px 36px',
              letterSpacing: 0.5,
            }}
          >
            {text}
            <span style={{ opacity: caretOn && text.length < 9 ? 1 : 0, color: colors.zinc400 }}>▏</span>
          </div>
        </AbsoluteFill>
      ) : null}
    </SceneWrapper>
  );
};
