import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { intakeVerifiedJobData, validateArticleFacts } from '@/lib/content_studio';

interface RouteContext {
  params: { id: string };
}

export async function POST(req: Request, context: RouteContext) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin access required.' }, { status: 403 });
  }

  const draftId = context.params.id;
  const draft = serverDB.getCircularDraft ? serverDB.getCircularDraft(draftId) : null;
  if (!draft) {
    return NextResponse.json({ error: 'ড্রাফট পাওয়া যায়নি' }, { status: 404 });
  }

  const state = serverDB.getContentStudioState(draftId);
  if (!state || !state.article) {
    return NextResponse.json({ error: 'অনুমোদনের জন্য তৈরি কোনো আর্টিকেল পাওয়া যায়নি' }, { status: 400 });
  }

  const intake = intakeVerifiedJobData(draft);

  // 1. Fact Validation Gate before approval
  const factValidation = validateArticleFacts(state.article.bengaliMarkdown, intake.facts);
  if (!factValidation.canProceedToApproval) {
    return NextResponse.json({
      error: 'গুরুতর তথ্যের অসঙ্গতি থাকায় প্রকাশনা স্থগিত করা হয়েছে। অনুগ্রহ করে কনফ্লিক্ট বা অননুমোদিত তথ্য সমাধান করুন।',
      unsupportedClaims: factValidation.unsupportedClaims,
      conflictingClaims: factValidation.conflictingClaims
    }, { status: 400 });
  }

  // 2. Prepare publishing overrides
  const overrides = {
    title: state.article.title,
    bengaliDescription: state.article.bengaliMarkdown,
    seoTitle: state.seo.seoTitle,
    seoDescription: state.seo.seoDescription,
    seoKeywords: [state.seo.focusKeyword, ...(state.seo.secondaryKeywords || [])],
    faqItems: state.article.faqItems,
    slug: state.seo.slug,
    aiGeneratedAt: state.article.generatedAt
  };

  // 3. Invoke existing publishing workflow handoff
  const approvedJob = serverDB.approveCircularDraft(draftId, session.candidateId || 'Super Admin', overrides);
  if (!approvedJob) {
    return NextResponse.json({ error: 'সার্কুলার অনুমোদন ব্যর্থ হয়েছে' }, { status: 500 });
  }

  // 4. Update Studio State
  state.status = 'APPROVED';
  state.approvedBy = session.candidateId || 'Super Admin';
  state.approvedAt = new Date().toISOString();
  state.isPublished = true;
  state.publishedJobId = approvedJob.id;
  serverDB.saveContentStudioState(state);

  // 5. Send Notification
  if ((serverDB as any).addAdminNotification) {
    (serverDB as any).addAdminNotification({
      title: 'নতুন সার্কুলার প্রকাশিত হয়েছে',
      message: `${intake.facts.organization}-এর "${intake.facts.jobTitle}" বিজ্ঞপ্তিটি সম্পাদকীয় কন্টেন্ট ও এসইও সহ সফলভাবে প্রকাশিত হয়েছে।`,
      priority: 'normal'
    });
  }

  return NextResponse.json({
    success: true,
    message: 'নিয়োগ বিজ্ঞপ্তিটি সফলভাবে অনুমোদিত এবং পাবলিক সাইটে প্রকাশিত হয়েছে।',
    job: approvedJob,
    state
  });
}
