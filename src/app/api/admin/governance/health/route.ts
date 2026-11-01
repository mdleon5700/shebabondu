import { NextResponse } from 'next/server';
import { AdminGovernanceRbac, PlatformHealthEngine } from '@/lib/governance';

export async function GET(req: Request) {
  const auth = AdminGovernanceRbac.authorizeRequest(req, 'system.health.view');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const report = await PlatformHealthEngine.getHealthReport();
    return NextResponse.json({
      success: true,
      report
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate platform health report' },
      { status: 500 }
    );
  }
}
