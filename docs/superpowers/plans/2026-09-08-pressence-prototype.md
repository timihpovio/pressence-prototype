# Pressence Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fourteen-page clickable static HTML prototype of the redesigned pressence.si that doubles as the design-token and widget-mapping reference for the Elementor build.

**Architecture:** Plain static HTML, one page per file, opened directly from disk. A `tokens.css` file holds every design value and mirrors the Elementor global styles one-to-one; `site.css` holds layout and components and is forbidden from containing literal colours. Header and footer are rendered by `chrome.js` from a single data structure so navigation is edited in one place across fourteen pages. A zero-dependency Python checker (`tests/check_site.py`) enforces link integrity, token discipline, alt text, heading order, `data-el` coverage, and the absence of unrendered `{{PLACEHOLDER}}` tokens — the specific bug currently live on production.

**Tech Stack:** HTML5, CSS custom properties, vanilla ES2015 JavaScript, native `<details>` for the FAQ. Python 3.9 standard library for the checker (`html.parser`, no pytest, no pip installs). `curl` for asset fetching. No build step, no npm, no toolchain.

**Reference documents:**
- Spec: `docs/superpowers/specs/2026-09-08-pressence-redesign-design.md`
- Mockup: `source/Zasnova strani.png` (six screens plus footer)
- Copy: `source/Pressence Coaching Website Copy.docx`, extracted to `source/copy.txt` in Task 1

---

## File Structure

| File | Responsibility |
|---|---|
| `source/copy.txt` | Plain-text extraction of the copy doc. Single source for all Slovenian text. |
| `site/assets/css/tokens.css` | Every design value. Mirrors Elementor global colours and fonts. The only file allowed to contain a literal hex colour. |
| `site/assets/css/site.css` | Layout, panels, components. References tokens only. |
| `site/assets/js/chrome.js` | Header and footer markup from one nav data structure. Path-aware via `data-root`. |
| `site/assets/js/ui.js` | Mobile nav toggle, Zapisi category filter. FAQ needs no JS. |
| `site/index.html` | Domov |
| `site/coaching.html` | Coaching, including restored Oblike, Praktično, FAQ |
| `site/o-meni.html` | O meni |
| `site/zapisi.html` | Zapisi index with category filter |
| `site/zapisi/<slug>.html` | Six article pages, one full and five structured stubs |
| `site/kontakt.html` | Kontakt with form |
| `site/politika-zasebnosti.html`, `site/politika-piskotkov.html`, `site/pravno-obvestilo.html` | Legal, shared prose template |
| `site/assets/img/` | Stock placeholder photography |
| `site/assets/svg/` | Brand SVGs recoloured for the ivory palette |
| `docs/DESIGN-SYSTEM.md` | Token tables in Elementor entry order, plus file-to-slug map |
| `docs/ASSETS.md` | Every image slot: subject, crop, ratio, real asset if one exists |
| `docs/NOVAMIRA-SKILL.md` | Skill file driving the Elementor build |
| `docs/LAUNCH-BLOCKERS.md` | The five audit findings |
| `tests/check_site.py` | Zero-dependency structural checker |

**Slug map** — the prototype uses `.html` files because `file://` will not serve `index.html` for a directory URL. Production slugs are recorded in `docs/DESIGN-SYSTEM.md`:

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

Article slugs, matching the six titles in the copy doc:

| Slug | Title | Category | Date |
|---|---|---|---|
| `ni-vam-treba-takoj-vedeti-kaj-sledi` | Ni vam treba takoj vedeti, kaj sledi | Spremembe | 22. april 2024 |
| `ko-to-kar-je-nekoc-delovalo-ne-deluje-vec` | Ko to, kar je nekoč delovalo, ne deluje več | Vzorci | 18. maj 2024 |
| `zakaj-zavedanje-vzorca-se-ni-sprememba` | Zakaj zavedanje vzorca še ni sprememba | Vzorci | 5. maj 2024 |
| `coaching-ni-prostor-kjer-dobite-nasvet` | Coaching ni prostor, kjer dobite nasvet | Coaching | 8. april 2024 |
| `kaj-pomeni-zares-poslusati` | Kaj pomeni zares poslušati | Vodenje in odnosi | 25. marec 2024 |
| `kdo-ste-ko-odlozite-moram` | Kdo ste, ko odložite »moram«? | Odločitve | 11. marec 2024 |

Dates for the three cards visible in the mockup (18. maj, 5. maj, 22. april 2024) are taken from the mockup; the remaining three continue the same cadence backwards.

---

## Task 1: Copy extraction and test harness

**Files:**
- Create: `source/copy.txt`
- Create: `tests/check_site.py`

- [x] **Step 1: Extract the copy from the docx**

```bash
mkdir -p /tmp/pressence-docx && \
unzip -o -q "source/Pressence Coaching Website Copy.docx" -d /tmp/pressence-docx && \
python3 -c "
import re, html, io
x = io.open('/tmp/pressence-docx/word/document.xml', encoding='utf-8').read()
x = re.sub(r'</w:p>', '\n', x)
x = re.sub(r'<w:tab/>', '\t', x)
x = re.sub(r'<w:br/>', '\n', x)
x = re.sub(r'<[^>]+>', '', x)
io.open('source/copy.txt', 'w', encoding='utf-8').write(html.unescape(x))
"
```

- [x] **Step 2: Verify the extraction**

Run: `wc -l source/copy.txt && grep -c '^' source/copy.txt && grep -n '^DOMOV$\|^COACHING$\|^O MENI$\|^ZAPISI$\|^KONTAKT$\|^FOOTER$' source/copy.txt`

Expected: 394 lines, and six page headings found at lines 1, 133, 232, 306 and beyond. These headings are the anchors every later task refers to.

- [x] **Step 3: Write the failing checker**

Create `tests/check_site.py`. Python 3.9 — do not use `list[str]` or `match` syntax.

```python
#!/usr/bin/env python3
"""Structural checks for the Pressence prototype. No dependencies."""
import os
import re
import sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "site")

EXPECTED_PAGES = [
    "index.html", "coaching.html", "o-meni.html", "zapisi.html",
    "kontakt.html", "politika-zasebnosti.html", "politika-piskotkov.html",
    "pravno-obvestilo.html",
    "zapisi/ni-vam-treba-takoj-vedeti-kaj-sledi.html",
    "zapisi/ko-to-kar-je-nekoc-delovalo-ne-deluje-vec.html",
    "zapisi/zakaj-zavedanje-vzorca-se-ni-sprememba.html",
    "zapisi/coaching-ni-prostor-kjer-dobite-nasvet.html",
    "zapisi/kaj-pomeni-zares-poslusati.html",
    "zapisi/kdo-ste-ko-odlozite-moram.html",
]

FAILURES = []


def fail(check, detail):
    FAILURES.append("%s: %s" % (check, detail))


class PageParser(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self)
        self.links = []
        self.imgs = []
        self.headings = []
        self.sections = []
        self.has_title = False
        self.has_desc = False
        self.lang = None
        self.root_attr = None
        self.scripts = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html":
            self.lang = a.get("lang")
            self.root_attr = a.get("data-root")
        elif tag == "title":
            self.has_title = True
        elif tag == "meta" and a.get("name") == "description":
            self.has_desc = bool(a.get("content", "").strip())
        elif tag == "a" and a.get("href"):
            self.links.append(a["href"])
        elif tag == "img":
            self.imgs.append(a)
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self.headings.append(int(tag[1]))
        elif tag == "section":
            self.sections.append(a)
        elif tag == "script" and a.get("src"):
            self.scripts.append(a["src"])


def parse(rel):
    path = os.path.join(SITE, rel)
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    p = PageParser()
    p.feed(text)
    return p, text


def all_pages():
    found = []
    for base, _dirs, files in os.walk(SITE):
        for f in files:
            if f.endswith(".html"):
                found.append(os.path.relpath(os.path.join(base, f), SITE))
    return sorted(found)


def check_pages_exist():
    for rel in EXPECTED_PAGES:
        if not os.path.isfile(os.path.join(SITE, rel)):
            fail("pages_exist", "missing %s" % rel)


def check_links_resolve():
    for rel in all_pages():
        p, _ = parse(rel)
        base = os.path.dirname(os.path.join(SITE, rel))
        for href in p.links:
            if href.startswith(("http://", "https://", "mailto:", "tel:", "#")):
                continue
            target = os.path.normpath(os.path.join(base, href.split("#")[0]))
            if not os.path.exists(target):
                fail("links_resolve", "%s -> %s" % (rel, href))


def check_no_hardcoded_hex():
    hexre = re.compile(r"#[0-9a-fA-F]{3,8}\b")
    targets = [os.path.join(SITE, "assets/css/site.css")] + [
        os.path.join(SITE, r) for r in all_pages()
    ]
    for path in targets:
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as fh:
            for n, line in enumerate(fh, 1):
                if "href=" in line or "id=" in line:
                    continue
                if hexre.search(line):
                    fail("no_hardcoded_hex", "%s:%d" % (os.path.relpath(path, ROOT), n))


def check_head_metadata():
    for rel in all_pages():
        p, _ = parse(rel)
        if not p.has_title:
            fail("head_metadata", "%s has no <title>" % rel)
        if not p.has_desc:
            fail("head_metadata", "%s has no meta description" % rel)
        if p.lang != "sl":
            fail("head_metadata", "%s lang is %r, expected 'sl'" % (rel, p.lang))
        if p.root_attr not in ("./", "../"):
            fail("head_metadata", "%s data-root is %r" % (rel, p.root_attr))


def check_img_alt():
    for rel in all_pages():
        p, _ = parse(rel)
        for a in p.imgs:
            if "alt" not in a:
                fail("img_alt", "%s: img %s has no alt" % (rel, a.get("src")))


def check_placeholders_tagged():
    for rel in all_pages():
        p, _ = parse(rel)
        for a in p.imgs:
            src = a.get("src", "")
            if "/img/" in src and a.get("data-placeholder") != "true":
                fail("placeholders_tagged", "%s: %s not tagged" % (rel, src))


def check_sections_have_data_el():
    for rel in all_pages():
        p, _ = parse(rel)
        if not p.sections:
            fail("sections_have_data_el", "%s has no <section>" % rel)
        for a in p.sections:
            if not a.get("data-el"):
                fail("sections_have_data_el",
                     "%s: section %r lacks data-el" % (rel, a.get("id") or a.get("class")))


def check_heading_order():
    for rel in all_pages():
        p, _ = parse(rel)
        if not p.headings:
            fail("heading_order", "%s has no headings" % rel)
            continue
        if p.headings[0] != 1:
            fail("heading_order", "%s starts at h%d" % (rel, p.headings[0]))
        if p.headings.count(1) != 1:
            fail("heading_order", "%s has %d h1s" % (rel, p.headings.count(1)))
        prev = p.headings[0]
        for h in p.headings[1:]:
            if h > prev + 1:
                fail("heading_order", "%s skips h%d -> h%d" % (rel, prev, h))
            prev = h


def check_no_unrendered_placeholders():
    """The specific bug live on production: {{TOKEN}} shipped to visitors."""
    for rel in all_pages():
        _, text = parse(rel)
        for m in re.finditer(r"\{\{[A-Z_ŠČŽ]+\}\}", text):
            fail("no_unrendered_placeholders", "%s: %s" % (rel, m.group(0)))


def check_chrome_included():
    for rel in all_pages():
        p, _ = parse(rel)
        if not any("chrome.js" in s for s in p.scripts):
            fail("chrome_included", "%s does not load chrome.js" % rel)


CHECKS = [
    check_pages_exist,
    check_links_resolve,
    check_no_hardcoded_hex,
    check_head_metadata,
    check_img_alt,
    check_placeholders_tagged,
    check_sections_have_data_el,
    check_heading_order,
    check_no_unrendered_placeholders,
    check_chrome_included,
]


def main():
    if not os.path.isdir(SITE):
        print("FAIL site/ does not exist")
        return 1
    for check in CHECKS:
        check()
    if FAILURES:
        print("%d failure(s):" % len(FAILURES))
        for f in FAILURES:
            print("  " + f)
        return 1
    print("All %d checks passed across %d pages." % (len(CHECKS), len(all_pages())))
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [x] **Step 4: Run the checker to verify it fails**

Run: `python3 tests/check_site.py`
Expected: exit 1, printing `FAIL site/ does not exist`.

- [x] **Step 5: Commit**

```bash
git add source/copy.txt tests/check_site.py
git commit -m "Add copy extraction and structural checker

The checker enforces link integrity, token discipline, alt text, heading
order, data-el coverage and the absence of unrendered {{PLACEHOLDER}}
tokens - the bug currently live on pressence.si.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2: Design tokens

**Files:**
- Create: `site/assets/css/tokens.css`

- [x] **Step 1: Write the token file**

Every comment records the Elementor global this value becomes. This file is the read-off for `docs/DESIGN-SYSTEM.md` and the only file permitted to contain a literal hex colour.

```css
/* tokens.css - mirrors the Elementor global styles one-to-one.
   Elementor: Site Settings > Global Colors / Global Fonts.
   The ONLY file allowed to contain literal hex values. */

:root {
  /* --- Global Colors ------------------------------------------------ */
  --p-ink:    #1E1F1B;  /* Elementor Primary   | label "Ink"    | headings, logotype */
  --p-olive:  #3A4032;  /* Elementor Secondary | label "Olive"  | footer, primary button */
  --p-body:   #4A4C45;  /* Elementor Text      | label "Body"   | body copy */
  --p-sage:   #D7D6CC;  /* Elementor Accent    | label "Sage"   | accent panels, active */
  --p-ivory:  #FAF8F5;  /* custom              | label "Ivory"  | page ground, cards */
  --p-panel:  #EEECE8;  /* custom              | label "Panel"  | secondary panels, rails */
  --p-muted:  #71736A;  /* custom              | label "Muted"  | meta, labels, captions */
  --p-line:   #E2DFD8;  /* custom              | label "Line"   | hairlines, field borders */

  /* --- Global Fonts ------------------------------------------------- */
  /* Elementor "Display" and "Heading" */
  --p-font-display: "EB Garamond", Georgia, "Times New Roman", serif;
  /* Elementor "Body" and "Label" */
  --p-font-body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* --- Type scale --------------------------------------------------- */
  --p-h1: clamp(40px, 5vw, 64px);
  --p-h2: clamp(28px, 3.2vw, 40px);
  --p-h3: clamp(20px, 2vw, 24px);
  --p-lead: clamp(17px, 1.4vw, 20px);
  --p-base: 16px;
  --p-small: 14px;
  --p-label: 12px;

  --p-lh-tight: 1.15;
  --p-lh-heading: 1.25;
  --p-lh-body: 1.75;
  --p-ls-label: 0.08em;
  --p-ls-h1: -0.01em;

  /* --- Space and measure ------------------------------------------- */
  --p-container: 1160px;
  --p-measure: 62ch;
  --p-panel-y: clamp(64px, 9vw, 128px);
  --p-gutter: clamp(20px, 4vw, 40px);
  --p-gap: clamp(24px, 3vw, 48px);
  --p-gap-sm: 16px;

  /* --- Other ------------------------------------------------------- */
  --p-radius: 2px;
  --p-hairline: 1px solid var(--p-line);
  --p-ease: cubic-bezier(0.22, 0.61, 0.36, 1);
}
```

- [x] **Step 2: Verify every token is used at least once later**

This is checked at the end, in Task 14. For now confirm the file parses:

Run: `python3 -c "
import io,re
s=io.open('site/assets/css/tokens.css',encoding='utf-8').read()
names=re.findall(r'(--p-[a-z0-9-]+):',s)
print(len(names),'tokens'); assert len(names)==len(set(names)),'duplicate token'
assert s.count('{')==s.count('}'),'unbalanced braces'
print('ok')
"`

Expected: `31 tokens` then `ok`.

- [x] **Step 3: Commit**

```bash
git add site/assets/css/tokens.css
git commit -m "Add design tokens mirroring Elementor global styles

Each token carries the Elementor global label it becomes, so the Novamira
skill file is a read-off rather than a translation. This is the documented
mitigation for the agent hardcoding hex values instead of referencing globals.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3: Base stylesheet and page chrome

**Files:**
- Create: `site/assets/css/site.css`
- Create: `site/assets/js/chrome.js`
- Create: `site/assets/js/ui.js`

- [x] **Step 1: Write `site.css`**

Panels, container, type, buttons, header, footer. No literal colours — the checker enforces this.

```css
@import url("tokens.css");

