# MRCOLLECT — Field Collection Management Platform (Portfolio Site)

A static, dependency-free HTML/CSS/JS marketing site for MRCOLLECT, with a
real **Formspree**-powered "Request a Demo" form (hosted on **GitHub
Pages**), plus a portfolio-demo **Log In → Dashboard → Fieldman Location /
Field Activity** flow — MRCOLLECT's field-force monitoring and collection
audit module.

---

## 1. What's in this project

```
mrcollect/
├── index.html                Marketing site + Request a Demo modal (real Formspree form)
├── login.html                   Log In (demo authentication only)
├── dashboard.html                  Main dashboard (sidebar shell)
├── fieldman-location.html            Field-force map, routes, location audit
├── field-activity.html                 Field activity log + activity details
├── success.html                          No-JavaScript fallback thank-you page
├── README.md                                This file
├── assets/
│   ├── images/hero-background.jpg
│   └── icons/                      (icons are inline SVG in the HTML)
├── css/
│   ├── style.css                Design tokens + marketing site styles
│   ├── responsive.css             Breakpoints
│   └── dashboard.css                Login + dashboard shell + map + audit UI styles
└── js/
    ├── app.js               Marketing site: footer year, scroll-spy nav
    ├── form.js                 Request Demo form validation + Formspree AJAX submit
    ├── leads.js                  Local "demo leads" storage (Request a Demo form)
    ├── ui.js                        Marketing site modal open/close, mobile nav
    ├── auth.js                        Demo login, session, and dashboard auth guard
    ├── dashboard.js                     Sidebar mobile toggle (shared across dashboard pages)
    ├── fieldman-data.js                   DEMO collector/route/audit-trail dataset
    ├── fieldman-map.js                      Leaflet map, markers, route, audit tables
    └── field-activity.js                      Field Activity table, filters, detail modal
```

---

## 2. Log In flow

```
Public Website → Log In → login.html → successful authentication → dashboard.html
```

- The public site only ever shows **"Log In"** — no "Admin Login" label and
  no visible username/password anywhere.
- `js/auth.js` implements **demo authentication only**: any syntactically
  valid email + non-empty password succeeds. This is intentional for a
  portfolio demo and is clearly commented in the code:
  > "Demo authentication only. Replace with Supabase Auth before production use."
- The demo session is stored in `sessionStorage` (or `localStorage` if
  "Remember Me" is checked) and is what `dashboard.html`,
  `fieldman-location.html`, and `field-activity.html` check via
  `[data-requires-auth]` before rendering — unauthenticated visits redirect
  back to `login.html`.
- **Before production:** replace the `attemptLogin()` function in
  `js/auth.js` with a real call to **Supabase Auth**
  (`supabase.auth.signInWithPassword(...)`), and move session verification
  server-side. The rest of the flow (redirect to `dashboard.html`, reading
  the profile into the sidebar) stays the same.

---

## 3. Fieldman Location module

`fieldman-location.html` is the field-force monitoring centerpiece:

- **Map:** Leaflet.js + OpenStreetMap tiles, loaded from a CDN — no Google
  Maps API key required. If the map tiles can't load (e.g. no internet in
  a sandboxed preview), a styled fallback panel is shown instead so the
  page still works.
- **Collector markers:** color-coded by status (Active, On Field,
  Collection Activity, Offline, Attention) with a legend above the map.
  Clicking a marker opens a popup with collector stats and a **View
  Activity** button.
- **Detail side panel:** collector info + a numbered **route timeline**
  for the day, and draws the matching route line + numbered stops on the
  map.
- **Field Activity Audit, Location Audit, Location History, and Activity
  Audit Trail** sections below the map, all driven by the same demo
  dataset in `js/fieldman-data.js`.
- **Geo-fencing** and **Activity Alerts** are explicitly labeled as demo
  features — no real geofencing or fraud detection is implemented.

**All names, coordinates, and activity data on this page are fictional
demo data** — clearly labeled `DEMO DATA` / `LIVE DEMO` in the UI. No real
individual's location is shown.

### Future production architecture

```
Collector Mobile Device → GPS Location → Secure API → Supabase/PostGIS → MRCOLLECT Dashboard
```

