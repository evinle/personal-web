# MarbleDiagram

An RxJS-style marble diagram as inline SVG: one lane per stream, marbles as discs with short labels.

- `lanes`: `{ label, marbles: { at, text, kind? }[] }[]`; `at` runs 0..`duration` (default 100). `kind`: `src` (blue, default), `bad` (pink, wasted), `ok` (mint, correct).
- `label` is required: the accessible description of what the diagram shows. Wrap in Figure.
