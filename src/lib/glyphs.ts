// Subset of design-system/components/bundle.js's GLYPHS map (Nerd Font codepoints),
// copied here because the bundle only exposes glyphs through its React components.
export const GLYPHS: Record<string, string> = {
  'dev-typescript': '',
  'dev-react': '',
  'dev-angular': '',
  'md-dot_net': '\u{F0AAE}',
  'dev-mongodb': '',
  'dev-prisma': '',
  'dev-postgresql': '',
  'dev-npm': '',
  'cod-github': '',
  'cod-mail': '',
};

export function glyphChar(name?: string): string | null {
  return name ? GLYPHS[name] ?? null : null;
}
