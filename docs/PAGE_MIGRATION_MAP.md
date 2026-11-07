# Complete Page Migration Map
**Chakri Sheba 77 Public Pages & Admin Route Directory**

---

## 1. Public Website Pages (77 Total)

The Chakri Sheba public web application contains 77 distinct public and dynamic page routes. Every page is mapped to its Builder Template, data backing store, and rendering mode:

| Route Pattern | Category | Template Type | Backing Data Store |
| :--- | :--- | :--- | :--- |
| `/` | Core | Homepage Standard | `serverDB.getJobs()`, `serverDB.getCategories()` |
| `/jobs` | Jobs | Job Directory Listing | `serverDB.getJobs()` |
| `/jobs/[id]` | Jobs | Dynamic Job Circular Details | `serverDB.getJobById(id)` |
| `/jobs/government` | Jobs | Category Listing | `serverDB.getJobs()` (gov filter) |
| `/jobs/bank` | Jobs | Category Listing | `serverDB.getJobs()` (bank filter) |
| `/jobs/defence` | Jobs | Category Listing | `serverDB.getJobs()` (defence filter) |
| `/jobs/railway` | Jobs | Category Listing | `serverDB.getJobs()` (railway filter) |
| `/jobs/district/[district]` | Jobs | District Geo Filter | `serverDB.getJobs()` (district filter) |
| `/jobs/division/[division]` | Jobs | Division Geo Filter | `serverDB.getJobs()` (division filter) |
| `/about-us` | CMS | About Us Template | `serverDB.getPageBySlug('about-us')` |
| `/contact-us` | CMS | Contact Us Template | `serverDB.getPageBySlug('contact-us')` |
| `/privacy-policy` | CMS | Standard Legal CMS | `serverDB.getPageBySlug('privacy-policy')` |
| `/terms-of-service` | CMS | Standard Legal CMS | `serverDB.getPageBySlug('terms-of-service')` |
| `/faq` | Support | FAQ Accordion Template | `serverDB.getPageBySlug('faq')` |
| `/application/apply/[jobId]` | Flow | Job Application Flow | `serverDB.getJobById(jobId)` |
| `/application/success/[appId]` | Flow | Confirmation & Receipt | `serverDB.getApplicationById(appId)` |
| `/dashboard` | User Portal | Candidate Dashboard | `serverDB.getCandidateById(session.id)` |
| `/dashboard/profile` | User Portal | Candidate Profile Vault | `serverDB.getCandidateById(session.id)` |
| `/dashboard/applications` | User Portal | User Applications List | `serverDB.getApplications(session.id)` |
| `/dashboard/saved-jobs` | User Portal | User Bookmarks List | `serverDB.getSavedJobs(session.id)` |
| `/dashboard/wallet` | User Portal | Candidate Wallet & Top-up | `serverDB.getTransactions(session.id)` |
| *[...56 additional categorized routes]* | Various | Mapped via Dynamic Route Registry | `serverDB` |

---

## 2. Administrative Control Tabs (48 Total)

Managed via `src/app/admin/page.tsx`:
1. `dashboard`: Main KPI Dashboard Overview
2. `circulars`: Circular Management Directory
3. `create-circular`: Circular Creation Workspace
4. `imported-drafts`: Scraped Circular Review Queue
5. `gemini-browser-spider`: Gemini AI Browser Scraper
6. `source-monitoring`: Spider Sources Registry
7. `candidate-directory`: Candidate Directory & Vault
8. `candidate-details`: Candidate 360 Inspection
9. `account-status`: Account Moderation & Suspension
10. `builder`: Hybrid Visual + Block Page Builder
11. `pages-sections`: CMS Pages Directory
12. `seo-meta`: Global SEO & Social Cards
13. `header-footer`: Global Header & Footer Customizer
14. `transactions`: Platform Financial Ledger
15. `company-directory`: Employer & Organization Directory
16. *[...33 additional operational modules]*
