'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Layout,
  Phone,
  Mail,
  MapPin,
  Megaphone, 
  Search, 
  History, 
  Globe, 
  ExternalLink, 
  Edit3, 
  CheckCircle2, 
  Eye, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Share2, 
  Code2, 
  Smartphone, 
  Monitor,
  RotateCcw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  List,
  ChevronDown
} from 'lucide-react';

interface WebsiteCmsSeoManagementProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

interface CmsPage {
  id: string;
  title: string;
  path: string;
  sectionsCount: number;
  status: 'published' | 'draft';
  lastModified: string;
  views: number;
}

const INITIAL_PAGES: CmsPage[] = [
  {
    id: 'page_home',
    title: 'হোমপেইজ (ল্যান্ডিং পোর্টাল)',
    path: '/',
    sectionsCount: 7,
    status: 'published',
    lastModified: 'আজ, ১০:১৫ পূর্বাহ্ন',
    views: 48920
  },
  {
    id: 'page_jobs',
    title: 'সার্কুলার ডিরেক্টরি ও অনুসন্ধান',
    path: '/jobs',
    sectionsCount: 4,
    status: 'published',
    lastModified: 'আজ, ০৯:০০ পূর্বাহ্ন',
    views: 89450
  },
  {
    id: 'page_apply',
    title: 'অনলাইন আবেদন ও সহায়তা ফর্ম',
    path: '/apply',
    sectionsCount: 3,
    status: 'published',
    lastModified: 'গতকাল',
    views: 31200
  },
  {
    id: 'page_dashboard',
    title: 'চাকরিপ্রার্থী স্মার্ট ড্যাশবোর্ড',
    path: '/dashboard',
    sectionsCount: 5,
    status: 'published',
    lastModified: 'গতকাল',
    views: 19800
  },
  {
    id: 'page_profile',
    title: 'স্মার্ট ক্যান্ডিডেট প্রোফাইল ভল্ট',
    path: '/dashboard/profile',
    sectionsCount: 4,
    status: 'published',
    lastModified: 'গতকাল',
    views: 14500
  },
  {
    id: 'page_terms',
    title: 'ব্যবহারের শর্তাবলী (Terms of Service)',
    path: '/terms',
    sectionsCount: 2,
    status: 'published',
    lastModified: '১৫ অক্টোবর ২০২৬',
    views: 2400
  },
  {
    id: 'page_privacy',
    title: 'গোপনীয়তা নীতিমালা (Privacy Policy)',
    path: '/privacy',
    sectionsCount: 2,
    status: 'published',
    lastModified: '১৫ অক্টোবর ২০২৬',
    views: 1850
  },
  {
    id: 'page_contact',
    title: 'যোগাযোগ ও সহায়তা কেন্দ্র',
    path: '/contact',
    sectionsCount: 2,
    status: 'published',
    lastModified: '২০ অক্টোবর ২০২৬',
    views: 3600
  }
];

interface RevisionItem {
  id: string;
  version: string;
  author: string;
  timestamp: string;
  scope: string;
  notes: string;
  canRollback: boolean;
}

const INITIAL_REVISIONS: RevisionItem[] = [
  {
    id: 'REV-2061',
    version: 'v2.6.1 (বর্তমান)',
    author: 'আব্দুর রহমান লিওন (সুপার অ্যাডমিন)',
    timestamp: 'আজ, ১০:১৫ পূর্বাহ্ন',
    scope: 'গ্লোবাল এসইও ও মেটাডাটা ইঞ্জিন',
    notes: 'Google Rich Snippet JobPosting Schema এবং ক্যান্ডিডেট প্রোফাইল হাইড্রেশন সিঙ্ক হালনাগাদ।',
    canRollback: false
  },
  {
    id: 'REV-2060',
    version: 'v2.6.0',
    author: 'আব্দুর রহমান লিওন (সুপার অ্যাডমিন)',
    timestamp: 'গতকাল, ১১:৪৫ অপরাহ্ন',
    scope: 'সার্কুলার টেবিল ও সাব-পজিশন ফর্ম',
    notes: 'মাল্টিপল পদ ও মোট শূন্যপদ অটোমেটিক ক্যালকুলেশন এবং এডিট মডাল ফিচার সংযোজন।',
    canRollback: true
  },
  {
    id: 'REV-2059',
    version: 'v2.5.9',
    author: 'সিস্টেম অটোমেটর',
    timestamp: '২৮ অক্টোবর ২০২৬',
    scope: 'স্ক্র্যাপার পাইপলাইন ও ড্রাফট কিউ',
    notes: 'টেলিটক অলজবস, বিপিএসসি ও বাংলাদেশ ব্যাংক স্ক্র্যাপার ইঞ্জিনের রেট লিমিটার অপটিমাইজেশন।',
    canRollback: true
  },
  {
    id: 'REV-2058',
    version: 'v2.5.8',
    author: 'তানভীর আহমেদ (টেলিটক অপারেটর)',
    timestamp: '২৬ অক্টোবর ২০২৬',
    scope: 'হোমপেজ ব্যানার ও রিসিট মেকার',
    notes: 'নতুন সহায়তা আবেদন প্রসেসিং ব্যানার এবং সার্ভিস চার্জ ক্ল্যারিফিকেশন আপডেট।',
    canRollback: true
  }
];


