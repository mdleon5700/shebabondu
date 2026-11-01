import { JobCircular, CircularDraft } from '@/lib/types';
import { VerificationResult, AdminCorrection } from '@/lib/verification/types';

export type ContentStudioStatus =
  | 'NOT_STARTED'
  | 'BRIEF_CREATED'
  | 'OUTLINE_READY'
  | 'GENERATING'
  | 'DRAFT_CREATED'
  | 'VALIDATING'
  | 'NEEDS_REVISION'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';

export type KeywordCategory =
  | 'primary'
  | 'secondary'
  | 'longtail'
  | 'related'
  | 'bengali'
  | 'english_search'
  | 'organization'
  | 'job_title'
  | 'location'
  | 'application';

export type SearchIntentType =
  | 'informational'
  | 'navigational'
  | 'application'
  | 'eligibility'
  | 'deadline'
  | 'document_download';

export interface KeywordItem {
  id: string;
  keyword: string;
  category: KeywordCategory;
  intent: SearchIntentType;
  inTitle?: boolean;
  inMetaDescription?: boolean;
  usageCount: number;
  isPrimary?: boolean;
}

export interface ContentBrief {
  jobIdOrDraftId: string;
  jobTitle: string;
  organization: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  relatedKeywords: string[];
  searchIntent: SearchIntentType;
  searchIntentSummary: string;
  requiredFacts: {
    vacancies: string;
    deadline: string;
    education: string;
    experience: string;
    age: string;
    salary: string;
    fee: string;
    applicationMethod: string;
    applicationUrl: string;
  };
  importantEligibilityNotes: string[];
  officialSourceLinks: Array<{ label: string; url: string }>;
  suggestedHeadings: string[];
  faqTopics: string[];
  internalLinkOpportunities: Array<{ title: string; url: string; relevanceReason: string }>;
  warnings: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OutlineSection {
  id: string;
  level: 'h1' | 'h2' | 'h3';
  title: string;
  purpose: string;
  suggestedPoints: string[];
  content?: string;
  isCustom?: boolean;
  isLocked?: boolean;
}

export interface ContentOutline {
  briefId: string;
  sections: OutlineSection[];
  generatedAt: string;
  updatedAt: string;
}

export type ContentBlockType =
  | 'heading'
  | 'paragraph'
  | 'rich_text'
  | 'bullet_list'
  | 'numbered_list'
  | 'job_info_table'
  | 'image'
  | 'pdf_viewer'
  | 'notice_box'
  | 'faq_accordion'
  | 'apply_button'
  | 'internal_link'
  | 'external_link'
  | 'divider'
  | 'two_column'
  | 'related_jobs'
  | 'custom_section';

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: any;
  settings: {
    alignment?: 'left' | 'center' | 'right';
    headingLevel?: 'h1' | 'h2' | 'h3';
    isFullWidth?: boolean;
    styleVariant?: 'default' | 'highlight' | 'warning' | 'official' | 'success';
    textColor?: string;
    bgColor?: string;
    padding?: 'sm' | 'md' | 'lg';
  };
}

export interface JobArticle {
  draftId: string;
  title: string;
  subtitle?: string;
  contentBlocks: ContentBlock[];
  bengaliMarkdown: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  faqItems: Array<{ question: string; answer: string }>;
  articleLengthPreset: 'short' | 'standard' | 'detailed';
  generatedAt: string;
  updatedAt: string;
  isAiGenerated: boolean;
  modelUsed?: string;
}

export interface SEOChecklistItem {
  id: string;
  label: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  recommendation: string;
  scoreContribution: number;
}

export interface SEOAnalysis {
  score: number;
  checklist: SEOChecklistItem[];
  primaryKeywordDensity: number;
  primaryKeywordCount: number;
  headingStructureValid: boolean;
  h1Count: number;
  h2Count: number;
  internalLinksCount: number;
  externalLinksCount: number;
  metaTitleLength: number;
  metaDescLength: number;
  wordCount: number;
  readingTimeMinutes: number;
  hasJobPostingSchema: boolean;
}

export interface FactValidationRecord {
  field: string;
  expectedVerifiedValue: any;
  mentionedInText: string;
  status: 'supported' | 'unsupported' | 'conflicting' | 'omitted_valid';
  note?: string;
}

export interface FactValidationResult {
  status: 'FACTUALLY_SUPPORTED' | 'NEEDS_REVIEW' | 'UNSUPPORTED_CLAIM' | 'CONFLICTING_INFORMATION' | 'MISSING_INFORMATION';
  validatedFields: Record<string, FactValidationRecord>;
  unsupportedClaims: string[];
  conflictingClaims: string[];
  omittedFields: string[];
  warnings: string[];
  canProceedToApproval: boolean;
}

export interface BengaliQualityIssue {
  type: 'grammar' | 'spelling' | 'punctuation' | 'repetition' | 'unnatural_english' | 'filler';
  excerpt: string;
  suggestion: string;
  severity: 'high' | 'medium' | 'low';
}

export interface BengaliQualityReport {
  grammarScore: number;
  readabilityScore: number;
  overallScore: number;
  issues: BengaliQualityIssue[];
  suggestions: string[];
  hasUnnaturalEnglishMix: boolean;
}

export interface ContentUniquenessReport {
  internalSimilarityScore: number;
  isDuplicate: boolean;
  duplicateMatches: Array<{
    jobId: string;
    title: string;
    similarityPercentage: number;
    matchedField: string;
  }>;
  method: 'ngram_jaccard_token_hash';
}

export interface InternalLinkRecommendation {
  id: string;
  targetUrl: string;
  anchorText: string;
  targetTitle: string;
  relevanceType: 'category' | 'organization' | 'similar_position' | 'guide';
  relevanceScore: number;
  isApplied: boolean;
}

export interface ContentRevision {
  id: string;
  draftId: string;
  versionNumber: number;
  timestamp: string;
  author: string;
  changeSummary: string;
  articleSnapshot: {
    title: string;
    bengaliMarkdown: string;
    faqItems: Array<{ question: string; answer: string }>;
  };
  seoSnapshot: {
    seoTitle: string;
    seoDescription: string;
    slug: string;
    focusKeyword: string;
    secondaryKeywords: string[];
  };
  blocksSnapshot: ContentBlock[];
}

export interface ContentStudioMetadata {
  seoTitle: string;
  seoDescription: string;
  slug: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  imageAltText?: string;
  robotsDirectives?: string;
}

export interface ContentStudioState {
  draftId: string;
  status: ContentStudioStatus;
  brief?: ContentBrief;
  outline?: ContentOutline;
  article?: JobArticle;
  blocks: ContentBlock[];
  seo: ContentStudioMetadata;
  seoAnalysis?: SEOAnalysis;
  factValidation?: FactValidationResult;
  bengaliQuality?: BengaliQualityReport;
  uniqueness?: ContentUniquenessReport;
  internalLinks: InternalLinkRecommendation[];
  revisions: ContentRevision[];
  currentRevisionId?: string;
  lastSavedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  isPublished?: boolean;
  publishedJobId?: string;
}
