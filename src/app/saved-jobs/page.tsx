'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  Clock,
  Building2,
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle2,
  Bell,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { storage } from '@/lib/store';
import { fetchPublicJobs } from '@/lib/public-jobs-client';
import { JobCircular } from '@/lib/types';
import DeadlineCountdown from '@/components/deadlines/DeadlineCountdown';

export default function PublicSavedJobsPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [jobs, setJobs] = useState<JobCircular[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = storage.getAuth();
    if (auth.isLoggedIn && auth.role === 'candidate') {
      setIsLoggedIn(true);
      router.replace('/dashboard/saved-jobs');
      return;
    }

    const localSaved = storage.getSavedJobIds();
    setSavedIds(localSaved);

    fetchPublicJobs()
      .then(allJobs => {
        setJobs(allJobs.filter(j => localSaved.includes(j.id)));
      })
      .catch(() => {
        setJobs(storage.getJobs().filter(j => localSaved.includes(j.id)));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  const handleRemoveLocal = (id: string) => {
    storage.toggleSaveJob(id);
    const updated = storage.getSavedJobIds();
    setSavedIds(updated);
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  return (
    <div data-testid="public-saved-jobs-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">সংরক্ষিত সার্কুলার ও ওয়াচলিস্ট</span>
      </div>

      {/* Hero Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold">
            <Bookmark className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>স্মার্ট ওয়াচলিস্ট ও ডেডলাইন ট্র্যাকার</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            সংরক্ষিত সার্কুলার ও ওয়াচলিস্ট
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            পছন্দের সরকারি, ব্যাংক ও অন্যান্য নিয়োগ বিজ্ঞপ্তি সংরক্ষণ করুন। ডেডলাইন মিস হওয়ার ঝুঁকি ছাড়াই সময়মতো আবেদন নিশ্চিত করুন।
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <Link
            data-testid="login-to-sync-btn"
            href="/login?redirect=/dashboard/saved-jobs"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>লগইন করে সিঙ্ক করুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 4 Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'স্মার্ট ডেডলাইন ট্র্যাকিং', desc: 'আবেদনের সময় শেষ হওয়ার পূর্বেই লাইভ কাউন্টডাউন ও লাল অ্যালার্ট', icon: Clock },
          { title: '১-ক্লিকে দ্রুত আবেদন', desc: 'সংরক্ষিত তালিকা থেকেই সরাসরি ১-ক্লিক আবেদন ফরম ওপেন', icon: Sparkles },
          { title: 'মাল্টি-ডিভাইস সিঙ্ক', desc: 'মোবাইল বা পিসি—যেকোনো ডিভাইসে সংরক্ষিত সার্কুলার একই থাকবে', icon: ShieldCheck },
          { title: 'নোটিফিকেশন অ্যালার্ট', desc: 'শেষ ৩ দিন ও শেষ দিনে এসএমএস বা পুশ নোটিফিকেশন রিমাইন্ডার', icon: Bell }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Saved Jobs List in Guest Browser or Empty State */}
      {jobs.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">
              আপনার ব্রাউজারে সংরক্ষিত চাকরি ({jobs.length} টি)
            </h2>
            <span className="text-xs text-slate-500">স্থায়ীভাবে সংরক্ষণ করতে লগইন করুন</span>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                data-testid="public-saved-card"
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {job.categoryLabel}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{job.grade}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 hover:text-emerald-700 transition-colors">
                    <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                  </h3>
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span>{job.organization}</span>
                    <span>•</span>
                    <span>পদসংখ্যা: {job.totalPosts} টি</span>
                    <span>•</span>
                    <DeadlineCountdown jobId={job.id} deadlineText={job.deadline} initialDaysRemaining={job.daysRemaining} compact={true} />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleRemoveLocal(job.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                    title="তালিকা থেকে সরান"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    বিস্তারিত ও আবেদন
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800">কোনো চাকরি সংরক্ষিত নেই</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            চলমান সরকারি ও বেসরকারি নিয়োগ বিজ্ঞপ্তি থেকে আপনার পছন্দের সার্কুলারগুলো বুকমার্ক করে রাখুন।
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/jobs"
              className="inline-block px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 cursor-pointer"
            >
              চলমান চাকরি ব্রাউজ করুন
            </Link>
            <Link
              href="/job-alerts"
              className="inline-block px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              ফ্রি জব অ্যালার্ট চালু করুন
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
