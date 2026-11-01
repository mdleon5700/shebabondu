import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { BookOpen, ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'চাকরির জন্য পেশাদার সিভি (CV) তৈরির পূর্ণাঙ্গ গাইডলাইন | চাকরি সেবা',
  description: 'একটি কার্যকর সিভি তৈরি করার নিয়ম, সেকশন ভিত্তিক গঠন ও ভুলত্রুটি এড়ানোর উপায়।',
};

export default function GuideDetailPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <Link href="/career-guides" className="hover:text-emerald-700 transition-colors">ক্যারিয়ার গাইড</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">চাকরির জন্য পেশাদার সিভি (CV) তৈরির পূর্ণাঙ্গ গাইডলাইন</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
          পেশাদার ক্যারিয়ার পরামর্শ
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
          চাকরির জন্য পেশাদার সিভি (CV) তৈরির পূর্ণাঙ্গ গাইডলাইন
        </h1>
        <p className="text-sm font-semibold text-slate-500 pb-4 border-b border-slate-100">
          একটি কার্যকর সিভি তৈরি করার নিয়ম, সেকশন ভিত্তিক গঠন ও ভুলত্রুটি এড়ানোর উপায়।
        </p>

        <div className="space-y-4 text-base text-slate-700 leading-relaxed">
          <p>একটি পেশাদার সিভি চাকরিপ্রার্থীর প্রথম পরিচয়পত্র। কোনো প্রতিষ্ঠানে আবেদনের পর নিয়োগকর্তা প্রথমে প্রার্থীর সিভির ওপর চোখ বুলিয়ে সিদ্ধান্ত নেন প্রার্থীকে ইন্টারভিউতে ডাকবেন কি না।</p>
          <p>সিভিতে প্রার্থীর যোগাযোগের তথ্য, সংক্ষিপ্ত ক্যারিয়ার উদ্দেশ্য (Career Objective), শিক্ষাগত যোগ্যতা (সর্বশেষ ডিগ্রি থেকে শুরু করে), টেকনিক্যাল ও সফট স্কিল এবং প্রফেশনাল রেফারেন্স সঠিকভাবে উপস্থাপন করা উচিত।</p>
          <p>অপ্রয়োজনীয় ব্যক্তিগত তথ্য বাদ দিয়ে সংক্ষেপে ১-২ পৃষ্ঠার মধ্যে স্পষ্ট ও পরিচ্ছন্ন ফন্টে সিভি সংরক্ষণ করা আন্তর্জাতিক স্ট্যান্ডার্ড।</p>
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
