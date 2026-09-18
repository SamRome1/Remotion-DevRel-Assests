# Video Brief — Jev: Pick, Don't Generate

Composition: `JevConfidencePicker` (`src/Compositions/JevConfidencePicker.tsx`), 1080x1920, 30fps, 660 frames (22s).
Placement: standalone vertical short, visuals only — user voices over the picture-lock live, so beat timing is the sync target. On-screen text is limited to diagram labels and short takeaway captions.

Reference: the "paper blueprint" explainer style of @MatijaSosic's 45s Jev TL;DR on X (status 2100190746389135772) — sections 01 "How an LLM answers" and 02 "How Jev answers", adapted to 9:16 by stacking the two panels vertically. Sections 03/04 of the reference (game loop, can/can't) are out of scope for this script.

## 0. Format
- Canvas: 1080x1920, 30fps
- Placement / context: standalone 9:16 short
- Total duration: 660 frames (22s)
- Voiceover: attached script, paced to the beats below:
  1. "See a normal llm takes your input and generates an answer one token at a time." → Scene 1
  2. "Which means you can also generate garbage, one token at a time." → Scene 2
  3. "But jev doesn't actually generate anything, you hand it a list of possible answers" → Scene 3
  4. "and it can only pick from that list with a confidence score." → Scene 4

