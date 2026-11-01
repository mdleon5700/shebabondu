'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  SlidersHorizontal, 
  ArrowRight, 
  Bookmark, 
  BookmarkCheck, 
  Building2, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  ThumbsUp, 
  ThumbsDown, 
  EyeOff, 
  RefreshCw, 
  Search,
  BarChart3,
  Award,
  Zap,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { storage } from '@/lib/store';
import { CandidateProfile } from '@/lib/types';
import { EnrichedJobRecommendation, RecommendationSectionFeeds } from '@/lib/matching/types';
import MatchBreakdownModal from '@/components/matching/MatchBreakdownModal';

export default function RecommendedJobsPage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [feeds, setFeeds] = useState<RecommendationSectionFeeds | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'best' | 'skills' | 'education' | 'location' | 'closingSoon' | 'recent'>('best');
  const [selectedJobForModal, setSelectedJobForModal] = useState<EnrichedJobRecommendation | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/recommendations?minScore=20&limit=100');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setFeeds(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = storage.getUser();
    if (user) {
      setProfile(user);
    }
    const saved = storage.getSavedJobIds();
    setSavedJobIds(saved || []);
    fetchRecommendations();
  }, []);

  const handleToggleSave = (jobId: string) => {
    storage.toggleSaveJob(jobId);
    setSavedJobIds(storage.getSavedJobIds());
  };

  const handleFeedback = async (jobId: string, action: 'RELEVANT' | 'NOT_RELEVANT' | 'HIDDEN') => {
    try {
      const res = await fetch('/api/user/recommendations/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, action })
      });
      if (res.ok) {
        setFeedbackSuccess(action === 'HIDDEN' ? 'সার্কুলার তালিকা থেকে লুকানো হয়েছে' : 'মতামত সফলভাবে সংরক্ষিত হয়েছে');
        setTimeout(() => setFeedbackSuccess(null), 3000);
        fetchRecommendations();
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const activeList = useMemo(() => {
    if (!feeds) return [];
    let list: EnrichedJobRecommendation[] = [];
    switch (activeTab) {
      case 'best':
        list = feeds.bestMatches || [];
        break;
      case 'skills':
        list = feeds.skillsMatches || [];
        break;
      case 'education':
        list = feeds.educationMatches || [];
        break;
      case 'location':
        list = feeds.locationMatches || [];
        break;
      case 'closingSoon':
        list = feeds.closingSoonMatches || [];
        break;
      case 'recent':
        list = feeds.recentlyPublishedMatches || [];
        break;
      default:
        list = feeds.bestMatches || [];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(r => 
        r.job.title?.toLowerCase().includes(q) ||
        r.job.organization?.toLowerCase().includes(q) ||
        r.job.categoryLabel?.toLowerCase().includes(q) ||
        r.job.districts?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      list = list.filter(r => r.job.category === selectedCategory);
    }

    return list;
  }, [feeds, activeTab, searchQuery, selectedCategory]);

  const completeness = feeds?.profileCompleteness?.percentage || 0;
  const totalMatchesCount = feeds?.totalEligibleMatches || 0;
  const excellentMatchesCount = feeds?.excellentMatchesCount || 0;
  const strongMatchesCount = feeds?.strongMatchesCount || 0;
  const locationMatchesCount = feeds?.locationMatches?.length || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header and Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>স্টেপ ০৯ — স্মার্ট জব ম্যাচিং ও পার্সোনালাইজড রিকমেন্ডেশন</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              আপনার জন্য সুপারিশকৃত চাকরি
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              আপনার শিক্ষাগত যোগ্যতা, অর্জিত স্কিল, কাজের অভিজ্ঞতা এবং পছন্দের লোকেশনের সাথে সরকারি ও বেসরকারি সার্কুলারগুলো বিশ্লেষণ করে এই তালিকা স্বয়ংক্রিয়ভাবে প্রস্তুত করা হয়েছে।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 w-full sm:w-auto min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-300 font-semibold">প্রোফাইল সম্পূর্ণতা</span>
              <span className="text-sm font-black text-emerald-300">{completeness}%</span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  completeness >= 80 ? 'bg-emerald-400' : completeness >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                }`}
                style={{ width: `${completeness}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {completeness >= 80 ? 'অত্যন্ত নির্ভুল ম্যাচিং সক্রিয়' : 'সঠিকতার জন্য আরও তথ্য প্রয়োজন'}
              </span>
              <Link 
                href="/dashboard/profile" 
                className="text-emerald-300 hover:text-emerald-200 font-bold underline inline-flex items-center gap-1"
              >
                প্রোফাইল আপডেট <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {completeness < 80 && (
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3 text-xs text-amber-200 bg-amber-950/40 px-4 py-2.5 rounded-xl border border-amber-500/30">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>পরামর্শ:</strong> আপনার প্রোফাইলে স্কিল ও ক্যারিয়ার অগ্রাধিকার যোগ করলে রিকমেন্ডেশনের নির্ভুলতা ৯০%+ নিশ্চিত হবে।
            </span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black">
            <Briefcase className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">মোট যোগ্য সার্কুলার</p>
            <p className="text-2xl font-black text-slate-900">{totalMatchesCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <Award className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-700">উৎকৃষ্ট ম্যাচ (৯০%+)</p>
            <p className="text-2xl font-black text-emerald-800">{excellentMatchesCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-700">উপযুক্ত ম্যাচ (৭৫-৮৯%)</p>
            <p className="text-2xl font-black text-blue-800">{strongMatchesCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-teal-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-black">
            <MapPin className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-teal-700">পছন্দের লোকেশনে</p>
            <p className="text-2xl font-black text-teal-800">{locationMatchesCount}</p>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {feedbackSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* Navigation Tabs and Search / Filter Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveTab('best')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'best'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>সেরা ম্যাচ ({feeds?.bestMatches?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'skills'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>স্কিলভিত্তিক ({feeds?.skillsMatches?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('education')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'education'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>শিক্ষাগত যোগ্যতা ({feeds?.educationMatches?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('location')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'location'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>পছন্দের লোকেশন ({feeds?.locationMatches?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('closingSoon')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'closingSoon'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            <span>শীঘ্রই শেষ হচ্ছে ({feeds?.closingSoonMatches?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'recent'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>সম্প্রতি প্রকাশিত ({feeds?.recentlyPublishedMatches?.length || 0})</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="পদবী, প্রতিষ্ঠান বা জেলা দিয়ে ফিল্টার..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600/30 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none w-full sm:w-auto"
            >
              <option value="all">সকল চাকরির ক্যাটাগরি</option>
              <option value="govt">সরকারি চাকরি</option>
              <option value="bank">ব্যাংক ও আর্থিক</option>
              <option value="teacher">শিক্ষক নিয়োগ</option>
              <option value="defense">প্রতিরক্ষা ও বাহিনী</option>
              <option value="railway">বাংলাদেশ রেলওয়ে</option>
              <option value="ngo">এনজিও ও আন্তর্জাতিক</option>
              <option value="private">প্রাইভেট ও কর্পোরেট</option>
              <option value="engineer">প্রকৌশল ও কারিগরি</option>
            </select>

            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              title="রিকমেন্ডেশন রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">রিফ্রেশ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Jobs Listing Content */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="font-bold text-slate-700 text-sm">স্মার্ট ম্যাচিং ফলাফল বিশ্লেষণ করা হচ্ছে...</p>
          <p className="text-xs text-slate-400">আপনার প্রোফাইলের সাথে সার্কুলারগুলোর শতভাগ যাচাইকৃত শর্তাবলী মেলানো হচ্ছে</p>
        </div>
      ) : activeList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <SlidersHorizontal className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">এই ফিল্টারে কোনো চাকরি পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              অন্যান্য ফিল্টার নির্বাচন করুন অথবা আপনার প্রোফাইলে নতুন স্কিল ও পছন্দের ক্যাটাগরি যোগ করে রিকমেন্ডেশনের পরিধি বৃদ্ধি করুন।
            </p>
          </div>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            প্রোফাইল পরিমার্জন করুন
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {activeList.map((rec) => {
            const { job, match } = rec;
            const isSaved = savedJobIds.includes(job.id);
            const score = match.overallScore;

            let badgeBg = 'bg-slate-100 text-slate-800 border-slate-200';
            if (score >= 90) badgeBg = 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20 shadow-md';
            else if (score >= 75) badgeBg = 'bg-blue-600 text-white border-blue-700 shadow-blue-500/20 shadow-md';
            else if (score >= 60) badgeBg = 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20 shadow-md';
            else if (score >= 40) badgeBg = 'bg-orange-500 text-white border-orange-600';

            return (
              <div 
                key={job.id} 
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {job.categoryLabel || job.category || 'সাধারণ'}
                      </span>
                      {job.category === 'govt' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          সরকারি চাকরি
                        </span>
                      )}
                      {match.eligibilityStatus === 'MEETS_VERIFIED_REQUIREMENTS' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          সম্পূর্ণ যোগ্য
                        </span>
                      ) : match.eligibilityStatus === 'NEEDS_MORE_INFORMATION' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <HelpCircle className="w-3 h-3 text-amber-600" />
                          তথ্য অসম্পূর্ণ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          শর্ত অসঙ্গতি
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{job.organization}</span>
                    </p>
                  </div>

                  <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border shrink-0 text-center ${badgeBg}`}>
                    <span className="text-xl font-black leading-none">{score}%</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-90 mt-0.5">
                      {match.displayBandBn || (score >= 90 ? 'উৎকৃষ্ট' : score >= 75 ? 'উপযুক্ত' : score >= 60 ? 'ভালো' : 'আংশিক')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.districts || 'সমগ্র বাংলাদেশ'}
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${job.daysRemaining <= 7 ? 'text-rose-600' : 'text-slate-600'}`}>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {job.deadline ? `ডেডলাইন: ${job.deadline}` : 'চলমান'}
                    {job.daysRemaining !== undefined && job.daysRemaining <= 7 && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                        {job.daysRemaining <= 0 ? 'আজ শেষ' : `${job.daysRemaining} দিন বাকি`}
                      </span>
                    )}
                  </span>
                </div>

                <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    কেন আপনি নির্বাচিত হয়েছেন:
                  </p>
                  <ul className="space-y-1">
                    {match.matchReasonsBn.slice(0, 2).map((reason: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{reason}</span>
                      </li>
                    ))}
                    {match.qualificationGapsBn.length > 0 && (
                      <li className="text-xs text-amber-700 flex items-start gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">ঘাটতি: {match.qualificationGapsBn[0]}</span>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => setSelectedJobForModal(rec)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>ম্যাচ বিশ্লেষণ</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleFeedback(job.id, 'RELEVANT')}
                      title="প্রাসঙ্গিক সুপারিশ"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(job.id, 'NOT_RELEVANT')}
                      title="অপ্রাসঙ্গিক সুপারিশ"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(job.id, 'HIDDEN')}
                      title="এই সার্কুলার লুকান"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleSave(job.id)}
                      title={isSaved ? 'সংরক্ষিত তালিকা থেকে মুছুন' : 'সার্কুলার সংরক্ষণ করুন'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSaved ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    <Link
                      href={`/jobs/${job.slug || job.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      <span>আবেদন ও বিস্তারিত</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedJobForModal && (
        <MatchBreakdownModal
          recommendation={selectedJobForModal}
          onClose={() => setSelectedJobForModal(null)}
          onFeedback={handleFeedback}
          onToggleSave={handleToggleSave}
        />
      )}
    </div>
  );
}
