'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Sliders,
  Heart,
  FileText,
  Bookmark,
  Bell,
  Shield,
  FileEdit,
  History,
  Save,
  Check,
  X,
  AlertTriangle,
  Trash2,
  Plus,
  ExternalLink,
  Eye,
  RefreshCw,
  Copy,
  Sparkles,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2,
  Lock,
  KeyRound,
  Send,
  Building,
  Layers,
  ChevronRight,
  ShieldAlert,
  AlertCircle,
  CreditCard,
  LogIn
} from 'lucide-react';
import { CandidateProfile, EducationRecord, ExperienceRecord, CandidateDocument } from '@/lib/types';
import { BD_DIVISIONS_EN } from '@/lib/constants';

const getAdminHeaders = (): HeadersInit => {
  const pin = typeof window !== 'undefined' ? (localStorage.getItem('cs_admin_pin') || '1234') : '1234';
  return {
    'Content-Type': 'application/json',
    'x-admin-secret': pin
  };
};

export interface UniversalUserWorkspaceProps {
  candidateId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (updatedCandidate: any) => void;
  onOpenSmsModal?: (candidate: any) => void;
}

type UserWorkspaceTab =
  | 'overview'
  | 'personal'
  | 'professional'
  | 'education'
  | 'experience'
  | 'skills'
  | 'preferences'
  | 'documents'
  | 'applications'
  | 'wallet'
  | 'saved_jobs'
  | 'notifications'
  | 'security'
  | 'admin_notes'
  | 'audit_log';

