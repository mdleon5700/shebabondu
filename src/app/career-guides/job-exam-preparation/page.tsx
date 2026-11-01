import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { BookOpen, ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'চাকরির পরীক্ষার প্রস্তুতি: বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান | চাকরি সেবা',
  description: 'প্রিলিমিনারি ও লিখিত পরীক্ষার বিষয়ভিত্তিক পড়ালেখার রুটিন ও সহায়ক বইয়ের তালিকা।',
};

export default function GuideDetailPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <Link href="/career-guides" className="hover:text-emerald-700 transition-colors">ক্যারিয়ার গাইড</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">চাকরির পরীক্ষার প্রস্তুতি: বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
          পেশাদার ক্যারিয়ার পরামর্শ
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
          চাকরির পরীক্ষার প্রস্তুতি: বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান
        </h1>
        <p className="text-sm font-semibold text-slate-500 pb-4 border-b border-slate-100">
          প্রিলিমিনারি ও লিখিত পরীক্ষার বিষয়ভিত্তিক পড়ালেখার রুটিন ও সহায়ক বইয়ের তালিকা।
        </p>

        <div className="space-y-4 text-base text-slate-700 leading-relaxed">
          <p>চাকরির পরীক্ষার ৭০% প্রশ্ন বিগত বছরের বিভিন্ন নিয়োগ পরীক্ষার প্রশ্ন থেকে রিপিট বা প্যাটার্ন অনুযায়ী আসে। তাই বিগত ১০ বছরের প্রশ্ন সমাধান করা বাধ্যতামূলক।</p>
          <p>গণিতে নিয়মিত শর্টকাট অনুশীলনের চেয়ে বেসিক নিয়ম ক্লিয়ার রাখা বেশি ফলপ্রসূ। প্রতিদিন সংবাদপত্র পড়ার মাধ্যমে সাম্প্রতিক বিষয়ে আপডেট থাকুন।</p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-8 space-y-3">
          <div className="font-bold text-sm text-slate-900">অন্যান্য ক্যারিয়ার গাইডসমূহ:</div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Link href="/career-guides/cv-writing" className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:text-emerald-700 font-bold">সিভি তৈরির নিয়ম</Link>
            <Link href="/career-guides/online-job-application" className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:text-emerald-700 font-bold">অনলাইন আবেদন নির্দেশিকা</Link>
            <Link href="/career-guides/viva-preparation" className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:text-emerald-700 font-bold">ভাইভা প্রস্তুতি</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
