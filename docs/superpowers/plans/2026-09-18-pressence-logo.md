# Pressence Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the plain-text "Pressence" wordmark with the constructed lockup from
`docs/superpowers/specs/2026-09-18-pressence-logo-design.md`, in the site chrome as live text and
as outlined SVG files for off-site use, plus an `LK` monogram favicon.

**Architecture:** The site chrome renders the mark as styled spans driven by one custom property
(`--p-logo-sz`, the type size of `SENCE`); every other dimension is a multiple of it, so the mark
holds its proportions at any size and in the Georgia fallback. The portable SVGs are generated
once by a build-time Python tool that converts EB Garamond glyphs to path data, and the output is
committed so nobody needs the tool to use the logo.

**Tech Stack:** Vanilla HTML/CSS/JS (no build step, no runtime dependencies). Python 3 stdlib for
`tests/check_site.py`. `fontTools` as a **build-time-only** dependency for the glyph outliner,
never imported by the site or the checker.

---

## Read first

- `docs/superpowers/specs/2026-09-18-pressence-logo-design.md` — the geometry table is normative.
- Three items in that spec are open with the client. **Build on `with Lara Kaiser`.** It is one
  string constant (Task 6) and one regeneration (Task 4) to change.
- `python3 tests/check_site.py` must be green at every commit. Baseline before this work:
  **13 checks, 22 pages, all passing.**

## File structure

| File | Responsibility |
|---|---|
| `tools/outline_glyphs.py` | **new.** Turns a string of EB Garamond into SVG path data. Build-time only. |
| `tools/requirements.txt` | **new.** Pins `fontTools`. Build-time only. |
| `tools/build_logo.py` | **new.** Composes the lockup and monogram SVGs from `outline_glyphs`. |
| `tests/test_outline_glyphs.py` | **new.** Unit tests for the outliner. `unittest`, no pytest. |
| `site/assets/svg/pressence-logo.svg` | **new, generated.** Primary lockup, outlined. |
| `site/assets/svg/pressence-monogram.svg` | **new, generated.** `LK`, outlined. |
| `site/assets/svg/favicon.svg` | **replaced.** The `LK` monogram on Olive. |
| `site/assets/css/tokens.css` | **modified.** `--p-logo-sz-header` / `--p-logo-sz-footer`. |
| `site/assets/css/site.css` | **modified.** The lockup rules; header padding; `.p-footer__logo` removed. |
| `site/assets/js/chrome.js` | **modified.** The header and footer logo markup. |
| `tests/check_site.py` | **modified.** One new check: the logo's accessible name. |
| `docs/ASSETS.md`, `docs/DESIGN-SYSTEM.md` | **modified.** Brand SVG table, logotype rows. |

`tools/` is new. Nothing in `site/` or `tests/check_site.py` may import from it — the stdlib-only
guarantee that matters is the checker's, and it stays intact.

---

## Task 1: The glyph outliner

**Files:**
- Create: `tools/requirements.txt`
- Create: `tools/outline_glyphs.py`
- Create: `tests/test_outline_glyphs.py`

- [ ] **Step 1: Install the build-time dependency**

```bash
cd /Users/timihras/Code/Timaja/larasebek
mkdir -p tools vendor/fonts
printf 'fonttools==4.53.1\n' > tools/requirements.txt
python3 -m pip install --user -r tools/requirements.txt
```

Expected: `Successfully installed fonttools-4.53.1` (or "already satisfied").

- [ ] **Step 2: Fetch the EB Garamond variable fonts**

```bash
cd /Users/timihras/Code/Timaja/larasebek
curl -sSfL -o vendor/fonts/EBGaramond.ttf \
  "https://github.com/google/fonts/raw/main/ofl/ebgaramond/EBGaramond%5Bwght%5D.ttf"
curl -sSfL -o vendor/fonts/EBGaramond-Italic.ttf \
  "https://github.com/google/fonts/raw/main/ofl/ebgaramond/EBGaramond-Italic%5Bwght%5D.ttf"
ls -l vendor/fonts/
```

Expected: two files, each roughly 500KB–1.5MB. If either 404s, the upstream path has moved —
find the current one under `https://github.com/google/fonts/tree/main/ofl/ebgaramond` and use
that. These are variable fonts; Task 1 instantiates the weight it needs.

