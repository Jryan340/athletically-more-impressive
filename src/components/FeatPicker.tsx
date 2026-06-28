import { useEffect, useMemo, useRef, useState } from 'react';
import type { Category, Side } from '../types';
import { CAT_ORDER, FEATS } from '../data/feats';

type Props = {
  slot: Side;
  onClose: () => void;
  onChoose: (id: string) => void;
};

export default function FeatPicker({ slot, onClose, onChoose }: Props) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<'All' | Category>('All');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const q = query.toLowerCase().trim();
  const groups = useMemo(() => {
    const cats = cat === 'All' ? CAT_ORDER : [cat];
    return cats
      .map((c) => ({
        category: c,
        items: FEATS.filter((f) => f.category === c && (!q || f.name.toLowerCase().includes(q))),
      }))
      .filter((g) => g.items.length > 0);
  }, [cat, q]);

  const chips: Array<'All' | Category> = ['All', ...CAT_ORDER];
  const titleColor = slot === 'left' ? 'red' : 'blue';

  return (
    <div className="picker-scrim" onMouseDown={onClose}>
      <div
        className="picker"
        role="dialog"
        aria-modal="true"
        aria-label="Pick a feat"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="picker-head">
          <div className={`picker-title ${titleColor}`}>
            {slot === 'left' ? '🔴 RED CORNER — PICK A FEAT' : '🔵 BLUE CORNER — PICK A FEAT'}
          </div>
          <button type="button" className="picker-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="picker-search-wrap">
          <input
            ref={searchRef}
            className="picker-search"
            placeholder="Search feats…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="picker-chips">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip${c === cat ? ' is-active' : ''}`}
                onClick={() => setCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="picker-body">
          {groups.length === 0 && <div className="picker-empty">No feats match “{query}”.</div>}
          {groups.map((g) => (
            <div className="picker-group" key={g.category}>
              <div className="picker-group-title">{g.category}</div>
              <div className="picker-grid">
                {g.items.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="picker-item"
                    onClick={() => onChoose(f.id)}
                  >
                    <span className="it-emoji">{f.emoji}</span>
                    <span className="it-name">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
