'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BrainCircuit, 
  BookOpen, 
  Clock, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  FileQuestion, 
  Target, 
  Flame, 
  GraduationCap, 
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function PreparationPage() {
  const subjects = [
    { 
      id: 'bangla', 
      title: 'বাংলা ভাষা ও সাহিত্য', 
      topics: 'প্রাচীন ও মধ্যযুগ, আধুনিক যুগ, বাংলা ব্যাকরণ ও প্রবাদ-প্রবচন',
      totalQuestions: 450, 
      completed: 320, 
      progress: 71,
      accentColor: 'emerald'
    },
    { 
      id: 'english', 
      title: 'ইংরেজি ভাষা ও ব্যাকরণ (English)', 
      topics: 'Grammar, Parts of Speech, Vocabulary, Idioms & English Literature',
      totalQuestions: 500, 
      completed: 280, 
      progress: 56,
      accentColor: 'blue'
    },
    { 
      id: 'math', 
      title: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা', 
      topics: 'পাটিগণিত, বীজগণিত, জ্যামিতি, চিত্র ও মানসিক সক্ষমতা',
      totalQuestions: 400, 
      completed: 310, 
      progress: 77,
      accentColor: 'teal'
    },
    { 
      id: 'gk', 
      title: 'সাধারণ জ্ঞান (বাংলাদেশ ও আন্তর্জাতিক)', 
      topics: 'ইতিহাস, মুক্তিযুদ্ধ, সংবিধান, আন্তর্জাতিক ভূগোল ও সাম্প্রতিক ঘটনা',
      totalQuestions: 600, 
      completed: 490, 
      progress: 81,
      accentColor: 'amber'
    },
    { 
      id: 'ict', 
      title: 'আইসিটি ও কম্পিউটার প্রযুক্তি', 
      topics: 'কম্পিউটার সংগঠন, হার্ডওয়্যার, সফটওয়্যার, নেটওয়ার্কিং ও সাইবার নিরাপত্তা',
      totalQuestions: 350, 
      completed: 240, 
      progress: 69,
      accentColor: 'indigo'
    }
  ];

  const totalQuestions = subjects.reduce((sum, s) => sum + s.totalQuestions, 0);
  const totalCompleted = subjects.reduce((sum, s) => sum + s.completed, 0);
  const overallPercentage = Math.round((totalCompleted / totalQuestions) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16" data-testid="preparation-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 mb-2">
            <BrainCircuit className="w-3.5 h-3.5 text-emerald-600" />
            <span>স্টেপ ১২ — বিসিএস ও সরকারি নিয়োগ প্রস্তুতি হাব</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>পরীক্ষার প্রস্তুতি কেন্দ্র (Exam Preparation)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            বিসিএস, সরকারি ব্যাংক ও মন্ত্রণালয় নিয়োগ পরীক্ষার বিষয়ভিত্তিক সিলেবাস, প্রশ্নব্যাংক ও প্রগ্রেস ট্র্যাকার।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            data-testid="btn-explore-questions"
            href="/previous-year-questions"
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>বিগত বছরের প্রশ্নব্যাংক</span>
          </Link>
          <Link
            data-testid="btn-start-model-test"
            href="/model-tests"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Target className="w-4 h-4" />
            <span>অনলাইন মডেল টেস্ট</span>
          </Link>
        </div>
      </div>

      {/* Overall Preparation Snapshot Banner */}
      <div 
        data-testid="overall-preparation-progress"
        className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-emerald-300 border border-white/20 inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              সামগ্রিক প্রিলিমিনারি প্রস্তুতি সূচক
            </span>
            <h2 className="text-xl sm:text-2xl font-black">
              আপনার সিলেবাস কভারেজ {overallPercentage}% সম্পন্ন হয়েছে
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              মোট {totalQuestions} টি গুরুত্বপূর্ণ প্রশ্নের মধ্যে {totalCompleted} টি অনুশীলন সম্পন্ন হয়েছে। গণিত ও ইংরেজিতে আরও কিছু অনুশীলনে আপনার স্কোর ৮০%+ নিশ্চিত হবে।
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 min-w-[260px]">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex flex-col items-center justify-center font-black shadow-md">
              <span className="text-2xl leading-none">{overallPercentage}%</span>
              <span className="text-[10px] uppercase font-bold text-emerald-100">প্রস্তুত</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>দৈনিক ধারাবাহিকতা: ৭ দিন</span>
              </div>
              <p className="text-slate-300">{totalCompleted} / {totalQuestions} প্রশ্ন সম্পন্ন</p>
              <Link href="/model-tests" className="text-emerald-300 font-bold hover:underline inline-flex items-center gap-1">
                <span>টেস্ট শুরু করুন</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Subject Preparation Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>বিষয়ভিত্তিক সিলেবাস ও প্রস্তুতি প্রগ্রেস</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">৫টি মূল বিষয়</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <div 
              key={s.id} 
              data-testid={`subject-card-${s.id}`}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-300 hover:shadow-xs transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-slate-900 leading-snug">{s.title}</h4>
                  <span className="text-xs font-black text-emerald-800 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 font-mono">
                    {s.progress}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {s.topics}
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                      style={{ width: `${s.progress}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>{s.completed} / {s.totalQuestions} প্রশ্ন সম্পন্ন</span>
                    <span className="font-bold text-slate-700">বাকি: {s.totalQuestions - s.completed} টি</span>
                  </div>
                </div>

                <Link 
                  href="/model-tests" 
                  className="w-full py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
                >
                  <span>অনুশীলন শুরু করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Test CTA Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-700" />
            <span>বিসিএস ও ব্যাংকের ১০০ নম্বরের লাইভ মডেল টেস্ট</span>
          </h3>
          <p className="text-xs text-slate-600">
            রিয়েল-টাইম টাইমার, নেগেটিভ মার্কিং (০.৫০) এবং বিস্তারিত সমাধানসহ প্রিলিমিনারি পরীক্ষা দিয়ে দুর্বলতা যাচাই করুন।
          </p>
        </div>
        <Link 
          href="/model-tests" 
          className="px-5 py-2.5 bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 text-center"
        >
          মডেল টেস্ট দিন →
        </Link>
      </div>
    </div>
  );
}