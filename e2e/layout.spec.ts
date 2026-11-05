import { test, expect, type Locator, type Page } from '@playwright/test';
import { testIds } from '../src/testIds';

// Layout checks: what only a real browser's layout engine can answer. Behaviour and state belong in
// unit tests (see docs/adr/0001). One page is resized in a loop, because new contexts are the slow part.

const PROJECTS = [
  { name: 'simulation-manager-p', note: 'JSON Schema UI, 30+ model types' },
  { name: 'production-scheduling', note: '5s to ~1s, FE lead, team of 4' },
  { name: 'simulation-manager-i', note: 'Gantt logic, schema to Zod to client' },
  { name: 'roster-reconciliation', note: '7-10s to ~500ms, coverage 8% to 40%' },
  { name: 'devops-support', note: '~7s to ~2s saves, 5 production tools' },
];
const YEARS = [2022, 2023, 2024, 2025, 2026];

async function openAt(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  if (!page.url().endsWith('/about')) await page.goto('/about');
}

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Element has no box');
  return { left: box.x, right: box.x + box.width, top: box.y, bottom: box.y + box.height };
}

const barOf = (page: Page, name: string) => page.getByRole('button', { name: `${name}: show details` });
const noteOf = (page: Page, note: string) => page.getByText(note, { exact: true });
const labelOf = (page: Page, name: string) => page.getByText(name, { exact: true }).locator('..');
const axisOf = (page: Page) => page.getByText('PROJECT', { exact: true }).locator('../..');
const yearLines = (page: Page, year: number) =>
  page.getByTestId(testIds.aboutGanttYearLine).and(page.locator(`[data-year="${year}"]`));

async function expectAbove(note: Locator, bar: Locator) {
  const [noteBox, barBox] = [await boxOf(note), await boxOf(bar)];
  expect(noteBox.bottom).toBeLessThanOrEqual(barBox.top);
}

function coversItsCorners(el: Element) {
  const { left, right, top, bottom } = el.getBoundingClientRect();
  const corners = [[left + 1, top + 1], [right - 1, top + 1], [left + 1, bottom - 1], [right - 1, bottom - 1]];
  return corners.every(([x, y]) => document.elementFromPoint(x, y) === el);
}

test('the nav fits at every width, without the page scrolling sideways', async ({ page }) => {
  for (const width of [1280, 600, 375, 320]) {
    await openAt(page, width);
    const nav = page.getByRole('navigation', { name: 'Main' });
    const theme = await boxOf(nav.getByRole('button', { name: 'Switch theme' }));

    // 16px is the smallest page gutter; past it the nav row clips the button.
    expect(theme.right).toBeLessThanOrEqual(width - 16);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
    await expect(nav.getByRole('link', { name: /about$/ })).toBeInViewport({ ratio: 1 });
  }
});

test('with room to show them, every note sits above its bar and inside the chart', async ({ page }) => {
  for (const width of [1280, 800, 600]) {
    await openAt(page, width);
    for (const { name, note } of PROJECTS) {
      const bar = barOf(page, name);
      await expectAbove(noteOf(page, note), bar);
      const [noteBox, track] = [await boxOf(noteOf(page, note)), await boxOf(bar.locator('..'))];
      expect(noteBox.left).toBeGreaterThanOrEqual(track.left);
      expect(noteBox.right).toBeLessThanOrEqual(track.right);
    }
    await expect(page.getByTestId(testIds.aboutGanttNoteHint).first()).toBeHidden();
  }
});

async function expectOpensOnTop(page: Page, { name, note }: (typeof PROJECTS)[number], width: number) {
  const bar = barOf(page, name);
  await bar.getByTestId(testIds.aboutGanttNoteHint).click();
  await expectAbove(noteOf(page, note), bar);

  const box = await boxOf(noteOf(page, note));
  expect(box.left).toBeGreaterThanOrEqual(0);
  expect(box.right).toBeLessThanOrEqual(width);
  expect(await noteOf(page, note).evaluate(coversItsCorners)).toBe(true);

  await page.keyboard.press('Escape');
}

