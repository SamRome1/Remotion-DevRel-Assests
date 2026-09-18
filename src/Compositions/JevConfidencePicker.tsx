import React from 'react';
import { AbsoluteFill, Series } from 'remotion';
import { bp } from '../blueprint';
import { JevBpLlmClean } from '../scenes/JevBpLlmClean';
import { JevBpLlmGarbage } from '../scenes/JevBpLlmGarbage';
import { JevBpHandOptions } from '../scenes/JevBpHandOptions';
import { JevBpScored } from '../scenes/JevBpScored';

export const JEV_CONFIDENCE_PICKER_DURATION = 660;

export const JevConfidencePicker: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: bp.paper }}>
    <Series>
      <Series.Sequence durationInFrames={165}>
        <JevBpLlmClean />
      </Series.Sequence>
      <Series.Sequence durationInFrames={125}>
        <JevBpLlmGarbage />
      </Series.Sequence>
      <Series.Sequence durationInFrames={90}>
        <JevBpHandOptions />
      </Series.Sequence>
      <Series.Sequence durationInFrames={280}>
        <JevBpScored />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);
