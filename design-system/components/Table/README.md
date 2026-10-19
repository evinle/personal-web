# Table

A square-framed table: `label` headers on `surface-raised`, hairline rows, numbers right-aligned in mono, an optional caption below.

- `columns`: `{ key, label, align?, mono? }[]`; `align: 'right'` also sets mono (numbers).
- `rows`: objects keyed by column; cells can be nodes (colour a before/after with `el-pink` / `el-mint`).
- `highlightRow` (0-based) gets the `mint-soft` ground; use it for the row the text is about.
