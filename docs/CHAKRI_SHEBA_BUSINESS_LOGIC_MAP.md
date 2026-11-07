# CHAKRI SHEBA — BUSINESS LOGIC ARCHITECTURE MAP

> **Core Value:** Chakri Sheba is a permanently free job platform dedicated to providing 100% accurate, verified government and private job information and application assistance to Bangladeshi jobseekers without subscriptions or paywalls.

---

## 1. Core Workflow State Transitions

### Workflow A: Candidate Registration & Authentication
- **Trigger:** Guest visits `/register` and submits name, phone, email, password.
- **Input:** `name`, `phone` (11-digit Bangladeshi number), `email` (valid RFC format), `password` (min 6 chars).
- **Validation:** Unique phone and email checks against `serverDB.getCandidates()`.
- **Processing:** Hashing password, creating session token (`cs_session_token`).
- **Database Operation:** Saves to `candidates` collection in `local_store.json`.
- **Output:** HTTP 200 with user profile; cookie set in response; redirect to `/dashboard`.
- **Permissions:** Public / Guest.
- **State Transition:** `UNAUTHENTICATED (Guest)` $\to$ `AUTHENTICATED (Candidate)`.

---

### Workflow B: Job Discovery, Ingestion & Verification
- **Trigger:** Admin clicks "টেলিটক ও লাইভ সিঙ্ক শুরু করুন" in Admin Spider Hub or periodic background worker.
- **Input:** Target source (`teletalk-alljobs`, `bpsc-portal`, etc.), limit parameter.
- **Processing:**
  1. Requests `https://alljobs.teletalk.com.bd/api/v1/govt-jobs/org-list`.
  2. For each active government organization, fetches `public-details?id=...`.
  3. Maps Bengali categories, infers position grades and government application fees.
  4. Generates high-res social SVG featured image banner.
  5. Computes deadline in Bengali and days remaining.
- **Database Operation:** Saves or updates `jobs` collection via `serverDB.saveJob()`.
- **Moderation Guard:**
  - If `isAutoPublish: true`: Status set to `PUBLISHED` (immediately live).
  - If `isAutoPublish: false`: Status set to `DRAFT` (queued for admin editorial approval).
- **Permissions:** Admin (`x-admin-secret` / `cs_session_token`).

---

### Workflow C: Job Application Assistance
- **Trigger:** Authenticated candidate views job at `/jobs/[id]` and clicks "আবেদন করুন" (Apply Assistance).
- **Input:** Candidate ID, Job ID, Position ID, uploaded documents, applicant notes.
- **Validation:** Candidate must be logged in; required documents (NID, photo) must exist.
- **Processing:** Generates unique tracking ID; assigns application to verification queue.
- **Database Operation:** Appends record to `applications` collection in `local_store.json`.
- **Output:** Application confirmation modal, SMS notification payload, dashboard tracking link.
- **Permissions:** Authenticated Candidate.
- **State Transition:** `DRAFT` $\to$ `SUBMITTED` $\to$ `PROCESSING` $\to$ `COMPLETED`.

---

### Workflow D: Website Builder & Live CMS
- **Trigger:** Admin alters homepage hero, banner, menu links, auth buttons, or footer.
- **Input:** JSON payload of section configurations and platform chrome settings.
- **Validation:** Whitelist schema check in `src/lib/types.ts`.
- **Processing:** Updates in-memory store, triggers Next.js path revalidation (`revalidatePath('/')`).
- **Database Operation:** Persists to `pages['home']` and `platformSettings` in `local_store.json`.
- **Output:** Immediate live reflection on public pages without restart.
- **Permissions:** Admin.
