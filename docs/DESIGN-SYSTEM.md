# Design system

Source of truth: `site/assets/css/tokens.css`. Enter these into
**Elementor → Site Settings** before building any page, then reference them by label.
Never type a hex value into a widget.

## Global Colors

Elementor → Site Settings → Global Colors. Rename the four system colours, then add four custom.

| Order | Elementor slot | Label | Hex | Used for |
|---|---|---|---|---|
| 1 | Primary | `Ink` | `#1E1F1B` | headings, logotype |
| 2 | Secondary | `Olive` | `#3A4032` | footer, primary button |
| 3 | Text | `Body` | `#4A4C45` | body copy |
| 4 | Accent | `Sage` | `#D7D6CC` | accent panels, active states |
| 5 | custom | `Ivory` | `#FAF8F5` | page ground, cards |
| 6 | custom | `Panel` | `#EEECE8` | secondary panels, side rails |
| 7 | custom | `Muted` | `#5C5E56` | meta, labels, captions |
| 8 | custom | `Line` | `#E2DFD8` | hairlines, field borders |
| 9 | custom | `Cream` | `#F4F1EB` | hero bands, warm ground |
| 10 | custom | `Edge` | `#71736A` | form-field and control borders |

`Muted` was `#71736A`. At that value it failed WCAG AA for normal text on `Panel` (4.08),
`Cream` (4.27) and `Sage` (3.30), and only just cleared it on `Ivory` (4.54). `#5C5E56`
clears 4.5:1 on all four grounds — `Sage` is the tightest at 4.51. **Do not lighten it.**

`Edge` is the old `Muted` value, kept for **form-field and control borders only**. WCAG 1.4.11
holds a UI component to 3:1 against its ground and `Line` (`#E2DFD8`) manages 1.26, so `Line`
stays decorative — hairlines, rules, dividers — and never outlines an input.

## Global Fonts

Elementor → Site Settings → Global Fonts. Both are Google Fonts; no upload needed.

| Elementor slot | Label | Family | Weight | Size | Line height | Letter spacing |
|---|---|---|---|---|---|---|
| Primary | `Display` | EB Garamond | 400 | `clamp(40px, 5vw, 64px)` | 1.15 | -0.01em |
| Secondary | `Heading` | EB Garamond | 400 | `clamp(28px, 3.2vw, 40px)` | 1.25 | 0 |
| Text | `Body` | Inter | 400 | 17px | 1.7 | 0 |
| Accent | `Label` | Inter | 500 | 12px | 1.4 | 0.08em, uppercase |

Fallbacks, for the custom CSS: `Georgia, "Times New Roman", serif` after EB Garamond;
`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` after Inter.

## Layout

| Property | Value |
|---|---|
| Container width | 1160px |
| Panel padding, vertical | `clamp(64px, 9vw, 128px)` |
| Page gutter | `clamp(20px, 4vw, 40px)` |
| Grid gap | `clamp(24px, 3vw, 48px)` |
| Text measure | 62ch |
| Border radius | 2px |
| Hairline | 1px solid `Line` |
| Mobile breakpoint | 860px |
| Panel padding, focal beats | `clamp(88px, 12vw, 184px)` |
| Hero band min height | `clamp(400px, 40vw, 560px)` |
| Hero photo split | starts at 44% of the band |

## Widget mapping

Only widgets available on the free stack. Never use an Elementor Pro widget or Xpro's
Advance Accordion.

