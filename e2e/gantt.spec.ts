import { test, expect, type Page } from '@playwright/test';
import { testIds } from '../src/testIds';

const DETAIL = 'Moved the push into a custom module that skips both passes.';

const experience = (page: Page) => page.getByRole('region', { name: /Experience/ });
const barOf = (page: Page) => page.getByRole('button', { name: 'devops-support: show details' });
const nameOf = (page: Page) => experience(page).getByRole('button', { name: 'devops-support', exact: true });

test('a visitor opens a Project from its bar or name, then closes it with Esc or by clicking outside', async ({ page }) => {
  await page.goto('/');
  const detail = page.getByText(DETAIL);
  await expect(detail).toBeHidden();

  await barOf(page).click();
  await expect(detail).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(detail).toBeHidden();

  await nameOf(page).click();
  await expect(detail).toBeVisible();
  await page.getByRole('heading', { level: 1 }).click();
  await expect(detail).toBeHidden();
});

test('opening one Project closes the last, so only one card is open', async ({ page }) => {
  await page.goto('/');
  await barOf(page).click();
  await experience(page).getByRole('button', { name: 'production-scheduling', exact: true }).click();

  await expect(page.getByText(DETAIL)).toBeHidden();
  await expect(page.locator('.el-popover:popover-open')).toHaveCount(1);
});

test('a keyboard user can open a Project and land back on the same button', async ({ page }) => {
  await page.goto('/');
  await nameOf(page).focus();

  await page.keyboard.press('Enter');
  await expect(page.getByText(DETAIL)).toBeVisible();
  await page.keyboard.press('Escape');

  await expect(nameOf(page)).toBeFocused();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('a Project card still opens', async ({ page }) => {
    await page.goto('/');
    await barOf(page).click();
    await expect(page.getByText(DETAIL)).toBeVisible();
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test('a visitor taps a bar and reads its short note along with the detail', async ({ page }) => {
    await page.goto('/');
    const bar = page.getByRole('button', { name: 'simulation-manager-p: show details' });
    const popover = page.locator('.el-popover:popover-open');
    await expect(popover).toHaveCount(0);

    await bar.getByTestId(testIds.aboutGanttNoteHint).click();

    await expect(popover.getByText('JSON Schema UI, 30+ model types', { exact: true })).toBeVisible();
    await expect(popover.getByText('PROBLEM', { exact: true })).toBeVisible();
  });
});

test('the now line and ongoing bars follow the visitor\'s date, not the build date', async ({ page }) => {
  await page.clock.install({ time: new Date('2099-01-01T00:00:00Z') });
  await page.goto('/');

  const propertyOf = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();
  expect(await page.getByTestId(testIds.aboutGanttNowMarker).evaluate(propertyOf, '--n')).toBe('100');
  expect(await page.getByTestId(testIds.aboutGanttOngoingBar).evaluate(propertyOf, '--e')).toBe('100');
});
