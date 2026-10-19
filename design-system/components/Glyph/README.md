# Glyph

A Nerd Font glyph by name, rendered as a character in the mono face so it inherits colour and sits on the text baseline.

- Props: `name` (a glyph name from the card, e.g. `dev-react`, `cod-terminal`), optional `size`, optional `title`. Without `title` the glyph is `aria-hidden`; with it, it becomes an image with that accessible name.
- Use beside a text label. An icon alone belongs in IconButton, which requires a label.
- Only names in the subset render. Adding one means adding its code point to the font subset and to the bundle's glyph map.
- `glyphFor(label)` returns the glyph for a tech or topic name (`react`, `.net`, `perf`), or undefined.
