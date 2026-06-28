/**
 * Collapsible explainer so the scores feel earned rather than arbitrary, and so
 * the "exact input" interpolation is transparent. Shown under both views.
 */
export default function Methodology() {
  return (
    <section className="methodology">
      <details>
        <summary>HOW THE SCORING WORKS</summary>
        <div className="methodology-body">
          <p>
            Every feat is graded 0–100 on four dimensions, then combined into one{' '}
            <b>impressiveness</b> score:
          </p>
          <ul>
            <li>
              <b>Rarity</b> (35%) — how few people could ever pull it off
            </li>
            <li>
              <b>Elite level</b> (30%) — how close it is to world-class
            </li>
            <li>
              <b>Dedication</b> (20%) — the time, reps and grind required
            </li>
            <li>
              <b>Difficulty</b> (15%) — the raw physical demand
            </li>
          </ul>
          <p>
            <code>overall = 0.35·rarity + 0.30·elite + 0.20·dedication + 0.15·difficulty</code>
          </p>
          <p>
            When you enter an <b>exact value</b> — a real 5K time, handicap, rep count or lift ratio
            — the score is interpolated between the nearest preset benchmarks, so a 19:30 5K lands
            between the “Sub-20” and “Sub-17” anchors rather than snapping to a bucket. Values better
            than the top benchmark or worse than the bottom clamp to that end.
          </p>
          <p>
            It’s a bar-argument settler, not a peer-reviewed instrument — but the numbers move for
            real reasons.
          </p>
        </div>
      </details>
    </section>
  );
}