const DEFAULT_HEADER_ITEMS = [
  { id: 'home', label: 'হোম', href: '/' },
  { id: 'all-jobs', label: 'সকল চাকরি', href: '/jobs', badge: 'হট' },
  { id: 'govt-jobs', label: 'সরকারি চাকরি', href: '/government-jobs' },
  { id: 'bank-jobs', label: 'ব্যাংক ও আর্থিক', href: '/bank-jobs' },
  { id: 'private-jobs', label: 'বেসরকারি চাকরি', href: '/private-jobs' },
  { id: 'categories', label: 'চাকরির ক্যাটাগরি', href: '/job-categories' },
  { id: 'organizations', label: 'নিয়োগকারী প্রতিষ্ঠান', href: '/organizations' },
  { id: 'guides', label: 'ক্যারিয়ার গাইড', href: '/career-guides' },
  { id: 'about', label: 'আমাদের সম্পর্কে', href: '/about-us' }
];

const DEFAULT_FOOTER_COLS = [
  {
    id: 'col-jobs',
    title: 'চাকরি ও পরীক্ষা',
    links: [
      { label: 'চলমান সকল চাকরি', url: '/jobs' },
      { label: 'সরকারি চাকরির বিজ্ঞপ্তি', url: '/government-jobs' },
      { label: 'বেসরকারি ও কোম্পানি জবস', url: '/private-jobs' },
      { label: 'ব্যাংক ও ফাইন্যান্স চাকরি', url: '/bank-jobs' },
      { label: 'আবেদনের শেষ সময় কাছাকাছি', url: '/deadline-approaching' },
      { label: 'পরীক্ষার নোটিশ ও সময়সূচি', url: '/exam-notices' },
      { label: 'প্রবেশপত্র / অ্যাডমিট কার্ড', url: '/admit-cards' },
      { label: 'বিগত বছরের প্রশ্ন ও সমাধান', url: '/previous-year-questions' },
      { label: 'অনলাইন মডেল টেস্ট', url: '/model-tests' }
    ]
  },
  {
    id: 'col-guides',
    title: 'ক্যারিয়ার গাইড ও সার্ভিস',
    links: [
      { label: 'সকল চাকরির ক্যাটাগরি', url: '/job-categories' },
      { label: 'সকল নিয়োগকারী প্রতিষ্ঠান', url: '/organizations' },
      { label: 'ক্যারিয়ার গাইড হাব', url: '/career-guides' },
      { label: 'সিভি লেখার সঠিক নিয়ম', url: '/career-guides/cv-writing' },
      { label: 'অনলাইনে চাকরির আবেদন গাইড', url: '/career-guides/online-job-application' },
      { label: 'ইন্টারভিউ ও ভাইভা প্রস্তুতি', url: '/career-guides/interview-preparation' },
      { label: 'সব ব্লগ ও ক্যারিয়ার আর্টিকেল', url: '/blog' },
      { label: 'ফ্রি জব এলার্ট নোটিফিকেশন', url: '/job-alerts' }
    ]
  },
  {
    id: 'col-policies',
    title: 'নীতিমালা ও সহায়তা',
    links: [
      { label: 'আমাদের সম্পর্কে (About Us)', url: '/about-us' },
      { label: 'যোগাযোগ করুন (Contact)', url: '/contact-us' },
      { label: 'সাধারণ জিজ্ঞাসা (FAQ)', url: '/faq' },
      { label: 'সম্পাদকীয় নীতিমালা', url: '/editorial-policy' },
      { label: 'চাকরি যাচাই নীতিমালা', url: '/job-verification-policy' },
      { label: 'ভুল তথ্য সংশোধন নীতিমালা', url: '/corrections-policy' },
      { label: 'ভুল বিজ্ঞপ্তি রিপোর্ট করুন', url: '/report-a-job' }
    ]
  }
];

