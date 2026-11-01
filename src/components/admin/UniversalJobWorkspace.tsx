'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Upload,
  LayoutDashboard,
  FileText,
  GraduationCap,
  Send,
  FileCode,
  PenTool,
  Search,
  Image as ImageIcon,
  ShieldCheck,
  Globe,
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
  Building2,
  Layers,
  MapPin,
  Briefcase,
  Tag,
  ChevronRight,
  Share2,
  CheckCircle2,
  Calendar,
  DollarSign,
  AlertCircle,
  Info,
  Sliders,
  List,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Table as TableIcon
} from 'lucide-react';
import { JobCircular, JobPosition } from '@/lib/types';

const ADMIN_REQ_HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
  'x-admin-secret': '1234'
};

export interface UniversalJobWorkspaceProps {
  job: JobCircular | null;
  isOpen: boolean;
  isNew?: boolean;
  onClose: () => void;
  onSaveSuccess: (savedJob: JobCircular) => void;
  onDelete?: (jobId: string, title: string) => void;
  onOpenContentStudio?: (jobId: string) => void;
}

type WorkspaceTab = 
  | 'overview'
  | 'details'
  | 'eligibility'
  | 'application'
  | 'circular'
  | 'content'
  | 'seo'
  | 'media'
  | 'verification'
  | 'publishing'
  | 'history';

const DEFAULT_BLANK_JOB: Partial<JobCircular> = {
  title: '',
  organization: '',
  logo: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80',
  category: 'govt',
  categoryLabel: 'সরকারি চাকরি',
  grade: '৯ম গ্রেড',
  totalPosts: 1,
  salary: '২২,০০০ - ৫৩,০৬০ টাকা',
  salaryType: 'range',
  minEducation: 'স্নাতক বা সমমান',
  minAge: 18,
  maxAge: 32,
  districts: 'সকল জেলা',
  deadline: '২৫ নভেম্বর ২০২৬',
  daysRemaining: 15,
  govtFee: 200,
  serviceFee: 80,
  officialLink: 'https://alljobs.teletalk.com.bd',
  circularImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
  circularPdfUrl: '',
  circularPages: [],
  audioSummary: '',
  publishedDate: new Date().toLocaleDateString('bn-BD'),
  requirements: ['স্নাতক বা সমমান ডিগ্রি', 'বয়স: ১৮ থেকে ৩২ বছর'],
  positions: [],
  documentsRequired: ['জাতীয় পরিচয়পত্র বা জন্মনিবন্ধন সনদ', 'পাসপোর্ট সাইজের রঙিন ছবি', 'সকল শিক্ষাগত যোগ্যতার সনদপত্র'],
  bengaliDescription: '',
  faqItems: [],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: [],
  slug: '',
  status: 'published',
  featured: false,
  isHot: false,
  verificationStatus: 'MANUAL_ENTERED',
  verificationConfidence: 100,
  verificationNotes: 'অ্যাডমিন কর্তৃক ম্যানুয়ালি তৈরিকৃত',
  allowThirdDivision: true
};

