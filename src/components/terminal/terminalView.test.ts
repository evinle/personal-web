import { expect, test } from 'vitest';
import type { TerminalCommand } from '../../lib/terminalCommands';
import {
  commandButtonView,
  commandIndexForHref,
  displayedState,
  isPhraseRunning,
  rotationToggleLabel,
  screenView,
  statusMessage,
} from './terminalView';
import { INITIAL_STATE, chosen, type Phase, type TimelineState } from './timeline';

const SHELL: TerminalCommand = {
  name: 'stack',
  line: 'cat stack.yaml',
  exit: 'clear',
  anchor: 'stack',
  output: { kind: 'plain', lines: ['typescript'] },
};
const EDITOR: TerminalCommand = {
  name: 'how-i-work',
  line: 'nvim how-i-work.md',
  exit: ':q',
  anchor: 'how',
  output: { kind: 'editor', file: 'how-i-work.md', lines: ['# how i work'] },
};
const NO_PHRASE: TerminalCommand = { ...SHELL, name: 'status', anchor: undefined };
const COMMANDS = [SHELL, EDITOR, NO_PHRASE];

const at = (phase: Phase, chars = 0): TimelineState => ({ ...INITIAL_STATE, phase, chars });

test('while typing, only the typed part of the command shows, with the caret on its line', () => {
  expect(screenView(SHELL, at('typing', 3))).toMatchObject({ typed: 'cat', caret: 'line', revealed: false, caretPressed: false });
});

test('the caret dips only while Enter is down', () => {
  expect(screenView(SHELL, at('pressing')).caretPressed).toBe(true);
  expect(screenView(SHELL, at('pressingExit')).caretPressed).toBe(true);
  expect(screenView(SHELL, at('executing')).caretPressed).toBe(false);
  expect(screenView(SHELL, at('hold')).caretPressed).toBe(false);
});

test('after Enter the whole line shows and the caret drops below it, with no output yet', () => {
  expect(screenView(SHELL, at('executing'))).toMatchObject({ typed: SHELL.line, caret: 'below', revealed: false });
});

test.each<Phase>(['hold', 'exiting', 'pressingExit', 'settled'])('output is on screen during %s', (phase) => {
  expect(screenView(SHELL, at(phase))).toMatchObject({ revealed: true, caret: 'prompt' });
});

test('the exit command types out only while exiting', () => {
  expect(screenView(SHELL, at('hold')).exitTyped).toBeNull();
  expect(screenView(SHELL, at('settled')).exitTyped).toBeNull();
  expect(screenView(SHELL, at('exiting', 2)).exitTyped).toBe('cl');
  expect(screenView(EDITOR, at('exiting', 1)).exitTyped).toBe(':');
  expect(screenView(EDITOR, at('pressingExit', 2)).exitTyped).toBe(':q');
});

test('shell output never takes over the screen', () => {
  expect(screenView(SHELL, at('hold'))).toMatchObject({ screen: 'shell', holdsEditorHeight: false });
});

test('the editor stays a shell line until revealed, holding its height meanwhile', () => {
  expect(screenView(EDITOR, at('typing', 2))).toMatchObject({ screen: 'shell', holdsEditorHeight: true });
  expect(screenView(EDITOR, at('executing'))).toMatchObject({ screen: 'shell', holdsEditorHeight: true });
  expect(screenView(EDITOR, at('hold'))).toMatchObject({ screen: 'editor', holdsEditorHeight: false });
  expect(screenView(EDITOR, at('settled'))).toMatchObject({ screen: 'editor', holdsEditorHeight: false });
});

test('with reduced motion the state always shows as settled, whatever is running behind it', () => {
  expect(displayedState(chosen(1), true)).toMatchObject({ phase: 'settled', index: 1 });
  expect(displayedState(chosen(1), false).phase).toBe('typing');
});

test('only the active command\'s button is active, and it counts down only during a hold', () => {
  expect(commandButtonView(0, INITIAL_STATE)).toEqual({ active: true, chosen: false, counting: true });
  expect(commandButtonView(1, INITIAL_STATE)).toEqual({ active: false, chosen: false, counting: false });
  expect(commandButtonView(0, at('typing'))).toMatchObject({ counting: false });
});

test('a button reads as chosen once the rotation has stopped', () => {
  expect(commandButtonView(1, chosen(1))).toEqual({ active: true, chosen: true, counting: false });
  expect(commandButtonView(0, chosen(1))).toEqual({ active: false, chosen: false, counting: false });
});

test('the toggle offers whichever action applies', () => {
  expect(rotationToggleLabel(true)).toBe('Pause rotation');
  expect(rotationToggleLabel(false)).toBe('Resume rotation');
});

test('choosing a command is announced, and the rotation stays quiet', () => {
  expect(statusMessage(SHELL, true)).toBe('');
  expect(statusMessage(SHELL, false)).toBe('Terminal now shows cat stack.yaml');
});

test('a phrase finds its command by anchor', () => {
  expect(commandIndexForHref(COMMANDS, '#how')).toBe(1);
  expect(commandIndexForHref(COMMANDS, '#elsewhere')).toBe(-1);
  expect(commandIndexForHref(COMMANDS, null)).toBe(-1);
  expect(commandIndexForHref(COMMANDS, undefined)).toBe(-1);
});

test('a command with no anchor is never matched, even by an undefined-looking link', () => {
  expect(commandIndexForHref([NO_PHRASE], '#undefined')).toBe(-1);
});

test('only the phrase for the active command is running', () => {
  expect(isPhraseRunning(COMMANDS, 0, '#stack')).toBe(true);
  expect(isPhraseRunning(COMMANDS, 1, '#stack')).toBe(false);
  expect(isPhraseRunning(COMMANDS, 2, '#stack')).toBe(false);
  expect(isPhraseRunning(COMMANDS, 2, '#elsewhere')).toBe(false);
});
