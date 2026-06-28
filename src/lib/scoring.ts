import type { ComputedScore, Feat, Score } from '../types';
import { interpolateScore } from './metrics';

/**
 * Overall impressiveness — weighted average, rarity and elite dominate.
 * Ported exactly from the prototype: overall = 0.35*r + 0.30*el + 0.20*de + 0.15*di
 */
export function overallOf(s: Score): number {
  return 0.35 * s.r + 0.3 * s.el + 0.2 * s.de + 0.15 * s.di;
}

/** Resolve a feat + exact value into final sub-scores and overall. */
export function computeScore(feat: Feat, value: number | null): ComputedScore {
  const s: Score = feat.levels
    ? interpolateScore(feat, value ?? feat.levels[0].anchor)
    : feat.s ?? { r: 0, de: 0, el: 0, di: 0 };
  return { ...s, overall: overallOf(s) };
}

export const DRAW_EPSILON = 0.05;

export type Outcome = {
  draw: boolean;
  leftWin: boolean;
  rightWin: boolean;
  margin: number; // |diff|
};

export function compare(left: ComputedScore, right: ComputedScore): Outcome {
  const diff = left.overall - right.overall;
  const margin = Math.abs(diff);
  return {
    draw: margin <= DRAW_EPSILON,
    leftWin: diff > DRAW_EPSILON,
    rightWin: diff < -DRAW_EPSILON,
    margin,
  };
}

/** Trash-talk / verdict copy keyed on margin. Ported from the prototype. */
export function talkLine(
  winName: string,
  loseName: string,
  margin: number,
  draw: boolean,
  trashTalk: boolean,
): string {
  if (draw)
    return "Dead heat. The judges went to the scorecards and... they can't split them. Genuine coin-flip.";
  if (!trashTalk)
    return `By the numbers, ${winName} grades out as the more impressive feat.`;
  if (margin < 1.5)
    return `${winName} takes it by a fingernail. ${loseName} can hold its head high — barely.`;
  if (margin < 5) return `Nail-biter! ${winName} edges out ${loseName} when it counts.`;
  if (margin < 15)
    return `${winName} clearly outclasses ${loseName}. Solid effort, but not enough tonight.`;
  return `Not. Even. Close. ${winName} sent ${loseName} home to think about its life choices.`;
}

export const DIMENSIONS = [
  { key: 'r', label: 'RARITY', sub: 'how few can pull it off' },
  { key: 'el', label: 'ELITE LEVEL', sub: 'closeness to world-class' },
  { key: 'de', label: 'DEDICATION', sub: 'time, reps & grind' },
  { key: 'di', label: 'DIFFICULTY', sub: 'raw physical demand' },
] as const;
