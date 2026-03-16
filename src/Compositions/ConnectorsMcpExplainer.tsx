import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  Img,
  staticFile,
  useVideoConfig,
} from 'remotion';
import { loadFont, fontFamily } from '@remotion/google-fonts/Inter';

loadFont('normal', { weights: ['400', '600', '700', '800'] });

// ─── Palette ─────────────────────────────────────────────────────────────────
const ANDROID_GREEN = '#3DDC84';
const CLAUDE_TAN    = '#D4A574';
const BLUE          = '#60A5FA';
const PURPLE        = '#A78BFA';
const GOLD          = '#FBBF24';

// ─── Timeline (30 fps) ───────────────────────────────────────────────────────
//  P1   0  – Android logo + title enters
//  P2  60  – Two option cards slide in
//  P3 150  – Card examples fade in
//  P4 245  – Bridge: "The Same Exact Thing"
//  P5 315  – Claude logo + title
//  P6 375  – Claude's two cards
//  P7 450  – MCP banner + definition
// END 510  = 17 s
const P1 = 0;
const P2 = 60;
const P3 = 150;
const P4 = 245;
const P5 = 315;
const P6 = 375;
const P7 = 450;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fadeIn(frame: number, start: number, dur = 18): number {
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

function sp(frame: number, start: number, damping = 14, stiffness = 160, mass = 0.7): number {
  return spring({ frame: frame - start, fps: 30, config: { damping, stiffness, mass } });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      padding: '5px 14px',
      borderRadius: 100,
      backgroundColor: `${color}18`,
      border: `1px solid ${color}44`,
      color,
      fontSize: 16,
      fontWeight: 600,
      fontFamily,
    }}>
      {label}
    </span>
  );
}

