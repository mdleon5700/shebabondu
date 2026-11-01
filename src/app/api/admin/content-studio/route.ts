import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { intakeVerifiedJobData, generateKeywordSuggestions, generateInitialMetadata } from '@/lib/content_studio';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin access required.' }, { status: 403 });
  }

  const drafts = serverDB.getCircularDrafts ? serverDB.getCircularDrafts() : [];
  const publishedJobs = serverDB.getJobs ? serverDB.getJobs().slice(0, 30) : [];

  const queue: any[] = [];

  // 1. Queue from drafts
  for (const draft of drafts) {
    let csState = serverDB.getContentStudioState(draft.id);
    if (!csState) {
      const intake = intakeVerifiedJobData(draft);
      const kwSet = generateKeywordSuggestions(intake.facts);
      queue.push({
        draftId: draft.id,
        title: draft.extractedTitle,
        organization: draft.extractedOrg,
        category: draft.category,
        deadline: draft.deadline,
        vacancies: draft.vacancies,
        status: 'NOT_STARTED',
        verificationStatus: draft.verificationResult?.status || 'PENDING',
        confidenceScore: draft.verificationResult?.confidenceScore || draft.confidenceScore || 70,
        primaryKeyword: kwSet.primary.keyword,
        seoScore: 40,
        canProceedToGeneration: intake.canProceedToGeneration,
        blockers: intake.blockers,
        warnings: intake.warnings,
        lastSavedAt: null,
        isPublished: draft.status === 'approved',
        sourceType: 'draft'
      });
    } else {
      queue.push({
        draftId: draft.id,
        title: csState.article?.title || draft.extractedTitle,
        organization: csState.brief?.organization || draft.extractedOrg,
        category: draft.category,
        deadline: csState.brief?.requiredFacts?.deadline || draft.deadline,
        vacancies: draft.vacancies,
        status: csState.status,
        verificationStatus: draft.verificationResult?.status || 'PENDING',
        confidenceScore: draft.verificationResult?.confidenceScore || draft.confidenceScore || 70,
        primaryKeyword: csState.seo?.focusKeyword || csState.brief?.primaryKeyword,
        seoScore: csState.seoAnalysis?.score || 50,
        canProceedToGeneration: true,
        blockers: [],
        warnings: csState.factValidation?.warnings || [],
        lastSavedAt: csState.lastSavedAt,
        isPublished: csState.isPublished || draft.status === 'approved',
        sourceType: 'draft'
      });
    }
  }

  // 2. Queue from published jobs
  for (const job of publishedJobs) {
    // Avoid duplicates if draft has same id
    if (queue.some(q => q.draftId === job.id)) continue;

    let csState = serverDB.getContentStudioState(job.id);
    queue.push({
      draftId: job.id,
      title: csState?.article?.title || job.title,
      organization: csState?.brief?.organization || job.organization,
      category: job.category,
      deadline: job.deadline,
      vacancies: job.totalPosts,
      status: csState ? csState.status : 'PUBLISHED_LIVE',
      verificationStatus: job.lastVerifiedAt ? 'VERIFIED' : 'PENDING',
      confidenceScore: 95,
      primaryKeyword: csState?.seo?.focusKeyword || job.seoKeywords?.[0] || job.title,
      seoScore: csState?.seoAnalysis?.score || 65,
      canProceedToGeneration: true,
      blockers: [],
      warnings: [],
      lastSavedAt: csState?.lastSavedAt || job.updatedAt,
      isPublished: true,
      sourceType: 'job'
    });
  }

  return NextResponse.json({ success: true, count: queue.length, queue });
}
