import { expect, test } from 'vitest';
import { projectDetailSections, technologyChip, technologyNotes, technologyPopoverId } from './popovers';

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
