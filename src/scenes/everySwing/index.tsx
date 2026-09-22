import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Check, Hammer, Timer } from 'lucide-react';
import {
  CODE, DOT_GRID, FILL, GREEN, GREEN_INK, GREEN_TINT, INK, INK_2, INK_3, LINE, PAPER, UI,
  FPS, itp, sp,
} from '../oneTool/theme';
import { Card, Pill } from '../oneTool/Card';

/**
 * EverySwing — "Every swing takes seconds."
 * Same light system as OneTool. One request goes out, a stopwatch counts up in
 * real time while the model "thinks", and three more swings queue underneath.
 */
export const EVERY_SWING_DURATION = 150;

// ── Beats (frames) ────────────────────────────────────────────────────────────
const T_SEND = 22;     // prompt lands, timer starts
const T_RESP = 74;     // first response word
const WORDS_PER_FRAME = 0.5;

const PROMPT = "Is this comment spam? “free crypto!! click bit.ly/x9 now”";
const RESPONSE = 'Yes. This looks like spam. The shortened link, the urgency, and the promise of free crypto are classic patterns.'.split(' ');
const T_DONE = T_RESP + Math.ceil(RESPONSE.length / WORDS_PER_FRAME); // ≈ 110

// ── Layout ────────────────────────────────────────────────────────────────────
const CHAT = { x: 100, y: 150, w: 1000, h: 560 };
const CLOCK = { x: 1140, y: 150, w: 680, h: 560 };
const ROW_Y = 750;
const ROW_H = 240;
const ROW_GAP = 30;
const ROW_W = (1720 - ROW_GAP * 2) / 3;

const SWINGS = [
  { label: 'Extract the invoice total', start: 26, secs: 1.6 },
  { label: 'Route this ticket to a team', start: 36, secs: 2.2 },
  { label: 'Is this review positive?', start: 46, secs: 2.5 },
];

const fmt = (s: number) => s.toFixed(1);

const Dots: React.FC<{ frame: number; color: string }> = ({ frame, color }) => (
  <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
    {[0, 1, 2].map((i) => {
      const t = ((frame - i * 4) % 24) / 24;
      const y = -Math.sin(Math.max(0, Math.min(1, t * 1.6)) * Math.PI) * 6;
      return <span key={i} style={{ width: 9, height: 9, borderRadius: 5, background: color, transform: `translateY(${y}px)`, display: 'inline-block' }} />;
    })}
  </span>
);

