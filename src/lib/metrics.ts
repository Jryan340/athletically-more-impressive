import type { Feat, Metric, Score } from '../types';

/**
 * The exact-input engine. The prototype only let you pick a coarse bucket
 * ("Sub-20 min"); these helpers let a user type their real time / handicap /
 * lift and get a score interpolated between the surrounding bucket anchors.
 */

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const lerpScore = (a: Score, b: Score, t: number): Score => ({
  r: lerp(a.r, b.r, t),
  de: lerp(a.de, b.de, t),
  el: lerp(a.el, b.el, t),
  di: lerp(a.di, b.di, t),
});

/**
 * Interpolate a feat's sub-scores at an exact `value`.
 * Anchors are listed easiest → hardest. Between two anchors we lerp; outside the
 * range we clamp to the nearer endpoint (you can't score better than the top
 * bucket or worse than the bottom one).
 */
export function interpolateScore(feat: Feat, value: number): Score {
  const levels = feat.levels;
  if (!levels || levels.length === 0) {
    return feat.s ?? { r: 0, de: 0, el: 0, di: 0 };
  }
  for (let i = 0; i < levels.length - 1; i++) {
    const a = levels[i].anchor;
    const b = levels[i + 1].anchor;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    if (value >= lo && value <= hi) {
      const t = a === b ? 0 : (value - a) / (b - a);
      return lerpScore(levels[i].s, levels[i + 1].s, t);
    }
  }
  // Outside the anchored range — clamp to whichever endpoint the value beats.
  const lowerIsBetter = feat.metric ? feat.metric.lowerIsBetter : false;
  const last = levels[levels.length - 1];
  const first = levels[0];
  const beatsLast = lowerIsBetter ? value <= last.anchor : value >= last.anchor;
  return beatsLast ? last.s : first.s;
}

/** Default exact value when a feat is first chosen — a sensible mid bucket. */
export function defaultValue(feat: Feat): number | null {
  if (!feat.levels || feat.levels.length === 0) return null;
  const idx = Math.min(1, feat.levels.length - 1);
  return feat.levels[idx].anchor;
}

// ---------------------------------------------------------------------------
// Parsing / formatting exact input
// ---------------------------------------------------------------------------

/** Parse "mm:ss", "h:mm:ss", or a plain digit string into seconds. */
export function parseTime(input: string, format: 'mmss' | 'hmmss'): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // No colon typed (e.g. iOS number pad has no ":" key) — interpret the digits
  // right-aligned: last two are seconds, then minutes, then hours.
  if (!trimmed.includes(':')) {
    const digits = trimmed.replace(/\D/g, '');
    if (!digits) return null;
    if (digits.length <= 2) return Number(digits) * 60; // bare 1–2 digits = minutes
    const ss = Number(digits.slice(-2));
    if (format === 'hmmss' && digits.length > 4) {
      const mm = Number(digits.slice(-4, -2));
      const hh = Number(digits.slice(0, -4));
      return hh * 3600 + mm * 60 + ss;
    }
    return Number(digits.slice(0, -2)) * 60 + ss;
  }

  const parts = trimmed.split(':').map((p) => p.trim());
  if (parts.some((p) => p === '' || isNaN(Number(p)))) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => n < 0)) return null;
  if (nums.length === 2) return nums[0] * 60 + nums[1];
  if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2];
  return null;
}

/**
 * Live mask for time fields: turn a raw digit string into "mm:ss" / "h:mm:ss"
 * by inserting colons from the right, so a phone number pad (no ":" key) can
 * still produce "16:13" by typing 1613.
 */
export function maskTime(raw: string, format: 'mmss' | 'hmmss'): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (format === 'hmmss') {
    const d = digits.slice(0, 6);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, -2)}:${d.slice(-2)}`;
    return `${d.slice(0, -4)}:${d.slice(-4, -2)}:${d.slice(-2)}`;
  }
  const d = digits.slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, -2)}:${d.slice(-2)}`;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function formatTime(seconds: number, format: 'mmss' | 'hmmss'): string {
  const total = Math.round(seconds);
  if (format === 'hmmss') {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${pad(s)}`;
}

/** Human-readable summary of an exact value, e.g. "19:30", "Handicap 7.2", "2.1× BW". */
export function formatValue(feat: Feat, value: number): string {
  const metric = feat.metric;
  if (!metric) return '';
  if (metric.kind === 'time') return formatTime(value, metric.format);
  if (metric.kind === 'liftRatio') return `${value.toFixed(2)}× BW`;
  // count
  const rounded = metric.step < 1 ? value.toFixed(1) : String(Math.round(value));
  return metric.unit ? `${rounded} ${metric.unit}` : rounded;
}

/** Short label shown under a feat name in the scoreboard. */
export function valueSubLabel(feat: Feat, value: number | null): string {
  if (value == null || !feat.metric) return feat.category;
  return formatValue(feat, value);
}

/** Parse a plain numeric field (handicap, reps). */
export function parseCount(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (isNaN(n) || n < 0) return null;
  return n;
}

/** Lift weight ÷ bodyweight → unit-independent ratio. */
export function liftRatio(weight: string, bodyweight: string): number | null {
  const w = Number(weight.trim());
  const bw = Number(bodyweight.trim());
  if (!weight.trim() || !bodyweight.trim()) return null;
  if (isNaN(w) || isNaN(bw) || w <= 0 || bw <= 0) return null;
  return w / bw;
}

/**
 * "Top X% of people" framing derived from a feat's rarity sub-score. Rough by
 * design — it exists to make the rarity number feel concrete, not to be exact.
 */
export function rarityPercentile(rarity: number): string {
  const pct = Math.max(0.01, 100 - rarity);
  if (pct >= 10) return `Top ${Math.round(pct)}% of people`;
  if (pct >= 1) return `Top ${pct.toFixed(1)}% of people`;
  if (pct >= 0.1) return `Top ${pct.toFixed(1)}%`;
  return 'Top 0.1% of people';
}

export type MetricKind = Metric['kind'];
