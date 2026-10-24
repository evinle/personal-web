export {};

const React: any = (window as any).React;
const h = React.createElement, Fragment = React.Fragment;
const { Page, Nav, Footer, Heading, Text, Label, Button, Terminal, Prompt, Cursor, Section, Metric, Metrics, Investigation, ChipList, PostList, Card, Link } = (window as any).EvinLe;

function App() {
  return (
    <Page>
      <Nav current="home" />
      <header className="lp-hero">
        <div>
          <Label>FULL STACK ENGINEER · BRISBANE</Label>
          <Heading level={1}>Finding out why it's slow, then fixing that.</Heading>
          <Text variant="lead">Four years in, strongest on the front end in React and Angular and comfortable in .NET and SQL. I write up the problems I've dug into here, mostly performance and front-end architecture, with the dead ends left in.</Text>
          <div className="lp-actions">
            <Button variant="primary" href="#" glyphEnd="cod-arrow_right">read the writing</Button>
            <Button href="#">about me</Button>
          </div>
        </div>
        <Terminal>
          <Prompt>git log --oneline --grep=perf</Prompt>
          <span className="el-blue">a41f0c2</span> ef core: split join, filter first{'\n'}
          {'        '}<span className="el-pink">7-10s</span> <span className="el-muted">→</span> <span className="el-mint">~500ms</span>{'\n'}
          <span className="el-blue">9be3d17</span> rxjs: zip, not combineLatest{'\n'}
          {'        '}<span className="el-pink">5s</span> <span className="el-muted">→</span> <span className="el-mint">~1s</span>{'\n'}
          <span className="el-blue">3c07a5e</span> tests: AAA, minimal mocking{'\n'}
          {'        '}<span className="el-pink">8%</span> <span className="el-muted">→</span> <span className="el-mint">40%</span> coverage{'\n'}
          <span className="el-muted">$ </span><Cursor />
        </Terminal>
      </header>

      <Section title="Measured, not estimated" id="results">
        <Metrics>
          <Metric before="7-10s" after="~500ms" label="Shift-scheduling query in EF Core, working set from 100k+ rows to ~200" />
          <Metric before="5s" after="~1s" label="Page-load freeze from duplicate RxJS emissions" />
          <Metric before="8%" after="40%" label="Test coverage, raised during continuous feature delivery" />
        </Metrics>
      </Section>

      <Section title="Featured investigation" id="featured" action={<ChipList items={[{ label: 'ef core', glyph: null }, 'postgresql', '.net']} />}>
        <Investigation
          title="The query that loaded 100k rows to keep 200"
          symptom="A shift-scheduling query on a roster tool took 7-10s on every load."
          cause="Override-priority resolution was loading 100k+ rows before filtering any of them out."
          fix="Split the join into two round trips (cheap here, because backend and database share a VPC) and moved the filter into the first query."
          result={<Fragment>~200 rows in the working set and <span className="el-mint el-mono">~500ms</span> end to end.</Fragment>}
        />
      </Section>

      <Section title="Recent writing" id="writing" action={<Link href="#" mono>all posts →</Link>}>
        <PostList posts={[
          { date: '2026-09-12', title: 'combineLatest where zip was correct', summary: "Breakpoints can't isolate duplicate emissions, so I counted them per operator instead.", tags: ['rxjs', 'angular', 'perf'], minutes: 8 },
          { date: '2026-07-30', title: 'Hooks that return a new object every render', summary: 'Slice hooks returning fresh object identities, the infinite render loops that followed, and splitting volatile state from stable setters.', tags: ['react', 'redux'], minutes: 11 },
          { date: '2026-05-04', title: 'Config by pointer, data by snapshot', summary: '30+ live git branches each holding stale config, and moving it to a shared branch without a data migration.', tags: ['architecture', 'git'], minutes: 9 },
        ]} />
      </Section>

      <Section title="Open source" id="oss">
        <Card padding="lg" className="lp-pkg">
          <div>
            <Heading level={3} prefix={false}>@evinle/gas-p</Heading>
            <Text variant="lead">Local development tooling for Google Apps Script. Shims GAS services at three fidelity levels (live calls, local mocks, and unit-test fakes with store writes and cascade deletes) so projects run and get tested outside the Apps Script editor.</Text>
            <ChipList items={['typescript', 'npm', { label: 'MIT', glyph: null }]} />
          </div>
          <div className="lp-pkg-side">
            <div className="el-metric-vals lp-installs"><span className="el-metric-after">~160</span></div>
            <Label>WEEKLY INSTALLS</Label>
            <Terminal title="install">
              <Prompt>npm i @evinle/gas-p</Prompt>
            </Terminal>
          </div>
        </Card>
      </Section>

      <Footer />
    </Page>
  );
}
(window as any).ReactDOM.createRoot(document.getElementById('root')).render(<App />);
