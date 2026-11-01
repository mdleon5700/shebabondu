import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { generateBengaliJobContentWithGemini } from '@/lib/collector/gemini_job_writer';

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const { draftId, draft: providedDraft } = await req.json();
    let targetDraft = providedDraft;

    if (!targetDraft && draftId) {
      const drafts = serverDB.getCircularDrafts();
      targetDraft = drafts.find(d => d.id === draftId);
    }

    if (!targetDraft) {
      return NextResponse.json({ error: 'ড্রাফট সার্কুলার খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    const generated = await generateBengaliJobContentWithGemini(targetDraft);

    // Persist to draft record in DB if draftId exists
    if (draftId && targetDraft) {
      const updatedDraft = {
        ...targetDraft,
        aiGeneratedContent: {
          bengaliDescription: generated.bengaliDescription,
          seoTitle: generated.seoTitle,
          seoDescription: generated.seoDescription,
          targetKeywords: generated.targetKeywords,
          faqItems: generated.faqItems,
          generatedAt: new Date().toISOString()
        }
      };
      serverDB.addCircularDraft(updatedDraft);
    }

    return NextResponse.json({
      success: true,
      content: generated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'AI জেনারেশন প্রক্রিয়ায় ত্রুটি ঘটেছে।' }, { status: 500 });
  }
}
