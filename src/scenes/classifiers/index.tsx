import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ArrowRight, Check, CreditCard, Database, ListChecks, Mail, MousePointerClick, ShieldAlert, Ticket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, Pill } from '../oneTool/Card';
import {
  CODE, DOT_GRID, FILL, GREEN, GREEN_INK, GREEN_LINE, GREEN_TINT, INK, INK_2, INK_3, LINE, PAPER, SHADOW, UI,
  itp, rnd, sp,
} from '../oneTool/theme';
import { Caption } from '../jevSinglePass/parts';

/**
 * Classifiers — "Your spam filter is a classifier… here's some data, here's a
 * fixed set of answers, pick one." Four identical three-column cards, then the
 * shared move is drawn out underneath while each column lights up in all four.
 */
export const CLASSIFIERS_DURATION = 750;

// ── Beats ─────────────────────────────────────────────────────────────────────
const T_SPAM = 0;
const T_FRAUD = 70;
const T_MOD = 190;
const T_ROUTE = 280;
const T_MORE = 370;
const T_SAME = 460;
const T_DATA = 540;
const T_ANSWERS = 600;
const T_PICK = 660;

// ── Layout ────────────────────────────────────────────────────────────────────
const CW = 840;
const CH = 300;
const COLS = [100, 980];
const ROWS = [150, 480];
const BAND_Y = 830;

type Example = {
  title: string; icon: LucideIcon; at: number;
  data: { label: string; lines: React.ReactNode[] };
  options: string[]; pick: number;
};

const EXAMPLES: Example[] = [
  {
    title: 'spam filter', icon: Mail, at: T_SPAM,
    data: { label: 'email', lines: [<><span style={{ color: INK_3 }}>from</span> rewards@secure-payout.biz</>, 'Claim your $500 gift card now. Click bit.ly/x9 before midnight.'] },
    options: ['spam', 'not spam'], pick: 0,
  },
  {
    title: 'fraud check', icon: CreditCard, at: T_FRAUD,
    data: { label: 'transaction', lines: [<><span style={{ color: INK_3 }}>$1,240.00</span> · electronics · 02:14</>, <>Lagos, NG · card usually <span style={{ color: INK_3 }}>Austin, TX</span></>] },
    options: ['approve', 'decline', 'review'], pick: 1,
  },
  {
    title: 'content moderation', icon: ShieldAlert, at: T_MOD,
    data: { label: 'post', lines: ['“everyone at this school knows you’re a loser. just quit.”', <><span style={{ color: INK_3 }}>reported</span> 3× · reply to a minor</>] },
    options: ['keep', 'remove', 'flag'], pick: 1,
  },
  {
    title: 'ticket routing', icon: Ticket, at: T_ROUTE,
    data: { label: 'ticket', lines: ['“I was charged twice this month and can’t get a refund.”', <><span style={{ color: INK_3 }}>plan</span> pro · <span style={{ color: INK_3 }}>sentiment</span> angry</>] },
    options: ['billing', 'technical', 'sales', 'abuse'], pick: 0,
  },
];

const MORE = ['sentiment', 'language', 'intent', 'priority', 'lead scoring', 'bot detection', 'duplicate', 'nsfw', 'churn risk', 'topic', 'urgency', 'category', 'toxicity', 'refund risk'];

const ColLabel: React.FC<{ children: React.ReactNode; lit: boolean }> = ({ children, lit }) => (
  <div style={{ fontFamily: CODE, fontSize: 12, letterSpacing: 2, color: lit ? GREEN_INK : INK_3, textTransform: 'uppercase', marginBottom: 10 }}>{children}</div>
);

