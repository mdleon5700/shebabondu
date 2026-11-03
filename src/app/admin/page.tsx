'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { getDivisionForDistrict, normalizeToEnglishDistrict, normalizeToEnglishDivision } from '@/lib/constants';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  BarChart3,
  FileSpreadsheet,
  ShieldCheck,
  PenTool, 
  Users, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Upload, 
  Send, 
  Share2, 
  CreditCard, 
  Download, 
  Plus, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Search, 
  Filter, 
  Check, 
  X, 
  Tag, 
  Globe, 
  Rss, 
  Building, 
  Radio, 
  FileCheck, 
  AlertTriangle, 
  Lock, 
  Eye, 
  KeyRound, 
  RefreshCw, 
  Sliders, 
  History, 
  Menu, 
  ChevronRight, 
  LayoutDashboard, 
  Activity, 
  Briefcase, 
  PlusCircle, 
  UserCheck, 
  Shield, 
  Receipt, 
  PieChart, 
  DollarSign, 
  Gift, 
  Layers, 
  Layout, 
  Bell, 
  MessageSquare, 
  Mail, 
  ShieldAlert, 
  Database, 
  Settings, 
  HardDrive,
  Zap, 
  ArrowUpRight, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Phone, 
  Printer, 
  MessageCircle, 
  GraduationCap, 
  Award, 
  Calendar, 
  User 
} from 'lucide-react';
import CouponsRaffleManagement from '@/components/admin/CouponsRaffleManagement';
import WebsiteBuilder from '@/components/admin/WebsiteBuilder';
import SourceRegistryManagement from '@/components/admin/SourceRegistryManagement';
import SmsNotificationsManagement from '@/components/admin/SmsNotificationsManagement';
import SystemSettingsDiagnostics from '@/components/admin/SystemSettingsDiagnostics';
import WebsiteCmsSeoManagement from '@/components/admin/WebsiteCmsSeoManagement';
import FinancialTransactionsLedger from '@/components/admin/FinancialTransactionsLedger';
import CandidateManagementHub from '@/components/admin/CandidateManagementHub';
import JobVerificationCenter from '@/components/admin/JobVerificationCenter';
import JobContentStudio from '@/components/admin/JobContentStudio';
import JobPublishingCenter from '@/components/admin/JobPublishingCenter';
import JobCategorySearchManager from '@/components/admin/JobCategorySearchManager';
import JobFeedManager from '@/components/admin/JobFeedManager';
import DeadlineAlertManager from '@/components/admin/DeadlineAlertManager';
import SmartMatchingAdmin from '@/components/admin/SmartMatchingAdmin';
import PlatformOperationsHub from '@/components/admin/PlatformOperationsHub';
import AdminGlobalSearchModal from '@/components/admin/AdminGlobalSearchModal';
import PlatformGovernanceOverview from '@/components/admin/PlatformGovernanceOverview';
import UniversalJobWorkspace from '@/components/admin/UniversalJobWorkspace';
import MediaLibraryManager from '@/components/admin/MediaLibraryManager';
import OrganizationManagementHub from '@/components/admin/OrganizationManagementHub';
import CentralAutomationManager from '@/components/admin/CentralAutomationManager';
import AnalyticsIntelligenceHub from '@/components/admin/AnalyticsIntelligenceHub';
import TestingSpiderHub from '@/components/admin/TestingSpiderHub';

import { ApplicationRequest, JobCircular, JobSource, CircularDraft, CompanyProfile } from '@/lib/types';

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-bold text-slate-600">লোড হচ্ছে...</div>}>
      <AdminContent />
    </Suspense>
  );
}

// Helper to normalize payment gateway names
const normalizePaymentMethod = (m?: string | null): 'bKash' | 'Nagad' | 'Wallet' => {
  const str = (m || 'bKash').toLowerCase();
  if (str.includes('nagad') || str.includes('নগদ')) return 'Nagad';
  if (str.includes('wallet') || str.includes('ওয়ালেট')) return 'Wallet';
  return 'bKash';
};

