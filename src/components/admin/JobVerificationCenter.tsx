'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Sparkles, 
  RefreshCw, 
  Edit3, 
  Check, 
  X, 
  ExternalLink, 
  Eye, 
  Search, 
  Scale, 
  Clock, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CircularDraft } from '@/lib/types';
import { VerificationStatus } from '@/lib/verification/types';
import GeminiManagementCenter from './GeminiManagementCenter';

interface JobVerificationCenterProps {
  drafts: CircularDraft[];
  onRefreshDrafts: () => Promise<void>;
  onApproveDraft?: (draft: CircularDraft) => Promise<void>;
  onRejectDraft?: (draft: CircularDraft) => Promise<void>;
}

export default function JobVerificationCenter({
  drafts,
  onRefreshDrafts
}: JobVerificationCenterProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDraft, setSelectedDraft] = useState<CircularDraft | null>(null);
  const [activeTabInModal, setActiveTabInModal] = useState<'overview' | 'fields' | 'eligibility' | 'evidence' | 'corrections'>('overview');
  
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [isVerifyingAll, setIsVerifyingAll] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  const [selectedFieldForAction, setSelectedFieldForAction] = useState<string>('vacancies');
  const [isAiCenterOpen, setIsAiCenterOpen] = useState<boolean>(false);
  const [customFieldValue, setCustomFieldValue] = useState<string>('');
  const [actionReason, setActionReason] = useState<string>('');
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  const stats = useMemo(() => {
    let verified = 0;
    let warnings = 0;
    let conflicts = 0;
    let needsReview = 0;
    let unverified = 0;

    for (const d of drafts) {
      const v = d.verificationResult;
      if (!v) {
        unverified++;
      } else if (v.status === 'VERIFIED') {
        verified++;
      } else if (v.status === 'VERIFIED_WITH_WARNINGS') {
        warnings++;
      } else if (v.status === 'CONFLICT_DETECTED') {
        conflicts++;
      } else {
        needsReview++;
      }
    }

    return { total: drafts.length, verified, warnings, conflicts, needsReview, unverified };
  }, [drafts]);

  const filteredDrafts = useMemo(() => {
    return drafts.filter(draft => {
      const matchesSearch = 
        draft.extractedTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        draft.extractedOrg.toLowerCase().includes(searchQuery.toLowerCase()) ||
        draft.sourceName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const status = draft.verificationResult?.status;
      if (statusFilter === 'all') return true;
      if (statusFilter === 'unverified') return !status;
      if (statusFilter === 'verified') return status === 'VERIFIED';
      if (statusFilter === 'warnings') return status === 'VERIFIED_WITH_WARNINGS';
      if (statusFilter === 'conflicts') return status === 'CONFLICT_DETECTED';
      if (statusFilter === 'needs_review') return status === 'NEEDS_MANUAL_REVIEW';

      return true;
    });
  }, [drafts, searchQuery, statusFilter]);

  const handleRunVerification = async (draftId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsVerifying(draftId);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    try {
      const res = await fetch('/api/admin/verification/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId, forceRerun: true })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'যাচাইকরণ ব্যর্থ হয়েছে');
      }

      await onRefreshDrafts();
      setActionSuccessMsg('সার্কুলার যাচাই ও AI অডিট সফলভাবে সম্পন্ন হয়েছে!');

      if (selectedDraft?.id === draftId) {
        const updated = drafts.find(d => d.id === draftId);
        if (updated) setSelectedDraft(updated);
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || 'যাচাইকরণ প্রক্রিয়ায় ত্রুটি ঘটেছে');
    } finally {
      setIsVerifying(null);
    }
  };

  const handleVerifyAll = async () => {
    setIsVerifyingAll(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    try {
      const res = await fetch('/api/admin/verification/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runAll: true })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ব্যাচ যাচাইকরণ ব্যর্থ হয়েছে');
      }

      await onRefreshDrafts();
      setActionSuccessMsg(`ব্যাচ যাচাই সম্পন্ন: মোট ${data.report?.totalProcessed || 0}টি ড্রাফট প্রক্রিয়াজাত হয়েছে`);
    } catch (err: any) {
      setActionErrorMsg(err.message || 'ব্যাচ প্রক্রিয়াকরণে ত্রুটি');
    } finally {
      setIsVerifyingAll(false);
    }
  };

  const handleResolveConflict = async (fieldName: string, chosenValue: any) => {
    if (!selectedDraft) return;
    setIsSubmittingAction(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/verification/${selectedDraft.id}/resolve-conflict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: fieldName,
          chosenValue,
          reason: actionReason || 'অ্যাডমিন কর্তৃক দ্বন্দ্ব সমাধান ও সঠিক মান নির্ধারণ'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'বিরোধ সমাধানে ত্রুটি');
      }

      await onRefreshDrafts();
      setActionSuccessMsg(`"${fieldName}" ক্ষেত্রের দ্বন্দ্ব সফলভাবে সমাধান হয়েছে`);
      setActionReason('');

      const updated = drafts.find(d => d.id === selectedDraft.id);
      if (updated) setSelectedDraft(updated);
    } catch (err: any) {
      setActionErrorMsg(err.message);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleCorrectField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDraft || !customFieldValue || !actionReason) {
      setActionErrorMsg('নতুন মান এবং পরিবর্তনের কারণ উভয়ই আবশ্যক');
      return;
    }
    setIsSubmittingAction(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/verification/${selectedDraft.id}/correct-field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: selectedFieldForAction,
          correctedValue: customFieldValue,
          reason: actionReason
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ফিল্ড সংশোধনে ত্রুটি');
      }

      await onRefreshDrafts();
      setActionSuccessMsg(`"${selectedFieldForAction}" ক্ষেত্রটি সফলভাবে সংশোধন করা হয়েছে`);
      setCustomFieldValue('');
      setActionReason('');

      const updated = drafts.find(d => d.id === selectedDraft.id);
      if (updated) setSelectedDraft(updated);
    } catch (err: any) {
      setActionErrorMsg(err.message);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleApproveVerification = async (draftId: string) => {
    try {
      const res = await fetch(`/api/admin/verification/${draftId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishDirectly: false })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'অনুমোদন ব্যর্থ হয়েছে');
      }

      await onRefreshDrafts();
      setActionSuccessMsg('সার্কুলার যাচাই সফলভাবে অনুমোদিত হয়েছে। কনটেন্ট তৈরির জন্য প্রস্তুত।');
      setSelectedDraft(null);
    } catch (err: any) {
      setActionErrorMsg(err.message);
    }
  };

  const renderStatusBadge = (status?: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>সম্পূর্ণ যাচাইকৃত</span>
          </span>
        );
      case 'VERIFIED_WITH_WARNINGS':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>সতর্কতাসহ সমর্থিত</span>
          </span>
        );
      case 'CONFLICT_DETECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 animate-pulse">
            <Scale className="w-3.5 h-3.5 text-rose-600" />
            <span>তথ্যগত বিরোধ (দ্বন্দ্ব)</span>
          </span>
        );
      case 'NEEDS_MANUAL_REVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>ম্যানুয়াল পর্যালোচনা আবশ্যক</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>যাচাই অপেক্ষমাণ</span>
          </span>
        );
    }
  };

  const renderAuthorityBadge = (level?: number) => {
    switch (level) {
      case 1:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-700 text-white tracking-wide">
            GOV TIER 1
          </span>
        );
      case 2:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-700 text-white tracking-wide">
            PORTAL TIER 2
          </span>
        );
      case 3:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-sky-700 text-white tracking-wide">
            MEDIA TIER 3
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-500 text-white tracking-wide">
            AGGREGATOR TIER 4
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & KPI CARDS */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-black text-lg text-slate-900">সার্কুলার যাচাই ও AI ইন্টেলিজেন্স অডিট</h2>
                <p className="text-xs text-slate-500 font-medium">
                  সোর্স সত্যতা, অফিসিয়াল PDF সামঞ্জস্য, Gemini AI ফ্যাক্ট-চেকিং ও বিরোধ নিষ্পত্তি সেন্টার
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isVerifyingAll}
              onClick={handleVerifyAll}
              className="px-4 py-2 bg-gradient-to-r from-indigo-700 to-purple-800 hover:from-indigo-800 hover:to-purple-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {isVerifyingAll ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>সব অপেক্ষমাণ সার্কুলার অটো-যাচাই</span>
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {actionSuccessMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {actionErrorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{actionErrorMsg}</span>
            </div>
            <button onClick={() => setActionErrorMsg(null)} className="text-rose-600 hover:text-rose-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-500 block">মোট সংগৃহীত ড্রাফট</span>
            <div className="text-xl font-black text-slate-900">{stats.total}টি</div>
            <span className="text-[10px] text-slate-400 font-medium">ইনজেস্টকৃত সার্কুলার</span>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 block">সম্পূর্ণ যাচাইকৃত</span>
            <div className="text-xl font-black text-emerald-900">{stats.verified}টি</div>
            <span className="text-[10px] text-emerald-600 font-medium">১০০% সামঞ্জস্যপূর্ণ</span>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-amber-700 block">সতর্কতাসহ সমর্থিত</span>
            <div className="text-xl font-black text-amber-900">{stats.warnings}টি</div>
            <span className="text-[10px] text-amber-600 font-medium">সংশোধনী বা বিশেষ নোটিশ</span>
          </div>

          <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-rose-700 block">তথ্য দ্বন্দ্ব (Conflicts)</span>
            <div className="text-xl font-black text-rose-900">{stats.conflicts}টি</div>
            <span className="text-[10px] text-rose-600 font-medium">HTML vs PDF অমিল</span>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200/80 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-blue-700 block">পর্যালোচনা আবশ্যক</span>
            <div className="text-xl font-black text-blue-900">{stats.needsReview}টি</div>
            <span className="text-[10px] text-blue-600 font-medium">অসম্পূর্ণ বা বিশেষ নোটিশ</span>
          </div>

          <div 
            onClick={() => setIsAiCenterOpen(true)} 
            className="p-4 bg-purple-50 border border-purple-200/80 rounded-2xl space-y-1 cursor-pointer hover:bg-purple-100/70 transition-all shadow-2xs"
            title="AI প্রোভাইডার কনফিগারেশন ও টোকেন এনালিটিক্স খুলুন"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-700 block">AI প্রোভাইডার স্ট্যাটাস</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-sm font-black text-purple-900 flex items-center gap-1.5 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Gemini 3.5 Flash</span>
            </div>
            <span className="text-[10px] text-purple-600 font-medium">রেসপন্স ~২.১ সেকেন্ড</span>
          </div>
        </div>

        {/* 2. FILTER & SEARCH BAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'সকল ড্রাফট', count: stats.total },
              { id: 'verified', label: 'যাচাইকৃত', count: stats.verified },
              { id: 'warnings', label: 'সতর্কতাযুক্ত', count: stats.warnings },
              { id: 'conflicts', label: 'দ্বন্দ্ব (Conflict)', count: stats.conflicts },
              { id: 'needs_review', label: 'রিভিউ আবশ্যক', count: stats.needsReview },
              { id: 'unverified', label: 'অযাচাইকৃত', count: stats.unverified }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  statusFilter === tab.id ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative shrink-0 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="সার্কুলার বা প্রতিষ্ঠান খুঁজুন..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 3. VERIFICATION QUEUE TABLE */}
        <div className="space-y-3">
          {filteredDrafts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-500">কোনো ড্রাফট পাওয়া যায়নি</p>
            </div>
          ) : (
            filteredDrafts.map(draft => {
              const vr = draft.verificationResult;
              const authorityLevel = vr?.sourceAuthority?.level || (draft.sourceUrl?.includes('.gov.bd') ? 1 : 2);
              const score = Math.round((vr?.confidenceScore || draft.confidenceScore || 0) * 100);

              return (
                <div
                  key={draft.id}
                  className="p-4 sm:p-5 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/90 rounded-2xl transition-all space-y-3"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {renderAuthorityBadge(authorityLevel)}
                        {renderStatusBadge(vr?.status)}
                        <span className="font-black text-sm text-slate-900 truncate">
                          {draft.extractedTitle}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-800 uppercase font-mono">
                          {draft.category}
                        </span>
                        {draft.isCancellationNotice && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            বাতিল / স্থগিত বিজ্ঞপ্তি
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                        <span className="font-bold text-slate-800">{draft.extractedOrg}</span>
                        <span>•</span>
                        <span>উৎস: {draft.sourceName}</span>
                        {draft.evidenceUrl && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                              <FileText className="w-3 h-3" />
                              <span>অফিসিয়াল PDF সংরক্ষিত</span>
                            </span>
                          </>
                        )}
                        {draft.refNo && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500">স্মারক: {draft.refNo}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-[11px] font-bold text-slate-500">কনফিডেন্স স্কোর</div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                score >= 85 ? 'bg-emerald-600' : score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-black text-slate-800 font-mono">{score}%</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isVerifying === draft.id}
                        onClick={(e) => handleRunVerification(draft.id, e)}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                        title="AI ও ডিটারমিনিস্টিক পুনর্যাচাই চালান"
                      >
                        {isVerifying === draft.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        )}
                        <span>{vr ? 'পুনর্যাচাই' : 'যাচাই চালান'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDraft(draft);
                          setActiveTabInModal('overview');
                        }}
                        className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>বিস্তারিত অডিট</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApproveVerification(draft.id)}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>যাচাই অনুমোদন</span>
                      </button>
                    </div>
                  </div>

                  {/* Fact Summary Preview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-200/60">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">পদসংখ্যা</span>
                      <span className="font-bold text-slate-800">{draft.vacancies > 0 ? `${draft.vacancies}টি` : 'অনুল্লিখিত'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">আবেদনের শেষ সময়</span>
                      <span className="font-bold text-slate-800">{draft.deadline || 'অনির্দিষ্ট'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">সরকারি ফি</span>
                      <span className="font-bold text-slate-800">{draft.govtFee > 0 ? `৳${draft.govtFee}` : 'বিজ্ঞপ্তি অনুসারে'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold">শিক্ষাগত যোগ্যতা</span>
                      <span className="font-bold text-slate-800 truncate block">{draft.minEducation || 'নথিতে দেখুন'}</span>
                    </div>
                  </div>

                  {/* Bengali summary preview if verified */}
                  {vr?.bengaliSummary && (
                    <div className="p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <p className="line-clamp-2 leading-relaxed font-medium">
                        {vr.bengaliSummary}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* AI MANAGEMENT CENTER MODAL */}
      <GeminiManagementCenter isOpen={isAiCenterOpen} onClose={() => setIsAiCenterOpen(false)} />

      {/* 4. DEEP AUDIT & CONFLICT RESOLUTION MODAL */}
      {selectedDraft && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    ID: {selectedDraft.id}
                  </span>
                  {renderAuthorityBadge(selectedDraft.verificationResult?.sourceAuthority?.level)}
                  {renderStatusBadge(selectedDraft.verificationResult?.status)}
                </div>
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  {selectedDraft.extractedTitle}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  প্রতিষ্ঠান: <span className="font-bold text-slate-800">{selectedDraft.extractedOrg}</span> • উৎস: {selectedDraft.sourceName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDraft(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
              {[
                { id: 'overview', label: 'সারসংক্ষেপ ও AI ব্যাখ্যা' },
                { id: 'fields', label: 'ফিল্ডভিত্তিক তুলনা ও দ্বন্দ্ব' },
                { id: 'eligibility', label: 'বয়স ও যোগ্যতা অ্যানালাইসিস' },
                { id: 'evidence', label: 'মূল সোর্স ও নথির টেক্সট' },
                { id: 'corrections', label: 'অ্যাডমিন অডিট লগ ও সংশোধন' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTabInModal(t.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    activeTabInModal === t.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: 1. OVERVIEW & EXPLANATION */}
            {activeTabInModal === 'overview' && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-900 font-black text-xs">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>বাংলায় যাচাইকরণ বিশ্লেষণ ও পর্যবেক্ষণ:</span>
                  </div>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                    {selectedDraft.verificationResult?.bengaliSummary || 
                     'সার্কুলারটির বিস্তারিত যাচাই সম্পন্ন হয়নি। "পুনরায় যাচাই চালান" বাটনে ক্লিক করুন।'}
                  </p>
                </div>

                {selectedDraft.verificationResult?.scoreBreakdown && (
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black text-slate-800">কনফিডেন্স স্কোর বিশদ মূল্যায়ন (৪-স্তরের অডিট):</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-600">
                          <span>সোর্স অথরিটি (২৫%)</span>
                          <span>{Math.round(selectedDraft.verificationResult.scoreBreakdown.authorityScore * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${selectedDraft.verificationResult.scoreBreakdown.authorityScore * 100}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-600">
                          <span>ডকুমেন্ট নির্ভুলতা (২০%)</span>
                          <span>{Math.round(selectedDraft.verificationResult.scoreBreakdown.documentScore * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${selectedDraft.verificationResult.scoreBreakdown.documentScore * 100}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-600">
                          <span>ক্ষেত্র সামঞ্জস্য (৩৫%)</span>
                          <span>{Math.round(selectedDraft.verificationResult.scoreBreakdown.fieldConcordanceScore * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div className="bg-purple-600 h-full rounded-full" style={{ width: `${selectedDraft.verificationResult.scoreBreakdown.fieldConcordanceScore * 100}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-600">
                          <span>AI সত্যতা যাচাই (২০%)</span>
                          <span>{Math.round(selectedDraft.verificationResult.scoreBreakdown.aiVerificationScore * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${selectedDraft.verificationResult.scoreBreakdown.aiVerificationScore * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDraft.verificationResult?.unresolvedWarnings && selectedDraft.verificationResult.unresolvedWarnings.length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                    <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>চিহ্নিত সতর্কবার্তা ও তথ্যগত নোট:</span>
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-amber-800">
                      {selectedDraft.verificationResult.unresolvedWarnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 2. FIELD CONCORDANCE */}
            {activeTabInModal === 'fields' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 rounded-l-xl">ক্ষেত্র (Field)</th>
                        <th className="p-2.5">HTML মান</th>
                        <th className="p-2.5">PDF মান</th>
                        <th className="p-2.5">চূড়ান্ত যাচাইকৃত মান</th>
                        <th className="p-2.5">স্ট্যাটাস</th>
                        <th className="p-2.5 rounded-r-xl">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedDraft.verificationResult?.fields ? (
                        Object.entries(selectedDraft.verificationResult.fields).map(([key, f]) => {
                          const isConflict = f.verificationStatus === 'CONFLICTING';
                          return (
                            <tr key={key} className={isConflict ? 'bg-rose-50/70 font-semibold' : 'hover:bg-slate-50'}>
                              <td className="p-2.5 font-bold text-slate-900">{f.field}</td>
                              <td className="p-2.5 text-slate-600">{String(f.extractedValue ?? 'অনুপস্থিত')}</td>
                              <td className="p-2.5 text-slate-600">{String(f.originalText ?? '—')}</td>
                              <td className="p-2.5 font-bold text-slate-900">{String(f.normalizedValue ?? f.extractedValue)}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  f.verificationStatus === 'VERIFIED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : f.verificationStatus === 'CONFLICTING'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {f.verificationStatus}
                                </span>
                              </td>
                              <td className="p-2.5">
                                {isConflict && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      disabled={isSubmittingAction}
                                      onClick={() => handleResolveConflict(f.field, f.extractedValue)}
                                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[10px] font-bold text-slate-700"
                                      title="HTML মান গ্রহণ করুন"
                                    >
                                      HTML নিন
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isSubmittingAction}
                                      onClick={() => handleResolveConflict(f.field, f.originalText)}
                                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded text-[10px] font-bold text-indigo-700"
                                      title="PDF মান গ্রহণ করুন"
                                    >
                                      PDF নিন
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-slate-400">
                            ক্ষেত্রভিত্তিক যাচাইকরণ চালানো হয়নি।
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Manual Correction Form */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>মানব অ্যাডমিন তথ্য সংশোধন ও অডিট লগিং:</span>
                  </h4>
                  <form onSubmit={handleCorrectField} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">ক্ষেত্র নির্ধারণ করুন</label>
                      <select
                        value={selectedFieldForAction}
                        onChange={e => setSelectedFieldForAction(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      >
                        <option value="vacancies">পদসংখ্যা (vacancies)</option>
                        <option value="deadline">আবেদনের শেষ তারিখ (deadline)</option>
                        <option value="govtFee">আবেদন ফি (govtFee)</option>
                        <option value="minEducation">শিক্ষাগত যোগ্যতা (minEducation)</option>
                        <option value="salary">বেতন স্কেল (salary)</option>
                        <option value="title">সার্কুলার শিরোনাম (title)</option>
                        <option value="organizationName">প্রতিষ্ঠানের নাম (organizationName)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">সংশোধিত নতুন মান</label>
                      <input
                        type="text"
                        placeholder="সঠিক মান লিখুন..."
                        value={customFieldValue}
                        onChange={e => setCustomFieldValue(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">পরিবর্তনের কারণ (অডিট ট্রেইল)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="যুক্তি বা রেফারেন্স..."
                          value={actionReason}
                          onChange={e => setActionReason(e.target.value)}
                          className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingAction}
                          className="px-3 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shrink-0 disabled:opacity-50"
                        >
                          সংরক্ষণ
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 3. ELIGIBILITY */}
            {activeTabInModal === 'eligibility' && (
              <div className="space-y-4 text-xs">
                {selectedDraft.verificationResult?.geminiVerification?.eligibilityAnalysis ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <span className="text-[11px] font-black text-slate-700 block">বয়সসীমা বিশ্লেষণ</span>
                      <div className="space-y-1 text-slate-600">
                        <div>ন্যূনতম বয়স: <span className="font-bold text-slate-900">{selectedDraft.verificationResult.geminiVerification.eligibilityAnalysis.age.minAge || '১৮'} বছর</span></div>
                        <div>সর্বোচ্চ বয়স: <span className="font-bold text-slate-900">{selectedDraft.verificationResult.geminiVerification.eligibilityAnalysis.age.maxAge || '৩০'} বছর</span></div>
                        <div>কোটা শিথিলতা: <span className="font-bold text-emerald-700">{selectedDraft.verificationResult.geminiVerification.eligibilityAnalysis.age.relaxationCondition || 'নাই'}</span></div>
                        {selectedDraft.verificationResult.geminiVerification.eligibilityAnalysis.age.rawText && (
                          <div className="pt-1 text-[10px] text-slate-400 italic">
                            "{selectedDraft.verificationResult.geminiVerification.eligibilityAnalysis.age.rawText}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <span className="text-[11px] font-black text-slate-700 block">শিক্ষাগত যোগ্যতা</span>
                      <div className="space-y-1 text-slate-600">
                        <div>ডিগ্রি: <span className="font-bold text-slate-900">{selectedDraft.verificationResult.geminiVerification.eligibilityAnalysis.education.degree || 'অনুল্লিখিত'}</span></div>
                        <div>বিষয় / ডিসিপ্লিন: <span className="font-bold text-slate-900">{selectedDraft.verificationResult.geminiVerification.eligibilityAnalysis.education.subject || 'প্রাসঙ্গিক'}</span></div>
                        <div>ন্যূনতম CGPA: <span className="font-bold text-slate-900">{selectedDraft.verificationResult.geminiVerification.eligibilityAnalysis.education.minimumCgpa || '—'}</span></div>
                        {selectedDraft.verificationResult.geminiVerification.eligibilityAnalysis.education.rawText && (
                          <div className="pt-1 text-[10px] text-slate-400 italic">
                            "{selectedDraft.verificationResult.geminiVerification.eligibilityAnalysis.education.rawText}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <span className="text-[11px] font-black text-slate-700 block">অভিজ্ঞতার শর্তাবলি</span>
                      <div className="space-y-1 text-slate-600">
                        <div>প্রয়োজনীয় অভিজ্ঞতা: <span className="font-bold text-slate-900">{selectedDraft.verificationResult.geminiVerification.eligibilityAnalysis.experience.requiredYears || 0} বছর</span></div>
                        <div>ফ্রেশার আবেদন করতে পারবেন: <span className="font-bold text-emerald-700">{selectedDraft.verificationResult.geminiVerification.eligibilityAnalysis.experience.isFresherAllowed ? 'হ্যাঁ' : 'না'}</span></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    যোগ্যতার বিস্তারিত বিশ্লেষণ প্রস্তুত করা হয়নি। "পুনরায় যাচাই চালান" বাটনে ক্লিক করুন।
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 4. EVIDENCE */}
            {activeTabInModal === 'evidence' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between font-bold text-slate-700">
                  <span>সোর্স লিঙ্ক: {selectedDraft.sourceUrl}</span>
                  <a
                    href={selectedDraft.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>ওয়েবসাইটে যান</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-slate-600 block">সংগৃহীত HTML টেক্সট এভিডেন্স:</span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto whitespace-pre-wrap text-slate-700">
                    {selectedDraft.rawEvidenceText || 'কোনো র’ এভিডেন্স টেক্সট পাওয়া যায়নি।'}
                  </div>
                </div>

                {selectedDraft.pdfEvidence && (
                  <div className="space-y-1.5 pt-2">
                    <span className="font-bold text-slate-600 block">
                      অফিসিয়াল PDF টেক্সট (মোট {selectedDraft.pdfEvidence.totalPages} পৃষ্ঠা):
                    </span>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto whitespace-pre-wrap text-slate-700">
                      {selectedDraft.pdfEvidence.rawTextByPage?.map(p => "--- PAGE " + p.pageNumber + " ---\n" + p.text).join("\n\n") || "PDF টেক্সট স্ট্রিম সংরক্ষিত হয়নি।"}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 5. CORRECTIONS */}
            {activeTabInModal === 'corrections' && (
              <div className="space-y-3 text-xs">
                {selectedDraft.adminCorrections && selectedDraft.adminCorrections.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDraft.adminCorrections.map(corr => (
                      <div key={corr.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900">ক্ষেত্র: {corr.field}</span>
                          <span className="text-[10px] text-slate-400">{new Date(corr.correctedAt).toLocaleString('bn-BD')}</span>
                        </div>
                        <div className="text-slate-600">
                          পূর্বের মান: <span className="line-through">{String(corr.previousValue)}</span> → নতুন মান: <span className="font-bold text-emerald-700">{String(corr.correctedValue)}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 italic">
                          কারণ: {corr.reason} (সংশোধনকারী: {corr.correctedBy})
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    সার্কুলারটিতে পূর্বে কোনো মানব অ্যাডমিন পরিবর্তন ঘটানো হয়নি।
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isVerifying === selectedDraft.id}
                  onClick={() => handleRunVerification(selectedDraft.id)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {isVerifying === selectedDraft.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>পুনরায় যাচাই চালান</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedDraft(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  বন্ধ করুন
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveVerification(selectedDraft.id)}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>যাচাই অনুমোদন ও কনটেন্ট স্টেজে পাঠান</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
