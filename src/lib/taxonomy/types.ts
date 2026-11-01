/**
 * CHAKRI SHEBA (চাকরি সেবা) — CENTRAL JOB TAXONOMY & CATEGORY TYPES
 * Step 06: Production Classification & Taxonomy Architecture
 */

export interface CategoryRecord {
  id: string;
  name_bn: string;
  name_en: string;
  slug: string;
  description_bn: string;
  description_en: string;
  parent_id: string | null;
  icon: string;
  image: string | null;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  seo_title: string;
  seo_description: string;
  canonical_url: string;
  created_at: string;
  updated_at: string;
  // Computed runtime properties
  job_count?: number;
  children?: CategoryRecord[];
}

export type OrganizationType =
  | 'government'
  | 'autonomous_government'
  | 'state_owned'
  | 'private_company'
  | 'private_bank'
  | 'public_bank'
  | 'ngo'
  | 'international_org'
  | 'educational_institution'
  | 'healthcare_institution'
  | 'other';

export type JobType =
  | 'full_time'
  | 'part_time'
  | 'contractual'
  | 'temporary'
  | 'internship'
  | 'freelance'
  | 'project_based'
  | 'apprenticeship';

export type EducationLevel =
  | 'jsc'
  | 'ssc'
  | 'hsc'
  | 'diploma'
  | 'bachelor'
  | 'honours'
  | 'masters'
  | 'phd'
  | 'professional'
  | 'other';

export type ExperienceLevel =
  | 'freshers'
  | 'no_experience'
  | '1_plus'
  | '2_plus'
  | '3_plus'
  | '5_plus'
  | 'not_specified';

export type ApplicationStatus =
  | 'open'
  | 'closing_soon'
  | 'closed';

export type LocationDivision =
  | 'DHAKA'
  | 'CHATTOGRAM'
  | 'RAJSHAHI'
  | 'KHULNA'
  | 'BARISHAL'
  | 'SYLHET'
  | 'RANGPUR'
  | 'MYMENSINGH'
  | 'ALL_BD';

export interface JobTaxonomyClassification {
  primaryCategory: string; // Category ID or key
  categorySlug: string;
  subcategories: string[];
  organizationType: OrganizationType;
  jobType: JobType;
  division: LocationDivision;
  district?: string;
  upazila?: string;
  educationLevel: EducationLevel;
  experienceLevel: ExperienceLevel;
  salaryType: 'disclosed' | 'negotiable' | 'not_disclosed';
  salaryMin?: number;
  salaryMax?: number;
  applicationStatus: ApplicationStatus;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  needsReview: boolean;
  evidenceNotes?: string;
}

export interface CategoryValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
