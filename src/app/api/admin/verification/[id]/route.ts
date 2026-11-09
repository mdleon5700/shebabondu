import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { verifyCircularDraft } from '@/lib/verification';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const result = serverDB.getVerificationResult(params.id);
  if (!result) {
    // If no existing result, run verification now
    try {
      const liveResult = await verifyCircularDraft(params.id, { adminId: session.candidateId });
      return NextResponse.json({ success: true, result: liveResult });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'যাচাইকরণ ফলাফল পাওয়া যায়নি' }, { status: 404 });
    }
  }

  return NextResponse.json({ success: true, result });
}
