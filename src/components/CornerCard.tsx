import type { Feat, Selection, Side } from '../types';
import LevelControls from './LevelControls';

type Props = {
  side: Side;
  feat: Feat | null;
  selection: Selection;
  onPick: () => void;
  onValue: (value: number | null) => void;
  onLift: (lift: Selection['lift']) => void;
};

const EMPTY_HINT: Record<Side, string> = {
  left: '5K time, handicap, deadlift…',
  right: 'World Cup, marathon, dunk…',
};

export default function CornerCard({ side, feat, selection, onPick, onValue, onLift }: Props) {
  const isLeft = side === 'left';

  return (
    <div className={`corner ${isLeft ? 'corner-red' : 'corner-blue'}`}>
      <div className="corner-tag">{isLeft ? '🔴 RED CORNER' : 'BLUE CORNER 🔵'}</div>

      {feat ? (
        <div className="card-filled">
          <div className="card-head">
            <div className="card-emoji">{feat.emoji}</div>
            <div className="card-headtext">
              <div className="card-name">{feat.name}</div>
              <div className="card-cat">{feat.category}</div>
            </div>
          </div>

          {feat.levels && feat.metric && (
            <LevelControls
              feat={feat}
              side={side}
              value={selection.value}
              lift={selection.lift}
              onValue={onValue}
              onLift={onLift}
            />
          )}

          <button type="button" className="ghost-btn" onClick={onPick}>
            CHANGE FEAT
          </button>
        </div>
      ) : (
        <button type="button" className="card-empty" onClick={onPick}>
          <div className="plus">＋</div>
          <div className="label">CHOOSE A FEAT</div>
          <div className="sub">{EMPTY_HINT[side]}</div>
        </button>
      )}
    </div>
  );
}