/* --- reset ------------------------------------------------------- */
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--p-ivory);
  color: var(--p-body);
  font: var(--p-base)/var(--p-lh-body) var(--p-font-body);
}
img { max-width: 100%; height: auto; display: block; }
a { color: inherit; }

/* --- type -------------------------------------------------------- */
h1, h2, h3, h4 {
  font-family: var(--p-font-display);
  font-weight: 400;
  color: var(--p-ink);
  margin: 0 0 0.6em;
}
h1 { font-size: var(--p-h1); line-height: var(--p-lh-tight); letter-spacing: var(--p-ls-h1); }
h2 { font-size: var(--p-h2); line-height: var(--p-lh-heading); }
h3 { font-size: var(--p-h3); line-height: var(--p-lh-heading); }
p { margin: 0 0 1.1em; max-width: var(--p-measure); }
.p-lead { font-size: var(--p-lead); color: var(--p-body); }
.p-label {
  font: 500 var(--p-label)/1.4 var(--p-font-body);
  letter-spacing: var(--p-ls-label);
  text-transform: uppercase;
  color: var(--p-muted);
  margin: 0 0 1.2em;
}
.p-serif-statement {
  font-family: var(--p-font-display);
  font-size: var(--p-h2);
  line-height: var(--p-lh-heading);
  color: var(--p-ink);
  max-width: 30ch;
}

/* --- panels ------------------------------------------------------ */
.p-panel { padding: var(--p-panel-y) var(--p-gutter); border-bottom: var(--p-hairline); }
.p-panel--ivory { background: var(--p-ivory); }
.p-panel--panel { background: var(--p-panel); }
.p-panel--sage  { background: var(--p-sage); }
.p-panel--olive { background: var(--p-olive); color: var(--p-ivory); }
.p-panel--olive h1, .p-panel--olive h2, .p-panel--olive h3 { color: var(--p-ivory); }
.p-panel--flush { padding-left: 0; padding-right: 0; }
.p-container { max-width: var(--p-container); margin-inline: auto; }
.p-narrow { max-width: 72ch; margin-inline: auto; }

/* --- grids ------------------------------------------------------- */
.p-grid { display: grid; gap: var(--p-gap); }
.p-grid--2 { grid-template-columns: repeat(2, 1fr); }
.p-grid--3 { grid-template-columns: repeat(3, 1fr); }
.p-split { display: grid; gap: var(--p-gap); align-items: center; grid-template-columns: 1fr 1fr; }

/* --- cards ------------------------------------------------------- */
.p-card { background: var(--p-ivory); border: var(--p-hairline); padding: var(--p-gap); }
.p-card__num {
  font: 500 var(--p-label)/1 var(--p-font-body);
  letter-spacing: var(--p-ls-label);
  color: var(--p-muted);
  display: block;
  margin-bottom: 1em;
}
.p-card h3 { margin-bottom: 0.4em; }
.p-card p { margin-bottom: 0; }

/* --- buttons ----------------------------------------------------- */
.p-btn {
  display: inline-block;
  background: var(--p-olive);
  color: var(--p-ivory);
  font: 500 var(--p-small)/1 var(--p-font-body);
  letter-spacing: 0.02em;
  padding: 16px 28px;
  border: 0;
  border-radius: var(--p-radius);
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s var(--p-ease);
}
.p-btn:hover { opacity: 0.85; }
.p-btn--ghost { background: transparent; color: var(--p-ink); border: var(--p-hairline); }
.p-link-arrow {
  font: 500 var(--p-small)/1 var(--p-font-body);
  text-decoration: none;
  color: var(--p-ink);
  border-bottom: 1px solid var(--p-line);
  padding-bottom: 3px;
}

/* --- header ------------------------------------------------------ */
.p-header {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--p-gap);
  padding: 20px var(--p-gutter);
  background: var(--p-ivory);
  border-bottom: var(--p-hairline);
}
.p-logo {
  font: 400 24px/1 var(--p-font-display);
  color: var(--p-ink);
  text-decoration: none;
  letter-spacing: 0.01em;
}
.p-nav { display: flex; gap: clamp(16px, 2.5vw, 36px); }
.p-nav a {
  font: 400 var(--p-small)/1 var(--p-font-body);
  color: var(--p-body);
  text-decoration: none;
}
.p-nav a[aria-current="page"] { color: var(--p-ink); font-weight: 500; }
.p-burger { display: none; background: none; border: 0; padding: 8px; cursor: pointer; }

/* --- footer ------------------------------------------------------ */
.p-footer { background: var(--p-olive); color: var(--p-ivory); padding: var(--p-panel-y) var(--p-gutter); }
.p-footer a { color: var(--p-ivory); text-decoration: none; }
.p-footer__grid { display: grid; gap: var(--p-gap); grid-template-columns: 1.2fr 1.4fr 1fr; }
.p-footer__logo { font: 400 28px/1 var(--p-font-display); margin-bottom: 0.5em; display: block; }
.p-footer__nav { display: flex; flex-wrap: wrap; gap: clamp(16px, 2vw, 32px); font-family: var(--p-font-display); font-size: 18px; }
.p-footer__legal { font-size: var(--p-small); opacity: 0.8; }
.p-footer__disclaimer { font-size: var(--p-small); opacity: 0.8; max-width: 46ch; margin-top: 1.5em; }

/* --- utilities --------------------------------------------------- */
.p-skip {
  position: absolute; left: -9999px;
  background: var(--p-ink); color: var(--p-ivory); padding: 12px 20px; z-index: 50;
}
.p-skip:focus { left: 12px; top: 12px; }
[data-placeholder="true"] { background: var(--p-panel); }
.p-figure--bleed { margin: 0; }
.p-figure--bleed img { width: 100%; object-fit: cover; }

/* --- responsive -------------------------------------------------- */
@media (max-width: 860px) {
  .p-grid--3, .p-grid--2, .p-split, .p-footer__grid { grid-template-columns: 1fr; }
  .p-burger { display: block; }
  .p-nav {
    position: absolute; top: 100%; left: 0; right: 0;
    flex-direction: column; gap: 0;
    background: var(--p-ivory);
    border-bottom: var(--p-hairline);
    padding: 8px var(--p-gutter) 20px;
  }
  .p-nav[hidden] { display: none; }
  .p-nav a { padding: 12px 0; border-bottom: var(--p-hairline); }
}
```

- [x] **Step 2: Write `chrome.js`**

One nav structure, path-aware through `data-root` on `<html>`. Uses `document.write`-free DOM insertion and runs on `file://` because it is a local `<script src>`, not a `fetch`.

```javascript
/* chrome.js - renders the header and footer from a single nav structure.
   Every page sets <html data-root="./"> or <html data-root="../">. */
(function () {
  var root = document.documentElement.getAttribute("data-root") || "./";
  var current = document.body.getAttribute("data-page") || "";

  var NAV = [
    { slug: "domov",    label: "Domov",    href: "index.html" },
    { slug: "coaching", label: "Coaching", href: "coaching.html" },
    { slug: "o-meni",   label: "O meni",   href: "o-meni.html" },
    { slug: "zapisi",   label: "Zapisi",   href: "zapisi.html" },
    { slug: "kontakt",  label: "Kontakt",  href: "kontakt.html" }
  ];

  var LEGAL = [
    { label: "Politika zasebnosti", href: "politika-zasebnosti.html" },
    { label: "Piškotki",            href: "politika-piskotkov.html" },
    { label: "Pravno obvestilo",    href: "pravno-obvestilo.html" }
  ];

  function url(href) { return root + href; }

  function navLinks(cls) {
    return NAV.map(function (item) {
      var aria = item.slug === current ? ' aria-current="page"' : "";
      return '<a href="' + url(item.href) + '"' + aria + ">" + item.label + "</a>";
    }).join("");
  }

  var header =
    '<a class="p-skip" href="#main">Preskoči na vsebino</a>' +
    '<header class="p-header" data-el="xpro-theme-builder:header(template 36)">' +
      '<a class="p-logo" href="' + url("index.html") + '">Pressence</a>' +
      '<button class="p-burger" type="button" aria-expanded="false" aria-controls="p-nav" aria-label="Meni">' +
        '<svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">' +
          '<path d="M0 1h22M0 7h22M0 13h22" stroke="currentColor" stroke-width="1.2"/>' +
        "</svg>" +
      "</button>" +
      '<nav class="p-nav" id="p-nav" aria-label="Glavna navigacija" data-el="xpro-horizontal-menu">' +
        navLinks() +
      "</nav>" +
    "</header>";

  var footer =
    '<footer class="p-footer" data-el="xpro-theme-builder:footer(template 37)">' +
      '<div class="p-container p-footer__grid">' +
        "<div>" +
          '<span class="p-footer__logo">Pressence</span>' +
          "<p>Prostor za jasnejši stik s sabo.</p>" +
        "</div>" +
        '<nav class="p-footer__nav" aria-label="Navigacija v nogi">' + navLinks() + "</nav>" +
        '<div class="p-footer__legal">' +
          "<p>© Pressence 2026</p>" +
          "<p>" + LEGAL.map(function (l) {
            return '<a href="' + url(l.href) + '">' + l.label + "</a>";
          }).join(" · ") + "</p>" +
        "</div>" +
      "</div>" +
      '<div class="p-container">' +
        '<p class="p-footer__disclaimer">Coaching ni nadomestilo za psihoterapijo, ' +
        "zdravstveno obravnavo ali drugo ustrezno strokovno pomoč.</p>" +
      "</div>" +
    "</footer>";

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer);
})();
```

- [x] **Step 3: Write `ui.js`**

```javascript
/* ui.js - mobile nav toggle and the Zapisi category filter.
   The FAQ uses native <details> and needs no JavaScript. */
(function () {
  var burger = document.querySelector(".p-burger");
  var nav = document.getElementById("p-nav");

  function syncNav() {
    if (!nav) { return; }
    var small = window.matchMedia("(max-width: 860px)").matches;
    nav.hidden = small && burger.getAttribute("aria-expanded") !== "true";
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      syncNav();
    });
    window.addEventListener("resize", syncNav);
    syncNav();
  }

  var filter = document.querySelector("[data-filter]");
  if (filter) {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-cat]"));
    filter.addEventListener("click", function (event) {
      var btn = event.target.closest("button[data-filter-cat]");
      if (!btn) { return; }
      var want = btn.getAttribute("data-filter-cat");
      filter.querySelectorAll("button[data-filter-cat]").forEach(function (b) {
        b.setAttribute("aria-selected", String(b === btn));
      });
      cards.forEach(function (card) {
        card.hidden = want !== "vsi" && card.getAttribute("data-cat") !== want;
      });
    });
  }
})();
```

- [x] **Step 4: Verify the JS parses**

Run: `node --check site/assets/js/chrome.js && node --check site/assets/js/ui.js && echo "js ok"`
Expected: `js ok`

- [x] **Step 5: Commit**

```bash
git add site/assets/css/site.css site/assets/js/chrome.js site/assets/js/ui.js
git commit -m "Add base stylesheet and shared page chrome

Header and footer render from one nav structure in chrome.js so navigation
is edited once across fourteen pages. site.css references tokens only and
contains no literal colours.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4: Page boilerplate and the Domov hero

**Files:**
- Create: `site/index.html`

- [x] **Step 1: Write the page shell with the hero section**

This shell is the template every later page copies. Note `data-root="./"`, `data-page`, the `#main` target for the skip link, and `data-el` on the section.

Copy source: `source/copy.txt`, section `DOMOV` → `Hero`.

```html
<!doctype html>
<html lang="sl" data-root="./">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pressence — Prostor za jasnejši stik s sabo</title>
<meta name="description" content="Coaching za trenutke, ko veste, da se nekaj spreminja, vendar še ne veste povsem, kam vas to vodi. V Mariboru ali na spletu.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/site.css">
</head>
<body data-page="domov">

<main id="main">

  <section class="p-panel p-panel--flush" data-el="container:hero">
    <div class="p-split p-container">
      <div>
        <h1>Prostor, kjer lahko za trenutek odložite vse odgovore.</h1>
        <p class="p-lead">Coaching za trenutke, ko veste, da se nekaj spreminja, vendar še ne veste povsem, kam vas to vodi.</p>
        <p>Prostor za jasnejši pogled nase, svoje odločitve, vzorce in naslednje korake.</p>
        <p>
          <a class="p-btn" href="kontakt.html" data-el="xpro-button">Začnimo pogovor</a>
        </p>
        <p class="p-label">V Mariboru ali na spletu.</p>
      </div>
      <figure class="p-figure--bleed" data-el="image">
        <img src="assets/img/hero-oljka.jpg" alt="Oljčna vejica v topli popoldanski svetlobi"
             width="1200" height="900" data-placeholder="true"
             data-brief="backlit olive branch, warm late-afternoon light, shallow depth of field">
      </figure>
    </div>
  </section>

</main>

<script src="assets/js/chrome.js"></script>
<script src="assets/js/ui.js"></script>
</body>
</html>
```

- [x] **Step 2: Run the checker to see it fail on the missing image and pages**

Run: `python3 tests/check_site.py`
Expected: exit 1. Failures include `pages_exist: missing coaching.html` (and the other twelve) plus `links_resolve: index.html -> assets/img/hero-oljka.jpg`. The image arrives in Task 11; the pages in Tasks 5–10.

- [x] **Step 3: Open the page and confirm the chrome renders**

Run: `open site/index.html`
Expected: sticky ivory header with the `Pressence` logotype left and five nav links right, `Domov` in a heavier weight; the hero heading in EB Garamond; a broken-image box where the photo will go; the deep olive footer with logotype, nav, legal links and the psychotherapy disclaimer.

- [x] **Step 4: Commit**

```bash
git add site/index.html
git commit -m "Add Domov hero and the shared page shell

Establishes the boilerplate every page copies: data-root for path-aware
chrome, data-page for the active nav link, #main skip target, data-el
annotations naming the intended Elementor widget.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 5: Domov, remaining ten sections

**Files:**
- Modify: `site/index.html`

Copy source: `source/copy.txt`, section `DOMOV`, subsections in this order: `Uvodno vprašanje`, `Morda ste trenutno tukaj`, `Kaj je coaching`, `Kaj vam lahko coaching prinese`, `Moj način dela`, `O meni – kratka predstavitev`, `Kako poteka`, `Zaupanje`, `Zapisi`, `Zaključni CTA`. Use the Slovenian text **verbatim** — it is final copy, not a draft.

- [x] **Step 1: Add the Uvodno vprašanje and Morda ste trenutno tukaj sections**

Insert after the hero `</section>`. The six cards are the six situations in the copy; the first is shown in full, and the remaining five follow the identical pattern with their own heading and paragraph from the copy doc.

```html
  <section class="p-panel p-panel--ivory" data-el="container:statement">
    <div class="p-container p-narrow">
      <h2>Kaj bi lahko slišali, če bi si zares dovolili prisluhniti sebi?</h2>
      <p>V vsakdanjem tempu pogosto iščemo odgovore zunaj sebe.</p>
      <p>V nasvetih. Pričakovanjih. V tem, kaj bi morali. V tem, kar smo vedno počeli.</p>
      <p>Coaching ustvari drugačen prostor.</p>
      <p>Prostor, kjer se lahko ustavite, pogledate nekoliko globlje in začnete prepoznavati, kaj je v tem trenutku resnično vaše.</p>
    </div>
  </section>

  <section class="p-panel p-panel--panel" data-el="container:cards-6">
    <div class="p-container">
      <p class="p-label">Morda ste trenutno tukaj</p>
      <h2>Nekaj v vašem življenju se premika.</h2>
      <p class="p-lead">Morda še nima imena. Morda ga že dolgo poznate.</p>
      <div class="p-grid p-grid--3">
        <article class="p-card" data-el="container:card">
          <h3>Pred pomembno odločitvijo</h3>
          <p>Pred vami je več možnosti, nobena pa se ne zdi povsem jasna.</p>
        </article>
        <!-- Repeat this <article> for each of the remaining five, verbatim from
             source/copy.txt > DOMOV > "Morda ste trenutno tukaj":
             "Sredi spremembe", "V starem vzorcu",
             "Uspešni, vendar ne povsem usklajeni s sabo",
             "Na kariernem ali osebnem razpotju", "Z več odgovornosti" -->
      </div>
    </div>
  </section>