export default function UniversalUserWorkspace({
  candidateId,
  isOpen,
  onClose,
  onSaveSuccess,
  onOpenSmsModal
}: UniversalUserWorkspaceProps) {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<UserWorkspaceTab>('overview');

  // Candidate Data State
  const [formData, setFormData] = useState<Partial<CandidateProfile>>({});
  const [initialData, setInitialData] = useState<Partial<CandidateProfile>>({});
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [adjAmount, setAdjAmount] = useState<string>('');
  const [adjType, setAdjType] = useState<'credit' | 'debit'>('credit');
  const [adjReason, setAdjReason] = useState<string>('');
  const [isAdjustingBalance, setIsAdjustingBalance] = useState<boolean>(false);
  
  // UI Loading & Save States
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sub-forms & Modals
  const [editingEduIndex, setEditingEduIndex] = useState<number | null>(null);
  const [showEduModal, setShowEduModal] = useState(false);
  const [tempEdu, setTempEdu] = useState<Partial<EducationRecord>>({});

  const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null);
  const [showExpModal, setShowExpModal] = useState(false);
  const [tempExp, setTempExp] = useState<Partial<ExperienceRecord>>({});

  // Temporary skill & language inputs
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  // Admin note input
  const [newAdminNote, setNewAdminNote] = useState('');

  // Password reset modal state
  const [tempPasswordGenerated, setTempPasswordGenerated] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Document preview modal
  const [previewDocumentUrl, setPreviewDocumentUrl] = useState<string | null>(null);

  // Load candidate full details on open
  useEffect(() => {
    if (isOpen && candidateId) {
      loadCandidateData(candidateId);
      setActiveTab('overview');
      setSaveError(null);
      setSaveSuccessToast(null);
      setTempPasswordGenerated(null);
    }
  }, [isOpen, candidateId]);

  const loadCandidateData = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/candidates/${id}`, {
        headers: getAdminHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success && data.candidate) {
        setFormData(data.candidate);
        setInitialData(data.candidate);
        setDocuments(data.documents || []);
        setApplications(data.applications || []);
        setSavedJobs(data.savedJobs || []);
        setNotifications(data.notifications || []);
        setTransactions(data.transactions || []);
      } else {
        setSaveError(data.error || 'প্রার্থীর তথ্য লোড করা যায়নি');
      }
    } catch (err: any) {
      setSaveError(err.message || 'নেটওয়ার্ক এরর');
    } finally {
      setLoading(false);
    }
  };

  // Track dirty changes
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  // Window beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const updateField = (field: keyof CandidateProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Safe Close
  const handleSafeClose = () => {
    if (isDirty) {
      if (confirm('আপনার কিছু পরিবর্তন এখনো সংরক্ষিত হয়নি। আপনি কি নিশ্চিত যে উইন্ডো বন্ধ করতে চান?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Save Candidate Changes
  const handleSave = async (extraPayload?: any, customSuccessMsg?: string) => {
    if (!candidateId) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccessToast(null);

    try {
      const payload = {
        ...formData,
        ...(extraPayload || {})
      };

      const res = await fetch(`/api/admin/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'তথ্য সংরক্ষণ করা সম্ভব হয়নি।');
      }

      setFormData(data.candidate);
      setInitialData(data.candidate);
      setSaveSuccessToast(customSuccessMsg || 'প্রার্থীর সকল তথ্য সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!');
      onSaveSuccess(data.candidate);
      setTimeout(() => setSaveSuccessToast(null), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'সার্ভার এরর ঘটেছে।');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Save Admin Note
  const handleAddAdminNote = async () => {
    if (!newAdminNote.trim()) return;
    await handleSave({ adminNote: newAdminNote.trim() }, 'প্রশাসনিক নোট সফলভাবে যুক্ত হয়েছে!');
    setNewAdminNote('');
  };

  // Handle Secure Password Reset
  const handleGeneratePassword = async () => {
    const tempPass = 'CS' + Math.floor(100000 + Math.random() * 900000);
    if (!confirm(`আপনি কি নিশ্চিত যে "${formData.name}" এর জন্য একটি নতুন রেন্ডম পাসওয়ার্ড (${tempPass}) তৈরি ও রিসেট করতে চান?`)) return;

    setIsResettingPassword(true);
    try {
      const res = await fetch(`/api/admin/candidates/${candidateId}`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          newPassword: tempPass,
          reason: 'অ্যাডমিন কর্তৃক সিকিউর টেম্পোরারি পাসওয়ার্ড রিসেট'
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setTempPasswordGenerated(tempPass);
      setSaveSuccessToast('পাসওয়ার্ড সফলভাবে রিসেট ও এনক্রিপ্ট করা হয়েছে!');
    } catch (err: any) {
      alert('পাসওয়ার্ড রিসেট ব্যর্থ: ' + err.message);
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Handle 1-Click Candidate Impersonation (Login as Candidate)
  const [isImpersonating, setIsImpersonating] = useState(false);
  const handleImpersonate = async () => {
    if (!candidateId) return;
    setIsImpersonating(true);
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ candidateId })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ইমপারসোনেশন ব্যর্থ হয়েছে');
      }
      window.location.href = data.redirectUrl || '/dashboard';
    } catch (err: any) {
      alert(err.message || 'ইমপারসোনেশন ব্যর্থ হয়েছে');
      setIsImpersonating(false);
    }
  };

  // Profile completion calculation
  const profileScore = useMemo(() => {
    let score = 20; // base registered
    if (formData.name && formData.phone) score += 20;
    if (formData.nid) score += 15;
    if (formData.education && formData.education.length > 0) score += 20;
    if (formData.district) score += 10;
    if (formData.photoUrl) score += 10;
    if (formData.isVerified) score += 5;
    return Math.min(score, 100);
  }, [formData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-7xl h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">

        {/* ============================================================== */}
        {/* 1. TOP HEADER & CANDIDATE IDENTITY BAR */}
        {/* ============================================================== */}
        <header className="px-6 py-4 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center overflow-hidden shrink-0">
              {formData.photoUrl ? (
                <img src={formData.photoUrl} alt={formData.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-emerald-400" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold bg-slate-800 text-emerald-400 px-2.5 py-0.5 rounded-md border border-slate-700">
                  ID: {formData.id || candidateId}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  formData.accountStatus === 'active' || !formData.accountStatus ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  formData.accountStatus === 'suspended' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {(formData.accountStatus || 'ACTIVE').toUpperCase()}
                </span>
                {formData.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-700/80">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ভেরিফাইড
                  </span>
                ) : (
                  <span className="text-[11px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                    অযাচাইকৃত
                  </span>
                )}
                {isDirty && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/80 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    অসংরক্ষিত পরিবর্তন
                  </span>
                )}
              </div>
              <h2 className="text-base font-black text-slate-100 truncate mt-1">
                {formData.name || 'প্রার্থীর নাম'} {formData.nameBn ? `(${formData.nameBn})` : ''}
              </h2>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* 1-Click Candidate Impersonation */}
            <button
              type="button"
              onClick={handleImpersonate}
              disabled={isImpersonating}
              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="প্রার্থীর ড্যাশবোর্ডে সরাসরি লগইন করুন ও দেখুন"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isImpersonating ? 'প্রবেশ হচ্ছে...' : 'প্রার্থী মোড'}</span>
            </button>

            {/* Direct SMS Modal Trigger */}
            {onOpenSmsModal && (
              <button
                type="button"
                onClick={() => onOpenSmsModal(formData)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
                title="প্রার্থীকে সরাসরি এসএমএস পাঠান"
              >
                <Send className="w-3.5 h-3.5 text-blue-400" />
                <span>এসএমএস</span>
              </button>
            )}

            {/* Save Button */}
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-950/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleSafeClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="উইন্ডো বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Save Notifications */}
        {saveSuccessToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs font-bold text-emerald-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccessToast}</span>
            </div>
            <button onClick={() => setSaveSuccessToast(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {saveError && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center justify-between text-xs font-bold text-rose-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{saveError}</span>
            </div>
            <button onClick={() => setSaveError(null)} className="text-rose-600 hover:text-rose-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. TAB NAVIGATION BAR (13 ORGANIZED WORKSPACE TABS) */}
        {/* ============================================================== */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none text-xs">
          {[
            { id: 'overview', label: 'সারসংক্ষেপ', icon: LayoutDashboard },
            { id: 'personal', label: 'ব্যক্তিগত তথ্য', icon: User },
            { id: 'professional', label: 'পেশাগত তথ্য', icon: Briefcase },
            { id: 'education', label: 'শিক্ষাগত যোগ্যতা', icon: GraduationCap, badge: (formData.education || []).length },
            { id: 'experience', label: 'চাকরির অভিজ্ঞতা', icon: Award, badge: (formData.experiences || []).length },
            { id: 'skills', label: 'দক্ষতা ও ভাষা', icon: Sliders },
            { id: 'preferences', label: 'ক্যারিয়ার পছন্দ', icon: Heart },
            { id: 'documents', label: 'সার্টিফিকেট ও ফাইল', icon: FileText, badge: documents.length },
            { id: 'applications', label: 'চাকরির আবেদনসমূহ', icon: Briefcase, badge: applications.length },
            { id: 'wallet', label: 'ওয়ালেট ও লেনদেন', icon: CreditCard, badge: transactions.length },
            { id: 'saved_jobs', label: 'সংরক্ষিত চাকরি', icon: Bookmark, badge: savedJobs.length },
            { id: 'notifications', label: 'নোটিফিকেশন', icon: Bell, badge: notifications.length },
            { id: 'security', label: 'অ্যাকাউন্ট সিকিউরিটি', icon: Shield },
            { id: 'admin_notes', label: 'গোপন নোট', icon: FileEdit, badge: (formData.adminNotes || []).length },
            { id: 'audit_log', label: 'অডিট হিস্ট্রি', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as UserWorkspaceTab)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* 3. SCROLLABLE TAB CONTENT AREA */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50/50 space-y-6">

          {/* ------------------------------------------------------------ */}
          {/* TAB 1: OVERVIEW */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Profile Completion Bar */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>প্রোফাইল পূর্ণাঙ্গতা স্কোর (Profile Completion Meter)</span>
                  </span>
                  <span className="text-emerald-700 font-black">{profileScore}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${profileScore}%` }}
                  ></div>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">শিক্ষাগত ডিগ্রি</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{(formData.education || []).length} টি</div>
                  <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">সর্বোচ্চ: {(formData.education || [])[0]?.level || 'অনির্ধারিত'}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">চাকরির অভিজ্ঞতা</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{(formData.experiences || []).length} টি</div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">পদবী: {(formData.experiences || [])[0]?.designation || 'ফ্রেশার'}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">আপলোডকৃত ডকুমেন্ট</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{documents.length} টি</div>
                  <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">সার্টিফিকেট ও এনআইডি</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">সংরক্ষিত সার্কুলার</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{savedJobs.length} টি</div>
                  <span className="text-[11px] text-purple-600 font-semibold mt-0.5 block">আবেদন করেছেন: {applications.length} টি</span>
                </div>
              </div>

              {/* Contact & Personal Highlights */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>প্রার্থীর মৌলিক পরিচিতি (Candidate Snapshot)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">ফোন নম্বর</span>
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">{formData.phone || 'দেওয়া হয়নি'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">ইমেইল অ্যাড্রেস</span>
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block truncate">{formData.email || 'দেওয়া হয়নি'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">নিজ জেলা ও বিভাগ</span>
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">{formData.district || 'অনির্ধারিত'} ({formData.division || 'বাংলাদেশ'})</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">জাতীয় পরিচয়পত্র (NID)</span>
                    <span className="text-slate-900 font-mono font-bold text-xs mt-0.5 block">{formData.nid || 'তথ্য নেই'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">জন্ম তারিখ ও লিঙ্গ</span>
                    <span className="text-slate-900 font-bold text-xs mt-0.5 block">{formData.dob || 'অনির্ধারিত'} • {formData.gender === 'female' ? 'নারী' : 'পুরুষ'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">বিশেষ কোটা</span>
                    <span className="text-emerald-800 font-bold text-xs mt-0.5 block">{formData.quota || 'কোনো কোটা নেই'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-white">প্রোফাইল সংশোধন বা ডকুমেন্ট যাচাই করবেন?</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    ট্যাবগুলো থেকে নাম, ফোন, শিক্ষা বা সার্টিফিকেট সরাসরি সম্পাদনা ও ভেরিফাই করুন।
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('personal')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    তথ্য এডিট করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('education')}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition-all"
                  >
                    শিক্ষা ম্যানেজ করুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 2: PERSONAL INFORMATION */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'personal' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>ব্যক্তিগত ও পরিচিতিমূলক তথ্য (Personal Details)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">পূর্ণ নাম (ইংরেজি) *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="যেমন: MD. RAHIM UDDIN"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">পূর্ণ নাম (বাংলায়)</label>
                    <input
                      type="text"
                      value={formData.nameBn || ''}
                      onChange={(e) => updateField('nameBn', e.target.value)}
                      placeholder="যেমন: মোঃ রহিম উদ্দিন"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">পিতার নাম (Father's Name)</label>
                    <input
                      type="text"
                      value={formData.fatherName || ''}
                      onChange={(e) => updateField('fatherName', e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">মাতার নাম (Mother's Name)</label>
                    <input
                      type="text"
                      value={formData.motherName || ''}
                      onChange={(e) => updateField('motherName', e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">মোবাইল নম্বর (Phone) *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="01712345678"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ইমেইল অ্যাড্রেস (Email) *</label>
                    <input
                      type="email"
                      required
                      value={formData.email || ''}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">জাতীয় পরিচয়পত্র (NID)</label>
                    <input
                      type="text"
                      value={formData.nid || ''}
                      onChange={(e) => updateField('nid', e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">জন্ম তারিখ (DOB)</label>
                    <input
                      type="date"
                      value={formData.dob || ''}
                      onChange={(e) => updateField('dob', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">লিঙ্গ (Gender)</label>
                    <select
                      value={formData.gender || 'male'}
                      onChange={(e: any) => updateField('gender', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="male">পুরুষ (Male)</option>
                      <option value="female">নারী (Female)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">বৈবাহিক অবস্থা</label>
                    <select
                      value={formData.maritalStatus || 'single'}
                      onChange={(e: any) => updateField('maritalStatus', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="single">অবিবাহিত (Single)</option>
                      <option value="married">বিবাহিত (Married)</option>
                      <option value="other">অন্যান্য</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">নিজ জেলা (District)</label>
                    <input
                      type="text"
                      value={formData.district || ''}
                      onChange={(e) => updateField('district', e.target.value)}
                      placeholder="যেমন: ঢাকা"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">বিভাগ (Division)</label>
                    <select
                      value={formData.division || 'Dhaka'}
                      onChange={(e) => updateField('division', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    >
                      {BD_DIVISIONS_EN.map(div => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">বিশেষ কোটা (Quota)</label>
                    <select
                      value={formData.quota || 'none'}
                      onChange={(e: any) => updateField('quota', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none font-bold"
                    >
                      <option value="none">কোনো কোটা নেই (General)</option>
                      <option value="freedom_fighter">মুক্তিযোদ্ধা সন্তান / পোষ্য</option>
                      <option value="disabled">প্রতিবন্ধী কোটা</option>
                      <option value="ethnic_minority">ক্ষুদ্র নৃগোষ্ঠী কোটা</option>
                      <option value="ansar">আনসার ও ভিডিপি কোটা</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">বর্তমান ঠিকানা (Present Address)</label>
                    <textarea
                      rows={2}
                      value={formData.address || ''}
                      onChange={(e) => updateField('address', e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">স্থায়ী ঠিকানা (Permanent Address)</label>
                    <textarea
                      rows={2}
                      value={formData.permanentAddress || ''}
                      onChange={(e) => updateField('permanentAddress', e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 3: PROFESSIONAL PROFILE */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'professional' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>পেশাগত পরিচিতি ও উদ্দেশ্য (Professional Profile)</span>
                </h3>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ক্যারিয়ার অবজেক্টিভ (Career Objective)</label>
                  <textarea
                    rows={3}
                    value={formData.careerObjective || ''}
                    onChange={(e) => updateField('careerObjective', e.target.value)}
                    placeholder="প্রার্থীর ভবিষ্যৎ পেশাগত লক্ষ্য ও উদ্দেশ্য..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">পেশাগত সামারি (Professional Summary)</label>
                  <textarea
                    rows={3}
                    value={formData.professionalSummary || ''}
                    onChange={(e) => updateField('professionalSummary', e.target.value)}
                    placeholder="অভিজ্ঞতা ও দক্ষতার সারসংক্ষেপ..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">বর্তমান পদবী (Current Position)</label>
                    <input
                      type="text"
                      value={formData.currentPosition || ''}
                      onChange={(e) => updateField('currentPosition', e.target.value)}
                      placeholder="যেমন: এক্সিকিউটিভ"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">বর্তমান প্রতিষ্ঠান (Current Org)</label>
                    <input
                      type="text"
                      value={formData.currentOrganization || ''}
                      onChange={(e) => updateField('currentOrganization', e.target.value)}
                      placeholder="যেমন: গ্রামীণফোন"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">প্রত্যাশিত বেতন (Expected Salary)</label>
                    <input
                      type="text"
                      value={formData.expectedSalary || ''}
                      onChange={(e) => updateField('expectedSalary', e.target.value)}
                      placeholder="যেমন: ৩৫,০০০ - ৪৫,০০০ টাকা"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 4: EDUCATION MANAGEMENT */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'education' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <span>শিক্ষাগত যোগ্যতার রেকর্ডসমূহ (Education Records)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      প্রার্থীর সকল একাডেমিক রেকর্ড সংশোধন, নতুন ডিগ্রি সংযোজন বা গ্রেড পরিবর্তন করুন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEduIndex(null);
                      setTempEdu({
                        level: 'Honours',
                        degree: 'B.Sc / BBA / BA',
                        boardOrUni: 'ঢাকা বিশ্ববিদ্যালয়',
                        resultType: 'CGPA',
                        result: '3.50',
                        year: '2024',
                        verificationStatus: 'VERIFIED'
                      });
                      setShowEduModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন শিক্ষা যোগ করুন</span>
                  </button>
                </div>

                {/* Education List */}
                {(formData.education && formData.education.length > 0) ? (
                  <div className="space-y-3">
                    {formData.education.map((edu, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{edu.degree || edu.level}</span>
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                              {edu.level}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              edu.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {edu.verificationStatus || 'PENDING'}
                            </span>
                          </div>
                          <div className="text-slate-600">
                            <strong>বোর্ড/বিশ্ববিদ্যালয়:</strong> {edu.boardOrUni} | <strong>পাসের সন:</strong> {edu.year || 'চলমান'}
                          </div>
                          <div className="text-slate-600">
                            <strong>ফলাফল:</strong> {edu.result || 'অনির্ধারিত'} ({edu.resultType || 'CGPA'}) {edu.roll ? `| রোল: ${edu.roll}` : ''} {edu.reg ? `| রেজি: ${edu.reg}` : ''}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEduIndex(idx);
                              setTempEdu({ ...edu });
                              setShowEduModal(true);
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-200 font-bold transition-colors"
                          >
                            এডিট
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('আপনি কি এই শিক্ষাগত রেকর্ডটি মুছে ফেলতে চান?')) {
                                const updated = formData.education!.filter((_, i) => i !== idx);
                                updateField('education', updated);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                    কোনো শিক্ষাগত তথ্য এন্ট্রি নেই। উপরে "নতুন শিক্ষা যোগ করুন" বাটনে ক্লিক করুন।
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 5: WORK EXPERIENCE */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'experience' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>চাকরির অভিজ্ঞতা (Work Experience Records)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      প্রার্থীর পূর্ববর্তী ও বর্তমান চাকরির রেকর্ড ও পদবী পরিচালনা করুন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExpIndex(null);
                      setTempExp({
                        id: 'exp-' + Date.now().toString().slice(-4),
                        designation: 'অফিসার',
                        organization: 'কোম্পানির নাম',
                        startDate: '2023-01-01',
                        endDate: '2025-01-01',
                        isCurrent: false
                      });
                      setShowExpModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>নতুন অভিজ্ঞতা যোগ করুন</span>
                  </button>
                </div>

                {(formData.experiences && formData.experiences.length > 0) ? (
                  <div className="space-y-3">
                    {formData.experiences.map((exp, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <span>{exp.designation}</span>
                            {exp.isCurrent && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">বর্তমান চাকরি</span>
                            )}
                          </div>
                          <div className="text-slate-600 mt-0.5">
                            <strong>প্রতিষ্ঠান:</strong> {exp.organization} | <strong>মেয়াদ:</strong> {exp.startDate} হতে {exp.isCurrent ? 'বর্তমান' : exp.endDate}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingExpIndex(idx);
                              setTempExp({ ...exp });
                              setShowExpModal(true);
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-200 font-bold transition-colors"
                          >
                            এডিট
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('এই অভিজ্ঞতার রেকর্ডটি মুছে ফেলতে চান?')) {
                                const updated = formData.experiences!.filter((_, i) => i !== idx);
                                updateField('experiences', updated);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                    কোনো অভিজ্ঞতার রেকর্ড নেই।
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 6: SKILLS & LANGUAGES */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'skills' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  <span>দক্ষতা ও ভাষা পারদর্শিতা (Skills & Languages)</span>
                </h3>

                {/* Skills Section */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">প্রফেশনাল স্কিলস (Technical & Professional Skills)</label>
                  <div className="flex items-center gap-2 flex-wrap min-h-12 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    {(formData.skills || []).map((sk, sIdx) => (
                      <span key={sIdx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
                        <span>{sk}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (formData.skills || []).filter((_, i) => i !== sIdx);
                            updateField('skills', updated);
                          }}
                          className="hover:text-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="নতুন স্কিল লিখুন (যেমন: Accounting, React.js, MS Excel)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newSkill.trim()) {
                            updateField('skills', [...(formData.skills || []), newSkill.trim()]);
                            setNewSkill('');
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newSkill.trim()) {
                          updateField('skills', [...(formData.skills || []), newSkill.trim()]);
                          setNewSkill('');
                        }
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                    >
                      যুক্ত করুন
                    </button>
                  </div>
                </div>

                {/* Languages Section */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block">ভাষা পারদর্শিতা (Languages)</label>
                  <div className="flex items-center gap-2 flex-wrap min-h-12 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    {(formData.languages || ['বাংলা', 'English']).map((lang, lIdx) => (
                      <span key={lIdx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs font-bold shadow-2xs">
                        <span>{lang}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (formData.languages || []).filter((_, i) => i !== lIdx);
                            updateField('languages', updated);
                          }}
                          className="hover:text-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="নতুন ভাষা (যেমন: আরবি / ফরাসি)"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newLanguage.trim()) {
                          updateField('languages', [...(formData.languages || []), newLanguage.trim()]);
                          setNewLanguage('');
                        }
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
                    >
                      যুক্ত করুন
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 7: CAREER PREFERENCES */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Heart className="w-4 h-4 text-emerald-600" />
                  <span>ক্যারিয়ার পছন্দ ও স্মার্ট ম্যাচিং সেটিংস (Career Preferences)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">পছন্দের চাকরির ক্যাটাগরি</label>
                    <input
                      type="text"
                      value={(formData.careerPreferences as any)?.categories?.join(', ') || 'সরকারি চাকরি, ব্যাংক জব'}
                      onChange={(e) => {
                        const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        updateField('careerPreferences', { ...formData.careerPreferences, categories: arr });
                      }}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">পছন্দের কর্মস্থল / জেলাসমূহ</label>
                    <input
                      type="text"
                      value={(formData.careerPreferences as any)?.preferredLocations?.join(', ') || 'ঢাকা, চট্টগ্রাম'}
                      onChange={(e) => {
                        const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        updateField('careerPreferences', { ...formData.careerPreferences, preferredLocations: arr });
                      }}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 8: DOCUMENTS & CERTIFICATES */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'documents' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>আপলোডকৃত সার্টিফিকেট ও নথিপত্র (Document Vault)</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500">{documents.length} টি ফাইল</span>
                </div>

                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {documents.map((doc, dIdx) => (
                      <div key={dIdx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm truncate">{doc.title || doc.fileName}</span>
                          <span className="bg-slate-200 text-slate-700 font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                            {doc.fileSize || 'PDF/JPG'}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          ধরন: <strong>{doc.type}</strong> | আপলোড: {doc.uploadDate || 'অনির্ধারিত'}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>সুরক্ষিত স্টোরেজ</span>
                          </span>
                          {(doc.fileUrl || doc.dataUrl) && (
                            <button
                              type="button"
                              onClick={() => setPreviewDocumentUrl(doc.fileUrl || doc.dataUrl || null)}
                              className="px-3 py-1 bg-white hover:bg-slate-100 text-blue-700 rounded-lg border font-bold flex items-center gap-1 text-[11px]"
                            >
                              <Eye className="w-3 h-3" />
                              <span>প্রিভিউ</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                    কোনো নথি আপলোড করা নেই।
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 9: SAVED JOBS & ACTIVITY */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'saved_jobs' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Bookmark className="w-4 h-4 text-emerald-600" />
                  <span>সংরক্ষিত চাকরির তালিকা (Saved Jobs)</span>
                </h3>

                {savedJobs.length > 0 ? (
                  <div className="space-y-2">
                    {savedJobs.map((sj, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <h4 className="font-bold text-slate-900">{sj.title}</h4>
                          <span className="text-slate-500 text-[11px]">{sj.organization} • শেষ সময়: {sj.deadline}</span>
                        </div>
                        <Link
                          href={`/jobs/${sj.slug || sj.id}`}
                          target="_blank"
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-emerald-700 font-bold rounded-lg border flex items-center gap-1 text-[11px]"
                        >
                          <span>বিজ্ঞপ্তি দেখুন</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                    প্রার্থী এখনো কোনো সার্কুলার বুকমার্ক করেননি।
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 10: NOTIFICATIONS */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <span>নোটিফিকেশন ও এসএমএস হিস্ট্রি (Communication Logs)</span>
                  </h3>
                  {onOpenSmsModal && (
                    <button
                      type="button"
                      onClick={() => onOpenSmsModal(formData)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>নতুন এসএমএস পাঠান</span>
                    </button>
                  )}
                </div>

                {notifications.length > 0 ? (
                  <div className="space-y-2">
                    {notifications.map((n, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.date || 'সম্প্রতি'}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{n.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                    কোনো নোটিফিকেশন রেকর্ড পাওয়া যায়নি।
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 11: ACCOUNT SECURITY & RECOVERY */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>অ্যাকাউন্ট স্ট্যাটাস ও রিকভারি কন্ট্রোল (Account Governance)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">অ্যাকাউন্ট স্ট্যাটাস</label>
                    <select
                      value={formData.accountStatus || 'active'}
                      onChange={(e: any) => updateField('accountStatus', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none font-bold"
                    >
                      <option value="active">Active (সক্রিয়)</option>
                      <option value="suspended">Suspended (স্থগিত)</option>
                      <option value="banned">Banned (নিষিদ্ধ)</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-3 sm:pt-4">
                    <label className="relative flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(formData.isVerified)}
                        onChange={(e) => updateField('isVerified', e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        ভেরিফাইড ক্যান্ডিডেট (Verified User Badge)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Password Reset Section */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        <span>সিকিউর পাসওয়ার্ড রিসেট (Password Reset Generator)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        প্রার্থী পাসওয়ার্ড ভুলে গেলে অ্যাডমিন কর্তৃক একটি তাৎক্ষণিক রেন্ডম পাসওয়ার্ড সেট করতে পারেন।
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      disabled={isResettingPassword}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isResettingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>পাসওয়ার্ড রিসেট করুন</span>
                    </button>
                  </div>

                  {tempPasswordGenerated && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs font-bold text-amber-900">
                      <div>
                        <span>নতুন তৈরি করা পাসওয়ার্ড:</span>
                        <code className="ml-2 font-mono text-sm bg-white px-2 py-0.5 rounded border border-amber-300 text-slate-900">
                          {tempPasswordGenerated}
                        </code>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(tempPasswordGenerated);
                          alert('পাসওয়ার্ড কপি করা হয়েছে!');
                        }}
                        className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs"
                      >
                        কপি করুন
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 12: ADMIN NOTES */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'admin_notes' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <FileEdit className="w-4 h-4 text-emerald-600" />
                    <span>প্রশাসনিক গোপন নোট (Private Admin Notes)</span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">শুধুমাত্র অ্যাডমিনদের জন্য দৃশ্যমান</span>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={newAdminNote}
                    onChange={(e) => setNewAdminNote(e.target.value)}
                    placeholder="প্রার্থী সম্পর্কে কোনো গোপন প্রশাসনিক তথ্য বা মন্তব্য লিখুন..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddAdminNote}
                      disabled={isSaving || !newAdminNote.trim()}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>নোট যুক্ত করুন</span>
                    </button>
                  </div>
                </div>

                {/* Notes List */}
                {(formData.adminNotes && formData.adminNotes.length > 0) ? (
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    {formData.adminNotes.map((note, nIdx) => (
                      <div key={nIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{note.authorName || 'সুপার অ্যাডমিন'}</span>
                          <span className="text-[10px] text-slate-400">{new Date(note.createdAt).toLocaleString('bn-BD')}</span>
                        </div>
                        <p className="text-slate-700">{note.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    এখনো কোনো প্রশাসনিক নোট যুক্ত করা হয়নি।
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB: CANDIDATE APPLICATIONS (SUB-FEATURE 5) */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'applications' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <span>চাকরির আবেদনসমূহ ({applications.length})</span>
                  </h3>
                  <span className="text-xs text-slate-500">মোট আবেদন: {applications.length} টি</span>
                </div>

                {applications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                          <th className="py-2.5 px-3">পদের নাম / বিজ্ঞপ্তি</th>
                          <th className="py-2.5 px-3">আবেদনের তারিখ</th>
                          <th className="py-2.5 px-3">সার্ভিস ফি</th>
                          <th className="py-2.5 px-3">অবস্থা</th>
                          <th className="py-2.5 px-3">ট্রানজেকশন আইডি</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {applications.map((app, aIdx) => (
                          <tr key={app.id || aIdx} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {app.jobTitle || app.title || 'সরকারি পদ'}
                              <span className="block text-[11px] font-normal text-slate-500">{app.organization || 'সরকারি দপ্তর'}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('bn-BD') : 'তারিখ নেই'}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              ৳{app.financialSnapshot?.finalServiceCharge ?? app.serviceCharge ?? 80}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                app.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : app.status === 'processing'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : app.status === 'pending_payment'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {app.status === 'completed' ? 'সম্পন্ন' : app.status === 'processing' ? 'প্রক্রিয়াধীন' : app.status === 'pending_payment' ? 'পেমেন্ট অপেক্ষমাণ' : 'বাতিল'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                              {app.paymentDetails?.transactionId || app.trxId || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    এই প্রার্থীর এখনো কোনো চাকরির আবেদন জমা নেই।
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB: CANDIDATE WALLET & LEDGER (SUB-FEATURE 7) */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'wallet' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Balance Card & Manual Adjustment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Balance Display */}
                <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-5 rounded-3xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
                    <span>বর্তমান ওয়ালেট ব্যালেন্স</span>
                    <CreditCard className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="text-3xl font-black">
                    ৳{formData.walletBalance || 0}
                  </div>
                  <p className="text-[11px] text-emerald-300/80">
                    চাকরি সেবা অ্যাকাউন্ট ওয়ালেট (সার্ভিস ও আবেদন ফি সমন্বয়ের জন্য)
                  </p>
                </div>

                {/* Manual Adjustment Card */}
                <div className="md:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>প্রশাসনিক ব্যালেন্স সমন্বয় (Admin Manual Adjustment)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">সমন্বয়ের ধরন</label>
                      <select
                        value={adjType}
                        onChange={(e) => setAdjType(e.target.value as any)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-semibold"
                      >
                        <option value="credit">জমা / ক্রেডিট (+)</option>
                        <option value="debit">কর্তন / ডেবিট (-)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">টাকার পরিমাণ (৳)</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="যেমন: ১০০"
                        value={adjAmount}
                        onChange={(e) => setAdjAmount(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">বাধ্যতামূলক কারণ</label>
                      <input
                        type="text"
                        placeholder="কারণ লিখুন..."
                        value={adjReason}
                        onChange={(e) => setAdjReason(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      disabled={isAdjustingBalance || !adjAmount || !adjReason.trim()}
                      onClick={async () => {
                        if (!candidateId || !adjAmount || !adjReason.trim()) return;
                        setIsAdjustingBalance(true);
                        try {
                          const res = await fetch(`/api/admin/candidates/${candidateId}`, {
                            method: 'PATCH',
                            headers: getAdminHeaders(),
                            body: JSON.stringify({
                              balanceAdjustment: {
                                amount: Number(adjAmount),
                                type: adjType,
                                reason: adjReason.trim()
                              }
                            })
                          });
                          const d = await res.json();
                          if (d.success) {
                            setSaveSuccessToast(`ব্যালেন্স সফলভাবে সমন্বয় করা হয়েছে! নতুন ব্যালেন্স: ৳${d.candidate.walletBalance}`);
                            setFormData(prev => ({ ...prev, walletBalance: d.candidate.walletBalance }));
                            setAdjAmount('');
                            setAdjReason('');
                            loadCandidateData(candidateId);
                            setTimeout(() => setSaveSuccessToast(null), 3500);
                          } else {
                            setSaveError(d.error || 'সমন্বয় ব্যর্থ হয়েছে');
                          }
                        } catch (err: any) {
                          setSaveError(err.message || 'নেটওয়ার্ক এরর');
                        } finally {
                          setIsAdjustingBalance(false);
                        }
                      }}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isAdjustingBalance ? 'প্রক্রিয়াধীন...' : 'সমন্বয় নিশ্চিত করুন'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>লেনদেন ও লেজার হিস্ট্রি ({transactions.length})</span>
                  </h3>
                  <span className="text-xs text-slate-500">মোট লেনদেন: {transactions.length} টি</span>
                </div>

                {transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                          <th className="py-2.5 px-3">ট্রানজেকশন আইডি</th>
                          <th className="py-2.5 px-3">তারিখ</th>
                          <th className="py-2.5 px-3">ধরন</th>
                          <th className="py-2.5 px-3">বিবরণ / কারণ</th>
                          <th className="py-2.5 px-3">মাধ্যম</th>
                          <th className="py-2.5 px-3 text-right">পরিমাণ (৳)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions.map((tx, tIdx) => (
                          <tr key={tx.id || tIdx} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                              {tx.trxId || tx.id}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {tx.date ? new Date(tx.date).toLocaleDateString('bn-BD') : 'তারিখ নেই'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.type === 'recharge' || tx.type === 'deposit'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {tx.type === 'recharge' || tx.type === 'deposit' ? 'জমা (+)' : 'কর্তন (-)'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">
                              {tx.description || tx.purpose || 'সাধারণ লেনদেন'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {tx.method || 'Wallet'}
                            </td>
                            <td className={`py-2.5 px-3 text-right font-black ${
                              tx.type === 'recharge' || tx.type === 'deposit' ? 'text-emerald-600' : 'text-slate-800'
                            }`}>
                              {tx.type === 'recharge' || tx.type === 'deposit' ? '+' : '-'}৳{tx.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    কোনো পূর্ববর্তী লেনদেন রেকর্ড পাওয়া যায়নি।
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 13: AUDIT HISTORY */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'audit_log' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-600" />
                    <span>প্রশাসনিক পরিবর্তন ও অডিট ট্রেইল (Admin Audit Trail)</span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500">
                    {(formData.adminAuditHistory || []).length} টি অডিট রেকর্ড
                  </span>
                </div>

                {(formData.adminAuditHistory && formData.adminAuditHistory.length > 0) ? (
                  <div className="space-y-3">
                    {formData.adminAuditHistory.map((log, lIdx) => (
                      <div key={lIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            <span>অ্যাডমিন: {log.adminId}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(log.timestamp).toLocaleString('bn-BD')}
                          </span>
                        </div>
                        <p className="text-slate-700 font-semibold">{log.notes}</p>
                        {log.changedFields && log.changedFields.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap pt-1">
                            <span className="text-[10px] text-slate-400">পরিবর্তিত ফিল্ডসমূহ:</span>
                            {log.changedFields.map((f, fi) => (
                              <span key={fi} className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    এখনো কোনো অডিট রেকর্ড নেই। তথ্য পরিবর্তন ও সংরক্ষণের সাথে সাথে স্বয়ংক্রিয়ভাবে অডিট হিস্ট্রি তৈরি হবে।
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* ============================================================== */}
        {/* 4. BOTTOM FOOTER STATUS BAR */}
        {/* ============================================================== */}
        <footer className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between gap-4 shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>প্রার্থী: <strong className="text-slate-800">{formData.name}</strong></span>
            <span>•</span>
            <span>ফোন: <strong className="text-slate-800">{formData.phone}</strong></span>
            <span>•</span>
            <span>স্ট্যাটাস: <strong className="text-emerald-700">{formData.accountStatus || 'active'}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSafeClose}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
            >
              বন্ধ করুন
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="px-5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>সংরক্ষণ করুন</span>
            </button>
          </div>
        </footer>

      </div>

      {/* ============================================================== */}
      {/* EDUCATION ADD/EDIT MODAL */}
      {/* ============================================================== */}
      {showEduModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">
                {editingEduIndex !== null ? 'শিক্ষাগত যোগ্যতা সম্পাদনা' : 'নতুন শিক্ষাগত যোগ্যতা সংযোজন'}
              </h4>
              <button onClick={() => setShowEduModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ডিগ্রি স্তর (Level) *</label>
                  <select
                    value={tempEdu.level || 'Honours'}
                    onChange={(e) => setTempEdu({ ...tempEdu, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
                  >
                    <option value="SSC">এসএসসি / দাখিল / সমমান</option>
                    <option value="HSC">এইচএসসি / আলিম / সমমান</option>
                    <option value="Diploma">ডিপ্লোমা (Diploma)</option>
                    <option value="Honours">স্নাতক / অনার্স (Bachelor's)</option>
                    <option value="Masters">স্নাতকোত্তর / মাস্টার্স</option>
                    <option value="PhD">পিএইচডি / ডক্টরেট</option>
                    <option value="Other">অন্যান্য</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ডিগ্রির নাম (Degree Name) *</label>
                  <input
                    type="text"
                    value={tempEdu.degree || ''}
                    onChange={(e) => setTempEdu({ ...tempEdu, degree: e.target.value })}
                    placeholder="যেমন: B.Sc in CSE"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">বোর্ড / বিশ্ববিদ্যালয় *</label>
                  <input
                    type="text"
                    value={tempEdu.boardOrUni || ''}
                    onChange={(e) => setTempEdu({ ...tempEdu, boardOrUni: e.target.value })}
                    placeholder="যেমন: ঢাকা বিশ্ববিদ্যালয়"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">পাসের সন (Passing Year)</label>
                  <input
                    type="text"
                    value={tempEdu.year || ''}
                    onChange={(e) => setTempEdu({ ...tempEdu, year: e.target.value })}
                    placeholder="যেমন: 2024"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ফলাফলের ধরন (Result Type)</label>
                  <select
                    value={tempEdu.resultType || 'CGPA'}
                    onChange={(e: any) => setTempEdu({ ...tempEdu, resultType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
                  >
                    <option value="CGPA">CGPA (আউট অফ ৪.০)</option>
                    <option value="GPA">GPA (আউট অফ ৫.০)</option>
                    <option value="DIVISION">১ম / ২য় / ৩য় বিভাগ</option>
                    <option value="CLASS">১ম / ২য় শ্রেণি</option>
                    <option value="PASS_FAIL">পাস / উত্তীর্ণ</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ফলাফল / পয়েন্ট (Result) *</label>
                  <input
                    type="text"
                    value={tempEdu.result || ''}
                    onChange={(e) => setTempEdu({ ...tempEdu, result: e.target.value })}
                    placeholder="যেমন: 3.75"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">রোল নম্বর (Roll No)</label>
                  <input
                    type="text"
                    value={tempEdu.roll || ''}
                    onChange={(e) => setTempEdu({ ...tempEdu, roll: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">রেজিস্ট্রেশন নম্বর (Reg No)</label>
                  <input
                    type="text"
                    value={tempEdu.reg || ''}
                    onChange={(e) => setTempEdu({ ...tempEdu, reg: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEduModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!tempEdu.degree?.trim() || !tempEdu.boardOrUni?.trim()) {
                    alert('ডিগ্রি ও বিশ্ববিদ্যালয়ের নাম আবশ্যক!');
                    return;
                  }
                  const currentList = [...(formData.education || [])];
                  if (editingEduIndex !== null) {
                    currentList[editingEduIndex] = tempEdu as EducationRecord;
                  } else {
                    currentList.push(tempEdu as EducationRecord);
                  }
                  updateField('education', currentList);
                  setShowEduModal(false);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EXPERIENCE ADD/EDIT MODAL */}
      {/* ============================================================== */}
      {showExpModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">
                {editingExpIndex !== null ? 'অভিজ্ঞতার রেকর্ড সম্পাদনা' : 'নতুন চাকরির অভিজ্ঞতা সংযোজন'}
              </h4>
              <button onClick={() => setShowExpModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">পদবী (Designation) *</label>
                <input
                  type="text"
                  value={tempExp.designation || ''}
                  onChange={(e) => setTempExp({ ...tempExp, designation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">প্রতিষ্ঠান (Organization) *</label>
                <input
                  type="text"
                  value={tempExp.organization || ''}
                  onChange={(e) => setTempExp({ ...tempExp, organization: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">শুরুর তারিখ</label>
                  <input
                    type="date"
                    value={tempExp.startDate || ''}
                    onChange={(e) => setTempExp({ ...tempExp, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">শেষের তারিখ</label>
                  <input
                    type="date"
                    disabled={tempExp.isCurrent}
                    value={tempExp.endDate || ''}
                    onChange={(e) => setTempExp({ ...tempExp, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(tempExp.isCurrent)}
                    onChange={(e) => setTempExp({ ...tempExp, isCurrent: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="font-bold text-slate-800">বর্তমানে এই পদে কর্মরত আছেন</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExpModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!tempExp.designation?.trim() || !tempExp.organization?.trim()) {
                    alert('পদবী ও প্রতিষ্ঠানের নাম আবশ্যক!');
                    return;
                  }
                  const currentList = [...(formData.experiences || [])];
                  if (editingExpIndex !== null) {
                    currentList[editingExpIndex] = tempExp as ExperienceRecord;
                  } else {
                    currentList.push(tempExp as ExperienceRecord);
                  }
                  updateField('experiences', currentList);
                  setShowExpModal(false);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DOCUMENT PREVIEW MODAL */}
      {/* ============================================================== */}
      {previewDocumentUrl && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs">ডকুমেন্ট প্রিভিউ</span>
              <button onClick={() => setPreviewDocumentUrl(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100">
              {previewDocumentUrl.startsWith('data:application/pdf') || previewDocumentUrl.endsWith('.pdf') ? (
                <iframe src={previewDocumentUrl} className="w-full h-96 border-none" title="PDF Document" />
              ) : (
                <img src={previewDocumentUrl} alt="Document" className="max-w-full max-h-96 object-contain" />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
