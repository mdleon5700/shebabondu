const fs = require("fs");
const path = require("path");
const typesFile = path.join(__dirname, "..", "src", "lib", "types.ts");
let content = fs.readFileSync(typesFile, "utf8");

if (!content.includes("export interface PageRecord")) {
  const extra = `
// ==========================================
// WEBSITE BUILDER (ELEMENTOR-LIKE) TYPES
// ==========================================
export type SectionType = 'hero' | 'features' | 'jobs' | 'cta' | 'faq' | 'text' | 'stats';

export interface SectionStyle {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
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
}

// ==========================================
// JOB SOURCES & INGESTION DRAFTS TYPES
// ==========================================
export interface JobSource {
  id: string;
  name: string;
  sourceUrl: string;
  type: 'official_portal' | 'ministry' | 'newspaper' | 'direct_employer';
  fetchStatus: 'active' | 'syncing' | 'error';
  lastFetchedAt: string;
  autoSync: boolean;
}

export interface CircularDraft {
  id: string;
  sourceName: string;
  sourceUrl: string;
  extractedTitle: string;
  extractedOrg: string;
  category: 'govt' | 'bank' | 'railway' | 'defense' | 'teacher' | 'ngo' | 'private' | 'health';
  grade?: string;
  deadline: string;
  vacancies: number;
  minEducation: string;
  salary: string;
  govtFee: number;
  confidenceScore: number;
  duplicateDetected: boolean;
  status: 'pending_review' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
}

// ==========================================
// PRIVATE COMPANY / EMPLOYER ATS TYPES
// ==========================================
export interface CompanyProfile {
  id: string;
  name: string;
  nameBn?: string;
  logo?: string;
  industry: string;
  district: string;
  verified: boolean;
  contactEmail: string;
  contactPhone: string;
  activeJobsCount: number;
  createdAt: string;
}

export interface CompanyApplication {
  id: string;
  companyId: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidatePhone: string;
  candidateEmail: string;
  cvUrl?: string;
  status: 'applied' | 'shortlisted' | 'interview_scheduled' | 'rejected' | 'hired';
  interviewDate?: string;
  notes?: string;
  appliedAt: string;
}
`;
  fs.writeFileSync(typesFile, content + extra, "utf8");
  console.log("Appended new types to types.ts successfully");
} else {
  console.log("Types already present");
}