function OptionCard({
  translateX,
  color,
  icon,
  title,
  subtitle,
  tags,
  tagsOpacity,
}: {
  translateX: number;
  color: string;
  icon: string;
  title: string;
  subtitle: string;
  tags: string[];
  tagsOpacity: number;
}) {
  return (
    <div style={{ transform: `translateX(${translateX}px)` }}>
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${color}33`,
        borderRadius: 24,
        padding: '40px 44px',
        width: 540,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
        boxShadow: `0 0 48px ${color}12, inset 0 1px 0 rgba(255,255,255,0.05)`,
        fontFamily,
      }}>
        {/* Icon badge */}
        <div style={{
          width: 68,
          height: 68,
          borderRadius: 18,
          backgroundColor: `${color}20`,
          border: `1.5px solid ${color}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
        }}>
          {icon}
        </div>

        {/* Title */}
        <div style={{
          fontSize: 30,
          fontWeight: 700,
          color,
          textAlign: 'center',
          lineHeight: 1.2,
        }}>
          {title}
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 18,
          color: 'rgba(255,255,255,0.45)',
          textAlign: 'center',
          lineHeight: 1.6,
        }}>
          {subtitle}
        </div>

        {/* Tags */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'center',
          opacity: tagsOpacity,
        }}>
          {tags.map(t => <Tag key={t} label={t} color={color} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export const ConnectorsMcpExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  useVideoConfig();

  // ── Android section visibility ─────────────────────────────────────────────
  const androidIn  = fadeIn(frame, P1, 20);
  const androidOut = interpolate(frame, [P4 + 5, P4 + 35], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const androidOpacity = frame < P4 + 5 ? androidIn : androidOut;

  // Android logo spring
  const androidLogoSp = sp(frame, P1 + 5);
  const androidLogoScale = interpolate(androidLogoSp, [0, 1], [0.4, 1]);

  // Card springs
  const leftSp  = sp(frame, P2, 14, 140);
  const rightSp = sp(frame, P2 + 8, 14, 140);
  const leftX   = interpolate(leftSp,  [0, 1], [-600, 0]);
  const rightX  = interpolate(rightSp, [0, 1], [600, 0]);

  // Examples opacity
  const examplesOpacity = fadeIn(frame, P3 + 15, 20);

  // ── Bridge ─────────────────────────────────────────────────────────────────
  const bridgeIn  = fadeIn(frame, P4, 18);
  const bridgeOut = interpolate(frame, [P5 - 25, P5], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const bridgeOpacity = frame < P5 - 25 ? bridgeIn : bridgeOut;

  const bridgeSp    = sp(frame, P4, 10, 200, 0.5);
  const bridgeScale = interpolate(bridgeSp, [0, 1], [0.55, 1]);

  const sameTextOp   = fadeIn(frame, P4, 15);
  const exactTextOp  = fadeIn(frame, P4 + 18, 15);
  const bridgeSubOp  = fadeIn(frame, P4 + 32, 15);

  // ── Claude section visibility ──────────────────────────────────────────────
  const claudeOpacity = fadeIn(frame, P5, 22);

  const claudeLogoSp    = sp(frame, P5 + 5);
  const claudeLogoScale = interpolate(claudeLogoSp, [0, 1], [0.4, 1]);

  const claudeLeftSp  = sp(frame, P6, 14, 140);
  const claudeRightSp = sp(frame, P6 + 8, 14, 140);
  const claudeLeftX   = interpolate(claudeLeftSp,  [0, 1], [-600, 0]);
  const claudeRightX  = interpolate(claudeRightSp, [0, 1], [600, 0]);

  const claudeTagsOp = fadeIn(frame, P6 + 35, 20);

  // ── MCP banner ─────────────────────────────────────────────────────────────
  const mcpBannerSp = sp(frame, P7, 12, 180, 0.6);
  const mcpBannerY  = interpolate(mcpBannerSp, [0, 1], [80, 0]);
  const mcpBannerOp = fadeIn(frame, P7, 16);

  const mcpWord1 = fadeIn(frame, P7 + 10, 12);
  const mcpWord2 = fadeIn(frame, P7 + 22, 12);
  const mcpWord3 = fadeIn(frame, P7 + 34, 12);
  const mcpSub   = fadeIn(frame, P7 + 48, 16);

  // Pulse on MCP badge
  const mcpPulse = frame >= P7 + 10
    ? 1 + Math.sin(((frame - P7 - 10) / 30) * 2 * Math.PI * 0.8) * 0.04
    : 1;

  const isAndroidPhase = frame < P5;
  const isClaudePhase  = frame >= P5;

  return (
    <AbsoluteFill style={{ backgroundColor: '#07070f', overflow: 'hidden', fontFamily }}>

      {/* Dot-grid background */}
      <AbsoluteFill style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.032) 1px, transparent 1px)',
        backgroundSize: '52px 52px',
        pointerEvents: 'none',
      }} />

      {/* ── ANDROID SECTION ──────────────────────────────────────────────────── */}
      {isAndroidPhase && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 56,
          opacity: androidOpacity,
        }}>

          {/* Logo + title row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 28,
            transform: `scale(${androidLogoScale})`,
          }}>
            <Img
              src={staticFile('android logo.png')}
              style={{
                width: 96, height: 96, objectFit: 'contain',
                filter: `drop-shadow(0 0 22px ${ANDROID_GREEN}80)`,
              }}
            />
            <div>
              <div style={{ fontSize: 54, fontWeight: 800, color: ANDROID_GREEN, letterSpacing: -1, lineHeight: 1 }}>
                App Store
              </div>
              <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.38)', fontWeight: 400, marginTop: 6 }}>
                Android's marketplace for apps
              </div>
            </div>
          </div>

          {/* Two cards */}
          {frame >= P2 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <OptionCard
                translateX={leftX}
                color={BLUE}
                icon="⬇"
                title="Download Pre-built"
                subtitle={'Apps built by others,\nready to install instantly'}
                tags={['Gmail', 'Spotify', 'Maps', 'YouTube']}
                tagsOpacity={examplesOpacity}
              />

              <div style={{
                fontSize: 26, fontWeight: 700,
                color: 'rgba(255,255,255,0.22)', width: 48, textAlign: 'center',
              }}>
                or
              </div>

              <OptionCard
                translateX={rightX}
                color={PURPLE}
                icon="🔧"
                title="Build It Yourself"
                subtitle={'Write your own app\nusing the Android SDK'}
                tags={['Kotlin', 'Java', 'Android SDK', 'Studio']}
                tagsOpacity={examplesOpacity}
              />
            </div>
          )}

          {/* Context note */}
          {frame >= P3 && (
            <div style={{
              opacity: fadeIn(frame, P3, 20),
              fontSize: 18, color: 'rgba(255,255,255,0.28)',
              fontWeight: 400, letterSpacing: 0.3,
            }}>
              Millions of apps available — or total flexibility to create your own
            </div>
          )}
        </div>
      )}

      {/* ── BRIDGE ───────────────────────────────────────────────────────────── */}
      {frame >= P4 && frame < P5 + 5 && (
        <AbsoluteFill style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: bridgeOpacity,
        }}>
          <div style={{
            textAlign: 'center',
            transform: `scale(${bridgeScale})`,
          }}>
            <div style={{ fontSize: 26, color: 'rgba(255,255,255,0.35)', fontWeight: 400, marginBottom: 14, opacity: sameTextOp }}>
              Claude Connectors are...
            </div>
            <div style={{ fontSize: 108, fontWeight: 800, color: '#fff', letterSpacing: -4, lineHeight: 1, opacity: sameTextOp }}>
              The Same
            </div>
            <div style={{ fontSize: 56, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: 2, marginTop: 8, opacity: exactTextOp }}>
              exact thing.
            </div>
            <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.28)', marginTop: 28, opacity: bridgeSubOp }}>
              Just a different name — and a different underlying technology
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ── CLAUDE SECTION ───────────────────────────────────────────────────── */}
      {isClaudePhase && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 44,
          opacity: claudeOpacity,
        }}>

          {/* Logo + title */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 28,
            transform: `scale(${claudeLogoScale})`,
          }}>
            <Img
              src={staticFile('claudelogo.png')}
              style={{
                width: 96, height: 96, objectFit: 'contain',
                filter: `drop-shadow(0 0 22px ${CLAUDE_TAN}80)`,
              }}
            />
            <div>
              <div style={{ fontSize: 54, fontWeight: 800, color: CLAUDE_TAN, letterSpacing: -1, lineHeight: 1 }}>
                Connectors
              </div>
              <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.38)', fontWeight: 400, marginTop: 6 }}>
                Claude's marketplace for AI tools
              </div>
            </div>
          </div>

          {/* Two cards */}
          {frame >= P6 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <OptionCard
                translateX={claudeLeftX}
                color={BLUE}
                icon="⬇"
                title="Pre-built Connectors"
                subtitle={'MCP servers built by others,\nready to plug into Claude'}
                tags={['GitHub', 'Slack', 'Google Drive', 'Linear']}
                tagsOpacity={claudeTagsOp}
              />

              <div style={{
                fontSize: 26, fontWeight: 700,
                color: 'rgba(255,255,255,0.22)', width: 48, textAlign: 'center',
              }}>
                or
              </div>

              <OptionCard
                translateX={claudeRightX}
                color={PURPLE}
                icon="🔧"
                title="Build Your Own"
                subtitle={'Write a custom MCP server\nfor any tool or workflow'}
                tags={['Python', 'TypeScript', 'Any API', 'MCP SDK']}
                tagsOpacity={claudeTagsOp}
              />
            </div>
          )}

          {/* MCP banner */}
          {frame >= P7 && (
            <div style={{
              transform: `translateY(${mcpBannerY}px) scale(${mcpPulse})`,
              opacity: mcpBannerOp,
              backgroundColor: `${GOLD}14`,
              border: `1.5px solid ${GOLD}50`,
              borderRadius: 18,
              padding: '22px 52px',
              display: 'flex',
              alignItems: 'center',
              gap: 36,
            }}>
              {/* MCP acronym badge */}
              <div style={{
                fontSize: 28, fontWeight: 800, color: GOLD,
                letterSpacing: 7,
                filter: `drop-shadow(0 0 10px ${GOLD}88)`,
              }}>
                MCP
              </div>

              <div style={{ width: 1.5, height: 36, backgroundColor: `${GOLD}38` }} />

              {/* Word reveal */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ opacity: mcpWord1, fontSize: 22, fontWeight: 700, color: GOLD }}>Model</span>
                <span style={{ opacity: mcpWord2, fontSize: 22, fontWeight: 700, color: GOLD }}>Context</span>
                <span style={{ opacity: mcpWord3, fontSize: 22, fontWeight: 700, color: GOLD }}>Protocol</span>
              </div>

              <div style={{ width: 1.5, height: 36, backgroundColor: `${GOLD}38` }} />

              {/* Sub-description */}
              <div style={{
                opacity: mcpSub,
                fontSize: 17, color: 'rgba(255,255,255,0.42)',
                maxWidth: 300, lineHeight: 1.5,
              }}>
                The open standard powering every connector — pre-built or custom
              </div>
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
