'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Search, 
  FileText, 
  CheckCircle2, 
  UserCheck, 
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { careerGuidesData } from '@/lib/preparation/data';

export default function CareerGuidesListClient() {
  const [guides] = useState(Object.values(careerGuidesData));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredGuides = useMemo(() => {
    return guides.filter(g => {
      const matchCat = selectedCategory === 'all' || g.category === selectedCategory;
      const term = searchQuery.toLowerCase().trim();
      const matchSearch = !term ||
        g.title.toLowerCase().includes(term) ||
        g.heroSummary.toLowerCase().includes(term) ||
        g.category.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [guides, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-800">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-emerald-700 transition-colors">হোম</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">ক্যারিয়ার গাইড ও টিপস হাব</span>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ক্যারিয়ার সহায়িকা ও প্রফেশনাল মেন্টরশিপ</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            চাকরির প্রস্তুতি ও সফল ক্যারিয়ার গাইডলাইন
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            আন্তর্জাতিক মানের সিভি তৈরি, ভাইভা ফেস করার নিয়ম, অনলাইন আবেদন সহায়িকা থেকে শুরু করে প্রথম সুযোগেই চাকরি পাওয়ার বাস্তবমুখী দিকনির্দেশনা।
          </p>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input 
              type="text"
              placeholder="গাইড খুঁজুন... (উদা: সিভি, ভাইভা, অনলাইন আবেদন, রুটিন)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto text-xs font-bold">
            {[
              { id: 'all', label: 'সকল গাইড' },
              { id: 'জীবনবৃত্তান্ত ও প্রোফাইল', label: 'সিভি তৈরি' },
              { id: 'ইন্টারভিউ কৌশল', label: 'ইন্টারভিউ প্রস্তুতি' },
              { id: 'পরীক্ষার প্রস্তুতি', label: 'পরীক্ষার কৌশল' },
              { id: 'অনলাইন আবেদন সহায়িকা', label: 'অনলাইন আবেদন' },
              { id: 'ভাইভা ও মৌখিক পরীক্ষা', label: 'ভাইভা শিষ্টাচার' }
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

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuides.map((g) => (
          <Link
            key={g.slug}
            href={`/career-guides/${g.slug}`}
            className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {g.category}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{g.readTime}</span>
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                {g.title}
              </h2>

              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                {g.heroSummary}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-emerald-700 transition-colors">
              <span>সম্পূর্ণ গাইড পড়ুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {filteredGuides.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">কোনো ক্যারিয়ার গাইড পাওয়া যায়নি।</h3>
          <p className="text-xs text-slate-500">অন্য কোনো কি-ওয়ার্ড দিয়ে অনুসন্ধান করুন।</p>
        </div>
      )}

    </div>
  );
}
