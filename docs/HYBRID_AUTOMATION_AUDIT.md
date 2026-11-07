# CHAKRI SHEBA (চাকরি সেবা)
## Hybrid Local Browser Automation & Free AI Job Collection Audit Report

**Date:** 2026-11-07  
**Git Branch:** `feature/hybrid-local-automation` (derived from `audit-and-master-repair`)  
**Base Commit:** `30c5609` (fix(security): resolve P0 admin PIN bypass, eliminate candidate token privilege escalation, fix CS-7712 layout bug, and harden E2E tests)  
**Architecture Model:** Hybrid Decentralized Automation (Render Cloud Host + Local PC Worker)  

---

## 1. Executive Overview & Architecture Intent

The Chakri Sheba platform requires a reliable, scalable, and zero-cost job discovery and verification pipeline.
The target hybrid model divides responsibilities as follows:

```
┌────────────────────────────────────────────────────────┐
│               RENDER PRODUCTION CLOUD                  │
│  - Next.js Web App & Public Portal (chakrisheba.com)   │
│  - Central Database (local_store.json / PostgreSQL)    │
│  - Candidate Panel & Smart Document Vault              │
│  - Super Admin Console & Verification Queue            │
│  - Master Job Registry & Official Published Feed       │
│  - Central Task Queue & Worker Authorization API       │
└───────────────────────────▲────────────────────────────┘
                            │ (Outbound HTTPS Task Polling & Lease)
┌───────────────────────────▼────────────────────────────┐
│              LOCAL WINDOWS PC WORKER                   │
│  - Playwright + Standalone Chromium Engine             │
│  - Government Job Scrapers (Alljobs, BPSC, BB, etc.)   │
│  - Bounded PDF Downloader & SHA-256 Verifier           │
│  - PDF Text Extraction (unpdf / PyMuPDF) & OCR Engine  │
│  - Local Free AI (Ollama: qwen2.5:1.5b / qwen2.5:3b)   │
│  - Optional Gemini Cloud AI (Quota-exhaustion safe)    │
│  - Task Result Submission & Lease Heartbeat            │
└────────────────────────────────────────────────────────┘
```

---

## 2. Inventory of Existing Collector & Automation Components

The repository was thoroughly inspected to locate all previously created collector, extraction, and automation files:

| Target Component | Actual File Location | Current Functional State | Reusability Verdict |
|---|---|---|---|
| **Teletalk Adapter** | `src/lib/collector/teletalk_adapter.ts` | Fully implemented (SSRF check, bounded HTML fetch, host allowlists). | ✅ **100% Reusable** |
| **Alljobs Live Collector** | `src/lib/collector/alljobs_live_collector.ts` | Fully functional (Direct API connection to `https://alljobs.teletalk.com.bd`). | ✅ **100% Reusable (Primary Ingestion Engine)** |
| **BPSC & BB Adapters** | `src/lib/collector/bpsc_adapter.ts`, `src/lib/collector/bb_adapter.ts` | Implemented with live and fixture fallback support. | ✅ **100% Reusable** |
| **HTML Parser** | `src/lib/collector/html_parser.ts` | Implemented for Teletalk circulars, pagination, and tables. | ✅ **100% Reusable** |
| **PDF Extractor** | `src/lib/collector/pdf_extractor.ts` | Fully implemented (Uses `unpdf`, SHA-256 calculation, `maxPages` limit, `isScanned` / `requiresOcr` detection). | ✅ **100% Reusable** |
| **PDF Comparator** | `src/lib/collector/pdf_comparator.ts` | Implemented (diffs text between circular revisions). | ✅ **100% Reusable** |
| **Normalizer** | `src/lib/collector/normalizer.ts` | Implemented (maps raw text to normalized circular schema). | ✅ **100% Reusable** |
| **Ingestion Engine** | `src/lib/collector/ingestion.ts` | Implemented (handles draft saving, deduplication by SHA-256 and refNo). | ✅ **100% Reusable** |
| **Orchestrator** | `src/lib/collector/orchestrator.ts` | Implemented with 10-minute auto-expiring concurrency mutex (`acquireScrapeLock`). | ✅ **100% Reusable** |
| **Cron Scraper Route** | `src/app/api/cron/scraper/route.ts` | Implemented with `CRON_SECRET` authentication and `ENABLE_AUTO_SCRAPING` gate. | ✅ **100% Reusable** |
| **Browser Spider Controller** | `src/lib/spider/gemini_browser_controller.ts` | Uses persistent Chromium profile in `.browser_profile/gemini_session`. | ⚠️ **Reusable locally; headless cloud limitation.** |
| **Persistent Task Queue** | `ai-brain/core/PersistentQueue.js` | Full lease-based queuing system (`acquireLease`, `renewLease`, `reclaimStaleTasks`). | ✅ **Excellent Reference / Adapter Model** |
| **Admin Sources API** | `src/app/api/admin/sources/*` (11 routes) | Full CRUD for sources, runs, logs, toggles, and test triggers. | ✅ **100% Reusable** |
| **Admin Automation API** | `src/app/api/admin/automation/tasks/route.ts` | Central engine with task definitions (`DEFAULT_AUTOMATION_TASKS`). | ✅ **100% Reusable** |

