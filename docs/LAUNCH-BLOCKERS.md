# Launch blockers

Found while auditing the live pressence.si on 2026-09-08, revised after the Elementor
build on 2026-09-15. Items 1, 3 and 4 are now resolved on the live site; the rest still
need the client.

## 1. Unrendered template placeholders — RESOLVED 2026-09-15

Seventeen `{{TOKEN}}` strings were visible to visitors:

`{{ODZIVNI_CAS}}` · `{{CENA_PLACEHOLDER}}` · `{{TRAJANJE}}` · `{{TRAJANJE_SREČANJA}}` ·
`{{LOKACIJA_PLACEHOLDER}}` · `{{CERTIFIKAT_PLACEHOLDER}}` · `{{METODOLOGIJA_PLACEHOLDER}}` ·
`{{PROGRAM_COACHINGA}}` · `{{CERTIFIKACIJSKI_ORGAN_IN_RAVEN}}` · `{{PREJŠNJE_VLOGE_IN_LETA}}` ·
`{{DODATNA_USPOSABLJANJA}}` · `{{STROKOVNA_ČLANSTVA}}` · `{{UREDITEV_SUPERVIZIJE}}` ·
`{{ŠTEVILO_SREČANJ}}` · `{{RITEM}}` · `{{POLITIKA_ODPOVEDI}}` · `{{INTERVAL_PREGLEDA}}`

All of them are gone. The rebuilt pages never carried them, and the last one —
`{{ODZIVNI_CAS}}`, which sat in the WPForms confirmation message on form 50 — was removed
when that form was edited down to the prototype's four fields. Verified by fetching every
live URL and counting `{{`: zero across all twelve.

**Still needs from the client:** nothing, unless she wants a certification named. No
certification or methodology should be named until there is an exact official designation.

## 2. Contact details are only partly confirmed

The rebuilt contact page publishes `info@pressence.si`, `Maribor`, *V živo v Mariboru ali na
spletu.* and *Slovenščina / angleščina / češčina*. No phone number appears anywhere, because
we do not have a real one. The old fake `hello@pressence.example` and
`+386 (0) 00 000 000` are gone.

**Needs from the client:** confirmation that `info@pressence.si` is live and monitored, and a
phone number if one should be published at all.

## 3. Gender forms — RESOLVED for the rebuilt pages

Every page and template now uses the female forms — `naslovila`, `verjamem`, `pozorna sem`.

**One exception, by the client's own decision:** the six original posts (IDs 42–47) were kept
alongside the six new ones rather than replaced, so their bodies still carry the neutral
underscore forms (`povedal_a`, `bil_a`, `usmeril_a`, `pozoren_na`). Fixing those six bodies is
a copy edit that was out of scope for the build.

**Needs a decision:** whether to sweep the underscore forms out of posts 42–47 without
otherwise touching their copy.

## 4. Novamira against production — NOT A BLOCKER

The earlier finding here claimed *"Novamira deactivates on live URLs by design, regardless of
tier"*, and concluded that a staging site was required. **That is false.** Novamira is
connected directly to `https://pressence.si` with full management permission; `novamira
doctor` reports all nineteen checks passing, including `site.permission`
(`managementPermission: true`) and `oauth.token`. The entire Elementor rebuild was carried out
against production, page by page, with the site live throughout.

No staging site is needed, and none was created.

**Needs from the client:** nothing.

## 5. Legal pages have no content

All three pages are built and live with their final structure — heading, lead, and the GDPR
section headings as a checklist — and each carries a visible dashed note saying the legal text
is in preparation. Google Site Kit is installed, so analytics cookies are in use and the
cookie policy cannot ship empty.

**Needs from the client:** privacy policy, cookie policy and legal notice text, from her or her
legal adviser.

## 6. Photography — partly resolved 2026-09-15

Four of the six photographic slots now carry a real photograph from her own Media Library.
None of the prototype's unmatched Lorem Picsum stock was published.

| Slot | Photograph |
|---|---|
| Domov hero | `pressence-bukov-gozd.jpg` — a path through tall trees in warm dappled light |
| Coaching hero | `pressence-korenine-mah.jpg` — moss-grown roots at the base of a beech |
| O meni hero | `pressence-portret-hero.jpg` — her portrait |
| Domov portrait split | `pressence-portret-o-meni.jpg` — her portrait |
| Zapisi hero | **placeholder** — see below |
| Article hero (template 49), post cards | **no image** |

