import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, Pill } from '../oneTool/Card';
import {
  CODE, FILL, GREEN, GREEN_INK, GREEN_LINE, GREEN_TINT, INK, INK_2, INK_3, LINE, LINE_2, PAPER, RED, RED_TINT, SHADOW, UI,
  itp, sp,
} from '../oneTool/theme';

// ── Shared layout (1920x1080) ─────────────────────────────────────────────────
export const APP = { x: 100, y: 150, w: 700, h: 620 };
export const ANS = { x: 1020, y: 150, w: 800, h: 620 };
export const LINK_Y = APP.y + APP.h / 2; // 460
export const STRIP_Y = 806;
export const BAND_Y = 886;

export type Seg = { t: string; hi?: boolean; color?: string };

/** Top-center caption with green-highlighted segments. */
export const Caption: React.FC<{ segs: Seg[]; frame: number; at: number; until?: number }> = ({ segs, frame, at, until }) => {
  if (frame < at - 1 || (until !== undefined && frame > until + 10)) return null;
  const inP = sp(frame, at);
  const outP = until === undefined ? 0 : itp(frame, until, until + 8);
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, top: 44, textAlign: 'center', fontFamily: UI,
        fontSize: 46, fontWeight: 700, letterSpacing: -1, color: INK, whiteSpace: 'nowrap',
        opacity: Math.min(1, inP * 1.5) * (1 - outP),
        transform: `translateY(${(1 - inP) * 26 - outP * 22}px)`,
      }}
    >
      {segs.map((s, i) => <span key={i} style={{ color: s.color ?? (s.hi ? GREEN_INK : INK) }}>{s.t}</span>)}
    </div>
  );
};

