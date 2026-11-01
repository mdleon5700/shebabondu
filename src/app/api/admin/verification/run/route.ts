import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { verifyCircularDraft, verifyAllPendingDrafts } from '@/lib/verification';

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { draftId, runAll, skipAi, forceRerun } = body;

    if (runAll) {
      const report = await verifyAllPendingDrafts(session.candidateId);
      return NextResponse.json({ success: true, report });
    }

    if (!draftId) {
      return NextResponse.json({ error: 'VALIDATION_ERROR: draftId অথবা runAll=true নির্দিষ্ট করা আবশ্যক' }, { status: 400 });
    }

    const result = await verifyCircularDraft(draftId, {
      skipAi: Boolean(skipAi),
      forceRerun: Boolean(forceRerun),
      adminId: session.candidateId
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'ভেরিফিকেশন এক্সিকিউশন ব্যর্থ হয়েছে' }, { status: 500 });
  }
}
