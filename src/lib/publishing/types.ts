/**
 * CHAKRI SHEBA — STEP 05: JOB PUBLISHING & WEBSITE MANAGEMENT SYSTEM
 * Complete Type Definitions
 */

export type PublicationStatus =
  | 'DRAFT'
  | 'CONTENT_IN_PROGRESS'
  | 'PENDING_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'PUBLISHED_WITH_WARNINGS'
  | 'UPDATE_PENDING'
  | 'UNPUBLISH_PENDING'
  | 'UNPUBLISHED'
  | 'EXPIRED'
  | 'ARCHIVED'
  | 'REJECTED'
  | 'PUBLICATION_FAILED';

export type PublicationQueueStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'RETRY_PENDING';

export type PublicationAction =
  | 'PUBLISH_NEW'
  | 'PUBLISH_UPDATE'
  | 'SCHEDULED_PUBLISH'
  | 'UNPUBLISH'
  | 'ARCHIVE'
  | 'RESTORE'
  | 'EXPIRE'
  | 'CANCEL_NOTICE';

export interface PublicationStatusTransition {
  fromStatus: PublicationStatus;
  toStatus: PublicationStatus;
  actor: string;
  timestamp: string;
  reason: string;
  revisionId?: string;
  queueId?: string;
}

export interface PublishingQueueItem {
  id: string;
  jobId: string;
  draftId?: string;
  revisionId: string;
  action: PublicationAction;
  targetPublishTimeUtc: string;
  targetPublishTimeBst: string;
  status: PublicationQueueStatus;
  priority: number; // 1 (Highest) - 10 (Lowest)
  createdBy: string;
  createdAt: string;
  lastAttemptAt?: string;
  completedAt?: string;
  retryCount: number;
  maxRetries: number;
  errorSummary?: string;
  idempotencyKey: string;
}

export interface PublicationSnapshot {
  id: string;
  jobId: string;
  draftId?: string;
  revisionId: string;
  publishedAt: string;
  publishedBy: string;
  versionNumber: number;
  changeSummary?: string;
  contentSnapshot: {
    title: string;
    bengaliDescription?: string;
    faqItems?: Array<{ question: string; answer: string }>;
  };
  factsSnapshot: {
    organization: string;
    vacancies: number;
    deadline: string;
    salary: string;
    govtFee: number;
    minEducation: string;
    applicationUrl: string;
  };
  seoSnapshot: {
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string[];
    slug: string;
    canonicalUrl: string;
  };
  schemaSnapshot: {
    jobPostingSchema?: Record<string, any>;
    breadcrumbSchema?: Record<string, any>;
    faqSchema?: Record<string, any>;
  };
}

export interface PublicationValidationResult {
  isValid: boolean;
  canPublish: boolean;
  blockers: string[];
  warnings: string[];
  validatedAt: string;
}

export interface RedirectRecord {
  id: string;
  sourcePath: string;
  targetPath: string;
  statusCode: 301 | 308 | 302;
  createdAt: string;
  createdBy: string;
  reason: string;
  isActive: boolean;
  hitCount: number;
}

export interface PublicationAuditLog {
  id: string;
  jobId: string;
  action: string;
  actor: string;
  timestamp: string;
  details: Record<string, any>;
  ipAddress?: string;
}

export interface ReviewComment {
  id: string;
  jobId: string;
  draftId?: string;
  author: string;
  content: string;
  createdAt: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  section?: string;
}

export interface ScheduledPublishRequest {
  jobId: string;
  draftId?: string;
  revisionId: string;
  scheduledTimeBst: string; // e.g. "2026-11-01T10:00:00"
  priority?: number;
  adminId: string;
  note?: string;
}

export interface ImmediatePublishRequest {
  jobId: string;
  draftId?: string;
  revisionId: string;
  adminId: string;
  note?: string;
  overrideFields?: Record<string, any>;
}

export interface PublishingAnalyticsSummary {
  totalPublished: number;
  totalScheduled: number;
  totalPendingQueue: number;
  totalFailedQueue: number;
  totalExpired: number;
  totalArchived: number;
  totalUnpublished: number;
  publishedToday: number;
  publishedThisWeek: number;
  publishedThisMonth: number;
  successRatePercentage: number;
  averageApprovalHours: number;
}
