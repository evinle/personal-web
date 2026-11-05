# Gantt

A timeline in the Bryntum mould: a label column with names and chips, a track per row with square bars, year gridlines, and a dashed `cream` now line.

- `start`/`end` set the axis (`YYYY-MM`); `now` (`YYYY-MM-DD`) draws today. `label` is the accessible summary (required).
- `parent` adds a summary bar (the employer). On the home page its rows also get muted `├─`/`└─` branches (`el-gantt-label branched`, with the branch in `el-gantt-branch`), with `└─` on the last row. The name and chips share a column right of the branch. The bundled `Gantt` component only indents its rows; it doesn't draw branches yet.
- Rows: `{ name, chips?, start, end?, tone?, note?, noteSide? }`. No `end` means ongoing: the bar runs to now and fades. `tone` `blue` or `mint` (colour by one dimension and say which in `legend`). `note` is the outcome, set above the bar from the bar's start. `noteSide: 'left'` ends it at the bar's end instead, for bars too near the right edge to fit it.

On the home page each bar and Project name is a button that opens the Project's [Popover](../Popover/README.md), with its short `note` above the problem, fix and result. Names are `mint`, like links. The bundled `Gantt` component doesn't do this yet.

Below `--below-phone` the chart scrolls sideways and the notes above the bars are hidden, leaving them to the popover. A mint `[+]` above each bar (`el-bar-hint`, inside the button) says there's more.

Below `--below-tablet` each row swaps its chips for a muted "N technologies" button (`el-gantt-tech-count`), because a stack of chips in the narrower label column made rows very tall. It opens a small popover with only the chips, separate from the Project's detail popover. Chip icons in the rows and the popover are `ink-muted`, so the Project's name and bar lead the row.

The home page draws one dividing line per whole year (`el-gantt-yearline`, on `el-gantt-track-years`) at that year's true position, with the year label just to its right. Its axis starts one month before the first project, matching the month after the now line. The first label lines up with the start of that project's bar and names the month (`Jun 2022`), because that year is only part-way through. It has no dividing line, which would double up with the label column's border. Below `--below-tablet` the label drops to `2022` to fit. The now label sits left of its line so it stays inside the chart.
