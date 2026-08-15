/* =========================================================
   MRCOLLECT — fieldman-map.js
   Leaflet + OpenStreetMap field-force map, collector list,
   detail side panel, route rendering, and the audit/location
   history tables driven by js/fieldman-data.js.

   FUTURE PRODUCTION ARCHITECTURE (see README):
   Collector Mobile Device → GPS → Secure API → Supabase/PostGIS
   → MRCOLLECT Dashboard. This file only renders DEMO DATA and
   does not implement real geolocation tracking.
   ========================================================= */
(function () {
  "use strict";

  var DATA = window.MRCOLLECT_FIELD_DATA;
  if (!DATA) return;

  var map = null;
  var markers = {};
  var routeLayerGroup = null;
  var mapEl = document.getElementById("fieldman-map");
  var fallbackEl = document.getElementById("map-fallback");

  function peso(n) {
    if (n === null || n === undefined) return "—";
    return "₱" + n.toLocaleString("en-PH");
  }

  /* ---------------------------------------------------------
     Map init (with graceful fallback if Leaflet/tiles fail)
     --------------------------------------------------------- */
  function initMap() {
    if (typeof L === "undefined" || !mapEl) {
      showFallback();
      return;
    }

    try {
      map = L.map(mapEl, { zoomControl: true }).setView([14.6091, 121.0223], 11);

      var tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });

      var tileFailed = false;
      tileLayer.on("tileerror", function () {
        if (tileFailed) return;
        tileFailed = true;
        showFallback();
      });

      tileLayer.addTo(map);
      routeLayerGroup = L.layerGroup().addTo(map);

      DATA.COLLECTORS.forEach(function (collector) {
        addMarker(collector);
      });
    } catch (err) {
      console.warn("MRCOLLECT map init failed, showing fallback:", err);
      showFallback();
    }
  }

  function showFallback() {
    if (mapEl) mapEl.style.display = "none";
    if (fallbackEl) fallbackEl.classList.add("is-visible");
  }

  function addMarker(collector) {
    var meta = DATA.STATUS_META[collector.status];
    var marker = L.circleMarker([collector.lat, collector.lng], {
      radius: 9,
      color: "#0a0f1e",
      weight: 2,
      fillColor: meta.color,
      fillOpacity: 0.95
    }).addTo(map);

    marker.bindPopup(buildPopupHtml(collector), { closeButton: true, className: "" });
    marker.on("popupopen", function () {
      var btn = document.getElementById("popup-view-activity-" + collector.id);
      if (btn) {
        btn.addEventListener("click", function () {
          openDetailPanel(collector.id);
        });
      }
    });

    markers[collector.id] = marker;
  }

  function buildPopupHtml(collector) {
    var meta = DATA.STATUS_META[collector.status];
    return (
      '<div class="map-popup">' +
      '<div class="mp-name">' + collector.name + "</div>" +
      '<span class="mp-status" style="background:' + meta.color + "22;color:" + meta.color + ';">' + meta.label.toUpperCase() + "</span>" +
      '<div class="mp-row"><span>Collector ID</span><span>' + collector.collectorId + "</span></div>" +
      '<div class="mp-row"><span>Current Activity</span><span>' + meta.label + "</span></div>" +
      '<div class="mp-row"><span>Last Updated</span><span>' + collector.lastUpdate + "</span></div>" +
      '<div class="mp-row"><span>Last Location</span><span>' + collector.currentLocation + "</span></div>" +
      '<div class="mp-row"><span>Assigned Accounts</span><span>' + collector.assignedAccounts + "</span></div>" +
      '<div class="mp-row"><span>Activities Today</span><span>' + collector.activitiesToday + "</span></div>" +
      '<div class="mp-row"><span>Amount Collected Today</span><span>' + peso(collector.amountCollected) + "</span></div>" +
      '<button id="popup-view-activity-' + collector.id + '">View Activity</button>' +
      "</div>"
    );
  }

  /* ---------------------------------------------------------
     Collector list (right column)
     --------------------------------------------------------- */
  function renderCollectorList() {
    var listEl = document.getElementById("collector-list");
    if (!listEl) return;
    listEl.innerHTML = DATA.COLLECTORS.map(function (c) {
      var meta = DATA.STATUS_META[c.status];
      return (
        '<div class="collector-item" data-collector-id="' + c.id + '">' +
        '<span class="status-dot" style="background:' + meta.color + '"></span>' +
        "<div>" +
        '<div class="ci-name">' + c.name + "</div>" +
        '<div class="ci-meta">' + c.area + " · " + meta.label + "</div>" +
        "</div>" +
        '<span class="ci-updated">' + c.lastUpdate + "</span>" +
        "</div>"
      );
    }).join("");

    listEl.querySelectorAll(".collector-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var id = item.getAttribute("data-collector-id");
        listEl.querySelectorAll(".collector-item").forEach(function (el) {
          el.classList.remove("is-selected");
        });
        item.classList.add("is-selected");

        var collector = DATA.COLLECTORS.filter(function (c) { return c.id === id; })[0];
        if (collector && map) {
          map.setView([collector.lat, collector.lng], 13, { animate: true });
          markers[id].openPopup();
        }
        openDetailPanel(id);
      });
    });
  }

  /* ---------------------------------------------------------
     Detail side panel (View Activity)
     --------------------------------------------------------- */
  function openDetailPanel(collectorId) {
    var collector = DATA.COLLECTORS.filter(function (c) { return c.id === collectorId; })[0];
    if (!collector) return;
    var meta = DATA.STATUS_META[collector.status];

    document.getElementById("dp-name").textContent = collector.name;
    document.getElementById("dp-sub").textContent = "Field Collector";
    var dot = document.getElementById("dp-status-dot");
    dot.className = "legend-dot " + meta.dot;
    document.getElementById("dp-status-text").textContent = meta.label;

    var grid = document.getElementById("dp-grid");
    var items = [
      ["Collector ID", collector.collectorId],
      ["Area", collector.area],
      ["Current Location", collector.currentLocation],
      ["Last Update", collector.lastUpdate],
      ["Assigned Accounts", String(collector.assignedAccounts)],
      ["Completed Activities", String(collector.activitiesToday)],
      ["Amount Collected", peso(collector.amountCollected)],
      ["Working Hours", collector.workingHours]
    ];
    grid.innerHTML = items.map(function (pair) {
      return (
        '<div class="detail-item"><div class="detail-label">' + pair[0] + '</div><div class="detail-value">' + pair[1] + "</div></div>"
      );
    }).join("");

    var routeEl = document.getElementById("dp-route");
    routeEl.innerHTML = collector.route.map(function (step) {
      var activityLine = step.activity + (step.account ? " · " + step.account : "") + (step.amount ? " · " + peso(step.amount) : "");
      return (
        '<div class="route-step' + (step.isStart ? " is-start" : "") + '" data-step="' + step.n + '">' +
        '<span class="route-num">' + step.n + "</span>" +
        '<div class="route-time">' + step.time + "</div>" +
        '<div class="route-loc">' + step.location + "</div>" +
        '<div class="route-activity">' + activityLine + "</div>" +
        "</div>"
      );
    }).join("");

    drawRoute(collector);

    document.getElementById("detail-overlay").classList.add("is-open");
  }

  function closeDetailPanel() {
    document.getElementById("detail-overlay").classList.remove("is-open");
  }

  function drawRoute(collector) {
    if (!map || !routeLayerGroup) return;
    routeLayerGroup.clearLayers();

    var latlngs = collector.route.map(function (s) { return [s.lat, s.lng]; });
    L.polyline(latlngs, { color: "#16e0a0", weight: 3, opacity: 0.85, dashArray: "6 6" }).addTo(routeLayerGroup);

    collector.route.forEach(function (step) {
      L.circleMarker([step.lat, step.lng], {
        radius: 7,
        color: "#0a0f1e",
        weight: 2,
        fillColor: step.isStart ? "#16e0a0" : "#0a0f1e",
        fillOpacity: 1
      })
        .bindTooltip(String(step.n), { permanent: true, direction: "center", className: "route-marker-label" })
        .addTo(routeLayerGroup);
    });

    map.fitBounds(latlngs, { padding: [40, 40] });
  }

  /* ---------------------------------------------------------
     Field Activity Audit table (Juan Dela Cruz, featured)
     --------------------------------------------------------- */
  function renderAuditTable() {
    var body = document.getElementById("audit-table-body");
    if (!body) return;
    var featured = DATA.COLLECTORS[0]; // Juan Dela Cruz
    var rows = featured.route.filter(function (s) { return !s.isStart; });

    body.innerHTML = rows.map(function (s) {
      var statusClass = s.status === "Paid" ? "chip-paid" : s.status === "Recorded" ? "chip-recorded" : "chip-completed";
      return (
        "<tr>" +
        "<td>" + s.time + "</td>" +
        '<td class="cell-name">' + featured.name + "</td>" +
        "<td>" + s.location + "</td>" +
        "<td>" + s.activity + "</td>" +
        "<td>" + (s.account || "—") + "</td>" +
        '<td class="cell-amount">' + peso(s.amount) + "</td>" +
        '<td><span class="status-chip ' + statusClass + '">' + s.status + "</span></td>" +
        "</tr>"
      );
    }).join("");
  }

  /* ---------------------------------------------------------
     Location History table
     --------------------------------------------------------- */
  function renderLocationHistory() {
    var body = document.getElementById("location-history-body");
    if (!body) return;
    var featured = DATA.COLLECTORS[0];

    body.innerHTML = featured.route.map(function (s) {
      var activity = s.isStart ? "Session Start" : s.activity;
      var statusClass = s.status === "Paid" ? "chip-paid" : s.status === "Recorded" ? "chip-recorded" : "chip-completed";
      return (
        "<tr>" +
        "<td>08/14/2026 " + s.time + "</td>" +
        '<td class="cell-name">' + featured.name + "</td>" +
        "<td>" + s.lat.toFixed(4) + "</td>" +
        "<td>" + s.lng.toFixed(4) + "</td>" +
        "<td>" + s.area + "</td>" +
        "<td>" + activity + "</td>" +
        '<td><span class="status-chip ' + statusClass + '">' + s.status + "</span></td>" +
        "</tr>"
      );
    }).join("");
  }

  /* ---------------------------------------------------------
     Audit trail feed
     --------------------------------------------------------- */
  function renderAuditTrail() {
    var feed = document.getElementById("audit-trail-feed");
    if (!feed) return;
    feed.innerHTML = DATA.AUDIT_TRAIL.map(function (entry) {
      return (
        '<div class="trail-item">' +
        '<div class="trail-time">' + entry.time + "</div>" +
        '<div class="trail-text">' + entry.text + "</div>" +
        "</div>"
      );
    }).join("");
  }

  /* ---------------------------------------------------------
     Buttons
     --------------------------------------------------------- */
  function wireButtons() {
    var refreshBtn = document.getElementById("refresh-location-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", function () {
        refreshBtn.disabled = true;
        var original = refreshBtn.textContent;
        refreshBtn.textContent = "Refreshing…";
        window.setTimeout(function () {
          refreshBtn.textContent = original;
          refreshBtn.disabled = false;
        }, 700);
      });
    }

    var exportBtn = document.getElementById("export-activity-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        window.alert(
          "This is a portfolio demo — export isn't wired to a real file yet. " +
            "In production this would export the Field Activity Audit as CSV/PDF."
        );
      });
    }

    var closeBtn = document.getElementById("detail-close-btn");
    if (closeBtn) closeBtn.addEventListener("click", closeDetailPanel);

    var overlay = document.getElementById("detail-overlay");
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeDetailPanel();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDetailPanel();
    });
  }

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  initMap();
  renderCollectorList();
  renderAuditTable();
  renderLocationHistory();
  renderAuditTrail();
  wireButtons();
})();
