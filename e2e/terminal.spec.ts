import { test, expect, type Page } from '@playwright/test';
import { testIds } from '../src/testIds';

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('a visitor still gets the first output, and intro phrases link to their sections', async ({ page }) => {
    await page.goto('/');
    const screen = page.getByTestId(testIds.terminalScreen);
    await expect(screen.getByText('evinle', { exact: true })).toBeVisible();
    await expect(screen.getByText('cat stack.yaml', { exact: true })).toBeHidden();

    for (const [name, href] of [
      ['full stack engineer in Brisbane', '#exp'],
      ['React and Angular', '#stack'],
      ['conventions written down as ADRs and context files', '#how'],
    ]) {
      await expect(page.getByRole('link', { name })).toHaveAttribute('href', href);
      await expect(page.locator(href)).toBeAttached();
    }
  });
});

// Pausing the fake clock before navigating means no terminal time passes until a test runs it.
async function openPausedAbout(page: Page) {
  await page.clock.install({ time: new Date('2026-06-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-06-01T00:00:01Z'));
  await page.goto('/');
  // The command buttons are disabled until the island has hydrated.
  await expect(page.getByRole('button', { name: 'whoami' })).toBeEnabled();
  return page.getByTestId(testIds.terminalScreen);
}

test('a visitor clicks an intro phrase, and the terminal runs its command without leaving the intro', async ({ page }) => {
  const screen = await openPausedAbout(page);

  await page.getByRole('link', { name: 'React and Angular' }).click();
  await page.clock.runFor(1_500);

  await expect(screen.getByText('cat stack.yaml', { exact: true })).toBeVisible();
  await expect(screen.getByText('typescript', { exact: true })).toBeVisible();
  expect(new URL(page.url()).hash).toBe('');
});

test('a visitor pauses the rotation, then resumes it and it moves on', async ({ page }) => {
  const screen = await openPausedAbout(page);

  await page.getByRole('button', { name: 'Pause rotation' }).click();
  await page.clock.runFor(60_000);
  await expect(screen.getByText('evinle', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Resume rotation' }).click();
  await page.clock.runFor(7_000);
  await expect(screen.getByText('cat stack.yaml', { exact: true })).toBeVisible();
});
