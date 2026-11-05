/** A date as a count of months, so dates can be placed on a linear axis. Days become fractions of a month. */
export function ym(date: string) {
  const [y, m = '1', d = '1'] = date.split('-');
  return Number(y) * 12 + (Number(m) - 1) + (Number(d) - 1) / 30;
}

/** How far along the axis a date falls, as a percentage held to the axis's ends. */
export function positionOnAxis(date: string, axisStart: number, span: number) {
  return Math.max(0, Math.min(100, ((ym(date) - axisStart) / span) * 100));
}

export interface GanttYear {
  year: number;
  left: number;
  /** Only on the first label, which marks where the first Project starts part-way through that year. */
  month?: string;
}

/**
 * The timeline's axis: one month of margin before the first Project, matching the month after the
 * latest date at the other end. `ends` are the dates each Project ends, today for an ongoing one.
 */
export function buildGanttAxis(firstStart: string, ends: readonly string[], today: string) {
  const start = ym(firstStart) - 1;
  const end = Math.max(ym(today), ...ends.map(ym)) + 1;
  const span = end - start;
  const pct = (date: string) => positionOnAxis(date, start, span);

  const firstYear = Number(firstStart.slice(0, 4));
  const month = new Date(`${firstStart}-01T00:00:00Z`).toLocaleString('en', { month: 'short', timeZone: 'UTC' });
  const yearLines: GanttYear[] = [];
  for (let year = firstYear + 1; year * 12 < end; year++) {
    yearLines.push({ year, left: ((year * 12 - start) / span) * 100 });
  }

  return {
    start,
    span,
    pct,
    // The first label gets no line of its own, which would double up with the label column's divider.
    years: [{ year: firstYear, left: pct(firstStart), month }, ...yearLines],
    yearLines,
  };
}
