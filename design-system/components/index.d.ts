import type * as React from 'react';
type Node = React.ReactNode;

export interface GlyphProps { name: string; size?: number | string; title?: string; className?: string; style?: any }
export interface ButtonProps { variant?: 'primary' | 'outline'; glyph?: string; glyphEnd?: string; href?: string; onClick?: (e: any) => void; children?: Node; className?: string; type?: string }
export interface IconButtonProps { glyph: string; label: string; href?: string; onClick?: (e: any) => void; size?: 'md' | 'sm'; className?: string }
export interface LinkProps { href: string; external?: boolean; glyph?: string; mono?: boolean; children?: Node; className?: string }
export interface HeadingProps { level?: 1 | 2 | 3; prefix?: boolean; id?: string; children?: Node; className?: string }
export interface TextProps { variant?: 'body' | 'lead' | 'small'; muted?: boolean; as?: string; children?: Node; className?: string }
export interface LabelProps { muted?: boolean; tone?: 'mint' | 'blue' | 'pink' | 'cream'; glyph?: string; children?: Node; className?: string }
export interface ChipProps { label: string; glyph?: string | null }
export interface ChipListProps { items: Array<string | ChipProps>; className?: string }
export interface CardProps { padding?: 'md' | 'lg'; children?: Node; className?: string; as?: string }
export interface SectionProps { title: Node; id?: string; action?: Node; children?: Node }
export interface TerminalProps { title?: string; children?: Node; pre?: boolean }
export interface KeyValueListProps { items: Array<[string, Node]>; highlight?: string }
export interface JsonOutputProps { data: unknown; highlight?: string[]; indent?: number }
export interface CodeBlockProps { code: string; highlight?: number[]; emphasis?: string[]; label?: string }
export interface MetricProps { before: Node; after: Node; label?: Node; compact?: boolean }
export interface InvestigationProps { title: Node; symptom: Node; cause: Node; fix: Node; result: Node }
export interface Post { date: string; title: string; href?: string; summary?: Node; tags?: string[]; minutes?: number }
export interface AsideProps { label?: string; children?: Node }
export interface DecisionRecordProps { decision: Node; context: Node; tradeoff: Node; result?: Node }
export interface TableColumn { key: string; label: string; align?: 'left' | 'right'; mono?: boolean }
export interface TableProps { columns: TableColumn[]; rows: Array<Record<string, Node>>; caption?: Node; highlightRow?: number }
export interface FigureProps { caption?: Node; children?: Node }
export interface Marble { at: number; text: string; kind?: 'src' | 'bad' | 'ok' }
export interface MarbleLane { label: string; marbles: Marble[] }
export interface MarbleDiagramProps { lanes: MarbleLane[]; label: string; duration?: number }
export interface GanttRow { name: string; chips?: Array<string | ChipProps>; start: string; end?: string; tone?: 'blue' | 'mint'; note?: Node; noteSide?: 'left' | 'right' }
export interface GanttProps { start: string; end: string; now?: string; parent?: { name: string; subtitle?: Node; start: string; end?: string }; rows: GanttRow[]; legend?: Array<{ label: string; tone: 'blue' | 'mint' }>; label: string; labelHeader?: string }
export interface NavProps { current?: string; links?: Array<{ label: string; href: string }>; githubHref?: string; onToggleTheme?: () => void }
export interface FooterProps { name?: string; year?: number; links?: Array<{ label: string; href: string; glyph?: string }> }
export declare function glyphFor(label: string): string | undefined;
export declare function Glyph(props: GlyphProps): React.ReactElement;
export declare function Button(props: ButtonProps): React.ReactElement;
export declare function IconButton(props: IconButtonProps): React.ReactElement;
export declare function Link(props: LinkProps): React.ReactElement;
export declare function Heading(props: HeadingProps): React.ReactElement;
export declare function Text(props: TextProps): React.ReactElement;
export declare function Label(props: LabelProps): React.ReactElement;
export declare function InlineCode(props: { children?: Node }): React.ReactElement;
export declare function Chip(props: ChipProps): React.ReactElement;
export declare function ChipList(props: ChipListProps): React.ReactElement;
export declare function Card(props: CardProps): React.ReactElement;
export declare function Section(props: SectionProps): React.ReactElement;
export declare function Terminal(props: TerminalProps): React.ReactElement;
export declare function Prompt(props: { children?: Node }): React.ReactElement;
export declare function Cursor(): React.ReactElement;
export declare function KeyValueList(props: KeyValueListProps): React.ReactElement;
export declare function JsonOutput(props: JsonOutputProps): React.ReactElement;
export declare function CodeBlock(props: CodeBlockProps): React.ReactElement;
export declare function Metric(props: MetricProps): React.ReactElement;
export declare function Metrics(props: { children?: Node }): React.ReactElement;
export declare function Investigation(props: InvestigationProps): React.ReactElement;
export declare function PostList(props: { posts: Post[] }): React.ReactElement;
export declare function Aside(props: AsideProps): React.ReactElement;
export declare function DecisionRecord(props: DecisionRecordProps): React.ReactElement;
export declare function Table(props: TableProps): React.ReactElement;
export declare function Figure(props: FigureProps): React.ReactElement;
export declare function MarbleDiagram(props: MarbleDiagramProps): React.ReactElement;
export declare function Gantt(props: GanttProps): React.ReactElement;
export declare function Nav(props: NavProps): React.ReactElement;
export declare function Footer(props: FooterProps): React.ReactElement;
export declare function Page(props: { children?: Node }): React.ReactElement;
declare global { interface Window { EvinLe: { glyphFor: typeof glyphFor; Glyph: typeof Glyph; Button: typeof Button; IconButton: typeof IconButton; Link: typeof Link; Heading: typeof Heading; Text: typeof Text; Label: typeof Label; InlineCode: typeof InlineCode; Chip: typeof Chip; ChipList: typeof ChipList; Card: typeof Card; Section: typeof Section; Terminal: typeof Terminal; Prompt: typeof Prompt; Cursor: typeof Cursor; KeyValueList: typeof KeyValueList; JsonOutput: typeof JsonOutput; CodeBlock: typeof CodeBlock; Metric: typeof Metric; Metrics: typeof Metrics; Investigation: typeof Investigation; PostList: typeof PostList; Aside: typeof Aside; DecisionRecord: typeof DecisionRecord; Table: typeof Table; Figure: typeof Figure; MarbleDiagram: typeof MarbleDiagram; Gantt: typeof Gantt; Nav: typeof Nav; Footer: typeof Footer; Page: typeof Page } } }
