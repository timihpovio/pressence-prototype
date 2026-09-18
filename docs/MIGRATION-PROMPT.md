# Migration prompt — prototype to pressence.si

Copy everything below the line into a fresh Claude Code session started in
`~/Code/Timaja/larasebek`.

---

Move the Pressence redesign prototype onto the live WordPress site at `https://pressence.si/`
using the Novamira CLI, building in Elementor free.

## Preflight — do this before anything else

1. `novamira auth status`. The OAuth token is short-lived. If `credentialState` is not
   `fresh`, re-run `novamira auth login 'https://pressence.si/'` before continuing.
2. `novamira doctor --json` — all checks must pass.
3. `novamira run novamira/skill-get --input '{"slug":"novamira-design"}'` and follow it. The
   site's own instructions require this before any visual work.
4. Read, in this order:
   - `docs/DESIGN-SYSTEM.md` — tokens, the widget mapping, the slug table. Authoritative.
   - `docs/NOVAMIRA-SKILL.md` — the Elementor build rules. Authoritative, with the two
     corrections noted under *Doc corrections* below.
   - `docs/ASSETS.md` — every image slot and whether a real asset exists.
   - `docs/LAUNCH-BLOCKERS.md` — what still needs the client.
   - `docs/MULTILINGUAL.md` — read for the slug and menu structure only; you are not
     building EN/CS in this pass.
   - `site/index.html` and `site/coaching.html` — the markup you are porting. Every
     `<section>` carries a `data-el` naming its intended Elementor container or widget.

## Decisions already made — do not reopen these

- **Elementor free is the build surface.** Not Gutenberg, not a child theme. Novamira has no
  Elementor abilities, so pages are written by setting `_elementor_data` post meta through
  `novamira/execute-php` or `novamira/run-wp-cli`. There is no schema validation on the free
  tier, so see *Verify every page* below — this is the main risk in the whole job.
- **Slovenian only, structured for Polylang.** Install and activate Polylang, register
  sl (default, no prefix) / en, and set the URL structure per `docs/MULTILINGUAL.md`.
  Czech was dropped as a site language on 2026-09-18 — do not register `cs`.
  Then build only the Slovenian pages. Do not create EN content — that copy is still
  unreviewed by the client.
- **Build in place, publicly visible.** No maintenance mode, no staging, no draft-and-switch.
  The site is live throughout. Work page by page so that whatever a visitor lands on is
  either the old page or a finished new one — never a half-written one.

## What is on the site right now

Pages (all `publish` unless noted):

| ID | Title | Slug |
|---|---|---|
| 22 | Domov | `domov` — **static front page** (`show_on_front=page`, `page_on_front=22`) |
| 23 | O meni | `o-meni` |
| 24 | Coaching | `coaching` |
| 25 | Zapisi | `zapisi` |
| 26 | Kontakt | `kontakt` |
| 27 | Politika zasebnosti | `politika-zasebnosti` |
| 28 | Politika piškotkov | `politika-piskotkov` |
| 29 | Pravno obvestilo | `pravno-obvestilo` |
| 79 | Elementor #79 | *(draft, no slug — junk, delete it)* |

Posts: six published, IDs 42–47.

Xpro Theme Builder templates (post type `xpro-themer`) and the form:

| ID | Title | Role |
|---|---|---|
| 36 | Pressence — Glava | header |
| 37 | Pressence — Noga | footer |
| 48 | Pressence — Arhiv zapisov | archive |
| 49 | Pressence — Zapis | single post |
| 52 | Pressence — 404 | 404 |
| 50 | Kontakt — Pressence | WPForms Lite form |
| 9 | Default Kit | `elementor_library` — Global Colors and Fonts live here |

## Rebuild scope

You have been authorised to wipe existing content and start clean. Concretely:

**Rebuild the content of** pages 22–29 — replace `_elementor_data` wholesale rather than
patching. **Preserve every post ID and slug**; the URLs are live and must not change.
**Delete** draft page 79.

**Edit in place, never recreate:** templates 36, 37, 48, 49, 52, form 50, and Default Kit 9.
They are already wired into Xpro Theme Builder and WPForms; recreating them breaks the
wiring and orphans the assignments.

**Never touch:** the Novamira plugin, and WordPress user ID 1 or its credentials. Modifying
either severs the connection you are working through. Do not deactivate or delete any other
active plugin either — Blocksy, Elementor, Xpro, WPForms, Site Kit, Cookie Consent and the
accessibility plugin are all load-bearing.

### The posts need a decision from the user before you touch them

The six live posts and the six prototype articles are **different articles with different
slugs**. This is not a rename — it is a replacement:

