import type { Category, Feat } from '../types';

/**
 * Authoritative feat catalog, ported verbatim from the design prototype's `CAT`
 * array (Impressive-O-Meter.dc.html). The sub-scores and weighting are the
 * source of truth — see scoring.ts.
 *
 * Two additions beyond the prototype, both in service of the headline missing
 * feature (exact times / exact handicap rather than coarse buckets):
 *   - every parameterized level carries an `anchor` (the real-world value its
 *     scores correspond to), so exact input can be interpolated between buckets.
 *   - every parameterized feat carries a `metric` describing its input widget.
 */
export const FEATS: Feat[] = [
  {
    id: 'run_5k', name: 'Run a 5K', emoji: '🏃', category: 'Running',
    metric: { kind: 'time', format: 'mmss', label: 'Your 5K time', placeholder: 'mm:ss', lowerIsBetter: true },
    levels: [
      { label: 'Just finished', anchor: 2400, s: { r: 32, de: 28, el: 5, di: 35 } },   // 40:00
      { label: 'Sub-30 min', anchor: 1800, s: { r: 44, de: 36, el: 12, di: 44 } },      // 30:00
      { label: 'Sub-25 min', anchor: 1500, s: { r: 60, de: 50, el: 24, di: 54 } },      // 25:00
      { label: 'Sub-20 min', anchor: 1200, s: { r: 80, de: 70, el: 50, di: 66 } },      // 20:00
      { label: 'Sub-17 min', anchor: 1020, s: { r: 93, de: 86, el: 80, di: 76 } },      // 17:00
    ],
  },
  {
    id: 'mile', name: 'Run a Mile', emoji: '🏃', category: 'Running',
    metric: { kind: 'time', format: 'mmss', label: 'Your mile time', placeholder: 'mm:ss', lowerIsBetter: true },
    levels: [
      { label: 'Sub-10 min', anchor: 600, s: { r: 30, de: 26, el: 6, di: 34 } },
      { label: 'Sub-8 min', anchor: 480, s: { r: 46, de: 38, el: 16, di: 46 } },
      { label: 'Sub-6 min', anchor: 360, s: { r: 74, de: 62, el: 48, di: 66 } },
      { label: 'Sub-5 min', anchor: 300, s: { r: 92, de: 84, el: 80, di: 80 } },
    ],
  },
  {
    id: 'marathon', name: 'Run a Marathon', emoji: '🏅', category: 'Running',
    metric: { kind: 'time', format: 'hmmss', label: 'Your marathon time', placeholder: 'h:mm:ss', lowerIsBetter: true },
    levels: [
      { label: 'Finished it', anchor: 19800, s: { r: 78, de: 75, el: 34, di: 80 } },    // 5:30:00
      { label: 'Sub-4:00', anchor: 14400, s: { r: 84, de: 80, el: 46, di: 84 } },       // 4:00:00
      { label: 'Sub-3:30', anchor: 12600, s: { r: 90, de: 86, el: 60, di: 88 } },       // 3:30:00
      { label: 'Boston Qualifier', anchor: 10800, s: { r: 95, de: 92, el: 76, di: 91 } }, // ~3:00:00
      { label: 'Sub-2:45', anchor: 9900, s: { r: 98, de: 96, el: 90, di: 95 } },        // 2:45:00
    ],
  },
  {
    id: 'bench', name: 'Bench Press', emoji: '🏋️', category: 'Strength',
    metric: { kind: 'liftRatio', label: 'Bench / bodyweight', lowerIsBetter: false },
    levels: [
      { label: 'Bodyweight', anchor: 1.0, s: { r: 55, de: 50, el: 24, di: 60 } },
      { label: '1.5× bodyweight', anchor: 1.5, s: { r: 74, de: 68, el: 48, di: 74 } },
      { label: '2× bodyweight', anchor: 2.0, s: { r: 90, de: 85, el: 72, di: 86 } },
      { label: '2.5× bodyweight', anchor: 2.5, s: { r: 97, de: 94, el: 90, di: 93 } },
    ],
  },
  {
    id: 'deadlift', name: 'Deadlift', emoji: '🏋️', category: 'Strength',
    metric: { kind: 'liftRatio', label: 'Deadlift / bodyweight', lowerIsBetter: false },
    levels: [
      { label: '2× bodyweight', anchor: 2.0, s: { r: 62, de: 58, el: 30, di: 70 } },
      { label: '2.5× bodyweight', anchor: 2.5, s: { r: 80, de: 76, el: 58, di: 82 } },
      { label: '3× bodyweight', anchor: 3.0, s: { r: 93, de: 90, el: 82, di: 91 } },
      { label: '4× bodyweight', anchor: 4.0, s: { r: 99, de: 98, el: 97, di: 98 } },
    ],
  },
  {
    id: 'pullups', name: 'Do Pull-Ups', emoji: '💪', category: 'Strength',
    metric: { kind: 'count', label: 'Max reps in a row', unit: 'reps', placeholder: 'e.g. 14', step: 1, lowerIsBetter: false },
    levels: [
      { label: '1 clean rep', anchor: 1, s: { r: 42, de: 30, el: 6, di: 46 } },
      { label: '10 in a row', anchor: 10, s: { r: 62, de: 50, el: 22, di: 60 } },
      { label: '20 in a row', anchor: 20, s: { r: 83, de: 72, el: 52, di: 78 } },
      { label: '30+ in a row', anchor: 30, s: { r: 94, de: 87, el: 78, di: 88 } },
    ],
  },
  { id: 'muscleup', name: 'Do a Muscle-Up', emoji: '🤸', category: 'Strength', s: { r: 84, de: 70, el: 55, di: 80 } },
  { id: 'pushups', name: '100 Push-Ups Straight', emoji: '💪', category: 'Strength', s: { r: 70, de: 58, el: 34, di: 62 } },
  {
    id: 'golf', name: 'Golf Handicap', emoji: '⛳', category: 'Golf',
    metric: { kind: 'count', label: 'Handicap index', unit: '', placeholder: 'e.g. 12.4', step: 0.1, lowerIsBetter: true },
    levels: [
      { label: 'Handicap ~25', anchor: 25, s: { r: 30, de: 35, el: 8, di: 30 } },
      { label: 'Handicap ~15', anchor: 15, s: { r: 50, de: 54, el: 22, di: 42 } },
      { label: 'Handicap ~10', anchor: 10, s: { r: 64, de: 66, el: 36, di: 50 } },
      { label: 'Handicap ~5', anchor: 5, s: { r: 81, de: 80, el: 60, di: 62 } },
      { label: 'Scratch (0)', anchor: 0, s: { r: 93, de: 92, el: 83, di: 73 } },
    ],
  },
  { id: 'holeinone', name: 'Hit a Hole-in-One', emoji: '⛳', category: 'Golf', s: { r: 88, de: 32, el: 40, di: 34 } },
  { id: 'dunk', name: 'Dunk a Basketball', emoji: '🏀', category: 'Skill', s: { r: 80, de: 54, el: 55, di: 78 } },
  { id: 'splits', name: 'Do the Full Splits', emoji: '🤸', category: 'Skill', s: { r: 62, de: 60, el: 30, di: 55 } },
  { id: 'climb', name: 'Climb a 5.11 Route', emoji: '🧗', category: 'Skill', s: { r: 80, de: 72, el: 48, di: 78 } },
  { id: 'bowl300', name: 'Bowl a Perfect 300', emoji: '🎳', category: 'Skill', s: { r: 85, de: 60, el: 55, di: 48 } },
  { id: 'plank', name: 'Hold a 5-Min Plank', emoji: '🧘', category: 'Skill', s: { r: 55, de: 46, el: 24, di: 58 } },
  { id: 'swim', name: 'Swim a Mile Nonstop', emoji: '🏊', category: 'Endurance', s: { r: 58, de: 55, el: 28, di: 62 } },
  { id: 'century', name: 'Bike a Century (100mi)', emoji: '🚴', category: 'Endurance', s: { r: 72, de: 70, el: 40, di: 78 } },
  { id: 'ironman', name: 'Finish an Ironman', emoji: '⚡', category: 'Endurance', s: { r: 90, de: 90, el: 62, di: 95 } },
  { id: 'ultra', name: 'Run a 100-Mile Ultra', emoji: '🏔️', category: 'Endurance', s: { r: 96, de: 95, el: 78, di: 98 } },
  { id: 'worldcup', name: 'Win the World Cup', emoji: '🏆', category: 'Championship', s: { r: 99.8, de: 99, el: 100, di: 96 } },
  { id: 'olympic', name: 'Win Olympic Gold', emoji: '🥇', category: 'Championship', s: { r: 99.5, de: 99, el: 100, di: 93 } },
  { id: 'nba', name: 'Win the NBA Finals', emoji: '🏀', category: 'Championship', s: { r: 99.7, de: 99, el: 99.5, di: 94 } },
  { id: 'superbowl', name: 'Win the Super Bowl', emoji: '🏈', category: 'Championship', s: { r: 99.7, de: 99, el: 99, di: 96 } },
  { id: 'tdf', name: 'Win the Tour de France', emoji: '🚲', category: 'Championship', s: { r: 99.6, de: 99.5, el: 100, di: 99 } },
  { id: 'wimbledon', name: 'Win Wimbledon', emoji: '🎾', category: 'Championship', s: { r: 99.6, de: 99, el: 99.8, di: 92 } },
  { id: 'stanley', name: 'Win the Stanley Cup', emoji: '🏒', category: 'Championship', s: { r: 99.5, de: 98.5, el: 99, di: 95 } },
  { id: 'masters', name: 'Win the Masters', emoji: '⛳', category: 'Championship', s: { r: 99.5, de: 98.5, el: 99.5, di: 85 } },
  { id: 'ufc', name: 'Win a UFC Title', emoji: '🥊', category: 'Championship', s: { r: 99.4, de: 98, el: 99, di: 97 } },
];

export const CAT_ORDER: Category[] = ['Running', 'Strength', 'Golf', 'Skill', 'Endurance', 'Championship'];

export const FEATS_BY_ID: Record<string, Feat> = Object.fromEntries(FEATS.map((f) => [f.id, f]));
