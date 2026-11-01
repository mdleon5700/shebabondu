import { getServerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { computePublishingAnalytics } from '@/lib/publishing/analytics';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }
  try {
    const summary = computePublishingAnalytics();
    return NextResponse.json({
      success: true,
      analytics: summary
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
