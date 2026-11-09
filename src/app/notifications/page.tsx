'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  CheckCheck, 
  Calendar, 
  Award, 
  Clock, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Lock,
  Sparkles
} from 'lucide-react';
import { storage } from '@/lib/store';

export default function NotificationsPortalPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const auth = storage.getAuth();
    if (auth.isLoggedIn && auth.role === 'candidate') {
      setIsLoggedIn(true);
      router.replace('/dashboard/notifications');
    }
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">নোটিফিকেশন ও নিয়োগ সতর্কতা কেন্দ্র</span>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold">
            <Bell className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>সার্বক্ষণিক রিয়েল-টাইম রিমাইন্ডার হাব</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            নোটিফিকেশন ও অ্যালার্ট সেন্টার
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            আপনার আবেদনকৃত চাকরির আবেদনের ডেডলাইন, প্রবেশপত্র ইস্যু, লিখিত ও ভাইভা পরীক্ষার তারিখ এবং ফলাফল প্রকাশের তাৎক্ষণিক নোটিফিকেশন পান।
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <Link
            href="/login?redirect=/dashboard/notifications"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>নোটিফিকেশন দেখতে লগইন করুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 4 CORE NOTIFICATION CATEGORIES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'ডেডলাইন রিমাইন্ডার', desc: 'আবেদনের সময় শেষ হওয়ার ৩ দিন পূর্বে জরুরি সতর্কতা', icon: Clock },
          { title: 'অ্যাডমিট কার্ড রিলিজ', desc: 'টেলিটক প্রবেশপত্র ইস্যু হওয়ামাত্রই ডাউনলোড নোটিশ', icon: Award },
          { title: 'পরীক্ষার তারিখ ও সিটপ্ল্যান', desc: 'প্রিলিমিনারি ও লিখিত পরীক্ষার কেন্দ্র সংক্রান্ত নোটিশ', icon: Calendar },
          { title: 'ফলাফল ও ভাইভা শিডিউল', desc: 'মৌখিক পরীক্ষার তারিখ ও চূড়ান্ত ফলাফলের রোল তালিকা', icon: FileText }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