export const EverySwingScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Main swing timer: starts on send, freezes when the answer finishes.
  const elapsed = Math.max(0, (Math.min(frame, T_DONE) - T_SEND) / FPS);
  const running = frame >= T_SEND && frame < T_DONE;
  const done = frame >= T_DONE;
  const doneP = sp(frame, T_DONE);

  const promptIn = sp(frame, T_SEND - 8);
  const thinkingIn = sp(frame, T_SEND + 6);
  const wordsShown = Math.max(0, Math.floor((frame - T_RESP) * WORDS_PER_FRAME));
  const respIn = sp(frame, T_RESP);

  // Ring: one lap = 4 s
  const R = 168;
  const C = 2 * Math.PI * R;
  const lap = (elapsed % 4) / 4;

  const captionIn = sp(frame, 0);
  const endFade = 1 - itp(frame, EVERY_SWING_DURATION - 8, EVERY_SWING_DURATION);

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER, overflow: 'hidden', fontFamily: UI }}>
      <div style={DOT_GRID} />
      <div style={{ position: 'absolute', inset: 0, opacity: endFade }}>
        {/* caption */}
        <div
          style={{
            position: 'absolute', left: 0, right: 0, top: 44, textAlign: 'center',
            fontSize: 46, fontWeight: 700, letterSpacing: -1, color: INK,
            opacity: Math.min(1, captionIn * 1.5), transform: `translateY(${(1 - captionIn) * 26}px)`,
          }}
        >
          Every swing takes <span style={{ color: GREEN_INK }}>seconds</span>.
        </div>

        {/* chat — the swing */}
        <Card
          x={CHAT.x} y={CHAT.y} w={CHAT.w} h={CHAT.h} frame={frame} at={2} title="swing 01 · chat"
          right={
            <Pill color={done ? GREEN_INK : INK} bg={done ? GREEN_TINT : FILL} style={{ fontFamily: CODE, fontSize: 15 }}>
              {done && <Check size={14} strokeWidth={2.5} color={GREEN_INK} />}
              {frame >= T_SEND ? `${fmt(elapsed)}s` : 'idle'}
            </Pill>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100%' }}>
            {frame >= T_SEND - 8 && (
              <div
                style={{
                  alignSelf: 'flex-end', maxWidth: '80%', background: INK, color: PAPER,
                  borderRadius: 18, borderBottomRightRadius: 4, padding: '14px 22px', fontSize: 24, lineHeight: 1.3,
                  opacity: promptIn, transform: `translateY(${(1 - promptIn) * 16}px)`,
                }}
              >
                {PROMPT}
              </div>
            )}
            {frame >= T_SEND + 6 && !done && wordsShown === 0 && (
              <div
                style={{
                  alignSelf: 'flex-start', background: FILL, borderRadius: 18, borderBottomLeftRadius: 4,
                  padding: '18px 24px', opacity: thinkingIn, transform: `translateY(${(1 - thinkingIn) * 12}px)`,
                  display: 'flex', alignItems: 'center', gap: 14, color: INK_2, fontSize: 20,
                }}
              >
                <Dots frame={frame} color={INK_3} />
                <span>thinking</span>
              </div>
            )}
            {wordsShown > 0 && (
              <div
                style={{
                  alignSelf: 'flex-start', maxWidth: '84%', background: FILL, color: INK,
                  borderRadius: 18, borderBottomLeftRadius: 4, padding: '14px 22px', fontSize: 24, lineHeight: 1.35,
                  opacity: respIn,
                }}
              >
                {RESPONSE.slice(0, wordsShown).join(' ')}
                {!done && <span style={{ display: 'inline-block', width: 10, height: 22, background: GREEN_INK, marginLeft: 6, verticalAlign: 'middle', opacity: frame % 12 < 7 ? 1 : 0 }} />}
              </div>
            )}
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, fontFamily: CODE, fontSize: 15, letterSpacing: 1, color: INK_3 }}>
              <Hammer size={16} strokeWidth={1.5} color={running ? GREEN_INK : INK_3} />
              {!running && !done && 'ready'}
              {running && <span style={{ color: GREEN_INK }}>waiting on the model…</span>}
              {done && <span style={{ opacity: doneP }}>answer in <span style={{ color: INK }}>{fmt(elapsed)} seconds</span> · one swing</span>}
            </div>
          </div>
        </Card>

        {/* stopwatch */}
        <Card x={CLOCK.x} y={CLOCK.y} w={CLOCK.w} h={CLOCK.h} frame={frame} at={6} title="latency" right={<Pill color={INK_3} bg={FILL} style={{ fontFamily: CODE }}>per swing</Pill>}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
            <div style={{ position: 'relative', width: 2 * R + 24, height: 2 * R + 24 }}>
              <svg width={2 * R + 24} height={2 * R + 24} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                <circle cx={R + 12} cy={R + 12} r={R} fill="none" stroke={LINE} strokeWidth={10} />
                <circle
                  cx={R + 12} cy={R + 12} r={R} fill="none" stroke={GREEN} strokeWidth={10} strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={C * (1 - (done ? 1 : lap))}
                  style={{ filter: running || done ? 'drop-shadow(0 0 10px rgba(62,207,142,0.45))' : 'none' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Timer size={40} strokeWidth={1.5} color={running ? GREEN_INK : INK_3} />
                <div style={{ fontFamily: CODE, fontWeight: 700, fontSize: 112, lineHeight: 1, letterSpacing: -4, color: INK, display: 'flex', alignItems: 'baseline', transform: `scale(${1 + 0.06 * doneP * (1 - doneP) * 4})` }}>
                  {fmt(elapsed)}
                  <span style={{ fontSize: 44, color: INK_3, marginLeft: 6, letterSpacing: 0 }}>s</span>
                </div>
              </div>
            </div>
            <div style={{ fontFamily: CODE, fontSize: 15, letterSpacing: 2, color: done ? GREEN_INK : INK_3, textTransform: 'uppercase', display: 'flex', gap: 12, alignItems: 'center' }}>
              {done ? <><Check size={16} strokeWidth={2.5} color={GREEN_INK} /> answered</> : running ? <><Dots frame={frame} color={INK_3} /> model thinking</> : 'ready'}
            </div>
          </div>
        </Card>

        {/* queued swings */}
        {SWINGS.map((s, i) => {
          const x = 100 + i * (ROW_W + ROW_GAP);
          const el = Math.max(0, Math.min(s.secs, (frame - s.start) / FPS));
          const isDone = frame >= s.start + s.secs * FPS;
          const isRunning = frame >= s.start && !isDone;
          const p = el / s.secs;
          const dp = sp(frame, s.start + s.secs * FPS);
          return (
            <Card
              key={i} x={x} y={ROW_Y} w={ROW_W} h={ROW_H} frame={frame} at={10 + i * 5}
              title={`swing 0${i + 2}`}
              right={
                <Pill color={isDone ? GREEN_INK : isRunning ? INK : INK_3} bg={isDone ? GREEN_TINT : FILL} style={{ fontFamily: CODE, fontSize: 15 }}>
                  {isDone && <Check size={14} strokeWidth={2.5} color={GREEN_INK} />}
                  {frame >= s.start ? `${fmt(el)}s` : 'queued'}
                </Pill>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22, height: '100%', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 24, color: INK, fontWeight: 600 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: isRunning || isDone ? GREEN_TINT : FILL, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 44px' }}>
                    <Hammer size={22} strokeWidth={1.5} color={isRunning || isDone ? GREEN_INK : INK_3} />
                  </div>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
                </div>
                <div style={{ position: 'relative', height: 10, borderRadius: 5, background: LINE, overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, background: GREEN, borderRadius: 5 }} />
                </div>
                <div style={{ fontFamily: CODE, fontSize: 14, letterSpacing: 1.5, color: isDone ? GREEN_INK : INK_3, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10, minHeight: 18 }}>
                  {isDone ? <span style={{ opacity: dp }}>done · {fmt(s.secs)}s</span> : isRunning ? <><Dots frame={frame} color={INK_3} /> waiting</> : 'queued'}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
