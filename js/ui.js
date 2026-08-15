/* =========================================================
   MRCOLLECT — ui.js
   Mobile nav toggle + modal open/close/focus-trap
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  var navToggle = document.querySelector(".nav-toggle");
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      var isOpen = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.querySelectorAll(".mobile-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Modal ---------- */
  var lastFocusedEl = null;

  function openModal(modal) {
    if (!modal) return;
    lastFocusedEl = document.activeElement;
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";

    var firstField = modal.querySelector(
      'input:not([type="hidden"]):not(.hp-input), select, textarea'
    );
    if (firstField) {
      window.setTimeout(function () {
        firstField.focus();
      }, 60);
    }
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
      lastFocusedEl.focus();
    }
  }

  // Open triggers
  document.querySelectorAll("[data-open-modal]").forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      var targetId = trigger.getAttribute("data-open-modal");
      var modal = document.getElementById(targetId);
      openModal(modal);
    });
  });

  // Close triggers
  document.querySelectorAll("[data-close-modal]").forEach(function (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      var modal = trigger.closest(".modal-overlay");
      closeModal(modal);
    });
  });

  // Click outside modal content closes it
  document.querySelectorAll(".modal-overlay").forEach(function (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // Escape key closes open modal
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var openModalEl = document.querySelector(".modal-overlay.is-open");
    if (openModalEl) closeModal(openModalEl);
  });

  // Basic focus trap while a modal is open
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var openModalEl = document.querySelector(".modal-overlay.is-open");
    if (!openModalEl) return;

    var focusable = openModalEl.querySelectorAll(
      'button, a[href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  window.MRCOLLECT_UI = { openModal: openModal, closeModal: closeModal };
})();
