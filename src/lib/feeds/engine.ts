import { isPublicJob } from '../job-visibility';
/**
 * Chakri Sheba - Centralized Job Feed Engine
 * Step 07: Single Authoritative Feed Provider for All Time-based & Curated Feeds
 */

import { JobCircular } from '../types';
import { 
  FeedType, 
  FeedQueryOptions, 
  FeedResult, 
  DailyArchiveSummary, 
  FeedMetricsSummary,
  FeaturedPlacement 
} from './types';
import { BangladeshDateHelper } from './timezone';
import { FeaturedManager } from './featured';
import { DEFAULT_FEED_CONFIG } from './config';

export class JobFeedEngine {
  /**
   * Filter jobs using non-bypassable public eligibility guard
   */
  public static filterPublicEligibleJobs(jobs: JobCircular[], includeExpired: boolean = false): JobCircular[] {
    return jobs.filter((job) => {
      if (!isPublicJob(job)) return false;
      // 1. Exclude drafts and temporary records
      if (!job.id || job.id.startsWith('draft-') || job.id.startsWith('temp-')) {
        return false;
      }

      // 2. Exclude non-published statuses
      const status = ((job as any).status || '').toUpperCase();
      if (status === 'DRAFT' || status === 'UNPUBLISHED' || status === 'REJECTED' || status === 'ARCHIVED') {
        return false;
      }

      // 3. Exclude cancelled jobs
      if (status === 'CANCELLED') {
        return false;
      }

      // 4. Handle expired jobs if requested
      if (!includeExpired && (status === 'EXPIRED' || status === 'CLOSED')) {
        return false;
      }

      return true;
    });
  }

