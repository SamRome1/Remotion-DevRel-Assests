import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  Easing,
  random,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { circularFamily } from '../fonts';
import {
  BG,
  SURFACE_75,
  SURFACE_100,
  SURFACE_200,
  SURFACE_300,
  BORDER,
  GREEN,
  GREEN_DK,
  FG,
  FG_LIGHT,
  FG_MUTED,
  MONO,
  DotGrid,
  itp,
  sp,
} from '../tokens';

// ─────────────────────────────────────────────────────────────────────────────
// CommunityWall100K — 30s Instagram Reel animatic (1080×1920 @ 30fps, 900f)
//
// Previz for the "100K on Instagram" community video. Every tile is a
// procedurally-animated placeholder "clip" — the editor swaps these for real
// footage. One continuous camera move:
//   wall ignites → dive into founder tile → lateral glides between clips →
//   fast pull-back as the wall expands → tiles dim → 100K counter payoff.
// ─────────────────────────────────────────────────────────────────────────────

const W = 1080;
const H = 1920;

// Wall geometry — 9×11 grid of 9:16 tiles; the centre 5×7 is the "core" wall
// visible at the top; the outer ring only appears during the pull-back.
const TILE_W = 360;
const TILE_H = 640;
const GAP = 16;
const STEP_X = TILE_W + GAP;
const STEP_Y = TILE_H + GAP;
const COLS = 9;
const ROWS = 11;

const tcx = (c: number) => c * STEP_X + TILE_W / 2;
const tcy = (r: number) => r * STEP_Y + TILE_H / 2;

// Hero tiles the camera visits (col, row)
const FOUNDER = { c: 4, r: 5 }; // exact centre of the wall
const HERO_B = { c: 3, r: 5 }; // meetup
const HERO_C = { c: 3, r: 6 }; // stage talk
const HERO_D = { c: 5, r: 6 }; // hackathon

const CORE = { c0: 2, c1: 6, r0: 2, r1: 8 };
const CENTER = { x: tcx(4), y: tcy(5) };

// Timeline (frames)
const T = {
  popEnd: 95,
  dive1: 105, // start zoom into founder
  hold1: 150, // founder fullscreen
  slide2: 285,
  hold2: 318,
  slide3: 385,
  hold3: 418,
  slide4: 485,
  hold4: 518,
  pull: 585, // pull-back begins
  wide: 685, // fully wide
  dim: 690, // wall dims to backdrop
  count: 700, // counter starts
  snap: 778, // 100,000 → "100K" snap
  fadeOut: 870,
  end: 900,
};

const CITIES = [
  'SINGAPORE', 'BERLIN', 'SÃO PAULO', 'LAGOS', 'TOKYO', 'AUSTIN',
  'LONDON', 'BANGALORE', 'SEOUL', 'AMSTERDAM', 'NAIROBI', 'TORONTO',
  'PARIS', 'JAKARTA', 'MEXICO CITY', 'WARSAW', 'SYDNEY', 'TEL AVIV',
  'LISBON', 'MANILA', 'CAIRO', 'STOCKHOLM', 'HO CHI MINH', 'DENVER',
];

const CAPTIONS = [
  { s: T.hold2 + 4, e: T.slide3, big: '2,400+', small: 'meetups around the world' },
  { s: T.hold3 + 4, e: T.slide4, big: '190', small: 'countries represented' },
  { s: T.hold4 + 4, e: T.pull, big: 'millions', small: 'of projects shipped' },
];

const GREEN_GLOW = 'rgba(62, 207, 142, 0.45)';
const SILHOUETTE = '#0b0b0b';

// ── Camera ───────────────────────────────────────────────────────────────────
// One keyframed path; zoom drifts 3.0→3.07 during holds so "clips" feel alive.
const CAM_F = [0, 100, T.hold1, T.slide2, T.hold2, T.slide3, T.hold3, T.slide4, T.hold4, T.pull, T.wide, T.end];
const CAM_X = [CENTER.x, CENTER.x, tcx(FOUNDER.c), tcx(FOUNDER.c), tcx(HERO_B.c), tcx(HERO_B.c), tcx(HERO_C.c), tcx(HERO_C.c), tcx(HERO_D.c), tcx(HERO_D.c), CENTER.x, CENTER.x];
const CAM_Y = [CENTER.y, CENTER.y, tcy(FOUNDER.r), tcy(FOUNDER.r), tcy(HERO_B.r), tcy(HERO_B.r), tcy(HERO_C.r), tcy(HERO_C.r), tcy(HERO_D.r), tcy(HERO_D.r), CENTER.y, CENTER.y];
const CAM_Z = [0.55, 0.62, 3.0, 3.07, 3.0, 3.07, 3.0, 3.07, 3.0, 3.07, 0.33, 0.31];

