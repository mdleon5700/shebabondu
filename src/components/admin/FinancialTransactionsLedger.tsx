'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  FileText, 
  PieChart, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  CheckCircle2, 
  Clock, 
  X, 
  ExternalLink, 
  CreditCard, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { ApplicationRequest, JobCircular, WalletTransaction } from '@/lib/types';

interface FinancialTransactionsLedgerProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  applications?: ApplicationRequest[];
  jobs?: JobCircular[];
}

interface TransactionRecord {
  id: string;
  trxId: string;
  candidateName: string;
  candidatePhone: string;
  jobTitle: string;
  govtFee: number;
  serviceFee: number;
  totalAmount: number;
  gateway: 'bKash' | 'Nagad' | 'Rocket' | 'Wallet';
  status: 'completed' | 'pending' | 'refunded' | 'failed';
  candidateId?: string;
  kind?: 'recharge' | 'application' | 'wallet';
  date: string;
}

export default function FinancialTransactionsLedger({
  activeTab = 'transactions',
  onTabChange,
  applications = [],
  jobs = []
}: FinancialTransactionsLedgerProps) {
  // Navigation tabs
  const [currentSubTab, setCurrentSubTab] = useState<'transactions' | 'invoices' | 'service-fees'>(
    activeTab === 'invoices' ? 'invoices' :
    activeTab === 'service-fees' ? 'service-fees' : 'transactions'
  );

  React.useEffect(() => {
    if (activeTab === 'transactions' || activeTab === 'invoices' || activeTab === 'service-fees') {
      setCurrentSubTab(activeTab);
    }
  }, [activeTab]);

  const handleSubTabSwitch = (tab: 'transactions' | 'invoices' | 'service-fees') => {
    setCurrentSubTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // Transactions State
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState<'all' | 'bKash' | 'Nagad' | 'Rocket' | 'Wallet'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'refunded'>('all');
  const [copiedTrxId, setCopiedTrxId] = useState<string | null>(null);

  // Selected receipt for print/preview modal
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState<TransactionRecord | null>(null);

  const [walletTransactions, setWalletTransactions] = useState<Array<WalletTransaction & { candidateId: string; candidateName: string; candidatePhone: string }>>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [ledgerError, setLedgerError] = useState<string | null>(null);

  const loadWalletTransactions = async () => {
    try {
      const response = await fetch('/api/admin/wallet-transactions', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'লেনদেন লোড করা যায়নি');
      setWalletTransactions(data.transactions || []);
    } catch (error) {
      setLedgerError(error instanceof Error ? error.message : 'লেনদেন লোড করা যায়নি');
    }
  };

  React.useEffect(() => {
    loadWalletTransactions();
    window.addEventListener('focus', loadWalletTransactions);
    return () => window.removeEventListener('focus', loadWalletTransactions);
  }, []);

  React.useEffect(() => {
    const applicationRows: TransactionRecord[] = applications.map(application => ({
      id: application.id, trxId: application.trxId || application.id,
      candidateName: application.candidateName, candidatePhone: application.candidatePhone,
      jobTitle: application.jobTitle, govtFee: application.governmentFee ?? application.financialSnapshot?.governmentApplicationFee ?? 0,
      serviceFee: application.financialSnapshot?.finalServiceCharge ?? application.serviceCharge ?? 0,
      totalAmount: application.totalAmount, gateway: application.paymentMethod as TransactionRecord['gateway'],
      status: ['completed', 'processing', 'submitted'].includes(application.status) ? 'completed' : application.status === 'rejected' ? 'failed' : 'pending',
      date: application.date, kind: 'application'
    }));
    const walletRows: TransactionRecord[] = walletTransactions.filter(transaction => !applications.some(application => transaction.id === 'TXN-' + application.id)).map(transaction => ({
      id: transaction.id, trxId: transaction.trxId, candidateId: transaction.candidateId,
      candidateName: transaction.candidateName, candidatePhone: transaction.candidatePhone,
      jobTitle: transaction.description, govtFee: 0, serviceFee: 0, totalAmount: transaction.amount,
      gateway: transaction.method as TransactionRecord['gateway'], status: transaction.status, date: transaction.date,
      kind: transaction.type === 'recharge' ? 'recharge' : 'wallet'
    }));
    setTransactions([...walletRows, ...applicationRows]);
  }, [applications, walletTransactions]);

  const reviewRecharge = async (transaction: TransactionRecord, decision: 'approve' | 'reject') => {
    setReviewingId(transaction.id);
    setLedgerError(null);
    try {
      const response = await fetch('/api/admin/wallet-transactions', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: transaction.candidateId, transactionId: transaction.id, decision })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'যাচাই ব্যর্থ হয়েছে');
      await loadWalletTransactions();
    } catch (error) {
      setLedgerError(error instanceof Error ? error.message : 'যাচাই ব্যর্থ হয়েছে');
    } finally {
      setReviewingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrxId(text);
    setTimeout(() => setCopiedTrxId(null), 2500);
  };

  const filteredTxns = transactions.filter(t => {
    const matchesSearch = 
      t.trxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.candidatePhone.includes(searchTerm) ||
      t.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGateway = gatewayFilter === 'all' || t.gateway === gatewayFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesGateway && matchesStatus;
  });

  // Financial KPI totals
  const totalCollected = transactions.reduce((sum, t) => sum + (t.kind === 'application' && t.status === 'completed' ? t.totalAmount : 0), 0);
  const totalGovtFees = transactions.reduce((sum, t) => sum + (t.status === 'completed' ? t.govtFee : 0), 0);
  const totalServiceFees = transactions.reduce((sum, t) => sum + (t.status === 'completed' ? t.serviceFee : 0), 0);

  return (
    <div className="space-y-6">
      {ledgerError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800 text-base">{ledgerError}</p>}
      <button type="button" onClick={loadWalletTransactions} className="rounded-xl border bg-white px-4 py-2 text-[17px]">লেনদেন রিফ্রেশ করুন</button>
      {/* Top Module Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Receipt className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-black text-slate-900">আর্থিক লেনদেন ও রাজস্ব ব্যবস্থাপনা</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              অডিট ভেরিফাইড
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            টেলিটক ফি ও সার্ভিস চার্জ হিসাব, ট্রানজেকশন লেজার এবং ইনভয়েস ও রসিদ
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleSubTabSwitch('transactions')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentSubTab === 'transactions' 
                ? 'bg-white text-emerald-800 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>ট্রানজেকশন তালিকা</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubTabSwitch('invoices')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentSubTab === 'invoices' 
                ? 'bg-white text-emerald-800 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ইনভয়েস ও রসিদ</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubTabSwitch('service-fees')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentSubTab === 'service-fees' 
                ? 'bg-white text-emerald-800 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>সার্ভিস ফি হিসাব</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">মোট সংগৃহীত পেমেন্ট</p>
            <h3 className="text-xl font-black text-slate-900">৳{totalCollected.toLocaleString('bn-BD')}</h3>
            <p className="text-[11px] font-semibold text-emerald-700">সকল সফল ট্রানজেকশন</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">টেলিটক ও সরকারি ফি</p>
            <h3 className="text-xl font-black text-slate-900">৳{totalGovtFees.toLocaleString('bn-BD')}</h3>
            <p className="text-[11px] font-semibold text-slate-500">সরকারি কোষাগার/টেলিটক</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">প্ল্যাটফর্ম নিট সার্ভিস ফি</p>
            <h3 className="text-xl font-black text-purple-700">৳{totalServiceFees.toLocaleString('bn-BD')}</h3>
            <p className="text-[11px] font-semibold text-slate-500">চাকরি সেবা আয়</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">পেন্ডিং ভেরিফিকেশন</p>
            <h3 className="text-xl font-black text-amber-600">{transactions.filter(transaction => transaction.status === 'pending').length} টি</h3>
            <p className="text-[11px] font-semibold text-slate-500">৳{transactions.filter(transaction => transaction.status === 'pending').reduce((sum, transaction) => sum + transaction.totalAmount, 0).toLocaleString('bn-BD')} যাচাইয়ের অপেক্ষায়</p>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: TRANSACTIONS TABLE */}
      {currentSubTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-sm text-slate-900">মাস্টার ট্রানজেকশন খতিয়ান (Ledger)</h3>
              <p className="text-xs text-slate-500">বিকাশ, নগদ, রকেট ও ওয়ালেটের লাইভ পেমেন্ট তালিকা</p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="TrxID, নাম বা ফোন..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-56"
                />
              </div>

              <select
                value={gatewayFilter}
                onChange={(e) => setGatewayFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">সকল গেটওয়ে</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Wallet">Wallet</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">সকল স্ট্যাটাস</option>
                <option value="completed">অনুমোদিত</option>
                <option value="pending">পেন্ডিং</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ট্রানজেকশন ID</th>
                  <th className="py-2.5 px-3">আবেদনকারী ও পদ</th>
                  <th className="py-2.5 px-3">পেমেন্ট মাধ্যম</th>
                  <th className="py-2.5 px-3">সরকারি ফি</th>
                  <th className="py-2.5 px-3">সার্ভিস ফি</th>
                  <th className="py-2.5 px-3">মোট টাকা</th>
                  <th className="py-2.5 px-3">স্ট্যাটাস</th>
                  <th className="py-2.5 px-3 text-right">তারিখ ও অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{t.trxId}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(t.trxId)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                          title="TrxID কপি করুন"
                        >
                          {copiedTrxId === t.trxId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{t.id}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{t.candidateName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{t.candidatePhone}</div>
                      <div className="text-[10px] text-emerald-800 line-clamp-1 max-w-xs">{t.jobTitle}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.gateway === 'bKash' ? 'bg-pink-100 text-pink-700' :
                        t.gateway === 'Nagad' ? 'bg-orange-100 text-orange-700' :
                        t.gateway === 'Rocket' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {t.gateway}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">৳{t.govtFee}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-purple-700">৳{t.serviceFee}</td>
                    <td className="py-2.5 px-3 font-mono font-black text-slate-900 text-sm">৳{t.totalAmount}</td>
                    <td className="py-2.5 px-3">
                      {t.status === 'completed' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3" /> অনুমোদিত
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> {t.status === 'failed' ? 'বাতিল' : 'পেন্ডিং'}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="text-[10px] text-slate-400 mb-1">{t.date}</div>
                      {t.kind === 'recharge' && t.status === 'pending' && <div className="flex gap-2 mb-2">
                        <button type="button" disabled={reviewingId === t.id} onClick={() => reviewRecharge(t, 'approve')} className="rounded-lg bg-emerald-700 text-white px-3 py-1 text-[17px]">অনুমোদন</button>
                        <button type="button" disabled={reviewingId === t.id} onClick={() => reviewRecharge(t, 'reject')} className="rounded-lg border border-red-300 text-red-700 px-3 py-1 text-[17px]">বাতিল</button>
                      </div>}
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptTxn(t)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" /> রসিদ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: INVOICES & MONEY RECEIPTS */}
      {currentSubTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-sm text-slate-900">অফিসিয়াল ইনভয়েস ও মানি রসিদ সেন্টার</h3>
              <p className="text-xs text-slate-500">সকল সফল আবেদনের প্রিন্টযোগ্য অফিসিয়াল মানি রসিদ</p>
            </div>
            <span className="text-xs font-bold text-slate-500">মোট ইনভয়েস: {transactions.filter(t => t.status === 'completed').length}টি</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transactions.filter(t => t.status === 'completed').map((txn) => (
              <div key={txn.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase">INVOICE #{txn.id}</span>
                    <h4 className="font-black text-xs text-slate-900 mt-0.5">{txn.candidateName}</h4>
                    <p className="text-[11px] text-slate-500">{txn.candidatePhone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black font-mono text-slate-900">৳{txn.totalAmount}</span>
                    <span className="block text-[10px] text-slate-400">{txn.gateway} পরিশোধ</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 border-t border-slate-200/60 pt-2 line-clamp-1">
                  <strong>পদ:</strong> {txn.jobTitle}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">{txn.date}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedReceiptTxn(txn)}
                    className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>মানি রসিদ দেখুন</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: SERVICE FEES BREAKDOWN */}
      {currentSubTab === 'service-fees' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Distribution Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <h3 className="font-black text-sm text-slate-900 pb-3 border-b border-slate-100">
                রাজস্ব অনুপাত ও সরকারি ফি মার্জিন
              </h3>

              {(() => {
                const toBnNumber = (n: number | string) => String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[+d]);
                const totalSumFees = (totalGovtFees + totalServiceFees) || 1;
                const govtPct = Math.round((totalGovtFees / totalSumFees) * 100);
                const servicePct = 100 - govtPct;
                return (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>টেলিটক ও সরকারি চালান ফি</span>
                        <span>৳{totalGovtFees} ({toBnNumber(govtPct)}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${govtPct}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>চাকরি সেবা নিট সার্ভিস চার্জ</span>
                        <span>৳{totalServiceFees} ({toBnNumber(servicePct)}%)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full transition-all duration-300" style={{ width: `${servicePct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-medium">
                💡 চাকরি সেবা প্রতি সফল সরকারি আবেদনে মাত্র ৳৮০ সার্ভিস ফি চার্জ করে, যা প্রার্থীর ছবি-স্বাক্ষর রিসাইজিং, নির্ভুল ডেটা পূরণ ও এসএমএস নোটিফিকেশন কভার করে।
              </div>
            </div>

            {/* Fee Tiers Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <h3 className="font-black text-sm text-slate-900 pb-3 border-b border-slate-100">
                সার্ভিস ফি টায়ার কাঠামো
              </h3>

              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-xs text-slate-900">সাধারণ টেলিটক আবেদন সহায়তা</h4>
                    <p className="text-[11px] text-slate-500">২৪ ঘণ্টার মধ্যে সাবমিশন ও রিসিট ডেলিভারি</p>
                  </div>
                  <span className="text-base font-black font-mono text-emerald-800">৳৮০</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-xs text-slate-900">এক্সপ্রেস প্রায়োরিটি সহায়তা</h4>
                    <p className="text-[11px] text-slate-500">২ ঘণ্টার মধ্যে জরুরি সাবমিশন</p>
                  </div>
                  <span className="text-base font-black font-mono text-blue-700">৳১২০</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-xs text-slate-900">শেষ মুহূর্তের (Urgent) আবেদন</h4>
                    <p className="text-[11px] text-slate-500">ডেডলাইনের শেষ ৬ ঘণ্টার স্পেশাল হ্যান্ডলিং</p>
                  </div>
                  <span className="text-base font-black font-mono text-amber-700">৳১৫০</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL MONEY RECEIPT MODAL */}
      {selectedReceiptTxn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black flex items-center justify-center text-xs">
                  CS
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">চাকরি সেবা অফিশিয়াল মানি রসিদ</h3>
                  <span className="text-[10px] font-mono text-slate-500">রসিদ নং: {selectedReceiptTxn.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptTxn(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Details Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">প্রার্থীর নাম:</span>
                <span className="font-black text-slate-900">{selectedReceiptTxn.candidateName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">মোবাইল নম্বর:</span>
                <span className="font-mono font-bold text-slate-900">{selectedReceiptTxn.candidatePhone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">পদের নাম:</span>
                <span className="font-bold text-emerald-800 text-right max-w-xs">{selectedReceiptTxn.jobTitle}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">ট্রানজেকশন ID (TrxID):</span>
                <span className="font-mono font-bold text-slate-900">{selectedReceiptTxn.trxId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">পেমেন্ট মেথড:</span>
                <span className="font-bold text-slate-800">{selectedReceiptTxn.gateway}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">সরকারি আবেদন ফি:</span>
                <span className="font-mono font-bold text-slate-800">৳{selectedReceiptTxn.govtFee}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">সহায়তাপ্রাপ্ত সার্ভিস ফি:</span>
                <span className="font-mono font-bold text-slate-800">৳{selectedReceiptTxn.serviceFee}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black text-emerald-800">
                <span>সর্বমোট পরিশোধিত:</span>
                <span>৳{selectedReceiptTxn.totalAmount}.০০</span>
              </div>
            </div>

            {/* Seal & Verification */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4" /> ভেরিফাইড পেমেন্ট চালান
              </span>
              <span>তারিখ: {selectedReceiptTxn.date}</span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReceiptTxn(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>রসিদ প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