Add `vendor/` to `.gitignore` — the fonts are refetchable and do not belong in the repo:

```bash
printf '\n# Build-time font sources for tools/ — refetchable, not committed.\nvendor/\n' >> .gitignore
```

- [ ] **Step 3: Write the failing tests**

Create `tests/test_outline_glyphs.py`:

```python
"""Unit tests for the build-time glyph outliner.

These are NOT part of check_site.py. They need fontTools and the fonts under
vendor/, both of which are build-time only. Run them with:

    python3 -m unittest discover -s tests -p 'test_*.py'
"""
import os
import sys
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))

import outline_glyphs  # noqa: E402


class TextPathTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.font = outline_glyphs.load_font(weight=500)

    def test_returns_a_path_and_a_positive_advance(self):
        d, advance = outline_glyphs.text_path(self.font, "LK", 100.0)
        self.assertTrue(d.startswith("M"), d[:40])
        self.assertGreater(advance, 0)

    def test_tracking_widens_the_advance(self):
        _, tight = outline_glyphs.text_path(self.font, "LK", 100.0, tracking=0.0)
        _, loose = outline_glyphs.text_path(self.font, "LK", 100.0, tracking=0.04)
        self.assertGreater(loose, tight)

    def test_advance_scales_with_size(self):
        _, small = outline_glyphs.text_path(self.font, "SENCE", 50.0)
        _, large = outline_glyphs.text_path(self.font, "SENCE", 100.0)
        self.assertAlmostEqual(large / small, 2.0, places=6)

    def test_cap_height_is_a_sane_fraction_of_the_size(self):
        cap = outline_glyphs.cap_height(self.font, 100.0)
        self.assertGreater(cap, 55.0)
        self.assertLess(cap, 80.0)

    def test_glyphs_sit_above_the_baseline(self):
        # SVG y grows downward, so caps must come out negative.
        d, _ = outline_glyphs.text_path(self.font, "L", 100.0)
        ys = outline_glyphs.path_y_extent(d)
        self.assertLess(ys[0], 0)
        self.assertLessEqual(ys[1], 1.0)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 4: Run the tests to verify they fail**

```bash
cd /Users/timihras/Code/Timaja/larasebek && python3 -m unittest discover -s tests -p 'test_*.py' -v
```

Expected: `ModuleNotFoundError: No module named 'outline_glyphs'`.

- [ ] **Step 5: Write the outliner**

Create `tools/outline_glyphs.py`:

```python
"""EB Garamond glyphs to SVG path data.

Build-time only. Nothing under site/ and nothing in tests/check_site.py may
import this module -- the checker stays Python-3-stdlib-only.

The fonts are variable; a weight is instantiated on load, so the 500 used by
the PRE/ES stack is a real 500 and not a faked one.
"""
import os
import re

from fontTools.misc.transform import Transform
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, "vendor", "fonts")

UPRIGHT = os.path.join(FONTS, "EBGaramond.ttf")
ITALIC = os.path.join(FONTS, "EBGaramond-Italic.ttf")


def load_font(weight=400, italic=False):
    """Return a static instance of EB Garamond at the given weight."""
    path = ITALIC if italic else UPRIGHT
    if not os.path.exists(path):
        raise SystemExit(
            "Missing %s -- see Task 1 Step 2 of the logo plan for the fetch." % path
        )
    return instancer.instantiateVariableFont(TTFont(path), {"wght": weight})


def cap_height(font, size):
    """Cap height in the same units as `size`."""
    upem = font["head"].unitsPerEm
    return font["OS/2"].sCapHeight * size / upem


def text_path(font, text, size, tracking=0.0):
    """SVG path data for `text`, and the advance width it consumed.

    The baseline is y=0 and glyphs extend into negative y, which is the SVG
    convention: the font's own y-up coordinates are flipped on the way out.
    `tracking` is in em, matching CSS letter-spacing.
    """
    upem = font["head"].unitsPerEm
    scale = size / upem
    cmap = font.getBestCmap()
    glyphs = font.getGlyphSet()
    hmtx = font["hmtx"]

    parts = []
    x = 0.0
    for ch in text:
        name = cmap[ord(ch)]
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(TransformPen(pen, Transform(scale, 0, 0, -scale, x, 0)))
        d = pen.getCommands()
        if d:
            parts.append(d)
        x += hmtx[name][0] * scale + tracking * size
    return " ".join(parts), x


