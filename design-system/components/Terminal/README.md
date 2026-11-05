# Terminal

A square (`radius-none`) panel on `surface-raised` with a title bar (`cod-terminal` + title) for commands, logs and facts.

- `title` sets the bar text. Children render in a mono `pre`; use `Prompt` for `$ command` lines and `Cursor` for the cream block cursor. Colour output with `el-blue` (hashes), `el-pink` (before), `el-mint` (after).
- `pre={false}` for structured children such as KeyValueList.

## Interactive terminal

The home page's terminal is a React island, `src/components/terminal/Terminal.tsx`, with the same panel plus `el-term-cmds`, `el-term-cmd` and `el-term-cmd-bar`. Nothing is fetched and the visitor can't type: it replays commands whose outputs were rendered at build time.

- **Commands.** `whoami` (plain lines), `cat stack.yaml` and `cat qualifications.yaml` (`YamlOutput`), `nvim how-i-work.md` (`EditorScreen`) and `curl -s .../status.json | jq` (`JsonOutput`). Outputs come from the content collections; only the file names and the URL are invented.
- **Intro phrases.** A markdown link in the intro whose anchor matches a command's `anchor` runs that command when clicked, stops the rotation and scrolls the panel into view if needed. The phrase turns `mint` (`is-running`) while its command is active, including during the rotation. Without JavaScript it's a plain link to that section. Commands without a phrase are still reachable from their button.
- **Editor.** `nvim` replaces the whole screen, including the prompt and the command, with line numbers, `~` rows that fill the spare height, a status line and a message row. It exits with `:q` instead of `clear`.
- **Rotation.** Commands run in order and repeat. Each one types its command, presses Enter, reveals its output, holds for 5s, types its exit command, presses Enter and moves on.
- **Typing rhythm.** 40ms per character within a word, with an extra 80ms after a space and 260ms after the program name and the pipe, so `curl -s https://... | jq` reads as three phrases. The rhythm is fixed, not random, so the same command always types the same way.
- **Enter.** 220ms after the last character the caret dips for 110ms (`is-pressed`), then drops to the next line for 280ms before the output appears. On the exit command, the screen wipes straight after the dip.
- **Before scripts run.** The first command and its output are already on screen, and the buttons are disabled until the island hydrates. The first hold starts at hydration, with no typing.
- **Command buttons.** Real buttons at the top of the panel, one per command. The active one is `mint` and shows a shrinking bar during its hold.
- **Click to stop.** A click stops the rotation, then types that command from the start and leaves its output on screen. The bar goes away.
- **Pause and resume.** The last button in the row (`el-term-toggle`) is an icon in `ink`, an inline SVG because the subset icon font has no such glyphs. It shows pause during the rotation and play once it has stopped, however it stopped, with its action as the accessible name and tooltip. Pausing keeps the current output on screen. Resuming gives that output a full hold, then moves on to the next command; a command still typing finishes first. Reduced motion has no rotation, so the button isn't offered.
- **YAML wrapping.** Keys share a column (`yml-map`) and each list wraps inside the value column (`yml-flow`), breaking between items. An item only splits if it's too long for a whole line on its own.
- **Width.** In the intro the panel takes 1.2 parts to the prose's 1, and the full width once they stack.
- **Pausing.** The timeline and the bar both pause while the panel is offscreen or the tab is hidden, and resume where they stopped.
- **Reduced motion.** No typing, rotation or bar. A click swaps the output at once.
- **Height.** Every output stays in the page, invisible, in one shared grid area, so the panel is as tall as the longest output and never shifts the page.
- **Accessibility.** Only the screen is `aria-hidden`, because everything it shows must also be real text elsewhere on the page. The buttons stay exposed, since hiding a focusable control from assistive technology is itself a bug. Once a visitor chooses a command, a visually hidden `role="status"` names it, so a phrase or button click isn't silent. The rotation stays quiet.

