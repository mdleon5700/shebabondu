'use client';
import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, ArrowRight, BookOpen, ShieldCheck, Bell, Users, Briefcase } from 'lucide-react';
import { usePlatformContext } from '@/components/layout/ConditionalLayout';

interface HeroCmsData {
  title?: string;
  subtitle?: string;
  content?: {
    badge?: string;
    ctaText?: string;
    ctaUrl?: string;
    secondaryCtaText?: string;
    secondaryCtaUrl?: string;
    imageUrl?: string;
    imagePosition?: string;
    items?: Array<{ title: string; desc: string }>;
  };
  style?: {
    titleFontSize?: string;
    subtitleFontSize?: string;
    fontWeight?: string;
    backgroundColor?: string;
    textColor?: string;
    textAlign?: string;
    paddingY?: string;
    imageWidth?: string;
  };
}

export default function HeroSection({ initialData }: { initialData?: HeroCmsData | null } = {}) {
  const { homeHero } = usePlatformContext();
  const effectiveInitial = initialData || homeHero || null;
  const [cmsData, setCmsData] = useState<HeroCmsData | null>(effectiveInitial);

  useEffect(() => {
    if (homeHero) {
      setCmsData(homeHero);
    }
  }, [homeHero]);

  useEffect(() => {
    const fetchHeroData = () => {
      fetch('/api/platform/settings', { cache: 'no-store' })
        .then(res => res.json())
        .then(d => {
          if (d.success && d.homeHero) {
            setCmsData(d.homeHero);
          }
        })
        .catch(() => {});
    };

    // Only fetch if initial data is missing
    if (!effectiveInitial) {
      fetchHeroData();
    }
    window.addEventListener('cs_settings_changed', fetchHeroData);
    window.addEventListener('cs_page_changed', fetchHeroData);
    return () => {
      window.removeEventListener('cs_settings_changed', fetchHeroData);
      window.removeEventListener('cs_page_changed', fetchHeroData);
    };
  }, [effectiveInitial]);

  const badgeText = cmsData?.content?.badge || 'সঠিক তথ্য • নির্ভরযোগ্য চাকরির খবর • আপনার ক্যারিয়ারের সঙ্গী';
  const heroTitle = cmsData?.title || 'চাকরির খবর জানুন সবার আগে — ১০০% নির্ভুল আবেদন ও স্মার্ট ক্যারিয়ার সেবা ২০২৬';
  const heroSubtitle = cmsData?.subtitle || 'সরকারি ও বেসরকারি চাকরির সর্বশেষ বিজ্ঞপ্তি, আবেদন প্রক্রিয়া, যোগ্যতা, প্রয়োজনীয় কাগজপত্র এবং পরীক্ষার আপডেট—সবকিছু এক জায়গায়, আপনার জন্য।';
  const cta1Text = cmsData?.content?.ctaText || 'চাকরির বিজ্ঞপ্তি দেখুন';
  const cta1Url = cmsData?.content?.ctaUrl || '#circulars-section';
  const cta2Text = cmsData?.content?.secondaryCtaText || 'আবেদন প্রক্রিয়া জানুন';
  const cta2Url = cmsData?.content?.secondaryCtaUrl || '#how-it-works';

  // Dynamic Title Font Size class
  const getTitleSizeClass = (size?: string) => {
    switch (size) {
      case '2xl': return 'text-xl sm:text-2xl lg:text-3xl';
      case '3xl': return 'text-2xl sm:text-3xl lg:text-4xl';
      case '4xl': return 'text-3xl sm:text-4xl lg:text-5xl';
      case '5xl': return 'text-4xl sm:text-5xl lg:text-6xl';
      case '6xl': return 'text-5xl sm:text-6xl lg:text-7xl';
      default: return 'text-5xl sm:text-6xl lg:text-7xl';
    }
  };

  // Dynamic Subtitle Font Size class
  const getSubtitleSizeClass = (size?: string) => {
    switch (size) {
      case 'xs': return 'text-[13px] sm:text-[14px]';
      case 'sm': return 'text-[14px] sm:text-[15px]';
      case 'lg': return 'text-[17px] sm:text-[18px]';
      case 'xl': return 'text-[19px] sm:text-[20px]';
      default: return 'text-[16px]';
    }
  };

  // Dynamic Font Weight class
  const getWeightClass = (weight?: string) => {
    switch (weight) {
      case 'normal': return 'font-normal';
      case 'medium': return 'font-medium';
      case 'semibold': return 'font-semibold';
      case 'bold': return 'font-bold';
      case 'black': return 'font-black';
      default: return 'font-extrabold';
    }
  };

  return (
    <section 
      style={{
        backgroundColor: cmsData?.style?.backgroundColor || undefined,
        color: cmsData?.style?.textColor || undefined
      }}
      className="relative overflow-hidden bg-gradient-to-b from-[#011612] via-[#022b22] to-[#011a14] text-white pt-4 pb-5 sm:pt-8 sm:pb-12 lg:pt-10 lg:pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40"
    >
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-emerald-500/15 blur-[140px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-[450px] h-[250px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
          <div className="lg:col-span-7 space-y-3 sm:space-y-4 lg:space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#022822]/90 border border-emerald-500/40 text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm font-hind">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{badgeText}</span>
            </div>
            <h1 className={`${getTitleSizeClass(cmsData?.style?.titleFontSize)} ${getWeightClass(cmsData?.style?.fontWeight)} text-white leading-[1.32] sm:leading-[1.35] whitespace-pre-line`}>
              {heroTitle}
            </h1>

            <p className={`${getSubtitleSizeClass(cmsData?.style?.subtitleFontSize)} text-slate-300 font-solaiman leading-relaxed max-w-xl mx-auto lg:mx-0 pt-1 whitespace-pre-line`}>
              {heroSubtitle}
            </p>

            <div className="hidden sm:flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1 font-hind">
              <a href={cta1Url} className="px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-[17px] shadow-xl shadow-emerald-950/60 flex items-center gap-2 transition-all hover:scale-[1.02]">
                <FileText className="w-4 h-4" />
                <span>{cta1Text}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href={cta2Url} className="px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-[17px] border border-white/40 transition-all flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-300" />
                <span>{cta2Text}</span>
              </a>
            </div>
            <div className="hidden sm:grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-3 sm:pt-4 border-t border-emerald-900/40 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="text-[16px] font-bold text-white leading-tight font-hind">নির্ভরযোগ্য তথ্য</div>
                  <div className="text-[13px] text-slate-400 font-solaiman">অফিসিয়াল সূত্র থেকে</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[16px] font-bold text-white leading-tight font-hind">ধাপে ধাপে গাইড</div>
                  <div className="text-[13px] text-slate-400 font-solaiman">আবেদন সহজ সহায়তা</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[16px] font-bold text-white leading-tight font-hind">নিয়মিত আপডেট</div>
                  <div className="text-[13px] text-slate-400 font-solaiman">নতুন বিজ্ঞপ্তি সবার আগে</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Users className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="text-[16px] font-bold text-white leading-tight font-hind">সবার জন্য</div>
                  <div className="text-[13px] text-slate-400 font-solaiman">সরকারি ও বেসরকারি চাকরি</div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex lg:col-span-5 relative items-center justify-center">
            {cmsData?.content?.imageUrl ? (
              <div className="relative w-full flex items-center justify-center py-4">
                <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 shadow-2xl">
                  <img 
                    src={cmsData.content.imageUrl} 
                    alt={heroTitle}
                    style={{
                      maxWidth: cmsData.style?.imageWidth === 'sm' ? '250px' : cmsData.style?.imageWidth === 'lg' ? '450px' : cmsData.style?.imageWidth === 'full' ? '100%' : '360px',
                      maxHeight: '400px',
                      objectFit: 'cover'
                    }}
                    className="rounded-3xl"
                  />
                </div>
              </div>
            ) : (
            <div className="relative w-full max-w-[480px] flex items-center justify-center py-4">
              <div className="absolute w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
              <div className="absolute w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />
              <div className="absolute w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full border border-emerald-500/20 border-dashed pointer-events-none" />
              <div className="absolute w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] rounded-full border border-teal-500/25 pointer-events-none" />

              <div className="absolute top-2 right-2 sm:right-4 z-20 w-11 h-11 rounded-2xl bg-[#032e26]/85 backdrop-blur-md border border-emerald-400/40 shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center text-emerald-300">
                <FileText className="w-5 h-5" />
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 -right-1 sm:right-2 z-20 w-11 h-11 rounded-2xl bg-[#032e26]/85 backdrop-blur-md border border-teal-400/40 shadow-[0_0_20px_rgba(45,212,191,0.3)] flex items-center justify-center text-teal-300">
                <Briefcase className="w-5 h-5" />
              </div>

              <div className="absolute bottom-6 right-3 sm:right-6 z-20 w-11 h-11 rounded-2xl bg-[#032e26]/85 backdrop-blur-md border border-emerald-400/40 shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center text-emerald-300">
                <Sparkles className="w-5 h-5" />
              </div>

              <div className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-700 to-emerald-950 p-1 shadow-2xl shadow-emerald-950 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#022822] flex flex-col items-center justify-center p-6 text-center border border-emerald-400/20">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/30">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <div className="text-xl font-black text-white font-hind leading-tight">চাকরি সেবা</div>
                  <div className="text-xs text-emerald-300/80 font-medium mt-1">১০০% ভেরিফাইড সার্কুলার</div>
                  <div className="mt-3 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                    বিডি জব আবেদন পোর্টাল
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