export default function UniversalJobWorkspace({
  job,
  isOpen,
  isNew = false,
  onClose,
  onSaveSuccess,
  onDelete,
  onOpenContentStudio
}: UniversalJobWorkspaceProps) {
  // Active Tab
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');

  // Form State
  const [formData, setFormData] = useState<Partial<JobCircular>>({});
  const [initialData, setInitialData] = useState<Partial<JobCircular>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: keyof JobCircular, type: 'image' | 'logo' | 'pdf') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(String(targetField));
    setSaveError(null);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('type', type);

      const res = await fetch('/api/admin/upload-file', {
        method: 'POST',
        headers: {
          'x-admin-secret': '1234'
        },
        body: formDataUpload
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ফাইল আপলোড ব্যর্থ হয়েছে');
      }

      updateField(targetField, data.url);
      setSaveSuccessToast(`ফাইল সফলভাবে আপলোড হয়েছে: ${data.filename || file.name}`);
      setTimeout(() => setSaveSuccessToast(null), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'ফাইল আপলোড করতে সমস্যা হয়েছে');
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  // Requirement bullets temporary input
  const [newReqBullet, setNewReqBullet] = useState('');

  // Sub-position temporary inputs
  const [newPosTitle, setNewPosTitle] = useState('');
  const [newPosGrade, setNewPosGrade] = useState('৯ম গ্রেড');
  const [newPosPosts, setNewPosPosts] = useState(1);
  const [newPosSalary, setNewPosSalary] = useState('');
  const [newPosEdu, setNewPosEdu] = useState('');

  // FAQ temporary inputs
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  // Custom document temporary input
  const [newDocName, setNewDocName] = useState('');

  const currentJobIdRef = useRef<string | null>(null);

  // Initialize form data ONLY when modal opens or job ID changes (prevents reverting edits during typing)
  useEffect(() => {
    if (isOpen) {
      const targetId = isNew ? 'NEW_JOB' : (job?.id || 'BLANK');
      if (currentJobIdRef.current !== targetId) {
        currentJobIdRef.current = targetId;
        const base = isNew || !job ? { ...DEFAULT_BLANK_JOB, id: 'job-' + Date.now().toString().slice(-6) } : { ...job };
        setFormData(base);
        setInitialData(base);
        setSaveError(null);
        setSaveSuccessToast(null);
        setActiveTab('overview');
      }
    } else {
      currentJobIdRef.current = null;
    }
  }, [isOpen, job?.id, isNew]);

  // Compute dirty state
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  // Warn on window reload if dirty
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

  if (!isOpen) return null;

  const updateField = (field: keyof JobCircular, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Safe Close with dirty check
  const handleSafeClose = () => {
    if (isDirty) {
      if (confirm('আপনার কিছু পরিবর্তন এখনো সংরক্ষিত হয়নি। আপনি কি নিশ্চিত যে উইন্ডো বন্ধ করতে চান?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Save Job Handler
  const handleSave = async (overrideStatus?: string) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccessToast(null);

    try {
      const finalStatus = overrideStatus || formData.status || 'published';
      const payload: Partial<JobCircular> & { publicationStatus?: string } = {
        ...formData,
        status: finalStatus,
        publicationStatus: (finalStatus === 'draft' || finalStatus === 'archived') ? 'UNPUBLISHED' : 'PUBLISHED',
        updatedAt: new Date().toISOString()
      };

      if (!payload.title?.trim() || !payload.organization?.trim()) {
        setSaveError('বিজ্ঞপ্তির শিরোনাম এবং প্রতিষ্ঠানের নাম আবশ্যক!');
        setIsSaving(false);
        setActiveTab('details');
        return;
      }

      const isCreate = isNew || !job?.id;
      const url = isCreate ? '/api/admin/jobs' : `/api/admin/jobs/${payload.id}`;
      const method = isCreate ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'বিজ্ঞপ্তি সংরক্ষণ করা সম্ভব হয়নি।');
      }

      setFormData(data.job);
      setInitialData(data.job);
      currentJobIdRef.current = data.job.id;
      setSaveSuccessToast(isCreate ? 'নতুন বিজ্ঞপ্তি সফলভাবে তৈরি ও সংরক্ষিত হয়েছে!' : 'সকল পরিবর্তন সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!');
      onSaveSuccess(data.job);
      setTimeout(() => setSaveSuccessToast(null), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'নেটওয়ার্ক এরর ঘটেছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSaving(false);
    }
  };

  // One-click manual verification bypass
  const handleManualVerifyBypass = () => {
    updateField('verificationStatus', 'VERIFIED');
    updateField('verificationConfidence', 100);
    updateField('verificationNotes', 'অ্যাডমিন কর্তৃক সরাসরি ম্যানুয়ালি তথ্য পর্যালোচনা ও সত্যায়িত করা হয়েছে।');
    updateField('lastVerifiedAt', new Date().toISOString());
    alert('বিজ্ঞপ্তিটি সফলভাবে "অফিসিয়াল সত্যায়িত" (Officially Verified) হিসেবে চিহ্নিত করা হয়েছে। পরিবর্তন সংরক্ষণ করতে "সংরক্ষণ করুন" বাটনে ক্লিক করুন।');
  };

  // Common quick insert helpers for rich text description
  const handleInsertContentTemplate = (snippet: string) => {
    const current = formData.bengaliDescription || '';
    updateField('bengaliDescription', current ? current + '\n\n' + snippet : snippet);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-7xl h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* ============================================================== */}
        {/* 1. TOP HEADER & WORKSPACE ACTION BAR */}
        {/* ============================================================== */}
        <header className="px-6 py-4 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold bg-slate-800 text-emerald-400 px-2.5 py-0.5 rounded-md border border-slate-700">
                  ID: {formData.id || 'NEW'}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  formData.status === 'published' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  formData.status === 'draft' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {(formData.status || 'published').toUpperCase()}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {formData.categoryLabel || 'সরকারি চাকরি'}
                </span>
                {isDirty && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/80 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    অসংরক্ষিত পরিবর্তন
                  </span>
                )}
              </div>
              <h2 className="text-base font-black text-slate-100 truncate mt-1">
                {formData.title ? `${formData.organization || ''} — ${formData.title}` : 'নতুন নিয়োগ বিজ্ঞপ্তি তৈরি'}
              </h2>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Live Preview Button */}
            <button
              type="button"
              onClick={() => setShowLivePreview(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
              title="পাবলিক পেজের মতো প্রিভিউ দেখুন"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>প্রিভিউ</span>
            </button>

            {/* Bridge to Visual Content Studio (Step 04) */}
            {formData.id && onOpenContentStudio && (
              <button
                type="button"
                onClick={() => {
                  if (isDirty) {
                    if (confirm('কন্টেন্ট স্টুডিওতে যাওয়ার পূর্বে পরিবর্তন সেভ করতে চান?')) {
                      handleSave();
                    }
                  }
                  onOpenContentStudio(formData.id!);
                }}
                className="px-3 py-2 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 rounded-xl text-xs font-bold transition-all border border-indigo-700/80 flex items-center gap-1.5"
                title="ভিজ্যুয়াল কন্টেন্ট স্টুডিওতে ওপেন করুন"
              >
                <PenTool className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">কন্টেন্ট স্টুডিও</span>
              </button>
            )}

            {/* Save Button */}
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-950/30 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
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
        {/* 2. TAB NAVIGATION BAR (11 ORGANIZED TABS) */}
        {/* ============================================================== */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-thin text-xs sm:text-sm">
          {[
            { id: 'overview', label: 'সারসংক্ষেপ', icon: LayoutDashboard },
            { id: 'details', label: 'মূল তথ্য', icon: FileText },
            { id: 'eligibility', label: 'যোগ্যতা ও শর্তাবলী', icon: GraduationCap },
            { id: 'application', label: 'আবেদন ও ফি', icon: Send },
            { id: 'circular', label: 'সার্কুলার ও সোর্স', icon: FileCode },
            { id: 'content', label: 'বিবরণী ও কন্টেন্ট', icon: PenTool },
            { id: 'seo', label: 'এসইও ও মেটা', icon: Search },
            { id: 'media', label: 'মিডিয়া ও ছবি', icon: ImageIcon },
            { id: 'verification', label: 'ভেরিফিকেশন', icon: ShieldCheck },
            { id: 'publishing', label: 'পাবলিশিং', icon: Globe },
            { id: 'history', label: 'হিস্ট্রি ও অডিট', icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as WorkspaceTab)}
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer text-xs sm:text-sm ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* 3. TAB CONTENT PANELS (SCROLLABLE BODY) */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50/50 space-y-6">
          
          {/* ------------------------------------------------------------ */}
          {/* TAB 1: OVERVIEW */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Key Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">মোট পদসংখ্যা</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">{formData.totalPosts || 0} টি</div>
                  <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">{formData.grade || 'গ্রেড উল্লেখ নেই'}</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">আবেদনের শেষ তারিখ</span>
                  <div className="text-lg font-black text-slate-900 mt-1">{formData.deadline || 'নির্ধারিত হয়নি'}</div>
                  <span className="text-[11px] text-rose-600 font-bold mt-0.5 block">বাকি {formData.daysRemaining ?? 0} দিন</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">ভেরিফিকেশন স্ট্যাটাস</span>
                  <div className="text-sm font-black text-slate-900 mt-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{formData.verificationStatus || 'MANUAL_ENTERED'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">কনফিডেন্স: {formData.verificationConfidence || 100}%</span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">পাবলিক ইউআরএল</span>
                  <div className="text-xs font-semibold text-blue-600 truncate mt-2">
                    /jobs/{formData.slug || formData.id}
                  </div>
                  <Link
                    href={`/jobs/${formData.slug || formData.id}`}
                    target="_blank"
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 mt-1"
                  >
                    <span>পাবলিক পেজে দেখুন</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Completeness Checklist */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>সার্কুলার ডাটা পূর্ণাঙ্গতা চেক (Field Completeness Audit)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {[
                    { label: 'বিজ্ঞপ্তির শিরোনাম', valid: Boolean(formData.title?.trim()) },
                    { label: 'প্রতিষ্ঠানের নাম', valid: Boolean(formData.organization?.trim()) },
                    { label: 'ন্যূনতম শিক্ষাগত যোগ্যতা', valid: Boolean(formData.minEducation?.trim()) },
                    { label: 'বেতন স্কেল', valid: Boolean(formData.salary?.trim()) },
                    { label: 'আবেদন লিংক', valid: Boolean(formData.officialLink?.trim()) },
                    { label: 'সার্কুলার ছবি / পিডিএফ', valid: Boolean(formData.circularImage || formData.circularPdfUrl) },
                    { label: 'বাংলা কন্টেন্ট বিবরণী', valid: Boolean(formData.bengaliDescription?.trim()) },
                    { label: 'এসইও মেটা টাইটেল', valid: Boolean(formData.seoTitle?.trim()) }
                  ].map((chk, i) => (
                    <div key={i} className={`p-3 rounded-xl border flex items-center justify-between ${
                      chk.valid ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-amber-50/60 border-amber-200 text-amber-900'
                    }`}>
                      <span className="font-semibold">{chk.label}</span>
                      {chk.valid ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-white">পরবর্তী ধাপে কী করবেন?</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    ট্যাবগুলো ব্যবহার করে প্রতিটি ফিল্ড নিখুঁতভাবে পর্যালোচনা করুন এবং সেভ করুন।
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('details')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    মূল তথ্য এডিট করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('content')}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition-all"
                  >
                    বাংলা বিবরণী লিখুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 2: JOB DETAILS */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'details' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>বিজ্ঞপ্তির মৌলিক পরিচয় ও প্রতিষ্ঠান (Basic & Organization)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">বিজ্ঞপ্তির শিরোনাম (Job Title) *</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="যেমন: সহকারী পরিচালক (সাধারণ)"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">প্রতিষ্ঠানের নাম (Organization) *</label>
                    <input
                      type="text"
                      required
                      value={formData.organization || ''}
                      onChange={(e) => updateField('organization', e.target.value)}
                      placeholder="যেমন: বাংলাদেশ ব্যাংক"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ক্যাটাগরি (Category)</label>
                    <select
                      value={formData.category || 'govt'}
                      onChange={(e) => {
                        const val = e.target.value;
                        const labelMap: any = {
                          govt: 'সরকারি চাকরি',
                          bank: 'ব্যাংক জব',
                          railway: 'বাংলাদেশ রেলওয়ে',
                          defense: 'প্রতিরক্ষা ও পুলিশ',
                          teacher: 'শিক্ষক নিয়োগ',
                          ngo: 'এনজিও',
                          private: 'বেসরকারি',
                          health: 'স্বাস্থ্য ও চিকিৎসা',
                          engineer: 'প্রকৌশলী ও প্রযুক্তি'
                        };
                        updateField('category', val);
                        updateField('categoryLabel', labelMap[val] || 'সরকারি চাকরি');
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="govt">সরকারি চাকরি</option>
                      <option value="bank">ব্যাংক জব</option>
                      <option value="railway">বাংলাদেশ রেলওয়ে</option>
                      <option value="defense">প্রতিরক্ষা ও পুলিশ</option>
                      <option value="teacher">শিক্ষক নিয়োগ</option>
                      <option value="ngo">এনজিও</option>
                      <option value="private">বেসরকারি</option>
                      <option value="health">স্বাস্থ্য ও চিকিৎসা</option>
                      <option value="engineer">প্রকৌশলী ও প্রযুক্তি</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">প্রতিষ্ঠানের ধরন (Org Type)</label>
                    <input
                      type="text"
                      value={formData.orgType || ''}
                      onChange={(e) => updateField('orgType', e.target.value)}
                      placeholder="যেমন: স্বায়ত্তশাসিত / মন্ত্রণালয় / রাষ্ট্রায়ত্ত"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">বেতন গ্রেড (Pay Grade)</label>
                    <select
                      value={formData.grade || '৯ম গ্রেড'}
                      onChange={(e) => updateField('grade', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    >
                      {Array.from({ length: 20 }, (_, i) => `${i + 1}ম গ্রেড`).map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                      <option value="নন-গ্রেড / চুক্তিভিত্তিক">নন-গ্রেড / চুক্তিভিত্তিক</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">চাকরির ধরন (Employment Type)</label>
                    <select
                      value={formData.employmentType || 'full_time'}
                      onChange={(e) => updateField('employmentType', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="full_time">পূর্ণকালীন (Full-time)</option>
                      <option value="contractual">চুক্তিভিত্তিক (Contractual)</option>
                      <option value="part_time">খণ্ডকালীন (Part-time)</option>
                      <option value="internship">ইন্টার্নশিপ (Internship)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">কাজের ধরন (Work Arrangement)</label>
                    <select
                      value={formData.workArrangement || 'on_site'}
                      onChange={(e) => updateField('workArrangement', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="on_site">অন-সাইট (অফিস)</option>
                      <option value="hybrid">হাইব্রিড</option>
                      <option value="remote">রিমোট (বাসা থেকে)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">মোট শূন্যপদ (Vacancies)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.totalPosts || 1}
                      onChange={(e) => updateField('totalPosts', Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Salary & Location */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>বেতন ও কর্মস্থল (Salary & Location)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">বেতনের ধরন (Salary Type)</label>
                    <select
                      value={formData.salaryType || 'range'}
                      onChange={(e) => updateField('salaryType', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="range">বেতন স্কেল (Range)</option>
                      <option value="fixed">নির্দিষ্ট বেতন (Fixed)</option>
                      <option value="negotiable">আলোচনা সাপেক্ষ (Negotiable)</option>
                      <option value="not_disclosed">বিজ্ঞপ্তিতে অপ্রকাশিত (Not Disclosed)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">বেতন বিবরণী (Salary Description)</label>
                    <input
                      type="text"
                      value={formData.salary || ''}
                      onChange={(e) => updateField('salary', e.target.value)}
                      placeholder="যেমন: ২২,০০০ - ৫৩,০৬০ টাকা (জাতীয় বেতন স্কেল ২০১৫)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">বিভাগ (Division)</label>
                    <input
                      type="text"
                      value={formData.division || ''}
                      onChange={(e) => updateField('division', e.target.value)}
                      placeholder="যেমন: ঢাকা"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">জেলা (District)</label>
                    <input
                      type="text"
                      value={formData.district || ''}
                      onChange={(e) => updateField('district', e.target.value)}
                      placeholder="যেমন: ঢাকা"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">উপজেলা / এরিয়া</label>
                    <input
                      type="text"
                      value={formData.upazila || ''}
                      onChange={(e) => updateField('upazila', e.target.value)}
                      placeholder="যেমন: মতিঝিল"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>গুরুত্বপূর্ণ তারিখ ও সময়সীমা (Dates & Deadlines)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">বিজ্ঞপ্তি প্রকাশের তারিখ</label>
                    <input
                      type="text"
                      value={formData.publishedDate || ''}
                      onChange={(e) => updateField('publishedDate', e.target.value)}
                      placeholder="যেমন: ০১ নভেম্বর ২০২৬"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">আবেদনের শেষ তারিখ (Deadline) *</label>
                    <input
                      type="text"
                      required
                      value={formData.deadline || ''}
                      onChange={(e) => updateField('deadline', e.target.value)}
                      placeholder="যেমন: ২৫ নভেম্বর ২০২৬"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">অবশিষ্ট দিন (Days Remaining)</label>
                    <input
                      type="number"
                      value={formData.daysRemaining ?? 15}
                      onChange={(e) => updateField('daysRemaining', Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 3: ELIGIBILITY & REQUIREMENTS */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'eligibility' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Academic & Age Requirements */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>শিক্ষাগত যোগ্যতা ও বয়সসীমা (Academic & Age Rules)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ন্যূনতম শিক্ষাগত যোগ্যতা *</label>
                    <input
                      type="text"
                      required
                      value={formData.minEducation || ''}
                      onChange={(e) => updateField('minEducation', e.target.value)}
                      placeholder="যেমন: যেকোনো স্বীকৃত বিশ্ববিদ্যালয় হতে স্নাতক বা সমমান"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">অভিজ্ঞতা (Experience in Years)</label>
                    <input
                      type="text"
                      value={formData.experienceYears || ''}
                      onChange={(e) => updateField('experienceYears', e.target.value)}
                      placeholder="যেমন: ২ বছর (ফ্রেশাররাও আবেদনযোগ্য হলে ফাঁকা রাখুন)"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">সর্বনিম্ন বয়স</label>
                    <input
                      type="number"
                      value={formData.minAge ?? 18}
                      onChange={(e) => updateField('minAge', Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">সর্বোচ্চ বয়স</label>
                    <input
                      type="number"
                      value={formData.maxAge ?? 32}
                      onChange={(e) => updateField('maxAge', Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">বয়স গণনার কাট-অফ ডেট</label>
                    <input
                      type="date"
                      value={formData.ageCutOffDate || '2026-11-01'}
                      onChange={(e) => updateField('ageCutOffDate', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">যেসব জেলার প্রার্থী আবেদন করতে পারবেন</label>
                    <input
                      type="text"
                      value={formData.districts || 'সকল জেলা'}
                      onChange={(e) => updateField('districts', e.target.value)}
                      placeholder="সকল জেলা অথবা নির্দিষ্ট জেলার নাম লিখুন"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center pt-3 sm:pt-5">
                    <label className="relative flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.allowThirdDivision === false}
                        onChange={(e) => updateField('allowThirdDivision', !e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        ৩য় বিভাগ / শ্রেণি গ্রহণযোগ্য নয় (Disallow 3rd Division)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Requirement Bullets Builder */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <List className="w-4 h-4 text-emerald-600" />
                    <span>পয়েন্টভিত্তিক শর্তাবলী (Bulleted Requirements)</span>
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {(formData.requirements || []).length} টি শর্ত
                  </span>
                </div>

                {/* Existing Requirements */}
                <div className="space-y-2">
                  {(formData.requirements || []).map((req, rIdx) => (
                    <div key={rIdx} className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                          {rIdx + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{req}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formData.requirements || []).filter((_, i) => i !== rIdx);
                          updateField('requirements', updated);
                        }}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Bullet */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newReqBullet}
                    onChange={(e) => setNewReqBullet(e.target.value)}
                    placeholder="নতুন শর্ত লিখুন (যেমন: কম্পিউটার ব্যবহারে পারদর্শী হতে হবে)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newReqBullet.trim()) {
                          updateField('requirements', [...(formData.requirements || []), newReqBullet.trim()]);
                          setNewReqBullet('');
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newReqBullet.trim()) {
                        updateField('requirements', [...(formData.requirements || []), newReqBullet.trim()]);
                        setNewReqBullet('');
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>যুক্ত করুন</span>
                  </button>
                </div>
              </div>

              {/* Designated Sub-Positions Builder */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>পদভিত্তিক উপ-পদসমূহ (Designated Sub-Positions Builder)</span>
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {(formData.positions || []).length} টি উপ-পদ
                  </span>
                </div>

                {/* Sub positions list */}
                {(formData.positions && formData.positions.length > 0) ? (
                  <div className="space-y-2">
                    {formData.positions.map((pos, pIdx) => (
                      <div key={pIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{pIdx + 1}. {pos.title}</span>
                            <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold">{pos.grade}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">{pos.posts} জন</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            বেতন: {pos.salary} | যোগ্যতা: {pos.minEducation}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.positions!.filter((_, i) => i !== pIdx);
                            updateField('positions', updated);
                          }}
                          className="self-end sm:self-center p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    কোনো উপ-পদ যুক্ত করা নেই। সার্কুলারে একাধিক ভিন্ন পদ থাকলে নিচে থেকে যুক্ত করুন।
                  </div>
                )}

                {/* Add Sub-Position Form */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">পদের নাম</label>
                    <input
                      type="text"
                      value={newPosTitle}
                      onChange={(e) => setNewPosTitle(e.target.value)}
                      placeholder="যেমন: হিসাবরক্ষক"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">গ্রেড</label>
                    <input
                      type="text"
                      value={newPosGrade}
                      onChange={(e) => setNewPosGrade(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">পদসংখ্যা</label>
                    <input
                      type="number"
                      min="1"
                      value={newPosPosts}
                      onChange={(e) => setNewPosPosts(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newPosTitle.trim()) {
                          alert('পদের নাম লিখুন!');
                          return;
                        }
                        const newP: JobPosition = {
                          title: newPosTitle.trim(),
                          grade: newPosGrade.trim() || '৯ম গ্রেড',
                          posts: Number(newPosPosts) || 1,
                          salary: newPosSalary || formData.salary || '২২,০০০ - ৫৩,০৬০ টাকা',
                          minEducation: newPosEdu || formData.minEducation || 'স্নাতক বা সমমান'
                        };
                        updateField('positions', [...(formData.positions || []), newP]);
                        setNewPosTitle('');
                        setNewPosPosts(1);
                      }}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>যোগ করুন</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 4: APPLICATION & FEES */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'application' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span>অনলাইন আবেদন পদ্ধতি ও গাইডলাইন (Application Procedures)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">আবেদন মাধ্যম (Application Method)</label>
                    <select
                      value={formData.applicationMethod || 'online_teletalk'}
                      onChange={(e) => updateField('applicationMethod', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="online_teletalk">অনলাইন (Teletalk পোর্টাল)</option>
                      <option value="online_portal">অনলাইন (প্রতিষ্ঠানের নিজস্ব পোর্টাল)</option>
                      <option value="post">ডাকযোগ / কুরিয়ারের মাধ্যমে</option>
                      <option value="email">ইমেইলে আবেদন</option>
                      <option value="in_person">সরাসরি সাক্ষাৎ / ওয়াক-ইন</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">অফিসিয়াল আবেদনের লিংক (Application URL)</label>
                    <input
                      type="text"
                      value={formData.officialLink || ''}
                      onChange={(e) => updateField('officialLink', e.target.value)}
                      placeholder="https://alljobs.teletalk.com.bd বা অফিশিয়াল পোর্টাল লিংক"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">বিস্তারিত আবেদন নির্দেশিকা (Application Instructions)</label>
                  <textarea
                    rows={4}
                    value={formData.applicationInstructions || ''}
                    onChange={(e) => updateField('applicationInstructions', e.target.value)}
                    placeholder="আবেদনের নিয়মাবলী, ছবির সাইজ, টেলিটক এসএমএস ফরম্যাট ইত্যাদি বিস্তারিত নির্দেশিকা লিখুন..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Fees & Teletalk SMS Configuration */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>আবেদন ফি ও টেলিটক এসএমএস কনফিগারেশন (Fees & SMS)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">সরকারি আবেদন ফি (৳)</label>
                    <input
                      type="number"
                      value={formData.govtFee || 0}
                      onChange={(e) => updateField('govtFee', Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">টেলিটক সার্ভিস চার্জ (৳)</label>
                    <input
                      type="number"
                      value={formData.serviceFee || 0}
                      onChange={(e) => updateField('serviceFee', Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">টেলিটক এসএমএস প্রিফিক্স (SMS Prefix)</label>
                    <input
                      type="text"
                      value={formData.smsPrefix || ''}
                      onChange={(e) => updateField('smsPrefix', e.target.value)}
                      placeholder="যেমন: BBUSER"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>প্রয়োজনীয় কাগজপত্র ও ডকুমেন্টস (Required Documents)</span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500">
                    {(formData.documentsRequired || []).length} টি ডকুমেন্ট
                  </span>
                </div>

                <div className="space-y-2">
                  {(formData.documentsRequired || []).map((doc, dIdx) => (
                    <div key={dIdx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        {doc}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formData.documentsRequired || []).filter((_, i) => i !== dIdx);
                          updateField('documentsRequired', updated);
                        }}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new document */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="যেমন: মুক্তিযোদ্ধা কোটা সনদপত্র / অভিজ্ঞতা সনদপত্র"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newDocName.trim()) {
                        updateField('documentsRequired', [...(formData.documentsRequired || []), newDocName.trim()]);
                        setNewDocName('');
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>যুক্ত করুন</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 5: CIRCULAR & SOURCE */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'circular' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  <span>অফিসিয়াল সার্কুলার ফাইল ও উৎস (Official Document & Sources)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">সার্কুলার PDF লিংক (PDF URL)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.circularPdfUrl || ''}
                        onChange={(e) => updateField('circularPdfUrl', e.target.value)}
                        placeholder="https://.../circular.pdf বা /pdfs/job-id.pdf"
                        className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                      />
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0">
                        <Upload className="w-4 h-4 text-emerald-700" />
                        <span>{uploadingField === 'circularPdfUrl' ? 'আপলোড হচ্ছে...' : 'PDF আপলোড'}</span>
                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'circularPdfUrl', 'pdf')}
                          disabled={uploadingField === 'circularPdfUrl'}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">মূল উৎস / গেজেট ইউআরএল (Source URL)</label>
                    <input
                      type="text"
                      value={formData.officialLink || (formData as any).sourceUrl || ''}
                      onChange={(e) => {
                        updateField('officialLink', e.target.value);
                        updateField('sourceUrl' as any, e.target.value);
                      }}
                      placeholder="মন্ত্রণালয়ের ওয়েবসাইট বা পত্রিকার মূল সার্কুলার লিংক"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">স্মারক নম্বর / রেফারেন্স নম্বর (Ref No.)</label>
                    <input
                      type="text"
                      value={formData.refNo || ''}
                      onChange={(e) => updateField('refNo', e.target.value)}
                      placeholder="যেমন: ০৫.০০.০০০০.১৩৩.১১.০০১.২৬-১০৯"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">উৎস প্রকাশের মাধ্যম</label>
                    <input
                      type="text"
                      value={(formData as any).sourcePublisher || ''}
                      onChange={(e) => updateField('sourcePublisher' as any, e.target.value)}
                      placeholder="যেমন: বাংলাদেশ গেজেট / দৈনিক ইত্তেফাক"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* PDF Viewer / Document Preview Box */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>ডকুমেন্ট প্রিভিউ (Document Preview / Viewer)</span>
                    </span>
                    {formData.circularPdfUrl && (
                      <a
                        href={formData.circularPdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <span>নতুন ট্যাবে PDF খুলুন</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {formData.circularPdfUrl ? (
                    <div className="w-full h-96 rounded-2xl border border-slate-300 overflow-hidden bg-slate-100 flex items-center justify-center">
                      <iframe
                        src={formData.circularPdfUrl}
                        title="Circular PDF"
                        className="w-full h-full border-none"
                      />
                    </div>
                  ) : (
                    <div className="py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
                      কোনো PDF লিংক যুক্ত করা হয়নি। উপরে PDF লিংক প্রদান করলে এখানে লাইভ ভিউ দেখা যাবে।
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 6: CONTENT EDITOR (FULL BENGALI ARTICLE) */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'content' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-emerald-600" />
                      <span>সম্পূর্ণ বাংলা জব বিবরণী (Bengali Description & Content)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      পাবলিক জব পেজের মূল আর্টিকেলের বডি টেক্সট এখানে সরাসরি বাংলায় লিখুন।
                    </p>
                  </div>

                  {/* Template insertion buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleInsertContentTemplate('## পদের বিবরণ ও দায়িত্বসমূহ\n- দৈনন্দিন অফিসিয়াল কার্যসম্পাদন।\n- নথিপত্র প্রস্তুতকরণ ও সংরক্ষণ।')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                    >
                      + পদ ও দায়িত্ব
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertContentTemplate('## শিক্ষাগত যোগ্যতা ও অন্যান্য শর্তাবলী\n- ন্যূনতম স্নাতক বা সমমান ডিগ্রি।\n- ৩য় বিভাগ গ্রহণযোগ্য নয়।')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                    >
                      + যোগ্যতা ব্লক
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertContentTemplate('## অনলাইনে আবেদন করার নিয়মাবলী\n১. প্রথমে অফিসিয়াল ওয়েবসাইটে প্রবেশ করুন।\n২. সঠিক তথ্য দিয়ে ফরম পূরণ করুন।\n৩. টেলিটকে নির্ধারিত ফি পরিশোধ করুন।')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                    >
                      + আবেদন নির্দেশিকা
                    </button>
                  </div>
                </div>

                {/* Editor Textarea */}
                <div>
                  <textarea
                    rows={16}
                    value={formData.bengaliDescription || ''}
                    onChange={(e) => updateField('bengaliDescription', e.target.value)}
                    placeholder="এখানে বিজ্ঞপ্তির সম্পূর্ণ বিবরণ বাংলায় লিখুন..."
                    className="w-full px-4 py-3 text-sm leading-relaxed rounded-2xl border border-slate-300 font-normal text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                    <span>{(formData.bengaliDescription || '').length} বর্ণ | {(formData.bengaliDescription || '').split(/\s+/).filter(Boolean).length} শব্দ</span>
                    <span>সাপোর্টেড: Markdown, হেডিং (##), বুলেট লিস্ট (-), প্যারাগ্রাফ</span>
                  </div>
                </div>

                {/* Content Studio Link Banner */}
                {formData.id && onOpenContentStudio && (
                  <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                        <PenTool className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-indigo-950">অ্যাডভান্সড ভিজ্যুয়াল কন্টেন্ট স্টুডিওতে সম্পাদনা করবেন?</h4>
                        <p className="text-[11px] text-indigo-700">ড্র্যাগ-অ্যান্ড-ড্রপ ব্লক, এসইও অ্যানালাইজার এবং কিওয়ার্ড অপটিমাইজার ব্যবহার করুন।</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenContentStudio(formData.id!)}
                      className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl transition-all shrink-0"
                    >
                      কন্টেন্ট স্টুডিওতে যান
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 7: SEO & SOCIAL */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'seo' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Search className="w-4 h-4 text-emerald-600" />
                  <span>সার্চ ইঞ্জিন অপটিমাইজেশন (SEO Metadata & Social Sharing)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ইউআরএল স্ল্যাগ (URL Slug) *</label>
                    <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:ring-1 focus-within:ring-emerald-600">
                      <span className="px-3 py-2 text-xs font-semibold text-slate-400 bg-slate-50 border-r border-slate-200">
                        /jobs/
                      </span>
                      <input
                        type="text"
                        value={formData.slug || ''}
                        placeholder={formData.id}
                        onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="w-full px-3 py-2 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ক্যানোনিকাল ইউআরএল (Canonical URL)</label>
                    <input
                      type="text"
                      value={formData.canonicalUrl || ''}
                      onChange={(e) => updateField('canonicalUrl', e.target.value)}
                      placeholder="https://chakrisheba.com/jobs/custom-slug"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">কাস্টম এসইও মেটা টাইটেল (SEO Title)</label>
                    <span className={`text-[11px] font-bold ${(formData.seoTitle || '').length > 60 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {(formData.seoTitle || '').length} / ৬০ বর্ণ (প্রস্তাবিত)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.seoTitle || ''}
                    placeholder={`${formData.title || ''} - ${formData.organization || ''} নিয়োগ বিজ্ঞপ্তি ২০২৬ | চাকরি সেবা`}
                    onChange={(e) => updateField('seoTitle', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">কাস্টম মেটা ডেসক্রিপশন (Meta Description)</label>
                    <span className={`text-[11px] font-bold ${(formData.seoDescription || '').length > 160 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {(formData.seoDescription || '').length} / ১৬০ বর্ণ (প্রস্তাবিত)
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.seoDescription || ''}
                    placeholder={`${formData.organization || ''}-এ ${formData.title || ''} পদে নতুন নিয়োগ বিজ্ঞপ্তি প্রকাশ। মোট পদ: ${formData.totalPosts || 1}টি, শেষ সময়: ${formData.deadline || ''}। বিস্তারিত দেখুন...`}
                    onChange={(e) => updateField('seoDescription', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Previews: Google SERP & Social Share */}
                <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Google Snippet */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Google SERP Preview</span>
                    <div className="space-y-0.5">
                      <div className="text-[11px] text-slate-600 flex items-center gap-1 truncate">
                        <span className="font-semibold text-slate-800">চাকরি সেবা</span>
                        <span className="text-slate-400">›</span>
                        <span className="text-slate-500">https://chakrisheba.com/jobs/{formData.slug || formData.id}</span>
                      </div>
                      <h4 className="text-sm font-bold text-blue-700 line-clamp-1">
                        {formData.seoTitle?.trim() || `${formData.title} - ${formData.organization} নিয়োগ বিজ্ঞপ্তি ২০২৬ | চাকরি সেবা`}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {formData.seoDescription?.trim() || `${formData.organization}-এ ${formData.title} পদে নতুন নিয়োগ বিজ্ঞপ্তি। মোট পদ: ${formData.totalPosts}টি। বিস্তারিত দেখুন...`}
                      </p>
                    </div>
                  </div>

                  {/* Social Share Preview */}
                  <div className="bg-[#f0f2f5] p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Social Share Preview (WhatsApp / FB)</span>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                      <div className="h-16 bg-gradient-to-r from-emerald-700 to-teal-800 flex items-center justify-center text-white px-3 text-center">
                        <span className="font-bold text-xs truncate">{formData.organization} | {formData.title}</span>
                      </div>
                      <div className="p-3 space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">chakrisheba.com</span>
                        <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{formData.seoTitle || formData.title}</h5>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{formData.seoDescription || 'নিয়োগ বিজ্ঞপ্তির সম্পূর্ণ বিবরণী।'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 8: MEDIA & IMAGES */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'media' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>বিজ্ঞপ্তির ছবি ও মিডিয়া গ্যালারি (Circular Media)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">মূল সার্কুলার / ব্যানার ছবি (Circular Image URL)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.circularImage || ''}
                        onChange={(e) => updateField('circularImage', e.target.value)}
                        placeholder="https://images.unsplash.com/... বা /uploads/circulars/..."
                        className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                      />
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0">
                        <Upload className="w-4 h-4 text-emerald-700" />
                        <span>{uploadingField === 'circularImage' ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'circularImage', 'image')}
                          disabled={uploadingField === 'circularImage'}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-slate-700 block mb-1">প্রতিষ্ঠানের লোগো (Organization Logo URL)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.logo || ''}
                        onChange={(e) => updateField('logo', e.target.value)}
                        placeholder="https://.../logo.png বা /uploads/logos/..."
                        className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                      />
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0">
                        <Upload className="w-4 h-4 text-emerald-700" />
                        <span>{uploadingField === 'logo' ? 'আপলোড হচ্ছে...' : 'লোগো আপলোড'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'logo', 'logo')}
                          disabled={uploadingField === 'logo'}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Image Previews */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">মূল ছবির প্রিভিউ:</span>
                    <div className="w-full h-64 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                      {formData.circularImage ? (
                        <img
                          src={formData.circularImage}
                          alt={formData.title || 'Circular'}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">ছবি প্রদান করা হয়নি</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">লোগোর প্রিভিউ:</span>
                    <div className="w-32 h-32 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center p-2">
                      {formData.logo ? (
                        <img
                          src={formData.logo}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">লোগো নেই</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 9: VERIFICATION & EVIDENCE */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'verification' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ভেরিফিকেশন ও তথ্য প্রমাণ (Verification & Evidence Review)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleManualVerifyBypass}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>সরাসরি অফিসিয়াল সত্যায়িত করুন (Manual Verify Bypass)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ভেরিফিকেশন স্ট্যাটাস</label>
                    <select
                      value={formData.verificationStatus || 'MANUAL_ENTERED'}
                      onChange={(e) => updateField('verificationStatus', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none font-bold"
                    >
                      <option value="MANUAL_ENTERED">MANUAL_ENTERED (ম্যানুয়ালি প্রবেশকৃত)</option>
                      <option value="VERIFIED">VERIFIED (অফিসিয়াল সত্যায়িত)</option>
                      <option value="SOURCE_REVIEWED">SOURCE_REVIEWED (সোর্স নিরীক্ষিত)</option>
                      <option value="MANUAL_CORRECTED">MANUAL_CORRECTED (সংশোধিত)</option>
                      <option value="AI_EXTRACTED">AI_EXTRACTED (এআই এক্সট্রাক্ট)</option>
                      <option value="UNVERIFIED">UNVERIFIED (অযাচাইকৃত)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">কনফিডেন্স স্কোর (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.verificationConfidence ?? 100}
                      onChange={(e) => updateField('verificationConfidence', Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">সর্বশেষ যাচাইয়ের সময়</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.lastVerifiedAt || 'নির্ধারিত হয়নি'}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ভেরিফিকেশন নোট ও প্রমাণপত্র মন্তব্য (Reviewer Notes)</label>
                  <textarea
                    rows={3}
                    value={formData.verificationNotes || ''}
                    onChange={(e) => updateField('verificationNotes', e.target.value)}
                    placeholder="অফিসিয়াল সার্কুলার গেজেট বা মূল সার্কুলার হতে যাচাইকৃত তথ্যের কোনো বিশেষ মন্তব্য থাকলে লিখুন..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 10: PUBLISHING & LIFECYCLE */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'publishing' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>পাবলিশিং লাইফসাইকেল ও নিয়ন্ত্রণ (Publishing Controls)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">সার্কুলার লাইফসাইকেল স্ট্যাটাস</label>
                    <select
                      value={formData.status || 'published'}
                      onChange={(e) => updateField('status', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none font-bold"
                    >
                      <option value="published">published (সক্রিয় / লাইভ)</option>
                      <option value="draft">draft (খসড়া)</option>
                      <option value="pending_review">pending_review (পর্যালোচনাধীন)</option>
                      <option value="approved">approved (অনুমোদিত)</option>
                      <option value="expired">expired (মেয়াদ শেষ)</option>
                      <option value="closed">closed (আবেদন বন্ধ)</option>
                      <option value="archived">archived (আর্কাইভকৃত)</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-3 sm:pt-4">
                    <label className="relative flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(formData.featured)}
                        onChange={(e) => updateField('featured', e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                      />
                      <span className="text-xs font-bold text-slate-800">ফিচার্ড সার্কুলার (Homepage Featured)</span>
                    </label>
                  </div>
                  <div className="flex items-center pt-3 sm:pt-4">
                    <label className="relative flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={Boolean(formData.isHot)}
                        onChange={(e) => updateField('isHot', e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                      />
                      <span className="text-xs font-bold text-slate-800">জরুরি সার্কুলার (Urgent / Hot Badge)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSave('published')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>সরাসরি পাবলিশ করুন</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave('draft')}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>খসড়া (Draft) হিসেবে সেভ করুন</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSave('archived')}
                      className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <span>আর্কাইভ করুন</span>
                    </button>
                  </div>

                  {formData.id && onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`আপনি কি নিশ্চিত যে "${formData.title}" সার্কুলারটি সম্পূর্ণ মুছে ফেলতে চান?`)) {
                          onDelete(formData.id!, formData.title || '');
                          onClose();
                        }
                      }}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>সার্কুলার মুছে ফেলুন</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* TAB 11: HISTORY & AUDIT TRAIL */}
          {/* ------------------------------------------------------------ */}
          {activeTab === 'history' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-600" />
                    <span>প্রশাসনিক পরিবর্তন ও অডিট হিস্ট্রি (Revision Audit Trail)</span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500">
                    {(formData.revisionHistory || []).length} টি রিভিশন রেকর্ড
                  </span>
                </div>

                {(formData.revisionHistory && formData.revisionHistory.length > 0) ? (
                  <div className="space-y-3">
                    {formData.revisionHistory.map((rev, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            <span>অ্যাডমিন: {rev.adminId || 'SUPER_ADMIN'}</span>
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(rev.timestamp).toLocaleString('bn-BD')}
                          </span>
                        </div>
                        <p className="text-slate-700 font-semibold">{rev.summary}</p>
                        {rev.changedFields && rev.changedFields.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap pt-1">
                            <span className="text-[10px] text-slate-400">পরিবর্তিত ফিল্ডসমূহ:</span>
                            {rev.changedFields.map((f, fi) => (
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
                    এখনো কোনো পূর্ববর্তী রিভিশন হিস্ট্রি পাওয়া যায়নি। সংরক্ষণ করার পর স্বয়ংক্রিয়ভাবে অডিট লগ তৈরি হবে।
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
            <span>ক্যাটাগরি: <strong className="text-slate-800">{formData.categoryLabel}</strong></span>
            <span>•</span>
            <span>আবেদনের শেষ সময়: <strong className="text-slate-800">{formData.deadline}</strong></span>
            <span>•</span>
            <span>স্ট্যাটাস: <strong className="text-emerald-700">{formData.status}</strong></span>
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
      {/* LIVE PREVIEW MODAL */}
      {/* ============================================================== */}
      {showLivePreview && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>পাবলিক জব পেজ লাইভ প্রিভিউ</span>
              </span>
              <button onClick={() => setShowLivePreview(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div className="border-b pb-4">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {formData.categoryLabel} • {formData.grade}
                </span>
                <h1 className="text-xl font-black text-slate-900 mt-2">{formData.title}</h1>
                <p className="text-sm font-semibold text-slate-600">{formData.organization}</p>
              </div>

              {/* Specifications grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div><span className="text-slate-400 block">পদসংখ্যা:</span> <strong>{formData.totalPosts} টি</strong></div>
                <div><span className="text-slate-400 block">বেতন:</span> <strong>{formData.salary}</strong></div>
                <div><span className="text-slate-400 block">শিক্ষাগত যোগ্যতা:</span> <strong>{formData.minEducation}</strong></div>
                <div><span className="text-slate-400 block">আবেদনের শেষ তারিখ:</span> <strong className="text-rose-600">{formData.deadline}</strong></div>
              </div>

              {/* Bengali Description */}
              <div className="space-y-2">
                <h3 className="font-black text-slate-900 text-sm">বিজ্ঞপ্তির বিস্তারিত বিবরণী</h3>
                {formData.bengaliDescription ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                    {formData.bengaliDescription}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">কোনো বিবরণী লেখা হয়নি।</p>
                )}
              </div>

              {/* Bulleted Requirements */}
              {formData.requirements && formData.requirements.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-black text-slate-900 text-sm">প্রয়োজনীয় শর্তাবলী</h3>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {formData.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-100 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setShowLivePreview(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                প্রিভিউ বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
