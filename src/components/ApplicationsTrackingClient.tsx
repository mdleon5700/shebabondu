'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Download, 
  Copy, 
  ShieldCheck, 
  Printer, 
  Edit3, 
  X, 
  AlertTriangle, 
  Building, 
  Check, 
  Bookmark, 
  ArrowRight, 
  ExternalLink, 
  Search, 
  Briefcase, 
  Calendar, 
  AlertCircle,
  RefreshCw,
  Trash2,
  Lock,
  Eye
} from 'lucide-react';
import { storage } from '@/lib/store';
import { ApplicationRequest, JobCircular } from '@/lib/types';
import { fetchPublicJobs } from '@/lib/public-jobs-client';

export default function ApplicationsTrackingClient() {
  const [activeTab, setActiveTab] = useState<'applications' | 'saved'>('applications');
  const [applications, setApplications] = useState<ApplicationRequest[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [allJobs, setAllJobs] = useState<JobCircular[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApplicationRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Copy states
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedSms1, setCopiedSms1] = useState(false);
  const [copiedSms2, setCopiedSms2] = useState(false);

  // Dispute modal state
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeTrxId, setDisputeTrxId] = useState('');
  const [disputeSenderPhone, setDisputeSenderPhone] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [disputeSuccessMessage, setDisputeSuccessMessage] = useState<string | null>(null);

  // Receipt voucher state
  const [receiptApp, setReceiptApp] = useState<ApplicationRequest | null>(null);

  // Bengali numerals converter
  const toBn = (num: number | string | undefined | null) => {
    if (num === undefined || num === null) return '';
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnNums[parseInt(d, 10)]);
  };

  // Sync Applications & Saved Jobs
  useEffect(() => {
    // 1. Initial local load
    const localApps = storage.getApplications();
    if (localApps && localApps.length > 0) {
      setApplications(localApps);
      setSelectedApp(localApps[0]);
    } else {
      // Provide default demo application so candidates immediately see the interactive tracking interface
      const demoApps: ApplicationRequest[] = [
        {
          id: 'APP-2026-891',
          jobId: 'job-alljobs-15178',
          jobTitle: 'সহকারী পরিচালক (সাধারণ)',
          organization: 'বাংলাদেশ মৎস্য গবেষণা ইনস্টিটিউট (BFRI)',
          postName: 'সহকারী পরিচালক (সাধারণ)',
          candidateName: 'আরিফুল ইসলাম',
          candidatePhone: '01712345678',
          candidateDistrict: 'ঢাকা',
          date: '০৮ নভেম্বর ২০২৬',
          status: 'completed',
          totalAmount: 280,
          serviceCharge: 80,
          governmentFee: 200,
          paymentMethod: 'bKash',
          trxId: 'BK9X87M2LQ',
          teleTalkTrackingId: 'BFRI-AD-98214',
          teleTalkPassword: 'PASS-98214-BFRI',
          applicantCopyPdfUrl: 'https://alljobs.teletalk.com.bd/media/public/uploads/governments/jobs/advertisement-1794128565411.pdf',
          verificationType: 'admin_verified',
          notes: 'টেলিটক সার্ভারে আবেদন সফল হয়েছে এবং ফি প্রাপ্তি কনফার্ম।'
        },
        {
          id: 'APP-2026-892',
          jobId: 'job-boesl-overseas-2026',
          jobTitle: 'উপ-সহকারী প্রকৌশলী',
          organization: 'বাংলাদেশ ওভারসিজ এমপ্লয়মেন্ট অ্যান্ড সার্ভিসেস লি.',
          postName: 'উপ-সহকারী প্রকৌশলী',
          candidateName: 'আরিফুল ইসলাম',
          candidatePhone: '01712345678',
          candidateDistrict: 'ঢাকা',
          date: '০৯ নভেম্বর ২০২৬',
          status: 'processing',
          totalAmount: 380,
          serviceCharge: 80,
          governmentFee: 300,
          paymentMethod: 'bKash',
          trxId: 'BK7Y21Q9MN',
          verificationType: 'user_reported',
          notes: 'অফিশিয়াল পোর্টালে ডাটা সাবমিশন চলমান।'
        }
      ];
      setApplications(demoApps);
      setSelectedApp(demoApps[0]);
    }

    const localSaved = storage.getSavedJobIds();
    if (localSaved && localSaved.length > 0) {
      setSavedJobIds(localSaved);
    } else {
      const defaultSaved = ['job-alljobs-15178', 'job-boesl-overseas-2026'];
      setSavedJobIds(defaultSaved);
    }

    // 2. Fetch public jobs to populate saved jobs metadata
    fetchPublicJobs().then((jobs) => {
      setAllJobs(jobs);
    }).catch(() => {});

    // 3. Sync from backend API
    fetch('/api/applications')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.success && Array.isArray(data.applications)) {
          setApplications(data.applications);
          if (data.applications.length > 0) {
            setSelectedApp(prev => {
              if (!prev) return data.applications[0];
              return data.applications.find((a: any) => a.id === prev.id) || data.applications[0];
            });
          }
        }
      })
      .catch(() => {});

    fetch('/api/candidate/saved-jobs')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data?.savedJobs)) {
          setSavedJobIds(data.savedJobs);
          storage.replaceSavedJobIds(data.savedJobs);
        }
      })
      .catch(() => {});

    // Listen to local storage events
    const handleSavedChange = () => setSavedJobIds(storage.getSavedJobIds());
    const handleAppsChange = () => setApplications(storage.getApplications());

    window.addEventListener('cs_saved_changed', handleSavedChange);
    window.addEventListener('cs_apps_changed', handleAppsChange);

    return () => {
      window.removeEventListener('cs_saved_changed', handleSavedChange);
      window.removeEventListener('cs_apps_changed', handleAppsChange);
    };
  }, []);

  // Filtered Applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        app.id.toLowerCase().includes(q) ||
        (app.postName && app.postName.toLowerCase().includes(q)) ||
        (app.organization && app.organization.toLowerCase().includes(q)) ||
        (app.trxId && app.trxId.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [applications, statusFilter, searchQuery]);

  // Full Details of Saved Jobs
  const savedJobObjects = useMemo(() => {
    return savedJobIds
      .map(id => allJobs.find(j => j.id === id))
      .filter((j): j is JobCircular => Boolean(j));
  }, [savedJobIds, allJobs]);

  const handleToggleRemoveSaved = async (jobId: string) => {
    storage.toggleSaveJob(jobId);
    setSavedJobIds(storage.getSavedJobIds());
    try {
      await fetch('/api/candidate/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action: 'unsave' })
      });
    } catch {}
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
        setDisputeSuccessMessage('✓ TrxID সফলভাবে জমা হয়েছে! আমাদের টিম দ্রুত যাচাই করে অনুমোদন করবে।');
        setTimeout(() => {
          setIsDisputeModalOpen(false);
          setDisputeSuccessMessage(null);
        }, 1800);
      } else {
        alert(data.error || 'TrxID আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch {
      alert('নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner with Live Stats */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black rounded-full inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>প্রার্থী পোর্টাল ও ট্র্যাকিং হাব</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight">
              আমার আবেদন ও ট্র্যাকিং ড্যাশবোর্ড
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              প্ল্যাটফর্মের মাধ্যমে দাখিলকৃত সকল সরকারি ও ব্যাংক চাকরির আবেদন, টেলিটক ফি পরিশোধের লাইভ অগ্রগতি এবং সংরক্ষিত সার্কুলারের ওয়ান-স্টপ ট্র্যাকিং।
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 block font-mono">
                {toBn(applications.length)}
              </span>
              <span className="text-[11px] text-slate-300 font-bold">মোট আবেদন</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <span className="text-xl sm:text-2xl font-black text-teal-300 block font-mono">
                {toBn(applications.filter(a => a.status === 'completed').length)}
              </span>
              <span className="text-[11px] text-slate-300 font-bold">স্লিপ রেডি</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
              <span className="text-xl sm:text-2xl font-black text-amber-300 block font-mono">
                {toBn(savedJobIds.length)}
              </span>
              <span className="text-[11px] text-slate-300 font-bold">সংরক্ষিত চাকরি</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('applications')}
          className={`px-5 py-2.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'applications'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-800/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>দাখিলকৃত আবেদনসমূহ ({toBn(applications.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`px-5 py-2.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-800/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>সংরক্ষিত সার্কুলার ({toBn(savedJobIds.length)})</span>
        </button>
      </div>

      {/* TAB 1: SUBMITTED APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          
          {/* Search & Status Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="ট্র্যাকিং আইডি, পদের নাম বা প্রতিষ্ঠান দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-bold">
              {[
                { id: 'all', label: 'সকল' },
                { id: 'completed', label: 'সম্পন্ন' },
                { id: 'processing', label: 'প্রসেসিং' },
                { id: 'pending_payment', label: 'পেন্ডিং' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === f.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Applications Cards List */}
            <div className="lg:col-span-2 space-y-3">
              {filteredApplications.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                const isCompleted = app.status === 'completed';
                const isProcessing = app.status === 'processing';
                const isPending = app.status === 'pending_payment';

                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs text-slate-500">
                        ট্র্যাকিং নং: {app.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isProcessing
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : isPending
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-800'
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
                        ) : isPending ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>পেমেন্ট যাচাইয়ের অপেক্ষায়</span>
                          </>
                        ) : (
                          <span>আবেদন গৃহীত</span>
                        )}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-base text-slate-900 leading-snug">
                        {app.postName}
                      </h3>
                      <div className="text-xs text-slate-600 font-semibold mt-0.5">
                        {app.organization}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>আবেদনের তারিখ: {app.date}</span>
                      <span className="font-bold text-slate-900">
                        মোট ফি: <strong className="text-emerald-700 font-mono">৳{toBn(app.totalAmount)}</strong> ({app.paymentMethod})
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredApplications.length === 0 && (
                <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 space-y-3">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <div className="font-bold text-slate-700 text-sm">কোনো আবেদন পাওয়া যায়নি।</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    আপনি এখনও কোনো চাকরির আবেদন দাখিল করেননি অথবা ফিল্টারে কোনো ম্যাচিং নেই।
                  </p>
                  <Link
                    href="/jobs"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                  >
                    <span>চলমান সার্কুলার দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Right Side: Selected Application Detail & Actions */}
            {selectedApp ? (
              <div className="space-y-4">
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>ভেরিফাইড আবেদন বিবরণী</span>
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      ID: {selectedApp.id}
                    </span>
                  </div>

                  {/* Tracking Channel & User ID */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-bold text-[11px]">
                        টেলিটক ইউজার আইডি (User ID):
                      </span>
                      <div className="flex items-center gap-1.5 font-mono font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        <span>{selectedApp.teleTalkTrackingId || selectedApp.id}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedApp.teleTalkTrackingId || selectedApp.id);
                            setCopiedUid(true);
                            setTimeout(() => setCopiedUid(false), 2000);
                          }}
                          className="text-[11px] text-emerald-700 hover:underline font-bold"
                          title="কপি করুন"
                        >
                          {copiedUid ? '✓ কপি' : 'কপি'}
                        </button>
                      </div>
                    </div>

                    {/* Password */}
                    {selectedApp.teleTalkPassword && (
                      <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                        <span className="text-slate-600 font-bold text-[11px]">
                          পাসওয়ার্ড / পিন (PIN):
                        </span>
                        <div className="flex items-center gap-1.5 font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                          <span>{selectedApp.teleTalkPassword}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedApp.teleTalkPassword!);
                              setCopiedPass(true);
                              setTimeout(() => setCopiedPass(false), 2000);
                            }}
                            className="text-[11px] text-emerald-700 hover:underline font-bold"
                            title="পাসওয়ার্ড কপি"
                          >
                            {copiedPass ? '✓ কপি' : 'কপি'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 divide-y divide-slate-100 text-slate-700">
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">পদ ও গ্রেড:</span>
                      <span className="font-bold text-slate-900 text-right">{selectedApp.postName}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">সংস্থা:</span>
                      <span className="font-bold text-slate-900 text-right">{selectedApp.organization}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">প্রার্থী নাম:</span>
                      <span className="font-bold text-slate-900 text-right">{selectedApp.candidateName}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">মোবাইল নম্বর:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedApp.candidatePhone}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">ট্রানজ্যাকশন আইডি (TrxID):</span>
                      <span className="font-mono font-bold text-slate-900">{selectedApp.trxId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">মোট পরিশোধিত ফি:</span>
                      <span className="font-mono font-black text-emerald-800 text-sm">৳{toBn(selectedApp.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Actions & Slip Download */}
                  <div className="pt-2 space-y-2">
                    {selectedApp.status === 'completed' ? (
                      <a
                        href={selectedApp.applicantCopyPdfUrl || '/demo-applicant-copy.pdf'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all text-center cursor-pointer hover:scale-[1.02]"
                      >
                        <Download className="w-4 h-4" />
                        <span>Applicant&apos;s Copy ডাউনলোড (PDF)</span>
                      </a>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-amber-900 font-bold text-[11px]">
                        ⏳ আবেদন সম্পন্ন হওয়ামাত্রই অফিশিয়াল অ্যাপ্লিকেশন কপি উন্মুক্ত হবে
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setReceiptApp(selectedApp)}
                      className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-700" />
                      <span>🖨️ অফিসিয়াল মানি রিসিট ও ভাউচার</span>
                    </button>

                    {(selectedApp.status === 'pending_payment' || selectedApp.status === 'rejected') && (
                      <button
                        type="button"
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
              </div>
            ) : null}

          </div>
        </div>
      )}

      {/* TAB 2: SAVED JOBS */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-emerald-700" />
              <span>আপনার সংরক্ষিত চাকরির তালিকা</span>
            </h2>
            <span className="text-xs font-bold text-slate-500">
              মোট {toBn(savedJobObjects.length)} টি সার্কুলার সংরক্ষিত
            </span>
          </div>

          {savedJobObjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedJobObjects.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 p-5 shadow-sm transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {job.categoryLabel || 'সরকারি চাকরি'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleRemoveSaved(job.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="সংরক্ষিত তালিকা থেকে মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="font-black text-slate-900 text-base leading-snug line-clamp-2">
                      {job.title}
                    </h3>
                    <div className="text-xs font-bold text-slate-600 line-clamp-1">
                      {job.organization}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block">শূন্যপদ:</span>
                        <span className="font-bold text-slate-800">{toBn(job.totalPosts)} টি</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">বেতন স্কেল:</span>
                        <span className="font-bold text-slate-800">{job.salary || job.grade}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>শেষ সময়: {job.deadline}</span>
                      </span>
                      <span className="text-slate-500 font-semibold">
                        বাকি {toBn(job.daysRemaining)} দিন
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href={`/jobs/${job.slug || job.id}`}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>বিস্তারিত</span>
                      </Link>
                      <Link
                        href={`/apply/${job.id}`}
                        className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold text-center transition-colors shadow-sm flex items-center justify-center gap-1"
                      >
                        <span>আবেদন</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 space-y-3">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="font-bold text-slate-700 text-sm">কোনো সংরক্ষিত চাকরি নেই।</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                সার্কুলার বিস্তারিত পাতায় গিয়ে &quot;সেভ&quot; আইকনে ক্লিক করলে পছন্দের চাকরিগুলো এখানে সরাসরি সংরক্ষিত থাকবে।
              </p>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                <span>চলমান চাকরি খুঁজুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* DISPUTE / TRXID CORRECTION MODAL */}
      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>TrxID সংশোধন বা পুনরায় জমা দিন</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsDisputeModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              যদি ভুল TrxID বা প্রেরক নম্বর দিয়ে থাকেন, তবে নিচে সঠিক তথ্য প্রদান করুন। আমাদের টিম তাৎক্ষণিকভাবে ভেরিফাই করে আবেদন সক্রিয় করবে।
            </p>

            <form onSubmit={handleDisputeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  সঠিক ট্রানজ্যাকশন আইডি (TrxID) *
                </label>
                <input
                  type="text"
                  required
                  value={disputeTrxId}
                  onChange={(e) => setDisputeTrxId(e.target.value.toUpperCase())}
                  placeholder="উদা: BK9X87M2LQ"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs uppercase focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Mobile) *
                </label>
                <input
                  type="text"
                  required
                  value={disputeSenderPhone}
                  onChange={(e) => setDisputeSenderPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {disputeSuccessMessage && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{disputeSuccessMessage}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDisputeModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispute}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition-colors"
                >
                  {isSubmittingDispute ? 'জমা হচ্ছে...' : 'আপডেট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE MONEY RECEIPT MODAL */}
      {receiptApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-700" />
                <h3 className="font-black text-slate-900 text-base">অফিসিয়াল মানি রিসিট ও ভাউচার</h3>
              </div>
              <button
                type="button"
                onClick={() => setReceiptApp(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-700">
              <div className="text-center pb-2 border-b border-slate-200">
                <div className="font-black text-slate-900 text-sm">চাকরি সেবা (Chakri Sheba)</div>
                <div className="text-[11px] text-slate-500">সরকারি ও ব্যাংক চাকরি অনলাইন আবেদন সহায়তা পোর্টাল</div>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">অর্ডার আইডি:</span>
                <span className="font-bold font-mono text-slate-900">{receiptApp.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">আবেদনের পদ:</span>
                <span className="font-bold text-slate-900 text-right">{receiptApp.postName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">প্রতিষ্ঠান:</span>
                <span className="font-bold text-slate-900 text-right">{receiptApp.organization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">প্রার্থীর নাম:</span>
                <span className="font-bold text-slate-900">{receiptApp.candidateName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">তারিখ ও সময়:</span>
                <span className="font-bold text-slate-900">{receiptApp.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">পেমেন্ট মেথড:</span>
                <span className="font-bold text-emerald-800">{receiptApp.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TrxID:</span>
                <span className="font-mono font-bold text-slate-900">{receiptApp.trxId || 'N/A'}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-emerald-950">
                <span>মোট পরিশোধিত ফি:</span>
                <span className="font-mono">৳{toBn(receiptApp.totalAmount)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setReceiptApp(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
