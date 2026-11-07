'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Briefcase,
  Bot,
  Users,
  FileText,
  Layout,
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
  {
    id: 'dashboard',
    label: 'ড্যাশবোর্ড',
    icon: LayoutDashboard,
    subItems: [
      { id: 'dashboard', label: 'মূল ড্যাশবোর্ড ও KPI' },
      { id: 'analytics-center', label: 'অ্যানালিটিক্স ও BI' },
      { id: 'report-builder', label: 'রিপোর্ট এক্সপোর্ট' },
      { id: 'data-quality-inspector', label: 'ডাটা কোয়ালিটি ও অডিট' }
    ]
  },
  {
    id: 'circulars',
    label: 'চাকরি ব্যবস্থাপনা',
    icon: Briefcase,
    subItems: [
      { id: 'circulars', label: 'সব চাকরি' },
      { id: 'create-circular', label: 'নতুন চাকরি যোগ করুন' },
      { id: 'published-jobs', label: 'প্রকাশিত চাকরি' },
      { id: 'imported-drafts', label: 'খসড়া চাকরি' },
      { id: 'pending-approval', label: 'অনুমোদনের অপেক্ষায়' },
      { id: 'deadline-alert-manager', label: 'মেয়াদোত্তীর্ণ চাকরি' },
      { id: 'archived-jobs', label: 'সংরক্ষিত চাকরি' },
      { id: 'job-feed-manager', label: 'সংশোধনী ও নতুন বিজ্ঞপ্তি' },
      { id: 'category-search-manager', label: 'চাকরির ক্যাটাগরি' },
      { id: 'company-directory', label: 'প্রতিষ্ঠান ব্যবস্থাপনা' },
      { id: 'job-locations', label: 'চাকরির অবস্থান' }
    ]
  },
  {
    id: 'gemini-browser-spider',
    label: 'চাকরি সংগ্রহ ও অটোমেশন',
    icon: Bot,
    subItems: [
      { id: 'automation-hub', label: 'অটোমেশন ড্যাশবোর্ড' },
      { id: 'gemini-browser-spider', label: 'লোকাল ব্রাউজার ওয়ার্কার' },
      { id: 'testing-spider', label: 'ব্রাউজার স্পাইডার' },
      { id: 'source-monitoring', label: 'সোর্স রেজিস্ট্রি ও মনিটরিং' },
      { id: 'scraping-jobs', label: 'সংগ্রহের কাজ' },
      { id: 'imported-drafts', label: 'সংগৃহীত চাকরি ও খসড়া' },
      { id: 'pdf-processing', label: 'PDF প্রসেসিং' },
      { id: 'data-quality-inspector', label: 'তথ্য যাচাই' },
      { id: 'duplicate-detection', label: 'ডুপ্লিকেট শনাক্তকরণ' },
      { id: 'failed-jobs', label: 'ব্যর্থ কাজ ও ইতিহাস' }
    ]
  },
  {
    id: 'candidate-directory',
    label: 'প্রার্থীদের ব্যবস্থাপনা',
    icon: Users,
    subItems: [
      { id: 'candidate-directory', label: 'সব প্রার্থী' },
      { id: 'new-candidates', label: 'নতুন নিবন্ধিত প্রার্থী' },
      { id: 'candidate-details', label: 'প্রার্থীর প্রোফাইল' },
      { id: 'eligibility-rules', label: 'শিক্ষাগত তথ্য ও যোগ্যতা' },
      { id: 'candidate-cv', label: 'সিভি ব্যবস্থাপনা' },
      { id: 'documents', label: 'ডকুমেন্ট ভল্ট' },
      { id: 'account-status', label: 'অ্যাকাউন্ট ব্যবস্থাপনা' },
      { id: 'suspended-accounts', label: 'স্থগিত অ্যাকাউন্ট' }
    ]
  },
  {
    id: 'all-applications',
    label: 'আবেদন ব্যবস্থাপনা',
    icon: FileText,
    subItems: [
      { id: 'all-applications', label: 'সব আবেদন' },
      { id: 'processing-queue', label: 'নতুন আবেদন ও কিউ' },
      { id: 'payment-verification', label: 'আবেদন ট্র্যাকিং ও পেমেন্ট' },
      { id: 'completed-rejected', label: 'আবেদনের অবস্থা' },
      { id: 'application-history', label: 'আবেদন ইতিহাস' },
      { id: 'report-builder', label: 'আবেদন রিপোর্ট' }
    ]
  },
  {
    id: 'content-studio',
    label: 'ওয়েবসাইট CMS',
    icon: Layout,
    subItems: [
      { id: 'pages-sections', label: 'সব পেজ ও সেকশন' },
      { id: 'builder', label: 'ভিজ্যুয়াল পেজ বিল্ডার' },
      { id: 'header-footer', label: 'হেডার ও ফুটার থিম' },
      { id: 'media-library', label: 'মিডিয়া লাইব্রেরি' },
      { id: 'revisions', label: 'পেজ রিভিশন ও হিস্ট্রি' }
    ]
  },
  {
    id: 'seo-meta',
    label: 'এসইও ব্যবস্থাপনা',
    icon: Search,
    subItems: [
      { id: 'seo-meta', label: 'SEO ড্যাশবোর্ড' },
      { id: 'pages-sections', label: 'পেজের SEO ও মেটা' },
      { id: 'schema-markup', label: 'Schema Markup' },
      { id: 'sitemap-settings', label: 'Sitemap ও Robots' }
    ]
  },
  {
    id: 'notifications',
    label: 'নোটিফিকেশন',
    icon: Bell,
    badge: '৫',
    badgeColor: 'bg-rose-500 text-white',
    subItems: [
      { id: 'notifications', label: 'সব নোটিফিকেশন' },
      { id: 'templates-delivery', label: 'ইমেইল ও মেসেজ টেমপ্লেট' },
      { id: 'sms-status', label: 'এসএমএস গেটওয়ে ও লগ' }
    ]
  },
  {
    id: 'analytics-center',
    label: 'রিপোর্ট ও বিশ্লেষণ',
    icon: BarChart3,
    subItems: [
      { id: 'analytics-center', label: 'ওয়েবসাইট পরিসংখ্যান' },
      { id: 'report-builder', label: 'চাকরি ও আবেদন রিপোর্ট' },
      { id: 'data-quality-inspector', label: 'ডাটা কোয়ালিটি রিপোর্ট' }
    ]
  },
  {
    id: 'staff-roles',
    label: 'অ্যাডমিন ও অ্যাক্সেস',
    icon: ShieldCheck,
    subItems: [
      { id: 'staff-roles', label: 'অ্যাডমিন ব্যবহারকারী ও Role' },
      { id: 'audit-logs', label: 'Activity Logs ও অডিট' }
    ]
  },
  {
    id: 'system-health',
    label: 'সিস্টেম স্বাস্থ্য',
    icon: Activity,
    hasStatusDot: true,
    subItems: [
      { id: 'system-health', label: 'সার্ভার ও ডাটাবেস স্বাস্থ্য' },
      { id: 'backup-diagnostics', label: 'ব্যাকআপ ও রিকভারি' }
    ]
  },
  {
    id: 'settings',
    label: 'সেটিংস',
    icon: Settings,
    subItems: [
      { id: 'settings', label: 'সাধারণ সেটিংস' },
      { id: 'transactions', label: 'ফিন্যান্স ও লেনদেন' },
      { id: 'coupons-discounts', label: 'কুপন ও ডিসকাউন্ট' },
      { id: 'raffle-campaigns', label: 'র‍্যাফেল ড্র ক্যাম্পেইন' },
      { id: 'platform-operations', label: 'অপারেশনাল খরচ ও অপটিমাইজেশন' }
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
  // Find which main menu item currently contains the activeTab
  const getInitialOpenMenu = () => {
    for (const item of ADMIN_NAV_ITEMS) {
      if (item.id === activeTab || item.subItems?.some(s => s.id === activeTab)) {
        return item.id;
      }
    }
    return 'dashboard';
  };

  const [openMenu, setOpenMenu] = useState<string | null>(getInitialOpenMenu());

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
