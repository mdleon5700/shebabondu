/**
 * CHAKRI SHEBA — STEP 05: PUBLICATION ELIGIBILITY VALIDATOR
 * Strict pre-publication validation rules preventing bad data from leaking to the public.
 */

import { PublicationValidationResult } from './types';
import { JobCircular, CircularDraft } from '@/lib/types';
import { serverDB } from '@/lib/db';

export interface PublishableEntity {
  job?: JobCircular | null;
  draft?: CircularDraft | null;
  title: string;
  organization: string;
  category: string;
  deadline: string;
  slug: string;
  bengaliDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  applicationUrl?: string;
  isCancellationNotice?: boolean;
  isSuspended?: boolean;
  unresolvedWarnings?: string[];
  conflictSummary?: string[];
  verificationStatus?: string;
}

export function validatePublicationEligibility(
  entity: PublishableEntity,
  targetJobId?: string
): PublicationValidationResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  // 1. Critical Title & Organization Checks
  if (!entity.title || entity.title.trim().length < 5) {
    blockers.push('চাকরির পদবি (Title) আবশ্যক এবং ন্যূনতম ৫ অক্ষরের হতে হবে।');
  }
  if (!entity.organization || entity.organization.trim().length < 3 || entity.organization === 'বিজ্ঞপ্তিতে উল্লেখ নেই') {
    blockers.push('প্রতিষ্ঠানের নাম (Organization) সুস্পষ্ট ও যাচাইকৃত হতে হবে।');
  }

  // 2. Cancellation Notice Blocker
  if (entity.isCancellationNotice) {
    blockers.push('বাতিলকৃত বা স্থগিত নোটিশ সরাসরি সক্রিয় সার্কুলার হিসেবে প্রকাশ করা যাবে না। বিশেষ নোটিশ হিসেবে হ্যান্ডেল করুন।');
  }

  // 3. Factual Conflict & Critical Warnings Blocker
  if (entity.conflictSummary && entity.conflictSummary.length > 0) {
    blockers.push(`অমিমাংসিত তথ্যগত বিরোধ বিদ্যমান: ${entity.conflictSummary.join(', ')}`);
  }
  if (entity.unresolvedWarnings && entity.unresolvedWarnings.some(w => w.includes('CONFLICT') || w.includes('জালিয়াতি') || w.includes('ভুয়া'))) {
    blockers.push('সার্কুলারে সংবেদনশীল বিরোধ বা অনিষ্পন্ন সতর্কবার্তা রয়েছে।');
  }

  // 4. Bengali Editorial Content Check
  if (!entity.bengaliDescription || entity.bengaliDescription.trim().length < 50) {
    blockers.push('বাংলা সম্পাদকীয় বিবরণী (Bengali Description) আবশ্যক এবং তথ্যবহুল হতে হবে।');
  }

  // 5. Slug Uniqueness & Integrity Check
  const cleanSlug = (entity.slug || '').trim().toLowerCase();
  if (!cleanSlug || cleanSlug.length < 3) {
    blockers.push('এসইও বান্ধব ইউনিক স্লাগ (Slug) আবশ্যক।');
  } else if (!/^[a-z0-9\-]+$/.test(cleanSlug)) {
    blockers.push('স্লাগে শুধুমাত্র ছোট হাতের ইংরেজি অক্ষর, সংখ্যা এবং হাইফেন (-) ব্যবহৃত হতে পারে।');
  } else {
    // Check slug collision in canonical jobs database
    const allJobs = serverDB.getAllJobs ? serverDB.getAllJobs() : serverDB.getJobs();
    const collidingJob = allJobs.find(j => j.slug === cleanSlug && j.id !== targetJobId);
    if (collidingJob) {
      blockers.push(`এই স্লাগটি (${cleanSlug}) ইতোমধ্যে অন্য একটি চাকরির (${collidingJob.id} - ${collidingJob.title}) জন্য ব্যবহৃত হয়েছে।`);
    }
  }

  // 6. Application URL / Official Link Validation
  const appUrl = (entity.applicationUrl || '').trim();
  if (appUrl && !appUrl.startsWith('http://') && !appUrl.startsWith('https://')) {
    warnings.push('অনলাইন আবেদন লিঙ্কটি পূর্ণাঙ্গ ওয়েব প্রটোকল (https://) সহ প্রদান করা উচিত।');
  }

  // 7. SEO Metadata Checks
  if (!entity.seoTitle || entity.seoTitle.trim().length < 15) {
    warnings.push('এসইও মেটা টাইটেল ১৫ অক্ষরের চেয়ে ছোট। সার্চ রেজাল্টের জন্য এটি আরও আকর্ষণীয় হওয়া প্রয়োজন।');
  }
  if (!entity.seoDescription || entity.seoDescription.trim().length < 40) {
    warnings.push('এসইও মেটা ডেসক্রিপশন ৪০ অক্ষরের চেয়ে ছোট। এটি বিস্তারিত হওয়া দরকার।');
  }

  // 8. Deadline Verification
  if (!entity.deadline || entity.deadline === 'বিজ্ঞপ্তিতে উল্লেখ নেই') {
    warnings.push('বিজ্ঞপ্তিতে আবেদনের শেষ সময় স্পষ্টভাবে উল্লেখ করা নেই।');
  }

  const isValid = blockers.length === 0;
  const canPublish = isValid;

  return {
    isValid,
    canPublish,
    blockers,
    warnings,
    validatedAt: new Date().toISOString()
  };
}
