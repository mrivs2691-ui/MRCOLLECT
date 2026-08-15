/* =========================================================
   MRCOLLECT — form.js
   Validates and submits the Request a Demo form to Formspree via AJAX,
   showing an in-page success/error state instead of a full-page reload
   or redirect to Formspree's own hosted thank-you page.
   ========================================================= */
(function () {
  "use strict";

  var form = document.getElementById("request-demo-form");
  if (!form) return;

  var submitBtn = form.querySelector('[type="submit"]');
  var statusEl = form.querySelector(".form-status");
  var modalBody = document.querySelector("#request-demo-modal .modal-body");
  var successTemplate = document.getElementById("demo-success-template");

  var PH_PHONE_RE = /^(\+63|0)9\d{2}[\s-]?\d{3}[\s-]?\d{4}$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var validators = {
    company_name: function (v) {
      return v.trim().length >= 2 ? "" : "Enter the company name.";
    },
    contact_person: function (v) {
      return v.trim().length >= 2 ? "" : "Enter a contact person.";
    },
    email: function (v) {
      return EMAIL_RE.test(v.trim()) ? "" : "Enter a valid email address.";
    },
    phone: function (v) {
      var clean = v.trim();
      if (!clean) return "Enter a phone number.";
      return PH_PHONE_RE.test(clean)
        ? ""
        : "Enter a valid PH mobile number, e.g. +63 924 119 7391.";
    },
    company_type: function (v) {
      return v ? "" : "Select a company type.";
    },
    interest: function (v) {
      return v ? "" : "Select what you're interested in.";
    }
  };

  function fieldWrap(input) {
    return input.closest(".form-field");
  }

  function showFieldError(input, message) {
    var wrap = fieldWrap(input);
    if (!wrap) return;
    var errEl = wrap.querySelector(".field-error");
    wrap.classList.toggle("has-error", !!message);
    if (errEl) errEl.textContent = message || "";
  }

  function validateField(input) {
    var validate = validators[input.name];
    if (!validate) return true;
    var message = validate(input.value);
    showFieldError(input, message);
    return !message;
  }

  // Live validation on blur
  Object.keys(validators).forEach(function (name) {
    var input = form.elements[name];
    if (!input) return;
    input.addEventListener("blur", function () {
      validateField(input);
    });
    input.addEventListener("input", function () {
      var wrap = fieldWrap(input);
      if (wrap && wrap.classList.contains("has-error")) validateField(input);
    });
  });

  function validateAll() {
    var valid = true;
    Object.keys(validators).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      if (!validateField(input)) valid = false;
    });
    return valid;
  }

  function setStatus(message, state) {
    if (!statusEl) return;
    statusEl.innerHTML = "";
    if (!message) {
      statusEl.classList.remove("is-visible", "is-error");
      return;
    }
    statusEl.classList.add("is-visible");
    statusEl.classList.toggle("is-error", state === "error");
    if (state === "loading") {
      var spinner = document.createElement("span");
      spinner.className = "spinner";
      statusEl.appendChild(spinner);
    }
    var text = document.createElement("span");
    text.textContent = message;
    statusEl.appendChild(text);
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Sending…" : "Request a Demo";
  }

  function renderSuccess() {
    if (!modalBody || !successTemplate) return;
    modalBody.innerHTML = "";
    modalBody.appendChild(successTemplate.content.cloneNode(true));
    var closeBtn = modalBody.querySelector("[data-close-modal]");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        var overlay = closeBtn.closest(".modal-overlay");
        if (overlay && window.MRCOLLECT_UI) window.MRCOLLECT_UI.closeModal(overlay);
      });
      closeBtn.focus();
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Honeypot check (extra client-side guard; Formspree also checks server-side)
    var honeypot = form.querySelector('input[name="_gotcha"]');
    if (honeypot && honeypot.value) {
      // Silently "succeed" for bots without submitting anywhere.
      renderSuccess();
      return;
    }

    if (!validateAll()) {
      setStatus("Please fix the highlighted fields.", "error");
      return;
    }

    setLoading(true);
    setStatus("Sending your request…", "loading");

    var formData = new FormData(form);

    // Formspree: POST the FormData directly to the form's action URL.
    // The Accept: application/json header tells Formspree to respond with
    // JSON instead of redirecting to its own hosted thank-you page, so we
    // can show our own in-modal success state.
    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        if (response.ok) {
          setStatus("", null);
          renderSuccess();

          // Also store a local copy for the portfolio demo leads view (NOT
          // the source of truth — Formspree is). See leads.js.
          if (window.MRCOLLECT_LEADS && typeof window.MRCOLLECT_LEADS.save === "function") {
            window.MRCOLLECT_LEADS.save({
              company_name: formData.get("company_name"),
              contact_person: formData.get("contact_person"),
              email: formData.get("email"),
              phone: formData.get("phone"),
              company_type: formData.get("company_type"),
              interest: formData.get("interest"),
              message: formData.get("message"),
              submitted_at: new Date().toISOString()
            });
          }

          form.reset();
          return;
        }

        return response.json().then(function (data) {
          var message =
            data && data.errors
              ? data.errors.map(function (e) { return e.message; }).join(", ")
              : "Network response was not ok (" + response.status + ")";
          throw new Error(message);
        });
      })
      .catch(function (err) {
        setStatus(
          "Something went wrong sending your request. Please try again, or email " +
            "mrivo2691@gmail.com directly.",
          "error"
        );
        console.error("Request Demo submission failed:", err);
      })
      .finally(function () {
        setLoading(false);
      });
  });
})();
