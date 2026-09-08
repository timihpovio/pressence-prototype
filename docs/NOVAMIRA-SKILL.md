# Novamira skill file — Pressence Elementor build

Load this before asking Novamira to build any Pressence page.

## Environment

- Novamira **deactivates on production URLs** by design. Build on a staging or local
  install, never against `pressence.si`.
- Novamira **free** is sufficient. Elementor pages are written by setting the
  `_elementor_data` post meta through Novamira's PHP and database access. Pro's
  Elementor-aware tooling is not required — the current site was built this way.
- Because free has **no element schema validation**, nothing catches a malformed widget.
  Open every generated page in the Elementor editor and confirm it renders *and stays
  editable* before starting the next one. A page whose `_elementor_data` is subtly wrong
  can look correct on the front end and be unusable in the editor.

## Stack — do not deviate

| Layer | What is installed |
|---|---|
| Theme | Blocksy + blocksy-companion |
| Builder | Elementor **free** — no Pro |
| Addons | Xpro Elementor Addons (free) |
| Theme builder | Xpro Theme Builder — header template 36, footer template 37 |
| Forms | WPForms Lite |
| Analytics | Google Site Kit |

**Forbidden:** any Elementor Pro widget, Xpro's Advance Accordion (Pro), per-element Custom
CSS (Pro), Elementor's Sticky, Scrolling Effects and Mouse Effects (all Pro).

**Allowed, and used by the design:** Advanced → Motion Effects → **Entrance Animation** is in
the free tier, and is how the reveal-on-scroll layer should be built. See *Motion and
interaction* in `docs/DESIGN-SYSTEM.md`. Everything else — every hover and transition — is
plain CSS in the global stylesheet and needs no per-widget setting at all.

## Rules

1. **Never write a hex value into a widget.** Reference the Global Color by label:
   `Ink`, `Olive`, `Body`, `Sage`, `Ivory`, `Panel`, `Muted`, `Line`, `Cream`, `Edge`. Same
   for the Global Fonts `Display`, `Heading`, `Body`, `Label`. See `docs/DESIGN-SYSTEM.md`.
   The contrast the design relies on assumes those exact values — a hand-typed near-miss
   fails WCAG silently.
2. **One prototype `<section>` becomes one Elementor container.** The section's `data-el`
   attribute names the intended widget or container. Read it; do not improvise.
3. **Edit the existing header and footer templates.** Do not create new ones — templates 36
   and 37 are already wired into Xpro Theme Builder and already carry the sticky header.
4. **Preserve every existing URL.** The slug table in `docs/DESIGN-SYSTEM.md` is
   authoritative. WordPress must not mint new slugs.
5. **Copy carries no decoration.** The arrow on "Več o coachingu" and "Preberi zapis" is
   drawn by CSS from the `p-link-arrow` class. Do not type `→` into a widget.
6. **Hand-written CSS goes in one global stylesheet** (Appearance → Customize → Additional
   CSS), with the class applied via each widget's Advanced → CSS Classes field. The classes
   needing CSS are listed in `docs/DESIGN-SYSTEM.md`.
7. **Never emit a `{{TOKEN}}` placeholder.** Seventeen of them are live on production right
   now. If a real value is unknown, leave the element out and record it in
   `docs/LAUNCH-BLOCKERS.md` — do not ship the token.
8. **Female verb forms throughout.** `naslovila`, `verjamem`, `pozorna sem`. The live site's
   neutral underscore forms (`povedal_a`) are wrong and must not be reproduced.
9. **Copy is final.** Take it verbatim from the prototype HTML. Do not paraphrase,
   re-order, or "improve" the Slovenian.

## Per page, in the head

Blocksy or an SEO plugin can emit most of this, but confirm each page ends up with:
`canonical`, `og:type` / `og:site_name` / `og:locale` / `og:url` / `og:title` /
`og:description`, `twitter:card`, `color-scheme`, `theme-color` (equal to `Olive`), and the
SVG favicon. The prototype's `<head>` is the reference.

Set every image below the hero to **lazy** in the Image widget's Advanced settings, and leave
the hero image eager. Every image needs its width and height so nothing shifts on load.

## Build order

1. Global Colors and Global Fonts in Site Settings.
2. The global stylesheet in Additional CSS.
3. Header template 36, footer template 37.
4. `/` — the widest range of section patterns; get these right and the rest reuse them.
5. `/coaching/` — includes the accordion and the sticky rail, the two hardest sections.
6. `/o-meni/`, `/kontakt/`.
7. The Xpro Theme Builder single-post template, then the six posts.
8. `/zapisi/` with `xpro-post-grid`. **Verify free-tier taxonomy filtering.** If it is
   unavailable, link each category tab to its `/category/<slug>/` archive instead.
9. The three legal pages.

## Section pattern vocabulary

The `data-el` values used across the prototype, and what each means:

| `data-el` | Build as |
|---|---|
| `container:hero` | full-width band, min-height set, copy left, photo as a background positioned right with a gradient in the band tint over it. See *Hero bands* in `docs/DESIGN-SYSTEM.md` |
| `container:statement` | boxed container. **Two columns** (`.p-prose-split`) when the prototype markup has a `__head` and a `__body` div; one column with the enlarged `.p-statement` heading when it does not |
| `container:prose` | always the two-column `.p-prose-split`: eyebrow and heading left, body right |
| `container:cards-N` | boxed container, three-column grid of `container:card` |
| `container:card` | inner container, **no border, no background**, a 2px `Line` rule on top only |
| `container:step` | as card, with the step number above the heading in the `Display` font at `clamp(34px, 3.4vw, 46px)`, coloured `Sage` — not a small `Label` |
| `container:compare` | two-column grid, each column an `icon-list` with hairline rows |
| `container:rail-content` | two columns, 220px sticky anchor nav plus body |
| `container:cta` | full-width container, `Olive` background, `Ivory` text, ghost button, `.p-statement` heading size |
| `container:split-form` | two columns, contact details left, WPForms right |
| `container:article-hero` | the same band as `container:hero`, carrying breadcrumb, `h1` and date |
| `container:article-body` | two columns, body plus a 280px sticky sidebar |
| `container:legal` | boxed narrow container, prose only |
| `elementor-core:accordion` | core Accordion, one item per `<details>` |
| `xpro-post-grid` | Xpro post grid |
| `xpro-button` | Xpro button |
| `image`, `heading`, `text-editor`, `icon-list` | the corresponding core widget |
