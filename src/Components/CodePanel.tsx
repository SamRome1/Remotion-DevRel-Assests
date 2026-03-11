import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import {
  GREEN,
  MONO,
  FG_MUTED,
  FG_SUBTLE,
  boxBase,
  itp,
  spSlow,
  SURFACE_75,
  BORDER,
  SYN_KEYWORD,
  SYN_FN,
  SYN_TABLE,
  SYN_STRING,
  SYN_COMMENT,
  SYN_DEFAULT,
  TrafficLights,
} from '../tokens';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CodeToken =
  | { type: 'keyword'; text: string }
  | { type: 'fn';      text: string }
  | { type: 'table';   text: string }
  | { type: 'string';  text: string }
  | { type: 'comment'; text: string }
  | { type: 'plain';   text: string };

export interface CodeLineData {
  tokens: CodeToken[];
  /** Global frame at which this line starts typing in */
  startFrame: number;
  /** Whether this line is currently active/lit (0–1 or boolean) */
  active?: number | boolean;
  /** If true, show the left accent bar in green when active */
  showAccent?: boolean;
}

export interface CodeAnnotation {
  /** Global frame at which annotation appears */
  startFrame: number;
  label: string;       // e.g. "resolves to"
  value: string;       // e.g. '"user-a"'
  valueColor?: string; // defaults to SYN_TABLE
}