def path_y_extent(d):
    """(min_y, max_y) over the numbers in a path's vertical positions.

    Coarse on purpose -- it exists so the tests can assert which side of the
    baseline the glyphs came out on, not to measure a bounding box.
    """
    nums = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", d)]
    ys = nums[1::2]
    return (min(ys), max(ys))
```

- [ ] **Step 6: Run the tests to verify they pass**

```bash
cd /Users/timihras/Code/Timaja/larasebek && python3 -m unittest discover -s tests -p 'test_*.py' -v
```

Expected: `Ran 5 tests` … `OK`.

If `test_cap_height_is_a_sane_fraction_of_the_size` fails because `sCapHeight` is absent from
this build of the font, fall back to measuring the `H` glyph's bounding box and adjust the helper
— do not widen the assertion to make it pass.

- [ ] **Step 7: Confirm the checker is unaffected**

```bash
cd /Users/timihras/Code/Timaja/larasebek && python3 tests/check_site.py
```

Expected: `All 13 checks passed across 22 pages.`

- [ ] **Step 8: Commit**

```bash
cd /Users/timihras/Code/Timaja/larasebek
git add tools/outline_glyphs.py tools/requirements.txt tests/test_outline_glyphs.py .gitignore
git commit -m "Add a build-time glyph outliner for the logo

fontTools is build-time only: neither site/ nor check_site.py imports it,
so the checker stays stdlib-only. The fonts under vendor/ are refetchable
and stay out of the repo.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 2: Compose the lockup SVG

**Files:**
- Create: `tools/build_logo.py`
- Create (generated): `site/assets/svg/pressence-logo.svg`

The SVG geometry is defined on **cap heights**, because that is what the design is actually
about; the CSS in Task 5 is defined on line boxes, because that is what CSS gives you. The two
are tuned to match visually and Task 8 compares them side by side. The CSS is already validated
against rendered output, so if they disagree, **nudge the SVG, not the CSS.**

With `sz` the type size of `SENCE`, and `cap` its cap height:

| Element | Position |
|---|---|
| `SENCE` | baseline at `y = 0`, starting at `x = stackWidth + 0.085·sz` |
| mid-line | `y_mid = -cap / 2` — the vertical centre of `SENCE`'s caps |
| stack box | `y_mid ± 0.53·sz` (total `1.06·sz`) |
| `PRE` | baseline at `boxTop + cap52`, right-aligned to `stackWidth` |
| `ES` | baseline at `boxBottom`, right-aligned to `stackWidth` |
| hairline | `y = y_mid`, from `x = 0` to `x = stackWidth`, `1px` at 45% |
| byline | cap top at `0.10·sz` below `SENCE`'s baseline, right edge flush with `SENCE`'s |

- [ ] **Step 1: Write the composer**

Create `tools/build_logo.py`:

