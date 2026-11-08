# CHAKRI SHEBA — CROSS-MODULE INTEGRATION REPORT

> **Scope:** Full-Platform Integration Audit across Frontend, Backend APIs, Database, and Admin/User Panels  
> **Status:** ALL CORE WORKSTREAMS INTEGRATED & VERIFIED  

---

## 1. Cross-Panel Bidirectional Synchronization

| Data Entity | Candidate Panel UI | Candidate Backend API | Admin Panel Workspace | Admin Backend API | Sync Status |
|---|---|---|---|---|---|
| **English Name** | `/dashboard/profile` | `PUT /api/profile` | `UniversalUserWorkspace.tsx` | `PATCH /api/admin/candidates/[id]` | ✅ Synchronized |
| **Bengali Name** | `/dashboard/profile` | `PUT /api/profile` | `UniversalUserWorkspace.tsx` | `PATCH /api/admin/candidates/[id]` | ✅ Synchronized |
| **Date of Birth** | `/dashboard/profile` | `PUT /api/profile` | `UniversalUserWorkspace.tsx` | `PATCH /api/admin/candidates/[id]` | ✅ Synchronized |
| **Education Array** | `/dashboard/profile` | `PUT /api/profile` | `UniversalUserWorkspace.tsx` | `PATCH /api/admin/candidates/[id]` | ✅ Synchronized |
| **Experience** | `/dashboard/profile` | `PUT /api/profile` | `UniversalUserWorkspace.tsx` | `PATCH /api/admin/candidates/[id]` | ✅ Synchronized |
| **Technical Skills** | `/dashboard/profile` | `PUT /api/profile` | `UniversalUserWorkspace.tsx` | `PATCH /api/admin/candidates/[id]` | ✅ Synchronized |
| **Address & District** | `/dashboard/profile` | `PUT /api/profile` | `UniversalUserWorkspace.tsx` | `PATCH /api/admin/candidates/[id]` | ✅ Synchronized |
| **Quota Claims** | `/dashboard/profile` | `PUT /api/profile` | `UniversalUserWorkspace.tsx` | `PATCH /api/admin/candidates/[id]` | ✅ Synchronized |
| **Verification Notes** | Read-only in profile | `GET /api/profile` | Admin Editable | `PATCH /api/admin/candidates/[id]` | ✅ Synchronized |
| **Wallet Balance** | `/dashboard/wallet` | `GET /api/wallet` | Admin View / Credit | `PATCH /api/admin/candidates/[id]` | ✅ Synchronized |

---

## 2. Admin Impersonation ("Login as Candidate") Integration

* **Endpoint:** `POST /api/admin/impersonate` -> sets `cs_session_token`, `cs_impersonating` cookies.
* **Dashboard Banner:** `src/app/dashboard/layout.tsx` detects `cs_impersonating` cookie and displays amber top banner:
  > `⚠️ অ্যাডমিন ইমপারসোনেশন মোড সক্রিয়... [✕ অ্যাডমিন প্যানেলে ফিরুন]`
* **Return Endpoint:** `DELETE /api/admin/impersonate` clears session and redirects back to `/admin?tab=candidate-directory`.
* **Security Validation:** Impersonation requires either `x-admin-secret` header or an active admin session cookie. Ordinary candidates cannot impersonate others.

---

## 3. Engineering State Machine & Local Worker Integration

* **Lease Mechanism:** Atomically leases tasks from `engineeringTasks` collection in `src/lib/db.ts` with 10-minute lease timeouts.
* **Heartbeat Renewal:** Local Worker sends heartbeat every 3 minutes to extend active leases.
* **Retry Boundedness:** 3 maximum attempts before transitioning to `FAILED` or `NEEDS_HUMAN_REVIEW`.
* **Playwright QA Dispatcher:** Successfully rendered live pages and stored screenshots into artifacts directory.
