# Gantt

A timeline in the Bryntum mould: a label column with names and chips, a track per row with square bars, year gridlines, and a dashed `cream` now line.

- `start`/`end` set the axis (`YYYY-MM`); `now` (`YYYY-MM-DD`) draws today. `label` is the accessible summary (required).
- `parent` adds a summary bar (the employer); rows then get `├─`/`└─` branches.
- Rows: `{ name, chips?, start, end?, tone?, note?, noteSide? }`. No `end` means ongoing: the bar runs to now and fades. `tone` `blue` or `mint` (colour by one dimension and say which in `legend`). `note` is the outcome beside the bar.
