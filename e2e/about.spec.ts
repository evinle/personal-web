import { test, expect } from '@playwright/test';

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
