import { NextResponse } from 'next/server';
import { getServerSession, verifyAdminSecret } from '@/lib/auth';
import { serverDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const isAdmin = (session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret));

  if (!isAdmin) {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  return NextResponse.json(
    { success: true, transactions: serverDB.getWalletTransactions() },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function PATCH(req: Request) {
  const adminSecret = req.headers.get('x-admin-secret') || req.headers.get('x-admin-key');
  const session = getServerSession(req);
  const isAdmin = (session && session.role === 'admin') || (adminSecret && verifyAdminSecret(adminSecret));

  if (!isAdmin) {
    return NextResponse.json({ error: 'FORBIDDEN: Admin privileges required.' }, { status: 403 });
  }

  try {
    const { candidateId, transactionId, decision } = await req.json();
    if (!candidateId || !transactionId || !['approve', 'reject'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid recharge decision' }, { status: 400 });
    }
    const adminId = session?.candidateId || 'ADMIN-SUPER';
    const result = serverDB.reviewWalletRecharge(candidateId, transactionId, decision, adminId);
    return NextResponse.json(result, { status: result.success ? 200 : 409 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Recharge review failed' },
      { status: 500 }
    );
  }
}
