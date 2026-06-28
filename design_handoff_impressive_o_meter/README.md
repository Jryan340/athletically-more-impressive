# Handoff: The Impressive-O-Meter

A head-to-head web app that compares two athletic achievements and declares which is **more athletically impressive**, scored across four dimensions in an ESPN "tale of the tape" style.

---

## About the Design Files

`Impressive-O-Meter.dc.html` in this bundle is a **design reference / working prototype built in HTML**. It shows the intended look, scoring logic, and interaction flow — it is **not** production code to ship as-is. Your job is to **recreate this design in the target codebase's environment** (React, Next.js, Vue, SwiftUI, etc.) using that project's established patterns, component library, and styling system.

If there is **no existing codebase yet**, the recommended stack is **React + TypeScript + Vite** with **Tailwind** (or CSS Modules). The scoring model and data are framework-agnostic — lift them directly (see _Scoring Model_ and _Data_ below).

> The prototype uses a small in-house reactive runtime (`support.js`). Ignore that file — it is only there to make the HTML interactive. Do not port it. Re-implement state with the target framework's native primitives.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, layout, and interactions are all intended as shown. Recreate the UI faithfully, but swap the styling mechanism for the codebase's conventions.

---

## Product Concept

User picks two athletic feats (one per "corner"), optionally sets a skill level for each (e.g. your actual 5K time or golf handicap), hits a button, and gets:
- a **winner** with a big score (0–100),
- a one-line **verdict / trash talk**,
- a **tale-of-the-tape** breakdown across 4 dimensions.

The point is to settle bar arguments — "is my golf handicap more impressive than your 5K time?" — and also handle elite-vs-elite ("World Cup vs NBA Finals").

---

## Screens / Views

### 1. Arena (default)
**Purpose:** Choose the two feats to compare.

**Layout:** Centered single column, `max-width: 1080px`. Top to bottom:
1. **Header bar** (full width, sticky-feeling): left = two colored dots (red, blue) + wordmark `THE IMPRESSIVE-O-METER` (Anton). Right = `TALE OF THE TAPE` kicker. `border-bottom: 1px solid var(--line)`.
2. **Hero**: gold kicker `SETTLE IT ONCE AND FOR ALL`, headline `WHO'S MORE IMPRESSIVE?` (Anton, `clamp(34px,7vw,72px)`, "IMPRESSIVE?" in gold), muted subhead.
3. **Corners row**: flex row, `gap:14px`. Collapses to **column** below **720px**. Three children: Red corner card, `VS` medallion, Blue corner card. Each card `flex:1`.
4. **Action**: centered button. When both corners are filled → gold `SCORE THE BATTLE ⚖️`. Otherwise → disabled-looking `PICK BOTH CORNERS`.

**Corner card (empty state):** dashed border in the corner color (`--red` left / `--blue` right), big `＋`, `CHOOSE A FEAT` (Anton), helper text.

**Corner card (filled state):** emoji + feat name (Anton 25px) + category caption. If the feat has levels, a `YOUR LEVEL` row of selectable pills (active pill filled with corner color). A `CHANGE FEAT` ghost button. The blue (right) corner mirrors layout to the right (`flex-direction: row-reverse`, right-aligned text).

### 2. Picker (modal overlay)
**Purpose:** Search and select a feat for the active corner.

**Layout:** Fixed full-screen scrim (`rgba(5,7,12,.74)`, `backdrop-filter: blur(4px)`). Centered panel `max-width:680px`, `--bg2` background, rounded `18px`, column flex, `max-height:100%`.
- Header: title colored by corner (`🔴 RED CORNER — PICK A FEAT` / `🔵 BLUE CORNER — PICK A FEAT`) + `✕` close.
- Search `<input>` (filters by feat name, case-insensitive).
- **Category chips** (pill row): `All`, `Running`, `Strength`, `Golf`, `Skill`, `Endurance`, `Championship`. Active chip = gold fill.
- **Grouped results**: each category header (Anton) over a responsive grid `repeat(auto-fill, minmax(150px,1fr))` of feat buttons (emoji + name). Hover → gold border.

Selecting a feat closes the picker, assigns it to the corner, and defaults the level to index `min(1, lastLevel)` (a sensible mid level, not the easiest).

### 3. Battle flash (transient)
On `SCORE THE BATTLE`, an **820ms** full-screen overlay shows `FIGHT!` (Anton, gold, glow) with a scale/rotate keyframe (`fightFlash`), then transitions to the verdict.

### 4. Verdict
**Purpose:** Show the result.

