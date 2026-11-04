import { test, expect, type Page } from '@playwright/test';

// The page's rendered surface colour in each theme, from design-system/tokens.css.
const LIGHT = 'rgb(254, 254, 255)';
const DARK = 'rgb(27, 30, 40)';

// networkidle so the theme switch island has hydrated before it is clicked.
async function openAbout(page: Page) {
  await page.goto('/about', { waitUntil: 'networkidle' });
}

function switchTheme(page: Page) {
  return page.getByRole('button', { name: 'Switch theme' }).click();
}

test.describe('on a light system', () => {
  test.use({ colorScheme: 'light' });

  test('the page follows the system, and the first click switches to dark', async ({ page }) => {
    await openAbout(page);
    await expect(page.locator('body')).toHaveCSS('background-color', LIGHT);

    await switchTheme(page);

    await expect(page.locator('body')).toHaveCSS('background-color', DARK);
  });

  test('the chosen theme survives a reload', async ({ page }) => {
    await openAbout(page);
    await switchTheme(page);
    await expect(page.locator('body')).toHaveCSS('background-color', DARK);

    await page.reload({ waitUntil: 'networkidle' });

    await expect(page.locator('body')).toHaveCSS('background-color', DARK);
  });
});

test.describe('on a dark system', () => {
  test.use({ colorScheme: 'dark' });

  test('the page follows the system, and the first click switches to light', async ({ page }) => {
    await openAbout(page);
    await expect(page.locator('body')).toHaveCSS('background-color', DARK);

    await switchTheme(page);

    await expect(page.locator('body')).toHaveCSS('background-color', LIGHT);
  });

  test('clicking twice returns to the system theme', async ({ page }) => {
    await openAbout(page);

    await switchTheme(page);
    await expect(page.locator('body')).toHaveCSS('background-color', LIGHT);
    await switchTheme(page);

    await expect(page.locator('body')).toHaveCSS('background-color', DARK);
  });
});
