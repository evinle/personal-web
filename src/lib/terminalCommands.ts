export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface TerminalCommand {
  name: string;
  line: string;
  /** Canned, not a real response: nothing is fetched. Only the body is real site data. */
  headers: string[];
  body: JsonValue;
  /** The one key whose value is coloured as the thing to notice. */
  highlight?: string;
}

export interface TerminalData {
  whoami: { [key: string]: JsonValue };
  qualifications: {
    studied: { [key: string]: JsonValue };
    certs: Array<{ name: string }>;
  };
  stack: Array<{ name: string; technologies: string[] }>;
}

function cannedHeaders(body: JsonValue, builtAt: Date): string[] {
  const length = new TextEncoder().encode(JSON.stringify(body, null, 2)).length;
  return [
    'HTTP/1.1 200 OK',
    'content-type: application/json',
    `content-length: ${length}`,
    `date: ${builtAt.toUTCString()}`,
  ];
}

function command(name: string, body: JsonValue, builtAt: Date, highlight?: string): TerminalCommand {
  return {
    name,
    line: `curl https://localhost:443/${name}.json -i | jq`,
    headers: cannedHeaders(body, builtAt),
    body,
    highlight,
  };
}

/** The rotation, in order. Bodies come from the same content collections as the rest of the page. */
export function buildTerminalCommands(data: TerminalData, builtAt: Date): TerminalCommand[] {
  const stack = Object.fromEntries(data.stack.map((group) => [group.name, group.technologies]));
  const qualifications = {
    studied: data.qualifications.studied,
    certs: data.qualifications.certs.map((cert) => cert.name),
  };
  return [
    command('whoami', data.whoami, builtAt, 'status'),
    command('stack', stack, builtAt),
    command('qualifications', qualifications, builtAt),
  ];
}
