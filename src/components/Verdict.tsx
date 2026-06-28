import type { ComputedScore, Feat, Selection } from '../types';
import { compare, DIMENSIONS, talkLine } from '../lib/scoring';
import { valueSubLabel } from '../lib/metrics';

type Props = {
  leftFeat: Feat;
  rightFeat: Feat;
  leftSel: Selection;
  rightSel: Selection;
  leftScore: ComputedScore;
  rightScore: ComputedScore;
  trashTalk: boolean;
  onSwap: () => void;
  onEdit: () => void;
  onNewBattle: () => void;
};

export default function Verdict({
  leftFeat,
  rightFeat,
  leftSel,
  rightSel,
  leftScore,
  rightScore,
  trashTalk,
  onSwap,
  onEdit,
  onNewBattle,
}: Props) {
  const outcome = compare(leftScore, rightScore);
  const { draw, leftWin } = outcome;

  const winFeat = leftWin ? leftFeat : rightFeat;
  const loseFeat = leftWin ? rightFeat : leftFeat;

  const kicker = draw ? 'The judges have spoken' : 'And the more impressive feat is…';
  const banner = draw ? "IT'S A DRAW" : winFeat.name.toUpperCase();
  const winnerEmoji = draw ? '🤝' : winFeat.emoji;
  const talk = talkLine(winFeat.name, loseFeat.name, outcome.margin, draw, trashTalk);

  return (
    <div className="verdict" aria-live="polite">
      <div className="winner-banner">
        <div className="winner-kicker">{kicker}</div>
        <div className="winner-emoji">{winnerEmoji}</div>
        <h2 className="winner-name">{banner}</h2>
      </div>

      <div className="scoreboard">
        <ScorePanel
          feat={leftFeat}
          sel={leftSel}
          score={leftScore}
          side="red"
          win={outcome.leftWin}
        />
        <div className="score-vs">
          <span>VS</span>
        </div>
        <ScorePanel
          feat={rightFeat}
          sel={rightSel}
          score={rightScore}
          side="blue"
          win={outcome.rightWin}
        />
      </div>

      <div className="trash">“{talk}”</div>

      <div className="tape-title">— TALE OF THE TAPE —</div>
      <div className="tape-rows">
        {DIMENSIONS.map((d) => {
          const lv = leftScore[d.key];
          const rv = rightScore[d.key];
          const lw = lv > rv;
          const rw = rv > lv;
          return (
            <div className="tape-row" key={d.key}>
              <div className="tape-left">
                <span className={`tape-val${lw ? ' red' : ''}`}>{Math.round(lv)}</span>
                <div className="tape-track">
                  <div
                    className="tape-fill red"
                    style={{ width: `${Math.max(2, Math.round(lv))}%` }}
                  />
                </div>
              </div>
              <div className="tape-mid">
                <div className="lbl">{d.label}</div>
                <div className="sub">{d.sub}</div>
              </div>
              <div className="tape-right">
                <div className="tape-track">
                  <div
                    className="tape-fill blue"
                    style={{ width: `${Math.max(2, Math.round(rv))}%` }}
                  />
                </div>
                <span className={`tape-val${rw ? ' blue' : ''}`}>{Math.round(rv)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="verdict-actions">
        <button type="button" className="act-btn" onClick={onSwap}>
          ↔ SWAP CORNERS
        </button>
        <button type="button" className="act-btn" onClick={onEdit}>
          ✎ EDIT FEATS
        </button>
        <button type="button" className="act-btn primary" onClick={onNewBattle}>
          NEW BATTLE
        </button>
      </div>
    </div>
  );
}

function ScorePanel({
  feat,
  sel,
  score,
  side,
  win,
}: {
  feat: Feat;
  sel: Selection;
  score: ComputedScore;
  side: 'red' | 'blue';
  win: boolean;
}) {
  return (
    <div className={`score-panel${win ? ' is-winner' : ''}`}>
      <div className="score-emoji">{feat.emoji}</div>
      <div className="score-feat">{feat.name}</div>
      <div className="score-sub">{valueSubLabel(feat, sel.value)}</div>
      <div className={`score-num ${side}`}>{score.overall.toFixed(1)}</div>
      {win && <div className="score-win">★ WINNER</div>}
    </div>
  );
}
