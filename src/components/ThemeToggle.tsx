type Theme = 'dark' | 'light';

function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export default function ThemeToggle() {
  function toggle() {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
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
