import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { ApplicationRequest } from '@/lib/types';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = getServerSession(req);
  if (!session) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Authentication required' }, { status: 401 });
  }

  try {
    const { status, verificationType, notes, applicantCopyPdfUrl, teleTalkTrackingId, teleTalkPassword, corporateTrackingId, submissionChannel, trxId, senderPhone, paymentScreenshotUrl } = await req.json();
    const appId = params.id;

    // Strict role check: Candidates cannot approve their own payments or mark applications completed
    if (session.role !== 'admin' && (status === 'completed' || status === 'processing' || verificationType === 'officially_verified')) {
      return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required for this state transition.' }, { status: 403 });
    }

    const historyItem = {
      status: status,
      date: new Date().toISOString(),
      notes: notes || (status === 'completed' ? 'আবেদন সফলভাবে সম্পন্ন হয়েছে এবং স্লিপ প্রস্তুত।' : 'স্ট্যাটাস আপডেট করা হয়েছে।'),
      updatedBy: session.role === 'admin' ? 'Admin (' + session.candidateId + ')' : 'Candidate'
    };

    const extra: Partial<ApplicationRequest> = {
      ...(applicantCopyPdfUrl ? { applicantCopyPdfUrl } : {}),
      ...(teleTalkTrackingId ? { teleTalkTrackingId } : {}),
      ...(teleTalkPassword ? { teleTalkPassword } : {}),
      ...(corporateTrackingId ? { corporateTrackingId } : {}),
      ...(submissionChannel ? { submissionChannel } : {}),
      ...(trxId ? { trxId } : {}),
      ...(senderPhone ? { senderPhone } : {}),
      ...(paymentScreenshotUrl ? { paymentScreenshotUrl } : {}),
      statusHistory: [historyItem]
    };

    const updated = serverDB.updateAppStatus(
      session.candidateId,
      appId,
      status as ApplicationRequest['status'],
      verificationType as ApplicationRequest['verificationType'],
      notes,
      session.role === 'admin',
      extra
    );

    if (!updated) {
      return NextResponse.json({ error: 'আবেদনটি খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    if (session.role === 'admin') {
      serverDB.recordAdminAudit({
        adminId: session.candidateId,
        action: 'status_change' as any,
        targetId: appId,
        targetType: 'order',
        changes: { status: { new: status } },
        notes: notes || ('Application ' + appId + ' transitioned to ' + status)
      });
    }

    return NextResponse.json({ success: true, application: updated }, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
