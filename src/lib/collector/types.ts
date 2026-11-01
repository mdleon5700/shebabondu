import {
  JobSource,
  CircularDraft,
  CollectionMethod,
  SourceClassification,
  PdfExtractedField,
  PdfExtractedCircular,
  HtmlPdfFieldComparison,
  HtmlPdfComparison
} from '@/lib/types';

export type {
  PdfExtractedField,
  PdfExtractedCircular,
  HtmlPdfFieldComparison,
  HtmlPdfComparison
};

export interface RawDiscoveredNotice {
  refNo?: string;
  title: string;
  organization: string;
  sourceUrl: string;
  evidenceUrl?: string;
  category?: string;
  grade?: string;
  vacancies?: number | string;
  minEducation?: string;
  salary?: string;
  deadline?: string;
  govtFee?: number | string;
  requirements?: string[];
  publishedDate?: string;
  rawEvidenceText?: string;
  evidenceHash?: string;
  needsReview?: boolean;
  reviewReason?: string;
  extractionWarnings?: string[];
  rawMetadata?: Record<string, any>;
  pdfEvidence?: PdfExtractedCircular;
  htmlPdfComparison?: HtmlPdfComparison;
}

export interface NormalizedCircularCandidate {
  id: string;
  refNo?: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  evidenceUrl?: string;
  title: string;
  organization: string;
  category: 'govt' | 'bank' | 'railway' | 'defense' | 'teacher' | 'ngo' | 'private' | 'health';
  grade: string;
  vacancies: number;
  minEducation: string;
  salary: string;
  deadline: string;
  govtFee: number;
  confidenceScore: number;
  contentHash: string;
  extractedAt: string;
  rawEvidenceText?: string;
  evidenceHash?: string;
  needsReview?: boolean;
  reviewReason?: string;
  extractionWarnings?: string[];
  rawMetadata?: Record<string, any>;
  pdfEvidence?: PdfExtractedCircular;
  htmlPdfComparison?: HtmlPdfComparison;
}

export interface PdfFetchOptions {
  timeoutMs?: number;
  maxSizeBytes?: number;
  maxRedirects?: number;
  allowedHosts?: Set<string>;
}

export interface PdfExtractOptions {
  maxPages?: number;
  maxTextChars?: number;
  minCharsForTextBased?: number;
}

export type CollectionErrorCode = 
  | 'NETWORK_ERROR' 
  | 'PARSING_ERROR' 
  | 'SECURITY_BLOCKED' 
  | 'TIMEOUT' 
  | 'RATE_LIMITED' 
  | 'AUTH_REQUIRED' 
  | 'INVALID_SOURCE';

export interface CollectionError {
  code: CollectionErrorCode;
  message: string;
  httpStatus?: number;
  timestamp: string;
  retryable: boolean;
}

export interface CollectorOptions {
  timeoutMs?: number;
  maxItems?: number;
  signal?: AbortSignal;
}

export interface CollectorResult {
  success: boolean;
  sourceId: string;
  candidates: NormalizedCircularCandidate[];
  discoveredCount: number;
  durationMs: number;
  error?: CollectionError;
  metrics: {
    discovered: number;
    collected: number;
    failed: number;
    deduplicated: number;
  };
}

export interface JobCollector {
  readonly id: string;
  readonly name: string;
  readonly supportedMethods: CollectionMethod[];
  collect(source: JobSource, options?: CollectorOptions): Promise<CollectorResult>;
}

export interface IngestionReport {
  sourceId: string;
  totalDiscovered: number;
  newDraftsCreated: number;
  updatesDetected: number;
  duplicatesIgnored: number;
  invalidRejected: number;
  drafts: CircularDraft[];
  errors: string[];
}
