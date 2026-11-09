'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  FileText, 
  Scale, 
  BookOpen, 
  AlertTriangle, 
  RefreshCw, 
  CreditCard, 
  ChevronRight, 
  CheckCircle2, 
  Lock, 
  Printer, 
  Share2, 
  HelpCircle,
  Check,
  Headphones,
  Mail,
  ExternalLink,
  Search
} from 'lucide-react';

export interface PolicySection {
  id: string;
  number?: string;
  title: string;
  content: React.ReactNode;
}

interface PolicyLayoutProps {
  currentPath: string;
  badge?: string;
  title: string;
  subtitle: string;
  lastUpdated?: string;
  version?: string;
  sections: PolicySection[];
  importantNotice?: React.ReactNode;
}

export const LEGAL_PAGES = [
  { path: '/privacy-policy', label: 'গোপনীয়তা নীতি', icon: Lock, badge: 'ডাটা সিকিউরিটি' },
  { path: '/terms-and-conditions', label: 'ব্যবহারের শর্তাবলী', icon: Scale, badge: 'আইনি শর্ত' },
  { path: '/disclaimer', label: 'আইনি দায়মুক্তি', icon: AlertTriangle, badge: 'অফিসিয়াল গেজেট' },
  { path: '/editorial-policy', label: 'সম্পাদকীয় নীতি', icon: BookOpen, badge: 'ফ্যাক্ট-চেকিং' },
  { path: '/corrections-policy', label: 'সংশোধন ও প্রত্যাহার', icon: RefreshCw, badge: 'স্বচ্ছতা' },
  { path: '/job-verification-policy', label: 'সার্কুলার যাচাইকরণ', icon: ShieldCheck, badge: '৩-স্তর অডিট' },
  { path: '/refund-policy', label: 'রিফান্ড ও ফি ফেরত', icon: CreditCard, badge: '১০০% গ্যারান্টি' },
];

export default function PolicyLayout({
  currentPath,
  badge = 'সরকারি ও আন্তর্জাতিক মানদণ্ডের আইনি পলিসি',
  title,
  subtitle,
  lastUpdated = '০৯ নভেম্বর ২০২৬ • সংস্করণ ২.৪',
  version = 'v2.4 (Open Data Compliance)',
  sections,
  importantNotice
}: PolicyLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');
  const [copiedLink, setCopiedLink] = useState(false);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* 1. Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">আইনি ও প্রাতিষ্ঠানিক পলিসি</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">{title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 2. Centralized Policy Navigation Pills */}
        <div className="bg-white rounded-3xl border border-slate-200 p-3 sm:p-4 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center justify-between">
            <span>আইনি ও নিয়মনীতি সংক্রান্ত পাতাসমূহ:</span>
            <span className="hidden sm:inline text-emerald-700">সর্বমোট ৭টি আইনি দলিল</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {LEGAL_PAGES.map((page) => {
              const Icon = page.icon;
              const isActive = currentPath === page.path;
              return (
                <Link
                  key={page.path}
                  href={page.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-emerald-200' 
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-700'}`} />
                  <span>{page.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. Header Hero Document Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-2 max-w-3xl">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{badge}</span>
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="লিঙ্ক কপি করুন"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
                <span className="hidden sm:inline">{copiedLink ? 'কপি হয়েছে' : 'শেয়ার'}</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="প্রিন্ট করুন বা পিডিএফ সেভ করুন"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">প্রিন্ট কপি</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div>
              <span className="font-semibold text-slate-700">সর্বশেষ কার্যকর: </span>
              <span>{lastUpdated}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">স্ট্যাটাস: </span>
              <span className="text-emerald-700 font-bold">অনুমোদিত ও সক্রিয়</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">ডকুমেন্ট সংস্করণ: </span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-800">{version}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">এখতিয়ার: </span>
              <span>গণপ্রজাতন্ত্রী বাংলাদেশ আইন</span>
            </div>
          </div>

          {importantNotice && (
            <div className="bg-amber-50/80 border border-amber-200 p-4 sm:p-5 rounded-2xl text-xs sm:text-sm text-amber-950 space-y-1">
              {importantNotice}
            </div>
          )}
        </div>

        {/* 4. Body Content with Sidebar Table of Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Desktop Sticky Table of Contents */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                অনচ্ছেদ সূচিপত্র (Contents)
              </h3>
              <nav className="space-y-1">
                {sections.map((sec, idx) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-start gap-2 ${
                      activeSection === sec.id
                        ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-slate-400 font-mono flex-shrink-0">{idx + 1}.</span>
                    <span className="line-clamp-1">{sec.title}</span>
                  </button>
                ))}
              </nav>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] text-slate-500">আইনি বা তথ্যের ব্যাখ্যার প্রয়োজনে:</div>
                <Link
                  href="/contact"
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>লিগ্যাল হেল্পডেস্কে প্রশ্ন</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right / Main Policy Sections */}
          <div className="lg:col-span-8 space-y-6">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                id={sec.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4 scroll-mt-24 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {idx + 1}
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {sec.title}
                  </h2>
                </div>

                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
                  {sec.content}
                </div>
              </div>
            ))}

            {/* Bottom Contact & Legal Compliance Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold">আইনি অধিকার ও কমপ্লায়েন্স সেল</h3>
                  <p className="text-xs text-slate-400">সরকারি গেজেট, নীতিমালা ও প্রার্থীর অধিকার সুরক্ষায় সার্বক্ষণিক দায়বদ্ধ।</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                এই নীতিমালার যেকোনো ধারা, প্রার্থীর তথ্য সংরক্ষণ, রিফান্ড অধিকার বা সরকারি বিজ্ঞপ্তি সম্পর্কিত যেকোনো ব্যাখ্যার জন্য সরাসরি আমাদের আইনি ও কমপ্লায়েন্স ডেস্কে যোগাযোগ করুন।
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                <Link
                  href="/contact"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>হেল্পডেস্কে টিকিট খুলুন</span>
                </Link>
                <a
                  href="mailto:legal@chakrisheba.com"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>legal@chakrisheba.com</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

