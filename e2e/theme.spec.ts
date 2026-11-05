import { test, expect } from '@playwright/test';

// The page's rendered surface colour in each theme, from design-system/tokens.css.
const LIGHT = 'rgb(254, 254, 255)';
const DARK = 'rgb(27, 30, 40)';

test.use({ colorScheme: 'light' });

test('a visitor switches theme, and the choice applies before paint on the next load', async ({ page }) => {
  // networkidle so the theme switch island has hydrated before it is clicked.
  await page.goto('/', { waitUntil: 'networkidle' });
  const body = page.locator('body');
  await expect(body).toHaveCSS('background-color', LIGHT);

  await page.getByRole('button', { name: 'Switch theme' }).click();
  await expect(body).toHaveCSS('background-color', DARK);

  await page.reload({ waitUntil: 'networkidle' });
  await expect(body).toHaveCSS('background-color', DARK);

  await page.getByRole('button', { name: 'Switch theme' }).click();
  await expect(body).toHaveCSS('background-color', LIGHT);
});
