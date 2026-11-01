'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wallet, Plus, ShieldCheck, History, ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { storage } from '@/lib/store';
import { CandidateProfile, WalletTransaction } from '@/lib/types';
import { useCandidateData } from '@/components/CandidateDataProvider';

export default function WalletPage() {
  const candidateData = useCandidateData();
  const [trxId, setTrxId] = useState('');
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile>(storage.getUser());
  const [amount, setAmount] = useState('300');
  const [method, setMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [isRecharging, setIsRecharging] = useState(false);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // 1. Local user
    setProfile(storage.getUser());

    // 2. Fetch server wallet balance
    const fetchBalance = async () => {
      try {
        const res = await fetch('/api/wallet/transactions');
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions || []);
          if (typeof data.walletBalance === 'number') {
            setProfile(prev => ({ ...prev, walletBalance: data.walletBalance }));
          }
        }
      } catch (err) {
        console.warn('Wallet fetch warning', err);
      }
    };
    fetchBalance();
    window.addEventListener('focus', fetchBalance);
    return () => window.removeEventListener('focus', fetchBalance);
  }, []);

  useEffect(() => {
    if (candidateData.profile) setProfile(candidateData.profile);
  }, [candidateData.profile]);

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    const add = parseInt(amount, 10) || 0;
    if (add <= 0) return;

    setIsRecharging(true);
    setRechargeSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/wallet/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: add,
          type: 'recharge',
          description: `ওয়ালেট ব্যালেন্স রিচার্জ (${method === 'bKash' ? 'বিকাশ' : 'নগদ'})`,
          method: method,
          trxId: trxId.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'রিচার্জ আবেদন ব্যর্থ হয়েছে');
      if (data.transaction) setTransactions(previous => [data.transaction, ...previous]);
      await candidateData.refresh();
      setRechargeSuccess(true);
      setTrxId('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'রিচার্জ আবেদন ব্যর্থ হয়েছে');
    } finally {
      setIsRecharging(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="space-y-6 max-w-4xl animate-pulse p-6">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-44 bg-slate-100 rounded-3xl mb-4"></div>
        <div className="h-64 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-emerald-700" />
          <span>আমার ওয়ালেট ও ক্যাশ ম্যানেজমেন্ট</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          যেকোনো চাকরির সরকারি ফি ও সার্ভিস চার্জ তাৎক্ষণিক পরিশোধের জন্য নিরাপদ ডিজিটাল ওয়ালেট।
        </p>
      </div>

      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-300">বর্তমান ওয়ালেট ব্যালেন্স</span>
          <div className="text-4xl font-black text-emerald-400">৳{profile.walletBalance || 0}</div>
          <div className="text-xs text-slate-400 pt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>যাচাইকৃত ব্যালেন্স দিয়ে আবেদন ফি পরিশোধ করুন</span>
          </div>
        </div>

        <Link
          href="/dashboard/transactions"
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-center"
        >
          <History className="w-4 h-4" />
          <span>লেনদেন হিস্ট্রি দেখুন</span>
        </Link>
      </div>

      {transactions.length > 0 && <div className="bg-white rounded-2xl border p-5 space-y-3">
        <h2 className="text-xl font-bold">ওয়ালেট লেনদেন ও যাচাইয়ের অবস্থা</h2>
        {transactions.map(transaction => <div key={transaction.id} className="flex flex-wrap justify-between gap-2 border-b py-2">
          <span className="break-all">{transaction.trxId} · ৳{transaction.amount}</span>
          <span>{transaction.status === 'pending' ? 'যাচাইয়ের অপেক্ষায়' : transaction.status === 'failed' ? 'বাতিল' : 'অনুমোদিত'}</span>
        </div>)}
      </div>}

      {/* Instant Recharge Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">ব্যালেন্স রিচার্জ করুন (বিকাশ / নগদ)</h3>
          <span className="text-[11px] font-bold text-slate-500">পেমেন্ট যাচাই সাপেক্ষে</span>
        </div>
        
        {rechargeSuccess && (
          <div className="p-3.5 bg-emerald-50 text-emerald-900 rounded-2xl text-xs font-bold border border-emerald-300 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>রিচার্জ আবেদন জমা হয়েছে। অ্যাডমিন যাচাইয়ের পর ব্যালেন্স যুক্ত হবে। বর্তমান ব্যালেন্স: ৳{profile.walletBalance}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 text-rose-900 rounded-2xl text-xs font-bold border border-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleRecharge} className="space-y-4 text-xs">
          {/* Method Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">পেমেন্ট মেথড নির্বাচন:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('bKash')}
                className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  method === 'bKash' ? 'bg-pink-50 border-pink-400 text-pink-900 shadow-2xs font-black' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>বিকাশ (bKash)</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('Nagad')}
                className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  method === 'Nagad' ? 'bg-orange-50 border-orange-400 text-orange-900 shadow-2xs font-black' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>নগদ (Nagad)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">রিচার্জের পরিমাণ (টাকা):</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {['200', '300', '500', '1000'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`p-2.5 rounded-xl border font-bold transition-all cursor-pointer ${
                    amount === val ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-black shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  ৳{val}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all"
              required
              min="50"
            />
          </div>

          <div>
            <label htmlFor="wallet-trx-id" className="font-bold text-slate-700 block mb-1">পেমেন্ট ট্রানজ্যাকশন ID (TrxID):</label>
            <input id="wallet-trx-id" value={trxId} onChange={event => setTrxId(event.target.value)} required minLength={4} maxLength={100} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base" />
          </div>

          <button
            type="submit"
            disabled={isRecharging}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isRecharging ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>রিচার্জ প্রসেস হচ্ছে...</span>
              </>
            ) : (
              <span>{method === 'bKash' ? 'বিকাশ' : 'নগদ'} রিচার্জ যাচাইয়ের আবেদন করুন (৳{amount})</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}