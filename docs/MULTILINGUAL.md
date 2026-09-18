# Two languages: Slovenian and English

Slovenian is the source. English is drafted from it (see `source/copy.en.md`) and **must be
reviewed by the client before launch** — it is written in her first-person voice.

> **Czech was dropped as a site language on 2026-09-18.** `source/copy.cs.md` is kept as a
> finished draft in case it is ever wanted, but nothing references it and no `site/cs/` will
> be built. Polylang still has `cs` registered on the live site; that registration should be
> removed.
>
> **This is about the site, not about her practice.** She confirmed on 2026-09-09 that she
> coaches in Czech, and the contact page still lists *Slovenščina / angleščina / češčina* as
> the languages she works in. A two-language website and a three-language practice are not
> in conflict. If she has also stopped offering Czech sessions, that line needs changing
> too — it is a separate decision, and nobody has made it.

## How WordPress does this

WordPress has no multilingual support of its own. It is always a plugin, and the plugin
choice decides the URL structure, so it has to be settled before the Elementor build starts.

| Plugin | Cost | Languages on free tier | Elementor fit |
|---|---|---|---|
| **Polylang** | free | unlimited | good — one page per language |
| WPML | from ~$39/yr | n/a (paid only) | best — String Translation covers widget text |
| TranslatePress | free tier | **one** extra language | best here — translates the rendered page, so the layout is built once |

**Polylang is installed and the live site is already built on it.** That is the status quo
and it works.

**But dropping Czech changes the arithmetic, and it is worth one look before the English
pages are built in WordPress.** The reason TranslatePress was rejected was its free-tier cap
of one extra language. With English as the only extra language, that cap is no longer
binding — and TranslatePress translates the *rendered page*, which means the Elementor
layout is built **once** instead of twice, and a later layout change is made once instead of
twice. The duplication cost described below is the single largest ongoing cost in this plan,
and it exists only because of Polylang's one-page-per-language model.

Switching is not free either: Polylang is already configured, and a migration would mean
re-doing the language setup and the URL structure. The trade is *one migration now* against
*every future layout change made twice*. Worth a decision before the English build starts in
WordPress, not after.

The rest of this document assumes Polylang, since that is what is installed.

## URL structure

Slovenian at the root, the other two in subdirectories. Polylang's default, and it leaves
every existing Slovenian URL untouched:

```
/coaching/          sl   (default language, no prefix)
/en/coaching/       en
```

The prototype mirrors this exactly: `site/` is Slovenian, `site/en/` is English.

**English built 2026-09-18.** Eight pages under `site/en/`, with the localised slugs from
the table below: `index`, `coaching`, `about`, `notes`, `contact`, `privacy-policy`,
`cookie-policy`, `legal-notice`. Every sentence is checked against `source/copy.en.md` by
`tests/check_site.py`, the same guard the Slovenian pages get against `copy.txt`.

**Not translated: the six article bodies.** `copy.en.md` has their titles and their
excerpts but not their prose, so there is no `site/en/notes/`. `en/notes.html` shows the six
cards with translated titles, dates and categories, and each one links to the Slovenian
original with `hreflang="sl"`. The page says so in one line above the grid rather than
dropping an English reader into Slovenian without warning. Translating those six bodies is
the next piece of copy work, and like the rest of `copy.en.md` it needs her review.

### The one slug that could not be localised

`coaching` is the same word in both languages, and **WordPress resolves a page slug in
`WP::parse_request` before any Polylang filter runs**, so `/en/coaching/` always resolved to
the Slovenian page 24 and issued a 301 to `/coaching/`. Every other English slug differs from
its Slovenian counterpart and works. Confirmed live: `url_to_postid('/en/coaching/')`
returned 24, and `?page_id=176` redirected to `/coaching/`.

The English page therefore lives at **`/en/about-coaching/`**. The nav label is still
"Coaching"; only the slug differs. The alternative — renaming the Slovenian page — is barred
by the rule that every existing URL is preserved. The slug table in `source/copy.en.md`
still says `coaching`; this note overrides it.

**Localise the slugs too**, rather than reusing the Slovenian slug under a language prefix. Polylang handles this per page; it is worth the few
minutes for search visibility in each market.

## What this costs in the Elementor build

This is the part worth knowing up front: **Polylang gives each language its own page, with
its own Elementor layout.** It does not translate one layout on the fly.

So the build order changes:

1. Novamira builds the Slovenian page as documented in `NOVAMIRA-SKILL.md`.
2. In Polylang, add the English translation of that page and use **"Copy content from
   Slovenian"** before opening Elementor. This duplicates the whole layout.
3. Swap the text in the duplicate. Layout, spacing and tokens carry over untouched.

