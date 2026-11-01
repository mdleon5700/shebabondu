'use client';

import React from 'react';
import Link from 'next/link';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle,
  GraduationCap, 
  Briefcase, 
  Award, 
  MapPin, 
  Layers, 
  Building2, 
  Banknote,
  ArrowRight,
  ExternalLink,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  EyeOff
} from 'lucide-react';
import { EnrichedJobRecommendation, JobMatchResult } from '@/lib/matching/types';

interface MatchBreakdownModalProps {
  recommendation: EnrichedJobRecommendation | null;
  onClose: () => void;
  onFeedback?: (jobId: string, action: 'RELEVANT' | 'NOT_RELEVANT' | 'HIDDEN') => void;
  onToggleSave?: (jobId: string) => void;
}

export default function MatchBreakdownModal({
  recommendation,
  onClose,
  onFeedback,
  onToggleSave
}: MatchBreakdownModalProps) {
  if (!recommendation) return null;

  const { job, match, isSaved } = recommendation;
  const { breakdown } = match;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-teal-700 bg-teal-50 border-teal-200';
    if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-600';
    if (score >= 75) return 'bg-blue-600';
    if (score >= 60) return 'bg-teal-600';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${match.displayBandColor}`}>
                {match.displayBandBn}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                স্কোরিং ভার্সন: {match.scoringVersion}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {job.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              {job.organization}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Top Score Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center font-black shadow-md shadow-emerald-600/20">
                <span className="text-2xl leading-none">{match.overallScore}%</span>
                <span className="text-[10px] font-semibold text-emerald-100 uppercase tracking-wider">ম্যাচ</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  প্রোফাইল ম্যাচ স্কোর (Profile Match Score)
                </span>
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${match.eligibilityBadgeColor}`}>
                    {match.eligibilityStatus === 'MEETS_VERIFIED_REQUIREMENTS' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {match.eligibilityStatus === 'DOES_NOT_MEET_VERIFIED_REQUIREMENTS' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                    {match.eligibilityStatus === 'NEEDS_MORE_INFORMATION' && <HelpCircle className="w-3.5 h-3.5 text-amber-600" />}
                    {match.eligibilityLabelBn}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-slate-400">
              * রিকমেন্ডেশনটি আপনার বর্তমান প্রোফাইল ডাটার ভিত্তিতে তৈরি। এটি চূড়ান্ত নিয়োগ নিশ্চয়তা নয়।
            </div>
          </div>

          {/* Match Reasons */}
          {match.matchReasonsBn.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                কেন এই চাকরিটি আপনার জন্য উপযুক্ত (Match Reasons)
              </h3>
              <div className="space-y-1.5">
                {match.matchReasonsBn.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-slate-800 text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Qualification Gaps */}
          {match.qualificationGapsBn.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                কোথায় ঘাটতি বা অমিল রয়েছে (Identified Gaps)
              </h3>
              <div className="space-y-1.5">
                {match.qualificationGapsBn.map((gap, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-slate-800 text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{gap}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dimension by Dimension Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ৮-মাত্রিক ম্যাচিং বিশ্লেষণ (Dimension Breakdown)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Education */}
              <div className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-600" /> শিক্ষাগত যোগ্যতা ({breakdown.education.effectiveWeight}%)
                  </span>
                  <span className="text-xs font-bold text-slate-900">{breakdown.education.score}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${getProgressColor(breakdown.education.score)}`} style={{ width: `${breakdown.education.score}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  বিজ্ঞপ্তির শর্ত: {breakdown.education.detailsBn}
                </p>
              </div>

              {/* Skills */}
              <div className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" /> বিশেষ দক্ষতা ({breakdown.skills.effectiveWeight}%)
                  </span>
                  <span className="text-xs font-bold text-slate-900">{breakdown.skills.score}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${getProgressColor(breakdown.skills.score)}`} style={{ width: `${breakdown.skills.score}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {breakdown.skills.detailsBn}
                </p>
              </div>

              {/* Experience */}
              <div className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-purple-600" /> কাজের অভিজ্ঞতা ({breakdown.experience.effectiveWeight}%)
                  </span>
                  <span className="text-xs font-bold text-slate-900">{breakdown.experience.score}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${getProgressColor(breakdown.experience.score)}`} style={{ width: `${breakdown.experience.score}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {breakdown.experience.detailsBn}
                </p>
              </div>

              {/* Location */}
              <div className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-600" /> কর্মস্থল/এলাকা ({breakdown.location.effectiveWeight}%)
                  </span>
                  <span className="text-xs font-bold text-slate-900">{breakdown.location.score}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${getProgressColor(breakdown.location.score)}`} style={{ width: `${breakdown.location.score}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {breakdown.location.detailsBn}
                </p>
              </div>

              {/* Category */}
              <div className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-600" /> পছন্দের ক্যাটাগরি ({breakdown.category.effectiveWeight}%)
                  </span>
                  <span className="text-xs font-bold text-slate-900">{breakdown.category.score}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${getProgressColor(breakdown.category.score)}`} style={{ width: `${breakdown.category.score}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {breakdown.category.detailsBn}
                </p>
              </div>

              {/* Salary */}
              <div className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-teal-600" /> বেতন স্কেল ({breakdown.salary.effectiveWeight}%)
                  </span>
                  <span className="text-xs font-bold text-slate-900">{breakdown.salary.score}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${getProgressColor(breakdown.salary.score)}`} style={{ width: `${breakdown.salary.score}%` }}></div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {breakdown.salary.detailsBn}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1">মতামত:</span>
            <button
              onClick={() => onFeedback && onFeedback(job.id, 'RELEVANT')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-xs font-semibold text-slate-600 transition-all"
              title="উপযুক্ত সুপারিশ"
            >
              <ThumbsUp className="w-3.5 h-3.5" /> উপযুক্ত
            </button>
            <button
              onClick={() => onFeedback && onFeedback(job.id, 'NOT_RELEVANT')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-xs font-semibold text-slate-600 transition-all"
              title="প্রাসঙ্গিক নয়"
            >
              <ThumbsDown className="w-3.5 h-3.5" /> অমিল
            </button>
            <button
              onClick={() => onFeedback && onFeedback(job.id, 'HIDDEN')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-500 transition-all"
              title="হাইড করুন"
            >
              <EyeOff className="w-3.5 h-3.5" /> লুকান
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave && onToggleSave(job.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                isSaved 
                  ? 'bg-amber-50 text-amber-700 border-amber-300' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              {isSaved ? 'সংরক্ষিত' : 'সংরক্ষণ করুন'}
            </button>

            <Link
              href={`/jobs/${job.slug || job.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20"
            >
              সম্পূর্ণ সার্কুলার ও আবেদন <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
