/* =========================================================
   MRCOLLECT — fieldman-data.js
   DEMO DATA ONLY. Fictional collectors, areas, and coordinates —
   not real people or real location data. This is the single
   source of truth consumed by fieldman-map.js.
   ========================================================= */
(function () {
  "use strict";

  var STATUS_META = {
    active: { label: "Active", color: "#16e0a0", dot: "dot-active" },
    onfield: { label: "On Field", color: "#4d9eff", dot: "dot-onfield" },
    collection: { label: "Collection Activity", color: "#f2ab3d", dot: "dot-collection" },
    offline: { label: "Offline", color: "#6c778f", dot: "dot-offline" },
    attention: { label: "Attention", color: "#ff6b6b", dot: "dot-attention" }
  };

  var COLLECTORS = [
    {
      id: "juan-dela-cruz",
      name: "Juan Dela Cruz",
      collectorId: "COL-0012",
      status: "active",
      area: "Quezon City",
      currentLocation: "Quezon City",
      lastUpdate: "10:42 AM",
      lat: 14.6690,
      lng: 121.0480,
      assignedAccounts: 84,
      activitiesToday: 17,
      amountCollected: 42500,
      workingHours: "8:12 AM – Present",
      route: [
        { n: 1, time: "08:12 AM", location: "Office / Starting Point", area: "Quezon City", activity: "Field session started", account: null, amount: null, status: "Completed", lat: 14.6760, lng: 121.0437, isStart: true },
        { n: 2, time: "08:37 AM", location: "Quezon City", area: "Quezon City", activity: "Account Visit", account: "LN-001245", amount: null, status: "Completed", lat: 14.6790, lng: 121.0410 },
        { n: 3, time: "09:14 AM", location: "Novaliches", area: "Quezon City", activity: "Collection", account: "LN-001246", amount: 5000, status: "Paid", lat: 14.6508, lng: 121.0328 },
        { n: 4, time: "09:58 AM", location: "Fairview", area: "Quezon City", activity: "Payment Recording", account: "LN-001247", amount: 3250, status: "Recorded", lat: 14.7210, lng: 121.0610 },
        { n: 5, time: "10:42 AM", location: "Quezon City", area: "Quezon City", activity: "Account Follow-up", account: "LN-001248", amount: null, status: "Completed", lat: 14.6690, lng: 121.0480 }
      ]
    },
    {
      id: "maria-garcia",
      name: "Maria Garcia",
      collectorId: "COL-0015",
      status: "onfield",
      area: "Makati",
      currentLocation: "Makati",
      lastUpdate: "Just now",
      lat: 14.5547,
      lng: 121.0244,
      assignedAccounts: 61,
      activitiesToday: 9,
      amountCollected: 15800,
      workingHours: "8:05 AM – Present",
      route: [
        { n: 1, time: "08:05 AM", location: "Office / Starting Point", area: "Makati", activity: "Field session started", account: null, amount: null, status: "Completed", lat: 14.5600, lng: 121.0300, isStart: true },
        { n: 2, time: "09:20 AM", location: "Makati", area: "Makati", activity: "Account Visit", account: "LN-002031", amount: null, status: "Completed", lat: 14.5547, lng: 121.0244 }
      ]
    },
    {
      id: "pedro-santos",
      name: "Pedro Santos",
      collectorId: "COL-0021",
      status: "collection",
      area: "Manila",
      currentLocation: "Manila",
      lastUpdate: "5 min ago",
      lat: 14.5995,
      lng: 120.9842,
      assignedAccounts: 73,
      activitiesToday: 12,
      amountCollected: 28900,
      workingHours: "7:50 AM – Present",
      route: [
        { n: 1, time: "07:50 AM", location: "Office / Starting Point", area: "Manila", activity: "Field session started", account: null, amount: null, status: "Completed", lat: 14.6050, lng: 120.9820, isStart: true },
        { n: 2, time: "10:05 AM", location: "Manila", area: "Manila", activity: "Collection", account: "LN-003140", amount: 7200, status: "Paid", lat: 14.5995, lng: 120.9842 }
      ]
    },
    {
      id: "ana-reyes",
      name: "Ana Reyes",
      collectorId: "COL-0027",
      status: "offline",
      area: "Pasig",
      currentLocation: "Pasig",
      lastUpdate: "25 min ago",
      lat: 14.5764,
      lng: 121.0851,
      assignedAccounts: 55,
      activitiesToday: 4,
      amountCollected: 6200,
      workingHours: "8:30 AM – 10:17 AM",
      route: [
        { n: 1, time: "08:30 AM", location: "Office / Starting Point", area: "Pasig", activity: "Field session started", account: null, amount: null, status: "Completed", lat: 14.5800, lng: 121.0800, isStart: true },
        { n: 2, time: "10:17 AM", location: "Pasig", area: "Pasig", activity: "Account Visit", account: "LN-004410", amount: null, status: "Completed", lat: 14.5764, lng: 121.0851 }
      ]
    },
    {
      id: "mark-santos",
      name: "Mark Santos",
      collectorId: "COL-0031",
      status: "attention",
      area: "Cavite",
      currentLocation: "Las Piñas (outside assigned area)",
      lastUpdate: "12 min ago",
      lat: 14.4445,
      lng: 120.9938,
      assignedAccounts: 48,
      activitiesToday: 6,
      amountCollected: 9700,
      workingHours: "8:15 AM – Present",
      route: [
        { n: 1, time: "08:15 AM", location: "Office / Starting Point", area: "Cavite", activity: "Field session started", account: null, amount: null, status: "Completed", lat: 14.4791, lng: 120.8970, isStart: true },
        { n: 2, time: "10:30 AM", location: "Las Piñas", area: "Cavite (outside)", activity: "Account Visit", account: "LN-005522", amount: null, status: "Completed", lat: 14.4445, lng: 120.9938 }
      ]
    }
  ];

  var AUDIT_TRAIL = [
    { time: "10:42 AM", text: "Juan Dela Cruz location updated." },
    { time: "10:18 AM", text: "Collection activity recorded." },
    { time: "09:58 AM", text: "Payment of ₱3,250 recorded." },
    { time: "09:14 AM", text: "Account LN-001246 updated." },
    { time: "08:37 AM", text: "Collector arrived at assigned location." },
    { time: "08:12 AM", text: "Field session started." }
  ];

  window.MRCOLLECT_FIELD_DATA = {
    STATUS_META: STATUS_META,
    COLLECTORS: COLLECTORS,
    AUDIT_TRAIL: AUDIT_TRAIL
  };
})();
