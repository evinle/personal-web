# Terminal

A square (`radius-none`) panel on `surface-raised` with a title bar (`cod-terminal` + title) for commands, logs and facts.

- `title` sets the bar text. Children render in a mono `pre`; use `Prompt` for `$ command` lines and `Cursor` for the cream block cursor. Colour output with `el-blue` (hashes), `el-pink` (before), `el-mint` (after).
- `pre={false}` for structured children such as KeyValueList.

## Interactive terminal

The About page's terminal is a React island, `src/components/terminal/Terminal.tsx`, with the same panel plus `el-term-cmds`, `el-term-cmd` and `el-term-cmd-bar`. Nothing is fetched and the visitor can't type: it replays commands whose outputs were rendered at build time.

- **Rotation.** Commands run in order and repeat. Each one types its command, presses Enter, reveals its output, holds for 5s, types `clear`, presses Enter and moves on.
- **Typing rhythm.** 40ms per character within a word, with an extra 80ms after a space and 260ms after the program name and the pipe, so `curl https://... -i | jq` reads as three phrases. The rhythm is fixed, not random, so the same command always types the same way.
- **Enter.** 220ms after the last character the caret dips for 110ms (`is-pressed`), then drops to the next line for 280ms before the output appears. On `clear`, the screen wipes straight after the dip.
- **Before scripts run.** The first command and its output are already on screen, and the buttons are disabled until the island hydrates. The first hold starts at hydration, with no typing.
- **Command buttons.** Real buttons at the top of the panel, one per command. The active one is `mint` and shows a shrinking bar during its hold.
- **Click to stop.** A click permanently stops the rotation, then types that command from the start and leaves its output on screen. The bar goes away.
- **Pausing.** The timeline and the bar both pause while the panel is offscreen or the tab is hidden, and resume where they stopped.
- **Reduced motion.** No typing, rotation or bar. A click swaps the output at once.
- **Height.** Every output stays in the page, invisible, in one shared grid area, so the panel is as tall as the longest output and never shifts the page.
- **Accessibility.** Only the screen is `aria-hidden`, because everything it shows must also be real text elsewhere on the page. The buttons stay exposed, since hiding a focusable control from assistive technology is itself a bug.
- **Canned headers.** The `curl -i` header block is fixed and not a real response: status, content type, a `content-length` computed from the body, and the build time as `date`. Only the JSON body is real site data.

