import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import type { TerminalCommand } from '../../lib/terminalCommands';
import { glyphChar } from '../../lib/glyphs';
import { testIds } from '../../testIds';
import JsonOutput from './JsonOutput';
import { CLEAR_COMMAND, HOLD_MS, INITIAL_STATE, createTimeline, type Phase, type TimelineState } from './timeline';

const noSubscription = () => () => undefined;

function subscribeToReducedMotion(listener: () => void) {
  const query = matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}

function subscribeToVisibility(listener: () => void) {
  document.addEventListener('visibilitychange', listener);
  return () => document.removeEventListener('visibilitychange', listener);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  );
}

/** Assumed onscreen and in a visible tab until the browser says otherwise. */
function useSeenByVisitor(ref: RefObject<HTMLElement | null>) {
  const [onscreen, setOnscreen] = useState(true);
  const tabVisible = useSyncExternalStore(subscribeToVisibility, () => document.visibilityState !== 'hidden', () => true);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => setOnscreen(entry.isIntersecting));
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return onscreen && tabVisible;
}

function Prompt() {
  return <span className="el-muted">$ </span>;
}

function Cursor({ pressed }: Readonly<{ pressed: boolean }>) {
  return (
    <span className={`el-cursor${pressed ? ' is-pressed' : ''}`} data-testid={testIds.aboutTerminalCursor}>
      ▍
    </span>
  );
}

function Output({ command, revealed }: Readonly<{ command: TerminalCommand; revealed: boolean }>) {
  return (
    <span className={revealed ? undefined : 'is-unrevealed'}>
      {command.headers.map((header) => (
        <span key={header} className="el-muted">
          {header}
          {'\n'}
        </span>
      ))}
      {'\n'}
      <JsonOutput data={command.body} highlight={command.highlight} />
      {'\n'}
    </span>
  );
}

/** Where the caret sits in each phase, and whether the command's output has appeared. */
const PHASE_VIEWS: Record<Phase, { caret: 'line' | 'below' | 'prompt'; revealed: boolean }> = {
  typing: { caret: 'line', revealed: false },
  pressing: { caret: 'line', revealed: false },
  executing: { caret: 'below', revealed: false },
  hold: { caret: 'prompt', revealed: true },
  clearing: { caret: 'prompt', revealed: true },
  pressingClear: { caret: 'prompt', revealed: true },
  settled: { caret: 'prompt', revealed: true },
};

interface ScreenCellProps {
  command: TerminalCommand;
  state: TimelineState;
}

function ActiveCell({ command, state }: Readonly<ScreenCellProps>) {
  const { caret, revealed } = PHASE_VIEWS[state.phase];
  const showsClear = state.phase === 'clearing' || state.phase === 'pressingClear';
  const pressed = state.phase === 'pressing' || state.phase === 'pressingClear';
  return (
    <span className="el-term-cell">
      <Prompt />
      <span data-testid={testIds.aboutTerminalTyped}>
        {state.phase === 'typing' ? command.line.slice(0, state.chars) : command.line}
      </span>
      {caret === 'line' && <Cursor pressed={pressed} />}
      {'\n'}
      {caret === 'below' && <Cursor pressed={false} />}
      <Output command={command} revealed={revealed} />
      <span className={revealed ? undefined : 'is-unrevealed'}>
        <Prompt />
        {showsClear && <span>{CLEAR_COMMAND.slice(0, state.chars)}</span>}
        {caret === 'prompt' && <Cursor pressed={pressed} />}
      </span>
    </span>
  );
}

/** Rendered in full but invisible, so the panel is always as tall as the longest output. */
function InactiveCell({ command }: Readonly<{ command: TerminalCommand }>) {
  return (
    <span className="el-term-cell is-inactive">
      <Prompt />
      <span>{command.line}</span>
      {'\n'}
      <Output command={command} revealed />
      <Prompt />
    </span>
  );
}

interface CommandButtonProps {
  name: string;
  active: boolean;
  chosen: boolean;
  counting: boolean;
  paused: boolean;
  disabled: boolean;
  onClick: () => void;
}

function CommandButton({ name, active, chosen, counting, paused, disabled, onClick }: Readonly<CommandButtonProps>) {
  return (
    <button
      type="button"
      className={`el-term-cmd${active ? ' is-active' : ''}`}
      aria-pressed={chosen}
      disabled={disabled}
      onClick={onClick}
    >
      {name}
      {counting && (
        <span
          className={`el-term-cmd-bar${paused ? ' is-paused' : ''}`}
          style={{ animationDuration: `${HOLD_MS}ms` }}
          data-testid={testIds.aboutTerminalProgress}
        />
      )}
    </button>
  );
}

export default function Terminal({ commands }: Readonly<{ commands: TerminalCommand[] }>) {
  const [timeline] = useState(() => createTimeline(commands.map((command) => command.line)));
  const liveState = useSyncExternalStore(timeline.subscribe, timeline.getSnapshot, () => INITIAL_STATE);
  const hydrated = useSyncExternalStore(noSubscription, () => true, () => false);
  const reducedMotion = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const seen = useSeenByVisitor(panel);
  const running = seen && !reducedMotion;
  const state: TimelineState = reducedMotion ? { ...liveState, phase: 'settled' } : liveState;

  useEffect(() => {
    timeline.setRunning(running);
    return () => timeline.setRunning(false);
  }, [timeline, running]);

  return (
    <div className="el-term" ref={panel}>
      <div className="el-term-bar">
        <span className="label">
          <i className="nf" aria-hidden="true">{glyphChar('cod-terminal')}</i> zsh · /home/evinle
        </span>
        <span className="label el-muted" aria-hidden="true">●●●</span>
      </div>
      <div className="el-term-cmds">
        {commands.map((command, i) => (
          <CommandButton
            key={command.name}
            name={command.name}
            active={i === state.index}
            chosen={i === state.index && !state.rotating}
            counting={hydrated && i === state.index && state.phase === 'hold'}
            paused={!running}
            disabled={!hydrated}
            onClick={() => timeline.takeOver(i)}
          />
        ))}
      </div>
      <pre className="el-term-body code el-term-screen" aria-hidden="true" data-testid={testIds.aboutTerminalScreen}>
        {commands.map((command, i) =>
          i === state.index ? (
            <ActiveCell key={command.name} command={command} state={state} />
          ) : (
            <InactiveCell key={command.name} command={command} />
          ),
        )}
      </pre>
    </div>
  );
}
