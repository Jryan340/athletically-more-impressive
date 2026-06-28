import type { ThemeName } from '../theme';
import { THEMES } from '../theme';

export default function Header({
  theme,
  onTheme,
}: {
  theme: ThemeName;
  onTheme: (t: ThemeName) => void;
}) {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="brand-dots">
          <span className="dot-red" />
          <span className="dot-blue" />
        </div>
        <div className="wordmark">THE&nbsp;IMPRESSIVE-O-METER</div>
      </div>
      <div className="header-right">
        <span className="kicker-tiny">Tale of the Tape</span>
        <select
          className="theme-select"
          value={theme}
          aria-label="Theme"
          onChange={(e) => onTheme(e.target.value as ThemeName)}
        >
          {THEMES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