```

- [x] **Step 2: Add Kaj je coaching and Kaj vam lahko coaching prinese**

```html
  <section class="p-panel p-panel--ivory" data-el="container:text-cta">
    <div class="p-container p-narrow">
      <p class="p-label">Kaj je coaching</p>
      <h2>Ne gre za to, da vam nekdo pove, kaj morate narediti.</h2>
      <p>Verjamem, da imamo ljudje v sebi pogosto več odgovorov, kot se jih zavedamo.</p>
      <p>Včasih jih preglasijo strah, stare navade, pričakovanja okolice ali načini delovanja, ki so nam nekoč pomagali, danes pa nas morda omejujejo.</p>
      <p>Coaching je prostor, kjer lahko to začnete opazovati.</p>
      <p>S pogovorom, vprašanji, poslušanjem in refleksijo postopoma ustvarjava več jasnosti o tem, kaj se dogaja, kaj vas podpira, kaj vas zadržuje in kam želite naprej.</p>
      <p><a class="p-link-arrow" href="coaching.html">Več o coachingu →</a></p>
    </div>
  </section>

  <section class="p-panel p-panel--panel" data-el="container:cards-6">
    <div class="p-container">
      <p class="p-label">Kaj vam lahko coaching prinese</p>
      <h2>Več zavedanja. Več izbire.</h2>
      <div class="p-grid p-grid--3">
        <article class="p-card" data-el="container:card">
          <h3>Jasnejši pogled</h3>
          <p>Ko stvari izrečemo in jih pogledamo z različnih perspektiv, pogosto dobijo drugačno obliko.</p>
        </article>
        <!-- Repeat verbatim for: "Globlje samozavedanje", "Bolj zavestne odločitve",
             "Nove perspektive", "Konkretne premike", "Več stika s sabo" -->
      </div>
    </div>
  </section>
```

- [x] **Step 3: Add Moj način dela and the short O meni**

The seven working principles are the `icon-list` widget. The O meni panel carries the portrait.

```html
  <section class="p-panel p-panel--ivory" data-el="container:text-list">
    <div class="p-container p-narrow">
      <p class="p-label">Moj način dela</p>
      <h2>Miren prostor. Iskren pogovor. Brez potrebe po popolnih odgovorih.</h2>
      <p>Pri coachingu mi je pomembno, da vas ne vidim samo skozi cilj ali težavo, s katero pridete.</p>
      <p>Zanima me človek kot celota.</p>
      <p>Vaše izkušnje. Vrednote. Prepričanja. Čustva. Odnosi. Vzorci. Način, kako sprejemate odločitve in kako ste se do danes naučili delovati v svetu.</p>
      <p>Pri delu:</p>
      <ul data-el="icon-list">
        <li>poslušam brez presoje in brez hitenja k rešitvi,</li>
        <li>ostajam radovedna tudi tam, kjer odgovor ni takoj jasen,</li>
        <li>postavljam vprašanja, ki odpirajo nove perspektive,</li>
        <li>opozorim na vzorce in opažanja, ki se pokažejo v pogovoru,</li>
        <li>spoštujem vaš tempo in vašo edinstvenost,</li>
        <li>ne odločam namesto vas,</li>
        <li>podpiram vas, da do lastnih odgovorov pridete sami.</li>
      </ul>
      <p>Ker globina ne pomeni pritiska.</p>
      <p><a class="p-link-arrow" href="coaching.html">Spoznajte moj pristop →</a></p>
    </div>
  </section>

  <section class="p-panel p-panel--flush p-panel--panel" data-el="container:split-portrait">
    <div class="p-split p-container">
      <figure class="p-figure--bleed" data-el="image">
        <img src="assets/img/portret-o-meni.jpg" alt="Portret coachinje ob naravni svetlobi"
             width="1000" height="1250" data-placeholder="true"
             data-brief="warm editorial portrait, cream cardigan, natural window light, looking off-camera">
      </figure>
      <div>
        <p class="p-label">O meni</p>
        <h2>Tudi sama sem morala najprej začeti poslušati sebe.</h2>
        <p>Moja pot v coaching ni bila samo odločitev za novo kariero.</p>
        <p>Bila je tudi osebna pot stran od načina življenja, v katerem sem dolgo verjela, da moram biti močna, imeti odgovore in predvsem nadaljevati.</p>
        <p>Delo na sebi mi je pokazalo nekaj drugega.</p>
        <p>Da sprememba pogosto ne pomeni postati nekdo drug. Včasih pomeni počasi odložiti tisto, kar nam ne služi več, da lahko pridemo bližje sebi.</p>
        <p>Ta izkušnja danes pomembno oblikuje tudi način, kako delam z ljudmi.</p>
        <p><a class="p-link-arrow" href="o-meni.html">Več o meni →</a></p>
      </div>
    </div>
  </section>
```

- [x] **Step 4: Add Kako poteka, Zaupanje, Zapisi and the closing CTA**

```html
  <section class="p-panel p-panel--ivory" data-el="container:steps-5">
    <div class="p-container">
      <p class="p-label">Kako poteka</p>
      <h2>En proces. Vaš tempo.</h2>
      <div class="p-grid p-grid--3">
        <article class="p-card" data-el="container:step">
          <span class="p-card__num">01</span>
          <h3>Spoznava se</h3>
          <p>Začneva z uvodnim pogovorom. Brez obveznosti. Preveriva, kaj potrebujete in ali vam moj način dela ustreza.</p>
        </article>
        <!-- Repeat verbatim for 02 "Poimenujeva, kaj je pomembno", 03 "Pogledava globlje",
             04 "Uvid poveževa z življenjem", 05 "Proces sproti prilagajava" -->
      </div>
      <p><a class="p-link-arrow" href="coaching.html">Kako coaching poteka →</a></p>
    </div>
  </section>

  <section class="p-panel p-panel--sage" data-el="container:statement">
    <div class="p-container p-narrow">
      <p class="p-label">Zaupanje</p>
      <h2>Prostor mora biti varen, da je lahko iskren.</h2>
      <p>Zaupnost, jasni dogovori, profesionalne meje in spoštovanje vaše avtonomije so zame temelj coaching odnosa.</p>
      <p>Moja naloga ni, da prevzamem odgovornost za vaše odločitve ali vam povem, kako morate živeti.</p>
      <p>Moja naloga je ustvariti dovolj varen in jasen prostor, da lahko svoje odgovore začnete prepoznavati sami.</p>
      <p>Coaching prav tako ni nadomestilo za psihoterapijo, zdravstveno obravnavo ali drugo strokovno pomoč. Če presodim, da coaching ni ustrezna oblika podpore za vašo situacijo, bom to z vami odkrito naslovila.</p>
    </div>
  </section>

  <section class="p-panel p-panel--ivory" data-el="xpro-post-grid:latest-3">
    <div class="p-container">
      <p class="p-label">Zapisi</p>
      <h2>Misli za trenutke, ko želite pogledati nekoliko globlje.</h2>
      <p class="p-lead">Pišem o coachingu, spremembah, samozavedanju, notranjih vzorcih, odločitvah in odnosu, ki ga gradimo sami s sabo.</p>
      <p>Ne kot seznam pravil. Bolj kot povabilo k razmisleku.</p>
      <p><a class="p-link-arrow" href="zapisi.html">Preberite zapise →</a></p>
    </div>
  </section>

  <section class="p-panel p-panel--olive" data-el="container:cta">
    <div class="p-container p-narrow">
      <h2>Morda ne potrebujete odgovora. Morda najprej potrebujete prostor.</h2>
      <p>Prvi pogovor je namenjen temu, da se spoznava in ugotoviva, ali vam moj način dela lahko koristi.</p>
      <p>Brez obveznosti nadaljevanja.</p>
      <p><a class="p-btn p-btn--ghost" href="kontakt.html" data-el="xpro-button">Začnimo pogovor</a></p>
    </div>
  </section>
```

- [x] **Step 5: Verify heading order and section coverage**

Run: `python3 tests/check_site.py 2>&1 | grep -E "heading_order|sections_have_data_el" || echo "heading order and data-el clean"`
Expected: `heading order and data-el clean`

- [x] **Step 6: Commit**

```bash
git add site/index.html
git commit -m "Complete the Domov page

Eleven sections, copy verbatim from source/copy.txt. Every panel carries a
data-el annotation naming the Elementor widget it becomes.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 6: Coaching page

**Files:**
- Create: `site/coaching.html`

Copy source: `source/copy.txt`, section `COACHING`. The FAQ, Oblike and Praktično sections are **not** in the copy doc — they are rewritten from the live site's `/coaching/` page in the copy doc's warmer voice, per the spec.

- [x] **Step 1: Create the page with hero and the sticky side-rail layout**

Add this rule to `site/assets/css/site.css` first — the side-rail cannot use Elementor's Pro sticky effect, so it is `position: sticky` from the global stylesheet:

```css
.p-rail-layout { display: grid; gap: var(--p-gap); grid-template-columns: 220px 1fr; align-items: start; }
.p-rail { position: sticky; top: 96px; display: flex; flex-direction: column; gap: 14px; }
.p-rail a { font: 400 var(--p-small)/1.3 var(--p-font-body); color: var(--p-muted); text-decoration: none; }
.p-rail a:hover { color: var(--p-ink); }
@media (max-width: 860px) { .p-rail-layout { grid-template-columns: 1fr; } .p-rail { position: static; } }
```

Then the page. Shell identical to `index.html` except `data-page="coaching"`, its own `<title>` and description.

```html
<!doctype html>
<html lang="sl" data-root="./">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Coaching — Pressence</title>
<meta name="description" content="Coaching je prostor za raziskovanje tega, kar je trenutno pomembno za vas. Kako delam, kako poteka sodelovanje in kaj lahko pričakujete.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/site.css">
</head>
<body data-page="coaching">

<main id="main">

  <section class="p-panel p-panel--flush p-panel--sage" data-el="container:hero">
    <div class="p-split p-container">
      <div>
        <h1>Ni vam treba imeti vsega razjasnjenega, da lahko začnete.</h1>
        <p class="p-lead">Coaching je prostor za raziskovanje tega, kar je trenutno pomembno za vas.</p>
      </div>
      <figure class="p-figure--bleed" data-el="image">
        <img src="assets/img/skodelica-lan.jpg" alt="Keramična skodelica na lanenem prtu"
             width="1200" height="900" data-placeholder="true"
             data-brief="stoneware cup on linen cloth with dried gypsophila, soft daylight">
      </figure>
    </div>
  </section>

  <section class="p-panel p-panel--ivory" data-el="container:rail-content">
    <div class="p-container p-rail-layout">
      <nav class="p-rail" aria-label="Na tej strani" data-el="container:anchor-nav">
        <a href="#kaj-je-coaching">Kaj je coaching</a>
        <a href="#filozofija">Moja filozofija</a>
        <a href="#kaj-ni">Kaj coaching ni</a>
        <a href="#kako-delam">Kako delam</a>
        <a href="#prisotnost">Prisotnost in poslušanje</a>
        <a href="#potek">Potek sodelovanja</a>
        <a href="#oblike">Oblike sodelovanja</a>
        <a href="#prakticno">Praktično</a>
        <a href="#vprasanja">Pogosta vprašanja</a>
        <a href="#zaupnost">Zaupnost in etika</a>
      </nav>
      <div>
        <h2 id="kaj-je-coaching">Kaj je coaching</h2>
        <p class="p-lead">Proces, v katerem začnete bolje slišati sebe.</p>
        <p>Coaching razumem kot varen, zaupen in razvojno usmerjen proces.</p>
        <p>Ne spreminja človeka od zunaj in ne ponuja univerzalnih receptov.</p>
        <p>Omogoči vam, da se za trenutek umaknete od vsakodnevnega tempa, pričakovanj in avtomatskega delovanja ter na svojo situacijo pogledate z nekoliko več distance.</p>
        <p>V pogovoru lahko odpirava vprašanja, ki si jih sami morda težko zastavite.</p>
        <ul data-el="icon-list">
          <li>Kaj se v resnici dogaja?</li>
          <li>Kaj je za vas pomembno?</li>
          <li>Kaj se ponavlja?</li>
          <li>Kaj vas podpira?</li>
          <li>Kaj vas omejuje?</li>
          <li>Kaj potrebujete?</li>
          <li>Kaj bi izbrali, če bi iz enačbe za trenutek odstranili pričakovanja drugih?</li>
        </ul>
        <p>Cilj ni popoln odgovor.</p>
        <p>Cilj je več jasnosti, več zavedanja in možnost bolj zavestne izbire.</p>
      </div>
    </div>
  </section>
</main>

<script src="assets/js/chrome.js"></script>
<script src="assets/js/ui.js"></script>
</body>
</html>
```

- [x] **Step 2: Add Moja filozofija, Kaj coaching ni, Kako delam, Prisotnost**

Insert these panels before `</main>`. `Kaj coaching ni` uses the two-column comparison restored from the live site rather than the copy doc's flat list.

Add to `site.css`:

```css
.p-compare { display: grid; gap: var(--p-gap); grid-template-columns: 1fr 1fr; }
.p-compare__col { border: var(--p-hairline); padding: var(--p-gap); background: var(--p-ivory); }
.p-compare ul { list-style: none; padding: 0; margin: 0; }
.p-compare li { padding: 10px 0; border-bottom: var(--p-hairline); }
.p-compare li:last-child { border-bottom: 0; }
@media (max-width: 860px) { .p-compare { grid-template-columns: 1fr; } }
```

```html
  <section class="p-panel p-panel--panel" data-el="container:statement">
    <div class="p-container p-narrow">
      <p class="p-label">Moja filozofija</p>
      <h2 id="filozofija">Odgovori niso vedno odsotni. Včasih so samo prekriti.</h2>
      <p>Verjamem, da vsak človek v sebi nosi veliko modrosti, moči in odgovorov.</p>
      <p>Včasih jih težko slišimo, ker jih prekrivajo strahovi, stari vzorci, pričakovanja, pretekle izkušnje ali identitete, ki so nam nekoč pomagale, danes pa nam morda ne služijo več.</p>
      <p>Zame se sprememba začne z zavedanjem.</p>
      <p>Ko nekaj lahko vidimo, lahko do tega vzpostavimo drugačen odnos.</p>
      <p>In ko imamo drugačen odnos, dobimo tudi več možnosti za izbiro.</p>
    </div>
  </section>

  <section class="p-panel p-panel--ivory" data-el="container:compare">
    <div class="p-container">
      <h2 id="kaj-ni">Kaj coaching je in kaj ni</h2>
      <p class="p-lead">Ne svetujem vam, kako živeti svoje življenje.</p>
      <div class="p-compare">
        <div class="p-compare__col" data-el="icon-list">
          <h3>Coaching je</h3>
          <ul>
            <li>sodelovalen</li>
            <li>usmerjen naprej</li>
            <li>reflektiven</li>
            <li>podpora dejanju</li>
            <li>voden z vaše strani</li>
            <li>zaupen</li>
          </ul>
        </div>
        <div class="p-compare__col" data-el="icon-list">
          <h3>Coaching ni</h3>
          <ul>
            <li>svetovanje</li>
            <li>mentorstvo</li>
            <li>terapija</li>
            <li>diagnosticiranje</li>
            <li>dajanje pripravljenih rešitev</li>
            <li>prepričevanje, kaj je za vas prav</li>
          </ul>
        </div>
      </div>
      <p>Kot coach ne prevzemam vloge nekoga, ki vaše življenje pozna bolje od vas.</p>
      <p>Lahko pa sem ob vas tako, da skupaj ustvariva prostor, v katerem ga lahko jasneje vidite vi.</p>
    </div>
  </section>

  <section class="p-panel p-panel--panel" data-el="container:text-list">
    <div class="p-container p-narrow">
      <p class="p-label">Kako delam</p>
      <h2 id="kako-delam">Človek pred ciljem.</h2>
      <p>Cilji so pomembni, vendar sami po sebi ne povedo celotne zgodbe.</p>
      <p>Zato me ob vašem cilju zanima tudi, kdo ste vi v odnosu do njega.</p>
      <ul data-el="icon-list">
        <li>Kako razmišljate.</li>
        <li>Kaj čutite.</li>
        <li>Česa se bojite.</li>
        <li>Katere vrednote so vam pomembne.</li>
        <li>Kje se pojavijo stari vzorci.</li>
        <li>Kaj se zgodi tik pred odločitvijo.</li>
        <li>Kaj naredite, ko postane neprijetno.</li>
        <li>Kaj je vaše in kaj ste morda dolgo počeli predvsem zato, ker se je od vas pričakovalo.</li>
      </ul>
      <p>Coaching tako postane več kot pogovor o cilju.</p>
      <p>Postane raziskovanje načina, na katerega ste z njim povezani.</p>
    </div>
  </section>

  <section class="p-panel p-panel--ivory" data-el="container:statement">
    <div class="p-container p-narrow">
      <p class="p-label">Prisotnost in poslušanje</p>
      <h2 id="prisotnost">Pomembno je tudi tisto, kar ostane med besedami.</h2>
      <p>Pri delu ne poslušam samo vsebine.</p>
      <p>Pozorna sem tudi na ponavljajoče se besede, spremembe v tonu, čustva, energijo, tišino in trenutke, ko se nekaj v pogovoru spremeni.</p>
      <p>Včasih prav tam leži vprašanje, ki ga je vredno raziskati.</p>
      <p>Ne zato, da bi vam povedala, kaj nekaj pomeni.</p>
      <p>Temveč zato, da lahko skupaj preveriva, kaj pomeni za vas.</p>
    </div>
  </section>
```

