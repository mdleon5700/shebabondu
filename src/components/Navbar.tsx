'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Briefcase, 
  Wallet, 
  UserCheck, 
  ShieldCheck, 
  Menu, 
  X,
  MessageSquare,
  LogIn,
  LogOut,
  ChevronDown,
  FileText,
  Bell
} from 'lucide-react';
import { storage, AuthState } from '@/lib/store';

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
  badgeColor?: string;
  target?: string;
  visibility?: string;
  dropdown?: DropdownItem[];
}

// Navigation Menu Configuration in exact required order
const DEFAULT_NAV_ITEMS: NavMenuItem[] = [
  {
    id: 'home',
    label: 'হোম',
    href: '/'
  },
  {
    id: 'all-jobs',
    label: 'সকল চাকরি',
    href: '/jobs',
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
      { label: 'মৌখিক পরীক্ষার নোটিশ (Viva)', href: '/viva-notices' },
      { label: 'সকল পরীক্ষার ফলাফল', href: '/exam-results' },
      { label: 'বিগত বছরের প্রশ্ন ও সমাধান', href: '/previous-year-questions' },
      { label: 'অনলাইন মডেল টেস্ট', href: '/model-tests' }
    ]
  },
  {
    id: 'career',
    label: 'ক্যারিয়ার গাইড',
    href: '/career-guides',
    dropdown: [
      { label: 'ক্যারিয়ার গাইড হাব', href: '/career-guides' },
      { label: 'সিভি লেখার সঠিক নিয়ম', href: '/career-guides/cv-writing' },
      { label: 'অনলাইনে চাকরির আবেদন গাইড', href: '/career-guides/online-job-application' },
      { label: 'ইন্টারভিউ ও ভাইভা প্রস্তুতি', href: '/career-guides/interview-preparation' },
      { label: 'চাকরির পরীক্ষার প্রস্তুতি', href: '/career-guides/job-exam-preparation' },
      { label: 'ক্যারিয়ার পরামর্শ ও ব্লগ', href: '/blog' }
    ]
  }
];

