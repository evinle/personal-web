export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type YamlValue = string | number | string[] | { [key: string]: YamlValue };

export interface EditorOutput {
  kind: 'editor';
  file: string;
  lines: string[];
}

export type TerminalOutput =
  | { kind: 'plain'; lines: string[] }
  | { kind: 'yaml'; data: { [key: string]: YamlValue } }
  /** `highlight` is the one key whose value is coloured as the thing to notice. */
  | { kind: 'json'; data: JsonValue; highlight?: string }
  | EditorOutput;

export interface TerminalCommand {
  name: string;
  line: string;
  /** Typed to leave this command's output: `clear` in the shell, `:q` in the editor. */
  exit: string;
  /** The in-page anchor shared with the intro phrase that runs this command, if one does. */
  anchor?: string;
  output: TerminalOutput;
}

export interface TerminalData {
  whoami: { name: string; role: string; at: string; since: number; based: string; status: string };
  qualifications: {
    studied: { degree: string; at: string; grade: string };
    certs: Array<{ name: string }>;
  };
  stack: Array<{ name: string; technologies: string[] }>;
  principles: string[];
}

function whoamiCommand({ name, role, at, since, based }: TerminalData['whoami']): TerminalCommand {
  return {
    name: 'whoami',
    line: 'whoami',
    exit: 'clear',
    anchor: 'exp',
    output: {
      kind: 'plain',
      lines: [name.toLowerCase().replace(/\s+/g, ''), `${role} at ${at}`, `since ${since}, based in ${based}`],
    },
  };
}

function howIWorkCommand(principles: string[]): TerminalCommand {
  const file = 'how-i-work.md';
  return {
    name: 'how-i-work',
    line: `nvim ${file}`,
    exit: ':q',
    anchor: 'how',
    output: {
      kind: 'editor',
      file,
      lines: ['# how i work', '', ...principles.map((title, i) => `${i + 1}. ${title}`)],
    },
  };
}

/** The rotation, in order. Outputs come from the same content collections as the rest of the page. */
export function buildTerminalCommands(data: TerminalData): TerminalCommand[] {
  const stack = Object.fromEntries(data.stack.map((group) => [group.name, group.technologies]));
  const qualifications = {
    studied: data.qualifications.studied,
    certs: data.qualifications.certs.map((cert) => cert.name),
  };
  return [
    whoamiCommand(data.whoami),
    { name: 'stack', line: 'cat stack.yaml', exit: 'clear', anchor: 'stack', output: { kind: 'yaml', data: stack } },
    howIWorkCommand(data.principles),
    { name: 'qualifications', line: 'cat qualifications.yaml', exit: 'clear', output: { kind: 'yaml', data: qualifications } },
    {
      name: 'status',
      line: 'curl -s https://localhost/status.json | jq',
      exit: 'clear',
      output: { kind: 'json', data: { status: data.whoami.status, based: data.whoami.based }, highlight: 'status' },
    },
  ];
}