/** One classifier card: DATA | FIXED SET | PICK ONE. `step` lights columns 1..3. */
const ClassifierCard: React.FC<{ ex: Example; x: number; y: number; frame: number; step: number; stepP: number }> = ({ ex, x, y, frame, step, stepP }) => {
  const at = ex.at + 2;
  const dataP = sp(frame, at + 10);
  const pickAt = at + 24 + ex.options.length * 5 + 10;
  const pickP = sp(frame, pickAt);
  const picked = frame >= pickAt;
  const Icon = ex.icon;

  const col = (i: number): React.CSSProperties => {
    const lit = step >= i;
    const cur = step === i;
    const p = cur ? stepP : lit ? 1 : 0;
    return {
      flex: i === 1 ? '0 0 42%' : '1 1 0',
      padding: 14,
      borderRadius: 12,
      border: `1px solid ${lit ? `rgba(62,207,142,${0.25 + 0.35 * p})` : 'transparent'}`,
      background: lit ? `rgba(62,207,142,${cur ? 0.06 + 0.08 * p : 0.06})` : 'transparent',
      boxShadow: cur ? `0 0 0 ${3 * p}px rgba(62,207,142,${0.15 * p})` : 'none',
      display: 'flex', flexDirection: 'column', minWidth: 0,
    };
  };

  return (
    <Card x={x} y={y} w={CW} h={CH} frame={frame} at={at} title={ex.title} collapse={false} pad={16}
      right={<Pill color={GREEN_INK} bg={GREEN_TINT} style={{ fontFamily: CODE, fontSize: 13, letterSpacing: 1 }}><Icon size={14} strokeWidth={2} color={GREEN_INK} />classifier</Pill>}
    >
      <div style={{ display: 'flex', gap: 10, height: '100%', fontFamily: UI }}>
        {/* DATA */}
        <div style={col(1)}>
          <ColLabel lit={step >= 1}>data · {ex.data.label}</ColLabel>
          <div style={{ opacity: dataP, transform: `translateY(${(1 - dataP) * 8}px)`, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 19, lineHeight: 1.3, color: INK_2 }}>
            {ex.data.lines.map((l, i) => <div key={i} style={{ color: i === 0 ? INK : INK_2 }}>{l}</div>)}
          </div>
        </div>
        {/* FIXED SET */}
        <div style={col(2)}>
          <ColLabel lit={step >= 2}>fixed set · {ex.options.length} answers</ColLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ex.options.map((o, i) => {
              const p = sp(frame, at + 24 + i * 5);
              const isPick = i === ex.pick && picked;
              return (
                <span key={o} style={{
                  fontFamily: CODE, fontSize: 17, padding: '7px 12px', borderRadius: 8,
                  background: isPick ? GREEN_TINT : FILL, color: isPick ? GREEN_INK : INK,
                  border: `1px solid ${isPick ? GREEN_LINE : 'transparent'}`, fontWeight: isPick ? 700 : 400,
                  opacity: p, transform: `translateY(${(1 - p) * 8}px)`,
                }}>{o}</span>
              );
            })}
          </div>
        </div>
        {/* PICK */}
        <div style={col(3)}>
          <ColLabel lit={step >= 3}>pick one</ColLabel>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {picked ? (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10, background: GREEN, color: '#0B3B26',
                fontFamily: CODE, fontWeight: 700, fontSize: 22, letterSpacing: 1, padding: '12px 20px', borderRadius: 999,
                boxShadow: `0 0 ${16 + (step === 3 ? 14 * stepP : 0)}px rgba(62,207,142,${0.35 + (step === 3 ? 0.3 * stepP : 0)})`,
                opacity: pickP, transform: `scale(${0.7 + 0.3 * pickP + (step === 3 ? 0.06 * stepP : 0)})`,
              }}>
                <Check size={20} strokeWidth={3} color="#0B3B26" />{ex.options[ex.pick]}
              </div>
            ) : (
              <div style={{ width: 120, height: 46, borderRadius: 999, border: `1px dashed ${LINE}` }} />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

const STEPS: { icon: LucideIcon; text: string; at: number }[] = [
  { icon: Database, text: 'here’s some data', at: T_DATA },
  { icon: ListChecks, text: 'here’s a fixed set of answers', at: T_ANSWERS },
  { icon: MousePointerClick, text: 'pick one', at: T_PICK },
];

export const ClassifiersScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Which "same move" step is active in the cards, and its progress.
  const step = frame >= T_PICK ? 3 : frame >= T_ANSWERS ? 2 : frame >= T_DATA ? 1 : 0;
  const stepP = step === 0 ? 0 : sp(frame, [T_DATA, T_ANSWERS, T_PICK][step - 1]);

  const moreOut = 1 - itp(frame, T_SAME - 6, T_SAME + 6);
  const endFade = 1 - itp(frame, CLASSIFIERS_DURATION - 10, CLASSIFIERS_DURATION);

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER, overflow: 'hidden', fontFamily: UI }}>
      <div style={DOT_GRID} />
      <div style={{ position: 'absolute', inset: 0, opacity: endFade }}>
        <Caption segs={[{ t: 'Your ' }, { t: 'spam filter', hi: true }, { t: ' is a classifier.' }]} frame={frame} at={T_SPAM} until={T_FRAUD - 2} />
        <Caption segs={[{ t: 'The ' }, { t: 'fraud check', hi: true }, { t: ' when your card gets declined. That’s a classifier.' }]} frame={frame} at={T_FRAUD} until={T_MOD - 2} />
        <Caption segs={[{ t: 'Content moderation', hi: true }, { t: ', deciding what gets taken down.' }]} frame={frame} at={T_MOD} until={T_ROUTE - 2} />
        <Caption segs={[{ t: 'Ticket routing', hi: true }, { t: ', deciding which team gets your complaint.' }]} frame={frame} at={T_ROUTE} until={T_MORE - 2} />
        <Caption segs={[{ t: 'And ' }, { t: 'many more', hi: true }, { t: '.' }]} frame={frame} at={T_MORE} until={T_SAME - 2} />
        <Caption segs={[{ t: 'Every one of those is the ' }, { t: 'same move', hi: true }, { t: '.' }]} frame={frame} at={T_SAME} until={T_DATA - 2} />
        <Caption segs={[{ t: 'Here’s some ' }, { t: 'data', hi: true }, { t: '.' }]} frame={frame} at={T_DATA} until={T_ANSWERS - 2} />
        <Caption segs={[{ t: 'Here’s a ' }, { t: 'fixed set of answers', hi: true }, { t: '.' }]} frame={frame} at={T_ANSWERS} until={T_PICK - 2} />
        <Caption segs={[{ t: 'Pick one', hi: true }, { t: '.' }]} frame={frame} at={T_PICK} />

        {EXAMPLES.map((ex, i) => (
          frame >= ex.at ? (
            <ClassifierCard key={ex.title} ex={ex} x={COLS[i % 2]} y={ROWS[Math.floor(i / 2)]} frame={frame} step={step} stepP={stepP} />
          ) : null
        ))}

        {/* many more — scattered pills in the bottom band */}
        {frame >= T_MORE && moreOut > 0 && MORE.map((m, i) => {
          const at = T_MORE + 4 + Math.floor(rnd(i * 13 + 5) * 14) * 3;
          if (frame < at) return null;
          const p = sp(frame, at);
          const row = i % 2;
          const colX = 100 + (Math.floor(i / 2) / (MORE.length / 2 - 1)) * 1560 + (rnd(i * 7 + 2) - 0.5) * 60;
          const y = BAND_Y + row * 84 + (rnd(i * 11 + 3) - 0.5) * 20;
          const rot = (rnd(i * 5 + 1) - 0.5) * 8;
          return (
            <div key={m} style={{
              position: 'absolute', left: colX, top: y, opacity: p * moreOut,
              transform: `translateY(${(1 - p) * 16}px) rotate(${rot}deg) scale(${0.85 + 0.15 * p})`,
              background: i % 3 === 0 ? GREEN_TINT : PAPER, border: `1px solid ${i % 3 === 0 ? GREEN_LINE : LINE}`, boxShadow: SHADOW,
              borderRadius: 999, padding: '12px 22px', fontFamily: CODE, fontSize: 20, fontWeight: 600, color: i % 3 === 0 ? GREEN_INK : INK, whiteSpace: 'nowrap',
            }}>{m}</div>
          );
        })}

        {/* the same move — formula in the bottom band */}
        {frame >= T_SAME && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: BAND_Y, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 28 }}>
            {STEPS.map((s, i) => {
              const p = sp(frame, s.at);
              const shown = frame >= s.at;
              const S = s.icon;
              const cur = step === i + 1;
              return (
                <React.Fragment key={s.text}>
                  {i > 0 && (
                    <ArrowRight size={36} strokeWidth={2} color={shown ? GREEN_INK : LINE} style={{ opacity: shown ? p : 0.6, transform: `translateX(${(1 - (shown ? p : 0)) * -10}px)` }} />
                  )}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '22px 30px', borderRadius: 18,
                    background: shown ? GREEN_TINT : PAPER, border: `1px solid ${shown ? GREEN_LINE : LINE}`, boxShadow: cur ? '0 0 0 4px rgba(62,207,142,0.18), ' + SHADOW : SHADOW,
                    opacity: shown ? p : 0.5, transform: `translateY(${(1 - (shown ? p : 0)) * 20}px) scale(${shown ? 0.94 + 0.06 * p : 0.94})`,
                    fontFamily: UI, fontSize: 30, fontWeight: 700, letterSpacing: -0.5, color: shown ? INK : INK_3, whiteSpace: 'nowrap',
                  }}>
                    <S size={30} strokeWidth={2} color={shown ? GREEN_INK : INK_3} />
                    {s.text}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
