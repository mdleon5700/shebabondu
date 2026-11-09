'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wallet, 
  Plus, 
  ShieldCheck, 
  History, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check,
  Smartphone,
  Info,
  CreditCard,
  Zap,
  RotateCcw
} from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

  const officialNumber = '01774366643';
  const displayOfficialNumber = '01774-366643';

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cs_session_token') : null;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const handleCopyNumber = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(officialNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    setProfile(storage.getUser());

    const fetchBalance = async () => {
      try {
        setProfile(storage.getUser());
        const localTxs = storage.getTransactions();
        setTransactions(localTxs);
        const res = await fetch('/api/wallet/transactions', {
          headers: getAuthHeaders(),
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.transactions)) {
            const map = new Map<string, WalletTransaction>();
            localTxs.forEach((t: WalletTransaction) => map.set(t.id, t));
            data.transactions.forEach((t: WalletTransaction) => map.set(t.id, t));
            const merged = Array.from(map.values()).sort((a: WalletTransaction, b: WalletTransaction) => {
              const timeA = new Date(a.date).getTime() || 0;
              const timeB = new Date(b.date).getTime() || 0;
              return timeB - timeA;
            });
            setTransactions(merged);
          }
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
    window.addEventListener('cs_wallet_changed', fetchBalance);
    window.addEventListener('cs_txs_changed', fetchBalance);
    window.addEventListener('cs_user_changed', fetchBalance);
    return () => {
      window.removeEventListener('focus', fetchBalance);
      window.removeEventListener('cs_wallet_changed', fetchBalance);
      window.removeEventListener('cs_txs_changed', fetchBalance);
      window.removeEventListener('cs_user_changed', fetchBalance);
    };
  }, []);

  useEffect(() => {
    if (candidateData.profile) setProfile(candidateData.profile);
  }, [candidateData.profile]);

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    const add = parseInt(amount, 10) || 0;
    if (add <= 0) {
      setErrorMessage('অনুগ্রহ করে সঠিক টাকার পরিমাণ দিন।');
      return;
    }
    if (!trxId.trim() || trxId.trim().length < 4) {
      setErrorMessage('অনুগ্রহ করে সঠিক ট্রানজ্যাকশন আইডি (TrxID) প্রদান করুন।');
      return;
    }

    setIsRecharging(true);
    setRechargeSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/wallet/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          amount: add,
          type: 'recharge',
          description: `ওয়ালেট ব্যালেন্স রিচার্জ (${method === 'bKash' ? 'বিকাশ' : 'নগদ'})`,
          method: method,
          trxId: trxId.trim().toUpperCase()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'রিচার্জ আবেদন ব্যর্থ হয়েছে');
      if (data.transaction) {
        setTransactions(previous => [data.transaction, ...previous]);
        try { storage.addTransaction(data.transaction); } catch {}
      }
      if (typeof data.newBalance === 'number') {
        const u = storage.getUser();
        u.walletBalance = data.newBalance;
        storage.updateUser(u);
      }
      window.dispatchEvent(new Event('cs_wallet_changed'));
      window.dispatchEvent(new Event('cs_txs_changed'));
      window.dispatchEvent(new Event('cs_user_changed'));
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
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>১০০% সুরক্ষিত এন্টারপ্রাইজ লেজার</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-emerald-700" />
          <span>আমার ওয়ালেট ও ক্যাশ ম্যানেজমেন্ট</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          সরকারি বা ব্যাংক চাকরির আবেদন ফি, টেলিটক এসএমএস চার্জ ও প্রসেসিং ফি ১-ক্লিকে পরিশোধ করুন।
        </p>
      </div>

      {/* Hero Balance Card */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-300">বর্তমান ওয়ালেট ব্যালেন্স</span>
          <div className="text-4xl font-black text-emerald-400">৳{profile.walletBalance || 0}</div>
          <div className="text-xs text-slate-400 pt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>যাচাইকৃত ব্যালেন্স দিয়ে আবেদন ফি তাৎক্ষণিক পরিশোধযোগ্য</span>
          </div>
        </div>

        <Link
          href="/dashboard/transactions"
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-center"
        >
          <History className="w-4 h-4" />
          <span>লেনদেন হিস্ট্রি ও রিসিপ্ট দেখুন</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
        </Link>
      </div>

      {/* 4 Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
            <Zap className="w-4 h-4" />
            <span>১-ক্লিকে ফি পরিশোধ</span>
          </div>
          <p className="text-[11px] text-slate-500">আবেদনের শেষ মুহূর্তে ওটিপি বা পিন ছাড়াই এক-ক্লিকে আবেদন ফি সাবমিট।</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
            <CreditCard className="w-4 h-4" />
            <span>০% গেটওয়ে চার্জ</span>
          </div>
          <p className="text-[11px] text-slate-500">কোনো অতিরিক্ত ব্যাংক বা গেটওয়ে ট্রানজেকশন ফি ছাড়া সম্পূর্ণ ফ্রি।</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
            <RotateCcw className="w-4 h-4" />
            <span>তাৎক্ষণিক রিফান্ড গ্যারান্টি</span>
          </div>
          <p className="text-[11px] text-slate-500">আবেদন টেকনিক্যাল কারণে বাতিল হলে ওয়ালেটে সরাসরি রিফান্ড।</p>
        </div>
      </div>

      {/* Instant Recharge Module */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-700" />
              <span>ব্যালেন্স রিচার্জ করুন (বিকাশ / নগদ)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">নিচের নম্বরে টাকা পাঠিয়ে TrxID প্রদান করলেই অ্যাডমিন যাচাই করে ব্যালেন্স যুক্ত করবেন।</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl w-fit">
            ৫-১০ মিনিটে অ্যাক্টিভেশন
          </span>
        </div>
        
        {/* Step-by-Step Payment Instructions Card */}
        <div className="p-4 sm:p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  অফিসিয়াল {method === 'bKash' ? 'বিকাশ' : 'নগদ'} পার্সোনাল নম্বর (Send Money):
                </span>
                <span className="text-base font-black text-emerald-900 font-mono tracking-wider">
                  {displayOfficialNumber}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyNumber}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-xs ${
                copied 
                  ? 'bg-emerald-700 text-white' 
                  : 'bg-white hover:bg-slate-50 text-slate-800 border border-emerald-300'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-emerald-700" />}
              <span>{copied ? '✓ নম্বর কপি হয়েছে' : 'নম্বর কপি করুন'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 text-[11px] text-slate-600">
            <div className="bg-white/80 p-2 rounded-xl">
              <strong className="text-emerald-800 block">১. অ্যাপ ওপেন:</strong>
              {method === 'bKash' ? 'বিকাশ' : 'নগদ'} অ্যাপে ঢুকে Send Money নির্বাচন করুন
            </div>
            <div className="bg-white/80 p-2 rounded-xl">
              <strong className="text-emerald-800 block">২. নম্বর ইনপুট:</strong>
              {displayOfficialNumber} নম্বরে সমপরিমাণ টাকা সেন্ড করুন
            </div>
            <div className="bg-white/80 p-2 rounded-xl">
              <strong className="text-emerald-800 block">৩. TrxID কপি:</strong>
              কনফার্মেশন মেসেজ থেকে TrxID টি কপি করুন
            </div>
            <div className="bg-white/80 p-2 rounded-xl">
              <strong className="text-emerald-800 block">৪. আবেদন সাবমিট:</strong>
              নিচের ফরমে TrxID লিখে সাবমিট করুন
            </div>
          </div>
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

          {/* Amount presets */}
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

          {/* TrxID input */}
          <div>
            <label htmlFor="wallet-trx-id" className="font-bold text-slate-700 block mb-1">
              পেমেন্ট ট্রানজ্যাকশন ID (TrxID) <span className="text-rose-600">*</span>:
            </label>
            <input 
              id="wallet-trx-id" 
              value={trxId} 
              onChange={event => setTrxId(event.target.value.toUpperCase())} 
              placeholder="যেমন: BKL9839492 বা 7AH29D9" 
              required 
              minLength={4} 
              maxLength={100} 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold uppercase outline-none focus:border-emerald-600 focus:bg-white transition-all" 
            />
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

      {/* Recent Transactions Snapshot */}
      {transactions.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-700" />
              <span>সাম্প্রতিক ওয়ালেট লেনদেন ও স্ট্যাটাস ({transactions.length} টি)</span>
            </h2>
            <Link href="/dashboard/transactions" className="text-xs font-bold text-emerald-700 hover:underline">
              সম্পূর্ণ হিস্ট্রি ও রিসিপ্ট দেখুন →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">{tx.description}</div>
                  <div className="text-[11px] text-slate-400">TrxID: {tx.trxId} • {tx.method} • {tx.date}</div>
                </div>
                <div className="text-right">
                  <div className={`font-black text-sm ${tx.type === 'recharge' ? 'text-emerald-700' : 'text-slate-900'}`}>
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
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 text-center text-slate-500 text-xs">
          কোনো ওয়ালেট লেনদেন পাওয়া যায়নি। বিকাশ বা নগদ দিয়ে ব্যালেন্স রিচার্জ করে সরাসরি আবেদন ফি পরিশোধ করুন।
        </div>
      )}
    </div>
  );
}
