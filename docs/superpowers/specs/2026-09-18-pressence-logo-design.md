# Pressence logo — design

**Date:** 2026-09-18
**Status:** approved, with three items awaiting the client (see *Open questions*)

Replaces the plain-text wordmark (`.p-logo` / `.p-footer__logo`, currently the string
"Pressence" set in EB Garamond) with a constructed lockup, an endorsement line, and a new
monogram for the favicon.

## Why this shape

The name already carries the idea and the site already explains it — `site/index.html:56`:

> *Pressence* povezuje *presence* — prisotnost, in *essence* — bistvo.
> Med njima je prostor.

The mark makes that literal. `SENCE` is drawn once and belongs to both words; `PRE` and `ES`
stack into its left flank, so the top line reads **PRESENCE**, the bottom **ESSENCE**, and the
block **Pressence**. A hairline sits in the gap between the stacked fragments — *"med njima je
prostor"*, drawn.

## The lockup

Every dimension derives from one custom property, `--p-logo-sz`, which is the type size of
`SENCE`. Nothing else is set in absolute units, so the mark holds its proportions at any scale.

| Part | Value |
|---|---|
| `SENCE` | `1.00 × sz`, EB Garamond **400**, letter-spacing `0.02em`, line-height `0.70` |
| stack box | height `1.06 × sz`, flex column, `justify-content: space-between` |
| stack type | `0.52 × sz`, EB Garamond **500**, line-height `0.70`, letter-spacing `0.035em`, right-aligned |
| stack → `SENCE` gutter | `0.085 × sz` |
| hairline | `1px currentColor`, opacity `0.45`, at 50% of the stack box, spanning the stack's width |
| byline | `0.38 × sz`, EB Garamond **italic 400**, opacity `0.80`, flush **right**, `0.10 × sz` below `SENCE` |

Two of these were tuned against rendered output rather than chosen on paper, and should not be
changed without re-checking at 24px:

- **The stack is 500, not 400.** At small sizes a 400 stack loses its colour against `SENCE` and
  the mark reads as one big word with something faint beside it. 500 holds; 600 reads as bolded
  at display size.
- **The stack is `0.52 × sz`, not `0.455`.** Weight alone did not close the gap; size and weight
  together did.

The layout is a two-column grid so the byline can hang off `SENCE`'s left column and align to
its **right** edge — giving the lockup one flush margin. The left edge stays deliberately ragged,
because the stack is narrower than `SENCE`.

`currentColor` on the hairline and the byline is load-bearing: it is what lets a single master
reverse out of the Olive footer without a second file. An earlier draft fixed the byline to
`Muted` and it disappeared on the dark ground.

## Forms and sizes

Three forms — the primary lockup, its two chrome sizes, and the monogram.

| Form | Where | Setting |
|---|---|---|
| Primary lockup | display, off-site, the standalone file | `--p-logo-sz` free |
| Header | every page | `sz: 30px`; header vertical padding `20px → 14px` so the band grows from 64px to ~76px rather than ~88px |
| Footer | every page | `sz: 32px`, reversed |
| Monogram | favicon, social avatar | `LK`, Ivory on Olive, EB Garamond **500**, letter-spacing `0.04em` |

There is **no closed or reduced variant** of the wordmark. The open mark was tested at 24px and
holds; a second master was considered and rejected.

The monogram is deliberately plain — no hairline. It is rendered at 16px on a tab strip and 48px
as an avatar, never large, and at those sizes robustness beats expression. Ruled variants were
built and tested; the rule lands as a row of grey pixels at 16px rather than degrading cleanly.

## Colour

No new values. `Ink` on `Ivory`/`Cream` in the header, `Ivory` on `Olive` in the footer, both
already in `tokens.css`. The hairline and byline derive from `currentColor`, so contrast follows
the ground automatically: the byline lands at roughly 7.4:1 on Ivory and 6.4:1 on Olive, both
clearing AA at their size.

## How it is built

Two deliverables, because the site and the outside world need different things.

**In the site chrome — live text, not an image.** The header and footer render the mark as styled
spans, as `.p-logo` already does. It stays real text: crisp at every DPI, scales with the type
system, inherits colour for the footer reversal, costs no request, and — because the geometry is
entirely `em`-relative — holds its proportions in the Georgia fallback if EB Garamond is slow.

