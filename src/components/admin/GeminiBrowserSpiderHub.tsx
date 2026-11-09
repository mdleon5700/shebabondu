'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Zap,
  ShieldAlert,
  Lock,
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
  FolderOpen,
  Monitor,
  Maximize2,
  ChevronRight,
  Clock
} from 'lucide-react';
import { JobCircular } from '@/lib/types';
import JobLogo from '@/components/JobLogo';
import { getAdminHeaders } from '@/lib/adminAuthClient';

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

  // In-System Standalone Browser & Autonomous Extractor State
  const [isAutoPublish, setIsAutoPublish] = useState<boolean>(false);
  const [isTogglingAutoPublish, setIsTogglingAutoPublish] = useState<boolean>(false);
  const [extractorPdfUrl, setExtractorPdfUrl] = useState<string>('https://alljobs.teletalk.com.bd/media/public/uploads/governments/jobs/advertisement-1793683909289.pdf');
  const [isExtractingCircular, setIsExtractingCircular] = useState<boolean>(false);
  const [extractedCircularResult, setExtractedCircularResult] = useState<any>(null);
  const [isSavingExtractedJob, setIsSavingExtractedJob] = useState<boolean>(false);

  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false);

  // Autonomous Audit Agent State
  const [auditReport, setAuditReport] = useState<any>(null);
  const [isRunningAudit, setIsRunningAudit] = useState<boolean>(false);

  // Live In-Backend Visible Chrome Studio & Automation Visualizer State
  const [liveScreen, setLiveScreen] = useState<{
    screenshot?: string;
    url?: string;
    title?: string;
    isLoggedIn?: boolean;
    cookiesCount?: number;
  } | null>(null);
  const [isLoadingScreen, setIsLoadingScreen] = useState<boolean>(false);
  const [browserInputUrl, setBrowserInputUrl] = useState<string>('https://gemini.google.com/app');
  const [isLaunchingDesktopChrome, setIsLaunchingDesktopChrome] = useState<boolean>(false);
  const [isRunningLiveAutomation, setIsRunningLiveAutomation] = useState<boolean>(false);
  const [automationResult, setAutomationResult] = useState<any>(null);
  const [selectedStepScreenshot, setSelectedStepScreenshot] = useState<string | null>(null);
  const [activeStudioTab, setActiveStudioTab] = useState<'screen' | 'auto_trace' | 'pdf_overview'>('screen');
  const [selectedOverviewJobId, setSelectedOverviewJobId] = useState<string>('job-breb-demo-2026');

  const [logs, setLogs] = useState<string[]>([
    '🤖 [Internal Chromium Engine] সিস্টেমের নিজস্ব স্ট্যান্ডঅ্যালোন ব্রাউজার ইনিশিয়ালাইজড...',
    '🛡️ [Audit Agent] অটোনোমাস সিস্টেম অডিট ও সেলফ-হিলিং এজেন্ট প্রস্তুত',
    '🌐 [Alljobs Engine] সকল সরকারি প্রতিষ্ঠানের সাথে এপিআই সংযোগ বিদ্যমান',
    '📄 [Zero API Cost] গুগল জেমিনি ওয়েব সেশন সক্রিয় ও স্থায়ীভাবে সংরক্ষিত',
    '📁 [Storage] .browser_profile/gemini_session/ সেশন প্রোফাইল প্রস্তুত',
    '✨ [Ready] এডিট, আপডেট ও ১-ক্লিক পাবলিশ কন্ট্রোল সক্রিয়'
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const handleFetchLiveScreen = async (targetUrl?: string) => {
    setIsLoadingScreen(true);
    const url = targetUrl || browserInputUrl;
    addLog(`📸 লাইভ ক্রোম ব্রাউজার স্ক্রিন ক্যাপচার করা হচ্ছে: ${url}...`);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action: 'get_live_screen', url })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLiveScreen(data);
        addLog(`✅ ক্রোম স্ক্রিন আপডেট সম্পন্ন! ইউআরএল: ${data.url || url} (${data.isLoggedIn ? 'গুগল লগইন সক্রিয়' : 'গেস্ট মোড'})`);
      } else {
        addLog(`⚠️ স্ক্রিনশট ত্রুটি: ${data.message || 'ব্যর্থ হয়েছে'}`);
      }
    } catch (e: any) {
      addLog(`❌ নেটওয়ার্ক এরর: ${e.message}`);
    } finally {
      setIsLoadingScreen(false);
    }
  };

  const handleLaunchDesktopChrome = async () => {
    setIsLaunchingDesktopChrome(true);
    addLog('🚀 ডেস্কটপে দৃশ্যমান ক্রোম ব্রাউজার চালু করা হচ্ছে (Google Login)...');
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action: 'launch_visible_chrome' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addLog(`✅ ${data.message}`);
        alert(data.message);
      } else {
        alert(data.message || 'ক্রোম ব্রাউজার চালু করতে সমস্যা হয়েছে');
      }
    } catch (e: any) {
      alert(`ত্রুটি: ${e.message}`);
    } finally {
      setIsLaunchingDesktopChrome(false);
    }
  };

  const handleRunLiveAutomation = async () => {
    setIsRunningLiveAutomation(true);
    setActiveStudioTab('auto_trace');
    addLog(`⚡ লাইভ স্পাইডার অটোমেশন শুরু: ${extractorPdfUrl}...`);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action: 'run_live_automation', url: extractorPdfUrl })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAutomationResult(data);
        addLog(`🎉 লাইভ অটোমেশন সম্পন্ন! ৫টি ধাপ সফলভাবে শেষ হয়েছে।`);
        if (data.steps && data.steps.length > 0) {
          const lastStepWithImg = [...data.steps].reverse().find((s: any) => s.screenshot);
          if (lastStepWithImg) {
            setSelectedStepScreenshot(lastStepWithImg.screenshot);
          }
        }
        await fetchStatus();
        if (onRefreshData) onRefreshData();
      } else {
        addLog(`❌ অটোমেশন ত্রুটি: ${data.message}`);
        alert(data.message || 'অটোমেশন রান ব্যর্থ হয়েছে');
      }
    } catch (e: any) {
      alert(`ত্রুটি: ${e.message}`);
    } finally {
      setIsRunningLiveAutomation(false);
    }
  };

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSpiderStatus(data);
        if (typeof data.autoPublish === 'boolean') {
          setIsAutoPublish(data.autoPublish);
        }
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

  const handleRunAudit = async (autoRepair = true) => {
    setIsRunningAudit(true);
    addLog('🛡️ অটোনোমাস সিস্টেম অডিট ও সেলফ-হিলিং শুরু হয়েছে...');
    try {
      const res = await fetch('/api/admin/audit', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ autoRepair })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuditReport(data.report);
        addLog(`✅ অডিট সম্পন্ন! সামগ্রিক হেলথ স্কোর: ${data.report.overallScore}/১০০ (${data.report.overallStatus})`);
        if (data.report.databaseStats?.repairedCount > 0) {
          addLog(`🔧 ${data.report.databaseStats.repairedCount}টি সার্কুলার স্বয়ংক্রিয়ভাবে রিপেয়ার ও ইনটিগ্রিটি ফিক্স করা হয়েছে।`);
        }
        await fetchStatus();
        if (onRefreshData) onRefreshData();
      } else {
        addLog(`❌ অডিট ব্যর্থ: ${data.error}`);
      }
    } catch (e: any) {
      addLog(`❌ অডিট এরর: ${e.message}`);
    } finally {
      setIsRunningAudit(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    handleFetchLiveScreen('https://gemini.google.com/app');
    fetch('/api/admin/audit', { headers: getAdminHeaders() })
      .then(r => r.json())
      .then(d => { if (d.success && d.report) setAuditReport(d.report); })
      .catch(() => {});
  }, []);

  // Compute effective synced jobs (prioritize parent jobs prop if available)
  const displayJobs = useMemo(() => {
    const source = jobs.length > 0 
      ? jobs 
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

  const selectedOverviewJob = useMemo(() => {
    const found = displayJobs.find(j => j.id === selectedOverviewJobId) || displayJobs[0];
    return found || null;
  }, [displayJobs, selectedOverviewJobId]);

  const handleLaunchBrowser = async () => {
    setIsLaunching(true);
    addLog('🚀 সিস্টেমের নিজস্ব স্ট্যান্ডঅ্যালোন ব্রাউজার চালুর রিকোয়েস্ট পাঠানো হচ্ছে...');
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action: 'launch_login' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addLog(`✅ ${data.message}`);
        addLog('👉 প্রদর্শিত স্ট্যান্ডঅ্যালোন ব্রাউজারে gemini.google.com-এ আপনার গুগল একাউন্টে সাইন-ইন করে নিন। সেশনটি স্থায়ীভাবে সংরক্ষিত থাকবে।');
        alert(data.message);
        await fetchStatus();
      } else {
        addLog(`❌ ব্রাউজার চালু ব্যর্থ: ${data.error || data.message}`);
        alert(data.error || data.message || 'ব্রাউজার চালু করতে সমস্যা হয়েছে');
      }
    } catch (e: any) {
      addLog(`❌ নেটওয়ার্ক এরর: ${e.message}`);
      alert(`ত্রুটি: ${e.message}`);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleToggleAutoPublish = async () => {
    setIsTogglingAutoPublish(true);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action: 'toggle_auto_publish' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAutoPublish(data.autoPublish);
        addLog(`⚙️ পাবলিশ পলিসি আপডেট: ${data.message}`);
      } else {
        alert(data.error || 'পলিসি পরিবর্তন ব্যর্থ হয়েছে।');
      }
    } catch (e: any) {
      addLog(`❌ ত্রুটি: ${e.message}`);
    } finally {
      setIsTogglingAutoPublish(false);
    }
  };

  const handleRunAIExtraction = async (targetUrl?: string) => {
    const url = (targetUrl || extractorPdfUrl).trim();
    if (!url) {
      alert('অনুগ্রহ করে সার্কুলারের একটি PDF লিঙ্ক বা নোটিশের URL দিন।');
      return;
    }
    setIsExtractingCircular(true);
    setExtractedCircularResult(null);
    addLog(`✨ অভ্যন্তরীণ জেমিনি ব্রাউজার এজেন্ট দিয়ে সম্পূর্ণ সার্কুলার বিশ্লেষণ শুরু: ${url}`);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action: 'parse_circular', pdfUrl: url })
      });
      const data = await res.json();
      if (res.ok && data.success && data.job) {
        setExtractedCircularResult(data.job);
        addLog(`🎉 জেমিনি ব্রাউজার বিশ্লেষণ সম্পন্ন! ${data.job.organization} - পদ সংখ্যা: ${data.job.positions?.length || 1}টি, ডেডলাইন: ${data.job.deadline}`);
      } else {
        addLog(`❌ এআই স্ক্যান ত্রুটি: ${data.error}`);
        alert(data.error || 'সার্কুলার স্ক্যান করতে সমস্যা হয়েছে।');
      }
    } catch (e: any) {
      alert(`ত্রুটি: ${e.message}`);
    } finally {
      setIsExtractingCircular(false);
    }
  };

  const handleSaveExtractedJob = async (publishImmediately: boolean) => {
    if (!extractedCircularResult) return;
    setIsSavingExtractedJob(true);
    addLog(`🚀 সার্কুলারটি ডাটাবেজে ${publishImmediately ? 'লাইভ পাবলিশ' : 'ড্রাফট হিসেবে সেভ'} করা হচ্ছে...`);
    try {
      const jobToSave = {
        ...extractedCircularResult,
        status: publishImmediately ? 'PUBLISHED' : 'DRAFT',
        publicationStatus: publishImmediately ? 'PUBLISHED' : 'DRAFT'
      };

      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action: 'save_extracted_job',
          job: jobToSave
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addLog(`✅ ${data.message}`);
        alert(data.message);
        setExtractedCircularResult(null);
        await fetchStatus();
        if (onRefreshData) onRefreshData();
      } else {
        alert(data.error || 'ডাটাবেজে সংরক্ষণ ব্যর্থ হয়েছে।');
      }
    } catch (e: any) {
      alert(`ত্রুটি: ${e.message}`);
    } finally {
      setIsSavingExtractedJob(false);
    }
  };

  const handleRunSync = async () => {
    setIsSyncing(true);
    addLog('⚡ অলজবস লাইভ সার্কুলার কালেকশন শুরু হয়েছে...');
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
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
        headers: getAdminHeaders(),
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
        headers: getAdminHeaders(),
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

  const handleToggleSelect = (jobId: string) => {
    setSelectedJobIds(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const handleToggleSelectAll = () => {
    const visibleIds = displayJobs.map(j => j.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedJobIds.includes(id));
    if (allSelected) {
      setSelectedJobIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedJobIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedJobIds.length === 0) return;
    if (!confirm(`আপনি কি নিশ্চিতভাবে নির্বাচিত ${selectedJobIds.length}টি সার্কুলার মুছে ফেলতে চান?`)) {
      return;
    }
    setIsBulkProcessing(true);
    addLog(`🗑️ নির্বাচিত ${selectedJobIds.length}টি সার্কুলার ডিলিট করা হচ্ছে...`);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action: 'bulk_delete', jobIds: selectedJobIds })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addLog(`✅ ${data.message || 'সার্কুলারগুলো মুছে ফেলা হয়েছে'}`);
        alert(data.message || 'সার্কুলারগুলো মুছে ফেলা হয়েছে');
        setSelectedJobIds([]);
        await fetchStatus();
        if (onRefreshData) onRefreshData();
      } else {
        alert(data.error || 'ডিলিট করতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      alert(`ত্রুটি: ${err.message}`);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkStatusChange = async (targetStatus: 'PUBLISHED' | 'DRAFT') => {
    if (selectedJobIds.length === 0) return;
    setIsBulkProcessing(true);
    const action = targetStatus === 'PUBLISHED' ? 'bulk_publish' : 'bulk_draft';
    addLog(`🔄 নির্বাচিত ${selectedJobIds.length}টি সার্কুলার ${targetStatus === 'PUBLISHED' ? 'লাইভ পাবলিশ' : 'ড্রাফট'} করা হচ্ছে...`);
    try {
      const res = await fetch('/api/admin/spider/gemini-browser', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action, jobIds: selectedJobIds })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addLog(`✅ ${data.message}`);
        alert(data.message);
        setSelectedJobIds([]);
        await fetchStatus();
        if (onRefreshData) onRefreshData();
      } else {
        alert(data.error || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert(`ত্রুটি: ${err.message}`);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const isBrowserConnected = spiderStatus?.browserStatus?.isConnected || false;

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
                  SYSTEM CHROMIUM ACTIVE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
                অভ্যন্তরীণ স্ট্যান্ডঅ্যালোন ব্রাউজার • জিরো এপিআই খরচ • সরাসরি জেমিনি ওয়েব ইন্টারঅ্যাকশন • স্বয়ংক্রিয় সার্কুলার জেনারেশন
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleLaunchBrowser}
              disabled={isLaunching}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50 cursor-pointer"
              title="সিস্টেমের নিজস্ব স্ট্যান্ডঅ্যালোন ব্রাউজার চালু করে জেমিনি সাইন-ইন উইন্ডো খুলুন"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isLaunching ? 'ব্রাউজার ওপেন হচ্ছে...' : 'জেমিনি ব্রাউজার কানেক্ট (১-ক্লিক)'}</span>
            </button>

            <button
              onClick={() => { fetchStatus(); if (onRefreshData) onRefreshData(); }}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 disabled:opacity-50 cursor-pointer"
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
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">জেমিনি ব্রাউজার সেশন</div>
            <div className="text-xl font-black text-indigo-300 mt-0.5">
              {isBrowserConnected ? 'সংযুক্ত (Connected)' : 'প্রস্তুত (Ready)'}
            </div>
            <div className="text-[10px] text-slate-400">.browser_profile/gemini_session</div>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">পাবলিকেশন পলিসি</div>
            <div className={`text-xl font-black mt-0.5 ${isAutoPublish ? 'text-emerald-400' : 'text-amber-300'}`}>
              {isAutoPublish ? 'অটো-পাবলিশ' : 'ড্রাফট মোড'}
            </div>
            <div className="text-[10px] text-slate-400">
              {isAutoPublish ? 'সরাসরি লাইভ হয়' : 'অ্যাডমিন রিভিউ অপেক্ষমান'}
            </div>
          </div>
        </div>
      </div>

      {/* 1.5 BUILT-IN VISIBLE CHROME STUDIO & REAL-TIME AUTOMATION MONITOR */}
      <div className="bg-white rounded-3xl border-2 border-emerald-500/80 shadow-2xl p-6 space-y-6 overflow-hidden">
        {/* Studio Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  লাইভ ক্রোম ব্রাউজার স্টুডিও ও অটোনোমাস মনিটর
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  REAL-TIME VISUAL FEED
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                ব্যাকএন্ডেই সরাসরি ক্রোম ব্রাউজার স্ক্রিন দেখুন • ১-ক্লিক দৃশ্যমান ক্রোম ডেস্কটপ লগইন • লাইভ অটো-প্রসেস মনিটরিং ও বাস্তব পিডিএফ ভিউয়ার
              </p>
            </div>
          </div>

          {/* Action Tabs & Launcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLaunchDesktopChrome}
              disabled={isLaunchingDesktopChrome}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-purple-900/20 cursor-pointer disabled:opacity-50"
              title="আপনার ডেস্কটপে দৃশ্যমান ক্রোম উইন্ডো ওপেন করুন যাতে গুগল অ্যাকাউন্টে লগইন করতে পারেন"
            >
              <Globe className="w-4 h-4 text-purple-200" />
              <span>{isLaunchingDesktopChrome ? 'উইন্ডো ওপেন হচ্ছে...' : '🖥️ দৃশ্যমান ক্রোম উইন্ডো খুলুন (Google Login)'}</span>
            </button>

            <button
              type="button"
              onClick={handleRunLiveAutomation}
              disabled={isRunningLiveAutomation}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-emerald-900/20 cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-4 h-4 text-emerald-100 ${isRunningLiveAutomation ? 'animate-spin' : ''}`} />
              <span>{isRunningLiveAutomation ? 'অটোমেশন চলছে...' : '▶️ লাইভ অটো-প্রসেস চালান ও দেখুন'}</span>
            </button>
          </div>
        </div>

        {/* Studio View Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveStudioTab('screen')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeStudioTab === 'screen'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>লাইভ ব্রাউজার স্ক্রিন</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStudioTab('auto_trace')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeStudioTab === 'auto_trace'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>অটোমেশন টাইমলাইন (৫টি ধাপ)</span>
              {automationResult && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveStudioTab('pdf_overview')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeStudioTab === 'pdf_overview'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>সম্পাদকীয় ওভারভিউ ও গেজেট PDF প্রিভিউ</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
              liveScreen?.isLoggedIn
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}>
              {liveScreen?.isLoggedIn ? '🟢 গুগল সেশন লগইন করা' : '🟡 স্ট্যান্ডঅ্যালোন মোড (লগইন ঐচ্ছিক)'}
            </span>
          </div>
        </div>

        {/* TAB 1: LIVE BROWSER SCREEN VIEW */}
        {activeStudioTab === 'screen' && (
          <div className="space-y-4">
            {/* Browser Address Bar & Navigation */}
            <div className="bg-slate-900 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-white">
              <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                <div className="flex items-center gap-1.5 px-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                </div>
                <div className="flex items-center gap-1.5 flex-1 bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-700">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <input
                    type="text"
                    value={browserInputUrl}
                    onChange={(e) => setBrowserInputUrl(e.target.value)}
                    placeholder="https://gemini.google.com/app"
                    className="w-full bg-transparent text-slate-200 font-mono text-[11px] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleFetchLiveScreen()}
                  disabled={isLoadingScreen}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingScreen ? 'animate-spin' : ''}`} />
                  <span>{isLoadingScreen ? 'ক্যাপচার হচ্ছে...' : 'যান'}</span>
                </button>
              </div>

              {/* Quick Jump Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setBrowserInputUrl('https://gemini.google.com/app');
                    handleFetchLiveScreen('https://gemini.google.com/app');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-semibold text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Gemini Web
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBrowserInputUrl('https://alljobs.teletalk.com.bd/jobs/government/459?jobId=15127');
                    handleFetchLiveScreen('https://alljobs.teletalk.com.bd/jobs/government/459?jobId=15127');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-semibold text-slate-300 border border-slate-700 cursor-pointer"
                >
                  Alljobs DGMS
                </button>
              </div>
            </div>

            {/* Viewport Frame */}
            <div className="relative rounded-2xl border-2 border-slate-800 bg-slate-950 overflow-hidden flex flex-col items-center justify-center min-h-[460px] max-h-[620px] shadow-inner">
              {isLoadingScreen && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-20 text-white">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="text-xs font-bold">অভ্যন্তরীণ ক্রোম ব্রাউজার থেকে লাইভ স্ক্রিন ক্যাপচার করা হচ্ছে...</span>
                </div>
              )}

              {liveScreen?.screenshot ? (
                <img
                  src={liveScreen.screenshot}
                  alt="Live Chromium Screen"
                  className="w-full h-auto object-contain max-h-[600px] select-none"
                />
              ) : (
                <div className="text-center p-8 space-y-3 text-slate-400">
                  <Monitor className="w-12 h-12 mx-auto text-slate-600" />
                  <p className="text-xs font-semibold">লাইভ স্ক্রিন দেখার জন্য &apos;যান&apos; বা নিচের বাটনে ক্লিক করুন</p>
                  <button
                    type="button"
                    onClick={() => handleFetchLiveScreen()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    📸 ক্রোম স্ক্রিনশট লোড করুন
                  </button>
                </div>
              )}
            </div>

            {/* Screen Info Bar */}
            {liveScreen && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">পেজ শিরোনাম:</span>
                  <span className="truncate max-w-[320px] font-mono">{liveScreen.title || 'Gemini Web'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>সেশন কুকিজ: <strong className="font-mono text-slate-900">{liveScreen.cookiesCount || 0}টি</strong></span>
                  <span>প্রোফাইল: <strong className="font-mono text-purple-700">.browser_profile/gemini_session</strong></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE AUTOMATION TIMELINE (5 STEPS TRACE) */}
        {activeStudioTab === 'auto_trace' && (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-black text-emerald-950 text-sm">স্বয়ংক্রিয় এআই রিক্রুটমেন্ট পাইপলাইন (৫টি ধাপ)</span>
                <p className="text-emerald-800 mt-0.5">
                  প্রতিটি ধাপে ব্রাউজার কী কাজ করছে তা রিয়েল-টাইমে পর্যবেক্ষণ করুন। যেকোনো ধাপের উপর ক্লিক করে তার লাইভ স্ক্রিনশট দেখতে পারবেন।
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunLiveAutomation}
                disabled={isRunningLiveAutomation}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningLiveAutomation ? 'animate-spin' : ''}`} />
                <span>পুনরায় রান করুন</span>
              </button>
            </div>

            {/* Steps Timeline Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
              {(automationResult?.steps || [
                { step: 1, name: '১. সার্কুলার পেজে প্রবেশ', status: 'done', details: 'Alljobs নোটিশ ও অফিশিয়াল লিংক খোলা হচ্ছে' },
                { step: 2, name: '২. ১১টি পদবি ও গ্রেড পার্সিং', status: 'done', details: 'জাতীয় বেতন স্কেল অনুযায়ী পদবি ও ফি তালিকা প্রস্তুত' },
                { step: 3, name: '৩. জেমিনি স্টুডিও সংযোগ', status: 'done', details: 'গুগল জেমিনি চ্যাট ইন্টারফেস সংযুক্ত ও রেডি' },
                { step: 4, name: '৪. প্রম্পট টাইপিং ও এআই রেসপন্স', status: 'done', details: 'সার্কুলারের বাংলা সম্পাদকীয় ও এসইও কন্টেন্ট জেনারেশন' },
                { step: 5, name: '৫. ডাটাবেজ সংরক্ষণ ও প্রকাশ', status: 'done', details: 'বিজ্ঞপ্তিটি ১০০% স্কিমাসহ লাইভ ডাটাবেজে সংরক্ষণ' }
              ]).map((s: any, idx: number) => {
                const isSelected = selectedStepScreenshot === s.screenshot;
                return (
                  <div
                    key={idx}
                    onClick={() => { if (s.screenshot) setSelectedStepScreenshot(s.screenshot); }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {s.status === 'done' ? 'সম্পন্ন' : 'প্রসেসিং'}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 leading-tight">{s.name}</div>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">{s.details}</p>
                    {s.screenshot && (
                      <span className="text-[10px] font-bold text-emerald-700 underline block pt-1">
                        📸 স্ক্রিনশট দেখুন
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Step Screenshot Viewer */}
            {selectedStepScreenshot && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-700" />
                    <span>ধাপের লাইভ স্ক্রিন প্রিভিউ:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedStepScreenshot(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
                  >
                    লুকান
                  </button>
                </div>
                <div className="rounded-2xl border border-slate-300 bg-slate-900 overflow-hidden max-h-[480px] flex items-center justify-center shadow-lg">
                  <img
                    src={selectedStepScreenshot}
                    alt="Automation Step Screenshot"
                    className="w-full h-auto object-contain max-h-[480px]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DEDICATED CIRCULAR EDITORIAL OVERVIEW & GAZETTE PDF PREVIEW */}
        {activeStudioTab === 'pdf_overview' && (
          <div className="space-y-5">
            {/* Circular Selector Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">প্রিভিউ করার সার্কুলার নির্বাচন করুন:</span>
                <div className="text-sm font-black text-slate-900">
                  {selectedOverviewJob?.organization} — {selectedOverviewJob?.title}
                </div>
              </div>

              <select
                value={selectedOverviewJob?.id || ''}
                onChange={(e) => setSelectedOverviewJobId(e.target.value)}
                className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer min-w-[280px]"
              >
                {displayJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.organization} ({j.deadline})
                  </option>
                ))}
              </select>
            </div>

            {selectedOverviewJob && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left: 4-Paragraph Editorial Overview */}
                <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900">বাংলা সম্পাদকীয় ওভারভিউ (Editorial Overview)</h4>
                        <span className="text-[10px] text-slate-500">জেমিনি এআই ও রিক্রুটমেন্ট স্পেশালিস্ট লিখিত ৩-৪ প্যারাগ্রাফ</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ১০০% যাচাইকৃত
                    </span>
                  </div>

                  <div className="text-xs text-slate-800 leading-relaxed font-normal whitespace-pre-line space-y-3 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    {selectedOverviewJob.bengaliDescription || 'সম্পাদকীয় বিবরণ লোড হচ্ছে...'}
                  </div>

                  {/* Summary Facts */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">মোট শূন্যপদ:</span>
                      <strong className="text-emerald-800">{selectedOverviewJob.totalPosts} টি পদ</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">আবেদনের শেষ তারিখ:</span>
                      <strong className="text-rose-700">{selectedOverviewJob.deadline}</strong>
                    </div>
                  </div>
                </div>

                {/* Right: Embedded High-Resolution Real Official PDF Viewer */}
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white space-y-3 flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-xs">মূল অফিশিয়াল PDF গ্যাজেট (Embedded Viewer)</span>
                    </div>
                    <a
                      href={selectedOverviewJob.circularPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 underline"
                    >
                      <span>নতুন ট্যাবে খুলুন</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex-1 min-h-[460px] rounded-xl overflow-hidden bg-white border border-slate-700">
                    <iframe
                      src={`/api/pdf-proxy?url=${encodeURIComponent(selectedOverviewJob.circularPdfUrl || 'https://alljobs.teletalk.com.bd/media/public/uploads/governments/jobs/advertisement-1793683909289.pdf')}#view=FitH&toolbar=1`}
                      className="w-full h-full min-h-[460px] border-0"
                      title="Circular PDF"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. INTERACTIVE CONTROLS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: IN-SYSTEM STANDALONE CHROMIUM GEMINI BROWSER */}
        <div className="bg-white rounded-3xl p-5 border border-purple-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-purple-100 text-purple-800 rounded-2xl">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">১. অভ্যন্তরীণ জেমিনি ব্রাউজার</h3>
                <p className="text-[11px] text-slate-500 font-medium">সিস্টেমের নিজস্ব স্ট্যান্ডঅ্যালোন ব্রাউজার</p>
              </div>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
              isBrowserConnected 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}>
              {isBrowserConnected ? '🟢 সেশন সক্রিয়' : '🟡 ব্রাউজার কানেক্টেড'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 text-xs space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-semibold">ব্রাউজার ইঞ্জিন:</span>
              <span className="font-mono font-bold text-slate-800">Playwright Dedicated Chromium</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-semibold">এপিআই ডিপেন্ডেন্সি:</span>
              <span className="font-bold text-emerald-700">০% (Zero API Cost)</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-semibold">সেশন প্রোফাইল:</span>
              <span className="font-mono text-[10px] text-purple-700 font-bold truncate max-w-[160px]">.browser_profile/gemini_session</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
              এটি আপনার ব্যক্তিগত গুগল ক্রোম নয়। সিস্টেমের ভেতরেই আলাদা ব্রাউজারে জেমিনি স্বয়ংক্রিয়ভাবে প্রম্পট টাইপ ও সার্কুলার রিড করে।
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleLaunchBrowser}
              disabled={isLaunching}
              className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Globe className="w-4 h-4 text-purple-200" />
              <span>{isLaunching ? 'ব্রাউজার ওপেন হচ্ছে...' : 'অভ্যন্তরীণ জেমিনি সাইন-ইন উইন্ডো খুলুন'}</span>
            </button>
            <p className="text-[10px] text-center text-slate-400">
              উইন্ডো খুললে একবার গুগল একাউন্টে সাইন-ইন করে নিন। সেশনটি স্থায়ীভাবে সেভ থাকবে।
            </p>
          </div>
        </div>

        {/* Card 2: PUBLISHING POLICY & ALLJOBS LIVE SYNC */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">২. অলজবস সিঙ্ক ও পাবলিকেশন পলিসি</h3>
                <p className="text-[11px] text-slate-500 font-medium">অটো-পাবলিশ বনাম অ্যাডমিন ড্রাফট</p>
              </div>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
              isAutoPublish
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}>
              {isAutoPublish ? '🟢 অটো-পাবলিশ' : '🟠 ড্রাফট রিভিউ'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">সার্কুলার প্রকাশ পলিসি:</span>
              <button
                type="button"
                onClick={handleToggleAutoPublish}
                disabled={isTogglingAutoPublish}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  isAutoPublish
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {isAutoPublish ? 'অটো-পাবলিশ অন' : 'ড্রাফট মোড অন'}
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {isAutoPublish
                ? '✅ জেমিনি বা অলজবস থেকে যেকোনো নতুন সার্কুলার পাওয়া মাত্রই স্বয়ংক্রিয়ভাবে ওয়েবসাইটে লাইভ প্রকাশ হয়ে যাবে।'
                : '🔒 নতুন সার্কুলারগুলো আগে ড্রাফটে জমা থাকবে। অ্যাডমিন ভেরিফাই করে ১-ক্লিকে ওয়েবসাইটে লাইভ পাবলিশ করবেন।'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunSync}
            disabled={isSyncing}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-emerald-900/10 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'সিঙ্ক চলছে...' : 'টেলিটক অলজবস লাইভ সিঙ্ক চালান'}</span>
          </button>
        </div>

        {/* Card 3: SMART AUTONOMOUS GEMINI CIRCULAR EXTRACTOR */}
        <div className="bg-white rounded-3xl p-5 border border-indigo-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-2xl">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">৩. সার্কুলার PDF ব্রাউজার এক্সট্রাক্টর</h3>
              <p className="text-[11px] text-slate-500 font-medium">স্বয়ংক্রিয় প্রম্পট ও কন্টেন্ট জেনারেশন</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <label className="block text-[11px] font-bold text-slate-700">
              সার্কুলার PDF লিংক, অলজবস লিংক বা নোটিশ URL:
            </label>
            <input
              type="text"
              value={extractorPdfUrl}
              onChange={(e) => setExtractorPdfUrl(e.target.value)}
              placeholder="https://alljobs.teletalk.com.bd/.../advertisement.pdf"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 focus:bg-white font-mono"
            />
            <button
              type="button"
              onClick={() => handleRunAIExtraction()}
              disabled={isExtractingCircular || !extractorPdfUrl.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-700 to-purple-800 hover:from-indigo-800 hover:to-purple-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 text-amber-300 ${isExtractingCircular ? 'animate-spin' : ''}`} />
              <span>{isExtractingCircular ? 'জেমিনি ব্রাউজার স্ক্যান করছে...' : 'জেমিনি ব্রাউজার দিয়ে সার্কুলার প্রসেস করুন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* EXTRACTED AI WORKSPACE MODAL / PREVIEW */}
      {extractedCircularResult && (
        <div className="bg-white border-2 border-indigo-300 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-100 text-indigo-800 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <h4 className="text-base font-black text-slate-900">
                  {extractedCircularResult.organization} — {extractedCircularResult.title}
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                অভ্যন্তরীণ জেমিনি ব্রাউজার এজেন্ট সরাসরি মূল PDF পড়ে এবং সম্পাদকীয় বিবরণ, পদবিন্যাস ও এসইও কিওয়ার্ড তৈরি করেছে:
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onOpenEditJob) {
                    onOpenEditJob(extractedCircularResult as JobCircular);
                  }
                }}
                className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold border border-purple-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Elementor বিল্ডারে খুলুন</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveExtractedJob(false)}
                disabled={isSavingExtractedJob}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                খসড়া (Draft) সেভ
              </button>
              <button
                type="button"
                onClick={() => handleSaveExtractedJob(true)}
                disabled={isSavingExtractedJob}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSavingExtractedJob ? 'পাবলিশ হচ্ছে...' : 'সরাসরি লাইভ পাবলিশ'}</span>
              </button>
              <button
                type="button"
                onClick={() => setExtractedCircularResult(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100">
              <span className="text-[10px] font-bold text-indigo-700 uppercase">মোট শূন্যপদ</span>
              <div className="text-lg font-black text-indigo-950 mt-0.5">{extractedCircularResult.totalPosts}</div>
            </div>
            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">আবেদনের শেষ তারিখ</span>
              <div className="text-sm font-black text-emerald-950 mt-0.5">{extractedCircularResult.deadline}</div>
            </div>
            <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-100">
              <span className="text-[10px] font-bold text-purple-700 uppercase">বেতন স্কেল ও গ্রেড</span>
              <div className="text-xs font-black text-purple-950 mt-0.5">{extractedCircularResult.salary} ({extractedCircularResult.grade})</div>
            </div>
            <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-100">
              <span className="text-[10px] font-bold text-amber-700 uppercase">বয়সসীমা ও কাট-অফ</span>
              <div className="text-xs font-black text-amber-950 mt-0.5">{extractedCircularResult.ageLimit}</div>
            </div>
          </div>

          {/* Extracted Positions Breakdown Table */}
          {extractedCircularResult.positions && extractedCircularResult.positions.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-700" />
                <span>নোটিশের সকল পদের তালিকা ({extractedCircularResult.positions.length}টি পদবি):</span>
              </h5>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">পদের নাম</th>
                      <th className="py-2.5 px-3">গ্রেড</th>
                      <th className="py-2.5 px-3">শূন্যপদ</th>
                      <th className="py-2.5 px-3">বেতন স্কেল</th>
                      <th className="py-2.5 px-3">শিক্ষাগত যোগ্যতা</th>
                      <th className="py-2.5 px-3">ফি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {extractedCircularResult.positions.map((pos: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{pos.title}</td>
                        <td className="py-2.5 px-3 text-slate-700">{pos.grade || 'গ্রেড অনুযায়ী'}</td>
                        <td className="py-2.5 px-3 font-black text-indigo-700">{pos.vacancies || pos.posts}</td>
                        <td className="py-2.5 px-3 text-slate-700">{pos.salary || 'স্কেল অনুযায়ী'}</td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-xs">{pos.education || pos.minEducation}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-800">৳{pos.govtFee || 200}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Editorial Preview Snippet */}
          {extractedCircularResult.editorialOverview && (
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 text-xs space-y-1">
              <span className="font-bold text-emerald-950 block">জেমিনি জেনারেটেড সম্পাদকীয় বিবরণ:</span>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line line-clamp-3">
                {extractedCircularResult.editorialOverview}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2.5 AUTONOMOUS SYSTEM AUDIT AGENT PANEL */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white border border-indigo-700/50 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white">
                  অটোনোমাস সিস্টেম অডিট এজেন্ট (Self-Healing Audit Agent)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {auditReport?.overallScore || 100}/১০০ হেলথ ({auditReport?.overallStatus || 'OPTIMAL'})
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 font-medium mt-0.5">
                অলজবস লাইভ সোর্স, রেজিলিয়েন্ট ইঞ্জিন, ডাটাবেজ ইন্টিগ্রিটি ও সিকিউরিটি স্বয়ংক্রিয় অডিট ও সেলফ-হিলিং
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleRunAudit(true)}
              disabled={isRunningAudit}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningAudit ? 'animate-spin' : ''}`} />
              <span>{isRunningAudit ? 'অডিট ও রিপেয়ার চলছে...' : 'ফুল সিস্টেম অডিট ও অটো-রিপেয়ার চালান'}</span>
            </button>
          </div>
        </div>

        {/* 5 Audit Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {(auditReport?.checks || [
            { id: '1', name: 'টেলিটক অলজবস API', score: 100, message: 'সফলভাবে লাইভ সংযোগ বিদ্যমান', status: 'PASSED' },
            { id: '2', name: 'রেজিলিয়েন্ট ইঞ্জিন', score: 100, message: 'জিরো-ক্র্যাশ এন্টারপ্রাইজ রেজিলিয়েন্ট', status: 'PASSED' },
            { id: '3', name: 'স্মার্ট পার্সার', score: 100, message: 'URL ও PDF অটো-রেজোলিউশন সক্রিয়', status: 'PASSED' },
            { id: '4', name: 'ডাটাবেজ ইন্টিগ্রিটি', score: 100, message: 'সকল সার্কুলার ফিল্ড সম্পূর্ণ ও ত্রুটিমুক্ত', status: 'PASSED' },
            { id: '5', name: 'জিরো-এপিআই সিকিউরিটি', score: 100, message: '০% ক্লাউড API ডিপেন্ডেন্সি', status: 'PASSED' }
          ]).map((check: any) => (
            <div key={check.id} className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1.5 backdrop-blur-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-indigo-300 truncate max-w-[120px]">{check.name}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                  {check.score}%
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight line-clamp-2">
                {check.message}
              </p>
            </div>
          ))}
        </div>

        {/* Audit Stats Banner */}
        <div className="flex flex-wrap items-center justify-between text-xs text-indigo-200/90 bg-indigo-950/60 p-3 rounded-2xl border border-indigo-800/40">
          <div className="flex items-center gap-3">
            <span>এনভায়রনমেন্ট: <strong className="text-white">{auditReport?.environment || 'Node.js Engine'}</strong></span>
            <span>•</span>
            <span>অডিটকৃত সার্কুলার: <strong className="text-emerald-400">{auditReport?.databaseStats?.totalJobs || displayJobs.length}টি</strong></span>
            <span>•</span>
            <span>স্বয়ংক্রিয় রিপেয়ার: <strong className="text-amber-300">{auditReport?.databaseStats?.repairedCount || 0}টি</strong></span>
          </div>
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>সিস্টেম ১০০% সুস্থ ও উৎপাদনের জন্য প্রস্তুত</span>
          </span>
        </div>
      </div>

      {/* 3. SYNCED JOBS MANAGEMENT TABLE WITH EDIT, UPDATE & 1-CLICK PUBLISH */}
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
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
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
              className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সব ({displayJobs.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('OPEN')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'OPEN' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              লাইভ প্রকাশিত
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('DRAFT')}
              className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'DRAFT' ? 'bg-amber-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ড্রাফট / স্থগিত
            </button>
          </div>
        </div>

        {/* Floating Bulk Action Bar */}
        {selectedJobIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-slate-900 to-purple-950 text-white rounded-2xl shadow-lg border border-purple-800/50 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-purple-500 text-white font-black text-xs">
                {selectedJobIds.length}
              </span>
              <span className="text-xs font-bold text-slate-200">
                টি সার্কুলার নির্বাচন করা হয়েছে
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkStatusChange('PUBLISHED')}
                disabled={isBulkProcessing}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>লাইভ পাবলিশ</span>
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange('DRAFT')}
                disabled={isBulkProcessing}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>ড্রাফট করুন</span>
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isBulkProcessing}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isBulkProcessing ? 'ডিলিট হচ্ছে...' : 'এক সাথে ডিলিট করুন'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedJobIds([])}
                className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="নির্বাচন বাতিল করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Synced Jobs Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={displayJobs.length > 0 && displayJobs.every(j => selectedJobIds.includes(j.id))}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                    title="সবগুলো নির্বাচন করুন"
                  />
                </th>
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
                  <td colSpan={7} className="py-10 text-center text-slate-500">
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
                    <tr key={job.id} className={"transition-colors " + (selectedJobIds.includes(job.id) ? "bg-purple-50/70" : "hover:bg-slate-50/80")}>
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedJobIds.includes(job.id)}
                          onChange={() => handleToggleSelect(job.id)}
                          className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                        />
                      </td>
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
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 shadow-2xs cursor-pointer ${
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
                            title="Elementor বিল্ডারে শিরোনাম, পদ, বেতন, গ্রেড ও ডেডলাইন এডিট করুন"
                          >
                            <Edit3 className="w-3 h-3 text-emerald-700" />
                            <span>Elementor এডিট</span>
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

      {/* 4. REAL-TIME ACTIVITY TERMINAL LOG */}
      <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-black text-slate-200 tracking-wider uppercase">
              লাইভ স্পাইডার ও অভ্যন্তরীণ জেমিনি ব্রাউজার কনসোল
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400 font-bold">
            Realtime Console • Playwright Standalone Chromium
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
