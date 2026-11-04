import { test, expect, type Page } from '@playwright/test';
import { testIds } from '../src/testIds';

test.describe('with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false });

  test('the terminal already shows the first command and its output', async ({ page }) => {
    await page.goto('/about');
    const screen = page.getByTestId(testIds.aboutTerminalScreen);

    await expect(screen.getByText('curl https://localhost:443/whoami.json -i | jq')).toBeVisible();
    await expect(screen.getByText('HTTP/1.1 200 OK').first()).toBeVisible();
    await expect(screen.getByText('"open to a chat"')).toBeVisible();
    await expect(screen.getByText('curl https://localhost:443/stack.json -i | jq')).toBeHidden();
    await expect(screen).toHaveAttribute('aria-hidden', 'true');
  });
});

const line = (name: string) => `curl https://localhost:443/${name}.json -i | jq`;

// Pausing the fake clock before navigating means no terminal time passes until a test runs it.
async function openPausedAbout(page: Page) {
  await page.clock.install({ time: new Date('2026-06-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-06-01T00:00:01Z'));
  await page.goto('/about');
  // The command buttons are disabled until the island has hydrated.
  await expect(page.getByRole('button', { name: 'whoami' })).toBeEnabled();
  return page.getByTestId(testIds.aboutTerminalScreen);
}

test('the terminal holds an output, types clear, then types the next command', async ({ page }) => {
  const screen = await openPausedAbout(page);

  await page.clock.runFor(4_900);
  await expect(screen.getByText('"open to a chat"')).toBeVisible();
  await expect(screen.getByText('clear', { exact: true })).toBeHidden();

  await page.clock.runFor(300);
  await expect(screen.getByText('clear', { exact: true })).toBeVisible();
  await expect(screen.getByText('"open to a chat"')).toBeVisible();

  // Past Enter on `clear` and part way through typing the next command.
  await page.clock.runFor(800);
  await expect(screen.getByText('"open to a chat"')).toBeHidden();
  await expect(screen.getByText(line('stack'))).toBeHidden();

  await page.clock.runFor(2_700);
  await expect(screen.getByText(line('stack'))).toBeVisible();
  await expect(screen.getByText('"typescript"')).toBeVisible();
});

test('the terminal rotates through every command and wraps back to the first', async ({ page }) => {
  const screen = await openPausedAbout(page);
  const holdClearAndType = 9_000;

  await page.clock.runFor(holdClearAndType);
  await expect(screen.getByText(line('stack'))).toBeVisible();

  await page.clock.runFor(holdClearAndType);
  await expect(screen.getByText(line('qualifications'))).toBeVisible();
  await expect(screen.getByText('"Bachelor of Science (Computing)"')).toBeVisible();

  await page.clock.runFor(holdClearAndType);
  await expect(screen.getByText(line('whoami'))).toBeVisible();
  await expect(screen.getByText('"open to a chat"')).toBeVisible();
});

test('the active command shows a progress bar while its output holds', async ({ page }) => {
  await openPausedAbout(page);

  await expect(page.getByRole('button', { name: 'whoami' }).getByTestId(testIds.aboutTerminalProgress)).toBeVisible();
  await expect(page.getByRole('button', { name: 'stack' }).getByTestId(testIds.aboutTerminalProgress)).toHaveCount(0);
});

test('clicking a command stops the rotation and types that command from the start', async ({ page }) => {
  const screen = await openPausedAbout(page);

  await page.getByRole('button', { name: 'stack' }).click();
  await expect(page.getByTestId(testIds.aboutTerminalProgress)).toHaveCount(0);
  await expect(screen.getByText('"open to a chat"')).toBeHidden();
  await expect(screen.getByText('"typescript"')).toBeHidden();

  await page.clock.runFor(3_100);
  await expect(screen.getByText(line('stack'))).toBeVisible();
  await expect(screen.getByText('"typescript"')).toBeVisible();

  await page.clock.runFor(60_000);
  await expect(screen.getByText('"typescript"')).toBeVisible();
  await expect(screen.getByText('clear', { exact: true })).toBeHidden();
  await expect(page.getByTestId(testIds.aboutTerminalProgress)).toHaveCount(0);
});

test.describe('with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('nothing types, rotates or counts down, and a click shows the output at once', async ({ page }) => {
    const screen = await openPausedAbout(page);

    await page.clock.runFor(60_000);
    await expect(screen.getByText('"open to a chat"')).toBeVisible();
    await expect(screen.getByText('clear', { exact: true })).toBeHidden();
    await expect(page.getByTestId(testIds.aboutTerminalProgress)).toHaveCount(0);

    await page.getByRole('button', { name: 'stack' }).click();
    await expect(screen.getByText(line('stack'))).toBeVisible();
    await expect(screen.getByText('"typescript"')).toBeVisible();
  });
});

