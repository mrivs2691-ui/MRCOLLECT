/* =========================================================
   MRCOLLECT — field-activity.js
   Field Activity Log table + Activity Details modal.
   DEMO DATA ONLY — built from js/fieldman-data.js route records
   plus a few extra demo fields (payment method, remarks).
   ========================================================= */
(function () {
  "use strict";

  var FIELD_DATA = window.MRCOLLECT_FIELD_DATA;
  if (!FIELD_DATA) return;

  function peso(n) {
    if (n === null || n === undefined) return "—";
    return "₱" + n.toLocaleString("en-PH");
  }

  var EXTRA = {
    "LN-001245": { payment: null, method: "—", remarks: "Borrower not home; left notice.", lat: 14.6790, lng: 121.0410 },
    "LN-001246": { payment: 5000, method: "Cash", remarks: "Borrower confirmed payment.", lat: 14.6508, lng: 121.0328 },
    "LN-001247": { payment: 3250, method: "GCash", remarks: "Partial payment recorded pending confirmation.", lat: 14.7210, lng: 121.0610 },
    "LN-001248": { payment: null, method: "—", remarks: "Borrower requested follow-up next week.", lat: 14.6690, lng: 121.0480 },
    "LN-002031": { payment: null, method: "—", remarks: "Account details verified.", lat: 14.5547, lng: 121.0244 },
    "LN-003140": { payment: 7200, method: "Cash", remarks: "Full collection completed on site.", lat: 14.5995, lng: 120.9842 },
    "LN-004410": { payment: null, method: "—", remarks: "Borrower unavailable, rescheduled.", lat: 14.5764, lng: 121.0851 },
    "LN-005522": { payment: null, method: "—", remarks: "Visit logged; account under review.", lat: 14.4445, lng: 120.9938 }
  };

  // Build the flat activity log from every collector's non-start route steps
  var ACTIVITY_LOG = [];
  FIELD_DATA.COLLECTORS.forEach(function (collector) {
    collector.route
      .filter(function (s) { return !s.isStart; })
      .forEach(function (s) {
        var extra = EXTRA[s.account] || { payment: s.amount, method: "—", remarks: "—", lat: s.lat, lng: s.lng };
        ACTIVITY_LOG.push({
          collector: collector.name,
          date: "August 14, 2026",
          time: s.time,
          location: s.location + ", " + s.area,
          area: s.area.indexOf("(") > -1 ? s.area.split(" ")[0] : s.area,
          activity: s.activity === "Collection" ? "Collection" : s.activity === "Payment Recording" ? "Payment Recording" : s.activity === "Account Visit" ? "Account Visit" : "Follow-up",
          account: s.account || "—",
          payment: extra.payment,
          method: extra.method,
          remarks: extra.remarks,
          status: s.status,
          lat: extra.lat,
          lng: extra.lng
        });
      });
  });

  function statusChipClass(status) {
    if (status === "Paid") return "chip-paid";
    if (status === "Recorded") return "chip-recorded";
    return "chip-completed";
  }

  function renderTable(rows) {
    var body = document.getElementById("fa-table-body");
    if (!body) return;
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="9" style="text-align:center; color:var(--ink-3); padding:24px;">No activities match these filters.</td></tr>';
      return;
    }
    body.innerHTML = rows
      .map(function (row, i) {
        return (
          '<tr data-row-index="' + i + '">' +
          '<td class="cell-name">' + row.collector + "</td>" +
          "<td>" + row.date + "</td>" +
          "<td>" + row.time + "</td>" +
          "<td>" + row.location + "</td>" +
          "<td>" + row.activity + "</td>" +
          "<td>" + row.account + "</td>" +
          '<td class="cell-amount">' + peso(row.payment) + "</td>" +
          "<td>" + row.remarks + "</td>" +
          '<td><span class="status-chip ' + statusChipClass(row.status) + '">' + row.status + "</span></td>" +
          "</tr>"
        );
      })
      .join("");

    body.querySelectorAll("tr[data-row-index]").forEach(function (tr) {
      tr.addEventListener("click", function () {
        var idx = parseInt(tr.getAttribute("data-row-index"), 10);
        openActivityModal(rows[idx]);
      });
    });
  }

  function openActivityModal(row) {
    var rowsEl = document.getElementById("activity-detail-rows");
    var pairs = [
      ["Collector", row.collector],
      ["Date", row.date],
      ["Time", row.time],
      ["Location", row.location],
      ["Account", row.account],
      ["Activity", row.activity],
      ["Amount", peso(row.payment)],
      ["Payment Method", row.method],
      ["Remarks", row.remarks],
      ["Location Coordinates", row.lat.toFixed(4) + ", " + row.lng.toFixed(4)],
      ["Status", row.status]
    ];
    rowsEl.innerHTML = pairs
      .map(function (p) {
        return '<div class="detail-row"><span>' + p[0] + "</span><span>" + p[1] + "</span></div>";
      })
      .join("");
    document.getElementById("activity-modal-overlay").classList.add("is-open");
  }

  function closeActivityModal() {
    document.getElementById("activity-modal-overlay").classList.remove("is-open");
  }

  function applyFilters() {
    var collector = document.getElementById("fa-filter-collector").value;
    var area = document.getElementById("fa-filter-area").value;
    var activity = document.getElementById("fa-filter-activity").value;
    var status = document.getElementById("fa-filter-status").value;

    var filtered = ACTIVITY_LOG.filter(function (row) {
      if (collector && row.collector !== collector) return false;
      if (area && row.area.indexOf(area) === -1) return false;
      if (activity && row.activity !== activity) return false;
      if (status && row.status !== status) return false;
      return true;
    });

    renderTable(filtered);
  }

  function wireFilters() {
    ["fa-filter-collector", "fa-filter-area", "fa-filter-activity", "fa-filter-status"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("change", applyFilters);
    });
    var resetBtn = document.getElementById("fa-reset-filters");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        ["fa-filter-collector", "fa-filter-area", "fa-filter-activity", "fa-filter-status"].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.value = "";
        });
        renderTable(ACTIVITY_LOG);
      });
    }

    var closeBtn = document.getElementById("activity-modal-close");
    if (closeBtn) closeBtn.addEventListener("click", closeActivityModal);
    var overlay = document.getElementById("activity-modal-overlay");
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeActivityModal();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeActivityModal();
    });
  }

  renderTable(ACTIVITY_LOG);
  wireFilters();
})();
