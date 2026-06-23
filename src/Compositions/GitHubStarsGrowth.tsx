import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  staticFile,
} from 'remotion';

// ─── Constants ───────────────────────────────────────────────────────────────

const BG = '#0d1117';
const GRID_COLOR = 'rgba(255,255,255,0.07)';
const AXIS_COLOR = 'rgba(255,255,255,0.25)';
const LABEL_COLOR = 'rgba(255,255,255,0.55)';

// Chart layout — vertical/portrait 1080x1920 canvas
// Y-axis labels sit left of CHART_LEFT; chart fills the centre of the canvas.
const CHART_LEFT = 100;
const CHART_TOP = 360;
const CHART_WIDTH = 880;
const CHART_HEIGHT = 900;
const CHART_RIGHT = CHART_LEFT + CHART_WIDTH;   // 980
const CHART_BOTTOM = CHART_TOP + CHART_HEIGHT;   // 1260

const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
const MAX_STARS = 120000;
const Y_TICKS = [0, 20000, 40000, 60000, 80000, 100000, 120000];

// Animation timing (frames at 30fps) — unchanged
const TITLE_IN_START = 0;
const TITLE_IN_END = 40;
const GRAPH_START = 90;
const GRAPH_END = 600;
const HIGHLIGHT_START = 600;
const FADE_START = 720;
const FADE_END = 750;

// ─── Data ────────────────────────────────────────────────────────────────────

interface Repo {
  name: string;
  color: string;
  data: Record<number, number>;
}

