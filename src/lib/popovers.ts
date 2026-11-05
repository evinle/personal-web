// The browser owns whether a popover is open (the native `popover` attribute), so this is only the
// config the page renders from: which trigger opens which popover, and what a Project's card says.

export const projectPopoverId = (projectId: string) => `project-detail-${projectId}`;
export const technologyPopoverId = (technologyId: string) => `technology-note-${technologyId}`;

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
