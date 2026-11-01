import { NextResponse } from 'next/server';
import { AdminGovernanceRbac } from '@/lib/governance';
import { CentralAutomationEngine } from '@/lib/automation/engine';

export async function GET(req: Request) {
  const auth = AdminGovernanceRbac.authorizeRequest(req, 'automation.manage');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const rules = CentralAutomationEngine.getRules();
    const evaluation = CentralAutomationEngine.evaluateIntelligentRules();

    return NextResponse.json({
      success: true,
      rules,
      evaluation
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to evaluate automation rules' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = AdminGovernanceRbac.authorizeRequest(req, 'automation.manage');
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action } = body;
    const adminId = req.headers.get('x-admin-id') || 'ADMIN-SUPER';

    if (action === 'toggle_rule') {
      const { ruleCode, isEnabled } = body;
      const updated = CentralAutomationEngine.toggleRule(ruleCode, Boolean(isEnabled), adminId);
      if (!updated) return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
      return NextResponse.json({ success: true, rule: updated });
    }

    if (action === 'toggle_task') {
      const { taskId, status } = body;
      const updated = CentralAutomationEngine.toggleTaskStatus(taskId, status, adminId);
      if (!updated) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      return NextResponse.json({ success: true, task: updated });
    }

    if (action === 'execute_task') {
      const { taskId } = body;
      const res = await CentralAutomationEngine.executeTaskManually(taskId, adminId);
      return NextResponse.json(res);
    }

    if (action === 'evaluate_rules') {
      const evalRes = CentralAutomationEngine.evaluateIntelligentRules();
      return NextResponse.json({ success: true, evaluation: evalRes });
    }

    return NextResponse.json({ error: `Unsupported automation action: ${action}` }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Automation action execution failed' },
      { status: 500 }
    );
  }
}
