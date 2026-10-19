# Chip

A square pill (`radius-none`, `line` border): glyph in `blue` + lowercase name in `ink-muted`.

- `label` required. The glyph is looked up from the label (`react`, `.net`, `azure`, `perf`, `architecture`); pass `glyph` to choose one or `glyph={null}` for text only.
- No glyph in the set (Zod, Hono, Snowflake...) means a text-only chip. Never borrow a lookalike.
