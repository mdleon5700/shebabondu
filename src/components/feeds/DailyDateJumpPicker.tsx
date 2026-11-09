'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ArrowRight, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface QuickDate {
  date: string;
  label: string;
  count?: number;
}

interface DailyDateJumpPickerProps {
  todayIso: string;
  todayBn: string;
  quickDates?: QuickDate[];
}

export default function DailyDateJumpPicker({
  todayIso,
  todayBn,
  quickDates = []
}: DailyDateJumpPickerProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(todayIso);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    router.push(`/daily-jobs/${selectedDate}`);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="space-y-0.5">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-700" />
            <span>ক্যালেন্ডার থেকে নির্দিষ্ট তারিখ নির্বাচন করুন</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            অতীতের যে কোনো তারিখে প্রকাশিত গেজেট ও নিয়োগ বিজ্ঞপ্তি দেখতে তারিখ নির্বাচন করুন।
          </p>
        </div>
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full w-fit">
          আজ: {todayBn}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="date"
            value={selectedDate}
            max={todayIso}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all cursor-pointer"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>সার্কুলার দেখুন</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Access Chips */}
      {quickDates.length > 0 && (
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-500 block mb-2">
            জনপ্রিয় তারিখসমূহ:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {quickDates.map((item) => (
              <Link
                key={item.date}
                href={`/daily-jobs/${item.date}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/80 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-transparent text-xs font-medium text-slate-700 transition-all"
              >
                <span>{item.label}</span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {item.count}টি
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

