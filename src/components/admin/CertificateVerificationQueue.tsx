'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Eye,
  FileText,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  User,
  GraduationCap
} from 'lucide-react';

interface QueueItem {
  candidateId: string;
  candidateName: string;
  candidatePhone: string;
  recordId: string;
  recordType: 'education' | 'training';
  degreeOrTitle: string;
  institution: string;
  year?: string;
  result?: string;
  scale?: number;
  documentId?: string;
  documentUrl?: string;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'NEEDS_CORRECTION';
  verificationRemarks?: string;
  submittedAt?: string;
}

export default function CertificateVerificationQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [activeModalItem, setActiveModalItem] = useState<QueueItem | null>(null);
  const [decisionRemarks, setDecisionRemarks] = useState<string>('');
  const [decisionStatus, setDecisionStatus] = useState<'VERIFIED' | 'REJECTED' | 'NEEDS_CORRECTION'>('VERIFIED');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/certificates/queue?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        if (data.queue) setQueue(data.queue);
      }
    } catch (err) {
      console.error('Failed to fetch certificate verification queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleOpenDecisionModal = (item: QueueItem, targetStatus: 'VERIFIED' | 'REJECTED' | 'NEEDS_CORRECTION') => {
    setActiveModalItem(item);
    setDecisionStatus(targetStatus);
    if (targetStatus === 'VERIFIED') {
      setDecisionRemarks('অফিসিয়াল সনদপত্র ও রেজাল্ট শিট সফলভাবে যাচাই ও সত্যায়িত করা হয়েছে।');
    } else if (targetStatus === 'REJECTED') {
      setDecisionRemarks('সনদপত্রের তথ্যের সাথে দাখিলকৃত তথ্যের স্পষ্ট অমিল পাওয়া গেছে।');
    } else {
      setDecisionRemarks('সনদপত্রের স্পষ্ট ও রঙিন কপি পুনরায় আপলোড করুন।');
    }
  };

  const handleApplyDecision = async () => {
    if (!activeModalItem) return;
    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/certificates/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: activeModalItem.candidateId,
          recordId: activeModalItem.recordId,
          recordType: activeModalItem.recordType,
          status: decisionStatus,
          remarks: decisionRemarks
        })
      });

      if (res.ok) {
        const data = await res.json();
        showFeedback(data.messageBn || 'ভেরিফিকেশন সিদ্ধান্ত সফলভাবে প্রয়োগ করা হয়েছে।');
        setActiveModalItem(null);
        fetchQueue();
      } else {
        const errData = await res.json();
        alert(errData.error || 'ভেরিফিকেশন সম্পন্ন করা যায়নি।');
      }
    } catch (err) {
      console.error('Failed to apply verification decision:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQueue = queue.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.candidateName?.toLowerCase().includes(term) ||
      item.candidatePhone?.includes(term) ||
      item.degreeOrTitle?.toLowerCase().includes(term) ||
      item.institution?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-200">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  সনদপত্র ভেরিফিকেশন ও কোয়ালিফিকেশন রিভিউ কিউ
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Step 12 Verification Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                চাকরিপ্রার্থীদের আপলোডকৃত অ্যাকাডেমিক সার্টিফিকেট, রোল, রেজিস্ট্রেশন ও স্কেল সত্যতা যাচাই
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="প্রার্থীর নাম, ফোন বা ডিগ্রি..."
                className="text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 w-56"
              />
            </div>
            <button
              onClick={fetchQueue}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-5">
          {[
            { id: 'all', label: 'সকল সনদপত্র' },
            { id: 'PENDING_REVIEW', label: 'অপেক্ষমান (Pending)' },
            { id: 'VERIFIED', label: 'ভেরিফাইড (Verified)' },
            { id: 'REJECTED', label: 'বাতিলকৃত (Rejected)' },
            { id: 'NEEDS_CORRECTION', label: 'সংশোধন প্রয়োজন' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === f.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {actionSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Queue Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-amber-600" />
          ভেরিফিকেশন তালিকা ({filteredQueue.length}টি রেকর্ড)
        </h2>

        {filteredQueue.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            বর্তমানে পর্যালোচনার জন্য কোনো সনদপত্র অপেক্ষমান নেই।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="pb-3 pr-3">প্রার্থীর তথ্য</th>
                  <th className="pb-3 pr-3">ডিগ্রি ও শিক্ষা প্রতিষ্ঠান</th>
                  <th className="pb-3 pr-3">পাসের সন ও ফলাফল</th>
                  <th className="pb-3 pr-3">সনদপত্র ডকুমেন্ট</th>
                  <th className="pb-3 pr-3">স্ট্যাটাস</th>
                  <th className="pb-3 text-right">ভেরিফিকেশন অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3.5 pr-3">
                      <div className="font-bold text-slate-900">{item.candidateName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{item.candidatePhone}</div>
                      <div className="text-[10px] text-slate-400">ID: {item.candidateId}</div>
                    </td>
                    <td className="py-3.5 pr-3">
                      <div className="font-semibold text-slate-800">{item.degreeOrTitle}</div>
                      <div className="text-[11px] text-slate-500">{item.institution}</div>
                    </td>
                    <td className="py-3.5 pr-3">
                      <div className="font-bold text-slate-900">{item.result || 'অঘোষিত'}</div>
                      <div className="text-[11px] text-slate-500">সন: {item.year || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 pr-3">
                      {item.documentUrl ? (
                        <a
                          href={item.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-medium text-[11px]"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          সনদপত্র দেখুন
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">ফাইল সংযুক্ত নেই</span>
                      )}
                    </td>
                    <td className="py-3.5 pr-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : item.status === 'NEEDS_CORRECTION'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {item.status !== 'VERIFIED' && (
                        <button
                          onClick={() => handleOpenDecisionModal(item, 'VERIFIED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          অনুমোদন
                        </button>
                      )}
                      {item.status !== 'NEEDS_CORRECTION' && (
                        <button
                          onClick={() => handleOpenDecisionModal(item, 'NEEDS_CORRECTION')}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] border border-purple-200 transition-all inline-flex items-center gap-1"
                        >
                          সংশোধন
                        </button>
                      )}
                      {item.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleOpenDecisionModal(item, 'REJECTED')}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 transition-all inline-flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          বাতিল
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Remarks Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {decisionStatus === 'VERIFIED' ? 'সনদপত্র অনুমোদন ও ভেরিফিকেশন' : decisionStatus === 'REJECTED' ? 'সনদপত্র বাতিলের সিদ্ধান্ত' : 'সংশোধন তাগিদ নোটিশ'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-700">
              <div><strong>প্রার্থী:</strong> {activeModalItem.candidateName} ({activeModalItem.candidatePhone})</div>
              <div><strong>ডিগ্রি:</strong> {activeModalItem.degreeOrTitle}</div>
              <div><strong>প্রতিষ্ঠান:</strong> {activeModalItem.institution}</div>
              <div><strong>ফলাফল:</strong> {activeModalItem.result || 'N/A'}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                অ্যাডমিন ভেরিফিকেশন নোট / রিমার্কস (প্রার্থীর ইনবক্সে নোটিফিকেশন যাবে)
              </label>
              <textarea
                value={decisionRemarks}
                onChange={(e) => setDecisionRemarks(e.target.value)}
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="ভেরিফিকেশন কারণ বা প্রার্থীর করণীয় সম্পর্কে বিস্তারিত লিখুন..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
              >
                বাতিল
              </button>
              <button
                onClick={handleApplyDecision}
                disabled={submitting}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50 ${
                  decisionStatus === 'VERIFIED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : decisionStatus === 'REJECTED'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {submitting ? 'সংরক্ষণ হচ্ছে...' : 'নিশ্চিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
