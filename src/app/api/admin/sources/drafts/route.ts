import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  const drafts = serverDB.getCircularDrafts();
  return NextResponse.json({ success: true, drafts });
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const { action, draftId, overrides } = await req.json();
    if (action === 'approve') {
      const createdJob = serverDB.approveCircularDraft(draftId, session.candidateId, overrides);
      if (!createdJob) return NextResponse.json({ error: 'ড্রাফট পাওয়া যায়নি' }, { status: 404 });
      return NextResponse.json({ success: true, job: createdJob });
    } else if (action === 'reject') {
      const success = serverDB.rejectCircularDraft(draftId, session.candidateId);
      return NextResponse.json({ success });
    }
    return NextResponse.json({ error: 'অজ্ঞাত অ্যাকশন' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
