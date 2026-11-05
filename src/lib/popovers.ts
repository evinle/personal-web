// The browser owns whether a popover is open (the native `popover` attribute), so this is only the
// config the page renders from: which trigger opens which popover, and what a Project's card says.

export const projectPopoverId = (projectId: string) => `project-detail-${projectId}`;
export const projectTechnologiesPopoverId = (projectId: string) => `project-technologies-${projectId}`;
export const technologyPopoverId = (technologyId: string) => `technology-note-${technologyId}`;

/** Anchored to a bar, a popover shrinks as the bar scrolls towards an edge. Below this it's no use to read. */
export const MIN_READABLE_HEIGHT = 120;

interface PopoverBox {
  top: number;
  bottom: number;
  height: number;
}

/**
 * Whether an open popover should close: it has left the space between the nav and the bottom of the screen,
 * or shrunk too small to read. One that opened small, like a short Note, isn't shrinking and stays open.
 * A closed popover has no box, so it never closes.
 */
export function shouldClosePopover(view: { top: number; bottom: number }, popover: PopoverBox, openedHeight: number) {
  if (popover.height === 0) return false;
  const hasLeftView = popover.top < view.top || popover.bottom > view.bottom;
  const hasShrunkTooSmall = popover.height < MIN_READABLE_HEIGHT && popover.height < openedHeight;
  return hasLeftView || hasShrunkTooSmall;
}

interface Technology {
  label: string;
  icon?: string;
  note?: string;
}

/** A Technology's chip. Only a Technology with a Note opens a popover, so nobody is offered an empty one. */
export function technologyChip(id: string, { label, icon, note }: Technology) {
  return { label, icon, popoverTarget: note ? technologyPopoverId(id) : undefined };
}

/** One popover per Technology with a Note, however many chips open it, so a Note is only rendered once. */
export function technologyNotes(technologies: ReadonlyArray<{ id: string; data: Technology }>) {
  return technologies.flatMap(({ id, data: { label, note } }) =>
    note ? [{ id: technologyPopoverId(id), title: label, note }] : [],
  );
}

/** What a Project row says on a small screen, in place of its chips. */
export function technologyCountLabel(count: number) {
  return `${count} ${count === 1 ? 'technology' : 'technologies'}`;
}

interface ProjectDetail {
  problem: string;
  fix: string;
  result: string;
}

/** A Project card's sections, in reading order. Before to after reads pink to mint. */
export function projectDetailSections({ problem, fix, result }: ProjectDetail) {
  return [
    { label: 'PROBLEM', tone: 'el-pink', text: problem },
    { label: 'FIX', tone: 'el-mint', text: fix },
    { label: 'RESULT', tone: 'el-mint', text: result },
  ];
}
