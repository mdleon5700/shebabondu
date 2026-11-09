'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Search, 
  ShieldAlert, 
  Info, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { storage } from '@/lib/store';

const ISSUE_OPTIONS = [
  { id: 'fake_job', label: 'ভুয়া বা অননুমোদিত বিজ্ঞপ্তি (Fake / Unauthorized Job)', desc: 'সরকারি বা ব্যাংক বিজ্ঞপ্তির নামে ভুয়া সার্কুলার প্রচার' },
  { id: 'wrong_deadline', label: 'আবেদনের ডেডলাইন বা তারিখে অসঙ্গতি (Wrong Deadline / Dates)', desc: 'বিজ্ঞপ্তির আসল শেষ সময় বা চালানের সময়ের সাথে তথ্যের অমিল' },
  { id: 'fee_issue', label: 'আবেদন ফি নিয়ে বিভ্রান্তি (Fee Issue / Overcharge)', desc: 'টেলিটক চার্জ বা নির্ধারিত ফি এর চেয়ে বেশি দাবি করা' },
  { id: 'broken_link', label: 'অফিসিয়াল আবেদন লিংক কাজ করছে না (Broken Apply URL)', desc: 'টেলিটক বা ক্যারিয়ার ওয়েবসাইটের লিংক লোড হচ্ছে না' },
  { id: 'scam_warning', label: 'জালিয়াতি বা টাকা দাবির সতর্কতা (Scam / Fraud Request)', desc: 'চাকরি পাইয়ে দেওয়ার নামে কোনো ব্যক্তি বা গ্রুপ অর্থ দাবি করছে' },
  { id: 'other', label: 'অন্যান্য সমস্যা (Other Discrepancies)', desc: 'পদবী, শিক্ষাগত যোগ্যতা বা অভিজ্ঞতার বিবরণে ভুল' }
];

