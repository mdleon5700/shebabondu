# UI Modernization Strategic Roadmap
**Chakri Sheba Design System & User Experience Standards**

---

## 1. Core Visual Design Principles

1. **Approved Bangla Dashboard Reference Compliance:**
   - Deep indigo and emerald brand palette (`#006a4e`, `#064e3b`, `#4f46e5`, `#10b981`).
   - Clean, elevated card containers with subtle border treatments (`border-slate-200/90`), rounded radii (`rounded-2xl` to `rounded-3xl`), and refined drop shadows (`shadow-sm`, `shadow-xs`).
2. **Authentic Typography System:**
   - Strict adherence to `SolaimanLipi` font family across all Bangla headings, metrics, tables, and navigation links.
   - Preserved letter-spacing, line-height, and weight hierarchy for flawless Bangla rendering.
3. **Responsive Breakpoint Matrix:**
   - Optimized for Desktop widescreen (`1920px`, `1536px`), standard laptops (`1440px`, `1366px`), tablets (`1024px`, `768px`), and mobile devices (`375px` to `430px`).

---

## 2. Completed Modernization Phases

### Phase 1: Navigation Shell & Layout Calibration
- Implemented collapsible 2-tier sidebar accordion navigation.
- Created off-canvas mobile drawer with backdrop blur and smooth sliding animation.
- Calibrated 1366px balanced navigation header with persistent global search (`Ctrl + K`).

### Phase 2: Unified Hybrid Visual Page Builder
- Constructed 3-panel visual builder architecture:
  - **Left Sidebar:** Elements, Sections, Templates, Layers, Globals, Media.
  - **Center Canvas:** Real-time responsive device switcher (`100%`, `768px`, `375px`), drag/reorder, outline indicators, Undo/Redo stack.
  - **Right Inspector:** Content, SolaimanLipi typography controls, margin/padding layout, brand swatches background, responsive hide/show, custom CSS.
  - **Publish Modal:** Pre-publish SEO checklist audit (Title, Slug, H1, Meta Description, Sections visible).

### Phase 3: Zero Dummy Data & Dashboard Overhaul
- Eliminated all hardcoded stats (`2847`, `48921`, `1245320`, `+12.4%`, `+18.7%`, fake donut slices, fake recent jobs).
- Replaced with live canonical queries against `serverDB`.
- Implemented authentic empty states when collections have zero items.

### Phase 4: Complete Admin User & Candidate Management
- Integrated all 7 candidate lifecycle sub-features:
  1. User Directory (search, filters, status pills).
  2. Profile View & Edit (personal, contact, private notes).
  3. CV Management (education, skills, experience).
  4. Document Vault (photo, NID, certificates preview & verify).
  5. Application Tracking (circular title, fees, status, TrxID).
  6. Saved Jobs (real user bookmarks).
  7. Financial / Wallet Ledger (live balance, manual balance adjustments with mandatory reason & audit log).
