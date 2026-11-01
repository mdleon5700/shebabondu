import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { BookOpen, ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'টেলিটক ও অনলাইনে সরকারি চাকরির আবেদন করার সঠিক নিয়ম | চাকরি সেবা',
  description: 'টেলিটক সাইবার ভুল এড়ানো, ছবি ও স্বাক্ষর রিসাইজ এবং এসএমএস ফি পেমেন্ট গাইড।',
};

export default function GuideDetailPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <Link href="/career-guides" className="hover:text-emerald-700 transition-colors">ক্যারিয়ার গাইড</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">টেলিটক ও অনলাইনে সরকারি চাকরির আবেদন করার সঠিক নিয়ম</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6 shadow-sm">
        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
          পেশাদার ক্যারিয়ার পরামর্শ
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
          টেলিটক ও অনলাইনে সরকারি চাকরির আবেদন করার সঠিক নিয়ম
        </h1>
        <p className="text-sm font-semibold text-slate-500 pb-4 border-b border-slate-100">
          টেলিটক সাইবার ভুল এড়ানো, ছবি ও স্বাক্ষর রিসাইজ এবং এসএমএস ফি পেমেন্ট গাইড।
        </p>

        <div className="space-y-4 text-base text-slate-700 leading-relaxed">
          <p>টেলিটক পোর্টালে (teletalk.com.bd) অনলাইনে আবেদন করার ক্ষেত্রে সবচেয়ে গুরুত্বপূর্ণ বিষয় হলো নাম ও পিতা-মাতার নাম এসএসসি সনদের হুবহু ক্যাপিটাল লেটারে লেখা।</p>
          <p>ছবি ৩০০×৩০০ পিক্সেল (১০০ KB) এবং স্বাক্ষর ৩০০×৮০ পিক্সেল (৬০ KB) না হলে সাবমিট হবে না। চাকরি সেবার অটো-রিসাইজার দিয়ে এ ঝামেলা সহজেই এড়ানো যায়।</p>
          <p>ফর্ম সাবমিটের পর প্রাপ্ত User ID দিয়ে ৭২ ঘণ্টার মধ্যে প্রিপেইড টেলিটক সিম থেকে ১৬২২২ নম্বরে ২টি এসএমএস পাঠিয়ে ফি প্রদান সম্পন্ন করতে হয়।</p>
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
