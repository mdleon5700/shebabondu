import { NextResponse } from 'next/server';
import { cancelQueueItem } from '@/lib/publishing/queue';

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
