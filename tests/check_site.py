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
