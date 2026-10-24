// Shared data-testid values. Components set them via data-testid={testIds.x};
// e2e tests locate elements via page.getByTestId(testIds.x) instead of
// hardcoding the string in both places.
export const testIds = {
  aboutGantt: 'about-gantt',
  aboutGanttNowMarker: 'about-gantt-now-marker',
  aboutGanttOngoingBar: 'about-gantt-ongoing-bar',
} as const;
