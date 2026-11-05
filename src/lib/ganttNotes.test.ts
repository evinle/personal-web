import { expect, test } from 'vitest';
import { nextOpenNote, noteShift } from './ganttNotes';

test('tapping a bar opens its note', () => {
  expect(nextOpenNote(null, { type: 'tapBar', note: 'a' })).toBe('a');
});

test('tapping another bar swaps to its note, so only one is open', () => {
  expect(nextOpenNote('a', { type: 'tapBar', note: 'b' })).toBe('b');
});

test('tapping the open bar closes its note', () => {
  expect(nextOpenNote('a', { type: 'tapBar', note: 'a' })).toBeNull();
});

test('tapping elsewhere or dismissing closes the note', () => {
  expect(nextOpenNote('a', { type: 'tapElsewhere' })).toBeNull();
  expect(nextOpenNote('a', { type: 'dismiss' })).toBeNull();
  expect(nextOpenNote(null, { type: 'dismiss' })).toBeNull();
});

const CHART = { left: 0, right: 300 };

test('a note inside the chart stays put', () => {
  expect(noteShift(CHART, { left: 50, right: 150 })).toBe(0);
});

test('a note past the right edge is nudged left, to the margin', () => {
  expect(noteShift(CHART, { left: 250, right: 350 })).toBe(-58);
});

test('a note past the left edge is nudged right, to the margin', () => {
  expect(noteShift(CHART, { left: -20, right: 80 })).toBe(28);
});

test('a note closer to an edge than the margin is nudged too', () => {
  expect(noteShift(CHART, { left: 200, right: 295 })).toBe(-3);
  expect(noteShift(CHART, { left: 200, right: 295 }, 0)).toBe(0);
});
