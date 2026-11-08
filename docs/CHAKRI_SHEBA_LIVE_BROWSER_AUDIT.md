# Chakri Sheba Live Browser Audit & Runtime Diagnostics
**Execution Date:** November 8, 2026
**Environment:** Next.js Development Server (`http://localhost:3000`)
**Engine:** Playwright Chromium (Headless + Automated E2E Runner)
**Status:** Live Website Inspected Successfully

---

## 1. Executive Summary

An authorized live browser debugging session was executed against `http://localhost:3000`. A total of 18 critical paths across the Public Website, User Portal, and Admin Panel were inspected for runtime HTTP responses, console errors, network failures, responsive layouts, and authentication states.

---

## 2. Route Accessibility Matrix

| Route Name | Target URL | HTTP Status | Verdict | Notes |
| :--- | :--- | :---: | :---: | :--- |
| **Homepage** | `/` | 200 OK | ✅ PASS | Compiles correctly; contains hero, job search, circular grid |
| **Job Listing** | `/jobs` | 200 OK | ✅ PASS | Renders job search filters, categories, and real job circulars |
| **Dynamic Job Details** | `/jobs/[id]` | 200 OK | ✅ PASS | Verified dynamic route with real DB circular metadata |
| **About Us** | `/about-us` | 200 OK | ✅ PASS | Correct title and Bangla typography |
| **Contact Us** | `/contact-us` | 200 OK | ✅ PASS | Contact form, official support hotline rendered |
| **Privacy Policy** | `/privacy-policy` | 200 OK | ✅ PASS | Legal disclosure and data protection policy |
| **Terms of Service** | `/terms-of-service` | 200 OK | ✅ PASS | Terms and terms of usage |
| **FAQ** | `/faq` | 200 OK | ✅ PASS | Accordion questions and answers |
| **User Dashboard** | `/dashboard` | 200 OK | ✅ PASS | Candidate dashboard with statistics and shortcuts |
| **User Profile** | `/dashboard/profile` | 200 OK | ✅ PASS | Personal, education, and document vault |
| **User Applications** | `/dashboard/applications` | 200 OK | ✅ PASS | Application tracking and status pills |
| **User Saved Jobs** | `/dashboard/saved-jobs` | 200 OK | ✅ PASS | Bookmarked circulars from `serverDB` |
| **Admin Dashboard** | `/admin?tab=dashboard` | 200 OK | ✅ PASS | 5 real KPI cards (`৭৪` jobs, `৭` candidates), dynamic SVG donut |
| **Admin Circulars** | `/admin?tab=circulars` | 200 OK | ✅ PASS | Circular table, editing modal, status toggles |
| **Admin Candidate Directory**| `/admin?tab=candidate-directory`| 200 OK | ✅ PASS | Candidate table, 360° inspector, universal editor drawer |
| **Admin Page Builder** | `/admin?tab=builder` | 200 OK | ✅ PASS | 3-panel visual page builder (Left, Canvas, Right Inspector) |
| **Admin Financial Ledger** | `/admin?tab=transactions` | 200 OK | ⚠️ FIX NEEDED | Tab renders 200, but background fetch to `/api/admin/wallet-transactions` returned 403 due to missing admin secret in request headers |
| **Admin Spider Hub** | `/admin?tab=gemini-browser-spider`| 200 OK | ⚠️ FIX NEEDED | Tab renders 200, but background fetch to `/api/admin/spider/gemini-browser` missing headers in secondary call |
| **Admin Audit Logs** | `/admin?tab=audit-logs` | 200 OK | ✅ PASS | Immutable audit trail viewer |

---

## 3. Discovered Runtime Issues

### Issue 1: Authentication Header Omission on Wallet Transactions API (P1)
- **Symptom:** Console error: `Failed to load resource: the server responded with a status of 403 (Forbidden)` on `GET /api/admin/wallet-transactions`.
- **Root Cause:** `FinancialTransactionsLedger.tsx` called `fetch('/api/admin/wallet-transactions')` without attaching `x-admin-secret: localStorage.getItem('cs_admin_pin')`. Additionally, `src/app/api/admin/wallet-transactions/route.ts` only checked session cookies rather than accepting `x-admin-secret`.
- **Fix Required:** Update route to verify `x-admin-secret` alongside session cookie, and pass `getAdminHeaders()` in `FinancialTransactionsLedger.tsx`.

### Issue 2: Secondary Spider Status Fetch Omission (P2)
- **Symptom:** Console error: 403 Forbidden on secondary spider status fetch.
- **Root Cause:** In `GeminiBrowserSpiderHub.tsx`, one of the fallback polling calls to `/api/admin/spider/gemini-browser` omitted the `x-admin-secret` header.
- **Fix Required:** Ensure all fetch calls in `GeminiBrowserSpiderHub.tsx` use uniform admin headers.

---

## 4. Visual Inspection Evidence

- `89_homepage_live_audit.png`: Verified homepage header, job search bar, clean SolaimanLipi font, zero visual overflow.
- `90_admin_dashboard_live_audit.png`: Verified real data dashboard with live counters, dynamic donut chart, and SolaimanLipi typography.
- `85_admin_dashboard_real_data_verified.png`: Verified zero dummy data across 5 KPI metrics.
- `86_candidate_workspace_overview.png`, `87_candidate_workspace_applications.png`, `88_candidate_workspace_wallet.png`: Verified candidate 13-tab deep editing drawer.

