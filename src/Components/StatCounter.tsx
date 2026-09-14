import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, enter, springs, type } from '../theme';

type Props = {
  /** Final value. */
  value: number;
  /** Text before the number, e.g. "$". */
  prefix?: string;
  /** Text after the number, e.g. "%" or "k". */
  suffix?: string;
  /** Caption under the number. */
  label?: string;
  delay?: number;
  /** Frames the count-up takes (default 45). */
  duration?: number;
  decimals?: number;
  /** Color the number with the accent instead of white. */
  accent?: boolean;
  fontSize?: number;
  weight?: number;
  letterSpacing?: number;
  align?: 'left' | 'center';
  style?: React.CSSProperties;
  numeralStyle?: React.CSSProperties;
};

const format = (n: number, decimals: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** Large Inter numeral that counts up, with an optional mono-style caption. */
export const StatCounter: React.FC<Props> = ({
  value,
  prefix = '',
  suffix = '',
  label,
  delay = 0,
  duration = 45,
  decimals = 0,
  accent = false,
  fontSize = type.stat.fontSize,
  weight = type.stat.fontWeight,
  letterSpacing = type.stat.letterSpacing,
  align = 'left',
  style,
  numeralStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = enter(frame, fps, delay);
  const count = spring({
    fps,
    frame: frame - delay,
    config: springs.enter,
    durationInFrames: duration,
  });
  const current = value * count;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        gap: 28,
        opacity: e.opacity,
        transform: `translateY(${e.translateY}px) scale(${e.scale})`,
        transformOrigin: align === 'center' ? '50% 50%' : '0% 50%',
        ...style,
      }}
    >
      <div
        style={{
          ...type.stat,
          fontSize,
          fontWeight: weight,
          letterSpacing,
          color: accent ? colors.accent : colors.text,
          fontVariantNumeric: 'tabular-nums',
          ...numeralStyle,
        }}
      >
        {prefix}
        {format(current, decimals)}
        {suffix}
      </div>
      {label ? (
        <div style={{ ...type.monoLabel, color: colors.textSecondary, textTransform: 'uppercase' }}>
          {label}
        </div>
      ) : null}
    </div>
  );
};
