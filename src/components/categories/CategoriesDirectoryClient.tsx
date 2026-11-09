'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Banknote, 
  GraduationCap, 
  Train, 
  ShieldCheck, 
  Stethoscope, 
  Wrench, 
  HeartHandshake, 
  Briefcase, 
  Cpu, 
  ArrowRight,
  BookOpen,
  Sparkles,
  Layers,
  Coins,
  Scissors,
  PhoneCall,
  Wheat,
  Globe2,
  Plane,
  Microscope,
  TrendingUp,
  School,
  Landmark,
  Award,
  Building,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Building2,
  Banknote,
  GraduationCap,
  Train,
  ShieldCheck,
  Stethoscope,
  Wrench,
  HeartHandshake,
  Briefcase,
  Cpu,
  BookOpen,
  Layers,
  Coins,
  Scissors,
  PhoneCall,
  Wheat,
  Globe2,
  Plane,
  Microscope,
  TrendingUp,
  School,
  Landmark,
  Award,
  Building
};

// Bengali numeral converter
const toBn = (n: number | string) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);

export interface CategoryItem {
  id: string;
  name_bn: string;
  name_en: string;
  slug: string;
  description_bn: string;
  parent_id?: string | null;
  icon?: string;
  count: number;
}

interface Props {
  rootCategories: CategoryItem[];
  subCategories: CategoryItem[];
  totalJobs: number;
  baseRoute?: string;
}