| Prototype | Elementor |
|---|---|
| Header, footer | Xpro Theme Builder templates 36 / 37 — **edit in place, do not rebuild**. Each holds one boxed 1160px container; the template's own container stays full width so the ground and the hairline reach both window edges |
| Main nav | `xpro-horizontal-menu` |
| `<section class="p-hero">` | Elementor container, full width, min-height set. The photo is **not** a background on this container — it is held to the 1160px container line, so it is an inner container pinned to the right of the boxed width, with the left-to-right gradient overlay in the band tint |
| `<section class="p-panel">` | Elementor container, flex, full width |
| `<div class="p-container">` | Elementor container, boxed, 1160px |
| `.p-prose-split` | boxed container, **two columns** — heading column then body column |
| `.p-statement` | boxed container, one column, the larger heading size |
| `h1`–`h4` | core `heading` |
| `<p>` | core `text-editor` |
| `<ul data-el="icon-list">` | core `icon-list` |
| `<img>` | core `image` |
| Panel hairline | core `divider` |
| `.p-btn` | `xpro-button` |
| Zapisi grid, filter | `xpro-post-grid` |
| Article pages | Xpro Theme Builder single template |
| Contact form | WPForms Lite via the `wpforms` widget |
| Footer socials | core `social-icons` |

**Footer, revised 2026-09-16.** The mockup's single `brand | serif nav | socials | legal`
row does not survive the real Slovenian labels: at 1512px the wordmark's tagline ran under
*Domov* and *Kontakt* collided with the Instagram icon, because the Xpro menu renders wider
than the prototype's plain flex nav. The built footer is two shallow bands split by a
hairline — wordmark and tagline left / nav right, then © and legal links left / socials
right, with the disclaimer beneath. Same parts, same restraint, room for each.

## Custom CSS

Per-element Custom CSS is an Elementor Pro feature. Everything below goes in **one** global
stylesheet — Appearance → Customize → Additional CSS — with a CSS class set on the element
via the widget's Advanced → CSS Classes field.

| Class | Why it needs CSS |
|---|---|
| `p-rail` | `position: sticky` — Elementor sticky is a Pro motion effect. Sticky in both layouts: a 220px column on desktop, a horizontally scrollable strip under the header below 861px |
| `p-aside` | `position: sticky` |
| `p-header__inner` | the boxed 1160px strip inside the full-bleed header band |
| `p-hero` height | every band is `--p-hero-min`, one value across all pages, so the photo is the same size everywhere. The floor is set by the tallest hero — Domov, whose copy carries a CTA button and a note line the others do not. Measured across 880–1920px |
| `p-lang` | the language switch, hard right in the header. Two-letter code visible, endonym in a `.p-sr-only` span. Polylang's own switcher replaces it on the live site |
| `p-figure--bleed` | image bleeding past the container edge |
| `p-hero__media` | the photo held to the container's right edge inside a full-bleed band, plus the gradient that fades it into the band tint |
| `p-rail-layout` | the tinted rail column that bleeds off the left page edge (`calc(50% - 50vw)`), and `overflow-x: clip` so the bleed is trimmed without breaking `position: sticky` |
| `p-rail a[aria-current]` | the active rail row, whose lighter band is painted into the bleed with `box-shadow: -100vw`; under 861px this becomes an inset underline on the active chip instead |
| `p-rail__marker` | the 2px ink rule in the active row's left margin. `ui.js` sets its `height` and `translateY`; it slides between rows. Hidden on the mobile strip |
| `p-rail__list` | the rail's scroll container. `min-width: 0` is load-bearing — a grid item's `min-width: auto` is min-content, which is the whole row of nowrap chips, so without it the mobile strip grows instead of scrolling |
| `p-rail__label` | the rail's visible title, and the nav's accessible name via `aria-labelledby` |
| `p-narrow` | caps the prose measure **inside** the container; it must not re-centre the block, because every panel in the mockup hangs off the same left edge as the hero |
| `p-prose-split` | the two-column grid and its `860px` collapse |
| `p-statement` | the enlarged heading and lead-size body of the short beats |
| `p-label` | the short rule before an eyebrow |
| `p-card` | the top rule that replaced the box |
| `p-post__frame` | `overflow: hidden`, so the image can scale inside it on hover |
| `p-reveal`, `p-reveal-group` | the reveal-on-scroll states and the `nth-child` stagger |
| `p-panel--tall` | the deeper padding on the focal beats |
| `p-rings` | the growth-rings backdrop, bled off the right edge |
| `p-grid--steps` | the five-across step sequence above 1100px |
| `p-todo` | dashed placeholder block, remove before launch |
| type scale | the `clamp()` values above, if Elementor's own responsive controls prove too coarse |

