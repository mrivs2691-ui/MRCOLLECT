/* =========================================================
   MRCOLLECT — dashboard.js
   Shared behaviour for dashboard.html, fieldman-location.html,
   and field-activity.html: mobile sidebar toggle, footer year.
   ========================================================= */
(function () {
  "use strict";

  var toggle = document.getElementById("sidebar-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("sidebar-open");
    });
  }

  // Close mobile sidebar when a nav link is tapped
  document.querySelectorAll(".dash-nav a").forEach(function (link) {
    link.addEventListener("click", function () {
      document.body.classList.remove("sidebar-open");
    });
  });

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
