import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Check, Cpu, FolderKanban, Hammer, Tag, Users, X, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, Pill } from '../oneTool/Card';
import {
  CODE, DOT_GRID, FILL, GREEN, GREEN_INK, GREEN_TINT, INK, INK_2, INK_3, LINE, LINE_2, PAPER, RED, RED_TINT, UI,
  itp, sp, easeInOut,
} from '../oneTool/theme';
import { Caption } from '../jevSinglePass/parts';

/**
 * HammerPrices — "So developers did the obvious thing… We've been paying hammer
 * prices for screwdriver jobs for three years."
 * A: the classifier project gets abandoned, a chat model answers a yes/no
 *    question with a paragraph, and "easy" wins.
 * B: a receipt of yes/no jobs billed at hammer price over 2023–2026.
 */
export const HAMMER_PRICES_DURATION = 510;

// ── Beats ─────────────────────────────────────────────────────────────────────
const T_STOP = 24;        // rows get struck through
const T_CHAT = 90;        // chat card enters, prompt types
const T_THINK = 128;
const T_STREAM = 150;     // response streams
const T_TOOL = 150;       // caption: not the right tool
const T_EASY = 270;
const T_BILL = 330;       // phase B
const T_YEARS = 420;

// ── Layout ────────────────────────────────────────────────────────────────────
const L = { x: 100, y: 150, w: 800, h: 620 };
const R = { x: 980, y: 150, w: 840, h: 620 };
const RECEIPT = { x: 100, y: 150, w: 1720, h: 590 };
const BAND_Y = 800;

const PROMPT = 'Is this ticket urgent? Just answer yes or no.';
const RESPONSE = 'Yes. Based on the customer’s wording and the mention of a payment failure affecting multiple users, this ticket appears to be urgent. I’d recommend escalating it to the on-call team and acknowledging the customer within the hour. Let me know if you’d like a suggested reply.'.split(' ');
const WPF = 0.55; // words per frame
const T_STREAM_END = T_STREAM + Math.ceil(RESPONSE.length / WPF);

const STACK: { icon: LucideIcon; label: string; text: string; value: string }[] = [
  { icon: Tag, label: 'dataset', text: '9,640 labeled', value: '6 weeks' },
  { icon: Cpu, label: 'model', text: 'v1 · train · host · monitor', value: 'retrains' },
  { icon: FolderKanban, label: 'project', text: '12-week roadmap', value: 'on-call' },
  { icon: Users, label: 'ml team', text: '4 engineers', value: 'hired' },
];

const JOBS = [
  { q: 'is this email spam?', tokens: 212, s: 3.4 },
  { q: 'is this ticket urgent?', tokens: 48, s: 3.1 },
  { q: 'is this signup a bot?', tokens: 131, s: 2.8 },
  { q: 'is this review positive?', tokens: 96, s: 2.6 },
  { q: 'is this transaction fraud?', tokens: 187, s: 3.9 },
  { q: 'is this comment toxic?', tokens: 154, s: 3.2 },
  { q: 'does this lead qualify?', tokens: 221, s: 4.1 },
];

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// ── Phase A: abandoned project ───────────────────────────────────────────────
const ProjectCard: React.FC<{ frame: number }> = ({ frame }) => {
  const stopped = frame >= T_STOP;
  const easy = frame >= T_EASY;
  const ep = sp(frame, T_EASY);
  return (
    <Card {...L} frame={frame} at={-30} title="the classifier project" collapse={false} pad={22}
      right={stopped
        ? <Pill color={RED} bg={RED_TINT} style={{ fontFamily: CODE, fontSize: 13, opacity: sp(frame, T_STOP) }}><X size={13} strokeWidth={2.5} color={RED} />abandoned</Pill>
        : <Pill color={INK_3} bg={FILL} style={{ fontFamily: CODE, fontSize: 13 }}>in progress</Pill>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%', fontFamily: UI }}>
        {STACK.map((r, i) => {
          const at = T_STOP + 6 + i * 9;
          const s = frame >= at ? sp(frame, at) : 0;
          const Icon = r.icon;
          return (
            <div key={r.label} style={{
              position: 'relative', height: 92, borderRadius: 14, border: `1px solid ${LINE}`, background: PAPER,
              padding: '0 18px', display: 'flex', alignItems: 'center', gap: 14, opacity: 1 - 0.55 * s,
            }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: s > 0.5 ? FILL : GREEN_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 46px' }}>
                <Icon size={22} strokeWidth={1.8} color={s > 0.5 ? INK_3 : GREEN_INK} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: CODE, fontSize: 12, letterSpacing: 2, color: INK_3, textTransform: 'uppercase' }}>{r.label}</div>
                <div style={{ fontSize: 21, fontWeight: 600, color: INK, whiteSpace: 'nowrap' }}>{r.text}</div>
              </div>
              <div style={{ fontFamily: CODE, fontSize: 13, color: INK_2 }}>{r.value}</div>
              {/* strike line */}
              <div style={{ position: 'absolute', left: 14, top: '50%', height: 3, borderRadius: 2, background: RED, width: `calc(${s * 100}% - 28px)`, opacity: s > 0 ? 0.85 : 0 }} />
            </div>
          );
        })}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, opacity: easy ? ep : 0, transform: `translateY(${(1 - ep) * 10}px)` }}>
          <Pill color={INK_2} bg={FILL} style={{ fontFamily: CODE, fontSize: 15, padding: '9px 14px' }}>14 weeks</Pill>
          <Pill color={INK_2} bg={FILL} style={{ fontFamily: CODE, fontSize: 15, padding: '9px 14px' }}>4 engineers</Pill>
          <Pill color={INK_2} bg={FILL} style={{ fontFamily: CODE, fontSize: 15, padding: '9px 14px' }}>3 systems</Pill>
          <span style={{ marginLeft: 'auto', fontFamily: CODE, fontSize: 13, letterSpacing: 2, color: RED, textTransform: 'uppercase' }}>the hard one</span>
        </div>
      </div>
    </Card>
  );
};

