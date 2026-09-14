import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, enter, radius, timing, type } from '../theme';

export type CodeToken = { text: string; color?: string };
export type CodeLine = string | CodeToken[];

type Props = {
  lines: CodeLine[];
  delay?: number;
  /** Frames between each line's entrance. */
  stagger?: number;
  /** 0-based line indices to highlight with the accent color. */
  highlight?: number[];
  /** Frame at which highlight becomes active (defaults to after all lines are in). */
  highlightAt?: number;
  fontSize?: number;
  width?: number | string;
  showLineNumbers?: boolean;
  /** Optional filename shown in a header bar. */
  filename?: string;
  style?: React.CSSProperties;
};

const withAlpha = (hex: string, a: number) =>
  `${hex}${Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16)
    .padStart(2, '0')}`;

const renderLine = (line: CodeLine) => {
  if (typeof line === 'string') return line.length ? line : ' ';
  return line.map((t, i) => (
    <span key={i} style={{ color: t.color ?? colors.text }}>
      {t.text}
    </span>
  ));
};

/**
 * Bordered JetBrains Mono code panel. Lines rise in one by one; highlighted
 * lines get an accent text color and a 1px accent rule on the left.
 */
export const CodeBlock: React.FC<Props> = ({
  lines,
  delay = 0,
  stagger = timing.stagger,
  highlight = [],
  highlightAt,
  fontSize = type.code.fontSize,
  width = '100%',
  showLineNumbers = false,
  filename,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const frameE = enter(frame, fps, delay);
  const hlStart = highlightAt ?? delay + lines.length * stagger + 12;
  const hl = enter(frame, fps, hlStart).progress;

  return (
    <div
      style={{
        width,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        overflow: 'hidden',
        opacity: frameE.opacity,
        transform: `translateY(${frameE.translateY}px) scale(${frameE.scale})`,
        ...style,
      }}
    >
      {filename ? (
        <div
          style={{
            ...type.monoLabel,
            letterSpacing: 0,
            fontSize: Math.round(fontSize * 0.75),
            color: colors.textSecondary,
            padding: '14px 24px',
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          {filename}
        </div>
      ) : null}
      <div style={{ padding: '24px 0' }}>
        {lines.map((line, i) => {
          const e = enter(frame, fps, delay + 6 + i * stagger);
          const isHl = highlight.includes(i);
          const hlAmt = isHl ? hl : 0;
          return (
            <div
              key={i}
              style={{
                ...type.code,
                fontSize,
                display: 'flex',
                padding: '0 24px 0 20px',
                borderLeft: `2px solid ${isHl ? withAlpha(colors.accent, hlAmt) : 'transparent'}`,
                color: isHl ? colors.text : colors.textSecondary,
                opacity: e.opacity * (highlight.length && !isHl ? 1 - hl * 0.5 : 1),
                transform: `translateY(${e.translateY}px)`,
                whiteSpace: 'pre',
              }}
            >
              {showLineNumbers ? (
                <span
                  style={{
                    width: 40,
                    flexShrink: 0,
                    color: colors.textTertiary,
                    userSelect: 'none',
                  }}
                >
                  {i + 1}
                </span>
              ) : null}
              <span>{renderLine(line)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
