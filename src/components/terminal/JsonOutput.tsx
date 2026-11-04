import type { ReactNode } from 'react';
import type { JsonValue } from '../../lib/terminalCommands';

function Punct({ children }: Readonly<{ children: string }>) {
  return <span className="js-p">{children}</span>;
}

function scalarClass(value: string | number | boolean | null, highlighted: boolean): string {
  if (value === null || typeof value === 'boolean') return 'js-b';
  if (highlighted) return 'js-hl';
  return typeof value === 'number' ? 'js-n' : 'js-s';
}

interface EntriesProps {
  open: string;
  close: string;
  entries: ReactNode[];
}

function Entries({ open, close, entries }: Readonly<EntriesProps>) {
  if (entries.length === 0) return <Punct>{open + close}</Punct>;
  return (
    <>
      <Punct>{open}</Punct>
      {entries.map((entry, i) => (
        <span key={i} className="js-entry">
          {entry}
          {i < entries.length - 1 && <Punct>,</Punct>}
        </span>
      ))}
      <span className="js-close">
        <Punct>{close}</Punct>
      </span>
    </>
  );
}

function InlineArray({ items, highlighted }: Readonly<{ items: JsonValue[]; highlighted: boolean }>) {
  return (
    <>
      <Punct>[</Punct>
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <Punct>, </Punct>}
          <Value value={item} highlighted={highlighted} />
        </span>
      ))}
      <Punct>]</Punct>
    </>
  );
}

interface ValueProps {
  value: JsonValue;
  highlightKey?: string;
  highlighted?: boolean;
}

function Value({ value, highlightKey, highlighted = false }: Readonly<ValueProps>) {
  if (Array.isArray(value) && value.every((item) => typeof item !== 'object')) {
    return <InlineArray items={value} highlighted={highlighted} />;
  }
  if (Array.isArray(value)) {
    const items = value.map((item, i) => (
      <Value key={i} value={item} highlightKey={highlightKey} highlighted={highlighted} />
    ));
    return <Entries open="[" close="]" entries={items} />;
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value).map(([key, item]) => (
      <span key={key}>
        <span className="js-k">{JSON.stringify(key)}</span>
        <Punct>: </Punct>
        <Value value={item} highlightKey={highlightKey} highlighted={key === highlightKey} />
      </span>
    ));
    return <Entries open="{" close="}" entries={entries} />;
  }
  return <span className={scalarClass(value, highlighted)}>{JSON.stringify(value)}</span>;
}

/**
 * Pretty-printed JSON coloured the way `jq` does it, as in the design system's JsonOutput,
 * except that arrays of scalars stay on one wrapped line to keep the panel a readable height.
 */
export default function JsonOutput({ data, highlight }: Readonly<{ data: JsonValue; highlight?: string }>) {
  return <Value value={data} highlightKey={highlight} />;
}
