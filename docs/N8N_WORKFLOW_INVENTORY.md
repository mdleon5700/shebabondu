# CHAKRI SHEBA — N8N WORKFLOW INVENTORY (8 CORE WORKFLOWS)

> **Specification:** Complete Orchestration Architecture for Chakri Sheba

---

## 1. Core Workflow Catalog

| Workflow ID | Workflow Name | Trigger | Actions & Capabilities |
|---|---|---|---|
| **Workflow A** | **Master Engineering Controller** | Webhook / API | Validates incoming payloads, deduplicates tasks, assigns agents, manages leases, aggregates final summaries. |
| **Workflow B** | **Scheduled System Audit** | Cron (Every 4 hours) | Read-only scan of 104 frontend pages and 161 API routes, health endpoints verification, error registry updates. |
| **Workflow C** | **User/Admin Synchronization Audit** | Cron (Twice daily) | Runs automated 10-way bidirectional parity check between Candidate and Admin panels, reports stale caches. |
| **Workflow D** | **Browser QA Test Suite** | Webhook / Push | Dispatches Playwright test scenarios to Local PC Worker, collects visual screenshots and console logs. |
| **Workflow E** | **Bug Diagnosis & Repair Pipeline** | Error Alert Trigger | Analyzes failed tasks, recommends smallest surgical patch, scaffolds fix in isolated Git branch (`fix/CS-xxxx`). |
| **Workflow F** | **Human Approval Gate** | High-Priority Trigger | Formats rich approval payload (files changed, risk tier, regression results), waits for Super Admin decision. |
| **Workflow G** | **Regression & Release Readiness** | Pre-Release Trigger | Executes `npm run typecheck` and full Playwright regression suite, verifies rollback feasibility. |
| **Workflow H** | **Notifications & Worker Recovery** | State Change Listener | Dispatches Telegram/Discord/Email notifications, detects worker disconnections, reclaims expired leases. |
