import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { intakeVerifiedJobData, generateKeywordSuggestions, generateContentBrief } from '@/lib/content_studio';

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

  const body = await req.json().catch(() => ({}));
  const state = serverDB.getContentStudioState(draftId);
  const intake = intakeVerifiedJobData(draft);

  if (body.action === 'regenerate') {
    const kwSet = generateKeywordSuggestions(intake.facts);
    const brief = generateContentBrief(intake.facts, kwSet.primary, kwSet.secondary, kwSet.related);

    if (state) {
      state.brief = brief;
      state.status = 'BRIEF_CREATED';
      serverDB.saveContentStudioState(state);
    }

    return NextResponse.json({ success: true, brief, keywords: kwSet.allKeywords });
  }

  // Update existing brief
  if (state && body.brief) {
    state.brief = {
      ...state.brief,
      ...body.brief,
      updatedAt: new Date().toISOString()
    };
    serverDB.saveContentStudioState(state);
    return NextResponse.json({ success: true, brief: state.brief });
  }

  return NextResponse.json({ error: 'অবৈধ অনুরোধ' }, { status: 400 });
}
