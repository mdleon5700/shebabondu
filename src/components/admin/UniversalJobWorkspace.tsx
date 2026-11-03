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
  Table as TableIcon,
  ArrowRight,
  Columns,
  ArrowLeft
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
  | 'positions'
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
  const [viewMode, setViewMode] = useState<'editor' | 'split'>('editor');

  // Smart Auto-Fill Generator (AI / Helper Engine)
  const handleSmartAutoFill = () => {
    if (!formData.title?.trim() && !formData.organization?.trim()) {
      setSaveError('স্মার্ট অটো-ফিল করার জন্য অন্তত প্রতিষ্ঠানের নাম অথবা পদের নাম লিখুন।');
      return;
    }

    const org = formData.organization?.trim() || 'বাংলাদেশ সরকারি প্রতিষ্ঠান';
    const rawTitle = formData.title?.trim() || 'বিভিন্ন পদে কর্মকর্তা';
    const grade = formData.grade || '৯ম গ্রেড';
    const edu = formData.minEducation || 'স্নাতক (সম্মান) বা সমমানের ডিগ্রি';

    const cleanOrg = org.replace(/নিয়োগ বিজ্ঞপ্তি.*/g, '').trim();
    const cleanTitle = rawTitle.replace(/নিয়োগ বিজ্ঞপ্তি.*/g, '').trim();

    const generatedTitle = `${cleanOrg}-এ ${cleanTitle} পদে বিশাল নিয়োগ বিজ্ঞপ্তি ২০২৬`;
    const cleanForSlug = (cleanOrg + '-' + cleanTitle)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const generatedSlug = cleanForSlug || `job-${Date.now().toString().slice(-6)}`;

    const seoTitle = `${cleanTitle} - ${cleanOrg} নিয়োগ বিজ্ঞপ্তি ২০২৬ | চাকরি সেবা`;
    const seoDescription = `${cleanOrg}-এ ${cleanTitle} পদে আকর্ষণীয় ক্যারিয়ারের সুযোগ। মোট পদসংখ্যা: ${formData.totalPosts || 1}টি, গ্রেড: ${grade}, শিক্ষাগত যোগ্যতা: ${edu}। আবেদনের শেষ সময়: ${formData.deadline || 'শীঘ্রই'}। অনলাইনে আবেদনের সঠিক নিয়ম ও শর্তাবলী জেনে চাকরি সেবায় আবেদন করুন।`;
    const seoKeywords = [cleanOrg, cleanTitle, 'সরকারি চাকরি ২০২৬', 'নিয়োগ বিজ্ঞপ্তি ২০২৬', 'bd jobs circular', 'online apply'];

    const defaultFaqs = [
      {
        question: `${cleanOrg}-এ কীভাবে অনলাইনে আবেদন করবেন?`,
        answer: `চাকরি সেবা ওয়েবসাইটের মাধ্যমে অথবা সংশ্লিষ্ট অফিসিয়াল পোর্টাল (${formData.officialLink || 'অনলাইন পোর্টাল'}) থেকে নির্ধারিত আবেদন ফরম পূরণ করে আবেদন করতে পারবেন। প্রার্থীরা চাকরি সেবার অনলাইন আবেদন সহায়তার মাধ্যমেও ঘরে বসে নির্ভুল আবেদন সম্পন্ন করতে পারেন।`
      },
      {
        question: 'আবেদনের শেষ তারিখ ও সময় কবে?',
        answer: `এই বিজ্ঞপ্তিতে অনলাইনে আবেদনপত্র দাখিল ও ফি জমাদানের শেষ তারিখ ${formData.deadline || 'বিজ্ঞপ্তিতে উল্লেখিত তারিখ'} বিকেল ৫:০০ টা পর্যন্ত। শেষ সময়ের পূর্বেই আবেদন সম্পন্ন করার পরামর্শ দেওয়া হলো।`
      },
      {
        question: 'আবেদন ফি কত টাকা এবং কীভাবে পরিশোধ করবেন?',
        answer: `সরকারি পরীক্ষার ফি বাবদ ${formData.govtFee || 200} টাকা এবং প্ল্যাটফর্ম সার্ভিস চার্জ বাবদ ${formData.serviceFee || 80} টাকা প্রযোজ্য। টেলিটক প্রি-পেইড সিম, বিকাশ বা নগদ মোবাইল ব্যাংকিংয়ের মাধ্যমে ফি পরিশোধ করা যাবে।`
      }
    ];

    const defaultDocs = [
      'জাতীয় পরিচয়পত্র (NID) অথবা অনলাইন জন্মনিবন্ধন সনদ',
      'সম্প্রতি তোলা পাসপোর্ট সাইজের রঙিন ছবি (৩০০x৩০০ পিক্সেল, ১০০ কেবি)',
      'স্বাক্ষরের স্পষ্ট স্ক্যান কপি (৩০০x৮০ পিক্সেল, ৬০ কেবি)',
      'সকল শিক্ষাগত যোগ্যতার মূল বা সাময়িক সনদপত্র',
      'প্রযোজ্য ক্ষেত্রে কোটা ও নাগরিকত্ব সনদপত্র'
    ];

    const defaultRequirements = (formData.requirements && formData.requirements.length > 0)
      ? formData.requirements
      : [
          `${edu} ডিগ্রি থাকতে হবে`,
          `বয়সসীমা: ${formData.minAge || 18} থেকে ${formData.maxAge || 32} বছর`,
          'কম্পিউটার পরিচালনায় এবং বাংলা ও ইংরেজি টাইপিংয়ে প্রয়োজনীয় দক্ষতা',
          'বাংলাদেশের সকল জেলার নাগরিকগণ আবেদন করতে পারবেন (বিজ্ঞপ্তির শর্তসাপেক্ষে)'
        ];

    const defaultSummary = formData.bengaliDescription || `${cleanOrg} সম্প্রতি তাদের প্রশাসনিক ও কারিগরি কার্যক্রম পরিচালনার সুবিধার্থে ${cleanTitle} পদে জনবল নিয়োগের জন্য অফিসিয়াল নিয়োগ বিজ্ঞপ্তি ২০২৬ প্রকাশ করেছে। আগ্রহী ও যোগ্য প্রার্থীদের নির্ধারিত সময়ের মধ্যে অনলাইনে আবেদন ফরম পূরণ ও পরীক্ষা ফি পরিশোধের আহ্বান জানানো যাচ্ছে। সম্পূর্ণ নিয়োগ বিজ্ঞপ্তি, পদের বিবরণ, শিক্ষাগত যোগ্যতা ও আবেদন পদ্ধতি নিচে বিস্তারিত উল্লেখ করা হলো।`;

    setFormData(prev => ({
      ...prev,
      title: generatedTitle,
      slug: prev.slug || generatedSlug,
      seoTitle: prev.seoTitle || seoTitle,
      seoDescription: prev.seoDescription || seoDescription,
      seoKeywords: (prev.seoKeywords && prev.seoKeywords.length > 0) ? prev.seoKeywords : seoKeywords,
      faqItems: (prev.faqItems && prev.faqItems.length > 0) ? prev.faqItems : defaultFaqs,
      documentsRequired: (prev.documentsRequired && prev.documentsRequired.length > 0) ? prev.documentsRequired : defaultDocs,
      requirements: defaultRequirements,
      bengaliDescription: defaultSummary,
      govtFee: prev.govtFee || 200,
      serviceFee: prev.serviceFee || 80,
      salary: prev.salary || '২২,০০০ - ৫৩,০৬০ টাকা',
      grade: prev.grade || grade,
      minEducation: prev.minEducation || edu,
      districts: prev.districts || 'সকল জেলা'
    }));

    setSaveSuccessToast('✨ স্মার্ট অটো-ফিল সফল! সাধারণ তথ্য, এসইও মেটা, এফএকিউ এবং শর্তাবলী স্বয়ংক্রিয়ভাবে পূর্ণ হয়েছে।');
    setTimeout(() => setSaveSuccessToast(null), 4000);
  };

  // Completeness score
  const completenessItems = useMemo(() => [
    { key: 'title', label: 'শিরোনাম', done: Boolean(formData.title?.trim()) },
    { key: 'org', label: 'প্রতিষ্ঠান', done: Boolean(formData.organization?.trim()) },
    { key: 'edu', label: 'শিক্ষাগত যোগ্যতা', done: Boolean(formData.minEducation?.trim()) },
    { key: 'salary', label: 'বেতন স্কেল', done: Boolean(formData.salary?.trim()) },
    { key: 'deadline', label: 'ডেডলাইন', done: Boolean(formData.deadline?.trim()) },
    { key: 'fee', label: 'আবেদন ফি', done: Number(formData.govtFee) > 0 },
    { key: 'link', label: 'আবেদন লিংক', done: Boolean(formData.officialLink?.trim()) },
    { key: 'seo', label: 'এসইও মেটা', done: Boolean(formData.seoTitle?.trim()) }
  ], [formData]);

  const completedCount = completenessItems.filter(i => i.done).length;
  const completionPercentage = Math.round((completedCount / completenessItems.length) * 100);

  // Tabs configuration with completion state
  const TABS_CONFIG = useMemo(() => [
    { id: 'overview' as WorkspaceTab, label: 'সারসংক্ষেপ', icon: LayoutDashboard, isDone: true },
    { id: 'details' as WorkspaceTab, label: 'মূল তথ্য', icon: FileText, isDone: Boolean(formData.title?.trim() && formData.organization?.trim()) },
    { id: 'positions' as WorkspaceTab, label: `পদ ও বেতন (${(formData.positions || []).length || 1})`, icon: Layers, isDone: Boolean(formData.salary?.trim()) },
    { id: 'eligibility' as WorkspaceTab, label: 'যোগ্যতা ও শর্তাবলী', icon: GraduationCap, isDone: Boolean(formData.minEducation?.trim()) },
    { id: 'application' as WorkspaceTab, label: 'আবেদন ও ফি', icon: Send, isDone: Boolean(formData.officialLink?.trim() && formData.deadline?.trim()) },
    { id: 'circular' as WorkspaceTab, label: 'সার্কুলার ও সোর্স', icon: FileCode, isDone: Boolean(formData.circularPdfUrl || formData.circularImage) },
    { id: 'content' as WorkspaceTab, label: 'বিবরণী ও কন্টেন্ট', icon: PenTool, isDone: Boolean(formData.bengaliDescription?.trim()) },
    { id: 'seo' as WorkspaceTab, label: 'এসইও ও মেটা', icon: Search, isDone: Boolean(formData.seoTitle?.trim()) },
    { id: 'media' as WorkspaceTab, label: 'মিডিয়া ও ছবি', icon: ImageIcon, isDone: Boolean(formData.logo) },
    { id: 'verification' as WorkspaceTab, label: 'ভেরিফিকেশন', icon: ShieldCheck, isDone: Boolean(formData.verificationStatus) },
    { id: 'publishing' as WorkspaceTab, label: 'পাবলিশিং', icon: Globe, isDone: Boolean(formData.status) },
    { id: 'history' as WorkspaceTab, label: 'হিস্ট্রি ও অডিট', icon: History, isDone: true }
  ], [formData]);

  const currentTabIndex = TABS_CONFIG.findIndex(t => t.id === activeTab);
  const prevTab = currentTabIndex > 0 ? TABS_CONFIG[currentTabIndex - 1] : null;
  const nextTab = currentTabIndex < TABS_CONFIG.length - 1 ? TABS_CONFIG[currentTabIndex + 1] : null;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Organization Autocomplete state
  const [orgSuggestions, setOrgSuggestions] = useState<Array<{
    name: string;
    nameBn?: string;
    logo: string;
    orgType: string;
    category: string;
    website: string;
    activeJobsCount: number;
    slug: string;
  }>>([]);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [orgFilterQuery, setOrgFilterQuery] = useState('');

  // Fetch organization suggestions on mount
  useEffect(() => {
    if (isOpen) {
      fetch('/api/organizations/suggestions')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.organizations)) {
            setOrgSuggestions(data.organizations);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Filtered org suggestions
  const filteredOrgSuggestions = useMemo(() => {
    const q = (formData.organization || orgFilterQuery || '').trim().toLowerCase();
    if (!q) return orgSuggestions.slice(0, 10);
    return orgSuggestions.filter(item => 
      item.name.toLowerCase().includes(q) ||
      (item.nameBn && item.nameBn.toLowerCase().includes(q)) ||
      item.orgType.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [orgSuggestions, formData.organization, orgFilterQuery]);

  // Standard BD Pay Scale 2015 Presets
  const GOVT_GRADE_PRESETS = [
    { grade: '৯ম গ্রেড', salary: '২২,০০০ - ৫৩,০৬০ টাকা', defaultFee: 223, minEdu: 'স্নাতক বা সমমান' },
    { grade: '১০ম গ্রেড', salary: '১৬,০০০ - ৩৮,৬৪০ টাকা', defaultFee: 112, minEdu: 'স্নাতক বা ডিপ্লোমা' },
    { grade: '১১তম গ্রেড', salary: '১২,৫০০ - ৩০,২৩০ টাকা', defaultFee: 112, minEdu: 'স্নাতক / এইচএসসি' },
    { grade: '১২তম গ্রেড', salary: '১১,৩০০ - ২৭,৩০০ টাকা', defaultFee: 112, minEdu: 'এইচএসসি বা সমমান' },
    { grade: '১৩তম গ্রেড', salary: '১১,০০০ - ২৬,৫৯০ টাকা', defaultFee: 112, minEdu: 'এইচএসসি বা সমমান' },
    { grade: '১৪তম গ্রেড', salary: '১০,২০০ - ২৪,৬৮০ টাকা', defaultFee: 112, minEdu: 'এইচএসসি বা সমমান' },
    { grade: '১৫তম গ্রেড', salary: '৯,৭০০ - ২৩,৪৯০ টাকা', defaultFee: 112, minEdu: 'এইচএসসি বা সমমান' },
    { grade: '১৬তম গ্রেড', salary: '৯,৩০০ - ২২,৪৯০ টাকা', defaultFee: 112, minEdu: 'এসএসসি বা সমমান' },
    { grade: '২০তম গ্রেড', salary: '৮,২৫০ - ২০,০১০ টাকা', defaultFee: 56, minEdu: 'এসএসসি বা ৮ম শ্রেণি' }
  ];

  // Deadline Quick Calculator Shortcut
  const calculateDeadlinePreset = (daysFromNow: number | 'endOfMonth') => {
    const now = new Date();
    let targetDate: Date;
    if (daysFromNow === 'endOfMonth') {
      targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      targetDate = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
    }
    
    const bnMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    const dayBn = String(targetDate.getDate()).padStart(2, '0').replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);
    const monthBn = bnMonths[targetDate.getMonth()];
    const yearBn = String(targetDate.getFullYear()).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);
    
    const formattedBn = `${dayBn} ${monthBn} ${yearBn}`;
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    updateField('deadline', formattedBn);
    updateField('daysRemaining', diffDays);
  };

  // Helper to sync positions and totalPosts
  const handlePositionsChange = (newPositions: JobPosition[]) => {
    updateField('positions', newPositions);
    if (newPositions.length > 0) {
      const total = newPositions.reduce((sum, p) => sum + (Number(p.posts) || 1), 0);
      updateField('totalPosts', total);
      if (newPositions.length === 1) {
        if (newPositions[0].grade) updateField('grade', newPositions[0].grade);
        if (newPositions[0].salary) updateField('salary', newPositions[0].salary);
        if (newPositions[0].govtFee) updateField('govtFee', newPositions[0].govtFee);
      }
    }
  };

  // Helper to add position from preset
  const handleAddPresetPosition = (preset: typeof GOVT_GRADE_PRESETS[0]) => {
    const currentList = formData.positions || [];
    const newP: JobPosition = {
      title: `${preset.grade} পদ`,
      grade: preset.grade,
      posts: 1,
      salary: preset.salary,
      minEducation: preset.minEdu,
      govtFee: preset.defaultFee
    };
    handlePositionsChange([...currentList, newP]);
  };

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
      <div className={`bg-white rounded-3xl w-full transition-all duration-200 flex flex-col shadow-2xl border border-slate-200 overflow-hidden ${viewMode === 'split' ? 'max-w-[98vw] h-[96vh]' : 'max-w-7xl h-[95vh]'}`}>

        
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
              <div className="flex items-center gap-2 mt-1">
                <h2 className="text-base font-black text-slate-100 truncate">
                  {isNew 
                    ? (formData.title ? `✨ নতুন: ${formData.organization || ''} — ${formData.title}` : '✨ নতুন নিয়োগ বিজ্ঞপ্তি তৈরি করুন')
                    : (formData.title ? `✏️ সম্পাদনা: ${formData.organization || ''} — ${formData.title}` : '✏️ সার্কুলার সম্পাদনা')
                  }
                </h2>
                <div className={`hidden sm:flex text-[11px] font-bold px-2.5 py-0.5 rounded-md items-center gap-1.5 ${
                  completionPercentage === 100 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  <span>${completedCount}/${completenessItems.length} সম্পন্ন</span>
                  <span className="font-mono">(${completionPercentage}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* One-Click Smart Auto-Fill */}
            <button
              type="button"
              onClick={handleSmartAutoFill}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="পদবী ও প্রতিষ্ঠান অনুযায়ী এসইও, বিবরণ ও এফএকিউ স্বয়ংক্রিয়ভাবে পূর্ণ করুন"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">স্মার্ট অটো-ফিল</span>
            </button>

            {/* Split Screen Live Preview Toggle */}
            <button
              type="button"
              onClick={() => setViewMode(prev => prev === 'split' ? 'editor' : 'split')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="রিয়েল-টাইম স্প্লিট প্রিভিউ চালু/বন্ধ করুন"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{viewMode === 'split' ? 'স্প্লিট মোড চালু' : 'স্প্লিট প্রিভিউ'}</span>
            </button>

            {/* Full Preview Modal Button */}
            <button
              type="button"
              onClick={() => setShowLivePreview(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="পাবলিক পেজের মতো ফুল প্রিভিউ দেখুন"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>প্রিভিউ</span>
            </button>

            {/* Save as Draft Button */}
            <button
              type="button"
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="খসড়া হিসেবে ড্রাফটে সংরক্ষণ করুন"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">ড্রাফট সেভ</span>
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
        <div className="px-4 sm:px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-thin text-xs sm:text-sm">
          {TABS_CONFIG.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer text-xs sm:text-sm ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.isDone && !isActive && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* 3. TAB CONTENT PANELS (SCROLLABLE BODY) */}
        {/* ============================================================== */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Form Tab Panels Column (60% when Split) */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/50 space-y-6 ${viewMode === 'split' ? 'lg:w-[60%] border-r border-slate-200' : 'w-full'}`}>
          
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
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        প্রতিষ্ঠানের নাম (Organization) *
                      </label>
                      <span className="text-[11px] font-semibold text-emerald-700">
                        ⚡ অটো-সাজেস্ট ড্রপডাউন
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.organization || ''}
                        onChange={(e) => {
                          updateField('organization', e.target.value);
                          setOrgFilterQuery(e.target.value);
                          setShowOrgDropdown(true);
                        }}
                        onFocus={() => setShowOrgDropdown(true)}
                        placeholder="যেমন: বাংলাদেশ ব্যাংক, CPGCBL, APSCL, জেলা প্রশাসন"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                      />
                      <Building2 className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>

                    {/* Autocomplete Dropdown */}
                    {showOrgDropdown && filteredOrgSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-72 overflow-y-auto divide-y divide-slate-100 animate-in fade-in">
                        <div className="p-2.5 bg-slate-50 text-[11px] font-bold text-slate-600 flex items-center justify-between border-b border-slate-200">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>তালিকাভুক্ত প্রতিষ্ঠানসমূহ ({filteredOrgSuggestions.length} টি পাওয়া গেছে):</span>
                          </span>
                          <button 
                            type="button" 
                            onClick={() => setShowOrgDropdown(false)} 
                            className="text-slate-400 hover:text-slate-700 font-bold px-1.5 py-0.5 rounded hover:bg-slate-200"
                          >
                            ✕ বন্ধ
                          </button>
                        </div>
                        {filteredOrgSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onMouseDown={() => {
                              updateField('organization', item.name);
                              if (item.logo) updateField('logo', item.logo);
                              if (item.orgType) updateField('orgType', item.orgType);
                              if (item.category) updateField('category', item.category);
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
                              if (item.category && labelMap[item.category]) {
                                updateField('categoryLabel', labelMap[item.category]);
                              }
                              if (item.website && (!formData.officialLink || formData.officialLink.includes('teletalk.com.bd'))) {
                                updateField('officialLink', item.website);
                              }
                              setShowOrgDropdown(false);
                            }}
                            className="p-2.5 hover:bg-emerald-50/90 cursor-pointer flex items-center justify-between gap-3 transition-colors text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                                <img src={item.logo} alt={item.name} className="w-full h-full object-contain" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate">{item.name}</div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                                  <span>{item.orgType}</span>
                                  {item.activeJobsCount > 0 && (
                                    <span className="text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.2 rounded">
                                      {item.activeJobsCount} টি চলমান সার্কুলার
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-[11px] text-emerald-700 font-bold shrink-0">
                              অটো-ফিল ↵
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selected Org Logo Preview & Directory Shortcut */}
                    {formData.organization && (
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200 mt-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-md bg-white border border-slate-200 p-0.5 overflow-hidden shrink-0">
                            <img src={formData.logo || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=120&q=80'} alt="Logo" className="w-full h-full object-contain" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-800 truncate">
                            লোগো ও টাইপ সংযুক্ত
                          </span>
                        </div>
                        <Link
                          href={`/organizations/${encodeURIComponent(formData.organization)}`}
                          target="_blank"
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 shrink-0"
                        >
                          <span>সকল সার্কুলার দেখুন</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 block">বেতন গ্রেড (Pay Grade)</label>
                      <span className="text-[10px] text-slate-400">স্কেল প্রিসেট</span>
                    </div>
                    <select
                      value={formData.grade || '৯ম গ্রেড'}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateField('grade', val);
                        const match = GOVT_GRADE_PRESETS.find(p => p.grade === val);
                        if (match) updateField('salary', match.salary);
                      }}
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 block">আবেদনের শেষ তারিখ (Deadline) *</label>
                      <div className="flex items-center gap-1 text-[10px]">
                        <button type="button" onClick={() => calculateDeadlinePreset(7)} className="px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 rounded font-bold cursor-pointer">+৭ দিন</button>
                        <button type="button" onClick={() => calculateDeadlinePreset(15)} className="px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 rounded font-bold cursor-pointer">+১৫ দিন</button>
                        <button type="button" onClick={() => calculateDeadlinePreset(21)} className="px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 rounded font-bold cursor-pointer">+২১ দিন</button>
                        <button type="button" onClick={() => calculateDeadlinePreset(30)} className="px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 rounded font-bold cursor-pointer">+৩০ দিন</button>
                        <button type="button" onClick={() => calculateDeadlinePreset('endOfMonth')} className="px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 rounded font-bold cursor-pointer">মাসের শেষ</button>
                      </div>
                    </div>
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

              {/* Positions Quick Jump Banner */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                      পদবী ও পদভিত্তিক সুযোগ-সুবিধা মেট্রিক্স (Positions Matrix)
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      এই বিজ্ঞপ্তিতে মোট {(formData.positions || []).length} টি পদ এবং {formData.totalPosts || 1} টি শূন্যপদ সংজ্ঞায়িত রয়েছে।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('positions')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-2xs"
                >
                  <span>পদ ও বেতন মেট্রিক্স কনফিগার করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          
          {activeTab === 'positions' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              
              {/* Header & Stats Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-3xl border border-emerald-900/50 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider inline-flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>মাল্টি-পজিশন মেট্রিক্স ইঞ্জিন (Multi-Position Matrix)</span>
                    </span>
                    <h3 className="text-xl font-black text-white mt-2">
                      পদবী, শূন্যপদ, বেতন গ্রেড ও পদভিত্তিক ফি কনফিগারেশন
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      একই সার্কুলারে ভিন্ন ভিন্ন পদের জন্য আলাদা পদসংখ্যা, বেতন গ্রেড, স্কেল ও টেলিটক আবেদন ফি এক জায়গায় ম্যানেজ করুন।
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.positions || [];
                        const newP: JobPosition = {
                          title: `নতুন পদ ${current.length + 1}`,
                          grade: '৯ম গ্রেড',
                          posts: 1,
                          salary: '২২,০০০ - ৫৩,০৬০ টাকা',
                          minEducation: 'স্নাতক বা সমমান',
                          govtFee: 223
                        };
                        handlePositionsChange([...current, newP]);
                      }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>নতুন পদ যোগ করুন</span>
                    </button>
                  </div>
                </div>

                {/* Aggregate Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 block">মোট পদবী</span>
                    <span className="text-lg font-black text-white">{(formData.positions || []).length} টি</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 block">মোট শূন্যপদ (Auto-Sync)</span>
                    <span className="text-lg font-black text-emerald-400">{formData.totalPosts || 1} জন</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 block">সরকারি ফি পরিসর</span>
                    <span className="text-lg font-black text-amber-300">
                      ৳{formData.positions && formData.positions.length > 0 
                        ? Math.min(...formData.positions.map(p => p.govtFee ?? formData.govtFee ?? 200))
                        : (formData.govtFee || 200)
                      } 
                      {formData.positions && formData.positions.length > 1 && Math.min(...formData.positions.map(p => p.govtFee ?? formData.govtFee ?? 200)) !== Math.max(...formData.positions.map(p => p.govtFee ?? formData.govtFee ?? 200))
                        ? ` - ৳${Math.max(...formData.positions.map(p => p.govtFee ?? formData.govtFee ?? 200))}`
                        : ''
                      }
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 block">টেলিটক মোট ফি (চার্জসহ)</span>
                    <span className="text-lg font-black text-blue-300">
                      ৳{(formData.positions && formData.positions.length > 0 
                        ? Math.min(...formData.positions.map(p => p.govtFee ?? formData.govtFee ?? 200))
                        : (formData.govtFee || 200)) + (formData.serviceFee || 80)
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Grade Presets Bar */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2.5">
                <span className="text-xs font-bold text-slate-700 block">
                  ⚡ ১-ক্লিকে জাতীয় বেতন স্কেল ২০১৫ পদ যোগ করুন:
                </span>
                <div className="flex flex-wrap gap-2">
                  {GOVT_GRADE_PRESETS.map((preset) => (
                    <button
                      key={preset.grade}
                      type="button"
                      onClick={() => handleAddPresetPosition(preset)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-emerald-600" />
                      <span>{preset.grade}</span>
                      <span className="text-[10px] text-slate-500">({preset.salary.split(' ')[0]} | ফি ৳{preset.defaultFee})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Positions List */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>পদবী তালিকা ও স্পেসিফিকেশন ({(formData.positions || []).length} টি পদ)</span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500">
                    প্রতিটি পদের তথ্য ও ফি এখানে সরাসরি পরিবর্তন করুন
                  </span>
                </div>

                {(formData.positions && formData.positions.length > 0) ? (
                  <div className="space-y-4">
                    {formData.positions.map((pos, pIdx) => {
                      const pFee = pos.govtFee ?? formData.govtFee ?? 200;
                      return (
                        <div 
                          key={pIdx} 
                          className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3 relative group hover:border-emerald-300 transition-all"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {pIdx + 1}
                              </span>
                              <span className="font-black text-sm text-slate-900">
                                {pos.title || `পদ ${pIdx + 1}`}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Clone Button */}
                              <button
                                type="button"
                                title="এই পদটি ক্লোন করুন"
                                onClick={() => {
                                  const current = formData.positions || [];
                                  const cloned: JobPosition = { ...pos, title: `${pos.title} (কপি)` };
                                  handlePositionsChange([...current, cloned]);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-white hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                <span>ক্লোন</span>
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                title="এই পদ মুছে ফেলুন"
                                onClick={() => {
                                  const updated = (formData.positions || []).filter((_, i) => i !== pIdx);
                                  handlePositionsChange(updated);
                                }}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Editable Row Inputs */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 text-xs">
                            {/* Title */}
                            <div className="sm:col-span-4">
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">পদের নাম (Title) *</label>
                              <input
                                type="text"
                                value={pos.title}
                                onChange={(e) => {
                                  const updated = [...formData.positions!];
                                  updated[pIdx] = { ...updated[pIdx], title: e.target.value };
                                  handlePositionsChange(updated);
                                }}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 bg-white"
                              />
                            </div>

                            {/* Vacancies */}
                            <div className="sm:col-span-2">
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">পদসংখ্যা (Posts)</label>
                              <input
                                type="number"
                                min="1"
                                value={pos.posts || 1}
                                onChange={(e) => {
                                  const updated = [...formData.positions!];
                                  updated[pIdx] = { ...updated[pIdx], posts: Math.max(1, Number(e.target.value)) };
                                  handlePositionsChange(updated);
                                }}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 bg-white"
                              />
                            </div>

                            {/* Grade */}
                            <div className="sm:col-span-3">
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">বেতন গ্রেড (Grade)</label>
                              <select
                                value={pos.grade || '৯ম গ্রেড'}
                                onChange={(e) => {
                                  const gVal = e.target.value;
                                  const updated = [...formData.positions!];
                                  const match = GOVT_GRADE_PRESETS.find(p => p.grade === gVal);
                                  updated[pIdx] = { 
                                    ...updated[pIdx], 
                                    grade: gVal,
                                    salary: match ? match.salary : updated[pIdx].salary,
                                    govtFee: match ? match.defaultFee : updated[pIdx].govtFee
                                  };
                                  handlePositionsChange(updated);
                                }}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 bg-white"
                              >
                                {Array.from({ length: 20 }, (_, i) => `${i + 1}ম গ্রেড`).map(g => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                                <option value="নন-গ্রেড / চুক্তিভিত্তিক">নন-গ্রেড / চুক্তিভিত্তিক</option>
                              </select>
                            </div>

                            {/* Salary Scale */}
                            <div className="sm:col-span-3">
                              <label className="text-[11px] font-bold text-slate-600 block mb-1">বেতন স্কেল (Salary)</label>
                              <input
                                type="text"
                                value={pos.salary || ''}
                                onChange={(e) => {
                                  const updated = [...formData.positions!];
                                  updated[pIdx] = { ...updated[pIdx], salary: e.target.value };
                                  handlePositionsChange(updated);
                                }}
                                placeholder="যেমন: ২২,০০০ - ৫৩,০৬০ টাকা"
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-600 bg-white"
                              />
                            </div>

                            {/* Govt Fee with 1-click Preset chips */}
                            <div className="sm:col-span-6 bg-white p-2.5 rounded-xl border border-slate-200">
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[11px] font-bold text-slate-700">সরকারি আবেদন ফি (Govt Fee ৳)</label>
                                <div className="flex items-center gap-1 text-[10px]">
                                  <span className="text-slate-400">প্রিসেট:</span>
                                  {[223, 112, 56, 100, 0].map(feeVal => (
                                    <button
                                      key={feeVal}
                                      type="button"
                                      onClick={() => {
                                        const updated = [...formData.positions!];
                                        updated[pIdx] = { ...updated[pIdx], govtFee: feeVal };
                                        handlePositionsChange(updated);
                                      }}
                                      className={`px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                                        pFee === feeVal ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                      }`}
                                    >
                                      ৳{feeVal}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={pos.govtFee ?? 200}
                                  onChange={(e) => {
                                    const updated = [...formData.positions!];
                                    updated[pIdx] = { ...updated[pIdx], govtFee: Number(e.target.value) };
                                    handlePositionsChange(updated);
                                  }}
                                  className="w-32 px-2.5 py-1 text-xs rounded-lg border border-slate-300 font-bold text-slate-800"
                                />
                                <span className="text-[11px] text-slate-500">
                                  + টেলিটক চার্জ ৳{formData.serviceFee || 80} = <strong className="text-emerald-800 font-black">৳{(pos.govtFee ?? 200) + (formData.serviceFee || 80)}</strong>
                                </span>
                              </div>
                            </div>

                            {/* Min Education */}
                            <div className="sm:col-span-6 bg-white p-2.5 rounded-xl border border-slate-200">
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[11px] font-bold text-slate-700">শিক্ষাগত যোগ্যতা (Minimum Education)</label>
                                <div className="flex items-center gap-1 text-[10px]">
                                  {['স্নাতক', 'এইচএসসি', 'এসএসসি', 'ডিপ্লোমা'].map(eduTag => (
                                    <button
                                      key={eduTag}
                                      type="button"
                                      onClick={() => {
                                        const updated = [...formData.positions!];
                                        updated[pIdx] = { ...updated[pIdx], minEducation: `${eduTag} বা সমমান` };
                                        handlePositionsChange(updated);
                                      }}
                                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold cursor-pointer"
                                    >
                                      {eduTag}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <input
                                type="text"
                                value={pos.minEducation || ''}
                                onChange={(e) => {
                                  const updated = [...formData.positions!];
                                  updated[pIdx] = { ...updated[pIdx], minEducation: e.target.value };
                                  handlePositionsChange(updated);
                                }}
                                placeholder="যেমন: কোনো স্বীকৃত বিশ্ববিদ্যালয় হতে স্নাতক বা সমমান ডিগ্রি"
                                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 font-medium"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs space-y-2">
                    <p className="font-bold text-slate-700">এখনো কোনো নির্দিষ্ট পদ যোগ করা হয়নি।</p>
                    <p>সার্কুলারে একাধিক ভিন্ন ভিন্ন পদ, বেতন গ্রেড বা আবেদন ফি থাকলে উপরের স্ট্যান্ডার্ড প্রিসেট বা বাটনে ক্লিক করে যোগ করুন।</p>
                    <button
                      type="button"
                      onClick={() => handleAddPresetPosition(GOVT_GRADE_PRESETS[0])}
                      className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>৯ম গ্রেড পদ দিয়ে শুরু করুন</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
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

              {/* Positions Quick Jump Banner inside Eligibility */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                      পদবী ও পদভিত্তিক যোগ্যতা ও ফি মেট্রিক্স
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      পদভিত্তিক পৃথক শিক্ষাগত যোগ্যতা, অভিজ্ঞতা ও ফি &apos;পদ ও বেতন মেট্রিক্স&apos; ট্যাবে একত্রিত করা হয়েছে।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('positions')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>পদ ও বেতন মেট্রিক্সে যান</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 block">সরকারি আবেদন ফি (৳)</label>
                      <div className="flex items-center gap-1 text-[10px]">
                        {[223, 112, 56, 100, 0].map(feeVal => (
                          <button
                            key={feeVal}
                            type="button"
                            onClick={() => updateField('govtFee', feeVal)}
                            className="px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 rounded font-bold cursor-pointer"
                          >
                            ৳{feeVal}
                          </button>
                        ))}
                      </div>
                    </div>
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

                {/* Multi-Positions Fee Breakdown Table */}
                {formData.positions && formData.positions.length > 0 && (
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-700" />
                        <span>পদভিত্তিক নির্দিষ্ট ফি ও মোট চার্জ তালিকা ({formData.positions.length} টি পদ):</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setActiveTab('positions')}
                        className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
                      >
                        <span>পদ ও ফি মেট্রিক্স এডিট করুন</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs bg-white rounded-xl border border-emerald-100 overflow-hidden">
                        <thead className="bg-emerald-100/70 text-emerald-950 font-bold text-[11px]">
                          <tr>
                            <th className="p-2.5">পদের নাম</th>
                            <th className="p-2.5">গ্রেড</th>
                            <th className="p-2.5">পদসংখ্যা</th>
                            <th className="p-2.5">সরকারি ফি</th>
                            <th className="p-2.5">সার্ভিস চার্জ</th>
                            <th className="p-2.5">মোট ফি</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                          {formData.positions.map((pos, pIdx) => {
                            const pGovtFee = pos.govtFee ?? formData.govtFee ?? 200;
                            const pTotal = pGovtFee + (formData.serviceFee || 80);
                            return (
                              <tr key={pIdx} className="hover:bg-slate-50">
                                <td className="p-2.5 font-bold text-slate-900">{pos.title}</td>
                                <td className="p-2.5 text-slate-600">{pos.grade}</td>
                                <td className="p-2.5 font-bold text-emerald-800">{pos.posts} জন</td>
                                <td className="p-2.5 font-bold text-slate-800">৳{pGovtFee}</td>
                                <td className="p-2.5 text-slate-500">+৳{formData.serviceFee || 80}</td>
                                <td className="p-2.5 font-black text-emerald-700">৳{pTotal}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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

          {/* ============================================================== */}
          {/* STICKY BOTTOM WIZARD NAVIGATION BAR */}
          {/* ============================================================== */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            {prevTab ? (
              <button
                type="button"
                onClick={() => setActiveTab(prevTab.id)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>পূর্ববর্তী: {prevTab.label}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSave('draft')}
                disabled={isSaving}
                className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-all cursor-pointer"
              >
                খসড়া সেভ
              </button>
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>সংরক্ষণ করুন</span>
              </button>
              {nextTab && (
                <button
                  type="button"
                  onClick={() => setActiveTab(nextTab.id)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>পরবর্তী: {nextTab.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: REAL-TIME INTERACTIVE SPLIT PREVIEW */}
        {/* ============================================================== */}
        {viewMode === 'split' && (
          <div className="hidden lg:flex lg:w-[40%] bg-slate-100 flex-col border-l border-slate-200 overflow-y-auto shrink-0">
            <div className="sticky top-0 z-10 bg-slate-200/90 backdrop-blur-xs px-4 py-3 border-b border-slate-300/80 flex items-center justify-between text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-700" />
                <span>রিয়েল-টাইম পাবলিক প্রিভিউ</span>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                লাইভ সিঙ্কড
              </span>
            </div>

            <div className="p-4 space-y-5">
              {/* 1. Job Card Preview */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  ওয়েবসাইট কার্ড প্রিভিউ (Job Card Preview)
                </span>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      {formData.logo ? (
                        <img src={formData.logo} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {formData.categoryLabel || 'সরকারি চাকরি'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {formData.grade || '৯ম গ্রেড'}
                        </span>
                        {formData.featured && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white">
                            ফিচার্ড
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-slate-900 text-sm leading-snug line-clamp-2">
                        {formData.title || 'বিজ্ঞপ্তির শিরোনাম এখানে প্রদর্শিত হবে...'}
                      </h4>
                      <p className="text-xs text-slate-600 font-semibold mt-0.5">
                        {formData.organization || 'প্রতিষ্ঠানের নাম'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>মোট পদ: <strong className="text-slate-900">{formData.totalPosts || 1} টি</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{formData.salary || 'বেতন স্কেল'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{formData.minEducation || 'শিক্ষাগত যোগ্যতা'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span className="truncate">{formData.deadline ? `শেষ: ${formData.deadline}` : 'ডেডলাইন'}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium">
                      মোট ফি: <strong>৳{Number(formData.govtFee || 0) + Number(formData.serviceFee || 0)}</strong>
                    </span>
                    <span className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs">
                      আবেদন করুন →
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Public Details Snapshot */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  বিজ্ঞপ্তির পেজ স্নাপশট (Public Page Snapshot)
                </span>
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">
                      /jobs/{formData.slug || formData.id || 'slug'}
                    </span>
                    <h3 className="text-sm font-black text-slate-900">
                      {formData.seoTitle || formData.title || 'এসইও মেটা টাইটেল'}
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {formData.seoDescription || 'এসইও মেটা ডেসক্রিপশন...'}
                    </p>
                  </div>

                  {/* Fee Calculator Box */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">সরকারি ফি:</span>
                      <span className="font-bold text-slate-800">৳{formData.govtFee || 0}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">সার্ভিস ফি:</span>
                      <span className="font-bold text-slate-800">৳{formData.serviceFee || 0}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">মোট খরচ:</span>
                      <span className="font-black text-emerald-800">৳{Number(formData.govtFee || 0) + Number(formData.serviceFee || 0)}</span>
                    </div>
                  </div>

                  {/* Teletalk SMS format preview */}
                  {formData.smsPrefix && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <span className="font-bold block">টেলিটক SMS ফরম্যাট:</span>
                      <code className="bg-white px-2 py-1 rounded border border-emerald-300 font-mono font-bold block text-center">
                        {formData.smsPrefix} &lt;space&gt; USERID send to 16222
                      </code>
                    </div>
                  )}

                  {/* FAQs preview */}
                  {formData.faqItems && formData.faqItems.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-700 block">
                        সাধারণ জিজ্ঞাসা ({formData.faqItems.length}টি FAQ)
                      </span>
                      <div className="space-y-1.5">
                        {formData.faqItems.slice(0, 2).map((faq, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-slate-50 text-[11px] space-y-0.5 border border-slate-100">
                            <span className="font-bold text-slate-900 block">Q: {faq.question}</span>
                            <p className="text-slate-600 line-clamp-2">A: {faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