  /**
   * Main Feed Provider: Evaluates selection rules, filtering, sorting and pagination
   */
  public static getFeed(
    allJobs: JobCircular[],
    options: FeedQueryOptions = {},
    placements: FeaturedPlacement[] = [],
    nowInput?: Date
  ): FeedResult {
    const now = nowInput || new Date();
    const feedType: FeedType = options.feedType || 'latest';
    const todayInfo = BangladeshDateHelper.getBangladeshTodayDate(now);

    // 1. Enforce strict public eligibility
    const eligibleJobs = this.filterPublicEligibleJobs(allJobs, options.includeExpired);

    let filtered: JobCircular[] = [...eligibleJobs];
    let feedTitleBn = 'সর্বশেষ চাকরির বিজ্ঞপ্তি ২০২৬';
    let feedTitleEn = 'Latest Job Circulars 2026';
    let targetDateIso: string | undefined = undefined;
    let targetDateBn: string | undefined = undefined;

    // 2. Apply Feed-Specific Selection Rules
    switch (feedType) {
      case 'today': {
        targetDateIso = todayInfo.isoDate;
        targetDateBn = todayInfo.dateBn;
        feedTitleBn = `আজকের চাকরির খবর — ${todayInfo.dateBn}`;
        feedTitleEn = `Today's Job Circulars (${todayInfo.isoDate})`;

        filtered = filtered.filter((j) => {
          const rawDate = (j as any).publishedAt || j.publishedDate || j.createdAt;
          const jobIsoDate = BangladeshDateHelper.parseToIsoDate(rawDate);
          return jobIsoDate === todayInfo.isoDate;
        });
        break;
      }

      case 'daily': {
        const rawDate = options.date || todayInfo.isoDate;
        const parsedIso = BangladeshDateHelper.parseToIsoDate(rawDate) || todayInfo.isoDate;
        targetDateIso = parsedIso;
        targetDateBn = BangladeshDateHelper.formatBengaliFullDate(parsedIso);
        feedTitleBn = `${targetDateBn} এর চাকরির সার্কুলার`;
        feedTitleEn = `Jobs Published on ${parsedIso}`;

        filtered = filtered.filter((j) => {
          const rawDate = (j as any).publishedAt || j.publishedDate || j.createdAt;
          const jobIsoDate = BangladeshDateHelper.parseToIsoDate(rawDate);
          return jobIsoDate === parsedIso;
        });
        break;
      }

      case 'featured': {
        feedTitleBn = 'বিশেষ ও গুরুত্বপূর্ণ নিয়োগ বিজ্ঞপ্তি';
        feedTitleEn = 'Featured Job Circulars';

        filtered = filtered.filter((j) => {
          const featuredInfo = FeaturedManager.isJobFeatured(j, placements, now);
          return featuredInfo.isFeatured;
        });
        break;
      }

      case 'closing_soon': {
        const threshold = DEFAULT_FEED_CONFIG.closingSoonThresholdDays || 3;
        feedTitleBn = `জরুরি চাকরির ডেডলাইন (${BangladeshDateHelper.toBnDigits(threshold)} দিনের মধ্যে শেষ)`;
        feedTitleEn = 'Job Circulars Closing Soon';

        filtered = filtered.filter((j) => {
          return BangladeshDateHelper.isClosingSoon(j.daysRemaining, threshold);
        });
        break;
      }

      case 'category': {
        if (options.category) {
          const targetCat = options.category.toLowerCase().replace('cat-', '');
          filtered = filtered.filter((j) => {
            const jCat = (j.category || '').toLowerCase().replace('cat-', '');
            if (targetCat === 'govt') {
              return ['govt', 'railway', 'defense', 'teacher'].includes(jCat);
            } else if (targetCat === 'private') {
              return ['private', 'ngo'].includes(jCat);
            }
            return jCat === targetCat;
          });
          const catLabel = filtered[0]?.categoryLabel || options.category;
          feedTitleBn = `${catLabel} — সর্বশেষ সার্কুলার`;
          feedTitleEn = `Latest ${options.category} Jobs`;
        }
        break;
      }

      case 'organization': {
        if (options.organization) {
          const orgTerm = options.organization.toLowerCase().trim();
          filtered = filtered.filter((j) => j.organization?.toLowerCase().includes(orgTerm));
          feedTitleBn = `${options.organization} — চাকরির বিজ্ঞপ্তি`;
          feedTitleEn = `Jobs at ${options.organization}`;
        }
        break;
      }

      case 'popular': {
        feedTitleBn = 'জনপ্রিয় ও শীর্ষ চাকরির বিজ্ঞপ্তি';
        feedTitleEn = 'Popular & High-Demand Jobs';
        break;
      }

      case 'recently_added':
      case 'recently_published':
      case 'latest':
      default: {
        feedTitleBn = 'সর্বশেষ চাকরির বিজ্ঞপ্তি ২০২৬';
        feedTitleEn = 'Latest Job Circulars 2026';
        break;
      }
    }

    // 3. Apply Multi-Facet Filtering Options
    if (options.category && feedType !== 'category') {
      const targetCat = options.category.toLowerCase().replace('cat-', '');
      filtered = filtered.filter((j) => {
        const jCat = (j.category || '').toLowerCase().replace('cat-', '');
        if (targetCat === 'govt') {
          return ['govt', 'railway', 'defense', 'teacher'].includes(jCat);
        } else if (targetCat === 'private') {
          return ['private', 'ngo'].includes(jCat);
        }
        return jCat === targetCat;
      });
    }

    if (options.district && options.district !== 'all') {
      filtered = filtered.filter((j) => j.districts?.includes(options.district!));
    }

    if (options.education && options.education !== 'all') {
      const eduQuery = options.education.toLowerCase();
      filtered = filtered.filter((j) => j.minEducation?.toLowerCase().includes(eduQuery));
    }

    if (options.status && options.status !== 'all') {
      if (options.status === 'open') {
        filtered = filtered.filter((j) => j.daysRemaining > 0);
      } else if (options.status === 'closing_soon') {
        filtered = filtered.filter((j) => j.daysRemaining >= 0 && j.daysRemaining <= 3);
      }
    }

    if (options.q) {
      const query = options.q.toLowerCase().trim();
      filtered = filtered.filter((j) => 
        j.title?.toLowerCase().includes(query) ||
        j.organization?.toLowerCase().includes(query) ||
        j.minEducation?.toLowerCase().includes(query)
      );
    }

    // 4. Apply Sorting
    const sortBy = options.sortBy || (feedType === 'closing_soon' ? 'deadline_soon' : (feedType === 'featured' ? 'priority' : 'latest'));

    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        const pA = FeaturedManager.isJobFeatured(a, placements, now).priority;
        const pB = FeaturedManager.isJobFeatured(b, placements, now).priority;
        if (pB !== pA) return pB - pA;
      }

      if (sortBy === 'deadline_soon') {
        return (a.daysRemaining || 0) - (b.daysRemaining || 0);
      }

      if (sortBy === 'deadline_later') {
        return (b.daysRemaining || 0) - (a.daysRemaining || 0);
      }

      if (sortBy === 'oldest') {
        const dateA = BangladeshDateHelper.parseToIsoDate(a.publishedDate || a.createdAt) || '1970-01-01';
        const dateB = BangladeshDateHelper.parseToIsoDate(b.publishedDate || b.createdAt) || '1970-01-01';
        return dateA.localeCompare(dateB);
      }

      // Default: 'latest' (newest publication timestamp/date first, preserving publishedAt)
      const pubTimeA = (a as any).publishedAt 
        ? new Date((a as any).publishedAt).getTime() 
        : (a.createdAt ? new Date(a.createdAt).getTime() : (BangladeshDateHelper.parseToIsoDate(a.publishedDate) ? new Date(BangladeshDateHelper.parseToIsoDate(a.publishedDate)!).getTime() : 0));
      const pubTimeB = (b as any).publishedAt 
        ? new Date((b as any).publishedAt).getTime() 
        : (b.createdAt ? new Date(b.createdAt).getTime() : (BangladeshDateHelper.parseToIsoDate(b.publishedDate) ? new Date(BangladeshDateHelper.parseToIsoDate(b.publishedDate)!).getTime() : 0));
      if (pubTimeB !== pubTimeA) {
        return pubTimeB - pubTimeA;
      }

