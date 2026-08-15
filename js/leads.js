/* =========================================================
   MRCOLLECT — leads.js
   Portfolio-demo lead storage ONLY.

   IMPORTANT: This is NOT how real demo requests are captured.
   Real prospects submit the "request-demo" Netlify Form, which
   Netlify stores and emails independently of this browser storage.
   This module exists purely so the Admin Dashboard has something
   to display while this project is a portfolio piece with no
   backend/database.
   ========================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "mrcollect_demo_leads";

  function getAll() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn("MRCOLLECT demo leads: could not read localStorage", err);
      return [];
    }
  }

  function save(lead) {
    try {
      var leads = getAll();
      leads.unshift(lead);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (err) {
      console.warn("MRCOLLECT demo leads: could not write localStorage", err);
    }
  }

  function clearAll() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("MRCOLLECT demo leads: could not clear localStorage", err);
    }
  }

  window.MRCOLLECT_LEADS = { getAll: getAll, save: save, clearAll: clearAll };

  /* ---------------------------------------------------------
     Admin dashboard renderer (used by admin.html / auth.js)
     --------------------------------------------------------- */
  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      }) + " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    } catch (err) {
      return iso || "";
    }
  }

  function render() {
    var leads = getAll();
    var tbody = document.getElementById("demo-leads-body");
    var emptyState = document.getElementById("demo-leads-empty");
    var countEl = document.getElementById("stat-total-leads");
    var todayCountEl = document.getElementById("stat-today-leads");

    if (countEl) countEl.textContent = String(leads.length);

    if (todayCountEl) {
      var today = new Date().toDateString();
      var todayCount = leads.filter(function (l) {
        return l.submitted_at && new Date(l.submitted_at).toDateString() === today;
      }).length;
      todayCountEl.textContent = String(todayCount);
    }

    if (!tbody) return;

    if (!leads.length) {
      tbody.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    tbody.innerHTML = leads
      .map(function (lead) {
        return (
          "<tr>" +
          '<td class="lead-name">' + escapeHtml(lead.company_name) + "</td>" +
          "<td>" + escapeHtml(lead.contact_person) + "</td>" +
          "<td>" + escapeHtml(lead.email) + "</td>" +
          "<td>" + escapeHtml(lead.phone) + "</td>" +
          "<td>" + escapeHtml(lead.company_type) + "</td>" +
          "<td>" + escapeHtml(lead.interest) + "</td>" +
          "<td>" + formatDate(lead.submitted_at) + "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  window.MRCOLLECT_ADMIN_DASHBOARD = { render: render };
})();
