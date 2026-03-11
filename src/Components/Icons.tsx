/**
 * Icon system for Supabase Remotion compositions.
 *
 * Two sources:
 *   1. Supabase product icons — inline SVGs matching Supabase's visual style
 *      (24×24 viewBox, stroke-based, 1.5 strokeWidth, fill="none")
 *   2. Lucide icons — re-exported with consistent naming for standard UI use
 *
 * Usage in compositions:
 *   import { iconColor } from '../tokens';
 *   import { IconDatabase, IconAuth, Lock } from '../components/Icons';
 *
 *   // Inside your component, pass to TreeNode's svgIcon prop:
 *   svgIcon={<IconDatabase color={iconColor(glow)} />}
 *   svgIcon={<Lock size={20} strokeWidth={1.5} color={iconColor(glow)} />}
 */

import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Shared props
// ─────────────────────────────────────────────────────────────────────────────

export interface IconProps {
  size?:        number;
  color?:       string;
  strokeWidth?: number;
}

const defaults = {
  size:        20,
  color:       'rgba(255,255,255,0.4)',
  strokeWidth: 1.5,
};

// ─────────────────────────────────────────────────────────────────────────────
// Supabase product icons (inline SVG)
// These match Supabase's dashboard navigation icons.
// Spec: viewBox="0 0 24 24", fill="none", stroke-based, strokeLinecap="round"
// ─────────────────────────────────────────────────────────────────────────────

/** Database / Postgres — stacked cylinder */
export const IconDatabase: React.FC<IconProps> = ({
  size        = defaults.size,
  color       = defaults.color,
  strokeWidth = defaults.strokeWidth,
}) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round"
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

/** Auth — shield */
export const IconAuth: React.FC<IconProps> = ({
  size        = defaults.size,
  color       = defaults.color,
  strokeWidth = defaults.strokeWidth,
}) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round"
  >
    <path d="M12 2L4 5v6c0 5.25 3.4 10.14 8 12 4.6-1.86 8-6.75 8-12V5l-8-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

/** Storage — folder with upload arrow */
export const IconStorage: React.FC<IconProps> = ({
  size        = defaults.size,
  color       = defaults.color,
  strokeWidth = defaults.strokeWidth,
}) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round"
  >
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    <polyline points="12 11 12 17" />
    <polyline points="9 14 12 11 15 14" />
  </svg>
);

/** Realtime — broadcast / signal waves */
export const IconRealtime: React.FC<IconProps> = ({
  size        = defaults.size,
  color       = defaults.color,
  strokeWidth = defaults.strokeWidth,
}) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

/** Edge Functions — terminal prompt */
export const IconEdgeFunctions: React.FC<IconProps> = ({
  size        = defaults.size,
  color       = defaults.color,
  strokeWidth = defaults.strokeWidth,
}) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round"
  >
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

/** SQL / Query — code brackets */
export const IconSQL: React.FC<IconProps> = ({
  size        = defaults.size,
  color       = defaults.color,
  strokeWidth = defaults.strokeWidth,
}) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

/** User / Identity */
export const IconUser: React.FC<IconProps> = ({
  size        = defaults.size,
  color       = defaults.color,
  strokeWidth = defaults.strokeWidth,
}) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Lucide re-exports — standard UI icons
// Import and use exactly like Lucide: <Lock size={20} strokeWidth={1.5} color={...} />
// ─────────────────────────────────────────────────────────────────────────────

export {
  // Auth / security
  Lock,
  Unlock,
  ShieldCheck,
  Shield,
  Key,
  KeyRound,

  // Storage / files
  HardDrive,
  FolderOpen,
  UploadCloud,

  // Realtime / async
  Zap,
  Radio,

  // Functions / code
  Code,
  Terminal,

  // Users
  User,
  Users,

  // Flow / arrows
  ArrowRight,
  MoveRight,

  // Status
  Check,
  CheckCircle,
  X,
  XCircle,

  // URL / links
  Link,
  ExternalLink,
} from 'lucide-react';
