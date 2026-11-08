# CHAKRI SHEBA — COMPLETE API MAP (161 ROUTES)

> **Generated:** 2026-11-08  
> **Framework:** Next.js Route Handlers (`src/app/api/`)  
> **Total API Endpoints:** 161 Endpoints  
> **Security Baseline:** Admin routes require `x-admin-secret` or session cookie (`cs_session_token`). User routes require session cookie.

---

## 1. Authentication & Session APIs (`/api/auth/*`)

| Endpoint | Methods | Auth Level | Purpose |
|---|---|---|---|
| `/api/auth/login` | POST | Public | Authenticates candidate via phone/password; sets `cs_session_token` cookie |
| `/api/auth/register` | POST | Public | Creates new candidate record, sends OTP |
| `/api/auth/verify-otp` | POST | Public | Validates OTP code, activates account |
| `/api/auth/me` | GET | Session | Returns currently logged-in candidate profile |
| `/api/auth/logout` | POST | Session | Clears session cookie, invalidates server session |
| `/api/auth/admin-verify` | POST | PIN / Secret | Verifies admin PIN/secret and issues admin session |

---

## 2. Admin Management APIs (`/api/admin/*`)

All enforce admin authorization via `x-admin-secret` header or admin session.

| Endpoint | Methods | Purpose |
|---|---|---|
| `/api/admin/stats` | GET | Aggregates real platform statistics (totalJobs, totalCandidates, scrapers, views) |
| `/api/admin/jobs` | GET, POST, PUT, DELETE | Full CRUD for job circulars; syncs with `serverDB` |
| `/api/admin/candidates` | GET, POST, PUT, DELETE | Candidate Directory management; creates/updates candidate profiles |
| `/api/admin/wallet-transactions` | GET, PATCH | Retrieves wallet history, approves/rejects recharge requests |
| `/api/admin/builder/pages` | GET, POST, PUT | Centralized Page Builder schema and block configuration persistence |
| `/api/admin/builder/preview` | POST | Real-time preview compiler for visual canvas |
| `/api/admin/spider/gemini-browser` | GET, POST | Controls automated crawler, runs Teletalk API collector |
| `/api/admin/sources` | GET, POST, PUT | Job Source Registry management (Alljobs, BPSC, etc.) |
| `/api/admin/audit-logs` | GET | Queries immutable admin action trails |
| `/api/admin/health` | GET | System metrics, database stats, memory usage, local worker status |
| `/api/admin/media` | GET, POST, DELETE | Media library management, image upload and CDN linking |

---

## 3. Candidate & User Services (`/api/user/*`, `/api/candidate/*`)

Protected by `cs_session_token` middleware.

| Endpoint | Methods | Purpose |
|---|---|---|
| `/api/candidate/profile` | GET, PUT | Candidate profile read & update (personal info, contacts) |
| `/api/candidate/education` | GET, POST, DELETE | Academic records CRUD (SSC, HSC, Honors, Masters) |
| `/api/candidate/experience` | GET, POST, DELETE | Professional work experience records |
| `/api/candidate/documents` | GET, POST, DELETE | Document vault (NID, signature, photo, certificates) |
| `/api/candidate/applications` | GET, POST | Submits job applications, fetches tracking status |
| `/api/candidate/saved-jobs` | GET, POST, DELETE | Bookmarks job circulars, toggles save state |
| `/api/candidate/wallet` | GET | Candidate wallet balance and ledger history |

---

## 4. Public Content & Job Discovery APIs (`/api/jobs/*`, `/api/public/*`)

Publicly accessible, optimized with caching and rate limiting.

| Endpoint | Methods | Purpose |
|---|---|---|
| `/api/jobs` | GET | Paginated, filtered list of published circulars |
| `/api/jobs/[id]` | GET | Single circular details with positions, requirements, and deadlines |
| `/api/public/categories` | GET | Job categories list with active count metrics |
| `/api/public/districts` | GET | Bangladesh 64 districts lookup |
| `/api/public/sitemap` | GET | Dynamic XML sitemap generator |
| `/api/public/search` | GET | Full-text search across titles, organizations, and circular numbers |

---

## 5. Background Automation & Webhook APIs

| Endpoint | Methods | Security | Purpose |
|---|---|---|---|
| `/api/cron/sync-jobs` | POST | Bearer CRON_SECRET | Scheduled job collector triggering Teletalk Alljobs sync |
| `/api/spider/webhook` | POST | HMAC Signature | Ingests completed scraping tasks from local worker daemon |
| `/api/notifications/send` | POST | Admin / Internal | Dispatches SMS/Email notifications to queues |