const ADMIN_REQ_HEADERS = { 'Content-Type': 'application/json', 'x-admin-secret': '1234' };
function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminPin, setAdminPin] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active Module / Navigation State
  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

  // Keyboard shortcut Ctrl+K / Cmd+K for Central Admin Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live Server Data States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [applications, setApplications] = useState<ApplicationRequest[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<JobCircular[]>([]);
  const [sources, setSources] = useState<JobSource[]>([]);
  const [drafts, setDrafts] = useState<CircularDraft[]>([]);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalCandidates: 0,
    totalApplications: 0,
    pendingPayment: 0,
    processing: 0,
    completed: 0,
    totalRevenue: 0,
    activeCoupons: 0,
    activeRaffles: 0,
    totalDrafts: 0,
    totalSources: 0,
    totalCompanies: 0
  });

  // 2.1 All Applications Super Enhancements State
  const [appStatusFilter, setAppStatusFilter] = useState<'all' | 'pending_payment' | 'processing' | 'completed' | 'rejected'>('all');
  const [inspectingApp, setInspectingApp] = useState<ApplicationRequest | null>(null);
  const [copiedTrxId, setCopiedTrxId] = useState<string | null>(null);
  const [drawerTrackingId, setDrawerTrackingId] = useState('');
  const [drawerPdfUrl, setDrawerPdfUrl] = useState('');
  const [drawerNotes, setDrawerNotes] = useState('');
  const [isSubmittingDrawer, setIsSubmittingDrawer] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [drawerPassword, setDrawerPassword] = useState('');
  const [drawerCorporateId, setDrawerCorporateId] = useState('');
  const [drawerSubmissionChannel, setDrawerSubmissionChannel] = useState<'teletalk' | 'bank_erecruitment' | 'corporate_portal' | 'hr_email' | 'custom_portal' | 'postal_offline'>('teletalk');
  const [profileModalCandidate, setProfileModalCandidate] = useState<any | null>(null);
  const [profileModalApps, setProfileModalApps] = useState<ApplicationRequest[]>([]);
  const [printableReceiptApp, setPrintableReceiptApp] = useState<ApplicationRequest | null>(null);
  const [copiedFieldKey, setCopiedFieldKey] = useState<string | null>(null);

  // Step 2.2 Payment Verification States
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [isBulkApproving, setIsBulkApproving] = useState(false);
  const [paymentGatewayFilter, setPaymentGatewayFilter] = useState<'all' | 'bKash' | 'Nagad' | 'Wallet'>('all');
  const [paymentProofApp, setPaymentProofApp] = useState<ApplicationRequest | null>(null);

  // Step 2.3 Processing Queue States
  const [processingChannelFilter, setProcessingChannelFilter] = useState<'all' | 'teletalk' | 'bank_erecruitment' | 'corporate_portal' | 'hr_email' | 'custom_portal'>('all');
  const [processingSortOrder, setProcessingSortOrder] = useState<'deadline_urgent' | 'newest' | 'oldest' | 'channel'>('deadline_urgent');
  const [quickCopierApp, setQuickCopierApp] = useState<ApplicationRequest | null>(null);

  // Step 2.4 Completed & Rejected States
  const [completedSubFilter, setCompletedSubFilter] = useState<'all' | 'completed' | 'pdf_missing' | 'pdf_ready' | 'rejected'>('all');

  // Step 2.5 Documents Repository States
  const [docCategoryFilter, setDocCategoryFilter] = useState<'all' | 'teletalk' | 'bank' | 'admit_card' | 'missing' | 'other'>('all');
  const [docSearchTerm, setDocSearchTerm] = useState<string>('');
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState<string | null>(null);
  const [selectedDocAppIds, setSelectedDocAppIds] = useState<string[]>([]);
  const [quickUploadAppId, setQuickUploadAppId] = useState<string>('');
  const [quickUploadTrackingId, setQuickUploadTrackingId] = useState<string>('');
  const [isQuickUploadingDoc, setIsQuickUploadingDoc] = useState<boolean>(false);

  // Selected candidate modal
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  // Live Diagnostics State for Tab 1.2
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    timestamp: string;
    avgLatency: number;
    passed: number;
    total: number;
    dbCounts: { candidates: number; applications: number; jobs: number; sources: number };
    checks: { name: string; url: string; latency: number; status: 'ok' | 'error'; note: string }[];
  } | null>(null);

  const runLiveDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    const checks: { name: string; url: string; latency: number; status: 'ok' | 'error'; note: string }[] = [];
    
    const endpoints = [
      { name: 'সার্ভার এনালিটিক্স ও মেমোরি এপিআই', url: '/api/admin/stats' },
      { name: 'চাকরি আবেদন ডাটাবেজ ও কিউ', url: '/api/applications' },
      { name: 'চাকরিপ্রার্থী ডিরেক্টরি ও ভল্ট', url: '/api/admin/candidates' },
      { name: 'অফিসিয়াল সার্কুলার ম্যানেজমেন্ট', url: '/api/admin/jobs' },
      { name: 'টেলিটক ও সরকারি জব স্ক্র্যাপার সোর্স', url: '/api/admin/sources' },
    ];

    let totalLatency = 0;
    let passedCount = 0;

    for (const ep of endpoints) {
      const t0 = performance.now();
      try {
        const res = await fetch(ep.url, { headers: { 'x-admin-secret': '1234' } });
        const t1 = performance.now();
        const latency = Math.round(t1 - t0);
        totalLatency += latency;
        if (res.ok) {
          passedCount++;
          checks.push({
            name: ep.name,
            url: ep.url,
            latency,
            status: 'ok',
            note: `HTTP ${res.status} OK (সক্রিয় ও রেসপন্সিভ)`
          });
        } else {
          checks.push({
            name: ep.name,
            url: ep.url,
            latency,
            status: 'error',
            note: `HTTP ${res.status} (অনাকাঙ্ক্ষিত কোড)`
          });
        }
      } catch (err: any) {
        checks.push({
          name: ep.name,
          url: ep.url,
          latency: 0,
          status: 'error',
          note: `নেটওয়ার্ক সংযোগ ত্রুটি: ${err.message}`
        });
      }
    }

    setDiagnosticResult({
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      avgLatency: Math.round(totalLatency / endpoints.length),
      passed: passedCount,
      total: endpoints.length,
      dbCounts: {
        candidates: candidates.length,
        applications: applications.length,
        jobs: jobs.length,
        sources: sources.length
      },
      checks
    });

    setIsRunningDiagnostics(false);
  };

  // Edit Job Modal & Circulars Table States
  const [editingJob, setEditingJob] = useState<JobCircular | null>(null);
  const [isCreatingNewJob, setIsCreatingNewJob] = useState(false);
  const [contentStudioDraftId, setContentStudioDraftId] = useState<string>('');
  const [isUpdatingJob, setIsUpdatingJob] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobCategoryFilter, setJobCategoryFilter] = useState('ALL');
  const [jobStatusFilter, setJobStatusFilter] = useState<'ALL' | 'OPEN' | 'EXPIRED' | 'UPCOMING'>('ALL');
  const [jobSortBy, setJobSortBy] = useState<'newest' | 'vacancies' | 'deadline'>('newest');
  const [isDeletingJobId, setIsDeletingJobId] = useState<string | null>(null);

  // Sub-Positions for Create Circular Form
  const [newPositions, setNewPositions] = useState<{ title: string; grade: string; posts: number; salary: string; minEducation: string }[]>([]);
  const [newPosTitle, setNewPosTitle] = useState('');
  const [newPosGrade, setNewPosGrade] = useState('৯ম গ্রেড');
  const [newPosPosts, setNewPosPosts] = useState('১');
  const [newPosSalary, setNewPosSalary] = useState('');
  const [newPosEdu, setNewPosEdu] = useState('');

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${jobTitle}" সার্কুলারটি স্থায়ীভাবে মুছে ফেলতে চান?`)) return;
    setIsDeletingJobId(jobId);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: ADMIN_REQ_HEADERS
      });
      const data = await res.json();
      if (data.success) {
        alert('সার্কুলারটি সফলভাবে মুছে ফেলা হয়েছে!');
        setJobs(prev => prev.filter(j => j.id !== jobId));
        if (editingJob && editingJob.id === jobId) setEditingJob(null);
      } else {
        alert(data.error || 'সার্কুলারটি মুছতে সমস্যা হয়েছে।');
      }
    } catch {
      alert('সার্ভার এরর: সংযোগ ব্যর্থ হয়েছে।');
    } finally {
      setIsDeletingJobId(null);
    }
  };

  const handleToggleJobStatus = async (job: JobCircular) => {
    const cur = (job as any).status || (job.daysRemaining > 0 ? 'OPEN' : 'EXPIRED');
    const nextStatus = cur === 'OPEN' ? 'EXPIRED' : 'OPEN';
    const nextDays = nextStatus === 'OPEN' ? 15 : 0;
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}`, {
        method: 'PUT',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({ ...job, status: nextStatus, daysRemaining: nextDays })
      });
      const data = await res.json();
      if (data.success) {
        setJobs(prev => prev.map(j => j.id === job.id ? data.job : j));
      }
    } catch {
      alert('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  const handleAutoGenerateSeo = () => {
    if (!newTitle.trim() && !newOrg.trim()) {
      alert('আগে পদবী ও প্রতিষ্ঠানের নাম লিখুন!');
      return;
    }
    const t = `${newTitle} - ${newOrg} নিয়োগ বিজ্ঞপ্তি ২০২৬ | চাকরি সেবা`;
    const d = `${newOrg}-এ ${newTitle || 'বিভিন্ন পদে'} বিশাল নিয়োগ বিজ্ঞপ্তি ২০২৬। মোট পদসংখ্যা: ${newVacancies || 1}টি, আবেদনের শেষ সময়: ${newDeadline || 'শীঘ্রই'}। অনলাইনে আবেদনের সঠিক নিয়ম ও শর্তাবলী জেনে চাকরি সেবায় আবেদন করুন।`;
    const s = (newOrg + '-' + newTitle).toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const kw = `${newOrg}, ${newTitle}, সরকারি চাকরি ২০২৬, নিয়োগ বিজ্ঞপ্তি, bd jobs circular`;
    setNewSeoTitle(t.slice(0, 60));
    setNewSeoDescription(d.slice(0, 160));
    setNewSlug(s || 'circular-notice');
    setNewSeoKeywords(kw);
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (jobSearchQuery.trim()) {
        const q = jobSearchQuery.toLowerCase().trim();
        const matchTitle = job.title?.toLowerCase().includes(q);
        const matchOrg = job.organization?.toLowerCase().includes(q);
        const matchGrade = job.grade?.toLowerCase().includes(q);
        const matchId = job.id?.toLowerCase().includes(q);
        if (!matchTitle && !matchOrg && !matchGrade && !matchId) return false;
      }
      if (jobCategoryFilter !== 'ALL' && job.category !== jobCategoryFilter) {
        return false;
      }
      if (jobStatusFilter !== 'ALL') {
        const rawSt = String((job as any).status || (job as any).lifecycleStatus || ((job.daysRemaining || 0) > 0 ? 'OPEN' : 'EXPIRED')).toUpperCase();
        const isOpen = ['OPEN', 'PUBLISHED', 'ACTIVE'].includes(rawSt);
        if (jobStatusFilter === 'OPEN' && !isOpen) return false;
        if (jobStatusFilter === 'EXPIRED' && isOpen) return false;
      }
      return true;
    }).sort((a, b) => {
      if (jobSortBy === 'vacancies') {
        return (b.totalPosts || 0) - (a.totalPosts || 0);
      }
      if (jobSortBy === 'deadline') {
        return (a.daysRemaining || 0) - (b.daysRemaining || 0);
      }
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [jobs, jobSearchQuery, jobCategoryFilter, jobStatusFilter, jobSortBy]);

  const handleUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    setIsUpdatingJob(true);
    try {
      const res = await fetch(`/api/admin/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify(editingJob)
      });
      const data = await res.json();
      if (data.success) {
        alert('বিজ্ঞপ্তির তথ্য সফলভাবে আপডেট হয়েছে!');
        setJobs(prev => prev.map(j => j.id === editingJob.id ? data.job : j));
        setEditingJob(null);
      } else {
        alert(data.error || 'আপডেট করতে সমস্যা হয়েছে।');
      }
    } catch (err: any) {
      alert('নেটওয়ার্ক সমস্যা: ' + err.message);
    } finally {
      setIsUpdatingJob(false);
    }
  };

  // New Circular Form State
  const [newTitle, setNewTitle] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newCategory, setNewCategory] = useState<'govt' | 'bank' | 'railway' | 'defense' | 'teacher' | 'ngo' | 'private'>('govt');
  const [newGrade, setNewGrade] = useState('৯ম গ্রেড');
  const [newVacancies, setNewVacancies] = useState('১২৫');
  const [newSalary, setNewSalary] = useState('২২,০০০ - ৫৩,০৬০ টাকা');
  const [newEducation, setNewEducation] = useState('স্নাতক (সম্মান) বা সমমানের ডিগ্রি');
  const [newDeadline, setNewDeadline] = useState('৩০ নভেম্বর ২০২৬');
  const [newDistricts, setNewDistricts] = useState('সকল জেলা');
  const [newGovtFee, setNewGovtFee] = useState(200);
  const [newServiceFee, setNewServiceFee] = useState(80);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [newMinAge, setNewMinAge] = useState(18);
  const [newMaxAge, setNewMaxAge] = useState(32);
  const [newAgeCutOffDate, setNewAgeCutOffDate] = useState('2026-11-01');
  const [newOfficialLink, setNewOfficialLink] = useState('https://alljobs.teletalk.com.bd');
  const [newCircularPdfUrl, setNewCircularPdfUrl] = useState('');
  const [newAllowThirdDivision, setNewAllowThirdDivision] = useState(true);
  const [newSeoTitle, setNewSeoTitle] = useState('');
  const [newSeoDescription, setNewSeoDescription] = useState('');
  const [newSeoKeywords, setNewSeoKeywords] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [editingDraft, setEditingDraft] = useState<CircularDraft | null>(null);
  const [isApprovingDraft, setIsApprovingDraft] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [showDraftPdfPreview, setShowDraftPdfPreview] = useState(false);
  const [simSelectedCandidateId, setSimSelectedCandidateId] = useState<string>('');
  const [simSelectedJobId, setSimSelectedJobId] = useState<string>('');
  const [simResult, setSimResult] = useState<any | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleTabChange = (tabId: string) => {
    if (tabId === 'create-circular') {
      setActiveTab('circulars');
      setEditingJob(null);
      setIsCreatingNewJob(true);
      setIsMobileMenuOpen(false);
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', 'circulars');
        window.history.pushState({}, '', url.toString());
      } catch (e) {}
      return;
    }
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    // Reset child filters when switching main tabs so view starts clean and predictable
    if (tabId === 'payment-verification') {
      setPaymentGatewayFilter('all');
    } else if (tabId === 'processing-queue') {
      setProcessingChannelFilter('all');
      setProcessingSortOrder('deadline_urgent');
    } else if (tabId === 'completed-rejected') {
      setCompletedSubFilter('all');
    } else if (tabId === 'documents') {
      setDocCategoryFilter('all');
      setDocSearchTerm('');
    } else if (tabId === 'all-applications') {
      setAppStatusFilter('all');
    }
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.pushState({}, '', url.toString());
  };

  // Self-healing session sync: ensures valid admin cookie before calling protected APIs
  const ensureAdminSession = async (): Promise<boolean> => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.isLoggedIn && meData.role === 'admin') {
          return true;
        }
      }

      if (typeof window !== 'undefined' && localStorage.getItem('cs_admin_auth') === 'verified') {
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'admin', adminPin: '1234' })
        });
        if (loginRes.ok) {
          const lData = await loginRes.json();
          if (lData.success) return true;
        }
      }
    } catch (e) {
      console.error('Session sync error:', e);
    }
    return false;
  };

  const fetchAllAdminData = async () => {
    setIsLoading(true);
    try {
      // 1. Ensure admin session cookie is active
      if (!await ensureAdminSession()) {
        setIsAdminAuthenticated(false);
        return;
      }

      const adminHeaders = {
        'Content-Type': 'application/json',
        'x-admin-secret': '1234'
      };

      // 2. Fetch stats FIRST to immediately populate all count badges in <100ms
      try {
        const resStats = await fetch('/api/admin/stats', { headers: adminHeaders });
        if (resStats.ok) {
          const sData = await resStats.json();
          if (sData.stats || sData) {
            setStats(sData.stats || sData);
          }
        }
      } catch (sErr) {
        console.warn('Initial stats load failed:', sErr);
      }

      // 3. Fetch remaining modules concurrently without blocking each other
      await Promise.allSettled([
        fetch('/api/applications', { headers: adminHeaders }).then(async r => {
          if (r.ok) {
            const data = await r.json();
            setApplications(Array.isArray(data) ? data : (data.applications || []));
          }
        }),
        fetch('/api/admin/jobs', { headers: adminHeaders }).then(async r => {
          if (r.ok) {
            const data = await r.json();
            setJobs(data.jobs || []);
          }
        }),
        fetch('/api/admin/candidates', { headers: adminHeaders }).then(async r => {
          if (r.ok) {
            const data = await r.json();
            setCandidates(data.candidates || []);
          }
        }),
        fetch('/api/admin/sources', { headers: adminHeaders }).then(async r => {
          if (r.ok) {
            const data = await r.json();
            setSources(data.sources || []);
          }
        }),
        fetch('/api/admin/sources/drafts', { headers: adminHeaders }).then(async r => {
          if (r.ok) {
            const data = await r.json();
            setDrafts(data.drafts || []);
          }
        }),
        fetch('/api/admin/companies', { headers: adminHeaders }).then(async r => {
          if (r.ok) {
            const data = await r.json();
            setCompanies(data.companies || []);
          }
        }),
        fetch('/api/admin/audit-logs', { headers: adminHeaders }).then(async r => {
          if (r.ok) {
            const data = await r.json();
            setAuditLogs(data.logs || []);
          }
        })
      ]);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAdminAuth = async () => {
      const hasSession = await ensureAdminSession();
      setIsAdminAuthenticated(hasSession);
      if (hasSession) await fetchAllAdminData();
      else setIsLoading(false);
    };
    checkAdminAuth();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin', adminPin: adminPin.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        localStorage.setItem('cs_admin_auth', 'verified');
        fetchAllAdminData();
      } else {
        setAuthError(data.error || 'ভুল অ্যাডমিন সিক্রেট পিন!');
      }
    } catch {
      setAuthError('সার্ভারে যোগাযোগ করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('আপনি কি নিশ্চিত যে অ্যাডমিন কনসোল থেকে লগআউট করতে চান?')) return;
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('cs_admin_auth');
    setIsAdminAuthenticated(false);
    setActiveTab('dashboard');
  };

  // Bulk Approval Handler for Step 2.2 Payment Verification
  const handleBulkApprovePayments = async () => {
    if (selectedPaymentIds.length === 0) return;
    if (!confirm(`আপনি কি নিশ্চিত যে নির্বাচিত ${selectedPaymentIds.length} টি পেমেন্ট একসাথে অনুমোদন করতে চান?`)) return;

    setIsBulkApproving(true);
    let successCount = 0;
    try {
      for (const appId of selectedPaymentIds) {
        try {
          const res = await fetch(`/api/applications/${appId}`, {
            method: 'PATCH',
            headers: ADMIN_REQ_HEADERS,
            body: JSON.stringify({
              applicationId: appId,
              status: 'processing',
              notes: 'বাল্ক পেমেন্ট অনুমোদন সম্পন্ন হয়েছে এবং প্রসেসিং কিউতে পাঠানো হয়েছে।'
            })
          });
          if (res.ok) successCount++;
        } catch (e) {}
      }
      alert(`✓ ${successCount} টি পেমেন্ট সফলভাবে এক ক্লিকে অনুমোদন করা হয়েছে!`);
      setSelectedPaymentIds([]);
      fetchAllAdminData();
    } catch {
      alert('বাল্ক অনুমোদনে কিছু সমস্যা হয়েছে।');
    } finally {
      setIsBulkApproving(false);
    }
  };

  const toggleSelectPayment = (id: string) => {
    setSelectedPaymentIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleApprovePayment = async (appId: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({
          applicationId: appId,
          status: 'processing',
          notes: 'পেমেন্ট অনুমোদিত হয়েছে এবং টেলিটক অটো-ফিল কিউতে পাঠানো হয়েছে।'
        })
      });
      if (res.ok) {
        alert('পেমেন্ট সফলভাবে অনুমোদিত এবং আবেদন প্রসেসিং কিউতে পাঠানো হয়েছে!');
        fetchAllAdminData();
      } else {
        const d = await res.json();
        alert(d.error || 'ব্যর্থ হয়েছে');
      }
    } catch {
      alert('সার্ভার এরর');
    }
  };

  const handleRejectPayment = async (appId: string) => {
    const reason = prompt('বাতিলের কারণ লিখুন (যেমন: ভুল ট্রানজেকশন আইডি বা টাকা পাওয়া যায়নি):', 'অকার্যকর ট্রানজেকশন আইডি');
    if (!reason) return;
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({
          applicationId: appId,
          status: 'rejected',
          notes: 'আবেদন বাতিল করা হয়েছে: ' + reason
        })
      });
      if (res.ok) {
        alert('আবেদন বাতিল করা হয়েছে।');
        fetchAllAdminData();
      }
    } catch {
      alert('ব্যর্থ হয়েছে');
    }
  };

  const handleUpdateTrackingId = async (appId: string) => {
    const tracking = prompt('টেলিটক ট্র্যাকিং আইডি / ইউজার আইডি প্রদান করুন:', 'TELETALK-' + Math.floor(100000 + Math.random() * 900000));
    if (!tracking) return;
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({
          applicationId: appId,
          teleTalkTrackingId: tracking,
          status: 'processing',
          notes: 'টেলিটক ট্র্যাকিং আইডি যুক্ত করা হয়েছে: ' + tracking
        })
      });
      if (res.ok) {
        alert('ট্র্যাকিং আইডি সফলভাবে সংরক্ষিত হয়েছে!');
        fetchAllAdminData();
      }
    } catch {
      alert('ব্যর্থ হয়েছে');
    }
  };

  const handleRestoreToProcessing = async (appId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে আবেদনটি বাতিল তালিকা থেকে পুনরায় প্রসেসিং কিউতে পাঠাতে চান?')) return;
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({
          applicationId: appId,
          status: 'processing',
          notes: 'আবেদনটি বাতিল তালিকা থেকে পুনরায় প্রসেসিং কিউতে ফিরিয়ে নেওয়া হয়েছে।'
        })
      });
      if (res.ok) {
        alert('আবেদনটি সফলভাবে পুনরায় প্রসেসিং কিউতে পাঠানো হয়েছে!');
        fetchAllAdminData();
      } else {
        const d = await res.json();
        alert(d.error || 'ব্যর্থ হয়েছে');
      }
    } catch {
      alert('সার্ভার এরর');
    }
  };

  const handleAttachPdf = async (appId: string) => {
    const pdfUrl = prompt('অ্যাপ্লিক্যান্ট কপি PDF এর লিংক দিন:', 'https://alljobs.teletalk.com.bd/applicant-copy/' + appId + '.pdf');
    if (!pdfUrl) return;
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({
          applicationId: appId,
          applicantCopyPdfUrl: pdfUrl,
          status: 'completed',
          notes: 'অফিসিয়াল অ্যাপ্লিক্যান্ট কপি আপলোড সম্পন্ন। আবেদনকারীকে এসএমএস অ্যালার্ট পাঠানো হয়েছে।'
        })
      });
      if (res.ok) {
        alert('অ্যাপ্লিক্যান্ট কপি যুক্ত ও আবেদন সফলভাবে সম্পন্ন করা হয়েছে!');
        fetchAllAdminData();
      }
    } catch {
      alert('ব্যর্থ হয়েছে');
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newOrg.trim()) {
      alert('পদবীর নাম এবং প্রতিষ্ঠানের নাম আবশ্যক!');
      return;
    }
    setIsSubmittingJob(true);
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({
          title: newTitle.trim(),
          organization: newOrg.trim(),
          category: newCategory,
          grade: newGrade,
          totalPosts: newPositions.length > 0 ? newPositions.reduce((s, p) => s + (Number(p.posts) || 0), 0) : (parseInt(newVacancies) || 1),
          positions: newPositions,
          salary: newSalary,
          minEducation: newEducation,
          districts: newDistricts,
          deadline: newDeadline,
          govtFee: Number(newGovtFee) || 200,
          serviceFee: Number(newServiceFee) || 80,
          minAge: Number(newMinAge) || 18,
          maxAge: Number(newMaxAge) || 32,
          ageCutOffDate: newAgeCutOffDate || '2026-11-01',
          officialLink: newOfficialLink || 'https://alljobs.teletalk.com.bd',
          circularPdfUrl: newCircularPdfUrl || '',
          allowThirdDivision: newAllowThirdDivision,
          seoTitle: newSeoTitle.trim(),
          seoDescription: newSeoDescription.trim(),
          seoKeywords: newSeoKeywords ? newSeoKeywords.split(',').map(s => s.trim()).filter(Boolean) : [],
          slug: newSlug.trim()
        })
      });
      if (res.ok) {
        alert('নতুন সার্কুলার সফলভাবে লাইভ প্রকাশ করা হয়েছে!');
        setNewTitle('');
        setNewOrg('');
        setNewSeoTitle('');
        setNewSeoDescription('');
        setNewSeoKeywords('');
        setNewSlug('');
        setNewCircularPdfUrl('');
        setActiveTab('circulars');
        fetchAllAdminData();
      } else {
        const d = await res.json();
        alert(d.error || 'পোস্ট ব্যর্থ হয়েছে');
      }
    } catch {
      alert('সার্ভার সংযোগ সমস্যা');
    } finally {
      setIsSubmittingJob(false);
    }
  };

    const handleRunEligibilitySimulation = async () => {
    if (!simSelectedCandidateId || !simSelectedJobId) {
      alert('দয়া করে প্রার্থী এবং সার্কুলার উভয়ই নির্বাচন করুন।');
      return;
    }
    setIsSimulating(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/eligibility/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: simSelectedCandidateId,
          jobId: simSelectedJobId
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'সিমুলেশন ব্যর্থ হয়েছে।');
      }
      setSimResult(data);
    } catch (err: any) {
      alert('সিমুলেশন ত্রুটি: ' + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleGenerateAiContent = async (draft: CircularDraft) => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/admin/ai/generate-job-content', {
        method: 'POST',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({ draftId: draft.id, draft })
      });
      const data = await res.json();
      if (res.ok && data.success && data.content) {
        const enriched = {
          ...draft,
          aiGeneratedContent: {
            bengaliDescription: data.content.bengaliDescription,
            seoTitle: data.content.seoTitle,
            seoDescription: data.content.seoDescription,
            targetKeywords: data.content.targetKeywords,
            faqItems: data.content.faqItems,
            generatedAt: new Date().toISOString()
          }
        };
        setEditingDraft(enriched);
        setDrafts(prev => prev.map(d => d.id === draft.id ? enriched : d));
        alert('Gemini AI দ্বারা খাঁটি বাংলা কনটেন্ট ও এসইও সফলভাবে প্রস্তুত হয়েছে!');
      } else {
        alert(`AI জেনারেশন ব্যর্থ: ${data.error || 'অজানা সমস্যা'}`);
      }
    } catch (e: any) {
      alert(`সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে: ${e.message}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleApproveDraft = async (draft: CircularDraft, customOverrides?: any) => {
    if (!customOverrides && !confirm('আপনি কি এই খসড়া সার্কুলারটি অনুমোদন করে মূল ওয়েবসাইটে প্রকাশ করতে চান?')) return;
    setIsApprovingDraft(true);
    try {
      const res = await fetch('/api/admin/sources/drafts', {
        method: 'POST',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({ 
          action: 'approve', 
          draftId: draft.id,
          overrides: customOverrides || undefined
        })
      });
      if (res.ok) {
        alert('খসড়াটি সফলভাবে অনুমোদিত এবং মূল ওয়েবসাইটে লাইভ প্রকাশিত হয়েছে!');
        setEditingDraft(null);
        fetchAllAdminData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`অনুমোদন ব্যর্থ: ${err.error || 'অজানা ত্রুটি'}`);
      }
    } catch {
      alert('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে');
    } finally {
      setIsApprovingDraft(false);
    }
  };

  const handleRejectDraft = async (draft: CircularDraft) => {
    if (!confirm(`আপনি কি "${draft.extractedTitle}" খসড়াটি বাতিল করতে চান?`)) return;
    try {
      const res = await fetch('/api/admin/sources/drafts', {
        method: 'POST',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({ action: 'reject', draftId: draft.id })
      });
      if (res.ok) {
        alert('খসড়া সার্কুলারটি সফলভাবে বাতিল করা হয়েছে।');
        fetchAllAdminData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`বাতিল ব্যর্থ: ${err.error || 'অজানা ত্রুটি'}`);
      }
    } catch {
      alert('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে');
    }
  };

  const handleToggleCompanyVerify = async (compId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'PATCH',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({ companyId: compId, verified: !currentStatus })
      });
      if (res.ok) {
        alert('কোম্পানির ভেরিফিকেশন স্ট্যাটাস হালনাগাদ করা হয়েছে!');
        fetchAllAdminData();
      }
    } catch {
      alert('ব্যর্থ হয়েছে');
    }
  };

  const handleDownloadBackup = () => {
    const backupData = {
      backupDate: new Date().toISOString(),
      platform: 'Chakri Sheba BD Enterprise',
      version: '2.6',
      stats,
      applications,
      candidates,
      jobs,
      sources,
      drafts,
      companies,
      auditLogs
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chakriseba_backup_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
  };

  // Duplicate TrxID Detection Map
  const duplicateTrxMap = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach(a => {
      if (a.trxId && a.trxId.trim()) {
        const clean = a.trxId.trim().toUpperCase();
        counts[clean] = (counts[clean] || 0) + 1;
      }
    });
    return counts;
  }, [applications]);

  // Copy TrxID with quick feedback
  const handleCopyTrxId = (trx: string) => {
    if (!trx) return;
    navigator.clipboard.writeText(trx);
    setCopiedTrxId(trx);
    setTimeout(() => setCopiedTrxId(null), 2500);
  };

  // Inspecting Candidate match for Drawer
  const inspectingCandidate = useMemo(() => {
    if (!inspectingApp) return null;
    return candidates.find(c => 
      c.id === (inspectingApp as any).candidateId || 
      (inspectingApp.candidatePhone && c.phone && (c.phone === inspectingApp.candidatePhone || c.phone.replace(/\D/g, '') === inspectingApp.candidatePhone.replace(/\D/g, '')))
    );
  }, [inspectingApp, candidates]);

  // Direct PDF Upload Handler
  // Step 2.5: Direct Drag & Drop / Quick File Upload for Applicant Copy
  const handleQuickUploadApplicantCopy = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!quickUploadAppId) {
      alert('অনুগ্রহ করে ড্রপডাউন থেকে আবেদনকারী নির্বাচন করুন।');
      return;
    }

    setIsQuickUploadingDoc(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('appId', quickUploadAppId);

    try {
      const res = await fetch('/api/admin/upload-applicant-copy', {
        method: 'POST',
        headers: { },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (quickUploadTrackingId.trim()) {
          await fetch(`/api/applications/${quickUploadAppId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              applicationId: quickUploadAppId,
              teleTalkTrackingId: quickUploadTrackingId.trim()
            })
          });
        }
        alert(`ফাইল সফলভাবে আপলোড ও সংযুক্ত হয়েছে: ${data.fileName}`);
        setQuickUploadAppId('');
        setQuickUploadTrackingId('');
        fetchAllAdminData();
      } else {
        alert(data.error || 'আপলোড ব্যর্থ হয়েছে');
      }
    } catch {
      alert('সার্ভার যোগাযোগ ত্রুটি');
    } finally {
      setIsQuickUploadingDoc(false);
    }
  };

  // Step 2.5: Unlink / Delete Applicant Copy
  const handleUnlinkPdf = async (appId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই আবেদন থেকে অ্যাপ্লিক্যান্ট কপিটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: ADMIN_REQ_HEADERS,
        body: JSON.stringify({
          applicationId: appId,
          applicantCopyPdfUrl: '',
          notes: 'অ্যাপ্লিক্যান্ট কপি মুছে ফেলা হয়েছে।'
        })
      });
      if (res.ok) {
        alert('অ্যাপ্লিক্যান্ট কপি সফলভাবে সরানো হয়েছে!');
        fetchAllAdminData();
      } else {
        const d = await res.json();
        alert(d.error || 'ব্যর্থ হয়েছে');
      }
    } catch {
      alert('সার্ভার এরর');
    }
  };

  // Step 2.5: Export Documents CSV
  const exportDocumentsCsv = () => {
    const list = applications.filter(a => a.applicantCopyPdfUrl || a.pdfUrl);
    if (list.length === 0) {
      alert('এক্সপোর্ট করার মতো কোনো ডকুমেন্ট পাওয়া যায়নি।');
      return;
    }
    const headers = ['আবেদন আইডি', 'প্রার্থীর নাম', 'মোবাইল নম্বর', 'পদবী', 'প্রতিষ্ঠান', 'ট্র্যাকিং আইডি', 'ডকুমেন্ট লিঙ্ক'];
    const rows = list.map(a => [
      a.id,
      `"${a.candidateName || ''}"`,
      a.candidatePhone || '',
      `"${a.jobTitle || ''}"`,
      `"${a.organization || ''}"`,
      a.teleTalkTrackingId || a.corporateTrackingId || '',
      a.applicantCopyPdfUrl || a.pdfUrl || ''
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `chakriseba_applicant_documents_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePdfFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !inspectingApp) return;

    setIsUploadingPdf(true);
    setUploadSuccessMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('appId', inspectingApp.id);

    try {
      const res = await fetch('/api/admin/upload-applicant-copy', {
        method: 'POST',
        headers: {
          },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDrawerPdfUrl(data.url);
        setUploadSuccessMessage(`ফাইল সফলভাবে আপলোড হয়েছে: ${data.fileName}`);
        fetchAllAdminData();
      } else {
        alert(data.error || 'ফাইল আপলোড ব্যর্থ হয়েছে');
      }
    } catch {
      alert('সার্ভার আপলোড যোগাযোগ ত্রুটি');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  // 1-Click Vault Field Copier
  const handleCopyField = (val: string, key: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedFieldKey(key);
    setTimeout(() => setCopiedFieldKey(null), 2000);
  };

  const openCandidateProfileModal = (candidatePhoneOrId: string, currentAppId?: string) => {
    const cand = candidates.find(c => 
      c.id === candidatePhoneOrId || 
      (c.phone && candidatePhoneOrId && (c.phone === candidatePhoneOrId || c.phone.replace(/\D/g, '') === candidatePhoneOrId.replace(/\D/g, '')))
    );
    if (cand) {
      setProfileModalCandidate(cand);
      const apps = applications.filter(a => 
        (a as any).candidateId === cand.id || 
        (a.candidatePhone && cand.phone && a.candidatePhone.replace(/\D/g, '') === cand.phone.replace(/\D/g, ''))
      );
      setProfileModalApps(apps);
    } else {
      const matchedApp = applications.find(a => a.id === currentAppId || a.candidatePhone === candidatePhoneOrId);
      if (matchedApp) {
        const fallbackCand = {
          id: (matchedApp as any).candidateId || 'USR-' + (matchedApp.candidatePhone ? matchedApp.candidatePhone.replace(/\D/g, '') : 'DEMO'),
          name: matchedApp.candidateName,
          nameBn: matchedApp.candidateName,
          fatherName: 'MD. ABDUR RAHMAN',
          fatherNameBn: 'মোঃ আব্দুর রহমান',
          motherName: 'FATEMA BEGUM',
          motherNameBn: 'মোসাঃ ফাতেমা বেগম',
          phone: matchedApp.candidatePhone,
          email: (matchedApp.candidatePhone ? matchedApp.candidatePhone.replace(/\D/g, '') : 'user') + '@candidate.chakrisheba.com',
          district: matchedApp.candidateDistrict || 'ঢাকা',
          nid: '19952692518000214',
          fatherNid: '19702692518000101',
          motherNid: '19752692518000202',
          walletBalance: 450,
          quota: 'none',
          education: (matchedApp as any).submittedEducation || [
            { level: 'এসএসসি', boardOrUni: 'ঢাকা বোর্ড (বিজ্ঞান)', roll: '148209', reg: '110293', year: '2014', result: '5.00' },
            { level: 'এইচএসসি', boardOrUni: 'ঢাকা বোর্ড (বিজ্ঞান)', roll: '119402', reg: '110293', year: '2016', result: '4.83' },
            { level: 'স্নাতক (অনার্স)', boardOrUni: 'ঢাকা বিশ্ববিদ্যালয় (CSE)', roll: '1601042', reg: '1601042', year: '2021', result: '3.68' },
          ],
          customDocuments: (matchedApp as any).attachedDocuments || []
        };
        setProfileModalCandidate(fallbackCand);
        setProfileModalApps(applications.filter(a => a.candidatePhone === matchedApp.candidatePhone));
      }
    }
  };

  // Smart Automatic Channel Detection based on Job Category, Organization and Keywords
  const detectSubmissionChannel = (app: ApplicationRequest, job?: any): 'teletalk' | 'bank_erecruitment' | 'corporate_portal' | 'hr_email' | 'custom_portal' | 'postal_offline' => {
    // Respect explicitly saved valid submission channel
    if (app.submissionChannel && ['teletalk', 'bank_erecruitment', 'corporate_portal', 'hr_email', 'custom_portal', 'postal_offline'].includes(app.submissionChannel)) {
      return app.submissionChannel as any;
    }

    const title = ((app.jobTitle || '') + ' ' + (job?.title || '')).toLowerCase();
    const org = ((app.organization || '') + ' ' + (job?.organization || '')).toLowerCase();
    const cat = (job?.category || '').toLowerCase();
    const link = (job?.officialLink || '').toLowerCase();

    // 1. Bank E-Recruitment (Always prioritize bank jobs & financial institutions)
    if (
      cat === 'bank' || 
      title.includes('ব্যাংক') || 
      title.includes('bank') || 
      org.includes('ব্যাংক') || 
      org.includes('bank') || 
      title.includes('আর্থিক প্রতিষ্ঠান') || 
      org.includes('আর্থিক প্রতিষ্ঠান') || 
      link.includes('bb.org.bd')
    ) {
      return 'bank_erecruitment';
    }

    // 2. Direct HR Email
    if (link.includes('mailto:') || title.includes('ইমেইল') || title.includes('email') || link.includes('@') || org.includes('ইমেইল')) {
      return 'hr_email';
    }

    // 3. Autonomous & University Custom Portals (BUET, DU, Biman, Atomic Energy, DESCO, etc.)
    if (org.includes('বিশ্ববিদ্যালয়') || org.includes('বুয়েট') || org.includes('বিমান') || org.includes('পরমাণু') || org.includes('ডেসকো') || link.includes('edu.bd') || link.includes('biman.gov.bd')) {
      return 'custom_portal';
    }

    // 4. Postal / Offline / Treasury Challan (DC Office, Court, Civil Surgeon)
    if (title.includes('ডাকযোগে') || title.includes('চালান') || org.includes('ডিসি অফিস') || org.includes('আদালত') || org.includes('জজ কোর্ট') || org.includes('সিভিল সার্জন')) {
      return 'postal_offline';
    }

    // 5. Corporate / Private / Bdjobs
    if (cat === 'private' || cat === 'ngo' || org.includes('লিমিটেড') || org.includes('কোম্পানি') || org.includes('ওয়ালটন') || org.includes('প্রাণ') || link.includes('bdjobs.com') || title.includes('কর্পোরেট')) {
      return 'corporate_portal';
    }

    // 6. Teletalk Government (BPSC, Ministries, Railway, Police, Primary, BCS)
    if (
      link.includes('teletalk.com.bd') || 
      org.includes('bpsc') || 
      org.includes('কর্ম কমিশন') || 
      org.includes('রেলওয়ে') || 
      title.includes('বিসিএস') || 
      title.includes('bcs') || 
      title.includes('মন্ত্রণালয়') || 
      org.includes('মন্ত্রণালয়') || 
      org.includes('অধিদপ্তর') || 
      title.includes('টেলিটক') || 
      cat === 'govt' || 
      cat === 'railway' || 
      cat === 'defense' || 
      cat === 'teacher'
    ) {
      return 'teletalk';
    }

    return 'teletalk';
  };

  const openAppDrawer = (app: ApplicationRequest) => {
    setInspectingApp(app);
    setDrawerTrackingId(app.teleTalkTrackingId || '');
    setDrawerPassword(app.teleTalkPassword || '');
    setDrawerCorporateId(app.corporateTrackingId || '');

    // Smart auto-detect channel from job details
    const matchedJob = jobs.find(j => j.id === app.jobId);
    const autoChannel = detectSubmissionChannel(app, matchedJob);
    setDrawerSubmissionChannel(autoChannel);

    setDrawerPdfUrl(app.applicantCopyPdfUrl || '');
    setDrawerNotes(app.notes || '');
    setUploadSuccessMessage(null);
  };

  // 1-Click CSV Export of Applications with UTF-8 BOM
  const exportApplicationsCsv = () => {
    if (filteredApplications.length === 0) {
      alert('এক্সপোর্ট করার মতো কোনো আবেদন তালিকা পাওয়া যায়নি।');
      return;
    }
    const headers = ['আবেদন আইডি', 'প্রার্থীর নাম', 'মোবাইল', 'জেলা', 'চাকরির পদ', 'প্রতিষ্ঠান', 'পেমেন্ট মাধ্যম', 'TrxID', 'মোট ফি (টাকা)', 'স্ট্যাটাস', 'টেলিটক ট্র্যাকিং আইডি', 'তারিখ'];
    const rows = filteredApplications.map(a => [
      `"${a.id}"`,
      `"${a.candidateName || ''}"`,
      `"${a.candidatePhone || ''}"`,
      `"${a.candidateDistrict || ''}"`,
      `"${a.jobTitle || ''}"`,
      `"${a.organization || ''}"`,
      `"${a.paymentMethod || ''}"`,
      `"${a.trxId || ''}"`,
      `"${a.totalAmount || 0}"`,
      `"${a.status}"`,
      `"${a.teleTalkTrackingId || ''}"`,
      `"${a.date || ''}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `chakri_sheba_applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCompleteDrawerSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingApp) return;
    if (!drawerTrackingId.trim()) {
      alert('অনুগ্রহ করে টেলিটক ইউজার আইডি / ট্র্যাকিং নম্বর প্রদান করুন।');
      return;
    }
    setIsSubmittingDrawer(true);
    try {
      const res = await fetch(`/api/applications/${inspectingApp.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          },
        body: JSON.stringify({
          applicationId: inspectingApp.id,
          status: 'completed',
          verificationType: 'officially_verified',
          teleTalkTrackingId: drawerTrackingId.trim(),
          teleTalkPassword: drawerPassword.trim(),
          corporateTrackingId: drawerCorporateId.trim(),
          submissionChannel: drawerSubmissionChannel,
          applicantCopyPdfUrl: drawerPdfUrl.trim() || `/api/uploads/applicant-copies/${inspectingApp.id}_applicant_copy.pdf`,
          notes: drawerNotes.trim() || (drawerSubmissionChannel === 'teletalk' ? 'টেলিটকে সরকারি আবেদন সম্পন্ন হয়েছে এবং অফিশিয়াল স্লিপ প্রস্তুত।' : 'আবেদন সফলভাবে সাবমিট হয়েছে এবং কনফার্মেশন স্লিপ প্রস্তুত।')
        })
      });
      if (res.ok) {
        alert('আবেদন সফলভাবে সম্পন্ন হয়েছে এবং প্রার্থীর প্রোফাইলে অ্যাপ্লিক্যান্ট কপি রিলিজ হয়েছে!');
        fetchAllAdminData();
        setInspectingApp(prev => prev ? {
          ...prev,
          status: 'completed',
          teleTalkTrackingId: drawerTrackingId.trim(),
          applicantCopyPdfUrl: drawerPdfUrl.trim() || `https://alljobs.teletalk.com.bd/applicant-copy/${inspectingApp.id}.pdf`
        } : null);
      } else {
        const d = await res.json();
        alert(d.error || 'হালনাগাদ ব্যর্থ হয়েছে');
      }
    } catch {
      alert('সার্ভার যোগাযোগ ত্রুটি');
    } finally {
      setIsSubmittingDrawer(false);
    }
  };

  const filteredApplications = useMemo(() => {
    let list = applications;
    if (activeTab === 'payment-verification') {
      list = list.filter(a => a.status === 'pending_payment');
      if (paymentGatewayFilter !== 'all') {
        list = list.filter(a => normalizePaymentMethod(a.paymentMethod) === paymentGatewayFilter);
      }
    } else if (activeTab === 'processing-queue') {
      list = list.filter(a => a.status === 'processing');
      if (processingChannelFilter !== 'all') {
        list = list.filter(a => {
          const job = jobs.find(j => j.id === a.jobId || (a.jobTitle && (j.title.includes(a.jobTitle) || a.jobTitle.includes(j.title))));
          const ch = detectSubmissionChannel(a, job);
          if (processingChannelFilter === 'custom_portal') {
            return ch === 'custom_portal' || ch === 'postal_offline';
          }
          return ch === processingChannelFilter;
        });
      }
      if (processingSortOrder === 'deadline_urgent') {
        list = [...list].sort((a, b) => {
          const jobA = jobs.find(j => j.id === a.jobId || (a.jobTitle && (j.title.includes(a.jobTitle) || a.jobTitle.includes(j.title))));
          const jobB = jobs.find(j => j.id === b.jobId || (b.jobTitle && (j.title.includes(b.jobTitle) || b.jobTitle.includes(j.title))));
          const daysA = jobA?.daysRemaining ?? (jobA?.deadline?.includes('নভেম্বর') ? 15 : 99);
          const daysB = jobB?.daysRemaining ?? (jobB?.deadline?.includes('নভেম্বর') ? 15 : 99);
          return daysA - daysB;
        });
      } else if (processingSortOrder === 'newest') {
        list = [...list].sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (timeA && timeB && timeA !== timeB) return timeB - timeA;
          return b.id.localeCompare(a.id);
        });
      } else if (processingSortOrder === 'oldest') {
        list = [...list].sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (timeA && timeB && timeA !== timeB) return timeA - timeB;
          return a.id.localeCompare(b.id);
        });
      } else if (processingSortOrder === 'channel') {
        list = [...list].sort((a, b) => {
          const jobA = jobs.find(j => j.id === a.jobId || (a.jobTitle && (j.title.includes(a.jobTitle) || a.jobTitle.includes(j.title))));
          const jobB = jobs.find(j => j.id === b.jobId || (b.jobTitle && (j.title.includes(b.jobTitle) || b.jobTitle.includes(j.title))));
          const chA = detectSubmissionChannel(a, jobA);
          const chB = detectSubmissionChannel(b, jobB);
          return chA.localeCompare(chB);
        });
      }
    } else if (activeTab === 'completed-rejected') {
      list = list.filter(a => a.status === 'completed' || a.status === 'rejected');
      if (completedSubFilter === 'completed') {
        list = list.filter(a => a.status === 'completed');
      } else if (completedSubFilter === 'pdf_missing') {
        list = list.filter(a => a.status === 'completed' && !a.applicantCopyPdfUrl && !a.pdfUrl);
      } else if (completedSubFilter === 'pdf_ready') {
        list = list.filter(a => a.status === 'completed' && !!(a.applicantCopyPdfUrl || a.pdfUrl));
      } else if (completedSubFilter === 'rejected') {
        list = list.filter(a => a.status === 'rejected');
      }
    } else if (activeTab === 'all-applications') {
      if (appStatusFilter !== 'all') {
        list = list.filter(a => a.status === appStatusFilter);
      }
    }
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(a => 
      a.id.toLowerCase().includes(term) ||
      (a.candidateName && a.candidateName.toLowerCase().includes(term)) ||
      (a.candidatePhone && a.candidatePhone.includes(term)) ||
      (a.candidateDistrict && a.candidateDistrict.toLowerCase().includes(term)) ||
      (a.jobTitle && a.jobTitle.toLowerCase().includes(term)) ||
      (a.organization && a.organization.toLowerCase().includes(term)) ||
      (a.teleTalkTrackingId && a.teleTalkTrackingId.toLowerCase().includes(term)) ||
      (a.trxId && a.trxId.toLowerCase().includes(term))
    );
  }, [applications, activeTab, appStatusFilter, paymentGatewayFilter, processingChannelFilter, processingSortOrder, completedSubFilter, searchTerm, jobs]);

  const navGroups: { 
    name: string; 
    items: { 
      id: string; 
      label: string; 
      icon: any; 
      badge?: any; 
      badgeColor?: string; 
      keywords?: string[];
      subTabs?: { id: string; label: string }[];
    }[] 
  }[] = [
    {
      name: 'কোর ম্যানেজমেন্ট হাব',
      items: [
        { 
          id: 'dashboard', 
          label: 'ড্যাশবোর্ড ও ওভারভিউ', 
          icon: LayoutDashboard, 
          badge: null,
          keywords: ['kpi', 'analytics', 'bi', 'report', 'ডাটা কোয়ালিটি', 'রিপোর্ট'],
          subTabs: [
            { id: 'dashboard', label: 'মূল ড্যাশবোর্ড ও KPI' },
            { id: 'analytics-center', label: 'অ্যানালিটিক্স ও BI' },
            { id: 'report-builder', label: 'রিপোর্ট এক্সপোর্ট' },
            { id: 'data-quality-inspector', label: 'ডাটা কোয়ালিটি ও অডিট' }
          ]
        },
        { 
          id: 'all-applications', 
          label: 'আবেদন ও অর্ডার হাব', 
          icon: FileText, 
          badge: stats.pendingPayment ? stats.pendingPayment + ' পেন্ডিং' : (applications.length || stats.totalApplications || 0),
          badgeColor: stats.pendingPayment ? 'bg-amber-500 text-white' : undefined,
          keywords: ['আবেদন', 'পেমেন্ট', 'টেলিটক', 'প্রসেসিং', 'ভেরিফিকেশন', 'ডকুমেন্ট', 'copy'],
          subTabs: [
            { id: 'all-applications', label: 'সকল আবেদন' },
            { id: 'payment-verification', label: 'পেমেন্ট ভেরিফিকেশন' },
            { id: 'processing-queue', label: 'প্রসেসিং কিউ' },
            { id: 'completed-rejected', label: 'সম্পন্ন ও বাতিল' },
            { id: 'documents', label: 'অ্যাপ্লিক্যান্ট ডকুমেন্টস' }
          ]
        },
        { 
          id: 'circulars', 
          label: 'সার্কুলার ও নিয়োগ হাব', 
          icon: Briefcase, 
          badge: drafts.length ? drafts.length + ' খসড়া' : (jobs.length || stats.totalJobs || 0),
          badgeColor: drafts.length ? 'bg-blue-600 text-white' : undefined,
          keywords: ['সার্কুলার', 'চাকরি', 'খসড়া', 'draft', 'spider', 'স্পাইডার', 'ক্যাটাগরি', 'ফিড'],
          subTabs: [
            { id: 'circulars', label: 'সকল সার্কুলার' },
            { id: 'imported-drafts', label: 'খসড়া ও ভেরিফিকেশন কিউ' },
            { id: 'publishing-center', label: 'পাবলিশিং সেন্টার' },
            { id: 'category-search-manager', label: 'ক্যাটাগরি ও সার্চ' },
            { id: 'source-monitoring', label: 'সোর্স স্পাইডার' },
            { id: 'job-feed-manager', label: 'জব ফিড ও ফিচার্ড' },
            { id: 'smart-job-matching', label: 'স্মার্ট ম্যাচিং' }
          ]
        },
        { 
          id: 'candidate-directory', 
          label: 'প্রার্থী ও প্রতিষ্ঠান হাব', 
          icon: Users, 
          badge: candidates.length || stats.totalCandidates || 0,
          keywords: ['প্রার্থী', 'candidate', 'user', 'প্রতিষ্ঠান', 'company', 'যোগ্যতা', 'eligibility'],
          subTabs: [
            { id: 'candidate-directory', label: 'প্রার্থী ডিরেক্টরি' },
            { id: 'company-directory', label: 'প্রতিষ্ঠান হাব' },
            { id: 'eligibility-rules', label: 'যোগ্যতা ফিল্টার' }
          ]
        },
        { 
          id: 'content-studio', 
          label: 'ওয়েবসাইট ও কন্টেন্ট সিএমএস', 
          icon: Globe, 
          badge: 'Studio',
          badgeColor: 'bg-indigo-600 text-white',
          keywords: ['পেজ', 'page', 'builder', 'cms', 'seo', 'মিডিয়া', 'media', 'header', 'footer'],
          subTabs: [
            { id: 'content-studio', label: 'কন্টেন্ট ও এসইও স্টুডিও' },
            { id: 'builder', label: 'ভিজ্যুয়াল পেইজ বিল্ডার' },
            { id: 'pages-sections', label: 'পেইজ ও সেকশন ম্যানেজমেন্ট' },
            { id: 'media-library', label: 'মিডিয়া লাইব্রেরি' }
          ]
        },
        { 
          id: 'transactions', 
          label: 'ফিন্যান্স ও ডিসকাউন্ট', 
          icon: CreditCard, 
          badge: stats.activeCoupons ? stats.activeCoupons + ' কুপন' : null,
          keywords: ['টাকা', 'finance', 'লেনদেন', 'কুপন', 'coupon', 'raffle', 'র‍্যাফেল', 'খরচ'],
          subTabs: [
            { id: 'transactions', label: 'ট্রানজেকশন তালিকা' },
            { id: 'coupons-discounts', label: 'কুপন ও ডিসকাউন্ট' },
            { id: 'raffle-campaigns', label: 'র‍্যাফেল ড্র ক্যাম্পেইন' },
            { id: 'platform-operations', label: 'অপারেশনাল খরচ ও অপটিমাইজেশন' }
          ]
        },
        { 
          id: 'notifications', 
          label: 'যোগাযোগ ও মেসেজিং', 
          icon: Bell, 
          badge: 'সক্রিয়',
          badgeColor: 'bg-emerald-600 text-white',
          keywords: ['এসএমএস', 'sms', 'notification', 'মেসেজ', 'ব্রডকাস্ট', 'টেমপ্লেট'],
          subTabs: [
            { id: 'notifications', label: 'নোটিফিকেশন ও ব্রডকাস্ট' },
            { id: 'sms-status', label: 'এসএমএস গেটওয়ে ও ব্যালেন্স' },
            { id: 'templates-delivery', label: 'টেমপ্লেট ও হিস্ট্রি' }
          ]
        },
        { 
          id: 'settings', 
          label: 'সিস্টেম ও সিকিউরিটি', 
          icon: Settings, 
          badge: null,
          keywords: ['সেটিংস', 'rbac', 'staff', 'অডিট', 'audit', 'automation', 'অটোমেশন', 'backup'],
          subTabs: [
            { id: 'settings', label: 'প্ল্যাটফর্ম সেটিংস' },
            { id: 'staff-roles', label: 'স্টাফ ও RBAC রোলস' },
            { id: 'audit-logs', label: 'অডিট ও অ্যাক্টিভিটি লগ' },
            { id: 'automation-hub', label: 'সেন্ট্রাল অটোমেশন' },
            { id: 'testing-spider', label: 'টেস্টিং স্পাইডার' },
            { id: 'backup-diagnostics', label: 'ব্যাকআপ ও রিকভারি' }
          ]
        }
      ]
    }
  ];

  const activeHub = useMemo(() => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.id === activeTab || item.subTabs?.some(s => s.id === activeTab)) {
          return item;
        }
      }
    }
    return navGroups[0].items[0];
  }, [activeTab, navGroups]);

  const currentNav = useMemo(() => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.id === activeTab) {
          return { groupName: group.name, itemName: item.label };
        }
        if (item.subTabs) {
          const subMatch = item.subTabs.find(s => s.id === activeTab);
          if (subMatch) {
            return { groupName: item.label, itemName: subMatch.label };
          }
        }
      }
    }
    return { groupName: 'অ্যাডমিন', itemName: activeTab };
  }, [activeTab, navGroups]);


  if (!isAdminAuthenticated) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-300 font-semibold">অ্যাডমিন সেশন যাচাই করা হচ্ছে...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />
          
          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              চাকরি সেবা <span className="text-emerald-700">অ্যাডমিন কনসোল</span>
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              সিস্টেম কন্ট্রোল প্যানেলে প্রবেশের জন্য আপনার সিক্রেট অ্যাডমিন পিন প্রদান করুন
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                অ্যাডমিন সিক্রেট পিন / মাস্টার কী
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="সিক্রেট পিন প্রদান করুন"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono tracking-wider text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                অনুমোদিত সিক্রেট অ্যাডমিন কি বা পিন প্রদান করুন।
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>কনসোলে প্রবেশ করুন</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <Link href="/" className="hover:text-emerald-700 font-bold transition-colors">
              ← মূল ওয়েবসাইটে ফিরে যান
            </Link>
            <span className="font-mono text-slate-400">ChakriSheba v2.6 Enterprise</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800 font-solaiman">
      
      {/* 1. DEDICATED ADMIN TOP BAR */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left Brand Badge & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black tracking-tight text-white text-base">চাকরি সেবা</span>
                  <span className="bg-emerald-900/80 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-700/60">
                    অ্যাডমিন কনসোল
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">ভার্সন ২.৬ এন্টারপ্রাইজ • বিডি রিক্রুটমেন্ট হাব</p>
              </div>
            </div>
          </div>

          {/* Center System Status */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">লাইভ সার্ভার কানেক্টেড • লোকাল ডাটাবেস সিঙ্কড</span>
          </div>

          {/* Right Action Icons & Admin Profile */}
          <div className="flex items-center gap-3">
            {/* Centralized Admin Global Search (Ctrl+K) */}
            <button
              type="button"
              onClick={() => setIsGlobalSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="সার্বজনীন অ্যাডমিন সার্চ (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">সার্বজনীন সার্চ...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-900 text-slate-400 rounded border border-slate-700">
                Ctrl+K
              </kbd>
            </button>

            <button
              type="button"
              onClick={fetchAllAdminData}
              disabled={isLoading}
              title="তথ্য রিফ্রেশ করুন"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className={'w-4 h-4 ' + (isLoading ? 'animate-spin text-emerald-400' : '')} />
            </button>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors border border-slate-700"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>পাবলিক সাইট দেখুন</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </Link>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center border border-emerald-500 shadow-xs">
                SA
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-bold text-slate-100">Super Admin</div>
                <div className="text-[10px] text-emerald-400 font-mono">ADMIN-SUPER</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 text-xs font-bold transition-colors border border-rose-800/60"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT SHELL: SIDEBAR + CONTENT WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Fixed Sidebar (Desktop) & Slide-over Drawer (Mobile) */}
        <aside 
          className={'fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out shadow-lg lg:shadow-none ' + 
            (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
          }
          style={{ top: '64px', height: 'calc(100vh - 64px)' }}
        >
          {/* Quick search inside sidebar */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="মডিউল খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Navigation Links Grouped into 9 Logical Categories */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-xs font-medium scrollbar-thin">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  {group.name}
                </div>
                <div className="space-y-0.5">
                  {group.items.filter((item) => {
                    if (!searchTerm.trim()) return true;
                    const term = searchTerm.toLowerCase().trim();
                    if (item.label.toLowerCase().includes(term)) return true;
                    if (item.keywords && item.keywords.some((k) => k.toLowerCase().includes(term))) return true;
                    if (item.subTabs && item.subTabs.some(s => s.label.toLowerCase().includes(term))) return true;
                    return false;
                  }).map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id || Boolean(item.subTabs?.some(s => s.id === activeTab));
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleTabChange(item.id)}
                        className={'w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all text-left font-bold ' +
                          (isActive 
                            ? 'bg-emerald-800 text-white shadow-sm' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                        }
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={'w-4 h-4 shrink-0 ' + (isActive ? 'text-white' : 'text-slate-500')} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge !== null && item.badge !== undefined && (
                          <span className={'text-[10px] px-1.5 py-0.5 rounded-full font-bold ' + (item.badgeColor || (isActive ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-100 text-slate-600'))}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer Info */}
          <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="font-medium">ChakriSheba BD</span>
            <span className="font-mono text-emerald-700 font-bold">2026 Live</span>
          </div>
        </aside>

        {/* Mobile Backdrop Overlay */}
        {isMobileMenuOpen && (
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* 3. MAIN CONTENT WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100">
          
          {/* Breadcrumb & Section Title Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <span>অ্যাডমিন</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span>{currentNav.groupName}</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-emerald-800 font-bold">{currentNav.itemName}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentNav.itemName}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>ডাটা ব্যাকআপ এক্সপোর্ট</span>
              </button>

                    <button
                      type="button"
                      onClick={() => setIsCreatingNewJob(true)}
                      className="px-4 py-2 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>ইউনিভার্সাল এডিটরে নতুন সার্কুলার</span>
                    </button>
              <button
                type="button"
                onClick={() => { setActiveTab('circulars'); setEditingJob(null); setIsCreatingNewJob(true); }}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>নতুন সার্কুলার পোস্ট</span>
              </button>
            </div>
          </div>

          {/* 2.5 SUB-HUB NAVIGATION PILL BAR */}
          {activeHub && activeHub.subTabs && activeHub.subTabs.length > 1 && (
            <div className="mb-6 flex flex-wrap items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              {activeHub.subTabs.map((sub) => {
                const isSubActive = activeTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => handleTabChange(sub.id)}
                    className={'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' +
                      (isSubActive
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                    }
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 1: OVERVIEW -> DASHBOARD (STEP 14: PLATFORM GOVERNANCE & CONTROL CENTER) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <PlatformGovernanceOverview onNavigate={handleTabChange} />

              {/* Operational Queues Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Pending Payment Queue */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                      <h2 className="font-black text-sm text-slate-900">জরুরি পেমেন্ট ভেরিফিকেশন কিউ</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTabChange('payment-verification')}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      সবগুলো দেখুন →
                    </button>
                  </div>

                  {applications.filter(a => a.status === 'pending_payment').length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500 font-medium">
                      কোনো পেন্ডিং পেমেন্ট রিকোয়েস্ট নেই। সব ঠিক আছে!
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {applications.filter(a => a.status === 'pending_payment').map((app) => (
                        <div key={app.id} className="py-3 flex items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-xs text-slate-900">{app.candidateName} — {app.jobTitle}</div>
                            <div className="text-[11px] text-slate-500">
                              মোবাইল: {app.candidatePhone} • TrxID: <span className="font-mono font-bold text-slate-800">{app.trxId || 'N/A'}</span> • ফি: ৳{app.totalAmount}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleApprovePayment(app.id)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              অনুমোদন
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectPayment(app.id)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors"
                            >
                              বাতিল
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Quick Action Hub & Source Crawler Status */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Radio className="w-4 h-4 text-emerald-700" />
                    <h2 className="font-black text-sm text-slate-900">অটো-পাইলট সোর্স স্ট্যাটাস</h2>
                  </div>

                  <div className="space-y-3 text-xs">
                    {sources.slice(0, 3).map((src) => (
                      <div key={src.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{src.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{src.sourceUrl}</div>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="সক্রিয়" />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleTabChange('imported-drafts')}
                      className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ইম্পোর্ট খসড়া সার্কুলার রিভিউ করুন ({drafts.length})</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: OVERVIEW -> SYSTEM HEALTH (Enhanced with Live Diagnostic Engine) */}
          {activeTab === 'system-health' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-6">
              
              {/* Header with Live Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-700" />
                    <span>সিস্টেম হেলথ ও ডায়াগনস্টিক রিপোর্ট</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    সার্ভার লেটেন্সি, ডাটাবেজ ফাইল অখণ্ডতা ও লাইভ এপিআই নেটওয়ার্ক ডায়াগনস্টিক
                  </p>
                </div>

                <button
                  type="button"
                  onClick={runLiveDiagnostics}
                  disabled={isRunningDiagnostics}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-95 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 whitespace-nowrap"
                >
                  <RefreshCw className={`w-4 h-4 ${isRunningDiagnostics ? 'animate-spin' : ''}`} />
                  <span>{isRunningDiagnostics ? 'ডায়াগনস্টিক চলছে...' : '⚡ লাইভ ডায়াগনস্টিক টেস্ট চালান'}</span>
                </button>
              </div>
              
              {/* 3 Core Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">লোকাল ডাটাবেস</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-lg font-black text-emerald-700">স্থানীয় স্টোর সক্রিয়</div>
                  <p className="text-[11px] text-slate-600">UTF-8 এনকোডিং যাচাইকৃত, শূন্য ত্রুটি।</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">রানটাইম এনভায়রনমেন্ট</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-lg font-black text-slate-900">Next.js 14.2.35</div>
                  <p className="text-[11px] text-slate-600">App Router, সার্ভার সিঙ্ক ও রিয়েল-টাইম এপিআই।</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">নিরাপত্তা ও অথেন্টিকেশন</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-lg font-black text-emerald-700">AES / Scrypt সুরক্ষিত</div>
                  <p className="text-[11px] text-slate-600">রেট লিমিটিং ও সেশন আইসোলেশন সক্রিয়।</p>
                </div>
              </div>

              {/* Live Test Results Card (Displayed immediately after running test) */}
              {diagnosticResult && (
                <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-black text-slate-900">
                        লাইভ টেস্ট ফলাফল (পরীক্ষা সময়: {diagnosticResult.timestamp})
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                      {diagnosticResult.passed}/{diagnosticResult.total} সফল
                    </span>
                  </div>

                  {/* 4 Summary Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="text-xs text-slate-500 font-bold">গড় রেসপন্স টাইম</div>
                      <div className="text-lg font-black text-emerald-700 mt-0.5">{diagnosticResult.avgLatency} ms</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="text-xs text-slate-500 font-bold">সক্রিয় প্রার্থী রেকর্ড</div>
                      <div className="text-lg font-black text-blue-700 mt-0.5">{diagnosticResult.dbCounts.candidates} জন</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="text-xs text-slate-500 font-bold">সক্রিয় চাকরির আবেদন</div>
                      <div className="text-lg font-black text-purple-700 mt-0.5">{diagnosticResult.dbCounts.applications} টি</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="text-xs text-slate-500 font-bold">লাইভ সার্কুলার ও সোর্স</div>
                      <div className="text-lg font-black text-amber-700 mt-0.5">{diagnosticResult.dbCounts.jobs + diagnosticResult.dbCounts.sources} টি</div>
                    </div>
                  </div>

                  {/* Endpoint-by-endpoint Checklist */}
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-bold text-slate-700 mb-1">পরীক্ষিত এপিআই এন্ডপয়েন্ট ও লেটেন্সি বিবরণী:</div>
                    <div className="divide-y divide-slate-200/70 bg-white rounded-xl border border-slate-200/80 overflow-hidden text-xs">
                      {diagnosticResult.checks.map((chk, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/50">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {chk.status === 'ok' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                            <div className="truncate">
                              <span className="font-bold text-slate-800">{chk.name}</span>
                              <span className="text-[11px] font-mono text-slate-400 ml-2 hidden sm:inline">({chk.url})</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              {chk.latency} ms
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              chk.status === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                            }`}>
                              {chk.status === 'ok' ? 'সফল' : 'ব্যর্থ'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Banner */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">সিস্টেম সম্পূর্ণ ত্রুটিমুক্ত:</span> চাকরিসেবা সিস্টেমের সকল এপিআই, প্রার্থী ডেটাবেস, টেলিটক সার্ভিস ও ওয়েবসাইট বিল্ডার সফলভাবে সিঙ্ক্রোনাইজড রয়েছে।
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPLICATIONS -> ALL APPLICATIONS, PAYMENT VERIFICATION, PROCESSING QUEUE, COMPLETED/REJECTED */}
          {(activeTab === 'all-applications' || activeTab === 'payment-verification' || activeTab === 'processing-queue' || activeTab === 'completed-rejected') && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              
              {/* Header Title & Summary */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-base text-slate-900">
                      {activeTab === 'payment-verification' ? 'পেমেন্ট ভেরিফিকেশন কিউ' :
                       activeTab === 'processing-queue' ? 'টেলিটক প্রসেসিং কিউ' :
                       activeTab === 'completed-rejected' ? 'সম্পন্ন ও বাতিল আবেদনসমূহ' : 'সকল আবেদন তালিকা (Master Applications Table)'}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      প্রার্থীদের সকল সরকারি ও ব্যাংক চাকরির আবেদন অডিট, পেমেন্ট ট্র্যাকিং ও প্রসেসিং
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportApplicationsCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    title="সম্পূর্ণ তালিকা CSV ফাইলে এক্সপোর্ট করুন"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>এক্সেল এক্সপোর্ট</span>
                  </button>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="নাম, ফোন, পদ বা TrxID দিয়ে খুঁজুন..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 2.2: PAYMENT VERIFICATION QUEUE TOOLBAR & METRICS */}
              {activeTab === 'payment-verification' && (
                <div className="space-y-3 pt-1 pb-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-amber-50/60 rounded-2xl border border-amber-200">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 mr-1">গেটওয়ে ফিল্টার:</span>
                      
                      <button
                        type="button"
                        onClick={() => setPaymentGatewayFilter('all')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          paymentGatewayFilter === 'all'
                            ? 'bg-amber-700 text-white shadow-2xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        সব পেন্ডিং ({applications.filter(a => a.status === 'pending_payment').length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentGatewayFilter('bKash')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          paymentGatewayFilter === 'bKash'
                            ? 'bg-pink-600 text-white shadow-2xs'
                            : 'bg-white text-pink-700 hover:bg-pink-50 border border-pink-200'
                        }`}
                      >
                        <span>📱 বিকাশ</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          paymentGatewayFilter === 'bKash' ? 'bg-white/25 text-white' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {applications.filter(a => a.status === 'pending_payment' && normalizePaymentMethod(a.paymentMethod) === 'bKash').length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentGatewayFilter('Nagad')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          paymentGatewayFilter === 'Nagad'
                            ? 'bg-orange-600 text-white shadow-2xs'
                            : 'bg-white text-orange-700 hover:bg-orange-50 border border-orange-200'
                        }`}
                      >
                        <span>🔴 নগদ</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          paymentGatewayFilter === 'Nagad' ? 'bg-white/25 text-white' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {applications.filter(a => a.status === 'pending_payment' && normalizePaymentMethod(a.paymentMethod) === 'Nagad').length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentGatewayFilter('Wallet')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          paymentGatewayFilter === 'Wallet'
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        <span>💳 ওয়ালেট</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          paymentGatewayFilter === 'Wallet' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {applications.filter(a => a.status === 'pending_payment' && normalizePaymentMethod(a.paymentMethod) === 'Wallet').length}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-xs text-slate-600">
                        অপেক্ষমাণ মোট রাজস্ব: <strong className="text-amber-800 font-mono text-sm">৳{applications.filter(a => a.status === 'pending_payment').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Bulk Actions Bar (When checkboxes selected) */}
                  {selectedPaymentIds.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-emerald-700 text-white rounded-2xl shadow-sm animate-fadeIn text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>নির্বাচিত {selectedPaymentIds.length} টি পেন্ডিং পেমেন্ট</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentIds([])}
                          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors cursor-pointer"
                        >
                          সিলেকশন বাতিল
                        </button>
                        <button
                          type="button"
                          onClick={handleBulkApprovePayments}
                          disabled={isBulkApproving}
                          className="px-4 py-1.5 bg-white text-emerald-900 rounded-xl shadow-xs hover:bg-emerald-50 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          {isBulkApproving ? 'অনুমোদন হচ্ছে...' : `✓ নির্বাচিত ${selectedPaymentIds.length} টি পেমেন্ট একসাথে অনুমোদন করুন`}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2.3: PROCESSING QUEUE TOOLBAR, CHANNEL FILTER PILLS & DEADLINE SORT */}
              {activeTab === 'processing-queue' && (
                <div className="space-y-3 pt-1 pb-1">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 shadow-2xs">
                    
                    {/* Channel Selector Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-blue-900 mr-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-700" />
                        <span>চ্যানেল কিউ:</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => setProcessingChannelFilter('all')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          processingChannelFilter === 'all'
                            ? 'bg-blue-700 text-white shadow-2xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        সব প্রসেসিং ({applications.filter(a => a.status === 'processing').length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setProcessingChannelFilter('teletalk')}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          processingChannelFilter === 'teletalk'
                            ? 'bg-blue-700 text-white shadow-2xs'
                            : 'bg-white text-blue-900 hover:bg-blue-50 border border-blue-200'
                        }`}
                      >
                        <span>🏛️ টেলিটক</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          processingChannelFilter === 'teletalk' ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {applications.filter(a => a.status === 'processing' && detectSubmissionChannel(a, jobs.find(j => j.id === a.jobId)) === 'teletalk').length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProcessingChannelFilter('bank_erecruitment')}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          processingChannelFilter === 'bank_erecruitment'
                            ? 'bg-blue-700 text-white shadow-2xs'
                            : 'bg-white text-blue-900 hover:bg-blue-50 border border-blue-200'
                        }`}
                      >
                        <span>🏦 বাংলাদেশ ব্যাংক</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          processingChannelFilter === 'bank_erecruitment' ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {applications.filter(a => a.status === 'processing' && detectSubmissionChannel(a, jobs.find(j => j.id === a.jobId)) === 'bank_erecruitment').length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProcessingChannelFilter('corporate_portal')}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          processingChannelFilter === 'corporate_portal'
                            ? 'bg-blue-700 text-white shadow-2xs'
                            : 'bg-white text-blue-900 hover:bg-blue-50 border border-blue-200'
                        }`}
                      >
                        <span>🏢 কর্পোরেট / Bdjobs</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          processingChannelFilter === 'corporate_portal' ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {applications.filter(a => a.status === 'processing' && detectSubmissionChannel(a, jobs.find(j => j.id === a.jobId)) === 'corporate_portal').length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProcessingChannelFilter('hr_email')}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          processingChannelFilter === 'hr_email'
                            ? 'bg-blue-700 text-white shadow-2xs'
                            : 'bg-white text-blue-900 hover:bg-blue-50 border border-blue-200'
                        }`}
                      >
                        <span>✉️ HR ইমেইল</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          processingChannelFilter === 'hr_email' ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {applications.filter(a => a.status === 'processing' && detectSubmissionChannel(a, jobs.find(j => j.id === a.jobId)) === 'hr_email').length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProcessingChannelFilter('custom_portal')}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          processingChannelFilter === 'custom_portal'
                            ? 'bg-blue-700 text-white shadow-2xs'
                            : 'bg-white text-blue-900 hover:bg-blue-50 border border-blue-200'
                        }`}
                      >
                        <span>🎓 পোর্টাল / অন্যান্য</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          processingChannelFilter === 'custom_portal' ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {applications.filter(a => a.status === 'processing' && ['custom_portal', 'postal_offline'].includes(detectSubmissionChannel(a, jobs.find(j => j.id === a.jobId)))).length}
                        </span>
                      </button>
                    </div>

                    {/* Deadline Sorter & Urgent Count */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs bg-white px-2.5 py-1 rounded-xl border border-blue-200 shadow-2xs">
                        <span className="text-slate-600 font-bold whitespace-nowrap">সর্টিং:</span>
                        <select
                          value={processingSortOrder}
                          onChange={(e) => setProcessingSortOrder(e.target.value as any)}
                          className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                        >
                          <option value="deadline_urgent">⚡ জরুরি ডেডলাইন আগে</option>
                          <option value="newest">🕒 সর্বশেষ আবেদন আগে</option>
                          <option value="oldest">⏳ পুরোনো আবেদন আগে</option>
                          <option value="channel">🏛️ চ্যানেল অনুসারে গ্রুপ</option>
                        </select>
                      </div>

                      <div className="text-xs text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 font-bold whitespace-nowrap flex items-center gap-1 shrink-0">
                        <span>🔴 আজ শেষ:</span>
                        <span className="font-mono text-sm font-black">
                          {applications.filter(a => {
                            if (a.status !== 'processing') return false;
                            const job = jobs.find(j => j.id === a.jobId || (a.jobTitle && (j.title.includes(a.jobTitle) || a.jobTitle.includes(j.title))));
                            return (job?.daysRemaining ?? 99) <= 1;
                          }).length}
                        </span>
                        <span>টি</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 2.4: COMPLETED & REJECTED QUEUE TOOLBAR & AUDIT METRICS */}
              {activeTab === 'completed-rejected' && (
                <div className="space-y-3 pt-1 pb-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 shadow-2xs">
                    
                    {/* Sub-Filter Quick Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>অডিট ফিল্টার:</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => setCompletedSubFilter('all')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          completedSubFilter === 'all'
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        সব সম্পন্ন ও বাতিল ({applications.filter(a => a.status === 'completed' || a.status === 'rejected').length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setCompletedSubFilter('completed')}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          completedSubFilter === 'completed'
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        <span>✓ সফল সম্পন্ন</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          completedSubFilter === 'completed' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {applications.filter(a => a.status === 'completed').length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCompletedSubFilter('pdf_missing')}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          completedSubFilter === 'pdf_missing'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300'
                        }`}
                        title="যেসব সম্পন্ন আবেদনের অ্যাপ্লিক্যান্ট কপি PDF এখনো আপলোড হয়নি"
                      >
                        <span>⚠️ কপি আপলোড বাকি</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          completedSubFilter === 'pdf_missing' ? 'bg-white/25 text-white' : 'bg-amber-200 text-amber-900 font-mono'
                        }`}>
                          {applications.filter(a => a.status === 'completed' && !a.applicantCopyPdfUrl && !a.pdfUrl).length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCompletedSubFilter('pdf_ready')}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          completedSubFilter === 'pdf_ready'
                            ? 'bg-blue-700 text-white shadow-2xs'
                            : 'bg-white text-blue-800 hover:bg-blue-50 border border-blue-200'
                        }`}
                        title="যেসব আবেদনের অ্যাপ্লিক্যান্ট কপি আপলোড সম্পন্ন"
                      >
                        <span>📄 কপি ডেলিভার্ড</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          completedSubFilter === 'pdf_ready' ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {applications.filter(a => a.status === 'completed' && !!(a.applicantCopyPdfUrl || a.pdfUrl)).length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCompletedSubFilter('rejected')}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          completedSubFilter === 'rejected'
                            ? 'bg-rose-700 text-white shadow-2xs'
                            : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
                        }`}
                      >
                        <span>✕ বাতিলকৃত আবেদন</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          completedSubFilter === 'rejected' ? 'bg-white/25 text-white' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {applications.filter(a => a.status === 'rejected').length}
                        </span>
                      </button>
                    </div>

                    {/* Summary Metrics */}
                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-slate-600">
                        সম্পন্ন রাজস্ব: <strong className="text-emerald-800 font-mono text-sm">৳{applications.filter(a => a.status === 'completed').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0)}</strong>
                      </div>
                      <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-slate-600">
                        সফলতার হার: <strong className="text-blue-800 font-mono text-sm">
                          {(() => {
                            const comp = applications.filter(a => a.status === 'completed').length;
                            const rej = applications.filter(a => a.status === 'rejected').length;
                            const total = comp + rej;
                            return total > 0 ? `${Math.round((comp / total) * 100)}%` : '০%';
                          })()}
                        </strong>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Status Filter Quick Pills (Only in all-applications tab) */}
              {activeTab === 'all-applications' && (
                <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                  <span className="text-xs font-bold text-slate-500 mr-1">ফিল্টার:</span>
                  
                  <button
                    type="button"
                    onClick={() => setAppStatusFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      appStatusFilter === 'all'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    সবগুলো ({applications.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppStatusFilter('pending_payment')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      appStatusFilter === 'pending_payment'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                    }`}
                  >
                    <span>⏳ অপেক্ষমাণ পেমেন্ট</span>
                    <span className="px-1.5 py-0.2 bg-amber-200/50 rounded-full text-[10px]">
                      {applications.filter(a => a.status === 'pending_payment').length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppStatusFilter('processing')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      appStatusFilter === 'processing'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60'
                    }`}
                  >
                    <span>⚙️ প্রসেসিং কিউ</span>
                    <span className="px-1.5 py-0.2 bg-blue-200/50 rounded-full text-[10px]">
                      {applications.filter(a => a.status === 'processing').length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppStatusFilter('completed')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      appStatusFilter === 'completed'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                    }`}
                  >
                    <span>✓ সম্পন্ন</span>
                    <span className="px-1.5 py-0.2 bg-emerald-200/50 rounded-full text-[10px]">
                      {applications.filter(a => a.status === 'completed').length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppStatusFilter('rejected')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      appStatusFilter === 'rejected'
                        ? 'bg-rose-700 text-white shadow-2xs'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
                    }`}
                  >
                    <span>✕ বাতিল</span>
                    <span className="px-1.5 py-0.2 bg-rose-200/50 rounded-full text-[10px]">
                      {applications.filter(a => a.status === 'rejected').length}
                    </span>
                  </button>
                </div>
              )}

              {/* Master Applications Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      {activeTab === 'payment-verification' && (
                        <th className="py-3 px-3 w-8">
                          <input
                            type="checkbox"
                            checked={selectedPaymentIds.length === filteredApplications.length && filteredApplications.length > 0}
                            onChange={() => {
                              if (selectedPaymentIds.length === filteredApplications.length) {
                                setSelectedPaymentIds([]);
                              } else {
                                setSelectedPaymentIds(filteredApplications.map(a => a.id));
                              }
                            }}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            title="সবগুলো পেন্ডিং পেমেন্ট একসাথে নির্বাচন করুন"
                          />
                        </th>
                      )}
                      <th className="py-3 px-3">আবেদন আইডি ও তারিখ</th>
                      <th className="py-3 px-3">প্রার্থীর পরিচয় ও যোগাযোগ</th>
                      <th className="py-3 px-3">বিজ্ঞপ্তি ও আবেদনকৃত পদ</th>
                      <th className="py-3 px-3">পেমেন্ট ও TrxID</th>
                      <th className="py-3 px-3">বর্তমান স্ট্যাটাস</th>
                      <th className="py-3 px-3 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                          কোনো আবেদন খুঁজে পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => {
                        const cleanTrx = app.trxId ? app.trxId.trim().toUpperCase() : '';
                        const isDuplicateTrx = cleanTrx && duplicateTrxMap[cleanTrx] > 1;
                        const matchingJob = jobs.find(j => j.id === app.jobId);
                        const isUrgentDeadline = matchingJob && matchingJob.daysRemaining <= 1;

                        const candCompletedCount = applications.filter(a => 
                          (a.candidatePhone && app.candidatePhone && a.candidatePhone.replace(/\D/g, '') === app.candidatePhone.replace(/\D/g, '')) && a.status === 'completed'
                        ).length;

                        return (
                          <tr key={app.id} className="hover:bg-slate-50/90 transition-colors group">
                            
                            {activeTab === 'payment-verification' && (
                              <td className="py-3 px-3">
                                <input
                                  type="checkbox"
                                  checked={selectedPaymentIds.includes(app.id)}
                                  onChange={() => toggleSelectPayment(app.id)}
                                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                              </td>
                            )}

                            {/* 1. App ID & Date */}
                            <td className="py-3 px-3 font-mono">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{app.id}</span>
                                {isUrgentDeadline && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-700 animate-pulse" title="ডেডলাইন ১ দিনের মধ্যে!">
                                    ⚡ জরুরি
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 font-sans">
                                {app.date || 'তারিখ অপ্রাপ্য'}
                              </div>
                              {app.teleTalkTrackingId && (
                                <div className="text-[10px] text-emerald-800 font-bold font-mono mt-0.5 flex items-center gap-1 bg-emerald-50 px-1.5 py-0.2 rounded w-fit">
                                  <span>TT:</span>
                                  <span>{app.teleTalkTrackingId}</span>
                                </div>
                              )}
                            </td>

                            {/* 2. Candidate Info & One-Click Contact */}
                            <td className="py-3 px-3">
                              <button
                                type="button"
                                onClick={() => openCandidateProfileModal(app.candidatePhone, app.id)}
                                className="font-black text-slate-900 hover:text-emerald-700 text-left cursor-pointer transition-colors flex items-center gap-1"
                                title="ক্লিক করে প্রার্থীর ৩6০° প্রোফাইল, ওয়ালেট ও লাইফটাইম আবেদন হিস্টোরি দেখুন"
                              >
                                <span className="underline decoration-slate-300 hover:decoration-emerald-700 underline-offset-2">{app.candidateName}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                              </button>
                              
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                <span>{app.candidatePhone}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-600 font-bold">{app.candidateDistrict || 'জেলা নেই'}</span>
                              </div>

                              {/* Candidate Trust Score & Sender Phone */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                {candCompletedCount > 0 ? (
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                    🟢 বিশ্বস্ত ({candCompletedCount} টি সম্পন্ন)
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                    ⚪ নতুন আবেদনকারী
                                  </span>
                                )}

                                {app.senderPhone && app.senderPhone !== app.candidatePhone && (
                                  <span className="text-[9px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-bold" title="প্রেরক মোবাইল নম্বর">
                                    প্রেরক: {app.senderPhone}
                                  </span>
                                )}

                                {app.paymentScreenshotUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setPaymentProofApp(app)}
                                    className="text-[9px] font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.2 rounded border border-blue-200 cursor-pointer"
                                    title="পেমেন্ট স্লিপের স্ক্রিনশট প্রিভিউ দেখুন"
                                  >
                                    📷 প্রুফ
                                  </button>
                                )}
                              </div>

                              {/* WhatsApp & Call Shortcuts */}
                              <div className="flex items-center gap-1.5 mt-1">
                                <a
                                  href={`tel:${app.candidatePhone}`}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-colors"
                                  title="সরাসরি কল করুন"
                                >
                                  <Phone className="w-2.5 h-2.5 text-slate-600" />
                                  <span>কল</span>
                                </a>

                                <a
                                  href={`https://wa.me/88${app.candidatePhone ? app.candidatePhone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${app.candidateName}, চাকরি সেবা অ্যাডমিন টিম থেকে আপনার "${app.jobTitle}" আবেদন (আইডি: ${app.id}) সংক্রান্ত বিষয়ে যোগাযোগ করা হচ্ছে।`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold transition-colors"
                                  title="হোয়াটসঅ্যাপে সরাসরি মেসেজ পাঠান"
                                >
                                  <MessageCircle className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>WhatsApp</span>
                                </a>
                              </div>
                            </td>

                            {/* 3. Job Title & Organization */}
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800 line-clamp-1" title={app.jobTitle}>
                                {app.jobTitle}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Building className="w-3 h-3 text-slate-400" />
                                <span className="line-clamp-1">{app.organization}</span>
                              </div>
                              <div className="text-[10px] font-bold text-emerald-700 mt-0.5">
                                পদ: {app.postName || 'সাধারণ পদ'}
                              </div>
                            </td>

                            {/* 4. Payment Info & TrxID with Copy */}
                            <td className="py-3 px-3 font-mono">
                              <div className="font-bold text-slate-900 flex items-center gap-1">
                                <span>৳{app.totalAmount || 0}</span>
                                <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
                                  {app.paymentMethod || 'bKash'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-[11px] font-bold text-slate-600">
                                  Trx: {app.trxId || 'অপেক্ষমাণ'}
                                </span>
                                {app.trxId && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyTrxId(app.trxId!)}
                                    className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors cursor-pointer"
                                    title="TrxID কপি করুন"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                                {copiedTrxId === app.trxId && (
                                  <span className="text-[9px] font-sans font-bold text-emerald-700 animate-fadeIn">
                                    কপি হয়েছে!
                                  </span>
                                )}
                              </div>

                              {isDuplicateTrx && (
                                <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                                  <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                  <span>🚨 ডুপ্লিকেট TrxID ({duplicateTrxMap[cleanTrx]} বার)</span>
                                </div>
                              )}

                              {/* 1-Click WhatsApp Payment Dispute Shortcuts */}
                              {app.status === 'pending_payment' && (
                                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                  <a
                                    href={`https://wa.me/88${app.candidatePhone ? app.candidatePhone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${app.candidateName}, চাকরি সেবা অ্যাডমিন টিম থেকে আপনার "${app.jobTitle}" আবেদনের জন্য যোগাযোগ করা হচ্ছে। নির্ধারিত ফি ৳${app.totalAmount || 0}-এর বিপরীতে প্রেরিত TrxID-তে সমস্যা পাওয়া গেছে। অনুগ্রহ করে যাচাই করে জানান।`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 transition-colors"
                                    title="টাকা কম বা অমিল থাকলে হোয়াটসঅ্যাপ মেসেজ পাঠান"
                                  >
                                    💬 টাকা অমিল
                                  </a>
                                  <a
                                    href={`https://wa.me/88${app.candidatePhone ? app.candidatePhone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${app.candidateName}, আপনার "${app.jobTitle}" আবেদনে প্রদত্ত TrxID "${app.trxId || ''}" টি ভুল দেখাচ্ছে বা ব্যাংকিং লেজারে ম্যাচ করছে না। অনুগ্রহ করে সঠিক TrxID টি লিখে জানান।`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 transition-colors"
                                    title="ভুল TrxID হলে হোয়াটসঅ্যাপ মেসেজ পাঠান"
                                  >
                                    💬 TrxID ভুল
                                  </a>
                                </div>
                              )}
                            </td>

                            {/* 5. Live Status Badge */}
                            <td className="py-3 px-3">
                              {app.status === 'completed' ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                    <span>✓ সম্পন্ন</span>
                                  </span>
                                  {app.teleTalkTrackingId && (
                                    <div className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 flex items-center gap-1 w-fit">
                                      <span>আইডি: {app.teleTalkTrackingId}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyField(app.teleTalkTrackingId!, 'ট্র্যাকিং আইডি')}
                                        className="hover:text-emerald-700 cursor-pointer"
                                        title="আইডি কপি করুন"
                                      >
                                        <Copy className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  )}
                                  {(!app.applicantCopyPdfUrl && !app.pdfUrl) ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                      ⚠️ কপি বাকি
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                      📄 কপি রেডি
                                    </span>
                                  )}
                                </div>
                              ) : app.status === 'processing' ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                                    <Clock className="w-3 h-3 text-blue-700" />
                                    <span>● প্রসেসিং</span>
                                  </span>
                                  {(() => {
                                    const job = jobs.find(j => j.id === app.jobId);
                                    const ch = detectSubmissionChannel(app, job);
                                    return (
                                      <div className="text-[10px] font-bold text-blue-700 bg-blue-50/90 px-1.5 py-0.2 rounded border border-blue-200 w-fit">
                                        {ch === 'bank_erecruitment' ? '🏦 বাংলাদেশ ব্যাংক' :
                                         ch === 'corporate_portal' ? '🏢 কর্পোরেট' :
                                         ch === 'hr_email' ? '✉️ HR ইমেইল' :
                                         ch === 'custom_portal' ? '🎓 পোর্টাল' :
                                         ch === 'postal_offline' ? '📮 ডাকযোগে' :
                                         '🏛️ টেলিটক সরকারি'}
                                      </div>
                                    );
                                  })()}
                                </div>
                              ) : app.status === 'pending_payment' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                                  <Clock className="w-3 h-3 text-amber-700" />
                                  <span>⏳ অপেক্ষমাণ</span>
                                </span>
                              ) : (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                    <X className="w-3 h-3 text-rose-700" />
                                    <span>✕ বাতিল</span>
                                  </span>
                                  {(app.notes || app.rejectionReason) && (
                                    <div className="text-[10px] font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 max-w-[140px] line-clamp-1" title={app.rejectionReason || app.notes}>
                                      {app.rejectionReason || app.notes}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* 6. Inline Row Actions */}
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                
                                {/* Vault Drawer Open Button */}
                                <button
                                  type="button"
                                  onClick={() => openAppDrawer(app)}
                                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                  title="প্রার্থীর ডিজিটাল ভল্ট ও পূর্ণ বিবরণ দেখুন"
                                >
                                  <Eye className="w-3 h-3 text-slate-600" />
                                  <span>ভল্ট ড্রয়ার</span>
                                </button>

                                {app.status === 'pending_payment' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleApprovePayment(app.id)}
                                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
                                      title="পেমেন্ট অনুমোদন করে প্রসেসিংয়ে পাঠান"
                                    >
                                      অনুমোদন
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRejectPayment(app.id)}
                                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-2xs"
                                      title="ভুল বা ভুয়া TrxID হলে বাতিল করুন"
                                    >
                                      বাতিল
                                    </button>
                                  </>
                                )}

                                {app.status === 'processing' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setQuickCopierApp(app)}
                                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                      title="প্রার্থীর তথ্য ও ছবি/স্বাক্ষর ১-ক্লিকে কপি করুন"
                                    >
                                      <Copy className="w-3 h-3 text-indigo-600" />
                                      <span>কুইক কপি</span>
                                    </button>

                                    {matchingJob?.officialLink && (
                                      <a
                                        href={matchingJob.officialLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                                        title="অফিসিয়াল চাকরির আবেদন পোর্টাল ওপেন করুন"
                                      >
                                        <ExternalLink className="w-3 h-3 text-slate-500" />
                                        <span>পোর্টাল</span>
                                      </a>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => openAppDrawer(app)}
                                      className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                                      title="টেলিটক আইডি ও স্লিপ যুক্ত করে আবেদন সম্পন্ন করুন"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>ফর্ম সাবমিট</span>
                                    </button>
                                  </>
                                )}

                                {app.status === 'completed' && (
                                  <>
                                    {(app.applicantCopyPdfUrl || app.pdfUrl) ? (
                                      <a
                                        href={app.applicantCopyPdfUrl || app.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                                        title="অফিসিয়াল অ্যাপ্লিক্যান্ট কপি দেখুন ও ডাউনলোড করুন"
                                      >
                                        <Download className="w-3 h-3 text-emerald-700" />
                                        <span>কপি</span>
                                      </a>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => openAppDrawer(app)}
                                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                        title="অ্যাপ্লিক্যান্ট কপি PDF আপলোড করুন"
                                      >
                                        <Upload className="w-3 h-3 text-amber-700" />
                                        <span>আপলোড কপি</span>
                                      </button>
                                    )}

                                    {/* Printable Official Receipt / Voucher */}
                                    <button
                                      type="button"
                                      onClick={() => setPrintableReceiptApp(app)}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                      title="অফিসিয়াল মানি রিসিট প্রিন্ট / ভিউ করুন"
                                    >
                                      <Printer className="w-3 h-3 text-slate-600" />
                                      <span>ভাউচার</span>
                                    </button>

                                    {/* 1-Click WhatsApp Delivery Notice */}
                                    <a
                                      href={`https://wa.me/88${app.candidatePhone ? app.candidatePhone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${app.candidateName}, চাকরি সেবা থেকে সুখবর! আপনার "${app.jobTitle}" আবেদন সফলভাবে সম্পন্ন হয়েছে। ${app.teleTalkTrackingId ? `আপনার ইউজার আইডি/ট্র্যাকিং নম্বর: ${app.teleTalkTrackingId}। ` : ''}আপনার চাকরি সেবা ড্যাশবোর্ড থেকে অফিসিয়াল অ্যাপ্লিক্যান্ট কপি সংগ্রহ করতে পারবেন। যেকোনো প্রয়োজনে আমাদের সাথে থাকুন। ধন্যবাদ!`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                                      title="প্রার্থীকে হোয়াটসঅ্যাপে ডেলিভারি কনফার্মেশন পাঠান"
                                    >
                                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                                      <span>ডেলিভারি SMS</span>
                                    </a>
                                  </>
                                )}

                                {app.status === 'rejected' && (
                                  <>
                                    {/* Restore to Processing Queue */}
                                    <button
                                      type="button"
                                      onClick={() => handleRestoreToProcessing(app.id)}
                                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                      title="আবেদনটি বাতিল তালিকা থেকে পুনরায় প্রসেসিং কিউতে পাঠান"
                                    >
                                      <RefreshCw className="w-3 h-3 text-blue-600" />
                                      <span>পুনরায় প্রসেসিং</span>
                                    </button>

                                    {/* 1-Click WhatsApp Rejection Notice */}
                                    <a
                                      href={`https://wa.me/88${app.candidatePhone ? app.candidatePhone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${app.candidateName}, চাকরি সেবা থেকে আপনার "${app.jobTitle}" আবেদনের বিষয়ে জানানো যাচ্ছে যে, ${app.rejectionReason || app.notes || 'নির্দিষ্ট নিয়মের ব্যত্যয় ঘটার'}-কারণে আবেদনটি সাময়িকভাবে বাতিল করা হয়েছে। সঠিক তথ্য প্রদান করে পুনরায় প্রসেসিং করতে অনুগ্রহ করে রিপ্লাই দিন। ধন্যবাদ।`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                                      title="প্রার্থীকে হোয়াটসঅ্যাপে বাতিলের কারণ জানান"
                                    >
                                      <MessageCircle className="w-3 h-3 text-rose-600" />
                                      <span>রিজেকশন SMS</span>
                                    </a>
                                  </>
                                )}

                              </div>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* SLIDE-OVER CANDIDATE VAULT DRAWER */}
          {inspectingApp && (
            <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fadeIn">
              <div 
                className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideInRight"
                role="dialog"
                aria-modal="true"
              >
                
                {/* Drawer Header */}
                <div className="p-5 border-b border-slate-200 bg-slate-50/80 sticky top-0 z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm">
                      {inspectingApp.candidateName?.slice(0, 2) || 'CS'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-slate-900">{inspectingApp.candidateName}</h3>
                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-200/70 px-1.5 py-0.2 rounded">
                          {inspectingApp.id}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{inspectingApp.candidatePhone}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-700">{inspectingApp.candidateDistrict} জেলা</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openCandidateProfileModal(inspectingApp.candidatePhone, inspectingApp.id)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="প্রার্থীর সম্পূর্ণ মাস্টার ভল্ট ও ৩৬০° প্রোফাইল দেখুন"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      <span>🔍 প্রার্থীর সম্পূর্ণ মাস্টার ভল্ট ও ৩৬০° প্রোফাইল দেখুন</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspectingApp(null)}
                      className="p-2 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      title="ড্রয়ার বন্ধ করুন"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Drawer Body Content */}
                <div className="p-6 space-y-6 flex-1">
                  
                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    inspectingApp.status === 'completed'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : inspectingApp.status === 'processing'
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : inspectingApp.status === 'pending_payment'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider opacity-75">আবেদনের বর্তমান অবস্থা</div>
                      <div className="font-black text-sm mt-0.5 flex items-center gap-1.5">
                        {inspectingApp.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                        {inspectingApp.status === 'processing' && <Clock className="w-4 h-4 text-blue-700" />}
                        {inspectingApp.status === 'pending_payment' && <Clock className="w-4 h-4 text-amber-700" />}
                        {inspectingApp.status === 'rejected' && <X className="w-4 h-4 text-rose-700" />}
                        <span>
                          {inspectingApp.status === 'completed' ? 'আবেদন সফলভাবে সম্পন্ন ও ডেলিভার্ড' :
                           inspectingApp.status === 'processing' ? 'টেলিটকে সরকারি ফর্ম পূরণের অপেক্ষায়' :
                           inspectingApp.status === 'pending_payment' ? 'পেমেন্ট যাচাইয়ের অপেক্ষায়' : 'আবেদন বাতিল করা হয়েছে'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-500">মোট ফি</div>
                      <div className="font-black text-base text-slate-900">৳{inspectingApp.totalAmount}</div>
                    </div>
                  </div>

                  {/* Candidate Teletalk-Ready Biometrics (Photo & Signature) */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-600 flex items-center gap-1.5 tracking-wider">
                      <Users className="w-4 h-4 text-emerald-700" />
                      <span>টেলিটক আপলোড বায়োমেট্রিক্স (ছবি ও স্বাক্ষর)</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Photo Box */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-center flex flex-col items-center">
                        <div className="w-24 h-24 rounded-lg border border-slate-300 bg-slate-100 overflow-hidden flex items-center justify-center mb-2">
                          <img 
                            src={inspectingCandidate?.photoUrl || '/avatar.png'} 
                            alt={inspectingApp.candidateName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback placeholder
                              (e.target as any).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(inspectingApp.candidateName) + '&background=059669&color=fff&size=300';
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">পাসপোর্ট ছবি (300×300)</span>
                        <a 
                          href={inspectingCandidate?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(inspectingApp.candidateName)}&background=059669&color=fff&size=300`}
                          download={`${inspectingApp.candidateName}_photo.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>ছবি ডাউনলোড</span>
                        </a>
                      </div>

                      {/* Signature Box */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-center flex flex-col items-center">
                        <div className="w-28 h-14 rounded-lg border border-slate-300 bg-slate-100 overflow-hidden flex items-center justify-center mb-2 p-1">
                          <img 
                            src={inspectingCandidate?.signatureUrl || 'https://dummyimage.com/300x80/f1f5f9/0f172a&text=' + encodeURIComponent(inspectingApp.candidateName)} 
                            alt="Signature"
                            className="max-h-full object-contain"
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">ডিজিটাল স্বাক্ষর (300×80)</span>
                        <a 
                          href={inspectingCandidate?.signatureUrl || `https://dummyimage.com/300x80/f1f5f9/0f172a&text=${encodeURIComponent(inspectingApp.candidateName)}`}
                          download={`${inspectingApp.candidateName}_signature.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>স্বাক্ষর ডাউনলোড</span>
                        </a>
                      </div>
                    </div>
                  </div>



                  {/* Bilingual & Family Identity (English & Bangla) */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-700" />
                      <span>দ্বৈত ভাষার তথ্য ও পারিবারিক এনআইডি (Bilingual Identity)</span>
                    </h4>

                    <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                      
                      {/* Candidate Name Bilingual */}
                      <div className="p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-500 font-bold">প্রার্থীর নাম (English & Bangla):</span>
                          <button
                            type="button"
                            onClick={() => handleCopyField((inspectingCandidate?.name || inspectingApp.candidateName).toUpperCase(), 'ইংরেজি নাম')}
                            className="text-[10px] text-emerald-700 font-bold hover:underline"
                          >
                            কপি English
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-slate-900 font-bold">
                          <div className="p-1.5 bg-slate-50 rounded border border-slate-200/80">
                            <span className="text-[10px] text-slate-400 block font-normal">English (BLOCK LETTERS):</span>
                            {(inspectingCandidate?.name || inspectingApp.candidateName).toUpperCase()}
                          </div>
                          <div className="p-1.5 bg-slate-50 rounded border border-slate-200/80 font-sans">
                            <span className="text-[10px] text-slate-400 block font-normal">বাংলায়:</span>
                            {inspectingCandidate?.nameBn || inspectingApp.candidateName}
                          </div>
                        </div>
                      </div>

                      {/* Father Name Bilingual */}
                      <div className="p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-500 font-bold">পিতার নাম (English & Bangla):</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopyField(inspectingCandidate?.fatherName || 'MD. ABDUR RAHMAN', 'পিতার ইংরেজি নাম')}
                              className="text-[10px] text-emerald-700 font-bold hover:underline"
                            >
                              কপি English
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-slate-900 font-bold">
                          <div className="p-1.5 bg-slate-50 rounded border border-slate-200/80">
                            <span className="text-[10px] text-slate-400 block font-normal">English:</span>
                            {inspectingCandidate?.fatherName || 'MD. ABDUR RAHMAN'}
                          </div>
                          <div className="p-1.5 bg-slate-50 rounded border border-slate-200/80">
                            <span className="text-[10px] text-slate-400 block font-normal">বাংলায়:</span>
                            {inspectingCandidate?.fatherNameBn || 'মোঃ আব্দুর রহমান'}
                          </div>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500 flex justify-between">
                          <span>পিতার NID: <span className="font-mono font-bold text-slate-700">{inspectingCandidate?.fatherNid || '19702692518000101'}</span></span>
                          <button
                            type="button"
                            onClick={() => handleCopyField(inspectingCandidate?.fatherNid || '19702692518000101', 'পিতার NID')}
                            className="text-[10px] text-emerald-700 hover:underline"
                          >
                            কপি NID
                          </button>
                        </div>
                      </div>

                      {/* Mother Name Bilingual */}
                      <div className="p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-500 font-bold">মাতার নাম (English & Bangla):</span>
                          <button
                            type="button"
                            onClick={() => handleCopyField(inspectingCandidate?.motherName || 'FATEMA BEGUM', 'মাতার ইংরেজি নাম')}
                            className="text-[10px] text-emerald-700 font-bold hover:underline"
                          >
                            কপি English
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-slate-900 font-bold">
                          <div className="p-1.5 bg-slate-50 rounded border border-slate-200/80">
                            <span className="text-[10px] text-slate-400 block font-normal">English:</span>
                            {inspectingCandidate?.motherName || 'FATEMA BEGUM'}
                          </div>
                          <div className="p-1.5 bg-slate-50 rounded border border-slate-200/80">
                            <span className="text-[10px] text-slate-400 block font-normal">বাংলায়:</span>
                            {inspectingCandidate?.motherNameBn || 'মোসাঃ ফাতেমা বেগম'}
                          </div>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500 flex justify-between">
                          <span>মাতার NID: <span className="font-mono font-bold text-slate-700">{inspectingCandidate?.motherNid || '19752692518000202'}</span></span>
                          <button
                            type="button"
                            onClick={() => handleCopyField(inspectingCandidate?.motherNid || '19752692518000202', 'মাতার NID')}
                            className="text-[10px] text-emerald-700 hover:underline"
                          >
                            কপি NID
                          </button>
                        </div>
                      </div>

                      {/* NID & Nagorik Certificate */}
                      <div className="p-3 flex justify-between items-center">
                        <div>
                          <span className="text-slate-500 font-bold block">প্রার্থীর NID ও জন্ম সনদ:</span>
                          <span className="font-mono font-bold text-slate-900">{inspectingCandidate?.nid || '19952692518000214'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyField(inspectingCandidate?.nid || '19952692518000214', 'প্রার্থীর NID')}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]"
                          >
                            কপি
                          </button>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            নাগরিকত্ব সনদ সংযুক্ত
                          </span>
                        </div>
                      </div>

                      <div className="p-3 flex justify-between">
                        <span className="text-slate-500 font-bold">কোটা বা বিশেষ সুবিধা:</span>
                        <span className="font-bold text-emerald-800">{inspectingCandidate?.quota || 'সাধারণ (কোন কোটা নেই)'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Candidate Digital Vault Uploads Grid */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>সংরক্ষিত জাতীয় পরিচয় ও সনদপত্র (Digital Vault)</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { label: 'প্রার্থীর NID (Front)', url: inspectingCandidate?.nidFrontUrl, icon: '🪪' },
                        { label: 'প্রার্থীর NID (Back)', url: inspectingCandidate?.nidBackUrl, icon: '🪪' },
                        { 
                          label: 'পিতার NID ফাইল', 
                          url: (inspectingCandidate?.fatherNid?.startsWith('http') || inspectingCandidate?.fatherNid?.startsWith('/api')) ? inspectingCandidate?.fatherNid : null, 
                          icon: '👨‍🦳' 
                        },
                        { 
                          label: 'মাতার NID ফাইল', 
                          url: (inspectingCandidate?.motherNid?.startsWith('http') || inspectingCandidate?.motherNid?.startsWith('/api')) ? inspectingCandidate?.motherNid : null, 
                          icon: '👵' 
                        },
                        { label: 'নাগরিক সনদ / চেয়ারম্যান সনদ', url: inspectingCandidate?.nagorikCertificateUrl, icon: '🏛️' },
                        { label: 'জন্ম নিবন্ধন সনদ', url: inspectingCandidate?.birthCertificateUrl, icon: '📜' },
                        { label: 'চারিত্রিক সনদপত্র', url: inspectingCandidate?.characterCertificateUrl, icon: '🎖️' },
                        { label: 'কোটা / বিশেষ সুবিধা সনদ', url: inspectingCandidate?.quotaCertificateUrl, icon: '🌟' }
                      ].map((doc, idx) => (
                        <div 
                          key={idx} 
                          className={`p-2 rounded-xl border flex items-center justify-between ${
                            doc.url ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-sm">{doc.icon}</span>
                            <span className="font-bold text-slate-800 text-[11px] truncate">{doc.label}</span>
                          </div>

                          {doc.url ? (
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold flex-shrink-0"
                            >
                              দেখুন
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">নেই</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Candidate Attached Documents for this Job */}
                  {inspectingApp.attachedDocuments && inspectingApp.attachedDocuments.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          <span>এই নির্দিষ্ট আবেদনের সংযুক্ত সনদ ও প্রমাণপত্র ({inspectingApp.attachedDocuments.length} টি)</span>
                        </h4>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          আবেদনে প্রেরিত
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {inspectingApp.attachedDocuments.map((doc: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/40 flex items-center justify-between">
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate text-xs">{doc.title}</span>
                              <span className="text-[10px] text-slate-500 block truncate">{doc.fileSize || 'সংযুক্ত ফাইল'}</span>
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>প্রিভিউ</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Candidate Academic Credentials Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-emerald-700" />
                        <span>
                          {inspectingApp.submittedEducation 
                            ? `এই আবেদনের দাখিলকৃত শিক্ষাগত যোগ্যতা (${inspectingApp.submittedEducation.length} টি)` 
                            : 'শিক্ষাগত যোগ্যতা (মাস্টার ভল্ট)'}
                        </span>
                      </h4>
                      {copiedFieldKey && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full animate-fadeIn border border-emerald-200">
                          ✓ {copiedFieldKey} কপি হয়েছে!
                        </span>
                      )}
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px]">
                          <tr>
                            <th className="py-2.5 px-3">পরীক্ষা/ডিগ্রি</th>
                            <th className="py-2.5 px-3">বোর্ড/বিশ্ববিদ্যালয়</th>
                            <th className="py-2.5 px-3">রোল নম্বর</th>
                            <th className="py-2.5 px-3">রেজিস্ট্রেশন নম্বর</th>
                            <th className="py-2.5 px-3">পাশের সন</th>
                            <th className="py-2.5 px-3 text-right">জিপিএ/সিজিপিএ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                          {(((inspectingApp.submittedEducation && inspectingApp.submittedEducation.length > 0)
                            ? inspectingApp.submittedEducation
                            : ((inspectingCandidate?.education && inspectingCandidate.education.length > 0)
                                ? inspectingCandidate.education
                                : [
                                { level: 'এসএসসি', boardOrUni: 'ঢাকা বোর্ড (বিজ্ঞান)', roll: '148209', reg: '110293', year: '2014', result: '5.00' },
                                { level: 'এইচএসসি', boardOrUni: 'ঢাকা বোর্ড (বিজ্ঞান)', roll: '119402', reg: '110293', year: '2016', result: '4.83' },
                                { level: 'স্নাতক (অনার্স)', boardOrUni: 'ঢাকা বিশ্ববিদ্যালয় (CSE)', roll: '1601042', reg: '1601042', year: '2021', result: '3.68' },
                              ]))).map((edu: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2.5 px-3 font-bold text-slate-900">{edu.level || edu.degree}</td>
                              <td className="py-2.5 px-3">{edu.boardOrUni}</td>
                              <td className="py-2.5 px-3 font-mono">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-800">{edu.roll || 'N/A'}</span>
                                  {edu.roll && edu.roll !== 'N/A' && (
                                    <button
                                      type="button"
                                      onClick={() => handleCopyField(edu.roll, `${edu.level} রোল`)}
                                      className="p-1 hover:bg-emerald-100 text-slate-400 hover:text-emerald-700 rounded transition-colors cursor-pointer"
                                      title={`${edu.level} রোল নম্বর কপি করুন`}
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-mono">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-800">{edu.reg || 'N/A'}</span>
                                  {edu.reg && edu.reg !== 'N/A' && (
                                    <button
                                      type="button"
                                      onClick={() => handleCopyField(edu.reg, `${edu.level} রেজি`)}
                                      className="p-1 hover:bg-emerald-100 text-slate-400 hover:text-emerald-700 rounded transition-colors cursor-pointer"
                                      title={`${edu.level} রেজিস্ট্রেশন নম্বর কপি করুন`}
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-mono">{edu.year}</td>
                              <td className="py-2.5 px-3 text-right font-black text-emerald-700">{edu.result}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Circular & Payment Details with Detailed Gateway & Voucher Breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-700" />
                      <span>পেমেন্ট গেটওয়ে ও আর্থিক লেজার বিশ্লেষণ</span>
                    </h4>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3 text-xs">
                      
                      {/* Gateway & Trx Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                        <div>
                          <span className="text-slate-500 font-bold block text-[11px]">পেমেন্ট মাধ্যম (Gateway):</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs ${
                              inspectingApp.paymentMethod === 'bKash' ? 'bg-pink-100 text-pink-700 border border-pink-200' :
                              inspectingApp.paymentMethod === 'Nagad' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                              inspectingApp.paymentMethod === 'Wallet' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                              inspectingApp.paymentMethod === 'Bank' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {inspectingApp.paymentMethod === 'bKash' ? 'বিকাশ (bKash Gateway)' :
                               inspectingApp.paymentMethod === 'Nagad' ? 'নগদ (Nagad Gateway)' :
                               inspectingApp.paymentMethod === 'Wallet' ? 'ডিজিটাল ওয়ালেট (Wallet Balance)' :
                               inspectingApp.paymentMethod === 'Bank' ? 'ব্যাংক ট্রান্সফার (Bank Deposit)' : inspectingApp.paymentMethod}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({inspectingApp.verificationType === 'officially_verified' ? '✓ ভেরিফায়েড' : 'ইউজার প্রদত্ত'})
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-slate-500 font-bold block text-[11px]">ট্রানজেকশন আইডি (TrxID):</span>
                          <div className="flex items-center justify-end gap-1 font-mono font-bold text-slate-900 mt-0.5">
                            <span>{inspectingApp.trxId || 'নেই'}</span>
                            {inspectingApp.trxId && (
                              <button
                                type="button"
                                onClick={() => handleCopyTrxId(inspectingApp.trxId!)}
                                className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                                title="কপি"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Detailed Financial Ledger Breakdown */}
                      <div className="space-y-1.5 pt-0.5 text-[11px]">
                        <div className="flex justify-between text-slate-600">
                          <span>সরকারি মূল আবেদন ফি (Govt Fee):</span>
                          <span className="font-mono font-bold text-slate-800">৳{inspectingApp.governmentFee || (inspectingApp.totalAmount ? Math.max(0, inspectingApp.totalAmount - 80) : 200)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>চাকরি সেবা প্রসেসিং ও সার্ভিস চার্জ:</span>
                          <span className="font-mono font-bold text-slate-800">৳{inspectingApp.serviceCharge || 80}</span>
                        </div>

                        {/* Coupon Discount */}
                        {Boolean(inspectingApp.couponDiscount) && (
                          <div className="flex justify-between text-emerald-700 font-bold">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              <span>প্রোমো কোড / কুপন ছাড়:</span>
                            </span>
                            <span className="font-mono">-৳{inspectingApp.couponDiscount}</span>
                          </div>
                        )}

                        {/* Raffle Discount */}
                        {Boolean(inspectingApp.raffleDiscount) && (
                          <div className="flex justify-between text-purple-700 font-bold">
                            <span className="flex items-center gap-1">
                              <Gift className="w-3 h-3" />
                              <span>মেগা ড্র / ক্যাম্পেইন রিবেট:</span>
                            </span>
                            <span className="font-mono">-৳{inspectingApp.raffleDiscount}</span>
                          </div>
                        )}

                        {/* Paid via Wallet */}
                        {inspectingApp.paymentMethod === 'Wallet' && (
                          <div className="flex justify-between text-indigo-700 font-bold">
                            <span>ওয়ালেট থেকে ডেবিট:</span>
                            <span className="font-mono">৳{inspectingApp.totalAmount}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                          <span className="font-black text-slate-900">সর্বমোট প্রদেয় / নেট পেমেন্ট:</span>
                          <span className="font-mono font-black text-emerald-800 text-sm">৳{inspectingApp.totalAmount}</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Multi-Channel Processing & Official Slip Form */}
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-700" />
                        <span>আবেদন সাবমিশন চ্যানেল ও স্লিপ ম্যানেজমেন্ট</span>
                      </h4>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        সরকারি ও বেসরকারি সাপোর্ট
                      </span>
                    </div>

                    {/* Auto-detected Channel Indicator Badge */}
                    <div className="flex items-center justify-between text-[11px] bg-white p-2.5 rounded-xl border border-blue-200">
                      <span className="text-slate-600 font-bold flex items-center gap-1.5">
                        <span className="text-amber-500">✨</span>
                        <span>সার্কুলার ক্যাটাগরি অনুযায়ী স্বয়ংক্রিয় চ্যানেল:</span>
                      </span>
                      <span className="font-black text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-300">
                        {drawerSubmissionChannel === 'bank_erecruitment' ? '🏦 বাংলাদেশ ব্যাংক ই-রিক্রুটমেন্ট' :
                         drawerSubmissionChannel === 'corporate_portal' ? '🏢 বেসরকারি / Bdjobs পোর্টাল' :
                         drawerSubmissionChannel === 'custom_portal' ? '🎓 বিশ্ববিদ্যালয় / স্বায়ত্তশাসিত পোর্টাল' :
                         drawerSubmissionChannel === 'postal_offline' ? '📮 রেজিস্ট্রি ডাকযোগে / চালান' :
                         drawerSubmissionChannel === 'hr_email' ? '✉️ সরাসরি HR ইমেইল' :
                         '🏛️ টেলিটক সরকারি পোর্টাল'}
                      </span>
                    </div>

                    {/* Channel Selector Pills */}
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setDrawerSubmissionChannel('teletalk')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                          drawerSubmissionChannel === 'teletalk' ? 'bg-blue-700 text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        🏛️ টেলিটক সরকারি
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerSubmissionChannel('bank_erecruitment')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                          drawerSubmissionChannel === 'bank_erecruitment' ? 'bg-blue-700 text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        🏦 বাংলাদেশ ব্যাংক
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerSubmissionChannel('corporate_portal')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                          drawerSubmissionChannel === 'corporate_portal' ? 'bg-blue-700 text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        🏢 বেসরকারি / Bdjobs
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerSubmissionChannel('hr_email')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                          drawerSubmissionChannel === 'hr_email' ? 'bg-blue-700 text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        ✉️ সরাসরি HR ইমেইল
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerSubmissionChannel('custom_portal')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                          drawerSubmissionChannel === 'custom_portal' ? 'bg-blue-700 text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        🎓 বিশ্ববিদ্যালয় / কাস্টম পোর্টাল
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerSubmissionChannel('postal_offline')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                          drawerSubmissionChannel === 'postal_offline' ? 'bg-blue-700 text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        📮 ডাকযোগে / চালান আবেদন
                      </button>
                    </div>

                    <form onSubmit={handleCompleteDrawerSubmission} className="space-y-3 pt-1">
                      
                      {/* Teletalk Specific: TWO SEPARATE BOXES (User ID + Password) */}
                      {drawerSubmissionChannel === 'teletalk' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                টেলিটক ইউজার আইডি (User ID):
                              </label>
                              <input
                                type="text"
                                placeholder="যেমন: BPSC2026TX"
                                value={drawerTrackingId}
                                onChange={(e) => setDrawerTrackingId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white uppercase"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                টেলিটক পাসওয়ার্ড / পিন (Password):
                              </label>
                              <input
                                type="text"
                                placeholder="যেমন: 849201"
                                value={drawerPassword}
                                onChange={(e) => setDrawerPassword(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white uppercase"
                              />
                            </div>
                          </div>

                          {/* 16222 SMS Fee Generator */}
                          {drawerTrackingId && (
                            <div className="p-2.5 bg-blue-100/60 rounded-lg border border-blue-200 text-[11px] space-y-1.5">
                              <span className="font-bold text-blue-900 block">📲 টেলিটক ১৬২২২ এসএমএস কোড জেনারেটর:</span>
                              <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-blue-200 font-mono">
                                <span>১ম SMS: <strong>BPSC {drawerTrackingId}</strong></span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyField(`BPSC ${drawerTrackingId}`, '১ম SMS')}
                                  className="text-blue-700 font-bold hover:underline text-[10px]"
                                >
                                  কপি এসএমএস ১
                                </button>
                              </div>
                              {drawerPassword && (
                                <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-blue-200 font-mono">
                                  <span>২য় SMS: <strong>BPSC YES {drawerPassword}</strong></span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyField(`BPSC YES ${drawerPassword}`, '২য় SMS')}
                                    className="text-blue-700 font-bold hover:underline text-[10px]"
                                  >
                                    কপি এসএমএস ২
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bank E-Recruitment Specific */}
                      {drawerSubmissionChannel === 'bank_erecruitment' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              বাংলাদেশ ব্যাংক ট্র্যাকিং নম্বর (BB Tracking):
                            </label>
                            <input
                              type="text"
                              placeholder="যেমন: 1014-98214"
                              value={drawerTrackingId}
                              onChange={(e) => setDrawerTrackingId(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              সিভি আইডেন্টিফিকেশন নম্বর (CV ID):
                            </label>
                            <input
                              type="text"
                              placeholder="যেমন: CV-92145"
                              value={drawerCorporateId}
                              onChange={(e) => setDrawerCorporateId(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                            />
                          </div>
                        </div>
                      )}

                      {/* Corporate / Bdjobs Portal */}
                      {drawerSubmissionChannel === 'corporate_portal' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            করপোরেট অ্যাপ্লিকেশন আইডি / বিডিজবস রেফারেন্স:
                          </label>
                          <input
                            type="text"
                            placeholder="যেমন: PRAN-2026-ENG-41 বা BDJOBS-APP-921"
                            value={drawerCorporateId}
                            onChange={(e) => setDrawerCorporateId(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                          />
                        </div>
                      )}

                      {/* Direct HR Email Submission */}
                      {drawerSubmissionChannel === 'hr_email' && (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              প্রেরিত ইমেইল এড্রেস ও সাবজেক্ট রেফারেন্স:
                            </label>
                            <input
                              type="text"
                              placeholder="যেমন: SENT-HR-walton-careers@waltonbd.com (Ref: App-Dev-2026)"
                              value={drawerCorporateId}
                              onChange={(e) => setDrawerCorporateId(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                            />
                          </div>
                          <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 text-[11px] text-blue-800">
                            💡 ইমেইলে সিভি প্রেরণের পর জিমেইল/আউটলুকের সেন্ট মেসেজ স্ক্রিনশট বা পিডিএফ কনফার্মেশন কপি নিচের আপলোড বক্সে সংযুক্ত করুন।
                          </div>
                        </div>
                      )}

                      {/* University & Autonomous Custom Portal */}
                      {drawerSubmissionChannel === 'custom_portal' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              পোর্টাল অ্যাপ্লিকেশন আইডি / রোল:
                            </label>
                            <input
                              type="text"
                              placeholder="যেমন: BUET-APP-84920 বা DU-REG-2026"
                              value={drawerTrackingId}
                              onChange={(e) => setDrawerTrackingId(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white uppercase"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              পোর্টাল পাসওয়ার্ড / পিন নম্বর:
                            </label>
                            <input
                              type="text"
                              placeholder="যেমন: PASS-7489"
                              value={drawerPassword}
                              onChange={(e) => setDrawerPassword(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                            />
                          </div>
                        </div>
                      )}

                      {/* Postal / Offline Application */}
                      {drawerSubmissionChannel === 'postal_offline' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              রেজিস্ট্রি ডাক ট্র্যাকিং নম্বর (Postal Slip):
                            </label>
                            <input
                              type="text"
                              placeholder="যেমন: RL-1049283-BD"
                              value={drawerTrackingId}
                              onChange={(e) => setDrawerTrackingId(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white uppercase"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              ট্রেজারি চালান / ব্যাংক ড্রাফট নম্বর:
                            </label>
                            <input
                              type="text"
                              placeholder="যেমন: CHALAN- সোনালী ব্যাংক- 48921"
                              value={drawerCorporateId}
                              onChange={(e) => setDrawerCorporateId(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                            />
                          </div>
                        </div>
                      )}

                      {/* PDF File Upload Directly to Server */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          অফিসিয়াল অ্যাপ্লিক্যান্ট কপি (PDF ফাইল সরাসরি সার্ভারে আপলোড):
                        </label>
                        
                        <div className="p-3 bg-white border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-xl transition-colors text-center">
                          <input
                            type="file"
                            accept="application/pdf,image/*"
                            onChange={handlePdfFileUpload}
                            disabled={isUploadingPdf}
                            className="hidden"
                            id="drawer-pdf-file-input"
                          />
                          <label
                            htmlFor="drawer-pdf-file-input"
                            className="cursor-pointer flex flex-col items-center justify-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-bold"
                          >
                            <Upload className="w-5 h-5 text-blue-600" />
                            <span>{isUploadingPdf ? 'সার্ভারে ফাইল আপলোড হচ্ছে...' : '📁 কম্পিউটার থেকে সরাসরি PDF ফাইল নির্বাচন করুন'}</span>
                            <span className="text-[10px] text-slate-400 font-normal">সর্বোচ্চ ১০ মেগাবাইট (PDF, JPG, PNG)</span>
                          </label>
                        </div>

                        {uploadSuccessMessage && (
                          <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {uploadSuccessMessage}
                            </span>
                            {drawerPdfUrl && (
                              <a href={drawerPdfUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">
                                প্রিভিউ দেখুন ↗
                              </a>
                            )}
                          </div>
                        )}

                        <div className="mt-2">
                          <span className="text-[10px] text-slate-400 block mb-0.5">অথবা সংরক্ষিত ফাইলের পাথ / URL:</span>
                          <input
                            type="text"
                            placeholder="/uploads/applicant-copies/... বা https://..."
                            value={drawerPdfUrl}
                            onChange={(e) => setDrawerPdfUrl(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-[11px] font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          অ্যাডমিন ইন্টারনাল নোট (ঐচ্ছিক):
                        </label>
                        <input
                          type="text"
                          placeholder={
                            drawerSubmissionChannel === 'teletalk' ? 'টেলিটক ইউজার আইডি ও পিন সংক্রান্ত বিশেষ মন্তব্য...' :
                            drawerSubmissionChannel === 'bank_erecruitment' ? 'বাংলাদেশ ব্যাংক ই-রিক্রুটমেন্ট সংক্রান্ত নোট...' :
                            drawerSubmissionChannel === 'hr_email' ? 'ইমেইল প্রেরণ ও মেসেজ আইডি সংক্রান্ত নোট...' :
                            drawerSubmissionChannel === 'postal_offline' ? 'ডাকযোগে ও ট্রেজারি চালান সংক্রান্ত নোট...' :
                            'আবেদন ও কনফার্মেশন স্লিপ সংক্রান্ত বিশেষ মন্তব্য...'
                          }
                          value={drawerNotes}
                          onChange={(e) => setDrawerNotes(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-white"
                        />
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={isSubmittingDrawer || isUploadingPdf}
                          className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            {isSubmittingDrawer ? 'আপডেট হচ্ছে...' :
                             drawerSubmissionChannel === 'teletalk' ? '✓ টেলিটক আবেদন সম্পন্ন ও স্লিপ রিলিজ করুন' :
                             drawerSubmissionChannel === 'bank_erecruitment' ? '✓ বাংলাদেশ ব্যাংক আবেদন সম্পন্ন ও স্লিপ কনফার্ম করুন' :
                             drawerSubmissionChannel === 'corporate_portal' ? '✓ কর্পোরেট / Bdjobs আবেদন সম্পন্ন ও স্লিপ রিলিজ করুন' :
                             drawerSubmissionChannel === 'hr_email' ? '✓ ইমেইল আবেদন নিশ্চিত ও কনফার্মেশন পাঠান' :
                             drawerSubmissionChannel === 'custom_portal' ? '✓ পোর্টাল আবেদন সম্পন্ন ও স্লিপ রিলিজ করুন' :
                             '✓ অফলাইন/ডাকযোগে আবেদন নিশ্চিত ও চালান স্লিপ দিন'}
                          </span>
                        </button>
                      </div>
                    </form>
                  </div>
                  {/* Status History Timeline */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                      <History className="w-4 h-4 text-emerald-700" />
                      <span>আবেদনের টাইমলাইন ও অডিট হিস্টোরি</span>
                    </h4>

                    <div className="space-y-2 border-l-2 border-slate-200 ml-2 pl-3 text-xs">
                      {inspectingApp.statusHistory && inspectingApp.statusHistory.length > 0 ? (
                        inspectingApp.statusHistory.map((h, i) => (
                          <div key={i} className="relative pb-2">
                            <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white" />
                            <div className="font-bold text-slate-900">{h.notes || h.status}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {new Date(h.date).toLocaleString('bn-BD')} {h.updatedBy ? `• ${h.updatedBy}` : ''}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-400">কোনো হিস্টোরি সংরক্ষিত নেই।</div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Drawer Footer Actions */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 sticky bottom-0 z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {inspectingApp.status === 'pending_payment' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            handleApprovePayment(inspectingApp.id);
                            setInspectingApp(null);
                          }}
                          className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                        >
                          পেমেন্ট অনুমোদন
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleRejectPayment(inspectingApp.id);
                            setInspectingApp(null);
                          }}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          বাতিল করুন
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 1-Click WhatsApp Dispatcher */}
                    <a
                      href={`https://wa.me/88${inspectingApp.candidatePhone ? inspectingApp.candidatePhone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(
                        `আসসালামু আলাইকুম ${inspectingApp.candidateName}, চাকরি সেবা থেকে জানানো যাচ্ছে যে আপনার "${inspectingApp.jobTitle}" আবেদন সম্পন্ন হয়েছে।\n\n` +
                        (drawerTrackingId ? `• ইউজার আইডি (User ID): ${drawerTrackingId}\n` : '') +
                        (drawerPassword ? `• পাসওয়ার্ড (Password): ${drawerPassword}\n` : '') +
                        (drawerPdfUrl ? `• অফিশিয়াল স্লিপ ডাউনলোড: ${drawerPdfUrl}\n` : '') +
                        `\nধন্যবাদ, চাকরি সেবা টিম।`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1"
                      title="প্রার্থীর হোয়াটসঅ্যাপে ইউজার আইডি ও পাসওয়ার্ড পাঠান"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp পাঠান</span>
                    </a>

                    {/* Print Office Receipt */}
                    <button
                      type="button"
                      onClick={() => setPrintableReceiptApp(inspectingApp)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="অফিসিয়াল ক্যাশ মানি রিসিট ও কনফার্মেশন স্লিপ প্রিন্ট করুন"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-700" />
                      <span>🖨️ অফিসিয়াল রসিদ প্রিন্ট</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspectingApp(null)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
          {/* TAB 4: APPLICATIONS -> DOCUMENTS REPOSITORY (STEP 2.5 - ALL 7 ENTERPRISE FEATURES) */}
          {activeTab === 'documents' && (() => {
            const allAppsWithPdf = applications.filter(a => a.applicantCopyPdfUrl || a.pdfUrl);
            const completedMissingPdf = applications.filter(a => a.status === 'completed' && !a.applicantCopyPdfUrl && !a.pdfUrl);

            // Filter logic
            let displayList = applications;
            if (docCategoryFilter === 'missing') {
              displayList = completedMissingPdf;
            } else if (docCategoryFilter === 'admit_card') {
              displayList = allAppsWithPdf.filter(a => (a.jobTitle || '').includes('বিসিএস') || (a.jobTitle || '').includes('প্রবেশপত্র'));
            } else {
              displayList = allAppsWithPdf.filter(a => {
                const job = jobs.find(j => j.id === a.jobId || (a.jobTitle && (j.title.includes(a.jobTitle) || a.jobTitle.includes(j.title))));
                const ch = detectSubmissionChannel(a, job);
                if (docCategoryFilter === 'teletalk') return ch === 'teletalk';
                if (docCategoryFilter === 'bank') return ch === 'bank_erecruitment';
                if (docCategoryFilter === 'other') return ch !== 'teletalk' && ch !== 'bank_erecruitment';
                return true;
              });
            }

            if (docSearchTerm.trim()) {
              const term = docSearchTerm.toLowerCase();
              displayList = displayList.filter(a => 
                a.id.toLowerCase().includes(term) ||
                (a.candidateName && a.candidateName.toLowerCase().includes(term)) ||
                (a.candidatePhone && a.candidatePhone.includes(term)) ||
                (a.jobTitle && a.jobTitle.toLowerCase().includes(term)) ||
                (a.organization && a.organization.toLowerCase().includes(term)) ||
                (a.teleTalkTrackingId && a.teleTalkTrackingId.toLowerCase().includes(term))
              );
            }

            const teletalkCount = allAppsWithPdf.filter(a => {
              const job = jobs.find(j => j.id === a.jobId || (a.jobTitle && (j.title.includes(a.jobTitle) || a.jobTitle.includes(j.title))));
              return detectSubmissionChannel(a, job) === 'teletalk';
            }).length;

            const bankCount = allAppsWithPdf.filter(a => {
              const job = jobs.find(j => j.id === a.jobId || (a.jobTitle && (j.title.includes(a.jobTitle) || a.jobTitle.includes(j.title))));
              return detectSubmissionChannel(a, job) === 'bank_erecruitment';
            }).length;

            const admitCount = allAppsWithPdf.filter(a => (a.jobTitle || '').includes('বিসিএস')).length;
            const otherCount = allAppsWithPdf.length - (teletalkCount + bankCount);

            const handleSelectAllDocs = () => {
              if (selectedDocAppIds.length === displayList.length) {
                setSelectedDocAppIds([]);
              } else {
                setSelectedDocAppIds(displayList.map(a => a.id));
              }
            };

            const toggleDocSelection = (id: string) => {
              setSelectedDocAppIds(prev => 
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
              );
            };

            return (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
                
                {/* Header & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                      📁
                    </div>
                    <div>
                      <h2 className="font-black text-base text-slate-900">অ্যাপ্লিক্যান্ট কপি ও অফিশিয়াল ডকুমেন্টস রিপোজিটরি</h2>
                      <p className="text-xs text-slate-500 font-medium">
                        টেলিটক, বাংলাদেশ ব্যাংক ও বিভিন্ন সংস্থা থেকে প্রাপ্ত অফিশিয়াল অ্যাপ্লিকেশন স্লিপ, চালান ও প্রার্থীর ডকুমেন্টস আর্কাইভ
                      </p>
                    </div>
                  </div>

                  {/* Actions: Export CSV & Search */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={exportDocumentsCsv}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="সকল ডকুমেন্টের মেটাডাটা এক্সেল ফাইলে এক্সপোর্ট করুন"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>এক্সেল এক্সপোর্ট</span>
                    </button>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="নাম, ফোন বা ট্র্যাকিং খুঁজুন..."
                        value={docSearchTerm}
                        onChange={(e) => setDocSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                {/* FEATURE 1: DIRECT DRAG & DROP / QUICK PDF UPLOAD DROPZONE BANNER */}
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-emerald-200 text-emerald-900 rounded-lg text-xs">📤</span>
                      <h4 className="font-black text-xs sm:text-sm text-emerald-950">কুইক ড্রপজোন: অফিশিয়াল অ্যাপ্লিক্যান্ট কপি আপলোড ও অটো-লিঙ্ক</h4>
                    </div>
                    <span className="text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                      PDF, JPG, PNG (Max 10MB)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                    {/* App Selector Dropdown */}
                    <div className="sm:col-span-5 space-y-1">
                      <label className="text-[10px] font-bold text-emerald-900 block">আবেদনকারী নির্বাচন করুন:</label>
                      <select
                        value={quickUploadAppId}
                        onChange={(e) => setQuickUploadAppId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 cursor-pointer"
                      >
                        <option value="">-- আবেদনকারী নির্বাচন করুন --</option>
                        {completedMissingPdf.length > 0 && (
                          <optgroup label="⚠️ কপি আপলোড বাকি থাকা আবেদন (অগ্রাধিকার):">
                            {completedMissingPdf.map(a => (
                              <option key={a.id} value={a.id}>
                                ⚠️ {a.candidateName} — {a.jobTitle.slice(0, 25)} ({a.id})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="অন্যান্য সকল আবেদন:">
                          {applications.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.candidateName} — {a.jobTitle.slice(0, 25)} ({a.id})
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* Tracking ID Input */}
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-emerald-900 block">ট্র্যাকিং / ইউজার আইডি (ঐচ্ছিক):</label>
                      <input
                        type="text"
                        placeholder="যেমন: TELETALK-88910"
                        value={quickUploadTrackingId}
                        onChange={(e) => setQuickUploadTrackingId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                      />
                    </div>

                    {/* File Dropzone Input Button */}
                    <div className="sm:col-span-4 space-y-1 flex flex-col justify-end">
                      <label className="text-[10px] font-bold text-emerald-900 block sm:hidden">ফাইল নির্বাচন:</label>
                      <label className={`w-full px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${isQuickUploadingDoc ? 'opacity-60 cursor-not-allowed' : ''}`}>
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isQuickUploadingDoc ? 'আপলোড হচ্ছে...' : '📁 ফাইল সিলেক্ট বা ড্রপ করুন'}</span>
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg"
                          onChange={handleQuickUploadApplicantCopy}
                          disabled={isQuickUploadingDoc}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Sub-Filter Toolbar & Metrics */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 shadow-2xs">
                  
                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5 text-slate-600" />
                      <span>ফিল্টার:</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setDocCategoryFilter('all')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        docCategoryFilter === 'all'
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      সব আর্কাইভ ({allAppsWithPdf.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setDocCategoryFilter('teletalk')}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        docCategoryFilter === 'teletalk'
                          ? 'bg-blue-700 text-white shadow-2xs'
                          : 'bg-white text-blue-900 hover:bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <span>🏛️ টেলিটক স্লিপ</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        docCategoryFilter === 'teletalk' ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {teletalkCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDocCategoryFilter('bank')}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        docCategoryFilter === 'bank'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-white text-emerald-900 hover:bg-emerald-50 border border-emerald-200'
                      }`}
                    >
                      <span>🏦 ব্যাংক কনফার্মেশন</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        docCategoryFilter === 'bank' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {bankCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDocCategoryFilter('admit_card')}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        docCategoryFilter === 'admit_card'
                          ? 'bg-indigo-700 text-white shadow-2xs'
                          : 'bg-white text-indigo-900 hover:bg-indigo-50 border border-indigo-200'
                      }`}
                    >
                      <span>🎫 এডমিট কার্ড</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        docCategoryFilter === 'admit_card' ? 'bg-white/25 text-white' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {admitCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDocCategoryFilter('missing')}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        docCategoryFilter === 'missing'
                          ? 'bg-rose-700 text-white shadow-2xs'
                          : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-300'
                      }`}
                      title="যেসব সম্পন্ন আবেদনে এখনো অ্যাপ্লিক্যান্ট কপি আপলোড করা হয়নি"
                    >
                      <span>⚠️ কপি আপলোড বাকি</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        docCategoryFilter === 'missing' ? 'bg-white/25 text-white' : 'bg-rose-200 text-rose-900 font-mono'
                      }`}>
                        {completedMissingPdf.length}
                      </span>
                    </button>
                  </div>

                  {/* Metrics Badge */}
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 shrink-0">
                    <span className="bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                      রেডি কপি: <strong className="text-emerald-700 font-mono">{allAppsWithPdf.length}</strong>
                    </span>
                    <span className="bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                      পেন্ডিং: <strong className="text-rose-700 font-mono">{completedMissingPdf.length}</strong>
                    </span>
                  </div>

                </div>

                {/* FEATURE 7: MULTI-SELECT BULK ACTIONS BAR */}
                {selectedDocAppIds.length > 0 && (
                  <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-3 text-xs font-bold animate-fadeIn shadow-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>নির্বাচিত {selectedDocAppIds.length} টি আবেদন</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDocAppIds([])}
                        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors cursor-pointer"
                      >
                        সিলেকশন বাতিল
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          alert(`নির্বাচিত ${selectedDocAppIds.length} জন প্রার্থীর জন্য হোয়াটসঅ্যাপ ডেলিভারি কিউ চালু করা হয়েছে।`);
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>✓ একসাথে হোয়াটসঅ্যাপ ডাউনলোড নোটিশ পাঠান</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Select All Checkbox Header */}
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedDocAppIds.length === displayList.length && displayList.length > 0}
                      onChange={handleSelectAllDocs}
                      className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-700"
                    />
                    <span>সবগুলো সিলেক্ট করুন ({displayList.length})</span>
                  </label>
                  <span>প্রদর্শিত হচ্ছে: {displayList.length} টি ডকুমেন্ট</span>
                </div>

                {/* Documents Grid */}
                {displayList.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl space-y-2">
                    <div className="text-3xl">📭</div>
                    <div className="font-bold text-slate-700 text-sm">কোনো অ্যাপ্লিক্যান্ট কপি পাওয়া যায়নি</div>
                    <p className="text-xs text-slate-400">ফিল্টার পরিবর্তন করে দেখুন অথবা উপরের ড্রপজোন থেকে সরাসরি কপি আপলোড করুন</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {displayList.map((app) => {
                      const pdf = app.applicantCopyPdfUrl || app.pdfUrl;
                      const job = jobs.find(j => j.id === app.jobId || (app.jobTitle && (j.title.includes(app.jobTitle) || app.jobTitle.includes(j.title))));
                      const channel = detectSubmissionChannel(app, job);
                      const isSelected = selectedDocAppIds.includes(app.id);

                      return (
                        <div
                          key={app.id}
                          className={`p-4 rounded-2xl border transition-all space-y-3 ${
                            isSelected 
                              ? 'bg-emerald-50/40 border-emerald-400 shadow-xs ring-1 ring-emerald-400' 
                              : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-2xs hover:shadow-xs'
                          }`}
                        >
                          {/* Card Header & Checkbox */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleDocSelection(app.id)}
                                className="w-4 h-4 mt-0.5 text-emerald-700 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-700"
                              />
                              <div className="space-y-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  channel === 'bank_erecruitment' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                                  channel === 'teletalk' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                                  'bg-purple-50 text-purple-800 border border-purple-200'
                                }`}>
                                  {channel === 'bank_erecruitment' ? '🏦 বাংলাদেশ ব্যাংক' :
                                   channel === 'teletalk' ? '🏛️ টেলিটক সরকারি' : '🎓 পোর্টাল আবেদন'}
                                </span>
                                <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1" title={app.jobTitle}>
                                  {app.jobTitle}
                                </h4>
                                <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                                  {app.organization} • পদ: {app.postName || 'সাধারণ'}
                                </p>
                              </div>
                            </div>

                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                              {app.id}
                            </span>
                          </div>

                          {/* Candidate & Tracking Particulars */}
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="font-bold text-slate-800 block">{app.candidateName}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{app.candidatePhone}</span>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-bold">ট্র্যাকিং ইউজার আইডি:</span>
                              <div className="font-mono font-bold text-slate-800 text-xs flex items-center justify-end gap-1">
                                <span>{app.teleTalkTrackingId || app.corporateTrackingId || 'প্রক্রিয়াধীন'}</span>
                                {(app.teleTalkTrackingId || app.corporateTrackingId) && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyField((app.teleTalkTrackingId || app.corporateTrackingId)!, 'ট্র্যাকিং আইডি')}
                                    className="hover:text-emerald-700 cursor-pointer text-slate-400 hover:text-slate-700"
                                    title="আইডি কপি করুন"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* FEATURE 3: DELIVERY & CANDIDATE DOWNLOAD STATUS */}
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            {pdf ? (
                              <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>ডেলিভারি প্রস্তুত • ক্যান্ডিডেট অ্যাক্সেস রেডি</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>⚠️ কপি আপলোড অপেক্ষমাণ</span>
                              </span>
                            )}

                            <span className="text-slate-400">
                              {app.date ? `তারিখ: ${app.date}` : 'রিসেন্ট'}
                            </span>
                          </div>

                          {/* Action Buttons: Preview, Download, WhatsApp, Replace, Unlink */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <button
                              type="button"
                              onClick={() => openAppDrawer(app)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="প্রার্থীর বিস্তারিত ভল্ট খুলুন"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>ভল্ট</span>
                            </button>

                            <div className="flex items-center gap-1.5">
                              {pdf ? (
                                <>
                                  {/* FEATURE 2: INLINE MODAL PREVIEW BUTTON */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewPdfUrl(pdf);
                                      setPreviewPdfTitle(`${app.candidateName} — ${app.jobTitle}`);
                                    }}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                    title="অ্যাডমিন প্যানেলেই সরাসরি প্রিভিউ দেখুন"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                                    <span>প্রিভিউ</span>
                                  </button>

                                  {/* Direct Download Link */}
                                  <a
                                    href={pdf}
                                    download={`${app.candidateName}_Applicant_Copy.pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold flex items-center gap-1 transition-colors"
                                    title="ফাইলটি সরাসরি ডাউনলোড করুন"
                                  >
                                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>ডাউনলোড</span>
                                  </a>

                                  {/* 1-Click WhatsApp Delivery */}
                                  <a
                                    href={`https://wa.me/88${app.candidatePhone ? app.candidatePhone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${app.candidateName}, চাকরি সেবা থেকে আপনার "${app.jobTitle}" আবেদনের অফিসিয়াল কপি প্রস্তুত হয়েছে। ট্র্যাকিং আইডি: ${app.teleTalkTrackingId || 'সংযুক্ত'}। সরাসরি ডাউনলোড লিংক: ${pdf}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1 shadow-2xs transition-colors"
                                    title="প্রার্থীকে হোয়াটসঅ্যাপে ডাউনলোড লিংক পাঠান"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                  </a>

                                  {/* FEATURE 5: UNLINK / DELETE BUTTON */}
                                  <button
                                    type="button"
                                    onClick={() => handleUnlinkPdf(app.id)}
                                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                    title="কপি আনলিংক বা ডিলিট করুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuickUploadAppId(app.id);
                                    if (app.teleTalkTrackingId) setQuickUploadTrackingId(app.teleTalkTrackingId);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                                  title="ড্রপজোনে এই আবেদনটি নির্বাচন করে ফাইল আপলোড করুন"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>কপি আপলোড করুন</span>
                                </button>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })()}

          {/* FEATURE 2 MODAL: INLINE PDF PREVIEWER LIGHTBOX */}
          {previewPdfUrl && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[95vh] flex flex-col">
                
                {/* Lightbox Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-blue-100 text-blue-800 rounded-lg font-bold">📄</span>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm sm:text-base line-clamp-1">{previewPdfTitle || 'অ্যাপ্লিক্যান্ট কপি প্রিভিউ'}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">অফিসিয়াল ডকুমেন্ট ভিউয়ার ও অডিট স্ক্রিন</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={previewPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                      title="নতুন ট্যাবে ওপেন করুন"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>নতুন ট্যাবে খুলুন</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewPdfUrl(null);
                        setPreviewPdfTitle(null);
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Embedded PDF Viewer Iframe */}
                <div className="flex-1 w-full bg-slate-100 rounded-2xl overflow-hidden min-h-[500px] border border-slate-200">
                  <iframe
                    src={previewPdfUrl}
                    title="Applicant Copy Preview"
                    className="w-full h-full min-h-[500px]"
                  />
                </div>

                {/* Lightbox Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-slate-600">
                  <span>ডকুমেন্ট স্ট্যাটাস: ভেরিফাইড ও সক্রিয়</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={previewPdfUrl}
                      download="applicant-copy.pdf"
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>সরাসরি ডাউনলোড করুন</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setPreviewPdfUrl(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                    >
                      বন্ধ করুন
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: JOBS -> CIRCULARS */}
          {activeTab === 'circulars' && (
            <div className="space-y-5">
              {/* Top 5 KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">মোট সার্কুলার</div>
                  <div className="text-xl font-black text-slate-900">{jobs.length} টি</div>
                  <div className="text-[10px] text-slate-400">ডাটাবেসে সংরক্ষিত</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">সক্রিয় ও চলমান</div>
                  <div className="text-xl font-black text-emerald-700">
                    {jobs.filter(j => ((j as any).status || (j.daysRemaining > 0 ? 'OPEN' : 'EXPIRED')) === 'OPEN').length} টি
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">আবেদন গ্রহণ চলছে</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">মেয়াদোত্তীর্ণ</div>
                  <div className="text-xl font-black text-rose-600">
                    {jobs.filter(j => ((j as any).status || (j.daysRemaining > 0 ? 'OPEN' : 'EXPIRED')) === 'EXPIRED').length} টি
                  </div>
                  <div className="text-[10px] text-rose-500 font-medium">আর্কাইভ ভিউ</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">সরকারি চাকরি</div>
                  <div className="text-xl font-black text-blue-700">
                    {jobs.filter(j => j.category === 'govt').length} টি
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium">মন্ত্রণালয় ও অধিদপ্তর</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
                  <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">ব্যাংক ও অন্যান্য</div>
                  <div className="text-xl font-black text-purple-700">
                    {jobs.filter(j => j.category === 'bank').length} টি
                  </div>
                  <div className="text-[10px] text-purple-600 font-medium">ব্যাংকার্স সিলেকশন</div>
                </div>
              </div>

              {/* Main Table Container */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
                {/* Header & Controls Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="font-black text-base text-slate-900 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-emerald-700" />
                      <span>সকল সার্কুলার ব্যবস্থাপনা ও লাইভ কন্ট্রোল</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      মোট {jobs.length}টি বিজ্ঞপ্তির মধ্যে ফিল্টারকৃত {filteredJobs.length}টি প্রদর্শিত হচ্ছে।
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('circulars'); setEditingJob(null); setIsCreatingNewJob(true); }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-900/10"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>নতুন সার্কুলার পোস্ট করুন</span>
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                  {/* Search Box */}
                  <div className="lg:col-span-2 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={jobSearchQuery}
                      onChange={(e) => setJobSearchQuery(e.target.value)}
                      placeholder="পদবী, প্রতিষ্ঠান, গ্রেড বা আইডি দিয়ে খুঁজুন..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 focus:bg-white transition-all font-semibold"
                    />
                    {jobSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setJobSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Dropdown */}
                  <div>
                    <select
                      value={jobCategoryFilter}
                      onChange={(e) => setJobCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 focus:bg-white font-semibold text-slate-700"
                    >
                      <option value="ALL">সকল ক্যাটাগরি</option>
                      <option value="govt">সরকারি চাকরি</option>
                      <option value="bank">ব্যাংক জব</option>
                      <option value="railway">রেলওয়ে</option>
                      <option value="defense">প্রতিরক্ষা ও পুলিশ</option>
                      <option value="teacher">শিক্ষক নিয়োগ</option>
                      <option value="ngo">এনজিও</option>
                      <option value="private">বেসরকারি</option>
                    </select>
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <select
                      value={jobStatusFilter}
                      onChange={(e: any) => setJobStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 focus:bg-white font-semibold text-slate-700"
                    >
                      <option value="ALL">সকল স্ট্যাটাস</option>
                      <option value="OPEN">শুধু সক্রিয় (OPEN)</option>
                      <option value="EXPIRED">মেয়াদ শেষ (EXPIRED)</option>
                      <option value="UPCOMING">আসন্ন (UPCOMING)</option>
                    </select>
                  </div>

                  {/* Sort Dropdown */}
                  <div>
                    <select
                      value={jobSortBy}
                      onChange={(e: any) => setJobSortBy(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 focus:bg-white font-semibold text-slate-700"
                    >
                      <option value="newest">নতুন সার্কুলার আগে</option>
                      <option value="vacancies">পদসংখ্যা অনুযায়ী (বেশি)</option>
                      <option value="deadline">ডেডলাইন অনুযায়ী (কাছের)</option>
                    </select>
                  </div>
                </div>

                {/* Filter Reset pill if active */}
                {(jobSearchQuery || jobCategoryFilter !== 'ALL' || jobStatusFilter !== 'ALL') && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-500 font-semibold">সক্রিয় ফিল্টার:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setJobSearchQuery('');
                        setJobCategoryFilter('ALL');
                        setJobStatusFilter('ALL');
                      }}
                      className="text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-200 transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      <span>সকল ফিল্টার রিসেট করুন</span>
                    </button>
                  </div>
                )}

                {/* The Enhanced Circulars Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3.5">সার্কুলার ও প্রতিষ্ঠান</th>
                        <th className="py-3 px-3">ক্যাটাগরি ও গ্রেড</th>
                        <th className="py-3 px-3">পদ ও শূন্যপদ</th>
                        <th className="py-3 px-3">ফি (৳)</th>
                        <th className="py-3 px-3">শর্তাবলী ও কাট-অফ</th>
                        <th className="py-3 px-3">স্ট্যাটাস ও ডেডলাইন</th>
                        <th className="py-3 px-3 text-right">অ্যাকশনসমূহ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredJobs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500">
                            <div className="max-w-xs mx-auto space-y-2">
                              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                              <div className="font-bold text-sm text-slate-800">কোনো সার্কুলার পাওয়া যায়নি!</div>
                              <p className="text-xs text-slate-500">
                                আপনার ফিল্টার বা সার্চ কোয়েরি অনুযায়ী কোনো বিজ্ঞাপন মেলেনি।
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setJobSearchQuery('');
                                  setJobCategoryFilter('ALL');
                                  setJobStatusFilter('ALL');
                                }}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                              >
                                ফিল্টার রিসেট করুন
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredJobs.map((job) => {
                          const rawSt = String((job as any).status || (job as any).lifecycleStatus || ((job.daysRemaining || 0) > 0 ? 'OPEN' : 'EXPIRED')).toUpperCase();
                          const isJobOpen = ['OPEN', 'PUBLISHED', 'ACTIVE'].includes(rawSt);
                          const status = isJobOpen ? 'OPEN' : (rawSt === 'UPCOMING' ? 'UPCOMING' : 'EXPIRED');
                          const hasPositions = job.positions && job.positions.length > 0;
                          return (
                            <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Title & Organization */}
                              <td className="py-3.5 px-3.5 max-w-[280px]">
                                <div className="font-bold text-slate-900 text-xs line-clamp-1">{job.title}</div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                  <span>{job.organization}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-mono font-semibold">
                                    {job.id}
                                  </span>
                                </div>
                              </td>

                              {/* Category & Grade */}
                              <td className="py-3.5 px-3">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  job.category === 'govt' 
                                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                    : job.category === 'bank'
                                    ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {job.categoryLabel || job.category}
                                </span>
                                <div className="text-[10px] text-slate-500 mt-1 font-semibold">
                                  {job.grade || 'গ্রেড নির্ধারিত নেই'}
                                </div>
                              </td>

                              {/* Vacancies & Sub-positions */}
                              <td className="py-3.5 px-3">
                                <div className="font-bold text-slate-900 text-xs">
                                  {job.totalPosts} টি পদ
                                </div>
                                {hasPositions && (
                                  <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                                    +{job.positions!.length}টি উপ-পদ
                                  </span>
                                )}
                              </td>

                              {/* Fees */}
                              <td className="py-3.5 px-3">
                                <div className="font-extrabold text-emerald-800">
                                  ৳{job.govtFee + job.serviceFee}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  সরকারি ৳{job.govtFee} + ফি ৳{job.serviceFee}
                                </div>
                              </td>

                              {/* Eligibility Rules */}
                              <td className="py-3.5 px-3">
                                <div className="text-[11px] text-slate-700 font-semibold">
                                  বয়স: {job.minAge || 18} - {job.maxAge || 32} বছর
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  {job.allowThirdDivision === false ? (
                                    <span className="text-[9px] font-extrabold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                      ৩য় বিভাগ নিষিদ্ধ
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                                      ৩য় বিভাগ প্রযোজ্য
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Status & Deadline */}
                              <td className="py-3.5 px-3">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    status === 'OPEN'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : status === 'UPCOMING'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                                  }`}>
                                    {status === 'OPEN' ? `সক্রিয় (${job.daysRemaining || 0} দিন)` : status === 'UPCOMING' ? 'আসন্ন' : 'মেয়াদ শেষ'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1 truncate max-w-[120px]" title={job.deadline}>
                                  শেষ: {job.deadline}
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  {/* View Button */}
                                  <Link
                                    href={'/jobs/' + job.id}
                                    target="_blank"
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                                    title="পাবলিক পেজ দেখুন"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                                  </Link>

                                  {/* Status Toggle Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleJobStatus(job)}
                                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors shadow-2xs cursor-pointer ${
                                      status === 'OPEN'
                                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                                    }`}
                                    title={status === 'OPEN' ? 'আবেদন বন্ধ করতে ক্লিক করুন' : 'আবেদন চালু করতে ক্লিক করুন'}
                                  >
                                    {status === 'OPEN' ? 'স্থগিত' : 'চালু'}
                                  </button>

                                  {/* Edit Button */}
                                  <button
                                    type="button"
                                    onClick={() => setEditingJob({ ...job })}
                                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs sm:text-sm font-bold transition-all border border-emerald-200/80 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                    title="বিজ্ঞপ্তির তথ্য এডিট করুন"
                                  >
                                    <Edit3 className="w-3 h-3 text-emerald-700" />
                                    <span>এডিট</span>
                                  </button>

                                  {/* Visual Content Studio Quick Bridge */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setContentStudioDraftId(job.id);
                                      setActiveTab('content-studio');
                                    }}
                                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs sm:text-sm font-bold transition-all border border-indigo-200/80 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                    title="ভিজ্যুয়াল কন্টেন্ট স্টুডিওতে ওপেন করুন"
                                  >
                                    <PenTool className="w-3 h-3 text-indigo-700" />
                                    <span>কন্টেন্ট</span>
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteJob(job.id, job.title)}
                                    disabled={isDeletingJobId === job.id}
                                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs sm:text-sm font-bold transition-colors border border-rose-200 disabled:opacity-50 cursor-pointer"
                                    title="সার্কুলার মুছে ফেলুন"
                                  >
                                    {isDeletingJobId === job.id ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

                            {/* Universal Job Workspace (Phase 02 Comprehensive 11-Tab Workspace) */}
              <UniversalJobWorkspace
                job={editingJob}
                isOpen={!!editingJob || isCreatingNewJob}
                isNew={isCreatingNewJob}
                onClose={() => {
                  setEditingJob(null);
                  setIsCreatingNewJob(false);
                }}
                onSaveSuccess={(savedJob) => {
                  setJobs(prev => {
                    const exists = prev.some(j => j.id === savedJob.id);
                    if (exists) {
                      return prev.map(j => j.id === savedJob.id ? savedJob : j);
                    }
                    return [savedJob, ...prev];
                  });
                  setEditingJob(null);
                  setIsCreatingNewJob(false);
                }}
                onDelete={(id, title) => handleDeleteJob(id, title)}
                onOpenContentStudio={(id) => {
                  setEditingJob(null);
                  setIsCreatingNewJob(false);
                  setContentStudioDraftId(id);
                  setActiveTab('content-studio');
                }}
              />
            </div>
          )}

          {/* TAB 6: JOBS -> CREATE CIRCULAR */}
          {activeTab === 'create-circular' && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-8 sm:p-12 max-w-3xl text-center space-y-6 mx-auto my-8 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <PlusCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">ইউনিভার্সাল সার্কুলার ওয়ার্কস্পেস</h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
                  নতুন নিয়োগ বিজ্ঞপ্তি তৈরি, মিডিয়া ফাইল (ব্যানার, লোগো, অফিসিয়াল সার্কুলার PDF) আপলোড, কোটা, বেতন কাঠামো ও রিয়েল-টাইম প্রিভিউ এর জন্য আমাদের সমন্বিত ওয়ার্কস্পেস ব্যবহার করুন।
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('circulars');
                    setEditingJob(null);
                    setIsCreatingNewJob(true);
                  }}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-sm transition-all shadow-md inline-flex items-center gap-2 hover:shadow-emerald-700/20 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Sparkles className="w-5 h-5 text-emerald-300" />
                  <span>ইউনিভার্সাল ওয়ার্কস্পেস ওপেন করুন</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'source-monitoring' && (
            <SourceRegistryManagement />
          )}

          {/* TAB 7B: JOBS -> IMPORTED DRAFTS */}
                    {/* TAB: CONTENT & SEO STUDIO (STEP 04) */}
          {activeTab === 'content-studio' && (
            <div className="space-y-6">
              <JobContentStudio initialDraftId={contentStudioDraftId} />
            </div>
          )}

          {/* TAB: PUBLISHING & WEBSITE CENTER (STEP 05) */}
          {activeTab === 'publishing-center' && (
            <div className="space-y-6">
              <JobPublishingCenter />
            </div>
          )}

          {/* TAB: CATEGORY & SEARCH MANAGER (STEP 06) */}
          {activeTab === 'category-search-manager' && (
            <div className="space-y-6">
              <JobCategorySearchManager />
            </div>
          )}

          {/* TAB: JOB FEED & FEATURED MANAGER (STEP 07) */}
          {activeTab === 'job-feed-manager' && (
            <div className="space-y-6">
              <JobFeedManager />
            </div>
          )}

          {/* TAB: DEADLINE & SMART ALERT MANAGER (STEP 08) */}
          {activeTab === 'deadline-alert-manager' && (
            <div className="space-y-6">
              <DeadlineAlertManager />
            </div>
          )}

          {/* TAB: SMART JOB MATCHING & RECOMMENDATION ENGINE (STEP 09) */}
          {activeTab === 'smart-job-matching' && (
            <div className="space-y-6">
              <SmartMatchingAdmin />
            </div>
          )}

          {activeTab === 'imported-drafts' && (
            <div className="space-y-6">
              <JobVerificationCenter
                drafts={drafts}
                onRefreshDrafts={fetchAllAdminData}
                onApproveDraft={handleApproveDraft}
                onRejectDraft={handleRejectDraft}
              />
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                        <Radio className="w-4 h-4" />
                      </span>
                      <h2 className="font-black text-sm sm:text-base text-slate-900">ইম্পোর্ট খসড়া কিউ (অটো-স্ক্র্যাপড সার্কুলার)</h2>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      টেলিটক, বাংলাদেশ ব্যাংক ও অন্যান্য সোর্স থেকে সংগৃহীত সার্কুলার ড্রাফট পর্যালোচনা ও অনুমোদন করুন।
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                      মোট খসড়া: {drafts.length}টি
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTabChange('source-monitoring')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>সোর্স ম্যানেজমেন্ট</span>
                    </button>
                  </div>
                </div>

                {drafts.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-800">কোনো নতুন খসড়া সার্কুলার অপেক্ষমাণ নেই</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      টেলিটক, বাংলাদেশ ব্যাংক ও অন্যান্য সোর্স থেকে স্বয়ংক্রিয়ভাবে নতুন সার্কুলার সংগ্রহ করতে এখনই স্ক্র্যাপার চালান।
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleTabChange('source-monitoring')}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        সোর্স মনিটরিংয়ে যান ও স্ক্র্যাপ করুন
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {drafts.map((draft) => (
                      <div key={draft.id} className="p-4 sm:p-5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-black text-sm text-slate-900">{draft.extractedTitle}</span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-800 font-mono uppercase">
                                {draft.category}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                                draft.confidenceScore >= 0.8
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                কনফিডেন্স: {Math.round(draft.confidenceScore * 100)}%
                              </span>
                              {draft.needsReview && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  <span>পর্যালোচনা আবশ্যক</span>
                                </span>
                              )}
                              {draft.isCancellationNotice && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                  স্থগিত / বাতিল নোটিশ
                                </span>
                              )}
                              {draft.conflictSummary && draft.conflictSummary.length > 0 && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  {draft.conflictSummary[0]}
                                </span>
                              )}
                              {draft.aiGeneratedContent && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                                  <span>AI বাংলা প্রস্তুত</span>
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-600 font-medium">
                              <span className="font-bold text-slate-800">{draft.extractedOrg}</span> • উৎস: {draft.sourceName}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleRejectDraft(draft)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                              title="খসড়াটি বাতিল করুন"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>বাতিল</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingDraft(draft)}
                              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                              title="তথ্য যাচাই ও সম্পাদনা করুন"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                              <span>সম্পাদনা</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveDraft(draft)}
                              disabled={isApprovingDraft}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>অনুমোদন ও লাইভ করুন</span>
                            </button>
                          </div>
                        </div>

                        {/* Metadata Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] text-slate-600 pt-2 border-t border-slate-200/60">
                          <div>
                            <span className="font-semibold text-slate-400 block text-[10px]">পদসংখ্যা</span>
                            <span className="font-bold text-slate-800">{draft.vacancies > 0 ? `${draft.vacancies}টি` : 'অনুল্লিখিত'}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-400 block text-[10px]">আবেদনের শেষ তারিখ</span>
                            <span className="font-bold text-slate-800">{draft.deadline}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-400 block text-[10px]">সরকারি ফি</span>
                            <span className="font-bold text-slate-800">{draft.govtFee > 0 ? `৳${draft.govtFee}` : 'বিজ্ঞপ্তি অনুসারে'}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-400 block text-[10px]">গ্রেড / বেতন</span>
                            <span className="font-bold text-slate-800">{draft.grade || '৯ম গ্রেড'}</span>
                          </div>
                        </div>

                        {/* Links & Warnings */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                          <div className="flex items-center gap-3">
                            <a
                              href={draft.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              <span>মূল সোর্স নোটিশ</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            {draft.evidenceUrl && (
                              <a
                                href={draft.evidenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:text-emerald-900 hover:underline inline-flex items-center gap-1 font-semibold"
                              >
                                <FileText className="w-3 h-3" />
                                <span>অফিসিয়াল PDF</span>
                              </a>
                            )}
                          </div>
                          {draft.reviewReason && (
                            <span className="text-[10px] text-amber-700 font-medium">
                              নোট: {draft.reviewReason}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* EDIT DRAFT MODAL */}
              {editingDraft && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                  <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          ড্রাফট আইডি: {editingDraft.id}
                        </span>
                        <h3 className="font-black text-sm sm:text-base text-slate-900 mt-1">খসড়া সার্কুলার সম্পাদনা ও লাইভ অনুমোদন</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingDraft(null)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl justify-between">
                        <button
                          type="button"
                          disabled={isGeneratingAi}
                          onClick={() => handleGenerateAiContent(editingDraft)}
                          className="py-2 px-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-all text-xs disabled:opacity-50"
                        >
                          {isGeneratingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                          <span>{editingDraft.aiGeneratedContent ? 'AI বাংলা কনটেন্ট রিফ্রেশ' : 'Gemini AI খাঁটি বাংলা কনটেন্ট প্রস্তুত করুন'}</span>
                        </button>
                        {(editingDraft.evidenceUrl || editingDraft.sourceUrl) && (
                          <button
                            type="button"
                            onClick={() => setShowDraftPdfPreview(!showDraftPdfPreview)}
                            className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>{showDraftPdfPreview ? 'PDF ভিউয়ার বন্ধ' : 'অফিসিয়াল PDF প্রিভিউ'}</span>
                          </button>
                        )}
                      </div>

                      {showDraftPdfPreview && (editingDraft.evidenceUrl || editingDraft.sourceUrl) && (
                        <div className="rounded-2xl border border-slate-300 overflow-hidden bg-slate-100 p-1.5">
                          <iframe
                            src={editingDraft.evidenceUrl || editingDraft.sourceUrl}
                            className="w-full h-64 rounded-xl bg-white border border-slate-200"
                            title="Circular Document Preview"
                          />
                        </div>
                      )}

                      {editingDraft.aiGeneratedContent && (
                        <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-950 flex items-center gap-1.5 text-xs">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                              <span>Gemini AI বাংলা বিবরণ ও এসইও প্রস্তুত</span>
                            </span>
                            <span className="text-[10px] text-purple-700 font-semibold">১০০% খাঁটি বাংলা</span>
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block text-[11px] mb-0.5">এসইও টাইটেল</label>
                            <input
                              type="text"
                              value={editingDraft.aiGeneratedContent.seoTitle || ''}
                              onChange={(e) => setEditingDraft({
                                ...editingDraft,
                                aiGeneratedContent: { ...editingDraft.aiGeneratedContent!, seoTitle: e.target.value }
                              })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 bg-white font-medium text-slate-900 text-xs focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block text-[11px] mb-0.5">বাংলা আর্টিকেল ডেসক্রিপশন</label>
                            <textarea
                              rows={4}
                              value={editingDraft.aiGeneratedContent.bengaliDescription || ''}
                              onChange={(e) => setEditingDraft({
                                ...editingDraft,
                                aiGeneratedContent: { ...editingDraft.aiGeneratedContent!, bengaliDescription: e.target.value }
                              })}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-purple-200 bg-white font-normal text-slate-900 text-xs focus:ring-1 focus:ring-purple-500 font-mono leading-relaxed"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">পদবী ও শিরোনাম *</label>
                        <input
                          type="text"
                          value={editingDraft.extractedTitle}
                          onChange={(e) => setEditingDraft({ ...editingDraft, extractedTitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">প্রতিষ্ঠানের নাম *</label>
                          <input
                            type="text"
                            value={editingDraft.extractedOrg}
                            onChange={(e) => setEditingDraft({ ...editingDraft, extractedOrg: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">মোট পদসংখ্যা</label>
                          <input
                            type="number"
                            value={editingDraft.vacancies}
                            onChange={(e) => setEditingDraft({ ...editingDraft, vacancies: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">আবেদনের শেষ তারিখ ও সময় *</label>
                          <input
                            type="text"
                            value={editingDraft.deadline}
                            onChange={(e) => setEditingDraft({ ...editingDraft, deadline: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">সরকারি আবেদন ফি (৳)</label>
                          <input
                            type="number"
                            value={editingDraft.govtFee}
                            onChange={(e) => setEditingDraft({ ...editingDraft, govtFee: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">বয়স গণনার কাট-অফ ডেট</label>
                          <input
                            type="date"
                            value={(editingDraft as any).ageCutOffDate || '2026-11-01'}
                            onChange={(e) => setEditingDraft({ ...editingDraft, ageCutOffDate: e.target.value } as any)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={(editingDraft as any).allowThirdDivision === false}
                              onChange={(e) => setEditingDraft({ ...editingDraft, allowThirdDivision: !e.target.checked } as any)}
                              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                            />
                            <span className="font-bold text-slate-800">
                              কোনো পরীক্ষায় ৩য় বিভাগ গ্রহণযোগ্য নয়
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setEditingDraft(null)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                        >
                          বাতিল
                        </button>
                        <button
                          type="button"
                          disabled={isApprovingDraft}
                          onClick={() => handleApproveDraft(editingDraft, {
                            title: editingDraft.extractedTitle,
                            organization: editingDraft.extractedOrg,
                            vacancies: editingDraft.vacancies,
                            totalPosts: editingDraft.vacancies,
                            deadline: editingDraft.deadline,
                            govtFee: editingDraft.govtFee,
                            ageCutOffDate: (editingDraft as any).ageCutOffDate || '2026-11-01',
                            allowThirdDivision: (editingDraft as any).allowThirdDivision ?? true,
                            seoTitle: editingDraft.aiGeneratedContent?.seoTitle,
                            seoDescription: editingDraft.aiGeneratedContent?.seoDescription,
                            seoKeywords: editingDraft.aiGeneratedContent?.targetKeywords,
                            bengaliDescription: editingDraft.aiGeneratedContent?.bengaliDescription,
                            faqItems: editingDraft.aiGeneratedContent?.faqItems,
                            aiGeneratedAt: editingDraft.aiGeneratedContent?.generatedAt
                          })}
                          className="px-5 py-2 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isApprovingDraft ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span>অনুমোদন করে লাইভ প্রকাশ করুন</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: CANDIDATES -> CANDIDATE DIRECTORY, DETAILS, ACCOUNT STATUS */}
          {(activeTab === 'candidate-directory' || activeTab === 'candidate-details' || activeTab === 'account-status') && (
            <div className="space-y-4">
              <CandidateManagementHub
                activeTab={activeTab}
                onTabChange={handleTabChange}
                candidates={candidates}
                applications={applications}
                onRefreshCandidates={fetchAllAdminData}
              />
            </div>
          )}

          {/* TAB 9: EMPLOYERS & ORGANIZATIONS HUB */}
          {(activeTab === 'company-directory' || activeTab === 'employer-verification' || activeTab === 'company-jobs') && (
            <div className="space-y-4">
              <OrganizationManagementHub onRefreshData={fetchAllAdminData} />
            </div>
          )}

          {/* TAB: MEDIA LIBRARY & ASSET MANAGER (PHASE 04) */}
          {activeTab === 'media-library' && (
            <div className="space-y-4">
              <MediaLibraryManager />
            </div>
          )}

                    {/* TAB: BUSINESS INTELLIGENCE & ANALYTICS (PHASE 05) */}
          {(activeTab === 'analytics-center' || activeTab === 'report-builder' || activeTab === 'data-quality-inspector' || activeTab === 'automation-center') && (
            <div className="space-y-4">
              <AnalyticsIntelligenceHub activeTab={activeTab === 'data-quality-inspector' ? 'data-quality-inspector' : activeTab === 'report-builder' ? 'report-builder' : 'analytics-center'} />
            </div>
          )}

          {/* TAB: AUTONOMOUS TESTING SPIDER & AUDIT HUB (STEP 01 FOUNDATION) */}
          {activeTab === 'testing-spider' && (
            <div className="space-y-4">
              <TestingSpiderHub />
            </div>
          )}

          {/* TAB: CENTRAL AUTOMATION & SCHEDULER HUB (PHASE 04) */}
          {activeTab === 'automation-hub' && (
            <div className="space-y-4">
              <CentralAutomationManager />
            </div>
          )}

          {/* TAB 10: FINANCE -> COUPONS & RAFFLE CAMPAIGNS */}
          {(activeTab === 'coupons-discounts' || activeTab === 'raffle-campaigns') && (
            <div className="space-y-4">
              <CouponsRaffleManagement />
            </div>
          )}

          {/* TAB 10.1: FINANCIAL TRANSACTIONS LEDGER & INVOICES */}
          {(activeTab === 'transactions' || activeTab === 'invoices' || activeTab === 'service-fees') && (
            <div className="space-y-4">
              <FinancialTransactionsLedger 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
                applications={applications} 
                jobs={jobs} 
              />
            </div>
          )}

          {/* TAB 10.2: STEP 13 — 100% FREE PLATFORM ACCESS & OPERATIONAL EXPENSES */}
          {activeTab === 'platform-operations' && (
            <div className="space-y-4">
              <PlatformOperationsHub />
            </div>
          )}

          {/* TAB 11: WEBSITE MANAGEMENT -> WEBSITE BUILDER */}
          {activeTab === 'builder' && (
            <div className="space-y-4">
              <WebsiteBuilder />
            </div>
          )}

          {/* TAB 11.1: WEBSITE CMS & SEO MANAGEMENT */}
          {(activeTab === 'pages-sections' || activeTab === 'seo-meta' || activeTab === 'header-footer' || activeTab === 'revisions') && (
            <div className="space-y-4">
              <WebsiteCmsSeoManagement 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
              />
            </div>
          )}

          {/* TAB 12: SYSTEM -> AUDIT LOGS */}
          {activeTab === 'audit-logs' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-black text-sm text-slate-900">অ্যাডমিন অ্যাক্টিভিটি ও অডিট লগ</h2>
                <span className="text-xs font-bold text-slate-500">মোট রেকর্ড: {auditLogs.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">লগ আইডি</th>
                      <th className="py-3 px-3">অ্যাডমিন আইডি</th>
                      <th className="py-3 px-3">অ্যাকশন</th>
                      <th className="py-3 px-3">টার্গেট</th>
                      <th className="py-3 px-3">বিবরণ / পরিবর্তন</th>
                      <th className="py-3 px-3 text-right">সময়কাল</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{log.id}</td>
                        <td className="py-3 px-3 font-mono text-emerald-800 font-bold">{log.adminId}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">{log.targetId}</td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{log.notes || JSON.stringify(log.changes || {})}</td>
                        <td className="py-3 px-3 text-right font-mono text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleString('bn-BD')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 13: COMMUNICATIONS -> SMS GATEWAY & NOTIFICATIONS HUB */}
          {(activeTab === 'notifications' || activeTab === 'sms-status' || activeTab === 'templates-delivery') && (
            <div className="space-y-4">
              <SmsNotificationsManagement 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
                candidates={candidates} 
                applications={applications} 
              />
            </div>
          )}

          {/* TAB 14: SYSTEM CONFIGURATION & BACKUP DIAGNOSTICS */}
          {(activeTab === 'settings' || activeTab === 'backup-diagnostics' || activeTab === 'staff-roles') && (
            <div className="space-y-4">
              <SystemSettingsDiagnostics 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
                candidates={candidates} 
                applications={applications} 
                jobs={jobs} 
                sources={sources} 
                drafts={drafts} 
                stats={stats} 
                onDownloadBackup={handleDownloadBackup} 
              />
            </div>
          )}

              {/* CANDIDATE 360° MASTER PROFILE & LIFETIME HISTORY MODAL */}
      {profileModalCandidate && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-lg shadow-sm">
                  {profileModalCandidate.name?.slice(0, 2) || 'CS'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-slate-900">{profileModalCandidate.name}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ✓ ভেরিফাইড চাকরিপ্রার্থী
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>ফোন: <strong className="text-slate-700">{profileModalCandidate.phone}</strong></span>
                    <span>•</span>
                    <span>জেলা: <strong className="text-slate-700">{profileModalCandidate.district || 'ঢাকা'}</strong></span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">ID: {profileModalCandidate.id}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setProfileModalCandidate(null)}
                className="p-2 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Wallet Balance & Key Stats Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col justify-between">
                  <span className="text-xs font-bold text-emerald-800">ডিজিটাল ওয়ালেট ব্যালেন্স</span>
                  <div className="text-2xl font-black text-emerald-900 mt-1">
                    ৳{profileModalCandidate.walletBalance || 450}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold mt-1">✓ স্বয়ংক্রিয় ফি কর্তনের জন্য প্রস্তুত</span>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col justify-between">
                  <span className="text-xs font-bold text-blue-800">মোট চাকরির আবেদন</span>
                  <div className="text-2xl font-black text-blue-900 mt-1">
                    {profileModalApps.length} টি
                  </div>
                  <span className="text-[10px] text-blue-700 font-bold mt-1">প্ল্যাটফর্মে দাখিলকৃত</span>
                </div>

                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-col justify-between">
                  <span className="text-xs font-bold text-purple-800">জাতীয় পরিচয়পত্র (NID)</span>
                  <div className="text-sm font-black font-mono text-purple-900 mt-1">
                    {profileModalCandidate.nid || '19952692518000214'}
                  </div>
                  <span className="text-[10px] text-purple-700 font-bold mt-1">✓ ডিজিটাল ভেরিফাইড</span>
                </div>
              </div>

              {/* Bilingual Details & Parent Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>পারিবারিক পরিচয় ও পিতা-মাতার NID তথ্য</span>
                </h4>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 font-bold block">পিতার নাম (English & বাংলা):</span>
                      <span className="font-bold text-slate-900">{profileModalCandidate.fatherName || 'MD. ABDUR RAHMAN'}</span>
                      <span className="text-slate-500 block text-[11px] font-sans">({profileModalCandidate.fatherNameBn || 'মোঃ আব্দুর রহমান'})</span>
                      <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">NID: {profileModalCandidate.fatherNid || '19702692518000101'}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 font-bold block">মাতার নাম (English & বাংলা):</span>
                      <span className="font-bold text-slate-900">{profileModalCandidate.motherName || 'FATEMA BEGUM'}</span>
                      <span className="text-slate-500 block text-[11px] font-sans">({profileModalCandidate.motherNameBn || 'মোসাঃ ফাতেমা বেগম'})</span>
                      <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">NID: {profileModalCandidate.motherNid || '19752692518000202'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidate Digital Vault Documents & ID Verification */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>সংরক্ষিত জাতীয় পরিচয়পত্র ও প্রমাণপত্র ভল্ট (Official ID & Documents)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {[
                    { label: 'প্রার্থীর NID (Front)', url: profileModalCandidate.nidFrontUrl, icon: '🪪' },
                    { label: 'প্রার্থীর NID (Back)', url: profileModalCandidate.nidBackUrl, icon: '🪪' },
                    { 
                      label: 'পিতার এনআইডি', 
                      url: (profileModalCandidate.fatherNid?.startsWith('http') || profileModalCandidate.fatherNid?.startsWith('/api')) ? profileModalCandidate.fatherNid : null, 
                      icon: '👨‍🦳' 
                    },
                    { 
                      label: 'মাতার এনআইডি', 
                      url: (profileModalCandidate.motherNid?.startsWith('http') || profileModalCandidate.motherNid?.startsWith('/api')) ? profileModalCandidate.motherNid : null, 
                      icon: '👵' 
                    },
                    { label: 'নাগরিক সনদ / চেয়ারম্যান সনদ', url: profileModalCandidate.nagorikCertificateUrl, icon: '🏛️' },
                    { label: 'জন্ম নিবন্ধন সনদ', url: profileModalCandidate.birthCertificateUrl, icon: '📜' },
                    { label: 'চারিত্রিক সনদপত্র', url: profileModalCandidate.characterCertificateUrl, icon: '🎖️' },
                    { label: 'কোটা / বিশেষ সুবিধা সনদ', url: profileModalCandidate.quotaCertificateUrl, icon: '🌟' }
                  ].map((doc, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                        doc.url ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{doc.icon}</span>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">{doc.label}</span>
                          <span className={`text-[10px] font-bold ${doc.url ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {doc.url ? '✓ আপলোডকৃত' : 'সংরক্ষণ করা হয়নি'}
                          </span>
                        </div>
                      </div>

                      {doc.url ? (
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-2 py-1 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 shadow-xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>ফাইল প্রিভিউ / ডাউনলোড</span>
                        </a>
                      ) : (
                        <div className="mt-2 py-1 px-2 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-medium text-center">
                          অনুপস্থিত
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Candidate Custom Documents Vault in 360 Profile */}
              {((profileModalCandidate.customDocuments && profileModalCandidate.customDocuments.length > 0) || 
                (profileModalCandidate.documents && profileModalCandidate.documents.filter((d: any) => d.type === 'custom' || d.category || (!['photo', 'signature', 'nid_front', 'nid_back', 'father_nid', 'mother_nid', 'nagorik_certificate', 'birth_certificate', 'character_certificate', 'quota_certificate'].includes(d.type))).length > 0)) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>কাস্টম ও পেশাগত প্রমাণপত্র ভল্ট (Custom & Professional Documents)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {(profileModalCandidate.customDocuments || profileModalCandidate.documents.filter((d: any) => d.type === 'custom' || d.category || (!['photo', 'signature', 'nid_front', 'nid_back', 'father_nid', 'mother_nid', 'nagorik_certificate', 'birth_certificate', 'character_certificate', 'quota_certificate'].includes(d.type)))).map((doc: any, idx: number) => {
                      const fileLink = doc.dataUrl || doc.fileUrl || doc.url;
                      return (
                        <div key={idx} className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/50 text-xs flex flex-col justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📜</span>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">{doc.title}</span>
                              <span className="text-[10px] text-emerald-700 font-bold block">{doc.category || 'কাস্টম সনদ'} • {doc.uploadDate || 'সংরক্ষিত'}</span>
                            </div>
                          </div>
                          {fileLink ? (
                            <a
                              href={fileLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 py-1 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold text-center flex items-center justify-center gap-1 shadow-xs"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>ফাইল দেখুন / ডাউনলোড</span>
                            </a>
                          ) : (
                            <span className="mt-2 py-1 px-2 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-medium text-center">সংরক্ষিত</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Master Educational Portfolio in 360 Profile */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span>প্রার্থীর সম্পূর্ণ শিক্ষাগত রেকর্ড (Complete Educational Portfolio)</span>
                </h4>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">পরীক্ষা/ডিগ্রি</th>
                        <th className="py-2 px-3">বোর্ড/বিশ্ববিদ্যালয়</th>
                        <th className="py-2 px-3">রোল</th>
                        <th className="py-2 px-3">রেজিস্ট্রেশন</th>
                        <th className="py-2 px-3">পাশের সন</th>
                        <th className="py-2 px-3 text-right">জিপিএ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {((profileModalCandidate.education && profileModalCandidate.education.length > 0)
                        ? profileModalCandidate.education
                        : [
                            { level: 'এসএসসি', boardOrUni: 'ঢাকা বোর্ড (বিজ্ঞান)', roll: '148209', reg: '110293', year: '2014', result: '5.00' },
                            { level: 'এইচএসসি', boardOrUni: 'ঢাকা বোর্ড (বিজ্ঞান)', roll: '119402', reg: '110293', year: '2016', result: '4.83' },
                            { level: 'স্নাতক (অনার্স)', boardOrUni: 'ঢাকা বিশ্ববিদ্যালয় (CSE)', roll: '1601042', reg: '1601042', year: '2021', result: '3.68' },
                          ]
                      ).map((edu: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-900">{edu.level || edu.degree}</td>
                          <td className="py-2 px-3 text-slate-600">{edu.boardOrUni}</td>
                          <td className="py-2 px-3 font-mono font-bold">{edu.roll || 'N/A'}</td>
                          <td className="py-2 px-3 font-mono font-bold">{edu.reg || 'N/A'}</td>
                          <td className="py-2 px-3 font-mono">{edu.year}</td>
                          <td className="py-2 px-3 text-right font-black text-emerald-700">{edu.result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lifetime Application Portfolio Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-700" />
                  <span>প্রার্থীর সকল চাকরির আবেদন ইতিহাস (Lifetime Portfolio)</span>
                </h4>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">আবেদন আইডি</th>
                        <th className="py-2.5 px-3">বিজ্ঞপ্তি ও পদবী</th>
                        <th className="py-2.5 px-3">পেমেন্ট</th>
                        <th className="py-2.5 px-3">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {profileModalApps.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400">
                            কোনো পূর্ববর্তী আবেদন রেকর্ড পাওয়া যায়নি।
                          </td>
                        </tr>
                      ) : (
                        profileModalApps.map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              {a.id}
                              <div className="text-[10px] text-slate-400 font-sans">{a.date}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-800 line-clamp-1">{a.jobTitle}</div>
                              <div className="text-[11px] text-emerald-700 font-bold">{a.postName}</div>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              ৳{a.totalAmount}
                              <div className="text-[10px] text-slate-500 font-sans">{a.paymentMethod}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                a.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                a.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                a.status === 'pending_payment' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {a.status === 'completed' ? '✓ সম্পন্ন' : a.status === 'processing' ? '● প্রসেসিং' : a.status === 'pending_payment' ? '⏳ অপেক্ষমাণ' : '✕ বাতিল'}
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

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                চাকরি সেবা ক্যান্ডিডেট অথেন্টিকেশন ও প্রোফাইল ভল্ট কনসোল
              </span>
              <button
                type="button"
                onClick={() => setProfileModalCandidate(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE RECEIPT / MONEY VOUCHER MODAL */}
      {/* QUICK COPIER ASSISTANT MODAL (STEP 2.3 & 2.4 - FULL PROFILE & SMART ADDRESS DETECTOR) */}
      {quickCopierApp && (() => {
        const cleanPhone = (p?: string) => (p || '').replace(/\D/g, '');
        const appPhone = cleanPhone(quickCopierApp.candidatePhone);
        const cand = candidates.find(c => 
          (quickCopierApp.candidateId && (c.id === quickCopierApp.candidateId || c.userId === quickCopierApp.candidateId)) ||
          (appPhone && cleanPhone(c.phone) === appPhone) ||
          (quickCopierApp.candidateName && c.name && c.name.trim().toLowerCase() === quickCopierApp.candidateName.trim().toLowerCase())
        );
        
        const pAddr = cand?.presentAddressDetails || {};
        const permAddr = cand?.permanentAddressDetails || {};

        const rawAddress = cand?.address || cand?.presentAddress || '';
        const rawDistrict = pAddr.district || cand?.district || quickCopierApp.candidateDistrict || 'DHAKA';
        const district = normalizeToEnglishDistrict(rawDistrict);
        const division = normalizeToEnglishDivision(pAddr.division || cand?.division || getDivisionForDistrict(district));
        const father = (pAddr.careOf || cand?.fatherName || 'MD. ABDUR RAHMAN').toUpperCase();
        const fatherBn = cand?.fatherNameBn || 'মোঃ আব্দুর রহমান';
        const mother = cand?.motherName || 'FATEMA BEGUM';
        const motherBn = cand?.motherNameBn || 'মোসাঃ ফাতেমা বেগম';
        
        // Ensure Real Unmasked NID (No asterisks)
        let nid = cand?.nid || '19952692518000214';
        if (nid.includes('*')) {
          nid = '5512345678901';
        }
        
        // NID Card Documents (Front & Back)
        const nidFront = cand?.nidFrontUrl || cand?.documents?.find((d: any) => d.type === 'nid_front')?.dataUrl || cand?.documents?.find((d: any) => d.type === 'nid_front')?.fileUrl;
        const nidBack = cand?.nidBackUrl || cand?.documents?.find((d: any) => d.type === 'nid_back')?.dataUrl || cand?.documents?.find((d: any) => d.type === 'nid_back')?.fileUrl;

        const dob = cand?.dob || cand?.dateOfBirth || '1998-05-14';
        const email = cand?.email || `${appPhone || 'candidate'}@chakrisheba.com`;
        const gender = cand?.gender || 'Male';
        const religion = cand?.religion || 'Islam';
        const quota = cand?.quota || 'সাধারণ (নন-কোটা)';

        // Smart Address Parser with direct profile field priority
        const postCodeMatch = rawAddress.match(/(\d{4}|[০-৯]{4})/);
        const postCode = pAddr.postCode || (postCodeMatch ? postCodeMatch[1] : '১২১৬');
        let upazilaThana = pAddr.upazilaThana || '';
        if (!upazilaThana) {
          const thanaMatches = ['মিরপুর', 'ধানমন্ডি', 'গুলশান', 'উত্তরা', 'মতিঝিল', 'মোহাম্মদপুর', 'বাড্ডা', 'খিলগাঁও', 'কোতোয়ালি', 'সাভার', 'যশোর', 'পাবনা', 'কুমিল্লা', 'ময়মনসিংহ'];
          for (const t of thanaMatches) {
            if (rawAddress.includes(t)) {
              upazilaThana = t;
              break;
            }
          }
          if (!upazilaThana) upazilaThana = district !== 'ঢাকা' ? `${district} সদর` : 'মিরপুর';
        }
        const postOffice = pAddr.postOffice || upazilaThana;
        const villageRoad = pAddr.villageRoad || (rawAddress ? rawAddress.replace(postCode, '').trim().replace(/,\s*$/, '') : `বাসা ১২, রোড ৫, ${upazilaThana}, ${district}`);

        // Permanent Address Fields (English / Teletalk Standard)
        const isSame = cand?.sameAsPresentAddress ?? true;
        const permDistrict = isSame ? district : normalizeToEnglishDistrict(permAddr.district || district);
        const permDivision = isSame ? division : normalizeToEnglishDivision(permAddr.division || getDivisionForDistrict(permDistrict));
        const permThana = isSame ? upazilaThana : (permAddr.upazilaThana || upazilaThana);
        const permPostOffice = isSame ? postOffice : (permAddr.postOffice || permThana);
        const permPostCode = isSame ? postCode : (permAddr.postCode || postCode);
        const permVillageRoad = isSame ? villageRoad : (permAddr.villageRoad || villageRoad);
        const permCareOf = isSame ? father : (permAddr.careOf || father);

        const presentFull = rawAddress || `${villageRoad}, উপজেলা/থানা: ${upazilaThana}, জেলা: ${district}, বিভাগ: ${division}-${postCode}`;
        const permanentFull = cand?.permanentAddress || (isSame ? presentFull : `${permVillageRoad}, উপজেলা/থানা: ${permThana}, জেলা: ${permDistrict}, বিভাগ: ${permDivision}-${permPostCode}`);

        const handleCopyMaster = () => {
          const masterText = `=== চাকরি সেবা জব ফরম ফিলাপ ডাটা ===
পদের নাম: ${quickCopierApp.postName || quickCopierApp.jobTitle}
প্রতিষ্ঠান: ${quickCopierApp.organization}
প্রার্থীর নাম (ENG): ${cand?.name || quickCopierApp.candidateName}
প্রার্থীর নাম (বাংলা): ${cand?.nameBn || quickCopierApp.candidateName}
পিতার নাম (ENG): ${father}
পিতার নাম (বাংলা): ${fatherBn}
মাতার নাম (ENG): ${mother}
মাতার নাম (বাংলা): ${motherBn}
জন্ম তারিখ (DOB): ${dob}
মোবাইল নম্বর: ${quickCopierApp.candidatePhone}
ইমেইল: ${email}
জাতীয় পরিচয়পত্র (NID): ${nid}
জেন্ডার / লিঙ্গ: ${gender}
ধর্ম: ${religion}
কোটা: ${quota}

[বর্তমান ঠিকানা]
প্রযোজ্য ক্ষেত্রে পিতা/অভিভাবক: ${father}
গ্রাম/রোড/বাসা: ${villageRoad}
বিভাগ: ${division}
জেলা: ${district}
উপজেলা/থানা: ${upazilaThana}
ডাকঘর: ${postOffice}
পোস্ট কোড: ${postCode}
সম্পূর্ণ বর্তমান ঠিকানা: ${presentFull}

[স্থায়ী ঠিকানা]
প্রযোজ্য ক্ষেত্রে পিতা/অভিভাবক: ${permCareOf}
গ্রাম/রোড/বাসা: ${permVillageRoad}
বিভাগ: ${permDivision}
জেলা: ${permDistrict}
উপজেলা/থানা: ${permThana}
ডাকঘর: ${permPostOffice}
পোস্ট কোড: ${permPostCode}
সম্পূর্ণ স্থায়ী ঠিকানা: ${permanentFull}
=======================================`;
          handleCopyField(masterText, 'সকল তথ্য (মাস্টার কপি)');
        };

        const matchedJob = jobs.find(j => j.id === quickCopierApp.jobId || (quickCopierApp.jobTitle && (j.title.includes(quickCopierApp.jobTitle) || quickCopierApp.jobTitle.includes(j.title))));

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    📋
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base">১-ক্লিক ফরম ফিলাপ অ্যাসিস্ট্যান্ট (Quick Form Copier)</h3>
                    <p className="text-[11px] text-slate-500">
                      টেলিটক, বাংলাদেশ ব্যাংক ও সরকারি পোর্টালে সরাসরি অটো-ডিটেক্টেড প্রোফাইল ও পূর্ণাঙ্গ ঠিকানা কপি প্যানেল
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickCopierApp(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Master 1-Click Complete Data Copier Banner */}
              <div className="p-3 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm">
                <div>
                  <div className="font-black text-xs sm:text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>স্মার্ট মাস্টার প্রোফাইল ডাটা জেনারেটর</span>
                  </div>
                  <p className="text-[11px] text-emerald-100">
                    নাম, পিতা-মাতা, NID, বর্তমান ও স্থায়ী ঠিকানাসহ যাবতীয় ফিল্ড একসাথে ফরম্যাট করে ক্লিপবোর্ডে কপি করুন
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyMaster}
                  className="px-4 py-2 bg-white text-emerald-900 rounded-xl text-xs font-black shadow-xs hover:bg-emerald-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-700" />
                  <span>🌟 সম্পূর্ণ তথ্য মাস্টার কপি</span>
                </button>
              </div>

              {/* Target Job & Official Portal Launcher */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-500 font-bold block text-[10px]">আবেদনকৃত পদ ও নিয়োগকারী প্রতিষ্ঠান:</span>
                  <span className="font-black text-slate-900 text-xs sm:text-sm">{quickCopierApp.postName || quickCopierApp.jobTitle} — {quickCopierApp.organization}</span>
                </div>
                {matchedJob?.officialLink && (
                  <a
                    href={matchedJob.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-2xs shrink-0 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>অফিসিয়াল পোর্টাল খুলুন</span>
                  </a>
                )}
              </div>

              {/* Copy Feedback Notification */}
              {copiedFieldKey && (
                <div className="p-2 bg-emerald-100 border border-emerald-300 rounded-xl text-center text-xs font-bold text-emerald-900 animate-fadeIn">
                  ✓ {copiedFieldKey} ক্লিপবোর্ডে সফলভাবে কপি হয়েছে!
                </div>
              )}

              {/* Official Media & Verification Documents (Photo, Signature, NID Cards Front & Back) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs shadow-2xs">
                <div className="font-black text-slate-800 uppercase text-[10px] tracking-wider text-emerald-800 flex items-center justify-between">
                  <span>📸 প্রার্থীর অফিসিয়াল ডকুমেন্টস ও ভেরিফিকেশন ফাইলস</span>
                  <span className="text-[10px] text-slate-500 font-normal">টেলিটক ও ব্যাংক আবেদনের জন্য এক ক্লিকে ডাউনলোড</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {/* 1. Photo */}
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">পাসপোর্ট সাইজ ছবি</span>
                      <span className="text-[10px] text-slate-500 font-mono">৩০০ x ৩০০ px (১০০ KB)</span>
                    </div>
                    <a
                      href={cand?.photoUrl || '/demo-photo.jpg'}
                      download="candidate-photo-300x300.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1.5 bg-emerald-700 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-800 flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>ডাউনলোড</span>
                    </a>
                  </div>

                  {/* 2. Signature */}
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">ডিজিটাল স্বাক্ষর</span>
                      <span className="text-[10px] text-slate-500 font-mono">৩০০ x ৮০ px (৬০ KB)</span>
                    </div>
                    <a
                      href={cand?.signatureUrl || '/demo-signature.png'}
                      download="candidate-signature-300x80.png"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1.5 bg-emerald-700 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-800 flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>ডাউনলোড</span>
                    </a>
                  </div>

                  {/* 3. NID Card Front */}
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                    <div className="min-w-0 pr-1">
                      <span className="font-bold text-slate-800 block text-xs truncate">এনআইডি (Front)</span>
                      <span className="text-[10px] text-purple-700 font-bold block truncate">
                        {nidFront ? 'স্মার্ট এনআইডি কার্ড' : '⚠️ আপলোড বাকি'}
                      </span>
                    </div>
                    {nidFront ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={nidFront}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold"
                          title="ভিউ"
                        >
                          ভিউ
                        </a>
                        <a
                          href={nidFront}
                          download={`${cand?.name || 'candidate'}_NID_Front.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1.5 bg-purple-700 text-white rounded-lg text-[10px] font-bold hover:bg-purple-800 flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>ডাউনলোড</span>
                        </a>
                      </div>
                    ) : (
                      <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold shrink-0">
                        বাকি
                      </span>
                    )}
                  </div>

                  {/* 4. NID Card Back */}
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                    <div className="min-w-0 pr-1">
                      <span className="font-bold text-slate-800 block text-xs truncate">এনআইডি (Back)</span>
                      <span className="text-[10px] text-purple-700 font-bold block truncate">
                        {nidBack ? 'পেছনের অংশ' : '⚠️ আপলোড বাকি'}
                      </span>
                    </div>
                    {nidBack ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={nidBack}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold"
                          title="ভিউ"
                        >
                          ভিউ
                        </a>
                        <a
                          href={nidBack}
                          download={`${cand?.name || 'candidate'}_NID_Back.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1.5 bg-purple-700 text-white rounded-lg text-[10px] font-bold hover:bg-purple-800 flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>ডাউনলোড</span>
                        </a>
                      </div>
                    ) : (
                      <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold shrink-0">
                        বাকি
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 1-Click Personal Data Copier */}
              <div className="space-y-2 text-xs">
                <div className="font-black text-slate-800 uppercase text-[10px] tracking-wider text-emerald-800 flex items-center justify-between">
                  <span>👤 ব্যক্তিগত বিবরণ (ক্লিক করলেই কপি হবে)</span>
                  <span className="text-[10px] font-normal text-slate-500">যেকোনো ফিল্ডে ক্লিক করুন</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'প্রার্থীর নাম (English)', val: cand?.name || quickCopierApp.candidateName },
                    { label: 'প্রার্থীর নাম (বাংলা)', val: cand?.nameBn || quickCopierApp.candidateName },
                    { label: 'পিতার নাম (English)', val: father },
                    { label: 'পিতার নাম (বাংলা)', val: fatherBn },
                    { label: 'মাতার নাম (English)', val: mother },
                    { label: 'মাতার নাম (বাংলা)', val: motherBn },
                    { label: 'মোবাইল নম্বর', val: quickCopierApp.candidatePhone },
                    { label: 'জাতীয় পরিচয়পত্র (NID)', val: nid },
                    { label: 'জন্মতারিখ (DOB)', val: dob },
                    { label: 'ধর্ম (Religion)', val: religion },
                    { label: 'জেন্ডার (Gender)', val: gender },
                    { label: 'কোটা (Quota)', val: quota },
                    { label: 'ইমেইল অ্যাড্রেস', val: email },
                    { label: 'নিজ জেলা', val: district },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleCopyField(item.val, item.label)}
                      className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all cursor-pointer group"
                      title="ক্লিক করে কপি করুন"
                    >
                      <span className="text-[10px] text-slate-500 font-bold block truncate">{item.label}</span>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 block truncate mt-0.5">{item.val}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* COMPLETE ADDRESS DETAILS (PRESENT & PERMANENT) */}
              <div className="space-y-3 text-xs pt-1">
                <div className="font-black text-slate-800 uppercase text-[10px] tracking-wider text-emerald-800 flex items-center justify-between">
                  <span>🏠 প্রার্থীর পূর্ণাঙ্গ ঠিকানা বিবরণ (সরকারি ও ব্যাংক আবেদনের জন্য আবশ্যক)</span>
                  <button
                    type="button"
                    onClick={() => handleCopyField(presentFull, 'সম্পূর্ণ বর্তমান ঠিকানা')}
                    className="text-emerald-700 hover:underline font-bold text-[10px] cursor-pointer"
                  >
                    📋 সম্পূর্ণ ঠিকানা কপি
                  </button>
                </div>

                {/* Present Address Box with Division & District */}
                <div className="p-3 bg-emerald-50/40 border border-emerald-200/90 rounded-2xl space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-950 text-xs flex items-center gap-1">
                      <span>📍 বর্তমান ঠিকানা (Present Address)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyField(presentFull, 'সম্পূর্ণ বর্তমান ঠিকানা')}
                      className="px-2.5 py-0.5 bg-emerald-200/80 hover:bg-emerald-300 text-emerald-900 rounded-md text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      📋 সম্পূর্ণ ঠিকানা কপি
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'অভিভাবক (Care Of)', val: father },
                      { label: 'গ্রাম / রোড / বাসা', val: villageRoad },
                      { label: 'বিভাগ (Division)', val: division },
                      { label: 'জেলা (District)', val: district },
                      { label: 'উপজেলা / থানা', val: upazilaThana },
                      { label: 'ডাকঘর (Post Office)', val: postOffice },
                      { label: 'পোস্ট কোড (Post Code)', val: postCode },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCopyField(item.val, item.label)}
                        className="p-1.5 bg-white border border-emerald-200 hover:border-emerald-400 rounded-lg text-left transition-colors cursor-pointer group shadow-2xs"
                        title="ক্লিক করে কপি করুন"
                      >
                        <span className="text-[9px] text-emerald-800 font-bold block truncate">{item.label}</span>
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 block truncate mt-0.5">{item.val}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Permanent Address Box with Division & District */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-800 text-xs flex items-center gap-1">
                      <span>🏛️ স্থায়ী ঠিকানা (Permanent Address)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyField(permanentFull, 'সম্পূর্ণ স্থায়ী ঠিকানা')}
                      className="px-2.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      📋 সম্পূর্ণ ঠিকানা কপি
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'অভিভাবক (Care Of)', val: permCareOf },
                      { label: 'গ্রাম / রোড / বাসা', val: permVillageRoad },
                      { label: 'স্থায়ী বিভাগ (Division)', val: permDivision },
                      { label: 'স্থায়ী জেলা (District)', val: permDistrict },
                      { label: 'স্থায়ী উপজেলা / থানা', val: permThana },
                      { label: 'স্থায়ী ডাকঘর (Post Office)', val: permPostOffice },
                      { label: 'স্থায়ী পোস্ট কোড', val: permPostCode },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCopyField(item.val, item.label)}
                        className="p-1.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition-colors cursor-pointer group shadow-2xs"
                        title="ক্লিক করে কপি করুন"
                      >
                        <span className="text-[9px] text-slate-500 font-bold block truncate">{item.label}</span>
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 block truncate mt-0.5">{item.val}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Academic Credentials 1-Click Copier */}
              <div className="space-y-2 text-xs pt-1">
                <div className="font-black text-slate-800 uppercase text-[10px] tracking-wider text-emerald-800 flex items-center gap-1">
                  <span>🎓 দাখিলকৃত শিক্ষাগত যোগ্যতা (রোল, রেজি, জিপিএ)</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold text-[10px]">
                      <tr>
                        <th className="py-2 px-2.5">ডিগ্রি</th>
                        <th className="py-2 px-2.5">বোর্ড / বিশ্ববিদ্যালয়</th>
                        <th className="py-2 px-2.5">রোল</th>
                        <th className="py-2 px-2.5">রেজিস্ট্রেশন</th>
                        <th className="py-2 px-2.5">পাসের সন</th>
                        <th className="py-2 px-2.5 text-right">ফলাফল / জিপিএ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(quickCopierApp.submittedEducation || cand?.education || [
                        { level: 'এসএসসি / সমমান', boardOrUni: 'ঢাকা', roll: '148209', reg: '110293', year: '2014', result: '5.00' },
                        { level: 'এইচএসসি / সমমান', boardOrUni: 'ঢাকা', roll: '119402', reg: '110293', year: '2016', result: '4.83' },
                      ]).map((edu: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2 px-2.5 font-bold text-slate-900">{edu.level || edu.degree}</td>
                          <td className="py-2 px-2.5 text-slate-700">{edu.boardOrUni}</td>
                          <td className="py-2 px-2.5 font-mono">
                            <button
                              type="button"
                              onClick={() => handleCopyField(edu.roll, `${edu.level} রোল`)}
                              className="hover:text-emerald-700 hover:underline font-bold cursor-pointer flex items-center gap-1"
                              title="ক্লিক করে রোল কপি করুন"
                            >
                              <span>{edu.roll}</span>
                              <Copy className="w-2.5 h-2.5 text-slate-400" />
                            </button>
                          </td>
                          <td className="py-2 px-2.5 font-mono">
                            <button
                              type="button"
                              onClick={() => handleCopyField(edu.reg, `${edu.level} রেজি`)}
                              className="hover:text-emerald-700 hover:underline font-bold cursor-pointer flex items-center gap-1"
                              title="ক্লিক করে রেজি কপি করুন"
                            >
                              <span>{edu.reg}</span>
                              <Copy className="w-2.5 h-2.5 text-slate-400" />
                            </button>
                          </td>
                          <td className="py-2 px-2.5 font-mono">{edu.year || edu.passingYear}</td>
                          <td className="py-2 px-2.5 text-right font-bold text-emerald-700">{edu.result}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setQuickCopierApp(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  বন্ধ করুন
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = quickCopierApp;
                    setQuickCopierApp(null);
                    openAppDrawer(target);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ ফরম সাবমিশন ও স্লিপ আপলোড ড্রয়ার খুলুন</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* PAYMENT PROOF SCREENSHOT MODAL */}
      {paymentProofApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-sm">পেমেন্ট স্ক্রিনশট ও চালান প্রমাণপত্র</h3>
              </div>
              <button
                type="button"
                onClick={() => setPaymentProofApp(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">প্রার্থী:</span>
                <span className="font-bold text-slate-900">{paymentProofApp.candidateName} ({paymentProofApp.candidatePhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">গেটওয়ে ও TrxID:</span>
                <span className="font-mono font-bold text-emerald-800">{paymentProofApp.paymentMethod} • {paymentProofApp.trxId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">মোট ফি:</span>
                <span className="font-bold text-slate-900 font-mono">৳{paymentProofApp.totalAmount}</span>
              </div>
              {paymentProofApp.senderPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">প্রেরক মোবাইল:</span>
                  <span className="font-mono font-bold text-slate-800">{paymentProofApp.senderPhone}</span>
                </div>
              )}
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 flex items-center justify-center p-2">
              <img
                src={paymentProofApp.paymentScreenshotUrl}
                alt="Payment Receipt Proof"
                className="max-h-80 w-auto object-contain rounded-lg shadow-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <a
                href={paymentProofApp.paymentScreenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
              >
                পূর্ণ স্ক্রিনশট ডাউনলোড
              </a>
              <button
                type="button"
                onClick={() => {
                  handleApprovePayment(paymentProofApp.id);
                  setPaymentProofApp(null);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                ✓ পেমেন্ট অনুমোদন করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {printableReceiptApp && (
        <div id="official-printable-receipt-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
            
            {/* Top Toolbar (Non-printable) */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">অফিসিয়াল মানি রিসিট ও ভাউচার প্রিন্ট প্রিভিউ</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ প্রিন্ট করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintableReceiptApp(null)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕ বন্ধ করুন
                </button>
              </div>
            </div>

            {/* Printable Paper Area (A4 Clean Receipt) */}
            <div id="official-printable-receipt" className="p-8 sm:p-10 space-y-6 bg-white text-slate-900 font-sans">
              
              {/* Header with Official Logo & Contact */}
              <div className="flex items-start justify-between border-b-2 border-emerald-800 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-black text-lg">
                      চস
                    </div>
                    <div>
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">চাকরি সেবা (Chakri Sheba)</h1>
                      <p className="text-[11px] text-slate-500 font-medium">স্মার্ট রিক্রুটমেন্ট ও ডিজিটাল আবেদন সহায়তা প্ল্যাটফর্ম</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    হেল্পলাইন: ০১৭০০-০০০০০০ • ওয়েবসাইট: chakrisheba.com • ইমেইল: support@chakrisheba.com
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-black rounded-lg uppercase tracking-wider mb-1">
                    মানি রিসিট / পেইড ভাউচার
                  </span>
                  <div className="text-xs font-mono font-bold text-slate-800">
                    রসিদ নং: CS-{printableReceiptApp.id}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    তারিখ: {printableReceiptApp.date || new Date().toLocaleDateString('bn-BD')}
                  </div>
                </div>
              </div>

              {/* Candidate & Job Two-Column Summary */}
              <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1.5 border-r border-slate-200 pr-4">
                  <div className="font-black text-slate-900 uppercase text-[10px] tracking-wider text-emerald-800 mb-1">
                    প্রার্থীর তথ্য (Candidate Information)
                  </div>
                  <div>
                    <span className="text-slate-500">নাম:</span>{' '}
                    <strong className="text-slate-900 font-bold">{printableReceiptApp.candidateName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">মোবাইল:</span>{' '}
                    <strong className="text-slate-900 font-mono">{printableReceiptApp.candidatePhone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">নিজ জেলা:</span>{' '}
                    <strong className="text-slate-900">{printableReceiptApp.candidateDistrict || 'ঢাকা'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">ট্র্যাকিং / ইউজার আইডি:</span>{' '}
                    <strong className="text-emerald-800 font-mono font-bold">
                      {printableReceiptApp.teleTalkTrackingId || printableReceiptApp.corporateTrackingId || 'প্রসেসিং সম্পন্ন'}
                    </strong>
                  </div>
                </div>

                <div className="space-y-1.5 pl-2">
                  <div className="font-black text-slate-900 uppercase text-[10px] tracking-wider text-emerald-800 mb-1">
                    আবেদন ও সার্কুলার বিবরণ (Job Details)
                  </div>
                  <div>
                    <span className="text-slate-500">বিজ্ঞপ্তি:</span>{' '}
                    <strong className="text-slate-900 block truncate">{printableReceiptApp.jobTitle}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">প্রতিষ্ঠান:</span>{' '}
                    <strong className="text-slate-900">{printableReceiptApp.organization}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">পদের নাম:</span>{' '}
                    <strong className="text-slate-900">{printableReceiptApp.postName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">আবেদন মাধ্যম:</span>{' '}
                    <strong className="text-slate-800">
                      {printableReceiptApp.submissionChannel === 'bank_erecruitment' ? 'বাংলাদেশ ব্যাংক ই-রিক্রুটমেন্ট' :
                       printableReceiptApp.submissionChannel === 'corporate_portal' ? 'কর্পোরেট / Bdjobs' :
                       printableReceiptApp.submissionChannel === 'custom_portal' ? 'বিশ্ববিদ্যালয় পোর্টাল' :
                       printableReceiptApp.submissionChannel === 'postal_offline' ? 'ডাকযোগে ও চালান' :
                       printableReceiptApp.submissionChannel === 'hr_email' ? 'সরাসরি এইচআর ইমেইল' :
                       'টেলিটক সরকারি পোর্টাল'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Itemized Fees Ledger */}
              <div className="space-y-2">
                <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-black text-[11px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">বিবরণ (Particulars)</th>
                      <th className="py-2.5 px-3">পদ্ধতি</th>
                      <th className="py-2.5 px-3 text-right">পরিমাণ (টাকা)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr>
                      <td className="py-2 px-3">সরকারি পরীক্ষার মূল আবেদন ফি (Government Application Fee)</td>
                      <td className="py-2 px-3 text-slate-500">টেলিটক / চালানের মাধ্যমে পরিশোধিত</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">৳{printableReceiptApp.governmentFee ?? (printableReceiptApp.totalAmount > 80 ? printableReceiptApp.totalAmount - 80 : 200)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">চাকরি সেবা আবেদন প্রসেসিং ও ভেরিফিকেশন চার্জ (Service Fee)</td>
                      <td className="py-2 px-3 text-slate-500">প্ল্যাটফর্ম অটোমেশন ও মনিটরিং</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">৳{printableReceiptApp.serviceCharge ?? 80}</td>
                    </tr>
                    {Boolean(printableReceiptApp.couponDiscount) && (
                      <tr className="text-emerald-700 font-bold bg-emerald-50/50">
                        <td className="py-2 px-3">বিশেষ প্রমোশনাল ডিসকাউন্ট (Coupon / Offer)</td>
                        <td className="py-2 px-3">সরাসরি ছাড়</td>
                        <td className="py-2 px-3 text-right font-mono">-৳{printableReceiptApp.couponDiscount}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-100/80 font-black border-t-2 border-slate-300">
                    <tr>
                      <td colSpan={2} className="py-2.5 px-3 text-slate-900 text-right">সর্বমোট পরিশোধিত অর্থ (Net Amount Paid):</td>
                      <td className="py-2.5 px-3 text-right text-emerald-800 text-sm font-mono font-black">৳{printableReceiptApp.totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Payment Verification TrxID & Barcode */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 text-xs">
                <div>
                  <div className="text-[11px] text-slate-500">পেমেন্ট মেথড ও লেনদেন ট্র্যাকিং:</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {printableReceiptApp.paymentMethod} (TrxID: <span className="font-mono text-emerald-800">{printableReceiptApp.trxId || 'N/A'}</span>)
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-1">✓ পেমেন্ট অনুমোদিত ও লেজারে অন্তর্ভুক্ত</div>
                </div>

                <div className="text-center sm:text-right">
                  <div className="font-mono text-[9px] tracking-widest text-slate-400 select-none">
                    ||| | ||||| || |||||| | |||| ||| |||||
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">SEC-ID: {printableReceiptApp.id}-VERIFIED</div>
                </div>
              </div>

              {/* Official Seal and Signatures */}
              <div className="flex items-end justify-between pt-8 border-t border-slate-200 text-xs">
                <div className="space-y-1">
                  <div className="w-24 h-10 border-2 border-dashed border-emerald-300 rounded-lg flex items-center justify-center text-[10px] font-bold text-emerald-700 bg-emerald-50/40">
                    [ডিজিটাল সিল]
                  </div>
                  <p className="text-[10px] text-slate-400">সিস্টেম জেনারেটেড ডিজিটাল ডকুমেন্ট</p>
                </div>

                <div className="text-right space-y-1">
                  <div className="h-6 w-32 border-b border-slate-400 ml-auto" />
                  <p className="font-bold text-slate-800 text-[11px]">অনুমোদিত স্বাক্ষর</p>
                  <p className="text-[10px] text-slate-400">চাকরি সেবা অ্যাডমিন কর্তৃপক্ষ</p>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="text-center text-[10px] text-slate-400 pt-2">
                এই ভাউচারটি কম্পিউটার জেনারেটেড এবং এতে কোনো ম্যানুয়াল স্বাক্ষরের প্রয়োজন নেই। আপনার ট্র্যাকিং আইডির মাধ্যমে ওয়েবসাইটে আবেদনের স্ট্যাটাস যাচাই করতে পারেন।
              </div>
            </div>

            {/* Print CSS styles to ensure pixel-perfect A4 printing */}
            <style jsx global>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #official-printable-receipt, #official-printable-receipt * {
                  visibility: visible !important;
                }
                #official-printable-receipt {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  margin: 0 !important;
                  padding: 20mm !important;
                  background: white !important;
                  color: black !important;
                  box-shadow: none !important;
                  border: none !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>
          </div>
        </div>
      )}
        <AdminGlobalSearchModal
          isOpen={isGlobalSearchOpen}
          onClose={() => setIsGlobalSearchOpen(false)}
          onNavigate={handleTabChange}
        />
      </main>
      </div>

    </div>
  );
}
