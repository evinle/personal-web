export type NoteEvent = { type: 'tapBar'; note: string } | { type: 'tapElsewhere' } | { type: 'dismiss' };

/** Which note is open after an event, or null for none. One note is open at a time. */
export function nextOpenNote(open: string | null, event: NoteEvent): string | null {
  if (event.type !== 'tapBar') return null;
  return event.note === open ? null : event.note;
}

interface Edges {
  left: number;
  right: number;
}

/** How far to nudge a note sideways to keep it inside the chart, with a margin. */
export function noteShift(chart: Edges, note: Edges, margin = 8) {
  const overLeft = Math.max(0, chart.left + margin - note.left);
  const overRight = Math.max(0, note.right - (chart.right - margin));
  return overLeft - overRight;
}
