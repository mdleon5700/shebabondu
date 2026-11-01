import { NextResponse } from 'next/server';
import { AdminGovernanceRbac, PlatformOverviewEngine } from '@/lib/governance';

export async function GET(req: Request) {
  const auth = AdminGovernanceRbac.authorizeRequest(req, 'audit.read');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const timeframe = (searchParams.get('timeframe') || 'all') as any;

    const metrics = PlatformOverviewEngine.getMetrics(timeframe);
    const activityStream = PlatformOverviewEngine.getActivityStream(15);

    return NextResponse.json({
      success: true,
      timeframe,
      metrics,
      activityStream
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to aggregate platform metrics' },
      { status: 500 }
    );
  }
}