// ── Phase A: chat ─────────────────────────────────────────────────────────────
const ChatCard: React.FC<{ frame: number }> = ({ frame }) => {
  const promptChars = frame < T_CHAT + 10 ? 0 : Math.floor((frame - T_CHAT - 10) * 2.2);
  const promptDone = promptChars >= PROMPT.length;
  const thinking = frame >= T_THINK && frame < T_STREAM;
  const words = frame < T_STREAM ? 0 : Math.min(RESPONSE.length, Math.floor((frame - T_STREAM) * WPF));
  const done = words >= RESPONSE.length;
  const secs = frame < T_THINK ? 0 : (Math.min(frame, T_STREAM_END) - T_THINK) / 30;
  const tool = frame >= T_TOOL + 30;
  const tp = sp(frame, T_TOOL + 30);
  const easy = frame >= T_EASY;
  const ep = sp(frame, T_EASY);

  return (
    <Card {...R} frame={frame} at={T_CHAT} title="chat · generative model" collapse={false} pad={22}
      right={frame >= T_THINK ? <Pill color={done ? INK : INK_2} bg={FILL} style={{ fontFamily: CODE, fontSize: 13 }}>{secs.toFixed(1)} s · {words} tokens</Pill> : null}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%', fontFamily: UI }}>
        {frame >= T_CHAT + 8 && (
          <div style={{ alignSelf: 'flex-end', maxWidth: '82%', background: INK, color: PAPER, borderRadius: 18, borderBottomRightRadius: 4, padding: '12px 18px', fontSize: 22, lineHeight: 1.3, opacity: sp(frame, T_CHAT + 8) }}>
            {PROMPT.slice(0, promptChars)}
            {!promptDone && <span style={{ display: 'inline-block', width: 9, height: 22, background: GREEN, marginLeft: 3, verticalAlign: 'middle', opacity: frame % 12 < 7 ? 1 : 0 }} />}
          </div>
        )}
        {thinking && (
          <div style={{ alignSelf: 'flex-start', background: FILL, borderRadius: 18, borderBottomLeftRadius: 4, padding: '14px 20px', display: 'flex', gap: 6, opacity: sp(frame, T_THINK) }}>
            {[0, 1, 2].map((i) => <span key={i} style={{ width: 8, height: 8, borderRadius: 4, background: INK_3, display: 'inline-block', transform: `translateY(${-Math.max(0, Math.sin(((frame - i * 4) % 24) / 24 * Math.PI)) * 5}px)` }} />)}
          </div>
        )}
        {words > 0 && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '92%', background: FILL, color: INK, borderRadius: 18, borderBottomLeftRadius: 4, padding: '12px 18px', fontSize: 20, lineHeight: 1.4, position: 'relative' }}>
            <span style={{ color: GREEN_INK, fontWeight: 700, background: tool ? GREEN_TINT : 'transparent', borderRadius: 6, padding: tool ? '0 4px' : 0 }}>{RESPONSE[0]}</span>
            <span style={{ color: tool ? INK_3 : INK, textDecoration: tool && done ? 'line-through' : 'none', textDecorationColor: 'rgba(0,0,0,0.25)' }}> {RESPONSE.slice(1, words).join(' ')}</span>
            {!done && <span style={{ display: 'inline-block', width: 9, height: 20, background: INK, marginLeft: 4, verticalAlign: 'middle', opacity: frame % 12 < 7 ? 1 : 0 }} />}
          </div>
        )}
        {tool && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', opacity: tp, transform: `translateY(${(1 - tp) * 8}px)` }}>
            <Pill color={GREEN_INK} bg={GREEN_TINT} style={{ fontFamily: CODE, fontSize: 14 }}><Check size={13} strokeWidth={2.5} color={GREEN_INK} />1 word you needed</Pill>
            <Pill color={INK_2} bg={FILL} style={{ fontFamily: CODE, fontSize: 14 }}>{Math.max(0, words - 1)} words you didn’t</Pill>
          </div>
        )}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, opacity: easy ? ep : 0, transform: `translateY(${(1 - ep) * 10}px)` }}>
          <Pill color="#0B3B26" bg={GREEN} style={{ fontFamily: CODE, fontSize: 15, padding: '9px 14px' }}><Zap size={14} strokeWidth={2.5} color="#0B3B26" />1 API call</Pill>
          <Pill color={GREEN_INK} bg={GREEN_TINT} style={{ fontFamily: CODE, fontSize: 15, padding: '9px 14px' }}>5 minutes</Pill>
          <Pill color={GREEN_INK} bg={GREEN_TINT} style={{ fontFamily: CODE, fontSize: 15, padding: '9px 14px' }}>0 engineers</Pill>
          <span style={{ marginLeft: 'auto', fontFamily: CODE, fontSize: 13, letterSpacing: 2, color: GREEN_INK, textTransform: 'uppercase' }}>the easy one</span>
        </div>
      </div>
    </Card>
  );
};

