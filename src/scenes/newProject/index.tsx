import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Check, Cpu, FolderKanban, Tag, User, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../oneTool/Card';
import {
  CODE, DOT_GRID, FILL, GREEN, GREEN_INK, GREEN_TINT, INK, INK_2, INK_3, LINE, LINE_2, PAPER, SHADOW, UI,
  itp, sp, easeOut,
} from '../oneTool/theme';
import { Caption } from '../jevSinglePass/parts';

/**
 * NewProject — "…that's a whole new dataset, a whole new model, a whole new
 * project. One classifier, and a new machine learning team to go along with it."
 * Each new question grows its own full stack; teams land under every one.
 */
export const NEW_PROJECT_DURATION = 330;

// ── Beats ─────────────────────────────────────────────────────────────────────
const T_Q2 = 0;
const T_DATASET = 20;
const T_MODEL = 65;
const T_PROJECT = 110;
const T_ONE = 160;
const T_Q3 = 168;
const T_TEAM = 210;
const T_NEXT = 280;

// ── Layout ────────────────────────────────────────────────────────────────────
const CW = 400;
const GAP = 40;
const XS = [100, 100 + (CW + GAP), 100 + 2 * (CW + GAP), 100 + 3 * (CW + GAP)];
const Q_Y = 150;
const Q_H = 104;
const ROW_Y0 = 278;
const ROW_H = 96;
const ROW_GAP = 14;
const TEAM_Y = ROW_Y0 + 3 * (ROW_H + ROW_GAP) + 10; // 618
const TEAM_H = 150;
const BAND_Y = 830;

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

type Col = {
  question: string;
  qAt: number;
  rows: [number, number, number]; // dataset, model, project frames
  teamAt: number;
  labeled: number;
  weeks: number;
  ghost?: boolean;
};

const COLS: Col[] = [
  { question: 'is this email spam?', qAt: -40, rows: [-40, -40, -40], teamAt: T_TEAM, labeled: 12480, weeks: 14 },
  { question: 'is this ticket urgent?', qAt: T_Q2, rows: [T_DATASET + 4, T_MODEL + 4, T_PROJECT + 4], teamAt: T_TEAM + 8, labeled: 9640, weeks: 12 },
  { question: 'is this signup a bot?', qAt: T_Q3, rows: [T_Q3 + 10, T_Q3 + 20, T_Q3 + 30], teamAt: T_TEAM + 16, labeled: 15200, weeks: 16 },
  { question: 'next question…', qAt: T_NEXT, rows: [T_NEXT + 6, T_NEXT + 12, T_NEXT + 18], teamAt: T_NEXT + 24, labeled: 0, weeks: 0, ghost: true },
];

const Row: React.FC<{
  x: number; y: number; frame: number; at: number; icon: LucideIcon; label: string; text: string;
  value: React.ReactNode; ghost?: boolean;
}> = ({ x, y, frame, at, icon: Icon, label, text, value, ghost }) => {
  if (frame < at) return null;
  const p = sp(frame, at);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: CW, height: ROW_H,
      background: ghost ? 'transparent' : PAPER, border: `1px ${ghost ? 'dashed' : 'solid'} ${ghost ? LINE_2 : LINE}`, borderRadius: 14,
      boxShadow: ghost ? 'none' : SHADOW, padding: '0 18px', display: 'flex', alignItems: 'center', gap: 14,
      opacity: p * (ghost ? 0.7 : 1), transform: `translateY(${(1 - p) * 22}px) scale(${0.96 + 0.04 * p})`, fontFamily: UI,
    }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: ghost ? FILL : GREEN_TINT, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 46px' }}>
        <Icon size={22} strokeWidth={1.8} color={ghost ? INK_3 : GREEN_INK} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: CODE, fontSize: 12, letterSpacing: 2, color: INK_3, textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: ghost ? INK_3 : INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>
      </div>
      <div style={{ fontFamily: CODE, fontSize: 13, color: ghost ? LINE_2 : INK_2, whiteSpace: 'nowrap', textAlign: 'right' }}>{value}</div>
    </div>
  );
};