## File to production slug

| Prototype file | Production URL |
|---|---|
| `index.html` | `/` |
| `coaching.html` | `/coaching/` |
| `o-meni.html` | `/o-meni/` |
| `zapisi.html` | `/zapisi/` |
| `zapisi/<slug>.html` | `/<slug>/` |
| `kontakt.html` | `/kontakt/` |
| `politika-zasebnosti.html` | `/politika-zasebnosti/` |
| `politika-piskotkov.html` | `/politika-piskotkov/` |
| `pravno-obvestilo.html` | `/pravno-obvestilo/` |

Every one of these URLs already exists on the live site. Preserve them — do not let
WordPress mint new slugs.

## Hero bands

Every top-level page opens with one full-bleed band (mockup panels 01–06), not a boxed
two-column split:

| Page | Class | Tint |
|---|---|---|
| `index.html` | `.p-hero` | `Cream` |
| `coaching.html` | `.p-hero .p-hero--sage` | `Sage` |
| `o-meni.html` | `.p-hero` | `Cream` |
| `zapisi.html` | `.p-hero .p-hero--panel` | `Panel` |
| `zapisi/<slug>.html` | `.p-hero .p-hero--article` | `Cream` |
| `kontakt.html` | — | opens straight into the `Panel` two-column form section |

The photograph is absolutely positioned, covers the band's full height, and **bleeds to the
right window edge** — not to the container line. Holding it to the container was tried on
2026-09-18 and reverted the same day: it made the photo both narrower and re-cropped, and it
read worse. Only the copy rides `.p-container` in this band. `--p-hero-split` is `44%` of the
band, which is the viewport.

Every hero band is the same height, `--p-hero-min`, so the photo is the same size on every
page. That floor is set by the tallest hero, Domov, whose copy carries a CTA button and a
note line the others do not; anything lower clips it.

A `linear-gradient` in the band tint fades the photo in from the left, so the copy sits on
flat colour and the photo never butts against a hard edge. Tint triplets for that gradient
live in `tokens.css` as `--p-cream-rgb`, `--p-sage-rgb` and `--p-panel-rgb`.

In Elementor: one full-width container, min-height set, the photo positioned right with the
gradient as a second layer above it.

## Motion and interaction

Two layers, and they are independent. **The static design carries the page on its own** — if
the motion layer is never built, nothing looks broken or unfinished.

### Layer 1 — hover and state, pure CSS

All of it lives in the global stylesheet and keys off classes that are already on the
elements. **Nothing has to be set per widget.** Timings come from the `--p-dur` /
`--p-dur-slow` / `--p-ease` tokens.

| Element | On hover / focus |
|---|---|
| `.p-nav a` | underline grows from the left |
| `.p-link-arrow` | arrow slides 5px right; the arrow itself is a CSS `::after`, so the link's own text stays clean copy |
| `.p-btn` | background `Olive` → `Ink` |
| `.p-btn--ghost` | fills to `Ivory` with `Ink` text |
| `.p-post` | lifts 3px, border → `Muted`, image scales 1.04 inside `.p-post__frame`, title underlines |
| `.p-filter button` | underline scales in from the left |
| `.p-field input`, `textarea` | border → `Muted` |
| `.p-rail a` | colour → `Ink` |

### Layer 2 — reveal on scroll

**Build this with Elementor's own Entrance Animation.** It is in the free tier
(Advanced → Motion Effects → Entrance Animation; only Scrolling Effects, Mouse Effects and
Sticky in that panel are Pro). No custom code:

