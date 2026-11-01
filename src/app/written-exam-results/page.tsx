import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { FileText, Download, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'লিখিত পরীক্ষার ফলাফল ২০২৬ (Written Exam Results) | চাকরি সেবা',
  description: 'বিসিএস ও ব্যাংক নিয়োগের লিখিত পরীক্ষার ফলাফল এবং ভাইভার সময়সূচি।',
};

export default function WrittenExamResultsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <Link href="/exam-results" className="hover:text-emerald-700 transition-colors">পরীক্ষার ফলাফল</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">লিখিত পরীক্ষার ফলাফল</span>
      </div>

      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40">
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          লিখিত পরীক্ষার ফলাফল ও উত্তীর্ণদের তালিকা
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2">
          সরকারি মন্ত্রণালয়, অধিদপ্তর ও বাংলাদেশ ব্যাংকের লিখিত পরীক্ষায় উত্তীর্ণ পরীক্ষার্থীদের রোল নম্বর ও ভাইভা শিডিউল।
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4">
        <FileText className="w-12 h-12 text-emerald-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">সর্বশেষ লিখিত ফলাফল নিয়মিত হালনাগাদ করা হচ্ছে</h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          অফিসিয়াল গেজেট প্রকাশের সাথে সাথেই আমাদের রেজাল্ট ডাটাবেজে যুক্ত করা হয়। রোল নম্বর অনুযায়ী ফলাফল দেখতে রেজাল্ট সেকশনে ভিজিট করুন।
        </p>
        <Link href="/exam-results" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors">
          <span>সকল ফলাফল দেখুন</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
