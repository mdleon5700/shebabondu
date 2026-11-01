'use client';

import React from 'react';
import Link from 'next/link';
import { BrainCircuit, BookOpen, Clock, Award, ArrowRight } from 'lucide-react';

export default function PreparationPage() {
  const subjects = [
    { title: 'বাংলা ভাষা ও সাহিত্য', totalQuestions: 450, completed: 320, progress: 71 },
    { title: 'ইংরেজি ভাষা ও ব্যাকরণ', totalQuestions: 500, completed: 280, progress: 56 },
    { title: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা', totalQuestions: 400, completed: 310, progress: 77 },
    { title: 'সাধারণ জ্ঞান (বাংলাদেশ ও আন্তর্জাতিক)', totalQuestions: 600, completed: 490, progress: 81 }
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-emerald-700" />
          <span>পরীক্ষার প্রস্তুতি কেন্দ্র</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          বিসিএস, ব্যাংক ও সরকারি নিয়োগ পরীক্ষার বিষয়ভিত্তিক সিলেবাস, প্রশ্নব্যাংক ও প্রস্তুতি ট্র্যাকার।
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {subjects.map((s, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">{s.title}</h3>
              <span className="text-xs font-bold text-emerald-700">{s.progress}%</span>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${s.progress}%` }} />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>{s.completed} / {s.totalQuestions} টি প্রশ্ন অনুশীলন সম্পন্ন</span>
              <Link href="/model-tests" className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                <span>অনুশীলন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-black text-base">অনলাইন ফুল মডেল টেস্ট শুরু করুন</h3>
          <p className="text-xs text-emerald-200">১০০ নম্বরের প্রিলিমিনারি পরীক্ষা দিয়ে নিজের প্রস্তুতি যাচাই করুন।</p>
        </div>
        <Link href="/model-tests" className="px-5 py-2.5 bg-white text-emerald-950 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors self-start sm:self-center">
          মডেল টেস্ট দিন
        </Link>
      </div>
    </div>
  );
}
