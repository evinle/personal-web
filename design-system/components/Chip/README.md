# Chip

A square pill (`radius-none`, `line` border): glyph in `blue` + lowercase name in `ink-muted`.

- `label` required. The glyph is looked up from the label (`react`, `.net`, `azure`, `perf`, `architecture`); pass `glyph` to choose one or `glyph={null}` for text only.
- No glyph in the set (Zod, Hono, Snowflake...) means a text-only chip. Never borrow a lookalike.
- A chip that opens a [Popover](../Popover/README.md) is a `<button class="el-stack">` with its name in `el-stack-name`, which is underlined so it reads as clickable without hover. Its border turns `mint` on hover and keyboard focus. A chip with nothing to open stays a `<span>`.

On the home page, `src/components/TechnologyChips.astro` renders a list of Technology chips, and `src/components/TechnologyNotes.astro` renders the Popovers they open. A page that shows chips includes `TechnologyNotes` once. Each Technology Note Popover shows the Technology's Proficiency (Strong in `mint`, Comfortable in `blue`, Familiar in `ink-muted`) and Project count above the Note.
