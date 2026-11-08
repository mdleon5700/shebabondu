# CHAKRI SHEBA — AI REPAIR & HUMAN APPROVAL POLICY

> **Governance Principle:** Supervised Autonomy (Zero Autonomous Production Writes)

---

## 1. Action Authorization Boundaries

### Category A: Autonomous Operations (No Approval Needed)
- Static code inspection and linting.
- Read-only database model and API mapping.
- Browser QA execution against local development server (`localhost:3000`).
- Branch creation and test patch authoring (`fix/CS-xxxx`).
- Compiling regression evidence and screenshots.

### Category B: Supervised Operations (Mandatory Human Signoff Required)
- Merging any pull request into `main` branch.
- Modifying production database models or schemas.
- Triggering production deployment on Render.
- Altering authentication, session keys, or admin PIN logic.
- Modifying candidate financial balances or transaction ledgers.
- Deleting or deprecating any working public or admin feature.

---

## 2. Approval Expiry & Invalidation Rules
1. **Patch Fingerprint Lock:** Human approval is strictly tied to the SHA-256 hash of the proposed Git commit diff.
2. **Auto-Invalidation:** If the branch is modified after approval was granted, the approval is instantly voided and re-routed to `NEEDS_HUMAN_REVIEW`.
