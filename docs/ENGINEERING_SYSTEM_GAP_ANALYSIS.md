# CHAKRI SHEBA — ENGINEERING SYSTEM GAP ANALYSIS & AUDIT FINDINGS

> **Objective:** Identify architectural, runtime, and infrastructure gaps in the engineering system without false claims.

---

## 1. Investigation of Lease Duration Discrepancy

* **Reported Finding:** In previous documentation, the database lease was reported as 10 minutes, but one heartbeat test output showed 15 minutes.
* **Codebase Investigation:**
  - In `src/lib/db.ts` line 9263:
    ```typescript
    const leaseDurationMs = 10 * 60 * 1000; // 10 minutes lease
    ```
    Upon initial task acquisition via `acquireNextEngineeringTask`, the lease duration is strictly **10 minutes**.
  - In `src/lib/db.ts` line 9294:
    ```typescript
    heartbeatEngineeringTask(taskId: string, workerId: string, extensionMinutes = 10): boolean
    ```
    The heartbeat function supports an optional `extensionMinutes` argument, defaulting to 10 minutes if omitted.
  - In `scripts/test_engineering_api_live.js` line 68, the test script explicitly passed `extensionMinutes: 15` to verify that dynamic parameter overrides function correctly.
  - In `scripts/local_worker_daemon.js` line 77, the runtime worker heartbeat loop runs every 3 minutes with `extensionMinutes: 10`.
* **Resolution & Clarification:**
  - **Standard Lease:** 10 minutes.
  - **Heartbeat Interval:** 3 minutes (re-extending by 10 minutes on each pulse).
  - The test script `scripts/test_engineering_api_live.js` has now been normalized to `extensionMinutes: 10` for complete consistency across tests and documentation.

---

## 2. Core Architectural Gaps Identified

### Gap 1: Automated Local AI (Ollama) Availability
* **Status:** `NOT_IMPLEMENTED` on local PATH.
* **Finding:** While `local_worker_daemon.js` contains hooks for Ollama (`http://127.0.0.1:11434`), `where.exe ollama` confirms Ollama is not installed or running in the local Windows environment.
* **Impact:** The local worker cannot perform autonomous LLM-driven root cause diagnosis without Ollama running locally or falling back to cloud providers (e.g. Gemini API).
* **Current Fallback:** The worker uses deterministic heuristic analyzers, route checkers, and Playwright DOM inspectors, while actual code repairs are prepared by developer/agent sessions.

### Gap 2: Cloud File Persistence vs Local Store
* **Status:** `PARTIALLY_VERIFIED`.
* **Finding:** The platform currently stores all 44 data collections in `src/db/local_store.json`.
* **Impact on Render Production:** Render standard web services have ephemeral filesystems. Any deployment or container restart on Render will reset changes made to `local_store.json` unless:
  1. A persistent Render Disk is mounted at `/var/data` and configured via `CHAKRI_DB_FILE`.
  2. The application is migrated to a remote managed database (PostgreSQL / Supabase / MongoDB).

### Gap 3: Evidence Artifact Storage
* **Status:** `PARTIALLY_VERIFIED`.
* **Finding:** Playwright screenshot evidence is saved locally in `C:\Users\Leon Rahman\.gemini\antigravity\brain\...`.
* **Impact:** Remote systems or external orchestrators (e.g. remote n8n cloud instances) cannot directly view screenshots without an asset upload endpoint (e.g. S3, Cloudflare R2, or serving from an authenticated `/api/admin/media` endpoint).

### Gap 4: Distinction between Audit, QA, and Autonomous Repair
* **Status:** `VERIFIED` with Supervised Human Gate.
* **Finding:**
  - **Read-Only Audit:** Automated (Runs across 10 workstreams in `master_issue_discovery_engine.js`).
  - **Browser QA:** Automated (Playwright headless Chromium in `local_worker_daemon.js`).
  - **Code Repair:** Supervised (Requires branch creation, scoped patch, typecheck gate, and human approval).
  - **Autonomous Mass Rewrites:** Intentionally restricted under the **Supervised Autonomy** rule. The system does not allow arbitrary autonomous write operations to production code without human verification.

