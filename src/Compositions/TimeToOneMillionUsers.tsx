import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { BG, GREEN, GREEN_DK, FG, FG_MUTED, MONO, DotGrid, itp } from '../tokens';
import { circularFamily } from '../fonts';

// ─────────────────────────────────────────────────────────────────────────────
// DATA — time to reach 1,000,000 users, expressed in hours (linear scale, like
// the classic "time to 1M users" bar chart — bars are drawn to true relative
// length, so Threads/Pokémon GO/Angry Birds barely register next to GitHub).
// A 30-day month / 365-day year is used for the month/year figures.
// ─────────────────────────────────────────────────────────────────────────────
type Row = { name: string; hours: number; label: string; logo: string; launched: string };

const RAW: Row[] = [
  { name: 'Threads',     hours: 1,              label: '1 hour',    logo: 'logos/threads.svg',     launched: '2023' },
  { name: 'Pokémon GO',  hours: 2,              label: '~2 hours',  logo: 'logos/pokemon-go.svg',  launched: '2016' },
  { name: 'Angry Birds', hours: 35 * 24,        label: '35 days',   logo: 'logos/angry-birds.png', launched: '2009' },
  { name: 'Spotify',     hours: 5 * 30 * 24,    label: '5 months',  logo: 'logos/spotify.svg',      launched: '2008' },
  { name: 'Dropbox',     hours: 7 * 30 * 24,    label: '7 months',  logo: 'logos/dropbox.svg',      launched: '2008' },
  { name: 'Foursquare',  hours: 13 * 30 * 24,   label: '13 months', logo: 'logos/foursquare.svg',   launched: '2009' },
  { name: 'Kickstarter', hours: 2.5 * 365 * 24, label: '2.5 years', logo: 'logos/kickstarter.svg',  launched: '2009' },
  { name: 'Airbnb',      hours: 2.5 * 365 * 24, label: '2.5 years', logo: 'logos/airbnb.svg',       launched: '2008' },
  { name: 'GitHub',      hours: 3.5 * 365 * 24, label: '3.5 years', logo: 'logos/github.svg',       launched: '2008' },
];

const MAX_HOURS = Math.max(...RAW.map((r) => r.hours));
const ROWS = RAW.map((r) => ({ ...r, fraction: r.hours / MAX_HOURS })); // linear, 0–1

function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${hours < 10 ? hours.toFixed(1) : Math.round(hours)} hr`;
  const days = hours / 24;
  if (days < 45) return `${Math.round(days)} day${Math.round(days) === 1 ? '' : 's'}`;
  const months = hours / (30 * 24);
  if (months < 20) return `${months < 10 ? months.toFixed(1) : Math.round(months)} mo`;
  const years = hours / (365 * 24);
  return `${years.toFixed(1)} yr`;
}

// Race timing
const RACE_START = 30;
const RACE_END = 330;

// Layout (1920×1080)
const PAD_X = 80;
const LEFT_COL_WIDTH = 440;
const DIVIDER_MARGIN = 28;
const BAR_AREA_WIDTH = 1920 - PAD_X * 2 - LEFT_COL_WIDTH - DIVIDER_MARGIN * 2 - 1;
const MAX_BAR_WIDTH = BAR_AREA_WIDTH * 0.8;

export const TimeToOneMillionUsers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = itp(frame, 0, 20);
  const p = itp(frame, RACE_START, RACE_END, 0, 1); // shared linear playhead, 0→1
  const elapsedHours = p * MAX_HOURS;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: circularFamily, overflow: 'hidden' }}>
      <DotGrid />

      <div style={{ position: 'absolute', inset: 0, padding: `56px ${PAD_X}px 40px` }}>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            opacity: headerOpacity,
            marginBottom: 40,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div style={{ width: 6, height: 40, borderRadius: 3, background: GREEN }} />
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: FG,
                  lineHeight: 1,
                }}
              >
                How fast did they hit 1,000,000 users?
              </span>
            </div>
            <div style={{ fontSize: 22, color: FG_MUTED, fontWeight: 500, marginLeft: 18 }}>
              Some took years. Threads took an hour.
            </div>
          </div>

          {/* Elapsed clock — the video's "moving" element */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: FG_MUTED,
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Elapsed
            </div>
            <div
              style={{
                fontSize: 44,
                fontWeight: 800,
                color: GREEN,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                textShadow: '0 0 40px rgba(62,207,142,0.35)',
              }}
            >
              {formatDuration(elapsedHours)}
            </div>
          </div>
        </div>

        {/* ── Rows ───────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 780 }}>
          {ROWS.map((row, i) => {
            const introProgress = spring({
              frame: frame - i * 3,
              fps,
              config: { damping: 18, stiffness: 130 },
            });
            const completionFrame = RACE_START + row.fraction * (RACE_END - RACE_START);
            const currentFrac = Math.min(p, row.fraction);
            const barWidthPx = currentFrac * MAX_BAR_WIDTH;
            const labelPop = frame >= completionFrame
              ? spring({ frame: frame - completionFrame, fps, config: { damping: 13, stiffness: 190 } })
              : 0;
            const flash = frame >= completionFrame ? itp(frame, completionFrame, completionFrame + 24, 1, 0) : 0;

            return (
              <div
                key={row.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  opacity: introProgress,
                  transform: `translateX(${(1 - introProgress) * -32}px)`,
                }}
              >
                {/* Left: logo + name + launched year */}
                <div style={{ width: LEFT_COL_WIDTH, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                  <Img
                    src={staticFile(row.logo)}
                    style={{ height: 34, width: 'auto', maxWidth: 100, objectFit: 'contain', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 25, fontWeight: 600, color: FG, whiteSpace: 'nowrap' }}>{row.name}</span>
                  <div style={{ flex: 1 }} />
                  <span
                    style={{
                      fontSize: 14,
                      fontFamily: MONO,
                      color: FG_MUTED,
                      letterSpacing: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.launched}
                  </span>
                </div>

                {/* Divider */}
                <div
                  style={{
                    width: 1,
                    height: 34,
                    background: 'rgba(255,255,255,0.14)',
                    margin: `0 ${DIVIDER_MARGIN}px`,
                    flexShrink: 0,
                  }}
                />

                {/* Bar + label */}
                <div style={{ position: 'relative', width: BAR_AREA_WIDTH, height: 34, flexShrink: 0 }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 5,
                      bottom: 5,
                      width: Math.max(barWidthPx, 3),
                      borderRadius: 5,
                      background: `linear-gradient(90deg, ${GREEN_DK}, ${GREEN})`,
                      boxShadow: flash > 0
                        ? `0 0 ${22 * flash}px rgba(62,207,142,${0.6 * flash})`
                        : '0 0 8px rgba(62,207,142,0.18)',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      left: barWidthPx + 18,
                      top: '50%',
                      transform: `translateY(-50%) scale(${0.75 + labelPop * 0.25})`,
                      transformOrigin: 'left center',
                      opacity: labelPop,
                      fontSize: 26,
                      fontWeight: 700,
                      color: GREEN,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
