import { test, expect, type Locator, type Page } from '@playwright/test';

const PLACEHOLDERS = [
  { path: '/', current: 'home' },
  { path: '/writing', current: 'writing' },
  { path: '/projects', current: 'projects' },
];
const ALL_PATHS = [...PLACEHOLDERS.map((p) => p.path), '/about'];

function navOf(page: Page) {
  return page.getByRole('navigation', { name: 'Main' });
}

// Matches the end of the name because the current page's link has a decorative "> " before it.
function navLink(page: Page, label: string) {
  return navOf(page).getByRole('link', { name: new RegExp(`(^|\\s)${label}$`) });
}

async function expectOpensInNewTab(link: Locator, href: string) {
  await expect(link).toHaveAttribute('href', href);
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', 'noreferrer');
}

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Element has no box');
  return { left: box.x, right: box.x + box.width };
}

for (const { path, current } of PLACEHOLDERS) {
  test(`${path} says it is under construction and marks its place in the nav`, async ({ page }) => {
    const response = await page.goto(path);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: 'Under construction' })).toBeVisible();
    await expect(navLink(page, current)).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('main').getByRole('link', { name: '/about' })).toHaveAttribute('href', '/about');
  });
}

for (const path of ALL_PATHS) {
  test(`${path} footer opens external links in a new tab and leaves email alone`, async ({ page }) => {
    await page.goto(path);
    const footer = page.getByRole('contentinfo');

    await expectOpensInNewTab(footer.getByRole('link', { name: 'github' }), 'https://github.com/evinle');
    await expectOpensInNewTab(footer.getByRole('link', { name: 'npm' }), 'https://www.npmjs.com/~evinle');

    const email = footer.getByRole('link', { name: 'email' });
    await expect(email).toHaveAttribute('href', 'mailto:imevinle@gmail.com');
    await expect(email).not.toHaveAttribute('target', '_blank');
  });
}

test('GitHub is linked from the footer and Get in touch, not the header', async ({ page }) => {
  await page.goto('/about');

  await expect(navOf(page).getByRole('link', { name: /github/i })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /github/i })).toHaveCount(2);
});

for (const width of [1280, 600, 375, 320]) {
  test.describe(`nav at ${width}px wide`, () => {
    test.use({ viewport: { width, height: 800 } });

    test('the theme switch and links are on screen, without the page scrolling sideways', async ({ page }) => {
      await page.goto('/about');
      const theme = await boxOf(navOf(page).getByRole('button', { name: 'Switch theme' }));

      // 16px is the smallest page gutter; past it the nav row clips the button.
      expect(theme.right).toBeLessThanOrEqual(width - 16);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
      await expect(navLink(page, 'about')).toBeInViewport({ ratio: 1 });
    });
  });
}
