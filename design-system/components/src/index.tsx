// Evin Le design system components. React 18 is read from window.React; markup uses the el-* classes in bundle.css.
import { GLYPHS } from './glyphs';

const R: any = (window as any).React;
const h = R.createElement;
const Fragment = R.Fragment;
type Node = any;
const cx = (...c: any[]) => c.filter(Boolean).join(' ');

/* ---------- glyphs ---------- */

/** Tech and topic names that map to a glyph. Lookup is case-insensitive. */
const TECH: Record<string, string> = {
  typescript: 'dev-typescript', javascript: 'dev-javascript', 'c#': 'md-language_csharp', csharp: 'md-language_csharp',
  '.net': 'md-dot_net', dotnet: 'md-dot_net', react: 'dev-react', angular: 'dev-angular', rxjs: 'dev-rxjs',
  redux: 'dev-redux', 'redux toolkit': 'dev-redux', prisma: 'dev-prisma', 'node.js': 'md-nodejs', nodejs: 'md-nodejs',
  postgresql: 'dev-postgresql', 'sql server': 'dev-microsoftsqlserver', mongodb: 'dev-mongodb', azure: 'dev-azure',
  aws: 'fa-aws', playwright: 'dev-playwright', git: 'dev-git', github: 'cod-github', npm: 'dev-npm', mui: 'md-material_ui',
  docker: 'dev-docker', vscode: 'dev-vscode',
  perf: 'cod-dashboard', performance: 'cod-dashboard', architecture: 'cod-layers', debugging: 'cod-debug', testing: 'cod-pass',
};
export function glyphFor(label: string): string | undefined { return TECH[String(label).trim().toLowerCase()]; }

export interface GlyphProps { name: string; size?: number | string; title?: string; className?: string; style?: any }
/** A Nerd Font glyph from the subset (Devicons for the stack, Codicons for the interface). Decorative unless `title` is given. */
export function Glyph({ name, size, title, className, style }: GlyphProps) {
  const ch = GLYPHS[name];
  if (!ch) return null;
  const s = size != null ? { fontSize: typeof size === 'number' ? size + 'px' : size, ...style } : style;
  return title
    ? h('i', { className: cx('nf', className), role: 'img', 'aria-label': title, title, style: s }, ch)
    : h('i', { className: cx('nf', className), 'aria-hidden': true, style: s }, ch);
}

/* ---------- actions ---------- */

export interface ButtonProps { variant?: 'primary' | 'outline'; glyph?: string; glyphEnd?: string; href?: string; onClick?: (e: any) => void; children?: Node; className?: string; type?: string }
/** Mono button. Primary (mint fill) at most once per view; everything else is the outline. */
export function Button({ variant = 'outline', glyph, glyphEnd, href, children, className, ...rest }: ButtonProps) {
  const cls = cx('el-btn', variant === 'primary' && 'el-btn-primary', className);
  const inner = [glyph && h(Glyph, { name: glyph, key: 'g' }), children, glyphEnd && h(Glyph, { name: glyphEnd, key: 'e' })];
  return href ? h('a', { href, className: cls, ...rest }, ...inner) : h('button', { type: 'button', className: cls, ...rest }, ...inner);
}

export interface IconButtonProps { glyph: string; label: string; href?: string; onClick?: (e: any) => void; size?: 'md' | 'sm'; className?: string }
/** Square icon-only button. `label` is required: it becomes the accessible name. */
export function IconButton({ glyph, label, href, size = 'md', className, ...rest }: IconButtonProps) {
  const cls = cx('el-iconbtn', size === 'sm' && 'el-iconbtn-sm', className);
  const g = h(Glyph, { name: glyph });
  return href ? h('a', { href, className: cls, 'aria-label': label, title: label, ...rest }, g) : h('button', { type: 'button', className: cls, 'aria-label': label, title: label, ...rest }, g);
}

export interface LinkProps { href: string; external?: boolean; glyph?: string; mono?: boolean; children?: Node; className?: string }
/** Inline link in `link` (mint). `external` adds the link-external glyph and opens in a new tab. */
export function Link({ href, external, glyph, mono, children, className }: LinkProps) {
  return h('a', { href, className: cx('el-link', mono && 'el-mono', className), ...(external ? { target: '_blank', rel: 'noreferrer' } : {}) },
    glyph && h(Glyph, { name: glyph }), children, external && h(Glyph, { name: 'cod-link_external', className: 'el-link-ext' }));
}

