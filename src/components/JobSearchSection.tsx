'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Briefcase, 
  GraduationCap, 
  Flame, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Building2, 
  Banknote, 
  Award,
  RotateCcw
} from 'lucide-react';

interface JobSearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedJobType: string;
  setSelectedJobType: (type: string) => void;
  selectedEducation: string;
  setSelectedEducation: (edu: string) => void;
  selectedOrg: string;
  setSelectedOrg: (org: string) => void;
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  selectedSalary: string;
  setSelectedSalary: (salary: string) => void;
  onSearch: () => void;
  onReset: () => void;
  activeFilterCount: number;
}

export default function JobSearchSection({
  searchQuery,
  setSearchQuery,
  selectedJobType,
  setSelectedJobType,
  selectedEducation,
  setSelectedEducation,
  selectedOrg,
  setSelectedOrg,
  selectedGrade,
  setSelectedGrade,
  selectedSalary,
  setSelectedSalary,
  onSearch,
  onReset,
  activeFilterCount
}: JobSearchSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const chipsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (chipsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = chipsScrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    // Double check after fonts and styles render
    const timer = setTimeout(checkScroll, 200);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const scrollChips = (direction: 'left' | 'right') => {
    if (chipsScrollRef.current) {
      const scrollAmount = 240;
      chipsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 320);
    }
  };

  const popularSearches = [
    { label: 'সরকারি চাকরি', type: 'govt', keyword: '' },
    { label: 'ব্যাংক চাকরি', type: 'bank', keyword: '' },
    { label: 'শিক্ষক নিয়োগ', type: 'teacher', keyword: '' },
    { label: 'এনজিও চাকরি', type: 'ngo', keyword: '' },
    { label: 'বেসরকারি চাকরি', type: 'private', keyword: '' },
    { label: 'টিউশনি চাকরি', type: 'all', keyword: 'টিউশনি' },
    { label: 'মেডিকেল চাকরি', type: 'all', keyword: 'মেডিকেল' },
    { label: 'আইটি চাকরি', type: 'all', keyword: 'আইটি' },
  ];

  const handleChipClick = (chip: { label: string; type: string; keyword: string }) => {
    if (chip.type !== 'all') {
      setSelectedJobType(chip.type);
      setSearchQuery('');
    } else if (chip.keyword) {
      setSearchQuery(chip.keyword);
      setSelectedJobType('all');
    } else {
      setSearchQuery(chip.label);
    }
    onSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <section className="bg-[#f4fbf7] border-b border-emerald-900/10 py-3.5 sm:py-6 lg:py-8 px-3.5 sm:px-6 lg:px-8 relative z-20">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-emerald-100 shadow-xl shadow-slate-900/5 p-4 sm:p-6 lg:p-7 space-y-4">
          
          {/* First Row: Search Inputs & Action Button */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            
            {/* 1. Job title / Keyword input (widest field) */}
            <div className="md:col-span-5">
              <label htmlFor="search-keyword" className="block text-[16px] font-bold text-slate-700 mb-1.5 font-hind">
                পদের নাম বা কীওয়ার্ড
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="search-keyword"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="পদের নাম, প্রতিষ্ঠানের নাম বা কীওয়ার্ড লিখুন..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-[16px] font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all bg-slate-50/50 hover:bg-white"
                />
              </div>
            </div>

            {/* 2. Job Type dropdown */}
            <div className="md:col-span-3">
              <label htmlFor="job-type-select" className="block text-[16px] font-bold text-slate-700 mb-1.5 font-hind">
                চাকরির ধরন
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
                <select
                  id="job-type-select"
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                  className="w-full pl-10 pr-9 py-3 rounded-xl border border-slate-200 text-[16px] font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all bg-slate-50/50 hover:bg-white appearance-none cursor-pointer"
                >
                  <option value="all">সব ধরনের চাকরি</option>
                  <option value="govt">🏛️ সরকারি চাকরি</option>
                  <option value="bank">💼 ব্যাংক চাকরি</option>
                  <option value="teacher">🎒 শিক্ষক নিয়োগ</option>
                  <option value="railway">🚆 রেলওয়ে চাকরি</option>
                  <option value="ngo">🤝 এনজিও চাকরি</option>
                  <option value="private">🏢 বেসরকারি চাকরি</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 3. Education Qualification dropdown */}
            <div className="md:col-span-2">
              <label htmlFor="education-select" className="block text-[16px] font-bold text-slate-700 mb-1.5 font-hind">
                শিক্ষাগত যোগ্যতা
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 pointer-events-none" />
                <select
                  id="education-select"
                  value={selectedEducation}
                  onChange={(e) => setSelectedEducation(e.target.value)}
                  className="w-full pl-10 pr-9 py-3 rounded-xl border border-slate-200 text-[16px] font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all bg-slate-50/50 hover:bg-white appearance-none cursor-pointer"
                >
                  <option value="all">সব যোগ্যতা</option>
                  <option value="hsc">এইচএসসি (HSC)</option>
                  <option value="graduate">স্নাতক (ডিগ্রি/অনার্স)</option>
                  <option value="postgraduate">মাস্টার্স (স্নাতকোত্তর)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* 4. Primary Search Button */}
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={onSearch}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.98] text-white font-bold text-[17px] shadow-md shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all font-hind cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>চাকরি খুঁজুন</span>
              </button>
            </div>

          </div>

          {/* Second Row: Popular Searches (Single Line, Never Wraps, With Arrows) */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
            
            <div className="inline-flex items-center gap-1.5 text-[16px] font-bold text-slate-700 flex-shrink-0 font-hind">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="hidden sm:inline">জনপ্রিয় অনুসন্ধান:</span>
              <span className="sm:hidden">জনপ্রিয়:</span>
            </div>

            {/* Scroll Container with Left/Right Arrow Buttons */}
            <div className="relative flex items-center min-w-0 flex-1 overflow-hidden">
              {/* Left Arrow Button */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollChips('left')}
                  aria-label="পূর্ববর্তী চিপস দেখুন"
                  className="absolute left-0 z-10 w-7 h-7 rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Chips Track (Never Wraps, Full Width Horizontal Scroll) */}
              <div 
                ref={chipsScrollRef}
                onScroll={checkScroll}
                className="flex items-center gap-2 overflow-x-auto scrollbar-none whitespace-nowrap scroll-smooth px-1 py-1"
              >
                {popularSearches.map((chip, idx) => {
                  const isActive = (chip.type !== 'all' && selectedJobType === chip.type) || 
                                   (chip.keyword && searchQuery === chip.keyword);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChipClick(chip)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[15px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-emerald-600 text-white font-bold shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200/80'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              {/* Right Arrow Button */}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollChips('right')}
                  aria-label="পরবর্তী চিপস দেখুন"
                  className="absolute right-0 z-10 w-7 h-7 rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
