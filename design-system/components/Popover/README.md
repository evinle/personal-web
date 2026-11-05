# Popover

A card that opens next to the button that triggered it, for a Technology's Note or a Project's detail. Styled like Card, with a `mint` border to lift it off the panels below; flat, so no shadow.

```html
<button type="button" popovertarget="note-react">react</button>

<div id="note-react" popover="auto" class="el-popover">
  <h3 class="el-h3 el-h">React</h3>
  <p class="body el-text" style="margin:0">The body is anything, including a link.</p>
</div>
```

The browser does the work through the native `popover` attribute, so it works without JavaScript:

- Clicking the trigger toggles it. Opening one closes any other.
- Esc or clicking outside closes it, and focus goes back to the trigger.
- It renders in the top layer, so a scrolling or sticky parent can't clip it.

**Placement.** CSS anchor positioning puts it below its trigger, or above if there's more room there, and it scrolls inside itself if neither side fits. Its anchor is the trigger that opened it, so several triggers can share one popover. Below `--below-phone` it centres on the screen. Without anchor positioning it centres in the space below the nav. Without popover support it shows in the page where it was written, so keep that spot readable.

**The sticky nav.** The top layer paints over the whole page, so `z-index` can't put a popover under the nav. A popover opens clear of the nav using `--nav-height`, and `src/lib/popoverEnhancements.ts` closes it if the page scrolls it into the nav or past the bottom of the screen, or squeezes it below 120px against its trigger. One that opened smaller than that, like a short Note, stays open until it shrinks. Without JavaScript it opens normally but can overlap the nav while scrolling.

**Compact.** Add `el-popover-compact` for something short, such as a list of chips. It's only as wide as its content and lines up with the left of its trigger, including on phones. It has no heading, so give it an `aria-label`.

**Rules**

- The trigger is a real `<button>`. Don't offer one when there's nothing to show: a Technology with no Note is a plain chip.
- Don't set `display` on `.el-popover`. That overrides the rule hiding a closed popover.

On the home page, `src/components/Popover.astro` renders this. The React bundle has no Popover, because no island needs one.
