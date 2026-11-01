import { NextResponse } from 'next/server';
import { DeadlineMonitoringEngine } from '@/lib/deadlines/monitoring';
import { verifyAdminSecret } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Validate cron authentication header
  const authHeader = req.headers.get('authorization');
  const cronSecret = req.headers.get('x-cron-secret');
  const adminSecret = req.headers.get('x-admin-secret');

  const secretExpected = process.env.CRON_SECRET || process.env.ADMIN_SECRET_KEY;
  let isAuthorized = false;

  if (cronSecret && secretExpected && cronSecret === secretExpected) {
    isAuthorized = true;
  } else if (adminSecret && verifyAdminSecret(adminSecret)) {
    isAuthorized = true;
  } else if (authHeader?.startsWith('Bearer ') && secretExpected && authHeader.substring(7) === secretExpected) {
    isAuthorized = true;
  } else if (!secretExpected && process.env.NODE_ENV !== 'production') {
    // In local development / test, allow fallback
    isAuthorized = true;
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: 'UNAUTHORIZED: Invalid cron authentication' }, { status: 401 });
  }

  try {
    const record = await DeadlineMonitoringEngine.runReconciliation({
      adminId: 'CRON_SCHEDULER',
      force: false
    });

    return NextResponse.json({
      success: true,
      message: 'Scheduled deadline monitoring reconciliation finished successfully',
      record
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Cron execution failed' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Allow health checking of cron endpoint
  const stats = DeadlineMonitoringEngine.getMonitoringStats();
  return NextResponse.json({
    status: 'ACTIVE',
    cronEndpoint: '/api/cron/deadline-monitor',
    timezone: 'Asia/Dhaka (BST: UTC+6)',
    stats
  });
}
