import type { YamlValue } from '../../lib/terminalCommands';

function FlowList({ items }: Readonly<{ items: string[] }>) {
  return (
    <span className="yml-flow">
      {items.map((item, i) => (
        <span key={item}>
          {i === 0 && <span className="js-p">[</span>}
          <span className="js-s">{item}</span>
          <span className="js-p">{i === items.length - 1 ? ']' : ','}</span>
        </span>
      ))}
    </span>
  );
}

function Value({ value }: Readonly<{ value: YamlValue }>) {
  if (Array.isArray(value)) return <FlowList items={value} />;
  if (typeof value === 'object') {
    return (
      <span className="yml-nested">
        <YamlOutput data={value} />
      </span>
    );
  }
  return <span className="js-s">{value}</span>;
}

/**
 * Keys share a column and values wrap inside their own, so a long list stays readable at any
 * width. Each list item is a flex item, so a line only breaks inside one that can't fit on its own.
 */
export default function YamlOutput({ data }: Readonly<{ data: { [key: string]: YamlValue } }>) {
  return (
    <span className="yml-map">
      {Object.entries(data).map(([name, value]) => (
        <span key={name} className="yml-entry">
          <span>
            <span className="js-k">{name}</span>
            <span className="js-p">:</span>
          </span>
          <Value value={value} />
        </span>
      ))}
    </span>
  );
}
