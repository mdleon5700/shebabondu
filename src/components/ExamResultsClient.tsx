'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Award, 
  FileText, 
  CheckCircle2, 
  Download, 
  ArrowRight, 
  Calendar, 
  Search,
  Check,
  AlertCircle,
  Sparkles,
  Users,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { ExamResultItem } from '@/lib/exams/types';
import { initialExamResults } from '@/lib/exams/data';

interface ExamResultsClientProps {
  defaultTypeFilter?: 'all' | 'written' | 'preliminary' | 'final';
  pageTitle?: string;
  pageSubtitle?: string;
  breadcrumbLabel?: string;
}

export default function ExamResultsClient({
  defaultTypeFilter = 'all',
  pageTitle = 'সকল সরকারি ও ব্যাংক চাকরির পরীক্ষার ফলাফল ও মেধা তালিকা',
  pageSubtitle = 'বিসিএস, প্রাথমিক শিক্ষক, বাংলাদেশ ব্যাংক ও সরকারি নিয়োগ পরীক্ষার প্রিলিমিনারি, লিখিত ও চূড়ান্ত ফলাফল শিট।',
  breadcrumbLabel = 'পরীক্ষার ফলাফল'
}: ExamResultsClientProps) {
  const [results] = useState<ExamResultItem[]>(initialExamResults);
  const [selectedType, setSelectedType] = useState<string>(defaultTypeFilter);
  const [searchQuery, setSearchQuery] = useState('');

  // Roll Checker states
  const [checkerExamId, setCheckerExamId] = useState<string>(initialExamResults[0]?.id || '');
  const [checkerRoll, setCheckerRoll] = useState<string>('');
  const [checkerResult, setCheckerResult] = useState<{
    status: 'passed' | 'failed' | null;
    message: string;
    details?: string;
  } | null>(null);

  // Expandable rolls list
  const [expandedRollsId, setExpandedRollsId] = useState<string | null>(null);

  // Bengali numerals converter
  const toBn = (num: number | string | undefined | null) => {
    if (num === undefined || num === null) return '';
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnNums[parseInt(d, 10)]);
  };

  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const matchesType = selectedType === 'all' || r.type === selectedType;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        r.title.toLowerCase().includes(q) ||
        r.organization.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [results, selectedType, searchQuery]);

  // Handle Roll Check
  const handleCheckRoll = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRoll = checkerRoll.trim();
    if (!cleanRoll) return;

    const exam = results.find(r => r.id === checkerExamId);
    if (!exam) return;

    const isPassed = exam.passedRolls.includes(cleanRoll);

    if (isPassed) {
      setCheckerResult({
        status: 'passed',
        message: `🎉 অভিনন্দন! আপনার রোল নম্বরটি (${cleanRoll}) উত্তীর্ণদের মেধা তালিকায় রয়েছে!`,
        details: exam.nextStepNotice || 'পরবর্তী ধাপের জন্য অফিসিয়াল নোটিশ লক্ষ্য রাখুন।'
      });
    } else {
      setCheckerResult({
        status: 'failed',
        message: `⚠️ দুঃখিত! রোল নম্বরটি (${cleanRoll}) এই মেধা তালিকায় পাওয়া যায়নি।`,
        details: 'অনুগ্রহ করে রোল নম্বর সঠিকভাবে লিখেছেন কিনা তা নিশ্চিত করুন অথবা অফিসিয়াল পিডিএফ গেজেট ডাউনলোড করে চেক করুন।'
      });
    }
  };

  const toggleExpandRolls = (id: string) => {
    setExpandedRollsId(prev => prev === id ? null : id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{breadcrumbLabel}</span>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-3">
            <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
              <Award className="w-3.5 h-3.5" />
              <span>ফলাফল ও মেধা তালিকা ২০২৬</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {pageTitle}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {pageSubtitle}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 text-center shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-emerald-400 block font-mono">
                {toBn(results.length)}
              </span>
              <span className="text-xs text-slate-300 font-bold">প্রকাশিত ফলাফল</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-teal-300 block font-mono">
                {toBn(results.reduce((acc, r) => acc + r.passedCount, 0))}
              </span>
              <span className="text-xs text-slate-300 font-bold">উত্তীর্ণ পরীক্ষার্থী</span>
            </div>
          </div>
        </div>
      </div>

      {/* INSTANT ROLL NUMBER RESULT CHECKER CARD */}
      <div className="bg-white rounded-3xl border-2 border-emerald-500/80 p-6 sm:p-8 shadow-md space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>১-ক্লিকে নিজের রোল নম্বর ফলাফল যাচাই করুন (Instant Roll Checker)</span>
            </h3>
            <p className="text-xs text-slate-500">
              পরীক্ষা নির্বাচন করে আপনার রোল নম্বর লিখলেই ফলাফল জানিয়ে দেওয়া হবে
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto shrink-0">
            ইনস্ট্যান্ট ভেরিফায়ার
          </span>
        </div>

        <form onSubmit={handleCheckRoll} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-5">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              পরীক্ষা বাছাই করুন *
            </label>
            <select
              value={checkerExamId}
              onChange={(e) => {
                setCheckerExamId(e.target.value);
                setCheckerResult(null);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
            >
              {results.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.organization})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              আপনার রোল নম্বর লিখুন *
            </label>
            <input
              type="text"
              required
              placeholder="উদা: 101234"
              value={checkerRoll}
              onChange={(e) => {
                setCheckerRoll(e.target.value);
                setCheckerResult(null);
              }}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02]"
            >
              <Search className="w-4 h-4" />
              <span>ফলাফল দেখুন</span>
            </button>
          </div>
        </form>

        {/* Checker Result Alert Box */}
        {checkerResult && (
          <div className={`p-4 rounded-2xl border transition-all duration-300 space-y-1.5 animate-in fade-in ${
            checkerResult.status === 'passed'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <div className="font-black text-sm flex items-center gap-2">
              {checkerResult.status === 'passed' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{checkerResult.message}</span>
            </div>
            {checkerResult.details && (
              <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                {checkerResult.details}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Search & Result Type Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="পরীক্ষার নাম বা প্রতিষ্ঠান দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto text-xs font-bold">
            {[
              { id: 'all', label: 'সকল ফলাফল' },
              { id: 'written', label: 'লিখিত পরীক্ষার ফলাফল (Written)' },
              { id: 'preliminary', label: 'প্রিলিমিনারি ফলাফল (MCQ)' },
              { id: 'final', label: 'চূড়ান্ত ফলাফল ও সুপারিশ (Final)' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedType === tab.id
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

      {/* Results List */}
      <div className="space-y-5">
        {filteredResults.map((r) => {
          const isExpanded = expandedRollsId === r.id;
          return (
            <div 
              key={r.id} 
              className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-sm space-y-4 hover:border-emerald-400 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {r.organization}
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-md">
                      {r.typeLabel}
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>প্রকাশের তারিখ: {r.publishedDate}</span>
                    </span>
                  </div>

                  <h2 className="text-base sm:text-xl font-black text-slate-900 leading-snug">
                    {r.title}
                  </h2>

                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-emerald-700">
                      মোট উত্তীর্ণ হয়েছেন: <strong className="font-mono text-sm">{toBn(r.passedCount)}</strong> জন
                    </span>
                    {r.totalAppeared && (
                      <span className="text-slate-400">
                        (অংশগ্রহণকারী: {toBn(r.totalAppeared)} জন)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {r.pdfUrl && (
                    <a
                      href={r.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 hover:scale-105 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>গেজেট রেজাল্ট শিট (PDF)</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Next Step Guidance Alert */}
              {r.nextStepNotice && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>পরবর্তী নির্দেশিকা ও করণীয়:</span>
                  </span>
                  <p className="text-[11px] text-slate-600 pl-5 leading-relaxed">
                    {r.nextStepNotice}
                  </p>
                </div>
              )}

              {/* Sample Passed Roll Numbers Preview */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => toggleExpandRolls(r.id)}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{isExpanded ? 'রোল নম্বর তালিকা লুকান' : `উত্তীর্ণ রোল নম্বরের নমুনা তালিকা দেখুন (${toBn(r.passedRolls.length)}টি নমুনা রোল)`}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className="mt-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in duration-150">
                    <span className="text-[11px] font-bold text-slate-600 block">
                      উত্তীর্ণ রোল নম্বরসমূহ (নমুনা):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {r.passedRolls.map((roll, idx) => (
                        <span 
                          key={idx}
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 shadow-2xs"
                        >
                          {roll}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 pt-1">
                      * সম্পূর্ণ রোল তালিকার জন্য উপরে প্রদত্ত অফিসিয়াল PDF গেজেট ডাউনলোড করুন।
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredResults.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">কোনো পরীক্ষার ফলাফল পাওয়া যায়নি।</h3>
          <p className="text-xs text-slate-500">অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজুন অথবা সকল ক্যাটাগরি বাছাই করুন।</p>
        </div>
      )}

    </div>
  );
}

