import { test, expect, type Locator, type Page } from '@playwright/test';
import { testIds } from '../src/testIds';

const PROJECTS = [
  { name: 'simulation-manager-p', note: 'JSON Schema UI, 30+ model types' },
  { name: 'production-scheduling', note: '5s to ~1s, FE lead, team of 4' },
  { name: 'simulation-manager-i', note: 'Gantt logic, schema to Zod to client' },
  { name: 'roster-reconciliation', note: '7-10s to ~500ms, coverage 8% to 40%' },
  { name: 'devops-support', note: '~7s to ~2s saves, 5 production tools' },
];

function barOf(page: Page, name: string) {
  return page.getByRole('button', { name: `${name}: show details` });
}

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Element has no box');
  return { left: box.x, right: box.x + box.width, top: box.y, bottom: box.y + box.height };
}

async function expectAbove(note: Locator, bar: Locator) {
  const [noteBox, barBox] = [await boxOf(note), await boxOf(bar)];
  expect(noteBox.bottom).toBeLessThanOrEqual(barBox.top);
}

async function expectOnTopAtEveryCorner(note: Locator) {
  const allOnTop = await note.evaluate((el) => {
    const { left, right, top, bottom } = el.getBoundingClientRect();
    const corners = [[left + 1, top + 1], [right - 1, top + 1], [left + 1, bottom - 1], [right - 1, bottom - 1]];
    return corners.every(([x, y]) => document.elementFromPoint(x, y) === el);
  });
  expect(allOnTop).toBe(true);
}

async function expectInViewAndOnTop(note: Locator, width: number) {
  const box = await boxOf(note);
  expect(box.left).toBeGreaterThanOrEqual(0);
  expect(box.right).toBeLessThanOrEqual(width);
  await expectOnTopAtEveryCorner(note);
}

async function expectOpensInClearView(page: Page, { name, note }: (typeof PROJECTS)[number], width: number) {
  const bar = barOf(page, name);
  const noteEl = page.getByText(note, { exact: true });
  const hint = bar.getByTestId(testIds.aboutGanttNoteHint);
  await expect(noteEl).toBeHidden();
  await expect(hint).toHaveText('[+]');

  await hint.click();
  await expect(noteEl).toBeVisible();
  await expect(hint).toBeHidden();
  await expect(bar).toHaveAttribute('aria-expanded', 'true');
  await expectAbove(noteEl, bar);

  await expectInViewAndOnTop(noteEl, width);

  await page.keyboard.press('Escape');
  await expect(noteEl).toBeHidden();
}

for (const width of [1280, 800, 600]) {
  test.describe(`at ${width}px wide`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('every note sits above its bar and inside the chart', async ({ page }) => {
      await page.goto('/about');

      for (const { name, note } of PROJECTS) {
        const bar = barOf(page, name);
        const noteEl = page.getByText(note, { exact: true });
        await expect(noteEl).toBeVisible();
        await expectAbove(noteEl, bar);

        const [noteBox, track] = [await boxOf(noteEl), await boxOf(bar.locator('..'))];
        expect(noteBox.left).toBeGreaterThanOrEqual(track.left);
        expect(noteBox.right).toBeLessThanOrEqual(track.right);
      }
      await expect(page.getByTestId(testIds.aboutGanttNoteHint).first()).toBeHidden();
    });
  });
}

for (const width of [375, 320]) {
  test.describe(`at ${width}px wide`, () => {
    test.use({ viewport: { width, height: 800 } });

    test('each bar shows it can be opened, and opens its note above the bar in clear view', async ({ page }) => {
      await page.goto('/about');
      await expect(page.getByTestId(testIds.aboutGanttNoteHint)).toHaveCount(PROJECTS.length);

      for (const project of PROJECTS) {
        await expectOpensInClearView(page, project, width);
      }
    });
  });
}

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test('only one note is open at a time, and tapping elsewhere closes it', async ({ page }) => {
    await page.goto('/about');
    const [first, second] = PROJECTS;

    await barOf(page, first.name).getByTestId(testIds.aboutGanttNoteHint).click();
    await expect(page.getByText(first.note, { exact: true })).toBeVisible();

    await barOf(page, second.name).getByTestId(testIds.aboutGanttNoteHint).click();
    await expect(page.getByText(second.note, { exact: true })).toBeVisible();
    await expect(page.getByText(first.note, { exact: true })).toBeHidden();

    await page.getByRole('heading', { level: 1 }).click();
    await expect(page.getByText(second.note, { exact: true })).toBeHidden();
    await expect(barOf(page, second.name)).toHaveAttribute('aria-expanded', 'false');
  });

  test('tapping an open bar closes its note', async ({ page }) => {
    await page.goto('/about');
    const [{ name, note }] = PROJECTS;

    await barOf(page, name).getByTestId(testIds.aboutGanttNoteHint).click();
    await expect(page.getByText(note, { exact: true })).toBeVisible();

    await barOf(page, name).click();
    await expect(page.getByText(note, { exact: true })).toBeHidden();
  });

  test('an open note covers the label column rather than wrapping beside it, without moving the chart', async ({ page }) => {
    await page.goto('/about');
    const { name, note } = PROJECTS[2];
    const noteEl = page.getByText(note, { exact: true });
    const scroller = page.getByTestId(testIds.aboutGantt).locator('..');

    await scroller.evaluate((el) => { el.scrollLeft = 0; });
    await barOf(page, name).dispatchEvent('click');
    await expect(noteEl).toBeVisible();

    const [noteBox, label] = [await boxOf(noteEl), await boxOf(page.getByText(name, { exact: true }).locator('..'))];
    expect(noteBox.left).toBeLessThan(label.right);
    expect(noteBox.bottom - noteBox.top).toBeLessThan(32);
    expect(await scroller.evaluate((el) => el.scrollLeft)).toBe(0);
    await expectOnTopAtEveryCorner(noteEl);
  });

  test.describe('in dark mode', () => {
    test.use({ colorScheme: 'dark' });

    test('an open note stands out from the chart', async ({ page }) => {
      await page.goto('/about');
      const noteEl = page.getByText(PROJECTS[0].note, { exact: true });

      await barOf(page, PROJECTS[0].name).getByTestId(testIds.aboutGanttNoteHint).click();

      await expect(noteEl).toHaveCSS('color', 'rgb(228, 240, 251)');
      await expect(noteEl).toHaveCSS('background-color', 'rgb(27, 30, 40)');
      await expect(noteEl).toHaveCSS('border-top-color', 'rgb(93, 228, 199)');
    });
  });
});