// ── Phase B: the receipt ──────────────────────────────────────────────────────
const Receipt: React.FC<{ frame: number }> = ({ frame }) => {
  const at = T_BILL - 6;
  const rowsShown = JOBS.filter((_, i) => frame >= at + 12 + i * 7);
  const tokens = rowsShown.reduce((a, j) => a + j.tokens, 0);
  return (
    <Card {...RECEIPT} frame={frame} at={at} title="the bill · 2023 → 2026" collapse={false} pad={22}
      right={<Pill color={RED} bg={RED_TINT} style={{ fontFamily: CODE, fontSize: 13 }}><Hammer size={13} strokeWidth={2.2} color={RED} />hammer prices</Pill>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: UI }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 1fr 220px', gap: 16, fontFamily: CODE, fontSize: 12, letterSpacing: 2, color: INK_3, textTransform: 'uppercase', padding: '0 14px 10px', borderBottom: `1px solid ${LINE}` }}>
          <span>the job</span><span>answer needed</span><span>what we asked for</span><span style={{ textAlign: 'right' }}>billed at</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {JOBS.map((j, i) => {
            const rat = at + 12 + i * 7;
            if (frame < rat) return null;
            const p = sp(frame, rat);
            return (
              <div key={j.q} style={{
                display: 'grid', gridTemplateColumns: '1fr 180px 1fr 220px', gap: 16, alignItems: 'center', padding: '0 14px', height: 54,
                borderBottom: `1px solid ${LINE}`, opacity: p, transform: `translateX(${(1 - p) * -16}px)`,
              }}>
                <span style={{ fontSize: 21, fontWeight: 600, color: INK }}>{j.q}</span>
                <span style={{ fontFamily: CODE, fontSize: 14, color: GREEN_INK, background: GREEN_TINT, padding: '5px 10px', borderRadius: 6, justifySelf: 'start' }}>yes / no · 1 bit</span>
                <span style={{ fontFamily: CODE, fontSize: 14, color: INK_2 }}>generative answer · {j.tokens} tokens · {j.s.toFixed(1)} s</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, fontFamily: CODE, fontSize: 14, fontWeight: 700, color: RED }}>
                  <Hammer size={14} strokeWidth={2.2} color={RED} />hammer price
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 28, padding: '12px 14px 0', fontFamily: CODE, fontSize: 15, color: INK_2 }}>
          <span><span style={{ color: INK, fontWeight: 700 }}>{rowsShown.length}</span> screwdriver jobs</span>
          <span>·</span>
          <span>answers needed <span style={{ color: GREEN_INK, fontWeight: 700 }}>{rowsShown.length} bits</span></span>
          <span>·</span>
          <span>tokens paid for <span style={{ color: RED, fontWeight: 700 }}>{fmt(tokens)}</span></span>
          <span style={{ marginLeft: 'auto', color: INK_3, letterSpacing: 2, textTransform: 'uppercase', fontSize: 13 }}>× every request · × every day · × 3 years</span>
        </div>
      </div>
    </Card>
  );
};

