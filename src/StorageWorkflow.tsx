import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

const DARK = '#1e1e2e';
const GRAY_ARROW = '#9a9a9a';
const GREEN_FILL = '#c8e6c9';
const GREEN_STROKE = '#43a870';
const SKETCH_FONT = "'Caveat', 'Comic Sans MS', cursive";

function itp(frame: number, a: number, b: number, from = 0, to = 1) {
  return interpolate(frame, [a, b], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

export const StorageWorkflow: React.FC = () => {
  const frame = useCurrentFrame();

  // All static elements fade in quickly
  const allOp = itp(frame, 0, 22);

  // Arrow 1 (App → Upload): 18–60
  const a1 = itp(frame, 18, 62);
  const A1_X1 = 492;
  const A1_LEN = 120;

  // Arrow 2 (Upload → Supabase): 52–96
  const a2 = itp(frame, 52, 98);
  const A2_X1 = 1014;
  const A2_LEN = 232;

  // Arrow 3 (Users → Supabase, curved): 88–158
  const a3 = itp(frame, 88, 160);
  // M 825 835  C 825 685, 1040 540, 1248 488  — approx length 640
  const A3_PATH = 'M 825 835 C 825 685, 1040 540, 1248 488';
  const A3_LEN = 640;

  return (
    <AbsoluteFill style={{ backgroundColor: '#ffffff' }}>
      <svg
        viewBox="0 0 1920 1080"
        width={1920}
        height={1080}
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          {/* Hand-drawn displacement filter – position-based, stays stable per frame */}
          <filter id="sk" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.038"
              numOctaves="4"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2.4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Dot-grid background pattern (Excalidraw default) */}
          <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="14" r="0.75" fill="#c4c4c4" />
          </pattern>
        </defs>

        {/* ── Dot-grid background ─────────────────────────────── */}
        <rect width="1920" height="1080" fill="url(#dots)" />

        {/* ════════ STATIC ELEMENTS (appear together) ════════ */}
        <g opacity={allOp} filter="url(#sk)">

          {/* ───── LAPTOP ───── */}
          {/* Outer monitor frame */}
          <rect x="90" y="294" width="398" height="276" rx="8"
            fill="white" stroke={DARK} strokeWidth="2.5" />
          {/* Browser chrome strip */}
          <rect x="100" y="304" width="378" height="30" rx="4"
            fill="#f2f2f2" stroke={DARK} strokeWidth="1.5" />
          {/* Traffic-light buttons */}
          <circle cx="116" cy="319" r="6" fill="#ff6059" stroke={DARK} strokeWidth="1.2" />
          <circle cx="132" cy="319" r="6" fill="#ffbd2e" stroke={DARK} strokeWidth="1.2" />
          <circle cx="148" cy="319" r="6" fill="#28c840" stroke={DARK} strokeWidth="1.2" />
          {/* URL bar */}
          <rect x="162" y="311" width="220" height="16" rx="3"
            fill="white" stroke="#c8c8c8" strokeWidth="1" />
          <text x="272" y="323" textAnchor="middle"
            fontSize="11" fontFamily={SKETCH_FONT} fill="#aaa">SimpleApp.com</text>
          {/* Page content lines */}
          {[354, 370, 384, 398, 412].map((y, i) => (
            <rect key={i} x={100} y={y}
              width={[290, 340, 268, 316, 252][i]} height={9} rx="2"
              fill={['#e2e2e2', '#ebebeb', '#ebebeb', '#ebebeb', '#ebebeb'][i]} />
          ))}
          {/* Upload CTA in browser */}
          <rect x="100" y="432" width="160" height="30" rx="4"
            fill={GREEN_FILL} stroke={GREEN_STROKE} strokeWidth="2" />
          <text x="180" y="452" textAnchor="middle"
            fontSize="18" fontWeight="bold" fontFamily={SKETCH_FONT} fill="#1b5e3a">↑ Upload</text>

          {/* Laptop base */}
          <path d="M 68 572  L 520 572  L 490 614  L 98 614 Z"
            fill="#ececec" stroke={DARK} strokeWidth="2.5" />
          {/* Trackpad */}
          <rect x="224" y="582" width="130" height="22" rx="4"
            fill="none" stroke={DARK} strokeWidth="1.8" />

          {/* Label */}
          <text x="294" y="656" textAnchor="middle"
            fontSize="30" fontFamily={SKETCH_FONT} fill={DARK}>Simple App</text>


          {/* ───── UPLOAD MODAL ───── */}
          {/* Dashed border box */}
          <rect x="622" y="286" width="386" height="292" rx="6"
            fill="white" stroke={DARK} strokeWidth="2.5" strokeDasharray="14 7" />

          {/* Video icon (circle with play) */}
          <circle cx="680" cy="350" r="38"
            fill="#f4f4f4" stroke={DARK} strokeWidth="2" />
          <circle cx="680" cy="350" r="24"
            fill="#e0e0e0" stroke={DARK} strokeWidth="1.5" />
          <polygon points="672,342 672,358 694,350" fill={DARK} />
          <text x="680" y="408" textAnchor="middle"
            fontSize="16" fontFamily={SKETCH_FONT} fill={DARK}>Video 1</text>

          {/* Image icon */}
          <rect x="728" y="318" width="82" height="65" rx="4"
            fill="#f4f4f4" stroke={DARK} strokeWidth="2" />
          <path d="M 736 374  L 758 350  L 780 365  L 798 350  L 804 374 Z"
            fill="#d0d0d0" />
          <circle cx="798" cy="332" r="8" fill="#fde68a" stroke={DARK} strokeWidth="1.5" />
          <text x="769" y="408" textAnchor="middle"
            fontSize="16" fontFamily={SKETCH_FONT} fill={DARK}>Image 1</text>

          {/* Add More box */}
          <rect x="826" y="318" width="68" height="65" rx="4"
            fill="#f4f4f4" stroke={DARK} strokeWidth="1.5" strokeDasharray="5 3" />
          <text x="860" y="360" textAnchor="middle"
            fontSize="32" fontFamily={SKETCH_FONT} fill={DARK}>+</text>
          <text x="860" y="408" textAnchor="middle"
            fontSize="16" fontFamily={SKETCH_FONT} fill={DARK}>Add More</text>

          {/* PHOTO / VIDEO tab buttons */}
          <rect x="628" y="432" width="154" height="40" rx="4"
            fill="#e2e2e2" stroke={DARK} strokeWidth="2" />
          <text x="705" y="458" textAnchor="middle"
            fontSize="22" fontWeight="bold" fontFamily={SKETCH_FONT} fill={DARK}>PHOTO</text>
          <rect x="796" y="432" width="154" height="40" rx="4"
            fill="#e2e2e2" stroke={DARK} strokeWidth="2" />
          <text x="873" y="458" textAnchor="middle"
            fontSize="22" fontWeight="bold" fontFamily={SKETCH_FONT} fill={DARK}>VIDEO</text>

          {/* Upload button */}
          <rect x="658" y="496" width="270" height="48" rx="22"
            fill={GREEN_FILL} stroke={GREEN_STROKE} strokeWidth="2.5" />
          <text x="793" y="527" textAnchor="middle"
            fontSize="26" fontWeight="bold" fontFamily={SKETCH_FONT} fill="#1b5e3a">Upload</text>


          {/* ───── SUPABASE CYLINDER ───── */}
          {/* Label row */}
          <text x="1355" y="268" textAnchor="middle"
            fontSize="34" fontWeight="bold" fontFamily={SKETCH_FONT} fill={DARK}>SUPABASE ⚡</text>

          {/* Top ellipse */}
          <ellipse cx="1355" cy="316" rx="106" ry="30"
            fill={GREEN_FILL} stroke={GREEN_STROKE} strokeWidth="2.5" />
          {/* Side walls */}
          <line x1="1249" y1="316" x2="1249" y2="538" stroke={GREEN_STROKE} strokeWidth="2.5" />
          <line x1="1461" y1="316" x2="1461" y2="538" stroke={GREEN_STROKE} strokeWidth="2.5" />
          {/* Body fill (between the two side lines) */}
          <rect x="1249" y="316" width="212" height="222" fill={GREEN_FILL} />
          {/* Bottom ellipse drawn over body fill */}
          <ellipse cx="1355" cy="538" rx="106" ry="30"
            fill={GREEN_FILL} stroke={GREEN_STROKE} strokeWidth="2.5" />
          {/* Re-draw side walls on top of fill */}
          <line x1="1249" y1="316" x2="1249" y2="538" stroke={GREEN_STROKE} strokeWidth="2.5" />
          <line x1="1461" y1="316" x2="1461" y2="538" stroke={GREEN_STROKE} strokeWidth="2.5" />
          {/* Segment dividers (wavy lines suggesting stacked cylinders) */}
          <path d="M 1249 388  Q 1355 405, 1461 388"
            fill="none" stroke={GREEN_STROKE} strokeWidth="1.5" strokeDasharray="6 3" />
          <path d="M 1249 464  Q 1355 481, 1461 464"
            fill="none" stroke={GREEN_STROKE} strokeWidth="1.5" strokeDasharray="6 3" />
          {/* Right-side dots */}
          <circle cx="1450" cy="362" r="7" fill="none" stroke={GREEN_STROKE} strokeWidth="1.5" />
          <circle cx="1450" cy="432" r="7" fill="none" stroke={GREEN_STROKE} strokeWidth="1.5" />
          <circle cx="1450" cy="504" r="7" fill="none" stroke={GREEN_STROKE} strokeWidth="1.5" />
          {/* 1 GB LIMIT label */}
          <text x="1485" y="566" fontSize="22" fontFamily={SKETCH_FONT} fill={DARK}>1 GB LIMIT</text>


          {/* ───── USERS ───── */}
          {/* Speech bubble (yellow) */}
          <path d="M 704 628  Q 704 608, 726 608  L 908 608  Q 930 608, 930 628  L 930 672  Q 930 694, 908 694  L 784 694  L 764 718  L 772 694  Q 704 694, 704 672 Z"
            fill="#fde68a" stroke={DARK} strokeWidth="2" />

          {/* Person — left (back-left) */}
          <circle cx="726" cy="748" r="22" fill="#d4d4d4" stroke={DARK} strokeWidth="2" />
          <path d="M 708 773  Q 726 788, 744 773  L 741 830  Q 726 843, 711 830 Z"
            fill="#d4d4d4" stroke={DARK} strokeWidth="2" />

          {/* Person — right (back-right) */}
          <circle cx="870" cy="748" r="22" fill="#d4d4d4" stroke={DARK} strokeWidth="2" />
          <path d="M 852 773  Q 870 788, 888 773  L 885 830  Q 870 843, 855 830 Z"
            fill="#d4d4d4" stroke={DARK} strokeWidth="2" />

          {/* Person — center (front) */}
          <circle cx="798" cy="752" r="26" fill="#bebebe" stroke={DARK} strokeWidth="2.5" />
          <path d="M 775 780  Q 798 796, 821 780  L 818 840  Q 798 854, 778 840 Z"
            fill="#bebebe" stroke={DARK} strokeWidth="2.5" />
          {/* crosshatch detail on center person's body */}
          {[-14, -7, 0, 7, 14].map((dx, j) => (
            <line key={j}
              x1={798 + dx} y1={782} x2={798 + dx} y2={838}
              stroke={DARK} strokeWidth="0.7" opacity="0.22" />
          ))}

          {/* Users label */}
          <text x="798" y="888" textAnchor="middle"
            fontSize="34" fontFamily={SKETCH_FONT} fill={DARK}>Users</text>

        </g>


        {/* ════════ ANIMATED ARROWS ════════ */}

        {/* ── Arrow 1: App → Upload Modal (horizontal) ── */}
        <g filter="url(#sk)">
          {a1 > 0 && (
            <line
              x1={A1_X1}
              y1={428}
              x2={A1_X1 + A1_LEN * a1}
              y2={428}
              stroke={GRAY_ARROW}
              strokeWidth="6"
              strokeLinecap="round"
            />
          )}
          {/* Arrowhead chevron */}
          {a1 > 0.9 && (
            <path
              d={`M ${A1_X1 + A1_LEN * a1 - 22} 414
                  L ${A1_X1 + A1_LEN * a1}      428
                  L ${A1_X1 + A1_LEN * a1 - 22} 442`}
              fill="none"
              stroke={GRAY_ARROW}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>

        {/* ── Arrow 2: Upload Modal → Supabase (horizontal) ── */}
        <g filter="url(#sk)">
          {a2 > 0 && (
            <line
              x1={A2_X1}
              y1={428}
              x2={A2_X1 + A2_LEN * a2}
              y2={428}
              stroke={GRAY_ARROW}
              strokeWidth="6"
              strokeLinecap="round"
            />
          )}
          {a2 > 0.9 && (
            <path
              d={`M ${A2_X1 + A2_LEN * a2 - 22} 414
                  L ${A2_X1 + A2_LEN * a2}       428
                  L ${A2_X1 + A2_LEN * a2 - 22}  442`}
              fill="none"
              stroke={GRAY_ARROW}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>

        {/* ── Arrow 3: Users → Supabase (curved) ── */}
        <g filter="url(#sk)">
          {a3 > 0 && (
            <path
              d={A3_PATH}
              fill="none"
              stroke={GRAY_ARROW}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={A3_LEN}
              strokeDashoffset={A3_LEN * (1 - a3)}
            />
          )}
          {/* Arrowhead at destination — only appears when path nearly complete */}
          {a3 > 0.92 && (
            <path
              d="M 1232 486  L 1248 488  L 1240 502"
              fill="none"
              stroke={GRAY_ARROW}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </g>

      </svg>
    </AbsoluteFill>
  );
};
