import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { DOT_GRID, PAPER, UI } from '../oneTool/theme';
import { LlmHalf, LLM_HALF_DURATION } from './LlmHalf';
import { JevHalf, JEV_HALF_DURATION } from './JevHalf';

export const JEV_SINGLE_PASS_DURATION = LLM_HALF_DURATION + JEV_HALF_DURATION; // 1200

/**
 * JevSinglePass — "Here's what that means…" through "It just decides."
 * Light OneTool system; structure borrowed from JevConfidencePicker
 * (01 how an LLM answers → hard cut → 02 how Jev answers).
 */
export const JevSinglePassScene: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: PAPER, overflow: 'hidden', fontFamily: UI }}>
    <div style={DOT_GRID} />
    <Sequence from={0} durationInFrames={LLM_HALF_DURATION} layout="none">
      <LlmHalf />
    </Sequence>
    <Sequence from={LLM_HALF_DURATION} durationInFrames={JEV_HALF_DURATION} layout="none">
      <JevHalf />
    </Sequence>
  </AbsoluteFill>
);
