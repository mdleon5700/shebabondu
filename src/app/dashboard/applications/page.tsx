'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Download, 
  Copy, 
  MessageSquare, 
  ShieldCheck, 
  Send,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Printer,
  Edit3,
  X,
  AlertTriangle,
  Building,
  Check,
  Search,
  Eye,
  RefreshCw,
  Layers,
  FileCheck,
  CreditCard
} from 'lucide-react';
import { storage } from '@/lib/store';
import { ApplicationRequest } from '@/lib/types';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRequest[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'processing' | 'completed' | 'pending_payment' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Copy feedback states
  const [copiedSms1, setCopiedSms1] = useState(false);
  const [copiedSms2, setCopiedSms2] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  // Modals state
  const [receiptApp, setReceiptApp] = useState<ApplicationRequest | null>(null);
  const [previewSlipApp, setPreviewSlipApp] = useState<ApplicationRequest | null>(null);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeTrxId, setDisputeTrxId] = useState('');
  const [disputeSenderPhone, setDisputeSenderPhone] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [disputeSuccessMessage, setDisputeSuccessMessage] = useState<string | null>(null);

  const getSmsPrefix = (jobId: string) => {
    if (!jobId) return 'JOB';
    if (jobId.startsWith('bb')) return 'BBAD';
    if (jobId.startsWith('sonali')) return 'SONALI';
    if (jobId.startsWith('bpsc')) return 'BPSC';
    if (jobId.startsWith('ntrca')) return 'NTRCA';
    if (jobId.startsWith('railway')) return 'BR';
    return jobId.split('-')[0].toUpperCase();
  };

  const currentPrefix = selectedApp ? getSmsPrefix(selectedApp.jobId) : 'JOB';

  // Live Sync with Server API on Mount & Window Focus
  const loadApps = async () => {
    // 1. Initial fast local state
    const localApps = storage.getApplications();
    if (localApps && localApps.length > 0) {
      setApplications(localApps);
      setSelectedApp(prev => prev || localApps[0]);
    }

    // 2. Fetch live applications from backend API with Auth header
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('cs_session_token') : null;
      const headers: Record<string, string> = { 'Cache-Control': 'no-cache' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/applications', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.applications)) {
          setApplications(data.applications);
          if (data.applications.length > 0) {
            setSelectedApp(prev => {
              if (!prev) return data.applications[0];
              const matching = data.applications.find((a: any) => a.id === prev.id);
              return matching || data.applications[0];
            });
          }
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('cs_apps_data', JSON.stringify(data.applications));
              const user = storage.getUser();
              if (user && user.id) {
                localStorage.setItem('cs_apps_data_' + user.id, JSON.stringify(data.applications));
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      console.warn('API applications sync failed, using offline cache', err);
    }
  };

  useEffect(() => {
    loadApps();

    const handleSync = () => {
      const updated = storage.getApplications();
      setApplications(updated);
      if (updated.length > 0) setSelectedApp(prev => prev || updated[0]);
    };

    const handleFocus = () => {
      loadApps();
    };

    window.addEventListener('cs_apps_changed', handleSync);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('cs_apps_changed', handleSync);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Summary Metrics Counts
  const stats = useMemo(() => {
    const total = applications.length;
    const processing = applications.filter(a => a.status === 'processing').length;
    const completed = applications.filter(a => a.status === 'completed' || a.status === 'submitted').length;
    const pendingPayment = applications.filter(a => a.status === 'pending_payment').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    return { total, processing, completed, pendingPayment, rejected };
  }, [applications]);

  // Filter & Search Logic
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'completed') {
          if (app.status !== 'completed' && app.status !== 'submitted') return false;
        } else if (app.status !== statusFilter) {
          return false;
        }
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchId = app.id.toLowerCase().includes(query);
        const matchTitle = (app.jobTitle || '').toLowerCase().includes(query);
        const matchPost = (app.postName || '').toLowerCase().includes(query);
        const matchOrg = (app.organization || '').toLowerCase().includes(query);
        const matchTrx = (app.trxId || '').toLowerCase().includes(query);
        const matchPhone = (app.candidatePhone || '').includes(query);
        const matchTracking = (app.teleTalkTrackingId || '').toLowerCase().includes(query);
        return matchId || matchTitle || matchPost || matchOrg || matchTrx || matchPhone || matchTracking;
      }
      return true;
    });
  }, [applications, statusFilter, searchQuery]);

  const handleCopySms1 = (userId: string) => {
    navigator.clipboard.writeText(`${currentPrefix} ${userId}`);
    setCopiedSms1(true);
    setTimeout(() => setCopiedSms1(false), 2000);
  };

  const handleCopySms2 = (pin: string) => {
    navigator.clipboard.writeText(`${currentPrefix} YES ${pin}`);
    setCopiedSms2(true);
    setTimeout(() => setCopiedSms2(false), 2000);
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !disputeTrxId.trim()) return;

    setIsSubmittingDispute(true);
    setDisputeSuccessMessage(null);

    try {
      const res = await fetch(`/api/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          trxId: disputeTrxId.trim().toUpperCase(),
          senderPhone: disputeSenderPhone.trim(),
          status: 'pending_payment',
          notes: 'প্রার্থী কর্তৃক TrxID সংশোধন বা পুনরায় জমা দেওয়া হয়েছে।'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const updatedApp = {
          ...selectedApp,
          trxId: disputeTrxId.trim().toUpperCase(),
          senderPhone: disputeSenderPhone.trim(),
          status: 'pending_payment' as const
        };
        setSelectedApp(updatedApp);
        setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
        storage.updateAppStatus(updatedApp.id, 'pending_payment', 'প্রার্থী কর্তৃক TrxID সংশোধন বা পুনরায় জমা দেওয়া হয়েছে।');
        setDisputeSuccessMessage('✓ TrxID সফলভাবে জমা দেওয়া হয়েছে! অ্যাডমিন টিম দ্রুত যাচাই করে অনুমোদন করবে।');
        setTimeout(() => {
          setIsDisputeModalOpen(false);
          setDisputeSuccessMessage(null);
        }, 2000);
      } else {
        alert(data.error || 'TrxID আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch {
      alert('নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  // Build Chronological Timeline for Selected App
  const timelineSteps = useMemo(() => {
    if (!selectedApp) return [];
    const isCompleted = selectedApp.status === 'completed' || selectedApp.status === 'submitted';
    const isProcessing = selectedApp.status === 'processing';
    const isPendingPayment = selectedApp.status === 'pending_payment';
    const isRejected = selectedApp.status === 'rejected';

    return [
      {
        id: 'step-1',
        title: 'আবেদন দাখিল সম্পন্ন',
        desc: `চাকরি সেবা পোর্টালে ${selectedApp.date || 'সম্প্রতি'} আবেদন দাখিল ও তথ্য যাচাই সম্পন্ন হয়েছে।`,
        isDone: true,
        isCurrent: false,
        time: selectedApp.date || 'অনলাইন'
      },
      {
        id: 'step-2',
        title: selectedApp.paymentMethod === 'Wallet' ? 'ডিজিটাল ওয়ালেট ডেবিট' : 'পেমেন্ট যাচাই ও অনুমোদন',
        desc: selectedApp.paymentMethod === 'Wallet' 
          ? `ডিজিটাল ওয়ালেট থেকে ৳${selectedApp.totalAmount} তাৎক্ষণিক ডেবিট ও নিশ্চিতকরণ সম্পন্ন।`
          : `মোবাইল ব্যাংকিং (${selectedApp.paymentMethod}) TrxID: ${selectedApp.trxId || 'যাচাইাধীন'}`,
        isDone: isCompleted || isProcessing,
        isCurrent: isPendingPayment,
        time: isCompleted || isProcessing ? 'যাচাইকৃত' : 'অপেক্ষমাণ'
      },
      {
        id: 'step-3',
        title: 'টেলিটক ও অফিশিয়াল পোর্টালে ফর্ম পূরণ',
        desc: 'চাকরি সেবা এক্সপার্ট টিম সরকারি ওয়েবসাইটে প্রার্থীর নির্ভুল তথ্য ও ছবি-স্বাক্ষর আপলোড করছে।',
        isDone: isCompleted,
        isCurrent: isProcessing,
        time: isCompleted ? 'সম্পন্ন' : isProcessing ? 'চলমান...' : 'পরবর্তী ধাপ'
      },
      {
        id: 'step-4',
        title: isRejected ? 'আবেদন সংশোধন প্রয়োজন' : 'অফিশিয়াল স্লিপ ও ইউজার আইডি প্রদান',
        desc: isCompleted 
          ? `ইউজার আইডি: ${selectedApp.teleTalkTrackingId || selectedApp.id} ও Applicant Copy উন্মুক্ত।`
          : isRejected 
          ? `নোট: ${selectedApp.notes || 'TrxID বা তথ্যে অসামঞ্জস্য রয়েছে। সংশোধন করুন।'}`
          : 'আবেদন সম্পন্ন হওয়ামাত্রই ডাউনলোড স্লিপ ও ট্র্যাকিং ক্রেডেনশিয়াল পাবেন।',
        isDone: isCompleted,
        isCurrent: isCompleted || isRejected,
        isError: isRejected,
        time: isCompleted ? 'রেডি' : isRejected ? 'অ্যাকশন চাই' : 'চূড়ান্ত ধাপ'
      }
    ];
  }, [selectedApp]);

  return (
    <div className="space-y-6 max-w-5xl" data-testid="dashboard-applications-hub">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-700" />
          <span>আমার আবেদন ও লাইভ স্ট্যাটাস ট্র্যাকিং</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          আপনার দাখিলকৃত সকল চাকরির আবেদন, টেলিটক ফি পেমেন্ট ও অফিশিয়াল অ্যাপ্লিক্যান্ট কপির লাইভ অগ্রগতি।
        </p>
      </div>

      {/* 4 Summary Metrics Snapshot Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" data-testid="applications-stats-grid">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all' 
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>সর্বমোট আবেদন</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{stats.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">সবগুলো আবেদন ট্র্যাক করুন</div>
        </div>

        <div 
          onClick={() => setStatusFilter('processing')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'processing' 
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 shadow-sm' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center justify-between">
            <span>টিম প্রসেসিং</span>
            <Clock className="w-4 h-4 text-blue-600 animate-spin" />
          </div>
          <div className="text-2xl font-black text-blue-900 mt-1 font-mono">{stats.processing}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">ফরম পূরণ চলমান</div>
        </div>

        <div 
          onClick={() => setStatusFilter('completed')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'completed' 
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
            <span>সম্পন্ন ও স্লিপ রেডি</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1 font-mono">{stats.completed}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">স্লিপ ডাউনলোড করুন</div>
        </div>

        <div 
          onClick={() => setStatusFilter('pending_payment')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'pending_payment' 
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 shadow-sm' 
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center justify-between">
            <span>পেন্ডিং পেমেন্ট</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1 font-mono">{stats.pendingPayment}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">TrxID যাচাইাধীন</div>
        </div>
      </div>

      {/* Search Bar & Status Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" data-testid="status-tabs">
            <button
              type="button"
              data-testid="filter-tab-all"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === 'all' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              সকল ({stats.total})
            </button>
            <button
              type="button"
              data-testid="filter-tab-processing"
              onClick={() => setStatusFilter('processing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === 'processing' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              প্রসেসিং ({stats.processing})
            </button>
            <button
              type="button"
              data-testid="filter-tab-completed"
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === 'completed' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              সম্পন্ন ({stats.completed})
            </button>
            <button
              type="button"
              data-testid="filter-tab-pending"
              onClick={() => setStatusFilter('pending_payment')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === 'pending_payment' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              পেন্ডিং ({stats.pendingPayment})
            </button>
            {stats.rejected > 0 && (
              <button
                type="button"
                data-testid="filter-tab-rejected"
                onClick={() => setStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'rejected' 
                    ? 'bg-rose-600 text-white shadow-xs' 
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                সংশোধন ({stats.rejected})
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              data-testid="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="আবেদন বা TrxID খুঁজুন..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-600/30"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left: Applications List */}
        <div className="md:col-span-2 space-y-3" data-testid="applications-list">
          {filteredApps.map((app) => {
            const isCompleted = app.status === 'completed' || app.status === 'submitted';
            const isProcessing = app.status === 'processing';
            const isPendingPayment = app.status === 'pending_payment';
            const isRejected = app.status === 'rejected';

            return (
              <div
                key={app.id}
                data-testid={`app-card-${app.id}`}
                onClick={() => setSelectedApp(app)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  selectedApp?.id === app.id 
                    ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/10' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-xs text-slate-500">ট্র্যাকিং: {app.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : isProcessing
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : isPendingPayment
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>আবেদন সম্পন্ন ও স্লিপ রেডি</span>
                      </>
                    ) : isProcessing ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                        <span>টিম ফরম পূরণ করছে</span>
                      </>
                    ) : isPendingPayment ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>পেমেন্ট যাচাইয়ের অপেক্ষায়</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>সংশোধন প্রয়োজন</span>
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900">{app.postName}</h3>
                  <div className="text-xs text-slate-500">{app.organization}</div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>তারিখ: {app.date}</span>
                  <span>মোট ফি: <strong className="text-slate-800">৳{app.totalAmount}</strong> ({app.paymentMethod})</span>
                </div>
              </div>
            );
          })}

          {filteredApps.length === 0 && (
            <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm">কোনো আবেদন পাওয়া যায়নি।</p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
                >
                  সার্চ রিসেট করুন
                </button>
              )}
              {!searchQuery && (
                <Link href="/jobs" className="mt-3 inline-block px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold">
                  চলতি সার্কুলার দেখুন
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right: Selected App Details & Timeline */}
        {selectedApp && (
          <div className="space-y-4" data-testid="selected-app-details">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>ভেরিফাইড আবেদন ও ট্র্যাকিং</span>
                </h3>
                <span className="font-mono text-[11px] font-bold text-slate-400">
                  {selectedApp.id}
                </span>
              </div>

              <div className="space-y-2">
                {/* Submission Channel & User ID */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold text-[11px]">
                      {selectedApp.submissionChannel === 'bank_erecruitment' ? '🏦 বাংলাদেশ ব্যাংক ট্র্যাকিং:' :
                       selectedApp.submissionChannel === 'corporate_portal' ? '🏢 কর্পোরেট / Bdjobs আইডি:' :
                       selectedApp.submissionChannel === 'hr_email' ? '✉️ এইচআর ইমেইল রেফারেন্স:' :
                       selectedApp.submissionChannel === 'custom_portal' ? '🎓 বিশ্ববিদ্যালয় / পোর্টাল আইডি:' :
                       selectedApp.submissionChannel === 'postal_offline' ? '📮 রেজিস্ট্রি ডাক ও চালান নম্বর:' :
                       '🔤 টেলিটক ইউজার আইডি (User ID):'}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border">
                      <span data-testid="teletalk-user-id">{selectedApp.teleTalkTrackingId || selectedApp.corporateTrackingId || selectedApp.id}</span>
                      <button
                        data-testid="copy-user-id-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedApp.teleTalkTrackingId || selectedApp.corporateTrackingId || selectedApp.id);
                          setCopiedUid(true);
                          setTimeout(() => setCopiedUid(false), 2000);
                        }}
                        className="text-[10px] text-emerald-700 hover:underline font-sans font-bold"
                      >
                        {copiedUid ? '✓' : 'কপি'}
                      </button>
                    </div>
                  </div>

                  {/* Password / PIN Box */}
                  {selectedApp.teleTalkPassword && (
                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                      <span className="text-slate-500 font-bold text-[11px]">
                        🔑 টেলিটক পাসওয়ার্ড / পিন:
                      </span>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <span data-testid="teletalk-password">{selectedApp.teleTalkPassword}</span>
                        <button
                          data-testid="copy-password-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedApp.teleTalkPassword!);
                            setCopiedPass(true);
                            setTimeout(() => setCopiedPass(false), 2000);
                          }}
                          className="text-[10px] text-emerald-700 hover:underline font-sans font-bold"
                        >
                          {copiedPass ? '✓' : 'কপি'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">আবেদন স্ট্যাটাস:</span>
                  <span className={`font-bold ${
                    selectedApp.status === 'completed' || selectedApp.status === 'submitted'
                      ? 'text-emerald-700' 
                      : selectedApp.status === 'processing' 
                      ? 'text-blue-700' 
                      : 'text-amber-700'
                  }`}>
                    {selectedApp.status === 'completed' || selectedApp.status === 'submitted' 
                      ? '✓ আবেদন সম্পন্ন' 
                      : selectedApp.status === 'processing' 
                      ? '⚙️ টিম পূরণ করছে' 
                      : '⏳ পেন্ডিং'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">প্রার্থী নাম:</span>
                  <span className="font-bold text-slate-800">{selectedApp.candidateName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">পরিশোধ পদ্ধতি:</span>
                  <span className="font-bold text-slate-800">
                    {selectedApp.paymentMethod} {selectedApp.trxId ? `(TrxID: ${selectedApp.trxId})` : ''}
                  </span>
                </div>
              </div>

              {/* Progress Stepper Timeline */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>আবেদনের অগ্রগতি টাইমলাইন</span>
                </div>

                <div className="space-y-2.5 relative pl-4 border-l-2 border-slate-200 ml-1.5 text-[11px]">
                  {timelineSteps.map((step) => (
                    <div key={step.id} className="relative">
                      <div className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full border-2 ${
                        step.isDone 
                          ? 'bg-emerald-600 border-emerald-200' 
                          : step.isCurrent 
                          ? 'bg-blue-600 border-blue-200 animate-pulse' 
                          : 'bg-slate-200 border-white'
                      }`} />
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${
                          step.isDone 
                            ? 'text-emerald-900' 
                            : step.isCurrent 
                            ? 'text-blue-800' 
                            : 'text-slate-400'
                        }`}>
                          {step.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{step.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Applicant's Copy PDF, Voucher, Dispute */}
              <div className="pt-3 space-y-2">
                {(selectedApp.status === 'completed' || selectedApp.status === 'submitted') ? (
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      data-testid="download-applicant-copy-btn"
                      href={selectedApp.applicantCopyPdfUrl || '/demo-applicant-copy.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors text-center text-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>স্লিপ ডাউনলোড</span>
                    </a>
                    <button
                      type="button"
                      data-testid="preview-slip-modal-btn"
                      onClick={() => setPreviewSlipApp(selectedApp)}
                      className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                    >
                      <Eye className="w-4 h-4 text-emerald-700" />
                      <span>ইন-অ্যাপ প্রিভিউ</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 font-bold text-[11px]">
                    ⏳ আবেদন সম্পন্ন হওয়ামাত্রই অফিশিয়াল অ্যাপ্লিকেশন স্লিপ উন্মুক্ত হবে
                  </div>
                )}

                {/* Printable Money Voucher Button */}
                <button
                  type="button"
                  data-testid="view-money-receipt-btn"
                  onClick={() => setReceiptApp(selectedApp)}
                  className="w-full py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs text-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-700" />
                  <span>🖨️ অফিসিয়াল মানি রিসিট ও ভাউচার</span>
                </button>

                {/* Dispute / TrxID Correction Button */}
                {(selectedApp.status === 'pending_payment' || selectedApp.status === 'rejected') && (
                  <button
                    type="button"
                    data-testid="dispute-trx-btn"
                    onClick={() => {
                      setDisputeTrxId(selectedApp.trxId || '');
                      setDisputeSenderPhone(selectedApp.senderPhone || selectedApp.candidatePhone || '');
                      setIsDisputeModalOpen(true);
                    }}
                    className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>✏️ TrxID সংশোধন বা পুনরায় জমা দিন</span>
                  </button>
                )}
              </div>
            </div>

            {/* Teletalk SMS Generator / Submission Channel Box */}
            {selectedApp.submissionChannel === 'bank_erecruitment' ? (
              <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-5 rounded-2xl shadow-sm space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-400" />
                  <h4 className="font-bold">🏦 বাংলাদেশ ব্যাংক ই-রিক্রুটমেন্ট ট্র্যাকিং</h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  বাংলাদেশ ব্যাংক ই-রিক্রুটমেন্টের মাধ্যমে আপনার সিভি ও আবেদন যাচাই করা হয়েছে। প্রবেশপত্র রিলিজের পর রোল নম্বর এখানেই হালনাগাদ হবে।
                </p>
                <div className="bg-slate-800/80 p-2.5 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 block">ট্র্যাকিং নম্বর:</span>
                  <div className="font-mono font-bold text-blue-300">
                    {selectedApp.teleTalkTrackingId || selectedApp.id}
                  </div>
                </div>
              </div>
            ) : selectedApp.submissionChannel === 'corporate_portal' || selectedApp.submissionChannel === 'hr_email' ? (
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-bold">🏢 কর্পোরেট / এইচআর আবেদন ট্র্যাকিং</h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  আপনার সিভি ও আবেদন কোম্পানির সংশ্লিষ্ট এইচআর ডিপার্টমেন্ট বা পোর্টাল সিস্টেমে সফলভাবে জমা দেওয়া হয়েছে।
                </p>
                <div className="bg-slate-800/80 p-2.5 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 block">অ্যাপ্লিকেশন রেফারেন্স:</span>
                  <div className="font-mono font-bold text-indigo-300">
                    {selectedApp.corporateTrackingId || selectedApp.teleTalkTrackingId || selectedApp.id}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-5 rounded-2xl shadow-sm space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold">টেলিটক এসএমএস ফরম্যাট</h4>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  টেলিটক প্রিপেইড সিম থেকে ১৬২২২ নম্বরে এসএমএস প্রেরণের নির্ধারিত ফরম্যাট:
                </p>

                <div className="bg-slate-800/80 p-2.5 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 block">১ম SMS (ফি জানার জন্য):</span>
                  <div className="flex items-center justify-between font-mono font-bold text-emerald-300">
                    <span>{currentPrefix} {selectedApp.teleTalkTrackingId || selectedApp.id}</span>
                    <button
                      type="button"
                      onClick={() => handleCopySms1(selectedApp.teleTalkTrackingId || selectedApp.id)}
                      className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white hover:bg-white/20"
                    >
                      {copiedSms1 ? 'কপি হয়েছে' : 'কপি'}
                    </button>
                  </div>
                </div>

                {selectedApp.teleTalkPassword && (
                  <div className="bg-slate-800/80 p-2.5 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 block">২য় SMS (ফি প্রদানের জন্য):</span>
                    <div className="flex items-center justify-between font-mono font-bold text-emerald-300">
                      <span>{currentPrefix} YES {selectedApp.teleTalkPassword}</span>
                      <button
                        type="button"
                        onClick={() => handleCopySms2(selectedApp.teleTalkPassword!)}
                        className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white hover:bg-white/20"
                      >
                        {copiedSms2 ? 'কপি হয়েছে' : 'কপি'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* IN-APP APPLICANT COPY PREVIEW MODAL */}
      {previewSlipApp && (
        <div 
          data-testid="in-app-slip-preview-modal" 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">অফিশিয়াল অ্যাপ্লিকেশন কপি (Applicant's Copy)</span>
              </div>
              <div className="flex items-center gap-2">
                {previewSlipApp.applicantCopyPdfUrl && (
                  <a
                    href={previewSlipApp.applicantCopyPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>পিডিএফ ডাউনলোড</span>
                  </a>
                )}
                <button
                  type="button"
                  data-testid="close-slip-modal-btn"
                  onClick={() => setPreviewSlipApp(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕ বন্ধ করুন
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 bg-slate-50">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-base font-black text-slate-900">{previewSlipApp.jobTitle}</h2>
                    <p className="text-slate-500 font-medium">{previewSlipApp.organization} • {previewSlipApp.postName}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs">
                      আবেদন গৃহীত ও নিশ্চিতকৃত
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[11px]">প্রার্থীর নাম:</span>
                    <strong className="text-slate-900 block font-bold">{previewSlipApp.candidateName}</strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[11px]">মোবাইল নম্বর:</span>
                    <strong className="text-slate-900 block font-mono">{previewSlipApp.candidatePhone}</strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[11px]">টেলিটক ইউজার আইডি (User ID):</span>
                    <strong className="text-emerald-700 block font-mono font-black text-sm">
                      {previewSlipApp.teleTalkTrackingId || previewSlipApp.id}
                    </strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block text-[11px]">পাসওয়ার্ড / পিন (Password):</span>
                    <strong className="text-emerald-700 block font-mono font-bold">
                      {previewSlipApp.teleTalkPassword || 'N/A'}
                    </strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">পরিশোধিত মোট সরকারি ফি ও সার্ভিস চার্জ:</span>
                  <span className="font-black text-slate-900 font-mono text-sm">৳{previewSlipApp.totalAmount}</span>
                </div>
              </div>

              {previewSlipApp.applicantCopyPdfUrl && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-2">
                  <p className="text-xs text-slate-600">
                    অফিশিয়াল পিডিএফ কপি দেখতে নিচে ক্লিক করুন:
                  </p>
                  <a
                    href={previewSlipApp.applicantCopyPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>পিডিএফ সরাসরি ব্রাউজারে খুলুন</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE / CORRECT TRXID MODAL */}
      {isDisputeModalOpen && selectedApp && (
        <div 
          data-testid="dispute-modal"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-900 text-sm">TrxID সংশোধন বা পুনরায় জমা দিন</h3>
              </div>
              <button
                type="button"
                data-testid="close-dispute-modal-btn"
                onClick={() => setIsDisputeModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              ভুলবশত ভুল TrxID বা ভিন্ন নম্বর থেকে পেমেন্ট করা হয়ে থাকলে নিচে সঠিক তথ্য প্রদান করুন:
            </p>

            <form onSubmit={handleDisputeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সঠিক ট্রানজেকশন আইডি (TrxID):
                </label>
                <input
                  type="text"
                  required
                  data-testid="dispute-trx-input"
                  placeholder="যেমন: BKL7829X10"
                  value={disputeTrxId}
                  onChange={(e) => setDisputeTrxId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  যে মোবাইল নম্বর থেকে টাকা পাঠিয়েছেন (Sender Mobile):
                </label>
                <input
                  type="tel"
                  data-testid="dispute-phone-input"
                  placeholder="যেমন: 01700000000"
                  value={disputeSenderPhone}
                  onChange={(e) => setDisputeSenderPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {disputeSuccessMessage && (
                <div data-testid="dispute-success-alert" className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{disputeSuccessMessage}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDisputeModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  data-testid="submit-dispute-btn"
                  disabled={isSubmittingDispute}
                  className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isSubmittingDispute ? 'আপডেট হচ্ছে...' : 'হালনাগাদ নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANDIDATE OFFICIAL PRINTABLE RECEIPT / MONEY VOUCHER MODAL */}
      {receiptApp && (
        <div 
          id="official-printable-receipt-modal" 
          data-testid="printable-receipt-modal"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
            
            {/* Top Toolbar (Non-printable) */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">অফিসিয়াল মানি রিসিট ও ভাউচার প্রিন্ট</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="print-voucher-btn"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ প্রিন্ট করুন</span>
                </button>
                <button
                  type="button"
                  data-testid="close-receipt-modal-btn"
                  onClick={() => setReceiptApp(null)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕ বন্ধ করুন
                </button>
              </div>
            </div>

            {/* Printable Paper Area (A4 Clean Receipt) */}
            <div id="official-printable-receipt" className="p-8 sm:p-10 space-y-6 bg-white text-slate-900 font-sans">
              
              {/* Header with Official Logo & Contact */}
              <div className="flex items-start justify-between border-b-2 border-emerald-800 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-black text-lg">
                      চস
                    </div>
                    <div>
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">চাকরি সেবা (Chakri Sheba)</h1>
                      <p className="text-[11px] text-slate-500 font-medium">স্মার্ট রিক্রুটমেন্ট ও ডিজিটাল আবেদন সহায়তা প্ল্যাটফর্ম</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    হেল্পলাইন: ০১৭৭৪-৩৬৬৬৪৩ • ওয়েবসাইট: chakrisheba.com • ইমেইল: support@chakrisheba.com
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-black rounded-lg uppercase tracking-wider mb-1">
                    মানি রিসিট / পেইড ভাউচার
                  </span>
                  <div className="text-xs font-mono font-bold text-slate-800">
                    রসিদ নং: CS-{receiptApp.id}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    তারিখ: {receiptApp.date || new Date().toLocaleDateString('bn-BD')}
                  </div>
                </div>
              </div>

              {/* Candidate & Job Two-Column Summary */}
              <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1.5 border-r border-slate-200 pr-4">
                  <div className="font-black text-slate-900 uppercase text-[10px] tracking-wider text-emerald-800 mb-1">
                    প্রার্থীর তথ্য (Candidate Information)
                  </div>
                  <div>
                    <span className="text-slate-500">নাম:</span>{' '}
                    <strong className="text-slate-900 font-bold">{receiptApp.candidateName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">মোবাইল:</span>{' '}
                    <strong className="text-slate-900 font-mono">{receiptApp.candidatePhone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">নিজ জেলা:</span>{' '}
                    <strong className="text-slate-900">{receiptApp.candidateDistrict || 'ঢাকা'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">ট্র্যাকিং / ইউজার আইডি:</span>{' '}
                    <strong className="text-emerald-800 font-mono font-bold">
                      {receiptApp.teleTalkTrackingId || receiptApp.corporateTrackingId || 'প্রসেসিং সম্পন্ন'}
                    </strong>
                  </div>
                </div>

                <div className="space-y-1.5 pl-2">
                  <div className="font-black text-slate-900 uppercase text-[10px] tracking-wider text-emerald-800 mb-1">
                    আবেদন ও সার্কুলার বিবরণ (Job Details)
                  </div>
                  <div>
                    <span className="text-slate-500">বিজ্ঞপ্তি:</span>{' '}
                    <strong className="text-slate-900 block truncate">{receiptApp.jobTitle}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">প্রতিষ্ঠান:</span>{' '}
                    <strong className="text-slate-900">{receiptApp.organization}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">পদের নাম:</span>{' '}
                    <strong className="text-slate-900">{receiptApp.postName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">আবেদন মাধ্যম:</span>{' '}
                    <strong className="text-slate-800">
                      {receiptApp.submissionChannel === 'bank_erecruitment' ? 'বাংলাদেশ ব্যাংক ই-রিক্রুটমেন্ট' :
                       receiptApp.submissionChannel === 'corporate_portal' ? 'কর্পোরেট / Bdjobs' :
                       receiptApp.submissionChannel === 'custom_portal' ? 'বিশ্ববিদ্যালয় পোর্টাল' :
                       receiptApp.submissionChannel === 'postal_offline' ? 'ডাকযোগে ও চালান' :
                       receiptApp.submissionChannel === 'hr_email' ? 'সরাসরি এইচআর ইমেইল' :
                       'টেলিটক সরকারি পোর্টাল'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Itemized Fees Ledger */}
              <div className="space-y-2">
                <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-black text-[11px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">বিবরণ (Particulars)</th>
                      <th className="py-2.5 px-3">পদ্ধতি</th>
                      <th className="py-2.5 px-3 text-right">পরিমাণ (টাকা)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="py-2 px-3">সরকারি পরীক্ষার মূল আবেদন ফি (Government Application Fee)</td>
                      <td className="py-2 px-3 text-slate-500">টেলিটক / চালানের মাধ্যমে পরিশোধিত</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">৳{receiptApp.governmentFee ?? (receiptApp.totalAmount > 80 ? receiptApp.totalAmount - 80 : 200)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">চাকরি সেবা আবেদন প্রসেসিং ও ভেরিফিকেশন চার্জ (Service Fee)</td>
                      <td className="py-2 px-3 text-slate-500">প্ল্যাটফর্ম অটোমেশন ও মনিটরিং</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">৳{receiptApp.serviceCharge ?? 80}</td>
                    </tr>
                    {Boolean(receiptApp.couponDiscount) && (
                      <tr className="text-emerald-700 font-bold bg-emerald-50/50">
                        <td className="py-2 px-3">বিশেষ প্রমোশনাল ডিসকাউন্ট (Coupon / Offer)</td>
                        <td className="py-2 px-3">সরাসরি ছাড়</td>
                        <td className="py-2 px-3 text-right font-mono">-৳{receiptApp.couponDiscount}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-100/80 font-black border-t-2 border-slate-300">
                    <tr>
                      <td colSpan={2} className="py-2.5 px-3 text-slate-900 text-right">সর্বমোট পরিশোধিত অর্থ (Net Amount Paid):</td>
                      <td className="py-2.5 px-3 text-right text-emerald-800 text-sm font-mono font-black">৳{receiptApp.totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment Verification TrxID & Barcode */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-xs">
                <div>
                  <div className="text-[11px] text-slate-500">পেমেন্ট মেথড ও লেনদেন ট্র্যাকিং:</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {receiptApp.paymentMethod} (TrxID: <span className="font-mono text-emerald-800">{receiptApp.trxId || 'N/A'}</span>)
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-1">✓ পেমেন্ট অনুমোদিত ও লেজারে অন্তর্ভুক্ত</div>
                </div>

                <div className="text-center sm:text-right">
                  <div className="font-mono text-[9px] tracking-widest text-slate-400 select-none">
                    ||| | ||||| || |||||| | |||| ||| |||||
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">SEC-ID: {receiptApp.id}-VERIFIED</div>
                </div>
              </div>

              {/* Official Seal and Signatures */}
              <div className="flex items-end justify-between pt-8 border-t border-slate-200 text-xs">
                <div className="space-y-1">
                  <div className="w-24 h-10 border-2 border-dashed border-emerald-300 rounded-lg flex items-center justify-center text-[10px] font-bold text-emerald-700 bg-emerald-50/40">
                    [ডিজিটাল সিল]
                  </div>
                  <p className="text-[10px] text-slate-400">সিস্টেম জেনারেটেড ডিজিটাল ডকুমেন্ট</p>
                </div>

                <div className="text-right space-y-1">
                  <div className="h-6 w-32 border-b border-slate-400 ml-auto" />
                  <p className="font-bold text-slate-800 text-[11px]">অনুমোদিত স্বাক্ষর</p>
                  <p className="text-[10px] text-slate-400">চাকরি সেবা অ্যাডমিন কর্তৃপক্ষ</p>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="text-center text-[10px] text-slate-400 pt-2">
                এই ভাউচারটি কম্পিউটার জেনারেটেড এবং এতে কোনো ম্যানুয়াল স্বাক্ষরের প্রয়োজন নেই। আপনার ট্র্যাকিং আইডির মাধ্যমে ওয়েবসাইটে আবেদনের স্ট্যাটাস যাচাই করতে পারেন।
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
