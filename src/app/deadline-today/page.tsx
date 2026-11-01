import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Clock, AlertTriangle, ArrowRight, Building2, Calendar, MapPin, Banknote } from 'lucide-react';
import { serverDB } from '@/lib/db';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';
import { BangladeshDateHelper } from '@/lib/feeds/timezone';
import DeadlineCountdown from '@/components/deadlines/DeadlineCountdown';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'আজ শেষ ডেডলাইন — আজকের মধ্যে আবেদনের শেষ সময় যেসব চাকরির | চাকরি সেবা',
  description: 'যেসব সরকারি ও ব্যাংক চাকরির আবেদনের শেষ তারিখ ও সময় আজ। শেষ মুহূর্তের সার্ভার জ্যাম বা পেমেন্ট জটিলতা এড়াতে দ্রুত ১-ক্লিকে আবেদন সম্পন্ন করুন।',
  alternates: {
    canonical: 'https://chakrisheba.com/deadline-today'
  },
  openGraph: {
    title: 'আজ শেষ ডেডলাইনের চাকরির সার্কুলার | চাকরি সেবা',
    description: 'আজকের মধ্যে অনলাইনে আবেদনের শেষ সময় যেসব নিয়োগ বিজ্ঞপ্তির।',
    url: 'https://chakrisheba.com/deadline-today',
    type: 'website'
  }
};

export default function DeadlineTodayPage() {
  const allJobs = serverDB.getPublicJobs();
  const todayJobs: any[] = [];

  for (const job of allJobs) {
    if (job.id.startsWith('draft-') || (job as any).publicationStatus === 'UNPUBLISHED') {
      continue;
    }
    const evalResult = CentralDeadlineEngine.evaluateDeadline(job);
    if (evalResult.isClosingToday && !evalResult.isClosed) {
      todayJobs.push({
        ...job,
        evaluation: evalResult
      });
    }
  }

  const todayInfo = BangladeshDateHelper.getBangladeshTodayDate();

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-800/40 relative overflow-hidden">
          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-bold animate-pulse">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>আজকের জরুরি ডেডলাইন — {todayInfo.dateBn} ({todayInfo.dayBn})</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              আজকেই আবেদনের শেষ সময় ({CentralDeadlineEngine.toBn(todayJobs.length)}টি সার্কুলার)
            </h1>
            <p className="text-sm sm:text-base text-rose-100/90 leading-relaxed">
              উক্ত সার্কুলারসমূহের অনলাইনে ফরম পূরণ ও এসএমএস ফি প্রদানের সময় আজ শেষ হবে। শেষ মুহূর্তের সার্ভার ট্রাফিক জ্যাম এড়াতে দ্রুত আবেদন সম্পন্ন করুন।
            </p>
          </div>
        </div>

        {/* Jobs Grid */}
        {todayJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayJobs.map(job => (
              <div 
                key={job.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-rose-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                      {job.categoryLabel}
                    </span>
                    <DeadlineCountdown
                      jobId={job.id}
                      deadlineText={job.deadline}
                      initialDaysRemaining={0}
                      compact={true}
                    />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 hover:text-rose-700 transition-colors">
                    <Link href={`/jobs/${job.slug || job.id}`}>{job.title}</Link>
                  </h3>

                  <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{job.organization}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400">পদসংখ্যা: </span>
                      <strong className="text-slate-800 font-bold">{CentralDeadlineEngine.toBn(job.totalPosts)}টি</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">সরকারি ফি: </span>
                      <strong className="text-slate-800 font-bold">৳{job.govtFee}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    href={`/jobs/${job.slug || job.id}`}
                    className="text-xs font-bold text-slate-700 hover:text-rose-600 transition-colors"
                  >
                    বিস্তারিত সার্কুলার
                  </Link>

                  <Link
                    href={`/apply/${job.id}`}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                  >
                    <span>১-ক্লিকে আজই আবেদন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Clock className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">আজ কোনো সার্কুলারের ডেডলাইন নেই</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              আজকের দিনে কোনো চাকরির আবেদনের সময় শেষ হচ্ছে না। চলমান অন্যান্য চাকরির সার্কুলার দেখতে নিচে ক্লিক করুন।
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href="/closing-soon"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
              >
                জরুরি ডেডলাইন (৩ দিন বাকি)
              </Link>
              <Link
                href="/latest-jobs"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
              >
                নতুন প্রকাশিত চাকরি
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
