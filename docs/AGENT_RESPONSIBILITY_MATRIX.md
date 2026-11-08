# CHAKRI SHEBA — AGENT RESPONSIBILITY & CAPABILITY MATRIX

> **Specification:** 8 Distinct, Independently Testable Engineering Agents  
> **Status:** Architecture Blueprint

---

## 1. Agent Classification Matrix

| Agent ID | Agent Role | Execution Target | Default Permission | Key Responsibilities |
|---|---|---|---|---|
| **Agent 1** | **Master Orchestrator** | n8n Core Engine | Read/Write (Tasks only) | Task classification, priority routing, dependency tracking, lease management, approval escalation, retry handling. |
| **Agent 2** | **Code Audit Agent** | Local Worker / Node | **Read-Only** | Route discovery, dead code detection, broken import scanning, Next.js page/API consistency checks. |
| **Agent 3** | **Database & API Audit Agent** | Local Worker / Node | **Read-Only** | Field consistency between Admin and User panels, orphaned records, schema integrity, JSON consistency. |
| **Agent 4** | **Browser QA Agent** | Local Worker (Playwright) | **Isolated Execution** | End-to-end browser workflows (registration, login, profile edit, application, document vault, mobile viewports), screenshot capture. |
| **Agent 5** | **Root Cause Analysis Agent** | Local Ollama / Gemini | **Read-Only** | Stack trace dissection, regression classification, minimal safe patch recommendation. |
| **Agent 6** | **Repair Agent** | Local Git Sandbox | **Branch-Only Write** | Creates isolated branch (`fix/CS-xxxx`), generates scoped diffs, enforces coding standards without production access. |
| **Agent 7** | **Regression Agent** | Local Worker (Playwright/Jest) | **Isolated Execution** | Runs full test suite (`npm run typecheck`, E2E specs) on repaired branch to prove zero regressions. |
| **Agent 8** | **Release Readiness Agent** | n8n / GitHub API | **Read-Only Gate** | Compiles release audit report, checks PR diffs, verifies rollback plan, awaits human signoff. |

---

## 2. Supervised Authority Boundaries

```
[READ-ONLY / AUTONOMOUS]                 [HUMAN APPROVAL MANDATORY]
├── Codebase Static Analysis              ├── Merging to `main` branch
├── Browser E2E Test Execution            ├── Production deployment to Render
├── Database Relationship Auditing       ├── Database schema mutations
├── Discrepancy Reporting                 ├── Modifying authentication / RBAC
└── Patch Scaffolding in Branch           └── Altering financial ledger balances
```
