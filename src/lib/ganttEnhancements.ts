import { positionOnAxis } from './ganttAxis';

/** The page is built ahead of time, so "now" and ongoing bars are moved to the visitor's actual date. */
export function correctGanttToLiveDate(root: ParentNode, today: string) {
  root.querySelectorAll<HTMLElement>('.el-gantt[data-axis-start]').forEach((gantt) => {
    const pct = String(positionOnAxis(today, Number(gantt.dataset.axisStart), Number(gantt.dataset.axisSpan)));
    gantt.querySelectorAll<HTMLElement>('.el-now').forEach((el) => el.style.setProperty('--n', pct));
    gantt.querySelectorAll<HTMLElement>('[data-end="now"]').forEach((el) => el.style.setProperty('--e', pct));
  });
}
