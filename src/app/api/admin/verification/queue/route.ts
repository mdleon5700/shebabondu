import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { getVerificationQueueItems, enqueueVerificationTask, processVerificationQueue } from '@/lib/verification';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const items = getVerificationQueueItems();
  return NextResponse.json({ success: true, count: items.length, queue: items });
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, draftId, trigger, priority, contentHash, maxItems, skipAi } = body;

    if (action === 'process') {
      const result = await processVerificationQueue({ maxItems, skipAi });
      return NextResponse.json({ success: true, result });
    }

    if (!draftId) {
      return NextResponse.json({ error: 'draftId আবশ্যক' }, { status: 400 });
    }

    const queued = enqueueVerificationTask({
      draftId,
      trigger,
      priority,
      contentHash
    });

    return NextResponse.json({ success: true, item: queued });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
