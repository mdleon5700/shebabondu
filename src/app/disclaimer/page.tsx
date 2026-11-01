import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'দায়-অস্বীকার ও আইনি বার্তা (Disclaimer) | চাকরি সেবা',
  description: 'চাকরি সেবার আইনগত অবস্থান ও সরকারি অনুমোদনের দায়মুক্তি বার্তা।',
};

export default function PolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">দায়-অস্বীকার ও আইনি বার্তা (Disclaimer)</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full inline-block">
            অফিশিয়াল ডকুমেন্ট ও নীতিমালা
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            আইনি বার্তা ও দায়-অস্বীকার (Legal Disclaimer)
          </h1>
          <p className="text-xs text-slate-500">সর্বশেষ সংস্করণ: অক্টোবর ২০২৬ • চাকরি সেবা কমপ্লায়েন্স টিম</p>
        </div>

        <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            সরকারি দায়মুক্তি
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
            চাকরি সেবা গণপ্রজাতন্ত্রী বাংলাদেশ সরকার বা কোনো সরকারি ব্যাংকের অঙ্গপ্রতিষ্ঠান নয়। আমরা বিভিন্ন প্রকাশ্য অফিশিয়াল ওয়েবসাইট ও জাতীয় পত্রিকা থেকে তথ্য সংগ্রহ করে চাকরিপ্রার্থীদের সুবিধার জন্য পরিবেশন করি।
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            আবেদনের ফলাফল
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
            পরীক্ষায় উত্তীর্ণ হওয়া বা চাকরি পাওয়া সম্পূর্ণভাবে প্রার্থীর মেধা ও সরকারি কর্তৃপক্ষের সিদ্ধান্তের ওপর নির্ভরশীল। এতে চাকরি সেবার কোনো প্রভাব বা সংশ্লিষ্টতা নেই।
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
