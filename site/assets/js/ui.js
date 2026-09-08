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

  /* Reveal on scroll. Elements are visible by default; only the .js class,
     set inline in <head>, hides them, so a script failure cannot blank the
     page. Each element is unobserved once shown - this never reverses. */
  var revealed = document.querySelectorAll(".p-reveal, .p-reveal-group");
  if (revealed.length) {
    if (!("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      Array.prototype.forEach.call(revealed, function (el) { el.classList.add("is-in"); });
    } else {
      var showAll = function () {
        Array.prototype.forEach.call(revealed, function (el) { el.classList.add("is-in"); });
      };
      var reveal = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
      Array.prototype.forEach.call(revealed, function (el) { reveal.observe(el); });

      /* The negative bottom margin leaves a band at the foot of the viewport
         that never satisfies the observer. Anything still hidden once the page
         is scrolled out - or that was never scrollable - is shown outright, so
         no content can end up permanently invisible. */
      var atBottom = function () {
        return window.innerHeight + window.pageYOffset >=
               document.documentElement.scrollHeight - 4;
      };
      if (document.documentElement.scrollHeight <= window.innerHeight + 4) {
        showAll();
      } else {
        window.addEventListener("scroll", function onScroll() {
          if (!atBottom()) { return; }
          showAll();
          window.removeEventListener("scroll", onScroll);
        }, { passive: true });
      }
    }
  }

  /* Section rail: mark the entry whose section is currently in view. */
  var rail = document.querySelector("[data-rail]");
  if (rail && "IntersectionObserver" in window) {
    var links = Array.prototype.slice.call(rail.querySelectorAll("a[href^='#']"));
    var targets = links
      .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
      .filter(Boolean);

    if (targets.length) {
      var visible = [];
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var i = visible.indexOf(entry.target);
          if (entry.isIntersecting && i === -1) { visible.push(entry.target); }
          if (!entry.isIntersecting && i !== -1) { visible.splice(i, 1); }
        });
        if (!visible.length) { return; }
        var top = visible.slice().sort(function (a, b) {
          return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
        })[0];
        links.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + top.id;
          if (on) { a.setAttribute("aria-current", "true"); }
          else { a.removeAttribute("aria-current"); }
        });
      }, { rootMargin: "-96px 0px -55% 0px" });
      targets.forEach(function (t) { spy.observe(t); });
    }
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
