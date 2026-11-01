'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Globe,
  Pause,
  Play,
  Edit3,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Clock,
  Activity,
  AlertTriangle,
  Layers,
  Database,
  Info,
  History,
  Zap,
} from 'lucide-react';
import { JobSource, SourceClassification, CollectionMethod, SourceHealthStatus, SpiderRun, SpiderRunStatus } from '@/lib/types';

const CLASSIFICATION_LABELS: Record<SourceClassification, { label: string; color: string }> = {
  official: { label: 'সরকারি / অফিসিয়াল', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  news: { label: 'জাতীয় সংবাদপত্র', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  job_board: { label: 'জব বোর্ড', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  custom_api: { label: 'কাস্টম API', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
};

const METHOD_LABELS: Record<CollectionMethod, { label: string; icon: string }> = {
  html_scrape: { label: 'HTML স্ক্র্যাপিং', icon: '🌐' },
  json_api: { label: 'JSON API', icon: '⚡' },
  rss_feed: { label: 'RSS / XML ফিড', icon: '📡' },
  gemini_ocr_pdf: { label: 'Gemini OCR (PDF)', icon: '🧠' },
  manual_entry: { label: 'ম্যানুয়াল এন্ট্রি', icon: '✍️' }
};

const HEALTH_CONFIG: Record<SourceHealthStatus, { label: string; bg: string; dot: string; text: string }> = {
  healthy: { label: 'স্বাভাবিক (Healthy)', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-800' },
  degraded: { label: 'ক্ষতিগ্রস্ত (Degraded)', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500', text: 'text-amber-800' },
  failing: { label: 'ব্যর্থ (Failing)', bg: 'bg-rose-50 border-rose-200', dot: 'bg-rose-500', text: 'text-rose-800' },
  paused: { label: 'স্থগিত (Paused)', bg: 'bg-slate-100 border-slate-200', dot: 'bg-slate-400', text: 'text-slate-700' }
};

const RUN_STATUS_CONFIG: Record<SpiderRunStatus, { label: string; bg: string; dot: string; text: string }> = {
  completed: { label: 'সম্পন্ন (Completed)', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-800' },
  completed_with_warnings: { label: 'সতর্কতাসহ সম্পন্ন (Warnings)', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500', text: 'text-amber-800' },
  failed: { label: 'ব্যর্থ (Failed)', bg: 'bg-rose-50 border-rose-200', dot: 'bg-rose-500', text: 'text-rose-800' },
  running: { label: 'চলমান (Running)', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500 animate-pulse', text: 'text-blue-800' },
  pending: { label: 'অপেক্ষমাণ (Pending)', bg: 'bg-slate-100 border-slate-200', dot: 'bg-slate-400', text: 'text-slate-700' },
  cancelled: { label: 'বাতিল (Cancelled)', bg: 'bg-slate-100 border-slate-200', dot: 'bg-slate-400', text: 'text-slate-700' }
};

export default function SourceRegistryManagement() {
  const [sources, setSources] = useState<JobSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');

  // Sub-tab Navigation
  const [activeTab, setActiveTab] = useState<'sources' | 'runs'>('sources');

  // Spider Runs & History
  const [spiderRuns, setSpiderRuns] = useState<SpiderRun[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState(false);
  const [retryingRunId, setRetryingRunId] = useState<string | null>(null);
  const [selectedRunDetails, setSelectedRunDetails] = useState<SpiderRun | null>(null);

  // Connectivity Test State
  const [testingSourceId, setTestingSourceId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { reachable: boolean; httpStatus?: number; responseTimeMs?: number; message?: string }>>({});


  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSource, setEditingSource] = useState<JobSource | null>(null);
  const [archivingSource, setArchivingSource] = useState<JobSource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Add / Edit Form Inputs
  const [formName, setFormName] = useState('');

  const [formOrgName, setFormOrgName] = useState('');
  const [formListingUrl, setFormListingUrl] = useState('');
  const [formScanDepth, setFormScanDepth] = useState('1');
  const [formPriority, setFormPriority] = useState<'high' | 'normal' | 'low' | 'medium'>('normal');

  const [formUrl, setFormUrl] = useState('');
  const [formClassification, setFormClassification] = useState<SourceClassification>('official');
  const [formMethod, setFormMethod] = useState<CollectionMethod>('html_scrape');
  const [formScanInterval, setFormScanInterval] = useState('360');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formAdminNotes, setFormAdminNotes] = useState('');
  const [scrapingSourceId, setScrapingSourceId] = useState<string | null>(null);
  const [isScrapingAll, setIsScrapingAll] = useState(false);

  
  const fetchSpiderRuns = async () => {
    setIsLoadingRuns(true);
    try {
      const res = await fetch('/api/admin/sources/runs?limit=50');
      const data = await res.json();
      if (data.success) {
        setSpiderRuns(data.runs || []);
      }
    } catch (err: any) {
      console.error('Failed to load spider runs:', err);
    } finally {
      setIsLoadingRuns(false);
    }
  };

  const handleTestSource = async (src: JobSource) => {
    setTestingSourceId(src.id);
    setSuccessMessage(null);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/sources/${src.id}/test`, {
        method: 'POST'
      });
      const data = await res.json();
      setTestResults(prev => ({
        ...prev,
        [src.id]: {
          reachable: data.reachable ?? false,
          httpStatus: data.httpStatus,
          responseTimeMs: data.responseTimeMs,
          message: data.message || data.error
        }
      }));

      if (data.reachable) {
        setSuccessMessage(`সোর্স "${src.name}" সফলভাবে টেস্ট সম্পন্ন হয়েছে! HTTP ${data.httpStatus} (${data.responseTimeMs}ms)`);
      } else {
        setFetchError(`কানেক্টিভিটি টেস্ট ব্যর্থ হয়েছে (${src.name}): ${data.error || "সার্ভার রেসপন্স দেয়নি"}`);
      }
      fetchSources();
    } catch (err: any) {
      setFetchError(err.message || "কানেক্টিভিটি টেস্টের অনুরোধ ব্যর্থ হয়েছে");
    } finally {
      setTestingSourceId(null);
    }
  };

  const handleRetryRun = async (run: SpiderRun) => {
    setRetryingRunId(run.id);
    setSuccessMessage(null);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/sources/runs/${run.id}/retry`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "স্পাইডার রান রিট্রাই করতে ব্যর্থ");
      }
      setSuccessMessage(`স্পাইডার রান "${run.id}" সফলভাবে পুনরায় সম্পন্ন হয়েছে`);
      await fetchSpiderRuns();
      await fetchSources();
    } catch (err: any) {
      setFetchError(err.message || "স্পাইডার রান রিট্রাই করা সম্ভব হয়নি");
    } finally {
      setRetryingRunId(null);
    }
  };

  const handleScrapeSource = async (src: JobSource) => {
    setScrapingSourceId(src.id);
    setSuccessMessage(null);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/sources/${src.id}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'স্ক্র্যাপিং ব্যর্থ হয়েছে।');
      }
      setSuccessMessage(`"${src.name}" সফলভাবে স্ক্র্যাপ হয়েছে! ${data.report?.newDraftsCreated || 0}টি নতুন সার্কুলার ড্রাফট কিউতে জমা হয়েছে।`);
      fetchSources();
    } catch (err: any) {
      setFetchError(err.message || 'স্ক্র্যাপিংয়ে সমস্যা হয়েছে।');
    } finally {
      setScrapingSourceId(null);
    }
  };

  const handleScrapeAll = async () => {
    setIsScrapingAll(true);
    setSuccessMessage(null);
    setFetchError(null);
    try {
      const res = await fetch('/api/admin/sources/run-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'সকল সোর্স স্ক্র্যাপিং ব্যর্থ হয়েছে।');
      }
      setSuccessMessage(`সকল সক্রিয় সোর্স সফলভাবে স্ক্র্যাপ হয়েছে! মোট ${data.report?.totalNewDrafts || 0}টি নতুন সার্কুলার ড্রাফট কিউতে জমা হয়েছে (ডিসকভার্ড: ${data.report?.totalDiscovered || 0}টি)।`);
      fetchSources();
    } catch (err: any) {
      setFetchError(err.message || 'স্ক্র্যাপিংয়ে সমস্যা হয়েছে।');
    } finally {
      setIsScrapingAll(false);
    }
  };

  const fetchSources = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/admin/sources');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}: সোর্স তালিকা লোড করতে ব্যর্থ হয়েছে।`);
      }
      const data = await res.json();
      setSources(data.sources || []);
    } catch (err: any) {
      setFetchError(err.message || 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি।');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
    fetchSpiderRuns();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormOrgName('');
    setFormListingUrl('');
    setFormScanDepth('1');
    setFormPriority('normal');

    setFormUrl('');
    setFormClassification('official');
    setFormMethod('html_scrape');
    setFormScanInterval('360');
    setFormEnabled(true);
    setFormAdminNotes('');
    setFormError(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (src: JobSource) => {
    resetForm();
    setEditingSource(src);
    setFormName(src.name);
    setFormOrgName(src.organizationName || '');
    setFormListingUrl(src.listingUrl || '');
    setFormScanDepth(String(src.scanDepthPages || 1));
    setFormPriority(src.priority || 'normal');

    setFormUrl(src.sourceUrl);
    setFormClassification(src.classification || 'official');
    setFormMethod(src.collectionMethod || 'html_scrape');
    setFormScanInterval(String(src.scanIntervalMinutes || 360));
    setFormEnabled(src.enabled !== undefined ? src.enabled : true);
    setFormAdminNotes(src.adminNotes || '');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || formName.trim().length < 2) {
      setFormError('সোর্সের নাম কমপক্ষে ২ অক্ষরের হতে হবে।');
      return;
    }

    if (!formUrl.trim() || !/^https?:\/\//i.test(formUrl.trim())) {
      setFormError('সঠিক HTTP বা HTTPS সোর্স URL প্রদান করুন।');
      return;
    }

    const intervalNum = Number(formScanInterval);
    if (isNaN(intervalNum) || intervalNum < 15 || intervalNum > 10080) {
      setFormError('স্ক্যান ব্যবধান ১৫ মিনিট থেকে ১০,০৮০ মিনিটের (৭ দিন) মধ্যে হতে হবে।');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          organizationName: formOrgName.trim() || undefined,
          sourceUrl: formUrl.trim(),
          listingUrl: formListingUrl.trim() || undefined,
          classification: formClassification,
          collectionMethod: formMethod,
          scanIntervalMinutes: intervalNum,
          scanDepthPages: Number(formScanDepth) || 1,
          priority: formPriority,
          enabled: formEnabled,
          adminNotes: formAdminNotes.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'সোর্স সংরক্ষণ করতে ব্যর্থ হয়েছে।');
      }

      setSuccessMessage(`সোর্স "${data.source.name}" সফলভাবে রেজিস্ট্রি করা হয়েছে।`);
      setShowAddModal(false);
      resetForm();
      await fetchSources();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setFormError(err.message || 'অপ্রত্যাশিত ত্রুটি ঘটেছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSource) return;
    setFormError(null);

    if (!formName.trim() || formName.trim().length < 2) {
      setFormError('সোর্সের নাম কমপক্ষে ২ অক্ষরের হতে হবে।');
      return;
    }

    if (!formUrl.trim() || !/^https?:\/\//i.test(formUrl.trim())) {
      setFormError('সঠিক HTTP বা HTTPS সোর্স URL প্রদান করুন।');
      return;
    }

    const intervalNum = Number(formScanInterval);
    if (isNaN(intervalNum) || intervalNum < 15 || intervalNum > 10080) {
      setFormError('স্ক্যান ব্যবধান ১৫ মিনিট থেকে ১০,০৮০ মিনিটের (৭ দিন) মধ্যে হতে হবে।');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/sources/${editingSource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          organizationName: formOrgName.trim() || undefined,
          sourceUrl: formUrl.trim(),
          listingUrl: formListingUrl.trim() || undefined,
          classification: formClassification,
          collectionMethod: formMethod,
          scanIntervalMinutes: intervalNum,
          scanDepthPages: Number(formScanDepth) || 1,
          priority: formPriority,
          enabled: formEnabled,
          adminNotes: formAdminNotes.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'সোর্স আপডেট করতে ব্যর্থ হয়েছে।');
      }

      setSuccessMessage(`সোর্স "${data.source.name}" সেটিংস আপডেট করা হয়েছে।`);
      setEditingSource(null);
      resetForm();
      await fetchSources();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setFormError(err.message || 'অপ্রত্যাশিত ত্রুটি ঘটেছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (src: JobSource) => {
    const targetState = !(src.enabled ?? true);
    try {
      const res = await fetch(`/api/admin/sources/${src.id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: targetState })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
      }

      setSuccessMessage(
        targetState 
          ? `সোর্স "${src.name}" সক্রিয় করা হয়েছে।` 
          : `সোর্স "${src.name}" সাময়িকভাবে স্থগিত করা হয়েছে।`
      );
      await fetchSources();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleArchiveOrDelete = async () => {
    if (!archivingSource) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/sources/${archivingSource.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'সোর্স অপসারণ ব্যর্থ হয়েছে।');
      }

      setSuccessMessage(data.message || `সোর্স "${archivingSource.name}" প্রসেস সম্পন্ন হয়েছে।`);
      setArchivingSource(null);
      await fetchSources();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || 'অপসারণ ব্যর্থ হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Sources
  const filteredSources = useMemo(() => {
    return sources.filter(s => {
      const matchSearch =
        searchTerm === '' ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.sourceUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchClassification =
        classificationFilter === 'all' || (s.classification || 'official') === classificationFilter;

      const currentHealth = s.healthStatus || (s.enabled ? 'healthy' : 'paused');
      const matchHealth = healthFilter === 'all' || currentHealth === healthFilter;

      return matchSearch && matchClassification && matchHealth;
    });
  }, [sources, searchTerm, classificationFilter, healthFilter]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const total = sources.length;
    const active = sources.filter(s => s.enabled ?? true).length;
    const paused = sources.filter(s => (s.enabled ?? true) === false).length;
    const failing = sources.filter(s => s.healthStatus === 'failing' || s.healthStatus === 'degraded').length;
    const collected = sources.reduce((acc, s) => acc + (s.metrics?.collected || 0), 0);
    return { total, active, paused, failing, collected };
  }, [sources]);

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Radio className="w-5 h-5" />
              </span>
              <h2 className="font-black text-base text-slate-900">
                জব সোর্স ও রিক্রুটমেন্ট পোর্টাল রেজিস্ট্রি
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              স্বয়ংক্রিয় চাকরি বিজ্ঞপ্তি সংগ্রহের জন্য অনুমোদিত পোর্টাল, সংবাদপত্র ও সরকারি ওয়েবসাইট পরিচালনা করুন।
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchSources}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Run All Scrapers Button */}
            <button
              type="button"
              onClick={handleScrapeAll}
              disabled={isScrapingAll}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-800/20 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScrapingAll ? 'animate-spin' : ''}`} />
              <span>{isScrapingAll ? 'সকল সোর্স স্ক্র্যাপ হচ্ছে...' : 'সকল সক্রিয় সোর্স স্ক্র্যাপ করুন'}</span>
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন সোর্স যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Global Pipeline Notice Banner */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/90 rounded-xl flex items-start justify-between gap-3 text-xs text-emerald-950">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">স্বয়ংক্রিয় স্ক্র্যাপার ইঞ্জিন সক্রিয়:</span> টেলিটক Alljobs, বাংলাদেশ ব্যাংক ও BPSC পোর্টাল থেকে স্বয়ংক্রিয়ভাবে সার্কুলার সংগ্রহ করা হচ্ছে। নতুন সার্কুলারগুলো ডুপ্লিকেট ফিল্টার হয়ে খসড়া কিউতে (Imported Drafts) জমা হচ্ছে।
            </div>
          </div>
          <span className="shrink-0 px-2.5 py-1 bg-emerald-600 text-white font-bold text-[11px] rounded-lg">
            অটো-স্ক্র্যাপার লাইভ
          </span>
        </div>

        {/* Status KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-500">মোট সোর্স</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{stats.total}</div>
          </div>
          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/60">
            <div className="text-[11px] font-bold text-emerald-800">সক্রিয় (Active)</div>
            <div className="text-xl font-black text-emerald-700 mt-0.5">{stats.active}</div>
          </div>
          <div className="p-3.5 bg-slate-100/80 rounded-xl border border-slate-200/70">
            <div className="text-[11px] font-bold text-slate-600">স্থগিত (Paused)</div>
            <div className="text-xl font-black text-slate-700 mt-0.5">{stats.paused}</div>
          </div>
          <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200/60">
            <div className="text-[11px] font-bold text-rose-800">স্বাস্থ্য সমস্যা</div>
            <div className="text-xl font-black text-rose-700 mt-0.5">{stats.failing}</div>
          </div>
          <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-200/60">
            <div className="text-[11px] font-bold text-purple-800">সংগৃহীত বিজ্ঞপ্তি</div>
            <div className="text-xl font-black text-purple-700 mt-0.5">{stats.collected}</div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Fetch Error Banner */}
      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-bold">{fetchError}</span>
          </div>
          <button
            type="button"
            onClick={fetchSources}
            className="px-3 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold"
          >
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      )}


      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'sources'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>সোর্স রেজিস্ট্রি ও মনিটরিং ({sources.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('runs');
            fetchSpiderRuns();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'runs'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>স্পাইডার মনিটরিং ও রান হিস্ট্রি ({spiderRuns.length})</span>
        </button>
      </div>

      {activeTab === 'sources' && (
        <>
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="সোর্সের নাম, URL বা আইডি দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Classification Filter */}
          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">সকল ধরন (All Types)</option>
            <option value="official">সরকারি / অফিসিয়াল</option>
            <option value="news">সংবাদপত্র</option>
            <option value="job_board">জব বোর্ড</option>
            <option value="custom_api">কাস্টম API</option>
          </select>

          {/* Health Filter */}
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">সকল স্বাস্থ্য স্ট্যাটাস</option>
            <option value="healthy">সুস্থ (Healthy)</option>
            <option value="paused">স্থগিত (Paused)</option>
            <option value="degraded">ক্ষতিগ্রস্ত (Degraded)</option>
            <option value="failing">ব্যর্থ (Failing)</option>
          </select>
        </div>
      </div>

      {/* Sources Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
            <span>সোর্স রেজিস্ট্রি লোড হচ্ছে...</span>
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <div className="p-3 rounded-full bg-slate-100 text-slate-400 inline-block">
              <Radio className="w-6 h-6" />
            </div>
            <div className="font-bold text-slate-700 text-sm">কোনো সোর্স পাওয়া যায়নি</div>
            <p className="text-slate-400 max-w-sm mx-auto">
              {searchTerm || classificationFilter !== 'all' || healthFilter !== 'all'
                ? 'অনুসন্ধান ফিল্টারের সাথে মিলে এমন কোনো সোর্স পাওয়া যায়নি। ফিল্টার রিসেট করে দেখুন।'
                : 'কোনো সোর্স রেজিস্ট্রি করা নেই। "নতুন সোর্স যোগ করুন" বাটনে ক্লিক করুন।'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">সোর্সের নাম ও বিবরণ</th>
                  <th className="py-3 px-4">কালেকশন মেথড</th>
                  <th className="py-3 px-4">স্ক্যান ব্যবধান</th>
                  <th className="py-3 px-4">স্বাস্থ্য স্ট্যাটাস</th>
                  <th className="py-3 px-4">টেলিমეტ্রি মেট্রিক্স</th>
                  <th className="py-3 px-4">সর্বশেষ স্ক্যান</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSources.map((src) => {
                  const classificationInfo = CLASSIFICATION_LABELS[src.classification || 'official'] || CLASSIFICATION_LABELS.official;
                  const methodInfo = METHOD_LABELS[src.collectionMethod || 'html_scrape'] || METHOD_LABELS.html_scrape;
                  const currentHealth = src.healthStatus || (src.enabled ? 'healthy' : 'paused');
                  const healthInfo = HEALTH_CONFIG[currentHealth] || HEALTH_CONFIG.healthy;
                  const isEnabled = src.enabled ?? true;

                  return (
                    <tr key={src.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name, ID, URL */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="pt-0.5">
                            <span className={`inline-block w-2.5 h-2.5 rounded-full ${healthInfo.dot}`} />
                          </div>
                          <div>
                            <div className="font-black text-slate-900 flex items-center gap-1.5">
                              <span>{src.name}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${classificationInfo.color}`}>
                                {classificationInfo.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-slate-400">{src.id}</span>
                              <span className="text-slate-300">•</span>
                              <a
                                href={src.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-[10px] text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5 max-w-xs truncate"
                                title={src.sourceUrl}
                              >
                                <span>{src.sourceUrl}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            </div>
                            {testResults[src.id] && (
                              <div className="mt-1 flex items-center gap-1.5">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${testResults[src.id].reachable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                  {testResults[src.id].reachable ? `HTTP ${testResults[src.id].httpStatus} (${testResults[src.id].responseTimeMs}ms)` : 'কানেকশন ব্যর্থ'}
                                </span>
                              </div>
                            )}
                            {src.adminNotes && (
                              <div className="text-[10px] text-slate-500 italic mt-1 line-clamp-1">
                                {src.adminNotes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Collection Method */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                          <span>{methodInfo.icon}</span>
                          <span>{methodInfo.label}</span>
                        </span>
                      </td>

                      {/* Scan Interval */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {src.scanIntervalMinutes 
                              ? `${Math.round(src.scanIntervalMinutes / 60)} ঘণ্টা (${src.scanIntervalMinutes} মি.)` 
                              : '৬ ঘণ্টা (৩৬০ মি.)'}
                          </span>
                        </div>
                      </td>

                      {/* Health & State */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${healthInfo.bg} ${healthInfo.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${healthInfo.dot}`} />
                          <span>{healthInfo.label}</span>
                        </span>
                      </td>

                      {/* Metrics */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-emerald-700" title="সংগৃহীত">
                            ✓ {src.metrics?.collected ?? 0}
                          </span>
                          <span className="text-slate-400">/</span>
                          <span className="text-slate-600" title="শনাক্তকৃত">
                            🔍 {src.metrics?.discovered ?? 0}
                          </span>
                          {(src.metrics?.failed ?? 0) > 0 && (
                            <span className="text-rose-600 font-bold" title="ব্যর্থ">
                              ✕ {src.metrics?.failed}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Last Scan */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                        {src.lastSuccessfulScanAt ? (
                          new Date(src.lastSuccessfulScanAt).toLocaleString('bn-BD', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })
                        ) : (
                          <span className="text-slate-400 italic">স্ক্যান অপেক্ষমাণ</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                                                    {/* Test Connectivity Button */}
                          <button
                            type="button"
                            onClick={() => handleTestSource(src)}
                            disabled={testingSourceId === src.id}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            title="কানেক্টিভিটি টেস্ট করুন"
                          >
                            <Globe className={`w-3.5 h-3.5 ${testingSourceId === src.id ? 'animate-spin text-blue-600' : ''}`} />
                          </button>

                          {/* Scrape Single Source Button */}
                          <button
                            type="button"
                            onClick={() => handleScrapeSource(src)}
                            disabled={scrapingSourceId === src.id || !isEnabled}
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 shadow-2xs ${
                              scrapingSourceId === src.id
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : isEnabled
                                ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-transparent'
                                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            }`}
                            title="সোর্সটি থেকে এখনই লাইভ সার্কুলার স্ক্র্যাপ করুন"
                          >
                            <RefreshCw className={`w-3 h-3 ${scrapingSourceId === src.id ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">{scrapingSourceId === src.id ? 'স্ক্র্যাপ হচ্ছে...' : 'স্ক্র্যাপ করুন'}</span>
                          </button>

                          {/* Enable/Pause Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggle(src)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isEnabled
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={isEnabled ? 'স্থগিত (Pause) করুন' : 'সক্রিয় (Enable) করুন'}
                          >
                            {isEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit Source */}
                          <button
                            type="button"
                            onClick={() => openEditModal(src)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                            title="সেটিংস এডিট করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Archive / Delete */}
                          <button
                            type="button"
                            onClick={() => setArchivingSource(src)}
                            className="p-1.5 rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors"
                            title="আর্কাইভ বা অপসারণ করুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      {/* TAB 2: SPIDER RUNS & HISTORY */}
      {activeTab === 'runs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">স্পাইডার মনিটরিং ও এক্সিকিউশন রান</h3>
              <p className="text-xs text-slate-500">সরকারি নোটিফিকেশন সোর্স স্ক্র্যাপ, সংগৃহীত PDF ও ডাটা ড্রাফট পর্যবেক্ষণ</p>
            </div>
            <button
              type="button"
              onClick={fetchSpiderRuns}
              disabled={isLoadingRuns}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRuns ? 'animate-spin text-emerald-600' : ''}`} />
              <span>রান হিস্ট্রি</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {isLoadingRuns ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-medium">স্পাইডার এক্সিকিউট করা হচ্ছে...</span>
              </div>
            ) : spiderRuns.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800 text-sm">কোনো স্পাইডার রান রেকর্ড নেই</h3>
                <p className="text-xs text-slate-400 mt-1">
                  উপরে "সকল সোর্সে স্পাইডার রান চালান" বাটনে ক্লিক করে প্রথম রান শুরু করুন
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/90 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">রান ID ও সময়</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                      <th className="py-3 px-4">সোর্সসমূহ</th>
                      <th className="py-3 px-4">ফলাফল / সারসংক্ষেপ</th>
                      <th className="py-3 px-4">PDF ও ড্রাফটস</th>
                      <th className="py-3 px-4">লগ ও বিবরণ</th>
                      <th className="py-3 px-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {spiderRuns.map((run) => {
                      const statusConfig = RUN_STATUS_CONFIG[run.status] || RUN_STATUS_CONFIG.completed;
                      const isRetrying = retryingRunId === run.id;

                      return (
                        <tr key={run.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div>
                              <div className="font-bold text-slate-900">{run.sourceName}</div>
                              <div className="font-mono text-[10px] text-slate-400">{run.id}</div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[10px] uppercase font-bold">
                              {run.triggerType}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                              <span>{statusConfig.label}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                              <span className="text-emerald-700 font-bold">+{run.newDraftsCreated} নতুন ড্রাফট</span>
                              <span className="text-slate-300">/</span>
                              <span className="text-slate-500">{run.jobsDiscovered} টি</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[10px] text-slate-600">
                            <div>PDF: {run.pdfsDownloaded} টি</div>
                            <div>ডুপ্লিকেট: {run.duplicatesDetected} টি</div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                            <div>
                              {new Date(run.startedAt).toLocaleTimeString('bn-BD', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {(run.durationMs / 1000).toFixed(1)} সে.
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedRunDetails(run)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                              >
                                <Info className="w-3 h-3" />
                                <span>বিস্তারিত</span>
                              </button>

                              {(run.status === 'failed' || run.status === 'completed_with_warnings') && (
                                <button
                                  type="button"
                                  onClick={() => handleRetryRun(run)}
                                  disabled={isRetrying}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 disabled:opacity-50"
                                >
                                  <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                                  <span>রিট্রাই</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD SOURCE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Plus className="w-4 h-4" />
                </span>
                <h3 className="font-black text-sm text-slate-900">নতুন জব সোর্স রেজিস্ট্রি করুন</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সোর্সের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="যেমন: Bangladesh Bank E-Recruitment"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সোর্স URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://erecruitment.bb.org.bd"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সার্কুলার প্রকাশের অফিসিয়াল পোর্টাল (ওয়েবপেজ)
                </label>
                <input
                  type="url"
                  value={formListingUrl}
                  onChange={(e) => setFormListingUrl(e.target.value)}
                  placeholder="যেমন: https://alljobs.teletalk.com.bd/jobs/all"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অর্গানাইজেশনের নাম</label>
                  <input
                    type="text"
                    value={formOrgName}
                    onChange={(e) => setFormOrgName(e.target.value)}
                    placeholder="যেমন: বিপিএসসি / বাংলাদেশ ব্যাংক"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অগ্রাধিকার</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="high">উচ্চ (High)</option>
                    <option value="normal">সাধারণ (Normal)</option>
                    <option value="low">নিম্ন (Low)</option>
                  </select>
                </div>
              </div>


              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ক্লাসিফিকেশন</label>
                  <select
                    value={formClassification}
                    onChange={(e) => setFormClassification(e.target.value as SourceClassification)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="official">সরকারি / অফিসিয়াল</option>
                    <option value="news">জাতীয় সংবাদপত্র</option>
                    <option value="job_board">জব বোর্ড</option>
                    <option value="custom_api">কাস্টম API</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">কালেকশন মেথড</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as CollectionMethod)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="html_scrape">HTML স্ক্র্যাপিং</option>
                    <option value="json_api">JSON API</option>
                    <option value="rss_feed">RSS / XML ফিড</option>
                    <option value="gemini_ocr_pdf">Gemini OCR (PDF)</option>
                    <option value="manual_entry">ম্যানুয়াল এন্ট্রি</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">স্ক্যান ব্যবধান</label>
                  <select
                    value={formScanInterval}
                    onChange={(e) => setFormScanInterval(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="30">৩০ মিনিট</option>
                    <option value="60">১ ঘণ্টা (৬০ মি.)</option>
                    <option value="180">৩ ঘণ্টা (১৮০ মি.)</option>
                    <option value="360">৬ ঘণ্টা (৩৬০ মি.)</option>
                    <option value="720">১২ ঘণ্টা (৭২০ মি.)</option>
                    <option value="1440">২৪ ঘণ্টা (১৪৪০ মি.)</option>
                  </select>
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formEnabled}
                      onChange={(e) => setFormEnabled(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>সরাসরি সক্রিয় রাখুন (Enabled)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">অ্যাডমিন নোট (ঐচ্ছিক)</label>
                <textarea
                  rows={2}
                  value={formAdminNotes}
                  onChange={(e) => setFormAdminNotes(e.target.value)}
                  placeholder="সোর্স সম্পর্কিত কোনো অভ্যন্তরীণ নির্দেশনা বা নোট..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>রেজিস্ট্রি নিশ্চিত করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SOURCE MODAL */}
      {editingSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <Edit3 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-black text-sm text-slate-900">সোর্স সেটিংস সম্পাদনা</h3>
                  <div className="text-[10px] font-mono text-slate-400">{editingSource.id}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSource(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সোর্সের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সোর্স URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ক্লাসিফিকেশন</label>
                  <select
                    value={formClassification}
                    onChange={(e) => setFormClassification(e.target.value as SourceClassification)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="official">সরকারি / অফিসিয়াল</option>
                    <option value="news">জাতীয় সংবাদপত্র</option>
                    <option value="job_board">জব বোর্ড</option>
                    <option value="custom_api">কাস্টম API</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">কালেকশন মেথড</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as CollectionMethod)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="html_scrape">HTML স্ক্র্যাপিং</option>
                    <option value="json_api">JSON API</option>
                    <option value="rss_feed">RSS / XML ফিড</option>
                    <option value="gemini_ocr_pdf">Gemini OCR (PDF)</option>
                    <option value="manual_entry">ম্যানুয়াল এন্ট্রি</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">স্ক্যান ব্যবধান</label>
                  <select
                    value={formScanInterval}
                    onChange={(e) => setFormScanInterval(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="30">৩০ মিনিট</option>
                    <option value="60">১ ঘণ্টা (৬০ মি.)</option>
                    <option value="180">৩ ঘণ্টা (১৮০ মি.)</option>
                    <option value="360">৬ ঘণ্টা (৩৬০ মি.)</option>
                    <option value="720">১২ ঘণ্টা (৭২০ মি.)</option>
                    <option value="1440">২৪ ঘণ্টা (১৪৪০ মি.)</option>
                  </select>
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formEnabled}
                      onChange={(e) => setFormEnabled(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>সক্রিয় স্ট্যাটাস (Enabled)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">অ্যাডমিন নোট</label>
                <textarea
                  rows={2}
                  value={formAdminNotes}
                  onChange={(e) => setFormAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSource(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>পরিবর্তন সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARCHIVE / DELETE CONFIRMATION MODAL */}
      {archivingSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-black text-sm text-slate-900">সোর্স অপসারণ ও ডেটা ইন্টিগ্রিটি গার্ড</h3>
                <div className="text-[11px] text-slate-500 font-bold">{archivingSource.name}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              সিস্টেমের রেফারেন্স ইন্টিগ্রিটি নিশ্চিত করতে, কোনো সোর্সের অধীনে যদি ইতিমধ্যে নিয়োগ বিজ্ঞপ্তি বা খসড়া ড্রাফট সংরক্ষিত থাকে, তবে সেটি স্থায়ীভাবে ডিলিট না হয়ে স্বয়ংক্রিয়ভাবে <strong className="text-slate-900">স্থগিত (Paused) ও আর্কাইভ</strong> হবে। এর ফলে পূর্বের কোনো সার্কুলার নষ্ট হবে না।
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 font-mono">
              ID: {archivingSource.id}<br />
              URL: {archivingSource.sourceUrl}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setArchivingSource(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleArchiveOrDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>আর্কাইভ ও অপসারণ নিশ্চিত করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RUN DETAILS MODAL */}
      {selectedRunDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-sm">স্পাইডার রান লগ বিবরণ</h3>
                <p className="font-mono text-[10px] text-slate-500">{selectedRunDetails.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRunDetails(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">তারিখ:</span>
                  <span className="font-bold text-slate-800">{selectedRunDetails.sourceName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">স্ট্যাটাস:</span>
                  <span className="font-bold text-slate-800">{selectedRunDetails.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">সময়:</span>
                  <span className="text-slate-700 font-mono text-[11px]">{new Date(selectedRunDetails.startedAt).toLocaleString('bn-BD')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">স্ট্যাটাস:</span>
                  <span className="text-slate-700 font-mono text-[11px]">{(selectedRunDetails.durationMs / 1000).toFixed(2)}s</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-slate-700">ফলাফল সামারি:</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="text-base font-black text-emerald-700">+{selectedRunDetails.newDraftsCreated}</div>
                    <div className="text-[10px] text-emerald-800">নতুন সার্কুলার</div>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-base font-black text-blue-700">{selectedRunDetails.jobsDiscovered}</div>
                    <div className="text-[10px] text-blue-800">ডুপ্লিকেট</div>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="text-base font-black text-purple-700">{selectedRunDetails.pdfsDownloaded}</div>
                    <div className="text-[10px] text-purple-800">PDF ডাউনলোড</div>
                  </div>
                </div>
              </div>

              {selectedRunDetails.errorSummary && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
                  <span className="font-bold block text-[11px]">সার্ভার রেসপন্স:</span>
                  <p className="font-mono text-[10px] break-words">{selectedRunDetails.errorSummary}</p>
                </div>
              )}

              {selectedRunDetails.failedRecords && selectedRunDetails.failedRecords.length > 0 && (
                <div className="space-y-1">
                  <span className="font-bold text-rose-700 block text-[11px]">ব্যর্থ রেকর্ডসমূহ ({selectedRunDetails.failedRecords.length}):</span>
                  <div className="max-h-40 overflow-y-auto space-y-1 font-mono text-[10px] bg-slate-900 text-rose-300 p-2 rounded-xl">
                    {selectedRunDetails.failedRecords.map((rec, i) => (
                      <div key={i} className="border-b border-slate-800 pb-1">
                        <div>[{rec.lastAttemptAt}] {rec.reason}</div>
                        <div className="text-slate-400">{rec.url}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                type="button"
                onClick={() => setSelectedRunDetails(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-colors"
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