export interface CodePanelProps {
  filename?: string;
  lines: CodeLineData[];
  annotation?: CodeAnnotation;
  /** Global frame at which the panel enters. Default 0 */
  enterFrame?: number;
  /** Direction panel enters from. Default 'left' */
  enterFrom?: 'left' | 'right';
  /** Global frame at which panel exits. Omit for no exit */
  exitFrame?: number;
  exitTo?: 'left' | 'right';
  width?: number;
  style?: React.CSSProperties;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_COLORS: Record<CodeToken['type'], string> = {
  keyword: SYN_KEYWORD,
  fn:      SYN_FN,
  table:   SYN_TABLE,
  string:  SYN_STRING,
  comment: SYN_COMMENT,
  plain:   SYN_DEFAULT,
};

/** Render a pre-tokenized line, optionally applying a typewriter effect */
const renderTokens = (
  tokens: CodeToken[],
  charsToShow: number,
): React.ReactNode => {
  let remaining = charsToShow;
  return tokens.map((tok, i) => {
    if (remaining <= 0) return null;
    const visible = tok.text.slice(0, remaining);
    remaining -= tok.text.length;
    return (
      <span key={i} style={{ color: TOKEN_COLORS[tok.type] }}>
        {visible}
      </span>
    );
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const CodeLineRow: React.FC<{
  line: CodeLineData;
  frame: number;
}> = ({ line, frame }) => {
  const { tokens, startFrame, active = 0, showAccent = true } = line;

  const totalChars = tokens.reduce((n, t) => n + t.text.length, 0);
  const typeProg   = itp(frame, startFrame, startFrame + 28);
  const charsToShow = Math.floor(typeProg * totalChars);
  const fullTyped   = charsToShow >= totalChars;

  const activeProg  = typeof active === 'boolean' ? (active ? 1 : 0) : active;
  const lineOpacity = itp(frame, startFrame, startFrame + 10);

  return (
    <div
      style={{
        display:    'flex',
        alignItems: 'flex-start',
        gap:        12,
        opacity:    lineOpacity,
      }}
    >
      {/* Left accent bar */}
      {showAccent && (
        <div
          style={{
            width:      2,
            height:     20,
            borderRadius: 2,
            flexShrink: 0,
            marginTop:  2,
            background: activeProg > 0.05 ? GREEN : 'rgba(255,255,255,0.1)',
            boxShadow:  activeProg > 0.1
              ? `0 0 8px rgba(62,207,142,${activeProg * 0.6})`
              : 'none',
            transition: 'background 0.3s',
          }}
        />
      )}

      {/* Code text */}
      <div
        style={{
          fontFamily: MONO,
          fontSize:   15,
          lineHeight: 1.6,
        }}
      >
        {renderTokens(tokens, charsToShow)}

        {/* Blinking cursor while typing */}
        {!fullTyped && (
          <span
            style={{
              display:       'inline-block',
              width:         2,
              height:        14,
              background:    GREEN,
              marginLeft:    2,
              verticalAlign: 'middle',
              opacity:       Math.sin(frame * 0.3) > 0 ? 1 : 0,
            }}
          />
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CodePanel
// ─────────────────────────────────────────────────────────────────────────────

export const CodePanel: React.FC<CodePanelProps> = ({
  filename,
  lines,
  annotation,
  enterFrame = 0,
  enterFrom  = 'left',
  exitFrame,
  exitTo     = 'left',
  width      = 620,
  style,
}) => {
  const frame = useCurrentFrame();

  // ── Entrance ──
  const enterSpring = spSlow(frame, enterFrame);
  const enterX      = interpolate(
    enterSpring, [0, 1],
    [enterFrom === 'left' ? -80 : 80, 0],
  );
  const enterOp = Math.min(enterSpring * 1.5, 1);

  // ── Exit ──
  let exitX  = 0;
  let exitOp = 1;
  if (exitFrame !== undefined) {
    const exitProg = itp(frame, exitFrame, exitFrame + 28);
    exitX  = interpolate(exitProg, [0, 1], [0, exitTo === 'left' ? -120 : 120]);
    exitOp = 1 - exitProg;
  }

  // ── Annotation ──
  const showAnnotation =
    annotation !== undefined && frame >= annotation.startFrame;
  const annotationOp = annotation
    ? itp(frame, annotation.startFrame, annotation.startFrame + 14)
    : 0;
  const annotationSlide = interpolate(annotationOp, [0, 1], [8, 0]);

  // ── Which lines are visible ──
  const visibleLines = lines.filter(l => frame >= l.startFrame);

  return (
    <div
      style={{
        ...boxBase,
        borderRadius: 16,
        padding:      '28px 32px',
        width,
        opacity:      enterOp * exitOp,
        transform:    `translateX(${enterX + exitX}px)`,
        ...style,
      }}
    >
      <TrafficLights filename={filename} />

      {/* Code lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {visibleLines.map((line, i) => (
          <CodeLineRow key={i} line={line} frame={frame} />
        ))}
      </div>

      {/* Annotation — appears under code after a key line types in */}
      {showAnnotation && annotation && (
        <div
          style={{
            marginTop:  20,
            display:    'flex',
            alignItems: 'center',
            gap:        10,
            opacity:    annotationOp,
            transform:  `translateY(${annotationSlide}px)`,
          }}
        >
          {/* Green left rule */}
          <div
            style={{
              width:        2,
              height:       38,
              background:   GREEN,
              borderRadius: 2,
              opacity:      0.5,
              flexShrink:   0,
            }}
          />
          <div>
            <div
              style={{
                fontFamily:   MONO,
                fontSize:     11,
                color:        FG_MUTED,
                marginBottom: 3,
                letterSpacing: '0.04em',
              }}
            >
              {annotation.label}
            </div>
            <div
              style={{
                fontFamily: MONO,
                fontSize:   16,
                fontWeight: 700,
                color:      annotation.valueColor ?? SYN_TABLE,
              }}
            >
              {annotation.value}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility — build a CodeLineData array from plain strings
// Useful for quick compositions where you don't need per-token highlighting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Auto-tokenizes a SQL string into CodeToken[] using simple keyword matching.
 * For complex highlighting, build the tokens array manually.
 */
export const tokenizeSQL = (sql: string): CodeToken[] => {
  const keywords = ['CREATE', 'POLICY', 'ON', 'FOR', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'USING', 'WITH', 'CHECK', 'TABLE', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'NULL'];
  const fns      = ['auth.uid()', 'auth.role()', 'pg_notify()', 'now()'];
  const result: CodeToken[] = [];

  let remaining = sql;
  while (remaining.length > 0) {
    let matched = false;

    // Functions first (longer match wins)
    for (const fn of fns) {
      if (remaining.startsWith(fn)) {
        result.push({ type: 'fn', text: fn });
        remaining = remaining.slice(fn.length);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Keywords (word boundary)
    for (const kw of keywords) {
      const re = new RegExp(`^${kw}\\b`);
      if (re.test(remaining)) {
        result.push({ type: 'keyword', text: kw });
        remaining = remaining.slice(kw.length);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // String literals
    if (remaining[0] === "'") {
      const end = remaining.indexOf("'", 1);
      const str = end === -1 ? remaining : remaining.slice(0, end + 1);
      result.push({ type: 'string', text: str });
      remaining = remaining.slice(str.length);
      continue;
    }

    // Comments
    if (remaining.startsWith('--')) {
      const end = remaining.indexOf('\n');
      const comment = end === -1 ? remaining : remaining.slice(0, end);
      result.push({ type: 'comment', text: comment });
      remaining = remaining.slice(comment.length);
      continue;
    }

    // Plain text — consume until next special char
    const nextSpecial = Math.min(
      ...[' ', "'", '-', ...keywords.map(k => remaining.indexOf(k)).filter(i => i > 0)]
        .map(c => typeof c === 'string' ? remaining.indexOf(c) : c)
        .filter(i => i > 0),
      remaining.length,
    );
    const chunk = remaining.slice(0, nextSpecial || 1);
    if (result.length && result[result.length - 1].type === 'plain') {
      result[result.length - 1].text += chunk;
    } else {
      result.push({ type: 'plain', text: chunk });
    }
    remaining = remaining.slice(chunk.length);
  }

  return result;
};