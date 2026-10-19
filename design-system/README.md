# Evin Le — design system

The design system for Evin Le's personal site. The subject is going deep: taking a problem apart until it is clear how it works, then making it faster. The look follows: a quiet, muted, code-editor surface where pastel neon only appears at the point of insight.

## Voice

- Precise and plain. Say what was measured, how, and what changed.
- Numbers over adjectives: "p99 down from 41ms to 9ms", not "much faster".
- Show the work: commands, flame graphs, the dead ends too.
- Don't: hype, exclamation marks, emoji, "simply", "just".

## Visual foundations

**Muted first, neon earned.** The palette is Poimandres: the default theme's `#1b1e28` in dark and Poimandres White in light. Around 95% of any screen is `surface`, `surface-raised`, `ink` and `ink-muted`. The accents mark the thing worth looking at: the link, the active item, the highlighted line, the number that moved. If more than a few things glow, none do.

- `mint` is the primary accent: links, active nav, the fix, the "after" value, the highlighted code line (on `mint-soft`).
- `pink` is the problem: the "before" value, hot paths, wasted work in diagrams.
- `blue` is structure: tags, keywords in code, commit hashes, depth labels.
- `cream` is signal, used small: the `## ` heading marks, numbers in code, the nav's `> ` marker.
- Every accent comes in two forms. The plain token (`mint`) is for TEXT and is darkened in light to stay above 4.5:1. The `-fill` token (`mint-fill`) is for SHAPES and backgrounds: the primary button, cover bands, diagram marbles, the cursor. In light the fills are Poimandres White's full neons; text on any fill is `on-fill`.
- Before → after always reads `pink` → `mint`.
- `line` is for hairlines only; it is below 3:1, so controls get a visible border from `ink-muted`.

**Dark is the primary theme.** Panels (`surface-raised`) sit slightly darker than the page in dark, like an editor's terminal, and slightly grey in light. All text tokens pass 4.5:1 on both surfaces in both themes.

**Depth motif.** Indentation is the visual metaphor: nested content steps right by `space-8`, like a call stack or a stack trace. Use it for asides, footnotes and "how this works underneath" blocks.

**Flat.** No shadows, gradients or glows. Separation comes from `surface-raised` and `line` hairlines.

## Type

Two families. **Sauce Code Pro Nerd Font** (Source Code Pro patched with Nerd Font glyphs, the VS Code favourite) for display, headings, labels, code and icons; **IBM Plex Sans** for long-form prose.

- The mono face is self-hosted from `fonts/`: the Nerd Font **Propo** build (letters stay monospaced, icons keep their natural width so they don't overhang), Regular 400, Medium 500 and SemiBold 600 as woff2, each SUBSET to Latin, box drawing and the icon glyphs the site uses (about 23 KB each, down from about 1 MB for the full Nerd Font). Licence: SIL OFL 1.1 (`fonts/SauceCodePro-LICENSE.txt`); the glyphs are Devicons (MIT) and Codicons (CC BY 4.0).
- `components/bundle.css` embeds the same three subset faces as data URIs under the family `SauceCodePro NF Web`, so glyph icons render anywhere the stylesheet loads, with no font URL to resolve. `--font-mono` lists it first, then the `fonts/` files (`SauceCodePro NF`), then Source Code Pro and the system mono; text survives a failure, icons would not.
- IBM Plex Sans loads from Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

Headings may carry a markdown-style prefix in `cream` (`## `) to keep the editor feel. Labels are uppercase mono with wide tracking.

## Spacing and shape

A 4px grid (`space-1` 4, `space-2` 8, `space-4` 16, `space-8` 32). Corners are tight. Code-adjacent surfaces are square (`radius-none`): the terminal panel, code blocks, inline code, diagrams and stack chips. Otherwise `radius-xs` 2px for tags, `radius-sm` 4px for controls, `radius-md` 6px for cards.

## Iconography and logo

No logo yet: the wordmark is `/home/evinle` set in the mono face at 600, the `/home/` in `ink-muted`. Terminal title bars read `zsh · /home/evinle`.

- **Icons are font glyphs.** The mono face carries Devicons for the stack (React, .NET, Azure, AWS, PostgreSQL...) and Codicons, VS Code's own set, for the interface (terminal, copy, history, link-external, color-mode). Write `<i class="nf" aria-hidden="true">&#x....;</i>` beside a label; it inherits colour and sits on the text baseline. The StackIcons card lists every glyph in the subset.
- Stack glyphs are one colour: `ink-muted`, or `blue` in an `el-stack` chip. No brand colours.
- No glyph in the set means a text-only chip. Never redraw a logo or borrow a lookalike.
- The SVG asset groups (Stack logos from Simple Icons and Devicon, UI icons from Lucide) are the fallback for places without the font: social images, slides, email.

## Components

Build pages from the components in `components/bundle.js` (`window.EvinLe`, React 18), never by hand-writing the markup. Each component renders the `el-*` classes in `components/bundle.css`, which reads every value from the tokens.

- **Foundations:** `Glyph` (Nerd Font icon by name), `Heading` (1 display, 2 with `## `, 3 mono title), `Text` (body, lead, small), `Label` (uppercase mono metadata), `Link` (inline, mono, external), `InlineCode`.
- **Actions:** `Button` (primary mint fill once per view, otherwise outline), `IconButton` (glyph + required label).
- **Tags:** `Chip` (glyph looked up from the label, text only when there is none), `ChipList`.
- **Containers:** `Card` (raised, `radius-md`), `Section` (heading + action), `Terminal` (square, with `Prompt` and `Cursor`; the command always sits in the body, never the title bar), `JsonOutput` (jq-coloured JSON for terminal output), `KeyValueList`, `Page`.
- **Content:** `CodeBlock` (numbered, one highlighted line), `Metric` / `Metrics` (before in `pink` → after in `mint`), `Investigation` (symptom → cause → fix → result, each step deeper), `PostList`, `Aside` ("one layer down"), `DecisionRecord`, `Table`.
- **Diagrams:** `Figure` (square frame + caption), `MarbleDiagram`, `Gantt` (parent summary bar, child tracks indented one level, now line).
- **Chrome:** `Nav`, `Footer`.

Rules that hold across them:

- Code-adjacent things are square (`radius-none`): Terminal, CodeBlock, InlineCode, Figure, Table, Chip. Cards and buttons are barely rounded.
- One primary Button per view. Icons always sit beside a label; icon-only controls are IconButtons with a label.
- Numbers that moved are a Metric or coloured spans: before `pink`, after `mint`, measured and hedged (`~500ms`).
- Diagrams fill with the `-fill` tokens, put `on-fill` text on them, and say in the caption what the colours mean.
- The Pages group (LandingPage, BlogPost, AboutPage) shows the components composed into real pages; their sources are in `components/src/`.

Copy is written in Evin's voice: first person, causes always given ("because backend and database share a VPC"), numbers hedged the way they were measured, trade-offs named.
