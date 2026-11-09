'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  User, 
  ArrowRight, 
  Share2, 
  BookOpen, 
  Clock, 
  Eye, 
  Sparkles, 
  Check, 
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { blogPostsData } from '@/lib/preparation/data';
import { BlogPostItem } from '@/lib/preparation/types';

interface SingleBlogClientProps {
  slug: string;
}

export default function SingleBlogClient({ slug }: SingleBlogClientProps) {
  const [copied, setCopied] = useState(false);

  // Defensive find with fallback
  const post: BlogPostItem = React.useMemo(() => {
    const found = blogPostsData.find(p => p.slug === slug);
    return found || blogPostsData[0];
  }, [slug]);

  // Bengali numerals converter
  const toBn = (num: number | string | undefined | null) => {
    if (num === undefined || num === null) return '';
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnNums[parseInt(d, 10)]);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-emerald-700 transition-colors">ব্লগ</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{post.title}</span>
      </div>

      {/* Main Article Container */}
      <article className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Header Info */}
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-black px-3 py-1 rounded-full">
              {post.category}
            </span>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.readTime} পাঠ</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{toBn(post.viewsCount)} বার পঠিত</span>
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center border border-emerald-200 shrink-0">
                {post.author.charAt(0)}
              </div>
              <div>
                <span className="text-xs font-black text-slate-900 block">{post.author}</span>
                <span className="text-[11px] text-slate-500">{post.authorRole} • {post.date}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="self-start sm:self-auto px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'লিংক কপি হয়েছে!' : 'শেয়ার করুন'}</span>
            </button>
          </div>
        </div>

        {/* Excerpt Lead */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-sm sm:text-base font-semibold text-slate-700 leading-relaxed italic">
          "{post.excerpt}"
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          {post.sections.map((sec, sIdx) => (
            <section key={sIdx} className="space-y-3.5">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {sec.heading}
              </h2>

              {sec.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-slate-600 leading-relaxed text-sm sm:text-[15px]">
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

              {sec.alertTip && (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-950 font-semibold leading-relaxed">
                  {sec.alertTip}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Related Articles & Back CTA */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            আরও পড়ুন:
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {post.relatedSlugs.map((rSlug) => {
              const rPost = blogPostsData.find(p => p.slug === rSlug);
              if (!rPost) return null;
              return (
                <Link
                  key={rSlug}
                  href={`/blog/${rSlug}`}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl font-bold text-slate-700 hover:text-emerald-800 transition-all flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{rPost.title.substring(0, 32)}...</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </Link>
              );
            })}

            <Link
              href="/blog"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all ml-auto"
            >
              সকল আর্টিকেল দেখুন ↗
            </Link>
          </div>
        </div>

      </article>

    </div>
  );
}
