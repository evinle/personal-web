# Chip

A square pill (`radius-none`, `line` border): glyph in `blue` + lowercase name in `ink-muted`.

- `label` required. The glyph is looked up from the label (`react`, `.net`, `azure`, `perf`, `architecture`); pass `glyph` to choose one or `glyph={null}` for text only.
- No glyph in the set (Zod, Hono, Snowflake...) means a text-only chip. Never borrow a lookalike.
- A chip that opens a [Popover](../Popover/README.md) is a `<button class="el-stack">` with a visible `ink-muted` border. A chip with nothing to open stays a `<span>`.
