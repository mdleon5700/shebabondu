import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'গোপনীয়তা নীতিমালা (Privacy Policy) | চাকরি সেবা',
  description: 'প্রার্থীদের এনআইডি, ছবি ও ব্যক্তিগত তথ্যের সর্বোচ্চ ব্যাংকিং গ্রেড নিরাপত্তা।',
};

export default function PolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">গোপনীয়তা নীতিমালা (Privacy Policy)</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full inline-block">
            অফিশিয়াল ডকুমেন্ট ও নীতিমালা
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            ব্যবহারকারীর ব্যক্তিগত তথ্যের গোপনীয়তা নীতিমালা
          </h1>
          <p className="text-xs text-slate-500">সর্বশেষ সংস্করণ: অক্টোবর ২০২৬ • চাকরি সেবা কমপ্লায়েন্স টিম</p>
        </div>

        <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            তথ্য সংগ্রহ ও ব্যবহার
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
            আমরা শুধুমাত্র সরকারি ও ব্যাংক চাকরির ফর্ম পূরণের প্রয়োজনীয় তথ্য (নাম, পিতা-মাতার নাম, শিক্ষাগত যোগ্যতা, এনআইডি ও ছবি) সংগ্রহ করি।
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 border-l-4 border-emerald-600 pl-3">
            তথ্য সুরক্ষা ও এনক্রিপশন
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed pl-4">
            ব্যবহারকারীর সকল মাস্টার ডকুমেন্ট আধুনিক SSL ও ডাটাবেজ এনক্রিপশনের মাধ্যমে সংরক্ষিত থাকে। কোনো অবস্থাতেই তৃতীয় কোনো পক্ষের কাছে প্রার্থীর তথ্য বিক্রি বা শেয়ার করা হয় না।
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
