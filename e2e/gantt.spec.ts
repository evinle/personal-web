import { test, expect } from '@playwright/test';
import { testIds } from '../src/testIds';

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test('a visitor taps a bar to read its note, then taps elsewhere to close it', async ({ page }) => {
    await page.goto('/about');
    const bar = page.getByRole('button', { name: 'simulation-manager-p: show details' });
    const note = page.getByText('JSON Schema UI, 30+ model types', { exact: true });
    await expect(note).toBeHidden();

    await bar.getByTestId(testIds.aboutGanttNoteHint).click();
    await expect(note).toBeVisible();

    await page.getByRole('heading', { level: 1 }).click();
    await expect(note).toBeHidden();
  });
});

test('the now line and ongoing bars follow the visitor\'s date, not the build date', async ({ page }) => {
  await page.clock.install({ time: new Date('2099-01-01T00:00:00Z') });
  await page.goto('/about');

  const propertyOf = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();
  expect(await page.getByTestId(testIds.aboutGanttNowMarker).evaluate(propertyOf, '--n')).toBe('100');
  expect(await page.getByTestId(testIds.aboutGanttOngoingBar).evaluate(propertyOf, '--e')).toBe('100');
});
