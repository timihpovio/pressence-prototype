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
CSS (Pro), Elementor sticky and other motion effects (Pro).

## Rules

1. **Never write a hex value into a widget.** Reference the Global Color by label:
   `Ink`, `Olive`, `Body`, `Sage`, `Ivory`, `Panel`, `Muted`, `Line`. Same for the Global
   Fonts `Display`, `Heading`, `Body`, `Label`. See `docs/DESIGN-SYSTEM.md`.
2. **One prototype `<section>` becomes one Elementor container.** The section's `data-el`
   attribute names the intended widget or container. Read it; do not improvise.
3. **Edit the existing header and footer templates.** Do not create new ones — templates 36
   and 37 are already wired into Xpro Theme Builder and already carry the sticky header.
4. **Preserve every existing URL.** The slug table in `docs/DESIGN-SYSTEM.md` is
   authoritative. WordPress must not mint new slugs.
5. **Hand-written CSS goes in one global stylesheet** (Appearance → Customize → Additional
   CSS), with the class applied via each widget's Advanced → CSS Classes field. The classes
   needing CSS are listed in `docs/DESIGN-SYSTEM.md`.
6. **Never emit a `{{TOKEN}}` placeholder.** Seventeen of them are live on production right
   now. If a real value is unknown, leave the element out and record it in
   `docs/LAUNCH-BLOCKERS.md` — do not ship the token.
7. **Female verb forms throughout.** `naslovila`, `verjamem`, `pozorna sem`. The live site's
   neutral underscore forms (`povedal_a`) are wrong and must not be reproduced.
8. **Copy is final.** Take it verbatim from the prototype HTML. Do not paraphrase,
   re-order, or "improve" the Slovenian.

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
| `container:hero` | full-width container, two columns, text left, bleeding image right |
| `container:statement` | boxed container, single narrow column, heading plus paragraphs |
| `container:prose` | as statement, longer body |
| `container:cards-N` | boxed container, three-column grid of `container:card` |
| `container:card` | inner container, `Line` border, `Ivory` background |
| `container:step` | as card, with an `01`-style `Label` number above the heading |
| `container:compare` | two-column grid, each column an `icon-list` with hairline rows |
| `container:rail-content` | two columns, 220px sticky anchor nav plus body |
| `container:cta` | full-width container, `Olive` background, `Ivory` text, ghost button |
| `container:split-form` | two columns, contact details left, WPForms right |
| `container:article-hero` | breadcrumb, `h1`, date, then a full-bleed 21:9 image |
| `container:article-body` | two columns, body plus a 280px sticky sidebar |
| `container:legal` | boxed narrow container, prose only |
| `elementor-core:accordion` | core Accordion, one item per `<details>` |
| `xpro-post-grid` | Xpro post grid |
| `xpro-button` | Xpro button |
| `image`, `heading`, `text-editor`, `icon-list` | the corresponding core widget |
