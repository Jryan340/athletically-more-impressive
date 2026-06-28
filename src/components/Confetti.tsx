import { useMemo } from 'react';
import type { CSSProperties } from 'react';

const COLORS = ['var(--gold)', 'var(--red)', 'var(--blue)', '#ffffff'];

/**
 * 74 falling pieces, generated once on mount. Seeded off the render index so we
 * don't need Math.random at module init; variety comes from a cheap hash.
 */
function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export default function Confetti({ count = 74 }: { count?: number }) {
  const pieces = useMemo(() => {
    const arr: CSSProperties[] = [];
    for (let i = 0; i < count; i++) {
      const sz = 7 + Math.round(rand(i + 1) * 8);
      arr.push({
        top: '-12vh',
        left: `${(rand(i + 7) * 100).toFixed(2)}%`,
        width: `${sz}px`,
        height: `${Math.round(sz * 1.5)}px`,
        background: COLORS[i % COLORS.length],
        borderRadius: rand(i + 3) > 0.5 ? '2px' : '50%',
        opacity: 0.95,
        animation: `confettiFall ${(2.4 + rand(i + 11) * 1.8).toFixed(2)}s linear ${(
          rand(i + 5) * 0.5
        ).toFixed(2)}s forwards`,
      });
    }
    return arr;
  }, [count]);

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((style, i) => (
        <div key={i} className="confetti-piece" style={style} />
      ))}
    </div>
  );
}
