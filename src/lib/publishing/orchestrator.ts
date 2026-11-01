/**
 * CHAKRI SHEBA — STEP 05: CENTRAL PUBLISHING ORCHESTRATOR
 * Coordinates end-to-end publication into canonical JobCircular, immutable snapshots, and audit logging.
 */

import {
  PublicationStatus,
  PublicationSnapshot,
  PublicationValidationResult,
  ImmediatePublishRequest,
  PublishingQueueItem
} from './types';
import { validatePublicationEligibility } from './validator';
import { executeStatusTransition } from './status_machine';
import { updateQueueItemStatus } from './queue';
import { serverDB } from '@/lib/db';
import { JobCircular, CircularDraft } from '@/lib/types';

export interface OrchestrationResult {
  success: boolean;
  jobId: string;
  job?: JobCircular;
  snapshot?: PublicationSnapshot;
  validation: PublicationValidationResult;
  queueItem?: PublishingQueueItem;
  error?: string;
  isRepublish?: boolean;
}

export function publishJobNow(
  req: ImmediatePublishRequest,
  queueId?: string
): OrchestrationResult {
  const allDrafts = serverDB.getCircularDrafts ? serverDB.getCircularDrafts() : [];
  const draft = allDrafts.find(d => d.id === req.draftId || d.id === req.jobId);
  const existingJob = serverDB.getJobById(req.jobId);

  // Determine Title, Organization, Bengali Description, and SEO Metadata
  const title = req.overrideFields?.title || draft?.extractedTitle || existingJob?.title || '';
  const organization = req.overrideFields?.organization || draft?.extractedOrg || existingJob?.organization || '';
  const category = req.overrideFields?.category || draft?.category || existingJob?.category || 'govt';
  const deadline = req.overrideFields?.deadline || draft?.deadline || existingJob?.deadline || '';
  const slug = req.overrideFields?.slug || (draft as any)?.slug || draft?.contentStudioState?.seo.slug || existingJob?.slug || (title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '-' + req.jobId.slice(-4));
  const bengaliDescription = req.overrideFields?.bengaliDescription || draft?.aiGeneratedContent?.bengaliDescription || existingJob?.bengaliDescription || '';
  const seoTitle = req.overrideFields?.seoTitle || draft?.aiGeneratedContent?.seoTitle || existingJob?.seoTitle || `${title} - ${organization} নিয়োগ বিজ্ঞপ্তি ২০২৬`;
  const seoDescription = req.overrideFields?.seoDescription || draft?.aiGeneratedContent?.seoDescription || existingJob?.seoDescription || '';
  const seoKeywords = req.overrideFields?.seoKeywords || draft?.aiGeneratedContent?.targetKeywords || existingJob?.seoKeywords || [title, organization, 'নিয়োগ বিজ্ঞপ্তি ২০২৬'];
  const faqItems = req.overrideFields?.faqItems || draft?.aiGeneratedContent?.faqItems || existingJob?.faqItems || [];
  const vacancies = req.overrideFields?.totalPosts || draft?.vacancies || existingJob?.totalPosts || 1;
  const salary = req.overrideFields?.salary || draft?.salary || existingJob?.salary || '২২,০০০ - ৫৩,০৬০ টাকা';
  const minEducation = req.overrideFields?.minEducation || draft?.minEducation || existingJob?.minEducation || 'স্নাতক বা সমমান';
  const govtFee = req.overrideFields?.govtFee ?? draft?.govtFee ?? existingJob?.govtFee ?? 200;
  const applicationUrl = req.overrideFields?.officialLink || draft?.sourceUrl || existingJob?.officialLink || 'https://alljobs.teletalk.com.bd';

  // 1. Validate Eligibility
  const validation = validatePublicationEligibility({
    title,
    organization,
    category,
    deadline,
    slug,
    bengaliDescription,
    seoTitle,
    seoDescription,
    applicationUrl,
    isCancellationNotice: Boolean(draft?.isCancellationNotice || (existingJob as any)?.isCancellationNotice),
    conflictSummary: draft?.conflictSummary,
    unresolvedWarnings: draft?.extractionWarnings
  }, req.jobId);

  if (!validation.canPublish) {
    if (queueId) {
      updateQueueItemStatus(queueId, 'FAILED', validation.blockers.join('; '));
    }
    return {
      success: false,
      jobId: req.jobId,
      validation,
      error: `প্রকাশনা আটকে দেওয়া হয়েছে: ${validation.blockers.join('; ')}`
    };
  }

  // 2. Prepare Canonical Job Record
  const isRepublish = Boolean(existingJob);
  const now = new Date().toISOString();
  const publishedDateBn = existingJob?.publishedDate || new Date().toLocaleDateString('bn-BD');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chakrisheba.com';
  const canonicalUrl = `${siteUrl}/jobs/${slug}`;

  const currentStatus = ((existingJob as any)?.publicationStatus || 'APPROVED') as PublicationStatus;
  const targetStatus: PublicationStatus = validation.warnings.length > 0 ? 'PUBLISHED_WITH_WARNINGS' : 'PUBLISHED';

  const transition = executeStatusTransition(currentStatus, targetStatus, req.adminId, req.note || (isRepublish ? 'কন্টেন্ট হালনাগাদ ও পুনঃপ্রকাশ' : 'প্রাথমিক প্রকাশনা'), {
    revisionId: req.revisionId,
    queueId
  });

  const canonicalJob: JobCircular = {
    id: req.jobId,
    title,
    organization,
    logo: existingJob?.logo || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
    category: category as any,
    categoryLabel: category === 'bank' ? 'ব্যাংক জব' : 'সরকারি চাকরি',
    grade: existingJob?.grade || draft?.grade || '৯ম গ্রেড',
    totalPosts: vacancies,
    salary,
    minEducation,
    minAge: existingJob?.minAge || 18,
    maxAge: existingJob?.maxAge || 32,
    districts: existingJob?.districts || 'সকল জেলা',
    deadline,
    daysRemaining: existingJob?.daysRemaining || 20,
    govtFee,
    serviceFee: 80,
    officialLink: applicationUrl,
    circularImage: existingJob?.circularImage || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
    circularPdfUrl: existingJob?.circularPdfUrl || (draft as any)?.pdfUrl || draft?.sourceUrl,
    audioSummary: `${title} - ${organization} প্রকাশিত হয়েছে।`,
    publishedDate: publishedDateBn,
    requirements: existingJob?.requirements || [minEducation, 'বয়স: ১৮-৩২ বছর'],
    seoTitle,
    seoDescription,
    seoKeywords,
    bengaliDescription,
    faqItems,
    aiGeneratedAt: now,
    slug,
    status: 'PUBLISHED',
    ...req.overrideFields
  };

  // Add Step 05 specific metadata to job
  (canonicalJob as any).publicationStatus = targetStatus;
  (canonicalJob as any).publishedRevisionId = req.revisionId;
  (canonicalJob as any).publishedAt = existingJob?.createdAt || now;
  (canonicalJob as any).lastUpdatedDate = isRepublish ? now : undefined;
  (canonicalJob as any).canonicalUrl = canonicalUrl;
  (canonicalJob as any).statusHistory = (existingJob as any)?.statusHistory || [];
  if (transition.transition) {
    (canonicalJob as any).statusHistory.push(transition.transition);
  }

  // 3. Create or reuse Immutable Publication Snapshot (True Idempotency)
  const allSnapshots = serverDB.getPublicationSnapshots ? serverDB.getPublicationSnapshots() : {};
  const jobSnapshots = Object.values(allSnapshots).filter(s => s.jobId === req.jobId);

  // If identical revision is already published and no overrides, return existing active snapshot
  if (isRepublish && (existingJob as any)?.publishedRevisionId === req.revisionId && !req.overrideFields) {
    const existingSnap = (existingJob as any)?.activeSnapshotId ? allSnapshots[(existingJob as any).activeSnapshotId] : jobSnapshots.find(s => s.revisionId === req.revisionId);
    if (existingSnap) {
      return {
        success: true,
        jobId: req.jobId,
        job: existingJob || canonicalJob,
        snapshot: existingSnap,
        validation,
        isRepublish: true
      };
    }
  }

  const snapshot: PublicationSnapshot = {
    id: `snap-${req.jobId}-${Date.now().toString(36)}`,
    jobId: req.jobId,
    draftId: req.draftId,
    revisionId: req.revisionId,
    publishedAt: now,
    publishedBy: req.adminId,
    versionNumber: jobSnapshots.length + 1,
    changeSummary: req.note || (isRepublish ? 'কন্টেন্ট হালনাগাদ' : 'প্রাথমিক প্রকাশনা'),
    contentSnapshot: {
      title,
      bengaliDescription,
      faqItems
    },
    factsSnapshot: {
      organization,
      vacancies,
      deadline,
      salary,
      govtFee,
      minEducation,
      applicationUrl
    },
    seoSnapshot: {
      seoTitle,
      seoDescription,
      seoKeywords,
      slug,
      canonicalUrl
    },
    schemaSnapshot: {
      jobPostingSchema: {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": title,
        "datePosted": now.split('T')[0],
        "hiringOrganization": { "@type": "Organization", "name": organization }
      }
    }
  };

  if (serverDB.savePublicationSnapshot) {
    serverDB.savePublicationSnapshot(snapshot);
  }
  (canonicalJob as any).activeSnapshotId = snapshot.id;

  // 4. Save Job to DB (with activeSnapshotId attached)
  serverDB.saveJob(canonicalJob, req.adminId);

  // If this was from a draft, mark draft as approved as well
  if (draft && serverDB.saveCircularDraft) {
    draft.status = 'approved';
    draft.approvedJobId = req.jobId;
    serverDB.saveCircularDraft(draft);
  }

  // 5. Update Queue Status if processed from queue
  let processedQueueItem: PublishingQueueItem | undefined = undefined;
  if (queueId) {
    const updated = updateQueueItemStatus(queueId, 'COMPLETED');
    if (updated) processedQueueItem = updated;
  }

  // 6. Log Audit
  if (serverDB.addPublicationAuditLog) {
    serverDB.addPublicationAuditLog({
      id: 'aud-' + Date.now().toString(36),
      jobId: req.jobId,
      action: isRepublish ? 'REPUBLISH' : 'PUBLISH_NEW',
      actor: req.adminId,
      timestamp: now,
      details: {
        revisionId: req.revisionId,
        snapshotId: snapshot.id,
        status: targetStatus,
        slug
      }
    });
  }

  return {
    success: true,
    jobId: req.jobId,
    job: canonicalJob,
    snapshot,
    validation,
    queueItem: processedQueueItem,
    isRepublish
  };
}
