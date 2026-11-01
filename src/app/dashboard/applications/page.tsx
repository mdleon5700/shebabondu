'use client';

import React, { useState, useEffect } from 'react';
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
  Check
} from 'lucide-react';
import { storage } from '@/lib/store';
import { ApplicationRequest } from '@/lib/types';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRequest[]>(storage.getApplications());
  const [selectedApp, setSelectedApp] = useState<ApplicationRequest | null>(null);
  const [copiedSms1, setCopiedSms1] = useState(false);
  const [copiedSms2, setCopiedSms2] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [receiptApp, setReceiptApp] = useState<ApplicationRequest | null>(null);
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
  useEffect(() => {
    const loadApps = async () => {
      // 1. Initial fast local state
      const localApps = storage.getApplications();
      if (localApps.length > 0) {
        setApplications(localApps);
        setSelectedApp(prev => prev || localApps[0]);
      }

      // 2. Fetch live applications from authenticated backend API
      try {
        const res = await fetch('/api/applications', {
          headers: { 'Cache-Control': 'no-cache' }
        });
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

  const handleCopySms1 = (userId: string) => {
    navigator.clipboard.writeText(`${currentPrefix} ${userId}`);
    setCopiedSms1(true);
    setTimeout(() => setCopiedSms1(false), 2000);
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
    } catch (err) {
      alert('নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const handleCopySms2 = (pin: string) => {
    navigator.clipboard.writeText(`${currentPrefix} YES ${pin}`);
    setCopiedSms2(true);
    setTimeout(() => setCopiedSms2(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-700" />
          <span>আমার আবেদন ও লাইভ স্ট্যাটাস ট্র্যাকিং</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          আপনার দাখিলকৃত সকল চাকরির আবেদন, টেলিটক ফি পেমেন্ট ও প্রবেশপত্রের লাইভ স্ট্যাটাস।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left: Applications List */}
        <div className="md:col-span-2 space-y-3">
          {applications.map((app) => {
            const isCompleted = app.status === 'completed';
            const isProcessing = app.status === 'processing';
            const isPendingPayment = app.status === 'pending_payment';

            return (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  selectedApp?.id === app.id 
                    ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/10' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-500">ট্র্যাকিং নং: {app.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : isProcessing
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : isPendingPayment
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
                    ) : isPendingPayment ? (
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
                  <h3 className="font-bold text-base text-slate-900">{app.postName}</h3>
                  <div className="text-xs text-slate-500">{app.organization}</div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span>তারিখ: {app.date}</span>
                  <span>মোট ফি: <strong>৳{app.totalAmount}</strong> ({app.paymentMethod})</span>
                </div>
              </div>
            );
          })}

          {applications.length === 0 && (
            <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm">কোনো আবেদন পাওয়া যায়নি।</p>
              <Link href="/jobs" className="mt-3 inline-block px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold">
                চলতি সার্কুলার দেখুন
              </Link>
            </div>
          )}
        </div>

        {/* Right: Selected App Details & Slip Download */}
        {selectedApp && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>টেলিটক ভেরিফাইড ট্র্যাকিং</span>
              </h3>

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
                      <span>{selectedApp.teleTalkTrackingId || selectedApp.corporateTrackingId || selectedApp.id}</span>
                      <button
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
                        🔑 টেলিটক পাসওয়ার্ড / পিন (Password):
                      </span>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <span>{selectedApp.teleTalkPassword}</span>
                        <button
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
                  <span className={`font-bold ${selectedApp.status === 'completed' ? 'text-emerald-700' : selectedApp.status === 'processing' ? 'text-blue-700' : 'text-amber-700'}`}>
                    {selectedApp.status === 'completed' ? '✓ আবেদন সম্পন্ন' : selectedApp.status === 'processing' ? '⚙️ টিম পূরণ করছে' : '⏳ পেন্ডিং'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">প্রার্থী নাম:</span>
                  <span className="font-bold text-slate-800">{selectedApp.candidateName}</span>
                </div>
              </div>

              {/* Applicant's Copy PDF Download & Official Receipt Voucher */}
              <div className="pt-2 space-y-2">
                {selectedApp.status === 'completed' ? (
                  <a
                    href={selectedApp.applicantCopyPdfUrl || '/demo-applicant-copy.pdf'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors text-center"
                  >
                    <Download className="w-4 h-4" />
                    <span>Applicant&apos;s Copy ডাউনলোড (PDF)</span>
                  </a>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 font-bold text-[11px]">
                    ⏳ আবেদন সম্পন্ন হওয়ামাত্রই অফিশিয়াল অ্যাপ্লিকেশন স্লিপ উন্মুক্ত হবে
                  </div>
                )}

                {/* Printable Money Voucher Button */}
                <button
                  type="button"
                  onClick={() => setReceiptApp(selectedApp)}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs text-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-700" />
                  <span>🖨️ অফিসিয়াল মানি রিসিট ও ভাউচার</span>
                </button>

                {/* Dispute / TrxID Correction Button */}
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

            {/* Submission Channel Helper Box */}
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
                        onClick={() => {
                          navigator.clipboard.writeText(`${currentPrefix} YES ${selectedApp.teleTalkPassword}`);
                          setCopiedSms2(true);
                          setTimeout(() => setCopiedSms2(false), 2000);
                        }}
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

      {/* DISPUTE / CORRECT TRXID MODAL */}
      {isDisputeModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-900 text-sm">TrxID সংশোধন বা পুনরায় জমা দিন</h3>
              </div>
              <button
                type="button"
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
                  placeholder="যেমন: 01700000000"
                  value={disputeSenderPhone}
                  onChange={(e) => setDisputeSenderPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {disputeSuccessMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
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
                  disabled={isSubmittingDispute}
                  className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
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
        <div id="official-printable-receipt-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
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
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ প্রিন্ট করুন</span>
                </button>
                <button
                  type="button"
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
                    হেল্পলাইন: ০১৭০০-০০০০০০ • ওয়েবসাইট: chakrisheba.com • ইমেইল: support@chakrisheba.com
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