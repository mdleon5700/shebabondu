import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { serverDB } from '@/lib/db';
import { WalletTransaction } from '@/lib/types';

export async function GET(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  let targetId = (session.role === 'admin' && searchParams.get('candidateId'))
    ? searchParams.get('candidateId')!
    : session.candidateId;

  let candidate = serverDB.getCandidateById(targetId);
  if (!candidate && session.role === 'admin') {
    const all = serverDB.getAllCandidates();
    if (all.length > 0) {
      candidate = all[0];
      targetId = candidate.id;
    }
  }

  const txs = serverDB.getTransactions(targetId);
  return NextResponse.json({
    walletBalance: candidate?.walletBalance || 0,
    transactions: txs,
    success: true
  });
}

export async function POST(req: Request) {
  const session = getServerSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { amount, type, description, method, trxId, idempotencyKey } = body;

    let targetId = (session.role === 'admin' && body.candidateId)
      ? body.candidateId
      : session.candidateId;

    let candidate = serverDB.getCandidateById(targetId);
    if (!candidate && session.role === 'admin') {
      const all = serverDB.getAllCandidates();
      if (all.length > 0) {
        candidate = all[0];
        targetId = candidate.id;
      }
    }

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'সঠিক টাকার পরিমাণ দিন' }, { status: 400 });
    }

    if (session.role !== 'admin' && (type && type !== 'recharge')) return NextResponse.json({ error: 'Only recharge requests are allowed.' }, { status: 403 });
    if (!['bKash', 'Nagad', ...(session.role === 'admin' ? ['Bank', 'Wallet'] : [])].includes(method || 'bKash')) return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    if (typeof trxId !== 'string' || !/^[a-zA-Z0-9-]{4,100}$/.test(trxId.trim())) return NextResponse.json({ error: 'সঠিক পেমেন্ট TrxID প্রদান করুন।' }, { status: 400 });
    const newTx: WalletTransaction = {
      id: 'TXN-' + randomUUID(),
      date: new Date().toLocaleString('bn-BD'),
      amount: Number(amount),
      type: type || 'recharge',
      description: description || 'ওয়ালেট রিচার্জ আবেদন',
      method: method || 'bKash',
      trxId: trxId.trim().toUpperCase(),
      status: session.role === 'admin' ? 'completed' : 'pending'
    };

    const res = serverDB.addTransaction(targetId, newTx, idempotencyKey);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      transaction: res.tx,
      newBalance: res.newBalance,
      message: session.role === 'admin' ? 'লেনদেন সংরক্ষিত হয়েছে।' : 'রিচার্জ আবেদন জমা হয়েছে। অ্যাডমিন যাচাইয়ের পর ব্যালেন্স যুক্ত হবে।'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
