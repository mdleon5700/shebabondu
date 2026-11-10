'use client';

import React, { useState, useEffect } from 'react';
import { getAdminHeaders } from '@/lib/adminAuthClient';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  FileText, 
  CreditCard, 
  DollarSign, 
  Activity, 
  AlertTriangle, 
  Sparkles, 
  RefreshCw, 
  ArrowUpRight, 
  Radio, 
  Bell, 
  ShieldAlert, 
  GraduationCap, 
  Award, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { PlatformOverviewMetrics, ActivityEventItem, SubsystemHealth, PlatformHealthReport } from '@/lib/governance/types';

interface PlatformGovernanceOverviewProps {
  onNavigate: (tab: string, detailId?: string) => void;
}

export default function PlatformGovernanceOverview({ onNavigate }: PlatformGovernanceOverviewProps) {
  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('all');
  const [metrics, setMetrics] = useState<PlatformOverviewMetrics | null>(null);
  const [activityStream, setActivityStream] = useState<ActivityEventItem[]>([]);
  const [healthReport, setHealthReport] = useState<PlatformHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchOverviewData = async (selectedTimeframe = timeframe) => {
    setIsRefreshing(true);
    try {
      const [overviewRes, healthRes] = await Promise.all([
        fetch(`/api/admin/governance/overview?timeframe=${selectedTimeframe}`, {
          headers: getAdminHeaders()
        }),
        fetch('/api/admin/governance/health', {
          headers: getAdminHeaders()
        })
      ]);

      const overviewData = await overviewRes.json();
      if (overviewData.success && overviewData.metrics) {
        setMetrics(overviewData.metrics);
        setActivityStream(overviewData.activityStream || []);
      }

      const healthData = await healthRes.json();
      if (healthData.success && healthData.report) {
        setHealthReport(healthData.report);
      }
    } catch (err) {
      console.error('Failed to load governance overview:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverviewData(timeframe);
  }, [timeframe]);

  const renderCardValue = (val: string | number | undefined | null, colorClass: string, prefix = '') => {
    if (isLoading && !metrics) {
      return <div className="h-8 w-20 bg-slate-200/70 animate-pulse rounded-lg my-1" />;
    }
    return (
      <div className={`text-2xl font-black ${colorClass} transition-colors`}>
        {prefix}{toBnNumber(val ?? 0)}
      </div>
    );
  };

  const handleTimeframeChange = (tf: 'today' | '7d' | '30d' | '90d' | 'all') => {
    setTimeframe(tf);
  };

  const toBnNumber = (val: number | string | undefined | null): string => {
    if (val === undefined || val === null) return '০';
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return val.toString().replace(/\d/g, d => bnDigits[parseInt(d, 10)]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Governance & Platform Health Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-700/80">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                সেন্ট্রালাইজড অ্যাডমিন কন্ট্রোল সেন্টার
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {healthReport?.overallStatus === 'HEALTHY' ? 'সব সাব-সিস্টেম স্বাভাবিক' : 'সিস্টেম পর্যবেক্ষণাধীন'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                {toBnNumber(healthReport?.uptimePercentage || 99.98)}% আপটাইম
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl font-medium">
              চাকরি সেবা ১৫-ধাপ সমন্বিত প্ল্যাটফর্ম গভর্নেন্স • ১০০% উন্মুক্ত চাকরি সেবা নীতি বলবৎ • লাইভ ডাটাবেজ, এআই ইঞ্জিন, স্পাইডার ও নোটিফিকেশন গেটওয়ে সক্রিয়
            </p>
          </div>

          {/* Timeframe Selector & Refresh */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <div className="bg-slate-800/90 p-1 rounded-xl border border-slate-700 flex items-center text-xs font-bold">
              {(['today', '7d', '30d', '90d', 'all'] as const).map(tf => {
                const labels: Record<string, string> = {
                  today: 'আজ',
                  '7d': '৭ দিন',
                  '30d': '৩০ দিন',
                  '90d': '৯০ দিন',
                  all: 'সর্বমোট'
                };
                const isActive = timeframe === tf;
                return (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => handleTimeframeChange(tf)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {labels[tf]}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => fetchOverviewData()}
              disabled={isRefreshing}
              title="তথ্য রিফ্রেশ করুন"
              className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 8-Sector Multi-System KPI Statistics Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* KPI 1: Candidates */}
        <button
          type="button"
          onClick={() => onNavigate('candidate-directory')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/20 shadow-2xs hover:shadow-md transition-all text-left cursor-pointer group w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 group-hover:text-blue-700 transition-colors">মোট প্রার্থী</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl group-hover:scale-110 transition-transform shadow-2xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 group-hover:text-blue-900 transition-colors">
            {toBnNumber(metrics?.candidates.total ?? 0)}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-emerald-700 font-bold">
              সক্রিয়: {toBnNumber(metrics?.candidates.active ?? 0)}
            </span>
            <span className="text-blue-600 font-bold group-hover:underline">দেখুন →</span>
          </div>
        </button>

        {/* KPI 2: Published Jobs */}
        <button
          type="button"
          onClick={() => onNavigate('jobs')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-400 hover:bg-emerald-50/20 shadow-2xs hover:shadow-md transition-all text-left cursor-pointer group w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 group-hover:text-emerald-700 transition-colors">প্রকাশিত সার্কুলার</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-110 transition-transform shadow-2xs">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 group-hover:text-emerald-900 transition-colors">
            {toBnNumber(metrics?.jobs.totalPublished ?? 0)}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-slate-500 font-medium">
              আজ প্রকাশিত: {toBnNumber(metrics?.jobs.publishedToday ?? 0)}
            </span>
            <span className="text-emerald-600 font-bold group-hover:underline">তালিকা →</span>
          </div>
        </button>

        {/* KPI 3: Verification Queue */}
        <button
          type="button"
          onClick={() => onNavigate('job-verification')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-purple-400 hover:bg-purple-50/20 shadow-2xs hover:shadow-md transition-all text-left cursor-pointer group w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 group-hover:text-purple-700 transition-colors">সার্কুলার ভেরিফিকেশন</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl group-hover:scale-110 transition-transform shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 group-hover:text-purple-900 transition-colors">
            {toBnNumber(metrics?.verification.totalVerified ?? 0)}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-purple-700 font-bold">
              কিউতে: {toBnNumber(metrics?.verification.pendingReview ?? 0)}
            </span>
            <span className="text-purple-600 font-bold group-hover:underline">অডিট →</span>
          </div>
        </button>

        {/* KPI 4: Pending Drafts */}
        <button
          type="button"
          onClick={() => onNavigate('imported-drafts')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-amber-400 hover:bg-amber-50/20 shadow-2xs hover:shadow-md transition-all text-left cursor-pointer group w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 group-hover:text-amber-700 transition-colors">খসড়া ও স্পাইডার কিউ</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl group-hover:scale-110 transition-transform shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 group-hover:text-amber-700 transition-colors">
            {toBnNumber(metrics?.jobs.draftsPending ?? 0)}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-amber-700 font-bold">অনুমোদনের অপেক্ষায়</span>
            <span className="text-amber-700 font-bold group-hover:underline">রিভিউ →</span>
          </div>
        </button>

        {/* KPI 5: Certificates Verification */}
        <button
          type="button"
          onClick={() => onNavigate('candidate-directory')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-teal-400 hover:bg-teal-50/20 shadow-2xs hover:shadow-md transition-all text-left cursor-pointer group w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 group-hover:text-teal-700 transition-colors">সার্টিফিকেট যাচাই কিউ</span>
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl group-hover:scale-110 transition-transform shadow-2xs">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 group-hover:text-teal-900 transition-colors">
            {toBnNumber(metrics?.certificates.verifiedTotal ?? 0)}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-teal-700 font-bold">
              পেন্ডিং: {toBnNumber(metrics?.certificates.pendingVerification ?? 0)}
            </span>
            <span className="text-teal-600 font-bold group-hover:underline">ভেরিফাই →</span>
          </div>
        </button>

        {/* KPI 6: Expiring Soon */}
        <button
          type="button"
          onClick={() => onNavigate('deadline-alerts')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-rose-400 hover:bg-rose-50/20 shadow-2xs hover:shadow-md transition-all text-left cursor-pointer group w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 group-hover:text-rose-700 transition-colors">আসন্ন সময়সীমা (৩ দিন)</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-xl group-hover:scale-110 transition-transform shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 group-hover:text-rose-700 transition-colors">
            {toBnNumber(metrics?.jobs.expiringSoon ?? 0)}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-rose-700 font-bold">জরুরি অ্যালার্ট প্রস্তুত</span>
            <span className="text-rose-600 font-bold group-hover:underline">অ্যালার্ট →</span>
          </div>
        </button>

        {/* KPI 7: Operations & Monthly Budget */}
        <button
          type="button"
          onClick={() => onNavigate('platform-operations')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-400 hover:bg-indigo-50/20 shadow-2xs hover:shadow-md transition-all text-left cursor-pointer group w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-700 transition-colors">মাসিক পরিচালন ব্যয়</span>
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl group-hover:scale-110 transition-transform shadow-2xs">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-700 group-hover:text-indigo-800 transition-colors">
            ৳{toBnNumber(metrics?.operations.actualSpendBdt.toLocaleString('bn-BD') ?? '০')}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-indigo-700 font-bold">
              বাজেট বার্ন: {toBnNumber(metrics?.operations.burnRatePercent ?? 0)}%
            </span>
            <span className="text-indigo-600 font-bold group-hover:underline">হিসাব →</span>
          </div>
        </button>

        {/* KPI 8: Notifications Delivered */}
        <button
          type="button"
          onClick={() => onNavigate('sms-notifications')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-cyan-400 hover:bg-cyan-50/20 shadow-2xs hover:shadow-md transition-all text-left cursor-pointer group w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 group-hover:text-cyan-700 transition-colors">নোটিফিকেশন ডেলিভারি</span>
            <div className="p-2 bg-cyan-50 text-cyan-700 rounded-xl group-hover:scale-110 transition-transform shadow-2xs">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 group-hover:text-cyan-900 transition-colors">
            {toBnNumber(metrics?.notifications.deliveredTotal ?? 0)}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-slate-500 font-medium">
              ব্যর্থতা: {toBnNumber(metrics?.notifications.failureCount ?? 0)}
            </span>
            <span className="text-cyan-600 font-bold group-hover:underline">লগ →</span>
          </div>
        </button>

      </div>

      {/* 3. Centralized 6 Quick Actions Strip */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4">
        <div className="text-xs font-black uppercase tracking-wider text-slate-600 mb-3 flex items-center justify-between">
          <span>সেন্ট্রালাইজড গভর্নেন্স কুইক অ্যাকশন</span>
          <span className="text-[10px] text-emerald-700 font-bold">১০০% ফ্রি প্ল্যাটফর্ম অ্যাক্সেস মোড</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('imported-drafts')}
            className="p-3 bg-white hover:bg-amber-50/50 border border-slate-200 rounded-xl text-left transition-all shadow-2xs hover:shadow-sm cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">খসড়া সার্কুলার</div>
            <div className="text-[10px] text-slate-500">স্পাইডার ড্রাফট রিভিউ</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('job-verification')}
            className="p-3 bg-white hover:bg-purple-50/50 border border-slate-200 rounded-xl text-left transition-all shadow-2xs hover:shadow-sm cursor-pointer group"
          >
            <ShieldCheck className="w-4 h-4 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">এআই ভেরিফিকেশন</div>
            <div className="text-[10px] text-slate-500">নিয়োগ বিজ্ঞপ্তি সত্যতা</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('candidate-directory')}
            className="p-3 bg-white hover:bg-teal-50/50 border border-slate-200 rounded-xl text-left transition-all shadow-2xs hover:shadow-sm cursor-pointer group"
          >
            <Award className="w-4 h-4 text-teal-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">সার্টিফিকেট অডিট</div>
            <div className="text-[10px] text-slate-500">প্রার্থীর সনদপত্র যাচাই</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('deadline-alerts')}
            className="p-3 bg-white hover:bg-rose-50/50 border border-slate-200 rounded-xl text-left transition-all shadow-2xs hover:shadow-sm cursor-pointer group"
          >
            <Clock className="w-4 h-4 text-rose-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">ডেডলাইন অ্যালার্ট</div>
            <div className="text-[10px] text-slate-500">সময়সীমা ট্র্যাকিং</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('platform-operations')}
            className="p-3 bg-white hover:bg-indigo-50/50 border border-slate-200 rounded-xl text-left transition-all shadow-2xs hover:shadow-sm cursor-pointer group"
          >
            <DollarSign className="w-4 h-4 text-indigo-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">পরিচালন ব্যয়</div>
            <div className="text-[10px] text-slate-500">বাজেট ও সার্ভার খরচ</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('system-health')}
            className="p-3 bg-white hover:bg-emerald-50/50 border border-slate-200 rounded-xl text-left transition-all shadow-2xs hover:shadow-sm cursor-pointer group"
          >
            <Activity className="w-4 h-4 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-slate-900">সিস্টেম ডায়াগনস্টিক</div>
            <div className="text-[10px] text-slate-500">সাব-সিস্টেম হেলথ চেক</div>
          </button>
        </div>
      </div>

      {/* 4. Cross-Platform Live Activity Stream & Subsystem Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Cross-Platform Live Activity Stream */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              <h2 className="font-black text-sm text-slate-900">প্ল্যাটফর্ম সার্বজনীন লাইভ অ্যাক্টিভিটি স্ট্রিম</h2>
            </div>
            <span className="text-[11px] font-bold text-slate-500">সর্বশেষ {toBnNumber(activityStream.length)} টি ইভেন্ট</span>
          </div>

          {isLoading && activityStream.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              <span>লাইভ অ্যাক্টিভিটি স্ট্রিম সিঙ্ক হচ্ছে...</span>
            </div>
          ) : activityStream.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 font-medium">
              কোনো সাম্প্রতিক অ্যাক্টিভিটি নেই।
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto pr-1">
              {activityStream.map((event) => (
                <div key={event.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">{event.actorName}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {event.action}
                      </span>
                      {event.targetType && (
                        <span className="text-[10px] font-mono text-slate-500">[{event.targetType}]</span>
                      )}
                    </div>
                    <div className="text-slate-700 font-medium text-xs break-words">
                      {event.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {event.formattedDateBn}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Subsystems Live Health Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <h2 className="font-black text-sm text-slate-900">সাব-সিস্টেম লাইভ হেলথ</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('system-health')}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              বিস্তারিত →
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {healthReport?.subsystems ? (
              Object.values(healthReport.subsystems).map((sub) => {
                const isHealthy = sub.status === 'HEALTHY';
                return (
                  <div
                    key={sub.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{sub.nameBn || sub.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{sub.message}</div>
                      {sub.latencyMs !== undefined && (
                        <div className="text-[10px] font-mono text-emerald-700 font-bold mt-0.5">
                          রেসপন্স টাইম: {toBnNumber(sub.latencyMs)}ms
                        </div>
                      )}
                    </div>
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                        isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      title={sub.status}
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                হেলথ স্ট্যাটাস লোড হচ্ছে...
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