**Layout:** Centered column `max-width:880px`, enters with `popIn` (0.5s). Top to bottom:
1. **Winner banner**: gold kicker `AND THE MORE IMPRESSIVE FEAT IS…`, winner emoji (54px), winner name (Anton, `clamp(30px,6.5vw,58px)`). Draw → `IT'S A DRAW` + 🤝.
2. **Scoreboard**: 3-col grid `1fr auto 1fr`. Each side panel = emoji, feat name, level sublabel, big score (Anton 46px in corner color). Winner panel gets a gold inset ring + gold tint + `★ WINNER`. Center `VS`.
3. **Trash talk**: full-width card, quoted verdict line.
4. **Tale of the tape**: `— TALE OF THE TAPE —` header, then 4 rows. Each row is a 3-col grid `1fr 128px 1fr`: left value + leftward red bar, centered dimension label + sub, rightward blue bar + right value. Bars animate in with `barIn` (scaleX from the outer edge). The higher value per dimension is shown in its corner color; the loser is muted.
5. **Actions**: `↔ SWAP CORNERS`, `✎ EDIT FEATS` (returns to arena keeping picks), `NEW BATTLE` (gold, clears picks).

---

## Scoring Model (the core logic — port this exactly)

Every feat carries four sub-scores on a **0–100** scale:
- `r`  — **Rarity**: how few people could ever do it
- `el` — **Elite level**: closeness to world-class
- `de` — **Dedication**: time, reps & grind required
- `di` — **Difficulty**: raw physical demand

**Overall impressiveness** is a weighted average (rarity and elite dominate):

```
overall = 0.35*r + 0.30*el + 0.20*de + 0.15*di
```

Displayed to one decimal. Comparison:
- `diff = leftOverall - rightOverall`
- `|diff| <= 0.05` → **draw**
- else higher overall wins.

Per-dimension winner (for bar coloring) = whichever side has the higher raw sub-score for that dimension.

**Feats with levels** (5K, mile, marathon, bench, deadlift, pull-ups, golf handicap) store a `levels[]` array; the selected level supplies the `{r,de,el,di}` used. Feats without levels store a single `s` object.

### Verdict copy generator
Based on margin `m = |diff|` (with a "trash talk" flag, default on):
- draw → "Dead heat. The judges went to the scorecards and... they can't split them. Genuine coin-flip."
- `m < 1.5` → "{winner} takes it by a fingernail. {loser} can hold its head high — barely."
- `m < 5` → "Nail-biter! {winner} edges out {loser} when it counts."
- `m < 15` → "{winner} clearly outclasses {loser}. Solid effort, but not enough tonight."
- else → "Not. Even. Close. {winner} sent {loser} home to think about its life choices."
- trash talk OFF → "By the numbers, {winner} grades out as the more impressive feat."

---

## Data

~28 feats. Schema:

```ts
type Score = { r: number; de: number; el: number; di: number }; // 0–100
type Feat = {
  id: string;
  name: string;
  emoji: string;
  category: 'Running'|'Strength'|'Golf'|'Skill'|'Endurance'|'Championship';
  s?: Score;                          // fixed feats
  levels?: { label: string; s: Score }[]; // parameterized feats
};
```

The full populated array lives in the `CAT` field of the logic class inside `Impressive-O-Meter.dc.html` — copy it verbatim into a `feats.ts` data module. Category display order: `Running, Strength, Golf, Skill, Endurance, Championship`.

Sanity checks (so you know the port is correct):
- World Cup overall ≈ **99.1**, NBA Finals ≈ **98.6** → World Cup wins a nail-biter.
- 5K "Sub-20 min" ≈ 66.9; Golf handicap ~5 ≈ 71.7 → handicap 5 edges sub-20 5K.

---

## State Management

```ts
view: 'arena' | 'verdict'        // 'battling' is a transient sub-state
leftId, rightId: string | null   // selected feat ids
leftLvl, rightLvl: number         // selected level index per side
pickerOpen: boolean
pickerSlot: 'left' | 'right'
query: string                     // picker search
cat: string                       // active category chip ('All' + categories)
battling: boolean                 // shows FIGHT! overlay
confetti: ConfettiPiece[]         // generated on entering verdict
```

Transitions:
- `openPicker(slot)` → set slot, clear query, `cat='All'`, open.
- `choose(id)` → assign to active slot, default level `min(1, levels-1)`, close picker.
- `fight()` → guard both selected → `battling=true` → after 820ms → `view='verdict'`, generate confetti.
- `swap()` → exchange left/right ids + levels.
- `rematch()` (`EDIT FEATS`) → `view='arena'`, keep picks.
- `newBattle()` → `view='arena'`, clear all picks.