```python
"""Generate the Pressence logo and monogram SVGs.

Run after any change to the lockup geometry:

    python3 tools/build_logo.py

Geometry is normative in docs/superpowers/specs/2026-09-18-pressence-logo-design.md.
"""
import os

import outline_glyphs as og

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "site", "assets", "svg")

SZ = 100.0          # SENCE's type size; everything else is a multiple
STACK_RATIO = 0.52
BOX_RATIO = 1.06
GUTTER_RATIO = 0.085
BYLINE_RATIO = 0.38
BYLINE_GAP_RATIO = 0.10
LS_SENCE = 0.02
LS_STACK = 0.035
LS_BYLINE = 0.01
PAD = 8.0

BYLINE_TEXT = "with Lara Kaiser"   # open with the client; see the spec


def build_lockup():
    upright400 = og.load_font(400)
    upright500 = og.load_font(500)
    italic400 = og.load_font(400, italic=True)

    stack_sz = SZ * STACK_RATIO
    by_sz = SZ * BYLINE_RATIO
    cap = og.cap_height(upright400, SZ)
    cap_stack = og.cap_height(upright500, stack_sz)

    d_sence, w_sence = og.text_path(upright400, "SENCE", SZ, LS_SENCE)
    d_pre, w_pre = og.text_path(upright500, "PRE", stack_sz, LS_STACK)
    d_es, w_es = og.text_path(upright500, "ES", stack_sz, LS_STACK)
    d_by, w_by = og.text_path(italic400, BYLINE_TEXT, by_sz, LS_BYLINE)

    # Trailing letter-spacing is not ink; drop it so right edges are true.
    w_sence -= LS_SENCE * SZ
    w_pre -= LS_STACK * stack_sz
    w_es -= LS_STACK * stack_sz
    w_by -= LS_BYLINE * by_sz

    stack_w = max(w_pre, w_es)
    sence_x = stack_w + SZ * GUTTER_RATIO
    sence_right = sence_x + w_sence

    y_mid = -cap / 2.0
    box_top = y_mid - SZ * BOX_RATIO / 2.0
    box_bottom = y_mid + SZ * BOX_RATIO / 2.0

    pre_y = box_top + cap_stack
    es_y = box_bottom
    by_y = SZ * BYLINE_GAP_RATIO + og.cap_height(italic400, by_sz)
    by_x = sence_right - w_by

    groups = [
        ('<path d="%s" transform="translate(%.3f 0)"/>' % (d_sence, sence_x)),
        ('<path d="%s" transform="translate(%.3f %.3f)"/>'
         % (d_pre, stack_w - w_pre, pre_y)),
        ('<path d="%s" transform="translate(%.3f %.3f)"/>'
         % (d_es, stack_w - w_es, es_y)),
        ('<path d="%s" transform="translate(%.3f %.3f)"/>' % (d_by, by_x, by_y)),
    ]
    rule = ('<rect x="0" y="%.3f" width="%.3f" height="1" opacity="0.45"/>'
            % (y_mid - 0.5, stack_w))

    min_x = -PAD
    min_y = box_top - PAD
    width = sence_right + PAD * 2
    height = (by_y - box_top) + PAD * 2

    return (
        '<svg xmlns="http://www.w3.org/2000/svg" '
        'viewBox="%.3f %.3f %.3f %.3f" role="img" '
        'aria-labelledby="t"><title id="t">Pressence — %s</title>'
        '<g fill="currentColor">%s%s</g></svg>\n'
        % (min_x, min_y, width, height, BYLINE_TEXT, "".join(groups), rule)
    )


def main():
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, "pressence-logo.svg")
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(build_lockup())
    print("wrote", os.path.relpath(path, ROOT))


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Generate it**

```bash
cd /Users/timihras/Code/Timaja/larasebek && python3 tools/build_logo.py && head -c 300 site/assets/svg/pressence-logo.svg
```

Expected: `wrote site/assets/svg/pressence-logo.svg`, then an `<svg …viewBox=…><title>` opening.

- [ ] **Step 3: Look at it**

```bash
cd /Users/timihras/Code/Timaja/larasebek && open site/assets/svg/pressence-logo.svg
```

Check, in this order: `PRESENCE` reads across the top; `ESSENCE` reads across the bottom; the
rule sits in the gap between `PRE` and `ES`; the byline's right edge is flush with the `E` of
`SENCE`; nothing is clipped by the viewBox. If the byline overhangs, `w_by`'s trailing-tracking
subtraction is the first thing to check.

- [ ] **Step 4: Commit**

```bash
cd /Users/timihras/Code/Timaja/larasebek
git add tools/build_logo.py site/assets/svg/pressence-logo.svg
git commit -m "Generate the outlined Pressence lockup

Committed so the logo is usable without the toolchain; regenerate with
python3 tools/build_logo.py.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 3: The LK monogram and the favicon

**Files:**
- Modify: `tools/build_logo.py`
- Create (generated): `site/assets/svg/pressence-monogram.svg`
- Replace (generated): `site/assets/svg/favicon.svg`

The monogram is plain — **no hairline.** It renders at 16px on a tab strip and 48px as an avatar,
and the rule lands as a row of grey pixels at that size rather than degrading cleanly.

- [ ] **Step 1: Add the monogram builder**

Append to `tools/build_logo.py`, above `main()`:

