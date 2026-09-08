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
| 7 | custom | `Muted` | `#71736A` | meta, labels, captions |
| 8 | custom | `Line` | `#E2DFD8` | hairlines, field borders |
| 9 | custom | `Cream` | `#F4F1EB` | hero bands, warm ground |

## Global Fonts

Elementor → Site Settings → Global Fonts. Both are Google Fonts; no upload needed.

| Elementor slot | Label | Family | Weight | Size | Line height | Letter spacing |
|---|---|---|---|---|---|---|
| Primary | `Display` | EB Garamond | 400 | `clamp(40px, 5vw, 64px)` | 1.15 | -0.01em |
| Secondary | `Heading` | EB Garamond | 400 | `clamp(28px, 3.2vw, 40px)` | 1.25 | 0 |
| Text | `Body` | Inter | 400 | 16px | 1.75 | 0 |
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
| Hero band min height | `clamp(400px, 40vw, 560px)` |
| Hero photo split | starts at 44% of the band |

## Widget mapping

Only widgets available on the free stack. Never use an Elementor Pro widget or Xpro's
Advance Accordion.

| Prototype | Elementor |
|---|---|
| Header, footer | Xpro Theme Builder templates 36 / 37 — **edit in place, do not rebuild** |
| Main nav | `xpro-horizontal-menu` |
| `<section class="p-hero">` | Elementor container, full width, min-height set, background image positioned right with a left-to-right gradient overlay in the band tint |
| `<section class="p-panel">` | Elementor container, flex, full width |
| `<div class="p-container">` | Elementor container, boxed, 1160px |
| `h1`–`h4` | core `heading` |
| `<p>` | core `text-editor` |
| `<ul data-el="icon-list">` | core `icon-list` |
| `<img>` | core `image` |
| Panel hairline | core `divider` |
| `.p-btn` | `xpro-button` |
| `.p-faq` `<details>` | **core Accordion** |
| Zapisi grid, filter | `xpro-post-grid` |
| Article pages | Xpro Theme Builder single template |
| Contact form | WPForms Lite via the `wpforms` widget |
| Footer socials | core `social-icons` |

## Custom CSS

Per-element Custom CSS is an Elementor Pro feature. Everything below goes in **one** global
stylesheet — Appearance → Customize → Additional CSS — with a CSS class set on the element
via the widget's Advanced → CSS Classes field.

| Class | Why it needs CSS |
|---|---|
| `p-rail` | `position: sticky` — Elementor sticky is a Pro motion effect |
| `p-aside` | `position: sticky` |
| `p-figure--bleed` | image bleeding past the container edge |
| `p-faq` | `<details>` marker replacement and the +/− affordance |
| `p-compare` | two-column comparison with hairline rows |
| `p-hero__media` | photo bleeding off the band edge, plus the gradient that fades it into the band tint |
| `p-rail-layout` | the tinted rail column that bleeds off the left page edge (`calc(50% - 50vw)`), and `overflow-x: clip` so the bleed is trimmed without breaking `position: sticky` |
| `p-rail a[aria-current]` | the active rail row, whose lighter band is painted into the bleed with `box-shadow: -100vw` |
| `p-narrow` | caps the prose measure **inside** the container; it must not re-centre the block, because every panel in the mockup hangs off the same left edge as the hero |
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

The photograph is absolutely positioned from 44% to the right edge of the band and covers its
full height. A `linear-gradient` in the band tint fades it in from the left, so the copy sits
on flat colour and the photo never butts against a hard edge. Tint triplets for that gradient
live in `tokens.css` as `--p-cream-rgb`, `--p-sage-rgb` and `--p-panel-rgb`.

In Elementor: one full-width container, min-height set, the photo as the container background
positioned `right center` with `background-size: cover`, and the gradient as a second
background layer above it.