- [x] **Step 3: Add Potek sodelovanja and the restored Oblike sodelovanja**

`Potek` is verbatim from the copy doc. `Oblike` is restored, with **no prices** — the copy doc's position is that investment is discussed in the intro call, and the live site's `{{CENA_PLACEHOLDER}}` must not reappear.

```html
  <section class="p-panel p-panel--panel" data-el="container:steps-5">
    <div class="p-container">
      <p class="p-label">Potek sodelovanja</p>
      <h2 id="potek">Pet korakov, en proces.</h2>
      <div class="p-grid p-grid--3">
        <article class="p-card" data-el="container:step">
          <span class="p-card__num">01</span>
          <h3>Uvodni pogovor</h3>
          <p>Najprej se spoznava. Poveste mi, kaj vas je pripeljalo do coachinga, kaj trenutno potrebujete in kaj pričakujete. Tudi sama vam predstavim način dela in odgovorim na vprašanja. Namen prvega pogovora je predvsem preveriti, ali si želiva sodelovati.</p>
        </article>
        <!-- Repeat verbatim from source/copy.txt > COACHING > "Potek sodelovanja" for
             02 "Opredelitev fokusa", 03 "Coaching srečanja",
             04 "Prenos v življenje", 05 "Refleksija procesa" -->
      </div>
    </div>
  </section>

  <section class="p-panel p-panel--ivory" data-el="container:cards-4">
    <div class="p-container">
      <p class="p-label">Oblike sodelovanja</p>
      <h2 id="oblike">Načini, na katere lahko sodelujeva.</h2>
      <p class="p-lead">To niso paketi. So različne oblike, ki jih izbereva glede na to, na čem delate.</p>
      <div class="p-grid p-grid--2">
        <article class="p-card" data-el="container:card">
          <h3>Uvodni pogovor</h3>
          <p class="p-label">Na spletu ali v Mariboru · brez stroška in obveznosti</p>
          <p>Prvo srečanje, na katerem se spoznava in preveriva, ali vam moj način dela ustreza.</p>
        </article>
        <article class="p-card" data-el="container:card">
          <h3>Posamezno srečanje</h3>
          <p class="p-label">Eno srečanje</p>
          <p>Osredotočen pogovor za eno odločitev, eno situacijo, en vozel.</p>
        </article>
        <article class="p-card" data-el="container:card">
          <h3>Coaching pot</h3>
          <p class="p-label">Več srečanj v dogovorjenem ritmu</p>
          <p>Običajna oblika dela. Dovolj kontinuitete, da vzorci pridejo na površje in se lahko začnejo spreminjati.</p>
        </article>
        <article class="p-card" data-el="container:card">
          <h3>Dolgoročno sodelovanje</h3>
          <p class="p-label">Za ljudi z več odgovornosti</p>
          <p>Stalen pogovor za tiste, katerih odločitve nosijo težo tudi za druge.</p>
        </article>
      </div>
      <p>O naložbi se odkrito pogovoriva v uvodnem pogovoru, pred kakršno koli zavezo. Cene tukaj niso objavljene, ker je prava oblika odvisna od tega, na čem delate.</p>
    </div>
  </section>
```

- [x] **Step 4: Add the restored Praktično section**

Seven items. Every one carries a real answer — no `{{TRAJANJE}}`-style placeholders, which the checker enforces.

```html
  <section class="p-panel p-panel--panel" data-el="container:cards-7">
    <div class="p-container">
      <p class="p-label">Praktično</p>
      <h2 id="prakticno">Kaj lahko pričakujete.</h2>
      <div class="p-grid p-grid--3">
        <article class="p-card" data-el="container:card">
          <h3>Trajanje srečanja</h3>
          <p>Srečanje traja približno eno uro.</p>
        </article>
        <article class="p-card" data-el="container:card">
          <h3>Kje se srečava</h3>
          <p>V živo v Mariboru ali po video povezavi.</p>
        </article>
        <article class="p-card" data-el="container:card">
          <h3>Pogostost</h3>
          <p>Ritem določiva skupaj in ga prilagajava vašemu tempu.</p>
        </article>
        <article class="p-card" data-el="container:card">
          <h3>Zaupnost</h3>
          <p>Vse, kar je izrečeno na srečanju, ostane med nama, z običajnimi zakonskimi izjemami ob tveganju za škodo.</p>
        </article>
        <article class="p-card" data-el="container:card">
          <h3>Priprava</h3>
          <p>Ni potrebna. Če želite kaj zapisati vnaprej, je tudi to dobrodošlo.</p>
        </article>
        <article class="p-card" data-el="container:card">
          <h3>Po prvem pogovoru</h3>
          <p>Vzamete si čas. Če vam ustreza, se dogovoriva za obliko. Če ne, je tudi to povsem v redu.</p>
        </article>
        <article class="p-card" data-el="container:card">
          <h3>Jezik</h3>
          <p>Srečanja potekajo v slovenščini ali angleščini. Izberite tistega, v katerem mislite brez prevajanja sebe.</p>
        </article>
      </div>
    </div>
  </section>
```

- [x] **Step 5: Add the FAQ using native `<details>`**

Native `<details>` is keyboard accessible with zero JavaScript and maps to Elementor's free core Accordion widget. Xpro's Advance Accordion is Pro and must not be used.

Add to `site.css`:

```css
.p-faq { border-top: var(--p-hairline); max-width: var(--p-measure); }
.p-faq details { border-bottom: var(--p-hairline); }
.p-faq summary {
  cursor: pointer; list-style: none; padding: 20px 0;
  font-family: var(--p-font-display); font-size: var(--p-h3);
  color: var(--p-ink); display: flex; justify-content: space-between; gap: 16px;
}
.p-faq summary::-webkit-details-marker { display: none; }
.p-faq summary::after { content: "+"; color: var(--p-muted); font-family: var(--p-font-body); }
.p-faq details[open] summary::after { content: "–"; }
.p-faq details p { padding-bottom: 20px; margin: 0; }
```

```html
  <section class="p-panel p-panel--ivory" data-el="elementor-core:accordion">
    <div class="p-container">
      <p class="p-label">Pogosta vprašanja</p>
      <h2 id="vprasanja">Preden se odločite.</h2>
      <div class="p-faq">
        <details>
          <summary>Kako vem, ali je coaching pravi zame?</summary>
          <p>Če nekaj vedno znova premlevate in sami ne pridete nikamor, coaching običajno pomaga. Uvodni pogovor obstaja prav zato, da to skupaj ugotoviva, brez obveznosti.</p>
        </details>
        <details>
          <summary>Kaj se zgodi na uvodnem pogovoru?</summary>
          <p>Opišete, kaj vas zaposluje. Zastavim nekaj vprašanj. Obe se iskreno odločiva, ali nadaljujeva. Na koncu ni prodajnega nagovora.</p>
        </details>
        <details>
          <summary>Ali je coaching zaupen?</summary>
          <p>Da. Nič izrečenega se ne deli, z običajnimi zakonskimi izjemami ob tveganju resne škode.</p>
        </details>
        <details>
          <summary>Ali ponujate spletna srečanja?</summary>
          <p>Da, po video povezavi. Veliko ljudi dela povsem na spletu in globina zaradi tega ni manjša.</p>
        </details>
        <details>
          <summary>Se lahko srečava v živo v Mariboru?</summary>
          <p>Da, srečanja v živo potekajo v Mariboru.</p>
        </details>
        <details>
          <summary>Koliko srečanj bom potrebovala ali potreboval?</summary>
          <p>Odvisno od tega, na čem delate. Nekaterim zadostujejo tri srečanja, drugim koristi daljša pot. Obliko določiva skupaj in jo sproti pregledujeva.</p>
        </details>
        <details>
          <summary>V čem je razlika med coachingom in terapijo?</summary>
          <p>Terapija pogosto dela s celjenjem in preteklostjo. Coaching dela z jasnostjo, izbiro in tem, kar sledi. Nista v nasprotju in eno ne nadomešča drugega.</p>
        </details>
        <details>
          <summary>Lahko coaching pokriva poklicne in osebne teme?</summary>
          <p>Skoraj vedno oboje. Oseba, ki odloča v službi, je ista oseba, ki gre domov.</p>
        </details>
        <details>
          <summary>V katerih jezikih poteka?</summary>
          <p>V slovenščini in angleščini.</p>
        </details>
        <details>
          <summary>Kaj, če ugotoviva, da si ne ustrezava?</summary>
          <p>Potem to jasno poveva, in kjer lahko, vas usmerim k nekomu primernejšemu. Jasen ne je koristen izid.</p>
        </details>
        <details>
          <summary>Kaj pa odpovedi srečanja?</summary>
          <p>Če srečanja ne morete opraviti, mi to sporočite čim prej in poiščeva nov termin.</p>
        </details>
      </div>
    </div>
  </section>
```

- [x] **Step 6: Add Etičnost in zaupnost and the CTA**

```html
  <section class="p-panel p-panel--sage" data-el="container:statement">
    <div class="p-container p-narrow">
      <p class="p-label">Etičnost in zaupnost</p>
      <h2 id="zaupnost">Profesionalen odnos se začne z jasnimi mejami.</h2>
      <p>Zaupnost razumem kot temelj coaching odnosa.</p>
      <p>Pomembno mi je tudi, da veste, kaj od coachinga lahko pričakujete, kaj je moja odgovornost in kaj ostaja vaša.</p>
      <p>Spoštujem vaše odločitve in avtonomijo.</p>
      <p>Ne prevzemam vloge terapevta, svetovalca ali nekoga, ki bi vedel bolje od vas.</p>
      <p>Pomemben del odgovornega coachinga je zame tudi stalna refleksija lastnega dela, zavedanje svojih kompetenc in pripravljenost poiskati strokovno podporo ali vas usmeriti drugam, kadar coaching ni ustrezna oblika pomoči.</p>
    </div>
  </section>

  <section class="p-panel p-panel--olive" data-el="container:cta">
    <div class="p-container p-narrow">
      <h2>Začetek je lahko samo pogovor.</h2>
      <p>Ni vam treba vedeti, koliko srečanj potrebujete ali natančno poimenovati, kaj želite spremeniti.</p>
      <p>Za začetek je dovolj, da veste, da želite nekaj pogledati drugače.</p>
      <p><a class="p-btn p-btn--ghost" href="kontakt.html" data-el="xpro-button">Dogovorite se za uvodni pogovor</a></p>
    </div>
  </section>
```

- [x] **Step 7: Verify the anchor links all resolve**

Run: `python3 -c "
import io,re
s=io.open('site/coaching.html',encoding='utf-8').read()
anchors=set(re.findall(r'href=\"#([a-z-]+)\"',s))
ids=set(re.findall(r'id=\"([a-z-]+)\"',s))
missing=anchors-ids
print('missing targets:',missing or 'none')
assert not missing
"`
Expected: `missing targets: none`

- [x] **Step 8: Commit**

```bash
git add site/coaching.html site/assets/css/site.css
git commit -m "Add Coaching page with restored formats, practical details and FAQ

Eleven sections. The FAQ uses native <details>, which maps to Elementor's
free core Accordion; Xpro's Advance Accordion is Pro and unavailable. The
sticky side-rail uses position: sticky from the global stylesheet because
Elementor sticky is a Pro motion effect.

No prices and no {{PLACEHOLDER}} tokens: investment is discussed in the
intro call, per the copy doc.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 7: O meni page

**Files:**
- Create: `site/o-meni.html`

Copy source: `source/copy.txt`, section `O MENI`, all subsections verbatim: `Hero`, `Moja zgodba`, `Ko začneš drugače gledati nase`, `Sprememba, ki ni postajanje nekdo drug`, `Zakaj coaching`, `Kako želim biti ob klientu`, `Nekaj, v kar verjamem`, `CTA`.

- [x] **Step 1: Create the page with hero and portrait**

Shell identical to `index.html`, with `data-page="o-meni"`.

```html
<!doctype html>
<html lang="sl" data-root="./">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>O meni — Pressence</title>
<meta name="description" content="Moja pot do coachinga se ni začela s coachingom. O tem, kako sem začela poslušati sebe in kako to danes oblikuje moje delo z ljudmi.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/site.css">
</head>
<body data-page="o-meni">

<main id="main">

  <section class="p-panel p-panel--flush p-panel--ivory" data-el="container:hero">
    <div class="p-split p-container">
      <div>
        <h1>Moja pot do coachinga se ni začela s coachingom.</h1>
        <p class="p-lead">Začela se je z občutkom, da način, na katerega sem dolgo živela in delovala, ni več ves odgovor.</p>
      </div>
      <figure class="p-figure--bleed" data-el="image">
        <img src="assets/img/portret-hero.jpg" alt="Portret coachinje ob oknu v naravni svetlobi"
             width="1000" height="1100" data-placeholder="true"
             data-brief="editorial portrait, warm neutral knitwear, window light, three-quarter view looking away from camera">
      </figure>
    </div>
  </section>

  <section class="p-panel p-panel--panel" data-el="container:prose">
    <div class="p-container p-narrow">
      <p class="p-label">Moja zgodba</p>
      <h2>Dolgo sem gradila življenje in kariero znotraj identitete, ki mi je veliko dala.</h2>
      <p>Znala sem biti močna. Prevzeti odgovornost. Nadaljevati. Poskrbeti, da stvari delujejo.</p>
      <p>Dolgo sem verjela, da je prav to tisto, kar moram biti.</p>
      <p>Hkrati pa želja po globljem delu z ljudmi nikoli ni zares izginila.</p>
      <p>Odločitev za coaching je zato pomenila veliko več kot spremembo poklicne smeri.</p>
      <p>Pomenila je tudi pripravljenost pogledati vase.</p>
    </div>
  </section>
</main>

