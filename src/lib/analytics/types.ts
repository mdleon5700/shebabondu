/**
 * CHAKRI SHEBA (চাকরি সেবা) — STEP 15: ANALYTICS & BUSINESS INTELLIGENCE TYPES
 * Platform-wide metric definitions, data quality auditing, user journey tracking,
 * and multi-timeframe analytics.
 */

export type AnalyticsTimeframe =
  | 'today'
  | 'yesterday'
  | '7d'
  | '30d'
  | '90d'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'all';

export interface UserFunnelStep {
  stepId: string;
  stepNameBn: string;
  count: number;
  conversionRate: number; // percentage from previous step
}

export interface UserAnalyticsMetrics {
  totalRegistered: number;
  newInPeriod: number;
  activeInPeriod: number;
  retentionRatePercent: number;
  avgProfileCompletionPercent: number;
  educationCompletedCount: number;
  savedJobsActiveCount: number;
  userFunnel: UserFunnelStep[];
}

export interface JobMarketCategoryBreakdown {
  categoryId: string;
  categoryNameBn: string;
  circularCount: number;
  percentage: number;
}

export interface JobMarketDivisionBreakdown {
  divisionBn: string;
  circularCount: number;
  percentage: number;
}

export interface JobMarketEducationRequirementBreakdown {
  levelCategory: string;
  levelNameBn: string;
  circularCount: number;
  percentage: number;
}

export interface RecruitingOrgRanking {
  organization: string;
  circularCount: number;
  activeCount: number;
}

export interface JobMarketMetrics {
  totalJobs: number;
  publishedInPeriod: number;
  expiredInPeriod: number;
  categoryBreakdown: JobMarketCategoryBreakdown[];
  divisionBreakdown: JobMarketDivisionBreakdown[];
  educationBreakdown: JobMarketEducationRequirementBreakdown[];
  topRecruitingOrgs: RecruitingOrgRanking[];
}

export interface SpiderSourcePerformanceItem {
  sourceId: string;
  name: string;
  tier: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  successRatePercent: number;
  jobsDiscoveredTotal: number;
  lastRunAt?: string;
  status: 'ACTIVE' | 'DEGRADED' | 'INACTIVE';
}

export interface SpiderSourceAnalyticsMetrics {
  totalSources: number;
  activeSources: number;
  totalRunsInPeriod: number;
  successfulRunsInPeriod: number;
  failedRunsInPeriod: number;
  overallSuccessRatePercent: number;
  jobsDiscoveredInPeriod: number;
  duplicateDetectionRatePercent: number;
  sources: SpiderSourcePerformanceItem[];
}

export interface AiVerificationAnalyticsMetrics {
  totalAiVerificationRequests: number;
  successfulExtractions: number;
  rateLimitedOrFailed: number;
  avgDurationMs: number;
  totalTokensUsed: number;
  estimatedCostBdt: number;
  verificationConflictRatePercent: number;
  humanCorrectionsCount: number;
}

export interface SeoPublishingAnalyticsMetrics {
  totalJobPages: number;
  publishedCanonicalPages: number;
  draftPagesPending: number;
  missingMetaTitles: number;
  missingMetaDescriptions: number;
  missingCanonicalUrls: number;
  googleSearchConsoleStatus: 'CONFIGURED' | 'MOCK_AVAILABLE' | 'NOT_CONFIGURED';
  googleAnalyticsStatus: 'CONFIGURED' | 'MOCK_AVAILABLE' | 'NOT_CONFIGURED';
  organicImpressionsEstimate: number;
  organicClicksEstimate: number;
  avgPositionEstimate: number;
}

export interface SearchKeywordItem {
  keyword: string;
  count: number;
}

export interface ZeroResultSearchItem {
  keyword: string;
  count: number;
  lastSearchedAt: string;
  suggestedActionBn: string;
}

export interface SearchAnalyticsMetrics {
  totalSearchesRecorded: number;
  uniqueQueriesCount: number;
  zeroResultSearchesCount: number;
  topKeywords: SearchKeywordItem[];
  zeroResultQueries: ZeroResultSearchItem[];
}

export interface SmartMatchingAnalyticsMetrics {
  totalEvaluationsCount: number;
  highMatchCount: number; // >= 70%
  mediumMatchCount: number; // 40-69%
  lowMatchCount: number; // < 40%
  positiveFeedbackCount: number;
  negativeFeedbackCount: number;
  topQualificationGaps: { gapBn: string; count: number }[];
}

export interface NotificationAnalyticsMetrics {
  totalDeliveriesRecorded: number;
  deliveredConfirmedCount: number;
  failedCount: number;
  deliverySuccessRatePercent: number;
  channelBreakdown: {
    channel: string;
    channelNameBn: string;
    delivered: number;
    failed: number;
  }[];
}

export interface EducationAnalyticsMetrics {
  candidatesWithEducationCount: number;
  candidatesWithoutEducationCount: number;
  totalEducationRecordsCount: number;
  verifiedCertificatesCount: number;
  pendingReviewCertificatesCount: number;
  rejectedCertificatesCount: number;
  levelDistribution: {
    level: string;
    count: number;
  }[];
}

export interface OperationalCostAnalyticsMetrics {
  monthlyBudgetBdt: number;
  actualSpendBdt: number;
  varianceBdt: number;
  burnRatePercent: number;
  isBudgetExceeded: boolean;
  categoryExpenses: {
    category: string;
    categoryNameBn: string;
    amountBdt: number;
    percentage: number;
  }[];
}

export interface DataQualityIssue {
  id: string;
  subsystem: 'job' | 'candidate' | 'education' | 'spider' | 'publishing';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  titleBn: string;
  descriptionBn: string;
  affectedRecordId: string;
  suggestedFixBn: string;
  detectedAt: string;
}

export interface DataQualityAuditReport {
  checkedAt: string;
  totalRecordsScanned: number;
  totalIssuesFound: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  qualityHealthScorePercent: number;
  issues: DataQualityIssue[];
}

export interface PlatformAnalyticsOverviewReport {
  timeframe: AnalyticsTimeframe;
  generatedAt: string;
  displayTimezone: string;
  users: UserAnalyticsMetrics;
  jobMarket: JobMarketMetrics;
  sources: SpiderSourceAnalyticsMetrics;
  aiVerification: AiVerificationAnalyticsMetrics;
  seoPublishing: SeoPublishingAnalyticsMetrics;
  search: SearchAnalyticsMetrics;
  matching: SmartMatchingAnalyticsMetrics;
  notifications: NotificationAnalyticsMetrics;
  education: EducationAnalyticsMetrics;
  operationalCost: OperationalCostAnalyticsMetrics;
  dataQuality: {
    healthScorePercent: number;
    totalIssues: number;
    criticalIssues: number;
  };
}
