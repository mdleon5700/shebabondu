import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'চাকরি যাচাই নীতিমালা (Job Verification Policy) | চাকরি সেবা',
  description: 'ভুয়া সার্কুলার ও আর্থিক প্রতারণা রোধে আমাদের কঠোর যাচাই পদ্ধতি।',
};

export default function PolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">চাকরি যাচাই নীতিমালা (Job Verification Policy)</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full inline-block">
            অফিশিয়াল ডকুমেন্ট ও নীতিমালা
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            চাকরি বিজ্ঞপ্তির সত্যতা যাচাইকরণ নীতিমালা
          </h1>
          <p className="text-xs text-slate-500">সর্বশেষ সংস্করণ: অক্টোবর ২০২৬ • চাকরি সেবা কমপ্লায়েন্স টিম</p>
        </div>

        <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            ৩ স্তরের সত্যতা যাচাই
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
            কোনো বিজ্ঞপ্তি ওয়েবসাইটে তোলার পূর্বে আমাদের রিসার্চ টিম সংশ্লিষ্ট প্রতিষ্ঠানের স্মারক নম্বর, মন্ত্রণালয়ের অনুমোদন ও অফিশিয়াল লিংক ক্রস-চেক করে থাকে।
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            প্রতারণা সতর্কতা
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
            যেকোনো সার্কুলারে যদি অনানুষ্ঠানিক বিকাশ/নগদে অতিরিক্ত ঘুষ বা জামানতের দাবি পাওয়া যায়, তা অবিলম্বে কালো তালিকাভুক্ত করা হয়। প্রার্থীরা যেন কোনো প্রতারণার শিকার না হন সেজন্য আমরা সচেতনতা বার্তা প্রদান করি।
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
