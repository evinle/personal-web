// Subset of design-system/components/bundle.js's GLYPHS map (Nerd Font codepoints),
// copied here because the bundle only exposes glyphs through its React components.
export const GLYPHS: Record<string, string> = {
  'cod-terminal': '\uEA85',
  'dev-typescript': '',
  'dev-react': '',
  'dev-angular': '',
  'md-dot_net': '\u{F0AAE}',
  'dev-mongodb': '',
  'dev-prisma': '',
  'dev-postgresql': '',
  'dev-javascript': '\uE781',
  'dev-rxjs': '\uE897',
  'dev-redux': '\uE88C',
  'dev-microsoftsqlserver': '\uE82E',
  'dev-azure': '\uE754',
  'dev-playwright': '\uE863',
  'dev-git': '\uE702',
  'md-material_ui': '\u{F0357}',
  'fa-aws': '\uF0EF',
  'md-language_csharp': '\u{F031B}',
  'dev-npm': '',
  'cod-github': '',
  'cod-mail': '',
};

export function glyphChar(name?: string): string | null {
  return name ? GLYPHS[name] ?? null : null;
}
