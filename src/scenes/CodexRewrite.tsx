import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ArchDiagram, SceneWrapper, SlotBadge } from '../Components/system';
import { afterScene2 } from './diagramState';
import { brand, colors, enter, fonts, itp, radius, slowSpring } from '../theme';

export const CODEX_REWRITE_DURATION = 330;

const DRAIN_AT = 150;
const DRAIN_LEN = 60;
const RUST_TARGET = 0.95;
const BAR_OUT = 290;
const DOCK_AT = 300;

export const CodexRewrite: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const head = enter(frame, fps, 0);
  const bar = enter(frame, fps, 4);
  const drain = slowSpring(frame, fps, DRAIN_AT, DRAIN_LEN);
  const rustFrac = drain * RUST_TARGET;
  const rustPct = Math.round(rustFrac * 100);
  const badgeSwap = itp(frame, DRAIN_AT, DRAIN_AT + 20);
  const labelIn = enter(frame, fps, DRAIN_AT);
  const groupOut = itp(frame, BAR_OUT, BAR_OUT + 8, 1, 0);
  const diagramOpacity = frame < BAR_OUT ? itp(frame, 0, 8, 1, 0.15) : itp(frame, BAR_OUT, BAR_OUT + 10, 0.15, 1);

  const agent = frame >= DOCK_AT - 2 ? <SlotBadge src="assets/rust.svg" delay={DOCK_AT} /> : undefined;

  return (
    <SceneWrapper exit={false}>
      <AbsoluteFill>
        <ArchDiagram opacity={diagramOpacity} slots={{ ...afterScene2, agent }} />
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: groupOut }}>
        <div style={{ width: 864, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* repo header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: head.opacity,
              transform: `translateY(${head.translateY}px) scale(${head.scale})`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Img src={staticFile('assets/github.svg')} style={{ width: 26, height: 26, objectFit: 'contain' }} />
              <span style={{ fontFamily: fonts.mono, fontSize: 20, color: colors.zinc400 }}>openai/codex</span>
            </div>
            <span
              style={{
                fontFamily: fonts.mono,
                fontSize: 20,
                color: colors.text,
                fontVariantNumeric: 'tabular-nums',
                opacity: labelIn.opacity,
                transform: `translateY(${labelIn.translateY}px)`,
              }}
            >
              {rustPct}% Rust
            </span>
          </div>

          {/* badge + language bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              opacity: bar.opacity,
              transform: `translateY(${bar.translateY}px) scale(${bar.scale})`,
            }}
          >
            <div style={{ position: 'relative', width: 56, height: 56 }}>
              <Img
                src={staticFile('assets/typescript.svg')}
                style={{ position: 'absolute', inset: 0, width: 56, height: 56, objectFit: 'contain', opacity: 1 - badgeSwap }}
              />
              <Img
                src={staticFile('assets/rust.svg')}
                style={{ position: 'absolute', inset: 0, width: 56, height: 56, objectFit: 'contain', opacity: badgeSwap }}
              />
            </div>
            <div
              style={{
                flex: 1,
                height: 12,
                borderRadius: radius.pill,
                overflow: 'hidden',
                display: 'flex',
                backgroundColor: colors.zinc800,
              }}
            >
              <div style={{ width: `${rustFrac * 100}%`, backgroundColor: brand.rust }} />
              <div style={{ flex: 1, backgroundColor: brand.typescript }} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SceneWrapper>
  );
};
