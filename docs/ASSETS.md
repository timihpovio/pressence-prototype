# Assets

Placeholder images are tagged `data-placeholder="true"` in the HTML, with a `data-brief`
attribute describing the intended shot. Replace them before launch. **All four hero bands and
both portraits are now real, client-supplied imagery** — see *Client-supplied imagery* below.
Only the twelve Zapisi card and article images are still stock.

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
| `razgled-koca.jpg` | Domov hero | 3:2 | *(was: backlit olive branch)* — **client-supplied, see below** | — | **Yes** |
| `portret-hero.jpg` | O meni hero | 1.91:1 | editorial portrait, warm knitwear, window light, three-quarter view | **Real — her own photograph.** See *Portraits* below | **Yes** |
| `portret-o-meni.jpg` | Domov, O meni teaser | 4:5 | warm editorial portrait, cream cardigan, natural window light | **Real — her own photograph.** See *Portraits* below | **Yes** |
| `kamin-koca.jpg` | Coaching hero | 3:2 | *(was: stoneware cup on linen)* — **client-supplied, see below** | — | **Yes** |
| `koca-gore.jpg` | Zapisi hero | 3:2 | *(was: vase with dried flowers)* — **client-supplied, see below** | — | **Yes** |
| `zapis-01.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | mountain road through golden hills, morning light | Lorem Picsum (generic, unmatched) | No |
| `zapis-02.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | leaf shadows on a pale wall, high-contrast afternoon light | Lorem Picsum (generic, unmatched) | No |
| `zapis-03.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | folded linen beside a stoneware cup | Lorem Picsum (generic, unmatched) | No |
| `zapis-04.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | two chairs facing each other in a calm room | Lorem Picsum (generic, unmatched) | No |
| `zapis-05.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | open notebook and pencil, quiet morning light | Lorem Picsum (generic, unmatched) | No |
| `zapis-06.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | forked path in a beech forest, diffused light | Lorem Picsum (generic, unmatched) | **Yes** — `pressence-bukov-gozd.jpg` in the media library is a real beech forest above Maribor |

`hero-oljka.jpg`, `skodelica-lan.jpg` and `vaza-susene-roze.jpg` were deleted with the swap —
nothing referenced them any more. Every remaining file is a real JPEG, verified under 400 KB, at the exact
width/height its `<img>` tag declares. License: Lorem Picsum photos are drawn from Unsplash's free-to-use
pool — no attribution required, free for commercial use — but per-photo photographer credit
isn't exposed through the seeded API, so none is recorded here.

`tests/check_site.py` holds the authoritative list in `REAL_PHOTOGRAPHY`. It fails the build
both ways: a placeholder left untagged, and a real photograph wrongly tagged (which would
apply the desaturating review filter to it).

## Client-supplied imagery — 2026-09-18

The client sent six files and a note assigning them to pages: the cabin-and-mountains frame to
Zapisi, a fireplace interior to Coaching ("1 or 2, whichever comes across better"), a
coaching-session photograph of herself to O meni, and Kontakt left with no image. Source
folder: `~/Timmy AI/vaults/Timaja/Projects/larasebek`. Nothing was retouched — each output is
a crop and a resize of the file she sent, no grade, no colour correction.

| Output | Size | Source file | Crop |
|---|---|---|---|
| `razgled-koca.jpg` | 1087×725 | `Kamin in koča 2.png` (2170×725) | 3:2 off the left, `x = 0` |
| `kamin-koca.jpg` | 1330×887 | `Kamin in koča 1.png` (1774×887) | 3:2 off the right, `x = 444` |
| `koca-gore.jpg` | 1087×725 | `koča in gore.png` (2170×725) | 3:2 off the left, `x = 0` |
| `portret-hero.jpg` | 1600×835 | `o-meni.png` (1735×906) | full frame, resized |
| `portret-o-meni.jpg` | 1000×1250 | `o-meni.png` | 4:5 centred on her, `x = 618` |

Decisions worth keeping:

- **Fireplace 1, not 2.** Every crop here has to survive `.p-hero__media`, which is between
  1.4:1 and 1.9:1 depending on viewport width. `Kamin in koča 2` is 3:1, so a hero crop keeps
  barely half its width and drops the mountains almost entirely; `1` is 2:1 and 887px tall,
  and a 3:2 window off its right holds both the window onto the peaks and the hearth. The
  hearth also lands right of the tint fade, where it reads at full strength. Swapping to `2`
  is a one-line change in `coaching.html` if she prefers it.
- **Fireplace 2 went to the Domov hero, cropped away from the fire.** Her note does not cover
  Domov, which was still on unmatched stock, so the spare frame was placed there. The crop is
  the *left* 3:2 — window, ridgelines, lake, a blanket on the sill — not the right-hand hearth,
  so the three bands read as three different rooms rather than two fireplaces, and the open
  view suits *Prostor, kjer lahko za trenutek odložite vse odgovore* better than a fire close-up
  does. The right-hand crop exists and is a one-line swap.
- **The Zapisi crop is the left third of the panorama, not the middle.** The cabin is what she
  named, and it sits at `x = 60…500` of 2170. A centred crop loses it; a wider crop cuts it in
  half at 1440px. The sunburst at the far right is the cost — no crop holds both.
- **Her photograph is not graded.** The 2026-09-09 composites carried a warm grade
  (saturation ×0.88) because they were a background-removed studio cutout dropped onto a flat
  palette ground and needed settling. This is a real room in real window light; the greens and
  the denim are what was in the frame, and leaving them is the honest choice on a page about
  her.
