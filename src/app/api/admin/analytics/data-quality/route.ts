import { NextResponse } from 'next/server';
import { AdminGovernanceRbac } from '@/lib/governance';
import { CentralAnalyticsEngine } from '@/lib/analytics/engine';

export async function GET(req: Request) {
  const auth = AdminGovernanceRbac.authorizeRequest(req, 'analytics.view');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const auditReport = CentralAnalyticsEngine.runDataQualityAudit();

    return NextResponse.json({
      success: true,
      auditReport
    }, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to execute data quality audit' },
      { status: 500 }
    );
  }
}