The Zapisi hero is still a declared on-palette placeholder: a light study in the band's own
tints behind the same 44% split and gradient fade the real photograph will use. Dropping an
image into that container is the only change needed.

**`pressence-gozdna-tla.jpg` in the Media Library is mislabelled.** Its filename and its alt
text both say *Gozdna tla, mah in korenine* — forest floor, moss and roots — but the image is
a saturated alpine sunset with a mountain peak, conifers and a lake. It is neither a forest
floor nor, by the look of it, Slovenian. It was the obvious candidate for the Zapisi hero and
was rejected on two counts: the alt text describes a different picture, and the orange sky
fights the warm-neutral palette the design is built on. The earlier claim in `docs/ASSETS.md`
that all three library forest photographs are "real, local, proper Slovenian alt text" holds
for the other two only.

Post cards and the article template carry no featured image at all: only the six retained
posts have one, and a grid where half the cards have a picture reads as broken.

**Needs from the client:** a frame for the Zapisi hero; corrected alt text on
`pressence-gozdna-tla.jpg`, or its removal; and ultimately the shoot. `docs/ASSETS.md` holds
the shot list, unchanged.

## 7. Five of the six new articles have no body copy

Posts 115–118 and 120 are published with their final title, category, date, teaser and
opening lines only. Post 119 (`ni-vam-treba-takoj-vedeti-kaj-sledi`) is the one complete
article. The prototype's structure note for the others stands: two to three subheadings, a
closing *Nekaj za razmislek*, and a final reflective question.

**Needs from the client:** five article bodies, written by her.

## 8. Social profile URLs are placeholders

The footer links to `https://www.instagram.com/` and `https://www.linkedin.com/` — the
prototype's own values, which are site roots rather than her profiles.

**Needs from the client:** the two real profile URLs, or a decision to drop the icons.

## 9. The article template cannot show a post's own date and category

The prototype's article hero carries breadcrumb, headline and date, and its sidebar names the
post's own category. Neither is buildable on the free stack: Elementor's Post Info widget is
Pro, and Xpro's free `xpro-taxonomy` is a site-wide term list, not a per-post meta widget.
Template 49 therefore carries the breadcrumb and the headline, and its sidebar carries the
category index the widget can actually produce.

The date and category *are* shown on every card in the Zapisi grid, which is where readers
scan them, so the loss is confined to the article page itself.

**Needs a decision:** accept this, or add a small WordPress shortcode for post meta and place
it with Elementor's free Shortcode widget. That is the one-line fix, but it is PHP outside the
builder, so it is not being done without an explicit go-ahead.

## 10. The confirmation message on form 50 is provisional

Removing `{{ODZIVNI_CAS}}` meant rewriting the confirmation, which had promised a response
time we cannot state and offered a phone call through a field the prototype form does not
have. It now reads: *Vaše sporočilo je pri meni. Hvala. Sporočilo in osebne podatke bom
obravnavala zaupno.* The second sentence is the prototype's own form hint.

**Needs from the client:** confirmation of that wording, and a real response time if she wants
one stated.

## 11. The "O imenu" panel on Domov is unapproved copy

Added to `site/index.html` on 2026-09-16: a new panel between the hero and the opening
question, headed *Zakaj Pressence?*, explaining the name as *presence* (prisotnost) +
*essence* (bistvo). It and the existing question panel now read as a mirrored pair — prose
left with the sprig at the right edge, then prose right with the new rootlets drawing at the
left. The wording was taken from a reference design, **not from the source docx**, so it is
the first prose on the site that does not trace to `source/copy.txt`.

It is registered in `PROVENANCE_ALLOWED` in `tests/check_site.py` rather than written into
`copy.txt`, deliberately: `copy.txt` is the verbatim docx extraction and the fixed point the
provenance check measures against. Editing it to accommodate new copy would disarm the check
for every future addition.

**Needs from the client:** confirmation that this is how she wants the name explained, in her
words. If she rewrites it, replace both the markup and the five `PROVENANCE_ALLOWED` entries.
If she drops it, delete the *O imenu* section and its entries in `tests/check_site.py`, and
take `p-panel--deco-left` and `p-statement--mirror` off the question panel so it hangs left
again on Ivory — it has nothing to mirror on its own. `pressence-koreninice.svg` and the two
CSS rules can stay; neither is specific to this panel.
