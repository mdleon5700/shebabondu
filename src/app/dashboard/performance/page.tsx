'use client';

import React from 'react';
import { TrendingUp, Award, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function PerformanceAnalyticsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-700" />
          <span>পারফরম্যান্স অ্যানালিটিক্স ও দুর্বলতা ট্র্যাকার</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          আপনার প্রদত্ত মডেল টেস্টের স্কোর, ভুল উত্তরের বিশ্লেষণ এবং বিষয়ভিত্তিক দুর্বল পয়েন্টসমূহ।
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 block mb-1">মোট টেস্ট সম্পন্ন</span>
          <div className="text-2xl font-black text-slate-900">১২ টি</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 block mb-1">গড় স্কোর (Average)</span>
          <div className="text-2xl font-black text-emerald-700">৭৪%</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 block mb-1">সঠিক উত্তর হার</span>
          <div className="text-2xl font-black text-slate-900">৮২%</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 block mb-1">নেগেটিভ মার্কিং গড়</span>
          <div className="text-2xl font-black text-rose-600">-২.৫</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>শনাক্তকৃত দুর্বল টপিকসমূহ (Weak Areas)</span>
        </h3>

        <div className="space-y-2.5 text-xs">
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between">
            <span className="font-semibold text-rose-900">ইংরেজি: Preposition ও Idioms & Phrases</span>
            <span className="text-rose-600 font-bold">ভুল হার: ৪২%</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
            <span className="font-semibold text-amber-900">গণিত: শতকরা ও লাভ-ক্ষতির জটিল সূত্র</span>
            <span className="text-amber-700 font-bold">ভুল হার: ৩৫%</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
            <span className="font-semibold text-emerald-900">বাংলা: চর্যাপদ ও আধুনিক যুগের সাহিত্যিক</span>
            <span className="text-emerald-700 font-bold">সঠিক হার: ৯১% (মজবুত)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
