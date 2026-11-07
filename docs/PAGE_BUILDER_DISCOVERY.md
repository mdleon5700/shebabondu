# CHAKRI SHEBA — PAGE BUILDER DISCOVERY REPORT (PHASE 0)

> **Document Version:** 1.0.0  
> **Status:** APPROVED & BASELINE AUDIT  
> **Date:** 2026-11-08  
> **System:** Chakri Sheba Enterprise Next.js App Router  

---

## 1. EXECUTIVE OVERVIEW

This discovery audit investigates the existing Content Management System (CMS), visual page editing capabilities, page storage mechanisms, dynamic routing architecture, and backend APIs across the **Chakri Sheba** codebase.

The goal is to design and implement a **Hybrid Visual + Block + Template Page Builder** that seamlessly extends current components without:
- Breaking existing pages or route behaviors
- Replacing canonical database records (jobs, organizations, categories)
- Overwriting existing font configurations (`SolaimanLipi`) or branding
- Introducing unnecessary heavy dependencies

---

## 2. EXISTING REPOSITORY ARCHITECTURE

| Layer | Technology / Implementation | Details |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Server Components + Client Components where interactive |
| **Language & Typing** | TypeScript (`strict: false` with pre-commit quality gate) | Zero typecheck errors required (`npm run typecheck`) |
| **Styling & Tokens** | Tailwind CSS v3 | Custom scale (`brand`, `bdgreen`, `bdred`, `SolaimanLipi` typography) |
| **Primary Typography** | `SolaimanLipi` | Preloaded WOFF2 fonts (`/fonts/solaimanlipi-normal.woff2`, `/fonts/solaimanlipi-bold.woff2`) |
| **Data Persistence** | `src/lib/db.ts` (`local_store.json`) | In-memory cache + persistent JSON backing store with auto-flush |
| **Dynamic Routing** | `src/app/[...slug]/page.tsx`, `src/app/p/[slug]/page.tsx` | Fallback catch-all for CMS published pages with SSR metadata |
| **Frontend Renderers** | `PublishedPage.tsx`, `CmsPageRenderer.tsx` | Converts `PageRecord.sections` into responsive HTML sections |

---

## 3. CURRENT CMS & BUILDER INVENTORY

### A. Existing Components
1. **`src/components/admin/WebsiteBuilder.tsx` (3,419 lines):**
   - Implements page selection, viewport toggling (desktop, tablet, mobile), and view modes (editor, preview, live).
   - Manages top banner, live navbar and footer integration, section list, inline reordering, section duplication, and deletion.
   - Houses a section property inspector for text, colors, alignments, and padding.
   - Saves drafts (`handleSavePage(false)`) and publishes (`handleSavePage(true)`).
   - Contains version history modal with restore capabilities (`handleRestoreRevision`).

2. **`src/components/admin/WebsiteCmsSeoManagement.tsx` (1,869 lines):**
   - Page Directory (listing, creating, searching, status badges).
   - Global SEO configuration (Meta title, meta description, OpenGraph, JSON-LD schema, GA4).
   - Global Header & Footer branding (site logo, announcement bar, WhatsApp widget, social links).
   - Page revisions & rollback manager.

3. **`src/components/admin/MediaLibraryManager.tsx` (566 lines):**
   - Media storage, image search, mime filtering, image replacement, alt-text & caption editing, copy URL.
   - Backed by persistent storage in `serverDB`.

---

## 4. DATABASE MODELS & SCHEMA AUDIT

Located in `src/lib/types.ts`:

```typescript
export type SectionType = 
  | 'hero' 
  | 'features' 
  | 'jobs' 
  | 'cta' 
  | 'faq' 
  | 'text' 
  | 'stats' 
  | 'how-it-works' 
  | 'testimonials' 
  | 'banner-image' 
  | 'media-gallery';

export interface SectionStyle {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  titleFontSize?: string;
  subtitleFontSize?: string;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  imageWidth?: string;
  imageHeight?: string;
  imageFit?: string;
  imageBorderRadius?: string;
  imageAlignment?: string;
  paddingY?: 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'full';
  columns?: 1 | 2 | 3 | 4;
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: 'none' | 'md' | 'xl' | '2xl';
}

export interface PageSection {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  content: Record<string, any>;
  style: SectionStyle;
  isVisible: boolean;
}

export interface PageRevision {
  id: string;
  version: number;
  savedAt: string;
  savedBy: string;
  status: 'draft' | 'published';
  sections: PageSection[];
  notes?: string;
}

export interface PageRecord {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  status: 'published' | 'draft' | 'archived';
  version: number;
  isSystemPage?: boolean;
  sections: PageSection[];
  revisions: PageRevision[];
  updatedAt: string;
  publishedAt?: string;
  publishedContent?: {
    useOnCanonicalPath?: boolean;
    slug: string;
    title: string;
    metaTitle: string;
    metaDescription: string;
    sections: PageSection[];
    publishedAt: string;
  };
}
```

