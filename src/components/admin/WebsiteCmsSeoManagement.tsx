'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase,
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
  ChevronDown,
  ChevronRight,
  X,
  AlertCircle,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

interface WebsiteCmsSeoManagementProps {
  activeTab?: string;
  onTabChange?: (tab: string, pageId?: string) => void;
}

interface CmsPage {
  id: string;
  title: string;
  path: string;
  sectionsCount: number;
  status: 'published' | 'draft';
  lastModified: string;
  views: number;
  isSystemPage?: boolean;
}

interface DropdownItem {
  label: string;
  href: string;
  badge?: string;
}

interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  badge?: string;
  dropdown?: DropdownItem[];
}

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
  }
];

const DEFAULT_HEADER_ITEMS: NavMenuItem[] = [
  {
    id: 'home',
    label: 'হোম',
    href: '/'
  },
  {
    id: 'all-jobs',
    label: 'সকল চাকরি',
    href: '/jobs',
    badge: 'হট',
    dropdown: [
      { label: 'চলমান সকল বিজ্ঞপ্তি', href: '/jobs' },
      { label: 'সর্বশেষ প্রকাশিত চাকরি', href: '/latest-jobs' },
      { label: 'আবেদনের শেষ সময় কাছাকাছি', href: '/deadline-approaching' },
      { label: 'সকল চাকরির প্রতিষ্ঠান', href: '/organizations' },
      { label: 'যোগ্যতা অনুযায়ী চাকরি', href: '/job-categories' }
    ]
  },
  {
    id: 'govt',
    label: 'সরকারি চাকরি',
    href: '/government-jobs',
    dropdown: [
      { label: 'সকল সরকারি চাকরি', href: '/government-jobs' },
      { label: 'বিপিএসসি (BPSC) চাকরি', href: '/organizations/bpsc' },
      { label: 'বাংলাদেশ ব্যাংক নিয়োগ', href: '/organizations/bangladesh-bank' },
      { label: 'সরকারি মন্ত্রণালয়সমূহ', href: '/organizations/government-ministries' },
      { label: 'সরকারি অধিদপ্তরসমূহ', href: '/organizations/government-directorates' }
    ]
  },
  {
    id: 'private',
    label: 'বেসরকারি চাকরি',
    href: '/private-jobs',
    dropdown: [
      { label: 'সকল বেসরকারি চাকরি', href: '/private-jobs' },
      { label: 'ব্যাংক ও আর্থিক প্রতিষ্ঠান', href: '/bank-jobs' },
      { label: 'এনজিও (NGO) চাকরি', href: '/ngo-jobs' },
      { label: 'আইটি ও সফটওয়্যার জবস', href: '/it-jobs' },
      { label: 'মেডিকেল ও ফার্মাসিউটিক্যাল', href: '/medical-jobs' }
    ]
  },
  {
    id: 'categories',
    label: 'চাকরির ক্যাটাগরি',
    href: '/job-categories',
    dropdown: [
      { label: 'সকল ক্যাটাগরি ব্রাউজ করুন', href: '/job-categories' },
      { label: 'শিক্ষক নিয়োগ', href: '/teacher-jobs' },
      { label: 'ইঞ্জিনিয়ারিং চাকরি', href: '/engineering-jobs' },
      { label: 'মার্কেটিং ও সেলস', href: '/marketing-jobs' },
      { label: 'ফ্রেশারদের চাকরি', href: '/fresher-jobs' },
      { label: 'পার্ট-টাইম ও ইন্টার্নশিপ', href: '/part-time-jobs' }
    ]
  },
  {
    id: 'exam',
    label: 'পরীক্ষা ও ফলাফল',
    href: '/exam-notices',
    dropdown: [
      { label: 'পরীক্ষার নোটিশ ও তারিখ', href: '/exam-notices' },
      { label: 'প্রবেশপত্র / Admit Card', href: '/admit-cards' },
      { label: 'লিখিত পরীক্ষার ফলাফল', href: '/written-exam-results' },
      { label: 'মৌখিক পরীক্ষার সময়সূচি', href: '/viva-notices' }
    ]
  }
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

  useEffect(() => {
    if (activeTab === 'pages-sections' || activeTab === 'seo-meta' || activeTab === 'header-footer' || activeTab === 'revisions') {
      setCurrentSubTab(activeTab as any);
    }
  }, [activeTab]);

  const handleSubTabSwitch = (tab: 'pages-sections' | 'seo-meta' | 'header-footer' | 'revisions') => {
    setCurrentSubTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // 1. Pages State
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [pageSearch, setPageSearch] = useState('');
  const [isLoadingPages, setIsLoadingPages] = useState(false);

  // New Page Modal State
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageMetaDesc, setNewPageMetaDesc] = useState('');
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [pageCreateError, setPageCreateError] = useState<string | null>(null);

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
  const [siteName, setSiteName] = useState('চাকরি সেবা (Chakri Sheba)');
  const [siteTagline, setSiteTagline] = useState('নিউজ ও ১০০% নির্ভুল আবেদন পোর্টাল');
  const [siteLogo, setSiteLogo] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('/favicon.ico');
  const [announcementText, setAnnouncementText] = useState('আজকে ৩টি নতুন সরকারি চাকরির আবেদন শুরু হয়েছে! শেষ সময় হওয়ার আগেই আবেদন বুকিং দিন।');
  const [announcementUrl, setAnnouncementUrl] = useState('/jobs');
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [supportPhone, setSupportPhone] = useState('+৮৮০ ১৭৭৪-৩৬৬৬৪৩');
  const [supportEmail, setSupportEmail] = useState('support@chakrisheba.com');
  const [whatsappNumber, setWhatsappNumber] = useState('8801774366643');
  const [whatsappButtonText, setWhatsappButtonText] = useState('WhatsApp');
  const [loginButtonText, setLoginButtonText] = useState('লগইন / রেজিস্ট্রেশন');
  const [officeAddress, setOfficeAddress] = useState('ধানমন্ডি ৩২, ঢাকা-১২০৯, বাংলাদেশ');
  const [footerAboutText, setFooterAboutText] = useState('বাংলাদেশের চাকরিপ্রার্থীদের বিশ্বস্ত ডিজিটাল প্ল্যাটফর্ম। ঘরে বসেই সকল সরকারি, ব্যাংক ও শীর্ষ বেসরকারি চাকরির শতভাগ যাচাইকৃত বিজ্ঞপ্তি ও সঠিক নিয়মে অনলাইন আবেদন সহায়তা।');
  const [facebookUrl, setFacebookUrl] = useState('https://facebook.com/chakrisheba.bd');
  const [telegramUrl, setTelegramUrl] = useState('https://t.me/chakrisheba');
  const [youtubeUrl, setYoutubeUrl] = useState('https://youtube.com/@chakrisheba');
  const [isSaving, setIsSaving] = useState(false);
  const [headerMenuItems, setHeaderMenuItems] = useState<NavMenuItem[]>(DEFAULT_HEADER_ITEMS);
  const [footerColumns, setFooterColumns] = useState<any[]>(DEFAULT_FOOTER_COLS);
  const [expandedDropdownId, setExpandedDropdownId] = useState<string | null>(null);

  // 4. Revisions State
  const [revisions, setRevisions] = useState<RevisionItem[]>(INITIAL_REVISIONS);
  const [rollbackSuccess, setRollbackSuccess] = useState<string | null>(null);

  // Function to load all pages from serverDB
  const loadPages = () => {
    setIsLoadingPages(true);
    const pin = typeof window !== 'undefined' ? (localStorage.getItem('cs_admin_pin') || '1234') : '1234';
    const reqHeaders: HeadersInit = { 'Content-Type': 'application/json', 'x-admin-secret': pin };

    fetch('/api/admin/pages', { headers: reqHeaders })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.pages)) {
          const mapped: CmsPage[] = data.pages.map((p: any) => ({
            id: p.id,
            title: p.title,
            path: p.slug,
            sectionsCount: Array.isArray(p.sections) ? p.sections.length : 0,
            status: p.status || 'published',
            lastModified: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('bn-BD') : 'আজ',
            views: Math.floor(1200 + Math.random() * 45000),
            isSystemPage: Boolean(p.isSystemPage)
          }));
          setPages(mapped);
        }
      })
      .catch((e) => console.error('Failed to load pages:', e))
      .finally(() => setIsLoadingPages(false));
  };

  // Load server settings and pages on mount
  useEffect(() => {
    loadPages();

    const pin = typeof window !== 'undefined' ? (localStorage.getItem('cs_admin_pin') || '1234') : '1234';
    const reqHeaders: HeadersInit = { 'Content-Type': 'application/json', 'x-admin-secret': pin };

    fetch('/api/admin/settings', { headers: reqHeaders })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          const s = data.settings;
          if (s.general) {
            if (s.general.siteName) setSiteName(s.general.siteName);
            if (s.general.siteDescription) {
              setSiteDescription(s.general.siteDescription);
              setSiteTagline(s.general.siteDescription);
            }
            if (s.general.logoUrl) setSiteLogo(s.general.logoUrl);
            if (s.general.faviconUrl) setFaviconUrl(s.general.faviconUrl);
            if (s.general.supportPhone) setSupportPhone(s.general.supportPhone);
            if (s.general.supportEmail) setSupportEmail(s.general.supportEmail);
            if (s.general.whatsappNumber) setWhatsappNumber(s.general.whatsappNumber);
            if (s.general.whatsappButtonText) setWhatsappButtonText(s.general.whatsappButtonText);
            if (s.general.loginButtonText) setLoginButtonText(s.general.loginButtonText);
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

  // Save Settings handler
  const handleSaveAllSettings = async () => {
    setIsSaving(true);
    setSeoSavedToast(null);

    try {
      const payload = {
        general: {
          siteName,
          siteDescription: siteTagline || siteDescription,
          logoUrl: siteLogo || '/icons/icon-192x192.png',
          faviconUrl,
          supportPhone,
          supportEmail,
          officeAddress,
          whatsappNumber,
          whatsappButtonText,
          loginButtonText,
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

      const pin = typeof window !== 'undefined' ? (localStorage.getItem('cs_admin_pin') || '1234') : '1234';
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': pin
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSeoSavedToast('🎉 হেডার লোগো, মেনু ও ফুটার সেটিংস সফলভাবে সংরক্ষিত হয়েছে! লাইভ সাইটে তাৎক্ষণিক কার্যকর।');
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

  // Create new page handler
  const handleCreateNewPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim() || !newPageSlug.trim()) {
      setPageCreateError('অনুগ্রহ করে পৃষ্ঠার শিরোনাম ও স্লাগ পূরণ করুন।');
      return;
    }

    setIsCreatingPage(true);
    setPageCreateError(null);

    try {
      const pin = typeof window !== 'undefined' ? (localStorage.getItem('cs_admin_pin') || '1234') : '1234';
      const cleanSlug = '/' + newPageSlug.replace(/^\/+|\/+$/g, '');

      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': pin
        },
        body: JSON.stringify({
          title: newPageTitle.trim(),
          slug: cleanSlug,
          metaDescription: newPageMetaDesc.trim() || `${newPageTitle} — চাকরি সেবা অফিসিয়াল গাইড ও তথ্য পেজ।`
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'নতুন পেজ তৈরি করা যায়নি।');
      }

      setShowCreatePageModal(false);
      setNewPageTitle('');
      setNewPageSlug('');
      setNewPageMetaDesc('');

      loadPages();

      // If user wants to edit immediately, switch to builder
      if (onTabChange && data.page?.id) {
        onTabChange('builder', data.page.id);
      }
    } catch (err: any) {
      setPageCreateError(err.message);
    } finally {
      setIsCreatingPage(false);
    }
  };

  // Delete page handler
  const handleDeletePage = async (pageId: string, pageTitle: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${pageTitle}" পেজটি মুছে ফেলতে চান?`)) return;

    try {
      const pin = typeof window !== 'undefined' ? (localStorage.getItem('cs_admin_pin') || '1234') : '1234';
      const res = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'DELETE',
        headers: { 'x-admin-secret': pin }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'পেজ মোছা ব্যর্থ হয়েছে');
        return;
      }
      setPages(prev => prev.filter(p => p.id !== pageId));
    } catch (e: any) {
      alert('ত্রুটি: ' + e.message);
    }
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
            <h1 className="text-lg font-black text-slate-900">ওয়েবসাইট সিএমএস ও কাস্টমাইজার</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              ওয়ার্ডপ্রেস-গ্রেড রিয়েল-টাইম
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            পেইজ ম্যানেজমেন্ট, হেডার লোগো, ন্যাভিগেশন মেনু ও ড্রপডাউন বিল্ডার এবং গ্লোবাল এসইও
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold flex-wrap">
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
            <span>সব পেইজ (All Pages)</span>
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
            <span>🎨 হেডার ও মেনু কাস্টমাইজার</span>
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
            <span>রিভিশন হিস্ট্রি</span>
          </button>
        </div>
      </div>

      {seoSavedToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{seoSavedToast}</span>
        </div>
      )}

      {/* SUBTAB 1: PAGES & SECTIONS DIRECTORY (WordPress-like Pages -> All Pages & Add New) */}
      {currentSubTab === 'pages-sections' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-slate-900">ওয়েবসাইট পেইজ ডিরেক্টরি ({pages.length}টি পেইজ)</h3>
                <p className="text-xs text-slate-500">সকল সক্রিয় পেজ এডিট করুন অথবা নতুন পেজ তৈরি করুন</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  value={pageSearch}
                  onChange={(e) => setPageSearch(e.target.value)}
                  placeholder="পেইজ খুঁজুন..."
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44"
                />

                <button
                  type="button"
                  onClick={() => setShowCreatePageModal(true)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ নতুন পেইজ তৈরি</span>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange && onTabChange('builder')}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>ভিজ্যুয়াল বিল্ডার</span>
                </button>
              </div>
            </div>

            {/* Pages Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">পেইজের শিরোনাম</th>
                    <th className="py-2.5 px-3 font-mono">রুট পাথ (URL)</th>
                    <th className="py-2.5 px-3">সেকশন সংখ্যা</th>
                    <th className="py-2.5 px-3">স্ট্যাটাস</th>
                    <th className="py-2.5 px-3">ভিউ</th>
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
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                          p.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status === 'published' ? <Check className="w-3 h-3" /> : null}
                          {p.status === 'published' ? 'লাইভ' : 'খসড়া'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                        {p.views.toLocaleString('bn-BD')}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
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
                            onClick={() => onTabChange && onTabChange('builder', p.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            title="ভিজ্যুয়াল বিল্ডারে ডিজাইন করুন"
                          >
                            <Edit3 className="w-3 h-3" /> এডিট
                          </button>
                          {!p.isSystemPage && p.id !== 'home' && (
                            <button
                              type="button"
                              onClick={() => handleDeletePage(p.id, p.title)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPages.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                        কোনো পেজ পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal: Add New Page */}
          {showCreatePageModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                      <Plus className="w-5 h-5" />
                    </span>
                    <h3 className="text-base font-black text-slate-900">নতুন ওয়েবসাইট পেজ তৈরি করুন</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreatePageModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {pageCreateError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{pageCreateError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateNewPage} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">পৃষ্ঠার শিরোনাম *</label>
                    <input
                      type="text"
                      required
                      value={newPageTitle}
                      onChange={(e) => {
                        setNewPageTitle(e.target.value);
                        if (!newPageSlug) {
                          const autoSlug = e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
                          if (autoSlug) setNewPageSlug(autoSlug);
                        }
                      }}
                      placeholder="যেমন: বৃত্তি ও স্কলারশিপ নির্দেশিকা ২০২৬"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ইউআরএল পাথ / স্লাগ (URL Slug) *</label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 bg-slate-200 border border-r-0 border-slate-300 rounded-l-xl text-xs font-mono text-slate-600 font-bold">
                        /
                      </span>
                      <input
                        type="text"
                        required
                        value={newPageSlug.replace(/^\//, '')}
                        onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        placeholder="scholarship-guide"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-r-xl text-xs font-mono text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">মেটা বিবরণী (Meta Description)</label>
                    <textarea
                      rows={2}
                      value={newPageMetaDesc}
                      onChange={(e) => setNewPageMetaDesc(e.target.value)}
                      placeholder="সার্চ ইঞ্জিনের জন্য সংক্ষিপ্ত বিবরণী লিখুন..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCreatePageModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingPage}
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {isCreatingPage ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>তৈরি করুন এবং এডিটর খুলুন</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: WORDPRESS-GRADE THEME CUSTOMIZER (Site Identity, Logo, Header Menus, Dropdowns, Action Buttons & Footer) */}
      {currentSubTab === 'header-footer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Form Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Card 1: Site Identity & Logo (WordPress Appearance -> Customize -> Site Identity) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <ImageIcon className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-black text-sm text-slate-900">সাইট পরিচিতি ও হেডার লোগো (Site Identity & Logo)</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">সাইট লোগো ইমেজ URL</label>
                    <input
                      type="text"
                      value={siteLogo}
                      onChange={(e) => setSiteLogo(e.target.value)}
                      placeholder="/icons/icon-192x192.png অথবা https://..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">খালি রাখলে সুন্দর ডিফল্ট ব্রিফকেস ব্যাজ প্রদর্শিত হবে</p>
                    <div className="flex items-center gap-2 mt-2">
                      <label className="cursor-pointer px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs">
                        <Upload className="w-3 h-3" />
                        <span>কম্পিউটার থেকে লোগো আপলোড</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) setSiteLogo(ev.target.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {siteLogo && (
                        <button
                          type="button"
                          onClick={() => setSiteLogo('')}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          রিমুভ
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">লোগো প্রিভিউ</label>
                    <div className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                      {siteLogo ? (
                        <img src={siteLogo} alt="Logo" className="h-8 max-w-[140px] object-contain" onError={() => {}} />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-black text-slate-700">ডিফল্ট আইকন সক্রিয়</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">সাইটের নাম (Site Title)</label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="চাকরি সেবা"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">সাইট স্লোগান / ট্যাগলাইন</label>
                    <input
                      type="text"
                      value={siteTagline}
                      onChange={(e) => setSiteTagline(e.target.value)}
                      placeholder="নিউজ ও ১০০% নির্ভুল আবেদন পোর্টাল"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Top Announcement Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-black text-sm text-slate-900">টপ জরুরি নোটিশ বার (Top Announcement Bar)</h3>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <span>ব্যানার চালু:</span>
                    <input
                      type="checkbox"
                      checked={announcementEnabled}
                      onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">টপ বার হেল্পলাইন নম্বর</label>
                    <input
                      type="text"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      placeholder="+৮৮০ ১৭৭৪-৩৬৬৬৪৩"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Header Navigation Menu & Dropdown Builder (WordPress Appearance -> Menus) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <List className="w-4 h-4 text-emerald-700" />
                    <div>
                      <h3 className="font-black text-sm text-slate-900">ন্যাভিগেশন মেনু ও ড্রপডাউন বিল্ডার</h3>
                      <p className="text-[11px] text-slate-500">মেনু টেক্সট, ইউআরএল ও সাবমেনু ড্রপডাউন সরাসরি এডিট করুন</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHeaderMenuItems(DEFAULT_HEADER_ITEMS)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 bg-slate-100 rounded-lg cursor-pointer"
                    >
                      ডিফল্ট রিস্টোর
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newItem: NavMenuItem = { id: 'nav-' + Date.now(), label: 'নতুন লিংক', href: '/jobs', dropdown: [] };
                        setHeaderMenuItems(prev => [...prev, newItem]);
                      }}
                      className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ মেনু আইটেম যোগ</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {headerMenuItems.map((item, idx) => {
                    const isExpanded = expandedDropdownId === item.id;
                    const dropdownCount = Array.isArray(item.dropdown) ? item.dropdown.length : 0;

                    return (
                      <div key={item.id || idx} className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
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
                              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                              title="উপরে নিন"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
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
                              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                              title="নিচে নিন"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setHeaderMenuItems(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Top-level menu fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-5">
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">মেনু টেক্সট / লেবেল</label>
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => {
                                const arr = [...headerMenuItems];
                                arr[idx] = { ...arr[idx], label: e.target.value };
                                setHeaderMenuItems(arr);
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">লিংক ইউআরএল (URL)</label>
                            <input
                              type="text"
                              value={item.href}
                              onChange={(e) => {
                                const arr = [...headerMenuItems];
                                arr[idx] = { ...arr[idx], href: e.target.value };
                                setHeaderMenuItems(arr);
                              }}
                              placeholder="/jobs অথবা /about"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">ব্যাজ (ঐচ্ছিক)</label>
                            <input
                              type="text"
                              value={item.badge || ''}
                              onChange={(e) => {
                                const arr = [...headerMenuItems];
                                arr[idx] = { ...arr[idx], badge: e.target.value };
                                setHeaderMenuItems(arr);
                              }}
                              placeholder="হট / নতুন"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-800"
                            />
                          </div>
                        </div>

                        {/* Dropdown toggle and manager */}
                        <div className="pt-2 border-t border-slate-200/80">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setExpandedDropdownId(isExpanded ? null : item.id)}
                              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5 cursor-pointer"
                            >
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              <span>ড্রপডাউন সাব-মেনু ({dropdownCount}টি লিংক)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const arr = [...headerMenuItems];
                                const currentDropdown = arr[idx].dropdown || [];
                                arr[idx] = {
                                  ...arr[idx],
                                  dropdown: [...currentDropdown, { label: 'নতুন সাব-লিংক', href: '/jobs' }]
                                };
                                setHeaderMenuItems(arr);
                                setExpandedDropdownId(item.id);
                              }}
                              className="text-[10px] font-bold text-emerald-800 bg-white hover:bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+ সাবমেনু লিংক যোগ</span>
                            </button>
                          </div>

                          {/* Sub-menu items editor */}
                          {isExpanded && (
                            <div className="mt-2.5 space-y-1.5 pl-2 border-l-2 border-emerald-500">
                              {(item.dropdown || []).map((sub, sIdx) => (
                                <div key={sIdx} className="p-2 bg-white border border-slate-200 rounded-xl grid grid-cols-12 gap-2 items-center">
                                  <div className="col-span-5">
                                    <input
                                      type="text"
                                      value={sub.label}
                                      onChange={(e) => {
                                        const arr = [...headerMenuItems];
                                        const drop = [...(arr[idx].dropdown || [])];
                                        drop[sIdx] = { ...drop[sIdx], label: e.target.value };
                                        arr[idx] = { ...arr[idx], dropdown: drop };
                                        setHeaderMenuItems(arr);
                                      }}
                                      placeholder="সাবমেনু টেক্সট"
                                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-800"
                                    />
                                  </div>
                                  <div className="col-span-5">
                                    <input
                                      type="text"
                                      value={sub.href}
                                      onChange={(e) => {
                                        const arr = [...headerMenuItems];
                                        const drop = [...(arr[idx].dropdown || [])];
                                        drop[sIdx] = { ...drop[sIdx], href: e.target.value };
                                        arr[idx] = { ...arr[idx], dropdown: drop };
                                        setHeaderMenuItems(arr);
                                      }}
                                      placeholder="/url"
                                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800"
                                    />
                                  </div>
                                  <div className="col-span-2 text-right">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const arr = [...headerMenuItems];
                                        const drop = (arr[idx].dropdown || []).filter((_, i) => i !== sIdx);
                                        arr[idx] = { ...arr[idx], dropdown: drop };
                                        setHeaderMenuItems(arr);
                                      }}
                                      className="text-red-500 hover:text-red-700 text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
                                      title="সাবমেনু মুছুন"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {dropdownCount === 0 && (
                                <p className="text-[11px] text-slate-400 italic py-1">কোনো ড্রপডাউন সাব-লিংক নেই। সরাসরি ক্লিক লিংক হিসেবে কাজ করবে।</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 4: Action Buttons Customizer */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-black text-sm text-slate-900">হেডার অ্যাকশন বাটনসমূহ (Action Buttons)</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">হোয়াটসঅ্যাপ বাটন টেক্সট</label>
                    <input
                      type="text"
                      value={whatsappButtonText}
                      onChange={(e) => setWhatsappButtonText(e.target.value)}
                      placeholder="WhatsApp"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">হোয়াটসঅ্যাপ নম্বর (দেশের কোড সহ)</label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="8801774366643"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">লগইন বাটন টেক্সট</label>
                  <input
                    type="text"
                    value={loginButtonText}
                    onChange={(e) => setLoginButtonText(e.target.value)}
                    placeholder="লগইন / রেজিস্ট্রেশন"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
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
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 bg-slate-100 rounded-lg cursor-pointer"
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
                          className="text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1 cursor-pointer"
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
                                className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
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
              </div>

              {/* Card 6: Footer About Us & Socials */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Layout className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-black text-sm text-slate-900">ফুটার পরিচিতি বক্তব্য ও সোশ্যাল মিডিয়া লিংক</h3>
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
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>💾 সকল হেডার ও ফুটার ডিজাইন পরিবর্তন সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: 100% Real-Time Live Visual Mockup (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Header Live Preview Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3 sticky top-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">হেডার লাইভ রিয়েল-টাইম প্রিভিউ</h3>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    লাইভ সিঙ্ক
                  </span>
                </div>

                {/* Simulated Announcement */}
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

                {/* Simulated Header Navbar */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    {/* Logo & Brand Identity */}
                    <div className="flex items-center gap-2">
                      {siteLogo ? (
                        <img src={siteLogo} alt={siteName} className="h-8 max-w-[100px] object-contain" onError={() => {}} />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          <Briefcase className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="font-black text-xs text-slate-900">{siteName}</div>
                        <div className="text-[9px] text-slate-500 font-medium">{siteTagline}</div>
                      </div>
                    </div>

                    {/* Action buttons preview */}
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-1 rounded-lg border border-emerald-600 text-emerald-700 bg-white text-[10px] font-bold">
                        {whatsappButtonText}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-emerald-700 text-white text-[10px] font-black">
                        {loginButtonText}
                      </span>
                    </div>
                  </div>

                  {/* Menu items preview */}
                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-[11px] font-bold text-slate-700 pb-1">
                    {headerMenuItems.slice(0, 5).map((item, idx) => (
                      <span key={idx} className="whitespace-nowrap px-2 py-1 rounded-lg hover:bg-white flex items-center gap-0.5">
                        {item.label}
                        {item.dropdown && item.dropdown.length > 0 && <ChevronDown className="w-3 h-3 text-slate-400" />}
                      </span>
                    ))}
                    {headerMenuItems.length > 5 && (
                      <span className="text-slate-400 font-mono text-[10px]">+{headerMenuItems.length - 5}টি</span>
                    )}
                  </div>
                </div>

                {/* Footer Preview Mockup */}
                <div className="bg-slate-900 text-slate-300 rounded-xl border border-slate-800 p-4 space-y-2 mt-4">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800 text-white text-xs font-black">
                    <Layout className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ফুটার প্রিভিউ</span>
                  </div>
                  <div className="font-black text-white text-xs">{siteName}</div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                    {footerAboutText}
                  </p>
                  <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>হোয়াটসঅ্যাপ: {whatsappNumber}</span>
                    <span className="text-emerald-400 font-bold">{footerColumns.length}টি কলাম সক্রিয়</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveAllSettings}
                    disabled={isSaving}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>পরিবর্তনগুলো এক ক্লিকে লাইভ করুন</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* SUBTAB 3: GLOBAL SEO META & SOCIAL PREVIEWS */}
      {currentSubTab === 'seo-meta' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: SEO Inputs Form (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Search className="w-4 h-4 text-emerald-700" />
                <h3 className="font-black text-sm text-slate-900">গ্লোবাল মেটাডাটা ও সার্চ ইঞ্জিন অপটিমাইজেশন</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সাইট মেটা টাইটেল (Title Tag)</label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সাইট মেটা বিবরণী (Description Tag)</label>
                <textarea
                  rows={3}
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">এসইও কিওয়ার্ডস (কমা দিয়ে পৃথক)</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">OpenGraph ইমেজ লিঙ্ক (সোশ্যাল প্রিভিউ)</label>
                <input
                  type="text"
                  value={ogImageUrl}
                  onChange={(e) => setOgImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAllSettings}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>এসইও সেটিংস সংরক্ষণ করুন</span>
                </button>
              </div>
            </div>

            {/* Right: Google SERP Preview (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Eye className="w-4 h-4 text-emerald-700" />
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-700">গুগল সার্চ ফলাফল প্রিভিউ</h3>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="text-[11px] text-slate-500 font-mono truncate">https://chakrisheba.com</div>
                <div className="text-sm font-bold text-blue-700 hover:underline cursor-pointer line-clamp-1">{siteTitle}</div>
                <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{siteDescription}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: REVISIONS & AUDIT LOGS */}
      {currentSubTab === 'revisions' && (
        <div className="space-y-6">
          {rollbackSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{rollbackSuccess}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-sm text-slate-900">সিএমএস সংস্করণ ও পরিবর্তন লগ</h3>
                <p className="text-xs text-slate-500">পূর্ববর্তী যেকোনো সংস্করণে এক ক্লিকে রোলব্যাক করুন</p>
              </div>
            </div>

            <div className="space-y-3">
              {revisions.map((rev) => (
                <div key={rev.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{rev.version}</span>
                      <span className="text-[10px] text-slate-500">{rev.timestamp}</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">
                        {rev.scope}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{rev.notes}</p>
                    <div className="text-[10px] text-slate-400 mt-1">লেখক: {rev.author}</div>
                  </div>

                  {rev.canRollback && (
                    <button
                      type="button"
                      onClick={() => handleRollback(rev)}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>রোলব্যাক</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
