import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { RecommendationFeedbackItem } from '@/lib/matching/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.jobId || !body.action) {
      return NextResponse.json({ error: 'jobId and action are required' }, { status: 400 });
    }

    if (body.action === 'UNDO_HIDE') {
      serverDB.deleteRecommendationFeedback(session.candidateId, body.jobId);
      return NextResponse.json({ success: true, message: 'Hide undone successfully' });
    }

    const item: RecommendationFeedbackItem = {
      id: `fb_${session.candidateId}_${body.jobId}_${Date.now()}`,
      candidateId: session.candidateId,
      jobId: body.jobId,
      action: body.action,
      note: body.note,
      createdAt: new Date().toISOString()
    };

    serverDB.saveRecommendationFeedback(item);

    return NextResponse.json({
      success: true,
      feedback: item
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