| Prototype | Elementor |
|---|---|
| `.p-reveal` on a container | Entrance Animation `Fade In Up`, Duration `Slow` |
| `.p-reveal-group` on a grid | the same on each child, Animation Delay stepped **80ms** per item — 0, 80, 160, 240… |
| `.p-hero__text` children | the same, delays 50 / 150 / 250 / 350 / 450ms |

The prototype reproduces this with a class and a short `IntersectionObserver` in `ui.js`,
because a static file has no Elementor. If you would rather keep that script than use
Elementor's setting, note two things it does deliberately:

- **The hidden state is scoped to `.js`**, which an inline snippet in `<head>` sets before
  first paint. Without JavaScript every element is simply visible — a script failure can
  never blank a page.
- **Anything still hidden once the reader reaches the foot of the document is shown
  outright.** The observer's negative bottom margin leaves a band at the bottom of the
  viewport that never triggers, and without this a short page's last section would stay
  invisible for good.

### Reduced motion

`@media (prefers-reduced-motion: reduce)` reduces every duration and delay to nothing and
forces the revealed state on. Elementor does not do this for its own animations, so **keep
that block in the global stylesheet even if Layer 2 is built with Entrance Animation.**

### One thing to watch

The reveal animates the independent `translate` property, not `transform`. Its resting state
(`translate: none`) would otherwise out-specify hover rules that use `transform` — such as
`.p-post`'s lift — and silently cancel them. If you add a hover transform to anything inside
a `.p-reveal`, use `transform` and leave `translate` to the reveal.

## Accessibility

These are not nice-to-haves; three of them were failures found and fixed, and the numbers are
reproducible from `tokens.css`.

| Requirement | How it is met |
|---|---|
| **1.4.3** text contrast | every text colour clears 4.5:1 on all four grounds. See the `Muted` note above |
| **1.4.11** non-text contrast | form fields use `Edge` (4.54:1 on `Ivory`); the focus ring is `Ink` (15.6:1) |
| **2.4.7** focus visible | one `:focus-visible` ring on every focusable element, `Ivory` on the dark grounds. The UA default was invisible on these colours |
| **2.5.8** target size | icon-only controls — the footer socials, the article share row, the burger — are 44×44. Text links rely on the inline/spacing exception |
| **2.3.3** animation from interactions | `prefers-reduced-motion: reduce` zeroes every duration and delay and forces the revealed state |
| **1.3.4** orientation / reflow | no horizontal overflow at 390, 768, 1024, 1440 or 1920 |

In Elementor, the focus ring and the target sizes come from the global stylesheet, so they
apply automatically. **The contrast values depend on Global Colors being entered exactly as
the table above** — a widget with a hand-typed near-miss will silently fail.

## Performance and head

| Practice | Detail |
|---|---|
| Stylesheets in parallel | `tokens.css` and `site.css` are two `<link>` elements. An `@import` inside `site.css` serialises the second request behind the first being parsed |
| No layout shift | every `<img>` carries `width` and `height` |
| Deferred images | everything below the hero is `loading="lazy" decoding="async"`; the hero image is eager with `fetchpriority="high"` |
| Fonts | `preconnect` to both Google Fonts hosts, `display=swap` on the request |
| Head | `canonical`, Open Graph (`type`, `site_name`, `locale`, `url`, `title`, `description`), `twitter:card`, `color-scheme`, `theme-color`, and an SVG favicon |

`theme-color` is the one hex allowed outside `tokens.css` — an HTML meta cannot reference a
custom property. Keep it equal to `Olive`. `tests/check_site.py` exempts that one line and
fails on any other literal.

## What the checker covers

`python3 tests/check_site.py` — twelve checks over fourteen pages. Two were added after bugs
got through:

- **`assets_resolve`** — stylesheet, script, icon and image URLs, not just `<a href>`. A
  mangled relative path in a `<link>` is invisible until a page renders unstyled, which is
  exactly how it happened.
- **`below_fold_images_lazy`** — every image outside a hero band defers, and no hero image
  does.
