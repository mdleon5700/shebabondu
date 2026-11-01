import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { BookOpen, ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'চাকরির ইন্টারভিউতে সফল হওয়ার সেরা প্রস্তুতি ও কৌশল | চাকরি সেবা',
  description: 'কর্পোরেট ও প্রাইভেট ইন্টারভিউ বোর্ডে আত্মবিশ্বাস বজায় রাখার উপায় ও সাধারণ প্রশ্নাবলী।',
};

export default function GuideDetailPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <Link href="/career-guides" className="hover:text-emerald-700 transition-colors">ক্যারিয়ার গাইড</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">চাকরির ইন্টারভিউতে সফল হওয়ার সেরা প্রস্তুতি ও কৌশল</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
          পেশাদার ক্যারিয়ার পরামর্শ
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
          চাকরির ইন্টারভিউতে সফল হওয়ার সেরা প্রস্তুতি ও কৌশল
        </h1>
        <p className="text-sm font-semibold text-slate-500 pb-4 border-b border-slate-100">
          কর্পোরেট ও প্রাইভেট ইন্টারভিউ বোর্ডে আত্মবিশ্বাস বজায় রাখার উপায় ও সাধারণ প্রশ্নাবলী।
        </p>

        <div className="space-y-4 text-base text-slate-700 leading-relaxed">
          <p>ইন্টারভিউ বোর্ডে পোশাক-পরিচ্ছদ, শারীরিক ভাষা (Body Language) এবং চোখের যোগাযোগ (Eye Contact) অত্যন্ত গুরুত্বপূর্ণ ভূমিকা পালন করে।</p>
          <p>যে প্রতিষ্ঠানে ইন্টারভিউ দিচ্ছেন, তাদের কার্যক্রম, ভিশন ও সংশ্লিষ্ট পদের দায়িত্ব সম্পর্কে আগেই পর্যাপ্ত ধারণা নিয়ে যাওয়া আবশ্যক।</p>
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
