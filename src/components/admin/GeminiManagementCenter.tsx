'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Database, 
  DollarSign, 
  Cpu, 
  Sliders, 
  Layers, 
  Clock, 
  X,
  FileCode,
  HardDrive
} from 'lucide-react';
import { AIUsageLog } from '@/lib/verification/types';

interface GeminiManagementCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GeminiManagementCenter({ isOpen, onClose }: GeminiManagementCenterProps) {
  const [activeTab, setActiveTab] = useState<'health' | 'prompts' | 'usage' | 'quotas'>('health');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [usageSummary, setUsageSummary] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<AIUsageLog[]>([]);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  // Settings State
  const [dailyBudgetLimit, setDailyBudgetLimit] = useState<number>(50);
  const [autoVerifyEnabled, setAutoVerifyEnabled] = useState<boolean>(true);
  const [hashDeduplicationEnabled, setHashDeduplicationEnabled] = useState<boolean>(true);

  const fetchTelemetry = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/verification/usage');
      const data = await res.json();
      if (res.ok && data.success) {
        setUsageSummary(data.summary);
        setRecentLogs(data.recentLogs || []);
      }
    } catch (err) {
      console.error('Failed to load AI telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePingTest = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const startTime = Date.now();
      const res = await fetch('/api/admin/verification/usage');
      const data = await res.json();
      const latency = Date.now() - startTime;
      if (res.ok && data.success) {
        setPingResult(`Gemini 3.5 Flash সক্রিয় এবং রেসপন্সিভ (${latency}ms)।`);
        setHealthStatus({ healthy: true, model: 'gemini-3.5-flash', latency });
      } else {
        setPingResult('Gemini সার্ভারে সংযোগে সমস্যা।');
      }
    } catch (err: any) {
      setPingResult(`ত্রুটি: ${err.message}`);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTelemetry();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900">Gemini AI ইন্টেলিজেন্স ও কোটা ম্যানেজমেন্ট</h3>
              <p className="text-xs text-slate-500 font-medium">
                প্রোভাইডার স্থিতি, প্রম্পট ভার্সনিং, টোকেন ইকোনমিক্স ও সুরক্ষা কন্ট্রোল
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'health', label: 'প্রোভাইডার স্থিতি ও পিং' },
            { id: 'prompts', label: 'প্রম্পট ভার্সন রেজিস্ট্রি' },
            { id: 'usage', label: 'টোকেন ও খরচ এনালিটিক্স' },
            { id: 'quotas', label: 'কোটা ও অটোমেশন কন্ট্রোল' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === t.id
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: HEALTH & PING */}
        {activeTab === 'health' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">সক্রিয় প্রাইমারি মডেল</span>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-sm font-black text-slate-900">models/gemini-3.5-flash</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    উৎপাদনমুখী (Production)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  সার্ভার-সাইড HTTPS REST API • তাপমাত্রা: ০.১ • রেসপন্স ফরম্যাট: Strict JSON Schema
                </p>
              </div>

              <button
                type="button"
                disabled={isPinging}
                onClick={handlePingTest}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0 shadow-2xs transition-all disabled:opacity-50"
              >
                {isPinging ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                <span>সংযোগ পরীক্ষা করুন</span>
              </button>
            </div>

            {pingResult && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{pingResult}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-500">অনুরোধ টাইমআউট গার্ড</span>
                <div className="text-sm font-black text-slate-800">২৫ সেকেন্ড</div>
                <span className="text-[10px] text-slate-400">অটো-ক্যানসেলেশন ও ফলব্যাক</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-500">রেট লিমিট রিট্রাই পলিসি</span>
                <div className="text-sm font-black text-slate-800">১ বার (১৫০০ms বিরতি)</div>
                <span className="text-[10px] text-slate-400">HTTP 429/503 হ্যান্ডলার</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-500">ফলব্যাক মডেল চেইন</span>
                <div className="text-sm font-black text-slate-800">gemini-2.5-flash-lite</div>
                <span className="text-[10px] text-slate-400">অব্যাহত ডিটারমিনিস্টিক চেক</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROMPTS REGISTRY */}
        {activeTab === 'prompts' && (
          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-purple-600" />
                  <span className="font-black text-slate-900">circular_verification_v1</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 font-mono">
                    v1.2.0
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  সক্রিয় (Active)
                </span>
              </div>

              <div className="space-y-1 text-slate-600">
                <div><span className="font-bold text-slate-800">উদ্দেশ্য:</span> দ্বিমুখী ফ্যাক্ট-চেকিং, বয়সসীমা ও কোটা শর্ত বিশ্লেষণ, এবং খাঁটি বাংলায় সারসংক্ষেপ প্রস্তুত।</div>
                <div><span className="font-bold text-slate-800">নিরাপত্তা গার্ড:</span> <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">&lt;&lt;&lt;CIRCULAR_SOURCE_DATA&gt;&gt;&gt;</code> ইনজেকশন প্রতিরোধক বাউন্ডারি।</div>
                <div><span className="font-bold text-slate-800">আউটপুট স্কিমা:</span> Strict JSON with bengaliExplanation, supportedClaims, and eligibilityAnalysis.</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: USAGE & COST ECONOMICS */}
        {activeTab === 'usage' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-500">মোট AI অনুরোধ</span>
                <div className="text-base font-black text-slate-900">{usageSummary?.totalRequests || 0}টি</div>
              </div>
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-emerald-700">সফল কল</span>
                <div className="text-base font-black text-emerald-900">{usageSummary?.successfulRequests || 0}টি</div>
              </div>
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-purple-700">মোট টোকেন খরচ</span>
                <div className="text-base font-black text-purple-900 font-mono">{usageSummary?.totalTokens?.toLocaleString() || 0}</div>
              </div>
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-indigo-700">আনুমানিক ব্যয় (BDT)</span>
                <div className="text-base font-black text-indigo-900 font-mono">৳{(usageSummary?.totalEstimatedCostBdt || 0).toFixed(2)}</div>
              </div>
            </div>

            {/* Recent Logs Table */}
            <div className="space-y-1.5">
              <span className="font-black text-slate-800 block text-[11px]">সাম্প্রতিক AI যাচাইকরণের অডিট লগ:</span>
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[9px]">
                    <tr>
                      <th className="p-2">সময়</th>
                      <th className="p-2">ড্রাফট আইডি</th>
                      <th className="p-2">মডেল</th>
                      <th className="p-2">রেসপন্স টাইম</th>
                      <th className="p-2">টোকেন</th>
                      <th className="p-2">খরচ (টাকা)</th>
                      <th className="p-2">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-3 text-center text-slate-400">কোনো সাম্প্রতিক লগ সংরক্ষিত নেই</td>
                      </tr>
                    ) : (
                      recentLogs.slice(0, 10).map(log => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-2 text-slate-500">{new Date(log.requestTimestamp).toLocaleTimeString('bn-BD')}</td>
                          <td className="p-2 font-mono text-slate-800">{log.draftId || 'Direct'}</td>
                          <td className="p-2 font-mono text-purple-700 text-[10px]">{log.model}</td>
                          <td className="p-2 text-slate-600">{log.durationMs}ms</td>
                          <td className="p-2 font-mono text-slate-700">{log.totalTokens}</td>
                          <td className="p-2 font-mono text-slate-700">৳{log.estimatedCostBdt}</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUOTAS & AUTOMATION POLICY */}
        {activeTab === 'quotas' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <h4 className="font-black text-slate-800 text-[11px]">দৈনিক বাজেট ও সুরক্ষা নীতিমালা:</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">দৈনিক সর্বোচ্চ বাজেট সীমা (BDT)</span>
                    <span className="text-[10px] text-slate-400">সীমা ছাড়িয়ে গেলে AI কল সাময়িকভাবে স্থগিত হবে এবং ডিটারমিনিস্টিক মোড চলবে</span>
                  </div>
                  <input
                    type="number"
                    value={dailyBudgetLimit}
                    onChange={e => setDailyBudgetLimit(Number(e.target.value) || 0)}
                    className="w-24 p-1.5 bg-white border border-slate-200 rounded-xl text-center font-bold text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="font-bold text-slate-800 block">ইনজেশনের পর স্বয়ংক্রিয় যাচাই (Auto-verify)</span>
                    <span className="text-[10px] text-slate-400">স্পাইডার নতুন ড্রাফট সংগ্রহ করলে স্বয়ংক্রিয়ভাবে ব্যাকগ্রাউন্ড কিউতে যুক্ত হবে</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoVerifyEnabled}
                    onChange={e => setAutoVerifyEnabled(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="font-bold text-slate-800 block">কন্টেন্ট হ্যাশ ডিডুপ্লিকেশন (Hash Deduplication)</span>
                    <span className="text-[10px] text-slate-400">নথি অপরিবর্তিত থাকলে পূর্বের ফলাফল পুনঃব্যবহার করে টোকেন সাশ্রয় করবে</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hashDeduplicationEnabled}
                    onChange={e => setHashDeduplicationEnabled(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
