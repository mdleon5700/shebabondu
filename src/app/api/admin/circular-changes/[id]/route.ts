import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { CircularChangeDetector } from '@/lib/deadlines/change-detector';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const proposal = serverDB.getCircularChangeProposal(params.id);
  if (!proposal) {
    return NextResponse.json({ error: 'প্রস্তাবনাটি পাওয়া যায়নি' }, { status: 404 });
  }

  return NextResponse.json({ success: true, proposal });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, notes, reason } = body;

    if (action === 'approve') {
      const result = CircularChangeDetector.approveProposal(params.id, session.candidateId, notes);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: result.message, updatedJob: result.updatedJob });
    } else if (action === 'reject') {
      const ok = CircularChangeDetector.rejectProposal(params.id, session.candidateId, reason || 'অ্যাডমিন কর্তৃক বাতিল');
      if (!ok) {
        return NextResponse.json({ error: 'বাতিলকরণ ব্যর্থ হয়েছে' }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'প্রস্তাবনাটি সফলভাবে বাতিল করা হয়েছে' });
    } else {
      return NextResponse.json({ error: 'Invalid action: must be "approve" or "reject"' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