## 1. VISUAL SYSTEM — apply to every scene, no exceptions
The reference's blueprint *layout* on the Supabase *palette*. Tokens live in `src/blueprint.ts` (which pulls colors from `src/tokens.ts`).
- Background: `BG` `#0f0f0f`, with a 2px hairline frame inset 40px and a hard 6px green-tinted offset shadow (the reference's paper-on-desk gag, recolored). No gradients, no noise, no dot grid.
- Panels: `SURFACE_100` `#1a1a1a`, 2px `rgba(255,255,255,0.3)` border, square corners, 64px header row with a bold title and a muted subtitle, 32px body padding.
- Typography: JetBrains Mono for everything (via `@remotion/google-fonts`, weights 400/500/700). `FG` primary, `rgba(255,255,255,0.72)` captions, `FG_LIGHT` notes/subtitles.
- Accents: `GREEN` `#3ecf8e` with `#0f0f0f` text on it (chips: section number, request token, timer when fast, winning option label and bar, takeaway) and `rgba(62,207,142,0.18)` (the question highlight, newest token). Green chips carry a soft `0 0 18px` green glow. `RED` `#f04040` / `rgba(240,64,64,0.2)` only for the LLM's slow timer and garbage tokens. No other color.
- Layout: shared grid in `src/Components/Blueprint.tsx` — YOUR APP panel at y=250 (h=250), a vertical connector at x=540, the answer panel at y=680, notes under the answer panel, takeaway at y=1600. Every scene places panels on these lines so hard cuts read as continuous.
- Motion language: the reference cuts hard and types. Entrances are 6-frame fades with a 6px rise (`stamp()`), the "req"/"CLEAN" chip travels linearly along the connector, bars fill linearly, the caret blinks. No springs, no overshoot, no scale.
- Timing: token typing is deliberately slow (6 f/token clean, 4 f/token garbage) while the timer counts to a red 8.5s; Jev's bars fill together in 30 frames under a yellow 0.1s. Hold the final Jev state for the last ~150 frames.

## 2. ASSET RULES
As in `docs/VIDEO_BRIEF_TEMPLATE.md`.

- Jev / TypeSafe AI has no separate product logo; the company's official mark was pulled from typesafe.ai's live site assets, isolated from its pink circle, and recolored (sanctioned for a pure monochrome mark). Variants in `public/assets/`: `jev-mark-white.png` (used at 60% in Scene 4's footer), `jev-mark-green.png`, `jev-mark-black.png` (kept for a light-canvas variant).
- The "normal LLM" is depicted abstractly — no competitor names or marks.

### Assets batch (run before any scenes)
1. Jev/TypeSafe mark (white variant) — `public/assets/jev-mark-white.png` — verified in `AssetCheck`.

## 3. ARCHITECTURE
- Theme: `src/blueprint.ts` (colors, mono font, `itp`, `stamp`, `fadeOut`). Do not import `src/tokens.ts` or `src/theme.ts` here.
- Shared components in `src/Components/Blueprint.tsx`: `Frame`, `SectionTitle`, `Panel`, `AppPanel`, `Chip`, `Highlight`, `Connector` (with traveling chip), `Timer`, `TypedTokens`, `ScoreRow`, `Note`, `Takeaway`. Plus `JevMark` (`src/Components/JevMark.tsx`).
- Load-bearing: `AppPanel` + `Connector` + the layout constants appear in all four scenes; `TypedTokens`/`Timer` in Scenes 1–2; `ScoreRow` in Scenes 3–4 (`OPTIONS` and `JEV_PANEL_H` are exported from Scene 3 and reused by Scene 4).
- Scenes are one file each in `src/scenes/` (prefixed `JevBp*`), sequenced with `<Series>` in the composition, registered in `Root.tsx`.

## 4. SCENES

### Scene 1 — LlmClean (0–165f, 5.5s)
Beat A (0–20f): section title "01 HOW AN LLM ANSWERS" stamps in; YOUR APP panel with "is this invoice fraud?" (pale-yellow highlight); the LLM panel ("LLM generating...") stamps in empty; the connector draws.
Beat B (30–48f): a yellow "req" chip travels down the connector into the LLM panel; the grey timer appears at 0.0s.
Beat C (50–152f): 17 tokens type out at 6 f/token — "Based on the line items and the vendor history , this invoice appears to be legitimate ." — newest token pale-yellow, block caret blinking. Timer counts 0.0→8.5s and turns into a red chip on the last token.
Beat D (128–165f): takeaway "it writes a sentence, one token at a time." + yellow chip "8.5 seconds".
On-screen text: as above.
Sanctioned exceptions: none.

### Scene 2 — LlmGarbage (165–290f, 4.2s)
Same layout, already in place (no re-entrance). The LLM body is empty again, timer back to 0.0s.
Beat A (0–16f): "req" chip travels down again.
Beat B (18–102f): 21 tokens at 4 f/token — "Based on the vendor history , this invoice is fraud . Actually it is legitimate . Approve and refund twice ." From token 12 ("Actually") on, tokens are red on pale red; the newest bad token is solid red with paper text. Timer counts to a red 8.5s.
Beat C (88–125f): takeaway "same process. same confidence. garbage." + pale-red chip "one token at a time".
Sanctioned exceptions: red is used here (the only place besides the slow timer).

### Scene 3 — HandOptions (290–380f, 3s)
HARD CUT.
Beat A (0–30f): title "02 HOW JEV ANSWERS", YOUR APP panel (same place), JEV panel ("JEV your options, scored"), connector draws — no chip yet.
Beat B (30–60f): three option rows FRAUD / CLEAN / REVIEW stamp in 12 frames apart with empty bars and no numbers — the list is the user's, not Jev's.
Beat C (64–90f): grey note "you hand it the list. / it can't add to it." Hold.

### Scene 4 — Scored (380–660f, 9.3s)
Beat A (0–18f): "req" chip travels down; timer appears 0.0s.
Beat B (18–52f): timer ticks to 0.1s and becomes a yellow chip; all three bars fill simultaneously (0.07 / 0.88 / 0.05, numbers counting) — parallel, not staggered. CLEAN's label turns yellow at f46; its bar is black, the others grey.
Beat C (56–86f): grey note "no tokens. one parallel pass. / every option scored at once."; a "CLEAN" chip travels back up the connector to YOUR APP.
Beat D (100–130f): takeaway "it can't write. it points at one of YOUR options." + yellow chip "0.1 seconds"; small footer "jev · typesafe.ai" with the black mark.
Beat E (130–280f): HOLD on the finished state.

## 5. Delivery
- Render target: `out/JevConfidencePicker.mp4`
- Verify: stills from every scene reviewed before the full render
- Commit and push to GitHub when done
