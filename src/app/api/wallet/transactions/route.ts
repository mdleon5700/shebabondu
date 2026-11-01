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
    mode: 'simulated_prototype_mode'
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

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'সঠিক টাকার পরিমাণ দিন' }, { status: 400 });
    }

    const newTx: WalletTransaction = {
      id: `TXN-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString('bn-BD'),
      amount: Number(amount),
      type: type || 'recharge',
      description: description || 'ওয়ালেট ব্যালেন্স রিচার্জ (সিমুলেশন)',
      method: method || 'bKash',
      trxId: trxId || `BKL${Math.floor(10000000 + Math.random() * 90000000)}`,
      status: 'completed'
    };

    const res = serverDB.addTransaction(targetId, newTx, idempotencyKey);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      transaction: res.tx,
      newBalance: res.newBalance,
      message: 'লেনদেন সফলভাবে লেজারে যুক্ত হয়েছে (স্যান্ডবক্স মোড)'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
