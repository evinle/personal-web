export const HOLD_MS = 5_000;
export const CLEAR_COMMAND = 'clear';

const TYPE_MS = 40;
const WORD_PAUSE_MS = 80;
const PHRASE_PAUSE_MS = 260;
const BEFORE_ENTER_MS = 220;
const ENTER_PRESS_MS = 110;
const EXECUTING_MS = 280;
const HOLD_TICK_MS = 100;
const HOLD_TICKS = HOLD_MS / HOLD_TICK_MS;

/**
 * typing: the command line is appearing.
 * pressing: Enter is going down on the command line.
 * executing: the caret has dropped to the next line, output not yet revealed.
 * hold: output is on screen, counting down to `clear`.
 * clearing: `clear` is appearing under the output.
 * pressingClear: Enter is going down on `clear`.
 * settled: the visitor chose this command, so its output stays.
 */
export type Phase = 'typing' | 'pressing' | 'executing' | 'hold' | 'clearing' | 'pressingClear' | 'settled';

export interface TimelineState {
  index: number;
  phase: Phase;
  chars: number;
  holdTicks: number;
  rotating: boolean;
}

export const INITIAL_STATE: TimelineState = { index: 0, phase: 'hold', chars: 0, holdTicks: HOLD_TICKS, rotating: true };

type Lines = readonly string[];

const STEPS: Record<Phase, (state: TimelineState, lines: Lines) => TimelineState> = {
  typing: (state, lines) =>
    state.chars < lines[state.index].length ? { ...state, chars: state.chars + 1 } : { ...state, phase: 'pressing' },
  pressing: (state) => ({ ...state, phase: 'executing' }),
  executing: (state) => ({ ...state, phase: state.rotating ? 'hold' : 'settled', holdTicks: HOLD_TICKS }),
  hold: (state) =>
    state.holdTicks > 1 ? { ...state, holdTicks: state.holdTicks - 1 } : { ...state, phase: 'clearing', chars: 0 },
  clearing: (state) =>
    state.chars < CLEAR_COMMAND.length ? { ...state, chars: state.chars + 1 } : { ...state, phase: 'pressingClear' },
  pressingClear: (state, lines) => ({ ...state, index: (state.index + 1) % lines.length, phase: 'typing', chars: 0 }),
  settled: (state) => state,
};

/** Even within a word. The pause falls after a space, longest after the program name and the pipe. */
function typingDelay(line: string, chars: number): number {
  if (chars >= line.length) return BEFORE_ENTER_MS;
  if (chars === 0 || line[chars - 1] !== ' ') return TYPE_MS;
  const endsPhrase = chars === line.indexOf(' ') + 1 || line[chars - 2] === '|';
  return TYPE_MS + (endsPhrase ? PHRASE_PAUSE_MS : WORD_PAUSE_MS);
}

const DELAYS: Record<Phase, (state: TimelineState, lines: Lines) => number | null> = {
  typing: (state, lines) => typingDelay(lines[state.index], state.chars),
  pressing: () => ENTER_PRESS_MS,
  executing: () => EXECUTING_MS,
  hold: () => HOLD_TICK_MS,
  clearing: (state) => typingDelay(CLEAR_COMMAND, state.chars),
  pressingClear: () => ENTER_PRESS_MS,
  settled: () => null,
};

/**
 * Drives the state from its own timer chain rather than from React effects, so each
 * delay is scheduled the moment the previous one fires and renders can't stretch it.
 */
export function createTimeline(lines: Lines) {
  let state = INITIAL_STATE;
  let running = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();

  function setState(next: TimelineState) {
    state = next;
    listeners.forEach((listener) => listener());
  }

  function schedule() {
    clearTimeout(timer);
    const delay = DELAYS[state.phase](state, lines);
    if (!running || delay === null) return;
    timer = setTimeout(() => {
      setState(STEPS[state.phase](state, lines));
      schedule();
    }, delay);
  }

  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setRunning: (next: boolean) => {
      running = next;
      schedule();
    },
    /** Permanently stops the rotation and types the chosen command from the start. */
    takeOver: (index: number) => {
      setState({ index, phase: 'typing', chars: 0, holdTicks: HOLD_TICKS, rotating: false });
      schedule();
    },
  };
}