No data fetching — everything is local.

---

## Design Tokens

Colors are theme-driven CSS custom properties. **Three themes** (a tweak in the prototype — keep as a setting or pick "Dark Arena" as default):

### Dark Arena (default)
| Token | Value |
|---|---|
| `--bg` | `#0b0e14` |
| `--bg2` (panels) | `#161c28` |
| `--bg3` (tracks/inputs) | `#1e2636` |
| `--text` | `#f4f7fb` |
| `--muted` | `#8a94a8` |
| `--line` | `rgba(255,255,255,.10)` |
| `--red` (left corner) | `#ff3d45` |
| `--blue` (right corner) | `#2f80ff` |
| `--gold` (winner/accent) | `#ffd23f` |
| `--spot` (glow) | `rgba(255,210,63,.12)` |

### Neon Night
bg `#0a0612` · bg2 `#160d22` · bg3 `#211531` · text `#f6f0ff` · muted `#9b86c4` · line `rgba(180,140,255,.18)` · red `#ff2e7e` · blue `#19d4ff` · gold `#c6ff3d` · spot `rgba(198,255,61,.16)`

### Daytime Stadium (light)
bg `#eceff4` · bg2 `#ffffff` · bg3 `#eef1f6` · text `#131722` · muted `#5a6478` · line `rgba(20,30,50,.13)` · red `#e23a44` · blue `#2563eb` · gold `#e0a400` · spot `rgba(224,164,0,.16)`

Soft corner fills: `--redSoft`/`--blueSoft` are the red/blue at ~14% alpha (used for card gradients).

### Typography
- **Display**: `Anton` (Google Fonts) — wordmark, headlines, feat names, scores, labels. Wide letter-spacing (`.04–.18em`).
- **Body/UI**: `Archivo` (Google Fonts), weights 400–900.
- Numeric scores use Anton at 46px (scoreboard) for the "scoreboard" feel.

### Spacing / radius / motion
- Card radius `18px`; pills/buttons `8–14px`; bar tracks `999px`.
- Card padding `18px`; modal padding `14–18px`.
- Breakpoint: corners stack below **720px**.
- Animations (keyframes): `confettiFall` (~2.4–4.2s linear, 74 pieces), `popIn` (.5s verdict entrance), `barIn` (.7s `cubic-bezier(.2,.8,.2,1)`, scaleX from outer edge), `fightFlash` (.8s), `vsPulse` (2.4s infinite on the arena VS).
- Confetti piece: 7–15px, square or circle, colors `[gold, red, blue, white]`, drops from `-12vh` to `118vh` with rotation.

---

## Assets
No image assets. Icons are **Unicode emoji** (🏃 ⛳ 🏋️ 💪 🏀 🏆 🥇 🏈 🚲 🎾 🏒 🥊 🤸 🧗 🎳 🧘 🏊 🚴 ⚡ 🏔️ 🏅). In a production codebase, consider swapping for a consistent icon set (e.g. sport pictograms) per the team's design system; emoji are fine for an MVP.

---

## Suggested Build-Out (priorities for the next iteration)

These are natural extensions the prototype is structured for:

1. **Numeric inputs instead of buckets.** Replace level pills with a real input (your exact 5K time `mm:ss`, handicap number, lift in kg/lb + bodyweight) and interpolate the sub-scores between bracket anchors. This is the single biggest credibility upgrade.
2. **Rarity percentile line.** Surface "Top X% of people" under each score, derived from `rarity`. Show a source/methodology link to build trust.
3. **Shareable result card.** Generate an OG image / copy-link of the verdict for texting to your friend. (The whole app is a "settle the argument" tool — sharing is the viral loop.)
4. **More feats + custom feat.** Expand the catalog; allow a free-text "Other" that maps to the nearest known feat or lets the user set rough sliders.
5. **Persistence + history.** Save recent battles to `localStorage`; "rematch history."
6. **Methodology page.** Explain the 4 dimensions and weights so the scores feel earned, not arbitrary.
7. **Tunable weights (admin/debug).** Expose the `0.35/0.30/0.20/0.15` weights behind a dev flag to calibrate.
8. **Accessibility pass.** Keyboard nav for the picker, focus traps in the modal, `aria-live` on the verdict, prefers-reduced-motion for confetti/flash.

---

## Files
- `Impressive-O-Meter.dc.html` — the full working prototype (arena, picker, battle, verdict). Contains the authoritative `CAT` feat data and all scoring logic in its embedded logic class. **This is the source of truth** for data and numbers.
