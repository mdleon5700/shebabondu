'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Calendar,
  Sparkles,
  Flame,
  AlertCircle,
  Clock,
  Layers,
  Building2,
  GraduationCap
} from 'lucide-react';
import { FeedType, FeedResult } from '@/lib/feeds/types';
import JobCard from '@/components/JobCard';

// Bengali numeral converter
const toBn = (n: number | string) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);

interface Props {
  feedType: FeedType;
  title: string;
  subtitle: string;
  date?: string;
  dateBn?: string;
  initialResult: FeedResult;
  categories: { id: string; name_bn: string; slug: string }[];
  navigation?: {
    prevDate?: string;
    prevDateBn?: string;
    nextDate?: string;
    nextDateBn?: string;
  };
}

export default function JobFeedClient({
  feedType,
  title,
  subtitle,
  date,
  dateBn,
  initialResult,
  categories,
  navigation
}: Props) {
  const [result, setResult] = useState<FeedResult>(initialResult);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [selectedEducation, setSelectedEducation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState(feedType === 'closing_soon' ? 'deadline_soon' : (feedType === 'featured' ? 'priority' : 'latest'));
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchFilteredJobs = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const sp = new URLSearchParams();
      if (query.trim()) sp.set('q', query.trim());
      if (selectedCategory !== 'all') sp.set('category', selectedCategory);
      if (selectedDivision !== 'all') sp.set('district', selectedDivision);
      if (selectedEducation !== 'all') sp.set('education', selectedEducation);
      if (selectedStatus !== 'all') sp.set('status', selectedStatus);
      if (sortBy) sp.set('sortBy', sortBy);
      sp.set('page', String(pageNum));
      sp.set('limit', '9');

      let endpoint = `/api/jobs/${feedType}`;
      if (feedType === 'daily' && date) {
        endpoint = `/api/jobs/daily/${date}`;
      }

      const res = await fetch(`${endpoint}?${sp.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          setResult(data);
          setPage(pageNum);
        }
      }
    } catch (err) {
      console.error('Failed to fetch filtered feed jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [feedType, date, query, selectedCategory, selectedDivision, selectedEducation, selectedStatus, sortBy]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFilteredJobs(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchFilteredJobs]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedDivision('all');
    setSelectedEducation('all');
    setSelectedStatus('all');
    setSortBy(feedType === 'closing_soon' ? 'deadline_soon' : (feedType === 'featured' ? 'priority' : 'latest'));
    setPage(1);
  };

  const hasActiveFilters = query || selectedCategory !== 'all' || selectedDivision !== 'all' || selectedEducation !== 'all' || selectedStatus !== 'all';

  return (
    <div className="space-y-6">
      {/* Feed Page Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[13px] font-bold px-3 py-1 rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{toBn(result.total)}টি বিজ্ঞপ্তি উপলব্ধ</span>
            </span>
            {dateBn && (
              <span className="inline-flex items-center gap-1 bg-white/10 text-slate-200 border border-white/20 text-[13px] font-medium px-3 py-1 rounded-full">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>{dateBn}</span>
              </span>
            )}
            {feedType === 'closing_soon' && (
              <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[13px] font-bold px-3 py-1 rounded-full">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>শীঘ্রই শেষ</span>
              </span>
            )}
            {feedType === 'featured' && (
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[13px] font-bold px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>বিশেষ সার্কুলার</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-slate-300 text-[15px] sm:text-[16px] mt-2.5 leading-relaxed max-w-3xl">
            {subtitle}
          </p>

          {/* Calendar Day Navigator if daily archive */}
          {navigation && (
            <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-white/10">
              {navigation.prevDate && (
                <Link
                  href={`/daily-jobs/${navigation.prevDate}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-sm font-semibold transition-all border border-white/15"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>পূর্ববর্তী দিন ({navigation.prevDateBn})</span>
                </Link>
              )}
              {navigation.nextDate && (
                <Link
                  href={`/daily-jobs/${navigation.nextDate}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-sm font-semibold transition-all border border-white/15"
                >
                  <span>পরবর্তী দিন ({navigation.nextDateBn})</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
              <Link
                href="/daily-jobs"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-sm font-semibold transition-all ml-auto"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>সকল আর্কাইভ ক্যালেন্ডার</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout: Filter Sidebar + Job Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block space-y-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs h-fit sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-700" />
              <span>ফিল্টার ও বাছাইকরণ</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>রিসেট</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">সার্চ কিওয়ার্ড</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="পদ বা প্রতিষ্ঠান খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">ক্যাটাগরি</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              <option value="all">সকল ক্যাটাগরি</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug || c.id}>{c.name_bn}</option>
              ))}
            </select>
          </div>

          {/* Education Level */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">শিক্ষাগত যোগ্যতা</label>
            <select
              value={selectedEducation}
              onChange={(e) => setSelectedEducation(e.target.value)}
              className="w-full p-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              <option value="all">সকল শিক্ষাগত যোগ্যতা</option>
              <option value="এসএসসি">এসএসসি / সমমান</option>
              <option value="এইচএসসি">এইচএসসি / সমমান</option>
              <option value="স্নাতক">স্নাতক / ডিগ্রি / অনার্স</option>
              <option value="স্নাতকোত্তর">স্নাতকোত্তর / মাস্টার্স</option>
              <option value="ডিপ্লোমা">ডিপ্লোমা ইঞ্জিনিয়ারিং</option>
            </select>
          </div>

          {/* Division Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">বিভাগ / অঞ্চল</label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full p-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              <option value="all">সমগ্র বাংলাদেশ</option>
              <option value="ঢাকা">ঢাকা বিভাগ</option>
              <option value="চট্টগ্রাম">চট্টগ্রাম বিভাগ</option>
              <option value="রাজশাহী">রাজশাহী বিভাগ</option>
              <option value="খুলনা">খুলনা বিভাগ</option>
              <option value="বরিশাল">বরিশাল বিভাগ</option>
              <option value="সিলেট">সিলেট বিভাগ</option>
              <option value="রংপুর">রংপুর বিভাগ</option>
              <option value="ময়মনসিংহ">ময়মনসিংহ বিভাগ</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">সাজানোর ক্রম</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              <option value="latest">নতুন প্রকাশিত আগে</option>
              <option value="deadline_soon">আবেদন শেষ হবে শীঘ্রই</option>
              <option value="deadline_later">সর্বোচ্চ সময় বাকি আগে</option>
              <option value="oldest">পুরাতন বিজ্ঞপ্তি আগে</option>
              {feedType === 'featured' && <option value="priority">অগ্রাধিকার ক্রম (Priority)</option>}
            </select>
          </div>
        </div>

        {/* Job Listing Grid & Controls */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Bar for Results & Mobile Filter Trigger */}
          <div className="flex items-center justify-between bg-white rounded-xl p-3 sm:p-4 border border-slate-200/80 shadow-xs">
            <div className="text-sm text-slate-700 font-medium">
              <span>মোট </span>
              <span className="font-bold text-emerald-800">{toBn(result.total)}</span>
              <span>টি সার্কুলার পাওয়া গেছে</span>
              {isLoading && <span className="ml-2 text-xs text-slate-400">লোড হচ্ছে...</span>}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 flex items-center gap-1"
              >
                <Filter className="w-3.5 h-3.5 text-emerald-700" />
                <span>ফিল্টার</span>
              </button>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {showMobileFilters && (
            <div className="lg:hidden bg-white rounded-xl p-4 border border-slate-200 space-y-3 shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-800">ফিল্টার অপশন</span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  বন্ধ করুন
                </button>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="পদ বা প্রতিষ্ঠান খুঁজুন..."
                className="w-full p-2 text-sm border border-slate-200 rounded-lg"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg"
              >
                <option value="all">সকল ক্যাটাগরি</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug || c.id}>{c.name_bn}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg"
              >
                <option value="latest">নতুন প্রকাশিত আগে</option>
                <option value="deadline_soon">আবেদন শেষ হবে শীঘ্রই</option>
              </select>
            </div>
          )}

          {/* Job Cards Grid */}
          {result.jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">কোনো সার্কুলার পাওয়া যায়নি</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                আপনার নির্বাচিত ফিল্টার বা শর্তানুযায়ী কোনো সক্রিয় চাকরির বিজ্ঞপ্তি খুঁজে পাওয়া যায়নি। অন্য ফিল্টার বেছে নিন বা রিসেট করুন।
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ফিল্টার রিসেট করুন</span>
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1 || isLoading}
                onClick={() => fetchFilteredJobs(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>পূর্ববর্তী</span>
              </button>
              <span className="text-sm text-slate-600 px-3 py-1.5 font-medium">
                পৃষ্ঠা {toBn(page)} / {toBn(result.totalPages)}
              </span>
              <button
                disabled={page >= result.totalPages || isLoading}
                onClick={() => fetchFilteredJobs(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center gap-1"
              >
                <span>পরবর্তী</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
