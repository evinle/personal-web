import { positionOnAxis } from './ganttAxis';
import { nextOpenNote, noteShift, type NoteEvent } from './ganttNotes';

/** The page is built ahead of time, so "now" and ongoing bars are moved to the visitor's actual date. */
export function correctGanttToLiveDate(root: ParentNode, today: string) {
  root.querySelectorAll<HTMLElement>('.el-gantt[data-axis-start]').forEach((gantt) => {
    const pct = String(positionOnAxis(today, Number(gantt.dataset.axisStart), Number(gantt.dataset.axisSpan)));
    gantt.querySelectorAll<HTMLElement>('.el-now').forEach((el) => el.style.setProperty('--n', pct));
    gantt.querySelectorAll<HTMLElement>('[data-end="now"]').forEach((el) => el.style.setProperty('--e', pct));
  });
}

interface CollapsedQuery {
  readonly matches: boolean;
  addEventListener(type: 'change', listener: () => void): void;
}

// Nudges the note rather than scrolling, so the chart doesn't move under the visitor's finger.
function placeInChart(note: HTMLElement) {
  const chart = note.closest('.el-gantt-scroll');
  if (!chart) return;
  note.style.setProperty('--shift', '0px');
  const shift = noteShift(chart.getBoundingClientRect(), note.getBoundingClientRect());
  note.style.setProperty('--shift', `${shift}px`);
  note.scrollIntoView({ block: 'nearest' });
}

function showNote(doc: Document, id: string, isOpen: boolean) {
  const note = doc.getElementById(id);
  doc.querySelector(`.el-bar[aria-controls="${id}"]`)?.setAttribute('aria-expanded', String(isOpen && note !== null));
  note?.classList.toggle('is-open', isOpen);
  if (isOpen && note) placeInChart(note);
}

/** Applies `nextOpenNote` to the page. While `collapsed` matches, notes are hidden until their bar is tapped. */
export function enableGanttNoteToggle(doc: Document, collapsed: CollapsedQuery) {
  let open: string | null = null;

  function dispatch(event: NoteEvent) {
    const next = nextOpenNote(open, event);
    if (open) showNote(doc, open, false);
    if (next) showNote(doc, next, true);
    open = next;
  }

  doc.addEventListener('click', (event) => {
    if (!collapsed.matches || !(event.target instanceof Element)) return;
    const note = event.target.closest('.el-bar')?.getAttribute('aria-controls');
    dispatch(note ? { type: 'tapBar', note } : { type: 'tapElsewhere' });
  });

  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') dispatch({ type: 'dismiss' });
  });

  collapsed.addEventListener('change', () => dispatch({ type: 'dismiss' }));
}