      // Tie breaker: compare createdAt if available
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    // 5. Server-side Pagination
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 9));
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedJobs = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      feedType,
      title_bn: feedTitleBn,
      title_en: feedTitleEn,
      date: targetDateIso,
      date_bn: targetDateBn,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      jobs: paginatedJobs,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get historical archive dates with real job counts
   */
  public static getDailyArchiveDates(jobs: JobCircular[], daysBack: number = 30, nowInput?: Date): DailyArchiveSummary[] {
    const eligibleJobs = this.filterPublicEligibleJobs(jobs, false);
    const todayInfo = BangladeshDateHelper.getBangladeshTodayDate(nowInput);

    // Group jobs by ISO date
    const dateCounts: Record<string, number> = {};
    for (const job of eligibleJobs) {
      const isoDate = BangladeshDateHelper.parseToIsoDate(job.publishedDate || job.createdAt);
      if (isoDate) {
        dateCounts[isoDate] = (dateCounts[isoDate] || 0) + 1;
      }
    }

    // Generate list of dates for the last N days
    const result: DailyArchiveSummary[] = [];
    const baseDate = new Date(`${todayInfo.isoDate}T00:00:00Z`);

    for (let i = 0; i < daysBack; i++) {
      const d = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
      const iso = d.toISOString().split('T')[0];
      const count = dateCounts[iso] || 0;

      result.push({
        date: iso,
        date_bn: BangladeshDateHelper.formatBengaliFullDate(iso),
        jobCount: count,
        hasJobs: count > 0
      });
    }

    // Also include any older historical dates from the database that have jobs
    for (const [iso, count] of Object.entries(dateCounts)) {
      if (!result.some((r) => r.date === iso)) {
        result.push({
          date: iso,
          date_bn: BangladeshDateHelper.formatBengaliFullDate(iso),
          jobCount: count,
          hasJobs: count > 0
        });
      }
    }

    // Sort descending by date
    result.sort((a, b) => b.date.localeCompare(a.date));

    return result;
  }

  /**
   * Calculate operational feed metrics across all canonical jobs
   */
  public static getFeedMetrics(
    allJobs: JobCircular[],
    placements: FeaturedPlacement[] = [],
    nowInput?: Date
  ): FeedMetricsSummary {
    const now = nowInput || new Date();
    const todayInfo = BangladeshDateHelper.getBangladeshTodayDate(now);
    const eligibleJobs = this.filterPublicEligibleJobs(allJobs, false);

    let jobsToday = 0;
    let jobsLast7Days = 0;
    let jobsLast30Days = 0;
    let closingSoonCount = 0;
    let missingTimestampCount = 0;

    for (const job of eligibleJobs) {
      const rawDate = job.publishedDate || job.createdAt;
      const isoDate = BangladeshDateHelper.parseToIsoDate(rawDate);

      if (!isoDate) {
        missingTimestampCount++;
      } else {
        if (isoDate === todayInfo.isoDate) {
          jobsToday++;
        }
        if (BangladeshDateHelper.isWithinDays(isoDate, 7, now)) {
          jobsLast7Days++;
        }
        if (BangladeshDateHelper.isWithinDays(isoDate, 30, now)) {
          jobsLast30Days++;
        }
      }

      if (BangladeshDateHelper.isClosingSoon(job.daysRemaining, 3)) {
        closingSoonCount++;
      }
    }

    // Featured counts
    let activeFeaturedCount = 0;
    let scheduledFeaturedCount = 0;
    let expiredFeaturedCount = 0;

    for (const p of placements) {
      const status = FeaturedManager.evaluatePlacementStatus(p, now);
      if (status === 'ACTIVE') activeFeaturedCount++;
      else if (status === 'SCHEDULED') scheduledFeaturedCount++;
      else if (status === 'EXPIRED') expiredFeaturedCount++;
    }

    // Also count legacy featured jobs that don't have explicit placement
    const explicitJobIds = new Set(placements.map(p => p.jobId));
    for (const j of eligibleJobs) {
      if (j.featured === true && !explicitJobIds.has(j.id)) {
        activeFeaturedCount++;
      }
    }

    return {
      totalEligibleJobs: eligibleJobs.length,
      jobsToday,
      jobsLast7Days,
      jobsLast30Days,
      activeFeaturedCount,
      scheduledFeaturedCount,
      expiredFeaturedCount,
      closingSoonCount,
      missingTimestampCount,
      todayDateBn: todayInfo.dateBn,
      todayDateIso: todayInfo.isoDate
    };
  }
}