/* ---------- type ---------- */

export interface HeadingProps { level?: 1 | 2 | 3; prefix?: boolean; id?: string; children?: Node; className?: string }
/** Mono heading. Level 1 is `display`; level 2 is `heading` with the cream `## ` prefix; level 3 is a 16px mono title. */
export function Heading({ level = 2, prefix = level === 2, id, children, className }: HeadingProps) {
  const cls = level === 1 ? 'display' : level === 2 ? 'heading' : 'el-h3';
  const hash = prefix ? h('span', { className: 'el-hash' }, level === 3 ? '### ' : '## ') : null;
  return h('h' + level, { id, className: cx(cls, 'el-h', className) }, hash, children);
}

export interface TextProps { variant?: 'body' | 'lead' | 'small'; muted?: boolean; as?: string; children?: Node; className?: string }
/** Prose in IBM Plex Sans. `lead` is body size in ink-muted for intros; `small` for captions and footnotes. */
export function Text({ variant = 'body', muted, as = 'p', children, className }: TextProps) {
  const cls = variant === 'small' ? 'small' : 'body';
  return h(as, { className: cx(cls, 'el-text', (muted || variant === 'lead') && 'el-muted', className) }, children);
}

export interface LabelProps { muted?: boolean; tone?: 'mint' | 'blue' | 'pink' | 'cream'; glyph?: string; children?: Node; className?: string }
/** Uppercase mono label for metadata, dates and section kickers. */
export function Label({ muted = true, tone, glyph, children, className }: LabelProps) {
  return h('span', { className: cx('label', glyph && 'el-ic-label', tone ? 'el-' + tone : muted && 'el-muted', className) }, glyph && h(Glyph, { name: glyph }), children);
}

/** Inline code: mono on surface-raised, square corners. */
export function InlineCode({ children }: { children?: Node }) { return h('code', { className: 'el-inline' }, children); }

/* ---------- chips ---------- */

export interface ChipProps { label: string; glyph?: string | null }
/** Icon + lowercase name. The glyph is looked up from the label unless given; `glyph={null}` forces text only. */
export function Chip({ label, glyph }: ChipProps) {
  const g = glyph === null ? undefined : glyph ?? glyphFor(label);
  return h('span', { className: 'el-stack' }, g && h(Glyph, { name: g }), String(label).toLowerCase());
}

export interface ChipListProps { items: Array<string | ChipProps>; className?: string }
/** A wrapping row of Chips. */
export function ChipList({ items, className }: ChipListProps) {
  return h('span', { className: cx('el-chips', className) }, items.map((it, i) => h(Chip, { key: i, ...(typeof it === 'string' ? { label: it } : it) })));
}

/* ---------- containers ---------- */

export interface CardProps { padding?: 'md' | 'lg'; children?: Node; className?: string; as?: string }
/** Raised surface with a hairline border and radius-md. The default container for grouped content. */
export function Card({ padding = 'md', children, className, as = 'div' }: CardProps) {
  return h(as, { className: cx('el-card', padding === 'lg' && 'el-card-lg', className) }, children);
}

export interface SectionProps { title: Node; id?: string; action?: Node; children?: Node }
/** Page section: a level-2 heading with an optional right-aligned action, then content. */
export function Section({ title, id, action, children }: SectionProps) {
  return h('section', { className: 'el-section', 'aria-labelledby': id },
    h('div', { className: 'el-section-head' }, h(Heading, { level: 2, id }, title), action), children);
}

export interface TerminalProps { title?: string; children?: Node; pre?: boolean }
/** Square terminal panel with a title bar. Children render in a mono `pre` unless `pre={false}`. */
export function Terminal({ title = 'zsh · /home/evinle', children, pre = true }: TerminalProps) {
  return h('div', { className: 'el-term' },
    h('div', { className: 'el-term-bar' }, h(Label, { glyph: 'cod-terminal' }, title), h('span', { className: 'label el-muted', 'aria-hidden': true }, '●●●')),
    pre ? h('pre', { className: 'el-term-body code' }, children) : h('div', { className: 'el-term-pad' }, children));
}

