import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import {
  intakeVerifiedJobData,
  analyzeSEO,
  validateArticleFacts,
  checkBengaliLanguageQuality,
  checkInternalContentUniqueness
} from '@/lib/content_studio';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, context: RouteContext) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin access required.' }, { status: 403 });
  }

  const draftId = (await context.params).id;
  const draft = serverDB.getCircularDraft ? serverDB.getCircularDraft(draftId) : null;
  if (!draft) {
    return NextResponse.json({ error: 'ড্রাফট পাওয়া যায়নি' }, { status: 404 });
  }

  const state = serverDB.getContentStudioState(draftId);
  if (!state || !state.article) {
    return NextResponse.json({ error: 'যাচাই করার মতো কোনো আর্টিকেল কন্টেন্ট নেই' }, { status: 400 });
  }

  const intake = intakeVerifiedJobData(draft);

  const seoAnalysis = analyzeSEO(
    state.article.bengaliMarkdown,
    state.seo,
    intake.facts,
    state.internalLinks || []
  );

  const factValidation = validateArticleFacts(
    state.article.bengaliMarkdown,
    intake.facts
  );

  const bengaliQuality = checkBengaliLanguageQuality(
    state.article.bengaliMarkdown,
    state.seo.focusKeyword,
    state.seo.secondaryKeywords
  );

  const uniqueness = checkInternalContentUniqueness(
    draftId,
    state.article.title,
    state.article.bengaliMarkdown
  );

  state.seoAnalysis = seoAnalysis;
  state.factValidation = factValidation;
  state.bengaliQuality = bengaliQuality;
  state.uniqueness = uniqueness;
  state.status = 'VALIDATING';
  serverDB.saveContentStudioState(state);

  return NextResponse.json({
    success: true,
    seoAnalysis,
    factValidation,
    bengaliQuality,
    uniqueness,
    canProceedToApproval: factValidation.canProceedToApproval
  });
}