const REPOS: Repo[] = [
  {
    name: 'Supabase',
    color: '#3ECF8E',
    data: { 2019: 0, 2020: 2000, 2021: 12000, 2022: 35000, 2023: 58000, 2024: 78000, 2025: 92000, 2026: 100000 },
  },
  {
    name: 'n8n',
    color: '#EA4B71',
    data: { 2019: 1000, 2020: 5000, 2021: 14000, 2022: 26000, 2023: 38000, 2024: 48000, 2025: 55000, 2026: 60000 },
  },
  {
    name: 'Cal.com',
    color: '#FF8800',
    data: { 2019: 0, 2020: 0, 2021: 4000, 2022: 13000, 2023: 21000, 2024: 26000, 2025: 28500, 2026: 30000 },
  },
  {
    name: 'Sentry',
    color: '#7B5EA7',
    data: { 2019: 18000, 2020: 22000, 2021: 27000, 2022: 31000, 2023: 35000, 2024: 37000, 2025: 39000, 2026: 40000 },
  },
  {
    name: 'PostHog',
    color: '#F9BD2B',
    data: { 2019: 0, 2020: 500, 2021: 3000, 2022: 8000, 2023: 14000, 2024: 19000, 2025: 22000, 2026: 25000 },
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function xForYear(year: number): number {
  const pct = (year - 2019) / (2026 - 2019);
  return CHART_LEFT + pct * CHART_WIDTH;
}

function yForStars(stars: number): number {
  const pct = stars / MAX_STARS;
  return CHART_BOTTOM - pct * CHART_HEIGHT;
}

function formatStars(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

// Build a polyline points string for a repo, clipped to a progress fraction 0–1.
// progress 0 = only first point, 1 = all points.
function buildClippedPath(repo: Repo, progress: number): string {
  const pts = YEARS.map((y) => ({ x: xForYear(y), y: yForStars(repo.data[y] ?? 0) }));
  const totalSegs = pts.length - 1;
  const drawn = progress * totalSegs; // e.g. 3.4 means 3 full segments + 40% of seg 4
  const fullSegs = Math.floor(drawn);
  const frac = drawn - fullSegs;

  const visible: { x: number; y: number }[] = [];
  for (let i = 0; i <= Math.min(fullSegs, totalSegs - 1); i++) {
    visible.push(pts[i]);
  }
  // partial segment
  if (fullSegs < totalSegs) {
    const a = pts[fullSegs];
    const b = pts[fullSegs + 1];
    visible.push({ x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac });
  } else {
    visible.push(pts[totalSegs]);
  }

  return visible.map((p) => `${p.x},${p.y}`).join(' ');
}

// Stars at a given draw progress (0–1 along the 2019→2026 timeline)
function starsAtProgress(repo: Repo, progress: number): number {
  const yearF = 2019 + progress * (2026 - 2019);
  const lo = Math.floor(yearF);
  const hi = Math.ceil(yearF);
  if (lo === hi) return repo.data[lo] ?? 0;
  const frac = yearF - lo;
  const a = repo.data[lo] ?? 0;
  const b = repo.data[hi] ?? 0;
  return Math.round(a + (b - a) * frac);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Grid: React.FC = () => (
  <>
    {Y_TICKS.map((stars) => {
      const y = yForStars(stars);
      return (
        <g key={stars}>
          <line x1={CHART_LEFT} y1={y} x2={CHART_RIGHT} y2={y} stroke={GRID_COLOR} strokeWidth={1} />
          <text
            x={CHART_LEFT - 14}
            y={y + 5}
            fill={LABEL_COLOR}
            fontSize={22}
            textAnchor="end"
            fontFamily="'SF Mono', 'Fira Code', 'Consolas', monospace"
          >
            {formatStars(stars)}
          </text>
        </g>
      );
    })}
    {/* X-axis vertical tick lines */}
    {YEARS.map((year) => {
      const x = xForYear(year);
      return (
        <line
          key={year}
          x1={x}
          y1={CHART_TOP}
          x2={x}
          y2={CHART_BOTTOM}
          stroke={GRID_COLOR}
          strokeWidth={1}
        />
      );
    })}
  </>
);

const Axes: React.FC = () => (
  <>
    {/* Y axis */}
    <line x1={CHART_LEFT} y1={CHART_TOP} x2={CHART_LEFT} y2={CHART_BOTTOM} stroke={AXIS_COLOR} strokeWidth={2} />
    {/* X axis */}
    <line x1={CHART_LEFT} y1={CHART_BOTTOM} x2={CHART_RIGHT} y2={CHART_BOTTOM} stroke={AXIS_COLOR} strokeWidth={2} />
  </>
);

interface YearLabelsProps {
  progress: number; // 0–1 across 2019–2026
}

const YearLabels: React.FC<YearLabelsProps> = ({ progress }) => {
  const currentYear = 2019 + progress * (2026 - 2019);
  return (
    <>
      {YEARS.map((year) => {
        const x = xForYear(year);
        const isPast = year <= currentYear;
        return (
          <text
            key={year}
            x={x}
            y={CHART_BOTTOM + 48}
            fill={isPast ? 'rgba(255,255,255,0.85)' : LABEL_COLOR}
            fontSize={isPast ? 22 : 18}
            fontWeight={isPast ? '700' : '400'}
            textAnchor="middle"
            fontFamily="'SF Mono', 'Fira Code', 'Consolas', monospace"
          >
            {year}
          </text>
        );
      })}
    </>
  );
};

interface CurrentYearLineProps {
  progress: number;
}

const CurrentYearLine: React.FC<CurrentYearLineProps> = ({ progress }) => {
  const x = CHART_LEFT + progress * CHART_WIDTH;
  return (
    <line
      x1={x}
      y1={CHART_TOP}
      x2={x}
      y2={CHART_BOTTOM}
      stroke="rgba(255,255,255,0.18)"
      strokeWidth={2}
      strokeDasharray="6 4"
    />
  );
};

interface LineProps {
  repo: Repo;
  progress: number;
  dimmed: boolean;
  highlighted: boolean;
}

const RepoLine: React.FC<LineProps> = ({ repo, progress, dimmed, highlighted }) => {
  if (progress <= 0) return null;

  const pts = buildClippedPath(repo, progress);
  const opacity = dimmed ? 0.18 : 1;
  const strokeWidth = highlighted ? 5 : 2.5;

  // Tip coordinates
  const yearF = 2019 + progress * (2026 - 2019);
  const lo = Math.floor(yearF);
  const frac = yearF - lo;
  const tipX = xForYear(lo) + (xForYear(Math.min(lo + 1, 2026)) - xForYear(lo)) * frac;
  const tipStars = starsAtProgress(repo, progress);
  const tipY = yForStars(tipStars);

  return (
    <g opacity={opacity} style={{ transition: 'opacity 0.1s' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={repo.color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Tip dot */}
      <circle cx={tipX} cy={tipY} r={highlighted ? 7 : 5} fill={repo.color} />
    </g>
  );
};

interface LabelProps {
  repo: Repo;
  progress: number;
  dimmed: boolean;
  highlighted: boolean;
}

const RepoLabel: React.FC<LabelProps> = ({ repo, progress, dimmed, highlighted }) => {
  if (progress < 0.05) return null;

  const yearF = 2019 + progress * (2026 - 2019);
  const lo = Math.floor(yearF);
  const frac = yearF - lo;
  const tipX = xForYear(lo) + (xForYear(Math.min(lo + 1, 2026)) - xForYear(lo)) * frac;
  const tipStars = starsAtProgress(repo, progress);
  const tipY = yForStars(tipStars);

  const opacity = dimmed ? 0.15 : 1;
  const fontSize = highlighted ? 24 : 20;

  // Offset labels to avoid overlap — push right of the tip
  const labelX = tipX + 12;
  const labelY = tipY - 4;

  const starsStr = formatStars(tipStars);

  return (
    <g opacity={opacity}>
      <text
        x={labelX}
        y={labelY}
        fill={repo.color}
        fontSize={fontSize}
        fontWeight={highlighted ? '700' : '600'}
        fontFamily="'SF Mono', 'Fira Code', 'Consolas', monospace"
        dominantBaseline="middle"
      >
        {repo.name}
      </text>
      <text
        x={labelX}
        y={labelY + (fontSize + 4)}
        fill={repo.color}
        fontSize={fontSize - 4}
        fontWeight="400"
        fontFamily="'SF Mono', 'Fira Code', 'Consolas', monospace"
        dominantBaseline="middle"
        opacity={0.75}
      >
        {starsStr}
      </text>
    </g>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const GitHubStarsGrowth: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // ── Title phase (0–90) ──────────────────────────────────────────────────────
  const titleOpacity = interpolate(frame, [TITLE_IN_START, TITLE_IN_END], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleY = interpolate(frame, [TITLE_IN_START, TITLE_IN_END], [36, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Title fades out as graph enters
  const titleFadeOut = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Graph phase (90–600) ────────────────────────────────────────────────────
  const graphFadeIn = interpolate(frame, [GRAPH_START, GRAPH_START + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Progress drives the draw animation — ease-in-out across the 510-frame window
  const graphProgress = interpolate(frame, [GRAPH_START, GRAPH_END], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Highlight phase (600–720) ───────────────────────────────────────────────
  const isHighlightPhase = frame >= HIGHLIGHT_START;

  // Zoom into chart during highlight — slight scale + shift toward Supabase
  const zoomScale = interpolate(frame, [HIGHLIGHT_START, HIGHLIGHT_START + 60], [1, 1.06], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Text overlay opacity
  const overlayOpacity = interpolate(frame, [HIGHLIGHT_START + 30, HIGHLIGHT_START + 60], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Fade to black (720–750) ─────────────────────────────────────────────────
  const fadeToBlack = interpolate(frame, [FADE_START, FADE_END], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ── Determine which repos are dimmed vs highlighted ─────────────────────────
  const supabaseRepo = REPOS.find((r) => r.name === 'Supabase')!;

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace" }}>

      {/* ── Title card (frames 0–90) ── */}
      {frame < 90 && (
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: titleOpacity * titleFadeOut,
            transform: `translateY(${titleY}px)`,
            padding: '0 80px',
          }}
        >
          <div
            style={{
              color: '#ffffff',
              fontSize: 120,
              fontWeight: 800,
              letterSpacing: '-2px',
              lineHeight: 1.05,
              textAlign: 'center',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            Supabase
          </div>
          <div
            style={{
              color: '#3ECF8E',
              fontSize: 80,
              fontWeight: 700,
              marginTop: 24,
              letterSpacing: '-1px',
              lineHeight: 1.1,
              textAlign: 'center',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            100k GitHub Star Growth
          </div>
          <div
            style={{
              color: LABEL_COLOR,
              fontSize: 38,
              fontWeight: 400,
              marginTop: 32,
              letterSpacing: '4px',
              fontFamily: "'SF Mono', monospace",
            }}
          >
            2019 — 2026
          </div>
        </AbsoluteFill>
      )}

      {/* ── Main chart (frames 90+) ── */}
      {frame >= GRAPH_START && (
        <AbsoluteFill
          style={{
            opacity: frame >= HIGHLIGHT_START ? 1 : graphFadeIn,
            transform: isHighlightPhase ? `scale(${zoomScale})` : 'scale(1)',
            // Centre of the portrait canvas
            transformOrigin: '540px 960px',
          }}
        >
          {/* Chart title — top of canvas */}
          <div
            style={{
              position: 'absolute',
              top: 80,
              left: CHART_LEFT,
              right: width - CHART_RIGHT,
            }}
          >
            <div
              style={{
                color: '#ffffff',
                fontSize: 52,
                fontWeight: 700,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
              }}
            >
              GitHub Stars Growth
            </div>
            <div
              style={{
                color: LABEL_COLOR,
                fontSize: 28,
                fontFamily: "'SF Mono', monospace",
                letterSpacing: '2px',
                marginTop: 8,
              }}
            >
              ★ stars · 2019–2026
            </div>
          </div>

          {/* Legend pills — below title, above chart */}
          {!isHighlightPhase && (
            <div
              style={{
                position: 'absolute',
                top: 220,
                left: CHART_LEFT,
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: '10px 20px',
              }}
            >
              {REPOS.map((r) => (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 26,
                      height: 3,
                      borderRadius: 2,
                      background: r.color,
                    }}
                  />
                  <span
                    style={{
                      color: r.color,
                      fontSize: 22,
                      fontWeight: 600,
                      fontFamily: "'SF Mono', monospace",
                    }}
                  >
                    {r.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* SVG chart */}
          <svg
            width={width}
            height={height}
            style={{ position: 'absolute', top: 0, left: 0 }}
            viewBox={`0 0 ${width} ${height}`}
          >
            {/* Grid + Axes */}
            <Grid />
            <Axes />

            {/* Year labels on X axis */}
            <YearLabels progress={graphProgress} />

            {/* Moving current-year line */}
            <CurrentYearLine progress={graphProgress} />

            {/* Lines */}
            {REPOS.map((repo) => {
              const isSupabase = repo.name === 'Supabase';
              const dimmed = isHighlightPhase && !isSupabase;
              const highlighted = isHighlightPhase && isSupabase;
              return (
                <RepoLine
                  key={repo.name}
                  repo={repo}
                  progress={graphProgress}
                  dimmed={dimmed}
                  highlighted={highlighted}
                />
              );
            })}

            {/* Labels — shown during graph phase */}
            {!isHighlightPhase &&
              REPOS.map((repo) => (
                <RepoLabel
                  key={repo.name}
                  repo={repo}
                  progress={graphProgress}
                  dimmed={false}
                  highlighted={false}
                />
              ))}

            {/* During highlight — only Supabase label */}
            {isHighlightPhase && (
              <RepoLabel
                repo={supabaseRepo}
                progress={1}
                dimmed={false}
                highlighted={true}
              />
            )}
          </svg>
        </AbsoluteFill>
      )}

      {/* ── Highlight overlay text (frames 630–720) ── */}
      {isHighlightPhase && (
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: overlayOpacity,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(13,17,23,0.92)',
              border: '1px solid rgba(62,207,142,0.35)',
              borderRadius: 28,
              padding: '64px 80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
              backdropFilter: 'blur(16px)',
              maxWidth: 900,
              width: '82%',
            }}
          >
            <img
              src={staticFile('SupabaseIcon.png')}
              style={{ width: 110, height: 110, objectFit: 'contain' }}
            />
            <div
              style={{
                color: '#ffffff',
                fontSize: 88,
                fontWeight: 800,
                letterSpacing: '-2px',
                lineHeight: 1,
                textAlign: 'center',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              100,000 GitHub Stars
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: 40,
                fontWeight: 400,
                marginTop: 4,
                textAlign: 'center',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Thank you to our community ❤️
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ── Fade to black ── */}
      {frame >= FADE_START && (
        <AbsoluteFill
          style={{
            background: '#000000',
            opacity: fadeToBlack,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
