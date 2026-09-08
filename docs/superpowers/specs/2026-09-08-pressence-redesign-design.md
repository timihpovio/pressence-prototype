# Pressence redesign — clickable HTML prototype

**Date:** 2026-09-08
**Status:** approved, ready for implementation planning

## Purpose

Build a complete, clickable static HTML prototype of the redesigned pressence.si so the
final result can be reviewed and approved before any WordPress work begins. The prototype
is also the source of truth for the design tokens that will become Elementor global styles.

The prototype is **not** a conversion source. Novamira does not import HTML. It builds
Elementor structures from natural-language descriptions plus a documented design system.
The prototype therefore has two jobs:

1. A visual contract the client clicks through and approves.
2. A token and structure reference precise enough that the Elementor build is mechanical.

## Context

### The existing site

pressence.si already runs **WordPress 7.1 + Elementor 4.2.1** (LiteSpeed, PHP 8.3, Google
Site Kit). Current fonts are Fraunces + Manrope. Visually it is the inverse of the new
design: dark charcoal with gold accents, where the new design is warm ivory with a deep
olive footer.

Existing URLs, all of which the redesign preserves:

```
/  /o-meni/  /coaching/  /zapisi/  /kontakt/
/category/<slug>/
/politika-zasebnosti/  /politika-piskotkov/  /pravno-obvestilo/
```

### The WordPress stack (verified on the live site)

Elementor is on the **free** tier — no Elementor Pro assets are loaded anywhere. Every gap
that would normally force Pro is already covered by plugins that are installed and in use:

| Need | Elementor free | What the site actually uses |
|---|---|---|
| Header / footer templates | Pro only | **Xpro Theme Builder** (`data-elementor-type="xpro-themer"`, template IDs 36 and 37, sticky header already enabled) |
| Navigation menu | Pro only | `xpro-horizontal-menu` |
| Contact form | Pro only | **WPForms Lite**, embedded via the `wpforms` widget |
| Blog listing | Pro only | `xpro-post-grid` |
| Buttons | core has one | `xpro-button` |
| Global colours and fonts | **free** | Elementor Site Settings — the token strategy is unaffected |

Theme: **Blocksy** + blocksy-companion. Addons: **Xpro Elementor Addons** (free tier).
Core free widgets already in use: `heading`, `text-editor`, `image`, `icon-list`,
`divider`, `social-icons`.

No design change follows from the free tier. What changes is the widget vocabulary the
Elementor build must use, recorded below and in `NOVAMIRA-SKILL.md`.

### Design inputs

- `source/Zasnova strani.png` — six-screen mockup: Domov, Coaching, O meni, Zapisi
  (index), Zapis (single), Kontakt, plus the footer.
- `source/Pressence Coaching Website Copy.docx` — full Slovenian copy for all five pages,
  six proposed blog categories, six proposed article titles with teasers, a single-article
  template, and footer copy.

### Content restored from the live site

The new copy doc is better written than the live site but drops several strong sections.
These are restored, rewritten in the new copy's warmer voice, on the Coaching page:

1. **Oblike sodelovanja** — the four formats (uvodni pogovor, posamezno srečanje, coaching
   pot, dolgoročno partnerstvo). Without these a visitor never learns how to work with her.
2. **Praktično / Kaj pričakovati** — session length, location, frequency, confidentiality,
   preparation, progress reviews, cancellation policy.
3. **Pogosta vprašanja** — 11 questions. The largest single loss in the new copy, and the
   most valuable for both conversion and search.

