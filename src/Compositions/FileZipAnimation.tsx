import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img, staticFile } from 'remotion';

// Folder dimensions
const FW = 300;
const FH = 220;
const TW = 120;
const TH = 36;
const R = 14;
const S = 5;
const FRONT = '#FFCB47';
const BACK = '#C97D0A';
const INK = '#1a1a1a';

export const FileZipAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 30;

  // BG fade in
  const bgOpacity = interpolate(frame, [0, 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Folder entrance — slides up + scales in
  const folderEntrance = spring({
    frame: frame - 15,
    fps,
    config: { damping: 14, stiffness: 150, mass: 1.1 },
  });
  const folderY = interpolate(folderEntrance, [0, 1], [380, 0]);

  // File floats in from top-right
  const fileFloat = spring({
    frame: frame - 50,
    fps,
    config: { damping: 16, stiffness: 120, mass: 0.8 },
  });
  const fileHoverX = interpolate(fileFloat, [0, 1], [520, 230]);
  const fileHoverY = interpolate(fileFloat, [0, 1], [-380, -140]);

  // File wiggle while floating
  const fileWiggle = frame >= 50 && frame < 85
    ? Math.sin(frame * 0.18) * 5
    : 0;

  // Zip: file moves into folder (85–115)
  const zipProgress = interpolate(frame, [85, 115], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fileX = interpolate(zipProgress, [0, 1], [fileHoverX, 0]);
  const fileY = interpolate(zipProgress, [0, 1], [fileHoverY, 20]);
  const fileScale = interpolate(zipProgress, [0, 0.8, 1], [1, 0.45, 0]);
  const fileOpacity = interpolate(zipProgress, [0.8, 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Folder mouth opens (78–96), closes after zip (spring from 116)
  const mouthOpen = interpolate(frame, [78, 96], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const mouthCloseSpring = spring({
    frame: frame - 116,
    fps,
    config: { damping: 11, stiffness: 220, mass: 0.8 },
  });
  const mouthClose = frame >= 116 ? mouthCloseSpring : 0;
  const mouthProgress = Math.max(0, mouthOpen - mouthClose);
  // Front face top edge slides down → opens mouth
  const mouthGap = mouthProgress * 58;

  // Bounce after close
  const bounceSpring = spring({
    frame: frame - 134,
    fps,
    config: { damping: 6, stiffness: 300, mass: 0.55 },
  });
  const bounceY = frame >= 134 ? interpolate(bounceSpring, [0, 1], [-28, 0]) : 0;
  const bounceScale = frame >= 134
    ? interpolate(bounceSpring, [0, 0.4, 1], [1.08, 0.96, 1])
    : 1;

  // Checkmark pop
  const checkSpring = spring({
    frame: frame - 144,
    fps,
    config: { damping: 11, stiffness: 220, mass: 0.7 },
  });
  const checkScale = frame >= 144 ? checkSpring : 0;
  const checkOpacity = interpolate(frame, [144, 158], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Exit: content dissolves, then BG5 fades in over BG4
  const exitOpacity = interpolate(frame, [215, 248], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bg5Opacity = interpolate(frame, [230, 260], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cx = 960;
  const cy = 570;

  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#ffffff' }}>
      {/* BG4 */}
      <Img
        src={staticFile('BG4.png')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: bgOpacity,
        }}
      />

      {/* BG5 fades in over BG4 after animation completes */}
      <Img
        src={staticFile('BG5.png')}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: bg5Opacity,
        }}
      />

      <svg width="1920" height="1080" style={{ position: 'absolute', top: 0, left: 0 }}>

        {/* ── FOLDER ── */}
        <g
          transform={`translate(${cx}, ${cy + folderY + bounceY}) scale(${bounceScale})`}
          opacity={exitOpacity}
        >
          {/* Drop shadow */}
          <rect
            x={-FW / 2 + 8}
            y={-FH / 2 + 12}
            width={FW}
            height={FH}
            rx={R}
            fill="rgba(0,0,0,0.18)"
            filter="url(#blur)"
          />

          {/* Back plate */}
          <rect
            x={-FW / 2}
            y={-FH / 2}
            width={FW}
            height={FH}
            rx={R}
            fill={BACK}
            stroke={INK}
            strokeWidth={S}
          />

          {/* Tab */}
          <path
            d={`
              M ${-FW / 2} ${-FH / 2 + R}
              L ${-FW / 2} ${-FH / 2 - TH + 10}
              Q ${-FW / 2} ${-FH / 2 - TH} ${-FW / 2 + 10} ${-FH / 2 - TH}
              L ${-FW / 2 + TW - 10} ${-FH / 2 - TH}
              Q ${-FW / 2 + TW} ${-FH / 2 - TH} ${-FW / 2 + TW} ${-FH / 2}
              L ${-FW / 2 + TW} ${-FH / 2}
              L ${-FW / 2} ${-FH / 2}
              Z
            `}
            fill={BACK}
            stroke={INK}
            strokeWidth={S}
            strokeLinejoin="round"
          />

          {/* Front face — top slides down to open mouth */}
          <rect
            x={-FW / 2}
            y={-FH / 2 + mouthGap}
            width={FW}
            height={FH - mouthGap}
            rx={R}
            fill={FRONT}
            stroke={INK}
            strokeWidth={S}
          />

          {/* Content lines on front face */}
          {[0, 1, 2].map(i => (
            <rect
              key={i}
              x={-FW / 2 + 36}
              y={-FH / 2 + 56 + i * 38 + mouthGap}
              width={FW - 72 - (i === 2 ? 80 : 0)}
              height={13}
              rx={6}
              fill={INK}
              opacity={0.13}
            />
          ))}
        </g>

        {/* ── FILE ── */}
        {frame >= 50 && frame < 120 && (
          <g
            transform={`translate(${cx + fileX}, ${cy + fileY})`}
            opacity={fileOpacity * exitOpacity}
          >
            <g transform={`rotate(${fileWiggle}) scale(${fileScale})`}>
              {/* Shadow */}
              <rect x={-57} y={-77} width={130} height={166} rx={10} fill="rgba(0,0,0,0.14)" transform="translate(6,8)" />
              {/* Body */}
              <rect x={-60} y={-80} width={130} height={166} rx={10} fill="#ffffff" stroke={INK} strokeWidth={4.5} />
              {/* Folded corner */}
              <path
                d="M 25 -80 L 70 -35 L 25 -35 Z"
                fill="#e2e2e2"
                stroke={INK}
                strokeWidth={3.5}
                strokeLinejoin="round"
              />
              {/* Content lines */}
              {[-22, 4, 28, 52, 74].map((y, i) => (
                <rect
                  key={i}
                  x={-42}
                  y={y}
                  width={i === 4 ? 46 : 88}
                  height={11}
                  rx={5.5}
                  fill={INK}
                  opacity={0.14}
                />
              ))}
            </g>
          </g>
        )}

        {/* ── CHECKMARK ── */}
        {frame >= 144 && (
          <g
            transform={`translate(${cx + 152}, ${cy + folderY + bounceY - 128}) scale(${checkScale})`}
            opacity={checkOpacity * exitOpacity}
          >
            <circle cx={0} cy={0} r={36} fill="#3ECF8E" stroke={INK} strokeWidth={4.5} />
            <path
              d="M -15 2 L -4 15 L 18 -11"
              fill="none"
              stroke="#ffffff"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* Blur filter for shadow */}
        <defs>
          <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        </defs>
      </svg>
    </AbsoluteFill>
  );
};
