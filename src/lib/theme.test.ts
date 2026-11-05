import { expect, test } from 'vitest';
import { nextTheme } from './theme';

test('with no choice yet, it switches away from the system theme', () => {
  expect(nextTheme(undefined, true)).toBe('dark');
  expect(nextTheme(undefined, false)).toBe('light');
});

test('a chosen theme wins over the system', () => {
  expect(nextTheme('dark', true)).toBe('light');
  expect(nextTheme('light', false)).toBe('dark');
});

test('switching twice returns to where it started', () => {
  expect(nextTheme(nextTheme(undefined, false), false)).toBe('dark');
});

test('an unrecognised value counts as no choice', () => {
  expect(nextTheme('sepia', false)).toBe('light');
});
