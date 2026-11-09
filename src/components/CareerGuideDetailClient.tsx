'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Copy, 
  Check, 
  Share2,
  FileText,
  HelpCircle,
  Bookmark,
  ChevronLeft
} from 'lucide-react';
import { careerGuidesData } from '@/lib/preparation/data';

interface CareerGuideDetailClientProps {
  slug: string;
}

export default function CareerGuideDetailClient({ slug }: CareerGuideDetailClientProps) {
  const guide = careerGuidesData[slug] || careerGuidesData['cv-writing'];
  const [checklistState, setChecklistState] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  // Toggle checklist item
  const toggleChecklist = (idx: number) => {
    setChecklistState(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Copy template snippet
  const handleCopySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <Link href="/career-guides" className="hover:text-emerald-700 transition-colors">ক্যারিয়ার গাইড</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{guide.title}</span>
      </div>

      {/* Main Guide Content Container */}
      <article className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Header Area */}
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-black px-3 py-1 rounded-full">
              {guide.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>পড়ার সময়: {guide.readTime}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
            {guide.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {guide.heroSummary}
          </p>
        </div>

        {/* Key Takeaways Card */}
        {guide.keyTakeaways && guide.keyTakeaways.length > 0 && (
          <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/60 rounded-2xl border border-emerald-200/90 p-5 sm:p-6 space-y-3">
            <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>প্রধান সারসংক্ষেপ ও গুরুত্বপূর্ণ দিকসমূহ:</span>
            </span>
            <ul className="grid grid-cols-1 gap-2 text-xs text-slate-700">
              {guide.keyTakeaways.map((point, pIdx) => (
                <li key={pIdx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-semibold">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          {guide.sections.map((sec, sIdx) => (
            <section key={sIdx} className="space-y-3.5">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {sec.title}
              </h2>

              {sec.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-slate-600 text-sm sm:text-[15px] leading-relaxed">
                  {p}
                </p>
              ))}

              {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                <ul className="space-y-2 pl-2 text-xs sm:text-sm">
                  {sec.bulletPoints.map((bp, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5 text-slate-700 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
              )}

              {sec.tipBox && (
                <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-xs sm:text-sm text-amber-950 leading-relaxed font-semibold">
                  {sec.tipBox}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Interactive Preparation Checklist */}
        {guide.interactiveChecklist && guide.interactiveChecklist.length > 0 && (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>আপনার প্রস্তুতি যাচাই করুন (ইন্টারেক্টিভ চেকলিস্ট):</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                ক্লিক করে টিক দিন
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {guide.interactiveChecklist.map((item, idx) => {
                const isChecked = Boolean(checklistState[idx]);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleChecklist(idx)}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 ${
                      isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="select-none">{item}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sample Template / Code Block */}
        {guide.sampleTemplate && (
          <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  {guide.sampleTemplate.title}
                </span>
                <p className="text-xs text-slate-400">
                  {guide.sampleTemplate.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopySnippet(guide.sampleTemplate!.snippet)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
              </button>
            </div>

            <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {guide.sampleTemplate.snippet}
            </pre>
          </div>
        )}

        {/* Related Guides Navigation */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            আরও প্রয়োজনীয় ক্যারিয়ার নির্দেশিকা:
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {guide.relatedSlugs.map((rSlug) => {
              const rGuide = careerGuidesData[rSlug];
              if (!rGuide) return null;
              return (
                <Link
                  key={rSlug}
                  href={`/career-guides/${rSlug}`}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl font-bold text-slate-700 hover:text-emerald-800 transition-all flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{rGuide.title.split(' ')[0]} {rGuide.title.split(' ')[1]}...</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </Link>
              );
            })}

            <Link
              href="/career-guides"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all ml-auto"
            >
              সকল গাইড দেখুন ↗
            </Link>
          </div>
        </div>

      </article>

    </div>
  );
}
