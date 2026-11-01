import { NextResponse } from 'next/server';
import { AdminGovernanceRbac } from '@/lib/governance';
import { CentralAnalyticsEngine } from '@/lib/analytics/engine';

export async function GET(req: Request) {
  const auth = AdminGovernanceRbac.authorizeRequest(req, 'analytics.view');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const timeframe = (searchParams.get('timeframe') || 'all') as any;

    const report = CentralAnalyticsEngine.getPlatformOverviewReport(timeframe);

    return NextResponse.json({
      success: true,
      timeframe,
      report
    }, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to aggregate analytics report' },
      { status: 500 }
    );
  }
}
