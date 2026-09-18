# Video Brief — Jev: Not like the others (mystery mark)

Composition: `JevMysteryLogo` (`src/Compositions/JevMysteryLogo.tsx`), 1080x1080, 30fps, 180 frames (6s, loopable hold from ~f120).
Brief step skipped per the user's standing "no more questions" instruction; this file records the decisions.

## 0. Format
- Canvas: 1080x1080, 30fps, 180f. Sits under the VO beat "because it's not like any of the others" while the product is still unnamed — the mark must stay unreadable.

## 1. VISUAL SYSTEM
Same as `docs/briefs/jev-confidence-picker.md` (blueprint layout on the Supabase dark palette, `src/blueprint.ts`).

## 2. ASSETS
`public/assets/jev-mark-black.png` (official TypeSafe mark, recolored `#1a1a1a` — the same as the panel surface, so the shape only reads through its glow). Verified in `AssetCheck`.

## 3. SCENE — JevMystery (single continuous scene, `src/scenes/JevMystery.tsx`)
- 0–30f: title `04 NOT LIKE THE OTHERS`; three generic `LLM · generating...` tiles stamp in across the top, each with a stalled grey token line and caret.
- 20f: the big `? · unknown model` panel stamps in with a `?? ms` chip (pale green) in its header.
- 30–70f: the blacked-out mark fades up inside the panel as an unreadable dark mass — `brightness(0.15)` plus a breathing 35–45px blur under a pulsing green halo and a soft radial backlight. The mark's line structure survives moderate blur (16px was still recognizable), so it must stay a blob — no sharpen flickers. The geometry must not be recognizable at any frame. A thin green scan line sweeps down the panel continuously.
- 70–100f: the three LLM tiles dim to 30% and a red strike draws through each, staggered.
- 95f+: a redacted label `id: ████████` types in beneath the mark and holds with a blinking caret.
- Hold to 180f; the halo pulse and scan line keep the frame alive.

## 4. Delivery
- Render target: `out/JevMysteryLogo.mp4`; verify stills; commit; push.
