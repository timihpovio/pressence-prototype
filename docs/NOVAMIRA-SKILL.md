# Novamira skill file — Pressence Elementor build

Load this before asking Novamira to build any Pressence page.

## Environment

- Novamira runs **directly against production**. It is connected to `https://pressence.si`
  with full management permission and every `novamira doctor` check passing. The earlier
  claim that it deactivates on live URLs was wrong; no staging site is needed. Build in
  place, page by page, so a visitor always lands on either the old page or a finished one.
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
| Theme builder | Xpro Theme Builder, post type `xpro-themer` — see the template table below |
| Forms | WPForms Lite — contact form **50**, *Kontakt — Pressence* |
| Analytics | Google Site Kit |
| Multilingual | Polylang (free) — sl default with no prefix, en registered. **`cs` is registered on the live site and should be removed:** Czech was dropped as a site language on 2026-09-18 |

### Xpro Theme Builder templates

All five are post type `xpro-themer`. **Edit in place** — recreating any of them breaks its
Xpro location assignment and orphans the template.

| ID | Title | `xpro_theme_builder_template_type` | Serves |
|---|---|---|---|
| 36 | Pressence — Glava | `type_header` | `basic-global` — every page. Sticky is enabled on the template |
| 37 | Pressence — Noga | `type_footer` | `basic-global` — every page |
| 48 | Pressence — Arhiv zapisov | `type_archive` | `special-blog`, `post\|all\|archive`, `post\|all\|taxarchive\|category` |
| 49 | Pressence — Zapis | `type_singular` | `post\|all` — every single post |
| 52 | Pressence — 404 | `type_singular` | `special-404` |

WPForms form **50** is likewise edited in place: the Elementor `wpforms` widget on page 26
points at that id, and recreating the form would break the wiring and the notification.

Note that `page_for_posts` was cleared during the rebuild, so `/zapisi/` is page 25 rendering
its own Elementor layout rather than the blog index. Template 48 still serves the
`/category/<slug>/` archives.

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
3. **Edit the existing templates and the form.** Do not create new ones — 36, 37, 48, 49, 52
   and WPForms form 50 are already wired up. See the stack table above.
4. **Preserve every existing URL.** The slug table in `docs/DESIGN-SYSTEM.md` is
   authoritative. WordPress must not mint new slugs.
5. **Copy carries no decoration.** The arrow on "Več o coachingu" and "Preberi zapis" is
   drawn by CSS from the `p-link-arrow` class. Do not type `→` into a widget.
6. **Hand-written CSS goes in one global stylesheet** (Appearance → Customize → Additional
   CSS), with the class applied via each widget's Advanced → CSS Classes field. The classes
   needing CSS are listed in `docs/DESIGN-SYSTEM.md`.

   Three things fight that stylesheet on this stack, and cost real time if you forget them:

   - **Elementor gives every container its own `::before`** (the background overlay) with its
     own `inset`, `width`, `height` and border. Any decorative pseudo-element you hang off a
     container inherits whatever you do not override — a rule that sets only `right` will
     still carry Elementor's `left: 0` and land on the wrong side. Reset the box first.
   - **Elementor and Xpro out-specify two-class selectors.** `.elementor .elementor-element
     ul.elementor-icon-list-items` is (0,3,1); `.elementor-widget-text-editor p:last-child`
     is (0,3,1); WPForms' `textarea.wpforms-field-large` is (0,4,1). Prefix with `body` and
     match their shape, or set the value through the plugin's own CSS variables where it
     exposes them (WPForms does; that is the better route).
   - **Blocksy sets `body { overflow-x: hidden }`**, which makes the body a scroll container
     and silently kills every `position: sticky` on the page. The stylesheet restores
     `overflow: visible`; each bleeding panel clips itself with `overflow-x: clip` instead.

   Because of the first point, the Coaching rail's tinted bleed is painted as a
   `linear-gradient` on the `.p-panel--rail` section rather than as the prototype's
   absolutely-positioned `::before` at `z-index: -1` — same result, no stacking-order risk.

7. **The Coaching rail's scroll-spy is real, and it lives in a core HTML widget.**
   `docs/DESIGN-SYSTEM.md` specifies that the active row is driven by `ui.js`, not by
   Elementor, and there is no free scroll-spy to replace it (Elementor's Scrolling Effects
   are Pro). The prototype's rail logic is therefore ported verbatim into an Elementor
   **HTML** widget — free, and visible as a widget in the builder — sitting in a
   layout-neutral `.p-rail-script` container at the foot of page 24. It sets
   `aria-current="location"` on the row whose section is being read; the stylesheet styles
   `[aria-current]`, and falls back to marking the first row when the script has not run, so
   the rail is never unmarked.

   Keep the active row keyed off `aria-current`. An earlier attempt used `:has(:target)`,
   which only ever moves when the reader *clicks* a rail link and does nothing on scroll.
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
5. `/coaching/` — includes the sticky side-rail nav, the hardest section on the site.
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
| `container:rail-content` | two columns, 220px sticky anchor nav plus body. Under 861px the nav becomes a sticky horizontal strip; the active-state marker is driven by `ui.js`, not by Elementor |
| `container:cta` | full-width container, `Olive` background, `Ivory` text, ghost button, `.p-statement` heading size |
| `container:split-form` | two columns, contact details left, WPForms right |
| `container:article-hero` | the same band as `container:hero`, carrying breadcrumb, `h1` and date |
| `container:article-body` | two columns, body plus a 280px sticky sidebar |
| `container:legal` | boxed narrow container, prose only |
| `elementor-core:accordion` | core Accordion, one item per `<details>` |
| `xpro-post-grid` | Xpro post grid |
| `xpro-button` | Xpro button |
| `image`, `heading`, `text-editor`, `icon-list` | the corresponding core widget |
