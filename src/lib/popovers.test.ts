import { expect, test } from 'vitest';
import {
  MIN_READABLE_HEIGHT,
  projectDetailSections,
  shouldClosePopover,
  technologyChip,
  technologyCountLabel,
  technologyNotes,
  technologyPopoverId,
} from './popovers';

test('a Project row counts its Technologies, in the singular for one', () => {
  expect(technologyCountLabel(1)).toBe('1 technology');
  expect(technologyCountLabel(5)).toBe('5 technologies');
});

const VIEW = { top: 65, bottom: 800 };
const closes = (top: number, height: number, openedHeight = 400) =>
  shouldClosePopover(VIEW, { top, bottom: top + height, height }, openedHeight);

test('a popover inside the view, even right up against either edge, stays open', () => {
  expect(closes(200, 300)).toBe(false);
  expect(closes(65, 735)).toBe(false);
});

test('a popover past the nav closes', () => {
  expect(closes(64, 300)).toBe(true);
  expect(closes(-300, 200)).toBe(true);
});

test('a popover past the bottom of the screen closes', () => {
  expect(closes(600, 201)).toBe(true);
  expect(closes(900, 200)).toBe(true);
});

test('a popover that has shrunk too small to read closes, and one still big enough stays', () => {
  expect(closes(200, MIN_READABLE_HEIGHT - 1)).toBe(true);
  expect(closes(200, MIN_READABLE_HEIGHT)).toBe(false);
});

test('a popover that opened small, like a short Note, stays open until it shrinks', () => {
  expect(closes(200, 80, 80)).toBe(false);
  expect(closes(200, 79, 80)).toBe(true);
});

test('a closed popover has no box, so it never closes', () => {
  expect(closes(0, 0)).toBe(false);
});

test('a Technology with a Note opens its popover', () => {
  const chip = technologyChip('react', { label: 'React', icon: 'dev-react', note: 'Five years of it.' });

  expect(chip).toEqual({ label: 'React', icon: 'dev-react', popoverTarget: technologyPopoverId('react') });
});

test('a Technology without a Note, or with an empty one, is a plain chip', () => {
  expect(technologyChip('zod', { label: 'Zod' }).popoverTarget).toBeUndefined();
  expect(technologyChip('zod', { label: 'Zod', note: '' }).popoverTarget).toBeUndefined();
});

test('only Technologies with a Note get a popover, with the id their chips point at', () => {
  const notes = technologyNotes([
    { id: 'react', data: { label: 'React', note: 'Five years of it.' } },
    { id: 'zod', data: { label: 'Zod' } },
  ]);

  expect(notes).toEqual([{ id: technologyChip('react', { label: 'React', note: 'x' }).popoverTarget, title: 'React', note: 'Five years of it.' }]);
});

test('a Project card reads problem, fix, result, going from pink to mint', () => {
  const sections = projectDetailSections({ problem: 'slow', fix: 'cache', result: 'fast' });

  expect(sections.map(({ label, text }) => [label, text])).toEqual([
    ['PROBLEM', 'slow'],
    ['FIX', 'cache'],
    ['RESULT', 'fast'],
  ]);
  expect(sections[0].tone).toBe('el-pink');
  expect(sections[1].tone).toBe('el-mint');
});
