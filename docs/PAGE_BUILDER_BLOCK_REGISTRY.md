# CHAKRI SHEBA — PAGE BUILDER BLOCK REGISTRY (PHASE 1)

> **Document Version:** 1.0.0  
> **Status:** APPROVED REGISTRY SPECIFICATION  
> **Date:** 2026-11-08  

---

## 1. BLOCK TAXONOMY

The Page Builder organizes building blocks into three distinct tiers:

### A. Basic Elements
| Element | ID | Description | Default Properties |
|---|---|---|---|
| **Heading** | `heading` | Title text with semantic level (H1-H6) | Text, Level (H1-H6), Align, Font Size, Color |
| **Paragraph** | `text` | Multi-line body text | Text, Font Size, Line Height, Text Color |
| **Rich Text** | `rich-text` | Formatted HTML content with bold/italic/links | HTML String, Font Size |
| **Image** | `banner-image` | Responsive media element with persistent URL | URL, Alt Text, Fit, Aspect Ratio, Rounded |
| **Button / CTA** | `cta` | Interactive link button | Label, Destination URL, Variant (Primary/Outline/Ghost), Icon |
| **Divider** | `divider` | Horizontal separator | Style (Solid/Dashed), Color, Margin |
| **Spacer** | `spacer` | Vertical whitespace regulator | Height (sm/md/lg/xl) |
| **Quote** | `quote` | Editorial or testimonial pull-quote | Quote Text, Author, Citation |
| **HTML Block** | `custom-html` | Raw HTML/SVG snippet | Sanitized HTML string |

### B. Layout Elements
| Element | ID | Description | Default Properties |
|---|---|---|---|
| **Container** | `container` | Constrained width wrapper | Max-width (`sm`, `md`, `lg`, `full`), Padding |
| **Two-Column** | `columns-2` | 50/50 or asymmetric split layout | Columns: 2, Gap: 4, Alignment |
| **Three-Column**| `columns-3` | 33/33/33 grid layout | Columns: 3, Gap: 4 |
| **Feature Grid**| `features` | Multi-card benefit / feature showcase | Items array with Title, Icon, Description |
| **Accordion/FAQ**| `faq` | Collapsible question & answer panels | Items array with Question & Answer |
| **Workflow** | `how-it-works`| Step-by-step guidance list (১, ২, ৩) | Steps array with Number, Title, Description |
| **Testimonials**| `testimonials`| Candidate / user review cards | Reviews with Name, Role, Rating, Comment |
| **Statistics** | `stats` | KPI counter cards (Total Jobs, Candidates) | Items array with Number, Label, Trend |

### C. Website-Specific Elements (Dynamic Data)
| Element | ID | Dynamic Source | Description |
|---|---|---|---|
| **Job Search Form** | `job-search` | Public search index | Live keyword search bar with district/category filters |
| **Job Listing Feed**| `jobs` | `serverDB.getPublicJobs()` | Live grid of job cards with category filter and limit |
| **Featured Jobs** | `featured-jobs` | Featured flag in database | High-priority circulars with urgent deadline badges |
| **Latest Jobs** | `latest-jobs` | Database sorted by date | Top recently published government notices |
| **Job Category Grid**| `job-categories`| Category database | Ministry, Bank, Railway, Defense, Education grids |
| **Organization List**| `organizations` | `CompanyProfile` collection | Government directorates, ministries, institutions |
| **Career Guides** | `career-guides` | Career guidance articles | Advice on CV writing, viva, exam preparation |
| **Notice Banner** | `announcement` | Platform settings | Emergency recruitment announcement bar |

---

## 2. BLOCK REGISTRY SCHEMA DEFINITION

Each block registered in the builder implements:

```typescript
export interface BlockDefinition {
  id: string;
  name: string;
  category: 'basic' | 'layout' | 'dynamic';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  defaultSection: () => PageSection;
}
```

