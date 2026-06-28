# The Impressive-O-Meter

A head-to-head web/mobile app that compares two athletic achievements and declares which is
**more athletically impressive** — scored across four dimensions in an ESPN "tale of the tape"
style. Settle the bar argument: _is my friend's golf handicap more impressive than my 5K time?_
Works for normal-people feats and elite-vs-elite (World Cup vs NBA Finals) alike.

Built with **React + TypeScript + Vite**. Responsive down to phone widths (the corners stack below
720px).

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle into dist/
npm run preview  # serve the production build
```

## How it works

1. **Pick two feats** — one per corner (red / blue) — from the searchable catalog (~28 feats across
   Running, Strength, Golf, Skill, Endurance, Championship).
2. **Dial in exactly how good you are.** This is the headline feature beyond the original design:
   parameterized feats take your **real value** — your actual 5K time (`mm:ss`), marathon time
   (`h:mm:ss`), golf handicap index, pull-up count, or lift-as-a-multiple-of-bodyweight — and the
   score is **interpolated between benchmark anchors** instead of snapping to a coarse bucket. Quick
   preset pills are still there as a fast path.
3. **Score the battle** → winner, a 0–100 score per side, a verdict line, and an animated
   tale-of-the-tape across the four dimensions.

### Scoring model

Every feat is graded 0–100 on four sub-scores and combined (rarity & elite dominate):

```
overall = 0.35·rarity + 0.30·elite + 0.20·dedication + 0.15·difficulty
```

`|diff| ≤ 0.05` is a draw, otherwise the higher overall wins. The model and feat data are ported
verbatim from the design prototype; sanity checks (World Cup ≈ 99.1 beats NBA ≈ 98.6; a sub-20 5K
≈ 66.9 loses to a ~5 handicap ≈ 71.7) all hold.

## Project layout

```
src/
  data/feats.ts        # authoritative feat catalog + per-feat metric + level anchors
  lib/metrics.ts       # exact-input parsing/formatting + anchor interpolation
  lib/scoring.ts       # weighted overall, comparison, verdict copy
  theme.ts             # three themes (Dark Arena / Neon Night / Daytime Stadium)
  components/          # Header, CornerCard, LevelControls, FeatPicker, Verdict, Confetti, Methodology
  App.tsx              # state machine: arena ↔ battle flash ↔ verdict
```

The original design handoff (reference prototype + spec) lives in
`design_handoff_impressive_o_meter/`.

## Notable additions over the handoff

- **Exact numeric input** with interpolation (the explicit gap in the original design).
- **"Top X% of people"** rarity framing under each exact value.
- **Methodology explainer** so the scores feel earned.
- **Theme switcher**, keyboard/escape handling in the picker, `aria-live` verdict, and
  `prefers-reduced-motion` support.
