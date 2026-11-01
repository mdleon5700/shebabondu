import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ success: true, transactions: serverDB.getWalletTransactions() }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PATCH(req: Request) {
  const session = getServerSession(req);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const { candidateId, transactionId, decision } = await req.json();
    if (!candidateId || !transactionId || !['approve', 'reject'].includes(decision)) return NextResponse.json({ error: 'Invalid recharge decision' }, { status: 400 });
    const result = serverDB.reviewWalletRecharge(candidateId, transactionId, decision, session.candidateId);
    return NextResponse.json(result, { status: result.success ? 200 : 409 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Recharge review failed' }, { status: 500 });
  }
}
