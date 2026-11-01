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
  FileText
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
  dropdown?: DropdownItem[];
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileAccordions, setExpandedMobileAccordions] = useState<Record<string, boolean>>({});
  const [auth, setAuth] = useState<AuthState>({ isLoggedIn: false, role: null, name: '' });
  const [walletBalance, setWalletBalance] = useState<number>(450);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Sync auth and user state
  useEffect(() => {
    setAuth(storage.getAuth());
    setWalletBalance(storage.getUser().walletBalance);

    const handleAuthChange = () => setAuth(storage.getAuth());
    const handleUserChange = () => setWalletBalance(storage.getUser().walletBalance);

    window.addEventListener('cs_auth_changed', handleAuthChange);
    window.addEventListener('cs_user_changed', handleUserChange);

    return () => {
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

  // Navigation Menu Configuration in exact required order
  const navItems: NavMenuItem[] = [
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

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm w-full max-w-full" ref={navRef}>
      
      {/* 1. TOP ANNOUNCEMENT TICKER (Preserved Dark Navy Bar) */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white text-[11px] sm:text-xs py-1.5 px-4 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[12px] sm:text-[13px] font-black uppercase tracking-wider animate-pulse flex-shrink-0">
              জরুরি নোটিশ
            </span>
            <span className="truncate text-slate-300">
              আজকে ৩টি নতুন সরকারি চাকরির আবেদন শুরু হয়েছে! শেষ সময় হওয়ার আগেই আবেদন বুকিং দিন।
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-300 flex-shrink-0 text-[14px]">
            <a 
              href="https://wa.me/8801700000000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-emerald-400 flex items-center gap-1 font-semibold"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>হোয়াটসঅ্যাপ: ০১৮৯৪-০০০০০০</span>
            </a>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold">সকাল ৯টা - রাত ১০টা</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER NAVIGATION BAR */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo (Preserved branding, logo icon and badges) */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 flex items-center justify-center text-white shadow-md shadow-emerald-800/25 group-hover:scale-105 transition-transform relative overflow-hidden">
              <Briefcase className="w-5 h-5 text-white" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  চাকরি<span className="text-emerald-700">সেবা</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded">
                  BD
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-1 hidden xl:block">
                নিউজ ও ১০০% নির্ভুল আবেদন পোর্টাল
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links (Ordered: হোম | সরকারি চাকরি | বেসরকারি চাকরি | পরীক্ষা ও ফলাফল | আবেদন নির্দেশনা | জব টিপস) */}
          <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1.5 font-bold text-[14px] 2xl:text-[16px] text-slate-800 whitespace-nowrap flex-shrink-0">
            {navItems.map((item) => {
              const hasDropdown = Boolean(item.dropdown && item.dropdown.length > 0);
              const isCurrentOpen = activeDropdown === item.id;
              const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <div 
                  key={item.id} 
                  className="relative"
                  onMouseEnter={() => hasDropdown && setActiveDropdown(item.id)}
                  onMouseLeave={() => hasDropdown && setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    onClick={() => setActiveDropdown(null)}
                    aria-expanded={hasDropdown ? isCurrentOpen : undefined}
                    aria-haspopup={hasDropdown ? 'true' : undefined}
                    className={`px-1.5 2xl:px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-[14px] 2xl:text-[16px] whitespace-nowrap ${
                      isActive 
                        ? 'text-emerald-700 bg-emerald-50 font-black' 
                        : 'text-slate-800 hover:text-emerald-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
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
                    <div className={`absolute top-full pt-2 z-50 ${item.id === 'tips' ? 'right-0' : 'left-0'} min-w-[280px] w-max`}>
                      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2.5 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                        {item.dropdown!.map((subItem, idx) => (
                          <Link
                            key={idx}
                            href={subItem.href}
                            onClick={() => setActiveDropdown(null)}
                            className="block px-4 py-2.5 text-[16px] text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold transition-colors whitespace-nowrap"
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
          </nav>

          {/* Right Action Area: WhatsApp (Outlined Green) | Login/Registration (Solid Green) */}
          <div className="hidden sm:flex items-center gap-2.5 flex-shrink-0">
            
            {/* WhatsApp button - Outlined in green */}
            <a
              href="https://wa.me/8801700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 2xl:px-3 py-1.5 2xl:py-2 rounded-xl border-2 border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50 text-xs 2xl:text-sm font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            {!auth.isLoggedIn ? (
              /* GUEST: Solid Primary Green Login Button */
              <Link
                href="/login"
                className="px-3 2xl:px-4 py-1.5 2xl:py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs 2xl:text-sm font-black shadow-md shadow-emerald-800/20 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>লগইন / রেজিস্ট্রেশন</span>
              </Link>
            ) : (
              /* LOGGED IN USER: Wallet + Profile Dropdown */
              <div className="flex items-center gap-2">
                {auth.role === 'candidate' && (
                  <Link 
                    href="/dashboard"
                    className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors shadow-sm"
                    title="ওয়ালেট ব্যালেন্স"
                  >
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ব্যালেন্স: ৳{walletBalance}</span>
                  </Link>
                )}

                {auth.role === 'admin' && (
                  <Link 
                    href="/admin"
                    className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>অ্যাডমিন</span>
                  </Link>
                )}

                {/* Profile Avatar & Dropdown */}
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
                            href="/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                          >
                            <UserCheck className="w-4 h-4 text-emerald-600" />
                            <span>মাস্টার ডকুমেন্ট ভল্ট</span>
                          </Link>
                          <Link
                            href="/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                          >
                            <FileText className="w-4 h-4 text-emerald-600" />
                            <span>আমার আবেদন ও ট্র্যাকিং</span>
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
              </div>
            )}

          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex xl:hidden items-center gap-2">
            {!auth.isLoggedIn ? (
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
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 max-h-[85vh] overflow-y-auto">
          <nav className="space-y-1 text-[16px] font-bold text-slate-800">
            {navItems.map((item) => {
              const hasDropdown = Boolean(item.dropdown && item.dropdown.length > 0);
              const isExpanded = Boolean(expandedMobileAccordions[item.id]);

              return (
                <div key={item.id} className="border-b border-slate-100 pb-1">
                                    <div className="flex items-center justify-between">
                    {hasDropdown ? (
                      <button
                        type="button"
                        onClick={() => toggleMobileAccordion(item.id)}
                        className="w-full flex items-center justify-between py-2.5 px-2 rounded-xl hover:bg-emerald-50 text-slate-900 font-bold text-left transition-colors"
                      >
                        <span>{item.label}</span>
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-200 text-slate-500 ${
                            isExpanded ? 'rotate-180 text-emerald-700' : ''
                          }`} 
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full py-2.5 px-2 rounded-xl hover:bg-emerald-50 text-slate-900 font-bold"
                      >
                        {item.label}
                      </Link>
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

          {/* Mobile Bottom Actions (WhatsApp + Login) */}
          <div className="pt-4 space-y-2.5">
            <a
              href="https://wa.me/8801700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 border-2 border-emerald-600 text-emerald-700 rounded-xl font-bold text-[17px] flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp হেল্পলাইন (০১৮৯৪-০০০০০০)</span>
            </a>

            {!auth.isLoggedIn ? (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 bg-emerald-700 text-white rounded-xl font-black text-[17px] flex items-center justify-center gap-2 shadow-md shadow-emerald-800/20"
              >
                <LogIn className="w-4 h-4" />
                <span>লগইন / রেজিস্ট্রেশন</span>
              </Link>
            ) : (
              <div className="space-y-2 pt-1">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-[17px] flex items-center justify-center gap-2 border border-emerald-200"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>আমার ড্যাশবোর্ড ও ভল্ট</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 text-rose-600 rounded-xl font-bold text-[17px] flex items-center justify-center gap-2 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগআউট</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </header>
  );
}
