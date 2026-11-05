import { test, expect, type Page } from '@playwright/test';

function navLink(page: Page, label: string) {
  // Matches the end of the name because the current page's link has a decorative "> " before it.
  return page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: new RegExp(`(^|\\s)${label}$`) });
}

test('a visitor moves between pages with the nav, which marks where they are', async ({ page }) => {
  await page.goto('/');
  await expect(navLink(page, 'home')).toHaveAttribute('aria-current', 'page');

  for (const label of ['writing', 'projects']) {
    await navLink(page, label).click();
    await expect(navLink(page, label)).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('heading', { level: 1, name: 'Under construction' })).toBeVisible();
  }

  await page.getByRole('main').getByRole('link', { name: '/about' }).click();
  await expect(navLink(page, 'about')).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { level: 1, name: 'Evin Le' })).toBeVisible();
});

test('the footer opens external links in a new tab and leaves email alone', async ({ page }) => {
  await page.goto('/about');
  const footer = page.getByRole('contentinfo');

  for (const [name, href] of [['github', 'https://github.com/evinle'], ['npm', 'https://www.npmjs.com/~evinle']]) {
    const link = footer.getByRole('link', { name });
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noreferrer');
  }

  const email = footer.getByRole('link', { name: 'email' });
  await expect(email).toHaveAttribute('href', 'mailto:imevinle@gmail.com');
  await expect(email).not.toHaveAttribute('target', '_blank');
});
