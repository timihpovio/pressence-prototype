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
          "<p>Prostor za jasnejši stik s sabo.</p>" +
        "</div>" +
        '<nav class="p-footer__nav" aria-label="Navigacija v nogi">' + navLinks() + "</nav>" +
        '<div class="p-footer__social" data-el="social-icons">' +
          SOCIAL.map(function (s) {
            return '<a href="' + s.href + '" rel="noopener" target="_blank" aria-label="' +
              s.label + '">' + s.icon + "</a>";
          }).join("") +
        "</div>" +
        '<div class="p-footer__legal">' +
          "<p>© Pressence 2026</p>" +
          "<p>" + LEGAL.map(function (l) {
            return '<a href="' + url(l.href) + '">' + l.label + "</a>";
          }).join(" · ") + "</p>" +
          '<p class="p-footer__disclaimer">Coaching ni nadomestilo za psihoterapijo, ' +
          "zdravstveno obravnavo ali drugo ustrezno strokovno pomoč.</p>" +
        "</div>" +
      "</div>" +
    "</footer>";

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer);
})();