const camEase = Easing.inOut(Easing.cubic);
const useCamera = (f: number) => ({
  cx: interpolate(f, CAM_F, CAM_X, { easing: camEase, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  cy: interpolate(f, CAM_F, CAM_Y, { easing: camEase, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  zoom: interpolate(f, CAM_F, CAM_Z, { easing: camEase, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
});

// ── Fake-footage scenes ──────────────────────────────────────────────────────
// Each scene is a 360×640 procedural loop. `seed` desyncs siblings.

const sceneLabel: React.CSSProperties = {
  position: 'absolute',
  bottom: 16,
  left: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  fontFamily: circularFamily,
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: 2,
  color: FG_LIGHT,
};

const Head: React.FC<{ x: number; y: number; r: number; bob: number }> = ({ x, y, r, bob }) => (
  <div
    style={{
      position: 'absolute',
      left: x - r,
      top: y - r + bob,
      width: r * 2,
      height: r * 2.6,
      borderRadius: `${r}px ${r}px ${r * 0.5}px ${r * 0.5}px`,
      background: SILHOUETTE,
      borderTop: '1.5px solid rgba(255,255,255,0.07)',
    }}
  />
);

// Meetup crowd facing a lit stage
const CrowdScene: React.FC<{ f: number; seed: number }> = ({ f, seed }) => {
  const rows = [
    { y: 400, r: 17, n: 7 },
    { y: 462, r: 21, n: 6 },
    { y: 532, r: 26, n: 5 },
    { y: 612, r: 32, n: 4 },
  ];
  const greenStage = seed > 0.45;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: greenStage
            ? 'radial-gradient(ellipse 130% 55% at 50% -5%, rgba(62,207,142,0.30), transparent 68%)'
            : 'radial-gradient(ellipse 130% 55% at 50% -5%, rgba(255,255,255,0.20), transparent 68%)',
        }}
      />
      {/* stage screen */}
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 70,
          width: 180,
          height: 105,
          borderRadius: 8,
          background: SURFACE_200,
          border: `1px solid ${greenStage ? 'rgba(62,207,142,0.35)' : 'rgba(255,255,255,0.14)'}`,
          opacity: 0.9 + 0.1 * Math.sin(f / 5 + seed * 20),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 10, background: `rgba(62,207,142,${0.55 + 0.2 * Math.sin(f / 9 + seed * 5)})` }} />
      </div>
      {rows.map((row, ri) => (
        <React.Fragment key={ri}>
          {Array.from({ length: row.n }).map((_, i) => {
            const jitter = random(`crowd-${seed}-${ri}-${i}`);
            return (
              <Head
                key={i}
                x={(TILE_W / (row.n + 1)) * (i + 1) + (jitter - 0.5) * 26}
                y={row.y}
                r={row.r}
                bob={Math.sin(f / 11 + i * 1.9 + ri * 2.2 + seed * 8) * 3.5}
              />
            );
          })}
        </React.Fragment>
      ))}
    </>
  );
};

// Speaker on stage beside a slide
const SpeakerScene: React.FC<{ f: number; seed: number }> = ({ f, seed }) => {
  const barW = [150, 210, 180, 120];
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 120% 60% at 65% 20%, rgba(62,207,142,0.14), transparent 70%)' }} />
      {/* slide */}
      <div
        style={{
          position: 'absolute',
          left: 32,
          top: 96,
          width: 250,
          height: 165,
          borderRadius: 10,
          background: SURFACE_100,
          border: '1px solid rgba(62,207,142,0.28)',
          padding: 18,
          boxShadow: '0 0 34px rgba(62,207,142,0.10)',
        }}
      >
        <div style={{ width: 30, height: 30, borderRadius: 7, background: GREEN_DK, marginBottom: 14, opacity: 0.9 }} />
        {barW.map((w, i) => {
          const on = ((f / 34 + seed * 4) % 4) > i ? 1 : 0.35;
          return (
            <div
              key={i}
              style={{
                width: w * 0.8,
                height: i === 0 ? 12 : 8,
                borderRadius: 4,
                marginBottom: 9,
                background: i === 0 ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.28)',
                opacity: on,
              }}
            />
          );
        })}
      </div>
      {/* speaker silhouette */}
      <Head x={272} y={400 + Math.sin(f / 14 + seed * 6) * 3} r={34} bob={0} />
      <div
        style={{
          position: 'absolute',
          left: 210,
          top: 452,
          width: 124,
          height: 190,
          borderRadius: '58px 58px 0 0',
          background: SILHOUETTE,
          borderTop: '1.5px solid rgba(255,255,255,0.07)',
        }}
      />
      {/* floor */}
      <div style={{ position: 'absolute', left: 0, bottom: 58, width: '100%', height: 1, background: 'rgba(255,255,255,0.09)' }} />
    </>
  );
};

