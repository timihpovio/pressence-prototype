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
