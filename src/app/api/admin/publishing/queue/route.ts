import { NextResponse } from 'next/server';
import { serverDB } from '@/lib/db';
import { createPublishingQueueItem, enqueuePublishingItem } from '@/lib/publishing/queue';

export async function GET(req: Request) {
  try {
    const queue = serverDB.getPublishingQueue ? serverDB.getPublishingQueue() : {};
    const items = Object.values(queue).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      count: items.length,
      queue: items
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, draftId, revisionId, action, targetPublishTimeUtc, targetPublishTimeBst, adminId, priority } = body;

    if (!jobId || !revisionId) {
      return NextResponse.json({ error: 'jobId and revisionId are required.' }, { status: 400 });
    }

    const item = createPublishingQueueItem({
      jobId,
      draftId,
      revisionId,
      action: action || 'PUBLISH_NEW',
      targetPublishTimeUtc: targetPublishTimeUtc || new Date().toISOString(),
      targetPublishTimeBst: targetPublishTimeBst || new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' }),
      createdBy: adminId || 'ADMIN',
      priority
    });

    const res = enqueuePublishingItem(item);

    return NextResponse.json({
      success: true,
      item: res.item,
      isDuplicate: res.isDuplicate
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
