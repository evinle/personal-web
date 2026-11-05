import { act, fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { buildTerminalCommands } from '../../lib/terminalCommands';
import { setTabVisibility, stubIntersectionObserver, stubMatchMedia, stubScrollIntoView } from '../../test/browserStubs';
import { testIds } from '../../testIds';
import Terminal from './Terminal';

// Only the wrapper's wiring. What each state shows is covered, without a DOM, in terminalView.test.ts.

const commands = buildTerminalCommands({
  whoami: { name: 'Evin Le', role: 'engineer', at: 'Acme', since: 2022, based: 'Brisbane', status: 'open to a chat' },
  qualifications: { studied: { degree: 'BSc', at: 'Curtin', grade: 'HD' }, certs: [{ name: 'AZ-900' }] },
  stack: [{ name: 'languages', technologies: ['typescript', 'sql'] }],
  principles: ['measure first'],
});

// 'cat stack.yaml': 14 characters, the pause after `cat`, then Enter and the beat before the output.
const TYPE_STACK_MS = 14 * 40 + 260 + 220 + 110 + 280;

function mount({ reducedMotion = false } = {}) {
  vi.useFakeTimers();
  stubMatchMedia({ '(prefers-reduced-motion: reduce)': reducedMotion });
  const observer = stubIntersectionObserver();
  const scrollIntoView = stubScrollIntoView();
  render(
    <>
      <div className="el-intro-prose">
        <a href="#stack">React</a>
        <a href="#elsewhere">other</a>
      </div>
      <Terminal commands={commands} />
    </>,
  );
  return { observer, scrollIntoView };
}

function run(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function activeCell() {
  const cell = screen.getByTestId(testIds.aboutTerminalScreen).querySelector('.el-term-cell:not(.is-inactive)');
  if (!cell) throw new Error('No active cell');
  return cell;
}

const button = (name: string) => screen.getByRole('button', { name });
const progressBar = () => screen.getByTestId(testIds.aboutTerminalProgress);
const phrase = (name: string) => screen.getByRole('link', { name });

test('it shows the first command, with its screen hidden from assistive technology and its buttons not', () => {
  mount();
  expect(activeCell()).toHaveTextContent('$ whoami');
  expect(activeCell()).toHaveTextContent('evinle');
  expect(screen.getByTestId(testIds.aboutTerminalScreen)).toHaveAttribute('aria-hidden', 'true');
  expect(button('stack')).toBeEnabled();
});

test('every other output stays in the screen, invisible, so the panel is as tall as the longest', () => {
  mount();
  const hidden = screen.getByTestId(testIds.aboutTerminalScreen).querySelectorAll('.el-term-cell.is-inactive');
  expect(hidden).toHaveLength(commands.length - 1);
});

test('clicking a command runs it, and the timeline re-renders the screen', () => {
  mount();

  fireEvent.click(button('stack'));
  expect(button('stack')).toHaveAttribute('aria-pressed', 'true');
  expect(activeCell().querySelector('.is-unrevealed')).toBeInTheDocument();

  run(TYPE_STACK_MS);
  expect(activeCell()).toHaveTextContent('$ cat stack.yaml');
  expect(activeCell().querySelector('.is-unrevealed')).not.toBeInTheDocument();
  expect(activeCell().querySelector('.yml-flow')?.children).toHaveLength(2);
});

test('the editor renders in place of the shell, with a hidden copy holding its height until then', () => {
  mount();
  const hiddenEditor = () => screen.getByTestId(testIds.aboutTerminalScreen).querySelector('.el-vim.is-inactive');

  fireEvent.click(button('how-i-work'));
  expect(hiddenEditor()).toBeInTheDocument();

  run(18 * 40 + 260 + 220 + 110 + 280);
  expect(hiddenEditor()).not.toBeInTheDocument();
  expect(activeCell()).toHaveTextContent('NORMAL');
  expect(activeCell()).toHaveTextContent('"how-i-work.md" 3L');
});

test('the toggle is an icon that pauses, then resumes, the timeline', () => {
  mount();
  const iconOf = (element: HTMLElement) => element.querySelector('svg')?.innerHTML;
  const pauseIcon = iconOf(button('Pause rotation'));

  expect(button('Pause rotation')).toHaveTextContent('');
  expect(button('Pause rotation')).toHaveAttribute('title', 'Pause rotation');

  fireEvent.click(button('Pause rotation'));
  expect(iconOf(button('Resume rotation'))).not.toBe(pauseIcon);
  expect(screen.queryByTestId(testIds.aboutTerminalProgress)).not.toBeInTheDocument();

  fireEvent.click(button('Resume rotation'));
  expect(progressBar()).toBeInTheDocument();
});

test('an intro phrase runs its command instead of following the link, and brings the panel into view', () => {
  const { scrollIntoView } = mount();

  expect(fireEvent.click(phrase('React'))).toBe(false);

  expect(button('stack')).toHaveAttribute('aria-pressed', 'true');
  expect(phrase('React')).toHaveClass('is-running');
  expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
  expect(screen.getByRole('status')).toHaveTextContent('Terminal now shows cat stack.yaml');
});

test('a link with no matching command is left alone', () => {
  const { scrollIntoView } = mount();

  expect(fireEvent.click(phrase('other'))).toBe(true);
  expect(scrollIntoView).not.toHaveBeenCalled();
});

test('the timeline stops while the panel is offscreen', () => {
  const { observer } = mount();

  act(() => observer.setOnscreen(false));
  expect(progressBar()).toHaveClass('is-paused');
  run(60_000);
  expect(activeCell()).not.toHaveTextContent('clear');

  act(() => observer.setOnscreen(true));
  expect(progressBar()).not.toHaveClass('is-paused');
  run(5_200);
  expect(activeCell()).toHaveTextContent('clear');
});

test('the timeline stops while the tab is hidden', () => {
  mount();

  act(() => setTabVisibility('hidden'));
  expect(progressBar()).toHaveClass('is-paused');
  run(60_000);
  expect(activeCell()).not.toHaveTextContent('clear');

  act(() => setTabVisibility('visible'));
  run(5_200);
  expect(activeCell()).toHaveTextContent('clear');
});

test('with reduced motion nothing runs, no toggle is offered, and a click swaps the output at once', () => {
  mount({ reducedMotion: true });

  run(60_000);
  expect(activeCell()).toHaveTextContent('evinle');
  expect(screen.queryByTestId(testIds.aboutTerminalProgress)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /rotation/ })).not.toBeInTheDocument();

  fireEvent.click(button('stack'));
  expect(activeCell()).toHaveTextContent('$ cat stack.yaml');
  expect(activeCell().querySelector('.is-unrevealed')).not.toBeInTheDocument();
});
