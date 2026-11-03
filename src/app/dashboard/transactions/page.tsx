'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { History, ArrowDownLeft, ArrowUpRight, Wallet, ChevronRight } from 'lucide-react';
import { storage } from '@/lib/store';
import { WalletTransaction } from '@/lib/types';

export default function TransactionsPage() {
  const [txs, setTxs] = useState<WalletTransaction[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const loadTransactions = useCallback(() => {
    const local = storage.getTransactions();
    setTxs(local);
    fetch('/api/wallet/transactions', { cache: 'no-store' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data?.transactions)) {
          const map = new Map<string, WalletTransaction>();
          local.forEach(t => map.set(t.id, t));
          data.transactions.forEach((t: WalletTransaction) => map.set(t.id, t));
          const merged = Array.from(map.values()).sort((a, b) => {
            const timeA = new Date(a.date).getTime() || 0;
            const timeB = new Date(b.date).getTime() || 0;
            return timeB - timeA;
          });
          setTxs(merged);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setIsMounted(true);
    loadTransactions();

    window.addEventListener('cs_txs_changed', loadTransactions);
    window.addEventListener('cs_wallet_changed', loadTransactions);
    window.addEventListener('focus', loadTransactions);
    return () => {
      window.removeEventListener('cs_txs_changed', loadTransactions);
      window.removeEventListener('cs_wallet_changed', loadTransactions);
      window.removeEventListener('focus', loadTransactions);
    };
  }, [loadTransactions]);

  if (!isMounted) {
    return (
      <div className="space-y-6 max-w-4xl animate-pulse p-6">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-700" />
            <span>লেনদেন ও পেমেন্ট হিস্ট্রি</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার ওয়ালেট রিচার্জ এবং বিভিন্ন চাকরির সরকারি ফি পরিশোধের পূর্ণাঙ্গ স্টেটমেন্ট।
          </p>
        </div>

        <Link
          href="/dashboard/wallet"
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center shadow-xs"
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>ওয়ালেট ম্যানেজমেন্ট</span>
        </Link>
      </div>

      <div className="space-y-3">
        {txs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <History className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">কোনো লেনদেনের তথ্য পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              আপনি এখনো কোনো আবেদন ফি পরিশোধ বা রিচার্জ করেননি। ওয়ালেটে ব্যালেন্স যুক্ত করে সহজে চাকরির আবেদন সম্পন্ন করুন।
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/wallet"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                <span>ব্যালেন্স রিচার্জ করুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          txs.map((tx) => (
            <div
              key={tx.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4 transition-all hover:border-slate-300"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tx.type === 'recharge' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {tx.type === 'recharge' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{tx.description}</h4>
                  <div className="text-[11px] text-slate-400">
                    TrxID: {tx.trxId} • {tx.date}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`font-bold text-sm sm:text-base ${
                  tx.type === 'recharge' ? 'text-emerald-700' : 'text-slate-900'
                }`}>
                  {tx.type === 'recharge' ? '+' : '-'}৳{tx.amount}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  tx.status === 'pending'
                    ? 'text-amber-800 bg-amber-50 border-amber-200'
                    : tx.status === 'failed'
                    ? 'text-rose-800 bg-rose-50 border-rose-200'
                    : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                }`}>
                  {tx.status === 'pending' ? 'যাচাইয়ের অপেক্ষায়' : tx.status === 'failed' ? 'বাতিল' : 'অনুমোদিত / সফল'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
