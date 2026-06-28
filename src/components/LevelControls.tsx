import { useEffect, useState } from 'react';
import type { Feat, Selection, Side } from '../types';
import {
  formatTime,
  interpolateScore,
  liftRatio,
  parseCount,
  parseTime,
  rarityPercentile,
} from '../lib/metrics';

type Props = {
  feat: Feat;
  side: Side;
  value: number | null;
  lift: Selection['lift'];
  onValue: (value: number | null) => void;
  onLift: (lift: Selection['lift']) => void;
};

const ANCHOR_EPS = 1e-6;

/**
 * The "YOUR LEVEL" block: quick preset pills + an exact-value input.
 * Presets are a fast path; the exact input is the headline upgrade over the
 * prototype's buckets — type your real time / handicap / lift and the score is
 * interpolated between the surrounding anchors.
 */
export default function LevelControls({ feat, side, value, lift, onValue, onLift }: Props) {
  const metric = feat.metric;
  if (!feat.levels || !metric) return null;

  const pillClass = side === 'left' ? 'pill pill-red' : 'pill pill-blue';

  const percentile =
    value != null ? rarityPercentile(interpolateScore(feat, value).r) : null;

  return (
    <div>
      <div className="field-label">YOUR LEVEL</div>
      <div className="pills">
        {feat.levels.map((lv) => {
          const active = value != null && Math.abs(value - lv.anchor) < ANCHOR_EPS;
          return (
            <button
              key={lv.label}
              type="button"
              className={`${pillClass}${active ? ' is-active' : ''}`}
              onClick={() => {
                onValue(lv.anchor);
                if (metric.kind === 'liftRatio') {
                  onLift({ weight: '', bodyweight: '', unit: lift?.unit ?? 'lb' });
                }
              }}
            >
              {lv.label}
            </button>
          );
        })}
      </div>

      <div className="field-label" style={{ marginTop: 12 }}>
        {metric.label}
      </div>

      {metric.kind === 'time' && (
        <TimeInput
          value={value}
          format={metric.format}
          placeholder={metric.placeholder}
          onValue={onValue}
        />
      )}

      {metric.kind === 'count' && (
        <CountInput
          value={value}
          unit={metric.unit}
          placeholder={metric.placeholder}
          step={metric.step}
          onValue={onValue}
        />
      )}

      {metric.kind === 'liftRatio' && (
        <LiftInput value={value} lift={lift} onValue={onValue} onLift={onLift} />
      )}

      {percentile && <div className="exact-percentile">{percentile}</div>}
    </div>
  );
}

/* ---------------- time ---------------- */
function TimeInput({
  value,
  format,
  placeholder,
  onValue,
}: {
  value: number | null;
  format: 'mmss' | 'hmmss';
  placeholder: string;
  onValue: (v: number | null) => void;
}) {
  const [text, setText] = useState(value != null ? formatTime(value, format) : '');
  const [bad, setBad] = useState(false);

  // Re-sync when the value is changed from outside (preset / swap) and doesn't
  // already match what's typed.
  useEffect(() => {
    const parsed = parseTime(text, format);
    if (value != null && parsed !== value) setText(formatTime(value, format));
    if (value == null && text !== '') setText('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="exact-row">
      <input
        className={`exact-input${bad ? ' is-bad' : ''}`}
        inputMode="numeric"
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          const t = e.target.value;
          setText(t);
          if (t.trim() === '') {
            setBad(false);
            onValue(null);
            return;
          }
          const parsed = parseTime(t, format);
          if (parsed == null) {
            setBad(true);
          } else {
            setBad(false);
            onValue(parsed);
          }
        }}
      />
    </div>
  );
}

/* ---------------- count (handicap, reps) ---------------- */
function CountInput({
  value,
  unit,
  placeholder,
  step,
  onValue,
}: {
  value: number | null;
  unit: string;
  placeholder: string;
  step: number;
  onValue: (v: number | null) => void;
}) {
  const [text, setText] = useState(value != null ? trimNum(value) : '');

  useEffect(() => {
    const parsed = parseCount(text);
    if (value != null && parsed !== value) setText(trimNum(value));
    if (value == null && text !== '') setText('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="exact-row">
      <input
        className="exact-input"
        inputMode="decimal"
        type="number"
        step={step}
        min={0}
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          const t = e.target.value;
          setText(t);
          onValue(t.trim() === '' ? null : parseCount(t));
        }}
      />
      {unit && <span className="exact-unit">{unit}</span>}
    </div>
  );
}

/* ---------------- lift ratio (weight + bodyweight) ---------------- */
function LiftInput({
  value,
  lift,
  onValue,
  onLift,
}: {
  value: number | null;
  lift: Selection['lift'];
  onValue: (v: number | null) => void;
  onLift: (lift: Selection['lift']) => void;
}) {
  const unit = lift?.unit ?? 'lb';
  const weight = lift?.weight ?? '';
  const bodyweight = lift?.bodyweight ?? '';

  const update = (next: { weight?: string; bodyweight?: string; unit?: 'lb' | 'kg' }) => {
    const merged = { weight, bodyweight, unit, ...next };
    onLift(merged);
    onValue(liftRatio(merged.weight, merged.bodyweight));
  };

  return (
    <div className="exact">
      <div className="exact-row">
        <input
          className="exact-input"
          inputMode="decimal"
          type="number"
          min={0}
          placeholder="lift"
          value={weight}
          onChange={(e) => update({ weight: e.target.value })}
        />
        <span className="exact-unit">/</span>
        <input
          className="exact-input"
          inputMode="decimal"
          type="number"
          min={0}
          placeholder="bodyweight"
          value={bodyweight}
          onChange={(e) => update({ bodyweight: e.target.value })}
        />
        <div className="unit-toggle">
          <button
            type="button"
            className={unit === 'lb' ? 'is-active' : ''}
            onClick={() => update({ unit: 'lb' })}
          >
            lb
          </button>
          <button
            type="button"
            className={unit === 'kg' ? 'is-active' : ''}
            onClick={() => update({ unit: 'kg' })}
          >
            kg
          </button>
        </div>
      </div>
      {value != null && <div className="exact-hint">= {value.toFixed(2)}× bodyweight</div>}
    </div>
  );
}

function trimNum(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
}
