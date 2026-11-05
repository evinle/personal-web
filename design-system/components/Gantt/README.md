# Gantt

A timeline in the Bryntum mould: a label column with names and chips, a track per row with square bars, year gridlines, and a dashed `cream` now line.

- `start`/`end` set the axis (`YYYY-MM`); `now` (`YYYY-MM-DD`) draws today. `label` is the accessible summary (required).
- `parent` adds a summary bar (the employer). On the About page its rows also get muted `├─`/`└─` branches (`el-gantt-label branched`, with the branch in `el-gantt-branch`), with `└─` on the last row. The name and chips share a column right of the branch. The bundled `Gantt` component only indents its rows; it doesn't draw branches yet.
- Rows: `{ name, chips?, start, end?, tone?, note?, noteSide? }`. No `end` means ongoing: the bar runs to now and fades. `tone` `blue` or `mint` (colour by one dimension and say which in `legend`). `note` is the outcome, set above the bar from the bar's start. `noteSide: 'left'` ends it at the bar's end instead, for bars too near the right edge to fit it.

Below `--below-phone` the chart scrolls sideways and notes collapse: on the About page each bar is a button with a mint `[+]` above it (`el-bar-hint`, inside the button) that opens its note in that spot as a popup, on top of everything in the chart including the pinned labels and nudged sideways to stay in view. It uses `ink` text on `surface` with a `mint` border. One note is open at a time; tapping elsewhere or pressing Esc closes it.

The About page draws one dividing line per whole year (`el-gantt-yearline`, on `el-gantt-track-years`) at that year's true position, with the year label just to its right. Its axis starts one month before the first project, matching the month after the now line. The first label lines up with the start of that project's bar and names the month (`Jun 2022`), because that year is only part-way through. It has no dividing line, which would double up with the label column's border. Below `--below-tablet` the label drops to `2022` to fit. The now label sits left of its line so it stays inside the chart.
