import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { colors, fonts } from '../theme';

/** Contact sheet: every downloaded logo on pure black, for visual verification. */
export const ASSET_FILES = [
  'openai.svg',
  'react.svg',
  'nextjs.svg',
  'typescript.svg',
  'rust.svg',
  'python.svg',
  'kubernetes.svg',
  'azure.svg',
  'postgresql.svg',
  'github.svg',
  'supabase.svg',
];

export const AssetCheck: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: colors.bg,
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 24,
      padding: 60,
      alignContent: 'center',
    }}
  >
    {ASSET_FILES.map((f) => (
      <div
        key={f}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          padding: 24,
        }}
      >
        <Img src={staticFile(`assets/${f}`)} style={{ width: 120, height: 120, objectFit: 'contain' }} />
        <div style={{ fontFamily: fonts.mono, fontSize: 16, color: colors.textSecondary }}>{f}</div>
      </div>
    ))}
  </AbsoluteFill>
);
