# Complete Legacy UI Audit
**Chakri Sheba Modernization & System Classification**

---

## 1. Audit Framework

In accordance with **Critical Addendum — Legacy UI Modernization, Duplicate System Cleanup & Unified Page Builder**, every administrative component and interface was inspected and classified into five operational categories:

- **A. KEEP:** Working components, useful functionality, correct database integrations, reliable APIs, existing business logic.
- **B. MODERNIZE:** Outdated designs, poor layouts, inconsistent typography, non-responsive interfaces, confusing editing behavior.
- **C. REPLACE:** Obsolete components, broken implementations, architecturally unsuitable legacy editors.
- **D. MERGE:** Duplicate components, duplicate page editors, multiple modules performing the same function.
- **E. REMOVE:** Confirmed unused components, dead UI elements, abandoned duplicate implementations.

---

## 2. Component Classification Register

| Component File | Role / Module | Classification | Modernization & Action Taken |
| :--- | :--- | :---: | :--- |
| `AdminDashboardOverview.tsx` | Main Dashboard Overview | **MODERNIZE** | Redesigned with approved Bangla Dashboard layout, SolaimanLipi font, real KPI counters, dynamic SVG donut chart, and zero dummy data. |
| `AdminLayout.tsx` & `AdminSidebar.tsx` | Admin Shell & Navigation | **MODERNIZE** | Upgraded with 2-tier collapsible accordion navigation, responsive mobile drawer, search shortcut, and SolaimanLipi typography. |
| `AdminHeader.tsx` | Top Navigation Header | **MODERNIZE** | Calibrated 1366px balanced responsive layout, persistent search shortcut (`Ctrl+K`), live status indicator, and quick action drawer. |
| `WebsiteBuilder.tsx` | Page Visual Editor | **REPLACE & MODERNIZE** | Replaced fragmented canvas controls with a unified 3-panel architecture (`BuilderLeftSidebar`, `BuilderRightInspector`, `BuilderPublishModal`). Old bottom canvas buttons retired. |
| `WebsiteCmsSeoManagement.tsx` | CMS & SEO Management | **MERGE & KEEP** | Consolidated into centralized Page Directory, Global Branding (Header/Footer), and Global SEO metadata manager. Page visual editing delegated to `WebsiteBuilder.tsx`. |
| `CandidateManagementHub.tsx` | Candidate Management | **MODERNIZE & KEEP** | Retained 360° candidate inspector, search, filters, and 1-click Teletalk autofill drawer. Eliminated hardcoded academic rolls in favor of real `currentCandidate.education` records. |
| `UniversalUserWorkspace.tsx` | Deep Candidate Profile Modal | **MODERNIZE & KEEP** | Added missing Sub-Feature 5 (`applications`) and Sub-Feature 7 (`wallet`), fixed React hook order violation, and connected manual balance adjustment with mandatory reason and immutable audit log. |
| `UniversalJobWorkspace.tsx` | Circular Creation & Editing | **KEEP** | Preserved full form controls, position tiers, educational requirements, and Teletalk automation bindings. |
| `GeminiBrowserSpiderHub.tsx` | AI Scraping & Automation | **KEEP** | Preserved active spider execution, profile selection, circular extraction, and draft staging. |
| `SourceRegistryManagement.tsx` | Job Scraping Sources | **KEEP** | Preserved source URL registry, schedule intervals, and active status toggling. |
| `FinancialTransactionsLedger.tsx` | Platform Financials | **MODERNIZE & KEEP** | Preserved application transaction tables and challan auditing. Replaced hardcoded `(৬৪%)` and `(৩৬%)` progress bars with dynamic calculated revenue percentages. |
| `OrganizationManagementHub.tsx` | Employer & Company Hub | **KEEP** | Preserved organization directory, company profiles, and employer verification queues. |
| `CouponsRaffleManagement.tsx` | Marketing & Promotions | **KEEP** | Preserved coupon code generator, discount rules, and raffle campaign entries. |
| `SmsNotificationsManagement.tsx` | Direct SMS Dispatcher | **KEEP** | Preserved applicant SMS gateway, template selection, and delivery tracking. |
| `SystemSettingsDiagnostics.tsx` | System Diagnostics | **KEEP** | Preserved backup export, database status checks, and environment configurations. |