test('on a phone, an open note is above its bar, in view and on top of everything', async ({ page }) => {
  for (const width of [375, 320]) {
    await openAt(page, width);
    for (const project of PROJECTS) await expectOpensOnTop(page, project, width);
  }
});

test.describe('in dark mode', () => {
  test.use({ colorScheme: 'dark' });

  test('on a phone, an open note covers the label column in one line, stands out, and leaves the chart still', async ({ page }) => {
    await openAt(page, 375);
    const { name, note } = PROJECTS[2];
    const scroller = page.getByTestId(testIds.aboutGantt).locator('..');
    await scroller.evaluate((el) => { el.scrollLeft = 0; });

    await barOf(page, name).dispatchEvent('click');

    const noteEl = noteOf(page, note);
    const [noteBox, label] = [await boxOf(noteEl), await boxOf(labelOf(page, name))];
    expect(noteBox.left).toBeLessThan(label.right);
    expect(noteBox.bottom - noteBox.top).toBeLessThan(32);
    expect(await scroller.evaluate((el) => el.scrollLeft)).toBe(0);
    await expect(noteEl).toHaveCSS('color', 'rgb(228, 240, 251)');
    await expect(noteEl).toHaveCSS('background-color', 'rgb(27, 30, 40)');
    await expect(noteEl).toHaveCSS('border-top-color', 'rgb(93, 228, 199)');
  });
});

test('each year label sits just right of its own line, the same in every row', async ({ page }) => {
  await openAt(page, 1280);
  await expect(axisOf(page).getByText('Jun 2022', { exact: true })).toBeVisible();

  for (const year of YEARS.slice(1)) {
    const lines = await yearLines(page, year).all();
    expect(lines).toHaveLength(PROJECTS.length + 2);

    const [label, line] = [await boxOf(axisOf(page).getByText(String(year))), await boxOf(lines[0])];
    expect(label.left - line.left).toBeGreaterThan(2);
    expect(label.left - line.left).toBeLessThan(10);
    for (const other of lines) expect((await boxOf(other)).left).toBeCloseTo(line.left, 0);
  }
});

test('the first label lines up with the first bar, and drops the month on a phone', async ({ page }) => {
  await openAt(page, 1280);
  const first = await boxOf(axisOf(page).getByText('2022'));
  expect(first.left).toBeCloseTo((await boxOf(barOf(page, PROJECTS[0].name))).left, 0);

  await openAt(page, 375);
  await expect(axisOf(page).getByText('2022').getByText('Jun')).toBeHidden();
});

test('no axis label overlaps the next, and "now" sits left of its line', async ({ page }) => {
  for (const width of [1280, 900, 899, 600, 599, 375, 320]) {
    await openAt(page, width);
    const marker = page.getByTestId(testIds.aboutGanttNowMarker);
    const now = marker.getByText('now', { exact: true });

    const boxes = [];
    for (const year of YEARS) boxes.push(await boxOf(axisOf(page).getByText(String(year))));
    boxes.push(await boxOf(now));
    for (let i = 1; i < boxes.length; i++) expect(boxes[i].left).toBeGreaterThan(boxes[i - 1].right);

    expect((await boxOf(now)).right).toBeLessThanOrEqual((await boxOf(marker)).left);
  }
});

async function expectBranchAligned(page: Page, name: string) {
  const label = labelOf(page, name);
  const [branch, nameBox, chips, labelBox] = await Promise.all([
    boxOf(label.getByTestId(testIds.aboutGanttBranch)),
    boxOf(page.getByText(name, { exact: true })),
    boxOf(label.locator('.el-chips')),
    boxOf(label),
  ]);
  expect(branch.left).toBeGreaterThanOrEqual(labelBox.left);
  expect(branch.right).toBeLessThanOrEqual(nameBox.left);
  expect(branch.top).toBeCloseTo(nameBox.top, 0);
  expect(chips.left).toBeCloseTo(nameBox.left, 0);
  expect(chips.top).toBeGreaterThanOrEqual(nameBox.bottom);
  // Each name has at most one hyphen to break at; a third line means a word was split.
  expect(nameBox.bottom - nameBox.top).toBeLessThanOrEqual(40);
  for (const chip of await label.locator('.el-chips > *').all()) {
    expect((await boxOf(chip)).right).toBeLessThanOrEqual(labelBox.right - 4);
  }
}

