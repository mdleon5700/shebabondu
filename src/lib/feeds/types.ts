/**
 * Chakri Sheba - Job Feeds & Dynamic Discovery System
 * Step 07: Core Type Definitions
 */

import { JobCircular } from '../types';

export type FeedType = 
  | 'latest'
  | 'today'
  | 'daily'
  | 'recently_published'
  | 'recently_added'
  | 'featured'
  | 'category'
  | 'organization'
  | 'closing_soon'
  | 'popular';

export type FeaturedStatus = 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'CANCELLED';

export type FeaturedPlacementTarget = 'homepage' | 'featured_page' | 'category' | 'all';

export interface FeaturedPlacement {
  id: string;
  jobId: string;
  placement: FeaturedPlacementTarget;
  priority: number; // 1 to 100, higher gets displayed first
  startAt: string; // ISO 8601 string
  endAt: string; // ISO 8601 string
  status: FeaturedStatus;
  adminNotes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedSectionConfig {
  key: string;
  enabled: boolean;
  title_bn: string;
  title_en: string;
  item_limit: number;
  display_order: number;
  category_slug?: string;
}

export interface GlobalFeedConfig {
  sections: Record<string, FeedSectionConfig>;
  newJobBadgeDurationDays: number;
  closingSoonThresholdDays: number;
  revalidationIntervalSeconds: number;
  updatedAt: string;
}

export interface FeedQueryOptions {
  feedType?: FeedType;
  date?: string; // YYYY-MM-DD in Asia/Dhaka
  category?: string;
  subcategory?: string;
  organization?: string;
  orgType?: string;
  jobType?: string;
  division?: string;
  district?: string;
  education?: string;
  experience?: string;
  status?: 'all' | 'open' | 'closing_soon';
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: 'latest' | 'oldest' | 'deadline_soon' | 'deadline_later' | 'priority';
  includeExpired?: boolean;
}

export interface FeedResult {
  success: boolean;
  feedType: FeedType;
  title_bn: string;
  title_en: string;
  date?: string;
  date_bn?: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  jobs: JobCircular[];
  lastUpdated: string;
}

export interface DailyArchiveSummary {
  date: string; // YYYY-MM-DD
  date_bn: string;
  jobCount: number;
  hasJobs: boolean;
}

export interface FeedMetricsSummary {
  totalEligibleJobs: number;
  jobsToday: number;
  jobsLast7Days: number;
  jobsLast30Days: number;
  activeFeaturedCount: number;
  scheduledFeaturedCount: number;
  expiredFeaturedCount: number;
  closingSoonCount: number;
  missingTimestampCount: number;
  todayDateBn: string;
  todayDateIso: string;
}
