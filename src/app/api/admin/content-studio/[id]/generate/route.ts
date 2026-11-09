import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import {
  intakeVerifiedJobData,
  generateKeywordSuggestions,
  generateContentBrief,
  generateArticleOutline,
  generateStudioContent,
  analyzeSEO,
  validateArticleFacts,
  checkBengaliLanguageQuality,
  checkInternalContentUniqueness,
  createRevisionSnapshot
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

  try {
    const body = await req.json().catch(() => ({}));
    const intake = intakeVerifiedJobData(draft);

    if (!intake.canProceedToGeneration) {
      return NextResponse.json({
        error: 'এই সার্কুলারটিতে নিয়োগ বাতিল বা গুরুতর সমস্যা রয়েছে। কন্টেন্ট জেনারেশন সম্ভব নয়।',
        blockers: intake.blockers
      }, { status: 400 });
    }

    let state = serverDB.getContentStudioState(draftId);
    let brief = state?.brief;
    if (!brief) {
      const kwSet = generateKeywordSuggestions(intake.facts);
      brief = generateContentBrief(intake.facts, kwSet.primary, kwSet.secondary, kwSet.related);
    }

    let outline = state?.outline;
    if (!outline) {
      outline = generateArticleOutline(brief, intake.facts);
    }

    // Call Generator
    const genResult = await generateStudioContent(intake.facts, brief, outline, {
      lengthPreset: body.lengthPreset || 'standard',
      action: body.action || 'generate_all',
      sectionToRegenerate: body.sectionToRegenerate,
      customInstructions: body.customInstructions
    });

    if (!state) {
      const kwSet = generateKeywordSuggestions(intake.facts);
      state = {
        draftId,
        status: 'DRAFT_CREATED',
        brief,
        outline,
        article: genResult.article,
        blocks: genResult.blocks,
        seo: {
          seoTitle: `${intake.facts.jobTitle} - ${intake.facts.organization} নিয়োগ বিজ্ঞপ্তি ২০২৬ | চাকরি সেবা`,
          seoDescription: `${intake.facts.organization}-এ ${intake.facts.jobTitle} পদে নতুন নিয়োগ বিজ্ঞপ্তি ২০২৬। মোট পদ: ${intake.facts.vacancies}, শেষ সময়: ${intake.facts.applicationDeadline}। বিস্তারিত দেখুন।`,
          slug: `${intake.facts.organization.toLowerCase().replace(/[^a-z0-9]/g, '')}-2026-${draftId.slice(-6)}`,
          focusKeyword: brief.primaryKeyword,
          secondaryKeywords: brief.secondaryKeywords
        },
        internalLinks: [],
        revisions: [],
        lastSavedAt: new Date().toISOString()
      };
    } else {
      state.article = genResult.article;
      state.blocks = genResult.blocks;
      state.status = 'DRAFT_CREATED';
      state.lastSavedAt = new Date().toISOString();
    }

    // Run validations
    state.seoAnalysis = analyzeSEO(
      genResult.article.bengaliMarkdown,
      state.seo,
      intake.facts,
      state.internalLinks || []
    );
    state.factValidation = validateArticleFacts(
      genResult.article.bengaliMarkdown,
      intake.facts
    );
    state.bengaliQuality = checkBengaliLanguageQuality(
      genResult.article.bengaliMarkdown,
      state.seo.focusKeyword,
      state.seo.secondaryKeywords
    );
    state.uniqueness = checkInternalContentUniqueness(
      draftId,
      genResult.article.title,
      genResult.article.bengaliMarkdown
    );

    // Snapshot revision
    const rev = createRevisionSnapshot(
      state,
      session.candidateId || 'AI Engine',
      genResult.isAiGenerated ? `Gemini AI জেনারেটেড (${genResult.modelUsed})` : 'ডিটারমিনিস্টিক পিওর বাংলা টেমপ্লেট'
    );
    if (!state.revisions) state.revisions = [];
    state.revisions.unshift(rev);
    state.currentRevisionId = rev.id;

    serverDB.saveContentStudioState(state);

    return NextResponse.json({
      success: true,
      article: genResult.article,
      blocks: genResult.blocks,
      isAiGenerated: genResult.isAiGenerated,
      modelUsed: genResult.modelUsed,
      durationMs: genResult.durationMs,
      state
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
