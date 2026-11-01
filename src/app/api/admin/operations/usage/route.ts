import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { PlatformUsageAnalytics } from '@/lib/operations';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const snapshot = PlatformUsageAnalytics.getSnapshot();

    return NextResponse.json({
      success: true,
      snapshot
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to calculate usage analytics' }, { status: 500 });
  }
}
