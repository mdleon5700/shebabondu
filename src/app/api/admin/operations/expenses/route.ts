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
    const category = searchParams.get('category') as any;
    const billingPeriod = searchParams.get('billingPeriod') || undefined;
    const costNature = searchParams.get('costNature') as any;
    const paymentStatus = searchParams.get('paymentStatus') as any;
    const provider = searchParams.get('provider') || undefined;

    const expenses = OperationalExpenseManager.getExpenses({
      category,
      billingPeriod,
      costNature,
      paymentStatus,
      provider
    });

    const totalBdt = expenses.reduce((acc, curr) => acc + curr.amountBdt, 0);

    return NextResponse.json({
      success: true,
      count: expenses.length,
      totalBdt,
      expenses
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();

    if (!body.title || !body.category || !body.provider || !body.billingPeriod || body.amount === undefined) {
      return NextResponse.json(
        { error: 'BAD_REQUEST: Missing required fields (title, category, provider, billingPeriod, amount).' },
        { status: 400 }
      );
    }

    const created = OperationalExpenseManager.addExpense({
      title: body.title.trim(),
      category: body.category,
      provider: body.provider.trim(),
      billingPeriod: body.billingPeriod.trim(),
      amount: Number(body.amount),
      currency: body.currency === 'USD' ? 'USD' : 'BDT',
      amountBdt: body.amountBdt ? Number(body.amountBdt) : undefined,
      costNature: body.costNature === 'ESTIMATED_USAGE' ? 'ESTIMATED_USAGE' : 'ACTUAL_BILLED',
      paymentStatus: body.paymentStatus || 'paid',
      expenseDate: body.expenseDate || new Date().toISOString().slice(0, 10),
      invoiceNumber: body.invoiceNumber ? body.invoiceNumber.trim() : undefined,
      supportingDocUrl: body.supportingDocUrl ? body.supportingDocUrl.trim() : undefined,
      notes: body.notes ? body.notes.trim() : undefined,
      createdBy: session.candidateId
    });

    return NextResponse.json({
      success: true,
      message: 'Operational expense recorded successfully.',
      expense: created
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create expense' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'BAD_REQUEST: Expense ID is required.' }, { status: 400 });
    }

    const updated = OperationalExpenseManager.updateExpense(body.id, body, session.candidateId);
    if (!updated) {
      return NextResponse.json({ error: 'NOT_FOUND: Expense not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Operational expense updated successfully.',
      expense: updated
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'BAD_REQUEST: Expense ID is required.' }, { status: 400 });
    }

    const deleted = OperationalExpenseManager.deleteExpense(id, session.candidateId);
    if (!deleted) {
      return NextResponse.json({ error: 'NOT_FOUND: Expense not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Operational expense deleted successfully.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete expense' }, { status: 500 });
  }
}
