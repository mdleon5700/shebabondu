'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  ChevronRight,
  Search,
  Receipt,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  ShieldCheck,
  Building,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { storage } from '@/lib/store';
import { WalletTransaction, CandidateProfile } from '@/lib/types';

export default function TransactionsPage() {
  const [txs, setTxs] = useState<WalletTransaction[]>([]);
  const [profile, setProfile] = useState<CandidateProfile>(storage.getUser());
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'recharge' | 'fee_deduction' | 'refund'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<WalletTransaction | null>(null);

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cs_session_token') : null;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const loadTransactions = useCallback(() => {
    const local = storage.getTransactions();
    setTxs(local);
    setProfile(storage.getUser());

    fetch('/api/wallet/transactions', { 
      headers: getAuthHeaders(),
      cache: 'no-store' 
    })
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
        if (typeof data?.walletBalance === 'number') {
          setProfile(prev => ({ ...prev, walletBalance: data.walletBalance }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setIsMounted(true);
    loadTransactions();

    window.addEventListener('cs_txs_changed', loadTransactions);
    window.addEventListener('cs_wallet_changed', loadTransactions);
    window.addEventListener('cs_user_changed', loadTransactions);
    window.addEventListener('focus', loadTransactions);
    return () => {
      window.removeEventListener('cs_txs_changed', loadTransactions);
      window.removeEventListener('cs_wallet_changed', loadTransactions);
      window.removeEventListener('cs_user_changed', loadTransactions);
      window.removeEventListener('focus', loadTransactions);
    };
  }, [loadTransactions]);

  // Financial Metrics
  const metrics = useMemo(() => {
    const totalRecharge = txs
      .filter(t => t.type === 'recharge' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = txs
      .filter(t => t.type === 'fee_deduction' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPending = txs
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    return { totalRecharge, totalSpent, totalPending };
  }, [txs]);

  // Filtered List
  const filteredTxs = useMemo(() => {
    return txs.filter(tx => {
      // Type match
      if (typeFilter === 'recharge' && tx.type !== 'recharge') return false;
      if (typeFilter === 'fee_deduction' && tx.type !== 'fee_deduction') return false;
      if (typeFilter === 'refund' && tx.type !== 'refund') return false;

      // Status match
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTrx = (tx.trxId || '').toLowerCase().includes(q);
        const matchDesc = (tx.description || '').toLowerCase().includes(q);
        const matchMethod = (tx.method || '').toLowerCase().includes(q);
        const matchAmount = String(tx.amount).includes(q);
        if (!matchTrx && !matchDesc && !matchMethod && !matchAmount) return false;
      }

      return true;
    });
  }, [txs, typeFilter, statusFilter, searchQuery]);

  const handlePrintReceipt = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>অডিটেড ফাইন্যান্সিয়াল লেজার</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-700" />
            <span>লেনদেন ও পেমেন্ট হিস্ট্রি</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার ওয়ালেট রিচার্জ, আবেদন ফি কর্তন ও রিফান্ডের পূর্ণাঙ্গ ডিজিটাল স্টেটমেন্ট এবং রসিদ।
          </p>
        </div>

        <Link
          href="/dashboard/wallet"
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center shadow-xs"
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>+ ব্যালেন্স রিচার্জ করুন</span>
        </Link>
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">উপলব্ধ ওয়ালেট ব্যালেন্স</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">৳{profile.walletBalance || 0}</div>
          <span className="text-[10px] text-slate-400">লাইভ ব্যালেন্স</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">মোট রিচার্জ (অনুমোদিত)</span>
          <div className="text-xl sm:text-2xl font-black text-blue-700">৳{metrics.totalRecharge}</div>
          <span className="text-[10px] text-slate-400">মোট ক্রেডিট</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">মোট আবেদন ফি পরিশোধ</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">৳{metrics.totalSpent}</div>
          <span className="text-[10px] text-slate-400">মোট ডেবিট</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">পেন্ডিং রিকোয়েস্ট</span>
          <div className="text-xl sm:text-2xl font-black text-amber-700">৳{metrics.totalPending}</div>
          <span className="text-[10px] text-slate-400">যাচাইয়ের অপেক্ষায়</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="TrxID, চাকরির নাম বা মেথড দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'সকল লেনদেন' },
              { id: 'recharge', label: 'রিচার্জ (+)' },
              { id: 'fee_deduction', label: 'ফি কর্তন (-)' },
              { id: 'refund', label: 'রিফান্ড' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  typeFilter === tab.id
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-emerald-600 cursor-pointer"
          >
            <option value="all">সব স্ট্যাটাস</option>
            <option value="completed">✓ অনুমোদিত / সফল</option>
            <option value="pending">⏳ অপেক্ষমাণ</option>
            <option value="failed">✕ বাতিল</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTxs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <History className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">কোনো লেনদেনের তথ্য পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              আপনার ফিল্টারের সাথে মিলে এমন কোনো লেনদেন নেই অথবা আপনি এখনো কোনো আবেদন ফি পরিশোধ করেননি।
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
          filteredTxs.map((tx) => (
            <div
              key={tx.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  tx.type === 'recharge' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {tx.type === 'recharge' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{tx.description}</h4>
                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-slate-700">TrxID: {tx.trxId}</span>
                    <span>•</span>
                    <span>মাধ্যম: <strong>{tx.method || 'Wallet'}</strong></span>
                    <span>•</span>
                    <span className="text-slate-400">{tx.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                <div className="text-right">
                  <div className={`font-black text-sm sm:text-base ${
                    tx.type === 'recharge' ? 'text-emerald-700' : 'text-slate-900'
                  }`}>
                    {tx.type === 'recharge' ? '+' : '-'}৳{tx.amount}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${
                    tx.status === 'pending'
                      ? 'text-amber-800 bg-amber-50 border-amber-200'
                      : tx.status === 'failed'
                      ? 'text-rose-800 bg-rose-50 border-rose-200'
                      : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  }`}>
                    {tx.status === 'pending' ? '⏳ যাচাইয়ের অপেক্ষায়' : tx.status === 'failed' ? '✕ বাতিল' : '✓ সফল'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReceipt(tx)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  title="মানি রসিদ দেখুন"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                  <span>রসিদ</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* INTERACTIVE DIGITAL RECEIPT / MONEY VOUCHER MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scaleUp space-y-6">
            
            {/* Modal Top Controls */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <span className="font-bold text-xs text-slate-600">চাকরি সেবা • ডিজিটাল মানি রসিদ</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Paper */}
            <div id="printable-receipt" className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-4 font-sans">
              <div className="text-center space-y-1 border-b border-slate-200 pb-3">
                <div className="font-black text-lg text-emerald-900">চাকরি সেবা (Chakri Sheba BD)</div>
                <div className="text-[11px] text-slate-500">সরকারি ও ব্যাংক নিয়োগ সহায়িকা এবং ডিজিটাল ভল্ট প্ল্যাটফর্ম</div>
                <div className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-wider mt-1">
                  অফিসিয়াল ক্যাশ মেমো / ভাউচার
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">ভাউচার নম্বর:</span>
                  <strong className="font-mono font-bold text-slate-800">{selectedReceipt.id}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">তারিখ ও সময়:</span>
                  <span className="font-medium text-slate-700">{selectedReceipt.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">প্রার্থীর নাম:</span>
                  <strong className="text-slate-800">{profile.nameBn || profile.name}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">রেজিস্টার্ড মোবাইল:</span>
                  <span className="font-mono font-bold text-slate-700">{profile.phone}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">সেবার বিবরণ:</span>
                  <strong className="text-slate-900">{selectedReceipt.description}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">পেমেন্ট মেথড:</span>
                  <strong className="text-slate-900">{selectedReceipt.method || 'Wallet'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ট্রানজ্যাকশন আইডি (TrxID):</span>
                  <strong className="font-mono text-emerald-800 font-bold">{selectedReceipt.trxId}</strong>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-slate-500">পেমেন্ট স্ট্যাটাস:</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    selectedReceipt.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedReceipt.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedReceipt.status === 'completed' ? '✓ পেইড / অনুমোদিত' : selectedReceipt.status === 'pending' ? '⏳ অপেক্ষমাণ' : '✕ বাতিল'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-900 text-white rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-200">মোট পরিশোধিত টাকা</span>
                <span className="text-xl font-black text-emerald-300">৳{selectedReceipt.amount}</span>
              </div>

              <div className="text-[10px] text-slate-400 text-center leading-relaxed">
                এটি কম্পিউটার জেনারেটেড ডিজিটাল রসিদ, এতে কোনো স্বাক্ষরের প্রয়োজন নেই।
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট / ডাউনলোড রসিদ</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
