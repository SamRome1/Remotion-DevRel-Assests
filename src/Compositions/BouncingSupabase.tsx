import React from 'react';
import { AbsoluteFill, useCurrentFrame, Img, staticFile } from 'remotion';
import { loadFont, fontFamily } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['600'] });

const WIDTH = 1920;
const HEIGHT = 1080;
const LOGO_W = 240;
const LOGO_H = 240;
const TEXT_H = 52; // height reserved for the "Supabase" label
const BLOCK_H = LOGO_H + TEXT_H;
// Loop math: D=600 frames, x completes 2 full cycles, y completes 3 full cycles.
// maxX = 1680, maxY = 788 (HEIGHT - BLOCK_H).
// SPEED = 2 * max * cycles / D  →  both axes return to 0 at frame 600.
// totalBounces = 2*(2+3) = 10. HUE_STEP=36° → 10*36=360° → colors also loop.
const LOOP_FRAMES = 600;
const SPEED_X = (2 * (WIDTH - LOGO_W) * 2) / LOOP_FRAMES;       // 11.2
const SPEED_Y = (2 * (HEIGHT - BLOCK_H) * 3) / LOOP_FRAMES;     // ~7.88

const SUPABASE_BASE_HUE = 154;
const HUE_STEP = 36;

function getState(frame: number) {
  const maxX = WIDTH - LOGO_W;
  const maxY = HEIGHT - BLOCK_H;

  const periodX = (2 * maxX) / SPEED_X;
  const periodY = (2 * maxY) / SPEED_Y;

  const tX = frame % periodX;
  const tY = frame % periodY;

  // Triangle-wave position
  const x = tX < periodX / 2 ? tX * SPEED_X : 2 * maxX - tX * SPEED_X;
  const y = tY < periodY / 2 ? tY * SPEED_Y : 2 * maxY - tY * SPEED_Y;

  // Each half-period = one wall hit
  const bouncesX = Math.floor((frame / periodX) * 2);
  const bouncesY = Math.floor((frame / periodY) * 2);
  const totalBounces = bouncesX + bouncesY;

  const hueRotation = (totalBounces * HUE_STEP) % 360;
  const currentHue = (SUPABASE_BASE_HUE + hueRotation) % 360;

  // Flash: did a wall hit just happen (within 4 frames)?
  const framesIntoHalfX = tX < periodX / 2 ? tX : tX - periodX / 2;
  const framesIntoHalfY = tY < periodY / 2 ? tY : tY - periodY / 2;
  const justHitWall = framesIntoHalfX < 4 || framesIntoHalfY < 4;

  // Corner = near both walls simultaneously
  const nearWallX = x < 14 || x > maxX - 14;
  const nearWallY = y < 14 || y > maxY - 14;
  const isCorner = nearWallX && nearWallY;

  return { x, y, hueRotation, currentHue, justHitWall, isCorner };
}

export const BouncingSupabase: React.FC = () => {
  const frame = useCurrentFrame();
  const { x, y, hueRotation, currentHue, justHitWall, isCorner } = getState(frame);

  const glowColor = `hsl(${currentHue}, 80%, 58%)`;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a0a', overflow: 'hidden' }}>

      {/* Subtle dot grid */}
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />

      {/* Wall-hit flash */}
      {justHitWall && !isCorner && (
        <AbsoluteFill style={{ backgroundColor: `${glowColor}18` }} />
      )}

      {/* Corner flash */}
      {isCorner && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at ${x < WIDTH / 2 ? '0%' : '100%'} ${y < HEIGHT / 2 ? '0%' : '100%'}, ${glowColor}44 0%, transparent 55%)`,
          }}
        />
      )}

      {/* Bouncing logo + label */}
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: LOGO_W,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          filter: `
            hue-rotate(${hueRotation}deg)
            drop-shadow(0 0 18px ${glowColor})
            drop-shadow(0 0 36px ${glowColor}99)
            ${isCorner || justHitWall ? `drop-shadow(0 0 56px ${glowColor})` : ''}
          `.trim(),
        }}
      >
        <Img
          src={staticFile('SupabaseIcon.png')}
          style={{
            width: LOGO_W,
            height: LOGO_H,
            objectFit: 'contain',
            imageRendering: 'auto',
          }}
        />
        <span
          style={{
            fontFamily,
            fontWeight: 600,
            fontSize: 36,
            color: '#ffffff',
            letterSpacing: '-0.5px',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          Supabase
        </span>
      </div>
    </AbsoluteFill>
  );
};