Real location tracking should use the Browser Geolocation API on the
collector's device, a secure API (not direct client-side writes), and a
geospatial database (Supabase + PostGIS or similar) — with role-based
access control, authentication/authorization, audit logs, a data
retention policy, and encrypted transport, so only authorized management
users can see collector locations. This demo intentionally does not
implement any of that; it renders static demo data client-side.

---

## 4. Field Activity page

`field-activity.html` lists every recorded field action (account visits,
collections, payment recordings, follow-ups) in a filterable table.
Clicking a row opens an **Activity Details** modal with the full record,
including demo location coordinates. A **Field Location Audit Report**
table below summarizes each collector's day (start/end time, distance,
activities, collection amount).

---

## 5. How the Request a Demo form actually works

**Formspree is the real backend for this form** — see the form markup in
`index.html` and the submit logic in `js/form.js`. No API keys or SMTP
credentials appear anywhere in the code.

### ⚠️ Before this works, you must:

1. Create a form at **formspree.io** and set the recipient email to
   `mrivo2691@gmail.com`.
2. Copy your Form ID (the part after `/f/` in the endpoint URL, e.g.
   `https://formspree.io/f/xkgojqzp`).
3. In `index.html`, replace `YOUR_FORM_ID` in:
   ```html
   action="https://formspree.io/f/YOUR_FORM_ID"
   ```
4. Submit the form once after deploying and confirm via the email
   Formspree sends to `mrivo2691@gmail.com` on first use (free tier
   requirement).

---

## 6. Run it locally

```bash
cd mrcollect
python -m http.server 8000
```

Open **http://localhost:8000**. Try:
- `index.html` → Request a Demo
- `index.html` → Log In → any email + any password → `dashboard.html`
- Sidebar → **Fieldman Location** → click a collector marker or list item
  → **View Activity**
- Sidebar → **Field Activity** → click a row → Activity Details

---

## 7. Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "MRCOLLECT portfolio site"
git branch -M main
git remote add origin https://github.com/<your-username>/mrcollect.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Source:
Deploy from a branch → Branch: `main`, folder `/ (root)`**. Your site goes
live at `https://<your-username>.github.io/mrcollect/`.

---

## 8. Add your custom domain (mrcollect.com)

1. Buy `mrcollect.com` at a registrar (e.g. Namecheap), with WHOIS privacy
   enabled.
2. Repo → **Settings → Pages → Custom domain** → enter `mrcollect.com` →
   Save (GitHub commits a `CNAME` file automatically).
3. At your registrar's DNS settings, add:

   | Type  | Host | Value                        |
   |-------|------|------------------------------|
   | A     | @    | 185.199.108.153              |
   | A     | @    | 185.199.109.153              |
   | A     | @    | 185.199.110.153              |
   | A     | @    | 185.199.111.153              |
   | CNAME | www  | `<your-username>.github.io`  |

4. Wait for DNS to propagate (usually under an hour, up to 24–48h), then
   enable **Enforce HTTPS** in Settings → Pages.

---

## 9. Demo Log In

```
URL:      login.html
Email:    any valid-looking email (e.g. demo@mrcollect.com)
Password: any non-empty value
```

No credentials are displayed on the site itself — this is documented here
in the README only. Demo authentication, not production-secure; see
Section 2.

---

## 10. What to change before using this with real customer data

- **Authentication:** replace `js/auth.js`'s `attemptLogin()` with
  **Supabase Auth** (or another real provider), with server-side session
  verification.
- **Location data:** implement the production architecture in Section 3 —
  do not ship the current client-side demo dataset as-is. Location data
  is sensitive; add role-based access control, audit logs, a data
  retention policy, and encrypted transport before handling any real
  collector location.
- **Leads dashboard / field data:** replace the demo datasets in
  `js/leads.js` and `js/fieldman-data.js` with real database-backed data
  (or pull leads from the Formspree API).
- **Form volume:** check your Formspree plan's monthly submission cap.
- **Legal/compliance:** add a real privacy policy and terms before
  collecting prospect or location data at scale.

---

## Contact

**MRCOLLECT** — Field Collection Management Platform
Email: mrivo2691@gmail.com
Phone: +63 924 119 7391
