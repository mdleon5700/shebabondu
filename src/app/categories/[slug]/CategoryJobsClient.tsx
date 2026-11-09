'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  SlidersHorizontal,
  Sparkles,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { SearchResult } from '@/lib/search/types';
import JobCard from '@/components/JobCard';

interface Props {
  categorySlug: string;
  initialResult: SearchResult;
}

export default function CategoryJobsClient({ categorySlug, initialResult }: Props) {
  const [result, setResult] = useState<SearchResult>(initialResult);
  const [query, setQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [selectedEducation, setSelectedEducation] = useState('all');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const isFirstRender = useRef(true);

  const fetchFilteredJobs = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const sp = new URLSearchParams();
      sp.set('category', categorySlug);
      if (query.trim()) sp.set('q', query.trim());
      if (selectedDivision !== 'all') sp.set('division', selectedDivision);
      if (selectedEducation !== 'all') sp.set('education', selectedEducation);
      if (selectedJobType !== 'all') sp.set('jobType', selectedJobType);
      if (selectedStatus !== 'all') sp.set('status', selectedStatus);
      if (sortBy) sp.set('sort', sortBy);
      sp.set('page', String(pageNum));
      sp.set('limit', '12');

      const res = await fetch(`/api/jobs/search?${sp.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setResult(data);
        }
      }
    } catch (err) {
      console.error('Failed to search jobs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [categorySlug, query, selectedDivision, selectedEducation, selectedJobType, selectedStatus, sortBy]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
    const debounceTimer = setTimeout(() => {
      fetchFilteredJobs(1);
    }, 250);
    return () => clearTimeout(debounceTimer);
  }, [query, selectedDivision, selectedEducation, selectedJobType, selectedStatus, sortBy, fetchFilteredJobs]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchFilteredJobs(newPage);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setQuery('');
    setSelectedDivision('all');
    setSelectedEducation('all');
    setSelectedJobType('all');
    setSelectedStatus('all');
    setSortBy('latest');
    setPage(1);
  };

  const activeFilterCount = [
    selectedDivision !== 'all',
    selectedEducation !== 'all',
    selectedJobType !== 'all',
    selectedStatus !== 'all',
    query.trim().length > 0
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Top Search Bar & Sort Row */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="পদবী, প্রতিষ্ঠান বা শিক্ষাগত যোগ্যতা দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl border border-slate-200"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>ফিল্টার ({activeFilterCount})</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">সর্ট করুন:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="latest">সর্বশেষ প্রকাশিত</option>
              <option value="deadline_soon">আবেদনের শেষ সময় (নিকটবর্তী)</option>
              <option value="relevance">সর্বাধিক প্রাসঙ্গিক</option>
              <option value="org_asc">প্রতিষ্ঠান (A to Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Job Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Filter Sidebar */}
        <aside className={`${showMobileFilters ? 'block' : 'hidden'} lg:block space-y-5 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm h-fit`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">ফিল্টার সমূহ</h2>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>রিসেট</span>
              </button>
            )}
          </div>

          {/* Division Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">বিভাগ / লোকেশন</label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">সকল বিভাগ (All Divisions)</option>
              {result.facets.divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name_bn} ({d.count})
                </option>
              ))}
            </select>
          </div>

          {/* Education Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">শিক্ষাগত যোগ্যতা</label>
            <select
              value={selectedEducation}
              onChange={(e) => setSelectedEducation(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">সকল শিক্ষাগত যোগ্যতা</option>
              {result.facets.educationLevels.map((edu) => (
                <option key={edu.id} value={edu.id}>
                  {edu.name_bn} ({edu.count})
                </option>
              ))}
            </select>
          </div>

          {/* Job Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">চাকরির ধরন</label>
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">সকল ধরন</option>
              {result.facets.jobTypes.map((jt) => (
                <option key={jt.id} value={jt.id}>
                  {jt.name_bn} ({jt.count})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">আবেদনের অবস্থা</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">সকল অবস্থা</option>
              <option value="open">আবেদন চলছে (Open)</option>
              <option value="closing_soon">আবেদনের শেষ সময় সমাগত</option>
              <option value="closed">আবেদন সম্পন্ন (Closed)</option>
            </select>
          </div>
        </aside>

        {/* Right Job Cards Column */}
        <div className="lg:col-span-3 space-y-5">
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-100/70 px-4 py-2.5 rounded-xl border border-slate-200/60">
            <span>
              মোট <strong className="text-emerald-700">{result.total}</strong>টি চাকরি পাওয়া গেছে
              {result.totalPages > 1 && ` (পৃষ্ঠা ${page} / ${result.totalPages})`}
            </span>
            {isLoading && (
              <span className="text-emerald-600 flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>লোড হচ্ছে...</span>
              </span>
            )}
          </div>

          {/* Empty State */}
          {result.jobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-10 sm:p-12 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {activeFilterCount > 0 ? 'ফিল্টারের সাথে মিলে এমন সার্কুলার পাওয়া যায়নি' : 'এই মুহূর্তে কোনো সক্রিয় বিজ্ঞপ্তি নেই'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                {activeFilterCount > 0
                  ? 'আপনার নির্বাচিত ফিল্টারের মান পরিবর্তন করুন অথবা ফিল্টার রিসেট করে এই ক্যাটাগরির সকল সার্কুলার দেখুন।'
                  : 'এই ক্যাটাগরিতে নতুন কোনো সরকারি বা বেসরকারি নিয়োগ বিজ্ঞপ্তি প্রকাশ হওয়া মাত্রই স্বয়ংক্রিয়ভাবে এখানে যুক্ত করা হবে। অন্যান্য জনপ্রিয় ক্যাটাগরি বা কেন্দ্রীয় চাকরির তালিকা ঘুরে দেখতে পারেন।'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {activeFilterCount > 0 ? (
                  <button
                    onClick={handleResetFilters}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-colors"
                  >
                    ফিল্টার রিসেট করুন
                  </button>
                ) : (
                  <>
                    <Link
                      href="/categories"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
                    >
                      সকল ক্যাটাগরি
                    </Link>
                    <Link
                      href="/jobs"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>সকল চাকরির ডিরেক্টরি</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {result.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: result.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === result.totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && p - arr[idx - 1] > 1 && (
                      <span className="px-2 text-slate-400 text-xs">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 text-xs font-bold rounded-xl transition-colors ${
                        page === p
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= result.totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
