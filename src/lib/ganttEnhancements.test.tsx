import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { stubScrollIntoView } from '../test/browserStubs';
import { correctGanttToLiveDate, enableGanttNoteToggle } from './ganttEnhancements';

// Only the wrapper's wiring. Which note is open is covered in ganttNotes.test.ts, and positions in
// ganttAxis.test.ts. That these wrappers work on the real page's markup is covered by e2e/gantt.spec.ts.

function BarWithNote({ id }: Readonly<{ id: string }>) {
  return (
    <>
      <button type="button" className="el-bar" id={`bar-${id}`} aria-expanded="false" aria-controls={`note-${id}`}>
        <span id={`hint-${id}`} />
      </button>
      <span className="el-bar-note" id={`note-${id}`} />
    </>
  );
}

/** A fresh document for each test, so listeners from one test can't answer clicks in the next. */
function setUp({ matches = true } = {}) {
  stubScrollIntoView();
  const doc = document.implementation.createHTMLDocument();
  render(
    <div className="el-gantt-scroll">
      <BarWithNote id="a" />
      <BarWithNote id="b" />
    </div>,
    { container: doc.body.appendChild(doc.createElement('div')) },
  );

  const onChange: Array<() => void> = [];
  enableGanttNoteToggle(doc, { matches, addEventListener: (_type, listener) => onChange.push(listener) });

  const element = (id: string) => {
    const found = doc.getElementById(id);
    if (!found) throw new Error(`Missing #${id}`);
    return found;
  };
  return {
    doc,
    element,
    bar: (id: string) => element(`bar-${id}`),
    isOpen: (id: string) => element(`note-${id}`).classList.contains('is-open'),
    changeWidth: () => onChange.forEach((listener) => listener()),
  };
}

test('tapping applies the state to both the note and its bar, for the old note and the new one', () => {
  const { bar, isOpen } = setUp();

  bar('a').click();
  expect(isOpen('a')).toBe(true);
  expect(bar('a').getAttribute('aria-expanded')).toBe('true');

  bar('b').click();
  expect(isOpen('a')).toBe(false);
  expect(bar('a').getAttribute('aria-expanded')).toBe('false');
  expect(isOpen('b')).toBe(true);
});

test('a tap inside a bar counts as a tap on it, and a tap anywhere else dismisses', () => {
  const { doc, element, isOpen } = setUp();

  element('hint-a').click();
  expect(isOpen('a')).toBe(true);

  doc.body.click();
  expect(isOpen('a')).toBe(false);
});

test('Escape and crossing the breakpoint dismiss, and other keys do not', () => {
  const { bar, changeWidth, doc, isOpen } = setUp();

  bar('a').click();
  doc.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
  expect(isOpen('a')).toBe(true);
  doc.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(isOpen('a')).toBe(false);

  bar('a').click();
  changeWidth();
  expect(isOpen('a')).toBe(false);
});

test('wide enough to show every note, bars do nothing', () => {
  const { bar, isOpen } = setUp({ matches: false });

  bar('a').click();

  expect(isOpen('a')).toBe(false);
});

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
