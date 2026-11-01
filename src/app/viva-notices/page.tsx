import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Users, Calendar, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'মৌখিক পরীক্ষার সময়সূচি ও নোটিশ ২০২৬ (Viva Notices) | চাকরি সেবা',
  description: 'বিসিএস ও ব্যাংক মৌখিক পরীক্ষা (ভাইভা) তারিখ, সময় ও আবশ্যকীয় সনদের তালিকা।',
};

export default function VivaNoticesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">মৌখিক পরীক্ষার নোটিশ</span>
      </div>

      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40">
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          মৌখিক পরীক্ষার সময়সূচি ও ভাইভা প্রস্তুতি
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2">
          ভাইভার জন্য নির্বাচিত প্রার্থীদের বোর্ড ভিত্তিক সময়সূচি ও দাখিলযোগ্য মূল কাগজপত্রের তালিকা।
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">ভাইভা বোর্ডে যেসব মূল সনদ সাথে নিতে হবে:</h2>
        <ul className="space-y-2.5 text-sm text-slate-700 list-disc list-inside">
          <li>অনলাইনে পূরণকৃত মূল আবেদনপত্রের প্রিন্ট কপি (Applicant Copy)।</li>
          <li>সকল শিক্ষাগত যোগ্যতার মূল সনদপত্র ও একাডেমিক মার্কশিট।</li>
          <li>নাগরিকত্ব সনদপত্র ও জাতীয় পরিচয়পত্রের মূল কপি।</li>
          <li>কোটা সুবিধার স্বপক্ষে উপযুক্ত কর্তৃপক্ষের মূল প্রত্যয়নপত্র।</li>
        </ul>
        <div className="pt-4 border-t border-slate-100">
          <Link href="/career-guides/viva-preparation" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 transition-colors">
            <span>ভাইভা প্রস্তুতি গাইড পড়ুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
