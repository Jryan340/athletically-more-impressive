import type { Selection } from '../types';

/**
 * Persistent battle history (localStorage). Each record keeps the exact
 * selections so a battle can be re-loaded ("rematch"), plus denormalized
 * display fields so the list renders without recomputation.
 */

export type Combatant = {
  sel: Selection;
  name: string;
  emoji: string;
  sub: string; // e.g. "19:00", "Handicap 7.0"
  score: number; // overall, 0–100
};

export type BattleRecord = {
  id: string;
  ts: number;
  left: Combatant;
  right: Combatant;
  winner: 'left' | 'right' | 'draw';
};

const KEY = 'iom.history.v1';
const MAX = 20;

export function loadHistory(): BattleRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BattleRecord[]) : [];
  } catch {
    return [];
  }
}

function persist(list: BattleRecord[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* quota / privacy mode — history is best-effort */
  }
}

/** Prepend a record and return the new (capped) list. */
export function addBattle(list: BattleRecord[], record: BattleRecord): BattleRecord[] {
  const next = [record, ...list].slice(0, MAX);
  persist(next);
  return next;
}

export function clearHistory(): BattleRecord[] {
  persist([]);
  return [];
}

export function makeId(ts: number): string {
  return `${ts}-${Math.floor((ts * 9301 + 49297) % 233280)}`;
}

/** Compact relative time: "just now", "5m ago", "2h ago", "3d ago". */
export function relativeTime(ts: number, now: number): string {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