- **Face at 52% of the hero frame.** `.p-hero__media` fades its left 40% into the band tint.
  At 1440px `object-fit: cover` shows the middle 75% of the file, which puts her at ~53% of
  the visible band — clear of the fade at every width the band takes.

**Both cabin images look AI-generated** (the fireplace frame in particular has the give-away
soft geometry in the stonework and the mantel objects). That is her call, not ours, but it is
worth saying out loud on a trust-led coaching site — see the note on `ChatGPT-Image-*.png`
below, which was written about exactly this risk. Her own photograph is plainly a real one.

### What this replaced

`portret-hero.jpg` and `portret-o-meni.jpg` were, until this date, built from
`pressence.si/wp-content/uploads/2026/09/MG_5753-copy-scaled.png` — a 2560×2560 background-
removed studio headshot, cropped to head-and-shoulders, warm-graded and composited onto
`Cream` and `Panel` gradients. That work is in git history if it is ever wanted back. The new
frame is better on every count the old note complained about: she is in a room rather than on
a colour, the posture is open rather than arms-folded, and the light is daylight.

Still true: **this is not the mockup's portrait.** The mockup shows a different, younger woman
in a cream cardigan looking off-camera — that frame is itself stock and can never be matched,
because it is not her.

## Already in the WordPress media library

Reusable without a shoot:

| Asset | Dimensions | Notes |
|---|---|---|
| `2026/07/pressence-bukov-gozd.jpg` | 1400×932 | A path through tall trees in warm dappled light. Real and on-palette. **In use — Domov hero.** |
| `2026/07/pressence-korenine-mah.jpg` | 1400×932 | Moss-covered roots at the base of a beech. Real; the moss is vivid against the warm neutrals but the band's gradient fade carries it. **In use — Coaching hero.** |
| `2026/07/pressence-gozdna-tla.jpg` | 1400×788 | **Mislabelled — do not use as-is.** The filename and alt text say *forest floor, moss and roots*; the image is a saturated alpine sunset with a mountain peak, conifers and a lake. Wrong alt text, and off-palette. |

Checked by opening all three on 2026-09-15. The earlier note that these are uniformly "real,
local, proper Slovenian alt text" holds for the first two only.
| `2026/09/01_threshold_light.jpg` … `06_open_horizon.jpg` | 834×312 | Six blog feature images. Too short for the 21:9 article heroes; usable for cards. |

Needs replacing:

| Asset | Problem |
|---|---|
| `2026/07/pressence-coach-izrez-v2.webp`, `2026/09/MG_5753-copy-scaled.png` | Real headshot of the coach, white-background studio in a business shirt. **Now in use** — see *Portraits* above — cropped and composited onto the palette. Still a different register from the mockup; a shoot remains the upgrade. |
| `2026/09/ChatGPT-Image-*.png` | AI-generated. Avoid on a trust-led coaching site. |

## Brand SVGs

Recoloured from the old dark-theme gold `#C9A54E` (and cream at low opacity) to the `Sage`
and `Muted` tokens. Two are placed — `pressence-vejica.svg` and `pressence-koreninice.svg`,
on the two opening panels of Domov. The rest are prepared for the Elementor build.

The two placed drawings carry the `Edge` token (`#71736A`) rather than `Sage`: Sage managed
only ~1.3:1 against Ivory and read as a printing fault. They are softened to a watermark by
the opacity on `.p-deco`, not by a pale stroke. See the comment in either file.

| File | Original stroke | New stroke | Source |
|---|---|---|---|
| `pressence-znak.svg` | `#C9A54E` | `#71736A` (Muted) | Redrawn per spec (root/sprout mark) |
| `pressence-korenina.svg` | `rgba(240,237,229,0.28)` | `#D7D6CC` (Sage) | Redrawn per spec (root lines) |
| `pressence-korenina-zbir.svg` | `rgba(240,237,229,0.28)` | `#D7D6CC` (Sage) | Redrawn per spec (converging roots) |
| `pressence-vejica.svg` | — (new) | `#D7D6CC` (Sage) | Drawn for the Domov statement panel, which the mockup shows with a line-art sprig at its right edge. **In use — Domov, *O imenu* panel, right edge.** |
| `pressence-koreninice.svg` | — (new, 2026-09-16) | `#71736A` (Edge) | Drawn as the counterpart to `pressence-vejica.svg`: the sprig reaches up and right, this descends down and left, so the two opening panels on Domov mirror rather than repeat. A taproot with fourteen rootlets and six splits — open curves, no closed shapes, so it is a sibling of the sprig and not a copy. The density is deliberate: the sprig gets its mass from nine leaf outlines, and open line work only matches that by having enough of it. **In use — Domov, opening question panel, left edge.** |
| `pressence-letnice.svg` | `rgba(201,165,78,0.5)` ×9 | `#D7D6CC` (Sage) ×9 | Downloaded from the live site (`pressence.si/wp-content/uploads/2026/07/pressence-letnice.svg`, read-only fetch) and recoloured — 9 gold strokes replaced |

## The shoot brief, if one happens

Every `data-brief` in the HTML is a shot. The through-line: warm neutral palette, natural
side or back light, shallow depth of field, no saturated colour, no props that read as
corporate. One portrait session in daylight covers the two portrait slots and would replace
the studio headshot.
