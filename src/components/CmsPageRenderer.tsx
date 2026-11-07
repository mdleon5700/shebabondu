'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Sparkles,
  Award,
  Users,
  Briefcase
} from 'lucide-react';
import { PageRecord, PageSection } from '@/lib/types';

interface CmsPageRendererProps {
  page: PageRecord;
  fallbackContent?: React.ReactNode;
}

export default function CmsPageRenderer({ page, fallbackContent }: CmsPageRendererProps) {
  const sections = (page.sections || []).filter(s => s.isVisible !== false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      
      {/* 1. Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">{page.title}</span>
        </div>
      </div>

      {/* 2. CMS Dynamic Sections */}
      {sections.length > 0 ? (
        <div className="space-y-12">
          {sections.map((section, idx) => (
            <SectionBlock key={section.id || idx} section={section} />
          ))}
          {fallbackContent && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
                {fallbackContent}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{page.title}</h1>
            {page.metaDescription && (
              <p className="text-sm text-slate-600 leading-relaxed">{page.metaDescription}</p>
            )}
            {fallbackContent}
          </div>
        </div>
      )}

      

    </div>
  );
}

function SectionBlock({ section }: { section: PageSection }) {
  const style = section.style || {};
  const bg = style.backgroundColor || 'transparent';
  const textCol = style.textColor || 'inherit';
  const textAlign = style.textAlign || 'left';
  const pyClass = style.paddingY === 'lg' ? 'py-16 sm:py-24' : style.paddingY === 'sm' ? 'py-6' : 'py-12 sm:py-16';

  switch (section.type) {
    case 'hero':
      return (
        <div 
          className={`w-full ${pyClass} px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden`}
          style={{ backgroundColor: bg !== 'transparent' ? bg : '#0f172a', color: textCol }}
        >
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className={section.content?.imageUrl ? 'md:col-span-7 space-y-4 text-left' : `md:col-span-12 text-${textAlign} space-y-4`}>
              {section.content?.badge && (
                <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  {section.content.badge}
                </span>
              )}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {section.title}
              </h1>
              {section.subtitle && (
                <p className="text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
                  {section.subtitle}
                </p>
              )}
            </div>
            {section.content?.imageUrl && (
              <div className="md:col-span-5 flex justify-center">
                <img 
                  src={section.content.imageUrl} 
                  alt={section.title} 
                  className="rounded-3xl shadow-2xl border border-white/20 max-h-80 object-cover" 
                />
              </div>
            )}
          </div>
        </div>
      );

    case 'banner-image':
      return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 shadow-md group">
            <img 
              src={section.content?.imageUrl || 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&auto=format&fit=crop&q=80'} 
              alt={section.title || 'ব্যানার'}
              style={{
                height: section.style?.imageHeight === 'sm' ? '200px' : section.style?.imageHeight === 'lg' ? '450px' : '320px',
                width: '100%',
                objectFit: 'cover'
              }}
              className="w-full transition-transform duration-300 group-hover:scale-105"
            />
            {(section.title || section.content?.badge || section.content?.buttonLabel) && (
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white space-y-3">
                {section.content?.badge && (
                  <span className="inline-block px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold uppercase tracking-wider w-fit">
                    {section.content.badge}
                  </span>
                )}
                <h2 className="text-2xl sm:text-3xl font-black">{section.title}</h2>
                {section.subtitle && <p className="text-sm sm:text-base text-slate-200 max-w-xl">{section.subtitle}</p>}
                {(section.content?.buttonUrl || section.content?.linkUrl) && (
                  <Link
                    href={section.content?.buttonUrl || section.content?.linkUrl}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-950 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition-colors w-fit"
                  >
                    <span>{section.content?.buttonLabel || 'বিস্তারিত দেখুন'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      );

    case 'features':
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-${textAlign} mb-8`}>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{section.title}</h2>
            {section.subtitle && <p className="text-sm sm:text-base text-slate-600 mt-2">{section.subtitle}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(section.content?.items || [
              { title: '১০০% সঠিক তথ্য', desc: 'সরকারি গেজেট ও মূল সার্কুলার থেকে সরাসরি সংগৃহীত ও ভেরিফাইড।' },
              { title: 'সঠিক নিয়মে আবেদন', desc: 'টেলিটক ও ব্যাংক নিয়মে কোনো ত্রুটি ছাড়া নির্ভুল ফরম পূরণ।' },
              { title: 'লাইভ নোটিফিকেশন', desc: 'আবেদনের শেষ তারিখ ও অ্যাডমিট কার্ড রিলিজের তাৎক্ষণিক অ্যালার্ট।' }
            ]).map((item: any, i: number) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2 hover:border-emerald-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc || item.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'text':
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 border-l-4 border-emerald-600 pl-3">
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="text-sm text-slate-600 font-medium leading-relaxed pl-4">
                {section.subtitle}
              </p>
            )}
            {section.content?.bodyHtml ? (
              <div 
                className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed pl-4 pt-2"
                dangerouslySetInnerHTML={{ __html: section.content.bodyHtml }}
              />
            ) : section.content?.bodyText ? (
              <p className="text-sm text-slate-700 leading-relaxed pl-4 pt-2 whitespace-pre-line">
                {section.content.bodyText}
              </p>
            ) : null}
          </div>
        </div>
      );

    case 'faq':
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{section.title}</h2>
            {section.subtitle && <p className="text-sm text-slate-600 mt-2">{section.subtitle}</p>}
          </div>

          <div className="space-y-4">
            {((Array.isArray(section.content?.items) && section.content.items.length > 0 ? section.content.items : null) || section.content?.faqs || [
              { q: 'চাকরি সেবা কি সম্পূর্ণ সরকারি পোর্টাল?', a: 'না, চাকরি সেবা একটি স্বাধীন ডিজিটাল প্ল্যাটফর্ম যা সরকারি এবং ব্যাংক নিয়োগের ভেরিফাইড তথ্য সরবরাহ ও আবেদন সহায়তা প্রদান করে।' },
              { q: 'আবেদন ফি কীভাবে জমা দিতে হয়?', a: 'আপনি বিকাশ, নগদ বা ওয়ালেটের মাধ্যমে নির্ধারিত ফি পরিশোধ করতে পারেন।' },
              { q: 'আমার তথ্যের নিরাপত্তা কীভাবে নিশ্চিত হয়?', a: 'আপনার ব্যক্তিগত তথ্য ও ডকুমেন্টস ব্যাংকিং গ্রেড এনক্রিপশনে সুরক্ষিত থাকে।' }
            ]).map((faq: any, i: number) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <HelpCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{faq.q || faq.question || faq.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                  {faq.a || faq.answer || faq.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'cta':
      return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-black">{section.title}</h2>
              {section.subtitle && <p className="text-sm text-emerald-100 max-w-xl">{section.subtitle}</p>}
            </div>
            <Link
              href={section.content?.buttonUrl || '/jobs'}
              className="px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 flex-shrink-0"
            >
              <span>{section.content?.buttonText || 'চলমান চাকরি দেখুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      );

    default:
      return null;
  }
}