export default function Navbar({ initialSettings }: { initialSettings?: any } = {}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileAccordions, setExpandedMobileAccordions] = useState<Record<string, boolean>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [auth, setAuth] = useState<AuthState>({ isLoggedIn: false, role: null, name: '' });
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<any>(initialSettings || null);
  const navRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const rightAreaRef = useRef<HTMLDivElement>(null);

  // Dynamic visible count for nav menu items based on exact available space
  // Initial state matches SSR to guarantee 0 hydration mismatches; useEffect fine-tunes post-mount
  const [visibleCount, setVisibleCount] = useState<number>(DEFAULT_NAV_ITEMS.length);

  useEffect(() => {
    if (initialSettings) {
      setPlatformSettings(initialSettings);
    }
  }, [initialSettings]);

  // Sync auth and user state
  useEffect(() => {
    console.log('[Navbar] useEffect mounting...');
    setIsMounted(true);
    try {
      setAuth(storage.getAuth());
      setWalletBalance(storage.getUser()?.walletBalance || 0);
    } catch (e) {
      console.error('[Navbar] storage error:', e);
    }

    const handleAuthChange = () => setAuth(storage.getAuth());
    const handleUserChange = () => setWalletBalance(storage.getUser()?.walletBalance || 0);

    const fetchSettings = () => {
      fetch('/api/platform/settings', { cache: 'no-store' })
        .then(res => res.json())
        .then(d => {
          if (d.success && d.settings) setPlatformSettings(d.settings);
        })
        .catch(err => {
          console.error('[Navbar] Settings fetch failed:', err);
        });
    };
    if (!initialSettings) {
      fetchSettings();
    }
    window.addEventListener('cs_settings_changed', fetchSettings);

    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && d.isLoggedIn && d.user) {
          const authState = {
            isLoggedIn: true,
            role: d.role,
            name: d.user.name,
            phone: d.user.phone,
            userId: d.user.id
          };
          storage.setAuth(authState);
          setAuth(authState);
          if (d.role === 'candidate') {
            storage.updateUser(d.user);
            setWalletBalance(d.user.walletBalance ?? 0);
          }
        }
      })
      .catch(() => {});

    window.addEventListener('cs_auth_changed', handleAuthChange);
    window.addEventListener('cs_user_changed', handleUserChange);

    return () => {
      window.removeEventListener('cs_settings_changed', fetchSettings);
      window.removeEventListener('cs_auth_changed', handleAuthChange);
      window.removeEventListener('cs_user_changed', handleUserChange);
    };
  }, []);

  // Close desktop dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    storage.logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    window.location.href = '/login';
  };

  const toggleMobileAccordion = (id: string) => {
    setExpandedMobileAccordions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const navItems: NavMenuItem[] = (platformSettings?.general?.headerMenuItems && Array.isArray(platformSettings.general.headerMenuItems))
    ? platformSettings.general.headerMenuItems
    : DEFAULT_NAV_ITEMS;

  // Dynamic visible count calculation based on calibrated typographical metrics and real DOM
  useEffect(() => {
    const calculateVisibleItems = () => {
      if (!navRef.current) return;
      const headerWidth = navRef.current.clientWidth;
      
      // Determine real or reliable fallback right area width based on auth state
      const expectedRightWidth = auth.isLoggedIn 
        ? (auth.role === 'admin' ? 255 : 435) 
        : 515;
      const measuredRightWidth = rightAreaRef.current?.offsetWidth || 0;
      // Guard against measuring unmounted skeleton or partial width
      const rightWidth = isMounted && measuredRightWidth > 200 
        ? Math.max(measuredRightWidth, expectedRightWidth) 
        : expectedRightWidth;

      const logoWidth = headerWidth >= 1800 ? 360 : 220;
      const containerDeduction = 96; // 64px container padding (px-8) + 32px flex gaps
      
      const availableSpace = headerWidth - logoWidth - rightWidth - containerDeduction;

      if (availableSpace <= 0) {
        setVisibleCount(1);
        return;
      }

      // Exact pixel width mapping (including 6px flex gap) based on rendered Bengali typography
      const itemWidthsMap: Record<string, number> = {
        'home': 51,
        'all-jobs': 141,
        'govt': 130,
        'private': 145,
        'categories': 147,
        'exam': 155,
        'career': 135,
        'urgent-jobs': 149
      };

      const getItemEstimatedWidth = (item: NavMenuItem) => {
        if (itemWidthsMap[item.id]) return itemWidthsMap[item.id];
        const textLen = (item.label || '').length;
        const hasDropdown = Boolean(item.dropdown && item.dropdown.length > 0);
        const hasBadge = Boolean(item.badge);
        return Math.max(50, Math.round(20 + (textLen * 7.5) + (hasDropdown ? 16 : 0) + (hasBadge ? 28 : 0) + 6));
      };

      let accumulatedWidth = 0;
      let count = 0;
      const moreButtonWidth = 70;

      for (let i = 0; i < navItems.length; i++) {
        const item = navItems[i];
        const itemWidth = getItemEstimatedWidth(item);
        const isLast = (i === navItems.length - 1);
        const neededWidth = accumulatedWidth + itemWidth + (isLast ? 0 : moreButtonWidth);

        if (neededWidth <= availableSpace) {
          accumulatedWidth += itemWidth;
          count++;
        } else if (isLast && (accumulatedWidth + itemWidth <= availableSpace)) {
          count++;
        } else {
          break;
        }
      }

      setVisibleCount(Math.max(1, count));
    };

    calculateVisibleItems();
    const timer = setTimeout(calculateVisibleItems, 60);
    window.addEventListener('resize', calculateVisibleItems);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateVisibleItems);
    };
  }, [navItems, auth.isLoggedIn, auth.role, isMounted, walletBalance, platformSettings]);


  return (
    <header className={`z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm w-full max-w-full ${platformSettings?.general?.stickyHeader !== false ? 'sticky top-0' : 'relative'}`} ref={navRef}>
      
      {/* 1. TOP ANNOUNCEMENT TICKER (Dynamic from Admin CMS) */}
      {(platformSettings?.general?.announcementEnabled !== false) && (
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white text-[11px] sm:text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[12px] sm:text-[13px] font-black uppercase tracking-wider animate-pulse flex-shrink-0">
                জরুরি নোটিশ
              </span>
              <Link 
                href={platformSettings?.general?.announcementUrl || '/jobs'}
                className="truncate text-slate-300 hover:text-emerald-300 transition-colors"
              >
                {platformSettings?.general?.announcementText || 'আজকে ৩টি নতুন সরকারি চাকরির আবেদন শুরু হয়েছে! শেষ সময় হওয়ার আগেই আবেদন বুকিং দিন।'}
              </Link>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-slate-300 flex-shrink-0 text-[14px]">
              <a 
                href={`https://wa.me/${platformSettings?.general?.whatsappNumber || '8801774366643'}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-emerald-400 flex items-center gap-1 font-semibold"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>হোয়াটসঅ্যাপ: {platformSettings?.general?.supportPhone || '+৮৮০ ১৭৭৪-৩৬৬৬৪৩'}</span>
              </a>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-bold">সকাল ৯টা - রাত ১০টা</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER NAVIGATION BAR */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4 w-full">
          
          {/* Logo (Preserved branding, logo icon and badges, with dynamic customizer support) */}
          <Link ref={logoRef} href="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
            {platformSettings?.general?.logoUrl && platformSettings.general.logoUrl !== '/icons/icon-192x192.png' ? (
              <img 
                src={platformSettings.general.logoUrl} 
                alt={platformSettings.general.siteName || "চাকরি সেবা"} 
                className="h-10 sm:h-11 w-auto max-w-[160px] object-contain group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 flex items-center justify-center text-white shadow-md shadow-emerald-800/25 group-hover:scale-105 transition-transform relative overflow-hidden">
                <Briefcase className="w-5 h-5 text-white" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {platformSettings?.general?.siteName ? (
                    platformSettings.general.siteName
                  ) : (
                    <>চাকরি<span className="text-emerald-700">সেবা</span></>
                  )}
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded">
                  BD
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-1 hidden min-[1800px]:block">
                {platformSettings?.general?.siteDescription || 'নিউজ ও ১০০% নির্ভুল আবেদন পোর্টাল'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 2xl:gap-1.5 font-bold text-slate-800 whitespace-nowrap min-w-0 flex-shrink">
            {navItems.slice(0, visibleCount).map((item) => {
              const hasDropdown = Boolean(item.dropdown && item.dropdown.length > 0);
              const isCurrentOpen = activeDropdown === item.id;
              const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <div 
                  key={item.id} 
                  className="relative flex-shrink-0"
                  onMouseEnter={() => hasDropdown && setActiveDropdown(item.id)}
                  onMouseLeave={() => hasDropdown && setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    onClick={() => setActiveDropdown(null)}
                    aria-expanded={hasDropdown ? isCurrentOpen : undefined}
                    aria-haspopup={hasDropdown ? 'true' : undefined}
                    className={`px-1.5 xl:px-2 2xl:px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[13px] xl:text-[14px] 2xl:text-[15px] whitespace-nowrap ${
                      isActive 
                        ? 'text-emerald-700 bg-emerald-50 font-black' 
                        : 'text-slate-800 hover:text-emerald-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                        item.badgeColor === 'rose' ? 'bg-rose-100 text-rose-700' :
                        item.badgeColor === 'amber' ? 'bg-amber-100 text-amber-800' :
                        item.badgeColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                        item.badgeColor === 'purple' ? 'bg-purple-100 text-purple-700' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {hasDropdown && (
                      <ChevronDown 
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                          isCurrentOpen ? 'rotate-180 text-emerald-700' : ''
                        }`} 
                      />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {hasDropdown && isCurrentOpen && (
                    <div className="absolute top-full pt-2 z-50 left-0 min-w-[260px] w-max">
                      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                        {item.dropdown!.map((subItem, idx) => (
                          <Link
                            key={idx}
                            href={subItem.href}
                            onClick={() => setActiveDropdown(null)}
                            className="block px-4 py-2 text-[14px] text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold transition-colors whitespace-nowrap"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* "আরও" (More) Dropdown for items that overflow the current viewport */}
            {visibleCount < navItems.length && (
              <div 
                className="relative flex-shrink-0"
                onMouseEnter={() => setActiveDropdown('more-nav-items')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveDropdown(activeDropdown === 'more-nav-items' ? null : 'more-nav-items')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveDropdown(activeDropdown === 'more-nav-items' ? null : 'more-nav-items'); } }}
                  aria-expanded={activeDropdown === 'more-nav-items'}
                  className={`cursor-pointer px-2 py-1.5 rounded-xl transition-all flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[13px] xl:text-[14px] whitespace-nowrap font-bold ${
                    activeDropdown === 'more-nav-items'
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-50'
                  }`}
                >
                  <span>আরও</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${activeDropdown === 'more-nav-items' ? 'rotate-180 text-emerald-700' : ''}`} />
                </div>

                {activeDropdown === 'more-nav-items' && (
                  <div className="absolute top-full pt-2 z-50 right-0 min-w-[280px] w-max max-h-[75vh] overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 py-2 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                      {navItems.slice(visibleCount).map((item) => (
                        <div key={`more-${item.id}`} className="py-1.5 px-2">
                          <Link
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center justify-between px-3 py-1.5 rounded-lg text-[14px] font-bold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          >
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                          {item.dropdown && item.dropdown.length > 0 && (
                            <div className="mt-1 pl-4 space-y-0.5 border-l-2 border-emerald-100 ml-3">
                              {item.dropdown.map((sub, sIdx) => (
                                <Link
                                  key={sIdx}
                                  href={sub.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className="block py-1 text-xs text-slate-600 hover:text-emerald-700 transition-colors"
                                >
                                  {sub.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Right Action Area: Customizable Guest Buttons & User Widgets */}
          <div ref={rightAreaRef} className="hidden sm:flex items-center gap-2 flex-shrink-0 ml-auto z-10">
            
            {/* WhatsApp button */}
            {platformSettings?.general?.guestButtons?.showWhatsApp !== false && (
              <a
                href={`https://wa.me/${platformSettings?.general?.whatsappNumber || '8801774366643'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 2xl:px-3 py-1.5 2xl:py-2 rounded-xl border border-emerald-600/80 text-emerald-700 bg-white hover:bg-emerald-50 text-xs 2xl:text-sm font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>{platformSettings?.general?.guestButtons?.whatsAppText || platformSettings?.general?.whatsappButtonText || 'WhatsApp'}</span>
              </a>
            )}

            {!isMounted ? (
              <div className="w-28 h-9 rounded-xl bg-slate-100/60 animate-pulse border border-slate-200" />
            ) : !auth.isLoggedIn ? (
              /* GUEST BUTTONS: Track Application | Login | Free Register */
              <div className="flex items-center gap-2">
                {platformSettings?.general?.guestButtons?.showTrackApplication !== false && (
                  <Link
                    href="/dashboard/application-check"
                    className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
                    title="আবেদনের ট্র্যাকিং ও স্ট্যাটাস যাচাই"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{platformSettings?.general?.guestButtons?.trackApplicationText || 'আবেদন ট্র্যাক'}</span>
                  </Link>
                )}

                {platformSettings?.general?.guestButtons?.showLogin !== false && (
                  <Link
                    href="/login"
                    className="px-3 py-1.5 2xl:py-2 rounded-xl border border-emerald-600/80 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/60 text-xs 2xl:text-sm font-bold transition-all flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{platformSettings?.general?.guestButtons?.loginText || 'লগইন'}</span>
                  </Link>
                )}

                {platformSettings?.general?.guestButtons?.showRegister !== false && (
                  <Link
                    href="/register"
                    className="px-3.5 py-1.5 2xl:py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs 2xl:text-sm font-black shadow-md shadow-emerald-800/20 transition-all flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-white" />
                    <span>{platformSettings?.general?.guestButtons?.registerText || 'ফ্রি রেজিস্ট্রেশন'}</span>
                  </Link>
                )}
              </div>
            ) : (
              /* LOGGED IN USER: Dashboard Direct Button + Wallet + Notification Bell + Profile Dropdown */
              <div className="flex items-center gap-2">
                {/* 1. Direct Dashboard CTA Button */}
                {auth.role === 'candidate' && platformSettings?.general?.userWidgets?.showDashboardButton !== false && (
                  <Link 
                    href="/dashboard"
                    className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-xs transition-all whitespace-nowrap"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{platformSettings?.general?.userWidgets?.dashboardButtonText || 'ড্যাশবোর্ড'}</span>
                  </Link>
                )}

                {/* 2. Wallet Balance Widget */}
                {auth.role === 'candidate' && platformSettings?.general?.userWidgets?.showWalletBalance !== false && (
                  <Link 
                    href="/dashboard/wallet"
                    className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors shadow-2xs"
                    title="ওয়ালেট ব্যালেন্স"
                  >
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>৳{walletBalance}</span>
                  </Link>
                )}

                {/* 3. Notification Bell Widget */}
                {auth.role === 'candidate' && platformSettings?.general?.userWidgets?.showNotificationBell !== false && (
                  <Link
                    href="/dashboard/notifications"
                    className="relative p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
                    title="নোটিফিকেশন"
                  >
                    <Bell className="w-4 h-4 text-slate-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                  </Link>
                )}

                {/* 4. Admin Direct Link */}
                {auth.role === 'admin' && (
                  <Link 
                    href="/admin"
                    className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>অ্যাডমিন</span>
                  </Link>
                )}

                {/* 5. Profile Avatar & Dropdown */}
                {platformSettings?.general?.userWidgets?.showAvatarDropdown !== false && (
                  <div className="relative">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-xs">
                        {auth.name ? auth.name.charAt(0) : 'U'}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs space-y-1">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <div className="font-bold text-slate-800">{auth.name || 'ইউজার'}</div>
                          <div className="text-[10px] text-emerald-600 font-semibold">
                            {auth.role === 'admin' ? 'Super Admin' : 'ভেরিফাইড প্রার্থী'}
                          </div>
                        </div>

                        {auth.role === 'candidate' ? (
                          <>
                            <Link
                              href="/dashboard/profile"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium text-xs"
                            >
                              <UserCheck className="w-4 h-4 text-emerald-600" />
                              <span>আমার প্রোফাইল</span>
                            </Link>
                            <Link
                              href="/dashboard/applications"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium text-xs"
                            >
                              <FileText className="w-4 h-4 text-emerald-600" />
                              <span>আমার আবেদন ও ট্র্যাকিং</span>
                            </Link>
                            <Link
                              href="/dashboard/vault"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium text-xs"
                            >
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span>মাস্টার ডকুমেন্ট ভল্ট</span>
                            </Link>
                            <Link
                              href="/dashboard/wallet"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium text-xs"
                            >
                              <Wallet className="w-4 h-4 text-emerald-600" />
                              <span>ডিজিটাল ওয়ালেট</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            href="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>টিম ড্যাশবোর্ড</span>
                          </Link>
                        )}

                        <div className="border-t border-slate-100 my-1"></div>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 font-bold"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>লগআউট করুন</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center gap-2">
            {!isMounted ? (
              <div className="w-14 h-8 rounded-xl bg-slate-100 animate-pulse" />
            ) : !auth.isLoggedIn ? (
              <Link 
                href="/login"
                className="bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold"
              >
                লগইন
              </Link>
            ) : (
              <Link 
                href="/dashboard"
                className="bg-emerald-100 text-emerald-800 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>৳{walletBalance}</span>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* 3. TABLET & MOBILE ACCORDION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 max-h-[85vh] overflow-y-auto">
          <nav className="space-y-1 text-[16px] font-bold text-slate-800">
            {navItems.map((item) => {
              const hasDropdown = Boolean(item.dropdown && item.dropdown.length > 0);
              const isExpanded = Boolean(expandedMobileAccordions[item.id]);

              return (
                <div key={item.id} className="border-b border-slate-100 pb-1">
                                    <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-2 rounded-xl hover:bg-emerald-50 text-slate-900 font-bold flex-1 text-left transition-colors"
                    >
                      {item.label}
                    </Link>
                    {hasDropdown && (
                      <button
                        type="button"
                        onClick={() => toggleMobileAccordion(item.id)}
                        className="p-2.5 rounded-xl hover:bg-emerald-50 text-slate-600 transition-colors flex items-center justify-center cursor-pointer"
                        aria-label={`${item.label} সাবমেনু ড্রপডাউন`}
                      >
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-200 text-slate-500 ${
                            isExpanded ? 'rotate-180 text-emerald-700' : ''
                          }`} 
                        />
                      </button>
                    )}
                  </div>

                  {/* Expandable Accordion */}
                  {hasDropdown && isExpanded && (
                    <div className="pl-4 pr-2 py-1.5 space-y-1 bg-slate-50/80 rounded-xl mb-1">
                      {item.dropdown!.map((subItem, idx) => (
                        <Link
                          key={idx}
                          href={subItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-2 px-3 text-[16px] text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg font-medium"
                        >
                          • {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Mobile Bottom Actions (WhatsApp + Guest Buttons / User Widgets) */}
          <div className="pt-4 space-y-2">
            {platformSettings?.general?.guestButtons?.showWhatsApp !== false && (
              <a
                href={`https://wa.me/${platformSettings?.general?.whatsappNumber || '8801774366643'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 border border-emerald-600 text-emerald-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>{platformSettings?.general?.guestButtons?.whatsAppText || 'WhatsApp হেল্পলাইন'}</span>
              </a>
            )}

            {!auth.isLoggedIn ? (
              <div className="space-y-2">
                {platformSettings?.general?.guestButtons?.showLogin !== false && (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 border border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4 text-emerald-700" />
                    <span>{platformSettings?.general?.guestButtons?.loginText || 'লগইন'}</span>
                  </Link>
                )}
                {platformSettings?.general?.guestButtons?.showRegister !== false && (
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 bg-emerald-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-800/20"
                  >
                    <UserCheck className="w-4 h-4 text-white" />
                    <span>{platformSettings?.general?.guestButtons?.registerText || 'ফ্রি রেজিস্ট্রেশন'}</span>
                  </Link>
                )}
                {platformSettings?.general?.guestButtons?.showTrackApplication !== false && (
                  <Link
                    href="/dashboard/application-check"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>{platformSettings?.general?.guestButtons?.trackApplicationText || 'আবেদন ট্র্যাক করুন'}</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>আমার ড্যাশবোর্ড</span>
                </Link>
                <Link
                  href="/dashboard/wallet"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-emerald-200"
                >
                  <Wallet className="w-4 h-4" />
                  <span>ওয়ালেট ব্যালেন্স: ৳{walletBalance}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 text-rose-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-50 border border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগআউট</span>
                </button>
              </div>
            )}
          </div></div>
      )}

    </header>
  );
}
