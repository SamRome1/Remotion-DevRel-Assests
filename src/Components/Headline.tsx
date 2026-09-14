import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, enter, type } from '../theme';

type Props = {
  children: React.ReactNode;
  /** Frame (within the scene) at which the entrance begins. */
  delay?: number;
  variant?: 'headline' | 'subhead' | 'body';
  color?: string;
  align?: 'left' | 'center';
  maxWidth?: number;
  style?: React.CSSProperties;
};

/** Inline accent-colored span for emphasising a word inside a Headline. */
export const Accent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: colors.accent }}>{children}</span>
);

/** Muted inline span (zinc-400). */
export const Muted: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ color: colors.textSecondary }}>{children}</span>
);

export const Headline: React.FC<Props> = ({
  children,
  delay = 0,
  variant = 'headline',
  color = colors.text,
  align = 'left',
  maxWidth,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = enter(frame, fps, delay);

  return (
    <div
      style={{
        ...type[variant],
        color,
        textAlign: align,
        maxWidth,
        opacity: e.opacity,
        transform: `translateY(${e.translateY}px) scale(${e.scale})`,
        transformOrigin: align === 'center' ? '50% 50%' : '0% 50%',
        textWrap: 'balance',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
