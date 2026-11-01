import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { restoreRevision } from '@/lib/content_studio';

interface RouteContext {
  params: { id: string };
}

export async function GET(req: Request, context: RouteContext) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin access required.' }, { status: 403 });
  }

  const draftId = context.params.id;
  const state = serverDB.getContentStudioState(draftId);
  if (!state) {
    return NextResponse.json({ error: 'স্টুডিও স্টেট পাওয়া যায়নি' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    revisions: state.revisions || [],
    currentRevisionId: state.currentRevisionId
  });
}

export async function POST(req: Request, context: RouteContext) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin access required.' }, { status: 403 });
  }

  const draftId = context.params.id;
  const state = serverDB.getContentStudioState(draftId);
  if (!state) {
    return NextResponse.json({ error: 'স্টুডিও স্টেট পাওয়া যায়নি' }, { status: 404 });
  }

  try {
    const { revisionId } = await req.json();
    if (!revisionId) {
      return NextResponse.json({ error: 'revisionId আবশ্যক' }, { status: 400 });
    }

    const { updatedState, restoredRevision } = restoreRevision(state, revisionId);
    if (!restoredRevision) {
      return NextResponse.json({ error: 'নির্দিষ্ট রিভিশন খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    serverDB.saveContentStudioState(updatedState);

    return NextResponse.json({
      success: true,
      message: `ভার্সন #${restoredRevision.versionNumber} সফলভাবে পুনরুদ্ধার করা হয়েছে।`,
      state: updatedState,
      restoredRevision
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
