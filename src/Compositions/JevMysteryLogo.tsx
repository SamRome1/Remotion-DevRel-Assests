import React from 'react';
import { AbsoluteFill } from 'remotion';
import { bp } from '../blueprint';
import { JevMystery } from '../scenes/JevMystery';

export const JEV_MYSTERY_LOGO_DURATION = 180;

export const JevMysteryLogo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: bp.paper }}>
    <JevMystery />
  </AbsoluteFill>
);
