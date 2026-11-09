'use client';

import React from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Award, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Target, 
  Sparkles, 
  ArrowRight, 
  BrainCircuit, 
  HelpCircle,
  Lightbulb,
  FileCheck,
  XCircle
} from 'lucide-react';

export default function PerformanceAnalyticsPage() {
  const recentTests = [
    {
      id: 'test-1',
      title: '৪৭তম বিসিএস প্রিলিমিনারি স্পেশাল মডেল টেস্ট - ০৩',
      date: '০৮ নভেম্বর ২০২৬',
      score: 78.5,
      totalMarks: 100,
      accuracy: '৮৬%',
      status: 'পাস (উত্তীর্ণ)',
      isPassed: true
    },
    {
      id: 'test-2',
      title: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক (AD) মডেল টেস্ট - ০২',
      date: '০৪ নভেম্বর ২০২৬',
      score: 72.0,
      totalMarks: 100,
      accuracy: '৮১%',
      status: 'পাস (উত্তীর্ণ)',
      isPassed: true
    },
    {
      id: 'test-3',
      title: 'সরকারি সমন্বিত ১০ ব্যাংক অফিসার (ক্যাশ) টেস্ট - ০১',
      date: '০১ নভেম্বর ২০২৬',
      score: 68.5,
      totalMarks: 100,
      accuracy: '৭৬%',
      status: 'উত্তীর্ণ (কাট-অফ ৬০)',
      isPassed: true
    },
    {
      id: 'test-4',
      title: 'প্রাথমিক সহকারী শিক্ষক নিয়োগ মডেল টেস্ট - ০৪',
      date: '২৮ অক্টোবর ২০২৬',
      score: 84.0,
      totalMarks: 100,
      accuracy: '৯০%',
      status: 'চমৎকার উত্তীর্ণ',
      isPassed: true
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16" data-testid="performance-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>স্টেপ ১৩ — পারফরম্যান্স অ্যানালিটিক্স ও প্রগ্রেস রিপোর্ট</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>পারফরম্যান্স অ্যানালিটিক্স ও দুর্বলতা ট্র্যাকার</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার প্রদত্ত মডেল টেস্টের স্কোর ট্রেন্ড, নির্ভুলতার হার এবং বিষয়ভিত্তিক দুর্বলতা বিশ্লেষণ।
          </p>
        </div>

        <Link
          href="/model-tests"
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start shadow-sm"
        >
          <Target className="w-4 h-4" />
          <span>নতুন মডেল টেস্ট দিন</span>
        </Link>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div data-testid="kpi-total-tests" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">মোট মডেল টেস্ট সম্পন্ন</span>
          <div className="text-2xl font-black text-slate-900">১২ টি</div>
          <p className="text-[11px] text-emerald-700 font-bold mt-1">বিগত ৩০ দিনে</p>
        </div>

        <div data-testid="kpi-avg-score" className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-xs font-semibold text-emerald-800 block mb-1">গড় স্কোর (Average Score)</span>
          <div className="text-2xl font-black text-emerald-800">৭৫.৮%</div>
          <p className="text-[11px] text-slate-500 mt-1">কাট-অফের চেয়ে ১৫% এগিয়ে</p>
        </div>

        <div data-testid="kpi-accuracy" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">নির্ভুল উত্তরের হার (Accuracy)</span>
          <div className="text-2xl font-black text-slate-900">৮৩.৪%</div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">ধারাবাহিক উন্নতি হচ্ছে</p>
        </div>

        <div data-testid="kpi-negative-marks" className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <span className="text-xs font-semibold text-rose-800 block mb-1">গড় নেগেটিভ মার্কিং</span>
          <div className="text-2xl font-black text-rose-600">-২.২৫</div>
          <p className="text-[11px] text-rose-700 mt-1">অনুমাননির্ভর উত্তর পরিহার করুন</p>
        </div>
      </div>

      {/* Strengths & Weaknesses 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identified Weak Areas */}
        <div data-testid="weak-areas-card" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>শনাক্তকৃত দুর্বল টপিকসমূহ (Weak Areas)</span>
            </h3>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              জরুরি ফোকাস
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-rose-950">
                <span>ইংরেজি: Preposition ও Idioms & Phrases</span>
                <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">ভুল হার: ৪২%</span>
              </div>
              <p className="text-[11px] text-slate-600">বিসিএস ও ব্যাংক প্রিলিমিনারিতে প্রায় প্রতি বছর ৩-৫টি প্রশ্ন আসে।</p>
            </div>

            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-950">
                <span>গণিত: শতকরা ও লাভ-ক্ষতির জটিল সূত্র</span>
                <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">ভুল হার: ৩৫%</span>
              </div>
              <p className="text-[11px] text-slate-600">শর্টকাট ট্রিকস ও প্র্যাকটিসে এই ভুল শূন্যে নামিয়ে আনা সম্ভব।</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>আইসিটি: নেটওয়ার্কিং প্রোটোকল ও ওএসআই মডেল</span>
                <span className="text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">ভুল হার: ৩৩%</span>
              </div>
              <p className="text-[11px] text-slate-600">৭টি লেয়ারের কার্যাবলী সম্পর্কে স্পষ্ট ধারণা প্রয়োজন।</p>
            </div>
          </div>
        </div>

        {/* Strong Areas & Positive Momentum */}
        <div data-testid="strong-areas-card" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>আপনার শক্তিমত্তা ও সবল ক্ষেত্রসমূহ (Strengths)</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              উচ্চ নির্ভরযোগ্যতা
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-emerald-950">
                <span>বাংলা: চর্যাপদ, মধ্যযুগ ও মুক্তিযুদ্ধ সাহিত্য</span>
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">সঠিকতা: ৯১%</span>
              </div>
              <p className="text-[11px] text-slate-600">এই সেকশনে আপনার প্রস্তুতি অত্যন্ত মজবুত ও আত্মবিশ্বাসী।</p>
            </div>

            <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-emerald-950">
                <span>সাধারণ জ্ঞান: বাংলাদেশের সংবিধান ও জাতীয় বিষয়াবলী</span>
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">সঠিকতা: ৮৮%</span>
              </div>
              <p className="text-[11px] text-slate-600">মৌলিক অধিকার ও সংশোধনীর প্রশ্নে নির্ভুল উত্তর দিচ্ছেন।</p>
            </div>

            <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-emerald-950">
                <span>মানসিক দক্ষতা: সম্পর্ক নির্ণয় ও সাদৃশ্য বিশ্লেষণ</span>
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">সঠিকতা: ৮৫%</span>
              </div>
              <p className="text-[11px] text-slate-600">খুব কম সময়ে সঠিক লজিক্যাল সিদ্ধান্ত নিচ্ছেন।</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personalized AI Study Advice */}
      <div className="p-6 bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl space-y-3 shadow-md">
        <div className="flex items-center gap-2 text-emerald-300">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h3 className="font-black text-sm">এআই কাস্টমাইজড প্রস্তুতি পরামর্শ (Personalized Study Advice):</h3>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          আপনার বিগত ৪টি মডেল টেস্ট বিশ্লেষণে দেখা গেছে যে ইংরেজি গ্রামার ও পাটিগণিতের ভুলে আপনার প্রতি টেস্টে গড়ে প্রায় ২.২৫ নম্বর নেগেটিভ মার্কিং হচ্ছে। পরামর্শ: প্রতিদিন সকালের শুরুতে <strong>Preposition</strong> ও <strong>শতকরা</strong>-র ২০টি করে প্রশ্ন সময় ধরে সমাধান করুন এবং নিশ্চিত না হয়ে কোনো প্রশ্নের উত্তর নির্বাচন করা থেকে বিরত থাকুন।
        </p>
      </div>

      {/* Recent Model Tests History Table */}
      <div data-testid="test-history-table" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-700" />
            <span>সাম্প্রতিক মডেল টেস্টসমূহের ফলাফল ও মূল্যায়ন হিস্টোরি</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">৪টি টেস্ট প্রদর্শিত</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3">মডেল টেস্টের বিবরণ</th>
                <th className="p-3">তারিখ</th>
                <th className="p-3 text-center">প্রাপ্ত নম্বর</th>
                <th className="p-3 text-center">সঠিকতা</th>
                <th className="p-3 text-center">ফলাফল</th>
                <th className="p-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{t.title}</td>
                  <td className="p-3 text-slate-500">{t.date}</td>
                  <td className="p-3 text-center font-mono font-black text-emerald-800">{t.score} / {t.totalMarks}</td>
                  <td className="p-3 text-center font-bold text-slate-700">{t.accuracy}</td>
                  <td className="p-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link href="/model-tests" className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1">
                      <span>রিভিউ</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}