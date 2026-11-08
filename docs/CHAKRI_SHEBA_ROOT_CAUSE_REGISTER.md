# CHAKRI SHEBA — ROOT CAUSE REGISTER & HISTORICAL DEFECT ANALYSIS

> **Standard Repair Lifecycle:** DETECT -> REPRODUCE -> DIAGNOSE -> IDENTIFY ROOT CAUSE -> MAP AFFECTED MODULES -> PREPARE FIX -> TEST -> REGRESSION -> VERIFY -> DOCUMENT

---

## Registered & Resolved Defects

### DEFECT-001: Missing Dynamic Route `/api/admin/candidates/[id]` (HTTP 404)
* **Priority:** `P1_HIGH`
* **Affected Modules:** `UniversalUserWorkspace.tsx`, `src/app/api/admin/candidates/[id]/route.ts`
* **Reproduction Steps:** Open Admin Dashboard -> Candidate Directory -> Click "ওয়ার্কস্পেস খুলুন" on any candidate row.
* **Root Cause:** `UniversalUserWorkspace.tsx` fetched `/api/admin/candidates/${id}` on open and save, but the dynamic Next.js App Router route file `src/app/api/admin/candidates/[id]/route.ts` was never created.
* **Resolution:** Created `src/app/api/admin/candidates/[id]/route.ts` implementing `GET` (loads profile, documents, applications, saved jobs, transactions), `PATCH` (profile updates, notes, password reset), and `DELETE`.
* **Verification Evidence:** `scripts/bidirectional_user_admin_sync_audit.js` returned 10/10 PASS; Playwright screenshots `86_candidate_workspace_overview.png`, `93_admin_candidate_workspace_synced.png`.

---

### DEFECT-002: Stale Profile Updates on User Panel (Lagging Saves)
* **Priority:** `P1_HIGH`
* **Affected Modules:** `src/app/api/profile/route.ts`, `src/app/dashboard/profile/page.tsx`
* **Reproduction Steps:** User edits profile fields (e.g. Bengali name or career objective), saves, reloads page -> edits revert to old data temporarily.
* **Root Cause:** Next.js App Router cached GET responses by default due to missing `export const dynamic = 'force-dynamic'` and missing `Cache-Control: no-store` headers. In addition, the frontend lacked optimistic state updating.
* **Resolution:** Added `export const dynamic = 'force-dynamic'`, `NO_CACHE_HEADERS` (`Cache-Control: no-store, no-cache, must-revalidate`), and implemented optimistic state updates with custom event `cs_user_changed` in `src/app/dashboard/profile/page.tsx`.
* **Verification Evidence:** `scripts/test_instant_update_and_font_audit.js` verified instant updates; Playwright screenshots `98_user_profile_instant_update_live.png`, `99_admin_verified_instant_update.png`.

---

### DEFECT-003: Broken Bengali Conjunct Glyphs (Typography Break)
* **Priority:** `P1_HIGH`
* **Affected Modules:** `src/app/globals.css`, `tailwind.config.ts`, `src/app/layout.tsx`
* **Reproduction Steps:** Open candidate portal on Windows without SolaimanLipi installed locally -> text displays broken glyphs and disjointed conjuncts (`ক্ষ`, `জ্ঞ`, `ঞ্চ`).
* **Root Cause:** `globals.css` forced `'SolaimanLipi' !important` with `font-display: block;` and zero fallback. When WOFF2 was slow to load, the browser defaulted to unshaped Arial glyphs. Tailwind config also used `Arial` as the primary fallback.
* **Resolution:** Updated CSS with resilient fallback stack: `'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;`. Added OpenType ligatures `font-feature-settings: "kern" 1, "liga" 1;`. Added Google Fonts CDN preload in `layout.tsx`.
* **Verification Evidence:** Playwright computed style inspection in `scripts/test_instant_update_and_font_audit.js` confirmed full fallback stack and `liga` font-feature-settings active.

---

### DEFECT-004: HTTP 500 on Empty Request Body in `/api/admin/impersonate`
* **Priority:** `P1_HIGH`
* **Affected Modules:** `src/app/api/admin/impersonate/route.ts`
* **Reproduction Steps:** POST to `/api/admin/impersonate` with empty body or invalid JSON -> returns HTTP 500 Internal Server Error.
* **Root Cause:** Calling `await req.json()` threw an unhandled SyntaxError inside the outer try/catch, resulting in a generic 500 response instead of standard REST 400 Bad Request.
* **Resolution:** Wrapped `await req.json()` in an inner try/catch block with explicit fallback returning HTTP 400 Bad Request (`{ error: 'Candidate ID is required' }`).
* **Verification Evidence:** `scripts/master_issue_discovery_engine.js` verified HTTP 400 returned on empty body.

