import { expect, test } from 'vitest';
import { buildTerminalCommands, type TerminalCommand } from './terminalCommands';

const commands = buildTerminalCommands({
  whoami: { name: 'Evin Le', role: 'engineer', at: 'Acme', since: 2022, based: 'Brisbane', status: 'open to a chat' },
  qualifications: {
    studied: { degree: 'BSc', at: 'Curtin', grade: 'HD' },
    certs: [{ name: 'AZ-900' }, { name: 'Databricks' }],
  },
  stack: [
    { name: 'languages', technologies: ['typescript', 'sql'] },
    { name: 'cloud', technologies: ['azure'] },
  ],
  principles: ['measure first', 'tests people keep'],
});

function commandNamed(name: string): TerminalCommand {
  const command = commands.find((candidate) => candidate.name === name);
  if (!command) throw new Error(`No command named ${name}`);
  return command;
}

test('the rotation runs these commands, in this order', () => {
  expect(commands.map((command) => command.line)).toEqual([
    'whoami',
    'cat stack.yaml',
    'nvim how-i-work.md',
    'cat qualifications.yaml',
    'curl -s https://localhost/status.json | jq',
  ]);
});

test('the editor exits with :q, and everything else with clear', () => {
  expect(commands.map((command) => command.exit)).toEqual(['clear', 'clear', ':q', 'clear', 'clear']);
});

test('commands share an anchor with their intro phrase, and the rest have none', () => {
  expect(commands.map((command) => command.anchor)).toEqual(['exp', 'stack', 'how', undefined, undefined]);
});

test('whoami prints a login made from the name, then the role and location', () => {
  expect(commandNamed('whoami').output).toEqual({
    kind: 'plain',
    lines: ['evinle', 'engineer at Acme', 'since 2022, based in Brisbane'],
  });
});

test('stack is keyed by group, in the order given', () => {
  expect(commandNamed('stack').output).toEqual({
    kind: 'yaml',
    data: { languages: ['typescript', 'sql'], cloud: ['azure'] },
  });
});

test('qualifications lists certificate names only', () => {
  expect(commandNamed('qualifications').output).toEqual({
    kind: 'yaml',
    data: { studied: { degree: 'BSc', at: 'Curtin', grade: 'HD' }, certs: ['AZ-900', 'Databricks'] },
  });
});

test('how-i-work opens a file with a title and numbered principles', () => {
  expect(commandNamed('how-i-work').output).toEqual({
    kind: 'editor',
    file: 'how-i-work.md',
    lines: ['# how i work', '', '1. measure first', '2. tests people keep'],
  });
});

test('status is the thing to notice in its JSON', () => {
  expect(commandNamed('status').output).toEqual({
    kind: 'json',
    data: { status: 'open to a chat', based: 'Brisbane' },
    highlight: 'status',
  });
});
