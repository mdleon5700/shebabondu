'use client';
import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import { Briefcase, Phone, MessageSquare, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';

const Facebook = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const Youtube = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);


export interface FooterColumnLink {
  label: string;
  url: string;
}

export interface FooterColumnItem {
  id: string;
  title: string;
  links: FooterColumnLink[];
}

export const DEFAULT_FOOTER_COLUMNS: FooterColumnItem[] = [
  {
    id: 'col-jobs',
    title: 'চাকরি ও পরীক্ষা',
    links: [
      { label: 'চলমান সকল চাকরি', url: '/jobs' },
      { label: 'সরকারি চাকরির বিজ্ঞপ্তি', url: '/government-jobs' },
      { label: 'বেসরকারি ও কোম্পানি জবস', url: '/private-jobs' },
      { label: 'ব্যাংক ও ফাইন্যান্স চাকরি', url: '/bank-jobs' },
      { label: 'প্রবাসী ও আন্তর্জাতিক চাকরি', url: '/international-jobs' },
      { label: 'আবেদনের শেষ সময় কাছাকাছি', url: '/deadline-approaching' },
      { label: 'পরীক্ষার নোটিশ ও সময়সূচি', url: '/exam-notices' },
      { label: 'প্রবেশপত্র / অ্যাডমিট কার্ড', url: '/admit-cards' },
      { label: 'ভাইভা পরীক্ষার সময়সূচি', url: '/viva-notices' },
      { label: 'নিয়োগ পরীক্ষার ফলাফল', url: '/exam-results' },
      { label: 'বিগত বছরের প্রশ্ন ও সমাধান', url: '/previous-year-questions' }
    ]
  },
  {
    id: 'col-education',
    title: 'শিক্ষাগত যোগ্যতা ও অভিজ্ঞতা',
    links: [
      { label: 'জেএসসি / ৮ম শ্রেণি পাস চাকরি', url: '/jobs/jsc-pass' },
      { label: 'এসএসসি পাস সরকারি চাকরি', url: '/jobs/ssc-pass' },
      { label: 'এইচএসসি পাস চাকরি', url: '/jobs/hsc-pass' },
      { label: 'ডিপ্লোমা প্রকৌশলী চাকরি', url: '/jobs/diploma-pass' },
      { label: 'স্নাতক / ডিগ্রি পাস চাকরি', url: '/jobs/bachelor-degree' },
      { label: 'স্নাতকোত্তর / মাস্টার্স চাকরি', url: '/jobs/masters-degree' },
      { label: 'অভিজ্ঞতা ছাড়া চাকরি', url: '/jobs/no-experience' },
      { label: 'ফ্রেশারদের চাকরি হাব', url: '/fresher-jobs' }
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

export default function Footer({ initialSettings }: { initialSettings?: any } = {}) {
  const [settings, setSettings] = useState<any>(initialSettings || null);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  useEffect(() => {
    const load = () => {
      fetch('/api/platform/settings')
        .then(r => r.json())
        .then(d => {
          if (d.success && d.settings) setSettings(d.settings);
        })
        .catch(() => {});
    };
    load();
    window.addEventListener('cs_settings_changed', load);
    return () => window.removeEventListener('cs_settings_changed', load);
  }, []);

  const phone = settings?.general?.supportPhone || '+৮৮০ ১৭৭৪-৩৬৬৬৪৩';
  const whatsapp = settings?.general?.whatsappNumber || '8801774366643';
  const aboutText = settings?.general?.footerAboutText || 'বাংলাদেশের চাকরিপ্রার্থীদের বিশ্বস্ত ডিজিটাল প্ল্যাটফর্ম। ঘরে বসেই সকল সরকারি, ব্যাংক ও শীর্ষ বেসরকারি চাকরির শতভাগ যাচাইকৃত বিজ্ঞপ্তি ও সঠিক নিয়মে অনলাইন আবেদন সহায়তা।';
  const fbUrl = settings?.general?.facebookUrl || 'https://facebook.com/chakrisheba.bd';
  const tgUrl = settings?.general?.telegramUrl || 'https://t.me/chakrisheba';
  const ytUrl = settings?.general?.youtubeUrl || 'https://youtube.com/@chakrisheba';
  const footerCols: FooterColumnItem[] = (settings?.general?.footerColumns && Array.isArray(settings.general.footerColumns))
    ? settings.general.footerColumns
    : DEFAULT_FOOTER_COLUMNS;
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${footerCols.length >= 4 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-8`}>
          
          {/* Col 1: About & Trust & Socials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {settings?.general?.logoUrl && settings.general.logoUrl !== '/icons/icon-192x192.png' ? (
                <img 
                  src={settings.general.logoUrl} 
                  alt={settings.general.siteName || "চাকরি সেবা"} 
                  className="h-9 w-auto max-w-[140px] object-contain rounded"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-950/40">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-xl font-black text-white tracking-tight">
                {settings?.general?.siteName || <>চাকরি<span className="text-emerald-400">সেবা</span></>}
              </span>
            </div>
            <p className="text-[14px] text-slate-400 leading-relaxed">
              {aboutText}
            </p>
            <div className="pt-1">
              <span className="text-xs font-semibold text-slate-400 block mb-2">আমাদের সাথে যুক্ত থাকুন:</span>
              <div className="flex items-center gap-2">
                <a 
                  href={fbUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#1877F2] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm hover:scale-105"
                  title="চাকরিসেবা ফেসবুক পেজ ও কমিউনিটি"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a 
                  href={tgUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#229ED9] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm hover:scale-105"
                  title="টেলিগ্রাম চ্যানেল (সবার আগে সার্কুলার)"
                >
                  <Send className="w-4 h-4" />
                </a>
                <a 
                  href={`https://wa.me/${whatsapp}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#25D366] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm hover:scale-105"
                  title="হোয়াটসঅ্যাপ হেল্পলাইন"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
                <a 
                  href={ytUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#FF0000] text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm hover:scale-105"
                  title="ইউটিউব ভিডিও গাইড"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="pt-2">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-400 space-y-1">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{phone}</span>
                </div>
                <div>সকাল ৯:০০টা - রাত ১১:০০টা (প্রতিদিন)</div>
              </div>
            </div>
          </div>

          {/* Dynamic Footer Link Columns (Col 2, 3, 4) */}
          {footerCols.map((col, idx) => (
            <div key={col.id || idx}>
              <h4 className="text-white font-bold text-base mb-3.5 border-b border-slate-800 pb-2">
                {col.title}
              </h4>
              <ul className="space-y-2 text-[14px] text-slate-400">
                {(col.links || []).map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link href={link.url} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                      <span className="text-emerald-500">›</span>
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
                {idx === footerCols.length - 1 && (
                  <li className="pt-2">
                    <Link 
                      href="/register" 
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-lg text-xs font-bold transition-colors border border-emerald-500/30"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>বিনামূল্যে অ্যাকাউন্ট খুলুন</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Real Payment Partners Badges & Security Strip */}
        <div className="border-t border-slate-800/90 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-[14px] text-slate-400">
            <span className="font-semibold text-slate-300 mr-1">নিরাপদ পেমেন্ট পার্টনার্স:</span>
            
            <div className="h-8 px-2.5 py-1 bg-white rounded-lg shadow-sm border border-slate-700/50 flex items-center justify-center hover:scale-105 transition-all" title="বিকাশ (bKash)">
              <img src="/images/payments/Bkash.png" alt="বিকাশ" className="h-6 w-auto object-contain" />
            </div>

            <div className="h-8 px-2.5 py-1 bg-white rounded-lg shadow-sm border border-slate-700/50 flex items-center justify-center hover:scale-105 transition-all" title="নগদ (Nagad)">
              <img src="/images/payments/Nagad.png" alt="নগদ" className="h-6 w-auto object-contain rounded" />
            </div>

            <div className="h-8 px-2.5 py-1 bg-white rounded-lg shadow-sm border border-slate-700/50 flex items-center justify-center hover:scale-105 transition-all" title="রকেট (Rocket)">
              <img src="/images/payments/Rocket.png" alt="রকেট" className="h-6 w-auto object-contain rounded" />
            </div>

            <div className="h-8 px-2.5 py-1 bg-white rounded-lg shadow-sm border border-slate-700/50 flex items-center justify-center hover:scale-105 transition-all" title="উপায় (Upay)">
              <img src="/images/payments/Upay.png" alt="উপায়" className="h-6 w-auto object-contain" />
            </div>

            <div className="h-8 px-2.5 py-1 bg-white rounded-lg shadow-sm border border-slate-700/50 flex items-center justify-center hover:scale-105 transition-all" title="ভিসা কার্ড (Visa)">
              <img src="/images/payments/visa.svg" alt="Visa" className="h-5 w-auto object-contain rounded-sm" />
            </div>

            <div className="h-8 px-2.5 py-1 bg-white rounded-lg shadow-sm border border-slate-700/50 flex items-center justify-center hover:scale-105 transition-all" title="মাস্টারকার্ড (Mastercard)">
              <img src="/images/payments/mastercard.svg" alt="Mastercard" className="h-5 w-auto object-contain rounded-sm" />
            </div>
          </div>

          <div className="text-[13px] text-slate-400 flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>SSL এনক্রিপ্টেড ১০০% সুরক্ষিত গেটওয়ে</span>
          </div>
        </div>

        {/* Legal & Policy Navigation Row */}
        <div className="border-t border-slate-800/80 mt-6 pt-5 flex flex-wrap items-center justify-center gap-y-2 gap-x-4 text-xs text-slate-400">
          <Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors">গোপনীয়তা নীতিমালা</Link>
          <span className="text-slate-700">•</span>
          <Link href="/terms-and-conditions" className="hover:text-emerald-400 transition-colors">ব্যবহারের শর্তাবলি</Link>
          <span className="text-slate-700">•</span>
          <Link href="/disclaimer" className="hover:text-emerald-400 transition-colors">দায়-অস্বীকার (Disclaimer)</Link>
          <span className="text-slate-700">•</span>
          <Link href="/editorial-policy" className="hover:text-emerald-400 transition-colors">সম্পাদকীয় নীতিমালা</Link>
          <span className="text-slate-700">•</span>
          <Link href="/corrections-policy" className="hover:text-emerald-400 transition-colors">ভুল সংশোধন</Link>
          <span className="text-slate-700">•</span>
          <Link href="/report-a-job" className="hover:text-rose-400 transition-colors">রিপোর্ট করুন</Link>
          <span className="text-slate-700">•</span>
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">XML সাইটম্যাপ</a>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="border-t border-slate-800/80 mt-5 pt-4 text-center text-[13px] text-slate-500 space-y-1.5">
          <p className="max-w-4xl mx-auto leading-relaxed">
            {settings?.general?.footerDisclaimer || 'সতর্কতা: চাকরি সেবা কোনো সরকারি বা নিয়োগকারী প্রতিষ্ঠান নয়। আমরা বিভিন্ন অফিশিয়াল ওয়েবসাইট ও জাতীয় পত্রিকা থেকে সংগৃহীত চাকরির তথ্য ও সার্কুলার প্রকাশ করি এবং চাকরিপ্রার্থীদের সুবিধার্থে সঠিক নিয়মে ফর্ম পূরণে পেশাদার সহায়তা প্রদান করি।'}
          </p>
          <p className="text-[12px] text-slate-600 pt-1">
            {settings?.general?.copyrightText || `© ২০২৬ ${settings?.general?.siteName || 'চাকরিসেবা BD'} (ChakriSheba.com) • সর্বস্বত্ব সংরক্ষিত।`}
          </p>
        </div>
      </div>
    </footer>
  );
}
