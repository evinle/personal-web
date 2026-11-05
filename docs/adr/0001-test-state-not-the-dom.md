# Test state as pure logic, and keep browsers for core flows and layout

Everything used to be tested through Playwright against the built site, which made logic slow to iterate on and failures hard to place. We now treat the UI as a side effect of state: pure, dependency-free functions take state and config and return the next state or a view of it, and a thin wrapper (a component, hook or inline script) does nothing but apply that result to the page. Unit tests target the pure functions directly, with no DOM, timers or mocks.

| Layer | Tool | Covers | Speed |
| --- | --- | --- | --- |
| Unit test | Vitest | Pure state and config, such as `timeline.ts`, `terminalView.ts` and `ganttAxis.ts`. Most tests belong here. | Milliseconds |
| Wiring test | Vitest with `jsdom` | That a thin wrapper applies state and forwards events. A few per wrapper. | Tens of milliseconds |
| Flow test | Playwright, `e2e/*.spec.ts` | A core user flow through the built site, including what only the real build proves, such as the no-JavaScript view and inline scripts on real markup. Written with discretion. | Seconds |
| Layout check | Playwright, `e2e/layout.spec.ts` | What only a layout engine can answer, such as wrapping, overlap and overflow. Resizes one page in a loop rather than opening a context per width. | Seconds |

If a test needs a DOM to check logic, move the logic out rather than adding a fixture. If a new Playwright test isn't a core flow or a layout question, it belongs at a lower layer. While iterating, run `npm test`, and run `npm run test:e2e` once before finishing.

## Considered options

- **Playwright for everything.** The highest fidelity, but it made logic the slowest thing to test, and most failures only said that a page looked wrong.
- **`jsdom` for everything below e2e.** Faster, but still couples logic tests to the DOM, and encourages testing logic through hand-written markup that can drift from the real page.
- **Dropping browser layout checks and keeping only core flows.** `jsdom` has no layout engine, and layout was the source of real bugs on this site: clipped popups, split words and overflow at 320px. So they stay, kept separate and small, instead of being passed off as flows.

## Consequences

Fixtures in wiring tests can drift from the markup `about.astro` really renders, so each inline-script wrapper needs at least one flow test on the built page. A test passing against the production build doesn't prove the dev server is serving the same code.
