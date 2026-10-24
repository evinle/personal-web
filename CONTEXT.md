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
Short prose attached to a Technology (experience with it) or a Project (outcome), shown in a Popover on click.
_Avoid_: Description, comment, blurb

**Principle**:
One numbered entry in "How I work" — a short name plus explanation of how Evin approaches the job.
_Avoid_: Value, belief

**Whoami record**:
Identity-only structured data behind the terminal's `whoami` command: name, role, employer, since, based, status. Does not include education or certifications — see Qualifications.
_Avoid_: Profile, bio

**Qualifications**:
A separate structured data file behind the terminal's `qualifications` command: education (degree, institution, grade) and certifications. Split out from the Whoami record so `whoami` stays identity-only.
_Avoid_: Credentials, education (as a standalone section)

## Terminal rotation

The About page terminal rotates through exactly three commands: `whoami`, `stack`, `qualifications` (not `projects` — Project/Experience data is shown in the Gantt timeline, not the terminal).