| Live now (IDs 42–47) | Prototype |
|---|---|
| `kako-prepoznati-da-ste-obticali` | `kdo-ste-ko-odlozite-moram` |
| `premislek-in-premlevanje-nista-isto` | `zakaj-zavedanje-vzorca-se-ni-sprememba` |
| `kaj-lahko-od-coachinga-iskreno-pricakujete` | `coaching-ni-prostor-kjer-dobite-nasvet` |
| `kako-vrednote-tiho-odlocajo-namesto-vas` | `kaj-pomeni-zares-poslusati` |
| `zakaj-jasnost-zahteva-upocasnitev` | `ko-to-kar-je-nekoc-delovalo-ne-deluje-vec` |
| `kako-skozi-spremembo-brez-vseh-odgovorov` | `ni-vam-treba-takoj-vedeti-kaj-sledi` |

Replacing them retires six indexed URLs. **Stop and ask the user** whether to (a) keep the
six live posts and add the new ones alongside, (b) replace them and add 301 redirects from
the old slugs, or (c) replace them and accept the 404s. Do not guess. Also remember that
**five of the six prototype articles have no body copy** — only title, category, date and
teaser are final. Do not invent bodies.

## Build order

1. Global Colors and Global Fonts into Default Kit 9, using the exact labels and hex values
   in `docs/DESIGN-SYSTEM.md`. Everything downstream references these by label.
2. The global stylesheet into Appearance → Customize → Additional CSS. The class list is in
   the *Custom CSS* table of `docs/DESIGN-SYSTEM.md`.
3. Polylang: install, activate, register sl/en/cs, set sl as default with no prefix.
4. Header 36 and footer 37.
5. `/` (page 22) — the widest range of section patterns. Get these right; the rest reuse them.
6. `/coaching/` (24) — includes the sticky side-rail, the hardest section on the site.
7. `/o-meni/` (23), `/kontakt/` (26) — wire 26 to WPForms form 50.
8. Single-post template 49 and archive 48, then the posts (after the user decides above).
9. `/zapisi/` (25) with `xpro-post-grid`. **Verify free-tier taxonomy filtering works.** If it
   does not, link each category tab to its `/category/<slug>/` archive instead.
10. The three legal pages (27, 28, 29) — headings only, per the prototype.

## Hard constraints — violating any of these makes the output useless

- **Copy is final and verbatim** from the prototype HTML. Do not paraphrase, reorder,
  translate or improve the Slovenian.
- **Female verb forms throughout** — `naslovila`, `verjamem`, `pozorna sem`. The live site's
  neutral underscore forms (`povedal_a`, `bil_a`) are the bug; they must not survive.
- **Never emit a `{{TOKEN}}` placeholder.** Seventeen are live in production right now and
  removing them is a core goal. If a value is unknown, omit the element and record it in
  `docs/LAUNCH-BLOCKERS.md`.
- **Never type a hex value into a widget.** Reference Global Colors by label — `Ink`,
  `Olive`, `Body`, `Sage`, `Ivory`, `Panel`, `Muted`, `Line`, `Cream`, `Edge`. A hand-typed
  near-miss fails WCAG silently.
- **Elementor free only.** No Pro widget, no Xpro Advance Accordion, no per-element Custom
  CSS, no Elementor Sticky / Scrolling / Mouse effects. Entrance Animation *is* free and is
  how the reveal-on-scroll layer is built.
- **One prototype `<section>` becomes one Elementor container**, named by its `data-el`.
- **Preserve every existing URL.** The slug table in `docs/DESIGN-SYSTEM.md` is authoritative.
- **Copy carries no decoration** — the `→` on "Več o coachingu" and "Preberi zapis" is drawn
  by CSS from `p-link-arrow`. Never type the character into a widget.
- **Every image is a placeholder** tagged `data-placeholder="true"` with a `data-brief`.
  Reproduce the slot, do not invent or source photography. See `docs/ASSETS.md`.

## Verify every page

Free-tier Elementor does no schema validation, so malformed `_elementor_data` can render
correctly on the front end while being unopenable in the editor. After each page:

1. Load the front end and confirm it renders.
2. **Open it in the Elementor editor and confirm it still opens and is editable.** This is
   the check that actually matters. Do not start the next page until it passes.
3. Confirm no `{{` appears anywhere in the rendered output.

Do not run `tests/check_site.py` against WordPress — it checks the local static prototype,
not the live site. It stays useful as the reference for what "correct" means.

## Report at the end

What is built and verified; what still needs the client (contact details, legal copy, real
photography, the five article bodies, the posts decision); and anything in the docs you found
to be wrong.

## Doc corrections to make as you go

Two things in the repo are now known to be stale. Fix them in the same session:

1. `docs/LAUNCH-BLOCKERS.md` #4 claims *"Novamira cannot run against production — it
   deactivates on live URLs by design"*, and that a staging site is therefore needed. That is
   false: Novamira is connected to production with full management permission and all doctor
   checks passing. Rewrite the finding; it is no longer a blocker.
2. `docs/NOVAMIRA-SKILL.md` names only header 36 and footer 37. Three more templates exist —
   48 (archive), 49 (single post), 52 (404) — plus WPForms form 50. Add them to the stack
   table, and note the post type is `xpro-themer`.

If you hit something the docs get wrong or that contradicts the mockup, stop and say so
rather than improvising.
