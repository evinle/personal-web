export const HOLD_MS = 5_000;

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
 * hold: output is on screen, counting down to the exit command.
 * exiting: the exit command (`clear` or `:q`) is appearing.
 * pressingExit: Enter is going down on the exit command.
 * settled: the rotation has stopped, so this output stays.
 */
export type Phase = 'typing' | 'pressing' | 'executing' | 'hold' | 'exiting' | 'pressingExit' | 'settled';

export interface TimelineState {
  index: number;
  phase: Phase;
  chars: number;
  holdTicks: number;
  rotating: boolean;
}

export const INITIAL_STATE: TimelineState = { index: 0, phase: 'hold', chars: 0, holdTicks: HOLD_TICKS, rotating: true };

export type Scripts = ReadonlyArray<{ line: string; exit: string }>;

const STEPS: Record<Phase, (state: TimelineState, scripts: Scripts) => TimelineState> = {
  typing: (state, scripts) =>
    state.chars < scripts[state.index].line.length ? { ...state, chars: state.chars + 1 } : { ...state, phase: 'pressing' },
  pressing: (state) => ({ ...state, phase: 'executing' }),
  executing: (state) => ({ ...state, phase: state.rotating ? 'hold' : 'settled', holdTicks: HOLD_TICKS }),
  hold: (state) =>
    state.holdTicks > 1 ? { ...state, holdTicks: state.holdTicks - 1 } : { ...state, phase: 'exiting', chars: 0 },
  exiting: (state, scripts) =>
    state.chars < scripts[state.index].exit.length ? { ...state, chars: state.chars + 1 } : { ...state, phase: 'pressingExit' },
  pressingExit: (state, scripts) => ({ ...state, index: (state.index + 1) % scripts.length, phase: 'typing', chars: 0 }),
  settled: (state) => state,
};

/** The state one step on. */
export function advance(state: TimelineState, scripts: Scripts): TimelineState {
  return STEPS[state.phase](state, scripts);
}

/** Even within a word. The pause falls after a space, longest after the program name and the pipe. */
function typingDelay(line: string, chars: number): number {
  if (chars >= line.length) return BEFORE_ENTER_MS;
  if (chars === 0 || line[chars - 1] !== ' ') return TYPE_MS;
  const endsPhrase = chars === line.indexOf(' ') + 1 || line[chars - 2] === '|';
  return TYPE_MS + (endsPhrase ? PHRASE_PAUSE_MS : WORD_PAUSE_MS);
}

const DELAYS: Record<Phase, (state: TimelineState, scripts: Scripts) => number | null> = {
  typing: (state, scripts) => typingDelay(scripts[state.index].line, state.chars),
  pressing: () => ENTER_PRESS_MS,
  executing: () => EXECUTING_MS,
  hold: () => HOLD_TICK_MS,
  exiting: (state, scripts) => typingDelay(scripts[state.index].exit, state.chars),
  pressingExit: () => ENTER_PRESS_MS,
  settled: () => null,
};

/** How long this state lasts before the next step, or null if it stays. */
export function delayUntilNext(state: TimelineState, scripts: Scripts): number | null {
  return DELAYS[state.phase](state, scripts);
}

/** Stops the rotation and types the chosen command from the start. */
export function chosen(index: number): TimelineState {
  return { index, phase: 'typing', chars: 0, holdTicks: HOLD_TICKS, rotating: false };
}

/** Output on screen stays there. A command still being typed finishes first. */
export function paused(state: TimelineState): TimelineState {
  const showingOutput = state.phase === 'hold' || state.phase === 'exiting' || state.phase === 'pressingExit';
  return { ...state, rotating: false, phase: showingOutput ? 'settled' : state.phase };
}

/** A settled output gets a full hold before moving on, so it doesn't vanish the moment rotation restarts. */
export function resumed(state: TimelineState): TimelineState {
  if (state.phase !== 'settled') return { ...state, rotating: true };
  return { ...state, rotating: true, phase: 'hold', holdTicks: HOLD_TICKS, chars: 0 };
}

/**
 * The thin wrapper that puts the pure steps above on a clock. Each delay is scheduled the moment
 * the previous one fires, rather than from React effects, so renders can't stretch it.
 */
export function createTimeline(scripts: Scripts) {
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
    const delay = delayUntilNext(state, scripts);
    if (!running || delay === null) return;
    timer = setTimeout(() => {
      setState(advance(state, scripts));
      schedule();
    }, delay);
  }

  function transition(next: TimelineState) {
    setState(next);
    schedule();
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
    takeOver: (index: number) => transition(chosen(index)),
    pause: () => transition(paused(state)),
    resume: () => transition(resumed(state)),
  };
}
