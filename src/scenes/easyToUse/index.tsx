import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { Activity, ArrowRight, Check, Cloud, RefreshCw, Server, Tag, Users, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, Pill } from '../oneTool/Card';
import { JevMark } from '../../Components/JevMark';
import {
  CODE, DOT_GRID, FILL, GREEN, GREEN_INK, GREEN_LINE, GREEN_TINT, INK, INK_2, INK_3, LINE, LINE_2, PAPER, RED, SHADOW, UI,
  itp, sp, easeInOut, easeOut,
} from '../oneTool/theme';
import { Caption } from '../jevSinglePass/parts';

/**
 * EasyToUse — "They made it easy to use… There are no output tokens, because
 * it doesn't generate any."
 * A: the old checklist gets struck out while one API call is typed and explained.
 * B: pricing tiles ($0.04 in, free out) and a token-flow diagram with an empty output lane.
 */
const A_DUR = 470;
const B_DUR = 430;
export const EASY_TO_USE_DURATION = A_DUR + B_DUR; // 900

// ════════════════════════════════════════════════════════════════════════════
// Phase A — easy to use
// ════════════════════════════════════════════════════════════════════════════
const A = {
  NO1: 45, NO2: 75, NO3: 105, NO4: 125, NO5: 137,
  SERVERLESS: 140, ANSWERS: 210, DATA: 270, DECISION: 320, QUARTER: 400,
};
const LCARD = { x: 100, y: 150, w: 760, h: 560 };
const RCARD = { x: 900, y: 150, w: 920, h: 560 };
const BAND_Y = 790;

const NEEDS: { icon: LucideIcon; label: string; text: string; at: number }[] = [
  { icon: Tag, label: 'training data', text: 'thousands of labeled examples', at: A.NO1 },
  { icon: Server, label: 'hosting', text: 'endpoint · replicas · on-call', at: A.NO2 },
  { icon: Users, label: 'ml team', text: '4 engineers', at: A.NO3 },
  { icon: Activity, label: 'monitoring', text: 'dashboards · drift alerts', at: A.NO4 },
  { icon: RefreshCw, label: 'retrains', text: 'every time it drifts', at: A.NO5 },
];