```python
MONO_TEXT = "LK"
MONO_LS = 0.04
MONO_BOX = 64.0          # favicon.svg is drawn on a 64-unit square
MONO_CAP_RATIO = 0.42    # cap height as a fraction of the square


def build_monogram(ground=None):
    """The LK monogram. With `ground`, a filled square for the favicon;
    without, a transparent mark that inherits currentColor."""
    font = og.load_font(500)
    target_cap = MONO_BOX * MONO_CAP_RATIO
    size = MONO_BOX * target_cap / og.cap_height(font, MONO_BOX)
    d, w = og.text_path(font, MONO_TEXT, size, MONO_LS)
    w -= MONO_LS * size
    cap = og.cap_height(font, size)

    x = (MONO_BOX - w) / 2.0
    y = (MONO_BOX + cap) / 2.0     # baseline, so the caps sit optically centred

    rect = ''
    fill = 'currentColor'
    if ground:
        rect = '<rect width="64" height="64" fill="%s"/>' % ground
        fill = '%s' % "#FAF8F5"
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" '
        'aria-labelledby="t"><title id="t">Pressence</title>%s'
        '<path d="%s" transform="translate(%.3f %.3f)" fill="%s"/></svg>\n'
        % (rect, d, x, y, fill)
    )
```

Then replace `main()` with:

```python
def main():
    os.makedirs(OUT, exist_ok=True)
    written = [
        ("pressence-logo.svg", build_lockup()),
        ("pressence-monogram.svg", build_monogram()),
        ("favicon.svg", build_monogram(ground="#3A4032")),
    ]
    for name, svg in written:
        path = os.path.join(OUT, name)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(svg)
        print("wrote", os.path.relpath(path, ROOT))
```

The two hex literals here are Olive and Ivory from `tokens.css`. `check_no_hardcoded_hex` only
scans `site.css` and the HTML pages, so SVG files are outside it — as the existing brand SVGs
already are. Keep them equal to the tokens.

- [ ] **Step 2: Generate**

```bash
cd /Users/timihras/Code/Timaja/larasebek && python3 tools/build_logo.py
```

Expected: three `wrote …` lines.

- [ ] **Step 3: Check it at real size**

```bash
cd /Users/timihras/Code/Timaja/larasebek && open site/assets/svg/favicon.svg
```

Then open any page and look at the browser tab:

```bash
cd /Users/timihras/Code/Timaja/larasebek && open site/index.html
```

Expected: `LK` legible in the tab, optically centred, comfortable margins. Every page already
references `assets/svg/favicon.svg`, so replacing the file is the whole change — no HTML edit.

- [ ] **Step 4: Verify the checker still passes**

```bash
cd /Users/timihras/Code/Timaja/larasebek && python3 tests/check_site.py
```

Expected: `All 13 checks passed across 22 pages.`

- [ ] **Step 5: Commit**

```bash
cd /Users/timihras/Code/Timaja/larasebek
git add tools/build_logo.py site/assets/svg/pressence-monogram.svg site/assets/svg/favicon.svg
git commit -m "Replace the favicon with the LK monogram

Plain, no hairline: at 16px the rule reads as a row of grey pixels rather
than degrading cleanly.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 4: A checker rule for the logo's accessible name

**Files:**
- Modify: `tests/check_site.py:421` (the `CHECKS` list) and above it

The construction reads as "PRE ES SENCE" to a screen reader. This check is the thing that stops
that regressing.

- [ ] **Step 1: Write the failing check**

Insert into `tests/check_site.py`, immediately before `COPY_DOC = …`:

```python
def check_logo_accessible_name():
    """The wordmark is built from decorative spans, so the link must carry its
    own accessible name -- without it a screen reader announces the
    construction, "PRE ES SENCE", instead of the brand."""
    path = os.path.join(SITE, "assets/js/chrome.js")
    with open(path, encoding="utf-8") as fh:
        src = fh.read()
    if 'aria-label="Pressence"' not in src:
        fail("logo_accessible_name", "chrome.js: the logo has no aria-label")
    for cls in ("p-logo__stack", "p-logo__sence", "p-logo__by"):
        found = False
        for m in re.finditer(r'class="%s"([^>]*)' % re.escape(cls), src):
            found = True
            if "aria-hidden" not in m.group(1):
                fail("logo_accessible_name",
                     "chrome.js: .%s is not aria-hidden" % cls)
        if not found:
            fail("logo_accessible_name", "chrome.js: .%s is missing" % cls)
```

Register it in `CHECKS`, after `check_chrome_included`:

```python
    check_chrome_included,
    check_logo_accessible_name,
    check_copy_provenance,
