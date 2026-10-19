const React: any = (window as any).React;
const h = React.createElement, Fragment = React.Fragment;
const { Page, Nav, Footer, Heading, Text, Label, Terminal, Prompt, Cursor, JsonOutput, Section, Gantt, Card, ChipList, Button } = (window as any).EvinLe;

const stack: Array<[string, any[]]> = [
  ['languages', ['typescript', 'javascript', 'c#', 'sql']],
  ['react', ['react', 'react query', 'redux toolkit', 'zustand', 'mui', 'hono', 'prisma', 'zod']],
  ['angular', ['angular', 'rxjs', 'angular material']],
  ['ui', ['ag grid', 'highcharts', 'bryntum gantt', 'json schema forms']],
  ['.net', ['.net', 'ef core', 'linq', 'mediatr', 'fluent validation']],
  ['data', ['postgresql', 'sql server', 'mongodb', 'snowflake', 'databricks']],
  ['cloud', ['azure', 'aws', 'git', 'github']],
  ['testing', ['playwright', 'bdd specs', 'aaa']],
];
const principles = [
  ['measure first', "Count emissions, rows and round trips before changing anything, because a fix you can't measure is a guess."],
  ['tests people keep', 'AAA structure and minimal mocking, so the tests still make sense to whoever touches the code next.'],
  ['write it down', 'Conventions live in ADRs and context files, so the patterns get picked up without me in the room.'],
  ['know what a refactor costs', "A better structure is only worth it against the deadline it's competing with, and sometimes it isn't."],
];

function App() {
  return (
    <Page>
      <Nav current="about" />
      <header className="ab-head">
        <Label>ABOUT</Label>
        <Heading level={1}>Evin Le</Heading>
      </header>
      <div className="ab-intro">
        <div>
          <Text>I'm a full stack engineer in Brisbane, four years in, strongest on the front end in React and Angular and comfortable in .NET and SQL. Most of my work has been scheduling and planning tools for tier 1 mining clients, which means big datasets, Gantt charts and a lot of reasons for things to be slow.</Text>
          <Text>I lead front-end architecture and I care about how a team writes code, so testing people actually maintain, and conventions written down as ADRs and context files. I use AI tools heavily, with intention, to learn and get better rather than to lean on.</Text>
        </div>
        <Terminal>
          <Prompt>whoami --json | jq</Prompt>
          <JsonOutput highlight={['status']} data={{
            name: 'Evin Le', role: 'full stack engineer', at: 'Visagio Australia', since: 2022, based: 'Brisbane, QLD',
            studied: { degree: 'BSc Computing', at: 'Curtin', grade: 'HD' },
            certs: ['AZ-900', 'Databricks DE Associate'], status: 'open to a chat',
          }} />
          <span className="el-muted">$ </span><Cursor />
        </Terminal>
      </div>

      <Section title="Experience" id="exp" action={<Label>4 OF 7 PROJECTS · 2022 - NOW</Label>}>
        <Gantt
          label="Timeline of projects at Visagio Australia from June 2022 to now: simulation-manager-p in 2022, production-scheduling 2023 to 2025, simulation-manager-i in 2025, roster-reconciliation 2025 to now."
          start="2022-01" end="2026-12" now="2026-10-19"
          parent={{ name: 'visagio-australia/', subtitle: 'Full stack engineer', start: '2022-06' }}
          rows={[
            { name: 'simulation-manager-p', chips: ['angular', 'ag grid'], start: '2022-06', end: '2022-12', tone: 'blue', note: 'JSON Schema UI, 30+ model types' },
            { name: 'production-scheduling', chips: ['angular', '.net', 'mongodb'], start: '2023-01', end: '2025-01', tone: 'blue', note: <Fragment><span className="el-pink">5s</span> → <span className="el-mint">~1s</span> · FE lead, team of 4</Fragment> },
            { name: 'simulation-manager-i', chips: ['react', 'prisma', 'hono'], start: '2025-03', end: '2025-09', tone: 'mint', note: 'Gantt logic, schema → Zod → client', noteSide: 'left' },
            { name: 'roster-reconciliation', chips: ['react', '.net', 'postgresql'], start: '2025-09', tone: 'mint', note: <Fragment><span className="el-pink">7-10s</span> → <span className="el-mint">~500ms</span> · coverage 8% → 40%</Fragment>, noteSide: 'left' },
          ]}
          legend={[{ label: 'angular', tone: 'blue' }, { label: 'react', tone: 'mint' }]}
        />
      </Section>

      <Section title="How I work" id="how">
        <div className="ab-principles">
          {principles.map(([t, d], i) => (
            <Card key={t}>
              <Heading level={3} prefix={false}><span className="el-blue">0{i + 1}</span> {t}</Heading>
              <Text variant="lead">{d}</Text>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Stack" id="stack">
        <dl className="ab-stack code">
          {stack.map(([k, items]) => (<Fragment key={k}><dt>{k}</dt><dd><ChipList items={items} /></dd></Fragment>))}
        </dl>
      </Section>

      <Section title="Get in touch" id="contact">
        <div className="ab-contact">
          <Button variant="primary" href="#" glyph="cod-mail">imevinle@gmail.com</Button>
          <Button href="#" glyph="cod-github">github.com/evinle</Button>
          <Button href="#" glyph="dev-npm">npmjs.com/~evinle</Button>
        </div>
      </Section>
      <Footer />
    </Page>
  );
}
(window as any).ReactDOM.createRoot(document.getElementById('root')).render(<App />);
