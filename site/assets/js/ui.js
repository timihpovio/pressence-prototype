/* ui.js - mobile nav toggle, reveal-on-scroll, the Coaching section rail
   and the Zapisi category filter. */
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

  /* Section rail: mark the entry whose section is currently being read.

     The previous implementation observed the <h2> elements against a 264px
     band. A 50px heading sits in that band for about 2% of a 13,000px page,
     and the callback bailed out whenever nothing intersected - so the active
     row never moved off the first item. This tracks the sections instead:
     the active one is the last section whose top has passed the read line. */
  var rail = document.querySelector("[data-rail]");
  if (rail) {
    var list = rail.querySelector("[data-rail-list]") || rail;
    var marker = rail.querySelector("[data-rail-marker]");
    var rows = Array.prototype.slice.call(rail.querySelectorAll("a[href^='#']"))
      .map(function (a) {
        var target = document.getElementById(a.getAttribute("href").slice(1));
        if (!target) { return null; }
        return { a: a, section: target.closest("section") || target };
      })
      .filter(Boolean);

    if (rows.length) {
      var active = null;

      function readLine() {
        var raw = getComputedStyle(document.documentElement)
          .getPropertyValue("--p-anchor-offset");
        return (parseFloat(raw) || 96) + 8;
      }

      function pick() {
        var line = readLine();
        var found = rows[0];
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].section.getBoundingClientRect().top <= line) { found = rows[i]; }
        }
        /* At the foot of the page the final section wins however short it is,
           which the band-based version could never reach. */
        if (window.innerHeight + window.pageYOffset >=
            document.documentElement.scrollHeight - 2) {
          found = rows[rows.length - 1];
        }
        return found;
      }

      /* Vertical on the rail, hidden on the mobile strip - there an underline
         on the active chip does the same job in CSS. */
      function placeMarker() {
        if (!marker || !active || getComputedStyle(marker).display === "none") { return; }
        marker.style.height = active.a.offsetHeight + "px";
        marker.style.transform = "translateY(" + active.a.offsetTop + "px)";
      }

      /* On the mobile strip the active chip can sit off-screen. */
      function revealChip() {
        if (!active || list === rail) { return; }
        if (list.scrollWidth <= list.clientWidth + 1) { return; }
        var chip = active.a;
        var left = chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2;
        var max = list.scrollWidth - list.clientWidth;
        list.scrollTo({
          left: Math.max(0, Math.min(left, max)),
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto" : "smooth"
        });
      }

      function paint(next) {
        if (next === active) { return; }
        active = next;
        rows.forEach(function (row) {
          if (row === active) { row.a.setAttribute("aria-current", "location"); }
          else { row.a.removeAttribute("aria-current"); }
        });
        placeMarker();
        revealChip();
      }

      /* rAF aligns the update with paint, but it never fires in a background
         tab - and some embedded webviews report hidden while still on screen,
         which would freeze the rail outright. So fall back to running inline. */
      var queued = false;
      function onScroll() {
        if (queued) { return; }
        queued = true;
        var run = function () { queued = false; paint(pick()); };
        if (document.hidden) { run(); } else { requestAnimationFrame(run); }
      }

      /* Clicking answers immediately rather than waiting for the smooth
         scroll to carry the section past the read line. */
      rows.forEach(function (row) {
        row.a.addEventListener("click", function () { paint(row); });
      });

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", function () {
        placeMarker();
        onScroll();
      });

      paint(pick());
      placeMarker();
      /* Enable the marker's transition only after it has been put in place, so
         it does not slide in from zero height on load. setTimeout rather than
         rAF, so it still arms in a tab that is hidden at load. */
      setTimeout(function () { rail.classList.add("is-ready"); }, 0);
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
        card.hidden = want !== "all" && card.getAttribute("data-cat") !== want;
      });
    });
  }
})();
