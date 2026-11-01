import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { BookOpen, Award, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'চাকরির পরীক্ষার প্রস্তুতি ও মানবন্টন গাইড ২০২৬ | চাকরি সেবা',
  description: 'বিসিএস, প্রাইমারি ও ব্যাংক জব প্রিলিমিনারি ও লিখিত পরীক্ষার সম্পূর্ণ প্রস্তুতি সহায়িকা।',
};

export default function ExamPreparationPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">পরীক্ষার প্রস্তুতি</span>
      </div>

      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40">
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          চাকরির পরীক্ষার পূর্ণাঙ্গ প্রস্তুতি ও বিষয়ভিত্তিক মানবন্টন
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2">
          বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞানের সেরা বুকরেফারেন্স ও বিগত বছরের প্রশ্ন সমাধানের গাইড।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>বিগত ১০ বছরের প্রশ্নব্যাংক</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            বিসিএস, প্রাথমিক শিক্ষক ও ব্যাংকের বিগত ১০ বছরের প্রশ্ন ও নির্ভুল সমাধান ডাউনলোড করে অনুশীলন শুরু করুন।
          </p>
          <Link href="/questions" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:underline">
            <span>প্রশ্নব্যাংক দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>অনলাইন মডেল টেস্ট</span>
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            লাইভ টাইমার ও ইনস্ট্যান্ট রেজাল্ট সহ অনলাইনে নিজেকে যাচাই করার জন্য ফ্রি মডেল টেস্ট দিন।
          </p>
          <Link href="/model-tests" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:underline">
            <span>মডেল টেস্টে অংশ নিন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