<script src="assets/js/chrome.js"></script>
<script src="assets/js/ui.js"></script>
</body>
</html>
```

- [x] **Step 2: Add the three narrative sections**

```html
  <section class="p-panel p-panel--ivory" data-el="container:prose">
    <div class="p-container p-narrow">
      <h2>Ko začneš drugače gledati nase</h2>
      <p>Izobraževanje za coaching me ni učilo samo metod in vprašanj.</p>
      <p>Velik del procesa je bilo delo na sebi.</p>
      <p>Začela sem prepoznavati svoje odzive, prepričanja, stare vzorce in načine, s katerimi sem se skozi življenje naučila zaščititi ali prilagoditi.</p>
      <p>Posebej pomembno je bilo zame raziskovanje nezavednih vzorcev in arhetipov.</p>
      <p>Sčasoma sem začela razumeti, da težko resnično spremljam drugega človeka, če sama nisem pripravljena pogledati v svoje notranje procese.</p>
      <p>To spoznanje je postalo eden temeljev mojega dela.</p>
    </div>
  </section>

  <section class="p-panel p-panel--sage" data-el="container:prose">
    <div class="p-container p-narrow">
      <h2>Sprememba, ki ni postajanje nekdo drug</h2>
      <p>Na začetku svoje poti sem imela občutek, da se spreminjam v drugo osebo.</p>
      <p>Danes to vidim drugače.</p>
      <p>Nisem postajala nekdo drug.</p>
      <p>Postopoma sem se približevala delu sebe, ki je bil dolgo prekrit z vlogami, pričakovanji in načini delovanja, ki sem jih nekoč potrebovala.</p>
      <p>Zato tudi pri delu z ljudmi ne izhajam iz ideje, da jih je treba »popraviti«.</p>
      <p class="p-serif-statement">Kaj se lahko spremeni, ko začnete bolje razumeti sebe?</p>
    </div>
  </section>

  <section class="p-panel p-panel--ivory" data-el="container:prose">
    <div class="p-container p-narrow">
      <h2>Zakaj coaching</h2>
      <p>Coaching me je pritegnil, ker sem sama izkusila, kako dragocen je prostor, v katerem te nekdo ne poskuša popravljati.</p>
      <p>Prostor, kjer ti ni treba takoj vedeti.</p>
      <p>Kjer lahko nekaj izrečeš in prvič zares slišiš.</p>
      <p>Kjer te nekdo spremlja z dovolj prisotnosti, da začneš sam prepoznavati svoje odgovore.</p>
      <p>Takšen prostor želim ustvarjati tudi sama.</p>
    </div>
  </section>
```

- [x] **Step 3: Add Kako želim biti ob klientu and Nekaj, v kar verjamem**

The five qualities are cards; the closing belief is a serif statement block.

```html
  <section class="p-panel p-panel--panel" data-el="container:cards-5">
    <div class="p-container">
      <p class="p-label">Kako želim biti ob klientu</p>
      <h2>Pet stvari, ki jih prinesem v pogovor.</h2>
      <div class="p-grid p-grid--3">
        <article class="p-card" data-el="container:card">
          <h3>Prisotna</h3>
          <p>Da poslušam, ne da medtem pripravljam odgovor.</p>
        </article>
        <article class="p-card" data-el="container:card">
          <h3>Radovedna</h3>
          <p>Da ne predvidevam, da vem, kaj nekaj pomeni za vas.</p>
        </article>
        <article class="p-card" data-el="container:card">
          <h3>Iskrena</h3>
          <p>Da lahko poimenujem, kar opazim, tudi kadar odpira zahtevnejše vprašanje.</p>
        </article>
        <article class="p-card" data-el="container:card">
          <h3>Spoštljiva</h3>
          <p>Do vaše zgodbe, vašega tempa in vaših odločitev.</p>
        </article>
        <article class="p-card" data-el="container:card">
          <h3>Odgovorna</h3>
          <p>Da poznam meje svojega dela in ves čas razvijam tudi sebe kot coacha.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="p-panel p-panel--ivory" data-el="container:statement">
    <div class="p-container p-narrow">
      <p class="p-label">Nekaj, v kar verjamem</p>
      <h2>Spremembe se redko zgodijo čez noč.</h2>
      <p>Pogosto pridejo počasi.</p>
      <p>Plast za plastjo.</p>
      <p>Najprej nekaj opazimo.</p>
      <p>Potem razumemo.</p>
      <p>Nato do tega vzpostavimo drugačen odnos.</p>
      <p>In nekega dne v situaciji, v kateri bi nekoč avtomatsko naredili isto stvar, ugotovimo, da imamo izbiro.</p>
      <p>Prav ta trenutek se mi zdi eden najdragocenejših delov osebnega razvoja.</p>
    </div>
  </section>

  <section class="p-panel p-panel--olive" data-el="container:cta">
    <div class="p-container p-narrow">
      <h2>Če želite preveriti, ali bi vam moj način dela ustrezal, se lahko najprej samo spoznava.</h2>
      <p><a class="p-btn p-btn--ghost" href="kontakt.html" data-el="xpro-button">Začnimo pogovor</a></p>
    </div>
  </section>
```

- [x] **Step 4: Verify the page**

Run: `python3 tests/check_site.py 2>&1 | grep "o-meni" || echo "o-meni clean"`
Expected: only `links_resolve` failures for the two not-yet-downloaded images, or `o-meni clean`.

- [x] **Step 5: Commit**

```bash
git add site/o-meni.html
git commit -m "Add O meni page

Eight sections, copy verbatim. Female verb forms throughout, matching the
copy doc and correcting the live site's neutral underscore forms.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 8: Zapisi index with working category filter

**Files:**
- Create: `site/zapisi.html`
- Modify: `site/assets/css/site.css`

- [x] **Step 1: Add the filter and card CSS**

```css
.p-filter { display: flex; flex-wrap: wrap; gap: clamp(12px, 2vw, 28px); border-bottom: var(--p-hairline); padding-bottom: 14px; margin-bottom: var(--p-gap); }
.p-filter button {
  background: none; border: 0; padding: 6px 0; cursor: pointer;
  font: 400 var(--p-small)/1 var(--p-font-body); color: var(--p-muted);
  border-bottom: 2px solid transparent;
}
.p-filter button[aria-selected="true"] { color: var(--p-ink); border-bottom-color: var(--p-ink); }
.p-post { border: var(--p-hairline); background: var(--p-ivory); display: flex; flex-direction: column; }
.p-post img { aspect-ratio: 4 / 3; object-fit: cover; }
.p-post__body { padding: var(--p-gap-sm) var(--p-gap-sm) var(--p-gap); display: flex; flex-direction: column; gap: 10px; flex: 1; }
.p-post__body h3 { font-size: var(--p-h3); margin: 0; }
.p-post__meta { font: 400 var(--p-small)/1 var(--p-font-body); color: var(--p-muted); }
.p-post__body .p-link-arrow { margin-top: auto; align-self: flex-start; }
```

- [x] **Step 2: Create the page**

Card order matches the mockup: the three visible cards first. Every card carries `data-cat` for the filter, matching the category names in the filter buttons.

```html
<!doctype html>
<html lang="sl" data-root="./">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Zapisi — Pressence</title>
<meta name="description" content="Zapisi o coachingu, samozavedanju, spremembah, odločitvah in odnosu do sebe. Ne kot navodila za življenje, ampak kot vprašanja in perspektive.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/site.css">
</head>
<body data-page="zapisi">

<main id="main">

  <section class="p-panel p-panel--flush p-panel--panel" data-el="container:hero">
    <div class="p-split p-container">
      <div>
        <h1>Za branje, ko potrebujete nekaj prostora za razmislek.</h1>
        <p class="p-lead">Zapisi o coachingu, samozavedanju, spremembah, odločitvah in odnosu do sebe.</p>
        <p>Ne kot navodila za življenje. Kot vprašanja in perspektive, ki lahko odprejo nekaj novega.</p>
      </div>
      <figure class="p-figure--bleed" data-el="image">
        <img src="assets/img/vaza-susene-roze.jpg" alt="Vaza s posušenimi cvetovi ob keramični skledi"
             width="1200" height="900" data-placeholder="true"
             data-brief="still life, vase with dried flowers beside a stoneware bowl, cream wall, soft side light">
      </figure>
    </div>
  </section>

  <section class="p-panel p-panel--ivory" data-el="xpro-post-grid">
    <div class="p-container">
      <div class="p-filter" data-filter role="tablist" aria-label="Kategorije zapisov">
        <button type="button" data-filter-cat="vsi" aria-selected="true">Vsi zapisi</button>
        <button type="button" data-filter-cat="samozavedanje" aria-selected="false">Samozavedanje</button>
        <button type="button" data-filter-cat="spremembe" aria-selected="false">Spremembe</button>
        <button type="button" data-filter-cat="vzorci" aria-selected="false">Vzorci</button>
        <button type="button" data-filter-cat="odlocitve" aria-selected="false">Odločitve</button>
        <button type="button" data-filter-cat="coaching" aria-selected="false">Coaching</button>
        <button type="button" data-filter-cat="vodenje-in-odnosi" aria-selected="false">Vodenje in odnosi</button>
      </div>

      <div class="p-grid p-grid--3">
        <article class="p-post" data-cat="vzorci" data-el="container:post-card">
          <img src="assets/img/zapis-01.jpg" alt="Gorska pot v jutranji svetlobi" width="834" height="626"
               data-placeholder="true" data-brief="mountain road curving through golden hills, morning light">
          <div class="p-post__body">
            <h3><a href="zapisi/ko-to-kar-je-nekoc-delovalo-ne-deluje-vec.html">Ko to, kar je nekoč delovalo, ne deluje več</a></h3>
            <p class="p-post__meta">18. maj 2024 · Vzorci</p>
            <a class="p-link-arrow" href="zapisi/ko-to-kar-je-nekoc-delovalo-ne-deluje-vec.html">Preberi zapis →</a>
          </div>
        </article>

        <article class="p-post" data-cat="vzorci" data-el="container:post-card">
          <img src="assets/img/zapis-02.jpg" alt="Sence listov na svetli steni" width="834" height="626"
               data-placeholder="true" data-brief="leaf shadows on a pale wall, high-contrast afternoon light">
          <div class="p-post__body">
            <h3><a href="zapisi/zakaj-zavedanje-vzorca-se-ni-sprememba.html">Zakaj zavedanje vzorca še ni sprememba</a></h3>
            <p class="p-post__meta">5. maj 2024 · Vzorci</p>
            <a class="p-link-arrow" href="zapisi/zakaj-zavedanje-vzorca-se-ni-sprememba.html">Preberi zapis →</a>
          </div>
        </article>

        <article class="p-post" data-cat="spremembe" data-el="container:post-card">
          <img src="assets/img/zapis-03.jpg" alt="Zloženo laneno platno ob keramični skodelici" width="834" height="626"
               data-placeholder="true" data-brief="folded linen beside a stoneware cup, warm neutral still life">
          <div class="p-post__body">
            <h3><a href="zapisi/ni-vam-treba-takoj-vedeti-kaj-sledi.html">Ni vam treba takoj vedeti, kaj sledi</a></h3>
            <p class="p-post__meta">22. april 2024 · Spremembe</p>
            <a class="p-link-arrow" href="zapisi/ni-vam-treba-takoj-vedeti-kaj-sledi.html">Preberi zapis →</a>
          </div>
        </article>

        <article class="p-post" data-cat="coaching" data-el="container:post-card">
          <img src="assets/img/zapis-04.jpg" alt="Dva stola ob nizki mizi v mirnem prostoru" width="834" height="626"
               data-placeholder="true" data-brief="two chairs facing each other in a calm neutral room">
          <div class="p-post__body">
            <h3><a href="zapisi/coaching-ni-prostor-kjer-dobite-nasvet.html">Coaching ni prostor, kjer dobite nasvet</a></h3>
            <p class="p-post__meta">8. april 2024 · Coaching</p>
            <a class="p-link-arrow" href="zapisi/coaching-ni-prostor-kjer-dobite-nasvet.html">Preberi zapis →</a>
          </div>
        </article>

        <article class="p-post" data-cat="vodenje-in-odnosi" data-el="container:post-card">
          <img src="assets/img/zapis-05.jpg" alt="Odprt zvezek in svinčnik na leseni mizi" width="834" height="626"
               data-placeholder="true" data-brief="open notebook and pencil on a wooden table, quiet morning light">
          <div class="p-post__body">
            <h3><a href="zapisi/kaj-pomeni-zares-poslusati.html">Kaj pomeni zares poslušati</a></h3>
            <p class="p-post__meta">25. marec 2024 · Vodenje in odnosi</p>
            <a class="p-link-arrow" href="zapisi/kaj-pomeni-zares-poslusati.html">Preberi zapis →</a>
          </div>
        </article>

        <article class="p-post" data-cat="odlocitve" data-el="container:post-card">
          <img src="assets/img/zapis-06.jpg" alt="Razcep gozdne poti med bukvami" width="834" height="626"
               data-placeholder="true" data-brief="forked path in a beech forest, soft diffused light">
          <div class="p-post__body">
            <h3><a href="zapisi/kdo-ste-ko-odlozite-moram.html">Kdo ste, ko odložite »moram«?</a></h3>
            <p class="p-post__meta">11. marec 2024 · Odločitve</p>
            <a class="p-link-arrow" href="zapisi/kdo-ste-ko-odlozite-moram.html">Preberi zapis →</a>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="p-panel p-panel--olive" data-el="container:cta">
    <div class="p-container p-narrow">
      <h2>Če je zapis odprl nekaj, kar bi želeli raziskati v pogovoru, mi lahko pišete.</h2>
      <p><a class="p-btn p-btn--ghost" href="kontakt.html" data-el="xpro-button">Začnimo pogovor</a></p>
    </div>
  </section>

</main>

<script src="assets/js/chrome.js"></script>
<script src="assets/js/ui.js"></script>
</body>
</html>
```

Note: `Samozavedanje` has no article among the six, so that tab correctly filters to nothing. Record this in Task 14's handoff notes — it is expected, not a bug, and resolves when real posts exist.

- [x] **Step 3: Verify every filter category is either used or knowingly empty**

Run: `python3 -c "
import io,re
s=io.open('site/zapisi.html',encoding='utf-8').read()
cats=set(re.findall(r'data-filter-cat=\"([a-z-]+)\"',s))-{'vsi'}
used=set(re.findall(r'data-cat=\"([a-z-]+)\"',s))
print('filter tabs:',sorted(cats))
print('used by posts:',sorted(used))
print('empty tabs (expected: samozavedanje):',sorted(cats-used))
assert used<=cats, 'a post uses a category with no tab'
"`

Expected: `empty tabs (expected: samozavedanje): ['samozavedanje']` and no assertion error.

- [x] **Step 4: Commit**

```bash
git add site/zapisi.html site/assets/css/site.css
git commit -m "Add Zapisi index with working category filter

Six cards matching the copy doc's proposed articles, three of them in the
mockup's order. The filter is client-side JS in the prototype; in Elementor
it becomes xpro-post-grid, whose free-tier taxonomy filtering needs
verification during the build.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 9: Article template and the one full article

**Files:**
- Create: `site/zapisi/ni-vam-treba-takoj-vedeti-kaj-sledi.html`
- Modify: `site/assets/css/site.css`

- [x] **Step 1: Add article CSS**

```css
.p-article { display: grid; gap: var(--p-gap); grid-template-columns: 1fr 280px; align-items: start; }
.p-article__body { max-width: var(--p-measure); }
.p-article__body h2 { font-size: var(--p-h3); margin-top: 1.8em; }
.p-crumb { font: 400 var(--p-small)/1 var(--p-font-body); color: var(--p-muted); margin: 0 0 var(--p-gap); }
.p-crumb a { text-decoration: none; }
.p-aside { position: sticky; top: 96px; background: var(--p-panel); padding: var(--p-gap); }
.p-aside h3 { font-size: var(--p-label); font-family: var(--p-font-body); font-weight: 500;
  letter-spacing: var(--p-ls-label); text-transform: uppercase; color: var(--p-muted); margin: 0 0 8px; }
.p-aside p { margin: 0 0 1.4em; }
.p-share { display: flex; gap: 14px; }
.p-pull { font-family: var(--p-font-display); font-size: var(--p-h3); color: var(--p-ink);
  border-left: 2px solid var(--p-sage); padding-left: 20px; margin: 1.8em 0; max-width: 40ch; }
@media (max-width: 860px) { .p-article { grid-template-columns: 1fr; } .p-aside { position: static; } }
```

- [x] **Step 2: Create the article**

Note `data-root="../"` — this page is one directory deeper, and `chrome.js` reads that attribute to build correct links. The body follows the copy doc's `PREDLOGA POSAMEZNEGA BLOG ZAPISA` structure: teaser, two intermediate headings, a `Nekaj za razmislek` close, and a final reflective question.

```html
<!doctype html>
<html lang="sl" data-root="../">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ni vam treba takoj vedeti, kaj sledi — Pressence</title>
<meta name="description" content="Prehodna obdobja so neprijetna prav zato, ker staro ni več pravo, novo pa še nima jasne oblike. Morda naloga tega obdobja ni, da čim prej najdemo odgovor.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/site.css">
</head>
<body data-page="zapisi">

