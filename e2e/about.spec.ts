import { test, expect } from '@playwright/test';
import { testIds } from '../src/test-ids';

test('About page renders its content from the data', async ({ page }) => {
  await page.goto('/about');

  await expect(page.getByText('ABOUT', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Evin Le' })).toBeVisible();

  await expect(
    page.getByText('full stack engineer in Brisbane', { exact: false })
  ).toBeVisible();

  await expect(page.getByRole('heading', { name: /measure first/ })).toBeVisible();

  await expect(page.getByText('typescript', { exact: false }).first()).toBeVisible();

  await expect(page.getByText('roster-reconciliation', { exact: true })).toBeVisible();

  await expect(page.getByRole('link', { name: /imevinle@gmail\.com/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /github\.com\/evinle/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /npmjs\.com\/~evinle/ })).toBeVisible();
});

test('Gantt "now" marker and ongoing bars follow the visitor\'s live date, pinned to the axis edge once past it', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2099-01-01T00:00:00Z') });
  await page.goto('/about');

  const nowMarker = page.getByTestId(testIds.aboutGanttNowMarker);
  const nowValue = await nowMarker.evaluate((el) => getComputedStyle(el).getPropertyValue('--n').trim());
  expect(Number(nowValue)).toBe(100);

  const ongoingBar = page.getByTestId(testIds.aboutGanttOngoingBar);
  const endValue = await ongoingBar.evaluate((el) => getComputedStyle(el).getPropertyValue('--e').trim());
  expect(Number(endValue)).toBe(100);
});
