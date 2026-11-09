'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Calendar, 
  ArrowRight, 
  User, 
  Search, 
  Clock, 
  Eye, 
  Sparkles,
  HelpCircle,
  TrendingUp,
  Tag
} from 'lucide-react';
import { blogPostsData } from '@/lib/preparation/data';
import { BlogPostItem } from '@/lib/preparation/types';

export default function BlogListClient() {
  const [posts] = useState<BlogPostItem[]>(blogPostsData);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Bengali numerals converter
  const toBn = (num: number | string | undefined | null) => {
    if (num === undefined || num === null) return '';
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnNums[parseInt(d, 10)]);
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchCat = selectedCategory === 'all' || p.categorySlug === selectedCategory;
      const term = searchQuery.toLowerCase().trim();
      const matchSearch = !term ||
        p.title.toLowerCase().includes(term) ||
        p.excerpt.toLowerCase().includes(term) ||
        p.author.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const featuredPost = posts[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">চাকরি সেবা ব্লগ ও আর্টিকেল</span>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden">
        <div className="max-w-2xl space-y-3">
          <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>জ্ঞান ও ক্যারিয়ার জার্নাল</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            চাকরি সেবা ব্লগ ও ক্যারিয়ার বিশ্লেষণ
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            সরকারি ও ব্যাংক নিয়োগের বিশেষজ্ঞ পরামর্শ, বয়স বৃদ্ধি সংক্রান্ত গেজেট আপডেট এবং চাকরির বাজার বিশ্লেষণের নির্ভরযোগ্য পোর্টাল।
          </p>
        </div>
      </div>

      {/* Featured Article Banner */}
      {featuredPost && selectedCategory === 'all' && !searchQuery && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500/80 p-6 sm:p-8 shadow-md relative overflow-hidden group">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-md">
                  ফিচার্ড আর্টিকেল
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {featuredPost.date} • {featuredPost.readTime}
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                <Link href={`/blog/${featuredPost.slug}`}>
                  {featuredPost.title}
                </Link>
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                {featuredPost.excerpt}
              </p>

              <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{featuredPost.author} ({featuredPost.authorRole})</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>{toBn(featuredPost.viewsCount)} বার পঠিত</span>
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-2 transition-all hover:scale-105"
              >
                <span>সম্পূর্ণ পড়ুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input 
              type="text"
              placeholder="আর্টিকেল বা লেখকের নাম দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto text-xs font-bold">
            {[
              { id: 'all', label: 'সকল আর্টিকেল' },
              { id: 'bcs', label: 'বিসিএস প্রস্তুতি' },
              { id: 'bank', label: 'ব্যাংক জবস' },
              { id: 'primary', label: 'প্রাথমিক শিক্ষক' },
              { id: 'gazette', label: 'গেজেট ও বিধিমালা' },
              { id: 'tips', label: 'স্টাডি টিপস' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((b) => (
          <Link
            key={b.slug}
            href={`/blog/${b.slug}`}
            className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {b.category}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {b.date}
                </span>
              </div>

              <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                {b.title}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                {b.excerpt}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 truncate pr-2">
                <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-semibold truncate">{b.author}</span>
              </div>

              <div className="flex items-center gap-1 font-bold text-slate-400 group-hover:text-emerald-700 shrink-0">
                <span>পড়ুন</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">কোনো আর্টিকেল পাওয়া যায়নি।</h3>
          <p className="text-xs text-slate-500">অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজুন বা সকল আর্টিকেল নির্বাচন করুন।</p>
        </div>
      )}

    </div>
  );
}
