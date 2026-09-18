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
    # English tree. Slugs per the page-slug table in docs/MULTILINGUAL.md.
    # The six Zapisi articles have no translated body yet, so en/notes/ is
    # deliberately absent -- see the note on en/notes.html.
    "en/index.html", "en/coaching.html", "en/about.html", "en/notes.html",
    "en/contact.html", "en/privacy-policy.html", "en/cookie-policy.html",
    "en/legal-notice.html",
]

# Which language tree a page belongs to, by path prefix. Slovenian is the
# default language and sits at the root with no prefix, exactly as Polylang
# serves it.
LANG_TREES = [("en/", "en")]


def lang_of(rel):
    for prefix, code in LANG_TREES:
        if rel.replace(os.sep, "/").startswith(prefix):
            return code
    return "sl"

FAILURES = []


def fail(check, detail):
    FAILURES.append("%s: %s" % (check, detail))


class PageParser(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self)
        self.links = []
        self.assets = []
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
        elif tag == "link" and a.get("href"):
            self.assets.append(a["href"])
        elif tag == "img":
            self.imgs.append(a)
            if a.get("src"):
                self.assets.append(a["src"])
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self.headings.append(int(tag[1]))
        elif tag == "section":
            self.sections.append(a)
        elif tag == "script" and a.get("src"):
            self.scripts.append(a["src"])
            self.assets.append(a["src"])


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


def check_assets_resolve():
    """Stylesheets, scripts, images and icons - not just <a href>.
    A mangled relative path here is invisible until a page renders unstyled."""
    for rel in all_pages():
        p, _ = parse(rel)
        base = os.path.dirname(os.path.join(SITE, rel))
        for href in p.assets:
            if href.startswith(("http://", "https://", "data:", "//")):
                continue
            target = os.path.normpath(os.path.join(base, href.split("?")[0]))
            if not os.path.exists(target):
                fail("assets_resolve", "%s -> %s" % (rel, href))


def check_below_fold_images_lazy():
    """Every image but the one in the hero band should defer."""
    for rel in all_pages():
        _, text = parse(rel)
        for m in re.finditer(r"<img\b[^>]*>", text):
            tag = m.group(0)
            in_hero = text.rfind("p-hero__media", 0, m.start()) > text.rfind("</section>", 0, m.start())
            if in_hero:
                if 'loading="lazy"' in tag:
                    fail("below_fold_images_lazy", "%s: hero image should not be lazy" % rel)
            elif 'loading="lazy"' not in tag:
                fail("below_fold_images_lazy",
                     "%s: %s is not lazy" % (rel, re.search(r'src="([^"]*)"', tag).group(1)))


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
                # <meta name="theme-color"> cannot reference a CSS custom
                # property. It is the one sanctioned literal; keep it equal to
                # Olive in tokens.css.
                if 'name="theme-color"' in line:
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
        want = lang_of(rel)
        if p.lang != want:
            fail("head_metadata", "%s lang is %r, expected %r" % (rel, p.lang, want))
        if p.root_attr not in ("./", "../"):
            fail("head_metadata", "%s data-root is %r" % (rel, p.root_attr))


def check_img_alt():
    for rel in all_pages():
        p, _ = parse(rel)
        for a in p.imgs:
            if "alt" not in a:
                fail("img_alt", "%s: img %s has no alt" % (rel, a.get("src")))


# Photographs that are the real, final asset. Everything else under /img/ must
# still carry data-placeholder="true" so docs/ASSETS.md and the review filter in
# site.css stay honest about what has not been shot yet.
REAL_PHOTOGRAPHY = {
    # Her own coaching-session photograph, supplied by the client on 2026-09-18.
    # A real environmental portrait, which replaced the composited studio cutout
    # that stood here before. Two crops of one frame: landscape for the O meni
    # hero band, 4:5 for the Domov split.
    "portret-hero.jpg",
    "portret-o-meni.jpg",
    # Client-supplied imagery for the Domov, Coaching and Zapisi hero bands, same batch.
    "razgled-koca.jpg",
    "kamin-koca.jpg",
    "koca-gore.jpg",
}


