import { expect, test, vi } from 'vitest';
import {
  HOLD_MS,
  INITIAL_STATE,
  advance,
  chosen,
  createTimeline,
  delayUntilNext,
  paused,
  resumed,
  type Scripts,
  type TimelineState,
} from './timeline';

const SHELL = { line: 'curl -s x | jq', exit: 'clear' };
const EDITOR = { line: 'nvim a.md', exit: ':q' };
const SCRIPTS = [SHELL, EDITOR];
// 'clear': five 40ms characters, then 220ms before Enter and 110ms pressing it.
const EXIT_CLEAR_MS = 530;
const ENTER_TO_OUTPUT_MS = 220 + 110 + 280;
// 'nvim a.md': 9 characters at 40ms, plus the 260ms pause after the program name.
const TYPE_EDITOR_MS = 9 * 40 + 260;

/** Walks the pure steps through `ms` of time, with no timers involved. */
function after(ms: number, state: TimelineState = INITIAL_STATE, scripts: Scripts = SCRIPTS) {
  let current = state;
  let left = ms;
  for (let delay = delayUntilNext(current, scripts); delay !== null && delay <= left; delay = delayUntilNext(current, scripts)) {
    left -= delay;
    current = advance(current, scripts);
  }
  return current;
}

test('it starts holding the first command, already rotating', () => {
  expect(INITIAL_STATE).toMatchObject({ phase: 'hold', index: 0, rotating: true });
});

test('after the hold it types the exit command, then moves on and types the next command', () => {
  expect(after(HOLD_MS - 100).phase).toBe('hold');
  expect(after(HOLD_MS)).toMatchObject({ phase: 'exiting', chars: 0, index: 0 });
  expect(after(HOLD_MS + 200).chars).toBe('clear'.length);
  expect(after(HOLD_MS + 420).phase).toBe('pressingExit');
  expect(after(HOLD_MS + EXIT_CLEAR_MS)).toMatchObject({ phase: 'typing', chars: 0, index: 1 });
});

test('each command leaves with its own exit command', () => {
  const start = after(HOLD_MS, INITIAL_STATE, [EDITOR, SHELL]);
  expect(after(80, start, [EDITOR, SHELL]).chars).toBe(':q'.length);
  expect(after(80 + 330, start, [EDITOR, SHELL]).index).toBe(1);
});

test('the last command wraps back to the first', () => {
  const wrapped = after(HOLD_MS + EXIT_CLEAR_MS, INITIAL_STATE, [SHELL]);
  expect(wrapped).toMatchObject({ phase: 'typing', index: 0 });
});

test('typing keeps an even pace inside words and pauses after the program name and the pipe', () => {
  const delayAt = (chars: number) => delayUntilNext({ ...chosen(0), chars }, SCRIPTS);

  // Inside a word.
  expect(delayAt(0)).toBe(40);
  expect(delayAt(1)).toBe(40);
  // After `curl `, which ends a phrase.
  expect(delayAt('curl '.length)).toBe(300);
  // After `-s `, an ordinary word.
  expect(delayAt('curl -s '.length)).toBe(120);
  // After `| `, which ends a phrase.
  expect(delayAt('curl -s x | '.length)).toBe(300);
  // Before Enter.
  expect(delayAt(SHELL.line.length)).toBe(220);
});

test('Enter goes down after the last character, then the output follows a beat later', () => {
  const typed = after(TYPE_EDITOR_MS, chosen(1));
  expect(typed).toMatchObject({ phase: 'typing', chars: EDITOR.line.length });

  expect(after(220, typed).phase).toBe('pressing');
  expect(after(220 + 110, typed).phase).toBe('executing');
  expect(after(ENTER_TO_OUTPUT_MS, typed).phase).toBe('settled');
});

