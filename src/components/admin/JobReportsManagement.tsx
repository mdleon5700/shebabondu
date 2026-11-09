'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  RefreshCw, 
  Filter, 
  ExternalLink,
  MessageSquare,
  User,
  Phone,
  Mail,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { JobReportItem } from '@/lib/types';

export default function JobReportsManagement() {
  const [reports, setReports] = useState<JobReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<JobReportItem | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    investigating: 0,
    resolved: 0,
    dismissed: 0
  });

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter && statusFilter !== 'all' 
        ? `/api/admin/job-reports?status=${statusFilter}` 
        : '/api/admin/job-reports';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.reports)) {
          setReports(data.reports);
          if (data.counts) setCounts(data.counts);
        }
      }
    } catch (err) {
      console.error('Failed to fetch job reports', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: 'pending' | 'investigating' | 'resolved' | 'dismissed') => {
    setIsUpdating(true);
    setActionMsg(null);
    try {
      const res = await fetch('/api/admin/job-reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          adminNotes: adminNotes.trim() || undefined
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMsg(`রিপোর্ট ${id} এর স্ট্যাটাস '${newStatus}' এ সফলভাবে আপডেট হয়েছে!`);
        setSelectedReport(null);
        setAdminNotes('');
        await fetchReports();
      } else {
        alert(data.error || 'আপডেট ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredReports = reports.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.jobTitle.toLowerCase().includes(q) ||
      (r.details && r.details.toLowerCase().includes(q)) ||
      (r.reporterName && r.reporterName.toLowerCase().includes(q)) ||
      (r.reporterPhone && r.reporterPhone.includes(q))
    );
  });

  return (
    <div className="space-y-6 text-slate-800 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>প্রার্থী অভিযোগ ও ফ্যাক্ট-চেকিং সেল</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            ভুয়া সার্কুলার ও অভিযোগ পর্যবেক্ষণ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            চাকরিপ্রার্থীদের দাখিলকৃত অভিযোগ, ডেডলাইন অসঙ্গতি ও ভুয়া নিয়োগ সতর্কবার্তা যাচাই ও সমাধান করুন।
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="p-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>রিফ্রেশ ডাটা</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'মোট অভিযোগ', count: counts.total, color: 'text-slate-900', bg: 'bg-white', filter: 'all' },
          { label: 'নতুন পর্যালোচনা', count: counts.pending, color: 'text-rose-600', bg: 'bg-rose-50/50', filter: 'pending' },
          { label: 'তদন্তাধীন', count: counts.investigating, color: 'text-amber-600', bg: 'bg-amber-50/50', filter: 'investigating' },
          { label: 'সমাধানকৃত ও সঠিক', count: counts.resolved, color: 'text-emerald-700', bg: 'bg-emerald-50/50', filter: 'resolved' },
          { label: 'খারিজ / বাতিল', count: counts.dismissed, color: 'text-slate-500', bg: 'bg-slate-50', filter: 'dismissed' }
        ].map(kpi => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => setStatusFilter(kpi.filter)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              statusFilter === kpi.filter 
                ? 'border-slate-800 ring-2 ring-slate-800/10 shadow-sm' 
                : 'border-slate-200 hover:border-slate-300'
            } ${kpi.bg}`}
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">{kpi.label}</span>
            <span className={`text-2xl font-black ${kpi.color}`}>{kpi.count}</span>
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="আইডি, বিজ্ঞপ্তির নাম, ফোন নম্বর বা অভিযোগ খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-800"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
          <span className="text-slate-400 mr-1 shrink-0">ফিল্টার:</span>
          {[
            { id: 'all', label: 'সকল' },
            { id: 'pending', label: 'নতুন' },
            { id: 'investigating', label: 'তদন্তাধীন' },
            { id: 'resolved', label: 'সমাধানকৃত' },
            { id: 'dismissed', label: 'খারিজ' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Reports */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">রেফারেন্স ID</th>
                <th className="py-3 px-4">বিজ্ঞপ্তির নাম ও লিঙ্ক</th>
                <th className="py-3 px-4">সমস্যার ধরন</th>
                <th className="py-3 px-4">অভিযোগ বিবরণ</th>
                <th className="py-3 px-4">রিপোর্টার</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    কোনো অভিযোগ পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {report.id}
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-bold text-slate-900 truncate" title={report.jobTitle}>
                        {report.jobTitle}
                      </div>
                      {report.jobId && (
                        <div className="text-[10px] text-slate-400 font-mono">ID: {report.jobId}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {report.issueLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <p className="text-slate-600 line-clamp-2 leading-relaxed" title={report.details}>
                        {report.details}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{report.reporterName || 'বেনামী'}</div>
                      {report.reporterPhone && (
                        <div className="text-[10px] text-slate-400">{report.reporterPhone}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        report.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : report.status === 'investigating'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : report.status === 'dismissed'
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}>
                        {report.status === 'resolved' ? '✓ সমাধানকৃত' : report.status === 'investigating' ? '🔍 তদন্তাধীন' : report.status === 'dismissed' ? '✕ বাতিল' : '⏳ নতুন অভিযোগ'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setAdminNotes(report.adminNotes || '');
                        }}
                        className="px-3 py-1 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        রিভিউ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Action Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">অভিযোগ পর্যালোচনা</span>
                <h3 className="font-black text-base text-slate-900">{selectedReport.id}</h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 font-bold block">বিজ্ঞপ্তি:</span>
                <span className="font-bold text-slate-900">{selectedReport.jobTitle}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">সমস্যার ধরন:</span>
                <span className="text-rose-700 font-semibold">{selectedReport.issueLabel}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">অভিযোগকারীর বিবরণ:</span>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 leading-relaxed mt-1">
                  {selectedReport.details}
                </p>
              </div>

              {/* Admin Notes Input */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  অ্যাডমিন যাচাই ও সমাধানের নোট:
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="যেমন: অফিসিয়াল প্রেস বিজ্ঞপ্তি অনুযায়ী ডেডলাইন ২০২৬-০২-২৮ আপডেট করা হয়েছে।"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-800"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t flex flex-wrap gap-2">
              <button
                disabled={isUpdating}
                onClick={() => handleUpdateStatus(selectedReport.id, 'investigating')}
                className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                🔍 তদন্তাধীন চিহ্নিত করুন
              </button>
              <button
                disabled={isUpdating}
                onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                ✓ সমাধানকৃত চিহ্নিত করুন
              </button>
              <button
                disabled={isUpdating}
                onClick={() => handleUpdateStatus(selectedReport.id, 'dismissed')}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                ✕ বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