Practical consequences:

- **A layout change after translation has to be made twice.** Get the Slovenian layout
  signed off before duplicating, or the rework doubles.
- **Header and footer** (Xpro Theme Builder templates 36 and 37) need either one template per
  language or Polylang-managed menus plus its Strings Translation panel. Menus are the
  lighter option: register the nav labels once and translate them there.
- **The contact form** — WPForms Lite has no built-in translation, so create one form per
  language. Two forms, two notification emails.
- **Zapisi categories** are taxonomy terms; Polylang translates them, and each needs its own
  slug (`vzorci` / `patterns`).
- **hreflang** tags and the `<html lang>` attribute are emitted by Polylang automatically.
  Do not hand-roll them.
- **Google Site Kit** is language-agnostic; it needs no per-language setup.

## The language switcher

Polylang supplies a switcher as a menu item and as a widget. Put it in the header, at the
end of the nav.

**Built in the prototype, 2026-09-18.** `chrome.js` renders it as the last item in
`.p-header__inner`, hard right after the nav. It reads `<html lang>` to pick the string
table, and links to the *counterpart of the page you are on* — `/coaching/` ↔
`/en/coaching/` — falling back to that language's home when there is no counterpart, which
is what Polylang does on the live site. Two entries, `SL` and `EN`; a third would need a
string table in `T` and an endonym in `LANGS`, and nothing else.

Never flags. Flags stand for countries, not languages. **One deviation from the original
note:** the *visible* mark is the two-letter code
`SL · EN · CS`, not the full endonym, because three full language names crowd a header that
already carries a five-item nav. The endonym is still there — **Slovenščina · English**,
each in a `.p-sr-only` span carrying its own `lang` attribute, so it is what a screen reader
announces. If she would rather see the full names, drop the `aria-hidden`
span and unhide the other one.

## Built on the live site, 2026-09-18

| Slovenian | id | English | id | URL |
|---|---|---|---|---|
| Domov | 22 | Home | 165 | `/en/` |
| Coaching | 24 | Coaching | 176 | `/en/about-coaching/` |
| O meni | 23 | About me | 177 | `/en/about/` |
| Zapisi | 25 | Notes | 178 | `/en/notes/` |
| Kontakt | 26 | Contact | 179 | `/en/contact/` |
| Politika zasebnosti | 27 | Privacy policy | 180 | `/en/privacy-policy/` |
| Politika piškotkov | 28 | Cookie policy | 181 | `/en/cookie-policy/` |
| Pravno obvestilo | 29 | Legal notice | 182 | `/en/legal-notice/` |

Each English page is a copy of its Slovenian `_elementor_data` with every text field
translated from a string map built by diffing the prototype's `site/` and `site/en/` pairs,
then linked with `pll_save_post_translations`. Audited afterwards: **zero Slovenian strings
remain in any of the eight.**

Menus: `Glavni meni` (term 3) is `sl`, `Main menu (EN)` (term 48) is `en`, linked as
translations and mapped to all four Blocksy locations per language. Polylang's switcher is
the last item of both menus, `show_names` on and `show_flags` off, rendering
*Slovenščina · English* in the header. The prototype shows `SL · EN`; that difference is
cosmetic and lives in `chrome.js`.

### Still Slovenian on the English pages

Two things, both needing a decision rather than more code:

1. **The footer's three static text widgets** — the tagline, the `Politika zasebnosti ·
   Piškotki · Pravno obvestilo` line and the disclaimer — are hardcoded in Xpro template 37,
   which is assigned to `basic-global` and has no per-language condition. The footer *menu*
   swaps correctly, because Polylang swaps menus by location. Fixing it means either a second
   footer template scoped to the English pages, or moving the legal links into a second
   Polylang-managed menu per language. Those links currently point at the Slovenian legal
   pages even on the English site.
2. **The contact form** is WPForms 50, Slovenian. As this document predicted, WPForms Lite
   needs one form per language: a second form with English labels and its own notification.

Neither blocks the English pages from being read; both are visible to an English reader.

## Session languages — not the same question

She coaches in all three languages, confirmed 2026-09-09. The contact page's language line
therefore reads *Slovenščina / angleščina / češčina*, and *Slovenian / English / Czech* on
the English page. This is the one copy line that goes beyond the source docx, which predates
the Czech decision and lists only Slovenian and English.

**Dropping Czech as a site language on 2026-09-18 did not change this line**, and that was
deliberate. The site being in two languages says nothing about which languages she is
willing to sit in a room and work in. If she no longer offers Czech sessions, this line and
its English counterpart both need editing, and the allow-list entry
`slovenscina anglescina cescina` in `tests/check_site.py` comes out with them.
