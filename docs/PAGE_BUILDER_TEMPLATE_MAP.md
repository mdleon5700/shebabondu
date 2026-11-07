# CHAKRI SHEBA — PAGE BUILDER TEMPLATE MAP (PHASE 1)

> **Document Version:** 1.0.0  
> **Status:** APPROVED TEMPLATE SPECIFICATION  
> **Date:** 2026-11-08  

---

## 1. PRESET PAGE TEMPLATES CATALOG

The Builder provides full-page templates that assemble pre-configured sections:

| Template Name | Target Page Types | Included Sections | Dynamic Bindings |
|---|---|---|---|
| **১. হোমপেজ স্ট্যান্ডার্ড (Homepage Standard)** | `/`, `/home` | Hero Banner, Live Job Search, Featured Circulars, Category Grid, How-it-Works, Candidate Testimonials, Platform Stats, FAQ | Canonical `Jobs`, `Categories`, `Stats` |
| **২. আমাদের সম্পর্কে (About Us)** | `/about-us` | About Hero, Our Mission & Vision, Service Guarantees, Verified Statistics, Leadership Team, Trust Badges | Platform Settings |
| **৩. যোগাযোগ ও সহায়তা (Contact Us)** | `/contact-us` | Contact Hero, Direct Channels (WhatsApp/Hotline), Office Map/Address, Inquiries Form, Operational Hours | Platform Settings Contact |
| **৪. ক্যারিয়ার গাইড হাব (Career Guide Hub)** | `/career-guides` | Career Hero, Featured Guides Grid (CV, Viva, Exam), Recommended Reading, Free Resources CTA | Career Guide Articles |
| **৫. ক্যাটাগরি ল্যান্ডিং (Category Landing)** | `/categories/[slug]` | Category Title Hero, Live Circulars Filtered by Category, Eligibility Notice, FAQ for Category | Canonical `Jobs` (filtered by Category) |
| **৬. প্রতিষ্ঠান প্রোফাইল (Organization Profile)** | `/organizations/[slug]`| Organization Logo & Info, Active Circulars, Historical Notices, Application Links | Canonical `CompanyProfile` + `Jobs` |
| **৭. সার্কুলার বিস্তারিত (Dynamic Job Details)** | `/jobs/[id]` | Job Title & Metadata, Organization Info, Positions Table, Salary Scale, Age & Eligibility, Official PDF Circular Viewer, Apply Button CTA | Canonical `JobCircular` Record |
| **৮. কাস্টম ল্যান্ডিং পেজ (Custom Landing)** | Any new slug (e.g. `/scholarship`) | Clean Container, Hero Section, Feature Highlights, CTA Box | Administrator Content |

---

## 2. TEMPLATE INVOCATION PROTOCOL

1. Administrators select a template from the **Left Sidebar -> Templates** tab.
2. The Builder displays a confirmation modal:
   > *"এই টেমপ্লেটটি প্রয়োগ করলে বর্তমান পৃষ্ঠার সেকশনগুলো প্রতিস্থাপিত হবে। আপনি কি নিশ্চিত?"*
3. The existing page state is pushed to the **Undo Stack** before applying the template.
4. If the page is a dynamic template (e.g. Job Details), canonical data variables are preserved.

