'use client';
import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import { Briefcase, Phone, MessageSquare, Send, ShieldCheck, CheckCircle2, Facebook, Youtube } from 'lucide-react';

export default function Footer() {
  const [settings, setSettings] = useState<any>(null);

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
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: About & Trust & Socials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-950/40">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                চাকরি<span className="text-emerald-400">সেবা</span>
              </span>
            </div>
            <p className="text-[14px] text-slate-400 leading-relaxed">
              বাংলাদেশের চাকরিপ্রার্থীদের বিশ্বস্ত ডিজিটাল প্ল্যাটফর্ম। ঘরে বসেই সকল সরকারি, ব্যাংক ও শীর্ষ বেসরকারি চাকরির শতভাগ যাচাইকৃত বিজ্ঞপ্তি ও সঠিক নিয়মে অনলাইন আবেদন সহায়তা।
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

          {/* Col 2: Jobs & Exams */}
          <div>
            <h4 className="text-white font-bold text-base mb-3.5 border-b border-slate-800 pb-2">
              চাকরি ও পরীক্ষা
            </h4>
            <ul className="space-y-2 text-[14px] text-slate-400">
              <li>
                <Link href="/jobs" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>চলমান সকল চাকরি</span>
                </Link>
              </li>
              <li>
                <Link href="/government-jobs" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>সরকারি চাকরির বিজ্ঞপ্তি</span>
                </Link>
              </li>
              <li>
                <Link href="/private-jobs" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>বেসরকারি ও কোম্পানি জবস</span>
                </Link>
              </li>
              <li>
                <Link href="/bank-jobs" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>ব্যাংক ও ফাইন্যান্স চাকরি</span>
                </Link>
              </li>
              <li>
                <Link href="/deadline-approaching" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>আবেদনের শেষ সময় কাছাকাছি</span>
                </Link>
              </li>
              <li>
                <Link href="/exam-notices" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>পরীক্ষার নোটিশ ও সময়সূচি</span>
                </Link>
              </li>
              <li>
                <Link href="/admit-cards" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>প্রবেশপত্র / অ্যাডমিট কার্ড</span>
                </Link>
              </li>
              <li>
                <Link href="/previous-year-questions" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>বিগত বছরের প্রশ্ন ও সমাধান</span>
                </Link>
              </li>
              <li>
                <Link href="/model-tests" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>অনলাইন মডেল টেস্ট</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Career Guides & Directories */}
          <div>
            <h4 className="text-white font-bold text-base mb-3.5 border-b border-slate-800 pb-2">
              ক্যারিয়ার গাইড ও সার্ভিস
            </h4>
            <ul className="space-y-2 text-[14px] text-slate-400">
              <li>
                <Link href="/job-categories" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>সকল চাকরির ক্যাটাগরি</span>
                </Link>
              </li>
              <li>
                <Link href="/organizations" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>সকল নিয়োগকারী প্রতিষ্ঠান</span>
                </Link>
              </li>
              <li>
                <Link href="/career-guides" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>ক্যারিয়ার গাইড হাব</span>
                </Link>
              </li>
              <li>
                <Link href="/career-guides/cv-writing" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>সিভি লেখার সঠিক নিয়ম</span>
                </Link>
              </li>
              <li>
                <Link href="/career-guides/online-job-application" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>অনলাইনে চাকরির আবেদন গাইড</span>
                </Link>
              </li>
              <li>
                <Link href="/career-guides/interview-preparation" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>ইন্টারভিউ ও ভাইভা প্রস্তুতি</span>
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>সব ব্লগ ও ক্যারিয়ার আর্টিকেল</span>
                </Link>
              </li>
              <li>
                <Link href="/job-alerts" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>ফ্রি জব এলার্ট নোটিফিকেশন</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Organization & Policy Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-3.5 border-b border-slate-800 pb-2">
              নীতিমালা ও সহায়তা
            </h4>
            <ul className="space-y-2 text-[14px] text-slate-400">
              <li>
                <Link href="/about-us" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>আমাদের সম্পর্কে (About Us)</span>
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>যোগাযোগ করুন (Contact)</span>
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>সাধারণ জিজ্ঞাসা (FAQ)</span>
                </Link>
              </li>
              <li>
                <Link href="/editorial-policy" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>সম্পাদকীয় নীতিমালা</span>
                </Link>
              </li>
              <li>
                <Link href="/job-verification-policy" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>চাকরি যাচাই নীতিমালা</span>
                </Link>
              </li>
              <li>
                <Link href="/corrections-policy" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-500">›</span>
                  <span>ভুল তথ্য সংশোধন নীতিমালা</span>
                </Link>
              </li>
              <li>
                <Link href="/report-a-job" className="hover:text-rose-400 transition-colors flex items-center gap-1.5 font-semibold text-rose-300">
                  <span className="text-rose-400">›</span>
                  <span>ভুল বিজ্ঞপ্তি রিপোর্ট করুন</span>
                </Link>
              </li>
              <li className="pt-2">
                <Link 
                  href="/register" 
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-lg text-xs font-bold transition-colors border border-emerald-500/30"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>বিনামূল্যে অ্যাকাউন্ট খুলুন</span>
                </Link>
              </li>
            </ul>
          </div>

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
            সতর্কতা: চাকরি সেবা কোনো সরকারি বা নিয়োগকারী প্রতিষ্ঠান নয়। আমরা বিভিন্ন অফিশিয়াল ওয়েবসাইট ও জাতীয় পত্রিকা থেকে সংগৃহীত চাকরির তথ্য ও সার্কুলার প্রকাশ করি এবং চাকরিপ্রার্থীদের সুবিধার্থে সঠিক নিয়মে ফর্ম পূরণে পেশাদার সহায়তা প্রদান করি।
          </p>
          <p className="text-[12px] text-slate-600 pt-1">
            © ২০২৬ চাকরিসেবা BD (ChakriSheba.com) • সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </div>
    </footer>
  );
}