/** Terminal prompt line helpers: `$ cmd` and a blinking-free cursor. */
export function Prompt({ children }: { children?: Node }) { return h(Fragment, null, h('span', { className: 'el-muted' }, '$ '), children, '\n'); }
export function Cursor() { return h('span', { className: 'el-cursor' }, '▍'); }

export interface KeyValueListProps { items: Array<[string, Node]>; highlight?: string }
/** Mono key/value list (the whoami panel). `highlight` paints one value mint. */
export function KeyValueList({ items, highlight }: KeyValueListProps) {
  return h('dl', { className: 'el-kv code' }, items.map(([k, v]) => h(Fragment, { key: k }, h('dt', null, k), h('dd', null, k === highlight ? h('span', { className: 'el-mint' }, v) : v))));
}

export interface JsonOutputProps { data: unknown; highlight?: string[]; indent?: number }
/** Pretty-printed, jq-coloured JSON for terminal output: keys blue, strings ink, numbers cream, booleans and null pink, punctuation muted. `highlight` lists keys whose values go mint. */
export function JsonOutput({ data, highlight = [], indent = 2 }: JsonOutputProps) {
  let k = 0;
  const p = (t: string) => h('span', { key: k++, className: 'js-p' }, t);
  const val = (v: any, d: number, hl: boolean): Node[] => {
    const pad = ' '.repeat(indent * d), pad1 = ' '.repeat(indent * (d + 1));
    if (v === null || typeof v === 'boolean') return [h('span', { key: k++, className: 'js-b' }, String(v))];
    if (typeof v === 'number') return [h('span', { key: k++, className: hl ? 'js-hl' : 'js-n' }, String(v))];
    if (typeof v === 'string') return [h('span', { key: k++, className: hl ? 'js-hl' : 'js-s' }, JSON.stringify(v))];
    if (Array.isArray(v)) {
      if (!v.length) return [p('[]')];
      const out: Node[] = [p('['), '\n'];
      v.forEach((x, i) => { out.push(pad1, ...val(x, d + 1, hl), i < v.length - 1 ? p(',') : '', '\n'); });
      return [...out, pad, p(']')];
    }
    const ks = Object.keys(v);
    if (!ks.length) return [p('{}')];
    const out: Node[] = [p('{'), '\n'];
    ks.forEach((key, i) => { out.push(pad1, h('span', { key: k++, className: 'js-k' }, JSON.stringify(key)), p(': '), ...val(v[key], d + 1, highlight.includes(key)), i < ks.length - 1 ? p(',') : '', '\n'); });
    return [...out, pad, p('}')];
  };
  return h(Fragment, null, ...val(data, 0, false), '\n');
}

/* ---------- content ---------- */

