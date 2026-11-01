import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, ChevronRight, Sparkles, Clock, ArrowRight, Layers } from 'lucide-react';
import { serverDB } from '@/lib/db';
import { JobFeedEngine } from '@/lib/feeds/engine';
import { BangladeshDateHelper } from '@/lib/feeds/timezone';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'দৈনিক চাকরির আর্কাইভ ক্যালেন্ডার — Daily Job Archives | চাকরি সেবা',
  description: 'তারিখভিত্তিক সকল সরকারি, ব্যাংক ও বেসরকারি চাকরির অতীত ও বর্তমান সার্কুলার আর্কাইভ। যে কোনো দিনের প্রকাশিত সার্কুলার এক নজরে দেখুন।',
  alternates: {
    canonical: 'https://chakrisheba.com/daily-jobs'
  }
};

const toBn = (n: number | string) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);

export default function DailyJobsDirectoryPage() {
  const jobs = serverDB.getPublicJobs();
  const archives = JobFeedEngine.getDailyArchiveDates(jobs, 30);
  const todayInfo = BangladeshDateHelper.getBangladeshTodayDate();

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[13px] font-bold px-3 py-1 rounded-full shadow-xs mb-3">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>তারিখভিত্তিক জব আর্কাইভ</span>
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              দৈনিক চাকরির আর্কাইভ ক্যালেন্ডার
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2.5 leading-relaxed">
              নির্দিষ্ট ক্যালেন্ডার তারিখ অনুযায়ী প্রকাশিত সকল সরকারি গেজেট ও বেসরকারি চাকরির সার্কুলার ব্রাউজ করুন। গত ৩০ দিনের সম্পূর্ণ আর্কাইভ এখানে সংরক্ষিত রয়েছে।
            </p>
            <div className="mt-5">
              <Link
                href="/todays-jobs"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>আজকের চাকরির খবর ({todayInfo.dateBn})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Date Tiles Grid */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-700" />
              <span>সাম্প্রতিক প্রকাশিত তারিখসমূহ</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              মোট {toBn(archives.length)}টি তারিখ তালিকাভুক্ত
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {archives.map((item) => {
              const isToday = item.date === todayInfo.isoDate;
              return (
                <Link
                  key={item.date}
                  href={`/daily-jobs/${item.date}`}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between group ${
                    isToday
                      ? 'bg-emerald-50/70 border-emerald-300/80 hover:bg-emerald-100/60 shadow-xs'
                      : item.hasJobs
                      ? 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-emerald-500/50 hover:shadow-sm'
                      : 'bg-slate-50/30 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {item.date_bn}
                      </span>
                      {isToday && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          আজ
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.date}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      item.jobCount > 0 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {toBn(item.jobCount)}টি
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
