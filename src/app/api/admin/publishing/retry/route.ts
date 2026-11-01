import { NextResponse } from 'next/server';
import { updateQueueItemStatus } from '@/lib/publishing/queue';
import { publishJobNow } from '@/lib/publishing/orchestrator';
import { serverDB } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const adminPin = req.headers.get('x-admin-pin');
    if (adminPin && adminPin !== '1234') {
      return NextResponse.json({ error: 'UNAUTHORIZED: Invalid admin credentials.' }, { status: 401 });
    }

    const body = await req.json();
    const { queueId, adminId } = body;

    if (!queueId) {
      return NextResponse.json({ error: 'queueId is required.' }, { status: 400 });
    }

    const queue = serverDB.getPublishingQueue ? serverDB.getPublishingQueue() : {};
    const item = queue[queueId];

    if (!item) {
      return NextResponse.json({ error: 'কিউ আইটেমটি পাওয়া যায়নি।' }, { status: 404 });
    }

    // Attempt re-publishing
    updateQueueItemStatus(queueId, 'PROCESSING');
    const res = publishJobNow({
      jobId: item.jobId,
      draftId: item.draftId,
      revisionId: item.revisionId,
      adminId: adminId || 'ADMIN',
      note: 'ম্যানুয়াল রিট্রাই প্রকাশনা'
    }, queueId);

    if (!res.success) {
      return NextResponse.json({
        success: false,
        error: res.error,
        validation: res.validation
      }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      job: res.job,
      snapshot: res.snapshot
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
