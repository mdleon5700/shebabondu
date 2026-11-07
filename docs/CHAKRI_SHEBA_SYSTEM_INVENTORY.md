# CHAKRI SHEBA — COMPLETE SYSTEM INVENTORY

> **Audit Date:** 2026-11-07  
> **Repository:** `chakri-sheba-workspace`  
> **Runtime Environment:** Node.js 20+ (Active v24.16.0), Next.js 14.2.15 App Router

---

## 1. Technical Architecture Stack

| Layer | Implementation | Notes |
|---|---|---|
| **Frontend Framework** | Next.js 14.2.15 App Router (React 18.3.1) | Dynamic routing, Server & Client Components, Suspense |
| **Styling & UI** | Tailwind CSS 3.4.14, Lucide React (0.453) | Responsive (375px mobile to 1440px desktop) |
| **Backend & APIs** | Next.js API Route Handlers (`src/app/api/`) | REST JSON endpoints, force-dynamic caching where required |
| **Database Engine** | File-backed `serverDB` Singleton (`src/lib/db.ts`) | Persistent JSON storage with `.tmp` and `.bak` atomic write guarantees |
| **Authentication** | Cookie-based session (`cs_session_token`) & Client Storage (`cs_auth_data`) | Middleware gate for `/dashboard` and `/api/admin` |
| **Job Spider Engine** | Live Collector (`alljobs_live_collector.ts`) & Playwright Crawler (`gemini_browser_controller.ts`) | Direct Teletalk Alljobs API ingestion + headless Chromium browser fallback |
| **PDF Processing** | `unpdf` (^2.0.0) | In-memory text extraction, layout parsing |
| **QA / Testing** | `@playwright/test` (^1.65.0), TypeScript 5 (`tsc --noEmit`) | 37 comprehensive automated E2E tests in `tests/e2e/` |

---

## 2. Module Classification Inventory

*Classification Legend:*
1. Fully Functional (Verified) | 2. Partially Functional | 3. UI Exists, Backend Missing | 4. Backend Exists, Frontend Missing | 5. Incorrectly Connected | 6. Broken | 7. Duplicated | 8. Missing | 9. Security-Sensitive | 10. Not Yet Verified

| Module / Route | Classification | Primary Functions & Notes |
|---|---|---|
| **Public Homepage (`/`)** | **1. Fully Functional** | Dynamic Hero, Jobs Feed, How It Works, CTA, Testimonials, FAQ, Sticky Header |
| **Job Directory (`/jobs`)** | **1. Fully Functional** | Live search, category filtering, district filtering, deadline status badges |
| **Job Details (`/jobs/[id]`)** | **1. Fully Functional** | Server-rendered JSON-LD schema, positions table, deadline countdown, official links |
| **Public Static Pages** (`/about-us`, `/contact-us`, `/faq`, `/privacy-policy`, etc.) | **1. Fully Functional** | All HTTP 200, SEO metadata, breadcrumbs, contact form |
| **Candidate Auth (`/login`, `/register`)** | **1. Fully Functional & 9. Security-Sensitive** | Session cookie creation, password hashing, validation, redirect handling |
| **Candidate Dashboard (`/dashboard`)** | **1. Fully Functional** | Profile overview, applied jobs count, saved circulars, recent activities |
| **Candidate Profile & Biodata (`/dashboard/profile`)** | **1. Fully Functional** | Personal info, educational qualifications, address, skills |
| **Candidate Documents / CV (`/dashboard/documents`)** | **1. Fully Functional & 9. Security-Sensitive** | Document upload, NID/Certificate storage, CV management, privacy protection |
| **Admin Console Entry (`/admin`)** | **1. Fully Functional & 9. Security-Sensitive** | PIN-gated lock screen, session verification, tab navigation |
| **Admin Website Builder (`WebsiteBuilder.tsx`)** | **1. Fully Functional** | Live section editing, move up/down, add sections, header/footer & auth controls |
| **Admin Job Publishing Center (`UniversalJobWorkspace.tsx`)** | **1. Fully Functional** | Create circulars, manual edits, review queue, instant publishing |
| **Admin Live Spider Hub (`GeminiBrowserSpiderHub.tsx`)** | **1. Fully Functional** | Live Teletalk Alljobs sync, 28+ government orgs API, automated SVG banner creation |
| **Admin Source Registry (`SourceRegistryManagement.tsx`)** | **1. Fully Functional** | 5 registered sources (Teletalk, BPSC, Bangladesh Bank, Prothom Alo, Bdjobs) |
| **Admin Financial Ledger (`FinancialTransactionsLedger.tsx`)** | **1. Fully Functional & 9. Security-Sensitive** | Free service tracking, zero-fee enforcement, audit trails |
| **Candidate Job Application Tracking (`/dashboard/applications`)** | **1. Fully Functional** | Application status (PENDING, PROCESSING, SUBMITTED), applicant copies |
| **Notification Engine (`/api/notifications`)** | **2. Partially Functional** | In-app alerts functional; external SMS gateway requires live provider credentials |
