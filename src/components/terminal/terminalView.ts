import type { TerminalCommand } from '../../lib/terminalCommands';
import type { Phase, TimelineState } from './timeline';

/** Where the caret sits in each phase, and whether the command's output has appeared. */
const PHASE_VIEWS: Record<Phase, { caret: 'line' | 'below' | 'prompt'; revealed: boolean }> = {
  typing: { caret: 'line', revealed: false },
  pressing: { caret: 'line', revealed: false },
  executing: { caret: 'below', revealed: false },
  hold: { caret: 'prompt', revealed: true },
  exiting: { caret: 'prompt', revealed: true },
  pressingExit: { caret: 'prompt', revealed: true },
  settled: { caret: 'prompt', revealed: true },
};

export interface ScreenView {
  screen: 'shell' | 'editor';
  /** The editor is the only output that replaces the screen, so a hidden copy holds its height until then. */
  holdsEditorHeight: boolean;
  typed: string;
  caret: 'line' | 'below' | 'prompt';
  caretPressed: boolean;
  revealed: boolean;
  /** How much of the exit command has been typed, or null when it hasn't started. */
  exitTyped: string | null;
}

/** What the active command's part of the screen shows at this point in the timeline. */
export function screenView(command: TerminalCommand, state: TimelineState): ScreenView {
  const { caret, revealed } = PHASE_VIEWS[state.phase];
  const isEditor = command.output.kind === 'editor';
  const exiting = state.phase === 'exiting' || state.phase === 'pressingExit';
  return {
    screen: isEditor && revealed ? 'editor' : 'shell',
    holdsEditorHeight: isEditor && !revealed,
    typed: state.phase === 'typing' ? command.line.slice(0, state.chars) : command.line,
    caret,
    caretPressed: state.phase === 'pressing' || state.phase === 'pressingExit',
    revealed,
    exitTyped: exiting ? command.exit.slice(0, state.chars) : null,
  };
}

/** Reduced motion has no typing or rotation: the output is simply there. */
export function displayedState(state: TimelineState, reducedMotion: boolean): TimelineState {
  return reducedMotion ? { ...state, phase: 'settled' } : state;
}

/** How the button for command `index` looks. */
export function commandButtonView(index: number, state: TimelineState) {
  const active = index === state.index;
  return { active, chosen: active && !state.rotating, counting: active && state.phase === 'hold' };
}

export function rotationToggleLabel(rotating: boolean) {
  return rotating ? 'Pause rotation' : 'Resume rotation';
}

/** Announced once a visitor has taken over. The rotation itself stays quiet. */
export function statusMessage(command: TerminalCommand, rotating: boolean) {
  return rotating ? '' : `Terminal now shows ${command.line}`;
}

/** The command an intro phrase runs, by the anchor they share, or -1 if it doesn't run one. */
export function commandIndexForHref(commands: readonly TerminalCommand[], href: string | null | undefined) {
  return commands.findIndex((command) => command.anchor !== undefined && `#${command.anchor}` === href);
}

/** Whether an intro phrase should light up, because its command is the active one. */
export function isPhraseRunning(commands: readonly TerminalCommand[], activeIndex: number, href: string | null) {
  return commandIndexForHref(commands, href) === activeIndex;
}
