import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const candidateId = searchParams.get('candidateId') || undefined;
  const channel = searchParams.get('channel');
  const status = searchParams.get('status');

  let deliveries = serverDB.getNotificationDeliveries(candidateId);
  if (channel) {
    deliveries = deliveries.filter(d => d.channel === channel);
  }
  if (status) {
    deliveries = deliveries.filter(d => d.status === status);
  }

  const total = deliveries.length;
  const queued = deliveries.filter(d => d.status === 'QUEUED').length;
  const delivered = deliveries.filter(d => d.status === 'DELIVERED').length;
  const failed = deliveries.filter(d => d.status === 'FAILED').length;

  return NextResponse.json({
    success: true,
    metrics: { total, queued, delivered, failed },
    deliveries: deliveries.slice(0, 100)
  });
}
