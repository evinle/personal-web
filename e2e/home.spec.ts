import { test, expect } from '@playwright/test';

test('a visitor can read every section of the home page, built from the real content', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Evin Le' })).toBeVisible();
  await expect(page.getByText('Full stack: from the product to the code')).toBeVisible();
  await expect(page.getByRole('region', { name: /Some numbers/ }).getByText('~500ms')).toBeVisible();
  await expect(page.getByRole('region', { name: /Experience/ }).getByRole('button', { name: 'devops-support', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /measure first/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bachelor of Science (Computing)' })).toBeVisible();

  const groups = await page.getByRole('region', { name: /Stack/ }).getByRole('term').allTextContents();
  expect(groups).toEqual(['languages', 'react', 'angular', 'ui', '.net', 'databases', 'testing', 'practice', 'cloud']);

  await expect(page.getByRole('link', { name: /imevinle@gmail\.com/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /github\.com\/evinle/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /npmjs\.com\/~evinle/ })).toBeVisible();
});
