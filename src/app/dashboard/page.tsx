'use client';
import { fetchPublicJobs } from '@/lib/public-jobs-client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Bookmark, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Upload, 
  UserCheck, 
  Award, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Briefcase
} from 'lucide-react';
import { storage } from '@/lib/store';
import { CandidateProfile, JobCircular, ApplicationRequest, NotificationItem, CandidateDocument } from '@/lib/types';
import { emptyCandidateProfile as mockUserProfile } from '@/lib/candidate-defaults';

export default function DashboardOverview() {
  const [profile, setProfile] = useState<CandidateProfile>(mockUserProfile);
  const [jobs, setJobs] = useState<JobCircular[]>([]);
  const [applications, setApplications] = useState<ApplicationRequest[]>([]);
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);
  const [completion, setCompletion] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  const [urgentIndex, setUrgentIndex] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    const u = storage.getUser();
    const initialDocs = storage.getDocuments();
    setProfile(u);
    setDocuments(initialDocs);
    setCompletion(storage.calculateProfileCompletion(u, initialDocs));
    fetchPublicJobs().then(setJobs).catch(() => {});
    setApplications(storage.getApplications());
    setSavedIds(storage.getSavedJobIds());
    setNotifications(storage.getNotifications());

    // Live Step 09 Recommendations Sync
    setIsLoadingRecs(true);
    fetch("/api/user/recommendations?minScore=50&limit=5")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.bestMatches) {
          setRecommendations(data.data.bestMatches);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingRecs(false));

    // Live Server Sync for Applications
    fetch("/api/applications")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.applications && Array.isArray(data.applications)) {
          setApplications(data.applications);
        }
      })
      .catch(() => {});

    // Live Server Sync for profile
    fetch('/api/profile')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.profile) {
          setProfile(data.profile);
          setCompletion(storage.calculateProfileCompletion(data.profile, documents));
          storage.updateUser(data.profile);
        }
      })
      .catch(() => {});

    // Live Server Sync for documents (Vault)
    fetch('/api/documents')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.documents && Array.isArray(data.documents)) {
          setDocuments(data.documents);
          storage.replaceDocuments(data.documents);
          setCompletion(storage.calculateProfileCompletion(profile, data.documents));
        }
      })
      .catch(() => {});

    // Live Server Sync for notifications
    fetch('/api/candidate/notifications')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.notifications && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {});

    // Live Server Sync for saved jobs
    fetch('/api/candidate/saved-jobs')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.savedJobs && Array.isArray(data.savedJobs)) {
          setSavedIds(data.savedJobs);
        }
      })
      .catch(() => {});
  }, []);

  // Compute eligible jobs
  const eligibleJobs = useMemo(() => {
    return jobs.filter(j => storage.checkEligibility(profile, j).status === 'eligible');
  }, [jobs, profile]);

  const savedJobs = useMemo(() => {
    return jobs.filter(j => savedIds.includes(j.id));
  }, [jobs, savedIds]);

  // Active Applications (processing, submitted, pending_payment)
  const activeApplications = useMemo(() => {
    return applications.filter(a => a.status === 'processing' || a.status === 'submitted' || a.status === 'pending_payment');
  }, [applications]);

  // Completed / admit-ready applications
  const completedApplications = useMemo(() => {
    return applications.filter(a => a.status === 'completed' || a.status === 'admit_issued' || a.status === 'fee_paid');
  }, [applications]);

  // Dynamically compute upcoming exams from candidate applications & notices
  const upcomingExams = useMemo(() => {
    const banglaMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    
    return applications
      .filter(app => app.status === 'completed' || app.status === 'admit_issued' || app.status === 'submitted')
      .map((app, idx) => {
        const baseDate = new Date(app.submittedAt || app.date || Date.now());
        const examDate = new Date(baseDate.getTime() + (21 + (idx % 7)) * 24 * 60 * 60 * 1000);
        return {
          id: app.id,
          jobTitle: app.jobTitle,
          organization: app.organization || app.jobTitle.split(' ')[0] || 'নিয়োগকারী কর্তৃপক্ষ',
          examDateStr: `${examDate.getDate()} ${banglaMonths[examDate.getMonth()]}`,
          dateObj: examDate
        };
      })
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [applications]);

  // Urgent Deadlines: Circulars ending in 1 to 5 days
  const urgentDeadlines = useMemo(() => {
    return jobs.filter(j => j.daysRemaining !== undefined && j.daysRemaining <= 5 && j.daysRemaining >= 0);
  }, [jobs]);

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* 1. Hero Welcome Card with Profile Completion */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>স্মার্ট ক্যান্ডিডেট স্পেস</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>১০০% ফ্রি প্ল্যাটফর্ম</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" suppressHydrationWarning>
              {isMounted ? `স্বাগতম, ${profile.nameBn || profile.name}!` : 'স্বাগতম!'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              আপনার যোগ্যতা ও বয়স অনুযায়ী আজকের সিস্টেমে <strong className="text-emerald-300 font-bold">{eligibleJobs.length} টি সম্ভাব্য যোগ্য চাকরি</strong> রয়েছে। যেকোনো চাকরিতে ১-ক্লিকে নির্ভুল আবেদন করুন।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 min-w-[220px] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>প্রোফাইল সম্পূর্ণতা</span>
              <span className="text-emerald-400 font-bold">{completion}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <Link 
              href="/dashboard/profile"
              className="text-[11px] text-emerald-300 hover:text-white flex items-center justify-between pt-1 font-semibold group"
            >
              <span>প্রোফাইল আপডেট করুন</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Snapshot Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Eligible Jobs */}
        <Link 
          href="/dashboard/recommended-jobs"
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">যোগ্য চাকরি</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{eligibleJobs.length} টি</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {eligibleJobs.length > 0 ? 'বয়স ও ডিগ্রির সাথে শতভাগ মিল' : 'প্রোফাইল আপডেট করে যোগ্যতা দেখুন'}
          </div>
        </Link>

        {/* Metric 2: Saved Jobs */}
        <Link 
          href="/dashboard/saved-jobs"
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">সংরক্ষিত সার্কুলার</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{savedJobs.length} টি</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {savedJobs.length > 0 ? 'পরে আবেদনের জন্য সেভড' : 'পছন্দের বিজ্ঞপ্তি সংরক্ষণ করুন'}
          </div>
        </Link>

        {/* Metric 3: Active Applications */}
        <Link 
          href="/dashboard/applications"
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">চলমান আবেদন</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{activeApplications.length} টি</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1 truncate">
            {completedApplications.length > 0
              ? `${completedApplications.length}টি সম্পন্ন, ${activeApplications.length}টি চলমান`
              : activeApplications.length > 0
              ? `${activeApplications.length}টি আবেদনের ট্র্যাকিং সক্রিয়`
              : 'কোনো চলমান আবেদন নেই'}
          </div>
        </Link>

        {/* Metric 4: Upcoming Exams */}
        <Link 
          href="/dashboard/exam-calendar"
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">আসন্ন পরীক্ষা</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{upcomingExams.length} টি</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1 truncate">
            {upcomingExams.length > 0
              ? `${upcomingExams[0].examDateStr} ${upcomingExams[0].organization}`
              : 'কোনো আসন্ন পরীক্ষা নেই'}
          </div>
        </Link>
      </div>

      {/* 3. Quick Action Bar */}
      <div className="bg-emerald-900/5 border border-emerald-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>প্রয়োজনীয় অ্যাকশন:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/vault"
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>ছবি/স্বাক্ষর রিসাইজ</span>
          </Link>
          <Link
            href="/dashboard/application-check"
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>আবেদন ভুল শনাক্তকরণ</span>
          </Link>
          <Link
            href="/dashboard/cv-builder"
            className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>স্মার্ট সিভি জেনারেট</span>
          </Link>
          <Link
            href="/dashboard/admit-cards"
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Award className="w-3.5 h-3.5" />
            <span>অ্যাডমিট কার্ড ট্র্যাকার</span>
          </Link>
        </div>
      </div>

      {/* 4. Two Column Layout: Recommended Jobs & Urgent Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Top Eligible Jobs (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>আপনার জন্য সাজেস্টেড যোগ্য চাকরি</span>
            </h2>
            <Link href="/dashboard/recommended-jobs" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <span>সব দেখুন ({eligibleJobs.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.slice(0, 3).map((rec: any) => {
                const job = rec.job;
                const match = rec.match;
                const score = match?.overallScore || 85;
                const badgeColor = score >= 90 
                  ? 'bg-emerald-500 text-white' 
                  : score >= 75 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-amber-500 text-white';

                return (
                  <div 
                    key={job.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs ${badgeColor}`}>
                          {score}% স্মার্ট ম্যাচ
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {job.categoryLabel || job.category}
                        </span>
                        {job.grade && (
                          <span className="text-xs text-slate-500 font-semibold">{job.grade}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 hover:text-emerald-700 transition-colors">
                        <Link href={`/jobs/${job.slug || job.id}`}>{job.title}</Link>
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>{job.organization}</span>
                        <span>•</span>
                        {job.totalPosts && <span>পদসংখ্যা: {job.totalPosts} টি • </span>}
                        <span className="text-rose-600 font-semibold">শেষ সময়: {job.deadline}</span>
                      </div>
                      {match?.matchReasonsBn?.[0] && (
                        <p className="text-[11px] text-emerald-700 font-semibold pt-0.5 line-clamp-1">
                          ✓ {match.matchReasonsBn[0]}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                      <Link
                        href={`/jobs/${job.slug || job.id}`}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        বিস্তারিত
                      </Link>
                      <Link
                        href={`/apply/${job.id}`}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                      >
                        ১-ক্লিক আবেদন
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              eligibleJobs.slice(0, 3).map((job) => (
                <div 
                  key={job.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {job.categoryLabel}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">{job.grade}</span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 hover:text-emerald-700 transition-colors">
                      <Link href={`/jobs/${job.slug || job.id}`}>{job.title}</Link>
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{job.organization}</span>
                      <span>•</span>
                      <span>পদসংখ্যা: {job.totalPosts} টি</span>
                      <span>•</span>
                      <span className="text-rose-600 font-semibold">শেষ সময়: {job.deadline}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/apply/${job.id}`}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                    >
                      ১-ক্লিক আবেদন
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Deadlines & Quick Notifications */}
        <div className="space-y-6">
          {/* Urgent Deadlines Carousel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>আবেদনের শেষ সময় অতি নিকটে</span>
              </h3>
              {urgentDeadlines.length > 2 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setUrgentIndex(prev => Math.max(0, prev - 1))}
                    disabled={urgentIndex === 0}
                    className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-slate-600"
                    title="পূর্ববর্তী"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgentIndex(prev => Math.min(urgentDeadlines.length - 2, prev + 1))}
                    disabled={urgentIndex >= urgentDeadlines.length - 2}
                    className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-slate-600"
                    title="পরবর্তী"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs">
              {urgentDeadlines.length > 0 ? (
                urgentDeadlines.slice(urgentIndex, urgentIndex + 3).map((job) => (
                  <div key={job.id} className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-100 space-y-2 transition-all hover:bg-rose-50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[170px]">{job.organization}</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-2xs">
                        {job.daysRemaining <= 1 ? 'আজই শেষ দিন' : `${job.daysRemaining} দিন বাকি`}
                      </span>
                    </div>
                    <p className="text-slate-700 line-clamp-1 font-semibold">{job.title}</p>
                    <div className="pt-1.5 flex items-center justify-between border-t border-rose-100/70">
                      <span className="text-[11px] text-slate-500 font-medium">ফি: ৳{job.govtFee}</span>
                      <div className="flex items-center gap-2">
                        <Link href={`/jobs/${job.slug || job.id}`} className="text-slate-600 hover:text-slate-900 font-bold text-[11px]">
                          বিস্তারিত
                        </Link>
                        <Link 
                          href={`/apply/${job.id}`} 
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] shadow-2xs transition-colors flex items-center gap-1"
                        >
                          <span>আবেদন</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center text-slate-500 text-xs">
                  বর্তমানে ৫ দিনের মধ্যে শেষ হতে যাওয়া কোনো সার্কুলার নেই।
                </div>
              )}
            </div>
          </div>

          {/* Recent Notifications Widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-emerald-600" />
                <span>সাম্প্রতিক নোটিশ</span>
              </h3>
              <Link href="/dashboard/notifications" className="text-xs text-emerald-700 font-bold hover:underline">
                সবগুলো ({notifications.length})
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              {notifications.slice(0, 2).map((notif) => (
                <div key={notif.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-800">{notif.title}</div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{notif.message}</p>
                  <div className="text-[10px] text-slate-400 pt-1">{notif.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
