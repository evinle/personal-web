import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import type { EditorOutput, TerminalCommand, TerminalOutput } from '../../lib/terminalCommands';
import { glyphChar } from '../../lib/glyphs';
import { testIds } from '../../testIds';
import EditorScreen from './EditorScreen';
import JsonOutput from './JsonOutput';
import YamlOutput from './YamlOutput';
import {
  commandButtonView,
  displayedState,
  rotationToggleLabel,
  screenView,
  statusMessage,
  type ScreenView,
} from './terminalView';
import { HOLD_MS, INITIAL_STATE, createTimeline } from './timeline';
import { useProseTriggers } from './useProseTriggers';

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

function ShellOutput({ output }: Readonly<{ output: TerminalOutput }>) {
  switch (output.kind) {
    case 'plain':
      return <>{output.lines.map((line) => <span key={line} className="el-term-line">{line}</span>)}</>;
    case 'yaml':
      return <YamlOutput data={output.data} />;
    case 'json':
      return <JsonOutput data={output.data} highlight={output.highlight} />;
    case 'editor':
      return <></>;
  }
}

function ShellCell({ output, view }: Readonly<{ output: TerminalOutput; view: ScreenView }>) {
  return (
    <span className="el-term-cell">
      <Prompt />
      <span data-testid={testIds.aboutTerminalTyped}>{view.typed}</span>
      {view.caret === 'line' && <Cursor pressed={view.caretPressed} />}
      {'\n'}
      {view.caret === 'below' && <Cursor pressed={false} />}
      <span className={view.revealed ? undefined : 'is-unrevealed'}>
        <ShellOutput output={output} />
        <Prompt />
        {view.exitTyped !== null && <span>{view.exitTyped}</span>}
        {view.caret === 'prompt' && <Cursor pressed={view.caretPressed} />}
      </span>
    </span>
  );
}

function LiveEditor({ output, view }: Readonly<{ output: EditorOutput; view: ScreenView }>) {
  if (view.exitTyped === null) return <EditorScreen output={output} caret={<Cursor pressed={false} />} />;
  return (
    <EditorScreen
      output={output}
      commandLine={
        <>
          <span>{view.exitTyped}</span>
          <Cursor pressed={view.caretPressed} />
        </>
      }
    />
  );
}

function ActiveCell({ command, view }: Readonly<{ command: TerminalCommand; view: ScreenView }>) {
  const { output } = command;
  if (output.kind !== 'editor') return <ShellCell output={output} view={view} />;
  if (view.screen === 'editor') return <LiveEditor output={output} view={view} />;
  return (
    <>
      <ShellCell output={output} view={view} />
      <EditorScreen output={output} inactive />
    </>
  );
}

/** Rendered in full but invisible, so the panel is always as tall as the longest output. */
function InactiveCell({ command }: Readonly<{ command: TerminalCommand }>) {
  if (command.output.kind === 'editor') return <EditorScreen output={command.output} inactive />;
  return (
    <span className="el-term-cell is-inactive">
      <Prompt />
      <span>{command.line}</span>
      {'\n'}
      <ShellOutput output={command.output} />
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

interface RotationToggleProps {
  rotating: boolean;
  disabled: boolean;
  onPause: () => void;
  onResume: () => void;
}

function RotationToggle({ rotating, disabled, onPause, onResume }: Readonly<RotationToggleProps>) {
  const label = rotationToggleLabel(rotating);
  return (
    <button
      type="button"
      className="el-term-cmd el-term-toggle"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={rotating ? onPause : onResume}
    >
      <svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor" aria-hidden="true">
        {rotating ? <path d="M2 1h3v10H2zM7 1h3v10H7z" /> : <path d="M2 1l9 5-9 5z" />}
      </svg>
    </button>
  );
}

function TitleBar() {
  return (
    <div className="el-term-bar">
      <span className="label">
        <i className="nf" aria-hidden="true">{glyphChar('cod-terminal')}</i> zsh · /home/evinle
      </span>
      <span className="label el-muted" aria-hidden="true">●●●</span>
    </div>
  );
}

export default function Terminal({ commands }: Readonly<{ commands: TerminalCommand[] }>) {
  const [timeline] = useState(() => createTimeline(commands));
  const liveState = useSyncExternalStore(timeline.subscribe, timeline.getSnapshot, () => INITIAL_STATE);
  const hydrated = useSyncExternalStore(noSubscription, () => true, () => false);
  const reducedMotion = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const seen = useSeenByVisitor(panel);
  const running = seen && !reducedMotion;
  const state = displayedState(liveState, reducedMotion);

  useEffect(() => {
    timeline.setRunning(running);
    return () => timeline.setRunning(false);
  }, [timeline, running]);

  // A phrase can be far from the panel on a phone, where the panel would otherwise stay paused offscreen.
  const chooseFromProse = useCallback((index: number) => {
    timeline.takeOver(index);
    panel.current?.scrollIntoView({ block: 'nearest' });
  }, [timeline]);
  useProseTriggers(commands, state.index, chooseFromProse);

  return (
    <div className="el-term" ref={panel}>
      <TitleBar />
      <div className="el-term-cmds">
        {commands.map((command, i) => {
          const { active, chosen, counting } = commandButtonView(i, state);
          return (
            <CommandButton
              key={command.name}
              name={command.name}
              active={active}
              chosen={chosen}
              counting={hydrated && counting}
              paused={!running}
              disabled={!hydrated}
              onClick={() => timeline.takeOver(i)}
            />
          );
        })}
        {!reducedMotion && (
          <RotationToggle rotating={state.rotating} disabled={!hydrated} onPause={timeline.pause} onResume={timeline.resume} />
        )}
      </div>
      <pre className="el-term-body code el-term-screen" aria-hidden="true" data-testid={testIds.aboutTerminalScreen}>
        {commands.map((command, i) =>
          i === state.index ? (
            <ActiveCell key={command.name} command={command} view={screenView(command, state)} />
          ) : (
            <InactiveCell key={command.name} command={command} />
          ),
        )}
      </pre>
      <span className="el-visually-hidden" role="status">
        {statusMessage(commands[state.index], state.rotating)}
      </span>
    </div>
  );
}
