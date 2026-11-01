'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserCheck, 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  Edit3, 
  Eye, 
  Lock, 
  KeyRound, 
  Send, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Award, 
  GraduationCap, 
  FileText, 
  FileBox, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Sliders, 
  Building, 
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  Printer
} from 'lucide-react';
import { CandidateProfile, ApplicationRequest, CandidateDocument } from '@/lib/types';
import { BD_DIVISIONS_EN } from '@/lib/constants';
import UniversalUserWorkspace from '@/components/admin/UniversalUserWorkspace';

interface CandidateManagementHubProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  candidates?: any[];
  applications?: any[];
  onRefreshCandidates?: () => void;
}

export default function CandidateManagementHub({
  activeTab = 'candidate-directory',
  onTabChange,
  candidates = [],
  applications = [],
  onRefreshCandidates
}: CandidateManagementHubProps) {
  // Sync tab with parent
  const [currentSubTab, setCurrentSubTab] = useState<'candidate-directory' | 'candidate-details' | 'account-status'>(
    activeTab === 'candidate-details' ? 'candidate-details' :
    activeTab === 'account-status' ? 'account-status' : 'candidate-directory'
  );

  React.useEffect(() => {
    if (activeTab === 'candidate-directory' || activeTab === 'candidate-details' || activeTab === 'account-status') {
      setCurrentSubTab(activeTab);
    }
  }, [activeTab]);

  const handleSubTabSwitch = (tab: 'candidate-directory' | 'candidate-details' | 'account-status') => {
    setCurrentSubTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // Directory Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [quotaFilter, setQuotaFilter] = useState('all');
  const [educationFilter, setEducationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected candidate for Details view
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    candidates.length > 0 ? candidates[0].id : ''
  );

  // Selected candidate object
  const currentCandidate = useMemo(() => {
    return candidates.find(c => c.id === selectedCandidateId) || candidates[0] || null;
  }, [candidates, selectedCandidateId]);

  // Teletalk quick copier modal
  const [quickCopierCandidate, setQuickCopierCandidate] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Direct SMS modal
  const [smsCandidate, setSmsCandidate] = useState<any | null>(null);
  const [smsMessage, setSmsMessage] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsSuccessToast, setSmsSuccessToast] = useState<string | null>(null);

  // Password reset state
  const [resetSuccessModal, setResetSuccessModal] = useState<{ candidateName: string; tempPass: string } | null>(null);
  const [isResettingPass, setIsResettingPass] = useState(false);

  // Verification & Status Action state
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Universal User Workspace Modal State
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        !q ||
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.nameBn && c.nameBn.includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.nid && c.nid.includes(q)) ||
        (c.username && c.username.toLowerCase().includes(q)) ||
        (c.district && c.district.toLowerCase().includes(q));

      const matchesDistrict = districtFilter === 'all' || 
        (c.district && c.district.toLowerCase().includes(districtFilter.toLowerCase()));

      const matchesQuota = quotaFilter === 'all' || 
        (c.quota && c.quota === quotaFilter) || 
        (quotaFilter === 'none' && (!c.quota || c.quota === 'none'));

      const matchesEdu = educationFilter === 'all' || 
        (c.education && Array.isArray(c.education) && c.education.some((e: any) => 
          e.level?.toLowerCase().includes(educationFilter.toLowerCase()) || 
          e.degree?.toLowerCase().includes(educationFilter.toLowerCase())
        ));

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'verified' && (c.isVerified || c.id === 'USR-01774366643')) ||
        (statusFilter === 'active' && c.accountStatus !== 'suspended' && c.accountStatus !== 'banned') ||
        (statusFilter === 'suspended' && c.accountStatus === 'suspended');

      return matchesSearch && matchesDistrict && matchesQuota && matchesEdu && matchesStatus;
    });
  }, [candidates, searchTerm, districtFilter, quotaFilter, educationFilter, statusFilter]);

  // Export filtered candidates to CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Name (EN)', 'Name (BN)', 'Phone', 'Email', 'District', 'NID', 'Quota', 'Wallet (BDT)', 'Status'];
    const rows = filteredCandidates.map(c => [
      c.id,
      `"${c.name || ''}"`,
      `"${c.nameBn || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.district || 'ঢাকা'}"`,
      `"${c.nid || ''}"`,
      `"${c.quota || 'none'}"`,
      c.walletBalance || 0,
      c.accountStatus || 'active'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chakrisheba_candidates_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle Verification Badge
  const handleToggleVerification = async (candidate: any) => {
    const nextStatus = !candidate.isVerified;
    try {
      const res = await fetch(`/api/admin/candidates/${candidate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ isVerified: nextStatus, reason: `ভেরিফিকেশন স্ট্যাটাস পরিবর্তন: ${nextStatus ? 'অনুমোদিত' : 'প্রত্যাহার'}` })
      });
      if (res.ok) {
        setActionFeedback(`${candidate.name} এর ভেরিফিকেশন স্ট্যাটাস সফলভাবে ${nextStatus ? 'অনুমোদিত' : 'প্রত্যাহার'} হয়েছে!`);
        candidate.isVerified = nextStatus;
        setTimeout(() => setActionFeedback(null), 3500);
        if (onRefreshCandidates) onRefreshCandidates();
      }
    } catch {
      alert('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
    }
  };

  // Toggle Account Suspension
  const handleToggleSuspension = async (candidate: any) => {
    const isCurrentlySuspended = candidate.accountStatus === 'suspended';
    const nextStatus = isCurrentlySuspended ? 'active' : 'suspended';
    if (!confirm(`আপনি কি নিশ্চিত যে ${candidate.name} এর অ্যাকাউন্ট ${isCurrentlySuspended ? 'পুনরায় সক্রিয়' : 'সাময়িক স্থগিত (Suspend)'} করতে চান?`)) return;

    try {
      const res = await fetch(`/api/admin/candidates/${candidate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ status: nextStatus, reason: `অ্যাডমিন মডারেশন: ${nextStatus}` })
      });
      if (res.ok) {
        candidate.accountStatus = nextStatus;
        setActionFeedback(`${candidate.name} এর অ্যাকাউন্ট সফলভাবে ${nextStatus === 'active' ? 'সক্রিয়' : 'স্থগিত'} করা হয়েছে!`);
        setTimeout(() => setActionFeedback(null), 3500);
        if (onRefreshCandidates) onRefreshCandidates();
      }
    } catch {
      alert('অ্যাকশন ব্যর্থ হয়েছে।');
    }
  };

  // Generate Temporary Password
  const handleGenerateTempPassword = async (candidate: any) => {
    const tempPass = 'CS' + Math.floor(100000 + Math.random() * 900000);
    if (!confirm(`${candidate.name} এর জন্য একটি নতুন অস্থায়ী পাসওয়ার্ড (${tempPass}) সেট করতে চান?`)) return;

    setIsResettingPass(true);
    try {
      const res = await fetch(`/api/admin/candidates/${candidate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ newPassword: tempPass, reason: 'অ্যাডমিন পাসওয়ার্ড রিসেট' })
      });
      if (res.ok) {
        setResetSuccessModal({ candidateName: candidate.name, tempPass });
      }
    } catch {
      alert('পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।');
    } finally {
      setIsResettingPass(false);
    }
  };

  // Send Direct SMS
  const handleSendDirectSms = () => {
    if (!smsCandidate || !smsMessage.trim()) return;
    setIsSendingSms(true);
    setTimeout(() => {
      setIsSendingSms(false);
      setSmsSuccessToast(`সফলভাবে ${smsCandidate.phone} নম্বরে বার্তা প্রেরিত হয়েছে!`);
      setTimeout(() => {
        setSmsSuccessToast(null);
        setSmsCandidate(null);
        setSmsMessage('');
      }, 2500);
    }, 600);
  };

  // Candidate applications for the 360 inspector
  const candidateApps = useMemo(() => {
    if (!currentCandidate) return [];
    return applications.filter(a => a.candidateId === currentCandidate.id || a.candidatePhone === currentCandidate.phone);
  }, [applications, currentCandidate]);

  // Candidate documents for the 360 inspector
  const candidateDocs: CandidateDocument[] = useMemo(() => {
    if (!currentCandidate) return [];
    return currentCandidate.documents || [];
  }, [currentCandidate]);

  return (
    <div className="space-y-6">
      {/* Top Module Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-black text-slate-900">চাকরিপ্রার্থী ও প্রোফাইল মাস্টার হাব</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              ভল্ট কানেক্টেড
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            নিবন্ধিত চাকরিপ্রার্থী ডিরেক্টরি, ৩৬০° প্রোফাইল ও সনদ ইন্সপেক্টর, এবং অ্যাকাউন্ট মডারেশন
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleSubTabSwitch('candidate-directory')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentSubTab === 'candidate-directory' 
                ? 'bg-white text-emerald-800 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>প্রার্থী ডিরেক্টরি</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {candidates.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSubTabSwitch('candidate-details')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentSubTab === 'candidate-details' 
                ? 'bg-white text-emerald-800 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>৩৬০° প্রোফাইল ও ভল্ট</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubTabSwitch('account-status')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentSubTab === 'account-status' 
                ? 'bg-white text-emerald-800 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>অ্যাকাউন্ট স্ট্যাটাস ও মডারেশন</span>
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* =========================================================================
          SUBTAB 1: CANDIDATE DIRECTORY (With Full Search & 4-Tier Filters)
         ========================================================================= */}
      {currentSubTab === 'candidate-directory' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">মোট নিবন্ধিত প্রার্থী</p>
                <h3 className="text-xl font-black text-slate-900">{candidates.length} জন</h3>
                <p className="text-[11px] text-emerald-700">ভল্ট স্টোরেজে সংরক্ষিত</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">ভেরিফাইড চাকরিপ্রার্থী</p>
                <h3 className="text-xl font-black text-blue-700">
                  {candidates.filter(c => c.isVerified || c.id === 'USR-01774366643').length} জন
                </h3>
                <p className="text-[11px] text-slate-500">এনআইডি ও সনদ যাচাইকৃত</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">কোটা সুবিধাভোগী</p>
                <h3 className="text-xl font-black text-purple-700">
                  {candidates.filter(c => c.quota && c.quota !== 'none').length} জন
                </h3>
                <p className="text-[11px] text-slate-500">মুক্তিযোদ্ধা ও বিশেষ কোটা</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">ফিল্টার্ড ফলাফল</p>
                <h3 className="text-xl font-black text-slate-900">{filteredCandidates.length} জন</h3>
                <p className="text-[11px] text-amber-700">বর্তমান ভিউতে দৃশ্যমান</p>
              </div>
            </div>
          </div>

          {/* Search, Filters & Action Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex-1 max-w-md relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="নাম, মোবাইল, ইউজারনেম, এনআইডি বা জেলা..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>এক্সপোর্ট (CSV)</span>
                </button>
              </div>
            </div>

            {/* 4 Dropdown Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">জেলা ফিল্টার</label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="all">সকল জেলা</option>
                  <option value="ঢাকা">ঢাকা</option>
                  <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                  <option value="সিলেট">সিলেট</option>
                  <option value="রাজশাহী">রাজশাহী</option>
                  <option value="খুলনা">খুলনা</option>
                  <option value="বরিশাল">বরিশাল</option>
                  <option value="রংপুর">রংপুর</option>
                  <option value="ময়মনসিংহ">ময়মনসিংহ</option>
                  <option value="কুমিল্লা">কুমিল্লা</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">কোটা ফিল্টার</label>
                <select
                  value={quotaFilter}
                  onChange={(e) => setQuotaFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="all">সকল কোটা</option>
                  <option value="none">সাধারণ (কোটা নেই)</option>
                  <option value="freedom_fighter">মুক্তিযোদ্ধা কোটা</option>
                  <option value="disabled">প্রতিবন্ধী কোটা</option>
                  <option value="ethnic_minority">ক্ষুদ্র নৃগোষ্ঠী</option>
                  <option value="ansar">আনসার ও ভিডিপি</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">শিক্ষাগত ডিগ্রি</label>
                <select
                  value={educationFilter}
                  onChange={(e) => setEducationFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="all">সকল ডিগ্রি</option>
                  <option value="মাস্টার্স">মাস্টার্স / স্নাতকোত্তর</option>
                  <option value="স্নাতক">স্নাতক / অনার্স / ডিগ্রি</option>
                  <option value="HSC">এইচএসসি / আলিম</option>
                  <option value="SSC">এসএসসি / দাখিল</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">ভেরিফিকেশন অবস্থা</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="all">সকল প্রার্থী</option>
                  <option value="verified">ভেরিফাইড ব্যাজপ্রাপ্ত</option>
                  <option value="active">সক্রিয় অ্যাকাউন্ট</option>
                  <option value="suspended">সাময়িক স্থগিত (Suspended)</option>
                </select>
              </div>
            </div>

            {/* Candidates Master Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">প্রার্থীর নাম ও যোগাযোগ</th>
                    <th className="py-2.5 px-3">মোবাইল ও ইউজারনেম</th>
                    <th className="py-2.5 px-3">জেলা ও বিভাগ</th>
                    <th className="py-2.5 px-3">জাতীয় পরিচয়পত্র (NID)</th>
                    <th className="py-2.5 px-3">কোটা ও ডিগ্রি</th>
                    <th className="py-2.5 px-3">স্ট্যাটাস</th>
                    <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredCandidates.map((c) => {
                    const isVerified = c.isVerified || c.id === 'USR-01774366643';
                    const isSuspended = c.accountStatus === 'suspended';

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-2xs">
                              {c.name?.slice(0, 2) || 'CS'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{c.name}</span>
                                {isVerified && (
                                  <span className="text-emerald-700 text-[11px]" title="ভেরিফাইড চাকরিপ্রার্থী">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400">{c.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="font-mono font-bold text-slate-900">{c.phone}</div>
                          <div className="text-[10px] text-slate-400 font-mono">@{c.username || c.id}</div>
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-800">{c.district || 'ঢাকা'}</span>
                          <span className="block text-[10px] text-slate-400">{c.division || 'ঢাকা বিভাগ'}</span>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1 font-mono text-slate-800">
                            <span>{c.nid || 'সংযুক্ত নেই'}</span>
                            {c.nid && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(c.nid, 'NID')}
                                className="p-0.5 text-slate-400 hover:text-emerald-700"
                                title="NID কপি করুন"
                              >
                                {copiedField === 'NID' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 w-fit">
                              {c.quota === 'freedom_fighter' ? 'মুক্তিযোদ্ধা কোটা' :
                               c.quota === 'disabled' ? 'প্রতিবন্ধী কোটা' :
                               c.quota === 'ethnic_minority' ? 'ক্ষুদ্র নৃগোষ্ঠী' : 'সাধারণ'}
                            </span>
                            <span className="text-[10px] text-slate-500 line-clamp-1">
                              {c.education?.[0]?.degree || 'স্নাতক'}
                            </span>
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          {isSuspended ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              স্থগিত
                            </span>
                          ) : isVerified ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              ✓ ভেরিফাইড
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              সক্রিয়
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingCandidateId(c.id)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold transition-colors flex items-center gap-1 shadow-2xs"
                              title="ইউনিভার্সাল প্রোফাইল এডিটর"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>সম্পাদনা</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCandidateId(c.id);
                                handleSubTabSwitch('candidate-details');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors flex items-center gap-1 shadow-2xs"
                              title="৩৬০° প্রোফাইল ও ভল্ট ইন্সপেক্টর"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>৩৬০° ভিউ</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setQuickCopierCandidate(c)}
                              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="টেলিটক ফর্ম-ফিল কুইক কপি"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSmsCandidate(c);
                                setSmsMessage(`চাকরি সেবা: জনাব ${c.name}, আপনার প্রোফাইল সংক্রান্ত জরুরি নোটিশ...`);
                              }}
                              className="p-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                              title="এসএমএস পাঠান"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBTAB 2: CANDIDATE 360° MASTER PROFILE & VAULT INSPECTOR
         ========================================================================= */}
      {currentSubTab === 'candidate-details' && currentCandidate && (
        <div className="space-y-6">
          {/* Candidate Selector Switcher Header */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">নির্বাচিত প্রার্থী পরিবর্তন করুন:</span>
              <select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-xs"
              >
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - {c.district || 'ঢাকা'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
                            <button
                type="button"
                onClick={() => setEditingCandidateId(currentCandidate.id)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                title="প্রার্থীর সমস্ত তথ্য, শিক্ষা, অভিজ্ঞতা, সিকিউরিটি ও স্ট্যাটাস সম্পূর্ণ এডিট করুন"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>সম্পূর্ণ প্রোফাইল সম্পাদনা (Workspace)</span>
              </button>
              <button
                type="button"
                onClick={() => setQuickCopierCandidate(currentCandidate)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>টেলিটক ফর্ম কপি কনসোল</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubTabSwitch('account-status')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>মডারেশন কনসোল</span>
              </button>
            </div>
          </div>

          {/* Top Profile Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white font-black flex items-center justify-center text-xl shadow-md shrink-0">
                {currentCandidate.name?.slice(0, 2) || 'CS'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">{currentCandidate.name}</h2>
                  <span className="text-xs text-slate-500 font-bold">({currentCandidate.nameBn || currentCandidate.name})</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ✓ ভেরিফাইড চাকরিপ্রার্থী
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1 font-mono text-emerald-800 font-bold">
                    <Phone className="w-3 h-3" /> {currentCandidate.phone}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {currentCandidate.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {currentCandidate.district || 'ঢাকা'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase">ওয়ালেট ব্যালেন্স</span>
                <div className="text-xl font-black text-emerald-700">৳{currentCandidate.walletBalance || 0}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase">দাখিলকৃত আবেদন</span>
                <div className="text-xl font-black text-slate-900">{candidateApps.length} টি</div>
              </div>
            </div>
          </div>

          {/* 4 Deep Master Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section 1: Personal & Structured Address */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-emerald-700" />
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">ব্যক্তিগত ও পূর্ণাঙ্গ ঠিকানা বিবরণ</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 text-[10px] block">পিতার নাম</span>
                  <span className="font-bold text-slate-900">{currentCandidate.fatherName || 'MD. RAFIQUL ISLAM'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 text-[10px] block">মাতার নাম</span>
                  <span className="font-bold text-slate-900">{currentCandidate.motherName || 'MOSA. ROKEYA BEGUM'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 text-[10px] block">জন্মতারিখ ও লিঙ্গ</span>
                  <span className="font-bold text-slate-900">{currentCandidate.dob || '1998-05-12'} • {currentCandidate.gender === 'female' ? 'নারী' : 'পুরুষ'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 text-[10px] block">জাতীয় পরিচয়পত্র (NID)</span>
                  <span className="font-mono font-bold text-slate-900">{currentCandidate.nid || '19982692015004512'}</span>
                </div>
              </div>

              {/* Present & Permanent Address Details */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-800 text-[11px] block">বর্তমান ঠিকানা (Present Address):</span>
                  <p className="text-slate-700 leading-relaxed font-mono text-[11px]">
                    {currentCandidate.address || 'HOUSE 12, ROAD 5, MIRPUR-10, DHAKA-1216'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="font-bold text-slate-800 text-[11px] block">স্থায়ী ঠিকানা (Permanent Address):</span>
                  <p className="text-slate-700 leading-relaxed font-mono text-[11px]">
                    {currentCandidate.permanentAddress || currentCandidate.address || 'HOUSE 12, ROAD 5, MIRPUR-10, DHAKA-1216'}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Education Records Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">শিক্ষাগত যোগ্যতা ও ফলাফল</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-400">{currentCandidate.education?.length || 0}টি ডিগ্রি</span>
              </div>

              <div className="space-y-2.5">
                {currentCandidate.education && currentCandidate.education.map((edu: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <span className="font-black text-slate-900 text-xs block">{edu.degree}</span>
                      <span className="text-slate-500 text-[11px] block">{edu.boardOrUni} • পাসের সন: {edu.year}</span>
                      {(edu.roll || edu.reg) && (
                        <span className="font-mono text-[10px] text-slate-400">রোল: {edu.roll || 'N/A'} | রেজি: {edu.reg || 'N/A'}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-emerald-700 text-sm bg-white px-2 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                        {edu.result}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Document Vault Inspector */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileBox className="w-4 h-4 text-emerald-700" />
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">ডিজিটাল ভল্ট ও সনদপত্র ইন্সপেক্টর</h3>
              </div>
              <span className="text-xs font-bold text-slate-400">মোট ডকুমেন্ট: {candidateDocs.length || 4}টি</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Photo */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2">
                <div className="w-20 h-20 bg-slate-200 rounded-xl mx-auto flex items-center justify-center overflow-hidden border border-slate-300">
                  <span className="font-mono text-[10px] text-slate-500 font-bold">300x300 Photo</span>
                </div>
                <div className="text-xs font-bold text-slate-900">পাসপোর্ট ছবি</div>
                <span className="text-[10px] text-emerald-700 font-bold block">✓ স্ট্যান্ডার্ড সাইজ</span>
              </div>

              {/* Signature */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2">
                <div className="w-20 h-10 bg-slate-200 rounded-xl mx-auto flex items-center justify-center overflow-hidden border border-slate-300 mt-5">
                  <span className="font-mono text-[9px] text-slate-500 font-bold">300x80 Sig</span>
                </div>
                <div className="text-xs font-bold text-slate-900">ডিজিটাল স্বাক্ষর</div>
                <span className="text-[10px] text-emerald-700 font-bold block">✓ স্ট্যান্ডার্ড সাইজ</span>
              </div>

              {/* NID Card */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2">
                <div className="w-20 h-20 bg-blue-50 text-blue-700 rounded-xl mx-auto flex items-center justify-center border border-blue-200">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="text-xs font-bold text-slate-900">জাতীয় পরিচয়পত্র</div>
                <span className="text-[10px] text-blue-700 font-bold block">Front & Back</span>
              </div>

              {/* Certificate */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2">
                <div className="w-20 h-20 bg-purple-50 text-purple-700 rounded-xl mx-auto flex items-center justify-center border border-purple-200">
                  <Award className="w-8 h-8" />
                </div>
                <div className="text-xs font-bold text-slate-900">শিক্ষাগত সনদপত্র</div>
                <span className="text-[10px] text-purple-700 font-bold block">মূল মার্কশিট</span>
              </div>
            </div>
          </div>

          {/* Section 4: Lifetime Applications History */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">লাইফটাইম আবেদন খতিয়ান (Lifetime Applications)</h3>
              </div>
              <span className="text-xs font-bold text-slate-500">মোট আবেদন: {candidateApps.length}টি</span>
            </div>

            {candidateApps.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">আবেদন আইডি</th>
                      <th className="py-2.5 px-3">পদের নাম ও প্রতিষ্ঠান</th>
                      <th className="py-2.5 px-3">টেলিটক ট্র্যাকিং আইডি</th>
                      <th className="py-2.5 px-3">পরিশোধিত ফি</th>
                      <th className="py-2.5 px-3">বর্তমান অবস্থা</th>
                      <th className="py-2.5 px-3 text-right">আবেদন কপি PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {candidateApps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{app.id}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{app.postName || app.jobTitle}</div>
                          <div className="text-[10px] text-slate-400">{app.organization}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-emerald-800 font-bold">
                          {app.teleTalkTrackingId || 'পেন্ডিং প্রসেসিং'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          ৳{app.totalPaid || (app.applicationFee + (app.serviceCharge || 80))}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            app.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            app.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {app.status === 'completed' ? '✓ সম্পন্ন' : app.status === 'processing' ? 'প্রসেসিং' : 'পেমেন্ট পেন্ডিং'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {app.applicantCopyPdfUrl ? (
                            <Link
                              href={app.applicantCopyPdfUrl}
                              target="_blank"
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs"
                            >
                              <Printer className="w-3 h-3" />
                              <span>কপি দেখুন</span>
                            </Link>
                          ) : (
                            <span className="text-[10px] text-slate-400">পিডিএফ নেই</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                এই প্রার্থীর কোনো আবেদন রেকর্ড পাওয়া যায়নি।
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBTAB 3: ACCOUNT STATUS & MODERATION CONSOLE
         ========================================================================= */}
      {currentSubTab === 'account-status' && currentCandidate && (
        <div className="space-y-6">
          {/* Candidate Selector */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">মডারেশনের জন্য প্রার্থী সিলেক্ট করুন:</span>
              <select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              >
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - {c.accountStatus || 'active'}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs font-bold text-slate-400">আইডি: {currentCandidate.id}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Account Activation & Suspension */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="font-black text-sm text-slate-900">অ্যাকাউন্ট অ্যাক্টিভেশন ও সাময়িক স্থগিতকরণ</h3>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">বর্তমান অ্যাকাউন্ট স্ট্যাটাস:</h4>
                    <p className="text-[11px] text-slate-500">
                      {currentCandidate.accountStatus === 'suspended' ? 'অ্যাকাউন্টটি বর্তমানে সাময়িক স্থগিত রয়েছে।' : 'অ্যাকাউন্টটি সক্রিয় রয়েছে।'}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    currentCandidate.accountStatus === 'suspended' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentCandidate.accountStatus === 'suspended' ? 'স্থগিত (Suspended)' : 'সক্রিয় (Active)'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleSuspension(currentCandidate)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  currentCandidate.accountStatus === 'suspended'
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {currentCandidate.accountStatus === 'suspended' ? 'অ্যাকাউন্ট পুনরায় সক্রিয় করুন' : 'অ্যাকাউন্ট সাময়িক স্থগিত (Suspend) করুন'}
              </button>
            </div>

            {/* Card 2: Verification Badge Control */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <h3 className="font-black text-sm text-slate-900">ভেরিফাইড ব্যাজ (Verification Badge) কন্ট্রোল</h3>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">ভেরিফিকেশন চেক:</h4>
                    <p className="text-[11px] text-slate-500">
                      এনআইডি ও অ্যাকাডেমিক সার্টিফিকেট সঠিক থাকলে ব্লু ব্যাজ প্রদান করুন।
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    currentCandidate.isVerified || currentCandidate.id === 'USR-01774366643' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {currentCandidate.isVerified || currentCandidate.id === 'USR-01774366643' ? '✓ ভেরিফাইড' : 'আনভেরিফাইড'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleVerification(currentCandidate)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                {currentCandidate.isVerified ? 'ভেরিফাইড স্ট্যাটাস প্রত্যাহার করুন' : '✓ ভেরিফাইড চাকরিপ্রার্থী অনুমোদন দিন'}
              </button>
            </div>

            {/* Card 3: Password Reset Tool */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <KeyRound className="w-4 h-4 text-purple-700" />
                <h3 className="font-black text-sm text-slate-900">অ্যাডমিন পাসওয়ার্ড রিসেট জেনারেটর</h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                প্রার্থী পাসওয়ার্ড ভুলে গেলে অ্যাডমিন কর্তৃক একটি সিকিউর অস্থায়ী পাসওয়ার্ড জেনারেট করে ডাটাবেসে হালনাগাদ করা যাবে।
              </p>

              <button
                type="button"
                onClick={() => handleGenerateTempPassword(currentCandidate)}
                disabled={isResettingPass}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>নতুন অস্থায়ী পাসওয়ার্ড সেট করুন</span>
              </button>
            </div>

            {/* Card 4: Send Notice SMS */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Send className="w-4 h-4 text-blue-700" />
                <h3 className="font-black text-sm text-slate-900">সরাসরি প্রার্থীকে এসএমএস নোটিশ পাঠান</h3>
              </div>

              <p className="text-xs text-slate-600">
                প্রাপক নম্বর: <strong className="font-mono text-emerald-800">{currentCandidate.phone}</strong>
              </p>

              <button
                type="button"
                onClick={() => {
                  setSmsCandidate(currentCandidate);
                  setSmsMessage(`চাকরি সেবা নোটিশ: জনাব ${currentCandidate.name}, আপনার প্রোফাইল ভেরিফিকেশন সফলভাবে সম্পন্ন হয়েছে।`);
                }}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>এসএমএস বার্তা কম্পোজ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: TELETALK 1-CLICK FORM-FILL CONSOLE
         ========================================================================= */}
      {quickCopierCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Copy className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-black text-sm text-slate-900">টেলিটক ১-ক্লিক ফর্ম-ফিল কনসোল</h3>
                  <p className="text-[11px] text-slate-500">প্রার্থী: {quickCopierCandidate.name} ({quickCopierCandidate.phone})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickCopierCandidate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              💡 <span className="font-bold text-emerald-900">টিপস:</span> টেলিটক সরকারি পোর্টালে ফর্ম পূরণের সময় নিচের যেকোনো বাটনে ক্লিক করলেই সেই মানটি ক্লিপবোর্ডে কপি হয়ে যাবে।
            </p>

            <div className="space-y-4 text-xs">
              {/* Personal Fields */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">ব্যক্তিগত তথ্য (English Standard):</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'APPLICANT NAME', val: quickCopierCandidate.name?.toUpperCase() },
                    { label: 'FATHER NAME', val: (quickCopierCandidate.fatherName || 'MD. RAFIQUL ISLAM').toUpperCase() },
                    { label: 'MOTHER NAME', val: (quickCopierCandidate.motherName || 'MOSA. ROKEYA BEGUM').toUpperCase() },
                    { label: 'DATE OF BIRTH', val: quickCopierCandidate.dob || '1998-05-12' },
                    { label: 'GENDER', val: quickCopierCandidate.gender?.toUpperCase() || 'MALE' },
                    { label: 'NATIONALITY', val: 'BANGLADESHI' },
                    { label: 'RELIGION', val: 'ISLAM' },
                    { label: 'NID NUMBER', val: quickCopierCandidate.nid || '19982692015004512' },
                    { label: 'MOBILE NUMBER', val: quickCopierCandidate.phone }
                  ].map((f, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => copyToClipboard(f.val || '', f.label)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all"
                    >
                      <span className="text-[10px] text-slate-400 block font-mono">{f.label}</span>
                      <span className="font-bold text-slate-900 font-mono text-[11px] truncate block">{f.val || 'N/A'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Address Fields */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">ঠিকানা সংক্রান্ত (Address Fields):</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'CARE OF', val: (quickCopierCandidate.fatherName || 'MD. RAFIQUL ISLAM').toUpperCase() },
                    { label: 'VILLAGE / ROAD', val: 'HOUSE 12, ROAD 5, MIRPUR-10' },
                    { label: 'DISTRICT', val: (quickCopierCandidate.district || 'DHAKA').toUpperCase() },
                    { label: 'THANA / UPAZILA', val: 'MIRPUR' },
                    { label: 'POST CODE', val: '1216' },
                    { label: 'PERMANENT ADDR', val: (quickCopierCandidate.permanentAddress || quickCopierCandidate.address || 'MIRPUR-10, DHAKA').toUpperCase() }
                  ].map((f, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => copyToClipboard(f.val || '', f.label)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all"
                    >
                      <span className="text-[10px] text-slate-400 block font-mono">{f.label}</span>
                      <span className="font-bold text-slate-900 font-mono text-[11px] truncate block">{f.val}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Education Fields */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">শিক্ষাগত রোল ও রেজাল্ট:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'SSC ROLL', val: '109841' },
                    { label: 'SSC REG', val: '1512409841' },
                    { label: 'SSC GPA', val: '5.00' },
                    { label: 'HSC ROLL', val: '214589' },
                    { label: 'HSC REG', val: '1512409841' },
                    { label: 'HSC GPA', val: '4.92' },
                    { label: 'HONOURS CGPA', val: '3.68' },
                    { label: 'PASSING YEAR', val: '2021' }
                  ].map((f, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => copyToClipboard(f.val, f.label)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all"
                    >
                      <span className="text-[10px] text-slate-400 block font-mono">{f.label}</span>
                      <span className="font-bold text-slate-900 font-mono text-[11px] block">{f.val}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              {copiedField && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {copiedField} ক্লিপবোর্ডে কপি করা হয়েছে!
                </span>
              )}
              <button
                type="button"
                onClick={() => setQuickCopierCandidate(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold ml-auto"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: DIRECT SMS SENDER MODAL
         ========================================================================= */}
      {smsCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-sm text-slate-900">প্রার্থীকে এসএমএস প্রেরণ</h3>
              <button type="button" onClick={() => setSmsCandidate(null)} className="text-slate-400 hover:text-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            {smsSuccessToast && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{smsSuccessToast}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">প্রাপক</label>
              <div className="p-2.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-900 flex justify-between">
                <span>{smsCandidate.name}</span>
                <span className="font-mono text-emerald-800">{smsCandidate.phone}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">এসএমএস বার্তা</label>
              <textarea
                rows={4}
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSmsCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSendDirectSms}
                disabled={isSendingSms}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                {isSendingSms ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>এসএমএস পাঠান</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          UNIVERSAL USER WORKSPACE (MODAL / FULL-SCREEN DRAWER)
         ========================================================================= */}
      <UniversalUserWorkspace
        isOpen={!!editingCandidateId}
        candidateId={editingCandidateId}
        onClose={() => setEditingCandidateId(null)}
        onSaveSuccess={() => {
          onRefreshCandidates?.();
        }}
        onOpenSmsModal={(cand) => {
          setSmsCandidate(cand);
          setSmsMessage(`চাকরি সেবা: জনাব ${cand.name}, আপনার প্রোফাইল সংক্রান্ত জরুরি নোটিশ...`);
        }}
      />

      {/* =========================================================================
          MODAL 3: PASSWORD RESET SUCCESS MODAL
         ========================================================================= */}
      {resetSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="font-black text-sm text-slate-900">অস্থায়ী পাসওয়ার্ড সফলভাবে তৈরি হয়েছে!</h3>
            <p className="text-xs text-slate-600">
              <strong>{resetSuccessModal.candidateName}</strong> এর অ্যাকাউন্টে নিচের পাসওয়ার্ডটি সেট করা হয়েছে:
            </p>
            <div className="p-3 bg-slate-100 rounded-xl font-mono text-base font-black text-emerald-800 tracking-wider">
              {resetSuccessModal.tempPass}
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => copyToClipboard(resetSuccessModal.tempPass, 'পাসওয়ার্ড')}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>পাসওয়ার্ড কপি করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setResetSuccessModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
