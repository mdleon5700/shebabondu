import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'সম্পাদকীয় নীতিমালা (Editorial Policy) | চাকরি সেবা',
  description: 'বিজ্ঞপ্তি সংগ্রহ, মান নিয়ন্ত্রণ ও বস্তুনিষ্ঠতা বজায় রাখার সম্পাদকীয় নির্দেশিকা।',
};

export default function PolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">সম্পাদকীয় নীতিমালা (Editorial Policy)</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full inline-block">
            অফিশিয়াল ডকুমেন্ট ও নীতিমালা
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            সম্পাদকীয় ও কন্টেন্ট প্রকাশনা নীতিমালা
          </h1>
          <p className="text-xs text-slate-500">সর্বশেষ সংস্করণ: অক্টোবর ২০২৬ • চাকরি সেবা কমপ্লায়েন্স টিম</p>
        </div>

        <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            তথ্যের নির্ভরযোগ্য উৎস
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
            চাকরি সেবা কোনো ভুয়া বা অননুমোদিত গুজবের বিজ্ঞপ্তি প্রকাশ করে না। প্রতিটি তথ্য সরকারি গেজেট, বাংলাদেশ গেজেট প্রেস (BG Press), মন্ত্রণালয় ও অধিদপ্তরের মূল ওয়েবসাইট এবং জাতীয় দৈনিকের অফিশিয়াল প্রকাশনা থেকে সংগ্রহ করা হয়।
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            বস্তুনিষ্ঠতা ও স্বচ্ছতা
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
            আমরা নিয়োগের ক্ষেত্রে কোনো মধ্যস্থতাকারী নই এবং কোনো নিয়োগ পরীক্ষায় অনৈতিক হস্তক্ষেপ সমর্থন করি না। আমাদের সকল কন্টেন্ট শিক্ষামূলক ও পরীক্ষার্থীদের সুবিধার্থে প্রকাশিত হয়।
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
