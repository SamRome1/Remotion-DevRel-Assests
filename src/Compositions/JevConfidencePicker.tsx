import React from 'react';
import { AbsoluteFill, Series } from 'remotion';
import { JevTokenStream } from '../scenes/JevTokenStream';
import { JevGarbage } from '../scenes/JevGarbage';
import { JevReveal } from '../scenes/JevReveal';
import { JevPicker } from '../scenes/JevPicker';

export const JEV_CONFIDENCE_PICKER_DURATION = 660;

export const JevConfidencePicker: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#0f0f0f' }}>
    <Series>
      <Series.Sequence durationInFrames={170}>
        <JevTokenStream />
      </Series.Sequence>
      <Series.Sequence durationInFrames={120}>
        <JevGarbage />
      </Series.Sequence>
      <Series.Sequence durationInFrames={90}>
        <JevReveal />
      </Series.Sequence>
      <Series.Sequence durationInFrames={280}>
        <JevPicker />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);
