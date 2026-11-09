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
  Lock, 
  CreditCard,
  Zap,
  RotateCcw,
  Percent,
  Copy,
  Check,
  Smartphone
} from 'lucide-react';
import { storage } from '@/lib/store';
import { CandidateProfile, WalletTransaction } from '@/lib/types';

export default function WalletPublicPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  // Recharge Form State
  const [amount, setAmount] = useState('300');
  const [method, setMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [trxId, setTrxId] = useState('');
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
    const auth = storage.getAuth();
    if (auth.isLoggedIn && auth.role === 'candidate') {
      setIsLoggedIn(true);
      const user = storage.getUser();
      setProfile(user);

      // Fetch live transactions from server
      fetch('/api/wallet/transactions', {
        headers: getAuthHeaders(),
        cache: 'no-store'
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && Array.isArray(data.transactions)) {
            setTransactions(data.transactions);
          }
          if (data && typeof data.walletBalance === 'number') {
            setProfile(prev => prev ? ({ ...prev, walletBalance: data.walletBalance }) : prev);
          }
        })
        .catch(() => {
          setTransactions(storage.getTransactions());
        });
    }
  }, []);

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    const add = parseInt(amount, 10) || 0;
    if (add <= 0 || !trxId.trim()) return;

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
          description: `ওয়ালেট রিচার্জ (${method === 'bKash' ? 'বিকাশ' : 'নগদ'})`,
          method,
          trxId: trxId.trim().toUpperCase()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'রিচার্জ আবেদন সম্পন্ন করা যায়নি।');
      }

      if (data.transaction) {
        setTransactions(prev => [data.transaction, ...prev]);
        try { storage.addTransaction(data.transaction); } catch {}
      }

      if (typeof data.newBalance === 'number') {
        const u = storage.getUser();
        u.walletBalance = data.newBalance;
        storage.updateUser(u);
        setProfile(u);
      }

      setRechargeSuccess(true);
      setTrxId('');
    } catch (err: any) {
      setErrorMessage(err.message || 'রিচার্জ আবেদন পাঠাতে ত্রুটি হয়েছে।');
    } finally {
      setIsRecharging(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">ডিজিটাল ওয়ালেট ও ফি ম্যানেজমেন্ট</span>
      </div>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>নিরাপদ আবেদন ফি পেমেন্ট হাব</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            চাকরি সেবা স্মার্ট ওয়ালেট
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            সরকারি ও ব্যাংক চাকরির আবেদন ফি, টেলিটক এসএমএস চার্জ ও সার্ভিস ফি ঝামেলাহীনভাবে সরাসরি ওয়ালেট থেকে ১-ক্লিকে পরিশোধ করুন।
          </p>
        </div>

        {isMounted && isLoggedIn && profile ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-center shrink-0 space-y-2">
            <span className="text-xs text-slate-300 font-bold block">বর্তমান ব্যালেন্স</span>
            <div className="text-3xl font-black text-emerald-400">৳{profile.walletBalance ?? 0}</div>
            <Link
              href="/dashboard/transactions"
              className="text-[11px] font-bold text-emerald-300 hover:text-white underline block"
            >
              লেনদেন হিস্ট্রি দেখুন →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2 shrink-0">
            <Link
              href="/login?redirect=/dashboard/wallet"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>লগইন করে ওয়ালেট ব্যালেন্স দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* 4 CORE WALLET ADVANTAGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: '১-ক্লিকে ফি পরিশোধ', desc: 'আবেদনের শেষ মুহূর্তে বারবার পিন/ওটিপির ঝামেলা নেই', icon: Zap },
          { title: '০% গেটওয়ে চার্জ', desc: 'কোনো অতিরিক্ত ব্যাংক বা গেটওয়ে ট্রানজেকশন ফি নেই', icon: Percent },
          { title: 'তাৎক্ষণিক রিফান্ড গ্যারান্টি', desc: 'আবেদন বাতিল বা কোটা অমিল হলে ওয়ালেটে পূর্ণ ফেরত', icon: RotateCcw },
          { title: 'বিকাশ ও নগদ সাপোর্ট', desc: 'যেকোনো ব্যক্তিগত বিকাশ বা নগদ একাউন্ট দিয়ে রিচার্জ', icon: CreditCard }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* LOGGED IN USER INTERACTIVE RECHARGE & RECENT TRANSACTIONS */}
      {isMounted && isLoggedIn && profile ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Instant Recharge Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h2 className="text-sm font-black text-slate-900">ব্যালেন্স রিচার্জ করুন (বিকাশ / নগদ)</h2>
                <p className="text-[11px] text-slate-500">অ্যাডমিন টিম দ্রুত ট্রানজ্যাকশন আইডি যাচাই করে ব্যালেন্স যুক্ত করবে</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                নিরাপদ পেমেন্ট
              </span>
            </div>

            {rechargeSuccess && (
              <div className="p-3.5 bg-emerald-50 text-emerald-900 rounded-2xl text-xs font-bold border border-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>রিচার্জ আবেদন সফলভাবে গ্রহণ করা হয়েছে! অ্যাডমিন যাচাইয়ের পর ব্যালেন্সে যুক্ত হবে।</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 text-rose-900 rounded-2xl text-xs font-bold border border-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step-by-Step Payment Instructions Card */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3">
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
                  {method === 'bKash' ? 'বিকাশ' : 'নগদ'} অ্যাপে Send Money অপশন
                </div>
                <div className="bg-white/80 p-2 rounded-xl">
                  <strong className="text-emerald-800 block">২. নম্বর ইনপুট:</strong>
                  {displayOfficialNumber} নম্বরে টাকা পাঠান
                </div>
                <div className="bg-white/80 p-2 rounded-xl">
                  <strong className="text-emerald-800 block">৩. TrxID কপি:</strong>
                  মেসেজ থেকে TrxID টি সংগ্রহ করুন
                </div>
                <div className="bg-white/80 p-2 rounded-xl">
                  <strong className="text-emerald-800 block">৪. আবেদন সাবমিট:</strong>
                  নিচে TrxID দিয়ে আবেদন নিশ্চিত করুন
                </div>
              </div>
            </div>

            <form onSubmit={handleRecharge} className="space-y-4 text-xs">
              {/* Method Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">পেমেন্ট মেথড নির্বাচন করুন:</label>
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

              {/* Amount Presets */}
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-emerald-600 focus:bg-white"
                  required
                  min="50"
                />
              </div>

              {/* TrxID Input */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">পেমেন্ট ট্রানজ্যাকশন আইডি (TrxID) *</label>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="যেমন: BKL9839492 বা 7AH29D9"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold uppercase outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isRecharging}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isRecharging ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>রিচার্জ আবেদন পাঠানো হচ্ছে...</span>
                  </>
                ) : (
                  <span>{method === 'bKash' ? 'বিকাশ' : 'নগদ'} রিচার্জ যাচাইয়ের আবেদন করুন (৳{amount})</span>
                )}
              </button>
            </form>
          </div>

          {/* Recent Transactions List (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-emerald-700" />
                <span>সাম্প্রতিক লেনদেন</span>
              </h3>
              <Link href="/dashboard/transactions" className="text-xs font-bold text-emerald-700 hover:underline">
                সকল হিস্ট্রি →
              </Link>
            </div>

            {transactions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800 line-clamp-1">{tx.description}</div>
                      <div className="text-[10px] text-slate-400">TrxID: {tx.trxId}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-black ${tx.type === 'recharge' ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {tx.type === 'recharge' ? '+' : '-'}৳{tx.amount}
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                        tx.status === 'pending'
                          ? 'text-amber-800 bg-amber-50 border-amber-200'
                          : tx.status === 'failed'
                          ? 'text-rose-800 bg-rose-50 border-rose-200'
                          : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                      }`}>
                        {tx.status === 'pending' ? 'যাচাই হচ্ছে' : tx.status === 'failed' ? 'বাতিল' : 'অনুমোদিত'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                কোনো লেনদেন রেকর্ড পাওয়া যায়নি।
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Guest Callout */
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">আপনার ব্যক্তিগত ওয়ালেট অ্যাক্সেস করুন</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              ব্যালেন্স দেখতে, রিচার্জ করতে এবং সরকারি আবেদন ফি পরিশোধ করতে আপনার চাকরি সেবা অ্যাকাউন্টে প্রবেশ করুন।
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/login?redirect=/dashboard/wallet"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              লগইন করুন
            </Link>
            <Link
              href="/register?redirect=/dashboard/wallet"
              className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-all"
            >
              নতুন ফ্রি অ্যাকাউন্ট খুলুন
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
