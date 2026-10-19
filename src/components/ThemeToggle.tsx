import { useState } from 'react';

type Theme = 'dark' | 'light';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document === 'undefined' || document.documentElement.dataset.theme !== 'light' ? 'dark' : 'light',
  );

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {}
    setTheme(next);
  }

  return (
    <button type="button" className="el-iconbtn" aria-label="Switch theme" title="Switch theme" onClick={toggle}>
      <i className="nf" aria-hidden="true">{''}</i>
    </button>
  );
}
