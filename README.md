# Pressence redesign prototype

A clickable static prototype of the redesigned [pressence.si](https://pressence.si), and the
design-token reference for the Elementor build that follows.

## Look at it

```bash
open site/index.html
```

No server, no build step, no dependencies. Every page is a real file; the nav works; the
Zapisi category filter and the FAQ accordion work.

## Check it

```bash
python3 tests/check_site.py
```

Ten structural checks across fourteen pages: link integrity, no hardcoded colours outside
`tokens.css`, `<title>`/description/`lang` on every page, alt text on every image,
placeholder tagging, `data-el` coverage, heading order, no unrendered `{{TOKEN}}` strings,
and chrome inclusion. Python 3 standard library only.

## Layout

| Path | What |
|---|---|
| `site/` | The prototype. Fourteen pages. |
| `site/assets/css/tokens.css` | Every design value. Mirrors the Elementor globals. |
| `source/` | The mockup and the copy doc, plus the extracted `copy.txt`. |
| `docs/DESIGN-SYSTEM.md` | Token tables in Elementor entry order, and the widget mapping. |
| `docs/NOVAMIRA-SKILL.md` | Load this before asking Novamira to build a page. |
| `docs/ASSETS.md` | Every image slot, its brief, and whether a real asset exists. |
| `docs/LAUNCH-BLOCKERS.md` | Five findings, two needing input from the client. |
| `docs/superpowers/specs/` | The approved design spec. |
| `tests/check_site.py` | The checker. |

## Important

- **Every image is a placeholder.** Tagged `data-placeholder="true"` with a `data-brief`
  describing the intended shot. See `docs/ASSETS.md`.
- **Five of six articles have unwritten bodies**, marked with a dashed `p-todo` block. The
  titles, categories, dates and teasers are final.
- **The three legal pages are scaffolds.** Headings only.
- **The `Samozavedanje` filter tab is intentionally empty** — none of the six proposed
  articles falls in that category. It resolves when real posts exist.
- **Elementor is on the free tier.** Do not reach for a Pro widget. See
  `docs/NOVAMIRA-SKILL.md`.
