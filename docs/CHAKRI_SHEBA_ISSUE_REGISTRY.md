# CHAKRI SHEBA — ISSUE & DEFECT REGISTRY

> **Governance:** Zero-tolerance for unverified assertions. Every item must be reproduced with terminal/browser evidence.

---

## 1. Prioritized Issue Queue

| ID | Priority | Module | Summary / Description | Reproduction Status | Root Cause | Fix Status |
|---|---|---|---|---|---|---|
| **ISSUE-01** | **P1** | **Session / Hydration** | Registration did not set browser cookie `cs_session_token`, causing desync on refresh | ✅ Verified & Fixed | Registration endpoint set cookie in headers, but client lacked cookie persistence | 🟢 Fixed in commit `da66beb` |
| **ISSUE-05** | **P0** | **Admin Security / Bypass** | Hardcoded PIN `1234` in `auth.ts`, `admin/page.tsx`, and API routes permitted bypass | ✅ Confirmed in Code | `validSecrets` unconditionally contained `'1234'`, `'admin'`, `'123456'` | 🟢 Fixed: Strict `ADMIN_SECRET_KEY` required in production; dev PINs isolated |
| **ISSUE-06** | **P0** | **Admin API Privilege Escalation** | Admin API endpoints used `|| cookie.includes('cs_session_token')`, letting candidate sessions execute admin operations | ✅ Confirmed in Code | 11 admin routes checked for token presence rather than `session.role === 'admin'` | 🟢 Fixed: All 11 routes converted to strict `hasAdminAccess` role & secret checks |
| **ISSUE-07** | **P1** | **Candidate Identity Fallback** | Candidate layout rendered `CS-7712` instead of actual candidate ID if NID was empty | ✅ Confirmed in Code | Fallback string `'CS-7712'` hardcoded in `src/app/dashboard/layout.tsx:253` | 🟢 Fixed: Replaced with `profile.id || profile.username || 'প্রার্থী'` |
| **ISSUE-08** | **P2** | **KPI Transparency** | Platform Governance displayed static `99.98%` uptime instead of live monitor | ✅ Confirmed in Code | Hardcoded in `src/lib/governance/health.ts:174` and component fallback | 🛡️ Documented & flagged as static baseline metric |
| **ISSUE-09** | **P1** | **E2E Playwright Assertion Integrity** | Playwright tests passed with tautological checks (`|| 'present'`) and lacked redirect/persistence assertions | ✅ Confirmed in Code | Weak assertions in `02-auth-rbac.spec.ts` and `03-user-panel.spec.ts` | 🟢 Fixed: Hardened with real credentials, redirect checks, and form reload persistence |

---

## 2. Maintenance Rules
- Never close an issue without real browser or automated test verification.
- Every fix must be accompanied by regression test coverage.