export default function CategoriesDirectoryClient({
  rootCategories,
  subCategories,
  totalJobs,
  baseRoute = '/categories'
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'roots' | 'subs'>('all');

  // Subcategory mapping by parent
  const subcategoriesByParent = useMemo(() => {
    const map: Record<string, CategoryItem[]> = {};
    for (const sub of subCategories) {
      if (sub.parent_id) {
        if (!map[sub.parent_id]) map[sub.parent_id] = [];
        map[sub.parent_id].push(sub);
      }
    }
    return map;
  }, [subCategories]);

  // Parent name lookup
  const parentNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const root of rootCategories) {
      map[root.id] = root.name_bn;
    }
    return map;
  }, [rootCategories]);

  // Filtered Roots
  const filteredRoots = useMemo(() => {
    if (!searchQuery.trim()) return rootCategories;
    const q = searchQuery.toLowerCase().trim();
    return rootCategories.filter(c => 
      c.name_bn.toLowerCase().includes(q) ||
      c.name_en.toLowerCase().includes(q) ||
      (c.description_bn && c.description_bn.toLowerCase().includes(q))
    );
  }, [rootCategories, searchQuery]);

  // Filtered Subs
  const filteredSubs = useMemo(() => {
    if (!searchQuery.trim()) return subCategories;
    const q = searchQuery.toLowerCase().trim();
    return subCategories.filter(s => 
      s.name_bn.toLowerCase().includes(q) ||
      s.name_en.toLowerCase().includes(q) ||
      (parentNameMap[s.parent_id || ''] && parentNameMap[s.parent_id || ''].toLowerCase().includes(q))
    );
  }, [subCategories, searchQuery, parentNameMap]);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              সেন্ট্রাল ট্যাক্সোনমি ও ডিরেক্টরি
            </span>
            <span className="bg-white/10 text-emerald-300 border border-white/10 text-xs font-bold px-3 py-1 rounded-full">
              {toBn(rootCategories.length)}টি মূল সেক্টর • {toBn(subCategories.length)}টি বিশেষায়িত সাব-ক্যাটাগরি
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            সকল চাকরির ক্যাটাগরি ও নিয়োগ সেক্টরসমূহ
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            বাংলাদেশের সরকারি, স্বায়ত্তশাসিত, ব্যাংক, এনজিও ও প্রাইভেট সেক্টরের সকল নিয়োগ বিজ্ঞপ্তি ক্যাটাগরি অনুযায়ী সাজানো হয়েছে। আপনার পছন্দের ক্ষেত্রে ক্লিক করে মুহূর্তের মধ্যে হালনাগাদ সার্কুলার খুঁজে নিন।
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>১০০% অফিসিয়াল গেজেট ও মন্ত্রণালয় যাচাইকৃত</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>মোট {toBn(totalJobs)}টি লাইভ সার্কুলার সংযুক্ত</span>
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Search & Filter Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ক্যাটাগরি বা পেশা খুঁজুন (যেমন: ব্যাংক, শিক্ষক, ইঞ্জিনিয়ারিং, বিসিএস, আইটি)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                title="সার্চ মুছুন"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              সকল ক্যাটাগরি ({toBn(rootCategories.length + subCategories.length)})
            </button>
            <button
              onClick={() => setActiveTab('roots')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'roots'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              মূল সেক্টরসমূহ ({toBn(rootCategories.length)})
            </button>
            <button
              onClick={() => setActiveTab('subs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'subs'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              বিশেষায়িত সাব-ক্যাটাগরি ({toBn(subCategories.length)})
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: বিশেষায়িত সাব-ক্যাটাগরি সমূহ (7 Sub-Categories) */}
      {(activeTab === 'all' || activeTab === 'subs') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>৭টি বিশেষায়িত সাব-ক্যাটাগরি</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                বিসিএস, বাংলাদেশ ব্যাংক, মন্ত্রণালয়, অধিদপ্তর ও স্বায়ত্তশাসিত খাতের বিশেষায়িত ফিল্টার
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              {toBn(filteredSubs.length)}টি উপলব্ধ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSubs.map((sub) => {
              const IconComponent = ICON_MAP[sub.icon || 'Landmark'] || Landmark;
              const parentName = parentNameMap[sub.parent_id || ''] || 'প্রধান ক্যাটাগরি';

              return (
                <Link
                  key={sub.id}
                  href={`${baseRoute}/${sub.slug}`}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 hover:border-emerald-500 hover:shadow-lg transition-all group flex flex-col justify-between space-y-3 relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {parentName}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <IconComponent className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                        {sub.name_bn}
                      </h3>
                      <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                        {sub.name_en}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 text-[11px]">
                      {toBn(sub.count)}টি সার্কুলার
                    </span>
                    <span className="text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all flex items-center gap-1 text-[11px]">
                      <span>দেখুন</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: ২০টি মূল ক্যাটাগরি গ্রিড (20 Root Categories) */}
      {(activeTab === 'all' || activeTab === 'roots') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                <span>২০টি মূল নিয়োগ সেক্টর</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                সরকারি, ব্যাংক, শিক্ষকতা, আইটি, ইঞ্জিনিয়ারিং, ডিফেন্স ও প্রাইভেট সেক্টরের মূল ডিরেক্টরি
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              {toBn(filteredRoots.length)}টি সেক্টর
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoots.map((cat) => {
              const IconComponent = ICON_MAP[cat.icon || 'Briefcase'] || Briefcase;
              const relatedSubs = subcategoriesByParent[cat.id] || [];

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-950/5 transition-all group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                        {toBn(cat.count)}টি সক্রিয় চাকরি
                      </span>
                    </div>

                    <div>
                      <Link href={`${baseRoute}/${cat.slug}`}>
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {cat.name_bn}
                        </h3>
                      </Link>
                      <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                        {cat.name_en}
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                        {cat.description_bn}
                      </p>
                    </div>

                    {/* Subcategory Pills inside parent card */}
                    {relatedSubs.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                          বিশেষায়িত সাব-সেক্টর ({toBn(relatedSubs.length)}টি):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {relatedSubs.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`${baseRoute}/${sub.slug}`}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-colors"
                            >
                              {sub.name_bn} ({toBn(sub.count)})
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
                    <Link
                      href={`${baseRoute}/${cat.slug}`}
                      className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-1 transition-all"
                    >
                      <span>সকল সার্কুলার দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredRoots.length === 0 && filteredSubs.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">কোনো ক্যাটাগরি বা সাব-ক্যাটাগরি খুঁজে পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              "{searchQuery}" দিয়ে কোনো ক্যাটাগরির মিল পাওয়া যায়নি। বানান সঠিকভাবে লিখে পুনরায় চেষ্টা করুন।
            </p>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            সার্চ মুছুন
          </button>
        </div>
      )}
    </div>
  );
}

