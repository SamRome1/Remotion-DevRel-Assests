import React from 'react';
import { useCurrentFrame } from 'remotion';
import { Clock, Receipt } from 'lucide-react';
import { Card, Pill } from '../oneTool/Card';
import { CODE, GREEN_TINT, INK, INK_3, RED, RED_TINT, UI, sp } from '../oneTool/theme';
import {
  ANS, AppCard, BigStat, Caption, Connector, LoopWidget, PassStrip, SectionLabel, Takeaway, TimerChip, TokenFlow,
} from './parts';

export const LLM_HALF_DURATION = 420;

const TOKENS = 'Based on the sender , the shortened link , and the urgency , this email is most likely spam .'.split(' ');
const T_REQ = 50;
const T_TYPE = 80;
const FPT = 10;
const T_END = T_TYPE + TOKENS.length * FPT; // 280
const T_VERDICT = 300;
export const LLM_SECONDS = ((T_END - T_REQ - 18) / 30).toFixed(1); // timer starts when req lands
const SECONDS = LLM_SECONDS;

/** 01 — how an LLM answers: one token per full pass, looping until done. */
export const LlmHalf: React.FC = () => {
  const frame = useCurrentFrame();
  const timerStart = T_REQ + 18;
  const elapsed = Math.max(0, (Math.min(frame, T_END) - timerStart) / 30);
  const done = frame >= T_END;
  const vp = sp(frame, T_VERDICT);

  return (
    <>
      <SectionLabel n="01" title="how an llm answers" frame={frame} at={0} />
      <Caption segs={[{ t: 'Here’s what that means.' }]} frame={frame} at={0} until={48} />
      <Caption segs={[{ t: 'An LLM answers by generating ' }, { t: 'tokens', hi: true }, { t: ', one at a time.' }]} frame={frame} at={50} until={168} />
      <Caption segs={[{ t: 'Each token is a ' }, { t: 'full pass', hi: true }, { t: ' through the model.' }]} frame={frame} at={170} until={238} />
      <Caption segs={[{ t: 'Looping', hi: true }, { t: ' until it’s done.' }]} frame={frame} at={240} until={298} />
      <Caption segs={[{ t: 'That loop is why it’s ' }, { t: 'slow', color: RED }, { t: '. And why it’s ' }, { t: 'expensive', color: RED }, { t: '.' }]} frame={frame} at={300} />

      <AppCard
        frame={frame} at={4}
        questionLabel="prompt"
        question={
          <div style={{ background: GREEN_TINT, border: '1px solid rgba(62,207,142,0.35)', borderRadius: 12, padding: '14px 18px', fontSize: 23, color: INK, fontFamily: UI, opacity: sp(frame, 24) }}>
            Is this email spam? Explain your reasoning.
          </div>
        }
      />

      <Connector frame={frame} drawAt={14} travel={{ from: T_REQ, to: T_REQ + 18, label: 'req', dir: 'right' }} />
      {frame >= timerStart && (
        <TimerChip value={`${elapsed.toFixed(1)} s`} state={done ? 'slow' : 'running'} frame={frame} at={timerStart} />
      )}

      <Card {...ANS} frame={frame} at={10} title="llm" subtitle={done ? 'done' : frame >= T_TYPE ? 'generating…' : 'waiting'} collapse={false}
        right={<LoopWidget frame={frame} start={T_TYPE} fpt={FPT} total={TOKENS.length} done={done} />}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 20 }}>
          <div style={{ fontFamily: CODE, fontSize: 13, letterSpacing: 2, color: INK_3, textTransform: 'uppercase' }}>output · tokens</div>
          <TokenFlow tokens={TOKENS} frame={frame} start={T_TYPE} fpt={FPT} />
          {frame >= T_VERDICT && (
            <div style={{ marginTop: 'auto', display: 'flex', gap: 14, opacity: vp, transform: `translateY(${(1 - vp) * 12}px)` }}>
              <Pill color={RED} bg={RED_TINT} style={{ fontSize: 18, padding: '10px 16px' }}><Clock size={18} strokeWidth={2} color={RED} />slow · {SECONDS} s</Pill>
              <Pill color={RED} bg={RED_TINT} style={{ fontSize: 18, padding: '10px 16px' }}><Receipt size={18} strokeWidth={2} color={RED} />expensive · {TOKENS.length} full passes</Pill>
            </div>
          )}
        </div>
      </Card>

      <PassStrip frame={frame} at={T_TYPE - 10} total={TOKENS.length} lit={Math.min(TOKENS.length, frame < T_TYPE ? 0 : Math.floor((frame - T_TYPE) / FPT) + 1)} done={done} />

      <BigStat
        value={SECONDS} unit="s" color={RED} frame={frame} at={T_VERDICT + 6}
        sub={<Pill color={INK_3} bg="rgba(0,0,0,0.05)" style={{ fontFamily: CODE, fontSize: 18, padding: '8px 16px' }}>{TOKENS.length} passes · one token each</Pill>}
      />
      <Takeaway segs={[{ t: 'One token at a time, ' }, { t: 'looping', hi: true }, { t: ' until it’s done.' }]} frame={frame} at={T_VERDICT + 14} />
    </>
  );
};
