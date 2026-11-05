import { useEffect } from 'react';
import type { TerminalCommand } from '../../lib/terminalCommands';
import { commandIndexForHref, isPhraseRunning } from './terminalView';

const PROSE_LINKS = '.el-intro-prose a[href^="#"]';

/**
 * Connects the intro's in-page links to the terminal. The links are plain markdown, so without
 * JavaScript they still go to the matching section.
 */
export function useProseTriggers(
  commands: readonly TerminalCommand[],
  activeIndex: number,
  choose: (index: number) => void,
) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const index = commandIndexForHref(commands, event.target.closest(PROSE_LINKS)?.getAttribute('href'));
      if (index < 0) return;
      event.preventDefault();
      choose(index);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [commands, choose]);

  useEffect(() => {
    document.querySelectorAll(PROSE_LINKS).forEach((link) => {
      link.classList.toggle('is-running', isPhraseRunning(commands, activeIndex, link.getAttribute('href')));
    });
  }, [commands, activeIndex]);
}
