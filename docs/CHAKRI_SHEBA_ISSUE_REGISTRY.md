# CHAKRI SHEBA — ISSUE & DEFECT REGISTRY

> **Governance:** Zero-tolerance for unverified assertions. Every item must be reproduced with terminal/browser evidence.

---

## 1. Prioritized Issue Queue

| ID | Priority | Module | Summary / Description | Reproduction Status | Root Cause | Fix Status |
|---|---|---|---|---|---|---|
| **ISSUE-01** | **P1** | **Session / Hydration** | User reported: In certain scenarios after login, page refresh displays login or desyncs navbar | 🔍 Under Investigation in Phase 2 | Synchronous client storage vs cookie verification timing | ⏳ Pending Phase 2 Walkthrough |
| **ISSUE-02** | **P2** | **Notifications** | Live SMS Gateway currently uses mock sender when live gateway API keys are unconfigured | ℹ️ Known Configuration Constraint | Missing production SMS gateway credentials in `.env` | 🛡️ Safe fallback to in-app alerts active |
| **ISSUE-03** | **P2** | **Job Ingestion** | In manual job entry, users entering non-standard URL formats trigger validation errors | ✅ Verified & Guarded | Strict URL validation regex in API | 🟢 Fixed in earlier patch |
| **ISSUE-04** | **P3** | **Responsive Design** | Admin table horizontal scroll on small mobile viewports (<375px) | 🔍 Monitored | Large multi-column data tables | 🟢 Responsive drawer and scroll container verified |

---

## 2. Maintenance Rules
- Never close an issue without real browser or automated test verification.
- Every fix must be accompanied by regression test coverage.
