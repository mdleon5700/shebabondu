/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 14: ADMIN GOVERNANCE, RBAC & HEALTH TYPES
 * Centralized platform management, granular role permissions, multi-subsystem health,
 * and unified administrative search.
 */

export type AdminRole =
  | 'super_admin'
  | 'admin'
  | 'job_manager'
  | 'verification_officer'
  | 'content_editor'
  | 'support_staff';

export type AdminPermission =
  // User Governance
  | 'users.read'
  | 'users.manage'
  | 'users.suspend'
  // Job Operations
  | 'jobs.read'
  | 'jobs.create'
  | 'jobs.update'
  | 'jobs.approve'
  | 'jobs.publish'
  | 'jobs.unpublish'
  | 'jobs.delete'
  // Intelligence & Collection
  | 'sources.manage'
  | 'verification.review'
  // Content & SEO
  | 'content.edit'
  | 'content.approve'
  | 'publishing.manage'
  | 'categories.manage'
  // Automation & Alerts
  | 'deadlines.manage'
  | 'matching.configure'
  // Communication & Vault
  | 'notifications.send'
  | 'certificates.review'
  // Operations & Cost
  | 'expenses.manage'
  // Governance & Security
  | 'system.settings.manage'
  | 'system.health.view'
  | 'roles.manage'
  | 'audit.read'
  // Step 15 Analytics, Automation & BI
  | 'analytics.view'
  | 'automation.manage'
  | 'reports.export';

export interface StaffMemberRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRole;
  status: 'active' | 'suspended';
  customPermissions?: AdminPermission[];
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

export type HealthState = 'HEALTHY' | 'DEGRADED' | 'WARNING' | 'CRITICAL' | 'NOT_CONFIGURED';

export interface SubsystemHealth {
  id: string;
  name: string;
  nameBn: string;
  status: HealthState;
  latencyMs?: number;
  message: string;
  lastChecked: string;
}

export interface PlatformHealthReport {
  overallStatus: HealthState;
  uptimePercentage: number;
  subsystems: Record<string, SubsystemHealth>;
  generatedAt: string;
}

export interface PlatformOverviewMetrics {
  candidates: {
    total: number;
    active: number;
    newToday: number;
    newThisWeek: number;
  };
  jobs: {
    totalPublished: number;
    publishedToday: number;
    publishedThisWeek: number;
    expiringSoon: number;
    draftsPending: number;
  };
  verification: {
    totalVerified: number;
    pendingReview: number;
    aiAssistedCount: number;
  };
  certificates: {
    pendingVerification: number;
    verifiedTotal: number;
    rejectedTotal: number;
  };
  operations: {
    monthlyBudgetBdt: number;
    actualSpendBdt: number;
    burnRatePercent: number;
    zeroPaywallVerified: true;
  };
  notifications: {
    deliveredTotal: number;
    smsSent: number;
    emailsSent: number;
    failureCount: number;
  };
  timeframe: 'today' | '7d' | '30d' | '90d' | 'all';
  generatedAt: string;
}

export interface AdminGlobalSearchResult {
  id: string;
  type: 'candidate' | 'job' | 'draft' | 'expense' | 'audit_log';
  title: string;
  subtitle: string;
  badge: string;
  targetTab: string;
  detailParam?: string;
}

export interface ActivityEventItem {
  id: string;
  action: string;
  actorName: string;
  title: string;
  targetType: string;
  targetId?: string;
  timestamp: string;
  formattedDateBn: string;
}

