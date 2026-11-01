/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 08: DEADLINE & ALERT SYSTEM
 * Core Type Definitions & Data Models
 */

export type DeadlinePrecision =
  | 'EXACT_TIME'
  | 'DATE_ONLY'
  | 'DATE_RANGE'
  | 'NOT_SPECIFIED'
  | 'EXTENDED'
  | 'REVISED';

export type DeadlineVerificationStatus =
  | 'VERIFIED'
  | 'NEEDS_REVIEW'
  | 'CONFLICTING'
  | 'UNVERIFIED'
  | 'NOT_SPECIFIED'
  | 'REJECTED';

export type DeadlineStatus =
  | 'OPEN'
  | 'CLOSING_SOON'
  | 'CLOSING_TODAY'
  | 'CLOSED'
  | 'EXTENDED'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'UNKNOWN';

export type JobLifecycleStatus =
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'DEADLINE_EXPIRED'
  | 'REOPENED'
  | 'REVISED';

export interface DeadlineData {
  jobId: string;
  sourceDocumentId?: string;
  deadlineOriginalText: string;
  deadlineDate: string; // ISO YYYY-MM-DD
  deadlineTime?: string; // 24h format HH:mm in Asia/Dhaka
  deadlineTimezone: 'Asia/Dhaka';
  deadlinePrecision: DeadlinePrecision;
  verificationStatus: DeadlineVerificationStatus;
  verificationSource?: string;
  evidenceReference?: string;
  confidence: number;
  revisionNumber: number;
  detectedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeadlineRevision {
  id: string;
  jobId: string;
  previousDeadline: string;
  newDeadline: string;
  previousTime?: string;
  newTime?: string;
  changeReason: string;
  sourceUrl?: string;
  evidenceDocHash?: string;
  verificationStatus: DeadlineVerificationStatus;
  approvedBy: string;
  approvedAt: string;
  timestamp: string;
}

export type CircularChangeType =
  | 'DEADLINE_EXTENDED'
  | 'DEADLINE_SHORTENED'
  | 'VACANCY_CHANGED'
  | 'QUALIFICATION_CHANGED'
  | 'FEE_CHANGED'
  | 'SUSPENSION'
  | 'CANCELLATION'
  | 'REOPENED'
  | 'REVISED_CIRCULAR';

export interface CircularChangeProposal {
  id: string;
  jobId: string;
  jobTitle: string;
  organization: string;
  changeType: CircularChangeType;
  field: string;
  oldValue: any;
  newValue: any;
  sourceUrl: string;
  evidenceSnippet: string;
  evidenceDocHash?: string;
  confidence: number;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

export interface DeadlineAlertRule {
  id: string;
  name: string;
  nameBn: string;
  leadDays: number; // 7, 3, 1, 0 (0 = today)
  channel: 'in_app' | 'email' | 'web_push' | 'sms';
  isEnabled: boolean;
  categories?: string[];
  minLeadHours?: number;
}

export interface UserJobReminder {
  id: string;
  candidateId: string;
  jobId: string;
  leadDays: number[]; // e.g. [7, 3, 1, 0]
  channels: ('in_app' | 'email' | 'web_push' | 'sms')[];
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationChannel = 'in_app' | 'email' | 'web_push' | 'sms';

export type NotificationType =
  | 'deadline_reminder'
  | 'deadline_extended'
  | 'deadline_changed'
  | 'deadline_today'
  | 'job_closed'
  | 'job_suspended'
  | 'job_cancelled'
  | 'job_reopened'
  | 'circular_updated'
  | 'system';

export interface NotificationDeliveryItem {
  id: string;
  candidateId: string;
  jobId?: string;
  jobTitle?: string;
  organization?: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  message: string;
  link?: string;
  status: 'QUEUED' | 'DELIVERED' | 'FAILED' | 'RETRY_PENDING';
  attemptCount: number;
  lastAttemptAt?: string;
  deliveredAt?: string;
  error?: string;
  dedupeKey: string; // ${candidateId}_${jobId}_${type}_${leadDay}_${date}
  read: boolean;
  createdAt: string;
}

export interface MonitoringRunRecord {
  id: string;
  startedAt: string;
  completedAt?: string;
  jobsChecked: number;
  closingTodayCount: number;
  closingSoonCount: number;
  expiredCount: number;
  alertsGenerated: number;
  proposalsCreated: number;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  error?: string;
}

export interface DeadlineEvaluationResult {
  status: DeadlineStatus;
  lifecycleStatus: JobLifecycleStatus;
  labelBn: string;
  daysRemaining: number;
  hoursRemaining?: number;
  minutesRemaining?: number;
  formattedCountdownBn: string;
  isClosed: boolean;
  isClosingSoon: boolean;
  isClosingToday: boolean;
  hasExactTime: boolean;
  badgeColor: string; // tailwind classes
  authoritativeDeadlineDate: string;
  authoritativeDeadlineTime?: string;
}
