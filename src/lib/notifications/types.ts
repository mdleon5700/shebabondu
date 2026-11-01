/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 11: NOTIFICATION SYSTEM TYPES
 * Comprehensive Multi-Channel Event Catalog, Prioritization, Delivery & Digest Data Structures
 */

export type NotificationEventType =
  | 'JOB_PUBLISHED'
  | 'JOB_UPDATED'
  | 'JOB_DEADLINE_APPROACHING'
  | 'JOB_DEADLINE_TODAY'
  | 'JOB_DEADLINE_EXTENDED'
  | 'JOB_CANCELLED'
  | 'JOB_SUSPENDED'
  | 'RECOMMENDED_JOB_MATCH'
  | 'APPLICATION_STATUS_CHANGED'
  | 'ACCOUNT_SECURITY_ALERT'
  | 'DAILY_DIGEST'
  | 'WEEKLY_DIGEST'
  | 'ADMIN_SYSTEM_ALERT';

export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export type NotificationChannel = 'in_app' | 'email' | 'web_push' | 'sms';

export type DeliveryStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'SENT'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETRY_SCHEDULED'
  | 'SUPPRESSED'
  | 'CANCELLED';

export type ChannelConfigStatus =
  | 'CONFIGURED_AND_TESTED'
  | 'CONFIGURED_BUT_UNVERIFIED'
  | 'NOT_CONFIGURED'
  | 'BLOCKED_BY_MISSING_CREDENTIALS';

export interface NotificationEventDefinition {
  type: NotificationEventType;
  name: string;
  nameBn: string;
  category: 'jobs' | 'deadlines' | 'recommendations' | 'applications' | 'security' | 'digest' | 'admin';
  defaultPriority: NotificationPriority;
  allowedChannels: NotificationChannel[];
  isTransactional: boolean; // Transactional cannot be opted out (e.g. security)
  requiresAuth: boolean;
  rateLimitPerHour: number;
}

export interface NotificationTemplate {
  id: string;
  eventType: NotificationEventType;
  name: string;
  nameBn: string;
  channel: NotificationChannel;
  titleTemplate: string;
  bodyTemplate: string;
  emailSubjectTemplate?: string;
  emailHtmlTemplate?: string;
  supportedVariables: string[];
  language: 'bn' | 'en';
  isActive: boolean;
  version: number;
  updatedAt: string;
}

export interface DeliveryQueueItem {
  id: string;
  candidateId: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  priority: NotificationPriority;
  title: string;
  message: string;
  link?: string;
  emailHtml?: string;
  targetId?: string; // JobId, ApplicationId, etc.
  targetType?: string;
  dedupeKey: string;
  status: DeliveryStatus;
  attemptCount: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  nextAttemptAt?: string;
  deliveredAt?: string;
  error?: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DigestJobItem {
  jobId: string;
  title: string;
  organization: string;
  category: string;
  categoryBn?: string;
  deadline: string;
  daysRemaining?: number;
  isClosingSoon?: boolean;
  link: string;
}

export interface CandidateDigest {
  id: string;
  candidateId: string;
  frequency: 'daily' | 'weekly';
  periodLabelBn: string;
  generatedAt: string;
  items: DigestJobItem[];
  totalJobs: number;
  topJobCategories: string[];
  unsubscribeUrl: string;
}

export interface ChannelStatusReport {
  channel: NotificationChannel;
  status: ChannelConfigStatus;
  details: string;
  isAvailable: boolean;
}
