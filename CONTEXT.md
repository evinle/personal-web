# personal-web

Evin Le's personal site: an Astro static frame with small interactive islands, and the design system that styles it.

## Language

**Home page**:
The site's one full page, at `/`: who Evin is, measured results, Experience, Principles, Qualifications, Stack and contact. It takes the place of a separate About page until there's writing to give home its own job; `/about` redirects here.
_Avoid_: About page, landing page

**Technology**:
An entry in a central registry representing one tool, language, platform or practice. It has a label, and can have an icon, a Proficiency and a Technology Note. Stack groups and Projects refer to it, so its details only need editing once.
_Avoid_: Skill, tool, tech

**Proficiency**:
How well Evin knows a Technology: Strong, Comfortable or Familiar. Practices don't have one.
_Avoid_: Skill level, rating

**Project count**:
How many Projects on the site used a Technology. Always worked out from the Projects, never written by hand. A Technology on no Project has no Project count, rather than a count of zero.
_Avoid_: Experience, usage

**Stack**:
The set of Technology groups shown in the "Stack" section (e.g. languages, react, angular), each listing Technology ids.
_Avoid_: Toolkit, skills list

**Project**:
One entry in the Experience timeline: a name, start/end dates, tone, a Project Note, a detail block (problem, fix, result), and the Technologies it used. Rendered as a Gantt bar.
_Avoid_: Job, role, gig

**Technology Note**:
Evin's own thoughts on a Technology, in a sentence or two. A Technology with one opens a Popover from its chip; one without stays a plain chip.
_Avoid_: Description, comment, blurb

**Project Note**:
A Project's outcome in a short line, set above its bar where the screen has room and at the top of its Popover.
_Avoid_: Description, comment, blurb

**Popover**:
A card opened from a button, beside it, and closed with Escape or by clicking outside. A Technology's shows its Proficiency, Project count and Technology Note; a Project's shows its Project Note above its detail block.
_Avoid_: Tooltip, modal

**Principle**:
One numbered entry in "How I work" — a short name plus explanation of how Evin approaches the job.
_Avoid_: Value, belief

**Whoami record**:
Identity-only structured data behind the terminal's `whoami` command: name, role, employer, since, based, status. Does not include education or certifications — see Qualifications.
_Avoid_: Profile, bio

**Qualifications**:
A separate structured data file behind the terminal's `qualifications` command: education (degree, institution, grade) and certifications. Split out from the Whoami record so `whoami` stays identity-only.
_Avoid_: Credentials, education (as a standalone section)

## Testing

See `docs/adr/0001-test-state-not-the-dom.md` for how these fit together.

**Unit test**:
A test of pure state or config, with no DOM, timers or mocks. The UI is a side effect of that state, so this is where logic is tested.
_Avoid_: Component test, integration test

**Thin wrapper**:
Code that applies state to the page and forwards events, with no decisions of its own.
_Avoid_: Container, smart component

**Wiring test**:
A `jsdom` test that a thin wrapper applies state and forwards events.
_Avoid_: Unit test, component test

**Flow test**:
A Playwright test of a core user flow through the built site.
_Avoid_: UI test, end-to-end test (for anything that isn't a core flow)

**Layout check**:
A Playwright test of something only a layout engine can answer, such as wrapping, overlap or overflow.
_Avoid_: Visual test, flow test

## Terminal rotation

The home page terminal rotates through five commands: `whoami`, `cat stack.yaml`, `nvim how-i-work.md`, `cat qualifications.yaml` and a `curl` for status (not `projects` — Project/Experience data is shown in the Gantt timeline, not the terminal).

**Intro phrase**:
A link in the intro that runs a terminal command instead of navigating, and lights up while that command is active. Without JavaScript it links to the matching section.
_Avoid_: Trigger word, hotlink