/** "01 · HOW AN LLM ANSWERS" pill, top-right. */
export const SectionLabel: React.FC<{ n: string; title: string; frame: number; at: number }> = ({ n, title, frame, at }) => {
  const p = sp(frame, at);
  return (
    <div style={{ position: 'absolute', right: 100, top: 58, opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}>
      <Pill color={INK_2} bg={FILL} style={{ fontFamily: CODE, fontSize: 14, letterSpacing: 2, padding: '8px 14px' }}>
        <span style={{ color: GREEN_INK, fontWeight: 700 }}>{n}</span> · {title}
      </Pill>
    </div>
  );
};

// ── Email data used by both halves ────────────────────────────────────────────
export const EMAIL = {
  from: 'rewards@secure-payout.biz',
  subject: 'You’ve been selected!!',
  body: 'Claim your $500 gift card now. Click bit.ly/x9 before midnight or lose it forever.',
};

/** YOUR APP card: email preview + a question slot + optional result slot. */
export const AppCard: React.FC<{
  frame: number;
  at: number;
  question: React.ReactNode;
  questionLabel?: string;
  result?: React.ReactNode;
  /** 0–1 progress of a single scan sweep over the email data. */
  scan?: number;
}> = ({ frame, at, question, questionLabel = 'question', result, scan }) => {
  const scanning = scan !== undefined && scan > 0 && scan < 1;
  return (
    <Card {...APP} frame={frame} at={at} title="your app" collapse={false} pad={24}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100%', fontFamily: UI }}>
        <div style={{ fontFamily: CODE, fontSize: 13, letterSpacing: 2, color: INK_3, textTransform: 'uppercase' }}>data · email</div>
        <div
          style={{
            position: 'relative', overflow: 'hidden', border: `1px solid ${scanning ? GREEN : LINE}`, borderRadius: 14,
            padding: '18px 22px', background: PAPER, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 21, lineHeight: 1.35, color: INK,
            boxShadow: scanning ? '0 0 0 4px rgba(62,207,142,0.15)' : 'none',
          }}
        >
          <div><span style={{ color: INK_3, display: 'inline-block', width: 96 }}>From</span>{EMAIL.from}</div>
          <div><span style={{ color: INK_3, display: 'inline-block', width: 96 }}>Subject</span>{EMAIL.subject}</div>
          <div style={{ height: 1, background: LINE }} />
          <div style={{ color: INK_2 }}>{EMAIL.body}</div>
          {scan !== undefined && scan > 0 && scan < 1 && (
            <div
              style={{
                position: 'absolute', left: 0, right: 0, top: `${scan * 115 - 15}%`, height: '30%',
                background: 'linear-gradient(180deg, rgba(62,207,142,0) 0%, rgba(62,207,142,0.22) 50%, rgba(62,207,142,0) 100%)',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
        <div style={{ fontFamily: CODE, fontSize: 13, letterSpacing: 2, color: INK_3, textTransform: 'uppercase', marginTop: 6 }}>{questionLabel}</div>
        <div style={{ minHeight: 64 }}>{question}</div>
        {result && (
          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontFamily: CODE, fontSize: 13, letterSpacing: 2, color: INK_3, textTransform: 'uppercase', marginBottom: 10 }}>result</div>
            {result}
          </div>
        )}
      </div>
    </Card>
  );
};

/** Horizontal connector between the two cards with an optional traveling chip. */
export type Travel = { from: number; to: number; label: string; dir: 'right' | 'left'; bg?: string; color?: string };
export const Connector: React.FC<{ frame: number; drawAt: number; travel?: Travel }> = ({ frame, drawAt, travel }) => {
  const x1 = APP.x + APP.w;
  const x2 = ANS.x;
  const d = itp(frame, drawAt, drawAt + 16);
  let chip: React.ReactNode = null;
  if (travel && frame >= travel.from && frame <= travel.to + 8) {
    const p = itp(frame, travel.from, travel.to);
    const x = travel.dir === 'right' ? x1 + (x2 - x1) * p : x2 - (x2 - x1) * p;
    const fade = 1 - itp(frame, travel.to, travel.to + 8);
    const inP = itp(frame, travel.from, travel.from + 4);
    chip = (
      <div
        style={{
          position: 'absolute', left: x, top: LINK_Y, transform: 'translate(-50%, -50%)', opacity: fade * inP,
          background: travel.bg ?? INK, color: travel.color ?? PAPER, fontFamily: CODE, fontSize: 16, fontWeight: 700,
          letterSpacing: 1, padding: '8px 14px', borderRadius: 999, boxShadow: SHADOW, whiteSpace: 'nowrap',
        }}
      >
        {travel.label}
      </div>
    );
  }
  return (
    <>
      <div style={{ position: 'absolute', left: x1, top: LINK_Y - 1, width: (x2 - x1) * d, height: 2, background: LINE_2 }} />
      <div style={{ position: 'absolute', left: x1 - 5, top: LINK_Y - 5, width: 10, height: 10, borderRadius: 5, background: LINE_2, opacity: d }} />
      <div style={{ position: 'absolute', left: x2 - 5, top: LINK_Y - 5, width: 10, height: 10, borderRadius: 5, background: LINE_2, opacity: d >= 1 ? 1 : 0 }} />
      {chip}
    </>
  );
};

/** Timer chip sitting above the connector. */
export const TimerChip: React.FC<{ value: string; state: 'running' | 'slow' | 'fast'; frame: number; at: number }> = ({ value, state, frame, at }) => {
  const p = sp(frame, at);
  const bg = state === 'slow' ? RED : state === 'fast' ? GREEN : FILL;
  const color = state === 'slow' ? PAPER : state === 'fast' ? '#0B3B26' : INK;
  return (
    <div
      style={{
        position: 'absolute', left: (APP.x + APP.w + ANS.x) / 2, top: LINK_Y - 58, transform: `translate(-50%, ${(1 - p) * 10}px) scale(${0.9 + 0.1 * p})`,
        opacity: p, background: bg, color, fontFamily: CODE, fontSize: 20, fontWeight: 700, padding: '8px 16px', borderRadius: 999,
        boxShadow: state === 'fast' ? '0 0 18px rgba(62,207,142,0.45)' : state === 'slow' ? '0 0 18px rgba(229,72,77,0.35)' : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </div>
  );
};

/** Tokens typed one at a time, newest highlighted, block caret. */
export const TokenFlow: React.FC<{ tokens: string[]; frame: number; start: number; fpt: number; fontSize?: number }> = ({ tokens, frame, start, fpt, fontSize = 24 }) => {
  const n = frame < start ? 0 : Math.min(tokens.length, Math.floor((frame - start) / fpt) + 1);
  const done = frame >= start + (tokens.length - 1) * fpt + fpt;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', minHeight: 60 }}>
      {tokens.slice(0, n).map((t, i) => {
        const newest = i === n - 1 && !done;
        const p = sp(frame, start + i * fpt);
        return (
          <span
            key={i}
            style={{
              padding: '6px 12px', borderRadius: 8, fontFamily: CODE, fontSize,
              background: newest ? GREEN_TINT : FILL, color: newest ? GREEN_INK : INK,
              opacity: p, transform: `translateY(${(1 - p) * 8}px)`,
            }}
          >
            {t}
          </span>
        );
      })}
      {!done && frame >= start && <span style={{ display: 'inline-block', width: 12, height: fontSize + 6, background: INK, opacity: frame % 14 < 9 ? 1 : 0 }} />}
    </div>
  );
};

/** Spinning "one full pass per token" indicator. */
export const LoopWidget: React.FC<{ frame: number; start: number; fpt: number; total: number; done: boolean }> = ({ frame, start, fpt, total, done }) => {
  const active = frame >= start && !done;
  const n = frame < start ? 0 : Math.min(total, Math.floor((frame - start) / fpt) + 1);
  const within = active ? ((frame - start) % fpt) / fpt : 0;
  const rot = active ? (n - 1 + within) * 360 : done ? 0 : 0;
  return (
    <Pill color={active ? GREEN_INK : done ? RED : INK_3} bg={active ? GREEN_TINT : done ? 'rgba(229,72,77,0.12)' : FILL} style={{ fontFamily: CODE, fontSize: 15 }}>
      <RefreshCw size={15} strokeWidth={2} color={active ? GREEN_INK : done ? RED : INK_3} style={{ transform: `rotate(${rot}deg)` }} />
      {frame < start ? 'idle' : done ? `${total} full passes` : `pass ${n} · full model`}
    </Pill>
  );
};

/** One scored option row: label, bar, score. */
export const ScoreRow: React.FC<{ label: string; fill: number; score: number; selected: boolean; showScore: boolean; frame: number; at: number; big?: boolean }> = ({
  label, fill, score, selected, showScore, frame, at, big,
}) => {
  const p = sp(frame, at);
  const selP = selected ? sp(frame, at) : 0;
  void selP;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: p, transform: `translateY(${(1 - p) * 12}px)`, fontFamily: UI }}>
      <div style={{ width: 170, fontSize: 26, fontWeight: 700, letterSpacing: 1, color: selected ? GREEN_INK : INK, fontFamily: CODE }}>{label}</div>
      <div style={{ flex: 1, height: 16, borderRadius: 8, background: LINE, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, borderRadius: 8, background: selected ? GREEN : LINE_2 }} />
      </div>
      <div style={{ width: big ? 120 : 90, textAlign: 'right', fontFamily: CODE, fontSize: big && selected ? 40 : 26, fontWeight: 700, color: selected ? GREEN_INK : INK_3, opacity: showScore ? 1 : 0 }}>
        {score.toFixed(2)}
      </div>
    </div>
  );
};

/** Muted mono note. */
export const Note: React.FC<{ text: string; frame: number; at: number; until?: number; color?: string }> = ({ text, frame, at, until, color = INK_3 }) => {
  if (frame < at || (until !== undefined && frame > until + 8)) return null;
  const p = sp(frame, at);
  const o = until === undefined ? 1 : 1 - itp(frame, until, until + 8);
  return (
    <div style={{ fontFamily: CODE, fontSize: 17, letterSpacing: 1, lineHeight: 1.6, color, opacity: p * o, transform: `translateY(${(1 - p) * 8}px)`, whiteSpace: 'pre-line' }}>
      {text}
    </div>
  );
};

/** Bottom-band big number callout (left) — e.g. "6.7 s" in red or "150 ms" in green. */
export const BigStat: React.FC<{ value: string; unit: string; color: string; sub?: React.ReactNode; frame: number; at: number }> = ({ value, unit, color, sub, frame, at }) => {
  const p = sp(frame, at);
  if (frame < at) return null;
  return (
    <div style={{ position: 'absolute', left: 100, top: BAND_Y, opacity: p, transform: `translateY(${(1 - p) * 24}px)`, display: 'flex', alignItems: 'baseline', gap: 22 }}>
      <div style={{ fontFamily: CODE, fontWeight: 700, fontSize: 132, lineHeight: 1, letterSpacing: -6, color }}>
        {value}<span style={{ fontSize: 48, color: INK_3, marginLeft: 10, letterSpacing: 0 }}>{unit}</span>
      </div>
      {sub}
    </div>
  );
};

/** Bottom-band takeaway text (right). */
export const Takeaway: React.FC<{ segs: Seg[]; frame: number; at: number }> = ({ segs, frame, at }) => {
  const p = sp(frame, at);
  if (frame < at) return null;
  return (
    <div
      style={{
        position: 'absolute', left: ANS.x, width: ANS.w, top: BAND_Y + 14, fontFamily: UI, fontSize: 44, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1.15, color: INK,
        opacity: p, transform: `translateY(${(1 - p) * 24}px)`,
      }}
    >
      {segs.map((s, i) => <span key={i} style={{ color: s.color ?? (s.hi ? GREEN_INK : INK) }}>{s.t}</span>)}
    </div>
  );
};

/**
 * Bottom strip of pass boxes. LLM mode: one box lights per token (`lit`), all go
 * red-tinted when `done`. Jev mode: pass `merge` 0→1 to collapse the ghost boxes
 * into a single full-width green bar (one pass).
 */
export const PassStrip: React.FC<{
  frame: number; at: number; total: number;
  lit?: number; done?: boolean; merge?: number;
}> = ({ frame, at, total, lit = 0, done = false, merge }) => {
  const p = sp(frame, at);
  if (frame < at) return null;
  const jev = merge !== undefined;
  const m = merge ?? 0;
  return (
    <div style={{ position: 'absolute', left: 100, top: STRIP_Y, width: 1720, height: 44, display: 'flex', alignItems: 'center', gap: 18, opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}>
      <div style={{ width: 120, fontFamily: CODE, fontSize: 13, letterSpacing: 2, color: INK_3, textTransform: 'uppercase' }}>passes</div>
      <div style={{ flex: 1, position: 'relative', height: 44, display: 'flex', gap: 6 }}>
        {Array.from({ length: total }).map((_, i) => {
          const on = i < lit;
          const newest = i === lit - 1 && !done;
          const bp = sp(frame, at + i * 1.5);
          return (
            <div
              key={i}
              style={{
                flex: 1, height: 44, borderRadius: 8,
                border: `1px solid ${on ? (done ? 'rgba(229,72,77,0.4)' : GREEN_LINE) : LINE}`,
                background: newest ? GREEN : on ? (done ? RED_TINT : GREEN_TINT) : PAPER,
                opacity: (jev ? (1 - m) * 0.7 : 1) * bp,
                transform: `scale(${newest ? 1.06 : 1})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: CODE, fontSize: 13, color: newest ? '#0B3B26' : on ? (done ? RED : GREEN_INK) : LINE_2,
              }}
            >
              {i + 1}
            </div>
          );
        })}
        {jev && m > 0 && (
          <div
            style={{
              position: 'absolute', left: 0, top: 0, height: 44, width: `${m * 100}%`, borderRadius: 8, background: GREEN,
              display: 'flex', alignItems: 'center', paddingLeft: 18, fontFamily: CODE, fontSize: 15, fontWeight: 700, letterSpacing: 1, color: '#0B3B26', whiteSpace: 'nowrap', overflow: 'hidden',
              boxShadow: m >= 1 ? '0 0 18px rgba(62,207,142,0.45)' : 'none',
            }}
          >
            {m > 0.35 ? '1 · one pass, every option scored at once' : ''}
          </div>
        )}
      </div>
      <div style={{ width: 120, textAlign: 'right', fontFamily: CODE, fontSize: 16, fontWeight: 700, color: jev ? (m >= 1 ? GREEN_INK : INK_3) : done ? RED : lit > 0 ? GREEN_INK : INK_3 }}>
        {jev ? (m >= 1 ? '1 pass' : m > 0 ? '…' : '0 passes') : `${lit} / ${total}`}
      </div>
    </div>
  );
};
