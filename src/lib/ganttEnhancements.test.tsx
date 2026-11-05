import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { correctGanttToLiveDate } from './ganttEnhancements';

// Only the wrapper's wiring. Positions are covered in ganttAxis.test.ts, and that this works on the
// real page's markup in e2e/gantt.spec.ts.

test('the now line and ongoing bars get the live position, and finished bars do not', () => {
  const { container } = render(
    <div className="el-gantt" data-axis-start="24000" data-axis-span="100">
      <div className="el-now" />
      <div className="el-bar" data-end="now" />
      <div className="el-bar" id="finished" />
    </div>,
  );

  correctGanttToLiveDate(container, '2004-03');

  const valueOf = (selector: string, name: string) =>
    container.querySelector<HTMLElement>(selector)?.style.getPropertyValue(name);
  expect(valueOf('.el-now', '--n')).toBe('50');
  expect(valueOf('[data-end="now"]', '--e')).toBe('50');
  expect(valueOf('#finished', '--e')).toBe('');
});
