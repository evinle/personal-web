export type Theme = 'dark' | 'light';

/** The theme a click switches to: the opposite of a chosen theme, or of the system's if none is chosen yet. */
export function nextTheme(chosen: string | undefined, systemIsLight: boolean): Theme {
  const isLight = chosen === 'light' || chosen === 'dark' ? chosen === 'light' : systemIsLight;
  return isLight ? 'dark' : 'light';
}