const ChecklistCard: React.FC<{ frame: number }> = ({ frame }) => {
  const gone = NEEDS.filter((n) => frame >= n.at).length;
  return (
    <Card {...LCARD} frame={frame} at={2} title="what you used to need" collapse={false} pad={22}
      right={<Pill color={gone === NEEDS.length ? GREEN_INK : INK_2} bg={gone === NEEDS.length ? GREEN_TINT : FILL} style={{ fontFamily: CODE, fontSize: 13 }}>{NEEDS.length - gone} of {NEEDS.length} left</Pill>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', fontFamily: UI }}>
        {NEEDS.map((n) => {
          const s = frame >= n.at ? easeInOut(itp(frame, n.at, n.at + 14)) : 0;
          const pp = frame >= n.at ? sp(frame, n.at + 4) : 0;
          const Icon = n.icon;
          return (
            <div key={n.label} style={{
              position: 'relative', height: 82, borderRadius: 14, border: `1px solid ${LINE}`, background: PAPER,
              padding: '0 16px', display: 'flex', alignItems: 'center', gap: 14, opacity: 1 - 0.5 * s,
            }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: s > 0.5 ? FILL : GREEN_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 42px' }}>
                <Icon size={20} strokeWidth={1.8} color={s > 0.5 ? INK_3 : GREEN_INK} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: CODE, fontSize: 12, letterSpacing: 2, color: INK_3, textTransform: 'uppercase' }}>{n.label}</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: INK, whiteSpace: 'nowrap' }}>{n.text}</div>
              </div>
              <div style={{ opacity: pp, transform: `scale(${0.7 + 0.3 * pp})` }}>
                <Pill color="#0B3B26" bg={GREEN} style={{ fontFamily: CODE, fontSize: 13, letterSpacing: 1 }}><X size={12} strokeWidth={3} color="#0B3B26" />none</Pill>
              </div>
              <div style={{ position: 'absolute', left: 70, top: '50%', height: 3, borderRadius: 2, background: GREEN_INK, width: `calc(${s * 100}% - 190px)`, opacity: s > 0 ? 0.9 : 0 }} />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

type Tok = { t: string; c: string; id?: string };
const LINE1: Tok[] = [
  { t: 'const ', c: INK_2 }, { t: 'result', c: INK }, { t: ' = ', c: INK_2 }, { t: 'await ', c: INK_2 }, { t: 'jev', c: GREEN_INK }, { t: '.choice(', c: INK },
];
const LINE2: Tok[] = [{ t: '  ', c: INK }, { t: 'email', c: INK, id: 'data' }, { t: ',', c: INK }];
const LINE3: Tok[] = [{ t: '  ', c: INK }, { t: '["spam", "not spam"]', c: GREEN_INK, id: 'answers' }];
const LINE4: Tok[] = [{ t: ')', c: INK }];
const RESULT: Tok[] = [{ t: '// → ', c: INK_3 }, { t: '{ answer: ', c: INK_2 }, { t: '"spam"', c: GREEN_INK, id: 'answer' }, { t: ', confidence: ', c: INK_2 }, { t: '0.97', c: GREEN_INK, id: 'prob' }, { t: ' }', c: INK_2 }];


const CodeLine: React.FC<{ toks: Tok[]; chars: number; hi?: string; hiLabel?: string; hiP?: number }> = ({ toks, chars, hi, hiLabel, hiP = 0 }) => {
  let left = chars;
  return (
    <div style={{ whiteSpace: 'pre', position: 'relative', height: 44, display: 'flex', alignItems: 'center' }}>
      {toks.map((tk, i) => {
        const s = tk.t.slice(0, Math.max(0, left));
        left -= tk.t.length;
        const active = hi && tk.id === hi && s.length > 0;
        return (
          <span key={i} style={{ position: 'relative', color: tk.c, background: active ? `rgba(62,207,142,${0.16 * hiP})` : 'transparent', borderRadius: 6, boxShadow: active ? `0 0 0 ${2 * hiP}px rgba(62,207,142,${0.5 * hiP})` : 'none', padding: active ? '2px 4px' : 0, margin: active ? '0 -4px' : 0 }}>
            {s}
            {active && hiLabel && (
              <span style={{ position: 'absolute', left: 0, top: -30, fontFamily: CODE, fontSize: 12, letterSpacing: 2, color: GREEN_INK, textTransform: 'uppercase', whiteSpace: 'nowrap', opacity: hiP, transform: `translateY(${(1 - hiP) * 6}px)` }}>{hiLabel}</span>
            )}
          </span>
        );
      })}
    </div>
  );
};

const CodeCard: React.FC<{ frame: number }> = ({ frame }) => {
  const c1 = frame < A.SERVERLESS + 8 ? 0 : Math.floor((frame - A.SERVERLESS - 8) * 1.4);
  const c2 = frame < A.DATA + 4 ? 0 : Math.floor((frame - A.DATA - 4) * 1.4);
  const c3 = frame < A.ANSWERS + 4 ? 0 : Math.floor((frame - A.ANSWERS - 4) * 1.4);
  const c4 = frame < A.ANSWERS + 30 ? 0 : 1;
  const cr = frame < A.DECISION + 6 ? 0 : Math.floor((frame - A.DECISION - 6) * 1.8);
  const hi = frame >= A.DECISION ? 'prob' : frame >= A.DATA ? 'data' : frame >= A.ANSWERS + 18 ? 'answers' : undefined;
  const hiAt = frame >= A.DECISION ? A.DECISION + 20 : frame >= A.DATA ? A.DATA + 10 : A.ANSWERS + 18;
  const hiP = hi ? sp(frame, hiAt) : 0;
  const hiLabel = hi === 'answers' ? 'your answers' : hi === 'data' ? 'your data' : hi === 'prob' ? 'a decision, with a probability' : undefined;
  const barsIn = frame >= A.DECISION + 30;
  const bp = sp(frame, A.DECISION + 30);
  const serverless = frame >= A.SERVERLESS;
  const spv = sp(frame, A.SERVERLESS);
  // answers line types first (defined by you), data second, then result
  return (
    <Card {...RCARD} frame={frame} at={8} title="what you need now" collapse={false} pad={24}
      right={serverless ? <Pill color={GREEN_INK} bg={GREEN_TINT} style={{ fontFamily: CODE, fontSize: 13, opacity: spv }}><Cloud size={13} strokeWidth={2} color={GREEN_INK} />serverless · one API call</Pill> : <Pill color={INK_3} bg={FILL} style={{ fontFamily: CODE, fontSize: 13 }}>—</Pill>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: CODE, fontSize: 24, lineHeight: 1.4 }}>
        <div style={{ paddingTop: 6 }}>
          <CodeLine toks={LINE1} chars={c1} />
          <div style={{ marginTop: 24 }} />
          <CodeLine toks={LINE2} chars={c2} hi={hi} hiLabel={hiLabel} hiP={hiP} />
          <div style={{ marginTop: 24 }} />
          <CodeLine toks={LINE3} chars={c3} hi={hi} hiLabel={hiLabel} hiP={hiP} />
          <CodeLine toks={LINE4} chars={c4} />
          <div style={{ marginTop: 20 }} />
          <CodeLine toks={RESULT} chars={cr} hi={hi} hiLabel={hiLabel} hiP={hiP} />
        </div>
        {!serverless && <span style={{ display: 'inline-block', width: 12, height: 26, background: GREEN_INK, opacity: frame % 14 < 9 ? 1 : 0 }} />}
        {barsIn && (
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10, opacity: bp, transform: `translateY(${(1 - bp) * 10}px)`, fontFamily: UI }}>
            {[['SPAM', 0.97, true], ['NOT SPAM', 0.03, false]].map(([l, v, sel]) => (
              <div key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 130, fontFamily: CODE, fontSize: 16, fontWeight: 700, letterSpacing: 1, color: sel ? GREEN_INK : INK_2 }}>{l as string}</div>
                <div style={{ flex: 1, height: 12, borderRadius: 6, background: LINE, overflow: 'hidden' }}>
                  <div style={{ width: `${(v as number) * 100 * bp}%`, height: '100%', background: sel ? GREEN : LINE_2, borderRadius: 6 }} />
                </div>
                <div style={{ width: 64, textAlign: 'right', fontFamily: CODE, fontSize: 18, fontWeight: 700, color: sel ? GREEN_INK : INK_3 }}>{(v as number).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

const QuarterBand: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < A.QUARTER) return null;
  const inP = sp(frame, A.QUARTER);
  const w1 = easeInOut(itp(frame, A.QUARTER + 6, A.QUARTER + 40));
  const w2 = easeOut(itp(frame, A.QUARTER + 40, A.QUARTER + 52));
  const rows = [
    { label: 'before', value: 'a quarter · 13 weeks', w: w1, bg: LINE_2, color: INK_2 },
    { label: 'now', value: 'an afternoon · 4 hours', w: w2 * 0.028, bg: GREEN, color: GREEN_INK },
  ];
  return (
    <div style={{ position: 'absolute', left: 100, top: BAND_Y, width: 1720, opacity: inP, transform: `translateY(${(1 - inP) * 16}px)`, display: 'flex', flexDirection: 'column', gap: 22 }}>
      {rows.map((r, i) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 110, fontFamily: CODE, fontSize: 13, letterSpacing: 2, color: INK_3, textTransform: 'uppercase' }}>{r.label}</div>
          <div style={{ flex: 1, position: 'relative', height: 46 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: 46, width: `${Math.max(r.w * 100, i === 1 && w2 > 0 ? 1.2 : 0)}%`, borderRadius: 10, background: r.bg, boxShadow: i === 1 && w2 > 0 ? '0 0 18px rgba(62,207,142,0.45)' : 'none' }} />
            {i === 0 ? (
              <div style={{ position: 'absolute', right: 18, top: 0, height: 46, display: 'flex', alignItems: 'center', fontFamily: UI, fontSize: 26, fontWeight: 700, letterSpacing: -0.5, color: INK_2, whiteSpace: 'nowrap', opacity: itp(w1, 0.9, 1) }}>
                {r.value}
              </div>
            ) : (
              <div style={{ position: 'absolute', left: 'calc(2.8% + 16px)', top: 0, height: 46, display: 'flex', alignItems: 'center', fontFamily: UI, fontSize: 26, fontWeight: 700, letterSpacing: -0.5, color: r.color, whiteSpace: 'nowrap', opacity: w2 }}>
                {r.value}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const PhaseA: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Caption segs={[{ t: 'They made it ' }, { t: 'easy to use', hi: true }, { t: '.' }]} frame={frame} at={0} until={A.NO1 - 2} />
      <Caption segs={[{ t: 'No', hi: true }, { t: ' training data.' }]} frame={frame} at={A.NO1} until={A.NO2 - 2} />
      <Caption segs={[{ t: 'No', hi: true }, { t: ' hosting.' }]} frame={frame} at={A.NO2} until={A.NO3 - 2} />
      <Caption segs={[{ t: 'No', hi: true }, { t: ' ML team.' }]} frame={frame} at={A.NO3} until={A.SERVERLESS - 2} />
      <Caption segs={[{ t: 'It’s ' }, { t: 'serverless', hi: true }, { t: '. One API call.' }]} frame={frame} at={A.SERVERLESS} until={A.ANSWERS - 2} />
      <Caption segs={[{ t: 'You define the ' }, { t: 'possible answers', hi: true }, { t: ',' }]} frame={frame} at={A.ANSWERS} until={A.DATA - 2} />
      <Caption segs={[{ t: 'send your ' }, { t: 'data', hi: true }, { t: ',' }]} frame={frame} at={A.DATA} until={A.DECISION - 2} />
      <Caption segs={[{ t: 'and get back a ' }, { t: 'decision', hi: true }, { t: ' with a ' }, { t: 'probability', hi: true }, { t: ' on it.' }]} frame={frame} at={A.DECISION} until={A.QUARTER - 2} />
      <Caption segs={[{ t: 'A quarter-long project is now ' }, { t: 'an afternoon', hi: true }, { t: '.' }]} frame={frame} at={A.QUARTER} />
      <ChecklistCard frame={frame} />
      <CodeCard frame={frame} />
      <QuarterBand frame={frame} />
    </>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// Phase B — pricing
// ════════════════════════════════════════════════════════════════════════════
const B = { INPUT: 30, OUTPUT: 90, FREE: 130, NOTOK: 180, DECIDE: 250 };
const TILE_Y = 150;
const TILE_H = 330;
const FLOW_Y = 540;
const LANE_Y = FLOW_Y + 110;

const PriceTile: React.FC<{ frame: number; x: number; title: string; at: number; children: React.ReactNode; note: React.ReactNode; right?: React.ReactNode }> = ({ frame, x, title, at, children, note, right }) => (
  <Card x={x} y={TILE_Y} w={840} h={TILE_H} frame={frame} at={at} title={title} collapse={false} pad={26} right={right}>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', fontFamily: UI }}>
      {children}
      <div style={{ fontFamily: CODE, fontSize: 14, letterSpacing: 1.5, color: INK_3, textTransform: 'uppercase' }}>{note}</div>
    </div>
  </Card>
);

const Tokens: React.FC<{ frame: number; from: number; to: number; y: number; start: number; every: number; count: number; color: string; bg: string; label: string }> = ({ frame, from, to, y, start, every, count, color, bg, label }) => (
  <>
    {Array.from({ length: count }).map((_, i) => {
      const s = start + i * every;
      const travel = 34;
      if (frame < s || frame > s + travel) return null;
      const p = easeInOut(itp(frame, s, s + travel));
      const x = from + (to - from) * p;
      const fade = Math.min(itp(frame, s, s + 4), 1 - itp(frame, s + travel - 5, s + travel));
      return (
        <div key={i} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', opacity: fade, padding: '4px 7px', borderRadius: 6, background: bg, color, fontFamily: CODE, fontSize: 11, fontWeight: 700, letterSpacing: 1, boxShadow: SHADOW, border: `1px solid ${LINE}` }}>{label}</div>
      );
    })}
  </>
);

const Flow: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < 22) return null;
  const inP = sp(frame, 22);
  const inCount = Math.min(212, Math.max(0, Math.floor((frame - B.NOTOK) * 6)));
  const decided = frame >= B.DECIDE;
  const dp = sp(frame, B.DECIDE);
  const boxL = { x: 100, w: 480 };
  const boxJ = { x: 830, w: 260 };
  const boxR = { x: 1340, w: 480 };
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: inP, fontFamily: UI }}>
      {/* your data */}
      <div style={{ position: 'absolute', left: boxL.x, top: FLOW_Y, width: boxL.w, height: 220, borderRadius: 18, border: `1px solid ${LINE}`, background: PAPER, boxShadow: SHADOW, padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontFamily: CODE, fontSize: 12, letterSpacing: 2, color: INK_3, textTransform: 'uppercase' }}>your data · email</div>
        <div style={{ fontSize: 20, color: INK_2, lineHeight: 1.35 }}>“Claim your $500 gift card now. Click bit.ly/x9 before midnight or lose it forever.”</div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Pill color={INK} bg={FILL} style={{ fontFamily: CODE, fontSize: 14 }}>{frame >= B.NOTOK ? `${inCount} input tokens` : '212 tokens'}</Pill>
          <span style={{ fontFamily: CODE, fontSize: 13, color: INK_3 }}>× $0.04 / 1M</span>
        </div>
      </div>
      {/* jev */}
      <div style={{ position: 'absolute', left: boxJ.x, top: FLOW_Y - 10, width: boxJ.w, height: 240, borderRadius: 24, background: INK, boxShadow: '0 24px 60px rgba(0,0,0,0.25), 0 0 0 8px rgba(62,207,142,0.16)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <JevMark variant="white" size={58} glow={0.6} />
        <div style={{ fontFamily: CODE, fontSize: 13, letterSpacing: 2, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>reads once · decides</div>
      </div>
      {/* decision */}
      <div style={{ position: 'absolute', left: boxR.x, top: FLOW_Y, width: boxR.w, height: 220, borderRadius: 18, border: `1px ${decided ? 'solid' : 'dashed'} ${decided ? GREEN_LINE : LINE_2}`, background: decided ? 'rgba(62,207,142,0.05)' : 'transparent', boxShadow: decided ? SHADOW : 'none', padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontFamily: CODE, fontSize: 12, letterSpacing: 2, color: decided ? GREEN_INK : INK_3, textTransform: 'uppercase' }}>what comes back</div>
        {decided ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: dp, transform: `scale(${0.8 + 0.2 * dp})`, transformOrigin: 'left center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: GREEN, color: '#0B3B26', fontFamily: CODE, fontWeight: 700, fontSize: 26, letterSpacing: 1, padding: '12px 20px', borderRadius: 999, boxShadow: '0 0 22px rgba(62,207,142,0.5)' }}>
              <Check size={22} strokeWidth={3} color="#0B3B26" />spam · 0.97
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 20, color: INK_3 }}>…</div>
        )}
        <div style={{ marginTop: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Pill color={GREEN_INK} bg={GREEN_TINT} style={{ fontFamily: CODE, fontSize: 14 }}>0 output tokens</Pill>
          <span style={{ fontFamily: CODE, fontSize: 13, color: INK_3 }}>a decision, not text · <span style={{ color: GREEN_INK, fontWeight: 700 }}>free</span></span>
        </div>
      </div>
      {/* lanes */}
      <div style={{ position: 'absolute', left: boxL.x + boxL.w, top: LANE_Y - 1, width: boxJ.x - (boxL.x + boxL.w), height: 2, background: LINE_2 }} />
      <ArrowRight size={22} strokeWidth={2} color={LINE_2} style={{ position: 'absolute', left: boxJ.x - 20, top: LANE_Y - 11 }} />
      <div style={{ position: 'absolute', left: boxJ.x + boxJ.w, top: LANE_Y - 1, width: boxR.x - (boxJ.x + boxJ.w), height: 0, borderTop: `2px dashed ${LINE_2}` }} />
      <ArrowRight size={22} strokeWidth={2} color={decided ? GREEN_INK : LINE_2} style={{ position: 'absolute', left: boxR.x - 20, top: LANE_Y - 11 }} />
      <div style={{ position: 'absolute', left: boxJ.x + boxJ.w, width: boxR.x - (boxJ.x + boxJ.w), top: LANE_Y + 16, textAlign: 'center', fontFamily: CODE, fontSize: 12, letterSpacing: 2, color: INK_3, textTransform: 'uppercase' }}>
        {decided ? 'one decision' : frame >= B.NOTOK ? 'nothing streams here' : 'output'}
      </div>
      <div style={{ position: 'absolute', left: boxL.x + boxL.w, width: boxJ.x - (boxL.x + boxL.w), top: LANE_Y + 16, textAlign: 'center', fontFamily: CODE, fontSize: 12, letterSpacing: 2, color: INK_3, textTransform: 'uppercase' }}>{frame >= B.NOTOK ? 'input · billed' : 'input'}</div>
      <Tokens frame={frame} from={boxL.x + boxL.w} to={boxJ.x} y={LANE_Y} start={B.NOTOK} every={7} count={36} color={INK} bg={PAPER} label="tok" />
      {decided && (() => {
        const p = easeInOut(itp(frame, B.DECIDE - 18, B.DECIDE));
        if (frame >= B.DECIDE) return null;
        const x = boxJ.x + boxJ.w + (boxR.x - boxJ.x - boxJ.w) * p;
        return <div style={{ position: 'absolute', left: x, top: LANE_Y, transform: 'translate(-50%,-50%)', padding: '6px 12px', borderRadius: 999, background: GREEN, color: '#0B3B26', fontFamily: CODE, fontSize: 13, fontWeight: 700 }}>spam · 0.97</div>;
      })()}
      {/* takeaway */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', fontFamily: UI, fontSize: 44, fontWeight: 700, letterSpacing: -1, color: INK, opacity: sp(frame, B.NOTOK + 10) }}>
        It doesn’t <span style={{ color: GREEN_INK }}>generate</span>. So there’s nothing to bill.
      </div>
    </div>
  );
};

const PhaseB: React.FC = () => {
  const frame = useCurrentFrame();
  const inP = sp(frame, B.INPUT + 6);
  const cents = easeOut(itp(frame, B.INPUT + 6, B.INPUT + 40)) * 0.04;
  const outIn = frame >= B.OUTPUT;
  const freeP = frame >= B.FREE ? sp(frame, B.FREE) : 0;
  const endFade = 1 - itp(frame, B_DUR - 10, B_DUR);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: endFade }}>
      <Caption segs={[{ t: 'And the ' }, { t: 'pricing', hi: true }, { t: ' is where it gets stupid.' }]} frame={frame} at={0} until={B.INPUT - 2} />
      <Caption segs={[{ t: 'Input: ' }, { t: 'four cents', hi: true }, { t: ' per million tokens.' }]} frame={frame} at={B.INPUT} until={B.OUTPUT - 2} />
      <Caption segs={[{ t: 'Output: ' }, { t: 'free', hi: true }, { t: '.' }]} frame={frame} at={B.OUTPUT} until={B.FREE - 2} />
      <Caption segs={[{ t: 'Not discounted. ' }, { t: 'Free', hi: true }, { t: '.' }]} frame={frame} at={B.FREE} until={B.NOTOK - 2} />
      <Caption segs={[{ t: 'There are ' }, { t: 'no output tokens', hi: true }, { t: ', because it doesn’t generate any.' }]} frame={frame} at={B.NOTOK} />

      <PriceTile frame={frame} x={100} title="input" at={4} note="what it reads · per 1M tokens"
        right={<Pill color={INK_2} bg={FILL} style={{ fontFamily: CODE, fontSize: 13 }}>billed</Pill>}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, opacity: inP }}>
          <span style={{ fontFamily: CODE, fontWeight: 700, fontSize: 132, lineHeight: 1, letterSpacing: -5, color: INK }}>${cents.toFixed(2)}</span>
          <span style={{ fontFamily: UI, fontSize: 30, fontWeight: 600, color: INK_3 }}>/ 1M tokens</span>
        </div>
      </PriceTile>

      <PriceTile frame={frame} x={980} title="output" at={12} note={<span>what it says · <span style={{ textDecoration: freeP > 0 ? 'line-through' : 'none', color: freeP > 0 ? INK_3 : INK_3 }}>discounted</span> {freeP > 0 && <span style={{ color: GREEN_INK }}>→ free</span>}</span>}
        right={<Pill color={freeP > 0 ? '#0B3B26' : INK_2} bg={freeP > 0 ? GREEN : FILL} style={{ fontFamily: CODE, fontSize: 13 }}>{freeP > 0 ? 'free' : 'billed?'}</Pill>}
      >
        <div style={{ position: 'relative', height: 132, display: 'flex', alignItems: 'baseline', gap: 18 }}>
          {outIn && (
            <span style={{ fontFamily: CODE, fontWeight: 700, fontSize: 132, lineHeight: 1, letterSpacing: -5, color: INK_3, opacity: sp(frame, B.OUTPUT) * (1 - freeP), position: 'absolute', left: 0, top: 0, textDecoration: freeP > 0.2 ? 'line-through' : 'none' }}>$0.00</span>
          )}
          {freeP > 0 && (
            <div style={{ position: 'absolute', left: 0, top: -6, display: 'flex', alignItems: 'baseline', gap: 18, opacity: freeP, transform: `scale(${0.85 + 0.15 * freeP}) rotate(${(1 - freeP) * -4}deg)`, transformOrigin: 'left center' }}>
              <span style={{ fontFamily: CODE, fontWeight: 700, fontSize: 132, lineHeight: 1, letterSpacing: -5, color: GREEN_INK, textShadow: '0 0 30px rgba(62,207,142,0.45)' }}>free</span>
              <span style={{ fontFamily: UI, fontSize: 30, fontWeight: 600, color: INK_3 }}>/ 1M tokens</span>
            </div>
          )}
        </div>
      </PriceTile>

      <Flow frame={frame} />
      <span style={{ display: 'none', color: RED }} />
    </div>
  );
};

export const EasyToUseScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: PAPER, overflow: 'hidden', fontFamily: UI }}>
    <div style={DOT_GRID} />
    <Sequence from={0} durationInFrames={A_DUR} layout="none"><PhaseA /></Sequence>
    <Sequence from={A_DUR} durationInFrames={B_DUR} layout="none"><PhaseB /></Sequence>
  </AbsoluteFill>
);
