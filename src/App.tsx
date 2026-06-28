import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import CornerCard from './components/CornerCard';
import FeatPicker from './components/FeatPicker';
import Verdict from './components/Verdict';
import Confetti from './components/Confetti';
import Methodology from './components/Methodology';
import HistoryPanel from './components/HistoryPanel';
import { FEATS_BY_ID } from './data/feats';
import { defaultValue, valueSubLabel } from './lib/metrics';
import { compare, computeScore } from './lib/scoring';
import {
  addBattle,
  clearHistory,
  loadHistory,
  makeId,
  type BattleRecord,
} from './lib/history';
import { applyTheme, type ThemeName } from './theme';
import type { Selection, Side } from './types';

const EMPTY: Selection = { featId: null, value: null };
const TRASH_TALK = true;

type View = 'arena' | 'verdict';

export default function App() {
  const [view, setView] = useState<View>('arena');
  const [theme, setTheme] = useState<ThemeName>('Dark Arena');
  const [left, setLeft] = useState<Selection>(EMPTY);
  const [right, setRight] = useState<Selection>(EMPTY);
  const [picker, setPicker] = useState<{ open: boolean; slot: Side }>({ open: false, slot: 'left' });
  const [battling, setBattling] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [history, setHistory] = useState<BattleRecord[]>(() => loadHistory());
  const flashTimer = useRef<number | null>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => () => { if (flashTimer.current) window.clearTimeout(flashTimer.current); }, []);

  const leftFeat = left.featId ? FEATS_BY_ID[left.featId] : null;
  const rightFeat = right.featId ? FEATS_BY_ID[right.featId] : null;

  const setSel = (slot: Side, patch: Partial<Selection>) =>
    (slot === 'left' ? setLeft : setRight)((s) => ({ ...s, ...patch }));

  const isReady = (sel: Selection): boolean => {
    if (!sel.featId) return false;
    const f = FEATS_BY_ID[sel.featId];
    return f.levels ? sel.value != null : true;
  };
  const ready = isReady(left) && isReady(right);

  const openPicker = (slot: Side) => setPicker({ open: true, slot });

  const choose = (id: string) => {
    const feat = FEATS_BY_ID[id];
    const sel: Selection = { featId: id, value: defaultValue(feat) };
    if (picker.slot === 'left') setLeft(sel);
    else setRight(sel);
    setPicker((p) => ({ ...p, open: false }));
  };

  const recordBattle = (l: Selection, r: Selection) => {
    const lf = l.featId ? FEATS_BY_ID[l.featId] : null;
    const rf = r.featId ? FEATS_BY_ID[r.featId] : null;
    if (!lf || !rf) return;
    const ls = computeScore(lf, l.value);
    const rs = computeScore(rf, r.value);
    const outcome = compare(ls, rs);
    const ts = Date.now();
    setHistory((h) =>
      addBattle(h, {
        id: makeId(ts),
        ts,
        winner: outcome.draw ? 'draw' : outcome.leftWin ? 'left' : 'right',
        left: { sel: l, name: lf.name, emoji: lf.emoji, sub: valueSubLabel(lf, l.value), score: ls.overall },
        right: { sel: r, name: rf.name, emoji: rf.emoji, sub: valueSubLabel(rf, r.value), score: rs.overall },
      }),
    );
  };

  // Play the FIGHT! flash, then reveal the verdict and log the battle.
  const runBattle = (l: Selection, r: Selection) => {
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    setBattling(true);
    flashTimer.current = window.setTimeout(() => {
      setBattling(false);
      setView('verdict');
      setConfettiKey((k) => k + 1);
      recordBattle(l, r);
    }, 820);
  };

  const fight = () => {
    if (!ready) return;
    runBattle(left, right);
  };

  const rematch = (record: BattleRecord) => {
    setLeft(record.left.sel);
    setRight(record.right.sel);
    runBattle(record.left.sel, record.right.sel);
  };

  const onClearHistory = () => setHistory(clearHistory());

  const swap = () => {
    setLeft(right);
    setRight(left);
  };

  const newBattle = () => {
    setLeft(EMPTY);
    setRight(EMPTY);
    setView('arena');
  };

  return (
    <div className="app">
      <div className="spotlight" />
      <Header theme={theme} onTheme={setTheme} />

      {view === 'arena' && (
        <main className="arena">
          <div className="hero">
            <div className="hero-kicker">Settle it once and for all</div>
            <h1>
              WHO'S MORE
              <br />
              <span className="gold">IMPRESSIVE?</span>
            </h1>
            <p>
              Load up two athletic feats, type in exactly how good you really are — your real 5K
              time, handicap or lift — and let the judges score it across four dimensions.
            </p>
          </div>

          <div className="corners">
            <CornerCard
              side="left"
              feat={leftFeat}
              selection={left}
              onPick={() => openPicker('left')}
              onValue={(value) => setSel('left', { value })}
              onLift={(lift) => setSel('left', { lift })}
            />
            <div className="vs-cell">
              <div className="vs-big">VS</div>
            </div>
            <CornerCard
              side="right"
              feat={rightFeat}
              selection={right}
              onPick={() => openPicker('right')}
              onValue={(value) => setSel('right', { value })}
              onLift={(lift) => setSel('right', { lift })}
            />
          </div>

          <div className="fight-wrap">
            {ready ? (
              <button type="button" className="fight-btn" onClick={fight}>
                SCORE THE BATTLE&nbsp;&nbsp;⚖️
              </button>
            ) : (
              <div className="fight-disabled">PICK BOTH CORNERS</div>
            )}
          </div>

          <HistoryPanel history={history} onRematch={rematch} onClear={onClearHistory} />
        </main>
      )}

      {view === 'verdict' && leftFeat && rightFeat && (
        <>
          <Verdict
            leftFeat={leftFeat}
            rightFeat={rightFeat}
            leftSel={left}
            rightSel={right}
            leftScore={computeScore(leftFeat, left.value)}
            rightScore={computeScore(rightFeat, right.value)}
            trashTalk={TRASH_TALK}
            onSwap={swap}
            onEdit={() => setView('arena')}
            onNewBattle={newBattle}
          />
          <Confetti key={confettiKey} />
        </>
      )}

      <Methodology />

      {battling && (
        <div className="flash-layer">
          <div className="flash-text">FIGHT!</div>
        </div>
      )}

      {picker.open && (
        <FeatPicker
          slot={picker.slot}
          onClose={() => setPicker((p) => ({ ...p, open: false }))}
          onChoose={choose}
        />
      )}
    </div>
  );
}