```

- [ ] **Step 2: Run it to verify it fails**

```bash
cd /Users/timihras/Code/Timaja/larasebek && python3 tests/check_site.py
```

Expected: 4 failures — no `aria-label`, and each of the three spans missing. The markup that
satisfies this lands in Task 6; the check is written first on purpose.

- [ ] **Step 3: Commit the failing check**

```bash
cd /Users/timihras/Code/Timaja/larasebek
git add tests/check_site.py
git commit -m "Add a checker rule for the logo's accessible name

Fails until the lockup markup lands in chrome.js.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 5: Tokens and the lockup CSS

**Files:**
- Modify: `site/assets/css/tokens.css` (after the type scale block)
- Modify: `site/assets/css/site.css:322-356` (`.p-header`, `.p-logo`) and `:398` (`.p-footer__logo`)

- [ ] **Step 1: Add the tokens**

In `site/assets/css/tokens.css`, immediately after `--p-ls-h1: -0.01em;`:

```css

  /* --- Logo --------------------------------------------------------- */
  /* --p-logo-sz is the type size of SENCE. Every other dimension in the
     lockup is a multiple of it, so the mark holds its proportions at any
     size and in the Georgia fallback. See the geometry table in
     docs/superpowers/specs/2026-09-18-pressence-logo-design.md. */
  --p-logo-sz-header: 30px;
  --p-logo-sz-footer: 32px;
```

- [ ] **Step 2: Replace the header logo rule**

In `site/assets/css/site.css`, replace the whole `.p-logo { … }` block (currently at `:333`):

```css
/* The wordmark. PRE and ES stack into a SENCE that both words share, and the
   rule between them is the space the name is about. Two grid columns so the
   byline can hang under SENCE and align to its right edge; the left edge stays
   ragged because the stack is narrower. currentColor on the rule and the
   byline is load-bearing -- it is what lets one mark reverse into the footer
   without a second version. */
.p-logo {
  --p-logo-sz: var(--p-logo-sz-header);
  display: inline-grid;
  grid-template-columns: auto auto;
  align-items: center;
  font-family: var(--p-font-display);
  color: var(--p-ink);
  text-decoration: none;
  white-space: nowrap;
  margin-right: auto;
}
.p-logo__stack {
  grid-column: 1; grid-row: 1;
  display: flex; flex-direction: column; justify-content: space-between;
  height: calc(var(--p-logo-sz) * 1.06);
  margin-right: calc(var(--p-logo-sz) * 0.085);
  font-size: calc(var(--p-logo-sz) * 0.52);
  font-weight: 500;
  line-height: 0.7;
  letter-spacing: 0.035em;
  text-align: right;
  position: relative;
}
.p-logo__stack::after {
  content: "";
  position: absolute; left: 0; right: 0; top: 50%;
  border-top: 1px solid currentColor;
  opacity: 0.45;
}
.p-logo__sence {
  grid-column: 2; grid-row: 1;
  font-size: var(--p-logo-sz);
  font-weight: 400;
  line-height: 0.7;
  letter-spacing: 0.02em;
}
.p-logo__by {
  grid-column: 2; grid-row: 2;
  justify-self: end;
  margin-top: calc(var(--p-logo-sz) * 0.1);
  font-size: calc(var(--p-logo-sz) * 0.38);
  font-style: italic;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.01em;
  opacity: 0.8;
}
.p-logo--footer {
  --p-logo-sz: var(--p-logo-sz-footer);
  color: inherit;
  margin-right: 0;
  margin-bottom: 0.5em;
}
```

Then **delete** the now-duplicate line further down (`:355`):

```css
.p-logo { margin-right: auto; }
```

and **delete** the old footer rule (`:398`):

```css
.p-footer__logo { font: 400 28px/1 var(--p-font-display); margin-bottom: 0.5em; display: block; }
```

- [ ] **Step 3: Give the two-deck mark room in the header**

In `.p-header` (`:322`), change the vertical padding:

```css
  padding: 14px var(--p-gutter);
```

And add a mobile step at the end of the existing `@media (max-width: 860px)` block:

```css
  /* The two-deck mark competes with the burger and the language switch on a
     phone; one step down buys the room back. */
  .p-logo { --p-logo-sz: 24px; }
```

