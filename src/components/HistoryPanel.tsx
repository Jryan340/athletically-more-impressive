import { useEffect, useState } from 'react';
import type { BattleRecord } from '../lib/history';
import { relativeTime } from '../lib/history';

type Props = {
  history: BattleRecord[];
  onRematch: (record: BattleRecord) => void;
  onClear: () => void;
};

export default function HistoryPanel({ history, onRematch, onClear }: Props) {
  // Re-tick relative timestamps once a minute so "just now" → "1m ago".
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  if (history.length === 0) return null;

  return (
    <section className="history">
      <div className="history-head">
        <div className="history-title">RECENT BATTLES</div>
        <button type="button" className="history-clear" onClick={onClear}>
          CLEAR
        </button>
      </div>

      <div className="history-list">
        {history.map((b) => {
          const draw = b.winner === 'draw';
          return (
            <button
              type="button"
              key={b.id}
              className="history-row"
              onClick={() => onRematch(b)}
              title="Load this matchup again"
            >
              <Side combatant={b.left} win={b.winner === 'left'} draw={draw} side="left" />
              <div className="history-vs">
                <span className="history-vs-label">{draw ? 'DRAW' : 'VS'}</span>
                <span className="history-time">{relativeTime(b.ts, now)}</span>
              </div>
              <Side combatant={b.right} win={b.winner === 'right'} draw={draw} side="right" />
              <span className="history-rematch">↻ Rematch</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Side({
  combatant,
  win,
  draw,
  side,
}: {
  combatant: BattleRecord['left'];
  win: boolean;
  draw: boolean;
  side: 'left' | 'right';
}) {
  return (
    <div className={`history-side history-side-${side}${win ? ' is-winner' : ''}`}>
      <span className="history-emoji">{combatant.emoji}</span>
      <span className="history-meta">
        <span className="history-name">
          {!draw && win && <span className="history-crown">👑 </span>}
          {combatant.name}
        </span>
        <span className="history-sub">{combatant.sub}</span>
      </span>
      <span className={`history-score ${side === 'left' ? 'red' : 'blue'}`}>
        {combatant.score.toFixed(1)}
      </span>
    </div>
  );
}