---

## 3. Working vs. Broken vs. Missing Functionality

### 3.1 Working Functionality
1. **Direct Teletalk Ingestion:** `alljobs_live_collector.ts` successfully fetches live government circulars via HTTPS, constructs structured job data, generates bilingual editorial summaries, and saves to database.
2. **Deterministic PDF Processing:** `pdf_extractor.ts` downloads PDFs with SSRF guards, generates SHA-256 hashes, extracts page-by-page text via `unpdf`, and flags scanned documents for OCR.
3. **Draft Verification Pipeline:** `src/lib/verification/` contains deterministic checks, source authority rules, and quote validation (`validateEvidenceQuotes`).
4. **Admin Approval Gate:** Drafts remain in `status: 'DRAFT'` until an authorized admin explicitly clicks "Approve / Publish". Unverified jobs are never automatically published.
5. **Job Source Registry:** Stored in database with 5 official sources (`teletalk-alljobs`, `bpsc-portal`, `bb-erecruitment`, `prothom-alo-jobs`, `bdjobs-portal`) with scan intervals, health statuses, and metrics.

### 3.2 Broken / Constrained Functionality (Identified in Audit)
1. **Cloud Render Chromium Constraint:** Running visible or heavy headless Chromium sessions directly on Render free/low-tier instances is memory-constrained (512MB RAM limit on Render free tier leads to out-of-memory SIGKILL).
2. **Gemini Quota Vulnerability:** The verification system previously assumed Gemini API availability. When rate limits or quotas were exhausted, extraction without local fallback could stall.
3. **Ollama Integration:** Not yet connected to the pipeline.

### 3.3 Missing Functionality (To be Implemented)
1. **Local Worker Task Client (Bridge):** An outbound HTTPS worker running on the user's PC that:
   - Polls the Render backend for queued collection/verification tasks.
   - Acquires a safe task lease.
   - Executes Playwright browser navigation or local Ollama extraction locally on Windows.
   - Submits the structured job draft and PDF hash back to Render.
2. **Local Worker Authentication (M2M Token):** A machine-to-machine token header (`x-worker-token` or dedicated worker session) that allows the local PC to interact with the task queue securely without exposing admin credentials.
3. **Local Ollama AI Provider:** A lightweight client wrapper calling `http://localhost:11434/api/generate` with strict timeouts, structured JSON schemas, and zero data leakage.

---

## 4. Reusable Backend APIs & Endpoints

| Capability | Existing Endpoint | Adaptation Required |
|---|---|---|
| **Get Sources & Status** | `GET /api/admin/sources` | Ready as-is (authorized via admin/worker token). |
| **Trigger Source Run** | `POST /api/admin/sources/[id]/ingest` | Ready as-is. |
| **Spider / Browser Hub** | `GET/POST /api/admin/spider/gemini-browser` | Ready as-is. |
| **Save Extracted Job** | `POST /api/admin/jobs` or `POST /api/admin/spider/gemini-browser?action=save_extracted_job` | Ready as-is (saves as DRAFT). |
| **Task Queueing & Leases** | Needs dedicated scoped endpoint: `POST /api/worker/tasks/acquire` & `POST /api/worker/tasks/submit` | Minimum scoped addition modeled on existing `CentralAutomationEngine` / `PersistentQueue`. |

---

## 5. Security Architecture & Threat Model

1. **Decoupled Architecture:** The local PC initiates all connections outbound to Render via HTTPS (`POST /api/worker/*`). No local ports (Ollama `11434`, Playwright debugging `9222`) are exposed to the public internet.
2. **Dedicated Worker Secret:** Worker requests are authenticated using `WORKER_AUTH_TOKEN`. Candidate sessions cannot access worker routes.
3. **Deterministic Human Approval Invariant:** Worker submissions are saved exclusively as `DRAFT` or `PENDING_VERIFICATION`. Only an authenticated admin in the Admin Console can promote a draft to `PUBLISHED`.
4. **Anti-Hallucination Guard:** Extracted text must pass `validateEvidenceQuotes`. Missing fields are strictly marked `UNKNOWN` rather than guessed by AI.
5. **CAPTCHA / Security Gate:** If a government portal presents a Cloudflare challenge, CAPTCHA, or IP block, the worker halts, saves state as `WAITING_FOR_HUMAN`, and notifies the admin. Never attempt to bypass bot challenges.

---

## 6. Implementation Sequence & Plan

- **Step 1:** Complete Phase 1 & 2 Audits (This Audit + Local Hardware Detection Report).
- **Step 2:** Prepare Minimal Implementation Plan & Setup Guide for User Review.
- **Step 3 (Upon Approval):** Implement Scoped Worker API (`src/app/api/worker/tasks/*`) on Backend.
- **Step 4:** Implement Standalone Local Worker Script (`worker/local_spider_worker.ts` or Node/Playwright).
- **Step 5:** Integrate Ollama AI provider (`qwen2.5:1.5b` / `qwen2.5:3b`) with Gemini fallback.
- **Step 6:** End-to-end verification and regression testing.

