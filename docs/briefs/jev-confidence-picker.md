# Video Brief — Jev: Pick, Don't Generate

Composition: `JevConfidencePicker` (`src/Compositions/JevConfidencePicker.tsx`), 1080x1920, 30fps, 660 frames (22s).
Placement: standalone vertical short, visuals only — user is voicing over the entire thing live, so no on-screen VO captions; on-screen text is limited to load-bearing labels (token glyphs, the Jev wordmark, answer options, confidence scores).

## 0. Format
- Canvas: 1080x1920, 30fps
- Placement / context: standalone 9:16 short
- Total duration: 660 frames (22s)
- Voiceover: attached script, paced to match beats below (user records live over picture-lock, so beat timing is the sync target, not literal caption text):
  1. "See a normal llm takes your input and generates an answer one token at a time." → Scene 1
  2. "Which means you can also generate garbage, one token at a time." → Scene 2
  3. "But jev doesn't actually generate anything, you hand it a list of possible answers and it can only pick from that list with a confidence score." → Scenes 3–4

## 1. VISUAL SYSTEM — apply to every scene, no exceptions
- Background: `BG` (#0f0f0f) from `tokens.ts`, with `DotGrid` always mounted first + a slow ambient drift (a faint second dot layer or particles moving at ~2–4px/sec) so the canvas is never static — dense/kinetic per house style, not minimal black.
- Typography: Circular Std (`circularFamily` from `src/fonts.ts`) for headlines, the Jev wordmark, and confidence-score labels. `MONO` (JetBrains Mono, from `tokens.ts`) for the token stream and any raw-output text — it should read as machine output, not UI copy. `FG` primary, `FG_LIGHT`/`FG_MUTED` secondary.
- Accent: two accents, justified because this script explicitly contrasts two systems (generic LLM vs. Jev):
  - `GREEN` (#3ecf8e, from `tokens.ts`) — Jev, confidence, the selected answer.
  - `WARNING` (#f5a623, from `tokens.ts`) — the generic LLM's ungrounded/garbage generation. Do not introduce a third saturated color; TypeSafe's own brand pink is NOT used anywhere in this video.
- Layout: full-bleed, content reaches close to the frame edges (per house style — no dead space at top/bottom of the 1920px canvas). Token stream in Scenes 1–2 spans close to full width. Confidence list in Scene 4 fills the lower two-thirds of the canvas.
- Motion language: entrances use `sp()`/`spSlow()` from `tokens.ts` (damping 18/14, no overshoot except the sanctioned exception below). Stagger siblings 4–8 frames. Exits are quick opacity fades except the Scene 2→3 cut, which is a hard cut (no fade) to land "but jev doesn't actually generate anything" as a genuine tonal break.
- Emphasis: the winning answer card in Scene 4 is the one deliberate size change in the video — it scales 1.0→1.06 as it locks in, using `glowStyles(progress)` plus a green boxShadow glow. This overshoot-adjacent beat is sanctioned; it's the payoff moment. Every other emphasis moment uses glow/color only, no scale.
- Timing: Scenes 1–2 move fast and jittery (matches "token by token... garbage" — kinetic, not calm). Scene 3 is a hard, still beat (the pivot). Scene 4 opens fast (parallel evaluation) then holds still on the locked answer for the final ~25 frames — the one deliberate breath in the video.

## 2. ASSET RULES
As in `docs/VIDEO_BRIEF_TEMPLATE.md`.

- Jev / TypeSafe AI has no separate product-specific logo; the company's official brand mark (interlocking hexagon icon) was pulled from `typesafe.ai`'s live site assets (favicon/OG image, confirmed identical across both), isolated from its pink circle background, and recolored per "logos on black: use white/light variants" (sanctioned for pure monochrome marks). Two variants were produced:
  - `public/assets/jev-mark-white.png` — neutral use (Scene 3 reveal)
  - `public/assets/jev-mark-green.png` — lit/active use (Scene 4, top of the confidence list)
- No other third-party logos are used in this video (the "normal LLM" is depicted abstractly — a generic token stream, never a specific competitor's name or mark).

### Assets batch (run before any scenes)
1. Jev/TypeSafe mark (white variant) — extracted from typesafe.ai brand assets, saved to `public/assets/jev-mark-white.png`
2. Jev/TypeSafe mark (green variant) — same source, recolored, saved to `public/assets/jev-mark-green.png`

**Both assets exist locally as of this brief. Stop and report the file list before proceeding. Do not build scenes until confirmed via the `AssetCheck` composition.**

## 3. ARCHITECTURE
- Colors/fonts/spacing/spring helpers come from the existing `src/tokens.ts` and `src/fonts.ts` — no new theme file. Do not use `src/theme.ts` (that file is the separate ShortForm system: Inter + Postgres blue on 1080x1080/1080x1080; unrelated to this brief).
- New reusable components in `src/Components/`:
  - `<TokenStream>` — renders a wrapping stream of tokens appearing one at a time (mono). Takes a `corrupt` progress prop (0–1): at 0 tokens are clean English words in `FG`; as it rises toward 1, tokens glitch (jumbled glyphs, `WARNING` color, slight jitter transform). Load-bearing for Scenes 1 and 2 — build once, drive with different prop values, not two one-off implementations.
  - `<JevMark>` — renders the icon from `public/assets/jev-mark-{white|green}.png` at a given size with an optional glow (`glowStyles`). Load-bearing for Scenes 3 and 4.
  - `<ConfidenceList>` — renders a vertical stack of answer-option cards, each with a label and a confidence percentage; takes a `selectedIndex` and `lockProgress` to animate the winner's glow/scale-up and the others' dim-out. Load-bearing for Scene 4 only, but still built as a component per the architecture rule (not one-off JSX).
- Each scene is its own file in `src/scenes/`, sequenced with `<Series>` in `src/Compositions/JevConfidencePicker.tsx`, and the composition registered in `Root.tsx`. Prefix scene files `Jev*` to avoid colliding with the existing OpenAI/Postgres scene files already in `src/scenes/`.

## 4. SCENES

### Scene 1 — TokenStream (0–170f, 5.67s)
Beat A (0–20f): black canvas, DotGrid fades in. A thin mono input line types out fast at the top third (e.g. a short generic prompt like `> summarize this ticket`), syncs to "takes your input".
Beat B (20–170f): below it, `<TokenStream corrupt={0}>` streams out clean words one at a time, left-to-right, wrapping to new lines, each token popping in with a quick `sp()` scale/opacity — deliberately fast (roughly 1 token every 4–5 frames) to feel like real generation. Syncs to "generates an answer one token at a time." Tokens are neutral `FG` white/grey — no accent color yet, this is the unbranded "normal LLM."
On-screen text: the input line + streaming tokens (invented generic filler words, not real scraped text).
Load-bearing components: `<TokenStream>` (also used Scene 2).
Sanctioned exceptions: none.

### Scene 2 — Garbage (170–290f, 4s)
Beat A (0–60f): `<TokenStream>` continues from Scene 1's end state, `corrupt` ramping 0→0.6 — tokens start jittering slightly, a few glyphs flip to `WARNING` amber, occasional nonsense fragments creep in among real words. Syncs to "which means you can also generate garbage."
Beat B (60–120f): `corrupt` ramps 0.6→1 — most of the stream is now amber, jittery, visibly nonsensical (glyph soup, mismatched fragments), motion gets faster/more chaotic (higher jitter amplitude, tighter stagger). Syncs to "one token at a time" landing on the second, ironic repetition.
On-screen text: the same evolving token stream, now degrading.
Load-bearing components: `<TokenStream>` (shared instance/logic from Scene 1).
Sanctioned exceptions: none.

### Scene 3 — JevReveal (290–380f, 3s)
HARD CUT from Scene 2 — no fade, no transition. This is the tonal pivot ("But jev doesn't actually generate anything").
Beat A (0f): instant cut to pure black, all token noise gone.
Beat B (10–70f): `<JevMark variant="white">` scales/fades in centered (`spSlow`, 0.98→1.0, no overshoot), followed 8 frames later by the "Jev" wordmark in Circular Std beneath it (letter-spacing 1, weight synthesized bold acceptable).
Beat C (70–90f): hold the assembled lockup — this is the beat that carries "doesn't actually generate anything," give it room to breathe.
On-screen text: "Jev" only.
Load-bearing components: `<JevMark>` (also used Scene 4).
Sanctioned exceptions: none.

### Scene 4 — ConfidencePicker (380–660f, 9.33s)
The payoff — spend the most effort here.
Beat A (0–30f): `<JevMark variant="green" size="small">` docks to the top of the frame. Below it, `<ConfidenceList>` mounts with 4 answer-option cards (invented generic short labels, e.g. "Escalate to human", "Auto-approve", "Flag for review", "Reject"), each entering staggered 6 frames apart, all shown at a neutral/dim state with placeholder confidence values ticking rapidly (like they're being scored). Syncs to "you hand it a list of possible answers."
Beat B (30–90f): all 4 cards pulse together — a quick simultaneous glow ripple across all of them (NOT sequential/token-by-token — this is the whole point of the contrast: parallel evaluation, not generation) — while each card's confidence percentage rapidly counts/flickers through numbers. Syncs to "it can only pick from that list."
Beat C (90–140f): three cards dim to `FG_MUTED` and stop flickering; their percentages settle low (e.g. 4%, 9%, 11%). The winning card's percentage settles high (e.g. 94%) and the card scales 1.0→1.06, gets the `GREEN` glow via `glowStyles`, and a 1px green border brightens. This is the one sanctioned scale-emphasis in the video. Syncs to "with a confidence score."
Beat D (140–280f): HOLD. ~140 frames of stillness on the locked winning card with its confidence score — no new elements, no camera move. This is the closing image; resist adding anything else.
On-screen text: the 4 option labels and their confidence percentages only.
Load-bearing components: `<JevMark>`, `<ConfidenceList>`.
Sanctioned exceptions: the winning card's scale-up (see Motion language above).

## 5. Delivery
- Render target: `out/JevConfidencePicker.mp4`
- Verify: stills from every scene reviewed before the full render
- Commit and push to GitHub when done
