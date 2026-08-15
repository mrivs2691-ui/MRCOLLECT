/* =========================================================
   MRCOLLECT — auth.js
   Demo authentication only. Replace with Supabase Auth before
   production use.

   This module is intentionally structured so the demo check in
   attemptLogin() is the ONLY place that needs to change to swap
   in a real auth provider: call Supabase Auth (or another
   provider) there, await its result, and keep the same
   setSession()/redirect flow.
   ========================================================= */
(function () {
  "use strict";

  var SESSION_KEY = "mrcollect_session";

  function setSession(remember, profile) {
    var payload = JSON.stringify({
      authenticated: true,
      profile: profile,
      issuedAt: new Date().toISOString()
    });
    try {
      if (remember) {
        window.localStorage.setItem(SESSION_KEY, payload);
      } else {
        window.sessionStorage.setItem(SESSION_KEY, payload);
      }
    } catch (err) {
      console.warn("MRCOLLECT auth: could not persist session", err);
    }
  }

  function getSession() {
    try {
      var raw =
        window.sessionStorage.getItem(SESSION_KEY) ||
        window.localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function clearSession() {
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
      window.localStorage.removeItem(SESSION_KEY);
    } catch (err) {
      console.warn("MRCOLLECT auth: could not clear session", err);
    }
  }

  function isAuthenticated() {
    var session = getSession();
    return !!(session && session.authenticated);
  }

  /**
   * DEMO AUTHENTICATION ONLY.
   * Replace with Supabase Auth before production use:
   *   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
   * Any non-empty email + password combination succeeds here so the
   * demo can be explored without shipping real credentials in the code.
   */
  function attemptLogin(email, password) {
    var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!validEmail || !password) {
      return { ok: false, message: "Enter a valid email and password." };
    }
    return {
      ok: true,
      profile: {
        name: "John Dela Cruz",
        role: "Collection Manager",
        email: email.trim()
      }
    };
  }

  /* ---------------------------------------------------------
     login.html wiring
     --------------------------------------------------------- */
  var loginForm = document.getElementById("login-form");
  if (loginForm) {
    // If already logged in, skip straight to the dashboard.
    if (isAuthenticated()) {
      window.location.href = "dashboard.html";
    }

    var errorBox = document.getElementById("login-error");

    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = loginForm.elements["email"].value;
      var password = loginForm.elements["password"].value;
      var remember = loginForm.elements["remember"].checked;

      var result = attemptLogin(email, password);

      if (result.ok) {
        if (errorBox) errorBox.classList.remove("is-visible");
        setSession(remember, result.profile);
        window.location.href = "dashboard.html";
      } else if (errorBox) {
        errorBox.textContent = result.message;
        errorBox.classList.add("is-visible");
      }
    });

    var forgotLink = document.getElementById("forgot-password-link");
    if (forgotLink) {
      forgotLink.addEventListener("click", function (e) {
        e.preventDefault();
        window.alert(
          "This is a portfolio demo — password reset isn't wired up yet. " +
            "In production this would email a reset link via your auth provider."
        );
      });
    }
  }

  /* ---------------------------------------------------------
     Auth guard for dashboard pages (dashboard.html,
     fieldman-location.html, field-activity.html)
     --------------------------------------------------------- */
  var guardedShell = document.querySelector("[data-requires-auth]");
  if (guardedShell) {
    if (!isAuthenticated()) {
      window.location.href = "login.html";
    } else {
      var session = getSession();
      document.querySelectorAll("[data-user-name]").forEach(function (el) {
        el.textContent = session.profile.name;
      });
      document.querySelectorAll("[data-user-role]").forEach(function (el) {
        el.textContent = session.profile.role;
      });
      document.querySelectorAll("[data-user-initials]").forEach(function (el) {
        var parts = session.profile.name.split(" ");
        el.textContent = (parts[0][0] || "") + (parts[1] ? parts[1][0] : "");
      });
    }
  }

  document.querySelectorAll("[data-logout]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      clearSession();
      window.location.href = "login.html";
    });
  });

  window.MRCOLLECT_AUTH = {
    isAuthenticated: isAuthenticated,
    getSession: getSession,
    clearSession: clearSession
  };
})();
