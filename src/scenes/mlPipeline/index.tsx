import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Activity, AlertTriangle, ArrowRight, Cpu, RefreshCw, Server, Tag } from 'lucide-react';
import { Card, Pill } from '../oneTool/Card';
import {
  CODE, DOT_GRID, FILL, GREEN, GREEN_INK, GREEN_LINE, GREEN_TINT, INK, INK_2, INK_3, LINE, LINE_2, PAPER, RED, RED_TINT, SHADOW, UI,
  itp, rnd, sp, easeInOut, easeOut,
} from '../oneTool/theme';
import { Caption } from '../jevSinglePass/parts';

/**
 * MlPipeline — "You collect thousands of labeled examples. You train a model.
 * You host it. You monitor it. It drifts, you retrain it."
 * Four stage cards across the canvas, then a return arrow from monitor to
 * train that fires twice so the loop reads as endless.
 */
export const ML_PIPELINE_DURATION = 390;

// ── Beats ─────────────────────────────────────────────────────────────────────
const T_COLLECT = 0;
const T_TRAIN = 55;
const T_HOST = 110;
const T_MONITOR = 150;
const T_DRIFT = 200;
const T_RETRAIN = 235;      // chip leaves monitor
const T_RETRAIN_ARRIVE = 268;
const T_RECOVER = 292;
const T_DRIFT2 = 322;
const T_RETRAIN2 = 350;
const T_RETRAIN2_ARRIVE = 380;

// ── Layout ────────────────────────────────────────────────────────────────────
const CW = 400;
const CH = 540;
const CY = 160;
const GAP = 40;
const XS = [100, 100 + (CW + GAP), 100 + 2 * (CW + GAP), 100 + 3 * (CW + GAP)];
const MID_Y = CY + CH / 2;
const LOOP_Y = 790;
const STRIP_Y = 880;

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// ── Data ──────────────────────────────────────────────────────────────────────
const EXAMPLES = [
  ['“claim your $500 gift card now”', 'spam'],
  ['“invoice #2231 attached, thanks”', 'not spam'],
  ['“URGENT: verify your account”', 'spam'],
  ['“lunch thursday? new place on 5th”', 'not spam'],
  ['“you have (1) unclaimed reward”', 'spam'],
  ['“Q3 board deck v4 — comments in”', 'not spam'],
  ['“hot singles in your area”', 'spam'],
] as const;

const LOGS = ['200 · 41ms · spam', '200 · 38ms · not spam', '200 · 44ms · spam', '200 · 36ms · not spam', '200 · 52ms · spam', '200 · 39ms · not spam', '200 · 47ms · spam', '200 · 40ms · not spam', '200 · 43ms · spam', '200 · 37ms · not spam', '200 · 45ms · not spam', '200 · 41ms · spam', '200 · 39ms · spam', '200 · 42ms · not spam', '200 · 38ms · spam', '200 · 44ms · not spam', '200 · 40ms · spam', '200 · 46ms · not spam', '200 · 39ms · spam', '200 · 41ms · not spam', '200 · 43ms · spam', '200 · 37ms · not spam', '200 · 45ms · spam', '200 · 40ms · not spam', '200 · 42ms · spam', '200 · 38ms · not spam', '200 · 44ms · spam', '200 · 41ms · not spam', '200 · 39ms · spam', '200 · 43ms · not spam'];

/** Accuracy at a given frame: steady, drifts, recovers after retrain, drifts again. */
const accuracy = (f: number) => {
  const noise = (Math.sin(f * 0.7) + Math.sin(f * 1.9)) * 0.18;
  let base = 96.2;
  if (f >= T_DRIFT) base = 96.2 - easeInOut(itp(f, T_DRIFT, T_DRIFT + 30)) * 4.8;
  if (f >= T_RECOVER) base = 91.4 + easeOut(itp(f, T_RECOVER, T_RECOVER + 18)) * 4.4;
  if (f >= T_DRIFT2) base = 95.8 - easeInOut(itp(f, T_DRIFT2, T_DRIFT2 + 26)) * 4.2;
  return base + noise;
};