// Desk setup — code typing away
const DeskScene: React.FC<{ f: number; seed: number }> = ({ f, seed }) => {
  const lines = Array.from({ length: 11 }).map((_, i) => ({
    w: 60 + random(`code-${seed}-${i}`) * 200,
    indent: [0, 18, 18, 36, 18, 0, 0, 18, 36, 18, 0][i],
    green: random(`codeg-${seed}-${i}`) > 0.7,
  }));
  // keep at least 5 lines on screen so the editor never reads as blank
  const visible = 5 + (Math.floor(f / 7 + seed * 10) % (lines.length - 3));
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 100% 60% at 50% 45%, rgba(62,207,142,0.09), transparent 75%)' }} />
      <div
        style={{
          position: 'absolute',
          left: 26,
          top: 110,
          width: 308,
          height: 400,
          borderRadius: 12,
          background: SURFACE_75,
          border: `1px solid ${BORDER}`,
          padding: '16px 18px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {['#ff5f57', '#ffbd2e', '#28c840'].map((c) => (
            <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.85 }} />
          ))}
        </div>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              width: l.w,
              height: 9,
              borderRadius: 4,
              marginLeft: l.indent,
              marginBottom: 12,
              background: l.green ? 'rgba(62,207,142,0.55)' : 'rgba(255,255,255,0.22)',
              opacity: i < visible ? 1 : 0,
            }}
          />
        ))}
        {/* cursor */}
        <div
          style={{
            position: 'absolute',
            left: 18 + (visible < lines.length ? lines[Math.min(visible, lines.length - 1)].indent + lines[Math.min(visible, lines.length - 1)].w : 40),
            top: 41 + Math.min(visible, lines.length - 1) * 21,
            width: 8,
            height: 13,
            background: GREEN,
            opacity: Math.sin(f / 4) > 0 ? 0.9 : 0.15,
          }}
        />
      </div>
      {/* desk line + mug */}
      <div style={{ position: 'absolute', left: 0, bottom: 92, width: '100%', height: 1, background: 'rgba(255,255,255,0.09)' }} />
      <div style={{ position: 'absolute', right: 52, bottom: 93, width: 26, height: 20, borderRadius: '0 0 8px 8px', background: SURFACE_300, border: '1px solid rgba(255,255,255,0.10)', borderTop: 'none' }} />
    </>
  );
};

