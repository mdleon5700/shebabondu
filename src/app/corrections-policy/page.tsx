import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ভুল তথ্য সংশোধন নীতিমালা (Corrections Policy) | চাকরি সেবা',
  description: 'কোনো বিজ্ঞপ্তিতে ভুল বা মুদ্রণ ত্রুটি পাওয়া গেলে দ্রুত সংশোধনের স্বচ্ছ নিয়ম।',
};

export default function PolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">ভুল তথ্য সংশোধন নীতিমালা (Corrections Policy)</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full inline-block">
            অফিশিয়াল ডকুমেন্ট ও নীতিমালা
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            ভুল তথ্য সংশোধন ও স্বচ্ছতা নীতিমালা
          </h1>
          <p className="text-xs text-slate-500">সর্বশেষ সংস্করণ: অক্টোবর ২০২৬ • চাকরি সেবা কমপ্লায়েন্স টিম</p>
        </div>

        <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            ত্রুটি সংশোধন প্রক্রিয়া
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
            যদি কোনো বিজ্ঞপ্তির শূন্যপদ, ডেডলাইন বা ফি নিয়ে সরকারি দপ্তরে কোনো সংশোধনী (Corrigendum) জারি করা হয়, তবে আমরা ২৪ ঘণ্টার মধ্যে আমাদের সাইটে তা আপডেট করি এবং সংশোধনী নোটিশটি স্পষ্টভাবে প্রদর্শন করি।
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            ব্যবহারকারীর ফিডব্যাক
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
            যেকোনো ব্যবহারকারী ভুল পরিলক্ষিত হলে 'রিপোর্ট করুন' পেজের মাধ্যমে আমাদের দ্রুত জানাতে পারেন।
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
