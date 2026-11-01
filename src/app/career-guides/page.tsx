import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ক্যারিয়ার গাইড ও চাকরির প্রস্তুতি নির্দেশিকা | চাকরি সেবা',
  description: 'সিভি তৈরি, ভাইভা প্রস্তুতি, অনলাইন আবেদন নিয়মাবলী ও চাকরির প্রস্তুতিমূলক আর্টিকেল।',
};

const guideItems = [
  { slug: 'cv-writing', title: 'চাকরির জন্য পেশাদার সিভি (CV) তৈরির পূর্ণাঙ্গ গাইডলাইন', desc: 'একটি কার্যকর সিভি তৈরি করার নিয়ম, সেকশন ভিত্তিক গঠন ও ভুলত্রুটি এড়ানোর উপায়।' },
  { slug: 'online-job-application', title: 'টেলিটক ও অনলাইনে সরকারি চাকরির আবেদন করার সঠিক নিয়ম', desc: 'টেলিটক সাইবার ভুল এড়ানো, ছবি ও স্বাক্ষর রিসাইজ এবং এসএমএস ফি পেমেন্ট গাইড।' },
  { slug: 'interview-preparation', title: 'চাকরির ইন্টারভিউতে সফল হওয়ার সেরা প্রস্তুতি ও কৌশল', desc: 'কর্পোরেট ও প্রাইভেট ইন্টারভিউ বোর্ডে আত্মবিশ্বাস বজায় রাখার উপায় ও সাধারণ প্রশ্নাবলী।' },
  { slug: 'viva-preparation', title: 'বিসিএস ও সরকারি চাকরির ভাইভা প্রস্তুতি নির্দেশিকা', desc: 'মৌখিক পরীক্ষার বোর্ড ফেস করার নিয়ম, প্রয়োজনীয় কাগজপত্র ও কমন বিষয়ভিত্তিক প্রশ্ন।' },
  { slug: 'job-exam-preparation', title: 'চাকরির পরীক্ষার প্রস্তুতি: বাংলা, ইংরেজি, গণিত ও সাধারণ জ্ঞান', desc: 'প্রিলিমিনারি ও লিখিত পরীক্ষার বিষয়ভিত্তিক পড়ালেখার রুটিন ও সহায়ক বইয়ের তালিকা।' },
  { slug: 'job-search-tips', title: 'দ্রুত চাকরি পাওয়ার কার্যকরী ৫টি উপায় ও টিপস', desc: 'চাকরি খোঁজার স্মার্ট উপায়, নেটওয়ার্কিং এবং সঠিক সময়ে সঠিক সার্কুলারে আবেদনের কৌশল।' },
];

export default function CareerGuidesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">ক্যারিয়ার গাইড</span>
      </div>

      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40">
        <div className="max-w-3xl space-y-3">
          <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            ক্যারিয়ার সহায়িকা
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            চাকরির প্রস্তুতি ও সফল ক্যারিয়ার গাইডলাইন
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            সিভি তৈরি থেকে শুরু করে সরকারি চাকরির চূড়ান্ত ভাইভা পর্যন্ত প্রতিটি ধাপের নির্ভরযোগ্য পরামর্শ ও তথ্য।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guideItems.map((g) => (
          <Link
            key={g.slug}
            href={`/career-guides/${g.slug}`}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                {g.title}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {g.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-emerald-700">
              <span>সম্পূর্ণ গাইড পড়ুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