/** Training progress 0–1 for the current model version. */
const trainProgress = (f: number) => {
  if (f >= T_RETRAIN2_ARRIVE) return itp(f, T_RETRAIN2_ARRIVE, T_RETRAIN2_ARRIVE + 40);
  if (f >= T_RETRAIN_ARRIVE) return itp(f, T_RETRAIN_ARRIVE, T_RETRAIN_ARRIVE + 26);
  return itp(f, T_TRAIN + 8, T_TRAIN + 58);
};
const modelVersion = (f: number) => (f >= T_RETRAIN2_ARRIVE ? 3 : f >= T_RETRAIN_ARRIVE ? 2 : 1);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: CODE, fontSize: 12, letterSpacing: 2, color: INK_3, textTransform: 'uppercase' }}>{children}</div>
);

// ── Stage cards ───────────────────────────────────────────────────────────────
const CollectCard: React.FC<{ frame: number }> = ({ frame }) => {
  const at = T_COLLECT + 2;
  const count = easeOut(itp(frame, at + 6, at + 56)) * 12480;
  return (
    <Card x={XS[0]} y={CY} w={CW} h={CH} frame={frame} at={at} title="collect" collapse={false} pad={20}
      right={<Pill color={GREEN_INK} bg={GREEN_TINT} style={{ fontFamily: CODE, fontSize: 13 }}><Tag size={13} strokeWidth={2} color={GREEN_INK} />{fmt(count)} labeled</Pill>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', fontFamily: UI }}>
        <SectionLabel>labeled examples · by hand</SectionLabel>
        <div style={{ fontFamily: CODE, fontWeight: 700, fontSize: 52, letterSpacing: -2, color: INK, lineHeight: 1 }}>{fmt(count)}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
          {EXAMPLES.map(([text, label], i) => {
            const p = sp(frame, at + 14 + i * 5);
            if (frame < at + 14 + i * 5) return null;
            const spam = label === 'spam';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: p, transform: `translateY(${(1 - p) * 8}px)` }}>
                <div style={{ flex: 1, fontSize: 15, color: INK_2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>
                <span style={{ fontFamily: CODE, fontSize: 12, padding: '4px 8px', borderRadius: 6, background: spam ? RED_TINT : FILL, color: spam ? RED : INK_2, whiteSpace: 'nowrap' }}>{label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 'auto', fontFamily: CODE, fontSize: 13, letterSpacing: 1, color: INK_3 }}>3 labelers · 6 weeks</div>
      </div>
    </Card>
  );
};

const TrainCard: React.FC<{ frame: number }> = ({ frame }) => {
  const at = T_TRAIN + 2;
  const prog = trainProgress(frame);
  const v = modelVersion(frame);
  const retraining = (frame >= T_RETRAIN_ARRIVE && frame < T_RETRAIN_ARRIVE + 26) || (frame >= T_RETRAIN2_ARRIVE);
  const epoch = Math.min(40, Math.floor(prog * 40));
  const W = 344, H = 170;
  const N = 40;
  const pts = Array.from({ length: N + 1 }, (_, i) => {
    const t = i / N;
    const y = 0.92 * Math.exp(-t * 4.2) + 0.08 + (rnd(i * 3 + v) - 0.5) * 0.05;
    return [t * W, H - y * H] as const;
  });
  const n = Math.max(1, Math.floor(prog * N) + 1);
  const d = pts.slice(0, n).map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const flash = retraining ? sp(frame, v === 3 ? T_RETRAIN2_ARRIVE : T_RETRAIN_ARRIVE) : 0;
  return (
    <Card x={XS[1]} y={CY} w={CW} h={CH} frame={frame} at={at} title="train" collapse={false} pad={20}
      right={<Pill color={retraining ? '#0B3B26' : INK} bg={retraining ? GREEN : FILL} style={{ fontFamily: CODE, fontSize: 13 }}><Cpu size={13} strokeWidth={2} color={retraining ? '#0B3B26' : INK} />epoch {epoch}/40</Pill>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', fontFamily: UI }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionLabel>training loss</SectionLabel>
          <span style={{ fontFamily: CODE, fontSize: 13, fontWeight: 700, color: v > 1 ? GREEN_INK : INK_3, background: v > 1 ? GREEN_TINT : 'transparent', padding: '3px 8px', borderRadius: 6, transform: `scale(${1 + 0.15 * flash * (1 - flash) * 4})` }}>model v{v}</span>
        </div>
        <svg width={W} height={H + 10} style={{ overflow: 'visible' }}>
          <line x1={0} y1={H} x2={W} y2={H} stroke={LINE} strokeWidth={1} />
          <line x1={0} y1={0} x2={0} y2={H} stroke={LINE} strokeWidth={1} />
          <path d={d} fill="none" stroke={GREEN} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px rgba(62,207,142,0.35))' }} />
          {n > 0 && <circle cx={pts[n - 1][0]} cy={pts[n - 1][1]} r={5} fill={GREEN} />}
        </svg>
        <div style={{ position: 'relative', height: 8, borderRadius: 4, background: LINE, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${prog * 100}%`, background: GREEN }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: CODE, fontSize: 13, color: INK_3 }}>
          <span>8× A100 · {Math.round(prog * 6)}h {String(Math.round((prog * 6 * 60) % 60)).padStart(2, '0')}m</span>
          <span style={{ color: prog >= 1 ? GREEN_INK : INK_3 }}>{prog >= 1 ? 'converged' : 'training…'}</span>
        </div>
        <div style={{ marginTop: 'auto', fontFamily: CODE, fontSize: 13, letterSpacing: 1, color: INK_3 }}>hyperparams · eval set · checkpoints</div>
      </div>
    </Card>
  );
};

const HostCard: React.FC<{ frame: number }> = ({ frame }) => {
  const at = T_HOST + 2;
  const live = frame >= at + 12;
  const shown = Math.max(0, Math.floor((frame - at - 14) / 7));
  const visible = Array.from({ length: Math.min(6, shown) }, (_, k) => LOGS[(shown - Math.min(6, shown) + k) % LOGS.length]);
  const v = modelVersion(frame);
  return (
    <Card x={XS[2]} y={CY} w={CW} h={CH} frame={frame} at={at} title="host" collapse={false} pad={20}
      right={<Pill color={live ? GREEN_INK : INK_3} bg={live ? GREEN_TINT : FILL} style={{ fontFamily: CODE, fontSize: 13 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: live ? GREEN : LINE_2, display: 'inline-block', boxShadow: live ? '0 0 8px rgba(62,207,142,0.7)' : 'none' }} />{live ? 'live' : 'deploying'}</Pill>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', fontFamily: UI }}>
        <SectionLabel>endpoint</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: `1px solid ${LINE}`, background: PAPER }}>
          <Server size={22} strokeWidth={1.5} color={live ? GREEN_INK : INK_3} />
          <div style={{ fontFamily: CODE, fontSize: 15, color: INK }}>POST /classify <span style={{ color: INK_3 }}>· v{v}</span></div>
        </div>
        <SectionLabel>requests</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: CODE, fontSize: 14, color: INK_2, minHeight: 160 }}>
          {visible.map((l, i) => {
            const isLast = i === visible.length - 1;
            return (
              <div key={shown - visible.length + i} style={{ display: 'flex', gap: 10, alignItems: 'center', opacity: isLast ? 1 : 0.45 + 0.55 * (i / visible.length) }}>
                <span style={{ color: GREEN_INK, fontWeight: 700 }}>200</span>
                <span>{l.slice(6)}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 14, fontFamily: CODE, fontSize: 13, letterSpacing: 1, color: INK_3 }}>
          <span>2 replicas</span><span>·</span><span>autoscale</span><span>·</span><span>on-call</span>
        </div>
      </div>
    </Card>
  );
};

const MonitorCard: React.FC<{ frame: number }> = ({ frame }) => {
  const at = T_MONITOR + 2;
  const start = at + 6;
  const W = 344, H = 170;
  const span = ML_PIPELINE_DURATION - start;
  const pts: [number, number][] = [];
  for (let f = start; f <= Math.min(frame, ML_PIPELINE_DURATION); f += 2) {
    const a = accuracy(f);
    pts.push([((f - start) / span) * W, H - ((a - 88) / 10) * H]);
  }
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const acc = frame >= start ? accuracy(frame) : 96.2;
  const drifting = (frame >= T_DRIFT + 12 && frame < T_RECOVER + 6) || frame >= T_DRIFT2 + 12;
  const thrY = H - ((94 - 88) / 10) * H;
  const alertP = drifting ? sp(frame, frame >= T_DRIFT2 + 12 ? T_DRIFT2 + 12 : T_DRIFT + 12) : 0;
  return (
    <Card x={XS[3]} y={CY} w={CW} h={CH} frame={frame} at={at} title="monitor" collapse={false} pad={20}
      right={<Pill color={drifting ? PAPER : GREEN_INK} bg={drifting ? RED : GREEN_TINT} style={{ fontFamily: CODE, fontSize: 13 }}><Activity size={13} strokeWidth={2} color={drifting ? PAPER : GREEN_INK} />{acc.toFixed(1)}%</Pill>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', fontFamily: UI }}>
        <SectionLabel>accuracy · production</SectionLabel>
        <svg width={W} height={H + 10} style={{ overflow: 'visible' }}>
          <line x1={0} y1={H} x2={W} y2={H} stroke={LINE} strokeWidth={1} />
          <line x1={0} y1={0} x2={0} y2={H} stroke={LINE} strokeWidth={1} />
          <line x1={0} y1={thrY} x2={W} y2={thrY} stroke={RED} strokeOpacity={0.5} strokeWidth={1.5} strokeDasharray="6 6" />
          <text x={4} y={thrY - 6} textAnchor="start" fontFamily="JetBrains Mono, monospace" fontSize={11} fill={RED} fillOpacity={0.8}>94% threshold</text>
          <path d={d} fill="none" stroke={drifting ? RED : GREEN} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${drifting ? 'rgba(229,72,77,0.35)' : 'rgba(62,207,142,0.35)'})` }} />
          {pts.length > 0 && <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={5} fill={drifting ? RED : GREEN} />}
        </svg>
        <div style={{ minHeight: 44 }}>
          {drifting && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: RED_TINT, color: RED, fontFamily: CODE, fontSize: 14, fontWeight: 700, letterSpacing: 1, opacity: alertP, transform: `translateY(${(1 - alertP) * 8}px)` }}>
              <AlertTriangle size={15} strokeWidth={2.2} color={RED} />drift detected
            </div>
          )}
          {!drifting && frame >= start + 10 && (
            <div style={{ fontFamily: CODE, fontSize: 13, color: INK_3 }}>within threshold</div>
          )}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 14, fontFamily: CODE, fontSize: 13, letterSpacing: 1, color: INK_3 }}>
          <span>dashboards</span><span>·</span><span>alerts</span><span>·</span><span>label audits</span>
        </div>
      </div>
    </Card>
  );
};

