'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  AlertTriangle, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Play, 
  Search, 
  Filter, 
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Send,
  Eye,
  Check,
  X
} from 'lucide-react';

export default function DeadlineAlertManager() {
  const [activeSubTab, setActiveSubTab] = useState<'proposals' | 'deadlines' | 'monitoring' | 'deliveries' | 'rules'>('proposals');
  const [stats, setStats] = useState<any>(null);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionRunning, setIsActionRunning] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const ADMIN_REQ_HEADERS = {
    'Content-Type': 'application/json',
    'x-admin-secret': 'CHAKRISEBA_SECURE_ADMIN_2026'
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch deadlines & stats
      const dlRes = await fetch('/api/admin/deadlines', { headers: ADMIN_REQ_HEADERS });
      if (dlRes.ok) {
        const dData = await dlRes.json();
        setDeadlines(dData.jobs || []);
        setStats(dData.stats || null);
      }

      // 2. Fetch proposals
      const propRes = await fetch('/api/admin/circular-changes', { headers: ADMIN_REQ_HEADERS });
      if (propRes.ok) {
        const pData = await propRes.json();
        setProposals(pData.proposals || []);
      }

      // 3. Fetch deliveries
      const delRes = await fetch('/api/admin/notifications/deliveries', { headers: ADMIN_REQ_HEADERS });
      if (delRes.ok) {
        const delData = await delRes.json();
        setDeliveries(delData.deliveries || []);
      }
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleApproveProposal = async (proposalId: string) => {
    const notes = prompt('অনুমোদন সংক্রান্ত নোট লিখুন (ঐচ্ছিক):', 'অফিসিয়াল সার্কুলার যাচাই করে অনুমোদিত');
    setIsActionRunning(true);
    try {
      const res = await fetch(`/api/admin/circular-changes/${proposalId}`, {
        method: 'POST',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({ action: 'approve', notes })
      });
      const data = await res.json();
      if (res.ok) {
        alert('প্রস্তাবনাটি সফলভাবে অনুমোদিত এবং মূল বিজ্ঞপ্তিতে প্রতিফলিত হয়েছে!');
        fetchAllData();
      } else {
        alert(data.error || 'অনুমোদন ব্যর্থ হয়েছে');
      }
    } catch {
      alert('সার্ভার এরর');
    } finally {
      setIsActionRunning(false);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    const reason = prompt('বাতিলের কারণ লিখুন:', 'ভুল বা অপ্রামাণ্য তথ্য');
    if (!reason) return;
    setIsActionRunning(true);
    try {
      const res = await fetch(`/api/admin/circular-changes/${proposalId}`, {
        method: 'POST',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({ action: 'reject', reason })
      });
      if (res.ok) {
        alert('প্রস্তাবনাটি বাতিল করা হয়েছে।');
        fetchAllData();
      }
    } catch {
      alert('সার্ভার এরর');
    } finally {
      setIsActionRunning(false);
    }
  };

  const handleTriggerMonitoring = async () => {
    if (!confirm('আপনি কি নিশ্চিত যে এখনই সম্পূর্ণ ডেডলাইন মনিটরিং, এক্সপায়রেশন চেক ও রিমাইন্ডার ডিসপ্যাচ চালাতে চান?')) return;
    setIsActionRunning(true);
    try {
      const res = await fetch('/api/admin/monitoring/run', {
        method: 'POST',
        headers: ADMIN_REQ_HEADERS
      });
      const data = await res.json();
      if (res.ok) {
        alert(`মনিটরিং সম্পন্ন! মোট চাকরি চেক: ${data.runRecord.jobsChecked}, আজ শেষ: ${data.runRecord.closingTodayCount}, ৩ দিনে শেষ: ${data.runRecord.closingSoonCount}, নতুন নোটিফিকেশন: ${data.runRecord.alertsGenerated}`);
        fetchAllData();
      } else {
        alert(data.error || 'মনিটরিং ব্যর্থ হয়েছে');
      }
    } catch {
      alert('সার্ভার এরর');
    } finally {
      setIsActionRunning(false);
    }
  };

  // Filter deadlines list
  const filteredDeadlines = deadlines.filter(j => {
    if (statusFilter === 'closing_today' && !j.evaluation?.isClosingToday) return false;
    if (statusFilter === 'closing_soon' && (!j.evaluation?.isClosingSoon || j.evaluation?.isClosingToday)) return false;
    if (statusFilter === 'expired' && !j.evaluation?.isClosed) return false;
    if (statusFilter === 'cancelled' && j.evaluation?.status !== 'CANCELLED') return false;
    if (statusFilter === 'suspended' && j.evaluation?.status !== 'SUSPENDED') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = j.title?.toLowerCase().includes(q) || j.organization?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const pendingProposals = proposals.filter(p => p.status === 'PENDING_REVIEW');

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-700" />
            <span>ডেডলাইন মনিটরিং, সার্কুলার আপডেট ও স্মার্ট অ্যালার্ট কন্ট্রোল</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            আবেদনের সময়সীমা ট্র্যাকিং, সার্কুলার পরিবর্তন ডিটেকশন, নোটিফিকেশন ডেলিভারি ও এক্সপায়রেশন ম্যানেজমেন্ট।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTriggerMonitoring}
            disabled={isActionRunning}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isActionRunning ? 'animate-spin' : ''}`} />
            <span>এখনই মনিটরিং রান করুন</span>
          </button>
          <button
            type="button"
            onClick={fetchAllData}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="রিফ্রেশ"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-500">মোট সক্রিয় বিজ্ঞপ্তি</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalActiveJobs}</div>
          </div>
          <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 shadow-2xs">
            <div className="text-[11px] font-bold text-rose-800">আজ শেষ ডেডলাইন</div>
            <div className="text-2xl font-black text-rose-700 mt-1">{stats.closingToday}</div>
          </div>
          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 shadow-2xs">
            <div className="text-[11px] font-bold text-amber-800">শীঘ্রই শেষ (৩ দিন)</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{stats.closingSoon}</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-[11px] font-bold text-slate-600">মেয়াদোত্তীর্ণ চাকরি</div>
            <div className="text-2xl font-black text-slate-600 mt-1">{stats.expired}</div>
          </div>
          <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 shadow-2xs">
            <div className="text-[11px] font-bold text-purple-800">পেন্ডিং আপডেট প্রস্তাব</div>
            <div className="text-2xl font-black text-purple-700 mt-1">{pendingProposals.length}</div>
          </div>
          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 shadow-2xs">
            <div className="text-[11px] font-bold text-blue-800">মোট নোটিফিকেশন লগ</div>
            <div className="text-2xl font-black text-blue-700 mt-1">{deliveries.length}</div>
          </div>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('proposals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'proposals'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>সার্কুলার পরিবর্তন রিভিউ</span>
          {pendingProposals.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
              {pendingProposals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('deadlines')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'deadlines'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ডেডলাইন মনিটরিং তালিকা ({deadlines.length})
        </button>

        <button
          onClick={() => setActiveSubTab('deliveries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'deliveries'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          নোটিফিকেশন ডেলিভারি লগ ({deliveries.length})
        </button>

        <button
          onClick={() => setActiveSubTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'rules'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          স্মার্ট অ্যালার্ট শিডিউল রুলস
        </button>
      </div>

      {/* SUB-TAB 1: PROPOSALS REVIEW */}
      {activeSubTab === 'proposals' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>সার্কুলার পরিবর্তন ও আপডেট প্রস্তাবনা ({proposals.length} টি)</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              অ্যাডমিন অনুমোদন পেলে স্বয়ংক্রিয়ভাবে মূল সার্কুলারে প্রতিফলিত হবে
            </span>
          </div>

          {proposals.length > 0 ? (
            <div className="space-y-3">
              {proposals.map(prop => (
                <div 
                  key={prop.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    prop.status === 'PENDING_REVIEW' 
                      ? 'bg-purple-50/40 border-purple-200' 
                      : prop.status === 'APPROVED' 
                        ? 'bg-emerald-50/30 border-emerald-200' 
                        : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        prop.changeType === 'DEADLINE_EXTENDED' ? 'bg-purple-100 text-purple-800' :
                        prop.changeType === 'CANCELLATION' ? 'bg-rose-100 text-rose-800' :
                        prop.changeType === 'SUSPENSION' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {prop.changeType}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{prop.jobTitle}</span>
                      <span className="text-xs text-slate-500">({prop.organization})</span>
                    </div>

                    <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 font-mono flex items-center gap-3">
                      <span className="text-rose-600 line-through">পূর্বের মান: {String(prop.oldValue)}</span>
                      <span>➔</span>
                      <span className="text-emerald-700 font-bold">নতুন প্রস্তাবিত মান: {String(prop.newValue)}</span>
                    </div>

                    <p className="text-xs text-slate-600 italic">
                      প্রমাণ/সোর্স এভিডেন্স: {prop.evidenceSnippet}
                    </p>

                    <div className="text-[11px] text-slate-400">
                      তারিখ: {new Date(prop.createdAt).toLocaleString('bn-BD')} • কনফিডেন্স: {Math.round(prop.confidence * 100)}%
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                    {prop.status === 'PENDING_REVIEW' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproveProposal(prop.id)}
                          disabled={isActionRunning}
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>অনুমোদন</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectProposal(prop.id)}
                          disabled={isActionRunning}
                          className="px-3.5 py-1.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>বাতিল</span>
                        </button>
                      </>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        prop.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {prop.status === 'APPROVED' ? '✓ অনুমোদিত' : '✗ বাতিলকৃত'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              কোনো পরিবর্তন প্রস্তাবনা পেন্ডিং নেই।
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: DEADLINES TABLE */}
      {activeSubTab === 'deadlines' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                সকল
              </button>
              <button
                onClick={() => setStatusFilter('closing_today')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'closing_today' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800'
                }`}
              >
                আজ শেষ
              </button>
              <button
                onClick={() => setStatusFilter('closing_soon')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'closing_soon' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800'
                }`}
              >
                ৩ দিনে শেষ
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'expired' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                মেয়াদোত্তীর্ণ
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="বিজ্ঞপ্তি বা প্রতিষ্ঠান খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs px-3 py-2 pl-8 border border-slate-200 rounded-xl focus:outline-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">বিজ্ঞপ্তি ও প্রতিষ্ঠান</th>
                  <th className="p-3">ক্যাটাগরি</th>
                  <th className="p-3">নির্ধারিত ডেডলাইন</th>
                  <th className="p-3">অবশিষ্ট সময়</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3 text-right">লিংক</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeadlines.slice(0, 50).map(job => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{job.title}</div>
                      <div className="text-[11px] text-slate-500">{job.organization}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {job.categoryLabel}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      {job.deadlineOriginal}
                    </td>
                    <td className="p-3 font-bold">
                      {job.evaluation?.labelBn}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${job.evaluation?.badgeColor}`}>
                        {job.evaluation?.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/jobs/${job.id}`}
                        target="_blank"
                        className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>ভিউ</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DELIVERIES LOG */}
      {activeSubTab === 'deliveries' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-700" />
              <span>নোটিফিকেশন ও অ্যালার্ট ডিসপ্যাচ লগ ({deliveries.length} টি)</span>
            </h3>
            <span className="text-xs text-slate-500">
              ইন-অ্যাপ ও ইমেইল নোটিফিকেশনের রিয়েল-টাইম ডেলিভারি হিস্ট্রি
            </span>
          </div>

          <div className="space-y-2">
            {deliveries.length > 0 ? (
              deliveries.slice(0, 30).map(del => (
                <div key={del.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{del.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
                        {del.channel}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{del.message}</p>
                    <div className="text-[10px] text-slate-400">
                      প্রাপক: {del.candidateId} • সময়: {new Date(del.createdAt).toLocaleString('bn-BD')}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    del.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                    del.status === 'QUEUED' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {del.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                এখনো কোনো ডেলিভারি লগ পাওয়া যায়নি।
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: ALERT RULES */}
      {activeSubTab === 'rules' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <h3 className="text-sm font-black text-slate-900">স্মার্ট অ্যালার্ট শিডিউল রুলস</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">৭ দিন আগে নোটিফিকেশন (Lead Time: 7 Days)</div>
              <p className="text-xs text-slate-600">আবেদনের শেষ সময়সীমার ৭ দিন আগে সাধারণ অনুস্মারক।</p>
              <div className="text-[11px] text-emerald-700 font-bold">চ্যানেল: In-App, Email • স্ট্যাটাস: সক্রিয়</div>
            </div>
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
              <div className="font-bold text-amber-900">৩ দিন আগে জরুরি অ্যালার্ট (Lead Time: 3 Days)</div>
              <p className="text-xs text-amber-800">সার্ভার ট্রাফিক বৃদ্ধির পূর্বে প্রার্থীকে সতর্কবার্তা প্রেরণ।</p>
              <div className="text-[11px] text-amber-800 font-bold">চ্যানেল: In-App, Email, Push • স্ট্যাটাস: সক্রিয়</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">১ দিন আগে শেষ সুযোগ (Lead Time: 1 Day)</div>
              <p className="text-xs text-slate-600">আগামীকাল শেষ ডেডলাইন সংক্রান্ত তাগিদ নোটিশ।</p>
              <div className="text-[11px] text-emerald-700 font-bold">চ্যানেল: In-App, Email • স্ট্যাটাস: সক্রিয়</div>
            </div>
            <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 space-y-1">
              <div className="font-bold text-rose-900">আজকের শেষ ডেডলাইন (Lead Time: 0 Days)</div>
              <p className="text-xs text-rose-800">আজকেই শেষ সময় — فوری আবেদন নিশ্চিতকরণের জন্য উচ্চ-অগ্রাধিকার অ্যালার্ট।</p>
              <div className="text-[11px] text-rose-800 font-bold">চ্যানেল: In-App, Email, Push • স্ট্যাটাস: সক্রিয়</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
