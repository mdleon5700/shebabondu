'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Clock, 
  Building2, 
  FileCheck2, 
  Briefcase, 
  Download, 
  Check, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Award
} from 'lucide-react';
import { VivaNoticeItem } from '@/lib/exams/types';
import { initialVivaNotices } from '@/lib/exams/data';

export default function VivaNoticesClient() {
  const [vivaNotices] = useState<VivaNoticeItem[]>(initialVivaNotices);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive Document Checklist state (set of checked doc IDs)
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    'doc-0': true,
    'doc-1': true
  });

  // Bengali numerals converter
  const toBn = (num: number | string | undefined | null) => {
    if (num === undefined || num === null) return '';
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnNums[parseInt(d, 10)]);
  };

  const filteredNotices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return vivaNotices;
    return vivaNotices.filter(v => 
      v.title.toLowerCase().includes(q) ||
      v.organization.toLowerCase().includes(q) ||
      v.department.toLowerCase().includes(q) ||
      v.venue.toLowerCase().includes(q)
    );
  }, [vivaNotices, searchQuery]);

  const toggleDoc = (docId: string) => {
    setCheckedDocs(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">ভাইভা সময়সূচি</span>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-3">
            <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
              <Users className="w-3.5 h-3.5" />
              <span>মৌখিক পরীক্ষার রুটিন ও বোর্ড শিডিউল ২০২৬</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              সকল মন্ত্রণালয় ও ব্যাংকের ভাইভা সময়সূচি
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              লিখিত পরীক্ষায় উত্তীর্ণ প্রার্থীদের বোর্ডভিত্তিক সময়সূচি, রোল নম্বর রেঞ্জ এবং ভাইভা বোর্ডে দাখিলযোগ্য মূল কাগজপত্রের পুঙ্খানুপুঙ্খ নির্দেশিকা।
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 text-center shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-emerald-400 block font-mono">
                {toBn(vivaNotices.length)}
              </span>
              <span className="text-xs text-slate-300 font-bold">চলমান ভাইভা</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
              <span className="text-2xl font-black text-teal-300 block font-mono">
                {toBn(vivaNotices.reduce((acc, v) => acc + v.postsCount, 0))}
              </span>
              <span className="text-xs text-slate-300 font-bold">মোট পদসংখ্যা</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="মন্ত্রণালয়, বিভাগ, বা পদের নাম দিয়ে ভাইভা খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Viva Notices List */}
      <div className="space-y-6">
        {filteredNotices.map((v) => (
          <div 
            key={v.id} 
            className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 hover:border-emerald-400 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {v.organization}
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                    {v.department}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {v.title}
                </h2>
              </div>

              {v.pdfUrl && (
                <a
                  href={v.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>অফিসিয়াল শিডিউল PDF</span>
                </a>
              )}
            </div>

            {/* Viva Details Facts Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700">
              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">ভাইভার সময়কাল:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{v.startDate} - {v.endDate}</span>
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">রিপোর্টিং সময়:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{v.reportingTime}</span>
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">ভাইভা স্থান / ভেন্যু:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{v.venue}</span>
                </span>
              </div>
            </div>

            {/* Board Schedule by Roll Numbers Table */}
            <div className="space-y-2.5">
              <h3 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>বোর্ডভিত্তিক তারিখ ও রোল নম্বর বণ্টন শিডিউল:</span>
              </h3>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                      <tr>
                        <th className="p-3">বোর্ড ও কক্ষ নম্বর</th>
                        <th className="p-3">ভাইভার তারিখ ও সময়</th>
                        <th className="p-3">রোল নম্বর রেঞ্জ</th>
                        <th className="p-3 text-right">প্রার্থী সংখ্যা</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {v.boardSchedules.map((bs, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="p-3 font-bold text-slate-900">
                            {bs.boardNo}
                          </td>
                          <td className="p-3 text-slate-600">
                            {bs.date} • {bs.time}
                          </td>
                          <td className="p-3">
                            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block text-[11px]">
                              {bs.rollRange}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-slate-800 font-mono">
                            {toBn(bs.candidatesCount)} জন
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Required Documents Checklist */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-700" />
                  <span>ভাইভা বোর্ডে যেসব মূল সনদ সাথে নিতে হবে (চেকলিস্ট):</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  সত্যায়িত ১ সেট ফটোকপি বাধ্যতামূলক
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {v.requiredDocuments.map((docText, i) => {
                  const docKey = `${v.id}-doc-${i}`;
                  const isChecked = Boolean(checkedDocs[docKey]);
                  return (
                    <div
                      key={i}
                      onClick={() => toggleDoc(docKey)}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        isChecked ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 font-semibold' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDoc(docKey)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                      />
                      <span className="text-[11px] leading-relaxed select-none">
                        {docText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ))}
      </div>

      {filteredNotices.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">কোনো মৌখিক পরীক্ষার শিডিউল পাওয়া যায়নি।</h3>
          <p className="text-xs text-slate-500">অনুগ্রহ করে অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজুন।</p>
        </div>
      )}

      {/* Viva Preparation Tips Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-700" />
          <span>ভাইভা বোর্ডের জন্য গুরুত্বপূর্ণ শিষ্টাচার ও ড্রেসকোড গাইড</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 block">১. ফরমাল পোশাক ও প্রস্তুতি:</span>
            <p>পুরুষ প্রার্থীদের ক্ষেত্রে ফরমাল ফুলহাতা শার্ট, ট্রাউজার, টাই ও সু। নারী প্রার্থীদের ক্ষেত্রে মার্জিত রঙের শাড়ি বা সালোয়ার-কামিজ। আত্মবিশ্বাসী দেহভঙ্গি বজায় রাখুন।</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 block">২. সাধারণ জ্ঞান ও নিজ জেলা/মন্ত্রণালয় তথ্য:</span>
            <p>যে মন্ত্রণালয় বা ব্যাংকে ভাইভা দিচ্ছেন তার লক্ষ্য, কার্যাবলী, শীর্ষ কর্মকর্তাদের নাম এবং নিজের জন্মজেলা ও মুক্তিযুদ্ধের ইতিহাস সম্পর্কে স্বচ্ছ ধারণা রাখুন।</p>
          </div>
        </div>
      </div>

    </div>
  );
}
