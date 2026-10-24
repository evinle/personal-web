export {};

const React: any = (window as any).React;
const h = React.createElement, Fragment = React.Fragment;
const { Page, Nav, Footer, Heading, Text, Label, ChipList, Metric, Aside, CodeBlock, InlineCode, Figure, MarbleDiagram, DecisionRecord, Table, Link } = (window as any).EvinLe;

const lane = (label: string, marbles: any[]) => ({ label, marbles });
const pos = [18, 50, 82];

function App() {
  return (
    <Page>
      <Nav current="writing" />
      <article className="bp">
        <Label><Link href="#">writing</Link> / perf</Label>
        <Heading level={1}>combineLatest where zip was correct</Heading>
        <div className="bp-meta">
          <Label glyph="cod-history">2026-09-12 · 8 MIN READ</Label>
          <ChipList items={['rxjs', 'angular', 'perf']} />
        </div>

        <div className="bp-lead">
          <Text>A production scheduling page froze for about 5 seconds on load. The cause was one operator choice on two streams that shared an origin, and the fix was to make the pipeline simpler, not cleverer.</Text>
          <Metric before="5s" after="~1s" label="PAGE-LOAD FREEZE" compact />
        </div>

        <Heading level={2}>The symptom</Heading>
        <Text>Every load did a lot more work than the data needed, and the profiler showed the same downstream handlers running over and over. Nothing was technically wrong with any single subscription, they were just firing more often than they should have.</Text>

        <Heading level={2}>Why breakpoints didn't help</Heading>
        <Text>A breakpoint shows you one emission at a time, and every one of them looked valid on its own. The problem was how many there were, so I instrumented emission counts per operator instead and compared them against the number of source events.</Text>
        <Aside>Duplicate emissions are a counting problem, not an inspection problem. A <InlineCode>tap</InlineCode> that increments a counter per operator shows the extra emissions straight away, where stepping through values that are each individually fine never will.</Aside>

        <Table
          columns={[{ key: 'op', label: 'Operator', mono: true }, { key: 'src', label: 'Source events', align: 'right' }, { key: 'emit', label: 'Emissions', align: 'right' }]}
          rows={[
            { op: 'src$', src: '3', emit: '3' },
            { op: 'map(toRows)', src: '3', emit: '3' },
            { op: 'map(toTotals)', src: '3', emit: '3' },
            { op: 'combineLatest', src: '3', emit: <span className="el-pink">5</span> },
            { op: 'zip', src: '3', emit: <span className="el-mint">3</span> },
          ]}
          highlightRow={3}
          caption="Emission counts per operator for three source events (illustrative)."
        />

        <CodeBlock label="Simplified pipeline" highlight={[5]} emphasis={['combineLatest']} code={`const rows$ = src$.pipe(map(toRows));
const totals$ = src$.pipe(map(toTotals));

// both derive from src$, so every src$ event emits twice here
const view$ = combineLatest([rows$, totals$]).pipe(
  map(([rows, totals]) => render(rows, totals)),
);`} />

        <Heading level={2}>What combineLatest actually does here</Heading>
        <Text><InlineCode>combineLatest</InlineCode> emits whenever any input emits. With two streams mapped off the same source, each source event updates one input and then the other, so you get an intermediate emission pairing new rows with old totals, and the expensive render runs on it anyway.</Text>

        <Figure caption={<Fragment><span className="el-pink">Pink</span> marks the mismatched intermediate pairs, which are the wasted renders. zip only emits once both inputs have a value at the same index.</Fragment>}>
          <MarbleDiagram label="combineLatest emits a mismatched pair before each matched pair; zip emits only matched pairs" lanes={[
            lane('a$ = src$.pipe(map(f))', pos.map((p, i) => ({ at: p - 3, text: 'a' + (i + 1) }))),
            lane('b$ = src$.pipe(map(g))', pos.map((p, i) => ({ at: p + 3, text: 'b' + (i + 1) }))),
            lane('combineLatest(a$, b$)', pos.flatMap((p, i) => [...(i ? [{ at: p - 3, text: `${i + 1}·${i}`, kind: 'bad' }] : []), { at: p + 3, text: `${i + 1}·${i + 1}`, kind: 'ok' }])),
            lane('zip(a$, b$)', pos.map((p, i) => ({ at: p + 3, text: `${i + 1}·${i + 1}`, kind: 'ok' }))),
          ]} />
        </Figure>

        <Heading level={2}>The fix</Heading>
        <Text>Swapping to <InlineCode>zip</InlineCode> fixed the count, but the more useful change was simplifying the relationships between stages so there weren't two parallel streams to reconcile in the first place.</Text>
        <CodeBlock label="After" highlight={[2]} code={`const view$ = src$.pipe(
  map((s) => render(toRows(s), toTotals(s))),
);`} />

        <DecisionRecord
          decision="Derive both values in one stage rather than reach for a smarter operator."
          context="Two streams with a shared origin, combined downstream, on a page with an expensive render."
          tradeoff="One less reusable stream, which does defeat the point of having them separate a bit. Worth it here, because nothing else consumed them."
          result={<Fragment>Load freeze from 5s to <span className="el-mono el-mint">~1s</span>, and a pipeline the next person can read top to bottom.</Fragment>}
        />

        <div className="bp-next">
          <Label>NEXT</Label>
          <Link href="#" mono>Hooks that return a new object every render →</Link>
        </div>
      </article>
      <Footer />
    </Page>
  );
}
(window as any).ReactDOM.createRoot(document.getElementById('root')).render(<App />);
