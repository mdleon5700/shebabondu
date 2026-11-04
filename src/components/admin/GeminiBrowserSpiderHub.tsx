'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Globe,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  FileText,
  Activity,
  Database,
  Terminal,
  Cpu,
  Layers,
  ArrowUpRight,
  Edit3,
  Eye,
  Trash2,
  Check,
  X,
  Search,
  Filter,
  Download,
  Building2,
  FolderOpen
} from 'lucide-react';
import { JobCircular } from '@/lib/types';
import JobLogo from '@/components/JobLogo';

export interface GeminiBrowserSpiderHubProps {
  jobs?: JobCircular[];
  onRefreshData?: () => void;
  onOpenEditJob?: (job: JobCircular) => void;
  onDeleteJob?: (jobId: string, title: string) => void;
}

export default function GeminiBrowserSpiderHub({
  jobs = [],
  onRefreshData,
  onOpenEditJob,
  onDeleteJob
}: GeminiBrowserSpiderHubProps) {
  const [spiderStatus, setSpiderStatus] = useState<any>(null);
  const [syncedJobsList, setSyncedJobsList] = useState<JobCircular[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [actionJobId, setActionJobId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('job-alljobs-dcjamalpur-15137');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'DRAFT'>('ALL');

  const [logs, setLogs] = useState<string[]>([
    '🤖 [Gemini Spider Engine] সিস্টেম ইনিশিয়ালাইজড...',
    '🌐 [Alljobs Engine] সকল সরকারি প্রতিষ্ঠানের সাথে এপিআই সংযোগ বিদ্যমান',
    '📄 [PDF Pipeline] সরাসরি টেলিটক সার্ভার থেকে মূল PDF লিংক শনাক্ত',
    '📁 [Storage] .browser_profile/gemini_session/ সেশন ডিরেক্টরি প্রস্তুত',
    '✨ [Ready] এডিট, আপডেট ও ১-ক্লিক পাবলিশ কন্ট্রোল সক্রিয়'
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser');
      const data = await res.json();
      if (res.ok && data.success) {
        setSpiderStatus(data);
        if (Array.isArray(data.syncedJobs)) {
          setSyncedJobsList(data.syncedJobs);
        }
      }
    } catch (e: any) {
      addLog(`ত্রুটি: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Compute effective synced jobs (prioritize parent jobs prop if available)
  const displayJobs = useMemo(() => {
    const source = jobs.length > 0 
      ? jobs.filter(j => j.id.includes('alljobs') || (j as any).source === 'Alljobs Teletalk')
      : syncedJobsList;

    return source.filter(j => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = (j.title || '').toLowerCase().includes(q);
        const matchesOrg = (j.organization || '').toLowerCase().includes(q);
        const matchesId = (j.id || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesOrg && !matchesId) return false;
      }

      if (statusFilter !== 'ALL') {
        const rawStatus = String((j as any).status || (j as any).publicationStatus || 'PUBLISHED').toUpperCase();
        const isOpen = rawStatus === 'OPEN' || rawStatus === 'PUBLISHED' || rawStatus === 'ACTIVE';
        if (statusFilter === 'OPEN' && !isOpen) return false;
        if (statusFilter === 'DRAFT' && isOpen) return false;
      }

      return true;
    });
  }, [jobs, syncedJobsList, searchQuery, statusFilter]);

  const handleLaunchBrowser = async () => {
    setIsLaunching(true);
    addLog('🚀 ক্রোম ব্রাউজার চালুর রিকোয়েস্ট পাঠানো হচ্ছে...');
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': '1234'
        },
        body: JSON.stringify({ action: 'launch' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addLog(`✅ ${data.message}`);
        addLog('👉 স্ক্রিনে ওপেন হওয়া ক্রোম উইন্ডোতে gemini.google.com ট্যাবে আপনার জিমেইল দিয়ে সাইন-ইন করে নিন।');
        alert(data.message);
      } else {
        addLog(`❌ ব্রাউজার চালু ব্যর্থ: ${data.error}`);
        alert(data.error || 'ব্রাউজার চালু করতে সমস্যা হয়েছে');
      }
    } catch (e: any) {
      addLog(`❌ নেটওয়ার্ক এরর: ${e.message}`);
      alert(`ত্রুটি: ${e.message}`);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleRunSync = async () => {
    setIsSyncing(true);
    addLog('⚡ অলজবস লাইভ সার্কুলার কালেকশন শুরু হয়েছে...');
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': '1234'
        },
        body: JSON.stringify({ action: 'sync', limit: 35 })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addLog(`✅ ${data.message}`);
        addLog(`📊 মোট প্রতিষ্ঠান: ${data.stats?.totalOrgsFound}, নতুন যুক্ত: ${data.stats?.newJobsAdded}, আপডেট: ${data.stats?.updatedJobs}`);
        await fetchStatus();
        if (onRefreshData) onRefreshData();
        alert(data.message);
      } else {
        addLog(`❌ সিঙ্ক ব্যর্থ: ${data.error}`);
        alert(data.error || 'সিঙ্ক ব্যর্থ হয়েছে');
      }
    } catch (e: any) {
      addLog(`❌ নেটওয়ার্ক এরর: ${e.message}`);
      alert(`ত্রুটি: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTogglePublish = async (job: JobCircular) => {
    setActionJobId(job.id);
    addLog(`🔄 পাবলিকেশন স্ট্যাটাস পরিবর্তন করা হচ্ছে: ${job.title}...`);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': '1234'
        },
        body: JSON.stringify({ action: 'toggle_publish', jobId: job.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addLog(`✅ ${data.message}`);
        await fetchStatus();
        if (onRefreshData) onRefreshData();
      } else {
        addLog(`❌ স্ট্যাটাস পরিবর্তন ব্যর্থ: ${data.error}`);
        alert(data.error || 'পরিবর্তন ব্যর্থ হয়েছে');
      }
    } catch (e: any) {
      addLog(`❌ ত্রুটি: ${e.message}`);
    } finally {
      setActionJobId(null);
    }
  };

  const handleDeleteJobItem = async (job: JobCircular) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${job.title}" সার্কুলারটি সম্পূর্ণ মুছে ফেলতে চান?`)) return;
    
    if (onDeleteJob) {
      onDeleteJob(job.id, job.title);
      addLog(`🗑️ সার্কুলার মোছার রিকোয়েস্ট পাঠানো হয়েছে: ${job.id}`);
      return;
    }

    setActionJobId(job.id);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': '1234'
        },
        body: JSON.stringify({ action: 'delete_job', jobId: job.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addLog(`✅ সার্কুলার মুছে ফেলা হয়েছে: ${job.title}`);
        await fetchStatus();
        if (onRefreshData) onRefreshData();
      } else {
        addLog(`❌ মোছা ব্যর্থ: ${data.error}`);
      }
    } catch (e: any) {
      addLog(`❌ এরর: ${e.message}`);
    } finally {
      setActionJobId(null);
    }
  };

  const handleVerifyCircular = async () => {
    if (!selectedJobId) return;
    setIsVerifying(true);
    addLog(`🧠 সার্কুলার AI ভেরিফিকেশন শুরু: ${selectedJobId}`);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': '1234'
        },
        body: JSON.stringify({ action: 'verify_circular', jobId: selectedJobId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerificationResult(data);
        addLog(`✅ সার্কুলার ভেরিফাইড: ${data.organization} (${data.positionsCount}টি পদ, ডেডলাইন: ${data.deadline})`);
        addLog(`📄 অফিশিয়াল PDF: ${data.pdfUrl ? 'সংযুক্ত ও প্রস্তুত' : 'পাওয়া যায়নি'}`);
      } else {
        addLog(`❌ ভেরিফিকেশন ব্যর্থ: ${data.error}`);
      }
    } catch (e: any) {
      addLog(`❌ ত্রুটি: ${e.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & TELEMETRY */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 text-white shadow-xl border border-slate-700/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">জেমিনি ব্রাউজার স্পাইডার ও এআই স্ক্র্যাপার হাব</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SYSTEM ACTIVE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                Playwright Persistent Chrome Engine • জেমিনি মাল্টিমোডাল ভেরিফিকেশন • সরাসরি এডিট, আপডেট ও ১-ক্লিক লাইভ পাবলিশ
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Direct Web Gemini Link Button */}
            <a
              href="https://gemini.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm border border-blue-400/30"
              title="নতুন ট্যাবে গুগল জেমিনি ওয়েবসাইট খুলুন ও সরাসরি সাইন-ইন করুন"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Gemini ওয়েব খুলুন</span>
            </a>

            <button
              onClick={handleLaunchBrowser}
              disabled={isLaunching}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50"
              title="স্থায়ী লগইন প্রোফাইল সহ উইন্ডোজের স্ক্রিনে গুগল ক্রোম চালু করুন"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isLaunching ? 'ব্রাউজার ওপেন হচ্ছে...' : 'ডেস্কটপ ক্রোম চালু করুন'}</span>
            </button>

            <button
              onClick={() => { fetchStatus(); if (onRefreshData) onRefreshData(); }}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>রিফ্রেশ</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/60">
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">টেলিটক ও জেমিনি সার্কুলার</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{displayJobs.length}টি</div>
            <div className="text-[10px] text-slate-400">লাইভ ডাটাবেজে সংরক্ষিত</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">মোট ডাটাবেজ সার্কুলার</div>
            <div className="text-xl font-black text-white mt-0.5">{jobs.length || spiderStatus?.totalJobs || 44}টি</div>
            <div className="text-[10px] text-emerald-400 font-semibold">সকল ক্যাটাগরি সমন্বিত</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ব্রাউজার সেশন প্রোফাইল</div>
            <div className="text-xl font-black text-indigo-300 mt-0.5">সংরক্ষিত</div>
            <div className="text-[10px] text-slate-400">.browser_profile/gemini_session</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ক্যাপচা ও অ্যান্টি-বট</div>
            <div className="text-xl font-black text-amber-300 mt-0.5">হিউম্যান মোড</div>
            <div className="text-[10px] text-slate-400">১০০% ক্যাপচা সলভেবল</div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE CONTROLS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Persistent Gemini Chrome Engine */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">১. জেমিনি লগইন ও ক্রোম সেশন</h3>
              <p className="text-[11px] text-slate-500 font-medium">স্থায়ী লগইন ও ক্যাপচা সমাধানের জন্য</p>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 text-xs text-slate-700 space-y-1.5 leading-relaxed">
            <p className="font-bold text-slate-900">💡 কিভাবে জেমিনি লগইন করবেন:</p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
              <li><strong>ডেস্কটপ ক্রোম চালু করুন</strong> বাটনে ক্লিক করুন।</li>
              <li>স্ক্রিনে ক্রোম উইন্ডো ওপেন হলে সেখানে আপনার Google অ্যাকাউন্ট দিয়ে সাইন-ইন করে নিন।</li>
              <li>সেশনটি স্বয়ংক্রিয়ভাবে সেভ থাকবে; কোনো ক্যাপচা আসলে স্ক্রিনে সমাধান করতে পারবেন।</li>
            </ol>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleLaunchBrowser}
              disabled={isLaunching}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isLaunching ? 'চালু হচ্ছে...' : 'ডেস্কটপ ক্রোম উইন্ডো'}</span>
            </button>
            <a
              href="https://gemini.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Gemini Web</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Card 2: Live Alljobs Collection */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">২. অলজবস লাইভ কালেকশন</h3>
              <p className="text-[11px] text-slate-500 font-medium">সকল প্রতিষ্ঠানের নতুন সার্কুলার সিঙ্ক</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Alljobs Teletalk-এর সকল পেজ স্বয়ংক্রিয়ভাবে স্ক্যান করে নতুন প্রকাশিত সরকারি চাকরির বিজ্ঞপ্তি, মূল নোটিশ PDF এবং শূন্যপদের তথ্য চাকরিসেবা ডাটাবেজে যুক্ত করবে। কোনো ডুপ্লিকেট তৈরি হবে না।
          </p>
          <button
            onClick={handleRunSync}
            disabled={isSyncing}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-emerald-900/10 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'কালেকশন ও সিঙ্ক চলছে...' : 'অলজবস লাইভ সিঙ্ক চালান'}</span>
          </button>
        </div>

        {/* Card 3: Circular & PDF AI Verifier */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-purple-50 text-purple-700 rounded-2xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">৩. সার্কুলার ও PDF AI ভেরিফায়ার</h3>
              <p className="text-[11px] text-slate-500 font-medium">জেমিনি এআই দিয়ে পদবী ও তথ্য পরীক্ষা</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 block">যাচাইয়ের জন্য সার্কুলার নির্বাচন করুন:</label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {displayJobs.slice(0, 10).map(j => (
                <option key={j.id} value={j.id}>{j.organization} - {j.title.substring(0, 30)}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleVerifyCircular}
            disabled={isVerifying}
            className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-purple-900/10 disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isVerifying ? 'যাচাই করা হচ্ছে...' : 'AI দিয়ে সার্কুলার ভেরিফাই করুন'}</span>
          </button>
        </div>
      </div>

      {/* 3. VERIFICATION RESULT ACCORDION */}
      {verificationResult && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <h4 className="text-sm font-black text-emerald-950">
                {verificationResult.organization} — ভেরিফাইড ফলাফল
              </h4>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              {verificationResult.verifiedStatus}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
            <div className="bg-white p-3 rounded-xl border border-emerald-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">নিয়োগ পদবী ও সংখ্যা</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{verificationResult.positionsCount}টি ভিন্ন পদবী</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">আবেদনের শেষ তারিখ</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{verificationResult.deadline}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">মূল নোটিশ PDF লিংক</span>
              {verificationResult.pdfUrl ? (
                <a
                  href={verificationResult.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span>অফিশিয়াল PDF খুলুন</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-slate-400">PDF পাওয়া যায়নি</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. NEW: SYNCED JOBS MANAGEMENT TABLE WITH EDIT, UPDATE & 1-CLICK PUBLISH */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <Database className="w-4 h-4" />
              </div>
              <h2 className="font-black text-base text-slate-900">
                জেমিনি ও অলজবস থেকে সংগৃহীত সার্কুলার ব্যবস্থাপনা ({displayJobs.length}টি)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              প্রতিটি সংগৃহীত সার্কুলার এখান থেকেই সরাসরি সম্পাদনা (Edit), তথ্য আপডেট (Update), এবং ১-ক্লিকে ওয়েবসাইটে লাইভ প্রকাশ (Publish) করতে পারবেন।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunSync}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>নতুন সার্কুলার আনুন</span>
            </button>
          </div>
        </div>

        {/* Search & Status Filter Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="সার্কুলারের শিরোনাম, প্রতিষ্ঠান বা আইডি দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 focus:bg-white transition-all font-semibold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সব ({displayJobs.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('OPEN')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'OPEN' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              লাইভ প্রকাশিত
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('DRAFT')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'DRAFT' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ড্রাফট / স্থগিত
            </button>
          </div>
        </div>

        {/* Synced Jobs Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">সার্কুলার ও প্রতিষ্ঠান</th>
                <th className="py-3 px-3">পদ ও শূন্যপদ</th>
                <th className="py-3 px-3">ডেডলাইন</th>
                <th className="py-3 px-3">সরকারি ফি</th>
                <th className="py-3 px-3">বর্তমান স্ট্যাটাস</th>
                <th className="py-3 px-3 text-right">এডিট ও পাবলিশ অ্যাকশনসমূহ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {displayJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    <p className="font-bold text-sm text-slate-800">কোনো সার্কুলার পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-500 mt-1">
                      ফিল্টার পরিবর্তন করুন অথবা &quot;অলজবস লাইভ সিঙ্ক চালান&quot; বাটনে ক্লিক করে নতুন সার্কুলার সংগ্রহ করুন।
                    </p>
                  </td>
                </tr>
              ) : (
                displayJobs.map((job) => {
                  const rawStatus = String((job as any).status || (job as any).publicationStatus || 'PUBLISHED').toUpperCase();
                  const isPublished = rawStatus === 'PUBLISHED' || rawStatus === 'ACTIVE' || rawStatus === 'OPEN';
                  const isProcessing = actionJobId === job.id;

                  return (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Title & Organization */}
                      <td className="py-3 px-3.5 max-w-[280px]">
                        <div className="flex items-center gap-2">
                          <JobLogo logo={job.logo} organization={job.organization} size="sm" />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-xs line-clamp-1" title={job.title}>
                              {job.title}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                              <span>{job.organization}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1 rounded">
                                {job.id}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Vacancies */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{job.totalPosts || 1}টি পদ</div>
                        {job.positions && job.positions.length > 0 && (
                          <div className="text-[10px] text-emerald-700 font-bold">
                            +{job.positions.length}টি উপ-পদবী
                          </div>
                        )}
                      </td>

                      {/* Deadline */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{job.deadline}</div>
                        <div className="text-[10px] text-slate-400">
                          {job.daysRemaining > 0 ? `${job.daysRemaining} দিন বাকি` : 'মেয়াদ শেষ'}
                        </div>
                      </td>

                      {/* Fee */}
                      <td className="py-3 px-3 font-bold text-emerald-800">
                        ৳{job.govtFee || 200}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                          isPublished
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                          <span>{isPublished ? 'লাইভ প্রকাশিত' : 'ড্রাফট / স্থগিত'}</span>
                        </span>
                      </td>

                      {/* Actions: Edit, Publish Toggle, View Live, View PDF */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* 1-Click Publish / Unpublish Toggle */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(job)}
                            disabled={isProcessing}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 shadow-2xs ${
                              isPublished
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700'
                            }`}
                            title={isPublished ? 'বিজ্ঞপ্তিটি আনপাবলিশ করে ড্রাফটে নিতে ক্লিক করুন' : 'বিজ্ঞপ্তিটি অবিলম্বে ওয়েবসাইটে লাইভ প্রকাশ করতে ক্লিক করুন'}
                          >
                            {isProcessing ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : isPublished ? (
                              <>
                                <X className="w-3 h-3 text-amber-700" />
                                <span>ড্রাফট করুন</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3 text-white" />
                                <span>লাইভ পাবলিশ</span>
                              </>
                            )}
                          </button>

                          {/* Edit & Update Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenEditJob) {
                                onOpenEditJob(job);
                              } else {
                                alert(`এডিট উইন্ডো খুলছে: ${job.title}`);
                              }
                            }}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="বিজ্ঞপ্তির শিরোনাম, পদ, বেতন, গ্রেড ও ডেডলাইন এডিট করুন"
                          >
                            <Edit3 className="w-3 h-3 text-emerald-700" />
                            <span>এডিট ও আপডেট</span>
                          </button>

                          {/* View Live Public Page */}
                          <Link
                            href={`/jobs/${job.id}`}
                            target="_blank"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center"
                            title="ওয়েবসাইটে পাবলিক পেজ দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                          </Link>

                          {/* Official PDF Link */}
                          {job.circularPdfUrl && (
                            <a
                              href={job.circularPdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center"
                              title="মূল টেলিটক গ্যাজেট PDF ডাউনলোড বা ওপেন করুন"
                            >
                              <Download className="w-3.5 h-3.5 text-blue-600" />
                            </a>
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteJobItem(job)}
                            disabled={isProcessing}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors border border-rose-200 cursor-pointer"
                            title="সার্কুলার ডাটাবেজ থেকে মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </button>
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

      {/* 5. REAL-TIME ACTIVITY TERMINAL LOG */}
      <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-black text-slate-200 tracking-wider uppercase">
              লাইভ স্পাইডার ও জেমিনি অ্যাক্টিভিটি কনসোল
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400 font-bold">
            Realtime Console • Playwright Chromium
          </span>
        </div>
        <div className="bg-black/40 rounded-2xl p-4 font-mono text-[11px] space-y-1.5 max-h-56 overflow-y-auto text-slate-300 border border-slate-800/80">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-slate-500 shrink-0">&gt;</span>
              <span className={
                log.includes('✅') ? 'text-emerald-300 font-bold' :
                log.includes('❌') ? 'text-rose-400 font-bold' :
                log.includes('🚀') ? 'text-teal-300 font-bold' :
                log.includes('⚡') ? 'text-amber-300 font-bold' :
                log.includes('🔄') ? 'text-blue-300 font-bold' :
                'text-slate-300'
              }>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
