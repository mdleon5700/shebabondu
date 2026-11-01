/**
 * Chakri Sheba - Step 03 Job Verification & AI Intelligence System Types
 */
import { HtmlPdfComparison, PdfExtractedCircular } from '@/lib/types';

export type VerificationStatus =
  | 'PENDING_VERIFICATION'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'VERIFIED_WITH_WARNINGS'
  | 'NEEDS_MANUAL_REVIEW'
  | 'CONFLICT_DETECTED'
  | 'INSUFFICIENT_EVIDENCE'
  | 'AI_FAILED'
  | 'VERIFICATION_FAILED'
  | 'REJECTED';

export type ConfidenceBand = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';

export type SourceAuthorityLevel = 1 | 2 | 3 | 4;

export interface SourceAuthorityResult {
  level: SourceAuthorityLevel;
  domain: string;
  isOfficialDomain: boolean;
  authorityLabel: string;
  redirectDetected: boolean;
  redirectUrl?: string;
  score: number;
  notes?: string;
}

export type DocumentValidationStatus =
  | 'Available'
  | 'Downloaded'
  | 'Valid PDF'
  | 'Text Extracted'
  | 'OCR Required'
  | 'Extraction Failed'
  | 'Invalid Document'
  | 'Unavailable'
  | 'Needs Manual Review';

export interface DocumentValidationResult {
  status: DocumentValidationStatus;
  isValidPdf: boolean;
  checksumSha256?: string;
  pageCount: number;
  requiresOcr: boolean;
  textCharCount: number;
  warnings: string[];
}

export type FieldVerificationStatus =
  | 'VERIFIED'
  | 'SUPPORTED_BY_EVIDENCE'
  | 'PARTIALLY_SUPPORTED'
  | 'CONFLICTING'
  | 'UNVERIFIED'
  | 'NOT_FOUND'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'AI_INFERRED';

export interface FieldVerificationRecord<T = any> {
  field: string;
  extractedValue: T;
  normalizedValue?: T;
  originalText?: string;
  sourceType: 'HTML' | 'PDF' | 'AI' | 'ADMIN';
  sourceUrl?: string;
  pageNumber?: number;
  evidenceSnippet?: string;
  verificationStatus: FieldVerificationStatus;
  confidence: number;
  reviewRequired: boolean;
  conflictReason?: string;
}

export interface BengaliAgeCondition {
  minAge?: number;
  maxAge?: number;
  relaxationCondition?: string;
  referenceDate?: string;
  rawText?: string;
  isSupported: boolean;
}

export interface BengaliEducationCondition {
  degree?: string;
  subject?: string;
  minimumCgpa?: string;
  division?: string;
  isSupported: boolean;
  rawText?: string;
}

export interface BengaliExperienceCondition {
  requiredYears?: number;
  isFresherAllowed: boolean;
  preferredOnly: boolean;
  isSupported: boolean;
  rawText?: string;
}

export interface BengaliEligibilityAnalysis {
  age: BengaliAgeCondition;
  education: BengaliEducationCondition;
  experience: BengaliExperienceCondition;
  quotaDetails?: string[];
}

export interface GeminiVerificationResult {
  success: boolean;
  modelUsed: string;
  promptVersion: string;
  durationMs: number;
  bengaliExplanation: string;
  detectedIssues: string[];
  supportedClaims: string[];
  unsupportedClaims: string[];
  eligibilityAnalysis?: BengaliEligibilityAnalysis;
  aiConfidence: number;
  rawResponseText?: string;
  tokenUsage?: {
    promptTokens: number;
    candidateTokens: number;
    totalTokens: number;
  };
  error?: string;
}

export interface AdminCorrection {
  id: string;
  draftId: string;
  field: string;
  previousValue: any;
  correctedValue: any;
  correctedBy: string;
  correctedAt: string;
  reason: string;
}

export interface AIUsageLog {
  id: string;
  draftId?: string;
  promptId: string;
  promptVersion: string;
  model: string;
  requestTimestamp: string;
  durationMs: number;
  status: 'success' | 'failed' | 'timeout' | 'rate_limited';
  promptTokens: number;
  candidateTokens: number;
  totalTokens: number;
  estimatedCostBdt: number;
  errorSummary?: string;
}

export interface VerificationResult {
  draftId: string;
  sourceId?: string;
  verifiedAt: string;
  status: VerificationStatus;
  confidenceScore: number;
  confidenceBand: ConfidenceBand;
  confidenceReasons: string[];
  sourceAuthority: SourceAuthorityResult;
  documentValidation: DocumentValidationResult;
  htmlPdfComparison?: HtmlPdfComparison;
  fields: Record<string, FieldVerificationRecord>;
  geminiVerification?: GeminiVerificationResult;
  eligibility?: BengaliEligibilityAnalysis;
  isCancellationNotice: boolean;
  isUpdateProposal: boolean;
  unresolvedWarnings: string[];
  bengaliSummary: string;
  scoreBreakdown?: {
    authorityScore: number;
    documentScore: number;
    fieldConcordanceScore: number;
    aiVerificationScore: number;
  };
  verifiedData: {
    organization: string;
    title: string;
    vacancies: number;
    deadline: string;
    salary: string;
    govtFee: number;
    category: string;
    grade?: string;
    minEducation: string;
    ageLimit?: string;
    applicationUrl: string;
    refNo?: string;
    publishedDate?: string;
  };
  adminCorrections?: AdminCorrection[];
}

export interface VerificationQueueItem {
  id: string;
  draftId: string;
  trigger: 'NEW_DRAFT' | 'DOCUMENT_CHANGED' | 'MANUAL_REQUEST' | 'SCHEDULED_BATCH' | 'CANCELLATION_CHECK';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  priority: number;
  contentHash?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  attempts: number;
  maxAttempts: number;
  error?: string;
  resultStatus?: VerificationStatus;
}