- [ ] **Step 4: Verify no hardcoded hex crept in**

```bash
cd /Users/timihras/Code/Timaja/larasebek && python3 tests/check_site.py 2>&1 | grep -c "no_hardcoded_hex" || echo "0 hex failures"
```

Expected: `0 hex failures`. The four Task 4 failures are still expected at this point.

- [ ] **Step 5: Commit**

```bash
cd /Users/timihras/Code/Timaja/larasebek
git add site/assets/css/tokens.css site/assets/css/site.css
git commit -m "Style the logo lockup from one measure

Every dimension is a multiple of --p-logo-sz, so the mark holds its
proportions at any size and in the Georgia fallback.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 6: The chrome markup

**Files:**
- Modify: `site/assets/js/chrome.js:119` (header) and `:157` (footer)

- [ ] **Step 1: Add the byline constant and the markup helper**

In `site/assets/js/chrome.js`, immediately after `var t = T[lang] || T.sl;`:

```js
  /* The mark does not translate -- it is one lockup in both languages, so the
     byline is deliberately NOT in T. Awaiting the client on the connector
     ("with" / "by" / none) and on the spelling of the name; see
     docs/superpowers/specs/2026-09-18-pressence-logo-design.md. */
  var BYLINE = "with Lara Kaiser";

  /* PRE and ES stack into a shared SENCE. Every span is decorative: a screen
     reader reading them would hear "PRE ES SENCE", so the wrapper carries the
     accessible name and all three are hidden. */
  function logoInner() {
    return '<span class="p-logo__stack" aria-hidden="true">' +
             "<span>PRE</span><span>ES</span>" +
           "</span>" +
           '<span class="p-logo__sence" aria-hidden="true">SENCE</span>' +
           '<span class="p-logo__by" aria-hidden="true">' + BYLINE + "</span>";
  }
```

- [ ] **Step 2: Replace the header logo**

Replace this line (`:119`):

```js
        '<a class="p-logo" href="' + url("index.html") + '">Pressence</a>' +
```

with:

```js
        '<a class="p-logo" href="' + url("index.html") + '" aria-label="Pressence">' +
          logoInner() +
        "</a>" +
```

- [ ] **Step 3: Replace the footer logo**

Replace this line (`:157`):

```js
          '<span class="p-footer__logo">Pressence</span>' +
```

with:

```js
          '<span class="p-logo p-logo--footer" role="img" aria-label="Pressence">' +
            logoInner() +
          "</span>" +
```

- [ ] **Step 4: Run the checker — it should now be green**

```bash
cd /Users/timihras/Code/Timaja/larasebek && python3 tests/check_site.py
```

Expected: `All 14 checks passed across 22 pages.`

- [ ] **Step 5: Commit**

```bash
cd /Users/timihras/Code/Timaja/larasebek
git add site/assets/js/chrome.js
git commit -m "Render the wordmark as a construction in the chrome

The visual spans are decorative and hidden; the link carries the name.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 7: Documentation

**Files:**
- Modify: `docs/ASSETS.md` (the Brand SVGs table, around `:167-184`)
- Modify: `docs/DESIGN-SYSTEM.md` (Global Colors `Ink` row; the Custom CSS class table)

- [ ] **Step 1: Add the two new SVGs to the assets table**

Append rows to the Brand SVGs table in `docs/ASSETS.md`:

```markdown
| `pressence-logo.svg` | — (new, 2026-09-18) | `currentColor` | The primary lockup, EB Garamond converted to outlines so it carries no font dependency. **Generated** — `python3 tools/build_logo.py`; do not hand-edit. |
| `pressence-monogram.svg` | — (new, 2026-09-18) | `currentColor` | `LK`, outlined. The wordmark's small-size counterpart, for avatars. **Generated.** |
| `favicon.svg` | `#3A4032` ground, `#FAF8F5` mark | Olive / Ivory | Replaced 2026-09-18: was the root-and-sprout mark, now the `LK` monogram. **Generated.** |
```

- [ ] **Step 2: Update the design system**

In `docs/DESIGN-SYSTEM.md`, add to the Custom CSS class table:

```markdown
| `p-logo`, `p-logo__stack`, `p-logo__sence`, `p-logo__by` | the wordmark lockup. One custom property, `--p-logo-sz`, is the type size of `SENCE`; every other dimension is a multiple of it. The rule and the byline use `currentColor`, which is what lets one mark reverse into the Olive footer without a second version |
| `p-logo--footer` | the same lockup at the footer size, inheriting the band's colour |
```

And extend the `Ink` row in Global Colors so the logotype note stays true:

```markdown
| 1 | Primary | `Ink` | `#1E1F1B` | headings, logotype (the wordmark; the byline and the rule derive from it via `currentColor`) |
```

- [ ] **Step 3: Commit**

```bash
cd /Users/timihras/Code/Timaja/larasebek
git add docs/ASSETS.md docs/DESIGN-SYSTEM.md
git commit -m "Document the logo assets and the lockup classes

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Task 8: Verification