<main id="main">

  <section class="p-panel p-panel--flush p-panel--ivory" data-el="container:article-hero">
    <div class="p-container">
      <p class="p-crumb"><a href="../zapisi.html">Zapisi</a> / <a href="../zapisi.html">Spremembe</a></p>
      <h1>Ni vam treba takoj vedeti, kaj sledi</h1>
      <p class="p-post__meta">22. april 2024</p>
    </div>
    <figure class="p-figure--bleed" data-el="image">
      <img src="../assets/img/zapis-03-hero.jpg" alt="Gorska pot, ki se vije med sončnimi griči"
           width="1400" height="620" data-placeholder="true"
           data-brief="mountain road winding through golden hills at low sun, wide crop">
    </figure>
  </section>

  <section class="p-panel p-panel--ivory" data-el="container:article-body">
    <div class="p-container p-article">
      <div class="p-article__body" data-el="text-editor">
        <p class="p-lead">Prehodna obdobja so neprijetna prav zato, ker staro ni več pravo, novo pa še nima jasne oblike.</p>
        <p>Morda naloga tega obdobja ni, da čim prej najdemo odgovor.</p>

        <h2>Prostor med starim in novim</h2>
        <p>Včasih imamo občutek, da bi morali vedeti, kam gremo.</p>
        <p>Da bi morali imeti načrt. Odločitev. Jasno smer.</p>
        <p>In vendar je edino, kar je na voljo, prostor med dvema točkama.</p>
        <p>Ta prostor je pogosto neprijeten, ker ga ne moremo pojasniti drugim. Ko nas kdo vpraša, kaj sledi, nimamo dobrega odgovora. In ker ga nimamo, se nam zdi, da nekaj delamo narobe.</p>
        <p>Morda pa ne delamo nič narobe.</p>
        <p>Morda smo samo sredi nečesa, kar še ni dobilo oblike.</p>

        <p class="p-pull">Kaj v tej situaciji opazite pri sebi, ko odgovora ni?</p>

        <h2>Zakaj hitimo k odgovoru</h2>
        <p>Negotovost je neprijetna, zato jo pogosto poskušamo zapreti.</p>
        <p>Sprejmemo prvo možnost, ki se zdi dovolj razumna. Vrnemo se k nečemu znanemu. Ali pa se zaposlimo tako, da o tem ni več časa razmišljati.</p>
        <p>Vse to deluje, ampak samo za nekaj časa.</p>
        <p>Odločitev, sprejeta zato, da se negotovost konča, običajno ni odločitev, ki bi zares odgovarjala na vprašanje.</p>
        <p>Zato se isto vprašanje pogosto vrne, le v drugačni obleki.</p>

        <h2>Kaj lahko naredimo namesto tega</h2>
        <p>Ni treba, da prehodno obdobje takoj razrešimo.</p>
        <p>Lahko ga samo opazujemo dovolj dolgo, da začnemo prepoznavati, kaj se v njem pravzaprav dogaja.</p>
        <p>Kaj se je izteklo. Kaj še ni. Kaj nas privlači, tudi če tega še ne znamo pojasniti.</p>
        <p>To ni pasivnost. Je pozornost.</p>

        <h2>Nekaj za razmislek</h2>
        <p>Na koncu ni treba ponuditi petih korakov ali univerzalne rešitve.</p>
        <p>Dovolj je eno dobro vprašanje.</p>
        <p class="p-serif-statement">Kaj bi se spremenilo, če vam v tem obdobju ne bi bilo treba že vedeti, kaj sledi?</p>
      </div>

      <aside class="p-aside" data-el="container:sidebar">
        <h3>Kategorija</h3>
        <p><a href="../zapisi.html">Spremembe</a></p>
        <h3>Deli zapis</h3>
        <div class="p-share">
          <a href="#" aria-label="Deli na Facebooku">Facebook</a>
          <a href="#" aria-label="Deli na LinkedInu">LinkedIn</a>
          <a href="mailto:?subject=Ni%20vam%20treba%20takoj%20vedeti%2C%20kaj%20sledi" aria-label="Deli po e-pošti">E-pošta</a>
        </div>
      </aside>
    </div>
  </section>

  <section class="p-panel p-panel--olive" data-el="container:cta">
    <div class="p-container p-narrow">
      <h2>Če je zapis odprl nekaj, kar bi želeli raziskati v pogovoru, mi lahko pišete.</h2>
      <p><a class="p-btn p-btn--ghost" href="../kontakt.html" data-el="xpro-button">Začnimo pogovor</a></p>
    </div>
  </section>

</main>

<script src="../assets/js/chrome.js"></script>
<script src="../assets/js/ui.js"></script>
</body>
</html>
```

- [x] **Step 3: Verify the deeper path resolves**

Run: `python3 tests/check_site.py 2>&1 | grep -E "chrome_included|head_metadata" | grep zapisi/ || echo "article paths clean"`
Expected: `article paths clean` — confirming `data-root="../"` is set and `chrome.js` is found at the deeper path.

- [x] **Step 4: Open and confirm the chrome links work from one level down**

Run: `open site/zapisi/ni-vam-treba-takoj-vedeti-kaj-sledi.html`
Expected: header and footer render identically to the top-level pages, and clicking `Domov` in either navigates up to `index.html` rather than 404ing.

- [x] **Step 5: Commit**

```bash
git add site/zapisi/ni-vam-treba-takoj-vedeti-kaj-sledi.html site/assets/css/site.css
git commit -m "Add article template and the one fully written article

Follows the copy doc's article template: teaser, intermediate headings, a
pull quote, a 'Nekaj za razmislek' close and a final reflective question.
Proves chrome.js path-awareness one directory down via data-root.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 10: Five article stubs

**Files:**
- Create: `site/zapisi/ko-to-kar-je-nekoc-delovalo-ne-deluje-vec.html`
- Create: `site/zapisi/zakaj-zavedanje-vzorca-se-ni-sprememba.html`
- Create: `site/zapisi/coaching-ni-prostor-kjer-dobite-nasvet.html`
- Create: `site/zapisi/kaj-pomeni-zares-poslusati.html`
- Create: `site/zapisi/kdo-ste-ko-odlozite-moram.html`

Each stub carries the real title, category, date, hero image and the teaser from the copy doc, then a visibly marked placeholder body. The body is **not** invented — the copy doc gives no body text for these, and inventing her personal reflections would be rewritten anyway.

- [x] **Step 1: Add placeholder-body CSS**

```css
.p-todo {
  border: 1px dashed var(--p-muted);
  background: var(--p-panel);
  padding: var(--p-gap);
  max-width: var(--p-measure);
}
.p-todo p:last-child { margin-bottom: 0; }
.p-todo__tag {
  font: 500 var(--p-label)/1 var(--p-font-body);
  letter-spacing: var(--p-ls-label);
  text-transform: uppercase;
  color: var(--p-muted);
  display: block;
  margin-bottom: 10px;
}
```

- [x] **Step 2: Create the first stub in full**

```html
<!doctype html>
<html lang="sl" data-root="../">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ko to, kar je nekoč delovalo, ne deluje več — Pressence</title>
<meta name="description" content="Načini delovanja, ki jih danes doživljamo kot omejitev, niso nujno nastali brez razloga. Kaj se zgodi, ko jih ne potrebujemo več?">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/site.css">
</head>
<body data-page="zapisi">

<main id="main">

  <section class="p-panel p-panel--flush p-panel--ivory" data-el="container:article-hero">
    <div class="p-container">
      <p class="p-crumb"><a href="../zapisi.html">Zapisi</a> / <a href="../zapisi.html">Vzorci</a></p>
      <h1>Ko to, kar je nekoč delovalo, ne deluje več</h1>
      <p class="p-post__meta">18. maj 2024</p>
    </div>
    <figure class="p-figure--bleed" data-el="image">
      <img src="../assets/img/zapis-01-hero.jpg" alt="Gorska pot v jutranji svetlobi" width="1400" height="620"
           data-placeholder="true" data-brief="mountain road curving through golden hills, morning light, wide crop">
    </figure>
  </section>

  <section class="p-panel p-panel--ivory" data-el="container:article-body">
    <div class="p-container p-article">
      <div class="p-article__body" data-el="text-editor">
        <p class="p-lead">Načini delovanja, ki jih danes doživljamo kot omejitev, niso nujno nastali brez razloga. Morda so nas nekoč varovali, nam omogočili uspeh ali pomagali skozi težko obdobje.</p>
        <p>Kaj se zgodi, ko jih ne potrebujemo več?</p>
        <div class="p-todo" data-placeholder="copy">
          <span class="p-todo__tag">Besedilo v pripravi</span>
          <p>Naslov, kategorija, datum in uvod so končni. Glavno besedilo tega zapisa še ni napisano — napiše ga avtorica po strukturi iz predloge: dva do trije vmesni naslovi, sklep »Nekaj za razmislek« in zaključno reflektivno vprašanje.</p>
        </div>
      </div>

      <aside class="p-aside" data-el="container:sidebar">
        <h3>Kategorija</h3>
        <p><a href="../zapisi.html">Vzorci</a></p>
        <h3>Deli zapis</h3>
        <div class="p-share">
          <a href="#" aria-label="Deli na Facebooku">Facebook</a>
          <a href="#" aria-label="Deli na LinkedInu">LinkedIn</a>
          <a href="mailto:?subject=Ko%20to%2C%20kar%20je%20neko%C4%8D%20delovalo" aria-label="Deli po e-pošti">E-pošta</a>
        </div>
      </aside>
    </div>
  </section>

  <section class="p-panel p-panel--olive" data-el="container:cta">
    <div class="p-container p-narrow">
      <h2>Če je zapis odprl nekaj, kar bi želeli raziskati v pogovoru, mi lahko pišete.</h2>
      <p><a class="p-btn p-btn--ghost" href="../kontakt.html" data-el="xpro-button">Začnimo pogovor</a></p>
    </div>
  </section>

</main>

<script src="../assets/js/chrome.js"></script>
<script src="../assets/js/ui.js"></script>
</body>
</html>
```

- [x] **Step 3: Create the remaining four stubs**

Identical structure to Step 2. Substitute per article — every value below comes from the copy doc's `Predlagani prvi članki`, verbatim:

**`zakaj-zavedanje-vzorca-se-ni-sprememba.html`** — category `Vzorci`, date `5. maj 2024`, hero `zapis-02-hero.jpg` (alt `Sence listov na svetli steni`, brief `leaf shadows on a pale wall, high-contrast afternoon light, wide crop`), meta description `Včasih zelo dobro vemo, kaj počnemo. Vemo celo, zakaj. Pa vendar v podobni situaciji vedno znova reagiramo enako.` Lead paragraphs:
```html
<p class="p-lead">Včasih zelo dobro vemo, kaj počnemo. Vemo celo, zakaj.</p>
<p>Pa vendar v podobni situaciji vedno znova reagiramo enako.</p>
<p>Kaj manjka med razumevanjem in drugačno izbiro?</p>
```

**`coaching-ni-prostor-kjer-dobite-nasvet.html`** — category `Coaching`, date `8. april 2024`, hero `zapis-04-hero.jpg` (alt `Dva stola ob nizki mizi v mirnem prostoru`, brief `two chairs facing each other in a calm neutral room, wide crop`), meta description `Kaj se zgodi, ko oseba nasproti vas ne poskuša rešiti vaše težave? In zakaj je prav odsotnost pripravljenega odgovora lahko tako koristna?` Lead paragraphs:
```html
<p class="p-lead">Kaj se zgodi, ko oseba nasproti vas ne poskuša rešiti vaše težave?</p>
<p>In zakaj je prav odsotnost pripravljenega odgovora lahko tako koristna?</p>
```

**`kaj-pomeni-zares-poslusati.html`** — category `Vodenje in odnosi`, date `25. marec 2024`, hero `zapis-05-hero.jpg` (alt `Odprt zvezek in svinčnik na leseni mizi`, brief `open notebook and pencil on a wooden table, quiet morning light, wide crop`), meta description `Veliko pogovorov poteka tako, da med poslušanjem že pripravljamo odgovor. Kaj se spremeni, ko tega za trenutek ne počnemo?` Lead paragraphs:
```html
<p class="p-lead">Veliko pogovorov poteka tako, da med poslušanjem že pripravljamo odgovor.</p>
<p>Kaj se spremeni, ko tega za trenutek ne počnemo?</p>
```

**`kdo-ste-ko-odlozite-moram.html`** — category `Odločitve`, date `11. marec 2024`, hero `zapis-06-hero.jpg` (alt `Razcep gozdne poti med bukvami`, brief `forked path in a beech forest, soft diffused light, wide crop`), meta description `Vloge in pričakovanja nam lahko dolgo dajejo smer. Včasih pa pride trenutek, ko se je vredno vprašati, katere izbire so še vedno naše.` Lead paragraphs:
```html
<p class="p-lead">Vloge in pričakovanja nam lahko dolgo dajejo smer.</p>
<p>Včasih pa pride trenutek, ko se je vredno vprašati, katere izbire so še vedno naše.</p>
```

Each keeps the same `p-todo` placeholder block, the same `p-aside` with its own category, and the same closing CTA. Update the `mailto:` subject to the article's own title, URL-encoded.

- [x] **Step 4: Verify all six articles exist and every index link resolves**

Run: `python3 tests/check_site.py 2>&1 | grep -E "pages_exist|links_resolve.*zapisi" || echo "all article links resolve"`
Expected: only `links_resolve` failures naming files under `assets/img/`, which Task 11 supplies.

- [x] **Step 5: Commit**

```bash
git add site/zapisi/ site/assets/css/site.css
git commit -m "Add five article stubs with real metadata and marked placeholder bodies

Titles, categories, dates and teasers are final, taken verbatim from the
copy doc. Bodies are visibly marked as unwritten rather than invented -
the doc supplies no body text for these five.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 11: Kontakt page with form

**Files:**
- Create: `site/kontakt.html`
- Modify: `site/assets/css/site.css`

Copy source: `source/copy.txt`, section `KONTAKT`. Per the spec, the form is the mockup's three fields **plus a GDPR consent checkbox**, which is a legal requirement rather than a design choice.

- [x] **Step 1: Add form CSS**

```css
.p-form { background: var(--p-ivory); border: var(--p-hairline); padding: var(--p-gap); }
.p-field { margin-bottom: var(--p-gap-sm); }
.p-field label { display: block; font: 400 var(--p-small)/1.4 var(--p-font-body); color: var(--p-body); margin-bottom: 8px; }
.p-field input, .p-field textarea {
  width: 100%; padding: 12px 14px;
  border: var(--p-hairline); border-radius: var(--p-radius);
  background: var(--p-ivory); color: var(--p-ink);
  font: var(--p-base)/1.5 var(--p-font-body);
}
.p-field textarea { min-height: 132px; resize: vertical; }
.p-field input:focus, .p-field textarea:focus { outline: 2px solid var(--p-muted); outline-offset: 1px; }
.p-field__hint { font-size: var(--p-small); color: var(--p-muted); margin: 6px 0 0; }
.p-consent { display: flex; gap: 12px; align-items: flex-start; margin-bottom: var(--p-gap-sm); }
.p-consent input { width: auto; margin-top: 4px; flex: none; }
.p-consent label { font-size: var(--p-small); color: var(--p-body); margin: 0; }
.p-contact-list { list-style: none; padding: 0; margin: 0; display: grid; gap: var(--p-gap-sm); }
.p-contact-list h3 { font: 500 var(--p-small)/1.3 var(--p-font-body); color: var(--p-ink); margin: 0 0 2px; }
.p-contact-list p { margin: 0; color: var(--p-muted); }
```

- [x] **Step 2: Create the page**

The email address is `info@pressence.si`, taken from the mockup. The live site's `hello@pressence.example` and fake phone number must not appear — see `docs/LAUNCH-BLOCKERS.md`. No phone number is shown, because we do not have a real one.

```html
<!doctype html>
<html lang="sl" data-root="./">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kontakt — Pressence</title>
<meta name="description" content="Začniva s pogovorom. Ni vam treba že vedeti, kaj točno potrebujete. Coaching v Mariboru ali na spletu.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/site.css">
</head>
<body data-page="kontakt">

