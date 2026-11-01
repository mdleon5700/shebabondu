'use client';
import { fetchPublicJobs } from '@/lib/public-jobs-client';

import DeadlineCountdown from '@/components/deadlines/DeadlineCountdown';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Bookmark,
  Bell,
  BellRing,
  CheckCircle2,
  AlertTriangle, 
  Trash2, 
  Clock, 
  Building2, 
  ArrowRight, 
  Sparkles,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { storage } from '@/lib/store';
import { JobCircular } from '@/lib/types';

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<JobCircular[]>(storage.getJobs());
  const [savedIds, setSavedIds] = useState<string[]>(storage.getSavedJobIds());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeUrgencyFilter, setActiveUrgencyFilter] = useState<'all' | 'closing_today' | 'closing_soon' | 'active' | 'expired'>('all');
  const [activeReminderJobIds, setActiveReminderJobIds] = useState<Set<string>>(new Set());
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial hydration from local store
    setJobs(storage.getJobs());
    const localSaved = storage.getSavedJobIds();
    setSavedIds(localSaved);

    // 2. Cross-device sync with backend API
    const syncWithServer = async () => {
      setIsSyncing(true);
      try {
        // Fetch server saved jobs
        const res = await fetch('/api/candidate/saved-jobs');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.savedJobs)) {
            setSavedIds(data.savedJobs);
            storage.replaceSavedJobIds(data.savedJobs);
          }
        }
      } catch {
        // Fallback to local storage gracefully if offline or unauthenticated
      }

      // Fetch canonical jobs from API to ensure full catalog is available
      try {
        setJobs(await fetchPublicJobs());
      } catch {
        // Keep storage.getJobs()
      } finally {
        setIsSyncing(false);
      }
    };

    syncWithServer();
        // 3. Fetch candidate active reminders from Step 08 API
    const fetchReminders = async () => {
      try {
        const rRes = await fetch('/api/candidate/job-reminders');
        if (rRes.ok) {
          const rData = await rRes.json();
          if (rData.success && Array.isArray(rData.reminders)) {
            const activeSet = new Set<string>(rData.reminders.map((r: any) => String(r.jobId)));
            setActiveReminderJobIds(activeSet);
          }
        }
      } catch {}
    };
    fetchReminders();

    const handleSavedChange = () => setSavedIds(storage.getSavedJobIds());
    window.addEventListener('cs_saved_changed', handleSavedChange);
    return () => window.removeEventListener('cs_saved_changed', handleSavedChange);
  }, []);

  const savedJobs = useMemo(() => {
    return jobs.filter(j => savedIds.includes(j.id));
  }, [jobs, savedIds]);

  const filteredSavedJobs = useMemo(() => {
    return savedJobs.filter(job => {
      const days = job.daysRemaining !== undefined ? job.daysRemaining : 10;
      if (activeUrgencyFilter === 'closing_today') return days === 0;
      if (activeUrgencyFilter === 'closing_soon') return days > 0 && days <= 3;
      if (activeUrgencyFilter === 'active') return days >= 0;
      if (activeUrgencyFilter === 'expired') return days < 0;
      return true;
    });
  }, [savedJobs, activeUrgencyFilter]);

  const handleToggleReminder = async (jobId: string, jobTitle: string) => {
    const isSubscribed = activeReminderJobIds.has(jobId);
    try {
      if (isSubscribed) {
        const res = await fetch(`/api/candidate/job-reminders?jobId=${encodeURIComponent(jobId)}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setActiveReminderJobIds(prev => {
            const next = new Set(prev);
            next.delete(jobId);
            return next;
          });
          setReminderToast(`"${jobTitle}" এর রিমাইন্ডার বন্ধ করা হয়েছে`);
          setTimeout(() => setReminderToast(null), 3000);
        }
      } else {
        const res = await fetch('/api/candidate/job-reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId,
            daysBefore: [7, 3, 1, 0],
            channel: 'in_app'
          })
        });
        if (res.ok) {
          setActiveReminderJobIds(prev => new Set(prev).add(jobId));
          setReminderToast(`"${jobTitle}" এর জন্য ডেডলাইন অ্যালার্ট সক্রিয় করা হয়েছে`);
          setTimeout(() => setReminderToast(null), 3000);
        }
      }
    } catch {
      setReminderToast('রিমাইন্ডার আপডেট ব্যর্থ হয়েছে');
      setTimeout(() => setReminderToast(null), 3000);
    }
  };

  const handleRemove = async (id: string) => {
    // 1. Update local storage & state immediately
    storage.toggleSaveJob(id);
    setSavedIds(prev => prev.filter(savedId => savedId !== id));

    // 2. Notify backend server
    try {
      await fetch('/api/candidate/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: id, action: 'unsave' })
      });
    } catch {
      // Local state is already updated
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-emerald-700" />
            <span>সংরক্ষিত সার্কুলার ({savedJobs.length} টি)</span>
            {isSyncing && (
              <RefreshCw className="w-4 h-4 text-slate-400 animate-spin ml-2" />
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            যেসব চাকরির সার্কুলার আপনি পরবর্তীতে আবেদনের জন্য সেভ করে রেখেছেন।
          </p>
        </div>
      </div>

      {/* Step 08 Deadline Urgency Filter Pills & Toast */}
      {reminderToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{reminderToast}</span>
        </div>
      )}

      {savedJobs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveUrgencyFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeUrgencyFilter === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            সকল সংরক্ষিত ({savedJobs.length})
          </button>
          <button
            onClick={() => setActiveUrgencyFilter('closing_today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeUrgencyFilter === 'closing_today'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            আজই শেষ ({savedJobs.filter(j => j.daysRemaining === 0).length})
          </button>
          <button
            onClick={() => setActiveUrgencyFilter('closing_soon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeUrgencyFilter === 'closing_soon'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            শীঘ্রই শেষ ({savedJobs.filter(j => (j.daysRemaining || 0) > 0 && (j.daysRemaining || 0) <= 3).length})
          </button>
          <button
            onClick={() => setActiveUrgencyFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeUrgencyFilter === 'active'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            চলমান ({savedJobs.filter(j => (j.daysRemaining || 0) >= 0).length})
          </button>
          <button
            onClick={() => setActiveUrgencyFilter('expired')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeUrgencyFilter === 'expired'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            মেয়াদোত্তীর্ণ ({savedJobs.filter(j => (j.daysRemaining || 0) < 0).length})
          </button>
        </div>
      )}

      {filteredSavedJobs.length > 0 ? (
        <div className="space-y-3">
          {filteredSavedJobs.map((job) => { const isReminded = activeReminderJobIds.has(job.id); const isExpired = (job.daysRemaining || 0) < 0; return (
            <div
              key={job.id}
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
                  onClick={() => handleRemove(job.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                  title="তালিকা থেকে সরান"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link
                  href={`/apply/${job.id}`}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  ১-ক্লিক আবেদন
                </Link>
              </div>
            </div>
          ); })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800">কোনো চাকরি সংরক্ষিত নেই</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            চলমান সরকারি ও ব্যাংক চাকরির সার্কুলার থেকে পছন্দের চাকরিগুলো বুকমার্ক করে রাখুন।
          </p>
          <Link
            href="/jobs"
            className="inline-block px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold mt-2 hover:bg-emerald-800"
          >
            সার্কুলার ব্রাউজ করুন
          </Link>
        </div>
      )}
    </div>
  );
}