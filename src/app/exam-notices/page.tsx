import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Calendar, Building2, MapPin, Download, ExternalLink, ArrowRight, Clock, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'সকল চাকরির পরীক্ষার সময়সূচি ও নোটিশ ২০২৬ | চাকরি সেবা',
  description: 'বিসিএস, প্রাথমিক শিক্ষক, বাংলাদেশ ব্যাংক, এনটিআরসিএ ও সরকারি নিয়োগ পরীক্ষার সর্বশেষ সময়সূচি।',
};

const notices = [
  { id: 1, title: '৪৬তম বিসিএস লিখিত পরীক্ষার সংশোধিত সময়সূচি ও কেন্দ্র তালিকা', org: 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC)', date: '০৮ নভেম্বর ২০২৬', time: 'সকাল ১০:০০টা - দুপুর ০১:০০টা', type: 'লিখিত পরীক্ষা', badge: 'জরুরি' },
  { id: 2, title: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক (জেনারেল) প্রিলিমিনারি পরীক্ষার তারিখ ঘোষণা', org: 'বাংলাদেশ ব্যাংক', date: '১২ নভেম্বর ২০২৬', time: 'বিকাল ০৩:০০টা - ০৪:০০টা', type: 'MCQ পরীক্ষা', badge: 'নতুন' },
  { id: 3, title: 'সরকারি প্রাথমিক বিদ্যালয় সহকারী শিক্ষক নিয়োগ ৩য় ধাপের পরীক্ষা নোটিশ', org: 'প্রাথমিক শিক্ষা অধিদপ্তর (DPE)', date: '২০ নভেম্বর ২০২৬', time: 'সকাল ১০:০০টা - ১১:০০টা', type: 'লিখিত পরীক্ষা', badge: 'সক্রিয়' },
  { id: 4, title: 'সোনালী ব্যাংক পিএলসি সিনিয়র অফিসার পদের পরীক্ষার আসন বিন্যাস', org: 'ব্যাংকার্স সিলেকশন কমিটি (BSCS)', date: '২৫ নভেম্বর ২০২৬', time: 'সকাল ১০:০০টা - ১২:০০টা', type: 'MCQ ও লিখিত', badge: 'নতুন' },
  { id: 5, title: 'বাংলাদেশ রেলওয়ে সহকারী স্টেশন মাস্টার পদের লিখিত পরীক্ষার নোটিশ', org: 'বাংলাদেশ রেলওয়ে', date: '২৮ নভেম্বর ২০২৬', time: 'সকাল ১০:০০টা - ১১:৩০টা', type: 'লিখিত পরীক্ষা', badge: 'সক্রিয়' },
];

export default function ExamNoticesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">পরীক্ষার নোটিশ</span>
      </div>

      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40">
        <div className="max-w-2xl space-y-3">
          <span className="bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
            অফিশিয়াল রুটিন
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            সকল সরকারি ও ব্যাংক চাকরির পরীক্ষার সময়সূচি
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            বিজ্ঞপ্তি অনুযায়ী পরীক্ষার তারিখ, সময়, কেন্দ্র ও আসন বিন্যাস এক নজরে দেখুন ও ডাউনলোড করুন।
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {notices.map((n) => (
          <div key={n.id} className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-200">
                  {n.org}
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                  {n.type}
                </span>
                <span className="bg-rose-100 text-rose-800 text-xs font-black px-2 py-0.5 rounded-md">
                  {n.badge}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {n.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1 text-slate-700 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>তারিখ: {n.date}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>সময়: {n.time}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/admit-cards"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span>প্রবেশপত্র ডাউনলোড</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