def check_placeholders_tagged():
    """Placeholders must be tagged; real photography must not be.

    Tagging a real photo would apply the desaturating review filter to it, and
    leaving a placeholder untagged would hide it from the asset inventory.
    """
    for rel in all_pages():
        p, _ = parse(rel)
        for a in p.imgs:
            src = a.get("src", "")
            if "/img/" not in src:
                continue
            real = os.path.basename(src) in REAL_PHOTOGRAPHY
            tagged = a.get("data-placeholder") == "true"
            if real and tagged:
                fail("placeholders_tagged",
                     "%s: %s is real photography but is tagged as a placeholder" % (rel, src))
            elif not real and not tagged:
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


COPY_DOC = os.path.join(ROOT, "source", "copy.txt")
COPY_DOC_EN = os.path.join(ROOT, "source", "copy.en.md")

# Pages whose prose must come from the copy doc, sentence for sentence.
# The six Zapisi articles and the three legal pages are acknowledged scaffolds
# (see README) and are exempt.
PROVENANCE_PAGES = [
    "index.html", "coaching.html", "o-meni.html", "zapisi.html", "kontakt.html",
]

# The same guard for the English tree, against the English draft. Same rule,
# same reason: nothing in her voice may appear on the site that a human has not
# put into a copy doc first.
PROVENANCE_PAGES_EN = [
    "en/index.html", "en/coaching.html", "en/about.html", "en/notes.html",
    "en/contact.html",
]

# Sentences that are deliberately not from the copy doc. Keep this list short and
# justify every entry -- it is the only sanctioned escape hatch.
PROVENANCE_ALLOWED = [
    # GDPR consent wording for the contact form. Needs the client's legal
    # adviser to confirm; tracked in docs/LAUNCH-BLOCKERS.md.
    "strinjam se da se moje sporocilo in osebni podatki shranijo in uporabijo"
    " za odgovor kot je opisano v",
    "politiki zasebnosti",
    # Article dates and category chips on the Zapisi cards; the copy doc supplies
    # neither. Placeholder metadata until real posts exist.
    "maj 2024", "april 2024", "marec 2024",
    # She confirmed on 2026-09-09 that she also coaches in Czech. The source docx
    # predates that and lists only Slovenian and English. See docs/MULTILINGUAL.md.
    "slovenscina anglescina cescina",
    # "O imenu / Zakaj Pressence?" on Domov -- the section explaining the name
    # as presence + essence. Added 2026-09-16 from a reference design, NOT from
    # the source docx, so it is not in copy.txt and must not be written into
    # it: that file is the verbatim docx extraction and this check's only fixed
    # point. Pending the client's sign-off; see docs/LAUNCH-BLOCKERS.md.
    "pressence povezuje presence prisotnost in essence bistvo",
    "med njima je prostor",
    "prostor ki se odpre ko se za trenutek ustavimo utisamo zunanji hrup in"
    " odlozimo potrebo po takojsnjih odgovorih",
    "prav v tem prostoru lahko zacnemo jasneje zaznavati kaj je zares nase kaj"
    " nam je pomembno in kaj nas vodi",
    "prisotnost tako postane pot ki nas postopoma priblizuje bistvu",
]

PROVENANCE_ALLOWED_EN = [
    # GDPR consent wording for the contact form, as in the Slovenian list above.
    "i agree that my message and personal details may be stored and used to"
    " reply to me as described in the",
    "privacy policy",
    # Article dates and category chips on the Notes cards. Same placeholder
    # metadata as the Slovenian page; the copy doc supplies neither.
    "may 2024", "april 2024", "march 2024",
    # The English Notes cards are translated but the articles they open are
    # not, and the page says so rather than dropping the reader into Slovenian
    # without warning. Remove this line once the six bodies are translated.
    "the notes themselves are published in slovenian for now",
    "the links below open the slovenian originals",
    # "About the name / Why Pressence?" -- the English counterpart of the panel
    # allowed in the Slovenian list above, and carrying the same caveat: it is
    # not in the source docx and is pending the client's sign-off. copy.en.md
    # is a translation of copy.txt, which does not contain it either.
    "pressence brings together presence and essence",
    "between them there is a space",
    "a space that opens when we stop for a moment quieten the noise outside"
    " and set down the need for immediate answers",
    "it is in that space that we can begin to perceive more clearly what is"
    " truly ours what matters to us and what guides us",
    "presence becomes in this way a path that brings us gradually closer to"
    " the essence",
]

