import { shouldClosePopover } from './popovers';

/**
 * Closes an open popover when the page scrolls it into the sticky nav, past the bottom of the screen, or
 * shrinks it too small to read. A native popover paints above everything whatever its z-index, so it can't
 * pass under the nav.
 */
export function closePopoversOutOfView(doc: Document) {
  const nav = doc.querySelector('.el-nav');
  if (!nav) return;

  function watch(popover: Element) {
    const openedHeight = popover.getBoundingClientRect().height;
    const closeIfNeeded = () => {
      const view = { top: nav?.getBoundingClientRect().bottom ?? 0, bottom: doc.documentElement.clientHeight };
      if (shouldClosePopover(view, popover.getBoundingClientRect(), openedHeight) && popover instanceof HTMLElement) {
        popover.hidePopover();
      }
    };

    // A threshold of 1 fires as soon as any of it leaves the space below the nav, whose height changes with
    // the screen's width, so this is worked out on opening. Shrinking inside that space needs its own observer.
    const position = new IntersectionObserver(closeIfNeeded, {
      rootMargin: `-${nav?.getBoundingClientRect().bottom ?? 0}px 0px 0px`,
      threshold: 1,
    });
    const size = new ResizeObserver(closeIfNeeded);
    position.observe(popover);
    size.observe(popover);
    return () => {
      position.disconnect();
      size.disconnect();
    };
  }

  let stopWatching: () => void = () => undefined;

  // Capture, because toggle doesn't bubble. A closing popover has no box and needs no watching.
  doc.addEventListener('toggle', ({ target }) => {
    if (!(target instanceof Element) || target.getBoundingClientRect().height === 0) return;
    stopWatching();
    stopWatching = watch(target);
  }, true);
}
