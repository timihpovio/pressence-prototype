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
