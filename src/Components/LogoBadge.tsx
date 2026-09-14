import React from 'react';
import { Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, enter, radius, type } from '../theme';

type Props = {
  /** Path under public/, e.g. "assets/supabase.svg". Must be an official asset. */
  src: string;
  /** Optional label rendered beside the badge. */
  label?: string;
  delay?: number;
  /** Outer badge size in px. */
  size?: number;
  /** Apply `filter: invert(1)` — ONLY for pure monochrome marks. */
  invert?: boolean;
  /** Accent 1px border glow for highlight moments. */
  highlight?: boolean;
  /** Render the mark without the bordered tile. */
  bare?: boolean;
  style?: React.CSSProperties;
};

/**
 * Official logo asset in a bordered tile.
 * Never draw logos with shapes — always load a downloaded file via staticFile.
 */
export const LogoBadge: React.FC<Props> = ({
  src,
  label,
  delay = 0,
  size = 120,
  invert = false,
  highlight = false,
  bare = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = enter(frame, fps, delay);
  const markSize = Math.round(size * 0.5);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 24,
        opacity: e.opacity,
        transform: `translateY(${e.translateY}px) scale(${e.scale})`,
        ...style,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.lg,
          ...(bare
            ? null
            : {
                border: `1px solid ${highlight ? colors.accent : colors.border}`,
                backgroundColor: colors.surface,
                boxShadow: highlight ? colors.accentGlow : 'none',
              }),
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: markSize,
            height: markSize,
            objectFit: 'contain',
            filter: invert ? 'invert(1)' : 'none',
          }}
        />
      </div>
      {label ? (
        <div style={{ ...type.subhead, color: colors.text }}>{label}</div>
      ) : null}
    </div>
  );
};
