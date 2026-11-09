'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Smartphone,
  Copy,
  Check,
  X,
  HelpCircle,
  Calendar,
  Building2,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AdmitCardItem } from '@/lib/exams/types';
import { initialAdmitCards } from '@/lib/exams/data';

export default function AdmitCardsClient() {
  const [admitCards] = useState<AdmitCardItem[]>(initialAdmitCards);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Recovery modal states
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [recoveryJob, setRecoveryJob] = useState<AdmitCardItem | null>(null);
  const [recoveryType, setRecoveryType] = useState<'userId' | 'pin'>('userId');
  const [recoveryName, setRecoveryName] = useState('');
  const [recoveryFatherName, setRecoveryFatherName] = useState('');
  const [recoveryUserId, setRecoveryUserId] = useState('');
  const [recoveryOrgCode, setRecoveryOrgCode] = useState('BPSC');
  const [copiedRecoverySms, setCopiedRecoverySms] = useState(false);

  // Bengali numerals converter
  const toBn = (num: number | string | undefined | null) => {
    if (num === undefined || num === null) return '';
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnNums[parseInt(d, 10)]);
  };

  // Filtered Admit Cards
  const filteredAdmitCards = useMemo(() => {
    return admitCards.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.title.toLowerCase().includes(q) ||
        item.organization.toLowerCase().includes(q) ||
        item.portalName.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [admitCards, selectedCategory, searchQuery]);

  // Open recovery modal for a specific job
  const handleOpenRecovery = (item: AdmitCardItem) => {
    setRecoveryJob(item);
    setRecoveryOrgCode(item.teletalkPrefix || 'ORG');
    setIsRecoveryModalOpen(true);
  };

  // Generated SMS format
  const generatedSms = useMemo(() => {
    const org = recoveryOrgCode.trim().toUpperCase() || 'ORG';
    if (recoveryType === 'userId') {
      const name = recoveryName.trim().toUpperCase() || 'NAME';
      const fName = recoveryFatherName.trim().toUpperCase() || 'FATHER';
      return `${org} HELP USER ${name} ${fName}`;
    } else {
      const uid = recoveryUserId.trim().toUpperCase() || 'USERID';
      return `${org} HELP PIN ${uid}`;
    }
  }, [recoveryOrgCode, recoveryType, recoveryName, recoveryFatherName, recoveryUserId]);

  const handleCopySms = () => {
    navigator.clipboard.writeText(generatedSms);
    setCopiedRecoverySms(true);
    setTimeout(() => setCopiedRecoverySms(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">প্রবেশপত্র পোর্টাল</span>
      </div>

      {/* Hero Header Banner with Live Stats */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-3">
            <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
              <Download className="w-3.5 h-3.5" />
              <span>প্রবেশপত্র ডাউনলোড পোর্টাল ২০২৬</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              সকল সরকারি ও ব্যাংক চাকরির প্রবেশপত্র ডাউনলোড লিংক
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              টেলিটক ও সংশ্লিষ্ট অফিশিয়াল সার্ভার থেকে আপনার User ID ও Password দিয়ে সরাসরি এডমিট কার্ড ডাউনলোড করুন। ইউজার আইডি বা পিন ভুলে গেলে তাৎক্ষণিক রিকভারির সুযোগ।
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 text-center shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-emerald-400 block font-mono">
                {toBn(admitCards.filter(a => a.status === 'active').length)}
              </span>
              <span className="text-xs text-slate-300 font-bold">ডাউনলোড চলছে</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-amber-300 block font-mono">
                {toBn(admitCards.length)}
              </span>
              <span className="text-xs text-slate-300 font-bold">মোট নোটিশ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="পরীক্ষার নাম, প্রতিষ্ঠান বা পোর্টাল দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto text-xs font-bold">
            {[
              { id: 'all', label: 'সকল' },
              { id: 'govt', label: 'বিসিএস ও সরকারি' },
              { id: 'bank', label: 'ব্যাংক ও আর্থিক' },
              { id: 'teacher', label: 'শিক্ষক নিয়োগ' },
              { id: 'railway', label: 'রেলওয়ে' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Admit Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAdmitCards.map((a) => {
          const isActive = a.status === 'active';
          return (
            <div 
              key={a.id} 
              className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {a.statusLabel}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {a.categoryLabel}
                  </span>
                </div>

                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {a.title}
                  </h2>
                  <div className="text-xs font-bold text-slate-600 mt-1">
                    {a.organization}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">পরীক্ষার তারিখ:</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{a.examDate}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ডাউনলোডের শেষ সময়:</span>
                    <span className="font-bold text-rose-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{a.deadlineText}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                    <span className="text-slate-400">অফিশিয়াল পোর্টাল:</span>
                    <span className="font-mono font-bold text-slate-800">{a.portalName}</span>
                  </div>
                </div>

                {a.instructions && (
                  <p className="text-[11px] text-slate-500 leading-relaxed italic">
                    💡 {a.instructions}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => handleOpenRecovery(a)}
                  className="w-full sm:w-auto text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>User ID / PIN রিকভারি</span>
                </button>

                <a
                  href={a.portalUrl.startsWith('http') ? a.portalUrl : `https://${a.portalUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all hover:scale-105 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>প্রবেশপত্র ডাউনলোড (অফিশিয়াল লিংক)</span>
                  <ExternalLink className="w-3 h-3 text-emerald-200" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAdmitCards.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">কোনো প্রবেশপত্র নোটিশ পাওয়া যায়নি।</h3>
          <p className="text-xs text-slate-500">অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজুন অথবা সকল ক্যাটাগরি বাছাই করুন।</p>
        </div>
      )}

      {/* USER ID & PIN RECOVERY ASSISTANT MODAL */}
      {isRecoveryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    User ID ও PIN রিকভারি সহকারী
                  </h3>
                  <p className="text-xs text-slate-500">
                    টেলিটক ১৬২২২ এসএমএস এর মাধ্যমে তাত্ক্ষণিক পুনরুদ্ধার
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRecoveryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Recovery Mode Selector */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setRecoveryType('userId')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  recoveryType === 'userId' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                User ID ভুলে গেছি
              </button>
              <button
                type="button"
                onClick={() => setRecoveryType('pin')}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  recoveryType === 'pin' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PIN / পাসওয়ার্ড ভুলে গেছি
              </button>
            </div>

            {/* Inputs based on recovery mode */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  প্রতিষ্ঠানের কোড (Org Code) *
                </label>
                <input
                  type="text"
                  value={recoveryOrgCode}
                  onChange={(e) => setRecoveryOrgCode(e.target.value.toUpperCase())}
                  placeholder="যেমন: BPSC, DPE, FRI"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {recoveryType === 'userId' ? (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      প্রার্থীর নাম (আবেদনে প্রদত্ত ইংরেজি নাম) *
                    </label>
                    <input
                      type="text"
                      value={recoveryName}
                      onChange={(e) => setRecoveryName(e.target.value.toUpperCase())}
                      placeholder="উদা: ARIFUL ISLAM"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      পিতার নাম (আবেদনে প্রদত্ত ইংরেজি নাম) *
                    </label>
                    <input
                      type="text"
                      value={recoveryFatherName}
                      onChange={(e) => setRecoveryFatherName(e.target.value.toUpperCase())}
                      placeholder="উদা: MOTIUR RAHMAN"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    আপনার User ID *
                  </label>
                  <input
                    type="text"
                    value={recoveryUserId}
                    onChange={(e) => setRecoveryUserId(e.target.value.toUpperCase())}
                    placeholder="উদা: BK7X92LQ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Generated SMS Instruction Card */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>যেকোনো টেলিটক সিম থেকে ১৬২২২ নম্বরে পাঠাতে হবে:</span>
                </span>
                <span className="font-mono font-bold">To: 16222</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl font-mono text-sm text-emerald-400 border border-slate-800 flex items-center justify-between">
                <span className="truncate pr-2">{generatedSms}</span>
                <button
                  type="button"
                  onClick={handleCopySms}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedRecoverySms ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRecoverySms ? 'কপি হয়েছে' : 'কপি'}</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                ফিরতি এসএমএসে টেলিটক থেকে আপনার কাঙ্ক্ষিত {recoveryType === 'userId' ? 'User ID' : 'PIN কোড'} প্রেরণ করা হবে।
              </p>
            </div>

            {/* Online Portal Direct Link */}
            {recoveryJob?.portalUrl && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                <span>অনলাইনে সরাসরি ওয়েব রিকভারি করতে চান?</span>
                <a
                  href={recoveryJob.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>ওয়েব লিংক ↗</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Important FAQ Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-700" />
          <span>প্রবেশপত্র ডাউনলোড সংক্রান্ত জরুরি সাধারণ জিজ্ঞাসা (FAQ)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 block">১. প্রবেশপত্র কি রঙিন প্রিন্ট করা বাধ্যতামূলক?</span>
            <p>হ্যাঁ, সরকারি কর্ম কমিশন (বিপিএসসি), প্রাথমিক শিক্ষা অধিদপ্তর ও ব্যাংকার্স সিলেকশন কমিটির সকল প্রবেশপত্র লেজার প্রিন্টারে রঙিন প্রিন্ট করা বাধ্যতামূলক যাতে মুখমণ্ডল ও স্বাক্ষর স্পষ্ট থাকে।</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 block">২. প্রবেশপত্রে ছবি না আসলে বা উল্টো আসলে কী করব?</span>
            <p>ব্রাউজার ক্যাশ ও কুকিজ ক্লিয়ার করে পুনরায় ডাউনলোড করুন। সমস্যা স্থায়ী হলে দ্রুত টেলিটক হেল্পডেস্কে (121 অথবা 16222) যোগাযোগ করে পাসপোর্ট ছবি প্রতিস্থাপন করতে হবে।</p>
          </div>
        </div>
      </div>

    </div>
  );
}
