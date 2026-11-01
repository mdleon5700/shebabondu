import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { AdminGovernanceRbac } from '@/lib/governance';
import { CentralAutomationEngine } from '@/lib/automation/engine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const auth = AdminGovernanceRbac.authorizeRequest(req, 'automation.manage');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const tasks = CentralAutomationEngine.getTasks();
    const history = CentralAutomationEngine.getExecutionHistory(30);
    const rules = CentralAutomationEngine.getRules();
    const overview = CentralAutomationEngine.getOverviewReport();

    return NextResponse.json({
      success: true,
      tasks,
      history,
      rules,
      overview
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const auth = AdminGovernanceRbac.authorizeRequest(req, 'automation.manage');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const adminId = session.candidateId || 'ADMIN-SUPER';
    const result = await CentralAutomationEngine.executeTaskManually(taskId, adminId);

    return NextResponse.json({
      success: true,
      message: result.messageBn,
      executionId: result.executionId
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'টাস্ক রান ব্যর্থ হয়েছে' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  const auth = AdminGovernanceRbac.authorizeRequest(req, 'automation.manage');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { taskId, targetStatus } = body;

    if (!taskId || !targetStatus || !['ACTIVE', 'PAUSED'].includes(targetStatus)) {
      return NextResponse.json({ error: 'taskId and targetStatus (ACTIVE|PAUSED) are required' }, { status: 400 });
    }

    const adminId = session.candidateId || 'ADMIN-SUPER';
    const updated = CentralAutomationEngine.toggleTaskStatus(taskId, targetStatus, adminId);

    if (!updated) {
      return NextResponse.json({ error: 'টাস্ক খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `টাস্ক স্ট্যাটাস সফলভাবে ${targetStatus === 'ACTIVE' ? 'সক্রিয়' : 'স্থগিত'} করা হয়েছে।`,
      task: updated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
