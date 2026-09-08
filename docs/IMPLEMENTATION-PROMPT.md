# Implementation prompt

Copy everything in the block below into a fresh Claude Code session started in
`~/Code/Timaja/larasebek`.

---

Build the Pressence redesign prototype by executing the approved implementation plan.

**Read these first, in this order:**

1. `docs/superpowers/plans/2026-09-08-pressence-prototype.md` — the plan. Fifteen tasks with the actual code in every step.
2. `docs/superpowers/specs/2026-09-08-pressence-redesign-design.md` — the approved spec and the decisions behind it.
3. `source/Zasnova strani.png` — the six-screen mockup you are building to. Look at it before writing any CSS.

Use the `superpowers:subagent-driven-development` skill: one fresh subagent per task, reviewed between tasks. Work the tasks in order, tick the checkboxes as you go, and commit at the end of each task using the commit message given in that task's final step.

**What this is:** a fourteen-page clickable static HTML prototype of a redesigned WordPress site, which also serves as the design-token reference for the Elementor build that follows. Plain HTML and CSS, no build step, no npm, no framework. It must open by double-clicking `site/index.html`.

**Hard constraints — violating any of these makes the output useless:**

- **Copy is final. Take it verbatim from `source/copy.txt`** (Task 1 generates that file). Do not paraphrase, reorder, translate, or improve the Slovenian. It is written in the client's voice.
- **Female verb forms throughout** — `naslovila`, `verjamem`, `pozorna sem`. The current live site uses neutral underscore forms (`povedal_a`, `bil_a`); those are wrong and must never appear.
- **Never emit a `{{TOKEN}}` placeholder.** Seventeen of them are live on production right now and that is the bug we are fixing. If a value is unknown, omit the element and note it in `docs/LAUNCH-BLOCKERS.md`.
- **`site/assets/css/tokens.css` is the only file allowed to contain a literal hex colour.** Everything else references `var(--p-*)`. The checker enforces this.
- **Elementor is on the free tier.** Every `data-el` annotation must name a widget that exists on the free stack: core Elementor widgets, Xpro Elementor Addons free, Xpro Theme Builder, WPForms Lite. No Elementor Pro widgets, no Xpro Advance Accordion (Pro), no per-element Custom CSS (Pro), no Elementor sticky or motion effects (Pro).
- **Do not touch the live site.** `pressence.si` is production. This task produces local files only. Reading the live site for reference is fine; changing it is out of scope.

**Verify continuously:**

```
python3 tests/check_site.py
```

Zero-dependency Python 3 standard library — do not install anything, and do not use `list[str]` or `match` syntax, since the system Python is 3.9. Ten checks across fourteen pages. It must print `All 10 checks passed across 14 pages.` before Task 15 is done. Run it after every task, not just at the end.

**Deliberate product decisions — do not "fix" these:**

- Every image is a placeholder tagged `data-placeholder="true"` with a `data-brief` describing the intended shot.
- Five of the six articles have visibly marked unwritten bodies. Their titles, categories, dates and teasers are final. Do not invent body copy for them.
- The three legal pages are structural scaffolds with headings only.
- The `Samozavedanje` category tab filters to nothing, because none of the six proposed articles is in that category.

**Report at the end:** what passed, what needs the client (contact details, legal copy, a staging install), and offer to publish the prototype as a private Artifact so it can be clicked through on a phone.

If you hit something the plan gets wrong or that contradicts the mockup, stop and say so rather than improvising — the plan is detailed enough that a genuine conflict means one of us misread something.
