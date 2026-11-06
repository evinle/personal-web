import { test, expect, type Page } from '@playwright/test';

const stack = (page: Page) => page.getByRole('region', { name: /Stack/ });
const openPopover = (page: Page) => page.locator('.el-popover:popover-open');

test('a visitor opens a Technology from the Stack and reads its Proficiency and Project count, then closes it', async ({ page }) => {
  await page.goto('/');
  const rxjs = stack(page).getByRole('button', { name: 'rxjs', exact: true });

  await rxjs.click();
  await expect(openPopover(page).getByRole('heading', { name: 'RxJS' })).toBeVisible();
  // RxJS is on no Project's chips, so both Projects come from what they also used.
  await expect(openPopover(page).getByText('Strong · 2 projects')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(openPopover(page)).toHaveCount(0);
  await expect(rxjs).toBeFocused();
});

test('a Technology without a Note is a plain chip, not a button', async ({ page }) => {
  await page.goto('/');
  // Not exact, because the chip's text also holds its icon character.
  await expect(stack(page).getByText('prisma')).toBeVisible();
  await expect(stack(page).getByRole('button', { name: 'prisma', exact: true })).toHaveCount(0);
});

test.describe('just below 900px', () => {
  test.use({ viewport: { width: 899, height: 900 } });

  test('a Technology opens from inside a Project\'s technologies', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'devops-support: 5 technologies' }).click();
    await openPopover(page).getByRole('button', { name: 'angular', exact: true }).click();

    const angular = openPopover(page).filter({ has: page.getByRole('heading', { name: 'Angular' }) });
    await expect(angular.getByText('Strong · 3 projects')).toBeVisible();
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('a Technology still opens', async ({ page }) => {
    await page.goto('/');
    await stack(page).getByRole('button', { name: 'typescript', exact: true }).click();
    await expect(openPopover(page).getByText('Strong · 5 projects')).toBeVisible();
  });
});