Also carried over: the *Coaching je / Coaching ni* two-column comparison (stronger than the
doc's plain bulleted list), the *Pogosta področja* topic tags, and the SI/EN language note.

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Build approach | Plain static multi-page HTML, one tokenised stylesheet, shared `chrome.js` for header/footer | Opens by double-clicking; no build step or toolchain for the client; fourteen pages does not justify Astro/11ty |
| Content scope | Restore formats, practical details and FAQ | Site otherwise has no offer structure and no reassurance layer |
| Imagery | Free stock matching the mockup's mood, every slot tagged as placeholder, inventoried in `ASSETS.md` | Real assets do not cover the mockup's still lifes or its warm editorial portrait |
| Typography | EB Garamond (display/headings) + Inter (body/UI) | Matches the mockup; the mockup's serif is Garamond-style, not the Fraunces currently configured |
| Blog depth | One full article, five structured stubs | Doc supplies teasers only; writing her personal reflections wholesale would be rewritten anyway |
| Nav order | `Domov · Coaching · O meni · Zapisi · Kontakt` | Follows the mockup, which puts what she does ahead of who she is |

## Design system

Token names match the Elementor global styles to be created, so the Novamira skill file is
a read-off rather than a translation. This is the documented mitigation for Novamira's
known failure mode of hardcoding hex values instead of referencing globals.

### Global colours

| Elementor label | Slot | Hex | Role |
|---|---|---|---|
| `Ink` | Primary | `#1E1F1B` | headings, logotype |
| `Olive` | Secondary | `#3A4032` | footer, primary button |
| `Body` | Text | `#4A4C45` | body copy |
| `Sage` | Accent | `#D7D6CC` | accent panels, active states |
| `Ivory` | custom | `#FAF8F5` | page ground, cards |
| `Panel` | custom | `#EEECE8` | secondary panels, side rails |
| `Muted` | custom | `#71736A` | meta, labels, captions |
| `Line` | custom | `#E2DFD8` | hairlines, field borders |

Values sampled directly from `source/Zasnova strani.png` by region median.

### Global fonts

| Elementor label | Family | Weights | Use |
|---|---|---|---|
| `Display` | EB Garamond | 400 | `h1`, hero statements, logotype |
| `Heading` | EB Garamond | 400/500 | `h2`–`h4` |
| `Body` | Inter | 400 | paragraphs, lists |
| `Label` | Inter | 500 | uppercase eyebrow labels, `letter-spacing: .08em` |

Both are Google Fonts, so Elementor loads them natively with no custom upload.

**Resolved inconsistency:** the mockup sets the intro paragraph in a sans on screen 01 and
in the serif on screen 02. The prototype standardises on **Inter for body copy**, reserving
EB Garamond for headings and hero statements.

### Layout

- Every page is a vertical stack of full-bleed panels.
- Each panel holds a `1160px` centred container.
- Panels alternate `Ivory` / `Panel` / `Sage`, separated by `Line` hairlines.
- Images bleed to the panel edge rather than sitting inside container padding.
- Panel padding `clamp(64px, 9vw, 128px)`; `h1` `clamp(40px, 5vw, 64px)` at
  `line-height: 1.15`.

Generous emptiness is load-bearing in this design, not decoration. Vertical rhythm is the
first thing to protect if something has to give.

### Elementor mapping

Each prototype section carries a `data-el` attribute naming its intended Elementor
container or widget, so the mapping survives out of my head and into the markup. The
attribute values name **widgets available on this site's free stack**, never Pro widgets:

| Prototype element | Elementor target |
|---|---|
| Site header, footer | Xpro Theme Builder templates 36 / 37 — edit in place, do not rebuild |
| Main navigation | `xpro-horizontal-menu` |
| Page section | Elementor container (flex), free |
| `h1`–`h4` | core `heading` |
| Paragraphs | core `text-editor` |
| Bulleted lists (Kako delam, Coaching ni) | core `icon-list` |
| Images | core `image` |
| Panel hairlines | core `divider` |
| CTAs | `xpro-button` |
| FAQ, 11 items | **core Elementor Accordion** — Xpro's Advance Accordion is Pro |
| Zapisi index + category filter | `xpro-post-grid` |
| Single article | Xpro Theme Builder single template |
| Contact form | WPForms Lite form, embedded via the `wpforms` widget |
| Footer social links | core `social-icons` |

Two consequences of the free tier for the build:

- **Per-element Custom CSS is Pro only.** Anything needing hand-written CSS — the sticky
  side-rail on the Coaching page, panel edge bleeds, the `clamp()` type scale — gets a CSS
  class on the element and a rule in one global stylesheet (Blocksy's Additional CSS), not
  an inline Custom CSS field.
- **Sticky is a Pro motion effect.** The Coaching side-rail uses `position: sticky` from
  that global stylesheet instead. The header's stickiness already comes from Xpro, not
  Elementor.
- `xpro-post-grid` loads cubeportfolio, which suggests taxonomy filtering is available on
  the free tier. To be verified during the build; if it is not, the Zapisi category filter
  falls back to linking each tab to its `/category/<slug>/` archive.

## Sitemap

| URL | File | Page |
|---|---|---|
| `/` | `index.html` | Domov |
| `/coaching/` | `coaching.html` | Coaching |
| `/o-meni/` | `o-meni.html` | O meni |
| `/zapisi/` | `zapisi.html` | Zapisi index, working category filter |
| `/zapisi/<slug>/` | 6 files | Article pages |
| `/kontakt/` | `kontakt.html` | Kontakt |
| `/politika-zasebnosti/` | `politika-zasebnosti.html` | Legal |
| `/politika-piskotkov/` | `politika-piskotkov.html` | Legal |
| `/pravno-obvestilo/` | `pravno-obvestilo.html` | Legal |

Fourteen pages total (four top-level, six articles, one contact, three legal).
`/pravno-obvestilo/` is retained in the footer even though the new
copy's footer lists only two legal links — the page exists on the live site and dropping
the link would orphan a live URL.

## Page section plans

**Domov** — Hero · Uvodno vprašanje · Morda ste trenutno tukaj (6 cards) · Kaj je coaching ·
Kaj vam lahko coaching prinese (6) · Moj način dela · O meni kratko · Kako poteka (5 steps) ·
Zaupanje · Zapisi · Zaključni CTA

**Coaching** — Hero · sticky side-rail nav alongside Kaj je coaching · Moja filozofija ·
Kaj coaching ni · Kako delam · Prisotnost in poslušanje · Potek sodelovanja (5) ·
Oblike sodelovanja (4) · Praktično (7) · Pogosta vprašanja (11, accordion) ·
Etičnost in zaupnost · CTA

**O meni** — Hero with portrait · Moja zgodba · Ko začneš drugače gledati nase ·
Sprememba, ki ni postajanje nekdo drug · Zakaj coaching · Kako želim biti ob klientu (5) ·
Nekaj, v kar verjamem · CTA

**Zapisi** — Hero · category filter, 7 tabs, functional · 6 article cards · CTA

**Zapis** — breadcrumb · title · date · hero image · body · sticky sidebar with category and
share · CTA. Built in full for `ni-vam-treba-takoj-vedeti-kaj-sledi`; the other five carry
real title, category, date, teaser and hero, with the body marked
`<div data-placeholder="copy">`.

**Kontakt** — Hero · Uvodni pogovor · two-column form and contact details · Zaključek

**Legal ×3** — shared narrow prose template

### Contact form

The mockup shows three fields (name, email, message). The live site has eight. The
prototype builds the mockup's three **plus a GDPR consent checkbox**, which is a legal
requirement rather than a design choice. The live site's richer fields — preferred
language, format, area of interest, preferred contact method — are documented as an
optional expansion rather than silently discarded.

## Deliverables

1. `site/` — the fourteen-page click-through prototype, responsive, with working
   navigation, category filter and FAQ accordion. All files in the sitemap below live at
   `site/`, with articles under `site/zapisi/`.
2. `DESIGN-SYSTEM.md` — the colour and font tables above, in the order they get entered
   into Elementor
3. `ASSETS.md` — every image slot: intended subject, crop, aspect ratio, and whether a real
   asset already exists in the WordPress media library
4. `NOVAMIRA-SKILL.md` — the skill file that drives the Elementor build, written to
   Novamira's documented expectations
5. `LAUNCH-BLOCKERS.md` — see below
6. A git repository committed in logical steps

## Launch blockers found during the audit

These are recorded in `LAUNCH-BLOCKERS.md` because they affect the live site now, not just
the redesign.

1. **Unrendered placeholders are live in production.** `{{ODZIVNI_CAS}}`,
   `{{CENA_PLACEHOLDER}}`, `{{TRAJANJE}}`, `{{LOKACIJA_PLACEHOLDER}}`,
   `{{CERTIFIKAT_PLACEHOLDER}}`, `{{METODOLOGIJA_PLACEHOLDER}}`, `{{PROGRAM_COACHINGA}}`,
   `{{CERTIFIKACIJSKI_ORGAN_IN_RAVEN}}`, `{{PREJŠNJE_VLOGE_IN_LETA}}`,
   `{{DODATNA_USPOSABLJANJA}}`, `{{STROKOVNA_ČLANSTVA}}`, `{{UREDITEV_SUPERVIZIJE}}`,
   `{{ŠTEVILO_SREČANJ}}`, `{{RITEM}}`, `{{POLITIKA_ODPOVEDI}}`, `{{INTERVAL_PREGLEDA}}`,
   `{{TRAJANJE_SREČANJA}}`. The copy doc calls for removing these. No certification or
   methodology should be named until there is an exact official designation.
2. **Contact details are fake.** `hello@pressence.example` and `+386 (0) 00 000 000` are
   live. The mockup shows `info@pressence.si`. Real details are needed.
3. **Gender forms are inconsistent.** The live site uses neutral underscore forms
   (`povedal_a`, `bil_a`); the new copy uses female forms throughout (`naslovila`,
   `verjamem`). The new copy is correct and must be applied consistently.
4. **Novamira cannot run against production.** It deactivates on live URLs by design. A
   staging or local WordPress install is required to build on, with a separate push to
   production afterwards.
5. **Existing decorative SVGs are keyed to the old palette.** `pressence-znak.svg`,
   `pressence-korenina.svg`, `pressence-korenina-zbir.svg` and `pressence-letnice.svg`
   hardcode gold `#C9A54E` and cream at 28% opacity, tuned for the dark theme. They need
   recolouring for the ivory palette — trivial, but not automatic.

## How the Elementor build actually happens

**Novamira free is sufficient.** The current site was built this way already. Novamira's
free tier ships PHP execution with WordPress loaded, direct database access and WP-CLI,
which is enough to write Elementor's `_elementor_data` post meta directly. Novamira Pro
adds Elementor-*aware* tooling — element schema validation, atomic v4 widgets, global
style migration — but it is not the only route to an Elementor page.

The consequence is that this documentation matters **more**, not less. Without Pro's schema
validation there is nothing to catch a malformed widget, so the build depends on:

- `DESIGN-SYSTEM.md` naming the exact global colour and font labels, so values are
  referenced rather than hardcoded as hex.
- The `data-el` mapping table above, so only widgets present on the free stack are emitted.
- Opening every generated page in the Elementor editor and confirming it renders and stays
  editable before moving to the next one. A page whose `_elementor_data` is subtly wrong
  can look correct on the front end and still be broken in the editor.

Novamira still **deactivates on production URLs** by design, so the build happens on a
staging or local install regardless of tier.

## Existing media library

Twenty items. Relevant to the redesign:

| Asset | Notes |
|---|---|
| `pressence-coach-izrez-v2.webp`, `MG_5753-copy-scaled.png` | Real studio headshot of the coach, white background, business shirt. Not the warm editorial portrait the mockup shows. |
| `pressence-bukov-gozd.jpg`, `pressence-korenine-mah.jpg`, `pressence-gozdna-tla.jpg` | Genuine local nature photography with proper Slovenian alt text. Usable. |
| `01_threshold_light.jpg` … `06_open_horizon.jpg` | Six blog feature images, 834×312. |
| Two `ChatGPT-Image-*.png` | Already AI-generated; precedent exists but not relied on. |
| Four decorative SVGs | Root/sprout mark, root lines, tree rings. Need recolouring, see blocker 6. |

## Out of scope

- Any change to the live pressence.si site
- The Elementor build itself, which follows prototype approval
- Writing full body copy for five of the six articles
- Translating the site to English, though the SI/EN note is retained
- Sourcing or shooting real photography
