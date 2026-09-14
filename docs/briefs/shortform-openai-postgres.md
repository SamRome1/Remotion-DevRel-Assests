# Video Brief — ShortForm: OpenAI runs on one Postgres

Composition: `ShortForm` (`src/Compositions/ShortForm.tsx`), 1080x1080, 30fps, 2700 frames (90s).
Placement: upper half of a vertical short. Accent: Postgres blue #336791 (the brief's [ACCENT_HEX] placeholder was unfilled; blue was chosen because Scenes 7 and 10 call it out).

## 1. VISUAL SYSTEM — apply to every scene, no exceptions
- Background: pure black (#000000). No gradients, no vignettes, no noise unless explicitly requested.
- Typography: Inter for UI/headlines (weights 500–700), JetBrains Mono for code/technical labels. White (#FFFFFF) primary text, #A1A1AA (zinc-400) secondary. One accent color per project.
- Layout: generous negative space. Content lives in the center 80% safe zone. Never crowd edges.
- Motion language: elements enter with opacity 0→1 plus a subtle 12px rise, using spring({fps, frame, config: {damping: 200}}). No bounce, no overshoot, no rotation-based entrances. Exits are quick opacity fades (6–8 frames). Stagger sibling elements by 3–5 frames.
- Emphasis: scale from 0.98→1.0 on entry, never larger. Highlight moments use the accent color or a 1px border glow, not size changes.
- Timing: scenes are unhurried. Hold finished compositions for at least 20 frames before transitioning.

## 2. ASSET RULES
As in `docs/VIDEO_BRIEF_TEMPLATE.md`.

### Assets batch (run before any scenes)
1. OpenAI logo (white variant) — svgl.app
2. React logo — svgl.app
3. Next.js logo (white variant) — svgl.app
4. TypeScript logo — svgl.app
5. Rust logo (white/mono) — svgl.app or simpleicons
6. Python logo — svgl.app
7. Kubernetes logo — svgl.app
8. Microsoft Azure logo — svgl.app
9. PostgreSQL elephant (Slonik) — svgl.app, official blue #336791
10. GitHub logo (white) — svgl.app
Stop and report the file list before proceeding. Do not build scenes until all 10 exist locally.

## 3. ARCHITECTURE
- One shared theme.ts exporting colors, fonts, spacing, and spring configs. All components import from it.
- Reusable components: <SceneWrapper>, <Headline>, <MonoLabel>, <LogoBadge>, <CodeBlock>, <StatCounter>. Build scenes by composing these, not one-off JSX.
- Each scene is its own composition in src/scenes/, sequenced in Root.tsx with <Series>.
- Load-bearing: <ArchDiagram> (Scenes 1–5), <ReplicaTopology> (Scenes 6, 9).

## 4. SCENES

### Scene 1 — ColdOpen (0–135f, 4.5s)
Beat A (0–90f): OpenAI logo centered, white on black, entering with the standard rise. No text. Hold.
Beat B (90f): HARD CUT — no transition — to an empty architecture diagram: 5–6 hollow rounded-rect nodes (1px zinc-700 borders, no labels) connected by 1px lines, arranged like a system diagram. All boxes empty. Hold the empty diagram through frame 135.
Build the diagram as <ArchDiagram> with named slots (frontend, agent, backend, infra, db) so later scenes populate the same component. The db slot sits at bottom center, slightly larger. This component is load-bearing for Scenes 4 and 5 — do not build it as one-off JSX.
No words on screen in this scene.

### Scene 2 — FrontendReveal (135–420f, 9.5s)
Beat A (0–75f): a minimal fake browser chrome (1px-border top bar with a mono URL field) showing "chatgpt.com" typing out character by character in JetBrains Mono. Window body stays black — no attempt to recreate the ChatGPT UI.
Beat B (75–195f): the window flips to a view-source wall: 12–15 lines of dimmed zinc-600 mono text (generic minified-looking JSX/props gibberish, invented — NOT real scraped code). Two substrings highlight in white with a 1px underline, timed apart: "react" first (~f105), "__NEXT_DATA__" second (~f150).
Beat C (195–285f): source wall fades, React and Next.js logos (from assets) slide into the diagram's frontend slot as small badges. Hold the populated slot.
On-screen text: only "chatgpt.com" and the two highlighted substrings. Nothing else.

### Scene 3 — CodexRewrite (420–750f, 11s)
Recreate a GitHub-style repo language bar: full-width thin rounded bar, GitHub logo + "openai/codex" in mono above it (small, zinc-400).
Beat A (0–150f): bar enters and holds FULLY TypeScript blue (#3178C6), TypeScript logo badge left of it. This hold is deliberate — the drain must not start early. It covers the VO through "the terminal UI was literally running React".
Beat B (150–240f): on the VO's "until they rewrote", the bar drains to ~95% Rust (#DEA584) over ~60 frames with the standard spring — the TS segment shrinks to a sliver at the right edge. Rust logo badge crossfades in replacing the TS badge. A "95% Rust" mono label counts up alongside the drain.
Beat C (240–330f): hold the finished Rust bar. Optionally dock a small Rust badge into the diagram's agent slot in the final 30 frames.
On-screen text: "openai/codex" and "95% Rust" only.

### Scene 4 — BackendStack (750–855f, 3.5s)
FAST pacing — setup, not payoff.
Python, Kubernetes, and Azure logos punch into the diagram's backend/infra slots as logo+word lockups ("Python", "Kubernetes", "Azure" in Inter 500, zinc-400), staggered only 8 frames apart — deliberately faster than the house stagger. Each lands with a single quick 0.98→1.0 settle, no hold between them.
End state: the <ArchDiagram> now fully populated EXCEPT the db slot at bottom, which remains a conspicuous empty box. Hold that tension for the final 25 frames.

### Scene 5 — CollapseToElephant (855–1065f, 7s)
This is the centerpiece — spend effort here.
Beat A (0–30f): the full populated diagram from Scene 4 on screen.
Beat B (30–90f): every node and logo gets pulled toward the bottom-center db slot — positions converge with the standard spring but slower (damping 200, ~50 frame duration), elements shrinking and fading as they converge, like the diagram is being swallowed.
Beat C (90–130f): at the convergence point, the Postgres elephant (official blue asset) scales in 0.98→1.0, alone on pure black, centered. First color in the entire video.
Beat D (130–210f): HOLD. 80 frames of nothing but the elephant. No text. Resist adding anything — this hold covers the VO's "one database" landing and the breath after it.

### Scene 6 — ShardsOne (1065–1365f, 10s)
Beat A (0–40f): elephant shrinks and docks to the upper third. A solid node labeled "primary" (mono, small) draws in beneath it.
Beat B (40–160f): the replica fan populates SLOWLY — 40+ tiny 1px-border nodes spreading beneath the primary in rows, staggered ~3 frames apart so the cascade takes ~4 seconds. This must run while the VO says "about 40 to 50 read replicas" — the count filling in under the words is the sync moment of the scene.
Beat C (160–200f): brief hold on the completed topology (covers "behind it").
Beat D (200–260f): on the VO's "never sharded it", everything dims to 40% opacity and a single mono line types out center-frame: shards: 1
Beat E (260–300f): stillness. Hold "shards: 1" for the full 40 frames.
On-screen text: "primary", "shards: 1". Nothing else.

### Scene 7 — OpenLoop (1365–1470f, 3.5s)
Minimalist: black screen, single centered line in Inter 600 white: "1 database. 1,000,000,000 users."
The billion renders as a <StatCounter> spinning up from 0 over 35 frames.
Then a thin 1px accent-blue (#336791) line draws horizontally beneath it, left to right, over ~25 frames. No other elements. This scene is a breath before the rules section.

### Scene 8 — RuleDenied (1470–1635f, 5.5s)
Beat A (0–45f): a mono code line types center-frame: CREATE TABLE users_v2 (
Beat B (45–90f): hold the line — this covers "creating new tables is not permitted." Let it sit un-stamped so the second "not permitted" has something to hit.
Beat C (90f): on the VO's SECOND "not permitted", a stamp slams over it: "DENIED" in Inter 700, desaturated red (#EF4444 at 90%), rotated -6deg, 1px border box like a rubber stamp. Entry: scale 1.15→1.0 over 6 frames. THIS OVERSHOOT IS SANCTIONED — it is the one deliberate violation of the no-overshoot rule. It's a stamp; it should hit. Do not "fix" it.
A strikethrough draws left-to-right across the code line simultaneously.
Beat D (96–165f): hold the stamped composition.

### Scene 9 — RulesAndExile (1635–2100f, 15.5s)
Two distinct phases — do not compress the second.
PHASE 1 — Rules (0–210f): Three mono lines land one at a time, each synced to its VO phrase (roughly f0, f70, f140), each with a small drawn status glyph (strokes, not emoji):
  ALTER TABLE ... ADD COLUMN     ✓ (zinc-400 check)
  table rewrites                 ✗ (same red as Scene 8)
  CREATE INDEX CONCURRENTLY      ✓
Each line gets its own entrance; do NOT stagger them 10 frames apart — they track the VO's pace ("you can add a column" / "anything that rewrites a table is banned" / "every index gets built with CONCURRENTLY"). Hold the completed stack 30 frames.
PHASE 2 — Exile (210–465f): The rules stack fades. The Scene 6 topology reappears small at center with a dashed 1px boundary circle drawing in around it (~40 frames). Two unlabeled workload boxes approach from the left DELIBERATELY. They press against the boundary (~30 frames of resistance, boundary flashes faintly), get deflected, and slide off right (~50 frames). A second small db cylinder then draws in outside the boundary at frame ~380, and the exiled boxes settle next to it. Final 40 frames: hold the two-database end state — protected Postgres inside the circle, exile db outside.
On-screen text: only the three mono rule lines in Phase 1.

### Scene 10 — NineMonths (2100–2295f, 6.5s)
Pure type scene, center-framed, two mono lines: "9 months" / "1 SEV0". "9 months" enters at f20; a thin accent-blue rule draws between them; "1 SEV0" lands at f70 with a slightly heavier weight. (Optional blurred qps counter pre-beat was skipped — too short to read.) Hold the finished lockup from f110 to the end — this is a payoff, let it sit.

### Scene 11 — TheReceipt (2295–2490f, 6.5s)
A conference session listing card: 1px zinc-700 border card on black containing (Inter, small, real text): PGConf.dev 2025 / "Scaling Postgres to the Next Level at OpenAI" / Bohan Zhang · OpenAI. Clean citation card, not a screenshot recreation. Small Postgres elephant badge in the card corner. Enter with the standard rise at f20, fully assembled by f60, then hold ~135 frames. Slightly more "document" than "motion graphic."

### Scene 12 — Closer (2490–2700f, 7s)
Ending on a HARD CUT to black.
Beat A (0–40f): the Postgres elephant returns center, small.
Beat B (40–130f): beneath it, one mono line types out: the database from your tutorial
Beat C (130–210f): hold the lockup 80 frames, then cut to pure black INSTANTLY at the final frame — no fade, no outro, no logo sting, no subscribe element.
