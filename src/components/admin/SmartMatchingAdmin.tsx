'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Settings, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Save, 
  Database, 
  Activity, 
  Layers, 
  BookOpen, 
  Users, 
  Briefcase, 
  Check, 
  RotateCcw,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { MatchingEngineConfig, MatchingWeightsConfig } from '@/lib/matching/types';
import { CANONICAL_SKILLS } from '@/lib/matching/skills-taxonomy';

export default function SmartMatchingAdmin() {
  const [config, setConfig] = useState<MatchingEngineConfig | null>(null);
  const [weights, setWeights] = useState<MatchingWeightsConfig>({
    education: 25,
    skills: 25,
    experience: 15,
    category: 10,
    location: 10,
    employmentType: 5,
    organizationType: 5,
    salary: 5
  });
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [rebuilding, setRebuilding] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [rebuildMessage, setRebuildMessage] = useState<string | null>(null);
  const [selectedTaxonomySector, setSelectedTaxonomySector] = useState<string>('all');

  // Load config & health
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resConfig, resHealth] = await Promise.all([
        fetch('/api/admin/job-matching/config'),
        fetch('/api/admin/job-matching/health')
      ]);

      if (resConfig.ok) {
        const d = await resConfig.json();
        if (d.success && d.data) {
          setConfig(d.data);
          setWeights(d.data.weights);
        }
      }

      if (resHealth.ok) {
        const h = await resHealth.json();
        if (h.success && h.data) {
          setHealthData(h.data);
        }
      }
    } catch (err) {
      console.error('Failed to load matching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalWeight = useMemoTotalWeight(weights);

  // Helper for total weight
  function useMemoTotalWeight(w: MatchingWeightsConfig) {
    return (
      (Number(w.education) || 0) +
      (Number(w.skills) || 0) +
      (Number(w.experience) || 0) +
      (Number(w.category) || 0) +
      (Number(w.location) || 0) +
      (Number(w.employmentType) || 0) +
      (Number(w.organizationType) || 0) +
      (Number(w.salary) || 0)
    );
  }

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeight !== 100) {
      alert(`ওজনগুলোর মোট যোগফল ১০০% হতে হবে। বর্তমান যোগফল: ${totalWeight}%`);
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/admin/job-matching/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weights,
          minScoreToRecommend: config?.minScoreToRecommend ?? 40,
          excellentThreshold: config?.excellentThreshold ?? 90,
          strongThreshold: config?.strongThreshold ?? 75,
          goodThreshold: config?.goodThreshold ?? 60,
          partialThreshold: config?.partialThreshold ?? 40,
          allowOverqualification: config?.allowOverqualification ?? true,
          quotaAgeRelaxationYears: config?.quotaAgeRelaxationYears ?? 2
        })
      });

      if (res.ok) {
        setSaveSuccess('ম্যাচিং ইঞ্জিন কনফিগারেশন সফলভাবে আপডেট হয়েছে!');
        setTimeout(() => setSaveSuccess(null), 4000);
        fetchData();
      }
    } catch (err) {
      console.error('Save config failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRebuildIndex = async () => {
    if (!confirm('আপনি কি নিশ্চিত যে সকল ক্যান্ডিডেটের জন্য স্মার্ট ম্যাচিং ইনডেক্স পুনর্নির্মাণ করতে চান?')) return;
    try {
      setRebuilding(true);
      const res = await fetch('/api/admin/job-matching/rebuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: 'admin_master' })
      });

      if (res.ok) {
        const d = await res.json();
        setRebuildMessage(`ইনডেক্স সফলভাবে পুনর্নির্মিত হয়েছে! সময়: ${new Date().toLocaleTimeString('bn-BD')}`);
        setTimeout(() => setRebuildMessage(null), 5000);
        fetchData();
      }
    } catch (err) {
      console.error('Rebuild index failed:', err);
    } finally {
      setRebuilding(false);
    }
  };

  const taxonomySectors = Array.from(new Set(CANONICAL_SKILLS.map(s => s.category)));

  const filteredSkills = selectedTaxonomySector === 'all'
    ? CANONICAL_SKILLS
    : CANONICAL_SKILLS.filter(s => s.category === selectedTaxonomySector);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>স্টেপ ০৯ — কন্ট্রোল সেন্টার</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            স্মার্ট জব ম্যাচিং ও রিকমেন্ডেশন ইঞ্জিন কন্ট্রোল
          </h2>
          <p className="text-xs text-slate-500">
            চাকরির যোগ্যতা বিশ্লেষণ, ৮-মাত্রিক ওয়েটেড স্কোরিং, কোটা সুবিধা এবং বাংলাদেশ জব ট্যাক্সোনমি পরিচালনা করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>

          <button
            onClick={handleRebuildIndex}
            disabled={rebuilding}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Zap className={`w-3.5 h-3.5 ${rebuilding ? 'animate-spin' : ''}`} />
            <span>{rebuilding ? 'পুনর্নির্মাণ হচ্ছে...' : 'ইনডেক্স রি-বিল্ড করুন'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {rebuildMessage && (
        <div className="p-4 bg-blue-50 border border-blue-300 text-blue-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Zap className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{rebuildMessage}</span>
        </div>
      )}

      {/* Health & Diagnostic KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">মোট সার্কুলার</span>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {healthData?.totalPublishedJobs ?? '...'}
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">
            {healthData?.activeCircularsForMatching ?? '...'} সক্রিয় পর্যবেক্ষণ
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">নিবন্ধিত প্রার্থী</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {healthData?.totalCandidates ?? '...'}
          </div>
          <p className="text-[11px] text-blue-600 font-bold mt-1">
            {healthData?.candidatesWithSkillsCount ?? '...'} স্কিল যুক্ত করেছেন
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">প্রোফাইল সম্পূর্ণতা</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {healthData?.candidatesWithCompleteProfilesCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 font-bold mt-1">
            ৮০%+ সম্পূর্ণ প্রোফাইল
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">স্কিল ট্যাক্সোনমি</span>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {CANONICAL_SKILLS.length}
          </div>
          <p className="text-[11px] text-teal-600 font-bold mt-1">
            {taxonomySectors.length} টি সেক্টরে বিন্যস্ত
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">ইঞ্জিন স্ট্যাটাস</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg inline-block">
            সক্রিয় ও শতভাগ রেডি
          </div>
          <p className="text-[11px] text-slate-500 font-bold mt-1">
            ভার্সন: v{config?.version || '1.0.0'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 8-Dimension Weights Editor (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveConfig} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-0.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-700" />
                  ৮-মাত্রিক স্কোরিং ওয়েট কনফিগারেশন (Scoring Weights)
                </h3>
                <p className="text-xs text-slate-500">
                  প্রতিটি মাত্রার প্রাসঙ্গিক প্রভাব নির্ধারণ করুন। মোট যোগফল ১০০% বাধ্যতামূলক।
                </p>
              </div>

              {/* Live Weight Total Pill */}
              <div className={`px-3 py-1 rounded-xl text-xs font-black border ${
                totalWeight === 100 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                মোট: {totalWeight}% {totalWeight === 100 ? '✓' : '(১০০% হতে হবে)'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Education Weight */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">শিক্ষাগত যোগ্যতা (Education)</label>
                  <span className="font-black text-emerald-700">{weights.education}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={weights.education}
                  onChange={(e) => setWeights({ ...weights, education: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
                <p className="text-[11px] text-slate-400">ডিগ্রি ও বিষয় সামঞ্জস্যের প্রভাব</p>
              </div>

              {/* Skills Weight */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">অর্জিত স্কিল (Required & Preferred)</label>
                  <span className="font-black text-emerald-700">{weights.skills}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={weights.skills}
                  onChange={(e) => setWeights({ ...weights, skills: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
                <p className="text-[11px] text-slate-400">প্রয়োজনীয় ও পছন্দের দক্ষতার প্রভাব</p>
              </div>

              {/* Experience Weight */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">কাজের অভিজ্ঞতা (Experience)</label>
                  <span className="font-black text-emerald-700">{weights.experience}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={weights.experience}
                  onChange={(e) => setWeights({ ...weights, experience: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
                <p className="text-[11px] text-slate-400">বছর ও ফ্রেশার ফ্রেন্ডলি বিবেচনায় প্রভাব</p>
              </div>

              {/* Category Weight */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">চাকরির ক্যাটাগরি (Category)</label>
                  <span className="font-black text-emerald-700">{weights.category}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={weights.category}
                  onChange={(e) => setWeights({ ...weights, category: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
                <p className="text-[11px] text-slate-400">প্রার্থীর পছন্দের চাকরি খাতের প্রভাব</p>
              </div>

              {/* Location Weight */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">পছন্দের লোকেশন (Location)</label>
                  <span className="font-black text-emerald-700">{weights.location}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={weights.location}
                  onChange={(e) => setWeights({ ...weights, location: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
                <p className="text-[11px] text-slate-400">জেলা ও সমগ্র বাংলাদেশ কোটার প্রভাব</p>
              </div>

              {/* Employment Type Weight */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">চাকরির ধরন (Employment Type)</label>
                  <span className="font-black text-emerald-700">{weights.employmentType}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={weights.employmentType}
                  onChange={(e) => setWeights({ ...weights, employmentType: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
                <p className="text-[11px] text-slate-400">ফুলটাইম, পার্টটাইম, চুক্তিভিত্তিক ইত্যাদি</p>
              </div>

              {/* Organization Type Weight */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">প্রতিষ্ঠানের ধরন (Org Type)</label>
                  <span className="font-black text-emerald-700">{weights.organizationType}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={weights.organizationType}
                  onChange={(e) => setWeights({ ...weights, organizationType: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
                <p className="text-[11px] text-slate-400">সরকারি, ব্যাংক, এনজিও, প্রাইভেট ইত্যাদি</p>
              </div>

              {/* Salary Preference Weight */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-800">বেতন প্রত্যাশা (Salary Expectation)</label>
                  <span className="font-black text-emerald-700">{weights.salary}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={weights.salary}
                  onChange={(e) => setWeights({ ...weights, salary: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
                <p className="text-[11px] text-slate-400">প্রত্যাশিত সর্বনিম্ন বেতনের সাথে সামঞ্জস্য</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving || totalWeight !== 100}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'ওজন পরিবর্তন সংরক্ষণ করুন'}</span>
              </button>
            </div>
          </form>

          {/* Thresholds & Policies Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings className="w-4 h-4 text-emerald-700" />
              ম্যাচিং থ্রেশহোল্ড ও কোটা রিল্যাক্সেশন নীতিমালা
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">উৎকৃষ্ট ম্যাচ থ্রেশহোল্ড (Excellent)</label>
                <input
                  type="number"
                  value={config?.excellentThreshold ?? 90}
                  onChange={(e) => setConfig(prev => prev ? { ...prev, excellentThreshold: Number(e.target.value) } : null)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">উপযুক্ত ম্যাচ থ্রেশহোল্ড (Strong)</label>
                <input
                  type="number"
                  value={config?.strongThreshold ?? 75}
                  onChange={(e) => setConfig(prev => prev ? { ...prev, strongThreshold: Number(e.target.value) } : null)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">সর্বনিম্ন রিকমেন্ডেশন স্কোর (Min Score)</label>
                <input
                  type="number"
                  value={config?.minScoreToRecommend ?? 40}
                  onChange={(e) => setConfig(prev => prev ? { ...prev, minScoreToRecommend: Number(e.target.value) } : null)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">কোটা বয়স শিথিলতা (বছর)</label>
                <input
                  type="number"
                  value={config?.quotaAgeRelaxationYears ?? 2}
                  onChange={(e) => setConfig(prev => prev ? { ...prev, quotaAgeRelaxationYears: Number(e.target.value) } : null)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={config?.allowOverqualification ?? true}
                  onChange={(e) => setConfig(prev => prev ? { ...prev, allowOverqualification: e.target.checked } : null)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <span>উচ্চশিক্ষিত প্রার্থীদের নিম্ন স্তরের পদে আবেদন যোগ্য রাখা (Overqualification Policy)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Canonical Skills Taxonomy Inspector */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                  স্কিলস ট্যাক্সোনমি ব্রাউজার
                </h3>
                <p className="text-[11px] text-slate-500">স্ট্যান্ডার্ড বাংলা ও ইংরেজি স্কিলস</p>
              </div>

              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-black">
                {filteredSkills.length} টি স্কিল
              </span>
            </div>

            {/* Sector Filter */}
            <select
              value={selectedTaxonomySector}
              onChange={(e) => setSelectedTaxonomySector(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="all">সকল সেক্টর ({taxonomySectors.length})</option>
              {taxonomySectors.map((sector) => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            {/* Skills Scrollable List */}
            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
              {filteredSkills.map((s) => (
                <div key={s.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{s.nameBn}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                      {s.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {s.nameEn}
                  </div>
                  {s.aliases && s.aliases.length > 0 && (
                    <div className="text-[10px] text-slate-400 truncate">
                      অ্যালাইয়াস: {s.aliases.slice(0, 3).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