// Meetup circle — avatars chatting
const MeetupScene: React.FC<{ f: number; seed: number }> = ({ f, seed }) => {
  const people = [
    { x: 100, y: 300, r: 44, init: 'JK' },
    { x: 255, y: 265, r: 40, init: 'AM' },
    { x: 292, y: 452, r: 42, init: 'TS' },
    { x: 78, y: 478, r: 38, init: 'RD' },
    { x: 188, y: 385, r: 48, init: 'LN' },
  ];
  const bubbles = [
    { x: 132, y: 208, w: 84 },
    { x: 242, y: 352, w: 68 },
    { x: 58, y: 388, w: 76 },
  ];
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 110% 70% at 50% 35%, rgba(62,207,142,0.10), transparent 72%)' }} />
      {people.map((p, i) => {
        const bob = Math.sin(f / 12 + i * 1.4 + seed * 7) * 3;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x - p.r,
              top: p.y - p.r + bob,
              width: p.r * 2,
              height: p.r * 2,
              borderRadius: '50%',
              background: SURFACE_300,
              border: '1.5px solid rgba(62,207,142,0.30)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: circularFamily,
              fontSize: p.r * 0.62,
              fontWeight: 600,
              color: FG_LIGHT,
            }}
          >
            {p.init}
          </div>
        );
      })}
      {bubbles.map((b, i) => {
        const cycle = (f / 52 + i * 0.37 + seed) % 1;
        const on = cycle < 0.6;
        const pop = on ? Math.min(1, cycle * 14) : Math.max(0, 1 - (cycle - 0.6) * 12);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: b.x,
              top: b.y,
              width: b.w,
              height: 34,
              borderRadius: 17,
              background: 'rgba(62,207,142,0.16)',
              border: '1px solid rgba(62,207,142,0.35)',
              transform: `scale(${pop})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}
          >
            {[0, 1, 2].map((d) => (
              <div key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, opacity: 0.45 + 0.55 * (Math.sin(f / 5 + d * 1.2) > 0 ? 1 : 0.3) }} />
            ))}
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 40, bottom: 100, width: 280, height: 1, background: 'rgba(255,255,255,0.09)' }} />
    </>
  );
};

// Launch-week watch party — big screen, silhouettes below
const WatchScene: React.FC<{ f: number; seed: number }> = ({ f, seed }) => {
  const flicker = 0.82 + 0.18 * Math.sin(f / 3.2 + seed * 30) * Math.sin(f / 7.1 + seed * 12);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 34,
          top: 86,
          width: 292,
          height: 176,
          borderRadius: 10,
          background: `linear-gradient(140deg, rgba(62,207,142,${0.34 * flicker}), rgba(62,207,142,${0.08 * flicker}) 55%, ${SURFACE_200})`,
          border: '1px solid rgba(62,207,142,0.30)',
          boxShadow: `0 0 ${44 * flicker}px rgba(62,207,142,0.22)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: MONO,
          fontSize: 17,
          letterSpacing: 3,
          color: `rgba(255,255,255,${0.72 * flicker})`,
        }}
      >
        LAUNCH WEEK
      </div>
      <div style={{ position: 'absolute', left: 34, top: 262, width: 292, height: 90, background: 'linear-gradient(rgba(62,207,142,0.10), transparent)' }} />
      {[
        { y: 470, r: 22, n: 6 },
        { y: 552, r: 29, n: 5 },
      ].map((row, ri) => (
        <React.Fragment key={ri}>
          {Array.from({ length: row.n }).map((_, i) => (
            <Head
              key={i}
              x={(TILE_W / (row.n + 1)) * (i + 1) + (random(`watch-${seed}-${ri}-${i}`) - 0.5) * 22}
              y={row.y}
              r={row.r}
              bob={Math.sin(f / 13 + i * 2.1 + ri + seed * 9) * 3}
            />
          ))}
        </React.Fragment>
      ))}
    </>
  );
};

