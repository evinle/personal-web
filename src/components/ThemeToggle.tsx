import { nextTheme } from '../lib/theme';

export default function ThemeToggle() {
  function toggle() {
    const systemIsLight = matchMedia('(prefers-color-scheme: light)').matches;
    const next = nextTheme(document.documentElement.dataset.theme, systemIsLight);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {}
  }

  return (
    <button type="button" className="el-iconbtn" aria-label="Switch theme" title="Switch theme" onClick={toggle}>
      <i className="nf" aria-hidden="true">{''}</i>
    </button>
  );
}
