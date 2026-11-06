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

// From most to least, coloured from mint down to muted.
const PROFICIENCY_TONES = { Strong: 'el-mint', Comfortable: 'el-blue', Familiar: 'el-muted' } as const;
export const PROFICIENCIES = ['Strong', 'Comfortable', 'Familiar'] as const;
type Proficiency = (typeof PROFICIENCIES)[number];

interface Technology {
  label: string;
  icon?: string;
  note?: string;
  proficiency?: Proficiency;
}

/** A Technology's chip. Only a Technology with a Note opens a popover, so nobody is offered an empty one. */
export function technologyChip(id: string, { label, icon, note }: Technology) {
  return { label, icon, popoverTarget: note ? technologyPopoverId(id) : undefined };
}

/**
 * One popover per Technology with a Note, however many chips open it, so a Note is only rendered once.
 * A Technology on no Project has no count, rather than "0 projects".
 */
export function technologyNotes(technologies: ReadonlyArray<{ id: string; data: Technology }>, projects: readonly CountedProject[]) {
  return technologies.flatMap(({ id, data: { label, note, proficiency } }) => {
    if (!note) return [];
    const count = projectCount(id, projects);
    return [{
      id: technologyPopoverId(id),
      title: label,
      note,
      proficiency,
      tone: proficiency && PROFICIENCY_TONES[proficiency],
      projects: count ? countLabel(count, 'project', 'projects') : undefined,
    }];
  });
}

interface CountedProject {
  technologies: ReadonlyArray<{ id: string }>;
  alsoUsed?: ReadonlyArray<{ id: string }>;
}

/** How many Projects used a Technology, whether it's on their chips or only listed as also used. */
export function projectCount(technologyId: string, projects: readonly CountedProject[]) {
  return projects.filter(({ technologies, alsoUsed = [] }) =>
    [...technologies, ...alsoUsed].some(({ id }) => id === technologyId),
  ).length;
}

export function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
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
