'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Briefcase,
  Bot,
  Users,
  FileText,
  Layout,
  CreditCard,
  Search,
  Bell,
  BarChart3,
  ShieldCheck,
  Activity,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export interface NavSubItem {
  id: string;
  label: string;
  badge?: string | number;
}

export interface NavMainItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  hasStatusDot?: boolean;
  subItems?: NavSubItem[];
}

interface AdminSidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onLogout?: () => void;
  adminEmail?: string;
  adminName?: string;
}

export const ADMIN_NAV_ITEMS: NavMainItem[] = [
  // ০১. ড্যাশবোর্ড ও ওভারভিউ (৪টি সাব-ট্যাব)
  {
    id: 'dashboard',
    label: 'ড্যাশবোর্ড ও ওভারভিউ',
    icon: LayoutDashboard,
    subItems: [
      { id: 'dashboard', label: 'মূল ড্যাশবোর্ড ও KPI' },
      { id: 'analytics-center', label: 'অ্যানালিটিক্স ও BI' },
      { id: 'report-builder', label: 'রিপোর্ট এক্সপোর্ট' },
      { id: 'data-quality-inspector', label: 'ডাটা কোয়ালিটি ও অডিট' }
    ]
  },
  // ০২. আবেদন ও অর্ডার হাব (৫টি সাব-ট্যাব)
  {
    id: 'all-applications',
    label: 'আবেদন ও অর্ডার হাব',
    icon: FileText,
    badge: 'আবেদন',
    subItems: [
      { id: 'all-applications', label: 'সকল আবেদন তালিকা' },
      { id: 'payment-verification', label: 'পেমেন্ট ভেরিফিকেশন কিউ' },
      { id: 'processing-queue', label: 'টেলিটক প্রসেসিং কিউ' },
      { id: 'completed-rejected', label: 'সম্পন্ন ও বাতিল আবেদন' },
      { id: 'documents', label: 'অ্যাপ্লিক্যান্ট ডকুমেন্টস ভল্ট' }
    ]
  },
  // ০৩. সার্কুলার ও নিয়োগ হাব (৭টি সাব-ট্যাব)
  {
    id: 'circulars',
    label: 'সার্কুলার ও নিয়োগ হাব',
    icon: Briefcase,
    subItems: [
      { id: 'circulars', label: 'সব সার্কুলার তালিকা' },
      { id: 'create-circular', label: 'নতুন চাকরি যোগ ও এডিট' },
      { id: 'publishing-center', label: 'পাবলিশিং ও শিডিউলার সেন্টার' },
      { id: 'category-search-manager', label: 'ক্যাটাগরি ও সার্চ ট্যাগ' },
      { id: 'job-feed-manager', label: 'জব ফিড ও RSS সিন্ডিকেশন' },
      { id: 'deadline-alert-manager', label: 'ডেডলাইন অ্যালার্ট ম্যানেজার' },
      { id: 'smart-job-matching', label: 'স্মার্ট জব ম্যাচিং রুলস' }
    ]
  },
  // ০৪. অটোমেশন ও লাইভ এজেন্ট (৫টি সাব-ট্যাব)
  {
    id: 'gemini-browser-spider',
    label: 'অটোমেশন ও লাইভ এজেন্ট',
    icon: Bot,
    badge: 'LIVE',
    badgeColor: 'bg-emerald-600 text-white',
    subItems: [
      { id: 'gemini-browser-spider', label: 'লাইভ ব্রাউজার স্ক্রিন ও অটোমেশন' },
      { id: 'source-monitoring', label: 'সোর্স স্ক্র্যাপার মনিটরিং' },
      { id: 'imported-drafts', label: 'খসড়া ও অনুমোদন কিউ' },
      { id: 'automation-hub', label: 'সেন্ট্রাল অটোমেশন ম্যানেজার' },
      { id: 'testing-spider', label: 'টেস্টিং স্পাইডার স্যান্ডবক্স' }
    ]
  },
  // ০৫. প্রার্থী ও প্রতিষ্ঠান হাব (৭টি সাব-ট্যাব)
  {
    id: 'candidate-directory',
    label: 'প্রার্থী ও প্রতিষ্ঠান হাব',
    icon: Users,
    subItems: [
      { id: 'candidate-directory', label: 'প্রার্থী ডিরেক্টরি' },
      { id: 'candidate-details', label: 'প্রার্থীর পূর্ণাঙ্গ প্রোফাইল' },
      { id: 'account-status', label: 'অ্যাকাউন্ট স্ট্যাটাস ও নিয়ন্ত্রণ' },
      { id: 'eligibility-rules', label: 'যোগ্যতা ফিল্টার রুলস' },
      { id: 'company-directory', label: 'প্রতিষ্ঠান ডিরেক্টরি' },
      { id: 'employer-verification', label: 'নিয়োগকারী যাচাইকরণ' },
      { id: 'company-jobs', label: 'প্রতিষ্ঠানভিত্তিক চাকরি' }
    ]
  },
  // ০৬. ফিন্যান্স ও ডিসকাউন্ট (৬টি সাব-ট্যাব)
  {
    id: 'transactions',
    label: 'ফিন্যান্স ও ডিসকাউন্ট',
    icon: CreditCard,
    subItems: [
      { id: 'transactions', label: 'ট্রানজেকশন তালিকা ও লেজার' },
      { id: 'invoices', label: 'ইনভয়েস ভাউচার' },
      { id: 'service-fees', label: 'সার্ভিস ফি কনফিগারেশন' },
      { id: 'coupons-discounts', label: 'কুপন ও ডিসকাউন্ট কোড' },
      { id: 'raffle-campaigns', label: 'র্যাফেল ড্র ক্যাম্পেইন' },
      { id: 'platform-operations', label: 'অপারেশনাল খরচ অপটিমাইজেশন' }
    ]
  },
  // ০৭. ওয়েবসাইট CMS ও এসইও (৭টি সাব-ট্যাব)
  {
    id: 'content-studio',
    label: 'ওয়েবসাইট CMS ও এসইও',
    icon: Layout,
    subItems: [
      { id: 'content-studio', label: 'কন্টেন্ট ও এসইও স্টুডিও' },
      { id: 'builder', label: 'ভিজ্যুয়াল ড্র্যাগ-অ্যান্ড-ড্রপ বিল্ডার' },
      { id: 'pages-sections', label: 'পেইজ ও সেকশন ম্যানেজমেন্ট' },
      { id: 'header-footer', label: 'হেডার ও ফুটার থিম কাস্টমাইজার' },
      { id: 'media-library', label: 'মিডিয়া লাইব্রেরি ও ফাইল ম্যানেজার' },
      { id: 'seo-meta', label: 'মেটা ও স্কিমা মার্কআপ' },
      { id: 'revisions', label: 'রিভিশন ও হিস্ট্রি ট্র্যাকিং' }
    ]
  },
  // ০৮. যোগাযোগ ও মেসেজিং (৫টি সাব-ট্যাব)
  {
    id: 'notifications',
    label: 'যোগাযোগ ও মেসেজিং',
    icon: Bell,
    badge: 'টিকেট',
    badgeColor: 'bg-rose-500 text-white',
    subItems: [
      { id: 'job-reports', label: '🚨 ভুয়া সার্কুলার ও অভিযোগ সেল', badge: 'অভিযোগ' },
      { id: 'support-tickets', label: '🎧 সাপোর্ট টিকেট ও হেল্পডেস্ক', badge: 'টিকেট' },
      { id: 'notifications', label: 'নোটিফিকেশন ও ব্রডকাস্ট' },
      { id: 'sms-status', label: 'এসএমএস গেটওয়ে ও ব্যালেন্স' },
      { id: 'templates-delivery', label: 'মেসেজ টেমপ্লেট ও ডেলিভারি লগ' }
    ]
  },
  // ০৯. সিস্টেম ও সিকিউরিটি (৫টি সাব-ট্যাব)
  {
    id: 'settings',
    label: 'সিস্টেম ও সিকিউরিটি',
    icon: Settings,
    hasStatusDot: true,
    subItems: [
      { id: 'system-health', label: 'সিস্টেম স্বাস্থ্য ও লাইভ পিং' },
      { id: 'settings', label: 'প্ল্যাটফর্ম গ্লোবাল সেটিংস' },
      { id: 'staff-roles', label: 'স্টাফ ও RBAC রোলস' },
      { id: 'audit-logs', label: 'অডিট ও অ্যাক্টিভিটি লগ' },
      { id: 'backup-diagnostics', label: 'ব্যাকআপ ও স্ন্যাপশট রিস্টোর' }
    ]
  }
];

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onLogout,
  adminEmail = 'admin@chakrisheba.com',
  adminName = 'সুপার অ্যাডমিন'
}: AdminSidebarProps) {
  const ALIAS_TO_MAIN: Record<string, string> = {
    'published-jobs': 'circulars',
    'pending-approval': 'gemini-browser-spider',
    'archived-jobs': 'circulars',
    'job-locations': 'circulars',
    'new-candidates': 'candidate-directory',
    'candidate-cv': 'all-applications',
    'suspended-accounts': 'candidate-directory',
    'application-history': 'all-applications',
    'scraping-jobs': 'gemini-browser-spider',
    'pdf-processing': 'gemini-browser-spider',
    'duplicate-detection': 'dashboard',
    'failed-jobs': 'gemini-browser-spider',
    'schema-markup': 'content-studio',
    'sitemap-settings': 'content-studio',
  };

  // Find which main menu item currently contains the activeTab
  const getInitialOpenMenu = () => {
    for (const item of ADMIN_NAV_ITEMS) {
      if (item.id === activeTab || item.subItems?.some(s => s.id === activeTab)) {
        return item.id;
      }
    }
    const fallbackId = ALIAS_TO_MAIN[activeTab];
    if (fallbackId) return fallbackId;
    return 'dashboard';
  };

  const [openMenu, setOpenMenu] = useState<string | null>(getInitialOpenMenu());

  // Keep accordion in sync whenever activeTab changes
  useEffect(() => {
    for (const item of ADMIN_NAV_ITEMS) {
      if (item.id === activeTab || item.subItems?.some(s => s.id === activeTab)) {
        setOpenMenu(item.id);
        return;
      }
    }
    const fallbackId = ALIAS_TO_MAIN[activeTab];
    if (fallbackId) {
      setOpenMenu(fallbackId);
    }
  }, [activeTab]);

  const handleMainMenuClick = (item: NavMainItem) => {
    if (item.subItems && item.subItems.length > 0) {
      if (openMenu === item.id) {
        setOpenMenu(null);
      } else {
        setOpenMenu(item.id);
        onSelectTab(item.id);
      }
    } else {
      onSelectTab(item.id);
    }
  };

  const isItemActive = (item: NavMainItem) => {
    if (activeTab === item.id) return true;
    if (item.subItems && item.subItems.some(s => s.id === activeTab)) return true;
    const parentId = ALIAS_TO_MAIN[activeTab];
    if (parentId && parentId === item.id) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0b0f19] text-slate-200 border-r border-slate-800/80 transition-all duration-300 ease-in-out font-solaiman ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {/* Top Brand Logo Section */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800/80 bg-[#070a12]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30 flex-shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white truncate">
                    চাকরি সেবা
                  </span>
                </div>
                <span className="text-2xs text-slate-400 font-medium truncate">
                  সরকারি চাকরির তথ্য ও সেবা
                </span>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-600 text-white tracking-wide">
                    অ্যাডমিন প্যানেল
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            title="মেনু বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            const isOpen = openMenu === item.id;
            const hasChildren = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.id} className="relative">
                <button
                  type="button"
                  onClick={() => handleMainMenuClick(item)}
                  title={item.label}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    active
                      ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-900/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                        active ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center gap-1.5">
                      {item.hasStatusDot && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      {item.badge && (
                        <span
                          className={`text-2xs font-bold px-1.5 py-0.5 rounded-full ${
                            item.badgeColor || 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {hasChildren && (
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-white' : ''
                          }`}
                        />
                      )}
                    </div>
                  )}
                </button>

                {/* Submenu Accordion */}
                {!isCollapsed && hasChildren && isOpen && (
                  <div className="mt-1 ml-4 pl-3.5 border-l border-slate-800/90 space-y-1 py-1">
                    {item.subItems!.map((sub) => {
                      const isSubActive = activeTab === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => {
                            onSelectTab(sub.id);
                            if (window.innerWidth < 1024) onCloseMobile();
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                            isSubActive
                              ? 'text-indigo-400 bg-indigo-950/40 font-semibold'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                        >
                          <span className="truncate">{sub.label}</span>
                          {sub.badge && (
                            <span className="text-3xs font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom User Card Section */}
        <div className="p-3 border-t border-slate-800/80 bg-[#070a12]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow">
                সি এস
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white truncate leading-snug">
                    {adminName}
                  </span>
                  <span className="text-2xs text-slate-400 truncate leading-snug">
                    {adminEmail}
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                type="button"
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors flex-shrink-0"
                title="লগআউট করুন"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

