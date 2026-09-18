/* chrome.js - renders the header and footer from a single nav structure.
   Every page sets <html lang="sl|en" data-root="./"> or data-root="../">.
   data-root points at the *language* root, not at the site root: site/en/notes/x.html
   sets "../", which is site/en/. siteRoot below walks back out of the language
   folder so the language switch can cross from one language tree to another. */
(function () {
  var root = document.documentElement.getAttribute("data-root") || "./";
  var lang = document.documentElement.getAttribute("lang") || "sl";
  var current = document.body.getAttribute("data-page") || "";

  /* Nav, legal links and chrome strings, one table per language. The slug key is
     the same in every language so a page knows its counterpart; only the file
     name changes, per the page-slug table in docs/MULTILINGUAL.md. */
  var T = {
    sl: {
      prefix: "",
      nav: [
        { slug: "domov",    label: "Domov",    href: "index.html" },
        { slug: "coaching", label: "Coaching", href: "coaching.html" },
        { slug: "o-meni",   label: "O meni",   href: "o-meni.html" },
        { slug: "zapisi",   label: "Zapisi",   href: "zapisi.html" },
        { slug: "kontakt",  label: "Kontakt",  href: "kontakt.html" }
      ],
      legal: [
        { label: "Politika zasebnosti", href: "politika-zasebnosti.html" },
        { label: "Piškotki",            href: "politika-piskotkov.html" },
        { label: "Pravno obvestilo",    href: "pravno-obvestilo.html" }
      ],
      skip: "Preskoči na vsebino",
      mainNav: "Glavna navigacija",
      footerNav: "Navigacija v nogi",
      menu: "Meni",
      langNav: "Jezik",
      tagline: "Prostor za jasnejši stik s sabo.",
      disclaimer: "Coaching ni nadomestilo za psihoterapijo, zdravstveno obravnavo " +
                  "ali drugo ustrezno strokovno pomoč."
    },
    en: {
      prefix: "en/",
      nav: [
        { slug: "domov",    label: "Home",     href: "index.html" },
        { slug: "coaching", label: "Coaching", href: "coaching.html" },
        { slug: "o-meni",   label: "About me", href: "about.html" },
        { slug: "zapisi",   label: "Notes",    href: "notes.html" },
        { slug: "kontakt",  label: "Contact",  href: "contact.html" }
      ],
      legal: [
        { label: "Privacy policy", href: "privacy-policy.html" },
        { label: "Cookies",        href: "cookie-policy.html" },
        { label: "Legal notice",   href: "legal-notice.html" }
      ],
      skip: "Skip to content",
      mainNav: "Main navigation",
      footerNav: "Footer navigation",
      menu: "Menu",
      langNav: "Languages",
      tagline: "Room for a clearer relationship with yourself.",
      disclaimer: "Coaching is not a substitute for psychotherapy, medical care " +
                  "or other appropriate professional help."
    }
  };

  var t = T[lang] || T.sl;

  /* site root = the language root, walked back out of the language folder.
     The "./" case is spelled out so the result is "../" and not "./../". */
  var siteRoot = t.prefix ? (root === "./" ? "" : root) + "../" : root;

  function url(href) { return root + href; }

  function navLinks() {
    return t.nav.map(function (item) {
      var aria = item.slug === current ? ' aria-current="page"' : "";
      return '<a href="' + url(item.href) + '"' + aria + ">" + item.label + "</a>";
    }).join("");
  }

  /* Language switch. Endonyms, never flags - see docs/MULTILINGUAL.md. The
     visible mark is the two-letter code, because the header has to stay light;
     the full endonym is the accessible name and carries its own lang. The link
     lands on the counterpart of the page you are on, and falls back to that
     language's home when there is no counterpart - a legal page, or an article
     whose body is not translated yet.
     Two site languages, Slovenian and English. To add a third, give it a table
     in T above and an endonym here; nothing else in this file changes. */
  var LANGS = [
    { code: "SL", name: "Slovenščina", tag: "sl" },
    { code: "EN", name: "English",     tag: "en" }
  ];

  function langHref(tag) {
    var table = T[tag];
    if (!table) { return null; }
    var page = null;
    for (var i = 0; i < table.nav.length; i++) {
      if (table.nav[i].slug === current) { page = table.nav[i].href; break; }
    }
    return siteRoot + table.prefix + (page || "index.html");
  }

  function langSwitch() {
    return '<nav class="p-lang" aria-label="' + t.langNav + '" data-el="polylang-switcher">' +
      LANGS.map(function (l) {
        var label =
          '<span aria-hidden="true">' + l.code + "</span>" +
          '<span class="p-sr-only" lang="' + l.tag + '">' + l.name + "</span>";
        if (l.tag === lang) {
          return '<span class="p-lang__item" aria-current="true">' + label + "</span>";
        }
        return '<a class="p-lang__item" hreflang="' + l.tag + '" href="' +
          langHref(l.tag) + '">' + label + "</a>";
      }).join("") +
      "</nav>";
  }

  var header =
    '<a class="p-skip" href="#main">' + t.skip + "</a>" +
    '<header class="p-header" data-el="xpro-theme-builder:header(template 36)">' +
      '<div class="p-container p-header__inner" data-el="container:header">' +
        '<a class="p-logo" href="' + url("index.html") + '">Pressence</a>' +
        '<button class="p-burger" type="button" aria-expanded="false" aria-controls="p-nav" aria-label="' +
          t.menu + '">' +
          '<svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">' +
            '<path d="M0 1h22M0 7h22M0 13h22" stroke="currentColor" stroke-width="1.2"/>' +
          "</svg>" +
        "</button>" +
        '<nav class="p-nav" id="p-nav" aria-label="' + t.mainNav + '" data-el="xpro-horizontal-menu">' +
          navLinks() +
        "</nav>" +
        langSwitch() +
      "</div>" +
    "</header>";

  /* Instagram and LinkedIn, as in the mockup. currentColor only - the checker
     forbids literal hex outside tokens.css. */
  var ICON_IG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">' +
      '<rect x="3" y="3" width="18" height="18" rx="5"/>' +
      '<circle cx="12" cy="12" r="4"/>' +
      '<circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/>' +
    "</svg>";
  var ICON_LI =
    '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">' +
      '<path d="M5.4 7.2H2.8V18h2.6V7.2ZM4.1 2.4a1.6 1.6 0 1 0 0 3.1 1.6 1.6 0 0 0 0-3.1ZM17.2 18h-2.6' +
      'v-5.3c0-1.3-.5-2.2-1.6-2.2-.9 0-1.4.6-1.6 1.2-.1.2-.1.5-.1.8V18H8.7s0-8.8 0-9.7h2.6v1.4a2.6 2.6 ' +
      '0 0 1 2.4-1.3c1.7 0 3.5 1.1 3.5 3.6V18Z"/>' +
    "</svg>";

  var SOCIAL = [
    { label: "Instagram", href: "https://www.instagram.com/", icon: ICON_IG },
    { label: "LinkedIn",  href: "https://www.linkedin.com/",  icon: ICON_LI }
  ];

  var footer =
    '<footer class="p-footer" data-el="xpro-theme-builder:footer(template 37)">' +
      '<div class="p-container p-footer__grid">' +
        '<div class="p-footer__brand">' +
          '<span class="p-footer__logo">Pressence</span>' +
          "<p>" + t.tagline + "</p>" +
        "</div>" +
        '<nav class="p-footer__nav" aria-label="' + t.footerNav + '">' + navLinks() + "</nav>" +
        '<div class="p-footer__social" data-el="social-icons">' +
          SOCIAL.map(function (s) {
            return '<a href="' + s.href + '" rel="noopener" target="_blank" aria-label="' +
              s.label + '">' + s.icon + "</a>";
          }).join("") +
        "</div>" +
        '<div class="p-footer__legal">' +
          "<p>© Pressence 2026</p>" +
          "<p>" + t.legal.map(function (l) {
            return '<a href="' + url(l.href) + '">' + l.label + "</a>";
          }).join(" · ") + "</p>" +
          '<p class="p-footer__disclaimer">' + t.disclaimer + "</p>" +
        "</div>" +
      "</div>" +
    "</footer>";

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer);
})();
