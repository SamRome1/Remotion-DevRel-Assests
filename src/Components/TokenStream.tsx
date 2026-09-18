import React from 'react';
import { MONO, FG, WARNING, sp } from '../tokens';

const WORD_BANK = [
  'the', 'system', 'processes', 'each', 'request', 'and', 'returns', 'a', 'ranked',
  'response', 'based', 'on', 'prior', 'context', 'before', 'moving', 'to', 'the',
  'next', 'step', 'in', 'the', 'pipeline', 'while', 'tracking', 'likelihood', 'across',
  'every', 'possible', 'branch', 'of', 'the', 'decision', 'tree', 'as', 'it', 'keeps',
  'generating', 'output', 'one', 'piece', 'at', 'a', 'time', 'without', 'knowing',
  'what', 'comes', 'after', 'this', 'exact', 'word',
];

const GLYPHS = '!@#$%^&*<>?/\\|~ZQXJ0134';

const scramble = (word: string, seed: number): string => {
  const chars = word.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const v = Math.abs(Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453) % 1;
    const j = Math.floor(v * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars
    .map((c, i) => {
      const g = Math.abs(Math.sin(seed * 4.51 + i * 17.3)) % 1;
      return g > 0.65 ? GLYPHS[Math.floor(g * 1000) % GLYPHS.length] : c;
    })
    .join('');
};

const FRAMES_PER_TOKEN = 4;

/**
 * Token-by-token reveal. `elapsedFrames` is continuous across scenes so the
 * stream keeps growing when this component is reused in a later Sequence.
 * `corrupt` (0-1) is the per-frame probability threshold for a token
 * glitching into scrambled amber glyphs — corrupted tokens never uncorrupt.
 */
export const TokenStream: React.FC<{ elapsedFrames: number; corrupt: number }> = ({
  elapsedFrames,
  corrupt,
}) => {
  const tokenCount = Math.max(0, Math.floor(elapsedFrames / FRAMES_PER_TOKEN));

  const tokens = [];
  for (let i = 0; i < tokenCount; i++) {
    const word = WORD_BANK[i % WORD_BANK.length];
    const rand = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    const isCorrupt = rand < corrupt;

    const revealFrame = i * FRAMES_PER_TOKEN;
    const progress = sp(elapsedFrames - revealFrame);

    const jitterX = isCorrupt ? Math.sin((elapsedFrames + i * 7) * 0.8) * 3 : 0;
    const jitterY = isCorrupt ? Math.cos((elapsedFrames + i * 5) * 0.9) * 2 : 0;

    const flickerSeed = i * 97 + Math.floor(elapsedFrames / 6) * 13;

    tokens.push(
      <span
        key={i}
        style={{
          display:    'inline-block',
          fontFamily: MONO,
          fontSize:   34,
          color:      isCorrupt ? WARNING : FG,
          opacity:    progress,
          transform:  `translate(${jitterX}px, ${jitterY - (1 - progress) * 10}px) scale(${0.9 + progress * 0.1})`,
          marginRight: 14,
          textShadow: isCorrupt ? '0 0 12px rgba(245,166,35,0.5)' : 'none',
        }}
      >
        {isCorrupt ? scramble(word, flickerSeed) : word}
      </span>,
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', width: '100%', lineHeight: 1.6 }}>
      {tokens}
    </div>
  );
};
