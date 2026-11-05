import type { ReactNode } from 'react';
import type { EditorOutput } from '../../lib/terminalCommands';

// More than any panel is tall. The fill clips them, so they never add to the panel's height.
const EMPTY_ROWS = '~\n'.repeat(40);

interface EditorScreenProps {
  output: EditorOutput;
  /** Sits at the end of the first line, where the editor opens. */
  caret?: ReactNode;
  /** Replaces the file message on the bottom row, as `:q` does while it's typed. */
  commandLine?: ReactNode;
  inactive?: boolean;
}

/** A whole-screen view in the style of nvim: unlike shell output, it replaces the prompt and the command. */
export default function EditorScreen({ output, caret, commandLine, inactive = false }: Readonly<EditorScreenProps>) {
  const { file, lines } = output;
  return (
    <span className={`el-term-cell el-vim${inactive ? ' is-inactive' : ''}`}>
      <span className="el-vim-buffer">
        {lines.map((text, i) => (
          <span key={i} className="el-vim-line">
            <span className="el-vim-nr">{i + 1}</span>
            <span className={text.startsWith('#') ? 'el-vim-title' : undefined}>
              {text}
              {i === 0 && caret}
            </span>
          </span>
        ))}
      </span>
      <span className="el-vim-fill">
        <span className="el-vim-empty">{EMPTY_ROWS}</span>
      </span>
      <span className="el-vim-status">
        <span className="el-vim-mode">NORMAL</span>
        <span>{file}</span>
        <span className="el-vim-pos">1,1</span>
        <span>All</span>
      </span>
      <span className="el-vim-cmd">{commandLine ?? `"${file}" ${lines.length}L`}</span>
    </span>
  );
}