For the Elementor build this stays inside the free tier: an HTML widget inside the Xpro header
template (36) and footer template (37), styled from the one global stylesheet, per the constraint
in `docs/NOVAMIRA-SKILL.md`.

**As a portable asset — SVG with the type converted to outlines.** No font dependency, so it is
correct in email, on Instagram, in a PDF and in someone else's deck. Plus a 2000px PNG for
anything that will not take SVG.

**Outlining needs a tool this project does not have.** There is no design application here and
`fontTools` is not installed; the project is deliberately Python-3-stdlib-only (`README.md`,
`tests/check_site.py`).

The decision: a generator script under `tools/` reads the EB Garamond TTF and writes the path
data, with `fontTools` as a **build-time dependency only** — never imported by the site or by
`tests/check_site.py`, so the stdlib-only guarantee that matters (the checker) is untouched. The
generated SVGs are committed, so nobody needs the tool to *use* the logo, only to regenerate it.
This is the first task in the plan, because both SVG deliverables and the favicon depend on it.

Rejected alternative: an SVG carrying `<text>` plus a webfont reference. Smaller, no tooling — but
it fails silently wherever the font does not load, which is most of the places a portable logo
goes.

The favicon has the same constraint — a favicon cannot rely on a webfont, so `LK` must ship as
outlines too.

## Accessibility

The construction reads as "PRE ES SENCE" to a screen reader, which is gibberish. So:

- the header and footer link carries `aria-label="Pressence"` — the site name alone, because it is
  a link to the home page, not a credit line — and **every** visual span inside it, the byline
  included, is `aria-hidden="true"`
- the standalone SVG carries `role="img"` and a `<title>` of `Pressence — with Lara Kaiser`, the
  full mark, because there it is an image of the logo rather than a navigation control
- the monogram SVG carries `role="img"` and a `<title>` of `Pressence`
- contrast is unchanged from the current design; nothing here touches a token

## What changes

| File | Change |
|---|---|
| `site/assets/js/chrome.js` | the header and footer logo markup |
| `site/assets/css/site.css` | `.p-logo`, `.p-footer__logo`, the new lockup rules, header padding |
| `site/assets/css/tokens.css` | `--p-logo-sz` header and footer values |
| `site/assets/svg/favicon.svg` | replaced with the `LK` monogram |
| `site/assets/svg/pressence-logo.svg` | new — primary lockup, outlined |
| `site/assets/svg/pressence-monogram.svg` | new — `LK`, outlined |
| `docs/ASSETS.md` | the Brand SVGs table |
| `docs/DESIGN-SYSTEM.md` | the logotype row in Global Colors, and the custom-CSS class table |

## Verification

- `python3 tests/check_site.py` must stay green. Baseline before this work: **13 checks, 22 pages,
  all passing.** The relevant traps are the no-hardcoded-colour rule (the new CSS must reference
  tokens only) and alt-text coverage if any `<img>` is introduced.
- The mark must be read at 24px, 30px and display size before the work is called done — every
  decision in this spec was made against rendered output, not against description.
- No horizontal overflow at 390, 768, 1024, 1440, 1920, per the existing reflow requirement. The
  header now carries a two-deck mark, so the 390px and 768px cases are the ones at risk.

## Open questions

These do not block implementation. Build with **`with Lara Kaiser`**; the first is a one-string
change if it comes back differently.

1. **The connector word.** `with` / `by` / no connector. Recommendation is **`with`**: her
   Slovenian is written in the dual throughout — *spoznava se, začneva, preveriva, poimenujeva,
   pogledava globlje, raziskujeva, poveževa, prilagajava* — the form that exists only for two
   people acting together, and explicitly *"da lahko skupaj preveriva, kaj pomeni za vas."* `by`
   frames her as author and the reader as audience, which the copy spends every verb declining.
   `with` also has an idiomatic Slovenian form, *z Laro Kaiser*, where `by` has none.
2. **The footer tagline.** With the name on the mark, the footer carries three decks — mark, name,
   *"Prostor za jasnejši stik s sabo."* One too many. Either the tagline moves to the second
   footer band beside the legal links, or it comes out.
3. **The spelling of the name.** Her name appears nowhere in the copy, the prototype or the live
   site — every page is first-person. "Lara Kaiser" arrived verbally and the only other surname in
   this project is the directory name, `larasebek`. **Confirm in writing before anything is cut to
   final.**

Client-facing presentation of 1 and 2: https://claude.ai/artifact/CYv1UtZp4U3sufKtTeYnvq