---

## 5. EXISTING BACKEND API ENDPOINTS

| Endpoint | Methods | Handler Path | Description |
|---|---|---|---|
| `/api/admin/pages` | `GET`, `POST` | `src/app/api/admin/pages/route.ts` | List all pages, create new page record with initial hero section |
| `/api/admin/pages/[id]` | `GET`, `PUT`, `DELETE` | `src/app/api/admin/pages/[id]/route.ts` | Retrieve page document, update sections/draft/publish, soft/hard delete |
| `/api/admin/media` | `GET`, `POST`, `DELETE` | `src/app/api/admin/media/route.ts` | Media library fetch, persistent image upload, media metadata update |
| `/api/platform/settings` | `GET`, `PUT` | `src/app/api/platform/settings/route.ts` | Global branding, header/footer configuration, SEO defaults |

---

## 6. DYNAMIC DATABASE BINDING AUDIT

Chakri Sheba contains canonical database collections:
- `Jobs`: 76+ live government & autonomous circulars (`serverDB.getJobs()`, `serverDB.getPublicJobs()`).
- `Candidates`: Registered job seekers (`serverDB.getAllCandidates()`).
- `Applications`: Order submissions & tracking IDs (`serverDB.getAllApplications()`).
- `JobSources`: Crawler sources (`serverDB.getJobSources()`).

**Protection Rule Verified:**
When dynamic template blocks (e.g. `Job Listing`, `Featured Jobs`, `Job Category Grid`, `Job Details`) are rendered in the Page Builder, they connect directly to `serverDB` APIs or query props. Static placeholder text will NEVER replace canonical database records.

---

## 7. GAPS & EXTENSION STRATEGY

1. **Three-Panel UI Organization:**
   - Currently, `WebsiteBuilder.tsx` is structured as a two-column layout (Canvas + Right Inspector), with section buttons stacked at the bottom of the canvas.
   - **Enhancement:** Implement a true **Three-Panel Professional Layout**:
     - **Left Sidebar:** Elements (Basic, Layout, Website-Specific), Sections (Pre-designed categories), Templates (Homepage, About, Contact, Job Details, Category, etc.), Layers (Hierarchical section/block tree), Global Components, and Media Library Picker.
     - **Center Panel:** Live Interactive Visual Canvas with responsive container, outline selection, drag-and-drop / reordering controls, inline quick actions, and Undo/Redo history stack.
     - **Right Sidebar:** Advanced Property Inspector organized into tabs: Content, Typography (SolaimanLipi), Layout, Spacing, Background & Borders, Responsive Visibility, and Advanced CSS.

2. **Template Library:**
   - Add pre-configured layout templates for:
     - Homepage (Government Job Portal Hero + Category Grid + Latest Jobs Feed + Workflow + FAQ)
     - About Us (Story, Mission, Leadership, Statistics, Trust Badges)
     - Contact Us (Contact Channels, Office Location, Inquiries, Hotline)
     - Career Guides (Article Layout, Reading Progress, Related Guides, Author)
     - Job Details (Dynamic Layout slots bound to canonical job records)
     - Job Category / Location Landing Pages

3. **Global Component Warning & Safe Editing:**
   - When modifying Header or Footer via Chrome settings, display a clear warning modal indicating that changes affect all pages.

4. **SEO & Publishing Validation:**
   - Add pre-publish validation checklist (checking H1 presence, meta title length, meta description, valid slug, image alt tags) with clear pass/fail status before finalizing publication.

---

## 8. NEXT STEP (PHASE 1)
Proceed to **Phase 1: Architecture & Block Registry Definition**, formalizing the element catalog, template schemas, and state architecture.
