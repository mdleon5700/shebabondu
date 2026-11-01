import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Award, FileText, CheckCircle2, Download, ArrowRight, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'সকল সরকারি ও ব্যাংক চাকরির পরীক্ষার ফলাফল ২০২৬ | চাকরি সেবা',
  description: 'বিসিএস, বাংলাদেশ ব্যাংক, প্রাথমিক শিক্ষক ও সরকারি নিয়োগ পরীক্ষার প্রিলিমিনারি ও লিখিত ফলাফল।',
};

const results = [
  { id: 1, title: '৪৫তম বিসিএস লিখিত পরীক্ষার ফলাফল ও উত্তীর্ণদের তালিকা', org: 'BPSC', date: '২৫ অক্টোবর ২০২৬', passed: '১২,৭০৯ জন', type: 'লিখিত ফলাফল' },
  { id: 2, title: 'বাংলাদেশ ব্যাংক অফিসার (ক্যাশ) প্রিলিমিনারি পরীক্ষার ফলাফল', org: 'বাংলাদেশ ব্যাংক', date: '২২ অক্টোবর ২০২৬', passed: '৫,৪২০ জন', type: 'প্রিলিমিনারি' },
  { id: 3, title: 'প্রাথমিক সহকারী শিক্ষক নিয়োগ ২য় ধাপের চূড়ান্ত ফলাফল', org: 'প্রাথমিক শিক্ষা অধিদপ্তর', date: '১৮ অক্টোবর ২০২৬', passed: '৪,১৬০ জন', type: 'চূড়ান্ত ফলাফল' },
  { id: 4, title: 'বাংলাদেশ রেলওয়ে সহকারী স্টেশন মাস্টার পদের এমসিকিউ ফলাফল', org: 'রেলওয়ে রিক্রুটমেন্ট', date: '১৫ অক্টোবর ২০২৬', passed: '২,৮০০ জন', type: 'প্রিলিমিনারি' },
];

export default function ExamResultsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">পরীক্ষার ফলাফল</span>
      </div>

      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40">
        <div className="max-w-2xl space-y-3">
          <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            ফলাফল ও মেরিট লিস্ট
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            সকল নিয়োগ পরীক্ষার ফলাফল ও উত্তীর্ণদের তালিকা
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            সরকারি গেজেট ও রোল নম্বর অনুযায়ী অফিসিয়াল রেজাল্ট শিট PDF আকারে দেখুন ও ডাউনলোড করুন।
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((r) => (
          <div key={r.id} className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-200">
                  {r.org}
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                  {r.type}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  প্রকাশ: {r.date}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {r.title}
              </h2>
              <div className="text-xs font-bold text-emerald-700">
                মোট উত্তীর্ণ হয়েছেন: {r.passed}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/written-exam-results"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>মেরিট লিস্ট দেখুন</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
