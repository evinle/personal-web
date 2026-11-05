import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import { stubMatchMedia } from '../test/browserStubs';
import ThemeToggle from './ThemeToggle';

// Only the wrapper's side effects. Which theme comes next is covered in lib/theme.test.ts.

function clickSwitch() {
  fireEvent.click(screen.getByRole('button', { name: 'Switch theme' }));
}

beforeEach(() => {
  localStorage.clear();
});

test('the switch shows its icon', () => {
  stubMatchMedia();
  render(<ThemeToggle />);

  expect(screen.getByRole('button', { name: 'Switch theme' }).querySelector('.nf')).toHaveTextContent('');
});

test('a click reads the system theme, then applies and stores the next theme', () => {
  stubMatchMedia({ '(prefers-color-scheme: light)': true });
  render(<ThemeToggle />);

  clickSwitch();

  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(localStorage.getItem('theme')).toBe('dark');
});

test('the switch still works when storage is unavailable', () => {
  stubMatchMedia();
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage is blocked');
  });
  render(<ThemeToggle />);

  clickSwitch();

  expect(document.documentElement.dataset.theme).toBe('light');
});
