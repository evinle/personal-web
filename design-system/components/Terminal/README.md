# Terminal

A square (`radius-none`) panel on `surface-raised` with a title bar (`cod-terminal` + title) for commands, logs and facts.

- `title` sets the bar text. Children render in a mono `pre`; use `Prompt` for `$ command` lines and `Cursor` for the cream block cursor. Colour output with `el-blue` (hashes), `el-pink` (before), `el-mint` (after).
- `pre={false}` for structured children such as KeyValueList.