<main id="main">

  <section class="p-panel p-panel--ivory" data-el="container:hero">
    <div class="p-container p-narrow">
      <h1>Začniva s pogovorom.</h1>
      <p class="p-lead">Ni vam treba že vedeti, kaj točno potrebujete.</p>
      <p>Za prvi stik je dovolj, da veste, da bi se o nečem želeli pogovoriti.</p>
    </div>
  </section>

  <section class="p-panel p-panel--panel" data-el="container:split-form">
    <div class="p-container p-split">
      <div>
        <p class="p-label">Uvodni pogovor</p>
        <h2>Prvi pogovor je namenjen temu, da se spoznava.</h2>
        <p>Poveste mi lahko, kaj vas je pripeljalo do coachinga, jaz pa vam predstavim svoj način dela.</p>
        <p>Skupaj preveriva, ali je coaching prava oblika podpore za vas in ali si želiva nadaljevati sodelovanje.</p>
        <p>Brez pritiska in brez obveznosti nadaljevanja.</p>

        <ul class="p-contact-list" data-el="icon-list">
          <li>
            <h3>E-pošta</h3>
            <p><a href="mailto:info@pressence.si">info@pressence.si</a></p>
          </li>
          <li>
            <h3>Lokacija</h3>
            <p>Maribor</p>
          </li>
          <li>
            <h3>Srečanja</h3>
            <p>V živo v Mariboru ali na spletu.</p>
          </li>
          <li>
            <h3>Jezik</h3>
            <p>Slovenščina / angleščina</p>
          </li>
        </ul>
      </div>

      <form class="p-form" data-el="wpforms:contact" action="#" method="post" novalidate>
        <div class="p-field">
          <label for="ime">Ime in priimek</label>
          <input type="text" id="ime" name="ime" autocomplete="name" required>
        </div>
        <div class="p-field">
          <label for="email">E-naslov</label>
          <input type="email" id="email" name="email" autocomplete="email" required>
        </div>
        <div class="p-field">
          <label for="sporocilo">Kaj vas je pripeljalo sem?</label>
          <textarea id="sporocilo" name="sporocilo" required></textarea>
          <p class="p-field__hint">Ni treba pisati veliko. Nekaj stavkov je povsem dovolj.</p>
        </div>
        <div class="p-consent">
          <input type="checkbox" id="privolitev" name="privolitev" required>
          <label for="privolitev">Strinjam se, da se moje sporočilo in osebni podatki shranijo in uporabijo za odgovor, kot je opisano v <a href="politika-zasebnosti.html">politiki zasebnosti</a>.</label>
        </div>
        <p><button class="p-btn" type="submit" data-el="wpforms:submit">Pošlji sporočilo</button></p>
        <p class="p-field__hint">Sporočilo in osebne podatke bom obravnavala zaupno.</p>
      </form>
    </div>
  </section>

  <section class="p-panel p-panel--olive" data-el="container:cta">
    <div class="p-container p-narrow">
      <h2>Ni treba, da je prvi korak velik.</h2>
      <p>Včasih je dovolj en pogovor, da začutite, ali je to prostor za vas.</p>
    </div>
  </section>

</main>

<script src="assets/js/chrome.js"></script>
<script src="assets/js/ui.js"></script>
</body>
</html>
```

- [x] **Step 3: Verify every form control has a label**

Run: `python3 -c "
import io,re
s=io.open('site/kontakt.html',encoding='utf-8').read()
ids=set(re.findall(r'<(?:input|textarea)[^>]*\bid=\"([a-z]+)\"',s))
fors=set(re.findall(r'<label[^>]*\bfor=\"([a-z]+)\"',s))
print('controls:',sorted(ids)); print('labelled:',sorted(fors))
assert ids==fors, 'unlabelled control: %s' % (ids ^ fors)
print('every control is labelled')
"`
Expected: `every control is labelled`

- [x] **Step 4: Commit**

```bash
git add site/kontakt.html site/assets/css/site.css
git commit -m "Add Kontakt page with form and GDPR consent

The mockup's three fields plus a consent checkbox, which is a legal
requirement rather than a design choice. Uses info@pressence.si from the
mockup; the live site's placeholder address and fake phone number are
deliberately absent, and no phone number is shown because we have none.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 12: Three legal pages

**Files:**
- Create: `site/politika-zasebnosti.html`
- Create: `site/politika-piskotkov.html`
- Create: `site/pravno-obvestilo.html`

These are prototype scaffolds, not legal advice. Each carries the real structure and headings so the layout is approvable, with body text visibly marked as requiring the client's own legal copy.

- [x] **Step 1: Create `politika-zasebnosti.html`**

```html
<!doctype html>
<html lang="sl" data-root="./">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Politika zasebnosti — Pressence</title>
<meta name="description" content="Kako Pressence zbira, uporablja in varuje osebne podatke obiskovalcev in klientov.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/site.css">
</head>
<body data-page="">

<main id="main">
  <section class="p-panel p-panel--ivory" data-el="container:legal">
    <div class="p-container p-narrow">
      <h1>Politika zasebnosti</h1>
      <p class="p-lead">Kako zbiram, uporabljam in varujem vaše osebne podatke.</p>

      <div class="p-todo" data-placeholder="copy">
        <span class="p-todo__tag">Pravno besedilo v pripravi</span>
        <p>Struktura in postavitev te strani sta končni. Vsebina mora priti od avtorice oziroma njenega pravnega svetovalca — spodnji naslovi so predlog obveznih sklopov po GDPR.</p>
      </div>

      <h2>Upravljavec podatkov</h2>
      <h2>Kateri podatki se zbirajo</h2>
      <h2>Namen obdelave</h2>
      <h2>Pravna podlaga</h2>
      <h2>Hramba podatkov</h2>
      <h2>Deljenje s tretjimi osebami</h2>
      <h2>Vaše pravice</h2>
      <h2>Kontakt glede zasebnosti</h2>
    </div>
  </section>
</main>

<script src="assets/js/chrome.js"></script>
<script src="assets/js/ui.js"></script>
</body>
</html>
```

- [x] **Step 2: Create `politika-piskotkov.html`**

Identical shell, `<title>Politika piškotkov — Pressence</title>`, meta description `Kateri piškotki se uporabljajo na spletni strani Pressence in kako jih lahko upravljate.`, `<h1>Politika piškotkov</h1>`, lead `Kateri piškotki se uporabljajo na tej strani in kako jih lahko upravljate.`, the same `p-todo` block, and these headings:

```html
      <h2>Kaj so piškotki</h2>
      <h2>Nujno potrebni piškotki</h2>
      <h2>Analitični piškotki</h2>
      <h2>Piškotki tretjih oseb</h2>
      <h2>Kako upravljate piškotke</h2>
```

Note for the build: Google Site Kit is installed on the live site, so analytics cookies are in use and this page cannot stay empty at launch.

- [x] **Step 3: Create `pravno-obvestilo.html`**

Identical shell, `<title>Pravno obvestilo — Pressence</title>`, meta description `Pogoji uporabe spletne strani Pressence, omejitev odgovornosti in avtorske pravice.`, `<h1>Pravno obvestilo</h1>`, lead `Pogoji uporabe te spletne strani.`, the same `p-todo` block, and these headings:

```html
      <h2>Podatki o ponudniku</h2>
      <h2>Pogoji uporabe</h2>
      <h2>Omejitev odgovornosti</h2>
      <h2>Avtorske pravice</h2>
      <h2>Narava coaching storitve</h2>
```

Under `Narava coaching storitve`, include this sentence in the placeholder note, because it repeats the disclaimer already committed to in the footer and the Zaupanje section: `Coaching ni nadomestilo za psihoterapijo, zdravstveno obravnavo ali drugo ustrezno strokovno pomoč.`

- [x] **Step 4: Verify all fourteen pages now exist**

Run: `python3 tests/check_site.py 2>&1 | grep pages_exist || echo "all 14 pages present"`
Expected: `all 14 pages present`

- [x] **Step 5: Commit**

```bash
git add site/politika-zasebnosti.html site/politika-piskotkov.html site/pravno-obvestilo.html
git commit -m "Add three legal page scaffolds

Structure and headings are final so the layout is approvable; body text is
marked as requiring the client's own legal copy. Retains pravno-obvestilo,
which exists on the live site but is missing from the new copy's footer.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 13: Imagery and recoloured brand SVGs

**Files:**
- Create: `site/assets/img/*.jpg` (seventeen files)
- Create: `site/assets/svg/pressence-znak.svg`, `pressence-korenina.svg`, `pressence-korenina-zbir.svg`, `pressence-letnice.svg`
- Create: `docs/ASSETS.md`

- [x] **Step 1: List every image slot the pages reference**

Run: `grep -rho 'assets/img/[a-z0-9-]*\.jpg' site/ | sed 's|.*/||' | sort -u`

Expected, seventeen filenames: `hero-oljka.jpg`, `portret-hero.jpg`, `portret-o-meni.jpg`, `skodelica-lan.jpg`, `vaza-susene-roze.jpg`, `zapis-01.jpg`, `zapis-01-hero.jpg`, `zapis-02.jpg`, `zapis-02-hero.jpg`, `zapis-03.jpg`, `zapis-03-hero.jpg`, `zapis-04.jpg`, `zapis-04-hero.jpg`, `zapis-05.jpg`, `zapis-05-hero.jpg`, `zapis-06.jpg`, `zapis-06-hero.jpg`. Use this command's actual output as the authoritative list rather than this prose.

- [x] **Step 2: Source each photo from Unsplash**

For each slot, read its `data-brief` attribute out of the HTML — that attribute is the search brief:

Run: `grep -rho 'data-brief="[^"]*"' site/ | sort -u`

Then, per slot, search Unsplash for that brief and download the chosen photo at a sensible width. Card images want 834×626; hero bleeds want 1400×620; portraits want 1000×1250. Example for one slot:

```bash
mkdir -p site/assets/img
curl -sL "https://images.unsplash.com/photo-<ID>?w=1200&q=80&fm=jpg&fit=crop" \
  -o site/assets/img/hero-oljka.jpg
```

Requirements for each download:
- Verify it is a real JPEG and not an error page: `file site/assets/img/hero-oljka.jpg` must report `JPEG image data`.
- Keep each file under 400 KB. If larger, re-request with a smaller `w=` value.
- The Unsplash licence permits free commercial use without attribution; record photographer and photo URL in `docs/ASSETS.md` anyway, so a future swap or licence question is answerable.
- If a photo cannot be found matching a brief, pick the nearest match from the same search and note the divergence in `docs/ASSETS.md`. Do not leave a slot empty — the checker fails on unresolved links.

- [x] **Step 3: Verify every slot is filled and sized sanely**

Run:
```bash
python3 -c "
import os,glob
d='site/assets/img'
files=sorted(os.path.basename(f) for f in glob.glob(d+'/*.jpg'))
big=[f for f in files if os.path.getsize(os.path.join(d,f))>400*1024]
print(len(files),'images'); print('over 400KB:',big or 'none')
assert not big
"
file site/assets/img/*.jpg | grep -cv "JPEG image data" || echo "all files are real JPEGs"
```
Expected: the image count matching Step 1's list, `over 400KB: none`, and `all files are real JPEGs`.

- [x] **Step 4: Recolour the four brand SVGs for the ivory palette**

The originals hardcode gold `#C9A54E` and cream at 28% opacity, tuned for the old dark theme. Recolour to the sage and muted tokens. Create `site/assets/svg/pressence-znak.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="26" viewBox="0 0 18 26" fill="none">
  <path d="M9 26V9M9 9C9 5 6 3 3 1M9 9c0-4 3-6 6-8M9 20c-3-1-5-3-6-6M9 16c3-1 5-3 6-6"
        stroke="#71736A" stroke-width="1"/>
</svg>
```

`site/assets/svg/pressence-korenina.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="340" height="260" viewBox="0 0 340 260" fill="none">
  <path d="M170 0 C 170 65 102 65 95 130 C 88 195 51 208 34 260 M170 0 C 170 65 238 65 245 130 C 252 195 289 208 306 260"
        stroke="#D7D6CC" stroke-width="1.2" fill="none"/>
</svg>
```

`site/assets/svg/pressence-korenina-zbir.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="280" height="180" viewBox="0 0 280 180" fill="none">
  <path d="M28 0 C 84 54 112 72 140 108 C 168 144 154 162 140 180 M252 0 C 196 54 168 72 140 108"
        stroke="#D7D6CC" stroke-width="1.2" fill="none"/>
</svg>
```

For `pressence-letnice.svg` (concentric tree rings, nine ellipses), download the original and substitute the stroke colour:

```bash
mkdir -p site/assets/svg
curl -sL "https://pressence.si/wp-content/uploads/2026/07/pressence-letnice.svg" \
  -o site/assets/svg/pressence-letnice.svg
python3 -c "
import io
p='site/assets/svg/pressence-letnice.svg'
s=io.open(p,encoding='utf-8').read()
n=s.replace('rgba(201,165,78,0.5)','#D7D6CC')
io.open(p,'w',encoding='utf-8').write(n)
print('replaced',s.count('rgba(201,165,78,0.5)'),'gold strokes')
"
```
Expected: `replaced 9 gold strokes`.

These four SVGs are not yet referenced by any page — they are prepared assets for the Elementor build, recorded in `docs/ASSETS.md`. The checker only inspects `img` elements, so unreferenced SVGs do not fail it.

- [x] **Step 5: Write `docs/ASSETS.md`**

One row per slot. Populate the Unsplash columns from the actual downloads.

```markdown
# Assets

Every image in the prototype is a **placeholder**, tagged `data-placeholder="true"` in the
HTML with a `data-brief` attribute describing the intended shot. Replace them before launch.

## Photography slots

| File | Used on | Ratio | Brief | Real asset available? | Source |
|---|---|---|---|---|---|
| `hero-oljka.jpg` | Domov hero | 4:3 | backlit olive branch, warm late-afternoon light, shallow DOF | No | Unsplash, photographer + URL |
| `portret-hero.jpg` | O meni hero | 4:5 | editorial portrait, warm knitwear, window light, three-quarter view | **Partly** — a real studio headshot exists (see below) but is the wrong register | Unsplash, photographer + URL |
| `portret-o-meni.jpg` | Domov, O meni teaser | 4:5 | warm editorial portrait, cream cardigan, natural window light | **Partly** — as above | Unsplash, photographer + URL |
| `skodelica-lan.jpg` | Coaching hero | 4:3 | stoneware cup on linen with dried gypsophila, soft daylight | No | Unsplash, photographer + URL |
| `vaza-susene-roze.jpg` | Zapisi hero | 4:3 | vase with dried flowers beside a stoneware bowl, cream wall | No | Unsplash, photographer + URL |
| `zapis-01.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | mountain road through golden hills, morning light | No | Unsplash, photographer + URL |
| `zapis-02.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | leaf shadows on a pale wall, high-contrast afternoon light | No | Unsplash, photographer + URL |
| `zapis-03.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | folded linen beside a stoneware cup | No | Unsplash, photographer + URL |
| `zapis-04.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | two chairs facing each other in a calm room | No | Unsplash, photographer + URL |
| `zapis-05.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | open notebook and pencil, quiet morning light | No | Unsplash, photographer + URL |
| `zapis-06.jpg` / `-hero.jpg` | Zapisi card, article | 4:3 / 21:9 | forked path in a beech forest, diffused light | **Yes** — `pressence-bukov-gozd.jpg` in the media library is a real beech forest above Maribor | Unsplash, photographer + URL |

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

Recoloured from the old dark-theme gold `#C9A54E` to the `Sage` and `Muted` tokens. Not yet
placed on any page — prepared for the Elementor build.

| File | Original stroke | New stroke |
|---|---|---|
| `pressence-znak.svg` | `#C9A54E` | `#71736A` (Muted) |
| `pressence-korenina.svg` | `rgba(240,237,229,0.28)` | `#D7D6CC` (Sage) |
| `pressence-korenina-zbir.svg` | `rgba(240,237,229,0.28)` | `#D7D6CC` (Sage) |
| `pressence-letnice.svg` | `rgba(201,165,78,0.5)` ×9 | `#D7D6CC` (Sage) |

