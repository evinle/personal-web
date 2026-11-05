# personal-web

Evin Le's personal site: an Astro static frame with small interactive islands, and the design system that styles it.

## Language

**Technology**:
An entry in a central registry (label, icon, optional Note) representing one tool, language or platform. Referenced by id from Stack groups and Projects so a Note only needs editing once.
_Avoid_: Skill, tool, tech

**Stack**:
The set of Technology groups shown in the "Stack" section (e.g. languages, react, angular), each listing Technology ids.
_Avoid_: Toolkit, skills list

**Project**:
One entry in the Experience timeline: a name, start/end dates, tone, a short outcome Note, a detail block (problem, fix, result), and the Technology ids used. Rendered as a Gantt bar.
_Avoid_: Job, role, gig

**Note**:
Short prose attached to a Technology (experience with it) or a Project (outcome), shown in a Popover on click. A Project's Note also sits above its bar where the screen has room.
_Avoid_: Description, comment, blurb

**Popover**:
A card opened from a button, beside it, and closed with Escape or by clicking outside. A Technology's opens its Note; a Project's opens its Note above its detail block.
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

The About page terminal rotates through five commands: `whoami`, `cat stack.yaml`, `nvim how-i-work.md`, `cat qualifications.yaml` and a `curl` for status (not `projects` — Project/Experience data is shown in the Gantt timeline, not the terminal).

**Intro phrase**:
A link in the intro that runs a terminal command instead of navigating, and lights up while that command is active. Without JavaScript it links to the matching section.
_Avoid_: Trigger word, hotlink
