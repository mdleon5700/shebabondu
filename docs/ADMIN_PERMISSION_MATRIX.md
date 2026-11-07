# Admin Permission Matrix (RBAC)
**Chakri Sheba Governance & Access Control**

---

## 1. Role Definitions

| Role Code | Role Name (Bangla) | Description |
| :--- | :--- | :--- |
| **`SUPER_ADMIN`** | সুপার অ্যাডমিন | Full, unrestricted authority across platform settings, user deletion, wallet adjustments, and database backups. |
| **`ADMIN`** | অ্যাডমিন | Operational administrative control over circulars, candidate profiles, verification, and visual page builder. |
| **`MODERATOR`** | মডারেটর | Content review, job circular verification, spider draft approval, and candidate document inspection. |
| **`FINANCE`** | হিসাবরক্ষক | Financial transaction audit, payment verification, coupon/raffle management, and invoice tracking. |
| **`SUPPORT`** | কাস্টমার সাপোর্ট | Read-only candidate inspection, direct SMS communication, and password reset assistance. |

---

## 2. Capability Matrix

| Permission Key | Description | `SUPER_ADMIN` | `ADMIN` | `MODERATOR` | `FINANCE` | `SUPPORT` |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `jobs.create` | Create & publish circulars | ✅ | ✅ | ❌ | ❌ | ❌ |
| `jobs.edit` | Edit job specifications & deadlines | ✅ | ✅ | ✅ | ❌ | ❌ |
| `jobs.delete` | Delete or archive circulars | ✅ | ✅ | ❌ | ❌ | ❌ |
| `spider.run` | Execute Gemini & browser scrapers | ✅ | ✅ | ✅ | ❌ | ❌ |
| `spider.configure` | Add/modify job scraping sources | ✅ | ✅ | ❌ | ❌ | ❌ |
| `candidates.view` | View candidate directory & profiles | ✅ | ✅ | ✅ | ✅ | ✅ |
| `candidates.edit` | Modify candidate personal & CV details | ✅ | ✅ | ❌ | ❌ | ❌ |
| `candidates.verify` | Approve/reject candidate documents | ✅ | ✅ | ✅ | ❌ | ❌ |
| `candidates.suspend` | Suspend or ban candidate accounts | ✅ | ✅ | ❌ | ❌ | ❌ |
| `candidates.delete` | Permanently delete candidate profiles | ✅ | ❌ | ❌ | ❌ | ❌ |
| `wallet.view` | Inspect wallet balances & ledger | ✅ | ✅ | ❌ | ✅ | ❌ |
| `wallet.adjust` | Manual balance credit/debit adjustment | ✅ | ✅ | ❌ | ✅ | ❌ |
| `cms.builder` | Hybrid Visual + Block Page Builder | ✅ | ✅ | ❌ | ❌ | ❌ |
| `cms.publish` | Live page publishing & revision restore | ✅ | ✅ | ❌ | ❌ | ❌ |
| `audit.view` | View immutable system audit logs | ✅ | ✅ | ❌ | ❌ | ❌ |
| `system.backup` | Export database & system diagnostics | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 3. Enforcement & Verification

- **API Layer:** Enforced via `getServerSession(req)` and `AdminGovernanceRbac.authorizeRequest(...)`.
- **UI Layer:** Enforced in `AdminSidebar.tsx` and module headers by conditionally rendering action triggers according to session role claims.
- **Fail-Safe Fallback:** All destructive actions (delete candidate, permanent job removal, balance reduction) prompt for secondary confirmation and log the acting `adminId` to `serverDB.recordAdminAudit(...)`.
