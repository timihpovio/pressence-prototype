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

Because the unmatched stock (a red barrel, a saturated street scene, an orange sunset) fought
the warm neutral palette badly enough to misrepresent the design, `site.css` applies a
desaturating warm filter to every `img[data-placeholder="true"]`. It is a review aid, not part
of the design: **delete that rule once the real, on-brief photographs are in.** It is marked
in `site.css` directly above the `[data-placeholder="true"]` block.

**Before client review:** either swap these for real matches sourced by a human, or treat
this as confirmation that a real shoot is needed. The `data-brief` values are unchanged and
remain the correct shot list either way.

### Source reachability, verified 2026-09-09

| Source | Result | Usable without a human? |
|---|---|---|
| `source.unsplash.com/featured/?…` | **503** — the keyless random endpoint was retired | No |
| `unsplash.com/s/photos/…` | **307** into a bot challenge | No |
| Pexels API | **401** — requires a free developer key | Only with a key |
| Openverse API (`api.openverse.org`) | **200**, no key needed | Yes, but see below |

Openverse is reachable and needs no key, but it **cannot serve this art direction**. Probing
all nine photographic briefs against the CC0 pool:

- `stoneware cup on linen` — **0 results**. Same for `folded linen beside a cup`.
- `mountain road through golden hills` — **0 results**.
- `two chairs in a calm room` — 91 nominal hits, but the top matches are *girl with coffee*,
  *MCLI Server Farm* and *painted fireplace*. Semantically noisy.
- `olive branch` — 240 nominal hits; the CC0 top matches are a line-art SVG, a Flickr photo
  of people "extending the olive branch", and a marble relief in St Peter's Basilica.
- Only `dried flowers vase` (6 CC0) and `beech forest path` (7 CC0) return plausible frames.

Widening to CC BY / BY-SA raises volume but adds per-image attribution, and BY-SA is a
share-alike obligation that does not belong on a commercial client site. The warm editorial
still-life register the mockup is built on — stoneware, linen, dried gypsophila, soft
directional daylight — is essentially absent from open-licensed pools. It is commissioned or
premium-stock work.

**The two portrait slots must not be filled from stock at all**, at any licence. Putting a
stranger's face on a named coach's site misrepresents her. The options are her real headshot
(below) or a shoot.

## Photography slots

| File | Used on | Ratio | Brief | Current placeholder | Real asset available? |
|---|---|---|---|---|---|
| `hero-oljka.jpg` | Domov hero | 4:3 | backlit olive branch, warm late-afternoon light, shallow DOF | Lorem Picsum (generic, unmatched) | No |
| `portret-hero.jpg` | O meni hero | 10:11 | editorial portrait, warm knitwear, window light, three-quarter view | **Real — her own portrait.** See *Portraits* below | **Yes** |
| `portret-o-meni.jpg` | Domov, O meni teaser | 4:5 | warm editorial portrait, cream cardigan, natural window light | **Real — her own portrait.** See *Portraits* below | **Yes** |
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

`tests/check_site.py` holds the authoritative list in `REAL_PHOTOGRAPHY`. It fails the build
both ways: a placeholder left untagged, and a real photograph wrongly tagged (which would
apply the desaturating review filter to it).

## Portraits — done, 2026-09-09

Built from her own asset, not stock. Source:
`pressence.si/wp-content/uploads/2026/09/MG_5753-copy-scaled.png` — 2560×2560 PNG with a
**real alpha channel**, already background-removed. That transparency is what made this
workable: she could be placed on the palette instead of on clinical studio white.

| Output | Size | Ground | Framing |
|---|---|---|---|
| `portret-hero.jpg` | 1000×1100 | `Cream` #F4F1EB, soft vertical gradient | head and shoulders, face at 60% width |
| `portret-o-meni.jpg` | 1000×1250 | `Panel` #EEECE8, soft vertical gradient | head and shoulders, face at 52% width |

Decisions worth keeping:

- **The crossed arms are cropped out.** The original is arms-folded, straight to camera — a
  closed posture that works against copy about not having to have the answers.
- **Face sits at 60% width on the hero** because `.p-hero__media` fades its left 40% into the
  band tint; centring her would push her face into the fade.
- **A gentle warm grade** (saturation ×0.88, R ×1.022, B ×0.966) settles the cool lilac shirt
  into the warm neutral palette. Applied to the file, not via CSS, so the images are not
  affected by the placeholder review filter.
- **Ground is a vertical gradient**, not a flat fill, so a cutout on a solid colour does not
  read as a sticker.

Still true: **this is not the mockup's portrait.** The mockup shows a different, younger woman
in a cream cardigan looking off-camera — that frame is itself stock and can never be matched,
because it is not her. A daylight session in warm knitwear is the only route to the mockup's
register. The shot brief below stands.

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
| `2026/07/pressence-coach-izrez-v2.webp`, `2026/09/MG_5753-copy-scaled.png` | Real headshot of the coach, white-background studio in a business shirt. **Now in use** — see *Portraits* above — cropped and composited onto the palette. Still a different register from the mockup; a shoot remains the upgrade. |
| `2026/09/ChatGPT-Image-*.png` | AI-generated. Avoid on a trust-led coaching site. |

## Brand SVGs

Recoloured from the old dark-theme gold `#C9A54E` (and cream at low opacity) to the `Sage`
and `Muted` tokens. Not yet placed on any page — prepared for the Elementor build.

| File | Original stroke | New stroke | Source |
|---|---|---|---|
| `pressence-znak.svg` | `#C9A54E` | `#71736A` (Muted) | Redrawn per spec (root/sprout mark) |
| `pressence-korenina.svg` | `rgba(240,237,229,0.28)` | `#D7D6CC` (Sage) | Redrawn per spec (root lines) |
| `pressence-korenina-zbir.svg` | `rgba(240,237,229,0.28)` | `#D7D6CC` (Sage) | Redrawn per spec (converging roots) |
| `pressence-vejica.svg` | — (new) | `#D7D6CC` (Sage) | Drawn for the Domov statement panel, which the mockup shows with a line-art sprig at its right edge. The only brand SVG currently placed on a page. |
| `pressence-letnice.svg` | `rgba(201,165,78,0.5)` ×9 | `#D7D6CC` (Sage) ×9 | Downloaded from the live site (`pressence.si/wp-content/uploads/2026/07/pressence-letnice.svg`, read-only fetch) and recoloured — 9 gold strokes replaced |

## The shoot brief, if one happens

Every `data-brief` in the HTML is a shot. The through-line: warm neutral palette, natural
side or back light, shallow depth of field, no saturated colour, no props that read as
corporate. One portrait session in daylight covers the two portrait slots and would replace
the studio headshot.