const YEARS = [2022, 2023, 2024, 2025, 2026];

function yearLines(page: Page, year: number) {
  return page.getByTestId(testIds.aboutGanttYearLine).and(page.locator(`[data-year="${year}"]`));
}

test('each year label sits just right of its own dividing line, in every row', async ({ page }) => {
  await page.goto('/about');
  const axis = page.getByText('PROJECT', { exact: true }).locator('../..');

  for (const year of YEARS.slice(1)) {
    const lines = await yearLines(page, year).all();
    expect(lines).toHaveLength(PROJECTS.length + 2);

    const label = await boxOf(axis.getByText(String(year)));
    const line = await boxOf(lines[0]);
    expect(label.left - line.left).toBeGreaterThan(2);
    expect(label.left - line.left).toBeLessThan(10);

    for (const other of lines) {
      expect((await boxOf(other)).left).toBeCloseTo(line.left, 0);
    }
  }
});

test('the timeline starts a month before the first Project, marked by its label and not a second line', async ({ page }) => {
  await page.goto('/about');

  const bar = barOf(page, PROJECTS[0].name);
  const [barBox, track] = [await boxOf(bar), await boxOf(bar.locator('..'))];
  const [line2023, line2024] = [await boxOf(yearLines(page, 2023).first()), await boxOf(yearLines(page, 2024).first())];
  const month = (line2024.left - line2023.left) / 12;

  await expect(yearLines(page, 2022)).toHaveCount(0);
  expect(barBox.left - track.left).toBeCloseTo(month, 0);
  expect(line2023.left - barBox.left).toBeCloseTo(month * 7, 0);
  expect((await boxOf(axisOf(page).getByText('2022'))).left).toBeCloseTo(barBox.left, 0);
});

function axisOf(page: Page) {
  return page.getByText('PROJECT', { exact: true }).locator('../..');
}

test.describe('on a wide screen', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('the first label names the month, because that year is only part-way through', async ({ page }) => {
    await page.goto('/about');
    await expect(axisOf(page).getByText('Jun 2022', { exact: true })).toBeVisible();
    await expect(axisOf(page).getByText('2023', { exact: true })).toBeVisible();
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test('the first label drops the month to fit', async ({ page }) => {
    await page.goto('/about');
    const label = axisOf(page).getByText('2022');
    await expect(label).toBeVisible();
    await expect(label.getByText('Jun')).toBeHidden();
  });
});

for (const width of [1280, 900, 899, 800, 600, 599, 375, 320]) {
  test.describe(`axis labels at ${width}px wide`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('no label overlaps the next, and "now" sits left of its line, inside the chart', async ({ page }) => {
      await page.goto('/about');
      const axis = axisOf(page);
      const nowMarker = page.getByTestId(testIds.aboutGanttNowMarker);
      const nowLabel = nowMarker.getByText('now', { exact: true });

      const boxes = [];
      for (const year of YEARS) boxes.push(await boxOf(axis.getByText(String(year))));
      boxes.push(await boxOf(nowLabel));
      for (let i = 1; i < boxes.length; i++) {
        expect(boxes[i].left).toBeGreaterThan(boxes[i - 1].right);
      }

      const [now, line, track] = [await boxOf(nowLabel), await boxOf(nowMarker), await boxOf(nowMarker.locator('..'))];
      expect(now.right).toBeLessThanOrEqual(line.left);
      expect(now.right).toBeLessThanOrEqual(track.right);
    });
  });
}
