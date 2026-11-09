/**
 * Chakri Sheba - Featured Jobs Management
 * Step 07: Administrative Placements, Scheduling & Expiration
 */

import { JobCircular } from '../types';
import { FeaturedPlacement, FeaturedStatus } from './types';

export class FeaturedManager {
  /**
   * Determine if a job has an active featured placement at the given time
   */
  public static isJobFeatured(
    job: JobCircular,
    placements: FeaturedPlacement[] = [],
    nowInput?: Date
  ): { isFeatured: boolean; priority: number; placement?: FeaturedPlacement } {
    const now = nowInput || new Date();
    const nowMs = now.getTime();

    // Check explicit placements first
    const jobPlacements = placements.filter(p => p.jobId === job.id);

    if (jobPlacements.length > 0) {
      // Find the highest priority placement that is currently active
      for (const p of jobPlacements) {
        if (p.status === 'CANCELLED') continue;

        const startMs = new Date(p.startAt).getTime();
        const endMs = new Date(p.endAt).getTime();

        if (!isNaN(startMs) && !isNaN(endMs)) {
          if (nowMs >= startMs && nowMs <= endMs) {
            return {
              isFeatured: true,
              priority: p.priority || 50,
              placement: p
            };
          }
        }
      }

      // If all explicit placements are expired or cancelled, do not fallback to job.featured
      return { isFeatured: false, priority: 0 };
    }

    // Fallback: If legacy job.featured === true or job.isHot === true
    if (job.featured === true) {
      return {
        isFeatured: true,
        priority: 85
      };
    }

    if (job.isHot === true) {
      return {
        isFeatured: true,
        priority: 75
      };
    }

    // Algorithmic curated featured jobs:
    // 1. High-vacancy (>= 30 posts) in any public-eligible sector
    const posts = job.totalPosts || 0;
    if (posts >= 30) {
      return {
        isFeatured: true,
        priority: 50 + Math.min(20, Math.floor(posts / 10))
      };
    }

    // 2. A-grade / 9th-10th officer grade in govt/autonomous/bank/defense with active posts >= 5
    const isOfficerGrade = job.grade?.includes('৯ম') || job.grade?.includes('১০ম') || job.grade?.includes('১ম') || job.grade?.includes('২য়');
    const isGovtOrCorp = ['govt', 'company', 'defense', 'bank'].includes(job.category);
    if (isGovtOrCorp && isOfficerGrade && posts >= 5) {
      return {
        isFeatured: true,
        priority: 50 + (job.grade?.includes('৯ম') ? 10 : 5)
      };
    }

    return { isFeatured: false, priority: 0 };
  }

  /**
   * Dynamically evaluate the current status of a placement record based on wall-clock time
   */
  public static evaluatePlacementStatus(placement: FeaturedPlacement, nowInput?: Date): FeaturedStatus {
    if (placement.status === 'CANCELLED') return 'CANCELLED';

    const now = nowInput || new Date();
    const nowMs = now.getTime();
    const startMs = new Date(placement.startAt).getTime();
    const endMs = new Date(placement.endAt).getTime();

    if (isNaN(startMs) || isNaN(endMs)) return 'EXPIRED';

    if (nowMs < startMs) {
      return 'SCHEDULED';
    } else if (nowMs > endMs) {
      return 'EXPIRED';
    } else {
      return 'ACTIVE';
    }
  }

  /**
   * Validate new or updated featured placement
   */
  public static validatePlacement(
    job: JobCircular | null,
    placement: Partial<FeaturedPlacement>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!job) {
      errors.push('সার্কুলার রেকর্ডটি খুঁজে পাওয়া যায়নি');
      return { isValid: false, errors };
    }

    // Eligibility check
    const isDraft = job.id.startsWith('draft-') || job.id.startsWith('temp-');
    const isUnpublished = (job as any).status === 'UNPUBLISHED' || (job as any).status === 'DRAFT' || (job as any).status === 'REJECTED';
    const isCancelled = (job as any).status === 'CANCELLED';

    if (isDraft || isUnpublished || isCancelled) {
      errors.push('শুধুমাত্র অনুমোদিত ও প্রকাশিত সক্রিয় সার্কুলারকে ফিচার্ড তালিকায় যুক্ত করা যাবে');
    }

    if (!placement.startAt) {
      errors.push('ফিচার্ড শুরুর সময় (startAt) নির্ধারণ করা আবশ্যক');
    }

    if (!placement.endAt) {
      errors.push('ফিচার্ড সমাপ্তির সময় (endAt) নির্ধারণ করা আবশ্যক');
    }

    if (placement.startAt && placement.endAt) {
      const s = new Date(placement.startAt).getTime();
      const e = new Date(placement.endAt).getTime();
      if (isNaN(s) || isNaN(e)) {
        errors.push('তারিখের ফরম্যাট সঠিক নয়');
      } else if (s >= e) {
        errors.push('সমাপ্তির সময় অবশ্যই শুরুর সময়ের পরবর্তী হতে হবে');
      }
    }

    const priority = placement.priority ?? 50;
    if (priority < 1 || priority > 100) {
      errors.push('অগ্রাধিকার (Priority) অবশ্যই ১ থেকে ১০০ এর মধ্যে হতে হবে');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