function ReportJobClient() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');

  // Submit form state
  const [jobTitle, setJobTitle] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobId, setJobId] = useState('');
  const [issueType, setIssueType] = useState('fake_job');
  const [details, setDetails] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<{ trackingCode: string; message: string } | null>(null);

  // Tracking tab state
  const [trackingInput, setTrackingInput] = useState('');
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackResult, setTrackResult] = useState<any | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Pre-fill from query params if candidate came from a specific circular
    const paramTitle = searchParams.get('title') || searchParams.get('jobTitle');
    const paramId = searchParams.get('jobId') || searchParams.get('id');
    const paramUrl = searchParams.get('url');

    if (paramTitle) setJobTitle(paramTitle);
    if (paramId) setJobId(paramId);
    if (paramUrl) setJobUrl(paramUrl);

    // 2. Pre-fill reporter info if logged in
    const user = storage.getUser();
    if (user && user.name) {
      setReporterName(user.nameBn || user.name);
      if (user.phone) setReporterPhone(user.phone);
      if (user.email) setReporterEmail(user.email);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !details.trim()) {
      setErrorMsg('বিজ্ঞপ্তির নাম এবং বিস্তারিত বিবরণ পূরণ করা আবশ্যক।');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const selectedOption = ISSUE_OPTIONS.find(o => o.id === issueType);

    try {
      const res = await fetch('/api/jobs/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: jobId || undefined,
          jobTitle: jobTitle.trim(),
          jobUrl: jobUrl.trim() || undefined,
          issueType,
          issueLabel: selectedOption?.label || 'সাধারণ অভিযোগ',
          details: details.trim(),
          reporterName: reporterName.trim() || undefined,
          reporterPhone: reporterPhone.trim() || undefined,
          reporterEmail: reporterEmail.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'অভিযোগ সাবমিট করা সম্ভব হয়নি।');
      }

      setSubmittedData({
        trackingCode: data.trackingCode,
        message: data.message
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'সার্ভার যোগাযোগে ত্রুটি হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;

    setIsTrackingLoading(true);
    setTrackError(null);
    setTrackResult(null);

    try {
      const res = await fetch(`/api/jobs/report?id=${encodeURIComponent(trackingInput.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.success || !data.report) {
        throw new Error(data.error || 'এই ট্র্যাকিং নম্বরের কোনো অভিযোগ পাওয়া যায়নি।');
      }
      setTrackResult(data.report);
    } catch (err: any) {
      setTrackError(err.message || 'তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsTrackingLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <Link href="/jobs" className="hover:text-emerald-700 transition-colors">চাকরি</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">ভুল তথ্য বা ভুয়া নিয়োগ রিপোর্ট</span>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-rose-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-400/30 rounded-full text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>সতর্কতা ও অভিযোগ পর্যবেক্ষণ সেল</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            চাকরির বিজ্ঞপ্তি সম্পর্কে রিপোর্ট করুন
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            কোনো বিজ্ঞপ্তিতে ভুল তথ্য, জাল সার্কুলার, অতিরিক্ত ফি দাবি বা প্রতারণার সন্দেহ হলে আমাদের জানান। আমাদের ফ্যাক্ট-চেক টিম দ্রুত ব্যবস্থা নিয়ে চাকরিপ্রার্থীদের সুরক্ষিত রাখে।
          </p>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold gap-1 shadow-inner">
        <button
          type="button"
          data-testid="tab-report-submit"
          onClick={() => setActiveTab('submit')}
          className={`py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'submit' 
              ? 'bg-white text-rose-700 shadow-sm font-black' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>অভিযোগ সাবমিট করুন</span>
        </button>

        <button
          type="button"
          data-testid="tab-report-track"
          onClick={() => setActiveTab('track')}
          className={`py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'track' 
              ? 'bg-white text-emerald-800 shadow-sm font-black' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4 text-emerald-600" />
          <span>অভিযোগের স্ট্যাটাস ট্র্যাক করুন</span>
        </button>
      </div>

      {/* TAB 1: SUBMIT REPORT */}
      {activeTab === 'submit' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          {submittedData ? (
            <div data-testid="report-submitted-card" className="bg-emerald-50 border border-emerald-300 rounded-3xl p-6 sm:p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900">আপনার রিপোর্টটি সফলভাবে গ্রহণ করা হয়েছে!</h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  আমাদের ফ্যাক্ট-চেকিং টিম বিজ্ঞপ্তিটি পুঙ্খানুপুঙ্খভাবে যাচাই করে উপযুক্ত প্রশাসনিক ব্যবস্থা গ্রহণ করবে।
                </p>
              </div>

              <div className="inline-block bg-white border border-emerald-300 px-6 py-3 rounded-2xl shadow-xs">
                <span className="text-[11px] text-slate-500 font-bold block uppercase tracking-wider">ট্র্যাকিং রেফারেন্স কোড</span>
                <span data-testid="report-tracking-code" className="text-xl font-mono font-black text-emerald-800 tracking-wider">{submittedData.trackingCode}</span>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTrackingInput(submittedData.trackingCode);
                    setActiveTab('track');
                    setSubmittedData(null);
                  }}
                  className="px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer"
                >
                  স্ট্যাটাস দেখুন
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedData(null);
                    setJobTitle('');
                    setDetails('');
                  }}
                  className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  আরেকটি অভিযোগ করুন
                </button>
                <Link
                  href="/jobs"
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  চাকরির তালিকায় ফিরুন
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Job Title & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বিজ্ঞপ্তি বা প্রতিষ্ঠানের নাম <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    data-testid="report-job-title-input"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="যেমন: ৪৭তম বিসিএস ক্যাডার নিয়োগ বা বাংলাদেশ ব্যাংক"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সার্কুলারের লিঙ্ক বা ইউআরএল (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    data-testid="report-job-url-input"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://chakrisheba.com/jobs/..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Issue Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  সমস্যার ধরন নির্বাচন করুন <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ISSUE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`issue-option-${opt.id}`}
                      onClick={() => setIssueType(opt.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        issueType === opt.id
                          ? 'bg-rose-50/80 border-rose-500 text-rose-950 font-bold shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{opt.label.split('(')[0]}</span>
                        {issueType === opt.id && <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  অভিযোগের বিস্তারিত বিবরণ <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  data-testid="report-details-input"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="বিজ্ঞপ্তির কোন তথ্যটি ভুল বা কীভাবে প্রতারণার চেষ্টা করা হচ্ছে তা বিস্তারিত বুঝিয়ে লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed"
                />
              </div>

              {/* Optional Reporter Info */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Info className="w-4 h-4 text-emerald-700" />
                  <span>আপনার যোগাযোগের তথ্য (ঐচ্ছিক - তদন্তে প্রয়োজনে আপডেট পেতে)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="আপনার নাম"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      placeholder="মোবাইল নম্বর"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                      placeholder="ইমেইল ঠিকানা"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                data-testid="report-submit-btn"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>অভিযোগ জমা নেওয়া হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>অভিযোগ সাবমিট করুন</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: TRACK STATUS */}
      {activeTab === 'track' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-base font-black text-slate-900">অভিযোগের লাইভ স্ট্যাটাস যাচাই</h2>
            <p className="text-xs text-slate-500">আপনার সাবমিট করা অভিযোগের ট্র্যাকিং কোড (যেমন: REP-2026-1001) দিয়ে বর্তমান অগ্রগতি দেখুন।</p>
          </div>

          <form onSubmit={handleTrackSearch} className="flex gap-2">
            <input
              type="text"
              required
              data-testid="report-track-input"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="ট্র্যাকিং রেফারেন্স কোড লিখুন (যেমন: REP-2026-1001)"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
            />
            <button
              type="submit"
              data-testid="report-track-submit-btn"
              disabled={isTrackingLoading}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              {isTrackingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>অনুসন্ধান</span>
            </button>
          </form>

          {trackError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{trackError}</span>
            </div>
          )}

          {trackResult && (
            <div data-testid="report-track-result" className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-fade-in">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">রেফারেন্স কোড</span>
                  <span className="text-base font-mono font-black text-slate-900">{trackResult.id}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  trackResult.status === 'resolved' 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : trackResult.status === 'investigating'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : trackResult.status === 'dismissed'
                    ? 'bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {trackResult.status === 'resolved' ? '✓ সমাধানকৃত ও সংশোধিত' : trackResult.status === 'investigating' ? '🔍 তদন্ত ও যাচাই চলছে' : trackResult.status === 'dismissed' ? '✕ অভিযোগ বাতিল / ভুয়া নয়' : '⏳ নতুন অভিযোগ (পর্যালোচনার অপেক্ষায়)'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[11px]">বিজ্ঞপ্তির নাম:</span>
                  <span className="font-bold text-slate-900">{trackResult.jobTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[11px]">সমস্যার ধরন:</span>
                  <span className="text-rose-700 font-semibold">{trackResult.issueLabel}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[11px]">অভিযোগ বিবরণ:</span>
                  <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed mt-1">
                    {trackResult.details}
                  </p>
                </div>
                {trackResult.adminNotes && (
                  <div>
                    <span className="text-emerald-700 font-bold block text-[11px]">অ্যাডমিন ও ফ্যাক্ট-চেক টিমের মন্তব্য:</span>
                    <p className="text-emerald-900 bg-emerald-50 p-3 rounded-xl border border-emerald-200 font-medium leading-relaxed mt-1">
                      {trackResult.adminNotes}
                    </p>
                  </div>
                )}
                <div className="text-[10px] text-slate-400 pt-1">
                  জমা দেওয়ার তারিখ: {new Date(trackResult.createdAt).toLocaleString('bn-BD')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReportJobPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto p-8 text-center text-xs text-slate-500">লোড হচ্ছে...</div>}>
      <ReportJobClient />
    </Suspense>
  );
}
