// Shared data-testid values. Components set them via data-testid={testIds.x};
// e2e tests locate elements via page.getByTestId(testIds.x) instead of
// hardcoding the string in both places.
export const testIds = {
  gantt: 'gantt',
  ganttNowMarker: 'gantt-now-marker',
  ganttOngoingBar: 'gantt-ongoing-bar',
  ganttNoteHint: 'gantt-note-hint',
  ganttYearLine: 'gantt-year-line',
  ganttBranch: 'gantt-branch',
  terminalScreen: 'terminal-screen',
  terminalProgress: 'terminal-progress',
  terminalTyped: 'terminal-typed',
  terminalCursor: 'terminal-cursor',
} as const;
