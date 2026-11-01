import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { OperationalExpenseManager } from '@/lib/operations';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || undefined;

    const report = OperationalExpenseManager.getVarianceReport(period);
    const config = OperationalExpenseManager.getBudgetConfig();

    return NextResponse.json({
      success: true,
      config,
      report
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch budget report' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();

    const updated = OperationalExpenseManager.updateBudgetConfig(body, session.candidateId);

    return NextResponse.json({
      success: true,
      message: 'Platform budget configuration updated successfully.',
      config: updated
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update budget' }, { status: 500 });
  }
}