test('choosing a command types it from the start, then stays on it', () => {
  expect(chosen(1)).toMatchObject({ index: 1, phase: 'typing', chars: 0, rotating: false });

  const settled = after(60_000, chosen(1));
  expect(settled).toMatchObject({ index: 1, phase: 'settled' });
  expect(delayUntilNext(settled, SCRIPTS)).toBeNull();
});

test('pausing during a hold keeps the output on screen for good', () => {
  const state = paused(INITIAL_STATE);
  expect(state).toMatchObject({ phase: 'settled', rotating: false, index: 0 });
  expect(after(60_000, state)).toEqual(state);
});

test('pausing mid-exit abandons the exit and keeps the output', () => {
  const exiting = after(HOLD_MS + 80);
  expect(exiting.phase).toBe('exiting');
  expect(paused(exiting)).toMatchObject({ phase: 'settled', index: 0 });
});

test('pausing while a command is typing lets it finish, then settles', () => {
  const typing = after(HOLD_MS + EXIT_CLEAR_MS + 40);
  expect(typing).toMatchObject({ phase: 'typing', index: 1 });

  expect(paused(typing).phase).toBe('typing');
  expect(after(60_000, paused(typing))).toMatchObject({ phase: 'settled', index: 1 });
});

test('resuming gives a settled output a full hold, then moves on', () => {
  // Paused near the end of its hold, so a resume that kept the leftover time would move on early.
  const state = resumed(paused(after(HOLD_MS - 200)));
  expect(state).toMatchObject({ phase: 'hold', rotating: true, index: 0 });

  expect(after(HOLD_MS - 100, state).phase).toBe('hold');
  expect(after(HOLD_MS + EXIT_CLEAR_MS, state)).toMatchObject({ phase: 'typing', index: 1 });
});

test('resuming while a chosen command is still typing finishes it, then holds', () => {
  const state = resumed(chosen(1));
  expect(state).toMatchObject({ phase: 'typing', rotating: true });
  expect(after(TYPE_EDITOR_MS + ENTER_TO_OUTPUT_MS, state)).toMatchObject({ phase: 'hold', index: 1 });
});

// The wrapper: only that it puts those steps on a clock and tells subscribers.

test('the clock only runs while running, and picks up where it stopped', () => {
  vi.useFakeTimers();
  const timeline = createTimeline(SCRIPTS);
  vi.advanceTimersByTime(60_000);
  expect(timeline.getSnapshot()).toEqual(INITIAL_STATE);

  timeline.setRunning(true);
  vi.advanceTimersByTime(HOLD_MS - 100);
  timeline.setRunning(false);
  vi.advanceTimersByTime(60_000);
  expect(timeline.getSnapshot().phase).toBe('hold');

  timeline.setRunning(true);
  vi.advanceTimersByTime(100);
  expect(timeline.getSnapshot().phase).toBe('exiting');
});

test('subscribers hear each change, and stop hearing once unsubscribed', () => {
  vi.useFakeTimers();
  const timeline = createTimeline(SCRIPTS);
  timeline.setRunning(true);
  const listener = vi.fn();
  const unsubscribe = timeline.subscribe(listener);

  vi.advanceTimersByTime(100);
  expect(listener).toHaveBeenCalledTimes(1);

  unsubscribe();
  vi.advanceTimersByTime(100);
  expect(listener).toHaveBeenCalledTimes(1);
});

test('takeOver, pause and resume restart the clock from the new state', () => {
  vi.useFakeTimers();
  const timeline = createTimeline(SCRIPTS);
  timeline.setRunning(true);

  timeline.pause();
  vi.advanceTimersByTime(60_000);
  expect(timeline.getSnapshot().phase).toBe('settled');

  timeline.resume();
  vi.advanceTimersByTime(HOLD_MS);
  expect(timeline.getSnapshot().phase).toBe('exiting');

  timeline.takeOver(1);
  vi.advanceTimersByTime(40);
  expect(timeline.getSnapshot()).toMatchObject({ index: 1, chars: 1 });
});