// Hackathon table — laptops glowing
const HackScene: React.FC<{ f: number; seed: number }> = ({ f, seed }) => {
  const laptops = [
    { x: 46, y: 438, w: 92, h: 62 },
    { x: 168, y: 418, w: 104, h: 70 },
    { x: 288, y: 446, w: 86, h: 58 },
  ];
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 120% 55% at 50% 60%, rgba(62,207,142,0.10), transparent 72%)' }} />
      {laptops.map((l, i) => {
        const glow = 0.5 + 0.5 * Math.sin(f / 9 + i * 2.3 + seed * 6);
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: 'absolute',
                left: l.x - l.w / 2,
                top: l.y - l.h,
                width: l.w,
                height: l.h,
                borderRadius: 6,
                background: `linear-gradient(rgba(62,207,142,${0.16 + glow * 0.22}), ${SURFACE_100})`,
                border: '1px solid rgba(255,255,255,0.13)',
                boxShadow: `0 0 ${18 + glow * 16}px rgba(62,207,142,0.16)`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: l.x - l.w / 2 - 8,
                top: l.y,
                width: l.w + 16,
                height: 7,
                borderRadius: '0 0 6px 6px',
                background: SURFACE_300,
              }}
            />
          </React.Fragment>
        );
      })}
      {/* builders behind the table */}
      {laptops.map((l, i) => (
        <Head key={i} x={l.x + 6} y={l.y - l.h - 34} r={24} bob={Math.sin(f / 12 + i * 1.8 + seed * 4) * 3} />
      ))}
      <div style={{ position: 'absolute', left: 20, top: 506, width: 320, height: 1, background: 'rgba(255,255,255,0.10)' }} />
      {/* sticky note */}
      <div style={{ position: 'absolute', right: 44, top: 168, width: 58, height: 58, borderRadius: 4, background: 'rgba(62,207,142,0.20)', border: '1px solid rgba(62,207,142,0.40)', transform: 'rotate(-6deg)' }}>
        <div style={{ margin: '12px 10px 0', height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.35)' }} />
        <div style={{ margin: '8px 10px 0', width: 26, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.22)' }} />
      </div>
    </>
  );
};

// Founder talking-head — the first dive target. Placeholder chrome makes it
// obvious to the editor that a real soundbite goes here.
const FounderScene: React.FC<{ f: number }> = ({ f }) => {
  const words = ['“this', 'community', 'built', 'supabase.”'];
  const speaking = f >= T.hold1 && f <= T.slide2;
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 120% 75% at 50% 30%, rgba(62,207,142,0.20), transparent 70%)' }} />
      {/* rim-lit silhouette */}
      <div
        style={{
          position: 'absolute',
          left: 180 - 66,
          top: 168,
          width: 132,
          height: 132,
          borderRadius: '50%',
          background: SILHOUETTE,
          border: '2px solid rgba(62,207,142,0.32)',
          boxShadow: '0 0 40px rgba(62,207,142,0.14)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 180 - 105,
          top: 312,
          width: 210,
          height: 180,
          borderRadius: '90px 90px 0 0',
          background: SILHOUETTE,
          border: '2px solid rgba(62,207,142,0.26)',
          borderBottom: 'none',
        }}
      />
      {/* lower third */}
      <div style={{ position: 'absolute', left: 24, top: 502, display: 'flex', gap: 12 }}>
        <div style={{ width: 4, borderRadius: 2, background: GREEN }} />
        <div style={{ fontFamily: circularFamily }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: FG, letterSpacing: 1.5, whiteSpace: 'nowrap' }}>FOUNDER SOUNDBITE</div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: FG_MUTED, marginTop: 4, fontFamily: MONO, whiteSpace: 'nowrap' }}>
            placeholder · swap for real clip
          </div>
        </div>
      </div>
      {/* subtitle — words land one at a time while camera holds */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: circularFamily, fontSize: 20, fontWeight: 600, color: FG }}>
        {words.map((w, i) => (
          <span key={i} style={{ opacity: speaking ? itp(f, T.hold1 + 22 + i * 10, T.hold1 + 30 + i * 10) : 0, marginRight: 6 }}>
            {w}
          </span>
        ))}
      </div>
      {/* waveform */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 14, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 5, height: 26 }}>
        {Array.from({ length: 26 }).map((_, i) => {
          const amp = speaking ? 1 : 0.25;
          const h = 4 + amp * 20 * Math.abs(Math.sin(f / 3.1 + i * 0.9) * Math.sin(f / 8.7 + i * 0.35));
          return <div key={i} style={{ width: 4, height: h, borderRadius: 2, background: GREEN, opacity: 0.8 }} />;
        })}
      </div>
    </>
  );
};

const SCENES = [CrowdScene, SpeakerScene, DeskScene, MeetupScene, WatchScene, HackScene];

