import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { bp, itp, stamp } from '../blueprint';
import { Frame, SectionTitle, Panel, Link, Highlight, Chip, ScoreRow } from '../Components/Blueprint';

// 1080x1080 grid: two short panels on top, the Edge Function mid-right,
// Jev full-width at the bottom. Flow: APP → TABLE → EDGE → JEV → back.
const COL_L = 80;
const COL_R = 610;
const COL_W = 390;
const TOP_Y = 160;
const TOP_H = 180;
const EDGE_Y = 430;
const EDGE_H = 140;
const JEV_Y = 650;
const JEV_H = 370;
const RX = COL_R + COL_W / 2;

const COMMENT = 'free crypto!! click bit.ly/x9 now';
const OPTIONS = ['SPAM', 'ABUSE', 'FINE'];
const SCORES = [0.91, 0.06, 0.03];

// Beat timeline (frames)
const T_TYPE = 45;
const T_ROW = 115;
const T_HOOK = 170;
const T_REQ = 250;
const T_ANSWER = 360;
const T_BACK = 405;
const T_NOTES = 470;
const T_GHOST = 515;

export const JevCmPipeline: React.FC = () => {
  const frame = useCurrentFrame();

  const typed = COMMENT.slice(0, Math.max(0, Math.floor((frame - T_TYPE) / 2)));
  const typing = frame >= T_TYPE && typed.length < COMMENT.length;
  const rowIn = frame >= T_ROW + 20;
  const verdictIn = frame >= T_BACK + 50;
  const ms = itp(frame, T_ANSWER, T_ANSWER + 12, 0, 150);
  const strike = itp(frame, T_GHOST + 12, T_GHOST + 26);

  return (
    <Frame>
      <SectionTitle n="03" title="WIRED INTO A DATABASE" frame={frame} at={0} left={COL_L} top={64} />

      {/* YOUR APP */}
      <Panel x={COL_L} y={TOP_Y} w={COL_W} h={TOP_H} pad={20} title="YOUR APP" subtitle="new comment" frame={frame} at={6}>
        <div style={{ fontSize: 26, lineHeight: 1.45, minHeight: 76 }}>
          {typed && <Highlight>{typed}</Highlight>}
          <span style={{ display: 'inline-block', width: 12, height: 26, background: bp.ink, verticalAlign: 'middle', marginLeft: 4, opacity: typing && frame % 14 < 9 ? 1 : 0 }} />
        </div>
      </Panel>

      {/* SUPABASE TABLE */}
      <Panel
        x={COL_R} y={TOP_Y} w={COL_W} h={TOP_H} pad={14}
        title="comments" subtitle="public"
        headerRight={<Img src={staticFile('assets/supabase.svg')} style={{ height: 22, objectFit: 'contain' }} />}
        frame={frame} at={10}
      >
        <div style={{ fontSize: 17, display: 'grid', gridTemplateColumns: '64px 1fr 84px', columnGap: 10, rowGap: 6 }}>
          {['id', 'body', 'status'].map((h) => (
            <div key={h} style={{ color: bp.grey, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', borderBottom: `1px solid ${bp.line}`, paddingBottom: 4 }}>{h}</div>
          ))}
          <div style={{ ...stamp(frame, T_ROW + 20), color: bp.grey }}>{rowIn ? '4821' : ''}</div>
          <div style={{ ...stamp(frame, T_ROW + 20), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rowIn ? COMMENT : ''}</div>
          <div style={{ ...stamp(frame, T_ROW + 20) }}>
            {rowIn && (verdictIn
              ? <span style={{ background: bp.redPale, color: bp.red, padding: '2px 6px', fontWeight: 700 }}>spam</span>
              : <span style={{ color: bp.grey }}>pending</span>)}
          </div>
        </div>
      </Panel>

      {/* EDGE FUNCTION */}
      <Panel x={COL_R} y={EDGE_Y} w={COL_W} h={EDGE_H} pad={14} title="EDGE FUNCTION" subtitle="moderate-comment" titleSize={20} subtitleSize={16} frame={frame} at={14}>
        <div style={{ fontSize: 19, lineHeight: 1.4, color: frame >= T_HOOK + 25 ? bp.ink : bp.grey }}>
          <span style={{ color: bp.accent }}>jev</span>.choice(body,<br />
          &nbsp;&nbsp;[<span style={{ color: frame >= T_HOOK + 25 ? bp.accent : bp.grey }}>"spam", "abuse", "fine"</span>])
        </div>
      </Panel>

      {/* JEV */}
      <Panel
        x={COL_L} y={JEV_Y} w={COL_R + COL_W - COL_L} h={JEV_H} pad={16}
        title="JEV" subtitle="your options, scored"
        headerRight={frame >= T_ANSWER ? <Chip text={`${Math.round(ms)}ms`} size={20} /> : null}
        frame={frame} at={18}
      >
        <div style={{ fontSize: 26, height: 34, marginBottom: 8, ...stamp(frame, T_REQ + 25) }}>
          {frame >= T_REQ + 25 && <Highlight>is this spam, abuse, or fine?</Highlight>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {OPTIONS.map((label, i) => (
            <ScoreRow
              key={label}
              label={label}
              fill={itp(frame, T_ANSWER + 5, T_ANSWER + 35, 0, SCORES[i])}
              score={itp(frame, T_ANSWER + 5, T_ANSWER + 35, 0, SCORES[i])}
              selected={i === 0 && frame >= T_ANSWER + 30}
              showScore={frame >= T_ANSWER + 5}
              frame={frame}
              at={30 + i * 8}
              rowH={46}
              labelW={150}
              labelH={40}
              fontSize={20}
            />
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, height: 46, position: 'relative', ...stamp(frame, T_GHOST) }}>
            <div style={{ width: 150, height: 40, border: `2px dashed ${bp.line}`, color: bp.grey, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>MAYBE?</div>
            <div style={{ flex: 1, height: 16, border: `2px dashed ${bp.line}` }} />
            <div style={{ width: 150, fontSize: 16, color: bp.grey, textAlign: 'right', whiteSpace: 'nowrap' }}>not an option</div>
            <div style={{ position: 'absolute', left: 0, top: 22, height: 2, width: `${strike * 100}%`, background: bp.red }} />
          </div>
        </div>
      </Panel>

      {/* Connectors */}
      <Link x1={COL_L + COL_W} y1={TOP_Y + TOP_H / 2} x2={COL_R} y2={TOP_Y + TOP_H / 2} frame={frame} drawAt={20}
        travel={{ from: T_ROW, to: T_ROW + 20, label: 'row' }} />
      <Link x1={RX} y1={TOP_Y + TOP_H} x2={RX} y2={EDGE_Y} frame={frame} drawAt={24}
        travel={frame < T_BACK + 25
          ? { from: T_HOOK, to: T_HOOK + 25, label: 'webhook' }
          : { from: T_BACK + 25, to: T_BACK + 50, label: 'spam', reverse: true }} />
      <Link x1={RX} y1={EDGE_Y + EDGE_H} x2={RX} y2={JEV_Y} frame={frame} drawAt={28}
        travel={frame < T_BACK
          ? { from: T_REQ, to: T_REQ + 25, label: 'req' }
          : { from: T_BACK, to: T_BACK + 25, label: 'spam', reverse: true }} />

      {/* Closing notes */}
      <div style={{ position: 'absolute', left: COL_L, top: EDGE_Y + 10, width: COL_W, fontSize: 22, lineHeight: 1.6, color: bp.inkSoft, whiteSpace: 'nowrap' }}>
        {['no parsing.', 'no retries.', 'no hallucinated 4th option.'].map((t, i) => (
          <div key={t} style={{ display: 'flex', gap: 12, ...stamp(frame, T_NOTES + i * 20) }}>
            <span style={{ color: bp.accent, fontWeight: 700 }}>+</span>
            <span>{t}</span>
          </div>
        ))}
      </div>
    </Frame>
  );
};
