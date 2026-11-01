import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { BookOpen, ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'দ্রুত চাকরি পাওয়ার কার্যকরী ৫টি উপায় ও টিপস | চাকরি সেবা',
  description: 'চাকরি খোঁজার স্মার্ট উপায়, নেটওয়ার্কিং এবং সঠিক সময়ে সঠিক সার্কুলারে আবেদনের কৌশল।',
};

export default function GuideDetailPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <Link href="/career-guides" className="hover:text-emerald-700 transition-colors">ক্যারিয়ার গাইড</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">দ্রুত চাকরি পাওয়ার কার্যকরী ৫টি উপায় ও টিপস</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
          পেশাদার ক্যারিয়ার পরামর্শ
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
          দ্রুত চাকরি পাওয়ার কার্যকরী ৫টি উপায় ও টিপস
        </h1>
        <p className="text-sm font-semibold text-slate-500 pb-4 border-b border-slate-100">
          চাকরি খোঁজার স্মার্ট উপায়, নেটওয়ার্কিং এবং সঠিক সময়ে সঠিক সার্কুলারে আবেদনের কৌশল।
        </p>

        <div className="space-y-4 text-base text-slate-700 leading-relaxed">
          <p>নিয়মিত সরকারি গেজেট ও বিশ্বস্ত পোর্টাল মনিটর করুন। চাকরি সেবায় নোটিফিকেশন অ্যালার্ট চালু রাখলে কোনো ডেডলাইন মিস হবে না।</p>
          <p>একই সাথে একাধিক সার্কুলারে ধারাবাহিকভাবে পরীক্ষা দিলে পরীক্ষার ভয় দূর হয় এবং দ্রুত চাকরি পাওয়ার সম্ভাবনা বৃদ্ধি পায়।</p>
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
