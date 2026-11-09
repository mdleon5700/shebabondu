'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  FileBox, 
  Bookmark, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Award, 
  Calendar, 
  Bell, 
  Briefcase, 
  FileCheck, 
  BrainCircuit, 
  TrendingUp, 
  Wallet, 
  History, 
  Settings, 
  LogOut,
  Lock, 
  Menu, 
  X, 
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  PhoneCall
} from 'lucide-react';
import { storage } from '@/lib/store';
import { CandidateProfile } from '@/lib/types';
import { emptyCandidateProfile as mockUserProfile } from '@/lib/candidate-defaults';

interface SidebarNavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}

const navSections: { sectionTitle: string; items: SidebarNavItem[] }[] = [
  {
    sectionTitle: 'মূল ড্যাশবোর্ড',
    items: [
      { title: 'ওভারভিউ', href: '/dashboard', icon: LayoutDashboard },
      { title: 'ব্যক্তিগত প্রোফাইল', href: '/dashboard/profile', icon: User },
      { title: 'স্মার্ট ডকুমেন্ট ভল্ট', href: '/dashboard/vault', icon: FileBox, badge: 'রিসাইজার', badgeColor: 'bg-emerald-100 text-emerald-800' }
    ]
  },
  {
    sectionTitle: 'চাকরি ও আবেদন',
    items: [
      { title: 'সুপারিশকৃত চাকরি (Recommended)', href: '/dashboard/recommended-jobs', icon: Sparkles, badge: 'স্মার্ট ম্যাচ', badgeColor: 'bg-emerald-100 text-emerald-800' },
      { title: 'সংরক্ষিত সার্কুলার', href: '/dashboard/saved-jobs', icon: Bookmark },
      { title: 'আবেদন প্রস্তুতি ও যাচাই', href: '/dashboard/application-check', icon: CheckCircle2 },
      { title: 'আমার আবেদন ট্র্যাকিং', href: '/dashboard/applications', icon: FileText }
    ]
  },
  {
    sectionTitle: 'পরীক্ষা ও নোটিশ',
    items: [
      { title: 'অ্যাডমিট কার্ড ট্র্যাকার', href: '/dashboard/admit-cards', icon: Award },
      { title: 'পরীক্ষার ক্যালেন্ডার', href: '/dashboard/exam-calendar', icon: Calendar },
      { title: 'নোটিফিকেশন সেন্টার', href: '/dashboard/notifications', icon: Bell, badge: '২ নতুন', badgeColor: 'bg-rose-100 text-rose-800' },
      { title: 'ব্যক্তিগত জব অ্যালার্ট', href: '/dashboard/alerts', icon: Briefcase }
    ]
  },
  {
    sectionTitle: 'প্রস্তুতি ও সিভি',
    items: [
      { title: 'স্মার্ট সিভি বিল্ডার', href: '/dashboard/cv-builder', icon: FileCheck },
      { title: 'পরীক্ষার প্রস্তুতি', href: '/dashboard/preparation', icon: BrainCircuit },
      { title: 'পারফরম্যান্স অ্যানালিটিক্স', href: '/dashboard/performance', icon: TrendingUp }
    ]
  },
  {
    sectionTitle: 'অ্যাকাউন্ট ও ফিন্যান্স',
    items: [
      { title: 'আমার ওয়ালেট', href: '/dashboard/wallet', icon: Wallet },
      { title: 'লেনদেন হিস্ট্রি', href: '/dashboard/transactions', icon: History },
      { title: 'অ্যাকাউন্ট সেটিংস', href: '/dashboard/settings', icon: Settings }
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile>(mockUserProfile);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [completion, setCompletion] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [impersonatingName, setImpersonatingName] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);

    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)cs_impersonating=([^;]+)/);
      if (match) {
        setImpersonatingName(decodeURIComponent(match[1]));
      }
    }

    // 1. Synchronously restore from client storage (zero flickering & no unwanted logouts)
    const currentAuth = storage.getAuth();
    if (currentAuth.isLoggedIn && currentAuth.role === 'candidate') {
      const cachedUser = storage.getUser();
      const cachedDocs = storage.getDocuments();
      setProfile(cachedUser);
      setCompletion(storage.calculateProfileCompletion(cachedUser, cachedDocs));
      setSessionChecked(true);
    }

    // 2. Background sync with backend (does NOT wipe localStorage on transient fetch error)
    const token = typeof window !== 'undefined' ? localStorage.getItem('cs_session_token') : null;
    const authHeaders: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
    fetch('/api/auth/me', { cache: 'no-store', headers: authHeaders })
      .then(async res => {
        if (!res.ok) {
          // If server explicitly returns 401 and there is no active local login, redirect
          if (res.status === 401 && !storage.getAuth().isLoggedIn) {
            router.replace('/login?redirect=' + encodeURIComponent(pathname));
          }
          return;
        }
        const data = await res.json();
        if (data.isLoggedIn && data.role === 'candidate') {
          storage.setAuth({ isLoggedIn: true, role: 'candidate', userId: data.user.id, name: data.user.name, phone: data.user.phone });
          storage.updateUser(data.user);
          setProfile(data.user);
          setCompletion(storage.calculateProfileCompletion(data.user, storage.getDocuments()));
        } else if (!storage.getAuth().isLoggedIn) {
          router.replace('/login?redirect=' + encodeURIComponent(pathname));
        }
      })
      .catch((err) => {
        console.warn('Dashboard session background sync warning:', err);
      })
      .finally(() => {
        setSessionChecked(true);
      });

    const handleUserChange = () => {
      const u = storage.getUser();
      setProfile(u);
      setCompletion(storage.calculateProfileCompletion(u, storage.getDocuments()));
    };

    window.addEventListener('cs_user_changed', handleUserChange);
    window.addEventListener('cs_documents_changed', handleUserChange);
    return () => {
      window.removeEventListener('cs_user_changed', handleUserChange);
      window.removeEventListener('cs_documents_changed', handleUserChange);
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('cs_session_token') : null;
      await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
    } catch {}
    storage.logout();
    router.push('/login');
  };

  const handleExitImpersonation = async () => {
    try {
      await fetch('/api/admin/impersonate', { method: 'DELETE' });
    } catch {}
    if (typeof window !== 'undefined') {
      window.location.href = '/admin?tab=candidate-directory';
    }
  };

  if (!sessionChecked) return <div role="status" className="p-8 text-base text-slate-600">ড্যাশবোর্ড লোড হচ্ছে...</div>;

  if (isMounted && !storage.getAuth().isLoggedIn && !impersonatingName) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-700">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">লগইন আবশ্যক</h2>
          <p className="text-xs text-slate-600">
            প্রার্থী ড্যাশবোর্ড ও ব্যক্তিগত তথ্য অ্যাক্সেস করতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।
          </p>
          <div className="pt-2">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <span>লগইন পেজে যান</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" suppressHydrationWarning>
      {/* Sticky Admin Impersonation Banner */}
      {impersonatingName && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 px-4 py-2.5 text-xs font-black flex items-center justify-between shadow-md sticky top-0 z-50 border-b border-amber-600">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-black text-amber-400 rounded-md">
              <ShieldAlert className="w-3.5 h-3.5" />
            </span>
            <span>
              অ্যাডমিন ইমপারসোনেশন মোড সক্রিয়: আপনি বর্তমানে &ldquo;{impersonatingName}&rdquo; এর প্রার্থী পোর্টালে আছেন। যেকোনো পরিবর্তন লাইভ সেভ হবে।
            </span>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="px-3 py-1 bg-slate-950 hover:bg-black text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>✕ অ্যাডমিন প্যানেলে ফিরুন</span>
          </button>
        </div>
      )}

      {/* Mobile Sticky Header Bar */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="font-bold text-sm tracking-tight flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>প্রার্থী পোর্টাল</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {isMounted ? (
            <Link href="/dashboard/wallet" className="bg-emerald-950 border border-emerald-700/60 text-emerald-300 px-2.5 py-1 rounded-lg font-bold">
              ৳{profile.walletBalance ?? 0}
            </Link>
          ) : (
            <div className="w-12 h-6 bg-slate-800 rounded animate-pulse" />
          )}
          <Link href="/dashboard/profile">
            <img src={(isMounted ? profile.photoUrl : '') || '/images/avatar-placeholder.png'} alt="" className="w-7 h-7 rounded-full border border-emerald-400 object-cover" />
          </Link>
        </div>
      </div>

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Sidebar (Sticky Navigation Below Header) */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out
          lg:sticky lg:top-24 lg:z-20 lg:h-[calc(100vh-6rem)] lg:translate-x-0
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Sidebar Candidate Profile Snapshot Header */}
          <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white">
            <div className="flex items-center justify-between mb-3 lg:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">মেনু নেভিগেশন</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <img 
                  src={(isMounted ? profile.photoUrl : '') || '/images/avatar-placeholder.png'}
                  alt={isMounted ? profile.name : "প্রোফাইল ছবি"} 
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full" title="ভেরিফাইড আইডি">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                {isMounted ? (
                  <>
                    <h3 className="font-bold text-sm text-slate-900 truncate">
                      {profile.nameBn || profile.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <span>আইডি: {profile.id || (profile.nid ? profile.nid.slice(0, 6) + '...' : profile.username || 'প্রার্থী')}</span>
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ব্যালেন্স: ৳{profile.walletBalance ?? 0}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5 animate-pulse">
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                    <div className="h-4 w-16 bg-emerald-100 rounded-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Completion Meter */}
            <div className="mt-3.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>প্রোফাইল সম্পূর্ণতা</span>
                <span className="text-emerald-700 font-bold">{isMounted ? completion : 0}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${isMounted ? completion : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Navigation Links (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs font-semibold custom-scrollbar">
            {navSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {sec.sectionTitle}
                </div>
                {sec.items.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/80 shadow-sm' 
                          : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer Support & Logout */}
          <div className="p-3 border-t border-slate-200/80 bg-slate-50/50 space-y-2">
            <a 
              href="https://wa.me/8801700000000" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>সহায়তা ও আবেদন হেল্পলাইন</span>
            </a>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট করুন</span>
            </button>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div 
            onClick={() => setMobileSidebarOpen(false)} 
            className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Main Workspace Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