test('the rotation pauses while the terminal is offscreen', async ({ page }) => {
  const screen = await openPausedAbout(page);
  const bar = page.getByTestId(testIds.aboutTerminalProgress);

  await page.getByRole('heading', { name: /Get in touch/ }).scrollIntoViewIfNeeded();
  await expect(bar).toHaveCSS('animation-play-state', 'paused');
  await page.clock.runFor(60_000);

  await page.getByRole('heading', { level: 1 }).scrollIntoViewIfNeeded();
  await expect(bar).toHaveCSS('animation-play-state', 'running');
  await expect(screen.getByText('"open to a chat"')).toBeVisible();
  await expect(screen.getByText('clear', { exact: true })).toBeHidden();

  await page.clock.runFor(5_200);
  await expect(screen.getByText('clear', { exact: true })).toBeVisible();
});

test('the rotation pauses while the tab is hidden', async ({ page }) => {
  const screen = await openPausedAbout(page);

  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.getByTestId(testIds.aboutTerminalProgress)).toHaveCSS('animation-play-state', 'paused');
  await page.clock.runFor(60_000);
  await expect(screen.getByText('clear', { exact: true })).toBeHidden();

  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.getByTestId(testIds.aboutTerminalProgress)).toHaveCSS('animation-play-state', 'running');
  await page.clock.runFor(5_200);
  await expect(screen.getByText('clear', { exact: true })).toBeVisible();
});

test('what the terminal says also exists as real text on the page', async ({ page }) => {
  await page.goto('/about');

  await expect(
    page.getByText('Full stack engineer at Visagio Australia since 2022, based in Brisbane, QLD.', { exact: true })
  ).toBeVisible();
});

test('typing keeps an even pace inside words and pauses between phrases', async ({ page }) => {
  await openPausedAbout(page);
  const typed = page.getByTestId(testIds.aboutTerminalTyped);
  await page.getByRole('button', { name: 'stack' }).click();

  await page.clock.runFor(200);
  await expect(typed).toHaveText('curl');
  await page.clock.runFor(280);
  await expect(typed).toHaveText('curl');
  await page.clock.runFor(40);
  await expect(typed).toHaveText('curl h');

  await page.clock.runFor(120);
  await expect(typed).toHaveText('curl http');

  await page.clock.runFor(1_760);
  await expect(typed).toHaveText('curl https://localhost:443/stack.json -i |');
  await page.clock.runFor(60);
  await expect(typed).toHaveText('curl https://localhost:443/stack.json -i | j');
});

test('Enter dips the caret, drops it to the next line, then the output appears', async ({ page }) => {
  const screen = await openPausedAbout(page);
  const cursor = page.getByTestId(testIds.aboutTerminalCursor);
  await page.getByRole('button', { name: 'stack' }).click();

  await page.clock.runFor(2_480);
  await expect(cursor).toHaveCSS('opacity', '1');
  const typingY = (await cursor.boundingBox())?.y ?? 0;

  await page.clock.runFor(220);
  await expect(cursor).toHaveCSS('opacity', '0.4');
  await expect(screen.getByText('"typescript"')).toBeHidden();

  await page.clock.runFor(110);
  await expect(cursor).toHaveCSS('opacity', '1');
  expect((await cursor.boundingBox())?.y ?? 0).toBeGreaterThan(typingY);
  await expect(screen.getByText('"typescript"')).toBeHidden();

  await page.clock.runFor(280);
  await expect(screen.getByText('"typescript"')).toBeVisible();
});
