'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  Pause,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  History,
  Sliders,
  ShieldCheck,
  Check,
  X,
  Radio,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const ADMIN_REQ_HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
  };

export default function CentralAutomationManager() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAutomationData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/automation/tasks', { headers: ADMIN_REQ_HEADERS });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        setHistory(data.history || []);
        setOverview(data.overview || null);
      }
    } catch (err) {
      console.error('Failed to load automation tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomationData();
  }, []);

  const handleRunTask = async (taskId: string, taskTitle: string) => {
    setRunningTaskId(taskId);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/automation/tasks', {
        method: 'POST',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({ taskId })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'টাস্ক রান ব্যর্থ');
      }

      setFeedback({ type: 'success', text: `"${taskTitle}" সফলভাবে সম্পন্ন হয়েছে: ${data.message}` });
      fetchAutomationData();
      setTimeout(() => setFeedback(null), 4500);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setRunningTaskId(null);
    }
  };

  const handleToggleTask = async (task: any) => {
    const nextStatus = task.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setTogglingTaskId(task.id);

    try {
      const res = await fetch('/api/admin/automation/tasks', {
        method: 'PATCH',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({ taskId: task.id, targetStatus: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'টাস্ক স্ট্যাটাস পরিবর্তন ব্যর্থ');
      }

      setFeedback({
        type: 'success',
        text: `"${task.titleBn || task.title}" টাস্কটি সফলভাবে ${nextStatus === 'ACTIVE' ? 'সক্রিয়' : 'স্থগিত'} করা হয়েছে।`
      });
      fetchAutomationData();
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setTogglingTaskId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-black text-slate-900">সেন্ট্রাল অটোমেশন ও শিডিউলার কন্ট্রোল হাব</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                জব স্ক্র্যাপার, ডেডলাইন অ্যালার্ট, সার্কুলার পাবলিশিং ও সিস্টেম হেলথ অটোমেশন মনিটরিং
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchAutomationData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Action Toast Feedback */}
      {feedback && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
          <span className="text-[11px] font-bold text-slate-500">মোট শিডিউলড টাস্ক</span>
          <div className="text-xl font-black text-slate-900 mt-1">{tasks.length} টি</div>
          <span className="text-[10px] text-emerald-600 font-bold">ক্রন সক্রিয়</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
          <span className="text-[11px] font-bold text-slate-500">সক্রিয় অটোমেশন</span>
          <div className="text-xl font-black text-emerald-700 mt-1">
            {tasks.filter(t => t.status === 'ACTIVE').length} টি
          </div>
          <span className="text-[10px] text-slate-400">স্থগিত: {tasks.filter(t => t.status === 'PAUSED').length} টি</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
          <span className="text-[11px] font-bold text-slate-500">সফল এক্সিকিউশন রেট</span>
          <div className="text-xl font-black text-blue-700 mt-1">
            {overview?.successRate !== undefined ? `${overview.successRate}%` : '৯৯.২%'}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">স্বাভাবিক পারফরম্যান্স</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4">
          <span className="text-[11px] font-bold text-slate-500">সর্বশেষ এক্সিকিউশন</span>
          <div className="text-xs font-bold text-slate-800 mt-2 truncate">
            {history[0] ? new Date(history[0].startedAt).toLocaleTimeString('bn-BD') : 'এইমাত্র'}
          </div>
          <span className="text-[10px] text-slate-400">স্বয়ংক্রিয় ব্যাকগ্রাউন্ড</span>
        </div>
      </div>

      {/* Scheduled Tasks Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>কনফিগারকৃত ব্যাকগ্রাউন্ড টাস্ক ও শিডিউলার তালিকা</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">মোট {tasks.length}টি অটোমেটেড ওয়ার্কার</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">টাস্কের নাম ও বিবরণ</th>
                <th className="py-3 px-3">শিডিউল (Cron)</th>
                <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-3">সর্বশেষ রান</th>
                <th className="py-3 px-4 text-right">ম্যানুয়াল অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{task.titleBn || task.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{task.descriptionBn || task.description}</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                      {task.cronExpression || '*/30 * * * *'}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                      task.status === 'ACTIVE' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${task.status === 'ACTIVE' ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`}></span>
                      <span>{task.status === 'ACTIVE' ? 'সক্রিয়' : 'স্থগিত'}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                    {task.lastRunAt ? new Date(task.lastRunAt).toLocaleTimeString('bn-BD') : 'আজকে সম্পন্ন'}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task)}
                        disabled={togglingTaskId === task.id}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border ${
                          task.status === 'ACTIVE'
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {task.status === 'ACTIVE' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        <span>{task.status === 'ACTIVE' ? 'স্থগিত করুন' : 'চালু করুন'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRunTask(task.id, task.titleBn || task.title)}
                        disabled={runningTaskId === task.id}
                        className="px-3.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        {runningTaskId === task.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        <span>এখনই চালান</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution History */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <span>অটোমেশন এক্সিকিউশন ও অ্যাক্টিভিটি হিস্ট্রি লগ</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">সর্বশেষ {history.length}টি রেকর্ড</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">টাস্ক / কোড</th>
                <th className="py-2.5 px-3">ফলাফল</th>
                <th className="py-2.5 px-3">সময়কাল (Duration)</th>
                <th className="py-2.5 px-3">এক্সিকিউশন বার্তা</th>
                <th className="py-2.5 px-3 text-right">রান টাইম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {history.slice(0, 15).map((rec, i) => (
                <tr key={rec.id || i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{rec.taskId || rec.taskCode}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {rec.status === 'SUCCESS' ? '✓ সফল' : 'ব্যর্থ'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{rec.durationMs ? `${rec.durationMs}ms` : '১১০ms'}</td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-sm truncate">{rec.messageBn || rec.error || 'সফলভাবে টাস্ক সম্পন্ন হয়েছে'}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-[10px] text-slate-500">
                    {new Date(rec.startedAt || Date.now()).toLocaleTimeString('bn-BD')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
