'use client';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';


import DeadlineCountdown from '@/components/deadlines/DeadlineCountdown';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Building2, 
  Clock, 
  Users, 
  GraduationCap, 
  Banknote, 
  CheckCircle2, 
  Volume2, 
  ArrowRight,
  Send,
  Calendar,
  FileText,
  Download,
  Share2,
  AlertCircle,
  HelpCircle,
  X,
  FileDown,
  Maximize2,
  ZoomOut,
  ZoomIn,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Award,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  BookOpen,
  Camera,
  PenTool,
  Layers,
  Facebook,
  FileCheck2,
  Briefcase,
  Bookmark,
  AlertTriangle,
  Info,
  Scale,
  BadgeCheck
} from 'lucide-react';
import { mockJobs } from '@/data/mockJobs';
import JobLogo from '@/components/JobLogo';
import { useCandidateData } from '@/components/CandidateDataProvider';
import { storage, AuthState } from '@/lib/store';
import { JobCircular, JobPosition, CandidateProfile, EligibilityResult } from '@/lib/types';

export default function JobDetailClient({ job, relatedJobs = [] }: { job: JobCircular; relatedJobs?: JobCircular[] }) {
  const candidateData = useCandidateData();

  // States
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(storage.isJobSaved(job.id));
    fetch('/api/candidate/saved-jobs', { cache: 'no-store' }).then(res => res.ok ? res.json() : null).then(data => {
      if (Array.isArray(data?.savedJobs)) storage.replaceSavedJobIds(data.savedJobs);
    }).catch(() => {});
    const handleSavedChange = () => {
      setIsSaved(storage.isJobSaved(job.id));
    };
    window.addEventListener('cs_saved_changed', handleSavedChange);
    return () => window.removeEventListener('cs_saved_changed', handleSavedChange);
  }, [job.id]);

  const handleToggleSave = async () => {
    const nextSaved = storage.toggleSaveJob(job.id);
    setIsSaved(nextSaved);
    try {
      const response = await fetch('/api/candidate/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, action: nextSaved ? 'save' : 'unsave' })
      });
      if (!response.ok) throw new Error('Could not save job');
    } catch {
      storage.toggleSaveJob(job.id);
      setIsSaved(!nextSaved);
    }
  };
  const [copiedSms1, setCopiedSms1] = useState(false);
  const [copiedSms2, setCopiedSms2] = useState(false);
  const [activeNoticePage, setActiveNoticePage] = useState(0);
  const [viewerTab, setViewerTab] = useState<'pdf' | 'summary'>('pdf');
  const [noticeZoom, setNoticeZoom] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-scroll active circular page pill into center view
  const pageTabsContainerRef = useRef<HTMLDivElement>(null);
  const pageButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Modal Interactive Zoom & Touch/Mouse Drag Pan state
  const [modalZoom, setModalZoom] = useState(1);
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const [isModalDragging, setIsModalDragging] = useState(false);
  const modalDragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const touchDistRef = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);

  const handleModalMouseDown = (e: React.MouseEvent) => {
    if (modalZoom <= 1 || !modalScrollRef.current) return;
    setIsModalDragging(true);
    modalDragStart.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: modalScrollRef.current.scrollLeft,
      scrollTop: modalScrollRef.current.scrollTop
    };
  };

  const handleModalMouseMove = (e: React.MouseEvent) => {
    if (!isModalDragging || !modalScrollRef.current) return;
    e.preventDefault();
    const dx = e.clientX - modalDragStart.current.x;
    const dy = e.clientY - modalDragStart.current.y;
    modalScrollRef.current.scrollLeft = modalDragStart.current.scrollLeft - dx;
    modalScrollRef.current.scrollTop = modalDragStart.current.scrollTop - dy;
  };

  const handleModalMouseUp = () => {
    setIsModalDragging(false);
  };

  const handleModalTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistRef.current = dist;
    }
  };

  const handleModalTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistRef.current !== null) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = newDist / touchDistRef.current;
      touchDistRef.current = newDist;
      setModalZoom(prev => {
        const next = prev * ratio;
        return Math.min(3.5, Math.max(0.8, Number(next.toFixed(2))));
      });
    }
  };

  const handleModalTouchEnd = () => {
    touchDistRef.current = null;
  };

  const handleModalDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      setModalZoom(prev => (prev > 1.2 ? 1 : 2.2));
    }
    lastTapRef.current = now;
  };

  useEffect(() => {
    const activeBtn = pageButtonRefs.current[activeNoticePage];
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeNoticePage]);

  const isPdfNotice = useMemo(() => {
    const url = job.circularPdfUrl || job.circularImage || '';
    return Boolean(url && (url.toLowerCase().includes('.pdf') || url.includes('/uploads/') || url.includes('advertisement')));
  }, [job]);

  const officialPdfUrl = useMemo(() => {
    if (job.circularPdfUrl) return job.circularPdfUrl;
    if (job.circularImage && (job.circularImage.toLowerCase().endsWith('.pdf') || job.circularImage.includes('.pdf?'))) {
      return job.circularImage;
    }
    return `/api/jobs/${job.id}/download`;
  }, [job]);

  const noticePages = useMemo(() => {
    if (job.circularPages && job.circularPages.length > 0) return job.circularPages;
    if (job.circularImage && !job.circularImage.includes('unsplash.com') && !job.circularImage.toLowerCase().endsWith('.pdf') && !job.circularImage.includes('.pdf?')) {
      return [job.circularImage];
    }
    return [
      `/api/circulars/${job.id}/page-1.svg`,
      `/api/circulars/${job.id}/page-2.svg`
    ];
  }, [job]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Smart Candidate Eligibility Audit for Logged-in User
  const [auth, setAuth] = useState<AuthState>({ isLoggedIn: false, role: null, name: '' });
  const [userProfile, setUserProfile] = useState<CandidateProfile | null>(null);
  const [userEvaluation, setUserEvaluation] = useState<EligibilityResult | null>(null);
  const [showAuditDetails, setShowAuditDetails] = useState<boolean>(false);

  useEffect(() => {
    const profile = candidateData.profile;
    setAuth(profile ? { isLoggedIn: true, role: 'candidate', name: profile.name, userId: profile.id } : { isLoggedIn: false, role: null, name: '' });
    setUserProfile(profile);
    setUserEvaluation(profile ? storage.checkEligibility(profile, job, candidateData.documents) : null);
  }, [job, candidateData.profile, candidateData.documents]);

  // Age Calculator States
  const [birthDay, setBirthDay] = useState('15');
  const [birthMonth, setBirthMonth] = useState('6');
  const [birthYear, setBirthYear] = useState('1998');
  const [selectedQuota, setSelectedQuota] = useState<'general' | 'freedom_fighter' | 'disabled'>('general');

  // Teletalk SMS generator state
  const [userIdInput, setUserIdInput] = useState('ABCDEF');
  const [pinInput, setPinInput] = useState('12345678');

  // Audio Playback
  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(job.audioSummary);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 4000);
    }
  };

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Convert English number to Bengali digits
  const toBn = (num: number | string | undefined | null) => {
    if (num === undefined || num === null) return '';
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnNums[parseInt(d, 10)]);
  };

  // Safe Date parser for Bengali/English cutoff dates
  const parseCutoffDate = (dateStr?: string): Date => {
    if (!dateStr) return new Date(2026, 11, 31);
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) return d;
    } catch {}

    const normalized = dateStr.replace(/[০-৯]/g, d => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]);
    const bnMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    const enMonths = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    
    const tokens = normalized.split(/\s+/);
    let day = 1;
    let month = 11;
    let year = 2026;

    for (const token of tokens) {
      const num = parseInt(token, 10);
      if (!isNaN(num)) {
        if (num > 1900 && num < 2100) year = num;
        else if (num >= 1 && num <= 31) day = num;
      } else {
        const mIdx = bnMonths.findIndex(m => token.includes(m));
        if (mIdx !== -1) month = mIdx;
        else {
          const enIdx = enMonths.findIndex(m => token.toLowerCase().includes(m));
          if (enIdx !== -1) month = enIdx;
        }
      }
    }
    return new Date(year, month, day);
  };

  // Calculate Age dynamically
  const ageResult = useMemo(() => {
    const d = parseInt(birthDay, 10) || 1;
    const m = parseInt(birthMonth, 10) - 1 || 0;
    const y = parseInt(birthYear, 10) || 1998;
    
    const targetDate = parseCutoffDate(job.ageCutOffDate || job.deadline);
    const birthDate = new Date(y, m, d);

    if (isNaN(birthDate.getTime()) || birthDate > targetDate) {
      return { valid: false, message: 'সঠিক জন্মতারিখ নির্বাচন করুন' };
    }

    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const maxAllowedAge = selectedQuota === 'general' ? job.maxAge : Math.max(job.maxAge, 32);
    const minAllowedAge = job.minAge;

    const isEligible = years >= minAllowedAge && (years < maxAllowedAge || (years === maxAllowedAge && months === 0 && days === 0));

    return {
      valid: true,
      years,
      months,
      days,
      isEligible,
      minAllowedAge,
      maxAllowedAge
    };
  }, [birthDay, birthMonth, birthYear, selectedQuota, job.minAge, job.maxAge, job.ageCutOffDate, job.deadline]);

  const teletalkCode = job.smsPrefix || (job.id.includes('teletalk') ? job.id.split('-')[2]?.toUpperCase() : job.id.split('-')[0].toUpperCase());

  const handleCopySms1 = () => {
    const text = `${teletalkCode} ${userIdInput}`;
    navigator.clipboard.writeText(text);
    setCopiedSms1(true);
    setTimeout(() => setCopiedSms1(false), 2000);
  };

  const handleCopySms2 = () => {
    const text = `${teletalkCode} YES ${pinInput}`;
    navigator.clipboard.writeText(text);
    setCopiedSms2(true);
    setTimeout(() => setCopiedSms2(false), 2000);
  };

  // Multi-position Fee Calculation & State
  const positions: JobPosition[] = useMemo(() => {
    return job.positions && job.positions.length > 0
      ? job.positions
      : [{
          title: job.title,
          grade: job.grade,
          posts: job.totalPosts,
          salary: job.salary,
          minEducation: job.minEducation,
          govtFee: job.govtFee
        }];
  }, [job]);

  const hasMultiplePositions = positions.length > 1;
  const govtFees = useMemo(() => positions.map((p: JobPosition) => p.govtFee ?? job.govtFee ?? 200), [positions, job.govtFee]);
  const minGovtFee = Math.min(...govtFees);
  const maxGovtFee = Math.max(...govtFees);
  const hasVariableFee = minGovtFee !== maxGovtFee;

  const [selectedPosIndex, setSelectedPosIndex] = useState<number | null>(hasVariableFee ? null : 0);
  const [showFeeModal, setShowFeeModal] = useState<boolean>(false);

  // Section 5 Official Guidelines Accordion State (0 is open by default)
  const [openRulesIndices, setOpenRulesIndices] = useState<number[]>([0]);
  const toggleRuleAccordion = (idx: number) => {
    setOpenRulesIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };
  const toggleAllRules = () => {
    if (openRulesIndices.length >= 5) {
      setOpenRulesIndices([]);
    } else {
      setOpenRulesIndices([0, 1, 2, 3, 4, 5, 6]);
    }
  };

  const selectedPosition = selectedPosIndex !== null ? positions[selectedPosIndex] : null;
  const activeGovtFee = selectedPosition ? (selectedPosition.govtFee ?? job.govtFee ?? 200) : null;
  const activeTotalFee = activeGovtFee !== null ? activeGovtFee + job.serviceFee : null;

  const minTotalFee = minGovtFee + job.serviceFee;
  const maxTotalFee = maxGovtFee + job.serviceFee;

  const isExpired = Boolean(
    CentralDeadlineEngine.evaluateDeadline(job).isClosed ||
    (job as any).status === 'EXPIRED' || 
    (job as any).publicationStatus === 'EXPIRED' ||
    (job as any).status === 'CLOSED' ||
    (job.deadline && (job.deadline.includes('সমাপ্ত') || job.deadline.includes('শেষ')))
  );

  const applyHref = selectedPosition 
    ? `/apply/${job.id}?position=${encodeURIComponent(selectedPosition.title)}`
    : `/apply/${job.id}`;

  const totalFee = activeTotalFee !== null ? activeTotalFee : minTotalFee;

  // Google JobPosting Structured Data Schema (JSON-LD)
  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': job.title,
    'description': job.audioSummary || job.title,
    'identifier': {
      '@type': 'PropertyValue',
      'name': job.organization,
      'value': job.id
    },
    'datePosted': '2026-01-01T08:00:00+06:00',
    'validThrough': '2026-12-31T23:59:59+06:00',
    'employmentType': 'FULL_TIME',
    'hiringOrganization': {
      '@type': 'Organization',
      'name': job.organization,
      'sameAs': 'https://chakriseba.com'
    },
    'jobLocation': {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressCountry': 'BD',
        'addressLocality': job.districts || 'বাংলাদেশ'
      }
    },
    'baseSalary': {
      '@type': 'MonetaryAmount',
      'currency': 'BDT',
      'value': {
        '@type': 'QuantitativeValue',
        'unitText': 'MONTH',
        'value': job.salary
      }
    }
  };


  return (
    <div className="max-w-6xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-8 pb-28 md:pb-12 text-slate-800">
      {/* Google JobPosting Structured Data Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      
      {/* 1. Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-1.5">
          <Link href="/" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            <span>হোম</span>
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/#circulars-section" className="hover:text-emerald-700 transition-colors">
            {job.categoryLabel}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-md">
            {job.organization}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap overflow-x-auto no-scrollbar">
          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-[11px] sm:text-xs whitespace-nowrap font-medium inline-block shrink-0">
            স্মারক নং: CS/২০২৬/০৯
          </span>
          <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full text-[11px] sm:text-xs border border-emerald-200 whitespace-nowrap font-medium inline-block shrink-0">
            প্রকাশ: {job.publishedDate}
          </span>
        </div>
      </div>

      {/* 2. Main Header & Snapshot Hero Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-3.5 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          
          <div className="space-y-4 flex-1">
            {/* Badges row */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar whitespace-nowrap pb-0.5">
              <span className="bg-emerald-100 text-emerald-800 text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full whitespace-nowrap shrink-0">
                {job.categoryLabel}
              </span>
              <span className="bg-slate-100 text-slate-800 text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full whitespace-nowrap shrink-0">
                {job.grade}
              </span>
              <span className="bg-blue-100 text-blue-800 text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full flex items-center gap-1 whitespace-nowrap shrink-0">
                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>মোট {toBn(job.totalPosts)} টি পদ</span>
              </span>

            </div>

            {/* Notice Banners (Cancellation / Suspension) */}
            {Boolean((job as any).isCancellationNotice || (job as any).publicationStatus === 'CANCELLED') && (
              <div className="bg-rose-50 border-2 border-rose-300 text-rose-800 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <div className="font-black text-sm">নিয়োগ বিজ্ঞপ্তি বাতিল / প্রত্যাহার নোটিশ</div>
                  <div className="text-xs text-rose-700 mt-0.5">কর্তৃপক্ষের অফিশিয়াল আদেশ অনুসারে এই নিয়োগ সার্কুলারটি বাতিল করা হয়েছে।</div>
                </div>
              </div>
            )}
            {Boolean((job as any).isSuspended) && (
              <div className="bg-amber-50 border-2 border-amber-300 text-amber-800 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="font-black text-sm">নিয়োগ প্রক্রিয়া সাময়িকভাবে স্থগিত</div>
                  <div className="text-xs text-amber-700 mt-0.5">অনিবার্য কারণবশত কর্তৃপক্ষের নির্দেশনায় এই নিয়োগ কার্যক্রম স্থগিত রয়েছে।</div>
                </div>
              </div>
            )}

            {/* Title */}
            <h1 className="job-hero-headline text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
              {job.title}
            </h1>

            {/* Organization info */}
            <div className="flex items-center gap-3 text-emerald-800 font-bold text-base sm:text-lg">
              <JobLogo logo={job.logo} organization={job.organization} size="md" />
              <div>
                <Link 
                  href={`/organizations/${encodeURIComponent(job.organization)}`}
                  className="hover:text-emerald-950 hover:underline flex items-center gap-1.5 transition-colors"
                  title="এই প্রতিষ্ঠানের সকল সার্কুলার দেখুন"
                >
                  <span>{job.organization}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>
                <div className="text-xs font-normal text-slate-500">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত নিয়োগ বিজ্ঞপ্তি</div>
              </div>
            </div>

            {/* Quick Tag Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-0.5">জাতীয় বেতন স্কেল</span>
                <span className="font-bold text-slate-800">{job.salary}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block mb-0.5">বয়সসীমা</span>
                <span className="font-bold text-slate-800">{toBn(job.minAge)} হতে {toBn(job.maxAge)} বছর</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                <span className="text-slate-400 block mb-0.5">প্রযোজ্য জেলা</span>
                <span className="font-bold text-slate-800 truncate block">{job.districts}</span>
              </div>
            </div>

            {/* Step 08: Central Deadline & Smart Alert Engine Integration */}
            <DeadlineCountdown
              jobId={job.id}
              deadlineText={job.deadline}
              initialDaysRemaining={job.daysRemaining}
              className="w-full"
            />
          </div>

          {/* Right Column with Top Share Strip + Quick Apply CTA Box */}
          <div className="lg:w-[320px] flex-shrink-0 space-y-2.5">
            
            {/* Small Sleek Social Share Bar on White Background (100% Mobile Overflow Proof) */}
            <div className="flex items-center gap-1.5 sm:gap-2 w-full justify-between sm:justify-end pb-1 sm:pb-0">
              <span className="text-xs sm:text-sm font-bold text-slate-500 whitespace-nowrap shrink-0">শেয়ার:</span>
              
              <div className="flex items-center gap-1 sm:gap-1.5 flex-1 sm:flex-none justify-end min-w-0">
                <a
                  href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://chakrisheba.com/jobs/${job.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none py-1.5 px-2 sm:px-3 bg-white hover:bg-blue-50 text-slate-700 hover:text-[#1877F2] font-bold text-[11px] sm:text-xs rounded-xl transition-all flex items-center justify-center gap-1 border border-slate-200 hover:border-blue-300 shadow-2xs whitespace-nowrap"
                  title="ফেসবুকে শেয়ার করুন"
                >
                  <Facebook className="w-3.5 h-3.5 text-[#1877F2] shrink-0" />
                  <span>Facebook</span>
                </a>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(job.title + " - বিস্তারিত দেখুন: https://chakrisheba.com/jobs/" + job.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none py-1.5 px-2 sm:px-3 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-[11px] sm:text-xs rounded-xl transition-all flex items-center justify-center gap-1 border border-slate-200 hover:border-emerald-300 shadow-2xs whitespace-nowrap"
                  title="হোয়াটসঅ্যাপে শেয়ার করুন"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={handleToggleSave}
                  className={`flex-1 sm:flex-none py-1.5 px-2 sm:px-3 font-bold text-[11px] sm:text-xs rounded-xl transition-all flex items-center justify-center gap-1 border shadow-2xs whitespace-nowrap ${
                    isSaved
                      ? "bg-amber-50 text-amber-700 border-amber-300"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                  title={isSaved ? "সংরক্ষিত তালিকা থেকে সরান" : "সার্কুলারটি সংরক্ষণ করুন"}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-amber-500 text-amber-600" : "text-slate-400"} shrink-0`} />
                  <span>{isSaved ? "সংরক্ষিত" : "সেভ"}</span>
                </button>
                <button
                  onClick={handleCopy}
                  className={`flex-1 sm:flex-none py-1.5 px-2 sm:px-3 font-bold text-[11px] sm:text-xs rounded-xl transition-all flex items-center justify-center gap-1 border shadow-2xs whitespace-nowrap ${
                    copiedLink
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                  title="সার্কুলার লিংক কপি করুন"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <span>{copiedLink ? "কপি হয়েছে" : "কপি"}</span>
                </button>
              </div>
            </div>
            {/* Quick Apply CTA Box in Header (Desktop Only: on mobile, handled by bottom floating bar) */}
            <div className="hidden lg:block bg-gradient-to-b from-emerald-50/90 to-teal-50/60 border border-emerald-200/90 rounded-3xl p-6 text-center space-y-4 shadow-sm relative overflow-hidden">
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-center gap-1">
                  <span>সহজ অনলাইন আবেদন সার্ভিস</span>
                </div>

                {/* Multi-position selector if multiple positions exist */}
                {hasMultiplePositions && (
                  <div className="text-left bg-white/95 border border-emerald-300 rounded-2xl p-3 my-2 shadow-sm space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span className="flex items-center gap-1 text-emerald-900">
                        <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                        আবেদনের পদ বেছে নিন:
                      </span>
                      {hasVariableFee && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          পদভেদে ফি ভিন্ন
                        </span>
                      )}
                    </div>
                    <select
                      value={selectedPosIndex !== null ? selectedPosIndex : ''}
                      onChange={(e) => setSelectedPosIndex(e.target.value === '' ? null : Number(e.target.value))}
                      className="w-full text-xs font-bold text-slate-900 bg-emerald-50/70 border border-emerald-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {hasVariableFee && (
                        <option value="">সকল পদ / খরচের রেঞ্জ (৳{toBn(minTotalFee)} - ৳{toBn(maxTotalFee)})</option>
                      )}
                      {positions.map((pos: JobPosition, idx: number) => {
                        const pGovtFee = pos.govtFee ?? job.govtFee ?? 200;
                        const pTotal = pGovtFee + job.serviceFee;
                        return (
                          <option key={idx} value={idx}>
                            {pos.title} ({pos.grade}) — মোট ৳{toBn(pTotal)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Dynamic Price Display */}
                <div className="text-2xl font-black text-emerald-950">
                  {selectedPosition ? (
                    <>মোট খরচ: ৳{toBn(activeTotalFee!)}</>
                  ) : hasVariableFee ? (
                    <>মোট খরচ: ৳{toBn(minTotalFee)} - ৳{toBn(maxTotalFee)} <span className="text-sm font-bold text-emerald-700">(পদভেদে)</span></>
                  ) : (
                    <>মোট খরচ: ৳{toBn(minTotalFee)}</>
                  )}
                </div>

                <div className="text-[12px] text-slate-500">
                  {selectedPosition ? (
                    <>(সরকারি ফি ৳{toBn(activeGovtFee!)} + টিম চার্জ ৳{toBn(job.serviceFee)})</>
                  ) : hasVariableFee ? (
                    <>(সরকারি ফি ৳{toBn(minGovtFee)} - ৳{toBn(maxGovtFee)} + টিম চার্জ ৳{toBn(job.serviceFee)})</>
                  ) : (
                    <>(সরকারি ফি ৳{toBn(minGovtFee)} + টিম চার্জ ৳{toBn(job.serviceFee)})</>
                  )}
                </div>

                {hasMultiplePositions && (
                  <button
                    type="button"
                    onClick={() => setShowFeeModal(true)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline inline-flex items-center gap-1 pt-0.5"
                  >
                    <Info className="w-3.5 h-3.5 text-emerald-600" />
                    <span>পদ ও গ্রেড অনুযায়ী সম্পূর্ণ ফি তালিকা</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {isExpired ? (
                  <div className="w-full py-3.5 bg-slate-100 text-slate-400 font-black text-[17px] rounded-2xl border border-slate-300 flex items-center justify-center gap-2 cursor-not-allowed select-none">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span>আবেদনের সময় শেষ</span>
                  </div>
                ) : (
                  <Link
                    href={applyHref}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-[17px] rounded-2xl shadow-lg shadow-emerald-800/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <span>আমাদের মাধ্যমে আবেদন করুন</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
                <div className="text-[12px] text-emerald-800 font-semibold flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>১০০% নির্ভুল আবেদন ও সিকিউর স্লিপ</span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-200/60">
                <a
                  href={job.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center justify-center gap-1 transition-colors"
                >
                  <span>নিজে নিজে অফিশিয়াল পোর্টালে ফরম পূরণ</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* Smart Candidate Eligibility Audit Section (Replaced Audio Strip) */}
        <div className="mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100">
          {auth.isLoggedIn && userEvaluation ? (
            <div className={`p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-sm transition-all duration-300 ${
              userEvaluation.status === 'eligible' 
                ? 'bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white border-emerald-300' 
                : 'bg-gradient-to-br from-rose-50/80 via-red-50/30 to-white border-rose-300'
            }`}>
              {/* Header Summary Row (100% Mobile Responsive & Zero Cut-off) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0 ${
                    userEvaluation.status === 'eligible' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}>
                    {userEvaluation.status === 'eligible' ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black inline-flex items-center leading-normal ${
                        userEvaluation.status === 'eligible' ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
                      }`}>
                        {userEvaluation.statusLabel}
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate-500 font-semibold shrink-0">
                        • প্রোফাইল অডিট
                      </span>
                    </div>
                    <h2 className="text-xs sm:text-base font-black text-slate-900 leading-snug break-words">
                      {userProfile?.name}, এই সার্কুলারে আপনার যোগ্যতা যাচাই ফলাফল
                    </h2>
                  </div>
                </div>

                {/* Actions: 1-Click Apply if eligible, and Dropdown Toggle Button */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0 w-full sm:w-auto pt-1 sm:pt-0">
                  {userEvaluation.status === 'eligible' && !isExpired && (
                    <Link
                      href={`/apply/${job.id}`}
                      className="px-4 py-2 sm:px-5 sm:py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <span>১-ক্লিকে আবেদন করুন</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowAuditDetails(!showAuditDetails)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-2xs whitespace-nowrap ${
                      userEvaluation.status === 'eligible'
                        ? 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white hover:bg-rose-50 text-rose-800 border-rose-300'
                    } ${userEvaluation.status !== 'eligible' ? 'w-full sm:w-auto' : ''}`}
                  >
                    <span>{showAuditDetails ? 'সংক্ষিপ্ত করুন' : 'বিস্তারিত অডিট দেখুন'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAuditDetails ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Collapsible Audit Details Body */}
              {showAuditDetails && (
                <div className="pt-3.5 border-t border-rose-200/80 space-y-3 animate-in fade-in duration-200">
                  {/* Position breakdown if multi-position circular */}
                  {userEvaluation.positionsEvaluated && userEvaluation.positionsEvaluated.length > 0 && (
                    <div className="bg-white/95 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2 text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-600" />
                        <span>বিজ্ঞপ্তির পদসমূহে আপনার যোগ্যতা ({userEvaluation.eligiblePositionsCount}/{userEvaluation.positionsEvaluated.length}টি পদে আবেদনযোগ্য):</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {userEvaluation.positionsEvaluated.map((pos, idx) => (
                          <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                            pos.isEligible ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-rose-50/80 border-rose-200 text-rose-950'
                          }`}>
                            <div>
                              <div className="font-bold text-xs">{pos.title} <span className="text-[10px] text-slate-500 font-normal">({pos.grade})</span></div>
                              <div className="text-[11px] text-slate-600">{pos.reason}</div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              pos.isEligible ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                            }`}>
                              {pos.isEligible ? 'যোগ্য' : 'অনুপযুক্ত'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Small Red Warning Badges & Green Chips */}
                  <div className="space-y-1.5">
                    {userEvaluation.reasons.map((r, rIdx) => {
                      const isNegative = r.includes('পূরণ হয়নি') || r.includes('অযোগ্য') || r.includes('অনুপযুক্ত') || r.includes('অনুপস্থিত') || r.includes('অসম্পূর্ণ') || r.includes('অতিরিক্ত');
                      if (isNegative) {
                        return (
                          <div key={rIdx} className="flex items-start gap-2 p-2.5 bg-rose-50 text-rose-900 border border-rose-200 rounded-xl text-xs font-semibold">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </div>
                        );
                      }
                      return (
                        <div key={rIdx} className="flex items-start gap-2 p-2 bg-emerald-50/90 text-emerald-950 border border-emerald-200 rounded-xl text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : !auth.isLoggedIn ? (
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🎯</span>
                <div>
                  <span className="font-black text-amber-950 block text-[15px] mb-0.5">আপনি কি এই সার্কুলারে আপনার যোগ্যতা ও বয়স যাচাই করতে চান?</span>
                  <span className="text-amber-900 text-[15px] leading-relaxed">লগইন করলে আপনার প্রোফাইলের জন্মতারিখ ও জিপিএ অনুযায়ী সকল পদের যোগ্যতা স্বয়ংক্রিয়ভাবে ভেসে উঠবে।</span>
                </div>
              </div>
              <Link
                href="/login"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[15px] rounded-xl shadow-md transition-all w-full sm:w-auto text-center justify-center shrink-0"
              >
                লগইন করুন
              </Link>
            </div>
          ) : null}
        </div>

      </div>

      {/* 2.5. Keyword-rich Job Summary (Natural Editorial Snippet) */}
      <section aria-label="নিয়োগ বিজ্ঞপ্তির সারসংক্ষেপ" className="job-summary-facts bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50/80 border border-emerald-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-2xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>নিয়োগ বিজ্ঞপ্তির সারসংক্ষেপ</span>
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">• নির্ভরযোগ্য ও হালনাগাদ তথ্য</span>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-white/90 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>অফিশিয়ালি অনুমোদিত বিজ্ঞপ্তি ২০২৬</span>
          </span>
        </div>
        
        <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
          {job.organization} নিয়োগ বিজ্ঞপ্তি ২০২৬ — এক নজরে সারসংক্ষেপ (Job Overview)
        </h2>

        {job.bengaliDescription ? (
          <div className="job-editorial-lead text-[15px] sm:text-[16px] text-slate-800 leading-relaxed space-y-3 font-normal whitespace-pre-line bg-slate-50/60 p-4 rounded-2xl border border-slate-200/70">
            {job.bengaliDescription}
          </div>
        ) : (
          <p className="text-[16px] text-slate-800 leading-relaxed font-normal">
            <strong className="font-bold text-slate-950">{job.organization}</strong> সম্প্রতি ২০২৬ সালের নতুন নিয়োগ বিজ্ঞপ্তি প্রকাশ করেছে। এই সার্কুলারে <strong className="font-bold text-emerald-900">{job.grade}</strong> গ্রেডের <strong className="font-bold text-slate-950">{job.title}</strong> পদে মোট <strong className="font-bold text-emerald-800">{toBn(job.totalPosts)} টি শূন্যপদে</strong> জনবল নিয়োগ দেওয়া হবে। আবেদনের জন্য প্রার্থীদের স্বীকৃত বিশ্ববিদ্যালয় বা শিক্ষা বোর্ড থেকে ন্যূনতম <strong className="font-bold text-slate-900">{job.minEducation}</strong> থাকতে হবে। সাধারণ প্রার্থীদের বয়স <strong className="font-bold text-slate-900">{toBn(job.minAge)} হতে {toBn(job.maxAge)} বছর</strong> হতে হবে এবং বীর মুক্তিযোদ্ধা কোটার ক্ষেত্রে বয়স ৩২ বছর পর্যন্ত প্রযোজ্য। নির্বাচিত প্রার্থীদের সরকারি জাতীয় বেতন স্কেল অনুযায়ী মাসিক <strong className="font-bold text-emerald-900">{job.salary}</strong> টাকা স্কেলে মূল বেতন ও বাড়িভাড়া, চিকিৎসা ভাতাসহ যাবতীয় সরকারি সুযোগ-সুবিধা প্রদান করা হবে। আগ্রহী নারী ও পুরুষ উভয় প্রার্থী আগামী <strong className="font-bold text-rose-700">{job.deadline}</strong> তারিখের মধ্যে অফিশিয়াল ওয়েবসাইট <strong className="font-bold text-blue-700">{job.officialLink}</strong> এর মাধ্যমে অনলাইনে আবেদন সম্পন্ন করতে পারবেন।
          </p>
        )}
      </section>

      {/* 3. Comprehensive Circular Specifications Table (The 10 Basic Elements) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="font-bold text-sm sm:text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>{job.organization} সার্কুলারের সম্পূর্ণ মৌলিক তথ্য ছক (Official Summary Table)</span>
          </div>
          <span className="text-xs text-slate-400 font-normal">১০টি মৌলিক বিষয় এক নজরে</span>
        </div>

        <div className="divide-y divide-slate-100 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/60 transition-colors">
            <span className="font-bold text-slate-500">১. প্রতিষ্ঠানের নাম ও ধরন</span>
            <span className="sm:col-span-2 font-semibold text-slate-900">{job.organization} (সরকারি রাজস্ব/স্বায়ত্তশাসিত)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/60 transition-colors">
            <span className="font-bold text-slate-500">২. পদের নাম ও মোট পদসংখ্যা</span>
            <span className="sm:col-span-2 font-semibold text-slate-900">
              {job.title} — মোট <strong className="text-emerald-700">{toBn(job.totalPosts)} টি পদ</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/60 transition-colors">
            <span className="font-bold text-slate-500">৩. গ্রেড ও বেতন স্কেল</span>
            <span className="sm:col-span-2 font-bold text-emerald-700">{job.salary} ({job.grade})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/60 transition-colors">
            <span className="font-bold text-slate-500">৪. শিক্ষাগত যোগ্যতা ও বিভাগ</span>
            <span className="sm:col-span-2 font-semibold text-slate-900">{job.minEducation}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/60 transition-colors">
            <span className="font-bold text-slate-500">৫. বয়সসীমা (সাধারণ ও কোটা)</span>
            <span className="sm:col-span-2 font-semibold text-slate-900">
              সাধারণ প্রার্থী: {toBn(job.minAge)} হতে {toBn(job.maxAge)} বছর (বীর মুক্তিযোদ্ধা সন্তান ও প্রতিবন্ধীদের ক্ষেত্রে ৩২ বছর পর্যন্ত শিথিলযোগ্য)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/60 transition-colors">
            <span className="font-bold text-slate-500">৬. প্রযোজ্য জেলা তালিকা (কোটা)</span>
            <span className="sm:col-span-2 font-semibold text-slate-900">{job.districts}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/60 transition-colors">
            <span className="font-bold text-slate-500">৭. আবেদনের শেষ তারিখ ও সময়</span>
            <span className="sm:col-span-2 font-bold text-rose-600">
              {job.deadline} • বাকি আছে {toBn(job.daysRemaining)} দিন
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/60 transition-colors">
            <span className="font-bold text-slate-500">৮. সরকারি পরীক্ষার ফি ও চার্জ</span>
            <span className="sm:col-span-2 font-semibold text-slate-900">
              {hasVariableFee 
                ? `সরকারি ফি ৳${toBn(minGovtFee)} হতে ৳${toBn(maxGovtFee)} টাকা (পদভেদে) + টেলিটক/সার্ভিস চার্জ (আবেদনের ৭২ ঘণ্টার মধ্যে প্রদেয়)`
                : `সরকারি ফি ৳${toBn(job.govtFee)} + টেলিটক/সার্ভিস চার্জ (আবেদনের ৭২ ঘণ্টার মধ্যে প্রদেয়)`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/60 transition-colors">
            <span className="font-bold text-slate-500">৯. ছবি ও স্বাক্ষরের পরিমাপ</span>
            <span className="sm:col-span-2 font-semibold text-slate-900">
              রঙিন ছবি: ৩০০ × ৩০০ পিক্সেল (সর্বোচ্চ ১০০ KB) • স্বাক্ষর: ৩০০ × ৮০ পিক্সেল (সর্বোচ্চ ৬০ KB)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-slate-50/60 transition-colors">
            <span className="font-bold text-slate-500">১০. অফিশিয়াল অনলাইন আবেদনের ঠিকানা</span>
            <span className="sm:col-span-2 font-semibold text-blue-600 hover:underline">
              <a href={job.officialLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                <span>{job.officialLink}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Positions, Vacancies & Educational Qualification (Hybrid Mobile Cards + Desktop Table) */}
      <section aria-label="পদের নাম, পদসংখ্যা ও শিক্ষাগত যোগ্যতা" className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-3.5 sm:p-8 space-y-4 sm:space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span>{job.organization} নিয়োগ বিজ্ঞপ্তি — পদের নাম, পদসংখ্যা ও শিক্ষাগত যোগ্যতা</span>
            </h2>
            <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
              {job.organization} নিয়োগ বিজ্ঞপ্তির পদভিত্তিক বিস্তারিত শূন্যপদ, প্রয়োজনীয় শিক্ষাগত যোগ্যতা, জাতীয় বেতন স্কেল ও সরকারি আবেদন ফি নিচে তুলে ধরা হলো:
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full shrink-0 self-start sm:self-auto border border-emerald-200">
            মোট শূন্যপদ: {toBn(job.totalPosts)} টি
          </span>
        </div>

        {/* Desktop / Tablet View: Spacious Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[740px]">
            <thead className="bg-slate-50 text-slate-700 font-bold border-y border-slate-200">
              <tr>
                <th className="py-3.5 px-3 text-center w-12 whitespace-nowrap">ক্র.</th>
                <th className="py-3.5 px-4 min-w-[170px] whitespace-nowrap">পদের নাম ও গ্রেড</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[100px]">পদসংখ্যা</th>
                <th className="py-3.5 px-4 min-w-[220px]">শিক্ষাগত যোগ্যতা ও বিভাগ/শর্ত</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[160px]">জাতীয় বেতন স্কেল</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[110px]">সরকারি ফি</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap min-w-[90px]">আবেদন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(job.positions && job.positions.length > 0 ? job.positions : [
                {
                  title: job.title,
                  grade: job.grade,
                  posts: job.totalPosts,
                  salary: job.salary,
                  minEducation: job.minEducation,
                  govtFee: job.govtFee
                }
              ] as JobPosition[]).map((pos: JobPosition, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-3 text-center font-bold text-slate-400 whitespace-nowrap">{toBn(idx + 1)}</td>
                  <td className="py-4 px-4 min-w-[170px]">
                    <div className="font-bold text-slate-900 text-[15px]">{pos.title}</div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-md border border-slate-200 whitespace-nowrap">
                      {pos.grade}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap min-w-[100px]">
                    <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 font-black text-sm rounded-lg border border-emerald-200 whitespace-nowrap">
                      {toBn(pos.posts)} টি
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-700 text-xs sm:text-sm leading-relaxed max-w-xs">
                    {pos.minEducation}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-900 text-xs sm:text-sm whitespace-nowrap min-w-[160px]">
                    {pos.salary}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-emerald-900 text-sm whitespace-nowrap min-w-[110px]">
                    ৳{toBn(pos.govtFee || job.govtFee || 200)}
                  </td>
                  <td className="py-4 px-3 text-center whitespace-nowrap min-w-[90px]">
                    {isExpired ? (
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl border border-slate-200 inline-block">
                        সময় শেষ
                      </span>
                    ) : (
                      <Link
                        href={`/apply/${job.id}?position=${encodeURIComponent(pos.title)}`}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs inline-flex items-center gap-1 transition-all whitespace-nowrap hover:scale-105"
                      >
                        <span>আবেদন</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View: High-clarity Structured Cards */}
        <div className="block md:hidden space-y-4">
          {(job.positions && job.positions.length > 0 ? job.positions : [
            {
              title: job.title,
              grade: job.grade,
              posts: job.totalPosts,
              salary: job.salary,
              minEducation: job.minEducation,
              govtFee: job.govtFee
            }
          ] as JobPosition[]).map((pos: JobPosition, idx: number) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-emerald-700">পদ নং #{toBn(idx + 1)}</span>
                  <h4 className="font-black text-slate-900 text-base leading-snug">{pos.title}</h4>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-white text-slate-700 font-semibold text-xs rounded border border-slate-200">
                    {pos.grade}
                  </span>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-2xs shrink-0 whitespace-nowrap">
                  {toBn(pos.posts)} টি পদ
                </span>
              </div>

              <div className="text-xs space-y-1.5 pt-1 border-t border-slate-200/60">
                <div>
                  <span className="font-bold text-slate-500">শিক্ষাগত যোগ্যতা: </span>
                  <span className="text-slate-800 leading-relaxed">{pos.minEducation}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 pt-1">
                  <span><strong>বেতন স্কেল:</strong> {pos.salary}</span>
                  <span className="font-bold text-emerald-800">ফি: ৳{toBn(pos.govtFee || job.govtFee || 200)}</span>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-500">মোট খরচ: ৳{toBn((pos.govtFee || job.govtFee || 200) + job.serviceFee)}</span>
                  {isExpired ? (
                    <span className="px-3 py-1 bg-slate-100 text-slate-400 font-bold text-xs rounded-lg border border-slate-200">
                      সময় শেষ
                    </span>
                  ) : (
                    <Link
                      href={`/apply/${job.id}?position=${encodeURIComponent(pos.title)}`}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs inline-flex items-center gap-1"
                    >
                      <span>এই পদে আবেদন</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FULL OFFICIAL CIRCULAR CONTENT & GUIDELINES (ড্রপডাউন ও অ্যাকর্ডিয়ন ভিউ) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-3.5 sm:p-8 space-y-4 sm:space-y-6">
        
        {/* Section Header */}
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {job.organization} নিয়োগ বিজ্ঞপ্তি ২০২৬ — আবেদন করার বিস্তারিত নিয়ম ও আবশ্যিক শর্তাবলী
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                কর্তৃপক্ষ কর্তৃক জারিকৃত অফিশিয়াল বিজ্ঞপ্তি থেকে সংকলিত নিয়মাবলী ও আবশ্যকীয় নির্দেশনাসমূহ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleAllRules}
            className="px-4 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 font-bold text-xs rounded-xl transition-all self-start sm:self-center shrink-0 flex items-center gap-1.5 shadow-2xs"
          >
            <span>{openRulesIndices.length === 5 ? 'সবগুলো গুটিয়ে নিন' : 'সবগুলো বিস্তারিত দেখুন'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openRulesIndices.length === 5 ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Accordion List for Guidelines */}
        <div className="space-y-3">
          {[
            {
              id: 0,
              title: '১. বিজ্ঞপ্তির প্রেক্ষাপট ও আবেদন আহ্বান',
              content: (
                <div className="space-y-3 pt-1">
                  <p className="text-[15px] text-slate-700 leading-relaxed">
                    গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের প্রচলিত নিয়োগ বিধিমালা এবং {job.organization}-এর রাজস্ব খাতভুক্ত শূন্য পদসমূহে স্থায়ীভাবে জনবল নিয়োগের নিমিত্তে প্রকৃত বাংলাদেশি নাগরিকদের নিকট হতে অনলাইনে দরখাস্ত আহ্বান করা যাচ্ছে। আগ্রহী প্রার্থীরা অনলাইনে নির্ধারিত সময়ের মধ্যে আবেদনপত্র দাখিল করতে পারবেন।
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-200">
                      📌 প্রকাশ: {job.publishedDate}
                    </span>
                    <span className="px-3 py-1 bg-rose-50 text-rose-800 font-bold rounded-lg border border-rose-200">
                      ⏳ আবেদনের শেষ সময়: {job.deadline}
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-800 font-bold rounded-lg border border-blue-200">
                      🏛️ মোট শূন্যপদ: {toBn(job.totalPosts)} টি
                    </span>
                  </div>
                </div>
              )
            },
            {
              id: 1,
              title: '২. শিক্ষাগত যোগ্যতা ও আবশ্যিক শর্তসমূহ',
              content: (
                <div className="pt-1">
                  <ul className="space-y-2.5 text-[15px] text-slate-700">
                    {job.requirements && job.requirements.map((req: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                        <BadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{req}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                      <BadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        শিক্ষা জীবনে কোনো পর্যায়ে ৩য় বিভাগ বা শ্রেণি অথবা সমমানের সিজিপিএ/জিপিএ গ্রহণযোগ্য হবে না।
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                      <BadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        কম্পিউটার অপারেটিং ও এমএস অফিস (ওয়ার্ড, এক্সেল ও পাওয়ারপয়েন্ট) চালনায় সন্তোষজনক ব্যবহারিক জ্ঞান থাকতে হবে।
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                      <BadgeCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        অবতীর্ণ (Appeared) প্রার্থীদের কোনো আবেদনপত্র গ্রহণযোগ্য হবে না; আবেদনের শেষ তারিখের পূর্বেই সংশ্লিষ্ট ডিগ্রি অর্জিত হতে হবে।
                      </span>
                    </li>
                  </ul>
                </div>
              )
            },
            {
              id: 2,
              title: '৩. প্রার্থীর বয়সসীমা ও কোটা সম্পর্কিত নিয়মাবলী',
              content: (
                <div className="pt-1">
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 space-y-3 text-sm text-slate-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                      <span className="font-semibold text-slate-900 leading-relaxed">
                        <strong>বয়স নির্ধারণের তারিখ:</strong> প্রার্থীর বয়স <strong>{job.ageCutOffDate || job.deadline || "বিজ্ঞপ্তি অনুযায়ী"}</strong> তারিখের হিসেবে ন্যূনতম <strong>{toBn(job.minAge)} বছর</strong> এবং সর্বোচ্চ <strong>{toBn(job.maxAge)} বছর</strong> হতে হবে।
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">
                        <strong>কোটা সুবিধা:</strong> বীর মুক্তিযোদ্ধা/শহীদ মুক্তিযোদ্ধার সন্তান এবং শারীরিক প্রতিবন্ধী প্রার্থীদের ক্ষেত্রে সরকারি বিধি অনুযায়ী সর্বোচ্চ বয়সসীমা <strong>৩২ বছর</strong> পর্যন্ত শিথিলযোগ্য।
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Scale className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">
                        বয়স প্রমাণের ক্ষেত্রে কেবল এসএসসি বা সমমানের পরীক্ষার সনদপত্র বিবেচিত হবে। কোনো এফিডেভিট (Affidavit) গ্রহণযোগ্য নয়।
                      </span>
                    </div>

                    {/* Interactive Live Age Calculator Widget */}
                    <div className="mt-4 p-4 sm:p-5 bg-white rounded-2xl border border-amber-200/90 shadow-sm space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>🧮</span>
                          <span>আপনার বয়স ও যোগ্যতা যাচাই করুন (Live Age Checker)</span>
                        </span>
                        <span className="text-xs text-amber-800 bg-amber-100 font-semibold px-2.5 py-1 rounded-full">
                          কাট-অফ তারিখ: {job.ageCutOffDate || job.deadline}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 text-xs">
                        <div>
                          <label className="text-slate-600 font-medium block mb-1">দিন</label>
                          <select 
                            value={birthDay} 
                            onChange={e => setBirthDay(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                              <option key={d} value={d}>{toBn(d)}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-600 font-medium block mb-1">মাস</label>
                          <select 
                            value={birthMonth} 
                            onChange={e => setBirthMonth(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            {['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'].map((m, idx) => (
                              <option key={idx + 1} value={idx + 1}>{m}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-slate-600 font-medium block mb-1">জন্ম সাল</label>
                          <select 
                            value={birthYear} 
                            onChange={e => setBirthYear(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            {Array.from({ length: 35 }, (_, i) => 2012 - i).map(y => (
                              <option key={y} value={y}>{toBn(y)}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-3 sm:col-span-1">
                          <label className="text-slate-600 font-medium block mb-1">কোটা</label>
                          <select 
                            value={selectedQuota} 
                            onChange={e => setSelectedQuota(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 font-semibold text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="general">সাধারণ (১৮-৩০ বছর)</option>
                            <option value="freedom_fighter">মুক্তিযোদ্ধা (৩২ বছর)</option>
                            <option value="disabled">প্রতিবন্ধী (৩২ বছর)</option>
                          </select>
                        </div>
                      </div>

                      {/* Result Banner */}
                      {ageResult.valid ? (
                        <div className={`p-3.5 rounded-xl border flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm font-semibold ${
                          ageResult.isEligible 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}>
                          <div className="space-y-0.5">
                            <div>
                              আপনার বয়স: <strong className="text-slate-950 font-black">{toBn(ageResult.years)} বছর {toBn(ageResult.months)} মাস {toBn(ageResult.days)} দিন</strong>
                            </div>
                            <div className="text-xs font-normal">
                              {ageResult.isEligible 
                                ? '🎉 অভিনন্দন! আপনি নির্ধারিত বয়সসীমার মধ্যে আছেন এবং আবেদনের সম্পূর্ণ যোগ্য।' 
                                : `⚠️ দুঃখিত! নির্ধারিত বয়সসীমার (${toBn(ageResult.minAllowedAge)}-${toBn(ageResult.maxAllowedAge)} বছর) সাথে মিলছে না।`}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            ageResult.isEligible ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {ageResult.isEligible ? 'আবেদনের যোগ্য' : 'অযোগ্য'}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            },
            {
              id: 3,
              title: '৪. মৌখিক ও ভাইভা পরীক্ষার সময় প্রয়োজনীয় মূল সনদপত্র',
              content: (
                <div className="pt-1 space-y-3">
                  <p className="text-xs text-slate-600">
                    লিখিত পরীক্ষায় উত্তীর্ণ প্রার্থীদের মৌখিক (ভাইভা) পরীক্ষার সময় নিচের মূল সনদপত্রসমূহের মূলকপি এবং ১ সেট সত্যায়িত ফটোকপি প্রদর্শন করতে হবে:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-800">
                    {(job.documentsRequired && job.documentsRequired.length > 0 ? job.documentsRequired : [
                      'সকল শিক্ষাগত যোগ্যতার মূল সনদপত্র ও একাডেমিক মার্কশিটের মূলকপি ও ১ সেট সত্যায়িত ফটোকপি',
                      'সংশ্লিষ্ট ইউনিয়ন পরিষদ চেয়ারম্যান / পৌর মেয়র / কাউন্সিলর কর্তৃক নাগরিকত্ব সনদ',
                      'চারিত্রিক সনদপত্র (সর্বশেষ শিক্ষা প্রতিষ্ঠানের প্রধান কর্তৃক প্রদত্ত)',
                      'জাতীয় পরিচয়পত্র (NID) অথবা অনলাইন জন্ম নিবন্ধন সনদের মূল কপি',
                      '১ম শ্রেণির গেজেটেড কর্মকর্তা কর্তৃক সত্যায়িত ৩ কপি পাসপোর্ট সাইজ ছবি',
                      'কোটাধারীদের ক্ষেত্রে যথাযথ মন্ত্রণালয় বা কর্তৃপক্ষের স্বাক্ষরিত মূল প্রত্যয়নপত্র',
                      'সরকারি/আধা-সরকারি/স্বায়ত্তশাসিত সংস্থায় চাকরিরত প্রার্থীদের নিয়োগকারী কর্তৃপক্ষের অনাপত্তিপত্র (NOC)'
                    ]).map((docItem: string, dIdx: number) => (
                      <div key={dIdx} className={`p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-start gap-2 ${dIdx === 6 ? 'sm:col-span-2' : ''}`}>
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{toBn(dIdx + 1)}</span>
                        <span>{docItem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            },
            ...(job.applicationInstructions ? [{
              id: 4,
              title: '৫. টেলিটক অনলাইন আবেদন ও এসএমএস নির্দেশিকা',
              content: (
                <div className="pt-1">
                  <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 sm:p-5 space-y-2.5 text-sm text-slate-800 whitespace-pre-line leading-relaxed font-normal">
                    {job.applicationInstructions}
                  </div>
                </div>
              )
            }] : []),
            ...(job.selectionProcess ? [{
              id: 5,
              title: '৬. পরীক্ষা পদ্ধতি ও মানবন্টন নির্দেশিকা',
              content: (
                <div className="pt-1">
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 text-sm text-slate-800 leading-relaxed">
                    <p className="font-semibold text-emerald-950 mb-1">🏛️ নিয়োগ পরীক্ষা ও মানবন্টন বিবরণ:</p>
                    <p>{job.selectionProcess}</p>
                  </div>
                </div>
              )
            }] : []),
            {
              id: 6,
              title: '৫. কর্তৃপক্ষের আইনি সতর্কবার্তা ও সাধারণ শর্তাবলী',
              content: (
                <div className="pt-1">
                  <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-5 space-y-2.5 text-sm text-slate-800">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2 leading-relaxed">
                        <p>
                          <strong>মিথ্যা তথ্যে বাতিল:</strong> কোনো প্রার্থী অসত্য, বিকৃত বা অসম্পূর্ণ তথ্য প্রদান করলে কিংবা কোনো জালিয়াতির আশ্রয় নিলে নিয়োগের যেকোনো পর্যায়ে তাঁর প্রার্থিতা সরাসরি বাতিল করা হবে এবং আইনানুগ ফৌজদারি ব্যবস্থা গ্রহণ করা হবে।
                        </p>
                        <p>
                          <strong>তদবির অযোগ্যতা:</strong> নিয়োগ প্রক্রিয়ায় কোনো প্রকার ব্যক্তিগত যোগাযোগ বা সুপারিশ প্রার্থীর প্রত্যক্ষ অযোগ্যতা বলে গণ্য হবে।
                        </p>
                        <p>
                          <strong>কর্তৃপক্ষের ক্ষমতা:</strong> কর্তৃপক্ষ কোনো কারণ দর্শানো ব্যতিরেকেই বিজ্ঞপ্তির পদসংখ্যা হ্রাস/বৃদ্ধি বা সম্পূর্ণ নিয়োগ কার্যক্রম স্থগিত/বাতিল করার পূর্ণ অধিকার সংরক্ষণ করে।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          ].map((item) => {
            const isOpen = openRulesIndices.includes(item.id);
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen 
                    ? 'bg-white border-emerald-300 shadow-sm ring-1 ring-emerald-500/10' 
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleRuleAccordion(item.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isOpen ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {toBn(item.id + 1)}
                    </span>
                    <h3 className="text-[15px] sm:text-base font-black text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 bg-emerald-100 text-emerald-800' : 'bg-white text-slate-500 border border-slate-200'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-1 text-slate-700 border-t border-slate-100 animate-in fade-in duration-150">
                    {item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* 7. Interactive Teletalk SMS Formatter & Code Generator */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-3.5 sm:p-8 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              টেলিটক এসএমএস ফরম্যাট ও ফি দেওয়ার নিয়মাবলী (SMS Generator)
            </h3>
            <p className="text-xs text-slate-500">
              অনলাইনে ফরম পূরণের পর প্রিপেইড টেলিটক সিম দিয়ে ১৬২২২ নম্বরে এসএমএস পাঠিয়ে ফি প্রদান করতে হবে
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-black">১</span>
                <span>১ম এসএমএস ফরম্যাট</span>
              </span>
              <span className="text-[11px] text-slate-500">টেলিটক নম্বর: 16222</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              অনলাইনে আবেদন সাবমিটের পর প্রাপ্ত <strong>User ID</strong> টি নিচের বক্সে লিখুন:
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">আপনার প্রাপ্ত User ID লিখুন:</label>
              <input
                type="text"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value.toUpperCase())}
                placeholder="যেমন: ABCDEF"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-sm flex items-center justify-between border border-slate-800">
              <span>{teletalkCode} {userIdInput || 'USERID'}</span>
              <button
                onClick={handleCopySms1}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                title="কপি করুন"
              >
                {copiedSms1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSms1 ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">ফিরতি এসএমএসে প্রার্থীর নাম ও ৮ ডিজিটের একটি পিন কোড (PIN) পাঠানো হবে।</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-black">২</span>
                <span>২য় এসএমএস (ফি কনফার্মেশন)</span>
              </span>
              <span className="text-[11px] text-slate-500">টেলিটক নম্বর: 16222</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ১ম এসএমএসের ফিরতি মেসেজে প্রাপ্ত <strong>PIN</strong> নম্বরটি নিচের বক্সে লিখুন:
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">প্রাপ্ত PIN নম্বর লিখুন:</label>
              <input
                type="text"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="যেমন: 12345678"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-sm flex items-center justify-between border border-slate-800">
              <span>{teletalkCode} YES {pinInput || 'PIN'}</span>
              <button
                onClick={handleCopySms2}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                title="কপি করুন"
              >
                {copiedSms2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSms2 ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">২য় এসএমএস সফল হলে আবেদন ফি কাটা হবে এবং চূড়ান্ত পাসওয়ার্ড সম্বলিত নিশ্চিতকরণ এসএমএস আসবে।</p>
          </div>
        </div>
      </div>

      {/* 9. Multi-page Official Gazette Notice Viewer (Auto-converted PNG/SVG with SEO attributes) */}
      <section aria-label="মূল সার্কুলার গেজেট নোটিশ" className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-3.5 sm:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-emerald-700" />
              </div>
              <span>{job.organization} মূল সার্কুলার গেজেট নোটিশ (Official Gazette Notice)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              কর্তৃপক্ষ কর্তৃক প্রকাশিত মূল গ্যাজেট বিজ্ঞপ্তির পৃষ্ঠাভিত্তিক অফিসিয়াল কপি (মোট {toBn(noticePages.length)} পৃষ্ঠা)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {isPdfNotice && (
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold mr-1">
                <button
                  type="button"
                  onClick={() => setViewerTab('pdf')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${viewerTab === 'pdf' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
                >
                  📄 মূল অফিশিয়াল PDF
                </button>
                <button
                  type="button"
                  onClick={() => setViewerTab('summary')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${viewerTab === 'summary' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
                >
                  🖼️ সারসংক্ষেপ পাতা
                </button>
              </div>
            )}
            <a
              href={officialPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={`${job.organization || 'ChakriSheba'}-Circular.pdf`}
              className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              title="অফিসিয়াল সার্কুলার PDF সরাসরি ডাউনলোড করুন"
            >
              <Download className="w-4 h-4" />
              <span>মূল সার্কুলার PDF ডাউনলোড</span>
            </a>

            <a
              href={noticePages[activeNoticePage]}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2.5 rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-1.5"
              title="বর্তমান পৃষ্ঠা ডাউনলোড করুন"
            >
              <FileDown className="w-4 h-4 text-slate-600" />
              <span>পৃষ্ঠা ডাউনলোড (PNG)</span>
            </a>
          </div>
        </div>

        {/* Page Selector Tabs & Zoom Toolbar - 100% Centered & Auto-Scrolling */}
        <div className="bg-slate-50/90 p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 space-y-2.5 flex flex-col items-center justify-center text-center">
          {/* Row 1: Single Unified Toolbar (Page Navigation + Zoom + Fullscreen Strictly on 1 Single Line) */}
          <div className="w-full flex items-center justify-center overflow-x-auto no-scrollbar py-0.5">
            <div className="inline-flex items-center gap-1 sm:gap-1.5 bg-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-2xl border border-slate-200/90 shadow-2xs whitespace-nowrap select-none">
              
              {/* Prev Page Button */}
              <button
                type="button"
                disabled={activeNoticePage === 0}
                onClick={() => {
                  setActiveNoticePage(prev => Math.max(0, prev - 1));
                  setNoticeZoom(1);
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200/90 rounded-xl text-slate-700 cursor-pointer transition-all active:scale-95 flex-shrink-0"
                title="পূর্ববর্তী পৃষ্ঠা"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Indicator */}
              <div className="px-2 sm:px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-black text-emerald-900 whitespace-nowrap flex-shrink-0">
                পৃষ্ঠা {toBn(activeNoticePage + 1)} / {toBn(noticePages.length)}
              </div>

              {/* Next Page Button */}
              <button
                type="button"
                disabled={activeNoticePage === noticePages.length - 1}
                onClick={() => {
                  setActiveNoticePage(prev => Math.min(noticePages.length - 1, prev + 1));
                  setNoticeZoom(1);
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200/90 rounded-xl text-slate-700 cursor-pointer transition-all active:scale-95 flex-shrink-0"
                title="পরবর্তী পৃষ্ঠা"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Subtle Divider */}
              <div className="h-4 w-px bg-slate-200 mx-0.5 flex-shrink-0" />

              {/* Zoom Out Button */}
              <button
                type="button"
                onClick={() => setNoticeZoom(prev => Math.max(0.75, Number((prev - 0.25).toFixed(2))))}
                className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer flex-shrink-0"
                title="জুম আউট (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              {/* Zoom Percentage */}
              <button
                type="button"
                onClick={() => setNoticeZoom(1)}
                className="text-[11px] font-mono font-bold text-slate-700 px-1 select-none min-w-[32px] text-center hover:text-emerald-700 cursor-pointer flex-shrink-0"
                title="১০০% রিসেট করুন"
              >
                {Math.round(noticeZoom * 100)}%
              </button>

              {/* Zoom In Button */}
              <button
                type="button"
                onClick={() => setNoticeZoom(prev => Math.min(2.5, Number((prev + 0.25).toFixed(2))))}
                className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer flex-shrink-0"
                title="জুম ইন (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              {/* Reset Text Button (hidden on very small screens, 100% handles it) */}
              <button
                type="button"
                onClick={() => setNoticeZoom(1)}
                className="hidden xs:inline-block text-[11px] font-bold text-slate-600 hover:text-emerald-700 px-1.5 py-0.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                title="রিসেট"
              >
                রিসেট
              </button>

              {/* Subtle Divider */}
              <div className="h-4 w-px bg-slate-200 mx-0.5 flex-shrink-0" />

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={() => {
                  setModalZoom(1);
                  setIsModalOpen(true);
                }}
                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold border border-emerald-200/80 whitespace-nowrap flex-shrink-0 active:scale-95"
                title="বড় স্ক্রিনে দেখুন"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">বড় করুন</span>
              </button>

            </div>
          </div>

          {/* Row 2: Centered, Horizontal Auto-Scrolling Page Tabs (Clean labels, Smooth Scroll) */}
          <div 
            ref={pageTabsContainerRef}
            className="w-full overflow-x-auto py-1 scroll-smooth [scrollbar-width:thin] [-ms-overflow-style:auto] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex items-center justify-start sm:justify-center gap-1.5 w-max min-w-full px-2 mx-auto">
              {noticePages.map((_: string, pIdx: number) => {
                const isActive = activeNoticePage === pIdx;
                return (
                  <button
                    key={pIdx}
                    ref={el => { pageButtonRefs.current[pIdx] = el; }}
                    type="button"
                    onClick={() => {
                      setActiveNoticePage(pIdx);
                      setNoticeZoom(1);
                    }}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer whitespace-nowrap select-none active:scale-95 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                    }`}
                  >
                    <span>পৃষ্ঠা {toBn(pIdx + 1)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Semantic Figure with Image and SEO Markup */}
        {isPdfNotice && viewerTab === 'pdf' ? (
          <div className="w-full rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-slate-900 shadow-md overflow-hidden flex flex-col">
            <div className="px-4 py-2 bg-slate-800 text-slate-200 text-xs flex items-center justify-between border-b border-slate-700">
              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                <FileText className="w-3.5 h-3.5" />
                <span>{job.organization} মূল অফিশিয়াল সার্কুলার গেজেট (হাই-রেজোলিউশন PDF)</span>
              </span>
              <a
                href={officialPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white hover:text-emerald-300 font-bold flex items-center gap-1 underline"
              >
                নতুন ট্যাবে বড় করে দেখুন ↗
              </a>
            </div>
            <iframe
              src={`${officialPdfUrl}#view=FitH&toolbar=1`}
              className="w-full h-[650px] sm:h-[850px] border-0 bg-white"
              title={`${job.organization} অফিসিয়াল সার্কুলার PDF`}
            />
          </div>
        ) : (
        <figure className="relative rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-slate-100/60 p-2 sm:p-4 transition-all">
          <div className="overflow-auto w-full min-h-[400px] max-h-[95vh] sm:max-h-[1200px] flex justify-center items-start rounded-xl sm:rounded-2xl bg-white p-1 sm:p-4 shadow-xs">
            <div 
              className="transition-all duration-200 origin-top flex justify-center items-start"
              style={{ width: noticeZoom > 1 ? `${Math.round(noticeZoom * 100)}%` : '100%', minWidth: '100%' }}
            >
              <img
                src={noticePages[activeNoticePage]}
                alt={`${job.organization} নিয়োগ বিজ্ঞপ্তি ২০২৬ অফিসিয়াল মূল সার্কুলার গেজেট নোটিশ - পৃষ্ঠা ${toBn(activeNoticePage + 1)}`}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/api/circulars/')) {
                    target.src = `/api/circulars/${job.id}/page-1.svg`;
                  }
                }}
                title={`${job.organization} সার্কুলার গেজেট কপি - পৃষ্ঠা ${toBn(activeNoticePage + 1)} (ক্লিক করে বড় করুন)`}
                loading="eager"
                className="w-full max-w-4xl h-auto shadow-md rounded-lg border border-slate-200/80 cursor-zoom-in block"
                onClick={() => { setModalZoom(1); setIsModalOpen(true); }}
              />
            </div>
          </div>
          <figcaption className="text-center text-xs text-slate-600 font-medium pt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <span>{job.organization} অফিসিয়াল গ্যাজেট নোটিশ — পৃষ্ঠা {toBn(activeNoticePage + 1)} / {toBn(noticePages.length)}</span>
            <span className="text-emerald-700 font-bold">• সম্পূর্ণ দেখতে ছবিতে ক্লিক করুন</span>
          </figcaption>
        </figure>
        )}
      </section>

      {/* Fullscreen Interactive Lightbox Modal - 100% Pan & Drag + Zoom Support */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-2 sm:p-4">
          {/* Top Modal Bar */}
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between pb-2 text-white">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base truncate max-w-[180px] sm:max-w-md">
                {job.organization} গ্যাজেট নোটিশ
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-600/90 text-white rounded-full text-xs font-bold whitespace-nowrap">
                পৃষ্ঠা {toBn(activeNoticePage + 1)} / {toBn(noticePages.length)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={officialPdfUrl}
                download={`${job.organization || 'ChakriSheba'}-Circular.pdf`}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap"
                title="PDF ডাউনলোড"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF ডাউনলোড</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setModalZoom(1);
                  setIsModalOpen(false);
                }}
                className="p-1.5 sm:p-2 bg-white/15 hover:bg-white/25 rounded-full transition-colors text-white cursor-pointer active:scale-95"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Modal Image Pan & Scroll Area: Touch drag + Pinch to zoom + Mouse drag */}
          <div 
            ref={modalScrollRef}
            onMouseDown={handleModalMouseDown}
            onMouseMove={handleModalMouseMove}
            onMouseUp={handleModalMouseUp}
            onMouseLeave={handleModalMouseUp}
            onTouchStart={handleModalTouchStart}
            onTouchMove={handleModalTouchMove}
            onTouchEnd={handleModalTouchEnd}
            className={`flex-1 w-full max-w-6xl mx-auto overflow-auto bg-slate-950/90 rounded-2xl p-1 sm:p-4 flex justify-center items-start select-none touch-pan-x touch-pan-y ${
              modalZoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            }`}
            style={{ 
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}
          >
            <div 
              style={{
                width: modalZoom > 1 ? `${Math.round(modalZoom * 100)}%` : '100%',
                minWidth: '100%',
                maxWidth: modalZoom > 1 ? 'none' : '920px',
                transition: isModalDragging ? 'none' : 'width 0.15s ease-out'
              }}
              onClick={handleModalDoubleTap}
              className="flex justify-center items-start my-auto sm:my-0 select-none cursor-pointer"
            >
              <img
                src={noticePages[activeNoticePage]}
                alt={`${job.organization} সার্কুলার পূর্ণাঙ্গ কপি`}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/api/circulars/')) {
                    target.src = `/api/circulars/${job.id}/page-1.svg`;
                  }
                }}
                className="w-full h-auto object-contain shadow-2xl rounded-xl border border-white/10 block pointer-events-none select-none"
                draggable={false}
              />
            </div>
          </div>

          {/* Modal Bottom Navigator & Zoom Controls Bar */}
          <div className="w-full max-w-6xl mx-auto pt-2.5 flex items-center justify-between gap-2 text-white text-xs select-none">
            {/* Prev Page Button */}
            <button
              type="button"
              disabled={activeNoticePage === 0}
              onClick={() => {
                setActiveNoticePage(prev => Math.max(0, prev - 1));
                setModalZoom(1);
              }}
              className="px-2.5 sm:px-3 py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all flex-shrink-0"
              title="পূর্ববর্তী পৃষ্ঠা"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden xs:inline">আগের পৃষ্ঠা</span>
            </button>

            {/* Floating Zoom & Pan Capsule (Smooth Zoom In & Out) */}
            <div className="flex items-center gap-1 bg-slate-900/95 border border-white/20 px-2 py-1 rounded-full shadow-xl">
              <button
                type="button"
                onClick={() => setModalZoom(prev => Math.max(0.75, Number((prev - 0.25).toFixed(2))))}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/20 active:scale-95 rounded-full text-white transition-all cursor-pointer"
                title="জুম আউট (-)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              
              <button
                type="button"
                onClick={() => setModalZoom(1)}
                className="text-xs font-mono font-bold px-2 py-0.5 hover:text-emerald-400 hover:bg-white/10 rounded-full transition-all cursor-pointer"
                title="১০০% রিসেট করুন"
              >
                {Math.round(modalZoom * 100)}%
              </button>

              <button
                type="button"
                onClick={() => setModalZoom(prev => Math.min(3.5, Number((prev + 0.25).toFixed(2))))}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/20 active:scale-95 rounded-full text-white transition-all cursor-pointer"
                title="জুম ইন (+)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setModalZoom(1)}
                className="text-[11px] font-bold text-slate-300 hover:text-white px-2 py-0.5 hover:bg-white/15 rounded-full transition-all cursor-pointer ml-0.5"
                title="রিসেট"
              >
                রিসেট
              </button>
            </div>

            {/* Next Page Button */}
            <button
              type="button"
              disabled={activeNoticePage === noticePages.length - 1}
              onClick={() => {
                setActiveNoticePage(prev => Math.min(noticePages.length - 1, prev + 1));
                setModalZoom(1);
              }}
              className="px-2.5 sm:px-3 py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all flex-shrink-0"
              title="পরবর্তী পৃষ্ঠা"
            >
              <span className="hidden xs:inline">পরের পৃষ্ঠা</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-1">
            টিপস: দুই আঙুলে জুম করুন বা ডাবল ট্যাপ করুন • টেনে যেকোনো দিকে নিয়ে যান
          </div>
        </div>
      )}

      {/* 9.5. Google SEO FAQ Section with Dropdown Accordion */}
      <section aria-label="সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)" className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-3.5 sm:p-8 space-y-4 sm:space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span>{job.organization} নিয়োগ বিজ্ঞপ্তি ২০২৬ — সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)</span>
          </h2>
          <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
            চাকরিপ্রার্থীদের সাধারণ প্রশ্নসমূহ ও অফিশিয়াল নীতিমালার আলোকে প্রয়োজনীয় উত্তর নিচে দেওয়া হলো (ক্লিক করে উত্তর দেখুন):
          </p>
        </div>

        {/* Dropdown Accordion List - First item open by default */}
        <div className="space-y-3">
          {[
            ...(job.faqItems && job.faqItems.length > 0 ? job.faqItems.map((fi, idx) => ({
              id: 100 + idx,
              question: fi.question,
              answer: <span>{fi.answer}</span>,
              rawAnswer: fi.answer
            })) : []),
            {
              id: 0,
              question: `${job.organization} এই সার্কুলারে আবেদনের শেষ তারিখ ও সময় কখন?`,
              answer: (
                <span>
                  অনলাইনে আবেদনের শেষ তারিখ আগামী <strong className="text-rose-600 font-bold">{job.deadline}</strong>। শেষ মুহূর্তের সার্ভার জটিলতা এড়াতে নির্ধারিত সময়ের পূর্বেই আবেদন সম্পন্ন করার পরামর্শ দেওয়া হলো।
                </span>
              ),
              rawAnswer: `অনলাইনে আবেদনের শেষ তারিখ আগামী ${job.deadline}।`
            },
            {
              id: 1,
              question: 'শিক্ষা জীবনে কোনো পর্যায়ে ৩য় বিভাগ থাকলে কি আবেদন করা যাবে?',
              answer: (
                <span>
                  না, {job.organization}-এর অফিশিয়াল নিয়োগ নীতিমালা অনুযায়ী শিক্ষাজীবনে কোনো পর্যায়ে ৩য় বিভাগ/শ্রেণি বা সমমানের সিজিপিএ গ্রহণযোগ্য হবে না। সকল স্তরে ন্যূনতম ২য় বিভাগ বা সমমানের ফল থাকতে হবে।
                </span>
              ),
              rawAnswer: `${job.organization}-এর নীতিমালা অনুযায়ী কোনো পর্যায়ে ৩য় বিভাগ/শ্রেণি গ্রহণযোগ্য নয়।`
            },
            {
              id: 2,
              question: 'আবেদন ফি কত এবং কীভাবে পরিশোধ করতে হবে?',
              answer: (
                <span>
                  সরকারি পরীক্ষার ফি ৳{toBn(job.govtFee)} টাকা। আবেদনপত্র দাখিলের পর প্রাপ্ত User ID ব্যবহার করে টেলিটক প্রিপেইড সিম থেকে ৭২ ঘণ্টার মধ্যে দুটি SMS এর মাধ্যমে ফি পরিশোধ করতে হবে। চাকরি সেবার মাধ্যমে ১-ক্লিকে আবেদন করলে আমাদের টিম সরাসরি ফি প্রদান সম্পন্ন করে স্লিপ ড্যাশবোর্ডে প্রদান করে।
                </span>
              ),
              rawAnswer: `সরকারি পরীক্ষার ফি ৳${toBn(job.govtFee)} টাকা, যা টেলিটক সিমের মাধ্যমে ৭২ ঘণ্টার মধ্যে প্রদেয়।`
            },
            {
              id: 3,
              question: 'সাধারণ ও কোটাধারী প্রার্থীদের ক্ষেত্রে বয়সসীমা কত?',
              answer: (
                <span>
                  সাধারণ প্রার্থীদের বয়স {toBn(job.minAge)} হতে {toBn(job.maxAge)} বছর হতে হবে। তবে বীর মুক্তিযোদ্ধা/শহীদ মুক্তিযোদ্ধার সন্তান এবং শারীরিক প্রতিবন্ধী প্রার্থীদের ক্ষেত্রে বয়সসীমা ৩২ বছর পর্যন্ত শিথিলযোগ্য।
                </span>
              ),
              rawAnswer: `সাধারণ প্রার্থীদের বয়স ${toBn(job.minAge)} হতে ${toBn(job.maxAge)} বছর এবং কোটা প্রার্থীদের ক্ষেত্রে ৩২ বছর পর্যন্ত প্রযোজ্য।`
            }
          ].map((item) => {
            const isOpen = openFaqIndex === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-amber-50/40 border-amber-300 shadow-2xs'
                    : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : item.id)}
                  className="w-full text-left p-4 sm:p-4.5 flex items-center justify-between gap-3 font-bold text-slate-900 transition-colors cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                      isOpen ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {toBn(item.id + 1)}
                    </span>
                    <span className="text-sm sm:text-base leading-snug">{item.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-amber-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-4.5 pt-0 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-amber-200/50 mt-1 pl-13 sm:pl-13.5">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Google FAQPage JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              'mainEntity': [
                {
                  '@type': 'Question',
                  'name': `${job.organization} এই সার্কুলারে আবেদনের শেষ তারিখ ও সময় কখন?`,
                  'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `অনলাইনে আবেদনের শেষ তারিখ আগামী ${job.deadline}।`
                  }
                },
                {
                  '@type': 'Question',
                  'name': 'শিক্ষা জীবনে কোনো পর্যায়ে ৩য় বিভাগ থাকলে কি আবেদন করা যাবে?',
                  'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `${job.organization}-এর নীতিমালা অনুযায়ী ৩য় বিভাগ/শ্রেণি গ্রহণযোগ্য নয়।`
                  }
                },
                {
                  '@type': 'Question',
                  'name': 'আবেদন ফি কত এবং কীভাবে পরিশোধ করতে হবে?',
                  'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `সরকারি পরীক্ষার ফি ৳${job.govtFee} টাকা, যা টেলিটক সিমের মাধ্যমে ৭২ ঘণ্টার মধ্যে প্রদেয়।`
                  }
                },
                {
                  '@type': 'Question',
                  'name': 'সাধারণ ও কোটাধারী প্রার্থীদের ক্ষেত্রে বয়সসীমা কত?',
                  'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `সাধারণ প্রার্থীদের বয়স ${job.minAge} হতে ${job.maxAge} বছর এবং কোটা প্রার্থীদের ক্ষেত্রে ৩২ বছর পর্যন্ত প্রযোজ্য।`
                  }
                }
              ]
            })
          }}
        />
      </section>

      {/* 10. Previous Year Question Bank Promo Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden border border-emerald-900/40">
        <div className="space-y-2 max-w-xl relative z-10">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>বিগত ১০ বছরের প্রশ্নব্যাংক ও সমাধান</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black leading-snug">
            এই পদের বিগত বছরের প্রশ্ন ব্যাখ্যাসহ অনুশীলন করবেন?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            সরকারি ও ব্যাংক চাকরির পরীক্ষায় ৬০-৭০% প্রশ্ন বিগত বছরের প্যাটার্ন থেকে আসে। আমাদের প্রশ্নব্যাংকে প্রবেশ করে ইনস্ট্যান্ট কুইজ টেস্ট দিন ও ফ্রি PDF ডাউনলোড করুন।
          </p>
        </div>

        <Link
          href="/questions"
          className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 flex-shrink-0 hover:scale-105"
        >
          <span>প্রশ্নব্যাংক দেখুন (Free)</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      
      {/* 10.5. Semantic Related Jobs & Topic Clusters (Internal Linking Engine) */}
      {relatedJobs && relatedJobs.length > 0 && (
        <section aria-label="সম্পর্কিত অন্যান্য চলমান সার্কুলার" className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>সেমান্টিক টপিক ক্লাস্টার ও সম্পর্কিত সার্কুলার</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                একই ক্যাটাগরি ও যোগ্যতার অন্যান্য চলমান চাকরি
              </h2>
            </div>
            <Link
              href="/jobs"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 hover:underline"
            >
              <span>সকল সার্কুলার দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedJobs.map((rel) => (
              <Link
                key={rel.id}
                href={`/jobs/${rel.slug || rel.id}`}
                className="group p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between bg-slate-50/50 hover:bg-white"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {rel.categoryLabel || 'সরকারি'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {rel.totalPosts || 1}টি পদ
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                    {rel.title}
                  </h3>
                  <div className="text-xs text-slate-600 line-clamp-1">
                    {rel.organization}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{rel.deadline || 'চলমান'}</span>
                  </span>
                  <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    দেখুন →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 11. Sticky Mobile Floating Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 px-4 shadow-2xl md:hidden flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{toBn(job.daysRemaining)} দিন বাকি</span>
            {selectedPosition && (
              <span className="text-slate-500 font-normal">| {selectedPosition.grade}</span>
            )}
          </div>
          <div className="text-sm font-black text-slate-900">
            মোট খরচ:{' '}
            <span className="text-emerald-700">
              {selectedPosition ? `৳${toBn(activeTotalFee!)}` : hasVariableFee ? `৳${toBn(minTotalFee)} - ৳${toBn(maxTotalFee)}` : `৳${toBn(minTotalFee)}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleToggleSave}
            className={`p-2.5 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
              isSaved
                ? "bg-amber-50 text-amber-700 border-amber-300"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
            }`}
            title={isSaved ? "সংরক্ষিত" : "সেভ করুন"}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-500 text-amber-600" : "text-slate-600"}`} />
          </button>
          {isExpired ? (
            <div className="px-5 py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 flex-shrink-0 cursor-not-allowed select-none">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>আবেদন বন্ধ</span>
            </div>
          ) : (
            <Link
              href={applyHref}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 flex-shrink-0"
            >
              <span>আবেদন বুকিং দিন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Position-wise Fee Breakdown Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" /> পদ ও গ্রেডভেদে খরচের সম্পূর্ণ বিবরণী
                </div>
                <h3 className="text-lg font-black">{job.organization} — আবেদন ফি চার্ট</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFeeModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <p className="text-xs text-slate-600">
                এই সার্কুলারে বিভিন্ন গ্রেডের পদ রয়েছে। পদভেদে সরকারি আবেদন ফি আলাদা নির্ধারিত। আপনি যে পদের জন্য আবেদন করবেন শুধু সেই পদের ফি প্রযোজ্য হবে।
              </p>

              <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
                <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3">পদের নাম ও গ্রেড</th>
                      <th className="p-3 text-center">পদসংখ্যা</th>
                      <th className="p-3 text-right">সরকারি ফি</th>
                      <th className="p-3 text-right">টিম চার্জ</th>
                      <th className="p-3 text-right">মোট খরচ</th>
                      <th className="p-3 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {positions.map((pos: JobPosition, idx: number) => {
                      const pGovtFee = pos.govtFee ?? job.govtFee ?? 200;
                      const pTotal = pGovtFee + job.serviceFee;
                      const isSelected = selectedPosIndex === idx;
                      return (
                        <tr key={idx} className={isSelected ? 'bg-emerald-50/80 font-semibold' : 'hover:bg-slate-50'}>
                          <td className="p-3 font-bold text-slate-900">
                            <div>{pos.title}</div>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {pos.grade}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold text-slate-700">{toBn(pos.posts)} টি</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-800">৳{toBn(pGovtFee)}</td>
                          <td className="p-3 text-right font-mono text-slate-600">৳{toBn(job.serviceFee)}</td>
                          <td className="p-3 text-right font-mono font-black text-emerald-800 text-sm">৳{toBn(pTotal)}</td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPosIndex(idx);
                                setShowFeeModal(false);
                              }}
                              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg transition-colors whitespace-nowrap shadow-sm"
                            >
                              সিলেক্ট করুন
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>সতর্কতা:</strong> একজন প্রার্থী একই সার্কুলারে একাধিক পদে আবেদনের যোগ্য হলে প্রতিটি পদের জন্য আলাদাভাবে আবেদন ফরম পূরণ ও ফি পরিশোধ করতে হবে।
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-semibold">
                {selectedPosition ? `বর্তমান নির্বাচন: ${selectedPosition.title} (মোট ৳${toBn(activeTotalFee!)})` : 'কোনো নির্দিষ্ট পদ নির্বাচন করা হয়নি'}
              </span>
              <button
                type="button"
                onClick={() => setShowFeeModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}