test('branches sit left of the name, with the name and chips aligned and fitting the column', async ({ page }) => {
  for (const width of [1280, 800, 375, 320]) {
    await openAt(page, width);
    for (const { name } of PROJECTS) await expectBranchAligned(page, name);
  }
  const branches = await page.getByTestId(testIds.aboutGanttBranch).allTextContents();
  expect(branches).toEqual(['├─', '├─', '├─', '├─', '└─']);
});

/** Runs in the browser, so it can't use anything from this file's scope. */
function measureYamlLists(lists: Element[], longestWhole: number) {
  const values = lists.flatMap((list) => [...list.querySelectorAll('.js-s')]);
  return {
    splitItems: values
      .filter((value) => (value.textContent ?? '').length <= longestWhole && value.getClientRects().length > 1)
      .map((value) => value.textContent),
    overflowing: lists.filter((list) => list.scrollWidth > list.clientWidth).length,
    rows: lists.map((list) => list.getBoundingClientRect().height / parseFloat(getComputedStyle(list).lineHeight)),
  };
}

test('YAML lists wrap between items and stay inside their column', async ({ page }) => {
  // An item only splits when it's longer than a whole line of values, which narrows with the screen.
  for (const [width, longestWhole] of [[1280, 40], [800, 40], [375, 25], [320, 20]]) {
    await openAt(page, width);
    const lists = page.getByTestId(testIds.aboutTerminalScreen).locator('.yml-flow');
    const layout = await lists.evaluateAll(measureYamlLists, longestWhole);

    expect(layout.splitItems).toEqual([]);
    expect(layout.overflowing).toBe(0);
    if (width === 1280) expect(Math.max(...layout.rows)).toBeLessThanOrEqual(2);
  }
});

test('on a wide screen the terminal is wider than the prose', async ({ page }) => {
  await openAt(page, 1280);
  const [prose, terminal] = [await boxOf(page.locator('.el-intro-prose')), await boxOf(page.locator('.el-term'))];
  expect(terminal.right - terminal.left).toBeGreaterThan(prose.right - prose.left);
});

test.describe('with reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('the panel keeps its height through every output, with the editor filling it', async ({ page }) => {
    await openAt(page, 1280);
    await expect(page.getByRole('button', { name: 'whoami' })).toBeEnabled();
    const screen = page.getByTestId(testIds.aboutTerminalScreen);
    const height = (await screen.boundingBox())?.height;

    for (const name of ['stack', 'how-i-work', 'qualifications', 'status', 'whoami']) {
      await page.getByRole('button', { name, exact: true }).click();
      expect((await screen.boundingBox())?.height).toBe(height);
    }

    await page.getByRole('button', { name: 'how-i-work' }).click();
    const [status, box] = [await boxOf(screen.getByText('NORMAL', { exact: true })), await boxOf(screen)];
    expect(box.bottom - status.bottom).toBeLessThan(64);
    expect(await screen.evaluate((el) => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(0);
  });
});

test('the pause and resume button is big enough to tap, and swapping icons does not move the page', async ({ page }) => {
  await openAt(page, 320);
  const pause = page.getByRole('button', { name: 'Pause rotation' });
  await expect(pause).toBeEnabled();
  const panelHeight = (await page.locator('.el-term').boundingBox())?.height;

  const box = await boxOf(pause);
  expect(box.right - box.left).toBeGreaterThanOrEqual(24);
  expect(box.bottom - box.top).toBeGreaterThanOrEqual(22);

  await pause.click();
  expect((await page.locator('.el-term').boundingBox())?.height).toBe(panelHeight);
});
