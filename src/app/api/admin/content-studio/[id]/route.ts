import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import {
  intakeVerifiedJobData,
  generateKeywordSuggestions,
  generateContentBrief,
  generateArticleOutline,
  generateDeterministicStudioArticle,
  generateInitialMetadata,
  analyzeSEO,
  validateArticleFacts,
  checkBengaliLanguageQuality,
  checkInternalContentUniqueness,
  recommendInternalLinks,
  createRevisionSnapshot,
  ContentStudioState
} from '@/lib/content_studio';

interface RouteContext {
  params: { id: string };
}

function resolveDraftOrJob(id: string) {
  let draft = serverDB.getCircularDraft ? serverDB.getCircularDraft(id) : null;
  if (!draft) {
    const job = serverDB.getJobByIdOrSlug(id);
    if (job) {
      draft = {
        id: job.id,
        extractedTitle: job.title,
        extractedOrg: job.organization,
        category: job.category as any,
        vacancies: job.totalPosts,
        salary: job.salary,
        grade: job.grade,
        minEducation: job.minEducation,
        minAge: job.minAge,
        maxAge: job.maxAge,
        districts: job.districts,
        deadline: job.deadline,
        officialLink: job.officialLink,
        pdfUrl: job.circularPdfUrl || (job as any).pdfUrl,
        status: 'approved',
        verificationResult: {
          status: job.lastVerifiedAt ? 'VERIFIED' : 'PENDING',
          confidenceScore: 95
        }
      } as any;
    }
  }
  return draft;
}

export async function GET(req: Request, context: RouteContext) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin access required.' }, { status: 403 });
  }

  const draftId = context.params.id;
  const draft = resolveDraftOrJob(draftId);
  if (!draft) {
    return NextResponse.json({ error: 'ড্রাফট বা সার্কুলার খুঁজে পাওয়া যায়নি' }, { status: 404 });
  }

  let state = serverDB.getContentStudioState(draftId);

  // If not already initialized, build full initial studio state
  if (!state) {
    const intake = intakeVerifiedJobData(draft);
    const kwSet = generateKeywordSuggestions(intake.facts);
    const brief = generateContentBrief(intake.facts, kwSet.primary, kwSet.secondary, kwSet.related);
    const outline = generateArticleOutline(brief, intake.facts);
    const initialArticle = generateDeterministicStudioArticle(intake.facts, brief, outline);
    const seoMeta = generateInitialMetadata(intake.facts, kwSet.primary.keyword);
    const internalLinks = recommendInternalLinks(intake.facts);

    const liveJob = serverDB.getJobByIdOrSlug(draftId);
    if (liveJob?.bengaliDescription) {
      initialArticle.article.bengaliMarkdown = liveJob.bengaliDescription;
    }

    const seoAnalysis = analyzeSEO(initialArticle.article.bengaliMarkdown, seoMeta, intake.facts, internalLinks);
    const factValidation = validateArticleFacts(initialArticle.article.bengaliMarkdown, intake.facts);
    const bengaliQuality = checkBengaliLanguageQuality(initialArticle.article.bengaliMarkdown, kwSet.primary.keyword, [
      ...kwSet.secondary.map(k => k.keyword)
    ]);
    const uniqueness = checkInternalContentUniqueness(draftId, initialArticle.article.title, initialArticle.article.bengaliMarkdown);

    state = {
      draftId,
      status: 'BRIEF_CREATED',
      brief,
      outline,
      article: initialArticle.article,
      blocks: initialArticle.blocks,
      seo: seoMeta,
      seoAnalysis,
      factValidation,
      bengaliQuality,
      uniqueness,
      internalLinks,
      revisions: [],
      lastSavedAt: new Date().toISOString()
    };

    // Save initial revision
    const initialRev = createRevisionSnapshot(state, session.candidateId || 'Super Admin', 'প্রাথমিক খসড়া তৈরি');
    state.revisions.push(initialRev);
    state.currentRevisionId = initialRev.id;

    serverDB.saveContentStudioState(state);
  }

  return NextResponse.json({ success: true, state });
}

export async function POST(req: Request, context: RouteContext) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin access required.' }, { status: 403 });
  }

  const draftId = context.params.id;
  const draft = resolveDraftOrJob(draftId);
  if (!draft) {
    return NextResponse.json({ error: 'ড্রাফট বা সার্কুলার খুঁজে পাওয়া যায়নি' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const currentState = serverDB.getContentStudioState(draftId);
    if (!currentState) {
      return NextResponse.json({ error: 'স্টুডিও স্টেট সক্রিয় নয়' }, { status: 400 });
    }

    const intake = intakeVerifiedJobData(draft);

    // Merge incoming updates
    const updatedState: ContentStudioState = {
      ...currentState,
      ...body,
      lastSavedAt: new Date().toISOString()
    };

    // Re-run validations
    if (updatedState.article) {
      updatedState.seoAnalysis = analyzeSEO(
        updatedState.article.bengaliMarkdown,
        updatedState.seo,
        intake.facts,
        updatedState.internalLinks
      );
      updatedState.factValidation = validateArticleFacts(
        updatedState.article.bengaliMarkdown,
        intake.facts
      );
      updatedState.bengaliQuality = checkBengaliLanguageQuality(
        updatedState.article.bengaliMarkdown,
        updatedState.seo.focusKeyword,
        updatedState.seo.secondaryKeywords
      );
    }

    // Create a revision if requested or every manual save
    if (body.createRevision !== false) {
      const rev = createRevisionSnapshot(
        updatedState,
        session.candidateId || 'Admin',
        body.changeSummary || 'ম্যানুয়াল সম্পাদনা ও সংরক্ষণ'
      );
      if (!updatedState.revisions) updatedState.revisions = [];
      updatedState.revisions.unshift(rev); // newest first
      if (updatedState.revisions.length > 20) {
        updatedState.revisions = updatedState.revisions.slice(0, 20);
      }
      updatedState.currentRevisionId = rev.id;
    }

    serverDB.saveContentStudioState(updatedState);

    // Synchronize to live JobCircular if applicable
    const liveJob = serverDB.getJobByIdOrSlug(draftId);
    if (liveJob) {
      const updatedMarkdown = updatedState.article?.bengaliMarkdown || '';
      serverDB.saveJob({
        id: liveJob.id,
        bengaliDescription: updatedMarkdown || liveJob.bengaliDescription,
        seoTitle: updatedState.seo?.seoTitle || liveJob.seoTitle,
        seoDescription: updatedState.seo?.seoDescription || liveJob.seoDescription,
        seoKeywords: updatedState.seo?.secondaryKeywords || liveJob.seoKeywords,
        slug: updatedState.seo?.slug || liveJob.slug
      }, session.candidateId || 'ADMIN');
    }

    return NextResponse.json({ success: true, state: updatedState });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
