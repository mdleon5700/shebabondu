'use client';

import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { storage } from '@/lib/store';
import { WalletTransaction } from '@/lib/types';

export default function TransactionsPage() {
  const [txs, setTxs] = useState<WalletTransaction[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setTxs(storage.getTransactions());
    fetch('/api/wallet/transactions', { cache: 'no-store' }).then(res => res.ok ? res.json() : null).then(data => {
      if (Array.isArray(data?.transactions)) setTxs(data.transactions);
    }).catch(() => {});
  }, []);

  if (!isMounted) {
    return <div className="space-y-6 max-w-4xl animate-pulse p-6"><div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div><div className="h-32 bg-slate-100 rounded-2xl"></div></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <History className="w-6 h-6 text-emerald-700" />
          <span>লেনদেন ও পেমেন্ট হিস্ট্রি</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          আপনার ওয়ালেট রিচার্জ এবং বিভিন্ন চাকরির সরকারি ফি পরিশোধের পূর্ণাঙ্গ স্টেটমেন্ট।
        </p>
      </div>

      <div className="space-y-3">
        {txs.map((tx) => (
          <div
            key={tx.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                tx.type === 'recharge' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {tx.type === 'recharge' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">{tx.description}</h4>
                <div className="text-[11px] text-slate-400">TrxID: {tx.trxId} • {tx.date}</div>
              </div>
            </div>

            <div className="text-right">
              <div className={`font-bold text-sm sm:text-base ${
                tx.type === 'recharge' ? 'text-emerald-700' : 'text-slate-900'
              }`}>
                {tx.type === 'recharge' ? '+' : '-'}৳{tx.amount}
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {tx.status === 'pending' ? 'যাচাইয়ের অপেক্ষায়' : tx.status === 'failed' ? 'বাতিল' : 'সফল'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
