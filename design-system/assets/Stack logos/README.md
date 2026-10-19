# Stack logos

Technology logos for tags, the stack list and project cards. Single ink: every file here is filled `#767c9d` (Poimandres grey) so it reads on both themes as an `<img>`. In the site, inline the SVG and set `fill: currentColor` (the `el-icon` class does this) so it takes `ink-muted`, or `blue` inside an `el-stack` chip.

- Source: [Simple Icons](https://simpleicons.org) (CC0) first. Simple Icons has dropped some trademarks, so C#, SQL Server, Azure, AWS and Playwright come from [Devicon](https://devicon.dev)'s `plain` variants (MIT). AWS is Devicon's plain wordmark, the only plain form it ships.
- Never use brand colours; a logo is always one token colour.
- Never draw or approximate a logo. A technology with no logo in either set (Zustand, AG Grid, Highcharts, Bryntum, EF Core, LINQ, MediatR) is a text-only chip.
- Size: 14px in chips, 16px inline, 28px in grids. Path data is unchanged from the source; only the fill was set.
