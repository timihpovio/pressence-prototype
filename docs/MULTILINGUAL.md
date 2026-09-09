# Three languages: Slovenian, English, Czech

Slovenian is the source. English and Czech are drafted from it (see
`source/copy.en.md`, `source/copy.cs.md`) and **must be reviewed by the client before
launch** — they are written in her first-person voice.

## How WordPress does this

WordPress has no multilingual support of its own. It is always a plugin, and the plugin
choice decides the URL structure, so it has to be settled before the Elementor build starts.

| Plugin | Cost | Languages on free tier | Elementor fit |
|---|---|---|---|
| **Polylang** | free | unlimited | good — one page per language |
| WPML | from ~$39/yr | n/a (paid only) | best — String Translation covers widget text |
| TranslatePress | free tier | **one** extra language only | good, but two extra languages needs the paid tier |

**Recommendation: Polylang, free tier.** It is the only one of the three that does two extra
languages without a licence, which keeps the whole stack on the free tier the rest of this
project already assumes (Elementor free, Xpro free, WPForms Lite).

TranslatePress would otherwise be the easiest fit — it translates the rendered page, so the
Elementor layout is built once — but its free tier caps at one extra language. If a small
budget is available, revisit it: it is the cheapest way to avoid the duplication cost below.

## URL structure

Slovenian at the root, the other two in subdirectories. Polylang's default, and it leaves
every existing Slovenian URL untouched:

```
/coaching/          sl   (default language, no prefix)
/en/coaching/       en
/cs/koucovani/      cs
```

The prototype mirrors this exactly: `site/` is Slovenian, `site/en/`, `site/cs/`.

**Localise the slugs too** (`/en/coaching/`, `/cs/koucovani/`), rather than reusing the
Slovenian slug under a language prefix. Polylang handles this per page; it is worth the few
minutes for search visibility in each market.

## What this costs in the Elementor build

This is the part worth knowing up front: **Polylang gives each language its own page, with
its own Elementor layout.** It does not translate one layout on the fly.

So the build order changes:

1. Novamira builds the Slovenian page as documented in `NOVAMIRA-SKILL.md`.
2. In Polylang, add the English translation of that page and use **"Copy content from
   Slovenian"** before opening Elementor. This duplicates the whole layout.
3. Swap the text in the duplicate. Layout, spacing and tokens carry over untouched.
4. Repeat for Czech.

Practical consequences:

- **A layout change after translation has to be made three times.** Get the Slovenian
  layout signed off before duplicating, or the rework triples.
- **Header and footer** (Xpro Theme Builder templates 36 and 37) need either one template per
  language or Polylang-managed menus plus its Strings Translation panel. Menus are the
  lighter option: register the nav labels once and translate them there.
- **The contact form** — WPForms Lite has no built-in translation, so create one form per
  language. Three forms, three notification emails.
- **Zapisi categories** are taxonomy terms; Polylang translates them, and each needs its own
  slug (`vzorci` / `patterns` / `vzorce`).
- **hreflang** tags and the `<html lang>` attribute are emitted by Polylang automatically.
  Do not hand-roll them.
- **Google Site Kit** is language-agnostic; it needs no per-language setup.

## The language switcher

Polylang supplies a switcher as a menu item and as a widget. Put it in the header, at the
end of the nav. The prototype implements the same thing in `chrome.js` so the three-language
navigation can be clicked through before any of this exists in WordPress.

Show language names in their own language — **Slovenščina · English · Čeština** — never as
flags. Flags stand for countries, not languages, and Czech is a language spoken beyond one
border.

## Session languages

She coaches in all three languages, confirmed 2026-09-09. The contact page's language line
therefore reads *Slovenščina / angleščina / češčina* and its two translations. This is the
one copy line that goes beyond the source docx, which predates the Czech decision and lists
only Slovenian and English.
