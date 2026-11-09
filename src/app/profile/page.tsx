'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Lock,
  Layers,
  MapPin,
  Clock
} from 'lucide-react';
import { storage } from '@/lib/store';

export default function ProfilePortalPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    const auth = storage.getAuth();
    if (auth.isLoggedIn && auth.role === 'candidate') {
      setIsLoggedIn(true);
      setUser(storage.getUser());
      // Direct jump to active profile editor
      router.replace('/dashboard/profile');
    }
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">প্রার্থী ব্যক্তিগত প্রোফাইল ও সিভি হাব</span>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold">
            <User className="w-4 h-4 text-emerald-400" />
            <span>১০০% টেলিটক ও সরকারি মানসম্মত ডিজিটাল প্রোফাইল</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            প্রার্থীর ডিজিটাল প্রোফাইল ও সিভি
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            একবার আপনার নাম, পিতা-মাতা, ঠিকানা ও শিক্ষাগত তথ্য সেভ করুন; এরপর যেকোনো সরকারি, ব্যাংক বা প্রাইভেট চাকরির সার্কুলারে ১-ক্লিকে নির্ভুল আবেদন সম্পন্ন করুন।
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <Link
            href="/login?redirect=/dashboard/profile"
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>প্রোফাইলে লগইন করুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register?redirect=/dashboard/profile"
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all text-center"
          >
            ফ্রি একাউন্ট খুলুন
          </Link>
        </div>
      </div>

      {/* 4 CORE PROFILE PILLARS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'ব্যক্তিগত ও ঠিকানা তথ্য', desc: 'টেলিটক অলজবস ফরম্যাটের বাংলা ও ইংরেজি পূর্ণাঙ্গ প্রোফাইল', icon: User },
          { title: 'শিক্ষাগত যোগ্যতা', desc: 'এসএসসি, এইচএসসি, স্নাতক ও স্নাতকোত্তরের বোর্ড, রোল ও জিপিএ', icon: GraduationCap },
          { title: 'অভিজ্ঞতা ও দক্ষতা', desc: 'কম্পিউটার টাইপিং স্পিড, প্রফেশনাল ট্রেনিং ও পূর্ববর্তী চাকরি', icon: Briefcase },
          { title: 'কোটা ও বিশেষ সুবিধা', desc: 'মুক্তিযোদ্ধা, ক্ষুদ্র নৃগোষ্ঠী, আনসার ও শারীরিক প্রতিবন্ধী কোটা', icon: Award }
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

      {/* WHY PROFILE IS ESSENTIAL */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-base font-black text-slate-900">চাকরি সেবা প্রোফাইলের বিশেষ সুবিধাসমূহ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>স্বয়ংক্রিয় বয়স ও যোগ্যতা মূল্যায়নকারী</span>
            </span>
            <p className="text-slate-500 text-[11px]">
              আপনার জন্মতারিখ অনুযায়ী যেকোনো সার্কুলারে আপনার বয়স ১৮-৩০ বছর বা কোটাভেদে ৩২ বছরের মধ্যে আছে কিনা তা তাৎক্ষণিক মিলিয়ে দেয়।
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>জিরো টাইপিং মিস্টেক আবেদন গ্যারান্টি</span>
            </span>
            <p className="text-slate-500 text-[11px]">
              আমাদের দক্ষ আবেদন টিম সরাসরি আপনার ভেরিফায়েড প্রোফাইল ও ভল্টের সনদ থেকে তথ্য নিয়ে নির্ভুলভাবে টেলিটকে আবেদন সাবমিট করে।
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <Link
            href="/login?redirect=/dashboard/profile"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <span>আপনার প্রোফাইলে প্রবেশ করুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