const YearsBand: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < T_BILL + 2) return null;
  const inP = sp(frame, T_BILL + 2);
  const fill = easeInOut(itp(frame, T_YEARS, T_YEARS + 60));
  const years = ['2023', '2024', '2025', '2026'];
  const bigP = sp(frame, T_YEARS);
  return (
    <div style={{ position: 'absolute', left: 100, top: BAND_Y, width: 1720, opacity: inP, transform: `translateY(${(1 - inP) * 16}px)` }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, opacity: frame >= T_YEARS ? bigP : 0.35 }}>
          <span style={{ fontFamily: CODE, fontWeight: 700, fontSize: 124, lineHeight: 1, letterSpacing: -5, color: RED }}>3</span>
          <span style={{ fontFamily: UI, fontSize: 56, fontWeight: 700, letterSpacing: -1.5, color: INK }}>years.</span>
        </div>
        <div style={{ fontFamily: UI, fontSize: 48, fontWeight: 700, letterSpacing: -1.5, color: INK, textAlign: 'right', lineHeight: 1.1, paddingBottom: 10 }}>
          <span style={{ color: RED }}>Hammer prices.</span> <span style={{ color: GREEN_INK }}>Screwdriver jobs.</span>
        </div>
      </div>
      <div style={{ position: 'relative', marginTop: 26, height: 8, borderRadius: 4, background: LINE }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, borderRadius: 4, background: RED, boxShadow: fill > 0 ? '0 0 14px rgba(229,72,77,0.35)' : 'none' }} />
        {years.map((y, i) => {
          const a = i / (years.length - 1);
          const lit = fill >= a - 0.001;
          return (
            <div key={y} style={{ position: 'absolute', left: `${a * 100}%`, top: -6, transform: 'translateX(-50%)', textAlign: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, margin: '0 auto', background: lit ? RED : PAPER, border: `3px solid ${lit ? RED : LINE_2}` }} />
              <div style={{ marginTop: 10, fontFamily: CODE, fontSize: 16, fontWeight: 700, letterSpacing: 1, color: lit ? INK : INK_3 }}>{y}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const HammerPricesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const aOut = 1 - itp(frame, T_BILL - 8, T_BILL + 4);
  const aScale = 1 - 0.04 * (1 - aOut);
  const endFade = 1 - itp(frame, HAMMER_PRICES_DURATION - 10, HAMMER_PRICES_DURATION);
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER, overflow: 'hidden', fontFamily: UI }}>
      <div style={DOT_GRID} />
      <div style={{ position: 'absolute', inset: 0, opacity: endFade }}>
        <Caption segs={[{ t: 'So developers did the ' }, { t: 'obvious thing', hi: true }, { t: '.' }]} frame={frame} at={0} until={T_STOP - 2} />
        <Caption segs={[{ t: 'They ' }, { t: 'stopped building', color: RED }, { t: ' classifiers…' }]} frame={frame} at={T_STOP} until={T_CHAT - 2} />
        <Caption segs={[{ t: '…and started ' }, { t: 'asking ChatGPT', hi: true }, { t: '.' }]} frame={frame} at={T_CHAT} until={T_TOOL + 28} />
        <Caption segs={[{ t: 'Not because it’s the ' }, { t: 'right tool', hi: true }, { t: ' for a yes-or-no question.' }]} frame={frame} at={T_TOOL + 30} until={T_EASY - 2} />
        <Caption segs={[{ t: 'Because it was the ' }, { t: 'easy', hi: true }, { t: ' one.' }]} frame={frame} at={T_EASY} until={T_BILL - 2} />
        <Caption segs={[{ t: 'We’ve been paying ' }, { t: 'hammer prices', color: RED }, { t: ' for screwdriver jobs.' }]} frame={frame} at={T_BILL} until={T_YEARS - 2} />
        <Caption segs={[{ t: 'For ' }, { t: 'three years', color: RED }, { t: '.' }]} frame={frame} at={T_YEARS} />

        {aOut > 0 && (
          <div style={{ position: 'absolute', inset: 0, opacity: aOut, transform: `scale(${aScale})`, transformOrigin: '50% 40%' }}>
            <ProjectCard frame={frame} />
            {frame >= T_CHAT && <ChatCard frame={frame} />}
            {frame >= T_EASY && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: BAND_Y + 20, textAlign: 'center', fontFamily: UI, fontSize: 44, fontWeight: 700, letterSpacing: -1, color: INK_2, opacity: sp(frame, T_EASY + 6) }}>
                Hard <span style={{ color: RED }}>×</span> &nbsp;vs&nbsp; <span style={{ color: GREEN_INK }}>easy ✓</span>
                <span style={{ display: 'block', fontFamily: CODE, fontSize: 15, letterSpacing: 2, color: INK_3, textTransform: 'uppercase', marginTop: 10 }}>a yes-or-no question asked of a model built to write paragraphs</span>
              </div>
            )}
          </div>
        )}

        {frame >= T_BILL - 6 && (
          <>
            <Receipt frame={frame} />
            <YearsBand frame={frame} />
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};