export default function WebsiteCmsSeoManagement({
  activeTab = 'pages-sections',
  onTabChange
}: WebsiteCmsSeoManagementProps) {
  // Navigation tabs
  const [currentSubTab, setCurrentSubTab] = useState<'pages-sections' | 'seo-meta' | 'header-footer' | 'revisions'>(
    activeTab === 'header-footer' ? 'header-footer' :
    activeTab === 'seo-meta' ? 'seo-meta' :
    activeTab === 'revisions' ? 'revisions' : 'pages-sections'
  );

  React.useEffect(() => {
    if (activeTab === 'pages-sections' || activeTab === 'seo-meta' || activeTab === 'header-footer' || activeTab === 'revisions') {
      setCurrentSubTab(activeTab as any);
    }
  }, [activeTab]);

  const handleSubTabSwitch = (tab: 'pages-sections' | 'seo-meta' | 'header-footer' | 'revisions') => {
    setCurrentSubTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // 1. Pages State
  const [pages, setPages] = useState<CmsPage[]>(INITIAL_PAGES);
  const [pageSearch, setPageSearch] = useState('');

  // 2. SEO Meta State
  const [siteTitle, setSiteTitle] = useState('চাকরি সেবা | সরকারি ও ব্যাংক চাকরির সার্কুলার ও অনলাইন আবেদন');
  const [siteDescription, setSiteDescription] = useState('বাংলাদেশ সরকারি, ব্যাংক ও স্বায়ত্তশাসিত প্রতিষ্ঠানের সকল চাকরির সার্কুলার, নির্ভুল টেলিটক অনলাইন আবেদন এবং পরীক্ষার প্রবেশপত্র ট্র্যাকিং সেবা।');
  const [keywords, setKeywords] = useState('চাকরির খবর, সরকারি চাকরি সার্কুলার ২০২৬, বিসিএস, ব্যাংক জব, টেলিটক আবেদন, chakri sheba bd');
  const [ogImageUrl, setOgImageUrl] = useState('https://chakrisheba.com/og-image.jpg');
  const [gscVerification, setGscVerification] = useState('google-site-verification=cs_live_bd_2026_verify_meta');
  const [ga4Id, setGa4Id] = useState('G-CSBD2026LIVE');
  const [enableJsonLd, setEnableJsonLd] = useState(true);
  const [seoSavedToast, setSeoSavedToast] = useState<string | null>(null);

  // 3. Header & Footer Settings State
  const [announcementText, setAnnouncementText] = useState('আজকে ৩টি নতুন সরকারি চাকরির আবেদন শুরু হয়েছে! শেষ সময় হওয়ার আগেই আবেদন বুকিং দিন।');
  const [announcementUrl, setAnnouncementUrl] = useState('/jobs');
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [supportPhone, setSupportPhone] = useState('+৮৮০ ১৭৭৪-৩৬৬৬৪৩');
  const [supportEmail, setSupportEmail] = useState('support@chakrisheba.com');
  const [whatsappNumber, setWhatsappNumber] = useState('8801774366643');
  const [officeAddress, setOfficeAddress] = useState('ধানমন্ডি ৩২, ঢাকা-১২০৯, বাংলাদেশ');
  const [footerAboutText, setFooterAboutText] = useState('বাংলাদেশের চাকরিপ্রার্থীদের বিশ্বস্ত ডিজিটাল প্ল্যাটফর্ম। ঘরে বসেই সকল সরকারি, ব্যাংক ও শীর্ষ বেসরকারি চাকরির শতভাগ যাচাইকৃত বিজ্ঞপ্তি ও সঠিক নিয়মে অনলাইন আবেদন সহায়তা।');
  const [facebookUrl, setFacebookUrl] = useState('https://facebook.com/chakrisheba.bd');
  const [telegramUrl, setTelegramUrl] = useState('https://t.me/chakrisheba');
  const [youtubeUrl, setYoutubeUrl] = useState('https://youtube.com/@chakrisheba');
  const [isSaving, setIsSaving] = useState(false);
  const [headerMenuItems, setHeaderMenuItems] = useState<any[]>(DEFAULT_HEADER_ITEMS);
  const [footerColumns, setFooterColumns] = useState<any[]>(DEFAULT_FOOTER_COLS);

  // 4. Revisions State
  const [revisions, setRevisions] = useState<RevisionItem[]>(INITIAL_REVISIONS);
  const [rollbackSuccess, setRollbackSuccess] = useState<string | null>(null);

  // Load server settings on mount
  useEffect(() => {
    fetch('/api/admin/settings', {
      headers: { }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          const s = data.settings;
          if (s.general) {
            if (s.general.siteDescription) setSiteDescription(s.general.siteDescription);
            if (s.general.supportPhone) setSupportPhone(s.general.supportPhone);
            if (s.general.supportEmail) setSupportEmail(s.general.supportEmail);
            if (s.general.whatsappNumber) setWhatsappNumber(s.general.whatsappNumber);
            if (s.general.officeAddress) setOfficeAddress(s.general.officeAddress);
            if (s.general.announcementText) setAnnouncementText(s.general.announcementText);
            if (s.general.announcementUrl) setAnnouncementUrl(s.general.announcementUrl);
            if (s.general.announcementEnabled !== undefined) setAnnouncementEnabled(s.general.announcementEnabled);
            if (s.general.footerAboutText) setFooterAboutText(s.general.footerAboutText);
            if (s.general.facebookUrl) setFacebookUrl(s.general.facebookUrl);
            if (s.general.telegramUrl) setTelegramUrl(s.general.telegramUrl);
            if (s.general.youtubeUrl) setYoutubeUrl(s.general.youtubeUrl);
            if (s.general.headerMenuItems && Array.isArray(s.general.headerMenuItems) && s.general.headerMenuItems.length > 0) {
              setHeaderMenuItems(s.general.headerMenuItems);
            }
            if (s.general.footerColumns && Array.isArray(s.general.footerColumns) && s.general.footerColumns.length > 0) {
              setFooterColumns(s.general.footerColumns);
            }
          }
          if (s.seo) {
            if (s.seo.defaultTitle) setSiteTitle(s.seo.defaultTitle);
            if (s.seo.defaultDescription) setSiteDescription(s.seo.defaultDescription);
            if (Array.isArray(s.seo.defaultKeywords)) setKeywords(s.seo.defaultKeywords.join(', '));
            if (s.seo.defaultOgImage) setOgImageUrl(s.seo.defaultOgImage);
            if (s.seo.googleSiteVerification) setGscVerification(s.seo.googleSiteVerification);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveAllSettings = async () => {
    setIsSaving(true);
    setSeoSavedToast(null);

    try {
      const payload = {
        general: {
          siteName: 'চাকরি সেবা (Chakri Sheba)',
          siteDescription,
          supportPhone,
          supportEmail,
          officeAddress,
          whatsappNumber,
          announcementText,
          announcementUrl,
          announcementEnabled,
          headerMenuItems,
          footerColumns,
          footerAboutText,
          facebookUrl,
          telegramUrl,
          youtubeUrl
        },
        seo: {
          defaultTitle: siteTitle,
          defaultDescription: siteDescription,
          defaultKeywords: keywords.split(',').map(s => s.trim()).filter(Boolean),
          defaultOgImage: ogImageUrl,
          googleSiteVerification: gscVerification
        }
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSeoSavedToast('প্ল্যাটফর্মের হেডার, ফুটার এবং গ্লোবাল এসইও সফলভাবে সংরক্ষিত হয়েছে!');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cs_settings_changed'));
        }
        setTimeout(() => setSeoSavedToast(null), 4000);
      } else {
        alert(data.error || 'সেটিংস সংরক্ষণে ব্যর্থ হয়েছে');
      }
    } catch (e: any) {
      alert('নেটওয়ার্ক ত্রুটি: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSeo = () => {
    handleSaveAllSettings();
  };

  const handleRollback = (rev: RevisionItem) => {
    if (confirm(`আপনি কি নিশ্চিত যে সংস্করণ ${rev.version} এ রোলব্যাক করতে চান?`)) {
      setRollbackSuccess(`সফলভাবে সংস্করণ ${rev.version} এ ফিরিয়ে নেওয়া হয়েছে!`);
      setTimeout(() => setRollbackSuccess(null), 4000);
    }
  };

  const filteredPages = pages.filter(p => 
    p.title.toLowerCase().includes(pageSearch.toLowerCase()) || 
    p.path.toLowerCase().includes(pageSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Module Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Globe className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-black text-slate-900">ওয়েবসাইট ম্যানেজমেন্ট ও গ্লোবাল এসইও</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              সার্চ অপটিমাইজড
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            পেইজ স্ট্রাকচার, গুগল সার্চ কনসোল ও সোশ্যাল মেটাডাটা এবং সংস্করণ হিস্ট্রি কন্ট্রোল
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleSubTabSwitch('pages-sections')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentSubTab === 'pages-sections' 
                ? 'bg-white text-emerald-800 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>পেইজ ও সেকশন</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubTabSwitch('header-footer')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentSubTab === 'header-footer' 
                ? 'bg-white text-emerald-800 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>হেডার ও ফুটার ডিজাইন</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubTabSwitch('seo-meta')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentSubTab === 'seo-meta' 
                ? 'bg-white text-emerald-800 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>এসইও মেটাডাটা</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubTabSwitch('revisions')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentSubTab === 'revisions' 
                ? 'bg-white text-emerald-800 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>রিভিশন ও হিস্ট্রি</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: PAGES & SECTIONS DIRECTORY */}
      {currentSubTab === 'pages-sections' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-slate-900">ওয়েবসাইট পেইজ ডিরেক্টরি</h3>
                <p className="text-xs text-slate-500">সকল সক্রিয় রুট এবং সেকশনের অবস্থা</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pageSearch}
                  onChange={(e) => setPageSearch(e.target.value)}
                  placeholder="পেইজ খুঁজুন..."
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-52"
                />

                <button
                  type="button"
                  onClick={() => onTabChange && onTabChange('builder')}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>ভিজ্যুয়াল বিল্ডার ওপেন করুন</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">পেইজের শিরোনাম</th>
                    <th className="py-2.5 px-3 font-mono">রুট পাথ</th>
                    <th className="py-2.5 px-3">সেকশন সংখ্যা</th>
                    <th className="py-2.5 px-3">পাবলিশ স্ট্যাটাস</th>
                    <th className="py-2.5 px-3">ভিজিটর ভিউ</th>
                    <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredPages.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{p.title}</div>
                        <div className="text-[10px] text-slate-400">আপডেট: {p.lastModified}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{p.path}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {p.sectionsCount}টি সেকশন
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3" /> লাইভ
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                        {p.views.toLocaleString('bn-BD')}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={p.path}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="পাবলিক পেজ দেখুন"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => onTabChange && onTabChange('builder')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> বিল্ডারে এডিট
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: HEADER & FOOTER DESIGN & ANNOUNCEMENTS */}
      {currentSubTab === 'header-footer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Form: Header & Footer Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Card 1: Top Announcement Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-black text-sm text-slate-900">হেডার জরুরি নোটিশ ব্যানার</h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <span>ব্যানার চালু:</span>
                    <input
                      type="checkbox"
                      checked={announcementEnabled}
                      onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ব্যানার টেক্সট</label>
                  <textarea
                    rows={2}
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="জরুরি নোটিশ টেক্সট লিখুন..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ক্লিক করার লিংক / গন্তব্য ইউআরএল</label>
                  <input
                    type="text"
                    value={announcementUrl}
                    onChange={(e) => setAnnouncementUrl(e.target.value)}
                    placeholder="/jobs অথবা https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Card 2: Contact, Helpline & Office */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-black text-sm text-slate-900">লাইভ হেল্পলাইন ও অফিসিয়াল যোগাযোগ তথ্য</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">সাপোর্ট ফোন নম্বর (হেডার ও ফুটার)</label>
                    <input
                      type="text"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      placeholder="+৮৮০ ১৭৭৪-৩৬৬৬৪৩"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">হোয়াটসঅ্যাপ নম্বর (আন্তর্জাতিক ফরম্যাট)</label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="8801774366643"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">অফিসিয়াল ইমেইল</label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="support@chakrisheba.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">অফিস ঠিকানা</label>
                    <input
                      type="text"
                      value={officeAddress}
                      onChange={(e) => setOfficeAddress(e.target.value)}
                      placeholder="ধানমন্ডি ৩২, ঢাকা-১২০৯, বাংলাদেশ"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Footer About & Social Links */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Layout className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-black text-sm text-slate-900">ফুটার বিবরণ ও সোশ্যাল মিডিয়া লিংক</h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ফুটার পরিচিতি বক্তব্য (About Us)</label>
                  <textarea
                    rows={3}
                    value={footerAboutText}
                    onChange={(e) => setFooterAboutText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ফেসবুক পেজ লিংক</label>
                    <input
                      type="text"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">টেলিগ্রাম চ্যানেল লিংক</label>
                    <input
                      type="text"
                      value={telegramUrl}
                      onChange={(e) => setTelegramUrl(e.target.value)}
                      placeholder="https://t.me/..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ইউটিউব চ্যানেল লিংক</label>
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveAllSettings}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>হেডার ও ফুটার ডিজাইন পরিবর্তন সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>

              {/* Card 4: Header Navigation Menu Builder */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <List className="w-4 h-4 text-emerald-700" />
                    <div>
                      <h3 className="font-black text-sm text-slate-900">হেডার প্রধান নেভিগেশন মেনু বিল্ডার</h3>
                      <p className="text-[11px] text-slate-500">মূল ওয়েবসাইটের টপ নেভিগেশন বার লিংক ও ড্রপডাউন পরিচালনা করুন</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHeaderMenuItems(DEFAULT_HEADER_ITEMS)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 bg-slate-100 rounded-lg"
                    >
                      ডিফল্ট রিস্টোর
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newItem = { id: 'nav-' + Date.now(), label: 'নতুন লিংক', href: '/jobs' };
                        setHeaderMenuItems(prev => [...prev, newItem]);
                      }}
                      className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ মেনু লিংক যোগ</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {headerMenuItems.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 font-mono">#{idx + 1} মেনু আইটেম</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => {
                              const arr = [...headerMenuItems];
                              const temp = arr[idx];
                              arr[idx] = arr[idx - 1];
                              arr[idx - 1] = temp;
                              setHeaderMenuItems(arr);
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20"
                            title="উপরে নিন"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === headerMenuItems.length - 1}
                            onClick={() => {
                              const arr = [...headerMenuItems];
                              const temp = arr[idx];
                              arr[idx] = arr[idx + 1];
                              arr[idx + 1] = temp;
                              setHeaderMenuItems(arr);
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20"
                            title="নিচে নিন"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setHeaderMenuItems(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="p-1 text-red-500 hover:text-red-700"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-4">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">মেনু লেবেল (টেক্সট)</label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => {
                              const arr = [...headerMenuItems];
                              arr[idx] = { ...arr[idx], label: e.target.value };
                              setHeaderMenuItems(arr);
                            }}
                            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                          />
                        </div>
                        <div className="sm:col-span-5">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">লিংক ইউআরএল (URL)</label>
                          <input
                            type="text"
                            value={item.href}
                            onChange={(e) => {
                              const arr = [...headerMenuItems];
                              arr[idx] = { ...arr[idx], href: e.target.value };
                              setHeaderMenuItems(arr);
                            }}
                            placeholder="/jobs অথবা /p/custom"
                            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">টপ ব্যাজ (ঐচ্ছিক)</label>
                          <input
                            type="text"
                            value={item.badge || ''}
                            onChange={(e) => {
                              const arr = [...headerMenuItems];
                              arr[idx] = { ...arr[idx], badge: e.target.value };
                              setHeaderMenuItems(arr);
                            }}
                            placeholder="উদা: হট / নতুন"
                            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-800"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 5: Footer Link Columns Builder */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-emerald-700" />
                    <div>
                      <h3 className="font-black text-sm text-slate-900">ফুটার লিংক কলাম বিল্ডার</h3>
                      <p className="text-[11px] text-slate-500">ফুটারের কলাম শিরোনাম এবং প্রতিটি কলামের লিংকসমূহ সম্পাদন করুন</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFooterColumns(DEFAULT_FOOTER_COLS)}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 bg-slate-100 rounded-lg"
                  >
                    ডিফল্ট কলাম রিস্টোর
                  </button>
                </div>

                <div className="space-y-4">
                  {footerColumns.map((col, cIdx) => (
                    <div key={col.id || cIdx} className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">কলাম #{cIdx + 1} শিরোনাম:</span>
                          <input
                            type="text"
                            value={col.title}
                            onChange={(e) => {
                              const cols = [...footerColumns];
                              cols[cIdx] = { ...cols[cIdx], title: e.target.value };
                              setFooterColumns(cols);
                            }}
                            className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 w-44"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const cols = [...footerColumns];
                            cols[cIdx].links = [...(cols[cIdx].links || []), { label: 'নতুন লিংক', url: '/jobs' }];
                            setFooterColumns(cols);
                          }}
                          className="text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ লিংক যোগ</span>
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {(col.links || []).map((link: any, lIdx: number) => (
                          <div key={lIdx} className="p-2 bg-white border border-slate-200 rounded-xl grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-5">
                              <input
                                type="text"
                                value={link.label}
                                onChange={(e) => {
                                  const cols = [...footerColumns];
                                  cols[cIdx].links[lIdx] = { ...cols[cIdx].links[lIdx], label: e.target.value };
                                  setFooterColumns(cols);
                                }}
                                placeholder="লেবেল..."
                                className="w-full px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                              />
                            </div>
                            <div className="col-span-6">
                              <input
                                type="text"
                                value={link.url}
                                onChange={(e) => {
                                  const cols = [...footerColumns];
                                  cols[cIdx].links[lIdx] = { ...cols[cIdx].links[lIdx], url: e.target.value };
                                  setFooterColumns(cols);
                                }}
                                placeholder="/path..."
                                className="w-full px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono"
                              />
                            </div>
                            <div className="col-span-1 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  const cols = [...footerColumns];
                                  cols[cIdx].links = cols[cIdx].links.filter((_: any, i: number) => i !== lIdx);
                                  setFooterColumns(cols);
                                }}
                                className="text-red-500 hover:text-red-700 text-xs font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveAllSettings}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>সকল হেডার ও ফুটার মেনু পরিবর্তন সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right: Live Visual Preview of Header & Footer (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Header Preview */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Monitor className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">হেডার লাইভ প্রিভিউ</h3>
                </div>

                {announcementEnabled && (
                  <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white text-[11px] p-2.5 rounded-xl border border-emerald-900/40 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-red-600 text-white px-1.5 py-0.2 rounded text-[10px] font-black uppercase">
                        জরুরি
                      </span>
                      <span className="truncate text-slate-200 font-medium">{announcementText}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>হোয়াটসঅ্যাপ: {supportPhone}</span>
                      <span className="text-emerald-400 font-bold">সকাল ৯টা - রাত ১০টা</span>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                      চসে
                    </div>
                    <div>
                      <div className="font-black text-xs text-slate-900">চাকরি<span className="text-emerald-700">সেবা</span> BD</div>
                      <div className="text-[9px] text-slate-400">নিউজ ও আবেদন পোর্টাল</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold">
                    হোম • সার্কুলার • আবেদন • রেজাল্ট
                  </div>
                </div>
              </div>

              {/* Footer Preview */}
              <div className="bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 shadow-2xs p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white">
                  <Layout className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-black text-xs uppercase tracking-wider">ফুটার লাইভ প্রিভিউ</h3>
                </div>

                <div className="text-xs space-y-2">
                  <div className="font-black text-white text-sm">চাকরি<span className="text-emerald-400">সেবা</span></div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                    {footerAboutText}
                  </p>
                  
                  <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{supportPhone}</span>
                    </div>
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{supportEmail}</span>
                    </div>
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{officeAddress}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* SUBTAB 2: GLOBAL SEO META & SOCIAL PREVIEWS */}
      {currentSubTab === 'seo-meta' && (
        <div className="space-y-6">
          {seoSavedToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{seoSavedToast}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: SEO Inputs Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Search className="w-4 h-4 text-emerald-700" />
                <h3 className="font-black text-sm text-slate-900">গ্লোবাল মেটাডাটা ও সার্চ ইঞ্জিন অপটিমাইজেশন</h3>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">সাইট মেটা টাইটেল (Title Tag)</label>
                  <span className={`text-[11px] font-mono ${siteTitle.length > 60 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                    {siteTitle.length}/60 অক্ষর (সর্বোত্তম: ৫০-৬০)
                  </span>
                </div>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">মেটা ডেসক্রিপশন (Meta Description)</label>
                  <span className={`text-[11px] font-mono ${siteDescription.length > 160 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                    {siteDescription.length}/160 অক্ষর
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">টার্গেটেড কীওয়ার্ডস (কমা দিয়ে আলাদা করুন)</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সোশ্যাল শেয়ার ইমেজ (OpenGraph Image URL)</label>
                <input
                  type="text"
                  value={ogImageUrl}
                  onChange={(e) => setOgImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">গুগল সার্চ কনসোল ভেরিফিকেশন</label>
                  <input
                    type="text"
                    value={gscVerification}
                    onChange={(e) => setGscVerification(e.target.value)}
                    placeholder="google-site-verification=..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">গুগল অ্যানালিটিক্স ৪ (GA4 ID)</label>
                  <input
                    type="text"
                    value={ga4Id}
                    onChange={(e) => setGa4Id(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">স্বয়ংক্রিয় JSON-LD Schema মার্কআপ</h4>
                  <p className="text-[11px] text-slate-500">JobPosting, WebSite ও BreadcrumbList স্কিমা সক্রিয়</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableJsonLd(!enableJsonLd)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    enableJsonLd ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    enableJsonLd ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSeo}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  এসইও সেটিংস সংরক্ষণ করুন
                </button>
              </div>
            </div>

            {/* Right: Live SERP & Social Previews (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Google Desktop SERP Preview */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Monitor className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">গুগল সার্চ রেজাল্ট প্রিভিউ (Google SERP)</h3>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mb-1">
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center">
                      CS
                    </div>
                    <span className="font-bold text-slate-800">Chakri Sheba</span>
                    <span className="text-slate-400">›</span>
                    <span className="text-slate-500">https://chakrisheba.com</span>
                  </div>

                  <h4 className="text-sm font-bold text-blue-700 hover:underline cursor-pointer leading-snug">
                    {siteTitle || 'টাইটেল লিখুন'}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 pt-0.5">
                    {siteDescription || 'মেটা ডেসক্রিপশন লিখুন...'}
                  </p>
                </div>
              </div>

              {/* Social Share (OpenGraph) Preview */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">ফেসবুক ও সোশ্যাল শেয়ার প্রিভিউ</h3>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                  <div className="h-32 bg-gradient-to-r from-emerald-800 to-slate-900 flex items-center justify-center text-white font-black text-sm p-4 text-center">
                    <div>
                      <div className="text-emerald-400 text-xs uppercase tracking-widest font-mono mb-1">CHAKRI SHEBA BD</div>
                      <div className="text-sm font-bold">চাকরি সেবা অফিশিয়াল সার্কুলার হাব</div>
                    </div>
                  </div>
                  <div className="p-3 bg-white border-t border-slate-200">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">CHAKRISHEBA.COM</span>
                    <h5 className="font-bold text-xs text-slate-900 line-clamp-1 mt-0.5">{siteTitle}</h5>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{siteDescription}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: REVISIONS & VERSION HISTORY */}
      {currentSubTab === 'revisions' && (
        <div className="space-y-6">
          {rollbackSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{rollbackSuccess}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-slate-900">প্ল্যাটফর্ম রিভিশন ও হিস্ট্রি রিকভারি</h3>
                <p className="text-xs text-slate-500">প্রতিটি কনফিগারেশন ও সাইট আপডেটের অডিট ট্রেইল</p>
              </div>
              <span className="text-xs font-bold text-slate-500">মোট সংস্করণ: {revisions.length}</span>
            </div>

            <div className="relative border-l-2 border-emerald-200 ml-4 space-y-6 py-2">
              {revisions.map((rev) => (
                <div key={rev.id} className="relative pl-6">
                  {/* Dot */}
                  <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white ${
                    !rev.canRollback ? 'bg-emerald-600 ring-4 ring-emerald-100' : 'bg-slate-400'
                  }`} />

                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-slate-900">{rev.version}</span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                          {rev.scope}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{rev.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {rev.notes}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <span>সম্পাদনা করেছেন: <strong className="text-slate-700">{rev.author}</strong></span>
                      {rev.canRollback && (
                        <button
                          type="button"
                          onClick={() => handleRollback(rev)}
                          className="px-3 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-500" />
                          <span>রোলব্যাক করুন</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