// ── Tile ─────────────────────────────────────────────────────────────────────
const Tile: React.FC<{ c: number; r: number; f: number }> = ({ c, r, f }) => {
  const idx = r * COLS + c;
  const seed = random(`tile-${c}-${r}`);
  const isCore = c >= CORE.c0 && c <= CORE.c1 && r >= CORE.r0 && r <= CORE.r1;
  const isFounder = c === FOUNDER.c && r === FOUNDER.r;

  // pop-in: core tiles cascade out from the centre; outer ring joins on pull-back
  let appear: number;
  let popScale = 1;
  if (isCore) {
    const dist = Math.max(Math.abs(c - FOUNDER.c), Math.abs(r - FOUNDER.r));
    const delay = 6 + dist * 15 + seed * 12;
    const s = sp(f, delay);
    appear = s;
    popScale = 0.6 + 0.4 * s;
  } else {
    const delay = T.pull + 8 + seed * 48;
    appear = itp(f, delay, delay + 22);
    popScale = 0.9 + 0.1 * appear;
  }
  if (appear <= 0.001) return null;

  // borders warm to green as the wall reassembles
  const greenP = itp(f, T.pull, T.wide);
  const borderCol = isFounder
    ? 'rgba(62,207,142,0.45)'
    : `rgba(${62 * greenP + 58 * (1 - greenP)}, ${207 * greenP + 58 * (1 - greenP)}, ${142 * greenP + 58 * (1 - greenP)}, ${0.75 + greenP * 0.1})`;

  // slow "handheld" drift inside each clip
  const panX = Math.sin(f / 90 + seed * 9) * 6;
  const panY = Math.cos(f / 110 + seed * 7) * 5;

  const variant = isFounder
    ? -1
    : c === HERO_B.c && r === HERO_B.r
      ? 3 // meetup
      : c === HERO_C.c && r === HERO_C.r
        ? 1 // stage talk
        : c === HERO_D.c && r === HERO_D.r
          ? 5 // hackathon
          : Math.floor(random(`variant-${c}-${r}`) * SCENES.length);

  const Scene = variant >= 0 ? SCENES[variant] : null;
  const sec = (Math.floor(seed * 50) + Math.floor(f / 30)) % 60;
  const min = 1 + Math.floor(seed * 38);

  return (
    <div
      style={{
        position: 'absolute',
        left: c * STEP_X,
        top: r * STEP_Y,
        width: TILE_W,
        height: TILE_H,
        borderRadius: 18,
        background: seed > 0.5 ? SURFACE_75 : SURFACE_100,
        border: `1.5px solid ${borderCol}`,
        overflow: 'hidden',
        opacity: appear,
        transform: `scale(${popScale})`,
        boxShadow: greenP > 0.05 ? `0 0 ${26 * greenP}px rgba(62,207,142,${0.20 * greenP})` : '0 8px 30px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ position: 'absolute', inset: -14, transform: `scale(1.07) translate(${panX}px, ${panY}px)` }}>
        <div style={{ position: 'absolute', inset: 14 }}>
          {isFounder ? <FounderScene f={f} /> : Scene ? <Scene f={f + Math.floor(seed * 200)} seed={seed} /> : null}
        </div>
      </div>
      {/* vignette */}
      <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 70px rgba(0,0,0,0.55)', borderRadius: 18, pointerEvents: 'none' }} />
      {/* location label — founder tile carries its own lower-third instead */}
      {!isFounder && (
        <div style={sceneLabel}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, opacity: 0.6 + 0.4 * Math.sin(f / 8 + seed * 20) }} />
          {CITIES[idx % CITIES.length]}
        </div>
      )}
      {/* timestamp */}
      <div style={{ position: 'absolute', top: 14, right: 14, fontFamily: MONO, fontSize: 13, color: FG_MUTED }}>
        {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
      </div>
    </div>
  );
};

// ── Screen-space overlays ────────────────────────────────────────────────────

const CaptionOverlay: React.FC<{ f: number }> = ({ f }) => (
  <>
    {CAPTIONS.map((cap, i) => {
      if (f < cap.s - 5 || f > cap.e + 5) return null;
      const inS = sp(f, cap.s);
      const out = itp(f, cap.e - 10, cap.e, 1, 0);
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 300,
            textAlign: 'center',
            fontFamily: circularFamily,
            opacity: Math.min(inS, out),
            transform: `translateY(${(1 - inS) * 36}px)`,
          }}
        >
          <div style={{ fontSize: 110, fontWeight: 800, lineHeight: 1, color: GREEN, textShadow: `0 0 40px ${GREEN_GLOW}` }}>
            {cap.big}
          </div>
          <div style={{ fontSize: 40, fontWeight: 500, color: FG, marginTop: 14, textShadow: '0 2px 24px rgba(0,0,0,0.8)' }}>
            {cap.small}
          </div>
        </div>
      );
    })}
  </>
);

