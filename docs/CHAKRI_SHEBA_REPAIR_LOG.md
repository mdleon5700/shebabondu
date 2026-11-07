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

---

### Repair Entry 4: Candidate Registration Session Persistence Fix
- **Date:** 2026-11-07
- **File:** `src/app/register/page.tsx`
- **Issue:** Newly registered candidate losing session on page refresh and requiring manual re-login.
- **Root Cause:** In `src/app/login/page.tsx`, successful authentication set both `document.cookie = cs_session_token=...` and `localStorage.setItem('cs_session_token', token)`. However, `src/app/register/page.tsx` only called `storage.setAuth()`, failing to set `document.cookie` or `localStorage.getItem('cs_session_token')`. Consequently, on hard page reload, Next.js server components and `CandidateDataProvider.tsx` had no authorization cookie and reverted to unauthenticated state.
- **Fix:** Added `document.cookie = \`cs_session_token=\${data.token}; path=/; max-age=2592000; SameSite=Lax\` and `localStorage.setItem('cs_session_token', data.token)` immediately after successful registration.
- **Verification:** Live browser test with Playwright confirmed candidate remains logged in after page reload.

---

### Repair Entry 5: Hardcoded Admin PIN 1234 & API Privilege Escalation Elimination (P0)
- **Date:** 2026-11-07
- **Files Modified:** `src/lib/auth.ts`, `src/app/admin/page.tsx`, `src/app/api/admin/audit/route.ts`, `src/app/api/admin/collector/sync/route.ts`, `src/app/api/admin/content-studio/route.ts`, `src/app/api/admin/gemini/parse-circular/route.ts`, `src/app/api/admin/pages/route.ts`, `src/app/api/admin/pages/[id]/route.ts`, `src/app/api/admin/spider/gemini-browser/route.ts`
- **Issue:** 
  1. `src/lib/auth.ts` unconditionally accepted `'1234'`, `'admin'`, `'admin123'`, `'123456'` as valid admin secrets.
  2. 11 admin API endpoints used `|| cookie.includes('cs_session_token')`, which allowed any candidate possessing a regular candidate session cookie to execute admin operations (privilege escalation).
  3. `src/app/admin/page.tsx` contained hardcoded `x-admin-secret: '1234'` fallback headers.
- **Root Cause:** Incomplete separation between development convenience mock credentials and production server-side role-based authorization.
- **Fix:**
  1. Updated `verifyAdminSecret` in `src/lib/auth.ts`: In production (`process.env.NODE_ENV === 'production'`), strictly enforce non-trivial `ADMIN_SECRET_KEY` from environment and reject all weak defaults (`1234`, `admin`, etc.).
  2. Replaced `cookie.includes('cs_session_token')` across all 11 admin routes with strict `(session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret))`.
  3. Refactored `src/app/admin/page.tsx` to dynamically query `localStorage.getItem('cs_admin_pin')` through a secure `getAdminHeaders()` helper rather than hardcoding `'1234'`.
- **Verification:** Unit tests and Playwright E2E suite executed cleanly; unauthorized requests rejected with 401/403.

---

### Repair Entry 6: Candidate Layout ID Fallback Bug Repair & Playwright Assertions Hardening
- **Date:** 2026-11-07
- **Files Modified:** `src/app/dashboard/layout.tsx`, `tests/e2e/02-auth-rbac.spec.ts`, `tests/e2e/03-user-panel.spec.ts`
- **Issue:** 
  1. Candidate dashboard sidebar displayed `CS-7712` instead of actual candidate ID whenever `profile.nid` was empty.
  2. Playwright Suite 2 and Suite 3 contained weak/tautological assertions (`|| 'present'`), missing redirect verification, and omitted persistence verification after page reload.
- **Root Cause:**
  1. Slicing expression in `src/app/dashboard/layout.tsx:253` used `profile.nid ? profile.nid.slice(0, 6) + '...' : 'CS-7712'` instead of displaying candidate identifier (`profile.id || profile.username`).
  2. Testing scripts were written for quick pass rather than deep mutation verification.
- **Fix:**
  1. Updated layout to `profile.id || (profile.nid ? profile.nid.slice(0, 6) + '...' : profile.username || 'প্রার্থী')`.
  2. Hardened Playwright tests: asserted true redirect to `/dashboard` upon registration, asserted real session cookies, used valid demo credentials for login assertion, and asserted form field persistence across page reload in profile mutation test.
- **Verification:** `npm run typecheck` passed with 0 errors; Playwright test suite verified.
- **Verification:** Verified in real Chrome via subagent `browser`: candidate registered, page hard reloaded (`type="reload"`), and user session remained 100% active with wallet balance and candidate identity intact. Zero TypeScript errors.

