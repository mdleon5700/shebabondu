import { getServerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cancelQueueItem } from '@/lib/publishing/queue';

export async function POST(req: Request) {
  try {
    const session = getServerSession(req);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json();
    const { queueId, adminId } = body;

    if (!queueId) {
      return NextResponse.json({ error: 'queueId is required.' }, { status: 400 });
    }

    const item = cancelQueueItem(queueId, adminId || 'ADMIN');
    if (!item) {
      return NextResponse.json({ error: 'কিউ আইটেমটি পাওয়া যায়নি।' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      queueItem: item
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
