import { expect, test } from 'vitest';
import { buildGanttAxis, positionOnAxis, ym } from './ganttAxis';

const TODAY = '2026-11-05';
const axis = buildGanttAxis('2022-06', ['2022-12', '2026-09', TODAY], TODAY);
const monthsOnAxis = (months: number) => (months / axis.span) * 100;

test('dates become a count of months, with days as fractions', () => {
  expect(ym('2022-06') - ym('2022-01')).toBe(5);
  expect(ym('2023-01') - ym('2022-12')).toBe(1);
  expect(ym('2022-06-16') - ym('2022-06')).toBeCloseTo(0.5);
});

test('the axis leaves a month before the first Project', () => {
  expect(axis.pct('2022-06')).toBeCloseTo(monthsOnAxis(1));
  expect(axis.pct('2022-05')).toBe(0);
});

test('the axis leaves a month after today, the latest date', () => {
  expect(axis.span).toBeCloseTo(ym(TODAY) + 1 - (ym('2022-06') - 1));
  expect(axis.pct(TODAY)).toBeCloseTo(100 - monthsOnAxis(1));
});

test('a Project ending after today sets the end of the axis instead', () => {
  const { pct } = buildGanttAxis('2022-06', ['2027-03'], TODAY);
  expect(pct('2027-03')).toBeLessThan(100);
  expect(pct('2027-04')).toBe(100);
});

test('an axis that ends right on a new year gets no line on its edge', () => {
  const { years } = buildGanttAxis('2022-06', ['2026-12'], TODAY);
  expect(years.map(({ year }) => year)).not.toContain(2027);
});

test('positions hold to the ends of the axis', () => {
  expect(axis.pct('2000-01')).toBe(0);
  expect(axis.pct('2099-01-01')).toBe(100);
  expect(positionOnAxis('2099-01-01', axis.start, axis.span)).toBe(100);
});

test('the first label names the month, and starts where the first Project does', () => {
  expect(axis.years[0]).toEqual({ year: 2022, left: axis.pct('2022-06'), month: 'Jun' });
});

test('every later year has a label and a line, at its true position', () => {
  expect(axis.years.slice(1)).toEqual(axis.yearLines);
  expect(axis.yearLines.map(({ year }) => year)).toEqual([2023, 2024, 2025, 2026]);
  expect(axis.yearLines[0].left).toBeCloseTo(axis.pct('2023-01'));
  expect(axis.yearLines[1].left - axis.yearLines[0].left).toBeCloseTo(monthsOnAxis(12));
  expect(axis.yearLines.every(({ month }) => month === undefined)).toBe(true);
});

test('the first year gets no line, which would double up with the label column', () => {
  expect(axis.yearLines.map(({ year }) => year)).not.toContain(2022);
});
