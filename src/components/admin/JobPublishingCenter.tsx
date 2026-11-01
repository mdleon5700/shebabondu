'use client';

import React, { useState, useEffect } from 'react';
import {
  Send, Clock, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw,
  Search, Filter, ExternalLink, Calendar, ArrowRight, ShieldCheck,
  Archive, EyeOff, RotateCcw, Link2, BarChart3, History, Trash2,
  FileText, Globe, Layers, ArrowUpRight, Check
} from 'lucide-react';
import { JobCircular } from '@/lib/types';
import {
  PublishingQueueItem,
  PublicationSnapshot,
  RedirectRecord,
  PublicationAuditLog,
  PublishingAnalyticsSummary
} from '@/lib/publishing/types';

export default function JobPublishingCenter() {
  const [activeTab, setActiveTab] = useState<'published' | 'queue' | 'calendar' | 'redirects' | 'audit' | 'analytics'>('published');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Data states
  const [jobs, setJobs] = useState<JobCircular[]>([]);
  const [queue, setQueue] = useState<PublishingQueueItem[]>([]);
  const [redirects, setRedirects] = useState<RedirectRecord[]>([]);
  const [analytics, setAnalytics] = useState<PublishingAnalyticsSummary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal / Action states
  const [selectedJob, setSelectedJob] = useState<JobCircular | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTimeBst, setScheduleTimeBst] = useState('');
  const [unpublishReason, setUnpublishReason] = useState('');
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [jobToUnpublish, setJobToUnpublish] = useState<JobCircular | null>(null);

  // New Redirect Form
  const [newRedirectSource, setNewRedirectSource] = useState('');
  const [newRedirectTarget, setNewRedirectTarget] = useState('');
  const [redirectReason, setRedirectReason] = useState('');

  // History / Snapshot Inspector
  const [selectedJobHistory, setSelectedJobHistory] = useState<{
    snapshots: PublicationSnapshot[];
    auditLogs: PublicationAuditLog[];
  } | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      // 1. Fetch published jobs
      const resJobs = await fetch('/api/admin/jobs?type=published', {
        headers: { }
      });
      if (resJobs.ok) {
        const data = await resJobs.json();
        setJobs(data.jobs || []);
      }

      // 2. Fetch publishing queue
      const resQueue = await fetch('/api/admin/publishing/queue', {
        headers: { }
      });
      if (resQueue.ok) {
        const data = await resQueue.json();
        setQueue(data.queue || []);
      }

      // 3. Fetch analytics
      const resAnalytics = await fetch('/api/admin/publishing/analytics', {
        headers: { }
      });
      if (resAnalytics.ok) {
        const data = await resAnalytics.json();
        setAnalytics(data.analytics);
      }

      // 4. Fetch redirects
      const resRedir = await fetch('/api/admin/publishing/redirects', {
        headers: { }
      });
      if (resRedir.ok) {
        const data = await resRedir.json();
        setRedirects(data.redirects || []);
      }
    } catch (err) {
      console.error('Failed to load publishing data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Action: Unpublish Job
  async function handleUnpublish() {
    if (!jobToUnpublish) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/publishing/unpublish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
          jobId: jobToUnpublish.id,
          reason: unpublishReason || 'প্রশাসনিক প্রয়োজনে অপ্রকাশ',
          adminId: 'ADMIN'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: `চাকরি (${jobToUnpublish.title}) সফলভাবে অপ্রকাশিত করা হয়েছে।`, type: 'success' });
        setShowUnpublishModal(false);
        setJobToUnpublish(null);
        setUnpublishReason('');
        loadData();
      } else {
        setMessage({ text: data.error || 'অপ্রকাশ ব্যর্থ হয়েছে।', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }

  // Action: Archive Job
  async function handleArchive(job: JobCircular) {
    if (!confirm(`আপনি কি নিশ্চিত যে "${job.title}" আর্কাইভ করতে চান? এটি পাবলিক তালিকা থেকে অপসারিত হবে।`)) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/publishing/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ jobId: job.id, adminId: 'ADMIN' })
      });
      if (res.ok) {
        setMessage({ text: 'চাকরি সফলভাবে আর্কাইভ করা হয়েছে।', type: 'success' });
        loadData();
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }

  // Action: Restore Job
  async function handleRestore(job: JobCircular) {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/publishing/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ jobId: job.id, adminId: 'ADMIN' })
      });
      if (res.ok) {
        setMessage({ text: 'চাকরি সফলভাবে পুনঃপ্রকাশ করা হয়েছে।', type: 'success' });
        loadData();
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }

  // Action: Cancel Scheduled Item
  async function handleCancelSchedule(queueId: string) {
    if (!confirm('আপনি কি এই শিডিউল প্রকাশনাটি বাতিল করতে চান?')) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/publishing/cancel-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ queueId, adminId: 'ADMIN' })
      });
      if (res.ok) {
        setMessage({ text: 'শিডিউল সফলভাবে বাতিল করা হয়েছে।', type: 'success' });
        loadData();
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }

  // Action: Retry Failed Item
  async function handleRetry(queueId: string) {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/publishing/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ queueId, adminId: 'ADMIN' })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'পুনঃপ্রকাশনা সফলভাবে সম্পন্ন হয়েছে।', type: 'success' });
        loadData();
      } else {
        setMessage({ text: data.error || 'রিট্রাই ব্যর্থ হয়েছে।', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }

  // Action: Create Redirect
  async function handleCreateRedirect(e: React.FormEvent) {
    e.preventDefault();
    if (!newRedirectSource || !newRedirectTarget) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/publishing/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
          sourcePath: newRedirectSource,
          targetPath: newRedirectTarget,
          reason: redirectReason || 'কাস্টম রিডাইরেক্ট রুল',
          adminId: 'ADMIN'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: '৩০১ পার্মানেন্ট রিডাইরেক্ট সফলভাবে তৈরি হয়েছে।', type: 'success' });
        setNewRedirectSource('');
        setNewRedirectTarget('');
        setRedirectReason('');
        loadData();
      } else {
        setMessage({ text: data.error || 'রিডাইরেক্ট তৈরি ব্যর্থ হয়েছে।', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }

  // Action: Inspect History / Snapshots
  async function handleViewHistory(job: JobCircular) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/publishing/history/${job.id}`, {
        headers: { }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedJob(job);
        setSelectedJobHistory({
          snapshots: data.snapshots || [],
          auditLogs: data.auditLogs || []
        });
        setShowHistoryModal(true);
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }

  // Filtered Jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.slug && job.slug.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
    const pubStatus = (job as any).publicationStatus || 'PUBLISHED';
    const matchesStatus = statusFilter === 'all' || pubStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Step 05 Engine
              </span>
              <span className="bg-indigo-500/20 text-indigo-200 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                Bangladesh Standard Time (BST)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              জব পাবলিশিং ও ওয়েবসাইট ম্যানেজমেন্ট সেন্টার
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              যাচাইকৃত কন্টেন্ট লাইভ ওয়েবসাইটে প্রকাশনা, স্বয়ংক্রিয় শিডিউলিং, ইউআরএল ও ৩০১ রিডাইরেক্ট নিয়ন্ত্রণ, এসইও ইনডেক্সিং এবং রিভিশন ট্র্যাকিং।
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            রিফ্রেশ ডাটা
          </button>
        </div>

        {/* Real-time KPI Counters */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800/80">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block">মোট প্রকাশিত</span>
              <span className="text-xl font-black text-emerald-400">{analytics.totalPublished}</span>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block">শিডিউলকৃত</span>
              <span className="text-xl font-black text-blue-400">{analytics.totalScheduled}</span>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block">কিউতে পেন্ডিং</span>
              <span className="text-xl font-black text-amber-400">{analytics.totalPendingQueue}</span>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block">মেয়াদোত্তীর্ণ (Expired)</span>
              <span className="text-xl font-black text-rose-400">{analytics.totalExpired}</span>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block">আর্কাইভকৃত</span>
              <span className="text-xl font-black text-slate-300">{analytics.totalArchived}</span>
            </div>
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block">সাফল্যের হার</span>
              <span className="text-xl font-black text-teal-300">{analytics.successRatePercentage}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Alert */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-bold ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('published')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'published' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          প্রকাশিত সার্কুলার ({filteredJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'queue' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          পাবলিশিং কিউ ({queue.length})
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'calendar' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          BST পাবলিকেশন শিডিউল
        </button>
        <button
          onClick={() => setActiveTab('redirects')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'redirects' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Link2 className="w-4 h-4" />
          ৩০১ রিডাইরেক্ট ম্যানেজার ({redirects.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          পাবলিশিং অ্যানালিটিক্স
        </button>
      </div>

      {/* TAB 1: PUBLISHED JOBS */}
      {activeTab === 'published' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="চাকরির পদবি, প্রতিষ্ঠান বা স্লাগ খুঁজুন..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs font-medium border-0 focus:ring-0 text-slate-800 placeholder-slate-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700"
              >
                <option value="all">সকল ক্যাটাগরি</option>
                <option value="govt">সরকারি চাকরি</option>
                <option value="bank">ব্যাংক জব</option>
                <option value="teacher">শিক্ষক নিয়োগ</option>
                <option value="ngo">এনজিও</option>
                <option value="defense">প্রতিরক্ষা</option>
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700"
              >
                <option value="all">সকল স্ট্যাটাস</option>
                <option value="PUBLISHED">সক্রিয় প্রকাশিত (PUBLISHED)</option>
                <option value="EXPIRED">মেয়াদোত্তীর্ণ (EXPIRED)</option>
                <option value="ARCHIVED">আর্কাইভকৃত (ARCHIVED)</option>
                <option value="UNPUBLISHED">অপ্রকাশিত (UNPUBLISHED)</option>
              </select>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="p-3.5">সার্কুলার বিবরণ</th>
                    <th className="p-3.5">ক্যাটাগরি</th>
                    <th className="p-3.5">আবেদনের শেষ সময়</th>
                    <th className="p-3.5">স্ট্যাটাস</th>
                    <th className="p-3.5">ইউআরএল স্লাগ</th>
                    <th className="p-3.5 text-right">ম্যানেজমেন্ট অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        কোনো সার্কুলার রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map(job => {
                      const pubStatus = (job as any).publicationStatus || 'PUBLISHED';
                      const isPub = pubStatus === 'PUBLISHED' || pubStatus === 'PUBLISHED_WITH_WARNINGS';
                      return (
                        <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5">
                            <div className="font-black text-slate-900 line-clamp-1">{job.title}</div>
                            <div className="text-[11px] text-slate-500 font-semibold">{job.organization}</div>
                          </td>
                          <td className="p-3.5">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                              {job.categoryLabel || job.category}
                            </span>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-700">{job.deadline}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              pubStatus === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' :
                              pubStatus === 'EXPIRED' ? 'bg-rose-100 text-rose-800' :
                              pubStatus === 'ARCHIVED' ? 'bg-slate-200 text-slate-700' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {pubStatus}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-indigo-600">
                            /jobs/{job.slug || job.id}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPub && (
                                <a
                                  href={`/jobs/${job.slug || job.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                  title="পাবলিক পেজ দেখুন"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => handleViewHistory(job)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                title="হিস্ট্রি ও স্ন্যাপশট"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>
                              {isPub && (
                                <button
                                  onClick={() => {
                                    setJobToUnpublish(job);
                                    setShowUnpublishModal(true);
                                  }}
                                  className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors"
                                  title="অপ্রকাশ (Unpublish)"
                                >
                                  <EyeOff className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {isPub && (
                                <button
                                  onClick={() => handleArchive(job)}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                  title="আর্কাইভ"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {(pubStatus === 'UNPUBLISHED' || pubStatus === 'ARCHIVED') && (
                                <button
                                  onClick={() => handleRestore(job)}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-colors font-bold text-[10px] flex items-center gap-1"
                                  title="পুনঃপ্রকাশ"
                                >
                                  <RotateCcw className="w-3 h-3" /> রিস্টোর
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PUBLISHING QUEUE */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-black text-sm text-slate-900">স্বয়ংক্রিয় পাবলিশিং কিউ ও শিডিউলড টাস্ক</h3>
            <span className="text-xs text-slate-500 font-semibold">মোট কিউ আইটেম: {queue.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="p-3.5">কিউ আইডি</th>
                  <th className="p-3.5">টার্গেট জব আইডি</th>
                  <th className="p-3.5">অ্যাকশন</th>
                  <th className="p-3.5">টার্গেট সময় (BST)</th>
                  <th className="p-3.5">অগ্রাধিকার</th>
                  <th className="p-3.5">স্ট্যাটাস</th>
                  <th className="p-3.5 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                      পাবলিশিং কিউ সম্পূর্ণ খালি।
                    </td>
                  </tr>
                ) : (
                  queue.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-slate-600">{item.id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{item.jobId}</td>
                      <td className="p-3.5 font-semibold text-indigo-700">{item.action}</td>
                      <td className="p-3.5 text-slate-700 font-medium">{item.targetPublishTimeBst}</td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                          P-{item.priority}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'PROCESSING' ? 'bg-indigo-100 text-indigo-800 animate-pulse' :
                          item.status === 'FAILED' ? 'bg-rose-100 text-rose-800' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === 'PENDING' && (
                            <button
                              onClick={() => handleCancelSchedule(item.id)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors"
                            >
                              বাতিল
                            </button>
                          )}
                          {(item.status === 'FAILED' || item.status === 'RETRY_PENDING') && (
                            <button
                              onClick={() => handleRetry(item.id)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" /> রিট্রাই
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              বাংলাদেশ সময় (BST UTC+6) পাবলিকেশন টাইমলাইন
            </h3>
            <span className="text-xs text-slate-500 font-medium">Asia/Dhaka টাইমজোন কার্যকর</span>
          </div>

          <div className="space-y-3">
            {queue.filter(q => q.status === 'PENDING').length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                ভবিষ্যতে শিডিউল করা কোনো সার্কুলার নেই।
              </div>
            ) : (
              queue.filter(q => q.status === 'PENDING').map(item => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        শিডিউলড
                      </span>
                      <span className="font-bold text-xs text-slate-900">{item.jobId}</span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      {item.targetPublishTimeBst}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancelSchedule(item.id)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200"
                  >
                    শিডিউল প্রত্যাহার
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: REDIRECTS MANAGER */}
      {activeTab === 'redirects' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-indigo-600" />
              নতুন ৩০১ রিডাইরেক্ট রুল যোগ করুন
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              স্লাগ বা পেজ ইউআরএল পরিবর্তন হলে পুরোনো লিংকটি নতুন লিংকে স্বয়ংক্রিয়ভাবে রিডাইরেক্ট করতে রুল যুক্ত করুন।
            </p>
            <form onSubmit={handleCreateRedirect} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">উৎস পাথ (Source Path)</label>
                <input
                  type="text"
                  placeholder="/jobs/old-slug-2025"
                  value={newRedirectSource}
                  onChange={e => setNewRedirectSource(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">গন্তব্য পাথ (Target Path)</label>
                <input
                  type="text"
                  placeholder="/jobs/new-bangladesh-bank-2026"
                  value={newRedirectTarget}
                  onChange={e => setNewRedirectTarget(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">কারণ (Reason)</label>
                <input
                  type="text"
                  placeholder="স্লাগ পরিমার্জন"
                  value={redirectReason}
                  onChange={e => setRedirectReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                রিডাইরেক্ট রুল সংরক্ষণ করুন
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900">সক্রিয় ৩০১/৩০৮ পার্মানেন্ট রিডাইরেক্ট তালিকা</h3>
              <span className="text-xs text-slate-500 font-semibold">{redirects.length}টি রুল</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="p-3.5">উৎস (Source)</th>
                    <th className="p-3.5">গন্তব্য (Target)</th>
                    <th className="p-3.5">কোড</th>
                    <th className="p-3.5">হিট সংখ্যা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {redirects.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                        কোনো রিডাইরেক্ট রুল যুক্ত করা হয়নি।
                      </td>
                    </tr>
                  ) : (
                    redirects.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 font-mono text-[11px] text-rose-700">{r.sourcePath}</td>
                        <td className="p-3.5 font-mono text-[11px] text-emerald-700">{r.targetPath}</td>
                        <td className="p-3.5">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                            {r.statusCode}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-700">{r.hitCount || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            পাবলিশিং পারফরম্যান্স ও ট্রানজিশন অ্যানালিটিক্স
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block mb-1">আজ প্রকাশিত (Today)</span>
              <span className="text-2xl font-black text-slate-900">{analytics.publishedToday}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block mb-1">এই সপ্তাহে প্রকাশিত (Weekly)</span>
              <span className="text-2xl font-black text-slate-900">{analytics.publishedThisWeek}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block mb-1">এই মাসে প্রকাশিত (Monthly)</span>
              <span className="text-2xl font-black text-slate-900">{analytics.publishedThisMonth}</span>
            </div>
          </div>
        </div>
      )}

      {/* UNPUBLISH MODAL */}
      {showUnpublishModal && jobToUnpublish && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              সার্কুলার অপ্রকাশ (Unpublish) নিশ্চিতকরণ
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              আপনি কি <strong>&quot;{jobToUnpublish.title}&quot;</strong> পাবলিক ওয়েবসাইট থেকে অপসারিত করতে চান? এর ইতিহাস ও ডাটা অক্ষুণ্ণ থাকবে।
            </p>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">অপ্রকাশের কারণ</label>
              <textarea
                rows={3}
                placeholder="যেমন: বিজ্ঞপ্তিতে ভুল তথ্য সংশোধন প্রয়োজন..."
                value={unpublishReason}
                onChange={e => setUnpublishReason(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowUnpublishModal(false);
                  setJobToUnpublish(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                বাতিল
              </button>
              <button
                onClick={handleUnpublish}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md"
              >
                অপ্রকাশ নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY / SNAPSHOT MODAL */}
      {showHistoryModal && selectedJob && selectedJobHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-black text-base text-slate-900">পাবলিকেশন হিস্ট্রি ও স্ন্যাপশট</h3>
                <p className="text-xs text-slate-500">{selectedJob.title}</p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800">অপরিবর্তনীয় প্রকাশনা স্ন্যাপশট (Immutable Snapshots)</h4>
              {selectedJobHistory.snapshots.length === 0 ? (
                <p className="text-xs text-slate-400 italic">কোনো স্ন্যাপশট পাওয়া যায়নি।</p>
              ) : (
                selectedJobHistory.snapshots.map(s => (
                  <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>সংস্করণ #{s.versionNumber} ({s.id})</span>
                      <span className="text-[11px] text-slate-500">{new Date(s.publishedAt).toLocaleString('bn-BD')}</span>
                    </div>
                    <p className="text-slate-600">প্রকাশক: {s.publishedBy} | {s.changeSummary}</p>
                  </div>
                ))
              )}

              <h4 className="text-xs font-bold text-slate-800 pt-2">অডিট ও ট্রানজিশন লগস</h4>
              {selectedJobHistory.auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">কোনো অডিট রেকর্ড নেই।</p>
              ) : (
                selectedJobHistory.auditLogs.map(a => (
                  <div key={a.id} className="p-2.5 bg-slate-50/70 rounded-xl text-xs space-y-0.5">
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span className="text-indigo-700">{a.action}</span>
                      <span className="text-[10px] text-slate-400">{new Date(a.timestamp).toLocaleString('bn-BD')}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">কর্তা: {a.actor}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
