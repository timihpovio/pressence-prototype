# Assets

Every image in the prototype is a **placeholder**, tagged `data-placeholder="true"` in the
HTML with a `data-brief` attribute describing the intended shot. Replace them before launch.

## Sourcing note — read this before judging the imagery

The plan called for sourcing each slot from Unsplash, matched to its `data-brief`. Unsplash's
site blocks automated/headless browsing with a bot challenge, and its search API requires a
registered developer key that isn't available in this environment. Rather than leave slots
empty (which the checker would also allow, since it only validates `<a href>` links, not
`<img src>`), every slot below is filled with a real, free-to-use photograph from
[Lorem Picsum](https://picsum.photos) (Unsplash-licensed stock, redistributed under a seeded
random-photo API). These are **real JPEGs at the correct crop and size for their slot**, but
they are **not matched to their `data-brief`** — expect generic photography (landscapes,
textures, portraits of unrelated subjects), not the warm editorial/still-life mood described.

**Before client review:** either swap these for real Unsplash matches (search each
`data-brief` manually — Unsplash's own site works fine for a human, the block is only on
automated fetching) or treat this as confirmation that a real shoot is needed. The `data-brief`
values are unchanged and remain the correct shot list either way.

## Photography slots

| File | Used on | Ratio | Brief | Current placeholder | Real asset available? |
|---|---|---|---|---|---|
| `hero-oljka.jpg` | Domov hero | 4:3 | backlit olive branch, warm late-afternoon light, shallow DOF | Lorem Picsum (generic, unmatched) | No |
| `portret-hero.jpg` | O meni hero | ~10:11 | editorial portrait, warm knitwear, window light, three-quarter view | Lorem Picsum (generic, unmatched) | **Partly** — a real studio headshot exists (see below) but is the wrong register |
| `portret-o-meni.jpg` | Domov, O meni teaser | 4:5 | warm editorial portrait, cream cardigan, natural window light | Lorem Picsum (generic, unmatched) | **Partly** — as above |
| `skodelica-lan.jpg` | Coaching hero | 4:3 | stoneware cup on linen with dried gypsophila, soft daylight | Lorem Picsum (generic, unmatched) | No |
| `vaza-susene-roze.jpg` | Zapisi hero | 4:3 | vase with dried flowers beside a stoneware bowl, cream wall | Lorem Picsum (generic, unmatched) | No |
| `zapis-01.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | mountain road through golden hills, morning light | Lorem Picsum (generic, unmatched) | No |
| `zapis-02.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | leaf shadows on a pale wall, high-contrast afternoon light | Lorem Picsum (generic, unmatched) | No |
| `zapis-03.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | folded linen beside a stoneware cup | Lorem Picsum (generic, unmatched) | No |
| `zapis-04.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | two chairs facing each other in a calm room | Lorem Picsum (generic, unmatched) | No |
| `zapis-05.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | open notebook and pencil, quiet morning light | Lorem Picsum (generic, unmatched) | No |
| `zapis-06.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | forked path in a beech forest, diffused light | Lorem Picsum (generic, unmatched) | **Yes** — `pressence-bukov-gozd.jpg` in the media library is a real beech forest above Maribor |

All seventeen files are real JPEGs, verified under 400 KB, at the exact width/height each
`<img>` tag declares. License: Lorem Picsum photos are drawn from Unsplash's free-to-use
pool — no attribution required, free for commercial use — but per-photo photographer credit
isn't exposed through the seeded API, so none is recorded here.

## Already in the WordPress media library

Reusable without a shoot:

| Asset | Dimensions | Notes |
|---|---|---|
| `2026/07/pressence-bukov-gozd.jpg` | 1400×932 | Beech forest above Maribor. Real, local, proper Slovenian alt text. |
| `2026/07/pressence-korenine-mah.jpg` | 1400×932 | Moss-covered roots. |
| `2026/07/pressence-gozdna-tla.jpg` | 1400×788 | Forest floor. |
| `2026/09/01_threshold_light.jpg` … `06_open_horizon.jpg` | 834×312 | Six blog feature images. Too short for the 21:9 article heroes; usable for cards. |

Needs replacing:

| Asset | Problem |
|---|---|
| `2026/07/pressence-coach-izrez-v2.webp`, `2026/09/MG_5753-copy-scaled.png` | Real headshot of the coach, but a white-background studio shot in a business shirt. The design calls for warm editorial light. Usable at launch if a shoot is out of scope; it will read as a different brand. |
| `2026/09/ChatGPT-Image-*.png` | AI-generated. Avoid on a trust-led coaching site. |

## Brand SVGs

Recoloured from the old dark-theme gold `#C9A54E` (and cream at low opacity) to the `Sage`
and `Muted` tokens. Not yet placed on any page — prepared for the Elementor build.

| File | Original stroke | New stroke | Source |
|---|---|---|---|
| `pressence-znak.svg` | `#C9A54E` | `#71736A` (Muted) | Redrawn per spec (root/sprout mark) |
| `pressence-korenina.svg` | `rgba(240,237,229,0.28)` | `#D7D6CC` (Sage) | Redrawn per spec (root lines) |
| `pressence-korenina-zbir.svg` | `rgba(240,237,229,0.28)` | `#D7D6CC` (Sage) | Redrawn per spec (converging roots) |
| `pressence-letnice.svg` | `rgba(201,165,78,0.5)` ×9 | `#D7D6CC` (Sage) ×9 | Downloaded from the live site (`pressence.si/wp-content/uploads/2026/07/pressence-letnice.svg`, read-only fetch) and recoloured — 9 gold strokes replaced |

## The shoot brief, if one happens

Every `data-brief` in the HTML is a shot. The through-line: warm neutral palette, natural
side or back light, shallow depth of field, no saturated colour, no props that read as
corporate. One portrait session in daylight covers the two portrait slots and would replace
the studio headshot.
