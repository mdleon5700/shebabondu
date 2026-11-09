'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Cpu,
  FileSpreadsheet,
  ShieldCheck,
  RefreshCw,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Download,
  Search,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  Radio,
  Sliders,
  DollarSign
} from 'lucide-react';
import { PlatformAnalyticsOverviewReport, DataQualityAuditReport } from '@/lib/analytics/types';
import { AutomationOverviewReport } from '@/lib/automation/types';
import { GeneratedPlatformReport, ReportDefinitionMetadata } from '@/lib/reports/types';

interface AnalyticsIntelligenceHubProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

const getAdminHeaders = (): HeadersInit => {
  const pin = typeof window !== 'undefined' ? (localStorage.getItem('cs_admin_pin') || '') : '';
  const token = typeof window !== 'undefined' ? (localStorage.getItem('cs_session_token') || '') : '';
  const headers: Record<string, string> = {};
  if (pin) headers['x-admin-secret'] = pin;
  if (token) headers['authorization'] = `Bearer ${token}`;
  return headers;
};

export default function AnalyticsIntelligenceHub({ activeTab, onTabChange }: AnalyticsIntelligenceHubProps) {
  const [currentSubTab, setCurrentSubTab] = useState<string>(activeTab || 'analytics-center');
  const [timeframe, setTimeframe] = useState<string>('30d');
  const [loading, setLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<PlatformAnalyticsOverviewReport | null>(null);
  const [automationData, setAutomationData] = useState<AutomationOverviewReport | null>(null);
  const [qualityData, setQualityData] = useState<DataQualityAuditReport | null>(null);
  const [reportCatalog, setReportCatalog] = useState<ReportDefinitionMetadata[]>([]);
  const [selectedReportType, setSelectedReportType] = useState<string>('daily_platform_report');
  const [generatedReport, setGeneratedReport] = useState<GeneratedPlatformReport | null>(null);
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab) setCurrentSubTab(activeTab);
  }, [activeTab]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics/overview?timeframe=${timeframe}`, {
        headers: getAdminHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.report) setAnalyticsData(data.report);
      }
    } catch (err) {
      console.error('Failed to load analytics overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAutomation = async () => {
    try {
      const res = await fetch('/api/admin/automation/overview', {
        headers: getAdminHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.overview) setAutomationData(data.overview);
      }
    } catch (err) {
      console.error('Failed to load automation data:', err);
    }
  };

  const loadQualityAudit = async () => {
    try {
      const res = await fetch('/api/admin/analytics/data-quality', {
        headers: getAdminHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.auditReport) setQualityData(data.auditReport);
      }
    } catch (err) {
      console.error('Failed to load quality audit:', err);
    }
  };

  const loadReportsCatalog = async () => {
    try {
      const res = await fetch('/api/admin/reports/generate', {
        headers: getAdminHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.catalog) setReportCatalog(data.catalog);
      }
    } catch (err) {
      console.error('Failed to load reports catalog:', err);
    }
  };

  useEffect(() => {
    loadAnalytics();
    loadAutomation();
    loadQualityAudit();
    loadReportsCatalog();
  }, [timeframe]);

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/automation/rules', {
        method: 'POST',
        headers: {
          ...getAdminHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'toggle_task', taskId, status: newStatus })
      });
      if (res.ok) {
        showFeedback(`টাস্ক স্ট্যাটাস সফলভাবে '${newStatus}' করা হয়েছে।`);
        loadAutomation();
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleToggleRule = async (ruleCode: string, currentEnabled: boolean) => {
    try {
      const res = await fetch('/api/admin/automation/rules', {
        method: 'POST',
        headers: {
          ...getAdminHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'toggle_rule', ruleCode, isEnabled: !currentEnabled })
      });
      if (res.ok) {
        showFeedback(`ইন্টেলিজেন্ট রুল '${ruleCode}' সফলভাবে আপডেট করা হয়েছে।`);
        loadAutomation();
      }
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  const handleManualExecute = async (taskId: string) => {
    try {
      const res = await fetch('/api/admin/automation/rules', {
        method: 'POST',
        headers: {
          ...getAdminHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'execute_task', taskId })
      });
      if (res.ok) {
        const data = await res.json();
        showFeedback(data.messageBn || 'টাস্ক সফলভাবে সম্পন্ন করা হয়েছে।');
        loadAutomation();
      }
    } catch (err) {
      console.error('Failed to execute task:', err);
    }
  };

  const handleGenerateReport = async (format: 'json' | 'csv' = 'json') => {
    try {
      setGeneratingReport(true);
      const res = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: {
          ...getAdminHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportType: selectedReportType,
          timeframe,
          format
        })
      });

      if (format === 'csv') {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedReportType}_${timeframe}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showFeedback('CSV ফাইল সফলভাবে ডাউনলোড হয়েছে।');
      } else {
        const data = await res.json();
        if (data.report) {
          setGeneratedReport(data.report);
          showFeedback('রিপোর্ট সফলভাবে প্রস্তুত করা হয়েছে।');
        }
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  বিজনেস ইন্টেলিজেন্স, অ্যানালিটিক্স ও অটোমেশন
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Step 15 Enterprise
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ১০০% সম্পূর্ণ ফ্রি
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                প্ল্যাটফর্মের ১৪টি সিস্টেমের বাস্তব তথ্যভিত্তিক বিশ্লেষণ, স্বয়ংক্রিয় শিডিউলার ও এক্সপোর্ট রিপোজিটরি
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
              {[
                { id: 'today', label: 'আজ' },
                { id: '7d', label: '৭ দিন' },
                { id: '30d', label: '৩০ দিন' },
                { id: 'this_month', label: 'চলতি মাস' },
                { id: 'all', label: 'সর্বকাল' }
              ].map(tf => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    timeframe === tf.id ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'hover:text-slate-900'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => { loadAnalytics(); loadAutomation(); loadQualityAudit(); }}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              title="তথ্য রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Feature Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-5">
          {[
            { id: 'analytics-center', label: 'প্ল্যাটফর্ম অ্যানালিটিক্স ও বিআই', icon: BarChart3, desc: 'ইউজার, সার্কুলার ও সার্চ অ্যানালিটিক্স' },
            { id: 'automation-center', label: 'স্মার্ট অটোমেশন ও রুলস হাব', icon: Cpu, desc: '৮টি শিডিউলার ও ৭টি ইন্টেলিজেন্ট রুল' },
            { id: 'report-builder', label: 'রিপোর্ট বিল্ডার ও এক্সপোর্ট', icon: FileSpreadsheet, desc: '৯টি স্ট্যান্ডার্ড রিপোর্ট ও CSV ডাউনলোড' },
            { id: 'data-quality-inspector', label: 'ডাটা কোয়ালিটি ও অখণ্ডতা', icon: ShieldCheck, desc: 'রিয়েল-টাইম প্ল্যাটফর্ম ইন্টিগ্রিটি স্কোর' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = currentSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentSubTab(tab.id);
                  if (onTabChange) onTabChange(tab.id);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold leading-none">{tab.label}</span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1">{tab.desc}</p>
              </button>
            );
          })}
        </div>

        {actionSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton Indicator */}
      {loading && !analyticsData && !qualityData && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">অ্যানালিটিক্স ও বিআই ডাটা লোড হচ্ছে...</p>
        </div>
      )}

      {/* TAB 1: ANALYTICS CENTER */}
      {currentSubTab === 'analytics-center' && analyticsData && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium">নিবন্ধিত চাকরিপ্রার্থী</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{analyticsData.users.totalRegistered}</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">
                + {analyticsData.users.newInPeriod} নতুন ({timeframe}) • {analyticsData.users.avgProfileCompletionPercent}% গড় পূর্ণতা
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium">প্রকাশিত সার্কুলার</span>
                <Briefcase className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{analyticsData.jobMarket.totalJobs}</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                {analyticsData.jobMarket.publishedInPeriod}টি সক্রিয় প্রকাশনা ({timeframe})
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium">স্পাইডার সোর্স নির্ভরযোগ্যতা</span>
                <Radio className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {analyticsData.sources.overallSuccessRatePercent}%
              </div>
              <div className="text-[11px] text-indigo-600 font-medium mt-1">
                {analyticsData.sources.activeSources} / {analyticsData.sources.totalSources} সোর্স শতভাগ সক্রিয়
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium">ডাটা কোয়ালিটি স্কোর</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {analyticsData.dataQuality.healthScorePercent}%
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">
                ০টি গুরুতর ব্লকার • ১০০% স্ট্যান্ডার্ড এনকোডিং
              </div>
            </div>
          </div>

          {/* User Onboarding Funnel & Job Market Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Funnel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                চাকরিপ্রার্থী ৫-ধাপের এনগেজমেন্ট ফানেল
              </h2>
              <p className="text-xs text-slate-500 mb-4">নিবন্ধন থেকে শুরু করে আবেদন পর্যন্ত প্রার্থীর সম্পৃক্ততার হার</p>

              <div className="space-y-3">
                {analyticsData.users.userFunnel.map((step) => (
                  <div key={step.stepId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{step.stepNameBn}</span>
                      <span className="font-bold text-slate-900">{step.count} জন ({step.conversionRate}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(step.conversionRate, 5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Market Categories */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                খাতভিত্তিক সার্কুলার বণ্টন (Job Market Categories)
              </h2>
              <p className="text-xs text-slate-500 mb-4">সরকারি, ব্যাংক, এনজিও ও প্রাইভেট খাতের অনুপাত</p>

              <div className="space-y-2.5">
                {analyticsData.jobMarket.categoryBreakdown.slice(0, 5).map(cat => (
                  <div key={cat.categoryId} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800">{cat.categoryNameBn}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">{cat.circularCount}টি</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Search Keywords & Zero-Results Intelligence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                জনপ্রিয় অনুসন্ধান কিওয়ার্ড (Top Search Queries)
              </h2>
              <p className="text-xs text-slate-500 mb-4">চাকরিপ্রার্থীরা প্ল্যাটফর্মে সর্বাধিক যা অনুসন্ধান করছেন</p>

              <div className="flex flex-wrap gap-2">
                {analyticsData.search.topKeywords.map((kw, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium">
                    <span>{kw.keyword}</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-white text-slate-600 text-[10px] font-bold shadow-xs">
                      {kw.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                শূন্য ফলাফলের সার্চ টার্ম ও ট্যাক্সোনমি সমাধান
              </h2>
              <p className="text-xs text-slate-500 mb-4">যেসব অনুসন্ধানে সার্কুলার পাওয়া যায়নি এবং প্রস্তাবিত অ্যাকশন</p>

              <div className="space-y-2">
                {analyticsData.search.zeroResultQueries.map((zq, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-purple-950">"{zq.keyword}"</span>
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        {zq.count} বার খোঁজা হয়েছে
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-800 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-purple-600 shrink-0" />
                      {zq.suggestedActionBn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATION CENTER */}
      {currentSubTab === 'automation-center' && automationData && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Status Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 block mb-1">মোট অটোমেশন টাস্ক</span>
              <span className="text-xl font-black text-slate-900">{automationData.totalTasks}টি</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 block mb-1">সক্রিয় শিডিউলার</span>
              <span className="text-xl font-black text-emerald-600">{automationData.activeTasks}টি</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 block mb-1">স্থগিত টাস্ক</span>
              <span className="text-xl font-black text-slate-600">{automationData.pausedTasks}টি</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs text-slate-500 block mb-1">ব্যর্থ টাস্ক</span>
              <span className="text-xl font-black text-rose-600">{automationData.failedTasks}টি</span>
            </div>
          </div>

          {/* 8 Core Background Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              প্ল্যাটফর্ম সেন্ট্রাল ব্যাকগ্রাউন্ড টাস্ক ও শিডিউলার (Tasks Management)
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              চাকরি সেবার স্বয়ংক্রিয় ব্যাকগ্রাউন্ড সার্ভিস ও ক্রন এক্সিকিউশন প্যানেল
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="pb-3">টাস্কের নাম ও বিবরণ</th>
                    <th className="pb-3">ক্রন শিডিউল</th>
                    <th className="pb-3">সর্বশেষ রান</th>
                    <th className="pb-3">স্ট্যাটাস</th>
                    <th className="pb-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {automationData.tasks.map(task => (
                    <tr key={task.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 pr-3">
                        <div className="font-bold text-slate-900">{task.nameBn}</div>
                        <div className="text-[11px] text-slate-500">{task.descriptionBn}</div>
                      </td>
                      <td className="py-3.5 text-slate-600 font-mono text-[11px]">{task.cronSchedule}</td>
                      <td className="py-3.5 text-slate-600">
                        {task.lastExecutedAt ? new Date(task.lastExecutedAt).toLocaleTimeString('bn-BD') : 'অপেক্ষমান'}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          task.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleManualExecute(task.id)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition-all"
                        >
                          রান করুন
                        </button>
                        <button
                          onClick={() => handleToggleTask(task.id, task.status)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-all inline-flex"
                          title={task.status === 'ACTIVE' ? 'পজ করুন' : 'সক্রিয় করুন'}
                        >
                          {task.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 7 Intelligent Rule-Based Automations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              ইন্টেলিজেন্ট রুল-ভিত্তিক অটোমেশন (Intelligent Rules Engine)
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              নিরাপদ ব্যবসায়িক শর্ত ও সতর্কবার্তা নির্ভর স্বয়ংক্রিয় একশন রুলস
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {automationData.rules.map(rule => (
                <div key={rule.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono text-[10px] font-bold border border-purple-200">
                      {rule.code}
                    </span>
                    <button
                      onClick={() => handleToggleRule(rule.code, rule.isEnabled)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                        rule.isEnabled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {rule.isEnabled ? 'সক্রিয় (Enabled)' : 'নিষ্ক্রিয় (Disabled)'}
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs mb-1">{rule.nameBn}</h3>
                  <p className="text-[11px] text-slate-500 mb-2">{rule.descriptionBn}</p>
                  <div className="text-[10px] bg-slate-50 p-2 rounded-lg space-y-1 text-slate-600 border border-slate-100">
                    <div><strong>শর্ত:</strong> {rule.conditionDescriptionBn}</div>
                    <div><strong>অ্যাকশন:</strong> {rule.actionDescriptionBn}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REPORT BUILDER */}
      {currentSubTab === 'report-builder' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Generator Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              রিপোর্ট জেনারেটর ও এক্সপোর্ট কনসোল (রিপোর্ট বিল্ডার)
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              অফিসিয়াল এক্সিকিউটিভ রিপোর্ট তৈরি করুন এবং এক্সেল/সিএসভি ফরম্যাটে ডাউনলোড করুন
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">রিপোর্ট ক্যাটাগরি</label>
                <select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {reportCatalog.map(rpt => (
                    <option key={rpt.id} value={rpt.id}>{rpt.titleBn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">সময়সীমা (Timeframe)</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="today">আজকের রিপোর্ট</option>
                  <option value="7d">বিগত ৭ দিন</option>
                  <option value="30d">বিগত ৩০ দিন</option>
                  <option value="this_month">চলতি মাস</option>
                  <option value="all">সর্বকাল</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => handleGenerateReport('json')}
                  disabled={generatingReport}
                  className="flex-1 text-xs py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all disabled:opacity-50"
                >
                  {generatingReport ? 'প্রস্তুত হচ্ছে...' : 'প্রিভিউ দেখুন'}
                </button>
                <button
                  onClick={() => handleGenerateReport('csv')}
                  disabled={generatingReport}
                  className="text-xs py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                  title="UTF-8 BOM ফরম্যাটে এক্সেল সিএসভি ডাউনলোড"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>
              </div>
            </div>
          </div>

          {/* Generated Report View */}
          {generatedReport && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{generatedReport.titleBn}</h3>
                  <p className="text-xs text-slate-500">
                    রিপোর্ট আইডি: <span className="font-mono text-slate-700">{generatedReport.reportId}</span> • 
                    তৈরির সময়: {new Date(generatedReport.generatedAt).toLocaleString('bn-BD')}
                  </p>
                </div>
                <button
                  onClick={() => handleGenerateReport('csv')}
                  className="text-xs py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  এক্সেল CSV ডাউনলোড
                </button>
              </div>

              {/* Highlights */}
              {generatedReport.summaryHighlightsBn && generatedReport.summaryHighlightsBn.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-slate-700">
                  <div className="font-bold text-slate-900 mb-1">রিপোর্ট হাইলাইটস:</div>
                  {generatedReport.summaryHighlightsBn.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      {generatedReport.headers.map((h, idx) => (
                        <th key={idx} className="p-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {generatedReport.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3 text-slate-800">{String(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DATA QUALITY INSPECTOR */}
      {currentSubTab === 'data-quality-inspector' && (
        qualityData ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Quality Overview Score Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6" data-testid="data-quality-score-card">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-bold text-slate-900">প্ল্যাটফর্ম ডাটা কোয়ালিটি ও প্ল্যাটফর্ম ইন্টিগ্রিটি স্কোর</h2>
                </div>
                <p className="text-xs text-slate-500">
                  ডাটা কোয়ালিটি ও প্ল্যাটফর্ম ইন্টিগ্রিটি স্কোর: {qualityData.qualityHealthScorePercent}% • স্ক্যানকৃত মোট রেকর্ড: {qualityData.totalRecordsScanned}টি • সময়: {new Date(qualityData.checkedAt).toLocaleTimeString('bn-BD')}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="text-[11px] text-slate-500 block mb-0.5">কোয়ালিটি স্কোর</span>
                  <span className="text-3xl font-black text-emerald-600">
                    {qualityData.qualityHealthScorePercent}%
                  </span>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div className="flex gap-3 text-xs">
                  <div className="text-center">
                    <span className="text-[11px] text-slate-500 block">ক্রিটিক্যাল</span>
                    <span className="font-bold text-rose-600">{qualityData.criticalCount}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] text-slate-500 block">ওয়ার্নিং</span>
                    <span className="font-bold text-amber-600">{qualityData.warningCount}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] text-slate-500 block">ইনফো</span>
                    <span className="font-bold text-blue-600">{qualityData.infoCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Issues List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">চিহ্নিত সমস্যা ও সুপারিশকৃত প্রতিকার</h3>

              {qualityData.issues.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  কোনো ত্রুটি বা অসঙ্গতি পাওয়া যায়নি। ডাটাবেজের সকল রেকর্ড নিখুঁত ও মানসম্মত।
                </div>
              ) : (
                <div className="space-y-3">
                  {qualityData.issues.map(issue => (
                    <div key={issue.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            issue.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800'
                              : issue.severity === 'WARNING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {issue.severity}
                          </span>
                          <span className="font-bold text-slate-900">{issue.titleBn}</span>
                          <span className="text-slate-400 font-mono text-[10px]">({issue.affectedRecordId})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{issue.id}</span>
                      </div>
                      <p className="text-slate-600">{issue.descriptionBn}</p>
                      <div className="text-[11px] text-indigo-700 bg-indigo-50/60 p-2 rounded-lg border border-indigo-100 flex items-center gap-1.5 font-medium">
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{issue.suggestedFixBn}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">ডাটা কোয়ালিটি ও প্ল্যাটফর্ম ইন্টিগ্রিটি স্কোর স্ক্যান করা হচ্ছে...</p>
          </div>
        )
      )}
    </div>
  );
}
