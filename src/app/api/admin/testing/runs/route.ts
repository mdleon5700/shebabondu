import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { TestRunManager } from '@/lib/testing/test-run-manager';
import { runAutonomousSpiderAudit } from '@/lib/testing';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const runId = searchParams.get('runId');

  if (runId) {
    const run = TestRunManager.getRun(runId);
    if (!run) {
      return NextResponse.json({ error: `Test run [${runId}] not found.` }, { status: 404 });
    }
    return NextResponse.json({ success: true, run });
  }

  const runs = TestRunManager.listRuns();
  const latestRun = TestRunManager.getLatestRun();

  return NextResponse.json({
    success: true,
    totalRuns: runs.length,
    latestRun,
    runs
  });
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // empty body is fine
    }

    const config = body.config || {};
    // Trigger the autonomous spider run
    const result = await runAutonomousSpiderAudit(config);

    return NextResponse.json({
      success: true,
      message: `Test run [${result.runId}] completed with status ${result.status}`,
      run: result
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to execute autonomous spider audit' },
      { status: 500 }
    );
  }
}
