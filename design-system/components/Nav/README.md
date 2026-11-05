# Nav

The site header: `/home/evinle` wordmark, mono links with the current page in `mint` behind a cream `> `, then GitHub and theme-switch IconButtons.

- `current` names the active link; `links` overrides `{ label, href }[]`; `githubHref`; `onToggleTheme` handles the theme button.
- Below `--below-phone` the links take their own scrolling row and the tool buttons sit beside the wordmark.
- It sticks to the top of the screen, on an opaque `surface` ground above the Gantt's pinned labels. `--nav-height` on `html` keeps section links and popovers from landing under it, so update it if the nav's height changes.
- The site's header has only the theme button: GitHub is linked from the footer and the home page's Get in touch section.
