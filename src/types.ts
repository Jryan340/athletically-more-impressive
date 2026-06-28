export type Score = { r: number; de: number; el: number; di: number }; // 0–100

export type Category =
  | 'Running'
  | 'Strength'
  | 'Golf'
  | 'Skill'
  | 'Endurance'
  | 'Championship';

/**
 * A preset bucket for a parameterized feat. `anchor` is the real-world value
 * (seconds for times, ratio for lifts, raw count/handicap otherwise) that this
 * bucket's scores correspond to. Exact user input is interpolated between
 * neighbouring anchors.
 */
export type Level = { label: string; s: Score; anchor: number };

/**
 * Describes how a parameterized feat collects an exact value from the user and
 * how that value is rendered back. The interpolation only ever sees the derived
 * numeric `value`; the metric governs the input widget and formatting.
 */
export type Metric =
  | {
      kind: 'time';
      /** smallest unit shown; mm:ss for short races, h:mm:ss for the marathon */
      format: 'mmss' | 'hmmss';
      label: string;
      placeholder: string;
      /** lower seconds = more impressive */
      lowerIsBetter: true;
    }
  | {
      kind: 'count';
      label: string;
      unit: string;
      placeholder: string;
      step: number;
      lowerIsBetter: boolean;
    }
  | {
      kind: 'liftRatio';
      label: string;
      /** weight ÷ bodyweight; unit cancels so lb/kg both work */
      lowerIsBetter: false;
    };

export type Feat = {
  id: string;
  name: string;
  emoji: string;
  category: Category;
  /** fixed feats */
  s?: Score;
  /** parameterized feats */
  levels?: Level[];
  metric?: Metric;
};

/** Per-side selection in the arena. */
export type Selection = {
  featId: string | null;
  /** normalized numeric value fed to interpolation (seconds / ratio / count) */
  value: number | null;
  /** raw lift inputs kept so the two-field widget stays editable */
  lift?: { weight: string; bodyweight: string; unit: 'lb' | 'kg' };
};

export type Side = 'left' | 'right';

export type ComputedScore = Score & { overall: number };
