'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  HardDrive,
  Cpu,
  MessageSquare,
  Globe,
  PieChart,
  Filter,
  DollarSign,
  Sparkles
} from 'lucide-react';
import {
  OperationalExpenseRecord,
  OperationalExpenseCategory,
  PlatformBudgetConfig,
  BudgetVarianceReport,
  PlatformUsageSnapshot,
  UniversalAccessPolicy
} from '@/lib/operations/types';
import { CATEGORY_NAMES_BN } from '@/lib/operations/types';

export default function PlatformOperationsHub() {
  const [activeSubTab, setActiveSubTab] = useState<'free_access' | 'expenses' | 'budget' | 'usage'>('free_access');
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [policy, setPolicy] = useState<UniversalAccessPolicy | null>(null);
  const [expenses, setExpenses] = useState<OperationalExpenseRecord[]>([]);
  const [budgetConfig, setBudgetConfig] = useState<PlatformBudgetConfig | null>(null);
  const [varianceReport, setVarianceReport] = useState<BudgetVarianceReport | null>(null);
  const [usageSnapshot, setUsageSnapshot] = useState<PlatformUsageSnapshot | null>(null);

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<string>(new Date().toISOString().slice(0, 7));
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [natureFilter, setNatureFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'hosting' as OperationalExpenseCategory,
    provider: '',
    billingPeriod: selectedPeriod,
    amount: '',
    currency: 'BDT' as 'BDT' | 'USD',
    costNature: 'ACTUAL_BILLED' as 'ACTUAL_BILLED' | 'ESTIMATED_USAGE',
    paymentStatus: 'paid' as any,
    expenseDate: new Date().toISOString().slice(0, 10),
    invoiceNumber: '',
    notes: ''
  });

  // Budget Edit Form State
  const [editBudgetAmount, setEditBudgetAmount] = useState('45000');
  const [editAlertThreshold, setEditAlertThreshold] = useState('80');

  const fetchAllData = async () => {
    setIsLoading(true);
    setFeedbackMessage(null);
    try {
      const [resPolicy, resExpenses, resBudget, resUsage] = await Promise.all([
        fetch('/api/platform/access-policy'),
        fetch(`/api/admin/operations/expenses?billingPeriod=${selectedPeriod}`),
        fetch(`/api/admin/operations/budget?period=${selectedPeriod}`),
        fetch('/api/admin/operations/usage')
      ]);

      if (resPolicy.ok) {
        const d = await resPolicy.json();
        setPolicy(d.policy);
      }
      if (resExpenses.ok) {
        const d = await resExpenses.json();
        setExpenses(d.expenses || []);
      }
      if (resBudget.ok) {
        const d = await resBudget.json();
        setBudgetConfig(d.config);
        setVarianceReport(d.report);
        if (d.config?.monthlyBudgetBdt) {
          setEditBudgetAmount(String(d.config.monthlyBudgetBdt));
          setEditAlertThreshold(String(d.config.alertThresholdPercent || 80));
        }
      }
      if (resUsage.ok) {
        const d = await resUsage.json();
        setUsageSnapshot(d.snapshot);
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: 'তথ্য লোড করতে সমস্যা হয়েছে: ' + (err.message || 'Error') });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedPeriod]);

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.provider || !newExpense.amount) {
      setFeedbackMessage({ type: 'error', text: 'দয়া করে সকল বাধ্যতামূলক তথ্য পূরণ করুন।' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/operations/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExpense,
          amount: Number(newExpense.amount)
        })
      });

      if (res.ok) {
        setFeedbackMessage({ type: 'success', text: 'অপারেশনাল খরচ সফলভাবে রেকর্ড করা হয়েছে।' });
        setIsAddModalOpen(false);
        setNewExpense({
          title: '',
          category: 'hosting',
          provider: '',
          billingPeriod: selectedPeriod,
          amount: '',
          currency: 'BDT',
          costNature: 'ACTUAL_BILLED',
          paymentStatus: 'paid',
          expenseDate: new Date().toISOString().slice(0, 10),
          invoiceNumber: '',
          notes: ''
        });
        fetchAllData();
      } else {
        const err = await res.json();
        setFeedbackMessage({ type: 'error', text: err.error || 'খরচ রেকর্ড ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'সার্ভার কানেকশন ত্রুটি।' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই খরচ রেকর্ডটি মুছে ফেলতে চান?')) return;

    try {
      const res = await fetch(`/api/admin/operations/expenses?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setFeedbackMessage({ type: 'success', text: 'খরচ রেকর্ড সফলভাবে মুছে ফেলা হয়েছে।' });
        fetchAllData();
      } else {
        const d = await res.json();
        setFeedbackMessage({ type: 'error', text: d.error || 'মুছে ফেলতে সমস্যা হয়েছে।' });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'ত্রুটি' });
    }
  };

  const handleBudgetUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/operations/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyBudgetBdt: Number(editBudgetAmount),
          alertThresholdPercent: Number(editAlertThreshold)
        })
      });

      if (res.ok) {
        setFeedbackMessage({ type: 'success', text: 'বাজেট সফলভাবে আপডেট করা হয়েছে।' });
        setIsBudgetModalOpen(false);
        fetchAllData();
      } else {
        const d = await res.json();
        setFeedbackMessage({ type: 'error', text: d.error || 'বাজেট আপডেট ব্যর্থ হয়েছে।' });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'ত্রুটি' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    if (categoryFilter !== 'all' && exp.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && exp.paymentStatus !== statusFilter) return false;
    if (natureFilter !== 'all' && exp.costNature !== natureFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Quick Controls */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>১০০% সম্পূর্ণ ফ্রি প্ল্যাটফর্ম (Step 13)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Globe className="w-3 h-3" />
              <span>Zero Paywalls Guaranteed</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            প্ল্যাটফর্ম এক্সেস পলিসি ও অপারেশনাল খরচ কন্ট্রোল সেন্টার
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            চাকরিপ্রার্থীদের জন্য চাকরি সেবা সম্পূর্ণ উন্মুক্ত ও ফ্রি। এখানে প্ল্যাটফর্মের বাস্তব অবকাঠামোগত খরচ (সার্ভার, এআই, এসএমএস, স্টোরেজ) এবং বাজেট স্বচ্ছভাবে পরিচালিত হয়।
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-center">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700">
            <span>মাস:</span>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent border-none text-slate-900 font-bold focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={fetchAllData}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="তথ্য রিফ্রেশ করুন"
          >
            <RefreshCw className={'w-4 h-4 ' + (isLoading ? 'animate-spin text-emerald-700' : '')} />
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* 2. Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'free_access', label: '১০০% ফ্রি এক্সেস পলিসি', icon: ShieldCheck },
          { id: 'expenses', label: 'অপারেশনাল খরচ খতিয়ান', icon: DollarSign, badge: expenses.length },
          { id: 'budget', label: 'বাজেট ও ভ্যারিয়েন্স মনিটর', icon: PieChart },
          { id: 'usage', label: 'রিসোর্স ও ব্যবহার অ্যানালিটিক্স', icon: Cpu }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: 100% FREE ACCESS POLICY */}
      {activeSubTab === 'free_access' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/50 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>স্থায়ী প্রোডাক্ট অঙ্গীকার ও ফ্রি এক্সেস সনদ</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              চাকরি সেবায় কোনো সাবস্ক্রিপশন, পেইড মেম্বারশিপ বা হিডেন পে-ওয়াল নেই
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
              {policy?.policyStatementBn ||
                'চাকরি সেবা একটি সম্পূর্ণ উন্মুক্ত ও ফ্রি প্ল্যাটফর্ম। নিবন্ধিত সকল চাকরিপ্রার্থী কোনো প্রকার অর্থ প্রদান ছাড়াই প্রতিটি ফিচার সমানভাবে ব্যবহার করতে পারেন।'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                <div className="text-[11px] font-bold text-slate-400">পেইড টিয়ার সংখ্যা</div>
                <div className="text-xl font-black text-emerald-400">০ (Zero)</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                <div className="text-[11px] font-bold text-slate-400">সাবস্ক্রিপশন ফি</div>
                <div className="text-xl font-black text-emerald-400">৳০ / মাস</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                <div className="text-[11px] font-bold text-slate-400">উন্মুক্ত অনুমোদিত ফিচার</div>
                <div className="text-xl font-black text-emerald-400">{policy?.approvedFreeFeatures?.length || 15} টি</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                <div className="text-[11px] font-bold text-slate-400">ভেরিফায়েড পে-ওয়াল</div>
                <div className="text-xl font-black text-emerald-400">০ (সম্পূর্ণ উন্মুক্ত)</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900">১৫টি অনুমোদিত সার্বজনীন ফ্রি ফিচারের কার্যকারিতা তালিকা</h4>
                <p className="text-xs text-slate-500">প্রতিটি ফিচার সকল নিবন্ধিত প্রার্থীর জন্য স্বয়ংক্রিয়ভাবে অ্যাক্টিভ রয়েছে</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                সকলের জন্য সক্রিয়
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(policy?.approvedFreeFeatures || []).map((feat, idx) => (
                <div
                  key={feat.id}
                  className="p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-400 hover:bg-emerald-50/20 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase">ফিচার #{idx + 1}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>১০০% ফ্রি</span>
                    </span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-900">{feat.nameBn}</h5>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{feat.descriptionBn}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: OPERATIONAL EXPENSES LEDGER */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">চলতি মাসের মোট খরচ ({selectedPeriod})</span>
              <div className="text-2xl font-black text-slate-900">
                ৳{(varianceReport?.projectedTotalBdt || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>প্রকৃত বিল: ৳{(varianceReport?.actualTotalBdt || 0).toLocaleString()}</span>
                <span>•</span>
                <span>অনুমান: ৳{(varianceReport?.estimatedTotalBdt || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">বাজেট পোড়ার হার (Burn Rate)</span>
              <div className="text-2xl font-black text-emerald-700">
                {varianceReport?.burnRatePercent || 0}%
              </div>
              <div className="text-[11px] text-slate-400">
                বাজেট: ৳{(varianceReport?.monthlyBudgetBdt || 45000).toLocaleString()} | অবশিষ্ট: ৳{(varianceReport?.varianceBdt || 0).toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500">নতুন খরচ এন্ট্রি</span>
                <p className="text-[11px] text-slate-400">সার্ভার, এআই বা এসএমএস খরচ যুক্ত করুন</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>খরচ যুক্ত করুন</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold">
              <Filter className="w-3.5 h-3.5" />
              <span>ফিল্টার:</span>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none"
            >
              <option value="all">সকল ক্যাটাগরি</option>
              {Object.entries(CATEGORY_NAMES_BN).map(([k, name]) => (
                <option key={k} value={k}>{name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none"
            >
              <option value="all">সকল পেমেন্ট স্ট্যাটাস</option>
              <option value="paid">পরিশোধিত (Paid)</option>
              <option value="pending">পেন্ডিং (Pending)</option>
              <option value="scheduled">শিডিউলড (Scheduled)</option>
            </select>

            <select
              value={natureFilter}
              onChange={(e) => setNatureFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none"
            >
              <option value="all">খরচের ধরন (সকল)</option>
              <option value="ACTUAL_BILLED">প্রকৃত বিল (Actual Billed)</option>
              <option value="ESTIMATED_USAGE">অনুমানভিত্তিক (Estimated Usage)</option>
            </select>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">অপারেশনাল খরচ তালিকা ({filteredExpenses.length} টি)</h4>
              <span className="text-xs text-slate-500">বিলিং মেয়াদ: {selectedPeriod}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">তারিখ ও শিরোনাম</th>
                    <th className="py-3 px-4">ক্যাটাগরি</th>
                    <th className="py-3 px-4">প্রোভাইডার</th>
                    <th className="py-3 px-4">পরিমাণ (BDT)</th>
                    <th className="py-3 px-4">ধরন ও স্ট্যাটাস</th>
                    <th className="py-3 px-4">ইনভয়েস নং</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                        এই মেয়াদের জন্য কোনো অপারেশনাল খরচ পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{exp.title}</div>
                          <div className="text-[10px] text-slate-400">{exp.expenseDate} • {exp.id}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          {CATEGORY_NAMES_BN[exp.category] || exp.category}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {exp.provider}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900">৳{exp.amountBdt.toLocaleString()}</div>
                          {exp.currency === 'USD' && (
                            <div className="text-[10px] text-slate-400">${exp.amount} USD</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              exp.costNature === 'ACTUAL_BILLED'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {exp.costNature === 'ACTUAL_BILLED' ? 'প্রকৃত বিল' : 'অনুমানভিত্তিক'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              exp.paymentStatus === 'paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {exp.paymentStatus === 'paid' ? 'পরিশোধিত' : 'পেন্ডিং'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {exp.invoiceNumber || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: BUDGET & VARIANCE MONITOR */}
      {activeSubTab === 'budget' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">মাসিক নির্ধারিত বাজেট</span>
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  পরিবর্তন করুন
                </button>
              </div>
              <div className="text-3xl font-black text-slate-900">
                ৳{(varianceReport?.monthlyBudgetBdt || 45000).toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">বার্ষিক বরাদ্দ: ৳{(budgetConfig?.annualBudgetBdt || 540000).toLocaleString()}</div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-slate-500">মোট আনুমানিক খরচ ({selectedPeriod})</span>
              <div className="text-3xl font-black text-slate-900">
                ৳{(varianceReport?.projectedTotalBdt || 0).toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">
                বাজেট অবশিষ্ট: ৳{(varianceReport?.varianceBdt || 0).toLocaleString()} ({varianceReport?.isOverBudget ? 'বাজেট অতিক্রম' : 'বাজেটের মধ্যে'})
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
              <span className="text-xs font-semibold text-slate-500">বাজেট ব্যবহার শতাংশ</span>
              <div className={`text-3xl font-black ${
                (varianceReport?.burnRatePercent || 0) >= 100
                  ? 'text-rose-600'
                  : (varianceReport?.burnRatePercent || 0) >= 80
                  ? 'text-amber-600'
                  : 'text-emerald-700'
              }`}>
                {varianceReport?.burnRatePercent || 0}%
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    (varianceReport?.burnRatePercent || 0) >= 100
                      ? 'bg-rose-600'
                      : (varianceReport?.burnRatePercent || 0) >= 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, varianceReport?.burnRatePercent || 0)}%` }}
                />
              </div>
            </div>
          </div>

          {varianceReport?.activeAlerts && varianceReport.activeAlerts.length > 0 && (
            <div className="space-y-2">
              {varianceReport.activeAlerts.map((alert, idx) => (
                <div key={idx} className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl text-xs font-bold flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">ক্যাটাগরিভিত্তিক বাজেট ও খরচের তুলনামূলক বিবরণী</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">ক্যাটাগরি</th>
                    <th className="py-3 px-4">নির্ধারিত বাজেট</th>
                    <th className="py-3 px-4">প্রকৃত বিল</th>
                    <th className="py-3 px-4">অনুমানভিত্তিক</th>
                    <th className="py-3 px-4">মোট ব্যয়</th>
                    <th className="py-3 px-4">ব্যবহার %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(varianceReport?.categoryBreakdown || []).map((cat) => (
                    <tr key={cat.category} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{cat.categoryNameBn}</td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">৳{cat.budgetBdt.toLocaleString()}</td>
                      <td className="py-3 px-4 text-blue-700 font-bold">৳{cat.actualBdt.toLocaleString()}</td>
                      <td className="py-3 px-4 text-amber-700 font-bold">৳{cat.estimatedBdt.toLocaleString()}</td>
                      <td className="py-3 px-4 font-black text-slate-900">৳{cat.totalBdt.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${cat.burnPercent >= 100 ? 'bg-rose-500' : 'bg-emerald-600'}`}
                              style={{ width: `${Math.min(100, cat.burnPercent)}%` }}
                            />
                          </div>
                          <span className="font-bold text-[11px] text-slate-600">{cat.burnPercent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: USAGE & INFRASTRUCTURE ANALYTICS */}
      {activeSubTab === 'usage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-slate-600">রেজিস্টার্ড প্রার্থী সংখ্যা</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{usageSnapshot?.totalCandidates || 0} জন</div>
              <div className="text-[11px] text-emerald-700 font-bold">১০০% প্রার্থী সম্পূর্ণ বিনামূল্যে সংযুক্ত</div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-slate-600">ডকুমেন্ট ভল্ট স্টোরেজ</span>
                <HardDrive className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{usageSnapshot?.storageFormatted || '0 MB'}</div>
              <div className="text-[11px] text-slate-500">আনুমানিক ক্লাউড খরচ: ৳{usageSnapshot?.storageEstimatedCostBdt || 15}/মাস</div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-slate-600">এআই টোকেন ব্যবহার</span>
                <Cpu className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {((usageSnapshot?.aiTokensUsed || 0) / 1000).toFixed(1)}k Tokens
              </div>
              <div className="text-[11px] text-slate-500">Google Gemini API খরচ: ৳{usageSnapshot?.aiEstimatedCostBdt || 0}</div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold text-slate-600">এসএমএস ও ইমেইল ডেলিভারি</span>
                <MessageSquare className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {(usageSnapshot?.smsMessagesSent || 0) + (usageSnapshot?.emailsSent || 0)} টি
              </div>
              <div className="text-[11px] text-slate-500">
                SMS: {usageSnapshot?.smsMessagesSent} | Email: {usageSnapshot?.emailsSent}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-slate-900">ইউনিট-রেট ভিত্তিক রিয়েল-টাইম অবকাঠামো মিটার</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Google AI Studio / Gemini 1.5 Flash</span>
                  <span className="text-emerald-700">৳0.04 / 1,000 Tokens</span>
                </div>
                <p className="text-slate-500 text-[11px]">সার্কুলার অটো-ভেরিফিকেশন, ওসিআর অ্যাসিস্ট ও স্মার্ট ম্যাচিং প্রসেসিং।</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Greenweb / Onnorokom SMS Gateway</span>
                  <span className="text-emerald-700">৳0.35 / SMS</span>
                </div>
                <p className="text-slate-500 text-[11px]">চাকরির ডেডলাইন কাউন্টডাউন ও প্রবেশপত্র নোটিফিকেশন ডেলিভারি।</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Resend / SendGrid Transactional Email</span>
                  <span className="text-emerald-700">৳0.05 / Email</span>
                </div>
                <p className="text-slate-500 text-[11px]">নিবন্ধন নিশ্চিতকরণ, পাসওয়ার্ড পরিবর্তন ও আবেদন ট্র্যাকিং রিসিপ্ট।</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Cloudflare R2 / AWS S3 Storage</span>
                  <span className="text-emerald-700">৳3.00 / GB / মাস</span>
                </div>
                <p className="text-slate-500 text-[11px]">এনক্রিপ্টেড জাতীয় পরিচয়পত্র, শিক্ষাগত সনদ ও ছবি ফাইল সংরক্ষণ।</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: ADD OPERATIONAL EXPENSE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">নতুন অপারেশনাল খরচ এন্ট্রি</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">খরচের বিবরণ / টাইটেল *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Google AI Studio — Gemini 1.5 Flash Tokens"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ক্যাটাগরি *</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white"
                  >
                    {Object.entries(CATEGORY_NAMES_BN).map(([k, name]) => (
                      <option key={k} value={k}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">প্রোভাইডার নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: Vercel, Greenweb"
                    value={newExpense.provider}
                    onChange={(e) => setNewExpense({ ...newExpense, provider: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">টাকার পরিমাণ *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="পরিমাণ লিখুন"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">কারেন্সি</label>
                  <select
                    value={newExpense.currency}
                    onChange={(e) => setNewExpense({ ...newExpense, currency: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white"
                  >
                    <option value="BDT">BDT (টাকা)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">খরচের ধরন</label>
                  <select
                    value={newExpense.costNature}
                    onChange={(e) => setNewExpense({ ...newExpense, costNature: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white"
                  >
                    <option value="ACTUAL_BILLED">প্রকৃত বিল (Actual Billed)</option>
                    <option value="ESTIMATED_USAGE">অনুমানভিত্তিক (Estimated Usage)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">পেমেন্ট স্ট্যাটাস</label>
                  <select
                    value={newExpense.paymentStatus}
                    onChange={(e) => setNewExpense({ ...newExpense, paymentStatus: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white"
                  >
                    <option value="paid">পরিশোধিত (Paid)</option>
                    <option value="pending">পেন্ডিং (Pending)</option>
                    <option value="scheduled">শিডিউলড (Scheduled)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ইনভয়েস / রেফারেন্স নং</label>
                  <input
                    type="text"
                    placeholder="যেমন: INV-2026-99"
                    value={newExpense.invoiceNumber}
                    onChange={(e) => setNewExpense({ ...newExpense, invoiceNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">খরচের তারিখ</label>
                  <input
                    type="date"
                    value={newExpense.expenseDate}
                    onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">অতিরিক্ত নোট (ঐচ্ছিক)</label>
                <textarea
                  rows={2}
                  placeholder="খরচ সংক্রান্ত কোনো নোট..."
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: EDIT BUDGET CONFIG */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">প্ল্যাটফর্ম অপারেশনাল বাজেট কনফিগারেশন</h3>
              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBudgetUpdateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">মাসিক অপারেশনাল বাজেট (টাকা) *</label>
                <input
                  type="number"
                  required
                  value={editBudgetAmount}
                  onChange={(e) => setEditBudgetAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">বার্ষিক বাজেট স্বয়ংক্রিয়ভাবে ১২ গুণ হিসেবে গণনা করা হবে।</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">অ্যালার্ট থ্রেশহোল্ড শতাংশ (%) *</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  required
                  value={editAlertThreshold}
                  onChange={(e) => setEditAlertThreshold(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">বাজেট এই শতাংশ স্পর্শ করলে অ্যাডমিন ইন-অ্যাপ অ্যালার্ট পাঠানো হবে (ডিফল্ট: ৮০%)।</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'আপডেট হচ্ছে...' : 'বাজেট আপডেট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