const Column: React.FC<{ col: Col; x: number; frame: number; index: number }> = ({ col, x, frame, index }) => {
  const g = col.ghost;
  const [dAt, mAt, pAt] = col.rows;
  const labeled = g ? 0 : easeOut(itp(frame, dAt + 4, dAt + (index === 1 ? 40 : 18))) * col.labeled;
  const modelReady = frame >= mAt + (index === 1 ? 34 : 14);
  const outlined = !g && frame >= T_ONE + index * 8;
  const op = outlined ? sp(frame, T_ONE + index * 8) : 0;
  const teamIn = frame >= col.teamAt;
  const tp = teamIn ? sp(frame, col.teamAt) : 0;

  return (
    <>
      {/* one classifier outline around the three rows */}
      {outlined && (
        <div style={{
          position: 'absolute', left: x - 12, top: ROW_Y0 - 12, width: CW + 24, height: 3 * ROW_H + 2 * ROW_GAP + 24, borderRadius: 22,
          border: `2px solid rgba(62,207,142,${0.25 + 0.4 * op})`, background: `rgba(62,207,142,${0.04 * op})`, opacity: op,
        }}>
          <div style={{
            position: 'absolute', right: 16, top: -12, background: GREEN, color: '#0B3B26', fontFamily: CODE, fontSize: 13, fontWeight: 700, letterSpacing: 1.5,
            padding: '5px 12px', borderRadius: 999, textTransform: 'uppercase', transform: `scale(${0.8 + 0.2 * op})`, boxShadow: '0 0 14px rgba(62,207,142,0.4)',
          }}>= 1 classifier</div>
        </div>
      )}

      {/* question */}
      {frame >= col.qAt && (
        g ? (
          <div style={{
            position: 'absolute', left: x, top: Q_Y, width: CW, height: Q_H, border: `1px dashed ${LINE_2}`, borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: UI, fontSize: 22, fontWeight: 600, color: INK_3,
            opacity: sp(frame, col.qAt) * 0.8,
          }}>{col.question}</div>
        ) : (
          <Card x={x} y={Q_Y} w={CW} h={Q_H} frame={frame} at={col.qAt} title={`question 0${index + 1}`} collapse={false} pad={16}>
            <div style={{ fontFamily: UI, fontSize: 22, fontWeight: 600, color: INK, whiteSpace: 'nowrap' }}>{col.question}</div>
          </Card>
        )
      )}

      <Row x={x} y={ROW_Y0} frame={frame} at={dAt} icon={Tag} label="whole new dataset" text={g ? 'labeled examples' : `${fmt(labeled)} labeled`} ghost={g}
        value={g ? '—' : frame < dAt + 30 && index === 1 ? 'labeling…' : '6 weeks'} />
      <Row x={x} y={ROW_Y0 + ROW_H + ROW_GAP} frame={frame} at={mAt} icon={Cpu} label="whole new model" text={g ? 'train · host · monitor' : modelReady ? `v1 · ${index === 0 ? '96.2' : index === 1 ? '94.8' : '97.1'}%` : 'training…'} ghost={g}
        value={g ? '—' : modelReady ? <span style={{ color: GREEN_INK, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Check size={13} strokeWidth={2.5} color={GREEN_INK} />deployed</span> : `epoch ${Math.min(40, Math.floor((frame - mAt) * (index === 1 ? 1.2 : 3)))}/40`} />
      <Row x={x} y={ROW_Y0 + 2 * (ROW_H + ROW_GAP)} frame={frame} at={pAt} icon={FolderKanban} label="whole new project" text={g ? 'roadmap · on-call · retrains' : `${col.weeks}-week roadmap`} ghost={g}
        value={g ? '—' : 'on-call'} />

      {/* team */}
      {teamIn && (
        <div style={{
          position: 'absolute', left: x, top: TEAM_Y, width: CW, height: TEAM_H, borderRadius: 16,
          background: g ? 'transparent' : INK, border: g ? `1px dashed ${LINE_2}` : 'none', boxShadow: g ? 'none' : '0 18px 50px rgba(0,0,0,0.18)',
          padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: UI,
          opacity: tp * (g ? 0.7 : 1), transform: `translateY(${(1 - tp) * 26}px) scale(${0.96 + 0.04 * tp})`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: CODE, fontSize: 12, letterSpacing: 2, color: g ? INK_3 : 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
              <Users size={16} strokeWidth={2} color={g ? INK_3 : GREEN} />new ml team
            </div>
            <div style={{ fontFamily: CODE, fontSize: 13, color: g ? INK_3 : GREEN, fontWeight: 700 }}>{g ? '—' : '4 engineers'}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {[0, 1, 2, 3].map((i) => {
              const ap = sp(frame, col.teamAt + 6 + i * 4);
              return (
                <div key={i} style={{
                  width: 54, height: 54, borderRadius: 27, background: g ? FILL : 'rgba(255,255,255,0.1)', border: `2px solid ${g ? LINE_2 : 'rgba(62,207,142,0.55)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ap, transform: `scale(${0.6 + 0.4 * ap})`,
                }}>
                  <User size={26} strokeWidth={1.8} color={g ? INK_3 : PAPER} />
                </div>
              );
            })}
            <div style={{ marginLeft: 'auto', fontFamily: UI, fontSize: 18, fontWeight: 600, color: g ? INK_3 : PAPER, textAlign: 'right', lineHeight: 1.2 }}>
              {g ? 'hire again' : <>ML eng · data<br />infra · on-call</>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Totals strip ──────────────────────────────────────────────────────────────
const count = (frame: number, ats: number[]) => ats.filter((a) => frame >= a).length;

const Totals: React.FC<{ frame: number }> = ({ frame }) => {
  const real = COLS.filter((c) => !c.ghost);
  const items = [
    { label: 'datasets', n: count(frame, real.map((c) => c.rows[0])), icon: Tag },
    { label: 'models', n: count(frame, real.map((c) => c.rows[1])), icon: Cpu },
    { label: 'projects', n: count(frame, real.map((c) => c.rows[2])), icon: FolderKanban },
    { label: 'ml teams', n: count(frame, real.map((c) => c.teamAt)), icon: Users },
  ];
  return (
    <>
      {items.map((it, i) => {
        const lastAt = Math.max(...real.map((c) => (i === 3 ? c.teamAt : c.rows[i])).filter((a) => a <= frame), -999);
        const bump = lastAt > -999 ? sp(frame, lastAt) : 1;
        const Icon = it.icon;
        return (
          <div key={it.label} style={{ position: 'absolute', left: XS[i], top: BAND_Y, width: CW, display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ fontFamily: CODE, fontWeight: 700, fontSize: 112, lineHeight: 1, letterSpacing: -5, color: it.n > 0 ? INK : LINE_2, transform: `scale(${1 + 0.12 * bump * (1 - bump) * 4})`, display: 'inline-block', transformOrigin: 'left center' }}>
              {it.n}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Icon size={22} strokeWidth={1.8} color={it.n > 0 ? GREEN_INK : LINE_2} />
              <div style={{ fontFamily: CODE, fontSize: 14, letterSpacing: 2, color: INK_3, textTransform: 'uppercase' }}>{it.label}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export const NewProjectScene: React.FC = () => {
  const frame = useCurrentFrame();
  const endFade = 1 - itp(frame, NEW_PROJECT_DURATION - 10, NEW_PROJECT_DURATION);
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER, overflow: 'hidden', fontFamily: UI }}>
      <div style={DOT_GRID} />
      <div style={{ position: 'absolute', inset: 0, opacity: endFade }}>
        <Caption segs={[{ t: 'The ' }, { t: 'next question', hi: true }, { t: '…' }]} frame={frame} at={0} until={T_DATASET - 2} />
        <Caption segs={[{ t: 'A whole new ' }, { t: 'dataset', hi: true }, { t: '.' }]} frame={frame} at={T_DATASET} until={T_MODEL - 2} />
        <Caption segs={[{ t: 'A whole new ' }, { t: 'model', hi: true }, { t: '.' }]} frame={frame} at={T_MODEL} until={T_PROJECT - 2} />
        <Caption segs={[{ t: 'A whole new ' }, { t: 'project', hi: true }, { t: '.' }]} frame={frame} at={T_PROJECT} until={T_ONE - 2} />
        <Caption segs={[{ t: 'One classifier', hi: true }, { t: ',' }]} frame={frame} at={T_ONE} until={T_TEAM - 2} />
        <Caption segs={[{ t: 'and a new ' }, { t: 'machine learning team', hi: true }, { t: ' to go along with it.' }]} frame={frame} at={T_TEAM} />

        {COLS.map((c, i) => <Column key={c.question} col={c} x={XS[i]} frame={frame} index={i} />)}
        <Totals frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