const KW = /\b(const|let|var|function|return|import|from|export|await|async|new|if|else|for|while|class|extends|type|interface|public|private|static|void|using|namespace|var)\b/;
function tokenize(line: string): Node[] {
  const out: Node[] = []; let rest = line; let k = 0;
  const re = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`)|(\b\d[\d_.]*(?:ms|s|e\d+)?\b)|([A-Za-z_$][\w$]*)/;
  while (rest.length) {
    const m = re.exec(rest);
    if (!m) { out.push(rest); break; }
    if (m.index) out.push(rest.slice(0, m.index));
    const t = m[0];
    if (m[1]) out.push(h('span', { key: k++, className: 'tok-c' }, t));
    else if (m[2]) out.push(t);
    else if (m[3]) out.push(h('span', { key: k++, className: 'tok-n' }, t));
    else if (KW.test(t) && KW.exec(t)![0] === t) out.push(h('span', { key: k++, className: 'tok-k' }, t));
    else out.push(t);
    rest = rest.slice(m.index + t.length);
  }
  return out;
}
export interface CodeBlockProps { code: string; highlight?: number[]; emphasis?: string[]; label?: string }
/** Numbered code block with light JS/C# tokenising. `highlight` lines (1-based) get the mint-soft ground; `emphasis` words go mint. */
export function CodeBlock({ code, highlight = [], emphasis = [], label }: CodeBlockProps) {
  const lines = code.replace(/\n$/, '').split('\n');
  return h('div', { className: 'el-codeblock', 'aria-label': label },
    h('pre', { className: 'code' }, lines.map((ln, i) => {
      let toks = tokenize(ln);
      if (emphasis.length) toks = toks.flatMap((t: any) => typeof t === 'string' && emphasis.some((w) => t.includes(w))
        ? t.split(new RegExp('(' + emphasis.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')')).map((p: string, j: number) => emphasis.includes(p) ? h('span', { key: 'e' + i + j, className: 'tok-f' }, p) : p)
        : [t]);
      return h('span', { key: i, className: cx('ln', highlight.includes(i + 1) && 'hl'), 'data-n': i + 1 }, ...toks, '\n');
    })));
}

export interface MetricProps { before: Node; after: Node; label?: Node; compact?: boolean }
/** A measured before → after pair: before in pink, after in mint. Real numbers only. */
export function Metric({ before, after, label, compact }: MetricProps) {
  return h('div', { className: 'el-metric' },
    h('div', { className: 'el-metric-vals' }, h('span', { className: 'el-metric-before' }, before), h('span', { className: 'el-metric-arrow' }, '→'), h('span', { className: 'el-metric-after' }, after)),
    label && h('p', { className: compact ? 'label el-muted' : 'small el-muted' }, label));
}
/** Three-up grid of Metrics. */
export function Metrics({ children }: { children?: Node }) { return h('div', { className: 'el-metrics' }, children); }

export interface InvestigationProps { title: Node; symptom: Node; cause: Node; fix: Node; result: Node }
/** Symptom → root cause → fix → result, each step indented one level deeper. */
export function Investigation({ title, symptom, cause, fix, result }: InvestigationProps) {
  const step = (k: string, v: Node, extra?: string) => h('li', { className: cx('el-step', extra) }, h('span', { className: 'el-step-k' }, k), h('p', { className: 'body' }, v));
  return h('article', { className: 'el-case' }, h(Heading, { level: 3, prefix: false }, title),
    h('ol', { className: 'el-steps' }, step('symptom', symptom), step('root cause', cause), step('fix', fix), step('result', result, 'el-step-result')));
}

export interface Post { date: string; title: string; href?: string; summary?: Node; tags?: string[]; minutes?: number }
/** Writing index rows: date, title + summary + chips, read time. */
export function PostList({ posts }: { posts: Post[] }) {
  return h('ul', { className: 'el-posts' }, posts.map((p, i) => h('li', { key: i, className: 'el-post' },
    h(Label, null, p.date),
    h('div', null, h('h3', null, h('a', { href: p.href ?? '#' }, p.title)), p.summary && h('p', { className: 'small el-muted' }, p.summary), p.tags && h(ChipList, { items: p.tags })),
    p.minutes != null ? h(Label, { glyph: 'cod-history' }, p.minutes + ' min') : h('span'))));
}

export interface AsideProps { label?: string; children?: Node }
/** "One layer down": the indented depth note for the detail underneath the main point. */
export function Aside({ label = 'one layer down', children }: AsideProps) {
  return h('aside', { className: 'el-aside' }, h('div', { className: 'el-aside-k' }, label), h('p', { className: 'body' }, children));
}

export interface DecisionRecordProps { decision: Node; context: Node; tradeoff: Node; result?: Node }
/** ADR block: decision, context, trade-off, result. Always name the trade-off. */
export function DecisionRecord({ decision, context, tradeoff, result }: DecisionRecordProps) {
  const row = (k: string, v: Node, tone: string) => h('div', { className: 'el-adr-row' }, h('span', { className: 'label el-' + tone }, k), h('p', { className: 'body' }, v));
  return h('div', { className: 'el-adr', role: 'group', 'aria-label': 'Decision record' },
    row('DECISION', decision, 'blue'), row('CONTEXT', context, 'muted'), row('TRADE-OFF', tradeoff, 'muted'), result != null && row('RESULT', result, 'mint'));
}

export interface TableColumn { key: string; label: string; align?: 'left' | 'right'; mono?: boolean }
export interface TableProps { columns: TableColumn[]; rows: Array<Record<string, Node>>; caption?: Node; highlightRow?: number }
/** Data table: mono uppercase header, hairline rows, numbers right-aligned in mono. `highlightRow` (0-based) gets mint-soft. */
export function Table({ columns, rows, caption, highlightRow }: TableProps) {
  return h('div', { className: 'el-table-wrap' }, h('table', { className: 'el-table' },
    caption && h('caption', { className: 'small el-muted' }, caption),
    h('thead', null, h('tr', null, columns.map((c) => h('th', { key: c.key, className: cx('label', c.align === 'right' && 'r') }, c.label)))),
    h('tbody', null, rows.map((r, i) => h('tr', { key: i, className: i === highlightRow ? 'hl' : undefined },
      columns.map((c) => h('td', { key: c.key, className: cx(c.align === 'right' && 'r', (c.mono || c.align === 'right') && 'el-mono') }, r[c.key])))))));
}

export interface FigureProps { caption?: Node; children?: Node }
/** Square diagram frame on surface-raised with a caption. Say in the caption what the colours mean. */
export function Figure({ caption, children }: FigureProps) {
  return h('figure', { className: 'el-fig' }, children, caption && h('figcaption', { className: 'small el-muted' }, caption));
}

export interface Marble { at: number; text: string; kind?: 'src' | 'bad' | 'ok' }
export interface MarbleLane { label: string; marbles: Marble[] }
export interface MarbleDiagramProps { lanes: MarbleLane[]; label: string; duration?: number }
/** Stream marble diagram. `at` is 0..duration along the lane; inputs blue, wasted pink, correct mint. */
export function MarbleDiagram({ lanes, label, duration = 100 }: MarbleDiagramProps) {
  const W = 880, x0 = 200, x1 = 860, step = 46, H = lanes.length * step + 8;
  return h('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label },
    lanes.map((ln, i) => {
      const y = 26 + i * step;
      return h('g', { key: i }, h('text', { className: 'mb-lbl', x: 0, y }, ln.label), h('line', { className: 'mb-lane', x1: x0, y1: y, x2: x1, y2: y }),
        ln.marbles.map((m, j) => { const x = x0 + 20 + (m.at / duration) * (x1 - x0 - 40); return h('g', { key: j }, h('circle', { className: m.kind === 'bad' ? 'mb-bad' : m.kind === 'ok' ? 'mb-ok' : 'mb-src', cx: x, cy: y, r: 17 }), h('text', { className: 'mb-t', x, y }, m.text)); }));
    }));
}

/* ---------- gantt ---------- */

const ym = (s: string) => { const [y, m = '1', d = '1'] = String(s).split('-'); return (+y) * 12 + (+m - 1) + (+d - 1) / 30; };
export interface GanttRow { name: string; chips?: Array<string | ChipProps>; start: string; end?: string; tone?: 'blue' | 'mint'; note?: Node; noteSide?: 'left' | 'right' }
export interface GanttProps { start: string; end: string; now?: string; parent?: { name: string; subtitle?: Node; start: string; end?: string }; rows: GanttRow[]; legend?: Array<{ label: string; tone: 'blue' | 'mint' }>; label: string; labelHeader?: string }
/** Timeline as a Gantt: optional parent summary bar with child rows indented one level (space-8), one track per row, outcome notes beside bars, a dashed now line. Dates are YYYY-MM or YYYY-MM-DD; a row without `end` is ongoing and fades out at now. */
export function Gantt({ start, end, now, parent, rows, legend, label, labelHeader = 'PROJECT' }: GanttProps) {
  const a = ym(start), b = ym(end) + 1, span = b - a;
  const pct = (s: string) => Math.max(0, Math.min(100, ((ym(s) - a) / span) * 100));
  const N = now ? pct(now) : null;
  const nowLine = (lbl?: boolean) => N == null ? null : h('div', { className: 'el-now', style: { '--n': N } }, lbl && h('span', null, 'now'));
  const years: Node[] = [];
  for (let y = Math.ceil(a / 12); y * 12 < b; y++) years.push(h('span', { key: y, className: 'el-gantt-year', style: { left: ((y * 12 - a) / span) * 100 + '%' } }, y));
  const yearBg = { backgroundSize: (12 / span) * 100 + '% 100%', backgroundPosition: ((Math.ceil(a / 12) * 12 - a) / span) * 100 + '% 0' };
  const track = (kids: Node[]) => h('div', { className: 'el-gantt-track', style: yearBg }, ...kids, nowLine());
  return h('div', { className: 'el-gantt', role: 'img', 'aria-label': label },
    h('div', { className: 'el-gantt-axis' }, h('div', { className: 'el-gantt-label' }, h(Label, null, labelHeader)), h('div', { className: 'el-gantt-track', style: yearBg }, ...years, nowLine(true))),
    parent && h('div', { className: 'el-gantt-row' },
      h('div', { className: 'el-gantt-label' }, h('span', { className: 'name' }, parent.name), parent.subtitle && h('span', { className: 'small el-muted' }, parent.subtitle)),
      track([h('div', { key: 's', className: 'el-bar-summary', style: { '--s': pct(parent.start), '--e': parent.end ? pct(parent.end) : N ?? 100 } })])),
    rows.map((r, i) => {
      const S = pct(r.start), E = r.end ? pct(r.end) : N ?? 100;
      return h('div', { key: i, className: 'el-gantt-row' },
        h('div', { className: cx('el-gantt-label', parent && 'child') }, h('span', { className: 'name' }, r.name), r.chips && h(ChipList, { items: r.chips })),
        track([h('div', { key: 'b', className: cx('el-bar', r.tone === 'mint' && 'react', !r.end && 'ongoing'), style: { '--s': S, '--e': E }, title: r.name }),
          r.note && h('span', { key: 'n', className: cx('el-bar-note', r.noteSide === 'left' && 'left'), style: { '--s': S, '--e': E } }, r.note)]));
    }),
    legend && h('div', { className: 'el-gantt-legend' }, legend.map((l) => h('span', { key: l.label }, h('i', { className: 'sw', style: { background: `var(--${l.tone}-fill)` } }), l.label)),
      N != null && h('span', null, h('i', { className: 'sw', style: { borderLeft: '1px dashed var(--cream)', width: 1 } }), ' today')));
}

/* ---------- chrome ---------- */

export interface NavProps { current?: string; links?: Array<{ label: string; href: string }>; githubHref?: string; onToggleTheme?: () => void }
/** Site header: /home/evinle wordmark, mono links (current in mint with `> `), GitHub and theme icon buttons. */
export function Nav({ current, links = [{ label: 'home', href: '#' }, { label: 'writing', href: '#' }, { label: 'projects', href: '#' }, { label: 'about', href: '#' }], githubHref = '#', onToggleTheme }: NavProps) {
  return h('nav', { className: 'el-nav', 'aria-label': 'Main' },
    h('a', { className: 'el-mark', href: links[0]?.href ?? '#' }, h('b', null, '/home/'), 'evinle'),
    h('ul', { className: 'label' }, links.map((l) => h('li', { key: l.label }, h('a', { href: l.href, 'aria-current': l.label === current ? 'page' : undefined }, l.label))),
      h('li', { className: 'el-nav-tools' }, h(IconButton, { glyph: 'cod-github', label: 'GitHub', href: githubHref }), h(IconButton, { glyph: 'cod-color_mode', label: 'Switch theme', onClick: onToggleTheme }))));
}

export interface FooterProps { name?: string; year?: number; links?: Array<{ label: string; href: string; glyph?: string }> }
/** Site footer: copyright label and glyph links. */
export function Footer({ name = 'Evin Le', year = 2026, links = [{ label: 'github', href: '#', glyph: 'cod-github' }, { label: 'npm', href: '#', glyph: 'dev-npm' }, { label: 'email', href: '#', glyph: 'cod-mail' }] }: FooterProps) {
  return h('footer', { className: 'el-footer' }, h(Label, null, `© ${year} ${name.toUpperCase()}`),
    h('span', { className: 'label el-foot-links' }, links.map((l) => h('a', { key: l.label, href: l.href }, l.glyph && h(Glyph, { name: l.glyph }), l.label))));
}

/** Centered page column (max 1040px) with the page background. */
export function Page({ children, narrow }: { children?: Node; narrow?: boolean }) {
  return h('div', { className: 'el-page' }, h('div', { className: cx('el-wrap', narrow && 'el-wrap-narrow') }, children));
}

const api = { Glyph, glyphFor, Button, IconButton, Link, Heading, Text, Label, InlineCode, Chip, ChipList, Card, Section, Terminal, Prompt, Cursor, KeyValueList, JsonOutput, CodeBlock, Metric, Metrics, Investigation, PostList, Aside, DecisionRecord, Table, Figure, MarbleDiagram, Gantt, Nav, Footer, Page };
(window as any).EvinLe = Object.assign((window as any).EvinLe || {}, api);
