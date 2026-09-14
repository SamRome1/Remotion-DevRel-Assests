import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, enter, radius, type } from '../theme';

type Props = {
  children: React.ReactNode;
  delay?: number;
  /** Render as a bordered pill instead of bare text. */
  pill?: boolean;
  /** Use the accent color for text (and border, when pill). */
  accent?: boolean;
  /** Show a small accent dot before the label. */
  dot?: boolean;
  uppercase?: boolean;
  size?: number;
  style?: React.CSSProperties;
};

/** JetBrains Mono technical label / tag. */
export const MonoLabel: React.FC<Props> = ({
  children,
  delay = 0,
  pill = false,
  accent = false,
  dot = false,
  uppercase = true,
  size = type.monoLabel.fontSize,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = enter(frame, fps, delay);
  const color = accent ? colors.accent : colors.textSecondary;

  return (
    <div
      style={{
        ...type.monoLabel,
        fontSize: size,
        color,
        textTransform: uppercase ? 'uppercase' : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        ...(pill
          ? {
              padding: '10px 18px',
              border: `1px solid ${accent ? colors.accentBorder : colors.border}`,
              borderRadius: radius.pill,
            }
          : null),
        opacity: e.opacity,
        transform: `translateY(${e.translateY}px) scale(${e.scale})`,
        transformOrigin: '0% 50%',
        ...style,
      }}
    >
      {dot ? (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: radius.pill,
            backgroundColor: colors.accent,
            flexShrink: 0,
          }}
        />
      ) : null}
      {children}
    </div>
  );
};
