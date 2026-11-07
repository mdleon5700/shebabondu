# CHAKRI SHEBA — ENGINEERING REPAIR LOG

> **Changelog of Confirmed Root-Cause Repairs**

---

### Repair Entry 1: Header Menu Reordering & Auth Button Controls
- **Date:** 2026-11-07
- **Commit:** `733e2fb`
- **Issue:** Homepage header menu links had no admin up/down ordering; guest buttons vs candidate widgets were hardcoded.
- **Root Cause:** Absence of dynamic button configuration in `PlatformSettings` and lack of reordering UI in `WebsiteBuilder.tsx`.
- **Fix:** Added `guestButtons`, `userWidgets`, and `stickyHeader` to schema; implemented move up/down controls in `WebsiteBuilder.tsx`; added conditional rendering and pill badges in `Navbar.tsx`.
- **Verification:** Dedicated script `test_header_menu_and_auth_states.js` passed 100%; 37/37 Playwright tests passed.

---

### Repair Entry 2: Teletalk Alljobs Direct API Connector Audit & Sync
- **Date:** 2026-11-07
- **Commit:** `23c7dc4`
- **Issue:** Need to verify whether news jobs auto-scanning actually works with live government servers.
- **Root Cause:** Ingestion needed direct integration with Teletalk's JSON API endpoints.
- **Fix:** Verified `alljobs_live_collector.ts` connecting to `https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list`; successfully synced 20 live circulars in 2.0s.
- **Verification:** Probed live API (HTTP 200), verified 29 synced jobs on public `/jobs`.

---

### Repair Entry 3: Manual Circular Publishing & SEO Validation
- **Date:** 2026-11-07
- **Commit:** `f5b2cc0`
- **Issue:** Validation of end-to-end admin job creation and instant public detail page loading.
- **Fix:** Created BCC 2026 circular via `POST /api/admin/jobs`; verified `/jobs/bcc-job-circular-2026` returns HTTP 200 with complete JSON-LD schema.