// ── Connectors ────────────────────────────────────────────────────────────────
const Forward: React.FC<{ frame: number; i: number; at: number }> = ({ frame, i, at }) => {
  const x1 = XS[i] + CW;
  const x2 = XS[i + 1];
  const p = itp(frame, at, at + 12);
  if (frame < at) return null;
  return (
    <>
      <div style={{ position: 'absolute', left: x1, top: MID_Y - 1, width: (x2 - x1 - 14) * p, height: 2, background: LINE_2 }} />
      <ArrowRight size={22} strokeWidth={2} color={LINE_2} style={{ position: 'absolute', left: x2 - 20, top: MID_Y - 11, opacity: p >= 1 ? 1 : 0 }} />
    </>
  );
};

/** Return path: monitor bottom → down → left → up into train bottom, with a traveling chip. */
const ReturnLoop: React.FC<{ frame: number }> = ({ frame }) => {
  const sx = XS[3] + CW / 2;
  const ex = XS[1] + CW / 2;
  const y0 = CY + CH;
  const draw = itp(frame, T_RETRAIN - 6, T_RETRAIN + 10);
  if (frame < T_RETRAIN - 6) return null;
  const L1 = LOOP_Y - y0, L2 = sx - ex, L3 = LOOP_Y - y0;
  const total = L1 + L2 + L3;
  const d = `M${sx},${y0} L${sx},${LOOP_Y} L${ex},${LOOP_Y} L${ex},${y0 + 6}`;

  const travels: { from: number; to: number }[] = [
    { from: T_RETRAIN, to: T_RETRAIN_ARRIVE },
    { from: T_RETRAIN2, to: T_RETRAIN2_ARRIVE },
  ];
  const chips = travels.map((t, i) => {
    if (frame < t.from || frame > t.to + 6) return null;
    const p = easeInOut(itp(frame, t.from, t.to));
    const dist = p * total;
    let x = sx, y = y0;
    if (dist <= L1) { y = y0 + dist; }
    else if (dist <= L1 + L2) { y = LOOP_Y; x = sx - (dist - L1); }
    else { x = ex; y = LOOP_Y - (dist - L1 - L2); }
    const fade = 1 - itp(frame, t.to, t.to + 6);
    return (
      <div key={i} style={{
        position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', opacity: fade,
        display: 'inline-flex', alignItems: 'center', gap: 8, background: INK, color: PAPER, fontFamily: CODE, fontSize: 15, fontWeight: 700, letterSpacing: 1,
        padding: '8px 14px', borderRadius: 999, boxShadow: SHADOW, whiteSpace: 'nowrap',
      }}>
        <RefreshCw size={14} strokeWidth={2.2} color={GREEN} style={{ transform: `rotate(${p * 720}deg)` }} />retrain · v{i + 2}
      </div>
    );
  });

  return (
    <>
      <svg style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, overflow: 'visible', pointerEvents: 'none' }}>
        <path d={d} fill="none" stroke={INK_3} strokeWidth={2} strokeDasharray="8 8" pathLength={1} style={{ strokeDashoffset: 0 }} strokeOpacity={0.9}
          // draw-on via a second pathLength trick
        />
        <path d={d} fill="none" stroke={PAPER} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={-draw} style={{ opacity: draw < 1 ? 1 : 0 }} />
        <polygon points={`${ex - 8},${y0 + 18} ${ex + 8},${y0 + 18} ${ex},${y0 + 4}`} fill={INK_3} opacity={draw >= 1 ? 1 : 0} />
      </svg>
      <div style={{ position: 'absolute', left: (sx + ex) / 2, top: LOOP_Y + 14, transform: 'translateX(-50%)', fontFamily: CODE, fontSize: 13, letterSpacing: 2, color: INK_3, textTransform: 'uppercase', opacity: draw }}>
        back to the start
      </div>
      {chips}
    </>
  );
};

