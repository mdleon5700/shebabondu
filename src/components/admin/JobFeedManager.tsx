'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Rss, 
  Sparkles, 
  Calendar, 
  Flame, 
  Award, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Sliders, 
  Save, 
  History,
  Building2,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { FeedMetricsSummary, GlobalFeedConfig } from '@/lib/feeds/types';
import { JobCircular } from '@/lib/types';

const toBn = (n: number | string) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);

export default function JobFeedManager() {
  const [activeTab, setActiveTab] = useState<'metrics' | 'featured' | 'config' | 'preview' | 'audit'>('metrics');
  const [metrics, setMetrics] = useState<FeedMetricsSummary | null>(null);
  const [config, setConfig] = useState<GlobalFeedConfig | null>(null);
  const [placements, setPlacements] = useState<any[]>([]);
  const [jobs, setJobs] = useState<JobCircular[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states for Featured Job
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<any | null>(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedPlacementTarget, setSelectedPlacementTarget] = useState<'homepage' | 'featured_page' | 'category' | 'all'>('homepage');
  const [priorityVal, setPriorityVal] = useState(50);
  const [startDateVal, setStartDateVal] = useState(new Date().toISOString().split('T')[0]);
  const [endDateVal, setEndDateVal] = useState(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [adminNotesVal, setAdminNotesVal] = useState('');

  // Feed Preview states
  const [previewFeedType, setPreviewFeedType] = useState('latest');
  const [previewJobs, setPreviewJobs] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewDate, setPreviewDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [feedRes, featRes, jobsRes, auditRes] = await Promise.all([
        fetch('/api/admin/job-feeds', { headers: { 'x-admin-secret': 'chakri-sheba-secret-2026' } }),
        fetch('/api/admin/featured-jobs', { headers: { 'x-admin-secret': 'chakri-sheba-secret-2026' } }),
        fetch('/api/jobs?limit=200'),
        fetch('/api/admin/audit-logs', { headers: { 'x-admin-secret': 'chakri-sheba-secret-2026' } }).catch(() => null)
      ]);

      if (feedRes.ok) {
        const feedData = await feedRes.json();
        setMetrics(feedData.metrics);
        setConfig(feedData.config);
      }

      if (featRes.ok) {
        const featData = await featRes.json();
        setPlacements(featData.placements || []);
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs || []);
      }

      if (auditRes && auditRes.ok) {
        const auditData = await auditRes.json();
        const logs = auditData.logs || auditData.auditLogs || [];
        setAuditLogs(logs.filter((l: any) => l.action?.includes('FEED') || l.action?.includes('FEATURED')));
      }
    } catch (err) {
      console.error('Failed to load job feeds admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load preview data when preview tab or previewFeedType changes
  useEffect(() => {
    if (activeTab === 'preview') {
      setPreviewLoading(true);
      let url = `/api/jobs/${previewFeedType}?limit=6`;
      if (previewFeedType === 'daily') {
        url = `/api/jobs/daily/${previewDate}?limit=6`;
      }
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data && data.success) {
            setPreviewJobs(data.jobs || []);
          }
        })
        .catch(() => {})
        .finally(() => setPreviewLoading(false));
    }
  }, [activeTab, previewFeedType, previewDate]);

  const handleRevalidate = async () => {
    try {
      const res = await fetch('/api/admin/job-feeds/revalidate', {
        method: 'POST',
        headers: { 'x-admin-secret': 'chakri-sheba-secret-2026' }
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ type: 'success', text: 'সকল ফিড ও ফিচার্ড স্ট্যাটাস সফলভাবে রিভ্যালিডেট করা হয়েছে!' });
        loadData();
      }
    } catch {
      setActionMessage({ type: 'error', text: 'রিভ্যালিডেশন ব্যর্থ হয়েছে' });
    }
  };

  const handleSavePlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) {
      alert('অনুগ্রহ করে একটি সার্কুলার নির্বাচন করুন');
      return;
    }

    try {
      const startAtIso = new Date(`${startDateVal}T00:00:00.000Z`).toISOString();
      const endAtIso = new Date(`${endDateVal}T23:59:59.999Z`).toISOString();

      if (editingPlacement) {
        const res = await fetch(`/api/admin/featured-jobs/${editingPlacement.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-secret': 'chakri-sheba-secret-2026'
          },
          body: JSON.stringify({
            placement: selectedPlacementTarget,
            priority: priorityVal,
            startAt: startAtIso,
            endAt: endAtIso,
            adminNotes: adminNotesVal
          })
        });
        const data = await res.json();
        if (data.success) {
          setActionMessage({ type: 'success', text: 'ফিচার্ড প্লেসমেন্ট সফলভাবে হালনাগাদ করা হয়েছে!' });
        } else {
          alert(data.error || 'আপডেট ব্যর্থ হয়েছে');
        }
      } else {
        const res = await fetch('/api/admin/featured-jobs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-secret': 'chakri-sheba-secret-2026'
          },
          body: JSON.stringify({
            jobId: selectedJobId,
            placement: selectedPlacementTarget,
            priority: priorityVal,
            startAt: startAtIso,
            endAt: endAtIso,
            adminNotes: adminNotesVal
          })
        });
        const data = await res.json();
        if (data.success) {
          setActionMessage({ type: 'success', text: 'সার্কুলারটি সফলভাবে ফিচার্ড তালিকায় যুক্ত করা হয়েছে!' });
        } else {
          alert(data.error || data.errors?.join('\n') || 'সংযোজন ব্যর্থ হয়েছে');
        }
      }

      setIsAddModalOpen(false);
      setEditingPlacement(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'নেটওয়ার্ক সমস্যা');
    }
  };

  const handleDeletePlacement = async (id: string, title?: string) => {
    if (!confirm(`আপনি কি "${title || 'এই প্লেসমেন্টটি'}" ফিচার্ড তালিকা থেকে মুছে ফেলতে চান?`)) return;

    try {
      const res = await fetch(`/api/admin/featured-jobs/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-secret': 'chakri-sheba-secret-2026' }
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ type: 'success', text: 'ফিচার্ড প্লেসমেন্ট সফলভাবে মুছে ফেলা হয়েছে!' });
        loadData();
      }
    } catch {
      alert('মুছে ফেলা সম্ভব হয়নি');
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    try {
      const res = await fetch('/api/admin/job-feeds/config', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': 'chakri-sheba-secret-2026'
        },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ type: 'success', text: 'ফিড কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!' });
        setConfig(data.config);
      }
    } catch {
      alert('কনফিগারেশন সংরক্ষণে ত্রুটি');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-amber-600/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Rss className="w-3.5 h-3.5" />
              <span>Step 07: Job Feeds & Discovery</span>
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Asia/Dhaka (BST: UTC+6)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            জব ফিড ও ফিচার্ড ম্যানেজমেন্ট সেন্টার
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            সর্বশেষ চাকরি, আজকের খবর, তারিখভিত্তিক আর্কাইভ, বিশেষ ফিচার্ড সার্কুলার এবং জরুরি ডেডলাইন ফিডের কেন্দ্রীয় নিয়ন্ত্রণ কেন্দ্র।
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={handleRevalidate}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>ফিড ক্যাশ রিভ্যালিডেট</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className={`p-4 rounded-xl flex items-center justify-between shadow-sm border ${
          actionMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2 font-medium text-sm">
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-xs font-bold hover:underline">বন্ধ করুন</button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'metrics', label: '১. ড্যাশবোর্ড ও পরিসংখ্যান', icon: TrendingUp },
          { id: 'featured', label: '২. ফিচার্ড জবস কন্ট্রোল', icon: Award },
          { id: 'config', label: '৩. হোমপেজ ও ফিড কনফিগারেশন', icon: Sliders },
          { id: 'preview', label: '৪. লাইভ ফিড প্রিভিউ', icon: Eye },
          { id: 'audit', label: '৫. অডিট হিস্ট্রি', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: METRICS & DASHBOARD */}
      {activeTab === 'metrics' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>মোট সক্রিয় প্রকাশিত চাকরি</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">{toBn(metrics.totalEligibleJobs)}টি</div>
              <div className="text-xs text-emerald-700 font-medium">১০০% অনুমোদনকৃত ও প্রকাশিত</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>আজ প্রকাশিত (Today BST)</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-blue-700">{toBn(metrics.jobsToday)}টি</div>
              <div className="text-xs text-slate-500">তারিখ: {metrics.todayDateBn}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>চলতি সপ্তাহের চাকরি (৭ দিন)</span>
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-3xl font-black text-purple-700">{toBn(metrics.jobsLast7Days)}টি</div>
              <div className="text-xs text-slate-500">গত ৩০ দিনে: {toBn(metrics.jobsLast30Days)}টি</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>সক্রিয় ফিচার্ড প্লেসমেন্ট</span>
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-700">{toBn(metrics.activeFeaturedCount)}টি</div>
              <div className="text-xs text-slate-500">জরুরি ডেডলাইন (৩ দিন): {toBn(metrics.closingSoonCount)}টি</div>
            </div>
          </div>

          {/* Timezone & Feed Status Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-700" />
              <span>বাংলাদেশ সময় (Asia/Dhaka) ও টাইমস্ট্যাম্প সুস্থতা রিপোর্ট</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-xs font-bold text-slate-500">বর্তমান বাংলাদেশ ক্যালেন্ডার তারিখ</span>
                <div className="text-lg font-black text-slate-900">{metrics.todayDateBn} ({metrics.todayDateIso})</div>
                <div className="text-xs text-emerald-700">টাইমজোন অফসেট: UTC+06:00</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-xs font-bold text-slate-500">টাইমস্ট্যাম্প ভ্যালিডেশন স্ট্যাটাস</span>
                <div className="text-lg font-black text-emerald-700">
                  {metrics.missingTimestampCount === 0 ? '১০০% সুস্থ (কোনো ত্রুটি নেই)' : `${toBn(metrics.missingTimestampCount)}টি টাইমস্ট্যাম্প অনুপস্থিত`}
                </div>
                <div className="text-xs text-slate-500">সকল সার্কুলারে বৈধ তারিখ বিদ্যমান</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-xs font-bold text-slate-500">ফিড ক্যাশ মেয়াদকাল</span>
                <div className="text-lg font-black text-slate-900">{toBn(config?.revalidationIntervalSeconds || 60)} সেকেন্ড</div>
                <div className="text-xs text-slate-500">অটোমেটিক এস-ম্যাক্স-এজ ও রিভ্যালিডেশন সক্রিয়</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FEATURED JOBS CONTROL */}
      {activeTab === 'featured' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span>ফিচার্ড ও অগ্রাধিকারপ্রাপ্ত চাকরি তালিকা</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">হোমপেজ ও বিশেষ পাতায় প্রদর্শনের জন্য সার্কুলার নির্বাচন ও সময় নির্ধারণ করুন</p>
            </div>

            <button
              onClick={() => {
                setEditingPlacement(null);
                setSelectedJobId(jobs[0]?.id || '');
                setPriorityVal(50);
                setStartDateVal(new Date().toISOString().split('T')[0]);
                setEndDateVal(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                setAdminNotesVal('');
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ফিচার্ড জব যুক্ত করুন</span>
            </button>
          </div>

          {/* Placements Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">সার্কুলার শিরোনাম ও প্রতিষ্ঠান</th>
                    <th className="py-3 px-4">প্লেসমেন্ট</th>
                    <th className="py-3 px-4 text-center">অগ্রাধিকার (Priority)</th>
                    <th className="py-3 px-4">মেয়াদকাল</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {placements.length > 0 ? (
                    placements.map((p) => {
                      const isLegacy = p.isLegacy;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 max-w-sm">
                            <div className="font-bold text-slate-900 line-clamp-1">{p.job?.title || p.jobId}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{p.job?.organization || 'অজ্ঞাত প্রতিষ্ঠান'}</span>
                              <span className="text-slate-300">•</span>
                              <span>ডেডলাইন: {p.job?.deadline || 'উদ্বৃত্ত নেই'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                              {p.placement === 'homepage' ? 'হোমপেজ' : p.placement === 'featured_page' ? 'ফিচার্ড পেজ' : 'সকল স্থান'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                              {toBn(p.priority)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600">
                            <div>শুরু: {p.startAt?.split('T')[0]}</div>
                            <div>শেষ: {p.endAt?.split('T')[0]}</div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              p.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'SCHEDULED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {p.status === 'ACTIVE' ? 'সক্রিয়' : p.status === 'SCHEDULED' ? 'শিডিউলড' : 'মেয়াদোত্তীর্ণ'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            {!isLegacy && (
                              <button
                                onClick={() => {
                                  setEditingPlacement(p);
                                  setSelectedJobId(p.jobId);
                                  setSelectedPlacementTarget(p.placement);
                                  setPriorityVal(p.priority);
                                  setStartDateVal(p.startAt?.split('T')[0] || '');
                                  setEndDateVal(p.endAt?.split('T')[0] || '');
                                  setAdminNotesVal(p.adminNotes || '');
                                  setIsAddModalOpen(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg"
                                title="সম্পাদনা"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeletePlacement(p.id, p.job?.title)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="অপসারণ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        কোনো ফিচার্ড প্লেসমেন্ট রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEED & HOMEPAGE CONFIG */}
      {activeTab === 'config' && config && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-700" />
                  <span>হোমপেজ ও ডায়নামিক ফিড ডিসপ্লে কন্ট্রোল</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">বিভিন্ন ফিডের দৃশ্যমানতা, আইটেম সীমা ও ডেডলাইন থ্রেশহোল্ড পরিবর্তন করুন</p>
              </div>

              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>পরিবর্তন সংরক্ষণ করুন</span>
              </button>
            </div>

            {/* Sections Configuration Grid */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">হোমপেজ সেকশন কনফিগারেশন</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(config.sections).map(([key, sec]) => (
                  <div key={key} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{sec.title_bn}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sec.enabled}
                          onChange={(e) => {
                            const updated = { ...config };
                            updated.sections[key].enabled = e.target.checked;
                            setConfig(updated);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-slate-500 block mb-1">সর্বোচ্চ পদসংখ্যা (Limit)</label>
                        <select
                          value={sec.item_limit}
                          onChange={(e) => {
                            const updated = { ...config };
                            updated.sections[key].item_limit = parseInt(e.target.value, 10);
                            setConfig(updated);
                          }}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        >
                          <option value={3}>৩টি কার্ড</option>
                          <option value={6}>৬টি কার্ড</option>
                          <option value={9}>৯টি কার্ড</option>
                          <option value={12}>১২টি কার্ড</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-500 block mb-1">প্রদর্শন ক্রম (Order)</label>
                        <input
                          type="number"
                          value={sec.display_order}
                          onChange={(e) => {
                            const updated = { ...config };
                            updated.sections[key].display_order = parseInt(e.target.value, 10);
                            setConfig(updated);
                          }}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                          min={1}
                          max={10}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Thresholds */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">গ্লোবাল থ্রেশহোল্ড ও টাইমিং</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-600 font-bold block mb-1.5">&#39;নতুন&#39; ব্যাজ প্রদর্শনের মেয়াদ (দিন)</label>
                  <input
                    type="number"
                    value={config.newJobBadgeDurationDays}
                    onChange={(e) => setConfig({ ...config, newJobBadgeDurationDays: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    min={1}
                    max={15}
                  />
                  <p className="text-slate-400 mt-1">প্রকাশের পর যত দিন পর্যন্ত &#39;নতুন&#39; ব্যাজ থাকবে</p>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1.5">&#39;জরুরি ডেডলাইন&#39; সময়সীমা (দিন)</label>
                  <input
                    type="number"
                    value={config.closingSoonThresholdDays}
                    onChange={(e) => setConfig({ ...config, closingSoonThresholdDays: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    min={1}
                    max={7}
                  />
                  <p className="text-slate-400 mt-1">ডেডলাইনের যত দিন বাকি থাকলে &#39;শীঘ্রই শেষ&#39; বলা হবে</p>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1.5">রিভ্যালিডেশন ইন্টারভ্যাল (সেকেন্ড)</label>
                  <input
                    type="number"
                    value={config.revalidationIntervalSeconds}
                    onChange={(e) => setConfig({ ...config, revalidationIntervalSeconds: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    min={30}
                    max={3600}
                  />
                  <p className="text-slate-400 mt-1">ক্যাশ সতেজ করার নির্ধারিত সময়সীমা</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE FEED PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 uppercase">প্রিভিউ ফিড টাইপ:</span>
              <select
                value={previewFeedType}
                onChange={(e) => setPreviewFeedType(e.target.value)}
                className="p-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
              >
                <option value="latest">সর্বশেষ চাকরি (/latest-jobs)</option>
                <option value="today">আজকের চাকরি (/todays-jobs)</option>
                <option value="daily">নির্দিষ্ট তারিখের আর্কাইভ (/daily-jobs/[date])</option>
                <option value="featured">ফিচার্ড চাকরি (/featured-jobs)</option>
                <option value="closing_soon">জরুরি ডেডলাইন (/closing-soon)</option>
              </select>

              {previewFeedType === 'daily' && (
                <input
                  type="date"
                  value={previewDate}
                  onChange={(e) => setPreviewDate(e.target.value)}
                  className="p-1.5 border border-slate-200 rounded-xl text-sm"
                />
              )}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              লাইভ রেজাল্ট: {toBn(previewJobs.length)}টি সার্কুলার প্রদর্শিত
            </div>
          </div>

          {previewLoading ? (
            <div className="p-12 text-center text-slate-400">ফিড লোড হচ্ছে...</div>
          ) : previewJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {previewJobs.map(j => (
                <div key={j.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="text-xs font-bold text-emerald-700">{j.categoryLabel || j.category}</div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{j.title}</h4>
                  <div className="text-xs text-slate-500">{j.organization}</div>
                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span>প্রকাশ: {j.publishedDate}</span>
                    <span>বাকি: {toBn(j.daysRemaining)} দিন</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              নির্বাচিত ফিডে কোনো সক্রিয় চাকরি পাওয়া যায়নি
            </div>
          )}
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-700" />
            <span>ফিড ও ফিচার্ড ম্যানেজমেন্ট অডিট লগ</span>
          </div>

          <div className="divide-y divide-slate-100 text-sm">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
                        {log.action}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleString('bn-BD')}
                      </span>
                    </div>
                    <div className="text-slate-800 text-sm">{log.notes || 'No description'}</div>
                  </div>
                  <div className="text-xs font-mono text-slate-400 flex-shrink-0">
                    {log.adminId}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                কোনো অডিট লগ রেকর্ড পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT FEATURED MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingPlacement ? 'ফিচার্ড প্লেসমেন্ট সম্পাদনা' : 'নতুন ফিচার্ড জব নির্ধারণ'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlacement} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">সার্কুলার নির্বাচন করুন</label>
                <select
                  disabled={Boolean(editingPlacement)}
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs disabled:opacity-60"
                  required
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.organization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">প্লেসমেন্ট টার্গেট</label>
                  <select
                    value={selectedPlacementTarget}
                    onChange={(e) => setSelectedPlacementTarget(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="homepage">হোমপেজ ফিচার্ড</option>
                    <option value="featured_page">ফিচার্ড পেজ</option>
                    <option value="all">সকল স্থান</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">অগ্রাধিকার (Priority ১-১০০)</label>
                  <input
                    type="number"
                    value={priorityVal}
                    onChange={(e) => setPriorityVal(parseInt(e.target.value, 10))}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                    min={1}
                    max={100}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">শুরুর তারিখ (Start Date)</label>
                  <input
                    type="date"
                    value={startDateVal}
                    onChange={(e) => setStartDateVal(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">সমাপ্তির তারিখ (End Date)</label>
                  <input
                    type="date"
                    value={endDateVal}
                    onChange={(e) => setEndDateVal(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">অভ্যন্তরীণ নোট (ঐচ্ছিক)</label>
                <textarea
                  value={adminNotesVal}
                  onChange={(e) => setAdminNotesVal(e.target.value)}
                  placeholder="অ্যাডমিন নোট বা কারণ লিখুন..."
                  className="w-full p-2 border border-slate-200 rounded-xl h-20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md"
                >
                  {editingPlacement ? 'আপডেট করুন' : 'যুক্ত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