const Finale: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.count - 10) return null;
  const kickerIn = sp(f, T.count);
  const counting = f < T.snap;
  const value = Math.round(
    interpolate(f, [T.count, T.snap], [98412, 100000], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const snapS = sp(f, T.snap);
  const pulse = 0.5 + 0.5 * Math.sin((f - T.snap) / 9);
  const subIn = sp(f, T.snap + 26);
  const handleIn = sp(f, T.snap + 48);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: circularFamily }}>
      <div
        style={{
          fontSize: 25,
          fontWeight: 600,
          letterSpacing: 7,
          color: FG_LIGHT,
          opacity: kickerIn,
          transform: `translateY(${(1 - kickerIn) * 20}px)`,
          marginBottom: 38,
        }}
      >
        OUR COMMUNITY JUST HIT
      </div>

      <div style={{ height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {counting ? (
          <div style={{ fontSize: 128, fontWeight: 800, color: FG, fontVariantNumeric: 'tabular-nums', letterSpacing: 2 }}>
            {value.toLocaleString('en-US')}
          </div>
        ) : (
          <div
            style={{
              fontSize: 250,
              fontWeight: 800,
              lineHeight: 1,
              color: GREEN,
              transform: `scale(${0.85 + snapS * 0.15})`,
              textShadow: `0 0 ${50 + pulse * 34}px ${GREEN_GLOW}, 0 0 ${14 + pulse * 10}px ${GREEN_GLOW}`,
            }}
          >
            100K
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: 36,
          fontWeight: 500,
          color: FG_LIGHT,
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 22}px)`,
          marginTop: 30,
        }}
      >
        Thank you for building this with us.
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginTop: 66,
          opacity: handleIn,
          transform: `translateY(${(1 - handleIn) * 18}px)`,
        }}
      >
        <Img src={staticFile('SupabaseIcon.png')} style={{ width: 52, height: 52, objectFit: 'contain' }} />
        <div style={{ fontSize: 29, fontWeight: 600, color: FG_MUTED, letterSpacing: 1 }}>@supabase</div>
      </div>
    </AbsoluteFill>
  );
};

// ── Composition ──────────────────────────────────────────────────────────────
export const CommunityWall100K: React.FC = () => {
  const f = useCurrentFrame();
  const { cx, cy, zoom } = useCamera(f);

  // wall recedes to a dim backdrop for the finale
  const wallOpacity = itp(f, T.dim, T.dim + 40, 1, 0.16);
  const fadeToBlack = itp(f, T.fadeOut, T.end - 2);

  // opening kicker over the wall, gone before the dive
  const introIn = sp(f, 22);
  const introOut = itp(f, 96, 118, 1, 0);

  return (
    <AbsoluteFill style={{ background: BG, overflow: 'hidden', fontFamily: circularFamily }}>
      <DotGrid />

      {/* the wall — one continuous camera transform */}
      <div style={{ position: 'absolute', inset: 0, opacity: wallOpacity }}>
        <div
          style={{
            position: 'absolute',
            transformOrigin: '0 0',
            transform: `translate(${W / 2}px, ${H / 2}px) scale(${zoom}) translate(${-cx}px, ${-cy}px)`,
          }}
        >
          {Array.from({ length: ROWS }).map((_, r) =>
            Array.from({ length: COLS }).map((_, c) => <Tile key={`${c}-${r}`} c={c} r={r} f={f} />),
          )}
        </div>
      </div>

      {/* opening kicker */}
      <div
        style={{
          position: 'absolute',
          top: 118,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: 6,
          color: FG,
          opacity: Math.min(introIn, introOut),
          transform: `translateY(${(1 - introIn) * 18}px)`,
          textShadow: '0 2px 20px rgba(0,0,0,0.9)',
        }}
      >
        THE SUPABASE COMMUNITY
      </div>

      <CaptionOverlay f={f} />
      <Finale f={f} />

      <AbsoluteFill style={{ background: '#000', opacity: fadeToBlack, pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};
