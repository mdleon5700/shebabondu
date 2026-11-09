'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Building2, 
  MapPin, 
  Download, 
  ExternalLink, 
  ArrowRight, 
  Clock, 
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  X,
  ShieldCheck,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { ExamNoticeItem } from '@/lib/exams/types';
import { initialExamNotices } from '@/lib/exams/data';

export default function ExamNoticesClient() {
  const [notices] = useState<ExamNoticeItem[]>(initialExamNotices);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Seat plan modal states
  const [isSeatPlanModalOpen, setIsSeatPlanModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<ExamNoticeItem | null>(null);

  // Bengali numerals converter
  const toBn = (num: number | string | undefined | null) => {
    if (num === undefined || num === null) return '';
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnNums[parseInt(d, 10)]);
  };

  // Filtered Notices
  const filteredNotices = useMemo(() => {
    return notices.filter(n => {
      const matchesType = selectedType === 'all' || n.type === selectedType;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        n.title.toLowerCase().includes(q) ||
        n.organization.toLowerCase().includes(q) ||
        n.centersCount.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [notices, selectedType, searchQuery]);

  const handleOpenSeatPlan = (notice: ExamNoticeItem) => {
    setSelectedNotice(notice);
    setIsSeatPlanModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">পরীক্ষার সময়সূচি ও নোটিশ</span>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-3">
            <span className="bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 animate-pulse">
              <Calendar className="w-3.5 h-3.5" />
              <span>লাইভ পরীক্ষার রুটিন ও আসনবিন্যাস</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              সকল সরকারি ও ব্যাংক চাকরির পরীক্ষার সময়সূচি
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              বিজ্ঞপ্তি অনুযায়ী প্রিলিমিনারি, লিখিত ও ব্যবহারিক পরীক্ষার তারিখ, সময়, কেন্দ্র এবং আসনবিন্যাস (Seat Plan) এক নজরে দেখুন ও ডাউনলোড করুন।
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 text-center shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-emerald-400 block font-mono">
                {toBn(notices.length)}
              </span>
              <span className="text-xs text-slate-300 font-bold">সক্রিয় নোটিশ</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-teal-300 block font-mono">
                {toBn(notices.filter(n => n.seatPlanSummary && n.seatPlanSummary.length > 0).length)}
              </span>
              <span className="text-xs text-slate-300 font-bold">আসনবিন্যাস রেডি</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Exam Type Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="মন্ত্রণালয়, প্রতিষ্ঠান বা পদের নাম দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto text-xs font-bold">
            {[
              { id: 'all', label: 'সকল নোটিশ' },
              { id: 'written', label: 'লিখিত পরীক্ষা (Written)' },
              { id: 'preliminary', label: 'MCQ / প্রিলিমিনারি' },
              { id: 'seat_plan', label: 'আসনবিন্যাস (Seat Plan)' },
              { id: 'practical', label: 'ব্যবহারিক (Practical)' }
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

      {/* Exam Notices List */}
      <div className="space-y-4">
        {filteredNotices.map((n) => (
          <div 
            key={n.id} 
            className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="space-y-2.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-200">
                  {n.organization}
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-md">
                  {n.typeLabel}
                </span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-md ${
                  n.badge === 'জরুরি'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-teal-100 text-teal-800'
                }`}>
                  {n.badge}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {n.title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>তারিখ: {n.examDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>সময়: {n.examTime}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:col-span-2 lg:col-span-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>কেন্দ্র: {n.centersCount}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap sm:flex-col items-stretch sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
              {n.seatPlanSummary && n.seatPlanSummary.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleOpenSeatPlan(n)}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>আসনবিন্যাস (Seat Plan) দেখুন</span>
                </button>
              )}

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {n.pdfUrl && (
                  <a
                    href={n.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>নোটিশ PDF</span>
                  </a>
                )}

                <Link
                  href="/admit-cards"
                  className="flex-1 sm:flex-none px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <span>প্রবেশপত্র</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotices.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">কোনো পরীক্ষার নোটিশ পাওয়া যায়নি।</h3>
          <p className="text-xs text-slate-500">অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজুন অথবা সকল নোটিশ বাছাই করুন।</p>
        </div>
      )}

      {/* SEAT PLAN & EXAM CENTERS DETAILS MODAL */}
      {isSeatPlanModalOpen && selectedNotice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                  <Layers className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {selectedNotice.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    কেন্দ্রভিত্তিক আসনবিন্যাস ও পরীক্ষার্থীদের জন্য জরুরি নিয়মাবলী
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSeatPlanModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Summary Pill */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 font-bold">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>তারিখ: {selectedNotice.examDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>সময়: {selectedNotice.examTime}</span>
              </div>
            </div>

            {/* Seat Plan Center-wise Table */}
            {selectedNotice.seatPlanSummary && selectedNotice.seatPlanSummary.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>কেন্দ্রভিত্তিক রোল নম্বর ও আসনবন্টন:</span>
                </h4>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                        <tr>
                          <th className="p-3">পরীক্ষা কেন্দ্র ও ঠিকানা</th>
                          <th className="p-3">রোল নম্বর রেঞ্জ</th>
                          <th className="p-3 text-right">আসন সংখ্যা</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {selectedNotice.seatPlanSummary.map((sp, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">{sp.centerName}</span>
                              <span className="text-[11px] text-slate-400 block">{sp.address}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block text-[11px]">
                                {sp.rollRange}
                              </span>
                            </td>
                            <td className="p-3 text-right font-bold text-slate-800 font-mono">
                              {toBn(sp.totalSeats)} জন
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Examination Guidelines */}
            {selectedNotice.instructions && selectedNotice.instructions.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>পরীক্ষার্থীদের জন্য অবশ্য পালনীয় নির্দেশনাবলী:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1 text-[11px] leading-relaxed">
                  {selectedNotice.instructions.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/admit-cards"
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>প্রবেশপত্র ডাউনলোড পেজে যান ↗</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsSeatPlanModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