No code. This is the gate — every decision in the spec was made against rendered output, so the
work is not done until it has been looked at.

- [ ] **Step 1: Full checker run**

```bash
cd /Users/timihras/Code/Timaja/larasebek && python3 tests/check_site.py && python3 -m unittest discover -s tests -p 'test_*.py'
```

Expected: `All 14 checks passed across 22 pages.` then `OK`.

- [ ] **Step 2: Read the mark at all three sizes**

Open `site/index.html`. Confirm, at the default window width:
- the header mark reads `PRESENCE` across the top and `ESSENCE` across the bottom
- the rule sits in the gap, not through a letter
- the byline's right edge is flush with `SENCE`'s
- the footer mark is the same construction, reversed, and the rule and byline are **visible** on
  Olive — this is the exact bug that appeared in design review when the byline was a fixed colour

- [ ] **Step 3: Compare the CSS mark against the generated SVG**

Open `site/assets/svg/pressence-logo.svg` beside the page. They are built from different geometry
(cap heights vs line boxes) and must still look like the same mark. If they disagree, adjust
`tools/build_logo.py` and regenerate — the CSS is the validated one.

- [ ] **Step 4: Reflow**

Check 390, 768, 1024, 1440 and 1920px for horizontal overflow, per the existing requirement in
`docs/DESIGN-SYSTEM.md`. **390 and 768 are the ones at risk** — the header now carries a two-deck
mark alongside the burger and the language switch.

- [ ] **Step 5: Favicon at true size**

Confirm `LK` is legible in the browser tab, not a smudge.

- [ ] **Step 6: Commit any fixes, then stop**

Three things stay open and are **not** to be invented:
1. the connector word — `BYLINE` in `chrome.js:~62` and `BYLINE_TEXT` in `tools/build_logo.py`
2. the footer tagline, which now makes a third deck under the mark
3. the spelling of the surname

---

## Self-review

**Spec coverage.** Geometry table → Task 5 (CSS) and Task 2 (SVG). Forms and sizes → Tasks 2, 3, 5.
Colour → Task 5. Live text in chrome → Tasks 5, 6. Portable SVG → Tasks 1, 2. Outlining decision →
Task 1. Accessibility → Tasks 4, 6. Files-changed table → Tasks 5, 6, 7. Verification → Task 8.
Open questions → carried as named constants in Tasks 2 and 6, restated in Task 8 Step 6.

**One spec item with no task, resolved here:** the spec's "What changes" table lists
`site/assets/svg/favicon.svg` but the plan must also not break the 22 pages that reference it —
covered by Task 3 Step 3, which confirms no HTML edit is needed because the path is unchanged.

**Naming consistency.** `--p-logo-sz` (the local property) is set from `--p-logo-sz-header` /
`--p-logo-sz-footer` (the tokens) — checked across Tasks 5 and 7. `logoInner()`, `BYLINE`,
`p-logo__stack` / `__sence` / `__by` are identical in Tasks 4, 5 and 6. `og.cap_height`,
`og.text_path`, `og.load_font`, `og.path_y_extent` are defined in Task 1 and used in Task 2.

**A known gap, stated rather than papered over.** `check_copy_provenance` exists because "nothing
in her voice may appear on the site that a human has not put into a copy doc first". `with Lara
Kaiser` is new copy in no copy doc. It does not trip the check — the chrome is injected by JS and
the checker parses static HTML — but it is against the spirit of that rule. Once the client
confirms the wording and spelling, the byline should be added to `source/copy.txt`. Deliberately
not a task: it needs her reply first.