// ── Stage strip + cycle counter (bottom band) ─────────────────────────────────
const STAGES = ['collect', 'train', 'host', 'monitor', 'drift', 'retrain'] as const;
const stageAt = (i: number) => [T_COLLECT + 4, T_TRAIN + 4, T_HOST + 4, T_MONITOR + 4, T_DRIFT + 12, T_RETRAIN][i];

const StageStrip: React.FC<{ frame: number }> = ({ frame }) => {
  const cycles = frame >= T_RETRAIN2_ARRIVE ? 2 : frame >= T_RETRAIN_ARRIVE ? 1 : 0;
  const cp = sp(frame, cycles === 2 ? T_RETRAIN2_ARRIVE : T_RETRAIN_ARRIVE);
  const secondPass = frame >= T_RETRAIN_ARRIVE;
  return (
    <div style={{ position: 'absolute', left: 100, top: STRIP_Y, width: 1720, display: 'flex', alignItems: 'center', gap: 18 }}>
      <div style={{ width: 120, fontFamily: CODE, fontSize: 13, letterSpacing: 2, color: INK_3, textTransform: 'uppercase' }}>pipeline</div>
      <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
        {STAGES.map((s, i) => {
          const at = stageAt(i);
          // relight train/host/monitor on each retrain cycle
          const relit = secondPass && i >= 1 && i <= 3
            ? sp(frame, (frame >= T_RETRAIN2_ARRIVE ? T_RETRAIN2_ARRIVE : T_RETRAIN_ARRIVE) + (i - 1) * 8)
            : 0;
          const lit = frame >= at;
          const isDrift = s === 'drift';
          const isRetrain = s === 'retrain';
          const p = lit ? sp(frame, at) : 0;
          const pulse = isDrift ? (frame >= T_DRIFT2 + 12 ? sp(frame, T_DRIFT2 + 12) : sp(frame, T_DRIFT + 12)) : isRetrain ? (frame >= T_RETRAIN2 ? sp(frame, T_RETRAIN2) : sp(frame, T_RETRAIN)) : 0;
          const bg = !lit ? PAPER : isDrift ? RED_TINT : isRetrain ? INK : GREEN_TINT;
          const color = !lit ? LINE_2 : isDrift ? RED : isRetrain ? PAPER : GREEN_INK;
          return (
            <React.Fragment key={s}>
              {i > 0 && <ArrowRight size={16} strokeWidth={2} color={lit ? INK_3 : LINE} />}
              <div style={{
                flex: 1, height: 46, borderRadius: 10, border: `1px solid ${!lit ? LINE : isDrift ? 'rgba(229,72,77,0.4)' : isRetrain ? INK : GREEN_LINE}`,
                background: bg, color, fontFamily: CODE, fontSize: 15, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: `scale(${1 + (lit ? 0.06 * (1 - p) : 0) + 0.05 * relit * (1 - relit) * 4 + (isDrift || isRetrain ? 0.05 * pulse * (1 - pulse) * 4 : 0)})`,
                boxShadow: relit > 0 && relit < 1 ? '0 0 0 3px rgba(62,207,142,0.25)' : 'none',
              }}>
                {s}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ width: 200, textAlign: 'right', display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 10 }}>
        <span style={{ fontFamily: CODE, fontWeight: 700, fontSize: 44, lineHeight: 1, color: cycles > 0 ? INK : INK_3, transform: `scale(${1 + 0.2 * cp * (1 - cp) * 4})`, display: 'inline-block' }}>{cycles}</span>
        <span style={{ fontFamily: CODE, fontSize: 13, letterSpacing: 2, color: INK_3, textTransform: 'uppercase' }}>retrains</span>
      </div>
    </div>
  );
};

export const MlPipelineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const endFade = 1 - itp(frame, ML_PIPELINE_DURATION - 10, ML_PIPELINE_DURATION);
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER, overflow: 'hidden', fontFamily: UI }}>
      <div style={DOT_GRID} />
      <div style={{ position: 'absolute', inset: 0, opacity: endFade }}>
        <Caption segs={[{ t: 'You collect thousands of ' }, { t: 'labeled examples', hi: true }, { t: '.' }]} frame={frame} at={T_COLLECT} until={T_TRAIN - 2} />
        <Caption segs={[{ t: 'You ' }, { t: 'train', hi: true }, { t: ' a model.' }]} frame={frame} at={T_TRAIN} until={T_HOST - 2} />
        <Caption segs={[{ t: 'You ' }, { t: 'host', hi: true }, { t: ' it.' }]} frame={frame} at={T_HOST} until={T_MONITOR - 2} />
        <Caption segs={[{ t: 'You ' }, { t: 'monitor', hi: true }, { t: ' it.' }]} frame={frame} at={T_MONITOR} until={T_DRIFT - 2} />
        <Caption segs={[{ t: 'It ' }, { t: 'drifts', color: RED }, { t: ',' }]} frame={frame} at={T_DRIFT} until={T_RETRAIN - 2} />
        <Caption segs={[{ t: 'you ' }, { t: 'retrain', hi: true }, { t: ' it.' }]} frame={frame} at={T_RETRAIN} until={T_DRIFT2 - 2} />
        <Caption segs={[{ t: 'It drifts. You retrain it. ' }, { t: 'Again', color: RED }, { t: '.' }]} frame={frame} at={T_DRIFT2} />

        <CollectCard frame={frame} />
        {frame >= T_TRAIN && <TrainCard frame={frame} />}
        {frame >= T_HOST && <HostCard frame={frame} />}
        {frame >= T_MONITOR && <MonitorCard frame={frame} />}

        <Forward frame={frame} i={0} at={T_TRAIN - 8} />
        <Forward frame={frame} i={1} at={T_HOST - 8} />
        <Forward frame={frame} i={2} at={T_MONITOR - 8} />
        <ReturnLoop frame={frame} />

        <StageStrip frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