_FOLD = {
    "\u010d": "c", "\u0107": "c", "\u0161": "s", "\u017e": "z",
    "\u010c": "c", "\u0106": "c", "\u0160": "s", "\u017d": "z",
}


def _norm(text):
    """Lowercase, fold Slovenian diacritics, drop punctuation, collapse space."""
    text = text.lower()
    for k, v in _FOLD.items():
        text = text.replace(k, v)
    text = re.sub(r"[^0-9a-z\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _visible_sentences(raw):
    """Prose inside <main>, split into sentences, plus input placeholders."""
    body = re.search(r"<main\b.*?</main>", raw, re.S | re.I)
    chunk = body.group(0) if body else raw
    extra = re.findall(r'placeholder="([^"]*)"', chunk)
    chunk = re.sub(r"<(script|style)\b.*?</\1>", " ", chunk, flags=re.S | re.I)
    chunk = re.sub(r"<!--.*?-->", " ", chunk, flags=re.S)
    # Inline emphasis sits *inside* a sentence. Turning it into a line break
    # would shatter the sentence into fragments short enough to slip under the
    # 18-character floor below, which would let emphasised prose past this
    # check unexamined. Drop those tags instead of splitting on them.
    chunk = re.sub(r"</?(em|strong|i|b)\b[^>]*>", "", chunk, flags=re.I)
    chunk = re.sub(r"<[^>]+>", "\n", chunk)
    chunk = (chunk.replace("&nbsp;", " ").replace("&amp;", "&")
                  .replace("&lt;", "<").replace("&gt;", ">").replace("&#39;", "'")
                  .replace("&quot;", '"'))
    out = []
    for line in chunk.split("\n") + extra:
        for sentence in re.split(r"(?<=[.?!])\s+", line):
            if len(_norm(sentence)) > 18:
                out.append(sentence.strip())
    return out


def check_copy_provenance():
    """Every sentence of prose must be traceable to its language's copy doc.

    This is what stops copy from the live pressence.si -- or invented copy --
    reappearing in the client's voice. See the reverted 'Content restored from
    the live site' section of the design spec.
    """
    _provenance(COPY_DOC, PROVENANCE_PAGES, PROVENANCE_ALLOWED)
    _provenance(COPY_DOC_EN, PROVENANCE_PAGES_EN, PROVENANCE_ALLOWED_EN)


def _provenance(doc_path, pages, allow):
    if not os.path.isfile(doc_path):
        fail("copy_provenance", "missing %s" % os.path.relpath(doc_path, ROOT))
        return
    with open(doc_path, encoding="utf-8") as fh:
        doc = _norm(fh.read())
    allowed = [_norm(a) for a in allow]
    for rel in pages:
        path = os.path.join(SITE, rel)
        if not os.path.isfile(path):
            continue
        with open(path, encoding="utf-8") as fh:
            raw = fh.read()
        for sentence in _visible_sentences(raw):
            n = _norm(sentence)
            if n in doc or any(a and a in n for a in allowed):
                continue
            fail("copy_provenance", "%s: not in %s: %r"
                 % (rel, os.path.basename(doc_path), sentence[:90]))


CHECKS = [
    check_pages_exist,
    check_links_resolve,
    check_assets_resolve,
    check_below_fold_images_lazy,
    check_no_hardcoded_hex,
    check_head_metadata,
    check_img_alt,
    check_placeholders_tagged,
    check_sections_have_data_el,
    check_heading_order,
    check_no_unrendered_placeholders,
    check_chrome_included,
    check_copy_provenance,
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
