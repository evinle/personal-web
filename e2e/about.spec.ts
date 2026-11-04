import { test, expect } from '@playwright/test';
import { testIds } from '../src/testIds';

test('About page renders its content from the data', async ({ page }) => {
  await page.goto('/about');

  await expect(page.getByText('ABOUT', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Evin Le' })).toBeVisible();

  await expect(
    page.getByText('full stack engineer in Brisbane', { exact: false })
  ).toBeVisible();

  await expect(page.getByRole('heading', { name: /measure first/ })).toBeVisible();

  await expect(page.getByRole('region', { name: /Stack/ }).getByText('typescript')).toBeVisible();

  await expect(page.getByText('roster-reconciliation', { exact: true })).toBeVisible();

  await expect(page.getByRole('link', { name: /imevinle@gmail\.com/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /github\.com\/evinle/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /npmjs\.com\/~evinle/ })).toBeVisible();
});

test('Experience shows each Project with its Technologies', async ({ page }) => {
  await page.goto('/about');

  const experience = page.getByRole('region', { name: /Experience/ });
  await expect(experience.getByText('devops-support', { exact: true })).toBeVisible();
  await expect(experience.getByText('kubernetes', { exact: true })).toBeVisible();
  await expect(experience.getByText('solace', { exact: true })).toBeVisible();
  await expect(experience.getByText('ms sql')).toBeVisible();
  await expect(experience.getByText('ag grid', { exact: true })).toBeVisible();
  await expect(experience.getByText('angular material', { exact: true })).toBeVisible();
});

test('Stack and Qualifications reflect the current resume', async ({ page }) => {
  await page.goto('/about');

  const stack = page.getByRole('region', { name: /Stack/ });
  const groups = await stack.getByRole('term').allTextContents();
  expect(groups).toEqual(['languages', 'react', 'angular', 'ui', '.net', 'databases', 'testing', 'practice', 'cloud']);
  await expect(stack.getByText('bryntum gantt & scheduler', { exact: true })).toBeVisible();
  await expect(stack.getByText('pair programming', { exact: true })).toBeVisible();
  await expect(stack.getByText('kubernetes', { exact: true })).toBeVisible();
  await expect(stack.getByText('solace', { exact: true })).toHaveCount(0);

  await expect(page.getByRole('heading', { name: 'Bachelor of Science (Computing)' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Databricks Data Engineer Associate' })).toBeVisible();
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
