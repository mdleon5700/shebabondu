import { NextResponse } from 'next/server';
import { AdminGovernanceRbac } from '@/lib/governance';
import { CentralAutomationEngine } from '@/lib/automation/engine';

export async function GET(req: Request) {
  const auth = AdminGovernanceRbac.authorizeRequest(req, 'automation.manage');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const overview = CentralAutomationEngine.getOverviewReport();

    return NextResponse.json({
      success: true,
      overview
    }, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve automation overview' },
      { status: 500 }
    );
  }
}
