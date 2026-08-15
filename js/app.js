/* =========================================================
   MRCOLLECT — app.js
   General page behaviour for the marketing site.
   ========================================================= */
(function () {
  "use strict";

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Scroll-spy: highlight the current section in the nav
  var sections = Array.prototype.slice.call(document.querySelectorAll("section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a, .mobile-nav a"));

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute("id");
          navLinks.forEach(function (link) {
            var href = link.getAttribute("href") || "";
            link.classList.toggle("is-active", href === "#" + id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      observer.observe(s);
    });
  }

  // Header shadow on scroll
  var header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener(
      "scroll",
      function () {
        header.style.boxShadow = window.scrollY > 8 ? "0 8px 24px rgba(0,0,0,0.3)" : "none";
      },
      { passive: true }
    );
  }
})();
