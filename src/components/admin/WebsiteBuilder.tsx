'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer, { DEFAULT_FOOTER_COLUMNS } from '@/components/Footer';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Eye, 
  Save, 
  Send, 
  History, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Palette, 
  Type, 
  CheckCircle2, 
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ExternalLink,
  Layers,
  HelpCircle,
  Code,
  Settings,
  FileText,
  Sparkles,
  Briefcase,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Star,
  Search,
  Filter,
  Flame,
  LayoutGrid,
  Check,
  ChevronDown,
  RefreshCw,
  Globe,
  CheckSquare,
  Square,
  PanelTop
} from 'lucide-react';
import { PageRecord, PageSection, SectionType, PageRevision } from '@/lib/types';
import BuilderLeftSidebar from './builder/BuilderLeftSidebar';
import BuilderRightInspector from './builder/BuilderRightInspector';
import BuilderPublishModal from './builder/BuilderPublishModal';
import { PRESET_PAGE_TEMPLATES } from './builder/templates/presetTemplates';
import { RotateCcw, RotateCw } from 'lucide-react';
import { getAdminHeaders } from '@/lib/adminAuthClient';

interface WebsiteBuilderProps {
  initialPageId?: string;
  onNavigateToPages?: () => void;
}

export default function WebsiteBuilder({ initialPageId, onNavigateToPages }: WebsiteBuilderProps = {}) {
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>(initialPageId || 'home');

  useEffect(() => {
    if (initialPageId) {
      setSelectedPageId(initialPageId);
    }
  }, [initialPageId]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'live'>('editor');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [showChrome, setShowChrome] = useState<boolean>(true);
  const [platformSettings, setPlatformSettings] = useState<any>(null);
  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const [loading, setLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showNewPageModal, setShowNewPageModal] = useState<boolean>(false);
  const [newPageTitle, setNewPageTitle] = useState<string>('');
  const [newPageSlug, setNewPageSlug] = useState<string>('');
  const [showPageSettingsModal, setShowPageSettingsModal] = useState<boolean>(false);
  const [showChromeSettingsModal, setShowChromeSettingsModal] = useState<boolean>(false);
  const [isSavingChrome, setIsSavingChrome] = useState<boolean>(false);
  const [chromeSaveSuccess, setChromeSaveSuccess] = useState<boolean>(false);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [history, setHistory] = useState<PageSection[][]>([]);
  const [redoStack, setRedoStack] = useState<PageSection[][]>([]);
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(true);

  const pushHistory = (sections: PageSection[]) => {
    setHistory(prev => [...prev.slice(-20), JSON.parse(JSON.stringify(sections))]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (history.length === 0 || !currentPage) return;
    const previous = history[history.length - 1];
    setRedoStack(prev => [...prev, JSON.parse(JSON.stringify(currentPage.sections))]);
    setHistory(prev => prev.slice(0, -1));
    updateCurrentPage(p => ({ ...p, sections: previous }));
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !currentPage) return;
    const next = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(currentPage.sections))]);
    setRedoStack(prev => prev.slice(0, -1));
    updateCurrentPage(p => ({ ...p, sections: next }));
  };

  const handleApplyTemplate = (templateId: string) => {
    if (!currentPage) return;
    const tpl = PRESET_PAGE_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    pushHistory(currentPage.sections);
    updateCurrentPage(p => ({
      ...p,
      sections: JSON.parse(JSON.stringify(tpl.sections))
    }));
    setActiveSectionId(tpl.sections[0]?.id || null);
    setSaveStatus('"' + tpl.name + '" টেমপ্লেট সফলভাবে প্রয়োগ করা হয়েছে!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Chrome Edit Form Fields
  const [chromeSiteName, setChromeSiteName] = useState('চাকরি সেবা (Chakri Sheba)');
  const [chromeSiteTagline, setChromeSiteTagline] = useState('নিউজ ও ১০০% নির্ভুল আবেদন পোর্টাল');
  const [chromeLogoUrl, setChromeLogoUrl] = useState('');
  const [chromeAnnouncementText, setChromeAnnouncementText] = useState('⚡ সরকারি ও ব্যাংক চাকরির শতভাগ নির্ভুল অনলাইন আবেদন ও এসএমএস ট্র্যাকিং সেবা সক্রিয় রয়েছে।');
  const [chromeAnnouncementUrl, setChromeAnnouncementUrl] = useState('/jobs');
  const [chromeAnnouncementEnabled, setChromeAnnouncementEnabled] = useState(true);
  const [chromeWhatsapp, setChromeWhatsapp] = useState('8801774366643');
  const [chromeWhatsappButtonText, setChromeWhatsappButtonText] = useState('WhatsApp');
  const [chromeFooterAbout, setChromeFooterAbout] = useState('বাংলাদেশের চাকরিপ্রার্থীদের বিশ্বস্ত ডিজিটাল প্ল্যাটফর্ম। ঘরে বসেই সকল সরকারি, ব্যাংক ও শীর্ষ বেসরকারি চাকরির শতভাগ যাচাইকৃত বিজ্ঞপ্তি ও সঠিক নিয়মে অনলাইন আবেদন সহায়তা।');
  const [chromeFooterColumns, setChromeFooterColumns] = useState<{ id: string; title: string; links: { label: string; url: string }[] }[]>(DEFAULT_FOOTER_COLUMNS);
  const [chromeFooterDisclaimer, setChromeFooterDisclaimer] = useState('সতর্কতা: চাকরি সেবা কোনো সরকারি বা নিয়োগকারী প্রতিষ্ঠান নয়। আমরা বিভিন্ন অফিশিয়াল ওয়েবসাইট ও জাতীয় পত্রিকা থেকে সংগৃহীত চাকরির তথ্য ও সার্কুলার প্রকাশ করি এবং চাকরিপ্রার্থীদের সুবিধার্থে সঠিক নিয়মে ফর্ম পূরণে পেশাদার সহায়তা প্রদান করি।');
  const [chromeCopyrightText, setChromeCopyrightText] = useState('© ২০২৬ চাকরিসেবা BD (ChakriSheba.com) • সর্বস্বত্ব সংরক্ষিত।');
  const [chromeExpandedFooterColId, setChromeExpandedFooterColId] = useState<string | null>(null);
  const [chromeMenuItems, setChromeMenuItems] = useState<{ id: string; label: string; href: string; badge?: string; badgeColor?: string; dropdown?: { label: string; href: string }[] }[]>([]);
  const [chromeModalTab, setChromeModalTab] = useState<'general' | 'menu' | 'auth-buttons' | 'footer'>('general');
  const [chromeExpandedDropdownId, setChromeExpandedDropdownId] = useState<string | null>(null);

  const [chromeGuestButtons, setChromeGuestButtons] = useState({
    showLogin: true,
    loginText: 'লগইন',
    showRegister: true,
    registerText: 'ফ্রি রেজিস্ট্রেশন',
    showTrackApplication: true,
    trackApplicationText: 'আবেদন ট্র্যাক',
    showWhatsApp: true,
    whatsAppText: 'হোয়াটসঅ্যাপ'
  });

  const [chromeUserWidgets, setChromeUserWidgets] = useState({
    showWalletBalance: true,
    showNotificationBell: true,
    showDashboardButton: true,
    dashboardButtonText: 'ড্যাশবোর্ড',
    showAvatarDropdown: true
  });

  const [chromeStickyHeader, setChromeStickyHeader] = useState(true);

  useEffect(() => {
    fetchPages();
    fetchPlatformSettings();
    const handleSettingsChanged = () => {
      fetchPlatformSettings();
      setIframeKey(Date.now());
    };
    window.addEventListener('cs_settings_changed', handleSettingsChanged);
    return () => {
      window.removeEventListener('cs_settings_changed', handleSettingsChanged);
    };
  }, []);

  const fetchPlatformSettings = async () => {
    try {
      const res = await fetch('/api/platform/settings', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.settings) {
        setPlatformSettings(data.settings);
        const g = data.settings.general || {};
        if (g.siteName) setChromeSiteName(g.siteName);
        if (g.siteDescription) setChromeSiteTagline(g.siteDescription);
        if (g.logoUrl) setChromeLogoUrl(g.logoUrl);
        if (g.announcementText) setChromeAnnouncementText(g.announcementText);
        if (g.announcementUrl) setChromeAnnouncementUrl(g.announcementUrl);
        if (g.announcementEnabled !== undefined) setChromeAnnouncementEnabled(g.announcementEnabled);
        if (g.whatsappNumber) setChromeWhatsapp(g.whatsappNumber);
        if (g.whatsappButtonText) setChromeWhatsappButtonText(g.whatsappButtonText);
        if (g.footerAboutText) setChromeFooterAbout(g.footerAboutText);
        if (g.guestButtons) {
          setChromeGuestButtons({
            showLogin: g.guestButtons.showLogin !== false,
            loginText: g.guestButtons.loginText || 'লগইন',
            showRegister: g.guestButtons.showRegister !== false,
            registerText: g.guestButtons.registerText || 'ফ্রি রেজিস্ট্রেশন',
            showTrackApplication: g.guestButtons.showTrackApplication !== false,
            trackApplicationText: g.guestButtons.trackApplicationText || 'আবেদন ট্র্যাক',
            showWhatsApp: g.guestButtons.showWhatsApp !== false,
            whatsAppText: g.guestButtons.whatsAppText || 'হোয়াটসঅ্যাপ'
          });
        }
        if (g.userWidgets) {
          setChromeUserWidgets({
            showWalletBalance: g.userWidgets.showWalletBalance !== false,
            showNotificationBell: g.userWidgets.showNotificationBell !== false,
            showDashboardButton: g.userWidgets.showDashboardButton !== false,
            dashboardButtonText: g.userWidgets.dashboardButtonText || 'ড্যাশবোর্ড',
            showAvatarDropdown: g.userWidgets.showAvatarDropdown !== false
          });
        }
        if (g.stickyHeader !== undefined) setChromeStickyHeader(g.stickyHeader);
        if (g.headerMenuItems && Array.isArray(g.headerMenuItems)) {
          setChromeMenuItems(g.headerMenuItems);
        } else {
          setChromeMenuItems([
            { id: 'home', label: 'হোম', href: '/' },
            { id: 'all-jobs', label: 'সকল চাকরি', href: '/jobs' },
            { id: 'govt', label: 'সরকারি চাকরি', href: '/government-jobs' },
            { id: 'private', label: 'বেসরকারি চাকরি', href: '/private-jobs' },
            { id: 'categories', label: 'চাকরির ক্যাটাগরি', href: '/job-categories' },
            { id: 'exam', label: 'পরীক্ষা ও ফলাফল', href: '/exam-notices' },
            { id: 'career', label: 'ক্যারিয়ার গাইড', href: '/career-guides' }
          ]);
        }
        if (g.footerColumns && Array.isArray(g.footerColumns)) {
          setChromeFooterColumns(g.footerColumns);
        } else {
          setChromeFooterColumns(DEFAULT_FOOTER_COLUMNS);
        }
        if (g.footerDisclaimer) setChromeFooterDisclaimer(g.footerDisclaimer);
        if (g.copyrightText) setChromeCopyrightText(g.copyrightText);
      }
    } catch (err) {
      console.warn('Failed to load platform settings', err);
    }
  };

  const handleSaveChromeSettings = async () => {
    setIsSavingChrome(true);
    setChromeSaveSuccess(false);
    try {
      const payload = {
        general: {
          siteName: chromeSiteName.trim(),
          siteDescription: chromeSiteTagline.trim(),
          logoUrl: chromeLogoUrl.trim(),
          announcementText: chromeAnnouncementText.trim(),
          announcementUrl: chromeAnnouncementUrl.trim(),
          announcementEnabled: chromeAnnouncementEnabled,
          whatsappNumber: chromeWhatsapp.trim(),
          whatsappButtonText: chromeWhatsappButtonText.trim(),
          footerAboutText: chromeFooterAbout.trim(),
          footerColumns: chromeFooterColumns,
          footerDisclaimer: chromeFooterDisclaimer.trim(),
          copyrightText: chromeCopyrightText.trim(),
          headerMenuItems: chromeMenuItems,
          guestButtons: chromeGuestButtons,
          userWidgets: chromeUserWidgets,
          stickyHeader: chromeStickyHeader
        }
      };
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setChromeSaveSuccess(true);
        await fetchPlatformSettings();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cs_settings_changed'));
        }
        setIframeKey(Date.now());
        setTimeout(() => {
          setShowChromeSettingsModal(false);
          setChromeSaveSuccess(false);
        }, 1200);
      } else {
        const errData = await res.json();
        alert(errData.error || 'হেডার ও ফুটার সেটিংস সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (e: any) {
      alert('ত্রুটি: ' + e.message);
    } finally {
      setIsSavingChrome(false);
    }
  };

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/pages', {
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.pages && Array.isArray(data.pages)) {
        setPages(data.pages);
        if (data.pages.length > 0 && !selectedPageId) {
          setSelectedPageId(data.pages[0].id);
          if (data.pages[0].sections?.length > 0) {
            setActiveSectionId(data.pages[0].sections[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load pages', err);
    } finally {
      setLoading(false);
    }
  };

  const currentPage = pages.find(p => p.id === selectedPageId) || pages[0];

  const updateCurrentPage = (updater: (prev: PageRecord) => PageRecord) => {
    setPages(prev => prev.map(p => p.id === selectedPageId ? updater(p) : p));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (!currentPage) return;
    const sections = [...currentPage.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;
    updateCurrentPage(p => ({ ...p, sections }));
  };

  const handleDuplicateSection = (index: number) => {
    if (!currentPage) return;
    const sections = [...currentPage.sections];
    const original = sections[index];
    const copy: PageSection = {
      ...JSON.parse(JSON.stringify(original)),
      id: 'sec-' + Date.now(),
      title: original.title + ' (কপি)'
    };
    sections.splice(index + 1, 0, copy);
    updateCurrentPage(p => ({ ...p, sections }));
    setActiveSectionId(copy.id);
  };

  const handleDeleteSection = (index: number) => {
    if (!currentPage) return;
    if (currentPage.sections.length <= 1) {
      alert('পৃষ্ঠায় অন্তত একটি সেকশন থাকা আবশ্যক!');
      return;
    }
    const sections = currentPage.sections.filter((_, i) => i !== index);
    updateCurrentPage(p => ({ ...p, sections }));
    setActiveSectionId(null);
  };

  const handleAddSection = (type: SectionType) => {
    if (!currentPage) return;
    const newSec: PageSection = {
      id: 'sec-' + Date.now(),
      type,
      title: type === 'hero' ? 'নতুন ব্যানার শিরোনাম' :
             type === 'banner-image' ? 'প্রচারণামূলক ব্যানার ও ছবি' :
             type === 'jobs' ? 'চলমান সকল চাকরির সার্কুলার ও বিজ্ঞপ্তি' :
             type === 'how-it-works' ? 'কীভাবে ঘরে বসেই নির্ভুল চাকরি আবেদন করবেন?' :
             type === 'testimonials' ? 'সফল চাকরিপ্রার্থীদের বাস্তব অভিজ্ঞতা ও মতামত' :
             type === 'features' ? 'আমাদের প্রধান সেবাসমূহ' :
             type === 'cta' ? 'আজই চাকরির আবেদন সম্পন্ন করুন' :
             type === 'stats' ? 'প্ল্যাটফর্মের মাইলফলক ও পরিসংখ্যান' :
             type === 'faq' ? 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)' :
             'নতুন অনুচ্ছেদ ও বিষয়বস্তু',
      subtitle: type === 'jobs' ? 'সরকারি, ব্যাংক ও স্বায়ত্তশাসিত প্রতিষ্ঠানের হালনাগাদ সার্কুলার' :
                type === 'how-it-works' ? 'সহজ ৪টি ধাপে সম্পন্ন করুন আপনার কাঙ্ক্ষিত চাকরির আবেদন' :
                type === 'testimonials' ? 'দেশজুড়ে লক্ষাধিক চাকরিপ্রার্থীর আস্থার প্ল্যাটফর্ম' :
                type === 'faq' ? 'চাকরি আবেদন ও নিয়মাবলী সংক্রান্ত সাধারণ প্রশ্নোত্তর' : 'এখানে আপনার পছন্দের বিবরণ লিখুন।',
      content: type === 'jobs' ? {
        showCategoryFilter: true,
        showStatusCards: true,
        showSearchBar: true,
        jobsPerPage: 9,
        columns: 3
      } : type === 'how-it-works' ? {
        badge: '⚡ ৪-ধাপে সহজ আবেদন',
        items: [
          { step: 1, title: 'সার্কুলার নির্বাচন', desc: 'পছন্দের চাকরি বাছাই করুন' },
          { step: 2, title: 'তথ্য পূরণ', desc: 'সঠিক তথ্য দিন' },
          { step: 3, title: 'পেমেন্ট ভেরিফাই', desc: 'বিকাশ/নগদে ফি প্রদান' },
          { step: 4, title: 'স্লিপ গ্রহণ', desc: 'অ্যাপ্লিকেন্ট কপি ডাউনলোড' }
        ]
      } : type === 'testimonials' ? {
        badge: '★ ৫২,০০০+ সফল আবেদন',
        items: [
          { name: 'মোঃ তানভীর হাসান', role: 'সহকারী পরিচালক • বাংলাদেশ ব্যাংক', quote: 'চাকরি সেবা ছাড়া এত দ্রুত ও নির্ভুল আবেদন অসম্ভব ছিল!' },
          { name: 'নুসরাত জাহান', role: 'সহকারী শিক্ষক • প্রাথমিক শিক্ষা অধিদপ্তর', quote: 'ছবি ও স্বাক্ষর সাইজিং নিয়ে আর কোনো চিন্তাই করতে হয় না।' }
        ]
      } : type === 'features' ? {
        items: [
          { title: 'ফিচার ১', desc: 'সংক্ষিপ্ত তথ্য এখানে লিখুন।' },
          { title: 'ফিচার ২', desc: 'সংক্ষিপ্ত তথ্য এখানে লিখুন।' },
          { title: 'ফিচার ৩', desc: 'সংক্ষিপ্ত তথ্য এখানে লিখুন।' }
        ]
      } : type === 'cta' ? {
        buttonLabel: 'আবেদন করুন',
        buttonUrl: '/jobs'
      } : type === 'banner-image' ? {
        imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&auto=format&fit=crop&q=80',
        imageAlt: 'চাকরি সেবা ব্যানার',
        badge: 'অফিসিয়াল আপডেট',
        buttonLabel: 'সার্কুলার দেখুন',
        buttonUrl: '/jobs'
      } : type === 'hero' ? {
        badge: '⚡ বিশেষ বিজ্ঞপ্তি',
        ctaText: 'সার্কুলার দেখুন',
        ctaUrl: '/jobs',
        secondaryCtaText: 'আবেদন প্রক্রিয়া জানুন',
        secondaryCtaUrl: '#how-it-works'
      } : {},
      style: {
        backgroundColor: type === 'hero' ? '#064e3b' : type === 'cta' ? '#0f172a' : type === 'jobs' ? '#f8fafc' : '#ffffff',
        textColor: type === 'hero' || type === 'cta' ? '#ffffff' : '#0f172a',
        paddingY: 'lg',
        textAlign: type === 'jobs' ? 'left' : 'center',
        columns: 3
      },
      isVisible: true
    };
    updateCurrentPage(p => ({ ...p, sections: [...p.sections, newSec] }));
    setActiveSectionId(newSec.id);
  };

  const handleSavePage = async (isPublish = false) => {
    if (!currentPage) return;
    try {
      setSaveStatus(isPublish ? 'ওয়েবসাইটে প্রকাশ করা হচ্ছে...' : 'ড্রাফট সংরক্ষণ হচ্ছে...');
      const res = await fetch('/api/admin/pages/' + currentPage.id, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          ...currentPage,
          action: isPublish ? 'publish' : 'save_draft'
        })
      });
      const data = await res.json();
      if (data.success && data.page) {
        setPages(prev => prev.map(p => p.id === data.page.id ? data.page : p));
        setIframeKey(Date.now());
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cs_page_changed'));
          if (isPublish) {
            window.dispatchEvent(new CustomEvent('cs_settings_changed'));
          }
        }
        setSaveStatus(isPublish ? 'সফল! পৃষ্ঠাটি লাইভ ওয়েবসাইটে প্রকাশিত হয়েছে!' : 'ড্রাফট সফলভাবে সংরক্ষিত হয়েছে!');
        setTimeout(() => setSaveStatus(null), 3500);
      } else {
        alert(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে');
        setSaveStatus(null);
      }
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
      setSaveStatus(null);
    }
  };

  const handleDeletePage = async () => {
    if (!currentPage) return;
    if (currentPage.isSystemPage) {
      alert('সিস্টেম বা জরুরি মূল পৃষ্ঠা মুছে ফেলা যাবে না!');
      return;
    }
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${currentPage.title}" পৃষ্ঠাটি মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch('/api/admin/pages/' + currentPage.id, {
        method: 'DELETE',
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setPages(prev => prev.filter(p => p.id !== currentPage.id));
        setSelectedPageId('home');
        setActiveSectionId(null);
        alert('পৃষ্ঠাটি সফলভাবে মুছে ফেলা হয়েছে!');
      } else {
        alert(data.error || 'পৃষ্ঠা মোছা ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert('ত্রুটি: ' + err.message);
    }
  };

  const handleRestoreRevision = (rev: PageRevision) => {
    if (!confirm('আপনি কি সংস্করণ v' + rev.version + '-এ ফিরে যেতে চান?')) return;
    updateCurrentPage(p => ({
      ...p,
      sections: JSON.parse(JSON.stringify(rev.sections))
    }));
    setShowHistoryModal(false);
    alert('সংস্করণ v' + rev.version + ' সফলভাবে রিস্টোর হয়েছে!');
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim() || !newPageSlug.trim()) return;
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          title: newPageTitle,
          slug: newPageSlug
        })
      });
      const data = await res.json();
      if (data.success && data.page) {
        setPages(prev => [...prev, data.page]);
        setSelectedPageId(data.page.id);
        setShowNewPageModal(false);
        setNewPageTitle('');
        setNewPageSlug('');
        alert('নতুন পৃষ্ঠা সফলভাবে তৈরি হয়েছে!');
      } else {
        alert(data.error || 'তৈরি ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-bold animate-pulse">
        ভিজ্যুয়াল পেজ বিল্ডার লোড হচ্ছে...
      </div>
    );
  }

  const activeSection = currentPage?.sections.find(s => s.id === activeSectionId);

  return (
    <div className="space-y-6">
      
      {/* BUILDER HEADER & TOOLBAR */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Page Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {viewMode === 'editor' && (
            <button
              type="button"
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer mt-4 ${
                showLeftSidebar ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              title="উপাদান ও টেমপ্লেট সাইডবার টগল করুন"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{showLeftSidebar ? 'উপাদান লুকান' : 'উপাদান প্যানেল'}</span>
            </button>
          )}
          {onNavigateToPages && (
            <button
              type="button"
              onClick={onNavigateToPages}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer mt-4"
              title="সকল পেজের তালিকায় ফেরত যান"
            >
              <span>← সকল পেজ তালিকা</span>
            </button>
          )}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">সম্পাদনার জন্য পৃষ্ঠা নির্বাচন</span>
            <select
              value={selectedPageId}
              onChange={(e) => {
                setSelectedPageId(e.target.value);
                setActiveSectionId(null);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 max-w-xs truncate"
            >
              {pages.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.slug}) {p.status === 'published' ? '● লাইভ' : '○ ড্রাফট'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 mt-4">
            <button
              onClick={() => setShowPageSettingsModal(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              title="পৃষ্ঠা সেটিংস ও এসইও (Meta Title, Description, Slug)"
            >
              <Settings className="w-3.5 h-3.5 text-slate-700" />
              <span>পৃষ্ঠা এসইও ও সেটিংস</span>
            </button>

            <button
              onClick={() => setShowChromeSettingsModal(true)}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="হেডার, ফুটার, লোগো ও নোটিশ বার কাস্টমাইজ করুন"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-700" />
              <span>হেডার ও ফুটার সেটিংস</span>
            </button>

            <button
              onClick={() => setShowNewPageModal(true)}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন পৃষ্ঠা</span>
            </button>

            {!currentPage?.isSystemPage && (
              <button
                onClick={handleDeletePage}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                title="পৃষ্ঠাটি মুছে ফেলুন"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>পৃষ্ঠা মুছুন</span>
              </button>
            )}
          </div>
        </div>

        {/* Center: Viewport Switcher */}
        <div className="flex items-center justify-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-center">
          <button
            onClick={() => setViewport('desktop')}
            className={'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ' + (
              viewport === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">ডেস্কটপ</span>
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ' + (
              viewport === 'tablet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Tablet className="w-4 h-4" />
            <span className="hidden sm:inline">ট্যাবলেট</span>
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ' + (
              viewport === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">মোবাইল</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => { setViewMode('editor'); setPreviewMode(false); }}
              className={'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ' + (
                viewMode === 'editor' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Sliders className="w-3.5 h-3.5 text-slate-700" />
              <span>এডিটর</span>
            </button>
            <button
              type="button"
              onClick={() => { setViewMode('preview'); setPreviewMode(true); }}
              className={'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ' + (
                viewMode === 'preview' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>প্রিভিউ</span>
            </button>
            <button
              type="button"
              onClick={() => { setViewMode('live'); setPreviewMode(true); }}
              className={'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ' + (
                viewMode === 'live' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>রিয়েল লাইভ ভিউ</span>
            </button>
          </div>

          {viewMode !== 'live' && (
            <button
              type="button"
              onClick={() => setShowChrome(!showChrome)}
              className={'px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ' + (
                showChrome ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
              title="ক্যানভাসে ওয়েবসাইট হেডার ও ফুটার প্রদর্শন করুন বা লুকান"
            >
              {showChrome ? <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
              <span>হেডার ও ফুটার</span>
            </button>
          )}

          <a
            href={currentPage?.slug === '/home-cms-draft' ? '/' : (currentPage?.slug || '/')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="নতুন ট্যাবে এই লাইভ পেজটি খুলুন"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
            <span>লাইভ পেজ দেখুন</span>
          </a>

          {/* Undo / Redo Toolbar Controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="p-1.5 rounded-xl text-slate-700 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="পূর্বাবস্থায় ফেরান (Ctrl + Z)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 rounded-xl text-slate-700 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="পুনরায় করুন (Ctrl + Y)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>সংস্করণ v{currentPage?.version || 1}</span>
          </button>

          <button
            onClick={() => handleSavePage(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>ড্রাফট সেভ</span>
          </button>

          <button
            onClick={() => setShowPublishModal(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>পাবলিশ</span>
          </button>
        </div>

      </div>

      {saveStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* THREE-PANEL BUILDER WORKSPACE */}
      <div className="flex bg-slate-100 rounded-3xl border border-slate-200/90 shadow-inner overflow-hidden min-h-[750px] relative">
        
        {/* PANEL 1: LEFT SIDEBAR (Elements, Sections, Templates, Layers, Globals, Media) */}
        {viewMode === 'editor' && showLeftSidebar && currentPage && (
          <BuilderLeftSidebar
            currentPage={currentPage}
            activeSectionId={activeSectionId}
            onSelectSection={setActiveSectionId}
            onAddSection={(type, customData) => {
              pushHistory(currentPage.sections);
              if (customData) {
                const newSec: PageSection = {
                  id: 'sec-' + Date.now(),
                  type,
                  title: customData.title || 'নতুন সেকশন',
                  subtitle: customData.subtitle || '',
                  content: customData.content || {},
                  style: {
                    backgroundColor: '#ffffff',
                    textColor: '#0f172a',
                    paddingY: 'lg',
                    textAlign: 'center',
                    columns: 3,
                    ...customData.style
                  },
                  isVisible: true
                };
                updateCurrentPage(p => ({ ...p, sections: [...p.sections, newSec] }));
                setActiveSectionId(newSec.id);
              } else {
                handleAddSection(type);
              }
            }}
            onMoveSection={(idx, dir) => {
              pushHistory(currentPage.sections);
              handleMoveSection(idx, dir);
            }}
            onDuplicateSection={(idx) => {
              pushHistory(currentPage.sections);
              handleDuplicateSection(idx);
            }}
            onDeleteSection={(idx) => {
              pushHistory(currentPage.sections);
              handleDeleteSection(idx);
            }}
            onToggleSectionVisibility={(id) => {
              pushHistory(currentPage.sections);
              updateCurrentPage(p => ({
                ...p,
                sections: p.sections.map(s => s.id === id ? { ...s, isVisible: s.isVisible === false } : s)
              }));
            }}
            onApplyTemplate={handleApplyTemplate}
            onOpenChromeSettings={() => setShowChromeSettingsModal(true)}
            onSelectMediaImage={(url) => {
              if (activeSection) {
                updateCurrentPage(p => ({
                  ...p,
                  sections: p.sections.map(s => s.id === activeSection.id ? {
                    ...s,
                    content: { ...s.content, imageUrl: url }
                  } : s)
                }));
              }
            }}
          />
        )}

        {/* PANEL 2: CENTER CANVAS & PANEL 3: RIGHT INSPECTOR */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CANVAS */}
        <div className={viewMode !== 'editor' || !activeSection ? 'lg:col-span-12' : 'lg:col-span-8'}>
          {viewMode === 'live' ? (
            <div className="bg-slate-100 rounded-3xl p-3 sm:p-6 border border-slate-200/90 shadow-inner flex flex-col items-center min-h-[600px]">
              <div 
                style={{ width: viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '100%', transition: 'width 0.3s ease' }}
                className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden flex flex-col"
              >
                {/* Browser address bar */}
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    </div>
                    <div className="font-mono bg-white px-3 py-0.5 rounded-md border border-slate-200 text-[10px] text-slate-700 font-bold truncate max-w-xs">
                      https://chakrisheba.com{currentPage?.slug === '/home-cms-draft' ? '/' : (currentPage?.slug || '/')}
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      রিয়েল লাইভ ওয়েবসাইট ভিউ (১০০% আসল প্রিভিউ)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIframeKey(Date.now())}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1 text-[11px] font-bold shadow-2xs cursor-pointer"
                      title="লাইভ প্রিভিউ রিফ্রেশ করুন"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-600" />
                      <span>রিলোড</span>
                    </button>
                    <a
                      href={currentPage?.slug === '/home-cms-draft' ? '/' : (currentPage?.slug || '/')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-800 flex items-center gap-1 text-[11px] font-bold"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>ট্যাবে খুলুন</span>
                    </a>
                    <span className="font-bold text-[10px] text-slate-600 uppercase bg-slate-200 px-2 py-0.5 rounded">
                      {viewport}
                    </span>
                  </div>
                </div>

                {/* iFrame Viewport */}
                <div className="w-full flex justify-center bg-slate-100/60 p-2 sm:p-4 overflow-x-auto min-h-[780px]">
                  <iframe
                    key={iframeKey}
                    src={currentPage?.slug === '/home-cms-draft' ? '/' : (currentPage?.slug || '/')}
                    title="Live Website Preview"
                    style={{
                      width: viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '100%',
                      maxWidth: viewport === 'desktop' ? '1440px' : undefined,
                      height: '840px',
                      transition: 'width 0.3s ease',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                    }}
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 rounded-3xl p-4 sm:p-8 border border-slate-200/90 shadow-inner flex flex-col items-center min-h-[500px]">
              <div 
                style={{ width: viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '100%', transition: 'width 0.3s ease' }}
                className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden space-y-0"
              >
                {/* Frame Browser bar */}
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="font-mono bg-white px-3 py-0.5 rounded-md border border-slate-200 text-[10px] text-slate-600 truncate max-w-[200px]">
                    https://chakrisheba.com{currentPage?.slug}
                  </div>
                  <span className="font-bold text-[10px] text-emerald-700 uppercase">{viewport} ({currentPage?.status})</span>
                </div>

                {/* REAL TOP NAVBAR IN CANVAS */}
                {showChrome && (
                  <div className="border-b border-slate-200 bg-white relative z-20">
                    <div className="bg-slate-800 text-[10px] text-slate-300 px-3 py-1 flex items-center justify-between font-mono">
                      <span className="flex items-center gap-1.5">
                        <PanelTop className="w-3 h-3 text-emerald-400" />
                        <span>ওয়েবসাইট লাইভ হেডার (Header Preview)</span>
                      </span>
                      <button 
                        type="button"
                        onClick={() => setShowChromeSettingsModal(true)}
                        className="text-emerald-400 hover:text-emerald-300 underline font-bold cursor-pointer"
                      >
                        কাস্টমাইজ করুন
                      </button>
                    </div>
                    <div className="pointer-events-none select-none">
                      <Navbar initialSettings={platformSettings} />
                    </div>
                  </div>
                )}

                {/* CANVAS SECTIONS DIVIDER */}
                <div className="divide-y divide-slate-100">
                {currentPage?.sections.map((sec, idx) => {
                  if (previewMode && sec.isVisible === false) return null;

                  return (
                    <div 
                      key={sec.id}
                      data-section-id={sec.id}
                      onClick={() => !previewMode && setActiveSectionId(sec.id)}
                      style={{
                        backgroundColor: sec.style.backgroundColor || '#ffffff',
                        color: sec.style.textColor || '#0f172a',
                        paddingTop: sec.style.paddingY === 'xl' ? '4rem' : sec.style.paddingY === 'lg' ? '3rem' : sec.style.paddingY === 'sm' ? '1rem' : '2rem',
                        paddingBottom: sec.style.paddingY === 'xl' ? '4rem' : sec.style.paddingY === 'lg' ? '3rem' : sec.style.paddingY === 'sm' ? '1rem' : '2rem',
                        textAlign: sec.style.textAlign || 'center',
                        opacity: sec.isVisible === false ? 0.5 : 1
                      }}
                      className={'relative group transition-all cursor-pointer ' + (
                        !previewMode && activeSectionId === sec.id ? 'ring-4 ring-emerald-500/80 ring-offset-2' : 'hover:outline hover:outline-2 hover:outline-dashed hover:outline-emerald-400'
                      )}
                    >
                      {!previewMode && (
                        <div className="absolute top-2 right-2 bg-slate-900/90 text-white rounded-xl px-2 py-1 text-[11px] font-bold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg">
                          <span className="text-[10px] text-slate-300 font-mono">#{idx + 1} {sec.type}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 'up'); }} disabled={idx === 0} className="p-1 hover:bg-slate-700 rounded disabled:opacity-30" title="উপরে তুলুন">
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 'down'); }} disabled={idx === currentPage.sections.length - 1} className="p-1 hover:bg-slate-700 rounded disabled:opacity-30" title="নিচে নামান">
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDuplicateSection(idx); }} className="p-1 hover:bg-slate-700 rounded" title="কপি করুন">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteSection(idx); }} className="p-1 hover:bg-red-600 rounded text-red-300 hover:text-white" title="মুছে ফেলুন">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <div className="max-w-4xl mx-auto px-6 space-y-4">
                        {sec.type === 'hero' && (
                          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#011612] via-[#022b22] to-[#011a14] text-white p-6 sm:p-10 border border-emerald-900/60 shadow-xl space-y-5">
                            {/* Ambient Glows */}
                            <div className="absolute top-0 right-1/4 w-72 h-44 bg-emerald-500/15 blur-[80px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-4 left-1/4 w-60 h-36 bg-teal-500/10 blur-[70px] rounded-full pointer-events-none" />

                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                              <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
                                {/* Badge Pill */}
                                <div className="inline-flex items-center gap-2 bg-[#022822]/90 border border-emerald-500/40 text-emerald-300 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-xs">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>{sec.content?.badge || '⚡ ২০২৬ এর সর্বশেষ নিয়োগ সার্কুলার'}</span>
                                </div>

                                {/* Dynamic H2 Title */}
                                <h2 
                                  style={{
                                    fontSize: sec.style?.titleFontSize === '6xl' ? '2.5rem' :
                                              sec.style?.titleFontSize === '5xl' ? '2.1rem' :
                                              sec.style?.titleFontSize === '4xl' ? '1.75rem' :
                                              sec.style?.titleFontSize === '3xl' ? '1.45rem' :
                                              sec.style?.titleFontSize === '2xl' ? '1.25rem' : '2.1rem',
                                    fontWeight: sec.style?.fontWeight === 'black' ? 900 :
                                                sec.style?.fontWeight === 'bold' ? 700 :
                                                sec.style?.fontWeight === 'semibold' ? 600 :
                                                sec.style?.fontWeight === 'normal' ? 400 : 800
                                  }}
                                  className="text-white leading-[1.3] font-black tracking-tight"
                                >
                                  {sec.title}
                                </h2>

                                {/* Dynamic Subtitle */}
                                {sec.subtitle && (
                                  <p 
                                    style={{
                                      fontSize: sec.style?.subtitleFontSize === 'xl' ? '1.2rem' :
                                                sec.style?.subtitleFontSize === 'lg' ? '1.05rem' :
                                                sec.style?.subtitleFontSize === 'sm' ? '0.85rem' :
                                                sec.style?.subtitleFontSize === 'xs' ? '0.75rem' : '0.95rem'
                                    }}
                                    className="text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0 opacity-90"
                                  >
                                    {sec.subtitle}
                                  </p>
                                )}

                                {/* Dual Action Buttons */}
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                                  <span className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    <span>{sec.content?.ctaText || sec.content?.buttonLabel || 'চাকরির বিজ্ঞপ্তি দেখুন'}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </span>
                                  <span className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/20 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-emerald-300" />
                                    <span>{sec.content?.secondaryCtaText || 'আবেদন প্রক্রিয়া জানুন'}</span>
                                  </span>
                                </div>

                                {/* 4 Trust Metric Badges */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-emerald-900/50 text-left">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                      <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="text-[12px] font-bold text-white leading-tight">নির্ভরযোগ্য তথ্য</div>
                                      <div className="text-[10px] text-slate-400">অফিসিয়াল সূত্র</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="text-[12px] font-bold text-white leading-tight">ধাপে ধাপে গাইড</div>
                                      <div className="text-[10px] text-slate-400">সহজ নির্দেশিকা</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                      <Flame className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="text-[12px] font-bold text-white leading-tight">নিয়মিত আপডেট</div>
                                      <div className="text-[10px] text-slate-400">তাৎক্ষণিক অ্যালার্ট</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                      <Check className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="text-[12px] font-bold text-white leading-tight">সবার জন্য উন্মুক্ত</div>
                                      <div className="text-[10px] text-slate-400">১০০% ফ্রি সেবা</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Right Side 3D Floating Orb Emblems or Custom Hero Image */}
                              <div className="hidden lg:flex lg:col-span-4 flex-col items-center justify-center">
                                {sec.content?.imageUrl ? (
                                  <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 shadow-2xl">
                                    <img 
                                      src={sec.content.imageUrl} 
                                      alt={sec.title} 
                                      style={{
                                        maxWidth: sec.style?.imageWidth === 'sm' ? '200px' : sec.style?.imageWidth === 'lg' ? '400px' : sec.style?.imageWidth === 'full' ? '100%' : '300px',
                                        maxHeight: '320px',
                                        objectFit: 'cover'
                                      }}
                                      className="rounded-2xl"
                                    />
                                  </div>
                                ) : (
                                <div className="relative p-6 rounded-3xl bg-emerald-900/30 border border-emerald-500/30 backdrop-blur-md text-center space-y-3 shadow-2xl">
                                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                    <Briefcase className="w-8 h-8 text-slate-950" />
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-xl font-black text-white">৫২,০০০+</div>
                                    <div className="text-xs text-emerald-300 font-bold">সফল সরকারি ও ব্যাংক আবেদন</div>
                                  </div>
                                  <div className="flex items-center justify-center gap-1 text-amber-400 text-xs pt-1">
                                    {[1, 2, 3, 4, 5].map(st => (
                                      <Star key={st} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    ))}
                                    <span className="text-white text-[11px] font-bold ml-1">৫.০ রেটিং</span>
                                  </div>
                                </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {sec.type === 'jobs' && (
                          <div className="space-y-6 text-left py-4">
                            {/* Section Header */}
                            <div className="text-center space-y-1 max-w-2xl mx-auto">
                              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                                লাইভ জব ফিড ও সার্কুলার এক্সপ্লোরার
                              </span>
                              <h3 className="text-xl sm:text-3xl font-black text-slate-900">{sec.title}</h3>
                              {sec.subtitle && <p className="text-xs sm:text-sm text-slate-600">{sec.subtitle}</p>}
                            </div>

                            {/* Search & Category Filter Preview */}
                            {sec.content?.showCategoryFilter !== false && (
                              <div className="space-y-3">
                                {/* Category Pills */}
                                <div className="flex flex-wrap items-center gap-1.5 justify-center">
                                  {['সকল চাকরি (২৯)', 'সরকারি / বিসিএস (১২)', 'ব্যাংক জব (৭)', 'শিক্ষক নিয়োগ (৫)', 'বাংলাদেশ রেলওয়ে (৩)', 'এনজিও ও উন্নয়ন (২)'].map((cat, i) => (
                                    <span 
                                      key={i} 
                                      className={'px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ' + (
                                        i === 0 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700'
                                      )}
                                    >
                                      {cat}
                                    </span>
                                  ))}
                                </div>

                                {/* 4 Status Cards */}
                                {sec.content?.showStatusCards !== false && (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                    <div className="p-3 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-xs">
                                      <span className="text-[11px] font-bold opacity-90 block">আজ নতুন</span>
                                      <span className="text-2xl font-black block">২৯ টি</span>
                                      <span className="text-[10px] opacity-80">তাজা বিজ্ঞপ্তি</span>
                                    </div>
                                    <div className="p-3 bg-white border border-slate-200 text-slate-800 rounded-2xl shadow-2xs">
                                      <span className="text-[11px] font-bold text-sky-800 block">আবেদন চলছে</span>
                                      <span className="text-2xl font-black block text-sky-900">২৯ টি</span>
                                      <span className="text-[10px] text-slate-500">চলমান সকল</span>
                                    </div>
                                    <div className="p-3 bg-white border border-slate-200 text-slate-800 rounded-2xl shadow-2xs">
                                      <span className="text-[11px] font-bold text-amber-800 block">শেষ হতে চলেছে</span>
                                      <span className="text-2xl font-black block text-amber-900">৫ টি</span>
                                      <span className="text-[10px] text-slate-500">৭ দিন বাকি</span>
                                    </div>
                                    <div className="p-3 bg-white border border-slate-200 text-slate-800 rounded-2xl shadow-2xs">
                                      <span className="text-[11px] font-bold text-red-800 block">আজ শেষ</span>
                                      <span className="text-2xl font-black block text-red-900">১ টি</span>
                                      <span className="text-[10px] text-slate-500">জরুরি আবেদন</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Realistic Sample Circular Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                              {[
                                { org: 'বাংলাদেশ ব্যাংক', title: 'সহকারী পরিচালক (জেনারেল)', posts: '১০০ জন', deadline: '১০ দিন বাকি', badge: 'সরকারি', fee: '২০০৳' },
                                { org: 'প্রাথমিক শিক্ষা অধিদপ্তর', title: 'সহকারী শিক্ষক নিয়োগ ২০২৬', posts: '৫,০০০ জন', deadline: '১৫ দিন বাকি', badge: 'সরকারি', fee: '১০০৳' },
                                { org: 'বাংলাদেশ রেলওয়ে', title: 'সহকারী স্টেশন মাস্টার', posts: '২৫০ জন', deadline: '৭ দিন বাকি', badge: 'রেলওয়ে', fee: '১৫০৳' }
                              ].map((card, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
                                  <div className="flex items-center justify-between">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">{card.badge}</span>
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">{card.deadline}</span>
                                  </div>
                                  <div>
                                    <span className="text-[11px] text-slate-500 font-bold block">{card.org}</span>
                                    <span className="text-sm font-extrabold text-slate-900 block line-clamp-1">{card.title}</span>
                                  </div>
                                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <span className="text-[11px] text-slate-600 font-medium">পদ: <b>{card.posts}</b></span>
                                    <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px]">আবেদন করুন</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {sec.type === 'how-it-works' && (
                          <div className="space-y-6">
                            <div>
                              {sec.content?.badge && (
                                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
                                  {sec.content.badge}
                                </span>
                              )}
                              <h3 
                                style={{
                                  fontSize: sec.style?.titleFontSize === '5xl' ? '2.25rem' :
                                            sec.style?.titleFontSize === '4xl' ? '1.875rem' :
                                            sec.style?.titleFontSize === '3xl' ? '1.5rem' :
                                            sec.style?.titleFontSize === '2xl' ? '1.25rem' : undefined
                                }}
                                className="text-xl sm:text-2xl font-black"
                              >
                                {sec.title}
                              </h3>
                              {sec.subtitle && <p className="text-xs sm:text-sm opacity-80 mt-1 max-w-xl mx-auto">{sec.subtitle}</p>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {(sec.content?.items || []).map((step: any, i: number) => (
                                <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-white text-slate-900 text-left space-y-2 shadow-xs">
                                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                                    {step.step || i + 1}
                                  </div>
                                  <span className="font-bold text-xs sm:text-sm block">{step.title}</span>
                                  <span className="text-[11px] text-slate-600 block">{step.desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {sec.type === 'testimonials' && (
                          <div className="space-y-6">
                            <div>
                              {sec.content?.badge && (
                                <span className="inline-block px-3 py-1 bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold mb-2">
                                  {sec.content.badge}
                                </span>
                              )}
                              <h3 
                                style={{
                                  fontSize: sec.style?.titleFontSize === '5xl' ? '2.25rem' :
                                            sec.style?.titleFontSize === '4xl' ? '1.875rem' :
                                            sec.style?.titleFontSize === '3xl' ? '1.5rem' :
                                            sec.style?.titleFontSize === '2xl' ? '1.25rem' : undefined
                                }}
                                className="text-xl sm:text-2xl font-black"
                              >
                                {sec.title}
                              </h3>
                              {sec.subtitle && <p className="text-xs sm:text-sm opacity-80 mt-1 max-w-xl mx-auto">{sec.subtitle}</p>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {(sec.content?.items || []).slice(0, 4).map((rev: any, i: number) => (
                                <div key={i} className="p-4 rounded-2xl bg-white/10 text-white text-left space-y-2 border border-white/10">
                                  <span className="font-bold text-xs block">{rev.title || rev.name}</span>
                                  <span className="text-[10px] text-emerald-300 block">{rev.role || rev.institution}</span>
                                  <p className="text-xs opacity-90 italic">"{rev.desc || rev.quote}"</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {sec.type === 'features' && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-xl sm:text-2xl font-black">{sec.title}</h3>
                              {sec.subtitle && <p className="text-xs sm:text-sm opacity-80 mt-1">{sec.subtitle}</p>}
                            </div>
                            <div className={'grid gap-4 ' + (
                              sec.style.columns === 4 ? 'grid-cols-1 sm:grid-cols-4' :
                              sec.style.columns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                              'grid-cols-1 sm:grid-cols-3'
                            )}>
                              {(sec.content.items || []).map((item: any, i: number) => (
                                <div key={i} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 text-left space-y-1">
                                  <span className="font-bold text-xs sm:text-sm text-slate-900 block">{item.title}</span>
                                  <span className="text-xs text-slate-600 block">{item.desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {sec.type === 'cta' && (
                          <div className="space-y-4">
                            <h3 className="text-2xl font-black">{sec.title}</h3>
                            <p className="text-xs sm:text-sm opacity-90">{sec.subtitle}</p>
                            <span className="inline-block px-6 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md">
                              {sec.content.buttonLabel || 'আবেদন করুন'}
                            </span>
                          </div>
                        )}

                        {sec.type === 'banner-image' && (
                          <div className="max-w-4xl mx-auto px-4 space-y-3">
                            <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-md">
                              <img 
                                src={sec.content?.imageUrl || 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&auto=format&fit=crop&q=80'} 
                                alt={sec.title || 'ব্যানার'}
                                style={{
                                  height: sec.style?.imageHeight === 'sm' ? '180px' : sec.style?.imageHeight === 'lg' ? '450px' : '300px',
                                  width: '100%',
                                  objectFit: 'cover'
                                }}
                                className="w-full"
                              />
                              {(sec.title || sec.content?.badge) && (
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent flex flex-col justify-end p-6 text-white text-left space-y-2">
                                  {sec.content?.badge && (
                                    <span className="inline-block px-2.5 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-bold uppercase w-fit">
                                      {sec.content.badge}
                                    </span>
                                  )}
                                  <h3 className="text-xl sm:text-2xl font-black">{sec.title}</h3>
                                  {sec.subtitle && <p className="text-xs sm:text-sm text-slate-200">{sec.subtitle}</p>}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {sec.type === 'stats' && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                            <div className="p-3 bg-white/10 rounded-xl">
                              <span className="text-2xl font-black block">৫২,০০০+</span>
                              <span className="text-[11px] opacity-80">সফল আবেদন</span>
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl">
                              <span className="text-2xl font-black block">১০০%</span>
                              <span className="text-[11px] opacity-80">টেলিটক সামঞ্জস্য</span>
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl">
                              <span className="text-2xl font-black block">৬৪ জেলা</span>
                              <span className="text-[11px] opacity-80">সারাদেশে কভারেজ</span>
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl">
                              <span className="text-2xl font-black block">২৪/৭</span>
                              <span className="text-[11px] opacity-80">সাপোর্ট হেল্পলাইন</span>
                            </div>
                          </div>
                        )}

                        {sec.type === 'text' && (
                          <div className="space-y-2" style={{ textAlign: sec.style.textAlign || 'left' }}>
                            <h3 className="text-xl font-black">{sec.title}</h3>
                            <p className="text-xs sm:text-sm opacity-85 leading-relaxed">{sec.subtitle}</p>
                          </div>
                        )}

                        {sec.type === 'faq' && (
                          <div className="space-y-2.5 mt-3">
                            {((sec.content?.faqs || sec.content?.items) || [
                              { q: 'চাকরি সেবা প্ল্যাটফর্মের মাধ্যমে কীভাবে আবেদন করবেন?', a: 'পছন্দের চাকরি সার্কুলারে গিয়ে "আবেদন করুন" বাটনে ক্লিক করুন...' },
                              { q: 'আমার আবেদনের অ্যাপ্লিকেন্ট কপি কখন পাব?', a: 'আবেদন সম্পন্ন হওয়া মাত্রই আপনার ড্যাশবোর্ডে কপি ডাউনলোড করতে পারবেন...' }
                            ]).slice(0, 4).map((f: any, fi: number) => (
                              <div key={fi} className="p-3 bg-white/80 border border-slate-200/90 rounded-xl text-left space-y-1 shadow-xs">
                                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                                  <span>{f.q || f.title}</span>
                                  <span className="text-slate-400 text-[10px]">▼</span>
                                </div>
                                <p className="text-[11px] text-slate-600 line-clamp-2">{f.a || f.desc}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!previewMode && (
                <div className="p-6 bg-slate-50 border-t border-slate-200 text-center space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">+ নতুন সেকশন যোগ করুন</span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button onClick={() => handleAddSection('hero')} className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 transition-all">+ ব্যানার (Hero)</button>
                    <button onClick={() => handleAddSection('jobs')} className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-emerald-800 transition-all">+ সার্কুলার ফিড (Jobs)</button>
                    <button onClick={() => handleAddSection('how-it-works')} className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 transition-all">+ আবেদনের ধাপ (Workflow)</button>
                    <button onClick={() => handleAddSection('testimonials')} className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 transition-all">+ চাকরিপ্রার্থীদের রিভিউ</button>
                    <button onClick={() => handleAddSection('features')} className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 transition-all">+ ফিচার গ্রিড (Cards)</button>
                    <button onClick={() => handleAddSection('cta')} className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 transition-all">+ কল টু অ্যাকশন (CTA)</button>
                    <button onClick={() => handleAddSection('stats')} className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 transition-all">+ পরিসংখ্যান</button>
                    <button onClick={() => handleAddSection('faq')} className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 transition-all">+ সাধারণ জিজ্ঞাসা (FAQ)</button>
                    <button onClick={() => handleAddSection('text')} className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 transition-all">+ অনুচ্ছেদ / বডি টেক্সট</button>
                    <button onClick={() => handleAddSection('banner-image')} className="px-3 py-1.5 bg-indigo-50 border border-indigo-300 hover:border-indigo-500 rounded-xl text-xs font-bold text-indigo-900 transition-all">+ ব্যানার ইমেজ ও মিডিয়া</button>
                  </div>
                </div>
              )}

              {/* REAL BOTTOM FOOTER IN CANVAS */}
              {showChrome && (
                <div className="border-t border-slate-200 bg-slate-900 relative z-10">
                  <div className="bg-slate-800 text-[10px] text-slate-300 px-3 py-1 flex items-center justify-between font-mono">
                    <span className="flex items-center gap-1.5">
                      <span>🌐 ওয়েবসাইট লাইভ ফুটার (Footer Preview)</span>
                    </span>
                    <button 
                      type="button"
                      onClick={() => setShowChromeSettingsModal(true)}
                      className="text-emerald-400 hover:text-emerald-300 underline font-bold cursor-pointer"
                    >
                      কাস্টমাইজ করুন
                    </button>
                  </div>
                  <div className="pointer-events-none select-none">
                    <Footer initialSettings={platformSettings} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

        {/* INSPECTOR */}
        {!previewMode && activeSection && (
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-black text-slate-900 uppercase">সেকশন ইন্সপেক্টর</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextVisible = activeSection.isVisible === false ? true : false;
                    updateCurrentPage(p => ({
                      ...p,
                      sections: p.sections.map(s => s.id === activeSection.id ? { ...s, isVisible: nextVisible } : s)
                    }));
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeSection.isVisible !== false 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs' 
                      : 'bg-rose-50 text-rose-700 border-rose-300 shadow-2xs'
                  }`}
                  title={activeSection.isVisible !== false ? 'ক্লিক করে সেকশনটি লাইভ ওয়েবসাইটে লুকান' : 'ক্লিক করে সেকশনটি দৃশ্যমান করুন'}
                >
                  <Eye className={`w-3.5 h-3.5 ${activeSection.isVisible !== false ? 'text-emerald-600' : 'text-rose-600'}`} />
                  <span>{activeSection.isVisible !== false ? 'লাইভে দৃশ্যমান' : 'লুকানো (হাইড)'}</span>
                </button>
                <button onClick={() => setActiveSectionId(null)} className="text-xs font-bold text-slate-400 hover:text-slate-700 p-1">✕</button>
              </div>
            </div>

            {/* Content Fields */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-slate-500" />
                <span>টেক্সট ও কনটেন্ট</span>
              </span>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">মূল শিরোনাম</label>
                <input
                  type="text"
                  value={activeSection.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    updateCurrentPage(p => ({
                      ...p,
                      sections: p.sections.map(s => s.id === activeSection.id ? { ...s, title } : s)
                    }));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">উপশিরোনাম / বিবরণ</label>
                <textarea
                  rows={3}
                  value={activeSection.subtitle || ''}
                  onChange={(e) => {
                    const subtitle = e.target.value;
                    updateCurrentPage(p => ({
                      ...p,
                      sections: p.sections.map(s => s.id === activeSection.id ? { ...s, subtitle } : s)
                    }));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* TEXT SECTION: FULL MULTI-PARAGRAPH BODY TEXT & HTML */}
              {activeSection.type === 'text' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>পূর্ণাঙ্গ বডি কনটেন্ট (আর্টিকেল / পলিসি টেক্সট)</span>
                    </label>
                  </div>

                  {/* Rich Snippet Helpers */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = activeSection.content?.bodyText || '';
                        const nxt = cur ? cur + '\n\n• নতুন পয়েন্ট এখানে লিখুন' : '• নতুন পয়েন্ট এখানে লিখুন';
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            content: { ...s.content, bodyText: nxt }
                          } : s)
                        }));
                      }}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-200"
                    >
                      + বুলেট পয়েন্ট
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = activeSection.content?.bodyText || '';
                        const nxt = cur ? cur + '\n\n[বিশেষ দ্রষ্টব্য]: এখানে জরুরি তথ্য বা সতর্কবার্তা লিখুন।' : '[বিশেষ দ্রষ্টব্য]: এখানে জরুরি তথ্য বা সতর্কবার্তা লিখুন।';
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            content: { ...s.content, bodyText: nxt }
                          } : s)
                        }));
                      }}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-200"
                    >
                      + নোট বক্স
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = activeSection.content?.bodyText || '';
                        const nxt = cur ? cur + '\n\nএখানে নতুন একটি অনুচ্ছেদ লিখুন।' : 'এখানে নতুন একটি অনুচ্ছেদ লিখুন।';
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            content: { ...s.content, bodyText: nxt }
                          } : s)
                        }));
                      }}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-200"
                    >
                      + নতুন অনুচ্ছেদ
                    </button>
                  </div>

                  <textarea
                    rows={8}
                    value={activeSection.content?.bodyText || ''}
                    onChange={(e) => {
                      const bodyText = e.target.value;
                      updateCurrentPage(p => ({
                        ...p,
                        sections: p.sections.map(s => s.id === activeSection.id ? {
                          ...s,
                          content: { ...s.content, bodyText }
                        } : s)
                      }));
                    }}
                    placeholder="এখানে আপনার পূর্ণাঙ্গ আর্টিকেল, শর্তাবলী, নীতিমালা বা পেইজের মূল বিষয়বস্তু লিখুন..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
                  />

                  {/* Optional Raw HTML Editor */}
                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mb-1">
                      <Code className="w-3 h-3" />
                      <span>এডভান্সড HTML কোড (ঐচ্ছিক):</span>
                    </label>
                    <textarea
                      rows={4}
                      value={activeSection.content?.bodyHtml || ''}
                      onChange={(e) => {
                        const bodyHtml = e.target.value;
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            content: { ...s.content, bodyHtml }
                          } : s)
                        }));
                      }}
                      placeholder="<p>কাস্টম এইচটিএমএল বা টেবিল এখানে পেস্ট করতে পারেন...</p>"
                      className="w-full px-3 py-1.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl border border-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* FAQ SPECIFIC */}
              {activeSection.type === 'faq' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>প্রশ্নোত্তর তালিকা ({((activeSection.content?.faqs || activeSection.content?.items) || []).length}টি)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = (activeSection.content?.faqs || activeSection.content?.items) || [];
                        const faqs = [...cur, { q: 'নতুন প্রশ্ন লিখুন?', a: 'এখানে বিস্তারিত উত্তর লিখুন।' }];
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            content: { ...s.content, faqs, items: faqs }
                          } : s)
                        }));
                      }}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded-lg"
                    >
                      + প্রশ্ন যোগ করুন
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {((activeSection.content?.faqs || activeSection.content?.items) || []).map((faq: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500">প্রশ্ন #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const cur = (activeSection.content?.faqs || activeSection.content?.items) || [];
                              const faqs = cur.filter((_: any, i: number) => i !== idx);
                              updateCurrentPage(p => ({
                                ...p,
                                sections: p.sections.map(s => s.id === activeSection.id ? {
                                  ...s,
                                  content: { ...s.content, faqs, items: faqs }
                                } : s)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 text-[10px] font-bold"
                          >
                            মুছুন
                          </button>
                        </div>
                        <input
                          type="text"
                          value={faq.q || faq.question || faq.title || ''}
                          onChange={(e) => {
                            const cur = [...((activeSection.content?.faqs || activeSection.content?.items) || [])];
                            cur[idx] = { ...cur[idx], q: e.target.value, question: e.target.value };
                            updateCurrentPage(p => ({
                              ...p,
                              sections: p.sections.map(s => s.id === activeSection.id ? {
                                ...s,
                                content: { ...s.content, faqs: cur, items: cur }
                              } : s)
                            }));
                          }}
                          placeholder="প্রশ্ন..."
                          className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                        />
                        <textarea
                          rows={2}
                          value={faq.a || faq.answer || faq.desc || ''}
                          onChange={(e) => {
                            const cur = [...((activeSection.content?.faqs || activeSection.content?.items) || [])];
                            cur[idx] = { ...cur[idx], a: e.target.value, answer: e.target.value };
                            updateCurrentPage(p => ({
                              ...p,
                              sections: p.sections.map(s => s.id === activeSection.id ? {
                                ...s,
                                content: { ...s.content, faqs: cur, items: cur }
                              } : s)
                            }));
                          }}
                          placeholder="উত্তর..."
                          className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STATS SPECIFIC */}
              {activeSection.type === 'stats' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">পরিসংখ্যান আইটেম</label>
                    <button
                      type="button"
                      onClick={() => {
                        const items = [...(activeSection.content?.items || []), { value: '১০০+', label: 'নতুন অর্জন' }];
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            content: { ...s.content, items }
                          } : s)
                        }));
                      }}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded-lg"
                    >
                      + আইটেম যোগ করুন
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(activeSection.content?.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <input
                            type="text"
                            value={item.value || ''}
                            onChange={(e) => {
                              const items = [...(activeSection.content?.items || [])];
                              items[idx] = { ...items[idx], value: e.target.value };
                              updateCurrentPage(p => ({
                                ...p,
                                sections: p.sections.map(s => s.id === activeSection.id ? {
                                  ...s,
                                  content: { ...s.content, items }
                                } : s)
                              }));
                            }}
                            placeholder="সংখ্যা (উদা: ৫০,০০০+)"
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black"
                          />
                        </div>
                        <div className="col-span-6">
                          <input
                            type="text"
                            value={item.label || ''}
                            onChange={(e) => {
                              const items = [...(activeSection.content?.items || [])];
                              items[idx] = { ...items[idx], label: e.target.value };
                              updateCurrentPage(p => ({
                                ...p,
                                sections: p.sections.map(s => s.id === activeSection.id ? {
                                  ...s,
                                  content: { ...s.content, items }
                                } : s)
                              }));
                            }}
                            placeholder="লেবেল (উদা: সফল আবেদন)"
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const items = (activeSection.content?.items || []).filter((_: any, i: number) => i !== idx);
                              updateCurrentPage(p => ({
                                ...p,
                                sections: p.sections.map(s => s.id === activeSection.id ? {
                                  ...s,
                                  content: { ...s.content, items }
                                } : s)
                              }));
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
              )}

              {/* Hero Specific */}
              {activeSection.type === 'hero' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">টপ ব্যাজ (Badge)</label>
                    <input
                      type="text"
                      value={activeSection.content?.badge || ''}
                      onChange={(e) => {
                        const badge = e.target.value;
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            content: { ...s.content, badge }
                          } : s)
                        }));
                      }}
                      placeholder="উদা: ⚡ বিশেষ বিজ্ঞপ্তি"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  {/* Primary CTA Button */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-extrabold text-emerald-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>প্রাইমারি অ্যাকশন বাটন</span>
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">বাটন টেক্সট</label>
                        <input
                          type="text"
                          value={activeSection.content?.ctaText || activeSection.content?.buttonLabel || ''}
                          onChange={(e) => {
                            const ctaText = e.target.value;
                            updateCurrentPage(p => ({
                              ...p,
                              sections: p.sections.map(s => s.id === activeSection.id ? {
                                ...s,
                                content: { ...s.content, ctaText, buttonLabel: ctaText }
                              } : s)
                            }));
                          }}
                          placeholder="চাকরির বিজ্ঞপ্তি দেখুন"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">বাটন লিংক</label>
                        <input
                          type="text"
                          value={activeSection.content?.ctaUrl || activeSection.content?.buttonUrl || ''}
                          onChange={(e) => {
                            const ctaUrl = e.target.value;
                            updateCurrentPage(p => ({
                              ...p,
                              sections: p.sections.map(s => s.id === activeSection.id ? {
                                ...s,
                                content: { ...s.content, ctaUrl, buttonUrl: ctaUrl }
                              } : s)
                            }));
                          }}
                          placeholder="/jobs"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary CTA Button */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                      <span>সেকেন্ডারি বাটন (আউটলাইন)</span>
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">বাটন টেক্সট</label>
                        <input
                          type="text"
                          value={activeSection.content?.secondaryCtaText || ''}
                          onChange={(e) => {
                            const secondaryCtaText = e.target.value;
                            updateCurrentPage(p => ({
                              ...p,
                              sections: p.sections.map(s => s.id === activeSection.id ? {
                                ...s,
                                content: { ...s.content, secondaryCtaText }
                              } : s)
                            }));
                          }}
                          placeholder="আবেদন প্রক্রিয়া জানুন"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">বাটন লিংক</label>
                        <input
                          type="text"
                          value={activeSection.content?.secondaryCtaUrl || ''}
                          onChange={(e) => {
                            const secondaryCtaUrl = e.target.value;
                            updateCurrentPage(p => ({
                              ...p,
                              sections: p.sections.map(s => s.id === activeSection.id ? {
                                ...s,
                                content: { ...s.content, secondaryCtaUrl }
                              } : s)
                            }));
                          }}
                          placeholder="#how-it-works"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hero Graphic & Image Resizing */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-extrabold text-indigo-800 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-indigo-600" />
                      <span>হিরো ইমেজ ও গ্রাফিক্স (Hero Image & Resizing)</span>
                    </span>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">ইমেজ URL (Hero Image URL)</label>
                      <input
                        type="text"
                        value={activeSection.content?.imageUrl || ''}
                        onChange={(e) => {
                          const imageUrl = e.target.value;
                          updateCurrentPage(p => ({
                            ...p,
                            sections: p.sections.map(s => s.id === activeSection.id ? {
                              ...s,
                              content: { ...s.content, imageUrl }
                            } : s)
                          }));
                        }}
                        placeholder="https://... বা /images/hero-illustration.png"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">পজিশন (Position)</label>
                        <select
                          value={activeSection.content?.imagePosition || 'right'}
                          onChange={(e) => {
                            const imagePosition = e.target.value;
                            updateCurrentPage(p => ({
                              ...p,
                              sections: p.sections.map(s => s.id === activeSection.id ? {
                                ...s,
                                content: { ...s.content, imagePosition }
                              } : s)
                            }));
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                        >
                          <option value="right">ডানপাশে (Right)</option>
                          <option value="center">কেন্দ্রে (Center)</option>
                          <option value="background">ব্যাকগ্রাউন্ড (Background)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">ইমেজ সাইজ (Size)</label>
                        <select
                          value={activeSection.style?.imageWidth || 'md'}
                          onChange={(e) => {
                            const imageWidth = e.target.value;
                            updateCurrentPage(p => ({
                              ...p,
                              sections: p.sections.map(s => s.id === activeSection.id ? {
                                ...s,
                                style: { ...s.style, imageWidth }
                              } : s)
                            }));
                          }}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                        >
                          <option value="sm">ছোট (Small)</option>
                          <option value="md">মাঝারি (Medium)</option>
                          <option value="lg">বড় (Large)</option>
                          <option value="full">সম্পূর্ণ (Full)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Banner Image Specific */}
              {activeSection.type === 'banner-image' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">ইমেজ URL (Banner Image URL)</label>
                    <input
                      type="text"
                      value={activeSection.content?.imageUrl || ''}
                      onChange={(e) => {
                        const imageUrl = e.target.value;
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            content: { ...s.content, imageUrl }
                          } : s)
                        }));
                      }}
                      placeholder="https://... বা /images/banner.jpg"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">ব্যানার উচ্চতা (Height)</label>
                      <select
                        value={activeSection.style?.imageHeight || 'md'}
                        onChange={(e) => {
                          const imageHeight = e.target.value;
                          updateCurrentPage(p => ({
                            ...p,
                            sections: p.sections.map(s => s.id === activeSection.id ? {
                              ...s,
                              style: { ...s.style, imageHeight }
                            } : s)
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                      >
                        <option value="sm">কম উচ্চতা (Small - 180px)</option>
                        <option value="md">মাঝারি (Medium - 300px)</option>
                        <option value="lg">উচ্চ (Large - 450px)</option>
                        <option value="auto">স্বাভাবিক (Auto)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">বর্ডার রেডিয়াস (Radius)</label>
                      <select
                        value={activeSection.style?.imageBorderRadius || '2xl'}
                        onChange={(e) => {
                          const imageBorderRadius = e.target.value;
                          updateCurrentPage(p => ({
                            ...p,
                            sections: p.sections.map(s => s.id === activeSection.id ? {
                              ...s,
                              style: { ...s.style, imageBorderRadius }
                            } : s)
                          }));
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                      >
                        <option value="none">সোজা (Square)</option>
                        <option value="md">হালকা গোল (Medium)</option>
                        <option value="2xl">বেশি গোল (Curved 2XL)</option>
                        <option value="full">সম্পূর্ণ গোল (Pill)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">ক্লিক লিংক URL (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={activeSection.content?.buttonUrl || activeSection.content?.linkUrl || ''}
                      onChange={(e) => {
                        const linkUrl = e.target.value;
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            content: { ...s.content, linkUrl, buttonUrl: linkUrl }
                          } : s)
                        }));
                      }}
                      placeholder="/jobs বা https://..."
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Jobs Specific */}
              {activeSection.type === 'jobs' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-emerald-700" />
                      <span>সার্কুলার গ্রিড কনফিগারেশন</span>
                    </span>
                    <p className="text-[11px] text-slate-600">
                      লাইভ ডাটাবেজ থেকে স্বয়ংক্রিয়ভাবে সরকারি ও ব্যাংক চাকরির সার্কুলার লোড হয়।
                    </p>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer">
                      <span className="text-slate-700">ক্যাটাগরি ফিল্টার বার প্রদর্শন</span>
                      <input
                        type="checkbox"
                        checked={activeSection.content?.showCategoryFilter !== false}
                        onChange={(e) => {
                          const showCategoryFilter = e.target.checked;
                          updateCurrentPage(p => ({
                            ...p,
                            sections: p.sections.map(s => s.id === activeSection.id ? {
                              ...s,
                              content: { ...s.content, showCategoryFilter }
                            } : s)
                          }));
                        }}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer">
                      <span className="text-slate-700">স্ট্যাটাস মেট্রিক কার্ড (৪টি কার্ড) প্রদর্শন</span>
                      <input
                        type="checkbox"
                        checked={activeSection.content?.showStatusCards !== false}
                        onChange={(e) => {
                          const showStatusCards = e.target.checked;
                          updateCurrentPage(p => ({
                            ...p,
                            sections: p.sections.map(s => s.id === activeSection.id ? {
                              ...s,
                              content: { ...s.content, showStatusCards }
                            } : s)
                          }));
                        }}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer">
                      <span className="text-slate-700">সার্চ বার প্রদর্শন</span>
                      <input
                        type="checkbox"
                        checked={activeSection.content?.showSearchBar !== false}
                        onChange={(e) => {
                          const showSearchBar = e.target.checked;
                          updateCurrentPage(p => ({
                            ...p,
                            sections: p.sections.map(s => s.id === activeSection.id ? {
                              ...s,
                              content: { ...s.content, showSearchBar }
                            } : s)
                          }));
                        }}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* CTA Specific */}
              {activeSection.type === 'cta' && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">বাটন টেক্সট</label>
                    <input
                      type="text"
                      value={activeSection.content?.buttonLabel || ''}
                      onChange={(e) => {
                        const buttonLabel = e.target.value;
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            content: { ...s.content, buttonLabel }
                          } : s)
                        }));
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">বাটন লিংক</label>
                    <input
                      type="text"
                      value={activeSection.content?.buttonUrl || ''}
                      onChange={(e) => {
                        const buttonUrl = e.target.value;
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            content: { ...s.content, buttonUrl }
                          } : s)
                        }));
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Features, How It Works & Testimonials Specific */}
              {(activeSection.type === 'features' || activeSection.type === 'how-it-works' || activeSection.type === 'testimonials') && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700">
                      {activeSection.type === 'how-it-works' ? 'আবেদনের ধাপসমূহ' : activeSection.type === 'testimonials' ? 'চাকরিপ্রার্থীদের রিভিউ' : 'ফিচার কার্ডসমূহ'} ({(activeSection.content?.items || []).length}টি)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const newItem = activeSection.type === 'testimonials' 
                          ? { title: 'নতুন প্রার্থীর নাম', role: 'পদবী ও প্রতিষ্ঠান', desc: 'বাস্তব অভিজ্ঞতা লিখুন।' }
                          : activeSection.type === 'how-it-works'
                          ? { step: (activeSection.content?.items || []).length + 1, title: 'নতুন ধাপের নাম', desc: 'ধাপের বিবরণ লিখুন।' }
                          : { title: 'নতুন সুবিধা', desc: 'বিবরণ লিখুন।' };
                        const items = [...(activeSection.content?.items || []), newItem];
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            content: { ...s.content, items }
                          } : s)
                        }));
                      }}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900"
                    >
                      + আইটেম যোগ করুন
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {(activeSection.content?.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500">
                            {activeSection.type === 'testimonials' ? `রিভিউ #${idx + 1}` : activeSection.type === 'how-it-works' ? `ধাপ #${idx + 1}` : `ফিচার #${idx + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const items = (activeSection.content?.items || []).filter((_: any, i: number) => i !== idx);
                              updateCurrentPage(p => ({
                                ...p,
                                sections: p.sections.map(s => s.id === activeSection.id ? {
                                  ...s,
                                  content: { ...s.content, items }
                                } : s)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 text-[10px] font-bold"
                          >
                            মুছুন
                          </button>
                        </div>

                        {activeSection.type === 'testimonials' ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={item.name || item.title || ''}
                              onChange={(e) => {
                                const items = [...(activeSection.content?.items || [])];
                                items[idx] = { ...items[idx], name: e.target.value, title: e.target.value };
                                updateCurrentPage(p => ({
                                  ...p,
                                  sections: p.sections.map(s => s.id === activeSection.id ? {
                                    ...s,
                                    content: { ...s.content, items }
                                  } : s)
                                }));
                              }}
                              className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                              placeholder="প্রার্থীর নাম (উদা: তানভীর আহমেদ)"
                            />
                            <input
                              type="text"
                              value={item.role || ''}
                              onChange={(e) => {
                                const items = [...(activeSection.content?.items || [])];
                                items[idx] = { ...items[idx], role: e.target.value };
                                updateCurrentPage(p => ({
                                  ...p,
                                  sections: p.sections.map(s => s.id === activeSection.id ? {
                                    ...s,
                                    content: { ...s.content, items }
                                  } : s)
                                }));
                              }}
                              className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                              placeholder="পদবী ও প্রতিষ্ঠান (উদা: সহকারী পরিচালক, বাংলাদেশ ব্যাংক)"
                            />
                            <textarea
                              rows={2}
                              value={item.quote || item.desc || ''}
                              onChange={(e) => {
                                const items = [...(activeSection.content?.items || [])];
                                items[idx] = { ...items[idx], quote: e.target.value, desc: e.target.value };
                                updateCurrentPage(p => ({
                                  ...p,
                                  sections: p.sections.map(s => s.id === activeSection.id ? {
                                    ...s,
                                    content: { ...s.content, items }
                                  } : s)
                                }));
                              }}
                              className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed"
                              placeholder="চাকরিপ্রার্থীর বাস্তব অভিজ্ঞতা / কোটেশন..."
                            />
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={item.title || ''}
                              onChange={(e) => {
                                const items = [...(activeSection.content?.items || [])];
                                items[idx] = { ...items[idx], title: e.target.value };
                                updateCurrentPage(p => ({
                                  ...p,
                                  sections: p.sections.map(s => s.id === activeSection.id ? {
                                    ...s,
                                    content: { ...s.content, items }
                                  } : s)
                                }));
                              }}
                              className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                              placeholder="শিরোনাম / নাম"
                            />
                            <textarea
                              rows={2}
                              value={item.desc || ''}
                              onChange={(e) => {
                                const items = [...(activeSection.content?.items || [])];
                                items[idx] = { ...items[idx], desc: e.target.value };
                                updateCurrentPage(p => ({
                                  ...p,
                                  sections: p.sections.map(s => s.id === activeSection.id ? {
                                    ...s,
                                    content: { ...s.content, items }
                                  } : s)
                                }));
                              }}
                              className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed"
                              placeholder="বিস্তারিত বিবরণ..."
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Styling & Layout */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-500" />
                <span>কালার ও লেআউট স্টাইলিং</span>
              </span>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">ব্যাকগ্রাউন্ড কালার</label>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Green', color: '#064e3b' },
                    { label: 'Navy', color: '#0f172a' },
                    { label: 'White', color: '#ffffff' },
                    { label: 'Light', color: '#f8fafc' },
                    { label: 'Teal', color: '#0d9488' }
                  ].map(c => (
                    <button
                      key={c.color}
                      type="button"
                      style={{ backgroundColor: c.color }}
                      onClick={() => {
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            style: {
                              ...s.style,
                              backgroundColor: c.color,
                              textColor: c.color === '#ffffff' || c.color === '#f8fafc' ? '#0f172a' : '#ffffff'
                            }
                          } : s)
                        }));
                      }}
                      className={'w-6 h-6 rounded-full border-2 transition-all ' + (
                        activeSection.style.backgroundColor === c.color ? 'border-emerald-500 scale-110 shadow' : 'border-slate-300'
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Text Alignment */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">টেক্সট অ্যালাইনমেন্ট</label>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {[
                    { align: 'left', icon: AlignLeft, label: 'বাম' },
                    { align: 'center', icon: AlignCenter, label: 'মাঝ' },
                    { align: 'right', icon: AlignRight, label: 'ডান' }
                  ].map(a => (
                    <button
                      key={a.align}
                      type="button"
                      onClick={() => {
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            style: { ...s.style, textAlign: a.align as any }
                          } : s)
                        }));
                      }}
                      className={'flex-1 py-1 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all ' + (
                        activeSection.style.textAlign === a.align ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      )}
                    >
                      <a.icon className="w-3.5 h-3.5" />
                      <span>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Columns for Features */}
              {activeSection.type === 'features' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1.5">কলাম সংখ্যা</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([2, 3, 4] as const).map(cols => (
                      <button
                        key={cols}
                        type="button"
                        onClick={() => {
                          updateCurrentPage(p => ({
                            ...p,
                            sections: p.sections.map(s => s.id === activeSection.id ? {
                              ...s,
                              style: { ...s.style, columns: cols }
                            } : s)
                          }));
                        }}
                        className={'py-1 rounded-xl text-xs font-bold border transition-all ' + (
                          activeSection.style.columns === cols ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                        )}
                      >
                        {cols} কলাম
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Padding */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">ভার্টিক্যাল প্যাডিং</label>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {[
                    { pad: 'sm', label: 'কম' },
                    { pad: 'md', label: 'মাঝারি' },
                    { pad: 'lg', label: 'বেশি' },
                    { pad: 'xl', label: 'সর্বোচ্চ' }
                  ].map(pItem => (
                    <button
                      key={pItem.pad}
                      type="button"
                      onClick={() => {
                        updateCurrentPage(p => ({
                          ...p,
                          sections: p.sections.map(s => s.id === activeSection.id ? {
                            ...s,
                            style: { ...s.style, paddingY: pItem.pad as any }
                          } : s)
                        }));
                      }}
                      className={'py-1 text-xs font-bold rounded-xl border transition-all ' + (
                        activeSection.style.paddingY === pItem.pad ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'
                      )}
                    >
                      {pItem.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography & Font Sizes */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-slate-500" />
                  <span>টাইপোগ্রাফি ও ফন্ট সাইজ (Font Size)</span>
                </span>

                {/* Title Font Size */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1.5">শিরোনামের ফন্ট সাইজ (Title Size)</label>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {[
                      { size: '2xl', label: '28px', name: 'ছোট' },
                      { size: '3xl', label: '36px', name: 'মাঝারি' },
                      { size: '4xl', label: '44px', name: 'বড়' },
                      { size: '5xl', label: '52px', name: 'হিরো' },
                      { size: '6xl', label: '60px', name: 'জাম্বো' }
                    ].map(item => (
                      <button
                        key={item.size}
                        type="button"
                        data-font-size={item.size}
                        onClick={() => {
                          updateCurrentPage(p => ({
                            ...p,
                            sections: p.sections.map(s => s.id === activeSection.id ? {
                              ...s,
                              style: { ...s.style, titleFontSize: item.size }
                            } : s)
                          }));
                        }}
                        className={'py-1.5 px-1 rounded-xl text-[10px] font-bold border transition-all ' + (
                          (activeSection.style.titleFontSize || (activeSection.type === 'hero' ? '5xl' : '3xl')) === item.size
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        )}
                        title={item.name}
                      >
                        <div className="font-mono">{item.label}</div>
                        <div className="text-[9px] opacity-80">{item.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtitle / Body Font Size */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1.5">উপশিরোনাম / বডি সাইজ (Subtitle Size)</label>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {[
                      { size: 'xs', label: '13px', name: 'ছোট' },
                      { size: 'sm', label: '14px', name: 'সাধারণ' },
                      { size: 'base', label: '16px', name: 'মাঝারি' },
                      { size: 'lg', label: '18px', name: 'বড়' }
                    ].map(item => (
                      <button
                        key={item.size}
                        type="button"
                        data-font-size={item.size}
                        onClick={() => {
                          updateCurrentPage(p => ({
                            ...p,
                            sections: p.sections.map(s => s.id === activeSection.id ? {
                              ...s,
                              style: { ...s.style, subtitleFontSize: item.size }
                            } : s)
                          }));
                        }}
                        className={'py-1 rounded-xl text-xs font-bold border transition-all ' + (
                          (activeSection.style.subtitleFontSize || 'base') === item.size
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        )}
                      >
                        {item.name} ({item.label})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Weight */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1.5">ফন্ট ওয়েট (Font Weight)</label>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    {[
                      { weight: 'normal', label: 'নরমাল' },
                      { weight: 'semibold', label: 'সেমি-বোল্ড' },
                      { weight: 'bold', label: 'বোল্ড' },
                      { weight: 'black', label: 'এক্সট্রা বোল্ড' }
                    ].map(item => (
                      <button
                        key={item.weight}
                        type="button"
                        onClick={() => {
                          updateCurrentPage(p => ({
                            ...p,
                            sections: p.sections.map(s => s.id === activeSection.id ? {
                              ...s,
                              style: { ...s.style, fontWeight: item.weight as any }
                            } : s)
                          }));
                        }}
                        className={'py-1 rounded-xl text-[11px] font-bold border transition-all ' + (
                          (activeSection.style.fontWeight || (activeSection.type === 'hero' ? 'black' : 'bold')) === item.weight
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

          </div>
        </div>
      </div>

      {/* PAGE SETTINGS & SEO MODAL */}
      {showPageSettingsModal && currentPage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-black text-slate-900">পৃষ্ঠার সেটিংস ও এসইও মেটাডাটা</h3>
              </div>
              <button onClick={() => setShowPageSettingsModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">পৃষ্ঠার শিরোনাম</label>
                <input
                  type="text"
                  value={currentPage.title}
                  onChange={(e) => updateCurrentPage(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">স্লাগ / URL পাথ</label>
                <input
                  type="text"
                  disabled={currentPage.isSystemPage}
                  value={currentPage.slug}
                  onChange={(e) => updateCurrentPage(p => ({ ...p, slug: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 disabled:opacity-50"
                />
                {currentPage.isSystemPage && <span className="text-[10px] text-slate-400">সিস্টেম পৃষ্ঠার মূল পাথ পরিবর্তনযোগ্য নয়।</span>}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">এসইও মেটা টাইটেল (Title Tag)</label>
                <input
                  type="text"
                  value={currentPage.metaTitle || ''}
                  onChange={(e) => updateCurrentPage(p => ({ ...p, metaTitle: e.target.value }))}
                  placeholder="গুগল সার্চ ফলাফলের টাইটেল..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">এসইও মেটা ডিসক্রিপশন (Meta Description)</label>
                <textarea
                  rows={3}
                  value={currentPage.metaDescription || ''}
                  onChange={(e) => updateCurrentPage(p => ({ ...p, metaDescription: e.target.value }))}
                  placeholder="গুগল সার্চ ফলাফলের নিচে প্রদর্শিত বিবরণ..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentPage.status === 'published'}
                    onChange={(e) => updateCurrentPage(p => ({ ...p, status: e.target.checked ? 'published' : 'draft' }))}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>লাইভ ওয়েবসাইটে সক্রিয় রাখুন (Published)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPageSettingsModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                সম্পন্ন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVISION HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-black text-slate-900">সংস্করণ ইতিহাস ও রিস্টোর</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(currentPage?.revisions || []).map((rev) => (
                <div key={rev.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">সংস্করণ v{rev.version} ({rev.status})</span>
                    <span className="text-[10px] text-slate-500">{new Date(rev.savedAt).toLocaleString('bn-BD')}</span>
                  </div>
                  <button onClick={() => handleRestoreRevision(rev)} className="px-3 py-1 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded-lg font-bold text-[11px]">রিস্টোর</button>
                </div>
              ))}
              {(currentPage?.revisions || []).length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400">কোনো পূর্ববর্তী সংস্করণ পাওয়া যায়নি।</div>
              )}
            </div>
            <button onClick={() => setShowHistoryModal(false)} className="w-full py-2.5 bg-slate-100 text-slate-800 rounded-xl font-bold text-xs">বন্ধ করুন</button>
          </div>
        </div>
      )}

      {/* NEW PAGE MODAL */}
      {showNewPageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreatePage} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-900">নতুন ওয়েবসাইট পৃষ্ঠা তৈরি</h3>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">পৃষ্ঠার শিরোনাম *</label>
              <input type="text" required placeholder="উদা: নিয়োগ গাইডলাইন ২০২৬" value={newPageTitle} onChange={(e) => setNewPageTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">স্লাগ / URL পাথ *</label>
              <input type="text" required placeholder="/recruitment-guidelines" value={newPageSlug} onChange={(e) => setNewPageSlug(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900" />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowNewPageModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">বাতিল</button>
              <button type="submit" className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow">তৈরি করুন</button>
            </div>
          </form>
        </div>
      )}


      {/* Pre-Publish Quality Audit Modal */}
      {showPublishModal && currentPage && (
        <BuilderPublishModal
          isOpen={showPublishModal}
          page={currentPage}
          onClose={() => setShowPublishModal(false)}
          onConfirmPublish={async () => {
            await handleSavePage(true);
            setShowPublishModal(false);
          }}
          isPublishing={saveStatus?.includes('প্রকাশ') || false}
        />
      )}

      {showChromeSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-black text-slate-900">হেডার ও ফুটার থিম ও কন্টেন্ট কাস্টমাইজার</h3>
              </div>
              <button onClick={() => setShowChromeSettingsModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            {chromeSaveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>হেডার ও ফুটার সেটিংস সফলভাবে সংরক্ষিত ও লাইভ ওয়েবসাইটে আপডেট হয়েছে!</span>
              </div>
            )}

            {/* Modal Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setChromeModalTab('general')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  chromeModalTab === 'general' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                সাধারণ ও নোটিশ বার
              </button>
              <button
                type="button"
                onClick={() => setChromeModalTab('menu')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  chromeModalTab === 'menu' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                মেনু বার লিংক ({chromeMenuItems.length}টি)
              </button>
              <button
                type="button"
                onClick={() => setChromeModalTab('auth-buttons')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  chromeModalTab === 'auth-buttons' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                বাটন ও অথ কন্ট্রোল
              </button>
              <button
                type="button"
                onClick={() => setChromeModalTab('footer')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  chromeModalTab === 'footer' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ফুটার ও কলাম লিংক ({chromeFooterColumns.length}টি)
              </button>
            </div>

            {/* TAB 1: GENERAL & BANNER */}
            {chromeModalTab === 'general' && (
              <div className="space-y-4 text-xs">
                {/* Site Name & Tagline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">ওয়েবসাইট ব্র্যান্ড নাম</label>
                    <input
                      type="text"
                      value={chromeSiteName}
                      onChange={(e) => setChromeSiteName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                      placeholder="চাকরি সেবা (Chakri Sheba)"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">ওয়েবসাইট ট্যাগলাইন / স্লোগান</label>
                    <input
                      type="text"
                      value={chromeSiteTagline}
                      onChange={(e) => setChromeSiteTagline(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      placeholder="নিউজ ও ১০০% নির্ভুল আবেদন পোর্টাল"
                    />
                  </div>
                </div>

                {/* Logo URL */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">হেডার লোগো ইমেজ URL (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={chromeLogoUrl}
                    onChange={(e) => setChromeLogoUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-[11px]"
                    placeholder="https://... বা /icons/icon-192x192.png"
                  />
                </div>

                {/* Announcement Top Banner */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-800">⚡ টপ নোটিশ বার (Announcement Banner)</span>
                    <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={chromeAnnouncementEnabled}
                        onChange={(e) => setChromeAnnouncementEnabled(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>সক্রিয় রাখুন</span>
                    </label>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">নোটিশ বার্তা টেক্সট</label>
                    <input
                      type="text"
                      value={chromeAnnouncementText}
                      onChange={(e) => setChromeAnnouncementText(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">নোটিশ ক্লিক লিঙ্ক</label>
                    <input
                      type="text"
                      value={chromeAnnouncementUrl}
                      onChange={(e) => setChromeAnnouncementUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-[11px]"
                      placeholder="/jobs"
                    />
                  </div>
                </div>

                {/* WhatsApp Hotline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">হোয়াটসঅ্যাপ হেল্পলাইন নম্বর</label>
                    <input
                      type="text"
                      value={chromeWhatsapp}
                      onChange={(e) => setChromeWhatsapp(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                      placeholder="8801774366643"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">হোয়াটসঅ্যাপ বাটন টেক্সট</label>
                    <input
                      type="text"
                      value={chromeWhatsappButtonText}
                      onChange={(e) => setChromeWhatsappButtonText(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                      placeholder="WhatsApp"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MENU BAR LINKS */}
            {chromeModalTab === 'menu' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h4 className="text-xs font-black text-slate-800">হেডার নেভিগেশন মেনু আইটেমসমূহ</h4>
                    <p className="text-[11px] text-slate-500">মেনুর ক্রম পরিবর্তন, নাম ও ইউআরএল এডিট এবং নতুন মেনু লিংক যুক্ত করুন</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newItem = {
                        id: `menu-${Date.now()}`,
                        label: 'নতুন মেনু',
                        href: '/jobs'
                      };
                      setChromeMenuItems(prev => [...prev, newItem]);
                    }}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ মেনু আইটেম যোগ</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {chromeMenuItems.map((item, idx) => {
                    const isExpanded = chromeExpandedDropdownId === item.id;
                    const dropdownCount = Array.isArray(item.dropdown) ? item.dropdown.length : 0;

                    return (
                      <div key={item.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 font-mono">#{idx + 1} মেনু লিংক</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                const arr = [...chromeMenuItems];
                                const temp = arr[idx];
                                arr[idx] = arr[idx - 1];
                                arr[idx - 1] = temp;
                                setChromeMenuItems(arr);
                              }}
                              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                              title="উপরে নিন"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === chromeMenuItems.length - 1}
                              onClick={() => {
                                const arr = [...chromeMenuItems];
                                const temp = arr[idx];
                                arr[idx] = arr[idx + 1];
                                arr[idx + 1] = temp;
                                setChromeMenuItems(arr);
                              }}
                              className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                              title="নিচে নিন"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setChromeMenuItems(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                          <div className="sm:col-span-5">
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">মেনু নাম / লেবেল</label>
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => {
                                const arr = [...chromeMenuItems];
                                arr[idx] = { ...arr[idx], label: e.target.value };
                                setChromeMenuItems(arr);
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
                                const arr = [...chromeMenuItems];
                                arr[idx] = { ...arr[idx], href: e.target.value };
                                setChromeMenuItems(arr);
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">ব্যাজ (ঐচ্ছিক)</label>
                            <input
                              type="text"
                              value={item.badge || ''}
                              onChange={(e) => {
                                const arr = [...chromeMenuItems];
                                arr[idx] = { ...arr[idx], badge: e.target.value };
                                setChromeMenuItems(arr);
                              }}
                              placeholder="হট / নতুন"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-800"
                            />
                          </div>
                        </div>

                        {/* Dropdown items manager */}
                        <div className="pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setChromeExpandedDropdownId(isExpanded ? null : item.id)}
                              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                            >
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              <span>ড্রপডাউন সাব-মেনু ({dropdownCount}টি)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const arr = [...chromeMenuItems];
                                const currentDropdown = arr[idx].dropdown || [];
                                arr[idx] = {
                                  ...arr[idx],
                                  dropdown: [...currentDropdown, { label: 'নতুন সাব-লিংক', href: '/jobs' }]
                                };
                                setChromeMenuItems(arr);
                                setChromeExpandedDropdownId(item.id);
                              }}
                              className="text-[10px] font-bold text-emerald-800 bg-white hover:bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>সাব-লিংক যোগ</span>
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="mt-2 pl-3 border-l-2 border-emerald-500 space-y-2">
                              {dropdownCount === 0 ? (
                                <p className="text-[11px] text-slate-400 py-1 italic">কোনো সাব-মেনু ড্রপডাউন লিংক নেই।</p>
                              ) : (
                                (item.dropdown || []).map((sub, sIdx) => (
                                  <div key={sIdx} className="grid grid-cols-12 gap-1.5 items-center">
                                    <input
                                      type="text"
                                      value={sub.label}
                                      onChange={(e) => {
                                        const arr = [...chromeMenuItems];
                                        const drops = [...(arr[idx].dropdown || [])];
                                        drops[sIdx] = { ...drops[sIdx], label: e.target.value };
                                        arr[idx] = { ...arr[idx], dropdown: drops };
                                        setChromeMenuItems(arr);
                                      }}
                                      placeholder="সাব-মেনু নাম"
                                      className="col-span-6 px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                                    />
                                    <input
                                      type="text"
                                      value={sub.href}
                                      onChange={(e) => {
                                        const arr = [...chromeMenuItems];
                                        const drops = [...(arr[idx].dropdown || [])];
                                        drops[sIdx] = { ...drops[sIdx], href: e.target.value };
                                        arr[idx] = { ...arr[idx], dropdown: drops };
                                        setChromeMenuItems(arr);
                                      }}
                                      placeholder="/jobs"
                                      className="col-span-5 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const arr = [...chromeMenuItems];
                                        const drops = (arr[idx].dropdown || []).filter((_, i) => i !== sIdx);
                                        arr[idx] = { ...arr[idx], dropdown: drops };
                                        setChromeMenuItems(arr);
                                      }}
                                      className="col-span-1 text-red-500 hover:text-red-700 text-xs font-bold text-center cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: AUTH BUTTONS & WIDGETS (Without Login vs After Login) */}
            {chromeModalTab === 'auth-buttons' && (
              <div className="space-y-4 text-xs max-h-[420px] overflow-y-auto pr-1">
                
                {/* 1. Guest Buttons (Without Login) */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="font-black text-slate-800 text-xs">গেস্ট / ভিজিটর বাটন (Without Login)</h4>
                      <p className="text-[11px] text-slate-500">লগইন ছাড়া সাধারণ দর্শনার্থীদের হেডারের ডানপাশে কোন কোন বাটন প্রদর্শিত হবে</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">পাবলিক স্টেট</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Free Register Button */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">ফ্রি রেজিস্ট্রেশন CTA বাটন</span>
                        <input
                          type="checkbox"
                          checked={chromeGuestButtons.showRegister}
                          onChange={(e) => setChromeGuestButtons({ ...chromeGuestButtons, showRegister: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={chromeGuestButtons.registerText}
                        onChange={(e) => setChromeGuestButtons({ ...chromeGuestButtons, registerText: e.target.value })}
                        placeholder="ফ্রি রেজিস্ট্রেশন"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-800"
                      />
                    </div>

                    {/* Login Button */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">লগইন বাটন</span>
                        <input
                          type="checkbox"
                          checked={chromeGuestButtons.showLogin}
                          onChange={(e) => setChromeGuestButtons({ ...chromeGuestButtons, showLogin: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={chromeGuestButtons.loginText}
                        onChange={(e) => setChromeGuestButtons({ ...chromeGuestButtons, loginText: e.target.value })}
                        placeholder="লগইন"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>

                    {/* Track Application Button */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">আবেদন ট্র্যাক বাটন</span>
                        <input
                          type="checkbox"
                          checked={chromeGuestButtons.showTrackApplication}
                          onChange={(e) => setChromeGuestButtons({ ...chromeGuestButtons, showTrackApplication: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={chromeGuestButtons.trackApplicationText}
                        onChange={(e) => setChromeGuestButtons({ ...chromeGuestButtons, trackApplicationText: e.target.value })}
                        placeholder="আবেদন ট্র্যাক"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>

                    {/* WhatsApp Support Button */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">হোয়াটসঅ্যাপ হেল্প বাটন</span>
                        <input
                          type="checkbox"
                          checked={chromeGuestButtons.showWhatsApp}
                          onChange={(e) => setChromeGuestButtons({ ...chromeGuestButtons, showWhatsApp: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={chromeGuestButtons.whatsAppText}
                        onChange={(e) => setChromeGuestButtons({ ...chromeGuestButtons, whatsAppText: e.target.value })}
                        placeholder="WhatsApp"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. User Widgets (After Login) */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="font-black text-slate-800 text-xs">লগইনকৃত ক্যান্ডিডেট উইজেট (After Login)</h4>
                      <p className="text-[11px] text-slate-500">প্রার্থী লগইন করার পর হেডারে ড্যাশবোর্ড, ওয়ালেট ও নোটিফিকেশন প্রদর্শন</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">অথ স্টেট</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Dashboard Button */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">ড্যাশবোর্ড ডিরেক্ট বাটন</span>
                        <input
                          type="checkbox"
                          checked={chromeUserWidgets.showDashboardButton}
                          onChange={(e) => setChromeUserWidgets({ ...chromeUserWidgets, showDashboardButton: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={chromeUserWidgets.dashboardButtonText}
                        onChange={(e) => setChromeUserWidgets({ ...chromeUserWidgets, dashboardButtonText: e.target.value })}
                        placeholder="ড্যাশবোর্ড"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>

                    {/* Wallet Balance Widget */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">ওয়ালেট ব্যালেন্স উইজেট (৳X)</span>
                        <input
                          type="checkbox"
                          checked={chromeUserWidgets.showWalletBalance}
                          onChange={(e) => setChromeUserWidgets({ ...chromeUserWidgets, showWalletBalance: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">সক্রিয় রাখলে প্রার্থীর বর্তমান ওয়ালেট ব্যালেন্স হেডারে ইনস্ট্যান্ট দেখাবে।</p>
                    </div>

                    {/* Notification Bell Widget */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">নোটিফিকেশন ঘণ্টা আইকন</span>
                        <input
                          type="checkbox"
                          checked={chromeUserWidgets.showNotificationBell}
                          onChange={(e) => setChromeUserWidgets({ ...chromeUserWidgets, showNotificationBell: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">নতুন সার্কুলার ও আবেদন আপডেটের জন্য লাল ব্যাজ সহ ঘণ্টা আইকন।</p>
                    </div>

                    {/* Profile Avatar Dropdown */}
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">প্রোফাইল অ্যাভাটার ও ড্রপডাউন</span>
                        <input
                          type="checkbox"
                          checked={chromeUserWidgets.showAvatarDropdown}
                          onChange={(e) => setChromeUserWidgets({ ...chromeUserWidgets, showAvatarDropdown: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">প্রোফাইল, আবেদনসমূহ, ভল্ট ও লগআউট মেনু ড্রপডাউন।</p>
                    </div>
                  </div>
                </div>

                {/* 3. Sticky Header Behavior */}
                <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">স্টিকি হেডার (Sticky Navbar)</span>
                    <span className="text-[11px] text-slate-500">স্ক্রোল করার সময় মেনু বার সবসময় স্ক্রিনের শীর্ষে আটকে থাকবে</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={chromeStickyHeader}
                    onChange={(e) => setChromeStickyHeader(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>

              </div>
            )}

            {/* TAB 4: FOOTER COLUMNS & LEGAL/ABOUT SETTINGS */}
            {chromeModalTab === 'footer' && (
              <div className="space-y-4 text-xs">
                {/* 1. Header with Add Column CTA */}
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h4 className="text-xs font-black text-slate-800">ফুটার নেভিগেশন কলাম ও লিংকসমূহ</h4>
                    <p className="text-[11px] text-slate-500">ফুটারের কলাম শিরোনাম, লিংকসমূহ যোগ/সম্পাদনা/ডিলিট এবং পুনর্বিন্যাস করুন</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newCol = {
                        id: `col-${Date.now()}`,
                        title: 'নতুন কলাম',
                        links: [{ label: 'নতুন লিংক', url: '/jobs' }]
                      };
                      setChromeFooterColumns(prev => [...prev, newCol]);
                      setChromeExpandedFooterColId(newCol.id);
                    }}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ নতুন কলাম যোগ</span>
                  </button>
                </div>

                {/* 2. Column List */}
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                  {chromeFooterColumns.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-slate-500">
                      কোনো ফুটার কলাম নেই। &quot;+ নতুন কলাম যোগ&quot; বাটনে ক্লিক করে কলাম যুক্ত করুন।
                    </div>
                  ) : (
                    chromeFooterColumns.map((col, cIdx) => {
                      const isExpanded = chromeExpandedFooterColId === (col.id || `col-${cIdx}`);
                      const linksCount = Array.isArray(col.links) ? col.links.length : 0;

                      return (
                        <div key={col.id || cIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                          {/* Column Action Bar */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 font-mono">#{cIdx + 1} ফুটার কলাম</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={cIdx === 0}
                                onClick={() => {
                                  const cols = [...chromeFooterColumns];
                                  const temp = cols[cIdx];
                                  cols[cIdx] = cols[cIdx - 1];
                                  cols[cIdx - 1] = temp;
                                  setChromeFooterColumns(cols);
                                }}
                                className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                                title="কলাম উপরে নিন"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={cIdx === chromeFooterColumns.length - 1}
                                onClick={() => {
                                  const cols = [...chromeFooterColumns];
                                  const temp = cols[cIdx];
                                  cols[cIdx] = cols[cIdx + 1];
                                  cols[cIdx + 1] = temp;
                                  setChromeFooterColumns(cols);
                                }}
                                className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                                title="কলাম নিচে নিন"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`আপনি কি "${col.title}" কলামটি মুছে ফেলতে চান?`)) {
                                    setChromeFooterColumns(prev => prev.filter((_, i) => i !== cIdx));
                                  }
                                }}
                                className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                                title="কলাম মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Column Title Input */}
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 block mb-0.5">কলাম শিরোনাম</label>
                            <input
                              type="text"
                              value={col.title}
                              onChange={(e) => {
                                const cols = [...chromeFooterColumns];
                                cols[cIdx] = { ...cols[cIdx], title: e.target.value };
                                setChromeFooterColumns(cols);
                              }}
                              placeholder="যেমন: চাকরি ও পরীক্ষা"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                            />
                          </div>

                          {/* Links in Column */}
                          <div className="pt-2 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => setChromeExpandedFooterColId(isExpanded ? null : (col.id || `col-${cIdx}`))}
                                className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                              >
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                <span>কলামের লিংকসমূহ ({linksCount}টি)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const cols = [...chromeFooterColumns];
                                  cols[cIdx] = {
                                    ...cols[cIdx],
                                    links: [...(cols[cIdx].links || []), { label: 'নতুন লিংক', url: '/jobs' }]
                                  };
                                  setChromeFooterColumns(cols);
                                  setChromeExpandedFooterColId(col.id || `col-${cIdx}`);
                                }}
                                className="text-[10px] font-bold text-emerald-800 bg-white hover:bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>+ লিংক যোগ</span>
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="mt-2 pl-3 border-l-2 border-emerald-500 space-y-1.5">
                                {linksCount === 0 ? (
                                  <p className="text-[11px] text-slate-400 py-1 italic">কোনো লিংক যুক্ত করা হয়নি।</p>
                                ) : (
                                  col.links.map((link, lIdx) => (
                                    <div key={lIdx} className="grid grid-cols-12 gap-1.5 items-center bg-white p-1.5 rounded-lg border border-slate-200">
                                      <input
                                        type="text"
                                        value={link.label}
                                        onChange={(e) => {
                                          const cols = [...chromeFooterColumns];
                                          const lnks = [...cols[cIdx].links];
                                          lnks[lIdx] = { ...lnks[lIdx], label: e.target.value };
                                          cols[cIdx] = { ...cols[cIdx], links: lnks };
                                          setChromeFooterColumns(cols);
                                        }}
                                        placeholder="লিংক নাম"
                                        className="col-span-6 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-semibold"
                                      />
                                      <input
                                        type="text"
                                        value={link.url}
                                        onChange={(e) => {
                                          const cols = [...chromeFooterColumns];
                                          const lnks = [...cols[cIdx].links];
                                          lnks[lIdx] = { ...lnks[lIdx], url: e.target.value };
                                          cols[cIdx] = { ...cols[cIdx], links: lnks };
                                          setChromeFooterColumns(cols);
                                        }}
                                        placeholder="/path"
                                        className="col-span-5 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-mono"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const cols = [...chromeFooterColumns];
                                          cols[cIdx] = {
                                            ...cols[cIdx],
                                            links: cols[cIdx].links.filter((_, i) => i !== lIdx)
                                          };
                                          setChromeFooterColumns(cols);
                                        }}
                                        className="col-span-1 text-red-500 hover:text-red-700 text-xs font-bold text-center cursor-pointer"
                                        title="মুছে ফেলুন"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 3. About Paragraph */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="font-bold text-slate-700 block mb-1">ফুটার পরিচিতি টেক্সট (About Paragraph)</label>
                  <textarea
                    rows={3}
                    value={chromeFooterAbout}
                    onChange={(e) => setChromeFooterAbout(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                    placeholder="বাংলাদেশের চাকরিপ্রার্থীদের বিশ্বস্ত ডিজিটাল প্ল্যাটফর্ম..."
                  />
                </div>

                {/* 4. Legal Disclaimer */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ফুটার দায়-অস্বীকার ও সতর্কতা (Disclaimer)</label>
                  <textarea
                    rows={2}
                    value={chromeFooterDisclaimer}
                    onChange={(e) => setChromeFooterDisclaimer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
                    placeholder="সতর্কতা: চাকরি সেবা কোনো সরকারি বা নিয়োগকারী প্রতিষ্ঠান নয়..."
                  />
                </div>

                {/* 5. Copyright Text */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">কপিরাইট নোটিশ (Copyright Text)</label>
                  <input
                    type="text"
                    value={chromeCopyrightText}
                    onChange={(e) => setChromeCopyrightText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold"
                    placeholder="© ২০২৬ চাকরিসেবা BD (ChakriSheba.com) • সর্বস্বত্ব সংরক্ষিত।"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowChromeSettingsModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isSavingChrome}
                onClick={handleSaveChromeSettings}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSavingChrome ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>হেডার ও ফুটার পরিবর্তন সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