## The shoot brief, if one happens

Every `data-brief` in the HTML is a shot. The through-line: warm neutral palette, natural
side or back light, shallow depth of field, no saturated colour, no props that read as
corporate. One portrait session in daylight covers the two portrait slots and would replace
the studio headshot.
```

- [x] **Step 6: Run the full checker — it should now pass**

Run: `python3 tests/check_site.py`
Expected: `All 10 checks passed across 14 pages.`

If `no_hardcoded_hex` fails on `docs/ASSETS.md`, ignore it — the checker only inspects `site/`. If it fails on a `site/` file, move that colour into `tokens.css`.

- [x] **Step 7: Commit**

```bash
git add site/assets/img site/assets/svg docs/ASSETS.md
git commit -m "Add placeholder imagery, recoloured brand SVGs and the asset inventory

Every photo is tagged data-placeholder with a data-brief describing the
intended shot, and inventoried in docs/ASSETS.md against what already
exists in the media library. The four brand SVGs are recoloured from the
old dark-theme gold to the Sage and Muted tokens.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 14: Handoff documents

**Files:**
- Create: `docs/DESIGN-SYSTEM.md`
- Create: `docs/NOVAMIRA-SKILL.md`
- Create: `docs/LAUNCH-BLOCKERS.md`
- Create: `README.md`

- [x] **Step 1: Write `docs/DESIGN-SYSTEM.md`**

Read the values straight out of `site/assets/css/tokens.css` so the two cannot drift. Order the tables the way the Elementor UI asks for them.

```markdown
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

## Widget mapping

Only widgets available on the free stack. Never use an Elementor Pro widget or Xpro's
Advance Accordion.

| Prototype | Elementor |
|---|---|
| Header, footer | Xpro Theme Builder templates 36 / 37 — **edit in place, do not rebuild** |
| Main nav | `xpro-horizontal-menu` |
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
```

- [x] **Step 2: Write `docs/NOVAMIRA-SKILL.md`**

```markdown
# Novamira skill file — Pressence Elementor build

Load this before asking Novamira to build any Pressence page.

## Environment

- Novamira **deactivates on production URLs** by design. Build on a staging or local
  install, never against `pressence.si`.
- Novamira **free** is sufficient. Elementor pages are written by setting the
  `_elementor_data` post meta through Novamira's PHP and database access. Pro's
  Elementor-aware tooling is not required — the current site was built this way.
- Because free has **no element schema validation**, nothing catches a malformed widget.
  Open every generated page in the Elementor editor and confirm it renders *and stays
  editable* before starting the next one. A page whose `_elementor_data` is subtly wrong
  can look correct on the front end and be unusable in the editor.

## Stack — do not deviate

| Layer | What is installed |
|---|---|
| Theme | Blocksy + blocksy-companion |
| Builder | Elementor **free** — no Pro |
| Addons | Xpro Elementor Addons (free) |
| Theme builder | Xpro Theme Builder — header template 36, footer template 37 |
| Forms | WPForms Lite |
| Analytics | Google Site Kit |

**Forbidden:** any Elementor Pro widget, Xpro's Advance Accordion (Pro), per-element Custom
CSS (Pro), Elementor sticky and other motion effects (Pro).

## Rules

1. **Never write a hex value into a widget.** Reference the Global Color by label:
   `Ink`, `Olive`, `Body`, `Sage`, `Ivory`, `Panel`, `Muted`, `Line`. Same for the Global
   Fonts `Display`, `Heading`, `Body`, `Label`. See `docs/DESIGN-SYSTEM.md`.
2. **One prototype `<section>` becomes one Elementor container.** The section's `data-el`
   attribute names the intended widget or container. Read it; do not improvise.
3. **Edit the existing header and footer templates.** Do not create new ones — templates 36
   and 37 are already wired into Xpro Theme Builder and already carry the sticky header.
4. **Preserve every existing URL.** The slug table in `docs/DESIGN-SYSTEM.md` is
   authoritative. WordPress must not mint new slugs.
5. **Hand-written CSS goes in one global stylesheet** (Appearance → Customize → Additional
   CSS), with the class applied via each widget's Advanced → CSS Classes field. The classes
   needing CSS are listed in `docs/DESIGN-SYSTEM.md`.
6. **Never emit a `{{TOKEN}}` placeholder.** Seventeen of them are live on production right
   now. If a real value is unknown, leave the element out and record it in
   `docs/LAUNCH-BLOCKERS.md` — do not ship the token.
7. **Female verb forms throughout.** `naslovila`, `verjamem`, `pozorna sem`. The live site's
   neutral underscore forms (`povedal_a`) are wrong and must not be reproduced.
8. **Copy is final.** Take it verbatim from the prototype HTML. Do not paraphrase,
   re-order, or "improve" the Slovenian.

## Build order

1. Global Colors and Global Fonts in Site Settings.
2. The global stylesheet in Additional CSS.
3. Header template 36, footer template 37.
4. `/` — the widest range of section patterns; get these right and the rest reuse them.
5. `/coaching/` — includes the accordion and the sticky rail, the two hardest sections.
6. `/o-meni/`, `/kontakt/`.
7. The Xpro Theme Builder single-post template, then the six posts.
8. `/zapisi/` with `xpro-post-grid`. **Verify free-tier taxonomy filtering.** If it is
   unavailable, link each category tab to its `/category/<slug>/` archive instead.
9. The three legal pages.

## Section pattern vocabulary

The `data-el` values used across the prototype, and what each means:

| `data-el` | Build as |
|---|---|
| `container:hero` | full-width container, two columns, text left, bleeding image right |
| `container:statement` | boxed container, single narrow column, heading plus paragraphs |
| `container:prose` | as statement, longer body |
| `container:cards-N` | boxed container, three-column grid of `container:card` |
| `container:card` | inner container, `Line` border, `Ivory` background |
| `container:step` | as card, with an `01`-style `Label` number above the heading |
| `container:compare` | two-column grid, each column an `icon-list` with hairline rows |
| `container:rail-content` | two columns, 220px sticky anchor nav plus body |
| `container:cta` | full-width container, `Olive` background, `Ivory` text, ghost button |
| `container:split-form` | two columns, contact details left, WPForms right |
| `container:article-hero` | breadcrumb, `h1`, date, then a full-bleed 21:9 image |
| `container:article-body` | two columns, body plus a 280px sticky sidebar |
| `container:legal` | boxed narrow container, prose only |
| `elementor-core:accordion` | core Accordion, one item per `<details>` |
| `xpro-post-grid` | Xpro post grid |
| `xpro-button` | Xpro button |
| `image`, `heading`, `text-editor`, `icon-list` | the corresponding core widget |
```

- [x] **Step 3: Write `docs/LAUNCH-BLOCKERS.md`**

```markdown
# Launch blockers

Found while auditing the live pressence.si on 2026-09-08. The first three affect the
**live site right now**, not just the redesign.

## 1. Unrendered template placeholders are live in production

Seventeen `{{TOKEN}}` strings are visible to visitors today:

`{{ODZIVNI_CAS}}` · `{{CENA_PLACEHOLDER}}` · `{{TRAJANJE}}` · `{{TRAJANJE_SREČANJA}}` ·
`{{LOKACIJA_PLACEHOLDER}}` · `{{CERTIFIKAT_PLACEHOLDER}}` · `{{METODOLOGIJA_PLACEHOLDER}}` ·
`{{PROGRAM_COACHINGA}}` · `{{CERTIFIKACIJSKI_ORGAN_IN_RAVEN}}` · `{{PREJŠNJE_VLOGE_IN_LETA}}` ·
`{{DODATNA_USPOSABLJANJA}}` · `{{STROKOVNA_ČLANSTVA}}` · `{{UREDITEV_SUPERVIZIJE}}` ·
`{{ŠTEVILO_SREČANJ}}` · `{{RITEM}}` · `{{POLITIKA_ODPOVEDI}}` · `{{INTERVAL_PREGLEDA}}`

The copy doc calls for removing all of them. **No certification or methodology should be
named until there is an exact official designation.** The prototype's checker
(`tests/check_site.py`, `check_no_unrendered_placeholders`) fails the build if any
reappear.

**Needs from the client:** nothing, if we simply omit these claims. A real certification
name, if she wants one stated.

## 2. Contact details are fake

Live on the site: `hello@pressence.example` and `+386 (0) 00 000 000`. The mockup shows
`info@pressence.si`, which the prototype uses. No phone number appears in the prototype
because we do not have a real one.

**Needs from the client:** confirmation that `info@pressence.si` is correct and live, and a
phone number if one should be published at all.

## 3. Gender forms are inconsistent

The live site uses neutral underscore forms — `povedal_a`, `bil_a`, `usmeril_a`,
`pozoren_na`. The new copy uses female forms throughout — `naslovila`, `verjamem`,
`pozorna sem`. The new copy is correct. Every neutral form must go.

**Needs from the client:** nothing. This is ours to fix.

## 4. Novamira cannot run against production

It deactivates on live URLs by design, regardless of tier. The Elementor build happens on a
staging or local install, then goes live as a separate step.

**Needs from the client:** a staging site, or hosting access to create one.

## 5. Legal pages have no content

All three are structural scaffolds in the prototype. Google Site Kit is installed, so
analytics cookies are in use and the cookie policy cannot ship empty.

**Needs from the client:** privacy policy, cookie policy and legal notice text, from her or
her legal adviser. The prototype supplies the required GDPR headings as a checklist.
```

- [x] **Step 4: Write `README.md`**

```markdown
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
```

- [x] **Step 5: Verify the docs agree with the code**

Run:
```bash
python3 -c "
import io,re
tok=io.open('site/assets/css/tokens.css',encoding='utf-8').read()
ds=io.open('docs/DESIGN-SYSTEM.md',encoding='utf-8').read()
hexes=set(h.upper() for h in re.findall(r'#([0-9A-Fa-f]{6})',tok))
documented=set(h.upper() for h in re.findall(r'#([0-9A-Fa-f]{6})',ds))
missing=hexes-documented
print('tokens.css colours:',len(hexes))
print('undocumented:',missing or 'none')
assert not missing
"
```
Expected: `tokens.css colours: 8` and `undocumented: none`.

- [x] **Step 6: Commit**

```bash
git add docs/DESIGN-SYSTEM.md docs/NOVAMIRA-SKILL.md docs/LAUNCH-BLOCKERS.md README.md
git commit -m "Add design system, Novamira skill file, blockers and README

DESIGN-SYSTEM.md carries the token tables in Elementor entry order plus the
free-stack widget mapping. NOVAMIRA-SKILL.md is the file to load before
asking Novamira to build a page: environment, forbidden Pro widgets, the
eight rules, build order and the data-el vocabulary.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 15: Verification pass

**Files:**
- Modify: whichever files the pass turns up

- [x] **Step 1: Run the full checker**

Run: `python3 tests/check_site.py`
Expected: `All 10 checks passed across 14 pages.` Fix anything it reports before continuing.

- [x] **Step 2: Confirm every token is actually used**

An unused token is either dead weight or a sign a style was hardcoded.

```bash
python3 -c "
import io,re,glob
tok=io.open('site/assets/css/tokens.css',encoding='utf-8').read()
names=re.findall(r'(--p-[a-z0-9-]+):',tok)
used=io.open('site/assets/css/site.css',encoding='utf-8').read()
for f in glob.glob('site/**/*.html',recursive=True):
    used+=io.open(f,encoding='utf-8').read()
dead=[n for n in names if used.count('var(%s)'%n)==0]
print('%d tokens, %d unused' % (len(names),len(dead)))
print('unused:',dead or 'none')
"
```
Expected: `unused: none`. If a token is unused, either apply it or delete it.

- [x] **Step 3: Check every page at three widths in the browser**

Run: `open site/index.html site/coaching.html site/o-meni.html site/zapisi.html site/kontakt.html`

At **1440px**, **860px** and **375px**, confirm on each page:
- No horizontal scrollbar on `body`.
- The header collapses to the burger below 860px, and the burger opens and closes the nav.
- Panel padding stays generous — the design depends on emptiness, so this is the first thing to protect.
- `h1` does not wrap to more than three lines at 375px.
- Grids collapse to one column below 860px.

On `coaching.html` also confirm the side-rail sticks while scrolling at 1440px and goes static at 375px, and that the FAQ opens and closes on click and on Enter.

On `zapisi.html` also confirm each category tab filters the cards, `Vsi zapisi` restores all six, and `Samozavedanje` correctly empties the grid.

- [x] **Step 4: Keyboard-only pass**

From a fresh load of `site/index.html`, using only Tab, Shift+Tab and Enter:
- The first Tab reveals the `Preskoči na vsebino` skip link, and Enter on it jumps to `#main`.
- Every nav link, button and form control is reachable, and the focus ring is visible against `Ivory` and against `Olive`.
- On `kontakt.html`, every field is reachable and its label is announced — verified in Task 11 Step 3.
- On `coaching.html`, each FAQ `<summary>` is focusable and toggles on Enter.

- [x] **Step 5: Confirm the launch-blocker regressions cannot return**

```bash
grep -rn "{{" site/ && echo "FAIL: placeholder token found" || echo "OK: no {{TOKEN}} anywhere"
grep -rniE "hello@pressence\.example|\+386 \(0\) 00" site/ && echo "FAIL: fake contact detail" || echo "OK: no fake contact details"
grep -rnE "[a-zčšž]_a\b|_na\b" site/*.html site/zapisi/*.html && echo "REVIEW: possible neutral gender form" || echo "OK: no neutral underscore forms"
```
Expected: `OK: no {{TOKEN}} anywhere`, `OK: no fake contact details`, `OK: no neutral underscore forms`.

- [x] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "Verification pass: responsive, keyboard and regression checks

Confirms all ten structural checks pass across fourteen pages, every design
token is used, layouts hold at 1440/860/375, the skip link and FAQ work by
keyboard, and none of the live site's placeholder tokens, fake contact
details or neutral gender forms are present.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [x] **Step 7: Report what needs the client**

Summarise for the user, drawing on `docs/LAUNCH-BLOCKERS.md`:
- Two items need her input: confirmed contact details, and legal copy for three pages.
- One needs hosting: a staging install, because Novamira will not run against production.
- Every image is a placeholder; `docs/ASSETS.md` doubles as the shoot brief.
- Five article bodies are unwritten by design.
- Offer to publish the prototype as a private Artifact so she can click through it on her
  phone and share the link, rather than opening files locally.

---

## Self-review

**Spec coverage.** Every spec section maps to a task: the WordPress stack and free-tier
constraints → Tasks 3, 6, 14; design tokens → Task 2; layout → Task 3; Elementor mapping →
Tasks 4–12 via `data-el`, consolidated in Task 14; the fourteen-page sitemap → Tasks 4–12;
the restored FAQ, Oblike and Praktično → Task 6; the contact form plus GDPR consent →
Task 11; imagery and the recoloured SVGs → Task 13; all five deliverable documents →
Tasks 13 and 14; the five launch blockers → Task 14, enforced by Task 15 Step 5.

**Placeholder scan.** The `p-todo` blocks and `data-placeholder` images are deliberate,
approved product decisions recorded in the spec, not plan placeholders. Task 10 Step 3 and
Task 12 Steps 2–3 describe repeated pages by naming every value that changes rather than
saying "similar to the above". Task 13 Step 2 cannot name specific Unsplash photo IDs
without searching, so it specifies the method, the verification, the size budget and the
fallback.

**Type consistency.** Checked across tasks: CSS class names (`p-panel`, `p-container`,
`p-card`, `p-post`, `p-faq`, `p-rail`, `p-todo`, `p-compare`, `p-article`, `p-aside`) are
used identically wherever they appear; token names all carry the `--p-` prefix and match
`tokens.css`; `data-root` is `"./"` at the top level and `"../"` for the six articles;
`data-page` values match the `slug` fields in `chrome.js`'s `NAV`; the filter's
`data-filter-cat` values match the cards' `data-cat` values, verified programmatically in
Task 8 Step 3; the article slugs in `EXPECTED_PAGES` match the filenames in Tasks 9 and 10
and the links in Task 8.
