import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { intakeVerifiedJobData, generateArticleOutline, generateKeywordSuggestions, generateContentBrief } from '@/lib/content_studio';

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
    let brief = state?.brief;
    if (!brief) {
      const kwSet = generateKeywordSuggestions(intake.facts);
      brief = generateContentBrief(intake.facts, kwSet.primary, kwSet.secondary, kwSet.related);
    }

    const outline = generateArticleOutline(brief, intake.facts);

    if (state) {
      state.outline = outline;
      state.status = 'OUTLINE_READY';
      serverDB.saveContentStudioState(state);
    }

    return NextResponse.json({ success: true, outline });
  }

  // Update existing outline sections
  if (state && body.sections) {
    state.outline = {
      briefId: state.brief?.jobIdOrDraftId || draftId,
      sections: body.sections,
      generatedAt: state.outline?.generatedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.status = 'OUTLINE_READY';
    serverDB.saveContentStudioState(state);
    return NextResponse.json({ success: true, outline: state.outline });
  }

  return NextResponse.json({ error: 'অবৈধ অনুরোধ' }, { status: 400 });
}
