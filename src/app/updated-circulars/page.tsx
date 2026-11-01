import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Clock, ArrowRight, Building2, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { serverDB } from '@/lib/db';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';
import DeadlineCountdown from '@/components/deadlines/DeadlineCountdown';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'সংশোধিত ও সময় বর্ধিত চাকরির বিজ্ঞপ্তি | চাকরি সেবা',
  description: 'যেসব সরকারি ও ব্যাংক চাকরির আবেদনের সময় বৃদ্ধি বা সার্কুলার সংশোধন করা হয়েছে। অফিসিয়াল গেজেট ও বর্ধিত সময়সীমা দেখুন।',
  alternates: {
    canonical: 'https://chakrisheba.com/updated-circulars'
  },
  openGraph: {
    title: 'সময় বর্ধিত ও সংশোধিত সার্কুলার | চাকরি সেবা',
    description: 'আবেদনের সময় বাড়ানো হয়েছে যেসব সরকারি চাকরির।',
    url: 'https://chakrisheba.com/updated-circulars',
    type: 'website'
  }
};

export default function UpdatedCircularsPage() {
  const allJobs = serverDB.getPublicJobs();
  const updatedList: any[] = [];

  for (const job of allJobs) {
    if (job.id.startsWith('draft-') || (job as any).publicationStatus === 'UNPUBLISHED') {
      continue;
    }
    const revisions = serverDB.getDeadlineRevisions(job.id);
    const evalResult = CentralDeadlineEngine.evaluateDeadline(job);

    if (evalResult.status === 'EXTENDED' || revisions.length > 0 || (job.deadline && (job.deadline.includes('বৃদ্ধি') || job.deadline.includes('বর্ধিত')))) {
      updatedList.push({
        ...job,
        evaluation: evalResult,
        revisions,
        revisionCount: revisions.length
      });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-800/40 relative overflow-hidden">
          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>সময় বৃদ্ধি ও সংশোধিত নোটিশ হাব</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              আবেদনের সময় বাড়ানো হয়েছে ({CentralDeadlineEngine.toBn(updatedList.length)}টি সার্কুলার)
            </h1>
            <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed">
              সংশ্লিষ্ট প্রতিষ্ঠান কর্তৃক যেসকল নিয়োগ বিজ্ঞপ্তির আবেদনের সময়সীমা বর্ধিত বা শর্তাবলী সংশোধন করা হয়েছে।
            </p>
          </div>
        </div>

        {/* Jobs Grid */}
        {updatedList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {updatedList.map(job => (
              <div 
                key={job.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                      সময় বর্ধিত
                    </span>
                    <DeadlineCountdown
                      jobId={job.id}
                      deadlineText={job.deadline}
                      initialDaysRemaining={job.daysRemaining}
                      compact={true}
                    />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 hover:text-purple-700 transition-colors">
                    <Link href={`/jobs/${job.slug || job.id}`}>{job.title}</Link>
                  </h3>

                  <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{job.organization}</span>
                  </div>

                  {job.revisions && job.revisions.length > 0 && (
                    <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>সংশোধিত ডেডলাইন: {job.revisions[0].newDeadline}</span>
                      </div>
                      <div className="text-[11px] text-purple-700">
                        পূর্ববর্তী ডেডলাইন: {job.revisions[0].previousDeadline}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    href={`/jobs/${job.slug || job.id}`}
                    className="text-xs font-bold text-slate-700 hover:text-purple-600 transition-colors"
                  >
                    বিস্তারিত সার্কুলার
                  </Link>

                  <Link
                    href={`/apply/${job.id}`}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                  >
                    <span>১-ক্লিক আবেদন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">কোনো সার্কুলারের সময় বর্ধিত হয়নি</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              সম্প্রতি কোনো বিজ্ঞপ্তির ডেডলাইন বৃদ্ধি করা হয়নি। নিয়মিত সকল চাকরির বিজ্ঞপ্তি দেখতে নিচে ক্লিক করুন।
            </p>
            <Link
              href="/jobs"
              className="inline-block px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold"
            >
              সকল চাকরি ব্রাউজ করুন
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
