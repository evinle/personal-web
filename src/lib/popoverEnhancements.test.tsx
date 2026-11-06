import { render } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { stubIntersectionObserver, stubResizeObserver } from '../test/browserStubs';
import { closePopoversOutOfView } from './popoverEnhancements';

// Only the wrapper's wiring. When a popover should close is covered in popovers.test.ts, and the real
// scroll in e2e/layout.spec.ts.

function setUp() {
  const position = stubIntersectionObserver();
  const size = stubResizeObserver();
  const doc = document.implementation.createHTMLDocument();
  render(
    <>
      <nav className="el-nav" />
      <div className="el-popover" id="card" />
    </>,
    { container: doc.body.appendChild(doc.createElement('div')) },
  );
  const card = doc.getElementById('card');
  const nav = doc.querySelector('.el-nav');
  if (!card || !nav) throw new Error('Missing fixture');
  vi.spyOn(nav, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 65));
  vi.spyOn(doc.documentElement, 'clientHeight', 'get').mockReturnValue(800);
  const hidePopover = vi.fn();
  card.hidePopover = hidePopover;
  const placeCard = (top: number, height = 200) =>
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, top, 100, height));
  closePopoversOutOfView(doc);
  const toggle = () => card.dispatchEvent(new Event('toggle'));
  const open = () => {
    placeCard(200);
    toggle();
  };
  return { hidePopover, open, placeCard, position, size, toggle };
}

test('an opened popover stays open while it fits, and closes once it reaches the nav', () => {
  const { hidePopover, open, placeCard, position } = setUp();
  open();

  position.setOnscreen(true);
  expect(hidePopover).not.toHaveBeenCalled();

  placeCard(40);
  position.setOnscreen(false);
  expect(hidePopover).toHaveBeenCalledOnce();
});

test('an opened popover closes once it passes the bottom of the screen', () => {
  const { hidePopover, open, placeCard, position } = setUp();
  open();

  placeCard(700);
  position.setOnscreen(false);

  expect(hidePopover).toHaveBeenCalledOnce();
});

test('an opened popover closes once it shrinks too small to read, seen by the size observer alone', () => {
  const { hidePopover, open, placeCard, size } = setUp();
  open();

  placeCard(200, 100);
  size.notify();

  expect(hidePopover).toHaveBeenCalledOnce();
});

test('closing a popover stops its watcher, so it can reopen smaller without the old size closing it', () => {
  const { hidePopover, open, placeCard, size, toggle } = setUp();
  open();
  placeCard(0, 0);
  toggle();

  placeCard(200, 80);
  toggle();
  size.notify();

  expect(hidePopover).not.toHaveBeenCalled();
});

test('nothing closes before a popover has opened', () => {
  const { hidePopover, placeCard, position, size } = setUp();

  placeCard(40);
  position.setOnscreen(false);
  size.notify();

  expect(hidePopover).not.toHaveBeenCalled();
});
