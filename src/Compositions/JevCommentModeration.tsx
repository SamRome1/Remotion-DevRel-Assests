import React from 'react';
import { AbsoluteFill } from 'remotion';
import { bp } from '../blueprint';
import { JevCmPipeline } from '../scenes/JevCmPipeline';

export const JEV_COMMENT_MODERATION_DURATION = 600;

export const JevCommentModeration: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: bp.paper }}>
    <JevCmPipeline />
  </AbsoluteFill>
);
